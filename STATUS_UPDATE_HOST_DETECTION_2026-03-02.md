# Host Detection Feature Status Update

**Date:** 2026-03-02  
**Feature:** First-Joiner-As-Host Detection

---

## Overview

This document summarizes the implementation of automatic host detection with a first-joiner-as-host pattern. The feature ensures that when multiple users join a room simultaneously, one client is automatically designated as the host for moderation purposes.

---

## 1. What Was Implemented

The host detection feature provides:

- **Automatic host assignment:** The first client to join a room is automatically designated as the host
- **Persistent host role:** Host status persists for the session (until room is empty)
- **Frontend host detection:** Clients can determine if they are the host via `isCurrentUserHost`
- **Moderation control integration:** ModerationPanel only shows lock/unlock controls to the host
- **Backend-hosted state:** Room host state is maintained server-side in the SessionManager

### Design Principles

- **Simple election:** First client wins, no complex election protocol
- **Fail-safe:** If host leaves, the next joiner becomes host (no automatic re-election on quit)
- **Minimal overhead:** Single HashMap lookup per room, no extra network messages
- **Deterministic:** Same client always becomes host if first to join

---

## 2. Backend Changes in `session.rs`

Located at: `packages/services/reticulum/presence/src/session.rs`

### New Data Structure (Line 24)

```rust
room_hosts: Arc<RwLock<HashMap<String, Option<String>>>>, // room_id -> host_client_id
```

- Maps each room to its current host's client ID
- `Option<String>` allows `None` for empty rooms

### Initialization (Lines 110, 135)

```rust
room_hosts: Arc::new(RwLock::new(HashMap::new())),
```

Added to both `SessionManager::new()` and `SessionManager::with_config()`

### Host Assignment Logic (Lines 374-382)

```rust
/// Assign host to room if not already assigned (first joiner becomes host)
async fn assign_host_if_needed(&self, room_id: &str, client_id: &str) {
    let mut room_hosts = self.room_hosts.write().await;
    let existing = room_hosts.entry(room_id.to_string()).or_insert(None);
    if existing.is_none() {
        *existing = Some(client_id.to_string());
        log::info!("Client {} is now the host of room {}", client_id, room_id);
    }
}
```

- Called from `register_session()` when session has a `room_id`
- Uses `or_insert(None)` to set host only once
- Logs assignment for operational visibility

### Host Retrieval API (Lines 384-388)

```rust
/// Get the host client ID for a room
pub async fn get_room_host(&self, room_id: &str) -> Option<String> {
    let room_hosts = self.room_hosts.read().await;
    room_hosts.get(room_id).cloned().flatten()
}
```

- Async read-only access to host info
- Returns `Option<String>` (None if room is empty)

### Integration in Session Registration (Line 162)

```rust
self.assign_host_if_needed(&room_id, &session.client_id).await;
```

Triggered during `register_session()` after adding client to `room_sessions`

---

## 3. Frontend Changes in `App.tsx`

Located at: `packages/clients/hub-client/src/App.tsx`

### State Declarations (Lines 127-128)

```typescript
const [myClientId, setMyClientId] = useState<string | null>(null);
const [hostClientId, setHostClientId] = useState<string | null>(null);
```

- `myClientId`: The current client's unique ID
- `hostClientId`: The host's client ID (assigned by backend)

### Host Assignment from Backend (Lines 243-258)

```typescript
const unsubscribePresence = wsClient.current.on(MessageType.PRESENCE_JOIN, (message: any) => {
  if (message.payload) {
    // Extract host_client_id if provided by backend (first-joiner-as-host)
    if (message.payload.host_client_id) {
      setHostClientId(message.payload.host_client_id);
      console.log('[App] Host assigned:', message.payload.host_client_id);
    }
    // ... rest of presence event handling
  }
});
```

- Listens for `PRESENCE_JOIN` message from backend
- Reads `host_client_id` from payload
- Updates `hostClientId` state when assigned

