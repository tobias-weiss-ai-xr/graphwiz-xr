//! Integration test for Agent Looper with Reticulum services
//!
//! This test demonstrates the integration between Agent Looper and Reticulum services.

use agent_looper_client::{AgentLooperClient, GoalData};

#[tokio::test]
#[ignore] // Requires running Agent Looper service
async fn test_agent_looper_client_integration() {
    // Create client
    let client = AgentLooperClient::new("http://localhost:50051".to_string());

    // Test health check
    let health = client.health_check().await.unwrap();
    assert_eq!(health.status, "healthy");
    println!("✓ Health check passed");

    // Test getting goals
    let goals = client.get_goals().await.unwrap();
    println!("✓ Got {} goals", goals.goals.len());
    println!("  Overall progress: {:.1}%", goals.overall_progress);

    // Test getting metrics
    let metrics = client.get_metrics().await.unwrap();
    println!("✓ Got {} metrics", metrics.metrics.metrics.len());

    // Test analysis
    let analysis = client.analyze().await.unwrap();
    assert!(analysis.success);
    println!("✓ Analysis generated ({} chars)", analysis.analysis.len());

    // Test chat
    let chat_response = client.chat("What is GraphWiz-XR?").await.unwrap();
    assert!(chat_response.success);
    println!("✓ Chat response received ({} chars)", chat_response.response.len());

    // Test optimization request
    let service_opt = client
        .optimize_service("Hub", "Manages rooms and entities")
        .await
        .unwrap();
    println!("✓ Service optimization suggestions received");

    println!("\n✅ All integration tests passed!");
}

#[tokio::test]
#[ignore]
async fn test_add_custom_goal() {
    let client = AgentLooperClient::new("http://localhost:50051".to_string());

    let custom_goal = GoalData {
        name: "test_integration".to_string(),
        description: "Test integration goal".to_string(),
        category: "testing".to_string(),
        target_value: 100.0,
        current_value: 50.0,
        unit: "%".to_string(),
        progress_percentage: 50.0,
        is_completed: false,
    };

    let result = client.add_goal(custom_goal).await;
    assert!(result.is_ok());
    println!("✓ Custom goal added successfully");
}

#[tokio::test]
#[ignore]
async fn test_create_optimization_plan() {
    let client = AgentLooperClient::new("http://localhost:50051".to_string());

    let issues = vec![
        "High WebRTC latency".to_string(),
        "Low rendering FPS".to_string(),
    ];

    let plan = client
        .create_plan(issues, Some("Must maintain backward compatibility".to_string()))
        .await
        .unwrap();

    assert!(plan.success);
    println!("✓ Optimization plan created ({} chars)", plan.plan.len());
}
