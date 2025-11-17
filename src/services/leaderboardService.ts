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
  coinsEarned?: number;
  achievements?: string[];
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
   * Fetch all players from the leaderboard, ranked by highest_score
   */
  static async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('user_scores')
        .select('*')
        .order('highest_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      // Return empty array instead of fallback data to show real online status
      return [];
    }
  }

  /**
   * Fallback leaderboard data when Supabase is unavailable
   * Only returns real player data, no demo/mock data
   */
  private static getFallbackLeaderboard(limit: number = 100): LeaderboardEntry[] {
    // Get local scores from localStorage
    try {
      const localScores = JSON.parse(localStorage.getItem('flappypi-guest-scores') || '[]');
      const fallbackData: LeaderboardEntry[] = localScores.map((score: any, index: number) => ({
        id: `local-${index}`,
        user_id: `guest-${index}`,
        pi_user_id: `guest-${index}`,
        username: `Guest Player ${index + 1}`,
        highest_score: score.score || 0,
        total_games: 1,
        game_mode: 'classic' as const,
        challenge_type: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Only return real player data, no demo entries
      return fallbackData.slice(0, limit);
    } catch (error) {
      console.error('Failed to load fallback leaderboard:', error);
      return [];
    }
  }

  /**
   * Get leaderboard for specific game mode
   */
  static async getGameModeLeaderboard(
    gameMode: 'classic' | 'endless' | 'challenge',
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('user_scores')
        .select('*')
        .eq('game_mode', gameMode)
        .order('highest_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Supabase connection failed, using fallback game mode leaderboard:', error);
      return this.getFallbackLeaderboard(limit).filter(entry => entry.game_mode === gameMode);
    }
  }

  /**
   * Get leaderboard for specific time period
   */
  static async getRankingLeaderboard(
    period: RankingPeriod,
    gameMode?: 'classic' | 'endless' | 'challenge',
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    try {
      let query = supabase
        .from('user_scores')
        .select('*');

      // Add game mode filter if specified
      if (gameMode) {
        query = query.eq('game_mode', gameMode);
      }

      // Add time period filter
      const now = new Date();
      switch (period) {
        case 'daily':
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          query = query.gte('updated_at', startOfDay.toISOString());
          break;
        case 'weekly':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          query = query.gte('updated_at', startOfWeek.toISOString());
          break;
        case 'monthly':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          query = query.gte('updated_at', startOfMonth.toISOString());
          break;
        case 'all-time':
          // No time filter for all-time
          break;
      }

      const { data, error } = await query
        .order('highest_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Supabase connection failed, using fallback ranking leaderboard:', error);
      return this.getFallbackLeaderboard(limit);
    }
  }

  /**
   * Get combined leaderboard with all game modes
   */
  static async getCombinedLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('user_scores')
      .select('*')
      .order('highest_score', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  /**
   * Subscribe to real-time leaderboard updates
   * Uses WebSocket connection for real-time updates
   */
  static subscribeToLeaderboard(callback: (payload: any) => void) {
    console.log('🔄 Starting real-time leaderboard subscription with WebSocket');
    
    // Import WebSocket service dynamically to avoid circular dependencies
    let webSocketService: any = null;
    try {
      const { leaderboardWebSocketService } = require('./leaderboardWebSocketService');
      webSocketService = leaderboardWebSocketService;
    } catch (error) {
      console.warn('WebSocket service not available, falling back to polling');
    }

    if (webSocketService && webSocketService.isSocketConnected()) {
      // Use WebSocket for real-time updates
      const handleLeaderboardData = (data: any) => {
        callback({
          gameMode: data.gameMode || 'classic',
          leaderboard: data.leaderboard || [],
          timestamp: data.timestamp || new Date().toISOString()
        });
      };

      webSocketService.on('leaderboard_data', handleLeaderboardData);
      
      // Join the leaderboard
      webSocketService.joinLeaderboard('classic');

      return { 
        unsubscribe: () => {
          console.log('🛑 Stopping WebSocket leaderboard subscription');
          webSocketService.off('leaderboard_data', handleLeaderboardData);
          webSocketService.leaveLeaderboard('classic');
        } 
      };
    } else {
      // Fallback to polling if WebSocket is not available
      console.log('📡 WebSocket not available, using polling fallback');
      const pollInterval = setInterval(async () => {
        try {
          const leaderboard = await this.getLeaderboard(100);
          callback({
            gameMode: 'classic',
            leaderboard,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error polling leaderboard:', error);
        }
      }, 2000);

      return { 
        unsubscribe: () => {
          console.log('🛑 Stopping polling leaderboard subscription');
          clearInterval(pollInterval);
        } 
      };
    }
  }

  /**
   * Submit or update a user's score (upsert) - Enhanced for multiple game modes
   */
  static async submitScore(
    piUserId: string, 
    username: string, 
    score: number, 
    gameMode: 'classic' | 'endless' | 'challenge' = 'classic',
    challengeType?: string
  ): Promise<{ success: boolean; isNewHigh: boolean; rank?: number }> {
    try {
      // Check if this is a new high score for this game mode
      const { data: existing, error: fetchError } = await supabase
        .from('user_scores')
        .select('highest_score, total_games')
        .eq('pi_user_id', piUserId)
        .eq('game_mode', gameMode)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing score:', fetchError);
        return { success: false, isNewHigh: false };
      }

      const isNewHigh = !existing || score > existing.highest_score;
      const highest_score = isNewHigh ? score : existing?.highest_score || score;
      const total_games = (existing?.total_games || 0) + 1;

      // Submit/update score
      const { error } = await supabase
        .from('user_scores')
        .upsert([
          { 
            pi_user_id: piUserId, 
            username, 
            highest_score, 
            total_games,
            game_mode: gameMode,
            challenge_type: challengeType,
            updated_at: new Date().toISOString()
          }
        ], { onConflict: 'pi_user_id,game_mode' });

      if (error) {
        console.error('Error submitting score:', error);
        return { success: false, isNewHigh: false };
      }

      // Get user's rank
      const rank = await this.getUserRankForGameMode(piUserId, gameMode);

      return { success: true, isNewHigh, rank };
    } catch (error) {
      console.error('❌ Failed to submit score to database:', error);
      return { success: false, isNewHigh: false };
    }
  }

  /**
   * Fallback score submission using localStorage
   */
  private static submitScoreFallback(
    piUserId: string, 
    username: string, 
    score: number, 
    gameMode: 'classic' | 'endless' | 'challenge' = 'classic',
    challengeType?: string
  ): { success: boolean; isNewHigh: boolean; rank?: number } {
    try {
      // Store in localStorage as fallback
      const key = `flappypi-leaderboard-${gameMode}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      
      const newEntry = {
        pi_user_id: piUserId,
        username: username,
        highest_score: score,
        game_mode: gameMode,
        challenge_type: challengeType,
        total_games: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Update or add entry
      const existingIndex = existing.findIndex((entry: any) => 
        entry.pi_user_id === piUserId && entry.game_mode === gameMode
      );

      let isNewHigh = true;
      if (existingIndex >= 0) {
        isNewHigh = score > existing[existingIndex].highest_score;
        if (isNewHigh) {
          existing[existingIndex] = newEntry;
        } else {
          existing[existingIndex].total_games = (existing[existingIndex].total_games || 0) + 1;
          existing[existingIndex].updated_at = new Date().toISOString();
        }
      } else {
        existing.push(newEntry);
      }

      // Sort by score and save
      existing.sort((a: any, b: any) => b.highest_score - a.highest_score);
      localStorage.setItem(key, JSON.stringify(existing));

      // Calculate rank
      const rank = existing.findIndex((entry: any) => 
        entry.pi_user_id === piUserId && entry.game_mode === gameMode
      ) + 1;

      return { success: true, isNewHigh, rank };
    } catch (error) {
      console.error('Failed to submit score to localStorage:', error);
      return { success: false, isNewHigh: false };
    }
  }

  /**
   * Submit score with full game session data
   */
  static async submitGameSession(submission: ScoreSubmission): Promise<{ success: boolean; isNewHigh: boolean; rank?: number }> {
    try {
      const result = await this.submitScore(
        submission.piUserId,
        submission.username,
        submission.score,
        submission.gameMode,
        submission.challengeType
      );

      // Log additional game data if available
      if (submission.coinsEarned || submission.achievements) {
        console.log('Game session data:', {
          coinsEarned: submission.coinsEarned,
          achievements: submission.achievements
        });
      }

      return result;
    } catch (error) {
      console.error('Error submitting game session:', error);
      return { success: false, isNewHigh: false };
    }
  }

  /**
   * Get a specific user's stats for a game mode
   */
  static async getUserStats(piUserId: string, gameMode?: 'classic' | 'endless' | 'challenge'): Promise<LeaderboardEntry | null> {
    let query = supabase
      .from('user_scores')
      .select('*')
      .eq('pi_user_id', piUserId);
    
    if (gameMode) {
      query = query.eq('game_mode', gameMode);
    }
    
    const { data, error } = await query.single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Get user's rank on the leaderboard for specific game mode
   */
  static async getUserRankForGameMode(piUserId: string, gameMode: 'classic' | 'endless' | 'challenge'): Promise<number | null> {
    const { data, error } = await supabase
      .from('user_scores')
      .select('pi_user_id, highest_score')
      .eq('game_mode', gameMode)
      .order('highest_score', { ascending: false });
    if (error) throw error;
    const rank = data?.findIndex((entry: any) => entry.pi_user_id === piUserId);
    return rank !== undefined && rank >= 0 ? rank + 1 : null;
  }

  /**
   * Get user's rank on the combined leaderboard
   */
  static async getUserRank(piUserId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('user_scores')
      .select('pi_user_id, highest_score')
      .order('highest_score', { ascending: false });
    if (error) throw error;
    const rank = data?.findIndex((entry: any) => entry.pi_user_id === piUserId);
    return rank !== undefined && rank >= 0 ? rank + 1 : null;
  }

  /**
   * Get user's stats across all game modes
   */
  static async getUserGameModeStats(piUserId: string): Promise<GameModeScore> {
    const { data, error } = await supabase
      .from('user_scores')
      .select('game_mode, highest_score, total_games, updated_at')
      .eq('pi_user_id', piUserId);
    
    if (error) throw error;

    const stats: GameModeScore = {
      classic: 0,
      endless: 0,
      challenge: 0,
      total_games: 0,
      last_played: new Date().toISOString()
    };

    data?.forEach((entry: any) => {
      if (entry.game_mode === 'classic') stats.classic = entry.highest_score;
      if (entry.game_mode === 'endless') stats.endless = entry.highest_score;
      if (entry.game_mode === 'challenge') stats.challenge = entry.highest_score;
      stats.total_games += entry.total_games || 0;
      
      if (new Date(entry.updated_at) > new Date(stats.last_played)) {
        stats.last_played = entry.updated_at;
      }
    });

    return stats;
  }

  /**
   * Real-time leaderboard updates using Supabase subscriptions
   */
  static subscribeToLeaderboardUpdates(
    gameMode: 'classic' | 'endless' | 'challenge' | 'all',
    callback: (payload: any) => void
  ) {
    let subscription;
    
    if (gameMode === 'all') {
      subscription = supabase
        .channel('leaderboard-updates')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'user_scores' },
          callback
        )
        .subscribe();
    } else {
      subscription = supabase
        .channel(`leaderboard-${gameMode}-updates`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_scores',
            filter: `game_mode=eq.${gameMode}`
          },
          callback
        )
        .subscribe();
    }

    return {
      unsubscribe: () => {
        if (subscription) {
          supabase.removeChannel(subscription);
        }
      }
    };
  }
}
