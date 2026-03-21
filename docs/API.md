# GraphWiz-XR API Documentation

**Version:** 0.2.0  
**Base URL:** `https://your-domain.com/api`  
**Protocol:** REST + WebSocket + WebTransport

---

## Table of Contents

1. [Authentication](#authentication)
2. [Hub Service](#hub-service)
3. [Presence Service](#presence-service)
4. [Storage Service](#storage-service)
5. [SFU Service](#sfu-service)
6. [Avatar Service](#avatar-service)
7. [WebSocket Protocol](#websocket-protocol)
8. [Error Handling](#error-handling)

---

## Authentication

### Base URL

```
/auth/api/v1
```

### Endpoints

#### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "display_name": "John Doe"
}
```

**Response (201 Created):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "John Doe",
  "created_at": "2026-01-01T00:00:00Z"
}
```

#### POST /auth/login

Authenticate and receive JWT tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 86400,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "John Doe"
  }
}
```

#### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 86400
}
```

#### POST /auth/magic-link

Request a magic link for passwordless login.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "message": "If the email exists, a magic link has been sent"
}
```

#### POST /auth/magic-link/verify

Verify magic link token.

**Request Body:**

```json
{
  "token": "magic-link-token"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 86400
}
```

#### GET /auth/oauth/{provider}

Initiate OAuth login flow.

**Providers:** `github`, `google`, `discord`

**Response:** Redirects to OAuth provider

#### GET /auth/oauth/{provider}/callback

OAuth callback endpoint.

**Response:** Redirects to frontend with tokens in URL fragment

#### POST /auth/logout

Logout and invalidate tokens.

**Headers:** `Authorization: Bearer {access_token}`

**Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

#### GET /auth/me

Get current authenticated user.

**Headers:** `Authorization: Bearer {access_token}`

**Response (200 OK):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "John Doe",
  "roles": ["user"],
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

## Hub Service

### Base URL

```
/hub/api/v1
```

### Endpoints

#### POST /hub/rooms

Create a new room.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "name": "My Room",
  "description": "A virtual meeting space",
  "max_users": 50,
  "scene_url": "https://example.com/scene.glb",
  "settings": {
    "allow_voice": true,
    "allow_video": true,
    "allow_drawing": true
  }
}
```

**Response (201 Created):**

```json
{
  "id": "room-uuid",
  "name": "My Room",
  "description": "A virtual meeting space",
  "owner_id": "user-uuid",
  "max_users": 50,
  "scene_url": "https://example.com/scene.glb",
  "created_at": "2026-01-01T00:00:00Z"
}
```

#### GET /hub/rooms

List all public rooms.

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` (optional)

**Response (200 OK):**

```json
{
  "rooms": [
    {
      "id": "room-uuid",
      "name": "My Room",
      "description": "A virtual meeting space",
      "user_count": 5,
      "max_users": 50,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### GET /hub/rooms/{room_id}

Get room details.

**Response (200 OK):**

```json
{
  "id": "room-uuid",
  "name": "My Room",
  "description": "A virtual meeting space",
  "owner_id": "user-uuid",
  "max_users": 50,
  "scene_url": "https://example.com/scene.glb",
  "settings": {
    "allow_voice": true,
    "allow_video": true,
    "allow_drawing": true
  },
  "user_count": 5,
  "created_at": "2026-01-01T00:00:00Z"
}
```

#### PUT /hub/rooms/{room_id}

Update room settings.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "name": "Updated Room Name",
  "description": "New description",
  "max_users": 100
}
```

#### DELETE /hub/rooms/{room_id}

Delete a room.

**Headers:** `Authorization: Bearer {token}`

#### GET /hub/rooms/{room_id}/entities

Get all entities in a room.

**Response (200 OK):**

```json
{
  "entities": [
    {
      "id": "entity-uuid",
      "room_id": "room-uuid",
      "entity_type": "object",
      "position": { "x": 0, "y": 1, "z": 0 },
      "rotation": { "x": 0, "y": 0, "z": 0, "w": 1 },
      "scale": { "x": 1, "y": 1, "z": 1 },
      "components": {
        "model": { "url": "https://example.com/model.glb" },
        "interactable": { "type": "grab" }
      }
    }
  ]
}
```

#### POST /hub/rooms/{room_id}/entities

Spawn a new entity in a room.

**Request Body:**

```json
{
  "entity_type": "object",
  "position": { "x": 0, "y": 1, "z": 0 },
  "rotation": { "x": 0, "y": 0, "z": 0, "w": 1 },
  "components": {
    "model": { "url": "https://example.com/model.glb" },
    "interactable": { "type": "grab" }
  }
}
```

#### PUT /hub/entities/{entity_id}

Update entity state.

**Request Body:**

```json
{
  "position": { "x": 1, "y": 1, "z": 1 },
  "rotation": { "x": 0, "y": 0.707, "z": 0, "w": 0.707 }
}
```

#### DELETE /hub/entities/{entity_id}

Delete an entity.

---

## Presence Service

### Base URL

```
/presence/api/v1
```

### WebSocket Connection

```
ws://your-domain.com/presence/ws?room_id={room_id}&token={jwt_token}
```

### REST Endpoints

#### GET /presence/health

Health check endpoint.

**Response (200 OK):**

```json
{
  "status": "healthy",
  "connections": 42,
  "rooms": 10
}
```

#### GET /presence/rooms/{room_id}/users

Get users currently in a room.

**Response (200 OK):**

```json
{
  "users": [
    {
      "id": "user-uuid",
      "display_name": "John Doe",
      "joined_at": "2026-01-01T00:00:00Z",
      "is_muted": false,
      "position": { "x": 0, "y": 0, "z": 0 }
    }
  ],
  "count": 5
}
```

---

## Storage Service

### Base URL

```
/storage/api/v1
```

### Endpoints

#### POST /storage/upload

Upload a file.

**Headers:**

- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Request Body (multipart):**

- `file`: Binary file data
- `name`: Display name
- `type`: Asset type (model, texture, audio, video)

**Response (201 Created):**

```json
{
  "id": "asset-uuid",
  "name": "My Model",
  "type": "model",
  "mime_type": "model/gltf-binary",
  "size": 1024000,
  "url": "/storage/assets/asset-uuid/download",
  "thumbnail_url": "/storage/assets/asset-uuid/thumbnail",
  "uploaded_at": "2026-01-01T00:00:00Z"
}
```

#### POST /storage/upload/chunked

Start a chunked upload session (for files >50MB).

**Request Body:**

```json
{
  "name": "Large Model",
  "type": "model",
  "total_size": 104857600,
  "chunk_size": 5242880
}
```

**Response (200 OK):**

```json
{
  "upload_id": "upload-session-id",
  "chunk_size": 5242880,
  "total_chunks": 20
}
```

#### PUT /storage/upload/chunked/{upload_id}/{chunk_index}

Upload a chunk.

**Headers:** `Content-Type: application/octet-stream`

**Request Body:** Raw binary chunk data

**Response (200 OK):**

```json
{
  "chunk_index": 0,
  "received": true
}
```

#### POST /storage/upload/chunked/{upload_id}/complete

Complete a chunked upload.

**Response (201 Created):**

```json
{
  "id": "asset-uuid",
  "name": "Large Model",
  "url": "/storage/assets/asset-uuid/download"
}
```

#### GET /storage/assets

List assets with pagination.

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 20)
- `type` (filter by type)
- `search` (search by name)

**Response (200 OK):**

```json
{
  "assets": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### GET /storage/assets/{asset_id}

Get asset metadata.

#### GET /storage/assets/{asset_id}/download

Download asset file.

#### DELETE /storage/assets/{asset_id}

Delete an asset.

---

## SFU Service

### Base URL

```
/sfu/api/v1
```

### Endpoints

#### POST /sfu/rooms

Create an SFU room for video/audio.

**Request Body:**

```json
{
  "room_id": "hub-room-uuid",
  "max_peers": 50
}
```

#### POST /sfu/rooms/{room_id}/join

Join an SFU room and get WebRTC configuration.

**Response (200 OK):**

```json
{
  "peer_id": "peer-uuid",
  "ice_servers": [{ "urls": "stun:stun.l.google.com:19302" }],
  "simulcast_layers": [
    { "rid": "f", "maxBitrate": 3000000, "scaleResolutionDownBy": 1 },
    { "rid": "h", "maxBitrate": 1500000, "scaleResolutionDownBy": 2 },
    { "rid": "q", "maxBitrate": 300000, "scaleResolutionDownBy": 4 }
  ]
}
```

#### POST /sfu/rooms/{room_id}/offer

Submit WebRTC offer.

**Request Body:**

```json
{
  "peer_id": "peer-uuid",
  "sdp": "v=0\r\no=- 4611731400430051336 2 IN IP4 127.0.0.1..."
}
```

**Response (200 OK):**

```json
{
  "sdp": "v=0\r\no=- 4611731400430051336 2 IN IP4 127.0.0.1...",
  "type": "answer"
}
```

#### POST /sfu/rooms/{room_id}/ice

Submit ICE candidate.

**Request Body:**

```json
{
  "peer_id": "peer-uuid",
  "candidate": {
    "candidate": "candidate:842163049 1 udp...",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  }
}
```

#### POST /sfu/rooms/{room_id}/leave

Leave SFU room.

---

## Avatar Service

### Base URL

```
/avatar/api/v1
```

### Endpoints

#### GET /avatar/me

Get current user's avatar configuration.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**

```json
{
  "id": "avatar-uuid",
  "user_id": "user-uuid",
  "body_type": "human",
  "primary_color": "#4A90D9",
  "secondary_color": "#2C5282",
  "height": 1.75,
  "custom_model_url": null,
  "accessories": ["hat", "glasses"],
  "updated_at": "2026-01-01T00:00:00Z"
}
```

#### PUT /avatar/me

Update avatar configuration.

**Request Body:**

```json
{
  "body_type": "robot",
  "primary_color": "#FF5733",
  "secondary_color": "#C70039",
  "height": 2.0,
  "accessories": ["cape"]
}
```

#### POST /avatar/custom

Upload custom avatar model.

**Headers:** `Content-Type: multipart/form-data`

**Request Body:**

- `file`: GLB file (max 10MB)
- `animations`: Optional animation mappings

---

## WebSocket Protocol

### Message Format

All WebSocket messages use the following format:

```typescript
interface WebSocketMessage {
  type: MessageType;
  payload: unknown;
  timestamp: number;
}

enum MessageType {
  // Connection
  PING = 0,
  PONG = 1,

  // Room
  ROOM_JOIN = 10,
  ROOM_LEAVE = 11,
  USER_JOINED = 12,
  USER_LEFT = 13,

  // Entity
  ENTITY_SPAWN = 20,
  ENTITY_UPDATE = 21,
  ENTITY_DELETE = 22,

  // Avatar
  AVATAR_UPDATE = 30,
  AVATAR_ANIMATION = 31,

  // Chat
  CHAT_MESSAGE = 40,
  EMOJI_REACTION = 41,

  // Media
  MEDIA_PLAY = 50,
  MEDIA_PAUSE = 51,
  MEDIA_SEEK = 52,

  // Moderation
  USER_KICKED = 60,
  USER_MUTED = 61,
  ROOM_LOCKED = 62
}
```

### Entity Update Example

```json
{
  "type": 21,
  "payload": {
    "entity_id": "entity-uuid",
    "position": { "x": 1.5, "y": 0, "z": -2.0 },
    "rotation": { "x": 0, "y": 0.707, "z": 0, "w": 0.707 },
    "state": {
      "active": true,
      "collected": false
    }
  },
  "timestamp": 1704067200000
}
```

### Chat Message Example

```json
{
  "type": 40,
  "payload": {
    "id": "message-uuid",
    "user_id": "user-uuid",
    "display_name": "John Doe",
    "content": "Hello everyone!",
    "room_id": "room-uuid"
  },
  "timestamp": 1704067200000
}
```

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### HTTP Status Codes

| Status | Description                              |
| ------ | ---------------------------------------- |
| 200    | Success                                  |
| 201    | Created                                  |
| 204    | No Content (successful deletion)         |
| 400    | Bad Request - Invalid input              |
| 401    | Unauthorized - Missing or invalid token  |
| 403    | Forbidden - Insufficient permissions     |
| 404    | Not Found                                |
| 409    | Conflict - Resource already exists       |
| 413    | Payload Too Large - File size exceeded   |
| 422    | Unprocessable Entity - Validation failed |
| 429    | Too Many Requests - Rate limited         |
| 500    | Internal Server Error                    |
| 503    | Service Unavailable                      |

### Error Codes

| Code                       | Description                       |
| -------------------------- | --------------------------------- |
| `VALIDATION_ERROR`         | Input validation failed           |
| `AUTH_INVALID_TOKEN`       | JWT token is invalid or expired   |
| `AUTH_INVALID_CREDENTIALS` | Email or password incorrect       |
| `AUTH_USER_EXISTS`         | User already exists               |
| `ROOM_NOT_FOUND`           | Room does not exist               |
| `ROOM_FULL`                | Room has reached maximum capacity |
| `ENTITY_NOT_FOUND`         | Entity does not exist             |
| `ASSET_NOT_FOUND`          | Asset does not exist              |
| `PERMISSION_DENIED`        | User lacks required permissions   |
| `RATE_LIMITED`             | Too many requests                 |

---

## Rate Limiting

All endpoints are rate-limited:

| Endpoint Category   | Limit               |
| ------------------- | ------------------- |
| Authentication      | 10 requests/minute  |
| API (authenticated) | 100 requests/minute |
| WebSocket messages  | 30 messages/second  |
| File uploads        | 10 uploads/minute   |

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067260
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { GraphWizClient } from '@graphwiz-xr/client';

const client = new GraphWizClient({
  apiUrl: 'https://your-domain.com/api',
  wsUrl: 'wss://your-domain.com/presence/ws'
});

// Login
const { user, accessToken } = await client.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Join room
const room = await client.hub.joinRoom('room-uuid');

// Connect WebSocket
await client.presence.connect(room.id, accessToken);

// Listen for events
client.presence.on('user_joined', (user) => {
  console.log(`${user.display_name} joined`);
});

// Update position
client.presence.updatePosition({
  x: 1.0,
  y: 0,
  z: -2.0
});

// Send chat message
await client.chat.send('Hello everyone!');
```

---

**Last Updated:** 2026-03-15
