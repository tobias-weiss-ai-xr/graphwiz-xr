/**
 * Moderation Client
 *
 * Handles moderation API calls for kick, mute, and lock functionality
 */

const logger = {
  info: (...args: unknown[]) => console.info('[ModerationClient]', ...args),
  error: (...args: unknown[]) => console.error('[ModerationClient]', ...args),
  warn: (...args: unknown[]) => console.warn('[ModerationClient]', ...args)
};

export interface KickPlayerRequest {
  roomId: string;
  targetClientId: string;
  kickedByClientId: string;
  reason?: string;
}

export interface MutePlayerRequest {
  roomId: string;
  targetClientId: string;
  muted: boolean;
  reason?: string;
}

export interface LockRoomRequest {
  roomId: string;
  locked: boolean;
  lockedByClientId: string;
  reason?: string;
}

export interface ModerationActionResponse {
  success: boolean;
  message: string;
}

/**
 * Moderation client for handling room moderation actions
 */
export class ModerationClient {
  private presenceUrl: string;
  private authToken: string | null = null;

  constructor(presenceUrl: string, authToken?: string) {
    this.presenceUrl = presenceUrl;
    this.authToken = authToken || null;
  }

  /**
   * Kick a player from the room
   */
  async kickPlayer(request: KickPlayerRequest): Promise<ModerationActionResponse> {
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
      return data as ModerationActionResponse;
    } catch (error) {
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
  async mutePlayer(request: MutePlayerRequest): Promise<ModerationActionResponse> {
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
      return data as ModerationActionResponse;
    } catch (error) {
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
  async lockRoom(request: LockRoomRequest): Promise<ModerationActionResponse> {
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
      return data as ModerationActionResponse;
    } catch (error) {
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
export function createModerationClient(presenceUrl: string, authToken?: string): ModerationClient {
  return new ModerationClient(presenceUrl, authToken);
}
