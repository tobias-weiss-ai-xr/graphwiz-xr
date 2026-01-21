/**
 * Avatar API Client
 */
export class AvatarApi {
    constructor(baseUrl = '/api/avatar') {
        this.baseUrl = baseUrl;
    }
    /**
     * Get default avatar configuration
     */
    async getDefaultAvatar() {
        const response = await fetch(`${this.baseUrl}/avatars/default`);
        if (!response.ok) {
            throw new Error(`Failed to get default avatar: ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Get user's avatar configuration
     */
    async getUserAvatar(userId) {
        const response = await fetch(`${this.baseUrl}/avatars/user/${userId}`);
        if (!response.ok) {
            throw new Error(`Failed to get user avatar: ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Update user's avatar configuration
     */
    async updateUserAvatar(userId, updates) {
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
    async registerCustomAvatar(assetId, name, thumbnailUrl) {
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
let avatarApiInstance = null;
export function getAvatarApi() {
    if (!avatarApiInstance) {
        avatarApiInstance = new AvatarApi();
    }
    return avatarApiInstance;
}
