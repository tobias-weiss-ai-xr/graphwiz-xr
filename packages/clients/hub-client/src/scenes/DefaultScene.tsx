import { Environment, Float, Stars, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { Mesh, Group } from 'three';
import type { WebSocketClient } from '../network/websocket-client';

interface DefaultSceneProps {
  wsClient?: WebSocketClient | null;
  myClientId?: string;
}

interface ObjectState {
  objectId: string;
  active: boolean;
  lastUpdate: number;
  clientId: string;
}

function InteractiveLamp({
  position,
  objectId,
  isOn,
  isHovered,
  onClick,
  onHover
}: {
  position: [number, number, number];
  objectId: string;
  isOn: boolean;
  isHovered: boolean;
  onClick: (id: string) => void;
  onHover: (id: string, hovered: boolean) => void;
}) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const { camera, raycaster, pointer } = useThree();

  useFrame(() => {
    if (!meshRef.current) return;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current, true);
    const nowHovered = intersects.length > 0;

    if (isHovered !== nowHovered) {
      onHover(objectId, nowHovered);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y += isOn ? 0.02 : 0;
    }
  });

  useEffect(() => {
    const handlePointerDown = () => {
      if (meshRef.current) {
        meshRef.current.userData.isClicking = true;
        meshRef.current.userData.clickTime = Date.now();
      }
    };

    const handlePointerUp = () => {
      if (meshRef.current?.userData.isClicking) {
        const clickDuration = Date.now() - (meshRef.current.userData.clickTime || 0);
        meshRef.current.userData.isClicking = false;

        if (clickDuration < 200 && isHovered) {
          onClick(objectId);
        }
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isHovered, objectId, onClick]);

  const baseColor = '#212121';
  const shadeColor = isOn ? '#FFC107' : '#888888';

  return (
    <group position={position} ref={groupRef}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.1, 16]} />
        <meshStandardMaterial
          color={isHovered ? '#424242' : baseColor}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.6, 8]} />
        <meshStandardMaterial
          color={isHovered ? '#424242' : baseColor}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      <mesh ref={meshRef} position={[0, 1.7, 0]} castShadow scale={isHovered ? 1.05 : 1}>
        <coneGeometry args={[0.5, 0.6, 16, 1, true]} />
        <meshStandardMaterial color={shadeColor} roughness={0.8} metalness={0} side={2} />
      </mesh>

      {isOn && (
        <pointLight position={[0, 1.6, 0]} intensity={1.5} color="#FFF59D" distance={8} decay={2} />
      )}

      <Text
        position={[0, 2.3, 0]}
        fontSize={0.12}
        color={isOn ? '#FFC107' : '#888888'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {isOn ? 'ON' : 'OFF'}
      </Text>

      {isHovered && (
        <Text
          position={[0, -0.3, 0]}
          fontSize={0.1}
          color="#aaaaff"
          anchorX="center"
          anchorY="middle"
        >
          Click to toggle
        </Text>
      )}
    </group>
  );
}

function FloatingObject({
  position,
  geometry,
  color,
  rotationSpeed = 0.01
}: {
  position: [number, number, number];
  geometry: 'octahedron' | 'icosahedron' | 'tetrahedron' | 'dodecahedron';
  color: string;
  rotationSpeed?: number;
}) {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed;
      meshRef.current.rotation.y += rotationSpeed * 1.3;
    }
  });

  const GeometryComponent = {
    octahedron: <octahedronGeometry args={[0.3]} />,
    icosahedron: <icosahedronGeometry args={[0.15]} />,
    tetrahedron: <tetrahedronGeometry args={[0.2]} />,
    dodecahedron: <dodecahedronGeometry args={[0.25]} />
  }[geometry];

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.2}>
      <mesh ref={meshRef} position={position} castShadow>
        {GeometryComponent}
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
    </Float>
  );
}

function AnimatedPlant({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.05;
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.03;
    }
  });

  return (
    <group position={position} ref={groupRef}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.2, 0.6, 16]} />
        <meshStandardMaterial color="#E65100" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#43A047" roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[0.2, 0.85, 0.1]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[-0.2, 0.9, -0.1]} castShadow>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#388E3C" roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[0.1, 0.95, 0.2]} castShadow>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#388E3C" roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[-0.15, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.8} metalness={0} />
      </mesh>
    </group>
  );
}

