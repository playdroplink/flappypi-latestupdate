// Pi SDK Integration Verifier
// Comprehensive verification of all Pi Network integrations

export interface PiIntegrationStatus {
  sdk: {
    available: boolean;
    initialized: boolean;
    version: string;
  };
  authentication: {
    available: boolean;
    scopes: string[];
    userInfo: any;
  };
  payment: {
    available: boolean;
    testnet: boolean;
    mainnet: boolean;
  };
  ads: {
    available: boolean;
    interstitial: boolean;
    rewarded: boolean;
    banner: boolean;
  };
  nativeFeatures: {
    available: boolean;
    features: string[];
  };
  browser: {
    isPiBrowser: boolean;
    isMobile: boolean;
    userAgent: string;
  };
  overall: {
    status: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
    issues: string[];
  };
}

class PiIntegrationVerifier {
  private status: PiIntegrationStatus = {
    sdk: { available: false, initialized: false, version: '' },
    authentication: { available: false, scopes: [], userInfo: null },
    payment: { available: false, testnet: false, mainnet: false },
    ads: { available: false, interstitial: false, rewarded: false, banner: false },
    nativeFeatures: { available: false, features: [] },
    browser: { isPiBrowser: false, isMobile: false, userAgent: '' },
    overall: { status: 'poor', score: 0, issues: [] }
  };

  /**
   * Verify Pi SDK availability and initialization
   */
  async verifySDK(): Promise<void> {
    try {
      // Check if Pi SDK is available
      if (typeof window === 'undefined') {
        this.status.sdk.available = false;
        this.status.overall.issues.push('Window not available (SSR)');
        return;
      }

      if (!window.Pi) {
        this.status.sdk.available = false;
        this.status.overall.issues.push('Pi SDK not loaded');
        return;
      }

      this.status.sdk.available = true;

      // Check SDK functions
      const hasInit = typeof window.Pi.init === 'function';
      const hasAuthenticate = typeof window.Pi.authenticate === 'function';
      const hasCreatePayment = typeof window.Pi.createPayment === 'function';
      const hasNativeFeatures = typeof window.Pi.nativeFeaturesList === 'function';

      if (!hasInit || !hasAuthenticate || !hasCreatePayment || !hasNativeFeatures) {
        this.status.overall.issues.push('Pi SDK functions missing');
        return;
      }

      // Try to initialize SDK
      try {
        await window.Pi.init({ version: "2.0" });
        this.status.sdk.initialized = true;
        this.status.sdk.version = "2.0";
      } catch (error) {
        console.warn('Pi SDK init failed (may be expected in non-Pi environment):', error);
        this.status.overall.issues.push('Pi SDK initialization failed');
      }
    } catch (error) {
      this.status.overall.issues.push(`SDK verification error: ${error.message}`);
    }
  }

  /**
   * Verify Pi Authentication
   */
  async verifyAuthentication(): Promise<void> {
    try {
      if (!this.status.sdk.available) {
        this.status.overall.issues.push('Authentication not available - SDK not loaded');
        return;
      }

      this.status.authentication.available = true;
      this.status.authentication.scopes = ['payments', 'username'];

      // Note: We don't actually authenticate here to avoid prompting user
      // Just verify the function is available
      if (typeof window.Pi.authenticate === 'function') {
        console.log('✅ Pi Authentication available');
      } else {
        this.status.overall.issues.push('Pi.authenticate function not available');
      }
    } catch (error) {
      this.status.overall.issues.push(`Authentication verification error: ${error.message}`);
    }
  }

  /**
   * Verify Pi Payment functionality
   */
  async verifyPayment(): Promise<void> {
    try {
      if (!this.status.sdk.available) {
        this.status.overall.issues.push('Payment not available - SDK not loaded');
        return;
      }

      this.status.payment.available = true;

      // Check payment functions
      if (typeof window.Pi.createPayment === 'function') {
        console.log('✅ Pi Payment available');
      } else {
        this.status.overall.issues.push('Pi.createPayment function not available');
      }

      // Check for testnet/mainnet indicators
      const userAgent = navigator.userAgent.toLowerCase();
      this.status.payment.testnet = userAgent.includes('testnet') || userAgent.includes('sandbox');
      this.status.payment.mainnet = !this.status.payment.testnet;
    } catch (error) {
      this.status.overall.issues.push(`Payment verification error: ${error.message}`);
    }
  }

