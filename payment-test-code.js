
// Payment Testing Code for Browser Console
// Run this in Pi Browser mobile console to test payments

async function testAllPayments() {
  console.log('🧪 Starting comprehensive payment tests...');
  
  // Test scenarios
  const scenarios = [
    {
      name: 'Small Payments',
      items: [
        { id: 'extra-life', name: 'Extra Life', price: 0.99 },
        { id: 'coin-magnet', name: 'Coin Magnet', price: 0.99 }
      ]
    },
    {
      name: 'Medium Payments',
      items: [
        { id: 'bird-1', name: 'Red Flappy', price: 3 },
        { id: 'bird-2', name: 'Green Flappy', price: 4 }
      ]
    },
    {
      name: 'Large Payments',
      items: [
        { id: 'bird-10', name: 'Golden Flappy', price: 30 },
        { id: 'bird-11', name: 'Golden Dragon', price: 50 }
      ]
    },
    {
      name: 'Subscriptions',
      items: [
        { id: 'starter', name: 'Starter Pack', price: 1.0 },
        { id: 'premium', name: 'Premium Pack', price: 5.0 }
      ]
    }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    
    for (const item of scenario.items) {
      console.log(`   💰 Testing: ${item.name} (${item.price} TEST_PI)`);
      
      try {
        // Simulate payment creation
        const payment = await window.Pi.createPayment({
          amount: item.price,
          memo: `Flappy Pi Testnet: ${item.name}`,
          metadata: {
            itemId: item.id,
            itemName: item.name,
            testnet: true
          }
        });
        
        console.log(`   ✅ Payment created: ${payment.identifier}`);
        
        // Simulate item delivery
        const deliveredItems = JSON.parse(localStorage.getItem('testnet_items') || '[]');
        deliveredItems.push({
          id: item.id,
          name: item.name,
          price: item.price,
          deliveredAt: new Date().toISOString(),
          testnet: true
        });
        localStorage.setItem('testnet_items', JSON.stringify(deliveredItems));
        
        console.log(`   📦 Item delivered: ${item.name}`);
        
      } catch (error) {
        console.error(`   ❌ Payment failed: ${error.message}`);
      }
    }
  }
  
  console.log('\n🎉 Payment testing completed!');
  console.log('📦 Delivered items:', JSON.parse(localStorage.getItem('testnet_items') || '[]'));
}

// Run the test
testAllPayments();
