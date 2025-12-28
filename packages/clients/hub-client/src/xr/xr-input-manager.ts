/**
 * WebXR Input Manager
 *
 * Manages VR controller input, tracking, and interaction.
 */

import * as THREE from 'three';
import { EventEmitter } from 'events';

export interface ControllerState {
  handedness: 'left' | 'right' | 'none';
  connected: boolean;
  gripPosition: THREE.Vector3;
  gripRotation: THREE.Quaternion;
  gripMatrix: THREE.Matrix4;
  aimPosition: THREE.Vector3;
  aimRotation: THREE.Quaternion;
  aimMatrix: THREE.Matrix4;
  buttons: Map<string, ButtonState>;
  axes: { x: number; y: number }; // Thumbstick
  selection: boolean; // Trigger button
  squeeze: boolean; // Grip button
}

export interface ButtonState {
  pressed: boolean;
  touched: boolean;
  value: number; // 0-1 for analog buttons
}

export interface XRInputManagerConfig {
  autoEnable?: boolean;
  controllerProfiles?: string[];
}

export class XRInputManager extends EventEmitter {
  private session: XRSession | null = null;
  private inputSources: Map<string, XRInputSource> = new Map();
  private controllerStates: Map<string, ControllerState> = new Map();
  private referenceSpace: XRReferenceSpace | null = null;
  private tempMatrix = new THREE.Matrix4();
  private tempPosition = new THREE.Vector3();
  private tempQuaternion = new THREE.Quaternion();
  private config: XRInputManagerConfig;

  // Button mappings for common controllers
  private buttonMappings: Map<string, string[]> = new Map([
    ['oculus-touch', ['trigger', 'squeeze', 'thumbstick', 'a-button', 'b-button', 'grip']],
    ['valve-index', ['trigger', 'squeeze', 'thumbstick', 'a-button', 'b-button', 'grip']],
    ['htc-vive', ['trigger', 'squeeze', 'thumbstick', 'trackpad', 'grip']],
  ]);

  constructor(config: XRInputManagerConfig = {}) {
    super();
    this.config = {
      autoEnable: true,
      controllerProfiles: ['oculus-touch', 'valve-index', 'htc-vive'],
      ...config,
    };
  }

  /**
   * Initialize XR session and input
   */
  async initialize(session: XRSession, referenceSpace: XRReferenceSpace): Promise<void> {
    this.session = session;
    this.referenceSpace = referenceSpace;

    // Get initial input sources
    for (const inputSource of session.inputSources) {
      this.addInputSource(inputSource);
    }

    // Listen for new input sources
    session.addEventListener('inputsourceschange', (event) => {
      this.handleInputSourcesChange(event);
    });

    console.log('[XRInputManager] Initialized with session:', session.mode);

    this.emit('initialized');
  }

  /**
   * Update controller states - call this every frame
   */
  update(frame: XRFrame, referenceSpace: XRReferenceSpace): void {
    if (!this.session) return;

    // Update each controller
    for (const [id, inputSource] of this.inputSources) {
      const state = this.controllerStates.get(id);
      if (!state || !inputSource.gamepad) continue;

      const gamepad = inputSource.gamepad;

      // Get controller pose
      const gripPose = frame.getPose(inputSource.gripSpace, referenceSpace);
      const aimPose = frame.getPose(inputSource.targetRaySpace, referenceSpace);

      if (gripPose) {
        state.gripMatrix.fromArray(gripPose.transform.matrix);
        state.gripPosition.setFromMatrixPosition(state.gripMatrix);
        state.gripRotation.setFromRotationMatrix(state.gripMatrix);
      }

      if (aimPose) {
        state.aimMatrix.fromArray(aimPose.transform.matrix);
        state.aimPosition.setFromMatrixPosition(state.aimMatrix);
        state.aimRotation.setFromRotationMatrix(state.aimMatrix);
      }

      // Update buttons
      this.updateButtons(state, gamepad);

      // Update axes (thumbstick)
      if (gamepad.axes.length >= 2) {
        state.axes = {
          x: gamepad.axes[0],
          y: gamepad.axes[1],
        };
      }

      // Emit update event
      this.emit('controllerUpdated', id, state);
    }
  }

  /**
   * Update button states
   */
  private updateButtons(state: ControllerState, gamepad: Gamepad): void {
    const previousButtons = new Map(state.buttons);

    // Map gamepad buttons to named buttons
    const buttonMap = this.getButtonMapping(gamepad.id);

    gamepad.buttons.forEach((button, index) => {
      const buttonName = buttonMap[index] || `button-${index}`;

      const buttonState: ButtonState = {
        pressed: button.pressed,
        touched: button.touched,
        value: button.value,
      };

      const previousState = state.buttons.get(buttonName);

      // Detect button press events
      if (button.pressed && !previousState?.pressed) {
        this.emit('buttonPressed', buttonName, this.getControllerId(gamepad.id));
        this.emit(`${buttonName}Pressed`, this.getControllerId(gamepad.id));
      }

      // Detect button release events
      if (!button.pressed && previousState?.pressed) {
        this.emit('buttonReleased', buttonName, this.getControllerId(gamepad.id));
        this.emit(`${buttonName}Released`, this.getControllerId(gamepad.id));
      }

      // Detect value changes (for analog buttons)
      if (buttonState.value !== previousState?.value) {
        this.emit('buttonChanged', buttonName, buttonState.value, this.getControllerId(gamepad.id));
      }

      state.buttons.set(buttonName, buttonState);

      // Track special buttons
      if (buttonName === 'trigger') {
        state.selection = button.pressed;
      }
      if (buttonName === 'squeeze' || buttonName === 'grip') {
        state.squeeze = button.pressed;
      }
    });
  }

