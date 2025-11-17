import { 
  ScoreSubmission, 
  LeaderboardEntry, 
  UserStats, 
  Achievement, 
  GameOverResult, 
  LeaderboardResponse, 
  LeaderboardFilter, 
  GameSession, 
  PersonalBest, 
  LeaderboardConfig,
  GameMode 
} from '../types/leaderboard';
import { v4 as uuidv4 } from 'uuid';

// =============================================
// UNIFIED LEADERBOARD SERVICE
// =============================================
// Single service to handle all game modes consistently

export class UnifiedLeaderboardService {
  private static instance: UnifiedLeaderboardService;
  private config: LeaderboardConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private currentSession: GameSession | null = null;

  private constructor() {
    this.config = {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://flappypi.fun',
      enableCache: true,
      cacheTimeout: 30000, // 30 seconds
      enableLocalFallback: true,
      maxRetries: 3,
      retryDelay: 1000, // 1 second
    };
  }

  public static getInstance(): UnifiedLeaderboardService {
    if (!UnifiedLeaderboardService.instance) {
      UnifiedLeaderboardService.instance = new UnifiedLeaderboardService();
    }
    return UnifiedLeaderboardService.instance;
  }

  // =============================================
  // SESSION MANAGEMENT
  // =============================================

  public startGameSession(piUserId: string | undefined, gameMode: GameMode): string {
    const sessionId = uuidv4();
    this.currentSession = {
      session_id: sessionId,
      pi_user_id: piUserId,
      game_mode: gameMode,
      start_time: new Date().toISOString(),
      total_duration: 0,
      scores_submitted: 0,
      best_score_in_session: 0,
      games_played: 0,
      user_agent: navigator.userAgent,
      ip_address: undefined, // Will be determined by backend
      platform: this.detectPlatform(),
    };
    return sessionId;
  }

  public endGameSession(): void {
    if (this.currentSession) {
      this.currentSession.end_time = new Date().toISOString();
      this.currentSession.total_duration = 
        new Date().getTime() - new Date(this.currentSession.start_time).getTime();
      
      // Store session for analytics (optional)
      this.storeSessionData(this.currentSession);
      this.currentSession = null;
    }
  }

