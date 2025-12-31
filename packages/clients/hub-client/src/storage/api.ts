/**
 * Storage Service API Client
 *
 * Handles communication with the storage service for asset uploads,
 * downloads, and management.
 */

export interface Asset {
  asset_id: string;
  file_name: string;
  asset_type: AssetType;
  file_size: number;
  mime_type: string;
  is_public: boolean;
  created_at: string;
}

export type AssetType = 'model' | 'texture' | 'audio' | 'video';

export interface UploadResponse {
  asset_id: string;
  file_name: string;
  asset_type: string;
  file_size: number;
  mime_type: string;
  download_url: string;
}

export interface UploadOptions {
  file: File;
  assetType: AssetType;
  isPublic?: boolean;
  metadata?: Record<string, unknown>;
  onProgress?: (progress: number) => void;
}

export interface ListAssetsOptions {
  assetType?: AssetType;
  isPublic?: boolean;
  page?: number;
  perPage?: number;
}

export interface ListAssetsResponse {
  assets: Asset[];
  total: number;
  page: number;
  per_page: number;
}

/**
 * Storage API Client class
 */
class StorageApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_STORAGE_API_URL || 'http://localhost:8005';
  }

  /**
   * Get the base URL for the storage service
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Check if the storage service is healthy
   */
  async healthCheck(): Promise<{ service: string; status: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Health check failed:', error);
      return null;
    }
  }

  /**
   * Upload an asset file
   */
  async uploadAsset(options: UploadOptions): Promise<UploadResponse> {
    const { file, assetType, isPublic = false, metadata = {}, onProgress } = options;

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('asset_type', assetType);
      formData.append('is_public', String(isPublic));
      if (Object.keys(metadata).length > 0) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      // Send request
      xhr.open('POST', `${this.baseUrl}/upload`);
      xhr.send(formData);
    });
  }

  /**
   * List assets for the current user
   */
  async listAssets(options: ListAssetsOptions = {}): Promise<ListAssetsResponse> {
    const params = new URLSearchParams();
    if (options.assetType) {
      params.append('asset_type', options.assetType);
    }
    if (options.isPublic !== undefined) {
      params.append('is_public', String(options.isPublic));
    }
    if (options.page) {
      params.append('page', String(options.page));
    }
    if (options.perPage) {
      params.append('per_page', String(options.perPage));
    }

    const url = `${this.baseUrl}/assets${params.toString() ? `?${params}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to list assets: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get asset metadata by ID
   */
  async getAsset(assetId: string): Promise<Asset | null> {
    try {
      const response = await fetch(`${this.baseUrl}/assets/${assetId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to get asset:', error);
      return null;
    }
  }

  /**
   * Get the download URL for an asset
   */
  getAssetDownloadUrl(assetId: string): string {
    return `${this.baseUrl}/assets/${assetId}/download`;
  }

  /**
   * Download an asset file
   */
  async downloadAsset(assetId: string): Promise<Blob | null> {
    try {
      const response = await fetch(this.getAssetDownloadUrl(assetId));
      if (response.ok) {
        return await response.blob();
      }
      return null;
    } catch (error) {
      console.error('Failed to download asset:', error);
      return null;
    }
  }

  /**
   * Delete an asset
   */
  async deleteAsset(assetId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete asset');
      }

      return true;
    } catch (error) {
      console.error('Failed to delete asset:', error);
      throw error;
    }
  }

  /**
   * Get file icon based on asset type
   */
  getAssetIcon(assetType: AssetType): string {
    const icons: Record<AssetType, string> = {
      model: '🎲',
      texture: '🖼️',
      audio: '🎵',
      video: '🎬',
    };
    return icons[assetType] || '📄';
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get allowed file extensions for an asset type
   */
  getAllowedExtensions(assetType: AssetType): string[] {
    const extensions: Record<AssetType, string[]> = {
      model: ['glb', 'gltf'],
      texture: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
      audio: ['mp3', 'ogg', 'wav'],
      video: ['mp4', 'webm'],
    };
    return extensions[assetType] || [];
  }

  /**
   * Get MIME types for an asset type
   */
  getMimeTypes(assetType: AssetType): string[] {
    const mimeTypes: Record<AssetType, string[]> = {
      model: ['model/gltf-binary', 'model/gltf+json'],
      texture: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      audio: ['audio/mpeg', 'audio/ogg', 'audio/wav'],
      video: ['video/mp4', 'video/webm'],
    };
    return mimeTypes[assetType] || [];
  }

  /**
   * Get maximum file size for an asset type (in bytes)
   */
  getMaxFileSize(assetType: AssetType): number {
    const sizes: Record<AssetType, number> = {
      model: 100 * 1024 * 1024, // 100MB
      texture: 10 * 1024 * 1024, // 10MB
      audio: 50 * 1024 * 1024, // 50MB
      video: 200 * 1024 * 1024, // 200MB
    };
    return sizes[assetType] || 10 * 1024 * 1024; // Default 10MB
  }
}

// Export singleton instance
export const storageApi = new StorageApi();
