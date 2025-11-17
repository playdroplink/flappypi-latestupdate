// Mobile Performance Optimizer - Comprehensive Performance Management for Mobile Devices
export class MobilePerformanceOptimizer {
  private static instance: MobilePerformanceOptimizer;
  private frameTimes: number[] = [];
  private lastFrameTime: number = 0;
  private fpsHistory: number[] = [];
  private performanceLevel: 'high' | 'medium' | 'low' | 'emergency' = 'high';
  private deviceCapabilities: {
    memory: number;
    cores: number;
    isMobile: boolean;
    isLowEnd: boolean;
  };
  private optimizationSettings: {
    targetFPS: number;
    maxFrameTime: number;
    collisionDetectionFrequency: number;
    particleCount: number;
    starCount: number;
    renderQuality: 'high' | 'medium' | 'low';
    enableEffects: boolean;
    enableParticles: boolean;
    enableBackgroundEffects: boolean;
  };

  constructor() {
    this.detectDeviceCapabilities();
    this.setOptimizationSettings();
    this.initializePerformanceMonitoring();
  }

  static getInstance(): MobilePerformanceOptimizer {
    if (!MobilePerformanceOptimizer.instance) {
      MobilePerformanceOptimizer.instance = new MobilePerformanceOptimizer();
    }
    return MobilePerformanceOptimizer.instance;
  }

  // Detect device capabilities
  private detectDeviceCapabilities(): void {
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEnd = memory < 4 || cores < 4 || isMobile;

    this.deviceCapabilities = {
      memory,
      cores,
      isMobile,
      isLowEnd
    };

    console.log('📱 Device capabilities detected:', this.deviceCapabilities);
  }

  // Set optimization settings based on device capabilities
  private setOptimizationSettings(): void {
    const { isLowEnd, isMobile } = this.deviceCapabilities;

    if (isLowEnd || isMobile) {
      this.performanceLevel = 'low';
      this.optimizationSettings = {
        targetFPS: 30,
        maxFrameTime: 33.33, // 30 FPS cap
        collisionDetectionFrequency: 2, // Check every 2 frames
        particleCount: 0,
        starCount: 0,
        renderQuality: 'low',
        enableEffects: false,
        enableParticles: false,
        enableBackgroundEffects: false
      };
    } else {
      this.performanceLevel = 'high';
      this.optimizationSettings = {
        targetFPS: 60,
        maxFrameTime: 16.67, // 60 FPS cap
        collisionDetectionFrequency: 1, // Check every frame
        particleCount: 15,
        starCount: 25,
        renderQuality: 'high',
        enableEffects: true,
        enableParticles: true,
        enableBackgroundEffects: true
      };
    }

    console.log('⚙️ Optimization settings:', this.optimizationSettings);
  }

  // Initialize performance monitoring
  private initializePerformanceMonitoring(): void {
    this.lastFrameTime = performance.now();
    this.frameTimes = [];
    this.fpsHistory = [];
  }

  // Update frame time and calculate FPS
  updateFrameTime(): void {
    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;
    
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }

    // Calculate current FPS
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const currentFPS = 1000 / avgFrameTime;
    
    this.fpsHistory.push(currentFPS);
    if (this.fpsHistory.length > 30) {
      this.fpsHistory.shift();
    }

    this.lastFrameTime = currentTime;