  private detectPlatform(): 'web' | 'mobile' | 'desktop' {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android|iphone|ipad|mobile/.test(userAgent)) {
      return 'mobile';
    } else if (/electron/.test(userAgent)) {
      return 'desktop';
    }
    return 'web';
  }

  private storeSessionData(session: GameSession): void {
    try {
      const sessions = JSON.parse(localStorage.getItem('flappypi-game-sessions') || '[]');
      sessions.push(session);
      // Keep only last 10 sessions
      if (sessions.length > 10) {
        sessions.splice(0, sessions.length - 10);
      }
      localStorage.setItem('flappypi-game-sessions', JSON.stringify(sessions));
    } catch (error) {
      console.warn('Failed to store session data:', error);
    }
  }

  // =============================================
  // SCORE SUBMISSION
  // =============================================

  public async submitScore(
    piUserId: string,
    username: string,
    scoreData: ScoreSubmission,
    piAccessToken?: string
  ): Promise<LeaderboardResponse<{ rank: number; isNewBest: boolean }>> {
    try {
      // Update current session
      if (this.currentSession) {
        this.currentSession.scores_submitted++;
        this.currentSession.games_played++;
        this.currentSession.best_score_in_session = Math.max(
          this.currentSession.best_score_in_session,
          scoreData.score
        );
      }

      // Validate score data
      if (!this.validateScoreData(scoreData)) {
        return { 
          success: false, 
          error: 'Invalid score data provided' 
        };
      }

      // Try API submission first
      const apiResult = await this.submitScoreToAPI(piUserId, username, scoreData, piAccessToken);
      
      if (apiResult.success) {
        // Update cache
        this.invalidateCache(`leaderboard_${scoreData.game_mode}`);
        this.invalidateCache(`user_stats_${piUserId}`);
        
        return apiResult;
      }

      // Fallback to localStorage if enabled
      if (this.config.enableLocalFallback) {
        return this.submitScoreToLocalStorage(piUserId, username, scoreData);
      }

      return apiResult;
    } catch (error) {
      console.error('UnifiedLeaderboardService: Score submission failed:', error);
      
      // Always try localStorage as final fallback
      if (this.config.enableLocalFallback) {
        return this.submitScoreToLocalStorage(piUserId, username, scoreData);
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  private async submitScoreToAPI(
    piUserId: string,
    username: string,
    scoreData: ScoreSubmission,
    piAccessToken?: string
  ): Promise<LeaderboardResponse<{ rank: number; isNewBest: boolean }>> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const payload = {
          pi_user_id: piUserId,
          username,
          score: scoreData.score,
          game_mode: scoreData.game_mode,
          game_duration: scoreData.session_duration,
          character_used: scoreData.character_used,
          difficulty: scoreData.difficulty || 'normal',
          coins_collected: this.extractCoinsFromSubmission(scoreData),
          power_ups_used: this.extractPowerUpsFromSubmission(scoreData),
          game_data: this.buildGameModeSpecificData(scoreData),
          session_id: this.currentSession?.session_id,
          pi_access_token: piAccessToken,
        };

        const response = await fetch(`${this.config.apiBaseUrl}/api/leaderboard/submit-score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return { 
          success: true, 
          data: {
            rank: result.rank || 0,
            isNewBest: result.isNewBest || false
          }
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(`UnifiedLeaderboardService: API attempt ${attempt} failed:`, error);
        
        if (attempt < this.config.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        }
      }
    }

    return { 
      success: false, 
      error: `API submission failed after ${this.config.maxRetries} attempts: ${lastError!.message}` 
    };
  }

  private submitScoreToLocalStorage(
    piUserId: string,
    username: string,
    scoreData: ScoreSubmission
  ): LeaderboardResponse<{ rank: number; isNewBest: boolean }> {
    try {
      const storageKey = `flappypi-leaderboard-${scoreData.game_mode}`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Find existing user entry
      const existingIndex = existing.findIndex((entry: any) => 
        entry.pi_user_id === piUserId
      );
      
      let isNewBest = true;
      const newEntry: Partial<LeaderboardEntry> = {
        id: uuidv4(),
        pi_user_id: piUserId,
        username,
        score: scoreData.score,
        game_mode: scoreData.game_mode,
        character_used: scoreData.character_used,
        difficulty: scoreData.difficulty,
        game_duration: scoreData.session_duration,
        coins_collected: this.extractCoinsFromSubmission(scoreData),
        power_ups_used: this.extractPowerUpsFromSubmission(scoreData),
        game_data: this.buildGameModeSpecificData(scoreData),
        session_id: this.currentSession?.session_id,
        is_verified: false,
        is_pi_user: !!piUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        const existingEntry = existing[existingIndex];
        isNewBest = scoreData.score > existingEntry.score;
        
        if (isNewBest) {
          existing[existingIndex] = { ...existingEntry, ...newEntry };
        }
      } else {
        existing.push(newEntry);
      }

      // Sort by score and calculate rank
      existing.sort((a: any, b: any) => b.score - a.score);
      const rank = existing.findIndex((entry: any) => entry.pi_user_id === piUserId) + 1;

      localStorage.setItem(storageKey, JSON.stringify(existing));
      
      return {
        success: true,
        data: { rank, isNewBest }
      };
    } catch (error) {
      console.error('UnifiedLeaderboardService: localStorage submission failed:', error);
      return { 
        success: false, 
        error: 'Failed to save score locally' 
      };
    }
  }

  // =============================================
  // GAME OVER HANDLING
  // =============================================

  public async handleGameOver(
    piUserId: string,
    username: string,
    scoreData: ScoreSubmission,
    piAccessToken?: string
  ): Promise<GameOverResult> {
    try {
      // Get current personal best
      const personalBest = await this.getUserPersonalBest(piUserId, scoreData.game_mode);
      const previousBest = personalBest || 0;
      const newBest = scoreData.score > previousBest;
      const scoreImprovement = newBest ? scoreData.score - previousBest : 0;

      // Submit the score
      const submitResult = await this.submitScore(piUserId, username, scoreData, piAccessToken);

      if (!submitResult.success) {
        return {
          submitted: false,
          newBest: false,
          error: submitResult.error,
          previousBest,
          scoreImprovement: 0,
        };
      }

      // Check for new achievements if it's a new best
      let newAchievements: Achievement[] = [];
      if (newBest) {
        newAchievements = await this.checkNewAchievements(piUserId, scoreData);
      }

      return {
        submitted: true,
        newBest,
        rank: submitResult.data?.rank,
        achievements: newAchievements.length > 0 ? newAchievements : undefined,
        previousBest,
        scoreImprovement,
        newAchievements,
      };
    } catch (error) {
      console.error('UnifiedLeaderboardService: Game over handling failed:', error);
      return {
        submitted: false,
        newBest: false,
        error: error instanceof Error ? error.message : 'Failed to handle game over',
        previousBest: 0,
        scoreImprovement: 0,
      };
    }
  }

  // =============================================
  // LEADERBOARD RETRIEVAL
  // =============================================

  public async getLeaderboard(filter: Partial<LeaderboardFilter> = {}): Promise<LeaderboardResponse<LeaderboardEntry[]>> {
    const defaultFilter: LeaderboardFilter = {
      game_mode: 'all',
      time_period: 'all_time',
      limit: 50,
      offset: 0,
      ...filter
    };

    const cacheKey = `leaderboard_${JSON.stringify(defaultFilter)}`;
    
    // Check cache first
    if (this.config.enableCache && this.isValidCache(cacheKey)) {
      return { success: true, data: this.cache.get(cacheKey)!.data };
    }

    try {
      const queryParams = new URLSearchParams({
        limit: defaultFilter.limit.toString(),
        offset: defaultFilter.offset.toString(),
        time_period: defaultFilter.time_period,
      });

      if (defaultFilter.game_mode !== 'all') {
        queryParams.append('game_mode', defaultFilter.game_mode);
      }
      if (defaultFilter.difficulty) {
        queryParams.append('difficulty', defaultFilter.difficulty);
      }
      if (defaultFilter.character) {
        queryParams.append('character', defaultFilter.character);
      }

      const response = await fetch(
        `${this.config.apiBaseUrl}/api/leaderboard?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const leaderboardData = result.data || [];

      // Cache the result
      if (this.config.enableCache) {
        this.cache.set(cacheKey, { data: leaderboardData, timestamp: Date.now() });
      }

      return { 
        success: true, 
        data: leaderboardData,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('UnifiedLeaderboardService: Failed to fetch leaderboard:', error);
      
      // Try localStorage fallback
      if (this.config.enableLocalFallback) {
        return this.getLeaderboardFromLocalStorage(defaultFilter);
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch leaderboard' 
      };
    }
  }

  private getLeaderboardFromLocalStorage(filter: LeaderboardFilter): LeaderboardResponse<LeaderboardEntry[]> {
    try {
      let allEntries: LeaderboardEntry[] = [];

      if (filter.game_mode === 'all') {
        // Combine all game modes
        const gameModes: GameMode[] = ['classic', 'endless', 'screampi', 'dinopi', 'challenge', 'flappy-stack', 'night-mode'];
        for (const gameMode of gameModes) {
          const storageKey = `flappypi-leaderboard-${gameMode}`;
          const modeEntries = JSON.parse(localStorage.getItem(storageKey) || '[]');
          allEntries.push(...modeEntries);
        }
      } else {
        const storageKey = `flappypi-leaderboard-${filter.game_mode}`;
        allEntries = JSON.parse(localStorage.getItem(storageKey) || '[]');
      }

      // Apply filters
      let filteredEntries = allEntries;
      if (filter.difficulty) {
        filteredEntries = filteredEntries.filter(entry => entry.difficulty === filter.difficulty);
      }
      if (filter.character) {
        filteredEntries = filteredEntries.filter(entry => entry.character_used === filter.character);
      }

      // Sort by score
      filteredEntries.sort((a, b) => b.score - a.score);

      // Apply pagination
      const start = filter.offset;
      const end = start + filter.limit;
      const paginatedEntries = filteredEntries.slice(start, end);

      // Add ranks
      paginatedEntries.forEach((entry, index) => {
        entry.rank = start + index + 1;
      });

      return { 
        success: true, 
        data: paginatedEntries,
        pagination: {
          total: filteredEntries.length,
          limit: filter.limit,
          offset: filter.offset,
          hasMore: end < filteredEntries.length
        }
      };
    } catch (error) {
      console.error('UnifiedLeaderboardService: localStorage leaderboard fetch failed:', error);
      return { success: false, error: 'Failed to load leaderboard from local storage' };
    }
  }

  // =============================================
  // USER STATISTICS
  // =============================================

  public async getUserStats(piUserId: string): Promise<LeaderboardResponse<UserStats>> {
    const cacheKey = `user_stats_${piUserId}`;
    
    if (this.config.enableCache && this.isValidCache(cacheKey)) {
      return { success: true, data: this.cache.get(cacheKey)!.data };
    }

    try {
      const response = await fetch(
        `${this.config.apiBaseUrl}/api/leaderboard/user/${piUserId}/stats`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const userStats = result.data;

      if (this.config.enableCache) {
        this.cache.set(cacheKey, { data: userStats, timestamp: Date.now() });
      }

      return { success: true, data: userStats };
    } catch (error) {
      console.error('UnifiedLeaderboardService: Failed to fetch user stats:', error);
      
      // Fallback to localStorage calculation
      if (this.config.enableLocalFallback) {
        return this.calculateUserStatsFromLocalStorage(piUserId);
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch user stats' 
      };
    }
  }

  // =============================================
  // PERSONAL BEST TRACKING
  // =============================================

  public async getUserPersonalBest(piUserId: string, gameMode: GameMode): Promise<number> {
    try {
      const userStats = await this.getUserStats(piUserId);
      if (userStats.success && userStats.data) {
        const modeKey = gameMode === 'flappy-stack' ? 'flappy-stack' : gameMode === 'night-mode' ? 'night-mode' : gameMode;
        return userStats.data.mode_stats[modeKey]?.best_score || 0;
      }
      
      // Fallback to localStorage
      const storageKey = `flappypi-leaderboard-${gameMode}`;
      const entries = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const userEntry = entries.find((entry: any) => entry.pi_user_id === piUserId);
      return userEntry?.score || 0;
    } catch (error) {
      console.error('UnifiedLeaderboardService: Failed to get personal best:', error);
      return 0;
    }
  }

  public async getAllPersonalBests(piUserId: string): Promise<LeaderboardResponse<PersonalBest>> {
    try {
      const stats = await this.getUserStats(piUserId);
      if (!stats.success || !stats.data) {
        throw new Error('Failed to fetch user stats');
      }

      const personalBest: PersonalBest = {
        pi_user_id: piUserId,
        classic_best: stats.data.mode_stats.classic?.best_score || 0,
        screampi_best: stats.data.mode_stats.screampi?.best_score || 0,
        dinopi_best: stats.data.mode_stats.dinopi?.best_score || 0,
        challenge_best: stats.data.mode_stats.challenge?.best_score || 0,
        overall_best: Math.max(
          stats.data.mode_stats.classic?.best_score || 0,
          stats.data.mode_stats.endless?.best_score || 0,
          stats.data.mode_stats.screampi?.best_score || 0,
          stats.data.mode_stats.dinopi?.best_score || 0,
          stats.data.mode_stats.challenge?.best_score || 0,
          stats.data.mode_stats['flappy-stack']?.best_score || 0,
          stats.data.mode_stats['night-mode']?.best_score || 0
        ),
        updated_at: new Date().toISOString(),
      };

      return { success: true, data: personalBest };
    } catch (error) {
      console.error('UnifiedLeaderboardService: Failed to get all personal bests:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch personal bests' 
      };
    }
  }

  // =============================================
  // ACHIEVEMENTS
  // =============================================

  private async checkNewAchievements(piUserId: string, scoreData: ScoreSubmission): Promise<Achievement[]> {
    // Implementation for achievement checking would go here
    // This is a placeholder that should be expanded based on your achievement system
    const newAchievements: Achievement[] = [];
    
    // Example achievement checks
    if (scoreData.score >= 1000) {
      newAchievements.push({
        id: 'score_1000',
        title: 'High Scorer',
        description: 'Reach 1000 points in any game mode',
        icon: '🏆',
        game_mode: scoreData.game_mode,
        criteria: { type: 'score', value: 1000, comparison: 'gte' },
        unlocked_at: new Date().toISOString()
      });
    }
    
    return newAchievements;
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  private validateScoreData(scoreData: ScoreSubmission): boolean {
    if (!scoreData.score || scoreData.score < 0 || scoreData.score > 100000) {
      console.warn('Invalid score value:', scoreData.score);
      return false;
    }
    
    if (!scoreData.game_mode || !['classic', 'endless', 'screampi', 'dinopi', 'challenge', 'flappy-stack', 'night-mode'].includes(scoreData.game_mode)) {
      console.warn('Invalid game mode:', scoreData.game_mode);
      return false;
    }
    
    if (!scoreData.session_duration || scoreData.session_duration < 0) {
      console.warn('Invalid session duration:', scoreData.session_duration);
      return false;
    }
    
    return true;
  }

  private extractCoinsFromSubmission(scoreData: ScoreSubmission): number {
    if ((scoreData.game_mode === 'classic' || scoreData.game_mode === 'endless' || scoreData.game_mode === 'night-mode') && 'coins_collected' in scoreData) {
      return scoreData.coins_collected;
    }
    if (scoreData.game_mode === 'screampi' && 'collectibles_gathered' in scoreData) {
      return scoreData.collectibles_gathered;
    }
    if (scoreData.game_mode === 'dinopi' && 'collectibles_found' in scoreData) {
      return scoreData.collectibles_found;
    }
    if (scoreData.game_mode === 'flappy-stack' && 'blocks_stacked' in scoreData) {
      return scoreData.blocks_stacked * 10; // Convert blocks to coin equivalent
    }
    return 0;
  }

  private extractPowerUpsFromSubmission(scoreData: ScoreSubmission): string[] {
    if ('power_ups_used' in scoreData && scoreData.power_ups_used) {
      return scoreData.power_ups_used;
    }
    if ('power_ups_activated' in scoreData && scoreData.power_ups_activated) {
      return scoreData.power_ups_activated;
    }
    return [];
  }

  private buildGameModeSpecificData(scoreData: ScoreSubmission): any {
    const gameData: any = {};
    
    switch (scoreData.game_mode) {
      case 'classic':
        if ('pipes_passed' in scoreData) {
          gameData.classic = {
            pipes_passed: scoreData.pipes_passed,
            level_reached: scoreData.level_reached,
            perfect_passes: scoreData.perfect_passes,
          };
        }
        break;
      case 'endless':
        if ('pipes_passed' in scoreData) {
          gameData.endless = {
            pipes_passed: scoreData.pipes_passed,
            level_reached: scoreData.level_reached,
            time_survived: 'time_survived' in scoreData ? scoreData.time_survived : 0,
            night_effects_survived: 'night_effects_survived' in scoreData ? scoreData.night_effects_survived : 0,
          };
        }
        break;
      case 'screampi':
        if ('scream_detections' in scoreData) {
          gameData.screampi = {
            scream_detections: scoreData.scream_detections,
            max_volume_reached: scoreData.max_volume_reached,
            distance_traveled: scoreData.distance_traveled,
            lives_used: scoreData.lives_used,
            collectibles_gathered: scoreData.collectibles_gathered,
          };
        }
        break;
      case 'dinopi':
        if ('level_reached' in scoreData) {
          gameData.dinopi = {
            level_reached: scoreData.level_reached,
            fossils_collected: scoreData.fossils_collected,
            distance_traveled: scoreData.distance_traveled,
            environment: scoreData.environment,
            weather_conditions: scoreData.weather_conditions,
            collectibles_found: scoreData.collectibles_found,
            obstacles_avoided: scoreData.obstacles_avoided,
          };
        }
        break;
      case 'challenge':
        if ('challenge_id' in scoreData) {
          gameData.challenge = {
            challenge_id: scoreData.challenge_id,
            challenge_type: scoreData.challenge_type,
            completion_time: scoreData.completion_time,
            attempts_made: scoreData.attempts_made,
            bonus_points: scoreData.bonus_points,
          };
        }
        break;
      case 'flappy-stack':
        if ('blocks_stacked' in scoreData) {
          gameData.flappy_stack = {
            blocks_stacked: scoreData.blocks_stacked,
            max_height_reached: scoreData.max_height_reached,
            perfect_stacks: scoreData.perfect_stacks,
            blocks_destroyed: scoreData.blocks_destroyed,
          };
        }
        break;
      case 'night-mode':
        if ('pipes_passed' in scoreData) {
          gameData.night_mode = {
            pipes_passed: scoreData.pipes_passed,
            level_reached: scoreData.level_reached,
            visibility_level: scoreData.visibility_level,
            night_challenges_completed: 'night_challenges_completed' in scoreData ? scoreData.night_challenges_completed : 0,
          };
        }
        break;
    }
    
    return gameData;
  }

  private calculateUserStatsFromLocalStorage(piUserId: string): LeaderboardResponse<UserStats> {
    // Implementation for calculating user stats from localStorage
    // This would aggregate data from all game mode localStorage entries
    // Placeholder implementation
    return { success: false, error: 'Local stats calculation not implemented' };
  }

  private isValidCache(key: string): boolean {
    if (!this.config.enableCache) return false;
    
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    return Date.now() - cached.timestamp < this.config.cacheTimeout;
  }

  private invalidateCache(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // =============================================
  // SERVICE HEALTH
  // =============================================

  public async isServiceAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public getServiceInfo() {
    return {
      cacheSize: this.cache.size,
      currentSession: this.currentSession,
      config: this.config,
    };
  }
}

// Export singleton instance for easy access
export const unifiedLeaderboardService = UnifiedLeaderboardService.getInstance();