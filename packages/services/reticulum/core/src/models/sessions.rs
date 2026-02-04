//! Session model

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "sessions")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub session_id: String,
    pub user_id: String,
    pub room_id: Option<String>,
    pub client_id: String,
    pub created_at: DateTime,
    pub expires_at: DateTime,
    pub is_active: bool,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Serialize, Deserialize)]
pub struct Session {
    pub session_id: String,
    pub user_id: String,
    pub room_id: Option<String>,
    pub client_id: String,
    pub created_at: DateTime,
    pub expires_at: DateTime,
}

impl From<Model> for Session {
    fn from(model: Model) -> Self {
        Self {
            session_id: model.session_id,
            user_id: model.user_id,
            room_id: model.room_id,
            client_id: model.client_id,
            created_at: model.created_at,
            expires_at: model.expires_at,
        }
    }
}

pub struct SessionModel;

impl SessionModel {
    pub async fn find_by_session_id(
        db: &DatabaseConnection,
        session_id: &str,
    ) -> crate::Result<Option<Session>> {
        let result = Entity::find()
            .filter(Column::SessionId.eq(session_id))
            .filter(Column::IsActive.eq(true))
            .filter(Column::ExpiresAt.gte(chrono::Utc::now().naive_utc()))
            .one(db)
            .await?;
        Ok(result.map(Session::from))
    }

    pub async fn find_by_user(
        db: &DatabaseConnection,
        user_id: &str,
    ) -> crate::Result<Vec<Session>> {
        let results = Entity::find()
            .filter(Column::UserId.eq(user_id))
            .filter(Column::IsActive.eq(true))
            .all(db)
            .await?;
        Ok(results.into_iter().map(Session::from).collect())
    }

    pub async fn find_by_room(
        db: &DatabaseConnection,
        room_id: &str,
    ) -> crate::Result<Vec<Session>> {
        let results = Entity::find()
            .filter(Column::RoomId.eq(room_id))
            .filter(Column::IsActive.eq(true))
            .all(db)
            .await?;
        Ok(results.into_iter().map(Session::from).collect())
    }
}
