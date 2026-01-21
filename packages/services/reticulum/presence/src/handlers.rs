//! HTTP handlers for presence service

use actix_web::{web, HttpRequest, HttpResponse};
use serde::Deserialize;

use crate::session::SessionManager;
use crate::webtransport::WebTransportManager;
use crate::signaling::SignalingMessage;
use reticulum_core::Config;
use std::sync::Arc;

#[derive(Debug, Deserialize)]
pub struct ConnectRequest {
    pub room_id: String,
    pub client_id: String,
    pub user_id: String,
}

/// Handle WebTransport connection request
pub async fn connect(
    config: web::Data<Config>,
    session_manager: web::Data<SessionManager>,
    webtransport_manager: web::Data<WebTransportManager>,
    req: HttpRequest,
) -> HttpResponse {
    // Check if WebTransport should be used
    let use_webtransport = config.get("USE_WEBTRANSPORT")
        .and_then(|v| if v == "true" { Some(true) } else { None })
        .unwrap_or(false);

    if use_webtransport {
        log::info!("WebTransport connection requested (room: {})", req.room_id);

        // Use WebTransport manager
        let session_result = match serde_json::from_slice::<ConnectRequest>(&req.body()) {
            Ok(connect_req) => {
                webtransport_manager.accept_connection(
                    // Placeholder session info - in real implementation this would come from wtransport crate
                    uuid::Uuid::new_v4().to_string(),
                    connect_req.client_id,
                    connect_req.user_id,
                    connect_req.room_id,
                ).await
            }
            Err(e) => {
                log::error!("Failed to parse connect request: {}", e);
                Err(eyre::eyre!("Invalid request: {}", e))
            }
        };

        match session_result {
            Ok(session_id) => {
                // Create bidirectional stream for WebTransport
                let stream_result = webtransport_manager.create_bidirectional_stream(&session_id).await;

                match stream_result {
                    Ok(_) => {
                        HttpResponse::Ok().json(serde_json::json!({
                            "status": "connected",
                            "transport": "webtransport",
                            "session_id": session_id,
                            "message": "WebTransport session created successfully"
                        }))
                    }
                    Err(e) => {
                        log::error!("Failed to create WebTransport stream: {}", e);
                        HttpResponse::InternalServerError().json(serde_json::json!({
                            "status": "error",
                            "message": format!("Failed to create WebTransport stream: {}", e)
                        }))
                    }
                }
            }
            Err(e) => {
                log::error!("Failed to create WebTransport session: {}", e);
                HttpResponse::InternalServerError().json(serde_json::json!({
                    "status": "error",
                    "message": format!("Failed to create WebTransport session: {}", e)
                }))
            }
        }
    } else {
        // WebTransport not enabled - use existing WebSocket handler
        log::warn!("WebTransport not enabled, using WebSocket fallback for room: {}", req.room_id);

        // Add WebSocket session
        let ws_session_id = uuid::Uuid::new_v4();
        match session_manager.register_session(crate::session::ClientSession {
            session_id: ws_session_id.clone(),
            client_id: req.client_id.clone(),
            user_id: req.user_id.clone(),
            room_id: Some(req.room_id.clone()),
            connected_at: chrono::Utc::now(),
            last_heartbeat: chrono::Utc::now(),
            is_muted: false,
        }).await {
            Ok(_) => log::info!("WebSocket session added to session manager for room: {}", ws_session_id),
            Err(e) => log::error!("Failed to add WebSocket session: {}", e),
        };

        HttpResponse::Ok().json(serde_json::json!({
            "status": "connected",
            "transport": "websocket",
            "session_id": ws_session_id.to_string(),
            "message": "WebSocket session created (WebTransport fallback)"
        }))
    }
}
