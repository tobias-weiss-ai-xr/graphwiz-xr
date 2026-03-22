import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Grid,
  Environment,
  TransformControls,
  Box,
  Sphere
} from '@react-three/drei';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import * as THREE from 'three';

interface SceneObject {
  id: string;
  type: 'box' | 'sphere';
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
}

export default function App() {
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sceneName, setSceneName] = useState<string>('Untitled Scene');
  const [isTransforming, setIsTransforming] = useState(false);

  const transformControlsRef = useRef<any>(null);

  // Create initial sample objects
  useEffect(() => {
    const initialObjects: SceneObject[] = [
      {
        id: 'box-1',
        type: 'box',
        name: 'Ground',
        position: [0, -1, 0],
        rotation: [0, 0, 0],
        scale: [10, 1, 10],
        color: '#808080'
      },
      {
        id: 'box-2',
        type: 'box',
        name: 'Cube',
        position: [0, 0.5, 0],
        rotation: [0, 0.0, 0],
        scale: [1, 1, 1],
        color: '#4A90E2'
      },
      {
        id: 'sphere-1',
        type: 'sphere',
        name: 'Sphere',
        position: [2, 0.5, 0],
        rotation: [0, 0, 0],
        scale: [0.5, 0.5, 0.5],
        color: '#50C878'
      }
    ];
    setObjects(initialObjects);
  }, []);

  const handleObjectSelect = (id: string) => {
    setSelectedId(id);
    setIsTransforming(true);
  };

  const handleAddBox = () => {
    const newId = `box-${Date.now()}`;
    setObjectPosition(newId, [0, 1, 0]);
    setSceneName(`box-${Date.now()}`);
  };

  const setObjectPosition = (object: { id: string }, pos: [number, number, number]) => {
    if (objects.find((obj) => obj.id === object.id)) {
      var newObject: SceneObject = {
        id: object.id,
        type: 'box',
        name: object.id,
        position: pos,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        color: randomColor()
      };
      setObjects([...objects, newObject]);
    } else {
      setObjects([...objects, object]);
    }
  };

  const randomColor = () => {
    return `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`;
  };

  const handleExportScene = async () => {
    try {
      const sceneData = JSON.stringify({ name: sceneName, objects }, null, 2);
      await invoke('save_scene', { sceneData });
      alert('Scene saved successfully!');
    } catch (error) {
      console.error('Failed to save scene:', error);
      alert('Failed to save scene');
    }
  };

  const importScene = async () => {
    try {
      const sceneData = await invoke<string>('load_scene');
      const parsed = JSON.parse(sceneData);
      setSceneName(parsed.name);
      setObjects(parsed.objects);
      alert('Scene loaded successfully!');
    } catch (error) {
      console.error('Failed to load scene:', error);
      alert('Failed to load scene');
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="section">
          <h2>Scene Editor</h2>
          <input
            type="text"
            value={sceneName}
            onChange={(e) => setSceneName(e.target.value)}
            placeholder="Scene Name"
          />
        </div>

        <div className="section">
          <h3>Objects ({objects.length})</h3>
          <ul>
            {objects.map((obj) => (
              <li
                key={obj.id}
                className={selectedId === obj.id ? 'selected' : ''}
                onClick={() => handleObjectSelect(obj.id)}
              >
                {obj.name}
                <span className="type">({obj.type})</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="section tools">
          <h3>Tools</h3>
          <button onClick={handleAddBox}>+ Box</button>
          <button onClick={() => {}}> + Sphere </button>
          <button onClick={() => {}}>+ Light</button>
          <button onClick={() => {}}>+ Camera</button>
        </div>

        <div className="section actions">
          <h3>Actions</h3>
          <button className="primary" onClick={handleExportScene}>
            Save Scene
          </button>
          <button onClick={importScene}>Load Scene</button>
          <button onClick={() => alert('Feature coming soon: Export to GLTF')}>Export GLTF</button>
        </div>

        {selectedId && (
          <div className="section">
            <h3>Properties</h3>
            {(() => {
              const obj = objects.find((o) => o.id === selectedId);
              if (!obj) return null;
              return (
                <>
                  <div className="property">
                    <label>Name:</label>
                    <input
                      type="text"
                      value={obj.name}
                      onChange={(e) => {
                        const updated = objects.map((o) =>
                          o.id === selectedId ? { ...o, name: e.target.value } : o
                        );
                        setObjects(updated);
                      }}
                    />
                  </div>
                  <div className="property">
                    <label>Color:</label>
                    <input
                      type="color"
                      value={obj.color}
                      onChange={(e) => {
                        const updated = objects.map((o) =>
                          o.id === selectedId ? { ...o, color: e.target.value } : o
                        );
                        setObjects(updated);
                      }}
                    />
                  </div>
                  <div className="property">
                    <label>Position:</label>
                    <span>
                      [{obj.position[0]}, {obj.position[1]}, {obj.position[2]}]
                    </span>
                  </div>
                  <div className="property">
                    <label>Rotation:</label>
                    <span>
                      [{obj.rotation[0]}, {obj.rotation[1]}, {obj.rotation[2]}]
                    </span>
                  </div>
                </>
              );
            })()}
            <button className="danger" onClick={() => {}}>
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="viewport">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 75 }}
          shadows
          onClick={(e) => {
            e.stopPropagation();
            setSelectedId(null);
          }}
        >
          <color attach="background" args={['#1a1a2e']} />
          <grid args={[20, 20]} cellColor="#444" sectionColor="#666" />

          <OrbitControls makeDefault />
          <TransformControls
            ref={transformControlsRef}
            enabled={selectedId !== null && !isTransforming}
            object={(objects.find((o) => o.id === selectedId) as any) || null}
          />
          <Environment preset="apartment" />

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[0, 5, 0]} intensity={0.5} />

          {/* Scene Objects */}
          {objects.map((obj) => {
            if (obj.type === 'box') {
              return (
                <Box
                  key={obj.id}
                  {...obj}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleObjectSelect(obj.id);
                  }}
                  castShadow
                  receiveShadow
                />
              );
            } else if (obj.type === 'sphere') {
              return (
                <Sphere
                  key={obj.id}
                  {...obj}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleObjectSelect(obj.id);
                  }}
                  castShadow
                  receiveShadow
                  segments={16}
                />
              );
            }
            return null;
          })}
        </Canvas>

        <div className="info">
          <p>Selected: {selectedId || 'None'}</p>
          <p>Objects: {objects.length}</p>
          <p className="hint">Click an object to select, use gizmos to transform</p>
        </div>
      </div>
    </div>
  );
}
