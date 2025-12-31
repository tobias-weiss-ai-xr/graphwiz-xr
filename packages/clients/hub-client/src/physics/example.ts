/**
 * Physics System Examples
 *
 * Demonstrates how to use the Cannon.js physics integration.
 */

import { Engine } from '../core';
import { PhysicsSystem, PhysicsBodyComponent } from '../physics';
import { TransformComponent } from '../ecs';
import { Vector3 } from 'three';

/**
 * Example 1: Basic Physics Setup
 *
 * Shows how to create a physics world with falling objects.
 */
export async function basicPhysicsSetup() {
  console.log('=== Basic Physics Setup ===\n');

  // Create engine with physics system
  const engine = new Engine();
  const physicsSystem = new PhysicsSystem({
    gravity: { x: 0, y: -9.82, z: 0 },
    allowSleep: true,
  });

  engine.addSystem(physicsSystem);
  engine.start();

  // Create a floor
  const floor = engine.getWorld().createEntity();
  const floorTransform = new TransformComponent();
  floorTransform.position.set(0, 0, 0);
  floor.addComponent(TransformComponent, floorTransform);

  const floorBody = new PhysicsBodyComponent({
    mass: 0, // Static
    shape: 'box',
    size: new Vector3(10, 0.1, 10),
    material: 'default',
  });

  // Rotate floor to be flat
  floorBody.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  physicsSystem.addPhysicsBody(floor.id, floorBody);

  // Create a falling box
  const box = engine.getWorld().createEntity();
  const boxTransform = new TransformComponent();
  boxTransform.position.set(0, 5, 0);
  box.addComponent(TransformComponent, boxTransform);

  const boxBody = new PhysicsBodyComponent({
    mass: 1,
    shape: 'box',
    size: new Vector3(0.5, 0.5, 0.5),
    material: 'bouncy',
  });

  physicsSystem.addPhysicsBody(box.id, boxBody);

  console.log('✓ Physics world created');
  console.log('  - Floor at (0, 0, 0)');
  console.log('  - Box at (0, 5, 0) will fall');
  console.log('  - Auto-sync enabled');

  // Run simulation
  let lastTime = performance.now();
  const simulate = () => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    engine.update(deltaTime);

    // Log box position
    const pos = boxTransform.position;
    console.log(`Box position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);

    requestAnimationFrame(simulate);
  };

  simulate();
}

/**
 * Example 2: Physics with Different Materials
 *
 * Shows how different materials affect physics behavior.
 */
export async function physicsWithMaterials() {
  console.log('=== Physics with Materials ===\n');

  const engine = new Engine();
  const physicsSystem = new PhysicsSystem({
    gravity: { x: 0, y: -9.82, z: 0 },
  });

  engine.addSystem(physicsSystem);
  engine.start();

  // Create floor
  const floor = engine.getWorld().createEntity();
  const floorTransform = new TransformComponent();
  floorTransform.position.set(0, 0, 0);
  floor.addComponent(TransformComponent, floorTransform);

  const floorBody = new PhysicsBodyComponent({
    mass: 0,
    shape: 'box',
    size: new Vector3(10, 0.1, 10),
  });

  floorBody.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  physicsSystem.addPhysicsBody(floor.id, floorBody);

  // Create three boxes with different materials
  const materials = ['default', 'bouncy', 'slippery'];
  const positions = [-1, 0, 1];

  materials.forEach((mat, index) => {
    const box = engine.getWorld().createEntity();
    const boxTransform = new TransformComponent();
    boxTransform.position.set(positions[index], 3, 0);
    box.addComponent(TransformComponent, boxTransform);

    const boxBody = new PhysicsBodyComponent({
      mass: 1,
      shape: 'box',
      size: new Vector3(0.5, 0.5, 0.5),
      material: mat,
    });

    physicsSystem.addPhysicsBody(box.id, boxBody);

    console.log(`✓ Created ${mat} box at x=${positions[index]}`);
  });

  console.log('\nWatch how different materials affect bouncing:');
  console.log('  - default: Normal bounce');
  console.log('  - bouncy: High bounce');
  console.log('  - slippery: Low friction');
}

/**
 * Example 3: Applying Forces and Impulses
 *
 * Shows how to apply forces and impulses to objects.
 */
export async function applyingForces() {
  console.log('=== Applying Forces and Impulses ===\n');

  const engine = new Engine();
  const physicsSystem = new PhysicsSystem();
  engine.addSystem(physicsSystem);
  engine.start();

  // Create box
  const box = engine.getWorld().createEntity();
  const boxTransform = new TransformComponent();
  boxTransform.position.set(0, 2, 0);
  box.addComponent(TransformComponent, boxTransform);

  const boxBody = new PhysicsBodyComponent({
    mass: 1,
    shape: 'box',
    size: new Vector3(0.5, 0.5, 0.5),
  });

  physicsSystem.addPhysicsBody(box.id, boxBody);

  // Apply upward force after 1 second
  setTimeout(() => {
    console.log('Applying upward force...');
    physicsSystem.applyForce(box.id, { x: 0, y: 10, z: 0 });
  }, 1000);

  // Apply impulse to the right after 2 seconds
  setTimeout(() => {
    console.log('Applying sideways impulse...');
    physicsSystem.applyImpulse(box.id, { x: 5, y: 0, z: 0 });
  }, 2000);

  // Set velocity after 3 seconds
  setTimeout(() => {
    console.log('Setting velocity...');
    physicsSystem.setVelocity(box.id, { x: 0, y: 5, z: 0 });
  }, 3000);

  console.log('✓ Forces and impulses will be applied automatically');
}

/**
 * Example 4: Raycasting for Ground Detection
 *
 * Shows how to use raycasting to detect ground.
 */
export async function raycastingExample() {
  console.log('=== Raycasting Example ===\n');

  const engine = new Engine();
  const physicsSystem = new PhysicsSystem();
  engine.addSystem(physicsSystem);
  engine.start();

  // Create floor
  const floor = engine.getWorld().createEntity();
  const floorTransform = new TransformComponent();
  floorTransform.position.set(0, 0, 0);
  floor.addComponent(TransformComponent, floorTransform);

  const floorBody = new PhysicsBodyComponent({
    mass: 0,
    shape: 'box',
    size: new Vector3(10, 0.1, 10),
  });

  floorBody.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  physicsSystem.addPhysicsBody(floor.id, floorBody);

  // Create box above floor
  const box = engine.getWorld().createEntity();
  const boxTransform = new TransformComponent();
  boxTransform.position.set(0, 2, 0);
  box.addComponent(TransformComponent, boxTransform);

  const boxBody = new PhysicsBodyComponent({
    mass: 1,
    shape: 'box',
    size: new Vector3(0.5, 0.5, 0.5),
  });

  physicsSystem.addPhysicsBody(box.id, boxBody);

  // Raycast down every frame
  let lastGroundCheck = false;

  const checkGround = () => {
    const boxPos = boxTransform.position;

    const result = physicsSystem.raycast(
      { x: boxPos.x, y: boxPos.y, z: boxPos.z },
      { x: boxPos.x, y: boxPos.y - 0.5, z: boxPos.z }
    );

    const isGrounded = result.hasHit;

    if (isGrounded && !lastGroundCheck) {
      console.log('✓ Box hit the ground!');
    }

    lastGroundCheck = isGrounded;

    requestAnimationFrame(checkGround);
  };

  checkGround();

  console.log('✓ Raycasting initialized - monitoring ground contact');
}

/**
 * Example 5: Physics and VR Input Integration
 *
 * Shows how to combine physics with VR grabbing.
 */
export async function physicsWithVRInput() {
  console.log('=== Physics with VR Input ===\n');

  const engine = new Engine();
  const physicsSystem = new PhysicsSystem();
  engine.addSystem(physicsSystem);
  engine.start();

  // Import VR input system
  const { XRInputManager, XRInputSystem } = await import('../xr');

  const xrInputManager = new XRInputManager();
  const xrInputSystem = new XRInputSystem(xrInputManager);
  engine.addSystem(xrInputSystem);

  // Create grabbable physics objects
  for (let i = 0; i < 5; i++) {
    const cube = engine.getWorld().createEntity();
    const cubeTransform = new TransformComponent();
    cubeTransform.position.set(
      (Math.random() - 0.5) * 4,
      1 + Math.random() * 2,
      -2 - Math.random() * 3
    );
    cube.addComponent(TransformComponent, cubeTransform);

    // Add physics
    const cubeBody = new PhysicsBodyComponent({
      mass: 1,
      shape: 'box',
      size: new Vector3(0.3, 0.3, 0.3),
      material: 'default',
    });

    physicsSystem.addPhysicsBody(cube.id, cubeBody);

    // Make grabbable
    const { VRInteractableComponent } = await import('../xr');
    const interactable = new VRInteractableComponent({
      interactable: true,
      grabbable: true,
      throwable: true,
    });

    cube.addComponent(VRInteractableComponent, interactable);

    console.log(`✓ Created grabbable physics cube ${i + 1}`);
  }

  // Listen for grab events
  xrInputManager.on('entityGrabbed', (entityId) => {
    console.log(`Entity ${entityId} grabbed - disabling physics`);
    const entity = engine.getWorld().getEntity(entityId);
    if (entity) {
      const physicsBody = entity.getComponent(PhysicsBodyComponent);
      if (physicsBody) {
        physicsBody.body.type = 0; // Static while grabbed
      }
    }
  });

  xrInputManager.on('entityThrown', (entityId, _controllerId, velocity) => {
    console.log(`Entity ${entityId} thrown with velocity:`, velocity);
    const entity = engine.getWorld().getEntity(entityId);
    if (entity) {
      const physicsBody = entity.getComponent(PhysicsBodyComponent);
      if (physicsBody) {
        physicsBody.body.type = 1; // Dynamic again
        physicsBody.setVelocity(velocity);
      }
    }
  });

  console.log('\n✓ Physics objects can be grabbed and thrown with VR controllers');
}

/**
 * Example 6: Stacking Objects
 *
 * Shows physics simulation with stacking.
 */
export async function stackingObjects() {
  console.log('=== Stacking Objects ===\n');

  const engine = new Engine();
  const physicsSystem = new PhysicsSystem();
  engine.addSystem(physicsSystem);
  engine.start();

  // Create floor
  const floor = engine.getWorld().createEntity();
  const floorTransform = new TransformComponent();
  floorTransform.position.set(0, 0, 0);
  floor.addComponent(TransformComponent, floorTransform);

  const floorBody = new PhysicsBodyComponent({
    mass: 0,
    shape: 'box',
    size: new Vector3(10, 0.1, 10),
  });

  floorBody.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  physicsSystem.addPhysicsBody(floor.id, floorBody);

  // Create stack of boxes
  const stackHeight = 10;
  const boxSize = 0.5;

  for (let i = 0; i < stackHeight; i++) {
    const box = engine.getWorld().createEntity();
    const boxTransform = new TransformComponent();
    boxTransform.position.set(0, boxSize / 2 + i * boxSize, 0);
    box.addComponent(TransformComponent, boxTransform);

    const boxBody = new PhysicsBodyComponent({
      mass: 1,
      shape: 'box',
      size: new Vector3(boxSize, boxSize, boxSize),
    });

    physicsSystem.addPhysicsBody(box.id, boxBody);
  }

  console.log(`✓ Created stack of ${stackHeight} boxes`);
  console.log('  Physics will simulate stacking and potential collapse');
}

/**
 * Example 7: Physics Statistics
 *
 * Shows how to monitor physics performance.
 */
export async function physicsStatistics() {
  console.log('=== Physics Statistics ===\n');

  const engine = new Engine();
  const physicsSystem = new PhysicsSystem();
  engine.addSystem(physicsSystem);
  engine.start();

  // Create multiple objects
  for (let i = 0; i < 50; i++) {
    const box = engine.getWorld().createEntity();
    const boxTransform = new TransformComponent();
    boxTransform.position.set(
      (Math.random() - 0.5) * 10,
      Math.random() * 10 + 2,
      (Math.random() - 0.5) * 10
    );
    box.addComponent(TransformComponent, boxTransform);

    const boxBody = new PhysicsBodyComponent({
      mass: 1,
      shape: 'box',
      size: new Vector3(0.5, 0.5, 0.5),
    });

    physicsSystem.addPhysicsBody(box.id, boxBody);
  }

  // Log stats every second
  setInterval(() => {
    const stats = physicsSystem.getStats();
    console.log('[Physics Stats]', stats);
  }, 1000);

  console.log('✓ Created 50 physics objects');
  console.log('  Statistics will be logged every second');
}

export default {
  basicPhysicsSetup,
  physicsWithMaterials,
  applyingForces,
  raycastingExample,
  physicsWithVRInput,
  stackingObjects,
  physicsStatistics,
};
