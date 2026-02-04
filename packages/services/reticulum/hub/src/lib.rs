//! Reticulum Hub Service
//!
//! Manages rooms, entities, and game state

pub mod room;
pub mod entity;
pub mod handlers;
pub mod admin_handlers;
pub mod room_persistence;
pub mod persistence_handlers;
pub mod routes;
// pub mod optimization;  // Disabled: Agent Looper dependency removed

use actix_web::{web, App, HttpServer};
use reticulum_core::Config;

use routes::configure_routes;
use room::RoomManager;

pub struct HubService {
    config: Config,
    // optimization: optimization::OptimizationManager,  // Disabled: Agent Looper dependency removed
}

impl HubService {
    pub fn new(config: Config) -> Self {
        // Optimization disabled: Agent Looper dependency removed
        // let mut optimization = optimization::OptimizationManager::new();
        // if let Ok(agent_url) = std::env::var("AGENT_LOOPER_URL") {
        //     log::info!("Agent Looper URL configured: {}", agent_url);
        //     if let Err(e) = optimization.init(agent_url) {
        //         log::warn!("Failed to initialize optimization: {}", e);
        //     }
        // }

        Self {
            config,
            // optimization,
        }
    }

    pub async fn run(self) -> std::io::Result<()> {
        let host = self.config.server.host.clone();
        let port = self.config.server.port;
        let workers = self.config.server.workers.unwrap_or(1);

        log::info!("Starting hub service on {}:{}", host, port);

        // Optimization disabled: Agent Looper dependency removed
        // if self.optimization.is_enabled() {
        //     log::info!("Optimization enabled: Agent Looper integration active");
        // }

        // Create shared room manager
        let room_manager = RoomManager::new();

        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(self.config.clone()))
                .app_data(web::Data::new(room_manager.clone()))
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
}
