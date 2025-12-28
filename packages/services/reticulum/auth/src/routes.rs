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
        .route("/me", web::get().to(handlers::me))
        // OAuth routes
        .route("/oauth/url", web::get().to(handlers::get_oauth_url))
        .route("/oauth/callback", web::get().to(handlers::oauth_callback))
        // Magic link routes
        .route("/magic-link/send", web::post().to(handlers::send_magic_link))
        .route("/magic-link/verify", web::post().to(handlers::verify_magic_link))
        // Session management routes
        .route("/session/validate", web::post().to(handlers::validate_session))
        .route("/session/refresh", web::post().to(handlers::refresh_session))
        .route("/logout", web::post().to(handlers::logout))
        .route("/logout/all", web::post().to(handlers::logout_all));
}
