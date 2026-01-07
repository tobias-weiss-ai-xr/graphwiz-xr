# Chunked Upload Implementation for GraphWiz-XR Storage Service

## Overview

This implementation adds support for chunked file uploads (>50MB) to the GraphWiz-XR storage service. Files are split into manageable chunks (5-10MB default), uploaded independently with progress tracking, and then merged into a final asset.

## Features

- ✅ **Upload Session Management**: Track multi-part uploads in database
- ✅ **Chunk Upload**: Upload files in chunks with individual retry logic
- ✅ **Progress Tracking**: Real-time upload progress via percentage calculation
- ✅ **Resume Capability**: Continue interrupted uploads from last successful chunk
- ✅ **Pause/Cancel**: Support for pausing and cancelling uploads
- ✅ **Automatic Cleanup**: Remove orphaned uploads after 24 hours
- ✅ **Error Handling**: Comprehensive error handling with proper HTTP status codes

## Architecture

### Database Schema

#### Upload Sessions Table

```sql
CREATE TABLE upload_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR UNIQUE NOT NULL,     -- UUID for upload session
    owner_id VARCHAR NOT NULL,              -- User who owns the upload
    file_name VARCHAR NOT NULL,             -- Original filename
    asset_type VARCHAR NOT NULL,            -- model/texture/audio/video
    file_size BIGINT NOT NULL,              -- Total file size in bytes
    mime_type VARCHAR NOT NULL,             -- MIME type of file
    chunk_size INTEGER NOT NULL,            -- Size of each chunk
    total_chunks INTEGER NOT NULL,           -- Total number of chunks
    uploaded_chunks JSON NOT NULL,           -- Array of uploaded chunk numbers
    status VARCHAR NOT NULL,                -- initiated/uploading/paused/completed/failed/cancelled
    is_public BOOLEAN DEFAULT FALSE,
    metadata JSON NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Storage Structure

```
{STORAGE_BASE_PATH}/
├── {user_id}/
│   ├── assets/                 -- Final merged files
│   │   └── {asset_id}/
│   │       └── {filename}
│   ├── chunks/                 -- Temporary chunk storage
│   │   └── {session_id}/
│   │       ├── 1              -- Chunk 1
│   │       ├── 2              -- Chunk 2
│   │       └── ...
│   └── temp/                  -- Temporary merge location
│       └── {session_id}.bin
```

## API Endpoints

### 1. Initiate Chunked Upload

**POST** `/storage/chunked-upload`

**Request Body:**

```json
{
  "file_name": "large-model.glb",
  "file_size": 104857600,
  "asset_type": "model",
  "mime_type": "model/gltf-binary",
  "chunk_size": 10485760,
  "is_public": false,
  "metadata": {}
}
```

**Parameters:**

- `file_name`: Original filename
- `file_size`: Total file size in bytes
- `asset_type`: Asset type (model/texture/audio/video)
- `mime_type`: MIME type of file
- `chunk_size` (optional): Size of each chunk (default: 10MB, min: 5MB, max: 20MB)
- `is_public` (optional): Whether asset is public (default: false)
- `metadata` (optional): Additional metadata as JSON object

**Response:**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_name": "large-model.glb",
  "file_size": 104857600,
  "chunk_size": 10485760,
  "total_chunks": 10,
  "upload_url": "/storage/chunked-upload/550e8400-e29b-41d4-a716-446655440000/chunk",
  "resume_url": "/storage/chunked-upload/550e8400-e29b-41d4-a716-446655440000",
  "complete_url": "/storage/chunked-upload/550e8400-e29b-41d4-a716-446655440000/complete",
  "cancel_url": "/storage/chunked-upload/550e8400-e29b-41d4-a716-446655440000/cancel"
}
```

### 2. Upload Chunk

**POST** `/storage/chunked-upload/{session_id}/chunk?chunk_number={n}`

**Request:** `multipart/form-data` with chunk file

**Parameters:**

- `session_id`: Upload session UUID
- `chunk_number`: Chunk number (1-indexed, must be <= total_chunks)

**Response:**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "chunk_number": 1,
  "uploaded_chunks": [1, 2],
  "progress": 20.0,
  "status": "uploading"
}
```

### 3. Get Upload Session Status

**GET** `/storage/chunked-upload/{session_id}`

**Response:**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_name": "large-model.glb",
  "file_size": 104857600,
  "uploaded_chunks": [1, 2, 3],
  "total_chunks": 10,
  "progress": 30.0,
  "status": "uploading",
  "created_at": "2025-01-06T12:00:00Z"
}
```

