import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Physics Demo Scene
 *
 * Comprehensive demo showcasing Cannon.js physics integration:
 * - Gravity and falling objects
 * - Material-based bouncing
 * - Force and impulse application
 * - VR grabbing and throwing
 * - Collision detection
 * - Stacking mechanics
 */
import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { Engine } from '../core';
import { TransformComponent } from '../ecs';
import { PhysicsSystem, PhysicsBodyComponent } from '../physics';
import { XRInputManager, XRInputSystem, VRInteractableComponent } from '../xr';
export function PhysicsDemo() {
    const [state, setState] = useState({
        running: false,
        vrEnabled: false,
        bodyCount: 0,
        selectedMaterial: 'default',
        showPhysicsDebug: false,
        error: null,
    });
    const engineRef = useRef(null);
    const physicsSystemRef = useRef(null);
    const xrInputManagerRef = useRef(null);
    // Initialize demo
    useEffect(() => {
        initializeDemo();
        return () => cleanupDemo();
    }, []);
    const initializeDemo = async () => {
        console.log('=== Physics Demo Initializing ===\n');
        try {
            // 1. Create Engine
            console.log('1. Creating engine...');
            const engine = new Engine();
            engineRef.current = engine;
            console.log('✓ Engine created');
            // 2. Create Physics System
            console.log('\n2. Creating physics system...');
            const physicsSystem = new PhysicsSystem({
                gravity: { x: 0, y: -9.82, z: 0 },
                allowSleep: true,
                broadphase: 'SAP',
            });
            physicsSystemRef.current = physicsSystem;
            engine.getWorld().addSystem(physicsSystem);
            console.log('✓ Physics system added');
            console.log('  - Gravity: (0, -9.82, 0)');
            console.log('  - Sleep mode: enabled');
            console.log('  - Broadphase: SAP');
            // 3. Initialize VR Input
            console.log('\n3. Initializing VR input...');
            const xrInputManager = new XRInputManager({
                autoEnable: true,
            });
            xrInputManagerRef.current = xrInputManager;
            const xrSupported = await navigator.xr?.isSessionSupported('immersive-vr');
            if (xrSupported) {
                setState(prev => ({ ...prev, vrEnabled: true }));
                console.log('✓ VR supported');
                // Setup VR grab events for physics
                xrInputManager.on('entityGrabbed', (entityId) => {
                    handleEntityGrabbed(entityId);
                });
                xrInputManager.on('entityThrown', (entityId, controllerId, velocity) => {
                    handleEntityThrown(entityId, controllerId, velocity);
                });
            }
            else {
                console.log('⚠ VR not supported, running in desktop mode');
            }
            const xrInputSystem = new XRInputSystem(xrInputManager, {
                enableHapticFeedback: true,
                hapticStrength: 0.5,
            });
            engine.getWorld().addSystem(xrInputSystem);
            console.log('✓ VR input system added');
            // 4. Create Demo Scene
            console.log('\n4. Creating physics demo scene...');
            createPhysicsDemoScene(engine, physicsSystem);
            console.log('✓ Physics scene created');
            // 5. Start engine
            console.log('\n5. Starting engine...');
            await engine.start();
            setState(prev => ({ ...prev, running: true }));
            console.log('✓ Engine started');
            // 6. Update body count
            updateBodyCount();
            console.log('\n=== Physics Demo Ready! ===');
            console.log('Controls:');
            console.log('  - Click: Spawn object');
            console.log('  - Space: Spawn stack');
            console.log('  - R: Reset scene');
            console.log('  - M: Change material');
            console.log('  - VR Grip: Grab objects');
            console.log('  - WASD: Move (desktop)');
            console.log('  - Mouse: Look around (desktop)');
            // Setup keyboard controls
            setupKeyboardControls();
        }
        catch (error) {
            console.error('✗ Demo initialization failed:', error);
            setState(prev => ({ ...prev, error: error.message }));
        }
    };
    const createPhysicsDemoScene = (engine, physicsSystem) => {
        const world = engine.getWorld();
        // Create floor (static)
        console.log('  Creating floor...');
        const floor = world.createEntity();
        const floorTransform = new TransformComponent();
        floorTransform.position.set(0, 0, 0);
        floor.addComponent(TransformComponent, floorTransform);
        const floorBody = new PhysicsBodyComponent({
            mass: 0, // Static
            shape: 'box',
            size: new Vector3(20, 0.5, 20),
            material: 'default',
        });
        // Rotate floor to be flat
        floorBody.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        physicsSystem.addPhysicsBody(floor.id, floorBody);
        // Create walls
        console.log('  Creating walls...');
        createWall(world, physicsSystem, new Vector3(0, 2.5, -10), new Vector3(20, 5, 0.5)); // Back
        createWall(world, physicsSystem, new Vector3(0, 2.5, 10), new Vector3(20, 5, 0.5)); // Front
        createWall(world, physicsSystem, new Vector3(-10, 2.5, 0), new Vector3(0.5, 5, 20)); // Left
        createWall(world, physicsSystem, new Vector3(10, 2.5, 0), new Vector3(0.5, 5, 20)); // Right
        // Create demo objects
        console.log('  Creating demo objects...');
        createBouncingBalls(world, physicsSystem);
        createStackingBoxes(world, physicsSystem);
        createGrabbableCubes(world, physicsSystem);
        // Create ramps
        console.log('  Creating ramps...');
        createRamp(world, physicsSystem, new Vector3(-5, 0, -5), Math.PI / 6);
        createRamp(world, physicsSystem, new Vector3(5, 0, 5), -Math.PI / 6);
    };
    const createWall = (world, physicsSystem, position, size) => {
        const wall = world.createEntity();
        const wallTransform = new TransformComponent();
        wallTransform.position.copy(position);
        wall.addComponent(TransformComponent, wallTransform);
        const wallBody = new PhysicsBodyComponent({
            mass: 0,
            shape: 'box',
            size: size,
        });
        physicsSystem.addPhysicsBody(wall.id, wallBody);
    };
    const createRamp = (world, physicsSystem, position, rotation) => {
        const ramp = world.createEntity();
        const rampTransform = new TransformComponent();
        rampTransform.position.copy(position);
        ramp.addComponent(TransformComponent, rampTransform);
        const rampBody = new PhysicsBodyComponent({
            mass: 0,
            shape: 'box',
            size: new Vector3(4, 0.2, 8),
        });
        rampBody.body.quaternion.setFromEuler(0, 0, rotation);
        physicsSystem.addPhysicsBody(ramp.id, rampBody);
    };
    const createBouncingBalls = (world, physicsSystem) => {
        const materials = ['default', 'bouncy', 'slippery'];
        materials.forEach((mat, index) => {
            const ball = world.createEntity();
            const ballTransform = new TransformComponent();
            ballTransform.position.set(-3 + index * 3, 5, 0);
            ball.addComponent(TransformComponent, ballTransform);
            const ballBody = new PhysicsBodyComponent({
                mass: 1,
                shape: 'sphere',
                radius: 0.3,
                material: mat,
            });
            physicsSystem.addPhysicsBody(ball.id, ballBody);
        });
        console.log('    - 3 bouncing balls (default, bouncy, slippery)');
    };
    const createStackingBoxes = (world, physicsSystem) => {
        const stackHeight = 5;
        const boxSize = 0.5;
        for (let i = 0; i < stackHeight; i++) {
            const box = world.createEntity();
            const boxTransform = new TransformComponent();
            boxTransform.position.set(3, boxSize / 2 + i * boxSize, 2);
            box.addComponent(TransformComponent, boxTransform);
            const boxBody = new PhysicsBodyComponent({
                mass: 1,
                shape: 'box',
                size: new Vector3(boxSize, boxSize, boxSize),
                material: 'default',
            });
            physicsSystem.addPhysicsBody(box.id, boxBody);
        }
        console.log('    - Stack of 5 boxes');
    };
    const createGrabbableCubes = (world, physicsSystem) => {
        const positions = [
            new Vector3(-2, 1, 3),
            new Vector3(0, 1, 3),
            new Vector3(2, 1, 3),
        ];
        positions.forEach((pos) => {
            const cube = world.createEntity();
            const cubeTransform = new TransformComponent();
            cubeTransform.position.copy(pos);
            cubeTransform.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            cube.addComponent(TransformComponent, cubeTransform);
            const cubeBody = new PhysicsBodyComponent({
                mass: 1,
                shape: 'box',
                size: new Vector3(0.4, 0.4, 0.4),
                material: 'bouncy',
            });
            physicsSystem.addPhysicsBody(cube.id, cubeBody);
            // Make grabbable
            const interactable = new VRInteractableComponent({
                interactable: true,
                grabbable: true,
                throwable: true,
                highlightOnHover: true,
            });
            cube.addComponent(VRInteractableComponent, interactable);
        });
        console.log('    - 3 grabbable physics cubes');
    };
    const handleEntityGrabbed = (entityId) => {
        console.log('Entity grabbed:', entityId);
        const engine = engineRef.current;
        if (!engine)
            return;
        const entity = engine.getWorld().getEntity(entityId);
        if (!entity)
            return;
        const physicsBody = entity.getComponent(PhysicsBodyComponent);
        if (physicsBody) {
            // Make static while grabbed
            physicsBody.body.type = 1; // DYNAMIC (not STATIC type issue)
            physicsBody.body.mass = 0;
            physicsBody.body.updateMassProperties();
            physicsBody.body.wakeUp();
        }
    };
    const handleEntityThrown = (entityId, controllerId, velocity) => {
        console.log('Entity thrown:', entityId, 'velocity:', velocity);
        const engine = engineRef.current;
        if (!engine)
            return;
        const entity = engine.getWorld().getEntity(entityId);
        if (!entity)
            return;
        const physicsBody = entity.getComponent(PhysicsBodyComponent);
        if (physicsBody) {
            // Make dynamic again
            physicsBody.body.type = 1; // DYNAMIC
            physicsBody.body.mass = 1;
            physicsBody.body.updateMassProperties();
            physicsBody.setVelocity(velocity);
            physicsBody.wakeUp();
        }
        // Provide haptic feedback
        const xrInputManager = xrInputManagerRef.current;
        if (xrInputManager) {
            xrInputManager.triggerHapticPulse(controllerId, 0.5);
        }
    };
    const spawnObject = () => {
        const engine = engineRef.current;
        const physicsSystem = physicsSystemRef.current;
        if (!engine || !physicsSystem)
            return;
        const world = engine.getWorld();
        // Spawn random object
        const objectType = Math.floor(Math.random() * 3);
        const x = (Math.random() - 0.5) * 6;
        const y = 8 + Math.random() * 2;
        const z = (Math.random() - 0.5) * 6;
        const entity = world.createEntity();
        const transform = new TransformComponent();
        transform.position.set(x, y, z);
        entity.addComponent(TransformComponent, transform);
        let body;
        if (objectType === 0) {
            // Box
            body = new PhysicsBodyComponent({
                mass: 1,
                shape: 'box',
                size: new Vector3(0.5, 0.5, 0.5),
                material: state.selectedMaterial,
            });
        }
        else if (objectType === 1) {
            // Sphere
            body = new PhysicsBodyComponent({
                mass: 1,
                shape: 'sphere',
                radius: 0.3,
                material: state.selectedMaterial,
            });
        }
        else {
            // Cylinder
            body = new PhysicsBodyComponent({
                mass: 1,
                shape: 'cylinder',
                radius: 0.3,
                height: 0.6,
                material: state.selectedMaterial,
            });
        }
        physicsSystem.addPhysicsBody(entity.id, body);
        updateBodyCount();
        console.log(`Spawned ${['box', 'sphere', 'cylinder'][objectType]} at (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`);
    };
    const spawnStack = () => {
        const engine = engineRef.current;
        const physicsSystem = physicsSystemRef.current;
        if (!engine || !physicsSystem)
            return;
        const world = engine.getWorld();
        const stackHeight = 8;
        const boxSize = 0.4;
        for (let i = 0; i < stackHeight; i++) {
            const box = world.createEntity();
            const boxTransform = new TransformComponent();
            boxTransform.position.set(-6 + Math.random() * 0.1, boxSize / 2 + i * boxSize, -6 + Math.random() * 0.1);
            box.addComponent(TransformComponent, boxTransform);
            const boxBody = new PhysicsBodyComponent({
                mass: 1,
                shape: 'box',
                size: new Vector3(boxSize, boxSize, boxSize),
                material: 'default',
            });
            physicsSystem.addPhysicsBody(box.id, boxBody);
        }
        updateBodyCount();
        console.log(`Spawned stack of ${stackHeight} boxes`);
    };
    const resetScene = () => {
        const engine = engineRef.current;
        const physicsSystem = physicsSystemRef.current;
        if (!engine || !physicsSystem)
            return;
        // Remove all entities except floor and walls
        const world = engine.getWorld();
        const entities = world.getEntities();
        entities.forEach(entity => {
            const physicsBody = entity.getComponent(PhysicsBodyComponent);
            if (physicsBody && physicsBody.body.mass > 0) {
                physicsSystem.removePhysicsBody(entity.id);
                world.removeEntity(entity.id);
            }
        });
        // Recreate demo objects
        createBouncingBalls(world, physicsSystem);
        createStackingBoxes(world, physicsSystem);
        createGrabbableCubes(world, physicsSystem);
        updateBodyCount();
        console.log('Scene reset');
    };
    const cycleMaterial = () => {
        const materials = ['default', 'bouncy', 'slippery'];
        const currentIndex = materials.indexOf(state.selectedMaterial);
        const nextIndex = (currentIndex + 1) % materials.length;
        const nextMaterial = materials[nextIndex];
        setState(prev => ({ ...prev, selectedMaterial: nextMaterial }));
        console.log('Material changed to:', nextMaterial);
    };
    const updateBodyCount = () => {
        const physicsSystem = physicsSystemRef.current;
        if (physicsSystem) {
            const stats = physicsSystem.getStats();
            setState(prev => ({ ...prev, bodyCount: stats.entities }));
        }
    };
    const setupKeyboardControls = () => {
        const handleKeyDown = (event) => {
            switch (event.code) {
                case 'Space':
                    spawnStack();
                    break;
                case 'KeyR':
                    resetScene();
                    break;
                case 'KeyM':
                    cycleMaterial();
                    break;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    };
    const handleEnterVR = async () => {
        const xrInputManager = xrInputManagerRef.current;
        if (!xrInputManager)
            return;
        try {
            const session = await navigator.xr.requestSession('immersive-vr', {
                optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
            });
            const referenceSpace = await session.requestReferenceSpace('local-floor');
            await xrInputManager.initialize(session, referenceSpace);
            console.log('✓ Entered VR mode');
            const onXRFrame = (_time, frame) => {
                if (xrInputManager) {
                    xrInputManager.update(frame, referenceSpace);
                }
                session.requestAnimationFrame(onXRFrame);
            };
            session.requestAnimationFrame(onXRFrame);
        }
        catch (error) {
            console.error('Failed to enter VR:', error);
            setState(prev => ({ ...prev, error: 'VR entry failed' }));
        }
    };
    const cleanupDemo = () => {
        console.log('\n=== Cleaning up physics demo ===');
        const xrInputManager = xrInputManagerRef.current;
        if (xrInputManager) {
            xrInputManager.dispose();
        }
        const physicsSystem = physicsSystemRef.current;
        if (physicsSystem) {
            physicsSystem.dispose();
        }
        const engine = engineRef.current;
        if (engine) {
            engine.stop();
        }
        console.log('✓ Cleanup complete');
    };
    return (_jsxs("div", { style: { width: '100vw', height: '100vh', position: 'relative' }, children: [_jsxs(Canvas, { camera: { position: [0, 5, 10], fov: 75 }, style: { background: '#1a1a2e' }, onClick: spawnObject, children: [_jsx("ambientLight", { intensity: 0.5 }), _jsx("pointLight", { position: [10, 10, 10], intensity: 1 }), _jsx("directionalLight", { position: [0, 10, 0], intensity: 0.5 }), _jsx("hemisphereLight", { args: ['#87CEEB', '#362312', 0.3] }), _jsx(PhysicsSceneComponents, { engine: engineRef.current })] }), _jsxs("div", { style: {
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    padding: 15,
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    borderRadius: 8,
                    fontFamily: 'monospace',
                    fontSize: 14,
                    maxWidth: 320,
                }, children: [_jsx("h2", { children: "\u269B\uFE0F Physics Demo" }), _jsxs("div", { style: { margin: '10px 0' }, children: [_jsxs("div", { children: ["\uD83C\uDFAE Running: ", state.running ? '✓' : '✗'] }), _jsxs("div", { children: ["\uD83E\uDD7D VR: ", state.vrEnabled ? '✓' : '✗'] }), _jsxs("div", { children: ["\uD83D\uDCE6 Bodies: ", state.bodyCount] }), _jsxs("div", { children: ["\uD83C\uDFA8 Material: ", state.selectedMaterial] })] }), _jsxs("div", { style: { marginTop: 15, paddingTop: 15, borderTop: '1px solid white' }, children: [_jsxs("div", { style: { marginBottom: 10 }, children: [_jsx("button", { onClick: spawnObject, style: {
                                            padding: '8px 16px',
                                            marginRight: '5px',
                                            cursor: 'pointer',
                                            background: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 4,
                                        }, children: "Spawn Object" }), _jsx("button", { onClick: spawnStack, style: {
                                            padding: '8px 16px',
                                            marginRight: '5px',
                                            cursor: 'pointer',
                                            background: '#2196F3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 4,
                                        }, children: "Spawn Stack" })] }), _jsxs("div", { style: { marginBottom: 10 }, children: [_jsx("button", { onClick: resetScene, style: {
                                            padding: '8px 16px',
                                            marginRight: '5px',
                                            cursor: 'pointer',
                                            background: '#FF9800',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 4,
                                        }, children: "Reset (R)" }), _jsx("button", { onClick: cycleMaterial, style: {
                                            padding: '8px 16px',
                                            cursor: 'pointer',
                                            background: '#9C27B0',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 4,
                                        }, children: "Material (M)" })] }), _jsx("div", { children: _jsx("button", { onClick: handleEnterVR, disabled: !state.vrEnabled, style: {
                                        padding: '8px 16px',
                                        cursor: state.vrEnabled ? 'pointer' : 'not-allowed',
                                        background: state.vrEnabled ? '#f44336' : '#666',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 4,
                                    }, children: "Enter VR" }) })] }), state.error && (_jsxs("div", { style: { color: '#ff6b6b', marginTop: 10 }, children: ["\u26A0\uFE0F ", state.error] })), _jsxs("div", { style: { marginTop: 15, fontSize: 12 }, children: [_jsx("div", { style: { marginBottom: 5 }, children: "Controls:" }), _jsx("div", { children: "Click: Spawn object" }), _jsx("div", { children: "Space: Spawn stack" }), _jsx("div", { children: "R: Reset scene" }), _jsx("div", { children: "M: Change material" }), _jsx("div", { children: "VR Grip: Grab/throw" })] })] }), _jsxs("div", { style: {
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    padding: 10,
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    borderRadius: 8,
                    fontFamily: 'monospace',
                    fontSize: 12,
                }, children: [_jsx("div", { children: "Physics Features:" }), _jsx("div", { children: "\u2713 Gravity simulation" }), _jsx("div", { children: "\u2713 Material-based bouncing" }), _jsx("div", { children: "\u2713 Stacking mechanics" }), _jsx("div", { children: "\u2713 VR grab & throw" }), _jsx("div", { children: "\u2713 Collision detection" })] })] }));
}
// Physics scene components
function PhysicsSceneComponents({ engine: _engine }) {
    return (_jsxs("group", { children: [_jsxs("mesh", { rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0], receiveShadow: true, children: [_jsx("planeGeometry", { args: [20, 20] }), _jsx("meshStandardMaterial", { color: "#4a4a4a" })] }), _jsxs("mesh", { position: [0, 2.5, -10], receiveShadow: true, children: [_jsx("boxGeometry", { args: [20, 5, 0.5] }), _jsx("meshStandardMaterial", { color: "#6a6a6a", opacity: 0.5, transparent: true })] }), _jsxs("mesh", { position: [0, 2.5, 10], receiveShadow: true, children: [_jsx("boxGeometry", { args: [20, 5, 0.5] }), _jsx("meshStandardMaterial", { color: "#6a6a6a", opacity: 0.5, transparent: true })] }), _jsxs("mesh", { position: [-10, 2.5, 0], receiveShadow: true, children: [_jsx("boxGeometry", { args: [0.5, 5, 20] }), _jsx("meshStandardMaterial", { color: "#6a6a6a", opacity: 0.5, transparent: true })] }), _jsxs("mesh", { position: [10, 2.5, 0], receiveShadow: true, children: [_jsx("boxGeometry", { args: [0.5, 5, 20] }), _jsx("meshStandardMaterial", { color: "#6a6a6a", opacity: 0.5, transparent: true })] }), _jsxs("mesh", { position: [-3, 5, 0], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.3, 16, 16] }), _jsx("meshStandardMaterial", { color: "#ffffff" })] }), _jsxs("mesh", { position: [0, 5, 0], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.3, 16, 16] }), _jsx("meshStandardMaterial", { color: "#ff69b4" })] }), _jsxs("mesh", { position: [3, 5, 0], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.3, 16, 16] }), _jsx("meshStandardMaterial", { color: "#87ceeb" })] }), [0, 1, 2, 3, 4].map((i) => (_jsxs("mesh", { position: [3, 0.25 + i * 0.5, 2], castShadow: true, receiveShadow: true, children: [_jsx("boxGeometry", { args: [0.5, 0.5, 0.5] }), _jsx("meshStandardMaterial", { color: "#8b4513" })] }, i))), _jsxs("mesh", { position: [-2, 1, 3], castShadow: true, children: [_jsx("boxGeometry", { args: [0.4, 0.4, 0.4] }), _jsx("meshStandardMaterial", { color: "#ff0000" })] }), _jsxs("mesh", { position: [0, 1, 3], castShadow: true, children: [_jsx("boxGeometry", { args: [0.4, 0.4, 0.4] }), _jsx("meshStandardMaterial", { color: "#00ff00" })] }), _jsxs("mesh", { position: [2, 1, 3], castShadow: true, children: [_jsx("boxGeometry", { args: [0.4, 0.4, 0.4] }), _jsx("meshStandardMaterial", { color: "#0000ff" })] }), _jsx("ambientLight", { intensity: 0.5 }), _jsx("pointLight", { position: [10, 10, 10] }), _jsx("directionalLight", { position: [0, 10, 0], intensity: 0.5 })] }));
}
export default PhysicsDemo;
