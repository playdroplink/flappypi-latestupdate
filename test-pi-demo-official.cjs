#!/usr/bin/env node

/**
 * Pi Network Official Demo Test Script
 * Verifies the setup follows the exact official Pi demo patterns
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Pi Network Official Demo Test Setup');
console.log('================================================');

// Check if environment follows official Pi demo structure
function checkOfficialPiDemoStructure() {
  console.log('🔍 Checking Official Pi Demo Structure...');
  
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    
    // Check for official Pi demo structure
    const hasFrontendUrl = content.includes('FRONTEND_URL=http://localhost:3000');
    const hasBackendUrl = content.includes('BACKEND_URL=http://localhost:3000');
    const hasDomainValidationKey = content.includes('DOMAIN_VALIDATION_KEY=312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156');
    const hasPiApiKey = content.includes('PI_API_KEY=yajl7wvy9a5xnxss1iaououlvsk2rwcc9tsgxoiakgzetrbwaiktnqzzqtuoyqyu');
    const hasPlatformApiUrl = content.includes('PLATFORM_API_URL=https://api.sandbox.minepi.com');
    const hasSessionSecret = content.includes('SESSION_SECRET=flappypi_demo_secret_2025');
    const hasComposeProjectName = content.includes('COMPOSE_PROJECT_NAME=flappy-pi-demo');
    const hasEnvironment = content.includes('ENVIRONMENT=development');
    
    console.log(`✅ Frontend URL: ${hasFrontendUrl ? 'Set' : 'Not Set'}`);
    console.log(`✅ Backend URL: ${hasBackendUrl ? 'Set' : 'Not Set'}`);
    console.log(`✅ Domain Validation Key: ${hasDomainValidationKey ? 'Set' : 'Not Set'}`);
    console.log(`✅ Pi API Key: ${hasPiApiKey ? 'Set' : 'Not Set'}`);
    console.log(`✅ Platform API URL: ${hasPlatformApiUrl ? 'Set' : 'Not Set'}`);
    console.log(`✅ Session Secret: ${hasSessionSecret ? 'Set' : 'Not Set'}`);
    console.log(`✅ Compose Project Name: ${hasComposeProjectName ? 'Set' : 'Not Set'}`);
    console.log(`✅ Environment: ${hasEnvironment ? 'Set' : 'Not Set'}`);
    
    return hasFrontendUrl && hasBackendUrl && hasDomainValidationKey && hasPiApiKey && hasPlatformApiUrl && hasSessionSecret && hasComposeProjectName && hasEnvironment;
  }
  
  console.log('❌ .env file not found');
  return false;
}

// Check if Pi SDK configuration matches official demo
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
    
    console.log(`✅ Network Mode: ${isTestnet ? 'Testnet' : 'Not Testnet'}`);
    console.log(`✅ Sandbox Mode: ${isSandbox ? 'Enabled' : 'Disabled'}`);
    console.log(`✅ API Key: ${hasApiKey ? 'Updated' : 'Not Updated'}`);
    console.log(`✅ Validation Key: ${hasValidationKey ? 'Updated' : 'Not Updated'}`);
    console.log(`✅ SDK Sandbox: ${sdkSandboxFalse ? 'False (Correct for testnet)' : 'Not False'}`);
    
    return isTestnet && isSandbox && hasApiKey && hasValidationKey && sdkSandboxFalse;
  }
  
  console.log('❌ Pi configuration file not found');
  return false;
}

// Check if demo components exist and follow official patterns
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

// Check if API endpoints exist and follow official patterns
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
function runOfficialPiDemoTest() {
  console.log('🚀 Running Official Pi Demo Test...');
  console.log('================================================');
  
  const envOk = checkOfficialPiDemoStructure();
  const configOk = checkPiSDKConfiguration();
  const componentsOk = checkDemoComponents();
  const endpointsOk = checkAPIEndpoints();
  const routeOk = checkDemoRoute();
  
  console.log('================================================');
  console.log('📊 Test Results:');
  console.log(`✅ Official Pi Demo Structure: ${envOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Pi SDK Configuration: ${configOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Demo Components: ${componentsOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ API Endpoints: ${endpointsOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Demo Route: ${routeOk ? 'PASS' : 'FAIL'}`);
  
  const allPassed = envOk && configOk && componentsOk && endpointsOk && routeOk;
  
  console.log('================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Flappy Pi follows official Pi demo structure');
    console.log('✅ Pi Network testnet integration is ready');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Start development server: npm start');
    console.log('2. Navigate to: http://localhost:3000/pi-demo');
    console.log('3. Use Pi Browser for full functionality');
    console.log('4. Test authentication and payments');
    console.log('');
    console.log('🔧 Environment Variables:');
    console.log('- FRONTEND_URL: http://localhost:3000');
    console.log('- BACKEND_URL: http://localhost:3000');
    console.log('- PLATFORM_API_URL: https://api.sandbox.minepi.com');
    console.log('- PI_API_KEY: yajl7wvy9a5xnxss1iaououlvsk2rwcc9tsgxoiakgzetrbwaiktnqzzqtuoyqyu');
    console.log('- DOMAIN_VALIDATION_KEY: 312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156');
  } else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('Please check the failed components above');
  }
  console.log('================================================');
  
  return allPassed;
}

// Run the test
runOfficialPiDemoTest();
