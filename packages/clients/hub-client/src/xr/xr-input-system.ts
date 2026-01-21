/**
 * XR Input System
 *
 * ECS system that handles WebXR controller input and updates entities.
 */

import { EventEmitter } from 'events';

import * as THREE from 'three';

import { TransformComponent, PhysicsComponent } from '../ecs/entity';
import { System } from '../ecs/system';

import { XRInputManager, ControllerState } from './xr-input-manager';

export interface XRInputSystemConfig {
  enableHapticFeedback?: boolean;
  hapticStrength?: number;
}

/**
 * Component for XR controller entities
 */
export class XRControllerComponent {
  public hand: 'left' | 'right';
  public gripEntity: string | null = null;
  public aimEntity: string | null = null;
  public modelLoaded = false;
  public visible = true;

  constructor(hand: 'left' | 'right') {
    this.hand = hand;
  }
}

/**
 * Component for VR-interactive entities
 */
export class VRInteractableComponent {
  public interactable: boolean = true;
  public grabbable: boolean = true;
  public throwable: boolean = true;
  public highlightOnHover: boolean = true;
  public isHighlighted = false;
  public isGrabbed = false;
  public grabbedBy: string | null = null; // Controller ID
  public grabOffset = new THREE.Vector3();
  public grabRotation = new THREE.Quaternion();

  constructor(
    options: {
      interactable?: boolean;
      grabbable?: boolean;
      throwable?: boolean;
      highlightOnHover?: boolean;
    } = {}
  ) {
    this.interactable = options.interactable ?? true;
    this.grabbable = options.grabbable ?? true;
    this.throwable = options.throwable ?? true;
    this.highlightOnHover = options.highlightOnHover ?? true;
  }
}

export class XRInputSystem extends System {
  private xrInputManager: XRInputManager;
  private config: XRInputSystemConfig;
  private gripEntities = new Map<string, string>(); // controller ID -> entity ID
  private aimEntities = new Map<string, string>(); // controller ID -> entity ID
  private grabbedEntities = new Map<string, string>(); // controller ID -> grabbed entity ID
  private previousTriggerValues = new Map<string, number>();
  private lastPositions = new Map<string, THREE.Vector3>();
  private velocities = new Map<string, THREE.Vector3>();
  private eventEmitter = new EventEmitter();

  // Raycaster for interaction detection
  private raycaster = new THREE.Raycaster();
  private interactionDistance = 2.0; // meters

  constructor(xrInputManager: XRInputManager, config: XRInputSystemConfig = {}) {
    super();
    this.xrInputManager = xrInputManager;
    this.config = {
      enableHapticFeedback: true,
      hapticStrength: 0.5,
      ...config
    };

    this.setupEventListeners();
  }

  /**
   * Update XR input system
   */
  override update(deltaTime: number): void {
    if (!this.world || !this.xrInputManager.isControllerConnected()) {
      return;
    }

    // Update each controller
    for (const [controllerId, state] of this.xrInputManager.getControllers()) {
      this.updateController(controllerId, state, deltaTime);
    }
  }

  /**
   * Update individual controller
   */
  private updateController(controllerId: string, state: ControllerState, _deltaTime: number): void {
    // Update grip entity transform
    const gripEntityId = this.gripEntities.get(controllerId);
    if (gripEntityId && this.world) {
      const entity = this.world.getEntity(gripEntityId);
      if (entity) {
        const transform = entity.getComponent(TransformComponent);
        if (transform) {
          transform.position.copy(state.gripPosition);
          const euler = new THREE.Euler().setFromQuaternion(state.gripRotation);
          transform.rotation.copy(euler);
        }
      }
    }

    // Update aim entity transform
    const aimEntityId = this.aimEntities.get(controllerId);
    if (aimEntityId && this.world) {
      const entity = this.world.getEntity(aimEntityId);
      if (entity) {
        const transform = entity.getComponent(TransformComponent);
        if (transform) {
          transform.position.copy(state.aimPosition);
          const euler = new THREE.Euler().setFromQuaternion(state.aimRotation);
          transform.rotation.copy(euler);
        }
      }
    }

    // Calculate velocity for throwing
    this.calculateVelocity(controllerId, state.gripPosition);

    // Handle trigger press
    if (state.selection) {
      this.handleTriggerPress(controllerId, state);
    } else {
      this.handleTriggerRelease(controllerId, state);
    }

    // Handle grip/interaction
    if (state.squeeze) {
      this.handleGripPress(controllerId, state);
    } else {
      this.handleGripRelease(controllerId, state);
    }

    // Update previous trigger value
    const triggerButton = state.buttons.get('trigger');
    if (triggerButton) {
      this.previousTriggerValues.set(controllerId, triggerButton.value);
    }
  }

