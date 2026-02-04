//! Optimization integration with Agent Looper for SFU service
//!
//! This module provides optional integration with the Agent Looper service
//! for continuous optimization of WebRTC streaming performance.

use tracing::{debug, error, info, warn};

#[cfg(feature = "optimization")]
use agent_looper_client::{AgentLooperClient, GoalData};

/// Optimization manager for SFU service
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
            "Initializing SFU optimization with Agent Looper at {}",
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

    /// Track WebRTC peer connection for optimization.
    pub fn track_peer_connected(&self, peer_id: &str, room_id: &str) {
        if !self.enabled {
            return;
        }

        debug!("Tracking peer {} connection in room {}", peer_id, room_id);

        #[cfg(feature = "optimization")]
        if let Some(client) = &self.client {
            let peer_id = peer_id.to_string();
            let room_id = room_id.to_string();
            let client = client.clone();

            tokio::spawn(async move {
                let message = format!(
                    "Peer {} connected in SFU room {}. Any optimization suggestions for WebRTC?",
                    peer_id, room_id
                );

                match client.chat(&message).await {
                    Ok(response) => {
                        debug!("WebRTC optimization insight: {}", response.response);
                    }
                    Err(e) => {
                        warn!("Failed to get WebRTC optimization insights: {}", e);
                    }
                }
            });
        }
    }

    /// Track RTP packet statistics for optimization.
    pub fn track_rtp_stats(&self, room_id: &str, packets_sent: u64, packets_lost: u32) {
        if !self.enabled {
            return;
        }

        let loss_rate = if packets_sent > 0 {
            (packets_lost as f64 / packets_sent as f64) * 100.0
        } else {
            0.0
        };

        debug!(
            "Tracking RTP stats for room {}: loss rate {:.2}%",
            room_id, loss_rate
        );

        // Only alert if loss rate is high
        if loss_rate > 5.0 {
            warn!(
                "High packet loss detected in room {}: {:.2}%",
                room_id, loss_rate
            );

            #[cfg(feature = "optimization")]
            if let Some(client) = &self.client {
                let room_id = room_id.to_string();
                let client = client.clone();

                tokio::spawn(async move {
                    let message = format!(
                        "Room {} has high packet loss ({:.2}%). How can we optimize WebRTC?",
                        room_id, loss_rate
                    );

                    match client.chat(&message).await {
                        Ok(_) => debug!("Reported high packet loss for optimization"),
                        Err(e) => warn!("Failed to report packet loss: {}", e),
                    }
                });
            }
        }
    }

    /// Request optimization analysis for WebRTC streaming.
    #[cfg(feature = "optimization")]
    pub async fn request_webrtc_optimization(
        &self,
    ) -> Result<String, Box<dyn std::error::Error>> {
        if !self.enabled {
            return Err("Optimization not enabled".into());
        }

        if let Some(client) = &self.client {
            info!("Requesting WebRTC optimization analysis for SFU service");

            let analysis = client
                .optimize_service(
                    "SFU",
                    "Handles WebRTC media forwarding with RTP/RTCP for video/audio streaming",
                )
                .await?;

            Ok(analysis.analysis)
        } else {
            Err("Agent Looper client not initialized".into())
        }
    }

    /// No-op for non-optimization builds.
    #[cfg(not(feature = "optimization"))]
    pub async fn request_webrtc_optimization(
        &self,
    ) -> Result<String, Box<dyn std::error::Error>> {
        Err("Optimization feature not enabled".into())
    }

    /// Get current optimization goals related to streaming.
    #[cfg(feature = "optimization")]
    pub async fn get_streaming_goals(
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
    pub async fn get_streaming_goals(
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
