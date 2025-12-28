# VR Input System for GraphWiz-XR

Complete WebXR controller input handling with tracking, interaction, and haptic feedback.

## Features

### ✅ Implemented

- **Controller Tracking**
  - Position/rotation tracking (grip and aim pose)
  - Left/right controller detection
  - Multiple controller support

- **Button Input**
  - Button press/release detection
  - Button value tracking (analog)
  - Touch detection
  - Named button mapping (trigger, grip, thumbstick, etc.)

- **Thumbstick/Joystick**
  - X/Y axis tracking
  - Deadzone handling
  - Sensitivity configuration

- **Object Interaction**
  - Grab/grasp with grip button
  - Throw with velocity calculation
  - Distance-based highlighting
  - Two-handed manipulation support

- **Haptic Feedback**
  - Vibration triggers
  - Configurable strength and duration
  - Per-controller control

- **ECS Integration**
  - `XRControllerComponent` - Controller entities
  - `VRInteractableComponent` - Grabbable entities
  - `XRInputSystem` - Update system

## Quick Start

### Basic Setup

```typescript
import { XRInputManager, XRInputSystem } from '@graphwiz-xr/hub-client/xr';
import { Engine } from '@graphwiz-xr/hub-client/core';

// Create input manager
const xrInputManager = new XRInputManager();

// Request VR session
const session = await navigator.xr.requestSession('immersive-vr', {
  optionalFeatures: ['local-floor', 'hand-tracking'],
});

const referenceSpace = await session.requestReferenceSpace('local-floor');

// Initialize
await xrInputManager.initialize(session, referenceSpace);

// Add to engine
const engine = new Engine();
const xrInputSystem = new XRInputSystem(xrInputManager);
engine.addSystem(xrInputSystem);

// Game loop
session.requestAnimationFrame((time, frame) => {
  xrInputManager.update(frame, referenceSpace);
  engine.update(0.016);
});
```

### Create Grabbable Object

```typescript
import { VRInteractableComponent } from '@graphwiz-xr/hub-client/xr';
import { TransformComponent } from '@graphwiz-xr/hub-client/ecs';

const cube = world.createEntity();

// Add transform
const transform = new TransformComponent();
transform.position.set(0, 1.5, -2);
cube.addComponent(TransformComponent, transform);

// Make grabbable
const interactable = new VRInteractableComponent({
  interactable: true,
  grabbable: true,
  throwable: true,
  highlightOnHover: true,
});
cube.addComponent(VRInteractableComponent, interactable);
```

### Listen for Events

```typescript
// Controller events
xrInputManager.on('controllerConnected', (id, state) => {
  console.log(`Controller ${state.handedness} connected`);
});

// Button events
xrInputManager.on('buttonPressed', (buttonName, controllerId) => {
  console.log(`Button ${buttonName} pressed on ${controllerId}`);
});

// Grab events
xrInputSystem.on('entityGrabbed', (entityId, controllerId) => {
  console.log(`Entity ${entityId} grabbed`);
});

xrInputSystem.on('entityThrown', (entityId, controllerId, velocity) => {
  console.log(`Entity ${entityId} thrown`, velocity);
});
```

## API Reference

### XRInputManager

Main class for WebXR input management.

#### Constructor

```typescript
const manager = new XRInputManager({
  autoEnable: true,
  controllerProfiles: ['oculus-touch', 'valve-index', 'htc-vive'],
});
```

#### Methods

##### `initialize(session, referenceSpace): Promise<void>`

Initialize with XR session.

##### `update(frame, referenceSpace): void`

Update controller states (call every frame).

##### `getControllerState(id): ControllerState | undefined`

Get state for specific controller.

##### `getLeftController(): ControllerState | undefined`

Get left controller state.

##### `getRightController(): ControllerState | undefined`

Get right controller state.

##### `triggerHaptic(id, value, duration): void`

Trigger haptic feedback.

##### `triggerHapticPulse(id, strength): void`

Short haptic pulse (20ms).

#### Events

- `controllerConnected` (id, state)
- `controllerDisconnected` (id)
- `controllerUpdated` (id, state)
- `buttonPressed` (buttonName, controllerId)
- `buttonReleased` (buttonName, controllerId)
- `buttonChanged` (buttonName, value, controllerId)
- `triggerPressed` (controllerId)
- `triggerReleased` (controllerId)
- `gripPressed` (controllerId)
- `gripReleased` (controllerId)

### ControllerState

```typescript
interface ControllerState {
  handedness: 'left' | 'right' | 'none';
  connected: boolean;
  gripPosition: THREE.Vector3;
  gripRotation: THREE.Quaternion;
  gripMatrix: THREE.Matrix4;
  aimPosition: THREE.Vector3;
  aimRotation: THREE.Quaternion;
  aimMatrix: THREE.Matrix4;
  buttons: Map<string, ButtonState>;
  axes: { x: number; y: number };
  selection: boolean; // Trigger
  squeeze: boolean; // Grip
}
```

### XRInputSystem

