//! Route configuration for avatar service

use actix_web::web;
use crate::handlers;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg
        // Health check
        .route("/health", web::get().to(handlers::health))
        // Avatar operations
        .route("/avatars/default", web::get().to(handlers::get_default_avatar))
        .route("/avatars/user/{user_id}", web::get().to(handlers::get_user_avatar))
        .route("/avatars/user/{user_id}", web::put().to(handlers::update_user_avatar))
        .route("/avatars/custom", web::post().to(handlers::register_custom_avatar));
}
