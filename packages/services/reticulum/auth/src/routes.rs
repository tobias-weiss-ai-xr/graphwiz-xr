//! Route configuration

use actix_web::web;

use crate::handlers;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg
        // Health check
        .route("/health", web::get().to(handlers::health))
        // Authentication routes
        .route("/register", web::post().to(handlers::register))
        .route("/login", web::post().to(handlers::login))
        .route("/me", web::get().to(handlers::me));
}
