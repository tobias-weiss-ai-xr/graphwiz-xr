/**
 * WebXR Input Manager
 *
 * Manages VR controller input, tracking, and interaction.
 */
import { EventEmitter } from 'events';
import * as THREE from 'three';
export class XRInputManager extends EventEmitter {
    constructor(config = {}) {
        super();
        this.session = null;
        this.inputSources = new Map();
        this.controllerStates = new Map();
        // Button mappings for common controllers
        this.buttonMappings = new Map([
            ['oculus-touch', ['trigger', 'squeeze', 'thumbstick', 'a-button', 'b-button', 'grip']],
            ['valve-index', ['trigger', 'squeeze', 'thumbstick', 'a-button', 'b-button', 'grip']],
            ['htc-vive', ['trigger', 'squeeze', 'thumbstick', 'trackpad', 'grip']],
        ]);
        // Config stored but not currently used
        void config;
    }
    /**
     * Initialize XR session and input
     */
    async initialize(session, _referenceSpace) {
        this.session = session;
        // Get initial input sources
        for (const inputSource of session.inputSources) {
            this.addInputSource(inputSource);
        }
        // Listen for new input sources
        session.addEventListener('inputsourceschange', (event) => {
            this.handleInputSourcesChange(event);
        });
        // XRSession doesn't have a mode property, we can check if it's immersive
        const isImmersive = session.enabledFeatures?.includes('immersive-vr') || session.enabledFeatures?.includes('immersive-ar');
        console.log('[XRInputManager] Initialized with immersive session:', isImmersive);
        this.emit('initialized');
    }
    /**
     * Update controller states - call this every frame
     */
    update(frame, referenceSpace) {
        if (!this.session)
            return;
        // Update each controller
        for (const [id, inputSource] of this.inputSources) {
            const state = this.controllerStates.get(id);
            if (!state || !inputSource.gamepad)
                continue;
            const gamepad = inputSource.gamepad;
            // Get controller pose (check for undefined spaces)
            const gripSpace = inputSource.gripSpace;
            const targetRaySpace = inputSource.targetRaySpace;
            if (!gripSpace || !targetRaySpace)
                continue;
            const gripPose = frame.getPose(gripSpace, referenceSpace);
            const aimPose = frame.getPose(targetRaySpace, referenceSpace);
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
    updateButtons(state, gamepad) {
        // Map gamepad buttons to named buttons
        const buttonMap = this.getButtonMapping(gamepad.id);
        gamepad.buttons.forEach((button, index) => {
            const buttonName = buttonMap[index] || `button-${index}`;
            const buttonState = {
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
    getButtonMapping(gamepadId) {
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
    addInputSource(inputSource) {
        const id = this.getControllerId(inputSource);
        console.log('[XRInputManager] Controller connected:', id, inputSource.handedness);
        this.inputSources.set(id, inputSource);
        // Create controller state
        const state = {
            handedness: inputSource.handedness,
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
    removeInputSource(inputSource) {
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
    handleInputSourcesChange(event) {
        const session = event.target;
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
    getControllerId(inputSource) {
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
    getControllerState(controllerId) {
        return this.controllerStates.get(controllerId);
    }
    /**
     * Get left controller state
     */
    getLeftController() {
        for (const [, state] of this.controllerStates) {
            if (state.handedness === 'left') {
                return state;
            }
        }
        return undefined;
    }
    /**
     * Get right controller state
     */
    getRightController() {
        for (const [, state] of this.controllerStates) {
            if (state.handedness === 'right') {
                return state;
            }
        }
        return undefined;
    }
    /**
     * Check if any controller is connected
     */
    isControllerConnected() {
        return this.controllerStates.size > 0;
    }
    /**
     * Get all connected controllers
     */
    getControllers() {
        return new Map(this.controllerStates);
    }
    /**
     * Trigger haptic feedback
     */
    triggerHaptic(controllerId, value, duration, _forceHaptic) {
        const inputSource = this.inputSources.get(controllerId);
        if (!inputSource || !inputSource.gamepad || !this.session) {
            console.warn('[XRInputManager] Cannot trigger haptic: controller not found');
            return;
        }
        const gamepad = inputSource.gamepad;
        if (gamepad.hapticActuators && gamepad.hapticActuators.length > 0) {
            gamepad.hapticActuators[0].pulse(value, duration).then((success) => {
                if (success) {
                    console.log(`[XRInputManager] Haptic feedback: ${controllerId}, value=${value}, duration=${duration}ms`);
                }
                else {
                    console.warn('[XRInputManager] Haptic feedback failed');
                }
            });
        }
    }
    /**
     * Trigger haptic pulse
     */
    triggerHapticPulse(controllerId, strength = 0.5) {
        // Short 20ms pulse
        this.triggerHaptic(controllerId, strength, 20);
    }
    /**
     * Cleanup
     */
    dispose() {
        this.inputSources.clear();
        this.controllerStates.clear();
        this.session = null;
        this.removeAllListeners();
    }
}
