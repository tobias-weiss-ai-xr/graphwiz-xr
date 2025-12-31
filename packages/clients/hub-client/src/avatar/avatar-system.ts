/**
 * Avatar System
 *
 * ECS system for managing user avatars in 3D space.
 */

import { System } from '../ecs/system';
import { AvatarComponent } from './avatar-component';
import { AvatarRenderer } from './avatar-renderer';
import { TransformComponent } from '../ecs/entity';
import { XRInputManager } from '../xr/xr-input-manager';
import type { NetworkClient } from '../network/client';
import { MessageType } from '@graphwiz/protocol';
import * as THREE from 'three';

export interface AvatarSystemConfig {
  updateRate?: number; // Position update rate in Hz
  enableInterpolation?: boolean;
  interpolationDelay?: number; // ms
  hideLocalAvatar?: boolean; // Hide local user's avatar in VR
}

export class AvatarSystem extends System {
  private readonly renderers: Map<string, AvatarRenderer> = new Map();
  private readonly config: Required<AvatarSystemConfig>;

  // Network clients
  private networkClient?: NetworkClient;
  private xrInputManager?: XRInputManager;

  // Local player tracking
  private localAvatarId?: string;

  // Interpolation state
  private readonly remoteAvatarStates: Map<string, {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    targetPosition: { x: number; y: number; z: number };
    targetRotation: { x: number; y: number; z: number };
    lastUpdateTime: number;
  }> = new Map();

  constructor(config: AvatarSystemConfig = {}) {
    super();

    this.config = {
      updateRate: 30,
      enableInterpolation: true,
      interpolationDelay: 100,
      hideLocalAvatar: true,
      ...config,
    };

    console.log('[AvatarSystem] Initialized', this.config);
  }

  /**
   * Set network client for avatar sync
   */
  setNetworkClient(networkClient: NetworkClient): void {
    this.networkClient = networkClient;

    // Listen for remote user updates
    networkClient.on(MessageType.PRESENCE_JOIN, (data: any) => {
      this.handleRemoteUserJoined(data);
    });

    networkClient.on(MessageType.PRESENCE_LEAVE, (data: any) => {
      this.handleRemoteUserLeft(data);
    });

    networkClient.on(MessageType.ENTITY_UPDATE, (data: any) => {
      this.handleRemoteAvatarUpdate(data);
    });
  }

  /**
   * Set XR input manager for VR tracking
   */
  setXRInputManager(xrInputManager: XRInputManager): void {
    this.xrInputManager = xrInputManager;
  }

  /**
   * Create local player avatar
   */
  createLocalAvatar(userId: string, displayName: string, customization?: any): string {
    const entity = this.world!.createEntity();

    const transform = new TransformComponent();
    transform.position.set(0, 0, 0);
    entity.addComponent(TransformComponent, transform);

    const avatar = new AvatarComponent(userId, displayName, customization, true);
    entity.addComponent(AvatarComponent, avatar);

    // Create renderer
    const scene = (this.world as any).scene; // Access scene if available
    if (scene) {
      const renderer = new AvatarRenderer(avatar, scene);
      this.renderers.set(entity.id, renderer);
    }

    this.localAvatarId = entity.id;

    console.log(`[AvatarSystem] Created local avatar: ${displayName}`);
    return entity.id;
  }

  /**
   * Create remote user avatar
   */
  createRemoteAvatar(data: {
    userId: string;
    displayName: string;
    customization?: any;
    headPosition: { x: number; y: number; z: number };
  }): string {
    const entity = this.world!.createEntity();

    const transform = new TransformComponent();
    transform.position.set(data.headPosition.x, data.headPosition.y, data.headPosition.z);
    entity.addComponent(TransformComponent, transform);

    const avatar = AvatarComponent.deserialize(data);
    entity.addComponent(AvatarComponent, avatar);

    // Create renderer
    const scene = (this.world as any).scene;
    if (scene) {
      const renderer = new AvatarRenderer(avatar, scene);
      this.renderers.set(entity.id, renderer);
    }

    // Initialize interpolation state
    if (this.config.enableInterpolation) {
      this.remoteAvatarStates.set(entity.id, {
        position: { ...data.headPosition },
        rotation: { x: 0, y: 0, z: 0 },
        targetPosition: { ...data.headPosition },
        targetRotation: { x: 0, y: 0, z: 0 },
        lastUpdateTime: performance.now(),
      });
    }

    console.log(`[AvatarSystem] Created remote avatar: ${data.displayName}`);
    return entity.id;
  }

  /**
   * Remove avatar
   */
  removeAvatar(entityId: string): void {
    const renderer = this.renderers.get(entityId);
    if (renderer) {
      renderer.dispose();
      this.renderers.delete(entityId);
    }

    this.remoteAvatarStates.delete(entityId);

    const entity = this.world!.getEntity(entityId);
    if (entity) {
      this.world!.removeEntity(entityId);
    }

    if (entityId === this.localAvatarId) {
      this.localAvatarId = undefined;
    }

    console.log(`[AvatarSystem] Removed avatar: ${entityId}`);
  }

  /**
   * Update local avatar from VR input
   */
  updateLocalAvatar(_deltaTime: number): void {
    if (!this.localAvatarId || !this.xrInputManager) return;

    const entity = this.world!.getEntity(this.localAvatarId);
    if (!entity) return;

    const avatar = entity.getComponent(AvatarComponent) as AvatarComponent;
    if (!avatar) return;

    // Get HMD position if available
    const xrSession = (this.xrInputManager as any).session;
    if (xrSession) {
      // In VR, update from HMD tracking
      // (This would be populated by the XR system)
    } else {
      // Desktop mode - use keyboard/mouse position
      // (Would be updated by input system)
    }

    // Update hands from controllers
    const leftController = this.xrInputManager.getControllerState('left');
    const rightController = this.xrInputManager.getControllerState('right');

    if (leftController) {
      const leftEuler = new THREE.Euler().setFromQuaternion(leftController.gripRotation);
      avatar.updateHand('left', leftController.gripPosition, leftEuler);
    }

    if (rightController) {
      const rightEuler = new THREE.Euler().setFromQuaternion(rightController.gripRotation);
      avatar.updateHand('right', rightController.gripPosition, rightEuler);
    }

    // Broadcast over network
    this.broadcastAvatarUpdate(avatar);
  }

