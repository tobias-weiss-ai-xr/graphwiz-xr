/**
 * VR Input Examples
 *
 * Demonstrates how to use the WebXR input system for VR controller interactions.
 */

import { Engine } from '../core';
import { XRInputManager, XRInputSystem, VRInteractableComponent } from '../xr';
import { TransformComponent } from '../ecs/entity';

/**
 * Example 1: Basic VR Setup
 *
 * Shows how to initialize VR and track controllers
 */
export async function basicVRSetup() {
  console.log('=== Basic VR Setup Example ===\n');

  // Create engine
  const engine = new Engine();

  // Create XR input manager
  const xrInputManager = new XRInputManager({
    autoEnable: true,
  });

  // Request VR session
  const xrSupported = await navigator.xr?.isSessionSupported('immersive-vr');
  if (!xrSupported) {
    console.error('VR not supported');
    return;
  }

  const session = await navigator.xr!.requestSession('immersive-vr', {
    optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
  });

  // Create reference space
  const referenceSpace = await session.requestReferenceSpace('local-floor');

  // Initialize input manager
  await xrInputManager.initialize(session, referenceSpace);

  // Create XR input system
  const xrInputSystem = new XRInputSystem(xrInputManager, {
    enableHapticFeedback: true,
    hapticStrength: 0.5,
  });

  engine.addSystem(xrInputSystem);

  // Listen for controller events
  xrInputManager.on('controllerConnected', (controllerId: string, state) => {
    console.log(`✓ Controller connected: ${controllerId} (${state.handedness})`);
  });

  xrInputManager.on('buttonPressed', (buttonName: string, controllerId: string) => {
    console.log(`✓ Button pressed: ${buttonName} on ${controllerId}`);
  });

  // Render loop
  const onXRFrame = (time: XRFrameSyncEvent, frame: XRFrame) => {
    // Update input manager with latest frame
    xrInputManager.update(frame, referenceSpace);

    // Update engine
    engine.update(0.016); // ~60fps

    session.requestAnimationFrame(onXRFrame);
  };

  session.requestAnimationFrame(onXRFrame);

  console.log('VR session started. Put on headset now!');

  return () => {
    session.end();
    xrInputManager.dispose();
  };
}

/**
 * Example 2: Grab and Throw Objects
 *
 * Shows how to create grabbable objects
 */
export async function grabAndThrowExample() {
  console.log('=== Grab and Throw Example ===\n');

  const engine = new Engine();
  const xrInputManager = new XRInputManager();

  // Setup VR session (simplified - see Example 1)
  // ...

  const xrInputSystem = new XRInputSystem(xrInputManager);
  engine.addSystem(xrInputSystem);

  // Create a grabbable cube
  const cube = engine.getWorld().createEntity();

  // Add transform
  const transform = new TransformComponent();
  transform.position.set(0, 1.5, -2); // In front of player
  cube.addComponent(TransformComponent, transform);

  // Make it grabbable
  const interactable = new VRInteractableComponent({
    interactable: true,
    grabbable: true,
    throwable: true,
    highlightOnHover: true,
  });
  cube.addComponent(VRInteractableComponent, interactable);

  // Listen for grab events
  xrInputSystem.on('entityGrabbed', (entityId: string, controllerId: string) => {
    console.log(`✓ Entity ${entityId} grabbed by ${controllerId}`);
  });

  xrInputSystem.on('entityThrown', (entityId: string, controllerId: string, velocity) => {
    console.log(`✓ Entity ${entityId} thrown with velocity:`, velocity);
  });

  xrInputSystem.on('entityHighlighted', (entityId: string) => {
    console.log(`→ Looking at entity ${entityId}`);
    // Could highlight the mesh here
  });

  xrInputSystem.on('entityUnhighlighted', (entityId: string) => {
    console.log(`← No longer looking at entity ${entityId}`);
  });

  console.log('✓ Grabable cube created at (0, 1.5, -2)');
  console.log('✓ Use grip button to grab, release to throw');
}

