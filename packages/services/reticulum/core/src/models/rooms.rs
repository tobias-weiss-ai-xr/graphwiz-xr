//! Room model

use sea_orm::entity::prelude::*;
use sea_orm::ActiveValue::Set;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "rooms")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub room_id: String,
    pub name: String,
    pub description: Option<String>,
    pub max_players: i32,
    pub is_private: bool,
    pub created_by: String,
    pub created_at: DateTime,
    pub updated_at: DateTime,
    pub is_active: bool,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::users::Entity",
        from = "Column::CreatedBy",
        to = "super::users::Column::Email"
    )]
    User,
}

impl Related<super::users::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Serialize, Deserialize)]
pub struct Room {
    pub id: i32,
    pub room_id: String,
    pub name: String,
    pub description: Option<String>,
    pub max_players: i32,
    pub is_private: bool,
    pub created_by: String,
    pub created_at: DateTime,
    pub is_active: bool,
}

impl From<Model> for Room {
    fn from(model: Model) -> Self {
        Self {
            id: model.id,
            room_id: model.room_id,
            name: model.name,
            description: model.description,
            max_players: model.max_players,
            is_private: model.is_private,
            created_by: model.created_by,
            created_at: model.created_at,
            is_active: model.is_active,
        }
    }
}

pub struct RoomModel;

impl RoomModel {
    pub async fn find_by_room_id(db: &DatabaseConnection, room_id: &str) -> crate::Result<Option<Room>> {
        let result = Entity::find()
            .filter(Column::RoomId.eq(room_id))
            .filter(Column::IsActive.eq(true))
            .one(db)
            .await?;
        Ok(result.map(Room::from))
    }

    pub async fn list_active(db: &DatabaseConnection) -> crate::Result<Vec<Room>> {
        let results = Entity::find()
            .filter(Column::IsActive.eq(true))
            .all(db)
            .await?;
        Ok(results.into_iter().map(Room::from).collect())
    }

    pub async fn create(
        db: &DatabaseConnection,
        room_id: String,
        name: String,
        description: Option<String>,
        created_by: String,
    ) -> crate::Result<Room> {
        let now = chrono::Utc::now().naive_utc();
        let model = ActiveModel {
            room_id: Set(room_id),
            name: Set(name),
            description: Set(description),
            max_players: Set(50),
            is_private: Set(false),
            created_by: Set(created_by),
            created_at: Set(now),
            updated_at: Set(now),
            is_active: Set(true),
            ..Default::default()
        };

        let result = model.insert(db).await?;
        Ok(Room::from(result))
    }
}
