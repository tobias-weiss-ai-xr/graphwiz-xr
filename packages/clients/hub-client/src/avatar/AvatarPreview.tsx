/**
 * 3D Avatar Preview Component
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Sphere, Box, Cone } from '@react-three/drei';
import * as THREE from 'three';
import type { AvatarConfig } from './api';

interface AvatarPreviewProps {
  config: AvatarConfig;
  animate?: boolean;
}

export function AvatarPreview({ config, animate = true }: AvatarPreviewProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle rotation animation
  useFrame((state) => {
    if (animate && groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  // Parse hex colors
  const primaryColor = config.primary_color;
  const secondaryColor = config.secondary_color;

  // Scale height (base is 1.7m)
  const scale = config.height / 1.7;

  return (
    <group ref={groupRef} scale={scale}>
      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <shadowMaterial opacity={0.3} />
      </mesh>

      {config.body_type === 'human' && <HumanAvatar primaryColor={primaryColor} secondaryColor={secondaryColor} />}
      {config.body_type === 'robot' && <RobotAvatar primaryColor={primaryColor} secondaryColor={secondaryColor} />}
      {config.body_type === 'alien' && <AlienAvatar primaryColor={primaryColor} secondaryColor={secondaryColor} />}
      {config.body_type === 'animal' && <AnimalAvatar primaryColor={primaryColor} secondaryColor={secondaryColor} />}
      {config.body_type === 'abstract' && <AbstractAvatar primaryColor={primaryColor} secondaryColor={secondaryColor} />}
    </group>
  );
}

// Human Avatar
function HumanAvatar({ primaryColor, secondaryColor }: { primaryColor: string; secondaryColor: string }) {
  return (
    <group>
      {/* Head */}
      <Sphere position={[0, 1.6, 0]} args={[0.15]} castShadow>
        <meshStandardMaterial color="#FFCC80" />
      </Sphere>

      {/* Body */}
      <Cylinder position={[0, 1.2, 0]} args={[0.12, 0.15, 0.6, 16]} castShadow>
        <meshStandardMaterial color={primaryColor} />
      </Cylinder>

      {/* Arms */}
      <Box position={[-0.2, 1.2, 0]} args={[0.08, 0.5, 0.08]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Box>
      <Box position={[0.2, 1.2, 0]} args={[0.08, 0.5, 0.08]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Box>

      {/* Legs */}
      <Box position={[-0.06, 0.6, 0]} args={[0.1, 0.6, 0.1]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Box>
      <Box position={[0.06, 0.6, 0]} args={[0.1, 0.6, 0.1]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Box>

      {/* Eyes */}
      <Sphere position={[-0.05, 1.63, 0.12]} args={[0.02]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere position={[0.05, 1.63, 0.12]} args={[0.02]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
    </group>
  );
}

// Robot Avatar
function RobotAvatar({ primaryColor, secondaryColor }: { primaryColor: string; secondaryColor: string }) {
  return (
    <group>
      {/* Head */}
      <Box position={[0, 1.6, 0]} args={[0.25, 0.25, 0.25]} castShadow>
        <meshStandardMaterial color={secondaryColor} metalness={0.8} roughness={0.2} />
      </Box>

      {/* Antenna */}
      <Cylinder position={[0, 1.8, 0]} args={[0.02, 0.02, 0.15]} castShadow>
        <meshStandardMaterial color={primaryColor} />
      </Cylinder>
      <Sphere position={[0, 1.88, 0]} args={[0.04]}>
        <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.5} />
      </Sphere>

      {/* Body */}
      <Box position={[0, 1.1, 0]} args={[0.35, 0.5, 0.25]} castShadow>
        <meshStandardMaterial color={primaryColor} metalness={0.6} roughness={0.3} />
      </Box>

      {/* Arms */}
      <Box position={[-0.25, 1.1, 0]} args={[0.08, 0.5, 0.08]} castShadow>
        <meshStandardMaterial color={secondaryColor} metalness={0.7} />
      </Box>
      <Box position={[0.25, 1.1, 0]} args={[0.08, 0.5, 0.08]} castShadow>
        <meshStandardMaterial color={secondaryColor} metalness={0.7} />
      </Box>

      {/* Legs */}
      <Box position={[-0.08, 0.5, 0]} args={[0.12, 0.5, 0.12]} castShadow>
        <meshStandardMaterial color={secondaryColor} metalness={0.7} />
      </Box>
      <Box position={[0.08, 0.5, 0]} args={[0.12, 0.5, 0.12]} castShadow>
        <meshStandardMaterial color={secondaryColor} metalness={0.7} />
      </Box>

      {/* Eyes (LEDs) */}
      <Sphere position={[-0.08, 1.63, 0.13]} args={[0.03]}>
        <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.8} />
      </Sphere>
      <Sphere position={[0.08, 1.63, 0.13]} args={[0.03]}>
        <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.8} />
      </Sphere>
    </group>
  );
}

// Alien Avatar
function AlienAvatar({ primaryColor, secondaryColor }: { primaryColor: string; secondaryColor: string }) {
  return (
    <group>
      {/* Head (large) */}
      <Sphere position={[0, 1.65, 0]} args={[0.2, 16, 16]} castShadow scale={[1, 1.3, 1]}>
        <meshStandardMaterial color={secondaryColor} />
      </Sphere>

      {/* Body (slender) */}
      <Cylinder position={[0, 1.1, 0]} args={[0.08, 0.12, 0.5, 16]} castShadow>
        <meshStandardMaterial color={primaryColor} />
      </Cylinder>

      {/* Arms (long) */}
      <Box position={[-0.18, 1.15, 0]} args={[0.06, 0.6, 0.06]} rotation={[0, 0, 0.2]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Box>
      <Box position={[0.18, 1.15, 0]} args={[0.06, 0.6, 0.06]} rotation={[0, 0, -0.2]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Box>

      {/* Legs (thin) */}
      <Box position={[-0.05, 0.55, 0]} args={[0.08, 0.55, 0.08]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Box>
      <Box position={[0.05, 0.55, 0]} args={[0.08, 0.55, 0.08]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Box>

      {/* Large black eyes */}
      <Sphere position={[-0.08, 1.68, 0.15]} args={[0.05, 16, 16]} scale={[1, 1.5, 1]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere position={[0.08, 1.68, 0.15]} args={[0.05, 16, 16]} scale={[1, 1.5, 1]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
    </group>
  );
}

// Animal Avatar (bipedal creature)
function AnimalAvatar({ primaryColor, secondaryColor }: { primaryColor: string; secondaryColor: string }) {
  return (
    <group>
      {/* Head */}
      <Sphere position={[0, 1.4, 0]} args={[0.18]} castShadow>
        <meshStandardMaterial color={primaryColor} />
      </Sphere>

      {/* Ears */}
      <Cone position={[-0.12, 1.55, 0]} args={[0.05, 0.15, 4]} rotation={[0, 0, -0.3]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Cone>
      <Cone position={[0.12, 1.55, 0]} args={[0.05, 0.15, 4]} rotation={[0, 0, 0.3]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Cone>

      {/* Snout */}
      <Sphere position={[0, 1.32, 0.12]} args={[0.1]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Sphere>

      {/* Body */}
      <Sphere position={[0, 0.9, 0]} args={[0.2, 16, 16]} castShadow scale={[1, 1.2, 0.9]}>
        <meshStandardMaterial color={primaryColor} />
      </Sphere>

      {/* Arms (paws) */}
      <Sphere position={[-0.2, 0.9, 0]} args={[0.08]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Sphere>
      <Sphere position={[0.2, 0.9, 0]} args={[0.08]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Sphere>

      {/* Legs */}
      <Cylinder position={[-0.08, 0.4, 0]} args={[0.08, 0.35, 8]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Cylinder>
      <Cylinder position={[0.08, 0.4, 0]} args={[0.08, 0.35, 8]} castShadow>
        <meshStandardMaterial color={secondaryColor} />
      </Cylinder>

      {/* Tail */}
      <Cylinder position={[0, 0.7, -0.15]} args={[0.03, 0.06, 0.3]} rotation={[0.5, 0, 0]} castShadow>
        <meshStandardMaterial color={primaryColor} />
      </Cylinder>

      {/* Eyes */}
      <Sphere position={[-0.08, 1.43, 0.12]} args={[0.03]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere position={[0.08, 1.43, 0.12]} args={[0.03]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
    </group>
  );
}

// Abstract Avatar (geometric shapes)
function AbstractAvatar({ primaryColor, secondaryColor }: { primaryColor: string; secondaryColor: string }) {
  return (
    <group>
      {/* Central core */}
      <Box position={[0, 1.2, 0]} args={[0.3, 0.4, 0.3]} castShadow rotation={[0, 0, 0]}>
        <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.2} />
      </Box>

      {/* Orbiting spheres */}
      <Sphere position={[0.2, 1.4, 0]} args={[0.08]} castShadow>
        <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={0.3} />
      </Sphere>
      <Sphere position={[-0.2, 1.4, 0]} args={[0.08]} castShadow>
        <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={0.3} />
      </Sphere>
      <Sphere position={[0, 1.4, 0.2]} args={[0.08]} castShadow>
        <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={0.3} />
      </Sphere>
      <Sphere position={[0, 1.4, -0.2]} args={[0.08]} castShadow>
        <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={0.3} />
      </Sphere>

      {/* Lower base */}
      <Cylinder position={[0, 0.7, 0]} args={[0.15, 0.2, 0.3, 6]} castShadow>
        <meshStandardMaterial color={secondaryColor} metalness={0.5} />
      </Cylinder>

      {/* Floating elements */}
      <Box position={[0, 1.7, 0]} args={[0.15, 0.15, 0.15]} castShadow>
        <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.4} />
      </Box>
    </group>
  );
}
