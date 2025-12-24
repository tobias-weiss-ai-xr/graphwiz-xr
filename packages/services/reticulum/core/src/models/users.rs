//! User model

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "users")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub display_name: String,
    pub email: String,
    pub password_hash: String,
    pub avatar_url: Option<String>,
    pub bio: Option<String>,
    pub created_at: DateTime,
    pub updated_at: DateTime,
    pub is_active: bool,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

// Public types with sensitive fields hidden
#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub display_name: String,
    pub email: String,
    pub avatar_url: Option<String>,
    pub bio: Option<String>,
    pub created_at: DateTime,
    pub is_active: bool,
}

impl From<Model> for User {
    fn from(model: Model) -> Self {
        Self {
            id: model.id,
            display_name: model.display_name,
            email: model.email,
            avatar_url: model.avatar_url,
            bio: model.bio,
            created_at: model.created_at,
            is_active: model.is_active,
        }
    }
}

pub struct UserModel;

impl UserModel {
    pub async fn find_by_id(db: &DatabaseConnection, id: i32) -> crate::Result<Option<User>> {
        let result = Entity::find_by_id(id).one(db).await?;
        Ok(result.map(User::from))
    }

    pub async fn find_by_email(db: &DatabaseConnection, email: &str) -> crate::Result<Option<User>> {
        let result = Entity::find()
            .filter(Column::Email.eq(email))
            .one(db)
            .await?;
        Ok(result.map(User::from))
    }

    pub async fn create(
        db: &DatabaseConnection,
        display_name: String,
        email: String,
        password_hash: String,
    ) -> crate::Result<User> {
        let now = chrono::Utc::now().naive_utc();
        let model = ActiveModel {
            display_name: Set(display_name),
            email: Set(email),
            password_hash: Set(password_hash),
            created_at: Set(now),
            updated_at: Set(now),
            is_active: Set(true),
            ..Default::default()
        };

        let result = model.insert(db).await?;
        Ok(User::from(result))
    }
}
