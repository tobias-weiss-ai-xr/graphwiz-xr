/**
 * Network Module
 *
 * Exports all network-related functionality for real-time multiplayer.
 */

export { NetworkClient } from './client';
export { WebSocketClient } from './websocket-client';
export { WebTransportClient } from './webtransport-client';
export { UnifiedNetworkClient } from './unified-client';
export type { TransportType, UnifiedClientConfig } from './unified-client';
export { NetworkSystem } from './system';
export { NetworkSyncComponent } from './network-sync';
export type { NetworkConfig } from './client';
export type { NetworkSyncConfig } from './network-sync';
export type { WebSocketClientConfig, MessageHandler } from './websocket-client';
export type { WebTransportClientConfig } from './webtransport-client';
