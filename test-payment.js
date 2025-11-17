#!/usr/bin/env node

/**
 * Pi Network Payment Testing Script
 * Tests Pi Network testnet payments in different environments
 */

const fs = require('fs');
const path = require('path');

// Payment testing environments
const ENVIRONMENTS = {
  // Local development with testnet
  local: {
    name: 'Local Development (Testnet)',
    envFile: 'payment-test.env',
    baseUrl: 'http://localhost:3000',
    description: 'Local development server with testnet configuration'
  },
  
  // Pi Browser mobile testnet
  piBrowser: {
    name: 'Pi Browser Mobile (Testnet)',
    envFile: 'payment-test.env',
    baseUrl: 'https://flappypi6856.pinet.com',
    description: 'Pi Browser mobile with testnet configuration'
  },
  
  // Production testnet
  production: {
    name: 'Production Testnet',
    envFile: 'payment-test.env',
    baseUrl: 'https://www.flappypi.fun',
    description: 'Production deployment with testnet configuration'
  }
};

// Payment test scenarios
const PAYMENT_TESTS = [
  {
    name: 'Small Payment Test',
    amount: 0.01,
    memo: 'Test payment - Small amount',
    metadata: { test: 'small_payment', timestamp: Date.now() }
  },
  {
    name: 'Medium Payment Test',
    amount: 0.1,
    memo: 'Test payment - Medium amount',
    metadata: { test: 'medium_payment', timestamp: Date.now() }
  },
  {
    name: 'Large Payment Test',
    amount: 1.0,
    memo: 'Test payment - Large amount',
    metadata: { test: 'large_payment', timestamp: Date.now() }
  }
];

function setupPaymentTestingEnvironment(environment) {
  console.log(`🚀 Setting up ${environment.name}...`);
  console.log(`📋 ${environment.description}`);
  console.log(`🌐 Base URL: ${environment.baseUrl}`);
  console.log(`📁 Environment file: ${environment.envFile}`);
  console.log('');
  
  try {
    // Copy environment file to .env
    if (fs.existsSync(environment.envFile)) {
      fs.copyFileSync(environment.envFile, '.env');
      console.log('✅ Environment file copied to .env');
    } else {
      console.log('⚠️ Environment file not found, using default configuration');
    }
    
    // Create payment testing configuration
    const paymentConfig = {
      environment: environment.name,
      baseUrl: environment.baseUrl,
      testnet: true,
      sandbox: false,
      mainnet: false,
      paymentTesting: true,
      debugMode: true,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('payment-test-config.json', JSON.stringify(paymentConfig, null, 2));
    console.log('✅ Payment testing configuration created');
    
    console.log('');
    console.log('🎯 Payment Testing Environment Ready!');
    console.log('');
    console.log('📊 Configuration Summary:');
    console.log(`   • Environment: ${environment.name}`);
    console.log(`   • Base URL: ${environment.baseUrl}`);
    console.log(`   • Network: Testnet`);
    console.log(`   • Sandbox: Disabled`);
    console.log(`   • Mainnet: Disabled`);
    console.log(`   • Payment Testing: Enabled`);
    console.log(`   • Debug Mode: Enabled`);
    console.log('');
    console.log('🚀 Start your application and test payments!');
    
  } catch (error) {
    console.error('❌ Error setting up payment testing environment:', error.message);
    process.exit(1);
  }
}

function runPaymentTests() {
  console.log('🧪 Running Payment Tests...');
  console.log('');
  
  PAYMENT_TESTS.forEach((test, index) => {
    console.log(`📋 Test ${index + 1}: ${test.name}`);
    console.log(`   💰 Amount: ${test.amount} TEST_PI`);
    console.log(`   📝 Memo: ${test.memo}`);
    console.log(`   🔧 Metadata: ${JSON.stringify(test.metadata)}`);
    console.log('');
  });
  
  console.log('🎯 Payment Test Scenarios:');
  console.log('   1. Open your application in Pi Browser mobile');
  console.log('   2. Navigate to payment section');
  console.log('   3. Try each payment test scenario');
  console.log('   4. Check console logs for debug information');
  console.log('   5. Verify payments are processed correctly');
  console.log('');
  console.log('🔍 Debug Information:');
  console.log('   • Check browser console for Pi SDK logs');
  console.log('   • Verify Pi Browser detection');
  console.log('   • Monitor payment creation and approval');
  console.log('   • Check for any error messages');
}

function showEnvironmentOptions() {
  console.log('🌍 Available Payment Testing Environments:');
  console.log('');
  
  Object.entries(ENVIRONMENTS).forEach(([key, env], index) => {
    console.log(`${index + 1}. ${env.name}`);
    console.log(`   📋 ${env.description}`);
    console.log(`   🌐 Base URL: ${env.baseUrl}`);
    console.log(`   📁 Environment: ${env.envFile}`);
    console.log('');
  });
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('🎮 Flappy Pi - Payment Testing Environment');
  console.log('==========================================');
  console.log('');
  
  switch (command) {
    case 'setup':
      const envKey = args[1] || 'local';
      if (ENVIRONMENTS[envKey]) {
        setupPaymentTestingEnvironment(ENVIRONMENTS[envKey]);
      } else {
        console.error('❌ Invalid environment:', envKey);
        showEnvironmentOptions();
      }
      break;
      
    case 'test':
      runPaymentTests();
      break;
      
    case 'list':
      showEnvironmentOptions();
      break;
      
    default:
      console.log('📖 Usage:');
      console.log('   node test-payment.js setup [environment]  - Setup payment testing environment');
      console.log('   node test-payment.js test                 - Run payment tests');
      console.log('   node test-payment.js list                 - List available environments');
      console.log('');
      console.log('🌍 Available environments: local, piBrowser, production');
      console.log('');
      console.log('📋 Examples:');
      console.log('   node test-payment.js setup local          - Setup local development');
      console.log('   node test-payment.js setup piBrowser      - Setup Pi Browser mobile');
      console.log('   node test-payment.js setup production    - Setup production testnet');
      console.log('   node test-payment.js test                 - Run payment tests');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { ENVIRONMENTS, PAYMENT_TESTS, setupPaymentTestingEnvironment, runPaymentTests };
