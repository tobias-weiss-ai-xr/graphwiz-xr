//! Optimization integration with Agent Looper for Auth service
//!
//! This module provides optional integration with the Agent Looper service
//! for continuous optimization of authentication, security, and session management.

use tracing::{debug, error, info, warn};

#[cfg(feature = "optimization")]
use agent_looper_client::{AgentLooperClient, GoalData};

/// Optimization manager for Auth service
pub struct OptimizationManager {
    #[cfg(feature = "optimization")]
    client: Option<AgentLooperClient>,
    enabled: bool,
}

impl OptimizationManager {
    /// Create a new optimization manager.
    pub fn new() -> Self {
        Self {
            #[cfg(feature = "optimization")]
            client: None,
            enabled: false,
        }
    }

    /// Initialize the optimization manager with Agent Looper client.
    #[cfg(feature = "optimization")]
    pub fn init(&mut self, agent_looper_url: String) -> Result<(), Box<dyn std::error::Error>> {
        info!(
            "Initializing Auth optimization with Agent Looper at {}",
            agent_looper_url
        );

        let client = AgentLooperClient::new(agent_looper_url);

        // Test connection
        let rt = tokio::runtime::Runtime::new()?;
        rt.block_on(async {
            match client.health_check().await {
                Ok(health) => {
                    info!("Connected to Agent Looper: {}", health.service);
                    self.client = Some(client);
                    self.enabled = true;
                    Ok(())
                }
                Err(e) => {
                    error!("Failed to connect to Agent Looper: {}", e);
                    Err(Box::new(e) as Box<dyn std::error::Error>)
                }
            }
        })
    }

    /// No-op for non-optimization builds.
    #[cfg(not(feature = "optimization"))]
    pub fn init(&mut self, _agent_looper_url: String) -> Result<(), Box<dyn std::error::Error>> {
        warn!("Optimization feature not enabled. Enable with 'optimization' feature.");
        Ok(())
    }

    /// Check if optimization is enabled.
    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    /// Track successful authentication.
    pub fn track_auth_success(&self, user_id: &str, auth_method: &str) {
        if !self.enabled {
            return;
        }

        debug!("Tracking successful authentication: {} via {}", user_id, auth_method);

        #[cfg(feature = "optimization")]
        if let Some(client) = &self.client {
            let user_id = user_id.to_string();
            let auth_method = auth_method.to_string();
            let client = client.clone();

            tokio::spawn(async move {
                let message = format!(
                    "User {} authenticated successfully via {}. Any optimization recommendations?",
                    user_id, auth_method
                );

                match client.chat(&message).await {
                    Ok(response) => {
                        debug!("Auth optimization insight: {}", response.response);
                    }
                    Err(e) => {
                        warn!("Failed to get auth optimization insights: {}", e);
                    }
                }
            });
        }
    }

    /// Track failed authentication attempt.
    pub fn track_auth_failure(&self, reason: &str, user_identifier: Option<&str>) {
        if !self.enabled {
            return;
        }

        debug!("Tracking failed authentication: {}", reason);

        #[cfg(feature = "optimization")]
        if let Some(client) = &self.client {
            let reason = reason.to_string();
            let user_identifier = user_identifier.map(|u| u.to_string());
            let client = client.clone();

            tokio::spawn(async move {
                let user_info = user_identifier.as_deref().unwrap_or("unknown");
                let message = format!(
                    "Authentication failed for {}: {}. Should we implement rate limiting or additional security?",
                    user_info, reason
                );

                match client.chat(&message).await {
                    Ok(response) => {
                        debug!("Security optimization insight: {}", response.response);
                    }
                    Err(e) => {
                        warn!("Failed to get security optimization: {}", e);
                    }
                }
            });
        }
    }

    /// Track multiple failed auth attempts (potential attack).
    pub fn track_suspicious_activity(&self, identifier: &str, attempt_count: u32, window_secs: u64) {
        if !self.enabled {
            return;
        }

        warn!(
            "Suspicious activity detected: {} - {} attempts in {}s",
            identifier, attempt_count, window_secs
        );

        #[cfg(feature = "optimization")]
        if let Some(client) = &self.client {
            let identifier = identifier.to_string();
            let client = client.clone();

            tokio::spawn(async move {
                let message = format!(
                    "Suspicious activity detected for {}: {} failed attempts in {}s. This might indicate a brute force attack. How should we respond?",
                    identifier, attempt_count, window_secs
                );

                match client.chat(&message).await {
                    Ok(_) => debug!("Requested security hardening recommendations"),
                    Err(e) => warn!("Failed to request security recommendations: {}", e),
                }
            });
        }
    }

    /// Track authentication performance (slow logins).
    pub fn track_auth_performance(&self, operation: &str, duration_ms: u64) {
        if !self.enabled {
            return;
        }

        debug!("Tracking auth performance: {} took {}ms", operation, duration_ms);

        // Alert if auth operation is slow (> 1000ms)
        if duration_ms > 1000 {
            warn!(
                "Slow authentication detected: {} took {}ms",
                operation, duration_ms
            );

            #[cfg(feature = "optimization")]
            if let Some(client) = &self.client {
                let operation = operation.to_string();
                let client = client.clone();

                tokio::spawn(async move {
                    let message = format!(
                        "Authentication operation {} is slow ({}ms). How can we optimize authentication performance?",
                        operation, duration_ms
                    );

                    match client.chat(&message).await {
                        Ok(_) => debug!("Requested performance optimization"),
                        Err(e) => warn!("Failed to request performance optimization: {}", e),
                    }
                });
            }
        }
    }

