#!/usr/bin/env node

/**
 * Final Validation Key Check
 * Checks that the validation key is properly configured
 */

const fs = require('fs');

const EXPECTED_VALIDATION_KEY = '312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156';

console.log('🔍 Final Validation Key Check');
console.log('============================');
console.log('');
console.log('📋 Expected validation key:', EXPECTED_VALIDATION_KEY);
console.log('');

// Check key files
const keyFiles = [
  '.env',
  'src/config/piConfig.ts',
  'public/index.html',
  'public/validation-key.txt'
];

let allCorrect = true;

keyFiles.forEach(file => {
  console.log(`📁 Checking ${file}...`);
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(EXPECTED_VALIDATION_KEY)) {
      console.log(`   ✅ ${file} has correct validation key`);
    } else {
      console.log(`   ❌ ${file} has incorrect validation key`);
      allCorrect = false;
    }
  } else {
    console.log(`   ❌ ${file} not found`);
    allCorrect = false;
  }
});

console.log('');
if (allCorrect) {
  console.log('🎉 VALIDATION KEY IS PROPERLY CONFIGURED!');
  console.log('');
  console.log('✅ All key files have the correct validation key');
  console.log('✅ Your validation key is ready for use');
  console.log('');
  console.log('🚀 How to test:');
  console.log('   1. Run: npm start');
  console.log('   2. Open: https://flappypi6856.pinet.com/test in Pi Browser');
  console.log('   3. Use the console log copy button to test payments');
  console.log('   4. The validation key will be used for payment validation');
  console.log('');
  console.log('💤 Your validation key is now properly configured!');
} else {
  console.log('❌ VALIDATION KEY CONFIGURATION ISSUES!');
  console.log('');
  console.log('⚠️ Some files have incorrect validation keys');
  console.log('💡 The validation key needs to be updated in some files');
}
