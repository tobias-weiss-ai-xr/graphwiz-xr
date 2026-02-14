 
import { MessageType, EmojiReaction } from '@graphwiz/protocol';
import { Grid, PerspectiveCamera, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useState, useCallback, useEffect, useRef } from 'react';

import { AvatarConfigurator } from './avatar';
import type { AvatarConfig } from './avatar/api';
import { getAvatarPersistence } from './avatar/persistence';
import {
  RoomBrowser,
  CreateRoomModal,
  RoomSettingsPanel,
  RoomButton,
  SceneSelector
} from './components';
import { CameraController } from './components/CameraController';
import { DrawingCanvas, DrawingSettings } from './components/DrawingCanvas';
import { DrawingTools } from './components/DrawingTools';
import { EmojiPicker } from './components/EmojiPicker';
import { FloatingEmoji } from './components/FloatingEmoji';
import { FPSCounter } from './components/FPSCounter';
import { GestureRecognition } from './components/GestureRecognition';
import { GrabDemoScene } from './components/GrabDemoScene';
import { InteractiveDemoScene } from './components/InteractiveDemoScene';
import { MediaDemoScene } from './components/MediaDemoScene';
import { NetworkedAvatar, NetworkedAvatarConfig } from './components/NetworkedAvatar';
import { PortalDemoScene } from './components/PortalDemoScene';
import type { SceneType } from './components/SceneSelector';
import { useRoomManager } from './hooks/useRoomManager';
import { WebSocketClient } from './network/websocket-client';
import { SettingsPanel } from './settings';
import { AssetBrowser, AssetUploader, Asset } from './storage';

interface Entity {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  displayName?: string;
  isPlayer?: boolean;
  avatarConfig?: NetworkedAvatarConfig;
}

interface FloatingEmojiData {
  id: string;
  emoji: string;
  position: [number, number, number];
}

