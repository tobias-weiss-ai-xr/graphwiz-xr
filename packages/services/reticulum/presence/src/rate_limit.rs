//! Rate limiting for WebSocket connections

use reticulum_core::Result;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// Rate limiter using sliding window algorithm
#[derive(Clone)]
pub struct RateLimiter {
    requests: Arc<RwLock<HashMap<String, SlidingWindow>>>,
    max_requests: usize,
    window_duration: Duration,
}

impl RateLimiter {
    /// Create a new rate limiter
    ///
    /// # Arguments
    /// * `max_requests` - Maximum number of requests allowed in the window
    /// * `window_duration_secs` - Time window in seconds
    pub fn new(max_requests: usize, window_duration_secs: u64) -> Self {
        Self {
            requests: Arc::new(RwLock::new(HashMap::new())),
            max_requests,
            window_duration: Duration::from_secs(window_duration_secs),
        }
    }

    /// Check if a request should be allowed
    ///
    /// # Arguments
    /// * `key` - Identifier to rate limit (e.g., connection_id, user_id, IP)
    ///
    /// # Returns
    /// * `Ok(())` if request is allowed
    /// * `Err(...)` if rate limit is exceeded
    pub async fn check_rate_limit(&self, key: &str) -> Result<()> {
        let mut requests = self.requests.write().await;
        let now = Instant::now();
        let window_start = now - self.window_duration;

        let window = requests.entry(key.to_string()).or_insert_with(|| SlidingWindow {
            timestamps: Vec::new(),
            window_start: now,
        });

        // Clean up old timestamps outside current window
        window.timestamps.retain(|&ts| ts > window_start);

        // Reset window if we're outside the expected window duration
        if window.timestamps.is_empty() {
            window.window_start = now;
        } else if let Some(&oldest) = window.timestamps.first() {
            if oldest < window_start {
                window.window_start = oldest;
                window.timestamps.retain(|&ts| ts > window_start);
            }
        }

        // Check if limit exceeded
        if window.timestamps.len() >= self.max_requests {
            let wait_time = self.window_duration.saturating_sub(now.duration_since(window.window_start));
            return Err(reticulum_core::Error::RateLimitExceeded(format!(
                "Rate limit exceeded. Try again in {} seconds.",
                wait_time.as_secs()
            )));
        }

        // Add current request
        window.timestamps.push(now);

        Ok(())
    }

    /// Remove a key from the rate limiter (cleanup on disconnect)
    pub async fn remove(&self, key: &str) {
        let mut requests = self.requests.write().await;
        requests.remove(key);
    }

    /// Get current usage for a key
    pub async fn get_usage(&self, key: &str) -> (usize, usize) {
        let requests = self.requests.read().await;
        if let Some(window) = requests.get(key) {
            let now = Instant::now();
            let window_start = now - self.window_duration;
            let count = window.timestamps.iter().filter(|&&ts| ts > window_start).count();
            (count, self.max_requests)
        } else {
            (0, self.max_requests)
        }
    }
}

impl Default for RateLimiter {
    fn default() -> Self {
        Self::new(60, 60) // 60 requests per minute by default
    }
}

/// Sliding window rate limiter state
struct SlidingWindow {
    timestamps: Vec<Instant>,
    window_start: Instant,
}

/// Rate limiter metrics
#[derive(Clone, Debug)]
pub struct RateLimiterMetrics {
    pub total_requests: u64,
    pub blocked_requests: u64,
    pub current_connections: usize,
}

/// Rate limiter with metrics tracking
#[derive(Clone)]
pub struct MetricRateLimiter {
    inner: RateLimiter,
    metrics: Arc<RwLock<RateLimiterMetrics>>,
}

impl MetricRateLimiter {
    pub fn new(max_requests: usize, window_duration_secs: u64) -> Self {
        Self {
            inner: RateLimiter::new(max_requests, window_duration_secs),
            metrics: Arc::new(RwLock::new(RateLimiterMetrics {
                total_requests: 0,
                blocked_requests: 0,
                current_connections: 0,
            })),
        }
    }

    /// Check rate limit and track metrics
    pub async fn check_rate_limit(&self, key: &str) -> Result<()> {
        let mut metrics = self.metrics.write().await;
        metrics.total_requests += 1;

        match self.inner.check_rate_limit(key).await {
            Ok(()) => Ok(()),
            Err(e) => {
                metrics.blocked_requests += 1;
                Err(e)
            }
        }
    }

    /// Remove a key from the rate limiter
    pub async fn remove(&self, key: &str) {
        self.inner.remove(key).await;
    }

    /// Get current metrics
    pub async fn get_metrics(&self) -> RateLimiterMetrics {
        let metrics = self.metrics.read().await;
        metrics.clone()
    }

    /// Increment connection count
    pub async fn increment_connections(&self) {
        let mut metrics = self.metrics.write().await;
        metrics.current_connections += 1;
    }

    /// Decrement connection count
    pub async fn decrement_connections(&self) {
        let mut metrics = self.metrics.write().await;
        metrics.current_connections = metrics.current_connections.saturating_sub(1);
    }

    /// Get current usage for a key
    pub async fn get_usage(&self, key: &str) -> (usize, usize) {
        self.inner.get_usage(key).await
    }
}

impl Default for MetricRateLimiter {
    fn default() -> Self {
        Self::new(60, 60)
    }
}

/// Per-connection rate limiter for high-frequency messages
#[derive(Clone)]
pub struct PerConnectionRateLimiter {
    limiters: Arc<RwLock<HashMap<String, RateLimiter>>>,
    max_requests: usize,
    window_duration_secs: u64,
}

impl PerConnectionRateLimiter {
    pub fn new(max_requests: usize, window_duration_secs: u64) -> Self {
        Self {
            limiters: Arc::new(RwLock::new(HashMap::new())),
            max_requests,
            window_duration_secs,
        }
    }

    /// Check rate limit for a specific connection
    pub async fn check_rate_limit(&self, connection_id: &str) -> Result<()> {
        let mut limiters = self.limiters.write().await;
        let limiter = limiters
            .entry(connection_id.to_string())
            .or_insert_with(|| RateLimiter::new(self.max_requests, self.window_duration_secs));

        limiter.check_rate_limit(connection_id).await
    }

    /// Remove a connection's rate limiter
    pub async fn remove(&self, connection_id: &str) {
        let mut limiters = self.limiters.write().await;
        limiters.remove(connection_id);
    }
}

impl Default for PerConnectionRateLimiter {
    fn default() -> Self {
        // 100 messages per second per connection (for position updates, etc.)
        Self::new(100, 1)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::{sleep, Duration};

    #[tokio::test]
    async fn test_rate_limiter() {
        let limiter = RateLimiter::new(3, 1); // 3 requests per 1 second

        // First 3 requests should succeed
        assert!(limiter.check_rate_limit("test-key").await.is_ok());
        assert!(limiter.check_rate_limit("test-key").await.is_ok());
        assert!(limiter.check_rate_limit("test-key").await.is_ok());

        // 4th request should fail
        assert!(limiter.check_rate_limit("test-key").await.is_err());

        // Wait for window to expire
        sleep(Duration::from_millis(1100)).await;

        // Should work again
        assert!(limiter.check_rate_limit("test-key").await.is_ok());
    }
}
