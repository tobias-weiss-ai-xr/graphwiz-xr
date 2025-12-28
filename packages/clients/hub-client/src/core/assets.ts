/**
 * Asset Loader
 *
 * Manages loading and caching of 3D models, textures, and audio.
 */

import type { Texture } from 'three';

type GLTF = any;
type AudioBuffer = any;

export class AssetLoader {
  private static instance: AssetLoader;
  private gltfCache = new Map<string, GLTF>();
  private textureCache = new Map<string, Texture>();
  private audioCache = new Map<string, AudioBuffer>();
  private loadingPromises = new Map<string, Promise<any>>();

  private constructor() {}

  static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  /**
   * Load a 3D model (GLTF/GLB)
   */
  async loadGLTF(url: string): Promise<GLTF> {
    // Check cache
    if (this.gltfCache.has(url)) {
      return this.gltfCache.get(url)!;
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

      return new Promise<GLTF>((resolve, reject) => {
        loader.load(
          url,
          (gltf: GLTF) => {
            this.gltfCache.set(url, gltf);
            resolve(gltf);
          },
          undefined,
          (error: unknown) => reject(error)
        );
      });
    })();

    this.loadingPromises.set(url, promise);

    try {
      const result = await promise;
      this.loadingPromises.delete(url);
      return result;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  /**
   * Load a texture
   */
  async loadTexture(url: string): Promise<Texture> {
    // Check cache
    if (this.textureCache.has(url)) {
      return this.textureCache.get(url)!;
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

      return new Promise<Texture>((resolve, reject) => {
        loader.load(
          url,
          (texture: Texture) => {
            this.textureCache.set(url, texture);
            resolve(texture);
          },
          undefined,
          (error: unknown) => reject(error)
        );
      });
    })();

    this.loadingPromises.set(url, promise);

    try {
      const result = await promise;
      this.loadingPromises.delete(url);
      return result;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  /**
   * Load audio
   */
  async loadAudio(url: string): Promise<AudioBuffer> {
    // Check cache
    if (this.audioCache.has(url)) {
      return this.audioCache.get(url)!;
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

      return new Promise<AudioBuffer>((resolve, reject) => {
        loader.load(
          url,
          (buffer: AudioBuffer) => {
            this.audioCache.set(url, buffer);
            resolve(buffer);
          },
          undefined,
          (error: unknown) => reject(error)
        );
      });
    })();

    this.loadingPromises.set(url, promise);

    try {
      const result = await promise;
      this.loadingPromises.delete(url);
      return result;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  /**
   * Preload multiple assets
   */
  async preloadAssets(urls: {
    models?: string[];
    textures?: string[];
    audio?: string[];
  }): Promise<void> {
    const promises: Promise<any>[] = [];

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
  clearCache(): void {
    this.gltfCache.clear();
    this.textureCache.clear();
    this.audioCache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats(): {
    models: number;
    textures: number;
    audio: number;
    loading: number;
  } {
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
