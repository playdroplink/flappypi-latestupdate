export interface GameHistoryEntry {
  id: string;
  userId: string;
  piUserId?: string;
  gameMode: 'classic' | 'endless' | 'challenge';
  score: number;
  level: number;
  coinsEarned: number;
  duration: number; // in seconds
  birdSkin: string;
  isNewHighScore: boolean;
  reviveCount: number;
  extraLivesUsed: number;
  powerUpsUsed: string[];
  timestamp: Date;
  deviceInfo: {
    userAgent: string;
    platform: string;
    isMobile: boolean;
  };
  gameStats: {
    pipesPassed: number;
    coinsCollected: number;
    powerUpsActivated: number;
    distanceTraveled: number;
  };
}

export interface GameHistoryStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  totalPlayTime: number; // in seconds
  averagePlayTime: number; // in seconds
  favoriteBirdSkin: string;
  mostPlayedMode: 'classic' | 'endless' | 'challenge';
  gamesThisWeek: number;
  gamesThisMonth: number;
  improvementRate: number; // percentage improvement over time
}

export interface GameHistoryFilters {
  gameMode?: 'classic' | 'endless' | 'challenge';
  dateRange?: {
    start: Date;
    end: Date;
  };
  minScore?: number;
  maxScore?: number;
  birdSkin?: string;
}

export interface GameHistoryResponse {
  entries: GameHistoryEntry[];
  stats: GameHistoryStats;
  totalCount: number;
  hasMore: boolean;
} 