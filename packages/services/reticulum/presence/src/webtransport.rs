//! WebTransport HTTP/3 client implementation
//!
//! Provides bidirectional streams over HTTP/3 with WebTransport API

use reticulum_core::Result;
use std::sync::Arc;
use tokio::sync::mpsc;
use tokio::task::JoinHandle;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use wtransport::{Client, ServerConfig, Session};

/// WebTransport connection info
#[derive(Clone)]
pub struct WebTransportConnection {
    pub session_id: String,
    pub client_id: String,
    pub user_id: String,
    pub room_id: String,
    pub connected_at: chrono::DateTime<chrono::Utc>,
    pub remote_address: String,
}

/// WebTransport stream types
pub enum WebTransportStreamType {
    Unidirectional,
    Bidirectional,
}

impl WebTransportConnection {
    /// Create a new WebTransport connection
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

    /// Get connection age
    pub fn age(&self) -> chrono::Duration {
        self.connected_at.signed_duration_since(chrono::Utc::now())
    }
}

/// WebTransport session manager
pub struct WebTransportManager {
    sessions: Arc<tokio::sync::RwLock<HashMap<String, WebTransportConnection>>>,
    config: ServerConfig,
}

impl WebTransportManager {
    /// Create a new WebTransport manager
    pub fn new(config: ServerConfig) -> Self {
        Self {
            sessions: Arc::new(tokio::sync::RwLock::new(HashMap::new())),
            config,
        }
    }

    /// Accept a new WebTransport connection
    pub async fn accept_connection(
        &self,
        session: Session,
        client_id: String,
        user_id: String,
        room_id: String,
    ) -> Result<String> {
        let session_id = Uuid::new_v4().to_string();

        let connection = WebTransportConnection::new(
            session_id.clone(),
            client_id.clone(),
            user_id.clone(),
            room_id.clone(),
            session.remote_addr().to_string(),
        );

        let mut sessions = self.sessions.write().await;
        sessions.insert(session_id.clone(), connection);

        log::info!(
            "WebTransport connection accepted: {} from {} to room {}",
            session_id,
            client_id,
            room_id
        );

        Ok(session_id)
    }

    /// Get a connection by session ID
    pub async fn get_connection(&self, session_id: &str) -> Option<WebTransportConnection> {
        let sessions = self.sessions.read().await;
        sessions.get(session_id).cloned()
    }

    /// Remove a connection
    pub async fn remove_connection(&self, session_id: &str) -> Option<WebTransportConnection> {
        let mut sessions = self.sessions.write().await;
        sessions.remove(session_id)
    }

    /// Get all connections in a room
    pub async fn get_room_connections(&self, room_id: &str) -> Vec<WebTransportConnection> {
        let sessions = self.sessions.read().await;
        sessions
            .values()
            .filter(|conn| conn.room_id == room_id)
            .cloned()
            .collect()
    }

    /// Get all sessions
    pub async fn get_all_sessions(&self) -> Vec<WebTransportConnection> {
        let sessions = self.sessions.read().await;
        sessions.values().cloned().collect()
    }

    /// Get session count
    pub async fn session_count(&self) -> usize {
        let sessions = self.sessions.read().await;
        sessions.len()
    }

    /// Send data to a specific session
    pub async fn send_to_session(
        &self,
        session_id: &str,
        data: &[u8],
        stream_id: Option<u64>,
    ) -> Result<()> {
        let sessions = self.sessions.read().await;
        if let Some(conn) = sessions.get(session_id) {
            // In a real implementation, this would use the actual WebTransport API
            // to send data over the session's bidirectional streams
            log::debug!(
                "Sending {} bytes to WebTransport session {} (stream: {:?})",
                data.len(),
                session_id,
                stream_id
            );
            Ok(())
        } else {
            Err(eyre::eyre!("Session not found: {}", session_id))
        }
    }

