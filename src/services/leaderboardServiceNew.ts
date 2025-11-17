/**
 * Leaderboard Service
 * Handles all leaderboard-related API calls and score submissions
 */

interface LeaderboardEntry {
  id: string;
  pi_user_id: string;
  username: string;
  score: number;
  game_mode: 'classic' | 'screampi' | 'dinopi';
  created_at: string;
  rank?: number;
}

interface UserStats {
  total_games: number;
  best_score: number;
  average_score: number;
  total_score: number;
  rank_position: number;
  games_today: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

interface ScoreSubmission {
  score: number;
  game_mode: 'classic' | 'screampi' | 'dinopi';
  session_duration?: number;
  pi_access_token?: string;
}

export class LeaderboardService {
  private static instance: LeaderboardService;
  private apiBaseUrl: string;

  private constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  }

  public static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  /**
   * Submit a score to the leaderboard
   */
  async submitScore(
    piUserId: string,
    scoreData: ScoreSubmission,
    piAccessToken?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('LeaderboardService: Submitting score...', {
        piUserId,
        score: scoreData.score,
        gameMode: scoreData.game_mode
      });

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (piAccessToken) {
        headers['Authorization'] = `Bearer ${piAccessToken}`;
      }

      const response = await fetch(`${this.apiBaseUrl}/api/leaderboard/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pi_user_id: piUserId,
          score: scoreData.score,
          game_mode: scoreData.game_mode,
          session_duration: scoreData.session_duration || 0,
          pi_access_token: piAccessToken
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit score');
      }

      console.log('LeaderboardService: Score submitted successfully', result);
      return { success: true, data: result.data };

    } catch (error) {
      console.error('LeaderboardService: Score submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit score'
      };
    }
  }

  /**
   * Get top leaderboard entries
   */
  async getLeaderboard(
    gameMode: 'all' | 'classic' | 'screampi' | 'dinopi' = 'all',
    limit: number = 50
  ): Promise<{ success: boolean; data?: LeaderboardEntry[]; error?: string }> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });

      if (gameMode !== 'all') {
        params.append('game_mode', gameMode);
      }

      const response = await fetch(
        `${this.apiBaseUrl}/api/leaderboard/top?${params.toString()}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch leaderboard');
      }

      return { success: true, data: result.data || [] };

    } catch (error) {
      console.error('LeaderboardService: Failed to fetch leaderboard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch leaderboard'
      };
    }
  }

  /**
   * Get daily leaderboard
   */
  async getDailyLeaderboard(
    gameMode: 'all' | 'classic' | 'screampi' | 'dinopi' = 'all',
    limit: number = 50
  ): Promise<{ success: boolean; data?: LeaderboardEntry[]; error?: string }> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });

      if (gameMode !== 'all') {
        params.append('game_mode', gameMode);
      }

      const response = await fetch(
        `${this.apiBaseUrl}/api/leaderboard/daily?${params.toString()}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch daily leaderboard');
      }

      return { success: true, data: result.data || [] };

    } catch (error) {
      console.error('LeaderboardService: Failed to fetch daily leaderboard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch daily leaderboard'
      };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(piUserId: string): Promise<{ success: boolean; data?: UserStats; error?: string }> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/leaderboard/user/${piUserId}/stats`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch user stats');
      }

      return { success: true, data: result.data };

    } catch (error) {
      console.error('LeaderboardService: Failed to fetch user stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user stats'
      };
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(piUserId: string): Promise<{ success: boolean; data?: Achievement[]; error?: string }> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/leaderboard/achievements/${piUserId}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch achievements');
      }

      return { success: true, data: result.data || [] };

    } catch (error) {
      console.error('LeaderboardService: Failed to fetch achievements:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch achievements'
      };
    }
  }

  /**
   * Get user's personal best scores
   */
  async getUserBestScores(piUserId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/leaderboard/user/${piUserId}/best-scores`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch best scores');
      }

      return { success: true, data: result.data || {} };

    } catch (error) {
      console.error('LeaderboardService: Failed to fetch best scores:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch best scores'
      };
    }
  }

  /**
   * Submit score after game over
   * This is the main method to call from game components
   */
  async handleGameOver(
    piUserId: string,
    score: number,
    gameMode: 'classic' | 'screampi' | 'dinopi',
    sessionDuration: number = 0,
    piAccessToken?: string
  ): Promise<{
    submitted: boolean;
    newBest: boolean;
    rank?: number;
    achievements?: Achievement[];
    error?: string;
  }> {
    try {
      // First, get current best score to check if this is a new personal best
      const bestScoresResult = await this.getUserBestScores(piUserId);
      const currentBest = bestScoresResult.data?.[gameMode] || 0;
      const isNewBest = score > currentBest;

      // Submit the score
      const submitResult = await this.submitScore(piUserId, {
        score,
        game_mode: gameMode,
        session_duration: sessionDuration,
        pi_access_token: piAccessToken
      }, piAccessToken);

      if (!submitResult.success) {
        return {
          submitted: false,
          newBest: false,
          error: submitResult.error
        };
      }

      // Get updated achievements if this was a new best
      let newAchievements: Achievement[] = [];
      if (isNewBest) {
        const achievementsResult = await this.getUserAchievements(piUserId);
        newAchievements = achievementsResult.data || [];
      }

      return {
        submitted: true,
        newBest: isNewBest,
        rank: submitResult.data?.rank,
        achievements: newAchievements.length > 0 ? newAchievements : undefined
      };

    } catch (error) {
      console.error('LeaderboardService: Game over handling failed:', error);
      return {
        submitted: false,
        newBest: false,
        error: error instanceof Error ? error.message : 'Failed to handle game over'
      };
    }
  }

  /**
   * Check if leaderboard service is available
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      console.warn('LeaderboardService: Service unavailable:', error);
      return false;
    }
  }

  /**
   * Get leaderboard statistics
   */
  async getLeaderboardStats(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/leaderboard/stats`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch leaderboard stats');
      }

      return { success: true, data: result.data };

    } catch (error) {
      console.error('LeaderboardService: Failed to fetch stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats'
      };
    }
  }
}

// Legacy support for old API - redirect to new service
export class LeaderboardServiceLegacy {
  /**
   * Legacy method: Submit score (redirects to new API)
   */
  static async submitScore(submission: any): Promise<any> {
    const service = LeaderboardService.getInstance();
    return await service.submitScore(
      submission.piUserId,
      {
        score: submission.score,
        game_mode: submission.gameMode === 'endless' ? 'classic' : submission.gameMode,
        session_duration: 0
      }
    );
  }

  /**
   * Legacy method: Get leaderboard (redirects to new API)
   */
  static async getLeaderboard(gameMode: string = 'all', limit: number = 50): Promise<any> {
    const service = LeaderboardService.getInstance();
    const normalizedMode = gameMode === 'endless' ? 'classic' : gameMode;
    return await service.getLeaderboard(normalizedMode as any, limit);
  }
}

// Export singleton instance
export const leaderboardService = LeaderboardService.getInstance();