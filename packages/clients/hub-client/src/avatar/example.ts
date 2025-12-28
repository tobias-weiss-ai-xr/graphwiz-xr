/**
 * Avatar System Examples
 *
 * Demonstrates how to use the avatar system for user representation.
 */

import { Engine } from '../core';
import { AvatarSystem, AvatarComponent } from '../avatar';
import { TransformComponent } from '../ecs';
import { Vector3, Euler } from 'three';

/**
 * Example 1: Basic Avatar Setup
 *
 * Shows how to create a local player avatar.
 */
export async function basicAvatarSetup() {
  console.log('=== Basic Avatar Setup ===\n');

  const engine = new Engine();
  const avatarSystem = new AvatarSystem({
    updateRate: 30,
    enableInterpolation: true,
    hideLocalAvatar: true,
  });

  engine.getWorld().addSystem(avatarSystem);

  // Create local player avatar
  const localAvatarId = avatarSystem.createLocalAvatar(
    'user-123',
    'Player 1',
    {
      bodyType: 'humanoid',
      primaryColor: '#4a90e2',
      height: 1.7,
    }
  );

  console.log('✓ Created local avatar');
  console.log(`  Entity ID: ${localAvatarId}`);
  console.log('  - Humanoid body type');
  console.log('  - Height: 1.7m');
  console.log('  - Hidden in VR mode');

  engine.start();
}

/**
 * Example 2: Avatar Customization
 *
 * Shows how to customize avatar appearance.
 */
export async function avatarCustomization() {
  console.log('=== Avatar Customization ===\n');

  const engine = new Engine();
  const avatarSystem = new AvatarSystem();
  engine.getWorld().addSystem(avatarSystem);

  // Create robot avatar
  const robotAvatarId = avatarSystem.createLocalAvatar(
    'user-456',
    'Robot Player',
    {
      bodyType: 'robot',
      primaryColor: '#ff6b6b',
      secondaryColor: '#4ecdc4',
      height: 1.8,
      hasHat: true,
    }
  );

  console.log('✓ Created robot avatar');
  console.log('  - Metallic body with glowing eyes');
  console.log('  - Primary color: Red');
  console.log('  - Secondary color: Teal');
  console.log('  - Height: 1.8m');
}

/**
 * Example 3: Multiple Avatars
 *
 * Shows how to manage multiple avatars (local + remote).
 */
export async function multipleAvatars() {
  console.log('=== Multiple Avatars ===\n');

  const engine = new Engine();
  const avatarSystem = new AvatarSystem({
    enableInterpolation: true,
    interpolationDelay: 100,
  });

  engine.getWorld().addSystem(avatarSystem);

  // Create local avatar
  avatarSystem.createLocalAvatar('user-789', 'Local Player', {
    bodyType: 'humanoid',
    primaryColor: '#9b59b6',
  });

  // Simulate remote users joining
  const remoteUsers = [
    {
      userId: 'user-001',
      displayName: 'Alice',
      headPosition: { x: 2, y: 0, z: 0 },
      customization: {
        bodyType: 'humanoid',
        primaryColor: '#e74c3c',
        shirtColor: '#e74c3c',
      },
    },
    {
      userId: 'user-002',
      displayName: 'Bob',
      headPosition: { x: -2, y: 0, z: 0 },
      customization: {
        bodyType: 'humanoid',
        primaryColor: '#3498db',
        shirtColor: '#3498db',
      },
    },
  ];

  remoteUsers.forEach((user) => {
    avatarSystem.createRemoteAvatar(user);
    console.log(`✓ Remote user joined: ${user.displayName}`);
  });

  console.log(`\nTotal avatars: ${avatarSystem.getAvatarCount()}`);
}

/**
 * Example 4: Avatar Emotes
 *
 * Shows how to trigger avatar emotes.
 */
export async function avatarEmotes() {
  console.log('=== Avatar Emotes ===\n');

  const engine = new Engine();
  const avatarSystem = new AvatarSystem();
  engine.getWorld().addSystem(avatarSystem);

  // Create avatar
  avatarSystem.createLocalAvatar('user-321', 'Emoting Player', {
    bodyType: 'humanoid',
    hasHat: true,
  });

  // Trigger emotes
  const emotes = ['wave', 'nod', 'shake', 'jump', 'dance'];

  let emoteIndex = 0;

  const playNextEmote = () => {
    if (emoteIndex < emotes.length) {
      const emote = emotes[emoteIndex];
      console.log(`Playing emote: ${emote}`);
      avatarSystem.triggerEmote(emote, 2000);

      emoteIndex++;
      setTimeout(playNextEmote, 3000);
    }
  };

  setTimeout(playNextEmote, 1000);

  console.log('✓ Emote sequence started');
  console.log('  Playing: wave, nod, shake, jump, dance');
}

/**
 * Example 5: VR Avatar Tracking
 *
 * Shows how to integrate with VR input system.
 */
