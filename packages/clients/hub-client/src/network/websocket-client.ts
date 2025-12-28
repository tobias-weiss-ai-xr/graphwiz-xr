/**
 * WebSocket Client
 *
 * Handles WebSocket connection to the Presence service for real-time networking.
 */

import { MessageParser, MessageBuilder } from '@graphwiz/protocol';
import type { Message, MessageType, ClientHello, PositionUpdate } from '@graphwiz/protocol';
import { v4 as uuidv4 } from 'uuid';

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

  constructor(config: WebSocketClientConfig) {
    this.config = config;
    this.clientId = uuidv4();
  }

  /**
   * Connect to the presence server
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.warn('[WebSocketClient] Already connected');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Construct WebSocket URL with query parameters
        const params = new URLSearchParams({
          room_id: this.config.roomId,
          user_id: this.config.userId,
          client_id: this.clientId!,
        });

        const wsUrl = `${this.config.presenceUrl}/ws/${this.config.roomId}?${params.toString()}`;
        console.log('[WebSocketClient] Connecting to:', wsUrl);

        this.ws = new WebSocket(wsUrl);

        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('[WebSocketClient] WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Send client hello
          this.sendClientHello().then(() => {
            resolve();
          }).catch((err) => {
            console.error('[WebSocketClient] Failed to send client hello:', err);
            reject(err);
          });
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocketClient] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('[WebSocketClient] WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
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
      console.warn('[WebSocketClient] Cannot send message: not connected');
      return;
    }

    try {
      const serialized = MessageParser.serialize(message);
      this.ws.send(serialized);
      console.log('[WebSocketClient] Sent message type:', message.type);
    } catch (error) {
      console.error('[WebSocketClient] Failed to send message:', error);
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
      requestedRoom: this.config.roomId,
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
      timestamp: Date.now(),
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
      ownerId: this.config.userId,
    };

    const message = MessageBuilder.createEntitySpawn(spawn);
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
      type: 0, // NORMAL
    };

    const message = MessageBuilder.createChatMessage(chat);
    this.send(message);
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
          }
        } catch {
          // Not JSON, continue to binary parsing
        }
        console.warn('[WebSocketClient] Received unexpected text message:', data);
        return;
      }

      // Parse binary message
      message = MessageParser.parse(data);

      console.log('[WebSocketClient] Received message type:', message.type);

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
      console.error('[WebSocketClient] Failed to parse message:', error);
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
        initialState: data.initial_state,
      } as any,
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

    console.log(`[WebSocketClient] Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

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
      readyState: this.ws?.readyState ?? WebSocket.CLOSED,
    };
  }
}
