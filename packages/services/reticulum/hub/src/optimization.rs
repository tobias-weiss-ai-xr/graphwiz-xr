//! Optimization integration with Agent Looper
//!
//! This module provides optional integration with the Agent Looper service
//! for continuous optimization of the Hub service.

use tracing::{debug, error, info, warn};

#[cfg(feature = "optimization")]
use agent_looper_client::{AgentLooperClient, GoalData};

/// Optimization manager for Hub service
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
        info!("Initializing optimization with Agent Looper at {}", agent_looper_url);

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

    /// Track a room creation event for optimization.
    pub fn track_room_created(&self, room_id: &str) {
        if !self.enabled {
            return;
        }

        debug!("Tracking room creation: {}", room_id);

        #[cfg(feature = "optimization")]
        if let Some(client) = &self.client {
            let room_id = room_id.to_string();
            let client = client.clone();

            tokio::spawn(async move {
                match client.chat(&format!("Room {} was created successfully", room_id)).await {
                    Ok(_) => debug!("Room creation tracked"),
                    Err(e) => warn!("Failed to track room creation: {}", e),
                }
            });
        }
    }

    /// Track entity join for optimization insights.
    pub fn track_entity_join(&self, room_id: &str, entity_id: &str) {
        if !self.enabled {
            return;
        }

        debug!("Tracking entity {} join in room {}", entity_id, room_id);

        #[cfg(feature = "optimization")]
        if let Some(client) = &self.client {
            let room_id = room_id.to_string();
            let entity_id = entity_id.to_string();
            let client = client.clone();

            tokio::spawn(async move {
                let message = format!(
                    "Entity {} joined room {}. How can we optimize this?",
                    entity_id, room_id
                );

                match client.chat(&message).await {
                    Ok(response) => {
                        info!("Optimization insight: {}", response.response);
                    }
                    Err(e) => {
                        warn!("Failed to get optimization insights: {}", e);
                    }
                }
            });
        }
    }

    /// Request optimization analysis for the Hub service.
    #[cfg(feature = "optimization")]
    pub async fn request_optimization_analysis(&self) -> Result<String, Box<dyn std::error::Error>> {
        if !self.enabled {
            return Err("Optimization not enabled".into());
        }

        if let Some(client) = &self.client {
            info!("Requesting optimization analysis for Hub service");

            let analysis = client
                .optimize_service(
                    "Hub",
                    "Manages rooms, entities, and game state for GraphWiz-XR",
                )
                .await?;

            Ok(analysis.analysis)
        } else {
            Err("Agent Looper client not initialized".into())
        }
    }

    /// No-op for non-optimization builds.
    #[cfg(not(feature = "optimization"))]
    pub async fn request_optimization_analysis(&self) -> Result<String, Box<dyn std::error::Error>> {
        Err("Optimization feature not enabled".into())
    }

    /// Get current optimization goals.
    #[cfg(feature = "optimization")]
    pub async fn get_optimization_goals(
        &self,
    ) -> Result<Vec<GoalData>, Box<dyn std::error::Error>> {
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
    pub async fn get_optimization_goals(
        &self,
    ) -> Result<Vec<GoalData>, Box<dyn std::error::Error>> {
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
