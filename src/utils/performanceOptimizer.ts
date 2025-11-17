/**
 * Comprehensive Performance Optimizer for Flappy Pi
 * Ensures smooth 60fps gameplay across all devices
 */

export interface DeviceCapabilities {
  isLowPowerDevice: boolean;
  isMobileDevice: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasHighPerformanceGPU: boolean;
  memoryAvailable: number;
  cpuCores: number;
  deviceScore: number;
  screenResolution: string;
  pixelRatio: number;
}

export interface PerformanceSettings {
  targetFPS: number;
  enableFrameSkip: boolean;
  reduceParticleEffects: boolean;
  limitBackgroundObjects: boolean;
  useLowQualityAssets: boolean;
  skipRenderFrames: boolean;
  reduceAnimations: boolean;
  enableLowGraphicsMode: boolean;
  collisionDetectionLevel: 'basic' | 'optimized' | 'full';
  renderQuality: 'low' | 'medium' | 'high';
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  deviceScore: number;
  isLowPowerDevice: boolean;
  performanceWarnings: string[];
}

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;
  private consecutiveLowFpsFrames: number = 0;
  private performanceWarnings: string[] = [];
  private deviceCapabilities: DeviceCapabilities;
  private optimizedSettings: PerformanceSettings;
  private emergencyMode: boolean = false;

  private constructor() {
    this.detectDeviceCapabilities();
    this.optimizedSettings = this.getDefaultSettings();
    // Disable performance monitoring to prevent emergency mode activation
    // this.startPerformanceMonitoring();
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Detect device capabilities and performance characteristics
   */
  private detectDeviceCapabilities(): void {
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    const deviceMemory = (navigator as any).deviceMemory || 4;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;
    
    // Calculate device score (0-100)
    const deviceScore = Math.min(100, 
      (hardwareConcurrency * 8) + 
      (deviceMemory * 6) + 
      (screenWidth * screenHeight / 200000) +
      (isDesktop ? 20 : 0) +
      (pixelRatio <= 1 ? 10 : 0)
    );

    // Detect GPU capabilities
    const hasHighPerformanceGPU = this.detectGPUPerformance();

    this.deviceCapabilities = {
      isLowPowerDevice: deviceScore < 40,
      isMobileDevice: isMobile,
      isTablet: isTablet,
      isDesktop: isDesktop,
      hasHighPerformanceGPU,
      memoryAvailable: deviceMemory,
      cpuCores: hardwareConcurrency,
      deviceScore,
      screenResolution: `${screenWidth}x${screenHeight}`,
      pixelRatio
    };

    console.log('🎮 Device Capabilities:', this.deviceCapabilities);
  }

  /**
   * Detect GPU performance capabilities
   */
  private detectGPUPerformance(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      
      if (!gl) return false;
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
        return !renderer.toLowerCase().includes('software') && 
               !renderer.toLowerCase().includes('llvmpipe') &&
               !renderer.toLowerCase().includes('swiftshader');
      }
      
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get default settings based on device capabilities
   */
  private getDefaultSettings(): PerformanceSettings {
    const { deviceScore, isLowPowerDevice, isMobileDevice } = this.deviceCapabilities;
    
    if (deviceScore < 40 || isLowPowerDevice) {
      // Emergency mode for very low-end devices
      return {
        targetFPS: 30,
        enableFrameSkip: true,
        reduceParticleEffects: true,
        limitBackgroundObjects: true,
        useLowQualityAssets: true,
        skipRenderFrames: true,
        reduceAnimations: true,
        enableLowGraphicsMode: true,
        collisionDetectionLevel: 'basic',
        renderQuality: 'low'
      };
    } else if (deviceScore < 70 || isMobileDevice) {
      // Optimized mode for mid-range devices
      return {
        targetFPS: 45,
        enableFrameSkip: true,
        reduceParticleEffects: true,
        limitBackgroundObjects: true,
        useLowQualityAssets: false,
        skipRenderFrames: true,
        reduceAnimations: true,
        enableLowGraphicsMode: false,
        collisionDetectionLevel: 'optimized',
        renderQuality: 'medium'
      };
    } else {
      // High performance mode for high-end devices
      return {
        targetFPS: 60,
        enableFrameSkip: false,
        reduceParticleEffects: false,
        limitBackgroundObjects: false,
        useLowQualityAssets: false,
        skipRenderFrames: false,
        reduceAnimations: false,
        enableLowGraphicsMode: false,
        collisionDetectionLevel: 'full',
        renderQuality: 'high'
      };
    }
  }

  /**
   * Update frame time and calculate performance metrics
   */
  updateFrameTime(): void {
    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    this.frameCount++;

    // Update frame time history
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }

    // Calculate FPS
    const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
    const currentFPS = Math.round(1000 / avgFrameTime);

    // Update FPS history
    this.fpsHistory.push(currentFPS);
    if (this.fpsHistory.length > 60) {
      this.fpsHistory.shift();
    }

    // Track consecutive low FPS frames
    if (currentFPS < this.optimizedSettings.targetFPS * 0.8) {
      this.consecutiveLowFpsFrames++;
    } else {
      this.consecutiveLowFpsFrames = 0;
    }

    // Adaptive performance optimization
    this.updatePerformanceMode(currentFPS);
  }

  /**
   * Update performance mode based on current FPS
   */
  private updatePerformanceMode(currentFPS: number): void {
    const wasEmergencyMode = this.emergencyMode;
    
    // Disable emergency mode activation for now to prevent 3 FPS issue
    // Emergency mode activation - much less aggressive thresholds
    if (currentFPS < 5 || this.consecutiveLowFpsFrames > 100) { // Changed from 15 and 20
      this.emergencyMode = true;
      this.activateEmergencyMode();
    }
    
    // Normal mode restoration - more lenient
    if (currentFPS > 20 && this.consecutiveLowFpsFrames === 0) { // Changed from targetFPS * 0.8
      this.emergencyMode = false;
      this.restoreNormalMode();
    }

    // Only log mode changes once per session to reduce spam
    if (wasEmergencyMode !== this.emergencyMode) {
      console.log(`🚨 Performance mode changed: ${this.emergencyMode ? 'Emergency' : 'Normal'} (FPS: ${currentFPS})`);
    }
  }

  /**
   * Activate emergency mode for very low performance
   */
  private activateEmergencyMode(): void {
    this.optimizedSettings = {
      targetFPS: 30, // Increased from 25
      enableFrameSkip: true,
      reduceParticleEffects: true,
      limitBackgroundObjects: true,
      useLowQualityAssets: true,
      skipRenderFrames: false, // Changed from true to prevent extreme frame skipping
      reduceAnimations: true,
      enableLowGraphicsMode: true,
      collisionDetectionLevel: 'basic',
      renderQuality: 'low'
    };
    
    this.performanceWarnings.push('Emergency mode activated due to low performance');
    // Only log once per session to prevent spam
    if (!sessionStorage.getItem('emergencyModeLogged')) {
      console.warn('🚨 Emergency mode activated - Performance optimizations enabled');
      sessionStorage.setItem('emergencyModeLogged', 'true');
    }
  }

  /**
   * Restore normal mode when performance improves
   */
  private restoreNormalMode(): void {
    this.optimizedSettings = this.getDefaultSettings();
    this.performanceWarnings = this.performanceWarnings.filter(w => !w.includes('Emergency'));
    // Only log once per session to prevent spam
    if (!sessionStorage.getItem('emergencyModeRestored')) {
      console.log('✅ Normal mode restored - Performance optimizations relaxed');
      sessionStorage.setItem('emergencyModeRestored', 'true');
    }
  }

  /**
   * Get optimized settings for current performance
   */
  getOptimizedSettings(): PerformanceSettings {
    return { ...this.optimizedSettings };
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const avgFPS = this.fpsHistory.length > 0 
      ? this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length 
      : 0;

    const frameTime = avgFPS > 0 ? 1000 / avgFPS : 0;

    return {
      fps: Math.round(avgFPS),
      frameTime: Math.round(frameTime),
      memoryUsage: (performance as any).memory?.usedJSHeapSize,
      deviceScore: this.deviceCapabilities.deviceScore,
      isLowPowerDevice: this.deviceCapabilities.isLowPowerDevice,
      performanceWarnings: [...this.performanceWarnings]
    };
  }

  /**
   * Check if frame should be skipped for performance
   */
  shouldSkipFrame(): boolean {
    const settings = this.getOptimizedSettings();
    const metrics = this.getPerformanceMetrics();
    
    if (!settings.enableFrameSkip) return false;
    
    // More aggressive frame skipping for better performance
    if (metrics.fps < 35) {
      return this.frameCount % 2 === 0; // Skip every other frame
    }
    if (metrics.fps < 50) {
      return this.frameCount % 3 === 0; // Skip every 3rd frame
    }
    if (metrics.fps < this.optimizedSettings.targetFPS * 0.9) {
      return this.frameCount % 4 === 0; // Skip every 4th frame
    }
    
    // Skip frames on low-end devices for better performance
    if (this.deviceCapabilities.deviceScore < 70 && this.frameCount % 5 === 0) {
      return true;
    }
    
    return false;
  }

  /**
   * Get device capabilities
   */
  getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    let lastWarningTime = 0;
    const WARNING_COOLDOWN = 5000; // Only warn every 5 seconds
    
    const monitor = () => {
      this.updateFrameTime();
      
      const metrics = this.getPerformanceMetrics();
      const settings = this.getOptimizedSettings();
      const now = performance.now();
      
      // Clear old warnings first
      this.performanceWarnings = [];
      
      // Only add warnings if performance is actually poor and enough time has passed
      if (metrics.fps < 20 && now - lastWarningTime > WARNING_COOLDOWN) {
        this.performanceWarnings.push('Critical performance degradation detected');
        lastWarningTime = now;
      } else if (metrics.fps < 30 && now - lastWarningTime > WARNING_COOLDOWN) {
        this.performanceWarnings.push('Severe performance degradation detected');
        lastWarningTime = now;
      } else if (metrics.fps < settings.targetFPS * 0.7 && now - lastWarningTime > WARNING_COOLDOWN) {
        this.performanceWarnings.push('Performance degradation detected');
        lastWarningTime = now;
      }
      // If FPS is good, don't add any warnings
    };

    // Monitor every 10 frames instead of every frame to reduce overhead
    let frameCount = 0;
    const monitorLoop = () => {
      frameCount++;
      if (frameCount % 10 === 0) {
        monitor();
      }
      requestAnimationFrame(monitorLoop);
    };
    
    requestAnimationFrame(monitorLoop);
  }

  /**
   * Get recommended particle count based on performance
   */
  getRecommendedParticleCount(): number {
    const settings = this.getOptimizedSettings();
    const metrics = this.getPerformanceMetrics();
    
    if (settings.reduceParticleEffects || metrics.fps < 45) {
      return 0; // No particles for low performance
    }
    
    if (metrics.fps < 55) {
      return 3; // Minimal particles
    }
    
    if (metrics.fps < 58) {
      return 8; // Reduced particles
    }
    
    return 15; // Reduced full particles for better performance
  }

  /**
   * Get recommended star count for background
   */
  getRecommendedStarCount(): number {
    const settings = this.getOptimizedSettings();
    const metrics = this.getPerformanceMetrics();
    
    if (settings.limitBackgroundObjects || metrics.fps < 45) {
      return 0; // No stars for low performance
    }
    
    if (metrics.fps < 55) {
      return 5; // Minimal stars
    }
    
    if (metrics.fps < 58) {
      return 10; // Reduced stars
    }
    
    return 15; // Reduced full stars for better performance
  }

  /**
   * Check if animations should be reduced
   */
  shouldReduceAnimations(): boolean {
    const settings = this.getOptimizedSettings();
    const metrics = this.getPerformanceMetrics();
    
    return settings.reduceAnimations || metrics.fps < 50;
  }

  /**
   * Get collision detection level
   */
  getCollisionDetectionLevel(): 'basic' | 'optimized' | 'full' {
    const settings = this.getOptimizedSettings();
    const metrics = this.getPerformanceMetrics();
    
    if (metrics.fps < 35) {
      return 'basic';
    }
    
    if (metrics.fps < 50) {
      return 'optimized';
    }
    
    return settings.collisionDetectionLevel;
  }

  /**
   * Get render quality level
   */
  getRenderQuality(): 'low' | 'medium' | 'high' {
    const settings = this.getOptimizedSettings();
    const metrics = this.getPerformanceMetrics();
    
    if (metrics.fps < 35 || settings.enableLowGraphicsMode) {
      return 'low';
    }
    
    if (metrics.fps < 50) {
      return 'medium';
    }
    
    return settings.renderQuality;
  }

  /**
   * Check if low quality assets should be used
   */
  shouldUseLowQualityAssets(): boolean {
    const settings = this.getOptimizedSettings();
    const metrics = this.getPerformanceMetrics();
    
    return settings.useLowQualityAssets || metrics.fps < 40;
  }

  /**
   * Get device tier for optimization
   */
  getDeviceTier(): 'low' | 'medium' | 'high' {
    const { deviceScore } = this.deviceCapabilities;
    
    if (deviceScore < 40) return 'low';
    if (deviceScore < 70) return 'medium';
    return 'high';
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const metrics = this.getPerformanceMetrics();
    const settings = this.getOptimizedSettings();
    const deviceTier = this.getDeviceTier();
    const recommendations: string[] = [];
    
    // Only show recommendations if performance is actually poor
    if (metrics.fps < 30) {
      recommendations.push('Close other applications to improve performance');
      recommendations.push('Reduce browser tabs for better performance');
      recommendations.push('Consider using a more powerful device');
    } else if (metrics.fps < settings.targetFPS * 0.8) {
      recommendations.push('Performance is acceptable but could be improved');
      recommendations.push('Close unnecessary browser tabs');
    } else {
      recommendations.push('Performance is excellent');
    }

    // Device-specific recommendations
    if (deviceTier === 'low') {
      recommendations.push('Device is optimized for low-end performance');
      recommendations.push('Visual effects have been reduced for smooth gameplay');
    } else if (deviceTier === 'medium') {
      recommendations.push('Device is optimized for balanced performance');
      recommendations.push('Some visual effects may be reduced during gameplay');
    } else {
      recommendations.push('Device supports full visual effects');
      recommendations.push('All features are enabled for optimal experience');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance(); 