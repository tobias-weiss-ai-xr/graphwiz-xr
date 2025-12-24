//! HTTP Request Handlers for SFU Service

use super::{
    config::SfuConfig,
    error::SfuError,
    peer::{IceCandidate, MediaKind, MediaTrack, SfuPeer, SessionDescription},
    room::{RoomManager, RoomStats},
};
use actix_web::{web, HttpRequest, HttpResponse};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Shared application state
pub struct AppState {
    pub room_manager: Arc<RwLock<RoomManager>>,
    pub sfu_config: SfuConfig,
}

impl Clone for AppState {
    fn clone(&self) -> Self {
        Self {
            room_manager: Arc::clone(&self.room_manager),
            sfu_config: self.sfu_config.clone(),
        }
    }
}

/// Create room request
#[derive(Debug, Deserialize)]
pub struct CreateRoomRequest {
    pub room_id: String,
    pub name: String,
}

/// Create room response
#[derive(Debug, Serialize)]
pub struct CreateRoomResponse {
    pub room_id: String,
    pub name: String,
}

/// Join room request
#[derive(Debug, Deserialize)]
pub struct JoinRoomRequest {
    pub room_id: String,
    pub display_name: String,
    pub user_id: Option<String>,
}

/// Join room response
#[derive(Debug, Serialize)]
pub struct JoinRoomResponse {
    pub peer_id: String,
    pub room_id: String,
    pub ice_servers: Vec<IceServerInfo>,
}

/// Offer request
#[derive(Debug, Deserialize)]
pub struct OfferRequest {
    pub peer_id: String,
    pub room_id: String,
    pub offer: SessionDescription,
}

/// Offer response
#[derive(Debug, Serialize)]
pub struct OfferResponse {
    pub answer: SessionDescription,
}

/// ICE candidate request
#[derive(Debug, Deserialize)]
pub struct IceCandidateRequest {
    pub peer_id: String,
    pub room_id: String,
    pub candidate: IceCandidate,
}

/// Add track request
#[derive(Debug, Deserialize)]
pub struct AddTrackRequest {
    pub peer_id: String,
    pub room_id: String,
    pub track_id: String,
    pub kind: String, // "audio" or "video"
    pub simulcast: bool,
}

/// Room stats response
#[derive(Debug, Serialize)]
pub struct RoomStatsResponse {
    pub stats: Vec<RoomStats>,
    pub total_rooms: usize,
}

#[derive(Debug, Serialize)]
pub struct IceServerInfo {
    pub urls: Vec<String>,
    pub username: Option<String>,
    pub credential: Option<String>,
}

/// Health check response
#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
    pub uptime: i64,
}

/// Create a new room
pub async fn create_room(
    state: web::Data<AppState>,
    req: web::Json<CreateRoomRequest>,
) -> HttpResponse {
    let room_manager = state.room_manager.read().await;
    let result = room_manager
        .create_room(req.room_id.clone(), req.name.clone())
        .await;

    match result {
        Ok(room) => HttpResponse::Ok().json(CreateRoomResponse {
            room_id: room.id.clone(),
            name: room.name.clone(),
        }),
        Err(SfuError::InternalError(e)) if e.contains("already exists") => {
            HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Room already exists"
            }))
        }
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": e.to_string()
        })),
    }
}

/// Join a room (creates peer connection)
pub async fn join_room(
    state: web::Data<AppState>,
    req: web::Json<JoinRoomRequest>,
) -> HttpResponse {
    let room_manager = state.room_manager.read().await;

    // Get or create room
    let room = match room_manager.get_room(&req.room_id).await {
        Ok(r) => r,
        Err(_) => {
            // Auto-create room if it doesn't exist
            drop(room_manager);
            let room_manager = state.room_manager.read().await;
            match room_manager
                .create_room(req.room_id.clone(), req.room_id.clone())
                .await
            {
                Ok(r) => r,
                Err(e) => {
                    return HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": e.to_string()
                    }))
                }
            }
        }
    };

    // Check capacity
    if room.is_full().await {
        return HttpResponse::ServiceUnavailable().json(serde_json::json!({
            "error": "Room is full"
        }));
    }

    // Create new peer
    let _user_id = req.user_id.clone().unwrap_or_else(|| Uuid::new_v4().to_string());
    let peer_id = Uuid::new_v4().to_string();
    let peer = Arc::new(SfuPeer::new(
        peer_id.clone(),
        req.room_id.clone(),
        req.display_name.clone(),
        &state.sfu_config,
    ));

    // Add peer to room
    if let Err(e) = room.add_peer(peer.clone()).await {
        return HttpResponse::InternalServerError().json(serde_json::json!({
            "error": e.to_string()
        }));
    }

    // Return peer info with ICE servers
    let ice_servers: Vec<IceServerInfo> = state
        .sfu_config
        .ice_servers
        .iter()
        .map(|srv| IceServerInfo {
            urls: srv.urls.clone(),
            username: srv.username.clone(),
            credential: srv.credential.clone(),
        })
        .collect();

    HttpResponse::Ok().json(JoinRoomResponse {
        peer_id,
        room_id: req.room_id.clone(),
        ice_servers,
    })
}

