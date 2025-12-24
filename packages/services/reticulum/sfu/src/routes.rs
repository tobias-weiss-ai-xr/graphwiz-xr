//! HTTP Routes Configuration for SFU Service

use actix_web::{web, Scope};
use super::handlers;

/// Configure SFU service routes
pub fn configure_routes(app: web::ServiceConfig) {
    app.service(
        web::scope("/api/v1")
            .service(health_routes())
            .service(room_routes())
            .service(peer_routes())
    );
}

/// Health check routes
fn health_routes() -> Scope {
    web::scope("/health")
        .route("", web::get().to(handlers::health_check))
}

/// Room management routes
fn room_routes() -> Scope {
    web::scope("/rooms")
        .route("", web::post().to(handlers::create_room))
        .route("", web::get().to(handlers::list_rooms))
        .route("/stats", web::get().to(handlers::get_room_stats))
        .route("/{room_id}", web::get().to(handlers::get_room_info))
}

/// Peer connection routes
fn peer_routes() -> Scope {
    web::scope("/peers")
        .route("/join", web::post().to(handlers::join_room))
        .route("/offer", web::post().to(handlers::handle_offer))
        .route("/ice", web::post().to(handlers::handle_ice_candidate))
        .route("/track", web::post().to(handlers::add_track))
        .route("/{room_id}/{peer_id}", web::delete().to(handlers::leave_room))
}
