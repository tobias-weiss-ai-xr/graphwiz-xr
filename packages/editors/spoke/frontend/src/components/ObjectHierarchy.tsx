/**
 * Object Hierarchy Panel
 *
 * Shows all scene objects and allows selection
 */
import type { SceneObject } from '../types/SceneObject';

interface ObjectHierarchyProps {
  objects: SceneObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onAddObject: (type: 'box' | 'sphere' | 'plane') => void;
}

export function ObjectHierarchy({
  objects,
  selectedObjectId,
  onSelectObject,
  onAddObject
}: ObjectHierarchyProps) {
  return (
    <div
      style={{
        width: '240px',
        background: '#2d2d2d',
        borderRight: '1px solid #444',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid #444',
          background: '#333'
        }}
      >
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#eee' }}>Hierarchy</h2>
      </div>

      {/* Object list */}
      <div style={{ flex: 1, overflowY: 'auto' as const }}>
        {objects.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' as const, color: '#888' }}>
            <p>No objects</p>
            <p style={{ fontSize: '12px' }}>Add objects from toolbar</p>
          </div>
        ) : (
          objects.map((object) => (
            <div
              key={object.id}
              onClick={() => onSelectObject(object.id)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: object.id === selectedObjectId ? '#005a9e' : 'transparent',
                color: object.id === selectedObjectId ? '#fff' : '#eee',
                borderBottom: '1px solid #3a3a3a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {/* Icon based on type */}
              <span style={{ fontSize: '16px' }}>
                {object.type === 'box' && '📦'}
                {object.type === 'sphere' && '🔵'}
                {object.type === 'plane' && '▱'}
              </span>
              {/* Name */}
              <span style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>{object.name}</span>
            </div>
          ))
        )}
      </div>

      {/* Add button */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid #444',
          background: '#333'
        }}
      >
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' as const }}>
          <button
            onClick={() => onAddObject('box')}
            style={{
              flex: 1,
              padding: '6px',
              background: '#4444ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            Box
          </button>
          <button
            onClick={() => onAddObject('sphere')}
            style={{
              flex: 1,
              padding: '6px',
              background: '#44aa44',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            Sphere
          </button>
        </div>
      </div>
    </div>
  );
}
