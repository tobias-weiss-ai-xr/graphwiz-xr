//! Room state management

use reticulum_core::{db, models as core_models, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Clone, Serialize, Deserialize)]
pub struct RoomState {
    pub room_id: String,
    pub name: String,
    pub description: Option<String>,
    pub max_players: i32,
    pub current_players: i32,
    pub created_by: String,
    pub entities: HashMap<String, core_models::EntityData>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct SpawnEntityRequest {
    pub entity_id: String,
    pub template_id: String,
    pub owner_id: String,
    pub position: core_models::Vector3,
    pub rotation: core_models::Quaternion,
    pub components: serde_json::Value,
}

impl SpawnEntityRequest {
    /// Convert to EntityData by adding room_id
    pub fn to_entity_data(&self, room_id: String) -> core_models::EntityData {
        core_models::EntityData {
            entity_id: self.entity_id.clone(),
            room_id,
            template_id: self.template_id.clone(),
            owner_id: self.owner_id.clone(),
            position: self.position.clone(),
            rotation: self.rotation.clone(),
            components: self.components.clone(),
        }
    }
}

pub struct RoomManager {
    pub rooms: Arc<RwLock<HashMap<String, RoomState>>>,
}

impl RoomManager {
    pub fn new() -> Self {
        Self {
            rooms: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Get a room state, loading from database if not in memory
    pub async fn get_room(&self, room_id: &str, db: &reticulum_core::DatabaseConnection) -> Result<Option<RoomState>> {
        {
            let rooms = self.rooms.read().await;
            if let Some(room) = rooms.get(room_id) {
                return Ok(Some(room.clone()));
            }
        }

        // Load from database
        if let Some(room) = core_models::RoomModel::find_by_room_id(db, room_id).await? {
            let state = RoomState {
                room_id: room.room_id.clone(),
                name: room.name.clone(),
                description: room.description,
                max_players: room.max_players,
                current_players: 0,
                created_by: room.created_by,
                entities: HashMap::new(),
            };

            let mut rooms = self.rooms.write().await;
            rooms.insert(room_id.to_string(), state.clone());
            Ok(Some(state))
        } else {
            Ok(None)
        }
    }

    /// Add a player to the room
    pub async fn add_player(&self, room_id: &str) -> Result<bool> {
        let mut rooms = self.rooms.write().await;
        if let Some(room) = rooms.get_mut(room_id) {
            if room.current_players < room.max_players {
                room.current_players += 1;
                Ok(true)
            } else {
                Ok(false)
            }
        } else {
            Ok(false)
        }
    }

    /// Remove a player from the room
    pub async fn remove_player(&self, room_id: &str) -> Result<()> {
        let mut rooms = self.rooms.write().await;
        if let Some(room) = rooms.get_mut(room_id) {
            room.current_players = room.current_players.saturating_sub(1);
        }
        Ok(())
    }

    /// Spawn an entity in a room
    pub async fn spawn_entity(&self, room_id: &str, request: SpawnEntityRequest) -> Result<()> {
        let mut rooms = self.rooms.write().await;
        if let Some(room) = rooms.get_mut(room_id) {
            let entity_data = request.to_entity_data(room_id.to_string());
            room.entities.insert(entity_data.entity_id.clone(), entity_data);
        }
        Ok(())
    }

    /// Update an entity in a room
    pub async fn update_entity(&self, room_id: &str, entity_id: &str, entity: core_models::EntityData) -> Result<()> {
        let mut rooms = self.rooms.write().await;
        if let Some(room) = rooms.get_mut(room_id) {
            room.entities.insert(entity_id.to_string(), entity);
        }
        Ok(())
    }

    /// Despawn an entity from a room
    pub async fn despawn_entity(&self, room_id: &str, entity_id: &str) -> Result<()> {
        let mut rooms = self.rooms.write().await;
        if let Some(room) = rooms.get_mut(room_id) {
            room.entities.remove(entity_id);
        }
        Ok(())
    }

    /// Get all entities in a room
    pub async fn get_entities(&self, room_id: &str) -> Result<Vec<core_models::EntityData>> {
        let rooms = self.rooms.read().await;
        if let Some(room) = rooms.get(room_id) {
            Ok(room.entities.values().cloned().collect())
        } else {
            Ok(Vec::new())
        }
    }
}

impl Default for RoomManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_room_manager_creation() {
        let manager = RoomManager::new();
        assert_eq!(manager.rooms.read().await.len(), 0);
    }
}
