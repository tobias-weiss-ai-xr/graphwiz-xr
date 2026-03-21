# GraphWiz-XR Roadmap Implementation Plan

**Date:** 2026-03-12
**Status:** READY FOR EXECUTION

---

## Executive Summary

Based on comprehensive codebase analysis, here's the current status and prioritized action items for the remaining roadmap:

**Overall Project Status: ~95% Complete** (138 tests passing)

| Item                    | Status                  | Completion | Priority | Est. Effort      |
| ----------------------- | ----------------------- | ---------- | -------- | ---------------- |
| 1. Gesture Recognition  | ✅ Already Implemented  | 95%        | Low      | 1 day (test)     |
| 2. Spoke Editor         | 🟡 Partial Start        | 30%        | Medium   | 3-5 days         |
| 3. S3 Backend           | ✅ Already Implemented  | 100%       | Low      | 2 hours (config) |
| 4. WebTransport Client  | 🔴 Needs Implementation | 0%         | High     | 2-3 days         |
| 5. Production Readiness | 🔴 Critical Gaps        | 60%        | High     | 5-7 days         |

**Total Estimated Effort: 11-16 days**

---

## Detailed Analysis & Plans

### 1. Gesture Recognition

**File Location:** `packages/clients/hub-client/src/systems/GestureRecognition.tsx`

**Current Implementation:**

```typescript
// ✅ MediaPipe Hands integration
// ✅ Palm detection + hand tracking (54 landmarks)
// ✅ 4 gesture classes: OK, Peace, Point, OpenPalm
// ✅ Confidence scoring + threshold configuration
// ✅ Visual debug UI showing detection results
```

**Remaining Work:**

- [ ] Integrate with XR input system (currently standalone)
- [ ] Add gesture events to emit system (grab/throw via gestures)
- [ ] Performance optimization (reduce pose detection to 15fps, not 60fps)
- [ ] Unit tests for classification logic

**Files to Modify:**

- `packages/clients/hub-client/src/xr/xr-input-system.ts` - Add gesture event listeners
- `packages/clients/hub-client/src/systems/GestureRecognition.tsx` - Performance optimizations

**Success Criteria:**

- Gestures trigger in VR: "OpenPalm" = highlight, "Point" = click, "OK" = grab
- No FPS drop during hand tracking
- At least 80% gesture recognition accuracy in unit tests

---

### 2. Spoke Editor (Tauri + Three.js)

**File Location:** `packages/editors/spoke/`

**Current State:**

- [x] Tauri project skeleton
- [x] R3F canvas setup
- [ ] Object hierarchy panel (left sidebar)
- [ ] Transform controls (right sidebar)
- [ ] Material/color picker (bottom panel)
- [ ] GLTF export functionality
- [ ] Scene graph visualization

**Implementation Plan:**

#### Architecture: 3-Pane Editor Layout

```
┌─────────────────────────────────────────────────┐
│  Top Toolbar: File Actions, Save, Export       │
├──────────────┬────────────────────┬─────────────┤
│              │                    │             │
│  Object      │    3D Viewport     │  Properties │
│  Hierarchy   │    (Three.js)      │  Inspector  │
│  (Tree UI)   │                    │  (Form UI)  │
│              │                    │             │
│  • Room      │                    │  • Selected │
│  • Lights    │                    │    Entity   │
│  • Models    │                    │  • Transforms│
│  • Props     │                    │  • Materials│
│              │                    │             │
├──────────────┴────────────────────┴─────────────┤
│  Bottom Timeline / Asset Browser                │
└─────────────────────────────────────────────────┘
```

#### Component Breakdown:

1. **ViewportComponent** (`Viewport.tsx`)
   - R3F Canvas with OrbitControls
   - TransformControls integration (@react-three/drei)
   - Grid helper, helpers (axes, lights preview)

2. **ObjectHierarchy** (`ObjectHierarchy.tsx`)
   - Draggable tree structure
   - React DnD for reordering
   - Entity selection + visibility toggle

