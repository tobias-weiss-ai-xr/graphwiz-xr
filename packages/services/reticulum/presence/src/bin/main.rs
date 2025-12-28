#!/usr/bin/env rust_binary
//! Reticulum Presence Service Binary
//!
//! WebSocket presence server for real-time messaging

use reticulum_presence::PresenceService;
use reticulum_core::Config;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::init();

    // Load configuration
    let config = Config::load_or_default().unwrap_or_else(|e| {
        eprintln!("Failed to load configuration: {}", e);
        eprintln!("Using fallback configuration");
        // Create a minimal config
        Config {
            server: reticulum_core::config::ServerConfig {
                host: "0.0.0.0".to_string(),
                port: 8003,
                workers: Some(1),
            },
            database: reticulum_core::config::DatabaseConfig {
                url: "postgresql://localhost/graphwiz".to_string(),
                max_connections: Some(10),
                min_connections: Some(1),
            },
            auth: reticulum_core::config::AuthConfig {
                jwt_secret: "dev-secret-change-in-production".to_string(),
                jwt_expiration: 3600,
                refresh_expiration: 86400,
            },
            tracing: reticulum_core::config::TracingConfig {
                level: "info".to_string(),
                format: "pretty".to_string(),
            },
            redis: None,
        }
    });

    log::info!("Starting Reticulum Presence Service");
    log::info!("Server configuration:");
    log::info!("  Host: {}", config.server.host);
    log::info!("  Port: {}", config.server.port);
    log::info!("  Workers: {}", config.server.workers.unwrap_or(1));

    // Create and run the presence service
    let service = PresenceService::new(config);
    service.run().await
}
