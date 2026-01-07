//! Reticulum Core Service
//!
//! Shared utilities, database models, and configuration for all Reticulum services.

pub mod auth;
pub mod config;
pub mod db;
pub mod error;
pub mod jwt;
pub mod log_store;
pub mod middleware;
pub mod models;

pub use auth::{hash_password, verify_password, validate_password_strength, PasswordHasherWrapper};
pub use config::Config;
pub use error::{Error, Result};
pub use jwt::{Claims, JwtManager, TokenPair, TokenType};
pub use log_store::{add_log, get_log_store, LogEntry, LogLevel, LogStore, LogsQuery, LogsResponse};
pub use middleware::{AuthUser, OptionalAuthUser};
pub use models::{OAuthProvider};
pub use sea_orm::DatabaseConnection;
