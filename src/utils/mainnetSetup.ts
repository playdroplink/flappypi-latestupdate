// Mainnet Setup Utility
// Complete setup and initialization for Pi Network mainnet integration

import { PI_CONFIG } from '../config/piConfig';
import { piAuth } from '../config/piAuth';
import { piMetadataService } from '../services/piMetadataService';
import { adService } from '../services/adService';
import { mainnetIntegrationTest } from './mainnetIntegrationTest';

declare global {
  interface Window {
    Pi: any;
  }
}

export interface MainnetSetupResult {
  success: boolean;
  message: string;
  details: {
    piSDKInitialized: boolean;
    authenticationReady: boolean;
    paymentsReady: boolean;
    adsReady: boolean;
    metadataReady: boolean;
    environment: string;
    networkMode: string;
  };
  errors?: string[];
  warnings?: string[];
}

class MainnetSetup {
  private static instance: MainnetSetup;
  private isSetupComplete = false;
  private setupErrors: string[] = [];
  private setupWarnings: string[] = [];

  private constructor() {}

  static getInstance(): MainnetSetup {
    if (!MainnetSetup.instance) {
      MainnetSetup.instance = new MainnetSetup();
    }
    return MainnetSetup.instance;
  }

  /**
   * Complete mainnet setup and initialization
   */
  async setupMainnet(): Promise<MainnetSetupResult> {
    console.log('🚀 Starting Pi Network Mainnet Setup...');
    
    this.setupErrors = [];
    this.setupWarnings = [];
    this.isSetupComplete = false;

    try {
      // Step 1: Verify environment
      await this.verifyEnvironment();
      
      // Step 2: Initialize Pi SDK
      const piSDKInitialized = await this.initializePiSDK();
      
      // Step 3: Setup authentication
      const authenticationReady = await this.setupAuthentication();
      
      // Step 4: Setup payments
      const paymentsReady = await this.setupPayments();
      
      // Step 5: Setup ads
      const adsReady = await this.setupAds();
      
      // Step 6: Setup metadata
      const metadataReady = await this.setupMetadata();
      
      // Step 7: Run integration test
      await this.runIntegrationTest();

      this.isSetupComplete = true;

      const result: MainnetSetupResult = {
        success: this.setupErrors.length === 0,
        message: this.setupErrors.length === 0 
          ? 'Mainnet setup completed successfully' 
          : `Mainnet setup completed with ${this.setupErrors.length} errors`,
        details: {
          piSDKInitialized,
          authenticationReady,
          paymentsReady,
          adsReady,
          metadataReady,
          environment: this.getEnvironmentInfo(),
          networkMode: PI_CONFIG.getNetworkMode()
        },
        errors: this.setupErrors.length > 0 ? this.setupErrors : undefined,
        warnings: this.setupWarnings.length > 0 ? this.setupWarnings : undefined
      };

      console.log('🚀 Mainnet Setup Complete:', result);
      return result;

    } catch (error) {
      console.error('❌ Mainnet setup failed:', error);
      this.setupErrors.push(`Setup failed: ${error instanceof Error ? error.message : String(error)}`);
      
      return {
        success: false,
        message: 'Mainnet setup failed',
        details: {
          piSDKInitialized: false,
          authenticationReady: false,
          paymentsReady: false,
          adsReady: false,
          metadataReady: false,
          environment: this.getEnvironmentInfo(),
          networkMode: PI_CONFIG.getNetworkMode()
        },
        errors: this.setupErrors
      };
    }
  }

  /**
   * Verify environment requirements
   */
  private async verifyEnvironment(): Promise<void> {
    console.log('🔍 Verifying environment...');

    // Check if we're in Pi Browser
    const isPiBrowser = this.isPiBrowser();
    if (!isPiBrowser) {
      this.setupWarnings.push('Not running in Pi Browser - some features may not work');
    }

    // Check mainnet configuration
    if (!PI_CONFIG.isMainnet()) {
      this.setupErrors.push('Configuration is not set to mainnet mode');
    }

    if (PI_CONFIG.isSandbox()) {
      this.setupErrors.push('Configuration is still in sandbox mode');
    }

    // Check required configuration
    if (!PI_CONFIG.getAppId()) {
      this.setupErrors.push('App ID is not configured');
    }

    if (!PI_CONFIG.PI_NETWORK_VALIDATION_KEY) {
      this.setupErrors.push('Validation key is not configured');
    }

    console.log('✅ Environment verification complete');
  }

  /**
   * Initialize Pi SDK
   */
  private async initializePiSDK(): Promise<boolean> {
    console.log('🔧 Initializing Pi SDK...');

    try {
      if (!window.Pi) {
        this.setupErrors.push('Pi SDK is not available');
        return false;
      }

      // Initialize with mainnet configuration
      await window.Pi.init({
        version: "2.0",
        sandbox: false, // MAINNET - SANDBOX DISABLED
        network: 'mainnet',
        enablePayments: true,
        enableAds: true,
        enableAuthentication: true,
        validationKey: '94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce'
      });

      console.log('✅ Pi SDK initialized successfully');
      return true;
    } catch (error) {
      const errorMsg = `Pi SDK initialization failed: ${error instanceof Error ? error.message : String(error)}`;
      this.setupErrors.push(errorMsg);
      console.error('❌', errorMsg);
      return false;
    }
  }

