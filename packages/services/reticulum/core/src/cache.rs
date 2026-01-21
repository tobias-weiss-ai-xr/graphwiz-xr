//! Redis caching layer for performance optimization

use serde::{Serialize, Deserialize};
use std::time::Duration;
use anyhow::{Result, Context};

/// Cache entry with expiration metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheEntry<T: Serialize> {
    pub value: T,
    pub expires_at: Option<i64>,
}

/// Redis cache manager
pub struct CacheManager {
    client: Option<redis::aio::MultiplexedConnection>,
    default_ttl: Duration,
}

impl CacheManager {
    /// Create new cache manager (without Redis, for development)
    pub fn new() -> Self {
        Self {
            client: None,
            default_ttl: Duration::from_secs(300), // 5 minutes default TTL
        }
    }

    /// Create cache manager with Redis connection
    pub fn with_redis(redis_url: &str) -> Result<Self> {
        let client = redis::Client::open(redis_url)
            .context("Failed to create Redis client")?;

        let conn = tokio::runtime::Runtime::new()
            .context("Failed to create Tokio runtime")?
            .block_on(async {
                client.get_multiplexed_async_connection().await
                    .context("Failed to get Redis connection")
            })?;

        Ok(Self {
            client: Some(conn),
            default_ttl: Duration::from_secs(300),
        })
    }

    /// Get cached value
    pub async fn get<T: for<'de> Deserialize<'de> + Serialize>(&self, key: &str) -> Result<Option<T>> {
        if let Some(ref client) = self.client {
            let mut conn = client.clone();
            let value: Option<String> = redis::cmd("GET").arg(key).query_async(&mut conn).await
                .context(format!("Failed to get cache key: {}", key))?;

            if let Some(ref json) = value {
                let entry: CacheEntry<T> = serde_json::from_str(json)
                    .context("Failed to deserialize cache entry")?;

                // Check expiration
                if let Some(expires_at) = entry.expires_at {
                    let now = chrono::Utc::now().timestamp();
                    if expires_at < now {
                        return Ok(None); // Cache entry expired
                    }
                }

                return Ok(Some(entry.value));
            }

            Ok(None)
        } else {
            Ok(None) // No Redis configured, return None
        }
    }

    /// Set cached value
    pub async fn set<T: Serialize>(&self, key: &str, value: &T, ttl: Option<Duration>) -> Result<()> {
        if let Some(ref client) = self.client {
            let ttl = ttl.unwrap_or(self.default_ttl);
            let expires_at = Some(chrono::Utc::now().timestamp() + ttl.as_secs() as i64);

            let entry = CacheEntry {
                value,
                expires_at,
            };

            let json = serde_json::to_string(&entry)
                .context("Failed to serialize cache entry")?;

            let mut conn = client.clone();
            redis::cmd("SET").arg(key).arg(json).query_async(&mut conn).await
                .context(format!("Failed to set cache key: {}", key))?;

            if let Some(ttl) = ttl {
                redis::cmd("EXPIRE").arg(key).arg(ttl.as_secs()).query_async(&mut conn).await
                    .context(format!("Failed to set expiration for cache key: {}", key))?;
            }
        }

        Ok(())
    }

    /// Delete cached value
    pub async fn delete(&self, key: &str) -> Result<()> {
        if let Some(ref client) = self.client {
            let mut conn = client.clone();
            redis::cmd("DEL").arg(key).query_async(&mut conn).await
                .context(format!("Failed to delete cache key: {}", key))?;
        }

        Ok(())
    }

    /// Clear all cache (dangerous!)
    pub async fn clear(&self) -> Result<()> {
        if let Some(ref client) = self.client {
            let mut conn = client.clone();
            redis::cmd("FLUSHDB").query_async::<_, ()>(&mut conn).await
                .context("Failed to clear Redis cache")?;
        }

        Ok(())
    }

    /// Set multiple values atomically
    pub async fn set_many<T: Serialize>(&self, items: Vec<(&str, &T, Option<Duration>)>) -> Result<()> {
        if let Some(ref client) = self.client {
            let mut conn = client.clone();
            let mut pipe = redis::pipe();

            for (key, value, ttl) in items {
                let ttl = ttl.unwrap_or(self.default_ttl);
                let expires_at = Some(chrono::Utc::now().timestamp() + ttl.as_secs() as i64);

                let entry = CacheEntry {
                    value,
                    expires_at,
                };

                let json = serde_json::to_string(&entry)
                    .context("Failed to serialize cache entry")?;

                pipe.set_ex(key, json, ttl.as_secs() as u64);
            }

            pipe.query_async::<_, ()>(&mut conn).await
                .context("Failed to set multiple cache keys")?;
        }

        Ok(())
    }

    /// Get multiple values
    pub async fn get_many<T: for<'de> Deserialize<'de> + Serialize + Clone>(&self, keys: Vec<&str>) -> Result<Vec<Option<T>>> {
        if let Some(ref client) = self.client {
            let mut conn = client.clone();
            let mut results = Vec::new();

            for key in keys {
                let value: Option<String> = redis::AsyncCommands::get(&mut conn, key).await.ok().flatten();
                if let Some(ref json) = value {
                    let entry: Option<CacheEntry<T>> = serde_json::from_str(json).ok();
                    if let Some(ref entry) = entry {
                        // Check expiration
                        if let Some(expires_at) = entry.expires_at {
                            let now = chrono::Utc::now().timestamp();
                            if expires_at >= now {
                                results.push(Some(entry.value.clone()));
                                continue;
                            }
                        }
                        results.push(Some(entry.value.clone()));
                        continue;
                    }
                }

                results.push(None);
            }

            Ok(results)
        } else {
            Ok(keys.iter().map(|_| None).collect()) // No Redis, return all None
        }
    }
}

/// Cache keys for common operations
pub mod cache_keys {
    pub fn user(user_id: i32) -> String {
        format!("user:{}", user_id)
    }

    pub fn room(room_id: &str) -> String {
        format!("room:{}", room_id)
    }

    pub fn room_list(page: i32, per_page: i32) -> String {
        format!("rooms:list:{}:{}", page, per_page)
    }

    pub fn user_list(page: i32, per_page: i32, search: &str) -> String {
        format!("users:list:{}:{}:{}", page, per_page, search)
    }

    pub fn system_stats() -> String {
        "system:stats".to_string()
    }

    pub fn metrics_summary(hours: i32) -> String {
        format!("metrics:summary:{}h", hours)
    }
}

/// Cache TTL durations
pub mod ttl {
    pub const SHORT: Duration = Duration::from_secs(60); // 1 minute
    pub const MEDIUM: Duration = Duration::from_secs(300); // 5 minutes
    pub const LONG: Duration = Duration::from_secs(3600); // 1 hour
    pub const VERY_LONG: Duration = Duration::from_secs(86400); // 24 hours
}
