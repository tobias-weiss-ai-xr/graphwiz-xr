//! Route configuration

use actix_web::web;

use crate::handlers;
use crate::admin_handlers;
use crate::cached_handlers;
use crate::metrics_handlers;

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
        .route("/logout/all", web::post().to(handlers::logout_all))
        // Admin routes - Cached for performance
        .route("/admin/users", web::get().to(cached_handlers::list_users_cached))
        .route("/admin/users/{user_id}", web::get().to(cached_handlers::get_user_cached))
        .route("/admin/users/{user_id}/status", web::post().to(admin_handlers::toggle_user_status))
        .route("/admin/users/{user_id}/role", web::put().to(admin_handlers::update_user_role))
        .route("/admin/users/{user_id}/role", web::delete().to(admin_handlers::revoke_user_role))
        // Admin logs routes
        .route("/admin/logs", web::get().to(admin_handlers::fetch_all_logs))
        .route("/admin/logs/export", web::get().to(admin_handlers::export_logs))
        .route("/admin/logs/clear", web::post().to(admin_handlers::clear_logs))
        .route("/admin/restart", web::post().to(admin_handlers::restart_service))
        .route("/admin/restart-all", web::post().to(admin_handlers::restart_all_services))
        // Admin metrics routes
        .route("/admin/metrics", web::get().to(admin_handlers::get_historical_metrics))
        .route("/admin/metrics", web::post().to(admin_handlers::add_metrics))
        .route("/admin/metrics", web::delete().to(admin_handlers::clear_metrics))
        .service(
            web::resource("/admin/logs/{service_name}")
                .route(web::get().to(admin_handlers::fetch_logs))
        );
}
