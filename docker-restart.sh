#!/bin/bash
set -e

# GraphWiz-XR Docker Quick Restart Script
# Quickly restarts Docker daemon and starts services

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

main() {
    print_header "Docker Quick Restart"

    cd "$(dirname "$0")"

    # Check sudo
    print_info "Checking sudo..."
    if [ "$EUID" -ne 0 ]; then
        sudo -v || exit 1
    fi
    print_success "Sudo confirmed"

    # Restart Docker
    print_info "Restarting Docker..."
    sudo systemctl restart docker
    print_success "Docker restarted"

    # Wait for Docker
    print_info "Waiting for Docker..."
    local attempt=0
    while [ $attempt -lt 15 ]; do
        if docker info >/dev/null 2>&1; then
            print_success "Docker is ready"
            break
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    echo ""

    # Start services
    if [ -f start.sh ]; then
        print_info "Starting services..."
        ./start.sh
    else
        print_error "start.sh not found"
        exit 1
    fi
}

main
