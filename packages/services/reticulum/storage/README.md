# Reticulum Storage Service

File upload, storage, and retrieval service for GraphWiz-XR assets.

## Overview

The storage service handles:
- ✅ File uploads (multipart/form-data)
- ✅ File validation (size, type, magic bytes)
- ✅ Asset metadata storage (PostgreSQL)
- ✅ File storage (local filesystem, abstracted for S3)
- ✅ Asset listing and pagination
- ✅ File downloads
- ✅ Asset deletion with ownership verification

## Features

### Security
- Magic bytes validation to prevent MIME type spoofing
- File size limits per asset type
- File extension validation
- Ownership verification on delete
- CORS support
- Test authentication (replace with JWT for production)

### Asset Types
| Type    | Max Size | Extensions               | MIME Types                          |
|---------|----------|--------------------------|-------------------------------------|
| Model   | 100MB    | .glb, .gltf              | model/gltf-binary, model/gltf+json   |
| Texture | 10MB     | .png, .jpg, .jpeg, .gif  | image/png, image/jpeg, image/gif     |
| Audio   | 50MB     | .mp3, .ogg, .wav         | audio/mpeg, audio/ogg, audio/wav     |
| Video   | 200MB    | .mp4, .webm              | video/mp4, video/webm                |

### Storage Architecture
```
/storage/
  └── {user_id}/
      └── {asset_id}/
          └── {filename}
```

## API Endpoints

### Health Check
```bash
GET /storage/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "reticulum-storage"
}
```

### Upload Asset
```bash
POST /storage/upload
Content-Type: multipart/form-data
```

**Fields:**
- `file`: The file to upload
- `asset_type`: One of: `model`, `texture`, `audio`, `video`
- `is_public`: (optional) Boolean, default `false`
- `metadata`: (optional) JSON metadata

**Response:**
```json
{
  "asset_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_name": "model.glb",
  "asset_type": "model",
  "file_size": 1048576,
  "mime_type": "model/gltf-binary",
  "download_url": "/storage/assets/550e8400-e29b-41d4-a716-446655440000/download"
}
```

### List Assets
```bash
GET /storage/assets?asset_type=model&page=1&per_page=20
```

**Query Parameters:**
- `asset_type` (optional): Filter by asset type
- `page` (optional): Page number, default 1
- `per_page` (optional): Items per page, default 20

**Response:**
```json
{
  "assets": [
    {
      "asset_id": "...",
      "file_name": "model.glb",
      "asset_type": "model",
      "file_size": 1048576,
      "mime_type": "model/gltf-binary",
      "is_public": false,
      "created_at": "2025-12-31 12:00:00"
    }
  ],
  "total": 42,
  "page": 1,
  "per_page": 20
}
```

### Get Asset Metadata
```bash
GET /storage/assets/{asset_id}
```

### Download Asset
```bash
GET /storage/assets/{asset_id}/download
```

Returns the file contents with appropriate `Content-Type` header.

### Delete Asset
```bash
DELETE /storage/assets/{asset_id}
```

Only the asset owner can delete their assets.

## Development

### Prerequisites
- Rust 1.75+
- PostgreSQL 15+
- Docker (optional, for containerized development)

### Environment Variables

```bash
# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8005
SERVER_WORKERS=1

# Database
DATABASE_URL=postgresql://graphwiz:graphwiz_dev@postgres:5432/graphwiz

# Authentication (JWT)
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400

# Storage
STORAGE_BASE_PATH=/storage

# Logging
RUST_LOG=debug
```

### Running Locally

1. **Set up the database:**
```bash
cd packages/services/reticulum/core/migrations
cargo run --bin runner
```

2. **Run the service:**
```bash
cd packages/services/reticulum/storage
cargo run
```

The service will start on `http://localhost:8005`

### Running with Docker

```bash
cd packages/deploy
docker compose -f docker-compose.dev.yml up -d storage-service
```

## Testing

See [TESTING.md](./TESTING.md) for detailed testing instructions.

Quick test:
```bash
# Health check
curl http://localhost:8005/storage/health

# Upload a file
echo "test" > test.txt
curl -X POST http://localhost:8005/storage/upload \
  -F "file=@test.txt" \
  -F "asset_type=model" \
  -F "is_public=false"
```

## Project Structure

```
storage/
├── src/
│   ├── lib.rs              # Service library
│   ├── main.rs             # Binary entry point
│   ├── handlers.rs         # HTTP request handlers
│   ├── routes.rs           # Route configuration
│   ├── storage_backend.rs  # Storage abstraction
│   └── test_auth.rs        # Test authentication middleware
├── Cargo.toml
├── .env.example
├── TESTING.md
└── README.md
```

## Current Limitations

### TODO - Production Readiness
- [ ] Replace `TestAuth` with proper JWT authentication
- [ ] Add rate limiting (100 uploads/hour per user)
- [ ] Add virus scanning for uploaded files
- [ ] Implement chunked uploads for large files (>50MB)
- [ ] Add S3 backend implementation
- [ ] Add CDN integration
- [ ] Implement cleanup job for orphaned files
- [ ] Add comprehensive unit tests
- [ ] Add integration tests
- [ ] Add OpenAPI/Swagger documentation

### Known Issues
- Test authentication uses hardcoded user ID
- No retry logic for failed uploads
- No file compression/optimization
- No thumbnail generation for images
- No asset processing pipeline

## Architecture Decisions

### Why Local Filesystem First?
- Faster to implement for development
- Easier to debug and test
- Abstracted via `StorageBackend` trait for easy S3 migration
- Suitable for single-server deployments

### Why Magic Bytes Validation?
- Prevents MIME type spoofing attacks
- Users can't upload executables as images
- Adds security layer beyond extension checking

### Why Per-User Directory Structure?
- Clean separation of user assets
- Easy to implement user quotas
- Simplifies cleanup on user deletion
- Matches S3 bucket patterns

## Future Enhancements

1. **Cloud Storage**
   - S3 backend implementation
   - Presigned URLs for direct uploads
   - Multi-region replication

2. **Asset Processing**
   - Image thumbnail generation
   - 3D model optimization
   - Video transcoding
   - Audio normalization

3. **CDN Integration**
   - CloudFlare R2
   - AWS CloudFront
   - Geographic distribution

4. **Advanced Features**
   - Chunked uploads with resume
   - Asset versioning
   - Asset sharing between users
   - Asset analytics

## Contributing

When contributing to the storage service:
1. Add tests for new features
2. Update this README
3. Follow the existing code style
4. Run `cargo fmt` and `cargo clippy`
5. Test locally before committing

## License

MPL-2.0 - See LICENSE file in project root
