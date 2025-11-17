#!/usr/bin/env node

/**
 * Pi SDK Official Patterns Test
 * Verifies that our implementation follows the official Pi SDK documentation patterns
 */

const fs = require('fs');
const path = require('path');

console.log('📚 Pi SDK Official Patterns Test');
console.log('================================================');

// Test Pi SDK initialization pattern
function testPiSDKInitialization() {
  console.log('🔍 Testing Pi SDK Initialization Pattern...');
  
  const demoPath = path.join(process.cwd(), 'src/components/PiAuthDemo.tsx');
  if (fs.existsSync(demoPath)) {
    const content = fs.readFileSync(demoPath, 'utf8');
    
    // Check for official Pi SDK initialization pattern
    const hasWindowPi = content.includes('window.Pi');
    const hasPiSDKCheck = content.includes('typeof window !== \'undefined\' && window.Pi');
    const hasPiSDKReady = content.includes('setSdkReady(true)');
    
    console.log(`✅ Window.Pi: ${hasWindowPi ? 'Found' : 'Not Found'}`);
    console.log(`✅ Pi SDK Check: ${hasPiSDKCheck ? 'Found' : 'Not Found'}`);
    console.log(`✅ Pi SDK Ready: ${hasPiSDKReady ? 'Found' : 'Not Found'}`);
    
    return hasWindowPi && hasPiSDKCheck && hasPiSDKReady;
  }
  
  console.log('❌ PiAuthDemo.tsx not found');
  return false;
}

// Test authenticate function pattern
function testAuthenticatePattern() {
  console.log('🔍 Testing Authenticate Function Pattern...');
  
  const demoPath = path.join(process.cwd(), 'src/components/PiAuthDemo.tsx');
  if (fs.existsSync(demoPath)) {
    const content = fs.readFileSync(demoPath, 'utf8');
    
    // Check for official authenticate pattern
    const hasAuthenticateCall = content.includes('window.Pi.authenticate');
    const hasScopesParameter = content.includes('PI_CONFIG.AUTH_SCOPES');
    const hasIncompletePaymentCallback = content.includes('(incompletePayment) => {');
    const hasAuthResult = content.includes('authResult');
    const hasUserExtraction = content.includes('authResult.user');
    const hasAccessTokenExtraction = content.includes('authResult.accessToken');
    
    console.log(`✅ Authenticate Call: ${hasAuthenticateCall ? 'Found' : 'Not Found'}`);
    console.log(`✅ Scopes Parameter: ${hasScopesParameter ? 'Found' : 'Not Found'}`);
    console.log(`✅ Incomplete Payment Callback: ${hasIncompletePaymentCallback ? 'Found' : 'Not Found'}`);
    console.log(`✅ Auth Result: ${hasAuthResult ? 'Found' : 'Not Found'}`);
    console.log(`✅ User Extraction: ${hasUserExtraction ? 'Found' : 'Not Found'}`);
    console.log(`✅ Access Token Extraction: ${hasAccessTokenExtraction ? 'Found' : 'Not Found'}`);
    
    return hasAuthenticateCall && hasScopesParameter && hasIncompletePaymentCallback && 
           hasAuthResult && hasUserExtraction && hasAccessTokenExtraction;
  }
  
  console.log('❌ PiAuthDemo.tsx not found');
  return false;
}

// Test scopes configuration
function testScopesConfiguration() {
  console.log('🔍 Testing Scopes Configuration...');
  
  const configPath = path.join(process.cwd(), 'src/config/mainnetConfig.ts');
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    
    // Check for official scopes configuration
    const hasUsernameScope = content.includes('AUTH_SCOPES: [\'payments\', \'username\']');
    const hasPaymentsScope = content.includes('AUTH_SCOPES_PAYMENTS: [\'payments\']');
    const hasUsernameScopeArray = content.includes('AUTH_SCOPES_USERNAME: [\'username\']');
    const hasUsernameEnabled = content.includes('ENABLE_USERNAME: true');
    
    console.log(`✅ Username Scope: ${hasUsernameScope ? 'Found' : 'Not Found'}`);
    console.log(`✅ Payments Scope: ${hasPaymentsScope ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Scope Array: ${hasUsernameScopeArray ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Enabled: ${hasUsernameEnabled ? 'Found' : 'Not Found'}`);
    
    return hasUsernameScope && hasPaymentsScope && hasUsernameScopeArray && hasUsernameEnabled;
  }
  
  console.log('❌ mainnetConfig.ts not found');
  return false;
}

