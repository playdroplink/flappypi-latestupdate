#!/usr/bin/env node

/**
 * Complete Testnet Configuration Test
 * Verifies the complete testnet setup with domain and wallet configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Complete Testnet Configuration Test');
console.log('================================================');

// Check complete testnet configuration
function checkCompleteTestnetConfiguration() {
  console.log('🔍 Checking Complete Testnet Configuration...');
  
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    
    // Check domain configuration
    const hasProductionDomain = content.includes('APP_BASE_URL="https://www.flappypi.fun"');
    const hasPiNetSubdomain = content.includes('APP_SUBDOMAIN="flappypi6856.pinet.com"');
    const hasFrontendUrl = content.includes('FRONTEND_URL=https://www.flappypi.fun');
    const hasBackendUrl = content.includes('BACKEND_URL=https://www.flappypi.fun');
    
    // Check testnet wallet configuration
    const hasTestnetWallet = content.includes('PI_WALLET_ADDRESS="GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI"');
    const hasTestnetSeed = content.includes('PI_WALLET_SEED="SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I"');
    const hasAccountId = content.includes('PI_ACCOUNT_ID="GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI"');
    
    // Check testnet API configuration
    const hasTestnetApi = content.includes('PI_API_URL="https://api.testnet.minepi.com/v2"');
    const hasPlatformApi = content.includes('PLATFORM_API_URL=https://api.testnet.minepi.com');
    const hasApiKey = content.includes('PI_API_KEY="yajl7wvy9a5xnxss1iaououlvsk2rwcc9tsgxoiakgzetrbwaiktnqzzqtuoyqyu"');
    const hasValidationKey = content.includes('PI_VALIDATION_KEY="312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156"');
    
    // Check CORS configuration
    const hasCorsOrigins = content.includes('ALLOWED_ORIGINS="https://www.flappypi.fun,https://flappypi6856.pinet.com,https://*.pinet.com"');
    
    console.log('📊 Domain Configuration:');
    console.log(`✅ Production Domain: ${hasProductionDomain ? 'Set' : 'Not Set'}`);
    console.log(`✅ PiNet Subdomain: ${hasPiNetSubdomain ? 'Set' : 'Not Set'}`);
    console.log(`✅ Frontend URL: ${hasFrontendUrl ? 'Set' : 'Not Set'}`);
    console.log(`✅ Backend URL: ${hasBackendUrl ? 'Set' : 'Not Set'}`);
    console.log(`✅ CORS Origins: ${hasCorsOrigins ? 'Set' : 'Not Set'}`);
    
    console.log('💰 Testnet Wallet Configuration:');
    console.log(`✅ Testnet Wallet Address: ${hasTestnetWallet ? 'Set' : 'Not Set'}`);
    console.log(`✅ Testnet Wallet Seed: ${hasTestnetSeed ? 'Set' : 'Not Set'}`);
    console.log(`✅ Account ID: ${hasAccountId ? 'Set' : 'Not Set'}`);
    
    console.log('🔧 Testnet API Configuration:');
    console.log(`✅ Testnet API URL: ${hasTestnetApi ? 'Set' : 'Not Set'}`);
    console.log(`✅ Platform API URL: ${hasPlatformApi ? 'Set' : 'Not Set'}`);
    console.log(`✅ API Key: ${hasApiKey ? 'Set' : 'Not Set'}`);
    console.log(`✅ Validation Key: ${hasValidationKey ? 'Set' : 'Not Set'}`);
    
    return hasProductionDomain && hasPiNetSubdomain && hasFrontendUrl && hasBackendUrl && 
           hasTestnetWallet && hasTestnetSeed && hasAccountId && 
           hasTestnetApi && hasPlatformApi && hasApiKey && hasValidationKey && hasCorsOrigins;
  }
  
  console.log('❌ .env file not found');
  return false;
}

// Check Pi SDK configuration
function checkPiSDKConfiguration() {
  console.log('🔍 Checking Pi SDK Configuration...');
  
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

// Check demo components
function checkDemoComponents() {
  console.log('🔍 Checking Demo Components...');
  
  const components = [
    'src/components/PiAuthDemo.tsx',
    'src/components/PiPaymentDemo.tsx',
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

// Check API endpoints
function checkAPIEndpoints() {
  console.log('🔍 Checking API Endpoints...');
  
  const endpoints = [
    'api/pi/auth.ts',
    'api/pi/approve-payment.ts',
    'api/pi/complete-payment.ts'
  ];
  
  let allExist = true;
  endpoints.forEach(endpoint => {
    const exists = fs.existsSync(path.join(process.cwd(), endpoint));
    console.log(`${exists ? '✅' : '❌'} ${endpoint}`);
    if (!exists) allExist = false;
  });
  
  return allExist;
}

// Main test function
function runCompleteTestnetTest() {
  console.log('🚀 Running Complete Testnet Configuration Test...');
  console.log('================================================');
  
  const envOk = checkCompleteTestnetConfiguration();
  const configOk = checkPiSDKConfiguration();
  const componentsOk = checkDemoComponents();
  const endpointsOk = checkAPIEndpoints();
  
  console.log('================================================');
  console.log('📊 Test Results:');
  console.log(`✅ Complete Testnet Configuration: ${envOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Pi SDK Configuration: ${configOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Demo Components: ${componentsOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ API Endpoints: ${endpointsOk ? 'PASS' : 'FAIL'}`);
  
  const allPassed = envOk && configOk && componentsOk && endpointsOk;
  
  console.log('================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Complete testnet configuration is ready');
    console.log('✅ Production domain: https://www.flappypi.fun');
    console.log('✅ PiNet subdomain: flappypi6856.pinet.com');
    console.log('✅ Testnet wallet: GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI');
    console.log('✅ Testnet seed: SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I');
    console.log('');
    console.log('📋 Configuration Summary:');
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
  } else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('Please check the failed components above');
  }
  console.log('================================================');
  
  return allPassed;
}

// Run the test
runCompleteTestnetTest();
