# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-09 **Commit:** 3349bf3 **Branch:** main

## OVERVIEW

Reticulum Core: Shared utility library for all Rust backend microservices.

## STRUCTURE

```
core/src/
├── auth.rs, cache.rs, config.rs, db.rs, error.rs, jwt.rs
├── log_store.rs, metrics.rs, middleware.rs
└── models/ (9 SeaORM files: assets, entities, magic_link_tokens,
           oauth_accounts, rooms, sessions, upload_sessions, roles, room_states, users)
```

## WHERE TO LOOK

| Task            | Location      | Notes                                     |
| --------------- | ------------- | ----------------------------------------- |
| Error handling  | error.rs      | Builder methods + ResponseError trait     |
| Auth middleware | middleware.rs | auth_middleware, optional_auth_middleware |
| User extraction | middleware.rs | AuthUser, OptionalAuthUser structs        |
| DB connection   | db.rs         | Pooling (1-10 conns), 8s timeouts         |
| Migrations      | db.rs         | SeaORM MigratorTrait                      |
| Cache ops       | cache.rs      | Redis with auto-expiration, TTL constants |
| JWT ops         | jwt.rs        | JwtManager, Claims, TokenPair             |
| Passwords       | auth.rs       | Argon2 hash/verify, strength validation   |
| Configuration   | config.rs     | ENV prefix: RETICULUM\_\_                 |

## CONVENTIONS

**Error Pattern:** `Error::auth()`, `Error::not_found()`, `Error::validation()` → auto HTTP codes (DB→500, Auth→401, NotFound→404)

**Middleware:** auth_middleware (required, rejects unauth), optional_auth_middleware (continues), AuthUser/OptionalAuthUser extractors

**Database:** `db::connect()` with pooling, `run_migrations()` via SeaORM

**Cache:** `CacheManager::new()` (dev) or `with_redis()`, TTL: SHORT(1m)/MEDIUM(5m)/LONG(1h)/VERY_LONG(24h)

**JWT:** `JwtManager::new(secret, issuer, 3600s, 86400s)` → `create_token_pair()`, `validate_access_token()`

**Passwords:** `validate_password_strength()` → `hash_password()` → `verify_password()` (8-128 chars, upper/lower/digit/special)

**Config:** `Config::load_or_default()`, defaults: host=0.0.0.0, port=4000, db_url=postgresql://...

## ANTI-PATTERNS

- No `.unwrap()` - use `?` operator
- No secrets in errors - generic messages only
- No hardcoded config - use Config struct, ENV override
- No missing middleware - protected routes require auth_middleware
- No direct DB access - use db::connect() pooling
- No cache key conflicts - use cache_keys:: module
- No JWT reuse - generate new tokens, no plaintext storage
- No bypassing password validation - always validate first
- No synchronous cache - all async, await operations
- No logging sensitive data - never passwords/tokens/PII
