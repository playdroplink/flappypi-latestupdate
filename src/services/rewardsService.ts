// import { supabase } from '@/integrations/supabase/client';
import { /*DailyRewardResult, DailyRewardStatus,*/ AdRewardResult } from '@/types/gameTypes';
import { saveWalletBalance, loadWalletBalance } from '@/utils/walletUtils';
import { 
  getReviveCount, 
  saveReviveCount, 
  getExtraLifeCount, 
  saveExtraLifeCount, 
  getRouletteSpinCount, 
  saveRouletteSpinCount,
  addRevive,
  addExtraLife,
  addRouletteSpin
} from '@/utils/rewardUtils';
import { supabaseService } from './supabaseService';

class RewardsService {
  // Removed DailyRewardStatus and related functions
  /*
  async getDailyRewardStatus(piUserId: string): Promise<DailyRewardStatus | null> {
    console.log(`MOCK: Getting daily reward status for ${piUserId}`);
    return Promise.resolve({
      pi_user_id: piUserId,
      last_claim_date: null,
      claim_streak: 0,
      total_rewards_claimed: 0,
      next_claim_available_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  async claimDailyReward(piUserId: string): Promise<DailyRewardResult> {
    console.log(`MOCK: Claiming daily reward for ${piUserId}`);
    return Promise.resolve({ success: true, rewardAmount: 100, newStreak: 1 });
  }
  */

  // Watch ad for reward - ENHANCED TO ACTUALLY GRANT REWARDS
  async watchAdReward(
    piUserId: string,
    adType: string,
    rewardAmount: number = 25
  ): Promise<AdRewardResult | null> {
    try {
      console.log(`🎁 Granting ad reward: ${adType} for user ${piUserId}, amount: ${rewardAmount}`);
      
      // Get current user info
      const savedPiUser = localStorage.getItem('flappypi-pi-user');
      const savedUsername = localStorage.getItem('flappypi-username');
      
      if (!savedPiUser || !savedUsername) {
        console.warn('⚠️ No user data found for ad reward');
        return { success: false, reward_amount: 0, description: 'User not authenticated' };
      }
      
      const piUser = JSON.parse(savedPiUser);
      const username = savedUsername;
      
      // Handle different reward types
      switch (adType) {
        case 'coins':
          return await this.grantCoinReward(username, rewardAmount);
          
        case 'continue':
        case 'revive':
          return await this.grantReviveReward(username);
          
        case 'life':
        case 'extra_life':
          return await this.grantExtraLifeReward(username);
          
        case 'roulette_spin':
          return await this.grantRouletteSpinReward(username);
          
        default:
          console.warn(`⚠️ Unknown ad type: ${adType}, defaulting to coins`);
          return await this.grantCoinReward(username, rewardAmount);
      }
      
    } catch (error) {
      console.error('❌ Error granting ad reward:', error);
      return { success: false, reward_amount: 0, description: 'Failed to grant reward' };
    }
  }

  // Grant coin reward
  private async grantCoinReward(username: string, amount: number): Promise<AdRewardResult> {
    try {
      const currentBalance = loadWalletBalance(username);
      const newBalance = currentBalance + amount;
      
      // Save new balance
      saveWalletBalance(newBalance, username);
      
      // Record transaction
      await this.recordTransaction(username, 'ad_reward', amount, 'coins');
      
      // Record reward in Supabase
      await supabaseService.recordReward(username, 'ad_reward', amount, 'coins', 'coins');
      
      console.log(`✅ Coin reward granted: ${amount} coins, new balance: ${newBalance}`);
      
      return {
        success: true,
        reward_amount: amount,
        description: `Earned ${amount} Flappy Coins from watching an ad!`
      };
    } catch (error) {
      console.error('❌ Error granting coin reward:', error);
      return { success: false, reward_amount: 0, description: 'Failed to grant coin reward' };
    }
  }

