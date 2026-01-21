//! WebSocket handler for real-time communication

use actix_web::{web, HttpRequest, HttpResponse};
use actix_ws::Message;
use futures::StreamExt;
use reticulum_core::Result;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use uuid::Uuid;

/// WebSocket message types
#[derive(Clone, Debug)]
pub enum WsMessage {
    Text(String),
    Binary(Vec<u8>),
    Close,
}

/// WebSocket connection info
#[derive(Clone)]
pub struct WebSocketConnection {
    pub id: String,
    pub room_id: Option<String>,
    pub connected_at: chrono::DateTime<chrono::Utc>,
    pub user_id: Option<String>,
    pub client_id: Option<String>,
}

/// WebSocket connection manager
#[derive(Clone)]
pub struct WebSocketManager {
    connections: Arc<RwLock<HashMap<String, mpsc::UnboundedSender<WsMessage>>>>,
    connection_info: Arc<RwLock<HashMap<String, WebSocketConnection>>>,
    room_connections: Arc<RwLock<HashMap<String, Vec<String>>>>,
}

impl WebSocketManager {
    pub fn new() -> Self {
        Self {
            connections: Arc::new(RwLock::new(HashMap::new())),
            connection_info: Arc::new(RwLock::new(HashMap::new())),
            room_connections: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Add a new connection
    pub async fn add_connection(
        &self,
        conn_id: String,
        room_id: Option<String>,
        user_id: Option<String>,
        client_id: Option<String>,
    ) -> mpsc::UnboundedReceiver<WsMessage> {
        let (tx, rx) = mpsc::unbounded_channel();

        // Store sender
        let mut connections = self.connections.write().await;
        connections.insert(conn_id.clone(), tx);

        // Store connection info
        let mut connection_info = self.connection_info.write().await;
        connection_info.insert(
            conn_id.clone(),
            WebSocketConnection {
                id: conn_id.clone(),
                room_id: room_id.clone(),
                connected_at: chrono::Utc::now(),
                user_id,
                client_id,
            },
        );

        // Add to room if applicable
        if let Some(room_id) = room_id {
            let mut room_connections = self.room_connections.write().await;
            room_connections
                .entry(room_id.clone())
                .or_insert_with(Vec::new)
                .push(conn_id.clone());
        }

        rx
    }

    /// Remove a connection
    pub async fn remove_connection(&self, conn_id: &str) -> Option<WebSocketConnection> {
        let mut connections = self.connections.write().await;
        connections.remove(conn_id);

        // Remove from room
        let mut connection_info = self.connection_info.write().await;
        if let Some(conn) = connection_info.remove(conn_id) {
            // Remove from room
            if let Some(room_id) = &conn.room_id {
                let mut room_connections = self.room_connections.write().await;
                if let Some(conns) = room_connections.get_mut(room_id) {
                    conns.retain(|id| id != conn_id);
                    if conns.is_empty() {
                        room_connections.remove(room_id);
                    }
                }
            }
        }
        Some(conn)
        else {
            None
        }
    }

/// WebSocket connection info
#[derive(Clone)]
pub struct WebSocketConnection {
    pub id: String,
    pub room_id: Option<String>,
    pub connected_at: chrono::DateTime<chrono::Utc>,
    pub user_id: Option<String>,
    pub client_id: Option<String>,
}

/// WebSocket connection manager
#[derive(Clone)]
pub struct WebSocketManager {
    connections: Arc<RwLock<HashMap<String, mpsc::UnboundedSender<WsMessage>>>>,
    connection_info: Arc<RwLock<HashMap<String, WebSocketConnection>>>,
    room_connections: Arc<RwLock<HashMap<String, Vec<String>>>>,
    // Production-ready features - temporarily disabled
    // rate_limiter: Arc<MetricRateLimiter>,
    // metrics: Arc<PerformanceMonitor>,
    // message_queue: Arc<MessageQueue>,
}

impl WebSocketManager {
    pub fn new() -> Self {
        Self {
            connections: Arc::new(RwLock::new(HashMap::new())),
            connection_info: Arc::new(RwLock::new(HashMap::new())),
            room_connections: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    // Production methods - temporarily disabled
    /*
    /// Get rate limiter
    pub fn rate_limiter(&self) -> &Arc<MetricRateLimiter> {
        &self.rate_limiter
    }

    /// Get metrics collector
    pub fn metrics(&self) -> &Arc<PerformanceMonitor> {
        &self.metrics
    }

    /// Get message queue
    pub fn message_queue(&self) -> &Arc<MessageQueue> {
        &self.message_queue
    }
    */

    /// Add a new connection
    pub async fn add_connection(
        &self,
        conn_id: String,
        room_id: Option<String>,
        user_id: Option<String>,
        client_id: Option<String>,
    ) -> mpsc::UnboundedReceiver<WsMessage> {
        // Production metrics - temporarily disabled
        // self.metrics().metrics().record_connection().await;
        // if let Some(ref room) = room_id {
        //     self.metrics().room_metrics().init_room(room.clone()).await;
        //     self.metrics().room_metrics().record_connection(room).await;
        // }

        let (tx, rx) = mpsc::unbounded_channel();

        // Store sender
        let mut connections = self.connections.write().await;
        connections.insert(conn_id.clone(), tx);

        // Store connection info
        let mut connection_info = self.connection_info.write().await;
        connection_info.insert(
            conn_id.clone(),
            WebSocketConnection {
                id: conn_id.clone(),
                room_id: room_id.clone(),
                connected_at: chrono::Utc::now(),
                user_id,
                client_id,
            },
        );

         // Add to room if applicable
        if let Some(room_id) = room_id {
            let mut room_connections = self.room_connections.write().await;
            room_connections
                .entry(room_id.clone())
                .or_insert_with(Vec::new)
                .push(conn_id.clone());
        }

        rx
        }

        rx
    }

    /// Remove a connection
    pub async fn remove_connection(&self, conn_id: &str) -> Option<WebSocketConnection> {
        let mut connections = self.connections.write().await;
        connections.remove(conn_id);

        // Production cleanup
        // self.rate_limiter().remove(conn_id).await;
        // self.message_queue().remove_queue(conn_id).await;

        let mut connection_info = self.connection_info.write().await;
        if let Some(conn) = connection_info.remove(conn_id) {
            // Record metrics - temporarily disabled
            // self.metrics().metrics().record_disconnection().await;

            // Remove from room
            if let Some(room_id) = &conn.room_id {
                // self.metrics().room_metrics().record_disconnection(room_id).await;

                let mut room_connections = self.room_connections.write().await;
                if let Some(conns) = room_connections.get_mut(room_id) {
                    conns.retain(|id| id != conn_id);
                    if conns.is_empty() {
                        room_connections.remove(room_id);
                        // self.metrics().room_metrics().remove_room(room_id).await;
                    }
                }
            }
            Some(conn)
        } else {
            None
        }
    }

    /// Get all connections in a room
    pub async fn get_room_connections(&self, room_id: &str) -> Vec<String> {
        let room_connections = self.room_connections.read().await;
        room_connections.get(room_id).cloned().unwrap_or_default()
    }

    /// Get connection info by ID
    pub async fn get_connection_info(&self, conn_id: &str) -> Option<WebSocketConnection> {
        let connection_info = self.connection_info.read().await;
        connection_info.get(conn_id).cloned()
    }

    /// Broadcast message to all connections in a room except sender
    pub async fn broadcast_to_room(&self, room_id: &str, message: &[u8], exclude: Option<&str>) {
        let conn_ids = self.get_room_connections(room_id).await;
        let connections = self.connections.read().await;

        let mut sent_count = 0;
        for conn_id in conn_ids {
            // Skip excluded connection
            if let Some(exclude_id) = exclude {
                if conn_id == exclude_id {
                    continue;
                }
            }

            if let Some(tx) = connections.get(&conn_id) {
                match tx.send(WsMessage::Binary(message.to_vec())) {
                    Ok(_) => sent_count += 1,
                    Err(e) => log::warn!("Failed to send to {}: {}", conn_id, e),
                }
            }
        }

        log::info!("Broadcast to {} clients in room {}", sent_count, room_id);
    }

    /// Send message to specific connection
    pub async fn send_to_connection(&self, conn_id: &str, message: WsMessage) -> Result<()> {
        let connections = self.connections.read().await;
        if let Some(tx) = connections.get(conn_id) {
            tx.send(message)
                .map_err(|e| reticulum_core::Error::internal(format!("Failed to send message: {}", e)))?;
        }
        Ok(())
    }

    /// Get total connection count
    pub async fn connection_count(&self) -> usize {
        let connections = self.connections.read().await;
        connections.len()
    }

    /// Get connection count for a specific room
    pub async fn room_connection_count(&self, room_id: &str) -> usize {
        self.get_room_connections(room_id).await.len()
    }
}

impl Default for WebSocketManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Handle WebSocket connection
pub async fn websocket_handler(
    req: HttpRequest,
    stream: web::Payload,
    ws_manager: web::Data<WebSocketManager>,
    path: web::Path<String>,
) -> actix_web::Result<HttpResponse> {
    let room_id = path.into_inner();
    let conn_id = Uuid::new_v4().to_string();

    // Parse query parameters from query string
    let query_string = req.query_string();
    let mut user_id_param = None;
    let mut client_id_param = None;

    for pair in query_string.split('&') {
        let mut parts = pair.splitn(2, '=');
        if let Some(key) = parts.next() {
            if let Some(value) = parts.next() {
                match key {
                    "user_id" => user_id_param = Some(value.to_string()),
                    "client_id" => client_id_param = Some(value.to_string()),
                    _ => {}
                }
            }
        }
    }

    log::info!(
        "WebSocket connection request: {} for room {} (user: {:?}, client: {:?})",
        conn_id,
        room_id,
        user_id_param,
        client_id_param
    );

    // Determine user_id and client_id (from auth or query params)
    let (user_id, client_id) = if let Some(uid) = user_id_param {
        (Some(uid), client_id_param)
    } else {
        (user_id_param, client_id_param)
    };

    // Start WebSocket using actix-ws handle API
    let (response, mut session, mut msg_stream) = actix_ws::handle(&req, stream)?;

    // Register connection and get channel for sending
    let mut rx = ws_manager.add_connection(conn_id.clone(), Some(room_id.clone()), user_id, client_id).await;

    let conn_id_clone = conn_id.clone();
    let room_id_clone = room_id.clone();
    let ws_manager_clone = ws_manager.clone();

    // Spawn task to handle WebSocket messages
    actix_web::rt::spawn(async move {
        loop {
            tokio::select! {
                // Receive messages from client
                result = msg_stream.next() => {
                    match result {
                        Some(Ok(msg)) => {
                            match msg {
                                Message::Binary(bytes) => {
                                    log::info!("Received {} bytes from {} in room {}", bytes.len(), conn_id_clone, room_id_clone);
                                    // Handle client message and broadcast to room
                                    if let Err(e) =
                                        handle_client_message(&ws_manager_clone, &room_id_clone, &conn_id_clone, &bytes)
                                            .await
                                    {
                                        log::error!("Error handling message from {}: {:?}", conn_id_clone, e);
                                    }
                                }
                                Message::Text(text) => {
                                    log::debug!("Received text from {}: {}", conn_id_clone, text);
                                    // Handle text message
                                    if let Err(e) =
                                        handle_client_message(&ws_manager_clone, &room_id_clone, &conn_id_clone, text.as_bytes())
                                            .await
                                    {
                                        log::error!("Error handling message from {}: {:?}", conn_id_clone, e);
                                    }
                                }
                                Message::Ping(bytes) => {
                                    // Respond to ping with pong
                                    if session.pong(&bytes).await.is_err() {
                                        break;
                                    }
                                }
                                Message::Close(reason) => {
                                    log::info!("Client {} disconnected: {:?}", conn_id_clone, reason);
                                    break;
                                }
                                Message::Nop | Message::Continuation(_) | Message::Pong(_) => {
                                    // Ignore nop, continuation and pong frames
                                }
                            }
                        }
                        Some(Err(e)) => {
                            log::error!("WebSocket error from {}: {:?}", conn_id_clone, e);
                            break;
                        }
                        None => {
                            log::info!("Client {} disconnected (EOF)", conn_id_clone);
                            break;
                        }
                    }
                }
                // Send messages to client
                msg = rx.recv() => {
                    match msg {
                        Some(WsMessage::Text(text)) => {
                            if session.text(text).await.is_err() {
                                break;
                            }
                        }
                        Some(WsMessage::Binary(bytes)) => {
                            if session.binary(bytes).await.is_err() {
                                break;
                            }
                        }
                        Some(WsMessage::Close) => {
                            let _ = session.close(None).await;
                            return; // Exit immediately after close
                        }
                        None => {
                            // Channel closed
                            break;
                        }
                    }
                }
            }
        }

        // Cleanup on disconnect
        log::info!("Cleaning up connection {}", conn_id_clone);
        ws_manager_clone.remove_connection(&conn_id_clone).await;
        let _ = session.close(None).await;
    });

    // Send initial server hello
    let hello_message = create_server_hello(&room_id, &conn_id);
    let _ = ws_manager
        .send_to_connection(&conn_id, WsMessage::Text(hello_message))
        .await;

    log::info!("WebSocket connection established: {} in room {}", conn_id, room_id);

    Ok(response)
}

/// Handle incoming client message
async fn handle_client_message(
    ws_manager: &WebSocketManager,
    room_id: &str,
    sender_id: &str,
    message: &[u8],
) -> Result<()> {
    // Production metrics - temporarily disabled
    // ws_manager.metrics().metrics().record_message_received(message.len()).await;
    // ws_manager.metrics().room_metrics().record_message_received(room_id).await;

    // Per-connection rate limit check - temporarily disabled
    // if let Err(e) = ws_manager.rate_limiter().check_rate_limit(sender_id).await {
    //     log::warn!("Per-connection rate limit exceeded for {}: {:?}", sender_id, e);
    //     return Err(e);
    // }

    // Broadcast message to room (excluding sender)
    // Note: Protobuf parsing disabled for now, treats all messages as binary
    let room_connections = ws_manager.get_room_connections(room_id).await;
    log::info!(
        "Broadcasting {} bytes from {} in room {} to {} other clients",
        message.len(),
        sender_id,
        room_id,
        room_connections.len().saturating_sub(1)
    );

    ws_manager
        .broadcast_to_room(room_id, message, Some(sender_id))
        .await;

    // Production metrics - temporarily disabled
    // ws_manager.metrics().room_metrics().record_message_sent(room_id).await;
    // ws_manager.metrics().metrics().record_message_sent(message.len()).await;

    Ok(())
}

/// Create server hello message
fn create_server_hello(room_id: &str, client_id: &str) -> String {
    // Create a JSON message for now
    // In production, this would be a proper protobuf message
    format!(
        r#"{{"type":"SERVER_HELLO","room_id":"{}","client_id":"{}","timestamp":{}}}"#,
        room_id,
        client_id,
        chrono::Utc::now().timestamp()
    )
}

/// Get WebSocket connection stats
pub async fn get_stats(
    ws_manager: web::Data<WebSocketManager>,
    room_id: web::Path<String>,
) -> HttpResponse {
    let room_id = room_id.into_inner();
    let connections = ws_manager.get_room_connections(&room_id).await;

    let mut connection_info = Vec::new();
    for id in connections.iter() {
        if let Some(info) = ws_manager.get_connection_info(id).await {
            connection_info.push(serde_json::json!({
                "id": info.id,
                "room_id": info.room_id,
                "user_id": info.user_id,
                "client_id": info.client_id,
                "connected_at": info.connected_at,
            }));
        }
    }

    HttpResponse::Ok().json(serde_json::json!({
        "room_id": room_id,
        "connection_count": connection_info.len(),
        "connections": connection_info
    }))
}

/// Get all WebSocket connections
pub async fn get_all_stats(ws_manager: web::Data<WebSocketManager>) -> HttpResponse {
    let total_count = ws_manager.connection_count().await;

    HttpResponse::Ok().json(serde_json::json!({
        "total_connections": total_count,
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

/// Get performance metrics
pub async fn get_metrics(ws_manager: web::Data<WebSocketManager>) -> HttpResponse {
    // Collect metrics from WebSocket manager
    let sessions = ws_manager.get_all_sessions();
    
    // Calculate basic metrics
    let total_connections = sessions.len();
    let active_connections = sessions.iter().filter(|s| s.is_active()).count();
    let total_messages_sent: u64 = sessions.iter()
        .map(|s| s.messages_sent())
        .sum();
    
    // Get latency metrics (average heartbeat round-trip time)
    let latency_samples: Vec<u64> = sessions.iter()
        .flat_map(|s| {
            s.get_sessions().iter()
                .filter_map(|sess| {
                    sess.last_heartbeat.map(|lh| {
                        sess.last_heartbeat.as_ref().map(|rh| lh.saturating_sub(rh, lh).unwrap_or(0))
                    })
                })
                .flatten()
                .collect();
    
    let avg_latency = if latency_samples.is_empty() {
        0
    } else {
        latency_samples.iter().sum::<u64>() / latency_samples.len() as u64
    };

    let current_time = chrono::Utc::now();

    HttpResponse::Ok().json(serde_json::json!({
        "service": "reticulum-presence",
        "timestamp": current_time.to_rfc3339(),
        "metrics": {
            "connections": {
                "total": total_connections,
                "active": active_connections,
            },
            "performance": {
                "total_messages_sent": total_messages_sent,
                "avg_latency_ms": avg_latency,
            },
            "uptime_seconds": sessions.iter()
                .filter(|s| s.is_active())
                .map(|s| {
                    s.connected_at.as_ref()
                        .map(|ca| {
                            ca.saturating_sub(current_time, ca).unwrap_or(0).num_seconds().unwrap_or(0)
                        })
                        .sum::<u64>()
                })
        }
    }))
}