function InteractiveBook({
  position,
  isOpen,
  isHovered,
  onClick,
  onHover
}: {
  position: [number, number, number];
  isOpen: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const { camera, raycaster, pointer } = useThree();

  useFrame(() => {
    if (!meshRef.current) return;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current, true);
    onHover(intersects.length > 0);
  });

  useEffect(() => {
    const handlePointerDown = () => {
      if (meshRef.current) {
        meshRef.current.userData.isClicking = true;
        meshRef.current.userData.clickTime = Date.now();
      }
    };

    const handlePointerUp = () => {
      if (meshRef.current?.userData.isClicking) {
        const clickDuration = Date.now() - (meshRef.current.userData.clickTime || 0);
        meshRef.current.userData.isClicking = false;

        if (clickDuration < 200 && isHovered) {
          onClick();
        }
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isHovered, onClick]);

  const coverRotation = isOpen ? -Math.PI * 0.7 : 0;

  return (
    <group position={position} ref={meshRef as any} scale={isHovered ? 1.05 : 1}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.05, 0.3]} />
        <meshStandardMaterial
          color={isHovered ? '#CE93D8' : '#9C27B0'}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0.18, 0.03, 0]} rotation={[0, 0, coverRotation]} castShadow>
        <boxGeometry args={[0.38, 0.03, 0.28]} />
        <meshStandardMaterial color="#7B1FA2" roughness={0.5} metalness={0.1} />
      </mesh>
      {isOpen && (
        <Text
          position={[0, 0.08, 0]}
          fontSize={0.03}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          GraphWiz-XR Guide
        </Text>
      )}
      {isHovered && !isOpen && (
        <Text
          position={[0, 0.1, 0]}
          fontSize={0.05}
          color="#CE93D8"
          anchorX="center"
          anchorY="middle"
        >
          Click to open
        </Text>
      )}
    </group>
  );
}

function DustParticles() {
  const particlesRef = useRef<Group>(null);
  const particleCount = 30;
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    position: [(Math.random() - 0.5) * 12, Math.random() * 3 + 0.5, (Math.random() - 0.5) * 12] as [
      number,
      number,
      number
    ],
    speed: Math.random() * 0.002 + 0.001,
    offset: Math.random() * Math.PI * 2
  }));

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const particle = particles[i];
        child.position.y =
          particle.position[1] +
          Math.sin(clock.elapsedTime * particle.speed * 100 + particle.offset) * 0.3;
        child.position.x =
          particle.position[0] + Math.sin(clock.elapsedTime * 0.2 + particle.offset) * 0.1;
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Rug({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[4, 3]} />
      <meshStandardMaterial color="#5D4037" roughness={0.9} metalness={0} />
    </mesh>
  );
}

