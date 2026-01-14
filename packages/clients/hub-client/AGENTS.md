# HUB CLIENT KNOWLEDGE BASE

**Generated:** 2026-01-09
**Commit:** 3349bf3
**Branch:** main

## OVERVIEW

Main VR client with React Three Fiber + ECS architecture for multiplayer 3D scenes.

## STRUCTURE

```
hub-client/src/
├── ecs/          # Entity Component System (world, entity, components, systems)
├── network/      # WebSocket client, network interpolation
├── physics/      # Cannon.js integration (physics-system, physics-world)
├── xr/           # WebXR input (xr-input-manager, xr-input-system)
├── components/   # React Three Fiber (SceneRenderer, NetworkedAvatar, Portal, etc.)
├── avatar/       # Avatar system (configurator, renderer, API)
├── systems/       # Game systems (GrabSystem, etc.)
└── App.tsx       # Main entry point
```

## WHERE TO LOOK

| Task             | Location                          | Notes                                                        |
| ---------------- | --------------------------------- | ------------------------------------------------------------ |
| ECS World        | `src/ecs/world.ts`                | Entity CRUD, system management, disposal                     |
| ECS Components   | `src/ecs/components.ts`           | 12 types: Transform, Physics, Audio, Animation etc.          |
| ECS Systems      | `src/ecs/systems/*.ts`            | Transform, Physics, Animation, Audio, Billboard              |
| WebSocket Client | `src/network/websocket-client.ts` | Auto-reconnect, protobuf, ping/pong                          |
| Network Sync     | `src/network/network-sync.ts`     | Position interpolation, prediction                           |
| Physics System   | `src/physics/physics-system.ts`   | Cannon.js: forces, impulses, raycasting                      |
| XR Input         | `src/xr/xr-input-manager.ts`      | Controller tracking, haptics, button/axis events             |
| React Components | `src/components/*.tsx`            | SceneRenderer, NetworkedAvatar, Portal, Drawing, MediaPlayer |
| Avatar System    | `src/avatar/*.ts`                 | Configurator, renderer, persistence, API                     |
| Main App         | `src/App.tsx`                     | State management, networking, entity rendering               |

## CONVENTIONS

### ECS Pattern

- **World.createEntity()** → Returns unique ID entity
- **Entity.addComponent(ComponentClass, instance)** → Add component, returns instance
- **Entity.getComponent(ComponentClass)** → Get typed component or undefined
- **Entity.hasComponent(ComponentClass)** → Boolean check
- **World.addSystem(System)** → Add to update loop
- **System.update(deltaTime)** → Called every frame

### System Order

World.update() calls: Transform → Physics → Animation → Audio → Billboard

### WebSocket Protocol

```typescript
// Connect
const client = new WebSocketClient({ presenceUrl, roomId, userId, displayName });
await client.connect();

// Subscribe/unsubscribe pattern
const unsubscribe = client.on(MessageType.POSITION_UPDATE, (message) => { ... });
unsubscribe();

// Send messages
client.sendPositionUpdate(entityId, {x,y,z}, {x,y,z,w});
client.sendChatMessage('Hello world!');
client.sendEntitySpawn({ entityId, templateId, components });
```

## ANTI-PATTERNS

### ECS Pitfalls

- **Don't mutate components directly** → Read via getComponent(), write via addComponent()
- **Don't skip dispose()** → Entity.dispose() calls dispose() on all components

### Networking Issues

- **Don't ignore position updates** → Always process for interpolation
- **Don't send too frequently** → Position updates at 60Hz, others as needed
- **Don't skip interpolation** → Use target positions + lerp for smooth movement
- **Don't forget unsubscribe** → Handlers return unsubscribe function, call on cleanup

### Performance Anti-Patterns

- **Don't recreate meshes** → Use instancing via useInstancedMeshes()
- **Don't leak geometries/materials** → Call dispose() on ModelComponent, AudioComponent
- **Don't update state every frame** → Use React.useMemo/useCallback
- **Don't skip shadow maps** → Configure shadow-mapSize, castShadow, receiveShadow properly

### Physics Common Mistakes

- **Don't use mesh positions directly** → Sync via PhysicsBodyComponent.syncFromTransform()/syncToTransform()
- **Don't forget to wake bodies** → Call physicsSystem.wakeUp(entityId) before forces
- **Don't set static while grabbed** → Disable physics: body.type = 0

### XR Input Gotchas

- **Don't assume controller exists** → Check getLeftController()/getRightController() for null
- **Don't update every frame without session** → XRInputManager.update() needs XRFrame
- **Don't forget haptics** → Call triggerHapticPulse() for interaction feedback
- **Don't mix grip/aim poses** → Grip for grabbing, Aim for pointing

### Three.js Integration

- **Don't create new Geometries per render** → Reuse geometries, dispose when done
- **Don't set materials per frame** → Create once, reuse across objects
- **Don't use deprecated APIs** → Use @react-three/fiber primitives (mesh, sphereGeometry, etc.)
- **Don't forget shadow properties** → Cast on objects, receive on ground plane
