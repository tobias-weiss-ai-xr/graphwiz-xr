/**
 * WebTransport Client for GraphWiz-XR
 *
 * Handles real-time communication with the presence service
 */
import { MessageBuilder, MessageType as MT } from '@graphwiz/protocol';
export class WebTransportClient {
    constructor(config) {
        this.transport = null;
        this.sendStream = null;
        this.receiveReader = null;
        this.isConnected = false;
        this.isConnecting = false;
        // Message handlers
        this.messageHandlers = new Set();
        this.stateHandlers = new Set();
        this.presenceHandlers = new Set();
        this.entitySpawnHandlers = new Set();
        this.entityDespawnHandlers = new Set();
        this.entityUpdateHandlers = new Set();
        this.chatHandlers = new Set();
        this.disconnectHandlers = new Set();
        // Sequence numbers
        this.positionSequence = 0;
        // My assigned client ID from server
        this.myClientId = null;
        this.config = config;
    }
    /**
     * Connect to the server
     */
    async connect() {
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
        }
        catch (error) {
            this.isConnecting = false;
            this.isConnected = false;
            console.error('[WebTransport] Connection failed:', error);
            throw error;
        }
    }
    /**
     * Disconnect from the server
     */
    async disconnect() {
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
    sendPositionUpdate(position, rotation) {
        if (!this.isConnected) {
            console.warn('[WebTransport] Cannot send position update: not connected');
            return;
        }
        const update = {
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
    sendChatMessage(message, type = 0) {
        if (!this.isConnected) {
            console.warn('[WebTransport] Cannot send chat: not connected');
            return;
        }
        this.sendMessage(MessageBuilder.createChatMessage({
            fromClientId: this.myClientId || '',
            message,
            type,
        }));
    }
    /**
     * Spawn an entity
     */
    spawnEntity(templateId, components) {
        if (!this.isConnected) {
            console.warn('[WebTransport] Cannot spawn entity: not connected');
            return;
        }
        this.sendMessage(MessageBuilder.createEntitySpawn({
            entityId: `entity-${Date.now()}`,
            templateId,
            ownerId: this.myClientId || '',
            components,
        }));
    }
    /**
     * Despawn an entity
     */
    despawnEntity(entityId) {
        if (!this.isConnected) {
            console.warn('[WebTransport] Cannot despawn entity: not connected');
            return;
        }
        this.sendMessage(MessageBuilder.createEntityDespawn(entityId));
    }
    /**
     * Send a raw message
     */
    async sendMessage(message) {
        if (!this.sendStream) {
            console.warn('[WebTransport] No send stream available');
            return;
        }
        try {
            const writer = this.sendStream.getWriter();
            const data = this.serializeMessage(message);
            await writer.write(new Uint8Array(data));
            writer.releaseLock();
        }
        catch (error) {
            console.error('[WebTransport] Failed to send message:', error);
        }
    }
    /**
     * Send ClientHello message
     */
    async sendClientHello() {
        const message = {
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
    async receiveLoop() {
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
                    }
                    catch (error) {
                        console.error('[WebTransport] Failed to parse message:', error);
                    }
                }
            }
        }
        catch (error) {
            console.error('[WebTransport] Receive loop error:', error);
        }
        finally {
            if (this.isConnected) {
                await this.disconnect();
            }
        }
    }
    /**
     * Handle incoming message
     */
    handleMessage(message) {
        // Notify all message handlers
        this.messageHandlers.forEach((handler) => handler(message));
        // Notify specific handlers based on type
        switch (message.type) {
            case MT.SERVER_HELLO: {
                const hello = message.payload;
                this.myClientId = hello.assignedClientId;
                if (hello.initialState) {
                    this.stateHandlers.forEach((handler) => handler(hello.initialState));
                }
                console.log('[WebTransport] Received ServerHello, client ID:', this.myClientId);
                break;
            }
            case MT.PRESENCE_JOIN:
            case MT.PRESENCE_LEAVE:
            case MT.PRESENCE_UPDATE:
                this.presenceHandlers.forEach((handler) => handler(message.payload));
                break;
            case MT.ENTITY_SPAWN:
                this.entitySpawnHandlers.forEach((handler) => handler(message.payload));
                break;
            case MT.ENTITY_DESPAWN:
                this.entityDespawnHandlers.forEach((handler) => handler(message.payload));
                break;
            case MT.ENTITY_UPDATE:
                this.entityUpdateHandlers.forEach((handler) => handler(message.payload));
                break;
            case MT.CHAT_MESSAGE:
                this.chatHandlers.forEach((handler) => handler(message.payload));
                break;
            default:
                console.log('[WebTransport] Unhandled message type:', message.type);
        }
    }
    /**
     * Serialize message to binary
     * Simplified JSON serialization for now
     */
    serializeMessage(message) {
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
    deserializeMessage(buffer) {
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
    onMessage(handler) {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }
    /**
     * Register state handler
     */
    onState(handler) {
        this.stateHandlers.add(handler);
        return () => this.stateHandlers.delete(handler);
    }
    /**
     * Register presence handler
     */
    onPresence(handler) {
        this.presenceHandlers.add(handler);
        return () => this.presenceHandlers.delete(handler);
    }
    /**
     * Register entity spawn handler
     */
    onEntitySpawn(handler) {
        this.entitySpawnHandlers.add(handler);
        return () => this.entitySpawnHandlers.delete(handler);
    }
    /**
     * Register entity despawn handler
     */
    onEntityDespawn(handler) {
        this.entityDespawnHandlers.add(handler);
        return () => this.entityDespawnHandlers.delete(handler);
    }
    /**
     * Register entity update handler
     */
    onEntityUpdate(handler) {
        this.entityUpdateHandlers.add(handler);
        return () => this.entityUpdateHandlers.delete(handler);
    }
    /**
     * Register chat handler
     */
    onChat(handler) {
        this.chatHandlers.add(handler);
        return () => this.chatHandlers.delete(handler);
    }
    /**
     * Register disconnect handler
     */
    onDisconnect(handler) {
        this.disconnectHandlers.add(handler);
        return () => this.disconnectHandlers.delete(handler);
    }
    /**
     * Check if connected
     */
    get connected() {
        return this.isConnected;
    }
}
