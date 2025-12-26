/* eslint-disable react/no-unknown-property */
import type { EntitySpawn } from '@graphwiz/protocol';
import { OrbitControls, Grid, PerspectiveCamera, Text } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState, useCallback } from 'react';

import { useWebTransport, usePresence, useEntities, useChat } from './networking/useWebTransport';

interface Entity {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  displayName?: string;
  isPlayer?: boolean;
}

function PlayerAvatar({ position, rotation, displayName }: { position: [number, number, number]; rotation: [number, number, number]; displayName: string }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FFCC80" />
      </mesh>
      {/* Name tag */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {displayName}
      </Text>
    </group>
  );
}

function App() {
  const { connected, connecting, error, myClientId, client } = useWebTransport({
    serverUrl: import.meta.env.VITE_SERVER_URL || 'https://localhost:8443',
    roomId: import.meta.env.VITE_ROOM_ID || 'lobby',
    displayName: `Player-${Math.floor(Math.random() * 1000)}`,
    autoConnect: true,
  });

  const presenceEvents = usePresence(client);
  const { entities, spawnEntity } = useEntities(client);
  const { messages, sendMessage } = useChat(client);

  const [localEntities, setLocalEntities] = useState<Map<string, Entity>>(new Map());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatVisible, setChatVisible] = useState(true);

  // Combine local entities and network entities
  const allEntities: Entity[] = [
    ...Array.from(localEntities.values()),
    ...Array.from(entities.values()).map((e: EntitySpawn) => {
      const pos = (e.components.position as { x?: number; y?: number; z?: number } | undefined);
      return {
        id: e.entityId,
        position: [pos?.x ?? 0, pos?.y ?? 1, pos?.z ?? 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
      };
    }),
    // Add other players from presence
    ...presenceEvents
      .filter((p) => p.data.position && p.clientId !== myClientId)
      .map((p) => ({
        id: p.clientId,
        position: [p.data.position!.x, p.data.position!.y, p.data.position!.z] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        displayName: p.data.displayName || 'Unknown',
        isPlayer: true,
      })),
  ];

  const addEntity = useCallback(() => {
    const id = `entity-${Date.now()}`;
    const newEntity: Entity = {
      id,
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    setLocalEntities((prev) => new Map(prev).set(id, newEntity));
    // Also spawn on network
    spawnEntity?.('cube', { position: { x: 0, y: 1, z: 0 } });
  }, [spawnEntity]);

  const handleSendChat = useCallback(() => {
    if (chatInput.trim()) {
      sendMessage(chatInput.trim());
      setChatInput('');
    }
  }, [chatInput, sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendChat();
    }
  }, [handleSendChat]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* UI Overlay - Connection Status */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.7)',
        padding: 16,
        borderRadius: 8,
        color: 'white',
        fontFamily: 'sans-serif',
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 18 }}>
          GraphWiz-XR Hub Client
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: connecting ? '#FFC107' : connected ? '#4CAF50' : '#f44336',
          }} />
          <span style={{ fontSize: 12 }}>
            {connecting ? 'Connecting...' : connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {myClientId && (
          <p style={{ margin: '0 0 8px 0', fontSize: 11, opacity: 0.8 }}>
            Client ID: {myClientId.slice(0, 8)}...
          </p>
        )}
        {error && (
          <p style={{ margin: 0, fontSize: 11, color: '#f44336' }}>
            {error.message}
          </p>
        )}
        <p style={{ margin: '8px 0 0 0', fontSize: 12, opacity: 0.8 }}>
          Entities: {allEntities.length} | Players: {presenceEvents.length}
        </p>
        <button
          onClick={addEntity}
          style={{
            marginTop: 12,
            padding: '8px 16px',
            background: '#4CAF50',
            border: 'none',
            borderRadius: 4,
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Add Entity
        </button>
      </div>

      {/* Chat Overlay */}
      {chatVisible && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 100,
          width: 320,
          maxHeight: 300,
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>Chat</span>
            <button
              onClick={() => setChatVisible(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {messages.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center' }}>No messages yet</p>
            ) : (
              messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                    {msg.fromClientId === myClientId ? 'You' : msg.fromClientId.slice(0, 8)}
                  </span>
                  <span style={{ color: 'white', fontSize: 13 }}>{msg.message}</span>
                </div>
              ))
            )}
          </div>
          <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: 'none',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: 13,
              }}
            />
          </div>
        </div>
      )}

      {!chatVisible && (
        <button
          onClick={() => setChatVisible(true)}
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 100,
            padding: '12px 16px',
            background: 'rgba(0, 0, 0, 0.7)',
            border: 'none',
            borderRadius: 8,
            color: 'white',
            cursor: 'pointer',
          }}
        >
          💬 Chat ({messages.length})
        </button>
      )}

      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={60} />
        <OrbitControls
          makeDefault
          minDistance={2}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {/* Ground Grid */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />

        {/* Ground Plane */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

        {/* Entities */}
        {allEntities.map((entity) => (
          entity.isPlayer ? (
            <PlayerAvatar
              key={entity.id}
              position={entity.position}
              rotation={entity.rotation}
              displayName={entity.displayName || 'Unknown'}
            />
          ) : (
            <mesh
              key={entity.id}
              position={entity.position}
              rotation={entity.rotation}
              scale={entity.scale}
              castShadow
              receiveShadow
              onClick={() => setSelectedId(entity.id)}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color={selectedId === entity.id ? '#4CAF50' : '#2196F3'}
                roughness={0.5}
                metalness={0.5}
              />
            </mesh>
          )
        ))}
      </Canvas>
    </div>
  );
}

export default App;
