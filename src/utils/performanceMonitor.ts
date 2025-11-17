/**
 * Performance Monitor for Flappy Pi
 * Tracks FPS, device capabilities, and optimizes game settings
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  deviceScore: number;
  isLowPowerDevice: boolean;
}

export interface PerformanceSettings {
  targetFPS: number;
  enableLowGraphicsMode: boolean;
  reduceParticleEffects: boolean;
  limitBackgroundObjects: boolean;
  enableFrameSkip: boolean;
}

class PerformanceMonitor {
  private frameCount = 0;
  private lastFrameTime = performance.now();
  private fpsHistory: number[] = [];
  private deviceScore = 0;
  private isLowPowerDevice = false;
  private performanceSettings: PerformanceSettings;

  constructor() {
    this.performanceSettings = this.detectOptimalSettings();
    this.initializeMonitoring();
  }

  /**
   * Detect device capabilities and set optimal settings
   */
  private detectOptimalSettings(): PerformanceSettings {
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    const deviceMemory = (navigator as any).deviceMemory || 4;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    // Calculate device score (0-100)
    this.deviceScore = Math.min(100, 
      (hardwareConcurrency * 10) + 
      (deviceMemory * 5) + 
      (screenWidth * screenHeight / 100000)
    );

    this.isLowPowerDevice = this.deviceScore < 50;

    return {
      targetFPS: this.isLowPowerDevice ? 30 : 60,
      enableLowGraphicsMode: this.isLowPowerDevice,
      reduceParticleEffects: this.isLowPowerDevice,
      limitBackgroundObjects: this.isLowPowerDevice,
      enableFrameSkip: this.isLowPowerDevice
    };
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring() {
    console.log(`🎮 Performance Monitor initialized`);
    console.log(`📱 Device Score: ${this.deviceScore}/100`);
    console.log(`⚡ Low Power Device: ${this.isLowPowerDevice}`);
    console.log(`🎯 Target FPS: ${this.performanceSettings.targetFPS}`);
    
    // Start FPS monitoring
    this.startFPSMonitoring();
  }

  /**
   * Start FPS monitoring loop
   */
  private startFPSMonitoring() {
    const measureFPS = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastFrameTime;
      
      if (deltaTime > 0) {
        const currentFPS = 1000 / deltaTime;
        this.fpsHistory.push(currentFPS);
        
        // Keep only last 60 FPS measurements
        if (this.fpsHistory.length > 60) {
          this.fpsHistory.shift();
        }
      }
      
      this.lastFrameTime = currentTime;
      this.frameCount++;
      
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const averageFPS = this.fpsHistory.length > 0 
      ? this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length 
      : 0;

    const frameTime = averageFPS > 0 ? 1000 / averageFPS : 0;

    return {
      fps: Math.round(averageFPS),
      frameTime: Math.round(frameTime),
      memoryUsage: (performance as any).memory?.usedJSHeapSize,
      deviceScore: this.deviceScore,
      isLowPowerDevice: this.isLowPowerDevice
    };
  }

  /**
   * Get current performance settings
   */
  getPerformanceSettings(): PerformanceSettings {
    return { ...this.performanceSettings };
  }

  /**
   * Check if frame should be skipped for performance
   */
  shouldSkipFrame(): boolean {
    if (!this.performanceSettings.enableFrameSkip) return false;
    
    const metrics = this.getPerformanceMetrics();
    return metrics.fps < this.performanceSettings.targetFPS * 0.8;
  }

  /**
   * Adjust settings based on current performance
   */
  adjustSettingsForPerformance(): void {
    const metrics = this.getPerformanceMetrics();
    
    // If FPS is too low, enable more aggressive optimizations
    if (metrics.fps < this.performanceSettings.targetFPS * 0.7) {
      this.performanceSettings.enableLowGraphicsMode = true;
      this.performanceSettings.reduceParticleEffects = true;
      this.performanceSettings.limitBackgroundObjects = true;
      this.performanceSettings.enableFrameSkip = true;
      
      console.log('⚠️ Performance degraded, enabling low graphics mode');
    }
  }

  /**
   * Get recommended graphics quality level
   */
  getGraphicsQuality(): 'low' | 'medium' | 'high' {
    if (this.isLowPowerDevice || this.performanceSettings.enableLowGraphicsMode) {
      return 'low';
    }
    
    const metrics = this.getPerformanceMetrics();
    if (metrics.fps < 45) {
      return 'low';
    } else if (metrics.fps < 55) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  /**
   * Check if device supports WebGL
   */
  isWebGLSupported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  /**
   * Get device information for debugging
   */
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      deviceScore: this.deviceScore,
      isLowPowerDevice: this.isLowPowerDevice,
      webGLSupported: this.isWebGLSupported()
    };
  }

  /**
   * Log performance warning if needed
   */
  logPerformanceWarning(): void {
    const metrics = this.getPerformanceMetrics();
    
    if (metrics.fps < 30) {
      console.warn('⚠️ Low FPS detected:', metrics.fps);
    }
    
    if (metrics.fps < 20) {
      console.error('🚨 Critical performance issues detected!');
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor; 