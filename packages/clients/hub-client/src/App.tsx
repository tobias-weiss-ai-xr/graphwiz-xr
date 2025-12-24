import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { useState, useCallback } from 'react';

interface Entity {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

function App() {
  const [entities, setEntities] = useState<Map<string, Entity>>(new Map());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addEntity = useCallback(() => {
    const id = `entity-${Date.now()}`;
    const newEntity: Entity = {
      id,
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    setEntities((prev) => new Map(prev).set(id, newEntity));
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.7)',
        padding: 16,
        borderRadius: 8,
        color: 'white',
        fontFamily: 'sans-serif',
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 18 }}>
          GraphWiz-XR Hub Client
        </h1>
        <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>
          Entities: {entities.size}
        </p>
        <button
          onClick={addEntity}
          style={{
            marginTop: 12,
            padding: '8px 16px',
            background: '#4CAF50',
            border: 'none',
            borderRadius: 4,
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Add Entity
        </button>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={60} />
        <OrbitControls
          makeDefault
          minDistance={2}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {/* Ground Grid */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />

        {/* Ground Plane */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

        {/* Entities */}
        {Array.from(entities.values()).map((entity) => (
          <mesh
            key={entity.id}
            position={entity.position}
            rotation={entity.rotation}
            scale={entity.scale}
            castShadow
            receiveShadow
            onClick={() => setSelectedId(entity.id)}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={selectedId === entity.id ? '#4CAF50' : '#2196F3'}
              roughness={0.5}
              metalness={0.5}
            />
          </mesh>
        ))}
      </Canvas>
    </div>
  );
}

export default App;