### 4. Complete Upload

**POST** `/storage/chunked-upload/{session_id}/complete`

Merges all uploaded chunks into final file and creates asset record.

**Response:**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "asset_id": "660e8400-e29b-41d4-a716-4466554400001",
  "file_name": "large-model.glb",
  "file_size": 104857600,
  "mime_type": "model/gltf-binary",
  "download_url": "/storage/assets/660e8400-e29b-41d4-a716-4466554400001/download"
}
```

### 5. Cancel Upload

**POST** `/storage/chunked-upload/{session_id}/cancel`

Cancels upload and removes all uploaded chunks.

**Response:**

```json
{
  "message": "Upload cancelled successfully"
}
```

## Upload Flow

```
1. Initiate Upload
   POST /storage/chunked-upload
   ↓
   Receive session_id and chunk information

2. Upload Chunks
   POST /storage/chunked-upload/{session_id}/chunk?chunk_number=1
   POST /storage/chunked-upload/{session_id}/chunk?chunk_number=2
   ...
   ↓
   Track progress via uploaded_chunks array

3. (Optional) Check Status
   GET /storage/chunked-upload/{session_id}
   ↓
   Get current progress and status

4. Complete Upload
   POST /storage/chunked-upload/{session_id}/complete
   ↓
   Merge chunks → Create asset record → Return asset_id

5. (Optional) Cancel Upload
   POST /storage/chunked-upload/{session_id}/cancel
   ↓
   Remove all chunks → Update status to cancelled
```

## Client Implementation Example

```typescript
class ChunkedUploader {
  private file: File;
  private chunkSize: number = 10 * 1024 * 1024; // 10MB
  private sessionId?: string;

  async upload(file: File): Promise<string> {
    this.file = file;

    // Step 1: Initiate upload session
    const initResponse = await fetch('/storage/chunked-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_name: file.name,
        file_size: file.size,
        asset_type: 'model',
        mime_type: file.type,
        chunk_size: this.chunkSize,
        is_public: false
      })
    });

    const initData = await initResponse.json();
    this.sessionId = initData.session_id;
    const totalChunks = initData.total_chunks;

    // Step 2: Upload chunks with progress tracking
    for (let chunkNumber = 1; chunkNumber <= totalChunks; chunkNumber++) {
      await this.uploadChunk(chunkNumber);
      const progress = (chunkNumber / totalChunks) * 100;
      console.log(`Upload progress: ${progress.toFixed(2)}%`);
    }

    // Step 3: Complete upload
    const completeResponse = await fetch(`/storage/chunked-upload/${this.sessionId}/complete`, {
      method: 'POST'
    });

    const completeData = await completeResponse.json();
    return completeData.asset_id;
  }

  private async uploadChunk(chunkNumber: number): Promise<void> {
    const start = (chunkNumber - 1) * this.chunkSize;
    const end = Math.min(start + this.chunkSize, this.file.size);
    const chunk = this.file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);

    await fetch(`/storage/chunked-upload/${this.sessionId}/chunk?chunk_number=${chunkNumber}`, {
      method: 'POST',
      body: formData
    });
  }

  async cancel(): Promise<void> {
    if (this.sessionId) {
      await fetch(`/storage/chunked-upload/${this.sessionId}/cancel`, {
        method: 'POST'
      });
    }
  }
}

// Usage
const uploader = new ChunkedUploader();
try {
  const assetId = await uploader.upload(file);
  console.log('Upload complete:', assetId);
} catch (error) {
  console.error('Upload failed:', error);
  await uploader.cancel();
}
```

## Error Handling

### Status Codes

- `200 OK`: Successful operation
- `201 Created`: Upload session created
- `400 Bad Request`: Invalid request (wrong chunk number, invalid state)
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Session not found
- `413 Payload Too Large`: File exceeds size limit
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "error": "error_code",
  "message": "Human-readable error message"
}
```

### Common Errors

| Error             | Description               | Resolution                               |
| ----------------- | ------------------------- | ---------------------------------------- |
| `file_too_large`  | File exceeds type limit   | Use smaller file or increase type limits |
| `invalid_chunk`   | Chunk number out of range | Ensure chunk_number is 1-total_chunks    |
| `invalid_state`   | Upload in wrong state     | Check status before operation            |
| `session_expired` | Session older than 24h    | Restart upload                           |
| `not_found`       | Session not found         | Verify session_id is correct             |

