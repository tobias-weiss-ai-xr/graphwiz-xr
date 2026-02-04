//! Admin log handlers

use actix_web::{web, HttpResponse, HttpRequest};
use serde_json::json;
use chrono::Utc;

use reticulum_core::{Config, LogStore, LogsQuery, LogsResponse, LogLevel, add_log};

/// Restart a specific service
pub async fn restart_service(
    path: web::Path<String>,
) -> HttpResponse {
    let service_name = path.into_inner();

    log::info!("Received restart request for service: {}", service_name);

    let service_ports: std::collections::HashMap<&str, u16> = [
        ("auth", 8011),
        ("hub", 8012),
        ("presence", 8013),
        ("sfu", 8014),
        ("storage", 8015),
    ]
    .iter()
    .cloned()
    .collect();

    let port = match service_ports.get(service_name.as_str()) {
        Some(&p) => p,
        None => {
            return HttpResponse::BadRequest().json(json!({
                "success": false,
                "message": format!("Unknown service: {}", service_name)
            }));
        }
    };

    log::info!("Attempting to restart {} on port {}", service_name, port);

    // Try to restart using docker-compose if available
    let service_container_name = format!("graphwiz-{}-dev", service_name);
    let result = tokio::process::Command::new("docker")
        .args(["restart", &service_container_name])
        .output()
        .await;

    match result {
        Ok(output) => {
            if output.status.success() {
                log::info!("Successfully restarted service: {} (container: {})", service_name, service_container_name);
                HttpResponse::Ok().json(json!({
                    "success": true,
                    "message": format!("Service '{}' is restarting. This may take 10-30 seconds.", service_name)
                }))
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr);
                log::warn!("Docker restart failed for {}: {}", service_name, stderr);

                // Fallback: try direct process restart using pkill
                let fallback_result = tokio::process::Command::new("pkill")
                    .args(["-f", &format!("reticulum-{}", service_name)])
                    .output()
                    .await;

                match fallback_result {
                    Ok(fb_output) => {
                        if fb_output.status.success() || String::from_utf8_lossy(&fb_output.stderr).contains("no process found") {
                            log::info!("Used fallback method to restart service: {}", service_name);
                            HttpResponse::Ok().json(json!({
                                "success": true,
                                "message": format!("Service '{}' restart initiated via signal. The service should restart automatically.", service_name)
                            }))
                        } else {
                            HttpResponse::InternalServerError().json(json!({
                                "success": false,
                                "message": format!("Failed to restart service '{}'. Docker error: {}. Fallback also failed.", service_name, stderr)
                            }))
                        }
                    }
                    Err(e) => {
                        log::error!("Fallback restart failed for {}: {}", service_name, e);
                        HttpResponse::InternalServerError().json(json!({
                            "success": false,
                            "message": format!("Failed to restart service '{}'. Docker error: {}. Fallback error: {}", service_name, stderr, e)
                        }))
                    }
                }
            }
        }
        Err(e) => {
            log::error!("Failed to execute docker restart for {}: {}", service_name, e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "message": format!("Failed to execute restart command for service '{}': {}", service_name, e)
            }))
        }
    }
}

/// Restart all services
pub async fn restart_all_services() -> HttpResponse {
    log::info!("Received restart all services request");

    let services = ["auth", "hub", "presence", "sfu", "storage"];
    let mut success_count = 0;
    let mut failed_services: Vec<String> = Vec::new();

    for service_name in services.iter() {
        let service_container_name = format!("graphwiz-{}-dev", service_name);
        let result = tokio::process::Command::new("docker")
            .args(["restart", &service_container_name])
            .output()
            .await;

        match result {
            Ok(output) => {
                if output.status.success() {
                    log::info!("Successfully restarted service: {}", service_name);
                    success_count += 1;
                } else {
                    log::warn!("Failed to restart service: {}", service_name);
                    failed_services.push(service_name.to_string());
                }
            }
            Err(e) => {
                log::error!("Failed to execute docker restart for {}: {}", service_name, e);
                failed_services.push(service_name.to_string());
            }
        }
    }

    if success_count == services.len() {
        log::info!("All services restarted successfully");
        HttpResponse::Ok().json(json!({
            "success": true,
            "message": format!("All {} services are restarting. This may take 30-60 seconds.", services.len()),
            "restarted_services": services
        }))
    } else {
        log::warn!("Partial restart: {}/{} services succeeded", success_count, services.len());
        HttpResponse::PartialContent().json(json!({
            "success": true,
            "message": format!("Restarted {}/{} services. Failed services: {:?}", success_count, services.len(), failed_services),
            "restarted_services": services.iter().filter(|s| !failed_services.contains(s)).collect::<Vec<_>>(),
            "failed_services": failed_services
        }))
    }
}

