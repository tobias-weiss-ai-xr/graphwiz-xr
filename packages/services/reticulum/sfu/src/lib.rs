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

use actix_web::{web, App, HttpServer};
use reticulum_core::Config;
use std::sync::Arc;
use tokio::sync::RwLock;

use room::RoomManager;
use error::SfuResult;

pub use error::SfuError;
pub use config::SfuConfig;

/// Main SFU Service
pub struct SfuService {
    config: Config,
    sfu_config: SfuConfig,
    room_manager: Arc<RwLock<RoomManager>>,
}

impl SfuService {
    pub fn new(config: Config, sfu_config: SfuConfig) -> Self {
        let room_manager = Arc::new(RwLock::new(RoomManager::new(sfu_config.clone())));

        Self {
            config,
            sfu_config,
            room_manager,
        }
    }

    pub async fn run(self) -> std::io::Result<()> {
        let host = self.config.server.host.clone();
        let port = self.config.server.port;
        let workers = self.config.server.workers.unwrap_or(1);

        log::info!("Starting SFU service on {}:{}", host, port);
        log::info!("Max concurrent rooms: {}", self.sfu_config.max_rooms);
        log::info!("Max peers per room: {}", self.sfu_config.max_peers_per_room);

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
