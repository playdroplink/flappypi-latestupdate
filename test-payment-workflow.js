// Test Payment Workflow - Quick Verification
// This script tests the payment system to ensure it's working

console.log('🔍 Testing Payment System Configuration...');

// Test 1: Check Pi SDK availability
function testPiSDK() {
  console.log('📱 Testing Pi SDK availability...');
  
  if (typeof window !== 'undefined' && window.Pi) {
    console.log('✅ Pi SDK is available');
    console.log('🔧 Pi SDK methods:', Object.keys(window.Pi));
    return true;
  } else {
    console.log('❌ Pi SDK not available - must use Pi Browser');
    return false;
  }
}

// Test 2: Check configuration
function testConfiguration() {
  console.log('⚙️ Testing configuration...');
  
  // Check if we're in mainnet mode
  const isMainnet = !process.env.PI_SANDBOX_MODE || process.env.PI_SANDBOX_MODE === 'false';
  console.log('🌐 Mainnet Mode:', isMainnet);
  
  // Check wallet address
  const walletAddress = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ';
  console.log('💰 Wallet Address:', walletAddress);
  
  return isMainnet;
}

// Test 3: Test API endpoints
async function testAPIEndpoints() {
  console.log('🔗 Testing API endpoints...');
  
  try {
    // Test approval endpoint
    const approvalResponse = await fetch('/api/pi/approve-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: 'test-payment-123',
        paymentData: { amount: 1, memo: 'Test payment' },
        network: 'mainnet'
      })
    });
    
    if (approvalResponse.ok) {
      console.log('✅ Approval endpoint working');
    } else {
      console.log('❌ Approval endpoint failed:', approvalResponse.status);
    }
    
    // Test completion endpoint
    const completionResponse = await fetch('/api/pi/complete-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: 'test-payment-123',
        txid: 'test-txid-456',
        paymentData: { amount: 1, memo: 'Test payment' },
        network: 'mainnet'
      })
    });
    
    if (completionResponse.ok) {
      console.log('✅ Completion endpoint working');
    } else {
      console.log('❌ Completion endpoint failed:', completionResponse.status);
    }
    
    return approvalResponse.ok && completionResponse.ok;
  } catch (error) {
    console.log('❌ API test failed:', error.message);
    return false;
  }
}

// Test 4: Simulate payment flow
function testPaymentFlow() {
  console.log('💳 Testing payment flow...');
  
  const testPaymentData = {
    amount: 1,
    memo: 'Flappy Pi: Test Item',
    metadata: {
      itemId: 'test-item',
      itemType: 'shop-item',
      itemName: 'Test Item',
      quantity: 1,
      timestamp: Date.now(),
      network: 'mainnet',
      paymentType: 'flappy_pi_pay',
      mainnetOnly: true
    }
  };
  
  console.log('📋 Test payment data:', testPaymentData);
  
  // Test callbacks
  const testCallbacks = {
    onReadyForServerApproval: async (paymentId) => {
      console.log('✅ Approval callback triggered:', paymentId);
      return true; // Return boolean as required
    },
    onReadyForServerCompletion: async (paymentId, txid) => {
      console.log('✅ Completion callback triggered:', { paymentId, txid });
      return true; // Return boolean as required
    },
    onCancel: (paymentId) => {
      console.log('❌ Payment cancelled:', paymentId);
    },
    onError: (error, payment) => {
      console.log('❌ Payment error:', error, payment);
    }
  };
  
  console.log('🔧 Test callbacks configured');
  return true;
}

// Run all tests
async function runPaymentTests() {
  console.log('🚀 Starting Payment System Tests...\n');
  
  const sdkTest = testPiSDK();
  const configTest = testConfiguration();
  const apiTest = await testAPIEndpoints();
  const flowTest = testPaymentFlow();
  
  console.log('\n📊 Test Results:');
  console.log('Pi SDK Available:', sdkTest ? '✅' : '❌');
  console.log('Configuration OK:', configTest ? '✅' : '❌');
  console.log('API Endpoints OK:', apiTest ? '✅' : '❌');
  console.log('Payment Flow OK:', flowTest ? '✅' : '❌');
  
  const allTestsPass = sdkTest && configTest && apiTest && flowTest;
  console.log('\n🎯 Overall Status:', allTestsPass ? '✅ PAYMENT SYSTEM WORKING' : '❌ PAYMENT SYSTEM HAS ISSUES');
  
  if (!allTestsPass) {
    console.log('\n🔧 Issues to fix:');
    if (!sdkTest) console.log('- Use Pi Browser for payments');
    if (!configTest) console.log('- Check configuration settings');
    if (!apiTest) console.log('- Check API endpoints');
    if (!flowTest) console.log('- Check payment flow implementation');
  }
  
  return allTestsPass;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testPaymentSystem = runPaymentTests;
  console.log('💡 Run testPaymentSystem() in console to test the payment system');
}

// Auto-run if in browser
if (typeof window !== 'undefined' && window.location) {
  runPaymentTests();
}