# WebSocket Networking Testing Guide

This document describes how to test the WebSocket networking implementation.

## Prerequisites

```bash
# Install dependencies
cd packages/clients/hub-client
npm install
```

## Test Types

### 1. Unit Tests

Run unit tests with mock WebSocket:

```bash
npm test
```

These tests use a mocked WebSocket class and don't require a running server.

### 2. Integration Tests with Mock Server

Start the mock WebSocket server:

```bash
# Terminal 1: Start mock server
cd packages/clients/hub-client
node --loader ts-node/esm src/networking/__tests__/mock-server.ts
```

Then run integration tests:

```bash
# Terminal 2: Run tests
npm run test:integration
```

### 3. Integration Tests with Real Server

Start the actual Presence service:

```bash
# Terminal 1: Start services
cd packages/deploy/compose
docker-compose up -d postgres redis presence
```

Wait for the service to start, then run tests:

```bash
# Terminal 2: Run tests
npm run test:e2e
```

## Test Files

- `websocket.test.ts` - Unit tests for WebSocket client
- `mock-server.ts` - Mock WebSocket server for testing
- `example.test.ts` - Example-based tests

## Running Specific Tests

```bash
# Run only WebSocket tests
npm test -- websocket.test.ts

# Run only message parser tests
npm test -- message-parser.test.ts

# Run with verbose output
npm test -- --verbose
```

## Manual Testing

### Test Client Connection

Create a test file `test-client.ts`:

```typescript
import { WebSocketClient } from './src/network/websocket-client';

async function testConnection() {
  const client = new WebSocketClient({
    presenceUrl: 'ws://localhost:8003',
    roomId: 'test-room',
    userId: 'test-user',
    displayName: 'Test User',
  });

  try {
    await client.connect();
    console.log('✓ Connected!');
    console.log('  Client ID:', client.getClientId());
    console.log('  Stats:', client.getStats());

    // Send a test message
    client.sendChatMessage('Hello from test!');

    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Disconnect
    client.disconnect();
    console.log('✓ Disconnected');
  } catch (error) {
    console.error('✗ Connection failed:', error);
  }
}

testConnection();
```

Run it:

```bash
npx tsx test-client.ts
```

### Test Multiple Clients

Create `test-multi-client.ts`:

```typescript
import { WebSocketClient } from './src/network/websocket-client';

async function testMultipleClients() {
  const clients: WebSocketClient[] = [];

  try {
    // Connect 3 clients
    for (let i = 0; i < 3; i++) {
      const client = new WebSocketClient({
        presenceUrl: 'ws://localhost:8003',
        roomId: 'multi-test',
        userId: `user-${i}`,
        displayName: `User ${i}`,
      });

      await client.connect();
      console.log(`✓ Client ${i} connected:`, client.getClientId());

      // Listen for messages
      client.on(30 as any, (message) => {
        console.log(`Client ${i} received:`, message.payload);
      });

      clients.push(client);
    }

    // Have each client send a message
    for (let i = 0; i < clients.length; i++) {
      clients[i].sendChatMessage(`Hello from client ${i}!`);
    }

    // Wait and observe
    await new Promise(resolve => setTimeout(resolve, 10000));

  } finally {
    // Disconnect all
    clients.forEach(client => client.disconnect());
    console.log('✓ All clients disconnected');
  }
}

testMultipleClients();
```

## Browser Testing

### Test in Browser Console

1. Start the mock server or real server
2. Open a browser and navigate to `http://localhost:5173` (hub-client dev server)
3. Open browser console (F12)
4. Run:

```javascript
// Connect to server
const client = new NetworkClient({
  presenceUrl: 'ws://localhost:8003',
  sfuUrl: 'ws://localhost:8004',
  roomId: 'browser-test',
  authToken: 'test',
  userId: 'browser-user',
  displayName: 'Browser User',
});

await client.connect();
console.log('Connected:', client.getClientId());

// Listen for chat
client.on(30, (msg) => {
  console.log('Chat received:', msg.payload);
});

// Send message
client.sendChatMessage('Hello from browser!');
```

