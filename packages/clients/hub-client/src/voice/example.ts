/**
 * Voice Chat Examples
 *
 * Demonstrates how to use the WebRTC voice chat system for spatial audio.
 */

import { Engine } from '../core';
import { VoiceChatClient, VoiceSystem, VoiceLocalComponent } from '../voice';
import { TransformComponent } from '../ecs/entity';
import type { NetworkClient } from '../network';
import type { NetworkSystem } from '../network';

/**
 * Example 1: Basic Voice Chat Setup
 *
 * Shows how to initialize voice chat and connect to SFU
 */
export async function basicVoiceChatSetup() {
  console.log('=== Basic Voice Chat Setup ===\n');

  // Create voice chat client
  const voiceClient = new VoiceChatClient({
    sfuUrl: 'http://localhost:8014',
    roomId: 'voice-room-1',
    userId: 'user-123',
    authToken: 'your-auth-token',
  });

  try {
    // Connect to SFU
    await voiceClient.connect();
    console.log('✓ Connected to voice chat');
    console.log('✓ Microphone active');

    // Check stats
    const stats = voiceClient.getStats();
    console.log('Stats:', stats);

    // Mute yourself
    voiceClient.setMuted(true);
    console.log('✓ Muted');

    // Unmute
    voiceClient.setMuted(false);
    console.log('✓ Unmuted');

    // Disconnect when done
    // await voiceClient.disconnect();
  } catch (error) {
    console.error('✗ Voice chat connection failed:', error);
  }
}

/**
 * Example 2: Voice Chat with ECS Integration
 *
 * Shows how to integrate voice chat with the game engine
 */
export async function voiceChatWithECS() {
  console.log('=== Voice Chat with ECS ===\n');

  const engine = new Engine();

  // Create network system for position sync
  const networkClient = new (await import('../network')).NetworkClient({
    presenceUrl: 'ws://localhost:8013',
    sfuUrl: 'http://localhost:8014',
    roomId: 'room-1',
    authToken: 'token',
    userId: 'user-1',
    displayName: 'Player 1',
  });

  await networkClient.connect();

  const { NetworkSystem } = await import('../network');
  const networkSystem = new NetworkSystem(networkClient);
  engine.addSystem(networkSystem);

  // Create voice chat client
  const voiceClient = new VoiceChatClient({
    sfuUrl: 'http://localhost:8014',
    roomId: 'room-1',
    userId: 'user-1',
    authToken: 'token',
  });

  await voiceClient.connect();

  // Create voice system
  const voiceSystem = new VoiceSystem(voiceClient, {
    maxDistance: 10,
    spatialAudioEnabled: true,
    voiceActivityEnabled: true,
  });

  engine.addSystem(voiceSystem);

  // Listen for voice events
  voiceSystem.on('voiceParticipantCreated', (entityId, userId) => {
    console.log(`✓ Voice participant joined: ${userId} (entity: ${entityId})`);

    // The entity's position will be synced by network system
    // Audio will be spatialized based on entity position
  });

  voiceSystem.on('localUserStartedSpeaking', () => {
    console.log('→ You started speaking');
    // Could show speaking indicator here
  });

  voiceSystem.on('localUserStoppedSpeaking', () => {
    console.log('← You stopped speaking');
  });

  // Create local player entity
  const player = engine.getWorld().createEntity();
  const transform = new TransformComponent();
  transform.position.set(0, 0, 0);
  player.addComponent(TransformComponent, transform);

  const localVoice = new VoiceLocalComponent();
  player.addComponent(VoiceLocalComponent, localVoice);

  engine.start();

  console.log('✓ Voice chat integrated with ECS');
  console.log('✓ Spatial audio enabled');
  console.log('✓ Voice activity detection active');
}

/**
 * Example 3: Push-to-Talk
 *
 * Shows how to implement push-to-talk functionality
 */
