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
import { createLogger } from '@graphwiz/types';
const logger = createLogger('Engine');
export class Engine {
    constructor(config = {}) {
        this.isRunning = false;
        this.animationFrameId = null;
        this.lastTime = 0;
        /**
         * Main game loop
         */
        this.tick = () => {
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
        void config; // Unused for now
        this.world = new World();
        this.audioSystem = new AudioSystem();
        this.billboardSystem = new BillboardSystem();
        this.initializeSystems();
    }
    initializeSystems() {
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
    async start() {
        if (this.isRunning) {
            logger.warn('[Engine] Already running');
            return;
        }
        // Initialize audio
        this.audioSystem.initializeAudio();
        this.isRunning = true;
        this.lastTime = performance.now();
        this.tick();
        logger.info('[Engine] Started');
    }
    /**
     * Stop the engine
     */
    stop() {
        if (!this.isRunning) {
            return;
        }
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.isRunning = false;
        logger.info('[Engine] Stopped');
    }
    /**
     * Get the ECS world
     */
    getWorld() {
        return this.world;
    }
    /**
     * Get the audio system
     */
    getAudioSystem() {
        return this.audioSystem;
    }
    /**
     * Get the billboard system
     */
    getBillboardSystem() {
        return this.billboardSystem;
    }
    /**
     * Get the asset loader
     */
    getAssetLoader() {
        return assetLoader;
    }
    /**
     * Check if engine is running
     */
    isActive() {
        return this.isRunning;
    }
    /**
     * Clean up resources
     */
    dispose() {
        this.stop();
        this.world.dispose();
        assetLoader.clearCache();
    }
}
