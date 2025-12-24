//! Auth-specific configuration

use serde::Deserialize;
use validator::Validate;

#[derive(Debug, Deserialize, Clone)]
pub struct AuthConfig {
    pub token_issuer: String,
    pub allowed_origins: Vec<String>,
}
