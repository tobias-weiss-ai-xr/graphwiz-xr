//! Storage backend abstraction for file operations
//!
//! Supports two backends:
//! 1. Local filesystem (default, always available)
//! 2. AWS S3 (optional, requires AWS credentials)
//!
//! To use S3 storage, set these environment variables:
//! - AWS_REGION (e.g., us-east-1)
//! - AWS_ACCESS_KEY_ID
//! - AWS_SECRET_ACCESS_KEY
//! - S3_BUCKET_NAME (optional, defaults to graphwiz-xr-assets)
//! - USE_S3_STORAGE (true to enable S3, false to use local)

use async_trait::async_trait;
use std::env;
use std::path::Path;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub enum StorageBackendType {
    Local,
    S3,
}

/// Configuration for storage backend
#[derive(Debug, Clone)]
pub struct StorageConfig {
    pub backend_type: StorageBackendType,
    pub s3_bucket: Option<String>,
}

impl StorageConfig {
    /// Create default storage configuration
    pub fn new() -> Self {
        let use_s3 = std::env::var("USE_S3_STORAGE")
            .unwrap_or_else(|_| "false".to_string())
            == "true";

        let backend_type = if use_s3 {
            StorageBackendType::S3
        } else {
            StorageBackendType::Local
        };

        let s3_bucket = if use_s3 {
            std::env::var("S3_BUCKET_NAME").ok()
        } else {
            None
        };

        Self {
            backend_type,
            s3_bucket,
        }
    }
}

pub type StorageResult<T> = Result<T, StorageError>;

/// Information about a stored file
#[derive(Debug, Clone)]
pub struct StoredFile {
    pub path: String,
    pub size: u64,
    pub mime_type: String,
}

#[derive(Debug, Clone)]
pub struct MergedFile {
    pub path: String,
    pub size: u64,
    pub mime_type: String,
    pub asset_id: String,
}

/// Storage backend trait - allows switching between local and cloud storage
#[async_trait]
pub trait StorageBackend: Send + Sync {
    /// Get a temporary file path for virus scanning
    /// Returns a path in a temp directory that will be cleaned up later
    async fn get_temp_path(
        &self,
        owner_id: &str,
        asset_id: &str,
        file_name: &str,
    ) -> Option<String>;

    /// Store a file and return its storage path
    async fn store_file(
        &self,
        owner_id: &str,
        asset_id: &str,
        file_name: &str,
        data: Vec<u8>,
        mime_type: &str,
        max_size: u64,
    ) -> StorageResult<StoredFile>;

    /// Retrieve a file's contents
    async fn get_file(&self, path: &str) -> StorageResult<Vec<u8>>;

    /// Delete a file
    async fn delete_file(&self, path: &str) -> StorageResult<()>;

    /// Check if a file exists
    async fn file_exists(&self, path: &str) -> StorageResult<bool>;
}

impl Default for StorageBackendType {
    fn default() -> Self {
        StorageBackendType::Local
    }
}

#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("File too large: {size} bytes (max: {max} bytes)")]
    FileTooLarge { size: u64, max: u64 },

    #[error("Invalid file type: {0}")]
    InvalidFileType(String),

    #[error("File not found: {0}")]
    FileNotFound(String),

    #[error("Storage error: {0}")]
    Storage(String),

    #[error("S3 configuration error: {0}")]
    S3Config(String),

    #[error("S3 error: {0}")]
    S3Error(String),
}

pub type StorageResult<T> = Result<T, StorageError>;

/// Information about a stored file
#[derive(Debug, Clone)]
pub struct StoredFile {
    pub path: String,
    pub size: u64,
    pub mime_type: String,
}

/// Configuration for storage backend
#[derive(Debug, Clone)]
pub struct StorageConfig {
    pub backend_type: StorageBackendType,
    pub s3_bucket: Option<String>,
}

