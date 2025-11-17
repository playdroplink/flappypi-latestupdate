#!/usr/bin/env node

/**
 * Verify Validation Key Usage
 * Checks that the validation key is being used correctly throughout the system
 */

const fs = require('fs');

const EXPECTED_VALIDATION_KEY = '312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156';

console.log('🔍 Verifying Validation Key Usage');
console.log('================================');
console.log('');
console.log('📋 Expected validation key:', EXPECTED_VALIDATION_KEY);
console.log('');

let allCorrect = true;

// Check .env file
console.log('📁 Checking .env file...');
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  if (envContent.includes(EXPECTED_VALIDATION_KEY)) {
    console.log('   ✅ .env file has correct validation key');
  } else {
    console.log('   ❌ .env file has incorrect validation key');
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
  if (piConfigContent.includes(EXPECTED_VALIDATION_KEY)) {
    console.log('   ✅ piConfig.ts has correct validation key');
  } else {
    console.log('   ❌ piConfig.ts has incorrect validation key');
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
  if (indexContent.includes(EXPECTED_VALIDATION_KEY)) {
    console.log('   ✅ public/index.html has correct validation key');
  } else {
    console.log('   ❌ public/index.html has incorrect validation key');
    allCorrect = false;
  }
} else {
  console.log('   ❌ public/index.html not found');
  allCorrect = false;
}

// Check validation-key.txt
console.log('📁 Checking validation-key.txt...');
if (fs.existsSync('public/validation-key.txt')) {
  const validationKeyContent = fs.readFileSync('public/validation-key.txt', 'utf8').trim();
  if (validationKeyContent === EXPECTED_VALIDATION_KEY) {
    console.log('   ✅ validation-key.txt has correct validation key');
  } else {
    console.log('   ❌ validation-key.txt has incorrect validation key');
    allCorrect = false;
  }
} else {
  console.log('   ❌ validation-key.txt not found');
  allCorrect = false;
}

// Check payment service files
console.log('📁 Checking payment service files...');
const paymentServiceFiles = [
  'src/services/realPiPaymentService.ts',
  'src/services/piTestnetPaymentService.ts',
  'src/services/productionTestnetPaymentService.ts',
  'src/services/piOfficialSDKService.ts',
  'src/services/piBackendSDKService.ts'
];

paymentServiceFiles.forEach(file => {
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
  console.log('🎉 VALIDATION KEY VERIFICATION SUCCESSFUL!');
  console.log('');
  console.log('✅ All files have the correct validation key');
  console.log('✅ Validation key is properly configured');
  console.log('✅ Ready for production testnet payments');
  console.log('');
  console.log('🚀 How to test:');
  console.log('   1. Run: npm start');
  console.log('   2. Open: https://flappypi6856.pinet.com/test in Pi Browser');
  console.log('   3. Use the console log copy button to test payments');
  console.log('   4. The validation key will be used for all payments');
  console.log('');
  console.log('💤 Your validation key is now properly configured!');
} else {
  console.log('❌ VALIDATION KEY VERIFICATION FAILED!');
  console.log('');
  console.log('⚠️ Some files have incorrect validation keys');
  console.log('💡 Run the update script again to fix this');
}
