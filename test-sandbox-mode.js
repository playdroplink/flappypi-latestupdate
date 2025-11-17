#!/usr/bin/env node

/**
 * Test Sandbox Mode Configuration
 * Verifies that sandbox mode is properly configured
 */

const fs = require('fs');

console.log('🧪 Testing Sandbox Mode Configuration');
console.log('=====================================');
console.log('');

// Test 1: Check .env file
console.log('📝 Test 1: Checking .env file...');
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  
  const sandboxChecks = [
    { key: 'REACT_APP_PI_NETWORK_SANDBOX', expected: 'true' },
    { key: 'REACT_APP_PI_SDK_SANDBOX', expected: 'true' },
    { key: 'REACT_APP_SANDBOX_SDK', expected: 'true' },
    { key: 'REACT_APP_API_URL', expected: 'https://api.sandbox.minepi.com/v2' },
    { key: 'REACT_APP_PI_APP_ID', expected: 'flappypi6856' }
  ];
  
  let envPassed = 0;
  sandboxChecks.forEach(check => {
    const regex = new RegExp(`${check.key}=${check.expected}`);
    if (regex.test(envContent)) {
      console.log(`   ✅ ${check.key}=${check.expected}`);
      envPassed++;
    } else {
      console.log(`   ❌ ${check.key} not set to ${check.expected}`);
    }
  });
  
  console.log(`   📊 .env file: ${envPassed}/${sandboxChecks.length} checks passed`);
} else {
  console.log('   ❌ .env file not found');
}

// Test 2: Check piConfig.ts
console.log('');
console.log('📝 Test 2: Checking piConfig.ts...');
if (fs.existsSync('src/config/piConfig.ts')) {
  const configContent = fs.readFileSync('src/config/piConfig.ts', 'utf8');
  
  const configChecks = [
    { pattern: /NETWORK_MODE: 'sandbox'/, name: 'Network mode set to sandbox' },
    { pattern: /SANDBOX_MODE: true/, name: 'Sandbox mode enabled' },
    { pattern: /MAINNET_MODE: false/, name: 'Mainnet mode disabled' },
    { pattern: /IS_PRODUCTION: false/, name: 'Production mode disabled' },
    { pattern: /API_URL: 'https:\/\/api\.sandbox\.minepi\.com\/v2'/, name: 'Sandbox API URL' },
    { pattern: /APP_ID: 'flappypi6856'/, name: 'Sandbox App ID' },
    { pattern: /sandbox: true/, name: 'SDK sandbox enabled' }
  ];
  
  let configPassed = 0;
  configChecks.forEach(check => {
    if (check.pattern.test(configContent)) {
      console.log(`   ✅ ${check.name}`);
      configPassed++;
    } else {
      console.log(`   ❌ ${check.name}`);
    }
  });
  
  console.log(`   📊 piConfig.ts: ${configPassed}/${configChecks.length} checks passed`);
} else {
  console.log('   ❌ piConfig.ts not found');
}

// Test 3: Check public/index.html
console.log('');
console.log('📝 Test 3: Checking public/index.html...');
if (fs.existsSync('public/index.html')) {
  const indexContent = fs.readFileSync('public/index.html', 'utf8');
  
  const indexChecks = [
    { pattern: /apiUrl: 'https:\/\/api\.sandbox\.minepi\.com\/v2'/, name: 'Sandbox API URL in HTML' },
    { pattern: /sandboxMode: true/, name: 'Sandbox mode in HTML' },
    { pattern: /sandbox: true/, name: 'SDK sandbox in HTML' }
  ];
  
  let indexPassed = 0;
  indexChecks.forEach(check => {
    if (check.pattern.test(indexContent)) {
      console.log(`   ✅ ${check.name}`);
      indexPassed++;
    } else {
      console.log(`   ❌ ${check.name}`);
    }
  });
  
  console.log(`   📊 public/index.html: ${indexPassed}/${indexChecks.length} checks passed`);
} else {
  console.log('   ❌ public/index.html not found');
}

console.log('');
console.log('🎉 Sandbox Mode Test Complete!');
console.log('');
console.log('📋 Summary:');
console.log('   • Sandbox mode should be enabled throughout the system');
console.log('   • API endpoints should point to sandbox');
console.log('   • App ID should be flappypi6856 (sandbox)');
console.log('   • No real Pi tokens will be used');
console.log('');
console.log('🚀 Next steps:');
console.log('   1. Run: npm start');
console.log('   2. Open: https://flappypi6856.pinet.com/test in Pi Browser');
console.log('   3. Test payment functionality');
console.log('   4. Check console for sandbox mode indicators');
