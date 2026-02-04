//! Storage backend abstraction for file operations
//!
//! Supports local filesystem storage (only backend available)
//!
//! To configure storage, set these environment variables:
//! - STORAGE_BASE_PATH (defaults to ./storage)

use async_trait::async_trait;
use std::path::Path;
use uuid::Uuid;

/// Configuration for storage backend
#[derive(Debug, Clone)]
pub struct StorageConfig {
    pub base_path: String,
}

impl StorageConfig {
    /// Create default storage configuration
    pub fn new() -> Self {
        let base_path = std::env::var("STORAGE_BASE_PATH")
            .unwrap_or_else(|_| "./storage".to_string());

        Self { base_path }
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

    /// Clean up old temporary files
    async fn cleanup_temp_files(&self);

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

#[derive(Debug, Clone, Default)]
pub enum StorageBackendType {
    #[default]
    Local,
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
    #[allow(dead_code)]
    S3Config(String),

    #[error("S3 error: {0}")]
    S3Error(String),
}

/// Local filesystem storage implementation
pub struct LocalStorageBackend {
    base_path: String,
}

    impl LocalStorageBackend {
    pub fn new(base_path: String) -> Self {
        Self { base_path }
    }

    fn build_path(&self, _owner_id: &str, _asset_id: &str, _file_name: &str) -> String {
        format!(
            "{}/{}/{}",
            self.base_path.trim_end_matches('/'),
            _owner_id,
            _asset_id
        )
    }

    fn validate_magic_bytes(&self, data: &[u8], mime_type: &str) -> bool {
        match mime_type {
            "model/gltf-binary" | "model/gltf+json" => {
                data.len() >= 4 && (data.starts_with(b"glTF") || data.starts_with(b"{"))
            }
            "image/png" => data.len() >= 8 && &data[0..8] == b"\x89PNG\r\n\x1a\n",
            "image/jpeg" => data.len() >= 2 && data[0..2] == [0xFF, 0xD8],
            "image/gif" => data.len() >= 6 && (data[0..6] == b"GIF87a" || data[0..6] == b"GIF89a"),
            "image/webp" => data.len() >= 12 && &data[0..4] == b"RIFF" && &data[8..12] == b"WEBP",
            "audio/mpeg" => data.len() >= 3 && &data[0..3] == b"ID3",
            "audio/ogg" => data.len() >= 4 && &data[0..4] == b"OggS",
            "audio/wav" => data.len() >= 12 && &data[0..4] == b"RIFF" && &data[8..12] == b"WAVE",
            "video/mp4" => data.len() >= 12 && &data[4..8] == b"ftyp",
            "video/webm" => data.len() >= 4 && &data[0..4] == b"\x1a\x45\xdf\xa3",
            _ => true,
        }
    }
}

#[async_trait::async_trait]
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
            }
            Err(e) => log::error!("Failed to read temp directory: {}", e),
        }
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
            .map_err(|_e| StorageError::FileNotFound(path.to_string()))
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

