//! Redis session management
//!
//! Stores user sessions in Redis for fast access and revocation

use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use uuid::Uuid;

use crate::models::UserInfo;

const SESSION_PREFIX: &str = "session:";
const SESSION_TTL_SECS: i64 = 86400; // 24 hours

#[derive(Debug, Error)]
pub enum SessionError {
    #[error("Redis connection error: {0}")]
    RedisError(String),
    #[error("Session not found")]
    NotFound,
    #[error("Session expired")]
    Expired,
    #[error("Serialization error: {0}")]
    SerializationError(String),
}

impl From<redis::RedisError> for SessionError {
    fn from(err: redis::RedisError) -> Self {
        SessionError::RedisError(err.to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub id: String,
    pub user_id: i32,
    pub email: String,
    pub display_name: String,
    pub avatar_url: Option<String>,
    pub created_at: i64,
    pub expires_at: i64,
}

impl From<UserInfo> for Session {
    fn from(info: UserInfo) -> Self {
        let id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now().timestamp();
        let expires_at = now + SESSION_TTL_SECS as i64;

        Session {
            id,
            user_id: info.id,
            email: info.email,
            display_name: info.display_name,
            avatar_url: info.avatar_url,
            created_at: now,
            expires_at,
        }
    }
}

impl From<Session> for UserInfo {
    fn from(session: Session) -> Self {
        UserInfo {
            id: session.user_id,
            display_name: session.display_name,
            email: session.email,
            avatar_url: session.avatar_url,
        }
    }
}

/// Redis session manager
pub struct SessionManager {
    client: redis::aio::ConnectionManager,
}

impl SessionManager {
    /// Create a new session manager from Redis URL
    pub async fn from_url(redis_url: &str) -> Result<Self, SessionError> {
        let client = redis::Client::open(redis_url)
            .map_err(|e| SessionError::RedisError(e.to_string()))?;

        let conn = client
            .get_connection_manager()
            .await
            .map_err(|e| SessionError::RedisError(e.to_string()))?;

        Ok(Self { client: conn })
    }

    /// Create a new session for a user
    pub async fn create_session(&mut self, user_info: UserInfo) -> Result<Session, SessionError> {
        let session = Session::from(user_info);
        let key = format!("{}{}", SESSION_PREFIX, session.id);

        let serialized = serde_json::to_string(&session)
            .map_err(|e| SessionError::SerializationError(e.to_string()))?;

        let mut pipe = redis::pipe();
        pipe.set(&key, &serialized);
        pipe.expire(&key, SESSION_TTL_SECS);

        let _: () = pipe.query_async(&mut self.client)
            .await
            .map_err(|e| SessionError::RedisError(e.to_string()))?;

        Ok(session)
    }

    /// Get a session by ID
    pub async fn get_session(&mut self, session_id: &str) -> Result<Session, SessionError> {
        let key = format!("{}{}", SESSION_PREFIX, session_id);

        let serialized: Option<String> = self.client
            .get(&key)
            .await
            .map_err(|e| SessionError::RedisError(e.to_string()))?;

        match serialized {
            Some(data) => {
                let session: Session = serde_json::from_str(&data)
                    .map_err(|e| SessionError::SerializationError(e.to_string()))?;

                // Check if expired
                let now = chrono::Utc::now().timestamp();
                if now > session.expires_at {
                    // Clean up expired session
                    let _: () = self.client.del(&key).await
                        .map_err(|e| SessionError::RedisError(e.to_string()))?;
                    return Err(SessionError::Expired);
                }

                Ok(session)
            }
            None => Err(SessionError::NotFound)
        }
    }

    /// Refresh a session (extend TTL)
    pub async fn refresh_session(&mut self, session_id: &str) -> Result<Session, SessionError> {
        let session = self.get_session(session_id).await?;

        let key = format!("{}{}", SESSION_PREFIX, session_id);
        let _: () = self.client
            .expire(&key, SESSION_TTL_SECS)
            .await
            .map_err(|e| SessionError::RedisError(e.to_string()))?;

        Ok(session)
    }

    /// Revoke/delete a session
    pub async fn revoke_session(&mut self, session_id: &str) -> Result<(), SessionError> {
        let key = format!("{}{}", SESSION_PREFIX, session_id);
        let _: () = self.client
            .del(&key)
            .await
            .map_err(|e| SessionError::RedisError(e.to_string()))?;

        Ok(())
    }

    /// Revoke all sessions for a user
    pub async fn revoke_user_sessions(&mut self, user_id: i32) -> Result<usize, SessionError> {
        // Find all session keys for this user
        let pattern = format!("{}*", SESSION_PREFIX);
        let keys: Vec<String> = self.client
            .keys(&pattern)
            .await
            .map_err(|e| SessionError::RedisError(e.to_string()))?;

        let mut revoked = 0;
        for key in keys {
            // Get session to check user_id
            let serialized: Option<String> = self.client
                .get(&key)
                .await
                .map_err(|e| SessionError::RedisError(e.to_string()))?;

            if let Some(data) = serialized {
                if let Ok(session) = serde_json::from_str::<Session>(&data) {
                    if session.user_id == user_id {
                        let _: () = self.client
                            .del(&key)
                            .await
                            .map_err(|e| SessionError::RedisError(e.to_string()))?;
                        revoked += 1;
                    }
                }
            }
        }

        Ok(revoked)
    }

    /// Clean up expired sessions
    pub async fn cleanup_expired(&mut self) -> Result<usize, SessionError> {
        let pattern = format!("{}*", SESSION_PREFIX);
        let keys: Vec<String> = self.client
            .keys(&pattern)
            .await
            .map_err(|e| SessionError::RedisError(e.to_string()))?;

        let now = chrono::Utc::now().timestamp();
        let mut cleaned = 0;

        for key in keys {
            let serialized: Option<String> = self.client
                .get(&key)
                .await
                .map_err(|e| SessionError::RedisError(e.to_string()))?;

            if let Some(data) = serialized {
                if let Ok(session) = serde_json::from_str::<Session>(&data) {
                    if now > session.expires_at {
                        let _: () = self.client
                            .del(&key)
                            .await
                            .map_err(|e| SessionError::RedisError(e.to_string()))?;
                        cleaned += 1;
                    }
                }
            }
        }

        Ok(cleaned)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_session_from_user_info() {
        let user_info = UserInfo {
            id: 1,
            display_name: "Test User".to_string(),
            email: "test@example.com".to_string(),
            avatar_url: Some("https://example.com/avatar.jpg".to_string()),
        };

        let session = Session::from(user_info);
        assert_eq!(session.user_id, 1);
        assert_eq!(session.email, "test@example.com");
    }
}
