# Agent Looper for GraphWiz-XR

Autonomous AI-powered optimization service for the GraphWiz-XR VR platform.

## Overview

Agent Looper uses the SAIA (Scalable AI Accelerator) service to continuously analyze, optimize, and improve the GraphWiz-XR codebase. It operates as an independent microservice that can be integrated with any part of the system.

## Features

- **Continuous Optimization**: Runs in loops to iteratively improve the codebase
- **SAIA Integration**: Uses multiple AI models with automatic API key rotation
- **GraphWiz-XR Aware**: Understands the VR platform architecture and optimization targets
- **gRPC API**: Easy integration with Rust services
- **Safety First**: Approval workflow, validation, and rollback capabilities
- **Multi-Agent Support**: Specialized agents for different optimization areas

## Architecture

```
┌─────────────────┐      gRPC      ┌──────────────────┐
│  Reticulum      │◄──────────────►│  Agent Looper    │
│  (Rust Services)│                │  (Python Service)│
└─────────────────┘                └──────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                ┌──────────────────┐
│   Hub Client    │                │  GraphWiz-XR     │
│   (TypeScript)  │                │  Repository      │
└─────────────────┘                └──────────────────┘
```

## Quick Start

### Prerequisites

- Python 3.11+
- Docker and Docker Compose
- SAIA API keys from https://chat-ai.academiccloud.de
- GraphWiz-XR repository

### Installation

1. **Set up API keys**:
```bash
export SAIA_API_KEYS="sk-key1,sk-key2,sk-key3"
# or
cat > python/.saia-keys <<EOF
sk-key1
sk-key2
sk-key3
EOF
```

2. **Start the service**:
```bash
cd packages/services/agent-looper
docker-compose up -d
```

3. **Verify it's running**:
```bash
docker-compose logs -f agent-looper
```

### Usage from Rust

Add to `Cargo.toml`:
```toml
[dependencies]
agent-looper-client = { path = "packages/services/agent-looper/rust" }
```

Basic usage:
```rust
use agent_looper_client::AgentLooperClient;

let client = AgentLooperClient::connect("http://localhost:50051".to_string()).await?;

let loop_id = client.start_loop(
    "/opt/git/graphwiz-xr",
    vec!["webrtc_latency".to_string()],
    false,
    None
).await?;
```

See `AGENT_LOOPER_INTEGRATION.md` for detailed integration guides.

## Configuration

### Main Config (`python/config/config.yaml`)

```yaml
looper:
  max_iterations: 100
  iteration_interval: 3600  # 1 hour
  auto_apply: false  # Require approval
  git:
    auto_commit: true
    branch: agent-optimizations

saia:
  model: meta-llama-3.1-8b-instruct
  max_tokens: 8192
  temperature: 0.7

graphwiz:
  project_path: /opt/git/graphwiz-xr
  services:
    - reticulum/auth
    - reticulum/hub
    - reticulum/presence
    - reticulum/sfu
```

### Goals (`python/config/goals.yaml`)

Define what to optimize:

```yaml
goals:
  - name: webrtc_latency
    category: performance
    description: Reduce WebRTC end-to-end latency
    target_value: 50
    current_value: 100
    unit: ms
    metadata:
      priority: high
      service: reticulum/sfu
```

## Optimization Targets

The agent is pre-configured with GraphWiz-XR specific goals:

### Performance
- WebRTC latency: < 50ms
- Rendering FPS: 90 FPS on Quest 2
- Loading time: < 3 seconds
- Concurrent users: 100 users

### Code Quality
- Test coverage: 80%
- Documentation: 100% of public APIs
- Zero critical vulnerabilities

### User Experience
- Interaction smoothness: < 16ms input-to-render
- Crash rate: < 0.1%

## Development

### Project Structure

```
agent-looper/
├── python/                    # Python service
│   ├── src/
│   │   ├── core/             # Core logic (looper, agent, goals)
│   │   ├── graphwiz/         # GraphWiz-specific code
│   │   ├── api/              # gRPC server
│   │   └── utils/            # Utilities (git, logging)
│   ├── config/               # Configuration files
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile
├── rust/                      # Rust client library
│   ├── src/
│   │   ├── client.rs         # gRPC client
│   │   ├── types.rs          # Type definitions
│   │   └── lib.rs
│   ├── examples/             # Integration examples
│   ├── Cargo.toml
│   └── build.rs              # Protobuf build
└── docker-compose.yml        # Service deployment
```

### Running Locally (Development)

```bash
# Python service
cd python
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m src.api.server

# Rust client tests
cd rust
cargo test
cargo run --example integration
```

### Generating Protobuf Files

```bash
# From project root
cd packages/shared/protocol/proto
python -m grpc_tools.protoc -I. --python_out=../../.. agent.proto
rust/../../../target/debug/build/grpc-*/build_scripts/../protoc/bin/protoc -I. --rust_out=../../.. agent.proto
```

## API Reference

### gRPC Service

```protobuf
service AgentLooper {
  rpc StartLoop(StartRequest) returns (LoopResponse);
  rpc StopLoop(StopRequest) returns (LoopResponse);
  rpc GetStatus(StatusRequest) returns (StatusResponse);
  rpc SubmitGoal(GoalRequest) returns (GoalResponse);
  rpc Analyze(AnalyzeRequest) returns (AnalyzeResponse);
  rpc ReviewChanges(ReviewRequest) returns (ReviewResponse);
  rpc GetMetrics(MetricsRequest) returns (MetricsResponse);
}
```

See `packages/shared/protocol/proto/agent.proto` for full API definition.

## Safety and Reliability

### Approval Workflow
1. Agent proposes changes
2. Automated validation (tests, linting)
3. Human review (optional but recommended)
4. Apply to staging
5. Final approval for production
6. Automatic rollback on failure

### Validation
- Rust: `cargo check` and `cargo test`
- TypeScript: `tsc --noEmit` and `pnpm test`
- Performance benchmarking
- Security scanning

### Rollback
- Git-based version control
- Automatic revert on test failure
- Manual rollback API
- Performance degradation detection

## Monitoring

### Logs

```bash
# View logs
docker-compose logs -f agent-looper

# Log level controlled by config.yaml
# logging.level: DEBUG|INFO|WARNING|ERROR
```

### Metrics

Access metrics via the gRPC API:

```rust
let metrics = client.get_metrics(&loop_id, vec![]).await?;
```

### Health Check

```bash
curl http://localhost:50051
# Or programmatically
client.health_check().await?
```

## Troubleshooting

### Common Issues

**Service won't start**
- Check SAIA API keys are set
- Verify port 50051 is available
- Check Docker logs: `docker logs graphwiz-agent-looper`

**Can't connect from Rust**
- Ensure service is running: `docker ps`
- Check network connectivity
- Verify gRPC port is exposed

**Optimizations not working**
- Review logs for errors
- Check goals are properly configured
- Verify project path is correct
- Ensure git repository is accessible

## Contributing

When adding new features:

1. Update protobuf definitions in `packages/shared/protocol/proto/agent.proto`
2. Regenerate Rust and Python protobuf code
3. Update both Python service and Rust client
4. Add integration examples
5. Update this README

## License

MIT License - See main GraphWiz-XR LICENSE file.

## See Also

- [AGENT_LOOPER_INTEGRATION.md](../../../AGENT_LOOPER_INTEGRATION.md) - Detailed integration guide
- [AGENT_LOOPER_IMPLEMENTATION_PLAN.md](../../../AGENT_LOOPER_IMPLEMENTATION_PLAN.md) - Implementation details
- [SAIA Documentation](https://chat-ai.academiccloud.de) - AI provider
