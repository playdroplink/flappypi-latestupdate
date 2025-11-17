export interface GameModeLevel {
  level: number;
  name: string;
  description: string;
  pipeSpeed: number;
  pipeGap: number;
  pipeFrequency: number;
  gravity: number;
  background: string;
  requiredScore: number;
  coinMultiplier: number;
  powerUpChance: number;
  specialFeatures?: string[];
}

export interface GameMode {
  id: 'classic' | 'endless' | 'challenge' | 'smooth' | 'goldrush';
  name: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  unlockRequirement?: string;
  levels: GameModeLevel[];
  rewards: {
    coins: number;
    experience: number;
    powerUps?: string[];
  };
  scriptedCourse?: { delay: number; y: number }[];
}

export const gameModes: GameMode[] = [
  {
    id: 'classic',
    name: 'Classic Mode',
    description: 'The original Flappy Pi experience with progressive difficulty',
    icon: '🎮',
    difficulty: 'Easy',
    levels: [
      {
        level: 1,
        name: 'Beginner Valley',
        description: 'Learn the basics in this gentle introduction',
        pipeSpeed: 1.5,      // Reduced from 2
        pipeGap: 180,        // Increased from 160
        pipeFrequency: 120,  // Increased from 90
        gravity: 0.4,        // Reduced from 0.5
        background: 'bg-gradient-to-b from-sky-300 to-sky-500',
        requiredScore: 5,
        coinMultiplier: 1,
        powerUpChance: 0.3,
        specialFeatures: ['Tutorial hints', 'Larger gaps']
      },
      {
        level: 2,
        name: 'Green Hills',
        description: 'Things start to pick up pace',
        pipeSpeed: 1.7,      // Reduced from 2.2
        pipeGap: 170,        // Increased from 160
        pipeFrequency: 150,  // Increased from 130
        gravity: 0.45,       // Reduced from 0.55
        background: 'bg-gradient-to-b from-green-300 to-green-500',
        requiredScore: 15,
        coinMultiplier: 1.2,
        powerUpChance: 0.25,
        specialFeatures: ['Coin bonuses', 'Speed increase']
      },
      {
        level: 3,
        name: 'Desert Winds',
        description: 'Navigate through sandy challenges',
        pipeSpeed: 2.0,      // Reduced from 2.5
        pipeGap: 160,        // Increased from 140
        pipeFrequency: 130,  // Increased from 110
        gravity: 0.5,        // Reduced from 0.6
        background: 'bg-gradient-to-b from-yellow-300 to-orange-500',
        requiredScore: 30,
        coinMultiplier: 1.5,
        powerUpChance: 0.2,
        specialFeatures: ['Wind effects', 'Moving pipes']
      },
      {
        level: 4,
        name: 'Ocean Depths',
        description: 'Dive deep into aquatic adventures',
        pipeSpeed: 2.3,      // Reduced from 2.8
        pipeGap: 150,        // Increased from 130
        pipeFrequency: 120,  // Increased from 100
        gravity: 0.55,       // Reduced from 0.65
        background: 'bg-gradient-to-b from-blue-400 to-blue-700',
        requiredScore: 50,
        coinMultiplier: 2.0,
        powerUpChance: 0.15,
        specialFeatures: ['Underwater physics', 'Bubble effects']
      },
      {
        level: 5,
        name: 'Space Station',
        description: 'Zero gravity, maximum challenge',
        pipeSpeed: 2.6,      // Reduced from 3.2
        pipeGap: 140,        // Increased from 120
        pipeFrequency: 110,  // Increased from 90
        gravity: 0.6,        // Reduced from 0.7
        background: 'bg-gradient-to-b from-purple-600 to-black',
        requiredScore: 75,
        coinMultiplier: 3.0,
        powerUpChance: 0.1,
        specialFeatures: ['Low gravity', 'Asteroid obstacles', 'Cosmic powerups']
      }
    ],
    rewards: {
      coins: 100,
      experience: 50,
      powerUps: ['shield', 'speed']
    }
  },
  {
    id: 'endless',
    name: 'Endless Mode',
    description: 'Survive as long as you can in this infinite challenge',
    icon: '♾️',
    difficulty: 'Medium',
    levels: [
      {
        level: 1,
        name: 'Infinite Journey',
        description: 'How far can you go?',
        pipeSpeed: 1.8,      // Reduced from 2
        pipeGap: 170,        // Increased from 160
        pipeFrequency: 120,  // Increased from 90
        gravity: 0.45,       // Reduced from 0.5
        background: 'bg-gradient-to-b from-purple-400 to-pink-600',
        requiredScore: 0,
        coinMultiplier: 1.5,
        powerUpChance: 0.2,
        specialFeatures: ['Increasing difficulty', 'Bonus multipliers', 'Special events']
      }
    ],
    rewards: {
      coins: 150,
      experience: 100,
      powerUps: ['magnet', 'extraLife']
    }
  },
  {
    id: 'challenge',
    name: 'Challenge Mode',
    description: 'Extreme difficulty for experienced players only',
    icon: '🔥',
    difficulty: 'Extreme',
    unlockRequirement: 'Complete Classic Mode Level 3',
    levels: [
      {
        level: 1,
        name: 'Hell\'s Gates',
        description: 'Only the most skilled survive here',
        pipeSpeed: 2.2,      // Reduced from 2.5
        pipeGap: 150,        // Increased from 140
        pipeFrequency: 100,  // Increased from 80
        gravity: 0.6,        // Reduced from 0.7
        background: 'bg-gradient-to-b from-red-600 to-black',
        requiredScore: 0,
        coinMultiplier: 5.0,
        powerUpChance: 0.05,
        specialFeatures: ['Maximum difficulty', 'Nightmare mode', 'Elite rewards'],
      }
    ],
    rewards: {
      coins: 500,
      experience: 250,
      powerUps: ['doubleCoins', 'slowMotion', 'shield']
    },
    // Scripted course for challenge mode
    scriptedCourse: [
      { delay: 0, y: 250 },
      { delay: 1200, y: 300 },
      { delay: 2400, y: 180 },
      { delay: 3600, y: 320 },
      { delay: 5000, y: 270 },
    ],
  },
  {
    id: 'smooth',
    name: 'Smooth Gameplay',
    description: 'Optimized for smooth performance and relaxed gaming experience',
    icon: '✨',
    difficulty: 'Easy',
    levels: [
      {
        level: 1,
        name: 'Smooth Valley',
        description: 'Gentle slopes and wide gaps for smooth flying',
        pipeSpeed: 1.2,      // Very slow for smooth experience
        pipeGap: 200,        // Very wide gaps
        pipeFrequency: 150,  // More spacing between pipes
        gravity: 0.35,       // Reduced gravity for easier control
        background: 'bg-gradient-to-b from-cyan-300 to-blue-500',
        requiredScore: 0,
        coinMultiplier: 1.0,
        powerUpChance: 0.4,
        specialFeatures: ['Smooth animations', 'Wide gaps', 'Reduced difficulty', 'Performance optimized']
      },
      {
        level: 2,
        name: 'Smooth Hills',
        description: 'Gradual difficulty increase with smooth transitions',
        pipeSpeed: 1.4,      // Still slow
        pipeGap: 190,        // Still wide
        pipeFrequency: 140,  // Good spacing
        gravity: 0.4,        // Slightly more gravity
        background: 'bg-gradient-to-b from-blue-400 to-indigo-500',
        requiredScore: 10,
        coinMultiplier: 1.1,
        powerUpChance: 0.35,
        specialFeatures: ['Smooth transitions', 'Gentle curves', 'Relaxed gameplay']
      },
      {
        level: 3,
        name: 'Smooth Peaks',
        description: 'Balanced challenge with smooth performance',
        pipeSpeed: 1.6,      // Moderate speed
        pipeGap: 180,        // Good gaps
        pipeFrequency: 130,  // Balanced spacing
        gravity: 0.45,       // Standard gravity
        background: 'bg-gradient-to-b from-indigo-400 to-purple-500',
        requiredScore: 25,
        coinMultiplier: 1.3,
        powerUpChance: 0.3,
        specialFeatures: ['Balanced difficulty', 'Smooth performance', 'Optimized graphics']
      }
    ],
    rewards: {
      coins: 80,
      experience: 40,
      powerUps: ['shield', 'magnet', 'extraLife']
    }
  },
  {
    id: 'goldrush',
    name: 'Gold Rush',
    description: 'Collect massive amounts of coins in this treasure hunting adventure',
    icon: '💰',
    difficulty: 'Medium',
    levels: [
      {
        level: 1,
        name: 'Gold Mine',
        description: 'Mine for coins in this treasure-filled level',
        pipeSpeed: 1.8,
        pipeGap: 150,
        pipeFrequency: 120,
        gravity: 0.5,
        background: 'bg-gradient-to-b from-yellow-400 to-orange-500',
        requiredScore: 0,
        coinMultiplier: 3.0,  // Triple coin rewards
        powerUpChance: 0.6,   // Higher power-up chance
        specialFeatures: ['Triple coin rewards', 'Frequent power-ups', 'Golden pipes', 'Treasure chests']
      },
      {
        level: 2,
        name: 'Diamond Valley',
        description: 'Even more valuable treasures await',
        pipeSpeed: 2.0,
        pipeGap: 140,
        pipeFrequency: 110,
        gravity: 0.55,
        background: 'bg-gradient-to-b from-yellow-300 to-amber-600',
        requiredScore: 50,
        coinMultiplier: 4.0,  // Quadruple coin rewards
        powerUpChance: 0.7,
        specialFeatures: ['Quadruple coin rewards', 'Diamond pipes', 'Rare treasures', 'Golden birds']
      },
      {
        level: 3,
        name: 'Treasure Island',
        description: 'The ultimate treasure hunting experience',
        pipeSpeed: 2.2,
        pipeGap: 130,
        pipeFrequency: 100,
        gravity: 0.6,
        background: 'bg-gradient-to-b from-yellow-200 to-yellow-700',
        requiredScore: 150,
        coinMultiplier: 5.0,  // 5x coin rewards
        powerUpChance: 0.8,
        specialFeatures: ['5x coin rewards', 'Legendary treasures', 'Golden everything', 'Unlimited wealth']
      }
    ],
    rewards: {
      coins: 500,
      experience: 200,
      powerUps: ['Coin Magnet', '2x Coin Multiplier', 'Golden Shield']
    }
  }
];

