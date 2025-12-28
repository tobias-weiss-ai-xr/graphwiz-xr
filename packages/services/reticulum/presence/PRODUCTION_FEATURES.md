# Production-Ready WebSocket Features

This document describes the production-ready features implemented for the GraphWiz-XR WebSocket presence service.

## Overview

The WebSocket server has been enhanced with enterprise-grade features to ensure reliability, scalability, security, and observability in production environments.

## Implemented Features

### 1. Protobuf Message Parsing (`protobuf.rs`)

**Purpose**: Type-safe, efficient message handling for WebSocket communications.

**Key Components**:
- `parse_message()`: Decode protobuf messages from binary data
- `encode_message()`: Encode messages to binary format
- `MessageHandler` trait: Interface for handling different message types
- `DefaultMessageHandler`: Default implementation with logging
- `route_message()`: Dispatch messages to appropriate handlers

**Supported Message Types**:
- `ClientHello`: Initial connection handshake
- `PositionUpdate`: Entity position/rotation updates
- `ChatMessage`: Text chat messages
- `EntitySpawn`: Entity creation notifications
- `PresenceEvent`: User presence changes

**Benefits**:
- Type safety prevents message handling errors
- Efficient binary encoding reduces bandwidth
- Extensible handler pattern for custom message types

**Testing**:
```bash
cargo test -p reticulum-presence protobuf
```

---

### 2. Authentication (`auth.rs`)

**Purpose**: Validate JWT tokens and secure WebSocket connections.

**Key Components**:
- `WsAuthContext`: Authentication context (user_id, client_id, room_id, display_name)
- `validate_websocket_auth()`: Extract and validate JWT from query params
- `extract_auth_context()`: Optional authentication for development mode

**Authentication Flow**:
1. Client connects with `auth_token` query parameter
2. Server validates JWT using `JwtManager`
3. User ID extracted from token claims
4. Auth context attached to connection

**Development Mode**:
- If `user_id` provided without token, connection allowed (logged as warning)
- Useful for local development and testing
- **Not recommended for production**

**Usage Example**:
```javascript
const ws = new WebSocket('ws://localhost:8083/ws/room-123?auth_token=eyJhbGc...');
```

---

### 3. Rate Limiting (`rate_limit.rs`)

**Purpose**: Prevent abuse and ensure fair resource allocation.

**Key Components**:
- `RateLimiter`: Basic sliding window rate limiter
- `MetricRateLimiter`: Rate limiter with metrics tracking
- `PerConnectionRateLimiter`: High-frequency message limiting

**Algorithms**:
- **Sliding Window**: Tracks request timestamps within time window
- **Per-Connection**: Limits per individual WebSocket connection
- **Global**: Limits across all connections

**Default Limits**:
- General: 60 requests per minute
- Per-connection: 100 messages per second (for position updates)

**Configuration**:
```rust
let limiter = RateLimiter::new(
    100,  // max_requests
    60    // window_duration_secs
);
```

**Error Response**:
```json
{
  "error": "Rate limit exceeded",
  "message": "Rate limit exceeded. Try again in 30 seconds."
}
```

**Testing**:
```bash
cargo test -p reticulum-presence rate_limit
```

---

### 4. Message Queuing (`queue.rs`)

**Purpose**: Reliable message delivery with acknowledgment tracking.

**Key Components**:
- `MessageQueue`: Per-connection message queues
- `AckTracker`: Acknowledgment tracking for reliability
- `ReliableDelivery`: Combined queuing and acknowledgment

**Features**:
- **Backpressure Handling**: Queues messages when send buffer full
- **Retry Logic**: Automatic retry on delivery failure
- **Acknowledgment Tracking**: Know when messages are delivered
- **Timeout Handling**: Cleanup undelivered messages

**Usage**:
```rust
// Send reliable message
let delivery = ReliableDelivery::default();
let msg_id = delivery.send_reliable(conn_id, data).await?;

// Handle acknowledgment
delivery.handle_ack(&msg_id).await?;
```

**Queue Configuration**:
- Default queue size: 1000 messages
- Default retry interval: 5 seconds
- Default max retries: 3 attempts

**Testing**:
```bash
cargo test -p reticulum-presence queue
```

---

### 5. Metrics & Monitoring (`metrics.rs`)

**Purpose**: Observability and performance tracking.

