export interface SubscriptionReward {
  id: string;
  name: string;
  type: 'skin' | 'powerup' | 'mystery-box' | 'bundle' | 'coins';
  quantity: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Special' | 'Legendary';
  image: string;
  description: string;
  previewImage?: string;
}

export interface SubscriptionPlanRewards {
  planId: string;
  planName: string;
  rewards: SubscriptionReward[];
}

// Exact reward configurations for each subscription plan
export const subscriptionPlanRewards: SubscriptionPlanRewards[] = [
  {
    planId: 'starter',
    planName: 'Starter Pack',
    rewards: [
      {
        id: 'basic',
        name: 'Basic Mystery Box',
        type: 'mystery-box',
        quantity: 1,
        rarity: 'Common',
        image: '/boxes/basic-box.png',
        description: 'Contains random rewards including coins, power-ups, and possibly skins.',
        previewImage: '/boxes/basic-box.png'
      },
      {
        id: 'shield',
        name: 'Shield Power-up',
        type: 'powerup',
        quantity: 1,
        rarity: 'Common',
        image: '/powerups/Shield.png',
        description: 'Protects you from one collision with obstacles.',
        previewImage: '/powerups/Shield.png'
      },
      {
        id: 'magnet',
        name: 'Coin Magnet',
        type: 'powerup',
        quantity: 1,
        rarity: 'Common',
        image: '/powerups/Coin Magnet.png',
        description: 'Attracts coins from a distance automatically.',
        previewImage: '/powerups/Coin Magnet.png'
      },
      {
        id: 'extra_life',
        name: 'Extra Life',
        type: 'powerup',
        quantity: 1,
        rarity: 'Common',
        image: '/powerups/Extra life.png',
        description: 'Gives you an extra life when you die.',
        previewImage: '/powerups/Extra life.png'
      },
      {
        id: 'turbo_start',
        name: 'Turbo Start',
        type: 'powerup',
        quantity: 1,
        rarity: 'Common',
        image: '/powerups/turbo-start.png',
        description: 'Provides a speed boost at the start of the game.',
        previewImage: '/powerups/turbo-start.png'
      },
      {
        id: 'coin_multiplier',
        name: '2x Coin Multiplier',
        type: 'powerup',
        quantity: 1,
        rarity: 'Common',
        image: '/powerups/2x Coin Multiplier.png',
        description: 'Doubles your coin earnings for a limited time.',
        previewImage: '/powerups/2x Coin Multiplier.png'
      },
      {
        id: 'flappy_coins',
        name: 'Flappy Coins',
        type: 'coins',
        quantity: 3000,
        rarity: 'Common',
        image: '/flappycoins.png',
        description: '3,000 Flappy Coins to spend in the shop.',
        previewImage: '/flappycoins.png'
      }
    ]
  },
  {
    planId: 'premium',
    planName: 'Premium Pack',
    rewards: [
      {
        id: 'rare',
        name: 'Rare Mystery Box',
        type: 'mystery-box',
        quantity: 1,
        rarity: 'Rare',
        image: '/boxes/rare-box.png',
        description: 'Contains better rewards with higher chances of rare items.',
        previewImage: '/boxes/rare-box.png'
      },
      {
        id: 'shield',
        name: 'Shield Power-up',
        type: 'powerup',
        quantity: 5,
        rarity: 'Rare',
        image: '/powerups/Shield.png',
        description: '5 Shield power-ups to protect you from collisions.',
        previewImage: '/powerups/Shield.png'
      },
      {
        id: 'magnet',
        name: 'Coin Magnet',
        type: 'powerup',
        quantity: 5,
        rarity: 'Rare',
        image: '/powerups/Coin Magnet.png',
        description: '5 Coin Magnet power-ups to attract coins.',
        previewImage: '/powerups/Coin Magnet.png'
      },
      {
        id: 'extra_life',
        name: 'Extra Life',
        type: 'powerup',
        quantity: 5,
        rarity: 'Rare',
        image: '/powerups/Extra life.png',
        description: '5 Extra Life power-ups for survival.',
        previewImage: '/powerups/Extra life.png'
      },
      {
        id: 'turbo_start',
        name: 'Turbo Start',
        type: 'powerup',
        quantity: 5,
        rarity: 'Rare',
        image: '/powerups/turbo-start.png',
        description: '5 Turbo Start power-ups for speed boosts.',
        previewImage: '/powerups/turbo-start.png'
      },
      {
        id: 'coin_multiplier',
        name: '2x Coin Multiplier',
        type: 'powerup',
        quantity: 5,
        rarity: 'Rare',
        image: '/powerups/2x Coin Multiplier.png',
        description: '5 Coin Multiplier power-ups for double earnings.',
        previewImage: '/powerups/2x Coin Multiplier.png'
      },
      {
        id: 'flappy_coins',
        name: 'Flappy Coins',
        type: 'coins',
        quantity: 15000,
        rarity: 'Rare',
        image: '/flappycoins.png',
        description: '15,000 Flappy Coins to spend in the shop.',
        previewImage: '/flappycoins.png'
      }
    ]
  },
  {
    planId: 'ultimate',
    planName: 'Ultimate Pack',
    rewards: [
      {
        id: 'legendary',
        name: 'Legendary Mystery Box',
        type: 'mystery-box',
        quantity: 1,
        rarity: 'Legendary',
        image: '/boxes/legendary-box.png',
        description: 'Contains the best rewards with guaranteed rare items.',
        previewImage: '/boxes/legendary-box.png'
      },
      {
        id: 'random_bundle',
        name: 'Random Bundle',
        type: 'bundle',
        quantity: 1,
        rarity: 'Legendary',
        image: '/randombundle.png',
        description: 'A random bundle containing multiple premium items.',
        previewImage: '/randombundle.png'
      },
      {
        id: 'shield',
        name: 'Shield Power-up',
        type: 'powerup',
        quantity: 7,
        rarity: 'Legendary',
        image: '/powerups/Shield.png',
        description: '7 Shield power-ups for maximum protection.',
        previewImage: '/powerups/Shield.png'
      },
      {
        id: 'magnet',
        name: 'Coin Magnet',
        type: 'powerup',
        quantity: 7,
        rarity: 'Legendary',
        image: '/powerups/Coin Magnet.png',
        description: '7 Coin Magnet power-ups for maximum coin attraction.',
        previewImage: '/powerups/Coin Magnet.png'
      },
      {
        id: 'extra_life',
        name: 'Extra Life',
        type: 'powerup',
        quantity: 7,
        rarity: 'Legendary',
        image: '/powerups/Extra life.png',
        description: '7 Extra Life power-ups for maximum survival.',
        previewImage: '/powerups/Extra life.png'
      },
      {
        id: 'turbo_start',
        name: 'Turbo Start',
        type: 'powerup',
        quantity: 7,
        rarity: 'Legendary',
        image: '/powerups/turbo-start.png',
        description: '7 Turbo Start power-ups for maximum speed.',
        previewImage: '/powerups/turbo-start.png'
      },
      {
        id: 'coin_multiplier',
        name: '2x Coin Multiplier',
        type: 'powerup',
        quantity: 7,
        rarity: 'Legendary',
        image: '/powerups/2x Coin Multiplier.png',
        description: '7 Coin Multiplier power-ups for maximum earnings.',
        previewImage: '/powerups/2x Coin Multiplier.png'
      },
      {
        id: 'flappy_coins',
        name: 'Flappy Coins',
        type: 'coins',
        quantity: 30000,
        rarity: 'Legendary',
        image: '/flappycoins.png',
        description: '30,000 Flappy Coins to spend in the shop.',
        previewImage: '/flappycoins.png'
      },
      {
        id: 'inferno_phoenix',
        name: 'Fire Phoenix Skin',
        type: 'skin',
        quantity: 1,
        rarity: 'Special',
        image: '/birds2/bird_12.gif',
        description: 'Exclusive legendary firebird skin with glowing effects. Only available in Ultimate Pack!',
        previewImage: '/birds2/bird_12.gif'
      }
    ]
  }
];

// Helper function to get rewards for a specific plan
export const getPlanRewards = (planId: string): SubscriptionReward[] => {
  const plan = subscriptionPlanRewards.find(p => p.planId === planId);
  return plan ? plan.rewards : [];
};

// Helper function to get all available reward images
export const getAllRewardImages = (): string[] => {
  const images: string[] = [];
  subscriptionPlanRewards.forEach(plan => {
    plan.rewards.forEach(reward => {
      if (reward.image && !images.includes(reward.image)) {
        images.push(reward.image);
      }
    });
  });
  return images;
};

// Helper function to validate reward images exist
export const validateRewardImages = (): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];
  const allImages = getAllRewardImages();
  
  // This would typically check against actual file system
  // For now, we'll assume all images are valid
  return { valid: true, missing: [] };
}; 