# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-09
**Commit:** 3349bf3
**Branch:** main

## OVERVIEW

Six Rust microservices handling auth, rooms, presence, storage, media routing, and avatar management.

## STRUCTURE

```
reticulum/
├── auth/        # JWT, OAuth, magic links, session management
├── hub/         # Room/entity management, persistence
├── presence/    # WebSocket signaling, WebTransport, room broadcasting
├── storage/     # File uploads, chunked uploads, S3 abstraction
├── sfu/         # WebRTC media routing, RTP forwarding, simulcast
├── avatar/      # Avatar configuration management
└── core/        # Shared utilities (has own AGENTS.md)
```

## WHERE TO LOOK

| Task             | Location                         | Port | Purpose                          |
| ---------------- | -------------------------------- | ---- | -------------------------------- |
| Auth service     | `auth/src/`                      | 8001 | JWT, OAuth, magic links          |
| Hub service      | `hub/src/`                       | 8002 | Room/entity management           |
| Presence service | `presence/src/`                  | 8003 | WebSocket/WebTransport signaling |
| SFU service      | `sfu/src/`                       | 8004 | WebRTC media forwarding          |
| Storage service  | `storage/src/`                   | 8005 | File upload/download             |
| Avatar service   | `avatar/src/`                    | -    | Avatar configuration             |
| Common patterns  | `*/src/routes.rs`, `handlers.rs` | -    | Route config, HTTP handlers      |

## CONVENTIONS

### Service Structure

All services follow same pattern:

- `lib.rs` - Service struct with `run()` method, HttpServer setup
- `routes.rs` - `configure_routes(app)` function for Actix-Web routes
- `handlers.rs` - HTTP request handler functions
- `models.rs` (optional) - Service-specific data models
- `config.rs` (optional) - Service configuration struct
- Environment: `SERVER_PORT`, `DATABASE_URL`, `REDIS_URL`, `RUST_LOG`

### Dependencies

- All depend on `reticulum-core` for Config, middleware, errors, DB, auth
- Common workspace deps: `tokio`, `actix-web`, `serde`, `tracing`, `uuid`, `chrono`, `sqlx`

### Service Startup Pattern

```rust
let service = Service::new(config);
service.run().await  // Binds to config.server.host:port
```

## ANTI-PATTERNS

- **No `unwrap()`** - Use `?` operator for error handling
- **No duplicate code** - Core utilities in reticulum-core
- **No blocking operations** - All I/O async with tokio
- **No hardcoded values** - Use environment variables or Config
