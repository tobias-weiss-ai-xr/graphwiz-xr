//! HTTP middleware

use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    error::ErrorUnauthorized,
    Error, FromRequest, HttpMessage, HttpResponse,
};
use futures_util::future::LocalBoxFuture;
use std::future::{ready, Ready};
use std::sync::Arc;
use uuid::Uuid;

use crate::jwt::{Claims, JwtManager, TokenType};

/// Logging middleware - logs all requests
pub struct LoggingMiddleware;

impl<S, B> Transform<S, ServiceRequest> for LoggingMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = LoggingMiddlewareService<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(LoggingMiddlewareService { service }))
    }
}

pub struct LoggingMiddlewareService<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for LoggingMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let start = std::time::Instant::now();
        let path = req.path().to_string();
        let method = req.method().to_string();

        let fut = self.service.call(req);

        Box::pin(async move {
            let res = fut.await?;
            let duration = start.elapsed();

            log::info!(
                "{} {} {} - {:?}",
                method,
                path,
                res.status(),
                duration
            );

            Ok(res)
        })
    }
}

/// Health check endpoint
pub async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "reticulum",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

/// Authentication middleware
pub struct AuthMiddleware {
    jwt_manager: Arc<JwtManager>,
}

impl AuthMiddleware {
    pub fn new(jwt_manager: Arc<JwtManager>) -> Self {
        Self { jwt_manager }
    }
}

impl<S, B> Transform<S, ServiceRequest> for AuthMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = AuthMiddlewareService<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(AuthMiddlewareService {
            service,
            jwt_manager: self.jwt_manager.clone(),
        }))
    }
}

pub struct AuthMiddlewareService<S> {
    service: S,
    jwt_manager: Arc<JwtManager>,
}

impl<S, B> Service<ServiceRequest> for AuthMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let jwt_manager = self.jwt_manager.clone();

        Box::pin(async move {
            // Extract token from Authorization header
            let auth_header = req
                .headers()
                .get("Authorization")
                .and_then(|h| h.to_str().ok());

            if let Some(auth_header) = auth_header {
                if let Some(token) = auth_header.strip_prefix("Bearer ") {
                    match jwt_manager.validate_access_token(token) {
                        Ok(claims) => {
                            // Extract user_id from claims and store in request extensions
                            if let Ok(user_id) = Uuid::parse_str(&claims.sub) {
                                req.extensions_mut().insert(AuthUser {
                                    id: user_id,
                                    token_type: claims.token_type,
                                });
                            }
                        }
                        Err(_) => {
                            return Err(ErrorUnauthorized("Invalid or expired token").into());
                        }
                    }
                } else {
                    return Err(ErrorUnauthorized("Invalid authorization header format").into());
                }
            } else {
                return Err(ErrorUnauthorized("Missing authorization header").into());
            }

            self.service.call(req).await
        })
    }
}

/// Optional authentication middleware
/// Attaches user info if token is present, but doesn't reject if missing
pub struct OptionalAuthMiddleware {
    jwt_manager: Arc<JwtManager>,
}

impl OptionalAuthMiddleware {
    pub fn new(jwt_manager: Arc<JwtManager>) -> Self {
        Self { jwt_manager }
    }
}

impl<S, B> Transform<S, ServiceRequest> for OptionalAuthMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = OptionalAuthMiddlewareService<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(OptionalAuthMiddlewareService {
            service,
            jwt_manager: self.jwt_manager.clone(),
        }))
    }
}

pub struct OptionalAuthMiddlewareService<S> {
    service: S,
    jwt_manager: Arc<JwtManager>,
}

impl<S, B> Service<ServiceRequest> for OptionalAuthMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let jwt_manager = self.jwt_manager.clone();

        Box::pin(async move {
            // Try to extract token from Authorization header
            let auth_header = req
                .headers()
                .get("Authorization")
                .and_then(|h| h.to_str().ok());

            if let Some(auth_header) = auth_header {
                if let Some(token) = auth_header.strip_prefix("Bearer ") {
                    if let Ok(claims) = jwt_manager.validate_access_token(token) {
                        if let Ok(user_id) = Uuid::parse_str(&claims.sub) {
                            req.extensions_mut().insert(AuthUser {
                                id: user_id,
                                token_type: claims.token_type,
                            });
                        }
                    }
                    // If token is invalid, just continue without user info
                }
            }

            self.service.call(req).await
        })
    }
}

/// Authenticated user information extracted from JWT token
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub id: Uuid,
    pub token_type: TokenType,
}

impl FromRequest for AuthUser {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        ready(
            req.extensions()
                .get::<AuthUser>()
                .cloned()
                .ok_or_else(|| Error::auth("User not authenticated")),
        )
    }
}

/// Optional authenticated user - returns None if not authenticated
pub struct OptionalAuthUser(pub Option<AuthUser>);

impl FromRequest for OptionalAuthUser {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        ready(Ok(OptionalAuthUser(req.extensions().get::<AuthUser>().cloned())))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_auth_user_struct() {
        let user_id = Uuid::new_v4();
        let auth_user = AuthUser {
            id: user_id,
            token_type: TokenType::Access,
        };

        assert_eq!(auth_user.id, user_id);
        assert_eq!(auth_user.token_type, TokenType::Access);
    }
}
