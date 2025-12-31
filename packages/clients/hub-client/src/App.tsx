/* eslint-disable react/no-unknown-property */
import type { EntitySpawn } from '@graphwiz/protocol';
import { OrbitControls, Grid, PerspectiveCamera, Text } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState, useCallback, useEffect } from 'react';

import { WebSocketClient } from './network/websocket-client';
import type { Message, PresenceEvent, MessageType } from '@graphwiz/protocol';
import { AssetBrowser, AssetUploader, storageApi, Asset } from './storage';

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
  // WebSocket connection state
  const [client, setClient] = useState<WebSocketClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myClientId, setMyClientId] = useState<string | null>(null);

  // Network data
  const [presenceEvents, setPresenceEvents] = useState<PresenceEvent[]>([]);
  const [messages, setMessages] = useState<Array<{ from: string; message: string }>>([]);

  const [localEntities, setLocalEntities] = useState<Map<string, Entity>>(new Map());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatVisible, setChatVisible] = useState(true);

  // Storage state
  const [storageVisible, setStorageVisible] = useState(false);
  const [storageTab, setStorageTab] = useState<'browse' | 'upload'>('browse');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    // Use environment variable or default to the presence service port (4000)
    const presenceUrl = import.meta.env.VITE_PRESENCE_WS_URL || 'ws://localhost:4000';
    console.log('[App] Connecting to presence service at:', presenceUrl);

    const wsClient = new WebSocketClient({
      presenceUrl,
      roomId: import.meta.env.VITE_ROOM_ID || 'lobby',
      userId: `user-${Math.floor(Math.random() * 10000)}`,
      displayName: `Player-${Math.floor(Math.random() * 1000)}`,
    });

    setClient(wsClient);
    setConnecting(true);

    // Connect to server
    wsClient.connect()
      .then(() => {
        setConnected(true);
        setConnecting(false);
        setMyClientId(wsClient['clientId']);
        console.log('[App] Connected to presence server');
      })
      .catch((err) => {
        console.error('[App] Failed to connect:', err);
        setError(err.message);
        setConnecting(false);
      });

    // Set up message handlers
    const unsubscribePresence = wsClient.on(3, (message: Message) => { // MessageType.PRESENCE_EVENT
      if (message.presenceEvent) {
        setPresenceEvents((prev) => {
          const filtered = prev.filter((e) => e.clientId !== message.presenceEvent!.clientId);
          if (message.presenceEvent!.eventType === 1) { // Leave
            return filtered;
          }
          return [...filtered, message.presenceEvent!];
        });
      }
    });

    const unsubscribeChat = wsClient.on(6, (message: Message) => { // MessageType.CHAT_MESSAGE
      if (message.chatMessage) {
        setMessages((prev) => [...prev, {
          from: message.chatMessage!.fromClientId,
          message: message.chatMessage!.message,
        }]);
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribePresence();
      unsubscribeChat();
      wsClient.disconnect();
    };
  }, []);

  // Combine local entities
  const allEntities: Entity[] = [
    ...Array.from(localEntities.values()),
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
  }, []);

  const handleSendChat = useCallback(() => {
    if (chatInput.trim() && client) {
      client.send({
        type: 6, // MessageType.CHAT_MESSAGE
        chatMessage: {
          fromClientId: myClientId || 'unknown',
          message: chatInput.trim(),
          messageType: 0,
        },
      });
      setMessages((prev) => [...prev, {
        from: 'You',
        message: chatInput.trim(),
      }]);
      setChatInput('');
    }
  }, [chatInput, client, myClientId]);

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
                    {msg.from}
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

      {/* Storage Button */}
      <button
        onClick={() => setStorageVisible(!storageVisible)}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 100,
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.7)',
          border: 'none',
          borderRadius: 8,
          color: 'white',
          cursor: 'pointer',
        }}
      >
        {storageVisible ? '× Close' : '📦 Assets'}
      </button>

      {/* Storage Panel */}
      {storageVisible && (
        <div style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 100,
          width: 400,
          maxHeight: 'calc(100vh - 32px)',
          background: 'rgba(0, 0, 0, 0.9)',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Asset Manager</span>
            <button
              onClick={() => setStorageVisible(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 20 }}
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setStorageTab('browse')}
              style={{
                flex: 1,
                padding: '12px',
                background: storageTab === 'browse' ? 'rgba(33, 150, 243, 0.3)' : 'transparent',
                border: 'none',
                borderBottom: storageTab === 'browse' ? '2px solid #2196F3' : 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: storageTab === 'browse' ? 'bold' : 'normal',
              }}
            >
              Browse
            </button>
            <button
              onClick={() => setStorageTab('upload')}
              style={{
                flex: 1,
                padding: '12px',
                background: storageTab === 'upload' ? 'rgba(33, 150, 243, 0.3)' : 'transparent',
                border: 'none',
                borderBottom: storageTab === 'upload' ? '2px solid #2196F3' : 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: storageTab === 'upload' ? 'bold' : 'normal',
              }}
            >
              Upload
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: 'white' }}>
            {storageTab === 'browse' ? (
              <AssetBrowser
                onAssetSelect={setSelectedAsset}
                selectedAssetId={selectedAsset?.asset_id}
              />
            ) : (
              <AssetUploader
                onUploadComplete={(response) => {
                  alert(`Asset uploaded successfully!\nAsset ID: ${response.asset_id}`);
                  setStorageTab('browse');
                }}
              />
            )}
          </div>
        </div>
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
