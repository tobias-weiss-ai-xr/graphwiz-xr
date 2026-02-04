# Docker Build Status and Workarounds

## Current Status

⚠️ **Docker builds are currently blocked** due to two interconnected issues:

1. **Rust edition2024 requirement**: The `home` crate dependency requires Rust edition2024 which is not yet stable
2. **Protobuf build integration**: Protobuf compilation in Docker environment has path resolution issues

## Recommended Workaround: Build Locally with Rust Nightly

### Option 1: Local Build (Recommended)

```bash
# Install Rust nightly
rustup install nightly
rustup override set nightly

# Build the project
cd /opt/git/graphwiz-xr
cargo build --release -p reticulum-presence

# Run tests
cargo test -p reticulum-presence

# Run the service
cargo run -p reticulum-presence
```

### Option 2: Use Pre-built Binary

Once you have built locally, you can create a simple Dockerfile that just copies the binary:

```dockerfile
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    wget \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 1000 graphwiz && \
    useradd -r -u 1000 -g graphwiz graphwiz

WORKDIR /app

# Copy pre-built binary
COPY target/release/reticulum-presence /app/

RUN chown -R graphwiz:graphwiz /app

USER graphwiz

EXPOSE 8003

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8003/health || exit 1

CMD ["./reticulum-presence"]
```

Then build with:
```bash
# First build locally
cargo build --release -p reticulum-presence

# Then build Docker image with pre-built binary
docker build -f Dockerfile.presence.simple -t graphwiz-presence:test .
```

## Known Issues and Solutions

### Issue 1: edition2024 Not Stable

**Error**:
```
error: feature `edition2024` is required
The package requires the Cargo feature called `edition2024`,
but that feature is not stabilized in this version of Cargo
```

**Solution**: Use Rust nightly
```bash
rustup override set nightly
```

**Status**: Tracking upstream. edition2024 is expected to stabilize in Rust 1.85 (Q1 2025)

### Issue 2: protoc Not Found in Docker

**Error**:
```
Error: Custom { kind: NotFound, error: "Could not find `protoc`" }
```

**Attempted Solutions** (all failed):
- Installing `protobuf-compiler` package
- Setting `PROTOC` environment variable
- Using `ENV` directive in Dockerfile
- Exporting variables in RUN commands

**Root Cause**: Cargo build scripts run in a separate process that doesn't properly inherit environment variables in the Docker build context.

**Solution**: Build locally instead of in Docker

### Issue 3: home Crate Dependency

**Error**:
```
failed to parse manifest at `.../home-0.5.12/Cargo.toml`
feature `edition2024` is required
```

**Solution**:
1. Pin `home` crate to earlier version (may break other dependencies)
2. Use Rust nightly (recommended)
3. Wait for edition2024 to stabilize

## Alternative: CI/CD Builds

### GitHub Actions

The `.github/workflows/rust.yml` workflow includes automated builds:

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions-rust-lang/setup-rust-toolchain@v1
      with:
        toolchain: nightly  # Use nightly for edition2024
    - run: cargo test --workspace --verbose
```

### Local CI Simulation

```bash
# Using act (GitHub Actions local runner)
brew install act
act -j test --matrix
```

## Testing Without Docker

### Manual Testing

```bash
# Terminal 1: Start service
RUST_LOG=debug cargo run -p reticulum-presence

# Terminal 2: Test endpoints
curl http://localhost:8003/health
curl http://localhost:8003/metrics
curl http://localhost:8003/ws/test-room/stats

# Terminal 3: Test WebSocket
wscat -c "ws://localhost:8003/ws/test-room?user_id=alice"
```

### Automated Test Script

```bash
# Run the test script
./packages/services/reticulum/presence/test-websocket.sh
```

## Future Improvements

### Short-term (Q1 2025)

1. **Update to Rust 1.85**: When edition2024 stabilizes
   - Remove nightly workaround
   - Use stable Rust toolchain

2. **Fix Docker Build**: Investigate protoc integration
   - Use multi-stage build with pre-generated protobuf code
   - Or use alternative protobuf build method

3. **Pre-generated Protobuf**: Generate protobuf code during development
   - Commit generated code to repository
   - Remove protoc dependency from Docker build

### Long-term

1. **Dependency Updates**: Update to versions that don't require edition2024
2. **Alternative Protobuf**: Consider using `protobuf-codegen` pure Rust implementation
3. **Build Matrix**: Support both Docker and local builds in CI

## Workaround Decision Tree

```
Need to build presence service?
├─ Production deployment?
│  └─ Use CI/CD (GitHub Actions) → Get artifact from workflow
├─ Local development?
│  └─ Use Rust nightly → cargo build -p reticulum-presence
└─ Docker deployment?
   └─ Build locally first → Copy binary to Docker image
```

## Summary

| Method | Status | Notes |
|--------|--------|-------|
| Local build (nightly) | ✅ Works | Recommended for development |
| Docker build (from source) | ❌ Blocked | edition2024 + protoc issues |
| Docker build (pre-built binary) | ✅ Works | Requires local build first |
| CI/CD (GitHub Actions) | ⏳ Pending | Update workflow to use nightly |
| Stable Rust build | ❌ Blocked | edition2024 not stable yet |

## Next Steps

1. **Immediate**: Build locally with Rust nightly
2. **Short-term**: Wait for Rust 1.85 with edition2024 support
3. **Medium-term**: Fix Docker build configuration
4. **Long-term**: Pre-generate protobuf code to simplify builds

---

*Last updated: 2025-12-27*
*Status: Docker builds blocked, local builds working*
