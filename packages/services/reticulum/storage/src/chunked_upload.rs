use actix_web::{web, FromRequest, HttpRequest, HttpResponse};
use actix_multipart::Multipart;
use futures_util::TryStreamExt;
use reticulum_core::{db, models as core_models, Config};
use reticulum_core::models::assets::{AssetModel, AssetType};
use reticulum_core::models::upload_sessions::{UploadSession, UploadSessionModel, UploadStatus};
use std::sync::Arc;
use std::path::Path;
use uuid::Uuid;

use crate::storage_backend::{StorageBackend, StorageConfig, StoredFile};
use crate::virus_scanner::scan_file_for_viruses;

#[derive(Debug, serde::Deserialize)]
pub struct InitiateUploadRequest {
    pub file_name: String,
    pub file_size: i64,
    pub asset_type: String,
    pub mime_type: String,
    pub chunk_size: Option<i32>,
    pub is_public: Option<bool>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, serde::Serialize)]
pub struct InitiateUploadResponse {
    pub session_id: String,
    pub file_name: String,
    pub file_size: i64,
    pub chunk_size: i32,
    pub total_chunks: i32,
    pub upload_url: String,
    pub resume_url: String,
    pub complete_url: String,
    pub cancel_url: String,
}

pub async fn initiate_chunked_upload(
    req: HttpRequest,
    config: web::Data<Config>,
    request_data: web::Json<InitiateUploadRequest>,
) -> HttpResponse {
    let user_id = match req.extensions().get::<Uuid>() {
        Some(uuid) => uuid.to_string(),
        None => {
            log::error!("User ID not found in request extensions");
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "unauthorized",
                "message": "User not authenticated"
            }));
        }
    };

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

    // Clone request data once at function start for repeated use in responses
    // These clones are intentional - request_data moved during async operations
    let file_name = request_data.file_name.clone();
    let asset_type_str = request_data.asset_type.clone();
    let mime_type = request_data.mime_type.clone();
    let is_public = request_data.is_public.unwrap_or(false);
    let metadata = request_data.metadata.clone();

    let default_chunk_size = 10 * 1024 * 1024;
    let chunk_size = request_data.chunk_size.unwrap_or(default_chunk_size).max(5 * 1024 * 1024).min(20 * 1024 * 1024);

    let max_size = asset_type.max_size();
    if file_size > max_size {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "validation_error",
            "message": format!("File too large. Maximum size: {} bytes", max_size)
        }));
    }

    let total_chunks = ((file_size as f64) / (chunk_size as f64)).ceil() as i32;
    let session_id = Uuid::new_v4().to_string();

    match UploadSessionModel::create(
        &db,
        session_id.clone(),
        user_id,
        file_name.clone(),
        asset_type_str.clone(),
        file_size,
        mime_type.clone(),
        chunk_size,
        total_chunks,
        is_public,
        metadata.clone(),
    )
    .await
    {
        Ok(_) => {
            // Create response with references (no additional clones)
            let response = InitiateUploadResponse {
                session_id: &session_id,
                file_name,
                file_size,
                chunk_size,
                total_chunks,
                upload_url: format!("/storage/chunked-upload/{}/chunk", session_id),
                resume_url: format!("/storage/chunked-upload/{}", session_id),
                complete_url: format!("/storage/chunked-upload/{}/complete", session_id),
                cancel_url: format!("/storage/chunked-upload/{}/cancel", session_id),
            };
            HttpResponse::Created().json(response)
        }
        Err(e) => {
            log::error!("Failed to create upload session: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to create upload session"
            }))
        }
    }
}

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

    let file_name = request_data.file_name.clone();
    let file_size = request_data.file_size;
    let asset_type_str = request_data.asset_type.clone();
    let asset_type = AssetType::from_str(&asset_type_str);
    let mime_type = request_data.mime_type.clone();
    let is_public = request_data.is_public.unwrap_or(false);
    let metadata = request_data.metadata.clone();

    let default_chunk_size = 10 * 1024 * 1024;
    let chunk_size = request_data.chunk_size.unwrap_or(default_chunk_size).max(5 * 1024 * 1024).min(20 * 1024 * 1024);

    let max_size = asset_type.max_size();
    if file_size > max_size {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "validation_error",
            "message": format!("File too large. Maximum size: {} bytes", max_size)
        }));
    }

    let total_chunks = ((file_size as f64) / (chunk_size as f64)).ceil() as i32;
    let session_id = Uuid::new_v4().to_string();

    match UploadSessionModel::create(
        &db,
        session_id,
        user_id,
        file_name.clone(),
        asset_type_str.clone(),
        file_size,
        mime_type.clone(),
        chunk_size,
        total_chunks,
        is_public,
        metadata.clone(),
    )
    .await
    {
        Ok(_) => {
            let response = InitiateUploadResponse {
                session_id: session_id,
                file_name,
                file_size,
                chunk_size,
                total_chunks,
                upload_url: format!("/storage/chunked-upload/{}/chunk", session_id),
                resume_url: format!("/storage/chunked-upload/{}", session_id),
                complete_url: format!("/storage/chunked-upload/{}/complete", session_id),
                cancel_url: format!("/storage/chunked-upload/{}/cancel", session_id),
            };
            HttpResponse::Created().json(response)
        }
        Err(e) => {
            log::error!("Failed to create upload session: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to create upload session"
            }))
        }
    }

