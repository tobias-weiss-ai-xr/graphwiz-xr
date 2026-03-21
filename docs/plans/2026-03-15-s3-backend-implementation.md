# S3 Backend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix existing S3 backend issues and complete the implementation for production-ready cloud storage.

**Architecture:** The storage service already has a `StorageBackend` trait abstraction with local and S3 implementations. The S3 backend exists but has critical compilation errors (duplicate imports, broken credentials config, misplaced impl blocks) and lacks multipart upload support for large files.

**Tech Stack:** Rust, aws-sdk-s3 v1.0, aws-config v1.0, async-trait, tokio

---

## Current State Analysis

### What Works

- `StorageBackend` trait abstraction exists (`storage_backend.rs`)
- `LocalStorageBackend` fully functional
- Backend selection via `STORAGE_BACKEND=s3` env var
- AWS SDK dependencies in Cargo.toml (v1.0)
- HTTP handlers are backend-agnostic

### Critical Issues (Blocking Compilation)

| File                 | Line    | Issue                                                      | Severity |
| -------------------- | ------- | ---------------------------------------------------------- | -------- |
| `storage_backend.rs` | 97-99   | Duplicate `merge_chunks` declaration                       | HIGH     |
| `storage_backend.rs` | 411-414 | `get_type()` outside impl block                            | HIGH     |
| `s3_backend.rs`      | 10-26   | Duplicate imports                                          | HIGH     |
| `s3_backend.rs`      | 66-78   | Broken AWS credentials config                              | HIGH     |
| `s3_backend.rs`      | 356-358 | `get_type()` outside impl block                            | HIGH     |
| `handlers.rs`        | 203-234 | Duplicate virus scan code block                            | MEDIUM   |
| `handlers.rs`        | 241     | Variable confusion (`stored_file.path` vs `stored_file`)   | HIGH     |
| `chunked_upload.rs`  | 78      | `file_size` undefined (should be `request_data.file_size`) | HIGH     |

### Missing Features

- S3 multipart upload (for files >5MB)
- Presigned URL generation (direct S3 downloads)
- Custom S3 endpoint support (MinIO, DigitalOcean Spaces)
- Backend health check endpoint
- Unit tests for S3 backend

---

## Proposed Architecture

### Configuration (Environment Variables)

```bash
# Backend selection
STORAGE_BACKEND=local|s3           # Default: local

# Local storage
STORAGE_BASE_PATH=./storage        # Default: ./storage

# S3 configuration
AWS_REGION=us-east-1               # Required for S3
AWS_ACCESS_KEY_ID=xxx              # Required for S3
AWS_SECRET_ACCESS_KEY=xxx          # Required for S3
S3_BUCKET_NAME=graphwiz-xr-assets  # Default: graphwiz-xr-assets
S3_ENDPOINT=                       # Optional: Custom endpoint (MinIO)
S3_PATH_STYLE=false                # Optional: Force path-style URLs
S3_PRESIGNED_EXPIRY=3600           # Optional: Presigned URL expiry (seconds)
```

### Crate Selection: aws-sdk-rust (v1.0)

**Decision: Keep aws-sdk-rust (already in Cargo.toml)**

| Criteria             | aws-sdk-rust          | rusoto            |
| -------------------- | --------------------- | ----------------- |
| Maintenance          | Active (AWS official) | Deprecated (2022) |
| Async runtime        | tokio native          | tokio             |
| Feature completeness | Full S3 API           | Partial           |
| Multipart upload     | Native support        | Manual            |
| Rust edition         | 2021                  | 2018              |

### Interface Abstraction (Existing)

```rust
// storage_backend.rs - StorageBackend trait (already exists)
#[async_trait]
pub trait StorageBackend: Send + Sync {
    async fn store_file(...) -> StorageResult<StoredFile>;
    async fn get_file(&self, path: &str) -> StorageResult<Vec<u8>>;
    async fn delete_file(&self, path: &str) -> StorageResult<()>;
    async fn file_exists(&self, path: &str) -> StorageResult<bool>;
    async fn store_chunk(...) -> StorageResult<String>;
    async fn merge_chunks(...) -> StorageResult<MergedFile>;
    async fn cleanup_chunks(...) -> StorageResult<()>;
    async fn get_temp_path(...) -> Option<String>;
    async fn cleanup_temp_files(&self);
    fn get_type(&self) -> &str;
}
```

