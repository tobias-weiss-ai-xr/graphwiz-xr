/**
 * Voice Chat Module
 *
 * Exports all voice chat functionality for WebRTC audio streaming.
 */

export { VoiceChatClient } from './voice-chat-client.disabled';
export { VoiceSystem, VoiceParticipantComponent, VoiceLocalComponent } from './voice-system';
export type {
  VoiceChatConfig,
  AudioStreamInfo,
  VoiceChatStats
} from './voice-chat-client.disabled';
export type { VoiceSystemConfig } from './voice-system';
