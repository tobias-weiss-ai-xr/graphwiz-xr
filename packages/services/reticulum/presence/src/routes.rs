//! Route configuration for presence service

use actix_web::web;
use crate::handlers;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg
        // Health check
        .route("/health", web::get().to(handlers::health))
        // Connection routes
        .route("/connect", web::post().to(handlers::connect))
        // Room presence
        .route("/rooms/{room_id}/clients", web::get().to(handlers::get_room_clients))
        // WebRTC signaling
        .route("/signaling", web::post().to(handlers::signaling));
}
