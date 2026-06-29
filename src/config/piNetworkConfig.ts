// Pi Network Payment Integration Configuration
// Based on the comprehensive Pi Network Payment Integration Guide

export const piNetworkConfig = {
  // Pi Network Configuration - MAINNET
  pi: {
    appId: 'flappypi2807',
    apiKey: (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_PI_SERVER_API_KEY) 
      || (typeof process !== 'undefined' && (process as any).env && (process as any).env.REACT_APP_PI_API_KEY)
      || 'zrt9rwcjrdaejytlu72ha0yi2czvljx6geuwphzueaeybqsyboixukixy0cmogmo',
    validationKey: '94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce',
    // Pi Network API Key for server-to-server payment operations
    paymentApiKey: 'z6rbduota3alcwlkm39ubi2c3x10can0ckqpsrvbmas8lbaei3mxvmdyx2dbvzzi',
    environment: 'mainnet',
    sandbox: false,
    mainnet: true,
    testnet: false,
    subscriptionWalletAddress: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ', // Your wallet address
    scopes: ['username', 'payments'],
    redirectUrl: 'https://flappypi2807.pinet.com/auth/pi/callback',
    callbackUrl: 'https://flappypi2807.pinet.com/pi-callback',
    apiUrl: 'https://api.minepi.com/v2',
    networkMode: 'mainnet',
    productionMode: true
  },
  
  // Application Configuration
  app: {
    name: 'Flappy Pi',
    version: '1.0.0',
    baseUrl: 'https://flappypi2807.pinet.com',
    environment: 'mainnet',
    isProduction: true,
    isMainnet: true,
    isSandbox: false
  }
};

export const walletConfig = {
  // Your Pi Network wallet address
  address: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ',
  balance: '0.0', // Will be updated dynamically
  network: 'mainnet',
  isActive: true,
  
  // Payment settings
  minAmount: 0.1, // Minimum payment amount
  maxAmount: 1000, // Maximum payment amount
  currency: 'Pi',
  
  // Fee structure (optional)
  fees: {
    processing: 0, // No processing fees for Pi Network
    network: 0     // No network fees
  }
};

export default piNetworkConfig;