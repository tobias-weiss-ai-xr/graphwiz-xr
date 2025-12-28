# GraphWiz-XR Client Networking

Complete WebSocket networking implementation for real-time multiplayer in GraphWiz-XR.

## Overview

The networking module provides:
- **WebSocket Client** - Low-level WebSocket connection management
- **Network Client** - High-level networking API
- **Network System** - ECS system for entity synchronization
- **Message Protocol** - Binary message serialization/deserialization

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Game Engine                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              NetworkSystem (ECS System)               │ │
│  │  - Manages networked entities                         │ │
│  │  - Synchronizes position/rotation                     │ │
│  │  - Handles incoming messages                          │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │              NetworkClient                              │ │
│  │  - High-level API                                      │ │
│  │  - Message routing                                     │ │
│  │  - Position updates                                    │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │           WebSocketClient                               │ │
│  │  - WebSocket connection                                │ │
│  │  - Auto-reconnect                                      │ │
│  │  - Binary message handling                             │ │
│  └────────────────────┬───────────────────────────────────┘ │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  Presence Service   │
              │  (WebSocket Server) │
              └─────────────────────┘
```

## Installation

The networking module is included in the `hub-client` package. Import from the `@graphwiz-xr/hub-client` package:

```typescript
import { NetworkClient, NetworkSystem } from '@graphwiz-xr/hub-client/network';
import type { NetworkConfig } from '@graphwiz-xr/hub-client/network';
```

## Quick Start

### 1. Basic Connection

```typescript
import { NetworkClient } from '@graphwiz-xr/hub-client/network';

const config: NetworkConfig = {
  presenceUrl: 'ws://localhost:4002',
  sfuUrl: 'ws://localhost:4003',
  roomId: 'my-room',
  authToken: 'your-auth-token',
  userId: 'user-123',
  displayName: 'Player Name',
};

const client = new NetworkClient(config);

// Connect to server
await client.connect();

console.log('Connected!', client.getClientId());
```

### 2. Sending Messages

```typescript
// Send position update
client.sendPositionUpdate(
  'entity-123',
  { x: 10, y: 0, z: 5 },
  { x: 0, y: 0, z: 0, w: 1 }
);

// Send chat message
client.sendChatMessage('Hello everyone!');

// Send entity spawn
client.sendEntitySpawn({
  entityId: 'entity-456',
  templateId: 'cube',
  components: { color: 'red' },
});
```

### 3. Receiving Messages

```typescript
import { MessageType } from '@graphwiz-xr/protocol';

// Listen for position updates
client.on(MessageType.POSITION_UPDATE, (message) => {
  const update = message.payload;
  console.log('Entity moved:', update.entityId, update.position);
});

// Listen for chat
client.on(MessageType.CHAT_MESSAGE, (message) => {
  const chat = message.payload;
  console.log(`${chat.fromClientId}: ${chat.message}`);
});

// Listen for user joins/leaves
client.on(MessageType.PRESENCE_JOIN, (message) => {
  const event = message.payload;
  console.log('User joined:', event.clientId);
});
```

### 4. Using with ECS

```typescript
import { Engine } from '@graphwiz-xr/hub-client/core';
import { NetworkSystem } from '@graphwiz-xr/hub-client/network';

const engine = new Engine();
const networkSystem = new NetworkSystem(client);

engine.addSystem(networkSystem);
engine.start();

// Create a networked entity
const entity = networkSystem.createNetworkedEntity(
  'cube-template',
  { x: 0, y: 1, z: 0 },
  { model: 'cube', color: 'blue' }
);
```

## API Reference

### NetworkClient

Main high-level API for networking.

#### Constructor

```typescript
constructor(config: NetworkConfig)
```

**Parameters:**
- `config.presenceUrl` - WebSocket URL for presence service
- `config.sfuUrl` - WebSocket URL for SFU service (future)
- `config.roomId` - Room ID to join
- `config.authToken` - Authentication token
- `config.userId` - User ID
- `config.displayName` - Display name

#### Methods

##### `connect(): Promise<void>`

Connect to the presence server.

##### `disconnect(): void`

Disconnect from the server.

##### `on(messageType: MessageType, handler: Function): () => void`

Register a message handler. Returns unsubscribe function.

##### `send(message: Message): void`

Send a message to the server.

##### `sendPositionUpdate(entityId, position, rotation): void`

Send position/rotation update for an entity.

##### `sendEntitySpawn(data): void`

Spawn a new networked entity.

##### `sendEntityDespawn(entityId): void`

Despawn a networked entity.

##### `sendChatMessage(message): void`

Send a chat message.

##### `connected(): boolean`

Check if connected.

##### `getClientId(): string | null`

Get assigned client ID.

##### `getStats(): object`

Get connection statistics.

### WebSocketClient

Low-level WebSocket client with auto-reconnect.

#### Constructor

```typescript
constructor(config: WebSocketClientConfig)
```

**Parameters:**
- `config.presenceUrl` - WebSocket URL
- `config.roomId` - Room ID
- `config.userId` - User ID
- `config.displayName` - Display name
- `config.authToken` - Optional auth token

#### Features

- **Auto-reconnect** - Automatically reconnects with exponential backoff
- **Binary messages** - Handles both binary and text messages
- **Connection tracking** - Monitors connection state

### NetworkSystem

ECS system for entity synchronization.

#### Constructor

```typescript
constructor(networkClient: NetworkClient)
```

#### Methods

##### `createNetworkedEntity(templateId, position, components): Entity`

Create a new networked entity.

##### `getLocalEntityId(networkId): string | undefined`

Convert network ID to local entity ID.

##### `getNetworkId(entityId): string | undefined`

Convert local entity ID to network ID.

### NetworkSyncComponent

ECS component for networked entities.

```typescript
import { NetworkSyncComponent } from '@graphwiz-xr/hub-client/network';

