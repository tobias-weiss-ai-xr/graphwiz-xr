import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * AssetBrowser Component
 *
 * Displays a paginated grid of user's assets with filtering and selection.
 */
import { useState, useEffect, useCallback } from 'react';
import { storageApi } from './api';
import { AssetCard } from './AssetCard';
export const AssetBrowser = ({ onAssetSelect, selectedAssetId, pageSize = 20, }) => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalAssets, setTotalAssets] = useState(0);
    const [filterType, setFilterType] = useState('all');
    const [refreshKey, setRefreshKey] = useState(0);
    const loadAssets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await storageApi.listAssets({
                assetType: filterType !== 'all' ? filterType : undefined,
                page: currentPage,
                perPage: pageSize,
            });
            setAssets(response.assets);
            setTotalAssets(response.total);
            setTotalPages(Math.ceil(response.total / pageSize));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load assets');
            console.error('Failed to load assets:', err);
        }
        finally {
            setLoading(false);
        }
    }, [currentPage, filterType, pageSize, refreshKey]);
    useEffect(() => {
        loadAssets();
    }, [loadAssets]);
    const handleAssetSelect = (asset) => {
        if (onAssetSelect) {
            onAssetSelect(asset);
        }
    };
    const handleAssetDelete = (assetId) => {
        setAssets(assets.filter((a) => a.asset_id !== assetId));
        setTotalAssets(totalAssets - 1);
        if (selectedAssetId === assetId && onAssetSelect) {
            onAssetSelect(null);
        }
    };
    const handleRefresh = () => {
        setRefreshKey((key) => key + 1);
    };
    return (_jsxs("div", { style: { width: '100%' }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '12px',
                }, children: [_jsx("h3", { style: { margin: 0, fontSize: '18px' }, children: "My Assets" }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsxs("select", { value: filterType, onChange: (e) => {
                                    setFilterType(e.target.value);
                                    setCurrentPage(1);
                                }, style: {
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                }, children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "model", children: "3D Models" }), _jsx("option", { value: "texture", children: "Textures" }), _jsx("option", { value: "audio", children: "Audio" }), _jsx("option", { value: "video", children: "Video" })] }), _jsx("button", { onClick: handleRefresh, disabled: loading, style: {
                                    padding: '8px 16px',
                                    backgroundColor: '#2196F3',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    opacity: loading ? 0.6 : 1,
                                }, children: loading ? 'Loading...' : 'Refresh' })] })] }), _jsxs("div", { style: { marginBottom: '12px', fontSize: '14px', color: '#666' }, children: [totalAssets, " ", totalAssets === 1 ? 'asset' : 'assets', " found", filterType !== 'all' && ` (filtered by: ${filterType})`] }), error && (_jsxs("div", { style: {
                    padding: '12px',
                    backgroundColor: '#ffebee',
                    border: '1px solid #f44336',
                    borderRadius: '4px',
                    color: '#c62828',
                    fontSize: '13px',
                    marginBottom: '16px',
                }, children: [_jsx("strong", { children: "Error:" }), " ", error] })), loading && assets.length === 0 && (_jsxs("div", { style: {
                    padding: '40px',
                    textAlign: 'center',
                    color: '#666',
                }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '12px' }, children: "\u23F3" }), _jsx("div", { children: "Loading assets..." })] })), !loading && assets.length === 0 && (_jsxs("div", { style: {
                    padding: '40px',
                    textAlign: 'center',
                    color: '#666',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '12px' }, children: "\uD83D\uDCED" }), _jsx("div", { style: { fontSize: '16px', marginBottom: '8px' }, children: "No assets found" }), _jsx("div", { style: { fontSize: '14px' }, children: filterType !== 'all'
                            ? `No ${filterType} assets uploaded yet`
                            : 'No assets uploaded yet' })] })), !loading && assets.length > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '16px',
                            marginBottom: '16px',
                        }, children: assets.map((asset) => (_jsx(AssetCard, { asset: asset, isSelected: selectedAssetId === asset.asset_id, onSelect: onAssetSelect ? handleAssetSelect : undefined, onDelete: handleAssetDelete }, asset.asset_id))) }), totalPages > 1 && (_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '16px',
                        }, children: [_jsx("button", { onClick: () => setCurrentPage((page) => Math.max(1, page - 1)), disabled: currentPage === 1, style: {
                                    padding: '8px 16px',
                                    backgroundColor: currentPage === 1 ? '#e0e0e0' : '#2196F3',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                }, children: "Previous" }), _jsxs("span", { style: { fontSize: '14px', fontWeight: 'bold' }, children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { onClick: () => setCurrentPage((page) => Math.min(totalPages, page + 1)), disabled: currentPage === totalPages, style: {
                                    padding: '8px 16px',
                                    backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#2196F3',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                }, children: "Next" })] }))] }))] }));
};
