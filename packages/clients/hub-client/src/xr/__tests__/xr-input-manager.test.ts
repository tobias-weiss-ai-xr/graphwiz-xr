/**
 * Tests for XR Input Manager
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { EventEmitter } from 'events';
import { XRInputManager, ControllerState, ButtonState } from '../xr-input-manager';

// Mock XRSession
const createMockXRSession = (inputSources: XRInputSource[] = []): XRSession => {
  const session = new EventEmitter() as unknown as XRSession;
  session.inputSources = inputSources;
  session.mode = 'immersive-vr';
  session.addEventListener = vi.fn();
  return session as any;
};

// Mock XRInputSource
const createMockInputSource = (
  handedness: 'left' | 'right' | 'none' = 'none',
  gamepad?: Gamepad
): XRInputSource => {
  return {
    handedness,
    gamepad: gamepad || null,
    gripSpace: {} as any,
    targetRaySpace: {} as any,
  } as XRInputSource;
};

// Mock Gamepad
const createMockGamepad = (
  id: string,
  buttons: { pressed: boolean; touched: boolean; value: number }[] = [],
  axes: number[] = []
): Gamepad => {
  return {
    id,
    buttons: buttons.map(b => ({ pressed: b.pressed, touched: b.touched, value: b.value })),
    axes,
    mapping: 'standard',
    connected: true,
    timestamp: performance.now(),
    hapticActuators: [
      {
        pulse: vi.fn().mockResolvedValue(true),
      },
    ],
  } as unknown as Gamepad;
};

// Mock XRFrame
const createMockXRFrame = (
  gripPose: XRPose | null = null,
  aimPose: XRPose | null = null
): XRFrame => {
  const frame = {
    getPose: vi.fn(),
  } as unknown as XRFrame;

  (frame.getPose as any).mockImplementation((space: XRSpace) => {
    if (gripPose && space === ({} as any)) return gripPose; // gripSpace
    if (aimPose && space === ({} as any)) return aimPose; // targetRaySpace
    return null;
  });

  return frame;
};

// Mock XRReferenceSpace
const mockReferenceSpace = {} as XRReferenceSpace;

describe('XRInputManager', () => {
  let xrInputManager: XRInputManager;

  beforeEach(() => {
    xrInputManager = new XRInputManager({
      autoEnable: true,
      controllerProfiles: ['oculus-touch', 'valve-index'],
    });
  });

  afterEach(() => {
    xrInputManager.dispose();
  });

  describe('Initialization', () => {
    it('should create manager with config', () => {
      expect(xrInputManager).toBeDefined();
      expect(xrInputManager.isControllerConnected()).toBe(false);
    });

    it('should have default config', () => {
      const defaultManager = new XRInputManager();
      expect(defaultManager).toBeDefined();
    });

    it('should initialize with XR session', async () => {
      const session = createMockXRSession();
      const referenceSpace = mockReferenceSpace;

      const initializedSpy = vi.fn();
      xrInputManager.on('initialized', initializedSpy);

      await xrInputManager.initialize(session, referenceSpace);

      expect(initializedSpy).toHaveBeenCalled();
    });

    it('should register input sources on initialization', async () => {
      const leftController = createMockInputSource('left');
      const session = createMockXRSession([leftController]);

      const connectedSpy = vi.fn();
      xrInputManager.on('controllerConnected', connectedSpy);

      await xrInputManager.initialize(session, mockReferenceSpace);

      expect(connectedSpy).toHaveBeenCalledWith('left', expect.any(Object));
    });

    it('should listen for input sources changes', async () => {
      const session = createMockXRSession();

      await xrInputManager.initialize(session, mockReferenceSpace);

      expect(session.addEventListener).toHaveBeenCalledWith(
        'inputsourceschange',
        expect.any(Function)
      );
    });
  });

  describe('Controller state tracking', () => {
    it('should get controller state by ID', async () => {
      const leftController = createMockInputSource('left');
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      const state = xrInputManager.getControllerState('left');
      expect(state).toBeDefined();
      expect(state?.handedness).toBe('left');
      expect(state?.connected).toBe(true);
    });

    it('should return undefined for non-existent controller', () => {
      const state = xrInputManager.getControllerState('non-existent');
      expect(state).toBeUndefined();
    });

    it('should get left controller', async () => {
      const leftController = createMockInputSource('left');
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      const state = xrInputManager.getLeftController();
      expect(state).toBeDefined();
      expect(state?.handedness).toBe('left');
    });

    it('should get right controller', async () => {
      const rightController = createMockInputSource('right');
      const session = createMockXRSession([rightController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      const state = xrInputManager.getRightController();
      expect(state).toBeDefined();
      expect(state?.handedness).toBe('right');
    });

    it('should return undefined when no controller of handedness exists', async () => {
      const session = createMockXRSession([]);
      await xrInputManager.initialize(session, mockReferenceSpace);

      const leftState = xrInputManager.getLeftController();
      const rightState = xrInputManager.getRightController();

      expect(leftState).toBeUndefined();
      expect(rightState).toBeUndefined();
    });

    it('should get all connected controllers', async () => {
      const leftController = createMockInputSource('left');
      const rightController = createMockInputSource('right');
      const session = createMockXRSession([leftController, rightController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      const controllers = xrInputManager.getControllers();
      expect(controllers.size).toBe(2);
    });

    it('should check if any controller is connected', async () => {
      expect(xrInputManager.isControllerConnected()).toBe(false);

      const leftController = createMockInputSource('left');
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      expect(xrInputManager.isControllerConnected()).toBe(true);
    });
  });

  describe('Controller updates', () => {
    it('should update controller pose', async () => {
      const mockGamepad = createMockGamepad('oculus-touch', [], []);
      const leftController = createMockInputSource('left', mockGamepad);
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      // Create proper column-major matrix for Three.js
      // Format: [m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44]
      const gripMatrix = new Float32Array([
        1, 0, 0, 0,  // column 1
        0, 1, 0, 0,  // column 2
        0, 0, 1, 0,  // column 3
        1, 2, 3, 1   // column 4 (translation)
      ]);

      const gripPose = {
        transform: {
          matrix: gripMatrix,
        },
      } as XRPose;

      const aimMatrix = new Float32Array([
        1, 0, 0, 0,  // column 1
        0, 1, 0, 0,  // column 2
        0, 0, 1, 0,  // column 3
        0, 0, -1, 1  // column 4 (translation)
      ]);

      const aimPose = {
        transform: {
          matrix: aimMatrix,
        },
      } as XRPose;

      // Update the mock frame to return poses based on space
      const frame = {
        getPose: vi.fn(),
      } as unknown as XRFrame;

      (frame.getPose as any).mockImplementation((space: XRSpace) => {
        // Simplified: return gripPose for any space (not checking space type)
        return space === leftController.gripSpace ? gripPose : aimPose;
      });

      const updatedSpy = vi.fn();
      xrInputManager.on('controllerUpdated', updatedSpy);

      xrInputManager.update(frame, mockReferenceSpace);

      expect(updatedSpy).toHaveBeenCalled();

      const state = xrInputManager.getControllerState('left');
      expect(state?.gripPosition.x).toBeCloseTo(1);
      expect(state?.gripPosition.y).toBeCloseTo(2);
      expect(state?.gripPosition.z).toBeCloseTo(3);
    });

    it('should update button states', async () => {
      const mockGamepad = createMockGamepad('oculus-touch', [
        { pressed: true, touched: true, value: 0.5 }, // trigger
        { pressed: false, touched: false, value: 0 }, // squeeze
      ]);

      const leftController = createMockInputSource('left', mockGamepad);
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      const frame = createMockXRFrame();
      xrInputManager.update(frame, mockReferenceSpace);

      const state = xrInputManager.getControllerState('left');
      expect(state?.selection).toBe(true);
      expect(state?.squeeze).toBe(false);
    });

    it('should update thumbstick axes', async () => {
      const mockGamepad = createMockGamepad('oculus-touch', [], [0.5, -0.3]);
      const leftController = createMockInputSource('left', mockGamepad);
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      const frame = createMockXRFrame();
      xrInputManager.update(frame, mockReferenceSpace);

      const state = xrInputManager.getControllerState('left');
      expect(state?.axes.x).toBe(0.5);
      expect(state?.axes.y).toBe(-0.3);
    });
  });

  describe('Button events', () => {
    it('should emit button press event', async () => {
      // Use a controller without gamepad initially to get handedness-based ID
      const leftController = createMockInputSource('left', undefined);
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      const pressSpy = vi.fn();
      xrInputManager.on('buttonPressed', pressSpy);

      // First update: no gamepad, no button events
      let frame = createMockXRFrame();
      xrInputManager.update(frame, mockReferenceSpace);

      expect(pressSpy).not.toHaveBeenCalled();

      // Now add a gamepad and trigger button press
      const mockGamepad = createMockGamepad('oculus-touch', [
        { pressed: true, touched: true, value: 1 },
      ]);
      leftController.gamepad = mockGamepad;

      frame = createMockXRFrame();
      xrInputManager.update(frame, mockReferenceSpace);

      expect(pressSpy).toHaveBeenCalledWith('trigger', 'oculus-touch'); // Gamepad ID overrides handedness
    });

    it('should emit button release event', async () => {
      const mockGamepad = createMockGamepad('oculus-touch', [
        { pressed: true, touched: true, value: 1 },
      ]);

      const leftController = createMockInputSource('left', mockGamepad);
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      const releaseSpy = vi.fn();
      xrInputManager.on('buttonReleased', releaseSpy);

      // First update: button pressed
      let frame = createMockXRFrame();
      xrInputManager.update(frame, mockReferenceSpace);

      // Second update: button released
      mockGamepad.buttons[0].pressed = false;
      mockGamepad.buttons[0].value = 0;
      frame = createMockXRFrame();
      xrInputManager.update(frame, mockReferenceSpace);

      expect(releaseSpy).toHaveBeenCalledWith('trigger', 'oculus-touch'); // Uses gamepad ID
    });

    it('should emit button-specific events', async () => {
      const mockGamepad = createMockGamepad('oculus-touch', [
        { pressed: false, touched: false, value: 0 },
      ]);

      const leftController = createMockInputSource('left', mockGamepad);
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      const triggerPressSpy = vi.fn();
      xrInputManager.on('triggerPressed', triggerPressSpy);

      mockGamepad.buttons[0].pressed = true;
      const frame = createMockXRFrame();
      xrInputManager.update(frame, mockReferenceSpace);

      expect(triggerPressSpy).toHaveBeenCalledWith('oculus-touch'); // Uses gamepad ID
    });
  });

  describe('Haptic feedback', () => {
    it('should trigger haptic feedback', async () => {
      const hapticPulse = vi.fn().mockResolvedValue(true);
      const mockGamepad = createMockGamepad('oculus-touch', [], []) as Gamepad & {
        hapticActuators: Array<{ pulse: (value: number, duration: number) => Promise<boolean> }>;
      };
      mockGamepad.hapticActuators = [{ pulse: hapticPulse }];

      const leftController = createMockInputSource('left', mockGamepad);
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      xrInputManager.triggerHaptic('left', 0.5, 100);

      expect(hapticPulse).toHaveBeenCalledWith(0.5, 100);
    });

    it('should trigger haptic pulse', async () => {
      const hapticPulse = vi.fn().mockResolvedValue(true);
      const mockGamepad = createMockGamepad('oculus-touch', [], []) as Gamepad & {
        hapticActuators: Array<{ pulse: (value: number, duration: number) => Promise<boolean> }>;
      };
      mockGamepad.hapticActuators = [{ pulse: hapticPulse }];

      const leftController = createMockInputSource('left', mockGamepad);
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      xrInputManager.triggerHapticPulse('left', 0.7);

      expect(hapticPulse).toHaveBeenCalledWith(0.7, 20); // 20ms pulse
    });

    it('should warn when triggering haptic on non-existent controller', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      xrInputManager.triggerHaptic('non-existent', 0.5, 100);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[XRInputManager] Cannot trigger haptic: controller not found'
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Controller connection/disconnection', () => {
    it('should emit controller connected event', async () => {
      const leftController = createMockInputSource('left');
      const session = createMockXRSession([leftController]);

      const connectedSpy = vi.fn();
      xrInputManager.on('controllerConnected', connectedSpy);

      await xrInputManager.initialize(session, mockReferenceSpace);

      expect(connectedSpy).toHaveBeenCalledWith('left', expect.any(Object));
    });

    it('should remove controller state on disconnect', async () => {
      // Create input source with gamepad for proper ID generation
      const mockGamepad = createMockGamepad('oculus-touch', [], []);
      const leftController = createMockInputSource('left', mockGamepad);
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      // Controller should be connected with 'left' as ID (from handedness)
      expect(xrInputManager.getControllerState('left')).toBeDefined();

      const disconnectedSpy = vi.fn();
      xrInputManager.on('controllerDisconnected', disconnectedSpy);

      // Manually call the private method through the event system
      // Simulate the controller being removed by emitting the event
      const removeMethod = (xrInputManager as any).removeInputSource.bind(xrInputManager);
      removeMethod(leftController);

      // After disconnect, state should be removed and event emitted
      expect(disconnectedSpy).toHaveBeenCalled();
      expect(xrInputManager.getControllerState('left')).toBeUndefined();
    });
  });

  describe('Cleanup', () => {
    it('should dispose resources', async () => {
      const leftController = createMockInputSource('left');
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      expect(xrInputManager.isControllerConnected()).toBe(true);

      xrInputManager.dispose();

      expect(xrInputManager.isControllerConnected()).toBe(false);
      expect(xrInputManager.getControllers().size).toBe(0);
    });

    it('should remove all event listeners', async () => {
      const session = createMockXRSession([]);
      await xrInputManager.initialize(session, mockReferenceSpace);

      const spy = vi.fn();
      xrInputManager.on('test', spy);

      xrInputManager.dispose();

      // After dispose, emit should not trigger
      xrInputManager.emit('test');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Button mappings', () => {
    it('should use correct button mapping for oculus-touch', async () => {
      const mockGamepad = createMockGamepad(
        'Oculus Touch Controller',
        [
          { pressed: true, touched: true, value: 1 },
          { pressed: true, touched: true, value: 1 },
          { pressed: false, touched: false, value: 0 },
          { pressed: false, touched: false, value: 0 },
          { pressed: false, touched: false, value: 0 },
        ],
        []
      );

      const leftController = createMockInputSource('left', mockGamepad);
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      const frame = createMockXRFrame();
      xrInputManager.update(frame, mockReferenceSpace);

      const state = xrInputManager.getControllerState('left');
      expect(state?.buttons.has('trigger')).toBe(true);
      expect(state?.buttons.has('squeeze')).toBe(true);
      expect(state?.buttons.has('thumbstick')).toBe(true);
    });

    it('should use default button mapping for unknown controller', async () => {
      const mockGamepad = createMockGamepad(
        'Unknown Controller',
        [
          { pressed: true, touched: true, value: 1 },
        ],
        []
      );

      const leftController = createMockInputSource('left', mockGamepad);
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      const frame = createMockXRFrame();
      xrInputManager.update(frame, mockReferenceSpace);

      const state = xrInputManager.getControllerState('left');
      expect(state?.buttons.has('trigger')).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle update when not initialized', () => {
      const frame = createMockXRFrame();
      expect(() => {
        xrInputManager.update(frame, mockReferenceSpace);
      }).not.toThrow();
    });

    it('should handle update with no frame', async () => {
      const leftController = createMockInputSource('left');
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      expect(() => {
        xrInputManager.update(null as any, mockReferenceSpace);
      }).not.toThrow();
    });

    it('should handle controller with no gamepad', async () => {
      const leftController = createMockInputSource('left', undefined);
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      const frame = createMockXRFrame();
      expect(() => {
        xrInputManager.update(frame, mockReferenceSpace);
      }).not.toThrow();
    });

    it('should handle missing poses', async () => {
      const mockGamepad = createMockGamepad('oculus-touch', [], []);
      const leftController = createMockInputSource('left', mockGamepad);
      const session = createMockXRSession([leftController]);

      await xrInputManager.initialize(session, mockReferenceSpace);

      const frame = createMockXRFrame(null, null); // No poses
      expect(() => {
        xrInputManager.update(frame, mockReferenceSpace);
      }).not.toThrow();
    });
  });
});
