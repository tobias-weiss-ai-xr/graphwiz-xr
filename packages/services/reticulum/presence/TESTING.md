# WebSocket Testing Guide

This guide covers testing the production-ready WebSocket features implemented for the GraphWiz-XR presence service.

## Quick Start

### Prerequisites

- Rust 1.75+ or latest stable
- Docker (optional, for containerized testing)
- wscat or websocat for WebSocket testing

### Build and Test Locally

```bash
# From project root
cd /opt/git/graphwiz-xr

# Build the presence service
cargo build -p reticulum-presence

# Run all tests
cargo test -p reticulum-presence

# Run specific module tests
cargo test -p reticulum-presence auth
cargo test -p reticulum-presence rate_limit
cargo test -p reticulum-presence queue
cargo test -p reticulum-presence metrics
cargo test -p reticulum-presence redis
cargo test -p reticulum-presence protobuf
```

### Run with Clippy (Linting)

```bash
cargo clippy -p reticulum-presence -- -D warnings
```

### Check Formatting

```bash
cargo fmt -p reticulum-presence -- --check
```

## Test Coverage

### Module Test Summary

| Module | Test Count | Test File | Description |
|--------|-----------|-----------|-------------|
| `auth.rs` | 1 test | Embedded | Authentication context validation |
| `rate_limit.rs` | 1 test | Embedded | Sliding window rate limiting |
| `queue.rs` | 4 tests | Embedded | Message queuing and acknowledgment |
| `metrics.rs` | 4 tests | Embedded | Metrics collection and latency tracking |
| `redis.rs` | 3 tests | Embedded | Redis pub/sub placeholder |
| `protobuf.rs` | 1 test | Embedded | Message encoding/decoding |
| **Total** | **14 tests** | | |

### Detailed Test Descriptions

#### 1. Authentication Tests (`auth.rs`)

```rust
#[test]
fn test_auth_context_creation() {
    // Validates WsAuthContext creation and field access
}
```

**Manual Testing**:
```bash
# Connect without auth (development mode)
wscat -c "ws://localhost:8003/ws/test-room?user_id=test-user&client_id=test-client"

# Connect with JWT auth (requires valid token)
wscat -c "ws://localhost:8003/ws/test-room?auth_token=YOUR_JWT_TOKEN"
```

#### 2. Rate Limiting Tests (`rate_limit.rs`)

```rust
#[tokio::test]
async fn test_rate_limiter() {
    // Tests sliding window rate limiter with 3 requests/second
}
```

**Manual Testing**:
```bash
# Rapid connections to test rate limiting
for i in {1..70}; do
  wscat -c "ws://localhost:8003/ws/test-room?user_id=user$i" 2>&1 | grep -i "rate limit"
done
```

Expected: After 60 connections, should receive `429 Too Many Requests`.

#### 3. Message Queue Tests (`queue.rs`)

```rust
#[tokio::test]
async fn test_message_queue()
async fn test_ack_tracker()
async fn test_reliable_delivery()
async fn test_ack_timeout()
```

**Features Tested**:
- Message queue creation and retrieval
- Acknowledgment tracking
- Reliable delivery with retry
- Timeout handling

#### 4. Metrics Tests (`metrics.rs`)

```rust
#[tokio::test]
async fn test_metrics_collector()
async fn test_room_metrics()
async fn test_latency_tracker()
async fn test_performance_monitor()
```

**Features Tested**:
- Connection/message metrics
- Per-room metrics
- Latency tracking and percentiles
- Performance report generation

#### 5. Redis Tests (`redis.rs`)

```rust
#[test]
fn test_pubsub_message_creation()
#[test]
fn test_redis_config()
#[tokio::test]
async fn test_connection_state()
```

**Note**: These tests validate placeholder implementation. Production requires Redis instance.

#### 6. Protobuf Tests (`protobuf.rs`)

```rust
#[test]
fn test_parse_message() {
    // Tests message encoding and decoding
}
```

## Integration Testing

### Start the Presence Service

```bash
# Run directly
cargo run -p reticulum-presence

# Or with custom configuration
RUST_LOG=debug cargo run -p reticulum-presence
```

The service will start on port 8003 (default) or the configured port.

### WebSocket Test Client

Use the provided HTML test client:

```bash
cd /opt/git/graphwiz-xr/packages/services/reticulum/presence/static
python3 -m http.server 8000
# Open http://localhost:8000/websocket-test.html
```

### Manual Testing with wscat

```bash
# Install wscat
npm install -g wscat

# Connect to a room
wscat -c "ws://localhost:8003/ws/lobby?user_id=alice&client_id=client-1"

# Send a message
{"type":"CHAT_MESSAGE","text":"Hello from wscat!"}

# Disconnect (Ctrl+D)
```

### Testing with curl

```bash
# Health check
curl http://localhost:8003/health

# Room statistics
curl http://localhost:8003/ws/lobby/stats

# Global statistics
curl http://localhost:8003/ws/stats

# Performance metrics
curl http://localhost:8003/metrics
```

## Load Testing

### Using WebSocket Load Testing Tools

```bash
# Install artillery (Node.js)
npm install -g artillery

# Create test script (artillery-websocket-test.yml)
# Run load test
artillery run artillery-websocket-test.yml
```

### Example Artillery Script

