/**
 * User Settings Schema
 */
export const DEFAULT_SETTINGS = {
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
