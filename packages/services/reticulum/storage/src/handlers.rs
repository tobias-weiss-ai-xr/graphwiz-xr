//! HTTP handlers for storage service

use actix_web::{web, HttpResponse};
use actix_multipart::Multipart;
use futures_util::TryStreamExt;
use reticulum_core::{db, models as core_models, Config};
use reticulum_core::models::assets::{AssetModel, AssetType};

use crate::storage_backend::{StorageBackend, StoredFile};

/// Upload response
#[derive(Debug, serde::Serialize)]
pub struct UploadResponse {
    pub asset_id: String,
    pub file_name: String,
    pub asset_type: String,
    pub file_size: i64,
    pub mime_type: String,
    pub download_url: String,
}

/// List assets response
#[derive(Debug, serde::Serialize)]
pub struct ListAssetsResponse {
    pub assets: Vec<AssetInfo>,
    pub total: u64,
    pub page: u64,
    pub per_page: u64,
}

#[derive(Debug, serde::Serialize)]
pub struct AssetInfo {
    pub asset_id: String,
    pub file_name: String,
    pub asset_type: String,
    pub file_size: i64,
    pub mime_type: String,
    pub is_public: bool,
    pub created_at: String,
}

#[derive(Debug, serde::Deserialize)]
pub struct ListQuery {
    pub asset_type: Option<AssetType>,
    pub page: Option<u64>,
    pub per_page: Option<u64>,
}

/// Upload an asset file
pub async fn upload_asset(
    config: web::Data<Config>,
    storage_backend: web::Data<std::sync::Arc<dyn StorageBackend>>,
    mut payload: Multipart,
    user_id: web::ReqData<String>,
) -> HttpResponse {
    let user_id = user_id.into_inner();

    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    let mut file_name = String::new();
    let mut file_data = Vec::new();
    let mut asset_type = AssetType::Model;
    let mut is_public = false;
    let mut metadata: Option<serde_json::Value> = None;

    // Process multipart form data
    while let Some(mut field) = payload.try_next().await.unwrap_or(None) {
        let content_disposition = field.content_disposition();

        if let Some(name) = content_disposition.get_name() {
            match name {
                "file" => {
                    file_name = content_disposition
                        .get_filename()
                        .unwrap_or("unknown")
                        .to_string();

                    // Read file data
                    while let Some(chunk) = field.try_next().await.unwrap_or(None) {
                        file_data.extend_from_slice(&chunk);
                    }

                    log::info!("Received file: {} ({} bytes)", file_name, file_data.len());
                }
                "asset_type" => {
                    let mut type_bytes = Vec::new();
                    while let Some(chunk) = field.try_next().await.unwrap_or(None) {
                        type_bytes.extend_from_slice(&chunk);
                    }
                    let type_str = String::from_utf8_lossy(&type_bytes);
                    asset_type = AssetType::from_str(&type_str);
                    log::debug!("Asset type: {:?}", asset_type);
                }
                "is_public" => {
                    let mut public_bytes = Vec::new();
                    while let Some(chunk) = field.try_next().await.unwrap_or(None) {
                        public_bytes.extend_from_slice(&chunk);
                    }
                    let public_str = String::from_utf8_lossy(&public_bytes);
                    is_public = public_str == "true" || public_str == "1";
                }
                "metadata" => {
                    let mut metadata_bytes = Vec::new();
                    while let Some(chunk) = field.try_next().await.unwrap_or(None) {
                        metadata_bytes.extend_from_slice(&chunk);
                    }
                    let metadata_str = String::from_utf8_lossy(&metadata_bytes);
                    metadata = serde_json::from_str(&metadata_str).ok();
                }
                _ => {
                    // Unknown field, skip
                    while let Some(_) = field.try_next().await.unwrap_or(None) {}
                }
            }
        }
    }

    // Validate file size
    let max_size = asset_type.max_size() as u64;
    if file_data.len() as u64 > max_size {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "validation_error",
            "message": format!("File too large. Maximum size: {} bytes", max_size)
        }));
    }

    // Validate file extension
    let allowed_extensions: &[&str] = match asset_type {
        AssetType::Model => &["glb", "gltf"],
        AssetType::Texture => &["png", "jpg", "jpeg", "gif", "webp"],
        AssetType::Audio => &["mp3", "ogg", "wav"],
        AssetType::Video => &["mp4", "webm"],
    };

    let file_ext = file_name
        .rsplit('.')
        .next()
        .map(|s| s.to_lowercase())
        .unwrap_or_default();

    if !allowed_extensions.contains(&file_ext.as_str()) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "validation_error",
            "message": format!("Invalid file extension .{} for type {:?}", file_ext, asset_type)
        }));
    }

    // Detect MIME type
    let mime_type = mime_guess::from_path(&file_name)
        .first_or_octet_stream()
        .to_string();

    // Validate MIME type
    let allowed_mime_types = asset_type.allowed_mime_types();
    if !allowed_mime_types.contains(&mime_type.as_str()) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "validation_error",
            "message": format!("Invalid MIME type {} for asset type {:?}", mime_type, asset_type)
        }));
    }

    // Generate asset ID
    let asset_id = uuid::Uuid::new_v4().to_string();

    // Store file
    let stored_file = match storage_backend
        .store_file(&user_id, &asset_id, &file_name, file_data, &mime_type, max_size)
        .await
    {
        Ok(file) => file,
        Err(e) => {
            log::error!("Failed to store file: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "storage_error",
                "message": "Failed to store file"
            }));
        }
    };

    // Create database record
    match AssetModel::create(
        &db,
        asset_id.clone(),
        user_id,
        asset_type,
        file_name.clone(),
        stored_file.path.clone(),
        stored_file.size as i64,
        stored_file.mime_type.clone(),
        metadata,
        is_public,
    )
    .await
    {
        Ok(_) => {
            let response = UploadResponse {
                asset_id: asset_id.clone(),
                file_name,
                asset_type: asset_type.as_str().to_string(),
                file_size: stored_file.size as i64,
                mime_type: stored_file.mime_type,
                download_url: format!("/storage/assets/{}/download", asset_id),
            };
            HttpResponse::Created().json(response)
        }
        Err(e) => {
            log::error!("Failed to create asset record: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to create asset record"
            }))
        }
    }
}

