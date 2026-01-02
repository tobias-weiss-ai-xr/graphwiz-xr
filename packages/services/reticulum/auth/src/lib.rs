//! Reticulum Authentication Service
//!
//! Handles user registration, login, JWT token generation and validation

pub mod config;
pub mod handlers;
pub mod jwt;
pub mod magic_link;
pub mod models;
pub mod oauth;
pub mod routes;
pub mod session;
// pub mod optimization;  // Disabled: Agent Looper dependency removed

use actix_web::{web, App, HttpServer};
use reticulum_core::Config;

use routes::configure_routes;

pub struct AuthService {
    config: Config,
    // optimization: optimization::OptimizationManager,  // Disabled: Agent Looper dependency removed
}

impl AuthService {
    pub fn new(config: Config) -> Self {
        // Optimization disabled: Agent Looper dependency removed
        // let mut optimization = optimization::OptimizationManager::new();
        // if let Ok(agent_url) = std::env::var("AGENT_LOOPER_URL") {
        //     log::info!("Agent Looper URL configured for Auth: {}", agent_url);
        //     if let Err(e) = optimization.init(agent_url) {
        //         log::warn!("Failed to initialize Auth optimization: {}", e);
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

        log::info!("Starting auth service on {}:{}", host, port);

        // Optimization disabled: Agent Looper dependency removed
        // if self.optimization.is_enabled() {
        //     log::info!("Auth optimization enabled: Agent Looper integration active");
        // }

        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(self.config.clone()))
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
