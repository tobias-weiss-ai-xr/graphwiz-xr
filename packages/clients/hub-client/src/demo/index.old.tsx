// @ts-nocheck - Deprecated demo file with outdated API usage
/**
 * GraphWiz-XR Demo Scene
 *
 * Comprehensive demo showcasing:
 * - WebSocket networking
 * - VR controller input
 * - Voice chat with spatial audio
 * - Multi-user presence
 * - Entity synchronization
 * - Object interaction
 */

import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Engine } from '../core';
import { TransformComponent } from '../ecs';
import { NetworkClient, NetworkSystem } from '../network';
import { XRInputManager, XRInputSystem, VRInteractableComponent } from '../xr';
import { VoiceChatClient, VoiceSystem } from '../voice';
import * as THREE from 'three';

interface DemoState {
  connected: boolean;
  vrEnabled: boolean;
  voiceConnected: boolean;
  participants: number;
  isMuted: boolean;
  isSpeaking: boolean;
  userCount: number;
  error: string | null;
}

export function GraphWizXRDemo() {
  const [state, setState] = useState<DemoState>({
    connected: false,
    vrEnabled: false,
    voiceConnected: false,
    participants: 0,
    isMuted: false,
    isSpeaking: false,
    userCount: 0,
    error: null,
  });

  const engineRef = useRef<Engine | null>(null);
  const networkClientRef = useRef<NetworkClient | null>(null);
  const xrInputManagerRef = useRef<XRInputManager | null>(null);
  const voiceClientRef = useRef<VoiceChatClient | null>(null);

  // Initialize demo
  useEffect(() => {
    initializeDemo();
    return () => cleanupDemo();
  }, []);

  const initializeDemo = async () => {
    console.log('=== GraphWiz-XR Demo Initializing ===\n');

    try {
      // 1. Create Engine
      console.log('1. Creating engine...');
      const engine = new Engine();
      engineRef.current = engine;
      console.log('✓ Engine created');

      // 2. Connect to Presence service
      console.log('\n2. Connecting to Presence service...');
      const networkClient = new NetworkClient({
        presenceUrl: 'ws://localhost:8013',
        sfuUrl: 'http://localhost:8014',
        roomId: 'demo-room',
        authToken: 'demo-token',
        userId: `demo-user-${Math.floor(Math.random() * 1000)}`,
        displayName: 'Demo User',
      });
      networkClientRef.current = networkClient;

      await networkClient.connect();
      console.log('✓ Connected to Presence service');
      setState(prev => ({ ...prev, connected: true }));

      // Listen for network events
      networkClient.on(40 as any, (message: any) => {
        console.log('→ User joined:', message.payload?.clientId);
        setState(prev => ({ ...prev, userCount: prev.userCount + 1 }));
      });

      networkClient.on(41 as any, (message: any) => {
        console.log('← User left:', message.payload?.clientId);
        setState(prev => ({ ...prev, userCount: Math.max(0, prev.userCount - 1) }));
      });

      // 3. Add Network System to engine
      const networkSystem = new NetworkSystem(networkClient);
      engine.addSystem(networkSystem);
      console.log('✓ Network system added');

      // 4. Initialize VR input
      console.log('\n3. Initializing VR input...');
      const xrInputManager = new XRInputManager({
        autoEnable: true,
      });
      xrInputManagerRef.current = xrInputManager;

      // Check for VR support
      const xrSupported = await navigator.xr?.isSessionSupported('immersive-vr');
      if (xrSupported) {
        setState(prev => ({ ...prev, vrEnabled: true }));
        console.log('✓ VR supported');

        // Setup VR event listeners
        xrInputManager.on('controllerConnected', (controllerId, controllerState) => {
          console.log(`✓ Controller connected: ${controllerId} (${controllerState.handedness})`);
        });

        xrInputManager.on('buttonPressed', (buttonName, controllerId) => {
          console.log(`→ Button pressed: ${buttonName} on ${controllerId}`);
          // Provide haptic feedback
          xrInputManager.triggerHapticPulse(controllerId, 0.3);
        });
      } else {
        console.log('⚠ VR not supported, running in desktop mode');
      }

      const xrInputSystem = new XRInputSystem(xrInputManager, {
        enableHapticFeedback: true,
        hapticStrength: 0.5,
      });
      engine.addSystem(xrInputSystem);
      console.log('✓ VR input system added');

      // 5. Initialize Voice Chat
      console.log('\n4. Connecting to Voice Chat...');
      const voiceClient = new VoiceChatClient({
        sfuUrl: 'http://localhost:8014',
        roomId: 'demo-room',
        userId: `demo-user-${Math.floor(Math.random() * 1000)}`,
        authToken: 'demo-token',
      });
      voiceClientRef.current = voiceClient;

      try {
        await voiceClient.connect();
        console.log('✓ Connected to Voice Chat');
        setState(prev => ({ ...prev, voiceConnected: true }));

        // Voice events
        voiceClient.on('startedSpeaking', () => {
          setState(prev => ({ ...prev, isSpeaking: true }));
          console.log('→ You started speaking');
        });

        voiceClient.on('stoppedSpeaking', () => {
          setState(prev => ({ ...prev, isSpeaking: false }));
          console.log('← You stopped speaking');
        });

        voiceClient.on('userJoined', (userId) => {
          console.log(`✓ User joined voice: ${userId}`);
          setState(prev => ({ ...prev, participants: prev.participants + 1 }));
        });
      } catch (voiceError) {
        console.warn('⚠ Voice chat unavailable:', voiceError);
        setState(prev => ({ ...prev, error: 'Voice chat unavailable' }));
      }

      const voiceSystem = new VoiceSystem(voiceClient, {
        maxDistance: 10,
        spatialAudioEnabled: true,
        voiceActivityEnabled: true,
      });
      engine.addSystem(voiceSystem);
      console.log('✓ Voice system added');

      // 6. Create demo entities
      console.log('\n5. Creating demo entities...');
      createDemoEntities(engine, networkSystem, xrInputSystem);
      console.log('✓ Demo entities created');

      // 7. Start engine
      console.log('\n6. Starting engine...');
      engine.start();
      console.log('✓ Engine started');

      console.log('\n=== Demo Ready! ===');
      console.log('Controls:');
      console.log('  - WASD: Move (desktop mode)');
      console.log('  - Mouse: Look around (desktop mode)');
      console.log('  - VR Controllers: Full tracking');
      console.log('  - Grip Button: Grab objects');
      console.log('  - Trigger: Interact with objects');
      console.log('  - Thumbstick: Move/Teleport');
      console.log('  - M: Toggle voice chat mute');
      console.log('  - Space: Jump (desktop mode)');

    } catch (error) {
      console.error('✗ Demo initialization failed:', error);
      setState(prev => ({ ...prev, error: (error as Error).message }));
    }
  };

  const createDemoEntities = (
    engine: Engine,
    networkSystem: NetworkSystem,
    xrInputManager: XRInputManager
  ) => {
    const world = engine.getWorld();

    // Create player entity
    const player = world.createEntity();
    const playerTransform = new TransformComponent();
    playerTransform.position.set(0, 0, 0);
    player.addComponent(TransformComponent, playerTransform);

    // Create demo room (floor)
    const floor = world.createEntity();
    const floorTransform = new TransformComponent();
    floorTransform.position.set(0, -0.5, 0);
    floorTransform.rotation.set(-Math.PI / 2, 0, 0);
    floorTransform.scale.set(10, 10, 10);
    floor.addComponent(TransformComponent, floorTransform);

    // Create grabbable cubes
    for (let i = 0; i < 5; i++) {
      const cube = world.createEntity();
      const transform = new TransformComponent();
      transform.position.set(
        (Math.random() - 0.5) * 4,
        1 + Math.random() * 2,
        -2 - Math.random() * 3
      );
      transform.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      cube.addComponent(TransformComponent, transform);

      // Make grabbable
      const interactable = new VRInteractableComponent({
        interactable: true,
        grabbable: true,
        throwable: true,
        highlightOnHover: true,
      });
      cube.addComponent(VRInteractableComponent, interactable);

      // Create networked entity
      networkSystem.createNetworkedEntity('cube', transform.position, {
        color: `hsl(${i * 60}, 70%, 50%)`,
        size: 0.5,
      });
    }

    // Create voice indicator entity
    const voiceIndicator = world.createEntity();
    const indicatorTransform = new TransformComponent();
    indicatorTransform.position.set(0, 2, 0);
    voiceIndicator.addComponent(TransformComponent, indicatorTransform);

    // Listen for grab events
    xrInputManager.on('entityGrabbed', (entityId) => {
      console.log('✓ Entity grabbed:', entityId);
      // Could add visual feedback here
    });

    xrInputManager.on('entityThrown', (entityId, controllerId, velocity) => {
      console.log('✓ Entity thrown:', entityId, 'velocity:', velocity);
      // Show throw strength
    });
  };

  const cleanupDemo = () => {
    console.log('\n=== Cleaning up demo ===');

    if (voiceClientRef.current) {
      voiceClientRef.current.disconnect();
    }

    if (networkClientRef.current) {
      networkClientRef.current.disconnect();
    }

    if (xrInputManagerRef.current) {
      xrInputManagerRef.current.dispose();
    }

    if (engineRef.current) {
      engineRef.current.stop();
    }

    console.log('✓ Cleanup complete');
  };

  // UI Controls
  const handleToggleMute = () => {
    if (voiceClientRef.current) {
      const newMutedState = voiceClientRef.current.toggleMute();
      setState(prev => ({ ...prev, isMuted: newMutedState }));
      console.log(`Voice ${newMutedState ? 'muted' : 'unmuted'}`);
    }
  };

  const handleEnterVR = async () => {
    if (!xrInputManagerRef.current) return;

    try {
      const session = await navigator.xr!.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
      });

      const referenceSpace = await session.requestReferenceSpace('local-floor');
      await xrInputManagerRef.current.initialize(session, referenceSpace);

      console.log('✓ Entered VR mode');

      // Render loop
      const onXRFrame = (time: XRFrameSyncEvent, frame: XRFrame) => {
        if (xrInputManagerRef.current) {
          xrInputManagerRef.current.update(frame, referenceSpace);
        }
        if (engineRef.current) {
          engineRef.current.update(0.016);
        }
        session.requestAnimationFrame(onXRFrame);
      };

      session.requestAnimationFrame(onXRFrame);
    } catch (error) {
      console.error('Failed to enter VR:', error);
      setState(prev => ({ ...prev, error: 'VR entry failed' }));
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 1.6, 3], fov: 75 }}
        style={{ background: '#87CEEB' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[0, 10, 0]} intensity={0.5} />

        {/* Demo Scene Components */}
        <DemoSceneComponents engine={engineRef.current} />
      </Canvas>

      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        padding: 15,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        borderRadius: 8,
        fontFamily: 'monospace',
        fontSize: 14,
        maxWidth: 300,
      }}>
        <h2>🎮 GraphWiz-XR Demo</h2>
        <div style={{ margin: '10px 0' }}>
          <div>📡 Connected: {state.connected ? '✓' : '✗'}</div>
          <div>🥽 VR: {state.vrEnabled ? '✓' : '✗'}</div>
          <div>🎤 Voice: {state.voiceConnected ? '✓' : '✗'}</div>
          <div>👥 Users: {state.userCount}</div>
          <div style={{ marginTop: 10 }}>
            Muted: {state.isMuted ? '🔇' : '🎤'}
          </div>
          <div style={{ marginTop: 10 }}>
            Speaking: {state.isSpeaking ? '💬' : '🤐'}
          </div>
        </div>

        <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid white' }}>
          <div style={{ marginBottom: 10 }}>
            <button
              onClick={handleEnterVR}
              disabled={!state.vrEnabled}
              style={{
                padding: '8px 16px',
                marginRight: '5px',
                cursor: state.vrEnabled ? 'pointer' : 'not-allowed',
                background: state.vrEnabled ? '#4CAF50' : '#666',
                color: 'white',
                border: 'none',
                borderRadius: 4,
              }}
            >
              Enter VR
            </button>
            <button
              onClick={handleToggleMute}
              disabled={!state.voiceConnected}
              style={{
                padding: '8px 16px',
                cursor: state.voiceConnected ? 'pointer' : 'not-allowed',
                background: state.voiceConnected ? '#2196F3' : '#666',
                color: 'white',
                border: 'none',
                borderRadius: 4,
              }}
            >
              {state.isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>

          {state.error && (
            <div style={{ color: '#ff6b6b', marginTop: 10 }}>
              ⚠️ {state.error}
            </div>
          )}
        </div>

        <div style={{ marginTop: 15, fontSize: 12 }}>
          <div style={{ marginBottom: 5 }}>Controls:</div>
          <div>WASD: Move</div>
          <div>Space: Jump</div>
          <div>Grip: Grab</div>
          <div>Trigger: Interact</div>
          <div>M: Toggle mute</div>
        </div>
      </div>

      {/* Voice Activity Indicator */}
      {state.isSpeaking && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          padding: '10px 20px',
          background: 'rgba(76, 175, 80, 0.9)',
          color: 'white',
          borderRadius: 20,
          fontFamily: 'monospace',
        }}>
          🎤 Speaking...
        </div>
      )}
    </div>
  );
}

// Demo scene components (placeholder for actual 3D objects)
function DemoSceneComponents({ engine }: { engine: Engine | null }) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* Demo cubes */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 4,
            1 + Math.random() * 2,
            -2 - Math.random() * 3,
          ]}
          castShadow
        >
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={`hsl(${i * 60}, 70%, 50%)`} />
        </mesh>
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <directionalLight position={[0, 10, 0]} intensity={0.5} />
    </group>
  );
}

export default GraphWizXRDemo;
