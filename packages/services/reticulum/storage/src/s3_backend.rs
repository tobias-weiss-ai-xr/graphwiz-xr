//! S3 storage backend for AWS S3 compatibility
//!
//! This module implements cloud storage using AWS SDK for Rust.
//! Environment variables required:
//! - AWS_REGION (e.g., us-east-1)
//! - AWS_ACCESS_KEY_ID
//! - AWS_SECRET_ACCESS_KEY
//! - S3_BUCKET_NAME

use aws_sdk_s3::{
    Client as S3Client,
    config::BehaviorVersion,
    error::SdkError,
    operation::HeadObjectError,
    primitives::{ByteStream, ByteStreamError},
    types::{Delete, DeleteObjects, ObjectIdentifier},
};
use aws_config::defaults::BehaviorVersion;
use std::path::Path;
use std::time::Duration;
use tokio::io::AsyncWriteExt;
use tokio::time::timeout;

use crate::storage_backend::{StoredFile, StorageBackend, StorageError};

/// S3 client wrapper
pub struct S3StorageBackend {
    client: S3Client,
    bucket: String,
}

impl S3StorageBackend {
    /// Create new S3 storage backend from environment variables
    pub async fn new() -> Result<Self, String> {
        // Load AWS credentials from environment
        let region = std::env::var("AWS_REGION")
            .unwrap_or_else(|_| "us-east-1".to_string());

        let access_key_id = std::env::var("AWS_ACCESS_KEY_ID")
            .ok_or_else(|_| {
                eprintln!("AWS_ACCESS_KEY_ID not set, using mock mode");
                "test_key_id"
            })?;

        let secret_access_key = std::env::var("AWS_SECRET_ACCESS_KEY")
            .ok_or_else(|_| {
                eprintln!("AWS_SECRET_ACCESS_KEY not set, using mock mode");
                "test_secret_key"
            })?;

        let bucket_name = std::env::var("S3_BUCKET_NAME")
            .unwrap_or_else(|_| "graphwiz-xr-assets".to_string());

        // Configure S3 client
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
            .http_timeout(Duration::from_secs(10))
            .https_only(true)
            .build();

        let client = S3Client::new(&config);

        log::info!(
            "S3 backend initialized - Region: {}, Bucket: {}",
            region,
            bucket_name
        );

        Ok(Self {
            client,
            bucket: bucket_name,
        })
    }

    /// Store a file in S3
    async fn upload_file_to_s3(
        &self,
        owner_id: &str,
        asset_id: &str,
        file_name: &str,
        data: Vec<u8>,
        mime_type: &str,
    ) -> Result<String, StorageError> {
        let key = format!("{}/{}/{}", owner_id, asset_id, file_name);

        log::info!(
            "Uploading to S3: {} ({} bytes)",
            key,
            data.len()
        );

        match self
            .client
            .put_object()
            .bucket(&self.bucket)
            .key(&key)
            .body(ByteStream::from(data))
            .content_type(mime_type)
            .send()
            .await
        {
            Ok(output) => {
                log::info!(
                    "Upload success: {} (Version: {})",
                    key,
                    output.version_id()
                );
                Ok(key)
            }
            Err(SdkError::DispatchFailure(e)) => {
                log::error!("S3 dispatch error: {}", e);
                Err(StorageError::Storage(format!(
                    "Failed to upload to S3: {}",
                    e
                )))
            }
            Err(SdkError::ServiceError(e)) => {
                log::error!("S3 service error: {}", e);
                Err(StorageError::Storage(format!(
                    "S3 service error: {}",
                    e
                )))
            }
            Err(e) => {
                log::error!("S3 upload error: {}", e);
                Err(StorageError::Storage(format!(
                    "Failed to upload to S3: {}",
                    e
                )))
            }
        }
    }

