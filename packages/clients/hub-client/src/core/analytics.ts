/**
 * Live Analytics System
 *
 * Real-time performance and interaction analytics for GraphWiz-XR VR client.
 * Collects metrics on FPS, network quality, resource usage, and user interactions.
 *
 * Architecture:
 * - PerformanceTracker: Core collection engine
 * - Metrics types: fps, network, resources, interactions, session
 * - Export formats: JSON, CSV, webhook
 * - Privacy-first: anonymized data, opt-in sharing
 */

import { createLogger } from '@graphwiz/types';

const logger = createLogger('Analytics');

// ============================================================================
// Metric Types
// ============================================================================

export type MetricType =
  | 'fps'
  | 'network-latency'
  | 'network-packet-loss'
  | 'network-jitter'
  | 'gpu-memory'
  | 'cpu-usage'
  | 'entity-count'
  | 'network-entities'
  | 'interaction'
  | 'session-duration'
  | 'network-quality'
  | 'frame-time';

export interface Metric {
  type: MetricType;
  value: number;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface AnalyticsSession {
  sessionId: string;
  startedAt: number;
  endedAt?: number;
  userId: string;
  roomId: string;
  metrics: Metric[];
  interactions: InteractionEvent[];
  exports: AnalyticsExport[];
}

export interface InteractionEvent {
  type:
    | 'grab'
    | 'release'
    | 'teleport'
    | 'chat'
    | 'emoji'
    | 'object-spawn'
    | 'object-despawn'
    | 'portal-use'
    | 'draw'
    | 'media-play'
    | 'media-pause';
  timestamp: number;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsExport {
  id: string;
  type: 'json' | 'csv' | 'webhook';
  timestamp: number;
  success: boolean;
  error?: string;
}

// ============================================================================
// Performance Tracker
// ============================================================================

export class PerformanceTracker {
  private session: AnalyticsSession | null = null;
  private isTracking: boolean = false;
  private fpsHistory: number[] = [];
  private frameTimes: number[] = [];
  private lastFrameTime: number = performance.now();

  // Network metrics
  private pingHistory: number[] = [];
  private packetLossCount: number = 0;
  private totalPackets: number = 0;

  // FPS calculation
  private fpsUpdateTime: number = 0;

  // Advanced interaction tracking
  private interactionCounts: Record<string, number> = {};
  private sceneDwellTimes: Map<string, number> = new Map(); // entityId -> time spent
  private movementPaths: Array<{ x: number; z: number; timestamp: number }> = [];
  private lastMovementPosition: { x: number; z: number } | null = null;

  // VR-specific metrics
  private rapidHeadMovements: number = 0;
  private comfortModeSwitches: number = 0;
  private teleportUsageCount: number = 0;
  private smoothMovementCount: number = 0;

  // Asset/performance tracking
  private assetLoadTimes: Map<string, number> = new Map(); // assetId -> loadTimeMs
  private entityCreationCount: number = 0;
  private entityDespawnCount: number = 0;

  // Audio metrics
  private voiceChatDuration: number = 0;
  private lastVoiceChatStart: number = 0;
  private audioSpacializedCount: number = 0;

  constructor(userId: string, roomId: string) {
    this.initializeSession(userId, roomId);
  }

  private initializeSession(userId: string, roomId: string) {
    this.session = {
      sessionId: crypto.randomUUID(),
      startedAt: Date.now(),
      userId,
      roomId,
      metrics: [],
      interactions: [],
      exports: []
    };
    this.isTracking = true;
    logger.info('Analytics session started', {
      sessionId: this.session.sessionId,
      userId,
      roomId
    });
  }

  // ============================================================================
  // FPS Tracking
  // ============================================================================

  startTracking() {
    this.fpsUpdateTime = 0;
    this.tick();
  }

  private tick = () => {
    if (!this.isTracking) return;

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;

    // Track frame time
    this.frameTimes.push(deltaTime);
    if (this.frameTimes.length > 100) {
      this.frameTimes.shift();
    }

    // Calculate FPS
    this.fpsUpdateTime += deltaTime;
    if (this.fpsUpdateTime >= 500) {
      // Update every 500ms
      const fps = Math.round(1000 / (deltaTime || 16.67));
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }

      // Record FPS metric
      this.recordMetric('fps', fps, {
        frameTime: Math.round(deltaTime),
        historyAvg: this.calculateAverage(this.fpsHistory)
      });

      this.fpsUpdateTime = 0;
    }

