//! Asset model for storage service

use sea_orm::entity::prelude::*;
use sea_orm::ActiveValue::Set;
use serde::{Deserialize, Serialize};
use std::convert::Into;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "assets")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub asset_id: String,
    pub owner_id: String,
    pub asset_type: String,
    pub file_name: String,
    pub file_path: String,
    pub file_size: i64,
    pub mime_type: String,
    pub metadata: Option<Json>,
    pub is_public: bool,
    pub created_at: DateTime,
    pub updated_at: DateTime,
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

/// Asset type enum with validation and size limits
#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum AssetType {
    Model,
    Texture,
    Audio,
    Video,
}

impl AssetType {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "model" => AssetType::Model,
            "texture" => AssetType::Texture,
            "audio" => AssetType::Audio,
            "video" => AssetType::Video,
            _ => AssetType::Model, // Default
        }
    }

    pub fn as_str(&self) -> &str {
        match self {
            AssetType::Model => "model",
            AssetType::Texture => "texture",
            AssetType::Audio => "audio",
            AssetType::Video => "video",
        }
    }

    pub fn max_size(&self) -> i64 {
        match self {
            AssetType::Model => 100 * 1024 * 1024,  // 100MB
            AssetType::Texture => 10 * 1024 * 1024,  // 10MB
            AssetType::Audio => 50 * 1024 * 1024,    // 50MB
            AssetType::Video => 200 * 1024 * 1024,   // 200MB
        }
    }

    pub fn allowed_mime_types(&self) -> &'static [&'static str] {
        match self {
            AssetType::Model => &["model/gltf-binary", "model/gltf+json"],
            AssetType::Texture => &["image/png", "image/jpeg", "image/gif", "image/webp"],
            AssetType::Audio => &["audio/mpeg", "audio/ogg", "audio/wav"],
            AssetType::Video => &["video/mp4", "video/webm"],
        }
    }

    pub fn allowed_extensions(&self) -> &'static [&'static str] {
        match self {
            AssetType::Model => &["glb", "gltf"],
            AssetType::Texture => &["png", "jpg", "jpeg", "gif", "webp"],
            AssetType::Audio => &["mp3", "ogg", "wav"],
            AssetType::Video => &["mp4", "webm"],
        }
    }
}

/// Public asset data type (excludes internal fields)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Asset {
    pub id: i32,
    pub asset_id: String,
    pub owner_id: String,
    pub asset_type: AssetType,
    pub file_name: String,
    pub file_path: String,
    pub file_size: i64,
    pub mime_type: String,
    pub metadata: Option<serde_json::Value>,
    pub is_public: bool,
    pub created_at: DateTime,
}

impl From<Model> for Asset {
    fn from(model: Model) -> Self {
        Self {
            id: model.id,
            asset_id: model.asset_id,
            owner_id: model.owner_id,
            asset_type: AssetType::from_str(&model.asset_type),
            file_name: model.file_name,
            file_path: model.file_path,
            file_size: model.file_size,
            mime_type: model.mime_type,
            metadata: model.metadata.map(|v| serde_json::Value::from(v.clone())),
            is_public: model.is_public,
            created_at: model.created_at,
        }
    }
}

/// Request to create an asset
#[derive(Debug, Deserialize)]
pub struct CreateAssetRequest {
    pub file_name: String,
    pub asset_type: AssetType,
    pub is_public: Option<bool>,
    pub metadata: Option<serde_json::Value>,
}

/// Query parameters for listing assets
#[derive(Debug, Deserialize)]
pub struct ListAssetsQuery {
    pub asset_type: Option<AssetType>,
    pub is_public: Option<bool>,
    pub page: Option<u64>,
    pub per_page: Option<u64>,
}

/// Database operations for assets
pub struct AssetModel;

impl AssetModel {
    pub async fn create(
        db: &DatabaseConnection,
        asset_id: String,
        owner_id: String,
        asset_type: AssetType,
        file_name: String,
        file_path: String,
        file_size: i64,
        mime_type: String,
        metadata: Option<serde_json::Value>,
        is_public: bool,
    ) -> crate::Result<Asset> {
        let now = chrono::Utc::now().naive_utc();
        let model = ActiveModel {
            asset_id: Set(asset_id),
            owner_id: Set(owner_id),
            asset_type: Set(asset_type.as_str().to_string()),
            file_name: Set(file_name),
            file_path: Set(file_path),
            file_size: Set(file_size),
            mime_type: Set(mime_type),
            metadata: Set(metadata.map(|v| v.into())),
            is_public: Set(is_public),
            created_at: Set(now),
            updated_at: Set(now),
            ..Default::default()
        };

        let result = model.insert(db).await?;
        Ok(Asset::from(result))
    }

    pub async fn find_by_asset_id(db: &DatabaseConnection, asset_id: &str) -> crate::Result<Option<Asset>> {
        let result = Entity::find()
            .filter(Column::AssetId.eq(asset_id))
            .one(db)
            .await?;
        Ok(result.map(Asset::from))
    }

    pub async fn list_by_owner(
        db: &DatabaseConnection,
        owner_id: &str,
        asset_type: Option<AssetType>,
        page: u64,
        per_page: u64,
    ) -> crate::Result<(Vec<Asset>, u64)> {
        let mut query = Entity::find().filter(Column::OwnerId.eq(owner_id));

        if let Some(asset_type) = asset_type {
            query = query.filter(Column::AssetType.eq(asset_type.as_str()));
        }

        let paginator = query.paginate(db, per_page);
        let total_pages = paginator.num_pages().await?;
        let results = paginator.fetch_page(page.saturating_sub(1)).await?;

        Ok((results.into_iter().map(Asset::from).collect(), total_pages))
    }

    pub async fn delete(db: &DatabaseConnection, asset_id: &str, owner_id: &str) -> crate::Result<bool> {
        let result = Entity::delete_many()
            .filter(Column::AssetId.eq(asset_id))
            .filter(Column::OwnerId.eq(owner_id))
            .exec(db)
            .await?;

        Ok(result.rows_affected > 0)
    }
}
