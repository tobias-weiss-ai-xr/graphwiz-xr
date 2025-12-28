/**
 * Collision Components
 *
 * Components for collision detection and response.
 */

import { ComponentClass } from '../ecs/entity';
import { Vector3 } from 'three';

/**
 * Trigger component - detects overlap without physical response
 */
export class TriggerComponent {
  private overlaps: Set<string> = new Set();
  private onEnterCallbacks: Array<(entityId: string) => void> = [];
  private onExitCallbacks: Array<(entityId: string) => void> = [];
  private onStayCallbacks: Array<(entityId: string) => void> = [];

  constructor(
    public layers: string[] = ['default'],
    public once: boolean = false
  ) {}

  /**
   * Register callback for trigger enter
   */
  onEnter(callback: (entityId: string) => void): void {
    this.onEnterCallbacks.push(callback);
  }

  /**
   * Register callback for trigger exit
   */
  onExit(callback: (entityId: string) => void): void {
    this.onExitCallbacks.push(callback);
  }

  /**
   * Register callback for trigger stay (every frame while overlapping)
   */
  onStay(callback: (entityId: string) => void): void {
    this.onStayCallbacks.push(callback);
  }

  /**
   * Add overlapping entity
   */
  addOverlap(entityId: string): void {
    if (!this.overlaps.has(entityId)) {
      this.overlaps.add(entityId);
      this.onEnterCallbacks.forEach((cb) => cb(entityId));
    }
  }

  /**
   * Remove overlapping entity
   */
  removeOverlap(entityId: string): void {
    if (this.overlaps.has(entityId)) {
      this.overlaps.delete(entityId);
      this.onExitCallbacks.forEach((cb) => cb(entityId));
    }
  }

  /**
   * Update stay callbacks
   */
  updateStay(): void {
    this.overlaps.forEach((entityId) => {
      this.onStayCallbacks.forEach((cb) => cb(entityId));
    });
  }

  /**
   * Get overlapping entities
   */
  getOverlaps(): string[] {
    return Array.from(this.overlaps);
  }

  /**
   * Check if overlapping specific entity
   */
  isOverlapping(entityId: string): boolean {
    return this.overlaps.has(entityId);
  }

  /**
   * Clear all overlaps
   */
  clear(): void {
    this.overlaps.clear();
  }
}

/**
 * Collision filter component - controls which layers to collide with
 */
export class CollisionFilterComponent {
  constructor(
    public layer: string = 'default',
    public mask: string[] = ['default']
  ) {}

  /**
   * Check if should collide with another layer
   */
  shouldCollide(otherLayer: string): boolean {
    return this.mask.includes(otherLayer);
  }

  /**
   * Add layer to collision mask
   */
  addLayer(layer: string): void {
    if (!this.mask.includes(layer)) {
      this.mask.push(layer);
    }
  }

  /**
   * Remove layer from collision mask
   */
  removeLayer(layer: string): void {
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
  public lastResult: {
    hasHit: boolean;
    point?: Vector3;
    normal?: Vector3;
    distance?: number;
    entity?: string;
  } = { hasHit: false };

  constructor(
    public direction: Vector3 = new Vector3(0, -1, 0),
    public maxDistance: number = 10,
    public layers: string[] = ['default'],
    public debug: boolean = false
  ) {}

  /**
   * Set ray direction
   */
  setDirection(x: number, y: number, z: number): void {
    this.direction.set(x, y, z).normalize();
  }

  /**
   * Set ray from two points
   */
  setFromPoints(from: Vector3, to: Vector3): void {
    this.direction.subVectors(to, from).normalize();
  }

  /**
   * Update raycast result
   */
  updateResult(result: {
    hasHit: boolean;
    point?: Vector3;
    normal?: Vector3;
    distance?: number;
    entity?: string;
  }): void {
    this.lastResult = result;
  }

  /**
   * Check if ray hit something
   */
  hasHit(): boolean {
    return this.lastResult.hasHit;
  }

  /**
   * Get hit point
   */
  getHitPoint(): Vector3 | null {
    return this.lastResult.point || null;
  }

  /**
   * Get hit normal
   */
  getHitNormal(): Vector3 | null {
    return this.lastResult.normal || null;
  }

  /**
   * Get hit distance
   */
  getHitDistance(): number | null {
    return this.lastResult.distance || null;
  }
}

/**
 * Character controller component - for player movement
 */
export class CharacterControllerComponent {
  public isGrounded = false;
  public isJumping = false;
  public isSprinting = false;

  constructor(
    public moveSpeed: number = 5,
    public jumpForce: number = 5,
    public sprintMultiplier: number = 1.5,
    public airControl: number = 0.3,
    public groundCheckDistance: number = 0.1
  ) {}

  /**
   * Get current move speed
   */
  getCurrentSpeed(): number {
    return this.isSprinting ? this.moveSpeed * this.sprintMultiplier : this.moveSpeed;
  }

  /**
   * Check if can jump
   */
  canJump(): boolean {
    return this.isGrounded && !this.isJumping;
  }

  /**
   * Set grounded state
   */
  setGrounded(grounded: boolean): void {
    this.isGrounded = grounded;
  }

  /**
   * Set jumping state
   */
  setJumping(jumping: boolean): void {
    this.isJumping = jumping;
    if (!jumping) {
      this.isGrounded = false;
    }
  }

  /**
   * Set sprinting state
   */
  setSprinting(sprinting: boolean): void {
    this.isSprinting = sprinting;
  }

  /**
   * Toggle sprint
   */
  toggleSprint(): void {
    this.isSprinting = !this.isSprinting;
  }
}
