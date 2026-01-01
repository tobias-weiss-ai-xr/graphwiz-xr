//! Optimization integration with Agent Looper for Presence service
//!
//! This module provides optional integration with the Agent Looper service
//! for continuous optimization of WebSocket connections, presence tracking,
//! and real-time messaging performance.

use tracing::{debug, error, info, warn};

#[cfg(feature = "optimization")]
use agent_looper_client::{AgentLooperClient, GoalData};

/// Optimization manager for Presence service
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
            "Initializing Presence optimization with Agent Looper at {}",
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

    /// Track WebSocket connection for optimization.
    pub fn track_websocket_connected(&self, connection_id: &str, user_id: Option<&str>) {
        if !self.enabled {
            return;
        }

        debug!("Tracking WebSocket connection: {}", connection_id);

        #[cfg(feature = "optimization")]
        if let Some(client) = &self.client {
            let connection_id = connection_id.to_string();
            let user_id = user_id.map(|u| u.to_string());
            let client = client.clone();

            tokio::spawn(async move {
                let user_info = user_id.as_deref().unwrap_or("anonymous");
                let message = format!(
                    "WebSocket connection {} established for user {}. Any optimization recommendations?",
                    connection_id, user_info
                );

                match client.chat(&message).await {
                    Ok(response) => {
                        debug!("WebSocket optimization insight: {}", response.response);
                    }
                    Err(e) => {
                        warn!("Failed to get WebSocket optimization insights: {}", e);
                    }
                }
            });
        }
    }

    /// Track WebSocket disconnection.
    pub fn track_websocket_disconnected(&self, connection_id: &str, duration_secs: u64) {
        if !self.enabled {
            return;
        }

        debug!(
            "Tracking WebSocket disconnection: {} (duration: {}s)",
            connection_id, duration_secs
        );

        // Alert if connection duration was very short (< 10 seconds)
        if duration_secs < 10 {
            warn!(
                "Short WebSocket connection detected: {} ({}s)",
                connection_id, duration_secs
            );

            #[cfg(feature = "optimization")]
            if let Some(client) = &self.client {
                let connection_id = connection_id.to_string();
                let client = client.clone();

                tokio::spawn(async move {
                    let message = format!(
                        "WebSocket connection {} had very short duration ({}s). This might indicate connection issues.",
                        connection_id, duration_secs
                    );

                    match client.chat(&message).await {
                        Ok(_) => debug!("Reported short connection for optimization"),
                        Err(e) => warn!("Failed to report short connection: {}", e),
                    }
                });
            }
        }
    }

    /// Track presence state change.
    pub fn track_presence_state_change(
        &self,
        entity_id: &str,
        old_state: &str,
        new_state: &str,
    ) {
        if !self.enabled {
            return;
        }

        debug!(
            "Tracking presence state change: {} from {} to {}",
            entity_id, old_state, new_state
        );

        #[cfg(feature = "optimization")]
        if let Some(client) = &self.client {
            let entity_id = entity_id.to_string();
            let old_state = old_state.to_string();
            let new_state = new_state.to_string();
            let client = client.clone();

            tokio::spawn(async move {
                let message = format!(
                    "Entity {} changed presence state from {} to {}. How can we optimize this?",
                    entity_id, old_state, new_state
                );

                match client.chat(&message).await {
                    Ok(response) => {
                        debug!("Presence optimization insight: {}", response.response);
                    }
                    Err(e) => {
                        warn!("Failed to get presence optimization insights: {}", e);
                    }
                }
            });
        }
    }

    /// Track room occupancy change.
    pub fn track_room_occupancy(&self, room_id: &str, occupancy: usize, max_capacity: usize) {
        if !self.enabled {
            return;
        }

        let occupancy_percent = if max_capacity > 0 {
            (occupancy as f64 / max_capacity as f64) * 100.0
        } else {
            0.0
        };

        debug!(
            "Tracking room occupancy: {} - {}/{} ({:.1}%)",
            room_id, occupancy, max_capacity, occupancy_percent
        );

        // Alert if room is getting full (> 90% capacity)
        if occupancy_percent > 90.0 {
            warn!(
                "High room occupancy detected: {} - {}/{} ({:.1}%)",
                room_id, occupancy, max_capacity, occupancy_percent
            );

            #[cfg(feature = "optimization")]
            if let Some(client) = &self.client {
                let room_id = room_id.to_string();
                let client = client.clone();

                tokio::spawn(async move {
                    let message = format!(
                        "Room {} is at {:.1}% capacity ({}/{}). Should we scale or create additional rooms?",
                        room_id, occupancy_percent, occupancy, max_capacity
                    );

                    match client.chat(&message).await {
                        Ok(_) => debug!("Requested room scaling recommendations"),
                        Err(e) => warn!("Failed to get room scaling insights: {}", e),
                    }
                });
            }
        }
    }

    /// Track message delivery performance.
    pub fn track_message_delivery(&self, room_id: &str, message_count: u64, failed_count: u64) {
        if !self.enabled {
            return;
        }

        let failure_rate = if message_count > 0 {
            (failed_count as f64 / message_count as f64) * 100.0
        } else {
            0.0
        };

        debug!(
            "Tracking message delivery for room {}: {}/{} delivered ({:.2}% failure)",
            room_id,
            message_count - failed_count,
            message_count,
            failure_rate
        );

        // Alert if message failure rate is high (> 5%)
        if failure_rate > 5.0 {
            warn!(
                "High message failure rate in room {}: {:.2}%",
                room_id, failure_rate
            );

            #[cfg(feature = "optimization")]
            if let Some(client) = &self.client {
                let room_id = room_id.to_string();
                let client = client.clone();

                tokio::spawn(async move {
                    let message = format!(
                        "Room {} has high message failure rate ({:.2}%). How can we improve message delivery?",
                        room_id, failure_rate
                    );

                    match client.chat(&message).await {
                        Ok(_) => debug!("Requested message delivery optimization"),
                        Err(e) => warn!("Failed to get delivery optimization: {}", e),
                    }
                });
            }
        }
    }

    /// Request optimization analysis for Presence service.
    #[cfg(feature = "optimization")]
    pub async fn request_presence_optimization(
        &self,
    ) -> Result<String, Box<dyn std::error::Error>> {
        if !self.enabled {
            return Err("Optimization not enabled".into());
        }

        if let Some(client) = &self.client {
            info!("Requesting Presence optimization analysis");

            let analysis = client
                .optimize_service(
                    "Presence",
                    "Handles WebTransport/WebRTC signaling, presence tracking, and real-time messaging with WebSocket connections",
                )
                .await?;

            Ok(analysis.analysis)
        } else {
            Err("Agent Looper client not initialized".into())
        }
    }

    /// No-op for non-optimization builds.
    #[cfg(not(feature = "optimization"))]
    pub async fn request_presence_optimization(
        &self,
    ) -> Result<String, Box<dyn std::error::Error>> {
        Err("Optimization feature not enabled".into())
    }

    /// Get current optimization goals related to presence.
    #[cfg(feature = "optimization")]
    pub async fn get_presence_goals(
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
    pub async fn get_presence_goals(
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
