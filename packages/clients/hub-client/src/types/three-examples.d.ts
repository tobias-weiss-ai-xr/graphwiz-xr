/**
 * Type definitions for three/examples modules
 * These modules are dynamically imported and don't have official @types packages
 */

/// <reference types="three" />

import { LoadingManager, Loader, Group, AnimationClip, Vector3, EventDispatcher } from 'three';

// ============================================================================
// GLTFLoader
// ============================================================================

/**
 * GLTF file structure from glTF/GLB loader
 */
export interface GLTF {
  scene: Group;
  scenes: Group[];
  animations: AnimationClip[];
  camera: any;
  materials: any;
  nodes: any;
  textures: any;
  meshes: any;
  sparables: Record<string, string>;
}

/**
 * GLTFLoader loads glTF/GLB files
 */
export class GLTFLoader extends Loader {
  constructor(manager?: LoadingManager);
  load(
    url: string,
    onLoad: (gltf: GLTF) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (error: unknown) => void,
    options?: { path?: string; crossOrigin?: string }
  ): void;
  setPath(path: string): this;
  setManager(manager: LoadingManager): this;
  parse(
    data: ArrayBuffer | string,
    path: string,
    onLoad: (gltf: GLTF) => void,
    onError?: (error: unknown) => void
  ): void;
}

// ============================================================================
// OrbitControls
// ============================================================================

type OrbitControlsEvents = {
  change: { target: OrbitControls };
  start: { target: OrbitControls };
  end: { target: OrbitControls };
};

export class OrbitControls extends EventDispatcher<OrbitControlsEvents> {
  constructor(object: any, domElement?: HTMLElement);

  enableDamping: boolean;
  dampingFactor: number;
  rotateSpeed: number;
  zoomSpeed: number;
  panSpeed: number;
  zoomDist: number;
  screenSpacePanning: boolean;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  enablePan: boolean;
  enableKeys: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
  enableUserControl: boolean;

  enable(): void;
  disable(): void;
  connect(): void;
  disconnect(): void;
  update(): boolean;
  saveState(): void;
  reset(): void;
  getObject(): any;
  getTarget(): Vector3;
  setTarget(target: { x: number; y: number; z: number }): void;
  setFocus(target: { x: number; y: number; z: number }): void;
  panLeft(distance: number): void;
  panUp(distance: number): void;
  rotateLeft(angle: number): void;
  rotateUp(angle: number): void;
  zoomIn(delta: number): void;
  zoomOut(delta: number): void;
  dispose(): void;
}

// ============================================================================
// TrackballControls
// ============================================================================

type TrackballControlsEvents = {
  change: { target: TrackballControls };
  start: { target: TrackballControls };
  end: { target: TrackballControls };
};

export class TrackballControls extends EventDispatcher<TrackballControlsEvents> {
  constructor(object: any, domElement?: HTMLElement);

  enabled: boolean;
  noRotate: boolean;
  noZoom: boolean;
  noPan: boolean;
  noRoll: boolean;
  staticMoving: boolean;
  zoomDamping: number;
  panDamping: number;
  rotDamping: number;
  rotSpeed: number;
  zoomSpeed: number;
  panSpeed: number;

  getObject(): any;
  getTarget(): Vector3;
  setTarget(target: { x: number; y: number; z: number }): void;
  enable(): void;
  disable(): void;
  connect(): void;
  disconnect(): void;
  update(): boolean;
  saveState(): void;
  reset(): void;
  dispose(): void;
}

// ============================================================================
// TransformControls
// ============================================================================

type TransformControlsEvents = {
  objectChange: { target: TransformControls };
  dragstart: { target: TransformControls };
  dragend: { target: TransformControls };
  keydown: { target: TransformControls };
  keyup: { target: TransformControls };
};

export class TransformControls extends EventDispatcher<TransformControlsEvents> {
  constructor(object: any, domElement?: HTMLElement);

  mode: string;
  dragging: boolean;
  enabled: boolean;
  space: string;
  size: number;
  translationSnap: number | null;
  rotationSnap: number | null;
  scaleSnap: number | null;

  attach(object: any): void;
  detach(): void;
  setMode(mode: string): void;
  setSpace(space: string): void;
  setTranslationSnap(snap: number): void;
  setRotationSnap(snap: number): void;
  setScaleSnap(snap: number): void;
  enable(): void;
  disable(): void;
  connect(): void;
  disconnect(): void;
  dispose(): void;
}

// ============================================================================
// Dynamic import helpers
// ============================================================================

// Helper to cast dynamic import results
export function castImport<T>(importResult: { default: T; [key: string]: any }): T {
  return importResult.default;
}