### Host Status Computation (Lines 494-496)

```typescript
// Determine if current user is host
const isCurrentUserHost = myClientId === hostClientId;
console.log(
  '[App] Host status:',
  isCurrentUserHost,
  '(myId:',
  myClientId,
  '| hostId:',
  hostClientId + ')'
);
```

- Compares `myClientId` with `hostClientId`
- Provides boolean for UI components
- Logged for debugging

### Integration with ModerationPanel

The `isCurrentUserHost` value is passed to the ModerationPanel component (see Section 4):

```tsx
<ModerationPanel
  roomId={roomId}
  presenceUrl={presenceUrl}
  currentClientId={myClientId}
  isCurrentUserHost={isCurrentUserHost}
  players={playerList}
  onRoomLocked={(locked) => {
    /* handle */
  }}
  onPlayerKicked={(playerId) => {
    /* handle */
  }}
  onPlayerMuted={(playerId, muted) => {
    /* handle */
  }}
/>
```

---

## 4. How the Feature Works: First-Joiner-As-Host Pattern

### Flow Diagram

```
Client A joins room
    ↓
Backend SessionManager.register_session()
    ↓
assign_host_if_needed("room1", "client_a_id")
    ↓
room_hosts["room1"] = Some("client_a_id")
    ↓
Backend sends PRESENCE_JOIN to Client A
    ↓
    payload: { host_client_id: "client_a_id" }
    ↓
Client A sets hostClientId = "client_a_id"
    ↓
isCurrentUserHost = (myClientId === hostClientId) = true
    ↓
ModerationPanel shows lock button to Client A
```

### Sequence for Multiple Clients

```
1. Client A joins → Becomes host (hostClientId = A)
2. Client B joins → Receives host info from backend → isCurrentUserHost = false
3. Client C joins → Receives host info from backend → isCurrentUserHost = false
4. Client A disconnects → Host remains A (no automatic re-election)
5. Client D joins → Host already exists → isCurrentUserHost = false
6. All clients leave → room_hosts["room1"] = None (cleared on session cleanup)
7. New client joins → Becomes new host
```

### Backend Logic

1. **Room entry:** When `ClientSession` is registered with a `room_id`:
   - Call `assign_host_if_needed(room_id, client_id)`
2. **Host election:**
   - If `room_hosts[room_id]` is `None`, set to `Some(client_id)`
   - If already set, no changes (first joiner retains role)
3. **Response:** Include `host_client_id` in `PRESENCE_JOIN` message

### Frontend Logic

1. **Connection:** Client receives `PRESENCE_JOIN` message
2. **Assignment:** Extract `host_client_id` from payload
3. **Comparison:** `isCurrentUserHost = (myClientId === hostClientId)`
4. **UI rendering:** ModerationPanel conditionally renders host controls

### Persistence

- Host state is server-side in `SessionManager.room_hosts`
- Persists for the duration of the session
- Cleared when all clients disconnect (HashMap cleanup in `unregister_session`)
- No automatic re-election if host leaves (manual or automatic host change via admin tools may be added later)

---

## 5. Integration with ModerationPanel

Located at: `packages/clients/hub-client/src/components/ModerationPanel.tsx`

### Props Interface (Lines 7-16)

```typescript
export interface ModerationPanelProps {
  roomId: string;
  presenceUrl: string;
  currentClientId: string | null;
  isCurrentUserHost: boolean;
  players: PlayerInfo[];
  onRoomLocked?: (locked: boolean) => void;
  onPlayerKicked?: (playerId: string) => void;
  onPlayerMuted?: (playerId: string, muted: boolean) => void;
}
```

### Host-Only Controls (Lines 94-112)

