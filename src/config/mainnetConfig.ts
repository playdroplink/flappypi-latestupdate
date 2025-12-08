// Mainnet Configuration for Pi Network
// PRODUCTION MAINNET MODE - PINET ENABLED
// This configuration is used for production mainnet deployment

export const MAINNET_CONFIG = {
  // Network Configuration - FULL MAINNET MODE
  NETWORK_MODE: 'mainnet' as const,
  SANDBOX_ENABLED: false, // MAINNET: SANDBOX DISABLED
  MAINNET_ENABLED: true,  // MAINNET: MAINNET ENABLED
  IS_PRODUCTION: true,    // MAINNET: PRODUCTION FLAG
  
  // PiNet Configuration - ENABLED
  PINET_MODE: true, // PINET INTEGRATION ENABLED
  PINET_ENABLED: true, // PINET FEATURES ENABLED
  PINET_ECOSYSTEM: true, // PINET ECOSYSTEM INTEGRATION ENABLED
  
  // API Configuration - MAINNET
  API_VERSION: '2.0',
  API_URL: 'https://api.minepi.com',
  
  // App Configuration - MAINNET
  APP_ID: 'flappypi2807',
  API_KEY: 'zrt9rwcjrdaejytlu72ha0yi2czvljx6geuwphzueaeybqsyboixukixy0cmogmo',
  VALIDATION_KEY: '94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce',
  
  // SDK Configuration - MAINNET MODE
  SDK_CONFIG: {
    version: "2.0",
    sandbox: false, // MAINNET: Use mainnet SDK
    validationKey: '94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce'
  },
  
  // Subdomain Configuration - MAINNET
  SUBDOMAIN: 'flappypi2807.pinet.com',
  BASE_URL: 'https://minepi.com',
  DOMAIN: 'flappypi.fun',
  
  // CORS Configuration - MAINNET
  CORS_ORIGINS: [
    'https://minepi.com',
    'https://flappypi2807.pinet.com',
    'https://pinet.com',
    'https://ecosystem.pinet.com'
  ],
  
  // Security Configuration - MAINNET
  REQUIRE_PI_BROWSER: true, // MAINNET: PI BROWSER REQUIRED
  REQUIRE_AUTHENTICATION: true, // MAINNET: AUTHENTICATION REQUIRED
  VALIDATE_PAYMENTS: true, // MAINNET: PAYMENT VALIDATION REQUIRED
  
  // Feature Flags - PRODUCTION ENABLED
  ENABLE_PAYMENTS: true,
  ENABLE_AUTHENTICATION: true,
  ENABLE_ADS: true,
  ENABLE_METADATA: true,
  ENABLE_PINET: true, // PINET FEATURES ENABLED
  ENABLE_USERNAME: true, // USERNAME FEATURES ENABLED
  
  // Authentication Scopes - MAINNET
  AUTH_SCOPES: ['payments', 'username'],
  AUTH_SCOPES_PAYMENTS: ['payments'],
  AUTH_SCOPES_USERNAME: ['username'],
  
  // Utility Methods
  getApiUrl(): string {
    return this.API_URL;
  },
  
  getAppId(): string {
    return this.APP_ID;
  },
  
  getApiKey(): string {
    return this.API_KEY;
  },
  
  getValidationKey(): string {
    return this.VALIDATION_KEY;
  },
  
  isMainnet(): boolean {
    return this.MAINNET_ENABLED && !this.SANDBOX_ENABLED;
  },
  
  isSandbox(): boolean {
    return this.SANDBOX_ENABLED;
  },
  
  isProduction(): boolean {
    return this.IS_PRODUCTION;
  },
  
  isPiNet(): boolean {
    return this.PINET_MODE && this.PINET_ENABLED;
  },
  
  isPiNetEcosystem(): boolean {
    return this.PINET_ECOSYSTEM && this.PINET_ENABLED;
  },
  
  getSdkConfig() {
    return this.SDK_CONFIG;
  },
  
  getSubdomain(): string {
    return this.SUBDOMAIN;
  },
  
  getBaseUrl(): string {
    return this.BASE_URL;
  },

  // Authentication Scopes
  getAuthScopes(): string[] {
    return ['payments', 'username', 'roles'];
  },

  // Payment Settings
  getPaymentSettings() {
    return {
      maxRetries: 3,
      timeout: 30000,
      retryDelay: 1000,
      enableServerApproval: true,
      enableServerCompletion: true
    };
  },

  // Ad Network Settings
  getAdNetworkSettings() {
    return {
      enableInterstitial: true,
      enableRewarded: true,
      preloadAds: true,
      maxAdRetries: 3
    };
  },

  // PiNet Settings
  getPiNetSettings() {
    return {
      enabled: this.PINET_ENABLED,
      ecosystem: this.PINET_ECOSYSTEM,
      mode: this.PINET_MODE,
      subdomain: this.SUBDOMAIN,
      baseUrl: this.BASE_URL
    };
  },

  // Configuration Validation
  validateConfig(): boolean {
    try {
      // Check required fields
      if (!this.APP_ID) {
        console.error('❌ APP_ID is missing');
        return false;
      }
      
      if (!this.API_KEY) {
        console.error('❌ API_KEY is missing');
        return false;
      }
      
      if (!this.VALIDATION_KEY) {
        console.error('❌ VALIDATION_KEY is missing');
        return false;
      }
      
      if (!this.API_URL) {
        console.error('❌ API_URL is missing');
        return false;
      }
      
      // Check network mode
      if (this.NETWORK_MODE !== 'mainnet') {
        console.error('❌ NETWORK_MODE should be mainnet');
        return false;
      }
      
      // Check production settings
      if (!this.IS_PRODUCTION) {
        console.error('❌ IS_PRODUCTION should be true for mainnet');
        return false;
      }
      
      if (this.SANDBOX_ENABLED) {
        console.error('❌ SANDBOX_ENABLED should be false for mainnet');
        return false;
      }
      
      if (!this.MAINNET_ENABLED) {
        console.error('❌ MAINNET_ENABLED should be true for mainnet');
        return false;
      }
      
             // Check PiNet settings (only if enabled)
       if (this.PINET_ENABLED && !this.PINET_MODE) {
         console.error('❌ PINET_MODE should be true when PiNet is enabled');
         return false;
       }
      
      console.log('✅ Mainnet configuration validation passed');
      console.log('✅ PiNet mode enabled:', this.PINET_MODE);
      return true;
    } catch (error) {
      console.error('❌ Configuration validation failed:', error);
      return false;
    }
  },

  // Configuration Logging
  logConfig(): void {
    console.log('🔧 Mainnet Configuration:');
    console.log('  Network Mode:', this.NETWORK_MODE);
    console.log('  Production:', this.IS_PRODUCTION);
    console.log('  Mainnet Enabled:', this.MAINNET_ENABLED);
    console.log('  Sandbox Enabled:', this.SANDBOX_ENABLED);
    console.log('  PiNet Mode:', this.PINET_MODE);
    console.log('  PiNet Enabled:', this.PINET_ENABLED);
    console.log('  PiNet Ecosystem:', this.PINET_ECOSYSTEM);
    console.log('  App ID:', this.APP_ID);
    console.log('  API URL:', this.API_URL);
    console.log('  Subdomain:', this.SUBDOMAIN);
    console.log('  Base URL:', this.BASE_URL);
    console.log('  API Key:', this.API_KEY.substring(0, 10) + '...');
    console.log('  Validation Key:', this.VALIDATION_KEY.substring(0, 10) + '...');
  },
  
  // Environment Summary
  getEnvironmentSummary() {
    return {
      isProduction: this.IS_PRODUCTION,
      isMainnet: this.MAINNET_ENABLED,
      isSandbox: this.SANDBOX_ENABLED,
      isPiNet: this.PINET_MODE,
      isPiNetEnabled: this.PINET_ENABLED,
      isPiNetEcosystem: this.PINET_ECOSYSTEM,
      networkMode: this.NETWORK_MODE,
      appId: this.APP_ID,
      subdomain: this.SUBDOMAIN,
      baseUrl: this.BASE_URL,
      apiUrl: this.getApiUrl(),
      sdkConfig: this.getSdkConfig()
    };
  }
};

// Production Environment Check
export const isProductionEnvironment = (): boolean => {
  return MAINNET_CONFIG.IS_PRODUCTION && 
         MAINNET_CONFIG.MAINNET_ENABLED && 
         !MAINNET_CONFIG.SANDBOX_ENABLED;
};

// Development Environment Check
export const isDevelopmentEnvironment = (): boolean => {
  return !MAINNET_CONFIG.IS_PRODUCTION || 
         MAINNET_CONFIG.SANDBOX_ENABLED;
};

// Environment Summary
export const getEnvironmentSummary = () => {
  return MAINNET_CONFIG.getEnvironmentSummary();
};

export default MAINNET_CONFIG; 