//! Reticulum Hub Service
//!
//! Manages rooms, entities, and game state

pub mod room;
pub mod entity;
pub mod handlers;
pub mod routes;

use actix_web::{web, App, HttpServer};
use reticulum_core::{Config, Result};

use routes::configure_routes;

pub struct HubService {
    config: Config,
}

impl HubService {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub async fn run(self) -> std::io::Result<()> {
        let host = self.config.server.host.clone();
        let port = self.config.server.port;

        log::info!("Starting hub service on {}:{}", host, port);

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