/// Fetch logs for the service
pub async fn fetch_logs(
    config: web::Data<Config>,
    query: web::Query<LogsQuery>,
    req: HttpRequest,
) -> HttpResponse {
    // Get service name from URL
    let service_name = req
        .match_info()
        .get("service_name")
        .unwrap_or("auth");

    let log_store = reticulum_core::get_log_store(service_name);

    // Handle query parameters
    let mut logs_query = query.into_inner();

    // Handle date strings
    if logs_query.start_time.is_none() {
        // Default to last 1 hour if not specified
        logs_query.start_time = Some(Utc::now() - chrono::Duration::hours(1));
    }

    let response = log_store.query(&logs_query).await;

    HttpResponse::Ok().json(response)
}

/// Fetch logs from all services
pub async fn fetch_all_logs(
    query: web::Query<LogsQuery>,
) -> HttpResponse {
    let services = ["auth", "hub", "presence", "sfu", "storage"];

    let mut all_entries = Vec::new();

    for service in &services {
        let log_store = reticulum_core::get_log_store(service);
        let mut service_query = query.clone();
        service_query.page = Some(1);
        service_query.per_page = Some(1000);

        let response = log_store.query(&service_query).await;
        all_entries.extend(response.entries);
    }

    // Apply filters
    let mut filtered = all_entries;

    if let Some(ref service) = query.service {
        filtered.retain(|e| e.service == *service);
    }

    if let Some(level) = query.level {
        filtered.retain(|e| e.level == level);
    }

    if let Some(ref search) = query.search {
        let search_lower = search.to_lowercase();
        filtered.retain(|e| {
            e.message.to_lowercase().contains(&search_lower)
                || e.service.to_lowercase().contains(&search_lower)
        });
    }

    // Sort by timestamp
    filtered.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

    let total = filtered.len();
    let page = query.page.unwrap_or(1);
    let per_page = query.per_page.unwrap_or(50).min(1000);

    let start_idx = (page - 1) * per_page;
    let paginated_entries: Vec<_> = filtered
        .into_iter()
        .skip(start_idx)
        .take(per_page)
        .collect();

    let response = LogsResponse {
        entries: paginated_entries,
        total,
        page,
        per_page,
    };

    HttpResponse::Ok().json(response)
}

/// Export logs as JSON
pub async fn export_logs(
    query: web::Query<LogsQuery>,
) -> HttpResponse {
    let services = if let Some(ref service) = query.service {
        vec![service.as_str()]
    } else {
        vec!["auth", "hub", "presence", "sfu", "storage"]
    };

    let mut all_entries = Vec::new();

    for service in services {
        let log_store = reticulum_core::get_log_store(service);
        let entries = log_store.get_all().await;
        all_entries.extend(entries);
    }

    // Apply filters
    let mut filtered = all_entries;

    if let Some(level) = query.level {
        filtered.retain(|e| e.level == level);
    }

    if let Some(ref search) = query.search {
        let search_lower = search.to_lowercase();
        filtered.retain(|e| {
            e.message.to_lowercase().contains(&search_lower)
                || e.service.to_lowercase().contains(&search_lower)
        });
    }

    filtered.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

    let export_data = json!({
        "exportedAt": Utc::now().to_rfc3339(),
        "totalEntries": filtered.len(),
        "entries": filtered
    });

    HttpResponse::Ok()
        .content_type("application/json")
        .insert_header(("Content-Disposition", "attachment; filename=\"logs.json\""))
        .body(export_data.to_string())
}

/// Clear logs for a service
pub async fn clear_logs(
    req: HttpRequest,
) -> HttpResponse {
    let service_name = req
        .match_info()
        .get("service_name")
        .unwrap_or("auth");

    let log_store = reticulum_core::get_log_store(service_name);
    log_store.clear().await;

    HttpResponse::Ok().json(json!({
        "message": format!("Logs cleared for service: {}", service_name)
    }))
}

// ============== USER MANAGEMENT ENDPOINTS ==============