    /// Track token validation performance.
    pub fn track_token_validation(&self, token_type: &str, duration_ms: u64, invalid_count: u32) {
        if !self.enabled {
            return;
        }

        debug!(
            "Tracking token validation: {} tokens, {}ms, {} invalid",
            token_type, duration_ms, invalid_count
        );

        // Alert if many invalid tokens (potential attack)
        if invalid_count > 10 {
            warn!(
                "High invalid token count: {} invalid {} tokens",
                invalid_count, token_type
            );

            #[cfg(feature = "optimization")]
            if let Some(client) = &self.client {
                let token_type = token_type.to_string();
                let client = client.clone();

                tokio::spawn(async move {
                    let message = format!(
                        "High number of invalid {} tokens detected ({}). Should we implement token blacklisting or rate limiting?",
                        token_type, invalid_count
                    );

                    match client.chat(&message).await {
                        Ok(_) => debug!("Requested security recommendations"),
                        Err(e) => warn!("Failed to request security recommendations: {}", e),
                    }
                });
            }
        }
    }

    /// Track OAuth flow performance.
    pub fn track_oauth_flow(&self, provider: &str, flow_step: &str, duration_ms: u64) {
        if !self.enabled {
            return;
        }

        debug!("Tracking OAuth flow: {} - {} ({}ms)", provider, flow_step, duration_ms);

        // Alert if OAuth flow is slow (> 3000ms)
        if duration_ms > 3000 {
            warn!(
                "Slow OAuth flow: {} - {} took {}ms",
                provider, flow_step, duration_ms
            );

            #[cfg(feature = "optimization")]
            if let Some(client) = &self.client {
                let provider = provider.to_string();
                let flow_step = flow_step.to_string();
                let client = client.clone();

                tokio::spawn(async move {
                    let message = format!(
                        "OAuth flow with provider {} is slow during {}: {}ms. How can we optimize OAuth performance?",
                        provider, flow_step, duration_ms
                    );

                    match client.chat(&message).await {
                        Ok(_) => debug!("Requested OAuth optimization"),
                        Err(e) => warn!("Failed to request OAuth optimization: {}", e),
                    }
                });
            }
        }
    }

    /// Track session management.
    pub fn track_session_activity(&self, active_sessions: usize, max_capacity: usize) {
        if !self.enabled {
            return;
        }

        let utilization = if max_capacity > 0 {
            (active_sessions as f64 / max_capacity as f64) * 100.0
        } else {
            0.0
        };

        debug!(
            "Tracking session activity: {}/{} sessions ({:.1}% utilization)",
            active_sessions, max_capacity, utilization
        );

        // Alert if session utilization is high (> 80%)
        if utilization > 80.0 {
            warn!(
                "High session utilization: {:.1}% ({}/{} sessions)",
                utilization, active_sessions, max_capacity
            );

            #[cfg(feature = "optimization")]
            if let Some(client) = &self.client {
                let client = client.clone();

                tokio::spawn(async move {
                    let message = format!(
                        "Session utilization is high ({:.1}% capacity). Should we implement session cleanup or increase capacity?",
                        utilization
                    );

                    match client.chat(&message).await {
                        Ok(_) => debug!("Requested session optimization"),
                        Err(e) => warn!("Failed to request session optimization: {}", e),
                    }
                });
            }
        }
    }

    /// Request optimization analysis for Auth service.
    #[cfg(feature = "optimization")]
    pub async fn request_auth_optimization(
        &self,
    ) -> Result<String, Box<dyn std::error::Error>> {
        if !self.enabled {
            return Err("Optimization not enabled".into());
        }

        if let Some(client) = &self.client {
            info!("Requesting Auth optimization analysis");

            let analysis = client
                .optimize_service(
                    "Auth",
                    "Handles user registration, login, JWT token generation/validation, OAuth flows, magic link authentication, and session management with Redis",
                )
                .await?;

            Ok(analysis.analysis)
        } else {
            Err("Agent Looper client not initialized".into())
        }
    }

    /// No-op for non-optimization builds.
    #[cfg(not(feature = "optimization"))]
    pub async fn request_auth_optimization(
        &self,
    ) -> Result<String, Box<dyn std::error::Error>> {
        Err("Optimization feature not enabled".into())
    }

    /// Get current optimization goals related to auth.
    #[cfg(feature = "optimization")]
    pub async fn get_auth_goals(&self) -> Result<Vec<GoalData>, Box<dyn std::error::Error>> {
        if !self.enabled {
            return Err("Optimization not enabled".into());
        }

        if let Some(client) = &self.client {
            let goals = client.get_goals().await?;
            Ok(goals.goals)
        } else {
            Err("Agent Looper client not initialized".into())
        }
    }

    /// No-op for non-optimization builds.
    #[cfg(not(feature = "optimization"))]
    pub async fn get_auth_goals(&self) -> Result<Vec<GoalData>, Box<dyn std::error::Error>> {
        Err("Optimization feature not enabled".into())
    }
}

impl Default for OptimizationManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_optimization_manager_creation() {
        let manager = OptimizationManager::new();
        assert!(!manager.is_enabled());
    }
}