/**
 * Example 3: Teleportation Movement
 *
 * Shows how to implement teleportation using thumbstick
 */
export async function teleportationExample() {
  console.log('=== Teleportation Example ===\n');

  const engine = new Engine();
  const xrInputManager = new XRInputManager();

  // Setup VR session...
  const xrInputSystem = new XRInputSystem(xrInputManager);
  engine.addSystem(xrInputSystem);

  // Player position
  const playerPosition = new THREE.Vector3(0, 0, 0);

  // Track teleportation state
  let isTeleporting = false;
  let teleportTarget = new THREE.Vector3();

  // Update loop
  const update = () => {
    const leftController = xrInputManager.getLeftController();
    const rightController = xrInputManager.getRightController();

    // Use left thumbstick for teleportation
    if (leftController) {
      const { axes } = leftController;

      // Check if thumbstick is pushed forward
      if (axes.y < -0.5) {
        if (!isTeleporting) {
          // Start teleportation
          isTeleporting = true;

          // Calculate teleport target
          const forward = new THREE.Vector3(0, 0, -1);
          forward.applyQuaternion(leftController.gripRotation);

          teleportTarget.copy(playerPosition).add(forward.multiplyScalar(3));

          // Show teleportation indicator
          showTeleportIndicator(teleportTarget);

          console.log('→ Teleporting to:', teleportTarget);
        }
      } else if (isTeleporting) {
        // Complete teleportation
        playerPosition.copy(teleportTarget);

        // Hide indicator
        hideTeleportIndicator();

        // Trigger haptic feedback
        xrInputManager.triggerHapticPulse('left', 0.3);

        isTeleporting = false;

        console.log('✓ Teleported to:', playerPosition);
      }
    }
  };

  // Add to game loop
  engine.on('update', update);

  console.log('✓ Push left thumbstick forward to teleport');
}

/**
 * Example 4: UI Interaction
 *
 * Shows how to interact with UI elements in VR
 */
export async function uiInteractionExample() {
  console.log('=== UI Interaction Example ===\n');

  const engine = new Engine();
  const xrInputManager = new XRInputManager();

  // Setup VR session...
  const xrInputSystem = new XRInputSystem(xrInputManager);
  engine.addSystem(xrInputSystem);

  // Create a simple button
  const button = engine.getWorld().createEntity();

  const transform = new TransformComponent();
  transform.position.set(0, 1.6, -1); // At eye level
  button.addComponent(TransformComponent, transform);

  const interactable = new VRInteractableComponent({
    interactable: true,
    grabbable: false, // Not grabbable, just clickable
  });
  button.addComponent(VRInteractableComponent, interactable);

  // Listen for UI interactions
  let hovering = false;

  xrInputSystem.on('entityHighlighted', (entityId: string) => {
    if (entityId === button.id) {
      hovering = true;
      console.log('→ Hovering over button');
      // Could show button highlight
    }
  });

  xrInputSystem.on('entityUnhighlighted', (entityId: string) => {
    if (entityId === button.id) {
      hovering = false;
      console.log('← Left button');
    }
  });

  xrInputManager.on('buttonPressed', (buttonName: string, controllerId: string) => {
    if (buttonName === 'trigger' && hovering) {
      console.log('✓ Button clicked!');
      xrInputManager.triggerHapticPulse(controllerId, 0.5);
      // Trigger button action
    }
  });

  console.log('✓ Point at button and pull trigger to click');
}

/**
 * Example 5: Two-Handed Object Manipulation
 *
 * Shows how to manipulate objects with both hands
 */
