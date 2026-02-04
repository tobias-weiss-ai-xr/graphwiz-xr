//! Type definitions for Agent Looper.

use serde::{Deserialize, Serialize};

/// Optimization goal
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Goal {
    pub name: String,
    pub description: String,
    pub category: GoalCategory,
    pub target_value: f64,
    pub current_value: f64,
    pub unit: String,
    pub metadata: std::collections::HashMap<String, String>,
}

/// Goal categories
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GoalCategory {
    Performance,
    Feature,
    BugFix,
    UserExperience,
    Accessibility,
    Seo,
    CodeQuality,
    Security,
}

/// Goal status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoalStatus {
    pub name: String,
    pub progress: f64,
    pub completed: bool,
    pub category: String,
}

/// Looper status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LooperStatus {
    pub loop_id: String,
    pub running: bool,
    pub iteration: u32,
    pub current_phase: String,
    pub goals: Vec<GoalStatus>,
    pub started_at: i64,
    pub last_activity: i64,
}

/// Metric data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Metric {
    pub name: String,
    pub value: f64,
    pub unit: String,
    pub timestamp: i64,
    pub labels: std::collections::HashMap<String, String>,
}

/// Issue identified during analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Issue {
    pub title: String,
    pub description: String,
    pub severity: Severity,
    pub category: String,
    pub metadata: std::collections::HashMap<String, String>,
}

/// Issue severity levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Severity {
    Low,
    Medium,
    High,
    Critical,
}

/// Looper configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LooperConfig {
    pub max_iterations: u32,
    pub iteration_interval: u32,
    pub auto_apply: bool,
    pub model: String,
    pub temperature: f64,
    pub max_tokens: u32,
}

impl Default for LooperConfig {
    fn default() -> Self {
        Self {
            max_iterations: 100,
            iteration_interval: 3600,
            auto_apply: false,
            model: "meta-llama-3.1-8b-instruct".to_string(),
            temperature: 0.7,
            max_tokens: 8192,
        }
    }
}

/// Analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub success: bool,
    pub analysis: String,
    pub recommendations: Vec<String>,
    pub issues: Vec<Issue>,
}

/// Health check response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub service: String,
    pub components: std::collections::HashMap<String, bool>,
}

/// Goals response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoalsResponse {
    pub goals: Vec<GoalData>,
    pub overall_progress: f64,
}

/// Individual goal data from API
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoalData {
    pub name: String,
    pub description: String,
    pub category: String,
    pub target_value: f64,
    pub current_value: f64,
    pub unit: String,
    pub progress_percentage: f64,
    pub is_completed: bool,
}

/// Metrics response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsResponse {
    pub metrics: MetricsData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsData {
    pub timestamp: String,
    pub metrics: std::collections::HashMap<String, MetricValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricValue {
    pub value: f64,
    pub unit: String,
    pub timestamp: String,
}

/// Analysis response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResponse {
    pub success: bool,
    pub analysis: String,
}

/// Plan response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanResponse {
    pub success: bool,
    pub plan: String,
}

/// Chat response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatResponse {
    pub success: bool,
    pub response: String,
}

/// Error type for Agent Looper operations
#[derive(Debug, thiserror::Error)]
pub enum AgentError {
    #[error("HTTP error: {0}")]
    HttpError(#[from] reqwest::Error),

    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("API error: {0}")]
    ApiError(String),

    #[error("operation failed: {0}")]
    OperationFailed(String),

    #[error("service unhealthy")]
    ServiceUnhealthy,
}
