//! Room state model

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "room_states")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub room_id: String,
    pub name: String,
    pub description: Option<String>,
    pub entities: serde_json::Value,
    pub environment: serde_json::Value,
    pub last_modified: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::rooms::Entity",
        from = "Column::RoomId",
        to = "super::rooms::Column::RoomId",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Room,
}

impl ActiveModelBehavior for ActiveModel {}

impl RoomStateModel {
    pub async fn find_by_room_id(db: &DatabaseConnection, room_id: &str) -> Result<Option<Model>, DbErr> {
        RoomState::find()
            .filter(Column::RoomId.eq(room_id))
            .one(db)
            .await
    }

    pub async fn save_room_state(
        db: &DatabaseConnection,
        room_id: &str,
        name: String,
        description: Option<String>,
        entities: serde_json::Value,
        environment: serde_json::Value,
    ) -> Result<Model, DbErr> {
        let now = chrono::Utc::now();

        match RoomState::find()
            .filter(Column::RoomId.eq(room_id))
            .one(db)
            .await?
        {
            Some(existing) => {
                let mut active_model: ActiveModel = existing.into();
                active_model.name = Set(name);
                active_model.description = Set(description);
                active_model.entities = Set(entities);
                active_model.environment = Set(environment);
                active_model.last_modified = Set(now.into());
                active_model.update(db).await
            }
            None => {
                let new_room_state = ActiveModel {
                    id: Set(Uuid::new_v4()),
                    room_id: Set(room_id.to_string()),
                    name,
                    description,
                    entities: Set(entities),
                    environment: Set(environment),
                    last_modified: Set(now.into()),
                };
                new_room_state.insert(db).await
            }
        }
    }

    pub async fn delete_by_room_id(db: &DatabaseConnection, room_id: &str) -> Result<DeleteResult, DbErr> {
        RoomState::delete_many()
            .filter(Column::RoomId.eq(room_id))
            .exec(db)
            .await
    }
}