#[derive(Debug, serde::Deserialize)]
pub struct UploadChunkQuery {
    pub chunk_number: i32,
}

#[derive(Debug, serde::Serialize)]
pub struct UploadChunkResponse {
    pub session_id: String,
    pub chunk_number: i32,
    pub uploaded_chunks: Vec<i32>,
    pub progress: f64,
    pub status: String,
}

pub async fn upload_chunk(
    req: HttpRequest,
    config: web::Data<Config>,
    storage_backend: web::Data<Arc<dyn StorageBackend>>,
    storage_config: web::Data<StorageConfig>,
    session_id: web::Path<String>,
    query: web::Query<UploadChunkQuery>,
    mut payload: Multipart,
) -> HttpResponse {
    let user_id = match req.extensions().get::<Uuid>() {
        Some(uuid) => uuid.to_string(),
        None => {
            log::error!("User ID not found in request extensions");
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "unauthorized",
                "message": "User not authenticated"
            }));
        }
    };

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

    let session_id = session_id.into_inner();
    let chunk_number = query.chunk_number;

    let session = match UploadSessionModel::find_by_session_id(&db, &session_id).await {
        Ok(Some(session)) => session,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "not_found",
                "message": "Upload session not found"
            }));
        }
        Err(e) => {
            log::error!("Failed to get upload session: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to get upload session"
            }));
        }
    };

    if session.owner_id != user_id {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "forbidden",
            "message": "You don't have permission to upload to this session"
        }));
    }

    if !matches!(session.status, UploadStatus::Initiated | UploadStatus::Uploading) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "invalid_state",
            "message": format!("Upload session is in {:?} state", session.status)
        }));
    }

    if chunk_number < 1 || chunk_number > session.total_chunks {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "invalid_chunk",
            "message": format!("Invalid chunk number. Must be between 1 and {}", session.total_chunks)
        }));
    }

    let mut chunk_data = Vec::new();
    while let Some(mut field) = payload.try_next().await.unwrap_or(None) {
        let content_disposition = field.content_disposition();

        if let Some(name) = content_disposition.get_name() {
            if name == "chunk" {
                while let Some(chunk) = field.try_next().await.unwrap_or(None) {
                    chunk_data.extend_from_slice(&chunk);
                }
            }
        }
    }

    if chunk_data.is_empty() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "no_data",
            "message": "No chunk data provided"
        }));
    }

    let chunk_path = format!("{}/{}", session_id, chunk_number);

    match storage_backend
        .store_chunk(&user_id, &session_id, chunk_number, &chunk_data)
        .await
    {
        Ok(_) => {
            match UploadSessionModel::update_chunk(&db, &session_id, chunk_number).await {
        Ok(Some(updated_session)) => {
                    let progress = (updated_session.uploaded_chunks.len() as f64)
                        / updated_session.total_chunks as f64
                        * 100.0;

                    let response = UploadChunkResponse {
                        session_id: session_id,
                        chunk_number,
                        uploaded_chunks: updated_session.uploaded_chunks,
                        progress,
                        status: updated_session.status.as_str().to_string(),
                    };
                    HttpResponse::Ok().json(response)
                }
                Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
                    "error": "not_found",
                    "message": "Upload session not found after update"
                })),
                Err(e) => {
                    log::error!("Failed to update upload session: {}", e);
                    HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "internal_error",
                        "message": "Failed to update upload session"
                    }))
                }
            }
        }
        Err(e) => {
            log::error!("Failed to store chunk: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "storage_error",
                "message": "Failed to store chunk"
            }))
        }
    }
}

#[derive(Debug, serde::Serialize)]
pub struct GetUploadSessionResponse {
    pub session_id: String,
    pub file_name: String,
    pub file_size: i64,
    pub uploaded_chunks: Vec<i32>,
    pub total_chunks: i32,
    pub progress: f64,
    pub status: String,
    pub created_at: String,
}

pub async fn get_upload_session(
    req: HttpRequest,
    config: web::Data<Config>,
    session_id: web::Path<String>,
) -> HttpResponse {
    let user_id = match req.extensions().get::<Uuid>() {
        Some(uuid) => uuid.to_string(),
        None => {
            log::error!("User ID not found in request extensions");
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "unauthorized",
                "message": "User not authenticated"
            }));
        }
    };

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

    let session_id = session_id.into_inner();

    let session = match UploadSessionModel::find_by_session_id(&db, &session_id).await {
        Ok(Some(session)) => session,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "not_found",
                "message": "Upload session not found"
            }));
        }
        Err(e) => {
            log::error!("Failed to get upload session: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to get upload session"
            }));
        }
    };

    if session.owner_id != user_id {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "forbidden",
            "message": "You don't have permission to view this session"
        }));
    }

    let progress = (session.uploaded_chunks.len() as f64 / session.total_chunks as f64) * 100.0;

    let response = GetUploadSessionResponse {
        session_id: session.session_id.clone(),
        file_name: session.file_name,
        file_size: session.file_size,
        uploaded_chunks: session.uploaded_chunks.clone(),
        total_chunks: session.total_chunks,
        progress,
        status: session.status.as_str().to_string(),
        created_at: session.created_at.to_rfc3339(),
    };
    HttpResponse::Ok().json(response)
}

