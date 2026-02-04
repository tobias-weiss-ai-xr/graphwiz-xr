# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-09
**Commit:** 3349bf3
**Branch:** main

## OVERVIEW

GraphWiz-XR is a TypeScript + Rust hybrid monorepo rewriting the Hubs VR platform as a modern, high-performance social VR system. 74% complete with 138 tests passing. Uses React Three Fiber for frontend, Actix-Web + SeaORM for Rust microservices, WebTransport/WebRTC for real-time networking.

## STRUCTURE

```
graphwiz-xr/
├── packages/
│   ├── clients/            # Frontend apps (hub-client, admin-client, ui-kit)
│   ├── services/reticulum/  # Rust microservices (auth, hub, presence, storage, sfu, avatar, core)
│   ├── shared/            # Protocol buffers and shared types
│   ├── editors/            # Tauri desktop apps (spoke)
│   └── deploy/             # Docker configs and deployment scripts
├── docs/                   # Implementation docs and architecture
├── traefik/                # Reverse proxy configuration
├── turbo.json              # Turborepo build orchestration
├── pnpm-workspace.yaml    # PNPM workspace config
├── Cargo.toml             # Rust workspace config
├── .eslintrc.cjs         # ESLint rules
├── .prettierrc            # Prettier formatting
└── rustfmt.toml           # Rust formatter rules
```

## WHERE TO LOOK

| Task                 | Location                                      | Notes                                               |
| -------------------- | --------------------------------------------- | --------------------------------------------------- |
| Main VR client       | `packages/clients/hub-client/src/App.tsx`     | Entry point, ECS integration, 3D rendering          |
| Admin dashboard      | `packages/clients/admin-client/src/App.tsx`   | Service monitoring, user management                 |
| Protocol definitions | `packages/shared/protocol/proto/`             | 6 .proto files for gRPC/WebTransport                |
| Shared types         | `packages/shared/types/src/`                  | Logger, API client, utilities                       |
| Rust core utils      | `packages/services/reticulum/core/src/`       | Error handling, middleware, database, auth, caching |
| Auth service         | `packages/services/reticulum/auth/src/`       | JWT, OAuth, magic links, session management         |
| Hub service          | `packages/services/reticulum/hub/src/`        | Room/entity management                              |
| Presence service     | `packages/services/reticulum/presence/src/`   | WebSocket signaling, room broadcasting              |
| Storage service      | `packages/services/reticulum/storage/src/`    | File uploads, chunked uploads, S3 abstraction       |
| SFU service          | `packages/services/reticulum/sfu/src/`        | WebRTC media routing, RTP forwarding                |
| Avatar service       | `packages/services/reticulum/avatar/src/`     | Avatar configuration management                     |
| WebRTC integration   | `packages/services/reticulum/sfu/src/peer.rs` | Peer connections, SDP, ICE, media tracks            |
| Real-time sync       | `packages/clients/hub-client/src/network/`    | WebSocket/WebTransport clients, interpolation       |
| ECS architecture     | `packages/clients/hub-client/src/ecs/`        | World, entities, components, systems                |
| Three.js integration | `packages/clients/hub-client/src/components/` | React Three Fiber components, scene rendering       |
| Testing              | `e2e/`, `src/**/__tests__/`                   | Vitest unit tests, Playwright E2E tests             |
| Docker setup         | `packages/deploy/docker/`                     | 11 Dockerfiles, docker-compose configs              |

## CONVENTIONS

### Code Style

- **TypeScript:** 2-space indentation, single quotes, semicolons, 100 char width
- **Rust:** 4-space indentation, rustfmt enforced, clippy linting
- **Import ordering:** builtin → external → internal → parent → sibling → index (ESLint enforced)
- **Naming:** PascalCase components, camelCase variables/functions, UPPER_CASE constants

### File Organization

- **Monorepo:** packages/ structure with pnpm + Cargo workspaces
- **Build system:** Turborepo for parallel builds, dependency management
- **Protocols:** packages/shared/protocol/proto/ definitions → generated TS/Rust/Python code
- **Tests:** `*.test.ts` for unit tests, `*.spec.ts` for E2E tests in e2e/ dirs

### Error Handling

- **Rust:** `Result<T, Error>` pattern, centralized error enums (core/src/error.rs)
- **TypeScript:** Promise-based error handling with try/catch, consistent error response format
- **HTTP errors:** Automatic conversion to appropriate status codes via `ResponseError` trait

### Async Patterns