export const getGameModeById = (id: string): GameMode | undefined => {
  return gameModes.find(mode => mode.id === id);
};

export const getLevelForScore = (gameMode: GameMode, score: number): GameModeLevel => {
  // For classic mode, determine level based on score
  if (gameMode.id === 'classic') {
    for (let i = gameMode.levels.length - 1; i >= 0; i--) {
      if (score >= gameMode.levels[i].requiredScore) {
        return gameMode.levels[i];
      }
    }
  }
  
  // For smooth mode, determine level based on score
  if (gameMode.id === 'smooth') {
    for (let i = gameMode.levels.length - 1; i >= 0; i--) {
      if (score >= gameMode.levels[i].requiredScore) {
        return gameMode.levels[i];
      }
    }
  }
  
  // For goldrush mode, determine level based on score
  if (gameMode.id === 'goldrush') {
    for (let i = gameMode.levels.length - 1; i >= 0; i--) {
      if (score >= gameMode.levels[i].requiredScore) {
        return gameMode.levels[i];
      }
    }
  }
  
  // For endless and challenge, always use level 1 but scale difficulty
  const baseLevel = gameMode.levels[0];
  
  if (gameMode.id === 'endless') {
    // Scale difficulty based on score in endless mode
    const difficultyMultiplier = 1 + (score / 50) * 0.1;
    return {
      ...baseLevel,
      pipeSpeed: baseLevel.pipeSpeed * difficultyMultiplier,
      pipeGap: Math.max(80, baseLevel.pipeGap - (score / 10)),
      pipeFrequency: Math.max(60, baseLevel.pipeFrequency - (score / 5)),
      gravity: Math.min(0.8, baseLevel.gravity + (score / 100) * 0.05),
      coinMultiplier: baseLevel.coinMultiplier + (score / 25) * 0.1,
    };
  }
  
  return baseLevel;
};

export const getUnlockStatus = (gameMode: GameMode, userProgress: any): boolean => {
  if (!gameMode.unlockRequirement) return true;
  
  // Check unlock requirements based on user progress
  // This would need to be connected to actual user progress tracking
  return true; // For now, unlock all modes
}; 