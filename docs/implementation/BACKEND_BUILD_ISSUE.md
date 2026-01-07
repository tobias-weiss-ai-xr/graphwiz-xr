# Backend Services Build Issue - Agent Looper Path Mismatch

**Date**: 2026-01-02 08:10 CET
**Status**: ⚠️ **PENDING FIX**
**Impact**: WebSocket server not running, networked avatar sync cannot be tested

---

## Problem

The backend Rust services (presence, auth, hub, sfu) cannot be built due to a path mismatch in the agent-looper dependency.

### Error Message

```
error: failed to read `/build/packages/services/reticulum/agent-looper/rust/Cargo.toml`
No such file or directory (os error 2)
```

### Root Cause

**Directory Structure**:
```
packages/services/
├── agent-looper/          ← Actual location
│   └── rust/
│       └── Cargo.toml
└── reticulum/
    ├── auth/
    ├── hub/
    ├── presence/
    └── sfu/
```

**Cargo.toml References** (in each reticulum service):
```toml
agent-looper-client = { path = "../agent-looper/rust", optional = true }
```

When building from `packages/services/reticulum/presence/`, the path `../agent-looper/rust` resolves to:
```
packages/services/reticulum/agent-looper/rust  ❌ (doesn't exist)
```

Instead of:
```
packages/services/agent-looper/rust  ✅ (correct location)
```

---

## Solutions

### Option 1: Fix Cargo.toml Paths (Recommended)

Update all Cargo.toml files to use the correct relative path:

**Files to Update**:
- `packages/services/reticulum/auth/Cargo.toml`
- `packages/services/reticulum/hub/Cargo.toml`
- `packages/services/reticulum/presence/Cargo.toml`
- `packages/services/reticulum/sfu/Cargo.toml`

**Change From**:
```toml
agent-looper-client = { path = "../agent-looper/rust", optional = true }
```

**Change To**:
```toml
agent-looper-client = { path = "../../agent-looper/rust", optional = true }
```

**Command**:
```bash
find packages/services/reticulum -name "Cargo.toml" -exec sed -i 's|path = "../agent-looper/rust"|path = "../../agent-looper/rust"|g' {} \;
```

### Option 2: Build Without Agent Looper (Quick Fix)

The agent-looper-client is marked as `optional = true`, so we can build without it:

```bash
docker compose build --no-build-cache presence
```

But the Cargo.toml still tries to load it even as optional, so this won't work.

### Option 3: Create Symlink in Dockerfile

Add a symlink creation step to Dockerfiles after copying files:

```dockerfile
# After COPY commands
RUN ln -s /build/packages/services/agent-looper /build/packages/services/reticulum/agent-looper
```

---

## Current Status

### ✅ What's Working

1. **Frontend Implementation**: Complete
   - NetworkedAvatar component ✅
   - WebSocket client ✅
   - Avatar configurator ✅
   - Real-time sync logic ✅

2. **WebSocket URL Fix**: Applied ✅
   - Correct URL: `wss://xr.graphwiz.ai/ws/lobby`
   - No more duplicate `/ws` path
   - Deployed to production

3. **Dockerfile Updates**: Applied ✅
   - Added `COPY packages/services/agent-looper` to all service Dockerfiles

### ❌ What's Blocking

1. **Backend Services**: Cannot build
   - `presence` (WebSocket server) - REQUIRED for networked sync
   - `auth` (authentication)
   - `hub` (room/entity management)
   - `sfu` (WebRTC media)

2. **Missing Services**:
   - ✅ hub-client (running)
   - ✅ postgres (running)
   - ✅ traefik (running)
   - ❌ redis (not built)
   - ❌ All Rust backend services (build failing)

---

## Testing Networked Avatar Sync

### Current State

**Cannot test** networked avatar sync because:
- WebSocket server is not running
- Connection attempts fail with error 1006 (abnormal closure)
- No backend to handle PRESENCE_UPDATE messages

### Once Backend is Fixed

After fixing the agent-looper path issue and building the services:

```bash
# Build all backend services
docker compose build redis auth hub presence sfu

# Start services
docker compose up -d redis auth hub presence sfu

# Verify services are running
docker compose ps

# Test WebSocket connection
# Open https://xr.graphwiz.ai in multiple browser windows
# Customize avatars and verify sync works
```

---

## WebSocket URL Fix Summary

### What Was Fixed

**File**: `packages/clients/hub-client/src/network/websocket-client.ts:55`

**Before**:
```typescript
const wsUrl = `${this.config.presenceUrl}/ws/${this.config.roomId}?...`;
// Result: wss://xr.graphwiz.ai/ws/ws/lobby  ❌ (duplicate)
```

**After**:
```typescript
const wsUrl = `${this.config.presenceUrl}/${this.config.roomId}?...`;
// Result: wss://xr.graphwiz.ai/ws/lobby  ✅ (correct)
```

**Status**: ✅ Fixed and deployed

---

## Next Steps

### Immediate (Required for networked sync to work)

1. **Fix agent-looper path in Cargo.toml files**:
   ```bash
   cd /opt/git/graphwiz-xr
   find packages/services/reticulum -name "Cargo.toml" -exec sed -i 's|path = "../agent-looper/rust"|path = "../../agent-looper/rust"|g' {} \;
   ```

2. **Build backend services**:
   ```bash
   docker compose build redis auth hub presence sfu
   ```

3. **Start services**:
   ```bash
   docker compose up -d redis auth hub presence sfu
   ```

4. **Test networked avatar sync**:
   - Open https://xr.graphwiz.ai in 2-3 browser windows
   - Customize avatar in one window
   - Verify changes sync to other windows

### Optional

5. **Commit and push fixes**:
   ```bash
   git add packages/deploy/docker/Dockerfile.*
   git add packages/services/reticulum/*/Cargo.toml
   git commit -m "fix: Correct agent-looper dependency path in Cargo.toml"
   git push
   ```

---

## Files Modified So Far

### Dockerfile Updates (Staged, not committed)
- ✅ `packages/deploy/docker/Dockerfile.auth` - Added agent-looper COPY
- ✅ `packages/deploy/docker/Dockerfile.presence` - Added agent-looper COPY
- ✅ `packages/deploy/docker/Dockerfile.hub` - Added agent-looper COPY
- ✅ `packages/deploy/docker/Dockerfile.sfu` - Added agent-looper COPY

### WebSocket Fix (Committed)
- ✅ `packages/clients/hub-client/src/network/websocket-client.ts` - Fixed duplicate /ws path

### Still Needed
- ⏳ `packages/services/reticulum/*/Cargo.toml` - Fix agent-looper path references

---

## Summary

**Networked Avatar Sync Implementation**: 100% complete on frontend ✅
**Backend Services**: Ready to build after path fix ⏳
**Production Deployment**: Hub-client live, backend pending ⏳
**Testing**: Blocked until backend services are running ⏳

**Estimated Time to Fix**: 5 minutes
**Difficulty**: Low (simple path correction)

---

**Created**: 2026-01-02 08:10 CET
**Status**: ⚠️ **AWAITING CARGO.TOML PATH FIX**
**Next Action**: Run sed command to fix paths, then build services

**END OF ISSUE REPORT**
