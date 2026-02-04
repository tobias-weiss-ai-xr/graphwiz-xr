import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Grab Demo Scene
 *
 * Demonstrates the object grabbing system with various interactable objects.
 * Features:
 * - Multiple grabbable objects (cubes, spheres, cylinders)
 * - Visual feedback on hover
 * - Network synchronization
 * - Physics-based throwing
 */
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { GrabbableComponent } from '../ecs/components';
import { useNetworkedGrabSystem } from '../systems/GrabSystem';
/**
 * Individual grabbable object component
 */
function GrabbableObject({ id: _id, position, geometry, color, scale = 1, grabbable, isHovered, isGrabbed, onPointerDown, onPointerUp, onPointerEnter, onPointerLeave, }) {
    const meshRef = useRef(null);
    const originalColor = useRef(color);
    const canGrab = !grabbable.isGrabbed || grabbable.grabbedBy !== null;
    // Update color based on state
    useFrame(() => {
        if (!meshRef.current)
            return;
        // Reset to original color
        const material = meshRef.current.material;
        if (isGrabbed) {
            material.color.set(0x00ff00); // Green when grabbed
            material.emissive.set(0x003300);
        }
        else if (isHovered && canGrab) {
            material.color.set(0xffff00); // Yellow when hovered
            material.emissive.set(0x333300);
        }
        else {
            material.color.set(originalColor.current);
            material.emissive.set(0x000000);
        }
    });
    // Geometry props
    const geometryArgs = useMemo(() => {
        const s = scale;
        switch (geometry) {
            case 'box':
                return [s, s, s];
            case 'sphere':
                return [s / 2, 32, 32];
            case 'cylinder':
                return [s / 3, s / 3, s, 32];
            case 'cone':
                return [s / 2, s, 32];
            case 'torus':
                return [s / 2, s / 6, 16, 100];
            default:
                return [1, 1, 1];
        }
    }, [geometry, scale]);
    return (_jsxs("mesh", { ref: meshRef, position: position, castShadow: true, receiveShadow: true, onPointerDown: onPointerDown, onPointerUp: onPointerUp, onPointerEnter: onPointerEnter, onPointerLeave: onPointerLeave, children: [geometry === 'box' && _jsx("boxGeometry", { args: geometryArgs }), geometry === 'sphere' && _jsx("sphereGeometry", { args: geometryArgs }), geometry === 'cylinder' && _jsx("cylinderGeometry", { args: geometryArgs }), geometry === 'cone' && _jsx("coneGeometry", { args: geometryArgs }), geometry === 'torus' && _jsx("torusGeometry", { args: geometryArgs }), _jsx("meshStandardMaterial", { color: color, metalness: 0.3, roughness: 0.4 })] }));
}
/**
 * Grab Demo Scene Component
 */
