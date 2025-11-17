export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  piPrice: number;
  flappyCoinPrice?: number;
  bonusCoins: number;
  label?: 'Best Value' | 'Popular' | 'Limited Time Bonus';
  description?: string;
  image?: string;
  adReward?: number;
  usdPrice?: number;
  quantity?: number;
  type?: 'coins';
}

export const coinShopItems: CoinPackage[] = [
  {
    id: "small-pouch",
    name: "Small Pouch",
    coins: 500,
    piPrice: 1,
    flappyCoinPrice: 1000,
    bonusCoins: 0,
  },
  {
    id: "feather-bag",
    name: "Feather Bag",
    coins: 1200,
    piPrice: 2,
    flappyCoinPrice: 2500,
    bonusCoins: 200,
    label: 'Popular',
  },
  {
    id: "bird-chest",
    name: "Bird Chest",
    coins: 3000,
    piPrice: 5,
    flappyCoinPrice: 6000,
    bonusCoins: 500,
  },
  {
    id: "flap-vault",
    name: "Flap Vault",
    coins: 7500,
    piPrice: 10,
    flappyCoinPrice: 15000,
    bonusCoins: 1500,
    label: 'Best Value',
  },
  {
    id: "gold-nest",
    name: "Gold Nest",
    coins: 20000,
    piPrice: 20,
    flappyCoinPrice: 40000,
    bonusCoins: 5000,
    label: 'Limited Time Bonus',
  },
]; 