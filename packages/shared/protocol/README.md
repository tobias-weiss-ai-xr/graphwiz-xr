# Protocol Buffers for GraphWiz-XR

This directory contains the protocol buffer definitions and generated code for GraphWiz-XR services.

## Structure

```
protocol/
├── proto/                    # .proto definition files
│   └── agent.proto          # Agent Looper service definition
├── python/                  # Generated Python code
│   └── agent/
│       ├── __init__.py
│       ├── agent_pb2.py     # Message classes
│       └── agent_pb2_grpc.py # gRPC service stubs
└── rust/                    # Generated Rust code
    └── agent.rs             # Rust types and gRPC client/server
```

## Protocol Definitions

### agent.proto

Defines the Agent Looper service for continuous optimization:

**Messages:**
- `StartRequest/LoopResponse` - Start/stop optimization loops
- `StatusRequest/StatusResponse` - Get loop status and goals
- `GoalRequest/GoalResponse` - Submit optimization goals
- `AnalyzeRequest/AnalyzeResponse` - Request analysis
- `ReviewRequest/ReviewResponse` - Approve/reject changes
- `MetricsRequest/MetricsResponse` - Get metrics
- `LogRequest/LogEvent` - Stream logs

**Services:**
- `AgentLooper` - Main service with all RPC methods

## Usage

### Python

```python
import sys
sys.path.insert(0, 'path/to/shared/protocol/python')

from agent import agent_pb2, agent_pb2_grpc

# Create request
request = agent_pb2.StartRequest()
request.project_path = "/opt/git/graphwiz-xr"
request.goals.append("webrtc_latency")
request.auto_apply = False

# Create client
channel = grpc.insecure_channel('localhost:50051')
stub = agent_pb2_grpc.AgentLooperStub(channel)

# Make call
response = stub.StartLoop(request)
print(f"Started: {response.loop_id}")
```

### Rust

Add to Cargo.toml:

```toml
[dependencies]
prost = "0.12"
tonic = "0.11"
```

Include the generated code:

```rust
include!(concat!(env!("OUT_DIR"), "/agent.rs"));

use agent::agent_looper_client::AgentLooperClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut client = AgentLooperClient::connect("http://localhost:50051").await?;

    let request = StartRequest {
        project_path: "/opt/git/graphwiz-xr".to_string(),
        goals: vec!["webrtc_latency".to_string()],
        auto_apply: false,
        config: None,
    };

    let response = client.start_loop(request).await?;
    println!("Started: {}", response.into_inner().loop_id);

    Ok(())
}
```

## Regenerating Protobuf Code

### Prerequisites

```bash
# Python
pip install grpcio-tools protobuf

# Rust (happens automatically via build.rs)
cargo install protoc
```

### Generate Python Code

```bash
cd packages/shared/protocol
python -m grpc_tools.protoc \
  -I. \
  --python_out=python \
  --grpc_python_out=python \
  proto/agent.proto
```

### Generate Rust Code

The Rust code is automatically generated via build.rs when building:

```bash
cd packages/services/agent-looper/rust
cargo build
```

## Adding New Services

1. Create `.proto` file in `proto/`
2. Define messages and service
3. Generate code (see above)
4. Import and use in Python/Rust code

## API Reference

See individual `.proto` files for complete API definitions.
