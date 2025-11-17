/**
 * Comprehensive Performance Test Utility
 * Tests device capabilities and provides optimization recommendations
 */

import { performanceOptimizer } from './performanceOptimizer';

export interface PerformanceTestResult {
  deviceScore: number;
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  deviceTier: 'low' | 'medium' | 'high';
  recommendations: string[];
  optimizations: {
    targetFPS: number;
    enableFrameSkip: boolean;
    reduceParticleEffects: boolean;
    limitBackgroundObjects: boolean;
    useLowQualityAssets: boolean;
    collisionDetectionLevel: 'basic' | 'optimized' | 'full';
    renderQuality: 'low' | 'medium' | 'high';
  };
  testDuration: number;
  testResults: {
    fpsStability: number;
    memoryEfficiency: number;
    renderingPerformance: number;
    overallScore: number;
  };
}

class PerformanceTest {
  private testDuration = 5000; // 5 seconds
  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private memoryHistory: number[] = [];
  private startTime: number = 0;
  private isRunning = false;

  /**
   * Run comprehensive performance test
   */
  async runTest(): Promise<PerformanceTestResult> {
    if (this.isRunning) {
      throw new Error('Performance test already running');
    }

    this.isRunning = true;
    this.startTime = performance.now();
    this.fpsHistory = [];
    this.frameTimeHistory = [];
    this.memoryHistory = [];

    console.log('🧪 Starting comprehensive performance test...');

    // Start monitoring
    const monitorInterval = setInterval(() => {
      this.updateMetrics();
    }, 16); // ~60fps monitoring

    // Wait for test duration
    await new Promise(resolve => setTimeout(resolve, this.testDuration));

    // Stop monitoring
    clearInterval(monitorInterval);
    this.isRunning = false;

    // Calculate results
    const results = this.calculateResults();
    
    console.log('✅ Performance test completed:', results);
    return results;
  }

  /**
   * Update performance metrics during test
   */
  private updateMetrics(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - (this.startTime || currentTime);
    
    if (deltaTime > 0) {
      const fps = 1000 / deltaTime;
      this.fpsHistory.push(fps);
      this.frameTimeHistory.push(deltaTime);
      
      // Memory usage (if available)
      if ((performance as any).memory) {
        this.memoryHistory.push((performance as any).memory.usedJSHeapSize);
      }
    }
    
    this.startTime = currentTime;
  }

  /**
   * Calculate test results
   */
  private calculateResults(): PerformanceTestResult {
    const avgFPS = this.fpsHistory.length > 0 
      ? this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length 
      : 0;

    const avgFrameTime = this.frameTimeHistory.length > 0
      ? this.frameTimeHistory.reduce((sum, time) => sum + time, 0) / this.frameTimeHistory.length
      : 0;

    const avgMemory = this.memoryHistory.length > 0
      ? this.memoryHistory.reduce((sum, mem) => sum + mem, 0) / this.memoryHistory.length
      : 0;

    // Calculate stability scores
    const fpsStability = this.calculateFPSStability();
    const memoryEfficiency = this.calculateMemoryEfficiency();
    const renderingPerformance = this.calculateRenderingPerformance();
    const overallScore = (fpsStability + memoryEfficiency + renderingPerformance) / 3;

    // Get device capabilities
    const deviceCapabilities = performanceOptimizer.getDeviceCapabilities();
    const deviceTier = performanceOptimizer.getDeviceTier();
    const optimizations = performanceOptimizer.getOptimizedSettings();

    // Generate recommendations
    const recommendations = this.generateRecommendations(avgFPS, deviceTier, overallScore);

    return {
      deviceScore: deviceCapabilities.deviceScore,
      fps: Math.round(avgFPS),
      frameTime: Math.round(avgFrameTime),
      memoryUsage: avgMemory > 0 ? Math.round(avgMemory / 1024 / 1024) : undefined, // MB
      deviceTier,
      recommendations,
      optimizations,
      testDuration: this.testDuration,
      testResults: {
        fpsStability,
        memoryEfficiency,
        renderingPerformance,
        overallScore
      }
    };
  }

