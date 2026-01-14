//! Route configuration for presence service

use actix_web::web;
use crate::{handlers, moderation_handlers, websocket};

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
        .route("/signaling", web::post().to(handlers::signaling))
        // Message queue management (NEW)
        .route("/queue/batch-config", web::post().to(handlers::set_batch_config))
        .route("/queue/depth-limit", web::post().to(handlers::set_queue_depth))
        .route("/queue/stats/{session_id}", web::get().to(handlers::get_queue_stats))
        .route("/queue/stats", web::get().to(handlers::get_all_queue_stats))
        .route("/queue/rate-limit/{session_id}", web::post().to(handlers::set_rate_limit))
        // Moderation routes
        .route("/moderation/kick", web::post().to(moderation_handlers::kick_player))
        .route("/moderation/mute", web::post().to(moderation_handlers::mute_player))
        .route("/moderation/lock", web::post().to(moderation_handlers::lock_room));
    }
