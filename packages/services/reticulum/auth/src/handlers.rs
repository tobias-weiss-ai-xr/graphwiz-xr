//! HTTP request handlers

use actix_web::{web, HttpRequest, HttpResponse};
use serde_json::json;
use validator::Validate;

use reticulum_core::Config;
use reticulum_core::{db, models as core_models};

use crate::jwt::{generate_access_token, generate_refresh_token, hash_password, verify_password};
use crate::magic_link::{MagicLinkManager, MagicLinkRequest, MagicLinkResponse};
use crate::models::{AuthResponse, LoginRequest, RegisterRequest, UserInfo};
use crate::oauth::{self, OAuthManager, OAuthProvider, OAuthError};

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

    // Create session in Redis (optional - if Redis is configured)
    let session_id = if let Some(redis_config) = &config.redis {
        match crate::session::SessionManager::from_url(&redis_config.url).await {
            Ok(mut manager) => {
                match manager.create_session(user_info.clone()).await {
                    Ok(session) => session.id,
                    Err(e) => {
                        log::warn!("Failed to create session: {:?}", e);
                        // Continue without session
                        String::new()
                    }
                }
            }
            Err(e) => {
                log::warn!("Failed to connect to Redis: {:?}", e);
                // Continue without session
                String::new()
            }
        }
    } else {
        String::new()
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
        session_id,
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

    // Find user by email - need Model for password hash
    let user_record = match core_models::users::UserModel::find_by_email_with_hash(&db, &req.email).await {
        Ok(Some(record)) => record,
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
    if verify_password(&req.password, &user_record.password_hash).is_err() {
        return HttpResponse::Unauthorized().json(json!({
            "error": "auth_error",
            "message": "Invalid email or password"
        }));
    }

    // Convert to User model (without password hash)
    let user: core_models::users::User = user_record.into();

    // Generate tokens
    let user_info = UserInfo {
        id: user.id,
        display_name: user.display_name.clone(),
        email: user.email.clone(),
        avatar_url: user.avatar_url.clone(),
    };

    // Create session in Redis (optional - if Redis is configured)
    let session_id = if let Some(redis_config) = &config.redis {
        match crate::session::SessionManager::from_url(&redis_config.url).await {
            Ok(mut manager) => {
                match manager.create_session(user_info.clone()).await {
                    Ok(session) => session.id,
                    Err(e) => {
                        log::warn!("Failed to create session: {:?}", e);
                        // Continue without session
                        String::new()
                    }
                }
            }
            Err(e) => {
                log::warn!("Failed to connect to Redis: {:?}", e);
                // Continue without session
                String::new()
            }
        }
    } else {
        String::new()
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
        session_id,
    };

    HttpResponse::Ok().json(response)
}

/// Get current user info from JWT token
pub async fn me(_req: HttpRequest) -> HttpResponse {
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

// ============================================================================
// OAuth Handlers
// ============================================================================

/// Get OAuth authorization URL for the given provider
///
/// Query parameters:
/// - provider: github, google, or discord
/// - redirect_uri: optional custom redirect URI
pub async fn get_oauth_url(
    config: web::Data<Config>,
    query: web::Query<serde_json::Value>,
) -> HttpResponse {
    // Extract provider from query
    let provider_str = match query.get("provider").and_then(|p| p.as_str()) {
        Some(p) => p,
        None => {
            return HttpResponse::BadRequest().json(json!({
                "error": "validation_error",
                "message": "Missing 'provider' query parameter"
            }));
        }
    };

    let provider = match OAuthProvider::from_str(provider_str) {
        Some(p) => p,
        None => {
            return HttpResponse::BadRequest().json(json!({
                "error": "validation_error",
                "message": format!("Invalid provider: {}", provider_str)
            }));
        }
    };

    // Create OAuth manager
    let oauth_manager = match OAuthManager::new(provider) {
        Ok(manager) => manager,
        Err(OAuthError::MissingClientId(_)) => {
            log::warn!("OAuth not configured for provider: {:?}", provider);
            return HttpResponse::BadRequest().json(json!({
                "error": "config_error",
                "message": format!("OAuth authentication is not configured for {}", provider_str)
            }));
        }
        Err(OAuthError::MissingClientSecret(_)) => {
            log::warn!("OAuth not configured for provider: {:?}", provider);
            return HttpResponse::BadRequest().json(json!({
                "error": "config_error",
                "message": format!("OAuth authentication is not configured for {}", provider_str)
            }));
        }
        Err(e) => {
            log::error!("Failed to create OAuth manager: {:?}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to initialize OAuth"
            }));
        }
    };

    // Generate authorization URL and state token
    let (auth_url, state) = oauth_manager.get_authorization_url();

    HttpResponse::Ok().json(json!({
        "url": auth_url,
        "state": state,
        "provider": provider_str
    }))
}

