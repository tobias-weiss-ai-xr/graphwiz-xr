import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
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
    minGestureDuration: 200 // ms
};
export function GestureRecognition({ onGestureDetected, enabled = true }) {
    const [currentGesture, setCurrentGesture] = useState('none');
    const leftControllerRef = useRef(null);
    const rightControllerRef = useRef(null);
    const gestureStartTimeRef = useRef(new Map());
    const lastGestureRef = useRef(new Map());
    // Initialize controller states
    useEffect(() => {
        leftControllerRef.current = {
            position: new THREE.Vector3(),
            rotation: new THREE.Quaternion(),
            velocity: new THREE.Vector3(),
            previousPosition: new THREE.Vector3()
        };
        rightControllerRef.current = {
            position: new THREE.Vector3(),
            rotation: new THREE.Quaternion(),
            velocity: new THREE.Vector3(),
            previousPosition: new THREE.Vector3()
        };
    }, []);
    // Track controller positions and detect gestures
    useFrame(() => {
        if (!enabled)
            return;
        // Check VR controller positions
        const leftPosition = getControllerPosition('left');
        const rightPosition = getControllerPosition('right');
        if (leftPosition) {
            updateControllerState('left', leftPosition);
            detectGesture('left');
        }
        if (rightPosition) {
            updateControllerState('right', rightPosition);
            detectGesture('right');
        }
    });
    const getControllerPosition = (controllerId) => {
        // In a real implementation, this would get actual VR controller position
        // For now, we'll return null if no VR controller is detected
        // This component would be integrated with actual XR input system
        // Simulate controller position for testing
        const simulatedPosition = new THREE.Vector3(controllerId === 'left' ? -0.5 : 0.5, 0.2, -0.5);
        // Only return simulated position if enabled for testing
        // In production, this would use actual XR input
        return enabled ? simulatedPosition : null;
    };
    const updateControllerState = (controllerId, position) => {
        const controller = controllerId === 'left' ? leftControllerRef.current : rightControllerRef.current;
        if (!controller)
            return;
        // Store previous position
        controller.previousPosition.copy(controller.position);
        // Update current position
        controller.position.copy(position);
        // Calculate velocity
        const velocity = new THREE.Vector3()
            .subVectors(controller.position, controller.previousPosition)
            .multiplyScalar(60); // 60 FPS
        controller.velocity.copy(velocity);
        // Update rotation (simplified - in real implementation would get actual controller rotation)
        // controller.rotation.copy(rotation);
    };
    const detectGesture = (controllerId) => {
        const controller = controllerId === 'left' ? leftControllerRef.current : rightControllerRef.current;
        if (!controller)
            return;
        const gesture = recognizeGesture(controller, controllerId);
        // Debounce gestures - only report if sustained for minimum duration
        if (gesture !== 'none') {
            const now = Date.now();
            const startTime = gestureStartTimeRef.current.get(controllerId) || 0;
            const lastGesture = lastGestureRef.current.get(controllerId) || 'none';
            if (gesture !== lastGesture) {
                // New gesture detected
                gestureStartTimeRef.current.set(controllerId, now);
                lastGestureRef.current.set(controllerId, gesture);
                // Check if gesture has been held long enough
                if (now - startTime >= GESTURE_THRESHOLDS.minGestureDuration) {
                    setCurrentGesture(gesture);
                    onGestureDetected?.(gesture, controllerId);
                }
            }
        }
        else {
            // No gesture - reset
            gestureStartTimeRef.current.delete(controllerId);
            lastGestureRef.current.set(controllerId, 'none');
            if (currentGesture !== 'none') {
                setCurrentGesture('none');
            }
        }
    };
    const recognizeGesture = (controller, _controllerId) => {
        const { position, velocity } = controller;
        const speed = velocity.length();
        // Detect Wave: Fast side-to-side movement
        if (speed > GESTURE_THRESHOLDS.waveSpeed) {
            const horizontalSpeed = Math.abs(velocity.x);
            const verticalSpeed = Math.abs(velocity.y);
            if (horizontalSpeed > verticalSpeed * 2) {
                return 'wave';
            }
        }
        // Detect Thumbs Up/Down based on controller tilt (simplified)
        // In real implementation, would check thumb position relative to hand
        // For now, we'll use rotation-based approximation
        // Detect Point: Hand extended forward
        if (position.z < -0.3 && speed < 0.1) {
            return 'point';
        }
        // Detect Fist: Hand small and still (simplified - real implementation would check finger spread)
        if (speed < 0.1) {
            // In real VR, would check finger tracking data
            // For now, assume if hand is closed and still
            return 'fist';
        }
        // Detect Open Hand: Hand still and not fist
        if (speed < 0.1 && position.z > -0.1) {
            return 'openHand';
        }
        return 'none';
    };
    return (_jsxs("group", { children: [currentGesture !== 'none' && (_jsxs("mesh", { position: [0, 2, -0.5], children: [_jsx("sphereGeometry", { args: [0.3, 16, 16] }), _jsx("meshBasicMaterial", { color: getGestureColor(currentGesture), transparent: true, opacity: 0.8 })] })), currentGesture !== 'none' && (_jsx(Text, { position: [0, 2.5, -0.5], fontSize: 0.2, color: "white", anchorX: "center", anchorY: "middle", outlineWidth: 0.02, outlineColor: "#000000", children: getGestureName(currentGesture) })), enabled && (_jsxs(_Fragment, { children: [_jsxs("mesh", { position: leftControllerRef.current?.position || [0, 0, 0], children: [_jsx("sphereGeometry", { args: [0.1, 8, 8] }), _jsx("meshBasicMaterial", { color: "#ff0000" })] }), _jsxs("mesh", { position: rightControllerRef.current?.position || [0, 0, 0], children: [_jsx("sphereGeometry", { args: [0.1, 8, 8] }), _jsx("meshBasicMaterial", { color: "#0000ff" })] })] }))] }));
}
function getGestureColor(gesture) {
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
function getGestureName(gesture) {
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
