//! Message queuing for reliable delivery

use reticulum_core::Result;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use tokio::time::{Duration, Instant};

/// Message with acknowledgment tracking
#[derive(Clone, Debug)]
pub struct QueuedMessage {
    pub id: String,
    pub data: Vec<u8>,
    pub created_at: Instant,
    pub retry_count: u32,
    pub max_retries: u32,
}

/// Message queue for reliable delivery
#[derive(Clone)]
pub struct MessageQueue {
    queues: Arc<RwLock<HashMap<String, mpsc::Sender<QueuedMessage>>>>,
    queue_size: usize,
    retry_interval: Duration,
}

impl MessageQueue {
    /// Create a new message queue
    ///
    /// # Arguments
    /// * `queue_size` - Maximum number of messages per queue
    /// * `retry_interval_secs` - Seconds between retry attempts
    pub fn new(queue_size: usize, retry_interval_secs: u64) -> Self {
        Self {
            queues: Arc::new(RwLock::new(HashMap::new())),
            queue_size,
            retry_interval: Duration::from_secs(retry_interval_secs),
        }
    }

    /// Create a queue for a specific connection
    pub async fn create_queue(&self, conn_id: String) -> mpsc::Receiver<QueuedMessage> {
        let (tx, rx) = mpsc::channel(self.queue_size);
        let mut queues = self.queues.write().await;
        queues.insert(conn_id.clone(), tx);
        rx
    }

    /// Remove a queue (cleanup on disconnect)
    pub async fn remove_queue(&self, conn_id: &str) {
        let mut queues = self.queues.write().await;
        queues.remove(conn_id);
    }

    /// Queue a message for delivery
    pub async fn enqueue(&self, conn_id: &str, data: Vec<u8>, max_retries: u32) -> Result<()> {
        let queues = self.queues.read().await;
        if let Some(tx) = queues.get(conn_id) {
            let msg = QueuedMessage {
                id: uuid::Uuid::new_v4().to_string(),
                data,
                created_at: Instant::now(),
                retry_count: 0,
                max_retries,
            };

            tx.send(msg)
                .await
                .map_err(|_| reticulum_core::Error::InternalError("Queue closed".to_string()))?;
            Ok(())
        } else {
            Err(reticulum_core::Error::InternalError(format!(
                "Queue not found for connection: {}",
                conn_id
            )))
        }
    }

    /// Get queue size for a connection
    pub async fn get_queue_size(&self, conn_id: &str) -> usize {
        let queues = self.queues.read().await;
        queues
            .get(conn_id)
            .map(|tx| tx.capacity() - tx.len())
            .unwrap_or(0)
    }

    /// Get total number of active queues
    pub async fn get_active_queues(&self) -> usize {
        let queues = self.queues.read().await;
        queues.len()
    }
}

impl Default for MessageQueue {
    fn default() -> Self {
        Self::new(1000, 5) // 1000 messages, retry every 5 seconds
    }
}

/// Message with acknowledgment
#[derive(Clone, Debug)]
pub struct AcknowledgedMessage {
    pub message_id: String,
    pub data: Vec<u8>,
    pub timestamp: i64,
}

/// Acknowledgment tracker for reliable delivery
#[derive(Clone)]
pub struct AckTracker {
    pending: Arc<RwLock<HashMap<String, PendingMessage>>>,
    timeout: Duration,
}

#[derive(Clone, Debug)]
struct PendingMessage {
    data: Vec<u8>,
    created_at: Instant,
    retry_count: u32,
}

impl AckTracker {
    /// Create a new acknowledgment tracker
    ///
    /// # Arguments
    /// * `timeout_secs` - Seconds before message is considered lost
    pub fn new(timeout_secs: u64) -> Self {
        Self {
            pending: Arc::new(RwLock::new(HashMap::new())),
            timeout: Duration::from_secs(timeout_secs),
        }
    }

    /// Register a message for acknowledgment tracking
    pub async fn register(&self, message_id: String, data: Vec<u8>) {
        let mut pending = self.pending.write().await;
        pending.insert(
            message_id,
            PendingMessage {
                data,
                created_at: Instant::now(),
                retry_count: 0,
            },
        );
    }

    /// Acknowledge a message
    pub async fn acknowledge(&self, message_id: &str) -> Option<Vec<u8>> {
        let mut pending = self.pending.write().await;
        pending.remove(message_id).map(|p| p.data)
    }

