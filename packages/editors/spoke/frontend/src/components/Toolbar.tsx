/**
 * Toolbar Component
 *
 * Top toolbar with transform mode and add object buttons
 */

interface ToolbarProps {
  onAddObject: (type: 'box' | 'sphere' | 'plane') => void;
  onDeleteSelected: () => void;
  onTransformModeChange: (mode: 'translate' | 'rotate' | 'scale') => void;
  transformMode: 'translate' | 'rotate' | 'scale';
}

export function Toolbar({
  onAddObject,
  onDeleteSelected,
  onTransformModeChange,
  transformMode
}: ToolbarProps) {
  return (
    <div
      style={{
        height: '40px',
        background: '#333',
        borderBottom: '1px solid #444',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '12px',
        gap: '8px'
      }}
    >
      {/* Transform mode buttons */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          marginRight: '16px',
          padding: '2px',
          background: '#2a2a2a',
          borderRadius: '4px'
        }}
      >
        {(['translate', 'rotate', 'scale'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => onTransformModeChange(mode)}
            style={{
              padding: '4px 12px',
              background: mode === transformMode ? '#005a9e' : 'transparent',
              color: mode === transformMode ? '#fff' : '#aaa',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '11px',
              textTransform: 'uppercase' as const,
              fontWeight: mode === transformMode ? 600 : 400,
              transition: 'background 0.2s'
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      <div style={{ width: '1px', height: '24px', background: '#444', margin: '0 8px' }} />

      {/* Add object buttons */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={() => onAddObject('box')}
          style={{
            padding: '6px 12px',
            background: '#4444ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 500
          }}
        >
          Box
        </button>
        <button
          onClick={() => onAddObject('sphere')}
          style={{
            padding: '6px 12px',
            background: '#44aa44',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 500
          }}
        >
          Sphere
        </button>
        <button
          onClick={() => onAddObject('plane')}
          style={{
            padding: '6px 12px',
            background: '#ff44aa',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 500
          }}
        >
          Plane
        </button>
      </div>

      <div style={{ flex: 1 }} />

      {/* File operations */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={onDeleteSelected}
          style={{
            padding: '6px 12px',
            background: '#aa4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 500
          }}
        >
          Delete
        </button>
        <button
          style={{
            padding: '6px 12px',
            background: '#2a8a44',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 500
          }}
        >
          Save
        </button>
        <button
          style={{
            padding: '6px 12px',
            background: '#8a44aa',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 500
          }}
        >
          Export
        </button>
      </div>
    </div>
  );
}
