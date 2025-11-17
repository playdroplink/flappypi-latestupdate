// Performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private startTimes: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): void {
    this.startTimes.set(label, performance.now());
  }

  endTimer(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(`Timer '${label}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(label);

    // Store metric for averaging
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);

    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  logMetrics(): void {
    console.group('Performance Metrics');
    for (const [label, times] of this.metrics.entries()) {
      const avg = this.getAverageTime(label);
      const min = Math.min(...times);
      const max = Math.max(...times);
      console.log(`${label}: avg=${avg.toFixed(2)}ms, min=${min.toFixed(2)}ms, max=${max.toFixed(2)}ms, count=${times.length}`);
    }
    console.groupEnd();
  }

  clearMetrics(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

// Memory usage monitoring
export const getMemoryUsage = (): string => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const used = memory.usedJSHeapSize / 1024 / 1024;
    const total = memory.totalJSHeapSize / 1024 / 1024;
    return `${used.toFixed(2)}MB / ${total.toFixed(2)}MB`;
  }
  return 'Memory usage not available';
};

// FPS monitoring
export class FPSMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;

  update(): number {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    return this.fps;
  }

  getFPS(): number {
    return this.fps;
  }
}

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}; 