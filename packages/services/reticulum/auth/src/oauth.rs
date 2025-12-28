//! OAuth authentication integration
//!
//! Supports OAuth2 authentication with GitHub, Google, and Discord

use oauth2::{
    AuthorizationCode, ClientId, ClientSecret, CsrfToken, RedirectUrl, Scope,
    TokenResponse, TokenUrl,
    basic::BasicClient,
    reqwest::async_http_client,
    AuthUrl, TokenType,
};
use serde::{Deserialize, Serialize};
use std::env;
use thiserror::Error;

use reticulum_core::{DatabaseConnection, models as core_models};

// Use OAuthProvider directly from core_models
pub use core_models::OAuthProvider;

/// OAuth configuration
#[derive(Debug, Clone)]
pub struct OAuthConfig {
    pub client_id: String,
    pub client_secret: String,
    pub redirect_uri: String,
}

impl OAuthConfig {
    /// Load from environment variables
    pub fn from_env(provider: OAuthProvider) -> Result<Self, OAuthError> {
        let prefix = provider.env_prefix();

        let client_id = env::var(format!("AUTH__{}_CLIENT_ID", prefix))
            .map_err(|_| OAuthError::MissingClientId(provider))?;

        let client_secret = env::var(format!("AUTH__{}_CLIENT_SECRET", prefix))
            .map_err(|_| OAuthError::MissingClientSecret(provider))?;

        let redirect_uri = env::var(format!("AUTH__{}_REDIRECT_URI", prefix))
            .unwrap_or_else(|_| "http://localhost:5173/auth/callback".to_string());

        Ok(Self {
            client_id,
            client_secret,
            redirect_uri,
        })
    }
}

/// OAuth user information from provider
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OAuthUserInfo {
    pub provider_id: String,
    pub email: Option<String>,
    pub name: Option<String>,
    pub avatar_url: Option<String>,
    pub username: Option<String>,
}

/// GitHub user info response
#[derive(Debug, Deserialize)]
struct GithubUser {
    id: u64,
    email: Option<String>,
    name: Option<String>,
    login: String,
    avatar_url: Option<String>,
}

/// Google user info response
#[derive(Debug, Deserialize)]
struct GoogleUser {
    id: String,
    email: String,
    name: String,
    picture: Option<String>,
    given_name: Option<String>,
    family_name: Option<String>,
}

/// Discord user info response
#[derive(Debug, Deserialize)]
struct DiscordUser {
    id: String,
    email: String,
    username: String,
    avatar: Option<String>,
    discriminator: String,
}

/// OAuth manager for handling OAuth flows
pub struct OAuthManager {
    pub provider: OAuthProvider,
    config: OAuthConfig,
    client: BasicClient,
}

impl OAuthManager {
    /// Create a new OAuth manager for the given provider
    pub fn new(provider: OAuthProvider) -> Result<Self, OAuthError> {
        let config = OAuthConfig::from_env(provider)?;

        let client = BasicClient::new(
            ClientId::new(config.client_id.clone()),
            Some(ClientSecret::new(config.client_secret.clone())),
            AuthUrl::new(provider.auth_url().to_string()).unwrap(),
            Some(TokenUrl::new(provider.token_url().to_string()).unwrap()),
        )
        .set_redirect_uri(RedirectUrl::new(config.redirect_uri.clone()).unwrap());

        Ok(Self {
            provider,
            config,
            client,
        })
    }

    /// Generate authorization URL and CSRF state token
    pub fn get_authorization_url(&self) -> (String, String) {
        let (auth_url, csrf_token) = self
            .client
            .authorize_url(CsrfToken::new_random)
            .add_scope(Scope::new("identify".to_string()))
            .add_scope(Scope::new("email".to_string()))
            .url();

        (auth_url.to_string(), csrf_token.secret().clone())
    }