    // Adaptive performance adjustment
    this.adjustPerformanceLevel(currentFPS);
  }

  // Adjust performance level based on current FPS
  private adjustPerformanceLevel(currentFPS: number): void {
    const targetFPS = this.optimizationSettings.targetFPS;
    const fpsThreshold = targetFPS * 0.8; // 80% of target FPS

    if (currentFPS < fpsThreshold * 0.5) {
      // Emergency mode - maximum optimizations
      if (this.performanceLevel !== 'emergency') {
        this.performanceLevel = 'emergency';
        this.applyEmergencyOptimizations();
      }
    } else if (currentFPS < fpsThreshold) {
      // Low performance mode
      if (this.performanceLevel !== 'low') {
        this.performanceLevel = 'low';
        this.applyLowPerformanceOptimizations();
      }
    } else if (currentFPS < targetFPS * 0.9) {
      // Medium performance mode
      if (this.performanceLevel !== 'medium') {
        this.performanceLevel = 'medium';
        this.applyMediumPerformanceOptimizations();
      }
    } else {
      // High performance mode
      if (this.performanceLevel !== 'high') {
        this.performanceLevel = 'high';
        this.applyHighPerformanceOptimizations();
      }
    }
  }

  // Apply emergency optimizations
  private applyEmergencyOptimizations(): void {
    this.optimizationSettings = {
      targetFPS: 25,
      maxFrameTime: 40,
      collisionDetectionFrequency: 3,
      particleCount: 0,
      starCount: 0,
      renderQuality: 'low',
      enableEffects: false,
      enableParticles: false,
      enableBackgroundEffects: false
    };
    // Emergency performance mode activated
  }

  // Apply low performance optimizations
  private applyLowPerformanceOptimizations(): void {
    this.optimizationSettings = {
      targetFPS: 30,
      maxFrameTime: 33.33,
      collisionDetectionFrequency: 2,
      particleCount: 0,
      starCount: 5,
      renderQuality: 'low',
      enableEffects: false,
      enableParticles: false,
      enableBackgroundEffects: false
    };
    // Low performance mode activated
  }

  // Apply medium performance optimizations
  private applyMediumPerformanceOptimizations(): void {
    this.optimizationSettings = {
      targetFPS: 45,
      maxFrameTime: 22.22,
      collisionDetectionFrequency: 1,
      particleCount: 8,
      starCount: 15,
      renderQuality: 'medium',
      enableEffects: true,
      enableParticles: true,
      enableBackgroundEffects: false
    };
    console.log('📊 Medium performance mode activated');
  }

  // Apply high performance optimizations
  private applyHighPerformanceOptimizations(): void {
    this.optimizationSettings = {
      targetFPS: 60,
      maxFrameTime: 16.67,
      collisionDetectionFrequency: 1,
      particleCount: 15,
      starCount: 25,
      renderQuality: 'high',
      enableEffects: true,
      enableParticles: true,
      enableBackgroundEffects: true
    };
    console.log('📈 High performance mode activated');
  }

  // Check if frame should be skipped
  shouldSkipFrame(): boolean {
    const currentFPS = this.getCurrentFPS();
    const targetFPS = this.optimizationSettings.targetFPS;
    
    // Skip frame if FPS is below 80% of target
    return currentFPS < targetFPS * 0.8;
  }

  // Get current FPS
  getCurrentFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory[this.fpsHistory.length - 1];
  }

  // Get average FPS over last 30 frames
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  // Get optimization settings
  getOptimizationSettings() {
    return { ...this.optimizationSettings };
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return {
      currentFPS: this.getCurrentFPS(),
      averageFPS: this.getAverageFPS(),
      performanceLevel: this.performanceLevel,
      deviceCapabilities: this.deviceCapabilities,
      frameTimeHistory: [...this.frameTimes],
      fpsHistory: [...this.fpsHistory]
    };
  }

  // Get recommended particle count
  getRecommendedParticleCount(): number {
    return this.optimizationSettings.particleCount;
  }

  // Get recommended star count
  getRecommendedStarCount(): number {
    return this.optimizationSettings.starCount;
  }

  // Check if effects should be enabled
  shouldEnableEffects(): boolean {
    return this.optimizationSettings.enableEffects;
  }

  // Check if particles should be enabled
  shouldEnableParticles(): boolean {
    return this.optimizationSettings.enableParticles;
  }

  // Check if background effects should be enabled
  shouldEnableBackgroundEffects(): boolean {
    return this.optimizationSettings.enableBackgroundEffects;
  }

  // Get render quality
  getRenderQuality(): 'high' | 'medium' | 'low' {
    return this.optimizationSettings.renderQuality;
  }

  // Check collision detection frequency
  shouldCheckCollisions(frameCount: number): boolean {
    return frameCount % this.optimizationSettings.collisionDetectionFrequency === 0;
  }

  // Reset performance monitoring
  reset(): void {
    this.frameTimes = [];
    this.fpsHistory = [];
    this.lastFrameTime = performance.now();
    this.detectDeviceCapabilities();
    this.setOptimizationSettings();
  }

  // Force performance level
  forcePerformanceLevel(level: 'high' | 'medium' | 'low' | 'emergency'): void {
    this.performanceLevel = level;
    switch (level) {
      case 'emergency':
        this.applyEmergencyOptimizations();
        break;
      case 'low':
        this.applyLowPerformanceOptimizations();
        break;
      case 'medium':
        this.applyMediumPerformanceOptimizations();
        break;
      case 'high':
        this.applyHighPerformanceOptimizations();
        break;
    }
  }

  // Get performance warning status
  getPerformanceWarning(): string | null {
    const currentFPS = this.getCurrentFPS();
    const targetFPS = this.optimizationSettings.targetFPS;

    if (currentFPS < targetFPS * 0.5) {
      return 'Critical performance issues detected. Game may be laggy.';
    } else if (currentFPS < targetFPS * 0.8) {
      return 'Performance issues detected. Some effects may be disabled.';
    }

    return null;
  }
}

// Export singleton instance
export const mobilePerformanceOptimizer = MobilePerformanceOptimizer.getInstance();
