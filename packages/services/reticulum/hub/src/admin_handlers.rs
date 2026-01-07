//! Admin handlers for room management

use actix_web::{web, HttpResponse, HttpRequest};
use serde_json::json;

use reticulum_core::{Config, db, models as core_models};

/// List all rooms (admin view)
pub async fn list_rooms(
    config: web::Data<Config>,
    query: web::Query<RoomListQuery>,
) -> HttpResponse {
    // Connect to database
    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    let page = query.page.unwrap_or(1).max(1);
    let per_page = query.per_page.unwrap_or(50).min(100);
    let offset = (page - 1) * per_page;

    // Fetch all rooms from database
    match core_models::RoomModel::list_all(&db).await {
        Ok(rooms) => {
            let total = rooms.len();

            // Apply pagination
            let paginated: Vec<_> = rooms
                .into_iter()
                .skip(offset as usize)
                .take(per_page as usize)
                .collect();

            HttpResponse::Ok().json(json!({
                "rooms": paginated,
                "total": total,
                "page": page,
                "per_page": per_page,
                "total_pages": (total as f64 / per_page as f64).ceil() as i64
            }))
        }
        Err(e) => {
            log::error!("Failed to list rooms: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to retrieve rooms"
            }))
        }
    }
}

/// Get room details
pub async fn get_room_details(
    config: web::Data<Config>,
    path: web::Path<i32>,
) -> HttpResponse {
    let room_id = path.into_inner();

    // Connect to database
    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    match core_models::RoomModel::find_by_id(&db, room_id).await {
        Ok(Some(room)) => {
            HttpResponse::Ok().json(json!({
                "room": room
            }))
        }
        Ok(None) => {
            HttpResponse::NotFound().json(json!({
                "error": "not_found",
                "message": format!("Room {} not found", room_id)
            }))
        }
        Err(e) => {
            log::error!("Failed to find room: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to retrieve room"
            }))
        }
    }
}

/// Update room configuration
pub async fn update_room_config(
    config: web::Data<Config>,
    path: web::Path<i32>,
    body: web::Json<UpdateRoomRequest>,
) -> HttpResponse {
    let room_id = path.into_inner();

    // Connect to database
    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    let now = chrono::Utc::now().naive_utc();

    match core_models::RoomModel::find_by_id(&db, room_id).await {
        Ok(Some(_room)) => {
            let mut active_model: core_models::rooms::ActiveModel = _room.into();

            // Update only allowed fields
            if let Some(name) = body.name.clone() {
                active_model.name = sea_orm::ActiveValue::Set(name);
            }
            if let Some(description) = body.description.clone() {
                active_model.description = sea_orm::ActiveValue::Set(description);
            }
            if let Some(max_players) = body.max_players {
                active_model.max_players = sea_orm::ActiveValue::Set(max_players);
            }
            if let Some(is_private) = body.is_private {
                active_model.is_private = sea_orm::ActiveValue::Set(is_private);
            }

            active_model.updated_at = sea_orm::ActiveValue::Set(now);

            match active_model.update(&db).await {
                Ok(updated_room) => {
                    log::info!("Room {} configuration updated", room_id);
                    HttpResponse::Ok().json(json!({
                        "message": format!("Room {} updated", room_id),
                        "room": core_models::Room::from(updated_room)
                    }))
                }
                Err(e) => {
                    log::error!("Failed to update room: {}", e);
                    HttpResponse::InternalServerError().json(json!({
                        "error": "internal_error",
                        "message": "Failed to update room configuration"
                    }))
                }
            }
        }
        Ok(None) => {
            HttpResponse::NotFound().json(json!({
                "error": "not_found",
                "message": format!("Room {} not found", room_id)
            }))
        }
        Err(e) => {
            log::error!("Failed to find room: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to retrieve room"
            }))
        }
    }
}

/// Close (deactivate) a room
pub async fn close_room(
    config: web::Data<Config>,
    path: web::Path<i32>,
) -> HttpResponse {
    let room_id = path.into_inner();

    // Connect to database
    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    let now = chrono::Utc::now().naive_utc();

    match core_models::RoomModel::find_by_id(&db, room_id).await {
        Ok(Some(_room)) => {
            let mut active_model: core_models::rooms::ActiveModel = _room.into();
            active_model.is_active = sea_orm::ActiveValue::Set(false);
            active_model.updated_at = sea_orm::ActiveValue::Set(now);

            match active_model.update(&db).await {
                Ok(_) => {
                    log::info!("Room {} closed", room_id);
                    HttpResponse::Ok().json(json!({
                        "message": format!("Room {} closed successfully", room_id)
                    }))
                }
                Err(e) => {
                    log::error!("Failed to close room: {}", e);
                    HttpResponse::InternalServerError().json(json!({
                        "error": "internal_error",
                        "message": "Failed to close room"
                    }))
                }
            }
        }
        Ok(None) => {
            HttpResponse::NotFound().json(json!({
                "error": "not_found",
                "message": format!("Room {} not found", room_id)
            }))
        }
        Err(e) => {
            log::error!("Failed to find room: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to retrieve room"
            }))
        }
    }
}

/// Delete a room permanently
pub async fn delete_room(
    config: web::Data<Config>,
    path: web::Path<i32>,
) -> HttpResponse {
    let room_id = path.into_inner();

    // Connect to database
    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    match core_models::RoomModel::delete_by_id(&db, room_id).await {
        Ok(_) => {
            log::info!("Room {} deleted", room_id);
            HttpResponse::Ok().json(json!({
                "message": format!("Room {} deleted successfully", room_id)
            }))
        }
        Err(e) => {
            log::error!("Failed to delete room: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to delete room"
            }))
        }
    }
}

// Query parameter types for room listing
#[derive(Debug, Deserialize)]
pub struct RoomListQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

// Request types for room management
#[derive(Debug, Deserialize)]
pub struct UpdateRoomRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub max_players: Option<i32>,
    pub is_private: Option<bool>,
}
