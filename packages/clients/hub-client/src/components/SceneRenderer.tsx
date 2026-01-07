/**
 * SceneRenderer Component
 *
 * Renders the entire ECS world as a 3D scene.
 */

import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import type { World } from '../ecs/world';

import { EntityRenderer } from './EntityRenderer';

interface SceneRendererProps {
  world: World;
  camera?: {
    position: [number, number, number];
    fov?: number;
  };
  controls?: boolean;
  environment?: boolean;
  shadows?: boolean;
}

export function SceneRenderer({
  world,
  camera = { position: [10, 10, 10], fov: 75 },
  controls = true,
  environment = true,
  shadows = true,
}: SceneRendererProps) {
  const entities = world.getEntities();

  return (
    <Canvas
      shadows={shadows}
      camera={{ position: camera.position, fov: camera.fov }}
      gl={{ antialias: true, alpha: true }}
    >
      {environment && <Environment preset="city" />}
      {shadows && (
        <>
          <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={20} blur={2} far={4} />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
        </>
      )}

      <PerspectiveCamera makeDefault position={camera.position} fov={camera.fov} />

      {controls && <OrbitControls makeDefault />}

      {/* Render all entities */}
      {entities.map((entity) => (
        <EntityRenderer key={entity.id} entity={entity} />
      ))}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Grid helper */}
      <gridHelper args={[50, 50, 0x888888, 0xcccccc]} position={[0, 0.01, 0]} />
    </Canvas>
  );
}
