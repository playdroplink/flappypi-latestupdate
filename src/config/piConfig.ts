// Demo.pi configuration for Pi payment trigger
export const DEMO_PI_CONFIG = {
  // Frontend app URL and bare domain name
  FRONTEND_URL: 'https://flappypi.fun',
  FRONTEND_DOMAIN_NAME: 'flappypi.fun',
  
  // Backend app URL and bare domain name
  BACKEND_URL: 'https://backend.example.com',
  BACKEND_DOMAIN_NAME: 'backend.example.com',
  
  // Domain validation key from Pi Developer Portal
  DOMAIN_VALIDATION_KEY: '312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156',
  
  // Pi Platform API Key from Pi Developer Portal
  PI_API_KEY: 'htjotdxpfamsvnshw5yspxjtp9psgvqym5fusybgu4ouuiqobtrcupilytu3pg4w',
  
  // Session secret
  SESSION_SECRET: 'abcd1324_TODO',
  
  // MongoDB database connection details
  MONGODB_DATABASE_NAME: 'demoapp',
  MONGODB_USERNAME: 'demoapp',
  MONGODB_PASSWORD: 'abcd1234',
  
  // Docker compose project name
  COMPOSE_PROJECT_NAME: 'flappypi',
  
  // Environment
  ENVIRONMENT: 'production',
  
  // Data directory
  DATA_DIRECTORY: './docker-data',
  
  // Pi Platform API URL - Mainnet
  PLATFORM_API_URL: 'https://api.minepi.com',
  
  // Additional Flappy Pi configuration
  PI_NETWORK_APP_ID: 'flappypi2807',
  PI_NETWORK_API_KEY: 'htjotdxpfamsvnshw5yspxjtp9psgvqym5fusybgu4ouuiqobtrcupilytu3pg4w',
  PI_NETWORK_VALIDATION_KEY: '94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce',
  
  // Pi Network Environment Settings - MAINNET
  PI_SANDBOX_MODE: true,
  PI_NETWORK: 'mainnet',
  VITE_PI_NETWORK: 'mainnet',
  
  // Pi Network API URLs - Mainnet
  PI_API_URL: 'https://api.minepi.com',
  PI_NETWORK_API_URL: 'https://api.minepi.com',
  
  // Pi Network Wallet Configuration - MAINNET
  PI_WALLET_ADDRESS: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ',
  
  
  
  // Environment Settings - MAINNET
  NODE_ENV: 'production',
  FLAPPY_PI_ENV: 'mainnet',
  GAME_ENVIRONMENT: 'mainnet',
  
  // Feature Flags - MAINNET
  ENABLE_ANALYTICS: true,
  ENABLE_LEADERBOARD: true,
  ENABLE_DEBUG: false,
  
  // Server Configuration - PRODUCTION
  PORT: 3009,
  APIKEY: 'rppe8zs82vn2kmksqmkopg1yiqzqxs0vgcmzbo5e6hqc3zfn5qeexzygbjqn3yd3',
  
  // CORS Origins - PRODUCTION
  ALLOWED_ORIGINS: 'https://flappypi.fun,https://flappypi2807.pinet.com,https://*.pinet.com,https://*.minepi.com',
  
  // Pi Network Security - PRODUCTION
  PI_REQUIRE_BROWSER: false,
  PI_REQUIRE_AUTH: false,
  PI_VALIDATE_PAYMENTS: true,
  
  // Debug Settings - MAINNET (Disabled)
  DEBUG_MODE: false,
  FLAPPY_DEBUG: false,
  FLAPPY_PI_DEBUG: false,
  MUSIC_DEBUG: false,
  
  // Audio Settings
  AUDIO_ENABLED: true,
  MUSIC_ENABLED: true,
  SFX_ENABLED: true,
  
  // Game Settings
  GAME_MODE: 'mainnet',
  TESTNET_MODE: false,
  MAINNET_MODE: true,
  SANDBOX_MODE: true,
  
  // Analytics Configuration
  ANALYTICS_ENABLED: true,
  ERROR_TRACKING_ENABLED: true,
  PERFORMANCE_MONITORING_ENABLED: true,
  
  // PiNet Settings - MAINNET PRODUCTION
  PINET_MODE: true,
  PINET_ENABLED: true,
  PINET_ECOSYSTEM: true,
  PINET_SUBDOMAIN: 'flappypi2807.pinet.com',
  PINET_BASE_URL: 'https://minepi.com',
  DOMAIN: 'flappypi.fun',
  
  // MAINNET PRODUCTION SETTINGS
  PRODUCTION_MODE: true,
  LIVE_PAYMENTS: true,
  REAL_PI_TRANSACTIONS: true,
  MAINNET_ONLY: true
};

