/**
 * WebXR Hand Tracking
 *
 * Provides native WebXR hand input integration for gesture recognition.
 * Uses the WebXR Hand Input Module Level 1 specification.
 */

import { createLogger } from '@graphwiz/types';
import * as THREE from 'three';
import { EventEmitter } from 'events';

const logger = createLogger('[XRHandTracking]');

// Joint indices for WebXR hand tracking (25 joints per hand)
export const JOINT_INDICES: Record<string, number> = {
  wrist: 0,
  'thumb-metacarpal': 1,
  'thumb-phalanx-proximal': 2,
  'thumb-phalanx-distal': 3,
  'thumb-tip': 4,
  'index-finger-metacarpal': 5,
  'index-finger-phalanx-proximal': 6,
  'index-finger-phalanx-intermediate': 7,
  'index-finger-phalanx-distal': 8,
  'index-finger-tip': 9,
  'middle-finger-metacarpal': 10,
  'middle-finger-phalanx-proximal': 11,
  'middle-finger-phalanx-intermediate': 12,
  'middle-finger-phalanx-distal': 13,
  'middle-finger-tip': 14,
  'ring-finger-metacarpal': 15,
  'ring-finger-phalanx-proximal': 16,
  'ring-finger-phalanx-intermediate': 17,
  'ring-finger-phalanx-distal': 18,
  'ring-finger-tip': 19,
  'pinky-finger-metacarpal': 20,
  'pinky-finger-phalanx-proximal': 21,
  'pinky-finger-phalanx-intermediate': 22,
  'pinky-finger-phalanx-distal': 23,
  'pinky-finger-tip': 24
};

export const FINGERTIP_JOINTS = [
  'thumb-tip',
  'index-finger-tip',
  'middle-finger-tip',
  'ring-finger-tip',
  'pinky-finger-tip'
];

export interface HandJoint {
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  radius: number;
}

export interface HandData {
  handedness: 'left' | 'right';
  joints: HandJoint[];
  palmPosition: THREE.Vector3;
  palmNormal: THREE.Vector3;
  wristRotation: THREE.Quaternion;
  confidence: number;
  isTracking: boolean;
}

export interface XRHandTrackingConfig {
  enabled?: boolean;
}

// Type for XRFrame with getJointPose - use any for compatibility
type XRFrameWithJoints = XRFrame & {
  getJointPose?(jointSpace: XRJointSpace, baseSpace: XRSpace): XRJointPose | undefined;
};

// Type for XRHand with indexed access
type XRHandWithIndex = XRHand & { [index: number]: XRJointSpace };

/**
 * XRHandTracking - WebXR hand tracking integration
 *
 * Uses the WebXR Hand Input Module Level 1 specification for hand tracking.
 * Provides joint positions, rotations, and gesture detection capabilities.
 */
export class XRHandTracking extends EventEmitter {
  private session: XRSession | null = null;
  private referenceSpace: XRReferenceSpace | null = null;
  private leftHand: HandData | null = null;
  private rightHand: HandData | null = null;
  private handInputSources: Map<string, XRInputSource> = new Map();
  private config: XRHandTrackingConfig;
  private enabled: boolean = false;

  constructor(config: XRHandTrackingConfig = {}) {
    super();
    this.config = { enabled: true, ...config };
    this.enabled = this.config.enabled ?? true;
  }

  /**
   * Check if hand tracking is supported in this browser
   */
  static isSupported(): boolean {
    return 'XRHand' in window || 'handTracking' in (navigator.xr || {});
  }

