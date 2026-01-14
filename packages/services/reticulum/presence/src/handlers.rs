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
        // Check if WebTransport should be used
        let use_webtransport = match _config.get("USE_WEBTRANSPORT") {
            Some(true) => {
                // WebTransport enabled - proceed
            log::info!("WebTransport connection requested (room: {})", _req.room_id);
                None => {
                    // WebTransport disabled - check if WebSocket available for fallback
                    log::warn!("WebTransport not enabled, checking WebSocket availability");
                    // Check if WebSocket session manager supports WebTransport sessions
                    let has_webtransport_sessions = match &_session_manager.get_session(&_req.client_id) {
                        Some(s) => matches!(s.protocol == "webtransport"),
                        None => false,
                    };
                    
                    // If WebSocket available, use that; otherwise fall back to WebSocket
                    if has_webtransport_sessions.unwrap_or(false) {
                        log::info!("Falling back to WebSocket for room: {}", _req.room_id);
                        // Note: SessionManager doesn't have explicit WebTransport support yet
                    } else {
                        // Use WebSocket directly
                        log::warn!("Using WebSocket directly (no WebTransport session management) for room: {}", _req.room_id);
                    }
                }
            }
        }

        // WebTransport connection - basic implementation
        if use_webtransport {
            log::info!("Creating WebTransport connection for room: {}", _req.room_id);
            
            // Create WebTransport session
            let session_id = Uuid::new_v4();
            
            // Add session to session manager
            match _session_manager.add_session(&session_id, &session_id, "webtransport") {
                Ok(sid) => {
                    log::info!("WebTransport session created: {}", sid);
                            
                    // Register session with room
                    _session_manager.join_room(sid, &_req.room_id).await;
                            
                    Ok(())
                        }
                Err(e) => {
                            log::error!("Failed to add WebTransport session: {}", e);
                            HttpResponse::InternalServerError().body(serde_json::json!({
                                "status": "error",
                                "message": format!("Failed to create WebTransport session: {}", e)
                            }))
                        }
                    }
                    
                    // Create WebTransport session response
                    HttpResponse::Ok().json(serde_json::json!({
                        "status": "connected",
                        "transport": "webtransport",
                        "session_id": session_id.to_string()
                    }))
                }
            } else {
                // Use WebSocket directly
                log::info!("Using WebSocket directly (no WebTransport session management) for room: {}", _req.room_id);
                
                // Add session to session manager for WebSocket
                let ws_session_id = Uuid::new_v4();
                match _session_manager.add_session(&ws_session_id, &ws_session_id, "websocket") {
                    Ok(_) => log::info!("WebSocket session added to session manager for room: {}", ws_session_id),
                    Err(e) => log::error!("Failed to add WebSocket session: {}", e),
                };
            }
        } else {
                log::warn!("Using WebSocket directly (no WebTransport session management) for room: {}", _req.room_id);
            }

            // Store session in sessions map for broadcasting
            let session_map = match _session_manager.sessions.write().await;
            session_map.insert(session_id.clone(), WebTransportSession {
                session_id: session_id.to_string(),
                protocol: "websocket", // Fallback
                created_at: chrono::Utc::now(),
            });
        }
    } else {
            // WebTransport disabled
            log::warn!("WebTransport not enabled, using WebSocket fallback for room: {}", _req.room_id);
            // Use WebSocket directly
            log::info!("Using WebSocket directly (no WebTransport session management) for room: {}", _req.room_id);
            
            // Add session to session manager for WebSocket
            let ws_session_id = Uuid::new_v4();
            match _session_manager.add_session(&ws_session_id, &ws_session_id, "websocket") {
                Ok(_) => log::info!("WebSocket session added to session manager for room: {}", ws_session_id),
                Err(e) => log::error!("Failed to add WebSocket session: {}", e),
                };
            }
        }

        HttpResponse::Ok().json(serde_json::json!({
            "status": "connected",
            "transport": "webtransport",
            "session_id": session_id.to_string()
        }))
    }
                    Err(e) => {
                        log::error!("Failed to add WebTransport session: {}", e);
                        HttpResponse::InternalServerError().body(serde_json::json!({
                            "status": "error",
                            "message": format!("Failed to create WebTransport session: {}", e)
                        }))
                    }
                }
            }

            // Store session in sessions map
            let sessions_map = match _session_manager.sessions.write().await {
                Ok(map) => map,
                Err(e) => {
                    log::error!("Failed to get sessions map: {}", e);
                    HttpResponse::InternalServerError().body(serde_json::json!({
                        "status": "error",
                        "message": format!("Failed to get sessions map: {}", e)
                        }))
                    }
            };
            
            let session = sessions_map.get(&_req.client_id);
            
            // Create WebTransport session response
            HttpResponse::Ok().json(serde_json::json!({
                "status": "connected",
                "transport": "webtransport",
                "session_id": session_id.to_string()
            }))

            Ok(())
        }
        } else {
            // WebSocket fallback
            // Use existing WebSocket infrastructure for session management
            let client_id = _req.client_id.clone();
            let room_id = _req.room_id.clone();
            
            log::info!("WebSocket fallback for session {} client_id, room: {}", client_id, room_id);

            HttpResponse::Ok().json(serde_json::json!({
                "status": "connected",
                "transport": "websocket",
                "session_id": client_id.to_string()
            }))
        }
    }
                None => {
                    // No WebTransport session - create new one
                    log::info!("Creating new WebTransport session for room {}", _req.room_id);

                    let session_id = Uuid::new_v4();
                    
                    // Add WebTransport session to session manager
                    match _session_manager.add_session(&_req.client_id, &session_id, "webtransport") {
                        Ok(sid) => {
                            log::info!("WebTransport session created: {}", sid);
                            
                            // Register session with room
                            _session_manager.join_room(sid, &_req.room_id).await;
                            
                            Ok(())
                        }
                        Err(e) => {
                            log::error!("Failed to add WebTransport session: {}", e);
                            HttpResponse::InternalServerError().body(serde_json::json!({
                                "status": "error",
                                "message": format!("Failed to create WebTransport session: {}", e)
                            }))
                        }
                    }
                    
                    // Create WebTransport session response
                    HttpResponse::Ok().json(serde_json::json!({
                        "status": "connected",
                        "transport": "webtransport",
                        "session_id": session_id.to_string()
                    }))
                }
            }
        }
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