  // Grant revive reward
  private async grantReviveReward(username: string): Promise<AdRewardResult> {
    try {
      // Use the utility function to add revive
      addRevive(username, 1);
      
      // Record transaction
      await this.recordTransaction(username, 'ad_reward', 1, 'revive');
      
      // Record reward in Supabase
      await supabaseService.recordReward(username, 'ad_reward', 1, 'revive', 'revive');
      
      console.log(`✅ Revive reward granted for user: ${username}`);
      
      return {
        success: true,
        reward_amount: 1,
        description: 'Earned 1 revive from watching an ad!'
      };
    } catch (error) {
      console.error('❌ Error granting revive reward:', error);
      return { success: false, reward_amount: 0, description: 'Failed to grant revive reward' };
    }
  }

  // Grant extra life reward
  private async grantExtraLifeReward(username: string): Promise<AdRewardResult> {
    try {
      // Use the utility function to add extra life
      addExtraLife(username, 1);
      
      // Record transaction
      await this.recordTransaction(username, 'ad_reward', 1, 'extra_life');
      
      // Record reward in Supabase
      await supabaseService.recordReward(username, 'ad_reward', 1, 'extra_life', 'extra_life');
      
      console.log(`✅ Extra life reward granted for user: ${username}`);
      
      return {
        success: true,
        reward_amount: 1,
        description: 'Earned 1 extra life from watching an ad!'
      };
    } catch (error) {
      console.error('❌ Error granting extra life reward:', error);
      return { success: false, reward_amount: 0, description: 'Failed to grant extra life reward' };
    }
  }

  // Grant roulette spin reward
  private async grantRouletteSpinReward(username: string): Promise<AdRewardResult> {
    try {
      // Use the utility function to add roulette spin
      addRouletteSpin(username, 1);
      
      // Record transaction
      await this.recordTransaction(username, 'ad_reward', 1, 'roulette_spin');
      
      // Record reward in Supabase
      await supabaseService.recordReward(username, 'ad_reward', 1, 'roulette_spin', 'roulette_spin');
      
      console.log(`✅ Roulette spin reward granted for user: ${username}`);
      
      return {
        success: true,
        reward_amount: 1,
        description: 'Earned 1 roulette spin from watching an ad!'
      };
    } catch (error) {
      console.error('❌ Error granting roulette spin reward:', error);
      return { success: false, reward_amount: 0, description: 'Failed to grant roulette spin reward' };
    }
  }

  // Record transaction for tracking
  private async recordTransaction(username: string, type: string, amount: number, rewardType: string) {
    try {
      // Try to record in Supabase first
      const supabaseResult = await supabaseService.recordTransaction(username, type, amount, rewardType);
      
      if (supabaseResult.success) {
        console.log(`📝 Transaction recorded in Supabase: ${type} - ${amount} ${rewardType}`);
        return;
      }
      
      // Fallback to localStorage if Supabase fails
      console.warn('⚠️ Supabase transaction failed, using localStorage fallback');
      const transactions = this.loadTransactions(username);
      const transaction = {
        id: Date.now().toString(),
        type,
        amount,
        rewardType,
        timestamp: new Date().toISOString(),
        username
      };
      
      transactions.push(transaction);
      this.saveTransactions(username, transactions);
      
      console.log(`📝 Transaction recorded in localStorage: ${type} - ${amount} ${rewardType}`);
    } catch (error) {
      console.warn('⚠️ Failed to record transaction:', error);
    }
  }

  // Load transactions
  private loadTransactions(username: string): any[] {
    try {
      const key = `flappypi-transactions-${username}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('⚠️ Failed to load transactions:', error);
      return [];
    }
  }

  // Save transactions
  private saveTransactions(username: string, transactions: any[]) {
    try {
      const key = `flappypi-transactions-${username}`;
      localStorage.setItem(key, JSON.stringify(transactions));
    } catch (error) {
      console.warn('⚠️ Failed to save transactions:', error);
    }
  }

  // Get user reward summary
  async getUserRewardSummary(piUserId: string): Promise<any> {
    try {
      const savedUsername = localStorage.getItem('flappypi-username');
      if (!savedUsername) {
        return null;
      }

      const username = savedUsername;
      const { getUserRewardCounts } = await import('@/utils/rewardUtils');
      
      return getUserRewardCounts(username);
    } catch (error) {
      console.error('❌ Error getting user reward summary:', error);
      return null;
    }
  }
}

// Export singleton instance
export const rewardsService = new RewardsService();
export default rewardsService;
