export interface DragonItem {
  id: string;
  name: string;
  image: string;
  piPrice: number;
  flappyCoinPrice: number;
  isDefault: boolean;
  rarity: 'Special' | 'Legendary';
  supply?: number;
  isLimited?: boolean;
  description?: string;
}

export const dragonItems: DragonItem[] = [
  {
    id: "dragon-0",
    name: "Golden Dragon",
    image: "/birds/golden-dragon.png",
    piPrice: 50,
    flappyCoinPrice: 50000,
    isDefault: false,
    rarity: "Special",
    supply: 2000,
    isLimited: true,
    description: "Flappy skin",
  },
  // Add more dragon characters here in the future
]; 