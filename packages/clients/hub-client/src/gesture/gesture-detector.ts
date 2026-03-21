/**
 * Gesture Types and Definitions
 *
 * Defines gesture types, metadata, and detection parameters for the gesture recognition system.
 */

import type { GestureType } from '../components/GestureRecognition';

export interface GestureMetadata {
  name: string;
  displayName: string;
  icon: string;
  description: string;
}

export interface DetectedGesture {
  type: GestureType;
  confidence: number; // 0.0 - 1.0
  duration: number; // ms held
  timestamp: number;
  handId: 'left' | 'right';
}

export interface GestureThresholds {
  // Fist gesture
  fistMaxFingertipDistance: number; // Max distance from fingertip to palm for fist

  // Open hand gesture
  openMinFingertipDistance: number; // Min distance for open hand

  // Thumbs up/down
  thumbExtendedThreshold: number; // Angle threshold for thumb extension
  fingersCurledThreshold: number; // Max spread for curled fingers

  // Point gesture
  pointIndexExtendedMin: number; // Min distance for index finger extended
  pointOtherFingersCurledMax: number; // Max spread for other fingers

  // Pinch gesture
  pinchThreshold: number; // Distance between thumb and index tips

  // Wave gesture
  waveMinAmplitude: number;
  waveMinFrequency: number;

  // Peace gesture
  peaceIndexMiddleExtendedMin: number;
  peaceOtherFingersCurledMax: number;

  // Detection timing
  minGestureDuration: number; // Minimum ms to hold gesture
  cooldownMs: number; // Cooldown before same gesture
}

// Default thresholds - tuned for Quest 2/3 hand tracking
export const DEFAULT_GESTURE_THRESHOLDS: GestureThresholds = {
  // Fist: all fingertips close to palm
  fistMaxFingertipDistance: 0.06, // 6cm from palm

  // Open hand: all fingertips far from palm
  openMinFingertipDistance: 0.1, // 10cm from palm

  // Thumbs up/down: thumb extended, others curled
  thumbExtendedThreshold: Math.PI / 4, // 45 degrees up
  fingersCurledThreshold: 0.06, // 6cm max spread for curled

  // Point: index extended, others curled
  pointIndexExtendedMin: 0.12, // 12cm extended
  pointOtherFingersCurledMax: 0.08, // 8cm max spread for others

  // Pinch: thumb close to index
  pinchThreshold: 0.02, // 2cm between thumb and index

  // Wave: significant hand movement
  waveMinAmplitude: 0.2,
  waveMinFrequency: 0.5, // Hz

  // Peace: index + middle extended
  peaceIndexMiddleExtendedMin: 0.12,
  peaceOtherFingersCurledMax: 0.08,

  // Timing
  minGestureDuration: 150, // 150ms to confirm
  cooldownMs: 300 // 300ms between same gesture
};

// Gesture metadata for UI display
export const GESTURE_METADATA: Record<ExtendedGestureType, GestureMetadata> = {
  none: {
    name: 'None',
    displayName: 'No Gesture',
    icon: '❌',
    description: 'No gesture detected'
  },
  wave: {
    name: 'Wave',
    displayName: '👋 Wave',
    icon: '👋',
    description: 'Waving hand'
  },
  thumbsUp: {
    name: 'Thumbs Up',
    displayName: '👍 Thumbs Up',
    icon: '👍',
    description: 'Thumb pointing up, other fingers curled'
  },
  thumbsDown: {
    name: 'Thumbs Down',
    displayName: '👎 Thumbs Down',
    icon: '👎',
    description: 'Thumb pointing down, other fingers curled'
  },
  point: {
    name: 'Point',
    displayName: '👆 Point',
    icon: '👆',
    description: 'Index finger extended, others curled'
  },
  fist: {
    name: 'Fist',
    displayName: '✊ Fist',
    icon: '✊',
    description: 'All fingers curled into fist'
  },
  openHand: {
    name: 'Open Hand',
    displayName: '🖐 Open Hand',
    icon: '🖐',
    description: 'All fingers extended'
  },
  pinch: {
    name: 'Pinch',
    displayName: '🤏 Pinch',
    icon: '🤏',
    description: 'Thumb and index finger touching'
  },
  peace: {
    name: 'Peace',
    displayName: '✌ Peace',
    icon: '✌',
    description: 'Index and middle fingers extended'
  }
};

export type ExtendedGestureType = GestureType | 'pinch' | 'peace';
