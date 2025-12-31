/**
 * AssetUploader Component
 *
 * Provides a drag-and-drop interface for uploading files.
 */

import React, { useCallback, useState } from 'react';
import { storageApi, AssetType, UploadResponse } from './api';

interface AssetUploaderProps {
  onUploadComplete?: (response: UploadResponse) => void;
  acceptedTypes?: AssetType[];
  maxSize?: number; // in bytes
  disabled?: boolean;
}

export const AssetUploader: React.FC<AssetUploaderProps> = ({
  onUploadComplete,
  acceptedTypes = ['model', 'texture', 'audio', 'video'],
  maxSize,
  disabled = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetType, setAssetType] = useState<AssetType>('model');
  const [isPublic, setIsPublic] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = storageApi.getAllowedExtensions(assetType);
    if (!extension || !allowedExtensions.includes(extension)) {
      setError(
        `Invalid file type for ${assetType}. Allowed: ${allowedExtensions.join(', ')}`
      );
      return;
    }

    // Check file size
    const maxFileSize = maxSize || storageApi.getMaxFileSize(assetType);
    if (file.size > maxFileSize) {
      setError(
        `File too large. Maximum size: ${storageApi.formatFileSize(maxFileSize)}`
      );
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, assetType, maxSize]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const response = await storageApi.uploadAsset({
        file: selectedFile,
        assetType: assetType,
        isPublic: isPublic,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      setSelectedFile(null);
      setUploadProgress(0);

      if (onUploadComplete) {
        onUploadComplete(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Asset Type Selector */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
          Asset Type:
        </label>
        <select
          value={assetType}
          onChange={(e) => setAssetType(e.target.value as AssetType)}
          disabled={isUploading || disabled}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: disabled ? '#f5f5f5' : '#fff',
          }}
        >
          {acceptedTypes.includes('model') && <option value="model">3D Model (.glb, .gltf)</option>}
          {acceptedTypes.includes('texture') && <option value="texture">Texture (.png, .jpg, .gif)</option>}
          {acceptedTypes.includes('audio') && <option value="audio">Audio (.mp3, .ogg, .wav)</option>}
          {acceptedTypes.includes('video') && <option value="video">Video (.mp4, .webm)</option>}
        </select>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          Max size: {storageApi.formatFileSize(storageApi.getMaxFileSize(assetType))}
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isUploading && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
        style={{
          border: `2px dashed ${isDragging ? '#2196F3' : error ? '#f44336' : '#ddd'}`,
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
          backgroundColor: isDragging ? '#e3f2fd' : disabled ? '#f5f5f5' : '#fafafa',
          transition: 'all 0.2s',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept={storageApi.getAllowedExtensions(assetType).map((ext) => `.${ext}`).join(',')}
          disabled={isUploading || disabled}
          style={{ display: 'none' }}
        />

        {selectedFile ? (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{selectedFile.name}</div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
              {storageApi.formatFileSize(selectedFile.size)}
            </div>

            {isUploading && (
              <div style={{ marginTop: '16px' }}>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      backgroundColor: '#4CAF50',
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>{uploadProgress}% uploaded</div>
              </div>
            )}

            {!isUploading && (
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  Upload
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📤</div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {isDragging ? 'Drop file here' : 'Drag & drop file here'}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>or click to browse</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              Accepted: {storageApi.getAllowedExtensions(assetType).join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* Public Checkbox */}
      <div style={{ marginTop: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            disabled={isUploading || disabled}
            style={{ marginRight: '8px' }}
          />
          <span style={{ fontSize: '14px' }}>Make this asset public</span>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: '4px',
            color: '#c62828',
            fontSize: '13px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};
