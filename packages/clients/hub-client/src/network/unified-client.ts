/**
 * Unified Network Client
 *
 * Automatically selects the best available transport (WebTransport HTTP/3 → WebSocket fallback)
 * Provides a consistent API regardless of the underlying transport.
 */

import {
  WebSocketClient,
  type WebSocketClientConfig,
  type MessageHandler
} from './websocket-client';
import { WebTransportClient, type WebTransportClientConfig } from './webtransport-client';
import { createLogger } from '@graphwiz/types';
import type { Message, MessageType } from '@graphwiz/protocol';

const logger = createLogger('UnifiedClient');

export type TransportType = 'webtransport' | 'websocket';

export interface UnifiedClientConfig {
  // WebTransport configuration
  webtransportUrl?: string;

  // WebSocket configuration (required as fallback)
  websocketUrl: string;
  roomId: string;
  userId: string;
  displayName: string;
  authToken?: string;
  clientId?: string;

  // Preferences
  preferWebTransport?: boolean; // Default: true
  forceTransport?: TransportType; // Force a specific transport (for testing)
}

/**
 * Unified Network Client
 *
 * Provides transparent transport selection with automatic fallback:
 * 1. If WebTransport is available and configured → use HTTP/3
 * 2. Otherwise → fall back to WebSocket
 *
 * Both transports expose the same API, so the application doesn't need
 * to know which transport is being used.
 */
export class UnifiedNetworkClient {
  private config: UnifiedClientConfig;
  private activeClient: WebSocketClient | WebTransportClient | null = null;
  private activeTransport: TransportType | null = null;

  // Message handlers (stored for re-subscription on reconnect)
  private messageHandlers = new Map<MessageType, Set<MessageHandler>>();

  constructor(config: UnifiedClientConfig) {
    this.config = {
      preferWebTransport: true,
      ...config
    };
  }

  /**
   * Connect to the server using the best available transport
   */
  async connect(): Promise<void> {
    // If forced transport, use it
    if (this.config.forceTransport) {
      return this.connectWithTransport(this.config.forceTransport);
    }

    // Try WebTransport first if preferred and available
    if (this.config.preferWebTransport && this.config.webtransportUrl) {
      if (WebTransportClient.isSupported()) {
        try {
          logger.info('[UnifiedClient] Attempting WebTransport connection...');
          await this.connectWithTransport('webtransport');
          return;
        } catch (error) {
          logger.warn('[UnifiedClient] WebTransport failed, falling back to WebSocket:', error);
          // Fall through to WebSocket
        }
      } else {
        logger.info('[UnifiedClient] WebTransport not supported, using WebSocket');
      }
    }

    // Fall back to WebSocket
    await this.connectWithTransport('websocket');
  }

  /**
   * Connect with a specific transport
   */
  private async connectWithTransport(transport: TransportType): Promise<void> {
    // Disconnect existing client if any
    await this.disconnect();

    if (transport === 'webtransport') {
      if (!this.config.webtransportUrl) {
        throw new Error('WebTransport URL not configured');
      }

      const wtConfig: WebTransportClientConfig = {
        serverUrl: this.config.webtransportUrl,
        roomId: this.config.roomId,
        authToken: this.config.authToken,
        clientId: this.config.clientId,
        displayName: this.config.displayName
      };

      this.activeClient = new WebTransportClient(wtConfig);
      this.activeTransport = 'webtransport';

      // Set up handlers
      this.setupWebTransportHandlers(this.activeClient as WebTransportClient);

      await this.activeClient.connect();
      logger.info('[UnifiedClient] Connected via WebTransport');
    } else {
      const wsConfig: WebSocketClientConfig = {
        presenceUrl: this.config.websocketUrl,
        roomId: this.config.roomId,
        userId: this.config.userId,
        displayName: this.config.displayName,
        authToken: this.config.authToken
      };

      this.activeClient = new WebSocketClient(wsConfig);
      this.activeTransport = 'websocket';

      // Re-subscribe to all stored handlers
      this.messageHandlers.forEach((handlers, messageType) => {
        handlers.forEach((handler) => {
          this.activeClient!.on(messageType, handler);
        });
      });

      await this.activeClient.connect();
      logger.info('[UnifiedClient] Connected via WebSocket');
    }
  }

  /**
   * Set up WebTransport-specific handlers
   */
  private setupWebTransportHandlers(client: WebTransportClient): void {
    // Re-subscribe to all stored handlers via the unified on() method
    this.messageHandlers.forEach((handlers, messageType) => {
      handlers.forEach((handler) => {
        client.on(messageType as number, handler);
      });
    });

    // Set up disconnect handler for auto-reconnect
    client.onDisconnect(() => {
      logger.info('[UnifiedClient] WebTransport disconnected, will attempt reconnect');
    });
  }

  /**
   * Disconnect from the server
   */
  async disconnect(): Promise<void> {
    if (this.activeClient) {
      if (this.activeTransport === 'webtransport') {
        await (this.activeClient as WebTransportClient).disconnect();
      } else {
        (this.activeClient as WebSocketClient).disconnect();
      }
      this.activeClient = null;
      this.activeTransport = null;
    }
  }