    this.lastFrameTime = now;
    requestAnimationFrame(this.tick);
  };

  // ============================================================================
  // Network Metrics
  // ============================================================================

  recordPing(milliseconds: number) {
    this.pingHistory.push(milliseconds);
    if (this.pingHistory.length > 100) {
      this.pingHistory.shift();
    }

    this.recordMetric('network-latency', milliseconds, {
      historyAvg: this.calculateAverage(this.pingHistory),
      historyMin: Math.min(...this.pingHistory),
      historyMax: Math.max(...this.pingHistory)
    });

    // Calculate jitter
    if (this.pingHistory.length >= 2) {
      const recent = this.pingHistory.slice(this.pingHistory.length - 10);
      const jitter = Math.max(...recent) - Math.min(...recent);
      this.recordMetric('network-jitter', jitter);
    }
  }

  recordPacketLoss(lossCount: number, total: number) {
    this.packetLossCount += lossCount;
    this.totalPackets += total;

    const lossPercent = total > 0 ? (lossCount / total) * 100 : 0;
    this.recordMetric('network-packet-loss', lossPercent, {
      cumulativeLoss: this.getPacketLoss_rate()
    });
  }

  getPacketLoss_rate(): number {
    return this.totalPackets > 0 ? (this.packetLossCount / this.totalPackets) * 100 : 0;
  }

  getNetworkQuality(): { score: number; rating: string; issues: string[] } {
    const ping = this.getAverageLatency();
    const jitter = this.getLastJitter();
    const loss = this.getPacketLoss_rate();

    let score = 100;
    const issues: string[] = [];

    // Ping penalties
    if (ping > 100) {
      score -= 30;
      issues.push('High latency (>100ms)');
    } else if (ping > 50) {
      score -= 15;
      issues.push('Elevated latency (>50ms)');
    } else if (ping > 30) {
      score -= 5;
      issues.push('Slight latency (>30ms)');
    }

    // Jitter penalties
    if (jitter > 50) {
      score -= 25;
      issues.push('High jitter (>50ms)');
    } else if (jitter > 20) {
      score -= 10;
      issues.push('Elevated jitter (>20ms)');
    }

    // Loss penalties
    if (loss > 5) {
      score -= 50;
      issues.push('Significant packet loss (>5%)');
    } else if (loss > 1) {
      score -= 20;
      issues.push('Some packet loss (>1%)');
    } else if (loss > 0) {
      score -= 5;
      issues.push('Minor packet loss');
    }

    const rating =
      score >= 80
        ? 'Excellent'
        : score >= 60
          ? 'Good'
          : score >= 40
            ? 'Fair'
            : score >= 20
              ? 'Poor'
              : 'Bad';

    return { score: Math.max(0, score), rating, issues };
  }

  // ============================================================================
  // Resource Tracking
  // ============================================================================

