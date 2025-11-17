import { gameDataService, analyticsService, GameData } from '../lib/supabase';

// Game API endpoints
export const gameAPI = {
  // Save game progress
  async saveProgress(userId: string, gameData: GameData['data']): Promise<boolean> {
    try {
      const result = await gameDataService.saveGameData(userId, gameData);
      return result !== null;
    } catch (error) {
      console.error('Error saving progress:', error);
      return false;
    }
  },

  // Load game progress
  async loadProgress(userId: string): Promise<GameData['data'] | null> {
    try {
      const result = await gameDataService.loadGameData(userId);
      return result?.data || null;
    } catch (error) {
      console.error('Error loading progress:', error);
      return null;
    }
  },

  // Submit score to leaderboard
  async submitScore(username: string, score: number): Promise<boolean> {
    try {
      const result = await gameDataService.submitScore(username, score);
      return result !== null;
    } catch (error) {
      console.error('Error submitting score:', error);
      return false;
    }
  },

  // Get leaderboard
  async getLeaderboard(limit = 10): Promise<any[]> {
    try {
      return await gameDataService.getLeaderboard(limit);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  },

  // Track game event
  async trackEvent(eventName: string, eventData: any): Promise<void> {
    try {
      await analyticsService.trackEvent(eventName, eventData);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  },

  // Get user statistics
  async getUserStats(userId: string): Promise<any> {
    try {
      const gameData = await gameDataService.loadGameData(userId);
      if (!gameData) {
        return {
          gamesPlayed: 0,
          totalDistance: 0,
          totalCoins: 0,
          bestScore: 0,
          achievements: []
        };
      }

      return {
        gamesPlayed: gameData.data.statistics?.gamesPlayed || 0,
        totalDistance: gameData.data.statistics?.totalDistance || 0,
        totalCoins: gameData.data.statistics?.totalCoins || 0,
        bestScore: gameData.data.statistics?.bestScore || gameData.data.highScore || 0,
        achievements: gameData.data.achievements || []
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  },

  // Update user statistics
  async updateUserStats(userId: string, stats: any): Promise<boolean> {
    try {
      const currentData = await gameDataService.loadGameData(userId);
      const updatedData = {
        ...currentData?.data,
        statistics: {
          ...currentData?.data.statistics,
          ...stats
        }
      };

      const result = await gameDataService.saveGameData(userId, updatedData);
      return result !== null;
    } catch (error) {
      console.error('Error updating user stats:', error);
      return false;
    }
  },

  // Get game analytics
  async getAnalytics(): Promise<any> {
    try {
      return await analyticsService.getGameAnalytics();
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  }
}; 