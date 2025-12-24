//! Session management for WebTransport connections

use reticulum_core::Result;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct ClientSession {
    pub session_id: String,
    pub client_id: String,
    pub user_id: String,
    pub room_id: Option<String>,
    pub connected_at: chrono::DateTime<chrono::Utc>,
    pub last_heartbeat: chrono::DateTime<chrono::Utc>,
}

pub struct SessionManager {
    sessions: Arc<RwLock<HashMap<String, ClientSession>>>,
    room_sessions: Arc<RwLock<HashMap<String, Vec<String>>>>, // room_id -> session_ids
}

impl SessionManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
            room_sessions: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Register a new client session
    pub async fn register_session(&self, session: ClientSession) -> Result<()> {
        let mut sessions = self.sessions.write().await;
        let session_id = session.session_id.clone();

        // Add to sessions map
        sessions.insert(session_id.clone(), session.clone());

        // Add to room if applicable
        if let Some(ref room_id) = session.room_id {
            let mut room_sessions = self.room_sessions.write().await;
            room_sessions
                .entry(room_id.clone())
                .or_insert_with(Vec::new)
                .push(session_id);
        }

        Ok(())
    }

    /// Unregister a session
    pub async fn unregister_session(&self, session_id: &str) -> Result<Option<ClientSession>> {
        let mut sessions = self.sessions.write().await;

        if let Some(session) = sessions.remove(session_id) {
            // Remove from room_sessions
            if let Some(room_id) = &session.room_id {
                let mut room_sessions = self.room_sessions.write().await;
                if let Some(session_ids) = room_sessions.get_mut(room_id) {
                    session_ids.retain(|id| id != session_id);
                    if session_ids.is_empty() {
                        room_sessions.remove(room_id);
                    }
                }
            }

            Ok(Some(session))
        } else {
            Ok(None)
        }
    }

    /// Get a session by ID
    pub async fn get_session(&self, session_id: &str) -> Option<ClientSession> {
        let sessions = self.sessions.read().await;
        sessions.get(session_id).cloned()
    }

    /// Get all sessions in a room
    pub async fn get_room_sessions(&self, room_id: &str) -> Vec<ClientSession> {
        let session_ids = {
            let room_sessions = self.room_sessions.read().await;
            room_sessions.get(room_id).cloned().unwrap_or_default()
        };

        let sessions = self.sessions.read().await;
        session_ids
            .iter()
            .filter_map(|id| sessions.get(id).cloned())
            .collect()
    }

    /// Update session heartbeat
    pub async fn update_heartbeat(&self, session_id: &str) -> Result<()> {
        let mut sessions = self.sessions.write().await;
        if let Some(session) = sessions.get_mut(session_id) {
            session.last_heartbeat = chrono::Utc::now();
        }
        Ok(())
    }

    /// Clean up stale sessions
    pub async fn cleanup_stale_sessions(&self, timeout_secs: i64) -> Result<Vec<String>> {
        let cutoff = chrono::Utc::now() - chrono::Duration::seconds(timeout_secs);
        let mut stale_session_ids = Vec::new();

        {
            let sessions = self.sessions.read().await;
            for (session_id, session) in sessions.iter() {
                if session.last_heartbeat < cutoff {
                    stale_session_ids.push(session_id.clone());
                }
            }
        }

        // Unregister stale sessions
        for session_id in &stale_session_ids {
            self.unregister_session(session_id).await?;
        }

        Ok(stale_session_ids)
    }
}

impl Default for SessionManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[tokio::test]
    async fn test_session_registration() {
        let manager = SessionManager::new();
        let session = ClientSession {
            session_id: Uuid::new_v4().to_string(),
            client_id: Uuid::new_v4().to_string(),
            user_id: "user1".to_string(),
            room_id: Some("room1".to_string()),
            connected_at: chrono::Utc::now(),
            last_heartbeat: chrono::Utc::now(),
        };

        let session_id = session.session_id.clone();
        manager.register_session(session).await.unwrap();

        let retrieved = manager.get_session(&session_id).await;
        assert!(retrieved.is_some());
    }

    #[tokio::test]
    async fn test_get_room_sessions() {
        let manager = SessionManager::new();
        let room_id = "room1".to_string();

        let session1 = ClientSession {
            session_id: Uuid::new_v4().to_string(),
            client_id: Uuid::new_v4().to_string(),
            user_id: "user1".to_string(),
            room_id: Some(room_id.clone()),
            connected_at: chrono::Utc::now(),
            last_heartbeat: chrono::Utc::now(),
        };

        let session_id1 = session1.session_id.clone();
        manager.register_session(session1).await.unwrap();

        let room_sessions = manager.get_room_sessions(&room_id).await;
        assert_eq!(room_sessions.len(), 1);
        assert_eq!(room_sessions[0].session_id, session_id1);
    }
}
