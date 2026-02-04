//! Simple instancing utility for 3D optimization

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

interface InstancedProps {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position: THREE.Vector3;
  count: number;
}

export function useInstancedMeshes(props: InstancedProps[]) {
  const meshesRef = useRef<Map<string, THREE.InstancedMesh>>(new Map());

  // Create meshes from props
  const meshes = useMemo(() => {
    const newMeshes = new Map<string, THREE.InstancedMesh>();

    props.forEach((prop, index) => {
      const key = `instanced-${index}`;

      if (!newMeshes.has(key)) {
        const mesh = new THREE.InstancedMesh(prop.geometry, prop.material, prop.count);
        mesh.position.copy(prop.position);
        newMeshes.set(key, mesh);
      }
    });

    return newMeshes;
  }, [props]);

  // Clean up old meshes
  useEffect(() => {
    const currentKeys = new Set(meshesRef.current.keys());

    meshes.forEach((_, key) => {
      if (!currentKeys.has(key) && meshesRef.current.has(key)) {
        const mesh = meshesRef.current.get(key);
        if (mesh && mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh && mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat: THREE.Material) => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
        meshesRef.current.delete(key);
      }
    });
  }, [meshes]);

  // Update positions
  const updatePositions = (updates: Map<string, THREE.Vector3>) => {
    updates.forEach((position, key) => {
      const mesh = meshes.get(key);
      if (mesh) {
        mesh.position.copy(position);
      }
    });
  };

  return { meshes, updatePositions };
}
