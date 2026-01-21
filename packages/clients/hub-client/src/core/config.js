/**
 * Engine configuration types
 */
export const DEFAULT_ENGINE_CONFIG = {
    targetFPS: 60,
    enablePhysics: false,
    enableNetworking: false,
};
export const DEFAULT_NETWORK_CONFIG = {
    serverUrl: 'ws://localhost:4000',
    useWebTransport: true,
    reconnectAttempts: 5,
    reconnectDelay: 1000,
};
export const DEFAULT_RENDERER_CONFIG = {
    shadows: true,
    antialias: true,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    toneMapping: 'aces',
};
