/**
 * Core Engine
 *
 * Main entry point for the GraphWiz-XR client engine.
 * Manages the ECS world, renderer, and systems.
 */

import { AnimationSystem } from '../ecs/systems/animation-system';
import { AudioSystem } from '../ecs/systems/audio-system';
import { BillboardSystem } from '../ecs/systems/billboard-system';
import { PhysicsSystem } from '../ecs/systems/physics-system';
import { TransformSystem } from '../ecs/systems/transform-system';
import { World } from '../ecs/world';
import { assetLoader } from './assets';
import type { EngineConfig } from './config';
import { createLogger, LogLevel } from '@graphwiz/types';

const logger = createLogger('Engine');

export class Engine {
  private world: World;
  private isRunning = false;
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private audioSystem: AudioSystem;
  private billboardSystem: BillboardSystem;

  constructor(config: Partial<EngineConfig> = {}) {
    void config; // Unused for now
    this.world = new World();
    this.audioSystem = new AudioSystem();
    this.billboardSystem = new BillboardSystem();
    this.initializeSystems();
  }

  private initializeSystems(): void {
    // Core systems - order matters!
    this.world.addSystem(new TransformSystem());
    this.world.addSystem(new PhysicsSystem());
    this.world.addSystem(new AnimationSystem());
    this.world.addSystem(this.audioSystem);
    this.world.addSystem(this.billboardSystem);
  }

  /**
   * Start the engine
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('[Engine] Already running');
      return;
    }

    // Initialize audio
    this.audioSystem.initializeAudio();

    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick();

    logger.log('[Engine] Started');
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

    logger.log('[Engine] Stopped');
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
  };

  /**
   * Get the ECS world
   */
  getWorld(): World {
    return this.world;
  }

  /**
   * Get the audio system
   */
  getAudioSystem(): AudioSystem {
    return this.audioSystem;
  }

  /**
   * Get the billboard system
   */
  getBillboardSystem(): BillboardSystem {
    return this.billboardSystem;
  }

  /**
   * Get the asset loader
   */
  getAssetLoader(): typeof assetLoader {
    return assetLoader;
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
    assetLoader.clearCache();
  }
}
