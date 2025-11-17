export interface DifficultySettings {
  pipeSpeed: number;
  pipeGap: number;
  pipeWidth: number;
  windStrength: number;
  hasWind: boolean;
  hasClouds: boolean;
  hasMovingPipes: boolean;
  timeOfDay: string;
  hasStars: boolean;
  hasNebulaEffect: boolean;
  backgroundScrollSpeed: number;
  level: number;
  backgroundTheme: string;
}

const baseClassicDifficulty: Omit<DifficultySettings, 'timeOfDay' | 'level' | 'backgroundTheme' | 'hasStars' | 'hasNebulaEffect' | 'backgroundScrollSpeed'> = {
  pipeSpeed: 2.2,        // Reduced from 3
  pipeGap: 200,          // Increased from 180
  pipeWidth: 80,
  windStrength: 0,
  hasWind: false,
  hasClouds: true,
  hasMovingPipes: false
};

const baseEndlessDifficulty: Omit<DifficultySettings, 'timeOfDay' | 'level' | 'backgroundTheme' | 'hasStars' | 'hasNebulaEffect' | 'backgroundScrollSpeed'> = {
  pipeSpeed: 2.8,        // Reduced from 4
  pipeGap: 180,          // Increased from 160
  pipeWidth: 70,
  windStrength: 0,
  hasWind: false,
  hasClouds: true,
  hasMovingPipes: false
};

const baseChallengeDifficulty: Omit<DifficultySettings, 'timeOfDay' | 'level' | 'backgroundTheme' | 'hasStars' | 'hasNebulaEffect' | 'backgroundScrollSpeed'> = {
  pipeSpeed: 3.5,        // Reduced from 5
  pipeGap: 160,          // Increased from 140
  pipeWidth: 60,
  windStrength: 0,
  hasWind: false,
  hasClouds: false,
  hasMovingPipes: true
};

export const getScoreMultiplier = (gameMode: 'classic' | 'endless' | 'challenge'): number => {
  switch (gameMode) {
    case 'classic':
      return 1;
    case 'endless':
      return 1.2;
    case 'challenge':
      return 1.5;
    default:
      return 1;
  }
};

export const getBackgroundThemeByLevel = (level: number, gameMode: 'classic' | 'endless' | 'challenge') => {
  // Different progression for different game modes
  if (gameMode === 'challenge') {
    // Challenge mode has faster progression
    if (level >= 15) return 'space';
    if (level >= 10) return 'night';
    if (level >= 5) return 'evening';
    return 'day';
  } else if (gameMode === 'endless') {
    // Endless mode has gradual progression
    if (level >= 25) return 'space';
    if (level >= 18) return 'night';
    if (level >= 12) return 'evening';
    if (level >= 6) return 'sunset';
    return 'day';
  } else {
    // Classic mode - balanced progression
    if (level >= 20) return 'space';
    if (level >= 15) return 'night';
    if (level >= 10) return 'evening';
    if (level >= 5) return 'sunset';
    return 'day';
  }
};

export const getBackgroundGradient = (theme: string) => {
  const gradients = {
    'day': {
      top: '#87CEEB',     // Sky blue
      middle: '#98D8E8',  // Light blue
      bottom: '#B0E0E6'   // Powder blue
    },
    'sunset': {
      top: '#FF6B6B',     // Coral red
      middle: '#FFE66D',  // Golden yellow
      bottom: '#FF8E53'   // Orange
    },
    'evening': {
      top: '#667eea',     // Purple blue
      middle: '#764ba2',  // Deep purple
      bottom: '#f093fb'   // Pink purple
    },
    'night': {
      top: '#0c0c0c',     // Deep black
      middle: '#1a1a2e',  // Dark navy
      bottom: '#16213e'   // Midnight blue
    },
    'space': {
      top: '#000000',     // Pure black
      middle: '#1a0033',  // Deep purple
      bottom: '#330066'   // Dark violet
    }
  };

  return gradients[theme] || gradients['day'];
};

// Enhanced difficulty function that includes background theme
export const getDifficultyByUserChoice = (
  userDifficulty: 'easy' | 'medium' | 'hard', 
  score: number, 
  gameMode: 'classic' | 'endless' | 'challenge'
) => {
  const level = Math.floor(score / 5) + 1;
  const theme = getBackgroundThemeByLevel(level, gameMode);
  
  let baseDifficulty;
  switch (gameMode) {
    case 'classic':
      baseDifficulty = { ...baseClassicDifficulty };
      break;
    case 'endless':
      baseDifficulty = { ...baseEndlessDifficulty };
      break;
    case 'challenge':
      baseDifficulty = { ...baseChallengeDifficulty };
      break;
    default:
      baseDifficulty = { ...baseClassicDifficulty };
      break;
  }

  // Adjust difficulty based on user choice
  if (userDifficulty === 'easy') {
    baseDifficulty.pipeSpeed *= 0.7;    // Reduced from 0.8
    baseDifficulty.pipeGap *= 1.3;      // Increased from 1.2
    baseDifficulty.windStrength = 0;
    baseDifficulty.hasWind = false;
    baseDifficulty.hasMovingPipes = false;
  } else if (userDifficulty === 'hard') {
    baseDifficulty.pipeSpeed *= 1.1;    // Reduced from 1.2
    baseDifficulty.pipeGap *= 0.9;      // Increased from 0.8
    baseDifficulty.hasWind = true;
    baseDifficulty.windStrength = 2;     // Reduced from 3
    baseDifficulty.hasMovingPipes = true;
  }

  return {
    ...baseDifficulty,
    level,
    backgroundTheme: theme,
    timeOfDay: theme, // Keep compatibility with existing code
    // Add visual effects based on theme
    hasStars: theme === 'night' || theme === 'space',
    hasClouds: theme !== 'space',
    hasNebulaEffect: theme === 'space',
    backgroundScrollSpeed: theme === 'space' ? 0.3 : theme === 'night' ? 0.5 : 1.0
  };
};
