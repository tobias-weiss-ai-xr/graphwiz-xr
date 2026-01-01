//! Magic Link Token model

use sea_orm::entity::prelude::*;
use sea_orm::ColumnTrait;
use sea_orm::ActiveValue::Set;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "magic_link_tokens")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub token: String,
    pub email: String,
    pub expires_at: DateTime,
    pub used_at: Option<DateTime>,
    pub created_at: DateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

// Re-export commonly used types from the generated entity
pub use Entity as MagicLinkTokenEntity;

pub struct MagicLinkTokenModel;

impl MagicLinkTokenModel {
    pub async fn find_by_token(
        db: &DatabaseConnection,
        token: &str,
    ) -> crate::Result<Option<Model>> {
        let result = Entity::find()
            .filter(Column::Token.eq(token))
            .one(db)
            .await?;
        Ok(result)
    }

    pub async fn delete_expired(db: &DatabaseConnection) -> crate::Result<u64> {
        let now = chrono::Utc::now().naive_utc();
        let result = Entity::delete_many()
            .filter(Column::ExpiresAt.lt(now))
            .filter(Column::UsedAt.is_null())
            .exec(db)
            .await?;
        Ok(result.rows_affected)
    }

    pub async fn delete_by_email(db: &DatabaseConnection, email: &str) -> crate::Result<u64> {
        let result = Entity::delete_many()
            .filter(Column::Email.eq(email))
            .filter(Column::UsedAt.is_null())
            .exec(db)
            .await?;
        Ok(result.rows_affected)
    }

    pub async fn mark_used(
        db: &DatabaseConnection,
        token_id: i32,
    ) -> crate::Result<Model> {
        let now = chrono::Utc::now().naive_utc();
        let model = ActiveModel {
            id: Set(token_id),
            used_at: Set(Some(now)),
            ..Default::default()
        };

        let result = model.update(db).await?;
        Ok(result)
    }

    pub async fn cleanup_old_tokens(db: &DatabaseConnection, days: i64) -> crate::Result<u64> {
        let cutoff = chrono::Utc::now().naive_utc() - chrono::Duration::days(days);
        let result = Entity::delete_many()
            .filter(Column::CreatedAt.lt(cutoff))
            .filter(Column::UsedAt.is_not_null())
            .exec(db)
            .await?;
        Ok(result.rows_affected)
    }
}