export async function pushToTalkExample() {
  console.log('=== Push-to-Talk Example ===\n');

  const voiceClient = new VoiceChatClient({
    sfuUrl: 'http://localhost:8014',
    roomId: 'room-2',
    userId: 'user-2',
    authToken: 'token',
  });

  await voiceClient.connect();

  const engine = new Engine();
  const voiceSystem = new VoiceSystem(voiceClient);
  engine.addSystem(voiceSystem);

  // Create local player with push-to-talk
  const player = engine.getWorld().createEntity();
  const transform = new TransformComponent();
  player.addComponent(TransformComponent, transform);

  const localVoice = new VoiceLocalComponent({
    pushToTalk: true,
    voiceActivityDetection: false, // Disable VAD for push-to-talk
  });
  player.addComponent(VoiceLocalComponent, localVoice);

  // Push-to-talk with keyboard
  let pttActive = false;

  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !pttActive) {
      // Start talking
      voiceClient.setMuted(false);
      pttActive = true;
      console.log('→ Push-to-talk activated (hold SPACE)');
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.code === 'Space' && pttActive) {
      // Stop talking
      voiceClient.setMuted(true);
      pttActive = false;
      console.log('← Push-to-talk released');
    }
  });

  // Or use VR controller button
  // (requires XR input system)
  const { XRInputManager } = await import('../xr');
  const xrInputManager = new XRInputManager();
  // ... setup VR ...

  xrInputManager.on('gripPressed', (controllerId: string) => {
    if (controllerId === 'right') {
      voiceClient.setMuted(false);
      console.log('→ VR push-to-talk activated (hold grip)');
    }
  });

  xrInputManager.on('gripReleased', (controllerId: string) => {
    if (controllerId === 'right') {
      voiceClient.setMuted(true);
      console.log('← VR push-to-talk released');
    }
  });

  console.log('✓ Push-to-talk configured');
  console.log('  Hold SPACE or right grip button to talk');
}

/**
 * Example 4: Spatial Audio
 *
 * Shows how spatial audio works with 3D positioning
 */
export async function spatialAudioExample() {
  console.log('=== Spatial Audio Example ===\n');

  const engine = new Engine();
  const voiceClient = new VoiceChatClient({
    sfuUrl: 'http://localhost:8014',
    roomId: 'room-3',
    userId: 'user-3',
    authToken: 'token',
  });

  await voiceClient.connect();

  const voiceSystem = new VoiceSystem(voiceClient, {
    maxDistance: 10,
    spatialAudioEnabled: true,
  });

  engine.addSystem(voiceSystem);

  // Simulate a remote user
  const remoteUserId = 'remote-user-1';
  voiceSystem.on('voiceParticipantCreated', (entityId) => {
    const entity = engine.getWorld().getEntity(entityId);
    if (entity) {
      const transform = entity.getComponent(TransformComponent);
      if (transform) {
        // Position them 3 meters away
        transform.position.set(0, 0, -3);

        console.log(`✓ Remote user at:`, transform.position);
        console.log('  You should hear them from the front');
      }
    }
  });

  // Animate movement to demonstrate spatial audio
  let angle = 0;
  const updateSpatialPosition = () => {
    const remoteEntityId = voiceSystem.getParticipantEntityId(remoteUserId);
    if (remoteEntityId) {
      const entity = engine.getWorld().getEntity(remoteEntityId);
      if (entity) {
        const transform = entity.getComponent(TransformComponent);
        if (transform) {
          // Circle around the player
          angle += 0.01;
          transform.position.x = Math.sin(angle) * 3;
          transform.position.z = Math.cos(angle) * 3;

          // Volume attenuates with distance automatically
        }
      }
    }
    requestAnimationFrame(updateSpatialPosition);
  };

  console.log('✓ Spatial audio enabled');
  console.log('  Audio will be positioned in 3D space');
  console.log('  Volume decreases with distance');
}

/**
 * Example 5: Volume Control Per User
 *
 * Shows how to adjust volume for individual users
 */
export async function volumeControlExample() {
  console.log('=== Volume Control Example ===\n');

  const voiceClient = new VoiceChatClient({
    sfuUrl: 'http://localhost:8014',
    roomId: 'room-4',
    userId: 'user-4',
    authToken: 'token',
  });

  await voiceClient.connect();

  const voiceSystem = new VoiceSystem(voiceClient);

  // Set volume for specific user
  const userId = 'loud-user';
  const volume = 0.5; // 50% volume

  voiceSystem.setParticipantVolume(userId, volume);
  console.log(`✓ Set ${userId} volume to ${volume * 100}%`);

  // Mute specific user
  voiceSystem.setParticipantVolume(userId, 0);
  console.log(`✓ Muted ${userId}`);

  // Unmute
  voiceSystem.setParticipantVolume(userId, 1.0);
  console.log(`✓ Unmuted ${userId}`);
}

/**
 * Example 6: Voice Activity Detection
 *
 * Shows how to use voice activity detection for visual indicators
 */
