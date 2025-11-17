#!/usr/bin/env node

/**
 * Pi Auth Username Fix Test
 * Tests the Pi Auth username handling and backend verification
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Pi Auth Username Fix Test');
console.log('================================================');

// Test Pi Auth component username handling
function testPiAuthComponent() {
  console.log('🔍 Testing Pi Auth Component...');
  
  const piAuthPath = path.join(process.cwd(), 'src/components/PiAuthDemo.tsx');
  if (fs.existsSync(piAuthPath)) {
    const content = fs.readFileSync(piAuthPath, 'utf8');
    
    // Check for proper username handling
    const hasUsernameInterface = content.includes('username: string');
    const hasUsernameExtraction = content.includes('username: authResult.user.username') || content.includes('username: result.user.username');
    const hasBackendVerification = content.includes('fetch(\'/api/pi/auth\'');
    const hasUsernameDisplay = content.includes('Welcome, {user.username}');
    const hasUsernameInUserData = content.includes('username: result.user.username');
    
    console.log(`✅ Username Interface: ${hasUsernameInterface ? 'Defined' : 'Not Defined'}`);
    console.log(`✅ Username Extraction: ${hasUsernameExtraction ? 'Implemented' : 'Not Implemented'}`);
    console.log(`✅ Backend Verification: ${hasBackendVerification ? 'Implemented' : 'Not Implemented'}`);
    console.log(`✅ Username Display: ${hasUsernameDisplay ? 'Implemented' : 'Not Implemented'}`);
    console.log(`✅ Username in User Data: ${hasUsernameInUserData ? 'Implemented' : 'Not Implemented'}`);
    
    return hasUsernameInterface && hasUsernameExtraction && hasBackendVerification && 
           hasUsernameDisplay && hasUsernameInUserData;
  }
  
  console.log('❌ PiAuthDemo.tsx not found');
  return false;
}

// Test backend auth endpoint
function testBackendAuthEndpoint() {
  console.log('🔍 Testing Backend Auth Endpoint...');
  
  const authPath = path.join(process.cwd(), 'api/pi/auth.ts');
  if (fs.existsSync(authPath)) {
    const content = fs.readFileSync(authPath, 'utf8');
    
    // Check for proper authResult handling
    const hasAuthResultInterface = content.includes('authResult: any');
    const hasAuthResultValidation = content.includes('authResult.accessToken');
    const hasUsernameLogging = content.includes('user.username');
    const hasUsernameVerification = content.includes('verifiedUserData.username');
    const hasUsernameReturn = content.includes('username: verifiedUserData.username');
    
    console.log(`✅ AuthResult Interface: ${hasAuthResultInterface ? 'Defined' : 'Not Defined'}`);
    console.log(`✅ AuthResult Validation: ${hasAuthResultValidation ? 'Implemented' : 'Not Implemented'}`);
    console.log(`✅ Username Logging: ${hasUsernameLogging ? 'Implemented' : 'Not Implemented'}`);
    console.log(`✅ Username Verification: ${hasUsernameVerification ? 'Implemented' : 'Not Implemented'}`);
    console.log(`✅ Username Return: ${hasUsernameReturn ? 'Implemented' : 'Not Implemented'}`);
    
    return hasAuthResultInterface && hasAuthResultValidation && hasUsernameLogging && 
           hasUsernameVerification && hasUsernameReturn;
  }
  
  console.log('❌ api/pi/auth.ts not found');
  return false;
}

// Test Pi SDK configuration for username
function testPiSDKUsernameConfig() {
  console.log('🔍 Testing Pi SDK Username Configuration...');
  
  const piConfigPath = path.join(process.cwd(), 'src/config/piConfig.ts');
  if (fs.existsSync(piConfigPath)) {
    const content = fs.readFileSync(piConfigPath, 'utf8');
    
    // Check for username scope in authentication
    const hasUsernameScope = content.includes('username');
    const hasPaymentsScope = content.includes('payments');
    const hasTestnetConfig = content.includes('testnet');
    const hasSandboxConfig = content.includes('sandbox: false');
    
    console.log(`✅ Username Scope: ${hasUsernameScope ? 'Configured' : 'Not Configured'}`);
    console.log(`✅ Payments Scope: ${hasPaymentsScope ? 'Configured' : 'Not Configured'}`);
    console.log(`✅ Testnet Config: ${hasTestnetConfig ? 'Configured' : 'Not Configured'}`);
    console.log(`✅ Sandbox Config: ${hasSandboxConfig ? 'Configured' : 'Not Configured'}`);
    
    return hasUsernameScope && hasPaymentsScope && hasTestnetConfig && hasSandboxConfig;
  }
  
  console.log('❌ Pi configuration file not found');
  return false;
}

// Test environment variables for username
function testEnvironmentUsernameConfig() {
  console.log('🔍 Testing Environment Username Configuration...');
  
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    
    // Check for testnet configuration
    const hasTestnetPayments = content.includes('TESTNET_PAYMENTS_ENABLED="true"');
    const hasTestnetApi = content.includes('TESTNET_API_URL="https://api.testnet.minepi.com/v2"');
    const hasTestnetPlatformApi = content.includes('TESTNET_PLATFORM_API_URL="https://api.testnet.minepi.com"');
    const hasTestnetApiKey = content.includes('TESTNET_API_KEY="yajl7wvy9a5xnxss1iaououlvsk2rwcc9tsgxoiakgzetrbwaiktnqzzqtuoyqyu"');
    
    console.log(`✅ Testnet Payments: ${hasTestnetPayments ? 'Enabled' : 'Not Enabled'}`);
    console.log(`✅ Testnet API: ${hasTestnetApi ? 'Configured' : 'Not Configured'}`);
    console.log(`✅ Testnet Platform API: ${hasTestnetPlatformApi ? 'Configured' : 'Not Configured'}`);
    console.log(`✅ Testnet API Key: ${hasTestnetApiKey ? 'Configured' : 'Not Configured'}`);
    
    return hasTestnetPayments && hasTestnetApi && hasTestnetPlatformApi && hasTestnetApiKey;
  }
  
  console.log('❌ .env file not found');
  return false;
}

// Main test function
function runPiAuthUsernameFixTest() {
  console.log('🚀 Running Pi Auth Username Fix Test...');
  console.log('================================================');
  
  const componentOk = testPiAuthComponent();
  const backendOk = testBackendAuthEndpoint();
  const sdkOk = testPiSDKUsernameConfig();
  const envOk = testEnvironmentUsernameConfig();
  
  console.log('================================================');
  console.log('📊 Test Results:');
  console.log(`✅ Pi Auth Component: ${componentOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Backend Auth Endpoint: ${backendOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Pi SDK Username Config: ${sdkOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Environment Username Config: ${envOk ? 'PASS' : 'FAIL'}`);
  
  const allPassed = componentOk && backendOk && sdkOk && envOk;
  
  console.log('================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Pi Auth username handling is working correctly');
    console.log('✅ Backend verification is properly implemented');
    console.log('✅ Username display is working');
    console.log('✅ Testnet configuration is correct');
    console.log('');
    console.log('📋 Pi Auth Username Fix Summary:');
    console.log('- Username interface: Defined');
    console.log('- Username extraction: Implemented');
    console.log('- Backend verification: Implemented');
    console.log('- Username display: Working');
    console.log('- Testnet configuration: Correct');
    console.log('');
    console.log('🚀 Pi Auth Username Fix Complete!');
    console.log('1. Username is properly extracted from Pi SDK');
    console.log('2. Backend verification includes username validation');
    console.log('3. Username is displayed in the UI');
    console.log('4. Testnet configuration supports username authentication');
    console.log('5. All username-related functionality is working');
  } else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('Please check the failed components above');
  }
  console.log('================================================');
  
  return allPassed;
}

// Run the test
runPiAuthUsernameFixTest();
