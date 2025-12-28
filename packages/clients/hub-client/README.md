# GraphWiz-XR Hub Client

A React + Three.js client for GraphWiz-XR virtual reality hubs with a complete Entity Component System (ECS) architecture.

## Overview

The hub client provides:
- **ECS Architecture** - Entity Component System for flexible game object management
- **3D Rendering** - Built on Three.js with React Three Fiber
- **Physics** - Basic physics simulation with gravity and collisions
- **Audio** - Spatial 3D audio with Web Audio API
- **Animation** - Skeletal and mesh animation support
- **Networking** - WebTransport-based real-time networking
- **Asset Loading** - Cached asset loading for models, textures, and audio

## Architecture

### ECS (Entity Component System)

The ECS architecture provides a flexible way to manage game objects:

```
Entity (ID)
  └── Components (data)
      ├── TransformComponent (position, rotation, scale)
      ├── PhysicsComponent (mass, velocity, forces)
      ├── AudioComponent (3D spatial audio)
      ├── AnimationComponent (animation clips)
      ├── ModelComponent (3D model)
      └── LightComponent (lighting)

Systems (logic)
  ├── TransformSystem (update transforms)
  ├── PhysicsSystem (simulate physics)
  ├── AudioSystem (update audio positions)
  ├── AnimationSystem (update animations)
  └── BillboardSystem (face camera)
```

## Quick Start

### Basic Scene Setup

```tsx
import { Canvas } from '@react-three/fiber';
import { Engine, SceneRenderer } from '@graphwiz/hub-client';
import { useEffect } from 'react';

function App() {
  const engine = new Engine();

  useEffect(() => {
    engine.start();
    return () => engine.dispose();
  }, []);

  return <SceneRenderer world={engine.getWorld()} />;
}
```

### Creating Entities

```tsx
import { World, Entity, TransformComponent, ModelComponent, PhysicsComponent } from '@graphwiz/hub-client';

// Create a new entity
const entity = world.createEntity();

// Add transform
entity.addComponent(TransformComponent, new TransformComponent(
  new Vector3(0, 1, 0),
  new Euler(0, 0, 0),
  new Vector3(1, 1, 1)
));

// Add 3D model
entity.addComponent(ModelComponent, new ModelComponent('/models/player.glb'));

// Add physics
entity.addComponent(PhysicsComponent, new PhysicsComponent(
  mass: 1,
  isStatic: false
));
```

### Rendering Entities

```tsx
import { EntityRenderer } from '@graphwiz/hub-client';

function MyScene() {
  return (
    <Canvas>
      <EntityRenderer entity={myEntity} />
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
    </Canvas>
  );
}
```

## ECS Components

### TransformComponent

Defines position, rotation, and scale:

```tsx
import { Vector3, Euler } from 'three';

const transform = new TransformComponent(
  new Vector3(0, 1, 0),  // position
  new Euler(0, Math.PI, 0), // rotation
  new Vector3(1, 1, 1)     // scale
);
```

### PhysicsComponent

Adds physics simulation:

```tsx
const physics = new PhysicsComponent(
  1,              // mass
  isStatic: false, // dynamic object
  friction: 0.5,   // friction coefficient
  restitution: 0.3 // bounciness
);
```

### AudioComponent

3D spatial audio:

```tsx
const audio = new AudioComponent(
  '/sounds/footstep.mp3',
  volume: 1,
  spatial: true,      // 3D positional audio
  distance: 10,       // reference distance
  maxDistance: 100,   // max hearing distance
  autoplay: false
);

// Play audio
await audio.play();

// Update position for spatial audio
audio.setPosition(new Vector3(x, y, z));
```

### AnimationComponent

Skeletal animations:

```tsx
const animation = new AnimationComponent(
  clips: [idleClip, walkClip, runClip],
  autoplay: 'idle',
  loop: true
);

// Initialize with model
animation.initialize(model.scene);

// Play animation
animation.play('walk', 0.2); // 0.2s fade

// Set speed
animation.setTimeScale(1.5);
```

### ModelComponent

3D model loading:

```tsx
const model = new ModelComponent(
  '/models/character.glb',
  castShadow: true,
  receiveShadow: true
);

// Load model
await model.load();

// Clone for instancing
const clone = model.cloneScene();
```

### LightComponent

Various light types:

```tsx
// Point light
const pointLight = new LightComponent(
  type: 'point',
  intensity: 1,
  distance: 10,
  decay: 2,
  castShadow: true
);

// Directional light
const dirLight = new LightComponent(
  type: 'directional',
  intensity: 1,
  castShadow: true,
  shadowMapSize: 2048
);
```

## ECS Systems

Systems process entities with specific components each frame:

### TransformSystem

Updates all entity transforms:

```tsx
world.addSystem(new TransformSystem());
```

### PhysicsSystem

Simulates physics:

```tsx
world.addSystem(new PhysicsSystem());
```

Features:
- Gravity
- Velocity integration
- Ground collision
- Linear and angular damping

### AudioSystem

Updates spatial audio:

```tsx
const audioSystem = new AudioSystem();
world.addSystem(audioSystem);

// Initialize all audio
audioSystem.initializeAudio();
```

### AnimationSystem

Updates animations:

```tsx
world.addSystem(new AnimationSystem());
```

### BillboardSystem

Makes entities face the camera:

```tsx
const billboardSystem = new BillboardSystem();
world.addSystem(billboardSystem);

// Set camera reference
billboardSystem.setCamera(camera);
```

## React Components

### SceneRenderer

Complete 3D scene renderer:

