# Multiplayer Connection Testing Guide

## Overview
This guide provides step-by-step instructions for testing the multiplayer functionality in GraphWiz-XR after critical WebSocket fixes.

## Recent Fixes Deployed (2026-01-04)

### 1. WebSocket Keep-Alive Mechanism
- **Problem**: WebSocket connections were dropping after ~2 minutes due to inactivity
- **Solution**: Added ping/pong keep-alive mechanism that sends a JSON ping message every 30 seconds
- **Location**: `packages/clients/hub-client/src/network/websocket-client.ts:460-493`
- **Message Type**: Custom ping type 255 (outside normal protocol range)

### 2. Movement Loop Stability Fix
- **Problem**: Multiple "Starting movement loop..." messages were appearing, causing performance issues
- **Solution**: Changed useEffect dependencies from `[connected, client, playerRotation]` to `[connected, client, myClientId]`
- **Location**: `packages/clients/hub-client/src/App.tsx:595`
- **Effect**: Prevents re-creation of the movement interval on every player rotation

## Testing Checklist

### Pre-Test Verification

1. **Services Status**
   ```bash
   docker ps --filter name=graphwiz
   ```
   Expected: All services should be "Up" and healthy

2. **Presence Service Logs**
   ```bash
   docker logs graphwiz-presence --tail 50 -f
   ```
   Expected: No errors, accepting WebSocket connections

### Test Scenario 1: Single Connection Stability

**Objective**: Verify WebSocket connection stays alive without disconnecting

1. Open browser to https://xr.graphwiz.ai
2. Open Browser Console (F12)
3. Watch for these console messages:
   - ✅ `[WebSocketClient] WebSocket connected`
   - ✅ `[WebSocketClient] Sent message type: 1` (CLIENT_HELLO)
   - ✅ `[WebSocketClient] Received message type: 2` (SERVER_HELLO)
   - ✅ `Starting movement loop...` (should appear exactly ONCE)

4. **Wait 5 minutes** and verify:
   - ❌ NO `[WebSocketClient] WebSocket disconnected` messages
   - ❌ NO reconnection attempts
   - ✅ Connection remains stable

**Success Criteria**:
- Only one "Starting movement loop" message
- No disconnections after 5+ minutes
- Smooth player movement and rotation

### Test Scenario 2: Multiplayer Avatar Synchronization

**Objective**: Verify two clients can see each other's avatars

1. **Open Browser Window 1**:
   - Navigate to https://xr.graphwiz.ai
   - Open Console (F12)
   - Note the client ID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

2. **Open Browser Window 2** (Incognito/Private window):
   - Navigate to https://xr.graphwiz.ai
   - Open Console (F12)
   - Note this client ID (should be different)

3. **Verify in Console Window 1**:
   - ✅ `[PresenceService] New client joined: <client-id-2>`
   - ✅ `[EntityRenderer] Spawning entity: client-<client-id-2>`

4. **Verify in Console Window 2**:
   - ✅ `[PresenceService] New client joined: <client-id-1>`
   - ✅ `[EntityRenderer] Spawning entity: client-<client-id-1>`

5. **Visual Verification**:
   - Both windows should show a second avatar
   - Avatars should appear at position (0, 0, 0) initially

6. **Movement Test**:
   - Use WASD keys in Window 1 to move
   - Verify in Window 2 that the other avatar moves smoothly
   - Movement should update at ~20Hz (every 50ms)

**Success Criteria**:
- Both clients detect each other's presence
- Avatars appear in both windows
- Movement is synchronized in real-time

### Test Scenario 3: Connection Recovery

**Objective**: Verify graceful reconnection after network interruption

1. Start with two browser windows connected
2. **In Window 1**: Disable network (Chrome DevTools → Network → Offline)
3. Wait 10 seconds
4. Re-enable network (Online)
5. Verify in Console Window 1:
   - ✅ `[WebSocketClient] WebSocket disconnected: 1006`
   - ✅ `[WebSocketClient] Reconnecting in 1000ms...`
   - ✅ `[WebSocketClient] WebSocket connected` (reconnection successful)
6. Verify both windows can still see each other

**Success Criteria**:
- Automatic reconnection attempt
- Successful reconnection within reasonable time
- Avatar synchronization restored after reconnection

## Console Log Patterns

### Expected Logs (Healthy Connection)

```
[WebSocketClient] Connecting to: wss://xr.graphwiz.ai/ws/lobby?...
[WebSocketClient] WebSocket connected
[WebSocketClient] Sent message type: 1
[WebSocketClient] Received message type: 2
[PresenceService] Client ID: <client-id>
Starting movement loop...
[EntityRenderer] Spawning entity: client-<client-id>
```

### Warning Signs (Issues Detected)

```
❌ Multiple "Starting movement loop..." messages (indicates dependency issue)
❌ "[WebSocketClient] WebSocket disconnected: 1006" (connection drop)
❌ "Failed to send ping: ..." (keep-alive failing)
❌ No avatar appearing in other window (spawn/update issue)
```

## Performance Metrics

### FPS Counter (Top-left overlay)

Good performance indicators:
- ✅ **55+ FPS** (Green) - Excellent
- ✅ **30-54 FPS** (Yellow) - Acceptable
- ❌ **< 30 FPS** (Red) - Performance issue

### Network Metrics

- **Position Update Rate**: ~20Hz (every 50ms)
- **Ping Interval**: Every 30 seconds
- **Message Size**: ~163 bytes for position updates

## Troubleshooting

### Issue: WebSocket disconnects frequently

**Diagnosis**:
```bash
docker logs graphwiz-presence --tail 100 | grep "disconnected"
```

**Solutions**:
1. Check if keep-alive is working (search for "ping" in console)
2. Verify Cloudflare/infrastructure isn't dropping idle connections
3. Check network stability

### Issue: Second avatar doesn't appear

**Diagnosis**:
```bash
# Check presence service is broadcasting to both clients
docker logs graphwiz-presence --tail 50 | grep "Broadcasting"
```

**Solutions**:
1. Verify both clients are in the same room (lobby)
2. Check browser console for ENTITY_SPAWN messages
3. Verify avatar configuration is being sent

### Issue: Movement is jerky/laggy

**Diagnosis**:
- Check FPS counter (should be 55+)
- Monitor network tab for WebSocket message timing

**Solutions**:
1. Check if position interpolation is working
2. Verify 20Hz update rate in console
3. Check for high latency in network tab

## Automated Testing (Optional)

For automated testing, you can use the Playwright configuration:

```bash
# Run multiplayer debug tests
pnpm --filter @graphwiz/hub-client test:multiplayer
```

Test file: `packages/clients/hub-client/multiplayer-debug.spec.ts`

## Success Criteria Summary

✅ **All tests pass** when:
1. Single connection stays alive for 5+ minutes without disconnecting
2. Multiple "Starting movement loop" messages do NOT appear
3. Two clients can see each other's avatars
4. Movement is synchronized smoothly between clients
5. FPS counter shows 55+ FPS (green)
6. Reconnection works after network interruption

## Next Steps

After successful testing:
1. Monitor production logs for any disconnect patterns
2. Collect performance metrics (FPS, latency)
3. Test with 3+ clients if needed
4. Verify avatar customization synchronization
5. Test voice chat if implemented

---

**Deployment Info**:
- Deployed: 2026-01-04 06:11 UTC
- Container: graphwiz-hub-client
- Asset Version: index-DZ7TFNDq.js
- Presence Service: Running on port 8003 (exposed as 4000)
