# Database Migrations Guide

This guide explains how to use the database migrations for the Reticulum services.

## Overview

The migrations package contains all database schema changes for the Reticulum platform. It includes migrations for:

- **Users** (`m20250101_000001`) - User accounts with authentication
- **Rooms** (`m20250101_000002`) - Virtual room/hub management
- **Sessions** (`m20250101_000003`) - Active user sessions in hubs
- **Entities** (`m20250101_000004`) - 3D entities and objects in virtual spaces
- **OAuth & Magic Links** (`m20250101_000005`) - OAuth accounts, roles, and magic link authentication
- **Profile Settings** (`m20250101_000006`) - User profile and settings

## Migration Files

### OAuth Accounts (`m20250101_000005_add_oauth_and_sessions`)

Creates tables for OAuth authentication and magic link login:

```sql
-- OAuth Accounts Table
CREATE TABLE oauth_accounts (
    id SERIAL PRIMARY KEY,
    provider VARCHAR NOT NULL,           -- 'github', 'google', 'discord'
    provider_user_id VARCHAR NOT NULL,  -- Provider's user ID
    user_id INTEGER NOT NULL,           -- Reference to users.id
    access_token VARCHAR,                -- OAuth access token (optional)
    refresh_token VARCHAR,               -- OAuth refresh token (optional)
    expires_at TIMESTAMP,                -- Token expiration time
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_oauth_accounts_user_id
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_oauth_accounts_provider
    ON oauth_accounts(provider, provider_user_id);

CREATE INDEX idx_oauth_accounts_user_id
    ON oauth_accounts(user_id);

-- Magic Link Tokens Table
CREATE TABLE magic_link_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_magic_link_tokens_email ON magic_link_tokens(email);
CREATE INDEX idx_magic_link_tokens_expires_at ON magic_link_tokens(expires_at);

-- Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role VARCHAR NOT NULL,               -- 'USER', 'MODERATOR', 'ADMIN'
    granted_by INTEGER NOT NULL,
    granted_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_roles_user_id
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_roles_granted_by
        FOREIGN KEY (granted_by) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_roles_user_role
    ON roles(user_id, role);
```

### Sessions (`m20250101_000003_create_sessions`)

Creates table for tracking active hub sessions:

```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR UNIQUE,
    user_id VARCHAR,
    room_id VARCHAR,
    client_id VARCHAR,
    created_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_sessions_session_id ON sessions(session_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_room_id ON sessions(room_id);
```

## Running Migrations

### Using the Migration Runner

You can run migrations programmatically using the migration runner:

```rust
use reticulum_migrations::runner::run_migrations;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let database_url = "postgresql://user:pass@localhost/reticulum";
    run_migrations(database_url).await?;
    Ok(())
}
```

### Using SeaORM CLI

Install the sea-orm-cli tool:

```bash
cargo install sea-orm-cli
```

Run migrations:

```bash
# Set database URL
export DATABASE_URL="postgresql://user:pass@localhost/reticulum"

# Run all pending migrations
sea-orm-cli migrate up

# Rollback last migration
sea-orm-cli migrate down

# Check migration status
sea-orm-cli migrate status

# Fresh start (drop all and re-migrate)
sea-orm-cli migrate fresh
```

### Using Cargo

You can create a binary in your project to run migrations:

```rust
// src/bin/migrate.rs
use reticulum_migrations::runner::run_migrations;
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    run_migrations(&database_url).await?;
    Ok(())
}
```

Then run:

```bash
cargo run --bin migrate
```

## Migration API

### Run Migrations

```rust
use reticulum_migrations::runner::run_migrations;

run_migrations("postgresql://...").await?;
```

### Rollback Last Migration

```rust
use reticulum_migrations::runner::rollback_last_migration;

rollback_last_migration("postgresql://...").await?;
```

### Get Migration Status

```rust
use reticulum_migrations::runner::get_migration_status;

get_migration_status("postgresql://...").await?;
```

### Fresh Start (⚠️ DESTRUCTIVE)

```rust
use reticulum_migrations::runner::fresh_start;

// WARNING: This will delete all data!
fresh_start("postgresql://...").await?;
```

