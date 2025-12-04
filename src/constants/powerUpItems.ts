export interface PowerUpItem {
  id: string;
  name: string;
  description: string;
  icon: string; // Path to icon or icon component name
  image: string; // Add this line for the image path
  piPrice: number;
  flappyCoinPrice: number;
  coinPrice?: number; // Added coinPrice
  effect: { type: string; quantity: number; }; // Changed effect to an object with type and quantity
  amount: number; // The amount of this power-up the user receives on purchase
  maxQuantity?: number; // Optional max quantity for a power-up
  quantity?: number; // Optional quantity for shop logic
  type?: 'powerup';
}

export const powerUpItems: PowerUpItem[] = [
  {
    id: 'extra-life',
    name: 'Extra Life',
    description: 'Revive once after crashing.',
    icon: '/powerups/extra-life.png',
    image: '/powerups/extra-life.png',
    piPrice: 0.99,
    flappyCoinPrice: 50,
    effect: { type: 'revive', quantity: 1 },
    amount: 1,
    maxQuantity: 1
  },
  {
    id: 'coin-magnet',
    name: 'Coin Magnet',
    description: 'Attract nearby coins for 30 seconds.',
    icon: '/powerups/coin-magnet.png',
    image: '/powerups/coin-magnet.png',
    piPrice: 0.99,
    flappyCoinPrice: 100,
    effect: { type: 'magnet', quantity: 30 },
    amount: 1,
    maxQuantity: 1
  },
  {
    id: '2x-coin-multiplier',
    name: '2x Coin Multiplier',
    description: 'Double coin value for one run.',
    icon: '/powerups/2x-coin-multiplier.png',
    image: '/powerups/2x-coin-multiplier.png',
    piPrice: 0.99,
    flappyCoinPrice: 200,
    effect: { type: 'multiplier', quantity: 2 },
    amount: 1,
    maxQuantity: 1
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Prevent damage from one pipe hit.',
    icon: '/powerups/shield.png',
    image: '/powerups/shield.png',
    piPrice: 0.99,
    flappyCoinPrice: 50,
    effect: { type: 'shield', quantity: 1 },
    amount: 1,
    maxQuantity: 1
  },
  {
    id: 'turbo-start',
    name: 'Turbo Start',
    description: 'Start game at high speed for quick coins.',
    icon: '/powerups/turbo-start.png',
    image: '/powerups/turbo-start.png',
    piPrice: 0.99,
    flappyCoinPrice: 100,
    effect: { type: 'speed_boost', quantity: 5 },
    amount: 1,
    maxQuantity: 1
  }
]; 