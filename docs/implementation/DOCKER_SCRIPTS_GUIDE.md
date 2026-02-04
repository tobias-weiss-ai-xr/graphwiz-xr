# GraphWiz-XR Docker Scripts Guide

This guide explains the Docker scripts available for managing GraphWiz-XR.

## Prerequisites

- Docker and Docker Compose installed
- sudo access (for Docker daemon restart)
- `.env` file configured with your settings

## Available Scripts

### 1. `restart-and-build.sh` - Full Rebuild
**Use when:** You need to rebuild Docker images after code changes

```bash
./restart-and-build.sh
```

**What it does:**
- ✅ Restarts Docker daemon
- ✅ Cleans up old containers and build cache
- ✅ Rebuilds all Docker images from scratch
- ✅ Optionally starts services

**Time:** 10-20 minutes (depending on your system)

### 2. `docker-restart.sh` - Quick Restart
**Use when:** Docker daemon has issues but images don't need rebuilding

```bash
./docker-restart.sh
```

**What it does:**
- ✅ Restarts Docker daemon
- ✅ Starts services with existing images

**Time:** 1-2 minutes

### 3. `start.sh` - Start Services
**Use when:** Docker is running and you want to start services

```bash
./start.sh
```

**What it does:**
- ✅ Creates Traefik network
- ✅ Pulls latest base images
- ✅ Starts all services
- ✅ Shows access URLs

**Time:** 2-5 minutes

### 4. `stop.sh` - Stop Services
**Use when:** You want to stop all services

```bash
./stop.sh
```

**What it does:**
- ✅ Gracefully stops all services

## Workflow Examples

### Initial Setup
```bash
# 1. Configure environment
cp .env.example .env
nano .env  # Add your Cloudflare API token

# 2. Full rebuild
./restart-and-build.sh
```

### Docker Issues (EOF errors)
```bash
# Quick restart
./docker-restart.sh
```

### After Code Changes
```bash
# Rebuild images
./restart-and-build.sh
```

### Daily Operations
```bash
# Start services
./start.sh

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
./stop.sh
```

## Troubleshooting

### "EOF" Errors
This indicates Docker daemon issues:

```bash
./docker-restart.sh
```

### Build Failures
Check the build logs:

```bash
docker-compose build 2>&1 | tee build.log
cat build.log
```

### Port Conflicts
Check what's using the ports:

```bash
sudo netstat -tulpn | grep -E ':(80|443|5432|6379|8001|8002|8003|8004)'
```

### Container Won't Start
Check container logs:

```bash
docker-compose logs [service-name]
```

### Reset Everything
WARNING: This deletes all data

```bash
docker-compose down -v
docker system prune -a
./restart-and-build.sh
```

## Environment Variables

Required in `.env`:

```bash
# Cloudflare API Token (for SSL certificates)
CF_DNS_API_TOKEN=your_token_here

# Database
DATABASE_PASSWORD=secure_password

# Redis
REDIS_PASSWORD=secure_password

# JWT
JWT_SECRET=generate_with_openssl_rand_base64_32
```

## Service Status

After starting, check service health:

```bash
# All services
docker-compose ps

# Specific service
docker-compose ps auth
docker-compose ps postgres
```

## Logs

View real-time logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f traefik
docker-compose logs -f auth

# Last 100 lines
docker-compose logs --tail=100
```

## Access Points

After services start:

| Service | URL |
|---------|-----|
| Main App | https://xr.graphwiz.ai |
| Admin Panel | https://admin.xr.graphwiz.ai |
| Traefik Dashboard | https://traefik.xr.graphwiz.ai/dashboard |
| Database Admin | https://adminer.xr.graphwiz.ai |

## Credentials

Generated credentials are saved in `PASSWORDS.txt`:
- Database password
- Redis password
- JWT secret
- Admin credentials

⚠️ **Keep this file secure and never commit to git**

## Quick Reference

```bash
# Restart Docker + rebuild
./restart-and-build.sh

# Quick restart only
./docker-restart.sh

# Start services
./start.sh

# Stop services
./stop.sh

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart auth
```

## Getting Help

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Check Docker: `docker info`
3. Restart Docker: `./docker-restart.sh`
4. Full rebuild: `./restart-and-build.sh`

For persistent issues, check:
- Docker logs: `sudo journalctl -u docker`
- System resources: `docker stats`
- Disk space: `docker system df`
