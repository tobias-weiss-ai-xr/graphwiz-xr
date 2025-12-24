/**
 * Message Builder for GraphWiz-XR protocol
 */

import type { Message, PositionUpdate } from './types.js';
import { MessageType } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export class MessageBuilder {
  /**
   * Create a message with the given type and payload
   */
  static create(type: MessageType, payload: Message['payload']): Message {
    return {
      messageId: uuidv4(),
      timestamp: Date.now(),
      type,
      payload,
    };
  }

  /**
   * Create a position update message
   */
  static createPositionUpdate(update: PositionUpdate): Message {
    return this.create(MessageType.POSITION_UPDATE, update);
  }

  /**
   * Create a voice data message
   */
  static createVoiceData(data: {
    fromClientId: string;
    audioData: ArrayBuffer;
    sequenceNumber: number;
    codec: number;
  }): Message {
    return this.create(MessageType.VOICE_DATA, data);
  }

  /**
   * Create an entity spawn message
   */
  static createEntitySpawn(spawn: {
    entityId: string;
    templateId: string;
    ownerId: string;
    components: Record<string, unknown>;
  }): Message {
    return this.create(MessageType.ENTITY_SPAWN, spawn);
  }

  /**
   * Create an entity despawn message
   */
  static createEntityDespawn(entityId: string): Message {
    return this.create(MessageType.ENTITY_DESPAWN, { entityId });
  }

  /**
   * Create a chat message
   */
  static createChatMessage(chat: {
    fromClientId: string;
    message: string;
    type: number;
  }): Message {
    return this.create(MessageType.CHAT_MESSAGE, {
      ...chat,
      timestamp: Date.now(),
    });
  }

  /**
   * Create a presence event
   */
  static createPresenceEvent(presence: {
    clientId: string;
    eventType: number;
    data: {
      displayName?: string;
      avatarUrl?: string;
      position?: { x: number; y: number; z: number };
      rotation?: { x: number; y: number; z: number; w: number };
    };
  }): Message {
    return this.create(MessageType.PRESENCE_UPDATE, presence);
  }
}