  /**
   * Setup authentication
   */
  private async setupAuthentication(): Promise<boolean> {
    console.log('🔐 Setting up authentication...');

    try {
      const initResult = await piAuth.initialize();
      if (!initResult) {
        this.setupErrors.push('Authentication service initialization failed');
        return false;
      }

      console.log('✅ Authentication setup complete');
      return true;
    } catch (error) {
      const errorMsg = `Authentication setup failed: ${error instanceof Error ? error.message : String(error)}`;
      this.setupErrors.push(errorMsg);
      console.error('❌', errorMsg);
      return false;
    }
  }

  /**
   * Setup payments
   */
  private async setupPayments(): Promise<boolean> {
    console.log('💰 Setting up payments...');

    try {
      if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
        this.setupErrors.push('Payment functionality is not available');
        return false;
      }

      if (typeof window.Pi.authenticate !== 'function') {
        this.setupErrors.push('Authentication functionality is not available');
        return false;
      }

      console.log('✅ Payments setup complete');
      return true;
    } catch (error) {
      const errorMsg = `Payments setup failed: ${error instanceof Error ? error.message : String(error)}`;
      this.setupErrors.push(errorMsg);
      console.error('❌', errorMsg);
      return false;
    }
  }

  /**
   * Setup ads
   */
  private async setupAds(): Promise<boolean> {
    console.log('📺 Setting up ads...');

    try {
      const isAdNetworkSupported = await adService.isAdNetworkSupported();
      if (!isAdNetworkSupported) {
        this.setupWarnings.push('Ad network is not supported on this device');
      }

      if (!window.Pi || !window.Pi.Ads) {
        this.setupWarnings.push('Pi Ads API is not available');
      }

      console.log('✅ Ads setup complete');
      return true;
    } catch (error) {
      const errorMsg = `Ads setup failed: ${error instanceof Error ? error.message : String(error)}`;
      this.setupErrors.push(errorMsg);
      console.error('❌', errorMsg);
      return false;
    }
  }

  /**
   * Setup metadata service
   */
  private async setupMetadata(): Promise<boolean> {
    console.log('📊 Setting up metadata service...');

    try {
      const initResult = await piMetadataService.initialize();
      if (!initResult) {
        this.setupWarnings.push('Metadata service initialization failed - continuing without metadata');
      }

      console.log('✅ Metadata setup complete');
      return true;
    } catch (error) {
      const errorMsg = `Metadata setup failed: ${error instanceof Error ? error.message : String(error)}`;
      this.setupWarnings.push(errorMsg);
      console.warn('⚠️', errorMsg);
      return false;
    }
  }

  /**
   * Run integration test
   */
  private async runIntegrationTest(): Promise<void> {
    console.log('🧪 Running integration test...');

    try {
      const testResult = await mainnetIntegrationTest.runFullTest();
      
      if (!testResult.overall) {
        this.setupWarnings.push(`Integration test failed: ${testResult.summary.failed} tests failed`);
      }

      console.log('✅ Integration test complete');
    } catch (error) {
      const errorMsg = `Integration test failed: ${error instanceof Error ? error.message : String(error)}`;
      this.setupWarnings.push(errorMsg);
      console.warn('⚠️', errorMsg);
    }
  }

  /**
   * Check if we're in Pi Browser
   */
  private isPiBrowser(): boolean {
    const userAgent = navigator.userAgent;
    const hostname = window.location.hostname;
    
    return userAgent.includes('Pi Browser') || 
           userAgent.includes('PiNetwork') ||
           userAgent.includes('PiBrowser') ||
           hostname.includes('.pinet.com') ||
           hostname.includes('.minepi.com');
  }

  /**
   * Get environment information
   */
  private getEnvironmentInfo(): string {
    const hostname = window.location.hostname;
    const isPiBrowser = this.isPiBrowser();
    const isMainnet = PI_CONFIG.isMainnet();
    
    if (isPiBrowser && isMainnet) {
      return 'Pi Browser - Mainnet';
    } else if (isPiBrowser) {
      return 'Pi Browser - Testnet';
    } else if (isMainnet) {
      return 'Web Browser - Mainnet';
    } else {
      return 'Web Browser - Testnet';
    }
  }

  /**
   * Get setup status
   */
  getSetupComplete(): boolean {
    return this.isSetupComplete;
  }

  /**
   * Get setup errors
   */
  getSetupErrors(): string[] {
    return [...this.setupErrors];
  }

  /**
   * Get setup warnings
   */
  getSetupWarnings(): string[] {
    return [...this.setupWarnings];
  }

  /**
   * Reset setup state
   */
  resetSetup(): void {
    this.isSetupComplete = false;
    this.setupErrors = [];
    this.setupWarnings = [];
  }
}

// Export singleton instance
export const mainnetSetup = MainnetSetup.getInstance();
export default mainnetSetup;
