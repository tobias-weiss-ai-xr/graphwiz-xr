/**
 * AssetBrowser Component
 *
 * Displays a paginated grid of user's assets with filtering and selection.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Asset, storageApi, AssetType, ListAssetsResponse } from './api';
import { AssetCard } from './AssetCard';

interface AssetBrowserProps {
  onAssetSelect?: (asset: Asset | null) => void;
  selectedAssetId?: string;
  pageSize?: number;
}

export const AssetBrowser: React.FC<AssetBrowserProps> = ({
  onAssetSelect,
  selectedAssetId,
  pageSize = 20,
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAssets, setTotalAssets] = useState(0);
  const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: ListAssetsResponse = await storageApi.listAssets({
        assetType: filterType !== 'all' ? filterType : undefined,
        page: currentPage,
        perPage: pageSize,
      });

      setAssets(response.assets);
      setTotalAssets(response.total);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterType, pageSize, refreshKey]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleAssetSelect = (asset: Asset) => {
    if (onAssetSelect) {
      onAssetSelect(asset);
    }
  };

  const handleAssetDelete = (assetId: string) => {
    setAssets(assets.filter((a) => a.asset_id !== assetId));
    setTotalAssets(totalAssets - 1);
    if (selectedAssetId === assetId && onAssetSelect) {
      onAssetSelect(null);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((key) => key + 1);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '18px' }}>My Assets</h3>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as AssetType | 'all');
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="all">All Types</option>
            <option value="model">3D Models</option>
            <option value="texture">Textures</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Asset Count */}
      <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
        {totalAssets} {totalAssets === 1 ? 'asset' : 'assets'} found
        {filterType !== 'all' && ` (filtered by: ${filterType})`}
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: '4px',
            color: '#c62828',
            fontSize: '13px',
            marginBottom: '16px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && assets.length === 0 && (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#666',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏳</div>
          <div>Loading assets...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && assets.length === 0 && (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#666',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>No assets found</div>
          <div style={{ fontSize: '14px' }}>
            {filterType !== 'all'
              ? `No ${filterType} assets uploaded yet`
              : 'No assets uploaded yet'}
          </div>
        </div>
      )}

      {/* Asset Grid */}
      {!loading && assets.length > 0 && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {assets.map((asset) => (
              <AssetCard
                key={asset.asset_id}
                asset={asset}
                isSelected={selectedAssetId === asset.asset_id}
                onSelect={onAssetSelect ? handleAssetSelect : undefined}
                onDelete={handleAssetDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px',
              }}
            >
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === 1 ? '#e0e0e0' : '#2196F3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                Previous
              </button>

              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#2196F3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
