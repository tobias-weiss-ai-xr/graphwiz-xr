/**
 * Tests for WebTransport client
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebTransportClient } from '../networking/WebTransportClient';
// Mock WebTransport API
const mockWebTransport = {
    ready: Promise.resolve(undefined),
    createBidirectionalStream: vi.fn(),
    close: vi.fn(),
};
// Mock crypto API
const mockUuid = 'test-uuid-123';
vi.stubGlobal('crypto', {
    randomUUID: () => mockUuid,
});
// Mock WebTransport constructor
global.WebTransport = vi.fn(() => mockWebTransport);
describe('WebTransportClient', () => {
    let client;
    beforeEach(() => {
        // Reset the ready promise to resolved state for each test
        mockWebTransport.ready = Promise.resolve(undefined);
        client = new WebTransportClient({
            serverUrl: 'https://test.example.com',
            roomId: 'test-room',
            authToken: 'test-token',
            clientId: 'test-client',
            displayName: 'Test User',
        });
        // Reset mocks
        vi.clearAllMocks();
    });
    afterEach(() => {
        vi.clearAllMocks();
    });
    describe('Initialization', () => {
        it('should create client with config', () => {
            expect(client).toBeDefined();
        });
        it('should store myClientId', () => {
            expect(client.myClientId).toBeNull();
        });
        it('should have connected property', () => {
            expect(client.connected).toBe(false);
        });
    });
    describe('Connection lifecycle', () => {
        it('should connect successfully', async () => {
            const mockStream = {
                writable: new WritableStream(),
                readable: new ReadableStream(),
            };
            mockWebTransport.createBidirectionalStream.mockResolvedValue(mockStream);
            await client.connect();
            expect(client.connected).toBe(true);
        });
        it('should handle connection errors gracefully', async () => {
            mockWebTransport.ready = Promise.reject(new Error('Connection failed'));
            await expect(client.connect()).rejects.toThrow();
            expect(client.connected).toBe(false);
        });
        it('should disconnect successfully', async () => {
            const mockStream = {
                writable: new WritableStream(),
                readable: new ReadableStream(),
            };
            mockWebTransport.createBidirectionalStream.mockResolvedValue(mockStream);
            await client.connect();
            await client.disconnect();
            expect(client.connected).toBe(false);
        });
    });
    describe('Message handlers', () => {
        it('should register message handler', () => {
            const handler = vi.fn();
            const unsubscribe = client.onMessage(handler);
            expect(typeof unsubscribe).toBe('function');
        });
        it('should unregister message handler', () => {
            const handler = vi.fn();
            const unsubscribe = client.onMessage(handler);
            unsubscribe();
            // Handler should be removed
        });
        it('should register state handler', () => {
            const handler = vi.fn();
            const unsubscribe = client.onState(handler);
            expect(typeof unsubscribe).toBe('function');
        });
        it('should register presence handler', () => {
            const handler = vi.fn();
            const unsubscribe = client.onPresence(handler);
            expect(typeof unsubscribe).toBe('function');
        });
        it('should register entity spawn handler', () => {
            const handler = vi.fn();
            const unsubscribe = client.onEntitySpawn(handler);
            expect(typeof unsubscribe).toBe('function');
        });
        it('should register entity despawn handler', () => {
            const handler = vi.fn();
            const unsubscribe = client.onEntityDespawn(handler);
            expect(typeof unsubscribe).toBe('function');
        });
        it('should register entity update handler', () => {
            const handler = vi.fn();
            const unsubscribe = client.onEntityUpdate(handler);
            expect(typeof unsubscribe).toBe('function');
        });
        it('should register chat handler', () => {
            const handler = vi.fn();
            const unsubscribe = client.onChat(handler);
            expect(typeof unsubscribe).toBe('function');
        });
        it('should register disconnect handler', () => {
            const handler = vi.fn();
            const unsubscribe = client.onDisconnect(handler);
            expect(typeof unsubscribe).toBe('function');
        });
    });
    describe('Sending messages', () => {
        beforeEach(async () => {
            const mockWriter = {
                write: vi.fn().mockResolvedValue(undefined),
                releaseLock: vi.fn(),
            };
            const mockWritableStream = {
                getWriter: vi.fn().mockReturnValue(mockWriter),
            };
            const mockStream = {
                writable: mockWritableStream,
                readable: new ReadableStream(),
            };
            mockWebTransport.createBidirectionalStream.mockResolvedValue(mockStream);
            await client.connect();
        });
        it('should send position update', () => {
            expect(() => {
                client.sendPositionUpdate({ x: 1, y: 2, z: 3 }, { x: 0, y: 0, z: 0, w: 1 });
            }).not.toThrow();
        });
        it('should send chat message', () => {
            expect(() => {
                client.sendChatMessage('Hello, world!');
            }).not.toThrow();
        });
        it('should spawn entity', () => {
            expect(() => {
                client.spawnEntity('cube', { color: 'red' });
            }).not.toThrow();
        });
        it('should despawn entity', () => {
            expect(() => {
                client.despawnEntity('entity-123');
            }).not.toThrow();
        });
    });
    describe('Edge cases', () => {
        it('should handle sending when not connected', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            client.sendPositionUpdate({ x: 1, y: 2, z: 3 }, { x: 0, y: 0, z: 0, w: 1 });
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
        it('should handle disconnect when not connected', async () => {
            await expect(client.disconnect()).resolves.not.toThrow();
        });
        it('should handle multiple disconnects', async () => {
            const mockStream = {
                writable: new WritableStream(),
                readable: new ReadableStream(),
            };
            mockWebTransport.createBidirectionalStream.mockResolvedValue(mockStream);
            await client.connect();
            await client.disconnect();
            await client.disconnect(); // Second disconnect should be safe
            expect(client.connected).toBe(false);
        });
    });
});
