import { useState } from 'react';
import { DrawingMode, DrawingColor, DrawingSettings } from './DrawingCanvas';

/**
 * Drawing Tools UI Component
 *
 * Provides controls for the drawing canvas:
 * - Color picker (8 preset colors)
 * - Mode selector (brush, line, rectangle, circle, text)
 * - Brush size slider
 * - Clear, undo, export buttons
 * - Undo history display
 */

interface DrawingToolsProps {
  settings: DrawingSettings;
  onSettingsChange: (settings: DrawingSettings) => void;
  onClear: () => void;
  onUndo: () => void;
  onExport: () => void;
}

export function DrawingTools({
  settings,
  onSettingsChange,
  onClear,
  onUndo,
  onExport
}: DrawingToolsProps) {
  const [showHistory, setShowHistory] = useState(false);

  const handleColorChange = (color: DrawingColor) => {
    onSettingsChange({ ...settings, color });
  };

  const handleModeChange = (mode: DrawingMode) => {
    onSettingsChange({ ...settings, mode });
  };

  const handleBrushSizeChange = (size: number) => {
    onSettingsChange({ ...settings, brushSize: size });
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div
      style={{
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
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🎨 Drawing Tools
        </div>
        <button
          onClick={toggleHistory}
          style={{
            padding: '6px 12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            color: '#333',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          title={showHistory ? 'Hide History' : 'Show History'}
        >
          {showHistory ? '📜' : '📚'}
        </button>
      </div>

      {/* Drawing Mode Selection */}
      <div style={{ marginBottom: '12px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            marginBottom: '8px',
            opacity: 0.8
          }}
        >
          Mode:
        </label>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={() => handleModeChange('brush')}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: settings.mode === 'brush' ? '#6366f1' : 'transparent',
              border:
                settings.mode === 'brush'
                  ? '2px solid #6366f1'
                  : '1px solid rgba(255,255,255,255,0.2)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            🖌️ Brush
          </button>
          <button
            onClick={() => handleModeChange('line')}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: settings.mode === 'line' ? '#6366f1' : 'transparent',
              border:
                settings.mode === 'line'
                  ? '2px solid #6366f1'
                  : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            📏 Line
          </button>
          <button
            onClick={() => handleModeChange('rectangle')}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: settings.mode === 'rectangle' ? '#6366f1' : 'transparent',
              border:
                settings.mode === 'rectangle'
                  ? '2px solid #6366f1'
                  : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Rectangle
          </button>
          <button
            onClick={() => handleModeChange('circle')}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: settings.mode === 'circle' ? '#6366f1' : 'transparent',
              border:
                settings.mode === 'circle'
                  ? '2px solid #6366f1'
                  : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ○ Circle
          </button>
        </div>
      </div>

      {/* Color Picker */}
      <div style={{ marginBottom: '12px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            marginBottom: '8px',
            opacity: 0.8
          }}
        >
          Color:
        </label>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          {[
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
          ].map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              style={{
                width: '32px',
                height: '32px',
                border: settings.color === color ? '3px solid white' : '1px solid transparent',
                borderRadius: '50%',
                cursor: 'pointer'
              }}
              title={`Color: ${color}`}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: color
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Brush Size */}
      <div style={{ marginBottom: '12px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            marginBottom: '8px',
            opacity: 0.8
          }}
        >
          Brush Size: {Math.round(settings.brushSize * 10)}
        </label>
        <input
          type="range"
          min={1}
          max={10}
          step={0.1}
          value={settings.brushSize}
          onChange={(e) => handleBrushSizeChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '4px',
            borderRadius: '2px',
            cursor: 'pointer'
          }}
        />
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}
      >
        <button
          onClick={() => handleModeChange('brush')}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: settings.mode === 'brush' ? '#6366f1' : 'transparent',
            border:
              settings.mode === 'brush'
                ? '2px solid #6366f1'
                : '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          ↩️ Undo
        </button>
        <button
          onClick={onClear}
          style={{
            padding: '10px 16px',
            background: 'rgba(220, 38, 38, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear
        </button>
        <button
          onClick={onExport}
          style={{
            padding: '10px 16px',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          title="Export drawing as PNG"
        >
          💾 Export
        </button>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div
          style={{
            position: 'absolute',
            top: '180px',
            background: 'rgba(0, 0, 0, 0.95)',
            padding: '12px',
            borderRadius: '8px',
            maxHeight: '200px',
            overflow: 'auto',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: 'white'
            }}
          >
            Drawing History
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '4px',
              fontSize: '11px',
              color: 'white'
            }}
          >
            {settings.mode === 'text' && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div
                  key="undo"
                  onClick={onUndo}
                  style={{
                    padding: '8px',
                    background: 'rgba(107, 114, 128, 0.2)',
                    border: '1px solid rgba(255,255,255,255,0.2)',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  ↩️
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
