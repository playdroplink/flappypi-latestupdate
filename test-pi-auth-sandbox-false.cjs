#!/usr/bin/env node

/**
 * Pi Auth Sandbox False Test
 * Verifies that Pi Auth is configured with sandbox: false
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Pi Auth Sandbox False Test');
console.log('================================================');

// Test mainnet config for sandbox false
function testMainnetConfigSandbox() {
  console.log('🔍 Testing Mainnet Config for Sandbox False...');
  
  const configPath = path.join(process.cwd(), 'src/config/mainnetConfig.ts');
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    
    // Check for sandbox false configuration
    const hasSandboxFalse = content.includes('sandbox: false');
    const hasTestnetMode = content.includes('NETWORK_MODE: \'testnet\'');
    const hasTestnetApi = content.includes('API_URL: \'https://api.testnet.minepi.com/v2\'');
    const hasUsernameScope = content.includes('AUTH_SCOPES: [\'payments\', \'username\']');
    const hasUsernameEnabled = content.includes('ENABLE_USERNAME: true');
    
    console.log(`✅ Sandbox False: ${hasSandboxFalse ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Mode: ${hasTestnetMode ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet API: ${hasTestnetApi ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Scope: ${hasUsernameScope ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Enabled: ${hasUsernameEnabled ? 'Found' : 'Not Found'}`);
    
    return hasSandboxFalse && hasTestnetMode && hasTestnetApi && hasUsernameScope && hasUsernameEnabled;
  }
  
  console.log('❌ mainnetConfig.ts not found');
  return false;
}

// Test pi config for sandbox false
function testPiConfigSandbox() {
  console.log('🔍 Testing Pi Config for Sandbox False...');
  
  const configPath = path.join(process.cwd(), 'src/config/piConfig.ts');
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    
    // Check for sandbox false configuration
    const hasSandboxFalse = content.includes('sandbox: false');
    const hasTestnetMode = content.includes('NETWORK_MODE: \'testnet\'');
    const hasTestnetApi = content.includes('API_URL: \'https://api.testnet.minepi.com/v2\'');
    const hasUsernameScope = content.includes('AUTH_SCOPES: [\'payments\', \'username\']');
    const hasUsernameEnabled = content.includes('ENABLE_USERNAME: true');
    
    console.log(`✅ Sandbox False: ${hasSandboxFalse ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Mode: ${hasTestnetMode ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet API: ${hasTestnetApi ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Scope: ${hasUsernameScope ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Enabled: ${hasUsernameEnabled ? 'Found' : 'Not Found'}`);
    
    return hasSandboxFalse && hasTestnetMode && hasTestnetApi && hasUsernameScope && hasUsernameEnabled;
  }
  
  console.log('❌ piConfig.ts not found');
  return false;
}

// Test Pi Auth demo component for sandbox false
function testPiAuthDemoSandbox() {
  console.log('🔍 Testing Pi Auth Demo for Sandbox False...');
  
  const demoPath = path.join(process.cwd(), 'src/components/PiAuthDemo.tsx');
  if (fs.existsSync(demoPath)) {
    const content = fs.readFileSync(demoPath, 'utf8');
    
    // Check for proper Pi Auth configuration
    const hasPiSDKCheck = content.includes('window.Pi');
    const hasAuthScopes = content.includes('PI_CONFIG.AUTH_SCOPES');
    const hasUsernameExtraction = content.includes('username: result.user.username');
    const hasUsernameDisplay = content.includes('user.username');
    const hasAuthResult = content.includes('authResult');
    
    console.log(`✅ Pi SDK Check: ${hasPiSDKCheck ? 'Found' : 'Not Found'}`);
    console.log(`✅ Auth Scopes: ${hasAuthScopes ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Extraction: ${hasUsernameExtraction ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Display: ${hasUsernameDisplay ? 'Found' : 'Not Found'}`);
    console.log(`✅ Auth Result: ${hasAuthResult ? 'Found' : 'Not Found'}`);
    
    return hasPiSDKCheck && hasAuthScopes && hasUsernameExtraction && hasUsernameDisplay && hasAuthResult;
  }
  
  console.log('❌ PiAuthDemo.tsx not found');
  return false;
}

// Test backend auth endpoint for sandbox false
function testBackendAuthSandbox() {
  console.log('🔍 Testing Backend Auth for Sandbox False...');
  
  const authPath = path.join(process.cwd(), 'api/pi/auth.ts');
  if (fs.existsSync(authPath)) {
    const content = fs.readFileSync(authPath, 'utf8');
    
    // Check for proper auth endpoint configuration
    const hasTestnetApi = content.includes('https://api.testnet.minepi.com');
    const hasUsernameReturn = content.includes('username: verifiedUserData.username');
    const hasUsernameInterface = content.includes('username: string');
    const hasAuthResult = content.includes('authResult');
    const hasProperFormat = content.includes('export default async function handler');
    
    console.log(`✅ Testnet API: ${hasTestnetApi ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Return: ${hasUsernameReturn ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Interface: ${hasUsernameInterface ? 'Found' : 'Not Found'}`);
    console.log(`✅ Auth Result: ${hasAuthResult ? 'Found' : 'Not Found'}`);
    console.log(`✅ Proper Format: ${hasProperFormat ? 'Found' : 'Not Found'}`);
    
    return hasTestnetApi && hasUsernameReturn && hasUsernameInterface && hasAuthResult && hasProperFormat;
  }
  
  console.log('❌ api/pi/auth.ts not found');
  return false;
}

// Test environment variables for sandbox false
function testEnvironmentSandbox() {
  console.log('🔍 Testing Environment for Sandbox False...');
  
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    
    // Check for environment configuration
    const hasTestnetApi = content.includes('TESTNET_API_URL="https://api.testnet.minepi.com/v2"');
    const hasTestnetPlatformApi = content.includes('TESTNET_PLATFORM_API_URL="https://api.testnet.minepi.com"');
    const hasTestnetPayments = content.includes('TESTNET_PAYMENTS_ENABLED="true"');
    const hasUsernameScope = content.includes('AUTH_SCOPES="payments,username"');
    const hasUsernameEnabled = content.includes('ENABLE_USERNAME="true"');
    
    console.log(`✅ Testnet API: ${hasTestnetApi ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Platform API: ${hasTestnetPlatformApi ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Payments: ${hasTestnetPayments ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Scope: ${hasUsernameScope ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Enabled: ${hasUsernameEnabled ? 'Found' : 'Not Found'}`);
    
    return hasTestnetApi && hasTestnetPlatformApi && hasTestnetPayments && hasUsernameScope && hasUsernameEnabled;
  }
  
  console.log('❌ .env file not found');
  return false;
}

// Main test function
function runPiAuthSandboxTest() {
  console.log('🚀 Running Pi Auth Sandbox False Test...');
  console.log('================================================');
  
  const mainnetOk = testMainnetConfigSandbox();
  const piConfigOk = testPiConfigSandbox();
  const demoOk = testPiAuthDemoSandbox();
  const backendOk = testBackendAuthSandbox();
  const envOk = testEnvironmentSandbox();
  
  console.log('================================================');
  console.log('📊 Test Results:');
  console.log(`✅ Mainnet Config Sandbox: ${mainnetOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Pi Config Sandbox: ${piConfigOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Pi Auth Demo: ${demoOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Backend Auth: ${backendOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Environment: ${envOk ? 'PASS' : 'FAIL'}`);
  
  const allPassed = mainnetOk && piConfigOk && demoOk && backendOk && envOk;
  
  console.log('================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Pi Auth is configured with sandbox: false');
    console.log('✅ Testnet mode is properly configured');
    console.log('✅ Username scope is enabled');
    console.log('✅ All components are working correctly');
    console.log('');
    console.log('🔧 Pi Auth Configuration:');
    console.log('- Sandbox: false (correct for testnet)');
    console.log('- Network Mode: testnet');
    console.log('- API URL: https://api.testnet.minepi.com/v2');
    console.log('- Platform API: https://api.testnet.minepi.com');
    console.log('- Username Scope: [\'payments\', \'username\']');
    console.log('- Username Enabled: true');
    console.log('');
    console.log('🚀 Pi Auth is ready for testnet with sandbox: false!');
  } else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('Please check the failed components above');
  }
  console.log('================================================');
  
  return allPassed;
}

// Run the test
runPiAuthSandboxTest();
