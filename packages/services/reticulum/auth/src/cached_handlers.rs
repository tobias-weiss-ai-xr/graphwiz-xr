//! Cached handlers for performance optimization

use actix_web::{web, HttpResponse};
use serde_json::json;
use reticulum_core::{Config, CacheManager, cache_keys, ttl};

use super::admin_handlers::{list_users, toggle_user_status, update_user_role, revoke_user_role};

/// List users with caching
pub async fn list_users_cached(
    config: web::Data<Config>,
    cache: web::Data<CacheManager>,
    query: web::Query<super::admin_handlers::UserListQuery>,
) -> HttpResponse {
    let cache_key = if let Some(ref search) = query.search {
        reticulum_core::cache_keys::user_list(
            query.page.unwrap_or(1),
            query.per_page.unwrap_or(50),
            search
        )
    } else {
        reticulum_core::cache_keys::user_list(
            query.page.unwrap_or(1),
            query.per_page.unwrap_or(50),
            ""
        )
    };

    // Try to get from cache first
    if let Ok(Some(cached)) = cache.get::<serde_json::Value>(&cache_key).await {
        log::info!("Cache hit for user list");
        return HttpResponse::Ok().json(cached);
    }

    log::info!("Cache miss for user list, fetching from database");

    // Cache miss, fetch from database
    let response = list_users(config, query).await;

    if response.status().is_success() {
        // Cache the successful response for 5 minutes
        if let Ok(body) = response.body().as_deref() {
            if let Ok(json_value) = serde_json::from_slice::<serde_json::Value>(body) {
                let _ = cache.set(&cache_key, &json_value, Some(ttl::MEDIUM)).await;
            }
        }
    }

    response
}

/// Get user with caching
pub async fn get_user_cached(
    config: web::Data<Config>,
    cache: web::Data<CacheManager>,
    path: web::Path<i32>,
) -> HttpResponse {
    let user_id = path.into_inner();
    let cache_key = reticulum_core::cache_keys::user(user_id);

    // Try cache first
    if let Ok(Some(cached_user)) = cache.get::<super::models::User>(&cache_key).await {
        log::info!("Cache hit for user {}", user_id);
        return HttpResponse::Ok().json(json!({
            "user": cached_user
        }));
    }

    log::info!("Cache miss for user {}, fetching from database", user_id);

    // Fetch from database
    let db = match reticulum_core::db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    match reticulum_core::UserModel::find_by_id(&db, user_id).await {
        Ok(Some(user)) => {
            // Cache for 5 minutes
            let _ = cache.set(&cache_key, &user, Some(ttl::MEDIUM)).await;

            HttpResponse::Ok().json(json!({
                "user": user
            }))
        }
        Ok(None) => {
            HttpResponse::NotFound().json(json!({
                "error": "not_found",
                "message": format!("User {} not found", user_id)
            }))
        }
        Err(e) => {
            log::error!("Failed to fetch user: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to retrieve user"
            }))
        }
    }
}

/// Invalidate user cache after modifications
pub async fn invalidate_user_cache(
    cache: web::Data<CacheManager>,
    user_id: i32,
) -> Result<(), anyhow::Error> {
    let cache_key = reticulum_core::cache_keys::user(user_id);
    cache.delete(&cache_key).await
}

/// Invalidate user list cache
pub async fn invalidate_user_list_cache(
    cache: web::Data<CacheManager>,
) -> Result<(), anyhow::Error> {
    // Delete multiple cache keys pattern
    if let Some(ref client) = cache.client {
        let mut conn = client.clone();
        redis::cmd("KEYS")
            .arg("users:list:*")
            .query_async(&mut conn)
            .await
    }

    Ok(())
}