**Key Components**:
- `MetricsCollector`: Global metrics (connections, messages, errors)
- `RoomMetricsCollector`: Per-room metrics tracking
- `LatencyTracker`: Message processing latency
- `PerformanceMonitor`: Comprehensive monitoring

**Tracked Metrics**:
- **Connections**: total, active, disconnections, errors
- **Messages**: sent/received counts, bytes transferred, errors
- **Rooms**: connection counts, message counts per room
- **Latency**: average, p50, p99, message processing time
- **Uptime**: Server uptime in seconds

**Metrics Endpoint**:
```bash
GET /metrics
```

**Response Format**:
```
=== Performance Report ===
Uptime: 3600s
Connections: 5 active / 10 total (0 errors)
Messages: 1500 sent / 1200 received (5 errors)
Bytes: 150000 sent / 120000 received
Active Rooms: 3
Latency: avg=15ms, p99=45ms
========================
```

**Usage in Code**:
```rust
// Record metrics
ws_manager.metrics().metrics().record_connection().await;
ws_manager.metrics().metrics().record_message_sent(1024).await;

// Get report
let report = ws_manager.metrics().get_report().await;
println!("{}", report);
```

**Testing**:
```bash
cargo test -p reticulum-presence metrics
```

---

### 6. Redis Pub/Sub (`redis.rs`)

**Purpose**: Scale WebSocket server across multiple instances.

**Key Components**:
- `RedisPubSub`: Redis pub/sub manager
- `RedisConnectionState`: Distributed connection tracking
- `ClusterBroadcaster`: Cross-instance message broadcasting

**Architecture**:
```
Instance 1 ←─┐
             ├─→ Redis Pub/Sub ←──┐
Instance 2 ←─┘                    │
Instance 3 ←──────────────────────┘
```

**Channel Naming**:
- Format: `{prefix}:room:{room_id}`
- Example: `graphwiz:room:lobby`

**Features**:
- **Message Broadcasting**: Send to all instances
- **Connection Registration**: Track connections across cluster
- **Health Checks**: Monitor Redis connectivity
- **Instance Coordination**: Synchronize state between instances

**Configuration**:
```rust
let config = RedisConfig {
    url: "redis://127.0.0.1:6379".to_string(),
    channel_prefix: "graphwiz".to_string(),
};
```

**Usage**:
```rust
// Create cluster broadcaster
let (tx, rx) = mpsc::channel(1000);
let broadcaster = ClusterBroadcaster::new(config, rx).await?;

// Broadcast to all instances
broadcaster.broadcast("room-123", data, Some("conn-1")).await?;
```

**Note**: Currently a placeholder implementation. Requires `redis-rs` library for production use.

---

## Integration in WebSocket Server

### WebSocket Manager Enhancements

The `WebSocketManager` has been enhanced with all production features:

```rust
pub struct WebSocketManager {
    // Original fields
    connections: Arc<RwLock<HashMap<String, mpsc::UnboundedSender<WsMessage>>>>,
    connection_info: Arc<RwLock<HashMap<String, WebSocketConnection>>>,
    room_connections: Arc<RwLock<HashMap<String, Vec<String>>>>,

    // Production features
    rate_limiter: Arc<MetricRateLimiter>,
    metrics: Arc<PerformanceMonitor>,
    message_queue: Arc<MessageQueue>,
    message_handler: Arc<DefaultMessageHandler>,
}
```

### Message Handling Flow

1. **Connection Established**
   - Rate limit check → 429 if exceeded
   - Authentication validation → 401 if failed
   - Metrics: connection recorded
   - Message queue created

2. **Message Received**
   - Rate limit check (per-connection)
   - Protobuf parsing attempted
   - Message routed to handler
   - Metrics: received, latency tracked
   - Broadcast to room (excluding sender)
   - Metrics: sent tracked

3. **Connection Closed**
   - Rate limiter entry removed
   - Message queue removed
   - Metrics: disconnection recorded
   - Room metrics updated

---

## API Endpoints

### WebSocket Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ws/{room_id}` | GET | Main WebSocket connection |
| `/ws/{room_id}/stats` | GET | Room-specific statistics |
| `/ws/stats` | GET | Global connection statistics |
| `/metrics` | GET | Performance metrics report |

### Example Queries

