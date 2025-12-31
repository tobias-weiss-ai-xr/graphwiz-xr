# Physics System for GraphWiz-XR

Complete Cannon.js physics engine integration with ECS architecture for realistic 3D physics simulation.

## Features

### ✅ Implemented

- **Physics World Management**
  - Gravity configuration
  - Solver iterations tuning
  - Broadphase optimization (Naive/SAP)
  - Sleep mode for performance

- **Physics Bodies**
  - Box shapes
  - Sphere shapes
  - Cylinder shapes
  - Plane shapes
  - Static and dynamic bodies
  - Triggers (no collision response)
  - Mass and inertia control

- **Material System**
  - Material properties (friction, restitution)
  - Contact materials between surfaces
  - Predefined materials (default, slippery, bouncy)

- **Forces and Impulses**
  - Apply force at point
  - Apply impulse
  - Apply torque
  - Set velocity/angular velocity

- **Collision Detection**
  - Raycast queries
  - Collision events
  - Trigger zones
  - Collision filtering by layers

- **ECS Integration**
  - `PhysicsBodyComponent` - Links entities to physics bodies
  - `PhysicsSystem` - Main physics simulation system
  - Auto-sync between physics and transforms
  - Entity tracking by body ID

- **Character Control**
  - Character controller component
  - Ground detection
  - Jump mechanics
  - Movement with air control

- **VR Integration**
  - Grab physics objects
  - Throw with velocity
  - Disable physics while grabbed
  - Re-enable on release

## Quick Start

### Basic Setup

```typescript
import { Engine } from '@graphwiz/hub-client/core';
import { PhysicsSystem, PhysicsBodyComponent } from '@graphwiz/hub-client/physics';
import { TransformComponent } from '@graphwiz/hub-client/ecs';

// Create engine
const engine = new Engine();

// Add physics system
const physicsSystem = new PhysicsSystem({
  gravity: { x: 0, y: -9.82, z: 0 },
  allowSleep: true,
});

engine.addSystem(physicsSystem);
engine.start();

// Create a floor
const floor = engine.getWorld().createEntity();
const floorTransform = new TransformComponent();
floor.addComponent(TransformComponent, floorTransform);

const floorBody = new PhysicsBodyComponent({
  mass: 0, // Static
  shape: 'box',
  size: { x: 10, y: 0.1, z: 10 },
});

physicsSystem.addPhysicsBody(floor.id, floorBody);

// Create a falling box
const box = engine.getWorld().createEntity();
const boxTransform = new TransformComponent();
boxTransform.position.set(0, 5, 0);
box.addComponent(TransformComponent, boxTransform);

const boxBody = new PhysicsBodyComponent({
  mass: 1,
  shape: 'box',
  size: { x: 0.5, y: 0.5, z: 0.5 },
  material: 'bouncy',
});

physicsSystem.addPhysicsBody(box.id, boxBody);

// Physics simulation runs automatically
```

### With VR Input

```typescript
import { XRInputManager, XRInputSystem } from '@graphwiz/hub-client/xr';

const xrInputManager = new XRInputManager();
const xrInputSystem = new XRInputSystem(xrInputManager);
engine.addSystem(xrInputSystem);

// Create grabbable physics object
const cube = engine.getWorld().createEntity();
const cubeTransform = new TransformComponent();
cube.addComponent(TransformComponent, cubeTransform);

const cubeBody = new PhysicsBodyComponent({
  mass: 1,
  shape: 'box',
  size: { x: 0.3, y: 0.3, z: 0.3 },
});

physicsSystem.addPhysicsBody(cube.id, cubeBody);

// Make grabbable
const interactable = new VRInteractableComponent({
  interactable: true,
  grabbable: true,
  throwable: true,
});

cube.addComponent(VRInteractableComponent, interactable);

// Handle grab events
xrInputManager.on('entityGrabbed', (entityId) => {
  const entity = engine.getWorld().getEntity(entityId);
  const physicsBody = entity.getComponent(PhysicsBodyComponent);

  // Disable physics while grabbed
  physicsBody.body.type = 0; // Static
});

xrInputManager.on('entityThrown', (entityId, _controllerId, velocity) => {
  const entity = engine.getWorld().getEntity(entityId);
  const physicsBody = entity.getComponent(PhysicsBodyComponent);

  // Re-enable physics and apply throw velocity
  physicsBody.body.type = 1; // Dynamic
  physicsBody.setVelocity(velocity);
});
```

## API Reference

### PhysicsSystem

Main physics simulation system.

#### Constructor

```typescript
const system = new PhysicsSystem({
  gravity: { x: 0, y: -9.82, z: 0 },  // World gravity
  solverIterations: 10,                // Solver accuracy
  broadphase: 'Naive' | 'SAP',         // Collision detection
  allowSleep: true,                    // Enable sleep mode
  autoSync: true,                      // Auto-sync transforms
});
```

#### Methods

##### `addPhysicsBody(entityId, physicsBody)`

Add physics body to entity.