function PlayerAvatar({
  position,
  rotation,
  displayName
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  displayName: string;
}) {
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

/**
 * InterpolationUpdater Component
 * Updates interpolated positions for smooth player movement using useFrame
 */
function InterpolationUpdater({
  targetPositionsRef,
  setInterpolatedPositions,
  interpolationFactor
}: {
  targetPositionsRef: React.RefObject<Map<string, [number, number, number]>>;
  setInterpolatedPositions: React.Dispatch<
    React.SetStateAction<Map<string, [number, number, number]>>
  >;
  interpolationFactor: number;
}) {
  useFrame(() => {
    const targets = targetPositionsRef.current;
    if (!targets || targets.size === 0) return;

    setInterpolatedPositions((prev) => {
      const updated = new Map(prev);

      targets.forEach((target, playerId) => {
        const current = updated.get(playerId);

        if (current) {
          // Linear interpolation (lerp): current = current + (target - current) * factor
          const lerp = (curr: number, tgt: number) => curr + (tgt - curr) * interpolationFactor;

          const newPos: [number, number, number] = [
            lerp(current[0], target[0]),
            lerp(current[1], target[1]),
            lerp(current[2], target[2])
          ];

          // Only update if there's significant movement to prevent unnecessary renders
          const distance = Math.sqrt(
            Math.pow(newPos[0] - current[0], 2) +
              Math.pow(newPos[1] - current[1], 2) +
              Math.pow(newPos[2] - current[2], 2)
          );

          if (distance > 0.001) {
            updated.set(playerId, newPos);
          }
        } else {
          // Initialize if not exists
          updated.set(playerId, target);
        }
      });

      return updated;
    });
  });

  return null; // This component doesn't render anything
}

function App() {
  // WebSocket connection state
  const [client, setClient] = useState<WebSocketClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myClientId, setMyClientId] = useState<string | null>(null);

  // Network data
  const [presenceEvents, setPresenceEvents] = useState<Array<any>>([]);
  const [messages, setMessages] = useState<Array<{ from: string; message: string }>>([]);

  const [localEntities, setLocalEntities] = useState<Map<string, Entity>>(new Map());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatVisible, setChatVisible] = useState(true);

  // Storage state
  const [storageVisible, setStorageVisible] = useState(false);
  const [storageTab, setStorageTab] = useState<'browse' | 'upload'>('browse');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Performance overlay state
  const [perfOverlayVisible, setPerfOverlayVisible] = useState(false);

  // Performance metrics refs
  const fpsRef = useRef(0);
  const lastNetworkLatencyRef = useRef(0);
  const remotePlayersCountRef = useRef(0);

  // Emoji state
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<Map<string, FloatingEmojiData>>(new Map());

  // Settings state
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Avatar configurator state
  const [avatarConfiguratorVisible, setAvatarConfiguratorVisible] = useState(false);
  const [localAvatarConfig, setLocalAvatarConfig] = useState<AvatarConfig | null>(null);

  // Scene selector state
  const [currentScene, setCurrentScene] = useState<SceneType>('default');

  // Drawing tools state
  const [drawingSettings, setDrawingSettings] = useState<DrawingSettings>({
    mode: 'brush',
    color: '#ffffff',
    brushSize: 5,
    lineWidth: 2,
    isDrawing: false
  });

  // Player state
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [playerRotation, setPlayerRotation] = useState(0);
  const [interpolatedPositions, setInterpolatedPositions] = useState<
    Map<string, [number, number, number]>
  >(new Map());
  const keysPressed = useRef<Set<string>>(new Set());
  const cameraRotation = useRef(0);
  const movementSpeed = 0.1;
  const rotationSpeed = 0.05;
  const interpolationFactor = 0.15;

  // Physics state
  const grabbedEntityId = useRef<string | null>(null);

  // Interpolation refs
  const targetPositionsRef = useRef<Map<string, [number, number, number]>>(new Map());
  const lastUpdateTimeRef = useRef<Map<string, number>>(new Map());

  // Room manager
  const roomManager = useRoomManager(client);

  // Initialize WebSocket connection - create ONLY ONCE, reuse across re-renders
  const wsClient = useRef<WebSocketClient | null>(null);
  const userId = useRef<string>(`user-${Math.floor(Math.random() * 10000)}`);
  const displayName = useRef<string>(`Player-${Math.floor(Math.random() * 1000)}`);

  useEffect(() => {
    // Use environment variable or default to 8003 presence service port
    const presenceUrl = import.meta.env.VITE_PRESENCE_WS_URL || 'ws://localhost:8003';
    console.log('[App] Connecting to presence service at:', presenceUrl);

    // Create WebSocketClient only if it doesn't exist
    if (!wsClient.current) {
      wsClient.current = new WebSocketClient({
        presenceUrl,
        roomId: import.meta.env.VITE_ROOM_ID || 'lobby',
        userId: userId.current,
        displayName: displayName.current
      });

      setClient(wsClient.current);
      setConnecting(true);

      // Connect to server
      wsClient.current
        ?.connect()
        .then(() => {
          setConnected(true);
          setConnecting(false);
          const clientId = wsClient.current?.getClientId();
          console.log('[App] Connected to presence server');
          console.log('[App] Client ID:', clientId);
          if (clientId) {
            setMyClientId(clientId);
          } else {
            console.error('[App] Client ID is null after connection!');
          }
        })
        .catch((err) => {
          console.error('[App] Failed to connect:', err);
          setError(err instanceof Error ? err.message : String(err));
          setConnecting(false);
        });
    }

    // Set up message handlers - use function to get current client ID
    const getMyClientId = () => client?.getClientId() || myClientId;
    const unsubscribePresence = wsClient.current.on(MessageType.PRESENCE_JOIN, (message: any) => {
      if (message.payload) {
        setPresenceEvents((prev) => {
          const filtered = prev.filter((e) => e.clientId !== message.payload.clientId);
          if (message.payload.eventType === 1) {
            // Leave
            return filtered;
          }
          return [...filtered, message.payload];
        });
      }
    });

    const unsubscribeChat = wsClient.current.on(MessageType.CHAT_MESSAGE, (message: any) => {
      if (message.payload) {
        setMessages((prev) => [
          ...prev,
          {
            from: message.payload.fromClientId || 'Unknown',
            message: message.payload.message || ''
          }
        ]);
      }
    });

    const unsubscribeEmoji = wsClient.current.on(MessageType.EMOJI_REACTION, (message: any) => {
      if (message.payload) {
        const payload = message.payload as EmojiReaction;
        const newEmoji: FloatingEmojiData = {
          id: payload.reactionId,
          emoji: payload.emoji,
          position: [payload.position.x, payload.position.y, payload.position.z]
        };

        setFloatingEmojis((prev) => {
          const updated = new Map(prev);
          updated.set(newEmoji.id, newEmoji);
          return updated;
        });

        // Auto-remove after 3 seconds
        setTimeout(() => {
          setFloatingEmojis((prev) => {
            const updated = new Map(prev);
            updated.delete(newEmoji.id);
            return updated;
          });
        }, 3000);
      }
    });

    // Handle presence updates (including avatar updates)
    const unsubscribePresenceUpdate = wsClient.current.on(
      MessageType.PRESENCE_UPDATE,
      (message: any) => {
        console.log('[App] ========== PRESENCE_UPDATE RECEIVED ==========');
        console.log('[App] Presence update message:', message);

        if (message.payload) {
          console.log('[App] Presence update for client:', message.payload.clientId);

          setPresenceEvents((prev) => {
            const existing = prev.find((e) => e.clientId === message.payload.clientId);
            if (existing) {
              console.log('[App] Updating existing presence for', message.payload.clientId);
              // Update existing presence
              return prev.map((e) =>
                e.clientId === message.payload.clientId ? { ...e, data: message.payload } : e
              );
            } else {
              console.log('[App] Adding new presence for', message.payload.clientId);
              // Add new presence
              return [...prev, { clientId: message.payload.clientId, data: message.payload }];
            }
          });
        } else {
          console.log('[App] PRESENCE_UPDATE missing payload');
        }
      }
    );

    // Handle entity spawn (create 3D avatars for other players)
    const unsubscribeEntitySpawn = wsClient.current.on(MessageType.ENTITY_SPAWN, (message: any) => {
      console.log('[App] ========== ENTITY_SPAWN RECEIVED ==========');
      console.log('[App] Full message:', JSON.stringify(message, null, 2));
      console.log('[App] Message payload:', message.payload);

      const myId = getMyClientId();
      console.log('[App] My client ID:', myId);

      if (message.payload && message.payload.entityId) {
        const ownerId = message.payload.ownerId || message.payload.clientId;
        console.log('[App] Entity owner ID:', ownerId);

        // Skip if it's the local player (already rendered)
        if (ownerId === myId) {
          console.log('[App] Skipping local player entity spawn (ownerId match)');
          return;
        }

        // Also skip if the entityId matches our client ID
        if (message.payload.entityId === myId) {
          console.log('[App] Skipping local player entity spawn (entityId match)');
          return;
        }

        console.log('[App] Spawning remote player entity:', ownerId);

        // Add to presence events so it gets rendered
        const avatarConfig = message.payload.components?.avatarConfig || {};
        const position = message.payload.components?.position || { x: 0, y: 0, z: 0 };
        const entityId = message.payload.entityId;

        console.log('[App] Avatar config from spawn:', avatarConfig);
        console.log('[App] Position from spawn:', position);

        setPresenceEvents((prev) => {
          console.log('[App] Current presence events count:', prev.length);
          // Check if presence already exists (use entityId as the key)
          if (prev.find((e) => e.clientId === entityId)) {
            console.log('[App] Player already in presence list, skipping');
            return prev;
          }

          const newPresence = {
            clientId: entityId, // Use entityId as the key to match position updates
            data: {
              displayName: `Player-${entityId.substring(0, 8)}`,
              position: position,
              avatarConfig: avatarConfig
            }
          };

          console.log('[App] Adding new presence event:', newPresence);
          const updated = [...prev, newPresence];
          console.log('[App] New presence events count:', updated.length);
          return updated;
        });
      } else {
        console.log('[App] ENTITY_SPAWN message missing payload or entityId');
      }
    });

    // Handle position updates (update avatar positions from network)
    let positionUpdateCount = 0;
    const unsubscribePositionUpdate = wsClient.current.on(
      MessageType.POSITION_UPDATE,
      (message: any) => {
        const myId = getMyClientId();

        if (message.payload && message.payload.entityId) {
          const entityId = message.payload.entityId;
          const position = message.payload.position;

          // Skip if it's the local player
          if (entityId === myId) {
            return;
          }

          // Update target position for interpolation
          if (position && typeof position.x === 'number') {
            const newPos: [number, number, number] = [position.x, position.y || 0, position.z || 0];

            // Store under entityId for interpolation
            targetPositionsRef.current.set(entityId, newPos);

            // Also update presenceEvents state to trigger re-render
            setPresenceEvents((prev) => {
              return prev.map((p) => {
                // Check if this presence event matches the entity
                // We need to match by checking if this entity's position is being updated
                const hasMatchingEntityId = p.clientId === entityId;
                if (hasMatchingEntityId) {
                  return {
                    ...p,
                    data: {
                      ...p.data,
                      position: { x: position.x, y: position.y || 0, z: position.z || 0 }
                    }
                  };
                }
                return p;
              });
            });

            // Log every 60 updates (~3 seconds)
            positionUpdateCount++;
            if (positionUpdateCount % 60 === 0) {
              console.log(`[App] Received ${positionUpdateCount} position updates for ${entityId}`);
            }
          }
        }
      }
    );

    // Handle OBJECT_GRAB messages
    const unsubscribeObjectGrab = wsClient.current.on(MessageType.OBJECT_GRAB, (message: any) => {
      console.log('[App] ========== OBJECT_GRAB RECEIVED ==========');
      if (message.payload) {
        const { entityId, clientId } = message.payload;
        console.log('[App] Entity', entityId, 'grabbed by', clientId);

        // Update grab state for rendering
        if (clientId !== myClientId) {
          grabbedEntityId.current = entityId;
        }
      }
    });

    // Handle OBJECT_RELEASE messages
    const unsubscribeObjectRelease = wsClient.current.on(
      MessageType.OBJECT_RELEASE,
      (message: any) => {
        console.log('[App] ========== OBJECT_RELEASE RECEIVED ==========');
        if (message.payload) {
          const { entityId, clientId, velocity } = message.payload;
          console.log(
            '[App] Entity',
            entityId,
            'released by',
            clientId,
            'with velocity:',
            velocity
          );

          // Clear grab state
          if (grabbedEntityId.current === entityId) {
            grabbedEntityId.current = null;
          }
        }
      }
    );

    // Cleanup on unmount
    return () => {
      unsubscribePresence();
      unsubscribeChat();
      unsubscribeEmoji();
      unsubscribePresenceUpdate();
      unsubscribeEntitySpawn();
      unsubscribePositionUpdate();
      unsubscribeObjectGrab();
      unsubscribeObjectRelease();
      wsClient.current?.disconnect();
    };
  }, []);

  // Load avatar from persistence when client ID is available
  useEffect(() => {
    if (!myClientId) return;

    const persistence = getAvatarPersistence();
    console.log('[App] Loading avatar for user:', myClientId);

    persistence
      .loadAvatar(myClientId)
      .then((config) => {
        console.log('[App] Avatar loaded:', config);
        setLocalAvatarConfig(config);

        // Send avatar update to network after connection is established
        if (client && client.connected()) {
          client.sendAvatarUpdate({
            bodyType: config.body_type,
            primaryColor: config.primary_color,
            secondaryColor: config.secondary_color,
            height: config.height,
            customModelUrl: config.custom_model_id || ''
          });
          console.log('[App] Avatar config sent to network');
        }
      })
      .catch((error) => {
        console.error('[App] Failed to load avatar:', error);
        // Use default avatar on error
        setLocalAvatarConfig({
          user_id: myClientId,
          body_type: 'human',
          primary_color: '#4CAF50',
          secondary_color: '#2196F3',
          height: 1.7,
          metadata: {}
        });
      });
  }, [myClientId, client]);

  // Send avatar to network when connected
  useEffect(() => {
    if (!connected || !client) {
      console.log('[App] Avatar spawn: not ready - connected:', connected, 'client:', !!client);
      return;
    }

    if (!localAvatarConfig) {
      console.log('[App] Avatar spawn: localAvatarConfig is null, skipping spawn');
      return;
    }

    if (!myClientId) {
      console.log('[App] Avatar spawn: myClientId is null, skipping spawn');
      return;
    }

    console.log('[App] Sending avatar config to network...');
    client.sendAvatarUpdate({
      bodyType: localAvatarConfig.body_type,
      primaryColor: localAvatarConfig.primary_color,
      secondaryColor: localAvatarConfig.secondary_color,
      height: localAvatarConfig.height,
      customModelUrl: localAvatarConfig.custom_model_id || ''
    });

    // Also send ENTITY_SPAWN so other clients render our avatar
    console.log('[App] Sending ENTITY_SPAWN for local player...', myClientId);
    client.sendEntitySpawn({
      entityId: myClientId,
      templateId: 'player',
      components: {
        position: { x: playerPosition[0], y: playerPosition[1], z: playerPosition[2] },
        avatarConfig: {
          bodyType: localAvatarConfig.body_type,
          primaryColor: localAvatarConfig.primary_color,
          secondaryColor: localAvatarConfig.secondary_color,
          height: localAvatarConfig.height
        }
      }
    });
    console.log('[App] Avatar update sent to network');
  }, [connected, client, localAvatarConfig, myClientId]);

  // Keyboard event handlers for movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Movement update loop
  useEffect(() => {
    if (!connected || !client) {
      console.log('[App] Movement loop not started: connected=', connected, 'client=', !!client);
      return;
    }

    console.log('[App] Starting movement loop...');
    let updateCount = 0;

    const movementInterval = setInterval(() => {
      setPlayerPosition((prev) => {
        const [x, y, z] = prev;
        let newX = x;
        let newZ = z;

        // Calculate forward/backward and left/right based on CAMERA rotation (where player is looking)
        // Use cameraRotation for WASD movement so player moves in direction they're facing
        const forward = [Math.sin(cameraRotation.current), Math.cos(cameraRotation.current)] as [
          number,
          number
        ];
        // Right vector (perpendicular to forward)
        const right = [Math.cos(cameraRotation.current), -Math.sin(cameraRotation.current)] as [
          number,
          number
        ];

        // WASD movement
        if (keysPressed.current.has('w')) {
          newX += forward[0] * movementSpeed;
          newZ += forward[1] * movementSpeed;
        }
        if (keysPressed.current.has('s')) {
          newX -= forward[0] * movementSpeed;
          newZ -= forward[1] * movementSpeed;
        }
        if (keysPressed.current.has('a')) {
          // Strafe left (opposite of right vector)
          newX -= right[0] * movementSpeed;
          newZ -= right[1] * movementSpeed;
        }
        if (keysPressed.current.has('d')) {
          // Strafe right
          newX += right[0] * movementSpeed;
          newZ += right[1] * movementSpeed;
        }

        // Q/E rotation (still updates player model rotation)
        if (keysPressed.current.has('q')) {
          setPlayerRotation((r) => r + rotationSpeed);
        }
        if (keysPressed.current.has('e')) {
          setPlayerRotation((r) => r - rotationSpeed);
        }

        // Clamp position to reasonable bounds
        newX = Math.max(-10, Math.min(10, newX));
        newZ = Math.max(-10, Math.min(10, newZ));

        const newPos: [number, number, number] = [newX, y, newZ];

        // Send position update if position changed
        if (newX !== x || newZ !== z) {
          updateCount++;
          if (updateCount % 60 === 0) {
            // Log every 60 updates (~1 second)
            console.log('[App] Player moved to:', newPos, 'Total updates:', updateCount);
          }
          client.sendPositionUpdate(
            myClientId || 'local',
            { x: newX, y: y, z: newZ },
            { x: 0, y: playerRotation, z: 0, w: 1 } // Simplified rotation
          );
        }

        return newPos;
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(movementInterval);
  }, [connected, client, myClientId, cameraRotation]);

  // Update target positions for interpolation when presence events change
  useEffect(() => {
    const newTargets = new Map<string, [number, number, number]>();
    const newInterpolated = new Map<string, [number, number, number]>();

    presenceEvents.forEach((p) => {
      if (p.data.position && p.clientId !== myClientId) {
        const targetPos: [number, number, number] = [
          p.data.position!.x,
          p.data.position!.y,
          p.data.position!.z
        ];

        newTargets.set(p.clientId, targetPos);

        // Initialize interpolated position if it doesn't exist
        const currentInterpolated = interpolatedPositions.get(p.clientId);
        if (!currentInterpolated) {
          // For new players, start at target position
          newInterpolated.set(p.clientId, targetPos);
          lastUpdateTimeRef.current.set(p.clientId, Date.now());
        }
      }
    });

    // Update target positions ref
    targetPositionsRef.current = newTargets;

    // Add new interpolated positions
    if (newInterpolated.size > 0) {
      setInterpolatedPositions((prev) => {
        const updated = new Map(prev);
        newInterpolated.forEach((pos, id) => {
          if (!updated.has(id)) {
            updated.set(id, pos);
          }
        });
        return updated;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presenceEvents, myClientId]);

  // Update performance metrics
  useEffect(() => {
    // Calculate entities count
    fpsRef.current = 60; // Target 60 FPS
    lastNetworkLatencyRef.current = 0; // Placeholder - would track actual latency
    remotePlayersCountRef.current = presenceEvents.filter(
      (e) => e.data?.clientId !== myClientId && e.eventType === 1 // PRESENCE_JOIN
    ).length;
  }, [presenceEvents, myClientId]);

  // Combine local entities
  const allEntities: Entity[] = [
    // Add local player (always render, even without avatar config)
    ...(myClientId
      ? [
          {
            id: myClientId,
            position: playerPosition,
            rotation: [0, playerRotation, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            displayName: 'You',
            isPlayer: true,
            avatarConfig: localAvatarConfig
              ? {
                  body_type: localAvatarConfig.body_type,
                  primary_color: localAvatarConfig.primary_color,
                  secondary_color: localAvatarConfig.secondary_color,
                  height: localAvatarConfig.height,
                  custom_model_url: localAvatarConfig.custom_model_id
                }
              : undefined
          }
        ]
      : []),
    ...Array.from(localEntities.values()),
    // Add other players from presence (using interpolated positions)
    ...presenceEvents
      .filter((p) => p.data.position && p.clientId !== myClientId)
      .map((p) => {
        // Use interpolated position if available, otherwise use target position
        const interpolatedPos = interpolatedPositions.get(p.clientId);
        const position =
          interpolatedPos ||
          ([p.data.position!.x, p.data.position!.y, p.data.position!.z] as [
            number,
            number,
            number
          ]);

        return {
          id: p.clientId,
          position,
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
          displayName: p.data.displayName || 'Unknown',
          isPlayer: true,
          avatarConfig: p.data.avatarConfig
            ? {
                body_type: p.data.avatarConfig.bodyType || 'human',
                primary_color: p.data.avatarConfig.primaryColor || '#4CAF50',
                secondary_color: p.data.avatarConfig.secondaryColor || '#2196F3',
                height: p.data.avatarConfig.height || 1.7,
                custom_model_url: p.data.avatarConfig.customModelUrl
              }
            : undefined
        };
      })
  ];

  const addEntity = useCallback(() => {
    const id = `entity-${Date.now()}`;
    const newEntity: Entity = {
      id,
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    };
    setLocalEntities((prev) => new Map(prev).set(id, newEntity));
  }, []);

  const handleSendChat = useCallback(() => {
    if (chatInput.trim() && client) {
      client.sendChatMessage(chatInput.trim());
      setMessages((prev) => [
        ...prev,
        {
          from: 'You',
          message: chatInput.trim()
        }
      ]);
      setChatInput('');
    }
  }, [chatInput, client]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSendChat();
      }
    },
    [handleSendChat]
  );

  const handleSendEmoji = useCallback(
    (emoji: string) => {
      if (client) {
        // Spawn at a random position near the center
        const position = {
          x: (Math.random() - 0.5) * 4,
          y: 1.5,
          z: (Math.random() - 0.5) * 4
        };
        client.sendEmojiReaction(emoji, position);
        setEmojiPickerVisible(false);
      }
    },
    [client]
  );

  // Send grab/release messages
  const sendGrabMessage = useCallback(
    (
      entityId: string,
      action: 'grab' | 'release',
      velocity?: { x: number; y: number; z: number }
    ) => {
      if (!client) return;

      const position = {
        x: playerPosition[0],
        y: playerPosition[1] + 1, // Approximate hand position
        z: playerPosition[2]
      };

      if (action === 'grab') {
        client.sendGrabMessage(entityId, position);
      } else if (action === 'release' && velocity) {
        client.sendReleaseMessage(entityId, position, velocity);
      }
    },
    [client, playerPosition]
  );

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* UI Overlay - Connection Status */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.7)',
          padding: 16,
          borderRadius: 8,
          color: 'white',
          fontFamily: 'sans-serif'
        }}
      >
        <h1 style={{ margin: '0 0 8px 0', fontSize: 18 }}>GraphWiz-XR Hub Client</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: connecting ? '#FFC107' : connected ? '#4CAF50' : '#f44336'
            }}
          />
          <span style={{ fontSize: 12 }}>
            {connecting ? 'Connecting...' : connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {myClientId && (
          <p style={{ margin: '0 0 8px 0', fontSize: 11, opacity: 0.8 }}>
            Client ID: {myClientId.slice(0, 8)}...
          </p>
        )}
        {localAvatarConfig && (
          <div
            style={{
              marginTop: 8,
              padding: 8,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${localAvatarConfig.primary_color} 0%, ${localAvatarConfig.secondary_color} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16
              }}
            >
              {localAvatarConfig.body_type === 'human' && '👤'}
              {localAvatarConfig.body_type === 'robot' && '🤖'}
              {localAvatarConfig.body_type === 'alien' && '👽'}
              {localAvatarConfig.body_type === 'animal' && '🐾'}
              {localAvatarConfig.body_type === 'abstract' && '🎨'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, opacity: 0.7 }}>Your Avatar</div>
              <div style={{ fontSize: 11, fontWeight: 'bold' }}>
                {localAvatarConfig.body_type.charAt(0).toUpperCase() +
                  localAvatarConfig.body_type.slice(1)}{' '}
                · {localAvatarConfig.height}m
              </div>
            </div>
          </div>
        )}
        {error && <p style={{ margin: 0, fontSize: 11, color: '#f44336' }}>{error}</p>}
        <p style={{ margin: '8px 0 0 0', fontSize: 12, opacity: 0.8 }}>
          Entities: {allEntities.length} | Players: {presenceEvents.length}
        </p>
        <div
          style={{
            marginTop: 12,
            padding: 8,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            fontSize: 11
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Movement Controls:</div>
          <div style={{ opacity: 0.9 }}>W/A/S/D - Move in facing direction</div>
          <div style={{ opacity: 0.9 }}>Q/E - Rotate character</div>
          <div style={{ opacity: 0.9 }}>Mouse - Rotate camera</div>
          <div style={{ opacity: 0.9, marginTop: 4 }}>
            Position: {playerPosition[0].toFixed(1)}, {playerPosition[2].toFixed(1)}
          </div>
        </div>
        <button
          onClick={addEntity}
          style={{
            marginTop: 12,
            padding: '8px 16px',
            background: '#4CAF50',
            border: 'none',
            borderRadius: 4,
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Add Entity
        </button>
        <button
          onClick={() => setSettingsVisible(true)}
          style={{
            marginTop: 8,
            padding: '8px 16px',
            background: 'rgba(33, 150, 243, 0.8)',
            border: 'none',
            borderRadius: 4,
            color: 'white',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          ⚙️ Settings
        </button>
        <button
          onClick={() => setAvatarConfiguratorVisible(true)}
          style={{
            marginTop: 8,
            padding: '8px 16px',
            background: 'rgba(156, 39, 176, 0.8)',
            border: 'none',
            borderRadius: 4,
            color: 'white',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          🎭 Avatar
        </button>
      </div>

      {/* Chat Overlay */}
      {chatVisible && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 100,
            width: 320,
            maxHeight: 300,
            background: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>Chat</span>
            <button
              onClick={() => setChatVisible(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            {messages.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center' }}>
                No messages yet
              </p>
            ) : (
              messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{msg.from}</span>
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
                fontSize: 13
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
            cursor: 'pointer'
          }}
        >
          💬 Chat ({messages.length})
        </button>
      )}

      {/* Emoji Reaction Button */}
      <button
        onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
        style={{
          position: 'absolute',
          bottom: 16,
          left: chatVisible ? 356 : 168,
          zIndex: 100,
          padding: '12px 16px',
          background: emojiPickerVisible ? 'rgba(255, 152, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
          border: 'none',
          borderRadius: 8,
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        😀 Emoji
      </button>

      {/* Emoji Picker */}
      {emojiPickerVisible && (
        <EmojiPicker onSelect={handleSendEmoji} onClose={() => setEmojiPickerVisible(false)} />
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
          cursor: 'pointer'
        }}
      >
        {storageVisible ? '× Close' : '📦 Assets'}
      </button>

      {/* Storage Panel */}
      {storageVisible && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1000,
            width: 400,
            maxHeight: 'calc(100vh - 32px)',
            background: 'rgba(0, 0, 0, 0.9)',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Asset Manager</span>
            <button
              onClick={() => setStorageVisible(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: 20
              }}
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
                fontWeight: storageTab === 'browse' ? 'bold' : 'normal'
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
                fontWeight: storageTab === 'upload' ? 'bold' : 'normal'
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

      {/* Settings Panel */}
      {settingsVisible && <SettingsPanel onClose={() => setSettingsVisible(false)} />}

      {/* Performance Overlay Button */}
      <button
        onClick={() => setPerfOverlayVisible(!perfOverlayVisible)}
        style={{
          position: 'absolute',
          bottom: 80,
          right: 16,
          zIndex: 100,
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.7)',
          border: 'none',
          borderRadius: 8,
          color: '#fff',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 'bold'
        }}
      >
        {perfOverlayVisible ? '📊 Hide Stats' : '⚡ Performance'}
      </button>

      {/* Performance Overlay */}
      {perfOverlayVisible && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            zIndex: 10000,
            padding: 20,
            background: 'rgba(0, 0, 0, 0.9)',
            borderRadius: 8,
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: 12,
            lineHeight: 1.6,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            pointerEvents: perfOverlayVisible ? 'auto' : 'none'
          }}
        >
          <div style={{ marginBottom: 16, fontSize: 14, fontWeight: 'bold', color: '#4CAF50' }}>
            Performance Metrics
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <div>
              <span style={{ color: '#666' }}>FPS:</span>{' '}
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {fpsRef.current.toFixed(1)}
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>Entities:</span>{' '}
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{localEntities.size}</span>
            </div>
            <div>
              <span style={{ color: '#666' }}>Remote Players:</span>{' '}
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {remotePlayersCountRef.current}
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>Network Latency:</span>{' '}
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {lastNetworkLatencyRef.current.toFixed(0)}ms
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <div>
              <span style={{ color: '#666' }}>FPS:</span>{' '}
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {fpsRef.current.toFixed(1)}
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>Entities:</span>{' '}
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{localEntities.size}</span>
            </div>
            <div>
              <span style={{ color: '#666' }}>Remote Players:</span>{' '}
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {remotePlayersCountRef.current}
              </span>
            </div>
            <div>
              <span style={{ color: '#666' }}>Network Latency:</span>{' '}
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {lastNetworkLatencyRef.current.toFixed(0)}ms
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Configurator */}
      {avatarConfiguratorVisible && myClientId && (
        <AvatarConfigurator
          userId={myClientId}
          onClose={() => setAvatarConfiguratorVisible(false)}
          onSave={(config) => {
            console.log('[App] Avatar saved:', config);

            // Update local state
            setLocalAvatarConfig(config);

            // Send avatar update to network
            if (client && client.connected()) {
              client.sendAvatarUpdate({
                bodyType: config.body_type,
                primaryColor: config.primary_color,
                secondaryColor: config.secondary_color,
                height: config.height,
                customModelUrl: config.custom_model_id || ''
              });
              console.log('[App] Avatar update sent to network');
            }

            // Update local player entity with new avatar
            setLocalEntities((prev) => {
              const updated = new Map(prev);
              // The player is represented by presence data, not local entities
              return updated;
            });
          }}
        />
      )}

      {/* 3D Canvas */}
      <Canvas shadows>
        {/* Interpolation updater for smooth remote player movement */}
        <InterpolationUpdater
          targetPositionsRef={targetPositionsRef}
          setInterpolatedPositions={setInterpolatedPositions}
          interpolationFactor={interpolationFactor}
        />

        {/* Camera with smooth following and orbit controls */}
        <PerspectiveCamera makeDefault fov={60} position={[0, 5, 8]} />
        <CameraController
          targetPosition={playerPosition}
          targetRotation={playerRotation}
          enabled={true}
          onCameraRotationChange={(rotation: number) => (cameraRotation.current = rotation)}
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

        {/* Scene-based rendering - Only show selected scene */}
        {client && myClientId && currentScene === 'interactive' && (
          <InteractiveDemoScene wsClient={client} myClientId={myClientId} />
        )}

        {client && myClientId && currentScene === 'media' && (
          <MediaDemoScene wsClient={client} myClientId={myClientId || ''} />
        )}

        {client && myClientId && currentScene === 'grab' && (
          <GrabDemoScene myClientId={myClientId} sendGrabMessage={sendGrabMessage} />
        )}

        {client && myClientId && currentScene === 'portal' && (
          <PortalDemoScene myClientId={myClientId} />
        )}

        {client && myClientId && currentScene === 'gestures' && (
          <GestureRecognition
            enabled={true}
            onGestureDetected={(gesture, controllerId) => {
              console.log(`[Gesture] ${controllerId} controller: ${gesture}`);
            }}
          />
        )}

        {client && myClientId && currentScene === 'drawing' && (
          <>
            <DrawingCanvas
              width={1024}
              height={1024}
              settings={drawingSettings}
              onClear={() => console.log('Canvas cleared')}
              onExport={(dataUrl) => {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `drawing-${Date.now()}.png`;
                link.click();
              }}
            />
            <DrawingTools
              settings={drawingSettings}
              onSettingsChange={setDrawingSettings}
              onClear={() => console.log('Clear canvas')}
              onUndo={() => console.log('Undo')}
              onExport={() => {
                const canvas = document.querySelector('canvas');
                if (canvas) {
                  const dataUrl = canvas.toDataURL('image/png');
                  const link = document.createElement('a');
                  link.href = dataUrl;
                  link.download = `drawing-${Date.now()}.png`;
                  link.click();
                }
              }}
            />
          </>
        )}

        {/* Grab Demo Scene - Object Grabbing System */}
        {client && myClientId && (
          <GrabDemoScene myClientId={myClientId} sendGrabMessage={sendGrabMessage} />
        )}

        {/* Entities */}
        {allEntities.map((entity) =>
          entity.isPlayer ? (
            entity.avatarConfig ? (
              <NetworkedAvatar
                key={entity.id}
                position={entity.position}
                rotation={entity.rotation}
                displayName={entity.displayName || 'Unknown'}
                avatarConfig={entity.avatarConfig}
              />
            ) : (
              <PlayerAvatar
                key={entity.id}
                position={entity.position}
                rotation={entity.rotation}
                displayName={entity.displayName || 'Unknown'}
              />
            )
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
        )}

        {/* Floating Emojis */}
        {Array.from(floatingEmojis.values()).map((emojiData) => (
          <FloatingEmoji
            key={emojiData.id}
            emoji={emojiData.emoji}
            position={emojiData.position}
            onComplete={() => {
              setFloatingEmojis((prev) => {
                const updated = new Map(prev);
                updated.delete(emojiData.id);
                return updated;
              });
            }}
          />
        ))}
      </Canvas>

      {/* FPS Counter Overlay */}
      <FPSCounter />

      {/* Scene Selector UI */}
      <SceneSelector currentScene={currentScene} onSceneChange={setCurrentScene} />

      {/* Scene Selector UI */}
      <SceneSelector currentScene={currentScene} onSceneChange={setCurrentScene} />

      {/* Room Management UI */}
      <RoomButton
        currentRoomId={roomManager.currentRoomId || undefined}
        onOpenBrowser={() => roomManager.setShowBrowser(true)}
        onOpenSettings={() => roomManager.setShowSettings(true)}
        onLeaveRoom={roomManager.handleLeaveRoom}
      />

      <RoomBrowser
        isOpen={roomManager.showBrowser}
        onClose={() => roomManager.setShowBrowser(false)}
        onJoinRoom={roomManager.handleJoinRoom}
        onCreateRoom={() => roomManager.setShowCreateRoom(true)}
        currentUserId={myClientId || ''}
        storageVisible={storageVisible}
      />

      <CreateRoomModal
        isOpen={roomManager.showCreateRoom}
        onClose={() => roomManager.setShowCreateRoom(false)}
        onCreateRoom={roomManager.handleCreateRoom}
      />

      {roomManager.showSettings && roomManager.roomSettings && (
        <RoomSettingsPanel
          isOpen={roomManager.showSettings}
          onClose={() => roomManager.setShowSettings(false)}
          roomSettings={roomManager.roomSettings}
          participants={roomManager.participants}
          currentUserId={myClientId || ''}
          onLeaveRoom={roomManager.handleLeaveRoom}
          onKickParticipant={roomManager.handleKickParticipant}
          onMuteParticipant={roomManager.handleMuteParticipant}
          onToggleHost={roomManager.handleToggleHost}
        />
      )}
    </div>
  );
}

export default App;
