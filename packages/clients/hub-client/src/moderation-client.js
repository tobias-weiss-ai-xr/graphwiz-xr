/**
 * Moderation Client
 *
 * Handles moderation API calls for kick, mute, and lock functionality
 */
const logger = {
    info: (...args) => console.info('[ModerationClient]', ...args),
    error: (...args) => console.error('[ModerationClient]', ...args),
    warn: (...args) => console.warn('[ModerationClient]', ...args)
};
/**
 * Moderation client for handling room moderation actions
 */
export class ModerationClient {
    constructor(presenceUrl, authToken) {
        this.authToken = null;
        this.presenceUrl = presenceUrl;
        this.authToken = authToken || null;
    }
    /**
     * Kick a player from the room
     */
    async kickPlayer(request) {
        try {
            const response = await fetch(`${this.presenceUrl}/moderation/kick`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {})
                },
                body: JSON.stringify(request)
            });
            const data = await response.json();
            logger.info('[ModerationClient] Kick player response:', data);
            return data;
        }
        catch (error) {
            logger.error('[ModerationClient] Failed to kick player:', error);
            return {
                success: false,
                message: `Failed to kick player: ${error}`
            };
        }
    }
    /**
     * Mute/unmute a player
     */
    async mutePlayer(request) {
        try {
            const response = await fetch(`${this.presenceUrl}/moderation/mute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {})
                },
                body: JSON.stringify(request)
            });
            const data = await response.json();
            logger.info('[ModerationClient] Mute player response:', data);
            return data;
        }
        catch (error) {
            logger.error('[ModerationClient] Failed to mute player:', error);
            return {
                success: false,
                message: `Failed to mute player: ${error}`
            };
        }
    }
    /**
     * Lock/unlock a room
     */
    async lockRoom(request) {
        try {
            const response = await fetch(`${this.presenceUrl}/moderation/lock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {})
                },
                body: JSON.stringify(request)
            });
            const data = await response.json();
            logger.info('[ModerationClient] Lock room response:', data);
            return data;
        }
        catch (error) {
            logger.error('[ModerationClient] Failed to lock room:', error);
            return {
                success: false,
                message: `Failed to lock room: ${error}`
            };
        }
    }
}
/**
 * Create a moderation client instance
 */
export function createModerationClient(presenceUrl, authToken) {
    return new ModerationClient(presenceUrl, authToken);
}
