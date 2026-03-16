/**
 * XR Module - WebXR Input System
 *
 * Exports all XR-related functionality for VR controller and hand tracking.
 */

// XR Input System
export {
  XRInputSystem,
  type XRInputSystemConfig,
  VRInteractableComponent
} from './xr-input-system';

// XR Input Manager
export { XRInputManager } from './xr-input-manager';

// XR Hand Tracking
export {
  XRHandTracking,
  type HandData,
  type HandJoint,
  type XRHandTrackingConfig,
  JOINT_INDICES,
  FINGERTIP_JOINTS
} from './xr-hand-tracking';

// Re-export gesture detector from the gesture module
export {
  type GestureMetadata,
  type DetectedGesture,
  type GestureThresholds,
  DEFAULT_GESTURE_THRESHOLDS
} from '../gesture/gesture-detector';
