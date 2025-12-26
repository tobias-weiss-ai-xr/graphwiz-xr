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
 * User with roles and profile information
 */
export interface User {
  id: string;
  name: string;
  avatar?: string;
  roles: UserRole[];
  createdAt: number;
  updatedAt: number;
}

export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest',
}

/**
 * Room configuration and permissions
 */
export interface Room {
  id: string;
  name: string;
  description?: string;
  scene: string;
  maxOccupants: number;
  currentOccupants: number;
  permissions: RoomPermissions;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface RoomPermissions {
  enter: boolean;
  chat: boolean;
  voice: boolean;
  spawn: boolean;
  move: boolean;
}

/**
 * Message with sender information
 */
export interface Chat {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: ChatType;
}

export enum ChatType {
  TEXT = 'text',
  SYSTEM = 'system',
  PRIVATE = 'private',
}

/**
 * Position in 3D space with rotation
 */
export interface Position {
  x: number;
  y: number;
  z: number;
  rotation: number;
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
