//! Metrics and monitoring for WebSocket connections

use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// WebSocket connection metrics
#[derive(Clone, Debug)]
pub struct ConnectionMetrics {
    pub total_connections: u64,
    pub active_connections: u64,
    pub total_disconnections: u64,
    pub total_messages_sent: u64,
    pub total_messages_received: u64,
    pub total_bytes_sent: u64,
    pub total_bytes_received: u64,
    pub connection_errors: u64,
    pub message_errors: u64,
}

impl Default for ConnectionMetrics {
    fn default() -> Self {
        Self {
            total_connections: 0,
            active_connections: 0,
            total_disconnections: 0,
            total_messages_sent: 0,
            total_messages_received: 0,
            total_bytes_sent: 0,
            total_bytes_received: 0,
            connection_errors: 0,
            message_errors: 0,
        }
    }
}

/// Metrics collector for WebSocket operations
#[derive(Clone)]
pub struct MetricsCollector {
    metrics: Arc<RwLock<ConnectionMetrics>>,
    start_time: Instant,
}

impl MetricsCollector {
    /// Create a new metrics collector
    pub fn new() -> Self {
        Self {
            metrics: Arc::new(RwLock::new(ConnectionMetrics::default())),
            start_time: Instant::now(),
        }
    }

    /// Record a new connection
    pub async fn record_connection(&self) {
        let mut metrics = self.metrics.write().await;
        metrics.total_connections += 1;
        metrics.active_connections += 1;
    }

    /// Record a disconnection
    pub async fn record_disconnection(&self) {
        let mut metrics = self.metrics.write().await;
        metrics.active_connections = metrics.active_connections.saturating_sub(1);
        metrics.total_disconnections += 1;
    }

    /// Record a sent message
    pub async fn record_message_sent(&self, bytes: usize) {
        let mut metrics = self.metrics.write().await;
        metrics.total_messages_sent += 1;
        metrics.total_bytes_sent += bytes as u64;
    }

    /// Record a received message
    pub async fn record_message_received(&self, bytes: usize) {
        let mut metrics = self.metrics.write().await;
        metrics.total_messages_received += 1;
        metrics.total_bytes_received += bytes as u64;
    }

    /// Record a connection error
    pub async fn record_connection_error(&self) {
        let mut metrics = self.metrics.write().await;
        metrics.connection_errors += 1;
    }

    /// Record a message error
    pub async fn record_message_error(&self) {
        let mut metrics = self.metrics.write().await;
        metrics.message_errors += 1;
    }

    /// Get current metrics
    pub async fn get_metrics(&self) -> ConnectionMetrics {
        let metrics = self.metrics.read().await;
        metrics.clone()
    }

    /// Get uptime in seconds
    pub fn get_uptime_secs(&self) -> u64 {
        self.start_time.elapsed().as_secs()
    }

    /// Get metrics summary as a string
    pub async fn get_summary(&self) -> String {
        let metrics = self.metrics.read().await;
        format!(
            "Connections: {} active, {} total, {} errors | \
             Messages: {} sent ({} bytes), {} received ({} bytes), {} errors | \
             Uptime: {}s",
            metrics.active_connections,
            metrics.total_connections,
            metrics.connection_errors,
            metrics.total_messages_sent,
            metrics.total_bytes_sent,
            metrics.total_messages_received,
            metrics.total_bytes_received,
            metrics.message_errors,
            self.get_uptime_secs()
        )
    }

    /// Reset metrics (except active connections)
    pub async fn reset(&self) {
        let mut metrics = self.metrics.write().await;
        let active = metrics.active_connections;
        *metrics = ConnectionMetrics::default();
        metrics.active_connections = active;
    }
}

impl Default for MetricsCollector {
    fn default() -> Self {
        Self::new()
    }
}

/// Per-room metrics
#[derive(Clone, Debug)]
pub struct RoomMetrics {
    pub room_id: String,
    pub connection_count: u64,
    pub messages_sent: u64,
    pub messages_received: u64,
    pub last_activity: Instant,
}

/// Room-specific metrics tracker
#[derive(Clone)]
pub struct RoomMetricsCollector {
    rooms: Arc<RwLock<std::collections::HashMap<String, RoomMetrics>>>,
}

