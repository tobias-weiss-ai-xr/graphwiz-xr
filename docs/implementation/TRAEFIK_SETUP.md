# GraphWiz-XR Traefik Setup Guide

Complete guide for deploying GraphWiz-XR with Traefik reverse proxy under the domain **xr.graphwiz.ai**.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Access Points](#access-points)
- [SSL/TLS Certificates](#ssltls-certificates)
- [Management](#management)
- [Troubleshooting](#troubleshooting)

---

## Overview

This deployment uses:
- **Traefik v2.10** - Modern reverse proxy with automatic SSL
- **Let's Encrypt** - Free SSL/TLS certificates via DNS challenge
- **Cloudflare** - DNS provider for certificate automation
- **Docker Compose** - Multi-container orchestration

### Architecture

```
Internet (Port 80/443)
    ↓
Traefik (SSL Termination, Routing)
    ↓
┌─────────────────────────────────────┐
│  Services (Internal Network)        │
│  ┌──────────┐  ┌──────────┐        │
│  │   Auth   │  │   Hub    │        │
│  │  :8001   │  │  :8002   │        │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │ Presence │  │   SFU    │        │
│  │  :8003   │  │  :8004   │        │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │Hub Client│  │  Admin   │        │
│  │   :80    │  │  :80     │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │PostgreSQL│  │  Redis   │        │
│  │  :5432   │  │  :6379   │        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
```

---

## Prerequisites

### Required

1. **Domain**: `xr.graphwiz.ai` pointing to your server
2. **Cloudflare Account**: Domain managed by Cloudflare
3. **Server**: Linux server with Docker installed
4. **Ports**: 80, 443 open to the internet

### Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install docker-compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## Quick Start

### 1. Clone Repository

```bash
cd /opt/git
# Already cloned at /opt/git/graphwiz-xr
cd graphwiz-xr
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your settings
nano .env
```

**Required settings in `.env`:**

```bash
# Cloudflare API Token (DNS challenge for SSL)
CF_DNS_API_TOKEN=your_token_here

# Secure passwords
DATABASE_PASSWORD=secure_password_here
REDIS_PASSWORD=secure_password_here
JWT_SECRET=$(openssl rand -base64 32)

# Domain
TRAEFIK_DOMAIN=xr.graphwiz.ai
```

### 3. Get Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Create token with permissions:
   - **Zone** → **DNS** → **Edit**
3. Copy token to `CF_DNS_API_TOKEN` in `.env`

### 4. Start Services

```bash
./start.sh
```

This will:
- Create Traefik network
- Pull Docker images
- Build custom images
- Start all services
- Verify deployment

### 5. Verify Deployment

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Check SSL certificate
curl -I https://xr.graphwiz.ai
```

---

## Configuration

### Domain Setup

Ensure DNS records point to your server:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | xr.graphwiz.ai | YOUR_SERVER_IP | Proxied (orange cloud) |
| A | admin.xr.graphwiz.ai | YOUR_SERVER_IP | Proxied |
| A | traefik.xr.graphwiz.ai | YOUR_SERVER_IP | DNS only (gray cloud) |
| A | adminer.xr.graphwiz.ai | YOUR_SERVER_IP | DNS only (gray cloud) |

### Environment Variables

Key variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `CF_DNS_API_TOKEN` | Cloudflare API token | Required |
| `DATABASE_PASSWORD` | PostgreSQL password | Change in production |
| `REDIS_PASSWORD` | Redis password | Change in production |
| `JWT_SECRET` | JWT signing secret | Generate with openssl |
| `RUST_LOG` | Rust logging level | `info` |
| `SFU_MAX_ROOMS` | Max concurrent rooms | `100` |

### Traefik Configuration

Files in `traefik/`:

- **traefik.yml** - Static configuration (entrypoints, certificates)
- **dynamic.yml** - Runtime configuration (middlewares, routing)

---

## Access Points

After deployment, services are available at:

| Service | URL | Description |
|---------|-----|-------------|
| **Main Application** | https://xr.graphwiz.ai | Hub client (VR app) |
| **Admin Panel** | https://admin.xr.graphwiz.ai | Admin dashboard |
| **Auth API** | https://xr.graphwiz.ai/api/auth | Authentication |
| **Hub API** | https://xr.graphwiz.ai/api/hub | Room management |
| **Presence WS** | wss://xr.graphwiz.ai/ws | WebSocket signaling |
| **SFU API** | https://xr.graphwiz.ai/api/sfu | Media forwarding |
| **Traefik Dashboard** | https://traefik.xr.graphwiz.ai/dashboard | Proxy management (local only) |
| **Database Admin** | https://adminer.xr.graphwiz.ai | Database UI |

### Default Credentials

**Adminer (Database):**
- Server: `postgres`
- Username: `graphwiz`
- Password: (from `.env`)
- Database: `graphwiz`

**Traefik Dashboard:**
- Configure basic auth in `traefik/dynamic.yml`

---

## SSL/TLS Certificates

### Automatic Certificate Management

Traefik automatically obtains and renews SSL certificates using:

- **Challenge**: DNS (via Cloudflare)
- **Provider**: Let's Encrypt
- **Renewal**: Automatic (background)

### Certificate Storage

Certificates stored in Docker volume: `traefik-letsencrypt`

To backup certificates:
```bash
docker run --rm -v graphwiz-xr_traefik-letsencrypt:/data -v $(pwd):/backup alpine tar czf /backup/letsencrypt-backup.tar.gz -C /data .
```

To restore certificates:
```bash
docker run --rm -v graphwiz-xr_traefik-letsencrypt:/data -v $(pwd):/backup alpine tar xzf /backup/letsencrypt-backup.tar.gz -C /data
```

### Troubleshooting Certificates

**Check certificate status:**
```bash
docker-compose logs traefik | grep -i certificate
```

**Force renewal (delete and restart):**
```bash
docker-compose down
docker volume rm graphwiz-xr_traefik-letsencrypt
./start.sh
```

**Check certificate details:**
```bash
openssl s_client -connect xr.graphwiz.ai:443 -servername xr.graphwiz.ai
```

---

## Management

### Daily Operations

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f traefik
docker-compose logs -f auth hub presence

# Last 100 lines
docker-compose logs --tail=100 traefik
```

**Check status:**
```bash
docker-compose ps
```

**Restart service:**
```bash
docker-compose restart auth
docker-compose restart hub-client
```

**Update services:**
```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

**Stop all:**
```bash
./stop.sh
# or
docker-compose down
```

### Monitoring

**Check service health:**
```bash
curl https://xr.graphwiz.ai/health
```

**View Traefik metrics:**
```bash
curl http://localhost:8080/metrics
```

**Database access:**
```bash
docker-compose exec postgres psql -U graphwiz -d graphwiz
```

**Redis CLI:**
```bash
docker-compose exec redis redis-cli -a REDIS_PASSWORD
```

### Backup

**Database backup:**
```bash
docker-compose exec postgres pg_dump -U graphwiz graphwiz > backup_$(date +%Y%m%d).sql
```

**Full backup:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/graphwiz-xr"

mkdir -p $BACKUP_DIR

# Database
docker-compose exec -T postgres pg_dump -U graphwiz graphwiz > $BACKUP_DIR/db_$DATE.sql

# Redis
docker-compose exec -T redis redis-cli --rdb - > $BACKUP_DIR/redis_$DATE.rdb

# Volumes
docker run --rm -v graphwiz-xr_postgres_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/postgres_$DATE.tar.gz -C /data .

echo "Backup complete: $BACKUP_DIR"
```

---

## Troubleshooting

### Services Not Starting

**Check port conflicts:**
```bash
sudo netstat -tulpn | grep -E ':(80|443|8001|8002|8003|8004)'
```

**Check Docker logs:**
```bash
docker-compose logs --tail=50
```

**Verify network:**
```bash
docker network inspect traefik-public
docker network inspect graphwiz-xr_graphwiz-internal
```

### SSL Certificate Issues

**Certificate not obtained:**
1. Check Cloudflare token is valid
2. Verify DNS records are correct
3. Check Traefik logs: `docker-compose logs traefik`
4. Verify Cloudflare API permissions

**Rate limiting:**
Let's Encrypt has rate limits. If you hit them:
- Use staging environment for testing
- Wait 1 hour for production rate limit to reset

### Database Connection Issues

**Check database is running:**
```bash
docker-compose ps postgres
docker-compose logs postgres
```

**Test connection:**
```bash
docker-compose exec postgres pg_isready -U graphwiz
```

**Reset database (WARNING: deletes data):**
```bash
docker-compose down -v
./start.sh
```

### High CPU/Memory Usage

**Check resource usage:**
```bash
docker stats
```

**Limit resources in docker-compose.yml:**
```yaml
services:
  sfu:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### WebRTC Issues

**Check SFU logs:**
```bash
docker-compose logs sfu
```

**Verify UDP ports are open:**
```bash
sudo ufw status
sudo ufw allow 10000:10100/udp
```

**Test TURN server (if configured):**
```bash
curl -X POST https://xr.graphwiz.ai/api/sfu/test-turn
```

---

## Production Checklist

- [ ] Change all default passwords in `.env`
- [ ] Set up automated backups
- [ ] Configure firewall (ports 80/443 only)
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Enable log aggregation (ELK/Loki)
- [ ] Configure rate limiting
- [ ] Set up fail2ban for brute force protection
- [ ] Review Traefik security headers
- [ ] Test SSL certificate renewal
- [ ] Set up disaster recovery plan
- [ ] Configure Cloudflare caching rules
- [ ] Set up error tracking (Sentry)
- [ ] Document admin credentials securely
- [ ] Set up health check alerts
- [ ] Review GDPR/data privacy compliance

---

## Security Best Practices

1. **Firewall**: Only expose ports 80 and 443
2. **Updates**: Keep Docker and images updated
3. **Secrets**: Never commit `.env` to git
4. **Backups**: Regular automated backups
5. **Monitoring**: Monitor logs and metrics
6. **Access**: Limit admin panel access by IP
7. **SSL**: Ensure HTTPS is enforced
8. **Rate Limiting**: Configure to prevent abuse

---

## Support

For issues and questions:
- Check logs: `docker-compose logs -f`
- Review this documentation
- Check Traefik dashboard
- Verify environment variables

---

## File Structure

```
graphwiz-xr/
├── docker-compose.yml          # Main orchestration
├── .env                        # Environment configuration (not in git)
├── .env.example                # Environment template
├── start.sh                    # Quick start script
├── stop.sh                     # Stop script
├── traefik/
│   ├── traefik.yml            # Traefik static config
│   ├── dynamic.yml            # Traefik dynamic config
│   └── logs/                  # Traefik logs
├── packages/
│   ├── clients/               # Frontend applications
│   ├── services/              # Backend services
│   └── deploy/
│       └── docker/            # Dockerfiles
```

---

**Last Updated**: 2025-12-28
**Version**: 1.0