    /// Exchange authorization code for access token and fetch user info
    pub async fn exchange_code(&self, code: String) -> Result<OAuthUserInfo, OAuthError> {
        // Exchange code for token
        let token = self
            .client
            .exchange_code(AuthorizationCode::new(code))
            .request_async(async_http_client)
            .await
            .map_err(|e| OAuthError::TokenExchangeFailed(e.to_string()))?;

        // Fetch user info using the access token
        let user_info = self.fetch_user_info(&token.access_token().secret()).await?;

        Ok(user_info)
    }

    /// Fetch user info from provider
    async fn fetch_user_info(&self, access_token: &str) -> Result<OAuthUserInfo, OAuthError> {
        let client = reqwest::Client::new();

        match self.provider {
            OAuthProvider::Github => {
                let user: GithubUser = client
                    .get(self.provider.user_info_url())
                    .header("Authorization", format!("Bearer {}", access_token))
                    .header("User-Agent", "GraphWiz-XR")
                    .send()
                    .await
                    .map_err(|e| OAuthError::UserInfoFailed(e.to_string()))?
                    .json()
                    .await
                    .map_err(|e| OAuthError::UserInfoFailed(e.to_string()))?;

                Ok(OAuthUserInfo {
                    provider_id: user.id.to_string(),
                    email: user.email,
                    name: user.name,
                    avatar_url: user.avatar_url,
                    username: Some(user.login),
                })
            }
            OAuthProvider::Google => {
                let user: GoogleUser = client
                    .get(self.provider.user_info_url())
                    .header("Authorization", format!("Bearer {}", access_token))
                    .send()
                    .await
                    .map_err(|e| OAuthError::UserInfoFailed(e.to_string()))?
                    .json()
                    .await
                    .map_err(|e| OAuthError::UserInfoFailed(e.to_string()))?;

                Ok(OAuthUserInfo {
                    provider_id: user.id,
                    email: Some(user.email.clone()),
                    name: Some(user.name),
                    avatar_url: user.picture,
                    username: Some(user.email.split('@').next().unwrap_or(&user.email).to_string()),
                })
            }
            OAuthProvider::Discord => {
                let user: DiscordUser = client
                    .get(self.provider.user_info_url())
                    .header("Authorization", format!("Bearer {}", access_token))
                    .send()
                    .await
                    .map_err(|e| OAuthError::UserInfoFailed(e.to_string()))?
                    .json()
                    .await
                    .map_err(|e| OAuthError::UserInfoFailed(e.to_string()))?;

                let avatar_url = user.avatar.map(|avatar| {
                    format!(
                        "https://cdn.discordapp.com/avatars/{}/{}.png",
                        user.id, avatar
                    )
                });

                let username = if user.discriminator == "0" {
                    user.username.clone()
                } else {
                    format!("{}#{}", user.username, user.discriminator)
                };

                Ok(OAuthUserInfo {
                    provider_id: user.id,
                    email: Some(user.email),
                    name: Some(user.username),
                    avatar_url,
                    username: Some(username),
                })
            }
        }
    }
}

