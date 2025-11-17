/**
 * Optimized Game Loop for Flappy Pi
 * Integrates performance monitoring, asset loading, and anti-cheat
 */

import performanceMonitor from './performanceMonitor';
import assetLoader from './assetLoader';
import antiCheat from './antiCheat';

export interface GameLoopConfig {
  targetFPS: number;
  enableFrameSkip: boolean;
  enableLowGraphicsMode: boolean;
  maxFrameTime: number;
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  currentFPS: number;
  frameCount: number;
  gameTime: number;
  lastFrameTime: number;
}

class GameLoop {
  private config: GameLoopConfig;
  private state: GameState;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private gameTime = 0;
  private updateCallbacks: Array<(deltaTime: number) => void> = [];
  private renderCallbacks: Array<(interpolation: number) => void> = [];

  constructor(config?: Partial<GameLoopConfig>) {
    this.config = {
      targetFPS: 60,
      enableFrameSkip: true,
      enableLowGraphicsMode: false,
      maxFrameTime: 1000 / 30, // Max 30 FPS minimum
      ...config
    };

    this.state = {
      isRunning: false,
      isPaused: false,
      currentFPS: 0,
      frameCount: 0,
      gameTime: 0,
      lastFrameTime: 0
    };

    this.initialize();
  }

  /**
   * Initialize game loop
   */
  private async initialize() {
    console.log('🎮 Initializing optimized game loop...');
    
    // Preload critical assets
    await assetLoader.preloadCriticalAssets();
    
    // Get performance settings
    const perfSettings = performanceMonitor.getPerformanceSettings();
    this.config.targetFPS = perfSettings.targetFPS;
    this.config.enableFrameSkip = perfSettings.enableFrameSkip;
    this.config.enableLowGraphicsMode = perfSettings.enableLowGraphicsMode;
    
    console.log(`🎯 Target FPS: ${this.config.targetFPS}`);
    console.log(`⚡ Frame Skip: ${this.config.enableFrameSkip}`);
    console.log(`🎨 Low Graphics: ${this.config.enableLowGraphicsMode}`);
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.state.isRunning) return;
    
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.lastFrameTime = performance.now();
    
    console.log('🚀 Game loop started');
    this.loop();
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.state.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.log('⏹️ Game loop stopped');
  }

  /**
   * Pause the game loop
   */
  pause(): void {
    this.state.isPaused = true;
    console.log('⏸️ Game loop paused');
  }

  /**
   * Resume the game loop
   */
  resume(): void {
    this.state.isPaused = false;
    console.log('▶️ Game loop resumed');
  }

  /**
   * Main game loop
   */
  private loop(): void {
    if (!this.state.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastFrameTime, this.config.maxFrameTime);
    
    // Update FPS calculation
    this.updateFPS(deltaTime);
    
    // Check if frame should be skipped for performance
    if (this.shouldSkipFrame()) {
      this.animationFrameId = requestAnimationFrame(() => this.loop());
      return;
    }

    // Update game state
    if (!this.state.isPaused) {
      this.gameTime += deltaTime;
      this.updateGame(deltaTime);
    }

    // Render frame
    this.renderGame();

    // Update state
    this.lastFrameTime = currentTime;
    this.frameCount++;

    // Continue loop
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  /**
   * Update FPS calculation
   */
  private updateFPS(deltaTime: number): void {
    const fps = 1000 / deltaTime;
    this.state.currentFPS = fps;
    this.state.lastFrameTime = deltaTime;
  }

  /**
   * Check if frame should be skipped for performance
   */
  private shouldSkipFrame(): boolean {
    if (!this.config.enableFrameSkip) return false;
    
    const metrics = performanceMonitor.getPerformanceMetrics();
    return metrics.fps < this.config.targetFPS * 0.8;
  }

  /**
   * Update game logic
   */
  private updateGame(deltaTime: number): void {
    // Call all update callbacks
    this.updateCallbacks.forEach(callback => {
      try {
        callback(deltaTime);
      } catch (error) {
        console.error('Error in game update callback:', error);
      }
    });

    // Record action for anti-cheat
    antiCheat.recordAction('flap');
  }

  /**
   * Render game frame
   */
  private renderGame(): void {
    // Calculate interpolation for smooth rendering
    const interpolation = this.calculateInterpolation();
    
    // Call all render callbacks
    this.renderCallbacks.forEach(callback => {
      try {
        callback(interpolation);
      } catch (error) {
        console.error('Error in game render callback:', error);
      }
    });
  }

  /**
   * Calculate interpolation factor for smooth rendering
   */
  private calculateInterpolation(): number {
    const targetFrameTime = 1000 / this.config.targetFPS;
    const actualFrameTime = this.state.lastFrameTime;
    
    return Math.min(actualFrameTime / targetFrameTime, 1.0);
  }

  /**
   * Add update callback
   */
  onUpdate(callback: (deltaTime: number) => void): void {
    this.updateCallbacks.push(callback);
  }

  /**
   * Add render callback
   */
  onRender(callback: (interpolation: number) => void): void {
    this.renderCallbacks.push(callback);
  }

  /**
   * Remove update callback
   */
  removeUpdateCallback(callback: (deltaTime: number) => void): void {
    const index = this.updateCallbacks.indexOf(callback);
    if (index > -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  /**
   * Remove render callback
   */
  removeRenderCallback(callback: (interpolation: number) => void): void {
    const index = this.renderCallbacks.indexOf(callback);
    if (index > -1) {
      this.renderCallbacks.splice(index, 1);
    }
  }

  /**
   * Get current game state
   */
  getState(): GameState {
    return { ...this.state };
  }

  /**
   * Get current configuration
   */
  getConfig(): GameLoopConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<GameLoopConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Game loop configuration updated:', this.config);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...performanceMonitor.getPerformanceMetrics(),
      gameTime: this.gameTime,
      frameCount: this.frameCount,
      isLowPowerDevice: performanceMonitor.getPerformanceSettings().enableLowGraphicsMode
    };
  }

  /**
   * Optimize for current performance
   */
  optimizeForPerformance(): void {
    const metrics = performanceMonitor.getPerformanceMetrics();
    const settings = performanceMonitor.getPerformanceSettings();
    
    // Adjust target FPS based on current performance
    if (metrics.fps < this.config.targetFPS * 0.7) {
      this.config.targetFPS = Math.max(30, this.config.targetFPS - 10);
      console.log(`🎯 Adjusted target FPS to ${this.config.targetFPS}`);
    }
    
    // Enable frame skipping if performance is poor
    if (metrics.fps < 30) {
      this.config.enableFrameSkip = true;
      console.log('⚡ Enabled frame skipping for performance');
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.updateCallbacks = [];
    this.renderCallbacks = [];
    console.log('🧹 Game loop destroyed');
  }
}

// Export singleton instance
export const gameLoop = new GameLoop();
export default gameLoop; 