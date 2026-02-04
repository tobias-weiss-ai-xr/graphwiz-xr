/**
 * Asset Loader
 *
 * Manages loading and caching of 3D models, textures, and audio.
 */
export class AssetLoader {
    constructor() {
        this.gltfCache = new Map();
        this.textureCache = new Map();
        this.audioCache = new Map();
        this.loadingPromises = new Map();
    }
    static getInstance() {
        if (!AssetLoader.instance) {
            AssetLoader.instance = new AssetLoader();
        }
        return AssetLoader.instance;
    }
    /**
     * Load a 3D model (GLTF/GLB)
     */
    async loadGLTF(url) {
        // Check cache
        if (this.gltfCache.has(url)) {
            return this.gltfCache.get(url);
        }
        // Check if already loading
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }
        // Load model
        const promise = (async () => {
            // @ts-expect-error - three/examples/jsm modules don't have type declarations
            const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
            const loader = new GLTFLoader();
            return new Promise((resolve, reject) => {
                loader.load(url, (gltf) => {
                    this.gltfCache.set(url, gltf);
                    resolve(gltf);
                }, undefined, (error) => reject(error));
            });
        })();
        this.loadingPromises.set(url, promise);
        try {
            const result = await promise;
            this.loadingPromises.delete(url);
            return result;
        }
        catch (error) {
            this.loadingPromises.delete(url);
            throw error;
        }
    }
    /**
     * Load a texture
     */
    async loadTexture(url) {
        // Check cache
        if (this.textureCache.has(url)) {
            return this.textureCache.get(url);
        }
        // Check if already loading
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }
        // Load texture
        const promise = (async () => {
            // TextureLoader is built into Three.js
            const { TextureLoader } = await import('three');
            const loader = new TextureLoader();
            return new Promise((resolve, reject) => {
                loader.load(url, (texture) => {
                    this.textureCache.set(url, texture);
                    resolve(texture);
                }, undefined, (error) => reject(error));
            });
        })();
        this.loadingPromises.set(url, promise);
        try {
            const result = await promise;
            this.loadingPromises.delete(url);
            return result;
        }
        catch (error) {
            this.loadingPromises.delete(url);
            throw error;
        }
    }
    /**
     * Load audio
     */
    async loadAudio(url) {
        // Check cache
        if (this.audioCache.has(url)) {
            return this.audioCache.get(url);
        }
        // Check if already loading
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }
        // Load audio
        const promise = (async () => {
            // AudioLoader is built into Three.js
            const { AudioLoader } = await import('three');
            const loader = new AudioLoader();
            return new Promise((resolve, reject) => {
                loader.load(url, (buffer) => {
                    this.audioCache.set(url, buffer);
                    resolve(buffer);
                }, undefined, (error) => reject(error));
            });
        })();
        this.loadingPromises.set(url, promise);
        try {
            const result = await promise;
            this.loadingPromises.delete(url);
            return result;
        }
        catch (error) {
            this.loadingPromises.delete(url);
            throw error;
        }
    }
    /**
     * Preload multiple assets
     */
    async preloadAssets(urls) {
        const promises = [];
        if (urls.models) {
            for (const url of urls.models) {
                promises.push(this.loadGLTF(url));
            }
        }
        if (urls.textures) {
            for (const url of urls.textures) {
                promises.push(this.loadTexture(url));
            }
        }
        if (urls.audio) {
            for (const url of urls.audio) {
                promises.push(this.loadAudio(url));
            }
        }
        await Promise.all(promises);
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.gltfCache.clear();
        this.textureCache.clear();
        this.audioCache.clear();
        this.loadingPromises.clear();
    }
    /**
     * Get cache stats
     */
    getCacheStats() {
        return {
            models: this.gltfCache.size,
            textures: this.textureCache.size,
            audio: this.audioCache.size,
            loading: this.loadingPromises.size,
        };
    }
}
// Export singleton instance
export const assetLoader = AssetLoader.getInstance();
