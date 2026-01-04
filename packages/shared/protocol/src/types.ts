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
  EMOJI_REACTION = 31,
  // Object interaction
  OBJECT_GRAB = 32,
  OBJECT_RELEASE = 33,
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

export interface EmojiReaction {
  fromClientId: string;
  emoji: string;
  position: Vector3;
  timestamp: number;
  reactionId: string;
}

export interface PresenceEvent {
  clientId: string;
  eventType: PresenceEventType;
  data: PresenceData;
}

export interface ObjectGrab {
  entityId: string;
  clientId: string;
  position: Vector3;
  timestamp: number;
}

export interface ObjectRelease {
  entityId: string;
  clientId: string;
  position: Vector3;
  velocity: Vector3;
  timestamp: number;
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
    | EmojiReaction
    | ObjectGrab
    | ObjectRelease
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

// Room types
export interface Room {
  id: string;
  name: string;
  description: string;
  settings: RoomSettings;
  createdAt: number;
  updatedAt: number;
  creatorId: string;
  currentPlayers: number;
  tags: string[];
  metadata: Record<string, string>;
}

export interface RoomSettings {
  maxPlayers: number;
  isPublic: boolean;
  allowVoiceChat: boolean;
  allowTextChat: boolean;
  allowInvites: boolean;
  maxSpectators: number;
  requireApproval: boolean;
  passwordHash?: string;
  customSettings?: Record<string, string>;
}

export enum PermissionLevel {
  NONE = 0,
  VIEWER = 1,
  PARTICIPANT = 2,
  MODERATOR = 3,
  OWNER = 4,
}

export interface RoomPermissions {
  ownerIds: string[];
  moderatorIds: string[];
  bannedUserIds: string[];
  allowedUserIds: string[];
  defaultPermission: PermissionLevel;
}

// User types
export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  createdAt: number;
  metadata: Record<string, string>;
}

export interface AuthToken {
  token: string;
  userId: string;
  expiresAt: number;
  permissions: string[];
}

// Media types
export enum TrackKind {
  AUDIO = 0,
  VIDEO = 1,
  DATA = 2,
}

export enum SessionDescriptionType {
  OFFER = 0,
  ANSWER = 1,
  PRANSWER = 2,
  ROLLBACK = 3,
}

export enum VideoCodecType {
  VP8 = 0,
  VP9 = 1,
  H264 = 2,
  AV1 = 3,
}

export interface MediaConstraints {
  audio: boolean;
  video: boolean;
  data: boolean;
  audioConstraints?: AudioConstraints;
  videoConstraints?: VideoConstraints;
}

export interface AudioConstraints {
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  sampleRate: number;
  channelCount: number;
}

export interface VideoConstraints {
  maxWidth: number;
  maxHeight: number;
  maxFrameRate: number;
  preferredCodec: VideoCodecType;
}

export interface IceCandidate {
  candidate: string;
  sdpMid: string;
  sdpMLineIndex: number;
  usernameFragment: string;
}
