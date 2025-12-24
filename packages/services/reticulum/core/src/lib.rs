//! Reticulum Core Service
//!
//! Shared utilities, database models, and configuration for all Reticulum services.

pub mod config;
pub mod db;
pub mod error;
pub mod models;
pub mod middleware;

pub use config::Config;
pub use error::{Error, Result};
pub use sea_orm::DatabaseConnection;
