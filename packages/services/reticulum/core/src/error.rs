//! Core error types for Reticulum services

use actix_web::{error::ResponseError, http::StatusCode, HttpResponse};
use sea_orm::DbErr;
use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Database error: {0}")]
    Database(#[from] DbErr),

    #[error("Authentication error: {0}")]
    Auth(String),

    #[error("Authorization error: {0}")]
    Authorization(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Internal error: {0}")]
    Internal(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
}

impl Error {
    pub fn auth(msg: impl Into<String>) -> Self {
        Error::Auth(msg.into())
    }

    pub fn authorization(msg: impl Into<String>) -> Self {
        Error::Authorization(msg.into())
    }

    pub fn validation(msg: impl Into<String>) -> Self {
        Error::Validation(msg.into())
    }

    pub fn not_found(msg: impl Into<String>) -> Self {
        Error::NotFound(msg.into())
    }

    pub fn internal(msg: impl Into<String>) -> Self {
        Error::Internal(msg.into())
    }
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    details: Option<serde_json::Value>,
}

impl ResponseError for Error {
    fn error_response(&self) -> HttpResponse {
        let (status, error_type, message): (StatusCode, &'static str, String) = match self {
            Error::Database(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "database_error",
                "A database error occurred".to_string(),
            ),
            Error::Auth(msg) => (StatusCode::UNAUTHORIZED, "auth_error", msg.clone()),
            Error::Authorization(msg) => (StatusCode::FORBIDDEN, "authorization_error", msg.clone()),
            Error::Validation(msg) => (StatusCode::BAD_REQUEST, "validation_error", msg.clone()),
            Error::NotFound(msg) => (StatusCode::NOT_FOUND, "not_found", msg.clone()),
            Error::Internal(msg) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "internal_error",
                msg.clone(),
            ),
            Error::Serialization(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "serialization_error",
                "Failed to serialize data".to_string(),
            ),
        };

        HttpResponse::build(status).json(ErrorResponse {
            error: error_type.to_owned(),
            message,
            details: None,
        })
    }
}

pub type Result<T> = std::result::Result<T, Error>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_creation() {
        let err = Error::auth("Invalid credentials");
        assert!(matches!(err, Error::Auth(_)));

        let err = Error::not_found("User not found");
        assert!(matches!(err, Error::NotFound(_)));
    }
}
