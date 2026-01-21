/**
 * Settings Persistence Manager
 */
import { DEFAULT_SETTINGS } from './user-settings';
import { createLogger } from '@graphwiz/types/logger';
const SETTINGS_KEY = 'graphwiz-user-settings';
const logger = createLogger('SettingsManager');
export class SettingsManager {
    constructor() {
        this.listeners = new Set();
        this.settings = this.loadSettings();
    }
    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return { ...DEFAULT_SETTINGS, ...parsed };
            }
        }
        catch (error) {
            logger.error('[SettingsManager] Failed to load settings:', error);
        }
        return { ...DEFAULT_SETTINGS };
    }
    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
            this.notifyListeners();
        }
        catch (error) {
            logger.error('[SettingsManager] Failed to save settings:', error);
        }
    }
    /**
     * Get all settings
     */
    getSettings() {
        return { ...this.settings };
    }
    /**
     * Get a single setting value
     */
    get(key) {
        return this.settings[key];
    }
    /**
     * Set a single setting value
     */
    set(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
    /**
     * Update multiple settings
     */
    update(updates) {
        this.settings = { ...this.settings, ...updates };
        this.saveSettings();
    }
    /**
     * Reset to defaults
     */
    reset() {
        this.settings = { ...DEFAULT_SETTINGS };
        this.saveSettings();
    }
    /**
     * Subscribe to settings changes
     */
    subscribe(listener) {
        this.listeners.add(listener);
        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }
    /**
     * Notify all listeners of changes
     */
    notifyListeners() {
        this.listeners.forEach((listener) => {
            try {
                listener(this.getSettings());
            }
            catch (error) {
                logger.error('[SettingsManager] Listener error:', error);
            }
        });
    }
    /**
     * Export settings as JSON
     */
    export() {
        return JSON.stringify(this.settings, null, 2);
    }
    /**
     * Import settings from JSON
     */
    import(json) {
        try {
            const parsed = JSON.parse(json);
            this.settings = { ...DEFAULT_SETTINGS, ...parsed };
            this.saveSettings();
            return true;
        }
        catch (error) {
            logger.error('[SettingsManager] Failed to import settings:', error);
            return false;
        }
    }
}
// Singleton instance
let settingsManagerInstance = null;
export function getSettingsManager() {
    if (!settingsManagerInstance) {
        settingsManagerInstance = new SettingsManager();
    }
    return settingsManagerInstance;
}
