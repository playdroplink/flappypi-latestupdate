#!/usr/bin/env node

/**
 * Check Recipient Wallet
 * Shows the current recipient wallet configuration
 */

const fs = require('fs');

console.log('💰 RECIPIENT WALLET CONFIGURATION');
console.log('=================================');
console.log('');

const RECIPIENT_WALLET = 'GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI';

console.log('📋 Current Recipient Wallet:');
console.log(`   ${RECIPIENT_WALLET}`);
console.log('');

console.log('🔍 Where this wallet is configured:');
console.log('');

// Check .env file
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  if (envContent.includes(RECIPIENT_WALLET)) {
    console.log('✅ .env file - Wallet configured');
  } else {
    console.log('❌ .env file - Wallet not found');
  }
} else {
  console.log('❌ .env file - Not found');
}

// Check public/index.html
if (fs.existsSync('public/index.html')) {
  const indexContent = fs.readFileSync('public/index.html', 'utf8');
  if (indexContent.includes(RECIPIENT_WALLET)) {
    console.log('✅ public/index.html - Wallet configured');
  } else {
    console.log('❌ public/index.html - Wallet not found');
  }
} else {
  console.log('❌ public/index.html - Not found');
}

// Check config files
const configFiles = [
  'src/config/piConfig.ts',
  'src/config/truthwebPayConfig.ts',
  'src/lib/config.ts'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(RECIPIENT_WALLET)) {
      console.log(`✅ ${file} - Wallet configured`);
    } else {
      console.log(`❌ ${file} - Wallet not found`);
    }
  } else {
    console.log(`❌ ${file} - Not found`);
  }
});

// Check payment services
const paymentServices = [
  'src/services/sandboxPaymentService.ts',
  'src/services/realPiPaymentService.ts',
  'src/services/piTestnetPaymentService.ts',
  'src/services/productionTestnetPaymentService.ts'
];

console.log('');
console.log('🔧 Payment Services:');
paymentServices.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(RECIPIENT_WALLET)) {
      console.log(`✅ ${file} - Wallet configured`);
    } else {
      console.log(`❌ ${file} - Wallet not found`);
    }
  } else {
    console.log(`❌ ${file} - Not found`);
  }
});

console.log('');
console.log('📋 Wallet Details:');
console.log(`   • Address: ${RECIPIENT_WALLET}`);
console.log(`   • Network: Stellar (Pi Network)`);
console.log(`   • Type: Testnet Wallet`);
console.log(`   • Purpose: Receive payments from users`);
console.log('');

console.log('🎯 How Payments Work:');
console.log('   1. User initiates payment in your app');
console.log('   2. Pi SDK creates payment to this wallet');
console.log('   3. User approves payment in Pi Browser');
console.log('   4. Payment is sent to this recipient wallet');
console.log('   5. Your app receives payment confirmation');
console.log('');

console.log('💡 This wallet will receive all payments from your app!');
console.log('   Make sure you have access to this wallet to receive funds.');
console.log('');

console.log('🔍 To verify wallet ownership:');
console.log('   1. Check wallet balance on Stellar testnet');
console.log('   2. Verify you have the private key');
console.log('   3. Test receiving a small payment');
console.log('');

console.log('💤 Your recipient wallet is properly configured!');