/// Link or create user from OAuth account
pub async fn link_or_create_user(
    db: &DatabaseConnection,
    provider: OAuthProvider,
    user_info: OAuthUserInfo,
) -> Result<core_models::User, OAuthError> {
    // Check if OAuth account already exists
    let existing_oauth = match core_models::OAuthAccountModel::find_by_provider(
        db,
        provider,
        &user_info.provider_id,
    )
    .await
    {
        Ok(Some(account)) => Some(account),
        Ok(None) => None,
        Err(e) => {
            log::error!("Failed to query OAuth account: {}", e);
            return Err(OAuthError::DatabaseError(e.to_string()));
        }
    };

    // If OAuth account exists, return the associated user
    if let Some(oauth_account) = existing_oauth {
        match core_models::UserModel::find_by_id(db, oauth_account.user_id).await {
            Ok(Some(user)) => return Ok(user),
            Ok(None) => {
                log::warn!(
                    "OAuth account exists but user not found: {}",
                    oauth_account.user_id
                );
            }
            Err(e) => {
                log::error!("Failed to fetch user: {}", e);
                return Err(OAuthError::DatabaseError(e.to_string()));
            }
        }
    }

    // Check if user with same email exists (for linking)
    let existing_user = if let Some(email) = &user_info.email {
        match core_models::UserModel::find_by_email(db, email).await {
            Ok(Some(user)) => Some(user),
            Ok(None) => None,
            Err(e) => {
                log::error!("Failed to check existing user by email: {}", e);
                return Err(OAuthError::DatabaseError(e.to_string()));
            }
        }
    } else {
        None
    };

    let user = if let Some(mut existing_user) = existing_user {
        // Link OAuth account to existing user
        if let Err(e) = core_models::OAuthAccountModel::create(
            db,
            provider,
            &user_info.provider_id,
            existing_user.id,
            None,
            None,
        )
        .await
        {
            log::error!("Failed to create OAuth account: {}", e);
            return Err(OAuthError::DatabaseError(e.to_string()));
        }

        existing_user
    } else {
        // Create new user
        let display_name = user_info
            .name
            .clone()
            .unwrap_or_else(|| user_info.username.clone().unwrap_or_else(|| "User".to_string()));

        let email = user_info.email.unwrap_or_else(|| {
            format!("{}@{}.oauth.local", user_info.provider_id, provider.env_prefix())
        });

        // Generate a random password (user won't use it)
        let password_hash =
            reticulum_core::auth::hash_password(&uuid::Uuid::new_v4().to_string())
                .map_err(|e| OAuthError::InternalError(e.to_string()))?;

        let avatar_url = user_info.avatar_url;

        match core_models::UserModel::create(
            db,
            display_name,
            email.clone(),
            password_hash,
        )
        .await
        {
            Ok(mut user) => {
                // Update avatar if provided
                if let Some(avatar) = avatar_url {
                    if let Err(e) = core_models::UserModel::update_avatar(db, user.id, avatar).await {
                        log::warn!("Failed to update avatar: {}", e);
                    }
                    // Refetch user
                    if let Ok(Some(updated)) = core_models::UserModel::find_by_id(db, user.id).await {
                        user = updated;
                    }
                }
                user
            }
            Err(e) => {
                log::error!("Failed to create user: {}", e);
                return Err(OAuthError::DatabaseError(e.to_string()));
            }
        }
    };

    Ok(user)
}

/// OAuth errors
#[derive(Debug, Error)]
pub enum OAuthError {
    #[error("Missing client ID for provider: {:?}", 0)]
    MissingClientId(OAuthProvider),

    #[error("Missing client secret for provider: {:?}", 0)]
    MissingClientSecret(OAuthProvider),

    #[error("Token exchange failed: {0}")]
    TokenExchangeFailed(String),

    #[error("Failed to fetch user info: {0}")]
    UserInfoFailed(String),

    #[error("Database error: {0}")]
    DatabaseError(String),

    #[error("Internal error: {0}")]
    InternalError(String),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_oauth_provider_from_str() {
        assert_eq!(OAuthProvider::from_str("github"), Some(OAuthProvider::Github));
        assert_eq!(OAuthProvider::from_str("GitHub"), Some(OAuthProvider::Github));
        assert_eq!(OAuthProvider::from_str("GITHUB"), Some(OAuthProvider::Github));
        assert_eq!(OAuthProvider::from_str("google"), Some(OAuthProvider::Google));
        assert_eq!(OAuthProvider::from_str("discord"), Some(OAuthProvider::Discord));
        assert_eq!(OAuthProvider::from_str("unknown"), None);
    }

    #[test]
    fn test_oauth_provider_urls() {
        assert_eq!(
            OAuthProvider::Github.auth_url(),
            "https://github.com/login/oauth/authorize"
        );
        assert_eq!(
            OAuthProvider::Google.auth_url(),
            "https://accounts.google.com/o/oauth2/v2/auth"
        );
        assert_eq!(
            OAuthProvider::Discord.auth_url(),
            "https://discord.com/api/oauth2/authorize"
        );
    }
}