```tsx
<SceneRenderer
  world={engine.getWorld()}
  camera={{ position: [10, 10, 10], fov: 75 }}
  controls={true}
  environment={true}
  shadows={true}
/>
```

### EntityRenderer

Renders a single entity:

```tsx
<EntityRenderer entity={myEntity} />
```

### PlayerAvatar

Player avatar with name tag:

```tsx
<PlayerAvatar
  position={[0, 0, 0]}
  rotation={[0, 0, 0]}
  displayName="PlayerName"
  color="#4CAF50"
  isLocalPlayer={false}
/>
```

### Light

Various light types:

```tsx
<Light component={lightComponent} />
```

## Asset Loading

### Asset Loader

Caches and loads assets:

```tsx
import { assetLoader } from '@graphwiz/hub-client';

// Load model
const gltf = await assetLoader.loadGLTF('/models/room.glb');

// Load texture
const texture = await assetLoader.loadTexture('/textures/floor.png');

// Load audio
const audio = await assetLoader.loadAudio('/sounds/music.mp3');

// Preload multiple assets
await assetLoader.preloadAssets({
  models: ['/models/player.glb', '/models/room.glb'],
  textures: ['/textures/wood.png', '/textures/metal.png'],
  audio: ['/sounds/step1.mp3', '/sounds/step2.mp3']
});

// Check cache stats
const stats = assetLoader.getCacheStats();
console.log('Cached:', stats);
```

## Engine Usage

### Initialization

```tsx
import { Engine } from '@graphwiz/hub-client';

const engine = new Engine({
  // Optional config
});

// Start the engine
await engine.start();

// Get systems
const audioSystem = engine.getAudioSystem();
const billboardSystem = engine.getBillboardSystem();

// Get asset loader
const assetLoader = engine.getAssetLoader();

// Clean up
engine.dispose();
```

### Game Loop

The engine runs a game loop that:
1. Calculates delta time
2. Updates all systems
3. Systems update their entities
4. Renders the scene

## Examples

### Creating a Simple Scene

```tsx
import { Canvas } from '@react-three/fiber';
import { Engine, World, Entity, TransformComponent } from '@graphwiz/hub-client';
import { EntityRenderer } from '@graphwiz/hub-client/src/components';
import { useEffect, useState } from 'react';

function SimpleScene() {
  const [world] = useState(() => {
    const w = new World();
    const entity = w.createEntity();
    entity.addComponent(TransformComponent, new TransformComponent());
    return w;
  });

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      {world.getEntities().map(entity => (
        <EntityRenderer key={entity.id} entity={entity} />
      ))}
      <OrbitControls />
    </Canvas>
  );
}
```

### Adding Physics

```tsx
import { PhysicsComponent, ColliderComponent } from '@graphwiz/hub-client';

const entity = world.createEntity();
entity.addComponent(TransformComponent, new TransformComponent());
entity.addComponent(PhysicsComponent, new PhysicsComponent(
  mass: 1,
  isStatic: false
));
entity.addComponent(ColliderComponent, new ColliderComponent(
  shape: 'box',
  size: new Vector3(1, 1, 1)
));

world.addSystem(new PhysicsSystem());
```

### Spatial Audio

```tsx
import { AudioComponent, TransformComponent } from '@graphwiz/hub-client';

const entity = world.createEntity();
entity.addComponent(TransformComponent, new TransformComponent());
entity.addComponent(AudioComponent, new AudioComponent(
  '/sounds/bell.mp3',
  volume: 0.8,
  spatial: true,
  distance: 5
));

// Play sound when something happens
const audio = entity.getComponent(AudioComponent);
await audio?.play();
```

## Best Practices

1. **Component Organization**
   - Keep components focused on single responsibilities
   - Use composition for complex behaviors
   - Call `dispose()` on cleanup

2. **System Order**
   - Transform → Physics → Animation → Audio → Billboard
   - Physics before transforms
   - Animation after transforms

3. **Asset Management**
   - Use `assetLoader.preloadAssets()` for startup
   - Check cache stats to monitor memory
   - Call `assetLoader.clearCache()` on scene change

4. **Performance**
   - Reuse entity IDs when possible
   - Use object pooling for frequently created entities
   - Limit shadow map resolution

5. **Memory**
   - Always dispose of entities when done
   - Clear asset cache when switching scenes
   - Unload unused models

## API Reference

### Classes

- **Engine** - Main engine class
- **World** - ECS world container
- **Entity** - Entity with components
- **System** - Base system class
- **AssetLoader** - Asset loading and caching

### Components

- **TransformComponent** - Position, rotation, scale
- **PhysicsComponent** - Physics properties
- **ColliderComponent** - Collision shape
- **AudioComponent** - 3D audio
- **AnimationComponent** - Animations
- **ModelComponent** - 3D models
- **LightComponent** - Lighting
- **CameraComponent** - Camera settings
- **NetworkSyncComponent** - Network sync
- **InteractableComponent** - User interaction
- **BillboardComponent** - Face camera
- **ParticleComponent** - Particles

### Systems

- **TransformSystem** - Update transforms
- **PhysicsSystem** - Physics simulation
- **AudioSystem** - Spatial audio
- **AnimationSystem** - Animation updates
- **BillboardSystem** - Face camera

## Contributing

When adding new components or systems:

1. Create component in `ecs/components.ts`
2. Create system in `ecs/systems/`
3. Export from `ecs/index.ts`
4. Add to Engine's `initializeSystems()`
5. Add tests
6. Update documentation

## License

MIT
