import { GameHistoryEntry, GameHistoryStats, GameHistoryFilters, GameHistoryResponse } from '../types/gameHistory';

class GameHistoryService {
  private static instance: GameHistoryService;
  private localStorageKey = 'flappypi-game-history';
  private maxLocalEntries = 1000; // Keep last 1000 games locally

  static getInstance(): GameHistoryService {
    if (!GameHistoryService.instance) {
      GameHistoryService.instance = new GameHistoryService();
    }
    return GameHistoryService.instance;
  }

  /**
   * Record a new game session
   */
  async recordGameSession(gameData: {
    gameMode: 'classic' | 'endless' | 'challenge';
    score: number;
    level: number;
    coinsEarned: number;
    duration: number;
    birdSkin: string;
    isNewHighScore: boolean;
    reviveCount: number;
    extraLivesUsed: number;
    powerUpsUsed: string[];
    gameStats: {
      pipesPassed: number;
      coinsCollected: number;
      powerUpsActivated: number;
      distanceTraveled: number;
    };
  }, profile?: any): Promise<void> {
    try {
      const userId = profile?.pi_user_id || profile?.username || 'anonymous';
      
      const entry: GameHistoryEntry = {
        id: this.generateId(),
        userId,
        piUserId: profile?.pi_user_id,
        ...gameData,
        timestamp: new Date(),
        deviceInfo: this.getDeviceInfo(),
      };

      // Save to localStorage
      this.saveToLocalStorage(entry);

      // Save to Supabase if user is authenticated
      if (profile?.pi_user_id) {
        await this.saveToSupabase(entry);
      }

      console.log('✅ Game session recorded:', entry);
    } catch (error) {
      console.error('❌ Failed to record game session:', error);
    }
  }