export async function twoHandedExample() {
  console.log('=== Two-Handed Manipulation Example ===\n');

  const engine = new Engine();
  const xrInputManager = new XRInputManager();

  // Setup VR session...
  const xrInputSystem = new XRInputSystem(xrInputManager);
  engine.addSystem(xrInputSystem);

  // Create a large object
  const largeObject = engine.getWorld().createEntity();

  const transform = new TransformComponent();
  transform.position.set(0, 1.5, -2);
  largeObject.addComponent(TransformComponent, transform);

  const interactable = new VRInteractableComponent({
    interactable: true,
    grabbable: true,
    throwable: false, // Don't throw large objects
  });
  largeObject.addComponent(VRInteractableComponent, interactable);

  // Track two-handed manipulation
  let primaryGrab: string | null = null;
  let secondaryGrab: string | null = null;

  xrInputSystem.on('entityGrabbed', (entityId: string, controllerId: string) => {
    if (entityId === largeObject.id) {
      if (!primaryGrab) {
        primaryGrab = controllerId;
        console.log(`✓ Primary grab: ${controllerId}`);
      } else if (!secondaryGrab) {
        secondaryGrab = controllerId;
        console.log(`✓ Secondary grab: ${controllerId}`);
        console.log('✓ Two-handed manipulation enabled');
      }
    }
  });

  xrInputSystem.on('entityReleased', (entityId: string, controllerId: string) => {
    if (entityId === largeObject.id) {
      if (controllerId === primaryGrab) {
        primaryGrab = null;
        console.log(`✓ Released primary: ${controllerId}`);
      } else if (controllerId === secondaryGrab) {
        secondaryGrab = null;
        console.log(`✓ Released secondary: ${controllerId}`);
      }
    }
  });

  console.log('✓ Grab object with one hand, then grab with other for two-handed control');
}

/**
 * Helper: Show teleportation indicator
 */
function showTeleportIndicator(position: THREE.Vector3) {
  // Create a visual indicator (ring/arrow)
  console.log('  [Showing teleport indicator at]', position);
}

/**
 * Helper: Hide teleportation indicator
 */
function hideTeleportIndicator() {
  console.log('  [Hiding teleport indicator]');
}

/**
 * Example 6: React Integration
 *
 * Shows how to use VR input in a React component
 */
export function createVRHook() {
  return () => {
    const [isVRActive, setIsVRActive] = React.useState(false);
    const [controllers, setControllers] = React.useState<Map<string, any>>(new Map());
    const [xrInputManager, setXRInputManager] = React.useState<XRInputManager | null>(null);

    React.useEffect(() => {
      const manager = new XRInputManager();
      setXRInputManager(manager);

      manager.on('controllerConnected', (id: string, state: any) => {
        setControllers(prev => new Map(prev).set(id, state));
      });

      manager.on('controllerDisconnected', (id: string) => {
        setControllers(prev => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      });

      return () => {
        manager.dispose();
      };
    }, []);

    const enterVR = async () => {
      if (!navigator.xr) {
        console.error('WebXR not supported');
        return;
      }

      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor'],
      });

      const referenceSpace = await session.requestReferenceSpace('local-floor');
      await xrInputManager!.initialize(session, referenceSpace);

      setIsVRActive(true);
    };

    const exitVR = () => {
      // End session
      setIsVRActive(false);
    };

    return {
      isVRActive,
      controllers,
      xrInputManager,
      enterVR,
      exitVR,
    };
  };
}

import React from 'react';

/**
 * Usage example in React:
 *
 * ```tsx
 * function VRScene() {
 *   const { isVRActive, controllers, enterVR, exitVR } = createVRHook()();
 *
 *   return (
 *     <div>
 *       {!isVRActive ? (
 *         <button onClick={enterVR}>Enter VR</button>
 *       ) : (
 *         <>
 *           <button onClick={exitVR}>Exit VR</button>
 *           <div>Controllers: {controllers.size}</div>
 *         </>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

export default {
  basicVRSetup,
  grabAndThrowExample,
  teleportationExample,
  uiInteractionExample,
  twoHandedExample,
  createVRHook,
};