```tsx
<div className="moderation-actions">
  {/* Room Lock Toggle - Host Only */}
  {isCurrentUserHost && (
    <button
      onClick={handleToggleLock}
      disabled={locking}
      className={`lock-button ${isLocked ? 'locked' : ''}`}
      title={isLocked ? 'Unlock room' : 'Lock room'}
    >
      {locking ? (
        <span className="loading-spinner" />
      ) : (
        <>
          <span className="lock-icon">{isLocked ? '🔓' : '🔒'}</span>
          <span className="lock-text">{isLocked ? 'Locked' : 'Lock'}</span>
        </>
      )}
    </button>
  )}
  {/* ... */}
</div>
```

### Lock Handler (Lines 35-75)

```typescript
const handleToggleLock = async () => {
  if (!isCurrentUserHost) {
    alert('Only the host can lock/unlock the room');
    return;
  }

  if (!currentClientId) {
    alert('Not connected to room');
    return;
  }

  const newState = !isLocked;
  const action = newState ? 'lock' : 'unlock';

  if (!confirm(`Are you sure you want to ${action} the room?`)) {
    return;
  }

  setLocking(true);

  if (moderationClient) {
    const reason = prompt(`Reason for ${action}ing room? (Optional)`) || `${action}ed by host`;

    const result = await moderationClient.lockRoom({
      roomId,
      locked: newState,
      lockedByClientId: currentClientId,
      reason
    });

    setLocking(false);

    if (result.success) {
      setIsLocked(newState);
      onRoomLocked?.(newState);
      alert(`Room has been ${action}ed`);
    } else {
      alert(`Failed to ${action} room: ${result.message}`);
    }
  }
};
```

### UI Behavior

| User Role                                | Lock Button | Player List | Locked Banner             |
| ---------------------------------------- | ----------- | ----------- | ------------------------- |
| Host (`isCurrentUserHost === true`)      | ✅ Visible  | ✅ Visible  | ✅ Shows when room locked |
| Non-Host (`isCurrentUserHost === false`) | ❌ Hidden   | ✅ Visible  | ✅ Shows if room locked   |

### Error Prevention

```typescript
if (!isCurrentUserHost) {
  alert('Only the host can lock/unlock the room');
  return;
}
```

- Client-side guard prevents non-hosts from attempting moderation actions
- Server-side validation in presence service provides additional safety

---

## Implementation Summary

| Component                             | Status      | Notes                                    |
| ------------------------------------- | ----------- | ---------------------------------------- |
| Backend: `room_hosts` tracking        | ✅ Complete | HashMap in SessionManager                |
| Backend: Host assignment logic        | ✅ Complete | First joiner wins                        |
| Backend: Host retrieval API           | ✅ Complete | `get_room_host()` method                 |
| Frontend: Host state                  | ✅ Complete | `hostClientId` state in App.tsx          |
| Frontend: Host detection              | ✅ Complete | `isCurrentUserHost` computed             |
| Frontend: ModerationPanel integration | ✅ Complete | Conditional rendering                    |
| ModerationPanel: Host-only controls   | ✅ Complete | Lock button gated by `isCurrentUserHost` |

---

## Testing Recommendations

1. **Single client join:** Verify host assignment on first join
2. **Multi-client join:** Join with two clients, verify first is host
3. **Disconnect test:** Have host disconnect, verify no automatic re-election
4. **Moderation test:** Non-host attempts lock, verify blocked with alert
5. **Persistence test:** Refresh page, verify host state resets (client-side only)

---

## Future Enhancements (Out of Scope)

- Automatic host re-election when host disconnects
- Host transfer mechanism (currently host cannot be changed)
- Multiple host roles (co-hosts)
- Host election voting protocol
- Server-side persistence of host role across room close/reopen

---

**Document Owner:** Tobias  
**Last Updated:** 2026-03-02  
**Related Files:**

- `packages/services/reticulum/presence/src/session.rs`
- `packages/clients/hub-client/src/App.tsx`
- `packages/clients/hub-client/src/components/ModerationPanel.tsx`