export function GrabDemoScene({ myClientId, sendGrabMessage, }) {
    const [grabbableObjects] = useState(() => {
        const objects = new Map();
        // Create grabbable objects
        const objectConfigs = [
            { id: 'grab-cube-1', geometry: 'box', position: [2, 1, 0], color: '#ff6b6b', scale: 1 },
            { id: 'grab-sphere-1', geometry: 'sphere', position: [3, 1, 1], color: '#4ecdc4', scale: 1 },
            { id: 'grab-cylinder-1', geometry: 'cylinder', position: [4, 1, -1], color: '#45b7d1', scale: 1 },
            { id: 'grab-cone-1', geometry: 'cone', position: [2, 1, 2], color: '#f9ca24', scale: 1 },
            { id: 'grab-torus-1', geometry: 'torus', position: [3, 1, -2], color: '#6c5ce7', scale: 1 },
            // Smaller objects
            { id: 'grab-box-small-1', geometry: 'box', position: [1, 0.5, 1], color: '#a29bfe', scale: 0.5 },
            { id: 'grab-sphere-small-1', geometry: 'sphere', position: [1.5, 0.5, -1], color: '#fd79a8', scale: 0.5 },
            { id: 'grab-cube-small-2', geometry: 'box', position: [5, 0.5, 0], color: '#00b894', scale: 0.5 },
            // Heavy objects
            { id: 'grab-box-large-1', geometry: 'box', position: [-2, 1.5, 0], color: '#e17055', scale: 1.5 },
            { id: 'grab-sphere-large-1', geometry: 'sphere', position: [-3, 1.5, 1], color: '#0984e3', scale: 1.5 },
        ];
        for (const config of objectConfigs) {
            const grabbable = new GrabbableComponent(config.scale, // mass
            100, // breakaway force
            15, // max throw speed
            true // can be thrown
            );
            objects.set(config.id, {
                id: config.id,
                object: null, // Will be set by the mesh ref
                grabbable,
            });
        }
        return objects;
    });
    const [hoveredId, setHoveredId] = useState(null);
    const [grabbedId, setGrabbedId] = useState(null);
    // Network sync handlers
    const handleGrab = useCallback((target) => {
        console.log('[GrabDemo] Grabbed:', target.entityId);
        setGrabbedId(target.entityId);
    }, []);
    const handleRelease = useCallback((target, velocity) => {
        console.log('[GrabDemo] Released:', target?.entityId, 'velocity:', velocity);
        setGrabbedId(null);
    }, []);
    const handleHover = useCallback((target) => {
        setHoveredId(target?.entityId || null);
    }, []);
    // Grab system
    const { grab, release, isGrabbing } = useNetworkedGrabSystem(grabbableObjects, myClientId, sendGrabMessage, {
        maxGrabDistance: 5,
        grabSmoothness: 0.15,
        throwMultiplier: 1.5,
        onGrab: handleGrab,
        onRelease: handleRelease,
        onHover: handleHover,
    });
    // Mouse input handling
    useEffect(() => {
        const handleMouseDown = (e) => {
            if (e.button === 0) {
                // Left click
                grab();
            }
        };
        const handleMouseUp = (e) => {
            if (e.button === 0) {
                release();
            }
        };
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [grab, release]);
    return (_jsxs(_Fragment, { children: [_jsx(Text, { position: [0, 3, -5], fontSize: 0.3, color: "white", anchorX: "center", anchorY: "middle", children: "Object Grabbing Demo" }), _jsx(Text, { position: [0, 2.5, -5], fontSize: 0.15, color: "#cccccc", anchorX: "center", anchorY: "middle", children: "Click and hold to grab objects \u2022 Drag to move \u2022 Release to throw" }), _jsx(Text, { position: [0, 2, -5], fontSize: 0.12, color: isGrabbing ? '#00ff00' : '#888888', anchorX: "center", anchorY: "middle", children: isGrabbing ? '🟢 GRABBING' : '⚪ Ready' }), Array.from(grabbableObjects.entries()).map(([id, data]) => {
                // Find config for this object
                const configs = [
                    { id: 'grab-cube-1', geometry: 'box', position: [2, 1, 0], color: '#ff6b6b', scale: 1 },
                    { id: 'grab-sphere-1', geometry: 'sphere', position: [3, 1, 1], color: '#4ecdc4', scale: 1 },
                    { id: 'grab-cylinder-1', geometry: 'cylinder', position: [4, 1, -1], color: '#45b7d1', scale: 1 },
                    { id: 'grab-cone-1', geometry: 'cone', position: [2, 1, 2], color: '#f9ca24', scale: 1 },
                    { id: 'grab-torus-1', geometry: 'torus', position: [3, 1, -2], color: '#6c5ce7', scale: 1 },
                    { id: 'grab-box-small-1', geometry: 'box', position: [1, 0.5, 1], color: '#a29bfe', scale: 0.5 },
                    { id: 'grab-sphere-small-1', geometry: 'sphere', position: [1.5, 0.5, -1], color: '#fd79a8', scale: 0.5 },
                    { id: 'grab-cube-small-2', geometry: 'box', position: [5, 0.5, 0], color: '#00b894', scale: 0.5 },
                    { id: 'grab-box-large-1', geometry: 'box', position: [-2, 1.5, 0], color: '#e17055', scale: 1.5 },
                    { id: 'grab-sphere-large-1', geometry: 'sphere', position: [-3, 1.5, 1], color: '#0984e3', scale: 1.5 },
                ];
                const config = configs.find((c) => c.id === id);
                if (!config)
                    return null;
                return (_jsx(GrabbableObject, { id: id, position: config.position, geometry: config.geometry, color: config.color, scale: config.scale, grabbable: data.grabbable, isHovered: hoveredId === id, isGrabbed: grabbedId === id, onPointerDown: () => { }, onPointerUp: () => { }, onPointerEnter: () => setHoveredId(id), onPointerLeave: () => setHoveredId(null) }, id));
            }), _jsxs("mesh", { rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0], receiveShadow: true, children: [_jsx("planeGeometry", { args: [20, 20] }), _jsx("meshStandardMaterial", { color: "#333333", roughness: 0.8 })] }), _jsxs("mesh", { rotation: [-Math.PI / 2, 0, 0], position: [1.5, 0.01, 0], receiveShadow: true, children: [_jsx("planeGeometry", { args: [10, 10] }), _jsx("meshStandardMaterial", { color: "#444444", roughness: 0.7 })] }), _jsx("ambientLight", { intensity: 0.5 }), _jsx("directionalLight", { position: [5, 10, 5], intensity: 1, castShadow: true, "shadow-mapSize": [2048, 2048] }), _jsx("pointLight", { position: [-5, 5, -5], intensity: 0.5, color: "#8888ff" })] }));
}
