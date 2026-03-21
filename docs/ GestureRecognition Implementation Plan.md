# Gesture Recognition Implementation Plan

## Executive Summary

**Goal**: Implement comprehensive gesture recognition system for GraphWiz-XR VR application

**Current State**: Basic placeholder exists (`GestureRecognition.tsx`) - uses simulated controller positions with simplified detection logic.

**Target**: Production-ready gesture recognition with hand tracking support, multiple gesture types, and native WebXR hand input integration.

---

## Research Findings

### 1. Existing Codebase Analysis

**Current Implementation** (`packages/clients/hub-client/src/components/GestureRecognition.tsx`):

- ✅ Component structure in place
- ✅ Gesture types defined (wave, thumbsUp/Down, point, fist, openHand)
- ❌ Uses simulated positions (lines 100-105)
- ❌ No actual hand/finger tracking
- ❌ Simplified velocity-based gesture detection
- ✅ Visual feedback system (spheres + text)
- ✅ Integration hooks ready (`onGestureDetected` callback)

**VR Input System** (`xr-input-manager.ts`, `xr-input-system.ts`):

- ✅ Full controller tracking (grip/aim poses)
- ✅ Button/axis input handling
- ✅ Haptic feedback
- ⚠️ **No hand tracking support** - needs WebXR hand input module
- ✅ ECS integration ready

### 2. Available Libraries & APIs

#### A. **Native WebXR Hand Input** ✅ RECOMMENDED PRIMARY

