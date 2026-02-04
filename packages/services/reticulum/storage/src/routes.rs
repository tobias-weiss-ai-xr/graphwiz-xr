//! Route configuration for storage service

use actix_web::web;
use crate::handlers;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg
        // Health check
        .route("/health", web::get().to(handlers::health))
        // Single-shot upload
        .route("/upload", web::post().to(handlers::upload_asset))
        // Chunked upload endpoints
        // .route("/chunked-upload", web::post().to(chunked_upload::initiate_chunked_upload))
        // .route("/chunked-upload/{session_id}", web::get().to(chunked_upload::get_upload_session))
        // .route("/chunked-upload/{session_id}/chunk", web::post().to(chunked_upload::upload_chunk))
        // .route("/chunked-upload/{session_id}/complete", web::post().to(chunked_upload::complete_upload))
        // .route("/chunked-upload/{session_id}/cancel", web::post().to(chunked_upload::cancel_upload))
        // Asset operations
        .route("/assets", web::get().to(handlers::list_assets))
        .route("/assets/{asset_id}", web::get().to(handlers::get_asset))
        .route("/assets/{asset_id}", web::delete().to(handlers::delete_asset))
        .route("/assets/{asset_id}/download", web::get().to(handlers::download_asset));
}

