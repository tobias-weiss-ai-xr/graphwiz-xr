//! Room state management

use reticulum_core::{models as core_models, Result};
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
            room.current_players = room.current_players.saturating_sub(1).max(0);
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
    use reticulum_core::models::{Vector3, Quaternion};

    fn create_test_room(room_id: &str) -> RoomState {
        RoomState {
            room_id: room_id.to_string(),
            name: format!("Test Room {}", room_id),
            description: Some("A test room".to_string()),
            max_players: 10,
            current_players: 0,
            created_by: "test_user".to_string(),
            entities: HashMap::new(),
        }
    }

    fn create_test_spawn_request(entity_id: &str, owner_id: &str) -> SpawnEntityRequest {
        SpawnEntityRequest {
            entity_id: entity_id.to_string(),
            template_id: "cube".to_string(),
            owner_id: owner_id.to_string(),
            position: Vector3 { x: 0.0, y: 0.0, z: 0.0 },
            rotation: Quaternion { x: 0.0, y: 0.0, z: 0.0, w: 1.0 },
            components: serde_json::json!({}),
        }
    }

    #[tokio::test]
    async fn test_room_manager_creation() {
        let manager = RoomManager::new();
        assert_eq!(manager.rooms.read().await.len(), 0);
    }

    #[tokio::test]
    async fn test_room_manager_default() {
        let manager = RoomManager::default();
        assert_eq!(manager.rooms.read().await.len(), 0);
    }

    #[tokio::test]
    async fn test_add_player_to_nonexistent_room() {
        let manager = RoomManager::new();
        let result = manager.add_player("nonexistent").await.unwrap();
        assert!(!result); // Should return false for non-existent room
    }

    #[tokio::test]
    async fn test_add_and_remove_player() {
        let manager = RoomManager::new();
        let room_id = "test_room_1";

        // Manually insert a test room
        {
            let mut rooms = manager.rooms.write().await;
            rooms.insert(room_id.to_string(), create_test_room(room_id));
        }

        // Add player
        let added = manager.add_player(room_id).await.unwrap();
        assert!(added);

        let rooms = manager.rooms.read().await;
        let room = rooms.get(room_id).unwrap();
        assert_eq!(room.current_players, 1);
        drop(rooms);

        // Add another player
        let added = manager.add_player(room_id).await.unwrap();
        assert!(added);

        let rooms = manager.rooms.read().await;
        let room = rooms.get(room_id).unwrap();
        assert_eq!(room.current_players, 2);
        drop(rooms);

        // Remove player
        manager.remove_player(room_id).await.unwrap();

        let rooms = manager.rooms.read().await;
        let room = rooms.get(room_id).unwrap();
        assert_eq!(room.current_players, 1);
    }

    #[tokio::test]
    async fn test_add_player_beyond_capacity() {
        let manager = RoomManager::new();
        let room_id = "test_room_capacity";

        // Create a room with max 2 players
        let mut room = create_test_room(room_id);
        room.max_players = 2;

        {
            let mut rooms = manager.rooms.write().await;
            rooms.insert(room_id.to_string(), room);
        }

        // Add first player
        let added = manager.add_player(room_id).await.unwrap();
        assert!(added);

        // Add second player
        let added = manager.add_player(room_id).await.unwrap();
        assert!(added);

        // Try to add third player (should fail)
        let added = manager.add_player(room_id).await.unwrap();
        assert!(!added);

        let rooms = manager.rooms.read().await;
        let room = rooms.get(room_id).unwrap();
        assert_eq!(room.current_players, 2);
    }

    #[tokio::test]
    async fn test_remove_player_from_empty_room() {
        let manager = RoomManager::new();
        let room_id = "test_room_empty";

        {
            let mut rooms = manager.rooms.write().await;
            rooms.insert(room_id.to_string(), create_test_room(room_id));
        }

        // Remove player when count is 0 (should saturate at 0)
        manager.remove_player(room_id).await.unwrap();

        let rooms = manager.rooms.read().await;
        let room = rooms.get(room_id).unwrap();
        assert_eq!(room.current_players, 0);
    }

    #[tokio::test]
    async fn test_spawn_entity() {
        let manager = RoomManager::new();
        let room_id = "test_room_spawn";
        let entity_id = "entity_1";
        let owner_id = "user_1";

        {
            let mut rooms = manager.rooms.write().await;
            rooms.insert(room_id.to_string(), create_test_room(room_id));
        }

        let request = create_test_spawn_request(entity_id, owner_id);
        manager.spawn_entity(room_id, request).await.unwrap();

        let rooms = manager.rooms.read().await;
        let room = rooms.get(room_id).unwrap();
        assert_eq!(room.entities.len(), 1);
        assert!(room.entities.contains_key(entity_id));
    }

    #[tokio::test]
    async fn test_spawn_multiple_entities() {
        let manager = RoomManager::new();
        let room_id = "test_room_multi_spawn";

        {
            let mut rooms = manager.rooms.write().await;
            rooms.insert(room_id.to_string(), create_test_room(room_id));
        }

        // Spawn multiple entities
        for i in 0..5 {
            let entity_id = format!("entity_{}", i);
            let request = create_test_spawn_request(&entity_id, "user_1");
            manager.spawn_entity(room_id, request).await.unwrap();
        }

        let rooms = manager.rooms.read().await;
        let room = rooms.get(room_id).unwrap();
        assert_eq!(room.entities.len(), 5);
    }

    #[tokio::test]
    async fn test_despawn_entity() {
        let manager = RoomManager::new();
        let room_id = "test_room_despawn";
        let entity_id = "entity_1";

        {
            let mut rooms = manager.rooms.write().await;
            rooms.insert(room_id.to_string(), create_test_room(room_id));
        }

        // Spawn entity
        let request = create_test_spawn_request(entity_id, "user_1");
        manager.spawn_entity(room_id, request).await.unwrap();

        // Verify it exists
        let rooms = manager.rooms.read().await;
        assert_eq!(rooms.get(room_id).unwrap().entities.len(), 1);
        drop(rooms);

        // Despawn entity
        manager.despawn_entity(room_id, entity_id).await.unwrap();

        // Verify it's gone
        let rooms = manager.rooms.read().await;
        assert_eq!(rooms.get(room_id).unwrap().entities.len(), 0);
    }

    #[tokio::test]
    async fn test_despawn_nonexistent_entity() {
        let manager = RoomManager::new();
        let room_id = "test_room_despawn_missing";

        {
            let mut rooms = manager.rooms.write().await;
            rooms.insert(room_id.to_string(), create_test_room(room_id));
        }

        // Despawn non-existent entity (should not error)
        let result = manager.despawn_entity(room_id, "nonexistent").await;
        assert!(result.is_ok());

        let rooms = manager.rooms.read().await;
        assert_eq!(rooms.get(room_id).unwrap().entities.len(), 0);
    }

    #[tokio::test]
    async fn test_update_entity() {
        let manager = RoomManager::new();
        let room_id = "test_room_update";
        let entity_id = "entity_1";

        {
            let mut rooms = manager.rooms.write().await;
            rooms.insert(room_id.to_string(), create_test_room(room_id));
        }

        // Spawn entity
        let request = create_test_spawn_request(entity_id, "user_1");
        manager.spawn_entity(room_id, request).await.unwrap();

        // Update entity
        let updated_entity = reticulum_core::models::EntityData {
            entity_id: entity_id.to_string(),
            room_id: room_id.to_string(),
            template_id: "updated_cube".to_string(),
            owner_id: "user_1".to_string(),
            position: Vector3 { x: 10.0, y: 20.0, z: 30.0 },
            rotation: Quaternion { x: 0.0, y: 1.0, z: 0.0, w: 0.0 },
            components: serde_json::json!({"updated": true}),
        };

        manager.update_entity(room_id, entity_id, updated_entity.clone()).await.unwrap();

        let rooms = manager.rooms.read().await;
        let room = rooms.get(room_id).unwrap();
        let entity = room.entities.get(entity_id).unwrap();

        assert_eq!(entity.template_id, "updated_cube");
        assert_eq!(entity.position.x, 10.0);
        assert_eq!(entity.position.y, 20.0);
        assert_eq!(entity.position.z, 30.0);
    }

    #[tokio::test]
    async fn test_get_entities() {
        let manager = RoomManager::new();
        let room_id = "test_room_get_entities";

        {
            let mut rooms = manager.rooms.write().await;
            rooms.insert(room_id.to_string(), create_test_room(room_id));
        }

        // Spawn multiple entities
        for i in 0..3 {
            let entity_id = format!("entity_{}", i);
            let request = create_test_spawn_request(&entity_id, "user_1");
            manager.spawn_entity(room_id, request).await.unwrap();
        }

        // Get all entities
        let entities = manager.get_entities(room_id).await.unwrap();
        assert_eq!(entities.len(), 3);

        // Get entities from non-existent room
        let entities = manager.get_entities("nonexistent").await.unwrap();
        assert_eq!(entities.len(), 0);
    }

    #[tokio::test]
    async fn test_multiple_rooms() {
        let manager = RoomManager::new();

        // Create multiple rooms
        for i in 0..3 {
            let room_id = format!("room_{}", i);
            let mut rooms = manager.rooms.write().await;
            rooms.insert(room_id.clone(), create_test_room(&room_id));
        }

        // Verify all rooms exist
        let rooms = manager.rooms.read().await;
        assert_eq!(rooms.len(), 3);
    }

    #[tokio::test]
    async fn test_spawn_entity_request_to_entity_data() {
        let request = SpawnEntityRequest {
            entity_id: "entity_123".to_string(),
            template_id: "template_abc".to_string(),
            owner_id: "owner_xyz".to_string(),
            position: Vector3 { x: 1.0, y: 2.0, z: 3.0 },
            rotation: Quaternion { x: 0.0, y: 0.0, z: 0.0, w: 1.0 },
            components: serde_json::json!({"key": "value"}),
        };

        let entity_data = request.to_entity_data("room_456".to_string());

        assert_eq!(entity_data.entity_id, "entity_123");
        assert_eq!(entity_data.template_id, "template_abc");
        assert_eq!(entity_data.owner_id, "owner_xyz");
        assert_eq!(entity_data.room_id, "room_456");
        assert_eq!(entity_data.position.x, 1.0);
        assert_eq!(entity_data.position.y, 2.0);
        assert_eq!(entity_data.position.z, 3.0);
    }

    #[tokio::test]
    async fn test_room_state_serialization() {
        let room = create_test_room("test_serialization");

        // Test serialization
        let serialized = serde_json::to_string(&room);
        assert!(serialized.is_ok());

        // Test deserialization
        let serialized_str = serialized.unwrap();
        let deserialized: RoomState = serde_json::from_str(&serialized_str).unwrap();

        assert_eq!(room.room_id, deserialized.room_id);
        assert_eq!(room.name, deserialized.name);
        assert_eq!(room.max_players, deserialized.max_players);
    }
}