impl StorageConfig {
    pub fn new() -> Self {
        let use_s3 = std::env::var("USE_S3_STORAGE")
            .unwrap_or_else(|_| "false".to_string())
            == "true" || std::env::var("AWS_ACCESS_KEY_ID").is_ok();

        let backend_type = if use_s3 {
            StorageBackendType::S3
        } else {
            StorageBackendType::Local
        };

        let s3_bucket = if use_s3 {
            std::env::var("S3_BUCKET_NAME").ok()
        } else {
            None
        };

        Self {
            backend_type,
            s3_bucket,
        }
    }
}

/// Storage backend trait - allows switching between local and cloud storage
#[async_trait]
pub trait StorageBackend: Send + Sync {
    /// Get a temporary file path for virus scanning
    /// Returns a path in a temp directory that will be cleaned up later
    async fn get_temp_path(
        &self,
        owner_id: &str,
        asset_id: &str,
        file_name: &str,
    ) -> Option<String>;

    /// Store a file and return its storage path
    async fn store_file(
        &self,
        owner_id: &str,
        asset_id: &str,
        file_name: &str,
        data: Vec<u8>,
        mime_type: &str,
        max_size: u64,
    ) -> StorageResult<StoredFile>;

    /// Retrieve a file's contents
    async fn get_file(&self, path: &str) -> StorageResult<Vec<u8>>;

    /// Delete a file
    async fn delete_file(&self, path: &str) -> StorageResult<()>;

    /// Check if a file exists
    async fn file_exists(&self, path: &str) -> StorageResult<bool>;

    /// Store a chunk for a chunked upload
    async fn store_chunk(
        &self,
        owner_id: &str,
        session_id: &str,
        chunk_number: i32,
        data: Vec<u8>,
    ) -> StorageResult<String>;

    /// Merge all chunks for a session into a final file
    async fn merge_chunks(
        &self,
        owner_id: &str,
        session_id: &str,
    ) -> StorageResult<MergedFile>;

    /// Clean up all chunks for a session
    async fn cleanup_chunks(&self, owner_id: &str, session_id: &str) -> StorageResult<()>;
}

/// Local filesystem storage implementation
pub struct LocalStorageBackend {
    base_path: String,
}

impl LocalStorageBackend {
    pub fn new(base_path: impl Into<String>) -> Self {
        Self {
            base_path: base_path.into(),
        }
    }

    fn build_path(&self, owner_id: &str, asset_id: &str, file_name: &str) -> String {
        format!(
            "{}/{}/{}/{}",
            self.base_path.trim_end_matches('/'),
            owner_id,
            asset_id,
            file_name
        )
    }

    fn build_temp_path(&self, owner_id: &str, asset_id: &str, file_name: &str) -> String {
        let temp_dir = Path::new(&self.base_path)
            .join(owner_id)
            .join("temp");

        // Create temp directory if needed
        if let Err(e) = tokio::fs::create_dir_all(&temp_dir).await {
            log::error!("Failed to create temp directory: {}", e);
        } else {
            log::debug!("Temp directory exists or created: {:?}", temp_dir);
        }

        temp_dir.join(asset_id).join(file_name).to_string_lossy().to_string()
    }

    async fn get_temp_path(
        &self,
        _owner_id: &str,
        _asset_id: &str,
        _file_name: &str,
    ) -> Option<String> {
        // Local storage doesn't need temp files
        None
    }

