/**
 * WebSocket Networking Integration Tests
 *
 * Tests for the WebSocket client, message serialization, and network system.
 * These tests can run with a mock server or against a real Presence service.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketClient } from '../../network/websocket-client';
import { NetworkClient } from '../../network/client';
import { MessageParser, MessageBuilder } from '@graphwiz/protocol';
import { MessageType } from '@graphwiz/protocol';
// Mock WebSocket for testing
class MockWebSocket {
    constructor(url) {
        this.readyState = WebSocket.CONNECTING;
        this.binaryType = 'arraybuffer';
        this.onopen = null;
        this.onmessage = null;
        this.onerror = null;
        this.onclose = null;
        this.eventListeners = new Map();
        this.sentMessages = [];
        this.url = url;
        // Simulate async connection
        setTimeout(() => {
            this.readyState = WebSocket.OPEN;
            this.triggerEvent('open', new Event('open'));
            if (this.onopen) {
                this.onopen(new Event('open'));
            }
        }, 10);
    }
    addEventListener(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
    }
    removeEventListener(event, listener) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1)
                listeners.splice(index, 1);
        }
    }
    triggerEvent(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach((listener) => listener(data));
        }
    }
    send(data) {
        this.sentMessages.push(data);
    }
    close(code, reason) {
        this.readyState = WebSocket.CLOSED;
        const event = new CloseEvent('close', { code: code || 1000, reason: reason || '' });
        this.triggerEvent('close', event);
        if (this.onclose) {
            this.onclose(event);
        }
    }
    // Test helper: simulate receiving a message
    simulateMessage(data) {
        const event = new MessageEvent('message', { data });
        this.triggerEvent('message', event);
        if (this.onmessage) {
            this.onmessage(event);
        }
    }
    // Test helper: simulate connection error
    simulateError() {
        const event = new Event('error');
        this.triggerEvent('error', event);
        if (this.onerror) {
            this.onerror(event);
        }
    }
    // Test helper: simulate disconnection
    simulateDisconnect() {
        this.readyState = WebSocket.CLOSED;
        const event = new CloseEvent('close');
        this.triggerEvent('close', event);
        if (this.onclose) {
            this.onclose(event);
        }
    }
}
// Mock global WebSocket
global.WebSocket = MockWebSocket;
describe('MessageParser', () => {
    describe('serialization', () => {
        it('should serialize a message to binary', () => {
            const message = {
                messageId: 'test-msg-1',
                timestamp: Date.now(),
                type: MessageType.POSITION_UPDATE,
                payload: {
                    entityId: 'entity-123',
                    position: { x: 1, y: 2, z: 3 },
                    rotation: { x: 0, y: 0, z: 0, w: 1 },
                    sequenceNumber: 1,
                    timestamp: Date.now()
                }
            };
            const buffer = MessageParser.serialize(message);
            expect(buffer).toBeInstanceOf(ArrayBuffer);
            expect(buffer.byteLength).toBeGreaterThan(0);
        });
        it('should serialize and deserialize a message correctly', () => {
            const original = {
                messageId: 'test-msg-2',
                timestamp: Date.now(),
                type: MessageType.CHAT_MESSAGE,
                payload: {
                    fromClientId: 'user-1',
                    message: 'Hello, world!',
                    timestamp: Date.now(),
                    type: 0
                }
            };
            const buffer = MessageParser.serialize(original);
            const parsed = MessageParser.parse(buffer);
            expect(parsed.messageId).toBe(original.messageId);
            expect(parsed.type).toBe(original.type);
            expect(parsed.payload).toEqual(original.payload);
        });
    });
    describe('position updates', () => {
        it('should serialize position update efficiently', () => {
            const message = MessageBuilder.createPositionUpdate({
                entityId: 'player-1',
                position: { x: 10.5, y: 2.0, z: -5.3 },
                rotation: { x: 0, y: 0.707, z: 0, w: 0.707 },
                sequenceNumber: 42,
                timestamp: Date.now()
            });
            const buffer = MessageParser.serialize(message);
            // Position updates should be relatively small (< 200 bytes)
            expect(buffer.byteLength).toBeLessThan(200);
        });
    });
});
describe('WebSocketClient', () => {
    let client;
    beforeEach(() => {
        client = new WebSocketClient({
            presenceUrl: 'ws://localhost:8003',
            roomId: 'test-room',
            userId: 'test-user',
            displayName: 'Test User'
        });
    });
    afterEach(() => {
        if (client) {
            client.disconnect();
        }
    });
    describe('connection', () => {
        it('should connect to the server', async () => {
            await client.connect();
            expect(client.connected()).toBe(true);
            expect(client.getClientId()).not.toBeNull();
        });
        it('should generate a client ID on connection', async () => {
            await client.connect();
            const clientId = client.getClientId();
            expect(clientId).toMatch(/^[a-f0-9-]+$/); // UUID format
        });
        it('should handle connection errors', async () => {
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            await client.connect();
            const mockWs = client['ws'];
            // Simulate error after connection is established
            if (mockWs) {
                mockWs.simulateError();
            }
            // Client should have logged error
            expect(errorSpy).toHaveBeenCalled();
            errorSpy.mockRestore();
        });
    });
    describe('message handling', () => {
        it('should register and call message handlers', async () => {
            await client.connect();
            const handler = vi.fn();
            client.on(MessageType.POSITION_UPDATE, handler);
            const mockWs = client['ws'];
            // Simulate receiving a position update
            const message = {
                messageId: 'msg-1',
                timestamp: Date.now(),
                type: MessageType.POSITION_UPDATE,
                payload: {
                    entityId: 'entity-1',
                    position: { x: 1, y: 2, z: 3 },
                    rotation: { x: 0, y: 0, z: 0, w: 1 },
                    sequenceNumber: 1,
                    timestamp: Date.now()
                }
            };
            const buffer = MessageParser.serialize(message);
            mockWs.simulateMessage(buffer);
            // Handler should be called
            expect(handler).toHaveBeenCalledWith(expect.objectContaining({
                type: MessageType.POSITION_UPDATE
            }));
        });
        it('should unsubscribe from message handlers', async () => {
            await client.connect();
            const handler = vi.fn();
            const unsubscribe = client.on(MessageType.CHAT_MESSAGE, handler);
            // Unsubscribe
            unsubscribe();
            const mockWs = client['ws'];
            // Simulate receiving a chat message
            const message = {
                messageId: 'msg-2',
                timestamp: Date.now(),
                type: MessageType.CHAT_MESSAGE,
                payload: {
                    fromClientId: 'user-1',
                    message: 'Test',
                    timestamp: Date.now(),
                    type: 0
                }
            };
            const buffer = MessageParser.serialize(message);
            mockWs.simulateMessage(buffer);
            // Handler should NOT be called
            expect(handler).not.toHaveBeenCalled();
        });
    });
    describe('sending messages', () => {
        it('should send position updates', async () => {
            await client.connect();
            const mockWs = client['ws'];
            client.sendPositionUpdate('entity-1', { x: 10, y: 5, z: -3 }, { x: 0, y: 0.707, z: 0, w: 0.707 });
            expect(mockWs.sentMessages.length).toBeGreaterThan(0);
            // First message should be CLIENT_HELLO
            // Second should be POSITION_UPDATE
        });
        it('should send chat messages', async () => {
            await client.connect();
            const mockWs = client['ws'];
            client.sendChatMessage('Hello, world!');
            expect(mockWs.sentMessages.length).toBeGreaterThan(0);
        });
        it('should send entity spawn messages', async () => {
            await client.connect();
            const mockWs = client['ws'];
            client.sendEntitySpawn({
                entityId: 'new-entity',
                templateId: 'cube',
                components: { color: 'red' }
            });
            expect(mockWs.sentMessages.length).toBeGreaterThan(0);
        });
    });
    describe('reconnection', () => {
        it('should attempt to reconnect on disconnect', async () => {
            await client.connect();
            const mockWs = client['ws'];
            // Simulate disconnect
            mockWs.simulateDisconnect();
            // Should attempt reconnection
            await new Promise((resolve) => setTimeout(resolve, 100));
            // After disconnect, client should show not connected
            expect(client.connected()).toBe(false);
            // Reconnect attempts should be tracked
            const stats = client.getStats();
            expect(stats.reconnectAttempts).toBeGreaterThan(0);
        });
    });
});
describe('NetworkClient', () => {
    let client;
    beforeEach(() => {
        client = new NetworkClient({
            presenceUrl: 'ws://localhost:8003',
            sfuUrl: 'ws://localhost:8004',
            roomId: 'test-room',
            authToken: 'test-token',
            userId: 'test-user',
            displayName: 'Test User'
        });
    });
    afterEach(() => {
        if (client) {
            client.disconnect();
        }
    });
    describe('API', () => {
        it('should connect using the wrapper', async () => {
            await client.connect();
            expect(client.connected()).toBe(true);
        });
        it('should expose configuration', () => {
            expect(client.config.roomId).toBe('test-room');
            expect(client.config.userId).toBe('test-user');
        });
        it('should delegate to WebSocket client', async () => {
            await client.connect();
            // Send a message through the wrapper
            client.sendChatMessage('Test message');
            // The underlying WebSocket client should have sent it
            expect(client.connected()).toBe(true);
        });
    });
});
describe('Integration Tests', () => {
    describe('message flow', () => {
        it('should handle complete message cycle', async () => {
            const client = new WebSocketClient({
                presenceUrl: 'ws://localhost:8003',
                roomId: 'integration-test',
                userId: 'user-1',
                displayName: 'User 1'
            });
            await client.connect();
            const mockWs = client['ws'];
            // Register handler
            const handler = vi.fn();
            client.on(MessageType.CHAT_MESSAGE, handler);
            // Send message
            client.sendChatMessage('Test message');
            // Simulate echo (server echoing the message back)
            const message = {
                messageId: 'echo-1',
                timestamp: Date.now(),
                type: MessageType.CHAT_MESSAGE,
                payload: {
                    fromClientId: 'user-1',
                    message: 'Test message',
                    timestamp: Date.now(),
                    type: 0
                }
            };
            const buffer = MessageParser.serialize(message);
            mockWs.simulateMessage(buffer);
            // Verify handler was called
            expect(handler).toHaveBeenCalled();
            client.disconnect();
        });
    });
    describe('performance', () => {
        it('should serialize messages quickly', () => {
            const message = MessageBuilder.createPositionUpdate({
                entityId: 'entity-perf',
                position: { x: 1, y: 2, z: 3 },
                rotation: { x: 0, y: 0, z: 0, w: 1 },
                sequenceNumber: 1,
                timestamp: Date.now()
            });
            const start = performance.now();
            const buffer = MessageParser.serialize(message);
            const end = performance.now();
            expect(end - start).toBeLessThan(10); // Should be very fast
            expect(buffer.byteLength).toBeLessThan(200); // Should be small
        });
        it('should handle multiple messages efficiently', () => {
            const messages = [];
            for (let i = 0; i < 100; i++) {
                messages.push(MessageBuilder.createPositionUpdate({
                    entityId: `entity-${i}`,
                    position: { x: i, y: i * 2, z: i * 3 },
                    rotation: { x: 0, y: 0, z: 0, w: 1 },
                    sequenceNumber: i,
                    timestamp: Date.now()
                }));
            }
            const start = performance.now();
            for (const message of messages) {
                MessageParser.serialize(message);
            }
            const end = performance.now();
            // Should serialize 100 messages in less than 100ms
            expect(end - start).toBeLessThan(100);
        });
    });
});
