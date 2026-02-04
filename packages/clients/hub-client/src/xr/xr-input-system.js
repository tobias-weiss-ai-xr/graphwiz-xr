/**
 * XR Input System
 *
 * ECS system that handles WebXR controller input and updates entities.
 */
import { EventEmitter } from 'events';
import * as THREE from 'three';
import { TransformComponent, PhysicsComponent } from '../ecs/entity';
import { System } from '../ecs/system';
/**
 * Component for XR controller entities
 */
export class XRControllerComponent {
    constructor(hand) {
        this.gripEntity = null;
        this.aimEntity = null;
        this.modelLoaded = false;
        this.visible = true;
        this.hand = hand;
    }
}
/**
 * Component for VR-interactive entities
 */
export class VRInteractableComponent {
    constructor(options = {}) {
        this.interactable = true;
        this.grabbable = true;
        this.throwable = true;
        this.highlightOnHover = true;
        this.isHighlighted = false;
        this.isGrabbed = false;
        this.grabbedBy = null; // Controller ID
        this.grabOffset = new THREE.Vector3();
        this.grabRotation = new THREE.Quaternion();
        this.interactable = options.interactable ?? true;
        this.grabbable = options.grabbable ?? true;
        this.throwable = options.throwable ?? true;
        this.highlightOnHover = options.highlightOnHover ?? true;
    }
}
export class XRInputSystem extends System {
    constructor(xrInputManager, config = {}) {
        super();
        this.gripEntities = new Map(); // controller ID -> entity ID
        this.aimEntities = new Map(); // controller ID -> entity ID
        this.grabbedEntities = new Map(); // controller ID -> grabbed entity ID
        this.previousTriggerValues = new Map();
        this.lastPositions = new Map();
        this.velocities = new Map();
        this.eventEmitter = new EventEmitter();
        // Raycaster for interaction detection
        this.raycaster = new THREE.Raycaster();
        this.interactionDistance = 2.0; // meters
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
    update(deltaTime) {
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
    updateController(controllerId, state, _deltaTime) {
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
        }
        else {
            this.handleTriggerRelease(controllerId, state);
        }
        // Handle grip/interaction
        if (state.squeeze) {
            this.handleGripPress(controllerId, state);
        }
        else {
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
    handleTriggerPress(_controllerId, state) {
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
                        this.xrInputManager.triggerHapticPulse(_controllerId, (this.config.hapticStrength ?? 0.5) * 0.3);
                    }
                }
            }
        }
    }
    /**
     * Handle trigger release
     */
    handleTriggerRelease(_controllerId, _state) {
        // Clear all highlights
        this.clearHighlights();
    }
    /**
     * Handle grip/grab press
     */
    handleGripPress(controllerId, state) {
        const alreadyGrabbed = this.grabbedEntities.get(controllerId);
        if (alreadyGrabbed)
            return; // Already grabbing something
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
    handleGripRelease(controllerId, _state) {
        const grabbedEntityId = this.grabbedEntities.get(controllerId);
        if (grabbedEntityId && this.world) {
            const entity = this.world.getEntity(grabbedEntityId);
            if (entity) {
                const interactable = entity.getComponent(VRInteractableComponent);
                if (interactable && interactable.throwable) {
                    // Throw the entity with calculated velocity
                    this.throwEntity(controllerId, grabbedEntityId);
                }
                else {
                    // Just release
                    this.releaseEntity(controllerId, grabbedEntityId);
                }
            }
        }
    }
    /**
     * Grab an entity
     */
    grabEntity(controllerId, entityId, state) {
        if (!this.world)
            return;
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const interactable = entity.getComponent(VRInteractableComponent);
        const transform = entity.getComponent(TransformComponent);
        if (!interactable || !transform)
            return;
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
    releaseEntity(controllerId, entityId) {
        if (!this.world)
            return;
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const interactable = entity.getComponent(VRInteractableComponent);
        if (!interactable)
            return;
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
    throwEntity(controllerId, entityId) {
        if (!this.world)
            return;
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const interactable = entity.getComponent(VRInteractableComponent);
        const transform = entity.getComponent(TransformComponent);
        const physics = entity.getComponent(PhysicsComponent);
        if (!interactable || !transform || !physics)
            return;
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
            this.xrInputManager.triggerHapticPulse(controllerId, (this.config.hapticStrength ?? 0.5) * 0.7);
        }
        this.emit('entityThrown', entityId, controllerId, velocity);
    }
    /**
     * Raycast to find interactable entities
     */
    raycast(position, rotation) {
        if (!this.world)
            return null;
        // Create ray from aim direction
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(rotation);
        this.raycaster.set(position, direction);
        this.raycaster.far = this.interactionDistance;
        // Get all entities with transform and interactable components
        const entities = this.world.getEntitiesWithComponents(TransformComponent);
        const interactables = [];
        for (const entity of entities) {
            const interactable = entity.getComponent(VRInteractableComponent);
            if (!interactable || !interactable.interactable || interactable.isGrabbed)
                continue;
            const transform = entity.getComponent(TransformComponent);
            if (!transform)
                continue;
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
            return interactables[0];
        }
        return null;
    }
    /**
     * Clear all highlights
     */
    clearHighlights() {
        if (!this.world)
            return;
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
    calculateVelocity(controllerId, position) {
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
    setupEventListeners() {
        this.xrInputManager.on('controllerConnected', (controllerId, state) => {
            this.onControllerConnected(controllerId, state);
        });
        this.xrInputManager.on('controllerDisconnected', (controllerId) => {
            this.onControllerDisconnected(controllerId);
        });
    }
    /**
     * Handle controller connected
     */
    onControllerConnected(controllerId, state) {
        if (!this.world)
            return;
        // Only create entities for left/right controllers
        if (state.handedness === 'none')
            return;
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
    onControllerDisconnected(controllerId) {
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
    async loadControllerModel(entityId, handedness) {
        const controllerColor = handedness === 'left' ? '#4CAF50' : '#FFB74E';
        console.log(`[XRInputSystem] Loading ${handedness} controller model (simple geometry) for entity ${entityId}`);
        try {
            // Get or create the grip entity
            const gripEntity = this.world.getEntity(entityId);
            if (!gripEntity || gripEntity === undefined) {
                console.error(`[XRInputSystem] Entity ${entityId} not found`);
                return;
            }
            console.log(`[XRInputSystem] Successfully marked ${handedness} controller model loaded for entity ${entityId}`);
        }
        catch (error) {
            console.error(`[XRInputSystem] Failed to mark controller model for ${handedness}:`, error);
        }
    }
    /**
     * Get grabbed entity for a controller
     */
    getGrabbedEntity(controllerId) {
        return this.grabbedEntities.get(controllerId);
    }
    /**
     * Get controller that grabbed an entity
     */
    getGrabbingController(entityId) {
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
    on(event, listener) {
        this.eventEmitter.on(event, listener);
    }
    /**
     * Emit event
     */
    emit(event, ...args) {
        this.eventEmitter.emit(event, ...args);
    }
    /**
     * Remove all listeners
     */
    removeAllListeners() {
        this.eventEmitter.removeAllListeners();
    }
}
