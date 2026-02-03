//! Reticulum Storage Service
//!
//! Handles file uploads, storage, and retrieval for assets

pub mod handlers;
pub mod routes;
pub mod storage_backend;
pub mod jwt_auth;
pub mod rate_limiter;
pub mod virus_scanner;
pub mod chunked_upload;

use actix_web::{web, App, HttpServer};
use reticulum_core::Config;
use std::sync::Arc;

use routes::configure_routes;
use storage_backend::{LocalStorageBackend, StorageBackend, StorageConfig};

pub use jwt_auth::JwtAuth;
pub use rate_limiter::RateLimiter;
use tokio::time::{Duration, interval, sleep};

pub struct StorageService {
    config: Config,
    storage_backend: Arc<dyn StorageBackend>,
}

impl StorageService {
    pub fn new(config: Config, storage_base_path: String) -> Self {
        let storage_config = StorageConfig {
            base_path: storage_base_path,
        };
        let storage_backend: Arc<dyn StorageBackend> = Arc::new(LocalStorageBackend::new(storage_config.base_path));
        Self { config, storage_backend }
    }

    pub async fn run(self) -> std::io::Result<()> {
        let host = self.config.server.host.clone();
        let port = self.config.server.port;
        let workers = self.config.server.workers.unwrap_or(1);
        let storage_backend = self.storage_backend.clone();
        let config = self.config.clone();
        let config_arc = Arc::new(config);

        // Spawn periodic cleanup task for rate limiter state
        let rate_limiter_state = Arc::new(tokio::sync::Mutex::new(rate_limiter::RateLimitState::new()));
        let state_cleanup = rate_limiter_state.clone();
        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(3600)); // Every hour
            loop {
                interval.tick().await;
                let mut state = state_cleanup.lock().await;
                state.cleanup_old_timestamps(Duration::from_secs(3600));
                log::debug!("Periodic rate limiter state cleanup completed");
            }
        });

        log::info!("Starting storage service on {}:{}", host, port);

        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(config_arc.clone()))
                .app_data(web::Data::new(storage_backend.clone()))
                .wrap(actix_cors::Cors::permissive())
                .wrap(reticulum_core::middleware::LoggingMiddleware)
                .wrap(jwt_auth::JwtAuth::new(config_arc.clone()))
                .wrap(rate_limiter::RateLimiter::default())
                .configure(configure_routes)
        })
        .bind((host.as_str(), port))?
        .workers(workers)
        .run()
        .await
    }
}
