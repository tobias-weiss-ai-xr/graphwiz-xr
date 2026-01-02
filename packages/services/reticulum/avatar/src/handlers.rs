//! HTTP handlers for avatar service

use actix_web::{web, HttpResponse};
use reticulum_core::Config;
use validator::Validate;

use crate::db::AvatarRepository;
use crate::models::{
    AvatarConfig, BodyType, CustomAvatarRequest, DefaultAvatarResponse,
    UpdateAvatarRequest, UserAvatarResponse,
};

/// Health check
pub async fn health() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "avatar"
    }))
}

/// Get default avatar configuration
pub async fn get_default_avatar(config: web::Data<Config>) -> HttpResponse {
    let default_config = AvatarConfig::default();

    let available_body_types = vec![
        "human".to_string(),
        "robot".to_string(),
        "alien".to_string(),
        "animal".to_string(),
        "abstract".to_string(),
    ];

    let available_colors = vec![
        "#4CAF50".to_string(), // Green
        "#2196F3".to_string(), // Blue
        "#FF5722".to_string(), // Orange
        "#9C27B0".to_string(), // Purple
        "#F44336".to_string(), // Red
        "#FFEB3B".to_string(), // Yellow
        "#00BCD4".to_string(), // Cyan
        "#FF9800".to_string(), // Amber
        "#E91E63".to_string(), // Pink
        "#795548".to_string(), // Brown
    ];

    let response = DefaultAvatarResponse {
        config: default_config,
        available_body_types,
        available_colors,
    };

    HttpResponse::Ok().json(response)
}

/// Get user's avatar configuration
pub async fn get_user_avatar(
    config: web::Data<Config>,
    path: web::Path<String>,
) -> HttpResponse {
    let user_id = match uuid::Uuid::parse_str(&path.into_inner()) {
        Ok(id) => id,
        Err(e) => {
            log::error!("Invalid user ID format: {}", e);
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "invalid_user_id",
                "message": "User ID must be a valid UUID"
            }));
        }
    };

    let repo = match AvatarRepository::from_config(&config).await {
        Ok(repo) => repo,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    match repo.get_avatar(user_id).await {
        Ok(Some(record)) => {
            let avatar_config = AvatarConfig {
                user_id: record.user_id,
                body_type: record.body_type,
                primary_color: record.primary_color,
                secondary_color: record.secondary_color,
                height: record.height,
                custom_model_id: record.custom_model_id,
                metadata: record.metadata,
            };

            let response = UserAvatarResponse {
                user_id: record.user_id,
                config: avatar_config,
                created_at: record.created_at,
                updated_at: record.updated_at,
            };

            HttpResponse::Ok().json(response)
        }
        Ok(None) => {
            // Return default avatar if not found
            let default_config = AvatarConfig {
                user_id,
                ..Default::default()
            };

            let response = UserAvatarResponse {
                user_id,
                config: default_config,
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            };

            HttpResponse::Ok().json(response)
        }
        Err(e) => {
            log::error!("Failed to get avatar: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to retrieve avatar configuration"
            }))
        }
    }
}

