import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Portal } from './Portal';
const PORTAL_LOCATIONS = [
    {
        id: 'lobby',
        label: '🏠 Lobby',
        position: [-8, 1, -8],
        color: '#6366f1'
    },
    {
        id: 'garden',
        label: '🌳 Garden',
        position: [8, 1, -8],
        color: '#10b981'
    },
    {
        id: 'sky',
        label: '☁️ Sky Lounge',
        position: [-8, 1, 8],
        color: '#3b82f6'
    },
    {
        id: 'beach',
        label: '🏖 Beach',
        position: [8, 1, 8],
        color: '#f59e0b'
    }
];
export function PortalDemoScene({}) {
    const [currentLocation, setCurrentLocation] = useState('lobby');
    const handleTeleport = (roomId, position) => {
        console.log(`[PortalDemo] Teleporting to: ${roomId}`);
        setCurrentLocation(roomId);
        // Teleport player by updating their position
        // This would be done through the network in a real implementation
        const event = new CustomEvent('teleport', {
            detail: { roomId, position }
        });
        window.dispatchEvent(event);
    };
    return (_jsxs("group", { children: [PORTAL_LOCATIONS.map((loc) => (_jsxs("mesh", { position: [loc.position[0], -0.1, loc.position[2]], receiveShadow: true, children: [_jsx("circleGeometry", { args: [3, 32] }), _jsx("meshStandardMaterial", { color: loc.color, transparent: true, opacity: 0.2 })] }, loc.id))), PORTAL_LOCATIONS.map((loc) => (_jsx(Portal, { position: loc.position, targetRoomId: loc.id, targetPosition: loc.position, color: loc.color, label: loc.label, onTeleport: handleTeleport }, loc.id))), PORTAL_LOCATIONS.map((loc) => {
                const isCurrent = loc.id === currentLocation;
                return (_jsxs("group", { position: loc.position, children: [_jsxs("mesh", { position: [0, -0.5, 0], receiveShadow: true, children: [_jsx("cylinderGeometry", { args: [2, 2.5, 0.2, 32] }), _jsx("meshStandardMaterial", { color: isCurrent ? loc.color : '#4a5568', metalness: 0.3, roughness: 0.7 })] }), isCurrent && (_jsxs("mesh", { position: [0, 0.1, 0], children: [_jsx("ringGeometry", { args: [2.5, 2.6, 32] }), _jsx("meshBasicMaterial", { color: loc.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide })] })), Array.from({ length: 4 }).map((_, i) => {
                            const angle = (i / 4) * Math.PI * 2;
                            return (_jsxs("mesh", { position: [
                                    Math.cos(angle) * 3,
                                    2 + Math.sin(Date.now() / 1000 + i) * 0.5,
                                    Math.sin(angle) * 3
                                ], children: [_jsx("sphereGeometry", { args: [0.1, 16, 16] }), _jsx("meshStandardMaterial", { color: loc.color, emissive: loc.color, emissiveIntensity: 0.5 })] }, i));
                        })] }, loc.id));
            }), _jsxs("mesh", { position: [0, 2, 0], children: [_jsx("boxGeometry", { args: [1, 0.5, 1] }), _jsx("meshStandardMaterial", { color: "#1e293b" })] }), _jsx(Text, { position: [0, 2.3, 0], fontSize: 0.2, color: "white", anchorX: "center", anchorY: "middle", outlineWidth: 0.02, outlineColor: "#000000", children: "Portal Hub" })] }));
}