/// Handle OAuth callback from provider
///
/// Query parameters:
/// - provider: github, google, or discord
/// - code: authorization code from provider
/// - state: CSRF state token
/// - redirect_uri: optional custom redirect URI
pub async fn oauth_callback(
    config: web::Data<Config>,
    query: web::Query<serde_json::Value>,
) -> HttpResponse {
    // Extract provider from query
    let provider_str = match query.get("provider").and_then(|p| p.as_str()) {
        Some(p) => p,
        None => {
            return HttpResponse::BadRequest().json(json!({
                "error": "validation_error",
                "message": "Missing 'provider' query parameter"
            }));
        }
    };

    let provider = match OAuthProvider::from_str(provider_str) {
        Some(p) => p,
        None => {
            return HttpResponse::BadRequest().json(json!({
                "error": "validation_error",
                "message": format!("Invalid provider: {}", provider_str)
            }));
        }
    };

    // Extract authorization code
    let code = match query.get("code").and_then(|c| c.as_str()) {
        Some(c) => c,
        None => {
            return HttpResponse::BadRequest().json(json!({
                "error": "validation_error",
                "message": "Missing 'code' query parameter"
            }));
        }
    };

    // Create OAuth manager
    let oauth_manager = match OAuthManager::new(provider) {
        Ok(manager) => manager,
        Err(e) => {
            log::error!("Failed to create OAuth manager: {:?}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to initialize OAuth"
            }));
        }
    };

    // Exchange code for user info
    let user_info = match oauth_manager.exchange_code(code.to_string()).await {
        Ok(info) => info,
        Err(OAuthError::TokenExchangeFailed(msg)) => {
            log::error!("Token exchange failed: {}", msg);
            return HttpResponse::BadRequest().json(json!({
                "error": "oauth_error",
                "message": "Failed to exchange authorization code"
            }));
        }
        Err(OAuthError::UserInfoFailed(msg)) => {
            log::error!("Failed to fetch user info: {}", msg);
            return HttpResponse::BadRequest().json(json!({
                "error": "oauth_error",
                "message": "Failed to fetch user information"
            }));
        }
        Err(e) => {
            log::error!("OAuth error: {:?}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "OAuth authentication failed"
            }));
        }
    };

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

    // Link or create user from OAuth account
    let user = match oauth::link_or_create_user(&db, provider, user_info).await {
        Ok(user) => user,
        Err(e) => {
            log::error!("Failed to link/create user: {:?}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to create user account"
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

    // Create session in Redis (optional - if Redis is configured)
    let session_id = if let Some(redis_config) = &config.redis {
        match crate::session::SessionManager::from_url(&redis_config.url).await {
            Ok(mut manager) => {
                match manager.create_session(user_info.clone()).await {
                    Ok(session) => session.id,
                    Err(e) => {
                        log::warn!("Failed to create session: {:?}", e);
                        // Continue without session
                        String::new()
                    }
                }
            }
            Err(e) => {
                log::warn!("Failed to connect to Redis: {:?}", e);
                // Continue without session
                String::new()
            }
        }
    } else {
        String::new()
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
        session_id,
    };

    HttpResponse::Ok().json(response)
}

// ============================================================================
// Magic Link Handlers
// ============================================================================

/// Send a magic link authentication email
pub async fn send_magic_link(
    config: web::Data<Config>,
    req: web::Json<MagicLinkRequest>,
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

    // Create magic link manager
    let manager = MagicLinkManager::new(db);

    // Send magic link
    match manager.send_magic_link(req.into_inner()).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        }
        Err(e) => {
            log::error!("Failed to send magic link: {:?}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to send magic link"
            }))
        }
    }
}

