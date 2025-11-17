// Game Performance Optimization Utility
export class GamePerformanceOptimizer {
  private static instance: GamePerformanceOptimizer;
  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;
  private isLowPerformanceMode: boolean = false;
  private consecutiveLowFpsFrames: number = 0;
  private deviceCapabilities: {
    isLowPowerDevice: boolean;
    hasHighPerformanceGPU: boolean;
    memoryAvailable: number;
  };
  private optimizedSettings: {
    particleEffects: boolean;
    backgroundStars: boolean;
    visualEffects: boolean;
    shadows: boolean;
    glows: boolean;
    animations: boolean;
    collisionDetection: 'basic' | 'optimized' | 'full';
    renderQuality: 'low' | 'medium' | 'high';
  };

  private constructor() {
    this.detectDeviceCapabilities();
    this.optimizedSettings = this.getDefaultSettings();
    // Disable performance monitoring to prevent emergency mode activation
    // this.startPerformanceMonitoring();
  }

  private getDefaultSettings() {
    return {
      particleEffects: true,
      backgroundStars: true,
      visualEffects: true,
      shadows: true,
      glows: true,
      animations: true,
      collisionDetection: 'full' as const,
      renderQuality: 'high' as const
    };
  }

  static getInstance(): GamePerformanceOptimizer {
    if (!GamePerformanceOptimizer.instance) {
      GamePerformanceOptimizer.instance = new GamePerformanceOptimizer();
    }
    return GamePerformanceOptimizer.instance;
  }

  private detectDeviceCapabilities(): void {
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    const deviceMemory = (navigator as any).deviceMemory || 4;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    // Calculate device score
    const deviceScore = Math.min(100, 
      (hardwareConcurrency * 10) + 
      (deviceMemory * 5) + 
      (screenWidth * screenHeight / 100000)
    );

    this.deviceCapabilities = {
      isLowPowerDevice: deviceScore < 50,
      hasHighPerformanceGPU: deviceScore > 70,
      memoryAvailable: deviceMemory
    };

    console.log('🔧 Device capabilities detected:', {
      score: deviceScore,
      cores: hardwareConcurrency,
      memory: deviceMemory,
      isLowPower: this.deviceCapabilities.isLowPowerDevice
    });
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
    if (currentFPS < 45) {
      this.consecutiveLowFpsFrames++;
    } else {
      this.consecutiveLowFpsFrames = 0;
    }

    // Adaptive performance mode with more aggressive thresholds
    this.updatePerformanceMode(currentFPS);
  }

  private updatePerformanceMode(currentFPS: number): void {
    const wasLowPerformance = this.isLowPerformanceMode;
    
    // Enable low performance mode if FPS is consistently low (more aggressive)
    if (currentFPS < 50 && this.fpsHistory.length > 5) {
      const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
      if (avgFPS < 45 || this.consecutiveLowFpsFrames > 3) {
        this.isLowPerformanceMode = true;
      }
    }
    
    // Disable low performance mode if FPS is good (more conservative)
    if (currentFPS > 58 && this.fpsHistory.length > 10) {
      const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
      if (avgFPS > 55) {
        this.isLowPerformanceMode = false;
      }
    }

    if (wasLowPerformance !== this.isLowPerformanceMode) {
      console.log(`🎯 Performance mode changed: ${this.isLowPerformanceMode ? 'Low' : 'High'} (FPS: ${currentFPS})`);
    }
  }

  getPerformanceMetrics(): {
    fps: number;
    frameTime: number;
    isLowPerformanceMode: boolean;
    deviceCapabilities: any;
    consecutiveLowFpsFrames: number;
  } {
    const avgFPS = this.fpsHistory.length > 0 
      ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length 
      : 60;
    
    const avgFrameTime = this.frameTimeHistory.length > 0
      ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
      : 16.67;

    return {
      fps: Math.round(avgFPS),
      frameTime: avgFrameTime,
      isLowPerformanceMode: this.isLowPerformanceMode,
      deviceCapabilities: this.deviceCapabilities,
      consecutiveLowFpsFrames: this.consecutiveLowFpsFrames
    };
  }