    /// Broadcast data to all sessions in a room
    pub async fn broadcast_to_room(
        &self,
        room_id: &str,
        data: &[u8],
        exclude_session: Option<String>,
    ) -> Result<usize> {
        let sessions = self.sessions.read().await;
        let room_sessions: Vec<_> = sessions
            .values()
            .filter(|conn| conn.room_id == room_id)
            .filter(|conn| {
                exclude_session.as_ref().map_or(true, |excl| excl != &conn.session_id)
            })
            .collect();

        let count = room_sessions.len();

        for conn in room_sessions {
            // Send to each session
            if let Err(e) = self.send_to_session(&conn.session_id, data, None).await {
                log::error!("Failed to send to session {}: {}", conn.session_id, e);
            }
        }

        log::debug!(
            "Broadcasted {} bytes to {} sessions in room {}",
            data.len(),
            count,
            room_id
        );

        Ok(count)
    }

    /// Create bidirectional stream for data exchange
    pub async fn create_bidirectional_stream(
        &self,
        session_id: &str,
    ) -> Result<u64> {
        // In real implementation, this would use the WebTransport API
        // to create a bidirectional stream
        let stream_id: u64 = 1; // Default stream ID

        log::info!(
            "Created bidirectional stream {} for WebTransport session {}",
            stream_id,
            session_id
        );

        Ok(stream_id)
    }

    /// Close a session with reason
    pub async fn close_session(&self, session_id: &str, reason: &str) -> Result<()> {
        let mut sessions = self.sessions.write().await;

        if let Some(conn) = sessions.remove(session_id) {
            log::info!(
                "Closing WebTransport session {} ({}) - age: {:?}",
                session_id,
                reason,
                conn.age()
            );

            // Send close message if session supports it
            // In real implementation, this would close the actual WebTransport session

            Ok(())
        } else {
            Err(eyre::eyre!("Session not found: {}", session_id))
        }
    }

    /// Get statistics for monitoring
    pub async fn get_stats(&self) -> WebTransportStats {
        let sessions = self.sessions.read().await;

        let mut connections_by_room: std::collections::HashMap<String, usize> =
            std::collections::HashMap::new();

        for conn in sessions.values() {
            *connections_by_room.entry(conn.room_id.clone()).or_insert(0) += 1;
        }

        let total_connections = sessions.len();

        WebTransportStats {
            total_connections,
            connections_by_room,
        }
    }
}

/// WebTransport statistics
#[derive(Clone, Debug, Serialize)]
pub struct WebTransportStats {
    pub total_connections: usize,
    pub connections_by_room: std::collections::HashMap<String, usize>,
}

impl Default for WebTransportStats {
    fn default() -> Self {
        Self {
            total_connections: 0,
            connections_by_room: std::collections::HashMap::new(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_webtransport_connection_creation() {
        let config = ServerConfig::default();
        let manager = WebTransportManager::new(config);

        // Add a connection
        let session_id = Uuid::new_v4().to_string();
        let conn = WebTransportConnection::new(
            session_id.clone(),
            "client-1".to_string(),
            "user-1".to_string(),
            "room-1".to_string(),
            "127.0.0.1:1234".to_string(),
        );

        let mut sessions = manager.sessions.write().await;
        sessions.insert(session_id.clone(), conn);

        // Verify it was added
        let retrieved = manager.get_connection(&session_id).await;
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().client_id, "client-1");
    }

    #[tokio::test]
    async fn test_room_connections() {
        let config = ServerConfig::default();
        let manager = WebTransportManager::new(config);

        // Add connections to different rooms
        let room1_sessions = vec!["room1-session-1", "room1-session-2"];
        let room2_sessions = vec!["room2-session-1"];

        let mut sessions = manager.sessions.write().await;
        for (i, session_id) in room1_sessions.iter().enumerate() {
            sessions.insert(
                session_id.to_string(),
                WebTransportConnection::new(
                    session_id.to_string(),
                    format!("client-{}", i),
                    format!("user-{}", i),
                    "room-1".to_string(),
                    format!("127.0.0.1:{}", 1000 + i),
                ),
            );
        }

        for session_id in &room2_sessions {
            sessions.insert(
                session_id.to_string(),
                WebTransportConnection::new(
                    session_id.to_string(),
                    "client-10".to_string(),
                    "user-10".to_string(),
                    "room-2".to_string(),
                    "127.0.0.1:2000".to_string(),
                ),
            );
        }

        // Get room-1 connections
        let room1_conns = manager.get_room_connections("room-1").await;
        assert_eq!(room1_conns.len(), 2);

        // Get room-2 connections
        let room2_conns = manager.get_room_connections("room-2").await;
        assert_eq!(room2_conns.len(), 1);
    }
}
