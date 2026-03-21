/**
 * Property Inspector Panel
 *
 * Edit properties of selected object
 */
import type { SceneObject } from '../types/SceneObject';
interface PropertyEditorProps {
  object: SceneObject | null;
  onObjectUpdated: (id: string, updates: Partial<SceneObject>) => void;
  onObjectDeleted: (id: string) => void;
}

export function PropertyEditor({ object, onObjectUpdated, onObjectDeleted }: PropertyEditorProps) {
  if (!object) {
    return (
      <div
        style={{
          width: '280px',
          background: '#2d2d2d',
          borderLeft: '1px solid #444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          fontSize: '14px'
        }}
      >
        Select an object to edit properties
      </div>
    );
  }

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onObjectUpdated(object.id, {
        position: { ...object.position, [axis]: num }
      });
    }
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onObjectUpdated(object.id, {
        rotation: { ...object.rotation, [axis]: num }
      });
    }
  };

  // handleScaleChange declared but unused
  return (
    <div
      style={{
        width: '280px',
        background: '#2d2d2d',
        borderLeft: '1px solid #444',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
        color: '#eee'
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
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Properties</h2>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' as const, padding: '12px' }}>
        {/* Name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
            Name
          </label>
          <input
            type="text"
            value={object.name}
            onChange={(e) => onObjectUpdated(object.id, { name: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 8px',
              background: '#3a3a3a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#eee',
              fontSize: '13px'
            }}
          />
        </div>

        {/* Type */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
            Type
          </label>
          <select
            value={object.type}
            onChange={(e) => onObjectUpdated(object.id, { type: e.target.value as SceneObject['type'] })}
            style={{
              width: '100%',
              padding: '6px 8px',
              background: '#3a3a3a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#eee',
              fontSize: '13px'
            }}
          >
            <option value="box">Box</option>
            <option value="sphere">Sphere</option>
            <option value="plane">Plane</option>
          </select>
        </div>

        {/* Position */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}
          >
            Position
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
            {['x', 'y', 'z'].map((axis) => (
              <div key={axis}>
                <label
                  style={{ display: 'block', fontSize: '10px', color: '#888', marginBottom: '2px' }}
                >
                  {axis.toUpperCase()}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={object.position[axis as 'x' | 'y' | 'z']}
                  onChange={(e) => handlePositionChange(axis as 'x' | 'y' | 'z', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    background: '#3a3a3a',
                    border: '1px solid #444',
                    borderRadius: '3px',
                    color: '#eee',
                    fontSize: '11px'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Rotation */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}
          >
            Rotation (rad)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
            {['x', 'y', 'z'].map((axis) => (
              <div key={axis}>
                <label
                  style={{ display: 'block', fontSize: '10px', color: '#888', marginBottom: '2px' }}
                >
                  {axis.toUpperCase()}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={object.rotation[axis as 'x' | 'y' | 'z']}
                  onChange={(e) => handleRotationChange(axis as 'x' | 'y' | 'z', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    background: '#3a3a3a',
                    border: '1px solid #444',
                    borderRadius: '3px',
                    color: '#eee',
                    fontSize: '11px'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}
          >
            Scale
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
            {['x', 'y', 'z'].map((axis) => (
              <div key={axis}>
                <label
                  style={{ display: 'block', fontSize: '10px', color: '#888', marginBottom: '2px' }}
                >
                  {axis.toUpperCase()}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={object.scale[axis as 'x' | 'y' | 'z']}
                  onChange={(e) => {
                    const num = parseFloat(e.target.value);
                    if (!isNaN(num)) {
                      onObjectUpdated(object.id, {
                        scale: { ...object.scale, [axis]: num }
                      });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    background: '#3a3a3a',
                    border: '1px solid #444',
                    borderRadius: '3px',
                    color: '#eee',
                    fontSize: '11px'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid #444',
          background: '#333'
        }}
      >
        <button
          onClick={() => onObjectDeleted(object.id)}
          style={{
            width: '100%',
            padding: '8px',
            background: '#aa4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500
          }}
        >
          Delete Object
        </button>
      </div>
    </div>
  );
}