/// Handle WebRTC offer from peer
pub async fn handle_offer(
    state: web::Data<AppState>,
    req: web::Json<OfferRequest>,
) -> HttpResponse {
    let room_manager = state.room_manager.read().await;

    let room = match room_manager.get_room(&req.room_id).await {
        Ok(r) => r,
        Err(e) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": e.to_string()
            }))
        }
    };

    match room.handle_offer(&req.peer_id, &req.offer).await {
        Ok(answer) => HttpResponse::Ok().json(OfferResponse { answer }),
        Err(e) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": e.to_string()
        })),
    }
}

/// Handle ICE candidate
pub async fn handle_ice_candidate(
    state: web::Data<AppState>,
    req: web::Json<IceCandidateRequest>,
) -> HttpResponse {
    let room_manager = state.room_manager.read().await;

    let room = match room_manager.get_room(&req.room_id).await {
        Ok(r) => r,
        Err(e) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": e.to_string()
            }))
        }
    };

    match room
        .handle_ice_candidate(&req.peer_id, req.candidate.clone())
        .await
    {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({"success": true})),
        Err(e) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": e.to_string()
        })),
    }
}

/// Add media track for a peer
pub async fn add_track(
    state: web::Data<AppState>,
    req: web::Json<AddTrackRequest>,
) -> HttpResponse {
    let room_manager = state.room_manager.read().await;

    let room = match room_manager.get_room(&req.room_id).await {
        Ok(r) => r,
        Err(e) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": e.to_string()
            }))
        }
    };

    let peer = match room.get_peer(&req.peer_id).await {
        Ok(p) => p,
        Err(e) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": e.to_string()
            }))
        }
    };

    let kind = match req.kind.as_str() {
        "audio" => MediaKind::Audio,
        "video" => MediaKind::Video,
        _ => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Invalid track kind"
            }))
        }
    };

    let track = MediaTrack {
        id: req.track_id.clone(),
        kind,
        peer_id: req.peer_id.clone(),
        simulcast: req.simulcast,
    };

    match peer.add_track(track).await {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({"success": true})),
        Err(e) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": e.to_string()
        })),
    }
}

/// Leave room (disconnect peer)
pub async fn leave_room(
    state: web::Data<AppState>,
    path: web::Path<(String, String)>,
) -> HttpResponse {
    let (room_id, peer_id) = path.into_inner();
    let room_manager = state.room_manager.read().await;

    let room = match room_manager.get_room(&room_id).await {
        Ok(r) => r,
        Err(e) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": e.to_string()
            }))
        }
    };

    match room.remove_peer(&peer_id).await {
        Ok(_) => {
            log::info!("Peer {} left room {}", peer_id, room_id);
            HttpResponse::Ok().json(serde_json::json!({"success": true}))
        }
        Err(e) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": e.to_string()
        })),
    }
}

/// Get room statistics
pub async fn get_room_stats(state: web::Data<AppState>) -> HttpResponse {
    let room_manager = state.room_manager.read().await;
    let stats = room_manager.get_all_room_stats().await;
    let total_rooms = room_manager.room_count().await;

    HttpResponse::Ok().json(RoomStatsResponse { stats, total_rooms })
}

/// Get statistics for a specific room
pub async fn get_room_info(
    state: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let room_id = path.into_inner();
    let room_manager = state.room_manager.read().await;

    let room = match room_manager.get_room(&room_id).await {
        Ok(r) => r,
        Err(e) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": e.to_string()
            }))
        }
    };

    let stats = room.get_stats().await;
    HttpResponse::Ok().json(stats)
}

/// Health check endpoint
pub async fn health_check(_req: HttpRequest) -> HttpResponse {
    HttpResponse::Ok().json(HealthResponse {
        status: "healthy".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        uptime: chrono::Utc::now().timestamp(),
    })
}

/// List all rooms
pub async fn list_rooms(state: web::Data<AppState>) -> HttpResponse {
    let room_manager = state.room_manager.read().await;
    let room_ids = room_manager.get_room_ids().await;

    HttpResponse::Ok().json(serde_json::json!({
        "rooms": room_ids,
        "count": room_ids.len()
    }))
}
