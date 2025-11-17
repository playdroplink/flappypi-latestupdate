#!/usr/bin/env node

/**
 * Verify Sandbox Mode
 * Checks that sandbox mode is properly enabled
 */

const fs = require('fs');

console.log('🔍 Verifying Sandbox Mode');
console.log('========================');
console.log('');

let allCorrect = true;

// Check .env file
console.log('📁 Checking .env file...');
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  
  if (envContent.includes('REACT_APP_PI_NETWORK_SANDBOX=true')) {
    console.log('   ✅ REACT_APP_PI_NETWORK_SANDBOX=true');
  } else {
    console.log('   ❌ REACT_APP_PI_NETWORK_SANDBOX not set to true');
    allCorrect = false;
  }
  
  if (envContent.includes('REACT_APP_PI_SDK_SANDBOX=true')) {
    console.log('   ✅ REACT_APP_PI_SDK_SANDBOX=true');
  } else {
    console.log('   ❌ REACT_APP_PI_SDK_SANDBOX not set to true');
    allCorrect = false;
  }
  
  if (envContent.includes('REACT_APP_API_URL=https://api.sandbox.minepi.com/v2')) {
    console.log('   ✅ API URL set to sandbox');
  } else {
    console.log('   ❌ API URL not set to sandbox');
    allCorrect = false;
  }
} else {
  console.log('   ❌ .env file not found');
  allCorrect = false;
}

// Check piConfig.ts
console.log('📁 Checking piConfig.ts...');
if (fs.existsSync('src/config/piConfig.ts')) {
  const piConfigContent = fs.readFileSync('src/config/piConfig.ts', 'utf8');
  
  if (piConfigContent.includes('SANDBOX_MODE: true')) {
    console.log('   ✅ SANDBOX_MODE: true');
  } else {
    console.log('   ❌ SANDBOX_MODE not set to true');
    allCorrect = false;
  }
  
  if (piConfigContent.includes("API_URL: 'https://api.sandbox.minepi.com/v2'")) {
    console.log('   ✅ API URL set to sandbox');
  } else {
    console.log('   ❌ API URL not set to sandbox');
    allCorrect = false;
  }
  
  if (piConfigContent.includes('sandbox: true')) {
    console.log('   ✅ SDK sandbox: true');
  } else {
    console.log('   ❌ SDK sandbox not set to true');
    allCorrect = false;
  }
} else {
  console.log('   ❌ piConfig.ts not found');
  allCorrect = false;
}

// Check public/index.html
console.log('📁 Checking public/index.html...');
if (fs.existsSync('public/index.html')) {
  const indexContent = fs.readFileSync('public/index.html', 'utf8');
  
  if (indexContent.includes("apiUrl: 'https://api.sandbox.minepi.com/v2'")) {
    console.log('   ✅ API URL set to sandbox');
  } else {
    console.log('   ❌ API URL not set to sandbox');
    allCorrect = false;
  }
  
  if (indexContent.includes('sandboxMode: true')) {
    console.log('   ✅ sandboxMode: true');
  } else {
    console.log('   ❌ sandboxMode not set to true');
    allCorrect = false;
  }
  
  if (indexContent.includes('sandbox: true')) {
    console.log('   ✅ Pi SDK sandbox: true');
  } else {
    console.log('   ❌ Pi SDK sandbox not set to true');
    allCorrect = false;
  }
} else {
  console.log('   ❌ public/index.html not found');
  allCorrect = false;
}

console.log('');
if (allCorrect) {
  console.log('🎉 SANDBOX MODE VERIFICATION SUCCESSFUL!');
  console.log('');
  console.log('✅ All files have sandbox mode enabled');
  console.log('✅ Sandbox API URLs are configured');
  console.log('✅ SDK sandbox mode is enabled');
  console.log('✅ Ready for sandbox payments');
  console.log('');
  console.log('🚀 How to test:');
  console.log('   1. Run: npm start');
  console.log('   2. Open: https://flappypi6856.pinet.com/test in Pi Browser');
  console.log('   3. Use the console log copy button to test payments');
  console.log('   4. Check that sandbox mode is active in console');
  console.log('');
  console.log('💤 Sandbox mode is now properly configured!');
} else {
  console.log('❌ SANDBOX MODE VERIFICATION FAILED!');
  console.log('');
  console.log('⚠️ Some files have incorrect sandbox settings');
  console.log('💡 Run the enable-sandbox script again to fix this');
}
