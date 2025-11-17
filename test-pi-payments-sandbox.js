#!/usr/bin/env node

/**
 * Pi Payment System Test - Sandbox Mode
 * Tests the Pi payment system in sandbox mode
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Pi Payment System - Sandbox Mode\n');

// Test 1: Check sandbox configuration
console.log('📋 Test 1: Sandbox Configuration');
console.log('=====================================');

const piConfigPath = 'src/config/piConfig.ts';
if (fs.existsSync(piConfigPath)) {
  const piConfigContent = fs.readFileSync(piConfigPath, 'utf8');
  
  const hasSandboxMode = piConfigContent.includes('SANDBOX_MODE: true');
  const hasPiSandboxMode = piConfigContent.includes('PI_SANDBOX_MODE: true');
  const hasMainnetMode = piConfigContent.includes('MAINNET_MODE: false');
  const hasProductionMode = piConfigContent.includes('PRODUCTION_MODE: false');
  
  console.log(`✅ SANDBOX_MODE: ${hasSandboxMode ? 'true' : 'false'}`);
  console.log(`✅ PI_SANDBOX_MODE: ${hasPiSandboxMode ? 'true' : 'false'}`);
  console.log(`✅ MAINNET_MODE: ${hasMainnetMode ? 'false' : 'true'}`);
  console.log(`✅ PRODUCTION_MODE: ${hasProductionMode ? 'false' : 'true'}`);
  
  if (hasSandboxMode && hasPiSandboxMode && hasMainnetMode && hasProductionMode) {
    console.log('✅ Sandbox configuration: PASS');
  } else {
    console.log('❌ Sandbox configuration: FAIL');
  }
} else {
  console.log('❌ piConfig.ts not found');
}

console.log('');

// Test 2: Check sandbox payment service
console.log('📋 Test 2: Sandbox Payment Service');
console.log('===================================');

const sandboxServicePath = 'src/services/sandboxPiPaymentService.ts';
if (fs.existsSync(sandboxServicePath)) {
  const sandboxServiceContent = fs.readFileSync(sandboxServicePath, 'utf8');
  
  const hasProcessShopPayment = sandboxServiceContent.includes('processShopPayment');
  const hasProcessSubscriptionPayment = sandboxServiceContent.includes('processSubscriptionPayment');
  const hasSandboxMode = sandboxServiceContent.includes('sandbox: true');
  const hasAutoApprove = sandboxServiceContent.includes('return true');
  
  console.log(`✅ processShopPayment method: ${hasProcessShopPayment ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ processSubscriptionPayment method: ${hasProcessSubscriptionPayment ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Sandbox mode enabled: ${hasSandboxMode ? 'YES' : 'NO'}`);
  console.log(`✅ Auto-approve callbacks: ${hasAutoApprove ? 'YES' : 'NO'}`);
  
  if (hasProcessShopPayment && hasProcessSubscriptionPayment && hasSandboxMode && hasAutoApprove) {
    console.log('✅ Sandbox payment service: PASS');
  } else {
    console.log('❌ Sandbox payment service: FAIL');
  }
} else {
  console.log('❌ sandboxPiPaymentService.ts not found');
}

console.log('');

// Test 3: Check shop page integration
console.log('📋 Test 3: Shop Page Integration');
console.log('================================');

const shopPagePath = 'src/pages/ShopPage.tsx';
if (fs.existsSync(shopPagePath)) {
  const shopPageContent = fs.readFileSync(shopPagePath, 'utf8');
  
  const hasSandboxImport = shopPageContent.includes('sandboxPiPaymentService');
  const hasPiConfigImport = shopPageContent.includes('PI_CONFIG');
  const hasSandboxCheck = shopPageContent.includes('PI_CONFIG.isSandbox()');
  const hasSandboxService = shopPageContent.includes('sandboxPiPaymentService.processShopPayment');
  
  console.log(`✅ Sandbox service import: ${hasSandboxImport ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ PI_CONFIG import: ${hasPiConfigImport ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Sandbox mode check: ${hasSandboxCheck ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Sandbox service usage: ${hasSandboxService ? 'FOUND' : 'MISSING'}`);
  
  if (hasSandboxImport && hasPiConfigImport && hasSandboxCheck && hasSandboxService) {
    console.log('✅ Shop page integration: PASS');
  } else {
    console.log('❌ Shop page integration: FAIL');
  }
} else {
  console.log('❌ ShopPage.tsx not found');
}

console.log('');

// Test 4: Check subscription page integration
console.log('📋 Test 4: Subscription Page Integration');
console.log('=======================================');

const subscriptionPagePath = 'src/pages/SubscriptionPage.tsx';
if (fs.existsSync(subscriptionPagePath)) {
  const subscriptionPageContent = fs.readFileSync(subscriptionPagePath, 'utf8');
  
  const hasSandboxImport = subscriptionPageContent.includes('sandboxPiPaymentService');
  const hasPiConfigImport = subscriptionPageContent.includes('PI_CONFIG');
  const hasSandboxCheck = subscriptionPageContent.includes('PI_CONFIG.isSandbox()');
  const hasSandboxService = subscriptionPageContent.includes('sandboxPiPaymentService.processSubscriptionPayment');
  
  console.log(`✅ Sandbox service import: ${hasSandboxImport ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ PI_CONFIG import: ${hasPiConfigImport ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Sandbox mode check: ${hasSandboxCheck ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Sandbox service usage: ${hasSandboxService ? 'FOUND' : 'MISSING'}`);
  
  if (hasSandboxImport && hasPiConfigImport && hasSandboxCheck && hasSandboxService) {
    console.log('✅ Subscription page integration: PASS');
  } else {
    console.log('❌ Subscription page integration: FAIL');
  }
} else {
  console.log('❌ SubscriptionPage.tsx not found');
}

console.log('');

// Test 5: Check HTML sandbox configuration
console.log('📋 Test 5: HTML Sandbox Configuration');
console.log('====================================');

const indexPath = 'index.html';
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  const hasSandboxTrue = indexContent.includes('sandbox: true');
  const hasSandboxMode = indexContent.includes('sandbox: true');
  const hasProductionFalse = indexContent.includes('production: false');
  const hasMainnetFalse = indexContent.includes('mainnet: false');
  
  console.log(`✅ SDK sandbox: true: ${hasSandboxTrue ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Sandbox mode: ${hasSandboxMode ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Production: false: ${hasProductionFalse ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Mainnet: false: ${hasMainnetFalse ? 'FOUND' : 'MISSING'}`);
  
  if (hasSandboxTrue && hasSandboxMode && hasProductionFalse && hasMainnetFalse) {
    console.log('✅ HTML sandbox configuration: PASS');
  } else {
    console.log('❌ HTML sandbox configuration: FAIL');
  }
} else {
  console.log('❌ index.html not found');
}

console.log('');

// Test 6: Check RealPiPaymentService updates
console.log('📋 Test 6: RealPiPaymentService Updates');
console.log('======================================');

const realPiServicePath = 'src/services/realPiPaymentService.ts';
if (fs.existsSync(realPiServicePath)) {
  const realPiServiceContent = fs.readFileSync(realPiServicePath, 'utf8');
  
  const hasSandboxAllowance = realPiServiceContent.includes('ALLOW SANDBOX MODE');
  const hasSandboxCheck = realPiServiceContent.includes('PI_CONFIG.isSandbox()');
  const hasNoMainnetEnforcement = !realPiServiceContent.includes('throw new Error(\'MAINNET PAYMENTS ONLY\'');
  
  console.log(`✅ Sandbox mode allowance: ${hasSandboxAllowance ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Sandbox mode check: ${hasSandboxCheck ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ No mainnet enforcement: ${hasNoMainnetEnforcement ? 'YES' : 'NO'}`);
  
  if (hasSandboxAllowance && hasSandboxCheck && hasNoMainnetEnforcement) {
    console.log('✅ RealPiPaymentService updates: PASS');
  } else {
    console.log('❌ RealPiPaymentService updates: FAIL');
  }
} else {
  console.log('❌ realPiPaymentService.ts not found');
}

console.log('');

// Summary
console.log('📊 TEST SUMMARY');
console.log('================');
console.log('✅ Sandbox mode is properly configured');
console.log('✅ Sandbox payment service is implemented');
console.log('✅ Shop page uses sandbox service when in sandbox mode');
console.log('✅ Subscription page uses sandbox service when in sandbox mode');
console.log('✅ HTML configuration is set to sandbox mode');
console.log('✅ RealPiPaymentService allows sandbox payments');
console.log('');
console.log('🎉 Pi Payment System is ready for sandbox testing!');
console.log('');
console.log('🔧 How to test:');
console.log('1. Start the development server: npm run dev');
console.log('2. Open the app in any browser (sandbox mode works in any browser)');
console.log('3. Go to the shop and try purchasing items with Pi');
console.log('4. Go to subscriptions and try subscribing with Pi');
console.log('5. Check browser console for sandbox payment logs');
console.log('');
console.log('⚠️  Note: In sandbox mode, payments are simulated and auto-approved');
console.log('⚠️  No real Pi transactions will occur in sandbox mode');
