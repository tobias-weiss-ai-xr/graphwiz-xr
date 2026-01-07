/**
 * NetworkedAvatar Component
 *
 * Renders other users' avatars in the 3D scene based on their networked avatar configuration.
 * Supports all 5 body types with custom colors and heights.
 */

import { Text } from '@react-three/drei';
import { useRef, useEffect } from 'react';

export interface NetworkedAvatarConfig {
  body_type: 'human' | 'robot' | 'alien' | 'animal' | 'abstract';
  primary_color: string;
  secondary_color: string;
  height: number;
  custom_model_url?: string;
}

interface NetworkedAvatarProps {
  position: [number, number, number];
  rotation: [number, number, number];
  displayName: string;
  avatarConfig: NetworkedAvatarConfig;
}

/**
 * Human Avatar Component
 */
function HumanAvatar({
  primaryColor,
  secondaryColor,
  scale,
}: {
  primaryColor: string;
  secondaryColor: string;
  scale: number;
}) {
  return (
    <group scale={[scale, scale, scale]}>
      {/* Head */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 16]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>

      {/* Left Arm */}
      <mesh position={[-0.2, 0.4, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>

      {/* Right Arm */}
      <mesh position={[0.2, 0.4, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.08, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.35, 8]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.08, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.35, 8]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
    </group>
  );
}

/**
 * Robot Avatar Component
 */
function RobotAvatar({
  primaryColor,
  secondaryColor,
  scale,
}: {
  primaryColor: string;
  secondaryColor: string;
  scale: number;
}) {
  return (
    <group scale={[scale, scale, scale]}>
      {/* Blocky Head */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={secondaryColor} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.08, 0.72, 0.15]} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.08, 0.72, 0.15]} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={0.5} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.35, 0.45, 0.25]} />
        <meshStandardMaterial color={primaryColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Antenna */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
      <mesh position={[0, 0.96, 0]} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.8} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.22, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.35, 8]} />
        <meshStandardMaterial color={secondaryColor} metalness={0.7} />
      </mesh>
      <mesh position={[0.22, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.35, 8]} />
        <meshStandardMaterial color={secondaryColor} metalness={0.7} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.1, 0.05, 0]} castShadow>
        <boxGeometry args={[0.12, 0.35, 0.12]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>
      <mesh position={[0.1, 0.05, 0]} castShadow>
        <boxGeometry args={[0.12, 0.35, 0.12]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>
    </group>
  );
}

/**
 * Alien Avatar Component
 */
function AlienAvatar({
  primaryColor,
  secondaryColor,
  scale,
}: {
  primaryColor: string;
  secondaryColor: string;
  scale: number;
}) {
  return (
    <group scale={[scale, scale, scale]}>
      {/* Large Head */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>

      {/* Big Eyes */}
      <mesh position={[-0.1, 0.88, 0.2]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.1, 0.88, 0.2]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Small Body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.08, 0.35, 16]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>

      {/* Thin Arms */}
      <mesh position={[-0.15, 0.35, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
      <mesh position={[0.15, 0.35, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>

      {/* Thin Legs */}
      <mesh position={[-0.05, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>
      <mesh position={[0.05, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>
    </group>
  );
}

/**
 * Animal Avatar Component
 */
function AnimalAvatar({
  primaryColor,
  secondaryColor,
  scale,
}: {
  primaryColor: string;
  secondaryColor: string;
  scale: number;
}) {
  return (
    <group scale={[scale, scale, scale]}>
      {/* Animal Head */}
      <mesh position={[0, 0.45, 0.15]} castShadow>
        <boxGeometry args={[0.25, 0.2, 0.3]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.1, 0.6, 0.15]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.06, 0.15, 8]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>
      <mesh position={[0.1, 0.6, 0.15]} rotation={[0, 0, 0.3]} castShadow>
        <coneGeometry args={[0.06, 0.15, 8]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>

      {/* Snout */}
      <mesh position={[0, 0.4, 0.32]} castShadow>
        <boxGeometry args={[0.15, 0.12, 0.12]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.4, 0.38]} castShadow>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.25, -0.05]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.35, 12]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.3, -0.28]} rotation={[Math.PI / 4, 0, 0]} castShadow>
        <coneGeometry args={[0.04, 0.2, 8]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.08, 0.05, 0.05]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>
      <mesh position={[0.08, 0.05, 0.05]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>
      <mesh position={[-0.08, 0.05, -0.15]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>
      <mesh position={[0.08, 0.05, -0.15]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>
    </group>
  );
}

/**
 * Abstract Avatar Component
 */
function AbstractAvatar({
  primaryColor,
  secondaryColor,
  scale,
}: {
  primaryColor: string;
  secondaryColor: string;
  scale: number;
}) {
  return (
    <group scale={[scale, scale, scale]}>
      {/* Icosahedron Body */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color={primaryColor}
          metalness={0.3}
          roughness={0.7}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner Core */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <octahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={secondaryColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Torus Ring 1 */}
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.35, 0.02, 8, 32]} />
        <meshStandardMaterial color={secondaryColor} />
      </mesh>

      {/* Torus Ring 2 */}
      <mesh position={[0, 0.45, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.38, 0.02, 8, 32]} />
        <meshStandardMaterial color={primaryColor} />
      </mesh>

      {/* Floating Orbits */}
      <group>
        <mesh position={[0.3, 0.6, 0]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[-0.3, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, 0.75, 0.2]} castShadow>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Main NetworkedAvatar Component
 */
export function NetworkedAvatar({ position, rotation, displayName, avatarConfig }: NetworkedAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Smooth rotation animation
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotation[1];
    }
  }, [rotation]);

  // Calculate scale based on height (normalize: 1.7m = scale 1.0)
  const heightScale = avatarConfig.height / 1.7;

  // Render avatar body based on type
  const renderAvatar = () => {
    const { body_type, primary_color, secondary_color } = avatarConfig;

    const props = {
      primaryColor: primary_color,
      secondaryColor: secondary_color,
      scale: heightScale,
    };

    switch (body_type) {
      case 'human':
        return <HumanAvatar {...props} />;
      case 'robot':
        return <RobotAvatar {...props} />;
      case 'alien':
        return <AlienAvatar {...props} />;
      case 'animal':
        return <AnimalAvatar {...props} />;
      case 'abstract':
        return <AbstractAvatar {...props} />;
      default:
        return <HumanAvatar {...props} />;
    }
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Avatar Model */}
      {renderAvatar()}

      {/* Name Tag */}
      <Text
        position={[0, 1.3 * heightScale, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {displayName}
      </Text>
    </group>
  );
}
