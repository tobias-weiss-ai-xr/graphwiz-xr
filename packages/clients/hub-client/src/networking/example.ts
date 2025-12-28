/**
 * Networking Example
 *
 * Demonstrates how to use the WebSocket networking system
 * to connect to the Presence service and synchronize entities.
 */

import { NetworkClient, NetworkSystem } from '../network';
import { Engine } from '../core';
import type { Message, MessageType } from '@graphwiz-xr/protocol';

/**
 * Example: Basic networking setup
 */
export async function basicNetworkingExample() {
  // Create the game engine
  const engine = new Engine();

  // Configure network client
  const networkConfig = {
    presenceUrl: 'ws://localhost:4002', // Presence service URL
    sfuUrl: 'ws://localhost:4003', // SFU service URL (for WebRTC)
    roomId: 'test-room-123',
    authToken: 'your-auth-token',
    userId: 'user-456',
    displayName: 'Test User',
  };

  // Create network client
  const networkClient = new NetworkClient(networkConfig);

  // Connect to server
  console.log('Connecting to server...');
  await networkClient.connect();
  console.log('Connected! Client ID:', networkClient.getClientId());

  // Create network system
  const networkSystem = new NetworkSystem(networkClient);

  // Add network system to engine
  engine.addSystem(networkSystem);

  // Listen to server hello
  networkClient.on(2 as MessageType, (message: Message) => {
    console.log('Received server hello:', message.payload);
  });

  // Listen to entity spawn events
  networkClient.on(20 as MessageType, (message: Message) => {
    console.log('Entity spawned:', message.payload);
  });

  // Listen to position updates
  networkClient.on(10 as MessageType, (message: Message) => {
    console.log('Position update:', message.payload);
  });

  // Listen to presence events
  networkClient.on(40 as MessageType, (message: Message) => { // PRESENCE_JOIN
    console.log('User joined:', message.payload);
  });

  networkClient.on(41 as MessageType, (message: Message) => { // PRESENCE_LEAVE
    console.log('User left:', message.payload);
  });

  // Create a networked entity
  const entity = networkSystem.createNetworkedEntity(
    'cube-template',
    { x: 0, y: 1, z: 0 },
    {
      model: 'cube',
      color: 'blue',
    }
  );

  console.log('Created entity:', entity?.id);

  // Start the engine
  engine.start();

  // Cleanup on exit
  return () => {
    engine.stop();
    networkClient.disconnect();
  };
}

/**
 * Example: Real-time position synchronization
 */
export async function positionSyncExample() {
  const engine = new Engine();
  const networkClient = new NetworkClient({
    presenceUrl: 'ws://localhost:4002',
    sfuUrl: 'ws://localhost:4003',
    roomId: 'room-position-sync',
    authToken: 'token',
    userId: 'user-1',
    displayName: 'Player 1',
  });

  await networkClient.connect();

  const networkSystem = new NetworkSystem(networkClient);
  engine.addSystem(networkSystem);

  // Create a player entity
  const player = networkSystem.createNetworkedEntity(
    'player',
    { x: 0, y: 0, z: 0 }
  );

  engine.start();

  // Simulate movement (in a real app, this would be based on input)
  let x = 0;
  setInterval(() => {
    if (!player) return;

    x += 0.1;
    const transform = player.getComponent('TransformComponent');
    if (transform) {
      transform.position.x = x;

      // The NetworkSystem will automatically send updates
      // based on the syncRate configured in NetworkSyncComponent
    }
  }, 100);

  return () => {
    engine.stop();
    networkClient.disconnect();
  };
}

/**
 * Example: Chat messaging
 */
export async function chatExample() {
  const networkClient = new NetworkClient({
    presenceUrl: 'ws://localhost:4002',
    sfuUrl: 'ws://localhost:4003',
    roomId: 'room-chat',
    authToken: 'token',
    userId: 'user-1',
    displayName: 'Chat User',
  });

  await networkClient.connect();

  // Listen for chat messages
  networkClient.on(30 as MessageType, (message: Message) => {
    const chat = message.payload as any;
    console.log(`${chat.fromClientId}: ${chat.message}`);
  });

  // Send a chat message
  networkClient.sendChatMessage('Hello, world!');

  return () => {
    networkClient.disconnect();
  };
}

