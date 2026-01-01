//! Example integration of Agent Looper with Reticulum Hub service

use agent_looper_client::{AgentLooperClient, Goal, GoalCategory, LooperConfig};
use std::collections::HashMap;
use tonic::transport::Channel;
use tracing::{info, Level};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    tracing_subscriber::fmt().with_max_level(Level::INFO).init();

    info!("Starting Agent Looper integration example");

    // Connect to Agent Looper service
    let client = AgentLooperClient::connect("http://localhost:50051".to_string()).await?;

    // Check health
    let healthy = client.health_check().await?;
    info!("Agent Looper health check: {}", healthy);

    // Start optimization loop
    let loop_id = client
        .start_loop(
            "/opt/git/graphwiz-xr",
            vec!["webrtc_latency".to_string(), "rendering_fps".to_string()],
            false, // Require manual approval
            Some(LooperConfig::default()),
        )
        .await?;

    info!("Started optimization loop: {}", loop_id);

    // Submit a custom goal
    let custom_goal = Goal {
        name: "memory_usage".to_string(),
        description: "Reduce memory usage in hub-client".to_string(),
        category: GoalCategory::Performance,
        target_value: 500.0,
        current_value: 800.0,
        unit: "MB".to_string(),
        metadata: {
            let mut map = HashMap::new();
            map.insert("service".to_string(), "hub-client".to_string());
            map.insert("priority".to_string(), "medium".to_string());
            map
        },
    };

    client.submit_goal(&loop_id, custom_goal).await?;
    info!("Submitted custom goal");

    // Request analysis
    let mut context = HashMap::new();
    context.insert("service".to_string(), "reticulum/hub".to_string());

    let analysis = client
        .analyze(&loop_id, "performance", context)
        .await?;

    info!("Analysis complete: {}", analysis.success);
    if !analysis.issues.is_empty() {
        info!("Found {} issues:", analysis.issues.len());
        for issue in &analysis.issues {
            info!("  - {} ({:?})", issue.title, issue.severity);
        }
    }

    // Monitor loop status
    tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;

    let status = client.get_status(&loop_id).await?;
    info!("Loop status: running={}, iteration={}", status.running, status.iteration);

    // Review changes (in real scenario, this would be triggered by human or automated check)
    // client.review_changes(&loop_id, "1", "approve", "Changes look good").await?;

    // Stop loop
    tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;
    client.stop_loop(&loop_id).await?;
    info!("Stopped optimization loop");

    Ok(())
}
