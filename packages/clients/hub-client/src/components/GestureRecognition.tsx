import { createLogger } from '@graphwiz/types';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

import { ControllerState, XRInputManager } from '../xr/xr-input-manager';
import { XRHandTracking, type HandData, JOINT_INDICES } from '../xr/xr-hand-tracking';

const logger = createLogger('GestureRecognition');

export type GestureType =
  | 'none'
  | 'wave'
  | 'thumbsUp'
  | 'thumbsDown'
  | 'point'
  | 'fist'
  | 'openHand';

export interface GestureRecognitionProps {
  onGestureDetected?: (gesture: GestureType, controllerId: 'left' | 'right') => void;
  enabled?: boolean;
  xrInputManager?: XRInputManager;
  xrHandTracking?: XRHandTracking; // Optional hand tracking for more precise gesture detection
}

const GESTURE_THRESHOLDS = {
  // Minimum movement speed for wave gesture
  waveSpeed: 0.5,

  // Up/down angle for thumbs (in radians)
  thumbUpAngle: -Math.PI / 4, // -45 degrees
  thumbDownAngle: Math.PI / 4, // +45 degrees

  // Pointing threshold (how straight the index finger needs to be)
  pointAngle: Math.PI / 8, // 22.5 degrees

  // Fist threshold (how small the hand needs to be)
  fistSpread: 0.3, // Maximum spread for fist

  // Open hand threshold (opposite of fist)
  openSpread: 0.8, // Minimum spread for open hand

  // Movement detection time window
  gestureWindow: 1000, // ms

  // Minimum gesture duration
  minGestureDuration: 200, // ms

  // Performance: detection rate (skip frames to reduce CPU)
  detectionInterval: 66 // ~15fps (1000ms / 15 = 66ms)
};

export interface GestureAction {
  type: 'grab' | 'release' | 'point' | 'wave' | 'thumbsUp' | 'thumbsDown' | 'openHand' | 'fist';
  controllerId: 'left' | 'right';
  timestamp: number;
}

