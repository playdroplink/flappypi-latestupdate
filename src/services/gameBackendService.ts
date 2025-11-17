import { supabase } from '@/integrations/supabase/client';
import { userProfileService } from './userProfileService';
import { gameSessionService } from './gameSessionService';
import { purchaseService } from './purchaseService';
import { rewardsService } from './rewardsService';
import { leaderboardDataService } from './leaderboardDataService';
import type { 
  UserProfile, 
  GameSession, 
  PurchaseItem, 
  AdRewardResult 
} from '@/types/gameTypes';
import type { ShopItem } from '@/constants/shopItems';

// Legacy GameBackendService that delegates to specialized services
class GameBackendService {
  // User Profile methods
  async getUserProfile(piUserId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('pi_user_id', piUserId)
      .single();
    if (error) throw error;
    return data as UserProfile;
  }

  async updateUserProfile(piUserId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('pi_user_id', piUserId)
      .single();
    if (error) throw error;
    return data as UserProfile;
  }

  // Game Session methods
  async completeGameSession(
    piUserId: string,
    gameMode: 'classic' | 'endless' | 'challenge',
    finalScore: number,
    levelReached: number,
    coinsEarned: number,
    sessionDuration?: number
  ): Promise<any> {
    return gameSessionService.completeGameSession(
      piUserId,
      gameMode,
      finalScore,
      levelReached,
      coinsEarned,
      sessionDuration
    );
  }

  // Purchase methods
  async makePurchase(
    piUserId: string,
    itemType: 'bird_skin' | 'power_up' | 'life' | 'coins',
    itemId: string,
    costCoins: number,
    piTransactionId?: string
  ): Promise<any> {
    return purchaseService.makePurchase(piUserId, itemType, itemId, costCoins, piTransactionId);
  }

  async getUserInventory(piUserId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_inventory')
      .select('*')
      .eq('pi_user_id', piUserId);
    if (error) throw error;
    return data as any[];
  }

  async getUserPurchases(piUserId: string, limit: number = 50): Promise<any[]> {
    return purchaseService.getUserPurchases(piUserId, limit);
  }

  // Rewards methods
  async watchAdReward(
    piUserId: string,
    adType: string,
    rewardAmount: number = 25
  ): Promise<AdRewardResult | null> {
    return rewardsService.watchAdReward(piUserId, adType, rewardAmount);
  }

