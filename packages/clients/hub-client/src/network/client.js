/**
 * Network Client
 *
 * Manages WebSocket/WebRTC connections for real-time multiplayer.
 * This is a wrapper around WebSocketClient that provides the high-level interface.
 */
import { WebSocketClient } from './websocket-client';
export class NetworkClient {
    constructor(config) {
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
    async connect() {
        return this.wsClient.connect();
    }
    /**
     * Disconnect from the server
     */
    disconnect() {
        this.wsClient.disconnect();
    }
    /**
     * Register a message handler for a specific message type
     */
    on(messageType, handler) {
        return this.wsClient.on(messageType, handler);
    }
    /**
     * Send a message to the server
     */
    send(message) {
        this.wsClient.send(message);
    }
    /**
     * Send position update
     */
    sendPositionUpdate(entityId, position, rotation) {
        this.wsClient.sendPositionUpdate(entityId, position, rotation);
    }
    /**
     * Send entity spawn message
     */
    sendEntitySpawn(data) {
        this.wsClient.sendEntitySpawn(data);
    }
    /**
     * Send entity despawn message
     */
    sendEntityDespawn(entityId) {
        this.wsClient.sendEntityDespawn(entityId);
    }
    /**
     * Send chat message
     */
    sendChatMessage(messageText) {
        this.wsClient.sendChatMessage(messageText);
    }
    /**
     * Check if connected
     */
    connected() {
        return this.wsClient.connected();
    }
    /**
     * Get client ID
     */
    getClientId() {
        return this.wsClient.getClientId();
    }
    /**
     * Get connection statistics
     */
    getStats() {
        return this.wsClient.getStats();
    }
}
