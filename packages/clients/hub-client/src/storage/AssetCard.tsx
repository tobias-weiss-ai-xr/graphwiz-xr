/**
 * AssetCard Component
 *
 * Displays a single asset with its metadata and actions.
 */

import React from 'react';

import { Asset, storageApi, AssetType } from './api';

interface AssetCardProps {
  asset: Asset;
  isSelected?: boolean;
  onSelect?: (asset: Asset) => void;
  onDelete?: (assetId: string) => void;
  onDownload?: (asset: Asset) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  isSelected = false,
  onSelect,
  onDelete,
  onDownload,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await storageApi.deleteAsset(asset.asset_id);
      onDelete(asset.asset_id);
    } catch (error) {
      console.error('Failed to delete asset:', error);
      alert('Failed to delete asset. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(asset);
    } else {
      // Default download behavior
      const url = storageApi.getAssetDownloadUrl(asset.asset_id);
      const a = document.createElement('a');
      a.href = url;
      a.download = asset.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div
      className={`asset-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect && onSelect(asset)}
      style={{
        border: '2px solid ' + (isSelected ? '#4CAF50' : '#e0e0e0'),
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        cursor: onSelect ? 'pointer' : 'default',
        backgroundColor: isSelected ? '#f0f8f0' : '#fff',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (onSelect) {
          e.currentTarget.style.borderColor = '#2196F3';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (onSelect && !isSelected) {
          e.currentTarget.style.borderColor = '#e0e0e0';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '32px', marginRight: '12px' }}>
          {storageApi.getAssetIcon(asset.asset_type as AssetType)}
        </span>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '16px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {asset.file_name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {asset.asset_type.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>
        <div style={{ marginBottom: '4px' }}>
          <strong>Size:</strong> {storageApi.formatFileSize(asset.file_size)}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Type:</strong> {asset.mime_type}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Created:</strong> {formatDate(asset.created_at)}
        </div>
        <div>
          <strong>Visibility:</strong>{' '}
          {asset.is_public ? (
            <span style={{ color: '#4CAF50' }}>Public</span>
          ) : (
            <span style={{ color: '#FF9800' }}>Private</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          style={{
            flex: 1,
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1976D2')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2196F3')}
        >
          Download
        </button>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (showDeleteConfirm) {
                handleDelete();
              } else {
                setShowDeleteConfirm(true);
              }
            }}
            disabled={isDeleting}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: showDeleteConfirm ? '#f44336' : '#FF5722',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              opacity: isDeleting ? 0.6 : 1,
            }}
          >
            {isDeleting
              ? 'Deleting...'
              : showDeleteConfirm
              ? 'Confirm Delete'
              : 'Delete'}
          </button>
        )}
      </div>

      {showDeleteConfirm && !isDeleting && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#c62828',
          }}
        >
          Click again to confirm deletion
        </div>
      )}
    </div>
  );
};
