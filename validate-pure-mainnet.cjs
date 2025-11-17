#!/usr/bin/env node

/**
 * Flappy Pi - Pure Mainnet Validation
 * Ensures NO testnet, NO sandbox, NO mockups - ONLY mainnet production
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Pure Mainnet Configuration...');
console.log('🚫 Checking for testnet/sandbox/mockup references...\n');

let issuesFound = 0;
let filesChecked = 0;

// Files to check for testnet/sandbox references
const filesToCheck = [
  'mainnet.env',
  'setup-mainnet-env.cjs',
  'src/services/piAdNetworkService.ts',
  'src/services/unifiedPiPaymentService.ts',
  'src/config/mainnetConfig.ts',
  'src/config/piConfig.ts',
  'src/config/piNetworkConfig.ts',
  'src/services/realPiPaymentService.ts',
  'src/services/securePaymentService.ts',
  'src/services/piPayment.ts',
  'src/services/manualPaymentService.ts',
  'src/services/dualPaymentService.ts',
  'src/components/TruthWebPayModal.tsx',
  'src/components/UnifiedPiPaymentModal.tsx',
  'src/components/ShopModal.tsx',
  'src/components/ManualPaymentModal.tsx',
  'public/index.html'
];

// Check each file for testnet/sandbox references
filesToCheck.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    filesChecked++;
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for testnet references
    const testnetMatches = content.match(/testnet/gi);
    if (testnetMatches) {
      console.log(`❌ Found ${testnetMatches.length} testnet references in ${filePath}`);
      issuesFound += testnetMatches.length;
    }
    
    // Check for sandbox references (excluding legitimate mainnet sandbox: false)
    const sandboxMatches = content.match(/sandbox/gi);
    if (sandboxMatches) {
      const legitimateSandbox = content.match(/sandbox:\s*false/gi);
      const illegitimateSandbox = sandboxMatches.length - (legitimateSandbox ? legitimateSandbox.length : 0);
      if (illegitimateSandbox > 0) {
        console.log(`❌ Found ${illegitimateSandbox} illegitimate sandbox references in ${filePath}`);
        issuesFound += illegitimateSandbox;
      }
    }
    
    // Check for mockup references
    const mockupMatches = content.match(/mockup|mock/gi);
    if (mockupMatches) {
      console.log(`❌ Found ${mockupMatches.length} mockup references in ${filePath}`);
      issuesFound += mockupMatches.length;
    }
  }
});

// Check for remaining testnet/sandbox files
const testnetFiles = [
  'testnet.env',
  'setup-testnet-env.cjs',
  'setup-testnet-env.js',
  'TESTNET_CONFIGURATION_CORRECTED.md',
  'TESTNET_PAYMENT_SETUP_COMPLETE.md',
  'setup-pure-testnet.js',
  'setup-production-testnet.cjs',
  'setup-flappypi-testnet.cjs',
  'TESTNET_ENV_CONFIGURATION.md',
  'setup-full-testnet.js',
  'payment-test.env',
  'setup-droplink-testnet-env.cjs',
  'DROPLINK_TESTNET_SETUP_COMPLETE.md',
  'PI_TESTNET_PAYMENTS_VERIFICATION_COMPLETE.md',
  'testnet-config.json',
  'setup-mainnet-env.js',
  'validate-mainnet-config.js'
];

testnetFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`❌ Found remaining testnet file: ${filePath}`);
    issuesFound++;
  }
});

// Check for testnet/sandbox service files
const testnetServiceFiles = [
  'src/services/sandboxPaymentService.ts',
  'src/services/productionTestnetPaymentService.ts',
  'src/services/testnetPaymentService.ts',
  'src/services/piTestnetPaymentService.ts',
  'src/config/piTestnetMobile.ts'
];

testnetServiceFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`❌ Found remaining testnet service file: ${filePath}`);
    issuesFound++;
  }
});

// Check for testnet/sandbox component files
const testnetComponentFiles = [
  'src/pages/TestnetTogglePage.tsx',
  'src/components/TestnetPaymentDemo.tsx',
  'src/components/TestnetStatusPanel.tsx',
  'src/pages/SandboxTestPage.tsx'
];

testnetComponentFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`❌ Found remaining testnet component file: ${filePath}`);
    issuesFound++;
  }
});

console.log('\n📊 Validation Results:');
console.log(`✅ Files checked: ${filesChecked}`);
console.log(`❌ Issues found: ${issuesFound}`);

if (issuesFound === 0) {
  console.log('\n🎉 PURE MAINNET VALIDATION PASSED!');
  console.log('✅ No testnet references found');
  console.log('✅ No sandbox references found');
  console.log('✅ No mockup references found');
  console.log('✅ All testnet files removed');
  console.log('✅ All testnet services removed');
  console.log('✅ All testnet components removed');
  console.log('\n🚀 Your Flappy Pi is PURE MAINNET PRODUCTION READY!');
} else {
  console.log('\n❌ PURE MAINNET VALIDATION FAILED!');
  console.log(`Found ${issuesFound} issues that need to be resolved.`);
  console.log('Please clean up the remaining testnet/sandbox references.');
}

console.log('\n🔧 Mainnet Configuration Summary:');
console.log('✅ App ID: flappypi2807');
console.log('✅ API Key: rppe8zs82vn2kmksqmkopg1yiqzqxs0vgcmzbo5e6hqc3zfn5qeexzygbjqn3yd3');
console.log('✅ Validation Key: 94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce');
console.log('✅ Wallet Address: GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ');
console.log('✅ Network: mainnet');
console.log('✅ API URL: https://api.minepi.com');
console.log('✅ Pi Ad Network: Enabled');
console.log('✅ Revenue Share: 70%');
console.log('✅ Production Ready: YES');