---

## File-by-File Changes

### Task 1: Fix storage_backend.rs Syntax Errors

**Files:**

- Modify: `packages/services/reticulum/storage/src/storage_backend.rs`

**Step 1: Remove duplicate merge_chunks declaration (lines 97-99)**

Delete lines 97-99 (the duplicate declaration):

```rust
// DELETE THESE LINES (97-99):
/// Clean up all chunks for a session
    ) -> StorageResult<MergedFile>;
```

**Step 2: Move get_type() inside impl block (lines 411-414)**

The `get_type()` method is outside the `impl StorageBackend for LocalStorageBackend` block. Move it inside.

Current (broken):

```rust
// Line 409 - end of merge_chunks
    }

    fn get_type(&self) -> &str {
        "local"
    }
}
```

Fixed:

```rust
// Line 409 - merge_chunks ends, then get_type inside same impl
    async fn cleanup_chunks(&self, owner_id: &str, session_id: &str) -> StorageResult<()> {
        // ... existing code ...
        Ok(())
    }

    fn get_type(&self) -> &str {
        "local"
    }
}
```

**Step 3: Verify compilation**

Run: `cargo check -p reticulum-storage`
Expected: No errors in storage_backend.rs

---

### Task 2: Fix s3_backend.rs Syntax Errors

**Files:**

- Modify: `packages/services/reticulum/storage/src/s3_backend.rs`

**Step 1: Remove duplicate imports (lines 10-26)**

Current (duplicated):

```rust
use aws_sdk_s3::{
    Client as S3Client,
    config::BehaviorVersion,
    error::SdkError,
    operation::HeadObjectError,
    primitives::{ByteStream, ByteStreamError},
    types::{Delete, DeleteObjects, ObjectIdentifier},
};
use aws_config::defaults::BehaviorVersion;
use aws_sdk_s3::{
    Client as S3Client,
    config::BehaviorVersion,
    error::SdkError,
    operation::HeadObjectError,
    primitives::{ByteStream, ByteStreamError},
    types::{Delete, DeleteObjects, ObjectIdentifier},
};
```

Fixed (single import block):

```rust
use aws_config::defaults::BehaviorVersion;
use aws_sdk_s3::{
    Client as S3Client,
    error::SdkError,
    operation::HeadObjectError,
    primitives::ByteStream,
    types::ObjectIdentifier,
};
```

**Step 2: Fix AWS credentials configuration (lines 66-78)**

Current (broken - trying to nest providers):

```rust
let config = aws_config::defaults(BehaviorVersion::latest())
    .region(region)
    .credentials_provider(aws_sdk_s3::config::Credentials::new(
        aws_sdk_s3::config::SharedCredentialsProvider::new(
            aws_sdk_s3::config::Identity::new(
                aws_sdk_s3::config::Credentials::new(
                    access_key_id.clone(),
                    secret_access_key.clone(),
                    None,
                    None,
                    None,
                )
            )
        )
    ))
```

Fixed (use Credentials directly):

```rust
use aws_sdk_s3::config::Credentials;

// Inside new() function:
let credentials = Credentials::new(
    access_key_id,
    secret_access_key,
    None,
    None,
    "environment"
);

let mut config_builder = aws_config::defaults(BehaviorVersion::latest())
    .region(aws_sdk_s3::config::Region::new(region))
    .credentials_provider(credentials);

// Support custom S3 endpoint (MinIO, DigitalOcean Spaces)
if let Ok(endpoint) = std::env::var("S3_ENDPOINT") {
    config_builder = config_builder.endpoint_url(endpoint);
}

let config = config_builder.build();
let client = S3Client::new(&config);
```

**Step 3: Move get_type() inside impl block**

