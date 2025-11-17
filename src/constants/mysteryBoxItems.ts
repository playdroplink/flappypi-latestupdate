export interface MysteryBoxItem {
  id: string;
  name: string;
  description: string;
  image: string;
  piPrice: number;
  flappyCoinPrice: number;
  coinPrice?: number;
  rewards: string[]; // e.g., 'coins', 'skin', 'item'
  dailyLimit?: number;
  canPurchaseWithAd?: boolean;
  quantity?: number; // Optional quantity for shop logic
  type?: 'mysterybox';
}

export const mysteryBoxItems: MysteryBoxItem[] = [
  {
    id: 'basic-mystery-box',
    name: 'Mystery Box (Basic)',
    description: 'Contains a random reward: coins, a bird skin, or a power-up.',
    image: '/boxes/basic-box.png',
    piPrice: 3,
    flappyCoinPrice: 3000,
    rewards: ['coins', 'skin', 'power-up'],
    dailyLimit: 5,
  },
  {
    id: 'rare-mystery-box',
    name: 'Mystery Box (Rare)',
    description: 'Contains a rare random reward: more coins, a rarer bird skin, or a powerful item.',
    image: '/boxes/rare-box.png',
    piPrice: 7,
    flappyCoinPrice: 7000,
    rewards: ['coins', 'rare-skin', 'powerful-item'],
    dailyLimit: 3,
  },
  {
    id: 'legendary-mystery-box',
    name: 'Mystery Box (Legendary)',
    description: 'Contains a legendary random reward: large amount of coins, a legendary bird skin, or an epic item.',
    image: '/boxes/legendary-box.png',
    piPrice: 15,
    flappyCoinPrice: 15000,
    rewards: ['coins', 'legendary-skin', 'epic-item'],
    dailyLimit: 1,
  },
]; 