/// Set batch configuration (HTTP/3 batch size limits)
pub async fn set_batch_config(
    session_manager: web::Data<SessionManager>,
    config: web::Json<BatchConfig>,
) -> HttpResponse {
    log::info!("Setting batch config: {:?}", config);

    // Update configuration
    session_manager.set_batch_config(config.batch_size, config.max_batch_size).await;

    HttpResponse::Ok().json(serde_json::json!({
        "status": "updated",
        "message": "Batch configuration updated"
    }))
}

/// Set queue depth limit
pub async fn set_queue_depth(
    session_manager: web::Data<SessionManager>,
    config: web::Json<QueueDepthConfig>,
) -> HttpResponse {
    log::info!("Setting queue depth limit: {:?}", config.max_depth);

    // Update configuration
    session_manager.set_queue_depth_limit(config.max_depth).await;

    HttpResponse::Ok().json(serde_json::json!({
        "status": "updated",
        "message": "Queue depth limit updated"
    }))
}

/// Get queue statistics for a session
pub async fn get_queue_stats(
    session_manager: web::Data<SessionManager>,
    session_id: web::Path<String>,
) -> HttpResponse {
    let session_id = session_id.into_inner();
    
    match session_manager.get_queue_stats(&session_id).await {
        Some(stats) => HttpResponse::Ok().json(serde_json::json!({
            "session_id": session_id,
            "stats": stats
        })),
        None => HttpResponse::NotFound().json(serde_json::json!({
            "status": "error",
            "message": format!("Session not found: {}", session_id)
        }))
    }
}

/// Get queue statistics for all sessions
pub async fn get_all_queue_stats(
    session_manager: web::Data<SessionManager>,
) -> HttpResponse {
    let stats = session_manager.get_all_queue_stats().await;

    HttpResponse::Ok().json(serde_json::json!({
        "status": "success",
        "count": stats.len(),
        "stats": stats
    }))
}

/// Set rate limit for a session
pub async fn set_rate_limit(
    session_manager: web::Data<SessionManager>,
    session_id: web::Path<String>,
    config: web::Json<RateLimitConfig>,
) -> HttpResponse {
    let session_id = session_id.into_inner();
    
    let window_duration = match config.window_seconds {
        Some(secs) => Duration::from_secs(secs),
        None => Duration::from_secs(1), // Default 1 second
    };

    match session_manager.set_session_rate_limit(&session_id, config.max_messages, window_duration).await {
        Ok(()) => HttpResponse::Ok().json(serde_json::json!({
            "status": "updated",
            "message": "Rate limit updated",
            "session_id": session_id
        })),
        Err(e) => HttpResponse::NotFound().json(serde_json::json!({
            "status": "error",
            "message": format!("Failed to set rate limit: {}", e)
        }))
    }
}

#[derive(Debug, Deserialize)]
pub struct BatchConfig {
    pub batch_size: usize,
    pub max_batch_size: usize,
}

#[derive(Debug, Deserialize)]
pub struct QueueDepthConfig {
    pub max_depth: usize,
}

#[derive(Debug, Deserialize)]
pub struct RateLimitConfig {
    pub max_messages: usize,
    pub window_seconds: Option<u64>,
}

