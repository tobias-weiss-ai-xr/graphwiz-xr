//! Route configuration for presence service

use actix_web::web;
use crate::{handlers, websocket};

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg
        // Health check
        .route("/health", web::get().to(handlers::health))
        // Connection routes
        .route("/connect", web::post().to(handlers::connect))
        // Room presence
        .route("/rooms/{room_id}/clients", web::get().to(handlers::get_room_clients))
        // WebSocket routes
        .route("/ws/{room_id}", web::get().to(websocket::websocket_handler))
        .route("/ws/{room_id}/stats", web::get().to(websocket::get_stats))
        .route("/ws/stats", web::get().to(websocket::get_all_stats))
        // Performance metrics
        .route("/metrics", web::get().to(websocket::get_metrics))
        // WebRTC signaling
        .route("/signaling", web::post().to(handlers::signaling));
}
