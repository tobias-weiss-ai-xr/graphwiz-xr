/**
 * Mock Presence Server for Testing
 *
 * Simulates the WebSocket presence service for development/testing.
 */

import { createLogger } from '@graphwiz/types/logger';

import { randomUUID } from 'crypto';

import { WebSocketServer, WebSocket } from 'ws';

const PORT = 8013;

interface ClientMessage {
  type: number;
  payload?: any;
}

interface ServerMessage {
  type: number;
  payload?: any;
}

const wss = new WebSocketServer({ port: PORT });

  logger.info(`Mock Presence Server running on ws://localhost:${PORT}`);

const clients = new Map<any, string>();

wss.on('connection', (ws, req) => {
  const clientId = randomUUID();
  clients.set(ws, clientId);

  // Extract room and user from URL query params
  const url = new URL(req.url || '', `ws://localhost:${PORT}`);
  const roomId = url.searchParams.get('room') || 'demo-room';
  const userId = url.searchParams.get('userId') || 'unknown';

    logger.info(`Client connected: ${clientId} (User: ${userId}, Room: ${roomId})`);

  // Send connection success message
  const connectMsg: ServerMessage = {
    type: 1, // CONNECTED
    payload: { clientId, roomId }
  };
  ws.send(JSON.stringify(connectMsg));

  // Send initial state with existing users
  const stateMsg: ServerMessage = {
    type: 3, // STATE
    payload: {
      clients: Array.from(clients.values()).filter(id => id !== clientId),
      roomId
    }
  };
  ws.send(JSON.stringify(stateMsg));

  // Handle incoming messages
  ws.on('message', (data: Buffer) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 10: // JOIN_ROOM
          logger.info(`[${clientId}] User ${userId} joined room ${roomId}`);
          // Broadcast to other clients
          broadcast({
            type: 40, // USER_JOINED
            payload: { clientId, userId }
          }, ws);
          break;

        case 20: // POSITION_UPDATE
          // Broadcast position to other clients
          broadcast({
            type: 20,
            payload: {
              clientId,
              ...message.payload
            }
          }, ws);
          break;

        case 30: // ENTITY_EVENT
          // Broadcast entity events
          broadcast({
            type: 30,
            payload: message.payload
          }, ws);
          break;

        default:
            logger.info(`[${clientId}] Unknown message type: ${message.type}`);
      }
    } catch (error) {
            logger.error(`[${clientId}] Error parsing message:`, error);
    }
  });

  ws.on('close', () => {
      logger.info(`Client disconnected: ${clientId}`);
    clients.delete(ws);

    // Notify other clients
    broadcast({
      type: 41, // USER_LEFT
      payload: { clientId }
    });
  });

  ws.on('error', (error) => {
      logger.error(`[${clientId}] WebSocket error:`, error);
  });
});

function broadcast(message: ServerMessage, excludeWs?: WebSocket) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client: any) => {
    if (client !== excludeWs && client.readyState === 1) { // OPEN = 1
      client.send(data);
    }
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('\nShutting down mock presence server...');
  wss.close(() => {
      logger.info('Server closed');
    process.exit(0);
  });
});
