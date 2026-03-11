//! WebTransport HTTP/3 server implementation using wtransport 0.6
//!
//! Provides bidirectional streams over HTTP/3 with WebTransport API
//! Based on wtransport 0.6 API (Endpoint/Connection model)

use reticulum_core::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use tokio::task::JoinHandle;
use uuid::Uuid;
use wtransport::{Connection, Endpoint, Identity, ServerConfig};

/// Wrapper for bidirectional stream
pub struct BidirectionalStream {
    pub stream_id: u64,
    pub send: wtransport::stream::SendStream,
    pub recv: wtransport::stream::RecvStream,
}

/// Session info with active WebTransport connection
pub struct SessionInfo {
    pub session_id: String,
    pub connection: Connection,
    pub webtransport_connection: WebTransportConnection,
    streams: Arc<RwLock<HashMap<u64, BidirectionalStream>>>,
    stream_tx: mpsc::Sender<(u64, Vec<u8>)>,
    _accept_handle: Option<JoinHandle<()>>,
}

impl SessionInfo {
    pub fn new(connection: Connection, webtransport_connection: WebTransportConnection) -> Self {
        let (stream_tx, _) = mpsc::channel(100);
        let session_id = Uuid::new_v4().to_string();

        let info = Self {
            session_id: session_id.clone(),
            connection,
            webtransport_connection,
            streams: Arc::new(RwLock::new(HashMap::new())),
            stream_tx,
            _accept_handle: None,
        };

        // Start accepting streams in background
        let accept_handle = tokio::spawn(Self::accept_streams_loop(
            session_id.clone(),
            info.connection.clone(),
            info.streams.clone(),
            info.stream_tx.clone(),
        ));

        let mut this = info;
        this._accept_handle = Some(accept_handle);
        this
    }

    async fn accept_streams_loop(
        session_id: String,
        connection: Connection,
        streams: Arc<RwLock<HashMap<u64, BidirectionalStream>>>,
        stream_tx: mpsc::Sender<(u64, Vec<u8>)>,
    ) {
        let mut buffer = vec![0; 65536].into_boxed_slice();

        loop {
            tokio::select! {
                stream = connection.accept_bi() => {
                    match stream {
                        Ok((send_stream, recv_stream)) => {
                            let stream_id: u64 = send_stream.id().into();

                            log::info!("Accepted BI stream {} for session {}", stream_id, session_id);

                            let mut streams_write = streams.write().await;
                            streams_write.insert(stream_id, BidirectionalStream {
                                stream_id,
                                send: send_stream,
                                recv: recv_stream,
                            });

                            let _ = stream_tx.send((stream_id, vec![])).await;
                        }
                        Err(e) => {
                            log::error!("Failed to accept BI stream for session {}: {}", session_id, e);
                            break;
                        }
                    }
                }
                _ = connection.closed() => {
                    log::info!("Connection closed for session {}", session_id);
                    break;
                }
            }
        }
    }

    pub async fn add_stream(
        &self,
        stream_id: u64,
        send: wtransport::stream::SendStream,
        recv: wtransport::stream::RecvStream,
    ) {
        let mut streams = self.streams.write().await;
        streams.insert(
            stream_id,
            BidirectionalStream {
                stream_id,
                send,
                recv,
            },
        );
    }

    pub async fn get_stream(&self, stream_id: u64) -> Option<BidirectionalStream> {
        let streams = self.streams.read().await;
        streams.get(&stream_id).cloned()
    }

    pub async fn send_on_stream(&self, stream_id: u64, data: Vec<u8>) -> Result<()> {
        let send = {
            let streams = self.streams.read().await;
            streams.get(&stream_id).map(|s| s.send.clone())
        };

        if let Some(mut send) = send {
            send.write_all(&data).await?;
            send.finish()?;
            Ok(())
        } else {
            Err(eyre::eyre!("Stream {} not found", stream_id))
        }
    }
}

/// WebTransport connection info (user-level metadata)
#[derive(Clone)]
pub struct WebTransportConnection {
    pub session_id: String,
    pub client_id: String,
    pub user_id: String,
    pub room_id: String,
    pub connected_at: chrono::DateTime<chrono::Utc>,
    pub remote_address: String,
}

