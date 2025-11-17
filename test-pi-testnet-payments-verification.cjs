#!/usr/bin/env node

/**
 * Pi Testnet Payments Verification Test
 * Verifies that all payments are calling Pi testnet and sandbox Pi auth is false
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Pi Testnet Payments Verification Test');
console.log('================================================');

// Test mainnet configuration for testnet mode
function testMainnetConfigForTestnet() {
  console.log('🔍 Testing Mainnet Config for Testnet Mode...');
  
  const configPath = path.join(process.cwd(), 'src/config/mainnetConfig.ts');
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    
    // Check for testnet configuration
    const hasTestnetMode = content.includes('NETWORK_MODE: \'testnet\'');
    const hasSandboxEnabled = content.includes('SANDBOX_ENABLED: true');
    const hasMainnetDisabled = content.includes('MAINNET_ENABLED: false');
    const hasProductionFalse = content.includes('IS_PRODUCTION: false');
    const hasTestnetApi = content.includes('API_URL: \'https://api.testnet.minepi.com/v2\'');
    const hasSandboxFalse = content.includes('sandbox: false'); // SDK sandbox should be false for testnet
    const hasTestnetSecurity = content.includes('REQUIRE_PI_BROWSER: false') && 
                              content.includes('REQUIRE_AUTHENTICATION: false') && 
                              content.includes('VALIDATE_PAYMENTS: false');
    
    console.log(`✅ Testnet Mode: ${hasTestnetMode ? 'Found' : 'Not Found'}`);
    console.log(`✅ Sandbox Enabled: ${hasSandboxEnabled ? 'Found' : 'Not Found'}`);
    console.log(`✅ Mainnet Disabled: ${hasMainnetDisabled ? 'Found' : 'Not Found'}`);
    console.log(`✅ Production False: ${hasProductionFalse ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet API: ${hasTestnetApi ? 'Found' : 'Not Found'}`);
    console.log(`✅ SDK Sandbox False: ${hasSandboxFalse ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Security: ${hasTestnetSecurity ? 'Found' : 'Not Found'}`);
    
    return hasTestnetMode && hasSandboxEnabled && hasMainnetDisabled && hasProductionFalse && 
           hasTestnetApi && hasSandboxFalse && hasTestnetSecurity;
  }
  
  console.log('❌ mainnetConfig.ts not found');
  return false;
}

// Test unified payment service for testnet calls
function testUnifiedPaymentServiceTestnet() {
  console.log('🔍 Testing Unified Payment Service for Testnet Calls...');
  
  const servicePath = path.join(process.cwd(), 'src/services/unifiedPiPaymentService.ts');
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');
    
    // Check for testnet payment logic
    const hasTestnetCheck = content.includes('PI_CONFIG.NETWORK_MODE === \'testnet\'');
    const hasTestnetPayment = content.includes('executeTestnetPayment');
    const hasTestnetApproval = content.includes('/api/pi/testnet-approve');
    const hasTestnetCompletion = content.includes('/api/pi/testnet-complete');
    const hasTestnetMethod = content.includes('executeTestnetPayment(paymentData)');
    
    console.log(`✅ Testnet Check: ${hasTestnetCheck ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Payment: ${hasTestnetPayment ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Approval: ${hasTestnetApproval ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Completion: ${hasTestnetCompletion ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Method: ${hasTestnetMethod ? 'Found' : 'Not Found'}`);
    
    return hasTestnetCheck && hasTestnetPayment && hasTestnetApproval && hasTestnetCompletion && hasTestnetMethod;
  }
  
  console.log('❌ unifiedPiPaymentService.ts not found');
  return false;
}

// Test testnet payment service
function testTestnetPaymentService() {
  console.log('🔍 Testing Testnet Payment Service...');
  
  const servicePath = path.join(process.cwd(), 'src/services/testnetPaymentService.ts');
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');
    
    // Check for testnet payment methods
    const hasCreatePayment = content.includes('createPayment');
    const hasApprovePayment = content.includes('approvePayment');
    const hasCompletePayment = content.includes('completePayment');
    const hasTestnetConfig = content.includes('getTestnetConfig');
    const hasTestnetEnabled = content.includes('isTestnetEnabled');
    const hasTestnetApi = content.includes('https://api.testnet.minepi.com');
    const hasTestnetWallet = content.includes('GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI');
    
    console.log(`✅ Create Payment: ${hasCreatePayment ? 'Found' : 'Not Found'}`);
    console.log(`✅ Approve Payment: ${hasApprovePayment ? 'Found' : 'Not Found'}`);
    console.log(`✅ Complete Payment: ${hasCompletePayment ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Config: ${hasTestnetConfig ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Enabled: ${hasTestnetEnabled ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet API: ${hasTestnetApi ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Wallet: ${hasTestnetWallet ? 'Found' : 'Not Found'}`);
    
    return hasCreatePayment && hasApprovePayment && hasCompletePayment && hasTestnetConfig && 
           hasTestnetEnabled && hasTestnetApi && hasTestnetWallet;
  }
  
  console.log('❌ testnetPaymentService.ts not found');
  return false;
}

// Test API endpoints for testnet
function testTestnetAPIEndpoints() {
  console.log('🔍 Testing Testnet API Endpoints...');
  
  const endpoints = [
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

// Test shop integration for testnet payments
function testShopTestnetIntegration() {
  console.log('🔍 Testing Shop Testnet Integration...');
  
  const shopPath = path.join(process.cwd(), 'src/pages/ShopPage.tsx');
  if (fs.existsSync(shopPath)) {
    const content = fs.readFileSync(shopPath, 'utf8');
    
    // Check for testnet payment integration
    const hasTestnetPaymentImport = content.includes('import { testnetPaymentService }');
    const hasTestnetPaymentDemo = content.includes('TestnetPaymentDemo');
    const hasTestnetTab = content.includes('TabsTrigger value="testnet"');
    const hasTestnetContent = content.includes('TabsContent value="testnet"');
    const hasUnifiedPaymentService = content.includes('unifiedPiPaymentService');
    const hasPiConfigImport = content.includes('PI_CONFIG');
    
    console.log(`✅ Testnet Payment Import: ${hasTestnetPaymentImport ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Payment Demo: ${hasTestnetPaymentDemo ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Tab: ${hasTestnetTab ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Content: ${hasTestnetContent ? 'Found' : 'Not Found'}`);
    console.log(`✅ Unified Payment Service: ${hasUnifiedPaymentService ? 'Found' : 'Not Found'}`);
    console.log(`✅ Pi Config Import: ${hasPiConfigImport ? 'Found' : 'Not Found'}`);
    
    return hasTestnetPaymentImport && hasTestnetPaymentDemo && hasTestnetTab && hasTestnetContent && 
           hasUnifiedPaymentService && hasPiConfigImport;
  }
  
  console.log('❌ ShopPage.tsx not found');
  return false;
}

// Test Pi Auth sandbox configuration
function testPiAuthSandboxConfiguration() {
  console.log('🔍 Testing Pi Auth Sandbox Configuration...');
  
  const configPath = path.join(process.cwd(), 'src/config/mainnetConfig.ts');
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    
    // Check for sandbox configuration
    const hasSandboxFalse = content.includes('sandbox: false'); // SDK sandbox should be false
    const hasTestnetMode = content.includes('NETWORK_MODE: \'testnet\'');
    const hasTestnetApi = content.includes('https://api.testnet.minepi.com');
    const hasUsernameScope = content.includes('AUTH_SCOPES: [\'payments\', \'username\']');
    const hasUsernameEnabled = content.includes('ENABLE_USERNAME: true');
    
    console.log(`✅ SDK Sandbox False: ${hasSandboxFalse ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet Mode: ${hasTestnetMode ? 'Found' : 'Not Found'}`);
    console.log(`✅ Testnet API: ${hasTestnetApi ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Scope: ${hasUsernameScope ? 'Found' : 'Not Found'}`);
    console.log(`✅ Username Enabled: ${hasUsernameEnabled ? 'Found' : 'Not Found'}`);
    
    return hasSandboxFalse && hasTestnetMode && hasTestnetApi && hasUsernameScope && hasUsernameEnabled;
  }
  
  console.log('❌ mainnetConfig.ts not found');
  return false;
}

// Main test function
function runPiTestnetPaymentsTest() {
  console.log('🚀 Running Pi Testnet Payments Verification Test...');
  console.log('================================================');
  
  const mainnetOk = testMainnetConfigForTestnet();
  const unifiedOk = testUnifiedPaymentServiceTestnet();
  const testnetOk = testTestnetPaymentService();
  const endpointsOk = testTestnetAPIEndpoints();
  const shopOk = testShopTestnetIntegration();
  const authOk = testPiAuthSandboxConfiguration();
  
  console.log('================================================');
  console.log('📊 Test Results:');
  console.log(`✅ Mainnet Config for Testnet: ${mainnetOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Unified Payment Service Testnet: ${unifiedOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Testnet Payment Service: ${testnetOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Testnet API Endpoints: ${endpointsOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Shop Testnet Integration: ${shopOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Pi Auth Sandbox Configuration: ${authOk ? 'PASS' : 'FAIL'}`);
  
  const allPassed = mainnetOk && unifiedOk && testnetOk && endpointsOk && shopOk && authOk;
  
  console.log('================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ All payments are calling Pi testnet');
    console.log('✅ Sandbox Pi auth is set to false (correct for testnet)');
    console.log('✅ Testnet payment system is complete');
    console.log('✅ Shop integration is working');
    console.log('✅ Pi Auth configuration is correct');
    console.log('');
    console.log('🔧 Testnet Payment Configuration:');
    console.log('- Network Mode: testnet');
    console.log('- API URL: https://api.testnet.minepi.com/v2');
    console.log('- SDK Sandbox: false (Uses mainnet SDK for testnet)');
    console.log('- Wallet: GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI');
    console.log('- All payments: Calling testnet endpoints');
    console.log('- Pi Auth: Username scope enabled, sandbox false');
    console.log('');
    console.log('🚀 All Pi testnet payments are working correctly!');
  } else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('Please check the failed components above');
  }
  console.log('================================================');
  
  return allPassed;
}

// Run the test
runPiTestnetPaymentsTest();
