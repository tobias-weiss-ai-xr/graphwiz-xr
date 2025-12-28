/**
 * Voice System
 *
 * ECS system that handles voice chat integration with spatial audio.
 */

import { System } from '../ecs/system';
import { TransformComponent } from '../ecs/entity';
import { VoiceChatClient } from './voice-chat-client';
import * as THREE from 'three';

export interface VoiceSystemConfig {
  maxDistance?: number;
  spatialAudioEnabled?: boolean;
  voiceActivityEnabled?: boolean;
}

/**
 * Component for voice chat participant entities
 */
export class VoiceParticipantComponent {
  public userId: string;
  public isMuted: boolean = false;
  public volume: number = 1.0;
  public isSpeaking: boolean = false;
  public lastSpeakTime: number = 0;

  constructor(userId: string) {
    this.userId = userId;
  }
}

/**
 * Component for local player's voice
 */
export class VoiceLocalComponent {
  public isMuted: boolean = false;
  public pushToTalk: boolean = false;
  public volume: number = 1.0;
  public voiceActivityDetection: boolean = true;

  constructor(options: {
    pushToTalk?: boolean;
    voiceActivityDetection?: boolean;
  } = {}) {
    this.pushToTalk = options.pushToTalk ?? false;
    this.voiceActivityDetection = options.voiceActivityDetection ?? true;
  }
}

export class VoiceSystem extends System {
  private voiceClient: VoiceChatClient;
  private config: VoiceSystemConfig;
  private voiceEntities = new Map<string, string>(); // userId -> entityId
  private localEntityId: string | null = null;
  private maxDistance: number;

  // Voice indicators (visual feedback)
  private speakingThreshold = 2000; // ms to show as speaking

  constructor(voiceClient: VoiceChatClient, config: VoiceSystemConfig = {}) {
    super();
    this.voiceClient = voiceClient;
    this.config = {
      maxDistance: 10,
      spatialAudioEnabled: true,
      voiceActivityEnabled: true,
      ...config,
    };
    this.maxDistance = this.config.maxDistance || 10;

    this.setupEventListeners();
  }

  /**
   * Update voice system
   */
  override update(_deltaTime: number): void {
    if (!this.world || !this.voiceClient.isConnected()) {
      return;
    }

    const currentTime = Date.now();

    // Update all voice participants
    for (const [userId, entityId] of this.voiceEntities) {
      const entity = this.world.getEntity(entityId);
      if (!entity) continue;

      const transform = entity.getComponent(TransformComponent);
      const voiceParticipant = entity.getComponent(VoiceParticipantComponent);

      if (!transform || !voiceParticipant) continue;

      // Update spatial audio position
      if (this.config.spatialAudioEnabled) {
        this.voiceClient.setRemotePosition(userId, {
          x: transform.position.x,
          y: transform.position.y,
          z: transform.position.z,
        });
      }

      // Update speaking state
      if (currentTime - voiceParticipant.lastSpeakTime > this.speakingThreshold) {
        if (voiceParticipant.isSpeaking) {
          voiceParticipant.isSpeaking = false;
          this.emit('userStoppedSpeaking', userId, entityId);
        }
      }
    }

    // Update local voice state
    if (this.localEntityId) {
      const entity = this.world.getEntity(this.localEntityId);
      if (entity) {
        const localVoice = entity.getComponent(VoiceLocalComponent);
        if (localVoice) {
          const stats = this.voiceClient.getStats();
          localVoice.isMuted = stats.isMuted;
        }
      }
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.voiceClient.on('connected', () => {
      this.onConnected();
    });

    this.voiceClient.on('userJoined', (userId: string) => {
      this.onUserJoined(userId);
    });

    this.voiceClient.on('startedSpeaking', () => {
      this.onLocalUserStartedSpeaking();
    });

    this.voiceClient.on('stoppedSpeaking', () => {
      this.onLocalUserStoppedSpeaking();
    });
  }

  /**
   * Handle connection established
   */
  private onConnected(): void {
    if (!this.world) return;

    // Create local voice entity
    const localEntity = this.world.createEntity();
    const localVoice = new VoiceLocalComponent();
    localEntity.addComponent(VoiceLocalComponent, localVoice);

    this.localEntityId = localEntity.id;

    this.emit('localVoiceEntityCreated', localEntity.id);
  }

  /**
   * Handle remote user joined
   */
  private onUserJoined(userId: string): void {
    if (!this.world) return;

    // Create voice participant entity
    const entity = this.world.createEntity();

    // Add transform
    const transform = new TransformComponent();
    transform.position.set(0, 0, 0); // Will be updated by network
    entity.addComponent(TransformComponent, transform);

    // Add voice participant component
    const voiceParticipant = new VoiceParticipantComponent(userId);
    entity.addComponent(VoiceParticipantComponent, voiceParticipant);

    this.voiceEntities.set(userId, entity.id);

    this.emit('voiceParticipantCreated', entity.id, userId);
  }

  /**
   * Handle local user started speaking
   */
  private onLocalUserStartedSpeaking(): void {
    if (this.localEntityId && this.config.voiceActivityEnabled) {
      const entity = this.world.getEntity(this.localEntityId);
      if (entity) {
        const localVoice = entity.getComponent(VoiceLocalComponent);
        if (localVoice) {
          // Could trigger visual indicator here
          this.emit('localUserStartedSpeaking', this.localEntityId);
        }
      }
    }
  }

  /**
   * Handle local user stopped speaking
   */
  private onLocalUserStoppedSpeaking(): void {
    if (this.localEntityId && this.config.voiceActivityEnabled) {
      this.emit('localUserStoppedSpeaking', this.localEntityId);
    }
  }

  /**
   * Create voice indicator entity
   */
  createVoiceIndicator(parentEntityId: string): string | undefined {
    if (!this.world) return;

    const parent = this.world.getEntity(parentEntityId);
    if (!parent) return;

    // Create indicator entity (visual feedback for speaking)
    const indicator = this.world.createEntity();

    const transform = new TransformComponent();
    transform.position.set(0, 0.3, 0); // Above head
    indicator.addComponent(TransformComponent, transform);

    // Could add mesh/model component here
    // const model = new ModelComponent('voice-indicator');
    // indicator.addComponent(ModelComponent, model);

    return indicator.id;
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean): void {
    this.voiceClient.setMuted(muted);
  }

  /**
   * Toggle mute
   */
  toggleMute(): boolean {
    return this.voiceClient.toggleMute();
  }

  /**
   * Get voice client
   */
  getClient(): VoiceChatClient {
    return this.voiceClient;
  }

  /**
   * Get user IDs of all participants
   */
  getParticipants(): string[] {
    return Array.from(this.voiceEntities.keys());
  }

  /**
   * Get entity ID for a participant
   */
  getParticipantEntityId(userId: string): string | undefined {
    return this.voiceEntities.get(userId);
  }

  /**
   * Set volume for a participant
   */
  setParticipantVolume(userId: string, volume: number): void {
    this.voiceClient.setRemoteVolume(userId, Math.max(0, Math.min(1, volume)));
  }

  /**
   * Check if local user is speaking
   */
  isLocalUserSpeaking(): boolean {
    return this.voiceClient.isUserSpeaking();
  }
}
