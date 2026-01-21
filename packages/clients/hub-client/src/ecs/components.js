/**
 * ECS Components
 *
 * Reusable components for entities in the 3D scene.
 */
import { Vector3, Euler, Color } from 'three';
/**
 * Transform component - position, rotation, scale
 */
export class TransformComponent {
    constructor(position = new Vector3(0, 0, 0), rotation = new Euler(0, 0, 0), scale = new Vector3(1, 1, 1)) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }
    /**
     * Copy from another transform
     */
    copy(other) {
        this.position.copy(other.position);
        this.rotation.copy(other.rotation);
        this.scale.copy(other.scale);
    }
    /**
     * Clone this transform
     */
    clone() {
        return new TransformComponent(this.position.clone(), this.rotation.clone(), this.scale.clone());
    }
}
/**
 * Physics component - for physics simulation
 */
export class PhysicsComponent {
    constructor(mass = 1, velocity = new Vector3(0, 0, 0), angularVelocity = new Vector3(0, 0, 0), isStatic = false, isKinematic = false, friction = 0.5, restitution = 0.3, linearDamping = 0.01, angularDamping = 0.01) {
        this.mass = mass;
        this.velocity = velocity;
        this.angularVelocity = angularVelocity;
        this.isStatic = isStatic;
        this.isKinematic = isKinematic;
        this.friction = friction;
        this.restitution = restitution;
        this.linearDamping = linearDamping;
        this.angularDamping = angularDamping;
    }
}
/**
 * Collider component - defines collision shape
 */
export class ColliderComponent {
    constructor(shape = 'box', size = new Vector3(1, 1, 1), radius = 0.5, height = 1, isTrigger = false) {
        this.shape = shape;
        this.size = size;
        this.radius = radius;
        this.height = height;
        this.isTrigger = isTrigger;
    }
}
/**
 * Audio component - for 3D spatial audio
 */
export class AudioComponent {
    constructor(url, volume = 1, spatial = true, autoplay = false, distance = 10, maxDistance = 100) {
        this.url = url;
        this.volume = volume;
        this.spatial = spatial;
        this.autoplay = autoplay;
        this.distance = distance;
        this.maxDistance = maxDistance;
        this.audio = null;
        this.gainNode = null;
        this.pannerNode = null;
        this.isPlaying = false;
        this.isLooping = false;
    }
    /**
     * Initialize audio with Web Audio API
     */
    async initialize() {
        if (this.audio)
            return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                console.warn('[AudioComponent] Web Audio API not supported');
                return;
            }
            const audioContext = new AudioContext();
            // Create audio element
            this.audio = new Audio(this.url);
            this.audio.loop = this.isLooping;
            // Create nodes
            this.gainNode = audioContext.createGain();
            this.gainNode.gain.value = this.volume;
            if (this.spatial) {
                this.pannerNode = audioContext.createPanner();
                this.pannerNode.refDistance = this.distance;
                this.pannerNode.maxDistance = this.maxDistance;
                this.pannerNode.panningModel = 'HRTF';
            }
            // Connect nodes
            const source = audioContext.createMediaElementSource(this.audio);
            if (this.pannerNode && this.spatial) {
                source.connect(this.gainNode);
                this.gainNode.connect(this.pannerNode);
                this.pannerNode.connect(audioContext.destination);
            }
            else {
                source.connect(this.gainNode);
                this.gainNode.connect(audioContext.destination);
            }
            if (this.autoplay) {
                await this.play();
            }
        }
        catch (error) {
            console.error('[AudioComponent] Failed to initialize audio:', error);
        }
    }
    /**
     * Play audio
     */
    async play() {
        if (!this.audio)
            await this.initialize();
        if (this.audio && !this.isPlaying) {
            try {
                await this.audio.play();
                this.isPlaying = true;
            }
            catch (error) {
                console.error('[AudioComponent] Failed to play:', error);
            }
        }
    }
    /**
     * Pause audio
     */
    pause() {
        if (this.audio && this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        }
    }
    /**
     * Stop audio
     */
    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.isPlaying = false;
        }
    }
    /**
     * Set volume
     */
    setVolume(volume) {
        this.volume = volume;
        if (this.gainNode) {
            this.gainNode.gain.value = volume;
        }
    }
    /**
     * Update position for spatial audio
     */
    setPosition(position) {
        if (this.pannerNode) {
            this.pannerNode.positionX.value = position.x;
            this.pannerNode.positionY.value = position.y;
            this.pannerNode.positionZ.value = position.z;
        }
    }
    /**
     * Clean up resources
     */
    dispose() {
        this.stop();
        this.audio = null;
        this.gainNode = null;
        this.pannerNode = null;
    }
}
/**
 * Animation component - for skeletal and mesh animations
 */
