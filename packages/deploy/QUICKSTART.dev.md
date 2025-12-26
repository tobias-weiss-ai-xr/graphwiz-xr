# GraphWiz-XR Development Quick Start

## One-Time Setup

```bash
# Navigate to deploy directory
cd packages/deploy

# Run setup script
./setup-dev.sh

# Or manually copy the example file
cp .env.dev.example .env
```

## Start Development Environment

```bash
# Option 1: Using Makefile (recommended)
make -f Makefile.dev up

# Option 2: Using Docker Compose directly
docker-compose -f docker-compose.dev.yml up -d

# View logs
make -f Makefile.dev logs
```

## Access Services

Once running:
- **Hub Client**: http://localhost:5173
- **Core API**: http://localhost:8000
- **Adminer (DB)**: http://localhost:8080
  - System: PostgreSQL
  - Server: postgres
  - User: graphwiz
  - Pass: graphwiz_dev
  - DB: graphwiz

## Common Commands

```bash
# Start services
make -f Makefile.dev up

# Stop services
make -f Makefile.dev down

# Restart services
make -f Makefile.dev restart

# View logs
make -f Makefile.dev logs
make -f Makefile.dev logs-api
make -f Makefile.dev logs-client

# Rebuild containers
make -f Makefile.dev rebuild

# Check status
make -f Makefile.dev status

# Access database shell
make -f Makefile.dev db

# Access container shell
make -f Makefile.dev shell-api
make -f Makefile.dev shell-client
```

## Hot Reload Development

### Backend (Rust)
1. Edit files in `packages/services/reticulum/`
2. Container auto-recompiles (10-30s)
3. Watch logs: `make -f Makefile.dev logs-api`

### Frontend (TypeScript)
1. Edit files in `packages/clients/hub-client/`
2. Browser auto-refreshes (instant HMR)
3. Watch logs: `make -f Makefile.dev logs-client`

## Troubleshooting

### Port already in use?
Edit `.env` and change ports:
```bash
DATABASE_PORT=5433
REDIS_PORT=6380
CORE_API_PORT=8001
HUB_CLIENT_PORT=5174
```

### Containers won't start?
```bash
# Clean rebuild
make -f Makefile.dev rebuild

# Or manually
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d --build
```

### Need fresh database?
```bash
# Destroy and recreate
make -f Makefile.dev clean
make -f Makefile.dev up
```

## File Structure

```
packages/deploy/
├── docker-compose.dev.yml    # Main compose file
├── Dockerfile.core-dev       # Rust backend
├── Dockerfile.hub-client-dev # Frontend
├── .env.dev.example          # Environment template
├── Makefile.dev              # Convenient commands
├── setup-dev.sh              # Setup script
└── README.dev.md             # Full documentation
```

## Architecture

```
┌─────────────────┐
│   Hub Client    │ TypeScript + Vite HMR
│   Port: 5173    │
└────────┬────────┘
         │
┌────────▼────────┐
│   Core API      │ Rust + cargo-watch
│   Port: 8000    │ Auto-recompile
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│  PG   │ │ Redis │
│ :5432 │ │ :6379 │
└───────┘ └───────┘
```

## Next Steps

1. Read full documentation: `README.dev.md`
2. Explore environment variables: `.env.dev.example`
3. Start coding! Changes trigger automatic rebuilds
4. Check logs to verify hot reload is working

## Support

See `README.dev.md` for detailed troubleshooting and configuration options.