/// Get asset metadata
pub async fn get_asset(
    config: web::Data<Config>,
    asset_id: web::Path<String>,
) -> HttpResponse {
    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    let asset_id = asset_id.into_inner();

    match AssetModel::find_by_asset_id(&db, &asset_id).await {
        Ok(Some(asset)) => HttpResponse::Ok().json(asset),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "not_found",
            "message": "Asset not found"
        })),
        Err(e) => {
            log::error!("Failed to get asset: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to get asset"
            }))
        }
    }
}

/// Download asset file
pub async fn download_asset(
    config: web::Data<Config>,
    storage_backend: web::Data<std::sync::Arc<dyn StorageBackend>>,
    asset_id: web::Path<String>,
) -> HttpResponse {
    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    let asset_id = asset_id.into_inner();

    let asset = match AssetModel::find_by_asset_id(&db, &asset_id).await {
        Ok(Some(asset)) => asset,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "not_found",
                "message": "Asset not found"
            }));
        }
        Err(e) => {
            log::error!("Failed to get asset: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to get asset"
            }));
        }
    };

    match storage_backend.get_file(&asset.file_path).await {
        Ok(data) => {
            HttpResponse::Ok()
                .content_type(asset.mime_type.clone())
                .insert_header(("Content-Disposition", format!("attachment; filename=\"{}\"", asset.file_name)))
                .body(data)
        }
        Err(e) => {
            log::error!("Failed to read file: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "storage_error",
                "message": "Failed to read file"
            }))
        }
    }
}

/// List user's assets
pub async fn list_assets(
    config: web::Data<Config>,
    user_id: web::ReqData<String>,
    query: web::Query<ListQuery>,
) -> HttpResponse {
    let user_id = user_id.into_inner();

    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    let page = query.page.unwrap_or(1);
    let per_page = query.per_page.unwrap_or(20);

    match AssetModel::list_by_owner(&db, &user_id, query.asset_type, page, per_page).await {
        Ok((assets, total)) => {
            let asset_infos: Vec<AssetInfo> = assets
                .into_iter()
                .map(|a| AssetInfo {
                    asset_id: a.asset_id,
                    file_name: a.file_name,
                    asset_type: a.asset_type.as_str().to_string(),
                    file_size: a.file_size,
                    mime_type: a.mime_type,
                    is_public: a.is_public,
                    created_at: a.created_at.to_string(),
                })
                .collect();

            HttpResponse::Ok().json(ListAssetsResponse {
                assets: asset_infos,
                total,
                page,
                per_page,
            })
        }
        Err(e) => {
            log::error!("Failed to list assets: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to list assets"
            }))
        }
    }
}

/// Delete an asset
pub async fn delete_asset(
    config: web::Data<Config>,
    storage_backend: web::Data<std::sync::Arc<dyn StorageBackend>>,
    asset_id: web::Path<String>,
    user_id: web::ReqData<String>,
) -> HttpResponse {
    let user_id = user_id.into_inner();

    let db = match db::connect(&config).await {
        Ok(db) => db,
        Err(e) => {
            log::error!("Database connection failed: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "database_error",
                "message": "Failed to connect to database"
            }));
        }
    };

    let asset_id = asset_id.into_inner();

    // Get asset info
    let asset = match AssetModel::find_by_asset_id(&db, &asset_id).await {
        Ok(Some(asset)) => asset,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "not_found",
                "message": "Asset not found"
            }));
        }
        Err(e) => {
            log::error!("Failed to get asset: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to get asset"
            }));
        }
    };

    // Verify ownership
    if asset.owner_id != user_id {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "forbidden",
            "message": "You don't have permission to delete this asset"
        }));
    }

    // Delete file
    if let Err(e) = storage_backend.delete_file(&asset.file_path).await {
        log::error!("Failed to delete file: {}", e);
        // Continue to delete database record
    }

    // Delete database record
    match AssetModel::delete(&db, &asset_id, &user_id).await {
        Ok(true) => HttpResponse::Ok().json(serde_json::json!({
            "message": "Asset deleted successfully"
        })),
        Ok(false) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "not_found",
            "message": "Asset not found"
        })),
        Err(e) => {
            log::error!("Failed to delete asset: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to delete asset"
            }))
        }
    }
}

/// Health check
pub async fn health() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "reticulum-storage"
    }))
}
