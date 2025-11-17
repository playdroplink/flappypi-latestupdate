#!/usr/bin/env node

/**
 * Sandbox Mode Verification Script
 * Verifies that all Pi Network configurations are set to sandbox mode
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Sandbox Mode Configuration...\n');

// Files to check for sandbox configuration
const filesToCheck = [
  'src/config/piConfig.ts',
  'src/services/piAuthService.ts',
  'src/config/piAuth.ts',
  'src/components/PiAuthDebug.tsx',
  'src/utils/piBrowserDetection.ts',
  'index.html'
];

let allPassed = true;
let totalChecks = 0;
let passedChecks = 0;

function checkFile(filePath) {
  console.log(`📁 Checking ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ File not found: ${filePath}`);
    allPassed = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  totalChecks++;
  
  // Check for sandbox: true
  const hasSandboxTrue = content.includes('sandbox: true');
  const hasSandboxFalse = content.includes('sandbox: false');
  
  if (hasSandboxTrue && !hasSandboxFalse) {
    console.log(`   ✅ sandbox: true found, no sandbox: false`);
    passedChecks++;
  } else if (hasSandboxFalse) {
    console.log(`   ❌ sandbox: false found (should be true)`);
    allPassed = false;
  } else if (!hasSandboxTrue) {
    console.log(`   ⚠️  No sandbox configuration found`);
  }
  
  // Check for SANDBOX_MODE: true
  const hasSandboxModeTrue = content.includes('SANDBOX_MODE: true');
  const hasSandboxModeFalse = content.includes('SANDBOX_MODE: false');
  
  if (hasSandboxModeTrue && !hasSandboxModeFalse) {
    console.log(`   ✅ SANDBOX_MODE: true found`);
    passedChecks++;
  } else if (hasSandboxModeFalse) {
    console.log(`   ❌ SANDBOX_MODE: false found (should be true)`);
    allPassed = false;
  }
  
  // Check for PI_SANDBOX_MODE: true
  const hasPiSandboxModeTrue = content.includes('PI_SANDBOX_MODE: true');
  const hasPiSandboxModeFalse = content.includes('PI_SANDBOX_MODE: false');
  
  if (hasPiSandboxModeTrue && !hasPiSandboxModeFalse) {
    console.log(`   ✅ PI_SANDBOX_MODE: true found`);
    passedChecks++;
  } else if (hasPiSandboxModeFalse) {
    console.log(`   ❌ PI_SANDBOX_MODE: false found (should be true)`);
    allPassed = false;
  }
  
  // Check for production: false
  const hasProductionFalse = content.includes('production: false');
  const hasProductionTrue = content.includes('production: true');
  
  if (hasProductionFalse && !hasProductionTrue) {
    console.log(`   ✅ production: false found`);
    passedChecks++;
  } else if (hasProductionTrue) {
    console.log(`   ❌ production: true found (should be false)`);
    allPassed = false;
  }
  
  console.log('');
}

// Check all files
filesToCheck.forEach(checkFile);

// Summary
console.log('📊 VERIFICATION SUMMARY');
console.log('========================');
console.log(`Total checks: ${totalChecks}`);
console.log(`Passed checks: ${passedChecks}`);
console.log(`Failed checks: ${totalChecks - passedChecks}`);

if (allPassed) {
  console.log('\n🎉 SANDBOX MODE VERIFICATION PASSED!');
  console.log('✅ All Pi Network configurations are set to sandbox mode');
  console.log('✅ Ready for development and testing');
} else {
  console.log('\n❌ SANDBOX MODE VERIFICATION FAILED!');
  console.log('❌ Some configurations are not set to sandbox mode');
  console.log('❌ Please check the files above and fix any issues');
}

console.log('\n🔧 Sandbox Mode Features:');
console.log('   • No Pi Browser required');
console.log('   • No real payments');
console.log('   • Development-friendly');
console.log('   • Testing environment');
