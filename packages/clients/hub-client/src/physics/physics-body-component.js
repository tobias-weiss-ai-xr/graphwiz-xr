/**
 * Physics Body Component
 *
 * Links ECS entities to Cannon.js physics bodies.
 */
import * as CANNON from 'cannon-es';
import { Vector3, Quaternion, Euler } from 'three';
export class PhysicsBodyComponent {
    constructor(config) {
        this.transform = null;
        this.initialized = false;
        const { mass = 1, shape, size = new Vector3(1, 1, 1), radius = 0.5, height = 1, material: _material = 'default', friction = 0.3, restitution = 0.3, linearDamping = 0.01, angularDamping = 0.01, isTrigger = false, isStatic = false, } = config;
        // Create body
        const bodyConfig = isStatic
            ? { type: CANNON.Body.STATIC, mass: 0 }
            : { type: CANNON.Body.DYNAMIC, mass };
        this.body = new CANNON.Body(bodyConfig);
        // Add shape
        const shapeConfig = this.createShape(shape, size, radius, height);
        this.body.addShape(shapeConfig);
        // Set material properties
        this.body.material = new CANNON.Material();
        this.body.material.friction = friction;
        this.body.material.restitution = restitution;
        // Set damping
        this.body.linearDamping = linearDamping;
        this.body.angularDamping = angularDamping;
        // Trigger configuration
        if (isTrigger) {
            this.body.isTrigger = true;
        }
        // Collision event handlers
        this.setupCollisionHandlers();
    }
    /**
     * Create Cannon.js shape
     */
    createShape(type, size, radius, height) {
        switch (type) {
            case 'box':
                return new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
            case 'sphere':
                return new CANNON.Sphere(radius);
            case 'cylinder':
                return new CANNON.Cylinder(radius, radius, height, 16);
            case 'plane':
                return new CANNON.Plane();
            case 'particle':
                return new CANNON.Particle();
            default:
                console.warn(`[PhysicsBodyComponent] Unsupported shape: ${type}, using box`);
                return new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
        }
    }
    /**
     * Link to ECS transform component
     */
    linkTransform(transform) {
        this.transform = transform;
        // Sync initial transform
        this.syncFromTransform();
        this.initialized = true;
    }
    /**
     * Sync physics body position from transform
     */
    syncFromTransform() {
        if (!this.transform)
            return;
        this.body.position.set(this.transform.position.x, this.transform.position.y, this.transform.position.z);
        const quaternion = new Quaternion();
        quaternion.setFromEuler(new Euler(this.transform.rotation.x, this.transform.rotation.y, this.transform.rotation.z));
        this.body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    }
    /**
     * Sync transform from physics body
     */
    syncToTransform() {
        if (!this.transform)
            return;
        this.transform.position.set(this.body.position.x, this.body.position.y, this.body.position.z);
        const euler = new Euler();
        const quaternion = new Quaternion(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w);
        euler.setFromQuaternion(quaternion);
        this.transform.rotation.set(euler.x, euler.y, euler.z);
    }
    /**
     * Apply force to body
     */
    applyForce(force, worldPoint) {
        const f = new CANNON.Vec3(force.x, force.y, force.z);
        const p = worldPoint
            ? new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z)
            : this.body.position;
        this.body.applyForce(f, p);
    }
    /**
     * Apply impulse to body
     */
    applyImpulse(impulse, worldPoint) {
        const i = new CANNON.Vec3(impulse.x, impulse.y, impulse.z);
        const p = worldPoint
            ? new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z)
            : this.body.position;
        this.body.applyImpulse(i, p);
    }
    /**
     * Apply torque to body
     */
    applyTorque(torque) {
        this.body.torque.set(torque.x, torque.y, torque.z);
        this.body.wakeUp();
    }
    /**
     * Set velocity
     */
    setVelocity(velocity) {
        this.body.velocity.set(velocity.x, velocity.y, velocity.z);
        this.body.wakeUp();
    }
    /**
     * Get velocity
     */
    getVelocity() {
        return new Vector3(this.body.velocity.x, this.body.velocity.y, this.body.velocity.z);
    }
    /**
     * Set angular velocity
     */
    setAngularVelocity(velocity) {
        this.body.angularVelocity.set(velocity.x, velocity.y, velocity.z);
        this.body.wakeUp();
    }
    /**
     * Get angular velocity
     */
    getAngularVelocity() {
        return new Vector3(this.body.angularVelocity.x, this.body.angularVelocity.y, this.body.angularVelocity.z);
    }
    /**
     * Wake up the body
     */
    wakeUp() {
        this.body.wakeUp();
    }
    /**
     * Put body to sleep
     */
    sleep() {
        this.body.sleep();
    }
    /**
     * Check if body is sleeping
     */
    isSleeping() {
        return this.body.sleepState === CANNON.Body.SLEEPING;
    }
    /**
     * Setup collision event handlers
     */
    setupCollisionHandlers() {
        this.body.addEventListener('collide', (event) => {
            const { body, contact } = event;
            // Emit collision event
            this.emit?.('collide', {
                otherBody: body,
                contact,
                normal: contact.ni,
                depth: contact.getDistance(),
            });
        });
    }
    /**
     * Check if initialized and linked to transform
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Dispose of physics body
     */
    dispose() {
        this.initialized = false;
        this.transform = null;
    }
}