## Environment Variables

The following environment variables are used for database connections:

- `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgresql://user:password@host/database`
- `TEST_DATABASE_URL` - Database for running tests
  - Defaults to `postgresql://postgres:postgres@localhost/test_reticulum`

## Database Setup

### PostgreSQL Setup

1. **Install PostgreSQL:**
   ```bash
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib

   # macOS
   brew install postgresql

   # Windows
   # Download from postgresql.org
   ```

2. **Create Database:**
   ```bash
   # Connect to PostgreSQL
   sudo -u postgres psql

   # Create database
   CREATE DATABASE reticulum;

   # Create user (optional)
   CREATE USER reticulum_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE reticulum TO reticulum_user;

   # Exit
   \q
   ```

3. **Set Environment Variable:**
   ```bash
   export DATABASE_URL="postgresql://reticulum_user:your_password@localhost/reticulum"
   ```

### Using Docker

Run PostgreSQL in Docker:

```bash
docker run -d \
  --name reticulum-db \
  -e POSTGRES_USER=reticulum \
  -e POSTGRES_PASSWORD=reticulum_pass \
  -e POSTGRES_DB=reticulum \
  -p 5432:5432 \
  postgres:15
```

Then connect with:
```
postgresql://reticulum:reticulum_pass@localhost:5432/reticulum
```

## Development Workflow

### Creating a New Migration

1. Create a new migration file:
   ```bash
   # Naming convention: m{YYYYMMDD}_{sequence}_{description}.rs
   # Example: m20250115_000007_add_user_preferences.rs
   ```

2. Use the migration template:

```rust
use sea_orm_migration::prelude::*;
use sea_query::{ColumnDef, Table};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(YourTable::Table)
                    .if_not_exists()
                    .col(&mut ColumnDef::new(YourTable::Id)
                        .integer()
                        .auto_increment()
                        .primary_key())
                    // Add more columns...
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(YourTable::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum YourTable {
    Table,
    Id,
    // Add your fields...
}
```

3. Add the module to `lib.rs`:
   ```rust
   mod m20250115_000007_add_user_preferences;
   ```

4. Add to migrator:
   ```rust
   Box::new(m20250115_000007_add_user_preferences::Migration),
   ```

### Testing Migrations

Always test your migrations:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore]
    async fn test_migration() {
        let db_url = std::env::var("TEST_DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://postgres:postgres@localhost/test".to_string());

        let db = sea_orm::Database::connect(&db_url).await.unwrap();
        let manager = SchemaManager::new(&db);

        // Test up migration
        Self.up(&manager).await.unwrap();

        // Test down migration
        Self.down(&manager).await.unwrap();
    }
}
```

## Best Practices

1. **Always provide both `up()` and `down()` methods** - migrations should be reversible
2. **Use `if_not_exists()`** - makes migrations idempotent
3. **Add foreign key constraints with `ON DELETE CASCADE`** - prevents orphaned records
4. **Create indexes for frequently queried columns** - improves performance
5. **Test migrations on a copy of production data** - ensures they work in real scenarios
6. **Never modify existing migrations** - always create a new one
7. **Use descriptive names** - helps with understanding the migration history

## Troubleshooting

### Migration Already Applied

If a migration fails because it's already applied:

```bash
# Check sea_migration table
SELECT * FROM sea_migration;

# Remove the entry if needed
DELETE FROM sea_migration WHERE version = '20250101_000005';
```

### Connection Issues

If you can't connect to the database:

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U postgres -d reticulum -h localhost

# Check port
netstat -an | grep 5432
```

### Permission Errors

Ensure your database user has the necessary permissions:

```sql
GRANT ALL PRIVILEGES ON DATABASE reticulum TO reticulum_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO reticulum_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO reticulum_user;
```

## Related Documentation

- [SeaORM Migration Documentation](https://www.sea-ql.org/SeaORM/docs/migration)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [Redis Session Management](../../auth/src/session.rs)

## Support

For issues or questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review the [migration files](./src/)
3. Consult [SeaORM documentation](https://www.sea-ql.org/SeaORM/)
