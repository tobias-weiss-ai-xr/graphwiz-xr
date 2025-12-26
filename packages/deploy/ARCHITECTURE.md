# GraphWiz-XR Development Environment - Visual Overview

## Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Network: graphwiz-dev-network         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐      ┌────────────────┐                    │
│  │   postgres:15  │      │    redis:7     │                    │
│  │    Port: 5432  │      │    Port: 6379  │                    │
│  │                │      │                │                    │
│  │  Vol:          │      │  Vol:          │                    │
│  │  postgres_data │      │  redis_data    │                    │
│  └────────────────┘      └────────────────┘                    │
│         │                         │                             │
│         └──────────┬──────────────┘                             │
│                    │                                             │
│  ┌─────────────────▼─────────────────┐                         │
│  │     adminer (DB Management)       │                         │
│  │           Port: 8080               │                         │
│  └────────────────────────────────────┘                         │
│                                                                  │
│  ┌────────────────────────────────────────────┐                │
│  │   Core API (Rust Backend)                   │                │
│  │   Port: 8000                                │                │
│  │                                             │                │
│  │   Hot Reload: cargo-watch                   │                │
│  │   Mounts:                                   │                │
│  │   - packages/services/reticulum/            │                │
│  │   - cargo registry (cached)                 │                │
│  │   - target/ (cached)                        │                │
│  │                                             │                │
│  │   Dependencies:                             │                │
│  │   - postgres (database)                     │                │
│  │   - redis (caching/sessions)                │                │
│  └────────────────────────────────────────────┘                │
│                    │                                             │
│                    │ HTTP/WebSocket                              │
│                    ▼                                             │
│  ┌────────────────────────────────────────────┐                │
│  │   Hub Client (Vite Frontend)               │                │
│  │   Port: 5173                                │                │
│  │                                             │                │
│  │   Hot Reload: Vite HMR                      │                │
│  │   Mounts:                                   │                │
│  │   - packages/clients/hub-client/            │                │
│  │   - node_modules (cached)                   │                │
│  └────────────────────────────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Hot Reload Flow

### Backend (Rust) - Cargo Watch
```
Developer edits file
         │
         ▼
File saved to disk
         │
         ▼
cargo-watch detects change (in container)
         │
         ▼
cargo build --bin reticulum-core
         │
         ▼
Binary recompiled (10-30s incremental)
         │
         ▼
Process restarts
         │
         ▼
New code running
```

### Frontend (TypeScript) - Vite HMR
```
Developer edits file
         │
         ▼
File saved to disk
         │
         ▼
Vite detects change (in container)
         │
         ▼
Module hot-update via WebSocket
         │
         ▼
Browser receives update (100-200ms)
         │
         ▼
Page updates without refresh
```

## Development Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Initial Setup (One Time)                                │
├─────────────────────────────────────────────────────────────┤
│  $ cd packages/deploy                                       │
│  $ ./setup-dev.sh                                           │
│  $ make -f Makefile.dev up                                  │
│                                                              │
│  Output: All services running and ready                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  2. Active Development (Daily)                              │
├─────────────────────────────────────────────────────────────┤
│  Terminal 1: $ make -f Makefile.dev logs-api                │
│  Terminal 2: $ make -f Makefile.dev logs-client             │
│  IDE:        Edit files in packages/                        │
│                                                              │
│  Changes:                                                   │
│    - Rust: Auto-recompile (10-30s)                          │
│    - TS:   Instant HMR (100-200ms)                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  3. Testing & Debugging                                     │
├─────────────────────────────────────────────────────────────┤
│  Browser:    http://localhost:5173 (Hub Client)             │
│  API:        http://localhost:8000 (Core API)               │
│  Adminer:    http://localhost:8080 (DB UI)                  │
│                                                              │
│  Database:  $ make -f Makefile.dev db                       │
│  Shell:     $ make -f Makefile.dev shell-api                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  4. Cleanup (End of Day)                                    │
├─────────────────────────────────────────────────────────────┤
│  Stop:     $ make -f Makefile.dev down                      │
│  Destroy:  $ make -f Makefile.dev clean                     │
└─────────────────────────────────────────────────────────────┘
```

## Volume Mount Strategy

```
Host Machine                    Container
─────────────                  ─────────────────────────────────

