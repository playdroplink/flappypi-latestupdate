import { useState, useEffect, useCallback } from 'react';
import { gameAPI } from '../api/game';
import { GameData } from '../lib/supabase';

export interface GameProgress {
  coins: number;
  highScore: number;
  level: number;
  achievements: string[];
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    sensitivity: number;
  };
  statistics: {
    gamesPlayed: number;
    totalDistance: number;
    totalCoins: number;
    bestScore: number;
  };
}

export const useGameData = (userId: string) => {
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load game progress
  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await gameAPI.loadProgress(userId);
      if (data) {
        setGameProgress({
          coins: data.coins || 0,
          highScore: data.highScore || 0,
          level: data.level || 1,
          achievements: data.achievements || [],
          settings: {
            soundEnabled: data.settings?.soundEnabled ?? true,
            musicEnabled: data.settings?.musicEnabled ?? true,
            sensitivity: data.settings?.sensitivity ?? 50,
          },
          statistics: {
            gamesPlayed: data.statistics?.gamesPlayed || 0,
            totalDistance: data.statistics?.totalDistance || 0,
            totalCoins: data.statistics?.totalCoins || 0,
            bestScore: data.statistics?.bestScore || data.highScore || 0,
          }
        });
      } else {
        // Initialize default progress
        setGameProgress({
          coins: 0,
          highScore: 0,
          level: 1,
          achievements: [],
          settings: {
            soundEnabled: true,
            musicEnabled: true,
            sensitivity: 50,
          },
          statistics: {
            gamesPlayed: 0,
            totalDistance: 0,
            totalCoins: 0,
            bestScore: 0,
          }
        });
      }
    } catch (err) {
      setError('Failed to load game progress');
      console.error('Error loading progress:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Save game progress
  const saveProgress = useCallback(async (progress: Partial<GameProgress>) => {
    if (!gameProgress) return false;

    try {
      const updatedProgress = { ...gameProgress, ...progress };
      setGameProgress(updatedProgress);

      const success = await gameAPI.saveProgress(userId, updatedProgress);
      if (!success) {
        setError('Failed to save game progress');
        return false;
      }

      return true;
    } catch (err) {
      setError('Failed to save game progress');
      console.error('Error saving progress:', err);
      return false;
    }
  }, [userId, gameProgress]);

  // Update coins
  const updateCoins = useCallback(async (newCoins: number) => {
    if (!gameProgress) return false;

    const updatedProgress = {
      ...gameProgress,
      coins: newCoins,
      statistics: {
        ...gameProgress.statistics,
        totalCoins: gameProgress.statistics.totalCoins + (newCoins - gameProgress.coins)
      }
    };

    return await saveProgress(updatedProgress);
  }, [gameProgress, saveProgress]);

  // Update high score
  const updateHighScore = useCallback(async (newScore: number) => {
    if (!gameProgress || newScore <= gameProgress.highScore) return false;

    const updatedProgress = {
      ...gameProgress,
      highScore: newScore,
      statistics: {
        ...gameProgress.statistics,
        bestScore: Math.max(gameProgress.statistics.bestScore, newScore)
      }
    };

    return await saveProgress(updatedProgress);
  }, [gameProgress, saveProgress]);

  // Update level
  const updateLevel = useCallback(async (newLevel: number) => {
    if (!gameProgress) return false;

    const updatedProgress = {
      ...gameProgress,
      level: newLevel
    };

    return await saveProgress(updatedProgress);
  }, [gameProgress, saveProgress]);

  // Add achievement
  const addAchievement = useCallback(async (achievement: string) => {
    if (!gameProgress || gameProgress.achievements.includes(achievement)) return false;

    const updatedProgress = {
      ...gameProgress,
      achievements: [...gameProgress.achievements, achievement]
    };

    return await saveProgress(updatedProgress);
  }, [gameProgress, saveProgress]);

  // Update settings
  const updateSettings = useCallback(async (settings: Partial<GameProgress['settings']>) => {
    if (!gameProgress) return false;

    const updatedProgress = {
      ...gameProgress,
      settings: { ...gameProgress.settings, ...settings }
    };

    return await saveProgress(updatedProgress);
  }, [gameProgress, saveProgress]);

  // Update statistics
  const updateStatistics = useCallback(async (stats: Partial<GameProgress['statistics']>) => {
    if (!gameProgress) return false;

    const updatedProgress = {
      ...gameProgress,
      statistics: { ...gameProgress.statistics, ...stats }
    };

    return await saveProgress(updatedProgress);
  }, [gameProgress, saveProgress]);

  // Submit score to leaderboard
  const submitScore = useCallback(async (username: string, score: number) => {
    try {
      return await gameAPI.submitScore(username, score);
    } catch (err) {
      console.error('Error submitting score:', err);
      return false;
    }
  }, []);

  // Track game event
  const trackEvent = useCallback(async (eventName: string, eventData: any) => {
    try {
      await gameAPI.trackEvent(eventName, eventData);
    } catch (err) {
      console.error('Error tracking event:', err);
    }
  }, []);

  // Load progress on mount
  useEffect(() => {
    if (userId) {
      loadProgress();
    }
  }, [userId, loadProgress]);

  return {
    gameProgress,
    loading,
    error,
    saveProgress,
    updateCoins,
    updateHighScore,
    updateLevel,
    addAchievement,
    updateSettings,
    updateStatistics,
    submitScore,
    trackEvent,
    reload: loadProgress
  };
};
