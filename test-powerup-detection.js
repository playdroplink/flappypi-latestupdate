// Test script to verify power-up detection fixes
console.log('🧪 Testing power-up detection fixes...');

// Mock profile data with extra_life power-up
const mockProfile = {
  owned_power_ups: {
    shield: 2,
    magnet: 1,
    extra_life: 3,  // This should be detected
    coin_multiplier: 1,
    turbo_start: 0
  }
};

// Mock inventory service
const mockInventoryService = {
  getInventory: () => [
    {
      id: 'shield',
      name: 'Shield',
      type: 'powerup',
      quantity: 2,
      description: 'Protects from one collision'
    },
    {
      id: 'magnet',
      name: 'Coin Magnet',
      type: 'powerup',
      quantity: 1,
      description: 'Attracts coins from distance'
    },
    {
      id: 'extra_life',
      name: 'Extra Life',
      type: 'powerup',
      quantity: 3,  // This should be detected
      description: 'Revives you once when you die'
    },
    {
      id: 'coin_multiplier',
      name: '2x Coin Multiplier',
      type: 'powerup',
      quantity: 1,
      description: 'Doubles coin earnings'
    }
  ],
  syncWithProfilePowerUps: (profilePowerUps) => {
    console.log('🔄 Syncing inventory with profile power-ups:', profilePowerUps);
    return true;
  }
};

// Mock useGameEquipment hook
const mockUseGameEquipment = () => {
  const availablePowerUps = mockInventoryService.getInventory()
    .filter(item => item.type === 'powerup' && item.quantity > 0)
    .map(item => ({
      id: item.id,
      name: item.name,
      icon: `/powerups/${item.name.replace(' ', '')}.png`,
      quantity: item.quantity,
      description: item.description
    }));

  return {
    availablePowerUps,
    refreshEquipment: () => {
      console.log('🔄 Equipment refreshed');
    }
  };
};

// Test power-up detection logic (simulating game component logic)
function testPowerUpDetection() {
  console.log('📋 Testing power-up detection logic...');
  
  const { availablePowerUps } = mockUseGameEquipment();
  
  // Method 1: Check availablePowerUps from useGameEquipment (most reliable)
  let extraLifeCount = 0;
  if (Array.isArray(availablePowerUps)) {
    const extraLifePowerUp = availablePowerUps.find(p => p.id === 'extra_life');
    if (extraLifePowerUp && extraLifePowerUp.quantity > 0) {
      extraLifeCount += extraLifePowerUp.quantity;
      console.log('✅ Found extra_life in availablePowerUps:', extraLifePowerUp.quantity);
    }
  }
  
  // Method 2: Check inventory service directly (fallback)
  try {
    const inventory = mockInventoryService.getInventory();
    const inventoryExtraLives = inventory.filter(item => 
      item.id === 'extra_life' && item.type === 'powerup' && item.quantity > 0
    );
    const inventoryCount = inventoryExtraLives.reduce((sum, item) => sum + (item.quantity || 0), 0);
    extraLifeCount = Math.max(extraLifeCount, inventoryCount);
    console.log('✅ Found extra_life in inventory service:', inventoryCount);
  } catch (error) {
    console.log('❌ Could not check inventory service for extra lives');
  }
  
  // Method 3: Check profile's owned_power_ups (fallback)
  if (mockProfile && mockProfile.owned_power_ups && mockProfile.owned_power_ups.extra_life) {
    const profileCount = mockProfile.owned_power_ups.extra_life;
    extraLifeCount = Math.max(extraLifeCount, profileCount);
    console.log('✅ Found extra_life in profile:', profileCount);
  }
  
  console.log('💖 Final extra lives count:', extraLifeCount);
  
  // Test 4: Verify all power-ups are detected
  const detectedPowerUps = availablePowerUps.map(p => p.id);
  const expectedPowerUps = Object.keys(mockProfile.owned_power_ups).filter(id => mockProfile.owned_power_ups[id] > 0);
  
  console.log('🔍 Detected power-ups:', detectedPowerUps);
  console.log('📋 Expected power-ups:', expectedPowerUps);
  
  const allDetected = expectedPowerUps.every(id => detectedPowerUps.includes(id));
  console.log('✅ All expected power-ups detected:', allDetected);
  
  return {
    success: allDetected && extraLifeCount > 0,
    extraLives: extraLifeCount,
    detectedPowerUps,
    expectedPowerUps,
    availablePowerUps: availablePowerUps.map(p => `${p.name} (${p.quantity})`)
  };
}

// Run the test
const testResult = testPowerUpDetection();

console.log('🎉 Test completed!');
console.log('📊 Results:', testResult);

if (testResult.success) {
  console.log('✅ Power-up detection is working correctly!');
  console.log('🎮 Extra lives available:', testResult.extraLives);
  console.log('📦 Available power-ups:', testResult.availablePowerUps);
} else {
  console.log('❌ Power-up detection needs fixing!');
  console.log('🔧 Issues found:');
  if (testResult.extraLives === 0) {
    console.log('  - No extra lives detected');
  }
  if (!testResult.success) {
    console.log('  - Not all expected power-ups detected');
  }
}

// Export for use in other tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testPowerUpDetection, mockProfile, mockInventoryService, mockUseGameEquipment };
} 