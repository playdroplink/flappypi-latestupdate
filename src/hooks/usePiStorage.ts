import { useState, useEffect, useCallback } from 'react';
import { piStorage, PiUserData, PiStorageOptions } from '../utils/piStorage';

export interface UsePiStorageOptions extends PiStorageOptions {
  autoSync?: boolean;
  syncInterval?: number;
}

export const usePiStorage = (userId: string, options: UsePiStorageOptions = {}) => {
  const [userData, setUserData] = useState<PiUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageStats, setStorageStats] = useState(piStorage.getStorageStats());

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, [userId]);

  // Auto-sync functionality
  useEffect(() => {
    if (options.autoSync && userData) {
      const interval = setInterval(() => {
        syncData();
      }, options.syncInterval || 30000); // Default 30 seconds

      return () => clearInterval(interval);
    }
  }, [options.autoSync, options.syncInterval, userData]);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await piStorage.getUserData(userId);
      setUserData(data);
      
      // Update storage stats
      setStorageStats(piStorage.getStorageStats());
      
      console.log('[usePiStorage] User data loaded:', { userId, hasData: !!data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
      console.error('[usePiStorage] Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const saveUserData = useCallback(async (data: Partial<PiUserData>) => {
    try {
      setError(null);
      
      const success = await piStorage.storeUserData(userId, data);
      
      if (success) {
        // Reload data to get the updated version
        await loadUserData();
        console.log('[usePiStorage] User data saved successfully');
        return true;
      } else {
        throw new Error('Failed to save user data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user data');
      console.error('[usePiStorage] Error saving user data:', err);
      return false;
    }
  }, [userId, loadUserData]);

  const saveGameData = useCallback(async (gameData: PiUserData['gameData']) => {
    try {
      setError(null);
      
      const success = await piStorage.storeGameData(userId, gameData);
      
      if (success) {
        await loadUserData();
        console.log('[usePiStorage] Game data saved successfully');
        return true;
      } else {
        throw new Error('Failed to save game data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save game data');
      console.error('[usePiStorage] Error saving game data:', err);
      return false;
    }
  }, [userId, loadUserData]);

  const saveWalletData = useCallback(async (walletData: PiUserData['wallet']) => {
    try {
      setError(null);
      
      const success = await piStorage.storeWalletData(userId, walletData);
      
      if (success) {
        await loadUserData();
        console.log('[usePiStorage] Wallet data saved successfully');
        return true;
      } else {
        throw new Error('Failed to save wallet data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save wallet data');
      console.error('[usePiStorage] Error saving wallet data:', err);
      return false;
    }
  }, [userId, loadUserData]);

  const addTransaction = useCallback(async (transaction: PiUserData['wallet']['transactions'][0]) => {
    try {
      setError(null);
      
      const success = await piStorage.addTransaction(userId, transaction);
      
      if (success) {
        await loadUserData();
        console.log('[usePiStorage] Transaction added successfully');
        return true;
      } else {
        throw new Error('Failed to add transaction');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      console.error('[usePiStorage] Error adding transaction:', err);
      return false;
    }
  }, [userId, loadUserData]);

  const addAchievement = useCallback(async (achievement: string) => {
    try {
      setError(null);
      
      const success = await piStorage.addAchievement(userId, achievement);
      
      if (success) {
        await loadUserData();
        console.log('[usePiStorage] Achievement added successfully:', achievement);
        return true;
      } else {
        throw new Error('Failed to add achievement');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add achievement');
      console.error('[usePiStorage] Error adding achievement:', err);
      return false;
    }
  }, [userId, loadUserData]);

  const unlockSkin = useCallback(async (skinId: string) => {
    try {
      setError(null);
      
      const success = await piStorage.unlockSkin(userId, skinId);
      
      if (success) {
        await loadUserData();
        console.log('[usePiStorage] Skin unlocked successfully:', skinId);
        return true;
      } else {
        throw new Error('Failed to unlock skin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock skin');
      console.error('[usePiStorage] Error unlocking skin:', err);
      return false;
    }
  }, [userId, loadUserData]);

  const updatePreferences = useCallback(async (preferences: PiUserData['preferences']) => {
    try {
      setError(null);
      
      const success = await piStorage.updatePreferences(userId, preferences);
      
      if (success) {
        await loadUserData();
        console.log('[usePiStorage] Preferences updated successfully');
        return true;
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      console.error('[usePiStorage] Error updating preferences:', err);
      return false;
    }
  }, [userId, loadUserData]);

  const syncData = useCallback(async () => {
    try {
      setError(null);
      
      const success = await piStorage.syncData(userId);
      
      if (success) {
        await loadUserData();
        console.log('[usePiStorage] Data synced successfully');
        return true;
      } else {
        console.log('[usePiStorage] No data to sync');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync data');
      console.error('[usePiStorage] Error syncing data:', err);
      return false;
    }
  }, [userId, loadUserData]);

  const clearData = useCallback(async () => {
    try {
      setError(null);
      
      const success = await piStorage.clearUserData(userId);
      
      if (success) {
        setUserData(null);
        console.log('[usePiStorage] User data cleared successfully');
        return true;
      } else {
        throw new Error('Failed to clear user data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear user data');
      console.error('[usePiStorage] Error clearing user data:', err);
      return false;
    }
  }, [userId]);

  const refreshStorageStats = useCallback(() => {
    setStorageStats(piStorage.getStorageStats());
  }, []);

  return {
    // Data
    userData,
    loading,
    error,
    storageStats,
    
    // Actions
    saveUserData,
    saveGameData,
    saveWalletData,
    addTransaction,
    addAchievement,
    unlockSkin,
    updatePreferences,
    syncData,
    clearData,
    refreshStorageStats,
    reload: loadUserData,
    
    // Utilities
    hasData: !!userData,
    isPiStorage: storageStats.type === 'Pi Browser Storage',
    isLocalStorage: storageStats.type === 'localStorage'
  };
};

// Convenience hook for game data only
export const useGameData = (userId: string, options?: UsePiStorageOptions) => {
  const { userData, saveGameData, addAchievement, unlockSkin, ...rest } = usePiStorage(userId, options);
  
  return {
    gameData: userData?.gameData,
    saveGameData,
    addAchievement,
    unlockSkin,
    ...rest
  };
};

// Convenience hook for wallet data only
export const useWalletData = (userId: string, options?: UsePiStorageOptions) => {
  const { userData, saveWalletData, addTransaction, ...rest } = usePiStorage(userId, options);
  
  return {
    wallet: userData?.wallet,
    saveWalletData,
    addTransaction,
    ...rest
  };
}; 