/// Update user's avatar configuration
pub async fn update_user_avatar(
    config: web::Data<Config>,
    path: web::Path<String>,
    req: web::Json<UpdateAvatarRequest>,
) -> HttpResponse {
    let user_id = match uuid::Uuid::parse_str(&path.into_inner()) {
        Ok(id) => id,
        Err(e) => {
            log::error!("Invalid user ID format: {}", e);
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "invalid_user_id",
                "message": "User ID must be a valid UUID"
            }));
        }
    };

    // Validate request
    if let Err(errors) = req.validate() {
        log::debug!("Validation errors: {:?}", errors);
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "validation_error",
            "message": "Invalid request data",
            "details": errors.to_string()
        }));
    }

    let repo = match AvatarRepository::from_config(&config).await {
        Ok(repo) => repo,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    // Get existing avatar or create default
    let existing_avatar = match repo.get_avatar(user_id).await {
        Ok(Some(record)) => AvatarConfig {
            user_id: record.user_id,
            body_type: record.body_type,
            primary_color: record.primary_color,
            secondary_color: record.secondary_color,
            height: record.height,
            custom_model_id: record.custom_model_id,
            metadata: record.metadata,
        },
        Ok(None) => AvatarConfig {
            user_id,
            ..Default::default()
        },
        Err(e) => {
            log::error!("Failed to get avatar: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to retrieve avatar configuration"
            }));
        }
    };

    // Apply updates
    let updated_avatar = AvatarConfig {
        user_id,
        body_type: req.body_type.unwrap_or(existing_avatar.body_type),
        primary_color: req.primary_color.clone().unwrap_or(existing_avatar.primary_color),
        secondary_color: req.secondary_color.clone().unwrap_or(existing_avatar.secondary_color),
        height: req.height.unwrap_or(existing_avatar.height),
        custom_model_id: req.custom_model_id.or(existing_avatar.custom_model_id),
        metadata: req.metadata.clone().unwrap_or(existing_avatar.metadata),
    };

    // Validate colors (basic hex check)
    if let Err(_) = validate_hex_color(&updated_avatar.primary_color) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "invalid_color",
            "message": "primary_color must be a valid hex color (e.g., #FF0000)"
        }));
    }

    if let Err(_) = validate_hex_color(&updated_avatar.secondary_color) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "invalid_color",
            "message": "secondary_color must be a valid hex color (e.g., #FF0000)"
        }));
    }

    match repo.upsert_avatar(&updated_avatar).await {
        Ok(record) => {
            let response = UserAvatarResponse {
                user_id: record.user_id,
                config: AvatarConfig {
                    user_id: record.user_id,
                    body_type: record.body_type,
                    primary_color: record.primary_color,
                    secondary_color: record.secondary_color,
                    height: record.height,
                    custom_model_id: record.custom_model_id,
                    metadata: record.metadata,
                },
                created_at: record.created_at,
                updated_at: record.updated_at,
            };

            HttpResponse::Ok().json(response)
        }
        Err(e) => {
            log::error!("Failed to upsert avatar: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to save avatar configuration"
            }))
        }
    }
}

/// Register custom avatar model
pub async fn register_custom_avatar(
    config: web::Data<Config>,
    req: web::Json<CustomAvatarRequest>,
    user_id: web::ReqData<String>,
) -> HttpResponse {
    let user_id_str = user_id.into_inner();

    // Validate user_id format
    let user_uuid = match uuid::Uuid::parse_str(&user_id_str) {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "invalid_user_id",
                "message": "Invalid user ID in authentication"
            }));
        }
    };

    // In a real implementation, verify the asset_id exists in storage service
    // and belongs to the user
    log::info!(
        "User {} registering custom avatar model {} ({})",
        user_uuid,
        req.asset_id,
        req.name
    );

    let repo = match AvatarRepository::from_config(&config).await {
        Ok(repo) => repo,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    // Get existing avatar
    let existing_avatar = match repo.get_avatar(user_uuid).await {
        Ok(Some(record)) => AvatarConfig {
            user_id: record.user_id,
            body_type: record.body_type,
            primary_color: record.primary_color,
            secondary_color: record.secondary_color,
            height: record.height,
            custom_model_id: record.custom_model_id,
            metadata: record.metadata,
        },
        Ok(None) => AvatarConfig {
            user_id: user_uuid,
            ..Default::default()
        },
        Err(e) => {
            log::error!("Failed to get avatar: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to retrieve avatar configuration"
            }));
        }
    };

    // Update with custom model
    let updated_avatar = AvatarConfig {
        custom_model_id: Some(req.asset_id),
        metadata: serde_json::json!({
            "custom_name": req.name,
            "thumbnail_url": req.thumbnail_url,
            "previous_config": existing_avatar.metadata
        }),
        ..existing_avatar
    };

    match repo.upsert_avatar(&updated_avatar).await {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "message": "Custom avatar registered successfully",
            "asset_id": req.asset_id
        })),
        Err(e) => {
            log::error!("Failed to register custom avatar: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to register custom avatar"
            }))
        }
    }
}

/// Validate hex color format
fn validate_hex_color(color: &str) -> Result<(), String> {
    if !color.starts_with('#') {
        return Err("Color must start with #".to_string());
    }

    if color.len() != 7 {
        return Err("Color must be 7 characters (e.g., #FF0000)".to_string());
    }

    if !color[1..].chars().all(|c| c.is_ascii_hexdigit()) {
        return Err("Color must contain only hex digits (0-9, A-F)".to_string());
    }

    Ok(())
}