packages/services/
  reticulum/           ──────►  /app/packages/services/reticulum
    core/
    auth/
    hub/
    presence/

packages/clients/
  hub-client/          ──────►  /app (Vite working directory)

[Cached Volumes]
cargo_registry        ──────►  /usr/local/cargo/registry
cargo_git             ──────►  /usr/local/cargo/git
target_cache          ──────►  /app/target
node_modules          ──────►  /app/node_modules
```

## Port Mapping

```
External Port    Container       Service
─────────────    ─────────────   ─────────────────────────
5432         →   postgres:5432   PostgreSQL database
6379         →   redis:6379      Redis cache/sessions
8080         →   adminer:8080    Database management UI
8000         →   core-api:8000   Rust backend API
5173         →   hub-client:5173 Vite dev server
```

## Environment Configuration

```
.env.dev.example  ──────►  .env (created by setup script)
                                   │
                                   ├─► DATABASE_URL=postgresql://...
                                   ├─► REDIS_URL=redis://...
                                   ├─► RUST_LOG=debug
                                   ├─► JWT_SECRET=...
                                   └─► VITE_API_BASE_URL=...
                                          │
                                          ▼
                              Injected into containers
                              via docker-compose.dev.yml
```

## File Access Patterns

### Backend Development
```
Code Location:  packages/services/reticulum/
Edit Tool:      IDE (VS Code, IntelliJ, etc.)
Watch Tool:     cargo-watch (inside container)
Build Tool:     cargo (inside container)
Reload Time:    10-30 seconds (incremental)
Log Location:   docker logs graphwiz-core-api-dev
```

### Frontend Development
```
Code Location:  packages/clients/hub-client/
Edit Tool:      IDE (VS Code, IntelliJ, etc.)
Watch Tool:     Vite dev server (inside container)
Build Tool:     Vite (inside container)
Reload Time:    100-200ms (HMR)
Log Location:   docker logs graphwiz-hub-client-dev
```

## Performance Characteristics

### Startup Times
```
Initial build:     2-3 minutes (first time)
Container start:   5-10 seconds
Service ready:     15-30 seconds (includes DB init)
```

### Hot Reload Times
```
Rust changes:      10-30 seconds (incremental build)
TypeScript:        100-200ms (Vite HMR)
CSS changes:       50-100ms (Vite HMR)
```

### Resource Usage
```
Memory (idle):     2-3 GB total
Memory (active):   4-6 GB total
CPU (idle):        5-10%
CPU (building):    50-100% (multi-core)
Disk:              10-15 GB (including volumes)
```

## Debugging Access

```
Direct Container Access:
  $ docker exec -it graphwiz-core-api-dev bash
  $ docker exec -it graphwiz-hub-client-dev sh

Database Access:
  $ psql postgres://graphwiz:graphwiz_dev@localhost:5432/graphwiz
  $ docker exec -it graphwiz-postgres-dev psql -U graphwiz

Log Access:
  $ docker logs -f graphwiz-core-api-dev
  $ make -f Makefile.dev logs-api
  $ make -f Makefile.dev logs-client
```

## Development Benefits

1. **Instant Frontend Feedback** - Vite HMR updates in <200ms
2. **Fast Backend Iteration** - Incremental Rust builds in 10-30s
3. **Dependency Caching** - Cargo registry and npm modules cached
4. **Isolated Environment** - No local service installation needed
5. **Consistent Setup** - Team-wide identical environments
6. **Easy Cleanup** - Single command to reset everything
7. **Production Parity** - Same Docker stack, different configs
8. **Database Management** - Adminer UI for easy DB inspection
