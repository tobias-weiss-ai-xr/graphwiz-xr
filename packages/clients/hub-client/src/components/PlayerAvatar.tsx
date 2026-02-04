/**
 * PlayerAvatar Component
 *
 * Renders a player avatar with name tag.
 */

import { Text } from '@react-three/drei';
import { useRef } from 'react';
import type { Group } from 'three';

interface PlayerAvatarProps {
  position: [number, number, number];
  rotation: [number, number, number];
  displayName?: string;
  color?: string;
  isLocalPlayer?: boolean;
}

export function PlayerAvatar({
  position,
  rotation,
  displayName,
  color = '#4CAF50',
  isLocalPlayer = false,
}: PlayerAvatarProps) {
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FFCC80" />
      </mesh>

      {/* Name tag */}
      {displayName && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.2}
          color={isLocalPlayer ? '#00FF00' : 'white'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {isLocalPlayer ? `${displayName} (You)` : displayName}
        </Text>
      )}
    </group>
  );
}
