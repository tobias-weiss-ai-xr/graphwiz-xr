//! Reticulum Storage Service
//!
//! Handles file uploads, storage, and retrieval for assets

pub mod handlers;
pub mod routes;
pub mod storage_backend;
pub mod test_auth;

use actix_web::{web, App, HttpServer};
use reticulum_core::Config;
use std::sync::Arc;

use routes::configure_routes;
use storage_backend::{LocalStorageBackend, StorageBackend};

pub struct StorageService {
    config: Config,
    storage_backend: Arc<dyn StorageBackend>,
}

impl StorageService {
    pub fn new(config: Config, storage_base_path: String) -> Self {
        let storage_backend: Arc<dyn StorageBackend> = Arc::new(LocalStorageBackend::new(storage_base_path));
        Self { config, storage_backend }
    }

    pub async fn run(self) -> std::io::Result<()> {
        let host = self.config.server.host.clone();
        let port = self.config.server.port;
        let workers = self.config.server.workers.unwrap_or(1);
        let storage_backend = self.storage_backend.clone();
        let config = self.config.clone();

        log::info!("Starting storage service on {}:{}", host, port);

        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(config.clone()))
                .app_data(web::Data::new(storage_backend.clone()))
                .wrap(actix_cors::Cors::permissive())
                .wrap(reticulum_core::middleware::LoggingMiddleware)
                .wrap(test_auth::TestAuth) // Test authentication - replace with JWT in production
                .configure(configure_routes)
        })
        .bind((host.as_str(), port))?
        .workers(workers)
        .run()
        .await
    }
}
