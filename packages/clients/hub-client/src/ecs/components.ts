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
  constructor(
    public position: Vector3 = new Vector3(0, 0, 0),
    public rotation: Euler = new Euler(0, 0, 0),
    public scale: Vector3 = new Vector3(1, 1, 1)
  ) {}

  /**
   * Copy from another transform
   */
  copy(other: TransformComponent): void {
    this.position.copy(other.position);
    this.rotation.copy(other.rotation);
    this.scale.copy(other.scale);
  }

  /**
   * Clone this transform
   */
  clone(): TransformComponent {
    return new TransformComponent(
      this.position.clone(),
      this.rotation.clone(),
      this.scale.clone()
    );
  }
}

/**
 * Physics component - for physics simulation
 */
export class PhysicsComponent {
  constructor(
    public mass: number = 1,
    public velocity: Vector3 = new Vector3(0, 0, 0),
    public angularVelocity: Vector3 = new Vector3(0, 0, 0),
    public isStatic: boolean = false,
    public isKinematic: boolean = false,
    public friction: number = 0.5,
    public restitution: number = 0.3,
    public linearDamping: number = 0.01,
    public angularDamping: number = 0.01
  ) {}
}

/**
 * Collider component - defines collision shape
 */
export class ColliderComponent {
  constructor(
    public shape: 'box' | 'sphere' | 'capsule' | 'cylinder' | 'mesh' = 'box',
    public size: Vector3 = new Vector3(1, 1, 1),
    public radius: number = 0.5,
    public height: number = 1,
    public isTrigger: boolean = false
  ) {}
}

/**
 * Audio component - for 3D spatial audio
 */
export class AudioComponent {
  private audio: HTMLAudioElement | null = null;
  private gainNode: GainNode | null = null;
  private pannerNode: PannerNode | null = null;
  private isPlaying = false;
  private isLooping = false;

  constructor(
    public url: string,
    public volume: number = 1,
    public spatial: boolean = true,
    public autoplay: boolean = false,
    public distance: number = 10,
    public maxDistance: number = 100
  ) {}

  /**
   * Initialize audio with Web Audio API
   */
  async initialize(): Promise<void> {
    if (this.audio) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
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
        (this.pannerNode as any).panningModel = 'HRTF';
      }

      // Connect nodes
      const source = audioContext.createMediaElementSource(this.audio);

      if (this.pannerNode && this.spatial) {
        source.connect(this.gainNode);
        this.gainNode.connect(this.pannerNode);
        this.pannerNode.connect(audioContext.destination);
      } else {
        source.connect(this.gainNode);
        this.gainNode.connect(audioContext.destination);
      }

