/**
 * EntityRenderer Component
 *
 * Renders an ECS entity in the 3D scene using React Three Fiber.
 */

import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import type { Group, Mesh } from 'three';

import type { Entity } from '../ecs/entity';
import { TransformComponent, ModelComponent, AnimationComponent } from '../ecs/entity';


interface EntityRendererProps {
  entity: Entity;
}

export function EntityRenderer({ entity }: EntityRendererProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);

  const transform = entity.getComponent(TransformComponent);
  const model = entity.getComponent(ModelComponent);
  const animation = entity.getComponent(AnimationComponent);

  // Load model if present
  useEffect(() => {
    if (model && !model.isLoaded && !model.isLoading) {
      model.load().catch((err) => {
        console.error('Failed to load model:', err);
      });
    }
  }, [model]);

  // Update transform
  useFrame(() => {
    if (groupRef.current && transform) {
      groupRef.current.position.copy(transform.position);
      groupRef.current.rotation.copy(transform.rotation);
      groupRef.current.scale.copy(transform.scale);
    }

    // Update animation
    if (animation) {
      animation.update(0.016); // Approximate deltaTime
    }
  });

  if (!transform) return null;

  return (
    <group ref={groupRef}>
      {model && model.isLoaded && model.gltf && model.gltf.scene && (
        <primitive object={model.cloneScene()} />
      )}
      {!model && (
        <mesh ref={meshRef} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#4CAF50" />
        </mesh>
      )}
    </group>
  );
}
