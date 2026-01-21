import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AssetCard Component
 *
 * Displays a single asset with its metadata and actions.
 */
import React from 'react';
import { storageApi } from './api';
export const AssetCard = ({ asset, isSelected = false, onSelect, onDelete, onDownload, }) => {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const handleDelete = async () => {
        if (!onDelete)
            return;
        setIsDeleting(true);
        try {
            await storageApi.deleteAsset(asset.asset_id);
            onDelete(asset.asset_id);
        }
        catch (error) {
            console.error('Failed to delete asset:', error);
            alert('Failed to delete asset. Please try again.');
        }
        finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };
    const handleDownload = () => {
        if (onDownload) {
            onDownload(asset);
        }
        else {
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
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };
    return (_jsxs("div", { className: `asset-card ${isSelected ? 'selected' : ''}`, onClick: () => onSelect && onSelect(asset), style: {
            border: '2px solid ' + (isSelected ? '#4CAF50' : '#e0e0e0'),
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
            cursor: onSelect ? 'pointer' : 'default',
            backgroundColor: isSelected ? '#f0f8f0' : '#fff',
            transition: 'all 0.2s',
        }, onMouseEnter: (e) => {
            if (onSelect) {
                e.currentTarget.style.borderColor = '#2196F3';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }
        }, onMouseLeave: (e) => {
            if (onSelect && !isSelected) {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.boxShadow = 'none';
            }
        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', marginBottom: '12px' }, children: [_jsx("span", { style: { fontSize: '32px', marginRight: '12px' }, children: storageApi.getAssetIcon(asset.asset_type) }), _jsxs("div", { style: { flex: 1, overflow: 'hidden' }, children: [_jsx("div", { style: {
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }, children: asset.file_name }), _jsx("div", { style: { fontSize: '12px', color: '#666' }, children: asset.asset_type.toUpperCase() })] })] }), _jsxs("div", { style: { fontSize: '13px', color: '#555', marginBottom: '12px' }, children: [_jsxs("div", { style: { marginBottom: '4px' }, children: [_jsx("strong", { children: "Size:" }), " ", storageApi.formatFileSize(asset.file_size)] }), _jsxs("div", { style: { marginBottom: '4px' }, children: [_jsx("strong", { children: "Type:" }), " ", asset.mime_type] }), _jsxs("div", { style: { marginBottom: '4px' }, children: [_jsx("strong", { children: "Created:" }), " ", formatDate(asset.created_at)] }), _jsxs("div", { children: [_jsx("strong", { children: "Visibility:" }), ' ', asset.is_public ? (_jsx("span", { style: { color: '#4CAF50' }, children: "Public" })) : (_jsx("span", { style: { color: '#FF9800' }, children: "Private" }))] })] }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { onClick: (e) => {
                            e.stopPropagation();
                            handleDownload();
                        }, style: {
                            flex: 1,
                            padding: '8px 16px',
                            backgroundColor: '#2196F3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold',
                        }, onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = '#1976D2'), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = '#2196F3'), children: "Download" }), onDelete && (_jsx("button", { onClick: (e) => {
                            e.stopPropagation();
                            if (showDeleteConfirm) {
                                handleDelete();
                            }
                            else {
                                setShowDeleteConfirm(true);
                            }
                        }, disabled: isDeleting, style: {
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
                        }, children: isDeleting
                            ? 'Deleting...'
                            : showDeleteConfirm
                                ? 'Confirm Delete'
                                : 'Delete' }))] }), showDeleteConfirm && !isDeleting && (_jsx("div", { style: {
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#ffebee',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#c62828',
                }, children: "Click again to confirm deletion" }))] }));
};
