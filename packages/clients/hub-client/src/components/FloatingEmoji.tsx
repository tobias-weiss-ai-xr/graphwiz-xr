import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface FloatingEmojiProps {
  emoji: string;
  position: [number, number, number];
  onComplete?: () => void;
}

export function FloatingEmoji({ emoji, position, onComplete }: FloatingEmojiProps) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now());
  const duration = 3000; // 3 seconds

  useFrame(() => {
    if (!groupRef.current) return;

    const elapsed = Date.now() - startTime.current;
    const progress = elapsed / duration;

    if (progress >= 1) {
      onComplete?.();
      return;
    }

    // Float upward
    groupRef.current.position.y = position[1] + progress * 2;

    // Slight wobble
    groupRef.current.position.x = position[0] + Math.sin(progress * Math.PI * 4) * 0.1;
    groupRef.current.position.z = position[2] + Math.cos(progress * Math.PI * 4) * 0.1;

    // Rotate
    groupRef.current.rotation.y = progress * Math.PI * 2;
  });

  // Auto-remove after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <group ref={groupRef} position={position}>
      {/* Glow effect */}
      <pointLight
        color="#ffffff"
        intensity={0.5}
        distance={2}
      />

      {/* Emoji text */}
      <Text
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {emoji}
      </Text>

      {/* Particle effect (simplified as small spheres) */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 0.3;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              0,
            ]}
          >
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}
