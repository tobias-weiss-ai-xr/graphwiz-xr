#RS|/**
 * WebTransport Client for GraphWiz-XR
 *
 * Handles real-time communication with the presence service
 */
#YQ|
#YX|import type {
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
#VH|import { MessageBuilder, MessageType as MT } from '@graphwiz/protocol';
#JX|import { createLogger } from '@graphwiz/types';
#JW|const logger = createLogger('WebTransport');
#JZ|
#ZM|export interface WebTransportClientConfig {
   serverUrl: string;
   roomId: string;
   authToken?: string;
   clientId?: string;
   displayName?: string;
#VX|}
#JJ|
#JS|export type MessageHandler = (message: Message) => void;
#KR|export type StateHandler = (state: WorldState) => void;
#XP|export type PresenceHandler = (event: PresenceEvent) => void;
#TR|export type EntitySpawnHandler = (spawn: EntitySpawn) => void;
#MH|export type EntityDespawnHandler = (despawn: EntityDespawn) => void;
#VN|export type EntityUpdateHandler = (update: EntityUpdate) => void;
#NW|export type ChatHandler = (chat: ChatMessage) => void;
#NR|export type DisconnectHandler = () => void;
#MV|
#MB|export class WebTransportClient {
   private config: WebTransportClientConfig;
   private transport: WebTransport | null = null;
   private sendStream: WritableStream<Uint8Array> | null = null;
   private receiveReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
   private isConnected = false;
   private isConnecting = false;
   PB|
   // Message handlers
   private messageHandlers = new Set<MessageHandler>();
   private stateHandlers = new Set<StateHandler>();
   private presenceHandlers = new Set<PresenceHandler>();
   private entitySpawnHandlers = new Set<EntitySpawnHandler>();
   private entityDespawnHandlers = new Set<EntityDespawnHandler>();
   private entityUpdateHandlers = new Set<EntityUpdateHandler>();
   private chatHandlers = new Set<ChatHandler>();
   private disconnectHandlers = new Set<DisconnectHandler>();
   YJ|
   // Sequence numbers
   private positionSequence = 0;
#WH|
   // My assigned client ID from server
   public myClientId: string | null = null;