/// List all users with their roles
pub async fn list_users(
    config: web::Data<Config>,
    query: web::Query<UserListQuery>,
) -> HttpResponse {
    // Connect to database
    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    let page = query.page.unwrap_or(1).max(1);
    let per_page = query.per_page.unwrap_or(50).min(100);
    let offset = (page - 1) * per_page;

    // Fetch users with roles
    match reticulum_core::RoleModel::list_all_with_roles(&db).await {
        Ok(users_with_roles) => {
            // Get total count
            let total = users_with_roles.len();

            // Apply pagination
            let paginated: Vec<_> = users_with_roles
                .into_iter()
                .skip(offset as usize)
                .take(per_page as usize)
                .collect();

            HttpResponse::Ok().json(json!({
                "users": paginated,
                "total": total,
                "page": page,
                "per_page": per_page,
                "total_pages": (total as f64 / per_page as f64).ceil() as i64
            }))
        }
        Err(e) => {
            log::error!("Failed to list users: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to retrieve users"
            }))
        }
    }
}

/// Ban/unban user (deactivate/activate)
pub async fn toggle_user_status(
    config: web::Data<Config>,
    path: web::Path<i32>,
    body: web::Json<ToggleUserRequest>,
) -> HttpResponse {
    let user_id = path.into_inner();

    // Connect to database
    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    let now = chrono::Utc::now().naive_utc();

    match reticulum_core::UserModel::find_by_id(&db, user_id).await {
        Ok(Some(mut user)) => {
            let mut active_model: reticulum_core::users::ActiveModel = user.into();
            active_model.is_active = sea_orm::ActiveValue::Set(body.is_active);
            active_model.updated_at = sea_orm::ActiveValue::Set(now);

            match active_model.update(&db).await {
                Ok(updated_user) => {
                    log::info!("User {} status changed to: {}", user_id, body.is_active);
                    HttpResponse::Ok().json(json!({
                        "message": format!("User {} {}", user_id, if body.is_active { "activated" } else { "banned" }),
                        "user_id": user_id,
                        "is_active": body.is_active
                    }))
                }
                Err(e) => {
                    log::error!("Failed to update user status: {}", e);
                    HttpResponse::InternalServerError().json(json!({
                        "error": "internal_error",
                        "message": "Failed to update user status"
                    }))
                }
            }
        }
        Ok(None) => {
            HttpResponse::NotFound().json(json!({
                "error": "not_found",
                "message": format!("User {} not found", user_id)
            }))
        }
        Err(e) => {
            log::error!("Failed to find user: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to retrieve user"
            }))
        }
    }
}

/// Update user role
pub async fn update_user_role(
    config: web::Data<Config>,
    path: web::Path<i32>,
    body: web::Json<UpdateRoleRequest>,
) -> HttpResponse {
    let user_id = path.into_inner();

    // Connect to database
    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    // Validate role
    let user_role = match reticulum_core::UserRole::from_str(&body.role) {
        Ok(role) => role,
        Err(e) => {
            return HttpResponse::BadRequest().json(json!({
                "error": "validation_error",
                "message": e
            }));
        }
    };

    // Grant role to user
    match reticulum_core::RoleModel::grant_role(&db, user_id, user_role, body.granted_by).await {
        Ok(role_assignment) => {
            log::info!("Role {} granted to user {} by {}", body.role, user_id, body.granted_by);
            HttpResponse::Ok().json(json!({
                "message": format!("Role '{}' assigned to user {}", body.role, user_id),
                "role_assignment": role_assignment
            }))
        }
        Err(e) => {
            log::error!("Failed to update user role: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to update user role"
            }))
        }
    }
}

/// Revoke user role
pub async fn revoke_user_role(
    config: web::Data<Config>,
    path: web::Path<i32>,
) -> HttpResponse {
    let user_id = path.into_inner();

    // Connect to database
    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    match reticulum_core::RoleModel::revoke_role(&db, user_id).await {
        Ok(_) => {
            log::info!("Role revoked from user {}", user_id);
            HttpResponse::Ok().json(json!({
                "message": format!("Role revoked from user {}", user_id)
            }))
        }
        Err(e) => {
            log::error!("Failed to revoke user role: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "internal_error",
                "message": "Failed to revoke user role"
            }))
        }
    }
}

// Query parameter types for user listing
#[derive(Debug, Deserialize)]
pub struct UserListQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

// Request types for user management
#[derive(Debug, Deserialize, Validate)]
pub struct ToggleUserRequest {
    pub is_active: bool,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateRoleRequest {
    pub role: String,
    pub granted_by: i32,
}