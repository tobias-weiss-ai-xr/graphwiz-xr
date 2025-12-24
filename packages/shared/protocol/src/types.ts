/**
 * Shared type definitions for GraphWiz-XR protocol
 */

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export enum MessageType {
  UNKNOWN = 0,
  // Connection lifecycle
  CLIENT_HELLO = 1,
  SERVER_HELLO = 2,
  // Real-time updates
  POSITION_UPDATE = 10,
  VOICE_DATA = 11,
  // Entity management
  ENTITY_SPAWN = 20,
  ENTITY_UPDATE = 21,
  ENTITY_DESPAWN = 22,
  // Communication
  CHAT_MESSAGE = 30,
  // Presence
  PRESENCE_JOIN = 40,
  PRESENCE_LEAVE = 41,
  PRESENCE_UPDATE = 42,
}

export interface PositionUpdate {
  entityId: string;
  position: Vector3;
  rotation: Quaternion;
  sequenceNumber: number;
  timestamp: number;
}

export interface VoiceData {
  fromClientId: string;
  audioData: ArrayBuffer;
  sequenceNumber: number;
  codec: VoiceCodec;
}

export enum VoiceCodec {
  OPUS = 0,
  PCMU = 1,
  PCMA = 2,
}

export interface EntitySpawn {
  entityId: string;
  templateId: string;
  ownerId: string;
  components: Record<string, unknown>;
}

export interface EntityUpdate {
  entityId: string;
  components: Record<string, unknown>;
}

export interface EntityDespawn {
  entityId: string;
}

export interface ChatMessage {
  fromClientId: string;
  message: string;
  timestamp: number;
  type: ChatMessageType;
}

export enum ChatMessageType {
  NORMAL = 0,
  WHISPER = 1,
  SHOUT = 2,
}

export interface PresenceEvent {
  clientId: string;
  eventType: PresenceEventType;
  data: PresenceData;
}

export enum PresenceEventType {
  JOIN = 0,
  LEAVE = 1,
  UPDATE = 2,
}

export interface PresenceData {
  displayName?: string;
  avatarUrl?: string;
  position?: Vector3;
  rotation?: Quaternion;
}

export interface Message {
  messageId: string;
  timestamp: number;
  type: MessageType;
  payload:
    | ClientHello
    | ServerHello
    | PositionUpdate
    | VoiceData
    | EntitySpawn
    | EntityUpdate
    | EntityDespawn
    | ChatMessage
    | PresenceEvent;
}

export interface ClientHello {
  clientId: string;
  displayName: string;
  authToken: string;
  requestedRoom: string;
}

export interface ServerHello {
  serverVersion: string;
  assignedClientId: string;
  roomId: string;
  initialState?: WorldState;
}

export interface WorldState {
  entities: EntitySnapshot[];
  players: PlayerSnapshot[];
  lastUpdate: number;
}

export interface EntitySnapshot {
  id: string;
  templateId: string;
  position: Vector3;
  rotation: Quaternion;
  components: Record<string, unknown>;
}

export interface PlayerSnapshot {
  clientId: string;
  displayName: string;
  avatarUrl: string;
  position: Vector3;
  rotation: Quaternion;
}
