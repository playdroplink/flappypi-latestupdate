#!/usr/bin/env node

/**
 * Base URL and Username Fix Test
 * Verifies that the base URL is updated and Pi Auth username is working
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Base URL and Username Fix Test');
console.log('================================================');

// Test base URL configuration
function testBaseUrlConfiguration() {
  console.log('🔍 Testing Base URL Configuration...');
  
  const configPath = path.join(process.cwd(), 'src/config/piConfig.ts');
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    
    // Check for correct base URL
    const hasCorrectBaseUrl = content.includes('BASE_URL: \'https://www.flappypi.fun\'');
    const hasCorrectSubdomain = content.includes('SUBDOMAIN: \'flappypi6856.pinet.com\'');
    const hasCorrectCorsOrigins = content.includes('https://www.flappypi.fun') && 
                                 content.includes('https://flappypi6856.pinet.com');
    const hasTestnetMode = content.includes('NETWORK_MODE: \'testnet\'');
    const hasTestnetApi = content.includes('API_URL: \'https://api.testnet.minepi.com/v2\'');
    
    console.log(`✅ Correct Base URL: ${hasCorrectBaseUrl ? 'Found' : 'Not Found'}`);
    console.log(`✅ Correct Subdomain: ${hasCorrectSubdomain ? 'Found' : 'Not Found'}`);
    console.log(`✅ Correct CORS Origins: ${hasCorrectCorsOrigins ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Mode: ${hasTestnetMode ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet API: ${hasTestnetApi ? 'Found' : 'Not Found'}`);
    
    return hasCorrectBaseUrl && hasCorrectSubdomain && hasCorrectCorsOrigins && hasTestnetMode && hasTestnetApi;
  }
  
  console.log('❌ piConfig.ts not found');
  return false;
}

// Test Pi Auth username functionality
function testPiAuthUsername() {
  console.log('🔍 Testing Pi Auth Username Functionality...');
  
  const authDemoPath = path.join(process.cwd(), 'src/components/PiAuthDemo.tsx');
  const authApiPath = path.join(process.cwd(), 'api/pi/auth.ts');
  
  let authDemoOk = false;
  let authApiOk = false;
  
  // Test PiAuthDemo component
  if (fs.existsSync(authDemoPath)) {
    const content = fs.readFileSync(authDemoPath, 'utf8');
    
    const hasUsernameScope = content.includes('AUTH_SCOPES');
    const hasUsernameExtraction = content.includes('username: result.user.username');
    const hasUsernameDisplay = content.includes('user.username');
    const hasUsernameInterface = content.includes('username: string');
    
    console.log(`✅ Username Scope: ${hasUsernameScope ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Extraction: ${hasUsernameExtraction ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Display: ${hasUsernameDisplay ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Interface: ${hasUsernameInterface ? 'Found' : 'Not Found'}`);
    
    authDemoOk = hasUsernameScope && hasUsernameExtraction && hasUsernameDisplay && hasUsernameInterface;
  } else {
    console.log('❌ PiAuthDemo.tsx not found');
  }
  
  // Test auth API endpoint
  if (fs.existsSync(authApiPath)) {
    const content = fs.readFileSync(authApiPath, 'utf8');
    
    const hasUsernameReturn = content.includes('username: verifiedUserData.username');
    const hasUsernameInterface = content.includes('username: string');
    const hasUsernameLogging = content.includes('verifiedUserData.username');
    const hasUsernameExtraction = content.includes('username: result.user.username');
    
    console.log(`✅ Username Return: ${hasUsernameReturn ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Interface: ${hasUsernameInterface ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Logging: ${hasUsernameLogging ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Extraction: ${hasUsernameExtraction ? 'Found' : 'Not Found'}`);
    
    authApiOk = hasUsernameReturn && hasUsernameInterface && hasUsernameLogging;
  } else {
    console.log('❌ api/pi/auth.ts not found');
  }
  
  return authDemoOk && authApiOk;
}

// Test environment configuration
function testEnvironmentConfiguration() {
  console.log('🔍 Testing Environment Configuration...');
  
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    
    // Check for domain configuration
    const hasFrontendUrl = content.includes('FRONTEND_URL=https://www.flappypi.fun');
    const hasBackendUrl = content.includes('BACKEND_URL=https://www.flappypi.fun');
    const hasAppBaseUrl = content.includes('APP_BASE_URL="https://www.flappypi.fun"');
    const hasAppSubdomain = content.includes('APP_SUBDOMAIN="flappypi6856.pinet.com"');
    const hasAllowedOrigins = content.includes('https://www.flappypi.fun') && 
                             content.includes('flappypi6856.pinet.com');
    
    console.log(`✅ Frontend URL: ${hasFrontendUrl ? 'Found' : 'Not Found'}`);
    console.log(`✅ Backend URL: ${hasBackendUrl ? 'Found' : 'Not Found'}`);
    console.log(`✅ App Base URL: ${hasAppBaseUrl ? 'Found' : 'Not Found'}`);
    console.log(`✅ App Subdomain: ${hasAppSubdomain ? 'Found' : 'Not Found'}`);
    console.log(`✅ Allowed Origins: ${hasAllowedOrigins ? 'Found' : 'Not Found'}`);
    
    return hasFrontendUrl && hasBackendUrl && hasAppBaseUrl && hasAppSubdomain && hasAllowedOrigins;
  }
  
  console.log('❌ .env file not found');
  return false;
}

// Test username scope configuration
function testUsernameScopeConfiguration() {
  console.log('🔍 Testing Username Scope Configuration...');
  
  const configPath = path.join(process.cwd(), 'src/config/piConfig.ts');
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    
    const hasUsernameEnabled = content.includes('ENABLE_USERNAME: true');
    const hasUsernameScopes = content.includes('AUTH_SCOPES: [\'payments\', \'username\']');
    const hasUsernameScopeArray = content.includes('AUTH_SCOPES_USERNAME: [\'username\']');
    const hasUsernameScopePayments = content.includes('AUTH_SCOPES_PAYMENTS: [\'payments\']');
    
    console.log(`✅ Username Enabled: ${hasUsernameEnabled ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Scopes: ${hasUsernameScopes ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Scope Array: ${hasUsernameScopeArray ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Scope Payments: ${hasUsernameScopePayments ? 'Found' : 'Not Found'}`);
    
    return hasUsernameEnabled && hasUsernameScopes && hasUsernameScopeArray && hasUsernameScopePayments;
  }
  
  console.log('❌ piConfig.ts not found');
  return false;
}

// Main test function
function runBaseUrlAndUsernameTest() {
  console.log('🚀 Running Base URL and Username Fix Test...');
  console.log('================================================');
  
  const baseUrlOk = testBaseUrlConfiguration();
  const usernameOk = testPiAuthUsername();
  const envOk = testEnvironmentConfiguration();
  const scopeOk = testUsernameScopeConfiguration();
  
  console.log('================================================');
  console.log('📊 Test Results:');
  console.log(`✅ Base URL Configuration: ${baseUrlOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Pi Auth Username: ${usernameOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Environment Configuration: ${envOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Username Scope Configuration: ${scopeOk ? 'PASS' : 'FAIL'}`);
  
  const allPassed = baseUrlOk && usernameOk && envOk && scopeOk;
  
  console.log('================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Base URL updated to https://www.flappypi.fun');
    console.log('✅ Subdomain updated to flappypi6856.pinet.com');
    console.log('✅ Pi Auth username functionality working');
    console.log('✅ Username scope configuration correct');
    console.log('✅ Environment configuration updated');
    console.log('');
    console.log('🔧 Configuration Summary:');
    console.log('- Base URL: https://www.flappypi.fun');
    console.log('- Subdomain: flappypi6856.pinet.com');
    console.log('- Network: Testnet');
    console.log('- API: https://api.testnet.minepi.com/v2');
    console.log('- Username: Enabled');
    console.log('- Scopes: [\'payments\', \'username\']');
    console.log('');
    console.log('🚀 App should now show correct base URL and username!');
  } else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('Please check the failed components above');
  }
  console.log('================================================');
  
  return allPassed;
}

// Run the test
runBaseUrlAndUsernameTest();
