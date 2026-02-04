/**
 * Engine configuration types
 */

export interface EngineConfig {
  targetFPS?: number;
  enablePhysics?: boolean;
  enableNetworking?: boolean;
}

export interface NetworkConfig {
  serverUrl: string;
  useWebTransport: boolean;
  reconnectAttempts: number;
  reconnectDelay: number;
}

export interface RendererConfig {
  shadows: boolean;
  antialias: boolean;
  pixelRatio: number;
  toneMapping: 'none' | 'linear' | 'reinhard' | 'cineon' | 'aces';
}

export const DEFAULT_ENGINE_CONFIG: Required<EngineConfig> = {
  targetFPS: 60,
  enablePhysics: false,
  enableNetworking: false,
};

export const DEFAULT_NETWORK_CONFIG: Required<NetworkConfig> = {
  serverUrl: 'ws://localhost:4000',
  useWebTransport: true,
  reconnectAttempts: 5,
  reconnectDelay: 1000,
};

export const DEFAULT_RENDERER_CONFIG: Required<RendererConfig> = {
  shadows: true,
  antialias: true,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
  toneMapping: 'aces',
};
