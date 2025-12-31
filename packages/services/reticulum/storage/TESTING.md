# Storage Service Testing Guide

This guide will help you test the storage service locally and in Docker.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL running
- Rust toolchain installed (for local development)

## Step 1: Run Database Migration

First, ensure the assets table exists in the database.

### Using Docker

```bash
cd /mnt/c/Users/Tobias/git/graphwiz-xr/packages/deploy

# Start services
docker compose -f docker-compose.dev.yml up -d postgres redis

# Run migration from within the core-api container
docker exec -it graphwiz-core-api-dev bash
cd /app/packages/services/reticulum/core/migrations
cargo run --bin runner
exit
```

### Local Development

```bash
cd /mnt/c/Users/Tobias/git/graphwiz-xr/packages/services/reticulum/core/migrations

# Set DATABASE_URL if needed
export DATABASE_URL="postgresql://graphwiz:graphwiz_dev@localhost:5432/graphwiz"

# Run migration
cargo run --bin runner
```

## Step 2: Start Storage Service

### Using Docker (Recommended)

```bash
cd /mnt/c/Users/Tobias/git/graphwiz-xr/packages/deploy

# Build and start storage service
docker compose -f docker-compose.dev.yml up -d storage-service

# View logs
docker compose -f docker-compose.dev.yml logs -f storage-service

# Check it's running
curl http://localhost:8005/storage/health
```

### Local Development

```bash
cd /mnt/c/Users/Tobias/git/graphwiz-xr/packages/services/reticulum/storage

# Set environment variables
export DATABASE_URL="postgresql://graphwiz:graphwiz_dev@localhost:5432/graphwiz"
export SERVER_HOST="127.0.0.1"
export SERVER_PORT="8005"
export STORAGE_BASE_PATH="./storage_data"
export JWT_SECRET="test_secret"
export RUST_LOG="debug"

# Run the service
cargo run
```

## Step 3: Test Endpoints

### 3.1 Health Check

```bash
curl http://localhost:8005/storage/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "reticulum-storage"
}
```

### 3.2 Upload a File

Create a test file first:

```bash
echo "Hello, World!" > test.txt
```

Upload it (without authentication for now - we'll need to add auth middleware later):

```bash
curl -X POST http://localhost:8005/storage/upload \
  -F "file=@test.txt" \
  -F "asset_type=model" \
  -F "is_public=false"
```

**Expected Response:**
```json
{
  "asset_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_name": "test.txt",
  "asset_type": "model",
  "file_size": 14,
  "mime_type": "text/plain",
  "download_url": "/storage/assets/550e8400-e29b-41d4-a716-446655440000/download"
}
```

**Note:** This will fail with "unauthorized" because we have `user_id: web::ReqData<String>` in the handler. We need to either:
1. Add authentication middleware
2. Make the upload endpoint public for testing
3. Mock the user_id for now

Let's proceed with option 3 (temporary mock) - see **Step 4** below.

### 3.3 List Assets

```bash
curl http://localhost:8005/storage/assets
```

### 3.4 Get Asset Metadata

Replace `{asset_id}` with the ID from upload:

```bash
curl http://localhost:8005/storage/assets/{asset_id}
```

### 3.5 Download Asset

```bash
curl -O http://localhost:8005/storage/assets/{asset_id}/download
```

### 3.6 Delete Asset

```bash
curl -X DELETE http://localhost:8005/storage/assets/{asset_id}
```

## Step 4: Authentication Fix (Temporary)

For testing purposes, we have two options:

### Option A: Add Test Authentication Middleware

Create `packages/services/reticulum/storage/src/auth_middleware.rs`:

```rust
use actix_web::{dev::ServiceRequest, Error, HttpMessage};
use actix_web::dev::{forward_ready, Service, ServiceResponse, Transform};
use futures_util::future::{ok, Ready};
use std::future::ready;
use std::task::{Context, Poll};

pub struct TestAuth;

impl<S, B> Transform<S, ServiceRequest> for TestAuth
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = TestAuthMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(TestAuthMiddleware { service })
    }
}

pub struct TestAuthMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for TestAuthMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = std::pin::Pin<Box<dyn std::future::Future<Output = Result<Self::Response, Self::Error>> + 'static>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        // Inject a test user ID
        req.extensions_mut().insert(Some("test_user_123".to_string()));

        let fut = self.service.call(req);
        Box::pin(async move {
            let res = fut.await?;
            Ok(res)
        })
    }
}
```

Then add it to `lib.rs`:

```rust
.wrap(TestAuth)
```

### Option B: Make Endpoints Public (Quicker for Testing)

Temporarily modify handlers to use a dummy user ID:

```rust
// In upload_asset, list_assets, delete_asset
let user_id = "test_user_123".to_string();  // Temporary!
```

## Step 5: Verify File Storage

Check if files are being stored:

### Docker
```bash
docker exec graphwiz-storage-dev ls -la /storage/test_user_123/
```

### Local
```bash
ls -la ./storage_data/test_user_123/
```

## Step 6: Clean Up

### Stop Services
```bash
docker compose -f docker-compose.dev.yml down
```

### Remove Test Data
```bash
docker volume rm graphwiz-dev-storage_data
```

## Troubleshooting

### "unauthorized" Error
The endpoints require authentication. See Step 4 for how to handle this during testing.

### "File not found" on Download
Check:
1. The asset_id is correct
2. The file exists in storage directory
3. Logs show successful upload

### "Database connection failed"
Check:
1. PostgreSQL is running: `docker ps | grep postgres`
2. DATABASE_URL is correct
3. Migration has been run

### "Permission denied" on storage directory
Ensure the storage directory has correct permissions:

```bash
# Docker
docker exec graphwiz-storage-dev mkdir -p /storage
docker exec graphwiz-storage-dev chmod 777 /storage

# Local
mkdir -p ./storage_data
chmod 777 ./storage_data
```

## Next Steps After Testing

1. ✅ Backend works
2. ➡️ Add proper JWT authentication middleware
3. ➡️ Implement frontend upload component
4. ➡️ Add rate limiting
5. ➡️ Add file validation tests
6. ➡️ Deploy to staging

## Testing Checklist

- [ ] Health check returns 200
- [ ] Can upload a small text file
- [ ] File is stored in correct directory
- [ ] Database record created
- [ ] Can list assets
- [ ] Can download uploaded file
- [ ] Downloaded file matches original
- [ ] Can delete asset
- [ ] File is removed from disk
- [ ] Database record deleted
