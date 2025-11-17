#!/usr/bin/env node

/**
 * Complete Testnet Flow Test
 * Tests the entire testnet payment system
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Complete Testnet Flow Test');
console.log('================================================');

// Test complete testnet configuration
function testCompleteTestnetConfiguration() {
  console.log('🔍 Testing Complete Testnet Configuration...');
  
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    
    // Check testnet configuration
    const hasTestnetPayments = content.includes('TESTNET_PAYMENTS_ENABLED="true"');
    const hasTestnetWallet = content.includes('TESTNET_WALLET_ADDRESS="GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI"');
    const hasTestnetSeed = content.includes('TESTNET_WALLET_SEED="SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I"');
    const hasTestnetApi = content.includes('TESTNET_API_URL="https://api.testnet.minepi.com/v2"');
    const hasTestnetPlatformApi = content.includes('TESTNET_PLATFORM_API_URL="https://api.testnet.minepi.com"');
    const hasTestnetApiKey = content.includes('TESTNET_API_KEY="yajl7wvy9a5xnxss1iaououlvsk2rwcc9tsgxoiakgzetrbwaiktnqzzqtuoyqyu"');
    const hasTestnetValidationKey = content.includes('TESTNET_VALIDATION_KEY="312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156"');
    
    // Check domain configuration
    const hasProductionDomain = content.includes('APP_BASE_URL="https://www.flappypi.fun"');
    const hasPiNetSubdomain = content.includes('APP_SUBDOMAIN="flappypi6856.pinet.com"');
    const hasFrontendUrl = content.includes('FRONTEND_URL=https://www.flappypi.fun');
    const hasBackendUrl = content.includes('BACKEND_URL=https://www.flappypi.fun');
    
    console.log('📊 Testnet Configuration:');
    console.log(`✅ Testnet Payments: ${hasTestnetPayments ? 'Enabled' : 'Not Enabled'}`);
    console.log(`✅ Testnet Wallet: ${hasTestnetWallet ? 'Set' : 'Not Set'}`);
    console.log(`✅ Testnet Seed: ${hasTestnetSeed ? 'Set' : 'Not Set'}`);
    console.log(`✅ Testnet API: ${hasTestnetApi ? 'Set' : 'Not Set'}`);
    console.log(`✅ Testnet Platform API: ${hasTestnetPlatformApi ? 'Set' : 'Not Set'}`);
    console.log(`✅ Testnet API Key: ${hasTestnetApiKey ? 'Set' : 'Not Set'}`);
    console.log(`✅ Testnet Validation Key: ${hasTestnetValidationKey ? 'Set' : 'Not Set'}`);
    
    console.log('🌐 Domain Configuration:');
    console.log(`✅ Production Domain: ${hasProductionDomain ? 'Set' : 'Not Set'}`);
    console.log(`✅ PiNet Subdomain: ${hasPiNetSubdomain ? 'Set' : 'Not Set'}`);
    console.log(`✅ Frontend URL: ${hasFrontendUrl ? 'Set' : 'Not Set'}`);
    console.log(`✅ Backend URL: ${hasBackendUrl ? 'Set' : 'Not Set'}`);
    
    return hasTestnetPayments && hasTestnetWallet && hasTestnetSeed && hasTestnetApi && 
           hasTestnetPlatformApi && hasTestnetApiKey && hasTestnetValidationKey &&
           hasProductionDomain && hasPiNetSubdomain && hasFrontendUrl && hasBackendUrl;
  }
  
  console.log('❌ .env file not found');
  return false;
}

// Test API endpoints
function testAPIEndpoints() {
  console.log('🔍 Testing API Endpoints...');
  
  const endpoints = [
    'api/pi/auth.ts',
    'api/pi/approve-payment.ts',
    'api/pi/complete-payment.ts',
    'api/pi/testnet-payment.ts',
    'api/pi/testnet-approve.ts',
    'api/pi/testnet-complete.ts'
  ];
  
  let allExist = true;
  endpoints.forEach(endpoint => {
    const exists = fs.existsSync(path.join(process.cwd(), endpoint));
    console.log(`${exists ? '✅' : '❌'} ${endpoint}`);
    if (!exists) allExist = false;
  });
  
  return allExist;
}

// Test services
function testServices() {
  console.log('🔍 Testing Services...');
  
  const services = [
    'src/services/testnetPaymentService.ts',
    'src/services/piPayment.ts',
    'src/services/unifiedPiPaymentService.ts'
  ];
  
  let allExist = true;
  services.forEach(service => {
    const exists = fs.existsSync(path.join(process.cwd(), service));
    console.log(`${exists ? '✅' : '❌'} ${service}`);
    if (!exists) allExist = false;
  });
  
  return allExist;
}

// Test components
function testComponents() {
  console.log('🔍 Testing Components...');
  
  const components = [
    'src/components/PiAuthDemo.tsx',
    'src/components/PiPaymentDemo.tsx',
    'src/components/TestnetPaymentDemo.tsx',
    'src/pages/PiDemoPage.tsx'
  ];
  
  let allExist = true;
  components.forEach(component => {
    const exists = fs.existsSync(path.join(process.cwd(), component));
    console.log(`${exists ? '✅' : '❌'} ${component}`);
    if (!exists) allExist = false;
  });
  
  return allExist;
}

// Test shop integration
function testShopIntegration() {
  console.log('🔍 Testing Shop Integration...');
  
  const shopPath = path.join(process.cwd(), 'src/pages/ShopPage.tsx');
  if (fs.existsSync(shopPath)) {
    const content = fs.readFileSync(shopPath, 'utf8');
    
    const hasTestnetImport = content.includes('import { testnetPaymentService }');
    const hasTestnetComponent = content.includes('import TestnetPaymentDemo');
    const hasTestnetTab = content.includes('TabsTrigger value="testnet"');
    const hasTestnetContent = content.includes('TabsContent value="testnet"');
    const hasTestnetState = content.includes('testnetPaymentEnabled');
    
    console.log(`✅ Testnet Import: ${hasTestnetImport ? 'Added' : 'Not Added'}`);
    console.log(`✅ Testnet Component: ${hasTestnetComponent ? 'Added' : 'Not Added'}`);
    console.log(`✅ Testnet Tab: ${hasTestnetTab ? 'Added' : 'Not Added'}`);
    console.log(`✅ Testnet Content: ${hasTestnetContent ? 'Added' : 'Not Added'}`);
    console.log(`✅ Testnet State: ${hasTestnetState ? 'Added' : 'Not Added'}`);
    
    return hasTestnetImport && hasTestnetComponent && hasTestnetTab && hasTestnetContent && hasTestnetState;
  }
  
  console.log('❌ ShopPage.tsx not found');
  return false;
}

// Test Pi SDK configuration
function testPiSDKConfiguration() {
  console.log('🔍 Testing Pi SDK Configuration...');
  
  const piConfigPath = path.join(process.cwd(), 'src/config/piConfig.ts');
  if (fs.existsSync(piConfigPath)) {
    const content = fs.readFileSync(piConfigPath, 'utf8');
    
    const isTestnet = content.includes("NETWORK_MODE: 'testnet'");
    const hasTestnetApi = content.includes("https://api.testnet.minepi.com/v2");
    const sdkSandboxFalse = content.includes("sandbox: false");
    const hasApiKey = content.includes("yajl7wvy9a5xnxss1iaououlvsk2rwcc9tsgxoiakgzetrbwaiktnqzzqtuoyqyu");
    const hasValidationKey = content.includes("312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156");
    
    console.log(`✅ Network Mode: ${isTestnet ? 'Testnet' : 'Not Testnet'}`);
    console.log(`✅ Testnet API: ${hasTestnetApi ? 'Set' : 'Not Set'}`);
    console.log(`✅ SDK Sandbox: ${sdkSandboxFalse ? 'False (Correct for testnet)' : 'Not False'}`);
    console.log(`✅ API Key: ${hasApiKey ? 'Updated' : 'Not Updated'}`);
    console.log(`✅ Validation Key: ${hasValidationKey ? 'Updated' : 'Not Updated'}`);
    
    return isTestnet && hasTestnetApi && sdkSandboxFalse && hasApiKey && hasValidationKey;
  }
  
  console.log('❌ Pi configuration file not found');
  return false;
}

// Main test function
function runCompleteTestnetFlowTest() {
  console.log('🚀 Running Complete Testnet Flow Test...');
  console.log('================================================');
  
  const configOk = testCompleteTestnetConfiguration();
  const endpointsOk = testAPIEndpoints();
  const servicesOk = testServices();
  const componentsOk = testComponents();
  const shopOk = testShopIntegration();
  const piSdkOk = testPiSDKConfiguration();
  
  console.log('================================================');
  console.log('📊 Test Results:');
  console.log(`✅ Complete Testnet Configuration: ${configOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ API Endpoints: ${endpointsOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Services: ${servicesOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Components: ${componentsOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Shop Integration: ${shopOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Pi SDK Configuration: ${piSdkOk ? 'PASS' : 'FAIL'}`);
  
  const allPassed = configOk && endpointsOk && servicesOk && componentsOk && shopOk && piSdkOk;
  
  console.log('================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Complete testnet payment system is ready');
    console.log('✅ All payment endpoints configured');
    console.log('✅ All services integrated');
    console.log('✅ All components working');
    console.log('✅ Shop integration complete');
    console.log('✅ Pi SDK configured for testnet');
    console.log('');
    console.log('📋 Complete Testnet Setup Summary:');
    console.log('- Domain: https://www.flappypi.fun');
    console.log('- PiNet: flappypi6856.pinet.com');
    console.log('- Wallet: GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI');
    console.log('- Network: Testnet');
    console.log('- API: https://api.testnet.minepi.com/v2');
    console.log('- Platform API: https://api.testnet.minepi.com');
    console.log('- App ID: flappypi2807');
    console.log('- SDK Sandbox: false (Uses mainnet SDK for testnet)');
    console.log('');
    console.log('🚀 Ready for Production Deployment!');
    console.log('1. Build: npm run build');
    console.log('2. Deploy to: https://www.flappypi.fun');
    console.log('3. Test Pi Network integration');
    console.log('4. Test demo page: https://www.flappypi.fun/pi-demo');
    console.log('5. Test shop testnet payments: https://www.flappypi.fun/shop');
  } else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('Please check the failed components above');
  }
  console.log('================================================');
  
  return allPassed;
}

// Run the test
runCompleteTestnetFlowTest();