export function DefaultScene({ wsClient, myClientId }: DefaultSceneProps = {}) {
  const [objectStates, setObjectStates] = useState<Map<string, ObjectState>>(() => {
    const initial = new Map<string, ObjectState>();
    initial.set('lamp-1', {
      objectId: 'lamp-1',
      active: true,
      lastUpdate: Date.now(),
      clientId: ''
    });
    initial.set('book-1', {
      objectId: 'book-1',
      active: false,
      lastUpdate: Date.now(),
      clientId: ''
    });
    return initial;
  });

  const [hoveredObjects, setHoveredObjects] = useState<Set<string>>(new Set());

  const handleObjectClick = (objectId: string) => {
    const state = objectStates.get(objectId);
    if (!state) return;

    const newState = {
      ...state,
      active: !state.active,
      lastUpdate: Date.now(),
      clientId: myClientId || 'local'
    };

    setObjectStates((prev) => new Map(prev).set(objectId, newState));

    if (wsClient && wsClient.connected()) {
      wsClient.sendEntityUpdate({
        entityId: objectId,
        components: {
          defaultSceneState: newState
        }
      });
    }
  };

  const handleHover = (objectId: string, hovered: boolean) => {
    setHoveredObjects((prev) => {
      const newSet = new Set(prev);
      if (hovered) {
        newSet.add(objectId);
      } else {
        newSet.delete(objectId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (!wsClient) return;

    const unsubscribe = wsClient.on(
      21,
      (message: { payload?: { components?: { defaultSceneState?: ObjectState } } }) => {
        if (message.payload?.components?.defaultSceneState) {
          const state = message.payload.components.defaultSceneState;

          setObjectStates((prev) => {
            const current = prev.get(state.objectId);
            if (!current || state.lastUpdate > current.lastUpdate) {
              return new Map(prev).set(state.objectId, state);
            }
            return prev;
          });
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [wsClient]);

  const lampState = objectStates.get('lamp-1');
  const lampIsOn = lampState?.active ?? true;

  return (
    <>
      <Environment preset="city" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <pointLight position={[2, 3, -2]} intensity={0.8} color="#FFA726" distance={10} decay={2} />
      <pointLight position={[-2, 2.5, 0]} intensity={0.6} color="#42A5F5" distance={8} decay={2} />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.8} metalness={0.1} />
      </mesh>

      <group position={[2, 0.75, -2]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 0.1, 1.2]} />
          <meshStandardMaterial color="#8D6E63" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[-0.8, -0.5, -0.4]} castShadow>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="#5D4037" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[0.8, -0.5, -0.4]} castShadow>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="#5D4037" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[-0.8, -0.5, 0.4]} castShadow>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="#5D4037" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[0.8, -0.5, 0.4]} castShadow>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="#5D4037" roughness={0.7} metalness={0.1} />
        </mesh>
      </group>

      <group position={[-2, 0.45, 0]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.1, 0.8]} />
          <meshStandardMaterial color="#795548" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[0, 1, -0.35]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 1.2, 0.1]} />
          <meshStandardMaterial color="#795548" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[-0.3, -0.2, -0.3]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.5]} />
          <meshStandardMaterial color="#4E342E" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[0.3, -0.2, -0.3]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.5]} />
          <meshStandardMaterial color="#4E342E" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[-0.3, -0.2, 0.3]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.5]} />
          <meshStandardMaterial color="#4E342E" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[0.3, -0.2, 0.3]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.5]} />
          <meshStandardMaterial color="#4E342E" roughness={0.7} metalness={0.1} />
        </mesh>
      </group>

      <Rug position={[0, 0.01, 0]} />

      <InteractiveBook
        position={[2.3, 1.3, -2]}
        isOpen={objectStates.get('book-1')?.active || false}
        isHovered={hoveredObjects.has('book-1')}
        onClick={() => handleObjectClick('book-1')}
        onHover={(hovered) => handleHover('book-1', hovered)}
      />

      <AnimatedPlant position={[0, 0.5, 3]} />

      <InteractiveLamp
        position={[-4, 0.8, -3]}
        objectId="lamp-1"
        isOn={lampIsOn}
        isHovered={hoveredObjects.has('lamp-1')}
        onClick={handleObjectClick}
        onHover={handleHover}
      />

      <group position={[4, 1.5, -3.9]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.5, 2, 0.1]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.5, 0.06]}>
          <planeGeometry args={[1.3, 1.8]} />
          <meshStandardMaterial color="#1E88E5" roughness={0.9} metalness={0} />
        </mesh>
      </group>

      <group position={[5.8, 1.5, -2]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1, 1.3, 0.1]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.4, 0.06]}>
          <planeGeometry args={[0.8, 1.1]} />
          <meshStandardMaterial color="#E53935" roughness={0.9} metalness={0} />
        </mesh>
      </group>

      <group position={[0, 0.5, 0]}>
        <FloatingObject
          position={[0, 0.5, 0]}
          geometry="octahedron"
          color="#E91E63"
          rotationSpeed={0.015}
        />
        <FloatingObject
          position={[0.3, 0.3, 0.15]}
          geometry="icosahedron"
          color="#9C27B0"
          rotationSpeed={0.02}
        />
        <FloatingObject
          position={[-0.25, 0.35, -0.2]}
          geometry="tetrahedron"
          color="#00BCD4"
          rotationSpeed={0.018}
        />
        <FloatingObject
          position={[0.15, 0.6, -0.1]}
          geometry="dodecahedron"
          color="#FF9800"
          rotationSpeed={0.012}
        />
      </group>

      <DustParticles />

      <Text
        position={[0, 3, -5]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        Welcome to GraphWiz-XR
      </Text>

      <Text
        position={[0, 2.6, -5]}
        fontSize={0.12}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
      >
        Click lamp or book to interact
      </Text>
    </>
  );
}
