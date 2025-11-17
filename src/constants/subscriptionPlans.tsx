import React from 'react';
import { Star, Crown, Sparkles } from 'lucide-react';

export interface SubscriptionPlan {
  id: string;
  name: string;
  piPrice: number; // Price in Pi
  coinPrice: number; // Price in Flappy Coins
  duration: string; // Duration display string
  durationDays: number; // Duration of the plan in days
  popular?: boolean;
  savings?: string;
  description: string;
  features: string[];
  color: string; // Gradient color classes
  icon: React.ReactNode; // Icon component
  image: string; // Image URL for the plan card
  cancelable?: boolean;
  cancelNote?: string;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    piPrice: 5,
    coinPrice: 1000,
    duration: '7 days',
    durationDays: 7,
    description: 'Ad-free experience for 7 days',
    color: 'from-blue-500 to-cyan-500',
    icon: <Star className="w-6 h-6" />,
    image: '/npc gif/subscriptionplanbutton.gif.gif',
    features: [
      'No ad network in revive (7 days)',
      'Ad-free gameplay (7 days)',
      '1 Basic Mystery Box',
      '1 of each of 5 power-ups',
      '3,000 Flappy Coins',
      '💎 +500 Flappy Coins daily reward',
    ],
    cancelable: true,
    cancelNote: 'You can cancel your plan from your inventory at any time. No refund will be given.'
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    piPrice: 15,
    coinPrice: 2500,
    duration: '15 days',
    durationDays: 15,
    popular: true,
    savings: 'Most Popular',
    description: 'Ad-free experience for 15 days',
    color: 'from-purple-500 to-pink-500',
    icon: <Crown className="w-6 h-6" />,
    image: '/npc gif/subscriptionplanbutton.gif.gif',
    features: [
      'No ad network in revive (15 days)',
      'Ad-free gameplay (15 days)',
      'Priority support',
      '1 Rare Mystery Box',
      '5 of each of 5 power-ups',
      '15,000 Flappy Coins',
      '💎 +1,000 Flappy Coins daily reward',
    ],
    cancelable: true,
    cancelNote: 'You can cancel your plan from your inventory at any time. No refund will be given.'
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    piPrice: 30,
    coinPrice: 5000,
    duration: '30 days',
    durationDays: 30,
    description: 'Ad-free experience for 30 days',
    color: 'from-yellow-500 to-orange-500',
    icon: <Sparkles className="w-6 h-6" />,
    image: '/npc gif/subscriptionplanbutton.gif.gif',
    features: [
      'No ad network in revive (30 days)',
      'Ad-free gameplay (30 days)',
      'Priority support',
      '1 Legendary Mystery Box',
      '1 random bundle (any bundle)',
      '7 of each of 5 power-ups',
      '30,000 Flappy Coins',
      '💎 +2,000 Flappy Coins daily reward',
      'Fire Phoenix Skin (exclusive)',
    ],
    cancelable: true,
    cancelNote: 'You can cancel your plan from your inventory at any time. No refund will be given.'
  }
];

// Exact rewards for each plan:
// Starter Pack:
//   - 1x Basic Mystery Box (/boxes/basic-box.png)
//   - 1x Shield (/powerups/Shield.png)
//   - 1x Magnet (/powerups/Coin Magnet.png)
//   - 1x Extra Life (/powerups/Extra life.png)
//   - 1x Turbo Start (/powerups/turbo-start.png)
//   - 1x Coin Multiplier (/powerups/2x Coin Multiplier.png)
//   - 3,000 Flappy Coins (/flappycoins.png)
// Premium Pack:
//   - 1x Rare Mystery Box (/boxes/rare-box.png)
//   - 5x Shield (/powerups/Shield.png)
//   - 5x Magnet (/powerups/Coin Magnet.png)
//   - 5x Extra Life (/powerups/Extra life.png)
//   - 5x Turbo Start (/powerups/turbo-start.png)
//   - 5x Coin Multiplier (/powerups/2x Coin Multiplier.png)
//   - 15,000 Flappy Coins (/flappycoins.png)
// Ultimate Pack:
//   - 1x Legendary Mystery Box (/boxes/legendary-box.png)
//   - 1x Random Bundle (various)
//   - 7x Shield (/powerups/Shield.png)
//   - 7x Magnet (/powerups/Coin Magnet.png)
//   - 7x Extra Life (/powerups/Extra life.png)
//   - 7x Turbo Start (/powerups/turbo-start.png)
//   - 7x Coin Multiplier (/powerups/2x Coin Multiplier.png)
//   - 30,000 Flappy Coins (/flappycoins.png)
//   - Fire Phoenix Skin (/birds/bird_12.png) 