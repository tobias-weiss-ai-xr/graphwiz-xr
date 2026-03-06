# Avatar Visibility Issue Analysis

## Summary

**Problem:** User reports "avatar and default scene is still empty" when the app loads.

**Root Cause:** The `myClientId` state is `null` initially, and the DemoScene conditionally renders `myClientId && client`. Since both are required for the scene to render, when the page loads, `myClientId` is `null` until after the WebSocket connection completes.

## Key Findings

### 1. Connection Flow Analysis (App.tsx)

```typescript
// Line 122-126: Initial state
const [client, setClient] = useState<WebSocketClient | null>(null);
const [connected, setConnected] = useState(false);
const [connecting, setConnecting] = useState(false);
const [error, setError] = useState<string | null>(null);
const [myClientId, setMyClientId] = useState<string | null>(null); // <--- NULL INITIALLY
```

```typescript
// Lines 195-236: WebSocket connection
useEffect(() => {
  // Create WebSocketClient only if it doesn't exist
  if (!wsClient.current) {
    wsClient.current = new WebSocketClient({
      presenceUrl: 'ws://localhost:8003',
      roomId: 'lobby',
      userId: userId.current,  // Randomly generated
      displayName: displayName.current  // Randomly generated
    });

    setClient(wsClient.current);
    setConnecting(true);

    // Connect to server
    wsClient.current
      ?.connect()
      .then(() => {
        setConnected(true);
        setConnecting(false);
        const clientId = wsClient.current?.getClientId();
        console.log('[App] Client ID:', clientId);
        if (clientId) {
          setMyClientId(clientId);  // <--- Only set AFTER connect() succeeds
        }
      })
```

**Timeline:**

1. `myClientId = null`, `connected = false`, `connecting = true`
2. WebSocket connect() called
3. `connected = true`, `connecting = false`
4. `myClientId = clientId` (after `connect()` resolves)

### 2. Scene Rendering Condition (App.tsx Lines 1419-1429)

```typescript
{/* DefaultScene */}
{client && myClientId && currentScene === 'default' && (
  <DefaultScene wsClient={client} myClientId={myClientId} />
)}
{/* Demo Scene - Shows PlayerAvatar by default when connected */}
{client && myClientId && currentScene === 'demo' && (
  <DemoScene
    myClientId={myClientId}
    displayName={displayName?.current || 'Player'}
    isMultiplayer={true}
  />
)}
```

**Issue:** Scene only renders when BOTH `client` AND `myClientId` are truthy. But `myClientId` is null until WebSocket connection completes.

### 3. DemoScene Component (DemoScene.tsx Lines 157-180)

```typescript
export function DemoScene({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  myClientId,
  displayName = 'Player',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isMultiplayer = false
}: DemoSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [5, 5, 8], fov: 60 }}
      gl={{ antialias: true }}
    >
      <SceneLighting />
      <SceneFloor />

      {/* Player Avatar - Line 174-180 */}
      <PlayerAvatar
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        displayName={displayName}
        color="#4CAF50"
      />
```

**DemoScene DOES render PlayerAvatar:** The DemoScene component has `PlayerAvatar` hardcoded at position [0,0,0], so the component itself is correct.

### 4. NetworkedAvatar Component (for remote players - App.tsx Lines 1496-1512)

```typescript
{allEntities.map((entity) =>
  entity.isPlayer ? (
    entity.avatarConfig ? (
      <NetworkedAvatar
        key={entity.id}
        position={entity.position}
        rotation={entity.rotation}
        displayName={entity.displayName || 'Unknown'}
        avatarConfig={entity.avatarConfig}
      />
    ) : (
      <PlayerAvatar
        key={entity.id}
        position={entity.position}
        rotation={entity.rotation}
        displayName={entity.displayName || 'Unknown'}
      />
    )
  ) : (
    // ...
  )
)}
```

This handles **remote** players via `NetworkedAvatar` or fallback to `PlayerAvatar`.

### 5. Avatar Persistence (App.tsx Lines 489-525)

