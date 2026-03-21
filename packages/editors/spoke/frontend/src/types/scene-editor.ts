/**
 * Spoke Scene Editor Types
 */

import type { SceneObject } from './SceneObject';

export interface SceneConfig {
  name?: string;
  description?: string;
  autoSave?: boolean;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  autoSave: boolean;
  objects: SceneObject[];
  grid?: { cells: number; size: [number, number] };
}

export interface SceneObjectData {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  name?: string;
}

export interface SceneEditorRef {
  loadScene(sceneId: string): Promise<Scene | null>;
  saveScene(scene: Scene): Promise<void>;
  deleteScene(sceneId: string): Promise<void>;
  duplicateScene(sceneId: string): Promise<Scene | null>;
}
