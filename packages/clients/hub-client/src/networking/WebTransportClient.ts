/**
 * WebTransport Client for GraphWiz-XR
 *
 * Handles real-time communication with the presence service
 */

import type {
  Message,
  PositionUpdate,
  ServerHello,
  PresenceEvent,
  EntitySpawn,
  EntityDespawn,
  EntityUpdate,
  ChatMessage,
  WorldState,
} from '@graphwiz/protocol';
import { MessageBuilder, MessageType as MT } from '@graphwiz/protocol';

export interface WebTransportClientConfig {
  serverUrl: string;
  roomId: string;
  authToken?: string;
  clientId?: string;
  displayName?: string;
}

export type MessageHandler = (message: Message) => void;
export type StateHandler = (state: WorldState) => void;
export type PresenceHandler = (event: PresenceEvent) => void;
export type EntitySpawnHandler = (spawn: EntitySpawn) => void;
export type EntityDespawnHandler = (despawn: EntityDespawn) => void;
export type EntityUpdateHandler = (update: EntityUpdate) => void;
export type ChatHandler = (chat: ChatMessage) => void;
export type DisconnectHandler = () => void;

export class WebTransportClient {
  private config: WebTransportClientConfig;
  private transport: WebTransport | null = null;
  private sendStream: WritableStream<Uint8Array> | null = null;
  private receiveReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private isConnected = false;
  private isConnecting = false;

  // Message handlers
  private messageHandlers = new Set<MessageHandler>();
  private stateHandlers = new Set<StateHandler>();
  private presenceHandlers = new Set<PresenceHandler>();
  private entitySpawnHandlers = new Set<EntitySpawnHandler>();
  private entityDespawnHandlers = new Set<EntityDespawnHandler>();
  private entityUpdateHandlers = new Set<EntityUpdateHandler>();
  private chatHandlers = new Set<ChatHandler>();
  private disconnectHandlers = new Set<DisconnectHandler>();

  // Sequence numbers
  private positionSequence = 0;

  // My assigned client ID from server
  public myClientId: string | null = null;

  constructor(config: WebTransportClientConfig) {
    this.config = config;
  }

  /**
   * Connect to the server
   */
  async connect(): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      // Check if WebTransport is available
      if (!('WebTransport' in window)) {
        throw new Error('WebTransport is not supported in this browser');
      }

      // Create WebTransport connection
      const url = new URL(this.config.serverUrl);
      url.searchParams.set('room_id', this.config.roomId);
      if (this.config.authToken) {
        url.searchParams.set('auth_token', this.config.authToken);
      }

      this.transport = new WebTransport(url);

      // Wait for connection to be ready
      await this.transport.ready;
      this.isConnected = true;
      this.isConnecting = false;

      // Create bidirectional streams
      const biDirectional = await this.transport.createBidirectionalStream();
      this.sendStream = biDirectional.writable;
      this.receiveReader = biDirectional.readable.getReader();

      // Send ClientHello
      await this.sendClientHello();

      // Start receiving messages
      this.receiveLoop();

