# arc42 - GraphWiz-XR Architecture Documentation

## About arc42

arc42 is the template for architecture communication.

**URL:** https://arc42.org

**Creator:** Dr. Peter Hruschka (https://www.sophist.de/en/about-us/peter-hruschka.html)
**Contributors:** Dr. Gernot Starke (https://www.gernotstarke.de)
**Version:** 8.2 EN - 2023-06-27
**Status:** Released

---

```text
01. Introduction and Goals
02. Architecture Constraints
03. System Scope and Context
04. Solution Strategy
05. Building Block View
06. Runtime View
07. Deployment View
08. Cross-cutting Concepts
09. Architecture Decisions
10. Quality Scenarios
11. Risks and Technical Debts
12. Glossary
13. Open Points
```

---

## Section 01. Introduction and Goals

### 1.1 Requirements Overview

**Goal:** Modern, high-performance VR/Social platform that maintains browser compatibility.

**Key Requirements:**

| # | Requirement | Priority |
|---|-------------|----------|
| 1 | Browser-based VR without installation | Must |
| 2 | Support 50+ concurrent users per room | Must |
| 3 | < 100ms latency for position updates | Must |
| 4 | 60 FPS desktop, 90 FPS VR | Must |
| 5 | Voice chat with < 20ms latency | Should |
| 6 | Cross-platform editor (Windows, macOS, Linux) | Should |
| 7 | Mobile web support | Could |

### 1.2 Quality Goals

| # | Quality Goal | Scenario | Measure |
|---|--------------|----------|---------|
| 1 | Performance | 50 avatars in one room | Frame rate > 60 FPS |
| 2 | Low Latency | User moves avatar | Position update visible < 100ms |
| 3 | Scalability | 1000 concurrent users | Server CPU < 50% |
| 4 | Usability | First-time user | Enter VR room < 10 seconds |
| 5 | Security | Authentication | JWT tokens, HTTPS enforced |

### 1.3 Stakeholders

| Role | Name | Contact |
|------|------|---------|
| Product Owner | TBD | - |
| Architects | Development Team | - |
| Developers | Development Team | - |
| Operations | DevOps Team | - |

---

## Section 02. Architecture Constraints

### 2.1 Technical Constraints

| # | Constraint | Impact |
|---|------------|--------|
| 1 | **Browser-first**: Must run in modern browsers without plugins | WebGPU/WebTransport polyfill for older browsers |
| 2 | **Rust backend**: Team expertise in Rust required | Training required for some developers |
| 3 | **PostgreSQL**: Must use PostgreSQL for database | Schema must support PostgreSQL |
| 4 | **MPL-2.0 License**: Code must be MPL-2.0 compatible | All dependencies must be MPL-compatible |

### 2.2 Organizational Constraints

| # | Constraint | Impact |
|---|------------|--------|
| 1 | Small team (1-3 developers initially) | Must prioritize features carefully |
| 2 | Limited budget | Cloud cost optimization required |

### 2.3 Conventions

| # | Convention | Description |
|---|------------|-------------|
| 1 | **Code Style** | Rust: `cargo fmt` + `clippy`; TS: `prettier` + `eslint` |
| 2 | **Naming** | `snake_case` for Rust, `camelCase` for TypeScript |
| 3 | **Commit Messages** | Conventional Commits (`feat:`, `fix:`, etc.) |
| 4 | **Testing** | Minimum 80% coverage required |

---

## Section 03. System Scope and Context

### 3.1 Business Context

```
┌─────────────────────────────────────────────────────────────┐
│                        Users                                │
│  - VR enthusiasts                                          │
│  - Educators                                                │
│  - Social platform users                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ use
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    GraphWiz-XR System                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Hubs       │  │   Spoke      │  │  Reticulum   │     │
│  │   Client     │  │   Editor     │  │  Backend     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ uses
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              External Systems & Services                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  GitHub  │  │   S3     │  │   CDN    │  │   PostgreSQL│ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Technical Context

**Inbound:**
- WebRTC/WebTransport (real-time data)
- HTTP/HTTPS (API calls)
- gRPC-Web (structured queries)

**Outbound:**
- PostgreSQL (data persistence)
- S3/CDN (asset storage)

---

## Section 04. Solution Strategy

### 4.1 Technology Decisions

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | TypeScript + React Three Fiber | Type safety + React ecosystem + Three.js performance |
| Backend | Rust (Actix + Tokio) | Zero-cost abstractions + memory safety + async |
| Editor | Rust + Tauri | Native performance + shared React UI |
| Database | PostgreSQL + SeaORM | Mature relational DB with async Rust support |
| Networking | WebTransport + gRPC | Next-gen web standards + efficient binary protocol |

### 4.2 Quality Achievement

| Quality | Approach |
|---------|----------|
| Performance | Rust backend, ECS pattern, object pooling |
| Scalability | Microservices architecture, horizontal scaling |
| Maintainability | TypeScript strict mode, Rust type system |
| Security | JWT auth, input validation, prepared SQL statements |

---

## Section 05. Building Block View

### 5.1 Whitebox Overall System

```
┌─────────────────────────────────────────────────────────────────┐
│                       graphwiz-xr Monorepo                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    packages/                              │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────┐       │  │
│  │  │           clients/                             │       │  │
│  │  │  • hub-client (TypeScript + R3F)             │       │  │
│  │  │  • admin-client (TypeScript + React)          │       │  │
│  │  └──────────────────────────────────────────────┘       │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────┐       │  │
│  │  │           services/                            │       │  │
│  │  │  • reticulum/                                  │       │  │
│  │  │    - core (shared models, db)                  │       │  │
│  │  │    - auth (JWT, registration)                  │       │  │
│  │  │    - hub (rooms, entities)                     │       │  │
│  │  │    - presence (signaling, sessions)            │       │  │
│  │  │    - storage (assets)                          │       │  │
│  │  │  • dialog (WebRTC SFU)                          │       │  │
│  │  └──────────────────────────────────────────────┘       │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────┐       │  │
│  │  │           editors/                             │       │  │
│  │  │  • spoke (Rust + Tauri + React)                │       │  │
│  │  └──────────────────────────────────────────────┘       │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────┐       │  │
│  │  │           shared/                              │       │  │
│  │  │  • protocol (protobuf definitions)             │       │  │
│  │  │  • types (shared TypeScript types)             │       │  │
│  │  │  • utils (shared utilities)                     │       │  │
│  │  └──────────────────────────────────────────────┘       │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────┐       │  │
│  │  │           deploy/                              │       │  │
│  │  │  • docker/                                      │       │  │
│  │  │  • kubernetes/                                  │       │  │
│  │  │  • compose/                                     │       │  │
│  │  └──────────────────────────────────────────────┘       │  │
│  │                                                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           Root Configuration Files                        │  │
│  │  • Cargo.toml (Rust workspace)                           │  │
│  │  • package.json (Node workspace)                         │  │
│  │  • pnpm-workspace.yaml                                    │  │
│  │  • turbo.json (build pipeline)                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Important Building Blocks

#### Reticulum Core (`reticulum-core`)
- **Responsibility**: Shared models, database configuration, error handling
- **Important Files**:
  - `src/models/` - SeaORM entities
  - `src/config.rs` - Configuration management
  - `src/db.rs` - Database connection
  - `src/error.rs` - Error types

#### Authentication Service (`reticulum-auth`)
- **Responsibility**: User registration, login, JWT tokens
- **Important Files**:
  - `src/jwt.rs` - JWT generation/validation
  - `src/handlers.rs` - HTTP handlers
  - `src/models.rs` - Request/response types

#### Hub Service (`reticulum-hub`)
- **Responsibility**: Room management, entity CRUD
- **Important Files**:
  - `src/room.rs` - Room state machine
  - `src/entity.rs` - Entity management
  - `src/handlers.rs` - HTTP handlers

#### Presence Service (`reticulum-presence`)
- **Responsibility**: WebRTC signaling, session management
- **Important Files**:
  - `src/session.rs` - Session manager
  - `src/signaling.rs` - WebRTC signaling
  - `src/handlers.rs` - HTTP handlers

---

## Section 06. Runtime View

### 6.1 Main Scenarios

#### Scenario 1: User Login and Join Room

```
User → Auth Service (POST /login)
     → Validate credentials
     → Generate JWT token
     → Return token

User → Hub Service (POST /rooms/{id}/join)
     → Validate JWT token
     → Check room capacity
     → Add user to room
     → Return success

User → Presence Service (WebTransport connect)
     → Establish connection
     → Join room session
     → Start receiving position updates
```

#### Scenario 2: Position Synchronization

```
Client → Presence Service (position update)
     → Parse message
     → Broadcast to other clients in room
     → Update room state

Other Clients ← Receive position update
     → Interpolate entity position
     → Update 3D scene
```

---

## Section 07. Deployment View

### 7.1 Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                       Kubernetes Cluster                     │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pod:       │  │   Pod:       │  │   Pod:       │     │
│  │   reticulum  │  │   reticulum  │  │   reticulum  │     │
│  │   -auth      │  │   -hub       │  │   -presence  │     │
│  │   (x3)       │  │   (x3)       │  │   (x3)       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                                │
│  ┌──────────────┐                                            │
│  │   Pod:       │                                            │
│  │   hub-client │                                            │
│  │   (Nginx)    │                                            │
│  └──────────────┘                                            │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ PostgreSQL   │  │   Redis      │                         │
│  │ (StatefulSet)│  │   (Cache)    │                         │
│  └──────────────┘  └──────────────┘                         │
│                                                                │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Deployment Artifacts

| Service | Container | Port | Replicas |
|---------|-----------|------|----------|
| reticulum-auth | `ghcr.io/your-org/graphwiz-reticulum-auth` | 4001 | 3 |
| reticulum-hub | `ghcr.io/your-org/graphwiz-reticulum-hub` | 4002 | 3 |
| reticulum-presence | `ghcr.io/your-org/graphwiz-reticulum-presence` | 4003 | 3 |
| hub-client | `ghcr.io/your-org/graphwiz-hub-client` | 8080 | 2 |

---

## Section 08. Cross-cutting Concepts

### 8.1 Security

| Aspect | Implementation |
|--------|----------------|
| Authentication | JWT tokens with Argon2 password hashing |
| Authorization | Role-based access control (future) |
| Transport | TLS 1.3 enforced for all services |
| Input Validation | Validator crate for all user input |

### 8.2 Logging & Monitoring

```rust
// Structured logging with tracing
use tracing::{info, error, instrument};

#[instrument(skip(db))]
async fn create_user(db: &DatabaseConnection, data: RegisterRequest) -> Result<User> {
    info!(email = %data.email, "Creating new user");
    // ...
}
```

### 8.3 Error Handling

```rust
// Centralized error handling
pub enum Error {
    Database(#[from] DbErr),
    Auth(String),
    Validation(String),
    NotFound(String),
    Internal(String),
}
```

---

## Section 09. Architecture Decisions

### 9.1 Rust vs Node.js for Backend

| Decision | **Use Rust** |
|----------|--------------|
| Context | Backend must handle thousands of concurrent connections |
| Pros | • Zero-cost abstractions<br>• Memory safety without GC<br>• tokio async runtime<br>• Predictable performance |
| Cons | • Steeper learning curve<br>• Longer compile times |
| Alternatives considered | Node.js (current Hubs), Go, Elixir |
| Status | **Decision made - using Rust** |

### 9.2 React Three Fiber vs A-Frame

| Decision | **Use React Three Fiber** |
|----------|---------------------------|
| Context | Frontend 3D rendering engine |
| Pros | • Declarative syntax<br>• React ecosystem<br>• Direct Three.js access<br>• Better performance |
| Cons | • Smaller ecosystem than A-Frame |
| Alternatives considered | A-Frame (current Hubs), Three.js directly, Babylon.js |
| Status | **Decision made - using R3F** |

### 9.3 Tauri vs Electron

| Decision | **Use Tauri** |
|----------|----------------|
| Context | Spoke editor desktop application |
| Pros | • Native WebView (10x smaller)<br>• Rust backend<br>• Shared React UI with client |
| Cons | • Less mature than Electron |
| Alternatives considered | Electron (current Spoke), Neutralino |
| Status | **Decision made - using Tauri** |

---

## Section 10. Quality Scenarios

### 10.1 Performance

| Scenario | Expected Result |
|----------|----------------|
| 50 avatars in room | 60 FPS, 100ms position latency |
| 1000 concurrent users | Server CPU < 50% |
| Initial page load | < 3s to first render |

### 10.2 Security

| Scenario | Expected Result |
|----------|----------------|
| SQL injection attempt | Blocked by prepared statements |
| Invalid JWT token | 401 Unauthorized response |
| XSS attempt | Input sanitization prevents execution |

---

## Section 11. Risks and Technical Debts

### 11.1 Risks

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| 1 | WebTransport browser support | Medium | High | WebSocket fallback |
| 2 | Rust learning curve | High | Medium | Training, pair programming |
| 3 | Performance targets not met | Medium | High | Early prototyping, benchmarks |

### 11.2 Technical Debts

| # | Debt | Planned Fix |
|---|------|-------------|
| 1 | No authentication middleware | Phase 2 |
| 2 | Hardcoded configuration | Phase 1 |
| 3 | Limited test coverage | Ongoing |

---

## Section 12. Glossary

| Term | Definition |
|------|------------|
| **Reticulum** | Backend service suite for GraphWiz-XR |
| **Hubs** | Main VR client application |
| **Spoke** | 3D scene editor |
| **WebTransport** | Next-gen web transport protocol (HTTP/3) |
| **gRPC** | RPC framework using Protocol Buffers |
| **R3F** | React Three Fiber |
| **ECS** | Entity Component System pattern |
| **JWT** | JSON Web Token for authentication |

---

## Section 13. Open Points

| # | Open Point | Status |
|---|------------|--------|
| 1 | OAuth provider selection | Open |
| 2 | Voice chat codec choice | Open |
| 3 | Asset storage backend (S3, GCS, local?) | Open |
| 4 | Mobile support strategy | Open |

---

**Document Information:**
- **Project:** GraphWiz-XR
- **Version:** 0.1.0
- **Last Modified:** 2025-01-24
- **Authors:** GraphWiz-XR Development Team
