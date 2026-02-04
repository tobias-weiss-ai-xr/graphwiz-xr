import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Text, Grid } from '@react-three/drei';
import { Float, MeshDistortMaterial, Stars, Environment } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { useState, useRef } from 'react';
import { useEffect } from 'react';
function InteractiveButton({ position, objectId, color, onClick, isHovered, onHover, isActive, label }) {
    const meshRef = useRef(null);
    const [localActive, setLocalActive] = useState(false);
    const { camera, raycaster, pointer } = useThree();
    // Handle click detection
    useEffect(() => {
        const handlePointerDown = () => {
            if (meshRef.current) {
                meshRef.current.userData.isClicking = true;
                meshRef.current.userData.clickTime = Date.now();
            }
        };
        const handlePointerUp = () => {
            if (meshRef.current && meshRef.current.userData.isClicking) {
                const clickDuration = Date.now() - (meshRef.current.userData.clickTime || 0);
                meshRef.current.userData.isClicking = false;
                // Only register as click if quick (< 200ms)
                if (clickDuration < 200 && isHovered) {
                    setLocalActive(!localActive);
                    onClick(objectId);
                }
            }
        };
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isHovered, objectId, onClick]);
    // Check hover on each frame
    useFrame(() => {
        if (!meshRef.current)
            return;
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(meshRef.current);
        const wasHovered = isHovered;
        const nowHovered = intersects.length > 0;
        if (wasHovered !== nowHovered) {
            onHover(objectId, nowHovered);
        }
        // Animate when active
        if (localActive || isActive) {
            meshRef.current.rotation.y += 0.02;
        }
    });
    // Color interpolation
    const displayColor = (localActive || isActive) ? '#00ff00' : (isHovered ? '#ffff00' : color);
    return (_jsxs("group", { position: position, children: [_jsxs("mesh", { position: [0, -0.6, 0], receiveShadow: true, children: [_jsx("cylinderGeometry", { args: [1.2, 1.2, 0.2, 32] }), _jsx("meshStandardMaterial", { color: "#333333", roughness: 0.8 })] }), _jsx(Float, { speed: 1, rotationIntensity: 0.2, floatIntensity: 0.1, children: _jsxs("mesh", { ref: meshRef, position: [0, 0, 0], castShadow: true, scale: isHovered ? 1.1 : 1, children: [_jsx("boxGeometry", { args: [1, 1, 1] }), _jsx(MeshDistortMaterial, { color: displayColor, attach: "material", distort: isHovered ? 0.6 : 0.4, speed: 2, roughness: 0.2, metalness: 0.8 })] }) }), _jsx(Text, { position: [0, 1.5, 0], fontSize: 0.15, color: displayColor, anchorX: "center", anchorY: "middle", outlineWidth: 0.02, outlineColor: "#000000", children: label }), (localActive || isActive) && (_jsx(Text, { position: [0, -1.2, 0], fontSize: 0.12, color: "#00ff00", anchorX: "center", anchorY: "middle", children: "ACTIVE" }))] }));
}
function CollectibleGem({ position, gemId, collected, onCollect }) {
    const meshRef = useRef(null);
    const { camera, raycaster, pointer } = useThree();
    const [isHovered, setIsHovered] = useState(false);
    const scaleRef = useRef(1);
    useFrame(() => {
        if (!meshRef.current)
            return;
        // Check hover
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(meshRef.current);
        const hovered = intersects.length > 0 && !collected;
        if (hovered !== isHovered) {
            setIsHovered(hovered);
        }
        // Animation
        if (!collected) {
            meshRef.current.rotation.y += 0.01;
            meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.002) * 0.1;
            // Hover scale effect
            const targetScale = hovered ? 1.3 : 1;
            scaleRef.current += (targetScale - scaleRef.current) * 0.1;
            meshRef.current.scale.setScalar(scaleRef.current);
        }
    });
    // Handle click
    useEffect(() => {
        const handlePointerDown = () => {
            if (isHovered && !collected) {
                onCollect(gemId);
            }
        };
        window.addEventListener('pointerdown', handlePointerDown);
        return () => window.removeEventListener('pointerdown', handlePointerDown);
    }, [isHovered, collected, gemId, onCollect]);
    if (collected)
        return null;
    return (_jsxs("group", { position: position, children: [_jsxs("mesh", { ref: meshRef, castShadow: true, children: [_jsx("octahedronGeometry", { args: [0.4, 0] }), _jsx("meshStandardMaterial", { color: "#ff00ff", emissive: "#ff00ff", emissiveIntensity: isHovered ? 0.5 : 0.2, roughness: 0.1, metalness: 1 })] }), _jsx("pointLight", { position: [0, 0, 0], color: "#ff00ff", intensity: isHovered ? 2 : 1, distance: 3 })] }));
}
function LightSwitch({ position, switchId, isOn, onToggle }) {
    const meshRef = useRef(null);
    const { camera, raycaster, pointer } = useThree();
    const [isHovered, setIsHovered] = useState(false);
    useFrame(() => {
        if (!meshRef.current)
            return;
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(meshRef.current);
        const hovered = intersects.length > 0;
        if (hovered !== isHovered) {
            setIsHovered(hovered);
        }
        // Animation when on
        if (isOn) {
            meshRef.current.rotation.y += 0.02;
        }
    });
    // Handle click
    useEffect(() => {
        const handlePointerDown = () => {
            if (isHovered) {
                onToggle(switchId);
            }
        };
        window.addEventListener('pointerdown', handlePointerDown);
        return () => window.removeEventListener('pointerdown', handlePointerDown);
    }, [isHovered, switchId, onToggle]);
    return (_jsxs("group", { position: position, children: [_jsxs("mesh", { position: [0, 1.5, 0], children: [_jsx("sphereGeometry", { args: [0.3, 16, 16] }), _jsx("meshStandardMaterial", { color: isOn ? '#ffff00' : '#333333', emissive: isOn ? '#ffff00' : '#000000', emissiveIntensity: isOn ? 1 : 0 })] }), isOn && (_jsx("pointLight", { position: [0, 1.5, 0], color: "#ffff00", intensity: 3, distance: 10, castShadow: true })), _jsxs("mesh", { position: [0, 0, 0], ref: meshRef, castShadow: true, children: [_jsx("boxGeometry", { args: [0.5, 1, 0.5] }), _jsx("meshStandardMaterial", { color: isHovered ? '#666666' : '#444444' })] }), _jsx(Text, { position: [0, 2, 0], fontSize: 0.12, color: isOn ? '#ffff00' : '#888888', anchorX: "center", children: isOn ? 'ON' : 'OFF' })] }));
}
export function InteractiveDemoScene({ wsClient, myClientId }) {
    const [objectStates, setObjectStates] = useState(new Map());
    const [hoveredObjects, setHoveredObjects] = useState(new Set());
    // Initialize object states
    useEffect(() => {
        const initialStates = new Map();
        // Create interactive buttons
        initialStates.set('button-red', { objectId: 'button-red', type: 'button', active: false, lastUpdate: Date.now(), clientId: '' });
        initialStates.set('button-blue', { objectId: 'button-blue', type: 'button', active: false, lastUpdate: Date.now(), clientId: '' });
        initialStates.set('button-green', { objectId: 'button-green', type: 'button', active: false, lastUpdate: Date.now(), clientId: '' });
        // Create collectible gems
        initialStates.set('gem-1', { objectId: 'gem-1', type: 'gem', active: false, lastUpdate: Date.now(), clientId: '' });
        initialStates.set('gem-2', { objectId: 'gem-2', type: 'gem', active: false, lastUpdate: Date.now(), clientId: '' });
        // Create light switches
        initialStates.set('light-1', { objectId: 'light-1', type: 'light', active: true, lastUpdate: Date.now(), clientId: '' });
        setObjectStates(initialStates);
    }, []);
    // Handle object clicks
    const handleObjectClick = (objectId) => {
        const state = objectStates.get(objectId);
        if (!state)
            return;
        const newState = {
            ...state,
            active: !state.active,
            lastUpdate: Date.now(),
            clientId: myClientId
        };
        setObjectStates(prev => new Map(prev).set(objectId, newState));
        // Broadcast to other players
        if (wsClient && wsClient.connected()) {
            console.log('[DemoScene] Broadcasting interaction:', objectId, newState);
            // Send via ENTITY_UPDATE
            wsClient.sendEntityUpdate({
                entityId: objectId,
                components: {
                    demoObjectState: newState
                }
            });
        }
        // If gem was collected, respawn after 5 seconds
        if (state.type === 'gem' && !state.active) {
            setTimeout(() => {
                setObjectStates(prev => {
                    const s = prev.get(objectId);
                    if (s) {
                        return new Map(prev).set(objectId, { ...s, active: false, lastUpdate: Date.now(), clientId: '' });
                    }
                    return prev;
                });
            }, 5000);
        }
    };
    // Handle light toggle
    const handleLightToggle = (lightId) => {
        handleObjectClick(lightId);
    };
    // Handle gem collection
    const handleGemCollect = (gemId) => {
        const state = objectStates.get(gemId);
        if (!state || state.active)
            return;
        const newState = {
            ...state,
            active: true, // true = collected
            lastUpdate: Date.now(),
            clientId: myClientId
        };
        setObjectStates(prev => new Map(prev).set(gemId, newState));
        // Broadcast to other players
        if (wsClient && wsClient.connected()) {
            console.log('[DemoScene] Broadcasting gem collection:', gemId);
            wsClient.sendEntityUpdate({
                entityId: gemId,
                components: {
                    demoObjectState: newState
                }
            });
        }
    };
    // Handle hover state
    const handleHover = (objectId, hovered) => {
        setHoveredObjects(prev => {
            const newSet = new Set(prev);
            if (hovered) {
                newSet.add(objectId);
            }
            else {
                newSet.delete(objectId);
            }
            return newSet;
        });
    };
    // Listen for ENTITY_UPDATE messages from other players
    useEffect(() => {
        if (!wsClient)
            return;
        const unsubscribe = wsClient.on(21, (message) => {
            if (message.payload && message.payload.components?.demoObjectState) {
                const state = message.payload.components.demoObjectState;
                console.log('[DemoScene] Received interaction:', state);
                setObjectStates(prev => {
                    // Only update if remote update is newer
                    const current = prev.get(state.objectId);
                    if (!current || state.lastUpdate > current.lastUpdate) {
                        return new Map(prev).set(state.objectId, state);
                    }
                    return prev;
                });
            }
        });
        return () => {
            if (unsubscribe)
                unsubscribe();
        };
    }, [wsClient]);
    return (_jsxs(_Fragment, { children: [_jsx(Stars, { radius: 100, depth: 50, count: 5000, factor: 4, saturation: 0, fade: true, speed: 1 }), _jsx(Environment, { preset: "city" }), _jsx("ambientLight", { intensity: 0.3 }), _jsx("directionalLight", { position: [10, 10, 5], intensity: 0.5, castShadow: true, "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048 }), _jsx("pointLight", { position: [10, 5, 10], intensity: 0.3, color: "#6366f1", distance: 20 }), _jsx("pointLight", { position: [-10, 5, -10], intensity: 0.3, color: "#ec4899", distance: 20 }), _jsx(InteractiveButton, { position: [5, 1, 0], objectId: "button-red", color: "#ef4444", onClick: handleObjectClick, isHovered: hoveredObjects.has('button-red'), onHover: handleHover, isActive: objectStates.get('button-red')?.active || false, label: "Button A" }), _jsx(InteractiveButton, { position: [-5, 1, 0], objectId: "button-blue", color: "#3b82f6", onClick: handleObjectClick, isHovered: hoveredObjects.has('button-blue'), onHover: handleHover, isActive: objectStates.get('button-blue')?.active || false, label: "Button B" }), _jsx(InteractiveButton, { position: [0, 1, 5], objectId: "button-green", color: "#10b981", onClick: handleObjectClick, isHovered: hoveredObjects.has('button-green'), onHover: handleHover, isActive: objectStates.get('button-green')?.active || false, label: "Button C" }), _jsx(CollectibleGem, { position: [3, 1.5, 3], gemId: "gem-1", collected: objectStates.get('gem-1')?.active || false, onCollect: handleGemCollect }), _jsx(CollectibleGem, { position: [-3, 1.5, -3], gemId: "gem-2", collected: objectStates.get('gem-2')?.active || false, onCollect: handleGemCollect }), _jsx(LightSwitch, { position: [0, 0, -5], switchId: "light-1", isOn: objectStates.get('light-1')?.active || false, onToggle: handleLightToggle }), _jsx(Grid, { args: [20, 20], cellSize: 1, cellThickness: 0.5, cellColor: "#6f6f6f", sectionSize: 5, sectionThickness: 1, sectionColor: "#9d4b4b", fadeDistance: 30, fadeStrength: 1, followCamera: false, infiniteGrid: true }), _jsxs("mesh", { receiveShadow: true, rotation: [-Math.PI / 2, 0, 0], position: [0, -0.01, 0], children: [_jsx("planeGeometry", { args: [20, 20] }), _jsx("shadowMaterial", { opacity: 0.3 })] }), _jsx(Text, { position: [0, 4, 0], fontSize: 0.3, color: "#ffffff", anchorX: "center", anchorY: "middle", outlineWidth: 0.03, outlineColor: "#000000", children: "Interactive Demo Scene" }), _jsx(Text, { position: [0, 3.5, 0], fontSize: 0.12, color: "#a0aec0", anchorX: "center", anchorY: "middle", children: "Click objects to interact \u2022 Changes sync across all players" })] }));
}
