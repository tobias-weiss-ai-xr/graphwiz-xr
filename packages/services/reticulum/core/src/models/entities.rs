//! Entity model

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "entities")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub entity_id: String,
    pub room_id: String,
    pub template_id: String,
    pub owner_id: String,
    pub position: Json, // Vector3
    pub rotation: Json, // Quaternion
    pub components: Json, // Map<String, Value>
    pub created_at: DateTime,
    pub updated_at: DateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Serialize, Deserialize)]
pub struct Entity {
    pub entity_id: String,
    pub room_id: String,
    pub template_id: String,
    pub owner_id: String,
    pub position: Vector3,
    pub rotation: Quaternion,
    pub components: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Vector3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Quaternion {
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub w: f32,
}

impl From<Model> for Entity {
    fn from(model: Model) -> Self {
        Self {
            entity_id: model.entity_id,
            room_id: model.room_id,
            template_id: model.template_id,
            owner_id: model.owner_id,
            position: model.position.into_json().and_then(|j| serde_json::from_value(j)).unwrap_or(Vector3 { x: 0.0, y: 0.0, z: 0.0 }),
            rotation: model.rotation.into_json().and_then(|j| serde_json::from_value(j)).unwrap_or(Quaternion { x: 0.0, y: 0.0, z: 0.0, w: 1.0 }),
            components: model.components.into_json().unwrap_or(serde_json::Value::Object(serde_json::Map::new())),
        }
    }
}

pub struct EntityModel;

impl EntityModel {
    pub async fn find_by_room(db: &DatabaseConnection, room_id: &str) -> crate::Result<Vec<Entity>> {
        let results = Entity::find()
            .filter(Column::RoomId.eq(room_id))
            .all(db)
            .await?;
        Ok(results.into_iter().map(Entity::from).collect())
    }

    pub async fn find_by_entity_id(db: &DatabaseConnection, entity_id: &str) -> crate::Result<Option<Entity>> {
        let result = Entity::find()
            .filter(Column::EntityId.eq(entity_id))
            .one(db)
            .await?;
        Ok(result.map(Entity::from))
    }
}