  /**
   * Initialize hand tracking with XR session
   */
  async initialize(session: XRSession, referenceSpace: XRReferenceSpace): Promise<boolean> {
    if (!this.enabled) {
      logger.info('Hand tracking disabled by config');
      return false;
    }

    // Check if session supports hand tracking
    const features = session.enabledFeatures;
    if (!features?.includes('hand-tracking')) {
      logger.warn('Hand tracking not enabled in XR session');
      logger.info('Request session with optionalFeatures: ["hand-tracking"]');
      return false;
    }

    this.session = session;
    this.referenceSpace = referenceSpace;

    // Find existing hand input sources
    for (const inputSource of session.inputSources) {
      if (this.isHandInputSource(inputSource)) {
        this.addHandInputSource(inputSource);
      }
    }

    // Listen for hand input source changes
    session.addEventListener('inputsourceschange', this.handleInputSourcesChange.bind(this));

    logger.info(`Hand tracking initialized with ${this.handInputSources.size} hands`);
    return true;
  }

  /**
   * Check if input source is a hand (not controller)
   */
  private isHandInputSource(inputSource: XRInputSource): boolean {
    return (
      'hand' in inputSource &&
      (inputSource as any).hand !== null &&
      (inputSource as any).hand !== undefined
    );
  }

  /**
   * Add hand input source
   */
  private addHandInputSource(inputSource: XRInputSource): void {
    const handedness = inputSource.handedness as 'left' | 'right';
    const id = `hand-${handedness}`;

    logger.info(`Hand input source added: ${handedness}`);

    this.handInputSources.set(id, inputSource);

    // Initialize hand data structure
    const handData: HandData = {
      handedness,
      joints: this.createEmptyJoints(),
      palmPosition: new THREE.Vector3(),
      palmNormal: new THREE.Vector3(0, 1, 0),
      wristRotation: new THREE.Quaternion(),
      confidence: 0,
      isTracking: false
    };

    if (handedness === 'left') {
      this.leftHand = handData;
    } else {
      this.rightHand = handData;
    }

    this.emit('handAdded', { handedness, id });
  }

  /**
   * Create empty joint array
   */
  private createEmptyJoints(): HandJoint[] {
    const joints: HandJoint[] = [];
    for (let i = 0; i < 25; i++) {
      joints.push({
        position: new THREE.Vector3(),
        rotation: new THREE.Quaternion(),
        radius: 0.005 // Default 5mm radius
      });
    }
    return joints;
  }

  /**
   * Handle input source changes
   */
  private handleInputSourcesChange(event: XRInputSourcesChangeEvent): void {
    // Add new hand sources
    for (const inputSource of event.added) {
      if (this.isHandInputSource(inputSource)) {
        this.addHandInputSource(inputSource);
      }
    }

    // Remove disconnected hand sources
    for (const inputSource of event.removed) {
      if (this.isHandInputSource(inputSource)) {
        const handedness = inputSource.handedness as 'left' | 'right';
        const id = `hand-${handedness}`;
        this.handInputSources.delete(id);

        if (handedness === 'left') {
          this.leftHand = null;
        } else {
          this.rightHand = null;
        }

        logger.info(`Hand input source removed: ${handedness}`);
        this.emit('handRemoved', { handedness, id });
      }
    }
  }

  /**
   * Update hand tracking - call every frame
   */
  update(frame: XRFrame): void {
    if (!this.session || !this.referenceSpace) return;

    for (const [id, inputSource] of this.handInputSources) {
      const hand = (inputSource as any).hand as XRHand | undefined;
      if (!hand) continue;

      const handData = id.includes('left') ? this.leftHand : this.rightHand;
      if (!handData) continue;

      this.updateHandJoints(hand, handData, frame);
    }
  }

