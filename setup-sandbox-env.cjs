#!/usr/bin/env node

/**
 * Setup Sandbox Environment
 * Creates .env file with sandbox configuration
 */

const fs = require('fs');

console.log('🔧 Setting up Sandbox Environment');
console.log('================================');
console.log('');

const envContent = `# Flappy Pi - Sandbox Environment
# ===============================

# Pi Network Configuration
REACT_APP_PI_APP_ID=flappypi6856
REACT_APP_PI_API_KEY=pzrhprz7ppwn96vvailrtupwnc5krgjykbormz54oysidzblbm7stfoxxxnxlwkl
REACT_APP_PI_VALIDATION_KEY=312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156

# Network Mode - SANDBOX ENABLED
REACT_APP_PI_NETWORK_MODE=sandbox
REACT_APP_PI_NETWORK_SANDBOX=true
REACT_APP_PI_SDK_SANDBOX=true
REACT_APP_SANDBOX_SDK=true

# API URLs - Sandbox
REACT_APP_API_URL=https://api.sandbox.minepi.com/v2
REACT_APP_PI_SANDBOX_API_URL=https://api.sandbox.minepi.com/v2
REACT_APP_PI_TESTNET_API_URL=https://api.sandbox.minepi.com/v2

# Domain Configuration
REACT_APP_CUSTOM_DOMAIN=www.flappypi.fun
REACT_APP_PINET_SUBDOMAIN=flappypi6856
REACT_APP_BASE_URL=https://www.flappypi.fun

# Wallet Configuration
REACT_APP_WALLET_ADDRESS=GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI
REACT_APP_PI_TESTNET_WALLET_ADDRESS=GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI

# CORS Origins
REACT_APP_CORS_ORIGINS=https://www.flappypi.fun,https://flappypi6856.pinet.com,https://ecosystem.pinet.com
REACT_APP_ALLOWED_ORIGINS=https://www.flappypi.fun,https://flappypi6856.pinet.com,https://ecosystem.pinet.com

# Payment Configuration
REACT_APP_PAYMENT_TESTING=true
REACT_APP_PI_CURRENCY=TEST_PI
REACT_APP_PI_NETWORK_CURRENCY=TEST_PI

# Debug Configuration
REACT_APP_DEBUG_MODE=true
REACT_APP_CONSOLE_LOGS=true
REACT_APP_PAYMENT_DEBUG=true

# Environment
NODE_ENV=development
REACT_APP_ENV=development`;

// Write .env file
fs.writeFileSync('.env', envContent);
console.log('✅ .env file created with sandbox configuration');

console.log('');
console.log('🎉 SANDBOX ENVIRONMENT SETUP COMPLETE!');
console.log('');
console.log('📋 Configuration:');
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
console.log('💤 Sandbox environment is now ready!');