//! Configuration management for Reticulum services

use config::{Config as ConfigImpl, Environment, File};
use serde::Deserialize;
use std::path::Path;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub server: ServerConfig,
    pub database: DatabaseConfig,
    pub auth: AuthConfig,
    pub tracing: TracingConfig,
    #[serde(default)]
    pub redis: Option<RedisConfig>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub workers: Option<usize>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct DatabaseConfig {
    pub url: String,
    pub max_connections: Option<u32>,
    pub min_connections: Option<u32>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct AuthConfig {
    pub jwt_secret: String,
    pub jwt_expiration: u64, // in seconds
    pub refresh_expiration: u64, // in seconds
}

#[derive(Debug, Deserialize, Clone)]
pub struct TracingConfig {
    pub level: String,
    pub format: String, // "json" or "pretty"
}

#[derive(Debug, Deserialize, Clone)]
pub struct RedisConfig {
    pub url: String,
    pub max_connections: Option<u32>,
}

impl Config {
    /// Load configuration from file and environment variables
    pub fn load<P: AsRef<Path>>(path: P) -> Result<Self, config::ConfigError> {
        let config = ConfigImpl::builder()
            .add_source(File::from(path.as_ref()))
            .add_source(Environment::with_prefix("RETICULUM").separator("__"))
            .build()?;

        config.try_deserialize()
    }

    /// Load from default locations or use defaults
    pub fn load_or_default() -> Result<Self, config::ConfigError> {
        let config = ConfigImpl::builder()
            .add_source(File::with_name("config/reticulum").required(false))
            .add_source(Environment::with_prefix("RETICULUM").separator("__"))
            .build()?;

        let mut cfg: Config = config.try_deserialize().unwrap_or_else(|_| Config {
            server: ServerConfig {
                host: "0.0.0.0".to_string(),
                port: 8003,
                workers: None,
            },
            database: DatabaseConfig {
                url: "postgresql://postgres:postgres@localhost/reticulum".to_string(),
                max_connections: Some(10),
                min_connections: Some(1),
            },
            auth: AuthConfig {
                jwt_secret: "change-me-in-production".to_string(),
                jwt_expiration: 3600, // 1 hour
                refresh_expiration: 2592000, // 30 days
            },
            tracing: TracingConfig {
                level: "info".to_string(),
                format: "pretty".to_string(),
            },
            redis: None,
        });

        // Override with environment variables if present
        if let Ok(url) = std::env::var("DATABASE_URL") {
            cfg.database.url = url;
        }
        if let Ok(secret) = std::env::var("JWT_SECRET") {
            cfg.auth.jwt_secret = secret;
        }

        Ok(cfg)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = Config::load_or_default().unwrap();
        assert_eq!(config.server.host, "0.0.0.0");
        assert_eq!(config.server.port, 4000);
        assert_eq!(config.auth.jwt_expiration, 3600);
    }
}
