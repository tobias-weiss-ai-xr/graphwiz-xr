import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* eslint-disable react/no-unknown-property */
import { MessageType } from '@graphwiz/protocol';
import { Grid, PerspectiveCamera, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useState, useCallback, useEffect, useRef } from 'react';
import { AvatarConfigurator } from './avatar';
import { GrabDemoScene } from './components/GrabDemoScene';
import { CameraController } from './components/CameraController';
import { getAvatarPersistence } from './avatar/persistence';
import { RoomBrowser, CreateRoomModal, RoomSettingsPanel, RoomButton, SceneSelector } from './components';
import { EmojiPicker } from './components/EmojiPicker';
import { FloatingEmoji } from './components/FloatingEmoji';
import { FPSCounter } from './components/FPSCounter';
import { InteractiveDemoScene } from './components/InteractiveDemoScene';
import { MediaDemoScene } from './components/MediaDemoScene';
import { PortalDemoScene } from './components/PortalDemoScene';
import { GestureRecognition } from './components/GestureRecognition';
import { NetworkedAvatar } from './components/NetworkedAvatar';
import { useRoomManager } from './hooks/useRoomManager';
import { WebSocketClient } from './network/websocket-client';
import { SettingsPanel } from './settings';
import { AssetBrowser, AssetUploader } from './storage';
import { DrawingCanvas } from './components/DrawingCanvas';
import { DrawingTools } from './components/DrawingTools';
function PlayerAvatar({ position, rotation, displayName }) {
    return (_jsxs("group", { position: position, rotation: rotation, children: [_jsxs("mesh", { castShadow: true, children: [_jsx("capsuleGeometry", { args: [0.3, 0.8, 8, 16] }), _jsx("meshStandardMaterial", { color: "#4CAF50" })] }), _jsxs("mesh", { position: [0, 0.7, 0], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.2, 16, 16] }), _jsx("meshStandardMaterial", { color: "#FFCC80" })] }), _jsx(Text, { position: [0, 1.2, 0], fontSize: 0.2, color: "white", anchorX: "center", anchorY: "middle", outlineWidth: 0.02, outlineColor: "#000000", children: displayName })] }));
}
/**
 * InterpolationUpdater Component
 * Updates interpolated positions for smooth player movement using useFrame
 */
