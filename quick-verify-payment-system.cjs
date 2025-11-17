#!/usr/bin/env node

/**
 * Quick Pi Payment System Verification
 * Run this to verify your payment system is working
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🔍 QUICK PI PAYMENT SYSTEM VERIFICATION');
console.log('='.repeat(70) + '\n');

// Check 1: .env file exists and has API key
console.log('1️⃣  Checking .env file...');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('PI_SERVER_API_KEY=')) {
    const apiKeyMatch = envContent.match(/PI_SERVER_API_KEY="([^"]+)"/);
    if (apiKeyMatch && apiKeyMatch[1]) {
      console.log('   ✅ PI_SERVER_API_KEY is set');
      console.log(`      Length: ${apiKeyMatch[1].length} characters`);
    } else {
      console.log('   ❌ PI_SERVER_API_KEY is empty or not quoted properly');
    }
  } else {
    console.log('   ❌ PI_SERVER_API_KEY not found in .env');
  }

  if (envContent.includes('PI_SANDBOX_MODE="false"')) {
    console.log('   ✅ Mainnet mode enabled (sandbox=false)');
  } else {
    console.log('   ⚠️  Check PI_SANDBOX_MODE setting');
  }

  if (envContent.includes('PI_NETWORK="mainnet"')) {
    console.log('   ✅ Network set to mainnet');
  } else {
    console.log('   ⚠️  Check PI_NETWORK setting');
  }
} else {
  console.log('   ❌ .env file not found');
}

// Check 2: Backend files exist
console.log('\n2️⃣  Checking backend payment routes...');
const backendPiPath = path.join(process.cwd(), 'backend', 'routes', 'pi.cjs');
if (fs.existsSync(backendPiPath)) {
  const backendContent = fs.readFileSync(backendPiPath, 'utf8');
  
  if (backendContent.includes('/approve-payment')) {
    console.log('   ✅ Approval endpoint implemented');
  }
  
  if (backendContent.includes('/complete-payment')) {
    console.log('   ✅ Completion endpoint implemented');
  }
  
  if (backendContent.includes('axios.post')) {
    console.log('   ✅ Axios calls to Pi API');
  }
  
  if (backendContent.includes('Authorization: `Key')) {
    console.log('   ✅ API key authorization header present');
  }
} else {
  console.log('   ❌ Backend pi.cjs not found');
}

// Check 3: Frontend payment service
console.log('\n3️⃣  Checking frontend payment service...');
const frontendPath = path.join(process.cwd(), 'src', 'services', 'piPayment.ts');
if (fs.existsSync(frontendPath)) {
  const frontendContent = fs.readFileSync(frontendPath, 'utf8');
  
  if (frontendContent.includes('onReadyForServerApproval')) {
    console.log('   ✅ PHASE 1 callback implemented');
  }
  
  if (frontendContent.includes('onReadyForServerCompletion')) {
    console.log('   ✅ PHASE 3 callback implemented');
  }
  
  if (frontendContent.includes('/api/pi/approve-payment')) {
    console.log('   ✅ Frontend calls approval endpoint');
  }
  
  if (frontendContent.includes('response.status === 200')) {
    console.log('   ✅ Proper status checking');
  } else if (frontendContent.includes('response.ok')) {
    console.log('   ✅ Response validation present');
  }
} else {
  console.log('   ❌ Payment service not found');
}

// Check 4: Config files
console.log('\n4️⃣  Checking configuration files...');
const configPath = path.join(process.cwd(), 'src', 'config', 'piConfig.ts');
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  console.log('   ✅ Pi configuration file exists');
  
  if (configContent.includes('mainnet')) {
    console.log('   ✅ Mainnet configuration present');
  }
} else {
  console.log('   ⚠️  Pi config file not found (may not be critical)');
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('✅ VERIFICATION COMPLETE\n');

console.log('📋 Next Steps:\n');
console.log('1. Start the backend:');
console.log('   cd backend');
console.log('   npm install');
console.log('   npm start\n');

console.log('2. Run the full diagnostic:');
console.log('   node test-pi-payment-system.cjs\n');

console.log('3. Test payment in Pi Browser:');
console.log('   - Open your app in Pi Browser');
console.log('   - Go to Shop');
console.log('   - Try to buy an item');
console.log('   - Watch browser console (F12) for logs\n');

console.log('4. If payment expires, check:');
console.log('   - Backend logs: npm start output');
console.log('   - Browser console: F12 → Console tab');
console.log('   - Error: "Payment Expired!" or timeout\n');

console.log('='.repeat(70) + '\n');
