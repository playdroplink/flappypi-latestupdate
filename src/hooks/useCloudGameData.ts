import { useState, useEffect, useCallback } from 'react';
import { cloudStorage, GameData } from '../utils/cloudStorage';

interface UseCloudGameDataReturn {
  gameData: GameData | null;
  isLoading: boolean;
  saveGameData: (data: Partial<GameData>) => Promise<boolean>;
  loadGameData: () => Promise<GameData | null>;
  storageStatus: {
    local: boolean;
    cloud: boolean;
    piCloud: boolean;
    anonymousId: string;
  } | null;
}

export const useCloudGameData = (): UseCloudGameDataReturn => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [storageStatus, setStorageStatus] = useState<{
    local: boolean;
    cloud: boolean;
    piCloud: boolean;
    anonymousId: string;
  } | null>(null);

  // Load game data on mount
  useEffect(() => {
    loadGameData();
    updateStorageStatus();
  }, []);

  // Load game data from all sources
  const loadGameData = useCallback(async (): Promise<GameData | null> => {
    setIsLoading(true);
    try {
      const data = await cloudStorage.loadGameData();
      setGameData(data);
      return data;
    } catch (error) {
      console.error('Failed to load game data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save game data to all available storage
  const saveGameData = useCallback(async (newData: Partial<GameData>): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Merge with existing data
      const mergedData: GameData = {
        coins: 0,
        highScore: 0,
        unlockedItems: [],
        settings: {},
        lastPlayed: new Date().toISOString(),
        ...gameData,
        ...newData,
        lastPlayed: new Date().toISOString()
      };

      const success = await cloudStorage.saveGameData(mergedData);
      if (success) {
        setGameData(mergedData);
      }
      return success;
    } catch (error) {
      console.error('Failed to save game data:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [gameData]);

  // Update storage status
  const updateStorageStatus = useCallback(async () => {
    try {
      const status = await cloudStorage.getStorageStatus();
      setStorageStatus(status);
    } catch (error) {
      console.error('Failed to get storage status:', error);
    }
  }, []);

  // Auto-save when game data changes
  useEffect(() => {
    if (gameData) {
      // Debounce auto-save to avoid too frequent saves
      const timeoutId = setTimeout(() => {
        cloudStorage.saveGameData(gameData);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [gameData]);

  return {
    gameData,
    isLoading,
    saveGameData,
    loadGameData,
    storageStatus
  };
};

// Convenience functions for common game data operations
export const useGameDataHelpers = () => {
  const { gameData, saveGameData } = useCloudGameData();

  const addCoins = useCallback(async (amount: number) => {
    if (gameData) {
      await saveGameData({ coins: gameData.coins + amount });
    }
  }, [gameData, saveGameData]);

  const updateHighScore = useCallback(async (score: number) => {
    if (gameData && score > gameData.highScore) {
      await saveGameData({ highScore: score });
    }
  }, [gameData, saveGameData]);

  const unlockItem = useCallback(async (itemId: string) => {
    if (gameData && !gameData.unlockedItems.includes(itemId)) {
      await saveGameData({
        unlockedItems: [...gameData.unlockedItems, itemId]
      });
    }
  }, [gameData, saveGameData]);

  const updateSettings = useCallback(async (settings: any) => {
    if (gameData) {
      await saveGameData({
        settings: { ...gameData.settings, ...settings }
      });
    }
  }, [gameData, saveGameData]);

  return {
    addCoins,
    updateHighScore,
    unlockItem,
    updateSettings,
    coins: gameData?.coins || 0,
    highScore: gameData?.highScore || 0,
    unlockedItems: gameData?.unlockedItems || [],
    settings: gameData?.settings || {}
  };
}; 