/**
 * Grab System - Handles object grabbing, throwing, and manipulation
 *
 * Features:
 * - Raycasting for object selection
 * - Grab/release mechanics
 * - Throw physics with velocity tracking
 * - Multiplayer grab ownership
 * - Smooth interpolation
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useCallback } from 'react';
import { Vector3, Raycaster, Object3D } from 'three';

import { GrabbableComponent } from '../ecs/components';

export interface GrabTarget {
  entityId: string;
  object: Object3D;
  grabbable: GrabbableComponent;
}

export interface GrabSystemOptions {
  maxGrabDistance?: number;
  grabSmoothness?: number;
  throwMultiplier?: number;
  onGrab?: (target: GrabTarget) => void;
  onRelease?: (target: GrabTarget | null, velocity: Vector3) => void;
  onHover?: (target: GrabTarget | null) => void;
}

export interface GrabSystemReturn {
  grabbedObject: GrabTarget | null;
  hoveredObject: GrabTarget | null;
  grab: () => boolean;
  release: () => void;
  isGrabbing: boolean;
  canGrab: boolean;
}

/**
 * Grab System Hook
 *
 * Manages object grabbing with raycasting, physics, and network sync
 */
export function useGrabSystem(
  grabbableObjects: Map<string, { object: Object3D; grabbable: GrabbableComponent }>,
  myClientId: string | null,
  options: GrabSystemOptions = {}
): GrabSystemReturn {
  const {
    maxGrabDistance = 5,
    grabSmoothness = 0.2,
    throwMultiplier = 1.5,
    onGrab,
    onRelease,
    onHover,
  } = options;

  const { camera, pointer } = useThree();
  const raycaster = useRef<Raycaster>(new Raycaster());
  const grabbedObject = useRef<GrabTarget | null>(null);
  const hoveredObject = useRef<GrabTarget | null>(null);
  const isGrabbing = useRef(false);

  /**
   * Check if an object can be grabbed by this client
   */
  const canGrabObject = useCallback(
    (target: GrabTarget): boolean => {
      // Can't grab if already grabbed by someone else
      if (target.grabbable.isGrabbed && target.grabbable.grabbedBy !== myClientId) {
        return false;
      }

      // Can't grab if too far away
      const distance = camera.position.distanceTo(target.object.position);
      if (distance > maxGrabDistance) {
        return false;
      }

      return true;
    },
    [camera, maxGrabDistance, myClientId]
  );

  /**
   * Find grabbable object under cursor
   */
  const findGrabbableObject = useCallback((): GrabTarget | null => {
    raycaster.current.setFromCamera(pointer, camera);

    // Get all objects from the map
    const objects = Array.from(grabbableObjects.values()).map((item) => item.object);

    // Raycast against all objects
    const intersects = raycaster.current.intersectObjects(objects, false);

    if (intersects.length > 0) {
      // Find the corresponding grabbable component
      for (const [entityId, data] of grabbableObjects.entries()) {
        if (data.object === intersects[0].object || data.object === intersects[0].object.parent) {
          return {
            entityId,
            object: data.object,
            grabbable: data.grabbable,
          };
        }
      }
    }

    return null;
  }, [grabbableObjects, camera, pointer]);

  /**
   * Update hovered object
   */
  useFrame(() => {
    const target = findGrabbableObject();

    if (target !== hoveredObject.current) {
      hoveredObject.current = target;

      // Update hover state
      if (onHover) {
        onHover(target);
      }

      // Update cursor
      document.body.style.cursor = target && canGrabObject(target) ? 'grab' : 'default';
    }
  });

  /**
   * Update grabbed object position
   */
  useFrame(() => {
    if (!grabbedObject.current || !isGrabbing.current) {
      return;
    }

    const { object, grabbable } = grabbedObject.current;

    // Calculate target position (in front of camera)
    const targetPosition = new Vector3();
    const direction = new Vector3();
    camera.getWorldDirection(direction);

    targetPosition.copy(camera.position).add(direction.multiplyScalar(grabbable.grabDistance));

    // Add grab offset (rotated by camera rotation)
    const offset = grabbable.grabOffset.clone();
    offset.applyQuaternion(camera.quaternion);
    targetPosition.add(offset);

    // Smoothly interpolate to target position
    object.position.lerp(targetPosition, grabSmoothness);

    // Make object face camera
    object.lookAt(camera.position);

    // Record position for throw calculation
    grabbable.recordPosition(object.position);
  });

  /**
   * Grab current hovered object
   */
  const grab = useCallback((): boolean => {
    if (isGrabbing.current) {
      return false; // Already grabbing
    }

    const target = hoveredObject.current;
    if (!target || !canGrabObject(target)) {
      return false;
    }

    // Mark as grabbed
    isGrabbing.current = true;
    grabbedObject.current = target;

    // Calculate grab offset
    const grabOffset = new Vector3();
    target.object.getWorldPosition(grabOffset);
    grabOffset.sub(camera.position);

    // Update grabbable component
    target.grabbable.onGrab(myClientId || '', grabOffset);

    // Callback
    if (onGrab) {
      onGrab(target);
    }

    document.body.style.cursor = 'grabbing';

    return true;
  }, [camera, myClientId, onGrab, canGrabObject]);

  /**
   * Release currently grabbed object
   */
  const release = useCallback(() => {
    if (!isGrabbing.current || !grabbedObject.current) {
      return;
    }

    const { grabbable } = grabbedObject.current;

    // Calculate throw velocity
    grabbable.onRelease();
    const throwVelocity = grabbable.throwVelocity.clone().multiplyScalar(throwMultiplier);

    // Update grabbable state
    grabbable.isGrabbed = false;
    grabbable.grabbedBy = null;

    // Callback with throw velocity
    if (onRelease) {
      onRelease(grabbedObject.current, throwVelocity);
    }

    // Reset state
    isGrabbing.current = false;
    grabbedObject.current = null;

    document.body.style.cursor = 'default';
  }, [throwMultiplier, onRelease]);

  return {
    grabbedObject: grabbedObject.current,
    hoveredObject: hoveredObject.current,
    grab,
    release,
    isGrabbing: isGrabbing.current,
    canGrab: hoveredObject.current !== null && canGrabObject(hoveredObject.current),
  };
}

