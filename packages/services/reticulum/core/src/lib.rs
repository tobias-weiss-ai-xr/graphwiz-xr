//! Reticulum Core Service
//!
//! Shared utilities, database models, and configuration for all Reticulum services.

pub mod auth;
pub mod config;
pub mod db;
pub mod error;
pub mod jwt;
pub mod middleware;
pub mod models;

pub use auth::{hash_password, verify_password, PasswordHasher, validate_password_strength};
pub use config::Config;
pub use error::{Error, Result};
pub use jwt::{Claims, JwtManager, TokenPair, TokenType};
pub use middleware::{AuthUser, OptionalAuthUser};
pub use sea_orm::DatabaseConnection;
