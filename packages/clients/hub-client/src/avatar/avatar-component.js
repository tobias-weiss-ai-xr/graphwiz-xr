/**
 * Avatar Component
 *
 * Represents a user avatar in the 3D space.
 * Supports customization, VR tracking, and network synchronization.
 */
import { Vector3, Euler } from 'three';
export class AvatarComponent {
    constructor(userId, displayName, customization = {}, isLocal = false) {
        this.userId = userId;
        this.displayName = displayName;
        this.isLocal = isLocal;
        // Apply defaults
        this.customization = {
            bodyType: 'humanoid',
            primaryColor: '#4a90e2',
            secondaryColor: '#50c878',
            accentColor: '#ffd700',
            height: 1.7,
            width: 0.5,
            eyeColor: '#000000',
            skinColor: '#ffd1aa',
            shirtColor: '#4a90e2',
            pantsColor: '#2c3e50',
            shoeColor: '#1a1a1a',
            hasHat: false,
            hasGlasses: false,
            style: 'cartoon',
            detail: 'medium',
            ...customization,
        };
        // Initialize tracking data
        this.headPosition = new Vector3(0, 1.6, 0);
        this.headRotation = new Euler(0, 0, 0);
        this.leftHandPosition = new Vector3(-0.3, 1.2, 0.5);
        this.rightHandPosition = new Vector3(0.3, 1.2, 0.5);
        this.leftHandRotation = new Euler(0, 0, 0);
        this.rightHandRotation = new Euler(0, 0, 0);
        // Animation state
        this.isMoving = false;
        this.isSpeaking = false;
        this.isEmoting = false;
        this.currentEmote = '';
        // Visibility
        this.visible = true;
        this.showNameTag = true;
    }
    /**
     * Update head position and rotation
     */
    updateHead(position, rotation) {
        this.headPosition.copy(position);
        this.headRotation.copy(rotation);
    }
    /**
     * Update hand position and rotation
     */
    updateHand(hand, position, rotation) {
        if (hand === 'left') {
            this.leftHandPosition.copy(position);
            this.leftHandRotation.copy(rotation);
        }
        else {
            this.rightHandPosition.copy(position);
            this.rightHandRotation.copy(rotation);
        }
    }
    /**
     * Set speaking state
     */
    setSpeaking(speaking) {
        this.isSpeaking = speaking;
    }
    /**
     * Trigger emote
     */
    triggerEmote(emote, duration = 3000) {
        this.currentEmote = emote;
        this.isEmoting = true;
        if (duration > 0) {
            setTimeout(() => {
                this.isEmoting = false;
                this.currentEmote = '';
            }, duration);
        }
    }
    /**
     * Get avatar height for eye level
     */
    getEyeLevel() {
        return this.customization.height * 0.95;
    }
    /**
     * Clone customization
     */
    cloneCustomization() {
        return { ...this.customization };
    }
    /**
     * Serialize to network data
     */
    serialize() {
        return {
            userId: this.userId,
            displayName: this.displayName,
            customization: this.customization,
            headPosition: { x: this.headPosition.x, y: this.headPosition.y, z: this.headPosition.z },
            headRotation: { x: this.headRotation.x, y: this.headRotation.y, z: this.headRotation.z },
            leftHandPosition: { x: this.leftHandPosition.x, y: this.leftHandPosition.y, z: this.leftHandPosition.z },
            rightHandPosition: { x: this.rightHandPosition.x, y: this.rightHandPosition.y, z: this.rightHandPosition.z },
            isMoving: this.isMoving,
            isSpeaking: this.isSpeaking,
            isEmoting: this.isEmoting,
            currentEmote: this.currentEmote,
        };
    }
    /**
     * Deserialize from network data
     */
    static deserialize(data) {
        const avatar = new AvatarComponent(data.userId, data.displayName, data.customization, false // Remote avatars
        );
        // Update tracking data
        avatar.headPosition.set(data.headPosition.x, data.headPosition.y, data.headPosition.z);
        if (data.headRotation) {
            avatar.headRotation.set(data.headRotation.x, data.headRotation.y, data.headRotation.z);
        }
        if (data.leftHandPosition) {
            avatar.leftHandPosition.set(data.leftHandPosition.x, data.leftHandPosition.y, data.leftHandPosition.z);
        }
        if (data.rightHandPosition) {
            avatar.rightHandPosition.set(data.rightHandPosition.x, data.rightHandPosition.y, data.rightHandPosition.z);
        }
        if (data.isMoving !== undefined)
            avatar.isMoving = data.isMoving;
        if (data.isSpeaking !== undefined)
            avatar.isSpeaking = data.isSpeaking;
        if (data.isEmoting !== undefined)
            avatar.isEmoting = data.isEmoting;
        if (data.currentEmote !== undefined)
            avatar.currentEmote = data.currentEmote;
        return avatar;
    }
}
