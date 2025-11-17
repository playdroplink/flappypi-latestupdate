// Flappy Pi Pay Configuration
// Main configuration file for Flappy Pi with Flappy Pi Pay integration

export const config = {
  // Flappy Pi Pay Configuration
  flappyPiPay: {
    walletAddress: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ',
    network: 'mainnet',
    status: 'active',
    apiUrl: 'https://api.minepi.com/v2',
    mainnetApiUrl: 'https://api.mainnet.minepi.com'
  },

  // Pi Network Configuration
  pi: {
    appId: 'flappypi2807',
    apiKey: 'htjotdxpfamsvnshw5yspxjtp9psgvqym5fusybgu4ouuiqobtrcupilytu3pg4w',
    validationKey: '94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce',
    network: 'mainnet',
    sandbox: false,
    subscriptionWallet: {
      address: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ',
      network: 'mainnet',
      status: 'active'
    }
  },

  // Application Configuration
  app: {
    name: 'Flappy Pi',
    version: '3.0',
    environment: 'production',
    baseUrl: 'https://flappypi.fun'
  },

  // Payment Configuration
  payments: {
    enabled: true,
    currency: 'PI',
    network: 'mainnet',
    walletAddress: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ',
    supportedPlans: [
      { id: 'basic', name: 'Basic Plan', price: 1.0 },
      { id: 'premium', name: 'Premium Plan', price: 2.0 },
      { id: 'elite', name: 'Elite Plan', price: 5.0 }
    ]
  },

  // API Endpoints
  api: {
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://flappypi2807.pinet.com' 
      : 'http://localhost:3009',
    endpoints: {
      paymentApprove: '/api/pi/approve-payment',
      paymentComplete: '/api/pi/complete-payment',
      walletInfo: 'https://api.mainnet.minepi.com/accounts/GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI'
    }
  }
};

export default config;
