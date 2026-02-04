import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * NetworkedAvatar Component
 *
 * Renders other users' avatars in the 3D scene based on their networked avatar configuration.
 * Supports all 5 body types with custom colors and heights.
 */
import { Text } from '@react-three/drei';
import { useRef, useEffect } from 'react';
/**
 * Human Avatar Component
 */
function HumanAvatar({ primaryColor, secondaryColor, scale, }) {
    return (_jsxs("group", { scale: [scale, scale, scale], children: [_jsxs("mesh", { position: [0, 0.7, 0], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.2, 16, 16] }), _jsx("meshStandardMaterial", { color: secondaryColor })] }), _jsxs("mesh", { position: [0, 0.35, 0], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.15, 0.15, 0.5, 16] }), _jsx("meshStandardMaterial", { color: primaryColor })] }), _jsxs("mesh", { position: [-0.2, 0.4, 0], rotation: [0, 0, Math.PI / 6], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.05, 0.05, 0.4, 8] }), _jsx("meshStandardMaterial", { color: primaryColor })] }), _jsxs("mesh", { position: [0.2, 0.4, 0], rotation: [0, 0, -Math.PI / 6], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.05, 0.05, 0.4, 8] }), _jsx("meshStandardMaterial", { color: primaryColor })] }), _jsxs("mesh", { position: [-0.08, 0.05, 0], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.06, 0.06, 0.35, 8] }), _jsx("meshStandardMaterial", { color: secondaryColor })] }), _jsxs("mesh", { position: [0.08, 0.05, 0], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.06, 0.06, 0.35, 8] }), _jsx("meshStandardMaterial", { color: secondaryColor })] })] }));
}
/**
 * Robot Avatar Component
 */
function RobotAvatar({ primaryColor, secondaryColor, scale, }) {
    return (_jsxs("group", { scale: [scale, scale, scale], children: [_jsxs("mesh", { position: [0, 0.7, 0], castShadow: true, children: [_jsx("boxGeometry", { args: [0.3, 0.3, 0.3] }), _jsx("meshStandardMaterial", { color: secondaryColor, metalness: 0.8, roughness: 0.2 })] }), _jsxs("mesh", { position: [-0.08, 0.72, 0.15], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.04, 8, 8] }), _jsx("meshStandardMaterial", { color: "#00FFFF", emissive: "#00FFFF", emissiveIntensity: 0.5 })] }), _jsxs("mesh", { position: [0.08, 0.72, 0.15], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.04, 8, 8] }), _jsx("meshStandardMaterial", { color: "#00FFFF", emissive: "#00FFFF", emissiveIntensity: 0.5 })] }), _jsxs("mesh", { position: [0, 0.35, 0], castShadow: true, children: [_jsx("boxGeometry", { args: [0.35, 0.45, 0.25] }), _jsx("meshStandardMaterial", { color: primaryColor, metalness: 0.6, roughness: 0.4 })] }), _jsxs("mesh", { position: [0, 0.9, 0], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.02, 0.02, 0.1, 8] }), _jsx("meshStandardMaterial", { color: secondaryColor })] }), _jsxs("mesh", { position: [0, 0.96, 0], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.04, 8, 8] }), _jsx("meshStandardMaterial", { color: "#FF0000", emissive: "#FF0000", emissiveIntensity: 0.8 })] }), _jsxs("mesh", { position: [-0.22, 0.4, 0], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.06, 0.06, 0.35, 8] }), _jsx("meshStandardMaterial", { color: secondaryColor, metalness: 0.7 })] }), _jsxs("mesh", { position: [0.22, 0.4, 0], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.06, 0.06, 0.35, 8] }), _jsx("meshStandardMaterial", { color: secondaryColor, metalness: 0.7 })] }), _jsxs("mesh", { position: [-0.1, 0.05, 0], castShadow: true, children: [_jsx("boxGeometry", { args: [0.12, 0.35, 0.12] }), _jsx("meshStandardMaterial", { color: primaryColor })] }), _jsxs("mesh", { position: [0.1, 0.05, 0], castShadow: true, children: [_jsx("boxGeometry", { args: [0.12, 0.35, 0.12] }), _jsx("meshStandardMaterial", { color: primaryColor })] })] }));
}
/**
 * Alien Avatar Component
 */
