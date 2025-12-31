//! Route configuration for storage service

use actix_web::web;
use crate::handlers;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg
        // Health check
        .route("/health", web::get().to(handlers::health))
        // Asset operations
        .route("/upload", web::post().to(handlers::upload_asset))
        .route("/assets", web::get().to(handlers::list_assets))
        .route("/assets/{asset_id}", web::get().to(handlers::get_asset))
        .route("/assets/{asset_id}", web::delete().to(handlers::delete_asset))
        .route("/assets/{asset_id}/download", web::get().to(handlers::download_asset));
}
