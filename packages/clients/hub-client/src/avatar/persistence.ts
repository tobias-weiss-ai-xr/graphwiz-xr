/**
 * Avatar Persistence Manager
 *
 * Handles local storage caching and sync with backend
 */

import { getAvatarApi, AvatarConfig } from './api';

const AVATAR_CACHE_KEY = 'graphwiz-avatar-cache';
const AVATAR_CACHE_VERSION = 1;

interface CachedAvatar {
  version: number;
  userId: string;
  config: AvatarConfig;
  timestamp: number;
}

export class AvatarPersistenceManager {
  private api = getAvatarApi();
  private cache: Map<string, AvatarConfig> = new Map();
  private listeners = new Set<(userId: string, config: AvatarConfig) => void>();

  /**
   * Load avatar from cache or fetch from API
   */
  async loadAvatar(userId: string, forceRefresh = false): Promise<AvatarConfig> {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = this.cache.get(userId);
      if (cached) {
        return cached;
      }

      // Try localStorage
      const localCache = this.loadFromLocalStorage(userId);
      if (localCache && Date.now() - localCache.timestamp < 3600000) { // 1 hour
        this.cache.set(userId, localCache.config);
        return localCache.config;
      }
    }

    // Fetch from API
    try {
      const response = await this.api.getUserAvatar(userId);
      const config = response.config;

      // Update cache
      this.cache.set(userId, config);
      this.saveToLocalStorage(userId, config);

      return config;
    } catch (error) {
      console.error('[AvatarPersistence] Failed to load avatar:', error);

      // Return default avatar on error
      return {
        user_id: userId,
        body_type: 'human',
        primary_color: '#4CAF50',
        secondary_color: '#2196F3',
        height: 1.7,
        metadata: {},
      };
    }
  }

  /**
   * Save avatar to backend
   */
  async saveAvatar(userId: string, updates: Partial<AvatarConfig>): Promise<AvatarConfig> {
    try {
      const response = await this.api.updateUserAvatar(userId, updates);
      const config = response.config;

      // Update cache
      this.cache.set(userId, config);
      this.saveToLocalStorage(userId, config);

      // Notify listeners
      this.notifyListeners(userId, config);

      return config;
    } catch (error) {
      console.error('[AvatarPersistence] Failed to save avatar:', error);
      throw error;
    }
  }

  /**
   * Get avatar from memory cache
   */
  getCachedAvatar(userId: string): AvatarConfig | undefined {
    return this.cache.get(userId);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(AVATAR_CACHE_KEY);
  }

  /**
   * Subscribe to avatar changes
   */
  subscribe(listener: (userId: string, config: AvatarConfig) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Load from localStorage
   */
  private loadFromLocalStorage(userId: string): CachedAvatar | null {
    try {
      const data = localStorage.getItem(AVATAR_CACHE_KEY);
      if (!data) return null;

      const allCached: Record<string, CachedAvatar> = JSON.parse(data);
      const cached = allCached[userId];

      if (cached && cached.version === AVATAR_CACHE_VERSION) {
        return cached;
      }

      return null;
    } catch (error) {
      console.error('[AvatarPersistence] Failed to load from localStorage:', error);
      return null;
    }
  }

  /**
   * Save to localStorage
   */
  private saveToLocalStorage(userId: string, config: AvatarConfig): void {
    try {
      const data = localStorage.getItem(AVATAR_CACHE_KEY);
      const allCached: Record<string, CachedAvatar> = data ? JSON.parse(data) : {};

      allCached[userId] = {
        version: AVATAR_CACHE_VERSION,
        userId,
        config,
        timestamp: Date.now(),
      };

      localStorage.setItem(AVATAR_CACHE_KEY, JSON.stringify(allCached));
    } catch (error) {
      console.error('[AvatarPersistence] Failed to save to localStorage:', error);
    }
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(userId: string, config: AvatarConfig): void {
    this.listeners.forEach((listener) => {
      try {
        listener(userId, config);
      } catch (error) {
        console.error('[AvatarPersistence] Listener error:', error);
      }
    });
  }
}

// Singleton instance
let avatarPersistenceInstance: AvatarPersistenceManager | null = null;

export function getAvatarPersistence(): AvatarPersistenceManager {
  if (!avatarPersistenceInstance) {
    avatarPersistenceInstance = new AvatarPersistenceManager();
  }
  return avatarPersistenceInstance;
}
