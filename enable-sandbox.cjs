#!/usr/bin/env node

/**
 * Enable Sandbox Mode
 * Sets sandbox mode to true throughout the system
 */

const fs = require('fs');

console.log('🔧 Enabling Sandbox Mode');
console.log('======================');
console.log('');
console.log('📋 Setting sandbox mode to TRUE');
console.log('');

// Step 1: Update .env file
console.log('📝 Step 1: Updating .env file...');
if (fs.existsSync('.env')) {
  let envContent = fs.readFileSync('.env', 'utf8');
  
  // Update sandbox settings
  envContent = envContent.replace(
    /REACT_APP_PI_NETWORK_SANDBOX=.*/,
    'REACT_APP_PI_NETWORK_SANDBOX=true'
  );
  
  envContent = envContent.replace(
    /REACT_APP_PI_SDK_SANDBOX=.*/,
    'REACT_APP_PI_SDK_SANDBOX=true'
  );
  
  envContent = envContent.replace(
    /REACT_APP_SANDBOX_SDK=.*/,
    'REACT_APP_SANDBOX_SDK=true'
  );
  
  envContent = envContent.replace(
    /REACT_APP_PI_SANDBOX_API_URL=.*/,
    'REACT_APP_PI_SANDBOX_API_URL=https://api.sandbox.minepi.com/v2'
  );
  
  envContent = envContent.replace(
    /REACT_APP_API_URL=.*/,
    'REACT_APP_API_URL=https://api.sandbox.minepi.com/v2'
  );
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file updated with sandbox mode');
} else {
  console.log('❌ .env file not found');
}

// Step 2: Update piConfig.ts
console.log('📝 Step 2: Updating piConfig.ts...');
if (fs.existsSync('src/config/piConfig.ts')) {
  let piConfigContent = fs.readFileSync('src/config/piConfig.ts', 'utf8');
  
  // Update sandbox mode
  piConfigContent = piConfigContent.replace(
    /SANDBOX_MODE: false/,
    'SANDBOX_MODE: true'
  );
  
  // Update API URL to sandbox
  piConfigContent = piConfigContent.replace(
    /API_URL: 'https:\/\/api\.testnet\.minepi\.com'/,
    "API_URL: 'https://api.sandbox.minepi.com/v2'"
  );
  
  // Update SDK config
  piConfigContent = piConfigContent.replace(
    /sandbox: false/,
    'sandbox: true'
  );
  
  fs.writeFileSync('src/config/piConfig.ts', piConfigContent);
  console.log('✅ piConfig.ts updated with sandbox mode');
} else {
  console.log('❌ piConfig.ts not found');
}

// Step 3: Update public/index.html
console.log('📝 Step 3: Updating public/index.html...');
if (fs.existsSync('public/index.html')) {
  let indexContent = fs.readFileSync('public/index.html', 'utf8');
  
  // Update API URLs to sandbox
  indexContent = indexContent.replace(
    /apiUrl: 'https:\/\/api\.testnet\.minepi\.com'/,
    "apiUrl: 'https://api.sandbox.minepi.com/v2'"
  );
  
  indexContent = indexContent.replace(
    /testnetApiUrl: 'https:\/\/api\.testnet\.minepi\.com'/,
    "testnetApiUrl: 'https://api.sandbox.minepi.com/v2'"
  );
  
  // Update sandbox mode flags
  indexContent = indexContent.replace(
    /sandboxMode: false/,
    'sandboxMode: true'
  );
  
  indexContent = indexContent.replace(
    /testnetMode: true/,
    'testnetMode: false'
  );
  
  // Update Pi SDK config
  indexContent = indexContent.replace(
    /sandbox: false/,
    'sandbox: true'
  );
  
  fs.writeFileSync('public/index.html', indexContent);
  console.log('✅ public/index.html updated with sandbox mode');
} else {
  console.log('❌ public/index.html not found');
}

// Step 4: Update mainnetConfig.ts
console.log('📝 Step 4: Updating mainnetConfig.ts...');
if (fs.existsSync('src/config/mainnetConfig.ts')) {
  let mainnetConfigContent = fs.readFileSync('src/config/mainnetConfig.ts', 'utf8');
  
  // Update sandbox settings
  mainnetConfigContent = mainnetConfigContent.replace(
    /SANDBOX_ENABLED: false/,
    'SANDBOX_ENABLED: true'
  );
  
  mainnetConfigContent = mainnetConfigContent.replace(
    /sandbox: false/,
    'sandbox: true'
  );
  
  fs.writeFileSync('src/config/mainnetConfig.ts', mainnetConfigContent);
  console.log('✅ mainnetConfig.ts updated with sandbox mode');
} else {
  console.log('❌ mainnetConfig.ts not found');
}

console.log('');
console.log('🎉 SANDBOX MODE ENABLED!');
console.log('');
console.log('📋 What was updated:');
console.log('   • .env file - sandbox mode enabled');
console.log('   • piConfig.ts - sandbox mode enabled');
console.log('   • public/index.html - sandbox API URLs');
console.log('   • mainnetConfig.ts - sandbox enabled');
console.log('');
console.log('🔧 Configuration:');
console.log('   • Mode: Sandbox');
console.log('   • API: https://api.sandbox.minepi.com/v2');
console.log('   • App ID: flappypi6856');
console.log('   • Currency: TEST_PI (sandbox)');
console.log('   • Validation Key: ✅ Configured');
console.log('');
console.log('🚀 How to test:');
console.log('   1. Run: npm start');
console.log('   2. Open: https://flappypi6856.pinet.com/test in Pi Browser');
console.log('   3. Use the console log copy button to test payments');
console.log('   4. Check that sandbox mode is active');
console.log('');
console.log('💤 Sandbox mode is now enabled throughout the system!');
