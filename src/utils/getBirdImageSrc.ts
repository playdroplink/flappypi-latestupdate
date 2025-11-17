// Utility to get a valid bird image path from a skin object or id
import { shopItems } from '@/constants/shopItems';

export function getBirdImageSrc(skin: { id?: string; image?: string } | string | undefined | null): string {
  if (!skin) return '/flappy pi gif/flappy-2.gif.gif';
  if (typeof skin === 'string') {
    // Try to find in shopItems
    const shopItem = shopItems.find(item => item.id === skin);
    return shopItem?.image || `/birds2/${skin.replace('bird-', 'bird_')}.gif` || '/flappy pi gif/flappy-2.gif.gif';
  }
  // If object, check image property
  if (skin.image && typeof skin.image === 'string' && skin.image.trim() !== '') {
    return skin.image;
  }
  if (skin.id) {
    const shopItem = shopItems.find(item => item.id === skin.id);
    return shopItem?.image || `/birds2/${skin.id.replace('bird-', 'bird_')}.gif` || '/flappy pi gif/flappy-2.gif.gif';
  }
  return '/flappy pi gif/flappy-2.gif.gif';
} 