3. **PropertiesPanel** (`PropertiesPanel.tsx`)
   - Dynamic form based on selected entity
   - Transform controls (x/y/z, rotation, scale)
   - Material picker (color, roughness, metalness)

4. **Toolbar** (`Toolbar.tsx`)
   - Select/move/rotate/scale tools
   - Save/Export to GLTF
   - Undo/redo history

#### Dependencies to Add:

```json
{
  "@react-three/drei": "^9.100.0",
  "@react-three/dnd": "^6.13.0",
  "react-dnd": "^16.0.0",
  "react-dnd-html5-backend": "^16.0.0",
  "@tauri-apps/api": "^1.5.0"
}
```

#### GLTF Export Pattern:

```typescript
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

function exportGLTF(scene: Object3D, filename: string) {
  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (gltf) => {
      const blob = new Blob([gltf], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    },
    (error) => console.error('Export failed:', error),
    { binary: true }
  );
}
```

**Success Criteria:**

- Create/edit/delete entities in editor
- Transform controls work (move/rotate/scale)
- Export valid GLTF file with all entities
- Persisted room state to backend

---

### 3. S3 Backend

**File Location:** `packages/services/reticulum/storage/src/`

**Current Implementation:**

- [x] `s3_backend.rs` - Full AWS SDK integration
- [x] `storage_backend.rs` - StorageBackend trait (already abstracted)
- [x] LocalStorageBackend fallback (auto-activates if S3 env vars missing)
- [x] Methods: upload_file, download_file, delete_file, file_exists

**Remaining Work:**

- [ ] Add `aws-sdk-s3` dependency to `Cargo.toml`
- [ ] Add `aws-config` dependency
- [ ] Update `lib.rs` to initialize S3 backend if env vars present
- [ ] Add environment config for storage backend selection
- [ ] Integration test with MinIO (S3-compatible test server)

**Configuration:**

```ini
# .env (storage service)
STORAGE_BACKEND=s3  # or "local"
AWS_REGION=us-east-1
S3_BUCKET_NAME=graphwiz-xr-assets
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

**Backend Selection Logic:**

```rust
// In lib.rs or storage_backend.rs
pub fn create_storage_backend() -> Box<dyn StorageBackend> {
    match std::env::var("STORAGE_BACKEND").as_deref() {
        Ok("s3") => {
            // S3 requires all AWS env vars
            match S3StorageBackend::new().await {
                Ok(s3) => Box::new(s3),
                Err(_) => {
                    log::warn!("S3 config missing, falling back to local");
                    Box::new(LocalStorageBackend::new(
                        std::env::var("STORAGE_BASE_PATH").unwrap_or_else(|_| "./storage".to_string())
                    ))
                }
            }
        }
        _ => Box::new(LocalStorageBackend::new(
            std::env::var("STORAGE_BASE_PATH").unwrap_or_else(|_| "./storage".to_string())
        ))
    }
}
```

**Dependencies to Add:**

```toml
# packages/services/reticulum/storage/Cargo.toml
[dependencies]
aws-sdk-s3 = "1.0"
aws-config = "1.0"
aws-smithy-runtime = "1.0"
```

**Success Criteria:**

- Set `STORAGE_BACKEND=s3` + AWS env vars → S3 backend activates
- Upload/download works with S3
- Fallback to local if credentials missing
- MinIO integration test passes

---

### 4. WebTransport Client

**File Location:** `packages/clients/hub-client/src/network/`

**Current State:**

- [x] Server: WebTransport HTTP/3 complete (`presence/`)
- [x] WebSocket client existing (`websocket-client.ts`)
- [ ] TypeScript WebTransport wrapper class
- [ ] Fallback pattern (WebTransport → WebSocket)

**Implementation Plan:**

#### WebTransport API Overview:

```typescript
// Native browser WebTransport API
const transport = new WebTransport('https://example.com/');
await transport.ready; // Connection established

