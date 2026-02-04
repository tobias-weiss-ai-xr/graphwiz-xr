//! OAuth Account model

use sea_orm::entity::prelude::*;
use sea_orm::ActiveValue::Set;
use sea_orm::ColumnTrait;
use serde::{Deserialize, Serialize};

/// OAuth provider types
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OAuthProvider {
    Github,
    Google,
    Discord,
}

impl OAuthProvider {
    /// Parse from string
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "github" => Some(OAuthProvider::Github),
            "google" => Some(OAuthProvider::Google),
            "discord" => Some(OAuthProvider::Discord),
            _ => None,
        }
    }

    /// Convert to string
    pub fn as_str(&self) -> &'static str {
        match self {
            OAuthProvider::Github => "github",
            OAuthProvider::Google => "google",
            OAuthProvider::Discord => "discord",
        }
    }

    /// Get environment variable prefix
    pub fn env_prefix(&self) -> &'static str {
        match self {
            OAuthProvider::Github => "GITHUB",
            OAuthProvider::Google => "GOOGLE",
            OAuthProvider::Discord => "DISCORD",
        }
    }

    /// Get authorization URL
    pub fn auth_url(&self) -> &'static str {
        match self {
            OAuthProvider::Github => "https://github.com/login/oauth/authorize",
            OAuthProvider::Google => "https://accounts.google.com/o/oauth2/v2/auth",
            OAuthProvider::Discord => "https://discord.com/api/oauth2/authorize",
        }
    }

    /// Get token URL
    pub fn token_url(&self) -> &'static str {
        match self {
            OAuthProvider::Github => "https://github.com/login/oauth/access_token",
            OAuthProvider::Google => "https://oauth2.googleapis.com/token",
            OAuthProvider::Discord => "https://discord.com/api/oauth2/token",
        }
    }

    /// Get user info URL
    pub fn user_info_url(&self) -> &'static str {
        match self {
            OAuthProvider::Github => "https://api.github.com/user",
            OAuthProvider::Google => "https://www.googleapis.com/oauth2/v2/userinfo",
            OAuthProvider::Discord => "https://discord.com/api/users/@me",
        }
    }
}

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "oauth_accounts")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub provider: String,
    pub provider_user_id: String,
    pub user_id: i32,
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
    pub expires_at: Option<DateTime>,
    pub created_at: DateTime,
    pub updated_at: DateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::users::Entity",
        from = "Column::UserId",
        to = "super::users::Column::Id"
    )]
    User,
}

impl ActiveModelBehavior for ActiveModel {}

pub struct OAuthAccountModel;

impl OAuthAccountModel {
    pub async fn find_by_provider(
        db: &DatabaseConnection,
        provider: OAuthProvider,
        provider_user_id: &str,
    ) -> crate::Result<Option<Model>> {
        let provider_str = provider.as_str().to_string();
        let result = Entity::find()
            .filter(Column::Provider.eq(provider_str))
            .filter(Column::ProviderUserId.eq(provider_user_id))
            .one(db)
            .await?;
        Ok(result)
    }

    pub async fn find_by_user(db: &DatabaseConnection, user_id: i32) -> crate::Result<Vec<Model>> {
        let result = Entity::find()
            .filter(Column::UserId.eq(user_id))
            .all(db)
            .await?;
        Ok(result)
    }

    pub async fn create(
        db: &DatabaseConnection,
        provider: OAuthProvider,
        provider_user_id: &str,
        user_id: i32,
        access_token: Option<String>,
        refresh_token: Option<String>,
    ) -> crate::Result<Model> {
        let now = chrono::Utc::now().naive_utc();
        let provider_str = provider.as_str().to_string();
        let model = ActiveModel {
            provider: Set(provider_str),
            provider_user_id: Set(provider_user_id.to_string()),
            user_id: Set(user_id),
            access_token: Set(access_token),
            refresh_token: Set(refresh_token),
            expires_at: Set(None),
            created_at: Set(now),
            updated_at: Set(now),
            ..Default::default()
        };

        let result = model.insert(db).await?;
        Ok(result)
    }

    pub async fn update_tokens(
        db: &DatabaseConnection,
        id: i32,
        access_token: Option<String>,
        refresh_token: Option<String>,
        expires_at: Option<DateTime>,
    ) -> crate::Result<Model> {
        let now = chrono::Utc::now().naive_utc();
        let model = ActiveModel {
            id: Set(id),
            access_token: Set(access_token),
            refresh_token: Set(refresh_token),
            expires_at: Set(expires_at),
            updated_at: Set(now),
            ..Default::default()
        };

        let result = model.update(db).await?;
        Ok(result)
    }
}
