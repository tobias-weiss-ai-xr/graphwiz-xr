#!/bin/sh
set -e

# Generate TypeScript definitions from protobuf files
# This script uses protobufjs to generate static TypeScript code

echo "Generating TypeScript code from protobuf definitions..."

# Check if protobufjs is available
if ! command -v pbjs >/dev/null 2>&1; then
    echo "protobufjs not found. Installing..."
    pnpm add -D protobufjs-cli
fi

# Ensure PROTOC is set if available
if [ -f "/home/weiss/tmp/protoc/bin/protoc" ]; then
    export PROTOC="/home/weiss/tmp/protoc/bin/protoc"
    echo "Using protoc from $PROTOC"
fi

# Generate static JavaScript from proto files
pbjs -t static-module -w commonjs -o src/generated/proto.js proto/core.proto proto/networking.proto proto/room.proto proto/media.proto proto/auth.proto

# Generate TypeScript definitions
pbts -o src/generated/proto.d.ts src/generated/proto.js

echo "Proto generation complete!"
