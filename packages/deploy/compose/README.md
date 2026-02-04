# GraphWiz-XR Local Development with Docker Compose

This guide covers setting up GraphWiz-XR for local development using Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 8GB+ RAM available for Docker
- 20GB+ disk space

## Quick Start

1. **Clone and navigate to project:**
   ```bash
   cd /opt/git/graphwiz-xr
   ```

2. **Copy environment configuration:**
   ```bash
   cp packages/deploy/compose/.env.example packages/deploy/compose/.env
   ```

3. **Start all services:**
   ```bash
   cd packages/deploy/compose
   docker-compose up -d
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Access services:**
   - Hub Client: http://localhost:5173
   - Admin Client: http://localhost:5174
   - Auth API: http://localhost:8001
   - Hub API: http://localhost:8002
   - Presence API: http://localhost:8003
   - SFU API: http://localhost:8004

## Services

### Infrastructure

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Caching and sessions |

### Backend Services

| Service | Port | Description |
|---------|------|-------------|
| Auth | 8001 | Authentication & JWT |
| Hub | 8002 | Room & entity management |
| Presence | 8003 | WebRTC signaling & WebTransport |
| SFU | 8004 | WebRTC media forwarding |

### Frontend Services

| Service | Port | Description |
|---------|------|-------------|
| Hub Client | 5173 | Main VR client (Vite dev server) |
| Admin Client | 5174 | Admin dashboard (Vite dev server) |

### Optional

| Service | Port | Description |
|---------|------|-------------|
| Nginx | 80, 443 | Reverse proxy (use `--profile with-proxy`) |

## Docker Compose Commands

### Basic Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart auth

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f sfu
```

### Build Commands

```bash
# Rebuild and start all services
docker-compose up --build -d

# Rebuild a specific service
docker-compose build auth

# Rebuild without cache
docker-compose build --no-cache sfu
```

### Database Commands

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U graphwiz -d graphwiz

# Run migrations
docker-compose exec auth ./reticulum-auth migrate

# Reset database (CAUTION: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Debugging

```bash
# Shell into a running container
docker-compose exec auth sh

# Check container status
docker-compose ps

# View resource usage
docker stats

# Inspect container logs
docker-compose logs --tail=100 auth
```

## Environment Variables

Key environment variables (see `.env.example` for full list):

### Database
- `DATABASE_URL` - PostgreSQL connection string
- `DATABASE_HOST` - Database host (default: `postgres`)
- `DATABASE_PORT` - Database port (default: `5432`)

### Redis
- `REDIS_URL` - Redis connection string (default: `redis://redis:6379`)

### Services
- `RUST_LOG` - Log level: `trace`, `debug`, `info`, `warn`, `error`
- `SERVER_WORKERS` - Number of worker threads per service

### SFU
- `SFU_MAX_ROOMS` - Maximum concurrent rooms (default: `100`)
- `SFU_MAX_PEERS_PER_ROOM` - Maximum peers per room (default: `50`)
- `SFU_ENABLE_SIMULCAST` - Enable simulcast for adaptive quality (default: `true`)

## Development Workflow

### Running Services Individually

For faster iteration, you can run services outside Docker:

```bash
# Start infrastructure only
docker-compose up -d postgres redis

# Run Rust services locally (with cargo)
cd packages/services/reticulum/auth
cargo run

# Run TypeScript clients locally (with pnpm)
cd packages/clients/hub-client
pnpm dev
```

### Hot Reloading

TypeScript clients support hot reloading:
```bash
# Client will auto-reload on file changes
docker-compose up hub-client
```

For Rust services, use `cargo-watch`:
```bash
cd packages/services/reticulum/auth
cargo install cargo-watch
cargo watch -x run
```

### Database Migrations

```bash
# Create a new migration
docker-compose exec auth diesel migration generate create_users_table

# Run migrations
docker-compose exec auth diesel migration run

# Rollback last migration
docker-compose exec auth diesel migration revert
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :5432

# Kill process
kill -9 <PID>
```

### Container Won't Start

```bash
# Check logs
docker-compose logs <service>

# Rebuild without cache
docker-compose build --no-cache <service>

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify connection
docker-compose exec auth pg_isready -h postgres -U graphwiz
```

### Out of Memory

```bash
# Reduce worker count in docker-compose.yml
environment:
  SERVER_WORKERS: 1

# Or increase Docker memory limit
# Docker Desktop > Settings > Resources > Memory
```

## Performance Tuning

### PostgreSQL

```bash
# Connect to database
docker-compose exec postgres psql -U graphwiz

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check table sizes
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

### Redis

```bash
# Check memory usage
docker-compose exec redis redis-cli INFO memory

# Monitor commands
docker-compose exec redis redis-cli MONITOR
```

### Service Scaling

```bash
# Scale a service (e.g., more auth workers)
docker-compose up -d --scale auth=3
```

## Production Deployment

For production, consider:

1. **Use separate compose file** (`docker-compose.prod.yml`)
2. **Enable SSL/TLS** with Let's Encrypt
3. **Use external PostgreSQL** (managed service)
4. **Configure resource limits** in compose file
5. **Set up monitoring** (Prometheus, Grafana)
6. **Use secrets management** (Docker secrets, Vault)
7. **Enable nginx proxy** with `--profile with-proxy`

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (deletes database data!)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Complete reset
docker-compose down -v --rmi all
docker system prune -a
```

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Rust Service Documentation](../../services/reticulum/auth/README.md)
- [SFU Service Documentation](../../services/reticulum/sfu/README.md)
- [Client Development](../../../clients/hub-client/README.md)