  /**
   * Verify Pi Ads functionality
   */
  async verifyAds(): Promise<void> {
    try {
      if (!this.status.sdk.available) {
        this.status.overall.issues.push('Ads not available - SDK not loaded');
        return;
      }

      if (!window.Pi.Ads) {
        this.status.overall.issues.push('Pi.Ads not available');
        return;
      }

      this.status.ads.available = true;

      // Check native features for ad support
      try {
        const nativeFeatures = await window.Pi.nativeFeaturesList();
        const adNetworkSupported = nativeFeatures.includes('ad_network');
        // Banner ads removed from application

        if (adNetworkSupported) {
          this.status.ads.interstitial = true;
          this.status.ads.rewarded = true;
        } else {
          this.status.overall.issues.push('Ad network not supported on this device');
        }

        // Banner ads removed from application
      } catch (error) {
        this.status.overall.issues.push(`Ads verification error: ${error.message}`);
      }
    } catch (error) {
      this.status.overall.issues.push(`Ads verification error: ${error.message}`);
    }
  }

  /**
   * Verify Pi Native Features
   */
  async verifyNativeFeatures(): Promise<void> {
    try {
      if (!this.status.sdk.available) {
        this.status.overall.issues.push('Native features not available - SDK not loaded');
        return;
      }

      if (typeof window.Pi.nativeFeaturesList !== 'function') {
        this.status.overall.issues.push('Pi.nativeFeaturesList function not available');
        return;
      }

      this.status.nativeFeatures.available = true;

      try {
        const features = await window.Pi.nativeFeaturesList();
        this.status.nativeFeatures.features = features;
        console.log('✅ Pi Native Features available:', features);
      } catch (error) {
        this.status.overall.issues.push(`Native features verification error: ${error.message}`);
      }
    } catch (error) {
      this.status.overall.issues.push(`Native features verification error: ${error.message}`);
    }
  }

  /**
   * Verify Browser Environment
   */
  verifyBrowser(): void {
    try {
      const userAgent = navigator.userAgent.toLowerCase();
      
      this.status.browser.userAgent = navigator.userAgent;
      this.status.browser.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Check for Pi Browser indicators
      const isPiBrowserUA = userAgent.includes('pi browser') || 
                           userAgent.includes('pibrowser') ||
                           userAgent.includes('pi-browser');

      if (isPiBrowserUA) {
        this.status.browser.isPiBrowser = true;
      } else if (this.status.sdk.available && typeof window.Pi.nativeFeaturesList === 'function') {
        // If Pi SDK is available, assume it's Pi Browser
        this.status.browser.isPiBrowser = true;
      }

      if (!this.status.browser.isPiBrowser) {
        this.status.overall.issues.push('Not running in Pi Browser');
      }

      if (!this.status.browser.isMobile) {
        this.status.overall.issues.push('Not running on mobile device');
      }
    } catch (error) {
      this.status.overall.issues.push(`Browser verification error: ${error.message}`);
    }
  }

  /**
   * Calculate overall status
   */
  calculateOverallStatus(): void {
    let score = 0;
    const maxScore = 100;

    // SDK (20 points)
    if (this.status.sdk.available) score += 10;
    if (this.status.sdk.initialized) score += 10;

    // Authentication (20 points)
    if (this.status.authentication.available) score += 20;

    // Payment (20 points)
    if (this.status.payment.available) score += 20;

    // Ads (20 points)
    if (this.status.ads.available) score += 10;
    if (this.status.ads.interstitial || this.status.ads.rewarded) score += 10;

    // Native Features (10 points)
    if (this.status.nativeFeatures.available) score += 10;

    // Browser (10 points)
    if (this.status.browser.isPiBrowser) score += 5;
    if (this.status.browser.isMobile) score += 5;

    this.status.overall.score = score;

    // Determine status
    if (score >= 90) {
      this.status.overall.status = 'excellent';
    } else if (score >= 70) {
      this.status.overall.status = 'good';
    } else if (score >= 50) {
      this.status.overall.status = 'fair';
    } else {
      this.status.overall.status = 'poor';
    }
  }

