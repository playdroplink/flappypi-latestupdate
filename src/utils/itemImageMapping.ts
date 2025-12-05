import { shopItems } from '@/constants/shopItems';

/**
 * Maps item IDs to their corresponding image paths
 * Uses exact image paths from the public directory
 */
export const getItemImage = (itemId: string): string => {
  // Try to find the item in shopItems first
  const shopItem = shopItems.find(i => i.id === itemId);
  if (shopItem && shopItem.image) return shopItem.image;

  // Powerups: use exact image paths from /powerups/ directory
  if (itemId.startsWith('powerup_')) {
    const powerupType = itemId.replace('powerup_', '');
    const powerupImages: { [key: string]: string } = {
      'shield': '/powerups/shield.png',
      'magnet': '/powerups/coin-magnet.png',
      'extra_life': '/powerups/extra-life.png',
      'turbo_start': '/powerups/turbo-start.png',
      'coin_multiplier': '/powerups/2x-coin-multiplier.png',
      '2x_coins': '/powerups/2x-coin-multiplier.png',
      'coin_multiplier_2x': '/powerups/2x-coin-multiplier.png'
    };
    return powerupImages[powerupType] || '/powerups/shield.png';
  }

  // Mystery boxes: use exact image paths from /boxes/ directory
  if (itemId.startsWith('mystery_box_')) {
    const boxType = itemId.replace('mystery_box_', '');
    const boxImages: { [key: string]: string } = {
      'basic': '/boxes/basic-box.png',
      'rare': '/boxes/rare-box.png',
      'legendary': '/boxes/legendary-box.png',
      'epic': '/boxes/rare-box.png', // Fallback to rare box for epic
    };
    return boxImages[boxType] || '/boxes/basic-box.png';
  }

  // Bundles: use exact image paths from /boxes/ directory
  if (itemId.endsWith('_pack')) {
    const bundleType = itemId.replace('_pack', '');
    const bundleImages: { [key: string]: string } = {
      'starter': '/boxes/basic-box.png',
      'powerup': '/boxes/rare-box.png',
      'premium': '/boxes/legendary-box.png',
      'skin': '/boxes/rare-box.png',
      'mega': '/boxes/legendary-box.png',
      'ultimate': '/boxes/legendary-box.png'
    };
    return bundleImages[bundleType] || '/boxes/basic-box.png';
  }

  // Random bundle
  if (itemId === 'random_bundle') {
    return '/randombundle.png';
  }

  // Fire Phoenix special case
  if (
    itemId === 'inferno_phoenix' ||
    itemId === 'bird-12' ||
    itemId === 'bird_12'
  ) {
    return '/birds2/bird_12.gif';
  }

  // Skins: use exact image paths from /birds/ directory
  if (/^bird[-_](\d+)$/.test(itemId)) {
    const birdNumber = itemId.split(/[-_]/)[1];
    // Special case for bird-0 (Sky Blue Flappy) - use GIF
    if (birdNumber === '0') {
      return '/birds2/bird_0.gif';
    }
    // Check if the bird image exists, otherwise use bird_0 as fallback
    const birdImages = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    if (birdImages.includes(birdNumber)) {
      return `/birds2/bird_${birdNumber}.gif`;
    }
    return '/birds2/bird_0.gif'; // Fallback to default bird
  }

  // Coins
  if (itemId === 'flappy_coins' || itemId === 'coins') {
    return '/flappycoins.png';
  }

  // Subscriptions and plans
  if (
    itemId.includes('subscription') ||
    itemId.includes('premium') ||
    itemId.includes('ultimate') ||
    itemId === 'starter' ||
    itemId === 'premium' ||
    itemId === 'ultimate' ||
    itemId === 'elite'
  ) {
    return '/npc gif/subscriptionplanbutton.gif.gif';
  }

  // Default fallback
  return '/icons/icon-128x128.png';
};

/**
 * Get the exact image path for a specific item type
 */
export const getExactItemImage = (itemId: string, itemType?: string): string => {
  // For items with explicit image paths, use them directly
  if (itemId.includes('/')) {
    return itemId;
  }

  // Use the main mapping function
  return getItemImage(itemId);
};

/**
 * Validate if an image path exists (basic check)
 */
export const isValidImagePath = (imagePath: string): boolean => {
  if (!imagePath) return false;
  
  // Check if it's a valid path format
  const validPaths = [
    '/powerups/',
    '/boxes/',
    '/birds/',
    '/icons/',
    '/flappycoins.png',
    '/npc gif/subscriptionplanbutton.gif.gif'
  ];
  
  return validPaths.some(path => imagePath.includes(path));
};

export default getItemImage; 