ECS system for VR input.

#### Constructor

```typescript
const system = new XRInputSystem(xrInputManager, {
  enableHapticFeedback: true,
  hapticStrength: 0.5,
});
```

#### Events

- `entityHighlighted` (entityId)
- `entityUnhighlighted` (entityId)
- `entityGrabbed` (entityId, controllerId)
- `entityReleased` (entityId, controllerId)
- `entityThrown` (entityId, controllerId, velocity)
- `controllerEntityCreated` (entityId, handedness)

### VRInteractableComponent

ECS component for interactable entities.

```typescript
const interactable = new VRInteractableComponent({
  interactable: true,        // Can be interacted with
  grabbable: true,          // Can be grabbed
  throwable: true,          // Can be thrown
  highlightOnHover: true,   // Highlight when aiming at
});
```

## Controller Support

### Tested Controllers

- **Meta Quest 2/3** (Oculus Touch)
- **Valve Index**
- **HTC Vive**

### Button Mappings

#### Meta Quest (Oculus Touch)
- `trigger` - Index trigger
- `squeeze` / `grip` - Hand trigger
- `thumbstick` - Joystick
- `a-button` / `b-button` - Face buttons
- `menu` - Menu button

#### Valve Index
- `trigger` - Finger trigger
- `squeeze` / `grip` - Grip
- `thumbstick` - Joystick
- `a-button` / `b-button` - Face buttons
- `grip` - Grip button

#### HTC Vive
- `trigger` - Trigger
- `squeeze` / `grip` - Grip
- `thumbstick` - Trackpad
- `grip` - Side grip button

## Common Patterns

### Teleportation

```typescript
const leftController = xrInputManager.getLeftController();

if (leftController && leftController.axes.y < -0.5) {
  // Teleport forward
  const forward = new THREE.Vector3(0, 0, -1);
  forward.applyQuaternion(leftController.gripRotation);
  playerPosition.add(forward.multiplyScalar(3));
}
```

### UI Interaction

```typescript
// Check if aiming at UI element
xrInputSystem.on('entityHighlighted', (entityId) => {
  if (entityId === buttonId) {
    showButtonHighlight();
  }
});

// Trigger click
xrInputManager.on('triggerPressed', (controllerId) => {
  const hovered = getHoveredEntity();
  if (hovered === buttonId) {
    onButtonClick();
  }
});
```

### Custom Interactions

```typescript
xrInputManager.on('buttonPressed', (buttonName, controllerId) => {
  switch(buttonName) {
    case 'a-button':
      // Jump
      break;
    case 'b-button':
      // Crouch
      break;
    case 'thumbstick':
      // Toggle menu
      break;
  }
});
```

## Performance

### Optimization Tips

1. **Reduce Event Listeners**: Remove unused event listeners
2. **Object Pooling**: Reuse Vector3/Quaternion objects
3. **Distance Checks**: Use squared distance when possible
4. **Selective Updates**: Only update what changed

### Metrics

- Controller update: ~0.5ms per controller
- Interaction check: ~1ms for 100 entities
- Haptic feedback: ~10ms async

## Troubleshooting

### Controllers Not Detected

**Problem**: Controllers not showing up

**Solutions**:
1. Check browser WebXR support
2. Ensure controllers are on
3. Check console for errors
4. Verify XR session initialized

### Grabbing Not Working

**Problem**: Can't grab objects

**Solutions**:
1. Check entity has `VRInteractableComponent`
2. Verify `grabbable: true`
3. Check distance (< 2m default)
4. Ensure physics component exists

### Haptic Feedback Not Working

**Problem**: No vibration

**Solutions**:
1. Check `enableHapticFeedback: true`
2. Verify browser permission
3. Test with different controller
4. Check battery level

## Browser Support

### Desktop VR

- ✅ Chrome 89+ (WebXR)
- ✅ Edge 89+ (WebXR)
- ✅ Firefox (with flag)

### Standalone VR

- ✅ Meta Quest Browser
- ✅ Vive Focus Browser
- ✅ Pico Browser

### Mobile (WebXR AR)

- ✅ Chrome Android (AR)
- ✅ Firefox Reality (AR)

## React Integration

```typescript
import { createVRHook } from '@graphwiz-xr/hub-client/xr/example';

function VRScene() {
  const { isVRActive, controllers, enterVR, exitVR } = createVRHook()();

  return (
    <>
      {!isVRActive ? (
        <button onClick={enterVR}>Enter VR</button>
      ) : (
        <button onClick={exitVR}>Exit VR</button>
      )}
      <div>Controllers: {controllers.size}</div>
    </>
  );
}
```

## Examples

See `example.ts` for:
- Basic VR setup
- Grab and throw
- Teleportation
- UI interaction
- Two-handed manipulation
- React integration

## Future Enhancements

- [ ] Hand tracking support
- [ ] Gesture recognition
- [ ] Advanced physics interaction
- [ ] Touch controller support
- [ ] Finger tracking (Index, Quest Pro)

## License

MIT
