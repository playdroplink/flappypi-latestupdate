// Utility to get a valid bird image path from a skin object or id
import { shopItems } from '@/constants/shopItems';

export function getBirdImageSrc(skin: { id?: string; image?: string } | string | undefined | null): string {
  if (!skin) return '/birds2/bird_0.gif';
  if (typeof skin === 'string') {
    // Handle Fire Phoenix special cases
    if (skin === 'inferno_phoenix' || skin === 'inferno-phoenix') {
      return '/birds2/bird_12.gif';
    }
    // Golden Phoenix normalization
    if (skin === 'golden_phoenix' || skin === 'golden-phoenix' || skin === 'goldenphoenix') {
      return '/birds2/bird_6.gif';
    }
    // Try to find in shopItems
    const shopItem = shopItems.find(item => item.id === skin);
    return shopItem?.image || `/birds2/${skin.replace('bird-', 'bird_')}.gif` || '/birds2/bird_0.gif';
  }
  // If object, check image property
  if (skin.image && typeof skin.image === 'string' && skin.image.trim() !== '') {
    return skin.image;
  }
  if (skin.id) {
    // Handle Fire Phoenix special cases
    if (skin.id === 'inferno_phoenix' || skin.id === 'inferno-phoenix') {
      return '/birds2/bird_12.gif';
    }
    if (skin.id === 'golden_phoenix' || skin.id === 'golden-phoenix' || skin.id === 'goldenphoenix' || skin.id === 'bird-6') {
      return '/birds2/bird_6.gif';
    }
    const shopItem = shopItems.find(item => item.id === skin.id);
    return shopItem?.image || `/birds2/${skin.id.replace('bird-', 'bird_')}.gif` || '/birds2/bird_0.gif';
  }
  return '/birds2/bird_0.gif';
} 