Same issue as storage_backend.rs - move `fn get_type()` inside the `impl StorageBackend for S3StorageBackend` block.

**Step 4: Add ByteStreamError to StorageError**

Add handling for `ByteStreamError`:

```rust
// In storage_backend.rs, add to StorageError enum:
#[error("ByteStream error: {0}")]
    ByteStream(#[from] aws_sdk_s3::primitives::ByteStreamError),
```

Or convert it in s3_backend.rs:

```rust
// In download_file_from_s3, change line 172:
let body = output.body.collect().await.map_err(|e| {
    StorageError::Storage(format!("Failed to read S3 response body: {}", e))
})?;
```

**Step 5: Verify compilation**

Run: `cargo check -p reticulum-storage`
Expected: No errors in s3_backend.rs

---

### Task 3: Fix handlers.rs Issues

**Files:**

- Modify: `packages/services/reticulum/storage/src/handlers.rs`

**Step 1: Remove duplicate virus scan code (lines 203-234)**

There are two identical blocks for virus scanning. Remove the duplicate (lines 212-234).

**Step 2: Fix stored_file variable usage (lines 237-253)**

Current (broken):

```rust
let stored_file = match storage_backend
    .store_file(&user_id, &asset_id, &file_name, file_data, &mime_type, max_size)
    .await
{
    Ok(file) => file.path,  // WRONG: moves stored_file, keeps only path
        Err(e) => {
            // ...
        }
    };

// Later uses stored_file.path but stored_file is moved
match AssetModel::create(
    &db,
    asset_id.clone(),
    user_id,
    asset_type,
    file_name.clone(),
    stored_file.path.clone(),  // ERROR: stored_file is String now
```

Fixed:

```rust
let stored_file = match storage_backend
    .store_file(&user_id, &asset_id, &file_name, file_data, &mime_type, max_size)
    .await
{
    Ok(file) => file,
    Err(e) => {
        log::error!("Failed to store file: {}", e);
        // Clean up temp file
        if let Err(cleanup_err) = tokio::fs::remove_file(&temp_file_path).await {
            log::warn!("Failed to clean up temp file {}: {}", temp_file_path, cleanup_err);
        }
        return HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "storage_error",
            "message": "Failed to store file"
        }));
    }
};

// Now stored_file is the full StoredFile struct
match AssetModel::create(
    &db,
    asset_id.clone(),
    user_id,
    asset_type,
    file_name.clone(),
    stored_file.path.clone(),
    stored_file.size as i64,
    stored_file.mime_type.clone(),
    // ...
)
```

**Step 3: Verify compilation**

Run: `cargo check -p reticulum-storage`
Expected: No errors in handlers.rs

---

### Task 4: Fix chunked_upload.rs

**Files:**

- Modify: `packages/services/reticulum/storage/src/chunked_upload.rs`

**Step 1: Fix undefined file_size variable (line 78)**

Current:

```rust
if file_size > max_size {
```

Fixed:

```rust
let file_size = request_data.file_size;
if file_size > max_size {
```

**Step 2: Verify compilation**

Run: `cargo check -p reticulum-storage`
Expected: No errors in chunked_upload.rs

---

### Task 5: Add S3 Configuration Struct

**Files:**

- Modify: `packages/services/reticulum/storage/src/storage_backend.rs`

**Step 1: Add S3Config struct**

