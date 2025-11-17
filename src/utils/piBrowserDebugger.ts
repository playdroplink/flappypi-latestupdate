// Pi Browser Debugging Utility
export interface DebugInfo {
  environment: string;
  piBrowser: boolean;
  subdomain: boolean;
  ssl: boolean;
  sdkLoaded: boolean;
  iframe: boolean;
  userAgent: string;
  hostname: string;
  protocol: string;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export class PiBrowserDebugger {
  private static instance: PiBrowserDebugger;
  private debugInfo: DebugInfo | null = null;

  static getInstance(): PiBrowserDebugger {
    if (!PiBrowserDebugger.instance) {
      PiBrowserDebugger.instance = new PiBrowserDebugger();
    }
    return PiBrowserDebugger.instance;
  }

  runDiagnostics(): DebugInfo {
    if (this.debugInfo) {
      return this.debugInfo;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Environment detection
    const environment = this.detectEnvironment();
    const piBrowser = this.isPiBrowser();
    const subdomain = this.isSubdomain();
    const ssl = this.isSSL();
    const sdkLoaded = this.isSDKLoaded();
    const iframe = this.isInIframe();
    const userAgent = navigator.userAgent;
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Check for common issues
    this.checkCommonIssues(errors, warnings, recommendations);

    // Generate recommendations
    this.generateRecommendations(errors, warnings, recommendations);

    this.debugInfo = {
      environment,
      piBrowser,
      subdomain,
      ssl,
      sdkLoaded,
      iframe,
      userAgent,
      hostname,
      protocol,
      errors,
      warnings,
      recommendations
    };

    this.logDiagnostics();
    return this.debugInfo;
  }

  private detectEnvironment(): string {
    if (window.location.hostname.includes('localhost')) {
      return 'development';
    } else if (window.location.hostname.includes('.pinet.com')) {
      return 'pinet-subdomain';
    } else if (window.location.hostname.includes('.minepi.com')) {
      return 'minepi-subdomain';
    } else if (window.location.hostname.includes('flappypi.fun')) {
      return 'custom-domain';
    } else {
      return 'unknown';
    }
  }

  private isPiBrowser(): boolean {
    const userAgent = navigator.userAgent;
    const hostname = window.location.hostname;
    
    // Check for actual Pi Browser app
    const isPiBrowserApp = userAgent.includes('Pi Browser') || 
                          userAgent.includes('PiNetwork') ||
                          userAgent.includes('PiBrowser') ||
                          userAgent.includes('PiApp');
    
    // Check for Pi Network domains
    const isPiNetworkDomain = hostname.includes('.pinet.com') ||
                             hostname.includes('.minepi.com') ||
                             hostname.includes('flappypi2807.pinet.com');
    
    // Check if Pi SDK is available (most reliable indicator)
    const hasPiSDK = typeof window !== 'undefined' && window.Pi;
    
    return isPiBrowserApp || isPiNetworkDomain || hasPiSDK;
  }

  private isSubdomain(): boolean {
    const hostname = window.location.hostname;
    return hostname.includes('.pinet.com') || 
           hostname.includes('.minepi.com') ||
           hostname.includes('.pi.network');
  }

  private isSSL(): boolean {
    return window.location.protocol === 'https:';
  }

  private isSDKLoaded(): boolean {
    return typeof window.Pi !== 'undefined';
  }

  private isInIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true; // Cross-origin iframe
    }
  }

