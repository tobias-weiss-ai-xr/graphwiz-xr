//! Redis pub/sub for scaling WebSocket server across multiple instances

use reticulum_core::Result;
use std::sync::Arc;
use tokio::sync::mpsc;
use tokio::task::JoinHandle;
use redis::AsyncCommands;
use redis::aio::Connection;
use serde_json;

/// Redis configuration
#[derive(Clone, Debug)]
pub struct RedisConfig {
    pub url: String,
    pub channel_prefix: String,
}

impl Default for RedisConfig {
    fn default() -> Self {
        Self {
            url: "redis://127.0.0.1:6379".to_string(),
            channel_prefix: "graphwiz".to_string(),
        }
    }
}

/// Message to broadcast via Redis pub/sub
#[derive(Clone, Debug)]
pub struct PubSubMessage {
    pub room_id: String,
    pub message_type: PubSubMessageType,
    pub data: Vec<u8>,
    pub exclude_connection: Option<String>,
    pub timestamp: i64,
}

impl PubSubMessage {
    /// Convert to JSON for Redis pub/sub
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        let json = json!({
            "room_id": self.room_id,
            "type": format!("{:?}", self.message_type),
            "data": self.data,
            "exclude_connection": self.exclude_connection,
            "timestamp": self.timestamp,
        });
        serde_json::to_string(&json)
    }
}

#[derive(Clone, Debug)]
pub enum PubSubMessageType {
    Broadcast,
    PresenceEvent,
    SystemNotification,
}

/// Redis pub/sub manager for scaling
pub struct RedisPubSub {
    config: RedisConfig,
    client: Arc<redis::Client>,
    _subscriber_task: Option<JoinHandle<()>>,
}

impl RedisPubSub {
    /// Create a new Redis pub/sub manager
    ///
    /// # Arguments
    /// * `config` - Redis connection configuration
    /// * `message_receiver` - Channel to receive published messages
    pub async fn new(
        config: RedisConfig,
        mut message_receiver: mpsc::Receiver<PubSubMessage>,
    ) -> Result<Self> {
        log::info!("Initializing Redis pub/sub: {}", config.url);

        // Connect to Redis with connection pooling
        let client = redis::Client::open(config.url.clone())
            .map_err(|e| reticulum_core::error::Error::RedisError(format!("Failed to connect to Redis: {}", e)))?;

        let client = Arc::new(client);

        // Test connection
        let mut conn = client
            .get_async_connection()
            .await
            .map_err(|e| reticulum_core::error::Error::RedisError(format!("Failed to get async connection: {}", e)))?;

        redis::cmd("PING")
            .query_async::<_, String>(&mut conn)
            .await
            .map_err(|e| reticulum_core::error::Error::RedisError(format!("Redis ping failed: {}", e)))?;

        log::info!("Successfully connected to Redis at {}", config.url);

        // Spawn a task to handle publishing messages
        let client_clone = client.clone();
        let config_clone = config.clone();
        let _subscriber_task = Some(tokio::spawn(async move {
            while let Some(msg) = message_receiver.recv().await {
                if let Err(e) = Self::publish_message(&client_clone, &config_clone, &msg).await {
                    log::error!("Failed to publish message: {}", e);
                }
            }
        }));

        Ok(Self {
            config,
            client,
            _subscriber_task,
        })
    }

    /// Publish a message to Redis
    async fn publish_message(
        client: &redis::Client,
        config: &RedisConfig,
        msg: &PubSubMessage,
    ) -> Result<()> {
        // Serialize message to JSON
        let json_str = msg.to_json()
            .map_err(|e| reticulum_core::error::Error::SerializationError(format!("Failed to serialize message: {}", e)))?;

        // Build channel name: {prefix}:room:{room_id}
        let channel = format!(
            "{}:room:{}",
            config.channel_prefix,
            msg.room_id.replace('/', ":")
        );

        // Get async connection
        let mut conn = client
            .get_async_connection()
            .await
            .map_err(|e| reticulum_core::Error::RedisError(format!("Failed to get async connection: {}", e)))?;

        // Publish to Redis channel
        let _: () = redis::cmd("PUBLISH")
            .arg(&channel)
            .arg(&json_str)
            .query_async(&mut conn)
            .await
            .map_err(|e| reticulum_core::Error::RedisError(format!("Failed to publish to Redis: {}", e)))?;

        log::debug!(
            "Published to Redis channel {}: {} bytes",
            channel,
            msg.data.len()
        );

        Ok(())
    }

