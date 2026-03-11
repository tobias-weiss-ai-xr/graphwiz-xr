//! HTTP handlers for presence service

use actix_web::{web, HttpRequest, HttpResponse};
use serde::Deserialize;

use crate::session::SessionManager;
use crate::signaling::SignalingMessage;
use crate::webtransport::{SessionInfo, WebTransportManager};
use reticulum_core::Config;
use std::sync::Arc;

#[derive(Debug, Deserialize)]
pub struct ConnectRequest {
    pub room_id: String,
    pub client_id: String,
    pub user_id: String,
}

/// Handle WebTransport connection via HTTP/3
pub async fn connect_webtransport(
    req: HttpRequest,
    webtransport_manager: web::Data<WebTransportManager>,
) -> HttpResponse {
    // Parse request body for connection details
    let body = match req.extract::<web::Json<ConnectRequest>>().await {
        Ok(json) => json.0,
        Err(e) => {
            log::error!("Failed to parse connect request: {}", e);
            return HttpResponse::BadRequest().json(serde_json::json!({
                "status": "error",
                "message": "Invalid request body"
            }));
        }
    };

    log::info!(
        "WebTransport connection requested: room={}, client_id={}",
        body.room_id,
        body.client_id
    );

    // WebTransport connections use HTTP/3 directly on port 4443
    // This endpoint confirms WebTransport is available
    HttpResponse::Ok().json(serde_json::json!({
        "status": "webtransport_available",
        "message": "WebTransport endpoint ready",
        "hint": "Client should initiate WebTransport connection via HTTP/3 on port 4443"
    }))
}

/// Handle regular HTTP connection request (WebSocket fallback)
pub async fn connect(
    config: web::Data<Config>,
    session_manager: web::Data<SessionManager>,
    req: HttpRequest,
) -> HttpResponse {
    // Check if WebTransport should be used
    let use_webtransport = config
        .get("USE_WEBTRANSPORT")
        .and_then(|v| if v == "true" { Some(true) } else { None })
        .unwrap_or(false);

    if use_webtransport {
        log::warn!("WebTransport requested but not yet supported via HTTP - use WS endpoint");
        // WebTransport connections use HTTP/3 directly, not HTTP
        // For now, fall back to WebSocket
    }

    // Parse request body for WebSocket connection details
    let body: serde_json::Value = match actix_web::web::body::to_bytes(req).await {
        Ok(bytes) => match serde_json::from_slice(&bytes) {
            Ok(v) => v,
            Err(e) => {
                log::error!("Failed to parse request body: {}", e);
                return HttpResponse::BadRequest().json(serde_json::json!({
                    "error": "Invalid request body",
                    "details": e.to_string()
                }));
            }
        },
        Err(e) => {
            log::error!("Failed to read request body: {}", e);
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Failed to read request",
                "details": e.to_string()
            }));
        }
    };

    let room_id = body
        .get("room_id")
        .and_then(|v| v.as_str())
        .unwrap_or("default")
        .to_string();

    let client_id = body
        .get("client_id")
        .and_then(|v| v.as_str())
        .unwrap_or_else(|| uuid::Uuid::new_v4().to_string())
        .to_string();

    let user_id = body
        .get("user_id")
        .and_then(|v| v.as_str())
        .unwrap_or_else(|| uuid::Uuid::new_v4().to_string())
        .to_string();

    // Add WebSocket session
    let ws_session_id = uuid::Uuid::new_v4().to_string();
    match session_manager
        .register_session(crate::session::ClientSession {
            session_id: ws_session_id.clone(),
            client_id: client_id.clone(),
            user_id: user_id.clone(),
            room_id: Some(room_id.clone()),
            connected_at: chrono::Utc::now(),
            last_heartbeat: chrono::Utc::now(),
            is_muted: false,
        })
        .await
    {
        Ok(_) => log::info!(
            "WebSocket session {} added for client {} in room {}",
            ws_session_id,
            client_id,
            room_id
        ),
        Err(e) => log::error!("Failed to add WebSocket session: {}", e),
    };

    HttpResponse::Ok().json(serde_json::json!({
        "status": "connected",
        "transport": "websocket",
        "session_id": ws_session_id,
        "message": "Session established"
    }))
}

/// Health check handler
pub async fn health() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy"
    }))
}

/// Get all room clients (legacy handler for compatibility)
pub async fn get_room_clients(room_id: web::Path<String>) -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "room_id": room_id.into_inner(),
        "clients": vec![]
    }))
}
