/**
 * Player Avatar Component
 * 
 * Simple visible representation of the player in the scene
 */

import { Text } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';

export interface PlayerAvatarProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  displayName?: string;
  color?: string;
}

function PlayerAvatar({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  displayName = 'Player',
  color = '#4CAF50'
}: PlayerAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Smooth rotation to face direction
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotation[1];
    }
  }, [rotation]);

  // Floating animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.position.y = position[1] + Math.sin(time) * 0.1;
    }
  });

  // Simple body parts
  const mainColor = color;
  const accentColor = '#2196F3';
  const scale = hovered ? 1.1 : 1.0;

  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Head */}
      <mesh 
        position={[0, 0.85, 0]} 
        castShadow
        scale={[scale, scale, scale]}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={accentColor} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.06, 0.87, 0.13]} castShadow scale={[0.7, 0.7, 0.7]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.06, 0.87, 0.13]} castShadow scale={[0.7, 0.7, 0.7]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Body */}
      <mesh 
        position={[0, 0.5, 0]} 
        castShadow
        scale={[scale, scale, scale]}
      >
        <cylinderGeometry args={[0.12, 0.12, 0.4, 16]} />
        <meshStandardMaterial color={mainColor} />
      </mesh>

      {/* Left Arm */}
      <mesh 
        position={[-0.18, 0.55, 0]} 
        rotation={[0, 0, 0.2]}
        castShadow
        scale={[scale, scale, scale]}
      >
        <cylinderGeometry args={[0.04, 0.04, 0.35, 16]} />
        <meshStandardMaterial color={mainColor} />
      </mesh>

      {/* Right Arm */}
      <mesh 
        position={[0.18, 0.55, 0]} 
        rotation={[0, 0, -0.2]}
        castShadow
        scale={[scale, scale, scale]}
      >
        <cylinderGeometry args={[0.04, 0.04, 0.35, 16]} />
        <meshStandardMaterial color={mainColor} />
      </mesh>

      {/* Left Leg */}
      <mesh 
        position={[-0.07, 0.15, 0]} 
        castShadow
        scale={[scale, scale, scale]}
      >
        <cylinderGeometry args={[0.06, 0.06, 0.35, 16]} />
        <meshStandardMaterial color={accentColor} />
      </mesh>

      {/* Right Leg */}
      <mesh 
        position={[0.07, 0.15, 0]} 
        castShadow
        scale={[scale, scale, scale]}
      >
        <cylinderGeometry args={[0.06, 0.06, 0.35, 16]} />
        <meshStandardMaterial color={accentColor} />
      </mesh>

      {/* Name Tag */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.18}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#000000"
      >
        {displayName}
        <meshStandardMaterial />
      </Text>

      {/* Hover indicator */}
      {hovered && (
        <mesh position={[0, 0, -0.05]}>
          <circleGeometry args={[0.25, 32]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

export { PlayerAvatar };
