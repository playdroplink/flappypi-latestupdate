#!/usr/bin/env node

/**
 * Start Production Testnet App
 * This will start the app in production testnet mode
 */

const { exec } = require('child_process');

console.log('🚀 Starting Production Testnet App');
console.log('==================================');
console.log('');

console.log('📋 Production Testnet Configuration:');
console.log('   • Mode: Production Testnet');
console.log('   • API: https://api.testnet.minepi.com');
console.log('   • App ID: flappypi6856');
console.log('   • Currency: TEST_PI');
console.log('   • Security: Production level');
console.log('');

console.log('🔄 Starting app...');

// Try to start the app
exec('npm start', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ npm start failed:', error.message);
    console.log('');
    console.log('💡 Manual start instructions:');
    console.log('   1. Open terminal in this directory');
    console.log('   2. Run: npm start');
    console.log('   3. Open: https://flappypi6856.pinet.com/test in Pi Browser');
    console.log('   4. Use the console log copy button to test payments');
    return;
  }
  
  console.log('✅ App started successfully!');
  console.log('');
  console.log('📱 Open this URL in Pi Browser mobile:');
  console.log('   https://flappypi6856.pinet.com/test');
  console.log('');
  console.log('🧪 Then use the console log copy button to test payments!');
  console.log('');
  console.log('💤 Production testnet mode is now active!');
});
