#!/bin/bash
# Full deployment script for GraphWiz-XR production server

set -e

echo "=== GraphWiz-XR Production Deployment ==="

cd /root/git/graphwiz-xr

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Bring down existing services
echo "Stopping existing services..."
docker compose down

# Clean up old images
echo "Cleaning up old Docker artifacts..."
docker system prune -f --volumes

# Build all services
echo "Building all Docker images..."
docker compose build --no-cache

# Start services
echo "Starting all services..."
docker compose up -d

# Wait for services to initialize
echo "Waiting for services to initialize..."
sleep 15

# Check service status
echo "Service Status:"
docker compose ps

echo "=== Deployment Complete ==="
