# Agent Looper Integration Guide

This guide explains how to integrate and use the Agent Looper service with GraphWiz-XR.

## Quick Start

### 1. Set up SAIA API Keys

Get API keys from https://chat-ai.academiccloud.de and set them:

```bash
export SAIA_API_KEYS="sk-key1,sk-key2,sk-key3"
```

Or create a `.saia-keys` file:

```bash
echo "sk-key1" > packages/services/agent-looper/python/.saia-keys
echo "sk-key2" >> packages/services/agent-looper/python/.saia-keys
echo "sk-key3" >> packages/services/agent-looper/python/.saia-keys
```

### 2. Start the Agent Looper Service

```bash
cd packages/services/agent-looper
docker-compose up -d
```

### 3. Use from Rust Code

Add to your `Cargo.toml`:

```toml
[dependencies]
agent-looper-client = { path = "packages/services/agent-looper/rust" }
```

Example usage:

```rust
use agent_looper_client::AgentLooperClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Connect to the service
    let client = AgentLooperClient::connect("http://localhost:50051".to_string()).await?;

    // Start optimization loop
    let loop_id = client.start_loop(
        "/opt/git/graphwiz-xr",
        vec!["webrtc_latency".to_string()],
        false,
        None
    ).await?;

    println!("Optimization loop started: {}", loop_id);

    Ok(())
}
```

## Reticulum Service Integration

### Hub Service Integration

In `packages/services/reticulum/hub/src/lib.rs`:

```rust
use agent_looper_client::{AgentLooperClient, Goal, GoalCategory};

pub struct HubService {
    // ... existing fields
    agent_client: Option<AgentLooperClient>,
    optimization_loop_id: Option<String>,
}

impl HubService {
    pub async fn new(config: HubConfig) -> Result<Self, Error> {
        // ... existing initialization

        // Initialize agent client if configured
        let agent_client = if config.enable_agent_optimization {
            Some(
                AgentLooperClient::connect("http://localhost:50051".to_string())
                    .await?
            )
        } else {
            None
        };

        Ok(Self {
            // ... existing fields
            agent_client,
            optimization_loop_id: None,
        })
    }

    pub async fn start_optimization(&mut self) -> Result<(), Error> {
        if let Some(client) = &self.agent_client {
            let loop_id = client.start_loop(
                "/opt/git/graphwiz-xr",
                vec![
                    "webrtc_latency".to_string(),
                    "concurrent_users".to_string(),
                ],
                false,
                None
            ).await?;

            self.optimization_loop_id = Some(loop_id);
            info!("Started agent optimization: {}", loop_id);
        }

        Ok(())
    }

    pub async fn request_scene_analysis(&self, scene_id: &str) -> Result<Scene, Error> {
        if let Some(client) = &self.agent_client {
            if let Some(loop_id) = &self.optimization_loop_id {
                let mut context = std::collections::HashMap::new();
                context.insert("scene_id".to_string(), scene_id.to_string());
                context.insert("service".to_string(), "reticulum/hub".to_string());

                let analysis = client.analyze(loop_id, "scene_optimization", context).await?;

                if analysis.success {
                    info!("Scene analysis complete: {}", analysis.analysis);
                    // Process analysis and optimize scene
                }
            }
        }

        // Fallback to regular scene loading
        Ok(self.load_scene(scene_id).await?)
    }
}
```

### SFU Service Integration

In `packages/services/reticulum/sfu/src/lib.rs`:

```rust
use agent_looper_client::AgentLooperClient;

pub struct SfuService {
    agent_client: Option<AgentLooperClient>,
}

impl SfuService {
    pub async fn optimize_webrtc(&self) -> Result<(), Error> {
        if let Some(client) = &self.agent_client {
            // Request performance optimization
            let analysis = client.analyze(
                "loop-id",
                "webrtc_performance",
                std::collections::HashMap::new()
            ).await?;

            // Apply optimizations based on analysis
            for recommendation in analysis.recommendations {
                info!("Applying SFU optimization: {}", recommendation);
                // Apply optimization to SFU configuration
            }
        }

        Ok(())
    }
}
```