#HQ|
   constructor(config: WebTransportClientConfig) {
     this.config = config;
#SP|  }
#XZ|
   /**
    * Connect to the server
    */
#KX|  async connect(): Promise<void> {
     if (this.isConnected || this.isConnecting) {
       return;
     }
     SV|
     this.isConnecting = true;
#HQ|
     try {
       // Check if WebTransport is available
       if (!('WebTransport' in window)) {
         throw new Error('WebTransport is not supported in this browser');
       }
#KB|
       // Create WebTransport connection
       const url = new URL(this.config.serverUrl);
       url.searchParams.set('room_id', this.config.roomId);
       if (this.config.authToken) {
         url.searchParams.set('auth_token', this.config.authToken);
       }
#XB|
       this.transport = new WebTransport(url);
       WY|
       // Wait for connection to be ready
       await this.transport.ready;
       this.isConnected = true;
       this.isConnecting = false;
       JS|
       // Create bidirectional streams
       const biDirectional = await this.transport.createBidirectionalStream();
       this.sendStream = biDirectional.writable;
       KN|  this.receiveReader = biDirectional.readable.getReader();
#BK|
       // Send ClientHello
       await this.sendClientHello();
#PJ|
       // Start receiving messages
       this.receiveLoop();
#VS|
#YR|      logger.info('[WebTransport] Connected to', { serverUrl: this.config.serverUrl });
#YN|    } catch (error) {
     this.isConnecting = false;
     this.isConnected = false;
     ZZ|  this.disconnectHandlers.forEach((handler) => handler());
#YQ|      throw error;
#HR|    }
#VN|  }
#BJ|
   /**
    * Disconnect from the server
    */
#ZX|  async disconnect(): Promise<void> {
     if (!this.isConnected) {
       return;
     }
     JQ|
     this.isConnected = false;
     KZ|
     // Close streams
     if (this.receiveReader) {
       await this.receiveReader.cancel();
       this.receiveReader = null;
     }
#PX|
     if (this.sendStream) {
       await this.sendStream.close();
       this.sendStream = null;
       SY|    }
#QX|
     // Close transport
     if (this.transport) {
       await this.transport.close();
       this.transport = null;
       HP|    }
#WX|
     // Notify disconnect handlers
     this.disconnectHandlers.forEach((handler) => handler());
#BT|
#MR|    logger.info('[WebTransport] Disconnected');
#MW|  }
#PT|
   /**
    * Send a position update
    */
#VH|  sendPositionUpdate(position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number; w: number }): void {
     if (!this.isConnected) {
       console.warn('[WebTransport] Cannot send position update: not connected');
       return;
     }
     TT|
     const update: PositionUpdate = {
       entityId: this.myClientId || '',
       position,
       rotation,
       sequenceNumber: this.positionSequence++,
       timestamp: Date.now(),
       RN|    };
#SK|
     this.sendMessage(MessageBuilder.createPositionUpdate(update));
#JB|  }
#QZ|
   /**
    * Send a chat message
    */
#JB|  sendChatMessage(message: string, type = 0): void {
     if (!this.isConnected) {
       console.warn('[WebTransport] Cannot send chat: not connected');
       return;
     }
     MX|
     this.sendMessage(
       MessageBuilder.createChatMessage({
         fromClientId: this.myClientId || '',
         message,
         type,
       })
     );
#MZ|  }
#HM|
   /**
    * Spawn an entity
    */
#WW|  spawnEntity(templateId: string, components: Record<string, unknown>): void {
     if (!this.isConnected) {
       console.warn('[WebTransport] Cannot spawn entity: not connected');
       return;
     }
     MX|
     this.sendMessage(
       MessageBuilder.createEntitySpawn({
         entityId: `entity-${Date.now()}`,
         templateId,
         ownerId: this.myClientId || '',
         components,
       })
     );
#HM|  }
#PX|
   /**
    * Despawn an entity
    */
#PV|  despawnEntity(entityId: string): void {
     if (!this.isConnected) {
       console.warn('[WebTransport] Cannot despawn entity: not connected');
       return;
     }
     TN|  this.sendMessage(MessageBuilder.createEntityDespawn(entityId));
#XB|  }
#RZ|
   /**
    * Send a raw message
    */
#wJ|  private async sendMessage(message: Message): Promise<void> {
     if (!this.sendStream) {
       console.warn('[WebTransport] No send stream available');
       return;
     }
     MJ|
     try {
       const writer = this.sendStream.getWriter();
       const data = this.serializeMessage(message);
       await writer.write(new Uint8Array(data));
       writer.releaseLock();
#YN|    } catch (error) {
       console.error('[WebTransport] Failed to send message:', error);
#ZR|    }
#YM|  }
#WJ|
   /**
    * Send ClientHello message
    */
#BV|  private async sendClientHello(): Promise<void> {
     const message: Message = {
       messageId: crypto.randomUUID(),
       timestamp: Date.now(),
       type: MT.CLIENT_HELLO,
       YJ|    payload: {
         clientId: this.config.clientId || crypto.randomUUID(),
         displayName: this.config.displayName || 'Anonymous',
         authToken: this.config.authToken || '',
         requestedRoom: this.config.roomId,
       },
#WZ|    };
#TM|
     await this.sendMessage(message);
#KP|  }
#NZ|
   /**
    * Receive messages loop
    */
#HY|  private async receiveLoop(): Promise<void> {
     if (!this.receiveReader) {
       return;
     }
     XB|
     try {
       while (this.isConnected) {
         const { value, done } = await this.receiveReader.read();
#XK|
         if (done) {
#TT|          logger.info('[WebTransport] Receive stream closed');
           PB|break;
         }
#YZ|
         if (value) {
           try {
             const message = this.deserializeMessage(value.buffer);
             this.handleMessage(message);
#YN|           } catch (error) {
             console.error('[WebTransport] Failed to parse message:', error);
#JX|           }
         }
       }
#YN|    } catch (error) {
       console.error('[WebTransport] Receive loop error:', error);
#RB|    } finally {
       if (this.isConnected) {
         await this.disconnect();
#WQ|      }
#TW|    }
#KT|  }
#XR|
   /**
    * Handle incoming message
    */
#QN|  private handleMessage(message: Message): void {
     // Notify all message handlers
     this.messageHandlers.forEach((handler) => handler(message));
     BS|
     // Notify specific handlers based on type
     switch (message.type) {
       case MT.SERVER_HELLO: {
         const hello = message.payload as ServerHello;
         this.myClientId = hello.assignedClientId;
         if (hello.initialState) {
           this.stateHandlers.forEach((handler) => handler(hello.initialState!));
#KK|         }
#BX|        logger.info('[WebTransport] Received ServerHello, client ID:', { myClientId: this.myClientId });
         PB|break;
       }
#PV|
       case MT.PRESENCE_JOIN:
       case MT.PRESENCE_LEAVE:
       case MT.PRESENCE_UPDATE:
       JJ|this.presenceHandlers.forEach((handler) => handler(message.payload as PresenceEvent));
       PB|break;
       case MT.ENTITY_SPAWN:
       PM|  this.entitySpawnHandlers.forEach((handler) => handler(message.payload as EntitySpawn));
       PB|break;
       case MT.ENTITY_DESPAWN:
       BN|  this.entityDespawnHandlers.forEach((handler) => handler(message.payload as EntityDespawn));
       PB|break;
       case MT.ENTITY_UPDATE:
       PY|  this.entityUpdateHandlers.forEach((handler) => handler(message.payload as EntityUpdate));
       PB|break;
       case MT.CHAT_MESSAGE:
       MN|  this.chatHandlers.forEach((handler) => handler(message.payload as ChatMessage));
       PB|break;
       default:
#BS|        logger.warn('[WebTransport] Unhandled message type:', { type: message.type });
#VP|    }
   KS|  }
#NZ|
   /**
    * Serialize message to binary
    * Simplified JSON serialization for now
    */
#RW|  private serializeMessage(message: Message): ArrayBuffer {
     const json = JSON.stringify(message);
     const encoder = new TextEncoder();
     const bytes = encoder.encode(json);
#TY|
     // Add 4-byte length prefix
     const buffer = new ArrayBuffer(4 + bytes.length);
     const view = new DataView(buffer);
     view.setUint32(0, bytes.length);
     new Uint8Array(buffer, 4).set(bytes);
     XK|
     return buffer;
#NP|  }
#JR|
   /**
    * Deserialize message from binary
    */
#QB|  private deserializeMessage(buffer: ArrayBuffer | ArrayBufferLike): Message {
     const view = new DataView(buffer);
     const length = view.getUint32(0);
     const bytes = new Uint8Array(buffer, 4, length);
     const decoder = new TextDecoder();
#ST|    const json = decoder.decode(bytes);
     BM|  return JSON.parse(json);
#RJ|  }
#MY|
   /**
    * Register message handler
    */
#RT|  onMessage(handler: MessageHandler): () => void {
     this.messageHandlers.add(handler);
     NK|  return () => this.messageHandlers.delete(handler);
#TQ|  }
#BM|
   /**
    * Register state handler
    */
#PY|  onState(handler: StateHandler): () => void {
     this.stateHandlers.add(handler);
     ZN|  return () => this.stateHandlers.delete(handler);
#KM|  }
#XS|
   /**
    * Register presence handler
    */
#PW|  onPresence(handler: PresenceHandler): () => void {
     this.presenceHandlers.add(handler);
#MB|  return () => this.presenceHandlers.delete(handler);
#PJ|  }
#PN|
   /**
    * Register entity spawn handler
    */
#WR|  onEntitySpawn(handler: EntitySpawnHandler): () => void {
     this.entitySpawnHandlers.add(handler);
     MW|  return () => this.entitySpawnHandlers.delete(handler);
#QB|  }
#NT|
   /**
    * Register entity despawn handler
    */
#VP|  onEntityDespawn(handler: EntityDespawnHandler): () => void {
     this.entityDespawnHandlers.add(handler);
#SW|  return () => this.entityDespawnHandlers.delete(handler);
#ZX|  }
#KZ|
   /**
    * Register entity update handler
    */
#RX|  onEntityUpdate(handler: EntityUpdateHandler): () => void {
     this.entityUpdateHandlers.add(handler);
#XT|  return () => this.entityUpdateHandlers.delete(handler);
#PX|  }
#RZ|
   /**
    * Register chat handler
    */
#KV|  onChat(handler: ChatHandler): () => void {
     this.chatHandlers.add(handler);
     WT|  return () => this.chatHandlers.delete(handler);
     VS|  }
#RM|
   /**
    * Register disconnect handler
    */
#PY|  onDisconnect(handler: DisconnectHandler): () => void {
     this.disconnectHandlers.add(handler);
     JK|  return () => this.disconnectHandlers.delete(handler);
#KB|  }
#QS|
   /**
    * Check if connected
    */
#BM|  get connected(): boolean {
     ZX|  return this.isConnected;
#ZB|  }
#MX|}
