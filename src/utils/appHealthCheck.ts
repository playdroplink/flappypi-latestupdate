// App Health Check
// This utility checks if the app is working properly and reports any issues
import React from 'react';

interface HealthStatus {
  isHealthy: boolean;
  issues: string[];
  warnings: string[];
  timestamp: string;
}

class AppHealthCheck {
  private static instance: AppHealthCheck;
  private checkInterval: number | null = null;

  private constructor() {}

  static getInstance(): AppHealthCheck {
    if (!AppHealthCheck.instance) {
      AppHealthCheck.instance = new AppHealthCheck();
    }
    return AppHealthCheck.instance;
  }

  checkHealth(): HealthStatus {
    const issues: string[] = [];
    const warnings: string[] = [];
    let isHealthy = true;

    // Check if React is working
    try {
      if (!React || typeof React !== 'object') {
        issues.push('React is not available');
        isHealthy = false;
      }
    } catch (error) {
      issues.push('React check failed');
      isHealthy = false;
    }

    // Check if DOM is available
    if (typeof window === 'undefined') {
      issues.push('Window object is not available');
      isHealthy = false;
    }

    // Check if document is available
    if (typeof document === 'undefined') {
      issues.push('Document object is not available');
      isHealthy = false;
    }

    // Check for console errors
    const errorCount = (console as any)._errorCount || 0;
    if (errorCount > 10) {
      warnings.push(`High error count: ${errorCount}`);
    }

    // Check for memory issues
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
        warnings.push('High memory usage detected');
      }
    }

    // Check for Pi SDK
    if (typeof window !== 'undefined' && !window.Pi) {
      warnings.push('Pi SDK not loaded');
    }

    return {
      isHealthy,
      issues,
      warnings,
      timestamp: new Date().toISOString()
    };
  }

  startPeriodicCheck(intervalMs: number = 30000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = window.setInterval(() => {
      const health = this.checkHealth();
      
      if (!health.isHealthy) {
        console.warn('App health check failed:', health);
      } else if (health.warnings.length > 0) {
        console.info('App health warnings:', health.warnings);
      }
    }, intervalMs);
  }

  stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  getHealthReport(): string {
    const health = this.checkHealth();
    
    let report = `App Health Report (${health.timestamp})\n`;
    report += `Status: ${health.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}\n`;
    
    if (health.issues.length > 0) {
      report += `Issues:\n${health.issues.map(issue => `  - ${issue}`).join('\n')}\n`;
    }
    
    if (health.warnings.length > 0) {
      report += `Warnings:\n${health.warnings.map(warning => `  - ${warning}`).join('\n')}\n`;
    }
    
    return report;
  }
}

// Export singleton instance
export const appHealthCheck = AppHealthCheck.getInstance();

// Auto-start health monitoring
if (typeof window !== 'undefined') {
  appHealthCheck.startPeriodicCheck();
}

export default appHealthCheck;
