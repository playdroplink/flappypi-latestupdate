#!/usr/bin/env node

/**
 * Pi Network Demo Test Script
 * Following official Pi demo patterns for testing Pi Auth and Pi Payment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Pi Network Demo Test Setup');
console.log('================================================');

// Check if Pi SDK is properly configured
function checkPiSDKConfiguration() {
  console.log('🔍 Checking Pi SDK Configuration...');
  
  const piConfigPath = path.join(process.cwd(), 'src/config/piConfig.ts');
  if (fs.existsSync(piConfigPath)) {
    const content = fs.readFileSync(piConfigPath, 'utf8');
    
    // Check for testnet configuration
    const isTestnet = content.includes("NETWORK_MODE: 'testnet'");
    const isSandbox = content.includes("SANDBOX_MODE: true");
    const hasApiKey = content.includes("yajl7wvy9a5xnxss1iaououlvsk2rwcc9tsgxoiakgzetrbwaiktnqzzqtuoyqyu");
    const hasValidationKey = content.includes("312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156");
    
    console.log(`✅ Network Mode: ${isTestnet ? 'Testnet' : 'Not Testnet'}`);
    console.log(`✅ Sandbox Mode: ${isSandbox ? 'Enabled' : 'Disabled'}`);
    console.log(`✅ API Key: ${hasApiKey ? 'Updated' : 'Not Updated'}`);
    console.log(`✅ Validation Key: ${hasValidationKey ? 'Updated' : 'Not Updated'}`);
    
    return isTestnet && isSandbox && hasApiKey && hasValidationKey;
  }
  
  console.log('❌ Pi configuration file not found');
  return false;
}

// Check if demo components exist
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

// Check if API endpoints exist
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
function runPiDemoTest() {
  console.log('🚀 Running Pi Network Demo Test...');
  console.log('================================================');
  
  const configOk = checkPiSDKConfiguration();
  const componentsOk = checkDemoComponents();
  const endpointsOk = checkAPIEndpoints();
  const routeOk = checkDemoRoute();
  
  console.log('================================================');
  console.log('📊 Test Results:');
  console.log(`✅ Pi SDK Configuration: ${configOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Demo Components: ${componentsOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ API Endpoints: ${endpointsOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Demo Route: ${routeOk ? 'PASS' : 'FAIL'}`);
  
  const allPassed = configOk && componentsOk && endpointsOk && routeOk;
  
  console.log('================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Pi Network Demo is ready for testing');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Start development server: npm start');
    console.log('2. Navigate to: http://localhost:3000/pi-demo');
    console.log('3. Use Pi Browser for full functionality');
    console.log('4. Test authentication and payments');
  } else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('Please check the failed components above');
  }
  console.log('================================================');
  
  return allPassed;
}

// Run the test
runPiDemoTest();
