// Console Error Suppressor
// This utility prevents recursive console errors and provides clean error handling

class ConsoleErrorSuppressor {
  private static instance: ConsoleErrorSuppressor;
  private isSuppressed = false;
  private originalConsole: any;
  private errorCount = 0;
  private maxErrors = 10;

  private constructor() {
    this.originalConsole = {
      error: console.error,
      warn: console.warn,
      log: console.log,
      group: console.group,
      groupEnd: console.groupEnd
    };
  }

  static getInstance(): ConsoleErrorSuppressor {
    if (!ConsoleErrorSuppressor.instance) {
      ConsoleErrorSuppressor.instance = new ConsoleErrorSuppressor();
    }
    return ConsoleErrorSuppressor.instance;
  }

  suppressRecursiveErrors(): void {
    if (this.isSuppressed) return;

    // Store original console methods
    (console as any)._originalConsole = this.originalConsole;

    // Override console.error to prevent recursion
    console.error = (...args: any[]) => {
      this.errorCount++;
      
      // Suppress if too many errors
      if (this.errorCount > this.maxErrors) {
        return;
      }

      // Use original console.error
      this.originalConsole.error.apply(console, args);
    };

    // Override console.warn to prevent recursion
    console.warn = (...args: any[]) => {
      // Use original console.warn
      this.originalConsole.warn.apply(console, args);
    };

    this.isSuppressed = true;
    console.log('Console error suppressor activated');
  }

  reset(): void {
    if (this.isSuppressed) {
      console.error = this.originalConsole.error;
      console.warn = this.originalConsole.warn;
      console.log = this.originalConsole.log;
      console.group = this.originalConsole.group;
      console.groupEnd = this.originalConsole.groupEnd;
      
      this.isSuppressed = false;
      this.errorCount = 0;
    }
  }

  getErrorCount(): number {
    return this.errorCount;
  }

  resetErrorCount(): void {
    this.errorCount = 0;
  }
}

// Export singleton instance
export const consoleErrorSuppressor = ConsoleErrorSuppressor.getInstance();

// Auto-activate the suppressor
if (typeof window !== 'undefined') {
  consoleErrorSuppressor.suppressRecursiveErrors();
}

export default consoleErrorSuppressor;
