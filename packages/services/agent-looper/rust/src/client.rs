//! Agent Looper HTTP client implementation.

use crate::types::*;
use crate::AgentError;
use reqwest::Client;
use serde_json::json;
use tracing::{debug, info, warn};

/// Agent Looper HTTP client
#[derive(Clone)]
pub struct AgentLooperClient {
    client: Client,
    base_url: String,
}

impl AgentLooperClient {
    /// Create a new Agent Looper HTTP client.
    ///
    /// # Arguments
    ///
    /// * `base_url` - The base URL of the HTTP server (e.g., "http://localhost:50051")
    pub fn new(base_url: String) -> Self {
        info!("Creating Agent Looper client for {}", base_url);

        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .unwrap_or_else(|_| Client::new());

        Self { client, base_url }
    }

    /// Check if the service is healthy.
    pub async fn health_check(&self) -> Result<HealthResponse, AgentError> {
        debug!("Performing health check");

        let url = format!("{}/health", self.base_url);
        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            return Err(AgentError::ServiceUnhealthy);
        }

        let health = response.json::<HealthResponse>().await?;

        if health.status != "healthy" {
            warn!("Service status: {}", health.status);
            return Err(AgentError::ServiceUnhealthy);
        }

        Ok(health)
    }

    /// Get all optimization goals.
    pub async fn get_goals(&self) -> Result<GoalsResponse, AgentError> {
        debug!("Getting optimization goals");

        let url = format!("{}/api/v1/goals", self.base_url);
        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            return Err(AgentError::ApiError(format!(
                "Failed to get goals: status {}",
                response.status()
            )));
        }

        let goals = response.json::<GoalsResponse>().await?;
        Ok(goals)
    }

    /// Add a new optimization goal.
    pub async fn add_goal(&self, goal: GoalData) -> Result<GoalData, AgentError> {
        debug!("Adding new goal: {}", goal.name);

        let url = format!("{}/api/v1/goals", self.base_url);

        let response = self
            .client
            .post(&url)
            .json(&goal)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(AgentError::ApiError(format!(
                "Failed to add goal: status {}",
                response.status()
            )));
        }

        let result: serde_json::Value = response.json().await?;

        if result.get("success").and_then(|v| v.as_bool()) != Some(true) {
            return Err(AgentError::ApiError(
                result.get("error")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Unknown error")
                    .to_string(),
            ));
        }

        // Return the goal we created
        Ok(goal)
    }

    /// Get current metrics.
    pub async fn get_metrics(&self) -> Result<MetricsResponse, AgentError> {
        debug!("Getting current metrics");

        let url = format!("{}/api/v1/metrics", self.base_url);
        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            return Err(AgentError::ApiError(format!(
                "Failed to get metrics: status {}",
                response.status()
            )));
        }

        let metrics = response.json::<MetricsResponse>().await?;
        Ok(metrics)
    }

    /// Request AI-powered analysis.
    pub async fn analyze(&self) -> Result<AnalysisResponse, AgentError> {
        debug!("Requesting AI analysis");

        let url = format!("{}/api/v1/analyze", self.base_url);

        let response = self
            .client
            .post(&url)
            .json(&json!({}))
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(AgentError::ApiError(format!(
                "Failed to get analysis: status {}",
                response.status()
            )));
        }

        let analysis = response.json::<AnalysisResponse>().await?;

        if !analysis.success {
            return Err(AgentError::ApiError("Analysis failed".to_string()));
        }

        Ok(analysis)
    }

    /// Generate optimization plan.
    pub async fn create_plan(
        &self,
        issues: Vec<String>,
        constraints: Option<String>,
    ) -> Result<PlanResponse, AgentError> {
        debug!("Creating optimization plan");

        let url = format!("{}/api/v1/plan", self.base_url);

        let mut body = json!({
            "issues": issues
        });

        if let Some(constraints) = constraints {
            body["constraints"] = json!(constraints);
        }

        let response = self.client.post(&url).json(&body).send().await?;

        if !response.status().is_success() {
            return Err(AgentError::ApiError(format!(
                "Failed to create plan: status {}",
                response.status()
            )));
        }

        let plan = response.json::<PlanResponse>().await?;

        if !plan.success {
            return Err(AgentError::ApiError("Plan generation failed".to_string()));
        }

        Ok(plan)
    }

    /// Chat with the AI agent.
    pub async fn chat(&self, message: &str) -> Result<ChatResponse, AgentError> {
        debug!("Sending chat message");

        let url = format!("{}/api/v1/chat", self.base_url);

        let response = self
            .client
            .post(&url)
            .json(&json!({ "message": message }))
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(AgentError::ApiError(format!(
                "Chat request failed: status {}",
                response.status()
            )));
        }

        let chat_response = response.json::<ChatResponse>().await?;

        if !chat_response.success {
            return Err(AgentError::ApiError("Chat failed".to_string()));
        }

        Ok(chat_response)
    }

    /// Get a quick summary of current status.
    pub async fn get_status_summary(&self) -> Result<String, AgentError> {
        let health = self.health_check().await?;
        let goals = self.get_goals().await?;
        let metrics = self.get_metrics().await?;

        let summary = format!(
            "Agent Looper Status:\n\
             Service: {}\n\
             Health: {}\n\
             Overall Progress: {:.1}%\n\
             Active Goals: {}\n\
             Metrics Tracked: {}",
            health.service,
            health.status,
            goals.overall_progress,
            goals.goals.len(),
            metrics.metrics.metrics.len()
        );

        Ok(summary)
    }

    /// Request optimization recommendations for a specific service.
    pub async fn optimize_service(
        &self,
        service_name: &str,
        context: &str,
    ) -> Result<AnalysisResponse, AgentError> {
        debug!("Requesting optimization for service: {}", service_name);

        let message = format!(
            "I need optimization recommendations for the {} service. \
             Context: {}. What are the top 3 improvements we can make?",
            service_name, context
        );

        let chat_response = self.chat(&message).await?;

        Ok(AnalysisResponse {
            success: true,
            analysis: chat_response.response,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_client_creation() {
        let client = AgentLooperClient::new("http://localhost:50051".to_string());
        assert_eq!(client.base_url, "http://localhost:50051");
    }

    #[tokio::test]
    #[ignore] // Requires running service
    async fn test_health_check() {
        let client = AgentLooperClient::new("http://localhost:50051".to_string());
        let health = client.health_check().await.unwrap();
        assert_eq!(health.status, "healthy");
    }

    #[tokio::test]
    #[ignore] // Requires running service
    async fn test_get_goals() {
        let client = AgentLooperClient::new("http://localhost:50051".to_string());
        let goals = client.get_goals().await.unwrap();
        assert!(!goals.goals.is_empty());
    }
}
