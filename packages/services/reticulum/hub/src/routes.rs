//! Route configuration for hub service

use actix_web::web;
use crate::handlers;
use crate::admin_handlers;

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
        .route("/rooms/{room_id}/entities/{entity_id}", web::delete().to(handlers::despawn_entity))
        // Admin routes
        .route("/admin/rooms", web::get().to(admin_handlers::list_rooms))
        .route("/admin/rooms/{room_id}", web::get().to(admin_handlers::get_room_details))
        .route("/admin/rooms/{room_id}", web::put().to(admin_handlers::update_room_config))
        .route("/admin/rooms/{room_id}/close", web::post().to(admin_handlers::close_room))
        .route("/admin/rooms/{room_id}", web::delete().to(admin_handlers::delete_room));
}
