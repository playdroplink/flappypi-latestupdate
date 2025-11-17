#!/usr/bin/env node

/**
 * Update Validation Key - Use Specific Key
 * Updates all files to use the specified validation key
 */

const fs = require('fs');

const VALIDATION_KEY = '312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156';

console.log('🔑 Updating Validation Key Throughout System');
console.log('==========================================');
console.log('');
console.log('📋 Using validation key:', VALIDATION_KEY);
console.log('');

// Step 1: Update .env file
console.log('📝 Step 1: Updating .env file...');
if (fs.existsSync('.env')) {
  let envContent = fs.readFileSync('.env', 'utf8');
  
  // Update validation key in .env
  envContent = envContent.replace(
    /REACT_APP_PI_VALIDATION_KEY=.*/,
    `REACT_APP_PI_VALIDATION_KEY=${VALIDATION_KEY}`
  );
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file updated with new validation key');
} else {
  console.log('❌ .env file not found');
}

// Step 2: Update piConfig.ts
console.log('📝 Step 2: Updating piConfig.ts...');
if (fs.existsSync('src/config/piConfig.ts')) {
  let piConfigContent = fs.readFileSync('src/config/piConfig.ts', 'utf8');
  
  // Update validation key in piConfig
  piConfigContent = piConfigContent.replace(
    /VALIDATION_KEY: '.*'/,
    `VALIDATION_KEY: '${VALIDATION_KEY}'`
  );
  
  // Update SDK config validation key
  piConfigContent = piConfigContent.replace(
    /validationKey: '.*'/,
    `validationKey: '${VALIDATION_KEY}'`
  );
  
  fs.writeFileSync('src/config/piConfig.ts', piConfigContent);
  console.log('✅ piConfig.ts updated with new validation key');
} else {
  console.log('❌ piConfig.ts not found');
}

// Step 3: Update public/index.html
console.log('📝 Step 3: Updating public/index.html...');
if (fs.existsSync('public/index.html')) {
  let indexContent = fs.readFileSync('public/index.html', 'utf8');
  
  // Update meta validation key
  indexContent = indexContent.replace(
    /<meta name="pi-validation-key" content=".*" \/>/,
    `<meta name="pi-validation-key" content="${VALIDATION_KEY}" />`
  );
  
  // Update window.__ENV validation key
  indexContent = indexContent.replace(
    /piValidationKey: ".*"/,
    `piValidationKey: "${VALIDATION_KEY}"`
  );
  
  // Update window.TruthWebPay validation key
  indexContent = indexContent.replace(
    /validationKey: '.*'/,
    `validationKey: '${VALIDATION_KEY}'`
  );
  
  // Update window.PiOfficialSDK validation key
  indexContent = indexContent.replace(
    /validationKey: '.*'/,
    `validationKey: '${VALIDATION_KEY}'`
  );
  
  fs.writeFileSync('public/index.html', indexContent);
  console.log('✅ public/index.html updated with new validation key');
} else {
  console.log('❌ public/index.html not found');
}

// Step 4: Update all payment service files
console.log('📝 Step 4: Updating payment service files...');
const paymentServiceFiles = [
  'src/services/realPiPaymentService.ts',
  'src/services/piTestnetPaymentService.ts',
  'src/services/productionTestnetPaymentService.ts',
  'src/services/piOfficialSDKService.ts',
  'src/services/piBackendSDKService.ts'
];

paymentServiceFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Update any validation key references
    content = content.replace(
      /validationKey: '.*'/g,
      `validationKey: '${VALIDATION_KEY}'`
    );
    
    content = content.replace(
      /VALIDATION_KEY: '.*'/g,
      `VALIDATION_KEY: '${VALIDATION_KEY}'`
    );
    
    fs.writeFileSync(file, content);
    console.log(`✅ ${file} updated with new validation key`);
  }
});

// Step 5: Update config files
console.log('📝 Step 5: Updating config files...');
const configFiles = [
  'src/config/mainnetConfig.ts',
  'src/config/truthwebPayConfig.ts',
  'src/lib/config.ts'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Update validation key references
    content = content.replace(
      /validationKey: '.*'/g,
      `validationKey: '${VALIDATION_KEY}'`
    );
    
    content = content.replace(
      /VALIDATION_KEY: '.*'/g,
      `VALIDATION_KEY: '${VALIDATION_KEY}'`
    );
    
    fs.writeFileSync(file, content);
    console.log(`✅ ${file} updated with new validation key`);
  }
});

// Step 6: Create validation key file
console.log('📝 Step 6: Creating validation key file...');
fs.writeFileSync('public/validation-key.txt', VALIDATION_KEY);
console.log('✅ validation-key.txt created');

console.log('');
console.log('🎉 VALIDATION KEY UPDATE COMPLETE!');
console.log('');
console.log('📋 What was updated:');
console.log('   • .env file');
console.log('   • piConfig.ts');
console.log('   • public/index.html');
console.log('   • All payment service files');
console.log('   • All config files');
console.log('   • validation-key.txt');
console.log('');
console.log('🔑 Validation key now set to:');
console.log(`   ${VALIDATION_KEY}`);
console.log('');
console.log('🚀 How to test:');
console.log('   1. Run: npm start');
console.log('   2. Open: https://flappypi6856.pinet.com/test in Pi Browser');
console.log('   3. Use the console log copy button to test payments');
console.log('   4. Check that the validation key is being used');
console.log('');
console.log('💤 This validation key will now be used throughout the system!');