const sync = new NetworkSyncComponent({
  networkId: 'entity-123',
  isOwner: true,
  syncRate: 30, // 30 updates per second
  interpolate: true,
  extrapolate: false,
});
```

**Options:**
- `networkId` - Unique network ID
- `isOwner` - Whether this client owns the entity
- `syncRate` - Updates per second
- `interpolate` - Enable position interpolation
- `extrapolate` - Enable position extrapolation

## Message Protocol

### Message Types

```typescript
enum MessageType {
  // Connection
  CLIENT_HELLO = 1,
  SERVER_HELLO = 2,

  // Real-time
  POSITION_UPDATE = 10,
  VOICE_DATA = 11,

  // Entity management
  ENTITY_SPAWN = 20,
  ENTITY_UPDATE = 21,
  ENTITY_DESPAWN = 22,

  // Communication
  CHAT_MESSAGE = 30,

  // Presence
  PRESENCE_JOIN = 40,
  PRESENCE_LEAVE = 41,
  PRESENCE_UPDATE = 42,
}
```

### Message Format

```typescript
interface Message {
  messageId: string;
  timestamp: number;
  type: MessageType;
  payload: any;
}
```

Messages are serialized in binary format:
```
[messageIdLength:1][messageId:var][timestamp:8][type:1][payload:var]
```

## React Integration

For React applications, use the networking hook:

```typescript
import { createNetworkingHook } from '@graphwiz-xr/hub-client/networking/example';

function GameRoom() {
  const { connected, clientId, sendPosition, onMessage } = createNetworkingHook({
    presenceUrl: 'ws://localhost:4002',
    sfuUrl: 'ws://localhost:4003',
    roomId: 'my-room',
    authToken: userToken,
    userId: userId,
    displayName: userName,
  })();

  useEffect(() => {
    const unsubscribe = onMessage(MessageType.CHAT_MESSAGE, (message) => {
      const chat = message.payload;
      addChatMessage(chat.fromClientId, chat.message);
    });

    return unsubscribe;
  }, [onMessage]);

  if (!connected) return <div>Connecting...</div>;

  return <div>Connected as {clientId}</div>;
}
```

## Performance Considerations

### Sync Rate

Position updates are sent at the configured `syncRate`:
- 30 Hz = 33ms between updates (default)
- 60 Hz = 16ms between updates (smoother, more bandwidth)

Choose based on your needs:
- Fast-paced games: 60 Hz
- Social VR: 30 Hz
- Slow-paced: 15-20 Hz

### Interpolation

Enable interpolation for remote entities to smooth movement:

```typescript
const sync = new NetworkSyncComponent({
  networkId: 'remote-entity',
  isOwner: false,
  syncRate: 30,
  interpolate: true, // Smooth movement
  extrapolate: false,
});
```

### Message Size

Binary serialization keeps messages small:
- Position update: ~60 bytes
- Chat message: ~100 + message length
- Entity spawn: ~200 + components

## Examples

See `example.ts` for complete examples:
- Basic networking setup
- Position synchronization
- Chat messaging
- Connection event handling
- React integration

## Testing

```bash
cd packages/clients/hub-client
npm test
```

## Troubleshooting

### Connection Fails

1. Check presence service is running: `make dev-presence`
2. Verify URL: `ws://localhost:4002` (not `http://`)
3. Check browser console for errors
4. Verify room ID is valid

### No Messages Received

1. Check message handlers are registered before connecting
2. Verify message type enum matches
3. Add logging to message handlers

### Entity Not Syncing

1. Ensure entity has `NetworkSyncComponent`
2. Check `isOwner` is set correctly
3. Verify `syncRate` > 0
4. Check entity has `TransformComponent`

## Future Enhancements

- [ ] WebTransport support (HTTP/3)
- [ ] Voice chat integration with SFU
- [ ] Video streaming
- [ ] Entity component replication
- [ ] Message compression
- [ ] Lag compensation
- [ ] Client-side prediction

## License

MIT
