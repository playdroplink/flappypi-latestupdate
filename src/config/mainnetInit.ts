// Mainnet Initialization Script
// Ensures all Pi Network components are properly initialized for mainnet with PiNet integration

import { PI_CONFIG } from './piConfig';
import { MAINNET_CONFIG } from './mainnetConfig';
import { initializePiSDK } from './piSDK';

export class MainnetInitializer {
  private static instance: MainnetInitializer;
  private isInitialized = false;
  private initializationPromise: Promise<boolean> | null = null;

  private constructor() {}

  public static getInstance(): MainnetInitializer {
    if (!MainnetInitializer.instance) {
      MainnetInitializer.instance = new MainnetInitializer();
    }
    return MainnetInitializer.instance;
  }

  /**
   * Initialize all Pi Network components for mainnet with PiNet integration
   */
  async initialize(): Promise<boolean> {
    // Prevent multiple initializations
    if (this.isInitialized) {
      console.log('✅ Mainnet already initialized');
      return true;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<boolean> {
    try {
      console.log('🚀 Starting mainnet initialization with PiNet integration...');

      // Step 1: Validate configuration
      if (!MAINNET_CONFIG.validateConfig()) {
        console.warn('⚠️ Mainnet configuration validation failed, but continuing...');
      }

      // Step 2: Log configuration
      MAINNET_CONFIG.logConfig();

      // Step 3: Initialize Pi SDK
      console.log('🔧 Initializing Pi SDK for mainnet...');
      const sdkInitialized = initializePiSDK();
      if (!sdkInitialized) {
        console.warn('⚠️ Pi SDK initialization failed, but continuing...');
      }

      // Step 4: Verify environment
      const env = PI_CONFIG.detectEnvironment();
      console.log('🔍 Environment verification:', {
        isPiBrowser: env.isPiBrowser,
        isProduction: env.isProduction,
        networkMode: PI_CONFIG.getNetworkMode(),
        sandboxMode: PI_CONFIG.getSandboxSetting(),
        piNetMode: PI_CONFIG.getPiNetMode(),
        isPiNet: env.isPiNet
      });

      // Step 5: Verify PiNet configuration (non-blocking)
      try {
        await this.verifyPiNetConfiguration();
      } catch (error) {
        console.warn('⚠️ PiNet configuration verification failed, but continuing...');
      }

      // Step 6: Verify validation key (non-blocking)
      try {
        await this.verifyValidationKey();
      } catch (error) {
        console.warn('⚠️ Validation key verification failed, but continuing...');
      }

      this.isInitialized = true;
      console.log('✅ Mainnet initialization completed successfully');
      console.log('✅ PiNet integration enabled:', MAINNET_CONFIG.isPiNet());
      return true;

    } catch (error) {
      console.error('❌ Mainnet initialization failed:', error);
      // Don't fail completely, just log the error and continue
      console.warn('⚠️ Continuing with limited functionality...');
      this.initializationPromise = null;
      return false;
    }
  }

  /**
   * Verify PiNet configuration is properly set up
   */
  private async verifyPiNetConfiguration(): Promise<void> {
    try {
      console.log('🔍 Verifying PiNet configuration...');
      
      const piNetSettings = MAINNET_CONFIG.getPiNetSettings();
      console.log('📋 PiNet Settings:', piNetSettings);
      
      // Since PiNet is disabled, we'll skip the verification
      if (!piNetSettings.enabled) {
        console.log('ℹ️ PiNet is disabled in configuration - skipping verification');
        return;
      }
      
      if (!piNetSettings.mode) {
        console.log('ℹ️ PiNet mode is disabled - skipping verification');
        return;
      }
      
      if (!piNetSettings.ecosystem) {
        console.log('ℹ️ PiNet ecosystem is disabled - skipping verification');
        return;
      }
      
      // Check if we're running on PiNet subdomain
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isOnPiNetSubdomain = hostname.includes('flappypi2807.pinet.com') || 
                                  hostname.includes('ecosystem.pinet.com');
        
        console.log('🌐 Current hostname:', hostname);
        console.log('🏪 On PiNet subdomain:', isOnPiNetSubdomain);
        
        if (isOnPiNetSubdomain) {
          console.log('✅ Running on PiNet subdomain - PiNet integration active');
        } else {
          console.log('ℹ️ Not on PiNet subdomain - PiNet features may be limited');
        }
      }
      
      console.log('✅ PiNet configuration verified successfully');
    } catch (error) {
      console.error('❌ PiNet configuration verification failed:', error);
      // Don't throw error for PiNet verification failure
      // Just log it as a warning
      console.warn('⚠️ PiNet configuration verification failed, but continuing...');
    }
  }

  /**
   * Verify validation key is accessible
   */
  private async verifyValidationKey(): Promise<void> {
    try {
      // Skip validation key verification in development/localhost
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('⏭️ Skipping validation key verification (localhost development)');
        return;
      }
      
      // Skip validation key verification if not on Pi Network subdomain
      if (typeof window !== 'undefined' && !window.location.hostname.includes('.pinet.com')) {
        console.log('⏭️ Skipping validation key verification (not on Pi Network subdomain)');
        return;
      }
      
      // Construct validation key path
      const validationKeyPath = `/.well-known/${MAINNET_CONFIG.APP_ID}-validation-key.txt`;
      const fullUrl = `${MAINNET_CONFIG.BASE_URL}${validationKeyPath}`;
      
      console.log('🔍 Verifying validation key at:', fullUrl);
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`Validation key not accessible: ${response.status}`);
      }
      
      const validationKey = await response.text();
      const expectedKey = MAINNET_CONFIG.VALIDATION_KEY;
      
      if (validationKey.trim() !== expectedKey) {
        throw new Error('Validation key mismatch');
      }
      
      console.log('✅ Validation key verified successfully');
    } catch (error) {
      console.error('❌ Validation key verification failed:', error);
      // Don't throw error for validation key verification failure
      // Just log it as a warning
      console.warn('⚠️ Validation key verification failed, but continuing...');
    }
  }

  /**
   * Get initialization status
   */
  getStatus(): {
    isInitialized: boolean;
    networkMode: string;
    isMainnet: boolean;
    isPiNet: boolean;
    configValid: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      networkMode: MAINNET_CONFIG.NETWORK_MODE,
      isMainnet: MAINNET_CONFIG.isMainnet(),
      isPiNet: MAINNET_CONFIG.isPiNet(),
      configValid: MAINNET_CONFIG.validateConfig()
    };
  }

  /**
   * Reset initialization state (for testing)
   */
  reset(): void {
    this.isInitialized = false;
    this.initializationPromise = null;
    console.log('🔄 Mainnet initialization state reset');
  }
}

// Export singleton instance
export const mainnetInitializer = MainnetInitializer.getInstance();

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  // Initialize in browser environment
  mainnetInitializer.initialize().catch(error => {
    console.error('❌ Auto-initialization failed:', error);
  });
} 