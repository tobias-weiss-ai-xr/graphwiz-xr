#!/bin/bash
#
# Deploy script for GraphWiz-XR
# SSHs to server, pulls latest changes, and restarts Docker Compose
#

set -e

SERVER="chemie-lernen.org"
REMOTE_PATH="/root/git/graphwiz-xr"

echo "=== Deploying GraphWiz-XR ==="
echo "Server: $SERVER"
echo "Path: $REMOTE_PATH"
echo ""

ssh "$SERVER" << 'ENDSSH'
set -e

cd /root/git/graphwiz-xr

echo ">>> Pulling latest changes..."
git pull origin main

echo ""
echo ">>> Rebuilding and restarting Docker Compose..."
docker compose up -d --build

echo ""
echo ">>> Cleaning up unused images..."
docker image prune -f

echo ""
echo ">>> Deployment complete!"
docker compose ps
ENDSSH

echo ""
echo "=== Done ==="
