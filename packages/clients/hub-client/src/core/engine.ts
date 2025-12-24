/**
 * Core Engine
 *
 * Main entry point for the GraphWiz-XR client engine.
 * Manages the ECS world, renderer, and systems.
 */

import { World } from '../ecs/world';
import { TransformSystem } from '../ecs/systems/transform-system';
import type { EngineConfig } from './config';

export class Engine {
  private world: World;
  private isRunning = false;
  private animationFrameId: number | null = null;
  private lastTime = 0;

  constructor(config: Partial<EngineConfig> = {}) {
    void config; // Unused for now
    this.world = new World();
    this.initializeSystems();
  }

  private initializeSystems(): void {
    // Core systems
    this.world.addSystem(new TransformSystem());
  }

  /**
   * Start the engine
   */
  start(): void {
    if (this.isRunning) {
      console.warn('[Engine] Already running');
      return;
    }

    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick();

    console.log('[Engine] Started');
  }

  /**
   * Stop the engine
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    console.log('[Engine] Stopped');
  }

  /**
   * Main game loop
   */
  private tick = (): void => {
    if (!this.isRunning) {
      return;
    }

    const now = performance.now();
    const deltaTime = (now - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = now;

    // Update world
    this.world.update(deltaTime);

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  /**
   * Get the ECS world
   */
  getWorld(): World {
    return this.world;
  }

  /**
   * Check if engine is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    this.world.dispose();
  }
}