  /**
   * Register a message handler
   */
  on(messageType: MessageType, handler: MessageHandler): () => void {
    // Store handler for re-subscription on reconnect
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    this.messageHandlers.get(messageType)!.add(handler);

    // Subscribe to active client if connected
    let unsubscribe: (() => void) | null = null;
    if (this.activeClient) {
      unsubscribe = this.activeClient.on(messageType, handler);
    }

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(messageType)?.delete(handler);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  /**
   * Send a message
   */
  send(message: Message): void {
    if (!this.activeClient) {
      logger.warn('[UnifiedClient] Cannot send: not connected');
      return;
    }

    if (this.activeTransport === 'websocket') {
      (this.activeClient as WebSocketClient).send(message);
    } else {
      // WebTransport doesn't have a generic send method, need to use specific methods
      logger.warn('[UnifiedClient] Use specific send methods for WebTransport');
    }
  }

  /**
   * Send position update
   */
  sendPositionUpdate(
    entityId: string,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number; w: number }
  ): void {
    if (!this.activeClient) {
      logger.warn('[UnifiedClient] Cannot send position update: not connected');
      return;
    }

    this.activeClient.sendPositionUpdate(entityId, position, rotation);
  }

  /**
   * Send entity spawn
   */
  sendEntitySpawn(data: {
    entityId: string;
    templateId: string;
    components: Record<string, unknown>;
  }): void {
    if (!this.activeClient) {
      logger.warn('[UnifiedClient] Cannot send entity spawn: not connected');
      return;
    }

    this.activeClient.sendEntitySpawn(data);
  }

  /**
   * Send entity update
   */
  sendEntityUpdate(data: { entityId: string; components: Record<string, unknown> }): void {
    if (!this.activeClient) {
      logger.warn('[UnifiedClient] Cannot send entity update: not connected');
      return;
    }

    this.activeClient.sendEntityUpdate(data);
  }

  /**
   * Send entity despawn
   */
  sendEntityDespawn(entityId: string): void {
    if (!this.activeClient) {
      logger.warn('[UnifiedClient] Cannot send entity despawn: not connected');
      return;
    }

    this.activeClient.sendEntityDespawn(entityId);
  }

  /**
   * Send chat message
   */
  sendChatMessage(message: string): void {
    if (!this.activeClient) {
      logger.warn('[UnifiedClient] Cannot send chat: not connected');
      return;
    }

    this.activeClient.sendChatMessage(message);
  }

  /**
   * Send emoji reaction
   */
  sendEmojiReaction(emoji: string, position: { x: number; y: number; z: number }): void {
    if (!this.activeClient) {
      logger.warn('[UnifiedClient] Cannot send emoji: not connected');
      return;
    }

    if (this.activeTransport === 'websocket') {
      (this.activeClient as WebSocketClient).sendEmojiReaction(emoji, position);
    } else {
      (this.activeClient as WebTransportClient).sendEmojiReaction(emoji, position);
    }
  }

  /**
   * Send object grab message
   */
  sendGrabMessage(entityId: string, position: { x: number; y: number; z: number }): void {
    if (!this.activeClient) {
      logger.warn('[UnifiedClient] Cannot send grab: not connected');
      return;
    }

    if (this.activeTransport === 'websocket') {
      (this.activeClient as WebSocketClient).sendGrabMessage(entityId, position);
    } else {
      (this.activeClient as WebTransportClient).sendGrabMessage(entityId, position);
    }
  }

  /**
   * Send object release message
   */
  sendReleaseMessage(
    entityId: string,
    position: { x: number; y: number; z: number },
    velocity: { x: number; y: number; z: number }
  ): void {
    if (!this.activeClient) {
      logger.warn('[UnifiedClient] Cannot send release: not connected');
      return;
    }

    if (this.activeTransport === 'websocket') {
      (this.activeClient as WebSocketClient).sendReleaseMessage(entityId, position, velocity);
    } else {
      (this.activeClient as WebTransportClient).sendReleaseMessage(entityId, position, velocity);
    }
  }

  /**
   * Send avatar update
   */
  sendAvatarUpdate(avatarConfig: {
    bodyType: string;
    primaryColor: string;
    secondaryColor: string;
    height: number;
    customModelUrl?: string;
  }): void {
    if (!this.activeClient) {
      logger.warn('[UnifiedClient] Cannot send avatar update: not connected');
      return;
    }

    if (this.activeTransport === 'websocket') {
      (this.activeClient as WebSocketClient).sendAvatarUpdate(avatarConfig);
    } else {
      (this.activeClient as WebTransportClient).sendAvatarUpdate(avatarConfig);
    }
  }

  /**
   * Check if connected
   */
  connected(): boolean {
    return this.activeClient?.connected() ?? false;
  }

  /**
   * Get the active transport type
   */
  getTransportType(): TransportType | null {
    return this.activeTransport;
  }

  /**
   * Get client ID
   */
  getClientId(): string | null {
    if (!this.activeClient) {
      return null;
    }

    if (this.activeTransport === 'websocket') {
      return (this.activeClient as WebSocketClient).getClientId();
    } else {
      return (this.activeClient as WebTransportClient).myClientId;
    }
  }

  /**
   * Check if WebTransport is supported
   */
  static isWebTransportSupported(): boolean {
    return WebTransportClient.isSupported();
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    isConnected: boolean;
    transport: TransportType | null;
    clientId: string | null;
  } {
    return {
      isConnected: this.connected(),
      transport: this.activeTransport,
      clientId: this.getClientId()
    };
  }
}
