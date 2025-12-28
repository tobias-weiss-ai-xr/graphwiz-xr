//! Reticulum Presence Service
//!
//! Handles WebTransport/WebRTC signaling, presence tracking, and real-time messaging

pub mod session;
pub mod signaling;
pub mod websocket;
pub mod handlers;
pub mod routes;

// Production-ready features
// Temporarily disabled for initial compilation
// pub mod protobuf;
// pub mod auth;
// pub mod rate_limit;
// pub mod queue;
// pub mod metrics;
// pub mod redis;

use actix_web::{web, App, HttpServer};
use reticulum_core::Config;
use std::sync::Arc;

use routes::configure_routes;
use websocket::WebSocketManager;

pub struct PresenceService {
    config: Config,
    ws_manager: Arc<WebSocketManager>,
}

impl PresenceService {
    pub fn new(config: Config) -> Self {
        let ws_manager = Arc::new(WebSocketManager::new());
        Self { config, ws_manager }
    }

    pub async fn run(self) -> std::io::Result<()> {
        let host = self.config.server.host.clone();
        let port = self.config.server.port;
        let workers = self.config.server.workers.unwrap_or(1);
        let ws_manager = self.ws_manager.clone();

        log::info!("Starting presence service on {}:{}", host, port);

        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(self.config.clone()))
                .app_data(web::Data::new(ws_manager.clone()))
                .wrap(actix_cors::Cors::permissive())
                .wrap(reticulum_core::middleware::LoggingMiddleware)
                .configure(configure_routes)
        })
        .bind((host.as_str(), port))?
        .workers(workers)
        .run()
        .await
    }
}
