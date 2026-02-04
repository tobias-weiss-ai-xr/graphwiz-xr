#!/bin/bash
set -e

# GraphWiz-XR Docker Restart and Build Script
# This script restarts Docker and builds all services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if running as root or with sudo
check_sudo() {
    if [ "$EUID" -ne 0 ]; then
        if ! sudo -n true 2>/dev/null; then
            echo "This script requires sudo privileges to restart Docker."
            echo "Please enter your sudo password when prompted."
            sudo -v || exit 1
        fi
    fi
}

# Wait for Docker to be ready
wait_for_docker() {
    print_header "Waiting for Docker to be Ready"

    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker info >/dev/null 2>&1; then
            print_success "Docker is ready"
            return 0
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    echo ""
    print_error "Docker failed to start after ${max_attempts} attempts"
    return 1
}

# Main execution
main() {
    print_header "GraphWiz-XR Docker Restart & Build"

    # Change to project directory
    cd "$(dirname "$0")"
    print_info "Project directory: $(pwd)"

    # Check sudo
    print_info "Checking sudo privileges..."
    check_sudo
    print_success "Sudo privileges confirmed"

    # Restart Docker
    print_header "Restarting Docker Daemon"
    print_info "Stopping Docker..."
    sudo systemctl stop docker || print_warning "Docker was not running"

    print_info "Starting Docker..."
    sudo systemctl start docker
    print_success "Docker daemon restarted"

    # Enable Docker on boot
    print_info "Enabling Docker to start on boot..."
    sudo systemctl enable docker 2>/dev/null || print_warning "Could not enable Docker on boot"
    print_success "Docker enabled"

    # Wait for Docker
    wait_for_docker || exit 1

    # Show Docker info
    print_header "Docker Information"
    docker version --format 'Server: {{.Server.Version}}' 2>/dev/null || true
    echo ""

    # Clean up old resources
    print_header "Cleaning Up Old Resources"
    print_info "Removing stopped containers..."
    docker container prune -f >/dev/null 2>&1 || true
    print_success "Cleaned up containers"

    # Prune build cache
    print_info "Pruning build cache..."
    docker buildx prune -f >/dev/null 2>&1 || true
    print_success "Pruned build cache"

    # Build services
    print_header "Building GraphWiz-XR Services"

    # Check if .env exists
    if [ ! -f .env ]; then
        print_warning ".env file not found"
        print_info "Creating .env from .env.example..."
        cp .env.example .env
        print_warning "Please edit .env and configure your settings"
        print_info "Especially: CF_DNS_API_TOKEN"
        echo ""
        read -p "Press Enter after configuring .env to continue..."
    fi

    # Build images
    print_info "Building Docker images (this may take 10-20 minutes)..."
    echo ""

    if docker-compose build --parallel; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        echo ""
        print_info "You can view the build logs with:"
        echo "  docker-compose build 2>&1 | tee build.log"
        exit 1
    fi

    echo ""

    # Ask if user wants to start services
    print_header "Build Complete!"
    echo ""
    read -p "Do you want to start the services now? (y/N): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Starting services..."
        ./start.sh
    else
        print_info "To start services later, run:"
        echo "  ./start.sh"
    fi

    # Show next steps
    print_header "Next Steps"

    cat << EOF
${GREEN}✓ Build completed successfully!${NC}

${YELLOW}To start services:${NC}
  ./start.sh

${YELLOW}To view logs:${NC}
  docker-compose logs -f

${YELLOW}To check service status:${NC}
  docker-compose ps

${YELLOW}Access URLs:${NC}
  Main App:        https://xr.graphwiz.ai
  Admin Panel:     https://admin.xr.graphwiz.ai
  Traefik Dashboard: https://traefik.xr.graphwiz.ai/dashboard
  Database Admin:  https://adminer.xr.graphwiz.ai

${YELLOW}Credentials saved in:${NC}
  PASSWORDS.txt

EOF

    print_success "All done!"
}

# Run main function
main