```typescript
physicsSystem.addPhysicsBody(entityId, physicsBody);
```

##### `removePhysicsBody(entityId)`

Remove physics body from entity.

```typescript
physicsSystem.removePhysicsBody(entityId);
```

##### `applyForce(entityId, force, worldPoint?)`

Apply continuous force to entity.

```typescript
physicsSystem.applyForce(entityId, { x: 0, y: 10, z: 0 });
```

##### `applyImpulse(entityId, impulse, worldPoint?)`

Apply instant impulse to entity.

```typescript
physicsSystem.applyImpulse(entityId, { x: 5, y: 0, z: 0 });
```

##### `setVelocity(entityId, velocity)`

Set entity velocity.

```typescript
physicsSystem.setVelocity(entityId, { x: 0, y: 5, z: 0 });
```

##### `getVelocity(entityId)`

Get entity velocity.

```typescript
const velocity = physicsSystem.getVelocity(entityId);
```

##### `raycast(from, to)`

Cast ray and check for hits.

```typescript
const result = physicsSystem.raycast(
  { x: 0, y: 10, z: 0 },
  { x: 0, y: 0, z: 0 }
);

if (result.hasHit) {
  console.log('Hit:', result.point);
}
```

##### `getStats()`

Get physics statistics.

```typescript
const stats = physicsSystem.getStats();
console.log(stats.bodies, stats.constraints);
```

### PhysicsBodyComponent

Links entity to Cannon.js physics body.

#### Constructor

```typescript
const body = new PhysicsBodyComponent({
  mass: 1,                    // Mass (0 = static)
  shape: 'box' | 'sphere' | 'cylinder' | 'plane',
  size: { x: 1, y: 1, z: 1 }, // For box
  radius: 0.5,                // For sphere/cylinder
  height: 1,                  // For cylinder
  material: 'default',        // Material name
  friction: 0.3,              // Friction coefficient
  restitution: 0.3,           // Bounciness (0-1)
  linearDamping: 0.01,        // Velocity damping
  angularDamping: 0.01,       // Angular velocity damping
  isTrigger: false,           // Trigger only (no collision)
  isStatic: false,            // Static body
});
```

#### Methods

##### `linkTransform(transform)`

Link to ECS transform component.

```typescript
physicsBody.linkTransform(transformComponent);
```

##### `syncFromTransform()`

Sync physics body position from transform.

```typescript
physicsBody.syncFromTransform();
```

##### `syncToTransform()`

Sync transform from physics body.

```typescript
physicsBody.syncToTransform();
```

##### `applyForce(force, worldPoint?)`

Apply force to body.

```typescript
physicsBody.applyForce({ x: 0, y: 10, z: 0 });
```

##### `applyImpulse(impulse, worldPoint?)`

Apply impulse to body.

```typescript
physicsBody.applyImpulse({ x: 5, y: 0, z: 0 });
```

##### `setVelocity(velocity)`

Set velocity.

```typescript
physicsBody.setVelocity({ x: 0, y: 5, z: 0 });
```

##### `getVelocity()`

Get velocity.

```typescript
const velocity = physicsBody.getVelocity();
```

##### `wakeUp()`

Wake up body from sleep.

```typescript
physicsBody.wakeUp();
```

##### `sleep()`

Put body to sleep.

```typescript
physicsBody.sleep();
```

### PhysicsWorld

Low-level Cannon.js world wrapper.

#### Methods

##### `step(deltaTime)`

Step physics simulation.

```typescript
physicsWorld.step(deltaTime);
```

##### `createMaterial(name, friction, restitution)`

Create physics material.

```typescript
const material = physicsWorld.createMaterial('ice', 0.1, 0.1);
```

##### `createContactMaterial(mat1, mat2, friction, restitution)`

Create contact material between two materials.

```typescript
physicsWorld.createContactMaterial('ice', 'default', 0.1, 0.2);
```

##### `addBody(body)`

Add body to world.

```typescript
physicsWorld.addBody(cannonBody);
```

##### `removeBody(body)`

Remove body from world.

```typescript
physicsWorld.removeBody(cannonBody);
```

## Collision Components

### TriggerComponent

Detect overlap without physical response.

```typescript
const trigger = new TriggerComponent(['default'], false);

trigger.onEnter((entityId) => {
  console.log('Entity entered:', entityId);
});

trigger.onExit((entityId) => {
  console.log('Entity exited:', entityId);
});

trigger.onStay((entityId) => {
  console.log('Entity overlapping:', entityId);
});
```

### CollisionFilterComponent

Control which layers to collide with.

```typescript
const filter = new CollisionFilterComponent('player', ['default', 'enemy']);

if (filter.shouldCollide('enemy')) {
  // Will collide with enemy layer
}
```

### RaycastComponent

Perform raycast queries.

```typescript
const raycast = new RaycastComponent(
  new Vector3(0, -1, 0),  // Direction
  10,                     // Max distance
  ['default'],            // Layers
  false                   // Debug
);

if (raycast.hasHit()) {
  const point = raycast.getHitPoint();
  const normal = raycast.getHitNormal();
  const distance = raycast.getHitDistance();
}
```