// Pi payment trigger function for demo.pi
export const createPiPaymentTrigger = (item, quantity = 1) => {
  console.log('🔍 [DEBUG] createPiPaymentTrigger called with:', { item, quantity });
  
  if (!item || !item.piPrice) {
    console.error('❌ [DEBUG] Invalid item for Pi payment:', item);
    return null;
  }
  
  const paymentData = {
    amount: item.piPrice * quantity,
    memo: 'Purchase of ' + item.name + (quantity > 1 ? ' (' + quantity + 'x)' : ''),
    metadata: {
      itemId: item.id,
      itemType: item.type || 'shop-item',
      itemName: item.name,
      quantity: quantity,
      totalPrice: item.piPrice * quantity
    },
    uid: 'demo-user-id' // This would be the actual user ID in production
  };
  
  console.log('🔍 [DEBUG] Payment data created:', paymentData);
  
  return {
    paymentData,
    callbacks: {
      onReadyForServerApproval: async (paymentId) => {
        console.log('🔍 [DEBUG] onReadyForServerApproval called with paymentId:', paymentId);
        // In demo mode, we'll simulate the server approval
        console.log('✅ [DEBUG] Simulating server approval for demo.pi');
        return true;
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        console.log('🔍 [DEBUG] onReadyForServerCompletion called with paymentId:', paymentId, 'txid:', txid);
        // In demo mode, we'll simulate the server completion
        console.log('✅ [DEBUG] Simulating server completion for demo.pi');
        return true;
      },
      onCancel: (paymentId) => {
        console.log('🔍 [DEBUG] Payment cancelled:', paymentId);
      },
      onError: (error, payment) => {
        console.error('❌ [DEBUG] Payment error:', error, payment);
      }
    }
  };
};

// Enhanced Pi payment service for demo.pi
export const demoPiPaymentService = {
  async createPayment(item, quantity = 1) {
    console.log('🔍 [DEBUG] demoPiPaymentService.createPayment called with:', { item, quantity });
    
    const trigger = createPiPaymentTrigger(item, quantity);
    if (!trigger) {
      throw new Error('Failed to create payment trigger');
    }
    
    // In demo mode, simulate the Pi SDK call
    if (typeof window !== 'undefined' && window.Pi) {
      console.log('🔍 [DEBUG] Pi SDK available, creating payment...');
      try {
        window.Pi.createPayment(trigger.paymentData, trigger.callbacks);
        console.log('✅ [DEBUG] Pi payment created successfully');
        return true;
      } catch (error) {
        console.error('❌ [DEBUG] Pi payment creation failed:', error);
        throw error;
      }
    } else {
      console.log('⚠️ [DEBUG] Pi SDK not available, simulating payment...');
      // Simulate payment success for demo
      setTimeout(() => {
        trigger.callbacks.onReadyForServerApproval('demo-payment-id');
        trigger.callbacks.onReadyForServerCompletion('demo-payment-id', 'demo-txid');
      }, 1000);
      return true;
    }
  },
  
  async approvePayment(paymentId) {
    console.log('🔍 [DEBUG] demoPiPaymentService.approvePayment called with:', paymentId);
    // Simulate server approval
    return { success: true, paymentId };
  },
  
  async completePayment(paymentId, txid) {
    console.log('🔍 [DEBUG] demoPiPaymentService.completePayment called with:', { paymentId, txid });
    // Simulate server completion
    return { success: true, paymentId, txid };
  }
};

export default DEMO_PI_CONFIG;

// Export PI_CONFIG for compatibility with methods
export const PI_CONFIG = {
  ...DEMO_PI_CONFIG,
  
  // Environment detection
  detectEnvironment() {
    const isPiBrowser = typeof window !== 'undefined' && window.Pi;
    const isProduction = DEMO_PI_CONFIG.MAINNET_MODE && !DEMO_PI_CONFIG.SANDBOX_MODE;
    const isDevelopment = !isProduction;
    const isSandbox = DEMO_PI_CONFIG.SANDBOX_MODE;
    
    return {
      isPiBrowser,
      isProduction,
      isDevelopment,
      isPiNet: DEMO_PI_CONFIG.PINET_MODE,
      isMainnet: DEMO_PI_CONFIG.MAINNET_MODE,
      isSandbox: isSandbox
    };
  },
  
  // Network mode methods
  getNetworkMode() {
    return DEMO_PI_CONFIG.SANDBOX_MODE ? 'sandbox' : (DEMO_PI_CONFIG.MAINNET_MODE ? 'mainnet' : 'testnet');
  },
  
  getSandboxSetting() {
    return DEMO_PI_CONFIG.SANDBOX_MODE;
  },
  
  isMainnet() {
    return DEMO_PI_CONFIG.MAINNET_MODE;
  },
  
  isTestnet() {
    return !DEMO_PI_CONFIG.MAINNET_MODE;
  },
  
  isSandbox() {
    return DEMO_PI_CONFIG.SANDBOX_MODE;
  },
  
  isProduction() {
    return DEMO_PI_CONFIG.MAINNET_MODE && !DEMO_PI_CONFIG.SANDBOX_MODE;
  },
  
  shouldUseMainnet() {
    return DEMO_PI_CONFIG.MAINNET_MODE;
  },
  
  getPiNetMode() {
    return DEMO_PI_CONFIG.PINET_MODE;
  },
  
  getAppId() {
    return DEMO_PI_CONFIG.PI_NETWORK_APP_ID;
  },
  
  getApiUrl() {
    return DEMO_PI_CONFIG.PI_API_URL;
  }
};