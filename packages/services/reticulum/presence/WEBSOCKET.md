# GraphWiz-XR WebSocket Server

Production-ready WebSocket server for real-time communication in the presence service.

## Features

### Production-Ready Capabilities

1. **Protobuf Message Parsing**
   - Type-safe message handling with `MessageHandler` trait
   - Automatic message routing to appropriate handlers
   - Support for ClientHello, PositionUpdate, ChatMessage, EntitySpawn, PresenceEvent

2. **Authentication**
   - JWT token validation on connection
   - Development mode support (optional authentication)
   - User and client ID extraction from tokens

3. **Rate Limiting**
   - Sliding window algorithm for fair usage
   - Per-connection rate limiting
   - Global rate limiting with metrics tracking
   - Configurable limits and time windows

4. **Message Queuing**
   - Reliable message delivery with acknowledgment tracking
   - Automatic retry on delivery failure
   - Queue depth monitoring
   - Graceful backpressure handling

5. **Metrics & Monitoring**
   - Connection metrics (total, active, disconnections, errors)
   - Message metrics (sent/received counts, bytes, errors)
   - Per-room metrics tracking
   - Latency tracking (average, percentiles)
   - Performance monitoring endpoint

6. **Scalability (Redis Pub/Sub)**
   - Cluster-aware message broadcasting
   - Distributed connection state management
   - Redis pub/sub for cross-instance communication
   - Health check and connection synchronization

## WebSocket Endpoints

### Main WebSocket Endpoint
```
GET /ws/{room_id}?user_id={user_id}&client_id={client_id}
```

Upgrades the HTTP connection to WebSocket and adds the client to the specified room.

**Path Parameters:**
- `room_id` - The room ID to join

**Query Parameters:**
- `user_id` (optional) - User ID for the connection
- `client_id` (optional) - Client ID for the connection

**Response:**
- Server hello message on successful connection:
```json
{
  "type": "SERVER_HELLO",
  "room_id": "room123",
  "client_id": "uuid",
  "timestamp": 1234567890
}
```

### Room Statistics
```
GET /ws/{room_id}/stats
```

Get statistics for a specific room.

**Response:**
```json
{
  "room_id": "room123",
  "connection_count": 3,
  "connections": [
    {
      "id": "conn-uuid-1",
      "room_id": "room123",
      "user_id": "user1",
      "client_id": "client1",
      "connected_at": "2025-01-01T12:00:00Z"
    }
  ]
}
```

### Global Statistics
```
GET /ws/stats
```

Get global WebSocket connection statistics.

**Response:**
```json
{
  "total_connections": 10,
  "timestamp": "2025-01-01T12:00:00Z"
}
```

### Performance Metrics
```
GET /metrics
```

Get comprehensive performance metrics including connections, messages, latency, and room statistics.

**Response:**
```json
{
  "report": "=== Performance Report ===\nUptime: 3600s\nConnections: 5 active / 10 total (0 errors)\n...",
  "timestamp": "2025-01-01T12:00:00Z"
}
```

## Message Format

### Sending Messages

Clients can send either:
- **Binary messages** - For protobuf-encoded messages (preferred)
- **Text messages** - For JSON or plain text

### Receiving Messages

Messages received from other clients are broadcast to all clients in the same room (excluding the sender).

## WebSocket Connection Flow

1. Client connects to `/ws/{room_id}`
2. Server sends server hello
3. Client can send messages (binary or text)
4. Server broadcasts messages to all clients in the room
5. Connection is cleaned up on disconnect

## Example JavaScript Client

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8083/ws/test-room?user_id=user123&client_id=client456');

ws.onopen = () => {
  console.log('Connected to WebSocket');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);

  if (message.type === 'SERVER_HELLO') {
    // Send a test message
    ws.send(JSON.stringify({
      type: 'TEST_MESSAGE',
      data: 'Hello from client'
    }));
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from WebSocket');
};
```

## Features

- **Room-based broadcasting** - Messages are broadcast to all clients in a room
- **Automatic cleanup** - Disconnected clients are automatically removed
- **Connection tracking** - Track active connections per room
- **User and client IDs** - Optional parameters to identify connections
- **Binary and text support** - Handle both protobuf and JSON messages

## Testing with wscat

Install wscat:
```bash
npm install -g wscat
```

Connect to WebSocket:
```bash
wscat -c "ws://localhost:8083/ws/test-room?user_id=user123&client_id=client456"
```

Send a message:
```json
{"type":"CHAT_MESSAGE","text":"Hello from wscat!"}
```