```typescript
// Load avatar from persistence when client ID is available
useEffect(() => {
  if (!myClientId) return;  // <--- Returns early if no clientId!

  const persistence = getAvatarPersistence();
  console.log('[App] Loading avatar for user:', myClientId);

  persistence
    .loadAvatar(myClientId)
    .then((config) => {
      console.log('[App] Avatar loaded:', config);
      setLocalAvatarConfig(config);

      // Send avatar update to network AFTER connection established
      if (client && client.connected()) {
        client.sendAvatarUpdate({
          bodyType: config.body_type,
          primaryColor: config.primary_color,
          secondaryColor: config.secondary_color,
          height: config.height,
          customModelUrl: config.custom_model_id || ''
        });
        console.log('[App] Avatar config sent to network');
      }
    })
```

**Issue:** Avatar config loading waits for `myClientId` which doesn't exist until after WebSocket connects.

### 6. Entity Spawn (App.tsx Lines 323-382)

```typescript
// Handle entity spawn (create 3D avatars for other players)
const unsubscribeEntitySpawn = wsClient.current.on(MessageType.ENTITY_SPAWN, (message: any) => {
  const myId = getMyClientId();

  // Skip if it's the local player (already rendered)
  if (ownerId === myId) {
    console.log('[App] Skipping local player entity spawn (ownerId match)');
    return; // <--- Local player is skipped!
  }

  // ... spawns remote player avatar
});
```

**Important:** Entity spawn messages are only for **remote** players. The local player is NOT spawned via network message.

### 7. Avatar Spawn (App.tsx Lines 528-569)

```typescript
// Send avatar to network when connected
useEffect(() => {
  if (!connected || !client) {
    console.log('[App] Avatar spawn: not ready - connected:', connected, 'client:', !!client);
    return;  // <--- Doesn't spawn until connected
  }

  if (!localAvatarConfig) {
    console.log('[App] Avatar spawn: localAvatarConfig is null, skipping spawn');
    return;
  }

  if (!myClientId) {
    console.log('[App] Avatar spawn: myClientId is null, skipping spawn');
    return;
  }

  console.log('[App] Sending avatar config to network...');
  client.sendAvatarUpdate({...});

  // Also send ENTITY_SPAWN so other clients render our avatar
  console.log('[App] Sending ENTITY_SPAWN for local player...', myClientId);
  client.sendEntitySpawn({
    entityId: myClientId,
    templateId: 'player',
    components: {
      position: { x: playerPosition[0], y: playerPosition[1], z: playerPosition[2] },
      avatarConfig: {
        bodyType: localAvatarConfig.body_type,
        primaryColor: localAvatarConfig.primary_color,
        secondaryColor: localAvatarConfig.secondary_color,
        height: localAvatarConfig.height
      }
    }
  });
  console.log('[App] Avatar update sent to network');
}, [connected, client, localAvatarConfig, myClientId]);
```

**Local player avatar is NOT spawned locally via ECS/network.** It's rendered directly in DemoScene via the `PlayerAvatar` component.

## Root Cause Identified

### The Problem

**Three conditions must all be true for DemoScene to render:**

1. `client !== null` - Created when connection starts (true after `wsClient.current = new WebSocketClient(...)`)
2. `myClientId !== null` - Set AFTER `connect()` resolves (FALSE until then)
3. `currentScene === 'demo'` - Default value from `useState<SceneType>('demo')`

**Timeline:**

```
T0: Component mounts
    myClientId = null, connected = false, client = null

T1: useEffect runs (lines 200-486)
    wsClient.current = new WebSocketClient(...)  // Creates client
    client = wsClient.current                       // Sets client
    wsClient.current.connect()                      // Starts async

T2: connect() completes
    connected = true
    myClientId = clientId (from getClientId())
    → ONLY NOW is myClientId non-null!

T3: Scene renders
    {client && myClientId && currentScene === 'demo'}
    → Now renders!
```

**During T1-T2, the canvas shows nothing because the condition `client && myClientId` is `null && null = null` (falsy).**

