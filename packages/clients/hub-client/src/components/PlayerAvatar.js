import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PlayerAvatar Component
 *
 * Renders a player avatar with name tag.
 */
import { Text } from '@react-three/drei';
import { useRef } from 'react';
export function PlayerAvatar({ position, rotation, displayName, color = '#4CAF50', isLocalPlayer = false, }) {
    const groupRef = useRef(null);
    return (_jsxs("group", { ref: groupRef, position: position, rotation: rotation, children: [_jsxs("mesh", { castShadow: true, children: [_jsx("capsuleGeometry", { args: [0.3, 0.8, 8, 16] }), _jsx("meshStandardMaterial", { color: color })] }), _jsxs("mesh", { position: [0, 0.7, 0], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.2, 16, 16] }), _jsx("meshStandardMaterial", { color: "#FFCC80" })] }), displayName && (_jsx(Text, { position: [0, 1.2, 0], fontSize: 0.2, color: isLocalPlayer ? '#00FF00' : 'white', anchorX: "center", anchorY: "middle", outlineWidth: 0.02, outlineColor: "#000000", children: isLocalPlayer ? `${displayName} (You)` : displayName }))] }));
}