- **Rust:** Extensive `async/await` usage, tokio runtime, background tasks with `tokio::spawn`
- **TypeScript:** async/await throughout, WebSocket/WebTransport async clients

## ANTI-PATTERNS (THIS PROJECT)

### Prohibited

- **No console.log** in production - only `console.warn`/`console.error` allowed (ESLint rule)
- **No `any` types** without justification - type safety enforced
- **No `unwrap()` panics** - proper error handling required, use `?` operator instead
- **No empty catch blocks** - all errors must be handled or logged
- **No dead code** - commented production features marked with TODO/FIXME
- **No secrets in version control** - GENERATE_SECRETS.md has critical warning

### Technical Debt

- 62 TODO items across codebase (notably audio worklet, GLTF loading, WebSocket assertions)
- 229 console.log statements to clean up for production
- 15 large files (>500 lines) with complexity hotspots:
  - `packages/services/reticulum/auth/src/handlers.rs` (934 lines)
  - `packages/services/reticulum/storage/src/handlers.rs` (903 lines)
- Agent Looper integration temporarily disabled for SFU optimization
- Some production features commented out pending implementation

## UNIQUE STYLES

### Hybrid Architecture

- **TypeScript + Rust split:** Frontend (TS/React Three Fiber), Backend (Rust/Actix-Web)
- **Shared protocols:** Protobuf definitions generate type-safe code for both languages
- **Dual package managers:** pnpm for Node.js, Cargo for Rust services

### ECS Frontend (Uncommon for Web)

- **Entity Component System:** World, Entities, Components, Systems pattern
- **12 component types:** Transform, Physics, Audio, Animation, Model, NetworkSync, Light, Camera, Interactable, Billboard, Particle, etc.
- **5 core systems:** Transform, Physics, Audio, Animation, Billboard

### WebTransport + WebRTC

- **Next-gen networking:** WebTransport (HTTP/3) for real-time data alongside WebSocket
- **SFU architecture:** Selective Forwarding Unit with simulcast for adaptive quality
- **RTP/RTCP:** Real-time transport protocol handling for media streaming

### Monorepo Build Orchestration

- **Turborepo:** Parallel builds, dependency caching, task outputs
- **Multi-stage Docker builds:** Builder → Runtime stages for minimal image sizes
- **Health checks:** All services implement `/api/v1/health` endpoints

## COMMANDS

```bash
# Development
pnpm dev                    # Start all services with hot reload
docker-compose -f packages/deploy/docker-compose.dev.yml up -d  # Full stack

# Building
pnpm build                   # Build all packages
pnpm check                   # Type checking
pnpm lint                    # ESLint + Clippy

# Testing
pnpm test                    # All tests (138 passing)
pnpm test:unit               # Unit tests only
pnpm test:e2e                # Playwright E2E tests

# Protocol generation
cd packages/shared/protocol && pnpm build:proto  # Generate TS/Rust from .proto

# Rust specific
cargo test                    # Run Rust tests
cargo clippy                  # Lint with clippy
cargo fmt                      # Format Rust code
```

## NOTES

### Performance Targets

- **Backend:** P50 < 10ms, P99 < 50ms latency
- **Frontend:** 60 FPS desktop, 90 FPS VR
- **Network:** < 5KB/s per client for position updates
- **Bundle:** < 2MB initial load

### Security

- **Auth:** Argon2 password hashing, JWT access/refresh tokens, Redis sessions
- **OAuth:** GitHub, Google, Discord providers with CSRF protection
- **Storage:** Magic bytes validation, file ownership verification, JWT-based access
- **Middleware:** Authentication, rate limiting, logging pipeline

### Implementation Status (74% Complete)

- **Phase 1-2:** Infrastructure, 5 core Rust services, shared libraries ✅
- **Phase 3:** Client networking, WebTransport/WebSocket ✅
- **Phase 4:** VR interactions (grab/move objects, portals, drawing, media playback) ✅
- **Phase 5-6:** Spoke editor, production deployment 🚧

### Gotchas

- **Hot-reload:** Only works in Docker dev environment with volume mounts
- **Protocol regeneration:** Required after modifying .proto files (`pnpm build:proto`)
- **Large file uploads:** Chunked upload system required for files >50MB
- **WebSocket reconnection:** Exponential backoff with 5 max attempts, 1s base delay
- **Three.js optimization:** Use instancing for repeated objects, dispose geometries/materials properly
- **Database migrations:** Run via SeaORM migrations system, check core/migrations/
- **Environment variables:** Database URLs, JWT secrets, Redis connections via .env files (not in git)