export async function voiceActivityExample() {
  console.log('=== Voice Activity Detection Example ===\n');

  const voiceClient = new VoiceChatClient({
    sfuUrl: 'http://localhost:8014',
    roomId: 'room-5',
    userId: 'user-5',
    authToken: 'token',
  });

  await voiceClient.connect();

  const voiceSystem = new VoiceSystem(voiceClient, {
    voiceActivityEnabled: true,
  });

  // Listen for speaking events
  voiceSystem.on('localUserStartedSpeaking', () => {
    console.log('→ YOU ARE SPEAKING');
    // Show visual indicator (e.g., green icon)
    updateVoiceIndicator(true);
  });

  voiceSystem.on('localUserStoppedSpeaking', () => {
    console.log('← You stopped speaking');
    // Hide visual indicator
    updateVoiceIndicator(false);
  });

  // Listen for remote users speaking
  voiceSystem.on('userStartedSpeaking', (userId, entityId) => {
    console.log(`→ ${userId} is speaking`);
    // Show speaking indicator above their avatar
  });

  voiceSystem.on('userStoppedSpeaking', (userId, entityId) => {
    console.log(`← ${userId} stopped speaking`);
    // Hide speaking indicator
  });

  // Get current audio level
  setInterval(() => {
    const stats = voiceClient.getStats();
    if (stats.audioLevel > 0.01) {
      console.log(`Audio level: ${(stats.audioLevel * 100).toFixed(1)}%`);
    }
  }, 1000);

  console.log('✓ Voice activity detection enabled');
  console.log('  Adjust threshold with: voiceClient.setVoiceActivityThreshold(0.05)');
}

/**
 * Helper: Update voice indicator UI
 */
function updateVoiceIndicator(isSpeaking: boolean) {
  // Update UI element (e.g., show/hide speaking icon)
  const indicator = document.getElementById('voice-indicator');
  if (indicator) {
    indicator.style.display = isSpeaking ? 'block' : 'none';
    indicator.style.backgroundColor = isSpeaking ? 'green' : 'gray';
  }
}

/**
 * Example 7: React Integration
 *
 * Shows how to use voice chat in a React component
 */
export function createVoiceChatHook(config: {
  sfuUrl: string;
  roomId: string;
  userId: string;
  authToken: string;
}) {
  return () => {
    const [isConnected, setIsConnected] = React.useState(false);
    const [isMuted, setIsMuted] = React.useState(false);
    const [participants, setParticipants] = React.useState<string[]>([]);
    const [isSpeaking, setIsSpeaking] = React.useState(false);
    const [voiceClient, setVoiceClient] = React.useState<VoiceChatClient | null>(null);

    React.useEffect(() => {
      const client = new VoiceChatClient(config);
      setVoiceClient(client);

      // Connect
      client.connect().then(() => {
        setIsConnected(true);
      });

      // Listen for participants
      client.on('userJoined', (userId) => {
        setParticipants(prev => [...prev, userId]);
      });

      // Listen for speaking events
      client.on('startedSpeaking', () => {
        setIsSpeaking(true);
      });

      client.on('stoppedSpeaking', () => {
        setIsSpeaking(false);
      });

      return () => {
        client.disconnect();
      };
    }, []);

      const toggleMute = () => {
        if (voiceClient) {
          const newMutedState = voiceClient.toggleMute();
          setIsMuted(newMutedState);
        }
      };

      const setParticipantVolume = (userId: string, volume: number) => {
        if (voiceClient) {
          voiceClient.setRemoteVolume(userId, volume);
        }
      };

      return {
        isConnected,
        isMuted,
        participants,
        isSpeaking,
        toggleMute,
        setParticipantVolume,
        voiceClient,
      };
    };
}

import React from 'react';

/**
 * Usage example in React:
 *
 * ```tsx
 * function VoiceChatUI() {
 *   const { isConnected, isMuted, participants, toggleMute } = createVoiceChatHook({
 *     sfuUrl: 'http://localhost:8014',
 *     roomId: 'room-1',
 *     userId: 'user-1',
 *     authToken: token,
 *   })();
 *
 *   return (
 *     <div>
 *       <button onClick={toggleMute}>
 *         {isMuted ? 'Unmute' : 'Mute'}
 *       </button>
 *       <div>Participants: {participants.length}</div>
 *       <ul>
 *         {participants.map(id => (
 *           <li key={id}>{id}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */

export default {
  basicVoiceChatSetup,
  voiceChatWithECS,
  pushToTalkExample,
  spatialAudioExample,
  volumeControlExample,
  voiceActivityExample,
  createVoiceChatHook,
};