## Configuration

### Environment Variables

```bash
# SAIA API Configuration
SAIA_API_KEYS="sk-key1,sk-key2,sk-key3"

# Agent Looper Service
AGENT_LOOPER_HOST="localhost"
AGENT_LOOPER_PORT="50051"

# Optimization Settings
AGENT_AUTO_APPLY="false"
AGENT_ITERATION_INTERVAL="3600"
```

### Goal Configuration

Edit `packages/services/agent-looper/python/config/goals.yaml` to customize optimization goals:

```yaml
goals:
  - name: custom_goal
    category: performance
    description: "Your custom optimization goal"
    target_value: 100
    current_value: 50
    unit: "ms"
    metadata:
      priority: high
      service: your-service
```

## Monitoring

### Check Loop Status

```rust
let status = client.get_status(&loop_id).await?;
println!("Loop running: {}", status.running);
println!("Current iteration: {}", status.iteration);
println!("Current phase: {}", status.current_phase);
```

### Get Metrics

```rust
let metrics = client.get_metrics(&loop_id, vec![]).await?;
for metric in metrics {
    println!("{}: {} {}", metric.name, metric.value, metric.unit);
}
```

### Review Changes

```rust
// Approve changes
client.review_changes(&loop_id, "1", "approve", "Looks good").await?;

// Reject changes
client.review_changes(&loop_id, "1", "reject", "Needs revision").await?;
```

## Deployment

### Docker Compose

The agent-looper service is included in the main docker-compose.yml:

```bash
docker-compose up -d agent-looper
```

### Kubernetes

```yaml
apiVersion: v1
kind: Service
metadata:
  name: agent-looper
spec:
  selector:
    app: agent-looper
  ports:
  - port: 50051
    targetPort: 50051
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-looper
spec:
  replicas: 1
  selector:
    matchLabels:
      app: agent-looper
  template:
    metadata:
      labels:
        app: agent-looper
    spec:
      containers:
      - name: agent-looper
        image: graphwiz-agent-looper:latest
        ports:
        - containerPort: 50051
        env:
        - name: SAIA_API_KEYS
          valueFrom:
            secretKeyRef:
              name: agent-secrets
              key: api-keys
```

## Best Practices

1. **Start with auto_apply=false**: Always review changes before automatic application
2. **Set appropriate iteration intervals**: Don't overload the system with too frequent optimizations
3. **Monitor closely**: Watch the logs and metrics to ensure optimizations are helpful
4. **Test thoroughly**: Run full test suite after each optimization iteration
5. **Rollback ready**: Keep git history clean for easy rollbacks

## Troubleshooting

### Service won't start

Check SAIA API keys:
```bash
echo $SAIA_API_KEYS
```

Check logs:
```bash
docker logs graphwiz-agent-looper
```

### Can't connect from Rust client

Verify service is running:
```bash
curl http://localhost:50051
```

Check network configuration in docker-compose.yml

### Optimizations not working

Check agent-looper logs:
```bash
docker-compose logs -f agent-looper
```

Verify goals are configured correctly in goals.yaml

## Advanced Usage

### Custom Agent Prompts

Modify the prompts in `src/core/agent.py` to customize agent behavior for your specific needs.

### Integration with CI/CD

Add agent-looper to your CI pipeline:

```yaml
# .github/workflows/agent-optimization.yml
name: Agent Optimization
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  optimize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Agent Optimization
        run: |
          docker-compose up -d agent-looper
          # Wait for optimization to complete
          docker-compose logs -f agent-looper
```

### Multiple Optimization Loops

Run multiple loops for different concerns:

```rust
let performance_loop = client.start_loop(
    "/opt/git/graphwiz-xr",
    vec!["webrtc_latency".to_string()],
    false,
    None
).await?;

let security_loop = client.start_loop(
    "/opt/git/graphwiz-xr",
    vec!["security_scan".to_string()],
    false,
    None
).await?;
```

## Support

For issues or questions:
- Check logs: `docker-compose logs agent-looper`
- Review configuration in `config/config.yaml`
- Open an issue on GitHub
