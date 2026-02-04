/**
 * Collision Components
 *
 * Components for collision detection and response.
 */
import { Vector3 } from 'three';
/**
 * Trigger component - detects overlap without physical response
 */
export class TriggerComponent {
    constructor(layers = ['default'], once = false) {
        this.layers = layers;
        this.once = once;
        this.overlaps = new Set();
        this.onEnterCallbacks = [];
        this.onExitCallbacks = [];
        this.onStayCallbacks = [];
    }
    /**
     * Register callback for trigger enter
     */
    onEnter(callback) {
        this.onEnterCallbacks.push(callback);
    }
    /**
     * Register callback for trigger exit
     */
    onExit(callback) {
        this.onExitCallbacks.push(callback);
    }
    /**
     * Register callback for trigger stay (every frame while overlapping)
     */
    onStay(callback) {
        this.onStayCallbacks.push(callback);
    }
    /**
     * Add overlapping entity
     */
    addOverlap(entityId) {
        if (!this.overlaps.has(entityId)) {
            this.overlaps.add(entityId);
            this.onEnterCallbacks.forEach((cb) => cb(entityId));
        }
    }
    /**
     * Remove overlapping entity
     */
    removeOverlap(entityId) {
        if (this.overlaps.has(entityId)) {
            this.overlaps.delete(entityId);
            this.onExitCallbacks.forEach((cb) => cb(entityId));
        }
    }
    /**
     * Update stay callbacks
     */
    updateStay() {
        this.overlaps.forEach((entityId) => {
            this.onStayCallbacks.forEach((cb) => cb(entityId));
        });
    }
    /**
     * Get overlapping entities
     */
    getOverlaps() {
        return Array.from(this.overlaps);
    }
    /**
     * Check if overlapping specific entity
     */
    isOverlapping(entityId) {
        return this.overlaps.has(entityId);
    }
    /**
     * Clear all overlaps
     */
    clear() {
        this.overlaps.clear();
    }
}
/**
 * Collision filter component - controls which layers to collide with
 */
export class CollisionFilterComponent {
    constructor(layer = 'default', mask = ['default']) {
        this.layer = layer;
        this.mask = mask;
    }
    /**
     * Check if should collide with another layer
     */
    shouldCollide(otherLayer) {
        return this.mask.includes(otherLayer);
    }
    /**
     * Add layer to collision mask
     */
    addLayer(layer) {
        if (!this.mask.includes(layer)) {
            this.mask.push(layer);
        }
    }
    /**
     * Remove layer from collision mask
     */
    removeLayer(layer) {
        const index = this.mask.indexOf(layer);
        if (index > -1) {
            this.mask.splice(index, 1);
        }
    }
}
/**
 * Raycast component - performs raycast queries
 */
export class RaycastComponent {
    constructor(direction = new Vector3(0, -1, 0), maxDistance = 10, layers = ['default'], debug = false) {
        this.direction = direction;
        this.maxDistance = maxDistance;
        this.layers = layers;
        this.debug = debug;
        this.lastResult = { hasHit: false };
    }
    /**
     * Set ray direction
     */
    setDirection(x, y, z) {
        this.direction.set(x, y, z).normalize();
    }
    /**
     * Set ray from two points
     */
    setFromPoints(from, to) {
        this.direction.subVectors(to, from).normalize();
    }
    /**
     * Update raycast result
     */
    updateResult(result) {
        this.lastResult = result;
    }
    /**
     * Check if ray hit something
     */
    hasHit() {
        return this.lastResult.hasHit;
    }
    /**
     * Get hit point
     */
    getHitPoint() {
        return this.lastResult.point || null;
    }
    /**
     * Get hit normal
     */
    getHitNormal() {
        return this.lastResult.normal || null;
    }
    /**
     * Get hit distance
     */
    getHitDistance() {
        return this.lastResult.distance || null;
    }
}
/**
 * Character controller component - for player movement
 */
export class CharacterControllerComponent {
    constructor(moveSpeed = 5, jumpForce = 5, sprintMultiplier = 1.5, airControl = 0.3, groundCheckDistance = 0.1) {
        this.moveSpeed = moveSpeed;
        this.jumpForce = jumpForce;
        this.sprintMultiplier = sprintMultiplier;
        this.airControl = airControl;
        this.groundCheckDistance = groundCheckDistance;
        this.isGrounded = false;
        this.isJumping = false;
        this.isSprinting = false;
    }
    /**
     * Get current move speed
     */
    getCurrentSpeed() {
        return this.isSprinting ? this.moveSpeed * this.sprintMultiplier : this.moveSpeed;
    }
    /**
     * Check if can jump
     */
    canJump() {
        return this.isGrounded && !this.isJumping;
    }
    /**
     * Set grounded state
     */
    setGrounded(grounded) {
        this.isGrounded = grounded;
    }
    /**
     * Set jumping state
     */
    setJumping(jumping) {
        this.isJumping = jumping;
        if (!jumping) {
            this.isGrounded = false;
        }
    }
    /**
     * Set sprinting state
     */
    setSprinting(sprinting) {
        this.isSprinting = sprinting;
    }
    /**
     * Toggle sprint
     */
    toggleSprint() {
        this.isSprinting = !this.isSprinting;
    }
}
