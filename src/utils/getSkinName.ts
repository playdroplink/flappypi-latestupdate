import { shopItems } from '@/constants/shopItems';

export function getSkinNameById(id: string): string {
  const skin = shopItems.find(item => item.id === id && item.type === 'skin');
  return skin ? skin.name : 'Unknown Bird';
} 