export class AnimationComponent {
    constructor(clips = [], autoplay = null, loop = true, timeScale = 1) {
        this.clips = clips;
        this.autoplay = autoplay;
        this.loop = loop;
        this.timeScale = timeScale;
        this.animations = new Map();
        this.mixer = null;
        this.actions = new Map();
        this.currentAction = null;
        // Store animation clips
        for (const clip of clips) {
            this.animations.set(clip.name, clip);
        }
    }
    /**
     * Initialize with root object
     */
    initialize(root) {
        const THREE = window.THREE || require('three');
        this.mixer = new THREE.AnimationMixer(root);
        // Create actions for all clips
        for (const clip of this.clips) {
            const action = this.mixer.clipAction(clip);
            action.setLoop(this.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
            this.actions.set(clip.name, action);
        }
        // Autoplay if specified
        if (this.autoplay) {
            this.play(this.autoplay);
        }
    }
    /**
     * Play an animation by name
     */
    play(name, fadeIn = 0.2) {
        const action = this.actions.get(name);
        if (!action) {
            console.warn(`[AnimationComponent] Animation not found: ${name}`);
            return;
        }
        // Fade out current action
        if (this.currentAction && this.currentAction !== action) {
            this.currentAction.fadeOut(fadeIn);
        }
        // Play new action
        action.reset().fadeIn(fadeIn).play();
        this.currentAction = action;
    }
    /**
     * Stop all animations
     */
    stop(fadeOut = 0.2) {
        if (this.currentAction) {
            this.currentAction.fadeOut(fadeOut);
            this.currentAction = null;
        }
    }
    /**
     * Pause current animation
     */
    pause() {
        if (this.currentAction) {
            this.currentAction.paused = true;
        }
    }
    /**
     * Resume current animation
     */
    resume() {
        if (this.currentAction) {
            this.currentAction.paused = false;
        }
    }
    /**
     * Update animation mixer
     */
    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }
    /**
     * Set time scale for animation speed
     */
    setTimeScale(scale) {
        this.timeScale = scale;
        if (this.currentAction) {
            this.currentAction.setEffectiveTimeScale(scale);
        }
    }
    /**
     * Clean up resources
     */
    dispose() {
        this.stop();
        this.mixer = null;
        this.actions.clear();
        this.animations.clear();
    }
}
/**
 * Model component - for 3D model loading
 */
export class ModelComponent {
    constructor(url, castShadow = true, receiveShadow = true) {
        this.url = url;
        this.castShadow = castShadow;
        this.receiveShadow = receiveShadow;
        this.gltf = null;
        this.isLoading = false;
        this.isLoaded = false;
        this.loadPromise = null;
    }
    /**
     * Load the model
     */
    async load() {
        if (this.loadPromise) {
            return this.loadPromise;
        }
        if (this.isLoaded) {
            return this.gltf;
        }
        this.isLoading = true;
        this.loadPromise = (async () => {
            try {
                const THREE = window.THREE || require('three');
                // @ts-expect-error - three/examples/jsm modules don't have type declarations
                const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
                const loader = new GLTFLoader();
                this.gltf = await new Promise((resolve, reject) => {
                    loader.load(this.url, (gltf) => resolve(gltf), undefined, (error) => reject(error));
                });
                // Configure shadows
                if (this.gltf) {
                    this.gltf.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = this.castShadow;
                            child.receiveShadow = this.receiveShadow;
                        }
                    });
                }
                this.isLoaded = true;
                this.isLoading = false;
                console.log(`[ModelComponent] Loaded model: ${this.url}`);
                return this.gltf;
            }
            catch (error) {
                console.error(`[ModelComponent] Failed to load model: ${this.url}`, error);
                this.isLoading = false;
                return null;
            }
        })();
        return this.loadPromise;
    }
    /**
     * Clone the model scene
     */
    cloneScene() {
        if (!this.gltf)
            return null;
        return this.gltf.scene.clone();
    }
    /**
     * Clean up resources
     */
    dispose() {
        if (this.gltf) {
            const THREE = window.THREE || require('three');
            // Dispose all geometries and materials
            this.gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach((m) => m.dispose());
                    }
                    else {
                        child.material.dispose();
                    }
                }
            });
            this.gltf = null;
        }
        this.isLoaded = false;
    }
}
/**
 * Light component - for scene lighting
 */
