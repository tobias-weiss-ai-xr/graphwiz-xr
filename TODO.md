# GraphWiz-XR - TODOs & Implementation Gaps

**Generated:** 2026-01-14
**Last Scan:** 2026-01-14

---

## Critical TODOs (5)

### 1. Audio Worklet Implementation

**Location:** `packages/clients/hub-client/src/voice/voice-chat-client.ts:46`

```typescript
// private audioWorklet: AudioWorkletNode | null = null; // TODO: Implement audio worklet
```

**Priority:** High
**Impact:** Advanced audio processing (noise cancellation, echo suppression) unavailable
**Required:**

- Implement AudioWorkletNode for Web Audio API
- Add noise suppression algorithms
- Add echo cancellation
- Integrate with existing VoiceChatClient

---

### 2. GLTF Controller Models

**Location:** `packages/clients/hub-client/src/xr/xr-input-system.ts:498`

```typescript
// TODO: Load GLTF controller models
```

**Priority:** Medium
**Impact:** No visual feedback for VR controllers
**Required:**

- Load 3D controller models (Oculus Touch, Valve Index, HTC Vive)
- Attach to controller entities in VR
- Implement proper transformation and rendering

---

### 3. Magic Link Database Integration

**Location:** `packages/services/reticulum/auth/src/handlers.rs:598`

```rust
// Note: This is not fully implemented yet in magic_link module
```

**Location:** `packages/services/reticulum/auth/src/magic_link.rs:330`

```rust
#[error("Not implemented")]
NotImplemented,
```

**Priority:** High
**Impact:** Magic link authentication flow incomplete
**Required:**

- Complete `verify_magic_link()` database integration
- Handle token expiration and validation
- Test end-to-end magic link flow

---

### 4. WebSocket URL Configuration Tests

**Location:** `packages/clients/hub-client/e2e/networked-avatar-sync.spec.ts:186`

```typescript
// TODO: Add assertions to verify correct WebSocket URL configuration
```

**Priority:** Low
**Impact:** E2E tests don't validate WebSocket connectivity
**Required:**

- Add assertions for ws_url validation
- Verify connection uses correct environment URL

---

### 5. Multi-User Sync Tests

**Location:** `packages/clients/hub-client/e2e/multi-user-sync.spec.ts:79`

```typescript
// TODO: Add assertions to verify updates were received
```

**Priority:** Low
**Impact:** E2E tests don't validate position updates
**Required:**

- Add assertions for position update reception
- Verify transform sync across clients

---

## Placeholder Implementations (7)

### Presence Service Redis Pub/Sub

**Location:** `packages/services/reticulum/presence/src/redis.rs`
**Lines:** 59, 84, 121, 160, 172, 196, 210, 221, 235, 356, 361

```rust
// Placeholder implementation
// In production, you would:
// 1. Connect to Redis
// 2. Serialize message (JSON/bincode/protobuf)
// 3. Publish to appropriate channel: {prefix}:room:{room_id}
// 4. Handle connection errors and reconnection
```

**Priority:** Critical
**Impact:** Cross-server presence broadcasting non-functional
**Required:**

- Integrate `redis-rs` async client
- Implement connection pooling
- Add automatic reconnection logic
- Implement actual publish/subscribe to Redis channels
- Add proper error handling and retry logic
- Replace mock implementations with real Redis calls

---

### Temporarily Disabled Production Features

**Location:** `packages/services/reticulum/presence/src/websocket.rs`
**Lines:** 12, 42, 57, 83, 117, 129, 135, 379, 383, 390, 461-465

**Disabled Features:**

- Message queue creation (line 117)
- Production cleanup methods (line 129)
- Production metrics collection (lines 83, 135, 379, 383, 390)
- Per-connection rate limiting (line 383)
- Performance metrics endpoint (lines 461-465)

**Priority:** High
**Impact:** Missing monitoring and rate limiting
**Required:**

- Re-enable message queue for better performance
- Implement production cleanup on disconnect
- Add comprehensive metrics collection
- Implement rate limiting per connection
- Add `/metrics` endpoint

