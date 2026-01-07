//! JWT authentication middleware for storage service
//!
//! This middleware validates JWT tokens and extracts user ID for authorization.

use actix_web::{
    dev::{ServiceRequest, ServiceResponse, Transform},
    error::{ErrorUnauthorized, Error},
    FromRequest, HttpMessage, HttpResponse,
};
use futures_util::future::{ok, Ready};
use jsonwebtoken::{decode, Validation, DecodingKey};
use std::future::ready;
use std::sync::Arc;
use std::task::{Context, Poll};
use uuid::Uuid;

use reticulum_core::Config;

/// Claims extracted from JWT token
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
struct JwtClaims {
    sub: String,       // User ID
    email: String,
    exp: usize,       // Expiration time
    iat: usize,       // Issued at time
}

/// JWT authentication middleware
///
/// Validates JWT tokens from Authorization header and injects user ID into request extensions.
pub struct JwtAuth {
    config: Arc<Config>,
}

impl JwtAuth {
    pub fn new(config: Arc<Config>) -> Self {
        Self { config }
    }
}

impl<S, B> Transform<S, ServiceRequest> for JwtAuth
where
    S: actix_web::Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = JwtAuthMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(JwtAuthMiddleware {
            service,
            config: self.config.clone(),
        })
    }
}

pub struct JwtAuthMiddleware<S> {
    service: S,
    config: Arc<Config>,
}

impl<S, B> actix_web::Service<ServiceRequest> for JwtAuthMiddleware<S>
where
    S: actix_web::Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = std::pin::Pin<
        Box<dyn std::future::Future<Output = Result<Self::Response, Self::Error>> + 'static>,
    >;

    fn poll_ready(
        &self,
        cx: &mut Context<'_>,
    ) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        // Extract Authorization header
        let auth_header = req
            .headers()
            .get("Authorization")
            .and_then(|h| h.to_str().ok());

        if let Some(auth_header) = auth_header {
            // Check for Bearer token format
            if let Some(token) = auth_header.strip_prefix("Bearer ") {
                // Validate JWT token
                match validate_jwt_token(&self.config, token) {
                    Ok(claims) => {
                        // Extract user_id from claims and store in request extensions
                        match Uuid::parse_str(&claims.sub) {
                            Ok(user_id) => {
                                log::debug!(
                                    "JwtAuth: Authenticated user_id = {:?} for {}",
                                    user_id,
                                    req.path()
                                );
                                req.extensions_mut().insert(user_id);

                                let fut = self.service.call(req);
                                Box::pin(async move {
                                    let res = fut.await?;
                                    Ok(res)
                                })
                            }
                            Err(e) => {
                                log::error!("Invalid user_id in JWT: {}", e);
                                let unauthorized_response = HttpResponse::Unauthorized().json(serde_json::json!({
                                    "error": "invalid_token",
                                    "message": "Invalid user ID in token"
                                }));
                                Box::pin(async move { Ok(unauthorized_response.into_response<B>()) })
                            }
                        }
                    }
                    Err(e) => {
                        log::warn!("JWT validation failed: {}", e);
                        let unauthorized_response = HttpResponse::Unauthorized().json(serde_json::json!({
                            "error": "invalid_token",
                            "message": "Invalid or expired JWT token"
                        }));
                        Box::pin(async move { Ok(unauthorized_response.into_response<B>()) })
                    }
                }
            } else {
                log::warn!("Invalid authorization header format");
                let unauthorized_response = HttpResponse::Unauthorized().json(serde_json::json!({
                    "error": "invalid_auth_format",
                    "message": "Authorization header must be 'Bearer <token>'"
                }));
                Box::pin(async move { Ok(unauthorized_response.into_response<B>()) })
            }
        } else {
            log::warn!("Missing authorization header");
            let unauthorized_response = HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "missing_auth",
                "message": "Authorization header required"
            }));
            Box::pin(async move { Ok(unauthorized_response.into_response<B>()) })
        }
    }
}

/// Validate JWT token and return claims
fn validate_jwt_token(config: &Config, token: &str) -> Result<JwtClaims, String> {
    decode::<JwtClaims>(
        token,
        &DecodingKey::from_secret(config.auth.jwt_secret.as_ref()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|e| format!("JWT validation failed: {}", e))
}
