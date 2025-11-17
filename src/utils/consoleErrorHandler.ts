// Console Error Handler
// This utility helps manage console errors and provides better error reporting

interface ErrorInfo {
  message: string;
  source: string;
  line: number;
  column: number;
  stack?: string;
  timestamp: Date;
}

class ConsoleErrorHandler {
  private errors: ErrorInfo[] = [];
  private maxErrors = 50;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;
    
    // Store original console methods
    (console as any)._originalConsole = {
      error: console.error,
      warn: console.warn,
      log: console.log,
      group: console.group,
      groupEnd: console.groupEnd
    };
    
    // Override console.error to capture errors
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      this.captureError('error', args);
      originalError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      this.captureError('warn', args);
      originalWarn.apply(console, args);
    };

    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureGlobalError(event);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.capturePromiseRejection(event);
    });

    this.isInitialized = true;
    console.log('Console Error Handler initialized');
  }

  private captureError(level: 'error' | 'warn', args: any[]) {
    const errorInfo: ErrorInfo = {
      message: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '),
      source: 'console',
      line: 0,
      column: 0,
      timestamp: new Date()
    };

    this.addError(errorInfo);
  }

  private captureGlobalError(event: ErrorEvent) {
    const errorInfo: ErrorInfo = {
      message: event.message,
      source: event.filename || 'unknown',
      line: event.lineno,
      column: event.colno,
      stack: event.error?.stack,
      timestamp: new Date()
    };

    this.addError(errorInfo);
  }

  private capturePromiseRejection(event: PromiseRejectionEvent) {
    const errorInfo: ErrorInfo = {
      message: `Unhandled Promise Rejection: ${event.reason}`,
      source: 'promise',
      line: 0,
      column: 0,
      stack: event.reason?.stack,
      timestamp: new Date()
    };

    this.addError(errorInfo);
  }

  private addError(errorInfo: ErrorInfo) {
    this.errors.push(errorInfo);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Use original console methods to avoid recursion
    const originalConsole = (console as any)._originalConsole || console;
    
    // Log to console in a more organized way
    originalConsole.group(`🚨 ${errorInfo.source.toUpperCase()} ERROR`);
    originalConsole.error('Message:', errorInfo.message);
    originalConsole.error('Source:', errorInfo.source);
    originalConsole.error('Line:', errorInfo.line);
    originalConsole.error('Column:', errorInfo.column);
    originalConsole.error('Timestamp:', errorInfo.timestamp.toISOString());
    if (errorInfo.stack) {
      originalConsole.error('Stack:', errorInfo.stack);
    }
    originalConsole.groupEnd();
  }

  // Get all captured errors
  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  // Get errors by source
  getErrorsBySource(source: string): ErrorInfo[] {
    return this.errors.filter(error => error.source === source);
  }

  // Clear all errors
  clearErrors(): void {
    this.errors = [];
  }

  // Get error summary
  getErrorSummary(): { total: number; bySource: Record<string, number> } {
    const bySource: Record<string, number> = {};
    
    this.errors.forEach(error => {
      bySource[error.source] = (bySource[error.source] || 0) + 1;
    });

    return {
      total: this.errors.length,
      bySource
    };
  }

  // Check if there are critical errors
  hasCriticalErrors(): boolean {
    return this.errors.some(error => 
      error.message.includes('useGlobalMusicContext') ||
      error.message.includes('WebSocket connection') ||
      error.message.includes('ReferenceError')
    );
  }

  // Get user-friendly error message
  getUserFriendlyMessage(): string {
    if (this.hasCriticalErrors()) {
      return 'Some features may not work properly. Please refresh the page if you experience issues.';
    }
    return 'Application is running normally.';
  }
}

// Create singleton instance
export const consoleErrorHandler = new ConsoleErrorHandler();

// Export for use in components
export const useConsoleErrors = () => {
  return {
    errors: consoleErrorHandler.getErrors(),
    summary: consoleErrorHandler.getErrorSummary(),
    hasCriticalErrors: consoleErrorHandler.hasCriticalErrors(),
    userMessage: consoleErrorHandler.getUserFriendlyMessage(),
    clearErrors: () => consoleErrorHandler.clearErrors()
  };
};

export default consoleErrorHandler;