```rust
/// Configuration for S3 storage backend
#[derive(Debug, Clone)]
pub struct S3Config {
    pub region: String,
    pub access_key_id: String,
    pub secret_access_key: String,
    pub bucket_name: String,
    pub endpoint: Option<String>,
    pub path_style: bool,
    pub presigned_expiry: u64,
}

impl S3Config {
    pub fn from_env() -> Result<Self, String> {
        let region = std::env::var("AWS_REGION")
            .unwrap_or_else(|_| "us-east-1".to_string());

        let access_key_id = std::env::var("AWS_ACCESS_KEY_ID")
            .map_err(|_| "AWS_ACCESS_KEY_ID not set".to_string())?;

        let secret_access_key = std::env::var("AWS_SECRET_ACCESS_KEY")
            .map_err(|_| "AWS_SECRET_ACCESS_KEY not set".to_string())?;

        let bucket_name = std::env::var("S3_BUCKET_NAME")
            .unwrap_or_else(|_| "graphwiz-xr-assets".to_string());

        let endpoint = std::env::var("S3_ENDPOINT").ok();

        let path_style = std::env::var("S3_PATH_STYLE")
            .ok()
            .map(|v| v == "true")
            .unwrap_or(false);

        let presigned_expiry = std::env::var("S3_PRESIGNED_EXPIRY")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(3600);

        Ok(Self {
            region,
            access_key_id,
            secret_access_key,
            bucket_name,
            endpoint,
            path_style,
            presigned_expiry,
        })
    }
}
```

---

### Task 6: Implement S3 Multipart Upload

**Files:**

- Modify: `packages/services/reticulum/storage/src/s3_backend.rs`

**Step 1: Add multipart upload support to StorageBackend trait**

Add to trait in `storage_backend.rs`:

```rust
/// Initiate a multipart upload session
async fn initiate_multipart(
    &self,
    owner_id: &str,
    asset_id: &str,
    file_name: &str,
    mime_type: &str,
) -> StorageResult<String>;

/// Upload a part to an active multipart session
async fn upload_part(
    &self,
    upload_id: &str,
    part_number: i32,
    data: Vec<u8>,
) -> StorageResult<String>;

/// Complete a multipart upload
async fn complete_multipart(
    &self,
    upload_id: &str,
    parts: Vec<(i32, String)>,
) -> StorageResult<StoredFile>;

/// Abort a multipart upload
async fn abort_multipart(&self, upload_id: &str) -> StorageResult<()>;
```

**Step 2: Implement multipart for LocalStorageBackend**

Local doesn't need multipart - delegate to store_file:

```rust
async fn initiate_multipart(
    &self,
    owner_id: &str,
    asset_id: &str,
    file_name: &str,
    mime_type: &str,
) -> StorageResult<String> {
    // For local storage, just return a fake upload_id
    Ok(format!("local-{}-{}", owner_id, asset_id))
}

async fn upload_part(
    &self,
    upload_id: &str,
    part_number: i32,
    data: Vec<u8>,
) -> StorageResult<String> {
    // Store part as a chunk
    self.store_chunk(upload_id, "multipart", part_number, data).await
}

async fn complete_multipart(
    &self,
    upload_id: &str,
    parts: Vec<(i32, String)>,
) -> StorageResult<StoredFile> {
    // Merge parts
    let merged = self.merge_chunks(upload_id, "multipart").await?;
    Ok(StoredFile {
        path: merged.path,
        size: merged.size,
        mime_type: merged.mime_type,
    })
}

async fn abort_multipart(&self, upload_id: &str) -> StorageResult<()> {
    self.cleanup_chunks(upload_id, "multipart").await
}
```

**Step 3: Implement multipart for S3StorageBackend**

