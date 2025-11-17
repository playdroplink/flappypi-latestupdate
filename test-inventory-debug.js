// Debug script to test inventory system
console.log('🔍 Testing inventory system...');

// Mock profile with power-ups
const mockProfile = {
  owned_power_ups: {
    shield: 2,
    magnet: 1,
    extra_life: 3,
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
      quantity: 3,
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

// Simulate useGameEquipment logic
function simulateUseGameEquipment() {
  console.log('🎮 Simulating useGameEquipment...');
  
  // Step 1: Get inventory
  const inventory = mockInventoryService.getInventory();
  console.log('📦 Raw inventory:', inventory);
  
  // Step 2: Get power-ups from inventory
  const allPowerUps = inventory.filter(item => item.type === 'powerup' && item.quantity > 0);
  console.log('⚡ Power-ups from inventory:', allPowerUps);
  
  // Step 3: Get power-ups from profile
  let profilePowerUps = [];
  if (mockProfile && mockProfile.owned_power_ups) {
    profilePowerUps = Object.entries(mockProfile.owned_power_ups)
      .filter(([_, quantity]) => typeof quantity === 'number' && quantity > 0)
      .map(([powerUpId, quantity]) => ({
        id: powerUpId,
        name: getPowerUpName(powerUpId),
        icon: getPowerUpIcon(powerUpId),
        quantity: quantity,
        description: getPowerUpDescription(powerUpId)
      }));
  }
  console.log('👤 Power-ups from profile:', profilePowerUps);
  
  // Step 4: Sync inventory with profile
  if (mockProfile && mockProfile.owned_power_ups) {
    mockInventoryService.syncWithProfilePowerUps(mockProfile.owned_power_ups);
  }
  
  // Step 5: Get fresh inventory after sync
  const freshInventory = mockInventoryService.getInventory();
  const freshPowerUps = freshInventory.filter(item => item.type === 'powerup' && item.quantity > 0);
  console.log('🔄 Fresh power-ups after sync:', freshPowerUps);
  
  // Step 6: Combine all sources
  const combinedPowerUps = [...profilePowerUps, ...freshPowerUps, ...allPowerUps];
  console.log('🔗 Combined power-ups:', combinedPowerUps);
  
  // Step 7: Remove duplicates and finalize
  const powerUpsMap = new Map();
  combinedPowerUps.forEach(powerUp => {
    const existing = powerUpsMap.get(powerUp.id);
    if (!existing || powerUp.quantity > existing.quantity) {
      powerUpsMap.set(powerUp.id, powerUp);
    }
  });
  
  const finalPowerUps = Array.from(powerUpsMap.values())
    .filter(item => item.quantity > 0);
  
  console.log('✅ Final available power-ups:', finalPowerUps);
  
  return finalPowerUps;
}

// Helper functions
function getPowerUpName(id) {
  const names = {
    'shield': 'Shield',
    'magnet': 'Coin Magnet',
    'extra_life': 'Extra Life',
    'coin_multiplier': '2x Coin Multiplier',
    'turbo_start': 'Turbo Start'
  };
  return names[id] || id;
}

function getPowerUpIcon(id) {
  const icons = {
    'shield': '/powerups/Shield.png',
    'magnet': '/powerups/Coin Magnet.png',
    'extra_life': '/powerups/Extra life.png',
    'coin_multiplier': '/powerups/2x Coin Multiplier.png',
    'turbo_start': '/powerups/turbo-start.png'
  };
  return icons[id] || '/powerups/Shield.png';
}

function getPowerUpDescription(id) {
  const descriptions = {
    'shield': 'Protects from one collision',
    'magnet': 'Attracts coins from distance',
    'extra_life': 'Revives you once when you die',
    'coin_multiplier': 'Doubles coin earnings',
    'turbo_start': 'Increases game speed temporarily'
  };
  return descriptions[id] || 'Special effect';
}

// Simulate game component logic
function simulateGameComponent() {
  console.log('🎮 Simulating game component...');
  
  const availablePowerUps = simulateUseGameEquipment();
  
  // Define main power-up IDs
  const mainPowerUpIds = ['shield', 'magnet', 'extra_life', 'coin_multiplier', 'turbo_start'];
  
  // Create footer power-ups
  const footerPowerUps = mainPowerUpIds
    .map(id => {
      const powerup = availablePowerUps.find(p => p.id === id);
      return {
        id,
        name: powerup?.name || id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        icon: `/powerups/${id.replace('_', ' ')}.png`,
        quantity: powerup?.quantity || 0
      };
    })
    .filter(powerup => powerup.quantity > 0);
  
  console.log('🎯 Footer power-ups for display:', footerPowerUps);
  
  return {
    availablePowerUps,
    footerPowerUps
  };
}

// Run the test
const result = simulateGameComponent();

console.log('🎉 Test completed!');
console.log('📊 Results:', {
  availablePowerUpsCount: result.availablePowerUps.length,
  footerPowerUpsCount: result.footerPowerUps.length,
  availablePowerUps: result.availablePowerUps.map(p => `${p.name} (${p.quantity})`),
  footerPowerUps: result.footerPowerUps.map(p => `${p.name} (${p.quantity})`)
});

if (result.footerPowerUps.length > 0) {
  console.log('✅ Power-ups should be visible in game!');
} else {
  console.log('❌ No power-ups will be shown in game!');
} 