// Dynamic Difficulty System for Flappy Pi
// Adjusts game difficulty, pipe generation, and themes based on player level

export interface DifficultyConfig {
  level: number;
  difficulty: 'very easy' | 'easy' | 'medium' | 'hard' | 'extreme hard';
  theme: 'day' | 'sunset' | 'night' | 'storm';
  pipeConfig: {
    speed: number;
    gapSize: number;
    spacing: number;
    minGap: number;
    maxGap: number;
  };
  gameplayConfig: {
    gravity: number;
    jumpStrength: number;
    terminalVelocity: number;
  };
  visualConfig: {
    backgroundColor: string;
    pipeColor: string;
    cloudSpeed: number;
    effectsIntensity: number;
  };
  description: string;
}

export const DIFFICULTY_THRESHOLDS = {
  VERY_EASY: { min: 1, max: 5 },    // Extended from 2 to 5
  EASY: { min: 6, max: 20 },         // Extended from 9 to 20
  MEDIUM: { min: 21, max: 40 },      // Extended from 29 to 40
  HARD: { min: 41, max: 60 },        // Extended from 49 to 60
  EXTREME_HARD: { min: 61, max: Infinity }  // Moved from 50 to 61
};

export const DIFFICULTY_CONFIGS: DifficultyConfig[] = [
  // Very Easy Mode (Level 1-5)
  {
    level: 1,
    difficulty: 'very easy',
    theme: 'day',
    pipeConfig: {
      speed: 1.0,        // Reduced from 1.2
      gapSize: 180,      // Increased from 160
      spacing: 240,      // Increased from 220
      minGap: 170,       // Increased from 150
      maxGap: 190        // Increased from 170
    },
    gameplayConfig: {
      gravity: 0.15,     // Reduced from 0.18
      jumpStrength: -3.8, // Reduced from -4.0
      terminalVelocity: 5.0 // Reduced from 5.5
    },
    visualConfig: {
      backgroundColor: 'linear-gradient(to bottom, #B3E5FC, #E1F5FE)',
      pipeColor: '#81C784',
      cloudSpeed: 0.3,
      effectsIntensity: 0.1
    },
    description: 'Super beginner friendly! Extra wide gaps and slow pipes.'
  },
  
  // Easy Mode (Level 6-20)
  {
    level: 6,
    difficulty: 'easy',
    theme: 'day',
    pipeConfig: {
      speed: 1.3,        // Reduced from 1.5
      gapSize: 160,      // Increased from 140
      spacing: 220,      // Increased from 200
      minGap: 150,       // Increased from 130
      maxGap: 170        // Increased from 150
    },
    gameplayConfig: {
      gravity: 0.18,     // Reduced from 0.20
      jumpStrength: -4.0, // Reduced from -4.2
      terminalVelocity: 5.5 // Reduced from 6
    },
    visualConfig: {
      backgroundColor: 'linear-gradient(to bottom, #87CEEB, #98D8E8)',
      pipeColor: '#4CAF50',
      cloudSpeed: 0.5,
      effectsIntensity: 0.3
    },
    description: 'Perfect for beginners! Wide gaps and slower pipes.'
  },
  
  // Medium Mode (Level 21-40)
  {
    level: 21,
    difficulty: 'medium',
    theme: 'sunset',
    pipeConfig: {
      speed: 1.7,        // Reduced from 2.0
      gapSize: 140,      // Increased from 120
      spacing: 200,      // Increased from 180
      minGap: 130,       // Increased from 110
      maxGap: 150        // Increased from 130
    },
    gameplayConfig: {
      gravity: 0.22,     // Reduced from 0.25
      jumpStrength: -4.4, // Reduced from -4.6
      terminalVelocity: 7.0 // Reduced from 8
    },
    visualConfig: {
      backgroundColor: 'linear-gradient(to bottom, #FF6B6B, #FFA726)',
      pipeColor: '#FF5722',
      cloudSpeed: 0.8,
      effectsIntensity: 0.5
    },
    description: 'Getting challenging! Moderate gaps with increased speed.'
  },
  
  // Hard Mode (Level 41-60)
  {
    level: 41,
    difficulty: 'hard',
    theme: 'night',
    pipeConfig: {
      speed: 2.2,        // Reduced from 2.5
      gapSize: 120,      // Increased from 100
      spacing: 180,      // Increased from 160
      minGap: 110,       // Increased from 95
      maxGap: 130        // Increased from 110
    },
    gameplayConfig: {
      gravity: 0.26,     // Reduced from 0.30
      jumpStrength: -4.6, // Reduced from -4.8
      terminalVelocity: 8.0 // Reduced from 9
    },
    visualConfig: {
      backgroundColor: 'linear-gradient(to bottom, #2C3E50, #4A6741)',
      pipeColor: '#6A1B9A',
      cloudSpeed: 1.2,
      effectsIntensity: 0.7
    },
    description: 'Expert level! Tight gaps and faster gameplay.'
  },
  
  // Extreme Hard Mode (Level 61+)
  {
    level: 61,
    difficulty: 'extreme hard',
    theme: 'storm',
    pipeConfig: {
      speed: 2.7,        // Reduced from 3.0
      gapSize: 100,      // Increased from 85
      spacing: 160,      // Increased from 140
      minGap: 95,        // Increased from 80
      maxGap: 110        // Increased from 95
    },
    gameplayConfig: {
      gravity: 0.30,     // Reduced from 0.35
      jumpStrength: -4.8, // Reduced from -5.0
      terminalVelocity: 9.0 // Reduced from 10
    },
    visualConfig: {
      backgroundColor: 'linear-gradient(to bottom, #1A1A1A, #8B0000)',
      pipeColor: '#B71C1C',
      cloudSpeed: 2.0,
      effectsIntensity: 1.0
    },
    description: 'INSANE! Only for the most skilled pilots. Extreme precision required!'
  }
];

