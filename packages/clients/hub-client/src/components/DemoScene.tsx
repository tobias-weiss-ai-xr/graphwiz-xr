/**
 * Demo Scene Component
 * 
 * A simple demo scene with interactive elements for testing and showcasing
 * features like chat, emoji, and basic interactions.
 */

import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, useCursor } from '@react-three/drei';
import { PlayerAvatar } from './PlayerAvatar';

export interface DemoSceneProps {
  myClientId?: string;
  displayName?: string;
  isMultiplayer?: boolean;
}

function InteractiveBox({ 
  position, 
  color, 
  label 
}: { 
  position: [number, number, number];
  color: string;
  label: string;
}) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const [clicked, setClicked] = useState(false);

  return (
    <group position={position}>
      <mesh
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setClicked(!clicked)}
        castShadow
      >
        <boxGeometry args={[clicked ? [0.8, 0.8, 0.8] : [1, 1, 1], 1, 1]} />
        <meshStandardMaterial 
          color={clicked ? '#FF5722' : color}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      <Text
        position={[0, -1.2, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {label}
        <meshStandardMaterial />
      </Text>

      {/* Glow effect when hovered */}
      {hovered && (
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[1.2, 1.2, 0.1]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

function InteractiveSphere({ 
  position, 
  color, 
  label 
}: { 
  position: [number, number, number];
  color: string;
  label: string;
}) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const [scale, setScale] = useState(1);

  return (
    <group position={position}>
      <mesh
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setScale(scale === 1 ? 1.5 : 1)}
        castShadow
      >
        <sphereGeometry args={[scale * 0.5, 32, 32]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      <Text
        position={[0, -1.2, 0]}
        fontSize={0.18}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {label}
        <meshStandardMaterial />
      </Text>
    </group>
  );
}

// Lighting setup
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#ffffff" />
    </>
  );
}

// Floor with grid
function SceneFloor() {
  return (
    <group>
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -1, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50, 32, 32]} />
        <meshStandardMaterial 
          color="#2d2d2d"
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
      <gridHelper args={[50, 50, '#4a4a4a', '#3d3d3d']} position={[0, -0.99, 0]} />
    </group>
  );
}

export function DemoScene({ 
  myClientId, 
  displayName = 'Player',
  isMultiplayer = false 
}: DemoSceneProps) {
  return (
    <Canvas 
      shadows
      camera={{ position: [5, 5, 8], fov: 60 }}
      gl={{ antialias: true }}
    >
      <SceneLighting />
      <SceneFloor />

      {/* Player Avatar */}
      <PlayerAvatar 
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        displayName={displayName}
        color="#4CAF50"
      />

      {/* Interactive Elements */}
      <InteractiveBox 
        position={[3, 0, -2]} 
        color="#2196F3" 
        label="Interactive Box"
      />
      <InteractiveBox 
        position={[5, 0, -2]} 
        color="#FF9800" 
        label="Orange Box"
      />
      <InteractiveBox 
        position={[3, 0, -4.5]} 
        color="#9C27B0" 
        label="Purple Box"
      />

      <InteractiveSphere 
        position={[-2, 0, -3]} 
        color="#E91E63" 
        label="Pink Sphere"
      />
      <InteractiveSphere 
        position={[0, 0, -5]} 
        color="#00BCD4" 
        label="Cyan Sphere"
      />

      {/* Info text */}
      <group position={[0, 0, 0]} visible={false}>
        <Text
          position={[0, 10, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          GraphWiz-XR Demo Scene
          <meshBasicMaterial />
        </Text>
      </group>

      <OrbitControls makeDefault />
    </Canvas>
  );
}
