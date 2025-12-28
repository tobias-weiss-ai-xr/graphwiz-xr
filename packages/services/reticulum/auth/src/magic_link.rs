//! Magic link authentication
//!
//! Passwordless authentication using email magic links

use chrono::{Duration, Utc};
use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use reticulum_core::{DatabaseConnection, models as core_models};

/// Magic link token configuration
const MAGIC_LINK_EXPIRATION_MINUTES: i64 = 15;
const TOKEN_LENGTH_BYTES: usize = 32;

/// Magic link request
#[derive(Debug, Deserialize, Serialize)]
pub struct MagicLinkRequest {
    pub email: String,
    pub redirect_url: Option<String>,
}

impl MagicLinkRequest {
    /// Simple email validation
    pub fn is_valid(&self) -> bool {
        self.email.contains('@') && self.email.contains('.')
    }
}

/// Magic link response
#[derive(Debug, Serialize)]
pub struct MagicLinkResponse {
    pub success: bool,
    pub message: String,
}

/// Magic link verification request
#[derive(Debug, Deserialize, Serialize)]
pub struct MagicLinkVerifyRequest {
    pub token: String,
}

/// Email configuration
#[derive(Debug, Clone)]
pub struct EmailConfig {
    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_user: String,
    pub smtp_password: String,
    pub from_email: String,
    pub from_name: String,
}

impl EmailConfig {
    /// Load from environment variables
    pub fn from_env() -> Result<Self, String> {
        let smtp_host = std::env::var("SMTP_HOST")
            .unwrap_or_else(|_| "smtp.gmail.com".to_string());

        let smtp_port = std::env::var("SMTP_PORT")
            .unwrap_or_else(|_| "587".to_string())
            .parse::<u16>()
            .map_err(|_| "Invalid SMTP port".to_string())?;

        let smtp_user = std::env::var("SMTP_USER")
            .map_err(|_| "SMTP_USER environment variable not set".to_string())?;

        let smtp_password = std::env::var("SMTP_PASSWORD")
            .map_err(|_| "SMTP_PASSWORD environment variable not set".to_string())?;

        let from_email = std::env::var("SMTP_FROM")
            .unwrap_or_else(|_| "noreply@graphwiz.dev".to_string());

        let from_name = std::env::var("SMTP_FROM_NAME")
            .unwrap_or_else(|_| "GraphWiz-XR".to_string());

        Ok(Self {
            smtp_host,
            smtp_port,
            smtp_user,
            smtp_password,
            from_email,
            from_name,
        })
    }
}

/// Magic link manager
pub struct MagicLinkManager {
    db: DatabaseConnection,
    email_config: Option<EmailConfig>,
}

impl MagicLinkManager {
    /// Create a new magic link manager
    pub fn new(db: DatabaseConnection) -> Self {
        let email_config = EmailConfig::from_env().ok();
        Self { db, email_config }
    }

    /// Create a new magic link manager with custom email config
    pub fn with_email_config(db: DatabaseConnection, email_config: EmailConfig) -> Self {
        Self {
            db,
            email_config: Some(email_config),
        }
    }

    /// Generate a secure random token
    pub fn generate_token() -> String {
        // Generate 32 random bytes and encode as hex
        let token_bytes: [u8; TOKEN_LENGTH_BYTES] = rand::random();
        hex::encode(token_bytes)
    }

    /// Create a magic link URL
    pub fn create_magic_link(&self, token: &str, redirect_url: Option<&str>) -> String {
        let base_url = std::env::var("APP_BASE_URL")
            .unwrap_or_else(|_| "http://localhost:5173".to_string());

        let mut link = format!("{}/auth/verify-magic-link?token={}", base_url, token);

        if let Some(redirect) = redirect_url {
            link.push_str(&format!("&redirect={}", urlencoding::encode(redirect)));
        }

        link
    }

    /// Send magic link email
    pub fn send_magic_link_email(
        &self,
        email: &str,
        link: &str,
    ) -> Result<(), MagicLinkError> {
        let email_config = self.email_config.as_ref()
            .ok_or(MagicLinkError::EmailNotConfigured)?;

        // Build email message
        let email_message = Message::builder()
            .from(format!("{} <{}>", email_config.from_name, email_config.from_email).parse().unwrap())
            .to(email.parse().unwrap())
            .subject("Sign in to GraphWiz-XR")
            .header(ContentType::TEXT_PLAIN)
            .body(format!(
                "Click the link below to sign in to GraphWiz-XR:\n\n{}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this link, please ignore this email.",
                link
            ))
            .map_err(|e| MagicLinkError::EmailError(e.to_string()))?;

        // Create SMTP transport
        let mailer = SmtpTransport::builder_dangerous(&email_config.smtp_host)
            .port(email_config.smtp_port)
            .credentials(Credentials::new(
                email_config.smtp_user.clone(),
                email_config.smtp_password.clone(),
            ))
            .build();

        // Send email
        match mailer.send(&email_message) {
            Ok(_) => {
                log::info!("Magic link email sent to {}", email);
                Ok(())
            }
            Err(e) => {
                log::error!("Failed to send magic link email: {}", e);
                Err(MagicLinkError::EmailError(e.to_string()))
            }
        }
    }

