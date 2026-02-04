/**
 * Cannon Physics System
 *
 * ECS system that integrates Cannon.js physics engine with entities.
 * (Renamed from PhysicsSystem to avoid conflict with placeholder physics)
 */
import * as CANNON from 'cannon-es';
import { Vector3 } from 'three';
import { System } from '../ecs';
import { TransformComponent } from '../ecs';
import { PhysicsBodyComponent } from './physics-body-component';
import { PhysicsWorld } from './physics-world';
export class CannonPhysicsSystem extends System {
    constructor(config = {}) {
        super();
        this.bodyEntities = new Map();
        const { gravity, solverIterations, broadphase, allowSleep, autoSync = true, } = config;
        this.physicsWorld = new PhysicsWorld({
            gravity,
            solverIterations,
            broadphase,
            allowSleep,
        });
        this.autoSync = autoSync;
        // Setup default materials
        this.setupDefaultMaterials();
        console.log('[CannonPhysicsSystem] Initialized', config);
    }
    /**
     * Setup default physics materials
     */
    setupDefaultMaterials() {
        this.physicsWorld.createMaterial('default', 0.3, 0.3);
        this.physicsWorld.createMaterial('slippery', 0.1, 0.1);
        this.physicsWorld.createMaterial('bouncy', 0.5, 0.9);
        // Create contact materials
        this.physicsWorld.createContactMaterial('default', 'default', 0.3, 0.3);
        this.physicsWorld.createContactMaterial('slippery', 'slippery', 0.1, 0.1);
        this.physicsWorld.createContactMaterial('bouncy', 'bouncy', 0.5, 0.9);
        this.physicsWorld.createContactMaterial('default', 'slippery', 0.2, 0.2);
        this.physicsWorld.createContactMaterial('default', 'bouncy', 0.4, 0.6);
    }
    /**
     * Update physics simulation
     */
    update(deltaTime) {
        // Step physics world
        this.physicsWorld.step(deltaTime);
        // Sync transforms if auto-sync is enabled
        if (this.autoSync) {
            this.syncTransforms();
        }
    }
    /**
     * Sync physics bodies to entity transforms
     */
    syncTransforms() {
        if (!this.world)
            return;
        const entities = this.world.getEntitiesWithComponents(PhysicsBodyComponent, TransformComponent);
        for (const entity of entities) {
            const physicsBody = entity.getComponent(PhysicsBodyComponent);
            const transform = entity.getComponent(TransformComponent);
            if (physicsBody && transform) {
                // Sync physics body -> transform
                physicsBody.syncToTransform();
            }
        }
    }
    /**
     * Sync initial transform to physics body
     */
    syncEntityToPhysics(entityId) {
        if (!this.world)
            return;
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const physicsBody = entity.getComponent(PhysicsBodyComponent);
        const transform = entity.getComponent(TransformComponent);
        if (physicsBody && transform) {
            physicsBody.syncFromTransform();
        }
    }
    /**
     * Add a physics body component to entity
     */
    addPhysicsBody(entityId, physicsBody) {
        if (!this.world)
            return;
        const entity = this.world.getEntity(entityId);
        if (!entity) {
            console.error(`[CannonPhysicsSystem] Entity not found: ${entityId}`);
            return;
        }
        // Add component to entity
        entity.addComponent(PhysicsBodyComponent, physicsBody);
        // Link with transform if available
        const transform = entity.getComponent(TransformComponent);
        if (transform) {
            physicsBody.linkTransform(transform);
            physicsBody.syncFromTransform();
        }
        // Add body to physics world
        this.physicsWorld.addBody(physicsBody.body);
        // Track entity
        this.bodyEntities.set(physicsBody.body.id, { body: physicsBody.body, entityId });
        console.log(`[CannonPhysicsSystem] Added physics body to entity: ${entityId}`);
    }
    /**
     * Remove physics body from entity
     */
    removePhysicsBody(entityId) {
        if (!this.world)
            return;
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const physicsBody = entity.getComponent(PhysicsBodyComponent);
        if (!physicsBody)
            return;
        // Remove from physics world
        this.physicsWorld.removeBody(physicsBody.body);
        // Remove from tracking
        this.bodyEntities.delete(physicsBody.body.id);
        // Remove component from entity
        entity.removeComponent(PhysicsBodyComponent);
        console.log(`[CannonPhysicsSystem] Removed physics body from entity: ${entityId}`);
    }
    /**
     * Apply force to entity
     */
    applyForce(entityId, force, worldPoint) {
        if (!this.world)
            return;
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const physicsBody = entity.getComponent(PhysicsBodyComponent);
        if (!physicsBody)
            return;
        const forceVec = new Vector3(force.x, force.y, force.z);
        const worldPointVec = worldPoint ? new Vector3(worldPoint.x, worldPoint.y, worldPoint.z) : undefined;
        physicsBody.applyForce(forceVec, worldPointVec);
    }
    /**
     * Apply impulse to entity
     */
    applyImpulse(entityId, impulse, worldPoint) {
        if (!this.world)
            return;
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const physicsBody = entity.getComponent(PhysicsBodyComponent);
        if (!physicsBody)
            return;
        const impulseVec = new Vector3(impulse.x, impulse.y, impulse.z);
        const worldPointVec = worldPoint ? new Vector3(worldPoint.x, worldPoint.y, worldPoint.z) : undefined;
        physicsBody.applyImpulse(impulseVec, worldPointVec);
    }
    /**
     * Set entity velocity
     */
    setVelocity(entityId, velocity) {
        if (!this.world)
            return;
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const physicsBody = entity.getComponent(PhysicsBodyComponent);
        if (!physicsBody)
            return;
        const velocityVec = new Vector3(velocity.x, velocity.y, velocity.z);
        physicsBody.setVelocity(velocityVec);
    }
    /**
     * Get entity velocity
     */
    getVelocity(entityId) {
        if (!this.world)
            return null;
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return null;
        const physicsBody = entity.getComponent(PhysicsBodyComponent);
        if (!physicsBody)
            return null;
        const vel = physicsBody.getVelocity();
        return { x: vel.x, y: vel.y, z: vel.z };
    }
    /**
     * Wake up entity
     */
    wakeUp(entityId) {
        if (!this.world)
            return;
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const physicsBody = entity.getComponent(PhysicsBodyComponent);
        if (!physicsBody)
            return;
        physicsBody.wakeUp();
    }
    /**
     * Put entity to sleep
     */
    sleep(entityId) {
        if (!this.world)
            return;
        const entity = this.world.getEntity(entityId);
        if (!entity)
            return;
        const physicsBody = entity.getComponent(PhysicsBodyComponent);
        if (!physicsBody)
            return;
        physicsBody.sleep();
    }
    /**
     * Raycast for collision detection
     */
    raycast(from, to) {
        const fromVec = new CANNON.Vec3(from.x, from.y, from.z);
        const toVec = new CANNON.Vec3(to.x, to.y, to.z);
        const result = this.physicsWorld.raycast(fromVec, toVec);
        if (result.hasHit) {
            return {
                hasHit: true,
                body: result.body || undefined,
                point: {
                    x: result.hitPointWorld.x,
                    y: result.hitPointWorld.y,
                    z: result.hitPointWorld.z,
                },
            };
        }
        return { hasHit: false };
    }
    /**
     * Get entity by physics body ID
     */
    getEntityByBodyId(bodyId) {
        const tracked = this.bodyEntities.get(bodyId);
        return tracked?.entityId || null;
    }
    /**
     * Access to physics world for advanced usage
     */
    getPhysicsWorld() {
        return this.physicsWorld;
    }
    /**
     * Get physics statistics
     */
    getStats() {
        const worldStats = this.physicsWorld.getStats();
        return {
            ...worldStats,
            entities: this.bodyEntities.size,
        };
    }
    /**
     * Clean up system
     */
    dispose() {
        // Remove all physics bodies from entities
        if (this.world) {
            const entities = this.world.getEntitiesWithComponents(PhysicsBodyComponent);
            for (const entity of entities) {
                this.removePhysicsBody(entity.id);
            }
        }
        // Dispose physics world
        this.physicsWorld.dispose();
        // Clear tracking
        this.bodyEntities.clear();
        console.log('[CannonPhysicsSystem] Disposed');
    }
}
