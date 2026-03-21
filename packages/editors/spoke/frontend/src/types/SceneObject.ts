export interface SceneObject {
  id: string;
  name: string;
  type: 'box' | 'sphere' | 'plane';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface SceneData {
  objects: SceneObject[];
  name: string;
  createdAt: number;
  updatedAt: number;
}

export const generateId = (): string => {
  return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createDefaultScene = (): SceneData => {
  return {
    objects: [
      {
        id: generateId(),
        name: 'Floor',
        type: 'plane',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        scale: { x: 10, y: 10, z: 10 }
      }
    ],
    name: 'Untitled Scene',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
};