  /**
   * Calculate FPS stability score (0-100)
   */
  private calculateFPSStability(): number {
    if (this.fpsHistory.length < 10) return 0;

    const avgFPS = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
    const variance = this.fpsHistory.reduce((sum, fps) => sum + Math.pow(fps - avgFPS, 2), 0) / this.fpsHistory.length;
    const standardDeviation = Math.sqrt(variance);

    // Higher score for higher FPS and lower variance
    const fpsScore = Math.min(100, (avgFPS / 60) * 100);
    const stabilityScore = Math.max(0, 100 - (standardDeviation / avgFPS) * 100);

    return Math.round((fpsScore + stabilityScore) / 2);
  }

  /**
   * Calculate memory efficiency score (0-100)
   */
  private calculateMemoryEfficiency(): number {
    if (this.memoryHistory.length < 5) return 100; // Assume good if no memory data

    const avgMemory = this.memoryHistory.reduce((sum, mem) => sum + mem, 0) / this.memoryHistory.length;
    const memoryMB = avgMemory / 1024 / 1024;

    // Score based on memory usage (lower is better)
    if (memoryMB < 50) return 100;
    if (memoryMB < 100) return 80;
    if (memoryMB < 200) return 60;
    if (memoryMB < 400) return 40;
    return 20;
  }

  /**
   * Calculate rendering performance score (0-100)
   */
  private calculateRenderingPerformance(): number {
    if (this.frameTimeHistory.length < 10) return 0;

    const avgFrameTime = this.frameTimeHistory.reduce((sum, time) => sum + time, 0) / this.frameTimeHistory.length;
    const targetFrameTime = 16.67; // 60fps target

    // Score based on frame time (lower is better)
    const frameTimeScore = Math.max(0, 100 - ((avgFrameTime - targetFrameTime) / targetFrameTime) * 100);
    
    return Math.round(frameTimeScore);
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(fps: number, deviceTier: string, overallScore: number): string[] {
    const recommendations: string[] = [];

    if (fps < 30) {
      recommendations.push('Close other applications to improve performance');
      recommendations.push('Reduce browser tabs for better performance');
      recommendations.push('Consider using a more powerful device');
    } else if (fps < 45) {
      recommendations.push('Performance is acceptable but could be improved');
      recommendations.push('Close unnecessary browser tabs');
    } else {
      recommendations.push('Performance is excellent');
    }

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

    if (overallScore < 50) {
      recommendations.push('Consider upgrading your device for better performance');
      recommendations.push('Close background applications');
    } else if (overallScore < 75) {
      recommendations.push('Performance is good with minor optimizations');
    } else {
      recommendations.push('Excellent performance - no optimizations needed');
    }

    return recommendations;
  }

  /**
   * Quick performance check (faster than full test)
   */
  async quickCheck(): Promise<{ fps: number; deviceTier: string; recommendations: string[] }> {
    const deviceCapabilities = performanceOptimizer.getDeviceCapabilities();
    const deviceTier = performanceOptimizer.getDeviceTier();
    
    // Quick FPS measurement
    const startTime = performance.now();
    let frameCount = 0;
    
    return new Promise((resolve) => {
      const measureFPS = () => {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - startTime >= 1000) { // 1 second
          const fps = Math.round((frameCount * 1000) / (currentTime - startTime));
          
          const recommendations = this.generateRecommendations(fps, deviceTier, 75);
          
          resolve({
            fps,
            deviceTier,
            recommendations
          });
        } else {
          requestAnimationFrame(measureFPS);
        }
      };
      
      requestAnimationFrame(measureFPS);
    });
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): string {
    const deviceCapabilities = performanceOptimizer.getDeviceCapabilities();
    const deviceTier = performanceOptimizer.getDeviceTier();
    const metrics = performanceOptimizer.getPerformanceMetrics();
    
    return `
🎮 Performance Summary:
• Device Score: ${deviceCapabilities.deviceScore}/100
• Device Tier: ${deviceTier.toUpperCase()}
• Current FPS: ${metrics.fps}
• Target FPS: ${performanceOptimizer.getOptimizedSettings().targetFPS}
• Memory: ${deviceCapabilities.memoryAvailable}GB
• CPU Cores: ${deviceCapabilities.cpuCores}
• GPU: ${deviceCapabilities.hasHighPerformanceGPU ? 'High Performance' : 'Standard'}
• Screen: ${deviceCapabilities.screenResolution}
    `.trim();
  }
}

// Export singleton instance
export const performanceTest = new PerformanceTest(); 