    /// Download a file from S3
    async fn download_file_from_s3(
        &self,
        key: &str,
    ) -> Result<Vec<u8>, StorageError> {
        log::info!("Downloading from S3: {}", key);

        match self
            .client
            .get_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
        {
            Ok(output) => {
                let body = output.body.collect().await?;
                log::info!(
                    "Download success: {} ({} bytes)",
                    key,
                    body.len()
                );
                Ok(body)
            }
            Err(SdkError::NoSuchKey(_)) => {
                log::error!("File not found in S3: {}", key);
                Err(StorageError::FileNotFound(key.to_string()))
            }
            Err(SdkError::ServiceError(e)) => {
                log::error!("S3 service error: {}", e);
                Err(StorageError::Storage(format!(
                    "S3 service error: {}",
                    e
                )))
            }
            Err(e) => {
                log::error!("S3 download error: {}", e);
                Err(StorageError::Storage(format!(
                    "Failed to download from S3: {}",
                    e
                )))
            }
        }
    }

    /// Delete a file from S3
    async fn delete_file_from_s3(
        &self,
        key: &str,
    ) -> Result<(), StorageError> {
        log::info!("Deleting from S3: {}", key);

        match self
            .client
            .delete_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
        {
            Ok(_) => {
                log::info!("Delete success: {}", key);
                Ok(())
            }
            Err(SdkError::NoSuchKey(_)) => {
                // File doesn't exist - consider this a success
                log::warn!("File not found in S3, may have been deleted already: {}", key);
                Ok(())
            }
            Err(SdkError::ServiceError(e)) => {
                log::error!("S3 service error: {}", e);
                Err(StorageError::Storage(format!(
                    "S3 service error: {}",
                    e
                )))
            }
            Err(e) => {
                log::error!("S3 delete error: {}", e);
                Err(StorageError::Storage(format!(
                    "Failed to delete from S3: {}",
                    e
                )))
            }
        }
    }

    /// Check if file exists in S3
    async fn file_exists_in_s3(
        &self,
        key: &str,
    ) -> Result<bool, StorageError> {
        match self
            .client
            .head_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
        {
            Ok(_) => Ok(true),  // Object exists
            Err(SdkError::NoSuchKey(_)) => Ok(false), // Object doesn't exist
            Err(SdkError::ServiceError(e)) => {
                log::error!("S3 service error checking file existence: {}", e);
                Err(StorageError::Storage(format!(
                    "S3 service error: {}",
                    e
                )))
            }
            Err(e) => {
                log::error!("Error checking file existence: {}", e);
                Err(StorageError::Storage(format!(
                    "Failed to check file existence: {}",
                    e
                )))
            }
        }
    }
}

#[async_trait::async_trait]
impl StorageBackend for S3StorageBackend {
    /// Store a file and return its storage path (S3 key)
    async fn store_file(
        &self,
        owner_id: &str,
        asset_id: &str,
        file_name: &str,
        data: Vec<u8>,
        mime_type: &str,
        max_size: u64,
    ) -> Result<StoredFile, StorageError> {
        let s3_key = Self::upload_file_to_s3(self, owner_id, asset_id, file_name, data, mime_type).await?;

        // Return S3 key as the "path" (it's a URI, not a local path)
        Ok(StoredFile {
            path: s3_key,
            size: data.len() as u64,
            mime_type: mime_type.to_string(),
        })
    }

    /// Retrieve a file's contents
    async fn get_file(&self, path: &str) -> Result<Vec<u8>, StorageError> {
        // Path is actually the S3 key
        Self::download_file_from_s3(self, path).await
    }

    /// Delete a file
    async fn delete_file(&self, path: &str) -> Result<(), StorageError> {
        // Path is actually the S3 key
        Self::delete_file_from_s3(self, path).await
    }

    /// Check if a file exists
    async fn file_exists(&self, path: &str) -> Result<bool, StorageError> {
        // Path is actually the S3 key
        Self::file_exists_in_s3(self, path).await
    }

    /// Get temp path (not applicable to S3, always returns None)
    async fn get_temp_path(
        &self,
        _owner_id: &str,
        _asset_id: &str,
        _file_name: &str,
    ) -> Option<String> {
        None
    }
}
