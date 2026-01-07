/**
 * WebSocket Client
 *
 * Handles WebSocket connection to the Presence service for real-time networking.
 */

import { MessageParser, MessageBuilder } from '@graphwiz/protocol';
import type { Message, MessageType, ClientHello, PositionUpdate } from '@graphwiz/protocol';
import { v4 as uuidv4 } from 'uuid';
import { createLogger, LogLevel } from '@graphwiz/types';

const logger = createLogger('WebSocketClient');

export interface WebSocketClientConfig {
  presenceUrl: string;
  roomId: string;
  userId: string;
  displayName: string;
  authToken?: string;
}

export type MessageHandler = (message: Message) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketClientConfig;
  private messageHandlers = new Map<MessageType, Set<MessageHandler>>();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private clientId: string | null = null;
  private sequenceNumber = 0;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(config: WebSocketClientConfig) {
    this.config = config;
    this.clientId = uuidv4();
  }

  /**
   * Connect to the presence server
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.warn('[WebSocketClient] Already connected');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Construct WebSocket URL with query parameters
        const params = new URLSearchParams({
          room_id: this.config.roomId,
          user_id: this.config.userId,
          client_id: this.clientId!
        });

        const wsUrl = `${this.config.presenceUrl}/ws/${this.config.roomId}?${params.toString()}`;
        logger.log('[WebSocketClient] Connecting to:', wsUrl);

        this.ws = new WebSocket(wsUrl);

        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          logger.log('[WebSocketClient] WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Start ping/pong keep-alive (every 30 seconds)
          this.startPingInterval();

          // Send client hello
          this.sendClientHello()
            .then(() => {
              resolve();
            })
            .catch((err) => {
              logger.error('[WebSocketClient] Failed to send client hello:', err);
              reject(err);
            });
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          logger.error('[WebSocketClient] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          logger.log('[WebSocketClient] WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;

          // Clear ping interval
          this.stopPingInterval();

          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    // Stop ping interval
    this.stopPingInterval();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }

    this.isConnected = false;
  }

  /**
   * Register a message handler for a specific message type
   */
  on(messageType: MessageType, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    this.messageHandlers.get(messageType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Send a message to the server
   */
  send(message: Message): void {
    if (!this.ws || !this.isConnected || this.ws.readyState !== WebSocket.OPEN) {
      logger.warn('[WebSocketClient] Cannot send message: not connected');
      return;
    }

    try {
      const serialized = MessageParser.serialize(message);
      this.ws.send(serialized);

      // Only log important message types (not position updates which are sent at 20Hz)
      if (message.type !== 10) {
        // 10 = POSITION_UPDATE
        logger.log('[WebSocketClient] Sent message type:', message.type);
      }
    } catch (error) {
      logger.error('[WebSocketClient] Failed to send message:', error);
    }
  }

  /**
   * Send client hello to initiate connection
   */
  private async sendClientHello(): Promise<void> {
    const hello: ClientHello = {
      clientId: this.clientId!,
      displayName: this.config.displayName,
      authToken: this.config.authToken || '',
      requestedRoom: this.config.roomId
    };

    const message = MessageBuilder.create(1 as MessageType, hello); // CLIENT_HELLO = 1
    this.send(message);
  }

  /**
   * Send position update
   */
  sendPositionUpdate(
    entityId: string,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number; w: number }
  ): void {
    const update: PositionUpdate = {
      entityId,
      position: { ...position },
      rotation: { ...rotation },
      sequenceNumber: this.sequenceNumber++,
      timestamp: Date.now()
    };

    const message = MessageBuilder.createPositionUpdate(update);
    this.send(message);
  }

  /**
   * Send entity spawn message
   */
  sendEntitySpawn(data: {
    entityId: string;
    templateId: string;
    components: Record<string, unknown>;
  }): void {
    const spawn = {
      ...data,
      ownerId: this.config.userId
    };

    const message = MessageBuilder.createEntitySpawn(spawn);
    this.send(message);
  }

  /**
   * Send entity update message
   */
  sendEntityUpdate(data: { entityId: string; components: Record<string, unknown> }): void {
    const message = MessageBuilder.createEntityUpdate(data);
    this.send(message);
  }

  /**
   * Send entity despawn message
   */
  sendEntityDespawn(entityId: string): void {
    const message = MessageBuilder.createEntityDespawn(entityId);
    this.send(message);
  }

  /**
   * Send chat message
   */
  sendChatMessage(messageText: string): void {
    const chat = {
      fromClientId: this.clientId!,
      message: messageText,
      type: 0 // NORMAL
    };

    const message = MessageBuilder.createChatMessage(chat);
    this.send(message);
  }

  /**
   * Send emoji reaction
   */
  sendEmojiReaction(emoji: string, position: { x: number; y: number; z: number }): void {
    const reaction = {
      fromClientId: this.clientId!,
      emoji,
      position: { ...position },
      timestamp: Date.now(),
      reactionId: uuidv4()
    };

    const message = MessageBuilder.create(31 as MessageType, reaction); // EMOJI_REACTION = 31
    this.send(message);
  }

  /**
   * Send object grab message
   */
  sendGrabMessage(entityId: string, position: { x: number; y: number; z: number }): void {
    const grab = {
      entityId,
      clientId: this.clientId!,
      position: { ...position },
      timestamp: Date.now()
    };

    const message = MessageBuilder.create(32 as MessageType, grab); // OBJECT_GRAB = 32
    this.send(message);
  }

  /**
   * Send object release message
   */
  sendReleaseMessage(
    entityId: string,
    position: { x: number; y: number; z: number },
    velocity: { x: number; y: number; z: number }
  ): void {
    const release = {
      entityId,
      clientId: this.clientId!,
      position: { ...position },
      velocity: { ...velocity },
      timestamp: Date.now()
    };

    const message = MessageBuilder.create(33 as MessageType, release); // OBJECT_RELEASE = 33
    this.send(message);
  }

  /**
   * Send avatar update to sync with other players
   */
  sendAvatarUpdate(avatarConfig: {
    bodyType: string;
    primaryColor: string;
    secondaryColor: string;
    height: number;
    customModelUrl?: string;
  }): void {
    // Create presence update payload
    const presenceData = {
      displayName: this.config.displayName,
      avatarUrl: '', // Deprecated, using avatarConfig instead
      position: { x: 0, y: 0, z: 0 }, // Default position
      rotation: { x: 0, y: 0, z: 0, w: 1 }, // Default rotation
      avatarConfig: {
        bodyType: avatarConfig.bodyType,
        primaryColor: avatarConfig.primaryColor,
        secondaryColor: avatarConfig.secondaryColor,
        height: avatarConfig.height,
        customModelUrl: avatarConfig.customModelUrl || ''
      }
    };

    // Create message with proper wrapper
    const message: any = {
      messageId: uuidv4(),
      timestamp: Date.now(),
      type: 42, // PRESENCE_UPDATE
      payload: {
        clientId: this.clientId!,
        ...presenceData
      }
    };

    this.send(message);

    logger.log('[WebSocketClient] Sent avatar update:', avatarConfig);
  }

  /**
   * Handle incoming message from server
   */
  private handleMessage(data: string | ArrayBuffer): void {
    try {
      let message: Message;

      // Check if it's a server hello (text format)
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'SERVER_HELLO') {
            // Handle server hello text message
            console.log('[WebSocketClient] Received server hello (text):', parsed);
            this.handleServerHelloText(parsed);
            return;
          } else if (parsed.type === 255) {
            // Handle ping response (silently ignore)
            return;
          }
        } catch {
          // Not JSON, continue to binary parsing
        }
        console.warn('[WebSocketClient] Received unexpected text message:', data);
        return;
      }

      // Parse binary message
      message = MessageParser.parse(data);

      // Only log important message types (not position updates which are received at 20Hz)
      if (message.type !== 10) {
        // 10 = POSITION_UPDATE
        console.log('[WebSocketClient] Received message type:', message.type);
      }

      // Call registered handlers
      const handlers = this.messageHandlers.get(message.type);
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(message);
          } catch (error) {
            console.error('[WebSocketClient] Handler error:', error);
          }
        });
      }
    } catch (error) {
      // Silently ignore parse errors for malformed binary messages
      // These can occur due to network issues or protocol mismatches
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (!errorMsg.includes('Invalid typed array length')) {
        // Only log unexpected errors, not the common parse errors
        console.warn('[WebSocketClient] Failed to parse message:', errorMsg);
      }
    }
  }

  /**
   * Handle server hello in text format (initial connection)
   */
  private handleServerHelloText(data: any): void {
    // Store assigned client ID if different
    if (data.client_id && data.client_id !== this.clientId) {
      this.clientId = data.client_id;
    }

    // Convert to Message format and trigger handlers
    const message: Message = {
      messageId: uuidv4(),
      timestamp: data.timestamp || Date.now(),
      type: 2 as MessageType, // SERVER_HELLO
      payload: {
        serverVersion: data.server_version || '1.0.0',
        assignedClientId: data.client_id || this.clientId!,
        roomId: data.room_id || this.config.roomId,
        initialState: data.initial_state
      } as any
    };

    const handlers = this.messageHandlers.get(2 as MessageType); // SERVER_HELLO
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }
  }

  /**
   * Attempt to reconnect to the server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocketClient] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `[WebSocketClient] Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocketClient] Reconnect failed:', error);
      });
    }, delay);
  }

  /**
   * Check if connected
   */
  connected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get client ID
   */
  getClientId(): string | null {
    return this.clientId;
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
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      clientId: this.clientId,
      readyState: this.ws?.readyState ?? WebSocket.CLOSED
    };
  }

  /**
   * Start ping interval to keep WebSocket connection alive
   */
  private startPingInterval(): void {
    // Clear any existing interval
    this.stopPingInterval();

    // Send ping every 30 seconds as a minimal message
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Send a minimal binary ping message (type 255 = custom ping)
        const pingMessage = {
          messageId: 'ping-' + Date.now(),
          timestamp: Date.now(),
          type: 255, // Custom ping type (outside normal range)
          payload: null
        };

        try {
          const serialized = JSON.stringify(pingMessage);
          this.ws.send(serialized);
        } catch (error) {
          console.warn('[WebSocketClient] Failed to send ping:', error);
        }
      }
    }, 30000);
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}