  /**
   * Get game history with filters
   */
  async getGameHistory(filters: GameHistoryFilters = {}, page = 1, limit = 20, profile?: any): Promise<GameHistoryResponse> {
    try {
      const userId = profile?.pi_user_id || profile?.username || 'anonymous';

      // Get from localStorage first
      let entries = this.getFromLocalStorage(userId);

      // Apply filters
      entries = this.applyFilters(entries, filters);

      // Sort by timestamp (newest first)
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEntries = entries.slice(startIndex, endIndex);

      // Calculate stats
      const stats = this.calculateStats(entries);

      return {
        entries: paginatedEntries,
        stats,
        totalCount: entries.length,
        hasMore: endIndex < entries.length,
      };
    } catch (error) {
      console.error('❌ Failed to get game history:', error);
      return {
        entries: [],
        stats: this.getDefaultStats(),
        totalCount: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(profile?: any): Promise<GameHistoryStats> {
    try {
      const userId = profile?.pi_user_id || profile?.username || 'anonymous';
      const entries = this.getFromLocalStorage(userId);
      return this.calculateStats(entries);
    } catch (error) {
      console.error('❌ Failed to get user stats:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Clear game history
   */
  async clearGameHistory(profile?: any): Promise<void> {
    try {
      const userId = profile?.pi_user_id || profile?.username || 'anonymous';
      
      // Clear from localStorage
      const allHistory = this.getAllLocalHistory();
      const filteredHistory = allHistory.filter(entry => entry.userId !== userId);
      localStorage.setItem(this.localStorageKey, JSON.stringify(filteredHistory));

      // Clear from Supabase if authenticated
      if (profile?.pi_user_id) {
        await this.clearFromSupabase();
      }

      console.log('✅ Game history cleared');
    } catch (error) {
      console.error('❌ Failed to clear game history:', error);
    }
  }

  /**
   * Export game history as JSON
   */
  exportGameHistory(profile?: any): string {
    try {
      const userId = profile?.pi_user_id || profile?.username || 'anonymous';
      const entries = this.getFromLocalStorage(userId);
      
      const exportData = {
        exportDate: new Date().toISOString(),
        userId,
        totalGames: entries.length,
        entries,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Failed to export game history:', error);
      return '';
    }
  }

  // Private helper methods

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    };
  }

  private saveToLocalStorage(entry: GameHistoryEntry): void {
    try {
      const existingHistory = this.getAllLocalHistory();
      existingHistory.push(entry);

      // Keep only the last maxLocalEntries
      if (existingHistory.length > this.maxLocalEntries) {
        existingHistory.splice(0, existingHistory.length - this.maxLocalEntries);
      }

      localStorage.setItem(this.localStorageKey, JSON.stringify(existingHistory));
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
    }
  }

  private getFromLocalStorage(userId: string): GameHistoryEntry[] {
    try {
      const allHistory = this.getAllLocalHistory();
      return allHistory.filter(entry => entry.userId === userId);
    } catch (error) {
      console.error('❌ Failed to get from localStorage:', error);
      return [];
    }
  }

  private getAllLocalHistory(): GameHistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('❌ Failed to parse localStorage history:', error);
      return [];
    }
  }

  private applyFilters(entries: GameHistoryEntry[], filters: GameHistoryFilters): GameHistoryEntry[] {
    return entries.filter(entry => {
      // Game mode filter
      if (filters.gameMode && entry.gameMode !== filters.gameMode) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const entryDate = new Date(entry.timestamp);
        if (entryDate < filters.dateRange.start || entryDate > filters.dateRange.end) {
          return false;
        }
      }

      // Score range filter
      if (filters.minScore && entry.score < filters.minScore) {
        return false;
      }
      if (filters.maxScore && entry.score > filters.maxScore) {
        return false;
      }

      // Bird skin filter
      if (filters.birdSkin && entry.birdSkin !== filters.birdSkin) {
        return false;
      }

      return true;
    });
  }

  private calculateStats(entries: GameHistoryEntry[]): GameHistoryStats {
    if (entries.length === 0) {
      return this.getDefaultStats();
    }

    const totalGames = entries.length;
    const totalScore = entries.reduce((sum, entry) => sum + entry.score, 0);
    const averageScore = totalScore / totalGames;
    const bestScore = Math.max(...entries.map(entry => entry.score));
    const totalPlayTime = entries.reduce((sum, entry) => sum + entry.duration, 0);
    const averagePlayTime = totalPlayTime / totalGames;

    // Calculate favorite bird skin
    const birdSkinCounts = entries.reduce((counts, entry) => {
      counts[entry.birdSkin] = (counts[entry.birdSkin] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    const favoriteBirdSkin = Object.entries(birdSkinCounts)
      .sort(([,a], [,b]) => b - a)[0][0];

    // Calculate most played mode
    const modeCounts = entries.reduce((counts, entry) => {
      counts[entry.gameMode] = (counts[entry.gameMode] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    const mostPlayedMode = Object.entries(modeCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as 'classic' | 'endless' | 'challenge';

    // Calculate games this week/month
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const gamesThisWeek = entries.filter(entry => 
      new Date(entry.timestamp) >= weekAgo
    ).length;

    const gamesThisMonth = entries.filter(entry => 
      new Date(entry.timestamp) >= monthAgo
    ).length;

    // Calculate improvement rate (compare recent vs older scores)
    const recentEntries = entries.slice(0, Math.min(10, entries.length));
    const olderEntries = entries.slice(-Math.min(10, entries.length));
    
    const recentAvg = recentEntries.reduce((sum, entry) => sum + entry.score, 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((sum, entry) => sum + entry.score, 0) / olderEntries.length;
    const improvementRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    return {
      totalGames,
      totalScore,
      averageScore: Math.round(averageScore),
      bestScore,
      totalPlayTime,
      averagePlayTime: Math.round(averagePlayTime),
      favoriteBirdSkin,
      mostPlayedMode,
      gamesThisWeek,
      gamesThisMonth,
      improvementRate: Math.round(improvementRate),
    };
  }

  private getDefaultStats(): GameHistoryStats {
    return {
      totalGames: 0,
      totalScore: 0,
      averageScore: 0,
      bestScore: 0,
      totalPlayTime: 0,
      averagePlayTime: 0,
      favoriteBirdSkin: 'bird_0',
      mostPlayedMode: 'classic',
      gamesThisWeek: 0,
      gamesThisMonth: 0,
      improvementRate: 0,
    };
  }

  private async saveToSupabase(entry: GameHistoryEntry): Promise<void> {
    // TODO: Implement Supabase integration
    console.log('📊 Would save to Supabase:', entry);
  }

  private async clearFromSupabase(): Promise<void> {
    // TODO: Implement Supabase integration
    console.log('🗑️ Would clear from Supabase');
  }
}

export const gameHistoryService = GameHistoryService.getInstance(); 