/**
 * Avatar API Client
 */

export interface BodyType {
  Human: 'human';
  Robot: 'robot';
  Alien: 'alien';
  Animal: 'animal';
  Abstract: 'abstract';
}

export type BodyTypeEnum = 'human' | 'robot' | 'alien' | 'animal' | 'abstract';

export interface AvatarConfig {
  user_id: string;
  body_type: BodyTypeEnum;
  primary_color: string;
  secondary_color: string;
  height: number;
  custom_model_id?: string;
  metadata: Record<string, unknown>;
}

export interface UpdateAvatarRequest {
  body_type?: BodyTypeEnum;
  primary_color?: string;
  secondary_color?: string;
  height?: number;
  custom_model_id?: string;
  metadata?: Record<string, unknown>;
}

export interface UserAvatarResponse {
  user_id: string;
  config: AvatarConfig;
  created_at: string;
  updated_at: string;
}

export interface DefaultAvatarResponse {
  config: AvatarConfig;
  available_body_types: string[];
  available_colors: string[];
}

export class AvatarApi {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/avatar') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get default avatar configuration
   */
  async getDefaultAvatar(): Promise<DefaultAvatarResponse> {
    const response = await fetch(`${this.baseUrl}/avatars/default`);
    if (!response.ok) {
      throw new Error(`Failed to get default avatar: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get user's avatar configuration
   */
  async getUserAvatar(userId: string): Promise<UserAvatarResponse> {
    const response = await fetch(`${this.baseUrl}/avatars/user/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to get user avatar: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Update user's avatar configuration
   */
  async updateUserAvatar(userId: string, updates: UpdateAvatarRequest): Promise<UserAvatarResponse> {
    const response = await fetch(`${this.baseUrl}/avatars/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update avatar');
    }

    return response.json();
  }

  /**
   * Register custom avatar model
   */
  async registerCustomAvatar(
    assetId: string,
    name: string,
    thumbnailUrl?: string
  ): Promise<{ message: string; asset_id: string }> {
    const response = await fetch(`${this.baseUrl}/avatars/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset_id: assetId,
        name,
        thumbnail_url: thumbnailUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register custom avatar');
    }

    return response.json();
  }
}

// Singleton instance
let avatarApiInstance: AvatarApi | null = null;

export function getAvatarApi(): AvatarApi {
  if (!avatarApiInstance) {
    avatarApiInstance = new AvatarApi();
  }
  return avatarApiInstance;
}
