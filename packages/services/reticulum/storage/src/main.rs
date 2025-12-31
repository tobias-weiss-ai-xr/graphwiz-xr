//! Storage service binary

use reticulum_core::Config;
use reticulum_storage::StorageService;
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::init();

    // Get server configuration from environment
    let host = env::var("SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = env::var("SERVER_PORT")
        .ok()
        .and_then(|p| p.parse::<u16>().ok())
        .unwrap_or(8005);
    let workers = env::var("SERVER_WORKERS")
        .ok()
        .and_then(|w| w.parse::<usize>().ok());

    // Get database URL from environment
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://postgres:postgres@localhost/graphwiz".to_string());

    // Get JWT config from environment
    let jwt_secret = env::var("JWT_SECRET")
        .unwrap_or_else(|_| "dev-secret-change-in-production".to_string());
    let jwt_expiration = env::var("JWT_EXPIRATION")
        .ok()
        .and_then(|e| e.parse::<u64>().ok())
        .unwrap_or(86400);

    // Get storage base path from environment
    let storage_base_path = env::var("STORAGE_BASE_PATH")
        .unwrap_or_else(|_| "./storage".to_string());

    // Create configuration
    let config = Config {
        server: reticulum_core::config::ServerConfig {
            host,
            port,
            workers,
        },
        database: reticulum_core::config::DatabaseConfig {
            url: database_url,
            max_connections: Some(10),
            min_connections: Some(1),
        },
        auth: reticulum_core::config::AuthConfig {
            jwt_secret,
            jwt_expiration,
            refresh_expiration: 2592000, // 30 days
        },
        tracing: reticulum_core::config::TracingConfig {
            level: env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string()),
            format: "pretty".to_string(),
        },
        redis: None,
    };

    log::info!("Starting Reticulum Storage Service");
    log::info!("Server configuration:");
    log::info!("  Host: {}", config.server.host);
    log::info!("  Port: {}", config.server.port);
    log::info!("  Storage path: {}", storage_base_path);

    // Create storage service
    let service = StorageService::new(config, storage_base_path);

    // Run the service
    service.run().await
}
