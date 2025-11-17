/**
 * Optimized Asset Loader for Flappy Pi
 * Handles lazy loading, sprite sheets, and performance optimization
 */

export interface AssetConfig {
  id: string;
  url: string;
  type: 'image' | 'audio' | 'sprite';
  priority: 'critical' | 'high' | 'low';
  preload?: boolean;
}

export interface SpriteSheetConfig {
  id: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
  animationSpeed?: number;
}

class AssetLoader {
  private loadedAssets = new Map<string, HTMLImageElement | HTMLAudioElement>();
  private loadingPromises = new Map<string, Promise<any>>();
  private spriteSheets = new Map<string, SpriteSheetConfig>();

  // Critical assets that should be preloaded
  private criticalAssets: AssetConfig[] = [
    { id: 'bird_0', url: '/birds2/bird_0.gif', type: 'image', priority: 'critical', preload: true },
    { id: 'ground_grass', url: '/ground/ground_grass.png', type: 'image', priority: 'critical', preload: true },
    { id: 'sfx_hit', url: '/audio/sfx_hit.wav', type: 'audio', priority: 'critical', preload: true },
    { id: 'sfx_point', url: '/audio/sfx_point.wav', type: 'audio', priority: 'critical', preload: true },
    { id: 'sfx_die', url: '/audio/sfx_die.wav', type: 'audio', priority: 'critical', preload: true },
  ];

  // Sprite sheet configurations
  private spriteConfigs: SpriteSheetConfig[] = [
    {
      id: 'bird_sprites',
      url: '/birds/bird_spritesheet.png', // We'll create this
      frameWidth: 64,
      frameHeight: 64,
      frames: 13, // bird_0 to bird_12
      animationSpeed: 100
    }
  ];

  constructor() {
    this.initializeSpriteSheets();
  }

  private initializeSpriteSheets() {
    this.spriteConfigs.forEach(config => {
      this.spriteSheets.set(config.id, config);
    });
  }

  /**
   * Preload critical assets for smooth gameplay
   */
  async preloadCriticalAssets(): Promise<void> {
    console.log('🚀 Preloading critical assets...');
    
    const criticalPromises = this.criticalAssets
      .filter(asset => asset.preload)
      .map(asset => this.loadAsset(asset));

    try {
      await Promise.all(criticalPromises);
      console.log('✅ Critical assets loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load critical assets:', error);
    }
  }

  /**
   * Load a single asset with caching
   */
  async loadAsset(config: AssetConfig): Promise<HTMLImageElement | HTMLAudioElement> {
    // Return cached asset if already loaded
    if (this.loadedAssets.has(config.id)) {
      return this.loadedAssets.get(config.id)!;
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(config.id)) {
      return this.loadingPromises.get(config.id)!;
    }

    const loadPromise = this.loadAssetInternal(config);
    this.loadingPromises.set(config.id, loadPromise);

    try {
      const asset = await loadPromise;
      this.loadedAssets.set(config.id, asset);
      this.loadingPromises.delete(config.id);
      return asset;
    } catch (error) {
      this.loadingPromises.delete(config.id);
      throw error;
    }
  }

  private async loadAssetInternal(config: AssetConfig): Promise<HTMLImageElement | HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      if (config.type === 'image') {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${config.url}`));
        img.src = config.url;
      } else if (config.type === 'audio') {
        const audio = new Audio();
        audio.oncanplaythrough = () => resolve(audio);
        audio.onerror = () => reject(new Error(`Failed to load audio: ${config.url}`));
        audio.src = config.url;
      } else {
        reject(new Error(`Unsupported asset type: ${config.type}`));
      }
    });
  }

  /**
   * Get sprite frame from sprite sheet
   */
  getSpriteFrame(spriteSheetId: string, frameIndex: number): HTMLCanvasElement | null {
    const config = this.spriteSheets.get(spriteSheetId);
    if (!config) return null;

    const spriteSheet = this.loadedAssets.get(spriteSheetId) as HTMLImageElement;
    if (!spriteSheet) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = config.frameWidth;
    canvas.height = config.frameHeight;

    const row = Math.floor(frameIndex / Math.ceil(spriteSheet.width / config.frameWidth));
    const col = frameIndex % Math.ceil(spriteSheet.width / config.frameWidth);

    ctx.drawImage(
      spriteSheet,
      col * config.frameWidth,
      row * config.frameHeight,
      config.frameWidth,
      config.frameHeight,
      0,
      0,
      config.frameWidth,
      config.frameHeight
    );

    return canvas;
  }

  /**
   * Lazy load non-critical assets
   */
  async lazyLoadAsset(assetId: string): Promise<HTMLImageElement | HTMLAudioElement> {
    const asset = this.criticalAssets.find(a => a.id === assetId) ||
                  { id: assetId, url: `/assets/${assetId}`, type: 'image', priority: 'low' };
    
    return this.loadAsset(asset);
  }

  /**
   * Get loaded asset by ID
   */
  getAsset(assetId: string): HTMLImageElement | HTMLAudioElement | null {
    return this.loadedAssets.get(assetId) || null;
  }

  /**
   * Clear non-critical assets from memory
   */
  clearNonCriticalAssets(): void {
    const criticalIds = new Set(this.criticalAssets.map(a => a.id));
    
    for (const [id, asset] of this.loadedAssets.entries()) {
      if (!criticalIds.has(id)) {
        this.loadedAssets.delete(id);
      }
    }
  }

  /**
   * Get loading progress
   */
  getLoadingProgress(): number {
    const total = this.criticalAssets.filter(a => a.preload).length;
    const loaded = Array.from(this.loadedAssets.keys()).length;
    return total > 0 ? (loaded / total) * 100 : 0;
  }
}

// Export singleton instance
export const assetLoader = new AssetLoader();
export default assetLoader; 