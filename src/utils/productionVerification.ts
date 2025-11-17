// Production Verification Utility
// Ensures Flappy Pi is configured for PRODUCTION MAINNET ONLY
// NO TESTNET - NO SANDBOX - PRODUCTION ONLY

import { PI_CONFIG } from '@/config/piConfig';
import { MAINNET_CONFIG } from '@/config/mainnetConfig';

export interface ProductionVerificationResult {
  isProduction: boolean;
  isMainnet: boolean;
  isSandbox: boolean;
  isTestnet: boolean;
  networkMode: string;
  appId: string;
  apiUrl: string;
  subdomain: string;
  sdkConfig: any;
  errors: string[];
  warnings: string[];
  status: 'PRODUCTION_READY' | 'NEEDS_FIXES' | 'TESTNET_DETECTED';
}

/**
 * Verify that Flappy Pi is configured for PRODUCTION MAINNET ONLY
 */
export const verifyProductionConfiguration = (): ProductionVerificationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check PI_CONFIG
  if (PI_CONFIG.SANDBOX_MODE) {
    errors.push('❌ PI_CONFIG: SANDBOX_MODE is true - should be false for production');
  }
  
  if (!PI_CONFIG.MAINNET_MODE) {
    errors.push('❌ PI_CONFIG: MAINNET_MODE is false - should be true for production');
  }
  
  if (!PI_CONFIG.IS_PRODUCTION) {
    errors.push('❌ PI_CONFIG: IS_PRODUCTION is false - should be true for production');
  }
  
  if (PI_CONFIG.NETWORK_MODE !== 'mainnet') {
    errors.push(`❌ PI_CONFIG: NETWORK_MODE is "${PI_CONFIG.NETWORK_MODE}" - should be "mainnet"`);
  }
  
  if (PI_CONFIG.SDK_CONFIG.sandbox) {
    errors.push('❌ PI_CONFIG: SDK_CONFIG.sandbox is true - should be false for production');
  }
  
  if (PI_CONFIG.API_URL !== 'https://api.minepi.com/v2') {
    errors.push(`❌ PI_CONFIG: API_URL is "${PI_CONFIG.API_URL}" - should be "https://api.minepi.com/v2"`);
  }
  
  // Check MAINNET_CONFIG
  if (MAINNET_CONFIG.SANDBOX_ENABLED) {
    errors.push('❌ MAINNET_CONFIG: SANDBOX_ENABLED is true - should be false for production');
  }
  
  if (!MAINNET_CONFIG.MAINNET_ENABLED) {
    errors.push('❌ MAINNET_CONFIG: MAINNET_ENABLED is false - should be true for production');
  }
  
  if (!MAINNET_CONFIG.IS_PRODUCTION) {
    errors.push('❌ MAINNET_CONFIG: IS_PRODUCTION is false - should be true for production');
  }
  
  if (MAINNET_CONFIG.NETWORK_MODE !== 'mainnet') {
    errors.push(`❌ MAINNET_CONFIG: NETWORK_MODE is "${MAINNET_CONFIG.NETWORK_MODE}" - should be "mainnet"`);
  }
  
  if (MAINNET_CONFIG.SDK_CONFIG.sandbox) {
    errors.push('❌ MAINNET_CONFIG: SDK_CONFIG.sandbox is true - should be false for production');
  }
  
  if (MAINNET_CONFIG.API_URL !== 'https://api.minepi.com/v2') {
    errors.push(`❌ MAINNET_CONFIG: API_URL is "${MAINNET_CONFIG.API_URL}" - should be "https://api.minepi.com/v2"`);
  }
  
  // Check App ID
  if (PI_CONFIG.APP_ID !== 'flappypi2807') {
    errors.push(`❌ PI_CONFIG: APP_ID is "${PI_CONFIG.APP_ID}" - should be "flappypi2807"`);
  }
  
  if (MAINNET_CONFIG.APP_ID !== 'flappypi2807') {
    errors.push(`❌ MAINNET_CONFIG: APP_ID is "${MAINNET_CONFIG.APP_ID}" - should be "flappypi2807"`);
  }
  
  // Check Subdomain
  if (PI_CONFIG.SUBDOMAIN !== 'flappypi2807.pinet.com') {
    errors.push(`❌ PI_CONFIG: SUBDOMAIN is "${PI_CONFIG.SUBDOMAIN}" - should be "flappypi2807.pinet.com"`);
  }
  
  if (MAINNET_CONFIG.SUBDOMAIN !== 'flappypi2807.pinet.com') {
    errors.push(`❌ MAINNET_CONFIG: SUBDOMAIN is "${MAINNET_CONFIG.SUBDOMAIN}" - should be "flappypi2807.pinet.com"`);
  }
  
  // Check for testnet indicators
  const testnetIndicators = [
    'testnet',
    'sandbox',
    'dev',
    'staging',
    'beta'
  ];
  
  const configString = JSON.stringify({ PI_CONFIG, MAINNET_CONFIG }).toLowerCase();
  
  testnetIndicators.forEach(indicator => {
    if (configString.includes(indicator)) {
      warnings.push(`⚠️ Found potential testnet indicator: "${indicator}"`);
    }
  });
  
  // Determine status
  let status: 'PRODUCTION_READY' | 'NEEDS_FIXES' | 'TESTNET_DETECTED';
  
  if (errors.length > 0) {
    status = 'NEEDS_FIXES';
  } else if (warnings.length > 0) {
    status = 'TESTNET_DETECTED';
  } else {
    status = 'PRODUCTION_READY';
  }
  
  const result: ProductionVerificationResult = {
    isProduction: PI_CONFIG.IS_PRODUCTION && MAINNET_CONFIG.IS_PRODUCTION,
    isMainnet: PI_CONFIG.MAINNET_MODE && MAINNET_CONFIG.MAINNET_ENABLED,
    isSandbox: PI_CONFIG.SANDBOX_MODE || MAINNET_CONFIG.SANDBOX_ENABLED,
    isTestnet: PI_CONFIG.NETWORK_MODE === 'testnet' || MAINNET_CONFIG.NETWORK_MODE === 'testnet',
    networkMode: PI_CONFIG.NETWORK_MODE,
    appId: PI_CONFIG.APP_ID,
    apiUrl: PI_CONFIG.getApiUrl(),
    subdomain: PI_CONFIG.SUBDOMAIN,
    sdkConfig: PI_CONFIG.getSdkConfig(),
    errors,
    warnings,
    status
  };
  
  return result;
};