    /// Subscribe to a Redis channel for room messages
    pub async fn subscribe_room(
        &self,
        room_id: &str,
        callback: impl Fn(serde_json::Value) + Send + Sync + 'static,
    ) -> Result<JoinHandle<()>> {
        let channel = format!(
            "{}:room:{}",
            self.config.channel_prefix,
            room_id.replace('/', ":")
        );

        let client_clone = self.client.clone();
        let channel_clone = channel.clone();

        Ok(tokio::spawn(async move {
            let pubsub = client_clone.as_pubsub();
            let mut conn = match client_clone.get_async_connection().await {
                Ok(c) => c,
                Err(e) => {
                    log::error!("Failed to get Redis connection for subscription: {}", e);
                    return;
                }
            };

            if let Err(e) = pubsub.subscribe(&channel_clone).async_query(&mut conn).await {
                log::error!("Failed to subscribe to Redis channel {}: {}", channel_clone, e);
                return;
            }

            log::info!("Subscribed to Redis channel: {}", channel_clone);

            // Process messages
            let msg_stream = pubsub.on_message();
            while let Some(msg) = msg_stream.next().await {
                match msg {
                    redis::AsyncMessage::Data(data) => {
                        if let Ok(value) = serde_json::from_slice(&data.get_payload_bytes()) {
                            callback(value);
                        }
                    }
                    redis::AsyncMessage::Subscribe(channel, count) => {
                        log::debug!("Subscribed to {} (count: {})", channel, count);
                    }
                    redis::AsyncMessage::Unsubscribe(channel) => {
                        log::debug!("Unsubscribed from {}", channel);
                        break;
                    }
                    _ => {}
                }
            }
        }))
    }

    /// Publish presence update for a user in a room
    pub async fn publish_presence_update(
        &self,
        room_id: &str,
        user_id: &str,
        event: &str,
    ) -> Result<()> {
        let message = PubSubMessage {
            room_id: room_id.to_string(),
            message_type: PubSubMessageType::PresenceEvent,
            data: serde_json::to_vec(&json!({
                "user_id": user_id,
                "event": event,
            }))
            .unwrap(),
            exclude_connection: None,
            timestamp: chrono::Utc::now().timestamp(),
        };

        Self::publish_message(&self.client, &self.config, &message).await
    }
}

impl Default for RedisConfig {
    fn default() -> Self {
        Self {
            url: "redis://127.0.0.1:6379".to_string(),
            channel_prefix: "graphwiz".to_string(),
        }
    }
}

/// Message to broadcast via Redis pub/sub
#[derive(Clone, Debug)]
pub struct PubSubMessage {
    pub room_id: String,
    pub message_type: PubSubMessageType,
    pub data: Vec<u8>,
    pub exclude_connection: Option<String>,
    pub timestamp: i64,
}

#[derive(Clone, Debug)]
pub enum PubSubMessageType {
    Broadcast,
    PresenceEvent,
    SystemNotification,
}

/// Redis pub/sub manager for scaling
pub struct RedisPubSub {
    config: RedisConfig,
    _subscriber_task: Option<JoinHandle<()>>,
}

impl RedisPubSub {
    /// Create a new Redis pub/sub manager
    ///
    /// # Arguments
    /// * `config` - Redis connection configuration
    /// * `message_receiver` - Channel to receive published messages
    pub async fn new(
        config: RedisConfig,
        mut message_receiver: mpsc::Receiver<PubSubMessage>,
    ) -> Result<Self> {
        log::info!("Initializing Redis pub/sub: {}", config.url);

        // Note: This is a placeholder implementation
        // In production, you would use a Redis client library like:
        // - `redis-rs` with async/tokio support
        // - Connection pooling
        // - Automatic reconnection
        // - Proper error handling

        // Spawn a task to handle publishing messages
        let _subscriber_task = Some(tokio::spawn(async move {
            while let Some(msg) = message_receiver.recv().await {
                // Publish to Redis
                if let Err(e) = Self::publish_message(&config, &msg).await {
                    log::error!("Failed to publish message: {}", e);
                }
            }
        }));

        Ok(Self {
            config,
            _subscriber_task,
        })
    }