### Why DemoScene Shows Avatar But It's Not Visible

**DemoScene DOES contain `PlayerAvatar`**: The component structure is correct.

**The issue is:** The entire `DemoScene` component is NOT RENDERED because of the condition `client && myClientId && currentScene === 'demo'`.

## Solutions

### Option 1: Set Initial myClientId in State (Best)

Initialize `myClientId` with the userId at component mount:

```typescript
const userId = useRef<string>(`user-${Math.floor(Math.random() * 10000)}`);
const displayName = useRef<string>(`Player-${Math.floor(Math.random() * 1000)}`);

// Initialize client ID immediately (not on connect)
const [client, setClient] = useState<WebSocketClient | null>(null);
const [connected, setConnected] = useState(false);
const [connecting, setConnecting] = useState(false);
const [error, setError] = useState<string | null>(null);
const [myClientId, setMyClientId] = useState<string | null>(userId.current); // <--- Set immediately
```

Then in connect handler:

```typescript
.wsClient.current?.connect()
  .then(() => {
    setConnected(true);
    setConnecting(false);
    const clientId = wsClient.current?.getClientId();
    console.log('[App] Connected to presence server');
    console.log('[App] Client ID:', clientId);
    // Don't change myClientId if already set
    if (clientId && clientId !== myClientId) {
      setMyClientId(clientId);
    }
  })
```

**Pros:**

- Scene renders immediately on mount
- No loading state issues
- Avatar visible from T1

**Cons:**

- `connected` state doesn't match `myClientId` immediately

### Option 2: Remove myClientId Condition from Scene (Simple)

Change scene rendering condition to only require `client`:

```typescript
{/* Demo Scene */}
{client && currentScene === 'demo' && (
  <DemoScene
    myClientId={myClientId || 'unknown'}
    displayName={displayName?.current || 'Player'}
    isMultiplayer={true}
  />
)}
```

**Pros:**

- Quick fix
- Avatar visible once client exists (T1)

**Cons:**

- Passing 'unknown' clientId during connection

### Option 3: Add Loading State with Placeholder Avatar

Show a placeholder before connection:

```typescript
{client && myClientId && currentScene === 'demo' && (
  <DemoScene ... />
)}

{!client && (
  <Canvas>
    <Text position={[0, 0, 0]}>Connecting...</Text>
  </Canvas>
)}
```

## Recommendation

**Use Option 1:** Initialize `myClientId = userId.current` at component mount. This is the cleanest because:

1. The userId is already generated in a ref (`const userId = useRef(...)`)
2. It should be the initial client ID used by the WebSocket client
3. Makes the connection state more accurate (myClientId reflects local identity immediately, connected reflects server verification)

### Implementation

1. Lines 197-198: Generate IDs
2. Lines 126: Initialize `myClientId` with `userId.current`
3. Line 227: Only update if different

## Additional Notes

- **DemoScene has PlayerAvatar working:** Lines 174-180 in DemoScene.tsx show PlayerAvatar is hardcoded and correctly rendered
- **DefaultScene does NOT have PlayerAvatar:** DefaultScene.tsx (lines 359-612) only renders interactive objects, no avatar
- **User should use 'demo' scene:** Line 162 in App.tsx shows `useState<SceneType>('demo')` as default
- **NetworkedAvatar is for remote only:** Line 1498 in App.tsx shows NetworkedAvatar renders remote players
- **Local avatar is local:** The local player avatar is NOT spawned via ECS/network, it's rendered directly in DemoScene

## Verification Steps

1. Apply Option 1 fix (initialize myClientId at mount)
2. Run app: `pnpm dev`
3. Check browser console for:
   - `[App] Client ID: user-XXXX` (should show immediately)
   - `[App] Connected to presence server`
   - No console errors
4. Verify PlayerAvatar visible at [0,0,0] in demo scene
5. Walk around with WASD keys - avatar moves

## Files to Modify

- **packages/clients/hub-client/src/App.tsx**
  - Line 126: Change initialization of `myClientId`
