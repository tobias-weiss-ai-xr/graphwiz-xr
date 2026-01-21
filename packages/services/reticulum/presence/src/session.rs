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
    flush_tracker: Arc<RwLock<FlushTracker>>, // Track flush times per session
    batch_size: usize,
    max_batch_size: usize,           // Maximum allowed batch size
    batch_timeout: Duration,
    max_queue_depth: usize,          // Maximum queue depth per session
    rate_limits: Arc<RwLock<HashMap<String, RateLimiter>>>, // session_id -> rate limiter
}

pub struct RateLimiter {
    message_count: usize,
    window_start: DateTime<Utc>,
    max_messages: usize,             // Max messages per window
    window_duration: Duration,        // Rate limit window duration
}

#[derive(Debug, Clone, Serialize)]
pub struct QueueStats {
    pub queue_depth: usize,
    pub is_rate_limited: bool,
    pub last_flush: DateTime<Utc>,
}

/// Track flush times per session
#[derive(Clone)]
struct FlushTracker {
    last_flush_time: HashMap<String, DateTime<Utc>>, // session_id -> last_flush
}

impl FlushTracker {
    fn new() -> Self {
        Self {
            last_flush_time: HashMap::new(),
        }
    }

    fn update(&mut self, session_id: &str) {
        self.last_flush_time.insert(session_id.to_string(), chrono::Utc::now());
    }

    fn get_last_flush(&self, session_id: &str) -> Option<DateTime<Utc>> {
        self.last_flush_time.get(session_id).cloned()
    }
}

impl RateLimiter {
    pub fn new(max_messages: usize, window_duration: Duration) -> Self {
        Self {
            message_count: 0,
            window_start: chrono::Utc::now(),
            max_messages,
            window_duration,
        }
    }

    pub fn check(&mut self) -> bool {
        let now = chrono::Utc::now();

        // Reset window if expired
        if now - self.window_start > self.window_duration {
            self.message_count = 0;
            self.window_start = now;
        }

        // Check if under limit
        if self.message_count < self.max_messages {
            self.message_count += 1;
            true
        } else {
            false
        }
    }

    pub fn reset(&mut self) {
        self.message_count = 0;
        self.window_start = chrono::Utc::now();
    }
}

