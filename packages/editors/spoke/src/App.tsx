import { invoke } from '@tauri-apps/api/tauri';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

interface Entity {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

// Scene component that exposes the THREE.Scene via ref
interface SceneContentProps {
  entities: Entity[];
  selectedEntity: string | null;
}

export interface SceneRef {
  getScene: () => THREE.Scene | null;
}

const SceneContent = forwardRef<SceneRef, SceneContentProps>(
  ({ entities, selectedEntity }, ref) => {
    const { scene } = useThree();

    useImperativeHandle(ref, () => ({
      getScene: () => scene
    }));

    return (
      <>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#444"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#666"
          fadeDistance={30}
          infiniteGrid
        />
        {entities.map((entity) => (
          <mesh
            key={entity.id}
            position={[entity.position.x, entity.position.y, entity.position.z]}
            rotation={[entity.rotation.x, entity.rotation.y, entity.rotation.z]}
            scale={[entity.scale.x, entity.scale.y, entity.scale.z]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={selectedEntity === entity.id ? '#3b82f6' : '#888'} />
          </mesh>
        ))}
        <OrbitControls makeDefault />
      </>
    );
  }
);

SceneContent.displayName = 'SceneContent';

export default function App() {
  const [entities] = useState<Entity[]>([
    {
      id: '1',
      name: 'Cube',
      position: { x: 0, y: 0.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    }
  ]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const sceneRef = useRef<SceneRef>(null);

  const handleSaveScene = async () => {
    try {
      await invoke('save_scene', { sceneData: entities });
      console.log('Scene saved!');
    } catch (error) {
      console.error('Failed to save scene:', error);
    }
  };

  const downloadBlob = useCallback((data: ArrayBuffer, filename: string) => {
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleExportScene = useCallback(async () => {
    const scene = sceneRef.current?.getScene();
    if (!scene) {
      console.error('No scene available for export');
      return;
    }

    setExporting(true);
    setExportProgress(10);

    try {
      const exporter = new GLTFExporter();
      setExportProgress(30);

      const data = await exporter.parseAsync(scene, {
        binary: true,
        onlyVisible: true
      });
      setExportProgress(80);

      if (data instanceof ArrayBuffer) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        downloadBlob(data, `scene-${timestamp}.glb`);
        setExportProgress(100);
        console.log('Scene exported successfully!');
      } else {
        console.error('Expected binary data but got JSON');
      }
    } catch (error) {
      console.error('Failed to export scene:', error);
    } finally {
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 500);
    }
  }, [downloadBlob]);

  const selectedEntityData = entities.find((e) => e.id === selectedEntity);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Left Panel - Hierarchy */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Hierarchy</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {entities.map((entity) => (
            <div
              key={entity.id}
              className={`p-2 rounded cursor-pointer hover:bg-gray-700 ${
                selectedEntity === entity.id ? 'bg-blue-600' : ''
              }`}
              onClick={() => setSelectedEntity(entity.id)}
            >
              {entity.name}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-700">
          <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded transition">
            + Add Entity
          </button>
        </div>
      </div>

      {/* Center - 3D Viewport */}
      <div className="flex-1 flex flex-col">
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between">
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition">
              Translate
            </button>
            <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition">
              Rotate
            </button>
            <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition">
              Scale
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveScene}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded transition"
            >
              Save
            </button>
            <button
              onClick={handleExportScene}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition"
            >
              Export
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <Canvas camera={{ position: [5, 5, 5], fov: 50 }} className="bg-gray-900">
            <SceneContent ref={sceneRef} entities={entities} selectedEntity={selectedEntity} />
          </Canvas>
          {exporting && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-4">
                <div className="text-white text-lg font-medium">Exporting...</div>
                <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-200"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <div className="text-gray-400 text-sm">{exportProgress}%</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Inspector */}
      <div className="w-72 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Inspector</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {selectedEntityData ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={selectedEntityData.name}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Position</label>
                <div className="grid grid-cols-3 gap-2">
                  {['x', 'y', 'z'].map((axis) => (
                    <div key={axis}>
                      <label className="block text-xs text-gray-500 mb-1">
                        {axis.toUpperCase()}
                      </label>
                      <input
                        type="number"
                        value={selectedEntityData.position[axis as 'x' | 'y' | 'z']}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Rotation</label>
                <div className="grid grid-cols-3 gap-2">
                  {['x', 'y', 'z'].map((axis) => (
                    <div key={axis}>
                      <label className="block text-xs text-gray-500 mb-1">
                        {axis.toUpperCase()}
                      </label>
                      <input
                        type="number"
                        value={selectedEntityData.rotation[axis as 'x' | 'y' | 'z']}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Scale</label>
                <div className="grid grid-cols-3 gap-2">
                  {['x', 'y', 'z'].map((axis) => (
                    <div key={axis}>
                      <label className="block text-xs text-gray-500 mb-1">
                        {axis.toUpperCase()}
                      </label>
                      <input
                        type="number"
                        value={selectedEntityData.scale[axis as 'x' | 'y' | 'z']}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Select an entity to inspect</p>
          )}
        </div>
      </div>

      {/* Bottom Panel - Assets */}
      <div className="absolute bottom-0 left-64 right-72 h-48 bg-gray-800 border-t border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Assets</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {['Cube', 'Sphere', 'Cylinder', 'Plane'].map((shape) => (
              <div
                key={shape}
                className="bg-gray-700 rounded p-4 text-center cursor-pointer hover:bg-gray-600 transition"
              >
                <div className="text-4xl mb-2">📦</div>
                <div className="text-sm">{shape}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
