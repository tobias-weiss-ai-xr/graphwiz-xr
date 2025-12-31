# GraphWiz-XR

![GraphWiz-XR Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)
![Rust](https://img.shields.io/badge/Rust-1.83-orange.svg)
![React](https://img.shields.io/badge/React-18-cyan.svg)
![Three.js](https://img.shields.io/badge/Three.js-160-black.svg)
![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

Modern VR/Social platform - A complete rewrite of the Hubs ecosystem using TypeScript + Rust.

## Vision

GraphWiz-XR delivers high-fidelity, browser-based virtual reality without installation barriers. Built with modern technologies for maximum performance and scalability.

## Screenshot

![GraphWiz-XR Hub Client](./docs/hub-client-screenshot.png)

*The Hub Client - Your gateway to immersive VR experiences*

## Technology Stack

### Frontend
- **TypeScript** - Type-safe development
- **React 18** - UI framework
- **React Three Fiber** - Declarative 3D rendering
- **Three.js r160+** - 3D engine with WebGPU preparation
- **Vite** - Fast build tool

### Backend
- **Rust** - High-performance microservices
- **Actix-Web** - Web framework
- **SeaORM** - Database ORM
- **PostgreSQL** - Primary database

### Networking
- **WebTransport** - Next-gen real-time transport (HTTP/3)
- **gRPC** - Structured RPC framework
- **Protobuf** - Efficient serialization

### Editor
- **Tauri** - Lightweight desktop app framework
- **Rust** - Native performance
- **React** - Shared UI with client

## Project Structure

```
graphwiz-xr/
├── packages/
│   ├── clients/           # TypeScript frontend apps
│   ├── services/          # Rust backend services
│   ├── editors/           # Tauri desktop apps
│   ├── shared/            # Shared protocol/types
│   └── deploy/            # Deployment configs
├── Cargo.toml             # Rust workspace
├── package.json           # Node workspace
└── turbo.json             # Build pipeline
```

## Quick Start

### Prerequisites
- Node.js 20+
- Rust 1.75+
- pnpm 8+
- Docker & Docker Compose (for local services)

### Installation

First, ensure you have pnpm installed:

```bash
# Install pnpm using npm (comes with Node.js)
npm install -g pnpm@8

# Or using curl
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Or using Homebrew (macOS/Linux)
brew install pnpm

# Verify installation
pnpm --version
```

### Development with Docker

The easiest way to start development is using Docker Compose:

```bash
# Start all services (PostgreSQL, Redis, Core API, Hub Client)
docker-compose -f packages/deploy/docker-compose.dev.yml up -d

# View logs
docker-compose -f packages/deploy/docker-compose.dev.yml logs -f hub-client core-api

# Stop all services
docker-compose -f packages/deploy/docker-compose.dev.yml down
```

#### Access Points
- **Hub Client**: http://localhost:5173
- **Core API**: http://localhost:8000
- **Storage Service**: http://localhost:8005
- **Adminer (DB)**: http://localhost:8080

### Manual Development

```bash
# Install dependencies
pnpm install

# Generate protocol buffers
cd packages/shared/protocol
pnpm build:proto

# Run tests
pnpm test

# Type checking
pnpm check

# Build
pnpm build
```

## 📚 Documentation & Planning

### Development Planning
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Detailed immediate action items, quick wins, and task breakdowns
- **[ROADMAP.md](./ROADMAP.md)** - Long-term development roadmap and feature planning
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Detailed implementation progress tracking

### Architecture Documentation
- **[docs/arc42.md](./docs/arc42.md)** - Architecture documentation (arc42 template)
- **[docs/INTENTION.md](./docs/INTENTION.md)** - Project intentions and design principles

### Quick Reference Guides
- **[NETWORKING_IMPLEMENTATION_SUMMARY.md](./NETWORKING_IMPLEMENTATION_SUMMARY.md)** - WebSocket implementation details
- **[PHYSICS_ENGINE_INTEGRATION.md](./PHYSICS_ENGINE_INTEGRATION.md)** - Physics system documentation
- **[VOICE_CHAT_IMPLEMENTATION_SUMMARY.md](./VOICE_CHAT_IMPLEMENTATION_SUMMARY.md)** - Voice chat system

### Test Reports
- **[PHYSICS_TEST_REPORT.md](./PHYSICS_TEST_REPORT.md)** - Physics system test results
- **[FULL_STACK_INTEGRATION_TEST_REPORT.md](./FULL_STACK_INTEGRATION_TEST_REPORT.md)** - Integration test results

## Architecture

### Components

1. **Hub Client** - Main VR client (TypeScript + R3F)
2. **Admin Client** - Dashboard for management
3. **Reticulum** - Backend microservices (Rust)
   - Core - Shared utilities and models
   - Auth - Authentication & authorization
   - Hub - Room/session management
   - Presence - WebSocket signaling
   - Storage - Asset upload/download service
   - SFU - WebRTC media routing
4. **Spoke** - Scene editor (Tauri + React)

### Protocol

The system uses a custom protocol built on:
- **gRPC** - Reliable operations (auth, room management)
- **WebTransport** - Real-time data (positions, voice)
- **Protobuf** - Message serialization

See `packages/shared/protocol/` for protocol definitions.

## Performance Targets

- **Backend**: P50 < 10ms, P99 < 50ms latency
- **Frontend**: 60 FPS desktop, 90 FPS VR
- **Network**: < 5KB/s per client (positions)
- **Bundle**: < 2MB initial load

## Contributing

This project follows the "Performance-Hybrid" architecture:

- **TypeScript** for flexible UI development
- **Rust** for maximum backend performance
- **React** for shared UI code across client/editor
- **Web-first** - browser compatibility is paramount

## License

MPL-2.0 - See LICENSE file for details

## Implementation Status

### ✅ Phase 1: Foundation (COMPLETE)
**Goal**: Establish project infrastructure and tooling

- [x] Configure monorepo build system (Turborepo)
- [x] Set up shared TypeScript configuration
- [x] Configure Rust workspace with Cargo
- [x] Establish CI/CD pipeline (GitHub Actions)
- [x] Set up development Docker Compose with hot-reload
- [x] Configure ESLint, Prettier, and Rust tooling
- [x] Create shared protocol definitions (Protobuf)
- [x] `packages/shared/types` - Shared TypeScript types
- [x] `packages/shared/protocol` - gRPC + WebTransport protocol buffers
- [x] `packages/services/core` - Rust utilities and common code
- [x] `packages/clients/ui-kit` - React component library

**Deliverables**: ✅ Working monorepo with build, test, and dev tooling
**Test Coverage**: 138 tests passing (100% pass rate)

---

### ✅ Phase 2: Core Services (COMPLETE)
**Goal**: Build backend microservices (Rust replacement for Reticulum)

#### 2.1 Authentication Service ✅
- [x] Email magic link authentication
- [x] JWT token generation and validation
- [x] OAuth integration (GitHub, Google, Discord)
- [x] Session management with Redis
- [x] Account creation and profile management
- [x] Admin role management
- [x] Password hashing with bcrypt
- [x] Database migrations

#### 2.2 Hub Service ✅
- [x] Room creation and configuration
- [x] Room URL generation and routing
- [x] Room listing and discovery
- [x] Entity spawning in rooms
- [x] Entity updates (position, rotation, components)
- [x] Room-to-entity relationships
- [x] Comprehensive test coverage

#### 2.3 Storage Service ✅
- [x] Multipart file upload with progress tracking
- [x] File validation (magic bytes, size limits, MIME types)
- [x] Asset metadata storage (PostgreSQL)
- [x] Asset listing with pagination and filtering
- [x] File download and serving
- [x] Asset deletion with ownership verification
- [x] Storage backend abstraction (S3-ready)
- [x] Frontend React components (Uploader, Browser, Card)
- [x] Drag-and-drop upload interface
- [x] Supported types: Models (GLB/GLTF), Textures, Audio, Video

#### 2.4 Presence Service ✅
- [x] WebSocket connection management
- [x] Room-based broadcasting
- [x] Connection lifecycle (add/remove)
- [x] Binary and text message handling
- [x] Ping/pong handling
- [x] Graceful disconnect handling
- [x] Connection statistics

#### 2.5 SFU (Selective Forwarding Unit) Service ✅
- [x] Room creation and management
- [x] Peer connection tracking
- [x] WebRTC offer/answer handling
- [x] ICE candidate handling
- [x] RTP packet forwarding
- [x] Simulcast layer management
- [x] Room capacity limits

**Deliverables**: ✅ Five core Rust services with comprehensive APIs

---

### 🟡 Phase 3: Real-Time Networking (IN PROGRESS)
**Goal**: Build WebRTC SFU and signaling

#### 3.1 SFU Service ✅ COMPLETE
- [x] WebRTC Selective Forwarding Unit
- [x] Audio/video routing
- [x] Simulcast support
- [x] Transport negotiation (ICE, DTLS, SRTP)
- [x] Multi-user conference management

#### 3.2 Client Networking ✅ COMPLETE
- [x] WebSocket client with auto-reconnect
- [x] Binary message serialization/deserialization
- [x] Position/rotation synchronization
- [x] Entity spawn/despawn networking
- [x] Position interpolation for smooth movement
- [x] Network system for ECS integration

**Deliverables**: ✅ Rust SFU service + TypeScript client networking

---

### 🟡 Phase 4: Hub Client Development (IN PROGRESS)
**Goal**: Build main VR client (TypeScript + R3F replacement for hubs)

#### 4.1 Core Client Foundation ✅ COMPLETE
- [x] React 18 + Vite setup
- [x] React Three Fiber scene initialization
- [x] Camera and controls system
- [x] Asset loading pipeline (GLTF, textures)
- [x] Performance monitoring

#### 4.2 ECS Architecture ✅ COMPLETE
- [x] Complete ECS (Entity Component System)
- [x] Components: Transform, Physics, Collider, Audio, Animation, Model, Light, Camera, NetworkSync, Interactable, Billboard, Particle
- [x] Systems: Transform, Physics, Animation, Audio, Billboard
- [x] Game loop with delta time

#### 4.3 Multiuser Networking ✅ COMPLETE
- [x] WebSocket client implementation
- [x] Networked avatar system
- [x] Interpolation and prediction for smooth movement
- [x] Network quality indicators

#### 4.4 XR Input System ✅ COMPLETE
- [x] WebXR controller input
- [x] Button press handling
- [x] Thumbstick tracking
- [x] Haptic feedback
- [x] Pose tracking and updates

#### 4.5 Physics Engine ✅ COMPLETE
- [x] Physics body components
- [x] Collision detection
- [x] Physics simulation with cannon-es
- [x] Comprehensive physics tests (31 tests)

#### 4.6 Voice Chat System ✅ COMPLETE
- [x] WebRTC audio capture
- [x] Voice activity detection
- [x] Audio mixing and spatialization
- [x] Mute/unmute controls
- [x] Voice chat client implementation

#### 4.7 Scene & Interaction Systems 🟡 IN PROGRESS
- [ ] Text chat UI
- [ ] Emoji reactions
- [ ] Media playing (video, audio)
- [ ] Drawing tools
- [ ] Portal system
- [ ] Avatar customization
- [ ] Grab and move objects
- [ ] Gesture recognition

**Deliverables**: 🟡 VR client core complete, advanced interactions in progress

---

### 🔴 Phase 5: Admin & Moderation (PENDING)
**Goal**: Build admin dashboard and moderation tools

#### 5.1 Admin Client 🔴 NOT STARTED
- [ ] Dashboard for room management
- [ ] User management and moderation
- [ ] Asset library management
- [ ] Analytics and metrics visualization
- [ ] System health monitoring

#### 5.2 Moderation Features 🔴 NOT STARTED
- [ ] In-room moderation tools
- [ ] Kick/ban functionality
- [ ] Mute system
- [ ] Room locking
- [ ] Reporting system

---

### 🔴 Phase 6: Spoke Editor (PENDING)
**Goal**: Build scene editor (Tauri replacement for Spoke)

- [ ] Tauri + React application setup
- [ ] Three.js editor viewport
- [ ] Object hierarchy panel
- [ ] Transform tools (move, rotate, scale)
- [ ] Lighting system editor
- [ ] Material editor
- [ ] Scene export functionality

---

### 🔴 Phase 7-8: Advanced Features & Production (PENDING)
**Goal**: Add differentiating features and production readiness

#### Advanced Features
- [ ] WebGPU rendering backend
- [ ] Performance optimization (LOD, instancing)
- [ ] Social features (friends, groups)
- [ ] Content marketplace
- [ ] Developer APIs

#### Production Readiness
- [ ] E2E test suite expansion
- [ ] Load testing for SFU
- [ ] Cross-browser compatibility testing
- [ ] VR headset testing
- [ ] Kubernetes deployment
- [ ] Monitoring and alerting
- [ ] Documentation completion

---

## Current Status Summary

**Last Updated**: 2025-12-31

**Overall Progress**: ~65% Complete

### Recent Updates (December 2025)
- ✅ **Storage Service Backend**: Complete file upload/download service with validation, magic bytes checking, and PostgreSQL metadata storage
- ✅ **Storage Service Frontend**: React components with drag-drop upload, asset browser, and management UI
- ✅ **Docker Integration**: Storage service containerized with hot-reload support
- ✅ **Asset Type Support**: Models (GLB/GLTF), Textures (PNG/JPG), Audio (MP3/OGG), Video (MP4)
- ✅ **Fixed Proto.js Browser Compatibility**: Updated protobuf generation to use ES6 modules instead of CommonJS for browser compatibility
- ✅ **Added Volume Mounts**: Protocol and types packages now mounted as Docker volumes for hot-reload
- ✅ **Test Suite**: All 138 tests passing (100% pass rate)

### ✅ Fully Implemented (100%)
- Monorepo infrastructure with Turborepo
- CI/CD pipeline with GitHub Actions
- Docker development environment
- Protocol buffer definitions
- Authentication service (email, OAuth, magic links)
- Hub service (room & entity management)
- Storage service (file upload/download, asset management)
- Presence service (WebSocket signaling)
- SFU service (WebRTC media routing)
- Client ECS architecture
- Client networking layer
- XR input system
- Physics engine integration
- Voice chat system

### 🟡 Partially Implemented (50-90%)
- Hub client UI (core complete, interactions in progress)
- Testing infrastructure (138 tests passing, more coverage needed)
- Documentation (READMEs complete, API docs pending)

### 🔴 Not Started (0%)
- Admin dashboard
- Spoke editor
- Advanced social features
- Production deployment

### Test Metrics
- **Total Tests**: 138 passing (100% pass rate)
- **Coverage**: Networking (95%), Physics (95%), Protocol (95%), XR (70%), ECS (70%)

---

## Roadmap

A modern reimplementation of the [Hubs ecosystem](https://github.com/Hubs-Foundation) with TypeScript + Rust architecture.

**Next Priorities (Q1 2025)**:
1. Complete client interaction systems (grab, throw, gestures)
2. Implement text chat and emoji reactions
3. Add media playback (video, audio)
4. Build admin dashboard MVP
5. Implement S3 backend for storage service
6. E2E testing and cross-browser compatibility

---

## Technology Rationale

### Why TypeScript + Rust?
| Aspect | Hubs (Legacy) | GraphWiz-XR |
|--------|---------------|-------------|
| **Frontend** | JavaScript + A-Frame | TypeScript + React Three Fiber |
| **Backend** | Elixir + Phoenix | Rust + Actix-Web |
| **Performance** | Good | Excellent (Rust zero-cost abstractions) |
| **Type Safety** | Partial (Elixir dynamic) | Complete (TS + Rust) |
| **Bundle Size** | Large (A-Frame deps) | Optimized (tree-shaking) |
| **WebGPU** | Not available | Ready for WebGPU migration |
| **WebTransport** | Custom implementation | Native HTTP/3 support |

### Architecture Improvements
- **Microservices**: Separate Rust services for better scalability
- **WebTransport**: Modern replacement for WebSocket for real-time data
- **React Three Fiber**: Declarative 3D with React ecosystem
- **Shared Protocol**: Protobuf definitions shared between TS and Rust

## Acknowledgments

Built on the learnings from [Hubs-Foundation](https://github.com/Hubs-Foundation) while modernizing the architecture for next-generation performance.