/**
 * Log production verification results
 */
export const logProductionVerification = (): void => {
  console.log('🔍 Verifying Flappy Pi Production Configuration...');
  console.log('================================================');
  
  const result = verifyProductionConfiguration();
  
  console.log(`📊 Status: ${result.status}`);
  console.log(`🏭 Production: ${result.isProduction ? '✅ YES' : '❌ NO'}`);
  console.log(`🌐 Mainnet: ${result.isMainnet ? '✅ YES' : '❌ NO'}`);
  console.log(`🧪 Sandbox: ${result.isSandbox ? '❌ YES' : '✅ NO'}`);
  console.log(`🧪 Testnet: ${result.isTestnet ? '❌ YES' : '✅ NO'}`);
  console.log(`🔗 Network Mode: ${result.networkMode}`);
  console.log(`🆔 App ID: ${result.appId}`);
  console.log(`🌍 API URL: ${result.apiUrl}`);
  console.log(`🔗 Subdomain: ${result.subdomain}`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    result.errors.forEach(error => console.log(`  ${error}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    result.warnings.forEach(warning => console.log(`  ${warning}`));
  }
  
  if (result.status === 'PRODUCTION_READY') {
    console.log('\n🎉 PRODUCTION READY!');
    console.log('✅ Flappy Pi is configured for PRODUCTION MAINNET ONLY');
    console.log('✅ No testnet or sandbox access');
    console.log('✅ Ready for real users on Pi Network mainnet');
  } else if (result.status === 'NEEDS_FIXES') {
    console.log('\n🔧 NEEDS FIXES:');
    console.log('❌ Configuration issues must be resolved before production');
  } else {
    console.log('\n⚠️ TESTNET DETECTED:');
    console.log('⚠️ Potential testnet indicators found - review configuration');
  }
  
  console.log('================================================');
};

/**
 * Get production configuration summary
 */
export const getProductionSummary = () => {
  return {
    production: {
      isProduction: PI_CONFIG.IS_PRODUCTION,
      isMainnet: PI_CONFIG.MAINNET_MODE,
      isSandbox: PI_CONFIG.SANDBOX_MODE,
      networkMode: PI_CONFIG.NETWORK_MODE
    },
    app: {
      appId: PI_CONFIG.APP_ID,
      subdomain: PI_CONFIG.SUBDOMAIN,
      baseUrl: PI_CONFIG.BASE_URL
    },
    api: {
      apiUrl: PI_CONFIG.getApiUrl(),
      apiKey: PI_CONFIG.getApiKey().substring(0, 20) + '...',
      validationKey: PI_CONFIG.getValidationKey().substring(0, 20) + '...'
    },
    sdk: {
      version: PI_CONFIG.SDK_CONFIG.version,
      sandbox: PI_CONFIG.SDK_CONFIG.sandbox,
      validationKey: PI_CONFIG.SDK_CONFIG.validationKey.substring(0, 20) + '...'
    }
  };
};

/**
 * Force production mode (emergency function)
 */
export const forceProductionMode = (): void => {
  console.log('🚨 FORCING PRODUCTION MODE...');
  
  // This function can be called to ensure production mode
  // It logs the current configuration and warns if not production
  
  const result = verifyProductionConfiguration();
  
  if (result.status !== 'PRODUCTION_READY') {
    console.error('🚨 WARNING: Flappy Pi is NOT in production mode!');
    console.error('🚨 Please fix configuration issues before deployment');
    console.error('🚨 Current status:', result.status);
    
    if (result.errors.length > 0) {
      console.error('🚨 Errors:', result.errors);
    }
  } else {
    console.log('✅ Flappy Pi is in PRODUCTION MODE');
    console.log('✅ Ready for mainnet deployment');
  }
};

// Auto-verify on import
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    logProductionVerification();
  }, 1000);
}

export default {
  verifyProductionConfiguration,
  logProductionVerification,
  getProductionSummary,
  forceProductionMode
};