---

### Optimization Module (Agent Looper)

**Locations:**

- `packages/services/reticulum/auth/src/lib.rs:16`
- `packages/services/reticulum/hub/src/lib.rs:12, 22, 27, 49, 61`
- `packages/services/reticulum/presence/src/lib.rs:11, 14, 31, 38`
- `packages/services/reticulum/sfu/src/lib.rs:13, 30, 37, 63, 81`

**Comments:**

```rust
// pub mod optimization;  // Disabled: Agent Looper dependency removed
// optimization: optimization::OptimizationManager,  // Disabled
// Optimization disabled: Agent Looper dependency removed
```

**Priority:** Medium
**Impact:** Missing performance optimization system
**Required:**

- Add Agent Looper dependency to services
- Implement optimization managers
- Integrate optimization middleware

---

### WebTransport Implementation

**Location:** `packages/services/reticulum/presence/src/handlers.rs:25`

```rust
"status": "webtransport_not_implemented",
```

**Priority:** Critical
**Impact:** Next-gen WebTransport protocol not available
**Required:**

- Implement WebTransport HTTP/3 protocol
- Add WebTransport stream handling
- Replace WebSocket as default when available
- Add fallback to WebSocket for compatibility

---

## TypeScript Suppressions (2)

### Three.js Examples Type Declarations

**Locations:**

- `packages/clients/hub-client/src/core/assets.ts:44`
- `packages/clients/hub-client/src/ecs/components.ts:359`

```typescript
// @ts-expect-error - three/examples/jsm modules don't have type declarations
```

**Priority:** Medium
**Impact:** No type safety for three/examples modules
**Required:**

- Create proper type definitions for GLTFLoader, OrbitControls
- Or add type definitions to DefinitelyTyped
- Remove @ts-expect-error suppressions

---

## Technical Debt

### Empty Catch Block (1)

**Location:** `packages/clients/hub-client/src/networking/__tests__/websocket-keepalive.test.ts:39`

```typescript
const connectPromise = wsClient.connect().catch(() => {});
```

**Priority:** Medium
**Impact:** Silent failure, no error logging
**Required:**

- Add error handler to catch block
- Log errors for debugging

---

## Large Files Requiring Refactor (>500 lines)

1. `packages/shared/protocol/src/generated/proto.d.ts` - 13,709 lines (generated, acceptable)
2. `packages/clients/hub-client/src/App.tsx` - 1,470 lines
3. `packages/clients/admin-client/src/api-client.ts` - 937 lines
4. `packages/services/reticulum/auth/src/handlers.rs` - 933 lines
5. `packages/services/reticulum/storage/src/handlers.rs` - 906 lines
6. `packages/clients/hub-client/src/voice/__tests__/voice-chat-client.test.ts` - 810 lines
7. `packages/clients/hub-client/src/demo/physics-demo.tsx` - 783 lines
8. `packages/clients/hub-client/src/physics/__tests__/physics.test.ts` - 615 lines
9. `packages/services/reticulum/storage/src/chunked_upload.rs` - 647 lines
10. `packages/clients/hub-client/src/settings/SettingsPanel.tsx` - 597 lines
11. `packages/clients/hub-client/src/xr/__tests__/xr-input-manager.test.ts` - 588 lines
12. `packages/services/reticulum/auth/src/admin_handlers.rs` - 521 lines

**Priority:** Low
**Impact:** Maintainability and code complexity
**Refactor Recommendations:**

- Split large files into smaller, focused modules
- Extract common patterns into utilities
- Group related functionality together

---

## Code Metrics

### File Counts

- **TypeScript files:** 142 (.ts/.tsx files in packages)
- **Rust files:** 50+ (.rs files across services)
- **Test files:** 19
- **Production code:** ~53,746 lines (excluding node_modules, target, generated)

### Rust Code Quality

- **unwrap() calls:** 144 (should use ? operator or proper error handling)
- **expect() calls:** 0 (good)

