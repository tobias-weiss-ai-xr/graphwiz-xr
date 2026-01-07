import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export interface PortalProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  targetRoomId: string;
  targetPosition?: [number, number, number];
  color?: string;
  label?: string;
  onTeleport: (roomId: string, position: [number, number, number]) => void;
}

export function Portal({
  position,
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  targetRoomId,
  targetPosition = [0, 0, 0],
  color = '#6366f1',
  label,
  onTeleport
}: PortalProps) {
  const portalRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [time, setTime] = useState(0);

  // Animate portal effect
  useFrame((_, delta) => {
    setTime((time) => time + delta);

    if (innerRingRef.current) {
      // Rotate inner ring faster
      innerRingRef.current.rotation.y += delta * 2;
      innerRingRef.current.rotation.z += delta * 1;

      // Pulse effect
      const scaleValue = 1 + Math.sin(time * 3) * 0.05;
      innerRingRef.current.scale.set(scaleValue, scaleValue, scaleValue);
    }
  });

  // Check if player is near portal for teleportation
  useFrame(() => {
    if (!portalRef.current) return;

    // Get player position from scene
    const scene = portalRef.current.parent;
    if (!scene) return;

    // Find camera in scene
    const camera = scene.children.find((child) => child.type === 'PerspectiveCamera');
    if (!camera) return;

    const playerPos = (camera as any).position;
    const portalPos = new THREE.Vector3(...position);

    // Calculate distance to portal
    const distance = playerPos.distanceTo(portalPos);

    // Teleport if player is very close to portal
    if (distance < 0.5 && !isHovered) {
      setIsHovered(true);

      // Trigger teleport after a short delay
      setTimeout(() => {
        console.log(`[Portal] Teleporting to room: ${targetRoomId}`);
        onTeleport(targetRoomId, targetPosition);
        setIsHovered(false);
      }, 500);
    }

    // Reset hover state if player moves away
    if (distance > 1.0 && isHovered) {
      setIsHovered(false);
    }
  });

  return (
    <group ref={portalRef} position={position} rotation={rotation} scale={scale}>
      {/* Outer Ring */}
      <mesh castShadow>
        <torusGeometry args={[1.2, 0.1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 0.5 : 0.2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Inner Ring - Animated */}
      <mesh ref={innerRingRef} castShadow>
        <torusGeometry args={[0.9, 0.05, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Portal Surface - Swirling Effect */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Portal Particles */}
      <group>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 1.0,
                Math.sin(time * 2 + i) * 0.2,
                Math.sin(angle) * 1.0
              ]}
            >
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.8 - Math.abs(Math.sin(time * 2 + i)) * 0.4}
              />
            </mesh>
          );
        })}
      </group>

      {/* Label */}
      {label && (
        <mesh position={[0, 2.5, 0]}>
          <planeGeometry args={[1.5, 0.4]} />
          <meshBasicMaterial color="rgba(0, 0, 0, 0.8)" transparent side={THREE.DoubleSide} />
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {label}
          </Text>
        </mesh>
      )}
    </group>
  );
}
