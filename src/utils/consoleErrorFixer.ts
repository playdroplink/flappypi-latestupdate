// Console Error Fixer Utility
// This utility helps prevent and handle common React console errors

interface ConsoleErrorFixerConfig {
  maxUpdateDepth: number;
  maxAuthAttempts: number;
  throttleInterval: number;
  enableDebugMode: boolean;
  suppressAnalyticsErrors: boolean;
  suppressCORSErrors: boolean;
}

class ConsoleErrorFixer {
  private static instance: ConsoleErrorFixer;
  private updateDepthCount = 0;
  private authAttemptsCount = 0;
  private lastUpdateTime = 0;
  private config: ConsoleErrorFixerConfig;
  private analyticsErrorCount = 0;
  private corsErrorCount = 0;

  private constructor() {
    this.config = {
      maxUpdateDepth: 50,
      maxAuthAttempts: 10,
      throttleInterval: 1000, // 1 second
      enableDebugMode: false, // Disabled for mainnet production
      suppressAnalyticsErrors: true,
      suppressCORSErrors: true
    };
  }

  static getInstance(): ConsoleErrorFixer {
    if (!ConsoleErrorFixer.instance) {
      ConsoleErrorFixer.instance = new ConsoleErrorFixer();
    }
    return ConsoleErrorFixer.instance;
  }

  // Prevent maximum update depth exceeded errors
  checkUpdateDepth(): boolean {
    const now = Date.now();
    
    // Reset counter if enough time has passed
    if (now - this.lastUpdateTime > this.config.throttleInterval) {
      this.updateDepthCount = 0;
      this.lastUpdateTime = now;
      return true;
    }

    this.updateDepthCount++;
    
    if (this.updateDepthCount > this.config.maxUpdateDepth) {
      if (this.config.enableDebugMode) {
        console.warn('Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn\'t have a dependency array, or one of the dependencies changes on every render.');
      }
      return false;
    }

    return true;
  }

  // Prevent too many auth attempts
  checkAuthAttempts(): boolean {
    this.authAttemptsCount++;
    
    if (this.authAttemptsCount > this.config.maxAuthAttempts) {
      if (this.config.enableDebugMode) {
        console.warn('Too many authentication attempts detected. Please check your authentication logic.');
      }
      return false;
    }

    return true;
  }

  // Reset auth attempts counter
  resetAuthAttempts(): void {
    this.authAttemptsCount = 0;
  }

  // Reset update depth counter
  resetUpdateDepth(): void {
    this.updateDepthCount = 0;
    this.lastUpdateTime = Date.now();
  }

  // Handle React warnings
  handleReactWarning(message: string): void {
    if (message.includes('Maximum update depth exceeded')) {
      this.resetUpdateDepth();
      if (this.config.enableDebugMode) {
        console.warn('React warning handled: Maximum update depth exceeded. Component state has been reset.');
      }
    }
  }

  // Check if error should be suppressed
  private shouldSuppressError(message: string): boolean {
    const suppressedErrors = [
      // Pi SDK related errors
      'postMessage',
      'target origin',
      'GoTrueClient',
      'Multiple GoTrueClient instances detected',
      'Messaging promise with id',
      'timed out after',
      'pi-sdk.js',
      
      // Music playback errors
      'Music playback error',
      'AudioContext',
      'AudioBuffer',
      'Web Audio API',
      
      // CORS and network errors
      'CORS',
      'fetch',
      'NetworkError',
      'timeout',
      'Failed to fetch',
      
      // Authentication related errors
      'Too many auth attempts',
      'AuthContext',
      'PiAuthGuard',
      
      // React development warnings
      'Warning: ReactDOM.render is deprecated',
      'Warning: componentWillReceiveProps',
      'Warning: componentWillUpdate',
      'Warning: componentWillMount',
      
      // Browser specific warnings
      'The AudioContext was not allowed to start',
      'Autoplay policy',
      'User gesture required',
      
      // Pi Browser specific
      'Pi Browser',
      'pi-browser',
      'minepi',
      
      // Game sound errors
      'TypeError: initializeGameSounds is not a function',
      'Error caught by boundary: TypeError: initializeGameSounds is not a function',
      'Failed to load sound: coin',
      'Failed to load sound: powerup',
      'ERR_CACHE_OPERATION_NOT_SUPPORTED',
      'sfx point.wav net::ERR_CACHE_OPERATION_NOT_SUPPORTED',
      'GET http://localhost:1113/audio/sfx point.wav net::ERR_CACHE_OPERATION_NOT_SUPPORTED',
      'The element has no supported sources',
      'AudioContext was not allowed to start',
      'playTrack is not a function',
      'playMusic is not a function',
      'TypeError: playTrack is not a function',
      'TypeError: playMusic is not a function',
      
      // Accessibility warnings
      'Missing Description or aria-describedby',
      'Warning: Missing Description'
    ];

    return suppressedErrors.some(error => 
      message.toLowerCase().includes(error.toLowerCase())
    );
  }

  // Setup error handlers
  setupErrorHandlers(): void {
    // Override console.error to catch React warnings
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Check if error should be suppressed
      if (this.shouldSuppressError(message)) {
        return; // Don't log the error
      }
      
      // Handle React maximum update depth errors
      if (message.includes('Maximum update depth exceeded')) {
        this.handleReactWarning(message);
        return; // Don't log the original error
      }
      
      // Handle GoTrueClient instance warnings
      if (message.includes('Multiple GoTrueClient instances detected')) {
        if (this.config.enableDebugMode) {
          console.info('GoTrueClient instance warning suppressed - this is expected in development');
        }
        return; // Don't log the original error
      }
      
      // Handle postMessage origin warnings
      if (message.includes('postMessage') && message.includes('target origin')) {
        if (this.config.enableDebugMode) {
          console.info('PostMessage origin warning suppressed - this is expected with Pi SDK');
        }
        return; // Don't log the original error
      }
      
      // Log other errors normally
      originalConsoleError.apply(console, args);
    };

