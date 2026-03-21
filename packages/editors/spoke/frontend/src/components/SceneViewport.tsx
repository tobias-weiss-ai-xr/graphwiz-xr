/**
 * Scene Viewport Component
 *
 * Three.js canvas for 3D scene editing
 */
import { Canvas, useFrame } from '@react-three/fiber';
import { useState, useRef } from 'react';
import * as THREE from 'three';

interface SceneObject {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  type: 'box' | 'sphere' | 'plane';
}

interface SceneViewportProps {
  objects: SceneObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  transformMode: 'translate' | 'rotate' | 'scale';
}

function Gizmo({
  mode,
  onSelect
}: {
  mode: 'translate' | 'rotate' | 'scale';
  onSelect: (m: typeof mode) => void;
}) {
  const [hovered, setHover] = useState<string | null>(null);

  const colors = {
    default: '#4444ff',
    hover: '#00ff00',
    translate: '#ff0000',
    rotate: '#00ff00',
    scale: '#0000ff'
  };

  const isActive = mode === hovered;

  return (
    <group position={[0, 0.5, 0]}>
      {/* Simple visual gizmo representation */}
      <mesh
        position={[isActive && mode === 'translate' ? 0.5 : 0, 0, 0]}
        onPointerOver={() => setHover('translate')}
        onPointerOut={() => setHover(null)}
        onClick={() => onSelect('translate')}
      >
        <boxGeometry args={[isActive ? 0.3 : 0.2, 0.05, 0.05]} />
        <meshStandardMaterial
          color={isActive || hovered === 'translate' ? colors.translate : colors.default}
        />
      </mesh>
      <mesh
        position={[0, isActive && mode === 'translate' ? 0.5 : 0, 0]}
        onPointerOver={() => setHover('translate')}
        onPointerOut={() => setHover(null)}
        onClick={() => onSelect('translate')}
      >
        <boxGeometry args={[0.05, isActive ? 0.3 : 0.2, 0.05]} />
        <meshStandardMaterial
          color={isActive || hovered === 'translate' ? colors.translate : colors.default}
        />
      </mesh>

      {/* Rotate ring */}
      <mesh
        rotation={[0, Math.PI / 4, 0]}
        onPointerOver={() => setHover('rotate')}
        onPointerOut={() => setHover(null)}
        onClick={() => onSelect('rotate')}
      >
        <torusGeometry args={[0.4, 0.02, 8, 16]} />
        <meshStandardMaterial
          color={isActive || hovered === 'rotate' ? colors.rotate : colors.default}
        />
      </mesh>

      {/* Scale ring */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={() => setHover('scale')}
        onPointerOut={() => setHover(null)}
        onClick={() => onSelect('scale')}
      >
        <torusGeometry args={[0.5, 0.02, 8, 16]} />
        <meshStandardMaterial
          color={isActive || hovered === 'scale' ? colors.scale : colors.default}
        />
      </mesh>
    </group>
  );
}

function SceneObject3D({
  object,
  selected,
  onSelect,
  gizmoEnabled
}: {
  object: SceneObject;
  selected: boolean;
  onSelect: (id: string) => void;
  gizmoEnabled: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current || !gizmoEnabled) return;

    // Simple interaction: rotate on hover
    // Full implementation would use transform controls
  });

  return (
    <group
      ref={group}
      position={[object.position.x, object.position.y, object.position.z]}
      rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
      scale={[object.scale.x, object.scale.y, object.scale.z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(object.id);
      }}
    >
      {/* Main object */}
      {object.type === 'box' && (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={selected ? '#00ff00' : '#4444ff'} />
        </mesh>
      )}
      {object.type === 'sphere' && (
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color={selected ? '#00ff00' : '#44ff44'} />
        </mesh>
      )}
      {object.type === 'plane' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial color={selected ? '#00ff00' : '#4444ff'} />
        </mesh>
      )}

      {/* Selection outline */}
      {selected && (
        <mesh>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshBasicMaterial color="#00ff00" wireframe />
        </mesh>
      )}

      {/* Transform gizmo */}
      {gizmoEnabled && selected && <Gizmo mode="translate" onSelect={() => {}} />}

      {/* Object label */}
      {/* <Html position={[0, 0.8, 0]}>
        <div style={{ color: 'white', fontSize: '10px', background: 'rgba(0,0,0,0.7)', padding: '2px 4px', borderRadius: '2px' }}>
          {object.name}
        </div>
      </Html> */}
    </group>
  );
}

export function SceneViewport({
  objects,
  selectedObjectId,
  onSelectObject,
  transformMode
}: SceneViewportProps) {
  const [mode, setMode] = useState(transformMode);

  return (
    <div style={{ flex: 1, background: '#1a1a1a', position: 'relative', overflow: 'hidden' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        {/* Environment */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <gridHelper args={[20, 20, 0x444444, 0x222222]} />
        <axesHelper args={[5]} />

        {/* Render objects */}
        {objects.map((object) => (
          <SceneObject3D
            key={object.id}
            object={object}
            selected={object.id === selectedObjectId}
            onSelect={onSelectObject}
            gizmoEnabled={!!selectedObjectId}
          />
        ))}

        {/* Transform gizmo at scene center if no object selected */}
        {!selectedObjectId && <Gizmo mode="translate" onSelect={setMode} />}
      </Canvas>

      {/* Mode indicator overlay */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px'
        }}
      >
        Mode: {mode.toUpperCase()}
      </div>
    </div>
  );
}
