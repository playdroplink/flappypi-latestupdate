// Game Performance Optimizer - Comprehensive Performance Management
export class GamePerformanceOptimizer {
  private static instance: GamePerformanceOptimizer;
  private frameCount = 0;
  private lastFrameTime = 0;
  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private consecutiveLowFpsFrames = 0;
  private isLowPerformanceMode = false;
  private emergencyMode = false;
  private deviceCapabilities: {
    isLowEndDevice: boolean;
    isMobile: boolean;
    hasWeakGPU: boolean;
    memory: number;
    cores: number;
  };

  private optimizedSettings = {
    targetFPS: 60,
    minFPS: 30,
    emergencyFPS: 25,
    particleCount: 50,
    starCount: 25,
    enableShadows: true,
    enableParticles: true,
    enableBackgroundEffects: true,
    collisionDetectionFrequency: 1,
    renderQuality: 'high' as 'low' | 'medium' | 'high' | 'emergency'
  };

  private constructor() {
    this.detectDeviceCapabilities();
    this.initializePerformanceMonitoring();
  }

  static getInstance(): GamePerformanceOptimizer {
    if (!GamePerformanceOptimizer.instance) {
      GamePerformanceOptimizer.instance = new GamePerformanceOptimizer();
    }
    return GamePerformanceOptimizer.instance;
  }

