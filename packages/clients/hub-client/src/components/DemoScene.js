import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Text } from '@react-three/drei';
import { Float, MeshDistortMaterial, Stars, Environment } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
/**
 * RotatingCube - A rotating cube with distort material
 */
function RotatingCube({ position }) {
    const meshRef = useRef(null);
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.01;
            meshRef.current.rotation.y += 0.01;
        }
    });
    return (_jsx(Float, { speed: 2, rotationIntensity: 1, floatIntensity: 1, children: _jsxs("mesh", { ref: meshRef, position: position, children: [_jsx("boxGeometry", { args: [1, 1, 1] }), _jsx(MeshDistortMaterial, { color: "#6366f1", attach: "material", distort: 0.4, speed: 2, roughness: 0.2, metalness: 0.8 })] }) }));
}
/**
 * BouncingSphere - A bouncing sphere with shiny material
 */
function BouncingSphere({ position }) {
    const meshRef = useRef(null);
    const offsetRef = useRef(Math.random() * Math.PI * 2);
    useFrame((_state) => {
        if (meshRef.current) {
            const time = _state.clock.elapsedTime + offsetRef.current;
            meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.5;
        }
    });
    return (_jsxs("mesh", { ref: meshRef, position: position, children: [_jsx("sphereGeometry", { args: [0.5, 32, 32] }), _jsx("meshStandardMaterial", { color: "#ec4899", roughness: 0.1, metalness: 0.9, envMapIntensity: 1 })] }));
}
/**
 * SpinningTorus - A spinning torus knot
 */
function SpinningTorus({ position }) {
    const meshRef = useRef(null);
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.02;
            meshRef.current.rotation.z += 0.01;
        }
    });
    return (_jsx(Float, { speed: 1.5, rotationIntensity: 0.5, floatIntensity: 0.5, children: _jsxs("mesh", { ref: meshRef, position: position, children: [_jsx("torusGeometry", { args: [0.4, 0.15, 16, 32] }), _jsx("meshStandardMaterial", { color: "#10b981", roughness: 0.3, metalness: 0.7 })] }) }));
}
/**
 * Platform - A decorative platform
 */
function Platform({ position, color }) {
    return (_jsxs("mesh", { position: position, receiveShadow: true, children: [_jsx("cylinderGeometry", { args: [1.5, 1.5, 0.2, 32] }), _jsx("meshStandardMaterial", { color: color, roughness: 0.8, metalness: 0.2 })] }));
}
/**
 * InfoText - 3D text labels
 */
function InfoText({ position, text }) {
    return (_jsx(Text, { position: position, fontSize: 0.15, color: "#ffffff", anchorX: "center", anchorY: "middle", outlineWidth: 0.02, outlineColor: "#000000", children: text }));
}
/**
 * DemoScene - A showcase 3D environment
 *
 * Features:
 * - Floating geometric shapes with animations
 * - Platform pedestals for each object
 * - Information labels
 * - Starfield background
 * - Environment lighting
 */
export function DemoScene() {
    return (_jsxs(_Fragment, { children: [_jsx(Stars, { radius: 100, depth: 50, count: 5000, factor: 4, saturation: 0, fade: true, speed: 1 }), _jsx(Environment, { preset: "city" }), _jsx("ambientLight", { intensity: 0.5 }), _jsx("directionalLight", { position: [10, 10, 5], intensity: 1, castShadow: true, "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048 }), _jsx("pointLight", { position: [10, 5, 10], intensity: 0.5, color: "#6366f1", distance: 20 }), _jsx("pointLight", { position: [-10, 5, -10], intensity: 0.5, color: "#ec4899", distance: 20 }), _jsx("pointLight", { position: [0, 10, 0], intensity: 0.3, color: "#10b981", distance: 15 }), _jsxs("group", { position: [0, 0, 0], children: [_jsxs("group", { position: [5, 0.5, 0], children: [_jsx(Platform, { position: [0, -0.5, 0], color: "#6366f1" }), _jsx(RotatingCube, { position: [0, 0.5, 0] }), _jsx(InfoText, { position: [0, 2, 0], text: "Rotating Cube" })] }), _jsxs("group", { position: [-5, 0.5, 0], children: [_jsx(Platform, { position: [0, -0.5, 0], color: "#ec4899" }), _jsx(BouncingSphere, { position: [0, 0.5, 0] }), _jsx(InfoText, { position: [0, 2, 0], text: "Bouncing Sphere" })] }), _jsxs("group", { position: [0, 0.5, 5], children: [_jsx(Platform, { position: [0, -0.5, 0], color: "#10b981" }), _jsx(SpinningTorus, { position: [0, 0.5, 0] }), _jsx(InfoText, { position: [0, 2, 0], text: "Spinning Torus" })] }), _jsxs("group", { position: [0, 0.5, -5], children: [_jsx(Platform, { position: [0, -0.5, 0], color: "#3b82f6" }), _jsx(RotatingCube, { position: [0, 0.5, 0] }), _jsx(InfoText, { position: [0, 2, 0], text: "Distorted Cube" })] })] }), _jsx(Text, { position: [0, 4, 0], fontSize: 0.3, color: "#ffffff", anchorX: "center", anchorY: "middle", outlineWidth: 0.03, outlineColor: "#000000", children: "GraphWiz-XR Demo Scene" }), _jsx(Text, { position: [0, 3.5, 0], fontSize: 0.15, color: "#a0aec0", anchorX: "center", anchorY: "middle", children: "Use WASD to move \u2022 Mouse to look \u2022 Explore!" })] }));
}
