# Avatar Not Rendering - Diagnosis Log

## Issue Reported
"Avatar not displaying and room seems empty when dev server runs"

## Investigation Steps Completed

### 1. App.tsx Avatar Rendering (Lines 1497-1532)
- PlayerAvatar is correctly rendered when entity.isPlayer === true
- If avatarConfig exists, NetworkedAvatar is used instead
- Rendering logic checks: entity.avatarConfig, entity.position, entity.rotation, entity.displayName

### 2. Entity Spawning Logic
- ENTITY_SPAWN message handler exists at lines 319-378
- Handles remote player spawning by creating presence events
- Skips local player (ownerId matches client ID)
- Properly extracts position and avatarConfig from message payload

### 3. WebSocket Client Initialization
- WebSocketClient constructor creates client ID at line 38
- sendClientHello() sends CLIENT_HELLO message at connection time
- getMyClientId() returns this.clientId

### 4. Presence Service Backend (Rust)
- handle_client_hello() at line 41 in protobuf.rs
- Responds with SERVER_HELLO containing:
  - server_version
  - assigned_client_id (conn_id)
  - room_id
  - initial_state: None  <-- NO ENTITY_SPAWN MESSAGE!

## ROOT CAUSE IDENTIFIED
The Presence service does NOT send a back an ENTITY_SPAWN message when a client joins!

When a client connects:
1. Client sends CLIENT_HELLO
2. Server responds with SERVER_HELLO (type 3)
3. **NO ENTITY_SPAWN is sent back**
4. Frontend waits for ENTITY_SPAWN to create the player entity
5. Player entity is never created, so PlayerAvatar never renders

## Expected Flow (Not Implemented)
After SERVER_HELLO, the Presence service should broadcast ENTITY_SPAWN to tell other clients:
- This new client has connected
- Here's their position (default spawn point)
- Here's their avatar config

## Fix Required
Either:
A) Modify Presence service to send ENTITY_SPAWN for each joining client
B) Modify App.tsx to create local player entity immediately on connection
C) Have the hub service initialize room state with player entities

## Files to Check
- packages/services/reticulum/presence/src/protobuf.rs (handle_client_hello)
- packages/services/reticulum/presence/src/handlers.rs (WebSocket connection handlers)
- docker-compose.dev.yml (ensure backend services start)

