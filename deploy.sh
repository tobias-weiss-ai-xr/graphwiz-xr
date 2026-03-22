#!/bin/bash
set -e

echo "=== GraphWiz-XR Production Deployment ==="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
SERVER="chemie-lernen.org"
REMOTE_PATH="/root/git/graphwiz-xr"
BACKUP_PATH="/root/backups/graphwiz-xr-$(date +%Y%m%d-%H%M%S)"

# Step 0: Pre-flight checks
log_info "Step 0: Pre-flight checks..."

# Test SSH connectivity
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes $SERVER "echo SSH OK" &> /dev/null; then
    log_error "Cannot connect to $SERVER. Please check SSH access and network."
    exit 1
fi

# Step 1: Backup current deployment
log_info "Step 1: Creating backup of current deployment..."
ssh $SERVER "mkdir -p $BACKUP_PATH && cd $REMOTE_PATH && docker compose down 2>/dev/null || true && tar -czf $BACKUP_PATH/graphwiz-xr-config.tar.gz -C $(dirname $REMOTE_PATH) graphwiz-xr 2>/dev/null || true"

if [ $? -eq 0 ]; then
    log_info "Backup created: $BACKUP_PATH"
else
    log_warn "Backup failed or not needed, continuing..."
fi

# Step 2: Pull latest code
log_info "Step 2: Pulling latest code from server..."
ssh $SERVER "cd $REMOTE_PATH && git fetch origin && git reset --hard origin/main"

# Step 3: Build and deploy with Docker Compose
log_info "Step 3: Building and deploying services..."
ssh $SERVER "cd $REMOTE_PATH && docker compose pull && docker compose build --no-cache && docker compose up -d"

if [ $? -eq 0 ]; then
    log_info "Deployment completed successfully!"
else
    log_error "Deployment failed. Check logs with: docker compose logs"
    exit 1
fi

# Step 4: Verify services are running
log_info "Step 4: Verifying services..."
sleep 10  # Wait for services to start

ssh $SERVER "cd $REMOTE_PATH && docker compose ps"

# Step 5: Health checks
log_info "Step 5: Running health checks..."
sleep 5  # Wait for services to be healthy

SERVICES=("auth" "hub" "presence" "storage" "sfu" "avatar")
for service in "${SERVICES[@]}"; do
    HEALTH=$(ssh $SERVER "curl -s -o /dev/null -w '%{http_code}' http://host.docker.internal:8001/api/v1/health 2>/dev/null || echo '000'")
    if [ "$HEALTH" == "200" ]; then
        log_info "Service $service: ✓ Healthy (HTTP $HEALTH)"
    else
        log_warn "Service $service: ✗ Unhealthy (HTTP $HEALTH)"
    fi
done

log_info "=== Deployment Complete ==="
log_info "Deployment time: $(date)"
log_info "Backup location: $BACKUP_PATH"
echo ""
echo "To check logs: ssh $SERVER 'cd $REMOTE_PATH && docker compose logs -f'"
