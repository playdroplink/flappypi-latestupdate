/**
 * Cloud Storage Service for Flappy Pi Backend
 * Comprehensive cloud sync for inventory, users, payments, and game data
 */

import supabase from './supabaseClient.js';

class CloudStorageService {
  constructor() {
    this.syncInProgress = new Set();
  }

  // ===========================================
  // USER PROFILE MANAGEMENT
  // ===========================================

  /**
   * Initialize or update user profile
   */
  async upsertUserProfile(piUserId, userData) {
    try {
      const profileData = {
        pi_user_id: piUserId,
        username: userData.username || `user_${piUserId.slice(0, 8)}`,
        wallet_address: userData.wallet_address || null,
        email: userData.email || null,
        total_score: userData.total_score || 0,
        games_played: userData.games_played || 0,
        coins_earned: userData.coins_earned || 0,
        subscription_status: userData.subscription_status || 'none',
        subscription_end: userData.subscription_end || null,
        last_login: new Date().toISOString(),
        created_at: userData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'pi_user_id'
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ User profile upserted for ${piUserId}`);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error upserting user profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(piUserId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('pi_user_id', piUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return { success: true, data: data || null };
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user stats
   */
  async updateUserStats(piUserId, stats) {
    try {
      const updateData = {
        total_score: stats.total_score,
        games_played: stats.games_played,
        coins_earned: stats.coins_earned,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('pi_user_id', piUserId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('❌ Error updating user stats:', error);
      return { success: false, error: error.message };
    }
  }

  // ===========================================
  // INVENTORY MANAGEMENT
  // ===========================================

  /**
   * Sync inventory to cloud
   */
  async syncInventoryToCloud(piUserId, inventoryItems) {
    if (this.syncInProgress.has(`inventory_${piUserId}`)) {
      console.warn('⚠️ Inventory sync already in progress for user:', piUserId);
      return { success: false, error: 'Sync in progress' };
    }

    this.syncInProgress.add(`inventory_${piUserId}`);

    try {
      // Sanitize and prepare inventory data
      const sanitizedItems = inventoryItems.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        quantity: item.quantity || 1,
        rarity: item.rarity || 'common',
        image: item.image || null,
        description: item.description || '',
        purchasedAt: item.purchasedAt || new Date().toISOString(),
        expiresAt: item.expiresAt || null,
        equipped: item.equipped || false,
        metadata: item.metadata || {}
      }));

      const { data, error } = await supabase
        .from('user_inventory')
        .upsert({
          pi_user_id: piUserId,
          items: sanitizedItems,
          last_sync_time: new Date().toISOString(),
          sync_status: 'completed'
        }, {
          onConflict: 'pi_user_id'
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Inventory synced to cloud for ${piUserId} (${sanitizedItems.length} items)`);
      return { success: true, data, itemCount: sanitizedItems.length };
    } catch (error) {
      console.error('❌ Error syncing inventory to cloud:', error);
      return { success: false, error: error.message };
    } finally {
      this.syncInProgress.delete(`inventory_${piUserId}`);
    }
  }

  /**
   * Load inventory from cloud
   */
  async loadInventoryFromCloud(piUserId) {
    try {
      const { data, error } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('pi_user_id', piUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return { success: true, items: [], isNew: true };
      }

      // Validate and clean inventory data
      const items = Array.isArray(data.items) ? data.items : [];
      const validItems = items.filter(item => item && item.id && item.type);

      console.log(`✅ Loaded ${validItems.length} items from cloud for ${piUserId}`);
      return { 
        success: true, 
        items: validItems, 
        lastSyncTime: data.last_sync_time,
        isNew: false 
      };
    } catch (error) {
      console.error('❌ Error loading inventory from cloud:', error);
      return { success: false, error: error.message, items: [] };
    }
  }

  /**
   * Add single item to inventory
   */
  async addItemToInventory(piUserId, item) {
    try {
      // First, get current inventory
      const { items: currentItems } = await this.loadInventoryFromCloud(piUserId);
      
      // Check if item already exists
      const existingIndex = currentItems.findIndex(existing => existing.id === item.id);
      
      if (existingIndex >= 0) {
        // Update quantity if it's a stackable item
        if (item.type === 'powerup' || item.type === 'consumable') {
          currentItems[existingIndex].quantity += (item.quantity || 1);
        }
      } else {
        // Add new item
        currentItems.push({
          ...item,
          purchasedAt: new Date().toISOString()
        });
      }

      // Sync updated inventory
      return await this.syncInventoryToCloud(piUserId, currentItems);
    } catch (error) {
      console.error('❌ Error adding item to inventory:', error);
      return { success: false, error: error.message };
    }
  }

  // ===========================================
  // PAYMENT MANAGEMENT
  // ===========================================

