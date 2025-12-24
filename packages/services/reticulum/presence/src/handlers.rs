//! HTTP handlers for presence service

use actix_web::{web, HttpRequest, HttpResponse};
use serde::Deserialize;

use crate::session::SessionManager;
use crate::signaling::SignalingMessage;
use reticulum_core::Config;

#[derive(Debug, Deserialize)]
pub struct ConnectRequest {
    pub room_id: String,
    pub client_id: String,
    pub user_id: String,
}

/// Handle WebTransport connection request
pub async fn connect(
    _config: web::Data<Config>,
    _session_manager: web::Data<SessionManager>,
    _req: HttpRequest,
) -> HttpResponse {
    // In a real implementation, this would upgrade to WebTransport
    HttpResponse::Ok().json(serde_json::json!({
        "status": "webtransport_not_implemented",
        "message": "WebTransport support coming soon"
    }))
}

/// Get all clients in a room
pub async fn get_room_clients(
    session_manager: web::Data<SessionManager>,
    room_id: web::Path<String>,
) -> HttpResponse {
    let room_id = room_id.into_inner();
    let sessions = session_manager.get_room_sessions(&room_id).await;

    let clients: Vec<serde_json::Value> = sessions
        .iter()
        .map(|s| {
            serde_json::json!({
                "client_id": s.client_id,
                "user_id": s.user_id,
                "connected_at": s.connected_at,
                "last_heartbeat": s.last_heartbeat,
            })
        })
        .collect();

    HttpResponse::Ok().json(clients)
}

/// Handle WebRTC signaling message
pub async fn signaling(
    _session_manager: web::Data<SessionManager>,
    msg: web::Json<SignalingMessage>,
) -> HttpResponse {
    log::info!("Received signaling message: {:?}", msg.message_type);

    // In a real implementation, this would route the message to the target client
    HttpResponse::Accepted().json(serde_json::json!({
        "status": "accepted",
        "message": "Signaling message received"
    }))
}

/// Health check for presence service
pub async fn health() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "reticulum-presence"
    }))
}
