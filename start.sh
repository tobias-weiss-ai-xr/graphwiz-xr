#!/bin/bash
set -e

# GraphWiz-XR Docker Compose Quick Start Script
# This script sets up and starts the entire GraphWiz-XR stack with Traefik

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

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed"
        exit 1
    fi
}

# ============================================================================
# CHECK PREREQUISITES
# ============================================================================
print_header "Checking Prerequisites"

check_command docker
check_command docker-compose
print_success "Docker and Docker Compose are installed"

# Check if .env exists
if [ ! -f .env ]; then
    print_warning ".env file not found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    print_success "Created .env file"
    print_warning "Please edit .env file and configure:"
    echo "  - CF_DNS_API_TOKEN (Cloudflare API token)"
    echo "  - DATABASE_PASSWORD (secure password)"
    echo "  - REDIS_PASSWORD (secure password)"
    echo "  - JWT_SECRET (generate with: openssl rand -base64 32)"
    echo ""
    read -p "Press Enter after configuring .env file to continue..."
else
    print_success ".env file found"
fi

# Load environment variables
source .env

# Validate required environment variables
if grep -q "your_cloudflare_api_token_here" .env; then
    print_error "CF_DNS_API_TOKEN is not configured in .env"
    echo "Get your token at: https://dash.cloudflare.com/profile/api-tokens"
    exit 1
fi

if grep -q "change_this" .env; then
    print_warning "Default passwords detected in .env"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Please configure secure passwords in .env"
        exit 1
    fi
fi

# ============================================================================
# SETUP TRAEFIK NETWORK
# ============================================================================
print_header "Setting up Traefik Network"

# Create external Traefik network if it doesn't exist
if ! docker network inspect traefik-public &> /dev/null; then
    docker network create traefik-public
    print_success "Created traefik-public network"
else
    print_success "traefik-public network already exists"
fi

# ============================================================================
# CREATE NECESSARY DIRECTORIES
# ============================================================================
print_header "Creating Directories"

mkdir -p traefik/logs
print_success "Created traefik/logs directory"

# ============================================================================
# PULL LATEST IMAGES
# ============================================================================
print_header "Pulling Docker Images"
docker-compose pull
print_success "Docker images pulled"

# ============================================================================
# BUILD CUSTOM IMAGES
# ============================================================================
print_header "Building Custom Docker Images"
docker-compose build
print_success "Custom Docker images built"

# ============================================================================
# START SERVICES
# ============================================================================
print_header "Starting Services"

# Start infrastructure first
echo "Starting infrastructure services (PostgreSQL, Redis)..."
docker-compose up -d postgres redis
print_success "Infrastructure services started"

# Wait for database to be ready
echo "Waiting for database to be ready..."
until docker-compose exec -T postgres pg_isready -U ${DATABASE_USER:-graphwiz} &> /dev/null; do
    echo -n "."
    sleep 2
done
echo ""
print_success "Database is ready"

# Start backend services
echo "Starting backend services..."
docker-compose up -d auth hub presence sfu
print_success "Backend services started"

# Start frontend and proxy
echo "Starting frontend and proxy..."
docker-compose up -d hub-client admin-client traefik
print_success "All services started"

# ============================================================================
# VERIFY SERVICES
# ============================================================================
print_header "Verifying Services"

echo "Waiting for services to become healthy..."
sleep 10

# Check service status
docker-compose ps

# ============================================================================
# DISPLAY INFORMATION
# ============================================================================
print_header "Deployment Complete!"

cat << EOF
${GREEN}✓ GraphWiz-XR is now running!${NC}

${YELLOW}Access URLs:${NC}
  Main App:        https://xr.graphwiz.ai
  Admin Panel:     https://admin.xr.graphwiz.ai
  Traefik Dashboard: https://traefik.xr.graphwiz.ai/dashboard (local only)
  Database Admin:  https://adminer.xr.graphwiz.ai

${YELLOW}Useful Commands:${NC}
  View logs:       docker-compose logs -f [service-name]
  Check status:    docker-compose ps
  Stop all:        docker-compose down
  Restart:         docker-compose restart [service-name]
  Update:          docker-compose pull && docker-compose up -d

${YELLOW}Service Logs:${NC}
  All services:    docker-compose logs -f
  Traefik:         docker-compose logs -f traefik
  Backend:         docker-compose logs -f auth hub presence sfu
  Frontend:        docker-compose logs -f hub-client admin-client

${YELLOW}Database Access:${NC}
  Host:            postgres (from within network)
  User:            ${DATABASE_USER:-graphwiz}
  Database:        ${DATABASE_NAME:-graphwiz}
  Port:            5432

${YELLOW}Redis Access:${NC}
  Host:            redis (from within network)
  Port:            6379

${YELLOW}Next Steps:${NC}
  1. Monitor logs: docker-compose logs -f
  2. Check Traefik dashboard for certificate status
  3. Open https://xr.graphwiz.ai in your browser
  4. Check health endpoint: curl https://xr.graphwiz.ai/health

${RED}Security Reminders:${NC}
  - Change default passwords in .env
  - Keep CF_DNS_API_TOKEN secure
  - Enable firewalls for ports 80/443 only
  - Set up backups for database
  - Review Traefik access logs regularly

EOF

# Optional: Display recent logs
read -p "View recent logs? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_header "Recent Logs"
    docker-compose logs --tail=50 traefik auth hub
fi

print_success "Setup complete!"
