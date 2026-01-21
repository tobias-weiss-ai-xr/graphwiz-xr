import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
export function Portal({ position, rotation = [0, 0, 0], scale = [1, 1, 1], targetRoomId, targetPosition = [0, 0, 0], color = '#6366f1', label, onTeleport }) {
    const portalRef = useRef(null);
    const innerRingRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [time, setTime] = useState(0);
    // Animate portal effect
    useFrame((_, delta) => {
        setTime((time) => time + delta);
        if (innerRingRef.current) {
            // Rotate inner ring faster
            innerRingRef.current.rotation.y += delta * 2;
            innerRingRef.current.rotation.z += delta * 1;
            // Pulse effect
            const scaleValue = 1 + Math.sin(time * 3) * 0.05;
            innerRingRef.current.scale.set(scaleValue, scaleValue, scaleValue);
        }
    });
    // Check if player is near portal for teleportation
    useFrame(() => {
        if (!portalRef.current)
            return;
        // Get player position from scene
        const scene = portalRef.current.parent;
        if (!scene)
            return;
        // Find camera in scene
        const camera = scene.children.find((child) => child.type === 'PerspectiveCamera');
        if (!camera)
            return;
        const playerPos = camera.position;
        const portalPos = new THREE.Vector3(...position);
        // Calculate distance to portal
        const distance = playerPos.distanceTo(portalPos);
        // Teleport if player is very close to portal
        if (distance < 0.5 && !isHovered) {
            setIsHovered(true);
            // Trigger teleport after a short delay
            setTimeout(() => {
                console.log(`[Portal] Teleporting to room: ${targetRoomId}`);
                onTeleport(targetRoomId, targetPosition);
                setIsHovered(false);
            }, 500);
        }
        // Reset hover state if player moves away
        if (distance > 1.0 && isHovered) {
            setIsHovered(false);
        }
    });
    return (_jsxs("group", { ref: portalRef, position: position, rotation: rotation, scale: scale, children: [_jsxs("mesh", { castShadow: true, children: [_jsx("torusGeometry", { args: [1.2, 0.1, 32, 32] }), _jsx("meshStandardMaterial", { color: color, emissive: color, emissiveIntensity: isHovered ? 0.5 : 0.2, transparent: true, opacity: 0.8 })] }), _jsxs("mesh", { ref: innerRingRef, castShadow: true, children: [_jsx("torusGeometry", { args: [0.9, 0.05, 32, 32] }), _jsx("meshStandardMaterial", { color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 0.3, transparent: true, opacity: 0.6 })] }), _jsxs("mesh", { position: [0, 0, 0], children: [_jsx("circleGeometry", { args: [0.8, 32] }), _jsx("meshBasicMaterial", { color: color, transparent: true, opacity: 0.3, side: THREE.DoubleSide })] }), _jsx("group", { children: Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i / 8) * Math.PI * 2;
                    return (_jsxs("mesh", { position: [
                            Math.cos(angle) * 1.0,
                            Math.sin(time * 2 + i) * 0.2,
                            Math.sin(angle) * 1.0
                        ], children: [_jsx("sphereGeometry", { args: [0.03, 8, 8] }), _jsx("meshBasicMaterial", { color: color, transparent: true, opacity: 0.8 - Math.abs(Math.sin(time * 2 + i)) * 0.4 })] }, i));
                }) }), label && (_jsxs("mesh", { position: [0, 2.5, 0], children: [_jsx("planeGeometry", { args: [1.5, 0.4] }), _jsx("meshBasicMaterial", { color: "rgba(0, 0, 0, 0.8)", transparent: true, side: THREE.DoubleSide }), _jsx(Text, { position: [0, 0, 0.01], fontSize: 0.15, color: "white", anchorX: "center", anchorY: "middle", outlineWidth: 0.01, outlineColor: "#000000", children: label })] }))] }));
}
