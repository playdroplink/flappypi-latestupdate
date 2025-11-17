
// Simple Payment Test - Copy this to browser console
console.log('🧪 Starting Simple Payment Test...');

// Check if Pi SDK is available
if (typeof window !== 'undefined' && window.Pi) {
  console.log('✅ Pi SDK is available');
  
  // Test payment creation
  window.Pi.createPayment({
    amount: 0.01,
    memo: 'Flappy Pi Testnet: Test Payment',
    metadata: {
      test: true,
      testnet: true,
      timestamp: Date.now()
    }
  }).then(payment => {
    console.log('✅ Payment created successfully:', payment);
  }).catch(error => {
    console.error('❌ Payment creation failed:', error);
  });
} else {
  console.error('❌ Pi SDK not available');
}