```yaml
config:
  target: "ws://localhost:8003"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "WebSocket Connection"
    engine: ws
    flow:
      - send: '{"type":"CHAT_MESSAGE","text":"Test message"}'
      - think: 1
```

## Docker Testing

### Build Docker Image

```bash
docker build -f packages/deploy/docker/Dockerfile.presence -t graphwiz-presence:test .
```

**Note**: Current Docker build may encounter dependency issues with `home` crate requiring Rust edition2024. This is being tracked.

### Run Container

```bash
docker run -p 8003:8003 graphwiz-presence:test
```

### Test Containerized Service

```bash
# Health check
curl http://localhost:8003/health

# WebSocket connection
wscat -c "ws://localhost:8003/ws/test-room?user_id=docker-user"
```

## CI/CD Testing

The project uses GitHub Actions for automated testing. See `.github/workflows/rust.yml`:

### Workflow Steps

1. **Test**: `cargo test --workspace --verbose`
2. **Clippy**: `cargo clippy --workspace -- -D warnings`
3. **Format Check**: `cargo fmt --all -- --check`
4. **Build**: `cargo build --workspace --release`

### Trigger Workflows Locally

```bash
# Install act (to run GitHub Actions locally)
brew install act  # macOS
# or
brew install go-action  # alternative

# Run test workflow
act -j test
```

## Validation Checklist

Before merging or deploying, verify:

- [ ] All tests pass: `cargo test -p reticulum-presence`
- [ ] No clippy warnings: `cargo clippy -p reticulum-presence -- -D warnings`
- [ ] Code formatted: `cargo fmt -p reticulum-presence -- --check`
- [ ] No unused dependencies
- [ ] Documentation is up to date
- [ ] Integration tests pass with WebSocket client
- [ ] Metrics endpoint returns valid data
- [ ] Rate limiting works as expected
- [ ] Authentication validates correctly
- [ ] Message queuing handles backpressure
- [ ] Docker image builds (if using Docker)

## Performance Testing

### Benchmark Message Throughput

```bash
# Use a custom benchmark script
cd /opt/git/graphwiz-xr/packages/services/reticulum/presence
python3 benchmark-websocket.py --connections 100 --messages 1000
```

### Monitor Resource Usage

```bash
# While the service is running
top -p $(pgrep reticulum-presence)

# Or with detailed stats
htop -p $(pgrep reticulum-presence)
```

### Check Memory Leaks

```bash
# Run for extended period with monitoring
cargo run -p reticulum-presence &
PID=$!

# Monitor memory every 10 seconds
watch -n 10 "ps -o pid,rss,vsz -p $PID"

# After testing, kill the process
kill $PID
```

## Troubleshooting

### Test Failures

**Issue**: Tests fail with "connection refused"
**Solution**: Ensure the service is running on the expected port

**Issue**: Rate limit tests fail inconsistently
**Solution**: Tests may be timing-sensitive; run with `--test-threads=1`

**Issue**: Protobuf tests fail
**Solution**: Ensure generated code is up to date; regenerate with `cargo build`

### Build Issues

**Issue**: "crate `home` requires edition2024"
**Solution**: This is a known dependency issue. Options:
  - Use Rust nightly: `rustup override set nightly`
  - Wait for stable Rust to support edition2024
  - Pin `home` crate to earlier version

**Issue**: "linking with cc failed"
**Solution**: Install build dependencies:
```bash
# Alpine
apk add musl-dev openssl-dev pkgconfig

# Ubuntu/Debian
apt-get install build-essential libssl-dev pkg-config

# macOS
xcode-select --install
```

### Runtime Issues

**Issue**: WebSocket connections drop immediately
**Solution**: Check rate limiting configuration; ensure you're not exceeding limits

**Issue**: Metrics endpoint returns 404
**Solution**: Ensure the `/metrics` route is configured in `routes.rs`

## Test Reports

### Generate Test Coverage

```bash
# Install tarpaulin for coverage
cargo install cargo-tarpaulin

# Generate coverage report
cargo tarpaulin -p reticulum-presence --out Html
```

### View Coverage Report

Open `tarpaulin-report.html` in a browser after running the above command.

## Continuous Monitoring

### Log Monitoring

```bash
# Tail logs in real-time
RUST_LOG=debug cargo run -p reticulum-presence 2>&1 | tee presence.log

# Filter for specific events
grep "Rate limit exceeded" presence.log
grep "WebSocket error" presence.log
grep "Connection count" presence.log
```

### Metrics Monitoring

```bash
# Watch metrics endpoint
watch -n 5 'curl -s http://localhost:8003/metrics | jq .'
```

## Next Steps

1. **Automate Testing**: Set up pre-commit hooks to run tests
2. **Load Testing**: Implement comprehensive load test suite
3. **E2E Testing**: Add end-to-end tests with real client scenarios
4. **Chaos Testing**: Test failure scenarios (network issues, Redis down, etc.)
5. **Security Testing**: Add penetration testing for WebSocket vulnerabilities

## Additional Resources

- **Production Features**: See `PRODUCTION_FEATURES.md`
- **WebSocket Documentation**: See `WEBSOCKET.md`
- **API Documentation**: See `/metrics` endpoint while service is running
- **Source Code**: `src/` directory with inline documentation
