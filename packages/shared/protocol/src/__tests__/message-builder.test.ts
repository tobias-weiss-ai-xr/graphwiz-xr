/**
 * Tests for MessageBuilder
 */

import { describe, it, expect } from 'vitest';
import { MessageBuilder, MessageType } from '../index';
import type { Vector3, Quaternion, PositionUpdate, ChatMessage, EntitySpawn } from '../types';

describe('MessageBuilder', () => {
  describe('createPositionUpdate', () => {
    it('should create valid position update message', () => {
      const position: Vector3 = { x: 1.5, y: 2.0, z: -3.7 };
      const rotation: Quaternion = { x: 0, y: 0, z: 0, w: 1 };
      const update: PositionUpdate = {
        entityId: 'player-123',
        position,
        rotation,
        sequenceNumber: 5,
        timestamp: Date.now(),
      };

      const message = MessageBuilder.createPositionUpdate(update);

      expect(message).toBeDefined();
      expect(message.type).toBe(MessageType.POSITION_UPDATE);
      expect(message.messageId).toBeDefined();
      expect(message.timestamp).toBeDefined();
      expect(message.payload).toEqual(update);
    });

    it('should create position update with negative coordinates', () => {
      const position: Vector3 = { x: -10.5, y: -20.0, z: -30.7 };
      const rotation: Quaternion = { x: 0.707, y: 0, z: 0, w: 0.707 };
      const update: PositionUpdate = {
        entityId: 'player-456',
        position,
        rotation,
        sequenceNumber: 1,
        timestamp: Date.now(),
      };

      const message = MessageBuilder.createPositionUpdate(update);

      expect(message.payload.position).toEqual(position);
      expect(message.payload.rotation).toEqual(rotation);
    });

    it('should handle zero coordinates', () => {
      const position: Vector3 = { x: 0, y: 0, z: 0 };
      const rotation: Quaternion = { x: 0, y: 0, z: 0, w: 1 };
      const update: PositionUpdate = {
        entityId: 'origin',
        position,
        rotation,
        sequenceNumber: 0,
        timestamp: 0,
      };

      const message = MessageBuilder.createPositionUpdate(update);

      expect(message.payload.position).toEqual(position);
    });
  });

  describe('createChatMessage', () => {
    it('should create valid chat message', () => {
      const chat: ChatMessage = {
        fromClientId: 'user-123',
        message: 'Hello, world!',
        timestamp: Date.now(),
        type: 0,
      };

      const message = MessageBuilder.createChatMessage(chat);

      expect(message).toBeDefined();
      expect(message.type).toBe(MessageType.CHAT_MESSAGE);
      expect(message.payload).toEqual(chat);
    });

    it('should handle empty message', () => {
      const chat: ChatMessage = {
        fromClientId: 'user-123',
        message: '',
        timestamp: Date.now(),
        type: 0,
      };

      const message = MessageBuilder.createChatMessage(chat);

      expect(message.payload.message).toBe('');
    });

    it('should handle long message', () => {
      const longMessage = 'A'.repeat(1000);
      const chat: ChatMessage = {
        fromClientId: 'user-123',
        message: longMessage,
        timestamp: Date.now(),
        type: 0,
      };

      const message = MessageBuilder.createChatMessage(chat);

      expect(message.payload.message).toBe(longMessage);
    });

    it('should handle special characters', () => {
      const specialMessage = 'Hello 😊 @user #tag https://example.com';
      const chat: ChatMessage = {
        fromClientId: 'user-123',
        message: specialMessage,
        timestamp: Date.now(),
        type: 0,
      };

      const message = MessageBuilder.createChatMessage(chat);

      expect(message.payload.message).toBe(specialMessage);
    });
  });

  describe('createEntitySpawn', () => {
    it('should create valid entity spawn message', () => {
      const spawn: EntitySpawn = {
        entityId: 'entity-123',
        templateId: 'cube',
        ownerId: 'user-456',
        components: {
          color: 'red',
          size: 1.5,
        },
      };

      const message = MessageBuilder.createEntitySpawn(spawn);

      expect(message).toBeDefined();
      expect(message.type).toBe(MessageType.ENTITY_SPAWN);
      expect(message.payload).toEqual(spawn);
    });

    it('should handle entity with empty components', () => {
      const spawn: EntitySpawn = {
        entityId: 'entity-789',
        templateId: 'sphere',
        ownerId: 'user-123',
        components: {},
      };

      const message = MessageBuilder.createEntitySpawn(spawn);

      expect(message.payload.components).toEqual({});
    });

    it('should handle complex components', () => {
      const spawn: EntitySpawn = {
        entityId: 'entity-complex',
        templateId: 'model',
        ownerId: 'user-123',
        components: {
          transform: {
            position: { x: 1, y: 2, z: 3 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            scale: { x: 1, y: 1, z: 1 },
          },
          metadata: {
            name: 'Test Entity',
            tags: ['test', 'example'],
          },
        },
      };

      const message = MessageBuilder.createEntitySpawn(spawn);

      expect(message.payload.components).toEqual(spawn.components);
    });
  });

  describe('createEntityDespawn', () => {
    it('should create valid entity despawn message', () => {
      const entityId = 'entity-to-remove';
      const message = MessageBuilder.createEntityDespawn(entityId);

      expect(message).toBeDefined();
      expect(message.type).toBe(MessageType.ENTITY_DESPAWN);
      expect(message.payload).toEqual({ entityId });
    });
  });

  describe('Message IDs', () => {
    it('should generate unique message IDs', () => {
      const update = {
        entityId: 'test',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        sequenceNumber: 0,
        timestamp: Date.now(),
      };

      const message1 = MessageBuilder.createPositionUpdate(update);
      const message2 = MessageBuilder.createPositionUpdate(update);

      expect(message1.messageId).not.toBe(message2.messageId);
    });
  });

  describe('Timestamps', () => {
    it('should include timestamp in messages', () => {
      const beforeTime = Date.now();
      const update = {
        entityId: 'test',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        sequenceNumber: 0,
        timestamp: beforeTime,
      };

      const message = MessageBuilder.createPositionUpdate(update);
      const afterTime = Date.now();

      expect(message.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(message.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });
});