    fn validate_magic_bytes(&self, data: &[u8], mime_type: &str) -> bool {
        match mime_type {
            "model/gltf-binary" if data.len() > 4 => {
                // GLB files start with "glTF"
                &data[0..4] == b"glTF"
            }
            "image/png" if data.len() > 8 => {
                // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
                &data[0..8] == [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
            }
            "image/jpeg" if data.len() > 2 => {
                // JPEG magic bytes: FF D8
                data[0] == 0xFF && data[1] == 0xD8
            }
            "image/gif" if data.len() > 6 => {
                // GIF magic bytes: GIF87a or GIF89a
                &data[0..4] == b"GIF8"
            }
            "image/webp" if data.len() > 12 => {
                // WebP starts with RIFF....WEBP
                &data[0..4] == b"RIFF" && &data[8..12] == b"WEBP"
            }
            "audio/mpeg" | "audio/mp3" if data.len() > 3 => {
                // MP3 starts with ID3 tag or sync bytes
                &data[0..3] == b"ID3" || (data[0] == 0xFF && (data[1] & 0xE0) == 0xE0)
            }
            "audio/ogg" if data.len() > 4 => {
                // OGG starts with OggS
                &data[0..4] == b"OggS"
            }
            "audio/wave" | "audio/wav" if data.len() > 12 => {
                // WAV starts with RIFF....WAVE
                &data[0..4] == b"RIFF" && &data[8..12] == b"WAVE"
            }
            "video/mp4" if data.len() > 12 => {
                // MP4 starts with ftyp (in a box)
                // Most MP4 files start with: 00 00 00 xx 66 74 79 70
                &data[4..8] == b"ftyp"
            }
            "video/webm" if data.len() > 4 => {
                // WebM starts with EBML header
                &data[0..4] == b"\x1A\x45\xDF\xA3"
            }
            _ => true, // Allow unknown types for extensibility
        }
    }
}

#[async_trait]
impl StorageBackend for LocalStorageBackend {
    async fn get_temp_path(
        &self,
        owner_id: &str,
        asset_id: &str,
        file_name: &str,
    ) -> Option<String> {
        let temp_dir = Path::new(&self.base_path)
            .join(owner_id)
            .join("temp");

        // Create temp directory if needed
        if let Err(e) = tokio::fs::create_dir_all(&temp_dir).await {
            log::error!("Failed to create temp directory: {}", e);
            return None;
        }

        let temp_file = temp_dir.join(asset_id).join(file_name);
        Some(temp_file.to_string_lossy().to_string())
    }

    /// Clean up old temporary files
    async fn cleanup_temp_files(&self) {
        let temp_dir = Path::new(&self.base_path).join("temp");

        if !temp_dir.exists() {
            return;
        }

        // Clean up temp files older than 1 hour
        let now = std::time::SystemTime::now();
        let one_hour_ago = now - std::time::Duration::from_secs(3600);

        match tokio::fs::read_dir(&temp_dir).await {
            Ok(entries) => {
                for entry in entries {
                    if let Ok(metadata) = tokio::fs::metadata(&entry.path()).await {
                        if let Ok(modified) = metadata.modified() {
                            if modified < one_hour_ago {
                                if let Err(e) = tokio::fs::remove_file(&entry.path()).await {
                                    log::warn!("Failed to delete temp file: {} - {}", entry.path.display(), e);
                                }
                            }
                        }
                    }
                }
                _ => {}
            }
            Err(e) => log::error!("Failed to read temp directory: {}", e),
        }
    }

        Some(temp_dir.join(asset_id).join(file_name).to_string_lossy().to_string())
    }
    async fn store_file(
        &self,
        owner_id: &str,
        asset_id: &str,
        file_name: &str,
        data: Vec<u8>,
        mime_type: &str,
        max_size: u64,
    ) -> StorageResult<StoredFile> {
        // Validate file size
        let size = data.len() as u64;
        if size > max_size {
            return Err(StorageError::FileTooLarge { size, max: max_size });
        }

        // Validate magic bytes for security
        if !self.validate_magic_bytes(&data, mime_type) {
            return Err(StorageError::InvalidFileType(
                "File content does not match declared MIME type".to_string(),
            ));
        }

        // Build file path
        let path = self.build_path(owner_id, asset_id, file_name);
        let full_path = Path::new(&path);

        // Create directory structure
        if let Some(parent) = full_path.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        // Write file
        tokio::fs::write(&full_path, data).await?;

        log::info!(
            "Stored file: {} ({} bytes, type: {})",
            path,
            size,
            mime_type
        );

        Ok(StoredFile {
            path,
            size,
            mime_type: mime_type.to_string(),
        })
    }

