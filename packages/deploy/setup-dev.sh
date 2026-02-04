#!/bin/bash
# GraphWiz-XR Development Environment Setup Script
# This script sets up the .env file for local development

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
ENV_EXAMPLE="$SCRIPT_DIR/.env.dev.example"

echo "GraphWiz-XR Development Environment Setup"
echo "========================================="
echo ""

# Check if .env already exists
if [ -f "$ENV_FILE" ]; then
    echo "WARNING: .env file already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Existing .env file preserved."
        exit 0
    fi
    echo "Backing up existing .env to .env.backup"
    cp "$ENV_FILE" "$ENV_FILE.backup"
fi

# Copy example file
if [ ! -f "$ENV_EXAMPLE" ]; then
    echo "ERROR: .env.dev.example not found at $ENV_EXAMPLE"
    exit 1
fi

cp "$ENV_EXAMPLE" "$ENV_FILE"
echo "Created .env file from template"

# Optional: Prompt for custom configuration
echo ""
read -p "Do you want to customize environment variables? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Custom Configuration (press Enter to use defaults):"
    echo "----------------------------------------------------"

    # Database configuration
    read -p "Database port [5432]: " db_port
    if [ -n "$db_port" ]; then
        sed -i "s/DATABASE_PORT=5432/DATABASE_PORT=$db_port/" "$ENV_FILE"
    fi

    # Redis configuration
    read -p "Redis port [6379]: " redis_port
    if [ -n "$redis_port" ]; then
        sed -i "s/REDIS_PORT=6379/REDIS_PORT=$redis_port/" "$ENV_FILE"
    fi

    # API port
    read -p "Core API port [8000]: " api_port
    if [ -n "$api_port" ]; then
        sed -i "s/CORE_API_PORT=8000/CORE_API_PORT=$api_port/" "$ENV_FILE"
    fi

    # Client port
    read -p "Hub Client port [5173]: " client_port
    if [ -n "$client_port" ]; then
        sed -i "s/HUB_CLIENT_PORT=5173/HUB_CLIENT_PORT=$client_port/" "$ENV_FILE"
    fi

    # Rust log level
    read -p "Rust log level [debug/info/warn/error] [debug]: " rust_log
    if [ -n "$rust_log" ]; then
        sed -i "s/RUST_LOG=debug/RUST_LOG=$rust_log/" "$ENV_FILE"
    fi

    echo ""
    echo "Configuration updated"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review .env file if needed: cat $ENV_FILE"
echo "  2. Start services: make -f $SCRIPT_DIR/Makefile.dev up"
echo "  3. View logs: make -f $SCRIPT_DIR/Makefile.dev logs"
echo ""
echo "Services will be available at:"
echo "  - Hub Client: http://localhost:$(grep HUB_CLIENT_PORT $ENV_FILE | cut -d'=' -f2)"
echo "  - Core API: http://localhost:$(grep CORE_API_PORT $ENV_FILE | cut -d'=' -f2)"
echo "  - Adminer: http://localhost:8080"
echo ""
