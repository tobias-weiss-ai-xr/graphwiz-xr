/**
 * WebSocket Mock Utilities for E2E Tests
 *
 * Provides mock WebSocket functionality for testing network sync
 * without requiring a live server connection.
 */

import { Page } from '@playwright/test';

/**
 * Message types matching the WebSocket protocol
 */
export enum MessageType {
  POSITION_UPDATE = 1,
  ENTITY_SPAWN = 2,
  ENTITY_DESPAWN = 3,
  CHAT_MESSAGE = 4,
  ENTITY_UPDATE = 21
}

/**
 * Entity data structure
 */
export interface MockEntity {
  entityId: string;
  ownerId: string;
  templateId?: string;
  components?: Record<string, unknown>;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number; w: number };
}

/**
 * Position update data
 */
export interface PositionUpdate {
  entityId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
}

/**
 * Sent message record
 */
export interface SentMessage {
  type: MessageType;
  timestamp: number;
  data: unknown;
}

/**
 * Mock WebSocket state
 */
interface MockWebSocketState {
  connected: boolean;
  sentMessages: SentMessage[];
  receivedMessages: unknown[];
}

/**
 * Setup WebSocket mock on the page
 * Intercepts WebSocket connections and provides mock behavior
 */
export async function mockWebSocket(page: Page): Promise<void> {
  // Initialize mock state in the page
  await page.evaluate(() => {
    (window as any).__mockWebSocket = {
      connected: false,
      sentMessages: [],
      receivedMessages: [],
      listeners: new Map<string, Set<Function>>()
    };

    // Create a mock WebSocket class
    class MockWebSocket {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSING = 2;
      static CLOSED = 3;

      readyState = MockWebSocket.OPEN;
      url: string;

      onopen: ((event: Event) => void) | null = null;
      onclose: ((event: CloseEvent) => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;

      constructor(url: string) {
        this.url = url;
        (window as any).__mockWebSocket.connected = true;

        // Simulate async connection
        setTimeout(() => {
          if (this.onopen) {
            this.onopen(new Event('open'));
          }
        }, 100);
      }

      send(data: string | ArrayBuffer) {
        const state = (window as any).__mockWebSocket;
        let parsedData: unknown;

        if (typeof data === 'string') {
          try {
            parsedData = JSON.parse(data);
          } catch {
            parsedData = data;
          }
        } else {
          // Binary data - just record it
          parsedData = { binary: true, size: data.byteLength };
        }

        state.sentMessages.push({
          type: (parsedData as { type?: number })?.type || 0,
          timestamp: Date.now(),
          data: parsedData
        });
      }

      close() {
        this.readyState = MockWebSocket.CLOSED;
        (window as any).__mockWebSocket.connected = false;
        if (this.onclose) {
          this.onclose(new CloseEvent('close'));
        }
      }

      addEventListener(type: string, callback: Function) {
        const state = (window as any).__mockWebSocket;
        if (!state.listeners.has(type)) {
          state.listeners.set(type, new Set());
        }
        state.listeners.get(type).add(callback);
      }

      removeEventListener(type: string, callback: Function) {
        const state = (window as any).__mockWebSocket;
        state.listeners.get(type)?.delete(callback);
      }
    }

    // Replace WebSocket with mock
    (window as any).OriginalWebSocket = (window as any).WebSocket;
    (window as any).WebSocket = MockWebSocket;
  });
}

/**
 * Simulate receiving an entity spawn message
 */
export async function simulateEntitySpawn(page: Page, entity: MockEntity): Promise<void> {
  await page.evaluate((entity) => {
    const state = (window as any).__mockWebSocket;
    if (!state?.connected) {
      throw new Error('Mock WebSocket not connected');
    }

    const message = {
      type: MessageType.ENTITY_SPAWN,
      ...entity,
      timestamp: Date.now()
    };

    state.receivedMessages.push(message);

    // Trigger message event on any active WebSocket instances
    const event = new MessageEvent('message', {
      data: JSON.stringify(message)
    });

    // Dispatch to listeners
    const listeners = state.listeners.get('message');
    if (listeners) {
      listeners.forEach((callback: Function) => callback(event));
    }
  }, entity);
}

/**
 * Simulate receiving a position update message
 */
export async function simulatePositionUpdate(
  page: Page,
  entityId: string,
  position: { x: number; y: number; z: number },
  rotation?: { x: number; y: number; z: number; w: number }
): Promise<void> {
  await page.evaluate(
    ({ entityId, position, rotation }) => {
      const state = (window as any).__mockWebSocket;
      if (!state?.connected) {
        throw new Error('Mock WebSocket not connected');
      }

      const message = {
        type: MessageType.POSITION_UPDATE,
        entityId,
        position,
        rotation: rotation || { x: 0, y: 0, z: 0, w: 1 },
        timestamp: Date.now()
      };

      state.receivedMessages.push(message);

      const event = new MessageEvent('message', {
        data: JSON.stringify(message)
      });

      const listeners = state.listeners.get('message');
      if (listeners) {
        listeners.forEach((callback: Function) => callback(event));
      }
    },
    { entityId, position, rotation }
  );
}

/**
 * Simulate receiving an entity update message (for state sync)
 */
export async function simulateEntityUpdate(
  page: Page,
  entityId: string,
  updates: Record<string, unknown>
): Promise<void> {
  await page.evaluate(
    ({ entityId, updates }) => {
      const state = (window as any).__mockWebSocket;
      if (!state?.connected) {
        throw new Error('Mock WebSocket not connected');
      }

      const message = {
        type: MessageType.ENTITY_UPDATE,
        entityId,
        ...updates,
        timestamp: Date.now()
      };

      state.receivedMessages.push(message);

      const event = new MessageEvent('message', {
        data: JSON.stringify(message)
      });

      const listeners = state.listeners.get('message');
      if (listeners) {
        listeners.forEach((callback: Function) => callback(event));
      }
    },
    { entityId, updates }
  );
}

/**
 * Simulate receiving an entity despawn message
 */
export async function simulateEntityDespawn(page: Page, entityId: string): Promise<void> {
  await page.evaluate((entityId) => {
    const state = (window as any).__mockWebSocket;
    if (!state?.connected) {
      throw new Error('Mock WebSocket not connected');
    }

    const message = {
      type: MessageType.ENTITY_DESPAWN,
      entityId,
      timestamp: Date.now()
    };

    state.receivedMessages.push(message);

    const event = new MessageEvent('message', {
      data: JSON.stringify(message)
    });

    const listeners = state.listeners.get('message');
    if (listeners) {
      listeners.forEach((callback: Function) => callback(event));
    }
  }, entityId);
}

/**
 * Get all messages sent by the client
 */
export async function getSentMessages(page: Page): Promise<SentMessage[]> {
  return page.evaluate(() => {
    const state = (window as any).__mockWebSocket;
    return state?.sentMessages || [];
  });
}

/**
 * Get messages of a specific type sent by the client
 */
export async function getSentMessagesByType(
  page: Page,
  messageType: MessageType
): Promise<SentMessage[]> {
  return page.evaluate((type) => {
    const state = (window as any).__mockWebSocket;
    return (state?.sentMessages || []).filter((msg: SentMessage) => msg.type === type);
  }, messageType);
}

/**
 * Get all received messages
 */
export async function getReceivedMessages(page: Page): Promise<unknown[]> {
  return page.evaluate(() => {
    const state = (window as any).__mockWebSocket;
    return state?.receivedMessages || [];
  });
}

/**
 * Clear all recorded messages
 */
export async function clearMessages(page: Page): Promise<void> {
  await page.evaluate(() => {
    const state = (window as any).__mockWebSocket;
    if (state) {
      state.sentMessages = [];
      state.receivedMessages = [];
    }
  });
}

/**
 * Check if mock WebSocket is connected
 */
export async function isMockConnected(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const state = (window as any).__mockWebSocket;
    return state?.connected || false;
  });
}

/**
 * Simulate WebSocket disconnection
 */
export async function simulateDisconnect(page: Page): Promise<void> {
  await page.evaluate(() => {
    const state = (window as any).__mockWebSocket;
    if (state) {
      state.connected = false;
    }
  });
}

/**
 * Simulate WebSocket reconnection
 */
export async function simulateReconnect(page: Page): Promise<void> {
  await page.evaluate(() => {
    const state = (window as any).__mockWebSocket;
    if (state) {
      state.connected = true;
    }
  });
}

/**
 * Cleanup mock WebSocket and restore original
 */
export async function cleanupMockWebSocket(page: Page): Promise<void> {
  await page.evaluate(() => {
    if ((window as any).OriginalWebSocket) {
      (window as any).WebSocket = (window as any).OriginalWebSocket;
      delete (window as any).OriginalWebSocket;
    }
    delete (window as any).__mockWebSocket;
  });
}