impl RoomMetricsCollector {
    /// Create a new room metrics collector
    pub fn new() -> Self {
        Self {
            rooms: Arc::new(RwLock::new(std::collections::HashMap::new())),
        }
    }

    /// Initialize metrics for a room
    pub async fn init_room(&self, room_id: String) {
        let mut rooms = self.rooms.write().await;
        rooms.entry(room_id.clone()).or_insert_with(|| RoomMetrics {
            room_id,
            connection_count: 0,
            messages_sent: 0,
            messages_received: 0,
            last_activity: Instant::now(),
        });
    }

    /// Record connection to room
    pub async fn record_connection(&self, room_id: &str) {
        let mut rooms = self.rooms.write().await;
        if let Some(room) = rooms.get_mut(room_id) {
            room.connection_count += 1;
            room.last_activity = Instant::now();
        }
    }

    /// Record disconnection from room
    pub async fn record_disconnection(&self, room_id: &str) {
        let mut rooms = self.rooms.write().await;
        if let Some(room) = rooms.get_mut(room_id) {
            room.connection_count = room.connection_count.saturating_sub(1);
            room.last_activity = Instant::now();
        }
    }

    /// Record message sent to room
    pub async fn record_message_sent(&self, room_id: &str) {
        let mut rooms = self.rooms.write().await;
        if let Some(room) = rooms.get_mut(room_id) {
            room.messages_sent += 1;
            room.last_activity = Instant::now();
        }
    }

    /// Record message received from room
    pub async fn record_message_received(&self, room_id: &str) {
        let mut rooms = self.rooms.write().await;
        if let Some(room) = rooms.get_mut(room_id) {
            room.messages_received += 1;
            room.last_activity = Instant::now();
        }
    }

    /// Get metrics for a specific room
    pub async fn get_room_metrics(&self, room_id: &str) -> Option<RoomMetrics> {
        let rooms = self.rooms.read().await;
        rooms.get(room_id).cloned()
    }

    /// Get all room metrics
    pub async fn get_all_metrics(&self) -> Vec<RoomMetrics> {
        let rooms = self.rooms.read().await;
        rooms.values().cloned().collect()
    }

    /// Remove a room (cleanup)
    pub async fn remove_room(&self, room_id: &str) {
        let mut rooms = self.rooms.write().await;
        rooms.remove(room_id);
    }

    /// Clean up inactive rooms
    pub async fn cleanup_inactive(&self, timeout: Duration) {
        let mut rooms = self.rooms.write().await;
        let now = Instant::now();
        rooms.retain(|_, room| now.duration_since(room.last_activity) < timeout);
    }
}

impl Default for RoomMetricsCollector {
    fn default() -> Self {
        Self::new()
    }
}

/// Latency tracker for message processing
#[derive(Clone)]
pub struct LatencyTracker {
    latencies: Arc<RwLock<Vec<Duration>>>,
    max_samples: usize,
}

impl LatencyTracker {
    /// Create a new latency tracker
    ///
    /// # Arguments
    /// * `max_samples` - Maximum number of latency samples to keep
    pub fn new(max_samples: usize) -> Self {
        Self {
            latencies: Arc::new(RwLock::new(Vec::with_capacity(max_samples))),
            max_samples,
        }
    }

    /// Record a latency measurement
    pub async fn record(&self, latency: Duration) {
        let mut latencies = self.latencies.write().await;
        if latencies.len() >= self.max_samples {
            latencies.remove(0);
        }
        latencies.push(latency);
    }

    /// Get average latency
    pub async fn get_average(&self) -> Duration {
        let latencies = self.latencies.read().await;
        if latencies.is_empty() {
            return Duration::ZERO;
        }
        let sum: Duration = latencies.iter().sum();
        sum / latencies.len() as u32
    }

    /// Get percentile latency
    pub async fn get_percentile(&self, percentile: f64) -> Duration {
        let mut latencies = self.latencies.read().await.clone();
        if latencies.is_empty() {
            return Duration::ZERO;
        }
        latencies.sort();
        let index = ((latencies.len() as f64 * percentile) / 100.0) as usize;
        latencies[index.min(latencies.len() - 1)]
    }

    /// Get current sample count
    pub async fn sample_count(&self) -> usize {
        let latencies = self.latencies.read().await;
        latencies.len()
    }