- **Standard**: [W3C WebXR Hand Input Module Level 1](https://www.w3.org/TR/webxr-hand-input-1/)
- **Browser Support**: Chrome 94+, Meta Quest 2/3/Pro (native in Quest Browser)
- **Pros**: Native browser API, no dependencies, best performance on supported devices
- **Cons**: Limited to WebXR sessions, 21 hand keypoints per hand

**Usage Example**:

```typescript
const session = await navigator.xr.requestSession('immersive-vr', {
  optionalFeatures: ['hand-tracking', 'hand-tracking-baseline-2021']
});

const leftHand = session.inputSources.find((src) => src.handedness === 'left' && src.hands);
// Access leftHand.hands[0].jointPositions
```

#### B. **@tensorflow-models/hand-pose-detection** ✅ WEBCAM FALLBACK

- **Package**: `@tensorflow-models/hand-pose-detection` v2.0.1
- **Weekly Downloads**: 5.2K
- **Features**: MediaPipe-based, multi-hand support, 21 keypoints
- **Pros**: Works with webcam (AR mode), well-maintained by Google
- **Cons**: Larger bundle (~1-2MB), not real-time VR tracking

**Usage Example**:

```typescript
import * as handpose from '@tensorflow-models/hand-pose-detection';

const model = await handpose.load();
const predictions = await model.estimateHands(videoElement);
// predictions[0].landmarks (21 keypoints)
```

#### C. **@mediapipe/hands** ⚡ ALTERNATIVE WEBCAM

- **Package**: `@mediapipe/tasks-vision`
- **Features**: Lower latency than TF.js, WebAssembly-based
- **Pros**: Better performance than TF.js
- **Cons**: More complex setup, smaller ecosystem

#### D. **Handy-Work** 🆗 LEGACY OPTION

- **Package**: `handy-work` v3.1.13
- **Status**: Maintained by Ada Rose Cannon (now at Apple)
- **Features**: Web worker-based pose detection
- **Cons**: Less actively maintained than native WebXR

**Recommendation**: Use native WebXR Hand Input as primary, MediaPipe TF.js as webcam fallback for AR.

### 3. Gesture Recognition Approaches

#### Approach A: Rule-Based Detection ✅ (QUICK WIN)

- **Method**: Detect gestures from joint positions using geometric rules
- **Example Gestures**:
  - **Fist**: All fingertips < palm distance threshold
  - **Open Hand**: All fingertips > palm distance threshold
  - **Thumbs Up**: Thumb extended, fingers curled
  - **Point**: Index extended, other fingers curled
  - **Wave**: Sine wave pattern in Y-axis with X movement

**Pros**: Fast, no ML training, configurable
**Cons**: Less smooth, needs tuning

#### Approach B: ML-Based Classifier 🎯 (PRODUCTION)

- **Method**: Train neural network on hand pose sequences
- **Libraries**: TensorFlow.js, ONNX Runtime Web
- **Pros**: More accurate, handles edge cases better
- **Cons**: Requires training data, larger model size

**Recommendation**: Start with rule-based, add ML classifier later.

---

## Implementation Plan

### Phase 1: Native WebXR Hand Input Integration (4-6 hours)

#### Files to Create/Modify:

1. **`packages/clients/hub-client/src/xr/xr-hand-tracking.ts`** (new)
   - WebXR session hand tracking initialization
   - Controller state extension with hand data
   - Joint position management (21 joints per hand)

2. **`packages/clients/hub-client/src/ecs/components/HandTrackingComponent.ts`** (new)
   - Hand model data component
   - Joint positions, palm position, gesture poses
   - Hand tracking state management

3. **`packages/clients/hub-client/src/xr/hand-tracking-system.ts`** (new)
   - ECS system to update hand tracking
   - Process joint positions, calculate hand model
   - Sync with XRInputManager

#### Key Changes to Existing Files:

- **`xr-input-manager.ts`**: Add hand tracking support

  ```typescript
  async initialize(
    session: XRSession,
    referenceSpace: XRReferenceSpace,
    enableHandTracking?: boolean
  ): Promise<void>
  ```

- **`GestureRecognition.tsx`**: Update to use real hand data
  - Replace simulated positions (line 101) with XR hand input
  - Use actual finger joint positions for detection

---

### Phase 2: Gesture Detection Engine (6-8 hours)

#### Files to Create:

1. **`packages/clients/hub-client/src/gesture/gesture-detector.ts`** (new)
   - Core gesture recognition logic
   - Rule-based detection for standard gestures
   - Configurable thresholds

2. **`packages/clients/hub-client/src/gesture/gesture-types.ts`** (new)
   - Extended gesture type definitions
   - Gesture metadata (name, icon, description)
   - Gesture pose definitions

3. **`packages/clients/hub-client/src/gesture/hand-model.ts`** (new)
   - Hand skeletal model
   - Joint relationships (fingertip to palm, etc.)
   - Geometric operations (distance, angle, etc.)

#### Implemented Gestures:

| Gesture         | Detection Logic                          | Confidence |
| --------------- | ---------------------------------------- | ---------- |
| **Fist**        | All fingertips < 0.2 from palm           | High       |
| **Open Hand**   | All fingertips > 0.5 from palm           | High       |
| **Thumbs Up**   | Thumb tip > palm, other fingers curled   | Medium     |
| **Thumbs Down** | Thumb tip < palm, other fingers curled   | Medium     |
| **Point**       | Index extended, middle/ring/pinky curled | Medium     |
| **Wave**        | Y-axis sine wave + X movement            | Medium     |
| **Pinch**       | Thumb tip close to index tip             | High       |
| **OK**          | Thumb + index circle, other extended     | Medium     |
| **Rock**        | Fist with thumb wrapped                  | High       |
| **Peace**       | Index + middle extended, others curled   | High       |

---

### Phase 3: Gesture Integration & UX (4-6 hours)

#### Files to Create:

1. **`packages/clients/hub-client/src/components/GestureFeedback.tsx`** (new)
   - VR visual feedback for gestures
   - 3D markers, particles, audio cues
   - Configurable feedback intensity

2. **`packages/clients/hub-client/src/components/GesturePanel.tsx`** (new)
   - In-VR UI panel showing active gestures
   - Gesture tutorial overlay
   - Enable/disable gesture recognition

3. **`packages/clients/hub-client/src/gesture/gesture-actions.ts`** (new)
   - Gesture-triggered actions system
   - Configurable gesture-to-action mapping
   - Examples:
     - Wave → Send emoji
     - Pinch → Interact with object
     - Thumbs Up → Confirm selection
     - Point → Aim/indicate

---

### Phase 4: Advanced Features (4-6 hours)

#### Files to Create:

1. **`packages/clients/hub-client/src/gesture/gesture-sequence.ts`** (new)
   - Multi-gesture sequences (e.g., "fist → point")
   - Gesture timing and combo detection

2. **`packages/clients/hub-client/src/gesture/gesture-history.ts`** (new)
   - History of detected gestures
   - Gesture analytics (frequency, accuracy)
   - Machine learning training data collection

3. **Optional: ML Classifier**
   - TensorFlow.js model for gesture classification
   - Training data from GestureHistory
   - Offline model inference

---

## Estimated Effort

| Phase       | Tasks                             | Hours | Priority    |
| ----------- | --------------------------------- | ----- | ----------- |
| **Phase 1** | WebXR hand input integration      | 4-6   | 🔴 CRITICAL |
| **Phase 2** | Gesture detection engine          | 6-8   | 🔴 CRITICAL |
| **Phase 3** | UX & feedback integration         | 4-6   | 🟡 HIGH     |
| **Phase 4** | Advanced features (sequences, ML) | 4-6   | 🟢 OPTIONAL |

**Total Core**: **14-20 hours** (can be completed in 2-3 days)
**Total with ML**: **18-26 hours** (add 4-6 hours if ML desired)

---

## Technical Dependencies

### Required NPM Packages:

**For WebXR Hand Input (native, no install needed)**:

```json
// Built into browsers with WebXR support
// Already in package.json dependencies
"three": "^0.160.0"
```

**For Webcam Hand Pose (optional, for AR fallback)**:

```bash
npm install @tensorflow-models/hand-pose-detection
```

**For potential ML classifier**:

```bash
npm install @tensorflow/tfjs-webgl
npm install @tensorflow/tfjs
```

---

## Integration Points

### Existing System Integration:

1. **XR Input Manager** → Hand tracking data stream
   - Session initialization
   - Input sources change events

2. **ECS Architecture** → Hand tracking as system
   - Component: `HandTrackingComponent`
   - System: `HandTrackingSystem` → updates hand pose

3. **GestureRecognition.tsx** → Use real data
   - Remove simulated positions
   - Use `HandTrackingComponent.hand.joints`
   - Trigger `onGestureDetected` callbacks

4. **VRInteractableComponent** → Gesture actions
   - Pinch → grab (like grip button)
   - Point → raycast (like trigger)
   - Thumbs Up → confirm/accept

---

## API Design

### HandTrackingComponent:

```typescript
export interface HandJoint {
  position: THREE.Vector3; // 3D world position
  rotation: THREE.Quaternion; // Joint orientation
  confidence: number; // 0.0 - 1.0
}

export interface HandData {
  handedness: 'left' | 'right';
  joints: HandJoint[]; // 21 joints per hand
  palmPosition: THREE.Vector3;
  poseConfidence: number;
}

export class HandTrackingComponent {
  leftHand: HandData | null = null;
  rightHand: HandData | null = null;
}
```

### GestureDetector:

```typescript
export declare class GestureDetector {
  detectGesture(handData: HandData): DetectedGesture | null;
  detectHandPose(handData: HandData): HandPose;
}

export interface DetectedGesture {
  type: GestureType;
  confidence: number;
  duration: number; // ms held
  timestamp: number;
}
```

### GestureRecognition React Component:

```typescript
export interface GestureRecognitionProps {
  onGestureDetected?: (
    gesture: DetectedGesture,
    controllerId: 'left' | 'right',
    handData?: HandData
  ) => void;
  enabled?: boolean;
  showFeedback?: boolean;
}
```

---

## Testing Strategy

### Unit Tests:

1. **GestureDetector tests** (jest/vitest)
   - Test each gesture with sample joint positions
   - Edge cases (low confidence, jitter)
   - Threshold tuning validation

2. **HandModel tests**
   - Joint distance calculations
   - Angle calculations (fingers curled vs extended)

### E2E Tests:

1. **Playwright VR tests**
   - Simulated hand tracking input
   - Gesture detection in VR session
   - Visual feedback rendering

### Manual Testing:

1. **Meta Quest 2/3 browser testing**
   - Native hand tracking support
   - Gesture accuracy in real usage
   - Performance impact (frame rate)

---

## Success Criteria

✅ **Phase 1 Complete**:

- [ ] WebXR hand tracking works in Meta Quest Browser
- [ ] 21 joint positions tracked per hand
- [ ] No performance regression on VR headset

✅ **Phase 2 Complete**:

- [ ] All 10+ gestures detected with >80% accuracy
- [ ] Gesture confidence scores provided
- [ ] Gesture duration tracking

✅ **Phase 3 Complete**:

- [ ] Visual feedback renders in VR
- [ ] Gesture panel shows active gestures
- [ ] Gesture-triggered actions work (pinch grab, etc.)

✅ **Overall Success**:

- [ ] System integrates with existing XR input
- [ ] Works alongside controller-based interaction
- [ ] Documentation complete

---

## Risks & Mitigations

### Risk 1: Browser Support

- **Issue**: WebXR hand input not supported in all browsers
- **Mitigation**: Fallback to MediaPipe webcam tracking for AR mode

### Risk 2: Performance

- **Issue**: Hand tracking on Quest 2 may impact frame rate
- **Mitigation**: Use low-resolution tracking, optimize detection algorithm

### Risk 3: Gesture Accuracy

- **Issue**: Rule-based detection may have false positives
- **Mitigation**:
  - Confidence thresholds
  - Minimum gesture duration
  - Optional ML classifier later

### Risk 4: User Adoption

- **Issue**: Users may not know available gestures
- **Mitigation**:
  - In-VR gesture tutorial
  - Visual feedback for all detected gestures
  - Gesture cheat sheet UI

---

## Conclusion

**Approach**: Start with native WebXR Hand Input integration + rule-based detection engine

**Timeline**: 2-3 days for core features (Phase 1-3), 4-5 days with ML classifier

**Priority**: Implement Phase 1-2 first (hands + detection), add Phase 3 (UX) for refinement

**Recommendation**: The existing `GestureRecognition.tsx` component provides excellent scaffolding. The primary work is:

1. Replace simulated positions with real WebXR hand tracking
2. Implement robust gesture detection algorithm
3. Integrate with existing VRInteractableComponent for gesture actions

This plan balances speed-to-market with production quality, using proven libraries (W3C standard WebXR APIs) rather than building custom ML models from scratch.