export async function vrAvatarTracking() {
  console.log('=== VR Avatar Tracking ===\n');

  const engine = new Engine();
  const avatarSystem = new AvatarSystem({
    hideLocalAvatar: true,
  });

  engine.getWorld().addSystem(avatarSystem);

  // Import VR input manager
  const { XRInputManager } = await import('../xr');
  const xrInputManager = new XRInputManager();

  // Set up VR input manager
  avatarSystem.setXRInputManager(xrInputManager);

  // Create local avatar
  avatarSystem.createLocalAvatar('user-vr', 'VR Player', {
    bodyType: 'humanoid',
    style: 'realistic',
  });

  // Track controller input
  xrInputManager.on('controllerConnected', (controllerId, state) => {
    console.log(`✓ Controller connected: ${controllerId} (${state.handedness})`);

    // Avatar will track controller positions
    // Left hand tracks left controller
    // Right hand tracks right controller
  });

  xrInputManager.on('buttonPressed', (buttonName, controllerId) => {
    console.log(`Button pressed: ${buttonName} on ${controllerId}`);

    // Trigger emotes on button press
    if (buttonName === 'a' && controllerId === 'right') {
      avatarSystem.triggerEmote('wave');
    }
  });

  console.log('✓ VR tracking enabled');
  console.log('  - Avatar tracks HMD position');
  console.log('  - Hands track controllers');
  console.log('  - Avatar hidden in VR (first-person view)');
}

/**
 * Example 6: Network Synchronized Avatars
 *
 * Shows how to sync avatars over network.
 */
export async function networkSynchronizedAvatars() {
  console.log('=== Network Synchronized Avatars ===\n');

  const engine = new Engine();
  const avatarSystem = new AvatarSystem({
    enableInterpolation: true,
    updateRate: 30,
  });

  engine.getWorld().addSystem(avatarSystem);

  // Import network client
  const { NetworkClient } = await import('../network');

  const networkClient = new NetworkClient({
    presenceUrl: 'ws://localhost:8013',
    sfuUrl: 'http://localhost:8014',
    roomId: 'avatar-room',
    authToken: 'demo-token',
    userId: 'user-network',
    displayName: 'Network Player',
  });

  await networkClient.connect();

  // Set network client
  avatarSystem.setNetworkClient(networkClient);

  // Create local avatar
  avatarSystem.createLocalAvatar('user-network', 'Network Player', {
    bodyType: 'humanoid',
    primaryColor: '#f39c12',
  });

  // Listen for events
  networkClient.on('connected', () => {
    console.log('✓ Connected to network');

    // Broadcast local avatar
    networkClient.send({
      type: 'avatar_join',
      payload: {
        userId: 'user-network',
        displayName: 'Network Player',
        customization: {
          bodyType: 'humanoid',
          primaryColor: '#f39c12',
        },
      },
    } as any);
  });

  networkClient.on('user_joined', (data: any) => {
    console.log(`✓ Remote user joined: ${data.displayName}`);
    // Avatar system automatically creates remote avatar
  });

  console.log('✓ Network sync enabled');
  console.log('  - Avatars sync over network');
  console.log('  - Interpolation for smooth movement');
  console.log('  - 30 updates per second');
}

/**
 * Example 7: Abstract Avatars
 *
 * Shows how to use abstract/minimal avatars.
 */
export async function abstractAvatars() {
  console.log('=== Abstract Avatars ===\n');

  const engine = new Engine();
  const avatarSystem = new AvatarSystem();
  engine.getWorld().addSystem(avatarSystem);

  // Create abstract avatars with different colors
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

  colors.forEach((color, index) => {
    const angle = (index / colors.length) * Math.PI * 2;
    const radius = 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // Create as "remote" avatars
    avatarSystem.createRemoteAvatar({
      userId: `user-abstract-${index}`,
      displayName: `Player ${index + 1}`,
      headPosition: { x, y: 0, z },
      customization: {
        bodyType: 'abstract',
        primaryColor: color,
        accentColor: '#ffffff',
        height: 1.5,
      },
    });
  });

  console.log('✓ Created 5 abstract avatars');
  console.log('  - Capsule bodies with glowing cores');
  console.log('  - Transparent materials');
  console.log('  - Arranged in circle');
}

/**
 * Example 8: Avatar Name Tags
 *
 * Shows how to customize name tags.
 */
export async function avatarNameTags() {
  console.log('=== Avatar Name Tags ===\n');

  const engine = new Engine();
  const avatarSystem = new AvatarSystem();
  engine.getWorld().addSystem(avatarSystem);

  // Create avatars with different name tag styles
  const avatarId1 = avatarSystem.createLocalAvatar('user-tag1', 'Admin Player', {
    bodyType: 'humanoid',
    hasHat: true,
    hasGlasses: true,
  });

  const avatarId2 = avatarSystem.createRemoteAvatar({
    userId: 'user-tag2',
    displayName: 'Moderator',
    headPosition: { x: 2, y: 0, z: 0 },
    customization: {
      bodyType: 'humanoid',
      hasGlasses: true,
    },
  });

  console.log('✓ Created avatars with name tags');
  console.log('  - Shows display name above avatar');
  console.log('  - Green indicator when speaking');
  console.log('  - Updates in real-time');
}

export default {
  basicAvatarSetup,
  avatarCustomization,
  multipleAvatars,
  avatarEmotes,
  vrAvatarTracking,
  networkSynchronizedAvatars,
  abstractAvatars,
  avatarNameTags,
};
