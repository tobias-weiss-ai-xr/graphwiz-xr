import { useState } from 'react';

export type SceneType =
  | 'default'
  | 'interactive'
  | 'media'
  | 'grab'
  | 'drawing'
  | 'portal'
  | 'gestures';

export interface SceneSelectorProps {
  currentScene: SceneType;
  onSceneChange: (scene: SceneType) => void;
}

const SCENES: { id: SceneType; name: string; icon: string; description: string }[] = [
  {
    id: 'default',
    name: 'Default',
    icon: '🏠',
    description: 'Basic avatar movement and chat'
  },
  {
    id: 'interactive',
    name: 'Interactive',
    icon: '🎮',
    description: 'Multiplayer interactive objects'
  },
  {
    id: 'media',
    name: 'Media Demo',
    icon: '🎬',
    description: 'Video and audio playback'
  },
  {
    id: 'grab',
    name: 'Grab Demo',
    icon: '🤚',
    description: 'Object grabbing system'
  },
  {
    id: 'drawing',
    name: 'Drawing',
    icon: '🎨',
    description: '3D drawing canvas tools'
  },
  {
    id: 'portal',
    name: 'Portal',
    icon: '🌀',
    description: 'Room teleportation system'
  },
  {
    id: 'gestures',
    name: 'Gestures',
    icon: '👋',
    description: 'VR controller gesture recognition'
  }
];

export function SceneSelector({ currentScene, onSceneChange }: SceneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentSceneInfo = SCENES.find((s) => s.id === currentScene) || SCENES[0];

  return (
    <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 100 }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 8,
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 14,
          transition: 'all 0.2s'
        }}
      >
        <span style={{ fontSize: 20 }}>{currentSceneInfo.icon}</span>
        <span>{currentSceneInfo.name}</span>
        <span style={{ fontSize: 12, opacity: 0.6 }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            marginTop: 8,
            background: 'rgba(0, 0, 0, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            padding: 8,
            minWidth: 220,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: 8,
              padding: '0 8px'
            }}
          >
            Select Scene
          </div>
          {SCENES.map((scene) => (
            <button
              key={scene.id}
              onClick={() => {
                onSceneChange(scene.id);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: scene.id === currentScene ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                border:
                  scene.id === currentScene
                    ? '1px solid rgba(99, 102, 241, 0.5)'
                    : '1px solid transparent',
                borderRadius: 6,
                color: 'white',
                textAlign: 'left',
                cursor: 'pointer',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 13
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{scene.icon}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: scene.id === currentScene ? 'bold' : 'normal'
                  }}
                >
                  {scene.name}
                </div>
                <div style={{ fontSize: 10, opacity: 0.6 }}>{scene.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