impl WebTransportConnection {
    pub fn new(
        session_id: String,
        client_id: String,
        user_id: String,
        room_id: String,
        remote_address: String,
    ) -> Self {
        Self {
            session_id,
            client_id,
            user_id,
            room_id,
            connected_at: chrono::Utc::now(),
            remote_address,
        }
    }

    pub fn age(&self) -> chrono::Duration {
        self.connected_at.signed_duration_since(chrono::Utc::now())
    }
}

/// WebTransport stream types
pub enum WebTransportStreamType {
    Unidirectional,
    Bidirectional,
}

/// WebTransport session manager with full HTTP/3 server support
pub struct WebTransportManager {
    sessions: Arc<RwLock<HashMap<String, Arc<SessionInfo>>>>,
    config: ServerConfig,
    server: Arc<RwLock<Option<Endpoint>>>,
    accept_task: Arc<RwLock<Option<JoinHandle<()>>>>,
}

impl WebTransportManager {
    pub fn new(config: Option<ServerConfig>) -> Self {
        let config = config.unwrap_or_else(|| {
            ServerConfig::builder()
                .with_bind_default(4443)
                .with_identity(Identity::self_signed(["localhost"]).expect("self-signed cert"))
                .build()
        });

        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
            config,
            server: Arc::new(RwLock::new(None)),
            accept_task: Arc::new(RwLock::new(None)),
        }
    }

    pub fn config(&self) -> &ServerConfig {
        &self.config
    }

    pub async fn start_server(&self, port: u16) -> Result<()> {
        log::info!("Starting WebTransport HTTP/3 server on port {}", port);

        let server_config = ServerConfig::builder()
            .with_bind_default(port)
            .with_identity(Identity::self_signed(["localhost"]).expect("self-signed cert"))
            .build();

        let server = Endpoint::server(server_config)?;

        let server_clone = server.clone();
        let session_manager = self.sessions.clone();

        let accept_handle = tokio::spawn(async move {
            log::info!("WebTransport server accepting connections on port {}", port);

            let mut id_counter = 0u64;

            loop {
                let incoming = server_clone.accept().await;

                let connection = match incoming.await {
                    Ok(session_request) => {
                        let authority = session_request.authority();
                        let path = session_request.path();
                        log::info!(
                            "New WebTransport session: authority='{}', path='{}'",
                            authority,
                            path
                        );

                        match session_request.accept().await {
                            Ok(conn) => conn,
                            Err(e) => {
                                log::error!("Failed to accept session: {}", e);
                                continue;
                            }
                        }
                    }
                    Err(e) => {
                        log::error!("Failed to accept connection: {}", e);
                        continue;
                    }
                };

                let session_manager = session_manager.clone();
                tokio::spawn(async move {
                    let session_id = Uuid::new_v4().to_string();
                    let remote_addr = connection.remote_address().to_string();

                    log::info!("Session {} connected from {}", session_id, remote_addr);

                    let webtransport_conn = WebTransportConnection::new(
                        session_id.clone(),
                        "client".to_string(),
                        "user".to_string(),
                        "default".to_string(),
                        remote_addr,
                    );

                    let session_info = Arc::new(SessionInfo::new(connection, webtransport_conn));

                    let mut sessions = session_manager.write().await;
                    sessions.insert(session_id.clone(), session_info);

                    connection.closed().await;

                    log::info!("Session {} disconnected", session_id);
                    sessions.remove(&session_id);
                });
            }
        });

        *self.server.write().await = Some(server);
        *self.accept_task.write().await = Some(accept_handle);

        Ok(())
    }

    pub async fn stop_server(&self) -> Result<()> {
        if let Some(ref server) = *self.server.read().await {
            server.close(0, b"Server shutting down");
        }

        if let Some(handle) = self.accept_task.write().await.take() {
            handle.abort();
            log::info!("WebTransport accept task stopped");
        }

        Ok(())
    }

    pub async fn accept_connection(
        &self,
        connection: Connection,
        client_id: String,
        user_id: String,
        room_id: String,
    ) -> Result<String> {
        let session_id = Uuid::new_v4().to_string();
        let remote_addr = connection.remote_address().to_string();

        let webtransport_conn = WebTransportConnection::new(
            session_id.clone(),
            client_id.clone(),
            user_id.clone(),
            room_id.clone(),
            remote_addr,
        );

        let session_info = Arc::new(SessionInfo::new(connection, webtransport_conn));

        let mut sessions = self.sessions.write().await;
        sessions.insert(session_id.clone(), session_info);

        log::info!(
            "WebTransport connection accepted: {} from {} to room {}",
            session_id,
            client_id,
            room_id
        );

        Ok(session_id)
    }

    pub async fn get_connection(&self, session_id: &str) -> Option<Arc<SessionInfo>> {
        let sessions = self.sessions.read().await;
        sessions.get(session_id).cloned()
    }

    pub async fn remove_connection(&self, session_id: &str) -> Option<Arc<SessionInfo>> {
        let mut sessions = self.sessions.write().await;
        sessions.remove(session_id)
    }

    pub async fn get_room_connections(&self, room_id: &str) -> Vec<Arc<SessionInfo>> {
        let sessions = self.sessions.read().await;
        sessions
            .values()
            .filter(|info| info.webtransport_connection.room_id == room_id)
            .cloned()
            .collect()
    }

    pub async fn get_all_sessions(&self) -> Vec<Arc<SessionInfo>> {
        let sessions = self.sessions.read().await;
        sessions.values().cloned().collect()
    }

    pub async fn session_count(&self) -> usize {
        let sessions = self.sessions.read().await;
        sessions.len()
    }

    pub async fn send_to_session(
        &self,
        session_id: &str,
        data: &[u8],
        stream_id: Option<u64>,
    ) -> Result<()> {
        let sessions = self.sessions.read().await;
        if let Some(conn) = sessions.get(session_id) {
            if let Some(sid) = stream_id {
                conn.send_on_stream(sid, data.to_vec()).await?;
            }
            Ok(())
        } else {
            Err(eyre::eyre!("Session not found: {}", session_id))
        }
    }

    pub async fn create_bidirectional_stream(&self, session_id: &str) -> Result<u64> {
        let sessions = self.sessions.read().await;
        let session_info = sessions
            .get(session_id)
            .ok_or_else(|| eyre::eyre!("Session not found: {}", session_id))?;

        drop(sessions);

        let (send, recv) = session_info.connection.open_bi().await?;
        let stream_id: u64 = send.id().into();

        session_info.add_stream(stream_id, send, recv).await;

        log::info!(
            "Created bidirectional stream {} for WebTransport session {}",
            stream_id,
            session_id
        );

        Ok(stream_id)
    }

    pub async fn close_session(&self, session_id: &str, reason: &str) -> Result<()> {
        let session_info = self.remove_connection(session_id).await;

        if let Some(info) = session_info {
            log::info!(
                "Closing WebTransport session {} ({}) - age: {:?}",
                session_id,
                reason,
                info.webtransport_connection.age()
            );
            info.connection.close(0, reason.as_bytes());
            Ok(())
        } else {
            Err(eyre::eyre!("Session not found: {}", session_id))
        }
    }

    pub async fn get_stats(&self) -> WebTransportStats {
        let sessions = self.sessions.read().await;

        let mut connections_by_room: HashMap<String, usize> = HashMap::new();

        for info in sessions.values() {
            *connections_by_room
                .entry(info.webtransport_connection.room_id.clone())
                .or_insert(0) += 1;
        }

        WebTransportStats {
            total_connections: sessions.len(),
            connections_by_room,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WebTransportStats {
    pub total_connections: usize,
    pub connections_by_room: HashMap<String, usize>,
}

impl Default for WebTransportStats {
    fn default() -> Self {
        Self {
            total_connections: 0,
            connections_by_room: HashMap::new(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_webtransport_manager_creation() {
        let config = ServerConfig::builder()
            .with_bind_default(4443)
            .with_identity(Identity::self_signed(["localhost"]).unwrap())
            .build();
        let manager = WebTransportManager::new(Some(config));
        assert_eq!(manager.session_count().await, 0);
    }

    #[tokio::test]
    async fn test_webtransport_manager_session_count() {
        let config = ServerConfig::builder()
            .with_bind_default(4443)
            .with_identity(Identity::self_signed(["localhost"]).unwrap())
            .build();
        let manager = WebTransportManager::new(Some(config));
        assert_eq!(manager.session_count().await, 0);
    }
}
