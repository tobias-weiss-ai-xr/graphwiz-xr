/**
 * User Settings Schema
 */

export interface UserSettings {
  // Audio Settings
  masterVolume: number;
  voiceChatVolume: number;
  micSensitivity: number;
  micEnabled: boolean;
  pushToTalkEnabled: boolean;
  pushToTalkKey: string;

  // Graphics Settings
  graphicsQuality: 'low' | 'medium' | 'high';
  shadowsEnabled: boolean;
  postProcessingEnabled: boolean;
  vsyncEnabled: boolean;
  targetFPS: number;

  // Network Settings
  forceRelay: boolean;
  maxBitrate: number;
  audioCodec: 'opus' | 'pcmu' | 'pcma';

  // Accessibility
  subtitlesEnabled: boolean;
  uiScale: number;
  reducedMotion: boolean;

  // Privacy
  sharePresence: boolean;
  sharePosition: boolean;

  // Account
  displayName: string;
  statusMessage: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  // Audio
  masterVolume: 0.8,
  voiceChatVolume: 0.7,
  micSensitivity: 0.5,
  micEnabled: true,
  pushToTalkEnabled: false,
  pushToTalkKey: 'Space',

  // Graphics
  graphicsQuality: 'medium',
  shadowsEnabled: true,
  postProcessingEnabled: true,
  vsyncEnabled: true,
  targetFPS: 60,

  // Network
  forceRelay: false,
  maxBitrate: 2500,
  audioCodec: 'opus',

  // Accessibility
  subtitlesEnabled: false,
  uiScale: 1.0,
  reducedMotion: false,

  // Privacy
  sharePresence: true,
  sharePosition: true,

  // Account
  displayName: 'Player',
  statusMessage: '',
};
