import { useState, useEffect, useCallback } from 'react';
import { gameHistoryService } from '../services/gameHistoryService';
import { GameHistoryEntry, GameHistoryStats, GameHistoryFilters, GameHistoryResponse } from '../types/gameHistory';
import { useUserProfile } from './useUserProfile';

export const useGameHistory = () => {
  const { profile } = useUserProfile();
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [stats, setStats] = useState<GameHistoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Load game history
  const loadGameHistory = useCallback(async (
    filters: GameHistoryFilters = {},
    page = 1,
    limit = 20
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response: GameHistoryResponse = await gameHistoryService.getGameHistory(filters, page, limit, profile);
      
      if (page === 1) {
        setHistory(response.entries);
      } else {
        setHistory(prev => [...prev, ...response.entries]);
      }
      
      setStats(response.stats);
      setCurrentPage(page);
      setHasMore(response.hasMore);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game history');
    } finally {
      setLoading(false);
    }
  }, []);

  // Record a new game session
  const recordGameSession = useCallback(async (gameData: {
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
  }) => {
    try {
      await gameHistoryService.recordGameSession(gameData, profile);
      
      // Reload first page to show the new entry
      await loadGameHistory({}, 1, 20);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record game session');
    }
  }, [loadGameHistory]);

  // Load more history (pagination)
  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await loadGameHistory({}, currentPage + 1, 20);
    }
  }, [loading, hasMore, currentPage, loadGameHistory]);

  // Clear game history
  const clearHistory = useCallback(async () => {
    setLoading(true);
    try {
      await gameHistoryService.clearGameHistory(profile);
      setHistory([]);
      setStats(null);
      setCurrentPage(1);
      setHasMore(false);
      setTotalCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear game history');
    } finally {
      setLoading(false);
    }
  }, []);

  // Export game history
  const exportHistory = useCallback(() => {
    try {
      const exportData = gameHistoryService.exportGameHistory(profile);
      if (exportData) {
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flappypi-game-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export game history');
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadGameHistory();
  }, [loadGameHistory]);

  return {
    history,
    stats,
    loading,
    error,
    currentPage,
    hasMore,
    totalCount,
    loadGameHistory,
    recordGameSession,
    loadMore,
    clearHistory,
    exportHistory,
  };
}; 