    /// Get messages that need retry
    pub async fn get_expired_messages(&self) -> Vec<(String, Vec<u8>, u32)> {
        let mut pending = self.pending.write().await;
        let now = Instant::now();
        let mut expired = Vec::new();

        pending.retain(|id, msg| {
            if now.duration_since(msg.created_at) > self.timeout {
                expired.push((id.clone(), msg.data.clone(), msg.retry_count));
                false // Remove from pending
            } else {
                true
            }
        });

        expired
    }

    /// Get count of pending messages
    pub async fn pending_count(&self) -> usize {
        let pending = self.pending.read().await;
        pending.len()
    }

    /// Clean up old pending messages
    pub async fn cleanup(&self) {
        let mut pending = self.pending.write().await;
        let now = Instant::now();
        pending.retain(|_, msg| now.duration_since(msg.created_at) < self.timeout * 2);
    }
}

impl Default for AckTracker {
    fn default() -> Self {
        Self::new(30) // 30 second timeout
    }
}

/// Reliable message delivery manager
#[derive(Clone)]
pub struct ReliableDelivery {
    queue: MessageQueue,
    ack_tracker: AckTracker,
}

impl ReliableDelivery {
    /// Create a new reliable delivery manager
    pub fn new(queue: MessageQueue, ack_tracker: AckTracker) -> Self {
        Self { queue, ack_tracker }
    }

    /// Send a message reliably
    pub async fn send_reliable(&self, conn_id: &str, data: Vec<u8>) -> Result<String> {
        let message_id = uuid::Uuid::new_v4().to_string();

        // Register for acknowledgment tracking
        self.ack_tracker.register(message_id.clone(), data.clone());

        // Queue for delivery
        self.queue
            .enqueue(conn_id, data, 3)
            .await?;

        Ok(message_id)
    }

    /// Handle acknowledgment
    pub async fn handle_ack(&self, message_id: &str) -> Result<()> {
        self.ack_tracker.acknowledge(message_id).await;
        Ok(())
    }

    /// Get pending message count
    pub async fn pending_count(&self) -> usize {
        self.ack_tracker.pending_count().await
    }

    /// Process expired messages (should be called periodically)
    pub async fn process_expired(&self) -> Vec<(String, Vec<u8>, u32)> {
        self.ack_tracker.get_expired_messages().await
    }
}

impl Default for ReliableDelivery {
    fn default() -> Self {
        Self::new(MessageQueue::default(), AckTracker::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::{sleep, Duration};

    #[tokio::test]
    async fn test_message_queue() {
        let queue = MessageQueue::new(10, 1);
        let conn_id = "test-conn";

        // Create queue
        let mut rx = queue.create_queue(conn_id.to_string()).await;

        // Enqueue message
        let data = vec![1, 2, 3, 4];
        queue.enqueue(conn_id, data.clone(), 3).await.unwrap();

        // Receive message
        let msg = rx.recv().await.unwrap();
        assert_eq!(msg.data, data);
        assert_eq!(msg.retry_count, 0);
        assert_eq!(msg.max_retries, 3);
    }

    #[tokio::test]
    async fn test_ack_tracker() {
        let tracker = AckTracker::new(1);
        let message_id = "msg-123".to_string();
        let data = vec![5, 6, 7, 8];

        // Register message
        tracker.register(message_id.clone(), data.clone()).await;
        assert_eq!(tracker.pending_count().await, 1);

        // Acknowledge message
        let retrieved = tracker.acknowledge(&message_id).await.unwrap();
        assert_eq!(retrieved, data);
        assert_eq!(tracker.pending_count().await, 0);
    }

    #[tokio::test]
    async fn test_reliable_delivery() {
        let delivery = ReliableDelivery::default();
        let conn_id = "test-conn";

        // Send reliable message
        let data = vec![9, 10, 11, 12];
        let message_id = delivery.send_reliable(conn_id, data).await.unwrap();

        // Should have one pending
        assert_eq!(delivery.pending_count().await, 1);

        // Handle acknowledgment
        delivery.handle_ack(&message_id).await.unwrap();

        // Should have zero pending
        assert_eq!(delivery.pending_count().await, 0);
    }

    #[tokio::test]
    async fn test_ack_timeout() {
        let tracker = AckTracker::new(1); // 1 second timeout
        let message_id = "msg-timeout".to_string();
        let data = vec![1, 2, 3];

        tracker.register(message_id.clone(), data).await;

        // Wait for timeout
        sleep(Duration::from_millis(1100)).await;

        // Get expired messages
        let expired = tracker.get_expired_messages().await;
        assert_eq!(expired.len(), 1);
        assert_eq!(expired[0].0, message_id);
    }
}