      console.log('[WebTransport] Connected to', this.config.serverUrl);
    } catch (error) {
      this.isConnecting = false;
      this.isConnected = false;
      console.error('[WebTransport] Connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from the server
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    this.isConnected = false;

    // Close streams
    if (this.receiveReader) {
      await this.receiveReader.cancel();
      this.receiveReader = null;
    }

    if (this.sendStream) {
      await this.sendStream.close();
      this.sendStream = null;
    }

    // Close transport
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }

    // Notify disconnect handlers
    this.disconnectHandlers.forEach((handler) => handler());

    console.log('[WebTransport] Disconnected');
  }

  /**
   * Send a position update
   */
  sendPositionUpdate(position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number; w: number }): void {
    if (!this.isConnected) {
      console.warn('[WebTransport] Cannot send position update: not connected');
      return;
    }

    const update: PositionUpdate = {
      entityId: this.myClientId || '',
      position,
      rotation,
      sequenceNumber: this.positionSequence++,
      timestamp: Date.now(),
    };

    this.sendMessage(MessageBuilder.createPositionUpdate(update));
  }

  /**
   * Send a chat message
   */
  sendChatMessage(message: string, type = 0): void {
    if (!this.isConnected) {
      console.warn('[WebTransport] Cannot send chat: not connected');
      return;
    }

    this.sendMessage(
      MessageBuilder.createChatMessage({
        fromClientId: this.myClientId || '',
        message,
        type,
      })
    );
  }

  /**
   * Spawn an entity
   */
  spawnEntity(templateId: string, components: Record<string, unknown>): void {
    if (!this.isConnected) {
      console.warn('[WebTransport] Cannot spawn entity: not connected');
      return;
    }

    this.sendMessage(
      MessageBuilder.createEntitySpawn({
        entityId: `entity-${Date.now()}`,
        templateId,
        ownerId: this.myClientId || '',
        components,
      })
    );
  }

  /**
   * Despawn an entity
   */
  despawnEntity(entityId: string): void {
    if (!this.isConnected) {
      console.warn('[WebTransport] Cannot despawn entity: not connected');
      return;
    }

    this.sendMessage(MessageBuilder.createEntityDespawn(entityId));
  }

  /**
   * Send a raw message
   */
  private async sendMessage(message: Message): Promise<void> {
    if (!this.sendStream) {
      console.warn('[WebTransport] No send stream available');
      return;
    }

    try {
      const writer = this.sendStream.getWriter();
      const data = this.serializeMessage(message);
      await writer.write(new Uint8Array(data));
      writer.releaseLock();
    } catch (error) {
      console.error('[WebTransport] Failed to send message:', error);
    }
  }

  /**
   * Send ClientHello message
   */
  private async sendClientHello(): Promise<void> {
    const message: Message = {
      messageId: crypto.randomUUID(),
      timestamp: Date.now(),
      type: MT.CLIENT_HELLO,
      payload: {
        clientId: this.config.clientId || crypto.randomUUID(),
        displayName: this.config.displayName || 'Anonymous',
        authToken: this.config.authToken || '',
        requestedRoom: this.config.roomId,
      },
    };

    await this.sendMessage(message);
  }

  /**
   * Receive messages loop
   */
  private async receiveLoop(): Promise<void> {
    if (!this.receiveReader) {
      return;
    }

    try {
      while (this.isConnected) {
        const { value, done } = await this.receiveReader.read();

        if (done) {
          console.log('[WebTransport] Receive stream closed');
          break;
        }

        if (value) {
          try {
            const message = this.deserializeMessage(value.buffer);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebTransport] Failed to parse message:', error);
          }
        }
      }
    } catch (error) {
      console.error('[WebTransport] Receive loop error:', error);
    } finally {
      if (this.isConnected) {
        await this.disconnect();
      }
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: Message): void {
    // Notify all message handlers
    this.messageHandlers.forEach((handler) => handler(message));

    // Notify specific handlers based on type
    switch (message.type) {
      case MT.SERVER_HELLO: {
        const hello = message.payload as ServerHello;
        this.myClientId = hello.assignedClientId;
        if (hello.initialState) {
          this.stateHandlers.forEach((handler) => handler(hello.initialState!));
        }
        console.log('[WebTransport] Received ServerHello, client ID:', this.myClientId);
        break;
      }

      case MT.PRESENCE_JOIN:
      case MT.PRESENCE_LEAVE:
      case MT.PRESENCE_UPDATE:
        this.presenceHandlers.forEach((handler) => handler(message.payload as PresenceEvent));
        break;

      case MT.ENTITY_SPAWN:
        this.entitySpawnHandlers.forEach((handler) => handler(message.payload as EntitySpawn));
        break;

      case MT.ENTITY_DESPAWN:
        this.entityDespawnHandlers.forEach((handler) => handler(message.payload as EntityDespawn));
        break;

      case MT.ENTITY_UPDATE:
        this.entityUpdateHandlers.forEach((handler) => handler(message.payload as EntityUpdate));
        break;

      case MT.CHAT_MESSAGE:
        this.chatHandlers.forEach((handler) => handler(message.payload as ChatMessage));
        break;

      default:
        console.log('[WebTransport] Unhandled message type:', message.type);
    }
  }

  /**
   * Serialize message to binary
   * Simplified JSON serialization for now
   */
  private serializeMessage(message: Message): ArrayBuffer {
    const json = JSON.stringify(message);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(json);

    // Add 4-byte length prefix
    const buffer = new ArrayBuffer(4 + bytes.length);
    const view = new DataView(buffer);
    view.setUint32(0, bytes.length);
    new Uint8Array(buffer, 4).set(bytes);

    return buffer;
  }

  /**
   * Deserialize message from binary
   */
  private deserializeMessage(buffer: ArrayBuffer | ArrayBufferLike): Message {
    const view = new DataView(buffer);
    const length = view.getUint32(0);
    const bytes = new Uint8Array(buffer, 4, length);
    const decoder = new TextDecoder();
    const json = decoder.decode(bytes);
    return JSON.parse(json);
  }

  /**
   * Register message handler
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Register state handler
   */
  onState(handler: StateHandler): () => void {
    this.stateHandlers.add(handler);
    return () => this.stateHandlers.delete(handler);
  }

  /**
   * Register presence handler
   */
  onPresence(handler: PresenceHandler): () => void {
    this.presenceHandlers.add(handler);
    return () => this.presenceHandlers.delete(handler);
  }

  /**
   * Register entity spawn handler
   */
  onEntitySpawn(handler: EntitySpawnHandler): () => void {
    this.entitySpawnHandlers.add(handler);
    return () => this.entitySpawnHandlers.delete(handler);
  }

  /**
   * Register entity despawn handler
   */
  onEntityDespawn(handler: EntityDespawnHandler): () => void {
    this.entityDespawnHandlers.add(handler);
    return () => this.entityDespawnHandlers.delete(handler);
  }

  /**
   * Register entity update handler
   */
  onEntityUpdate(handler: EntityUpdateHandler): () => void {
    this.entityUpdateHandlers.add(handler);
    return () => this.entityUpdateHandlers.delete(handler);
  }

  /**
   * Register chat handler
   */
  onChat(handler: ChatHandler): () => void {
    this.chatHandlers.add(handler);
    return () => this.chatHandlers.delete(handler);
  }

  /**
   * Register disconnect handler
   */
  onDisconnect(handler: DisconnectHandler): () => void {
    this.disconnectHandlers.add(handler);
    return () => this.disconnectHandlers.delete(handler);
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected;
  }
}
