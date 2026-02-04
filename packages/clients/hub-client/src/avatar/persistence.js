/**
 * Avatar Persistence Manager
 *
 * Handles local storage caching and sync with backend
 */
import { getAvatarApi } from './api';
const AVATAR_CACHE_KEY = 'graphwiz-avatar-cache';
const AVATAR_CACHE_VERSION = 1;
export class AvatarPersistenceManager {
    constructor() {
        this.api = getAvatarApi();
        this.cache = new Map();
        this.listeners = new Set();
    }
    /**
     * Load avatar from cache or fetch from API
     */
    async loadAvatar(userId, forceRefresh = false) {
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
        }
        catch (error) {
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
    async saveAvatar(userId, updates) {
        try {
            const response = await this.api.updateUserAvatar(userId, updates);
            const config = response.config;
            // Update cache
            this.cache.set(userId, config);
            this.saveToLocalStorage(userId, config);
            // Notify listeners
            this.notifyListeners(userId, config);
            return config;
        }
        catch (error) {
            console.error('[AvatarPersistence] Failed to save avatar:', error);
            throw error;
        }
    }
    /**
     * Get avatar from memory cache
     */
    getCachedAvatar(userId) {
        return this.cache.get(userId);
    }
    /**
     * Clear all caches
     */
    clearCache() {
        this.cache.clear();
        localStorage.removeItem(AVATAR_CACHE_KEY);
    }
    /**
     * Subscribe to avatar changes
     */
    subscribe(listener) {
        this.listeners.add(listener);
        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }
    /**
     * Load from localStorage
     */
    loadFromLocalStorage(userId) {
        try {
            const data = localStorage.getItem(AVATAR_CACHE_KEY);
            if (!data)
                return null;
            const allCached = JSON.parse(data);
            const cached = allCached[userId];
            if (cached && cached.version === AVATAR_CACHE_VERSION) {
                return cached;
            }
            return null;
        }
        catch (error) {
            console.error('[AvatarPersistence] Failed to load from localStorage:', error);
            return null;
        }
    }
    /**
     * Save to localStorage
     */
    saveToLocalStorage(userId, config) {
        try {
            const data = localStorage.getItem(AVATAR_CACHE_KEY);
            const allCached = data ? JSON.parse(data) : {};
            allCached[userId] = {
                version: AVATAR_CACHE_VERSION,
                userId,
                config,
                timestamp: Date.now(),
            };
            localStorage.setItem(AVATAR_CACHE_KEY, JSON.stringify(allCached));
        }
        catch (error) {
            console.error('[AvatarPersistence] Failed to save to localStorage:', error);
        }
    }
    /**
     * Notify all listeners of changes
     */
    notifyListeners(userId, config) {
        this.listeners.forEach((listener) => {
            try {
                listener(userId, config);
            }
            catch (error) {
                console.error('[AvatarPersistence] Listener error:', error);
            }
        });
    }
}
// Singleton instance
let avatarPersistenceInstance = null;
export function getAvatarPersistence() {
    if (!avatarPersistenceInstance) {
        avatarPersistenceInstance = new AvatarPersistenceManager();
    }
    return avatarPersistenceInstance;
}
