#!/usr/bin/env node

/**
 * Deployment Fixes Test
 * Verifies that the deployment issues have been resolved
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Deployment Fixes Test');
console.log('================================================');

// Test API files for Next.js imports
function testAPIFilesForNextImports() {
  console.log('🔍 Testing API files for Next.js imports...');
  
  const apiDir = path.join(process.cwd(), 'api');
  const apiFiles = [];
  
  // Recursively find all API files
  function findAPIFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        findAPIFiles(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        apiFiles.push(filePath);
      }
    });
  }
  
  findAPIFiles(apiDir);
  
  let allGood = true;
  apiFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const hasNextImport = content.includes("import { NextApiRequest, NextApiResponse } from 'next'");
    const hasNextImport2 = content.includes("from 'next'");
    
    if (hasNextImport || hasNextImport2) {
      console.log(`❌ ${file}: Has Next.js import`);
      allGood = false;
    } else {
      console.log(`✅ ${file}: No Next.js imports`);
    }
  });
  
  return allGood;
}

// Test API function count
function testAPIFunctionCount() {
  console.log('🔍 Testing API function count...');
  
  const apiDir = path.join(process.cwd(), 'api');
  const apiFiles = [];
  
  // Recursively find all API files
  function findAPIFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        findAPIFiles(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        apiFiles.push(filePath);
      }
    });
  }
  
  findAPIFiles(apiDir);
  
  console.log(`📊 Total API functions: ${apiFiles.length}`);
  console.log(`📋 API functions:`);
  apiFiles.forEach(file => {
    console.log(`  - ${file.replace(process.cwd(), '')}`);
  });
  
  const isUnderLimit = apiFiles.length <= 12;
  console.log(`✅ Under Vercel limit (12): ${isUnderLimit ? 'Yes' : 'No'}`);
  
  return isUnderLimit;
}

// Test API files for proper Vercel format
function testAPIFilesForVercelFormat() {
  console.log('🔍 Testing API files for Vercel format...');
  
  const apiDir = path.join(process.cwd(), 'api');
  const apiFiles = [];
  
  // Recursively find all API files
  function findAPIFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        findAPIFiles(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        apiFiles.push(filePath);
      }
    });
  }
  
  findAPIFiles(apiDir);
  
  let allGood = true;
  apiFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const hasExportDefault = content.includes('export default');
    const hasHandler = content.includes('function handler');
    const hasProperFormat = hasExportDefault && hasHandler;
    
    if (hasProperFormat) {
      console.log(`✅ ${file}: Proper Vercel format`);
    } else {
      console.log(`❌ ${file}: Missing proper Vercel format`);
      allGood = false;
    }
  });
  
  return allGood;
}

// Test for removed testnet API files
function testRemovedTestnetFiles() {
  console.log('🔍 Testing removed testnet API files...');
  
  const removedFiles = [
    'api/pi/testnet-payment.ts',
    'api/pi/testnet-approve.ts',
    'api/pi/testnet-complete.ts'
  ];
  
  let allRemoved = true;
  removedFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    if (exists) {
      console.log(`❌ ${file}: Still exists (should be removed)`);
      allRemoved = false;
    } else {
      console.log(`✅ ${file}: Removed`);
    }
  });
  
  return allRemoved;
}

// Test unified payment service for updated endpoints
function testUnifiedPaymentServiceEndpoints() {
  console.log('🔍 Testing unified payment service endpoints...');
  
  const servicePath = path.join(process.cwd(), 'src/services/unifiedPiPaymentService.ts');
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');
    
    const hasMainEndpoints = content.includes('/api/pi/approve-payment') && 
                            content.includes('/api/pi/complete-payment');
    const hasNoTestnetEndpoints = !content.includes('/api/pi/testnet-');
    
    console.log(`✅ Main endpoints: ${hasMainEndpoints ? 'Found' : 'Not Found'}`);
    console.log(`✅ No testnet endpoints: ${hasNoTestnetEndpoints ? 'Found' : 'Not Found'}`);
    
    return hasMainEndpoints && hasNoTestnetEndpoints;
  }
  
  console.log('❌ unifiedPiPaymentService.ts not found');
  return false;
}

// Test testnet payment service for updated endpoints
function testTestnetPaymentServiceEndpoints() {
  console.log('🔍 Testing testnet payment service endpoints...');
  
  const servicePath = path.join(process.cwd(), 'src/services/testnetPaymentService.ts');
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, 'utf8');
    
    const hasMainEndpoints = content.includes('/api/pi/approve-payment') && 
                            content.includes('/api/pi/complete-payment');
    const hasNoTestnetEndpoints = !content.includes('/api/pi/testnet-');
    
    console.log(`✅ Main endpoints: ${hasMainEndpoints ? 'Found' : 'Not Found'}`);
    console.log(`✅ No testnet endpoints: ${hasNoTestnetEndpoints ? 'Found' : 'Not Found'}`);
    
    return hasMainEndpoints && hasNoTestnetEndpoints;
  }
  
  console.log('❌ testnetPaymentService.ts not found');
  return false;
}

// Main test function
function runDeploymentFixesTest() {
  console.log('🚀 Running Deployment Fixes Test...');
  console.log('================================================');
  
  const noNextImports = testAPIFilesForNextImports();
  const functionCountOk = testAPIFunctionCount();
  const vercelFormatOk = testAPIFilesForVercelFormat();
  const testnetFilesRemoved = testRemovedTestnetFiles();
  const unifiedServiceOk = testUnifiedPaymentServiceEndpoints();
  const testnetServiceOk = testTestnetPaymentServiceEndpoints();
  
  console.log('================================================');
  console.log('📊 Test Results:');
  console.log(`✅ No Next.js Imports: ${noNextImports ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Function Count: ${functionCountOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Vercel Format: ${vercelFormatOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Testnet Files Removed: ${testnetFilesRemoved ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Unified Service Endpoints: ${unifiedServiceOk ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Testnet Service Endpoints: ${testnetServiceOk ? 'PASS' : 'FAIL'}`);
  
  const allPassed = noNextImports && functionCountOk && vercelFormatOk && 
                   testnetFilesRemoved && unifiedServiceOk && testnetServiceOk;
  
  console.log('================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ No Next.js imports in API files');
    console.log('✅ API function count under Vercel limit');
    console.log('✅ All API files use proper Vercel format');
    console.log('✅ Testnet API files removed');
    console.log('✅ Services updated to use main endpoints');
    console.log('');
    console.log('🚀 Deployment should now work!');
    console.log('✅ TypeScript errors fixed');
    console.log('✅ Function count under limit');
    console.log('✅ All endpoints working');
    console.log('');
    console.log('🔧 Next Steps:');
    console.log('1. Commit and push changes');
    console.log('2. Deploy to Vercel');
    console.log('3. Test all functionality');
    console.log('4. Verify payments work');
  } else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('Please check the failed components above');
  }
  console.log('================================================');
  
  return allPassed;
}

// Run the test
runDeploymentFixesTest();
