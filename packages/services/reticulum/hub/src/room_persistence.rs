//! Room template and persistence system

use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

/// Room template for predefined configurations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoomTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String, // "meeting", "social", "gaming", "education", etc.
    pub is_default: bool,
    pub thumbnail_url: Option<String>,
}

/// Complete room state for persistence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoomState {
    pub room_id: String,
    pub name: String,
    pub description: Option<String>,
    pub entities: Vec<EntityState>,
    pub environment: EnvironmentSettings,
    pub last_modified: DateTime<Utc>,
}

/// Individual entity state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntityState {
    pub entity_id: String,
    pub entity_type: String, // "cube", "sphere", "model", etc.
    pub position: Vector3,
    pub rotation: Quaternion,
    pub scale: Vector3,
    pub model_url: Option<String>,
    pub metadata: serde_json::Value,
}

/// Environment settings (lighting, skybox, etc.)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentSettings {
    pub lighting_type: String, // "default", "baked", "dynamic"
    pub skybox_url: Option<String>,
    pub ambient_color: [f32; 3], // RGB
    pub background_color: [f32; 3], // RGB
    pub fog_enabled: bool,
    pub fog_color: [f32; 3],
    pub fog_density: f32,
}

/// 3D Vector
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vector3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

/// Quaternion rotation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Quaternion {
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub w: f32,
}

/// Room clone request
#[derive(Debug, Serialize, Deserialize)]
pub struct CloneRoomRequest {
    pub source_room_id: String,
    pub new_name: String,
    pub new_description: Option<String>,
}

/// Room save request
#[derive(Debug, Serialize, Deserialize)]
pub struct SaveRoomRequest {
    pub room_id: String,
    pub name: Option<String>,
    pub description: Option<String>,
}

/// Room load response
#[derive(Debug, Serialize, Deserialize)]
pub struct LoadRoomResponse {
    pub success: bool,
    pub room_state: Option<RoomState>,
    pub message: String,
}

/// Predefined room templates
pub fn get_default_templates() -> Vec<RoomTemplate> {
    vec![
        RoomTemplate {
            id: "empty-meeting".to_string(),
            name: "Empty Meeting Room".to_string(),
            description: "A blank room ready for your meeting".to_string(),
            category: "meeting".to_string(),
            is_default: true,
            thumbnail_url: None,
        },
        RoomTemplate {
            id: "lobby-social".to_string(),
            name: "Social Lobby".to_string(),
            description: "Welcoming lobby for social gatherings".to_string(),
            category: "social".to_string(),
            is_default: true,
            thumbnail_url: None,
        },
        RoomTemplate {
            id: "game-room".to_string(),
            name: "Game Room".to_string(),
            description: "Simple game room with interactive elements".to_string(),
            category: "gaming".to_string(),
            is_default: true,
            thumbnail_url: None,
        },
        RoomTemplate {
            id: "classroom".to_string(),
            name: "Classroom".to_string(),
            description: "Educational room with presentation screen".to_string(),
            category: "education".to_string(),
            is_default: true,
            thumbnail_url: None,
        },
    ]
}

/// Create room from template
pub fn create_room_from_template(template: &RoomTemplate, creator_id: String) -> RoomState {
    let now = Utc::now();

    RoomState {
        room_id: uuid::Uuid::new_v4().to_string(),
        name: template.name.clone(),
        description: Some(template.description.clone()),
        entities: vec![],
        environment: EnvironmentSettings {
            lighting_type: "default".to_string(),
            skybox_url: None,
            ambient_color: [0.5, 0.5, 0.5],
            background_color: [0.1, 0.1, 0.15],
            fog_enabled: false,
            fog_color: [0.5, 0.5, 0.5],
            fog_density: 0.0,
        },
        last_modified: now,
    }
}
