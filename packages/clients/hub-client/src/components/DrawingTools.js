import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function DrawingTools({ settings, onSettingsChange, onClear, onUndo, onExport }) {
    const [showHistory, setShowHistory] = useState(false);
    const handleColorChange = (color) => {
        onSettingsChange({ ...settings, color });
    };
    const handleModeChange = (mode) => {
        onSettingsChange({ ...settings, mode });
    };
    const handleBrushSizeChange = (size) => {
        onSettingsChange({ ...settings, brushSize: size });
    };
    const toggleHistory = () => {
        setShowHistory(!showHistory);
    };
    return (_jsxs("div", { style: {
            position: 'absolute',
            left: '20px',
            top: '20px',
            background: 'rgba(0, 0, 0, 0.85)',
            padding: '16px',
            borderRadius: '12px',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            minWidth: '280px',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }, children: [_jsx("div", { style: {
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }, children: "\uD83C\uDFA8 Drawing Tools" }), _jsx("button", { onClick: toggleHistory, style: {
                            padding: '6px 12px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#333',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }, title: showHistory ? 'Hide History' : 'Show History', children: showHistory ? '📜' : '📚' })] }), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsx("label", { style: {
                            display: 'block',
                            fontSize: '12px',
                            marginBottom: '8px',
                            opacity: 0.8
                        }, children: "Mode:" }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap'
                        }, children: [_jsx("button", { onClick: () => handleModeChange('brush'), style: {
                                    flex: 1,
                                    padding: '10px 16px',
                                    background: settings.mode === 'brush' ? '#6366f1' : 'transparent',
                                    border: settings.mode === 'brush'
                                        ? '2px solid #6366f1'
                                        : '1px solid rgba(255,255,255,255,0.2)',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }, children: "\uD83D\uDD8C\uFE0F Brush" }), _jsx("button", { onClick: () => handleModeChange('line'), style: {
                                    flex: 1,
                                    padding: '10px 16px',
                                    background: settings.mode === 'line' ? '#6366f1' : 'transparent',
                                    border: settings.mode === 'line'
                                        ? '2px solid #6366f1'
                                        : '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }, children: "\uD83D\uDCCF Line" }), _jsx("button", { onClick: () => handleModeChange('rectangle'), style: {
                                    flex: 1,
                                    padding: '10px 16px',
                                    background: settings.mode === 'rectangle' ? '#6366f1' : 'transparent',
                                    border: settings.mode === 'rectangle'
                                        ? '2px solid #6366f1'
                                        : '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }, children: "Rectangle" }), _jsx("button", { onClick: () => handleModeChange('circle'), style: {
                                    flex: 1,
                                    padding: '10px 16px',
                                    background: settings.mode === 'circle' ? '#6366f1' : 'transparent',
                                    border: settings.mode === 'circle'
                                        ? '2px solid #6366f1'
                                        : '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }, children: "\u25CB Circle" })] })] }), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsx("label", { style: {
                            display: 'block',
                            fontSize: '12px',
                            marginBottom: '8px',
                            opacity: 0.8
                        }, children: "Color:" }), _jsx("div", { style: {
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap'
                        }, children: [
                            '#ffffff',
                            '#000000',
                            '#ff0000',
                            '#00ff00',
                            '#0000ff',
                            '#ffff00',
                            '#ff00ff',
                            '#00ffff',
                            '#00ffff',
                            '#ff00ff'
                        ].map((color) => (_jsx("button", { onClick: () => handleColorChange(color), style: {
                                width: '32px',
                                height: '32px',
                                border: settings.color === color ? '3px solid white' : '1px solid transparent',
                                borderRadius: '50%',
                                cursor: 'pointer'
                            }, title: `Color: ${color}`, children: _jsx("div", { style: {
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: color
                                } }) }, color))) })] }), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsxs("label", { style: {
                            display: 'block',
                            fontSize: '12px',
                            marginBottom: '8px',
                            opacity: 0.8
                        }, children: ["Brush Size: ", Math.round(settings.brushSize * 10)] }), _jsx("input", { type: "range", min: 1, max: 10, step: 0.1, value: settings.brushSize, onChange: (e) => handleBrushSizeChange(parseFloat(e.target.value)), style: {
                            width: '100%',
                            height: '4px',
                            borderRadius: '2px',
                            cursor: 'pointer'
                        } })] }), _jsxs("div", { style: {
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                }, children: [_jsx("button", { onClick: () => handleModeChange('brush'), style: {
                            flex: 1,
                            padding: '10px 16px',
                            background: settings.mode === 'brush' ? '#6366f1' : 'transparent',
                            border: settings.mode === 'brush'
                                ? '2px solid #6366f1'
                                : '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }, children: "\u21A9\uFE0F Undo" }), _jsx("button", { onClick: onClear, style: {
                            padding: '10px 16px',
                            background: 'rgba(220, 38, 38, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }, children: "\uD83D\uDDD1\uFE0F Clear" }), _jsx("button", { onClick: onExport, style: {
                            padding: '10px 16px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }, title: "Export drawing as PNG", children: "\uD83D\uDCBE Export" })] }), showHistory && (_jsxs("div", { style: {
                    position: 'absolute',
                    top: '180px',
                    background: 'rgba(0, 0, 0, 0.95)',
                    padding: '12px',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflow: 'auto',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }, children: [_jsx("div", { style: {
                            fontSize: '14px',
                            fontWeight: 'bold',
                            marginBottom: '12px',
                            color: 'white'
                        }, children: "Drawing History" }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '4px',
                            fontSize: '11px',
                            color: 'white'
                        }, children: settings.mode === 'text' && (_jsx("div", { style: { gridColumn: '1 / -1' }, children: _jsx("div", { onClick: onUndo, style: {
                                    padding: '8px',
                                    background: 'rgba(107, 114, 128, 0.2)',
                                    border: '1px solid rgba(255,255,255,255,0.2)',
                                    borderRadius: '4px',
                                    color: 'white',
                                    fontSize: '10px',
                                    cursor: 'pointer'
                                }, children: "\u21A9\uFE0F" }, "undo") })) })] }))] }));
}
