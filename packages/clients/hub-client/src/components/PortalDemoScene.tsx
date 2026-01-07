import { useState } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Portal } from './Portal';

interface PortalDemoSceneProps {
  myClientId: string;
}

interface PortalLocation {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
}

const PORTAL_LOCATIONS: PortalLocation[] = [
  {
    id: 'lobby',
    label: '🏠 Lobby',
    position: [-8, 1, -8],
    color: '#6366f1'
  },
  {
    id: 'garden',
    label: '🌳 Garden',
    position: [8, 1, -8],
    color: '#10b981'
  },
  {
    id: 'sky',
    label: '☁️ Sky Lounge',
    position: [-8, 1, 8],
    color: '#3b82f6'
  },
  {
    id: 'beach',
    label: '🏖 Beach',
    position: [8, 1, 8],
    color: '#f59e0b'
  }
];

export function PortalDemoScene({}: PortalDemoSceneProps) {
  const [currentLocation, setCurrentLocation] = useState<string>('lobby');

  const handleTeleport = (roomId: string, position: [number, number, number]) => {
    console.log(`[PortalDemo] Teleporting to: ${roomId}`);
    setCurrentLocation(roomId);

    // Teleport player by updating their position
    // This would be done through the network in a real implementation
    const event = new CustomEvent('teleport', {
      detail: { roomId, position }
    });
    window.dispatchEvent(event);
  };

  return (
    <group>
      {/* Ground for each portal location */}
      {PORTAL_LOCATIONS.map((loc) => (
        <mesh key={loc.id} position={[loc.position[0], -0.1, loc.position[2]]} receiveShadow>
          <circleGeometry args={[3, 32]} />
          <meshStandardMaterial color={loc.color} transparent opacity={0.2} />
        </mesh>
      ))}

      {/* Portals */}
      {PORTAL_LOCATIONS.map((loc) => (
        <Portal
          key={loc.id}
          position={loc.position}
          targetRoomId={loc.id}
          targetPosition={loc.position}
          color={loc.color}
          label={loc.label}
          onTeleport={handleTeleport}
        />
      ))}

      {/* Decorative elements for each location */}
      {PORTAL_LOCATIONS.map((loc) => {
        const isCurrent = loc.id === currentLocation;
        return (
          <group key={loc.id} position={loc.position}>
            {/* Floating platform indicator */}
            <mesh position={[0, -0.5, 0]} receiveShadow>
              <cylinderGeometry args={[2, 2.5, 0.2, 32]} />
              <meshStandardMaterial
                color={isCurrent ? loc.color : '#4a5568'}
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>

            {/* Glow effect for current location */}
            {isCurrent && (
              <mesh position={[0, 0.1, 0]}>
                <ringGeometry args={[2.5, 2.6, 32]} />
                <meshBasicMaterial
                  color={loc.color}
                  transparent
                  opacity={0.5}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Small floating orbs */}
            {Array.from({ length: 4 }).map((_, i) => {
              const angle = (i / 4) * Math.PI * 2;
              return (
                <mesh
                  key={i}
                  position={[
                    Math.cos(angle) * 3,
                    2 + Math.sin(Date.now() / 1000 + i) * 0.5,
                    Math.sin(angle) * 3
                  ]}
                >
                  <sphereGeometry args={[0.1, 16, 16]} />
                  <meshStandardMaterial
                    color={loc.color}
                    emissive={loc.color}
                    emissiveIntensity={0.5}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* Center Info */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[1, 0.5, 1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <Text
        position={[0, 2.3, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        Portal Hub
      </Text>
    </group>
  );
}
