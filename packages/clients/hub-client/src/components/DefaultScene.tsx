import { NetworkedAvatar } from './NetworkedAvatar';
import { Text } from '@react-three/drei';
import { useState, useEffect } from 'react';

interface DefaultSceneProps {
  clientId: string;
  wsClient: any;
}

/**
 * DefaultScene - Main multiplayer scene with avatars
 *
 * Shows:
 * - Network-synchronized player avatars
 * - Local player avatar
 * - Player names above avatars
 * - Connection status display
 */
export function DefaultScene({ clientId, wsClient }: DefaultSceneProps) {
  const [localEntities, setLocalEntities] = useState<Map<string, any>>(new Map());

  // Subscribe to presence updates for remote players
  useEffect(() => {
    if (!wsClient) return;

    const unsubscribePresence = wsClient.on('PRESENCE_UPDATE', (message: any) => {
      if (message.payload) {
        const { clientId: remoteClientId, data } = message.payload;

        // Skip if it's our own client
        if (remoteClientId === clientId) return;

        // Check if this presence has position data
        if (data?.position) {
          setLocalEntities((prev) => {
            const updated = new Map(prev);
            updated.set(remoteClientId, {
              id: remoteClientId,
              position: data.position,
              rotation: data.rotation || { x: 0, y: 0, z: 0 },
              displayName: data.displayName || `Player-${remoteClientId.substring(0, 8)}`,
              avatarConfig: data.avatarConfig || {},
              isPlayer: true
            });
            return updated;
          });
        }
      }
    });

    return () => unsubscribePresence();
  }, [wsClient, clientId]);

  // Add local player entity
  useEffect(() => {
    const localPlayer = {
      id: clientId,
      position: [0, 1, 0],
      rotation: { x: 0, y: 0, z: 0 },
      scale: [1, 1, 1],
      displayName: 'You',
      isPlayer: true,
      avatarConfig: {}
    };

    setLocalEntities(new Map([[clientId, localPlayer]]));
  }, [clientId]);

  return (
    <group>
      {/* Local player avatar */}
      {Array.from(localEntities.entries()).map(([id, entity]) => {
        if (entity.isPlayer) {
          return (
            <NetworkedAvatar
              key={id}
              position={
                Array.isArray(entity.position)
                  ? entity.position
                  : [entity.position.x, entity.position.y, entity.position.z]
              }
              rotation={[entity.rotation.x, entity.rotation.y, entity.rotation.z]}
              displayName={entity.displayName}
              avatarConfig={
                entity.avatarConfig || {
                  body_type: 'human',
                  primary_color: '#4CAF50',
                  secondary_color: '#81C784',
                  height: 1.7
                }
              }
            />
          );
        }
        return null;
      })}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />

      {/* Instructions text */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        Welcome to GraphWiz-XR!
        {'\n\n'}
        Default Scene
        {'\n'}
        Use the Scene Selector to switch to interactive demos.
      </Text>
    </group>
  );
}
