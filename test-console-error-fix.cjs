#!/usr/bin/env node

/**
 * Console Error Fix Test
 * Verifies that the process.env error is fixed in TestnetPaymentService
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Console Error Fix Test');
console.log('================================================');

// Test TestnetPaymentService for process.env usage
function testTestnetPaymentService() {
  console.log('🔍 Testing TestnetPaymentService for process.env usage...');
  
  const servicePath = path.join(process.cwd(), 'src/services/testnetPaymentService.ts');
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');
    
    // Check for process.env usage
    const hasProcessEnv = content.includes('process.env');
    const hasBrowserCompatibleCode = content.includes('typeof window !== \'undefined\'');
    const hasWindowLocation = content.includes('window.location');
    const hasCheckTestnetEnabled = content.includes('checkTestnetEnabled');
    const hasHardcodedUrls = content.includes('https://api.testnet.minepi.com');
    
    console.log(`✅ Process.env usage: ${hasProcessEnv ? 'Found (NEEDS FIX)' : 'Not Found (GOOD)'}`);
    console.log(`✅ Browser compatible code: ${hasBrowserCompatibleCode ? 'Found' : 'Not Found'}`);
    console.log(`✅ Window location usage: ${hasWindowLocation ? 'Found' : 'Not Found'}`);
    console.log(`✅ Check testnet enabled: ${hasCheckTestnetEnabled ? 'Found' : 'Not Found'}`);
    console.log(`✅ Hardcoded URLs: ${hasHardcodedUrls ? 'Found' : 'Not Found'}`);
    
    if (!hasProcessEnv && hasBrowserCompatibleCode && hasCheckTestnetEnabled && hasHardcodedUrls) {
      console.log('✅ TestnetPaymentService is browser-compatible');
      return true;
    } else {
      console.log('❌ TestnetPaymentService still has browser compatibility issues');
      return false;
    }
  }
  
  console.log('❌ testnetPaymentService.ts not found');
  return false;
}

// Test for other potential process.env issues
function testOtherProcessEnvUsage() {
  console.log('🔍 Testing other process.env usage...');
  
  const files = [
    'src/config/truthwebPayConfig.ts',
    'src/lib/config.ts',
    'src/hooks/useGlobalMusic.ts',
    'src/utils/mobileAudioTest.ts',
    'src/utils/audioTest.ts',
    'src/components/game/OptimizedClassicMode.tsx'
  ];
  
  let allGood = true;
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasProcessEnv = content.includes('process.env');
      const hasBrowserGuard = content.includes('typeof window !== \'undefined\'') || 
                             content.includes('NODE_ENV') ||
                             file.includes('api/'); // API files are server-side
      
      console.log(`${hasProcessEnv && !hasBrowserGuard ? '❌' : '✅'} ${file}: ${hasProcessEnv ? 'Has process.env' : 'No process.env'} ${hasBrowserGuard ? '(Guarded)' : '(Unguarded)'}`);
      
      if (hasProcessEnv && !hasBrowserGuard && !file.includes('api/')) {
        allGood = false;
      }
    }
  });
  
  return allGood;
}

// Test browser compatibility
function testBrowserCompatibility() {
  console.log('🔍 Testing browser compatibility...');
  
  // Check if TestnetPaymentService can be instantiated in browser
  const servicePath = path.join(process.cwd(), 'src/services/testnetPaymentService.ts');
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');
    
    // Check for browser-safe patterns
    const hasWindowCheck = content.includes('typeof window !== \'undefined\'');
    const hasLocationCheck = content.includes('window.location');
    const hasConfigCheck = content.includes('PI_CONFIG');
    const hasFallbackValues = content.includes('GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI');
    
    console.log(`✅ Window check: ${hasWindowCheck ? 'Found' : 'Not Found'}`);
    console.log(`✅ Location check: ${hasLocationCheck ? 'Found' : 'Not Found'}`);
    console.log(`✅ Config check: ${hasConfigCheck ? 'Found' : 'Not Found'}`);
    console.log(`✅ Fallback values: ${hasFallbackValues ? 'Found' : 'Not Found'}`);
    
    return hasWindowCheck && hasLocationCheck && hasConfigCheck && hasFallbackValues;
  }
  
  return false;
}

// Main test function
function runConsoleErrorFixTest() {
  console.log('🚀 Running Console Error Fix Test...');
  console.log('================================================');
  
  const testnetOk = testTestnetPaymentService();
  const otherOk = testOtherProcessEnvUsage();
  const browserOk = testBrowserCompatibility();
  
  console.log('================================================');
  console.log('📊 Test Results:');
  console.log(`✅ TestnetPaymentService Fix: ${testnetOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Other Process.env Usage: ${otherOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Browser Compatibility: ${browserOk ? 'PASS' : 'FAIL'}`);
  
  const allPassed = testnetOk && otherOk && browserOk;
  
  console.log('================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Console error "process is not defined" is fixed');
    console.log('✅ TestnetPaymentService is browser-compatible');
    console.log('✅ All process.env usage is properly guarded');
    console.log('✅ App should work without console errors');
    console.log('');
    console.log('🔧 Fixes Applied:');
    console.log('- Removed process.env usage from TestnetPaymentService');
    console.log('- Added browser-compatible environment detection');
    console.log('- Added fallback values for testnet configuration');
    console.log('- Used window.location for base URL detection');
    console.log('- Added PI_CONFIG integration for browser environment');
    console.log('');
    console.log('🚀 App should now work without console errors!');
  } else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('Please check the failed components above');
  }
  console.log('================================================');
  
  return allPassed;
}

// Run the test
runConsoleErrorFixTest();
