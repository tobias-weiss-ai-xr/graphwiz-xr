/**
 * Voice System
 *
 * ECS system that handles voice chat integration with spatial audio.
 */
import { EventEmitter } from 'events';
import { TransformComponent } from '../ecs/entity';
import { System } from '../ecs/system';
/**
 * Component for voice chat participant entities
 */
export class VoiceParticipantComponent {
    constructor(userId) {
        this.isMuted = false;
        this.volume = 1.0;
        this.isSpeaking = false;
        this.lastSpeakTime = 0;
        this.userId = userId;
    }
}
/**
 * Component for local player's voice
 */
export class VoiceLocalComponent {
    constructor(options = {}) {
        this.isMuted = false;
        this.pushToTalk = false;
        this.volume = 1.0;
        this.voiceActivityDetection = true;
        this.pushToTalk = options.pushToTalk ?? false;
        this.voiceActivityDetection = options.voiceActivityDetection ?? true;
    }
}
export class VoiceSystem extends System {
    on(event, listener) {
        this.eventEmitter.on(event, listener);
    }
    emit(event, ...args) {
        return this.eventEmitter.emit(event, ...args);
    }
    constructor(voiceClient, config = {}) {
        super();
        this.voiceEntities = new Map(); // userId -> entityId
        this.localEntityId = null;
        // Voice indicators (visual feedback)
        this.speakingThreshold = 2000; // ms to show as speaking
        this.eventEmitter = new EventEmitter();
        this.voiceClient = voiceClient;
        this.config = {
            maxDistance: 10,
            spatialAudioEnabled: true,
            voiceActivityEnabled: true,
            ...config
        };
        this.setupEventListeners();
    }
    /**
     * Update voice system
     */
    update(_deltaTime) {
        if (!this.world || !this.voiceClient.isConnected()) {
            return;
        }
        const currentTime = Date.now();
        // Update all voice participants
        for (const [userId, entityId] of this.voiceEntities) {
            const entity = this.world.getEntity(entityId);
            if (!entity)
                continue;
            const transform = entity.getComponent(TransformComponent);
            const voiceParticipant = entity.getComponent(VoiceParticipantComponent);
            if (!transform || !voiceParticipant)
                continue;
            // Update spatial audio position
            if (this.config.spatialAudioEnabled) {
                this.voiceClient.setRemotePosition(userId, {
                    x: transform.position.x,
                    y: transform.position.y,
                    z: transform.position.z
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
    setupEventListeners() {
        this.voiceClient.on('connected', () => {
            this.onConnected();
        });
        this.voiceClient.on('userJoined', (userId) => {
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
    onConnected() {
        if (!this.world)
            return;
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
    onUserJoined(userId) {
        if (!this.world)
            return;
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
    onLocalUserStartedSpeaking() {
        if (this.localEntityId && this.config.voiceActivityEnabled) {
            const entity = this.world.getEntity(this.localEntityId);
            if (entity) {
                const localVoice = entity.getComponent(VoiceLocalComponent);
                if (localVoice) {
                    this.emit('localUserStartedSpeaking', this.localEntityId);
                }
            }
        }
    }
    /**
     * Handle local user stopped speaking
     */
    onLocalUserStoppedSpeaking() {
        if (this.localEntityId && this.config.voiceActivityEnabled) {
            this.emit('localUserStoppedSpeaking', this.localEntityId);
        }
    }
    /**
     * Create voice indicator entity
     */
    createVoiceIndicator(parentEntityId) {
        if (!this.world)
            return;
        const parent = this.world.getEntity(parentEntityId);
        if (!parent)
            return;
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
    setMuted(muted) {
        this.voiceClient.setMuted(muted);
    }
    /**
     * Toggle mute
     */
    toggleMute() {
        return this.voiceClient.toggleMute();
    }
    /**
     * Get voice client
     */
    getClient() {
        return this.voiceClient;
    }
    /**
     * Get user IDs of all participants
     */
    getParticipants() {
        return Array.from(this.voiceEntities.keys());
    }
    /**
     * Get entity ID for a participant
     */
    getParticipantEntityId(userId) {
        return this.voiceEntities.get(userId);
    }
    /**
     * Set volume for a participant
     */
    setParticipantVolume(userId, volume) {
        this.voiceClient.setRemoteVolume(userId, Math.max(0, Math.min(1, volume)));
    }
    /**
     * Check if local user is speaking
     */
    isLocalUserSpeaking() {
        return this.voiceClient.isUserSpeaking();
    }
}