/// Verify a magic link token and authenticate
pub async fn verify_magic_link(
    config: web::Data<Config>,
    req: web::Json<serde_json::Value>,
) -> HttpResponse {
    // Extract token from request
    let token = match req.get("token").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => {
            return HttpResponse::BadRequest().json(json!({
                "error": "validation_error",
                "message": "Missing 'token' field"
            }));
        }
    };

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

    // Create magic link manager
    let manager = MagicLinkManager::new(db);

    // Verify magic link
    // Note: This is not fully implemented yet in the magic_link module
    // You'll need to complete the database integration
    match manager.verify_magic_link(token).await {
        Ok(user) => {
            // Generate tokens
            let user_info = UserInfo {
                id: user.id,
                display_name: user.display_name,
                email: user.email,
                avatar_url: user.avatar_url,
            };

            // Create session in Redis (optional - if Redis is configured)
            let session_id = if let Some(redis_config) = &config.redis {
                match crate::session::SessionManager::from_url(&redis_config.url).await {
                    Ok(mut manager) => {
                        match manager.create_session(user_info.clone()).await {
                            Ok(session) => session.id,
                            Err(e) => {
                                log::warn!("Failed to create session: {:?}", e);
                                // Continue without session
                                String::new()
                            }
                        }
                    }
                    Err(e) => {
                        log::warn!("Failed to connect to Redis: {:?}", e);
                        // Continue without session
                        String::new()
                    }
                }
            } else {
                String::new()
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
                session_id,
            };

            HttpResponse::Ok().json(response)
        }
        Err(e) => {
            log::error!("Failed to verify magic link: {:?}", e);
            HttpResponse::BadRequest().json(json!({
                "error": "invalid_token",
                "message": "Magic link is invalid or has expired"
            }))
        }
    }
}

#[cfg(test)]
mod tests {
    // Note: These would typically be integration tests with a test database
}

// ============================================================================
// Session Management Handlers
// ============================================================================

/// Validate a session and return user info
pub async fn validate_session(
    config: web::Data<Config>,
    req: web::Json<serde_json::Value>,
) -> HttpResponse {
    // Extract session_id from request
    let session_id = match req.get("session_id").and_then(|s| s.as_str()) {
        Some(s) => s,
        None => {
            return HttpResponse::BadRequest().json(json!({
                "error": "validation_error",
                "message": "Missing 'session_id' field"
            }));
        }
    };

    // Get Redis URL from config
    let redis_url = match &config.redis {
        Some(redis) => redis.url.clone(),
        None => {
            log::warn!("Redis not configured, session validation will fail");
            return HttpResponse::InternalServerError().json(json!({
                "error": "config_error",
                "message": "Session management not configured"
            }));
        }
    };

    // Create session manager and validate session
    match crate::session::SessionManager::from_url(&redis_url).await {
        Ok(mut manager) => {
            match manager.get_session(session_id).await {
                Ok(session) => {
                    let user_info = UserInfo::from(session);
                    HttpResponse::Ok().json(user_info)
                }
                Err(crate::session::SessionError::NotFound) => {
                    HttpResponse::Unauthorized().json(json!({
                        "error": "invalid_session",
                        "message": "Session not found"
                    }))
                }
                Err(crate::session::SessionError::Expired) => {
                    HttpResponse::Unauthorized().json(json!({
                        "error": "session_expired",
                        "message": "Session has expired"
                    }))
                }
                Err(e) => {
                    log::error!("Session validation error: {:?}", e);
                    HttpResponse::InternalServerError().json(json!({
                        "error": "internal_error",
                        "message": "Failed to validate session"
                    }))
                }
            }
        }
        Err(e) => {
            log::error!("Failed to connect to Redis: {:?}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to connect to session store"
            }))
        }
    }
}

