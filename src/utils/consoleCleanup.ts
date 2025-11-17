// Console cleanup and performance monitoring
export class ConsoleManager {
  private static instance: ConsoleManager;
  private originalConsole: Console;
  private isProduction: boolean;

  private constructor() {
    this.originalConsole = { ...console };
    this.isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : true;
    this.setupConsole();
  }

  static getInstance(): ConsoleManager {
    if (!ConsoleManager.instance) {
      ConsoleManager.instance = new ConsoleManager();
    }
    return ConsoleManager.instance;
  }

  private setupConsole(): void {
    if (this.isProduction) {
      // In production, only show errors and warnings
      console.log = () => {};
      console.info = () => {};
      console.debug = () => {};
      
      // Keep error and warn for debugging
      console.error = (...args: any[]) => {
        this.originalConsole.error('[PROD]', ...args);
      };
      
      console.warn = (...args: any[]) => {
        this.originalConsole.warn('[PROD]', ...args);
      };
    } else {
      // In development, add prefixes for better organization
      const originalLog = console.log;
      const originalInfo = console.info;
      const originalWarn = console.warn;
      const originalError = console.error;

      console.log = (...args: any[]) => {
        originalLog('[DEV]', ...args);
      };

      console.info = (...args: any[]) => {
        originalInfo('[DEV]', ...args);
      };

      console.warn = (...args: any[]) => {
        originalWarn('[DEV]', ...args);
      };

      console.error = (...args: any[]) => {
        originalError('[DEV]', ...args);
      };
    }
  }

  // Method to temporarily enable all console methods
  enableAllLogs(): void {
    console.log = this.originalConsole.log;
    console.info = this.originalConsole.info;
    console.debug = this.originalConsole.debug;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
  }

  // Method to restore production console settings
  restoreProductionLogs(): void {
    if (this.isProduction) {
      console.log = () => {};
      console.info = () => {};
      console.debug = () => {};
    }
  }

  // Method to log performance metrics
  logPerformance(label: string, duration: number): void {
    if (duration > 100) {
      console.warn(`Slow operation: ${label} took ${duration.toFixed(2)}ms`);
    } else if (duration > 50) {
      console.info(`Performance: ${label} took ${duration.toFixed(2)}ms`);
    }
  }

  // Method to log memory usage
  logMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize / 1024 / 1024;
      const total = memory.totalJSHeapSize / 1024 / 1024;
      
      if (used > total * 0.8) {
        console.warn(`High memory usage: ${used.toFixed(2)}MB / ${total.toFixed(2)}MB`);
      } else {
        console.info(`Memory usage: ${used.toFixed(2)}MB / ${total.toFixed(2)}MB`);
      }
    }
  }
}

// Initialize console manager
export const consoleManager = ConsoleManager.getInstance();

// Utility to measure function performance
export const measurePerformance = <T extends (...args: any[]) => any>(
  fn: T,
  label: string
): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = fn(...args);
    const duration = performance.now() - start;
    consoleManager.logPerformance(label, duration);
    return result;
  };
};

// Utility to debounce console logs
export const debouncedLog = (() => {
  const logs: string[] = [];
  let timeout: NodeJS.Timeout | null = null;

  return (message: string, delay: number = 1000) => {
    logs.push(message);
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      if (logs.length > 1) {
        console.log(`[BATCH] ${logs.length} messages:`, logs.join(', '));
      } else {
        console.log(logs[0]);
      }
      logs.length = 0;
    }, delay);
  };
})(); 