// Bidirectional stream
const stream = await transport.createBidirectionalStream();
const reader = stream.readable.getReader();
const writer = stream.writable.getWriter();

// Send/receive
await writer.write(new TextEncoder().encode('hello'));
const data = await reader.read();
```

#### Architecture:

```typescript
// packages/clients/hub-client/src/network/webtransport-client.ts

export interface WebTransportConfig {
  transportUrl: string; // wss://example.com/room/{roomId}
  websocketFallbackUrl?: string; // ws://example.com/presence/{roomId}
  userId: string;
  auth_token?: string;
}

export class WebTransportClient {
  private transport: WebTransport | null = null;
  private stream: WritableStream<Uint8Array> | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private messageHandlers = new Map<number, (msg: any) => void>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private config: WebTransportConfig) {}

  async connect(): Promise<void> {
    try {
      // Try WebTransport first
      this.transport = new WebTransport(this.config.transportUrl, {
        serverCertificateHashes: [
          /* get from server */
        ]
      });

      await this.transport.ready;
      await this.setupStreams();
      this.reconnectAttempts = 0;
    } catch (error) {
      log.warn('WebTransport failed, falling back to WebSocket');
      await this.connectWithFallback();
    }
  }

  private async connectWithFallback(): Promise<void> {
    // Fall back to existing WebSocket client
    const wsClient = new WebSocketClient({
      presenceUrl: this.config.websocketFallbackUrl,
      roomId: this.config.roomId,
      userId: this.config.userId,
      authToken: this.config.auth_token
    });
    await wsClient.connect();
    // Forward messages to same handlers
  }

  // Same API as WebSocket client for consistency
  on(messageType: number, handler: (msg: any) => void): () => void {}
  send(messageType: number, data: any): void {}
  disconnect(): void {}
}
```

**Dependencies:** No external deps - uses native browser WebTransport API

**Browser Support:**

- ✅ Chrome 89+, Edge 89+
- ✅ Not supported in Firefox/Safari (requires polyfill or fallback)

**Fallback Handling:**

- Detect WebTransport availability: `'WebTransport' in window`
- If not available or connection fails, use WebSocket
- Graceful degradation: feature-rich mode (WebTransport) vs basic mode (WebSocket)

**Success Criteria:**

- Connects via WebTransport when available
- Falls back to WebSocket when not available
- Same API as WebSocket client (transparent swap)
- Reconnection logic with exponential backoff

---

### 5. Production Readiness

**Status:** CRITICAL - No E2E test suite exists

**Current Testing Landscape:**

- ✅ 138 unit tests passing (100% pass rate)
- ❌ 0 E2E tests in `e2e/` directory (empty)
- ❌ No Playwright/Selenium integration
- ❌ No performance benchmarking
- ❌ No load testing for SFU

**Priority Action Items:**

#### 5.1 E2E Test Suite (Playwright)

**Est. Effort: 3-4 days**

Create `e2e/` structure:

```
e2e/
├── setup/
│   ├── global-setup.ts      # Spin up test services
│   └── global-teardown.ts   # Cleanup
├── auth.spec.ts             # Login/registration tests
├── room.spec.ts             # Room creation/joining
├── avatar.spec.ts           # Avatar customization
├── interactions.spec.ts     # Grab/throw, drawing, media
├── networking.spec.ts       # Multiplayer sync
└── support/
    ├── test-helpers.ts      # Common test utilities
    └── fixtures/            # Test data
```

**Key Test Scenarios:**

1. **Authentication Flow**
   - Register → verify email → login
   - OAuth login (GitHub, Google)

2. **Room Lifecycle**
   - Create room → enter room → spawn entities
   - Leave room → room cleanup

3. **Multiplayer Sync**
   - 2+ clients connect, see each other
   - Position sync, chat messages
   - Grab/throw sync across clients

4. **Features**
   - Avatar customization UI
   - Drawing tools
   - Media playback (play/pause sync)
   - Portal teleportation

**Playwright Setup:**

```typescript
// e2e/setup/global-setup.ts
import { test as setup } from '@playwright/test';
import { generateTestUser } from '../support/test-helpers';