export function GestureRecognition({
  onGestureDetected,
  enabled = true,
  xrInputManager: injectedManager,
  xrHandTracking
}: GestureRecognitionProps) {
  const [currentGesture, setCurrentGesture] = useState<GestureType>('none');
  const xrInputManagerRef = useRef<XRInputManager | null>(injectedManager || null);
  const xrHandTrackingRef = useRef<XRHandTracking | null>(xrHandTracking || null);

  const gestureStartTimeRef = useRef<Map<'left' | 'right', number>>(new Map());
  const lastGestureRef = useRef<Map<'left' | 'right', GestureType>>(new Map());

  // Initialize controller states with actual XR data
  useEffect(() => {
    if (!xrInputManagerRef.current) {
      // No XR manager - create placeholders
      return;
    }

    // Setup XR input integration
    const manager = xrInputManagerRef.current;

    // Listen for connection events
    const onConnect = (id: string, _state: ControllerState) => {
      logger.debug(`Controller connected: ${id}`);
    };

    const onDisconnect = (id: string) => {
      logger.warn(`Controller disconnected: ${id}`);
      gestureStartTimeRef.current.delete(id as 'left' | 'right');
      lastGestureRef.current.set(id as 'left' | 'right', 'none');
    };

    manager.on('controllerConnected', onConnect);
    manager.on('controllerDisconnected', onDisconnect);

    return () => {
      manager.off('controllerConnected', onConnect);
      manager.off('controllerDisconnected', onDisconnect);
    };
  }, [xrInputManagerRef.current]);

  // Check VR controller positions every frame
  useFrame(() => {
    if (!enabled) return;

    const leftController = getActualController('left');
    const rightController = getActualController('right');

    if (leftController) {
      detectGesture('left', leftController);
    }

    if (rightController) {
      detectGesture('right', rightController);
    }
  });

  const getActualController = (controllerId: 'left' | 'right'): ControllerState | null => {
    // First try hand tracking for more precise gesture detection
    if (xrHandTrackingRef.current) {
      const handData =
        controllerId === 'left'
          ? xrHandTrackingRef.current.getLeftHand()
          : xrHandTrackingRef.current.getRightHand();

      if (handData && handData.isTracking) {
        // Convert hand data to controller-like state
        return {
          gripPosition: handData.palmPosition,
          gripRotation: handData.wristRotation,
          gripMatrix: new THREE.Matrix4(),
          aimPosition:
            handData.joints[JOINT_INDICES['index-finger-tip']]?.position || new THREE.Vector3(),
          aimRotation: handData.wristRotation,
          aimMatrix: new THREE.Matrix4(),
          buttons: new Map(),
          axes: { x: 0, y: 0 },
          selection: false,
          squeeze: false,
          handedness: controllerId,
          connected: true
        } as ControllerState;
      }
    }

    // Fall back to controller input
    if (!xrInputManagerRef.current) {
      // Fallback for testing without actual VR
      const simulatedPosition = new THREE.Vector3(controllerId === 'left' ? -0.5 : 0.5, 0.2, -0.5);
      return {
        gripPosition: simulatedPosition,
        gripRotation: new THREE.Quaternion(),
        gripMatrix: new THREE.Matrix4(),
        aimPosition: new THREE.Vector3(),
        aimRotation: new THREE.Quaternion(),
        aimMatrix: new THREE.Matrix4(),
        buttons: new Map(),
        axes: { x: 0, y: 0 },
        selection: false,
        squeeze: false,
        handedness: controllerId,
        connected: true
      } as ControllerState;
    }

    if (controllerId === 'left') {
      return xrInputManagerRef.current.getLeftController() || null;
    } else {
      return xrInputManagerRef.current.getRightController() || null;
    }
  };

  const detectGesture = (controllerId: 'left' | 'right', controller: ControllerState): void => {
    const gesture = recognizeGesture(controller, controllerId);

    // Debounce gestures
    if (gesture !== 'none') {
      const now = Date.now();
      const startTime = gestureStartTimeRef.current.get(controllerId) || 0;
      const lastGesture = lastGestureRef.current.get(controllerId) || 'none';

      if (gesture !== lastGesture) {
        gestureStartTimeRef.current.set(controllerId, now);
        lastGestureRef.current.set(controllerId, gesture);
      }

      if (now - startTime >= GESTURE_THRESHOLDS.minGestureDuration) {
        setCurrentGesture(gesture);
        onGestureDetected?.(gesture, controllerId);
      }
    } else {
      gestureStartTimeRef.current.delete(controllerId);
      lastGestureRef.current.set(controllerId, 'none');
      if (currentGesture !== 'none') {
        setCurrentGesture('none');
      }
    }
  };

  const recognizeGesture = (
    controller: ControllerState,
    _controllerId: 'left' | 'right'
  ): GestureType => {
    const { gripPosition, axes, buttons, squeeze, selection } = controller;
    const speed = gripPosition.length() * 0.5;

    // Detect Wave: Fast thumbstick movement
    const axesMagnitude = Math.sqrt(axes.x ** 2 + axes.y ** 2);
    if (axesMagnitude > GESTURE_THRESHOLDS.waveSpeed) {
      return 'wave';
    }

    // Detect Thumbs Up: Squeeze/grip button
    if (squeeze) {
      return 'thumbsUp';
    }

    // Detect Point: Hand extended forward
    if (gripPosition.z < -0.3 && speed < 0.1) {
      return 'point';
    }

    // Detect Fist: A button, B button, or trigger pressed
    const aButton = buttons.get('a-button');
    const bButton = buttons.get('b-button');
    if (aButton?.pressed || bButton?.pressed || selection) {
      return 'fist';
    }

    // Detect Open Hand: Relaxed state
    if (
      speed < 0.1 &&
      !squeeze &&
      !selection &&
      aButton?.value === 0 &&
      bButton?.value === 0 &&
      axesMagnitude < 0.2
    ) {
      return 'openHand';
    }

    return 'none';
  };

  return (
    <group>
      {/* Visual feedback for current gesture */}
      {currentGesture !== 'none' && (
        <>
          <mesh position={[0, 2, -0.5]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color={getGestureColor(currentGesture)} transparent opacity={0.8} />
          </mesh>

          {/* Gesture indicator text */}
          <Text
            position={[0, 2.5, -0.5]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {getGestureName(currentGesture)}
          </Text>
        </>
      )}

      {/* Controller position indicators (for debugging) */}
      {enabled && xrInputManagerRef.current && (
        <>
          {xrInputManagerRef.current.getLeftController() && (
            <mesh position={xrInputManagerRef.current.getLeftController()!.gripPosition}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
          )}
          {xrInputManagerRef.current.getRightController() && (
            <mesh position={xrInputManagerRef.current.getRightController()!.gripPosition}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color="#0000ff" />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}

function getGestureColor(gesture: GestureType): string {
  switch (gesture) {
    case 'wave':
      return '#00ff00'; // Green
    case 'thumbsUp':
      return '#00ffff'; // Cyan
    case 'thumbsDown':
      return '#ff00ff'; // Magenta
    case 'point':
      return '#ffff00'; // Yellow
    case 'fist':
      return '#ff6600'; // Orange
    case 'openHand':
      return '#6666ff'; // Blue
    default:
      return '#888888'; // Gray
  }
}

function getGestureName(gesture: GestureType): string {
  switch (gesture) {
    case 'wave':
      return '👋 Wave';
    case 'thumbsUp':
      return '👍 Thumbs Up';
    case 'thumbsDown':
      return '👎 Thumbs Down';
    case 'point':
      return '👆 Point';
    case 'fist':
      return '✊ Fist';
    case 'openHand':
      return '🖐 Open Hand';
    default:
      return '';
  }
}
