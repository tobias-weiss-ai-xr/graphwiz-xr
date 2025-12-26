/**
 * GraphWiz-XR Protocol
 *
 * Generated from protobuf definitions
 * Do not edit manually - run `pnpm build:proto` to regenerate
 */

// Re-export generated types
export type { Vector3, Quaternion } from './generated/core.js';

// Re-export utility functions
export { MessageBuilder } from './builder.js';
export { MessageParser } from './parser.js';

// Re-export all types from types.ts
export type * from './types.js';

// Re-export enums as values
export {
  MessageType,
  VoiceCodec,
  ChatMessageType,
  PresenceEventType,
  PermissionLevel,
  TrackKind,
  SessionDescriptionType,
  VideoCodecType
} from './types.js';

// Re-export all networking types
export type * from './generated/networking.js';

// Re-export room types (avoiding duplicates with types.ts)
export type {
  RoomPermissions
} from './types.js';

// Re-export media types (avoiding duplicates with types.ts)
// All media types are already exported from types.ts
