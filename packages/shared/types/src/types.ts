/**
 * Shared TypeScript type definitions for GraphWiz-XR
 */

// Import protocol types
import type {
  Message,
  MessageType,
  PositionUpdate,
  VoiceData,
  EntitySpawn,
  EntityUpdate,
  EntityDespawn,
  ChatMessage,
  PresenceEvent,
  ClientHello,
  ServerHello,
  WorldState,
  Vector3,
  Quaternion,
} from '@graphwiz/protocol';

// Re-export protocol types
export type {
  Message,
  MessageType,
  PositionUpdate,
  VoiceData,
  EntitySpawn,
  EntityUpdate,
  EntityDespawn,
  ChatMessage,
  PresenceEvent,
  ClientHello,
  ServerHello,
  WorldState,
  Vector3,
  Quaternion,
};

/**
 * Room configuration
 */
export interface RoomConfig {
  id: string;
  name: string;
  description?: string;
  maxPlayers: number;
  isPrivate: boolean;
  createdBy: string;
  createdAt: number;
  tags: string[];
}

/**
 * User profile
 */
export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: number;
}

/**
 * Authentication token
 */
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

/**
 * Asset metadata
 */
export interface AssetMetadata {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  thumbnailUrl?: string;
  size: number;
  createdBy: string;
  createdAt: number;
}

export enum AssetType {
  MODEL = 'model',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  SCENE = 'scene',
}

/**
 * Scene template
 */
export interface SceneTemplate {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  entities: EntityTemplate[];
  createdBy: string;
  createdAt: number;
}

export interface EntityTemplate {
  id: string;
  templateId: string;
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
  components: Record<string, unknown>;
}
