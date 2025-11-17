import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cloudSaveService, CloudSaveResult, GameSaveData } from '@/services/cloudSaveService';
import { useUserProfile } from '@/hooks/useUserProfile';

export const useCloudSave = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const { profile } = useUserProfile();

  // Check connectivity on mount
  useEffect(() => {
    checkConnectivity();
  }, []);

  const checkConnectivity = useCallback(async () => {
    try {
      const connected = await cloudSaveService.checkConnectivity();
      setIsConnected(connected);
      
      if (!connected) {
        console.warn('⚠️ Cloud save not available - using local storage only');
        toast({
          title: "Cloud Save Unavailable",
          description: "Your progress will be saved locally only",
          variant: "destructive"
        });
      } else {
        console.log('✅ Cloud save connected');
      }
    } catch (error) {
      console.error('Connectivity check failed:', error);
      setIsConnected(false);
    }
  }, [toast]);

  // Save game session
  const saveGameSession = useCallback(async (
    gameData: GameSaveData
  ): Promise<CloudSaveResult> => {
    if (!profile?.pi_user_id) {
      return {
        success: false,
        error: 'No authenticated user'
      };
    }

    setIsSaving(true);
    try {
      const result = await cloudSaveService.saveGameSession(
        profile.pi_user_id,
        gameData
      );

      if (result.success) {
        setLastSaveTime(new Date());
        toast({
          title: "Game Saved! 💾",
          description: "Your progress has been saved to the cloud",
          duration: 2000
        });
      } else {
        toast({
          title: "Save Failed",
          description: result.error || "Failed to save game progress",
          variant: "destructive"
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Save Error",
        description: errorMessage,
        variant: "destructive"
      });
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsSaving(false);
    }
  }, [profile?.pi_user_id, toast]);

  // Save user settings
  const saveUserSettings = useCallback(async (settings: {
    selected_bird_skin?: string;
    music_enabled?: boolean;
    owned_skins?: string[];
    owned_power_ups?: { [key: string]: number };
  }): Promise<CloudSaveResult> => {
    if (!profile?.pi_user_id) {
      return {
        success: false,
        error: 'No authenticated user'
      };
    }

    try {
      const result = await cloudSaveService.saveUserSettings(
        profile.pi_user_id,
        settings
      );

      if (result.success) {
        setLastSaveTime(new Date());
        toast({
          title: "Settings Saved! ⚙️",
          description: "Your settings have been saved to the cloud",
          duration: 2000
        });
      } else {
        toast({
          title: "Settings Save Failed",
          description: result.error || "Failed to save settings",
          variant: "destructive"
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Settings Save Error",
        description: errorMessage,
        variant: "destructive"
      });
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [profile?.pi_user_id, toast]);

  // Load user profile from cloud
  const loadUserProfile = useCallback(async (): Promise<CloudSaveResult> => {
    if (!profile?.pi_user_id) {
      return {
        success: false,
        error: 'No authenticated user'
      };
    }

    try {
      const result = await cloudSaveService.loadUserProfile(profile.pi_user_id);
      
      if (result.success && result.data) {
        toast({
          title: "Profile Loaded! 📥",
          description: "Your profile has been loaded from the cloud",
          duration: 2000
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Profile Load Error",
        description: errorMessage,
        variant: "destructive"
      });
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [profile?.pi_user_id, toast]);

  // Sync local data with cloud
  const syncWithCloud = useCallback(async (localData: any): Promise<CloudSaveResult> => {
    if (!profile?.pi_user_id) {
      return {
        success: false,
        error: 'No authenticated user'
      };
    }

    try {
      const result = await cloudSaveService.syncWithCloud(profile.pi_user_id, localData);
      
      if (result.success) {
        setLastSaveTime(new Date());
        toast({
          title: "Sync Complete! 🔄",
          description: "Your data has been synchronized with the cloud",
          duration: 2000
        });
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Failed to sync with cloud",
          variant: "destructive"
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Sync Error",
        description: errorMessage,
        variant: "destructive"
      });
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [profile?.pi_user_id, toast]);

  // Auto-save function for periodic saves
  const autoSave = useCallback(async (gameData: Partial<GameSaveData>) => {
    if (!isConnected || !profile?.pi_user_id) {
      return { success: false, error: 'Cloud save not available' };
    }

    // Only auto-save if we have meaningful data
    if (gameData.score && gameData.score > 0) {
      return await saveGameSession(gameData as GameSaveData);
    }

    return { success: true };
  }, [isConnected, profile?.pi_user_id, saveGameSession]);

  return {
    // State
    isConnected,
    isSaving,
    lastSaveTime,
    
    // Actions
    saveGameSession,
    saveUserSettings,
    loadUserProfile,
    syncWithCloud,
    autoSave,
    checkConnectivity,
    
    // Utilities
    canSave: isConnected && !!profile?.pi_user_id,
    saveStatus: isSaving ? 'saving' : isConnected ? 'ready' : 'offline'
  };
}; 