```rust
use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::types::{CompletedMultipartUpload, CompletedPart};

// Add tracking structure
struct MultipartUploadSession {
    key: String,
    upload_id: String,
    bucket: String,
}

impl S3StorageBackend {
    async fn initiate_multipart(
        &self,
        owner_id: &str,
        asset_id: &str,
        file_name: &str,
        mime_type: &str,
    ) -> StorageResult<String> {
        let key = format!("{}/{}/{}", owner_id, asset_id, file_name);

        let response = self.client
            .create_multipart_upload()
            .bucket(&self.bucket)
            .key(&key)
            .content_type(mime_type)
            .send()
            .await
            .map_err(|e| StorageError::S3Error(format!("Failed to initiate multipart: {}", e)))?;

        let upload_id = response.upload_id()
            .ok_or_else(|| StorageError::S3Error("No upload_id in response".to_string()))?
            .to_string();

        log::info!("Initiated S3 multipart upload: {} -> {}", key, upload_id);
        Ok(upload_id)
    }

    async fn upload_part(
        &self,
        upload_id: &str,
        part_number: i32,
        data: Vec<u8>,
    ) -> StorageResult<String> {
        // Note: Need to track the key associated with upload_id
        // For simplicity, we'll need to add session tracking

        let response = self.client
            .upload_part()
            .bucket(&self.bucket)
            .key(&self.current_key) // Need to track this
            .upload_id(upload_id)
            .part_number(part_number)
            .body(ByteStream::from(data))
            .send()
            .await
            .map_err(|e| StorageError::S3Error(format!("Failed to upload part: {}", e)))?;

        let etag = response.e_tag()
            .ok_or_else(|| StorageError::S3Error("No ETag in response".to_string()))?
            .to_string();

        log::info!("Uploaded part {} to S3: {}", part_number, etag);
        Ok(etag)
    }

    async fn complete_multipart(
        &self,
        upload_id: &str,
        parts: Vec<(i32, String)>,
    ) -> StorageResult<StoredFile> {
        let completed_parts: Vec<CompletedPart> = parts
            .into_iter()
            .map(|(part_number, etag)| {
                CompletedPart::builder()
                    .part_number(part_number)
                    .e_tag(etag)
                    .build()
            })
            .collect();

        let multipart_upload = CompletedMultipartUpload::builder()
            .set_parts(Some(completed_parts))
            .build();

        let response = self.client
            .complete_multipart_upload()
            .bucket(&self.bucket)
            .key(&self.current_key)
            .upload_id(upload_id)
            .multipart_upload(multipart_upload)
            .send()
            .await
            .map_err(|e| StorageError::S3Error(format!("Failed to complete multipart: {}", e)))?;

        log::info!("Completed S3 multipart upload: {:?}", response.location());

        Ok(StoredFile {
            path: self.current_key.clone(),
            size: 0, // Size not returned, would need HeadObject
            mime_type: "application/octet-stream".to_string(),
        })
    }

    async fn abort_multipart(&self, upload_id: &str) -> StorageResult<()> {
        self.client
            .abort_multipart_upload()
            .bucket(&self.bucket)
            .key(&self.current_key)
            .upload_id(upload_id)
            .send()
            .await
            .map_err(|e| StorageError::S3Error(format!("Failed to abort multipart: {}", e)))?;

        log::info!("Aborted S3 multipart upload: {}", upload_id);
        Ok(())
    }
}
```

---

### Task 7: Add Presigned URL Support

**Files:**

- Modify: `packages/services/reticulum/storage/src/s3_backend.rs`
- Modify: `packages/services/reticulum/storage/src/storage_backend.rs`

**Step 1: Add presigned URL to trait**

```rust
// In storage_backend.rs trait:
/// Generate a presigned URL for direct download (S3 only, local returns None)
async fn get_presigned_url(&self, path: &str, expiry_secs: u64) -> Option<String>;
```

**Step 2: Implement for LocalStorageBackend**

```rust
async fn get_presigned_url(&self, _path: &str, _expiry_secs: u64) -> Option<String> {
    None // Local storage doesn't support presigned URLs
}
```

**Step 3: Implement for S3StorageBackend**

```rust
use aws_sdk_s3::presigning::config::PresigningConfig;
use std::time::Duration;

async fn get_presigned_url(&self, path: &str, expiry_secs: u64) -> Option<String> {
    let presigning_config = PresigningConfig::builder()
        .expires_in(Duration::from_secs(expiry_secs))
        .build()
        .ok()?;

    self.client
        .get_object()
        .bucket(&self.bucket)
        .key(path)
        .presigned(presigning_config)
        .await
        .ok()
        .map(|url| url.to_string())
}
```

**Step 4: Add download endpoint that uses presigned URLs**

In `handlers.rs`:

```rust
/// Download asset (redirects to presigned URL for S3)
pub async fn download_asset_presigned(
    req: HttpRequest,
    config: web::Data<Config>,
    storage_backend: web::Data<Arc<dyn StorageBackend>>,
    asset_id: web::Path<String>,
) -> HttpResponse {
    // ... same auth checks as download_asset ...

    // Try presigned URL first (S3)
    if let Some(url) = storage_backend
        .get_presigned_url(&asset.file_path, 3600)
        .await
    {
        return HttpResponse::TemporaryRedirect()
            .insert_header(("Location", url))
            .finish();
    }

    // Fallback to direct download (local storage)
    download_asset(req, config, storage_backend, asset_id).await
}
```