**WebSocket Connection**:
```javascript
const ws = new WebSocket(
  'ws://localhost:8083/ws/lobby?user_id=alice&client_id=client-1'
);
```

**With Authentication**:
```javascript
const ws = new WebSocket(
  'ws://localhost:8083/ws/lobby?auth_token=eyJhbGc...'
);
```

**Get Metrics**:
```bash
curl http://localhost:8083/metrics
```

---

## Configuration

### Environment Variables

```bash
# Rate limiting
RATE_LIMIT_MAX_REQUESTS=60
RATE_LIMIT_WINDOW_SECONDS=60

# Message queue
MESSAGE_QUEUE_SIZE=1000
MESSAGE_RETRY_INTERVAL=5

# Redis (optional, for scaling)
REDIS_URL=redis://127.0.0.1:6379
REDIS_CHANNEL_PREFIX=graphwiz

# Metrics
METRICS_SAMPLE_SIZE=1000
LATENCY_TRACKING_ENABLED=true
```

### Cargo.toml Dependencies

All required dependencies are already included in the workspace:
- `prost`: Protobuf support
- `tokio`: Async runtime
- `actix-ws`: WebSocket support
- `chrono`: Time handling
- `uuid`: Unique identifiers

---

## Testing

### Run All Tests
```bash
cargo test -p reticulum-presence
```

### Run Specific Module Tests
```bash
cargo test -p reticulum-presence protobuf
cargo test -p reticulum-presence auth
cargo test -p reticulum-presence rate_limit
cargo test -p reticulum-presence queue
cargo test -p reticulum-presence metrics
cargo test -p reticulum-presence redis
```

### Test WebSocket Manually

Use the provided test client:
```bash
cd /opt/git/graphwiz-xr/packages/services/reticulum/presence/static
python3 -m http.server 8000
# Open http://localhost:8000/websocket-test.html
```

Or use `wscat`:
```bash
wscat -c "ws://localhost:8083/ws/test-room?user_id=alice"
```

---

## Production Checklist

Before deploying to production:

- [ ] Enable JWT authentication (disable development mode)
- [ ] Configure appropriate rate limits
- [ ] Set up Redis for multi-instance deployments
- [ ] Configure monitoring/alerting on `/metrics` endpoint
- [ ] Enable TLS/SSL for WebSocket connections (wss://)
- [ ] Set up log aggregation
- [ ] Configure health checks
- [ ] Test message queuing under load
- [ ] Verify rate limiting prevents abuse
- [ ] Monitor memory usage for message queues
- [ ] Set up automatic cleanup for inactive rooms

---

## Future Enhancements

Potential improvements for consideration:

1. **Message Compression**: Compress protobuf messages for bandwidth savings
2. **Persistent Connections**: Auto-reconnect with exponential backoff
3. **Message Priorities**: Queue prioritization for critical messages
4. **Distributed Tracing**: OpenTelemetry integration
5. **Custom Metrics**: User-defined metrics collection
6. **Message Encryption**: End-to-end encryption for sensitive data
7. **Connection Throttling**: Gradual connection acceptance during high load
8. **Geo-Routing**: Route connections to nearest instance

---

## Troubleshooting

### High Memory Usage

**Cause**: Message queues growing without bounds

**Solution**:
1. Check queue depth via metrics
2. Reduce `MESSAGE_QUEUE_SIZE`
3. Implement queue overflow policies

### Rate Limit Errors

**Cause**: Clients exceeding configured limits

**Solution**:
1. Check `/metrics` for rate limit stats
2. Adjust `RATE_LIMIT_MAX_REQUESTS`
3. Implement backoff on client side

### High Latency

**Cause**: Message processing bottlenecks

**Solution**:
1. Check p99 latency in `/metrics`
2. Profile message handlers
3. Consider message batching

### Connection Drops

**Cause**: Network issues or overload

**Solution**:
1. Check error rates in `/metrics`
2. Verify rate limiting isn't too aggressive
3. Implement client-side reconnection

---

## Resources

- **WebSocket Test Client**: `static/websocket-test.html`
- **API Documentation**: `WEBSOCKET.md`
- **Source Code**: `src/` directory
- **Tests**: Each module has comprehensive unit tests

---

## Support

For issues or questions:
1. Check this documentation
2. Review test cases for usage examples
3. Check logs for error messages
4. Consult `/metrics` endpoint for runtime information