  /**
   * Broadcast local avatar update over network
   */
  private broadcastAvatarUpdate(avatar: AvatarComponent): void {
    if (!this.networkClient || !avatar.isLocal) return;

    const data = avatar.serialize();

    // Rate limiting could be applied here
    this.networkClient.send({
      type: 'avatar_update',
      payload: data,
    } as any);
  }

  /**
   * Handle remote user joined
   */
  private handleRemoteUserJoined(data: any): void {
    console.log('[AvatarSystem] Remote user joined:', data);

    this.createRemoteAvatar({
      userId: data.userId,
      displayName: data.displayName,
      headPosition: data.position || { x: 0, y: 0, z: 0 },
    });
  }

  /**
   * Handle remote user left
   */
  private handleRemoteUserLeft(data: any): void {
    console.log('[AvatarSystem] Remote user left:', data);

    // Find avatar by userId
    for (const [entityId, renderer] of this.renderers) {
      if (renderer.avatar.userId === data.userId) {
        this.removeAvatar(entityId);
        break;
      }
    }
  }

  /**
   * Handle remote avatar update
   */
  private handleRemoteAvatarUpdate(data: any): void {
    // Find avatar by userId
    for (const [entityId, renderer] of this.renderers) {
      if (renderer.avatar.userId === data.userId) {
        const avatar = renderer.avatar;

        // Update tracking data
        avatar.headPosition.set(data.headPosition.x, data.headPosition.y, data.headPosition.z);
        avatar.leftHandPosition.set(data.leftHandPosition.x, data.leftHandPosition.y, data.leftHandPosition.z);
        avatar.rightHandPosition.set(data.rightHandPosition.x, data.rightHandPosition.y, data.rightHandPosition.z);

        // Update state
        avatar.isMoving = data.isMoving;
        avatar.isSpeaking = data.isSpeaking;
        avatar.isEmoting = data.isEmoting;

        // Update interpolation target
        if (this.config.enableInterpolation) {
          const state = this.remoteAvatarStates.get(entityId);
          if (state) {
            state.targetPosition = { ...data.headPosition };
            state.targetRotation = data.headRotation || { x: 0, y: 0, z: 0 };
            state.lastUpdateTime = performance.now();
          }
        }

        break;
      }
    }
  }

  /**
   * Update system
   */
  override update(deltaTime: number): void {
    // Update local avatar
    this.updateLocalAvatar(deltaTime);

    // Update interpolation for remote avatars
    if (this.config.enableInterpolation) {
      this.updateInterpolation(deltaTime);
    }

    // Update all renderers
    for (const renderer of this.renderers.values()) {
      renderer.update();
    }

    // Hide local avatar in VR if configured
    if (this.localAvatarId && this.config.hideLocalAvatar) {
      const isVRActive = (this.xrInputManager as any)?.session;
      const renderer = this.renderers.get(this.localAvatarId);
      if (renderer) {
        renderer.avatar.visible = !isVRActive;
      }
    }
  }

  /**
   * Update interpolation for remote avatars
   */
  private updateInterpolation(deltaTime: number): void {
    const now = performance.now();

    for (const [entityId, state] of this.remoteAvatarStates) {
      const age = now - state.lastUpdateTime;

      // Interpolate position
      const t = Math.min(age / this.config.interpolationDelay, 1);

      state.position.x += (state.targetPosition.x - state.position.x) * t * deltaTime;
      state.position.y += (state.targetPosition.y - state.position.y) * t * deltaTime;
      state.position.z += (state.targetPosition.z - state.position.z) * t * deltaTime;

      // Update renderer
      const renderer = this.renderers.get(entityId);
      if (renderer) {
        renderer.avatar.headPosition.set(state.position.x, state.position.y, state.position.z);
      }
    }
  }

  /**
   * Get local avatar entity ID
   */
  getLocalAvatarId(): string | undefined {
    return this.localAvatarId;
  }

  /**
   * Get avatar by user ID
   */
  getAvatarByUserId(userId: string): string | undefined {
    for (const [entityId, renderer] of this.renderers) {
      if (renderer.avatar.userId === userId) {
        return entityId;
      }
    }
    return undefined;
  }

  /**
   * Trigger emote on local avatar
   */
  triggerEmote(emote: string, duration?: number): void {
    if (!this.localAvatarId) return;

    const entity = this.world!.getEntity(this.localAvatarId);
    if (!entity) return;

    const avatar = entity.getComponent(AvatarComponent) as AvatarComponent;
    if (avatar) {
      avatar.triggerEmote(emote, duration);
      this.broadcastAvatarUpdate(avatar);
    }
  }

  /**
   * Get all avatar IDs
   */
  getAvatarIds(): string[] {
    return Array.from(this.renderers.keys());
  }

  /**
   * Get avatar count
   */
  getAvatarCount(): number {
    return this.renderers.size;
  }

  /**
   * Dispose of system
   */
  dispose(): void {
    // Remove all renderers
    for (const [entityId, renderer] of this.renderers) {
      renderer.dispose();
      this.world!.removeEntity(entityId);
    }

    this.renderers.clear();
    this.remoteAvatarStates.clear();

    console.log('[AvatarSystem] Disposed');
  }
}