    async fn get_file(&self, path: &str) -> StorageResult<Vec<u8>> {
        tokio::fs::read(path)
            .await
            .map_err(|e| StorageError::FileNotFound(path.to_string()))
    }

    async fn delete_file(&self, path: &str) -> StorageResult<()> {
        tokio::fs::remove_file(path).await?;
        log::info!("Deleted file: {}", path);
        Ok(())
    }

    async fn file_exists(&self, path: &str) -> StorageResult<bool> {
        match tokio::fs::metadata(path).await {
            Ok(_) => Ok(true),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(false),
            Err(e) => Err(StorageError::Io(e)),
        }
    }

    async fn store_chunk(
        &self,
        owner_id: &str,
        session_id: &str,
        chunk_number: i32,
        data: Vec<u8>,
    ) -> StorageResult<String> {
        let chunks_dir = Path::new(&self.base_path)
            .join(owner_id)
            .join("chunks")
            .join(session_id);

        tokio::fs::create_dir_all(&chunks_dir).await?;

        let chunk_path = chunks_dir.join(format!("{}", chunk_number));
        tokio::fs::write(&chunk_path, data).await?;

        log::info!(
            "Stored chunk {}/{} ({} bytes)",
            session_id,
            chunk_number,
            chunk_path.metadata().map(|m| m.len()).unwrap_or(0)
        );

        Ok(chunk_path.to_string_lossy().to_string())
    }

    async fn merge_chunks(
        &self,
        owner_id: &str,
        session_id: &str,
    ) -> StorageResult<MergedFile> {
        use std::io::Write;

        let chunks_dir = Path::new(&self.base_path)
            .join(owner_id)
            .join("chunks")
            .join(session_id);

        let entries = tokio::fs::read_dir(&chunks_dir).await.map_err(|e| {
            StorageError::Io(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                format!("Chunk directory not found: {}", e),
            ))
        })?;

        let mut chunks: Vec<(i32, std::path::PathBuf)> = Vec::new();
        let mut entry = entries;
        while let Ok(Some(chunk_entry)) = entry.next_entry().await {
            let chunk_number = chunk_entry
                .file_name()
                .to_string_lossy()
                .parse::<i32>()
                .map_err(|_| StorageError::Storage(format!("Invalid chunk filename: {:?}", chunk_entry.file_name())))?;

            chunks.push((chunk_number, chunk_entry.path()));
        }

        if chunks.is_empty() {
            return Err(StorageError::Storage("No chunks found".to_string()));
        }

        chunks.sort_by_key(|(num, _)| *num);

        let asset_id = Uuid::new_v4().to_string();
        let file_path = format!(
            "{}/{}/temp/{}.bin",
            self.base_path.trim_end_matches('/'),
            owner_id,
            session_id
        );

        let mut merged_file = std::fs::File::create(&file_path)?;
        let mut total_size: u64 = 0;

        for (_chunk_number, chunk_path) in &chunks {
            let chunk_data = tokio::fs::read(chunk_path).await?;
            total_size += chunk_data.len() as u64;
            merged_file.write_all(&chunk_data)?;
        }

        log::info!(
            "Merged {} chunks into {} ({} bytes)",
            chunks.len(),
            file_path,
            total_size
        );

        let mime_type = mime_guess::from_path(&file_path)
            .first_or_octet_stream()
            .to_string();

        Ok(MergedFile {
            path: file_path,
            size: total_size,
            mime_type,
            asset_id,
        })
    }

    async fn cleanup_chunks(&self, owner_id: &str, session_id: &str) -> StorageResult<()> {
        let chunks_dir = Path::new(&self.base_path)
            .join(owner_id)
            .join("chunks")
            .join(session_id);

        if chunks_dir.exists() {
            tokio::fs::remove_dir_all(&chunks_dir).await?;
            log::info!("Cleaned up chunks for session {}", session_id);
        }

        Ok(())
    }
}