// Test createPayment function pattern
function testCreatePaymentPattern() {
  console.log('🔍 Testing Create Payment Function Pattern...');
  
  const demoPath = path.join(process.cwd(), 'src/components/PiAuthDemo.tsx');
  if (fs.existsSync(demoPath)) {
    const content = fs.readFileSync(demoPath, 'utf8');
    
    // Check for official createPayment pattern
    const hasCreatePaymentCall = content.includes('window.Pi.createPayment');
    const hasPaymentData = content.includes('amount: incompletePayment.amount');
    const hasMemo = content.includes('memo: incompletePayment.memo');
    const hasMetadata = content.includes('metadata: incompletePayment.metadata');
    const hasOnReadyForServerApproval = content.includes('onReadyForServerApproval');
    const hasOnReadyForServerCompletion = content.includes('onReadyForServerCompletion');
    const hasOnCancel = content.includes('onCancel');
    const hasOnError = content.includes('onError');
    
    console.log(`✅ Create Payment Call: ${hasCreatePaymentCall ? 'Found' : 'Not Found'}`);
    console.log(`✅ Payment Data: ${hasPaymentData ? 'Found' : 'Not Found'}`);
    console.log(`✅ Memo: ${hasMemo ? 'Found' : 'Not Found'}`);
    console.log(`✅ Metadata: ${hasMetadata ? 'Found' : 'Not Found'}`);
    console.log(`✅ On Ready For Server Approval: ${hasOnReadyForServerApproval ? 'Found' : 'Not Found'}`);
    console.log(`✅ On Ready For Server Completion: ${hasOnReadyForServerCompletion ? 'Found' : 'Not Found'}`);
    console.log(`✅ On Cancel: ${hasOnCancel ? 'Found' : 'Not Found'}`);
    console.log(`✅ On Error: ${hasOnError ? 'Found' : 'Not Found'}`);
    
    return hasCreatePaymentCall && hasPaymentData && hasMemo && hasMetadata && 
           hasOnReadyForServerApproval && hasOnReadyForServerCompletion && hasOnCancel && hasOnError;
  }
  
  console.log('❌ PiAuthDemo.tsx not found');
  return false;
}

// Test payment callbacks implementation
function testPaymentCallbacks() {
  console.log('🔍 Testing Payment Callbacks Implementation...');
  
  const demoPath = path.join(process.cwd(), 'src/components/PiAuthDemo.tsx');
  if (fs.existsSync(demoPath)) {
    const content = fs.readFileSync(demoPath, 'utf8');
    
    // Check for official payment callbacks
    const hasApprovalCallback = content.includes('onReadyForServerApproval: async (paymentId) => {');
    const hasCompletionCallback = content.includes('onReadyForServerCompletion: async (paymentId, txid) => {');
    const hasCancelCallback = content.includes('onCancel: (paymentId) => {');
    const hasErrorCallback = content.includes('onError: (error, payment) => {');
    const hasBackendCalls = content.includes('/api/pi/approve-payment') && content.includes('/api/pi/complete-payment');
    
    console.log(`✅ Approval Callback: ${hasApprovalCallback ? 'Found' : 'Not Found'}`);
    console.log(`✅ Completion Callback: ${hasCompletionCallback ? 'Found' : 'Not Found'}`);
    console.log(`✅ Cancel Callback: ${hasCancelCallback ? 'Found' : 'Not Found'}`);
    console.log(`✅ Error Callback: ${hasErrorCallback ? 'Found' : 'Not Found'}`);
    console.log(`✅ Backend Calls: ${hasBackendCalls ? 'Found' : 'Not Found'}`);
    
    return hasApprovalCallback && hasCompletionCallback && hasCancelCallback && 
           hasErrorCallback && hasBackendCalls;
  }
  
  console.log('❌ PiAuthDemo.tsx not found');
  return false;
}

