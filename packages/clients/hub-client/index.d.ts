/**
 * Hub Client Type Definitions
 * 
 * Provides TypeScript type definitions for all public APIs exported from the hub-client package.
 * Use with `/// <reference types="..." />` or `import type` statements.
 */

// ===== Core Engine Types =====

export type Engine = import('@graphwiz/hub-client/core/engine').Engine;
export type EngineConfig = import('@graphwiz/hub-client/core/config').EngineConfig;

// ===== ECS Types =====

export type World = import('@graphwiz/hub-client/ecs/world').World;
export type Entity = import('@graphwiz/hub-client/ecs/entity').Entity;

export type ComponentClass<T = import('@graphwiz/hub-client/ecs/entity').ComponentClass<T>;

export type TransformComponent = import('@graphwiz/hub-client/ecs/components').TransformComponent;
export type PhysicsComponent = import('@graphwiz/hub-client/ecs/components').PhysicsComponent;
export type AudioComponent = import('@graphwiz/hub-client/ecs/components').AudioComponent;
export type AnimationComponent = import('@graphwiz/hub-client/ecs/components').AnimationComponent;
export type ModelComponent = import('@graphwiz/hub-client/ecs/components').ModelComponent;
export type LightComponent = import('@graphwiz/hub-client/ecs/components').LightComponent;
export type CameraComponent = import('@graphwiz/hub-client/ecs/components').CameraComponent;
export type NetworkSyncComponent = import('@graphwiz/hub-client/ecs/components').NetworkSyncComponent;
export type InteractableComponent = import('@graphwiz/hub-client/ecs/components').InteractableComponent;
export type BillboardComponent = import('@graphwiz/hub-client/ecs/components').BillboardComponent;
export type ParticleComponent = import('@graphwiz/hub-client/ecs/components').ParticleComponent;
export type ColliderComponent = import('@graphwiz/hub-client/ecs/components').ColliderComponent;
export type GrabbableComponent = import('@graphwiz/hub-client/ecs/components').GrabbableComponent;

// ===== System Types =====

export type System = import('@graphwiz/hub-client/ecs/system').System;
export type TransformSystem = import('@graphwiz/hub-client/ecs/systems/transform-system').TransformSystem;
export type PhysicsSystem = import('@graphwiz/hub-client/ecs/systems/physics-system').PhysicsSystem;
export type AudioSystem = import('@graphwiz/hub-client/ecs/systems/audio-system').AudioSystem;
export type AnimationSystem = import('@graphwiz/hub-client/ecs/systems/animation-system').AnimationSystem;
export type BillboardSystem = import('@graphwiz/hub-client/ecs/systems/billboard-system').BillboardSystem;

// ===== XR Input Types =====

export type XRInputManager = import('@graphwiz/hub-client/xr/xr-input-manager').XRInputManager;
export type XRInputSystem = import('@graphwiz/hub-client/xr/xr-input-system').XRInputSystem;
export type XRInputSystemConfig = import('@graphwiz/hub-client/xr/xr-input-manager').XRInputSystemConfig;
export type XRControllerComponent = import('@graphwiz/hub-client/xr/xr-input-system').XRControllerComponent;
export type ControllerState = import('@graphwiz/hub-client/xr/xr-input-manager').ControllerState;
export type ButtonState = import('@graphwiz/hub-client/xr/xr-input-manager').ButtonState;

// ===== Network Types =====

export type WebSocketClient = import('@graphwiz/hub-client/network/websocket-client').WebSocketClient;
export type NetworkSyncSystem = import('@graphwiz/hub-client/network/network-sync').NetworkSyncSystem;

// ===== Voice Types =====

export type VoiceParticipantComponent = import('@graphwiz/hub-client/voice/voice-system').VoiceParticipantComponent;
export type VoiceLocalComponent = import('@graphwiz/hub-client/voice/voice-system').VoiceLocalComponent;
export type VoiceSystem = import('@graphwiz/hub-client/voice/voice-system').VoiceSystem;
export type VoiceChatClient = import('@graphwiz/hub-client/voice/voice-chat-client').VoiceChatClient;

// ===== Asset Loading Types =====

export type AssetLoader = import('@graphwiz/hub-client/core/assets').AssetLoader;

// ===== UI Kit Types =====

export interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (room: RoomDetails) => void;
}

export type CreateRoomModal = (
  props: CreateRoomModalProps
) => JSX.Element;

export interface SceneSelectorProps {
  currentScene: string;
  onSceneChange: (sceneId: string) => void;
}

export type SceneSelector = (
  props: SceneSelectorProps
) => JSX.Element;

export interface RoomSettingsPanelProps {
  roomId: string;
  onClose: () => void;
}