#[derive(Debug, serde::Serialize)]
pub struct CompleteUploadResponse {
    pub session_id: String,
    pub asset_id: String,
    pub file_name: String,
    pub file_size: i64,
    pub mime_type: String,
    pub download_url: String,
}

pub async fn complete_upload(
    req: HttpRequest,
    config: web::Data<Config>,
    storage_backend: web::Data<Arc<dyn StorageBackend>>,
    session_id: web::Path<String>,
) -> HttpResponse {
    let user_id = match req.extensions().get::<Uuid>() {
        Some(uuid) => uuid.to_string(),
        None => {
            log::error!("User ID not found in request extensions");
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "unauthorized",
                "message": "User not authenticated"
            }));
        }
    };

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

    let session_id = session_id.into_inner();

    let session = match UploadSessionModel::find_by_session_id(&db, &session_id).await {
        Ok(Some(session)) => session,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "not_found",
                "message": "Upload session not found"
            }));
        }
        Err(e) => {
            log::error!("Failed to get upload session: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to get upload session"
            }));
        }
    };

    if session.owner_id != user_id {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "forbidden",
            "message": "You don't have permission to complete this upload"
        }));
    }

    if session.status != UploadStatus::Completed {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "invalid_state",
            "message": "Upload is not complete. All chunks must be uploaded first."
        }));
    }

    match storage_backend.merge_chunks(&user_id, &session_id).await {
        Ok(merged_file) => {
            let asset_type = AssetType::from_str(&session.asset_type);

            match AssetModel::create(
                &db,
                merged_file.asset_id.clone(),
                user_id,
                asset_type,
                session.file_name.clone(),
                merged_file.path.clone(),
                merged_file.size as i64,
                merged_file.mime_type.clone(),
                session.metadata.map(|m| serde_json::Value::from(m.clone())),
                session.is_public,
            )
            .await
            {
                Ok(_) => {
                    match UploadSessionModel::delete(&db, &session_id).await {
                        Ok(_) => {
                            let response = CompleteUploadResponse {
                                session_id: session_id.clone(),
                                asset_id: merged_file.asset_id,
                                file_name: session.file_name,
                                file_size: merged_file.size as i64,
                                mime_type: merged_file.mime_type,
                                download_url: format!("/storage/assets/{}/download", merged_file.asset_id),
                            };
                            HttpResponse::Ok().json(response)
                        }
                        Err(e) => {
                            log::error!("Failed to delete upload session: {}", e);
                            HttpResponse::InternalServerError().json(serde_json::json!({
                                "error": "internal_error",
                                "message": "Failed to delete upload session"
                            }))
                        }
                    }
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
        Err(e) => {
            log::error!("Failed to merge chunks: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "storage_error",
                "message": "Failed to merge chunks"
            }))
        }
    }
}

pub async fn cancel_upload(
    req: HttpRequest,
    config: web::Data<Config>,
    storage_backend: web::Data<Arc<dyn StorageBackend>>,
    session_id: web::Path<String>,
) -> HttpResponse {
    let user_id = match req.extensions().get::<Uuid>() {
        Some(uuid) => uuid.to_string(),
        None => {
            log::error!("User ID not found in request extensions");
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "unauthorized",
                "message": "User not authenticated"
            }));
        }
    };

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

    let session_id = session_id.into_inner();

    let session = match UploadSessionModel::find_by_session_id(&db, &session_id).await {
        Ok(Some(session)) => session,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "not_found",
                "message": "Upload session not found"
            }));
        }
        Err(e) => {
            log::error!("Failed to get upload session: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "internal_error",
                "message": "Failed to get upload session"
            }));
        }
    };

    if session.owner_id != user_id {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "forbidden",
            "message": "You don't have permission to cancel this upload"
        }));
    }

    if matches!(session.status, UploadStatus::Completed) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "invalid_state",
            "message": "Cannot cancel a completed upload"
        }));
    }

    match storage_backend.cleanup_chunks(&user_id, &session_id).await {
        Ok(_) => {
            match UploadSessionModel::update_status(&db, &session_id, UploadStatus::Cancelled).await {
                Ok(_) => {
                    HttpResponse::Ok().json(serde_json::json!({
                        "message": "Upload cancelled successfully"
                    }))
                }
                Err(e) => {
                    log::error!("Failed to update upload session status: {}", e);
                    HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "internal_error",
                        "message": "Failed to update upload session status"
                    }))
                }
            }
        }
        Err(e) => {
            log::error!("Failed to cleanup chunks: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "storage_error",
                "message": "Failed to cleanup chunks"
            }))
        }
    }
}
