//! HTTP handlers for hub service

use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use validator::Validate;

use reticulum_core::{db, models as core_models, Config};

use crate::room::{RoomManager, RoomState};

#[derive(Debug, Deserialize, Validate)]
pub struct CreateRoomRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: String,
    pub description: Option<String>,
    pub max_players: Option<i32>,
    pub is_private: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct CreateRoomResponse {
    pub room_id: String,
    pub name: String,
    pub description: Option<String>,
    pub max_players: i32,
    pub created_by: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct JoinRoomRequest {
    #[validate(length(min = 1))]
    pub room_id: String,
}

/// Create a new room
pub async fn create_room(
    config: web::Data<Config>,
    room_manager: web::Data<RoomManager>,
    req: web::Json<CreateRoomRequest>,
    user_id: web::ReqData<String>, // Would come from auth middleware
) -> HttpResponse {
    // Validate request
    if let Err(errors) = req.validate() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "validation_error",
            "message": errors.to_string()
        }));
    }

    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    // Generate room ID
    let room_id = uuid::Uuid::new_v4().to_string();

    // Create room in database
    let room = match core_models::RoomModel::create(
        &db,
        room_id.clone(),
        req.name.clone(),
        req.description.clone(),
        user_id.into_inner(),
    )
    .await
    {
        Ok(room) => room,
        Err(e) => {
            log::error!("Failed to create room: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to create room"
            }));
        }
    };

    // Initialize room state in memory
    let room_state = RoomState {
        room_id: room_id.clone(),
        name: room.name.clone(),
        description: room.description,
        max_players: room.max_players,
        current_players: 0,
        created_by: room.created_by,
        entities: Default::default(),
    };

    let mut rooms = room_manager.rooms.write().await;
    rooms.insert(room_id.clone(), room_state);

    let response = CreateRoomResponse {
        room_id,
        name: room.name,
        description: room.description,
        max_players: room.max_players,
        created_by: room.created_by,
    };

    HttpResponse::Created().json(response)
}

/// Get a room by ID
pub async fn get_room(
    config: web::Data<Config>,
    room_manager: web::Data<RoomManager>,
    room_id: web::Path<String>,
) -> HttpResponse {
    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    let room_id = room_id.into_inner();

    match room_manager.get_room(&room_id, &db).await {
        Ok(Some(room)) => HttpResponse::Ok().json(room),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "not_found",
            "message": "Room not found"
        })),
        Err(e) => {
            log::error!("Failed to get room: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to get room"
            }))
        }
    }
}

/// List all active rooms
pub async fn list_rooms(
    config: web::Data<Config>,
) -> HttpResponse {
    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    match core_models::RoomModel::list_active(&db).await {
        Ok(rooms) => HttpResponse::Ok().json(rooms),
        Err(e) => {
            log::error!("Failed to list rooms: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to list rooms"
            }))
        }
    }
}

/// Join a room
pub async fn join_room(
    config: web::Data<Config>,
    room_manager: web::Data<RoomManager>,
    room_id: web::Path<String>,
) -> HttpResponse {
    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    let room_id = room_id.into_inner();

    // Check if room exists and has space
    let room = match room_manager.get_room(&room_id, &db).await {
        Ok(Some(room)) => room,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "not_found",
                "message": "Room not found"
            }));
        }
        Err(e) => {
            log::error!("Failed to get room: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to get room"
            }));
        }
    };

    if room.current_players >= room.max_players {
        return HttpResponse::Conflict().json(serde_json::json!({
            "error": "room_full",
            "message": "Room is full"
        }));
    }

    // Add player to room
    match room_manager.add_player(&room_id).await {
        Ok(true) => HttpResponse::Ok().json(serde_json::json!({
            "room_id": room_id,
            "message": "Successfully joined room"
        })),
        Ok(false) => HttpResponse::Conflict().json(serde_json::json!({
            "error": "room_full",
            "message": "Room is full"
        })),
        Err(e) => {
            log::error!("Failed to add player: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to join room"
            }))
        }
    }
}

/// Health check for hub service
pub async fn health() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "reticulum-hub"
    }))
}