  /**
   * Get button mapping for controller type
   */
  private getButtonMapping(gamepadId: string): string[] {
    // Try to match controller profiles
    for (const [profile, buttons] of this.buttonMappings) {
      if (gamepadId.toLowerCase().includes(profile)) {
        return buttons;
      }
    }

    // Default mapping
    return ['trigger', 'squeeze', 'thumbstick', 'button-0', 'button-1', 'grip'];
  }

  /**
   * Add an input source
   */
  private addInputSource(inputSource: XRInputSource): void {
    const id = this.getControllerId(inputSource);

    console.log('[XRInputManager] Controller connected:', id, inputSource.handedness);

    this.inputSources.set(id, inputSource);

    // Create controller state
    const state: ControllerState = {
      handedness: inputSource.handedness as 'left' | 'right' | 'none',
      connected: true,
      gripPosition: new THREE.Vector3(),
      gripRotation: new THREE.Quaternion(),
      gripMatrix: new THREE.Matrix4(),
      aimPosition: new THREE.Vector3(),
      aimRotation: new THREE.Quaternion(),
      aimMatrix: new THREE.Matrix4(),
      buttons: new Map(),
      axes: { x: 0, y: 0 },
      selection: false,
      squeeze: false,
    };

    this.controllerStates.set(id, state);

    this.emit('controllerConnected', id, state);
  }

  /**
   * Remove an input source
   */
  private removeInputSource(inputSource: XRInputSource): void {
    const id = this.getControllerId(inputSource);

    console.log('[XRInputManager] Controller disconnected:', id);

    const state = this.controllerStates.get(id);
    if (state) {
      state.connected = false;
    }

    this.inputSources.delete(id);
    this.controllerStates.delete(id);

    this.emit('controllerDisconnected', id);
  }

  /**
   * Handle input sources change
   */
  private handleInputSourcesChange(event: XRSessionEvent): void {
    const session = event.target as XRSession;

    // Add new sources
    for (const inputSource of session.inputSources) {
      const id = this.getControllerId(inputSource);
      if (!this.inputSources.has(id)) {
        this.addInputSource(inputSource);
      }
    }

    // Remove disconnected sources
    for (const [id, inputSource] of this.inputSources) {
      let found = false;
      for (const sessionSource of session.inputSources) {
        if (this.getControllerId(sessionSource) === id) {
          found = true;
          break;
        }
      }

      if (!found) {
        this.removeInputSource(inputSource);
      }
    }
  }

  /**
   * Get controller ID from input source
   */
  private getControllerId(inputSource: XRInputSource | string): string {
    if (typeof inputSource === 'string') {
      return inputSource;
    }

    if (inputSource.handedness !== 'none') {
      return inputSource.handedness;
    }

    return `controller-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get controller state
   */
  getControllerState(controllerId: string): ControllerState | undefined {
    return this.controllerStates.get(controllerId);
  }

  /**
   * Get left controller state
   */
  getLeftController(): ControllerState | undefined {
    for (const [id, state] of this.controllerStates) {
      if (state.handedness === 'left') {
        return state;
      }
    }
    return undefined;
  }

  /**
   * Get right controller state
   */
  getRightController(): ControllerState | undefined {
    for (const [id, state] of this.controllerStates) {
      if (state.handedness === 'right') {
        return state;
      }
    }
    return undefined;
  }

  /**
   * Check if any controller is connected
   */
  isControllerConnected(): boolean {
    return this.controllerStates.size > 0;
  }

  /**
   * Get all connected controllers
   */
  getControllers(): Map<string, ControllerState> {
    return new Map(this.controllerStates);
  }

  /**
   * Trigger haptic feedback
   */
  triggerHaptic(
    controllerId: string,
    value: number,
    duration: number,
    forceHaptic?: boolean
  ): void {
    const inputSource = this.inputSources.get(controllerId);
    if (!inputSource || !inputSource.gamepad || !this.session) {
      console.warn('[XRInputManager] Cannot trigger haptic: controller not found');
      return;
    }

    const gamepad = inputSource.gamepad as Gamepad & {
      hapticActuators: Array<{
        pulse: (value: number, duration: number) => Promise<boolean>;
      }>;
    };

    if (gamepad.hapticActuators && gamepad.hapticActuators.length > 0) {
      gamepad.hapticActuators[0].pulse(value, duration).then((success) => {
        if (success) {
          console.log(`[XRInputManager] Haptic feedback: ${controllerId}, value=${value}, duration=${duration}ms`);
        } else {
          console.warn('[XRInputManager] Haptic feedback failed');
        }
      });
    }
  }

  /**
   * Trigger haptic pulse
   */
  triggerHapticPulse(controllerId: string, strength: number = 0.5): void {
    // Short 20ms pulse
    this.triggerHaptic(controllerId, strength, 20);
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.inputSources.clear();
    this.controllerStates.clear();
    this.session = null;
    this.referenceSpace = null;
    this.removeAllListeners();
  }
}