      if (this.autoplay) {
        await this.play();
      }
    } catch (error) {
      console.error('[AudioComponent] Failed to initialize audio:', error);
    }
  }

  /**
   * Play audio
   */
  async play(): Promise<void> {
    if (!this.audio) await this.initialize();

    if (this.audio && !this.isPlaying) {
      try {
        await this.audio.play();
        this.isPlaying = true;
      } catch (error) {
        console.error('[AudioComponent] Failed to play:', error);
      }
    }
  }

  /**
   * Pause audio
   */
  pause(): void {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Stop audio
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }

  /**
   * Set volume
   */
  setVolume(volume: number): void {
    this.volume = volume;
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  /**
   * Update position for spatial audio
   */
  setPosition(position: Vector3): void {
    if (this.pannerNode) {
      this.pannerNode.positionX.value = position.x;
      this.pannerNode.positionY.value = position.y;
      this.pannerNode.positionZ.value = position.z;
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
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
  private animations = new Map<string, any>();
  private mixer: any = null;
  private actions = new Map<string, any>();
  private currentAction: any = null;

  constructor(
    public clips: any[] = [],
    public autoplay: string | null = null,
    public loop: boolean = true,
    public timeScale: number = 1
  ) {
    // Store animation clips
    for (const clip of clips) {
      this.animations.set(clip.name, clip);
    }
  }

  /**
   * Initialize with root object
   */
  initialize(root: any): void {
    const THREE = (window as any).THREE || require('three');
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
  play(name: string, fadeIn: number = 0.2): void {
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
  stop(fadeOut: number = 0.2): void {
    if (this.currentAction) {
      this.currentAction.fadeOut(fadeOut);
      this.currentAction = null;
    }
  }

  /**
   * Pause current animation
   */
  pause(): void {
    if (this.currentAction) {
      this.currentAction.paused = true;
    }
  }

  /**
   * Resume current animation
   */
  resume(): void {
    if (this.currentAction) {
      this.currentAction.paused = false;
    }
  }

  /**
   * Update animation mixer
   */
  update(deltaTime: number): void {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  /**
   * Set time scale for animation speed
   */
  setTimeScale(scale: number): void {
    this.timeScale = scale;
    if (this.currentAction) {
      this.currentAction.setEffectiveTimeScale(scale);
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
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
  public gltf: any = null;
  public isLoading = false;
  public isLoaded = false;
  private loadPromise: Promise<any> | null = null;

  constructor(
    public url: string,
    public castShadow: boolean = true,
    public receiveShadow: boolean = true
  ) {}

  /**
   * Load the model
   */
  async load(): Promise<any> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    if (this.isLoaded) {
      return this.gltf;
    }

    this.isLoading = true;

    this.loadPromise = (async () => {
      try {
        const THREE = (window as any).THREE || require('three');
        // @ts-expect-error - three/examples/jsm modules don't have type declarations
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
        const loader = new GLTFLoader();

        this.gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            this.url,
            (gltf: any) => resolve(gltf),
            undefined,
            (error: any) => reject(error)
          );
        });

        // Configure shadows
        if (this.gltf) {
          this.gltf.scene.traverse((child: any) => {
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
      } catch (error) {
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
  cloneScene(): any {
    if (!this.gltf) return null;
    return this.gltf.scene.clone();
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.gltf) {
      const THREE = (window as any).THREE || require('three');
      // Dispose all geometries and materials
      this.gltf.scene.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m: any) => m.dispose());
          } else {
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
  constructor(
    public type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere' = 'point',
    public color: Color = new Color(0xffffff),
    public intensity: number = 1,
    public distance: number = 0,
    public decay: number = 2,
    public angle: number = Math.PI / 3,
    public penumbra: number = 0,
    public castShadow: boolean = false,
    public shadowMapSize: number = 1024
  ) {}
}

/**
 * Camera component - for viewport/camera control
 */
export class CameraComponent {
  constructor(
    public fov: number = 75,
    public near: number = 0.1,
    public far: number = 1000,
    public isActive: boolean = false,
    public controls: 'orbit' | 'firstperson' | 'fly' | 'none' = 'none'
  ) {}
}

/**
 * Network sync component - for synchronizing entities over network
 */
export class NetworkSyncComponent {
  constructor(
    public networkId: string,
    public isOwner: boolean = false,
    public syncRate: number = 30, // sync frequency in Hz
    public lastSyncTime: number = 0
  ) {}
}

/**
 * Interactable component - for user interaction
 */
export class InteractableComponent {
  constructor(
    public isInteractable: boolean = true,
    public hoverCursor: 'pointer' | 'grab' | 'crosshair' = 'pointer',
    public onClick: ((event: MouseEvent) => void) | null = null,
    public onHover: ((hovered: boolean) => void) | null = null,
    public onDrag: ((delta: Vector3) => void) | null = null
  ) {}
}

/**
 * Billboard component - always face camera
 */
export class BillboardComponent {
  constructor(
    public lockX: boolean = false,
    public lockY: boolean = false,
    public lockZ: boolean = false
  ) {}
}

/**
 * Particle component - for particle effects
 */
export class ParticleComponent {
  constructor(
    public count: number = 100,
    public lifetime: number = 1,
    public rate: number = 10,
    public size: number = 0.1,
    public color: Color = new Color(1, 1, 1),
    public velocity: Vector3 = new Vector3(0, 1, 0),
    public acceleration: Vector3 = new Vector3(0, -9.8, 0)
  ) {}
}

/**
 * Grabbable component - for objects that can be grabbed and moved
 */
export class GrabbableComponent {
  public isGrabbed: boolean = false;
  public grabbedBy: string | null = null; // clientId of who grabbed it
  public grabOffset: Vector3 = new Vector3(0, 0, 0);
  public grabDistance: number = 2; // distance from player when grabbed
  public throwVelocity: Vector3 = new Vector3(0, 0, 0);
  public lastPosition: Vector3 = new Vector3(0, 0, 0);
  public velocitySamples: Vector3[] = [];

  constructor(
    public mass: number = 1,
    public breakawayForce: number = 100, // force required to pull from another player
    public maxThrowSpeed: number = 20,
    public canBeThrown: boolean = true
  ) {}

  /**
   * Called when object is grabbed
   */
  onGrab(clientId: string, offset: Vector3): void {
    this.isGrabbed = true;
    this.grabbedBy = clientId;
    this.grabOffset.copy(offset);
    this.velocitySamples = [];
  }

  /**
   * Called when object is released
   */
  onRelease(): void {
    this.isGrabbed = false;
    this.grabbedBy = null;

    // Calculate throw velocity from recent position samples
    if (this.velocitySamples.length >= 2 && this.canBeThrown) {
      const latest = this.velocitySamples[this.velocitySamples.length - 1];
      const oldest = this.velocitySamples[0];
      const dt = (this.velocitySamples.length - 1) * 0.016; // assuming 60fps

      this.throwVelocity.set(
        (latest.x - oldest.x) / dt,
        (latest.y - oldest.y) / dt,
        (latest.z - oldest.z) / dt
      );

      // Clamp throw velocity
      const speed = this.throwVelocity.length();
      if (speed > this.maxThrowSpeed) {
        this.throwVelocity.multiplyScalar(this.maxThrowSpeed / speed);
      }
    } else {
      this.throwVelocity.set(0, 0, 0);
    }

    this.velocitySamples = [];
  }

  /**
   * Update velocity samples for throw calculation
   */
  recordPosition(position: Vector3): void {
    this.lastPosition.copy(position);
    this.velocitySamples.push(position.clone());

    // Keep only last 10 samples (approx 160ms at 60fps)
    if (this.velocitySamples.length > 10) {
      this.velocitySamples.shift();
    }
  }
}

