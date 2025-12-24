//! Reticulum Presence Service
//!
//! Handles WebTransport/WebRTC signaling, presence tracking, and real-time messaging

pub mod session;
pub mod signaling;
pub mod handlers;
pub mod routes;

use actix_web::{web, App, HttpServer};
use reticulum_core::{Config, Result};

use routes::configure_routes;

pub struct PresenceService {
    config: Config,
}

impl PresenceService {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub async fn run(self) -> std::io::Result<()> {
        let host = self.config.server.host.clone();
        let port = self.config.server.port;

        log::info!("Starting presence service on {}:{}", host, port);

        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(self.config.clone()))
                .wrap(actix_cors::Cors::permissive())
                .wrap(reticulum_core::middleware::LoggingMiddleware)
                .configure(configure_routes)
        })
        .bind((host.as_str(), port))?
        .workers(self.config.server.workers.unwrap_or(1))
        .run()
        .await
    }
}