5. Open a second browser window and repeat to test multiple clients

## Debugging

### Enable Logging

```typescript
// Set RUST_LOG for Rust services
export RUST_LOG=debug

// Restart services
cd packages/deploy/compose
docker-compose restart presence
```

### Check WebSocket Connection

```javascript
// In browser console
client.getStats();
// Returns: { isConnected, reconnectAttempts, clientId, readyState }
```

### Monitor Messages

```javascript
// Add a logger handler
client.on(0, (message) => {
  console.log('All messages:', message);
});
```

## Performance Testing

### Test Message Throughput

```typescript
async function testThroughput() {
  const client = new WebSocketClient({
    presenceUrl: 'ws://localhost:8003',
    roomId: 'perf-test',
    userId: 'perf-user',
    displayName: 'Perf User',
  });

  await client.connect();

  const iterations = 1000;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    client.sendPositionUpdate(
      'entity-1',
      { x: Math.random(), y: Math.random(), z: Math.random() },
      { x: 0, y: 0, z: 0, w: 1 }
    );
  }

  const end = performance.now();
  const duration = end - start;
  const messagesPerSecond = (iterations / duration) * 1000;

  console.log(`Sent ${iterations} messages in ${duration.toFixed(2)}ms`);
  console.log(`Throughput: ${messagesPerSecond.toFixed(2)} msg/sec`);

  client.disconnect();
}

testThroughput();
```

### Test Message Size

```typescript
function testMessageSize() {
  const message = MessageBuilder.createPositionUpdate({
    entityId: 'entity-1',
    position: { x: 1, y: 2, z: 3 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    sequenceNumber: 1,
    timestamp: Date.now(),
  });

  const buffer = MessageParser.serialize(message);
  console.log(`Message size: ${buffer.byteLength} bytes`);

  // Analyze overhead
  const jsonSize = JSON.stringify(message).length;
  console.log(`JSON equivalent: ${jsonSize} bytes`);
  console.log(`Binary savings: ${((1 - buffer.byteLength / jsonSize) * 100).toFixed(2)}%`);
}

testMessageSize();
```

## Troubleshooting

### Connection Refused

**Problem**: `ECONNREFUSED` when connecting

**Solutions**:
1. Check if Presence service is running: `docker ps | grep presence`
2. Verify port: `netstat -an | grep 8003` (or your port)
3. Check firewall settings
4. Ensure URL is correct (`ws://` not `http://`)

### Messages Not Received

**Problem**: Client connects but doesn't receive messages

**Solutions**:
1. Check message type enum values match
2. Verify handlers are registered before connecting
3. Add logging to message handlers
4. Check browser console for errors

### Slow Performance

**Problem**: High latency or low throughput

**Solutions**:
1. Reduce sync rate in NetworkSyncComponent
2. Enable/disable interpolation
3. Check network latency
4. Monitor message queue size

## Test Coverage

Current test coverage:

- ✅ Message serialization/deserialization
- ✅ WebSocket connection lifecycle
- ✅ Message handlers
- ✅ Position updates
- ✅ Chat messaging
- ✅ Entity spawn/despawn
- ✅ Auto-reconnect
- ⚠️  Voice chat (needs SFU integration)
- ⚠️  WebRTC (needs SFU integration)

## CI/CD Integration

Add to `.github/workflows/test.yml`:

```yaml
name: Test Networking

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: graphwiz
          POSTGRES_PASSWORD: graphwiz_dev
          POSTGRES_DB: graphwiz
        ports:
          - 5433:5432

      redis:
        image: redis:7
        ports:
          - 6380:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test

      - name: Run integration tests
        run: pnpm run test:integration
        env:
          PRESENCE_URL: ws://localhost:8003
```

## Next Steps

1. ✅ Unit tests
2. ✅ Mock server for testing
3. ⚠️  E2E tests with real services
4. ⚠️  Load testing
5. ⚠️  Browser automated tests (Playwright)
