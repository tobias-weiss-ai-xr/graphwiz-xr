//! Database operations for avatar configurations

use crate::models::{AvatarConfig, BodyType};
use chrono::{DateTime, Utc};
use reticulum_core::Config;
use sqlx::{PgPool, Row};
use uuid::Uuid;

/// Avatar record from database
#[derive(Debug)]
pub struct AvatarRecord {
    pub user_id: Uuid,
    pub body_type: BodyType,
    pub primary_color: String,
    pub secondary_color: String,
    pub height: f32,
    pub custom_model_id: Option<Uuid>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Avatar repository
pub struct AvatarRepository {
    pool: PgPool,
}

impl AvatarRepository {
    /// Create new repository from config
    pub async fn from_config(config: &Config) -> Result<Self, sqlx::Error> {
        let database_url = &config.database.url;
        let pool = PgPool::connect(database_url).await?;
        Ok(Self { pool })
    }

    /// Get avatar configuration for user
    pub async fn get_avatar(&self, user_id: Uuid) -> Result<Option<AvatarRecord>, sqlx::Error> {
        sqlx::query_as!(
            AvatarRecord,
            r#"
            SELECT
                user_id, body_type as "body_type: BodyType", primary_color, secondary_color,
                height, custom_model_id, metadata, created_at, updated_at
            FROM avatar_configs
            WHERE user_id = $1
            "#,
            user_id
        )
        .fetch_optional(&self.pool)
        .await
    }

    /// Create or update avatar configuration
    pub async fn upsert_avatar(&self, config: &AvatarConfig) -> Result<AvatarRecord, sqlx::Error> {
        let now = Utc::now();

        sqlx::query_as!(
            AvatarRecord,
            r#"
            INSERT INTO avatar_configs (user_id, body_type, primary_color, secondary_color, height, custom_model_id, metadata, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (user_id)
            DO UPDATE SET
                body_type = EXCLUDED.body_type,
                primary_color = EXCLUDED.primary_color,
                secondary_color = EXCLUDED.secondary_color,
                height = EXCLUDED.height,
                custom_model_id = EXCLUDED.custom_model_id,
                metadata = EXCLUDED.metadata,
                updated_at = EXCLUDED.updated_at
            RETURNING
                user_id, body_type as "body_type: BodyType", primary_color, secondary_color,
                height, custom_model_id, metadata, created_at, updated_at
            "#,
            config.user_id,
            config.body_type,
            config.primary_color,
            config.secondary_color,
            config.height,
            config.custom_model_id,
            config.metadata,
            now,
            now
        )
        .fetch_one(&self.pool)
        .await
    }

    /// Delete avatar configuration
    pub async fn delete_avatar(&self, user_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query!("DELETE FROM avatar_configs WHERE user_id = $1", user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// List all avatars (for admin/debugging)
    pub async fn list_avatars(&self, limit: i64, offset: i64) -> Result<Vec<AvatarRecord>, sqlx::Error> {
        sqlx::query_as!(
            AvatarRecord,
            r#"
            SELECT
                user_id, body_type as "body_type: BodyType", primary_color, secondary_color,
                height, custom_model_id, metadata, created_at, updated_at
            FROM avatar_configs
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            "#,
            limit,
            offset
        )
        .fetch_all(&self.pool)
        .await
    }
}

/// Run database migrations
pub async fn run_migrations(config: &Config) -> Result<(), sqlx::Error> {
    let pool = PgPool::connect(&config.database.url).await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS avatar_configs (
            user_id UUID PRIMARY KEY,
            body_type VARCHAR(50) NOT NULL DEFAULT 'human',
            primary_color VARCHAR(7) NOT NULL DEFAULT '#4CAF50',
            secondary_color VARCHAR(7) NOT NULL DEFAULT '#2196F3',
            height FLOAT NOT NULL DEFAULT 1.7,
            custom_model_id UUID,
            metadata JSONB NOT NULL DEFAULT '{}',
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            CONSTRAINT fk_custom_model
                FOREIGN KEY (custom_model_id)
                REFERENCES assets(id)
                ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_avatar_configs_custom_model
            ON avatar_configs(custom_model_id);

        CREATE INDEX IF NOT EXISTS idx_avatar_configs_created_at
            ON avatar_configs(created_at DESC);
        "#,
    )
    .execute(&pool)
    .await?;

    log::info!("Avatar migrations completed successfully");
    Ok(())
}
