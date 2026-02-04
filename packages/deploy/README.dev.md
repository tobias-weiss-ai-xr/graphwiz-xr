# GraphWiz-XR Development Docker Setup

Complete local development environment with hot-reload capabilities for both Rust backend services and TypeScript frontend clients.

## Overview

This setup provides:
- **PostgreSQL 15** - Primary database with persistent storage
- **Redis 7** - Caching, sessions, and presence tracking
- **Adminer** - Database management UI
- **Core API** - Rust backend with cargo-watch hot reload
- **Hub Client** - Vite dev server with HMR (Hot Module Replacement)

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum (8GB recommended)
- 10GB free disk space

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.dev.example .env
   ```

2. **Start all services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **View logs:**
   ```bash
   # All services
   docker-compose -f docker-compose.dev.yml logs -f

   # Specific service
   docker-compose -f docker-compose.dev.yml logs -f core-api
   docker-compose -f docker-compose.dev.yml logs -f hub-client
   ```

4. **Access services:**
   - Hub Client: http://localhost:5173
   - Core API: http://localhost:8000
   - Adminer (DB UI): http://localhost:8080
     - Server: postgres
     - User: graphwiz
     - Password: graphwiz_dev
     - Database: graphwiz

## Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Hub Client    │    │   Adminer UI    │    │  Core API (Rust)│
│   (Vite HMR)    │    │   (DB Admin)    │    │  (cargo-watch)  │
│   Port: 5173    │    │   Port: 8080    │    │   Port: 8000    │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         └──────────────────────┴──────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼─────┐            ┌──────▼──────┐
              │ PostgreSQL│            │    Redis    │
              │  Port: 5432│           │  Port: 6379 │
              └───────────┘            └─────────────┘
```

## Hot Reload Capabilities

### Rust Backend (Core API)
- Uses `cargo-watch` to monitor file changes
- Automatically recompiles and restarts on code changes
- Initial compilation: 2-3 minutes
- Incremental rebuilds: 10-30 seconds

**Trigger rebuild:**
```bash
# Modify any Rust file in packages/services/reticulum/
# Container will automatically recompile
```

### TypeScript Frontend (Hub Client)
- Uses Vite's HMR for instant updates
- Changes appear in browser without full refresh
- Near-instant (100-200ms)

**Trigger HMR:**
```bash
# Modify any file in packages/clients/hub-client/
# Changes appear immediately in browser
```

## Development Workflow

### 1. Initial Setup
```bash
# Start services in background
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be healthy (check logs)
docker-compose -f docker-compose.dev.yml logs -f
```

### 2. Active Development
```bash
# Terminal 1: Watch backend logs
docker-compose -f docker-compose.dev.yml logs -f core-api

# Terminal 2: Watch frontend logs
docker-compose -f docker-compose.dev.yml logs -f hub-client

# Edit code in your IDE
# Changes trigger automatic rebuilds/HMR
```

### 3. Database Operations
```bash
# Access Adminer at http://localhost:8080
# Or use psql directly
docker exec -it graphwiz-postgres-dev psql -U graphwiz -d graphwiz

# Run migrations (from core-api container)
docker exec -it graphwiz-core-api-dev sqlx migrate run
```

### 4. Debugging
```bash
# Check container status
docker-compose -f docker-compose.dev.yml ps

# Restart specific service
docker-compose -f docker-compose.dev.yml restart core-api

# Rebuild from scratch
docker-compose -f docker-compose.dev.yml up -d --build core-api

# Inspect container logs
docker logs graphwiz-core-api-dev
docker logs graphwiz-hub-client-dev
```

### 5. Cleanup
```bash
# Stop services (preserves data)
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (destroys data)
docker-compose -f docker-compose.dev.yml down -v

# Clean rebuild (remove images and rebuild)
docker-compose -f docker-compose.dev.yml down -v --rmi all
docker-compose -f docker-compose.dev.yml up -d --build
```

## File Structure

```
packages/deploy/
├── docker-compose.dev.yml       # Development compose file
├── Dockerfile.core-dev          # Rust backend with hot reload
├── Dockerfile.hub-client-dev    # Frontend with HMR
├── .env.dev.example             # Environment variables template
└── README.dev.md                # This file

packages/
├── services/reticulum/          # Rust services (mounted as volume)
│   ├── core/
│   ├── auth/
│   ├── hub/
│   └── presence/
└── clients/hub-client/          # Frontend (mounted as volume)
```

## Environment Variables

Key variables in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_PORT` | 5432 | PostgreSQL external port |
| `REDIS_PORT` | 6379 | Redis external port |
| `CORE_API_PORT` | 8000 | Rust API external port |
| `HUB_CLIENT_PORT` | 5173 | Vite dev server port |
| `RUST_LOG` | debug | Rust logging level |
| `JWT_SECRET` | graphwiz_dev_secret | JWT signing key |

See `.env.dev.example` for complete list.

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8000  # Core API
lsof -i :5173  # Hub Client

# Change port in .env file
DATABASE_PORT=5433
REDIS_PORT=6380
```

### Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs core-api

# Rebuild container
docker-compose -f docker-compose.dev.yml up -d --build core-api

# Remove volumes and start fresh
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Rust Compilation Fails
```bash
# Enter container for manual build
docker exec -it graphwiz-core-api-dev bash

# Try manual build
cd /app
cargo build -p reticulum-core

# Check for errors
cargo check -p reticulum-core
```

### Hot Reload Not Working
```bash
# Verify volume mounts
docker inspect graphwiz-core-api-dev | grep Mounts -A 20

# Restart container
docker-compose -f docker-compose.dev.yml restart core-api

# Check file permissions (Linux)
sudo chown -R $USER:$USER packages/
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
docker exec -it graphwiz-postgres-dev psql -U graphwiz -d graphwiz

# Check PostgreSQL logs
docker logs graphwiz-postgres-dev

# Restart database
docker-compose -f docker-compose.dev.yml restart postgres
```

## Performance Tips

### Faster Rust Builds
1. **Use cargo-cache:** The setup includes cached Cargo registry and build artifacts
2. **Reduce dependency changes:** Minimize `Cargo.toml` modifications
3. **Use `cargo check`** for faster error checking without full compilation

### Reduced Docker Resource Usage
```bash
# Limit container resources in docker-compose.dev.yml:
services:
  core-api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### Enable BuildKit for Faster Builds
```bash
# Enable Docker BuildKit
export DOCKER_BUILDKIT=1

# Build with BuildKit
docker-compose -f docker-compose.dev.yml build
```

## Production Deployment

For production deployment, use the standard docker-compose.yml instead:
```bash
# Production setup (without hot reload)
docker-compose -f compose/docker-compose.yml up -d
```

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Vite HMR Guide](https://vitejs.dev/guide/features.html#hot-module-replacement)
- [cargo-watch](https://github.com/passcod/cargo-watch)
- [Rust Docker Patterns](https://rust-lang.github.io/rustup/docker-for-rust.html)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review container logs
3. Verify environment variables
4. Check port availability
5. Ensure Docker resources are sufficient
