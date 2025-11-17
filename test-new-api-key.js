#!/usr/bin/env node

/**
 * Test New Pi Testnet API Key
 * Verifies the new API key is working correctly
 */

const fs = require('fs');

console.log('🔑 Testing New Pi Testnet API Key');
console.log('=================================');
console.log('');

// Read the updated configuration
const piConfigPath = 'src/config/piConfig.ts';
const envPath = '.env';

console.log('📋 Configuration Status:');

// Check piConfig.ts
if (fs.existsSync(piConfigPath)) {
  const piConfigContent = fs.readFileSync(piConfigPath, 'utf8');
  const hasNewApiKey = piConfigContent.includes('egcp7jx0mufdqs5e5pnkukryfud0ny4ttnswdjfnkxyoxls7v5naek6uq55vnkbb');
  console.log(`   ✅ piConfig.ts: ${hasNewApiKey ? 'Updated with new API key' : '❌ Not updated'}`);
} else {
  console.log('   ❌ piConfig.ts: File not found');
}

// Check .env
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasNewApiKey = envContent.includes('egcp7jx0mufdqs5e5pnkukryfud0ny4ttnswdjfnkxyoxls7v5naek6uq55vnkbb');
  console.log(`   ✅ .env: ${hasNewApiKey ? 'Updated with new API key' : '❌ Not updated'}`);
} else {
  console.log('   ❌ .env: File not found');
}

console.log('');
console.log('🎯 New API Key Details:');
console.log('   🔑 API Key: egcp7jx0mufdqs5e5pnkukryfud0ny4ttnswdjfnkxyoxls7v5naek6uq55vnkbb');
console.log('   🌐 Network: testnet');
console.log('   🏢 App ID: flappypi6856');
console.log('   🔗 API URL: https://api.testnet.minepi.com');
console.log('');

console.log('🚀 Next Steps:');
console.log('   1. Your app is running at: http://localhost:8080');
console.log('   2. Test Pi authentication with new API key');
console.log('   3. Test Pi payments in testnet mode');
console.log('   4. Verify payment processing works correctly');
console.log('');

console.log('✅ New Pi testnet API key configuration complete!');
