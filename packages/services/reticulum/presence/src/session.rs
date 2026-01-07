//! Session management for WebTransport connections

use reticulum_core::Result;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc, Duration};
use serde::{Serialize, Deserialize};

#[derive(Clone)]
pub struct ClientSession {
    pub session_id: String,
    pub client_id: String,
    pub user_id: String,
    pub room_id: Option<String>,
    pub connected_at: DateTime<Utc>,
    pub last_heartbeat: DateTime<Utc>,
    pub is_muted: bool,
}

pub struct SessionManager {
    sessions: Arc<RwLock<HashMap<String, ClientSession>>>,
    room_sessions: Arc<RwLock<HashMap<String, Vec<String>>>>, // room_id -> session_ids
    pending_messages: Arc<RwLock<HashMap<String, Vec<serde_json::Value>>>>, // session_id -> pending messages
    locked_rooms: Arc<RwLock<HashMap<String, bool>>>, // room_id -> is_locked
    batch_size: usize,
    batch_timeout: Duration,
}

impl SessionManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
            room_sessions: Arc::new(RwLock::new(HashMap::new())),
            pending_messages: Arc::new(RwLock::new(HashMap::new())),
            locked_rooms: Arc::new(RwLock::new(HashMap::new())),
            batch_size: 50, // Default batch size
            batch_timeout: Duration::from_millis(50), // Flush every 50ms
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
            room_sessions.entry(room_id.clone())
                .or_insert_with(Vec::new())
                .push(session_id);
        }

        // Initialize pending messages for this session
        let mut pending = self.pending_messages.write().await;
        pending.insert(session_id.clone(), Vec::new());

        Ok(())
    }

    /// Unregister a session
    pub async fn unregister_session(&self, session_id: &str) -> Result<Option<ClientSession>> {
        let mut sessions = self.sessions.write().await;
        let session = sessions.remove(session_id);

        // Remove from room sessions
        if let Some(ref s) = session {
            if let Some(ref room_id) = s.room_id {
                let mut room_sessions = self.room_sessions.write().await;
                if let Some(session_ids) = room_sessions.get_mut(room_id) {
                    session_ids.retain(|id| id != &session_id);
                }
            }
        }

        // Clean up pending messages
        let mut pending = self.pending_messages.write().await;
        pending.remove(session_id);

        Ok(session)
    }

    /// Add message to batch (returns true if batch should be flushed)
    pub async fn add_to_batch(&self, session_id: &str, message: serde_json::Value) -> bool {
        let mut pending = self.pending_messages.write().await;

        // Check if session exists
        let sessions = self.sessions.read().await;
        if !sessions.contains_key(session_id) {
            log::warn!("Session {} not found for batching", session_id);
            return false;
        }

        // Get or create pending messages
        let should_flush = if let Some(messages) = pending.get_mut(session_id) {
            messages.push(message);
            messages.len() >= self.batch_size
        } else {
            pending.insert(session_id.to_string(), vec![message]);
            true // New batch created
        };

        Ok(())
    }

    /// Get batched messages for a session
    pub async fn get_batched_messages(&self, session_id: &str) -> Vec<serde_json::Value> {
        let pending = self.pending_messages.read().await;

        if let Some(messages) = pending.get(session_id) {
            messages.clone()
        } else {
            vec![]
        }
    }

    /// Flush all pending messages for a session
    pub async fn flush_session(&self, session_id: &str) {
        let mut pending = self.pending_messages.write().await;

        if let Some(messages) = pending.remove(session_id) {
            if !messages.is_empty() {
                log::info!("Flushing {} messages for session {}", messages.len(), session_id);

                // In a real implementation, send to clients here
                // For now, we just log them
                for msg in messages {
                    log::info!("Session {} message: {:?}", session_id, msg);
                }
            }
        }
    }

    /// Flush all pending messages (called periodically)
    pub async fn flush_all(&self) {
        let pending = self.pending_messages.read().await;
        let session_ids: Vec<_> = pending.keys().cloned().collect();

        for session_id in session_ids {
            self.flush_session(&session_id).await;
        }
    }

    /// Start background task to flush messages periodically
    pub fn start_background_flush_task(&self) -> tokio::task::JoinHandle<()> {
        let pending_messages = self.pending_messages.clone();
        let batch_timeout = self.batch_timeout;

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(batch_timeout);

            loop {
                interval.tick().await;
                pending_messages.flush_all().await;
            }
        })
    }
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

    // ============== Moderation Methods ==============

    /// Mute/unmute a player
    pub async fn mute_player(&self, session_id: &str, is_muted: bool) -> Result<()> {
        let mut sessions = self.sessions.write().await;
        if let Some(session) = sessions.get_mut(session_id) {
            session.is_muted = is_muted;
            Ok(())
        } else {
            Err(eyre::eyre!("Session not found: {}", session_id))
        }
    }

    /// Check if a room is locked
    pub async fn is_room_locked(&self, room_id: &str) -> bool {
        let locked_rooms = self.locked_rooms.read().await;
        locked_rooms.get(room_id).copied().unwrap_or(false)
    }

    /// Lock/unlock a room
    pub async fn set_room_locked(&self, room_id: &str, is_locked: bool) -> Result<()> {
        let mut locked_rooms = self.locked_rooms.write().await;
        locked_rooms.insert(room_id.to_string(), is_locked);
        Ok(())
    }

    /// Check if a session is muted
    pub async fn is_session_muted(&self, session_id: &str) -> bool {
        let sessions = self.sessions.read().await;
        sessions.get(session_id).map(|s| s.is_muted).unwrap_or(false)
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
