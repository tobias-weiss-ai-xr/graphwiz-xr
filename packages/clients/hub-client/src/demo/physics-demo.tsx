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

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Engine } from '../core';
import { TransformComponent } from '../ecs';
import { PhysicsSystem, PhysicsBodyComponent } from '../physics';
import { XRInputManager, XRInputSystem, VRInteractableComponent } from '../xr';
import { Vector3 } from 'three';

interface PhysicsDemoState {
  running: boolean;
  vrEnabled: boolean;
  bodyCount: number;
  selectedMaterial: string;
  showPhysicsDebug: boolean;
  error: string | null;
}

export function PhysicsDemo() {
  const [state, setState] = useState<PhysicsDemoState>({
    running: false,
    vrEnabled: false,
    bodyCount: 0,
    selectedMaterial: 'default',
    showPhysicsDebug: false,
    error: null,
  });

  const engineRef = useRef<Engine | null>(null);
  const physicsSystemRef = useRef<PhysicsSystem | null>(null);
  const xrInputManagerRef = useRef<XRInputManager | null>(null);

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
      } else {
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

    } catch (error) {
      console.error('✗ Demo initialization failed:', error);
      setState(prev => ({ ...prev, error: (error as Error).message }));
    }
  };

  const createPhysicsDemoScene = (engine: Engine, physicsSystem: PhysicsSystem) => {
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
    createWall(world, physicsSystem, new Vector3(0, 2.5, 10), new Vector3(20, 5, 0.5));  // Front
    createWall(world, physicsSystem, new Vector3(-10, 2.5, 0), new Vector3(0.5, 5, 20)); // Left
    createWall(world, physicsSystem, new Vector3(10, 2.5, 0), new Vector3(0.5, 5, 20));  // Right

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

  const createWall = (
    world: any,
    physicsSystem: PhysicsSystem,
    position: Vector3,
    size: Vector3
  ) => {
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

  const createRamp = (
    world: any,
    physicsSystem: PhysicsSystem,
    position: Vector3,
    rotation: number
  ) => {
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

  const createBouncingBalls = (world: any, physicsSystem: PhysicsSystem) => {
    const materials = ['default', 'bouncy', 'slippery'] as const;

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

  const createStackingBoxes = (world: any, physicsSystem: PhysicsSystem) => {
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

  const createGrabbableCubes = (world: any, physicsSystem: PhysicsSystem) => {
    const positions = [
      new Vector3(-2, 1, 3),
      new Vector3(0, 1, 3),
      new Vector3(2, 1, 3),
    ];

    positions.forEach((pos) => {
      const cube = world.createEntity();
      const cubeTransform = new TransformComponent();
      cubeTransform.position.copy(pos);
      cubeTransform.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
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

  const handleEntityGrabbed = (entityId: string) => {
    console.log('Entity grabbed:', entityId);

    const engine = engineRef.current;
    if (!engine) return;

    const entity = engine.getWorld().getEntity(entityId);
    if (!entity) return;

    const physicsBody = entity.getComponent(PhysicsBodyComponent);
    if (physicsBody) {
    // Make static while grabbed
    physicsBody.body.type = 1 as any; // DYNAMIC (not STATIC type issue)
    physicsBody.body.mass = 0;
    physicsBody.body.updateMassProperties();
    physicsBody.body.wakeUp();
    }
  };

  const handleEntityThrown = (entityId: string, controllerId: string, velocity: any) => {
    console.log('Entity thrown:', entityId, 'velocity:', velocity);

    const engine = engineRef.current;
    if (!engine) return;

    const entity = engine.getWorld().getEntity(entityId);
    if (!entity) return;

    const physicsBody = entity.getComponent(PhysicsBodyComponent);
    if (physicsBody) {
      // Make dynamic again
      physicsBody.body.type = 1 as any; // DYNAMIC
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
    if (!engine || !physicsSystem) return;

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

    let body: PhysicsBodyComponent;

    if (objectType === 0) {
      // Box
      body = new PhysicsBodyComponent({
        mass: 1,
        shape: 'box',
        size: new Vector3(0.5, 0.5, 0.5),
        material: state.selectedMaterial as any,
      });
    } else if (objectType === 1) {
      // Sphere
      body = new PhysicsBodyComponent({
        mass: 1,
        shape: 'sphere',
        radius: 0.3,
        material: state.selectedMaterial as any,
      });
    } else {
      // Cylinder
      body = new PhysicsBodyComponent({
        mass: 1,
        shape: 'cylinder',
        radius: 0.3,
        height: 0.6,
        material: state.selectedMaterial as any,
      });
    }

    physicsSystem.addPhysicsBody(entity.id, body);
    updateBodyCount();

    console.log(`Spawned ${['box', 'sphere', 'cylinder'][objectType]} at (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`);
  };

  const spawnStack = () => {
    const engine = engineRef.current;
    const physicsSystem = physicsSystemRef.current;
    if (!engine || !physicsSystem) return;

    const world = engine.getWorld();
    const stackHeight = 8;
    const boxSize = 0.4;

    for (let i = 0; i < stackHeight; i++) {
      const box = world.createEntity();
      const boxTransform = new TransformComponent();
      boxTransform.position.set(
        -6 + Math.random() * 0.1,
        boxSize / 2 + i * boxSize,
        -6 + Math.random() * 0.1
      );
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
    if (!engine || !physicsSystem) return;

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
    const handleKeyDown = (event: KeyboardEvent) => {
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
    if (!xrInputManager) return;

    try {
      const session = await navigator.xr!.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
      });

      const referenceSpace = await session.requestReferenceSpace('local-floor');
      await xrInputManager.initialize(session, referenceSpace);

      console.log('✓ Entered VR mode');

      const onXRFrame = (_time: number, frame: XRFrame) => {
        if (xrInputManager) {
          xrInputManager.update(frame, referenceSpace);
        }
        session.requestAnimationFrame(onXRFrame);
      };

      session.requestAnimationFrame(onXRFrame);
    } catch (error) {
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

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        style={{ background: '#1a1a2e' }}
        onClick={spawnObject}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[0, 10, 0]} intensity={0.5} />
        <hemisphereLight args={['#87CEEB', '#362312', 0.3]} />

        {/* Physics Scene Components */}
        <PhysicsSceneComponents engine={engineRef.current} />
      </Canvas>

      {/* UI Overlay */}
      <div style={{
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
      }}>
        <h2>⚛️ Physics Demo</h2>
        <div style={{ margin: '10px 0' }}>
          <div>🎮 Running: {state.running ? '✓' : '✗'}</div>
          <div>🥽 VR: {state.vrEnabled ? '✓' : '✗'}</div>
          <div>📦 Bodies: {state.bodyCount}</div>
          <div>🎨 Material: {state.selectedMaterial}</div>
        </div>

        <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid white' }}>
          <div style={{ marginBottom: 10 }}>
            <button
              onClick={spawnObject}
              style={{
                padding: '8px 16px',
                marginRight: '5px',
                cursor: 'pointer',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: 4,
              }}
            >
              Spawn Object
            </button>
            <button
              onClick={spawnStack}
              style={{
                padding: '8px 16px',
                marginRight: '5px',
                cursor: 'pointer',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: 4,
              }}
            >
              Spawn Stack
            </button>
          </div>
          <div style={{ marginBottom: 10 }}>
            <button
              onClick={resetScene}
              style={{
                padding: '8px 16px',
                marginRight: '5px',
                cursor: 'pointer',
                background: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: 4,
              }}
            >
              Reset (R)
            </button>
            <button
              onClick={cycleMaterial}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                background: '#9C27B0',
                color: 'white',
                border: 'none',
                borderRadius: 4,
              }}
            >
              Material (M)
            </button>
          </div>
          <div>
            <button
              onClick={handleEnterVR}
              disabled={!state.vrEnabled}
              style={{
                padding: '8px 16px',
                cursor: state.vrEnabled ? 'pointer' : 'not-allowed',
                background: state.vrEnabled ? '#f44336' : '#666',
                color: 'white',
                border: 'none',
                borderRadius: 4,
              }}
            >
              Enter VR
            </button>
          </div>
        </div>

        {state.error && (
          <div style={{ color: '#ff6b6b', marginTop: 10 }}>
            ⚠️ {state.error}
          </div>
        )}

        <div style={{ marginTop: 15, fontSize: 12 }}>
          <div style={{ marginBottom: 5 }}>Controls:</div>
          <div>Click: Spawn object</div>
          <div>Space: Spawn stack</div>
          <div>R: Reset scene</div>
          <div>M: Change material</div>
          <div>VR Grip: Grab/throw</div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        padding: 10,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        borderRadius: 8,
        fontFamily: 'monospace',
        fontSize: 12,
      }}>
        <div>Physics Features:</div>
        <div>✓ Gravity simulation</div>
        <div>✓ Material-based bouncing</div>
        <div>✓ Stacking mechanics</div>
        <div>✓ VR grab & throw</div>
        <div>✓ Collision detection</div>
      </div>
    </div>
  );
}

// Physics scene components
function PhysicsSceneComponents({ engine: _engine }: { engine: Engine | null }) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.5]} />
        <meshStandardMaterial color="#6a6a6a" opacity={0.5} transparent />
      </mesh>
      <mesh position={[0, 2.5, 10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.5]} />
        <meshStandardMaterial color="#6a6a6a" opacity={0.5} transparent />
      </mesh>
      <mesh position={[-10, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 5, 20]} />
        <meshStandardMaterial color="#6a6a6a" opacity={0.5} transparent />
      </mesh>
      <mesh position={[10, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 5, 20]} />
        <meshStandardMaterial color="#6a6a6a" opacity={0.5} transparent />
      </mesh>

      {/* Bouncing balls */}
      <mesh position={[-3, 5, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 5, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>
      <mesh position={[3, 5, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#87ceeb" />
      </mesh>

      {/* Stacking boxes */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[3, 0.25 + i * 0.5, 2]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      ))}

      {/* Grabbable cubes */}
      <mesh position={[-2, 1, 3]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      <mesh position={[0, 1, 3]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>
      <mesh position={[2, 1, 3]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#0000ff" />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <directionalLight position={[0, 10, 0]} intensity={0.5} />
    </group>
  );
}

export default PhysicsDemo;