// Get difficulty configuration based on level
export function getDifficultyConfig(level: number): DifficultyConfig {
  if (level <= DIFFICULTY_THRESHOLDS.VERY_EASY.max) {
    return DIFFICULTY_CONFIGS[0]; // Very Easy
  } else if (level <= DIFFICULTY_THRESHOLDS.EASY.max) {
    return DIFFICULTY_CONFIGS[1]; // Easy
  } else if (level <= DIFFICULTY_THRESHOLDS.MEDIUM.max) {
    return DIFFICULTY_CONFIGS[2]; // Medium
  } else if (level <= DIFFICULTY_THRESHOLDS.HARD.max) {
    return DIFFICULTY_CONFIGS[3]; // Hard
  } else {
    return DIFFICULTY_CONFIGS[4]; // Extreme Hard
  }
}

// Get interpolated difficulty for smooth transitions
export function getInterpolatedDifficulty(level: number): DifficultyConfig {
  const baseConfig = getDifficultyConfig(level);
  
  // For smooth progression within difficulty ranges
  let progressionFactor = 0;
  
  if (level <= 5) {
    progressionFactor = (level - 1) / 4; // 0 to 1 over levels 1-5
  } else if (level <= 20) {
    progressionFactor = (level - 6) / 14; // 0 to 1 over levels 6-20
  } else if (level <= 40) {
    progressionFactor = (level - 21) / 19; // 0 to 1 over levels 21-40
  } else if (level <= 60) {
    progressionFactor = (level - 41) / 19; // 0 to 1 over levels 41-60
  } else {
    progressionFactor = Math.min((level - 61) / 50, 1); // Capped progression for extreme
  }
  
  // Apply smooth difficulty scaling
  const scaledConfig = { ...baseConfig };
  
  // Gradually increase difficulty within ranges
  if (baseConfig.difficulty === 'very easy') {
    scaledConfig.pipeConfig.speed = 1.0 + (progressionFactor * 0.3);
    scaledConfig.pipeConfig.gapSize = 180 - (progressionFactor * 20);
  } else if (baseConfig.difficulty === 'easy') {
    scaledConfig.pipeConfig.speed = 1.3 + (progressionFactor * 0.3);
    scaledConfig.pipeConfig.gapSize = 160 - (progressionFactor * 15);
  } else if (baseConfig.difficulty === 'medium') {
    scaledConfig.pipeConfig.speed = 1.7 + (progressionFactor * 0.3);
    scaledConfig.pipeConfig.gapSize = 140 - (progressionFactor * 15);
  } else if (baseConfig.difficulty === 'hard') {
    scaledConfig.pipeConfig.speed = 2.2 + (progressionFactor * 0.3);
    scaledConfig.pipeConfig.gapSize = 120 - (progressionFactor * 10);
  } else if (baseConfig.difficulty === 'extreme hard') {
    scaledConfig.pipeConfig.speed = 2.7 + (progressionFactor * 0.5);
    scaledConfig.pipeConfig.gapSize = Math.max(100 - (progressionFactor * 5), 90); // Min gap of 90
  }
  
  return scaledConfig;
}

