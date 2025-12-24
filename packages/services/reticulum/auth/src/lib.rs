//! Reticulum Authentication Service
//!
//! Handles user registration, login, JWT token generation and validation

pub mod config;
pub mod handlers;
pub mod jwt;
pub mod models;
pub mod routes;

use actix_web::{web, App, HttpServer};
use reticulum_core::{Config, Result};

use config::AuthConfig;
use routes::configure_routes;

pub struct AuthService {
    config: Config,
}

impl AuthService {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub async fn run(self) -> std::io::Result<()> {
        let host = self.config.server.host.clone();
        let port = self.config.server.port;
        let workers = self.config.server.workers.unwrap_or(1);

        log::info!("Starting auth service on {}:{}", host, port);

        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(self.config.clone()))
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
