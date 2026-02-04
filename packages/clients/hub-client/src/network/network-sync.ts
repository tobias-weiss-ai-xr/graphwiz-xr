/**
 * Network Sync Component
 *
 * ECS component for synchronizing entities over the network.
 */

import { Vector3, Euler } from 'three';

export interface NetworkSyncConfig {
  networkId: string;
  isOwner: boolean;
  syncRate: number; // sync frequency in Hz
  interpolate: boolean;
  extrapolate: boolean;
}

export class NetworkSyncComponent {
  public networkId: string;
  public isOwner: boolean;
  public syncRate: number;
  public interpolate: boolean;
  public extrapolate: boolean;
  public lastSyncTime: number = 0;
  public syncInterval: number;

  // Interpolation/extrapolation state
  private positionBuffer: Array<{ position: Vector3; rotation: Euler; timestamp: number }> = [];
  private readonly maxBufferSize = 60; // 1 second at 60fps

  constructor(config: NetworkSyncConfig) {
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
  addStateUpdate(
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    timestamp: number
  ): void {
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
  getInterpolatedState(timestamp: number): {
    position: Vector3;
    rotation: Euler;
  } | null {
    if (this.positionBuffer.length < 2 || !this.interpolate) {
      return this.positionBuffer[this.positionBuffer.length - 1] || null;
    }

    // Find two states to interpolate between
    let before: typeof this.positionBuffer[0] | null = null;
    let after: typeof this.positionBuffer[0] | null = null;

    for (let i = 0; i < this.positionBuffer.length - 1; i++) {
      if (
        this.positionBuffer[i].timestamp <= timestamp &&
        this.positionBuffer[i + 1].timestamp >= timestamp
      ) {
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
    const position = new Vector3().lerpVectors(
      before.position,
      after.position,
      t
    );

    // Interpolate rotation (simple linear interpolation for Euler angles)
    const rotation = new Euler(
      before.rotation.x + (after.rotation.x - before.rotation.x) * t,
      before.rotation.y + (after.rotation.y - before.rotation.y) * t,
      before.rotation.z + (after.rotation.z - before.rotation.z) * t
    );

    return { position, rotation };
  }

  /**
   * Clear the state buffer
   */
  clearBuffer(): void {
    this.positionBuffer = [];
  }

  /**
   * Get buffer size
   */
  getBufferSize(): number {
    return this.positionBuffer.length;
  }

  /**
   * Check if sync is needed
   */
  shouldSync(currentTime: number): boolean {
    return currentTime - this.lastSyncTime >= this.syncInterval;
  }

  /**
   * Update last sync time
   */
  updateLastSyncTime(currentTime: number): void {
    this.lastSyncTime = currentTime;
  }
}