  /**
   * Run complete verification
   */
  async runCompleteVerification(): Promise<PiIntegrationStatus> {
    console.log('🔍 Starting Pi SDK Integration Verification...');

    // Reset status
    this.status = {
      sdk: { available: false, initialized: false, version: '' },
      authentication: { available: false, scopes: [], userInfo: null },
      payment: { available: false, testnet: false, mainnet: false },
      ads: { available: false, interstitial: false, rewarded: false, banner: false },
      nativeFeatures: { available: false, features: [] },
      browser: { isPiBrowser: false, isMobile: false, userAgent: '' },
      overall: { status: 'poor', score: 0, issues: [] }
    };

    // Run all verifications
    await Promise.all([
      this.verifySDK(),
      this.verifyAuthentication(),
      this.verifyPayment(),
      this.verifyAds(),
      this.verifyNativeFeatures()
    ]);

    this.verifyBrowser();
    this.calculateOverallStatus();

    console.log('📊 Pi SDK Integration Verification Results:', this.status);
    return this.status;
  }

  /**
   * Get verification report
   */
  getVerificationReport(): string {
    const status = this.status;
    let report = '📋 Pi SDK Integration Verification Report\n\n';

    // SDK Status
    report += `🔧 SDK Status:\n`;
    report += `  Available: ${status.sdk.available ? '✅ Yes' : '❌ No'}\n`;
    report += `  Initialized: ${status.sdk.initialized ? '✅ Yes' : '❌ No'}\n`;
    report += `  Version: ${status.sdk.version || 'Unknown'}\n\n`;

    // Authentication Status
    report += `🔐 Authentication Status:\n`;
    report += `  Available: ${status.authentication.available ? '✅ Yes' : '❌ No'}\n`;
    report += `  Scopes: ${status.authentication.scopes.join(', ')}\n\n`;

    // Payment Status
    report += `💰 Payment Status:\n`;
    report += `  Available: ${status.payment.available ? '✅ Yes' : '❌ No'}\n`;
    report += `  Testnet: ${status.payment.testnet ? '✅ Yes' : '❌ No'}\n`;
    report += `  Mainnet: ${status.payment.mainnet ? '✅ Yes' : '❌ No'}\n\n`;

    // Ads Status
    report += `📺 Ads Status:\n`;
    report += `  Available: ${status.ads.available ? '✅ Yes' : '❌ No'}\n`;
    report += `  Interstitial: ${status.ads.interstitial ? '✅ Yes' : '❌ No'}\n`;
    report += `  Rewarded: ${status.ads.rewarded ? '✅ Yes' : '❌ No'}\n`;
    report += `  Banner: Removed from application\n\n`;

    // Native Features Status
    report += `⚡ Native Features Status:\n`;
    report += `  Available: ${status.nativeFeatures.available ? '✅ Yes' : '❌ No'}\n`;
    report += `  Features: ${status.nativeFeatures.features.join(', ') || 'None'}\n\n`;

    // Browser Status
    report += `🌐 Browser Status:\n`;
    report += `  Pi Browser: ${status.browser.isPiBrowser ? '✅ Yes' : '❌ No'}\n`;
    report += `  Mobile: ${status.browser.isMobile ? '✅ Yes' : '❌ No'}\n`;
    report += `  User Agent: ${status.browser.userAgent.substring(0, 80)}...\n\n`;

    // Overall Status
    report += `📊 Overall Status:\n`;
    report += `  Status: ${status.overall.status.toUpperCase()}\n`;
    report += `  Score: ${status.overall.score}/100\n`;
    
    if (status.overall.issues.length > 0) {
      report += `  Issues:\n`;
      status.overall.issues.forEach(issue => {
        report += `    • ${issue}\n`;
      });
    }

    return report;
  }
}

// Export singleton instance
export const piIntegrationVerifier = new PiIntegrationVerifier();

// Export verification functions
export const verifyPiIntegration = {
  complete: () => piIntegrationVerifier.runCompleteVerification(),
  report: () => piIntegrationVerifier.getVerificationReport(),
  status: () => piIntegrationVerifier.status
}; 