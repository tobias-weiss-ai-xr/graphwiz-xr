//! Room state model

use sea_orm::entity::prelude::*;
use sea_orm::{ActiveValue, DeleteResult, QuerySelect};
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

pub struct RoomStateModel;

impl RoomStateModel {
    pub async fn find_by_room_id(
        db: &DatabaseConnection,
        room_id: &str,
    ) -> Result<Option<Model>, DbErr> {
        Entity::find()
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

        match Entity::find()
            .filter(Column::RoomId.eq(room_id))
            .one(db)
            .await?
        {
            Some(existing) => {
                let mut active_model: ActiveModel = existing.into();
                active_model.name = ActiveValue::Set(name);
                active_model.description = ActiveValue::Set(description);
                active_model.entities = ActiveValue::Set(entities);
                active_model.environment = ActiveValue::Set(environment);
                active_model.last_modified = ActiveValue::Set(now.into());
                active_model.update(db).await
            }
            None => {
                let new_room_state = ActiveModel {
                    id: ActiveValue::Set(Uuid::new_v4()),
                    room_id: ActiveValue::Set(room_id.to_string()),
                    name: ActiveValue::Set(name),
                    description: ActiveValue::Set(description),
                    entities: ActiveValue::Set(entities),
                    environment: ActiveValue::Set(environment),
                    last_modified: ActiveValue::Set(now.into()),
                };
                new_room_state.insert(db).await
            }
        }
    }

    pub async fn delete_by_room_id(
        db: &DatabaseConnection,
        room_id: &str,
    ) -> Result<DeleteResult, DbErr> {
        Entity::delete_many()
            .filter(Column::RoomId.eq(room_id))
            .exec(db)
            .await
    }
}