function InterpolationUpdater({ targetPositionsRef, setInterpolatedPositions, interpolationFactor }) {
    useFrame(() => {
        const targets = targetPositionsRef.current;
        if (!targets || targets.size === 0)
            return;
        setInterpolatedPositions((prev) => {
            const updated = new Map(prev);
            targets.forEach((target, playerId) => {
                const current = updated.get(playerId);
                if (current) {
                    // Linear interpolation (lerp): current = current + (target - current) * factor
                    const lerp = (curr, tgt) => curr + (tgt - curr) * interpolationFactor;
                    const newPos = [
                        lerp(current[0], target[0]),
                        lerp(current[1], target[1]),
                        lerp(current[2], target[2])
                    ];
                    // Only update if there's significant movement to prevent unnecessary renders
                    const distance = Math.sqrt(Math.pow(newPos[0] - current[0], 2) +
                        Math.pow(newPos[1] - current[1], 2) +
                        Math.pow(newPos[2] - current[2], 2));
                    if (distance > 0.001) {
                        updated.set(playerId, newPos);
                    }
                }
                else {
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
    const [client, setClient] = useState(null);
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [myClientId, setMyClientId] = useState(null);
    // Network data
    const [presenceEvents, setPresenceEvents] = useState([]);
    const [messages, setMessages] = useState([]);
    const [localEntities, setLocalEntities] = useState(new Map());
    const [selectedId, setSelectedId] = useState(null);
    const [chatInput, setChatInput] = useState('');
    const [chatVisible, setChatVisible] = useState(true);
    // Storage state
    const [storageVisible, setStorageVisible] = useState(false);
    const [storageTab, setStorageTab] = useState('browse');
    const [selectedAsset, setSelectedAsset] = useState(null);
    // Performance overlay state
    const [perfOverlayVisible, setPerfOverlayVisible] = useState(false);
    // Performance metrics refs
    const fpsRef = useRef(0);
    const lastNetworkLatencyRef = useRef(0);
    const remotePlayersCountRef = useRef(0);
    // Emoji state
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
    const [floatingEmojis, setFloatingEmojis] = useState(new Map());
    // Settings state
    const [settingsVisible, setSettingsVisible] = useState(false);
    // Avatar configurator state
    const [avatarConfiguratorVisible, setAvatarConfiguratorVisible] = useState(false);
    const [localAvatarConfig, setLocalAvatarConfig] = useState(null);
    // Scene selector state
    const [currentScene, setCurrentScene] = useState('default');
    // Drawing tools state
    const [drawingSettings, setDrawingSettings] = useState({
        mode: 'brush',
        color: '#ffffff',
        brushSize: 5,
        lineWidth: 2,
        isDrawing: false
    });
    // Player state
    const [playerPosition, setPlayerPosition] = useState([0, 0, 0]);
    const [playerRotation, setPlayerRotation] = useState(0);
    const [interpolatedPositions, setInterpolatedPositions] = useState(new Map());
    const keysPressed = useRef(new Set());
    const cameraRotation = useRef(0);
    const movementSpeed = 0.1;
    const rotationSpeed = 0.05;
    const interpolationFactor = 0.15;
    // Physics state
    const grabbedEntityId = useRef(null);
    // Interpolation refs
    const targetPositionsRef = useRef(new Map());
    const lastUpdateTimeRef = useRef(new Map());
    // Room manager
    const roomManager = useRoomManager(client);
    // Initialize WebSocket connection - create ONLY ONCE, reuse across re-renders
    const wsClient = useRef(null);
    const userId = useRef(`user-${Math.floor(Math.random() * 10000)}`);
    const displayName = useRef(`Player-${Math.floor(Math.random() * 1000)}`);
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
                }
                else {
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
        const unsubscribePresence = wsClient.current.on(MessageType.PRESENCE_JOIN, (message) => {
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
        const unsubscribeChat = wsClient.current.on(MessageType.CHAT_MESSAGE, (message) => {
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
        const unsubscribeEmoji = wsClient.current.on(MessageType.EMOJI_REACTION, (message) => {
            if (message.payload) {
                const payload = message.payload;
                const newEmoji = {
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
        const unsubscribePresenceUpdate = wsClient.current.on(MessageType.PRESENCE_UPDATE, (message) => {
            console.log('[App] ========== PRESENCE_UPDATE RECEIVED ==========');
            console.log('[App] Presence update message:', message);
            if (message.payload) {
                console.log('[App] Presence update for client:', message.payload.clientId);
                setPresenceEvents((prev) => {
                    const existing = prev.find((e) => e.clientId === message.payload.clientId);
                    if (existing) {
                        console.log('[App] Updating existing presence for', message.payload.clientId);
                        // Update existing presence
                        return prev.map((e) => e.clientId === message.payload.clientId ? { ...e, data: message.payload } : e);
                    }
                    else {
                        console.log('[App] Adding new presence for', message.payload.clientId);
                        // Add new presence
                        return [...prev, { clientId: message.payload.clientId, data: message.payload }];
                    }
                });
            }
            else {
                console.log('[App] PRESENCE_UPDATE missing payload');
            }
        });
        // Handle entity spawn (create 3D avatars for other players)
        const unsubscribeEntitySpawn = wsClient.current.on(MessageType.ENTITY_SPAWN, (message) => {
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
            }
            else {
                console.log('[App] ENTITY_SPAWN message missing payload or entityId');
            }
        });
        // Handle position updates (update avatar positions from network)
        let positionUpdateCount = 0;
        const unsubscribePositionUpdate = wsClient.current.on(MessageType.POSITION_UPDATE, (message) => {
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
                    const newPos = [position.x, position.y || 0, position.z || 0];
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
        });
        // Handle OBJECT_GRAB messages
        const unsubscribeObjectGrab = wsClient.current.on(MessageType.OBJECT_GRAB, (message) => {
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
        const unsubscribeObjectRelease = wsClient.current.on(MessageType.OBJECT_RELEASE, (message) => {
            console.log('[App] ========== OBJECT_RELEASE RECEIVED ==========');
            if (message.payload) {
                const { entityId, clientId, velocity } = message.payload;
                console.log('[App] Entity', entityId, 'released by', clientId, 'with velocity:', velocity);
                // Clear grab state
                if (grabbedEntityId.current === entityId) {
                    grabbedEntityId.current = null;
                }
            }
        });
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
        if (!myClientId)
            return;
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
        const handleKeyDown = (e) => {
            keysPressed.current.add(e.key.toLowerCase());
        };
        const handleKeyUp = (e) => {
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
                const forward = [Math.sin(cameraRotation.current), Math.cos(cameraRotation.current)];
                // Right vector (perpendicular to forward)
                const right = [Math.cos(cameraRotation.current), -Math.sin(cameraRotation.current)];
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
                const newPos = [newX, y, newZ];
                // Send position update if position changed
                if (newX !== x || newZ !== z) {
                    updateCount++;
                    if (updateCount % 60 === 0) {
                        // Log every 60 updates (~1 second)
                        console.log('[App] Player moved to:', newPos, 'Total updates:', updateCount);
                    }
                    client.sendPositionUpdate(myClientId || 'local', { x: newX, y: y, z: newZ }, { x: 0, y: playerRotation, z: 0, w: 1 } // Simplified rotation
                    );
                }
                return newPos;
            });
        }, 1000 / 60); // 60 FPS
        return () => clearInterval(movementInterval);
    }, [connected, client, myClientId, cameraRotation]);
    // Update target positions for interpolation when presence events change
    useEffect(() => {
        const newTargets = new Map();
        const newInterpolated = new Map();
        presenceEvents.forEach((p) => {
            if (p.data.position && p.clientId !== myClientId) {
                const targetPos = [
                    p.data.position.x,
                    p.data.position.y,
                    p.data.position.z
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
        remotePlayersCountRef.current = presenceEvents.filter((e) => e.data?.clientId !== myClientId && e.eventType === 1 // PRESENCE_JOIN
        ).length;
    }, [presenceEvents, myClientId]);
    // Combine local entities
    const allEntities = [
        // Add local player (always render, even without avatar config)
        ...(myClientId
            ? [
                {
                    id: myClientId,
                    position: playerPosition,
                    rotation: [0, playerRotation, 0],
                    scale: [1, 1, 1],
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
            const position = interpolatedPos ||
                [p.data.position.x, p.data.position.y, p.data.position.z];
            return {
                id: p.clientId,
                position,
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
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
        const newEntity = {
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
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSendChat();
        }
    }, [handleSendChat]);
    const handleSendEmoji = useCallback((emoji) => {
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
    }, [client]);
    // Send grab/release messages
    const sendGrabMessage = useCallback((entityId, action, velocity) => {
        if (!client)
            return;
        const position = {
            x: playerPosition[0],
            y: playerPosition[1] + 1, // Approximate hand position
            z: playerPosition[2]
        };
        if (action === 'grab') {
            client.sendGrabMessage(entityId, position);
        }
        else if (action === 'release' && velocity) {
            client.sendReleaseMessage(entityId, position, velocity);
        }
    }, [client, playerPosition]);
    return (_jsxs("div", { style: { width: '100vw', height: '100vh', position: 'relative' }, children: [_jsxs("div", { style: {
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 100,
                    background: 'rgba(0, 0, 0, 0.7)',
                    padding: 16,
                    borderRadius: 8,
                    color: 'white',
                    fontFamily: 'sans-serif'
                }, children: [_jsx("h1", { style: { margin: '0 0 8px 0', fontSize: 18 }, children: "GraphWiz-XR Hub Client" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }, children: [_jsx("div", { style: {
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    background: connecting ? '#FFC107' : connected ? '#4CAF50' : '#f44336'
                                } }), _jsx("span", { style: { fontSize: 12 }, children: connecting ? 'Connecting...' : connected ? 'Connected' : 'Disconnected' })] }), myClientId && (_jsxs("p", { style: { margin: '0 0 8px 0', fontSize: 11, opacity: 0.8 }, children: ["Client ID: ", myClientId.slice(0, 8), "..."] })), localAvatarConfig && (_jsxs("div", { style: {
                            marginTop: 8,
                            padding: 8,
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }, children: [_jsxs("div", { style: {
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${localAvatarConfig.primary_color} 0%, ${localAvatarConfig.secondary_color} 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 16
                                }, children: [localAvatarConfig.body_type === 'human' && '👤', localAvatarConfig.body_type === 'robot' && '🤖', localAvatarConfig.body_type === 'alien' && '👽', localAvatarConfig.body_type === 'animal' && '🐾', localAvatarConfig.body_type === 'abstract' && '🎨'] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: 10, opacity: 0.7 }, children: "Your Avatar" }), _jsxs("div", { style: { fontSize: 11, fontWeight: 'bold' }, children: [localAvatarConfig.body_type.charAt(0).toUpperCase() +
                                                localAvatarConfig.body_type.slice(1), ' ', "\u00B7 ", localAvatarConfig.height, "m"] })] })] })), error && _jsx("p", { style: { margin: 0, fontSize: 11, color: '#f44336' }, children: error }), _jsxs("p", { style: { margin: '8px 0 0 0', fontSize: 12, opacity: 0.8 }, children: ["Entities: ", allEntities.length, " | Players: ", presenceEvents.length] }), _jsxs("div", { style: {
                            marginTop: 12,
                            padding: 8,
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 4,
                            fontSize: 11
                        }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: 4 }, children: "Movement Controls:" }), _jsx("div", { style: { opacity: 0.9 }, children: "W/A/S/D - Move in facing direction" }), _jsx("div", { style: { opacity: 0.9 }, children: "Q/E - Rotate character" }), _jsx("div", { style: { opacity: 0.9 }, children: "Mouse - Rotate camera" }), _jsxs("div", { style: { opacity: 0.9, marginTop: 4 }, children: ["Position: ", playerPosition[0].toFixed(1), ", ", playerPosition[2].toFixed(1)] })] }), _jsx("button", { onClick: addEntity, style: {
                            marginTop: 12,
                            padding: '8px 16px',
                            background: '#4CAF50',
                            border: 'none',
                            borderRadius: 4,
                            color: 'white',
                            cursor: 'pointer'
                        }, children: "Add Entity" }), _jsx("button", { onClick: () => setSettingsVisible(true), style: {
                            marginTop: 8,
                            padding: '8px 16px',
                            background: 'rgba(33, 150, 243, 0.8)',
                            border: 'none',
                            borderRadius: 4,
                            color: 'white',
                            cursor: 'pointer',
                            width: '100%'
                        }, children: "\u2699\uFE0F Settings" }), _jsx("button", { onClick: () => setAvatarConfiguratorVisible(true), style: {
                            marginTop: 8,
                            padding: '8px 16px',
                            background: 'rgba(156, 39, 176, 0.8)',
                            border: 'none',
                            borderRadius: 4,
                            color: 'white',
                            cursor: 'pointer',
                            width: '100%'
                        }, children: "\uD83C\uDFAD Avatar" })] }), chatVisible && (_jsxs("div", { style: {
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
                }, children: [_jsxs("div", { style: {
                            padding: '12px 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }, children: [_jsx("span", { style: { color: 'white', fontSize: 14, fontWeight: 'bold' }, children: "Chat" }), _jsx("button", { onClick: () => setChatVisible(false), style: { background: 'none', border: 'none', color: 'white', cursor: 'pointer' }, children: "\u00D7" })] }), _jsx("div", { style: {
                            flex: 1,
                            overflowY: 'auto',
                            padding: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8
                        }, children: messages.length === 0 ? (_jsx("p", { style: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center' }, children: "No messages yet" })) : (messages.map((msg, i) => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsx("span", { style: { color: 'rgba(255,255,255,0.7)', fontSize: 11 }, children: msg.from }), _jsx("span", { style: { color: 'white', fontSize: 13 }, children: msg.message })] }, i)))) }), _jsx("div", { style: { padding: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }, children: _jsx("input", { type: "text", value: chatInput, onChange: (e) => setChatInput(e.target.value), onKeyPress: handleKeyPress, placeholder: "Type a message...", style: {
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: 4,
                                border: 'none',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                fontSize: 13
                            } }) })] })), !chatVisible && (_jsxs("button", { onClick: () => setChatVisible(true), style: {
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
                }, children: ["\uD83D\uDCAC Chat (", messages.length, ")"] })), _jsx("button", { onClick: () => setEmojiPickerVisible(!emojiPickerVisible), style: {
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
                }, children: "\uD83D\uDE00 Emoji" }), emojiPickerVisible && (_jsx(EmojiPicker, { onSelect: handleSendEmoji, onClose: () => setEmojiPickerVisible(false) })), _jsx("button", { onClick: () => setStorageVisible(!storageVisible), style: {
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
                }, children: storageVisible ? '× Close' : '📦 Assets' }), storageVisible && (_jsxs("div", { style: {
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
                }, children: [_jsxs("div", { style: {
                            padding: '12px 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }, children: [_jsx("span", { style: { color: 'white', fontSize: 16, fontWeight: 'bold' }, children: "Asset Manager" }), _jsx("button", { onClick: () => setStorageVisible(false), style: {
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: 20
                                }, children: "\u00D7" })] }), _jsxs("div", { style: { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }, children: [_jsx("button", { onClick: () => setStorageTab('browse'), style: {
                                    flex: 1,
                                    padding: '12px',
                                    background: storageTab === 'browse' ? 'rgba(33, 150, 243, 0.3)' : 'transparent',
                                    border: 'none',
                                    borderBottom: storageTab === 'browse' ? '2px solid #2196F3' : 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: storageTab === 'browse' ? 'bold' : 'normal'
                                }, children: "Browse" }), _jsx("button", { onClick: () => setStorageTab('upload'), style: {
                                    flex: 1,
                                    padding: '12px',
                                    background: storageTab === 'upload' ? 'rgba(33, 150, 243, 0.3)' : 'transparent',
                                    border: 'none',
                                    borderBottom: storageTab === 'upload' ? '2px solid #2196F3' : 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: storageTab === 'upload' ? 'bold' : 'normal'
                                }, children: "Upload" })] }), _jsx("div", { style: { flex: 1, overflowY: 'auto', padding: 16, background: 'white' }, children: storageTab === 'browse' ? (_jsx(AssetBrowser, { onAssetSelect: setSelectedAsset, selectedAssetId: selectedAsset?.asset_id })) : (_jsx(AssetUploader, { onUploadComplete: (response) => {
                                alert(`Asset uploaded successfully!\nAsset ID: ${response.asset_id}`);
                                setStorageTab('browse');
                            } })) })] })), settingsVisible && _jsx(SettingsPanel, { onClose: () => setSettingsVisible(false) }), _jsx("button", { onClick: () => setPerfOverlayVisible(!perfOverlayVisible), style: {
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
                }, children: perfOverlayVisible ? '📊 Hide Stats' : '⚡ Performance' }), perfOverlayVisible && (_jsxs("div", { style: {
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
                }, children: [_jsx("div", { style: { marginBottom: 16, fontSize: 14, fontWeight: 'bold', color: '#4CAF50' }, children: "Performance Metrics" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }, children: [_jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "FPS:" }), ' ', _jsx("span", { style: { color: '#4CAF50', fontWeight: 'bold' }, children: fpsRef.current.toFixed(1) })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "Entities:" }), ' ', _jsx("span", { style: { color: '#4CAF50', fontWeight: 'bold' }, children: localEntities.size })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "Remote Players:" }), ' ', _jsx("span", { style: { color: '#4CAF50', fontWeight: 'bold' }, children: remotePlayersCountRef.current })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "Network Latency:" }), ' ', _jsxs("span", { style: { color: '#4CAF50', fontWeight: 'bold' }, children: [lastNetworkLatencyRef.current.toFixed(0), "ms"] })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }, children: [_jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "FPS:" }), ' ', _jsx("span", { style: { color: '#4CAF50', fontWeight: 'bold' }, children: fpsRef.current.toFixed(1) })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "Entities:" }), ' ', _jsx("span", { style: { color: '#4CAF50', fontWeight: 'bold' }, children: localEntities.size })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "Remote Players:" }), ' ', _jsx("span", { style: { color: '#4CAF50', fontWeight: 'bold' }, children: remotePlayersCountRef.current })] }), _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "Network Latency:" }), ' ', _jsxs("span", { style: { color: '#4CAF50', fontWeight: 'bold' }, children: [lastNetworkLatencyRef.current.toFixed(0), "ms"] })] })] })] })), avatarConfiguratorVisible && myClientId && (_jsx(AvatarConfigurator, { userId: myClientId, onClose: () => setAvatarConfiguratorVisible(false), onSave: (config) => {
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
                } })), _jsxs(Canvas, { shadows: true, children: [_jsx(InterpolationUpdater, { targetPositionsRef: targetPositionsRef, setInterpolatedPositions: setInterpolatedPositions, interpolationFactor: interpolationFactor }), _jsx(PerspectiveCamera, { makeDefault: true, fov: 60, position: [0, 5, 8] }), _jsx(CameraController, { targetPosition: playerPosition, targetRotation: playerRotation, enabled: true, onCameraRotationChange: (rotation) => (cameraRotation.current = rotation) }), _jsx("ambientLight", { intensity: 0.5 }), _jsx("directionalLight", { position: [10, 10, 5], intensity: 1, castShadow: true, "shadow-mapSize": [2048, 2048] }), _jsx(Grid, { args: [20, 20], cellSize: 1, cellThickness: 0.5, cellColor: "#6f6f6f", sectionSize: 5, sectionThickness: 1, sectionColor: "#9d4b4b", fadeDistance: 30, fadeStrength: 1, followCamera: false, infiniteGrid: true }), _jsxs("mesh", { receiveShadow: true, rotation: [-Math.PI / 2, 0, 0], position: [0, -0.01, 0], children: [_jsx("planeGeometry", { args: [20, 20] }), _jsx("shadowMaterial", { opacity: 0.3 })] }), client && myClientId && currentScene === 'interactive' && (_jsx(InteractiveDemoScene, { wsClient: client, myClientId: myClientId })), client && myClientId && currentScene === 'media' && (_jsx(MediaDemoScene, { wsClient: client, myClientId: myClientId || '' })), client && myClientId && currentScene === 'grab' && (_jsx(GrabDemoScene, { myClientId: myClientId, sendGrabMessage: sendGrabMessage })), client && myClientId && currentScene === 'portal' && (_jsx(PortalDemoScene, { myClientId: myClientId })), client && myClientId && currentScene === 'gestures' && (_jsx(GestureRecognition, { enabled: true, onGestureDetected: (gesture, controllerId) => {
                            console.log(`[Gesture] ${controllerId} controller: ${gesture}`);
                        } })), client && myClientId && currentScene === 'drawing' && (_jsxs(_Fragment, { children: [_jsx(DrawingCanvas, { width: 1024, height: 1024, settings: drawingSettings, onClear: () => console.log('Canvas cleared'), onExport: (dataUrl) => {
                                    const link = document.createElement('a');
                                    link.href = dataUrl;
                                    link.download = `drawing-${Date.now()}.png`;
                                    link.click();
                                } }), _jsx(DrawingTools, { settings: drawingSettings, onSettingsChange: setDrawingSettings, onClear: () => console.log('Clear canvas'), onUndo: () => console.log('Undo'), onExport: () => {
                                    const canvas = document.querySelector('canvas');
                                    if (canvas) {
                                        const dataUrl = canvas.toDataURL('image/png');
                                        const link = document.createElement('a');
                                        link.href = dataUrl;
                                        link.download = `drawing-${Date.now()}.png`;
                                        link.click();
                                    }
                                } })] })), client && myClientId && (_jsx(GrabDemoScene, { myClientId: myClientId, sendGrabMessage: sendGrabMessage })), allEntities.map((entity) => entity.isPlayer ? (entity.avatarConfig ? (_jsx(NetworkedAvatar, { position: entity.position, rotation: entity.rotation, displayName: entity.displayName || 'Unknown', avatarConfig: entity.avatarConfig }, entity.id)) : (_jsx(PlayerAvatar, { position: entity.position, rotation: entity.rotation, displayName: entity.displayName || 'Unknown' }, entity.id))) : (_jsxs("mesh", { position: entity.position, rotation: entity.rotation, scale: entity.scale, castShadow: true, receiveShadow: true, onClick: () => setSelectedId(entity.id), children: [_jsx("boxGeometry", { args: [1, 1, 1] }), _jsx("meshStandardMaterial", { color: selectedId === entity.id ? '#4CAF50' : '#2196F3', roughness: 0.5, metalness: 0.5 })] }, entity.id))), Array.from(floatingEmojis.values()).map((emojiData) => (_jsx(FloatingEmoji, { emoji: emojiData.emoji, position: emojiData.position, onComplete: () => {
                            setFloatingEmojis((prev) => {
                                const updated = new Map(prev);
                                updated.delete(emojiData.id);
                                return updated;
                            });
                        } }, emojiData.id)))] }), _jsx(FPSCounter, {}), _jsx(SceneSelector, { currentScene: currentScene, onSceneChange: setCurrentScene }), _jsx(SceneSelector, { currentScene: currentScene, onSceneChange: setCurrentScene }), _jsx(RoomButton, { currentRoomId: roomManager.currentRoomId || undefined, onOpenBrowser: () => roomManager.setShowBrowser(true), onOpenSettings: () => roomManager.setShowSettings(true), onLeaveRoom: roomManager.handleLeaveRoom }), _jsx(RoomBrowser, { isOpen: roomManager.showBrowser, onClose: () => roomManager.setShowBrowser(false), onJoinRoom: roomManager.handleJoinRoom, onCreateRoom: () => roomManager.setShowCreateRoom(true), currentUserId: myClientId || '', storageVisible: storageVisible }), _jsx(CreateRoomModal, { isOpen: roomManager.showCreateRoom, onClose: () => roomManager.setShowCreateRoom(false), onCreateRoom: roomManager.handleCreateRoom }), roomManager.showSettings && roomManager.roomSettings && (_jsx(RoomSettingsPanel, { isOpen: roomManager.showSettings, onClose: () => roomManager.setShowSettings(false), roomSettings: roomManager.roomSettings, participants: roomManager.participants, currentUserId: myClientId || '', onLeaveRoom: roomManager.handleLeaveRoom, onKickParticipant: roomManager.handleKickParticipant, onMuteParticipant: roomManager.handleMuteParticipant, onToggleHost: roomManager.handleToggleHost }))] }));
}
export default App;