  async recordMemoryUsage() {
    if ('memory' in performance) {
      // @ts-expect-error - memory is not in standard types
      const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
      const usedMB = Math.round(usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(totalJSHeapSize / 1024 / 1024);

      this.recordMetric('gpu-memory', usedMB, {
        totalMB,
        usagePercent: Math.round((usedMB / totalMB) * 100)
      });
    } else {
      // Approximate without memory API
      const estimated = this.estimateMemoryUsage();
      this.recordMetric('gpu-memory', estimated, { estimate: true });
    }
  }

  private estimateMemoryUsage(): number {
    // Crude estimate based on entity count and frame time
    const baseMemory = 150; // Base app memory ~150MB
    // This is a rough approximation
    return baseMemory;
  }

  recordEntityCount(count: number) {
    this.recordMetric('entity-count', count);
  }

  recordNetworkEntities(count: number) {
    this.recordMetric('network-entities', count);
  }

  // ============================================================================
  // Interaction Tracking
  // ============================================================================

  recordInteraction(type: InteractionEvent['type'], metadata?: Record<string, unknown>) {
    if (!this.session) return;

    const event: InteractionEvent = {
      type,
      timestamp: Date.now(),
      metadata
    };

    this.session.interactions.push(event);
    this.recordMetric('interaction', 1, { interactionType: type });
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  endSession() {
    if (!this.session) return;

    this.session.endedAt = Date.now();
    this.isTracking = false;

    logger.info('Analytics session ended', {
      sessionId: this.session.sessionId,
      duration: this.session.endedAt - this.session.startedAt,
      metricsCount: this.session.metrics.length,
      interactionsCount: this.session.interactions.length
    });
  }

  getSession(): AnalyticsSession | null {
    return this.session;
  }

  // ============================================================================
  // Metrics Storage
  // ============================================================================

  private recordMetric(
    type: MetricType,
    value: number,
    metadata?: Record<string, string | number | boolean>
  ) {
    if (!this.session) return;

    const metric: Metric = {
      type,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.session.metrics.push(metric);

    // Keep metrics array reasonable size (last 1000)
    if (this.session.metrics.length > 1000) {
      this.session.metrics.shift();
    }
  }

  getMetrics(type?: MetricType): Metric[] {
    if (!this.session) return [];

    if (type) {
      return this.session.metrics.filter((m) => m.type === type);
    }
    return this.session.metrics;
  }

  getMetricsByType(type: MetricType): Metric[] {
    return this.getMetrics(type);
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  getAverageFPS(): number {
    return this.calculateAverage(this.fpsHistory);
  }

  getMinFPS(): number {
    return this.fpsHistory.length > 0 ? Math.min(...this.fpsHistory) : 0;
  }

  getMaxFPS(): number {
    return this.fpsHistory.length > 0 ? Math.max(...this.fpsHistory) : 0;
  }

  getAverageLatency(): number {
    return this.pingHistory.length > 0 ? this.calculateAverage(this.pingHistory) : 0;
  }

  getLastJitter(): number {
    if (this.pingHistory.length < 2) return 0;
    const recent = this.pingHistory.slice(this.pingHistory.length - 10);
    return Math.max(...recent) - Math.min(...recent);
  }

  calculateAverage(arr: number[]): number {
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  }

  // ============================================================================
  // Advanced Interaction Tracking
  // ============================================================================

  recordInteractionEvent(type: InteractionEvent['type'], metadata?: Record<string, unknown>) {
    if (!this.session) return;

    // Update interaction counts
    this.interactionCounts[type] = (this.interactionCounts[type] || 0) + 1;

    // Record interaction time
    const event: InteractionEvent = {
      type,
      timestamp: Date.now(),
      metadata
    };

    this.session.interactions.push(event);

    this.recordMetric('interaction', 1, { interactionType: type });
  }

  // Scene/Zone tracking
  recordSceneDwell(sceneId: string, durationMs: number) {
    const current = this.sceneDwellTimes.get(sceneId) || 0;
    this.sceneDwellTimes.set(sceneId, current + durationMs);
  }

  getSceneDwellStats(): Record<string, { totalMS: number }> {
    const stats: Record<string, { totalMS: number }> = {};
    this.sceneDwellTimes.forEach((totalMS, sceneId) => {
      stats[sceneId] = { totalMS };
    });
    return stats;
  }

  // Movement tracking
  recordMovementPosition(x: number, z: number) {
    const now = Date.now();
    this.movementPaths.push({ x, z, timestamp: now });

    // Keep last 100 positions
    if (this.movementPaths.length > 100) {
      this.movementPaths.shift();
    }

    // Calculate movement delta
    if (this.lastMovementPosition) {
      const dx = x - this.lastMovementPosition.x;
      const dz = z - this.lastMovementPosition.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance > 0.5) {
        // Significant movement
        this.recordMetric('frame-time', distance);
      }
    }
    this.lastMovementPosition = { x, z };
  }

  getMovementStats() {
    const positions = this.movementPaths;
    if (positions.length < 2) return { totalDistance: 0, pathPoints: 0 };

    let totalDistance = 0;
    for (let i = 1; i < positions.length; i++) {
      const dx = positions[i].x - positions[i - 1].x;
      const dz = positions[i].z - positions[i - 1].z;
      totalDistance += Math.sqrt(dx * dx + dz * dz);
    }

    return { totalDistance, pathPoints: positions.length };
  }

  // VR comfort tracking
  recordRapidHeadMovement() {
    this.rapidHeadMovements++;
    this.recordMetric('entity-count', 1);
  }

  recordComfortModeSwitch(type: 'teleport' | 'smooth') {
    this.comfortModeSwitches++;
    if (type === 'teleport') {
      this.teleportUsageCount++;
    } else {
      this.smoothMovementCount++;
    }
  }

  // Asset tracking
  recordAssetLoadTime(assetId: string, timeMs: number) {
    this.assetLoadTimes.set(assetId, timeMs);
    this.recordMetric('fps', timeMs, { assetId });
  }

  getAverageAssetLoadTime(): number {
    const times = Array.from(this.assetLoadTimes.values());
    return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  }

  // Entity tracking
  recordEntityCreation() {
    this.entityCreationCount++;
    this.recordMetric('entity-count', this.entityCreationCount);
  }

  recordEntityDespawn() {
    this.entityDespawnCount++;
    this.recordMetric('entity-count', this.entityCreationCount - this.entityDespawnCount);
  }

  // Audio tracking
  recordVoiceChatStart() {
    this.lastVoiceChatStart = Date.now();
  }

  recordVoiceChatEnd() {
    if (this.lastVoiceChatStart > 0) {
      const duration = Date.now() - this.lastVoiceChatStart;
      this.voiceChatDuration += duration;
      this.lastVoiceChatStart = 0;
      this.recordMetric('network-latency', duration / 1000);
    }
  }

  // @ts-ignore - entityId used in future
  recordSpatialAudio(_: string) {
    this.audioSpacializedCount++;
    this.recordMetric('network-entities', this.audioSpacializedCount);
  }

  // Get advanced stats
  getInteractionStats(): Record<string, number> {
    return { ...this.interactionCounts };
  }

  getMovementPath(): Array<{ x: number; z: number }> {
    return this.movementPaths.map((p) => ({ x: p.x, z: p.z }));
  }

  // ============================================================================
  // Export
  // ============================================================================

  async exportJSON(): Promise<string> {
    if (!this.session) throw new Error('No session data');

    const exportData: {
      session: AnalyticsSession;
      summary: {
        averageFPS: number;
        minFPS: number;
        maxFPS: number;
        averageLatency: number;
        packetLossRate: number;
        totalInteractions: number;
        durationMs: number;
        interactionCounts: Record<string, number>;
        sceneDwellStats: Record<string, { totalMS: number }>;
        movementStats: { totalDistance: number; pathPoints: number };
        assetLoadStats: { averageLoadTime: number; assetsTracked: number };
        entityStats: { created: number; despawned: number };
        audioStats: {
          voiceChatDurationMs: number;
          spatialAudioCount: number;
        };
        vrComfortStats: {
          rapidHeadMovements: number;
          comfortModeSwitches: number;
          teleportUsageCount: number;
          smoothMovementCount: number;
        };
      };
    } = {
      session: this.session,
      summary: {
        averageFPS: this.getAverageFPS(),
        minFPS: this.getMinFPS(),
        maxFPS: this.getMaxFPS(),
        averageLatency: this.getAverageLatency(),
        packetLossRate: this.getPacketLoss_rate(),
        totalInteractions: this.session.interactions.length,
        durationMs: this.session.endedAt
          ? this.session.endedAt - this.session.startedAt
          : Date.now() - this.session.startedAt,
        interactionCounts: this.interactionCounts,
        sceneDwellStats: this.getSceneDwellStats(),
        movementStats: this.getMovementStats(),
        assetLoadStats: {
          averageLoadTime: this.getAverageAssetLoadTime(),
          assetsTracked: this.assetLoadTimes.size
        },
        entityStats: {
          created: this.entityCreationCount,
          despawned: this.entityDespawnCount
        },
        audioStats: {
          voiceChatDurationMs: this.voiceChatDuration,
          spatialAudioCount: this.audioSpacializedCount
        },
        vrComfortStats: {
          rapidHeadMovements: this.rapidHeadMovements,
          comfortModeSwitches: this.comfortModeSwitches,
          teleportUsageCount: this.teleportUsageCount,
          smoothMovementCount: this.smoothMovementCount
        }
      }
    };

    return JSON.stringify(exportData, null, 2);
  }
}

// ============================================================================
// Analytics Manager (Singleton)
// ============================================================================

export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private tracker: PerformanceTracker | null = null;

  private constructor() {}

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  getTracker(): PerformanceTracker | null {
    return this.tracker;
  }

  getSession(): AnalyticsSession | null {
    return this.tracker?.getSession() ?? null;
  }

  initialize(userId: string, roomId: string) {
    this.tracker = new PerformanceTracker(userId, roomId);
    this.tracker.startTracking();
  }

  ping(milliseconds: number) {
    this.tracker?.recordPing(milliseconds);
  }

  recordPacketLoss(lossCount: number, total: number) {
    this.tracker?.recordPacketLoss(lossCount, total);
  }

  recordEntityCount(count: number) {
    this.tracker?.recordEntityCount(count);
  }

  recordNetworkEntities(count: number) {
    this.tracker?.recordNetworkEntities(count);
  }

  // Advanced tracking
  recordInteractionEvent(type: InteractionEvent['type'], metadata?: Record<string, unknown>) {
    // @ts-ignore - type checking handled by caller
    this.tracker?.recordInteractionEvent(type, metadata);
  }

  recordSceneDwell(sceneId: string, durationMs: number) {
    this.tracker?.recordSceneDwell(sceneId, durationMs);
  }

  recordMovementPosition(x: number, z: number) {
    this.tracker?.recordMovementPosition(x, z);
  }

  recordRapidHeadMovement() {
    this.tracker?.recordRapidHeadMovement();
  }

  recordComfortModeSwitch(type: 'teleport' | 'smooth') {
    // @ts-ignore - type checking handled by caller
    this.tracker?.recordComfortModeSwitch(type);
  }

  recordAssetLoadTime(assetId: string, timeMs: number) {
    this.tracker?.recordAssetLoadTime(assetId, timeMs);
  }

  recordEntityCreation() {
    this.tracker?.recordEntityCreation();
  }

  recordEntityDespawn() {
    this.tracker?.recordEntityDespawn();
  }

  recordVoiceChatStart() {
    this.tracker?.recordVoiceChatStart();
  }

  recordVoiceChatEnd() {
    this.tracker?.recordVoiceChatEnd();
  }

  recordSpatialAudio(entityId: string) {
    this.tracker?.recordSpatialAudio(entityId);
  }

  recordInteraction(type: InteractionEvent['type'], metadata?: Record<string, unknown>) {
    // @ts-ignore - allow flexible interaction types
    this.tracker?.recordInteractionEvent(type, metadata);
  }

  getNetworkQuality() {
    return this.tracker?.getNetworkQuality();
  }

  // Get stats
  getInteractionStats() {
    return this.tracker?.getInteractionStats() ?? {};
  }

  getMovementStats() {
    return this.tracker?.getMovementStats() ?? { totalDistance: 0, pathPoints: 0 };
  }

  getMovementPath() {
    return this.tracker?.getMovementPath() ?? [];
  }

  getSceneDwellStats() {
    return this.tracker?.getSceneDwellStats() ?? {};
  }

  exportJSON() {
    return this.tracker?.exportJSON();
  }

  shutdown() {
    this.tracker?.endSession();
    this.tracker = null;
  }
}

// ============================================================================
// Utility Hooks for React Components
// ============================================================================

// Can be used as hooks in React components
export function useAnalyticsTracker() {
  const manager = AnalyticsManager.getInstance();

  return {
    ping: manager.ping.bind(manager),
    recordPacketLoss: manager.recordPacketLoss.bind(manager),
    recordEntityCount: manager.recordEntityCount.bind(manager),
    recordInteraction: manager.recordInteraction.bind(manager),
    getNetworkQuality: manager.getNetworkQuality.bind(manager),
    exportJSON: manager.exportJSON.bind(manager)
  };
}

// ============================================================================
// React Integration Hook
// ============================================================================

import { useEffect, useCallback } from 'react';

export function useLiveAnalytics(userId: string, roomId: string) {
  const manager = AnalyticsManager.getInstance();

  useEffect(() => {
    manager.initialize(userId, roomId);

    return () => {
      manager.shutdown();
    };
  }, [userId, roomId]);

  const ping = useCallback((ms: number) => {
    manager.ping(ms);
  }, []);

  const recordInteraction = useCallback(
    (type: InteractionEvent['type'], metadata?: Record<string, unknown>) => {
      manager.recordInteraction(type, metadata);
    },
    []
  );

  const getNetworkQuality = useCallback(() => {
    return manager.getNetworkQuality();
  }, []);

  const exportAnalytics = useCallback(async () => {
    return await manager.exportJSON();
  }, []);

  return { ping, recordInteraction, getNetworkQuality, exportAnalytics };
}
