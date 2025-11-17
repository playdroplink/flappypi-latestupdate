#!/usr/bin/env node

/**
 * Diagnose Payment Issues
 * Check what's wrong with the payment system
 */

const fs = require('fs');

console.log('🔍 Diagnosing Payment Issues...');
console.log('');

// Check if .env exists and has correct content
console.log('📁 Environment Check:');
if (fs.existsSync('.env')) {
  console.log('   ✅ .env file exists');
  const envContent = fs.readFileSync('.env', 'utf8');
  
  if (envContent.includes('REACT_APP_PI_NETWORK_MODE=testnet')) {
    console.log('   ✅ Testnet mode configured');
  } else {
    console.log('   ❌ Testnet mode not configured');
  }
  
  if (envContent.includes('REACT_APP_PI_APP_ID=flappypi6856')) {
    console.log('   ✅ App ID configured');
  } else {
    console.log('   ❌ App ID not configured');
  }
  
  if (envContent.includes('REACT_APP_PI_TESTNET_API_URL=https://api.testnet.minepi.com')) {
    console.log('   ✅ Testnet API configured');
  } else {
    console.log('   ❌ Testnet API not configured');
  }
} else {
  console.log('   ❌ .env file missing');
}

console.log('');

// Check if payment service files exist
console.log('📁 Payment Service Files:');
const paymentFiles = [
  'src/services/realPiPaymentService.ts',
  'src/services/piTestnetPaymentService.ts',
  'src/config/piConfig.ts'
];

paymentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

console.log('');

// Check if home page has test payment button
console.log('📁 Home Page Check:');
if (fs.existsSync('src/pages/HomePage.tsx')) {
  const homeContent = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');
  
  if (homeContent.includes('Test Payments')) {
    console.log('   ✅ Test payment button added');
  } else {
    console.log('   ❌ Test payment button missing');
  }
  
  if (homeContent.includes('PaymentDebugger')) {
    console.log('   ✅ PaymentDebugger integrated');
  } else {
    console.log('   ❌ PaymentDebugger missing');
  }
} else {
  console.log('   ❌ HomePage.tsx missing');
}

console.log('');

// Check if PaymentDebugger component exists
console.log('📁 PaymentDebugger Component:');
if (fs.existsSync('src/components/PaymentDebugger.tsx')) {
  console.log('   ✅ PaymentDebugger component exists');
} else {
  console.log('   ❌ PaymentDebugger component missing');
}

console.log('');

// Create a simple working test
console.log('🧪 Creating Simple Payment Test...');

const simpleTest = `
// Simple Payment Test - Copy this to browser console
console.log('🧪 Starting Simple Payment Test...');

// Check if Pi SDK is available
if (typeof window !== 'undefined' && window.Pi) {
  console.log('✅ Pi SDK is available');
  
  // Test payment creation
  window.Pi.createPayment({
    amount: 0.01,
    memo: 'Flappy Pi Testnet: Test Payment',
    metadata: {
      test: true,
      testnet: true,
      timestamp: Date.now()
    }
  }).then(payment => {
    console.log('✅ Payment created successfully:', payment);
  }).catch(error => {
    console.error('❌ Payment creation failed:', error);
  });
} else {
  console.error('❌ Pi SDK not available');
}
`;

fs.writeFileSync('simple-payment-test.js', simpleTest);
console.log('   ✅ Simple payment test created: simple-payment-test.js');

console.log('');
console.log('🚀 Quick Fix Steps:');
console.log('   1. Make sure .env file exists with testnet config');
console.log('   2. Restart your app: npm start');
console.log('   3. Open in Pi Browser: https://flappypi6856.pinet.com');
console.log('   4. Open browser console and run the simple test');
console.log('   5. Check for any error messages');
console.log('');
console.log('💤 If still not working, tell me what error you see!');
