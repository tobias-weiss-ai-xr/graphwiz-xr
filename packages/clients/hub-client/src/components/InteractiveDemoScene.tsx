import { Text, Grid } from '@react-three/drei';
import { Float, MeshDistortMaterial, Stars, Environment } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { useState, useRef } from 'react';
import { useEffect } from 'react';
import { Mesh } from 'three';

/**
 * Interactive Button Object
 * A clickable demo object that changes color when clicked
 */
interface InteractiveButtonProps {
  position: [number, number, number];
  objectId: string;
  color: string;
  onClick: (objectId: string) => void;
  isHovered: boolean;
  onHover: (objectId: string, hovered: boolean) => void;
  isActive: boolean;
  label: string;
}

function InteractiveButton({
  position,
  objectId,
  color,
  onClick,
  isHovered,
  onHover,
  isActive,
  label
}: InteractiveButtonProps) {
  const meshRef = useRef<Mesh>(null);
  const [localActive, setLocalActive] = useState(false);
  const { camera, raycaster, pointer } = useThree();

  // Handle click detection
  useEffect(() => {
    const handlePointerDown = () => {
      if (meshRef.current) {
        meshRef.current.userData.isClicking = true;
        meshRef.current.userData.clickTime = Date.now();
      }
    };

    const handlePointerUp = () => {
      if (meshRef.current && meshRef.current.userData.isClicking) {
        const clickDuration = Date.now() - (meshRef.current.userData.clickTime || 0);
        meshRef.current.userData.isClicking = false;

        // Only register as click if quick (< 200ms)
        if (clickDuration < 200 && isHovered) {
          setLocalActive(!localActive);
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

  // Check hover on each frame
  useFrame(() => {
    if (!meshRef.current) return;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current);

    const wasHovered = isHovered;
    const nowHovered = intersects.length > 0;

    if (wasHovered !== nowHovered) {
      onHover(objectId, nowHovered);
    }

    // Animate when active
    if (localActive || isActive) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  // Color interpolation
  const displayColor = (localActive || isActive) ? '#00ff00' : (isHovered ? '#ffff00' : color);

  return (
    <group position={position}>
      {/* Platform */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.2, 32]} />
        <meshStandardMaterial color="#333333" roughness={0.8} />
      </mesh>

      {/* Button object */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.1}>
        <mesh
          ref={meshRef}
          position={[0, 0, 0]}
          castShadow
          scale={isHovered ? 1.1 : 1}
        >
          <boxGeometry args={[1, 1, 1]} />
          <MeshDistortMaterial
            color={displayColor}
            attach="material"
            distort={isHovered ? 0.6 : 0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>

      {/* Label */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.15}
        color={displayColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {label}
      </Text>

      {/* Status indicator */}
      {(localActive || isActive) && (
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.12}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          ACTIVE
        </Text>
      )}
    </group>
  );
}

/**
 * Collectible Gem
 * A gem that disappears when clicked and reappears after 5 seconds
 */
interface CollectibleGemProps {
  position: [number, number, number];
  gemId: string;
  collected: boolean;
  onCollect: (gemId: string) => void;
}

function CollectibleGem({ position, gemId, collected, onCollect }: CollectibleGemProps) {
  const meshRef = useRef<Mesh>(null);
  const { camera, raycaster, pointer } = useThree();
  const [isHovered, setIsHovered] = useState(false);
  const scaleRef = useRef(1);

  useFrame(() => {
    if (!meshRef.current) return;

    // Check hover
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current);
    const hovered = intersects.length > 0 && !collected;

    if (hovered !== isHovered) {
      setIsHovered(hovered);
    }

    // Animation
    if (!collected) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.002) * 0.1;

      // Hover scale effect
      const targetScale = hovered ? 1.3 : 1;
      scaleRef.current += (targetScale - scaleRef.current) * 0.1;
      meshRef.current.scale.setScalar(scaleRef.current);
    }
  });

  // Handle click
  useEffect(() => {
    const handlePointerDown = () => {
      if (isHovered && !collected) {
        onCollect(gemId);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [isHovered, collected, gemId, onCollect]);

  if (collected) return null;

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={isHovered ? 0.5 : 0.2}
          roughness={0.1}
          metalness={1}
        />
      </mesh>

      {/* Glow effect */}
      <pointLight position={[0, 0, 0]} color="#ff00ff" intensity={isHovered ? 2 : 1} distance={3} />
    </group>
  );
}

/**
 * Synced Light Switch
 * A light that can be toggled on/off by any player
 */
interface LightSwitchProps {
  position: [number, number, number];
  switchId: string;
  isOn: boolean;
  onToggle: (switchId: string) => void;
}

function LightSwitch({ position, switchId, isOn, onToggle }: LightSwitchProps) {
  const meshRef = useRef<Mesh>(null);
  const { camera, raycaster, pointer } = useThree();
  const [isHovered, setIsHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current);
    const hovered = intersects.length > 0;

    if (hovered !== isHovered) {
      setIsHovered(hovered);
    }

    // Animation when on
    if (isOn) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  // Handle click
  useEffect(() => {
    const handlePointerDown = () => {
      if (isHovered) {
        onToggle(switchId);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [isHovered, switchId, onToggle]);

  return (
    <group position={position}>
      {/* Light bulb */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={isOn ? '#ffff00' : '#333333'}
          emissive={isOn ? '#ffff00' : '#000000'}
          emissiveIntensity={isOn ? 1 : 0}
        />
      </mesh>

      {/* Point light when on */}
      {isOn && (
        <pointLight position={[0, 1.5, 0]} color="#ffff00" intensity={3} distance={10} castShadow />
      )}

      {/* Switch base */}
      <mesh position={[0, 0, 0]} ref={meshRef} castShadow>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color={isHovered ? '#666666' : '#444444'} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.12}
        color={isOn ? '#ffff00' : '#888888'}
        anchorX="center"
      >
        {isOn ? 'ON' : 'OFF'}
      </Text>
    </group>
  );
}

/**
 * InteractiveDemoScene - Multiplayer interactive demo objects
 *
 * Features:
 * - Clickable buttons that sync state across all players
 * - Collectible gems that respawn
 * - Toggleable lights that everyone sees
 * - Hover effects and visual feedback
 * - Network-synchronized state
 */
interface DemoObjectState {
  objectId: string;
  type: 'button' | 'gem' | 'light';
  active: boolean;
  lastUpdate: number;
  clientId: string;
}

interface InteractiveDemoSceneProps {
  wsClient: any;
  myClientId: string;
}

export function InteractiveDemoScene({ wsClient, myClientId }: InteractiveDemoSceneProps) {
  const [objectStates, setObjectStates] = useState<Map<string, DemoObjectState>>(new Map());
  const [hoveredObjects, setHoveredObjects] = useState<Set<string>>(new Set());

  // Initialize object states
  useEffect(() => {
    const initialStates = new Map<string, DemoObjectState>();

    // Create interactive buttons
    initialStates.set('button-red', { objectId: 'button-red', type: 'button', active: false, lastUpdate: Date.now(), clientId: '' });
    initialStates.set('button-blue', { objectId: 'button-blue', type: 'button', active: false, lastUpdate: Date.now(), clientId: '' });
    initialStates.set('button-green', { objectId: 'button-green', type: 'button', active: false, lastUpdate: Date.now(), clientId: '' });

    // Create collectible gems
    initialStates.set('gem-1', { objectId: 'gem-1', type: 'gem', active: false, lastUpdate: Date.now(), clientId: '' });
    initialStates.set('gem-2', { objectId: 'gem-2', type: 'gem', active: false, lastUpdate: Date.now(), clientId: '' });

    // Create light switches
    initialStates.set('light-1', { objectId: 'light-1', type: 'light', active: true, lastUpdate: Date.now(), clientId: '' });

    setObjectStates(initialStates);
  }, []);

  // Handle object clicks
  const handleObjectClick = (objectId: string) => {
    const state = objectStates.get(objectId);
    if (!state) return;

    const newState = {
      ...state,
      active: !state.active,
      lastUpdate: Date.now(),
      clientId: myClientId
    };

    setObjectStates(prev => new Map(prev).set(objectId, newState));

    // Broadcast to other players
    if (wsClient && wsClient.connected()) {
      console.log('[DemoScene] Broadcasting interaction:', objectId, newState);
      // Send via ENTITY_UPDATE
      wsClient.sendEntityUpdate({
        entityId: objectId,
        components: {
          demoObjectState: newState
        }
      });
    }

    // If gem was collected, respawn after 5 seconds
    if (state.type === 'gem' && !state.active) {
      setTimeout(() => {
        setObjectStates(prev => {
          const s = prev.get(objectId);
          if (s) {
            return new Map(prev).set(objectId, { ...s, active: false, lastUpdate: Date.now(), clientId: '' });
          }
          return prev;
        });
      }, 5000);
    }
  };

  // Handle light toggle
  const handleLightToggle = (lightId: string) => {
    handleObjectClick(lightId);
  };

  // Handle gem collection
  const handleGemCollect = (gemId: string) => {
    const state = objectStates.get(gemId);
    if (!state || state.active) return;

    const newState = {
      ...state,
      active: true, // true = collected
      lastUpdate: Date.now(),
      clientId: myClientId
    };

    setObjectStates(prev => new Map(prev).set(gemId, newState));

    // Broadcast to other players
    if (wsClient && wsClient.connected()) {
      console.log('[DemoScene] Broadcasting gem collection:', gemId);
      wsClient.sendEntityUpdate({
        entityId: gemId,
        components: {
          demoObjectState: newState
        }
      });
    }
  };

  // Handle hover state
  const handleHover = (objectId: string, hovered: boolean) => {
    setHoveredObjects(prev => {
      const newSet = new Set(prev);
      if (hovered) {
        newSet.add(objectId);
      } else {
        newSet.delete(objectId);
      }
      return newSet;
    });
  };

  // Listen for ENTITY_UPDATE messages from other players
  useEffect(() => {
    if (!wsClient) return;

    const unsubscribe = wsClient.on(21, (message: any) => { // ENTITY_UPDATE = 21
      if (message.payload && message.payload.components?.demoObjectState) {
        const state: DemoObjectState = message.payload.components.demoObjectState;
        console.log('[DemoScene] Received interaction:', state);

        setObjectStates(prev => {
          // Only update if remote update is newer
          const current = prev.get(state.objectId);
          if (!current || state.lastUpdate > current.lastUpdate) {
            return new Map(prev).set(state.objectId, state);
          }
          return prev;
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [wsClient]);

  return (
    <>
      {/* Environment */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Colored point lights for atmosphere */}
      <pointLight position={[10, 5, 10]} intensity={0.3} color="#6366f1" distance={20} />
      <pointLight position={[-10, 5, -10]} intensity={0.3} color="#ec4899" distance={20} />

      {/* Interactive Buttons */}
      <InteractiveButton
        position={[5, 1, 0]}
        objectId="button-red"
        color="#ef4444"
        onClick={handleObjectClick}
        isHovered={hoveredObjects.has('button-red')}
        onHover={handleHover}
        isActive={objectStates.get('button-red')?.active || false}
        label="Button A"
      />

      <InteractiveButton
        position={[-5, 1, 0]}
        objectId="button-blue"
        color="#3b82f6"
        onClick={handleObjectClick}
        isHovered={hoveredObjects.has('button-blue')}
        onHover={handleHover}
        isActive={objectStates.get('button-blue')?.active || false}
        label="Button B"
      />

      <InteractiveButton
        position={[0, 1, 5]}
        objectId="button-green"
        color="#10b981"
        onClick={handleObjectClick}
        isHovered={hoveredObjects.has('button-green')}
        onHover={handleHover}
        isActive={objectStates.get('button-green')?.active || false}
        label="Button C"
      />

      {/* Collectible Gems */}
      <CollectibleGem
        position={[3, 1.5, 3]}
        gemId="gem-1"
        collected={objectStates.get('gem-1')?.active || false}
        onCollect={handleGemCollect}
      />

      <CollectibleGem
        position={[-3, 1.5, -3]}
        gemId="gem-2"
        collected={objectStates.get('gem-2')?.active || false}
        onCollect={handleGemCollect}
      />

      {/* Light Switches */}
      <LightSwitch
        position={[0, 0, -5]}
        switchId="light-1"
        isOn={objectStates.get('light-1')?.active || false}
        onToggle={handleLightToggle}
      />

      {/* Ground Grid */}
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6f6f6f"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Ground Plane */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.3} />
      </mesh>

      {/* Info Text */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        Interactive Demo Scene
      </Text>

      <Text
        position={[0, 3.5, 0]}
        fontSize={0.12}
        color="#a0aec0"
        anchorX="center"
        anchorY="middle"
      >
        Click objects to interact • Changes sync across all players
      </Text>
    </>
  );
}