---

### Task 8: Update lib.rs Backend Selection

**Files:**

- Modify: `packages/services/reticulum/storage/src/lib.rs`

**Step 1: Use S3Config for initialization**

```rust
impl StorageService {
    pub async fn new(config: Config) -> Self {
        let storage_config = StorageConfig::new();

        let storage_backend: Arc<dyn StorageBackend> =
            match std::env::var("STORAGE_BACKEND").as_deref() {
                Ok("s3") => {
                    match S3Config::from_env() {
                        Ok(s3_config) => {
                            match S3StorageBackend::new(s3_config).await {
                                Ok(backend) => {
                                    log::info!(
                                        "S3 backend initialized - Region: {}, Bucket: {}",
                                        s3_config.region,
                                        s3_config.bucket_name
                                    );
                                    Arc::new(backend)
                                }
                                Err(e) => {
                                    log::error!("S3 backend init failed: {}, using local", e);
                                    Arc::new(LocalStorageBackend::new(storage_config.base_path))
                                }
                            }
                        }
                        Err(e) => {
                            log::warn!("S3 config invalid: {}, using local storage", e);
                            Arc::new(LocalStorageBackend::new(storage_config.base_path))
                        }
                    }
                }
                _ => {
                    log::info!("Using local storage backend at {}", storage_config.base_path);
                    Arc::new(LocalStorageBackend::new(storage_config.base_path))
                }
            };

        Self { config, storage_backend }
    }
}
```

---

### Task 9: Add Health Check with Backend Info

**Files:**

- Modify: `packages/services/reticulum/storage/src/handlers.rs`

**Step 1: Update health endpoint**

```rust
/// Health check with storage backend info
pub async fn health(
    storage_backend: web::Data<Arc<dyn StorageBackend>>,
) -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "reticulum-storage",
        "backend": storage_backend.get_type()
    }))
}
```

---

### Task 10: Add Unit Tests

**Files:**

- Create: `packages/services/reticulum/storage/src/storage_backend_test.rs`