### CharacterControllerComponent

Character movement control.

```typescript
const controller = new CharacterControllerComponent(
  5,    // Move speed
  5,    // Jump force
  1.5,  // Sprint multiplier
  0.3,  // Air control
  0.1   // Ground check distance
);

if (controller.canJump()) {
  // Apply jump force
}

controller.setSprinting(true);
const speed = controller.getCurrentSpeed();
```

## Usage Patterns

### Ground Detection

```typescript
const checkGround = () => {
  const result = physicsSystem.raycast(
    { x: playerPos.x, y: playerPos.y, z: playerPos.z },
    { x: playerPos.x, y: playerPos.y - 0.5, z: playerPos.z }
  );

  if (result.hasHit) {
    console.log('Player is grounded');
  }
};
```

### Pushing Objects

```typescript
// Apply continuous force
physicsSystem.applyForce(boxId, { x: 10, y: 0, z: 0 });
```

### Explosive Force

```typescript
const applyExplosion = (center: Vector3, radius: number, force: number) => {
  for (const [entityId] of physicsSystem.getEntities()) {
    const entity = engine.getWorld().getEntity(entityId);
    const transform = entity.getComponent(TransformComponent);

    const distance = transform.position.distanceTo(center);
    if (distance < radius) {
      const direction = new Vector3()
        .subVectors(transform.position, center)
        .normalize();

      const impulse = direction.multiplyScalar(force * (1 - distance / radius));
      physicsSystem.applyImpulse(entityId, impulse);
    }
  }
};
```

### Physics Materials

```typescript
// Create custom materials
const iceMaterial = physicsWorld.createMaterial('ice', 0.05, 0.1);
const rubberMaterial = physicsWorld.createMaterial('rubber', 0.9, 0.8);

// Create contact material
physicsWorld.createContactMaterial('ice', 'rubber', 0.5, 0.5);

// Use material on body
const body = new PhysicsBodyComponent({
  mass: 1,
  shape: 'box',
  material: 'ice',
});
```

## Performance Tips

1. **Use Sleep Mode**: Enable `allowSleep` for static objects
2. **Optimize Broadphase**: Use SAP for many objects
3. **Reduce Solver Iterations**: Lower for less accuracy but better performance
4. **Use Simple Shapes**: Box/sphere is faster than trimesh
5. **Limit Active Bodies**: Put objects to sleep when not moving

```typescript
const physicsSystem = new PhysicsSystem({
  allowSleep: true,
  broadphase: 'SAP',
  solverIterations: 5,
});
```

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Cannon.js | ✅ | ✅ | ✅ | ✅ |
| Physics | ✅ | ✅ | ✅ | ✅ |

## Performance

| Metric | Value |
|--------|-------|
| Physics Step | ~1-2ms (50 objects) |
| Per Object | ~0.02ms |
| Memory Per Body | ~2-5 KB |
| Total Memory (100 bodies) | ~500 KB |

## Troubleshooting

### Objects Falling Through Floor

**Problem**: Objects fall through static geometry.

**Solutions**:
1. Increase physics substeps: `step(deltaTime)` with more iterations
2. Make sure floor has thickness (not just plane)
3. Increase solver iterations
4. Enable CCD (continuous collision detection)

### Objects Not Settling

**Problem**: Objects keep moving/jittering.

**Solutions**:
1. Enable sleep mode
2. Increase linear/angular damping
3. Reduce solver tolerance
4. Use thicker collision shapes

### Poor Performance

**Problem**: Low FPS with many objects.

**Solutions**:
1. Enable sleep mode
2. Use SAP broadphase
3. Reduce solver iterations
4. Optimize collision shapes
5. Limit active objects

## Examples

See `example.ts` for:
1. Basic physics setup
2. Physics with different materials
3. Applying forces and impulses
4. Raycasting for ground detection
5. Physics with VR input integration
6. Stacking objects
7. Physics statistics

## Integration

### With Network System

```typescript
// Sync physics over network
physicsSystem.on('update', (entityId) => {
  const transform = entity.getComponent(TransformComponent);
  networkSystem.sendEntityUpdate(entityId, {
    position: transform.position,
    rotation: transform.rotation,
  });
});
```

### With VR Input

```typescript
// Grab physics objects
xrInputManager.on('entityGrabbed', (entityId) => {
  physicsSystem.wakeUp(entityId);
  // Disable physics simulation while grabbed
});

xrInputManager.on('entityThrown', (entityId, controllerId, velocity) => {
  physicsSystem.setVelocity(entityId, velocity);
});
```

### With Voice Chat

```typescript
// Push objects with voice
voiceSystem.on('audioLevel', (level) => {
  if (level > 0.8) {
    // Apply impulse based on voice
    physicsSystem.applyImpulse(objectId, { x: 0, y: level * 10, z: 0 });
  }
});
```

## License

MIT
