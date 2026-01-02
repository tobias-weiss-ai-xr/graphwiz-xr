//! Avatar configuration models

use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

/// Avatar body types
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "varchar", rename_all = "lowercase")]
pub enum BodyType {
    Human,
    Robot,
    Alien,
    Animal,
    Abstract,
}

impl Default for BodyType {
    fn default() -> Self {
        Self::Human
    }
}

impl std::str::FromStr for BodyType {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "human" => Ok(Self::Human),
            "robot" => Ok(Self::Robot),
            "alien" => Ok(Self::Alien),
            "animal" => Ok(Self::Animal),
            "abstract" => Ok(Self::Abstract),
            _ => Err(format!("Unknown body type: {}", s)),
        }
    }
}

impl std::fmt::Display for BodyType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Human => write!(f, "human"),
            Self::Robot => write!(f, "robot"),
            Self::Alien => write!(f, "alien"),
            Self::Animal => write!(f, "animal"),
            Self::Abstract => write!(f, "abstract"),
        }
    }
}

/// Avatar configuration
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct AvatarConfig {
    pub user_id: Uuid,
    pub body_type: BodyType,

    /// Colors in hex format (e.g., "#FF0000")
    #[validate(length(min = 7, max = 7))]
    pub primary_color: String,

    #[validate(length(min = 7, max = 7))]
    pub secondary_color: String,

    /// Height in meters (0.5 to 3.0)
    #[validate(range(min = 0.5, max = 3.0))]
    pub height: f32,

    /// Reference to custom 3D model asset (optional)
    pub custom_model_id: Option<Uuid>,

    /// Additional customizations
    #[serde(default)]
    pub metadata: serde_json::Value,
}

impl Default for AvatarConfig {
    fn default() -> Self {
        Self {
            user_id: Uuid::new_v4(),
            body_type: BodyType::Human,
            primary_color: "#4CAF50".to_string(),
            secondary_color: "#2196F3".to_string(),
            height: 1.7,
            custom_model_id: None,
            metadata: serde_json::json!({}),
        }
    }
}

/// Avatar configuration update request
#[derive(Debug, Deserialize, Validate)]
pub struct UpdateAvatarRequest {
    pub body_type: Option<BodyType>,

    #[validate(length(min = 7, max = 7))]
    pub primary_color: Option<String>,

    #[validate(length(min = 7, max = 7))]
    pub secondary_color: Option<String>,

    #[validate(range(min = 0.5, max = 3.0))]
    pub height: Option<f32>,

    pub custom_model_id: Option<Uuid>,

    pub metadata: Option<serde_json::Value>,
}

/// Custom avatar model upload request
#[derive(Debug, Deserialize, Validate)]
pub struct CustomAvatarRequest {
    /// Asset ID from storage service
    pub asset_id: Uuid,

    /// Avatar name/description
    pub name: String,

    /// Preview thumbnail URL
    pub thumbnail_url: Option<String>,
}

/// Default avatar response
#[derive(Debug, Serialize)]
pub struct DefaultAvatarResponse {
    pub config: AvatarConfig,
    pub available_body_types: Vec<String>,
    pub available_colors: Vec<String>,
}

/// User avatar response
#[derive(Debug, Serialize)]
pub struct UserAvatarResponse {
    pub user_id: Uuid,
    pub config: AvatarConfig,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}
