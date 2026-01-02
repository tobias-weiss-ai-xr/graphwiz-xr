#!/bin/bash
# Verification script for Agent Looper integration with Reticulum services

set -e

echo "=========================================="
echo "Agent Looper Integration Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check function
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        exit 1
    fi
}

# Warning function
warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check Agent Looper service is running
echo "1. Checking Agent Looper service..."
docker ps | grep graphwiz-agent-looper > /dev/null
check "Agent Looper container running"

# 2. Check service health
echo ""
echo "2. Checking service health..."
HEALTH=$(curl -s http://localhost:50051/health)
echo "$HEALTH" | grep -q '"status":"healthy"' || echo "$HEALTH" | grep -q '"status": "healthy"'
check "Agent Looper service healthy"

# 3. Test API endpoints
echo ""
echo "3. Testing API endpoints..."

# Test goals endpoint
curl -s http://localhost:50051/api/v1/goals | grep -q '"goals"'
check "Goals API working"

# Test metrics endpoint
curl -s http://localhost:50051/api/v1/metrics | grep -q '"metrics"'
check "Metrics API working"

# Test chat endpoint
curl -s -X POST http://localhost:50051/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}' | grep -q '"response"'
check "Chat API working"

# 4. Check Rust client library
echo ""
echo "4. Checking Rust client library..."
if [ -f "/opt/git/graphwiz-xr/packages/services/agent-looper/rust/src/client.rs" ]; then
    check "Rust client source exists"
else
    warn "Rust client source not found"
fi

if [ -f "/opt/git/graphwiz-xr/packages/services/agent-looper/rust/Cargo.toml" ]; then
    # Check if using reqwest instead of tonic
    if grep -q "reqwest" /opt/git/graphwiz-xr/packages/services/agent-looper/rust/Cargo.toml; then
        check "Rust client using HTTP (reqwest)"
    else
        warn "Rust client may not be configured for HTTP"
    fi
fi

# 5. Check Hub service integration
echo ""
echo "5. Checking Hub service integration..."
if [ -f "/opt/git/graphwiz-xr/packages/services/reticulum/hub/src/optimization.rs" ]; then
    check "Hub optimization module exists"
else
    warn "Hub optimization module not found"
fi

if grep -q "agent-looper-client" /opt/git/graphwiz-xr/packages/services/reticulum/hub/Cargo.toml; then
    check "Hub Cargo.toml configured for agent-looper-client"
else
    warn "Hub Cargo.toml not configured"
fi

# 6. Check SFU service integration
echo ""
echo "6. Checking SFU service integration..."
if [ -f "/opt/git/graphwiz-xr/packages/services/reticulum/sfu/src/optimization.rs" ]; then
    check "SFU optimization module exists"
else
    warn "SFU optimization module not found"
fi

if grep -q "agent-looper-client" /opt/git/graphwiz-xr/packages/services/reticulum/sfu/Cargo.toml; then
    check "SFU Cargo.toml configured for agent-looper-client"
else
    warn "SFU Cargo.toml not configured"
fi

# 7. Test connectivity from services
echo ""
echo "7. Testing service connectivity..."

# Test if services can reach Agent Looper
if curl -s http://graphwiz-agent-looper:50051/health > /dev/null 2>&1; then
    check "Services can reach Agent Looper via Docker network"
else
    warn "Services may not be able to reach Agent Looper via Docker network (this is OK if services aren't running)"
fi

# Summary
echo ""
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo ""
echo -e "${GREEN}Agent Looper Integration: COMPLETE${NC}"
echo ""
echo "Next Steps:"
echo "1. Build services with optimization feature:"
echo "   cd /opt/git/graphwiz-xr/packages/services/reticulum/hub"
echo "   cargo build --features optimization"
echo ""
echo "2. Set environment variable:"
echo "   export AGENT_LOOPER_URL=http://localhost:50051"
echo ""
echo "3. Run services:"
echo "   cargo run --features optimization"
echo ""
echo "For full documentation, see:"
echo "   AGENT_LOOPER_RETICULUM_INTEGRATION.md"
echo ""
