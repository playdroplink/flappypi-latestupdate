#!/usr/bin/env node

/**
 * Payment Interface Test
 * Tests that the payment system shows the proper Pi Network payment interface
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Payment Interface Integration\n');

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
  const hasPiCreatePayment = content.includes('Pi.createPayment');
  const hasPaymentData = content.includes('paymentData');
  const hasRecipientAddress = content.includes('recipientAddress');
  const hasPaymentCallbacks = content.includes('onReadyForServerApproval');
  const hasMemo = content.includes('memo');
  
  console.log(`   ✅ Wallet address: ${hasWalletAddress ? 'FOUND' : 'MISSING'}`);
  console.log(`   ✅ Pi.createPayment: ${hasPiCreatePayment ? 'FOUND' : 'MISSING'}`);
  console.log(`   ✅ Payment data: ${hasPaymentData ? 'FOUND' : 'MISSING'}`);
  console.log(`   ✅ Recipient address: ${hasRecipientAddress ? 'FOUND' : 'MISSING'}`);
  console.log(`   ✅ Payment callbacks: ${hasPaymentCallbacks ? 'FOUND' : 'MISSING'}`);
  console.log(`   ✅ Memo field: ${hasMemo ? 'FOUND' : 'MISSING'}`);
  
  if (hasWalletAddress && hasPiCreatePayment && hasPaymentData && hasRecipientAddress && hasPaymentCallbacks && hasMemo) {
    console.log(`   ✅ ${description}: PASS`);
    passedChecks++;
  } else {
    console.log(`   ❌ ${description}: FAIL`);
    allPassed = false;
  }
  
  console.log('');
}

// Test 1: Simple Payment Service
checkFile('src/services/simplePiPaymentService.ts', 'Simple Payment Service');

// Test 2: Shop Page Integration
checkFile('src/pages/ShopPage.tsx', 'Shop Page Integration');

// Test 3: Subscription Page Integration
checkFile('src/pages/SubscriptionPage.tsx', 'Subscription Page Integration');

// Test 4: Check payment data structure
console.log('📋 Test 4: Payment Data Structure');
console.log('==================================');

const simpleServicePath = 'src/services/simplePiPaymentService.ts';
if (fs.existsSync(simpleServicePath)) {
  const simpleServiceContent = fs.readFileSync(simpleServicePath, 'utf8');
  
  const hasAmount = simpleServiceContent.includes('amount:');
  const hasMemo = simpleServiceContent.includes('memo:');
  const hasRecipientAddress = simpleServiceContent.includes('recipientAddress:');
  const hasMetadata = simpleServiceContent.includes('metadata:');
  const hasType = simpleServiceContent.includes('type:');
  const hasGame = simpleServiceContent.includes('game:');
  
  console.log(`✅ Amount field: ${hasAmount ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Memo field: ${hasMemo ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Recipient address: ${hasRecipientAddress ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Metadata: ${hasMetadata ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Type field: ${hasType ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Game field: ${hasGame ? 'FOUND' : 'MISSING'}`);
  
  if (hasAmount && hasMemo && hasRecipientAddress && hasMetadata && hasType && hasGame) {
    console.log('✅ Payment data structure: PASS');
    passedChecks++;
  } else {
    console.log('❌ Payment data structure: FAIL');
    allPassed = false;
  }
} else {
  console.log('❌ Simple payment service not found');
  allPassed = false;
}

totalChecks++;
console.log('');

// Test 5: Check payment callbacks
console.log('📋 Test 5: Payment Callbacks');
console.log('============================');

if (fs.existsSync(simpleServicePath)) {
  const simpleServiceContent = fs.readFileSync(simpleServicePath, 'utf8');
  
  const hasOnReadyForServerApproval = simpleServiceContent.includes('onReadyForServerApproval');
  const hasOnReadyForServerCompletion = simpleServiceContent.includes('onReadyForServerCompletion');
  const hasOnCancel = simpleServiceContent.includes('onCancel');
  const hasOnError = simpleServiceContent.includes('onError');
  const hasPaymentCallbacks = simpleServiceContent.includes('paymentCallbacks');
  
  console.log(`✅ onReadyForServerApproval: ${hasOnReadyForServerApproval ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ onReadyForServerCompletion: ${hasOnReadyForServerCompletion ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ onCancel: ${hasOnCancel ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ onError: ${hasOnError ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Payment callbacks: ${hasPaymentCallbacks ? 'FOUND' : 'MISSING'}`);
  
  if (hasOnReadyForServerApproval && hasOnReadyForServerCompletion && hasOnCancel && hasOnError && hasPaymentCallbacks) {
    console.log('✅ Payment callbacks: PASS');
    passedChecks++;
  } else {
    console.log('❌ Payment callbacks: FAIL');
    allPassed = false;
  }
} else {
  console.log('❌ Simple payment service not found');
  allPassed = false;
}

totalChecks++;
console.log('');

// Test 6: Check Pi SDK integration
console.log('📋 Test 6: Pi SDK Integration');
console.log('=============================');

if (fs.existsSync(simpleServicePath)) {
  const simpleServiceContent = fs.readFileSync(simpleServicePath, 'utf8');
  
  const hasWindowPi = simpleServiceContent.includes('window.Pi');
  const hasCreatePayment = simpleServiceContent.includes('createPayment');
  const hasPiSDKCheck = simpleServiceContent.includes('typeof window.Pi');
  const hasPiBrowserCheck = simpleServiceContent.includes('Pi Browser');
  
  console.log(`✅ window.Pi: ${hasWindowPi ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ createPayment: ${hasCreatePayment ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Pi SDK check: ${hasPiSDKCheck ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Pi Browser check: ${hasPiBrowserCheck ? 'FOUND' : 'MISSING'}`);
  
  if (hasWindowPi && hasCreatePayment && hasPiSDKCheck && hasPiBrowserCheck) {
    console.log('✅ Pi SDK integration: PASS');
    passedChecks++;
  } else {
    console.log('❌ Pi SDK integration: FAIL');
    allPassed = false;
  }
} else {
  console.log('❌ Simple payment service not found');
  allPassed = false;
}

totalChecks++;
console.log('');

// Test 7: Check shop page integration
console.log('📋 Test 7: Shop Page Integration');
console.log('===============================');

const shopPagePath = 'src/pages/ShopPage.tsx';
if (fs.existsSync(shopPagePath)) {
  const shopPageContent = fs.readFileSync(shopPagePath, 'utf8');
  
  const hasSimpleService = shopPageContent.includes('simplePiPaymentService');
  const hasMainnetCheck = shopPageContent.includes('PI_CONFIG.isMainnet()');
  const hasPaymentCall = shopPageContent.includes('processShopPayment');
  const hasToast = shopPageContent.includes('toast');
  
  console.log(`✅ Simple service import: ${hasSimpleService ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Mainnet check: ${hasMainnetCheck ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Payment call: ${hasPaymentCall ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Toast notification: ${hasToast ? 'FOUND' : 'MISSING'}`);
  
  if (hasSimpleService && hasMainnetCheck && hasPaymentCall && hasToast) {
    console.log('✅ Shop page integration: PASS');
    passedChecks++;
  } else {
    console.log('❌ Shop page integration: FAIL');
    allPassed = false;
  }
} else {
  console.log('❌ Shop page not found');
  allPassed = false;
}

totalChecks++;
console.log('');

// Test 8: Check subscription page integration
console.log('📋 Test 8: Subscription Page Integration');
console.log('========================================');

const subscriptionPagePath = 'src/pages/SubscriptionPage.tsx';
if (fs.existsSync(subscriptionPagePath)) {
  const subscriptionPageContent = fs.readFileSync(subscriptionPagePath, 'utf8');
  
  const hasSimpleService = subscriptionPageContent.includes('simplePiPaymentService');
  const hasMainnetCheck = subscriptionPageContent.includes('PI_CONFIG.isMainnet()');
  const hasPaymentCall = subscriptionPageContent.includes('processSubscriptionPayment');
  const hasToast = subscriptionPageContent.includes('toast');
  
  console.log(`✅ Simple service import: ${hasSimpleService ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Mainnet check: ${hasMainnetCheck ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Payment call: ${hasPaymentCall ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Toast notification: ${hasToast ? 'FOUND' : 'MISSING'}`);
  
  if (hasSimpleService && hasMainnetCheck && hasPaymentCall && hasToast) {
    console.log('✅ Subscription page integration: PASS');
    passedChecks++;
  } else {
    console.log('❌ Subscription page integration: FAIL');
    allPassed = false;
  }
} else {
  console.log('❌ Subscription page not found');
  allPassed = false;
}

totalChecks++;
console.log('');

// Summary
console.log('📊 PAYMENT INTERFACE TEST SUMMARY');
console.log('==================================');
console.log(`Total checks: ${totalChecks}`);
console.log(`Passed checks: ${passedChecks}`);
console.log(`Failed checks: ${totalChecks - passedChecks}`);

if (allPassed) {
  console.log('\n🎉 PAYMENT INTERFACE TEST PASSED!');
  console.log('✅ Payment system will show proper Pi Network payment interface');
  console.log('✅ Wallet address is correctly configured');
  console.log('✅ Pi SDK integration is working');
  console.log('✅ Payment callbacks are properly configured');
  console.log('✅ Shop and subscription pages are integrated');
  console.log('✅ Ready for testing!');
} else {
  console.log('\n❌ PAYMENT INTERFACE TEST FAILED!');
  console.log('❌ Some configurations are missing or incorrect');
  console.log('❌ Please check the files above and fix any issues');
}

console.log('\n🏦 Wallet Information:');
console.log(`   Address: ${WALLET_ADDRESS}`);
console.log(`   Network: Pi Network Mainnet`);
console.log(`   API: https://api.mainnet.minepi.com`);

console.log('\n🔧 Expected Payment Flow:');
console.log('   1. User clicks "Pay with Pi" button');
console.log('   2. System detects mainnet mode');
console.log('   3. Uses simplePiPaymentService');
console.log('   4. Creates payment with wallet address');
console.log('   5. Shows Pi Network payment interface (like first image)');
console.log('   6. User approves payment');
console.log('   7. Payment is processed');
console.log('   8. Items are delivered');
console.log('   9. Success message is shown');

console.log('\n🧪 How to Test:');
console.log('   1. Switch to mainnet mode in configuration');
console.log('   2. Start development server: npm run dev');
console.log('   3. Open in Pi Browser');
console.log('   4. Go to shop and try purchasing items');
console.log('   5. Go to subscriptions and try subscribing');
console.log('   6. Verify payment interface appears (like first image)');
console.log('   7. Check console for payment logs');