**Step 1: Create test module**

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn setup_local_backend() -> (LocalStorageBackend, TempDir) {
        let temp_dir = tempfile::tempdir().expect("Failed to create temp dir");
        let backend = LocalStorageBackend::new(temp_dir.path().to_string_lossy().to_string());
        (backend, temp_dir)
    }

    #[tokio::test]
    async fn test_local_store_and_retrieve() {
        let (backend, _temp) = setup_local_backend();

        let data = b"test content".to_vec();
        let stored = backend
            .store_file("user1", "asset1", "test.txt", data.clone(), "text/plain", 1024)
            .await
            .expect("Store failed");

        assert!(stored.path.contains("user1"));
        assert!(stored.path.contains("asset1"));

        let retrieved = backend.get_file(&stored.path).await.expect("Get failed");
        assert_eq!(retrieved, data);
    }

    #[tokio::test]
    async fn test_local_file_exists() {
        let (backend, _temp) = setup_local_backend();

        let data = b"test".to_vec();
        let stored = backend
            .store_file("user1", "asset1", "test.txt", data, "text/plain", 1024)
            .await
            .expect("Store failed");

        assert!(backend.file_exists(&stored.path).await.expect("Exists check failed"));
        assert!(!backend.file_exists("nonexistent").await.expect("Exists check failed"));
    }

    #[tokio::test]
    async fn test_local_delete_file() {
        let (backend, _temp) = setup_local_backend();

        let data = b"test".to_vec();
        let stored = backend
            .store_file("user1", "asset1", "test.txt", data, "text/plain", 1024)
            .await
            .expect("Store failed");

        backend.delete_file(&stored.path).await.expect("Delete failed");
        assert!(!backend.file_exists(&stored.path).await.expect("Exists check failed"));
    }

    #[tokio::test]
    async fn test_local_file_too_large() {
        let (backend, _temp) = setup_local_backend();

        let data = vec![0u8; 2000];
        let result = backend
            .store_file("user1", "asset1", "test.txt", data, "text/plain", 1000)
            .await;

        assert!(matches!(result, Err(StorageError::FileTooLarge { .. })));
    }

    #[tokio::test]
    async fn test_chunked_upload() {
        let (backend, _temp) = setup_local_backend();

        // Store chunks
        let chunk1 = backend
            .store_chunk("user1", "session1", 1, b"chunk1".to_vec())
            .await
            .expect("Store chunk 1 failed");

        let chunk2 = backend
            .store_chunk("user1", "session1", 2, b"chunk2".to_vec())
            .await
            .expect("Store chunk 2 failed");

        assert!(chunk1.contains("1"));
        assert!(chunk2.contains("2"));

        // Merge
        let merged = backend
            .merge_chunks("user1", "session1")
            .await
            .expect("Merge failed");

        assert_eq!(merged.size, 12); // "chunk1" + "chunk2" = 12 bytes

        // Cleanup
        backend.cleanup_chunks("user1", "session1").await.expect("Cleanup failed");
    }
}
```

**Step 2: Add tempfile dev dependency to Cargo.toml**

```toml
[dev-dependencies]
tokio-test = "0.4"
tempfile = "3.10"
```

---

## Implementation Order

| Order | Task                                 | Priority | Estimated Time |
| ----- | ------------------------------------ | -------- | -------------- |
| 1     | Fix storage_backend.rs syntax errors | HIGH     | 15 min         |
| 2     | Fix s3_backend.rs syntax errors      | HIGH     | 20 min         |
| 3     | Fix handlers.rs issues               | HIGH     | 15 min         |
| 4     | Fix chunked_upload.rs                | HIGH     | 5 min          |
| 5     | Add S3Config struct                  | MEDIUM   | 10 min         |
| 6     | Update lib.rs backend selection      | MEDIUM   | 10 min         |
| 7     | Add health check with backend info   | LOW      | 5 min          |
| 8     | Add presigned URL support            | MEDIUM   | 20 min         |
| 9     | Implement S3 multipart upload        | MEDIUM   | 45 min         |
| 10    | Add unit tests                       | MEDIUM   | 30 min         |

**Total estimated time: ~3 hours**

---

## Testing Strategy

### Unit Tests

1. LocalStorageBackend: store, retrieve, delete, exists, chunked upload
2. S3Config: from_env parsing, validation
3. Magic bytes validation

### Integration Tests (require S3 credentials)

1. S3StorageBackend: store, retrieve, delete
2. S3 multipart upload flow
3. Presigned URL generation

### Manual Testing

```bash
# Set environment
export STORAGE_BACKEND=s3
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx
export S3_BUCKET_NAME=test-bucket

# Run service
cargo run -p reticulum-storage

# Test upload
curl -X POST http://localhost:8005/storage/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@test.glb" \
  -F "asset_type=model"

# Test download
curl http://localhost:8005/storage/assets/<asset_id>/download \
  -H "Authorization: Bearer <token>"
```

### MinIO Local Testing

```bash
# Start MinIO
docker run -d -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# Configure storage service
export STORAGE_BACKEND=s3
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=minioadmin
export AWS_SECRET_ACCESS_KEY=minioadmin
export S3_BUCKET_NAME=test-assets
export S3_ENDPOINT=http://localhost:9000
export S3_PATH_STYLE=true
```

---

## Rollback Plan

If S3 backend fails:

1. Set `STORAGE_BACKEND=local` (or unset)
2. Service automatically falls back to local storage
3. Existing assets remain accessible via their stored paths

---

## Future Enhancements (Out of Scope)

1. CDN integration (CloudFront, Cloudflare)
2. Asset versioning
3. Automatic image optimization
4. Video transcoding hooks
5. Cross-region replication
6. Bucket lifecycle policies