    /// Initiate magic link authentication
    ///
    /// This generates a token, stores it in the database, and sends an email
    pub async fn send_magic_link(
        &self,
        request: MagicLinkRequest,
    ) -> Result<MagicLinkResponse, MagicLinkError> {
        // Validate request
        if !request.is_valid() {
            return Err(MagicLinkError::ValidationError("Invalid email format".to_string()));
        }

        // Check if user exists
        let user_exists = match core_models::UserModel::find_by_email(&self.db, &request.email).await {
            Ok(Some(_)) => true,
            Ok(None) => false,
            Err(e) => {
                log::error!("Failed to check user existence: {}", e);
                return Err(MagicLinkError::DatabaseError(e.to_string()));
            }
        };

        // For security, always return success even if user doesn't exist
        // This prevents email enumeration attacks
        if !user_exists {
            log::warn!("Magic link requested for non-existent email: {}", request.email);
            return Ok(MagicLinkResponse {
                success: true,
                message: "If an account exists with this email, a magic link has been sent.".to_string(),
            });
        }

        // Generate token
        let token = Self::generate_token();
        let expires_at = Utc::now() + Duration::minutes(MAGIC_LINK_EXPIRATION_MINUTES);

        // Store token in database using SeaORM
        use sea_orm::{ActiveEnum, IntoActiveModel};
        use reticulum_core::models::magic_link_tokens;

        let token_model = magic_link_tokens::ActiveModel {
            token: ActiveEnum::Set(token.clone()),
            email: ActiveEnum::Set(request.email.clone()),
            expires_at: ActiveEnum::Set(expires_at.into()),
            used_at: ActiveEnum::Set(None),
            ..Default::default()
        };

        if let Err(e) = magic_link_tokens::Entity::insert(token_model)
            .exec(&self.db)
            .await
        {
            log::error!("Failed to store magic link token: {}", e);
            return Err(MagicLinkError::DatabaseError(e.to_string()));
        }

        // Create magic link
        let link = self.create_magic_link(&token, request.redirect_url.as_deref());

        // Send email
        if let Err(e) = self.send_magic_link_email(&request.email, &link) {
            log::error!("Failed to send magic link email: {:?}", e);
            // Return success anyway to prevent enumeration
        }

        Ok(MagicLinkResponse {
            success: true,
            message: "If an account exists with this email, a magic link has been sent.".to_string(),
        })
    }

    /// Verify a magic link token and authenticate the user
    pub async fn verify_magic_link(
        &self,
        token: &str,
    ) -> Result<core_models::users::User, MagicLinkError> {
        use sea_orm::{EntityTrait, QueryFilter, ColumnTrait, ActiveEnum, IntoActiveModel};
        use reticulum_core::models::magic_link_tokens;

        // Look up the token in the database
        let token_record = match magic_link_tokens::Entity::find()
            .filter(magic_link_tokens::Column::Token.eq(token))
            .one(&self.db)
            .await
        {
            Ok(Some(record)) => record,
            Ok(None) => {
                return Err(MagicLinkError::InvalidToken);
            }
            Err(e) => {
                log::error!("Failed to look up magic link token: {}", e);
                return Err(MagicLinkError::DatabaseError(e.to_string()));
            }
        };

        // Check if it's expired
        let now = Utc::now();
        if token_record.expires_at < now {
            return Err(MagicLinkError::InvalidToken);
        }

        // Check if it's already been used
        if token_record.used_at.is_some() {
            return Err(MagicLinkError::TokenAlreadyUsed);
        }

        // Get the associated email
        let email = token_record.email.clone();

        // Find the user by email
        let user = match core_models::UserModel::find_by_email(&self.db, &email).await {
            Ok(Some(user)) => user,
            Ok(None) => {
                return Err(MagicLinkError::InvalidToken);
            }
            Err(e) => {
                log::error!("Failed to find user by email: {}", e);
                return Err(MagicLinkError::DatabaseError(e.to_string()));
            }
        };

        // Mark the token as used
        let mut token_active: magic_link_tokens::ActiveModel = token_record.into_active_model();
        token_active.used_at = ActiveEnum::Set(Some(now.into()));
        if let Err(e) = token_active.update(&self.db).await {
            log::error!("Failed to mark magic link token as used: {}", e);
            // Don't fail the auth if we can't mark the token as used
        }

        Ok(user)
    }
}

/// Magic link errors
#[derive(Debug, thiserror::Error)]
pub enum MagicLinkError {
    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Email not configured")]
    EmailNotConfigured,

    #[error("Failed to send email: {0}")]
    EmailError(String),

    #[error("Database error: {0}")]
    DatabaseError(String),

    #[error("Token invalid or expired")]
    InvalidToken,

    #[error("Token already used")]
    TokenAlreadyUsed,

    #[error("Not implemented")]
    NotImplemented,
}

/// Generate random bytes for tokens
fn random<T>() -> T
where
    T: rand::Fill + Default,
{
    let mut buf = T::default();
    let mut rng = rand::rngs::OsRng;
    if let Err(e) = buf.try_fill(&mut rng) {
        log::error!("Failed to generate random bytes: {}", e);
    }
    buf
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_token() {
        let token1 = MagicLinkManager::generate_token();
        let token2 = MagicLinkManager::generate_token();

        // Tokens should be different
        assert_ne!(token1, token2);

        // Tokens should be 64 hex characters (32 bytes * 2)
        assert_eq!(token1.len(), 64);
    }

    #[test]
    fn test_create_magic_link() {
        let manager = MagicLinkManager::new(
            sea_orm::Database::connect("sqlite::memory:").await.unwrap()
        );

        let link = manager.create_magic_link("test_token", Some("/dashboard"));
        assert!(link.contains("test_token"));
        assert!(link.contains("redirect=%2Fdashboard"));
    }
}