// Get theme based on level
export function getThemeByLevel(level: number): string {
  const config = getDifficultyConfig(level);
  return config.theme;
}

// Get difficulty name with level info
export function getDifficultyLabel(level: number): string {
  const config = getDifficultyConfig(level);
  const difficulty = config.difficulty.toUpperCase();
  
  switch (config.difficulty) {
    case 'very easy':
      return `🐣 VERY EASY (Lv.${level})`;
    case 'easy':
      return `🌟 EASY (Lv.${level})`;
    case 'medium':
      return `🔥 MEDIUM (Lv.${level})`;
    case 'hard':
      return `⚡ HARD (Lv.${level})`;
    case 'extreme hard':
      return `💀 EXTREME HARD (Lv.${level})`;
    default:
      return `Level ${level}`;
  }
}

// Get pipe generation parameters for current level
export function getPipeParams(level: number) {
  const config = getInterpolatedDifficulty(level);
  return {
    speed: config.pipeConfig.speed,
    gapSize: config.pipeConfig.gapSize,
    spacing: config.pipeConfig.spacing,
    minGap: config.pipeConfig.minGap,
    maxGap: config.pipeConfig.maxGap
  };
}

// Get physics parameters for current level
export function getPhysicsParams(level: number) {
  const config = getInterpolatedDifficulty(level);
  return {
    gravity: config.gameplayConfig.gravity,
    jumpStrength: config.gameplayConfig.jumpStrength,
    terminalVelocity: config.gameplayConfig.terminalVelocity
  };
}

// Check if level represents a difficulty milestone
export function isDifficultyMilestone(level: number): boolean {
  return level === 6 || level === 21 || level === 41 || level === 61;
}

// Get milestone message for difficulty changes
export function getMilestoneMessage(level: number): string | null {
  switch (level) {
    case 6:
      return '🌟 EASY MODE UNLOCKED! Day theme with beginner-friendly gameplay!';
    case 21:
      return '🔥 MEDIUM MODE UNLOCKED! Sunset theme with moderate difficulty!';
    case 41:
      return '⚡ HARD MODE UNLOCKED! Night theme with challenging gameplay!';
    case 61:
      return '💀 EXTREME HARD MODE UNLOCKED! Storm theme - Only for experts!';
    default:
      return null;
  }
}

// Generate random pipe gap within difficulty constraints
export function generateRandomGap(level: number): number {
  const config = getInterpolatedDifficulty(level);
  const { minGap, maxGap } = config.pipeConfig;
  return Math.random() * (maxGap - minGap) + minGap;
}

// Export difficulty system info for debugging
export function getDifficultyInfo(level: number) {
  const config = getInterpolatedDifficulty(level);
  return {
    level,
    difficulty: config.difficulty,
    theme: config.theme,
    pipeSpeed: config.pipeConfig.speed,
    gapSize: config.pipeConfig.gapSize,
    gravity: config.gameplayConfig.gravity,
    description: config.description,
    milestone: getMilestoneMessage(level)
  };
}