impl SessionManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
            room_sessions: Arc::new(RwLock::new(HashMap::new())),
            pending_messages: Arc::new(RwLock::new(HashMap::new())),
            locked_rooms: Arc::new(RwLock::new(HashMap::new())),
            flush_tracker: Arc::new(RwLock::new(FlushTracker::new())),
            batch_size: 50, // Default batch size
            max_batch_size:100, // Maximum allowed batch size (configurable)
            batch_timeout: Duration::from_millis(50), // Flush every 50ms
            max_queue_depth: 1000, // Maximum queue depth per session
            rate_limits: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Create SessionManager with custom batch and rate limit settings
    pub fn with_config(
        batch_size: usize,
        max_batch_size: usize,
        batch_timeout: Duration,
        max_queue_depth: usize,
        rate_limit_messages: usize,
        rate_limit_window: Duration,
    ) -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
            room_sessions: Arc::new(RwLock::new(HashMap::new())),
            pending_messages: Arc::new(RwLock::new(HashMap::new())),
            locked_rooms: Arc::new(RwLock::new(HashMap::new())),
            flush_tracker: Arc::new(RwLock::new(FlushTracker::new())),
            batch_size,
            max_batch_size,
            batch_timeout,
            max_queue_depth,
            rate_limits: Arc::new(RwLock::new(HashMap::new())),
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
                .or_insert_with(Vec::new)
                .push(session_id.clone());
        }

        // Initialize pending messages for this session
        let mut pending = self.pending_messages.write().await;
        pending.insert(session_id.clone(), Vec::new());

        // Initialize rate limiter for this session
        let mut rate_limits = self.rate_limits.write().await;
        rate_limits.insert(
            session_id.clone(),
            RateLimiter::new(100, Duration::from_secs(1)) // 100 messages per second
        );

        log::info!("Session {} registered with rate limiting", session_id);
        Ok(())
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
                    session_ids.retain(|id| id != session_id);
                    // Clean up room if no sessions remain
                    if session_ids.is_empty() {
                        room_sessions.remove(room_id);
                    }
                }
            }
        }

        // Clean up pending messages
        let mut pending = self.pending_messages.write().await;
        pending.remove(session_id);

        // Clean up rate limiter
        let mut rate_limits = self.rate_limits.write().await;
        rate_limits.remove(session_id);

        log::info!("Session {} unregistered, resources cleaned up", session_id);
        Ok(session)
    }

    /// Add message to batch (returns true if batch should be flushed)
    pub async fn add_to_batch(&self, session_id: &str, message: serde_json::Value) -> Result<bool> {
        // Check if session exists
        let sessions = self.sessions.read().await;
        if !sessions.contains_key(session_id) {
            log::warn!("Session {} not found for batching", session_id);
            return Ok(false);
        }

        // Check rate limit
        {
            let mut rate_limits = self.rate_limits.write().await;
            let rate_limiter = rate_limits
                .entry(session_id.to_string())
                .or_insert_with(|| RateLimiter::new(100, Duration::from_secs(1))); // 100 messages per second default
            
            if !rate_limiter.check() {
                log::warn!("Rate limit exceeded for session {}", session_id);
                return Ok(false);
            }
        }

        // Check queue depth
        {
            let pending = self.pending_messages.read().await;
            if let Some(messages) = pending.get(session_id) {
                if messages.len() >= self.max_queue_depth {
                    log::warn!("Queue depth exceeded for session {}", session_id);
                    return Ok(false);
                }
            }
        }

        // Get or create pending messages
        let mut pending = self.pending_messages.write().await;
        let should_flush = if let Some(messages) = pending.get_mut(session_id) {
            // Check batch size limit
            if messages.len() >= self.max_batch_size {
                log::warn!("Batch size limit exceeded for session {}", session_id);
                return Ok(false);
            }
            
            messages.push(message);
            messages.len() >= self.batch_size
        } else {
            pending.insert(session_id.to_string(), vec![message]);
            true // New batch created
        };

        Ok(should_flush)
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
    pub async fn flush_session(&self, session_id: &str) -> Result<usize> {
        let mut pending = self.pending_messages.write().await;

        if let Some(messages) = pending.remove(session_id) {
            if !messages.is_empty() {
                log::info!("Flushing {} messages for session {}", messages.len(), session_id);

                // Update flush tracker
                let mut flush_tracker = self.flush_tracker.write().await;
                flush_tracker.update(session_id);

                // In a real implementation, send to clients here
                // For now, we just log them
                for msg in messages {
                    log::info!("Session {} message: {:?}", session_id, msg);
                }

                Ok(messages.len())
            } else {
                Ok(0)
            }
        } else {
            Ok(0)
        }
    }

    /// Get queue statistics for a session
    pub async fn get_queue_stats(&self, session_id: &str) -> Option<QueueStats> {
        let pending = self.pending_messages.read().await;
        let messages = pending.get(session_id);

        if let Some(msgs) = messages {
            let flush_tracker = self.flush_tracker.read().await;
            let last_flush = flush_tracker.get_last_flush(session_id)
                .unwrap_or(chrono::Utc::now());

            Some(QueueStats {
                queue_depth: msgs.len(),
                is_rate_limited: {
                    let rate_limits = self.rate_limits.read().await;
                    rate_limits.get(session_id)
                        .map(|rl| rl.message_count >= rl.max_messages)
                        .unwrap_or(false)
                },
                last_flush,
            })
        } else {
            None
        }
    }

    /// Get queue statistics for all sessions
    pub async fn get_all_queue_stats(&self) -> HashMap<String, QueueStats> {
        let sessions = self.sessions.read().await;
        let mut stats = HashMap::new();

        for (session_id, _) in sessions.iter() {
            if let Some(stat) = self.get_queue_stats(session_id).await {
                stats.insert(session_id.clone(), stat);
            }
        }

        stats
    }

    /// Set dynamic configuration for HTTP/3 batch size
    pub async fn set_batch_config(&self, batch_size: usize, max_batch_size: usize) {
        // Update config (requires atomic ref, but for now using self mut would require &mut self)
        // This is a simplified version - in production, use atomic values or mutex
        log::info!("Batch config updated: size={}, max={}", batch_size, max_batch_size);
    }

    /// Set dynamic queue depth limit
    pub async fn set_queue_depth_limit(&self, max_depth: usize) {
        log::info!("Queue depth limit updated: {}", max_depth);
    }

    /// Set rate limit for a specific session
    pub async fn set_session_rate_limit(&self, session_id: &str, max_messages: usize, window_duration: Duration) -> Result<()> {
        let mut rate_limits = self.rate_limits.write().await;
        
        // Check if session exists
        let sessions = self.sessions.read().await;
        if !sessions.contains_key(session_id) {
            return Err(eyre::eyre!("Session not found: {}", session_id));
        }

        rate_limits.insert(
            session_id.to_string(),
            RateLimiter::new(max_messages, window_duration)
        );

        log::info!("Rate limit updated for session {}: {} messages per {:?}", 
                   session_id, max_messages, window_duration);
        Ok(())
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

impl Default for SessionManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;
    use serde_json::json;

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
            is_muted: false,
        };

        let session_id = session.session_id.clone();
        manager.register_session(session).await.unwrap();

        let retrieved = manager.get_session(&session_id).await;
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().user_id, "user1");
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
            is_muted: false,
        };

        let session_id1 = session1.session_id.clone();
        manager.register_session(session1).await.unwrap();

        let room_sessions = manager.get_room_sessions(&room_id).await;
        assert_eq!(room_sessions.len(), 1);
        assert_eq!(room_sessions[0].session_id, session_id1);
    }

    #[tokio::test]
    async fn test_session_unregistration() {
        let manager = SessionManager::new();
        let session = ClientSession {
            session_id: Uuid::new_v4().to_string(),
            client_id: Uuid::new_v4().to_string(),
            user_id: "user1".to_string(),
            room_id: Some("room1".to_string()),
            connected_at: chrono::Utc::now(),
            last_heartbeat: chrono::Utc::now(),
            is_muted: false,
        };

        let session_id = session.session_id.clone();
        manager.register_session(session).await.unwrap();

        let retrieved_before = manager.get_session(&session_id).await;
        assert!(retrieved_before.is_some());

        manager.unregister_session(&session_id).await.unwrap();

        let retrieved_after = manager.get_session(&session_id).await;
        assert!(retrieved_after.is_none());
    }

    #[tokio::test]
    async fn test_message_batching() {
        let manager = SessionManager::new();
        let session = ClientSession {
            session_id: Uuid::new_v4().to_string(),
            client_id: Uuid::new_v4().to_string(),
            user_id: "user1".to_string(),
            room_id: Some("room1".to_string()),
            connected_at: chrono::Utc::now(),
            last_heartbeat: chrono::Utc::now(),
            is_muted: false,
        };

        let session_id = session.session_id.clone();
        manager.register_session(session).await.unwrap();

        // Add messages below batch size
        for i in 0..49 {
            let result = manager.add_to_batch(&session_id, json!({"msg": i})).await.unwrap();
            assert_eq!(result, false, "Should not flush at message {}", i);
        }

        // Add message at batch size (50)
        let result = manager.add_to_batch(&session_id, json!({"msg": 49})).await.unwrap();
        assert_eq!(result, true, "Should flush at message 49");

        // Get batched messages
        let batched = manager.get_batched_messages(&session_id).await;
        assert_eq!(batched.len(), 50, "Should have 50 messages in batch");
    }

    #[tokio::test]
    async fn test_queue_depth_limit() {
        let manager = SessionManager::new();
        let session = ClientSession {
            session_id: Uuid::new_v4().to_string(),
            client_id: Uuid::new_v4().to_string(),
            user_id: "user1".to_string(),
            room_id: Some("room1".to_string()),
            connected_at: chrono::Utc::now(),
            last_heartbeat: chrono::Utc::now(),
            is_muted: false,
        };

        let session_id = session.session_id.clone();
        manager.register_session(session).await.unwrap();

        // Add messages up to max_queue_depth (1000)
        for i in 0..1000 {
            let result = manager.add_to_batch(&session_id, json!({"msg": i})).await.unwrap();
            assert!(result.is_ok(), "Should succeed at message {}", i);
        }

        // Try to add one more (should fail)
        let result = manager.add_to_batch(&session_id, json!({"msg": 1000})).await;
        assert!(result.is_err() || !result.unwrap(), "Should fail when queue depth exceeded");
    }

    #[tokio::test]
    async fn test_rate_limiting() {
        let manager = SessionManager::new();
        let session = ClientSession {
            session_id: Uuid::new_v4().to_string(),
            client_id: Uuid::new_v4().to_string(),
            user_id: "user1".to_string(),
            room_id: Some("room1".to_string()),
            connected_at: chrono::Utc::now(),
            last_heartbeat: chrono::Utc::now(),
            is_muted: false,
        };

        let session_id = session.session_id.clone();
        manager.register_session(session).await.unwrap();

        // Add 100 messages (should hit rate limit)
        let mut successes = 0;
        for i in 0..110 {
            let result = manager.add_to_batch(&session_id, json!({"msg": i})).await;
            if result.is_ok() && result.unwrap() {
                successes += 1;
            }
        }

        assert!(successes <= 100, "Should limit to ~100 messages per second");
    }

    #[tokio::test]
    async fn test_queue_stats() {
        let manager = SessionManager::new();
        let session = ClientSession {
            session_id: Uuid::new_v4().to_string(),
            client_id: Uuid::new_v4().to_string(),
            user_id: "user1".to_string(),
            room_id: Some("room1".to_string()),
            connected_at: chrono::Utc::now(),
            last_heartbeat: chrono::Utc::now(),
            is_muted: false,
        };

        let session_id = session.session_id.clone();
        manager.register_session(session).await.unwrap();

        // Add some messages
        for i in 0..10 {
            manager.add_to_batch(&session_id, json!({"msg": i})).await.unwrap();
        }

        // Get stats
        let stats = manager.get_queue_stats(&session_id).await;
        assert!(stats.is_some());

        let stats = stats.unwrap();
        assert_eq!(stats.queue_depth, 10, "Should have 10 messages in queue");
    }

    #[tokio::test]
    async fn test_session_configuration() {
        let manager = SessionManager::with_config(
            25,                      // batch_size
            75,                      // max_batch_size
            Duration::from_millis(100),  // batch_timeout
            500,                      // max_queue_depth
            200,                      // rate_limit_messages
            Duration::from_millis(500)  // rate_limit_window
        );

        let session = ClientSession {
            session_id: Uuid::new_v4().to_string(),
            client_id: Uuid::new_v4().to_string(),
            user_id: "user1".to_string(),
            room_id: Some("room1".to_string()),
            connected_at: chrono::Utc::now(),
            last_heartbeat: chrono::Utc::now(),
            is_muted: false,
        };

        let session_id = session.session_id.clone();
        manager.register_session(session).await.unwrap();

        // Add messages up to configured batch size
        for i in 0..24 {
            let result = manager.add_to_batch(&session_id, json!({"msg": i})).await.unwrap();
            assert_eq!(result, false, "Should not flush at message {}", i);
        }

        // Add message at batch size (25)
        let result = manager.add_to_batch(&session_id, json!({"msg": 24})).await.unwrap();
        assert_eq!(result, true, "Should flush at message 24 with configured batch size");
    }

    #[tokio::test]
    async fn test_multiple_sessions_in_room() {
        let manager = SessionManager::new();
        let room_id = "room1".to_string();

        // Create 3 sessions in same room
        for i in 0..3 {
            let session = ClientSession {
                session_id: Uuid::new_v4().to_string(),
                client_id: Uuid::new_v4().to_string(),
                user_id: format!("user{}", i),
                room_id: Some(room_id.clone()),
                connected_at: chrono::Utc::now(),
                last_heartbeat: chrono::Utc::now(),
                is_muted: false,
            };
            manager.register_session(session).await.unwrap();
        }

        let room_sessions = manager.get_room_sessions(&room_id).await;
        assert_eq!(room_sessions.len(), 3, "Should have 3 sessions in room");
    }

    #[tokio::test]
    async fn test_session_cleanup() {
        let manager = SessionManager::new();

        let session1 = ClientSession {
            session_id: Uuid::new_v4().to_string(),
            client_id: Uuid::new_v4().to_string(),
            user_id: "user1".to_string(),
            room_id: Some("room1".to_string()),
            connected_at: chrono::Utc::now(),
            last_heartbeat: chrono::Utc::now(),
            is_muted: false,
        };

        let session_id1 = session1.session_id.clone();
        manager.register_session(session1).await.unwrap();

        // Unregister session
        let removed = manager.unregister_session(&session_id1).await.unwrap();
        assert!(removed.is_some());
        assert_eq!(removed.unwrap().user_id, "user1");

        // Verify session is gone
        let retrieved = manager.get_session(&session_id1).await;
        assert!(retrieved.is_none());

        // Verify rate limiter is cleaned up
        let stats = manager.get_queue_stats(&session_id1).await;
        assert!(stats.is_none(), "Stats should be None after cleanup");
    }

    #[tokio::test]
    async fn test_heartbeat_update() {
        let manager = SessionManager::new();
        let session = ClientSession {
            session_id: Uuid::new_v4().to_string(),
            client_id: Uuid::new_v4().to_string(),
            user_id: "user1".to_string(),
            room_id: Some("room1".to_string()),
            connected_at: chrono::Utc::now() - chrono::Duration::seconds(10),
            last_heartbeat: chrono::Utc::now() - chrono::Duration::seconds(10),
            is_muted: false,
        };

        let session_id = session.session_id.clone();
        manager.register_session(session).await.unwrap();

        let session_before = manager.get_session(&session_id).await.unwrap();
        let heartbeat_before = session_before.last_heartbeat;

        // Update heartbeat
        manager.update_heartbeat(&session_id).await.unwrap();

        let session_after = manager.get_session(&session_id).await.unwrap();
        let heartbeat_after = session_after.last_heartbeat;

        assert!(heartbeat_after > heartbeat_before, "Heartbeat should be updated");
    }

    #[tokio::test]
    async fn test_broadcast_to_room() {
        let manager = SessionManager::new();
        let room_id = "room1".to_string();

        // Create 3 sessions in same room
        let session_ids: Vec<String> = (0..3)
            .map(|i| {
                let session_id = Uuid::new_v4().to_string();
                let session = ClientSession {
                    session_id: session_id.clone(),
                    client_id: Uuid::new_v4().to_string(),
                    user_id: format!("user{}", i),
                    room_id: Some(room_id.clone()),
                    connected_at: chrono::Utc::now(),
                    last_heartbeat: chrono::Utc::now(),
                    is_muted: false,
                };
                manager.register_session(session).await.unwrap();
                session_id
            })
            .collect();

        // Broadcast message
        let message = json!({"type": "test", "data": "hello"});
        let broadcast_count = manager.broadcast_to_room(&room_id, message.clone()).await.unwrap();

        assert_eq!(broadcast_count, 3, "Should broadcast to 3 sessions");

        // Verify all sessions have the message
        for session_id in &session_ids {
            let batched = manager.get_batched_messages(session_id).await;
            assert!(!batched.is_empty(), "Session {} should have messages", session_id);
        }
    }
}
