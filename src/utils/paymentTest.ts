// Payment System Test Utility
// Tests the Pi payment system to ensure it's working correctly

import { directPaymentService } from '../services/directPaymentService';
import { PI_CONFIG } from '../config/piConfig';
import { walletAddressVerification } from '../services/walletAddressVerification';

export async function testPaymentSystem(): Promise<{
  isWorking: boolean;
  issues: string[];
  configuration: any;
}> {
  const issues: string[] = [];
  let isWorking = true;

  console.log('🧪 Testing Pi Payment System...');

  // Test 1: Check Pi SDK availability
  if (typeof window === 'undefined' || !window.Pi) {
    issues.push('Pi SDK not available - must be run in Pi Browser');
    isWorking = false;
  } else {
    console.log('✅ Pi SDK is available');
  }

  // Test 2: Check configuration
  const config = {
    sandboxMode: PI_CONFIG.PI_SANDBOX_MODE,
    network: PI_CONFIG.PI_NETWORK,
    mainnetMode: PI_CONFIG.MAINNET_MODE,
    production: PI_CONFIG.isProduction(),
    walletAddress: PI_CONFIG.PI_WALLET_ADDRESS
  };

  console.log('🔧 Configuration:', config);

  if (PI_CONFIG.PI_SANDBOX_MODE) {
    issues.push('Sandbox mode is enabled - payments will not be real');
    isWorking = false;
  }

  if (!PI_CONFIG.MAINNET_MODE) {
    issues.push('Mainnet mode is disabled - payments will not be real');
    isWorking = false;
  }

  // Test 3: Check wallet address
  if (!PI_CONFIG.PI_WALLET_ADDRESS || PI_CONFIG.PI_WALLET_ADDRESS === '') {
    issues.push('Wallet address is not configured');
    isWorking = false;
  } else {
    console.log('✅ Wallet address configured:', PI_CONFIG.PI_WALLET_ADDRESS);
  }

  // Test 4: Check wallet verification service
  try {
    const walletVerification = await walletAddressVerification.verifyWalletConfiguration();
    if (!walletVerification.success) {
      issues.push(`Wallet verification failed: ${walletVerification.error}`);
      isWorking = false;
    } else {
      console.log('✅ Wallet verification passed');
    }
  } catch (error) {
    issues.push(`Wallet verification error: ${error}`);
    isWorking = false;
  }

  // Test 5: Check Pi SDK methods
  if (window.Pi) {
    const requiredMethods = ['createPayment', 'authenticate'];
    const missingMethods = requiredMethods.filter(method => typeof window.Pi[method] !== 'function');
    
    if (missingMethods.length > 0) {
      issues.push(`Missing Pi SDK methods: ${missingMethods.join(', ')}`);
      isWorking = false;
    } else {
      console.log('✅ All required Pi SDK methods are available');
    }
  }

  // Test 6: Check payment service
  try {
    if (typeof directPaymentService.processDirectPayment !== 'function') {
      issues.push('Direct payment service is not properly initialized');
      isWorking = false;
    } else {
      console.log('✅ Direct payment service is available');
    }
  } catch (error) {
    issues.push(`Payment service error: ${error}`);
    isWorking = false;
  }

  console.log(`🧪 Payment System Test Results: ${isWorking ? 'PASSED' : 'FAILED'}`);
  if (issues.length > 0) {
    console.log('❌ Issues found:', issues);
  }

  return {
    isWorking,
    issues,
    configuration: config
  };
}

// Auto-run test when imported
if (typeof window !== 'undefined') {
  testPaymentSystem().then(result => {
    if (result.isWorking) {
      console.log('🎉 Payment system is ready for mainnet payments!');
    } else {
      console.log('⚠️ Payment system has issues that need to be fixed:');
      result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
  });
}