## Cleanup Strategy

### Automatic Cleanup

Orphaned upload sessions are automatically cleaned up:

1. **Expired Sessions**: Sessions in non-completed state older than 24 hours
2. **Completed Sessions**: After final asset is created, session record is deleted
3. **Temporary Files**: Chunks are removed on completion or cancellation

### Manual Cleanup

To manually cleanup old sessions:

```bash
# Via HTTP endpoint (if implemented)
DELETE /storage/upload-sessions/cleanup?older_than_hours=24

# Via database
DELETE FROM upload_sessions
WHERE status NOT IN ('completed')
AND created_at < NOW() - INTERVAL '24 hours';
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Ownership Verification**: Users can only access their own uploads
3. **File Validation**: Magic byte validation on final merged file
4. **Size Limits**: Enforced per asset type
5. **Rate Limiting**: Existing rate limiter applies to chunk uploads
6. **Chunk Size Validation**: Client-specified chunk size is bounded (5-20MB)

## Performance Characteristics

### Memory Usage

- **Single-shot upload**: Entire file in memory (O(file_size))
- **Chunked upload**: One chunk in memory (O(chunk_size))
- **Merge operation**: One chunk at a time (O(chunk_size))

### Storage Efficiency

- **Chunks**: Stored as individual files before merging
- **Final file**: Merged into single file
- **Cleanup**: Chunks removed after merge

### Network Efficiency

- **Resumability**: Can retry failed chunks without re-uploading entire file
- **Parallel uploads**: Client can upload chunks in parallel (advanced feature)
- **Bandwidth**: Same as single-shot, but with pause/resume capability

## Testing

Run tests with:

```bash
cd packages/services/reticulum/storage
cargo test chunked_upload
```

### Test Coverage

- ✅ Initiate upload session
- ✅ Upload individual chunks
- ✅ Get session status
- ✅ Complete upload (merge chunks)
- ✅ Cancel upload (cleanup)
- ✅ Error handling (invalid chunks, wrong state)
- ✅ Progress tracking accuracy

## Future Enhancements

### Planned Features

1. **Concurrent Chunk Uploads**: Allow uploading multiple chunks in parallel
2. **Checksum Verification**: Validate chunks with MD5/SHA256
3. **Bandwidth Optimization**: Adaptive chunk size based on network conditions
4. **WebSocket Progress**: Real-time progress updates instead of polling
5. **S3 Multipart Upload**: Direct S3 multipart support for cloud storage
6. **Compression**: Compress chunks before upload (optional)
7. **Encryption**: Encrypt chunks in transit/at rest (optional)

### Advanced Features

- **Chunk Prioritization**: Upload important chunks first
- **Deduplication**: Detect duplicate chunks (for versioning)
- **Client-Side Chunking**: Perform chunking on client with verification
- **Resume After Restart**: Persist session state across server restarts

## Migration Guide

### For Existing Clients

Single-shot uploads still work for files <50MB. For larger files:

1. Detect file size before upload
2. If >50MB, use chunked upload endpoints
3. Otherwise, continue using `/storage/upload`

### Example Detection

```typescript
const CHUNKED_UPLOAD_THRESHOLD = 50 * 1024 * 1024; // 50MB

if (file.size > CHUNKED_UPLOAD_THRESHOLD) {
  return useChunkedUpload(file);
} else {
  return useSingleShotUpload(file);
}
```

## Troubleshooting

### Issues and Solutions

| Issue                  | Cause                   | Solution                                   |
| ---------------------- | ----------------------- | ------------------------------------------ |
| Upload stuck at 99%    | Missing last chunk      | Check chunk numbering, ensure all uploaded |
| Cannot complete upload | Not all chunks uploaded | Verify uploaded_chunks array is complete   |
| Session not found      | Expired or cancelled    | Restart upload with new session            |
| Merge failed           | Incomplete chunks       | Upload missing chunks and retry complete   |

### Debug Logging

Enable debug logging:

```bash
RUST_LOG=debug cargo run --bin reticulum-storage
```

Log entries include:

- Chunk storage confirmation
- Merge operation status
- Cleanup operations
- Error details

## References

- **TUS Protocol**: https://tus.io/protocols/resumable-upload.html
- **Actix-web Multipart**: https://docs.rs/actix-multipart/
- **Rustus (TUS Server)**: https://github.com/s3rius/rustus

## License

MPL-2.0 - See LICENSE file in project root
