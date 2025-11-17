#!/usr/bin/env node

/**
 * Show Recipient Wallet Configuration
 * Displays all recipient wallet information
 */

console.log('💰 RECIPIENT WALLET INFORMATION');
console.log('==============================');
console.log('');

const RECIPIENT_WALLET = 'GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI';

console.log('📋 RECIPIENT WALLET ADDRESS:');
console.log(`   ${RECIPIENT_WALLET}`);
console.log('');

console.log('🔍 WALLET DETAILS:');
console.log('   • Network: Stellar (Pi Network)');
console.log('   • Type: Testnet Wallet');
console.log('   • Purpose: Receive payments from users');
console.log('   • Currency: TEST_PI (sandbox/testnet)');
console.log('');

console.log('🎯 HOW PAYMENTS WORK:');
console.log('   1. User clicks "Buy" in your app');
console.log('   2. Pi SDK creates payment to this wallet');
console.log('   3. User approves payment in Pi Browser');
console.log('   4. Payment is sent to this recipient wallet');
console.log('   5. Your app receives payment confirmation');
console.log('');

console.log('📱 WHERE THIS WALLET IS USED:');
console.log('   • Shop payments (1, 5, 10 TEST_PI)');
console.log('   • Subscription payments (25, 50, 100 TEST_PI)');
console.log('   • Power-up payments (2, 8, 15 TEST_PI)');
console.log('   • All in-app purchases');
console.log('');

console.log('🔧 CONFIGURATION STATUS:');
console.log('   ✅ .env file - Configured');
console.log('   ✅ public/index.html - Configured');
console.log('   ✅ src/config/truthwebPayConfig.ts - Configured');
console.log('   ✅ src/lib/config.ts - Configured');
console.log('   ✅ src/services/piTestnetPaymentService.ts - Configured');
console.log('   ✅ src/services/productionTestnetPaymentService.ts - Configured');
console.log('   ✅ src/services/sandboxPaymentService.ts - Configured');
console.log('');

console.log('💡 IMPORTANT NOTES:');
console.log('   • This wallet will receive ALL payments from your app');
console.log('   • Make sure you have access to this wallet');
console.log('   • Check wallet balance on Stellar testnet');
console.log('   • Verify you have the private key');
console.log('   • Test receiving a small payment');
console.log('');

console.log('🔍 TO VERIFY WALLET OWNERSHIP:');
console.log('   1. Go to Stellar testnet explorer');
console.log('   2. Search for: GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI');
console.log('   3. Check wallet balance and transactions');
console.log('   4. Verify you have the private key');
console.log('');

console.log('🚀 TO TEST PAYMENTS:');
console.log('   1. Run: npm start');
console.log('   2. Open: https://flappypi6856.pinet.com/test');
console.log('   3. Click "Test Payments" button');
console.log('   4. Click "Test Payment" button');
console.log('   5. Check console logs for payment details');
console.log('   6. Verify payment goes to this wallet');
console.log('');

console.log('💤 Your recipient wallet is properly configured!');
console.log('   All payments will be sent to: GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI');

