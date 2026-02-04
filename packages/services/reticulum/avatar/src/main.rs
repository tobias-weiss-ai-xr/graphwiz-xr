//! Avatar Service - Main entry point

use reticulum_avatar::AvatarService;
use reticulum_core::Config;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::init();

    // Load configuration
    let config = Config::from_env().expect("Failed to load configuration");

    log::info!("Starting Avatar Service...");

    // Run migrations
    if let Err(e) = reticulum_avatar::db::run_migrations(&config).await {
        log::error!("Failed to run migrations: {}", e);
        std::process::exit(1);
    }

    // Start service
    let service = AvatarService::new(config);
    service.run().await
}
