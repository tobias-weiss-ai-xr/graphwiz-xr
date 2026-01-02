//! Reticulum Presence Service
//!
//! Handles WebTransport/WebRTC signaling, presence tracking, and real-time messaging

pub mod session;
pub mod signaling;
pub mod websocket;
pub mod handlers;
pub mod routes;
// pub mod optimization; // Disabled: Agent Looper dependency removed

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
    // optimization: optimization::OptimizationManager, // Disabled: Agent Looper dependency removed
}

impl PresenceService {
    pub fn new(config: Config) -> Self {
        let ws_manager = Arc::new(WebSocketManager::new());

        // Optimization disabled: Agent Looper dependency removed
        // let mut optimization = optimization::OptimizationManager::new();
        // if let Ok(agent_url) = std::env::var("AGENT_LOOPER_URL") {
        //     log::info!("Agent Looper URL configured for Presence: {}", agent_url);
        //     if let Err(e) = optimization.init(agent_url) {
        //         log::warn!("Failed to initialize Presence optimization: {}", e);
        //     }
        // }

        Self {
            config,
            ws_manager,
            // optimization,
        }
    }

    pub async fn run(self) -> std::io::Result<()> {
        let host = self.config.server.host.clone();
        let port = self.config.server.port;
        let workers = self.config.server.workers.unwrap_or(1);
        let ws_manager = self.ws_manager.clone();

        log::info!("Starting presence service on {}:{}", host, port);

        // Optimization disabled: Agent Looper dependency removed
        // if self.optimization.is_enabled() {
        //     log::info!("Presence optimization enabled: Agent Looper integration active");
        // }

        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(self.config.clone()))
                .app_data(web::Data::new(ws_manager.clone()))
                // .app_data(web::Data::new(self.optimization.clone())) // Disabled
                .wrap(actix_cors::Cors::permissive())
                .wrap(reticulum_core::middleware::LoggingMiddleware)
                .configure(configure_routes)
        })
        .bind((host.as_str(), port))?
        .workers(workers)
        .run()
        .await
    }

    // /// Get the optimization manager
    // pub fn optimization(&self) -> &optimization::OptimizationManager {
    //     &self.optimization
    // }
}