  getOptimizedSettings(): {
    targetFPS: number;
    enableFrameSkip: boolean;
    reduceAnimations: boolean;
    limitParticles: boolean;
    useLowQualityAssets: boolean;
    skipRenderFrames: boolean;
    reduceBackgroundComplexity: boolean;
  } {
    const metrics = this.getPerformanceMetrics();
    
    return {
      targetFPS: this.deviceCapabilities.isLowPowerDevice ? 30 : 60,
      enableFrameSkip: metrics.fps < 45 || this.consecutiveLowFpsFrames > 2,
      reduceAnimations: metrics.fps < 50 || this.deviceCapabilities.isLowPowerDevice,
      limitParticles: metrics.fps < 55 || this.deviceCapabilities.isLowPowerDevice,
      useLowQualityAssets: this.deviceCapabilities.isLowPowerDevice,
      skipRenderFrames: metrics.fps < 40 || this.consecutiveLowFpsFrames > 5,
      reduceBackgroundComplexity: metrics.fps < 48 || this.deviceCapabilities.isLowPowerDevice
    };
  }

  getDetailedOptimizedSettings() {
    return this.optimizedSettings;
  }

  // Public method to check if low performance mode is active
  getLowPerformanceMode(): boolean {
    return this.isLowPerformanceMode;
  }

  shouldSkipFrame(): boolean {
    const settings = this.getOptimizedSettings();
    const metrics = this.getPerformanceMetrics();
    
    // More aggressive frame skipping for low performance
    if (settings.enableFrameSkip) {
      // Skip every other frame if FPS is very low
      if (metrics.fps < 35) {
        return this.frameCount % 2 === 0;
      }
      // Skip every 3rd frame if FPS is moderately low
      if (metrics.fps < 45) {
        return this.frameCount % 3 === 0;
      }
      // Skip every 4th frame for moderate performance
      return this.frameCount % 4 === 0;
    }
    
    return false;
  }

  shouldSkipRender(): boolean {
    const settings = this.getOptimizedSettings();
    return settings.skipRenderFrames && this.frameCount % 2 === 0;
  }

  optimizeGameLoop(callback: () => void): void {
    if (!this.shouldSkipFrame()) {
      callback();
    }
  }

