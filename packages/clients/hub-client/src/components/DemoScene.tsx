import { Text } from '@react-three/drei';
import { Float, MeshDistortMaterial, Stars, Environment } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh } from 'three';

/**
 * RotatingCube - A rotating cube with distort material
 */
function RotatingCube({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

/**
 * BouncingSphere - A bouncing sphere with shiny material
 */
function BouncingSphere({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);
  const offsetRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_state) => {
    if (meshRef.current) {
      const time = _state.clock.elapsedTime + offsetRef.current;
      meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color="#ec4899"
        roughness={0.1}
        metalness={0.9}
        envMapIntensity={1}
      />
    </mesh>
  );
}

/**
 * SpinningTorus - A spinning torus knot
 */
function SpinningTorus({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.z += 0.01;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[0.4, 0.15, 16, 32]} />
        <meshStandardMaterial
          color="#10b981"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
    </Float>
  );
}

/**
 * Platform - A decorative platform
 */
function Platform({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={position} receiveShadow>
      <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

/**
 * InfoText - 3D text labels
 */
function InfoText({ position, text }: { position: [number, number, number]; text: string }) {
  return (
    <Text
      position={position}
      fontSize={0.15}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
      outlineColor="#000000"
    >
      {text}
    </Text>
  );
}

/**
 * DemoScene - A showcase 3D environment
 *
 * Features:
 * - Floating geometric shapes with animations
 * - Platform pedestals for each object
 * - Information labels
 * - Starfield background
 * - Environment lighting
 */
export function DemoScene() {
  return (
    <>
      {/* Environment and lighting */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />

      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.5} />

      {/* Main directional light (sun) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Colored point lights for atmosphere */}
      <pointLight position={[10, 5, 10]} intensity={0.5} color="#6366f1" distance={20} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ec4899" distance={20} />
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#10b981" distance={15} />

      {/* Demo objects arranged in a circle */}
      <group position={[0, 0, 0]}>
        {/* Object 1: Rotating Cube (Red/Purple) */}
        <group position={[5, 0.5, 0]}>
          <Platform position={[0, -0.5, 0]} color="#6366f1" />
          <RotatingCube position={[0, 0.5, 0]} />
          <InfoText position={[0, 2, 0]} text="Rotating Cube" />
        </group>

        {/* Object 2: Bouncing Sphere (Pink) */}
        <group position={[-5, 0.5, 0]}>
          <Platform position={[0, -0.5, 0]} color="#ec4899" />
          <BouncingSphere position={[0, 0.5, 0]} />
          <InfoText position={[0, 2, 0]} text="Bouncing Sphere" />
        </group>

        {/* Object 3: Spinning Torus (Green) */}
        <group position={[0, 0.5, 5]}>
          <Platform position={[0, -0.5, 0]} color="#10b981" />
          <SpinningTorus position={[0, 0.5, 0]} />
          <InfoText position={[0, 2, 0]} text="Spinning Torus" />
        </group>

        {/* Object 4: Another Rotating Cube (Blue) */}
        <group position={[0, 0.5, -5]}>
          <Platform position={[0, -0.5, 0]} color="#3b82f6" />
          <RotatingCube position={[0, 0.5, 0]} />
          <InfoText position={[0, 2, 0]} text="Distorted Cube" />
        </group>
      </group>

      {/* Central info text */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        GraphWiz-XR Demo Scene
      </Text>

      <Text
        position={[0, 3.5, 0]}
        fontSize={0.15}
        color="#a0aec0"
        anchorX="center"
        anchorY="middle"
      >
        Use WASD to move • Mouse to look • Explore!
      </Text>
    </>
  );
}
