//! Reticulum Authentication Service
//!
//! Handles user registration, login, JWT token generation and validation

pub mod admin_handlers;
pub mod cached_handlers;
pub mod config;
pub mod handlers;
pub mod jwt;
pub mod magic_link;
pub mod models;
pub mod oauth;
pub mod routes;
pub mod session;
pub mod metrics_handlers;
// pub mod optimization;  // Disabled: Agent Looper dependency removed

use actix_web::{web, App, HttpServer};
use reticulum_core::Config;

use routes::configure_routes;

    pub struct AuthService {
    config: Config,
    cache: Option<CacheManager>,
}

impl AuthService {
    pub fn new(config: Config) -> Self {
        // Initialize cache manager if Redis is configured
        let cache = if let Some(ref redis_config) = config.redis {
            match CacheManager::with_redis(&redis_config.url) {
                Ok(cache) => {
                    log::info!("Redis caching enabled for Auth service");
                    Some(cache)
                }
                Err(e) => {
                    log::warn!("Failed to initialize Redis cache, running without cache: {}", e);
                    None
                }
            }
        } else {
            log::info!("No Redis configured, Auth service running without cache");
            None
        };

        Self {
            config,
            cache,
        }
    }

    pub async fn run(self) -> std::io::Result<()> {
        let host = self.config.server.host.clone();
        let port = self.config.server.port;
        let workers = self.config.server.workers.unwrap_or(1);

        log::info!("Starting auth service on {}:{}", host, port);

        // Cache enabled if Redis configured
        if self.cache.is_some() {
            log::info!("Redis caching enabled");
        }

        HttpServer::new(move || {
            let config = self.config.clone();
            let mut app = App::new()
                .app_data(web::Data::new(config.clone()))
                .wrap(actix_cors::Cors::permissive())
                .wrap(reticulum_core::middleware::LoggingMiddleware)
                .configure(configure_routes);

            // Add cache to app_data if configured
            if let Some(ref cache) = self.cache {
                app = app.app_data(web::Data::new(cache.clone()));
            }

            app
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