/// Refresh a session (extend TTL)
pub async fn refresh_session(
    config: web::Data<Config>,
    req: web::Json<serde_json::Value>,
) -> HttpResponse {
    // Extract session_id from request
    let session_id = match req.get("session_id").and_then(|s| s.as_str()) {
        Some(s) => s,
        None => {
            return HttpResponse::BadRequest().json(json!({
                "error": "validation_error",
                "message": "Missing 'session_id' field"
            }));
        }
    };

    // Get Redis URL from config
    let redis_url = match &config.redis {
        Some(redis) => redis.url.clone(),
        None => {
            return HttpResponse::InternalServerError().json(json!({
                "error": "config_error",
                "message": "Session management not configured"
            }));
        }
    };

    // Create session manager and refresh session
    match crate::session::SessionManager::from_url(&redis_url).await {
        Ok(mut manager) => {
            match manager.refresh_session(session_id).await {
                Ok(session) => {
                    HttpResponse::Ok().json(json!({
                        "session_id": session.id,
                        "expires_at": session.expires_at,
                        "message": "Session refreshed"
                    }))
                }
                Err(crate::session::SessionError::NotFound) => {
                    HttpResponse::Unauthorized().json(json!({
                        "error": "invalid_session",
                        "message": "Session not found"
                    }))
                }
                Err(e) => {
                    log::error!("Session refresh error: {:?}", e);
                    HttpResponse::InternalServerError().json(json!({
                        "error": "internal_error",
                        "message": "Failed to refresh session"
                    }))
                }
            }
        }
        Err(e) => {
            log::error!("Failed to connect to Redis: {:?}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to connect to session store"
            }))
        }
    }
}

/// Logout (revoke a session)
pub async fn logout(
    config: web::Data<Config>,
    req: web::Json<serde_json::Value>,
) -> HttpResponse {
    // Extract session_id from request
    let session_id = match req.get("session_id").and_then(|s| s.as_str()) {
        Some(s) => s,
        None => {
            return HttpResponse::BadRequest().json(json!({
                "error": "validation_error",
                "message": "Missing 'session_id' field"
            }));
        }
    };

    // Get Redis URL from config
    let redis_url = match &config.redis {
        Some(redis) => redis.url.clone(),
        None => {
            return HttpResponse::InternalServerError().json(json!({
                "error": "config_error",
                "message": "Session management not configured"
            }));
        }
    };

    // Create session manager and revoke session
    match crate::session::SessionManager::from_url(&redis_url).await {
        Ok(mut manager) => {
            match manager.revoke_session(session_id).await {
                Ok(_) => {
                    HttpResponse::Ok().json(json!({
                        "message": "Logged out successfully"
                    }))
                }
                Err(e) => {
                    log::error!("Session revocation error: {:?}", e);
                    HttpResponse::InternalServerError().json(json!({
                        "error": "internal_error",
                        "message": "Failed to logout"
                    }))
                }
            }
        }
        Err(e) => {
            log::error!("Failed to connect to Redis: {:?}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to connect to session store"
            }))
        }
    }
}

/// Logout from all devices (revoke all sessions for user)
pub async fn logout_all(
    config: web::Data<Config>,
    req: web::Json<serde_json::Value>,
) -> HttpResponse {
    // Extract user_id from request
    let user_id = match req.get("user_id") {
        Some(id) => id.as_i64(),
        None => {
            return HttpResponse::BadRequest().json(json!({
                "error": "validation_error",
                "message": "Missing 'user_id' field"
            }));
        }
    };

    let user_id = match user_id {
        Some(id) if id >= i32::MIN as i64 && id <= i32::MAX as i64 => id as i32,
        _ => {
            return HttpResponse::BadRequest().json(json!({
                "error": "validation_error",
                "message": "Invalid 'user_id'"
            }));
        }
    };

    // Get Redis URL from config
    let redis_url = match &config.redis {
        Some(redis) => redis.url.clone(),
        None => {
            return HttpResponse::InternalServerError().json(json!({
                "error": "config_error",
                "message": "Session management not configured"
            }));
        }
    };

    // Create session manager and revoke all sessions
    match crate::session::SessionManager::from_url(&redis_url).await {
        Ok(mut manager) => {
            match manager.revoke_user_sessions(user_id).await {
                Ok(count) => {
                    HttpResponse::Ok().json(json!({
                        "message": "Logged out from all devices",
                        "sessions_revoked": count
                    }))
                }
                Err(e) => {
                    log::error!("Session revocation error: {:?}", e);
                    HttpResponse::InternalServerError().json(json!({
                        "error": "internal_error",
                        "message": "Failed to logout from all devices"
                    }))
                }
            }
        }
        Err(e) => {
            log::error!("Failed to connect to Redis: {:?}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to connect to session store"
            }))
        }
    }
}