  // Memory management with more aggressive cleanup
  clearUnusedAssets(): void {
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    // Clear image cache if memory is low or performance is poor
    const metrics = this.getPerformanceMetrics();
    if (this.deviceCapabilities.memoryAvailable < 2 || metrics.fps < 40) {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.dataset.cacheable === 'false') {
          img.src = '';
        }
      });
    }
  }

  // Performance monitoring with enhanced logging
  startPerformanceMonitoring(): void {
    const monitor = () => {
      this.updateFrameTime();
      
      const metrics = this.getPerformanceMetrics();
      if (metrics.fps < 30) {
        console.warn('⚠️ Critical performance issue detected:', metrics);
        // Trigger aggressive optimizations
        this.triggerAggressiveOptimizations();
      } else if (metrics.fps < 45) {
        console.warn('⚠️ Performance degradation detected:', metrics);
      }
    };

    // Monitor every frame
    const monitorLoop = () => {
      monitor();
      requestAnimationFrame(monitorLoop);
    };
    
    requestAnimationFrame(monitorLoop);
  }

  private triggerAggressiveOptimizations(): void {
    // Force low performance mode
    this.isLowPerformanceMode = true;
    
    // Clear memory aggressively
    this.clearUnusedAssets();
    
    // Reduce canvas quality temporarily
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.imageSmoothingQuality = 'low';
      }
    }
  }

  // Adaptive quality settings with more aggressive reductions
  getAdaptiveQualitySettings(): {
    animationSpeed: number;
    particleCount: number;
    backgroundComplexity: number;
    soundQuality: 'high' | 'medium' | 'low';
    renderQuality: 'high' | 'medium' | 'low';
  } {
    const metrics = this.getPerformanceMetrics();
    const settings = this.getOptimizedSettings();

    let renderQuality: 'high' | 'medium' | 'low' = 'high';
    if (metrics.fps < 40) renderQuality = 'low';
    else if (metrics.fps < 50) renderQuality = 'medium';

    return {
      animationSpeed: settings.reduceAnimations ? 0.3 : 1.0,
      particleCount: settings.limitParticles ? 5 : 30,
      backgroundComplexity: this.deviceCapabilities.isLowPowerDevice ? 0.2 : 1.0,
      soundQuality: this.deviceCapabilities.isLowPowerDevice ? 'low' : 'high',
      renderQuality
    };
  }

  // Reset performance tracking
  resetPerformanceTracking(): void {
    this.fpsHistory = [];
    this.frameTimeHistory = [];
    this.consecutiveLowFpsFrames = 0;
    this.frameCount = 0;
    console.log('🔄 Performance tracking reset');
  }

  // Emergency performance mode for extremely low-end devices
  activateEmergencyMode(): void {
    this.isLowPerformanceMode = true;
    this.consecutiveLowFpsFrames = 0;
    
    // Disable all non-essential features
    this.optimizedSettings = {
      ...this.optimizedSettings,
      particleEffects: false,
      backgroundStars: false,
      visualEffects: false,
      shadows: false,
      glows: false,
      animations: false,
      collisionDetection: 'basic'
    };
    
    // Emergency performance mode activated
  }

  // Check if emergency mode should be activated
  shouldActivateEmergencyMode(): boolean {
    const metrics = this.getPerformanceMetrics();
    return metrics.fps < 25 || metrics.frameTime > 40;
  }

  // Get device performance tier
  getDevicePerformanceTier(): 'low' | 'medium' | 'high' {
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const connection = (navigator as any).connection?.effectiveType || '4g';
    
    if (memory < 2 || cores < 2 || connection === 'slow-2g') {
      return 'low';
    } else if (memory < 4 || cores < 4 || connection === '2g') {
      return 'medium';
    } else {
      return 'high';
    }
  }

  // Optimize settings based on device tier
  optimizeForDevice(): void {
    const tier = this.getDevicePerformanceTier();
    
    switch (tier) {
      case 'low':
        this.optimizedSettings = {
          ...this.optimizedSettings,
          particleEffects: false,
          backgroundStars: false,
          visualEffects: false,
          shadows: false,
          glows: false,
          animations: false,
          collisionDetection: 'basic',
          renderQuality: 'low'
        };
        break;
      case 'medium':
        this.optimizedSettings = {
          ...this.optimizedSettings,
          particleEffects: true,
          backgroundStars: true,
          visualEffects: true,
          shadows: false,
          glows: false,
          animations: true,
          collisionDetection: 'optimized',
          renderQuality: 'medium'
        };
        break;
      case 'high':
        this.optimizedSettings = {
          ...this.optimizedSettings,
          particleEffects: true,
          backgroundStars: true,
          visualEffects: true,
          shadows: true,
          glows: true,
          animations: true,
          collisionDetection: 'full',
          renderQuality: 'high'
        };
        break;
    }
    
    console.log(`🎮 Optimized for ${tier} performance tier`);
  }
}

// Export singleton instance
export const gamePerformanceOptimizer = GamePerformanceOptimizer.getInstance();

import React from 'react';

// Performance monitoring hook
export const useGamePerformance = () => {
  const [metrics, setMetrics] = React.useState(gamePerformanceOptimizer.getPerformanceMetrics());
  const [settings, setSettings] = React.useState(gamePerformanceOptimizer.getOptimizedSettings());

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(gamePerformanceOptimizer.getPerformanceMetrics());
      setSettings(gamePerformanceOptimizer.getOptimizedSettings());
    };

    const interval = setInterval(updateMetrics, 500); // Update more frequently
    return () => clearInterval(interval);
  }, []);

  return { metrics, settings, optimizer: gamePerformanceOptimizer };
}; 