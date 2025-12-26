# Reticulum Core

Core utilities and shared functionality for Reticulum microservices.

## Features

### Error Handling

Comprehensive error types with automatic HTTP response conversion:

```rust
use reticulum_core::Error;

// Create errors
let err = Error::auth("Invalid credentials");
let err = Error::not_found("User not found");
let err = Error::validation("Invalid email format");
```

### Configuration Management

Load configuration from files and environment variables:

```rust
use reticulum_core::Config;

// Load with defaults
let config = Config::load_or_default()?;

// Access configuration
let db_url = &config.database.url;
let jwt_secret = &config.auth.jwt_secret;
```

Environment variables (with `RETICULUM__` prefix):
- `RETICULUM__DATABASE__URL`
- `RETICULUM__AUTH__JWT_SECRET`
- `RETICULUM__SERVER__PORT`

### Database Connection

Establish database connections with pooling:

```rust
use reticulum_core::db;

// Connect to database
let db = db::connect(&config).await?;

// Run migrations
db::run_migrations(&config).await?;
```

### JWT Token Management

Create and validate JWT tokens:

```rust
use reticulum_core::JwtManager;
use uuid::Uuid;

let manager = JwtManager::new(
    secret,
    "reticulum".to_string(),
    3600,   // access token expiration (seconds)
    86400,  // refresh token expiration (seconds)
);

// Create token pair
let user_id = Uuid::new_v4();
let tokens = manager.create_token_pair(user_id)?;

// Validate tokens
let claims = manager.validate_access_token(&tokens.access_token)?;
```

### Password Hashing

Secure password hashing using Argon2:

```rust
use reticulum_core::{hash_password, verify_password, validate_password_strength};

// Validate password strength
validate_password_strength("MySecurePass123!")?;

// Hash password
let hash = hash_password("MySecurePass123!")?;

// Verify password
let is_valid = verify_password("MySecurePass123!", &hash)?;
```

Password requirements:
- Minimum 8 characters
- Maximum 128 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one digit
- At least one special character

### Authentication Middleware

Protect routes with JWT authentication:

```rust
use actix_web::{web, App};
use reticulum_core::middleware::{AuthMiddleware, AuthUser};
use std::sync::Arc;

let jwt_manager = Arc::new(manager);

// Protect routes
App::new()
    .wrap(AuthMiddleware::new(jwt_manager.clone()))
    .route("/protected", web::get().to(protected_route));

// Extract authenticated user
async fn protected_route(user: AuthUser) -> String {
    format!("Hello, user {}", user.id)
}
```

Optional authentication (doesn't reject unauthenticated requests):

```rust
use reticulum_core::middleware::{OptionalAuthMiddleware, OptionalAuthUser};

App::new()
    .wrap(OptionalAuthMiddleware::new(jwt_manager.clone()))
    .route("/optional", web::get().to(optional_route));

async fn optional_route(OptionalAuthUser(user): OptionalAuthUser) -> String {
    match user {
        Some(user) => format!("Hello, {}", user.id),
        None => "Hello, anonymous".to_string(),
    }
}
```

### Logging Middleware

Log all HTTP requests:

```rust
use reticulum_core::middleware::LoggingMiddleware;

App::new()
    .wrap(LoggingMiddleware)
    .route("/api", web::get().to(handler))
```

## Running Tests

```bash
# Run all tests
cargo test -p reticulum-core

# Run tests with output
cargo test -p reticulum-core -- --nocapture

# Run specific test
cargo test -p reticulum-core test_password_hashing
```

## Database Migrations

Migrations are managed by the `reticulum-migrations` crate:

```bash
# Run migrations
cargo run -p reticulum-core -- run-migrations
```

Available migrations:
- `m20250101_000001_create_users` - Users table
- `m20250101_000002_create_rooms` - Rooms table
- `m20250101_000003_create_sessions` - Sessions table
- `m20250101_000004_create_entities` - Entities table

## License

MIT
