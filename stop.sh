#!/bin/bash
set -e

# GraphWiz-XR Docker Compose Stop Script
# Gracefully stops all services

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_header "Stopping GraphWiz-XR Services"

# Graceful stop
docker-compose down

print_success "All services stopped"

echo ""
echo "To remove volumes (WARNING: deletes data):"
echo "  docker-compose down -v"
echo ""
echo "To restart:"
echo "  ./start.sh"
