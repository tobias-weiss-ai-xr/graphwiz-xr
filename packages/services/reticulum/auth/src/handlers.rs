//! HTTP request handlers

use actix_web::{web, HttpRequest, HttpResponse};
use serde_json::json;
use validator::Validate;

use reticulum_core::{Config, Result};
use reticulum_core::{db, models as core_models};

use crate::jwt::{generate_access_token, generate_refresh_token, hash_password, verify_password};
use crate::models::{AuthResponse, LoginRequest, RegisterRequest, UserInfo};

/// Register a new user
pub async fn register(
    config: web::Data<Config>,
    req: web::Json<RegisterRequest>,
) -> HttpResponse {
    // Validate request
    if let Err(errors) = req.validate() {
        return HttpResponse::BadRequest().json(json!({
            "error": "validation_error",
            "message": errors.to_string()
        }));
    }

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

    // Check if user already exists
    match core_models::UserModel::find_by_email(&db, &req.email).await {
        Ok(Some(_)) => {
            return HttpResponse::Conflict().json(json!({
                "error": "user_exists",
                "message": "User with this email already exists"
            }));
        }
        Ok(None) => {}
        Err(e) => {
            log::error!("Failed to check existing user: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to process registration"
            }));
        }
    }

    // Hash password
    let password_hash = match hash_password(&req.password) {
        Ok(hash) => hash,
        Err(e) => {
            log::error!("Failed to hash password: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to process password"
            }));
        }
    };

    // Create user
    let user = match core_models::UserModel::create(
        &db,
        req.display_name.clone(),
        req.email.clone(),
        password_hash,
    )
    .await
    {
        Ok(user) => user,
        Err(e) => {
            log::error!("Failed to create user: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to create user"
            }));
        }
    };

    // Generate tokens
    let user_info = UserInfo {
        id: user.id,
        display_name: user.display_name,
        email: user.email,
        avatar_url: user.avatar_url,
    };

    let access_token = match generate_access_token(&config, &user_info) {
        Ok(token) => token,
        Err(e) => {
            log::error!("Failed to generate access token: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to generate access token"
            }));
        }
    };

    let refresh_token = match generate_refresh_token(&config, &user_info) {
        Ok(token) => token,
        Err(e) => {
            log::error!("Failed to generate refresh token: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to generate refresh token"
            }));
        }
    };

    let response = AuthResponse {
        access_token,
        refresh_token,
        expires_in: config.auth.jwt_expiration,
        user: user_info,
    };

    HttpResponse::Created().json(response)
}

/// Login with email and password
pub async fn login(
    config: web::Data<Config>,
    req: web::Json<LoginRequest>,
) -> HttpResponse {
    // Validate request
    if let Err(errors) = req.validate() {
        return HttpResponse::BadRequest().json(json!({
            "error": "validation_error",
            "message": errors.to_string()
        }));
    }

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

    // Find user by email
    let user_with_hash = match core_models::Entity::find()
        .filter(reticulum_core::models::users::Column::Email.eq(&req.email))
        .filter(reticulum_core::models::users::Column::IsActive.eq(true))
        .one(&db)
        .await
    {
        Ok(Some(user)) => user,
        Ok(None) => {
            return HttpResponse::Unauthorized().json(json!({
                "error": "auth_error",
                "message": "Invalid email or password"
            }));
        }
        Err(e) => {
            log::error!("Failed to find user: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to process login"
            }));
        }
    };

    // Verify password
    if verify_password(&req.password, &user_with_hash.password_hash).is_err() {
        return HttpResponse::Unauthorized().json(json!({
            "error": "auth_error",
            "message": "Invalid email or password"
        }));
    }

    // Generate tokens
    let user_info = UserInfo {
        id: user_with_hash.id,
        display_name: user_with_hash.display_name.clone(),
        email: user_with_hash.email.clone(),
        avatar_url: user_with_hash.avatar_url.clone(),
    };

    let access_token = match generate_access_token(&config, &user_info) {
        Ok(token) => token,
        Err(e) => {
            log::error!("Failed to generate access token: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to generate access token"
            }));
        }
    };

    let refresh_token = match generate_refresh_token(&config, &user_info) {
        Ok(token) => token,
        Err(e) => {
            log::error!("Failed to generate refresh token: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to generate refresh token"
            }));
        }
    };

    let response = AuthResponse {
        access_token,
        refresh_token,
        expires_in: config.auth.jwt_expiration,
        user: user_info,
    };

    HttpResponse::Ok().json(response)
}

/// Get current user info from JWT token
pub async fn me(req: HttpRequest) -> HttpResponse {
    // In a real implementation, this would extract the user from the JWT token
    // that was validated in middleware
    HttpResponse::Ok().json(json!({
        "message": "User info endpoint - requires auth middleware"
    }))
}

/// Health check for auth service
pub async fn health() -> HttpResponse {
    HttpResponse::Ok().json(json!({
        "status": "healthy",
        "service": "reticulum-auth"
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    // Note: These would typically be integration tests with a test database
}
