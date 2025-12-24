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

- [ ] Phase 1: Foundation (Weeks 1-4)
- [ ] Phase 2: Core Services (Weeks 5-12)
- [ ] Phase 3: Client Development (Weeks 13-20)
- [ ] Phase 4: Editor Development (Weeks 21-28)
- [ ] Phase 5: Advanced Features (Weeks 29-36)
- [ ] Phase 6: Polish & Production (Weeks 37-44)

## Acknowledgments

Built on the learnings from [Hubs-Foundation](https://github.com/Hubs-Foundation) while modernizing the architecture for next-generation performance.
