/**
 * Network Client
 *
 * Manages WebSocket/WebRTC connections for real-time multiplayer.
 * This is a wrapper around WebSocketClient that provides the high-level interface.
 */

import type { Message, MessageType } from '@graphwiz/protocol';

import { WebSocketClient } from './websocket-client';

export interface NetworkConfig {
  presenceUrl: string;
  sfuUrl: string;
  roomId: string;
  authToken: string;
  userId: string;
  displayName: string;
}

export type MessageHandler = (message: Message) => void;

export class NetworkClient {
  private wsClient: WebSocketClient;
  public config: NetworkConfig;

  constructor(config: NetworkConfig) {
    this.config = config;
    this.wsClient = new WebSocketClient({
      presenceUrl: config.presenceUrl,
      roomId: config.roomId,
      userId: config.userId,
      displayName: config.displayName,
      authToken: config.authToken,
    });
  }

  /**
   * Connect to the presence server
   */
  async connect(): Promise<void> {
    return this.wsClient.connect();
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    this.wsClient.disconnect();
  }

  /**
   * Register a message handler for a specific message type
   */
  on(messageType: MessageType, handler: MessageHandler): () => void {
    return this.wsClient.on(messageType, handler);
  }

  /**
   * Send a message to the server
   */
  send(message: Message): void {
    this.wsClient.send(message);
  }

  /**
   * Send position update
   */
  sendPositionUpdate(
    entityId: string,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number; w: number }
  ): void {
    this.wsClient.sendPositionUpdate(entityId, position, rotation);
  }

  /**
   * Send entity spawn message
   */
  sendEntitySpawn(data: {
    entityId: string;
    templateId: string;
    components: Record<string, unknown>;
  }): void {
    this.wsClient.sendEntitySpawn(data);
  }

  /**
   * Send entity despawn message
   */
  sendEntityDespawn(entityId: string): void {
    this.wsClient.sendEntityDespawn(entityId);
  }

  /**
   * Send chat message
   */
  sendChatMessage(messageText: string): void {
    this.wsClient.sendChatMessage(messageText);
  }

  /**
   * Check if connected
   */
  connected(): boolean {
    return this.wsClient.connected();
  }

  /**
   * Get client ID
   */
  getClientId(): string | null {
    return this.wsClient.getClientId();
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    isConnected: boolean;
    reconnectAttempts: number;
    clientId: string | null;
    readyState: number;
  } {
    return this.wsClient.getStats();
  }
}