/**
 * Networked Grab System Hook
 *
 * Extends useGrabSystem with network synchronization
 */
export function useNetworkedGrabSystem(
  grabbableObjects: Map<string, { object: Object3D; grabbable: GrabbableComponent }>,
  myClientId: string | null,
  sendGrabMessage: (entityId: string, action: 'grab' | 'release', velocity?: Vector3) => void,
  options: GrabSystemOptions = {}
): GrabSystemReturn {
  const baseSystem = useGrabSystem(grabbableObjects, myClientId, options);

  /**
   * Network-aware grab
   */
  const grab = useCallback((): boolean => {
    if (!baseSystem.canGrab) {
      return false;
    }

    const success = baseSystem.grab();
    if (success && baseSystem.grabbedObject) {
      // Send grab message to network
      sendGrabMessage(baseSystem.grabbedObject.entityId, 'grab');
    }

    return success;
  }, [baseSystem, sendGrabMessage]);

  /**
   * Network-aware release
   */
  const release = useCallback(() => {
    if (!baseSystem.isGrabbing || !baseSystem.grabbedObject) {
      return;
    }

    // Get throw velocity before releasing
    const throwVel = baseSystem.grabbedObject.grabbable.throwVelocity.clone();

    // Release locally first
    baseSystem.release();

    // Send release message to network with velocity
    sendGrabMessage(baseSystem.grabbedObject?.entityId || '', 'release', throwVel);
  }, [baseSystem, sendGrabMessage]);

  return {
    ...baseSystem,
    grab,
    release,
  };
}
