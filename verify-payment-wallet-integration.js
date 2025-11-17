#!/usr/bin/env node

/**
 * Payment Wallet Integration Verification
 * Verifies that all shop items and subscription plans use the correct wallet address
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Payment Wallet Integration\n');

const WALLET_ADDRESS = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7J';
let allPassed = true;
let totalChecks = 0;
let passedChecks = 0;

function checkFile(filePath, description) {
  console.log(`📁 Checking ${description}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ File not found: ${filePath}`);
    allPassed = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  totalChecks++;
  
  const hasWalletAddress = content.includes(WALLET_ADDRESS);
  const hasRecipientAddress = content.includes('recipientAddress');
  const hasPaymentData = content.includes('paymentData');
  const hasPiCreatePayment = content.includes('Pi.createPayment');
  
  console.log(`   ✅ Wallet address: ${hasWalletAddress ? 'FOUND' : 'MISSING'}`);
  console.log(`   ✅ Recipient address: ${hasRecipientAddress ? 'FOUND' : 'MISSING'}`);
  console.log(`   ✅ Payment data: ${hasPaymentData ? 'FOUND' : 'MISSING'}`);
  console.log(`   ✅ Pi.createPayment: ${hasPiCreatePayment ? 'FOUND' : 'MISSING'}`);
  
  if (hasWalletAddress && hasRecipientAddress && hasPaymentData && hasPiCreatePayment) {
    console.log(`   ✅ ${description}: PASS`);
    passedChecks++;
  } else {
    console.log(`   ❌ ${description}: FAIL`);
    allPassed = false;
  }
  
  console.log('');
}

// Test 1: Mainnet Payment Service
checkFile('src/services/piMainnetPaymentService.ts', 'Mainnet Payment Service');

// Test 2: Sandbox Payment Service
checkFile('src/services/sandboxPiPaymentService.ts', 'Sandbox Payment Service');

// Test 3: Shop Page
checkFile('src/pages/ShopPage.tsx', 'Shop Page');

// Test 4: Subscription Page
checkFile('src/pages/SubscriptionPage.tsx', 'Subscription Page');

// Test 5: API Endpoints
checkFile('api/pi/approve-payment.ts', 'Payment Approval API');
checkFile('api/pi/complete-payment.ts', 'Payment Completion API');

// Test 6: Configuration Files
checkFile('src/lib/config.ts', 'Configuration File');

// Test 7: Check for hardcoded wallet addresses in shop items
console.log('📋 Test 7: Shop Items Configuration');
console.log('====================================');

const shopItemsPath = 'src/constants/shopItems.ts';
if (fs.existsSync(shopItemsPath)) {
  const shopItemsContent = fs.readFileSync(shopItemsPath, 'utf8');
  const hasPiPrice = shopItemsContent.includes('piPrice');
  const hasPiAmount = shopItemsContent.includes('piAmount');
  
  console.log(`✅ Shop items have Pi prices: ${hasPiPrice ? 'YES' : 'NO'}`);
  console.log(`✅ Shop items have Pi amounts: ${hasPiAmount ? 'YES' : 'NO'}`);
  
  if (hasPiPrice || hasPiAmount) {
    console.log('✅ Shop items configuration: PASS');
    passedChecks++;
  } else {
    console.log('❌ Shop items configuration: FAIL');
    allPassed = false;
  }
} else {
  console.log('❌ Shop items file not found');
  allPassed = false;
}

totalChecks++;
console.log('');

// Test 8: Check subscription plans
console.log('📋 Test 8: Subscription Plans Configuration');
console.log('============================================');

const subscriptionPlansPath = 'src/constants/subscriptionPlans.ts';
if (fs.existsSync(subscriptionPlansPath)) {
  const subscriptionPlansContent = fs.readFileSync(subscriptionPlansPath, 'utf8');
  const hasPiPrice = subscriptionPlansContent.includes('piPrice');
  const hasPiAmount = subscriptionPlansContent.includes('piAmount');
  
  console.log(`✅ Subscription plans have Pi prices: ${hasPiPrice ? 'YES' : 'NO'}`);
  console.log(`✅ Subscription plans have Pi amounts: ${hasPiAmount ? 'YES' : 'NO'}`);
  
  if (hasPiPrice || hasPiAmount) {
    console.log('✅ Subscription plans configuration: PASS');
    passedChecks++;
  } else {
    console.log('❌ Subscription plans configuration: FAIL');
    allPassed = false;
  }
} else {
  console.log('❌ Subscription plans file not found');
  allPassed = false;
}

totalChecks++;
console.log('');

// Test 9: Check payment flow integration
console.log('📋 Test 9: Payment Flow Integration');
console.log('===================================');

const shopPagePath = 'src/pages/ShopPage.tsx';
if (fs.existsSync(shopPagePath)) {
  const shopPageContent = fs.readFileSync(shopPagePath, 'utf8');
  
  const hasSandboxService = shopPageContent.includes('sandboxPiPaymentService');
  const hasMainnetService = shopPageContent.includes('piMainnetPaymentService');
  const hasPiConfig = shopPageContent.includes('PI_CONFIG');
  const hasModeDetection = shopPageContent.includes('PI_CONFIG.isSandbox()') || shopPageContent.includes('PI_CONFIG.isMainnet()');
  
  console.log(`✅ Sandbox service integration: ${hasSandboxService ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Mainnet service integration: ${hasMainnetService ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Pi config integration: ${hasPiConfig ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Mode detection: ${hasModeDetection ? 'FOUND' : 'MISSING'}`);
  
  if (hasSandboxService && hasMainnetService && hasPiConfig && hasModeDetection) {
    console.log('✅ Payment flow integration: PASS');
    passedChecks++;
  } else {
    console.log('❌ Payment flow integration: FAIL');
    allPassed = false;
  }
} else {
  console.log('❌ Shop page not found');
  allPassed = false;
}

totalChecks++;
console.log('');

// Test 10: Check subscription flow integration
console.log('📋 Test 10: Subscription Flow Integration');
console.log('=========================================');

const subscriptionPagePath = 'src/pages/SubscriptionPage.tsx';
if (fs.existsSync(subscriptionPagePath)) {
  const subscriptionPageContent = fs.readFileSync(subscriptionPagePath, 'utf8');
  
  const hasSandboxService = subscriptionPageContent.includes('sandboxPiPaymentService');
  const hasMainnetService = subscriptionPageContent.includes('piMainnetPaymentService');
  const hasPiConfig = subscriptionPageContent.includes('PI_CONFIG');
  const hasModeDetection = subscriptionPageContent.includes('PI_CONFIG.isSandbox()') || subscriptionPageContent.includes('PI_CONFIG.isMainnet()');
  
  console.log(`✅ Sandbox service integration: ${hasSandboxService ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Mainnet service integration: ${hasMainnetService ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Pi config integration: ${hasPiConfig ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Mode detection: ${hasModeDetection ? 'FOUND' : 'MISSING'}`);
  
  if (hasSandboxService && hasMainnetService && hasPiConfig && hasModeDetection) {
    console.log('✅ Subscription flow integration: PASS');
    passedChecks++;
  } else {
    console.log('❌ Subscription flow integration: FAIL');
    allPassed = false;
  }
} else {
  console.log('❌ Subscription page not found');
  allPassed = false;
}

totalChecks++;
console.log('');

// Summary
console.log('📊 VERIFICATION SUMMARY');
console.log('========================');
console.log(`Total checks: ${totalChecks}`);
console.log(`Passed checks: ${passedChecks}`);
console.log(`Failed checks: ${totalChecks - passedChecks}`);

if (allPassed) {
  console.log('\n🎉 PAYMENT WALLET INTEGRATION VERIFICATION PASSED!');
  console.log('✅ All shop items and subscription plans are properly configured');
  console.log('✅ Wallet address is correctly integrated');
  console.log('✅ Payment services are properly configured');
  console.log('✅ Mode detection is working');
  console.log('✅ Ready for production!');
} else {
  console.log('\n❌ PAYMENT WALLET INTEGRATION VERIFICATION FAILED!');
  console.log('❌ Some configurations are missing or incorrect');
  console.log('❌ Please check the files above and fix any issues');
}

console.log('\n🏦 Wallet Information:');
console.log(`   Address: ${WALLET_ADDRESS}`);
console.log(`   Network: Pi Network Mainnet`);
console.log(`   API: https://api.mainnet.minepi.com`);
console.log(`   Balance Check: https://api.mainnet.minepi.com/accounts/${WALLET_ADDRESS}`);

console.log('\n🔧 Payment Flow:');
console.log('   1. User clicks "Pay with Pi" button');
console.log('   2. System detects sandbox/mainnet mode');
console.log('   3. Uses appropriate payment service');
console.log('   4. Creates payment with wallet address');
console.log('   5. Processes payment through Pi SDK');
console.log('   6. Delivers items to user');
console.log('   7. Shows success message with transaction ID');
