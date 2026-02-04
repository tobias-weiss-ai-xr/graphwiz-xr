/**
 * Mock WebSocket Server for Testing
 *
 * A simple Node.js WebSocket server that mimics the Presence service
 * for testing purposes without needing the full Rust backend.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from '@graphwiz-xr/protocol';
import { MessageType } from '@graphwiz-xr/protocol';

interface ClientConnection {
  id: string;
  userId: string;
  roomId: string;
  ws: WebSocket;
}

export class MockPresenceServer {
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection> = new Map();
  private roomClients: Map<string, Set<string>> = new Map();

  constructor(port: number = 8003) {
    this.wss = new WebSocketServer({ port });
    this.setupServer();

    console.log(`Mock Presence Server listening on ws://localhost:${port}`);
  }

  private setupServer() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      // Parse query parameters
      const url = new URL(req.url || '', `ws://localhost:${this.wss.options.port}`);
      const roomId = url.searchParams.get('room_id') || 'lobby';
      const userId = url.searchParams.get('user_id') || 'anonymous';
      const clientId = url.searchParams.get('client_id') || uuidv4();

      console.log(`[MockServer] Client connecting: ${clientId} to room ${roomId}`);

      // Create client connection
      const client: ClientConnection = {
        id: clientId,
        userId,
        roomId,
        ws,
      };

      this.clients.set(clientId, client);

      // Add to room
      if (!this.roomClients.has(roomId)) {
        this.roomClients.set(roomId, new Set());
      }
      this.roomClients.get(roomId)!.add(clientId);

      // Send server hello
      this.sendServerHello(client);

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        this.handleMessage(clientId, data);
      });

      // Handle disconnect
      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      // Notify others of join
      this.broadcastToRoom(roomId, {
        messageId: uuidv4(),
        timestamp: Date.now(),
        type: MessageType.PRESENCE_JOIN,
        payload: {
          clientId,
          eventType: 0, // JOIN
          data: {
            displayName: userId,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
          },
        },
      }, clientId);
    });
  }

  private sendServerHello(client: ClientConnection) {
    const hello = {
      type: 'SERVER_HELLO',
      server_version: '1.0.0-mock',
      client_id: client.id,
      room_id: client.roomId,
      timestamp: Date.now(),
    };

    client.ws.send(JSON.stringify(hello));
  }

  private handleMessage(clientId: string, data: Buffer) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Echo position updates to other clients
    // In a real implementation, this would parse the binary message
    // For now, we'll just broadcast to the room

    // Broadcast to room (excluding sender)
    this.broadcastToRoom(client.roomId, data, clientId);
  }

  private handleDisconnect(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    console.log(`[MockServer] Client disconnecting: ${clientId}`);

    // Remove from room
    const roomClients = this.roomClients.get(client.roomId);
    if (roomClients) {
      roomClients.delete(clientId);
      if (roomClients.size === 0) {
        this.roomClients.delete(client.roomId);
      }
    }

    // Notify others of leave
    this.broadcastToRoom(client.roomId, {
      messageId: uuidv4(),
      timestamp: Date.now(),
      type: MessageType.PRESENCE_LEAVE,
      payload: {
        clientId,
        eventType: 1, // LEAVE
        data: {},
      },
    }, clientId);

    // Remove client
    this.clients.delete(clientId);
  }

  private broadcastToRoom(roomId: string, data: Buffer | Message, excludeClientId?: string) {
    const roomClients = this.roomClients.get(roomId);
    if (!roomClients) return;

    const buffer = data instanceof Buffer ? data : JSON.stringify(data);

    roomClients.forEach((clientId) => {
      if (excludeClientId && clientId === excludeClientId) return;

      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(buffer);
      }
    });
  }

  public getRoomClientCount(roomId: string): number {
    return this.roomClients.get(roomId)?.size || 0;
  }

  public getTotalClientCount(): number {
    return this.clients.size;
  }

  public close() {
    this.wss.close();
  }
}

// Start server if run directly
if (require.main === module) {
  const port = process.argv[2] ? parseInt(process.argv[2]) : 8003;
  const server = new MockPresenceServer(port);

  console.log('\nMock Presence Server running.');
  console.log('Test with: ws://localhost:' + port);
  console.log('Press Ctrl+C to stop\n');

  process.on('SIGINT', () => {
    console.log('\nShutting down mock server...');
    server.close();
    process.exit(0);
  });
}

export default MockPresenceServer;
