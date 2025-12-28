//! Authentication for WebSocket connections

use actix_web::{web, HttpRequest};
use reticulum_core::{jwt::JwtManager, Result};
use std::sync::Arc;

/// Authentication context extracted from WebSocket connection
#[derive(Clone, Debug)]
pub struct WsAuthContext {
    pub user_id: String,
    pub client_id: String,
    pub room_id: String,
    pub display_name: Option<String>,
}

/// Validate authentication token from query parameters
pub fn validate_websocket_auth(
    req: &HttpRequest,
    jwt_manager: &Arc<JwtManager>,
) -> Result<WsAuthContext> {
    // Extract room_id from path
    let room_id = req.match_info().get("room_id").unwrap_or("").to_string();
    if room_id.is_empty() {
        return Err(reticulum_core::Error::BadRequest("room_id is required".to_string()));
    }

    // Extract query parameters
    let query = req.query::<std::collections::HashMap<String, String>>();
    let auth_token = query.get("auth_token").cloned();
    let user_id = query.get("user_id").cloned();
    let client_id = query.get("client_id").cloned();
    let display_name = query.get("display_name").cloned();

    // If auth_token is provided, validate it
    if let Some(token) = auth_token {
        if !token.is_empty() {
            let claims = jwt_manager.validate_access_token(&token)?;

            // Token is valid, extract user_id from claims
            let token_user_id = claims.sub;

            // Ensure user_id from token matches query param if provided
            if let Some(query_user_id) = &user_id {
                if query_user_id != &token_user_id {
                    return Err(reticulum_core::Error::Unauthorized(
                        "user_id does not match token".to_string(),
                    ));
                }
            }

            return Ok(WsAuthContext {
                user_id: token_user_id,
                client_id: client_id.unwrap_or_else(|| uuid::Uuid::new_v4().to_string()),
                room_id,
                display_name,
            });
        }
    }

    // If no token, check if user_id is provided (for testing/development)
    if let Some(uid) = user_id {
        if !uid.is_empty() {
            log::warn!("WebSocket connection without auth token (user_id: {})", uid);
            return Ok(WsAuthContext {
                user_id: uid.clone(),
                client_id: client_id.unwrap_or_else(|| uuid::Uuid::new_v4().to_string()),
                room_id,
                display_name,
            });
        }
    }

    // No authentication provided
    Err(reticulum_core::Error::Unauthorized(
        "Authentication required: provide auth_token or user_id".to_string(),
    ))
}

/// Extract and validate authentication from connection request
pub fn extract_auth_context(
    req: &HttpRequest,
    jwt_manager: &Arc<JwtManager>,
    require_auth: bool,
) -> Result<Option<WsAuthContext>> {
    match validate_websocket_auth(req, jwt_manager) {
        Ok(ctx) => Ok(Some(ctx)),
        Err(e) if !require_auth && matches!(e, reticulum_core::Error::Unauthorized(_)) => {
            // Auth not required and missing - allow anonymous connection for testing
            log::warn!("Allowing anonymous WebSocket connection (not recommended for production)");
            Ok(None)
        }
        Err(e) => Err(e),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_auth_context_creation() {
        let ctx = WsAuthContext {
            user_id: "user123".to_string(),
            client_id: "client456".to_string(),
            room_id: "room789".to_string(),
            display_name: Some("Test User".to_string()),
        };

        assert_eq!(ctx.user_id, "user123");
        assert_eq!(ctx.client_id, "client456");
        assert_eq!(ctx.room_id, "room789");
        assert_eq!(ctx.display_name, Some("Test User".to_string()));
    }
}
