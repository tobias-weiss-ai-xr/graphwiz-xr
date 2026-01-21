//! Historical metrics storage

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::sync::RwLock;
use lazy_static::lazy_static;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricDataPoint {
    pub timestamp: DateTime<Utc>,
    pub active_rooms: i32,
    pub active_users: i32,
    pub total_entities: i32,
    pub avg_latency_ms: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsSnapshot {
    pub id: i32,
    pub captured_at: DateTime<Utc>,
    pub rooms_total: i32,
    pub rooms_active: i32,
    pub users_total: i32,
    pub users_active: i32,
    pub entities_total: i32,
    pub memory_usage_mb: f64,
    pub cpu_usage_percent: f64,
}

// In-memory metrics storage for admin dashboard
pub struct MetricsStorage {
    data_points: Vec<MetricDataPoint>,
    max_points: usize,
}

impl MetricsStorage {
    pub fn new(max_points: usize) -> Self {
        Self {
            data_points: Vec::new(),
            max_points,
        }
    }

    /// Add a new metric data point
    pub fn add_data_point(&mut self, point: MetricDataPoint) {
        self.data_points.push(point);

        // Remove oldest point if exceeding max
        if self.data_points.len() > self.max_points {
            self.data_points.remove(0);
        }
    }

    /// Get metrics within a time range
    pub fn get_metrics_in_range(
        &self,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    ) -> Vec<MetricDataPoint> {
        self.data_points
            .iter()
            .filter(|p| p.timestamp >= start && p.timestamp <= end)
            .cloned()
            .collect()
    }

    /// Get last N data points
    pub fn get_last_n(&self, n: usize) -> Vec<MetricDataPoint> {
        let start_idx = if self.data_points.len() > n {
            self.data_points.len() - n
        } else {
            0
        };
        self.data_points[start_idx..].to_vec()
    }

    /// Get metrics summary
    pub fn get_summary(&self) -> MetricsSummary {
        if self.data_points.is_empty() {
            return MetricsSummary::default();
        }

        let active_rooms = self.data_points
            .iter()
            .map(|p| p.active_rooms)
            .collect::<Vec<_>>();

        let active_users = self.data_points
            .iter()
            .map(|p| p.active_users)
            .collect::<Vec<_>>();

        let latencies = self.data_points
            .iter()
            .map(|p| p.avg_latency_ms)
            .collect::<Vec<_>>();

        let max_active_rooms = active_rooms.iter().cloned().max().unwrap_or(0);
        let max_active_users = active_users.iter().cloned().max().unwrap_or(0);
        let max_latency_ms = latencies.iter().cloned().max_by(|a, b| a.partial_cmp(b).unwrap()).unwrap_or(0.0);

        MetricsSummary {
            avg_active_rooms: if !active_rooms.is_empty() {
                active_rooms.iter().sum::<i32>() as f64 / active_rooms.len() as f64
            } else { 0.0 },
            max_active_rooms,
            avg_active_users: if !active_users.is_empty() {
                active_users.iter().sum::<i32>() as f64 / active_users.len() as f64
            } else { 0.0 },
            max_active_users,
            avg_latency_ms: if !latencies.is_empty() {
                latencies.iter().sum::<f64>() / latencies.len() as f64
            } else { 0.0 },
            max_latency_ms,
            total_points: self.data_points.len(),
        }
    }

    /// Clear all metrics
    pub fn clear(&mut self) {
        self.data_points.clear();
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsSummary {
    pub avg_active_rooms: f64,
    pub max_active_rooms: i32,
    pub avg_active_users: f64,
    pub max_active_users: i32,
    pub avg_latency_ms: f64,
    pub max_latency_ms: f64,
    pub total_points: usize,
}

impl Default for MetricsSummary {
    fn default() -> Self {
        Self {
            avg_active_rooms: 0.0,
            max_active_rooms: 0,
            avg_active_users: 0.0,
            max_active_users: 0,
            avg_latency_ms: 0.0,
            max_latency_ms: 0.0,
            total_points: 0,
        }
    }
}

/// Global metrics storage instance (in-memory)
lazy_static! {
    static ref GLOBAL_METRICS: tokio::sync::RwLock<MetricsStorage> = {
        tokio::sync::RwLock::new(MetricsStorage::new(1440)) // Store 24 hours of data (1 point per minute)
    };
}

/// Get metrics for admin dashboard
pub fn get_metrics() -> MetricsSummary {
    let metrics = &*GLOBAL_METRICS.read();
    metrics.get_summary()
}

/// Add metrics data point (called by services)
pub fn add_metrics_point(point: MetricDataPoint) {
    let mut metrics = &mut *GLOBAL_METRICS.write();
    metrics.add_data_point(point);
}

/// Clear all metrics
pub fn clear_metrics() {
    let mut metrics = &mut *GLOBAL_METRICS.write();
    metrics.clear();
}