  /**
   * Handle trigger press
   */
  private handleTriggerPress(_controllerId: string, state: ControllerState): void {
    // Raycast for interactable entities
    const hitResult = this.raycast(state.aimPosition, state.aimRotation);

    if (hitResult) {
      const entity = hitResult.entity;
      const interactable = entity.getComponent(VRInteractableComponent);

      if (interactable && interactable.interactable) {
        // Highlight entity
        if (interactable.highlightOnHover && !interactable.isHighlighted) {
          interactable.isHighlighted = true;
          this.emit('entityHighlighted', entity.id);

          // Trigger haptic feedback
          if (this.config.enableHapticFeedback) {
            this.xrInputManager.triggerHapticPulse(
              _controllerId,
              (this.config.hapticStrength ?? 0.5) * 0.3
            );
          }
        }
      }
    }
  }

  /**
   * Handle trigger release
   */
  private handleTriggerRelease(_controllerId: string, _state: ControllerState): void {
    // Clear all highlights
    this.clearHighlights();
  }

  /**
   * Handle grip/grab press
   */
  private handleGripPress(controllerId: string, state: ControllerState): void {
    const alreadyGrabbed = this.grabbedEntities.get(controllerId);
    if (alreadyGrabbed) return; // Already grabbing something

    // Find entity to grab
    const hitResult = this.raycast(state.gripPosition, state.gripRotation);

    if (hitResult) {
      const entity = hitResult.entity;
      const interactable = entity.getComponent(VRInteractableComponent);

      if (interactable && interactable.grabbable && !interactable.isGrabbed) {
        // Grab the entity
        this.grabEntity(controllerId, entity.id, state);
      }
    }
  }

  /**
   * Handle grip/grab release
   */
  private handleGripRelease(controllerId: string, _state: ControllerState): void {
    const grabbedEntityId = this.grabbedEntities.get(controllerId);

    if (grabbedEntityId && this.world) {
      const entity = this.world.getEntity(grabbedEntityId);
      if (entity) {
        const interactable = entity.getComponent(VRInteractableComponent);

        if (interactable && interactable.throwable) {
          // Throw the entity with calculated velocity
          this.throwEntity(controllerId, grabbedEntityId);
        } else {
          // Just release
          this.releaseEntity(controllerId, grabbedEntityId);
        }
      }
    }
  }

  /**
   * Grab an entity
   */
  private grabEntity(controllerId: string, entityId: string, state: ControllerState): void {
    if (!this.world) return;

    const entity = this.world.getEntity(entityId);
    if (!entity) return;

    const interactable = entity.getComponent(VRInteractableComponent);
    const transform = entity.getComponent(TransformComponent);

    if (!interactable || !transform) return;

    // Mark as grabbed
    interactable.isGrabbed = true;
    interactable.grabbedBy = controllerId;

    // Calculate offset from controller to entity
    interactable.grabOffset.copy(transform.position).sub(state.gripPosition);
    interactable.grabRotation.setFromEuler(transform.rotation);

    // Store grabbed entity
    this.grabbedEntities.set(controllerId, entityId);

    // Trigger haptic feedback
    if (this.config.enableHapticFeedback) {
      this.xrInputManager.triggerHapticPulse(controllerId, this.config.hapticStrength ?? 0.5);
    }

    this.emit('entityGrabbed', entityId, controllerId);

    // Disable physics while grabbing
    const physics = entity.getComponent(PhysicsComponent);
    if (physics) {
      physics.isKinematic = true;
    }
  }