export type RoomSettingsPanel = (
  props: RoomSettingsPanelProps
) => JSX.Element;

export interface DrawingToolsProps {
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onStrokeChange: (stroke: number) => void;
  onClearCanvas: () => void;
}

export type DrawingTools = (
  props: DrawingToolsProps
) => JSX.Element;

export interface ModerationPanelProps {
  onKickUser: (userId: string) => void;
  onMuteUser: (userId: string) => void;
  onLockRoom: (roomId: string, locked: boolean) => void;
}

export type ModerationPanel = (
  props: ModerationPanelProps
) => JSX.Element;

export interface PlayerListProps {
  roomId: string;
}

export type PlayerList = (
  props: PlayerListProps
) => JSX.Element;

export interface RoomButtonProps {
  roomId: string;
  roomName?: string;
}

export type RoomButton = (
  props: RoomButtonProps
) => JSX.Element;

export interface RoomBrowserProps {
  onRoomSelect: (roomId: string) => void;
}

export type RoomBrowser = (
  props: RoomBrowserProps
) => JSX.Element;

export interface RoomPersistenceProps {
  roomId: string;
}

export type RoomPersistence = (
  props: RoomPersistenceProps
) => JSX.Element;

// ===== Portal Types =====

export interface PortalProps {
  toRoomId: string;
  color: string;
}

export type Portal = (
  props: PortalProps
) => JSX.Element;

export interface PortalDemoSceneProps {
  
}

export type PortalDemoScene = (
  props: PortalDemoSceneProps
) => JSX.Element;

// ===== Gesture Recognition Types =====

export interface GestureRecognitionProps {
  onGestureDetected: (gesture: string) => void;
  enabled: boolean;
}

export type GestureRecognition = (
  props: GestureRecognitionProps
) => JSX.Element;

// ===== Settings Types =====

export interface SettingsManager = import('@graphwiz/hub-client/settings/settings-persistence').SettingsManager;

export interface UseRoomManagerProps {
  client: WebSocketClient | null;
}

export type useRoomManager = (
  props: UseRoomManagerProps
) => void;

// ===== Room Management Types =====

export interface RoomDetails {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  isPublic?: boolean;
}

// ===== Scene Rendering Types =====

export interface SceneRendererProps {
  world: World;
  camera?: {
    position: [number, number, number];
    fov: number;
    controls: 'orbit' | 'firstperson' | 'fly' | 'none';
  };
  environment?: boolean;
  shadows?: boolean;
}

export type SceneRenderer = (
  props: SceneRendererProps
) => JSX.Element;

// ===== Entity Rendering Types =====

export interface EntityRendererProps {
  entity: Entity;
}

export type EntityRenderer = (
  props: EntityRendererProps
) => JSX.Element;

// ===== Player Avatar Types =====

export interface NetworkedAvatarProps {
  position: [number, number, number];
  rotation: [number, number, number];
  displayName?: string;
  color?: string;
  isLocalPlayer?: boolean;
}

export type NetworkedAvatar = (
  props: NetworkedAvatarProps
) => JSX.Element;

// ===== Light Component Types =====

export interface LightProps {
  component: LightComponent;
}

export type Light = (
  props: LightProps
) => JSX.Element;

// ===== Utils Types =====

export interface InstancedProps {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  positions?: Float32Array;
  matrices?: Float32Array;
  count: number;
}

export type useInstancedMeshes = (
  props: InstancedProps
) => void;

// ===== API Response Types =====

export interface RoomStats {
  rooms: number;
  users: number;
  entities: number;
  uptime: number;
}

export interface UserStats {
  userId: string;
  displayName: string;
  role: string;
  joinedAt: string;
  lastActive: string;
}

export interface EntityStats {
  total: number;
  active: number;
  visible: number;
}

export interface SystemStatistics {
  cpu: number;
  memory: number;
  networkLatency: number;
  uptime: number;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
}

export interface LogsQuery {
  service?: string;
  level?: 'debug' | 'info' | 'warn' | 'error';
  startTime?: string;
  endTime?: string;
  limit?: number;
}

export interface LogsResponse {
  logs: LogEntry[];
  hasMore: boolean;
}

export interface LogEntry {
  timestamp: string;
  service: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
}

export interface SuccessResponse<T = {
  success: boolean;
  message: string;
  data?: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
}

// ===== API Client Types =====

export interface ModerationClient {
  connect(authToken?: string): void;
  isConnected(): boolean;
  disconnect(): void;
}

// ===== Room Manager Hook Types =====

export interface RoomManagerHook {
  onRoomCreated(room: RoomDetails): void;
  onRoomUpdated(room: RoomDetails): void;
  onRoomDeleted(roomId: string): void;
  onUserJoined(userId: string): void;
  onUserLeft(userId: string): void;
}