  private detectDeviceCapabilities(): void {
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Detect weak GPU by checking for WebGL support and performance
    let hasWeakGPU = false;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          hasWeakGPU = renderer.includes('Intel') || renderer.includes('Mali') || renderer.includes('Adreno');
        }
      }
    } catch (e) {
      hasWeakGPU = true;
    }

    this.deviceCapabilities = {
      isLowEndDevice: memory < 4 || cores < 4,
      isMobile,
      hasWeakGPU,
      memory,
      cores
    };

    // Apply device-specific optimizations
    if (this.deviceCapabilities.isLowEndDevice) {
      this.optimizedSettings.particleCount = 10;
      this.optimizedSettings.starCount = 10;
      this.optimizedSettings.enableShadows = false;
      this.optimizedSettings.renderQuality = 'low';
    }

    if (this.deviceCapabilities.isMobile) {
      this.optimizedSettings.targetFPS = 45;
      this.optimizedSettings.minFPS = 25;
    }

    console.log('🔧 Device capabilities detected:', this.deviceCapabilities);
    console.log('⚙️ Optimized settings:', this.optimizedSettings);
  }

  private initializePerformanceMonitoring(): void {
    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memoryInfo = (performance as any).memory;
        if (memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.8) {
          console.warn('⚠️ High memory usage detected, triggering cleanup');
          this.triggerMemoryCleanup();
        }
      }, 5000);
    }
  }

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

  private updatePerformanceMode(currentFPS: number): void {
    const wasEmergencyMode = this.emergencyMode;
    const wasLowPerformanceMode = this.isLowPerformanceMode;

    // Emergency mode - maximum optimizations
    if (currentFPS < this.optimizedSettings.emergencyFPS || this.consecutiveLowFpsFrames > 30) {
      this.emergencyMode = true;
      this.optimizedSettings.renderQuality = 'emergency';
      this.optimizedSettings.particleCount = 0;
      this.optimizedSettings.starCount = 0;
      this.optimizedSettings.enableShadows = false;
      this.optimizedSettings.enableParticles = false;
      this.optimizedSettings.enableBackgroundEffects = false;
      this.optimizedSettings.collisionDetectionFrequency = 2;
    }
    // Low performance mode - moderate optimizations
    else if (currentFPS < this.optimizedSettings.minFPS || this.consecutiveLowFpsFrames > 15) {
      this.isLowPerformanceMode = true;
      this.optimizedSettings.renderQuality = 'low';
      this.optimizedSettings.particleCount = Math.max(5, this.optimizedSettings.particleCount / 2);
      this.optimizedSettings.starCount = Math.max(5, this.optimizedSettings.starCount / 2);
      this.optimizedSettings.enableShadows = false;
      this.optimizedSettings.collisionDetectionFrequency = 2;
    }
    // Normal performance mode
    else {
      this.emergencyMode = false;
      this.isLowPerformanceMode = false;
      this.optimizedSettings.renderQuality = 'high';
      this.optimizedSettings.particleCount = this.deviceCapabilities.isLowEndDevice ? 10 : 50;
      this.optimizedSettings.starCount = this.deviceCapabilities.isLowEndDevice ? 10 : 25;
      this.optimizedSettings.enableShadows = !this.deviceCapabilities.isLowEndDevice;
      this.optimizedSettings.enableParticles = true;
      this.optimizedSettings.enableBackgroundEffects = true;
      this.optimizedSettings.collisionDetectionFrequency = 1;
    }

    // Log mode changes
    if (this.emergencyMode !== wasEmergencyMode) {
      // Emergency mode status changed
    }
    if (this.isLowPerformanceMode !== wasLowPerformanceMode) {
      // Low performance mode status changed
    }
  }

  shouldSkipFrame(): boolean {
    if (this.emergencyMode) {
      return this.frameCount % 2 === 0; // Skip every other frame
    }
    if (this.isLowPerformanceMode) {
      return this.frameCount % 3 === 0; // Skip every third frame
    }
    return false;
  }

  getOptimizedSettings() {
    return { ...this.optimizedSettings };
  }

  getPerformanceMetrics() {
    const avgFPS = this.fpsHistory.length > 0 
      ? Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length)
      : 0;
    
    const avgFrameTime = this.frameTimeHistory.length > 0
      ? Math.round(this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length)
      : 0;

    return {
      currentFPS: avgFPS,
      avgFrameTime,
      isLowPerformanceMode: this.isLowPerformanceMode,
      emergencyMode: this.emergencyMode,
      deviceCapabilities: this.deviceCapabilities,
      consecutiveLowFpsFrames: this.consecutiveLowFpsFrames
    };
  }

  private triggerMemoryCleanup(): void {
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
    
    // Clear any cached data
    this.frameTimeHistory.length = 0;
    this.fpsHistory.length = 0;
    
    console.log('🧹 Memory cleanup triggered');
  }

  // Canvas optimization methods
  optimizeCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable hardware acceleration
    ctx.imageSmoothingEnabled = this.optimizedSettings.renderQuality !== 'emergency';
    ctx.imageSmoothingQuality = this.optimizedSettings.renderQuality === 'high' ? 'high' : 'low';

    // Set canvas properties for better performance
    canvas.style.transform = 'translateZ(0)';
    canvas.style.willChange = 'transform';
  }

  // Game loop optimization
  createOptimizedGameLoop(
    updateFn: (deltaTime: number) => void,
    renderFn: () => void,
    targetFPS: number = 60
  ): (timestamp: number) => void {
    let lastTime = 0;
    const frameInterval = 1000 / targetFPS;

    return (timestamp: number) => {
      const deltaTime = timestamp - lastTime;

      // Skip frame if needed for performance
      if (this.shouldSkipFrame()) {
        requestAnimationFrame(this.createOptimizedGameLoop(updateFn, renderFn, targetFPS));
        return;
      }

      // Update performance metrics
      this.updateFrameTime();

      // Update game logic
      if (deltaTime >= frameInterval) {
        updateFn(deltaTime);
        lastTime = timestamp;
      }

      // Always render for smooth visuals
      renderFn();

      // Continue loop
      requestAnimationFrame(this.createOptimizedGameLoop(updateFn, renderFn, targetFPS));
    };
  }

  // Collision detection optimization
  shouldCheckCollisions(frameCount: number): boolean {
    return frameCount % this.optimizedSettings.collisionDetectionFrequency === 0;
  }

  // Particle system optimization
  getParticleCount(): number {
    return this.optimizedSettings.particleCount;
  }

  // Background effects optimization
  shouldRenderBackgroundEffects(): boolean {
    return this.optimizedSettings.enableBackgroundEffects;
  }

  // Shadow effects optimization
  shouldRenderShadows(): boolean {
    return this.optimizedSettings.enableShadows;
  }

  // Star field optimization
  getStarCount(): number {
    return this.optimizedSettings.starCount;
  }

  // Reset performance state
  reset(): void {
    this.frameCount = 0;
    this.consecutiveLowFpsFrames = 0;
    this.isLowPerformanceMode = false;
    this.emergencyMode = false;
    this.frameTimeHistory.length = 0;
    this.fpsHistory.length = 0;
    this.detectDeviceCapabilities();
  }
}

// Export singleton instance
export const performanceOptimizer = GamePerformanceOptimizer.getInstance();