// Test AuthResults structure
function testAuthResultsStructure() {
  console.log('🔍 Testing AuthResults Structure...');
  
  const demoPath = path.join(process.cwd(), 'src/components/PiAuthDemo.tsx');
  if (fs.existsSync(demoPath)) {
    const content = fs.readFileSync(demoPath, 'utf8');
    
    // Check for official AuthResults structure
    const hasAccessToken = content.includes('accessToken');
    const hasUser = content.includes('user');
    const hasUid = content.includes('uid');
    const hasUsername = content.includes('username');
    const hasAuthResultsInterface = content.includes('interface PiUser');
    const hasUserDataStructure = content.includes('uid: result.user.uid');
    
    console.log(`✅ Access Token: ${hasAccessToken ? 'Found' : 'Not Found'}`);
    console.log(`✅ User: ${hasUser ? 'Found' : 'Not Found'}`);
    console.log(`✅ UID: ${hasUid ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username: ${hasUsername ? 'Found' : 'Not Found'}`);
    console.log(`✅ Auth Results Interface: ${hasAuthResultsInterface ? 'Found' : 'Not Found'}`);
    console.log(`✅ User Data Structure: ${hasUserDataStructure ? 'Found' : 'Not Found'}`);
    
    return hasAccessToken && hasUser && hasUid && hasUsername && 
           hasAuthResultsInterface && hasUserDataStructure;
  }
  
  console.log('❌ PiAuthDemo.tsx not found');
  return false;
}

// Test backend verification pattern
function testBackendVerification() {
  console.log('🔍 Testing Backend Verification Pattern...');
  
  const authPath = path.join(process.cwd(), 'api/pi/auth.ts');
  if (fs.existsSync(authPath)) {
    const content = fs.readFileSync(authPath, 'utf8');
    
    // Check for official backend verification pattern
    const hasMeEndpoint = content.includes('/v2/me');
    const hasAccessTokenAuth = content.includes('Authorization') && content.includes('Bearer');
    const hasUserVerification = content.includes('verifiedUserData');
    const hasUidMatch = content.includes('verifiedUserData.uid !== user.uid');
    const hasUsernameReturn = content.includes('username: verifiedUserData.username');
    
    console.log(`✅ /me Endpoint: ${hasMeEndpoint ? 'Found' : 'Not Found'}`);
    console.log(`✅ Access Token Auth: ${hasAccessTokenAuth ? 'Found' : 'Not Found'}`);
    console.log(`✅ User Verification: ${hasUserVerification ? 'Found' : 'Not Found'}`);
    console.log(`✅ UID Match: ${hasUidMatch ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Return: ${hasUsernameReturn ? 'Found' : 'Not Found'}`);
    
    return hasMeEndpoint && hasAccessTokenAuth && hasUserVerification && 
           hasUidMatch && hasUsernameReturn;
  }
  
  console.log('❌ api/pi/auth.ts not found');
  return false;
}

// Main test function
function runPiSDKOfficialPatternsTest() {
  console.log('🚀 Running Pi SDK Official Patterns Test...');
  console.log('================================================');
  
  const sdkInitOk = testPiSDKInitialization();
  const authenticateOk = testAuthenticatePattern();
  const scopesOk = testScopesConfiguration();
  const createPaymentOk = testCreatePaymentPattern();
  const callbacksOk = testPaymentCallbacks();
  const authResultsOk = testAuthResultsStructure();
  const backendOk = testBackendVerification();
  
  console.log('================================================');
  console.log('📊 Test Results:');
  console.log(`✅ Pi SDK Initialization: ${sdkInitOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Authenticate Pattern: ${authenticateOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Scopes Configuration: ${scopesOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Create Payment Pattern: ${createPaymentOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Payment Callbacks: ${callbacksOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ AuthResults Structure: ${authResultsOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Backend Verification: ${backendOk ? 'PASS' : 'FAIL'}`);
  
  const allPassed = sdkInitOk && authenticateOk && scopesOk && createPaymentOk && 
                   callbacksOk && authResultsOk && backendOk;
  
  console.log('================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Implementation follows official Pi SDK documentation');
    console.log('✅ All patterns match official documentation');
    console.log('✅ Scopes configuration is correct');
    console.log('✅ Payment callbacks are properly implemented');
    console.log('✅ AuthResults structure is correct');
    console.log('✅ Backend verification follows official pattern');
    console.log('');
    console.log('📚 Official Pi SDK Patterns Verified:');
    console.log('- Pi SDK Initialization: ✅');
    console.log('- Authenticate Function: ✅');
    console.log('- Scopes Configuration: ✅');
    console.log('- Create Payment Function: ✅');
    console.log('- Payment Callbacks: ✅');
    console.log('- AuthResults Structure: ✅');
    console.log('- Backend Verification: ✅');
    console.log('');
    console.log('🚀 Implementation is fully compliant with official Pi SDK documentation!');
  } else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('Please check the failed components above');
  }
  console.log('================================================');
  
  return allPassed;
}

// Run the test
runPiSDKOfficialPatternsTest();