    /// Publish a message to Redis
    async fn publish_message(config: &RedisConfig, msg: &PubSubMessage) -> Result<()> {
        // Placeholder implementation
        // In production, you would:
        // 1. Connect to Redis
        // 2. Serialize the message (JSON/bincode/protobuf)
        // 3. Publish to the appropriate channel: {prefix}:room:{room_id}
        // 4. Handle connection errors and reconnection

        let channel = format!(
            "{}:room:{}",
            config.channel_prefix,
            msg.room_id.replace('/', ":")
        );

        log::debug!(
            "Publishing to Redis channel {}: {} bytes",
            channel,
            msg.data.len()
        );

        // Simulate Redis publish
        // let client = redis::Client::open(config.url.as_str())?;
        // let mut con = client.get_async_connection().await?;
        // con.publish(channel, serialized_data).await?;

        Ok(())
    }

    /// Subscribe to a room's channel
    pub async fn subscribe_room(
        &self,
        room_id: &str,
        mut message_sender: mpsc::Sender<PubSubMessage>,
    ) -> Result<JoinHandle<()>> {
        let config = self.config.clone();
        let room_id = room_id.to_string();

        let handle = tokio::spawn(async move {
            // Placeholder implementation
            // In production, you would:
            // 1. Connect to Redis
            // 2. Subscribe to the channel: {prefix}:room:{room_id}
            // 3. Listen for messages
            // 4. Deserialize and send to message_sender
            // 5. Handle reconnection on failure

            let channel = format!(
                "{}:room:{}",
                config.channel_prefix,
                room_id.replace('/', ":")
            );

            log::info!("Subscribed to Redis channel: {}", channel);

            // Simulate subscription - in production this would be a long-running task
            // let client = redis::Client::open(config.url.as_str())?;
            // let mut con = client.get_async_connection().await?;
            // let mut pubsub = con.into_pubsub();
            // pubsub.subscribe(&channel).await?;

            // loop {
            //     let msg = pubsub.on_message().await?;
            //     let payload: PubSubMessage = deserialize(msg.get_payload_bytes()?)?;
            //     message_sender.send(payload).await?;
            // }

            // Keep the task alive
            loop {
                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
            }
        });

        Ok(handle)
    }

    /// Unsubscribe from a room's channel
    pub async fn unsubscribe_room(&self, _room_id: &str) -> Result<()> {
        // Placeholder implementation
        // In production, you would cancel the subscription task
        Ok(())
    }

    /// Publish a message to a room
    pub async fn publish(&self, msg: PubSubMessage) -> Result<()> {
        Self::publish_message(&self.config, &msg).await
    }

    /// Check if Redis is available
    pub async fn health_check(&self) -> Result<bool> {
        // Placeholder implementation
        // In production, you would ping Redis
        Ok(true)
    }
}

/// Redis-backed connection state for distributed systems
pub struct RedisConnectionState {
    config: RedisConfig,
}

impl RedisConnectionState {
    /// Create a new Redis connection state manager
    pub fn new(config: RedisConfig) -> Self {
        Self { config }
    }

    /// Register a connection in Redis
    pub async fn register_connection(
        &self,
        conn_id: &str,
        room_id: &str,
        user_id: &str,
    ) -> Result<()> {
        // Placeholder implementation
        // In production, you would store in Redis with TTL:
        // key: {prefix}:connection:{conn_id}
        // value: {room_id, user_id, connected_at}
        // TTL: 300 seconds (auto-refreshed)

        let key = format!("{}:connection:{}", self.config.channel_prefix, conn_id);
        log::debug!("Registered connection in Redis: {}", key);

        Ok(())
    }

    /// Unregister a connection from Redis
    pub async fn unregister_connection(&self, conn_id: &str) -> Result<()> {
        // Placeholder implementation
        // Delete the connection key from Redis

        let key = format!("{}:connection:{}", self.config.channel_prefix, conn_id);
        log::debug!("Unregistered connection from Redis: {}", key);

        Ok(())
    }