function AlienAvatar({ primaryColor, secondaryColor, scale, }) {
    return (_jsxs("group", { scale: [scale, scale, scale], children: [_jsxs("mesh", { position: [0, 0.85, 0], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.25, 16, 16] }), _jsx("meshStandardMaterial", { color: secondaryColor })] }), _jsxs("mesh", { position: [-0.1, 0.88, 0.2], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.08, 16, 16] }), _jsx("meshStandardMaterial", { color: "#000000" })] }), _jsxs("mesh", { position: [0.1, 0.88, 0.2], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.08, 16, 16] }), _jsx("meshStandardMaterial", { color: "#000000" })] }), _jsxs("mesh", { position: [0, 0.3, 0], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.12, 0.08, 0.35, 16] }), _jsx("meshStandardMaterial", { color: primaryColor })] }), _jsxs("mesh", { position: [-0.15, 0.35, 0], rotation: [0, 0, Math.PI / 4], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.03, 0.03, 0.4, 8] }), _jsx("meshStandardMaterial", { color: secondaryColor })] }), _jsxs("mesh", { position: [0.15, 0.35, 0], rotation: [0, 0, -Math.PI / 4], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.03, 0.03, 0.4, 8] }), _jsx("meshStandardMaterial", { color: secondaryColor })] }), _jsxs("mesh", { position: [-0.05, 0.05, 0], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.04, 0.04, 0.35, 8] }), _jsx("meshStandardMaterial", { color: primaryColor })] }), _jsxs("mesh", { position: [0.05, 0.05, 0], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.04, 0.04, 0.35, 8] }), _jsx("meshStandardMaterial", { color: primaryColor })] })] }));
}
/**
 * Animal Avatar Component
 */
function AnimalAvatar({ primaryColor, secondaryColor, scale, }) {
    return (_jsxs("group", { scale: [scale, scale, scale], children: [_jsxs("mesh", { position: [0, 0.45, 0.15], castShadow: true, children: [_jsx("boxGeometry", { args: [0.25, 0.2, 0.3] }), _jsx("meshStandardMaterial", { color: secondaryColor })] }), _jsxs("mesh", { position: [-0.1, 0.6, 0.15], rotation: [0, 0, -0.3], castShadow: true, children: [_jsx("coneGeometry", { args: [0.06, 0.15, 8] }), _jsx("meshStandardMaterial", { color: secondaryColor })] }), _jsxs("mesh", { position: [0.1, 0.6, 0.15], rotation: [0, 0, 0.3], castShadow: true, children: [_jsx("coneGeometry", { args: [0.06, 0.15, 8] }), _jsx("meshStandardMaterial", { color: secondaryColor })] }), _jsxs("mesh", { position: [0, 0.4, 0.32], castShadow: true, children: [_jsx("boxGeometry", { args: [0.15, 0.12, 0.12] }), _jsx("meshStandardMaterial", { color: secondaryColor })] }), _jsxs("mesh", { position: [0, 0.4, 0.38], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.03, 8, 8] }), _jsx("meshStandardMaterial", { color: "#000000" })] }), _jsxs("mesh", { position: [0, 0.25, -0.05], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.15, 0.12, 0.35, 12] }), _jsx("meshStandardMaterial", { color: primaryColor })] }), _jsxs("mesh", { position: [0, 0.3, -0.28], rotation: [Math.PI / 4, 0, 0], castShadow: true, children: [_jsx("coneGeometry", { args: [0.04, 0.2, 8] }), _jsx("meshStandardMaterial", { color: primaryColor })] }), _jsxs("mesh", { position: [-0.08, 0.05, 0.05], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.04, 0.04, 0.25, 8] }), _jsx("meshStandardMaterial", { color: primaryColor })] }), _jsxs("mesh", { position: [0.08, 0.05, 0.05], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.04, 0.04, 0.25, 8] }), _jsx("meshStandardMaterial", { color: primaryColor })] }), _jsxs("mesh", { position: [-0.08, 0.05, -0.15], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.04, 0.04, 0.25, 8] }), _jsx("meshStandardMaterial", { color: primaryColor })] }), _jsxs("mesh", { position: [0.08, 0.05, -0.15], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.04, 0.04, 0.25, 8] }), _jsx("meshStandardMaterial", { color: primaryColor })] })] }));
}
/**
 * Abstract Avatar Component
 */
