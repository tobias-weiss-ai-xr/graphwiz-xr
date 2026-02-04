import { jsx as _jsx } from "react/jsx-runtime";
import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { useRef } from 'react';
export function CameraController({ targetPosition, targetRotation, enabled = true, onCameraRotationChange }) {
    const controlsRef = useRef();
    const cameraOffset = useRef([0, 5, 8]); // Height, back distance
    const currentCameraPosition = useRef([0, 5, 8]);
    const { camera } = useThree();
    // Update controls target to follow player smoothly
    useFrame(() => {
        if (!enabled || !controlsRef.current)
            return;
        // Smoothly update camera target (player position + offset for height)
        const targetWithHeight = [
            targetPosition[0],
            targetPosition[1] + 1, // Look at player center (1 unit high)
            targetPosition[2]
        ];
        // Update controls target
        controlsRef.current.target.lerp({ x: targetWithHeight[0], y: targetWithHeight[1], z: targetWithHeight[2] }, 0.1);
        // Calculate ideal camera position based on player rotation
        const angle = targetRotation;
        const idealX = targetPosition[0] - Math.sin(angle) * cameraOffset.current[2];
        const idealY = targetPosition[1] + cameraOffset.current[1];
        const idealZ = targetPosition[2] - Math.cos(angle) * cameraOffset.current[2];
        // Smoothly move camera towards ideal position (lerp)
        currentCameraPosition.current[0] += (idealX - currentCameraPosition.current[0]) * 0.05;
        currentCameraPosition.current[1] += (idealY - currentCameraPosition.current[1]) * 0.05;
        currentCameraPosition.current[2] += (idealZ - currentCameraPosition.current[2]) * 0.05;
        // Apply position to camera
        camera.position.set(currentCameraPosition.current[0], currentCameraPosition.current[1], currentCameraPosition.current[2]);
        // Update controls
        controlsRef.current.update();
        // Report camera azimuth angle back to parent for movement calculation
        if (onCameraRotationChange && controlsRef.current) {
            // Get the azimuth angle from orbit controls
            const azimuth = controlsRef.current.getAzimuthalAngle();
            onCameraRotationChange(azimuth);
        }
    });
    return (_jsx(OrbitControls, { ref: controlsRef, enableDamping: true, dampingFactor: 0.05, minDistance: 3, maxDistance: 20, maxPolarAngle: Math.PI / 2.1, minPolarAngle: 0.1, enablePan: false, enableZoom: true, zoomSpeed: 0.5, rotateSpeed: 0.5 }));
}
