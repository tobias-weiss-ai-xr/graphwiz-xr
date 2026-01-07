//! Room persistence handlers

use actix_web::{web, HttpResponse};
use serde_json::json;
use reticulum_core::{Config, db, models as core_models};

use super::room_persistence::{
    RoomState,
    EnvironmentSettings,
    SaveRoomRequest,
    LoadRoomResponse,
    get_default_templates,
    create_room_from_template,
};

/// Save room state
pub async fn save_room(
    config: web::Data<Config>,
    body: web::Json<SaveRoomRequest>,
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

    let room_id = body.room_id.clone();

    // Get existing room
    match core_models::RoomModel::find_by_room_id(&db, &room_id).await {
        Ok(Some(_room)) => {
            // Serialize room state to JSON
            let room_state_json = serde_json::to_string(&RoomState {
                room_id: room_id.clone(),
                name: body.name.clone(),
                description: body.description.clone(),
                entities: vec![], // TODO: Fetch from room state
                environment: EnvironmentSettings {
                    lighting_type: "default".to_string(),
                    skybox_url: None,
                    ambient_color: [0.5, 0.5, 0.5],
                    background_color: [0.1, 0.1, 0.15],
                    fog_enabled: false,
                    fog_color: [0.5, 0.5, 0.5],
                    fog_density: 0.0,
                },
                last_modified: chrono::Utc::now().naive_utc(),
            });

            // Update room description if provided
            if body.name.is_some() || body.description.is_some() {
                let now = chrono::Utc::now().naive_utc();
                let mut active_model: core_models::rooms::ActiveModel = _room.into();

                if let Some(name) = body.name {
                    active_model.name = sea_orm::ActiveValue::Set(name);
                }

                if let Some(description) = body.description {
                    active_model.description = sea_orm::ActiveValue::Set(description);
                }

                active_model.updated_at = sea_orm::ActiveValue::Set(now);

                match active_model.update(&db).await {
                    Ok(_) => log::info!("Room metadata updated for {}", room_id),
                    Err(e) => log::error!("Failed to update room metadata: {}", e),
                }
            }

            // Store room state in a separate table (TODO: create room_states table)

            HttpResponse::Ok().json(json!({
                "success": true,
                "message": format!("Room {} saved", room_id),
                "room_id": room_id
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

/// Load room state
pub async fn load_room(
    config: web::Data<Config>,
    path: web::Path<String>,
) -> HttpResponse {
    let room_id = path.into_inner();

    // TODO: Fetch room state from room_states table
    // For now, return empty room state

    HttpResponse::Ok().json(json!({
        "success": true,
        "room_state": RoomState {
            room_id: room_id.clone(),
            name: "Loaded Room".to_string(),
            description: None,
            entities: vec![],
            environment: EnvironmentSettings {
                lighting_type: "default".to_string(),
                skybox_url: None,
                ambient_color: [0.5, 0.5, 0.5],
                background_color: [0.1, 0.1, 0.15],
                fog_enabled: false,
                fog_color: [0.5, 0.5, 0.5],
                fog_density: 0.0,
            },
            last_modified: chrono::Utc::now().naive_utc(),
        }
    }))
}

/// Get room templates
pub async fn get_room_templates() -> HttpResponse {
    let templates = get_default_templates();

    HttpResponse::Ok().json(json!({
        "templates": templates
    }))
}

/// Create room from template
pub async fn create_room_from_template(
    config: web::Data<Config>,
    user_id: web::ReqData<String>,
    body: web::Json<super::room_persistence::CloneRoomRequest>,
) -> HttpResponse {
    // Find template
    let templates = get_default_templates();
    let template = match templates.iter().find(|t| t.id == body.source_room_id) {
        Some(t) => t,
        None => {
            return HttpResponse::NotFound().json(json!({
                "error": "not_found",
                "message": format!("Template {} not found", body.source_room_id)
            }));
        }
    };

    // Create new room from template
    let room_state = create_room_from_template(template, user_id.into_inner());
    let now = chrono::Utc::now().naive_utc();

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

    match core_models::RoomModel::create(
        &db,
        room_state.room_id.clone(),
        room_state.name.clone(),
        Some(room_state.description),
        user_id.clone(),
    )
    .await
    {
        Ok(_room) => {
            HttpResponse::Ok().json(json!({
                "success": true,
                "message": "Room created from template",
                "room_id": room_state.room_id,
                "room_name": room_state.name
            }))
        }
        Err(e) => {
            log::error!("Failed to create room: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to create room"
            }))
        }
    }

    /// Clone existing room
pub async fn clone_room(
    config: web::Data<Config>,
    user_id: web::ReqData<String>,
    path: web::Path<String>,
) -> HttpResponse {
    let source_room_id = path.into_inner();

    // Get source room
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

    match core_models::RoomModel::find_by_room_id(&db, &source_room_id).await {
        Ok(Some(source_room)) => {
            // Create clone with new ID
            let new_room_id = uuid::Uuid::new_v4().to_string();
            let now = chrono::Utc::now().naive_utc();

            match core_models::RoomModel::create(
                &db,
                new_room_id.clone(),
                format!("{} (Clone)", source_room.name),
                source_room.description.clone(),
                user_id.into_inner(),
            )
            .await
            {
                Ok(_room) => {
                    HttpResponse::Ok().json(json!({
                        "success": true,
                        "message": "Room cloned successfully",
                        "room_id": new_room_id,
                        "source_room_id": source_room_id
                    }))
                }
                Err(e) => {
                    log::error!("Failed to clone room: {}", e);
                    HttpResponse::InternalServerError().json(json!({
                        "error": "internal_error",
                        "message": "Failed to clone room"
                    }))
                }
            }
        }
        Ok(None) => {
            HttpResponse::NotFound().json(json!({
                "error": "not_found",
                "message": format!("Room {} not found", source_room_id)
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
