#!/usr/bin/env node

/**
 * Pi Network Droplink Testnet Test Script
 * Verifies the setup follows the exact Droplink testnet patterns
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Pi Network Droplink Testnet Test Setup');
console.log('================================================');

// Check if environment follows Droplink testnet structure
function checkDroplinkTestnetStructure() {
  console.log('🔍 Checking Droplink Testnet Structure...');
  
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    
    // Check for Droplink testnet structure
    const hasProductionEnv = content.includes('NODE_ENV="production"');
    const hasTestnetMode = content.includes('PI_NETWORK="testnet"');
    const hasSandboxFalse = content.includes('PI_SANDBOX_MODE="false"');
    const hasTestnetApi = content.includes('PI_API_URL="https://api.testnet.minepi.com/v2"');
    const hasPiApiKey = content.includes('PI_API_KEY="yajl7wvy9a5xnxss1iaououlvsk2rwcc9tsgxoiakgzetrbwaiktnqzzqtuoyqyu"');
    const hasValidationKey = content.includes('PI_VALIDATION_KEY="312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156"');
    const hasPlatformApiUrl = content.includes('PLATFORM_API_URL=https://api.testnet.minepi.com');
    const hasAppId = content.includes('PI_NETWORK_APP_ID="flappypi2807"');
    const hasWalletAddress = content.includes('PI_WALLET_ADDRESS="GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ"');
    
    console.log(`✅ Production Environment: ${hasProductionEnv ? 'Set' : 'Not Set'}`);
    console.log(`✅ Testnet Mode: ${hasTestnetMode ? 'Set' : 'Not Set'}`);
    console.log(`✅ Sandbox False: ${hasSandboxFalse ? 'Set' : 'Not Set'}`);
    console.log(`✅ Testnet API: ${hasTestnetApi ? 'Set' : 'Not Set'}`);
    console.log(`✅ Pi API Key: ${hasPiApiKey ? 'Set' : 'Not Set'}`);
    console.log(`✅ Validation Key: ${hasValidationKey ? 'Set' : 'Not Set'}`);
    console.log(`✅ Platform API URL: ${hasPlatformApiUrl ? 'Set' : 'Not Set'}`);
    console.log(`✅ App ID: ${hasAppId ? 'Set' : 'Not Set'}`);
    console.log(`✅ Wallet Address: ${hasWalletAddress ? 'Set' : 'Not Set'}`);
    
    return hasProductionEnv && hasTestnetMode && hasSandboxFalse && hasTestnetApi && hasPiApiKey && hasValidationKey && hasPlatformApiUrl && hasAppId && hasWalletAddress;
  }
  
  console.log('❌ .env file not found');
  return false;
}

// Check if Pi SDK configuration matches Droplink testnet
function checkPiSDKConfiguration() {
  console.log('🔍 Checking Pi SDK Configuration...');
  
  const piConfigPath = path.join(process.cwd(), 'src/config/piConfig.ts');
  if (fs.existsSync(piConfigPath)) {
    const content = fs.readFileSync(piConfigPath, 'utf8');
    
    // Check for testnet configuration with mainnet SDK
    const isTestnet = content.includes("NETWORK_MODE: 'testnet'");
    const isSandbox = content.includes("SANDBOX_MODE: true");
    const hasApiKey = content.includes("yajl7wvy9a5xnxss1iaououlvsk2rwcc9tsgxoiakgzetrbwaiktnqzzqtuoyqyu");
    const hasValidationKey = content.includes("312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156");
    const sdkSandboxFalse = content.includes("sandbox: false"); // Critical for testnet
    const hasTestnetApi = content.includes("https://api.testnet.minepi.com/v2");
    
    console.log(`✅ Network Mode: ${isTestnet ? 'Testnet' : 'Not Testnet'}`);
    console.log(`✅ Sandbox Mode: ${isSandbox ? 'Enabled' : 'Disabled'}`);
    console.log(`✅ API Key: ${hasApiKey ? 'Updated' : 'Not Updated'}`);
    console.log(`✅ Validation Key: ${hasValidationKey ? 'Updated' : 'Not Updated'}`);
    console.log(`✅ SDK Sandbox: ${sdkSandboxFalse ? 'False (Correct for testnet)' : 'Not False'}`);
    console.log(`✅ Testnet API: ${hasTestnetApi ? 'Set' : 'Not Set'}`);
    
    return isTestnet && isSandbox && hasApiKey && hasValidationKey && sdkSandboxFalse && hasTestnetApi;
  }
  
  console.log('❌ Pi configuration file not found');
  return false;
}

// Check if demo components exist and follow Droplink patterns
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

// Check if API endpoints exist and follow Droplink patterns
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

// Check if demo route is configured
function checkDemoRoute() {
  console.log('🔍 Checking Demo Route...');
  
  const appPath = path.join(process.cwd(), 'src/App.tsx');
  if (fs.existsSync(appPath)) {
    const content = fs.readFileSync(appPath, 'utf8');
    const hasDemoRoute = content.includes('/pi-demo');
    const hasDemoImport = content.includes('PiDemoPage');
    
    console.log(`✅ Demo Route: ${hasDemoRoute ? 'Configured' : 'Not Configured'}`);
    console.log(`✅ Demo Import: ${hasDemoImport ? 'Added' : 'Not Added'}`);
    
    return hasDemoRoute && hasDemoImport;
  }
  
  console.log('❌ App.tsx not found');
  return false;
}

// Main test function
function runDroplinkTestnetTest() {
  console.log('🚀 Running Droplink Testnet Test...');
  console.log('================================================');
  
  const envOk = checkDroplinkTestnetStructure();
  const configOk = checkPiSDKConfiguration();
  const componentsOk = checkDemoComponents();
  const endpointsOk = checkAPIEndpoints();
  const routeOk = checkDemoRoute();
  
  console.log('================================================');
  console.log('📊 Test Results:');
  console.log(`✅ Droplink Testnet Structure: ${envOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Pi SDK Configuration: ${configOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Demo Components: ${componentsOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ API Endpoints: ${endpointsOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Demo Route: ${routeOk ? 'PASS' : 'FAIL'}`);
  
  const allPassed = envOk && configOk && componentsOk && endpointsOk && routeOk;
  
  console.log('================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Flappy Pi follows Droplink testnet structure');
    console.log('✅ Pi Network testnet integration is ready');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Start development server: npm start');
    console.log('2. Navigate to: http://localhost:3000/pi-demo');
    console.log('3. Use Pi Browser for full functionality');
    console.log('4. Test authentication and payments');
    console.log('');
    console.log('🔧 Key Configuration:');
    console.log('- Environment: Production Testnet');
    console.log('- Pi Network: testnet');
    console.log('- Pi Sandbox: false (Uses mainnet SDK)');
    console.log('- API URL: https://api.testnet.minepi.com/v2');
    console.log('- Platform API URL: https://api.testnet.minepi.com');
    console.log('- App ID: flappypi2807');
    console.log('- API Key: yajl7wvy9a5xnxss1iaououlvsk2rwcc9tsgxoiakgzetrbwaiktnqzzqtuoyqyu');
  } else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('Please check the failed components above');
  }
  console.log('================================================');
  
  return allPassed;
}

// Run the test
runDroplinkTestnetTest();
