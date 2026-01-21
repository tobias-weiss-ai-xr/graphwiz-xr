/**
 * Network Sync Component
 *
 * ECS component for synchronizing entities over the network.
 */
import { Vector3, Euler } from 'three';
export class NetworkSyncComponent {
    constructor(config) {
        this.lastSyncTime = 0;
        // Interpolation/extrapolation state
        this.positionBuffer = [];
        this.maxBufferSize = 60; // 1 second at 60fps
        this.networkId = config.networkId;
        this.isOwner = config.isOwner;
        this.syncRate = config.syncRate;
        this.interpolate = config.interpolate;
        this.extrapolate = config.extrapolate;
        this.syncInterval = 1000 / config.syncRate;
    }
    /**
     * Add a state update to the buffer for interpolation
     */
    addStateUpdate(position, rotation, timestamp) {
        this.positionBuffer.push({
            position: new Vector3(position.x, position.y, position.z),
            rotation: new Euler(rotation.x, rotation.y, rotation.z),
            timestamp,
        });
        // Keep buffer size in check
        if (this.positionBuffer.length > this.maxBufferSize) {
            this.positionBuffer.shift();
        }
    }
    /**
     * Get interpolated position/rotation at a given time
     */
    getInterpolatedState(timestamp) {
        if (this.positionBuffer.length < 2 || !this.interpolate) {
            return this.positionBuffer[this.positionBuffer.length - 1] || null;
        }
        // Find two states to interpolate between
        let before = null;
        let after = null;
        for (let i = 0; i < this.positionBuffer.length - 1; i++) {
            if (this.positionBuffer[i].timestamp <= timestamp &&
                this.positionBuffer[i + 1].timestamp >= timestamp) {
                before = this.positionBuffer[i];
                after = this.positionBuffer[i + 1];
                break;
            }
        }
        if (!before || !after) {
            return this.positionBuffer[this.positionBuffer.length - 1];
        }
        // Calculate interpolation factor
        const duration = after.timestamp - before.timestamp;
        const elapsed = timestamp - before.timestamp;
        const t = duration > 0 ? elapsed / duration : 0;
        // Interpolate position
        const position = new Vector3().lerpVectors(before.position, after.position, t);
        // Interpolate rotation (simple linear interpolation for Euler angles)
        const rotation = new Euler(before.rotation.x + (after.rotation.x - before.rotation.x) * t, before.rotation.y + (after.rotation.y - before.rotation.y) * t, before.rotation.z + (after.rotation.z - before.rotation.z) * t);
        return { position, rotation };
    }
    /**
     * Clear the state buffer
     */
    clearBuffer() {
        this.positionBuffer = [];
    }
    /**
     * Get buffer size
     */
    getBufferSize() {
        return this.positionBuffer.length;
    }
    /**
     * Check if sync is needed
     */
    shouldSync(currentTime) {
        return currentTime - this.lastSyncTime >= this.syncInterval;
    }
    /**
     * Update last sync time
     */
    updateLastSyncTime(currentTime) {
        this.lastSyncTime = currentTime;
    }
}