  /**
   * Release an entity
   */
  private releaseEntity(controllerId: string, entityId: string): void {
    if (!this.world) return;

    const entity = this.world.getEntity(entityId);
    if (!entity) return;

    const interactable = entity.getComponent(VRInteractableComponent);

    if (!interactable) return;

    // Mark as released
    interactable.isGrabbed = false;
    interactable.grabbedBy = null;

    // Remove from grabbed entities
    this.grabbedEntities.delete(controllerId);

    // Re-enable physics
    const physics = entity.getComponent(PhysicsComponent);
    if (physics) {
      physics.isKinematic = false;
    }

    this.emit('entityReleased', entityId, controllerId);
  }

  /**
   * Throw an entity with velocity
   */
  private throwEntity(controllerId: string, entityId: string): void {
    if (!this.world) return;

    const entity = this.world.getEntity(entityId);
    if (!entity) return;

    const interactable = entity.getComponent(VRInteractableComponent);
    const transform = entity.getComponent(TransformComponent);
    const physics = entity.getComponent(PhysicsComponent);

    if (!interactable || !transform || !physics) return;

    // Get velocity
    const velocity = this.velocities.get(controllerId);
    if (!velocity) {
      this.releaseEntity(controllerId, entityId);
      return;
    }

    // Apply velocity to physics
    physics.velocity.copy(velocity);
    physics.isKinematic = false;

    // Release entity
    this.releaseEntity(controllerId, entityId);

    // Trigger haptic feedback
    if (this.config.enableHapticFeedback) {
      this.xrInputManager.triggerHapticPulse(
        controllerId,
        (this.config.hapticStrength ?? 0.5) * 0.7
      );
    }

    this.emit('entityThrown', entityId, controllerId, velocity);
  }

  /**
   * Raycast to find interactable entities
   */
  private raycast(
    position: THREE.Vector3,
    rotation: THREE.Quaternion
  ): {
    entity: any;
    point: THREE.Vector3;
    distance: number;
  } | null {
    if (!this.world) return null;

    // Create ray from aim direction
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(rotation);

    this.raycaster.set(position, direction);
    this.raycaster.far = this.interactionDistance;

    // Get all entities with transform and interactable components
    const entities = this.world.getEntitiesWithComponents(TransformComponent);
    const interactables: Array<{ entity: any; distance: number; point: THREE.Vector3 }> = [];

    for (const entity of entities) {
      const interactable = entity.getComponent(VRInteractableComponent);
      if (!interactable || !interactable.interactable || interactable.isGrabbed) continue;

      const transform = entity.getComponent(TransformComponent);
      if (!transform) continue;

      // Simple distance check (could be improved with proper mesh raycasting)
      const distance = position.distanceTo(transform.position);
      if (distance < this.interactionDistance) {
        interactables.push({
          entity,
          distance,
          point: transform.position.clone()
        });
      }
    }

    // Sort by distance and return closest
    if (interactables.length > 0) {
      interactables.sort((a, b) => a.distance - b.distance);
      return interactables[0]!;
    }

    return null;
  }

  /**
   * Clear all highlights
   */
  private clearHighlights(): void {
    if (!this.world) return;

    const entities = this.world.getEntitiesWithComponents(VRInteractableComponent);

    for (const entity of entities) {
      const interactable = entity.getComponent(VRInteractableComponent);
      if (interactable && interactable.isHighlighted) {
        interactable.isHighlighted = false;
        this.emit('entityUnhighlighted', entity.id);
      }
    }
  }

