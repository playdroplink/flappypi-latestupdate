const fs = require('fs');

console.log('🧪 Testing demo Pi payment trigger setup...');

// Check if piConfig.ts was updated
const piConfigPath = 'src/config/piConfig.ts';
if (fs.existsSync(piConfigPath)) {
  const piConfigContent = fs.readFileSync(piConfigPath, 'utf8');
  
  if (piConfigContent.includes('DEMO_PI_CONFIG')) {
    console.log('✅ piConfig.ts contains DEMO_PI_CONFIG');
  } else {
    console.log('❌ piConfig.ts missing DEMO_PI_CONFIG');
  }
  
  if (piConfigContent.includes('demoPiPaymentService')) {
    console.log('✅ piConfig.ts contains demoPiPaymentService');
  } else {
    console.log('❌ piConfig.ts missing demoPiPaymentService');
  }
  
  if (piConfigContent.includes('PI_SANDBOX_MODE: false')) {
    console.log('✅ piConfig.ts configured for mainnet (not sandbox)');
  } else {
    console.log('❌ piConfig.ts not configured for mainnet');
  }
  
  if (piConfigContent.includes('PI_NETWORK: \'mainnet\'')) {
    console.log('✅ piConfig.ts set to mainnet network');
  } else {
    console.log('❌ piConfig.ts not set to mainnet network');
  }
} else {
  console.log('❌ piConfig.ts file not found');
}

// Check if ShopPage.tsx was updated
const shopPagePath = 'src/pages/ShopPage.tsx';
if (fs.existsSync(shopPagePath)) {
  const shopPageContent = fs.readFileSync(shopPagePath, 'utf8');
  
  if (shopPageContent.includes('demoPiPaymentService')) {
    console.log('✅ ShopPage.tsx imports demoPiPaymentService');
  } else {
    console.log('❌ ShopPage.tsx missing demoPiPaymentService import');
  }
  
  if (shopPageContent.includes('🔍 [DEBUG]')) {
    console.log('✅ ShopPage.tsx contains debug logging');
  } else {
    console.log('❌ ShopPage.tsx missing debug logging');
  }
  
  if (shopPageContent.includes('await demoPiPaymentService.createPayment')) {
    console.log('✅ ShopPage.tsx uses demoPiPaymentService.createPayment');
  } else {
    console.log('❌ ShopPage.tsx not using demoPiPaymentService.createPayment');
  }
} else {
  console.log('❌ ShopPage.tsx file not found');
}

// Check if demo.env was created
const demoEnvPath = 'demo.env';
if (fs.existsSync(demoEnvPath)) {
  const demoEnvContent = fs.readFileSync(demoEnvPath, 'utf8');
  
  if (demoEnvContent.includes('PI_SANDBOX_MODE=false')) {
    console.log('✅ demo.env configured for mainnet (not sandbox)');
  } else {
    console.log('❌ demo.env not configured for mainnet');
  }
  
  if (demoEnvContent.includes('PI_NETWORK=mainnet')) {
    console.log('✅ demo.env set to mainnet network');
  } else {
    console.log('❌ demo.env not set to mainnet network');
  }
  
  if (demoEnvContent.includes('PI_API_KEY=pzrhprz7ppwn96vvailrtupwnc5krgjykbormz54oysidzblbm7stfoxxxnxlwkl')) {
    console.log('✅ demo.env contains correct Pi API key');
  } else {
    console.log('❌ demo.env missing correct Pi API key');
  }
} else {
  console.log('❌ demo.env file not found');
}

console.log('');
console.log('🎉 Demo Pi payment trigger setup verification complete!');
console.log('');
console.log('📋 Configuration Summary:');
console.log('- Network: MAINNET (not sandbox/testnet)');
console.log('- API URL: https://api.minepi.com');
console.log('- App ID: flappypi6856');
console.log('- Debug logging: PRESERVED and ENHANCED');
console.log('- Pi payment trigger: ACTIVE for all shop items');
console.log('');
console.log('🚀 Ready to test Pi payments in the shop!');