  private checkCommonIssues(errors: string[], warnings: string[], recommendations: string[]): void {
    // Issue 1: CORS problems
    if (this.isSubdomain() && !this.isSSL()) {
      errors.push('Non-HTTPS on subdomain - this will cause CORS issues');
      recommendations.push('Force HTTPS redirect for subdomains');
    }

    // Issue 2: SDK not loaded
    if (this.isPiBrowser() && !this.isSDKLoaded()) {
      errors.push('Pi SDK not loaded in Pi Browser');
      recommendations.push('Check Pi SDK script loading and initialization');
    }

    // Issue 3: iframe restrictions
    if (this.isInIframe()) {
      warnings.push('Running in iframe - some features may be restricted');
      recommendations.push('Check iframe sandbox attributes');
    }

    // Issue 4: Subdomain without proper configuration
    if (this.isSubdomain() && this.isPiBrowser()) {
      warnings.push('Pi Browser on subdomain - applying compatibility mode');
      recommendations.push('Consider hosting on custom domain for better control');
    }

    // Issue 5: Service worker conflicts - Only warn if service worker is actually registered
    if ('serviceWorker' in navigator && this.isPiBrowser()) {
      // Check if there's an active service worker registration
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
          warnings.push('Active service worker detected - may interfere with Pi Browser');
          recommendations.push('Consider unregistering service worker for Pi Browser testing');
        }
      }).catch(() => {
        // Service worker API not accessible, which is fine
      });
    }

    // Issue 6: Cache problems
    if (this.isSubdomain()) {
      warnings.push('Subdomain may have cache issues');
      recommendations.push('Clear browser cache and test');
    }
  }

  private generateRecommendations(errors: string[], warnings: string[], recommendations: string[]): void {
    // Priority recommendations based on issues found
    if (errors.length > 0) {
      recommendations.unshift('Fix critical errors first');
    }

    if (this.isSubdomain()) {
      recommendations.push('Test on custom domain (flappypi.fun) for comparison');
      recommendations.push('Contact Pi Core Team for subdomain verification');
    }

    if (this.isPiBrowser()) {
      recommendations.push('Use Pi Browser developer tools for debugging');
      recommendations.push('Check Pi Browser console for specific errors');
    }

    if (!this.isSSL()) {
      recommendations.push('Enable HTTPS for production deployment - Vite config updated to use HTTPS');
      recommendations.push('Use SSL certificate for secure Pi Browser integration');
    }
  }

  private logDiagnostics(): void {
    if (!this.debugInfo) return;

    console.group('🔍 Pi Browser Diagnostics');
    console.log('Environment:', this.debugInfo.environment);
    console.log('Pi Browser:', this.debugInfo.piBrowser);
    console.log('Subdomain:', this.debugInfo.subdomain);
    console.log('SSL:', this.debugInfo.ssl);
    console.log('SDK Loaded:', this.debugInfo.sdkLoaded);
    console.log('In iframe:', this.debugInfo.iframe);
    console.log('Hostname:', this.debugInfo.hostname);
    console.log('Protocol:', this.debugInfo.protocol);

    if (this.debugInfo.errors.length > 0) {
      console.error('❌ Errors:', this.debugInfo.errors);
    }

    if (this.debugInfo.warnings.length > 0) {
      console.warn('⚠️ Warnings:', this.debugInfo.warnings);
    }

    if (this.debugInfo.recommendations.length > 0) {
      console.info('💡 Recommendations:', this.debugInfo.recommendations);
    }

    console.groupEnd();
  }

  // Generate a comprehensive report
  generateReport(): string {
    const info = this.runDiagnostics();
    
    let report = `
🔍 Pi Browser Diagnostic Report
================================

Environment: ${info.environment}
Pi Browser: ${info.piBrowser ? 'Yes' : 'No'}
Subdomain: ${info.subdomain ? 'Yes' : 'No'}
SSL: ${info.ssl ? 'Yes' : 'No'}
SDK Loaded: ${info.sdkLoaded ? 'Yes' : 'No'}
In iframe: ${info.iframe ? 'Yes' : 'No'}
Hostname: ${info.hostname}
Protocol: ${info.protocol}

`;

    if (info.errors.length > 0) {
      report += `❌ CRITICAL ISSUES:\n`;
      info.errors.forEach(error => {
        report += `  • ${error}\n`;
      });
      report += `\n`;
    }

    if (info.warnings.length > 0) {
      report += `⚠️ WARNINGS:\n`;
      info.warnings.forEach(warning => {
        report += `  • ${warning}\n`;
      });
      report += `\n`;
    }

    if (info.recommendations.length > 0) {
      report += `💡 RECOMMENDATIONS:\n`;
      info.recommendations.forEach(rec => {
        report += `  • ${rec}\n`;
      });
      report += `\n`;
    }

    return report;
  }

  // Test specific functionality
  testPiSDK(): boolean {
    try {
      if (typeof window.Pi === 'undefined') {
        console.error('[PiBrowserDebugger] Pi SDK not available');
        return false;
      }

      // Check if we're in development mode
      const isDevelopment = window.location.hostname.includes('localhost') || 
                           window.location.hostname.includes('127.0.0.1');
      
      // Test basic SDK functionality
      const tests = [
        () => typeof window.Pi.authenticate === 'function',
        () => typeof window.Pi.currentUser === 'object' || window.Pi.currentUser === null,
        () => typeof window.Pi.nativeFeaturesList === 'object',
        () => typeof window.Pi.version === 'string'
      ];

      const results = tests.map(test => {
        try {
          return test();
        } catch (e) {
          console.error('[PiBrowserDebugger] SDK test failed:', e);
          return false;
        }
      });

      const passedTests = results.filter(result => result === true).length;
      const totalTests = tests.length;
      
      // In development mode, be more lenient - only require basic SDK availability
      if (isDevelopment) {
        const basicSDKAvailable = typeof window.Pi === 'object' && window.Pi !== null;
        if (basicSDKAvailable) {
          console.log('[PiBrowserDebugger] Pi SDK available in development mode');
          return true;
        } else {
          console.error('[PiBrowserDebugger] Pi SDK not available in development mode');
          return false;
        }
      }
      
      // In production/Pi Browser, require all tests to pass
      const allPassed = results.every(result => result === true);
      
      if (allPassed) {
        console.log('[PiBrowserDebugger] All Pi SDK tests passed');
      } else {
        console.error('[PiBrowserDebugger] Some Pi SDK tests failed');
        console.log(`[PiBrowserDebugger] Passed: ${passedTests}/${totalTests} tests`);
      }

      return allPassed;
    } catch (error) {
      console.error('[PiBrowserDebugger] Pi SDK test error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const piBrowserDebugger = PiBrowserDebugger.getInstance();

// Export convenience functions
export const runPiBrowserDiagnostics = () => piBrowserDebugger.runDiagnostics();
export const generatePiBrowserReport = () => piBrowserDebugger.generateReport();
export const testPiSDK = () => piBrowserDebugger.testPiSDK(); 