/**
 * Example: Handling connection events
 */
export async function connectionEventsExample() {
  const networkClient = new NetworkClient({
    presenceUrl: 'ws://localhost:4002',
    sfuUrl: 'ws://localhost:4003',
    roomId: 'room-events',
    authToken: 'token',
    userId: 'user-1',
    displayName: 'Event User',
  });

  // Monitor connection state
  const connectionCheck = setInterval(() => {
    const stats = networkClient.getStats();
    console.log('Connection state:', stats);

    if (!stats.isConnected) {
      console.log('Disconnected! Attempting to reconnect...');
    }
  }, 1000);

  await networkClient.connect();

  // Wait for user join/leave events
  networkClient.on(40 as MessageType, (message: Message) => {
    const event = message.payload as any;
    console.log(`User ${event.clientId} joined the room`);
  });

  networkClient.on(41 as MessageType, (message: Message) => {
    const event = message.payload as any;
    console.log(`User ${event.clientId} left the room`);
  });

  return () => {
    clearInterval(connectionCheck);
    networkClient.disconnect();
  };
}

/**
 * Example: React component integration
 */
export function createNetworkingHook(config: {
  presenceUrl: string;
  sfuUrl: string;
  roomId: string;
  authToken: string;
  userId: string;
  displayName: string;
}) {
  return () => {
    const [client] = useState(() => new NetworkClient(config));
    const [connected, setConnected] = useState(false);
    const [clientId, setClientId] = useState<string | null>(null);

    useEffect(() => {
      let mounted = true;

      // Connect on mount
      client.connect().then(() => {
        if (mounted) {
          setConnected(true);
          setClientId(client.getClientId());
        }
      }).catch((err) => {
        console.error('Connection failed:', err);
      });

      // Monitor connection state
      const interval = setInterval(() => {
        if (mounted) {
          setConnected(client.connected());
        }
      }, 1000);

      // Cleanup on unmount
      return () => {
        mounted = false;
        clearInterval(interval);
        client.disconnect();
      };
    }, [client]);

    // Send position update
    const sendPosition = (
      entityId: string,
      position: { x: number; y: number; z: number },
      rotation: { x: number; y: number; z: number; w: number }
    ) => {
      client.sendPositionUpdate(entityId, position, rotation);
    };

    // Send chat message
    const sendChat = (message: string) => {
      client.sendChatMessage(message);
    };

    // Listen for messages
    const onMessage = (messageType: MessageType, handler: (message: Message) => void) => {
      return client.on(messageType, handler);
    };

    return {
      connected,
      clientId,
      sendPosition,
      sendChat,
      onMessage,
    };
  };
}

// Import for the React example
import { useState, useEffect } from 'react';

/**
 * Usage example in a React component:
 *
 * ```tsx
 * function GameRoom() {
 *   const { connected, clientId, sendPosition, onMessage } = createNetworkingHook({
 *     presenceUrl: 'ws://localhost:4002',
 *     sfuUrl: 'ws://localhost:4003',
 *     roomId: 'my-room',
 *     authToken: userToken,
 *     userId: userId,
 *     displayName: userName,
 *   })();
 *
 *   useEffect(() => {
 *     const unsubscribe = onMessage(30, (message) => {
 *       const chat = message.payload as any;
 *       addChatMessage(chat.fromClientId, chat.message);
 *     });
 *
 *     return unsubscribe;
 *   }, [onMessage]);
 *
 *   if (!connected) {
 *     return <div>Connecting...</div>;
 *   }
 *
 *   return <div>Connected as {clientId}</div>;
 * }
 * ```
 */

export default {
  basicNetworkingExample,
  positionSyncExample,
  chatExample,
  connectionEventsExample,
  createNetworkingHook,
};