export class LightComponent {
    constructor(type = 'point', color = new Color(0xffffff), intensity = 1, distance = 0, decay = 2, angle = Math.PI / 3, penumbra = 0, castShadow = false, shadowMapSize = 1024) {
        this.type = type;
        this.color = color;
        this.intensity = intensity;
        this.distance = distance;
        this.decay = decay;
        this.angle = angle;
        this.penumbra = penumbra;
        this.castShadow = castShadow;
        this.shadowMapSize = shadowMapSize;
    }
}
/**
 * Camera component - for viewport/camera control
 */
export class CameraComponent {
    constructor(fov = 75, near = 0.1, far = 1000, isActive = false, controls = 'none') {
        this.fov = fov;
        this.near = near;
        this.far = far;
        this.isActive = isActive;
        this.controls = controls;
    }
}
/**
 * Network sync component - for synchronizing entities over network
 */
export class NetworkSyncComponent {
    constructor(networkId, isOwner = false, syncRate = 30, // sync frequency in Hz
    lastSyncTime = 0) {
        this.networkId = networkId;
        this.isOwner = isOwner;
        this.syncRate = syncRate;
        this.lastSyncTime = lastSyncTime;
    }
}
/**
 * Interactable component - for user interaction
 */
export class InteractableComponent {
    constructor(isInteractable = true, hoverCursor = 'pointer', onClick = null, onHover = null, onDrag = null) {
        this.isInteractable = isInteractable;
        this.hoverCursor = hoverCursor;
        this.onClick = onClick;
        this.onHover = onHover;
        this.onDrag = onDrag;
    }
}
/**
 * Billboard component - always face camera
 */
export class BillboardComponent {
    constructor(lockX = false, lockY = false, lockZ = false) {
        this.lockX = lockX;
        this.lockY = lockY;
        this.lockZ = lockZ;
    }
}
/**
 * Particle component - for particle effects
 */
export class ParticleComponent {
    constructor(count = 100, lifetime = 1, rate = 10, size = 0.1, color = new Color(1, 1, 1), velocity = new Vector3(0, 1, 0), acceleration = new Vector3(0, -9.8, 0)) {
        this.count = count;
        this.lifetime = lifetime;
        this.rate = rate;
        this.size = size;
        this.color = color;
        this.velocity = velocity;
        this.acceleration = acceleration;
    }
}
/**
 * Grabbable component - for objects that can be grabbed and moved
 */
export class GrabbableComponent {
    constructor(mass = 1, breakawayForce = 100, // force required to pull from another player
    maxThrowSpeed = 20, canBeThrown = true) {
        this.mass = mass;
        this.breakawayForce = breakawayForce;
        this.maxThrowSpeed = maxThrowSpeed;
        this.canBeThrown = canBeThrown;
        this.isGrabbed = false;
        this.grabbedBy = null; // clientId of who grabbed it
        this.grabOffset = new Vector3(0, 0, 0);
        this.grabDistance = 2; // distance from player when grabbed
        this.throwVelocity = new Vector3(0, 0, 0);
        this.lastPosition = new Vector3(0, 0, 0);
        this.velocitySamples = [];
    }
    /**
     * Called when object is grabbed
     */
    onGrab(clientId, offset) {
        this.isGrabbed = true;
        this.grabbedBy = clientId;
        this.grabOffset.copy(offset);
        this.velocitySamples = [];
    }
    /**
     * Called when object is released
     */
    onRelease() {
        this.isGrabbed = false;
        this.grabbedBy = null;
        // Calculate throw velocity from recent position samples
        if (this.velocitySamples.length >= 2 && this.canBeThrown) {
            const latest = this.velocitySamples[this.velocitySamples.length - 1];
            const oldest = this.velocitySamples[0];
            const dt = (this.velocitySamples.length - 1) * 0.016; // assuming 60fps
            this.throwVelocity.set((latest.x - oldest.x) / dt, (latest.y - oldest.y) / dt, (latest.z - oldest.z) / dt);
            // Clamp throw velocity
            const speed = this.throwVelocity.length();
            if (speed > this.maxThrowSpeed) {
                this.throwVelocity.multiplyScalar(this.maxThrowSpeed / speed);
            }
        }
        else {
            this.throwVelocity.set(0, 0, 0);
        }
        this.velocitySamples = [];
    }
    /**
     * Update velocity samples for throw calculation
     */
    recordPosition(position) {
        this.lastPosition.copy(position);
        this.velocitySamples.push(position.clone());
        // Keep only last 10 samples (approx 160ms at 60fps)
        if (this.velocitySamples.length > 10) {
            this.velocitySamples.shift();
        }
    }
}