function AbstractAvatar({ primaryColor, secondaryColor, scale, }) {
    return (_jsxs("group", { scale: [scale, scale, scale], children: [_jsxs("mesh", { position: [0, 0.45, 0], castShadow: true, children: [_jsx("icosahedronGeometry", { args: [0.3, 0] }), _jsx("meshStandardMaterial", { color: primaryColor, metalness: 0.3, roughness: 0.7, transparent: true, opacity: 0.9 })] }), _jsxs("mesh", { position: [0, 0.45, 0], castShadow: true, children: [_jsx("octahedronGeometry", { args: [0.15, 0] }), _jsx("meshStandardMaterial", { color: secondaryColor, emissive: secondaryColor, emissiveIntensity: 0.5 })] }), _jsxs("mesh", { position: [0, 0.45, 0], rotation: [Math.PI / 2, 0, 0], castShadow: true, children: [_jsx("torusGeometry", { args: [0.35, 0.02, 8, 32] }), _jsx("meshStandardMaterial", { color: secondaryColor })] }), _jsxs("mesh", { position: [0, 0.45, 0], rotation: [0, Math.PI / 2, 0], castShadow: true, children: [_jsx("torusGeometry", { args: [0.38, 0.02, 8, 32] }), _jsx("meshStandardMaterial", { color: primaryColor })] }), _jsxs("group", { children: [_jsxs("mesh", { position: [0.3, 0.6, 0], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.05, 8, 8] }), _jsx("meshStandardMaterial", { color: secondaryColor, emissive: secondaryColor, emissiveIntensity: 0.8 })] }), _jsxs("mesh", { position: [-0.3, 0.5, 0], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.04, 8, 8] }), _jsx("meshStandardMaterial", { color: primaryColor, emissive: primaryColor, emissiveIntensity: 0.8 })] }), _jsxs("mesh", { position: [0, 0.75, 0.2], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.03, 8, 8] }), _jsx("meshStandardMaterial", { color: secondaryColor, emissive: secondaryColor, emissiveIntensity: 0.8 })] })] })] }));
}
/**
 * Main NetworkedAvatar Component
 */
export function NetworkedAvatar({ position, rotation, displayName, avatarConfig }) {
    const groupRef = useRef(null);
    // Smooth rotation animation
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y = rotation[1];
        }
    }, [rotation]);
    // Calculate scale based on height (normalize: 1.7m = scale 1.0)
    const heightScale = avatarConfig.height / 1.7;
    // Render avatar body based on type
    const renderAvatar = () => {
        const { body_type, primary_color, secondary_color } = avatarConfig;
        const props = {
            primaryColor: primary_color,
            secondaryColor: secondary_color,
            scale: heightScale,
        };
        switch (body_type) {
            case 'human':
                return _jsx(HumanAvatar, { ...props });
            case 'robot':
                return _jsx(RobotAvatar, { ...props });
            case 'alien':
                return _jsx(AlienAvatar, { ...props });
            case 'animal':
                return _jsx(AnimalAvatar, { ...props });
            case 'abstract':
                return _jsx(AbstractAvatar, { ...props });
            default:
                return _jsx(HumanAvatar, { ...props });
        }
    };
    return (_jsxs("group", { ref: groupRef, position: position, children: [renderAvatar(), _jsx(Text, { position: [0, 1.3 * heightScale, 0], fontSize: 0.2, color: "white", anchorX: "center", anchorY: "middle", outlineWidth: 0.02, outlineColor: "#000000", children: displayName })] }));
}