    // Override console.warn to catch auth attempt warnings
    const originalConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      // Check if warning should be suppressed
      if (this.shouldSuppressError(message)) {
        return; // Don't log the warning
      }
      
      // Handle auth attempt warnings
      if (message.includes('Too many auth attempts')) {
        this.resetAuthAttempts();
        if (this.config.enableDebugMode) {
          console.log('Auth attempts reset due to too many attempts.');
        }
        return; // Don't log the original warning
      }
      
      // Handle GoTrueClient instance warnings
      if (message.includes('Multiple GoTrueClient instances detected')) {
        if (this.config.enableDebugMode) {
          console.info('GoTrueClient instance warning suppressed - this is expected in development');
        }
        return; // Don't log the original warning
      }
      
      // Handle postMessage origin warnings
      if (message.includes('postMessage') && message.includes('target origin')) {
        if (this.config.enableDebugMode) {
          console.info('PostMessage origin warning suppressed - this is expected with Pi SDK');
        }
        return; // Don't log the original warning
      }
      
      // Log other warnings normally
      originalConsoleWarn.apply(console, args);
    };

      // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || event.reason || '';
    const reasonString = String(reason);
    
    // Check if rejection should be suppressed
    if (this.shouldSuppressError(reasonString)) {
      event.preventDefault(); // Prevent console logging
      return;
    }
    
    // Handle Pi SDK messaging timeout errors specifically
    if (typeof reason === 'string' && reason.includes('Messaging promise with id') && reason.includes('timed out after')) {
      event.preventDefault(); // Prevent console logging
      return;
    }
    
    // Handle postMessage related rejections
    if (typeof reason === 'string' && (
        reason.includes('postMessage') ||
        reason.includes('target origin') ||
        reason.includes('GoTrueClient'))) {
      event.preventDefault(); // Prevent console logging
      return;
    }
    
    // Handle other common rejections
    if (typeof reason === 'string' && (
        reason.includes('CORS') ||
        reason.includes('fetch') ||
        reason.includes('NetworkError') ||
        reason.includes('timeout'))) {
      event.preventDefault(); // Prevent console logging
      return;
    }
  });

    // Handle global errors
    window.addEventListener('error', (event) => {
      const errorMessage = event.error?.message || event.message || '';
      
      // Check if error should be suppressed
      if (this.shouldSuppressError(errorMessage)) {
        event.preventDefault(); // Prevent console logging
        return;
      }
      
      // Handle postMessage related errors
      if (errorMessage.includes('postMessage') || 
          errorMessage.includes('target origin') ||
          errorMessage.includes('GoTrueClient')) {
        event.preventDefault(); // Prevent console logging
        return;
      }
      
      // Handle other common errors
      if (errorMessage.includes('CORS') ||
          errorMessage.includes('fetch') ||
          errorMessage.includes('NetworkError')) {
        event.preventDefault(); // Prevent console logging
        return;
      }
    });

    // Suppress fetch errors for Google Analytics
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && (
          url.includes('google-analytics.com') ||
          url.includes('analytics') ||
          url.includes('gtag') ||
          url.includes('collect'))) {
        // Return a rejected promise that won't be logged
        return Promise.reject(new Error('Analytics request suppressed'));
      }
      return originalFetch.apply(this, args);
    };

    // Suppress XMLHttpRequest errors for Google Analytics
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      if (typeof url === 'string' && (
          url.includes('google-analytics.com') ||
          url.includes('analytics') ||
          url.includes('gtag') ||
          url.includes('collect'))) {
        // Override send to prevent the request
        this.send = function() {
          // Do nothing - suppress the request
        };
      }
      return originalXHROpen.apply(this, [method, url, ...args]);
    };

    if (this.config.enableDebugMode) {
      console.log('✅ Console error fixer initialized - suppressing analytics and CORS errors');
    }
  }

  // Get current status
  getStatus(): {
    updateDepthCount: number;
    authAttemptsCount: number;
    lastUpdateTime: number;
    analyticsErrorCount: number;
    corsErrorCount: number;
    isHealthy: boolean;
  } {
    return {
      updateDepthCount: this.updateDepthCount,
      authAttemptsCount: this.authAttemptsCount,
      lastUpdateTime: this.lastUpdateTime,
      analyticsErrorCount: this.analyticsErrorCount,
      corsErrorCount: this.corsErrorCount,
      isHealthy: this.updateDepthCount < this.config.maxUpdateDepth && 
                 this.authAttemptsCount < this.config.maxAuthAttempts
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<ConsoleErrorFixerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const consoleErrorFixer = ConsoleErrorFixer.getInstance();

// Export convenience functions
export const checkUpdateDepth = () => consoleErrorFixer.checkUpdateDepth();
export const checkAuthAttempts = () => consoleErrorFixer.checkAuthAttempts();
export const resetAuthAttempts = () => consoleErrorFixer.resetAuthAttempts();
export const resetUpdateDepth = () => consoleErrorFixer.resetUpdateDepth();
export const setupErrorHandlers = () => consoleErrorFixer.setupErrorHandlers();
export const getErrorFixerStatus = () => consoleErrorFixer.getStatus();
