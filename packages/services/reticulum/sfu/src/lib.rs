//! Reticulum SFU (Selective Forwarding Unit) Service
//!
//! Handles WebRTC media forwarding for video/audio streaming.
//! Implements Selective Forwarding Unit architecture for optimal performance.

pub mod peer;
pub mod room;
pub mod rtp;
pub mod handlers;
pub mod routes;
pub mod config;
pub mod error;
// pub mod optimization;  // Disabled: Agent Looper dependency removed

use actix_web::{web, App, HttpServer};
use reticulum_core::Config;
use std::sync::Arc;
use tokio::sync::RwLock;

use room::RoomManager;

pub use error::SfuError;
pub use config::SfuConfig;

/// Main SFU Service
pub struct SfuService {
    config: Config,
    sfu_config: SfuConfig,
    room_manager: Arc<RwLock<RoomManager>>,
    // optimization: optimization::OptimizationManager,  // Disabled: Agent Looper dependency removed
}

impl SfuService {
    pub fn new(config: Config, sfu_config: SfuConfig) -> Self {
        let room_manager = Arc::new(RwLock::new(RoomManager::new(sfu_config.clone())));

        // Optimization disabled: Agent Looper dependency removed
        // let mut optimization = optimization::OptimizationManager::new();
        // if let Ok(agent_url) = std::env::var("AGENT_LOOPER_URL") {
        //     log::info!("Agent Looper URL configured for SFU: {}", agent_url);
        //     if let Err(e) = optimization.init(agent_url) {
        //         log::warn!("Failed to initialize SFU optimization: {}", e);
        //     }
        // }

        Self {
            config,
            sfu_config,
            room_manager,
            // optimization,
        }
    }

    pub async fn run(self) -> std::io::Result<()> {
        let host = self.config.server.host.clone();
        let port = self.config.server.port;
        let workers = self.config.server.workers.unwrap_or(1);

        log::info!("Starting SFU service on {}:{}", host, port);
        log::info!("Max concurrent rooms: {}", self.sfu_config.max_rooms);
        log::info!("Max peers per room: {}", self.sfu_config.max_peers_per_room);

        // Optimization disabled: Agent Looper dependency removed
        // if self.optimization.is_enabled() {
        //     log::info!("SFU optimization enabled: Agent Looper integration active");
        // }

        let room_manager = self.room_manager.clone();

        let sfu_config = self.sfu_config.clone();

        HttpServer::new(move || {
            let app_state = handlers::AppState {
                room_manager: room_manager.clone(),
                sfu_config: sfu_config.clone(),
            };

            App::new()
                .app_data(web::Data::new(self.config.clone()))
                .app_data(web::Data::new(app_state))
                // .app_data(web::Data::new(self.optimization.clone())) // Disabled
                .wrap(actix_cors::Cors::permissive())
                .wrap(reticulum_core::middleware::LoggingMiddleware)
                .configure(routes::configure_routes)
        })
        .bind((host.as_str(), port))?
        .workers(workers)
        .run()
        .await
    }

    /// Get the room manager
    pub fn room_manager(&self) -> Arc<RwLock<RoomManager>> {
        self.room_manager.clone()
    }

    // /// Get the optimization manager
    // pub fn optimization(&self) -> &optimization::OptimizationManager {
    //     &self.optimization
    // }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sfu_config_default() {
        let config = SfuConfig::default();
        assert_eq!(config.max_rooms, 100);
        assert_eq!(config.max_peers_per_room, 50);
    }
}
