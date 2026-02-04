//! Moderation handlers for presence service

use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::session::SessionManager;

/// Kick player from room
#[derive(Debug, Deserialize)]
pub struct KickPlayerRequest {
    pub room_id: String,
    pub target_client_id: String,
    pub kicked_by_client_id: String,
    pub reason: Option<String>,
}

/// Mute/unmute player
#[derive(Debug, Deserialize)]
pub struct MutePlayerRequest {
    pub room_id: String,
    pub target_client_id: String,
    pub muted: bool,
    pub reason: Option<String>,
}

/// Lock/unlock room
#[derive(Debug, Deserialize)]
pub struct LockRoomRequest {
    pub room_id: String,
    pub locked: bool,
    pub locked_by_client_id: String,
    pub reason: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ModerationActionResponse {
    pub success: bool,
    pub message: String,
}

/// Kick player from room
pub async fn kick_player(
    session_manager: web::Data<SessionManager>,
    body: web::Json<KickPlayerRequest>,
) -> HttpResponse {
    let req = body.into_inner();

    log::info!(
        "Kick player request: room={}, target={}, by={}, reason={:?}",
        req.room_id,
        req.target_client_id,
        req.kicked_by_client_id,
        req.reason
    );

    // Get session to be kicked
    match session_manager.get_session(&req.target_client_id).await {
        Some(session) => {
            // Verify player is in the room
            if session.room_id.as_ref() != Some(&req.room_id) {
                return HttpResponse::BadRequest().json(json!({
                    "success": false,
                    "message": format!("Player {} is not in room {}", req.target_client_id, req.room_id)
                }));
            }

            // Disconnect the session
            match session_manager.unregister_session(&req.target_client_id).await {
                Ok(_) => {
                    log::info!("Player {} kicked from room {}", req.target_client_id, req.room_id);

                    // Broadcast kick notification to room
                    let kick_notification = json!({
                        "type": "player_kicked",
                        "data": {
                            "kicked_client_id": req.target_client_id,
                            "kicked_by_client_id": req.kicked_by_client_id,
                            "reason": req.reason.unwrap_or_else(|| "Kicked by moderator".to_string())
                        }
                    });

                    // Broadcast to all room members
                    match session_manager.broadcast_to_room(&req.room_id, kick_notification).await {
                        Ok(count) => {
                            log::info!("Kick notification broadcasted to {} room members", count);
                        }
                        Err(e) => {
                            log::error!("Failed to broadcast kick notification: {}", e);
                        }
                    }

                    HttpResponse::Ok().json(json!({
                        "success": true,
                        "message": format!("Player {} kicked from room", req.target_client_id)
                    }))
                }
                Err(e) => {
                    log::error!("Failed to kick player: {}", e);
                    HttpResponse::InternalServerError().json(json!({
                        "success": false,
                        "message": "Failed to kick player"
                    }))
                }
            }
        }
        None => {
            HttpResponse::NotFound().json(json!({
                "success": false,
                "message": format!("Player {} not found", req.target_client_id)
            }))
        }
    }
}

/// Mute/unmute player
pub async fn mute_player(
    session_manager: web::Data<SessionManager>,
    body: web::Json<MutePlayerRequest>,
) -> HttpResponse {
    let req = body.into_inner();

    log::info!(
        "Mute player request: room={}, target={}, muted={}, reason={:?}",
        req.room_id,
        req.target_client_id,
        req.muted,
        req.reason
    );

    match session_manager.mute_player(&req.target_client_id, req.muted).await {
        Ok(_) => {
            log::info!("Player {} {} in room {}",
                req.target_client_id,
                if req.muted { "muted" } else { "unmuted" },
                req.room_id
            );

            // Broadcast mute notification to room
            let mute_notification = json!({
                "type": "player_muted",
                "data": {
                    "muted_client_id": req.target_client_id,
                    "muted": req.muted,
                    "reason": req.reason.unwrap_or_else(|| "Muted by moderator".to_string())
                }
            });

            // Broadcast to all room members
            match session_manager.broadcast_to_room(&req.room_id, mute_notification).await {
                Ok(count) => {
                    log::info!("Mute notification broadcasted to {} room members", count);
                }
                Err(e) => {
                    log::error!("Failed to broadcast mute notification: {}", e);
                }
            }

            HttpResponse::Ok().json(json!({
                "success": true,
                "message": format!("Player {} {}", req.target_client_id, if req.muted { "muted" } else { "unmuted" })
            }))
        }
        Err(e) => {
            log::error!("Failed to mute player: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "message": "Failed to mute player"
            }))
        }
    }
}

/// Lock/unlock room
pub async fn lock_room(
    session_manager: web::Data<SessionManager>,
    body: web::Json<LockRoomRequest>,
) -> HttpResponse {
    let req = body.into_inner();

    log::info!(
        "Lock room request: room={}, locked={}, by={}, reason={:?}",
        req.room_id,
        req.locked,
        req.locked_by_client_id,
        req.reason
    );

    match session_manager.set_room_locked(&req.room_id, req.locked).await {
        Ok(_) => {
            log::info!("Room {} {}", req.room_id, if req.locked { "locked" } else { "unlocked" });

            // Broadcast lock notification to room
            let lock_notification = json!({
                "type": "room_locked",
                "data": {
                    "room_id": req.room_id,
                    "locked": req.locked,
                    "locked_by_client_id": req.locked_by_client_id,
                    "reason": req.reason.unwrap_or_else(|| "Room locked".to_string())
                }
            });

            // Broadcast to all room members
            match session_manager.broadcast_to_room(&req.room_id, lock_notification).await {
                Ok(count) => {
                    log::info!("Lock notification broadcasted to {} room members", count);
                }
                Err(e) => {
                    log::error!("Failed to broadcast lock notification: {}", e);
                }
            }

            HttpResponse::Ok().json(json!({
                "success": true,
                "message": format!("Room {} {}", req.room_id, if req.locked { "locked" } else { "unlocked" })
            }))
        }
        Err(e) => {
            log::error!("Failed to lock room: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "message": "Failed to lock room"
            }))
        }
    }
}