  /**
   * Calculate velocity for throwing
   */
  private calculateVelocity(controllerId: string, position: THREE.Vector3): void {
    const lastPos = this.lastPositions.get(controllerId);

    if (lastPos) {
      const velocity = new THREE.Vector3().subVectors(position, lastPos);

      // Smooth velocity
      const previousVelocity = this.velocities.get(controllerId);
      if (previousVelocity) {
        velocity.lerp(previousVelocity, 0.5);
      }

      this.velocities.set(controllerId, velocity);
    }

    this.lastPositions.set(controllerId, position.clone());
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.xrInputManager.on(
      'controllerConnected',
      (controllerId: string, state: ControllerState) => {
        this.onControllerConnected(controllerId, state);
      }
    );

    this.xrInputManager.on('controllerDisconnected', (controllerId: string) => {
      this.onControllerDisconnected(controllerId);
    });
  }

  /**
   * Handle controller connected
   */
  private onControllerConnected(controllerId: string, state: ControllerState): void {
    if (!this.world) return;

    // Only create entities for left/right controllers
    if (state.handedness === 'none') return;

    // Create grip entity
    const gripEntity = this.world.createEntity();
    const gripTransform = new TransformComponent();
    gripTransform.position.copy(state.gripPosition);
    const gripEuler = new THREE.Euler().setFromQuaternion(state.gripRotation);
    gripTransform.rotation.copy(gripEuler);
    gripEntity.addComponent(TransformComponent, gripTransform);

    const controllerComponent = new XRControllerComponent(state.handedness);
    gripEntity.addComponent(XRControllerComponent, controllerComponent);

    this.gripEntities.set(controllerId, gripEntity.id);

    // Could load controller model here
    this.loadControllerModel(gripEntity.id, state.handedness);

    this.emit('controllerEntityCreated', gripEntity.id, state.handedness);
  }

  /**
   * Handle controller disconnected
   */
  private onControllerDisconnected(controllerId: string): void {
    const gripEntityId = this.gripEntities.get(controllerId);
    if (gripEntityId && this.world) {
      this.world.removeEntity(gripEntityId);
      this.gripEntities.delete(controllerId);
    }

    const aimEntityId = this.aimEntities.get(controllerId);
    if (aimEntityId && this.world) {
      this.world.removeEntity(aimEntityId);
      this.aimEntities.delete(controllerId);
    }

    // Release any grabbed entities
    const grabbedEntityId = this.grabbedEntities.get(controllerId);
    if (grabbedEntityId) {
      this.releaseEntity(controllerId, grabbedEntityId);
    }
  }

  /**
   * Load controller model (simple geometric representation)
   */
  // eslint-disable-next-line no-unused-vars
  private async loadControllerModel(entityId: string, handedness: 'left' | 'right'): Promise<void> {
    const controllerColor = handedness === 'left' ? '#4CAF50' : '#FFB74E';

    console.log(
      `[XRInputSystem] Loading ${handedness} controller model (simple geometry) for entity ${entityId}`
    );

    try {
      // Get or create the grip entity
      const gripEntity = this.world.getEntity(entityId);
      if (!gripEntity || gripEntity === undefined) {
        console.error(`[XRInputSystem] Entity ${entityId} not found`);
        return;
      }

      console.log(
        `[XRInputSystem] Successfully marked ${handedness} controller model loaded for entity ${entityId}`
      );
    } catch (error) {
      console.error(`[XRInputSystem] Failed to mark controller model for ${handedness}:`, error);
    }
  }

  /**
   * Get grabbed entity for a controller
   */
  getGrabbedEntity(controllerId: string): string | undefined {
    return this.grabbedEntities.get(controllerId);
  }

  /**
   * Get controller that grabbed an entity
   */
  getGrabbingController(entityId: string): string | undefined {
    for (const [controllerId, grabbedId] of this.grabbedEntities) {
      if (grabbedId === entityId) {
        return controllerId;
      }
    }
    return undefined;
  }

  /**
   * Register event listener
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Emit event
   */
  private emit(event: string, ...args: any[]): void {
    this.eventEmitter.emit(event, ...args);
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.eventEmitter.removeAllListeners();
  }
}
