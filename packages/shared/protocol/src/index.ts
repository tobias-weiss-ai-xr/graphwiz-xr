/**
 * GraphWiz-XR Protocol
 *
 * Generated from protobuf definitions
 * Do not edit manually - run `pnpm build:proto` to regenerate
 */

// Re-export generated types
export * from './generated/core.js';
export * from './generated/networking.js';

// Re-export utility functions
export { MessageBuilder } from './builder.js';
export { MessageParser } from './parser.js';
export type { Message, PositionUpdate, PresenceEvent } from './types.js';
