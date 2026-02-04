import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AssetUploader Component
 *
 * Provides a drag-and-drop interface for uploading files.
 */
import React, { useCallback, useState } from 'react';
import { storageApi } from './api';
export const AssetUploader = ({ onUploadComplete, acceptedTypes = ['model', 'texture', 'audio', 'video'], maxSize, disabled = false, }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [assetType, setAssetType] = useState('model');
    const [isPublic, setIsPublic] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef(null);
    const handleFileSelect = (file) => {
        setError(null);
        // Check file extension
        const extension = file.name.split('.').pop()?.toLowerCase();
        const allowedExtensions = storageApi.getAllowedExtensions(assetType);
        if (!extension || !allowedExtensions.includes(extension)) {
            setError(`Invalid file type for ${assetType}. Allowed: ${allowedExtensions.join(', ')}`);
            return;
        }
        // Check file size
        const maxFileSize = maxSize || storageApi.getMaxFileSize(assetType);
        if (file.size > maxFileSize) {
            setError(`File too large. Maximum size: ${storageApi.formatFileSize(maxFileSize)}`);
            return;
        }
        setSelectedFile(file);
    };
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled)
            return;
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [disabled, assetType, maxSize]);
    const handleFileInputChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };
    const handleUpload = async () => {
        if (!selectedFile || isUploading)
            return;
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        }
        finally {
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
    return (_jsxs("div", { style: { width: '100%' }, children: [_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', fontWeight: 'bold', marginBottom: '8px' }, children: "Asset Type:" }), _jsxs("select", { value: assetType, onChange: (e) => setAssetType(e.target.value), disabled: isUploading || disabled, style: {
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            backgroundColor: disabled ? '#f5f5f5' : '#fff',
                        }, children: [acceptedTypes.includes('model') && _jsx("option", { value: "model", children: "3D Model (.glb, .gltf)" }), acceptedTypes.includes('texture') && _jsx("option", { value: "texture", children: "Texture (.png, .jpg, .gif)" }), acceptedTypes.includes('audio') && _jsx("option", { value: "audio", children: "Audio (.mp3, .ogg, .wav)" }), acceptedTypes.includes('video') && _jsx("option", { value: "video", children: "Video (.mp4, .webm)" })] }), _jsxs("div", { style: { fontSize: '12px', color: '#666', marginTop: '4px' }, children: ["Max size: ", storageApi.formatFileSize(storageApi.getMaxFileSize(assetType))] })] }), _jsxs("div", { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, onClick: () => {
                    if (!disabled && !isUploading && fileInputRef.current) {
                        fileInputRef.current.click();
                    }
                }, style: {
                    border: `2px dashed ${isDragging ? '#2196F3' : error ? '#f44336' : '#ddd'}`,
                    borderRadius: '8px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
                    backgroundColor: isDragging ? '#e3f2fd' : disabled ? '#f5f5f5' : '#fafafa',
                    transition: 'all 0.2s',
                    opacity: disabled ? 0.6 : 1,
                }, children: [_jsx("input", { ref: fileInputRef, type: "file", onChange: handleFileInputChange, accept: storageApi.getAllowedExtensions(assetType).map((ext) => `.${ext}`).join(','), disabled: isUploading || disabled, style: { display: 'none' } }), selectedFile ? (_jsxs("div", { children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '12px' }, children: "\uD83D\uDCC4" }), _jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px' }, children: selectedFile.name }), _jsx("div", { style: { fontSize: '13px', color: '#666', marginBottom: '12px' }, children: storageApi.formatFileSize(selectedFile.size) }), isUploading && (_jsxs("div", { style: { marginTop: '16px' }, children: [_jsx("div", { style: {
                                            width: '100%',
                                            height: '8px',
                                            backgroundColor: '#e0e0e0',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            marginBottom: '8px',
                                        }, children: _jsx("div", { style: {
                                                width: `${uploadProgress}%`,
                                                height: '100%',
                                                backgroundColor: '#4CAF50',
                                                transition: 'width 0.3s',
                                            } }) }), _jsxs("div", { style: { fontSize: '12px', color: '#666' }, children: [uploadProgress, "% uploaded"] })] })), !isUploading && (_jsxs("div", { style: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }, children: [_jsx("button", { onClick: (e) => {
                                            e.stopPropagation();
                                            handleUpload();
                                        }, style: {
                                            padding: '10px 24px',
                                            backgroundColor: '#4CAF50',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                        }, children: "Upload" }), _jsx("button", { onClick: (e) => {
                                            e.stopPropagation();
                                            handleCancel();
                                        }, style: {
                                            padding: '10px 24px',
                                            backgroundColor: '#f44336',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                        }, children: "Cancel" })] }))] })) : (_jsxs("div", { children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '12px' }, children: "\uD83D\uDCE4" }), _jsx("div", { style: { fontWeight: 'bold', marginBottom: '4px' }, children: isDragging ? 'Drop file here' : 'Drag & drop file here' }), _jsx("div", { style: { fontSize: '13px', color: '#666' }, children: "or click to browse" }), _jsxs("div", { style: { fontSize: '12px', color: '#999', marginTop: '8px' }, children: ["Accepted: ", storageApi.getAllowedExtensions(assetType).join(', ')] })] }))] }), _jsx("div", { style: { marginTop: '16px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: isPublic, onChange: (e) => setIsPublic(e.target.checked), disabled: isUploading || disabled, style: { marginRight: '8px' } }), _jsx("span", { style: { fontSize: '14px' }, children: "Make this asset public" })] }) }), error && (_jsxs("div", { style: {
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#ffebee',
                    border: '1px solid #f44336',
                    borderRadius: '4px',
                    color: '#c62828',
                    fontSize: '13px',
                }, children: [_jsx("strong", { children: "Error:" }), " ", error] }))] }));
};
