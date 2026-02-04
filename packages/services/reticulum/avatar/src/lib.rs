//! Reticulum Avatar Service
//!
//! Handles avatar configuration and customization for users

pub mod models;
pub mod routes;
pub mod handlers;
pub mod db;

use actix_web::{web, App, HttpServer};
use reticulum_core::Config;
use std::sync::Arc;

pub struct AvatarService {
    config: Config,
}

impl AvatarService {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub async fn run(self) -> std::io::Result<()> {
        let host = self.config.server.host.clone();
        let port = self.config.server.port;
        let workers = self.config.server.workers.unwrap_or(1);
        let config = self.config.clone();

        log::info!("Starting avatar service on {}:{}", host, port);

        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(config.clone()))
                .wrap(actix_cors::Cors::permissive())
                .wrap(reticulum_core::middleware::LoggingMiddleware)
                .configure(routes::configure_routes)
        })
        .bind((host.as_str(), port))?
        .workers(workers)
        .run()
        .await
    }
}