  /**
   * Update hand joints from WebXR hand data
   */
  private updateHandJoints(xrHand: XRHand, handData: HandData, frame: XRFrame): void {
    const frameWithJoints = frame as XRFrameWithJoints;

    if (typeof frameWithJoints.getJointPose !== 'function') {
      return;
    }

    let validJoints = 0;
    const handWithIndex = xrHand as XRHandWithIndex;

    // Iterate through all 25 joints
    for (let i = 0; i < 25; i++) {
      const jointSpace = handWithIndex[i];
      if (!jointSpace) continue;

      const pose = frameWithJoints.getJointPose(jointSpace, this.referenceSpace!);
      if (pose) {
        const joint = handData.joints[i];
        if (joint) {
          // Update position
          joint.position.set(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z
          );

          // Update rotation
          joint.rotation.set(
            pose.transform.orientation.x,
            pose.transform.orientation.y,
            pose.transform.orientation.z,
            pose.transform.orientation.w
          );

          // Update radius if available
          if ((pose as any).radius !== undefined && typeof (pose as any).radius === 'number') {
            joint.radius = (pose as any).radius;
          }

          validJoints++;
        }
      }
    }

    // Update tracking confidence
    const validJointCount = handData.joints.filter((j) => j.position.length() > 0).length;
    handData.confidence = validJointCount / 25;
    handData.isTracking = validJointCount >= 15; // Need at least 60% of joints

    // Calculate palm position (average of metacarpals)
    if (handData.isTracking) {
      this.calculatePalmData(handData);
    }
  }

  /**
   * Calculate palm position and normal from joint data
   */
  private calculatePalmData(handData: HandData): void {
    const idxMeta = JOINT_INDICES['index-finger-metacarpal'];
    const midMeta = JOINT_INDICES['middle-finger-metacarpal'];
    const ringMeta = JOINT_INDICES['ring-finger-metacarpal'];
    const pinkyMeta = JOINT_INDICES['pinky-finger-metacarpal'];

    const metacarpals = [
      handData.joints[idxMeta],
      handData.joints[midMeta],
      handData.joints[ringMeta],
      handData.joints[pinkyMeta]
    ].filter((j): j is HandJoint => j !== undefined && j.position.length() > 0);

    if (metacarpals.length >= 3) {
      // Calculate palm center
      handData.palmPosition.set(0, 0, 0);
      for (const m of metacarpals) {
        handData.palmPosition.add(m.position);
      }
      handData.palmPosition.divideScalar(metacarpals.length);

      // Calculate palm normal using cross product
      const v1 = new THREE.Vector3().subVectors(metacarpals[1].position, metacarpals[0].position);
      const v2 = new THREE.Vector3().subVectors(metacarpals[2].position, metacarpals[0].position);
      handData.palmNormal.crossVectors(v1, v2).normalize();

      // Adjust normal direction based on handedness
      if (handData.handedness === 'left') {
        handData.palmNormal.negate();
      }
    }
  }

  /**
   * Get left hand data
   */
  getLeftHand(): HandData | null {
    return this.leftHand;
  }

  /**
   * Get right hand data
   */
  getRightHand(): HandData | null {
    return this.rightHand;
  }

  /**
   * Check if hand tracking is active
   */
  isTracking(): boolean {
    return (this.leftHand?.isTracking ?? false) || (this.rightHand?.isTracking ?? false);
  }

  /**
   * Get joint position by name
   */
  getJointPosition(handData: HandData, jointName: string): THREE.Vector3 | null {
    const index = JOINT_INDICES[jointName];
    if (index === undefined) return null;
    const joint = handData.joints[index];
    return joint?.position.clone() ?? null;
  }

  /**
   * Get fingertip positions
   */
  getFingertipPositions(handData: HandData): THREE.Vector3[] {
    return FINGERTIP_JOINTS.map((name) => {
      const index = JOINT_INDICES[name];
      if (index === undefined) return new THREE.Vector3();
      const joint = handData.joints[index];
      return joint?.position.clone() ?? new THREE.Vector3();
    });
  }

  /**
   * Get wrist rotation
   */
  getWristRotation(handData: HandData): THREE.Quaternion | null {
    const wristJoint = handData.joints[JOINT_INDICES['wrist']];
    return wristJoint?.rotation.clone() ?? null;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.session) {
      this.session.removeEventListener(
        'inputsourceschange',
        this.handleInputSourcesChange.bind(this)
      );
    }
    this.session = null;
    this.referenceSpace = null;
    this.handInputSources.clear();
    this.leftHand = null;
    this.rightHand = null;
    this.removeAllListeners();
  }
}