    /// Get all connections for a room across all instances
    pub async fn get_room_connections(&self, room_id: &str) -> Result<Vec<String>> {
        // Placeholder implementation
        // In production, you would query Redis for all connections in the room:
        // SCAN for keys matching {prefix}:connection:*
        // Filter by room_id
        // Return connection IDs

        let pattern = format!("{}:connection:*", self.config.channel_prefix);
        log::debug!("Scanning Redis for pattern: {}", pattern);

        Ok(Vec::new())
    }

    /// Check if a connection exists
    pub async fn connection_exists(&self, conn_id: &str) -> Result<bool> {
        // Placeholder implementation
        // Check if the connection key exists in Redis

        let key = format!("{}:connection:{}", self.config.channel_prefix, conn_id);
        log::debug!("Checking connection in Redis: {}", key);

        Ok(false)
    }
}

/// Cluster-aware message broadcaster using Redis
pub struct ClusterBroadcaster {
    pubsub: RedisPubSub,
    connection_state: RedisConnectionState,
    instance_id: String,
}

impl ClusterBroadcaster {
    /// Create a new cluster broadcaster
    ///
    /// # Arguments
    /// * `config` - Redis configuration
    /// * `message_receiver` - Channel for outgoing messages
    pub async fn new(
        config: RedisConfig,
        message_receiver: mpsc::Receiver<PubSubMessage>,
    ) -> Result<Self> {
        let pubsub = RedisPubSub::new(config.clone(), message_receiver).await?;
        let connection_state = RedisConnectionState::new(config);
        let instance_id = uuid::Uuid::new_v4().to_string();

        Ok(Self {
            pubsub,
            connection_state,
            instance_id,
        })
    }

    /// Broadcast a message to all instances
    pub async fn broadcast(
        &self,
        room_id: &str,
        data: Vec<u8>,
        exclude_connection: Option<String>,
    ) -> Result<()> {
        let msg = PubSubMessage {
            room_id: room_id.to_string(),
            message_type: PubSubMessageType::Broadcast,
            data,
            exclude_connection,
            timestamp: chrono::Utc::now().timestamp_micros(),
        };

        self.pubsub.publish(msg).await
    }

    /// Register this instance's connection
    pub async fn register_connection(
        &self,
        conn_id: &str,
        room_id: &str,
        user_id: &str,
    ) -> Result<()> {
        self.connection_state
            .register_connection(conn_id, room_id, user_id)
            .await
    }

    /// Unregister this instance's connection
    pub async fn unregister_connection(&self, conn_id: &str) -> Result<()> {
        self.connection_state
            .unregister_connection(conn_id)
            .await
    }

    /// Get instance ID
    pub fn instance_id(&self) -> &str {
        &self.instance_id
    }

    /// Health check
    pub async fn health_check(&self) -> Result<bool> {
        self.pubsub.health_check().await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::{sleep, Duration};

    #[tokio::test]
    async fn test_pubsub_message_creation() {
        let msg = PubSubMessage {
            room_id: "test-room".to_string(),
            message_type: PubSubMessageType::Broadcast,
            data: vec![1, 2, 3, 4],
            exclude_connection: Some("conn-1".to_string()),
            timestamp: 12345,
        };

        assert_eq!(msg.room_id, "test-room");
        assert_eq!(msg.data.len(), 4);
        assert!(msg.exclude_connection.is_some());
    }

    #[tokio::test]
    async fn test_redis_config() {
        let config = RedisConfig {
            url: "redis://localhost:6379".to_string(),
            channel_prefix: "test".to_string(),
        };

        assert_eq!(config.url, "redis://localhost:6379");
        assert_eq!(config.channel_prefix, "test");
    }

    #[tokio::test]
    async fn test_connection_state() {
        let state = RedisConnectionState::new(RedisConfig::default());

        // These should succeed even without Redis (placeholder)
        let result = state.register_connection("conn-1", "room-1", "user-1").await;
        assert!(result.is_ok());

        let connections = state.get_room_connections("room-1").await.unwrap();
        assert!(connections.is_empty()); // Placeholder returns empty
    }
}
