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

  beforeEach(() => {
    // Mock WebSocket
    mockWebSocket = {
      readyState: WebSocket.CONNECTING,
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // Mock WebSocket constructor
    global.WebSocket = vi.fn(() => mockWebSocket) as any;

    wsClient = new WebSocketClient({
      presenceUrl: 'wss://test.example.com/ws',
      roomId: 'test-room',
      userId: 'test-user',
      displayName: 'Test User',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Ping Interval Management', () => {
    it('should start ping interval on connection', async () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');

      // Simulate successful connection
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'open'
      )?.[1]();

      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify setInterval was called with 30 second interval
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        30000
      );

      setIntervalSpy.mockRestore();
    });

    it('should stop ping interval on disconnect', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      wsClient.disconnect();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('should send ping message every 30 seconds', async () => {
      // Connect
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'open'
      )?.[1]();

      await new Promise(resolve => setTimeout(resolve, 100));

      // Get the interval callback
      const setIntervalCalls = (global.setInterval as any).mock.calls;
      const pingCallback = setIntervalCalls?.[setIntervalCalls.length - 1]?.[0];

      expect(pingCallback).toBeDefined();

      // Manually trigger ping
      if (pingCallback) {
        pingCallback();
      }

      // Verify ping message was sent
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":255')
      );
    });

    it('should handle send errors gracefully', async () => {
      mockWebSocket.send = vi.fn(() => {
        throw new Error('Network error');
      });

      // Connect
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'open'
      )?.[1]();

      await new Promise(resolve => setTimeout(resolve, 100));

      // Get ping callback and trigger it
      const setIntervalCalls = (global.setInterval as any).mock.calls;
      const pingCallback = setIntervalCalls?.[setIntervalCalls.length - 1]?.[0];

      if (pingCallback) {
        // Should not throw
        expect(() => pingCallback()).not.toThrow();
      }
    });

    it('should clear existing interval before starting new one', async () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      // Connect first time
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'open'
      )?.[1]();

      await new Promise(resolve => setTimeout(resolve, 100));

      const firstClearCalls = clearIntervalSpy.mock.calls.length;

      // Simulate reconnection by calling connect again
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'open'
      )?.[1]();

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should have called clearInterval at least once more
      expect(clearIntervalSpy.mock.calls.length).toBeGreaterThan(firstClearCalls);

      clearIntervalSpy.mockRestore();
    });
  });

  describe('Ping Message Format', () => {
    it('should send JSON ping with correct structure', async () => {
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'open'
      )?.[1]();

      await new Promise(resolve => setTimeout(resolve, 100));

      // Get ping callback
      const setIntervalCalls = (global.setInterval as any).mock.calls;
      const pingCallback = setIntervalCalls?.[setIntervalCalls.length - 1]?.[0];

      if (pingCallback) {
        pingCallback();
      }

      const sentData = mockWebSocket.send.mock.calls[0]?.[0];
      expect(sentData).toBeDefined();

      const parsed = JSON.parse(sentData);
      expect(parsed).toMatchObject({
        messageId: expect.stringContaining('ping-'),
        timestamp: expect.any(Number),
        type: 255,
        payload: null,
      });
    });

    it('should use current timestamp in ping messages', async () => {
      const now = Date.now();

      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'open'
      )?.[1]();

      await new Promise(resolve => setTimeout(resolve, 100));

      // Get ping callback
      const setIntervalCalls = (global.setInterval as any).mock.calls;
      const pingCallback = setIntervalCalls?.[setIntervalCalls.length - 1]?.[0];

      if (pingCallback) {
        pingCallback();
      }

      const sentData = mockWebSocket.send.mock.calls[0]?.[0];
      const parsed = JSON.parse(sentData);

      // Timestamp should be close to now
      expect(parsed.timestamp).toBeGreaterThanOrEqual(now);
      expect(parsed.timestamp).toBeLessThanOrEqual(now + 100);
    });
  });

  describe('Connection State and Keep-Alive', () => {
    it('should not start ping if connection fails', async () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');

      // Simulate connection error
      mockWebSocket.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'error'
      )?.[1](new Error('Connection failed'));

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not have started ping interval
      expect(setIntervalSpy).not.toHaveBeenCalled();

      setIntervalSpy.mockRestore();
    });

    it('should stop ping on unexpected close', async () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      // Connect
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'open'
      )?.[1]();

      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate unexpected close
      mockWebSocket.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'close'
      )?.[1]({ code: 1006, reason: 'Abnormal closure' });

      // Should have stopped ping interval
      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });

  describe('Connection Statistics', () => {
    it('should report correct connection state', () => {
      const stats = wsClient.getStats();

      expect(stats).toMatchObject({
        isConnected: expect.any(Boolean),
        reconnectAttempts: expect.any(Number),
        clientId: expect.any(String),
        readyState: expect.any(Number),
      });
    });

    it('should track ping interval state', async () => {
      // Initially not connected
      expect(wsClient.connected()).toBe(false);

      // Connect
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'open'
      )?.[1]();

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should be connected now
      expect(wsClient.connected()).toBe(true);
    });
  });
});
