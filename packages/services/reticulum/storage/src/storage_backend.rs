//! Storage backend abstraction for file operations

use async_trait::async_trait;
use std::path::Path;

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
}

pub type StorageResult<T> = Result<T, StorageError>;

/// Information about a stored file
#[derive(Debug, Clone)]
pub struct StoredFile {
    pub path: String,
    pub size: u64,
    pub mime_type: String,
}

/// Storage backend trait - allows switching between local and cloud storage
#[async_trait]
pub trait StorageBackend: Send + Sync {
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
}