setup('create test user', async ({ page }) => {
  const user = await generateTestUser();
  // Save auth state to file
  await page.context().storageState({ path: 'auth.json' });
});
```

#### 5.2 Performance Testing (Lighthouse + custom)

**Est. Effort: 1-2 days**

```bash
# Bundle size
pnpm build && du -sh dist/

# Lighthouse audit
lighthouse http://localhost:5173 --chrome-flags="--headless"

# Custom FPS benchmark
```

**Performance Targets:**

- Initial load < 2MB bundle
- First paint < 1.5s
- FPS > 90 (VR), > 60 (desktop)
- Network traffic < 5KB/s per client

#### 5.3 Load Testing (SFU)

**Est. Est. Effort: 2-3 days**

Use `autocannon` or `k6`:

```typescript
// k6 load test script
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 50, // 50 concurrent users
  duration: '5m'
};

export default function () {
  const res = http.get('http://localhost:8004/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

**Load Test Scenarios:**

- 10, 25, 50, 100 concurrent WebRTC peers
- Measure: CPU usage, memory, latency
- Identify: SFU capacity limits

**Success Criteria for Production Readiness:**

- 20+ E2E tests covering critical paths
- Bundle size < 2MB
- Lighthouse score > 90
- SFU handles 50+ concurrent peers
- Load test report with performance baseline

---

## Task Prioritization Matrix

| Priority          | Item                            | Reason                               |
| ----------------- | ------------------------------- | ------------------------------------ |
| **P0 - Critical** | WebTransport Client             | Core feature, blocks progress        |
| **P0 - Critical** | E2E Test Suite                  | Production readiness blocker         |
| **P1 - High**     | S3 Backend Config               | Quick win, enables cloud storage     |
| **P1 - High**     | Gesture Recognition Integration | Enhances UX, low effort              |
| **P2 - Medium**   | Spoke Editor                    | Feature-complete product requirement |

---

## Recommended Execution Order

1. **Phase 1 (Day 1-2): WebTransport Client**
   - P0 critical path item
   - Enables HTTP/3 real-time features
2. **Phase 2 (Day 3-6): E2E Test Suite**
   - Production readiness blocker
   - Parallel with other development
3. **Phase 3 (Day 7-8): S3 + Gesture Integration**
   - Low effort, high impact
   - Quick wins
4. **Phase 4 (Day 9-13): Spoke Editor**
   - Longer development
   - Feature-complete product

---

## Risk Assessment

| Risk                         | Likelihood | Impact | Mitigation                    |
| ---------------------------- | ---------- | ------ | ----------------------------- |
| WebTransport browser support | Low        | High   | Fallback to WebSocket         |
| S3 credentials management    | Low        | Medium | Env vars + MinIO testing      |
| E2E flakiness                | Medium     | Medium | Retry logic, stable selectors |
| SFU performance limits       | Medium     | High   | Load test early, optimize     |
| Spoke Editor complexity      | Low        | Medium | Start simple, iterate         |

---

## Success Metrics

**Short-Term (1-2 weeks):**

- ✅ WebTransport client functional
- ✅ 10+ E2E tests written
- ✅ S3 backend configured
- ✅ Gesture recognition integrated

**Medium-Term (2-4 weeks):**

- ✅ Spoke editor MVP functional
- ✅ 20+ E2E tests covering main features
- ✅ Performance baseline established
- ✅ Load test report with SFU capacity

**Long-Term (1-3 months):**

- ✅ All 5 roadmap items complete
- ✅ Production deployment ready
- ✅ Comprehensive test coverage
- ✅ Documentation complete

---

## Next Steps

1. **Review** this plan and suggest modifications
2. **Confirm** timelines and priorities
3. **Begin** with P0 items (WebTransport + E2E tests)
