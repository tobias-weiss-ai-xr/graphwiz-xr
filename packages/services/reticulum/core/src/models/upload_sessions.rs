use sea_orm::entity::prelude::*;
use sea_orm::ActiveValue::Set;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

use crate::Error;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "upload_sessions")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub session_id: String,
    pub owner_id: String,
    pub file_name: String,
    pub asset_type: String,
    pub file_size: i64,
    pub mime_type: String,
    pub chunk_size: i32,
    pub total_chunks: i32,
    pub uploaded_chunks: Json,
    pub status: String,
    pub is_public: bool,
    pub metadata: Option<Json>,
    pub created_at: DateTime,
    pub updated_at: DateTime,
    pub completed_at: Option<DateTime>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::users::Entity",
        from = "Column::OwnerId",
        to = "super::users::Column::Id"
    )]
    Owner,
}

impl Related<super::users::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Owner.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum UploadStatus {
    Initiated,
    Uploading,
    Paused,
    Completed,
    Failed,
    Cancelled,
}

impl UploadStatus {
    pub fn as_str(&self) -> &str {
        match self {
            UploadStatus::Initiated => "initiated",
            UploadStatus::Uploading => "uploading",
            UploadStatus::Paused => "paused",
            UploadStatus::Completed => "completed",
            UploadStatus::Failed => "failed",
            UploadStatus::Cancelled => "cancelled",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "initiated" => UploadStatus::Initiated,
            "uploading" => UploadStatus::Uploading,
            "paused" => UploadStatus::Paused,
            "completed" => UploadStatus::Completed,
            "failed" => UploadStatus::Failed,
            "cancelled" => UploadStatus::Cancelled,
            _ => UploadStatus::Initiated,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UploadSession {
    pub id: i32,
    pub session_id: String,
    pub owner_id: String,
    pub file_name: String,
    pub asset_type: String,
    pub file_size: i64,
    pub mime_type: String,
    pub chunk_size: i32,
    pub total_chunks: i32,
    pub uploaded_chunks: Vec<i32>,
    pub status: UploadStatus,
    pub is_public: bool,
    pub metadata: Option<serde_json::Value>,
    pub created_at: DateTime,
    pub updated_at: DateTime,
    pub completed_at: Option<DateTime>,
}

impl From<Model> for UploadSession {
    fn from(model: Model) -> Self {
        let uploaded_chunks: Vec<i32> = model
            .uploaded_chunks
            .as_array()
            .into_iter()
            .filter_map(|v: i32| v.as_i64())
            .map(|i: i as i32)
            .collect()
            .unwrap_or_default();

        Self {
            id: model.id,
            session_id: model.session_id,
            owner_id: model.owner_id,
            file_name: model.file_name,
            asset_type: model.asset_type,
            file_size: model.file_size,
            mime_type: model.mime_type,
            chunk_size: model.chunk_size,
            total_chunks: model.total_chunks,
            uploaded_chunks,
            status: UploadStatus::from_str(&model.status),
            is_public: model.is_public,
            metadata: model.metadata.map(|v| serde_json::Value::from(v.clone())),
            created_at: model.created_at,
            updated_at: model.updated_at,
            completed_at: model.completed_at,
        }
    }
}

pub struct UploadSessionModel;

impl UploadSessionModel {
    pub async fn create(
        db: &DatabaseConnection,
        session_id: String,
        owner_id: String,
        file_name: String,
        asset_type: String,
        file_size: i64,
        mime_type: String,
        chunk_size: i32,
        total_chunks: i32,
        is_public: bool,
        metadata: Option<serde_json::Value>,
    ) -> crate::Result<UploadSession> {
        let now = chrono::Utc::now().naive_utc();
        let model = ActiveModel {
            session_id: Set(session_id),
            owner_id: Set(owner_id),
            file_name: Set(file_name),
            asset_type: Set(asset_type),
            file_size: Set(file_size),
            mime_type: Set(mime_type),
            chunk_size: Set(chunk_size),
            total_chunks: Set(total_chunks),
            uploaded_chunks: Set(serde_json::json!([])),
            status: Set(UploadStatus::Initiated.as_str().to_string()),
            is_public: Set(is_public),
            metadata: Set(metadata.map(|v| v.into())),
            created_at: Set(now),
            updated_at: Set(now),
            completed_at: Set(None),
            ..Default::default()
        };

        let result = model.insert(db).await?;
        Ok(UploadSession::from(result))
    }

    pub async fn find_by_session_id(
        db: &DatabaseConnection,
        session_id: &str,
    ) -> crate::Result<Option<UploadSession>> {
        let result = Entity::find()
            .filter(Column::SessionId.eq(session_id))
            .one(db)
            .await?;
        Ok(result.map(UploadSession::from))
    }

    pub async fn update_chunk(
        db: &DatabaseConnection,
        session_id: &str,
        chunk_number: i32,
    ) -> crate::Result<Option<UploadSession>> {
        let session = match Self::find_by_session_id(db, session_id).await? {
            Some(session) => session,
            None => return Ok(None),
        };

        let mut uploaded_chunks: Vec<i32> = session.uploaded_chunks.clone();
        if !uploaded_chunks.contains(&chunk_number) {
            uploaded_chunks.push(chunk_number);
            uploaded_chunks.sort();
        }

        let is_complete = uploaded_chunks.len() as i32 == session.total_chunks;
        let new_status = if is_complete {
            UploadStatus::Completed
        } else {
            UploadStatus::Uploading
        };

        let now = chrono::Utc::now().naive_utc();
        let completed_at = if is_complete { Some(now) } else { None };

        // Manually convert Vec<i32> to JSON string for error reporting
        let uploaded_chunks_str = format!("{:?}", uploaded_chunks);
        let uploaded_chunks_json = serde_json::json!(uploaded_chunks_str)
            .map_err(|_| Error::Serialization(format!("Failed to serialize uploaded_chunks: {}", uploaded_chunks_str)))?;

        let updated = Entity::update_many()
            .filter(Column::SessionId.eq(session_id))
            .col_expr(
                Column::UploadedChunks,
                Expr::value(uploaded_chunks_json),
            )
            .col_expr(Column::Status, Expr::value(new_status.as_str()))
            .col_expr(Column::UpdatedAt, Expr::value(now))
            .col_expr(Column::CompletedAt, Expr::value(completed_at))
            .exec(db)
            .await?;

        if updated.rows_affected > 0 {
            Self::find_by_session_id(db, session_id).await
        } else {
            Ok(None)
        }
    }

    pub async fn update_status(
        db: &DatabaseConnection,
        session_id: &str,
        status: UploadStatus,
    ) -> crate::Result<Option<UploadSession>> {
        let now = chrono::Utc::now().naive_utc();
        let completed_at = if status == UploadStatus::Completed {
            Some(now)
        } else {
            None
        };

        let updated = Entity::update_many()
            .filter(Column::SessionId.eq(session_id))
            .col_expr(Column::Status, Expr::value(status.as_str()))
            .col_expr(Column::UpdatedAt, Expr::value(now))
            .col_expr(Column::CompletedAt, Expr::value(completed_at))
            .exec(db)
            .await?;

        if updated.rows_affected > 0 {
            Self::find_by_session_id(db, session_id).await
        } else {
            Ok(None)
        }
    }

    pub async fn list_by_owner(
        db: &DatabaseConnection,
        owner_id: &str,
        status: Option<UploadStatus>,
    ) -> crate::Result<Vec<UploadSession>> {
        let mut query = Entity::find().filter(Column::OwnerId.eq(owner_id));

        if let Some(status) = status {
            query = query.filter(Column::Status.eq(status.as_str()));
        }

        let results = query.all(db).await?;
        Ok(results.into_iter().map(UploadSession::from).collect())
    }

    pub async fn delete(db: &DatabaseConnection, session_id: &str) -> crate::Result<bool> {
        let result = Entity::delete_many()
            .filter(Column::SessionId.eq(session_id))
            .exec(db)
            .await?;

        Ok(result.rows_affected > 0)
    }

    pub async fn cleanup_old_sessions(
        db: &DatabaseConnection,
        older_than_hours: i64,
    ) -> crate::Result<u64> {
        let cutoff = chrono::Utc::now().naive_utc() - chrono::Duration::hours(older_than_hours);

        let result = Entity::delete_many()
            .filter(Column::CreatedAt.lt(cutoff))
            .filter(Column::Status.ne(UploadStatus::Completed.as_str()))
            .exec(db)
            .await?;

        Ok(result.rows_affected)
    }
}