  /**
   * Record payment transaction
   */
  async recordPayment(paymentData) {
    try {
      const payment = {
        payment_id: paymentData.payment_id,
        pi_user_id: paymentData.pi_user_id,
        amount: parseFloat(paymentData.amount),
        memo: paymentData.memo || '',
        status: paymentData.status || 'pending',
        transaction_id: paymentData.transaction_id || null,
        from_address: paymentData.from_address || null,
        to_address: paymentData.to_address || null,
        payment_type: paymentData.payment_type || 'purchase',
        item_type: paymentData.item_type || null,
        metadata: paymentData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('payment_records')
        .upsert(payment, {
          onConflict: 'payment_id'
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Payment recorded: ${payment.payment_id} (${payment.amount} PI)`);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error recording payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId, status, transactionId = null) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };

      if (transactionId) {
        updateData.transaction_id = transactionId;
      }

      const { data, error } = await supabase
        .from('payment_records')
        .update(updateData)
        .eq('payment_id', paymentId)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Payment status updated: ${paymentId} → ${status}`);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error updating payment status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(piUserId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('payment_records')
        .select('*')
        .eq('pi_user_id', piUserId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, payments: data || [] };
    } catch (error) {
      console.error('❌ Error getting payment history:', error);
      return { success: false, error: error.message, payments: [] };
    }
  }

  // ===========================================
  // GAME SESSION MANAGEMENT
  // ===========================================

  /**
   * Record game session
   */
  async recordGameSession(piUserId, sessionData) {
    try {
      const session = {
        pi_user_id: piUserId,
        score: parseInt(sessionData.score) || 0,
        coins_earned: parseInt(sessionData.coins_earned) || 0,
        duration_seconds: parseInt(sessionData.duration_seconds) || 0,
        pipes_passed: parseInt(sessionData.pipes_passed) || 0,
        power_ups_used: sessionData.power_ups_used || [],
        game_mode: sessionData.game_mode || 'normal',
        achievements: sessionData.achievements || [],
        metadata: sessionData.metadata || {},
        session_start: sessionData.session_start || new Date().toISOString(),
        session_end: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('game_sessions')
        .insert(session)
        .select()
        .single();

      if (error) throw error;

      // Update user stats
      await this.updateUserStats(piUserId, {
        total_score: sessionData.newTotalScore,
        games_played: sessionData.newGamesPlayed,
        coins_earned: sessionData.newCoinsEarned
      });

      console.log(`✅ Game session recorded for ${piUserId} (Score: ${session.score})`);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error recording game session:', error);
      return { success: false, error: error.message };
    }
  }

  // ===========================================
  // LEADERBOARD MANAGEMENT
  // ===========================================

  /**
   * Update leaderboard
   */
  async updateLeaderboard(piUserId, score, username) {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .upsert({
          pi_user_id: piUserId,
          username: username || `user_${piUserId.slice(0, 8)}`,
          high_score: score,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'pi_user_id'
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Leaderboard updated for ${piUserId} (Score: ${score})`);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error updating leaderboard:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('high_score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, leaderboard: data || [] };
    } catch (error) {
      console.error('❌ Error getting leaderboard:', error);
      return { success: false, error: error.message, leaderboard: [] };
    }
  }

  // ===========================================
  // SUBSCRIPTION & REWARDS MANAGEMENT
  // ===========================================

  /**
   * Record claimed rewards
   */
  async recordClaimedRewards(piUserId, planId, transactionId, rewards) {
    try {
      const rewardRecord = {
        pi_user_id: piUserId,
        plan_id: planId,
        transaction_id: transactionId,
        reward_count: rewards.length,
        rewards_data: rewards,
        claimed_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('claimed_rewards')
        .insert(rewardRecord)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Rewards recorded for ${piUserId} (${rewards.length} rewards)`);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error recording claimed rewards:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check for expiring subscriptions
   */
  async checkExpiringSubscriptions(piUserId) {
    try {
      // Get user subscription info
      const { data: profile } = await this.getUserProfile(piUserId);
      
      if (!profile || !profile.subscription_end) {
        return { success: true, expiring: false, daysLeft: null };
      }

      const expiryDate = new Date(profile.subscription_end);
      const now = new Date();
      const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

      const isExpiring = daysLeft <= 7 && daysLeft >= 0;

      return {
        success: true,
        expiring: isExpiring,
        daysLeft,
        expiryDate: profile.subscription_end
      };
    } catch (error) {
      console.error('❌ Error checking expiring subscriptions:', error);
      return { success: false, error: error.message };
    }
  }

  // ===========================================
  // BULK OPERATIONS
  // ===========================================

  /**
   * Perform full user data sync
   */
  async syncAllUserData(piUserId, userData) {
    try {
      console.log(`🔄 Starting full sync for user: ${piUserId}`);

      const results = {
        profile: null,
        inventory: null,
        payments: null
      };

      // 1. Sync user profile
      if (userData.profile) {
        results.profile = await this.upsertUserProfile(piUserId, userData.profile);
      }

      // 2. Sync inventory
      if (userData.inventory && Array.isArray(userData.inventory)) {
        results.inventory = await this.syncInventoryToCloud(piUserId, userData.inventory);
      }

      // 3. Get payment history (no sync needed, payments are recorded real-time)
      results.payments = await this.getPaymentHistory(piUserId, 10);

      console.log(`✅ Full sync completed for ${piUserId}`);
      return { success: true, results };
    } catch (error) {
      console.error('❌ Error in full user data sync:', error);
      return { success: false, error: error.message };
    }
  }

  // ===========================================
  // HEALTH CHECK
  // ===========================================

  /**
   * Health check for cloud storage service
   */
  async healthCheck() {
    try {
      // Test basic connectivity
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (error) throw error;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: '1.0.0'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const cloudStorageService = new CloudStorageService();
export default cloudStorageService;