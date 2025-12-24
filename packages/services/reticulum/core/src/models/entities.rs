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
pub struct EntityData {
    pub entity_id: String,
    pub room_id: String,
    pub template_id: String,
    pub owner_id: String,
    pub position: Vector3,
    pub rotation: Quaternion,
    pub components: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vector3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Quaternion {
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub w: f32,
}

impl From<Model> for EntityData {
    fn from(model: Model) -> Self {
        // The JsonValue from sea_query is an enum, but we can use the unsafe approach
        // or just treat it as serde_json::Value since that's what it contains
        // For now, use a workaround by serializing and deserializing

        let position: Vector3 = serde_json::from_value(
            serde_json::to_value(&model.position).unwrap_or(serde_json::json!({"x": 0.0, "y": 0.0, "z": 0.0}))
        ).unwrap_or(Vector3 { x: 0.0, y: 0.0, z: 0.0 });

        let rotation: Quaternion = serde_json::from_value(
            serde_json::to_value(&model.rotation).unwrap_or(serde_json::json!({"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0}))
        ).unwrap_or(Quaternion { x: 0.0, y: 0.0, z: 0.0, w: 1.0 });

        let components = serde_json::to_value(&model.components)
            .unwrap_or(serde_json::Value::Object(serde_json::Map::new()));

        Self {
            entity_id: model.entity_id,
            room_id: model.room_id,
            template_id: model.template_id,
            owner_id: model.owner_id,
            position,
            rotation,
            components,
        }
    }
}

pub struct EntityModel;

impl EntityModel {
    pub async fn find_by_room(db: &DatabaseConnection, room_id: &str) -> crate::Result<Vec<EntityData>> {
        let results = Entity::find()
            .filter(Column::RoomId.eq(room_id))
            .all(db)
            .await?;
        Ok(results.into_iter().map(EntityData::from).collect())
    }

    pub async fn find_by_entity_id(db: &DatabaseConnection, entity_id: &str) -> crate::Result<Option<EntityData>> {
        let result = Entity::find()
            .filter(Column::EntityId.eq(entity_id))
            .one(db)
            .await?;
        Ok(result.map(EntityData::from))
    }
}