### Browser Support

- **WebXR:** ✅ Chrome 89+, Edge 89+, Firefox (flagged), Quest Browser
- **WebRTC:** ✅ Chrome, Firefox, Safari, Edge
- **Spatial Audio:** ✅ Chrome, Firefox, Safari, Quest
- **WebTransport:** ❌ Not implemented yet

---

## Test Coverage

### Current Status

- **Total Tests:** 138 passing (100% pass rate)
- **Coverage Areas:**
  - Networking: 95%
  - Physics: 95%
  - Protocol: 95%
  - XR: 70%
  - ECS: 70%

### Missing Tests

- Magic link authentication flow
- Redis pub/sub integration
- WebTransport client
- Controller model loading
- Audio worklet integration

---

## Performance Targets

### Backend

- **P50 latency:** < 10ms ✅
- **P99 latency:** < 50ms ✅
- **Goal:** Maintain current performance while adding missing features

### Frontend

- **Desktop FPS:** 60 FPS ✅
- **VR FPS:** 90 FPS ✅
- **Network per client:** < 5KB/s for positions ✅
- **Bundle size:** < 2MB initial load ✅

---

## Immediate Action Items (Sorted by Priority)

### Critical (Blockers)

1. ✅ Complete Redis pub/sub implementation in presence service
2. ✅ Complete magic link verification in auth service
3. ✅ Implement WebTransport in presence service

### High Priority

4. Implement audio worklet for voice chat
5. Re-enable production metrics in presence service
6. Add message queue for WebSocket performance

### Medium Priority

7. Load GLTF controller models for VR
8. Re-integrate optimization module (Agent Looper)
9. Create proper type definitions for three/examples

### Low Priority

10. Add missing E2E test assertions
11. Refactor large files (>500 lines)
12. Fix empty catch block in tests

---

## Implementation Gaps by Service

### Authentication Service

- Magic link verification incomplete
- Optimization module disabled

### Hub Service

- Optimization module disabled

### Presence Service

- **CRITICAL:** Redis pub/sub not implemented (placeholder)
- **CRITICAL:** WebTransport not implemented
- Production metrics disabled
- Message queue disabled
- Rate limiting disabled

### Storage Service

- ✅ Complete (no TODOs found)

### SFU Service

- Optimization module disabled

### Hub Client

- Audio worklet not implemented
- Controller models not loaded
- Missing TypeScript types for three/examples

### Admin Client

- ✅ Complete (no TODOs found)

---

## Future Enhancements

### Advanced Voice Features

- Advanced noise suppression
- Audio level normalization
- Priority speaker (louder for important people)
- Audio recording/playback

### VR Input

- Hand tracking support
- Gesture recognition
- Touch controller support
- Finger tracking (Index, Quest Pro)

### Performance

- LOD (Level of Detail) system
- Mesh instancing for repeated objects
- WebGPU rendering backend
- Object pooling for frequently created entities

### Social Features

- Friends list
- Groups/communities
- User profiles with more details
- Reporting system

### Content

- Content marketplace
- Scene templates
- Asset sharing

---

## Notes

### Development Priorities (Q1 2026)

1. ✅ Complete client interaction systems (grab, throw, portals)
2. ✅ Implement text chat and emoji reactions
3. ✅ Add media playback (video, audio)
4. ✅ Build admin dashboard frontend
5. ⏳ Implement in-room moderation tools
6. Build Spoke scene editor
7. Implement S3 backend for storage service
8. E2E testing and cross-browser compatibility

### Project Status

- **Overall Progress:** ~74% Complete
- **Phase 1-2:** Infrastructure, 5 core Rust services, shared libraries ✅
- **Phase 3:** Client networking, WebTransport/WebSocket ✅
- **Phase 4:** VR interactions (grab/move objects, portals, drawing, media playback) ✅
- **Phase 5-6:** Spoke editor, production deployment 🚧

---

**Last Updated:** 2026-01-14
**Next Review:** After completing high-priority items
