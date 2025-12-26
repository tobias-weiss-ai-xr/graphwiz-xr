# GraphWiz-XR

Modern VR/Social platform - A complete rewrite of the Hubs ecosystem using TypeScript + Rust.

## Vision

GraphWiz-XR delivers high-fidelity, browser-based virtual reality without installation barriers. Built with modern technologies for maximum performance and scalability.

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
- Docker (for local services)

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

Then install the project dependencies:

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Development

```bash
# Run tests
pnpm test

# Type checking
pnpm check

# Build
pnpm build

# Run E2E tests
pnpm test:e2e
```

## Architecture

### Components

1. **Hub Client** - Main VR client (TypeScript + R3F)
2. **Admin Client** - Dashboard for management
3. **Reticulum** - Backend microservices (Rust)
   - Core - Shared utilities
   - Auth - Authentication & authorization
   - Hub - Room/session management
   - Presence - WebRTC/WebTransport signaling
   - Storage - Asset storage
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

## Roadmap

A modern reimplementation of the [Hubs ecosystem](https://github.com/Hubs-Foundation) with TypeScript + Rust architecture.

### Phase 1: Foundation (Weeks 1-4)
**Goal**: Establish project infrastructure and tooling

#### Development Infrastructure
- [ ] Configure monorepo build system (Turborepo)
- [ ] Set up shared TypeScript configuration
- [ ] Configure Rust workspace with Cargo
- [ ] Establish CI/CD pipeline (GitHub Actions)
- [ ] Set up development Docker Compose
- [ ] Configure ESLint, Prettier, and Rust tooling
- [ ] Create shared protocol definitions (Protobuf)

#### Core Libraries
- [ ] `packages/shared/types` - Shared TypeScript types
- [ ] `packages/shared/protocol` - gRPC + WebTransport protocol buffers
- [ ] `packages/services/core` - Rust utilities and common code
- [ ] `packages/clients/ui-kit` - React component library

**Deliverables**: Working monorepo with build, test, and dev tooling

---

### Phase 2: Core Services (Weeks 5-12)
**Goal**: Build backend microservices (Rust replacement for Reticulum)

#### 2.1 Authentication Service (Weeks 5-6)
Reference: [reticulum/auth](https://github.com/Hubs-Foundation/reticulum)

- [ ] Email magic link authentication
- [ ] JWT token generation and validation
- [ ] OAuth integration (GitHub, Google, Discord)
- [ ] Session management with Redis
- [ ] Account creation and profile management
- [ ] Admin role management

#### 2.2 Hub Service (Weeks 7-9)
Reference: [reticulum hub management](https://github.com/Hubs-Foundation/reticulum)

- [ ] Room creation and configuration
- [ ] Room URL generation and routing
- [ ] Room permissions (entry, moderation, recording)
- [ ] Room settings (scene, grid size, max occupants)
- [ ] Room persistence and lifecycle
- [ ] Room listing and discovery
- [ ] Featured rooms and categories

#### 2.3 Storage Service (Weeks 10-11)
Reference: [reticulum assets](https://github.com/Hubs-Foundation/reticulum)

- [ ] Asset upload (GLB models, images, audio)
- [ ] Asset metadata storage (PostgreSQL + SeaORM)
- [ ] S3 integration for file storage
- [ ] Asset CDN configuration
- [ ] Avatar management system
- [ ] Scene asset library

#### 2.4 Presence Service (Weeks 12)
Reference: [reticulum presence](https://github.com/Hubs-Foundation/reticulum)

- [ ] WebSocket connection management
- [ ] User presence tracking (online, in-room)
- [ ] Friend system and social graph
- [ ] Activity feed and notifications
- [ ] Integration with Hub Service

**Deliverables**: Four core Rust services with gRPC APIs

---

### Phase 3: Real-Time Networking (Weeks 13-16)
**Goal**: Build WebRTC SFU and signaling (Rust replacement for Dialog)

#### 3.1 SFU Service (Weeks 13-15)
Reference: [dialog](https://github.com/Hubs-Foundation/dialog)

- [ ] Mediasoup-based WebRTC Selective Forwarding Unit
- [ ] Audio/video routing and mixing
- [ ] Simulcast and SVC support
- [ ] Bandwidth adaptation
- [ ] Transport negotiation (ICE, DTLS, SRTP)
- [ ] TURN/STUN server integration (coturn)
- [ ] Multi-user conference management
- [ ] Performance monitoring and metrics

#### 3.2 Signaling Service (Weeks 15-16)
- [ ] WebRTC signaling protocol
- [ ] Room participant management
- [ ] Peer connection coordination
- [ ] Network quality reporting
- [ ] Fallback signaling (WebSocket)

**Deliverables**: Rust SFU service compatible with WebRTC clients

---

### Phase 4: Hub Client Development (Weeks 17-24)
**Goal**: Build main VR client (TypeScript + R3F replacement for hubs)

#### 4.1 Core Client Foundation (Weeks 17-18)
Reference: [hubs/client](https://github.com/Hubs-Foundation/hubs)

- [ ] React 18 + Vite setup
- [ ] React Three Fiber scene initialization
- [ ] WebXR entry point (VR, AR, desktop modes)
- [ ] Camera and controls system
- [ ] Asset loading pipeline (GLTF, textures)
- [ ] Performance monitoring (stats.js integration)

#### 4.2 Multiuser Networking (Weeks 19-20)
- [ ] WebRTC client implementation
- [ ] WebTransport data channel for position updates
- [ ] Networked avatar system (NALA replacement)
- [ ] Voice audio with positional audio
- [ ] Interpolation and prediction for smooth movement
- [ ] Network quality indicators

#### 4.3 Scene System (Weeks 21-22)
- [ ] Scene loading and serialization
- [ ] Scene graph management
- [ ] Object spawn/remove system
- [ ] Media playing (video, audio, images)
- [ ] Drawing and pen tools
- [ ] Portal system for room linking

#### 4.4 Interaction Systems (Weeks 23-24)
- [ ] VR controller input
- [ ] Laser pointer interaction
- [ ] Grab and move objects
- [ ] Gesture recognition
- [ ] Voice chat (push-to-talk and always-on)
- [ ] Text chat system
- [ ] Emoji reactions

**Deliverables**: Full-featured VR client supporting desktop and VR headsets

---

### Phase 5: Admin & Moderation (Weeks 25-28)
**Goal**: Build admin dashboard and moderation tools

#### 5.1 Admin Client (Weeks 25-26)
Reference: [hubs/admin](https://github.com/Hubs-Foundation/hubs/tree/main/admin)

- [ ] Dashboard for room management
- [ ] User management and moderation
- [ ] Asset library management
- [ ] Analytics and metrics visualization
- [ ] System health monitoring
- [ ] Configuration management

#### 5.2 Moderation Features (Weeks 27-28)
- [ ] In-room moderation tools
- [ ] Kick/ban functionality
- [ ] Mute system
- [ ] Room locking
- [ ] Reporting system
- [ ] Audit logging

**Deliverables**: Admin client and moderation API endpoints

---

### Phase 6: Spoke Editor (Weeks 29-36)
**Goal**: Build scene editor (Tauri replacement for Spoke)

#### 6.1 Editor Foundation (Weeks 29-31)
Reference: [spoke](https://github.com/Hubs-Foundation/spoke) (if available)

- [ ] Tauri + React application setup
- [ ] Three.js editor viewport
- [ ] Object hierarchy panel
- [ ] Inspector panel for properties
- [ ] Asset browser integration
- [ ] Undo/redo system

#### 6.2 Scene Editing Tools (Weeks 32-34)
- [ ] Transform tools (move, rotate, scale)
- [ ] Object placement and snapping
- [ ] Lighting system editor
- [ ] Material editor
- [ ] Skybox and environment settings
- [ ] NavMesh generation and editing
- [ ] Spawn point configuration

#### 6.3 Advanced Features (Weeks 35-36)
- [ ] Animation timeline
- [ ] Behavior graphs (using existing Hubs format)
- [ ] Portals configuration
- [ ] Media element placement
- [ ] Scene templates and presets
- [ ] Export to Hubs format

**Deliverables**: Desktop scene editor with full feature parity

---

### Phase 7: Advanced Features (Weeks 37-44)
**Goal**: Add differentiating features and optimizations

#### 7.1 Performance & Optimization (Weeks 37-39)
- [ ] WebGPU rendering backend (experimental)
- [ ] Instance rendering for large scenes
- [ ] Level of Detail (LOD) system
- [ ] Progressive mesh loading
- [ ] Texture compression and streaming
- [ ] Bundle size optimization
- [ ] Service Worker for offline support

#### 7.2 Social Features (Weeks 40-41)
- [ ] Friend system
- [ ] Direct messaging
- [ ] Event scheduling
- [ ] Group management
- [ ] Profile customization
- [ ] Avatar creator integration

#### 7.3 Content Ecosystem (Weeks 42-43)
- [ ] Scene marketplace
- [ ] Avatar marketplace
- [ ] User-generated content tools
- [ ] Remix and sharing system
- [ ] Content moderation

#### 7.4 Developer APIs (Week 44)
- [ ] RESTful API documentation
- [ ] Webhook system
- [ ] Bot API
- [ ] Embed system
- [ ] SDK for custom integrations

**Deliverables**: Production-ready platform with advanced features

---

### Phase 8: Production Readiness (Weeks 45-52)
**Goal**: Hardening, deployment, and launch preparation

#### 8.1 Testing & Quality Assurance (Weeks 45-47)
- [ ] Comprehensive E2E test suite
- [ ] Load testing for SFU
- [ ] Cross-browser compatibility testing
- [ ] VR headset testing (Meta, HTC, Pico)
- [ ] Mobile device testing
- [ ] Accessibility audit
- [ ] Security audit

#### 8.2 Deployment & Operations (Weeks 48-50)
- [ ] Kubernetes deployment manifests
- [ ] Infrastructure as Code (Terraform)
- [ ] Monitoring and alerting (Prometheus, Grafana)
- [ ] Log aggregation (ELK stack)
- [ ] Automated backup system
- [ ] Disaster recovery procedures
- [ ] Auto-scaling configuration

#### 8.3 Documentation & Launch (Weeks 51-52)
- [ ] User documentation
- [ ] Admin guide
- [ ] Developer documentation
- [ ] API reference
- [ ] Deployment guide
- [ ] Contributing guide
- [ ] Launch website

**Deliverables**: Production deployment and public launch

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