  // Leaderboard methods
  async getLeaderboard(limit = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('leaderboards')
      .select('*, user_profiles(username)')
      .order('score', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as any[];
  }

  // New function to update shop item supply
  async updateShopItemSupply(itemId: string, newSupply: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shop_items')
        .update({ supply: newSupply })
        .eq('id', itemId);
      if (error) {
        console.error(`Error updating supply for item ${itemId}:`, error);
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Exception updating supply for item ${itemId}:`, error);
      return false;
    }
  }

  // New function to fetch shop items with dynamic supply
  async fetchShopItems(): Promise<ShopItem[]> {
    /* Original Supabase logic:
    try {
      const { data, error } = await supabase
        .from('shop_items') // Assuming 'shop_items' table in Supabase stores dynamic data
        .select('id, name, image, piPrice, flappyCoinPrice, isDefault, rarity, promoPiPrice, promoEndDate, supply, isLimited, description');

      if (error) {
        console.error('Error fetching shop items:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Exception fetching shop items:', error);
      return [];
    }
    */
    // Placeholder for now, return empty array or mock data
    return [];
  }

  async initiatePiPayment(paymentDetails: { amount: number; memo: string; metadata: any }): Promise<string> {
    console.log(`[Backend Service] Initiating Real Pi Payment:`, paymentDetails);
    
    try {
      // Check if Pi SDK is available
      if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not available. Please use Pi Browser.');
      }

      // Use real Pi payment service
      const { payWithPi } = await import('@/services/piPayment');
      
      const result = await payWithPi({
        amount: paymentDetails.amount,
        memo: paymentDetails.memo,
        metadata: paymentDetails.metadata
      });

      if (result.status === 'completed' && result.paymentId) {
        console.log('✅ Real Pi payment initiated successfully:', result.paymentId);
        return result.paymentId;
      } else {
        throw new Error(result.error || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('❌ Real Pi payment initiation failed:', error);
      throw error;
    }
  }

  async deductCoins(piUserId: string, amount: number): Promise<boolean> {
    console.log(`[Backend Service] Deducting ${amount} coins from user ${piUserId}`);
    // In a real application, this would call your backend to deduct coins from the user's balance
    // Example: const response = await axios.post('/api/coins/deduct', { piUserId, amount });
    // return response.data.success;
    
    // Simulate a successful coin deduction for development
    return true;
  }

  async addCoinsToUser(piUserId: string, amount: number): Promise<boolean> {
    console.log(`[Backend Service] Adding ${amount} coins to user ${piUserId}`);
    // In a real application, this would call your backend to add coins to the user's balance
    // Example: const response = await axios.post('/api/coins/add', { piUserId, amount });
    // return response.data.success;

    // Simulate a successful coin addition for development
    return true;
  }

  async addPowerUpToUser(piUserId: string, powerUpId: string, quantity: number): Promise<boolean> {
    console.log(`[Backend Service] Adding ${quantity} of power-up ${powerUpId} to user ${piUserId}`);
    // In a real application, this would call your backend to add power-ups to the user's inventory
    // Example: const response = await axios.post('/api/power-ups/add', { piUserId, powerUpId, quantity });
    // return response.data.success;
    
    // Simulate a successful power-up addition for development
    return true;
  }

  async addExtraLivesToUser(piUserId: string, quantity: number): Promise<boolean> {
    console.log(`[Backend Service] Adding ${quantity} extra lives to user ${piUserId}`);
    // In a real application, this would call your backend to add extra lives to the user's inventory
    // Example: const response = await axios.post('/api/extra-lives/add', { piUserId, quantity });
    // return response.data.success;
    
    // Simulate a successful extra life addition for development
    return true;
  }

  async purchaseMysteryBox(piUserId: string, boxId: string): Promise<boolean> {
    console.log(`[Backend Service] Purchasing mystery box ${boxId} for user ${piUserId}`);
    // In a real application, this would call your backend to handle mystery box purchase and reward distribution.
    // This might involve deducting Pi/coins and then randomly assigning a reward.
    // Example: const response = await axios.post('/api/mystery-box/purchase', { piUserId, boxId });
    // return response.data.success;
    
    // Simulate a successful mystery box purchase for development
    return true;
  }

  async updateSubscriptionStatus(piUserId: string, status: 'active' | 'canceled' | 'expired', planId: string): Promise<boolean> {
    console.log(`[Backend Service] Updating subscription status for user ${piUserId} to ${status} for plan ${planId}`);
    // In a real application, this would call your backend to update the user's subscription status.
    // Example: const response = await axios.post('/api/subscription/update', { piUserId, status, planId });
    // return response.data.success;

    // Simulate a successful subscription status update for development
    return true;
  }

  async updateSelectedSkin(piUserId: string, skinId: string): Promise<boolean> {
    console.log(`[Backend Service] Updating selected skin for user ${piUserId} to ${skinId}`);
    // In a real application, this would call your backend to update the user's selected skin.
    // Example: const response = await axios.post('/api/user/update-skin', { piUserId, skinId });
    // return response.data.success;
    
    // Simulate a successful skin update for development
    return true;
  }

  // New function to record ad impressions (for analytics/backend rewards)
  async recordAdImpression(piUserId: string, rewardAmount: number): Promise<boolean> {
    console.log(`[Backend Service] Recording ad impression for user ${piUserId} with reward ${rewardAmount}`);
    // In a real application, this would send data to your backend for verification and storage.
    // Example: await axios.post('/api/record-ad-impression', { piUserId, rewardAmount });
    return true; // Assume success for now
  }

  // New function to open a mystery box (backend logic to determine reward)
  async openMysteryBox(piUserId: string, boxId: string): Promise<{ description: string; reward: any }> {
    console.log(`[Backend Service] Opening mystery box ${boxId} for user ${piUserId}`);
    // In a real application, this would involve complex backend logic to:
    // 1. Verify purchase/ownership.
    // 2. Randomly select a reward based on boxId and configured probabilities.
    // 3. Update user profile (coins, skins, power-ups).
    // 4. Return the reward details.

    // Placeholder for now, simulate a random reward
    const rewards = [
      { description: "1000 Flappy Coins!", reward: { type: 'coins', amount: 1000 } },
      { description: "a Rare Bird Skin!", reward: { type: 'skin', skinId: 'bird-7' } },
      { description: "an Extra Life Power-Up!", reward: { type: 'power-up', powerUpId: 'extra-life', quantity: 1 } },
    ];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];

    // Simulate backend update to user profile based on reward
    // This part would typically be handled by your backend upon a successful mystery box open
    // For frontend simulation, you might dispatch an action to update user profile in local state/context

    return randomReward;
  }

  // Shop Items
  async getShopItems(): Promise<ShopItem[]> {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*');
    if (error) throw error;
    return data as ShopItem[];
  }

  // Purchases
  async recordPurchase(purchase: any): Promise<any> {
    const { data, error } = await supabase
      .from('purchases')
      .insert([purchase]);
    if (error) throw error;
    return data;
  }

  // User Inventory
  async addToInventory(piUserId: string, itemId: string, quantity = 1): Promise<any> {
    const { data, error } = await supabase
      .from('user_inventory')
      .insert([{ pi_user_id: piUserId, item_id: itemId, quantity }]);
    if (error) throw error;
    return data;
  }

  // Game Sessions & Scores
  async recordGameSession(session: any): Promise<any> {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert([session]);
    if (error) throw error;
    return data;
  }

  // Leaderboards
  async upsertLeaderboard(piUserId: string, score: number): Promise<any> {
    const { data, error } = await supabase
      .from('leaderboards')
      .upsert({ pi_user_id: piUserId, score, recorded_at: new Date().toISOString() }, { onConflict: 'pi_user_id' });
    if (error) throw error;
    return data;
  }

  // Rewards
  async addReward(piUserId: string, rewardType: string, rewardId: string): Promise<any> {
    const { data, error } = await supabase
      .from('rewards')
      .insert([{ pi_user_id: piUserId, reward_type: rewardType, reward_id: rewardId }]);
    if (error) throw error;
    return data;
  }

  async getUserRewards(piUserId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('pi_user_id', piUserId);
    if (error) throw error;
    return data as any[];
  }
}

export const gameBackendService = new GameBackendService();

// Export types for backward compatibility
export type { 
  UserProfile, 
  GameSession, 
  PurchaseItem, 
  AdRewardResult 
};
