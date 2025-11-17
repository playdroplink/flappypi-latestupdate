// Fallback Leaderboard Service
// This service provides basic leaderboard functionality without Socket.IO

export interface LeaderboardEntry {
  pi_user_id: string;
  username: string;
  highest_score: number;
  game_mode: string;
  challenge_type?: string;
  total_games: number;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardUpdate {
  gameMode: string;
  leaderboard: LeaderboardEntry[];
  timestamp: string;
}

export interface ScoreSubmission {
  pi_user_id: string;
  username: string;
  score: number;
  game_mode: string;
  challenge_type?: string;
}

export interface UserRank {
  pi_user_id: string;
  game_mode: string;
  rank: number | null;
  total_players: number;
}

class FallbackLeaderboardService {
  private static instance: FallbackLeaderboardService;
  private leaderboardData: Map<string, LeaderboardEntry[]> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  private constructor() {
    // Initialize with empty data
    this.leaderboardData.set('classic', []);
    this.leaderboardData.set('endless', []);
    this.leaderboardData.set('challenge', []);
    this.leaderboardData.set('all-time', []);
  }

  static getInstance(): FallbackLeaderboardService {
    if (!FallbackLeaderboardService.instance) {
      FallbackLeaderboardService.instance = new FallbackLeaderboardService();
    }
    return FallbackLeaderboardService.instance;
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Connection methods (always return false for fallback)
  isSocketConnected(): boolean {
    return false;
  }

  getSocketId(): string | null {
    return null;
  }

  // Leaderboard methods
  joinLeaderboard(gameMode: string): void {
    console.log(`Fallback: Joined leaderboard for ${gameMode}`);
  }

  leaveLeaderboard(gameMode: string): void {
    console.log(`Fallback: Left leaderboard for ${gameMode}`);
  }

  submitScore(scoreData: ScoreSubmission): void {
    console.log('Fallback: Score submission not available in offline mode');
    this.emit('score_submission_error', {
      message: 'Real-time score submission not available in offline mode'
    });
  }

  refreshLeaderboard(gameMode: string): void {
    console.log(`Fallback: Refreshing leaderboard for ${gameMode}`);
    // Emit empty leaderboard data
    this.emit('leaderboard_data', {
      gameMode,
      leaderboard: this.leaderboardData.get(gameMode) || [],
      timestamp: new Date().toISOString()
    });
  }

  getUserRank(piUserId: string, gameMode: string): void {
    console.log(`Fallback: Getting user rank for ${piUserId} in ${gameMode}`);
    this.emit('user_rank', {
      pi_user_id: piUserId,
      game_mode: gameMode,
      rank: null,
      total_players: 0
    });
  }

  // HTTP API methods (fallback to localStorage)
  async getLeaderboardData(gameMode: string, limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      // Try to get from localStorage
      const stored = localStorage.getItem(`flappypi-leaderboard-${gameMode}`);
      if (stored) {
        return JSON.parse(stored).slice(0, limit);
      }
    } catch (error) {
      console.error('Failed to load leaderboard from localStorage:', error);
    }
    return [];
  }

  async submitScoreHTTP(scoreData: ScoreSubmission): Promise<boolean> {
    try {
      // Store in localStorage as fallback
      const key = `flappypi-leaderboard-${scoreData.game_mode}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      
      const newEntry: LeaderboardEntry = {
        pi_user_id: scoreData.pi_user_id,
        username: scoreData.username,
        highest_score: scoreData.score,
        game_mode: scoreData.game_mode,
        challenge_type: scoreData.challenge_type,
        total_games: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Update or add entry
      const existingIndex = existing.findIndex((entry: LeaderboardEntry) => 
        entry.pi_user_id === scoreData.pi_user_id
      );

      if (existingIndex >= 0) {
        if (scoreData.score > existing[existingIndex].highest_score) {
          existing[existingIndex] = newEntry;
        }
      } else {
        existing.push(newEntry);
      }

      // Sort by score and save
      existing.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.highest_score - a.highest_score);
      localStorage.setItem(key, JSON.stringify(existing));

      return true;
    } catch (error) {
      console.error('Failed to submit score to localStorage:', error);
      return false;
    }
  }

  async checkServerHealth(): Promise<boolean> {
    return false; // Always return false for fallback
  }

  // Utility methods
  disconnect(): void {
    this.eventListeners.clear();
  }

  getConnectionStatus(): { connected: boolean; socketId: string | null; reconnectAttempts: number } {
    return {
      connected: false,
      socketId: null,
      reconnectAttempts: 0
    };
  }
}

// Create singleton instance
export const fallbackLeaderboardService = FallbackLeaderboardService.getInstance();
export default fallbackLeaderboardService;
