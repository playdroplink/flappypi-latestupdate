// =============================================
// UNIFIED LEADERBOARD SYSTEM TYPES
// =============================================
// Comprehensive TypeScript interfaces for all game modes

export type GameMode = 'classic' | 'endless' | 'screampi' | 'dinopi' | 'challenge' | 'flappy-stack' | 'night-mode';

export interface BaseScoreSubmission {
  score: number;
  game_mode: GameMode;
  session_duration: number; // in seconds
  pi_access_token?: string;
  character_used?: string;
  difficulty?: 'easy' | 'normal' | 'hard' | 'expert';
}

export interface ClassicModeSubmission extends BaseScoreSubmission {
  game_mode: 'classic' | 'endless';
  pipes_passed: number;
  coins_collected: number;
  power_ups_used?: string[];
  level_reached: number;
  perfect_passes?: number; // passes without touching anything
}

export interface EndlessModeSubmission extends BaseScoreSubmission {
  game_mode: 'endless';
  pipes_passed: number;
  coins_collected: number;
  power_ups_used?: string[];
  level_reached: number;
  time_survived: number; // in seconds
  night_effects_survived?: number;
}

export interface FlappyStackSubmission extends BaseScoreSubmission {
  game_mode: 'flappy-stack';
  blocks_stacked: number;
  max_height_reached: number;
  perfect_stacks?: number;
  blocks_destroyed: number;
}

export interface NightModeSubmission extends BaseScoreSubmission {
  game_mode: 'night-mode';
  pipes_passed: number;
  coins_collected: number;
  visibility_level: number;
  power_ups_used?: string[];
  level_reached: number;
  night_challenges_completed?: number;
}

export interface ScreamPiSubmission extends BaseScoreSubmission {
  game_mode: 'screampi';
  scream_detections: number;
  max_volume_reached: number;
  distance_traveled: number;
  lives_used: number;
  collectibles_gathered: number;
  power_ups_activated?: string[];
}

export interface DinoPiSubmission extends BaseScoreSubmission {
  game_mode: 'dinopi';
  level_reached: number;
  fossils_collected: number;
  distance_traveled: number;
  environment: 'jungle' | 'volcano' | 'desert' | 'ice';
  weather_conditions: 'sunny' | 'rainy' | 'stormy' | 'snowy';
  collectibles_found: number;
  obstacles_avoided: number;
}

export interface ChallengeSubmission extends BaseScoreSubmission {
  game_mode: 'challenge';
  challenge_id: string;
  challenge_type: string;
  completion_time: number;
  attempts_made: number;
  bonus_points: number;
}

export type ScoreSubmission = ClassicModeSubmission | EndlessModeSubmission | ScreamPiSubmission | DinoPiSubmission | ChallengeSubmission | FlappyStackSubmission | NightModeSubmission;

export interface LeaderboardEntry {
  id: string;
  pi_user_id: string;
  username: string;
  score: number;
  game_mode: GameMode;
  character_used?: string;
  difficulty?: string;
  game_duration?: number;
  coins_collected?: number;
  power_ups_used?: string[];
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  is_verified: boolean;
  is_pi_user: boolean;
  created_at: string;
  updated_at: string;
  rank?: number;
  
  // Game mode specific data (stored as JSON)
  game_data?: {
    classic?: {
      pipes_passed: number;
      level_reached: number;
      perfect_passes?: number;
    };
    screampi?: {
      scream_detections: number;
      max_volume_reached: number;
      distance_traveled: number;
      lives_used: number;
      collectibles_gathered: number;
    };
    dinopi?: {
      level_reached: number;
      fossils_collected: number;
      distance_traveled: number;
      environment: string;
      weather_conditions: string;
      collectibles_found: number;
      obstacles_avoided: number;
    };
    challenge?: {
      challenge_id: string;
      challenge_type: string;
      completion_time: number;
      attempts_made: number;
      bonus_points: number;
    };
  };
}

export interface UserStats {
  pi_user_id: string;
  username: string;
  total_games: number;
  total_score: number;
  average_score: number;
  best_score: number;
  rank_position: number;
  games_today: number;
  last_played: string;
  
  // Per-game-mode stats
  mode_stats: {
    classic: GameModeStats;
    endless: GameModeStats;
    screampi: GameModeStats;
    dinopi: GameModeStats;
    challenge: GameModeStats;
    'flappy-stack': GameModeStats;
    'night-mode': GameModeStats;
  };
}

export interface GameModeStats {
  games_played: number;
  best_score: number;
  average_score: number;
  total_score: number;
  time_played: number; // in seconds
  achievements_unlocked: number;
  rank_position?: number;
  last_played?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  game_mode?: GameMode;
  criteria: {
    type: 'score' | 'games_played' | 'time_played' | 'special';
    value: number;
    comparison: 'gte' | 'lte' | 'eq';
  };
  unlocked_at?: string;
  progress?: number;
  max_progress?: number;
}

export interface LeaderboardFilter {
  game_mode: GameMode | 'all';
  time_period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  difficulty?: string;
  character?: string;
  limit: number;
  offset: number;
}

export interface GameOverResult {
  submitted: boolean;
  newBest: boolean;
  rank?: number;
  achievements?: Achievement[];
  error?: string;
  previousBest?: number;
  scoreImprovement?: number;
  newAchievements?: Achievement[];
}

export interface LeaderboardResponse<T = LeaderboardEntry[]> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Session tracking for analytics and anti-cheat
export interface GameSession {
  session_id: string;
  pi_user_id?: string;
  game_mode: GameMode;
  start_time: string;
  end_time?: string;
  total_duration: number;
  scores_submitted: number;
  best_score_in_session: number;
  games_played: number;
  user_agent?: string;
  ip_address?: string;
  platform?: 'web' | 'mobile' | 'desktop';
}

// Personal best tracking across all modes
export interface PersonalBest {
  pi_user_id: string;
  classic_best: number;
  screampi_best: number;
  dinopi_best: number;
  challenge_best: number;
  overall_best: number;
  updated_at: string;
}

// Leaderboard service configuration
export interface LeaderboardConfig {
  apiBaseUrl: string;
  enableCache: boolean;
  cacheTimeout: number; // in milliseconds
  enableLocalFallback: boolean;
  maxRetries: number;
  retryDelay: number;
}