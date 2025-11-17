import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_CONFIG } from '@/config/supabaseConfig';
import { UserProfile, GameSession } from '@/types/gameTypes';

export interface CloudSaveResult {
  success: boolean;
  data?: any;
  error?: string;
  retryCount?: number;
}

export interface GameSaveData {
  score: number;
  level: number;
  coins: number;
  gameMode: 'classic' | 'endless' | 'challenge';
  sessionDuration?: number;
  powerUpsUsed?: string[];
  achievements?: string[];
}

class CloudSaveService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  // Save game session to cloud
  async saveGameSession(
    piUserId: string,
    gameData: GameSaveData
  ): Promise<CloudSaveResult> {
    return this.withRetry(async () => {
      try {
        // 1. Record game session
        const { data: sessionData, error: sessionError } = await supabase
          .from(SUPABASE_CONFIG.TABLES.GAME_SESSIONS)
          .insert({
            pi_user_id: piUserId,
            game_mode: gameData.gameMode,
            final_score: gameData.score,
            level_reached: gameData.level,
            coins_earned: gameData.coins,
            session_duration: gameData.sessionDuration || null
          })
          .select()
          .single();

        if (sessionError) {
          throw new Error(`Session save failed: ${sessionError.message}`);
        }

        // 2. Update user profile
        const profileUpdate = await this.updateUserProfile(piUserId, {
          total_coins: gameData.coins,
          highest_score: gameData.score,
          total_games: 1, // Will be incremented in the update
          last_played_at: new Date().toISOString()
        });

        if (!profileUpdate.success) {
          throw new Error(`Profile update failed: ${profileUpdate.error}`);
        }

        // 3. Update leaderboard
        await this.updateLeaderboard(piUserId, gameData.score);

        return {
          success: true,
          data: {
            session_id: sessionData.id,
            is_high_score: profileUpdate.data?.is_high_score || false,
            total_coins: profileUpdate.data?.total_coins || gameData.coins,
            coins_earned: gameData.coins,
            new_highest_score: profileUpdate.data?.highest_score || gameData.score
          }
        };
      } catch (error) {
        throw new Error(`Game session save failed: ${error.message}`);
      }
    });
  }

  // Update user profile
  async updateUserProfile(
    piUserId: string,
    updates: Partial<UserProfile>
  ): Promise<CloudSaveResult> {
    return this.withRetry(async () => {
      try {
        // Get current profile first
        const { data: currentProfile, error: fetchError } = await supabase
          .from(SUPABASE_CONFIG.TABLES.USER_PROFILES)
          .select('total_coins, highest_score, total_games')
          .eq('pi_user_id', piUserId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw new Error(`Profile fetch failed: ${fetchError.message}`);
        }

        // Calculate new values
        const newTotalCoins = (currentProfile?.total_coins || 0) + (updates.total_coins || 0);
        const isHighScore = (updates.highest_score || 0) > (currentProfile?.highest_score || 0);
        const newHighestScore = isHighScore ? (updates.highest_score || 0) : (currentProfile?.highest_score || 0);
        const newTotalGames = (currentProfile?.total_games || 0) + (updates.total_games || 0);

        // Update profile
        const { data: updatedProfile, error: updateError } = await supabase
          .from(SUPABASE_CONFIG.TABLES.USER_PROFILES)
          .update({
            total_coins: newTotalCoins,
            highest_score: newHighestScore,
            total_games: newTotalGames,
            last_played_at: new Date().toISOString(),
            ...updates
          })
          .eq('pi_user_id', piUserId)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Profile update failed: ${updateError.message}`);
        }

        return {
          success: true,
          data: {
            ...updatedProfile,
            is_high_score: isHighScore,
            total_coins: newTotalCoins,
            highest_score: newHighestScore,
            total_games: newTotalGames
          }
        };
      } catch (error) {
        throw new Error(`Profile update failed: ${error.message}`);
      }
    });
  }

  // Update leaderboard
  async updateLeaderboard(piUserId: string, score: number): Promise<CloudSaveResult> {
    return this.withRetry(async () => {
      try {
        const { error } = await supabase
          .from(SUPABASE_CONFIG.TABLES.LEADERBOARDS)
          .upsert({
            pi_user_id: piUserId,
            score: score,
            recorded_at: new Date().toISOString()
          }, { onConflict: 'pi_user_id' });

        if (error) {
          throw new Error(`Leaderboard update failed: ${error.message}`);
        }

        return { success: true };
      } catch (error) {
        throw new Error(`Leaderboard update failed: ${error.message}`);
      }
    });
  }

  // Save user settings
  async saveUserSettings(
    piUserId: string,
    settings: {
      selected_bird_skin?: string;
      music_enabled?: boolean;
      owned_skins?: string[];
      owned_power_ups?: { [key: string]: number };
    }
  ): Promise<CloudSaveResult> {
    return this.withRetry(async () => {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_CONFIG.TABLES.USER_PROFILES)
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('pi_user_id', piUserId)
          .select()
          .single();

        if (error) {
          throw new Error(`Settings save failed: ${error.message}`);
        }

        return { success: true, data };
      } catch (error) {
        throw new Error(`Settings save failed: ${error.message}`);
      }
    });
  }

  // Load user profile from cloud
  async loadUserProfile(piUserId: string): Promise<CloudSaveResult> {
    return this.withRetry(async () => {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_CONFIG.TABLES.USER_PROFILES)
          .select('*')
          .eq('pi_user_id', piUserId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // User doesn't exist yet
            return { success: true, data: null };
          }
          throw new Error(`Profile load failed: ${error.message}`);
        }

        return { success: true, data };
      } catch (error) {
        throw new Error(`Profile load failed: ${error.message}`);
      }
    });
  }

  // Sync local data with cloud
  async syncWithCloud(piUserId: string, localData: any): Promise<CloudSaveResult> {
    return this.withRetry(async () => {
      try {
        // Load cloud data
        const cloudResult = await this.loadUserProfile(piUserId);
        if (!cloudResult.success) {
          throw new Error(`Failed to load cloud data: ${cloudResult.error}`);
        }

        const cloudData = cloudResult.data;

        // Merge data (cloud takes precedence for critical data)
        const mergedData = {
          ...localData,
          total_coins: Math.max(localData.total_coins || 0, cloudData?.total_coins || 0),
          highest_score: Math.max(localData.highest_score || 0, cloudData?.highest_score || 0),
          total_games: Math.max(localData.total_games || 0, cloudData?.total_games || 0),
          // Keep cloud data for settings and inventory
          selected_bird_skin: cloudData?.selected_bird_skin || localData.selected_bird_skin,
          owned_skins: cloudData?.owned_skins || localData.owned_skins,
          owned_power_ups: cloudData?.owned_power_ups || localData.owned_power_ups
        };

        // Save merged data back to cloud
        const saveResult = await this.updateUserProfile(piUserId, mergedData);
        if (!saveResult.success) {
          throw new Error(`Failed to save merged data: ${saveResult.error}`);
        }

        return { success: true, data: mergedData };
      } catch (error) {
        throw new Error(`Cloud sync failed: ${error.message}`);
      }
    });
  }

  // Retry wrapper for network operations
  private async withRetry<T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<CloudSaveResult> {
    try {
      const result = await operation();
      return { success: true, data: result, retryCount };
    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        console.warn(`Cloud save retry ${retryCount + 1}/${this.MAX_RETRIES}:`, error.message);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * (retryCount + 1)));
        return this.withRetry(operation, retryCount + 1);
      }
      return {
        success: false,
        error: error.message,
        retryCount
      };
    }
  }

  // Check cloud connectivity
  async checkConnectivity(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(SUPABASE_CONFIG.TABLES.USER_PROFILES)
        .select('pi_user_id')
        .limit(1);
      
      return !error || error.code === 'PGRST116'; // No rows is still a successful connection
    } catch {
      return false;
    }
  }
}

export const cloudSaveService = new CloudSaveService();
export default cloudSaveService; 