    /// Clear all samples
    pub async fn clear(&self) {
        let mut latencies = self.latencies.write().await;
        latencies.clear();
    }
}

impl Default for LatencyTracker {
    fn default() -> Self {
        Self::new(1000) // Keep last 1000 samples
    }
}

/// Performance metrics for monitoring
#[derive(Clone)]
pub struct PerformanceMonitor {
    metrics: MetricsCollector,
    room_metrics: RoomMetricsCollector,
    latency: LatencyTracker,
}

impl PerformanceMonitor {
    /// Create a new performance monitor
    pub fn new() -> Self {
        Self {
            metrics: MetricsCollector::new(),
            room_metrics: RoomMetricsCollector::new(),
            latency: LatencyTracker::new(1000),
        }
    }

    /// Get the global metrics collector
    pub fn metrics(&self) -> &MetricsCollector {
        &self.metrics
    }

    /// Get the room metrics collector
    pub fn room_metrics(&self) -> &RoomMetricsCollector {
        &self.room_metrics
    }

    /// Get the latency tracker
    pub fn latency(&self) -> &LatencyTracker {
        &self.latency
    }

    /// Get a comprehensive performance report
    pub async fn get_report(&self) -> String {
        let global = self.metrics.get_metrics().await;
        let avg_latency = self.latency.get_average().await;
        let p99_latency = self.latency.get_percentile(99.0).await;
        let room_count = self.room_metrics.get_all_metrics().await.len();

        format!(
            "=== Performance Report ===\n\
             Uptime: {}s\n\
             Connections: {} active / {} total ({} errors)\n\
             Messages: {} sent / {} received ({} errors)\n\
             Bytes: {} sent / {} received\n\
             Active Rooms: {}\n\
             Latency: avg={}ms, p99={}ms\n\
             =========================",
            self.metrics.get_uptime_secs(),
            global.active_connections,
            global.total_connections,
            global.connection_errors,
            global.total_messages_sent,
            global.total_messages_received,
            global.message_errors,
            global.total_bytes_sent,
            global.total_bytes_received,
            room_count,
            avg_latency.as_millis(),
            p99_latency.as_millis()
        )
    }
}

impl Default for PerformanceMonitor {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::{sleep, Duration};

    #[tokio::test]
    async fn test_metrics_collector() {
        let collector = MetricsCollector::new();

        // Record some events
        collector.record_connection().await;
        collector.record_message_sent(100).await;
        collector.record_message_received(50).await;

        let metrics = collector.get_metrics().await;
        assert_eq!(metrics.total_connections, 1);
        assert_eq!(metrics.active_connections, 1);
        assert_eq!(metrics.total_messages_sent, 1);
        assert_eq!(metrics.total_messages_received, 1);
        assert_eq!(metrics.total_bytes_sent, 100);
        assert_eq!(metrics.total_bytes_received, 50);
    }

    #[tokio::test]
    async fn test_room_metrics() {
        let collector = RoomMetricsCollector::new();
        let room_id = "test-room";

        collector.init_room(room_id.to_string()).await;
        collector.record_connection(room_id).await;
        collector.record_message_sent(room_id).await;

        let metrics = collector.get_room_metrics(room_id).await.unwrap();
        assert_eq!(metrics.connection_count, 1);
        assert_eq!(metrics.messages_sent, 1);
    }

    #[tokio::test]
    async fn test_latency_tracker() {
        let tracker = LatencyTracker::new(10);

        tracker.record(Duration::from_millis(10)).await;
        tracker.record(Duration::from_millis(20)).await;
        tracker.record(Duration::from_millis(30)).await;

        let avg = tracker.get_average().await;
        assert_eq!(avg.as_millis(), 20);

        let p50 = tracker.get_percentile(50.0).await;
        assert_eq!(p50.as_millis(), 20);
    }

    #[tokio::test]
    async fn test_performance_monitor() {
        let monitor = PerformanceMonitor::new();

        monitor.metrics().record_connection().await;
        monitor.room_metrics().init_room("room1".to_string()).await;
        monitor.latency().record(Duration::from_millis(15)).await;

        let report = monitor.get_report().await;
        assert!(report.contains("Connections: 1 active"));
        assert!(report.contains("avg=15ms"));
    }
}
