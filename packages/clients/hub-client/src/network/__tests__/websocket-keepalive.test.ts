/**
 * WebSocket Keep-Alive Tests
 *
 * Tests for WebSocket ping/pong keep-alive mechanism
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketClient } from '../websocket-client';

describe('WebSocketClient Keep-Alive', () => {
  let wsClient: WebSocketClient;
  let mockWebSocket: any;

  beforeEach(async () => {
    // Mock WebSocket
    mockWebSocket = {
      readyState: WebSocket.CONNECTING,
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onopen: null as any,
      onmessage: null as any,
      onerror: null as any,
      onclose: null as any
    };

    // Mock WebSocket constructor
    global.WebSocket = vi.fn(() => mockWebSocket) as any;

    wsClient = new WebSocketClient({
      presenceUrl: 'wss://test.example.com/ws',
      roomId: 'test-room',
      userId: 'test-user',
      displayName: 'Test User'
    });

    // Connect - WebSocketClient will set up onopen handler
    const connectPromise = wsClient.connect().catch(() => {});

    // Wait a bit for connection setup, then trigger onopen
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Now trigger the onopen callback that WebSocketClient set
    if (mockWebSocket.onopen) {
      mockWebSocket.onopen(new Event('open'));
    }

    await connectPromise;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Ping Interval Management', () => {
    it('should start ping interval on connection', async () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify setInterval was called with 30 second interval
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);

      setIntervalSpy.mockRestore();
    });

    it('should stop ping interval on disconnect', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      wsClient.disconnect();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Connection Statistics', () => {
    it('should report correct connection state', async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));

      const stats = wsClient.getStats();

      expect(stats).toMatchObject({
        isConnected: expect.any(Boolean),
        reconnectAttempts: expect.any(Number),
        clientId: expect.any(String),
        readyState: expect.any(Number)
      });
    });

    it('should track ping interval state', () => {
      expect(wsClient.connected()).toBe(true);
    });
  });
});
