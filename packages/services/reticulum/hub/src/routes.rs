//! Route configuration for hub service

use actix_web::web;
use crate::handlers;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg
        // Health check
        .route("/health", web::get().to(handlers::health))
        // Room routes
        .route("/rooms", web::post().to(handlers::create_room))
        .route("/rooms", web::get().to(handlers::list_rooms))
        .route("/rooms/{room_id}", web::get().to(handlers::get_room))
        .route("/rooms/{room_id}/join", web::post().to(handlers::join_room))
        .route("/rooms/{room_id}/leave", web::post().to(handlers::leave_room))
        .route("/rooms/{room_id}/entities", web::post().to(handlers::spawn_entity))
        .route("/rooms/{room_id}/entities", web::get().to(handlers::list_entities))
        .route("/rooms/{room_id}/entities/{entity_id}", web::put().to(handlers::update_entity))
        .route("/rooms/{room_id}/entities/{entity_id}", web::delete().to(handlers::despawn_entity));
}
