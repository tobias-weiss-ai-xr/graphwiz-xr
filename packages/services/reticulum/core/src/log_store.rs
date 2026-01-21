//! In-memory log store for admin dashboard
//!
//! Collects and stores log entries from services
//! with filtering and querying capabilities

use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

/// Log level
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
}

impl LogLevel {
    pub fn from_tracing_level(level: &tracing::Level) -> Self {
        match *level {
            tracing::Level::TRACE | tracing::Level::DEBUG => LogLevel::Debug,
            tracing::Level::INFO => LogLevel::Info,
            tracing::Level::WARN => LogLevel::Warn,
            tracing::Level::ERROR => LogLevel::Error,
        }
    }
}

/// Log entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub level: LogLevel,
    pub service: String,
    pub message: String,
    pub context: Option<serde_json::Value>,
}

/// Logs query parameters
#[derive(Debug, Deserialize)]
pub struct LogsQuery {
    pub service: Option<String>,
    pub level: Option<LogLevel>,
    pub start_time: Option<DateTime<Utc>>,
    pub end_time: Option<DateTime<Utc>>,
    pub search: Option<String>,
    pub page: Option<usize>,
    pub per_page: Option<usize>,
}

/// Logs response with pagination
#[derive(Debug, Serialize)]
pub struct LogsResponse {
    pub entries: Vec<LogEntry>,
    pub total: usize,
    pub page: usize,
    pub per_page: usize,
}

/// In-memory log store
#[derive(Clone)]
pub struct LogStore {
    entries: Arc<RwLock<Vec<LogEntry>>>,
    max_entries: usize,
}

impl LogStore {
    /// Create a new log store with max entries limit
    pub fn new(max_entries: usize) -> Self {
        Self {
            entries: Arc::new(RwLock::new(Vec::with_capacity(max_entries))),
            max_entries,
        }
    }

    /// Add a log entry
    pub async fn add_entry(&self, entry: LogEntry) {
        let mut entries = self.entries.write().await;
        entries.push(entry);

        // Trim to max entries if needed
        let len = entries.len();
        if len > self.max_entries {
            entries.drain(0..len - self.max_entries);
        }
    }

    /// Query logs with filters
    pub async fn query(&self, query: &LogsQuery) -> LogsResponse {
        let entries = self.entries.read().await;

        let mut filtered: Vec<LogEntry> = entries.clone();

        // Filter by service
        if let Some(ref service) = query.service {
            filtered.retain(|e| e.service == *service);
        }

        // Filter by level
        if let Some(level) = query.level {
            filtered.retain(|e| e.level == level);
        }

        // Filter by time range
        if let Some(start_time) = query.start_time {
            filtered.retain(|e| e.timestamp >= start_time);
        }

        if let Some(end_time) = query.end_time {
            filtered.retain(|e| e.timestamp <= end_time);
        }

        // Filter by search query
        if let Some(ref search) = query.search {
            let search_lower = search.to_lowercase();
            filtered.retain(|e| {
                e.message.to_lowercase().contains(&search_lower)
                    || e.service.to_lowercase().contains(&search_lower)
            });
        }

        // Sort by timestamp (newest first)
        filtered.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        let total = filtered.len();
        let page = query.page.unwrap_or(1);
        let per_page = query.per_page.unwrap_or(50).min(1000);

        let start_idx = (page - 1) * per_page;
        let paginated_entries: Vec<LogEntry> = filtered
            .into_iter()
            .skip(start_idx)
            .take(per_page)
            .collect();

        LogsResponse {
            entries: paginated_entries,
            total,
            page,
            per_page,
        }
    }

    /// Get all entries (for export)
    pub async fn get_all(&self) -> Vec<LogEntry> {
        let entries = self.entries.read().await;
        entries.clone()
    }

    /// Clear all entries
    pub async fn clear(&self) {
        let mut entries = self.entries.write().await;
        entries.clear();
    }
}

/// Global log store instance (one per service)
static LOG_STORES: once_cell::sync::Lazy<
    std::collections::HashMap<String, Arc<LogStore>>
> = once_cell::sync::Lazy::new(|| {
    let mut map = std::collections::HashMap::new();
    map.insert(
        "auth".to_string(),
        Arc::new(LogStore::new(10000)),
    );
    map.insert(
        "hub".to_string(),
        Arc::new(LogStore::new(10000)),
    );
    map.insert(
        "presence".to_string(),
        Arc::new(LogStore::new(10000)),
    );
    map.insert(
        "sfu".to_string(),
        Arc::new(LogStore::new(10000)),
    );
    map.insert(
        "storage".to_string(),
        Arc::new(LogStore::new(10000)),
    );
    map
});

/// Get log store for a service
pub fn get_log_store(service: &str) -> Arc<LogStore> {
    LOG_STORES
        .get(service)
        .cloned()
        .unwrap_or_else(|| Arc::new(LogStore::new(10000)))
}

/// Add a log entry to the store
pub async fn add_log(service: &str, level: LogLevel, message: &str, context: Option<serde_json::Value>) {
    let entry = LogEntry {
        id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
        level,
        service: service.to_string(),
        message: message.to_string(),
        context,
    };

    let store = get_log_store(service);
    store.add_entry(entry).await;
}

/// Visitor for extracting log message from tracing events
struct LogVisitor<'a> {
    message: &'a mut String,
}

/// Custom tracing layer that captures logs
pub struct LogCaptureLayer {
    service: String,
}

impl LogCaptureLayer {
    pub fn new(service: &str) -> Self {
        Self {
            service: service.to_string(),
        }
    }
}

impl<S> tracing_subscriber::Layer<S> for LogCaptureLayer
where
    S: tracing::Subscriber,
{
    fn on_event(
        &self,
        event: &tracing::Event<'_>,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let mut message = String::new();
        event.record(&mut LogVisitor { message: &mut message });

        let level = LogLevel::from_tracing_level(&event.metadata().level());

        // Spawn async task to add log (non-blocking)
        let service = self.service.clone();
        tokio::spawn(async move {
            add_log(&service, level, &message, None).await;
        });
    }
}

/// Visitor for extracting log message from tracing events
struct LogVisitor<'a> {
    message: &'a mut String,
}

impl<'a> tracing::field::Visit for LogVisitor<'a> {
    fn record_debug(&mut self, _field: &tracing::field::Field, value: &dyn std::fmt::Debug) {
        if _field.name().is_empty() {
            *self.message = format!("{:?}", value);
        }
    }
}
