/**
 * Data Migration Utilities for Flappy Pi
 * Migrates localStorage data to cloud storage with conflict resolution
 */

import cloudStorageService from './cloudStorageService.js';

class DataMigrationService {
  constructor() {
    this.migrationInProgress = new Set();
  }

  // ===========================================
  // MAIN MIGRATION FUNCTIONS
  // ===========================================

  /**
   * Migrate all user data from localStorage to cloud
   */
  async migrateUserData(piUserId, localStorageData) {
    if (this.migrationInProgress.has(piUserId)) {
      console.warn('⚠️ Migration already in progress for user:', piUserId);
      return { success: false, error: 'Migration in progress' };
    }

    this.migrationInProgress.add(piUserId);

    try {
      console.log(`🔄 Starting data migration for user: ${piUserId}`);

      const migrationResults = {
        profile: null,
        inventory: null,
        payments: null,
        sessions: null,
        achievements: null,
        conflicts: [],
        warnings: []
      };

      // 1. Migrate user profile
      if (localStorageData.profile) {
        console.log('📊 Migrating user profile...');
        migrationResults.profile = await this.migrateUserProfile(piUserId, localStorageData.profile);
      }

      // 2. Migrate inventory with conflict resolution
      if (localStorageData.inventory) {
        console.log('🎒 Migrating inventory...');
        migrationResults.inventory = await this.migrateInventory(piUserId, localStorageData.inventory);
      }

      // 3. Migrate game sessions
      if (localStorageData.sessions) {
        console.log('🎮 Migrating game sessions...');
        migrationResults.sessions = await this.migrateSessions(piUserId, localStorageData.sessions);
      }

      // 4. Initialize achievements
      console.log('🏆 Initializing achievements...');
      migrationResults.achievements = await this.initializeAchievements(piUserId);

      console.log(`✅ Data migration completed for ${piUserId}`);
      return { 
        success: true, 
        results: migrationResults,
        migrationId: `migration_${piUserId}_${Date.now()}`
      };

    } catch (error) {
      console.error('❌ Error during data migration:', error);
      return { success: false, error: error.message };
    } finally {
      this.migrationInProgress.delete(piUserId);
    }
  }

  /**
   * Smart data sync - merges local and cloud data intelligently
   */
  async smartDataSync(piUserId, localStorageData) {
    try {
      console.log(`🔄 Starting smart data sync for user: ${piUserId}`);

      const syncResults = {
        profile: null,
        inventory: null,
        mergeStrategy: 'cloud_priority',
        conflicts: []
      };

      // 1. Get existing cloud data
      const cloudProfile = await cloudStorageService.getUserProfile(piUserId);
      const cloudInventory = await cloudStorageService.loadInventoryFromCloud(piUserId);

      // 2. Merge profile data (cloud takes priority for most fields)
      const mergedProfile = this.mergeProfileData(
        localStorageData.profile || {}, 
        cloudProfile.data || {}
      );

      syncResults.profile = await cloudStorageService.upsertUserProfile(piUserId, mergedProfile);

      // 3. Merge inventory data intelligently
      const mergedInventory = this.mergeInventoryData(
        localStorageData.inventory || [], 
        cloudInventory.items || []
      );

      syncResults.inventory = await cloudStorageService.syncInventoryToCloud(piUserId, mergedInventory.items);
      syncResults.conflicts = mergedInventory.conflicts;

      console.log(`✅ Smart data sync completed for ${piUserId}`);
      return { success: true, results: syncResults };

    } catch (error) {
      console.error('❌ Error during smart data sync:', error);
      return { success: false, error: error.message };
    }
  }

  // ===========================================
  // SPECIFIC MIGRATION FUNCTIONS
  // ===========================================

  /**
   * Migrate user profile data
   */
  async migrateUserProfile(piUserId, localProfile) {
    try {
      // Get existing cloud profile
      const cloudResult = await cloudStorageService.getUserProfile(piUserId);
      const cloudProfile = cloudResult.data;

      let mergedProfile;

      if (cloudProfile) {
        // Merge data - prioritize cloud for subscription info, local for stats
        mergedProfile = this.mergeProfileData(localProfile, cloudProfile);
        console.log('🔄 Merging existing profile data');
      } else {
        // Create new profile from local data
        mergedProfile = this.sanitizeProfileData(localProfile);
        console.log('✨ Creating new profile from local data');
      }

      return await cloudStorageService.upsertUserProfile(piUserId, mergedProfile);
    } catch (error) {
      console.error('❌ Error migrating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Migrate inventory with intelligent conflict resolution
   */
  async migrateInventory(piUserId, localInventory) {
    try {
      // Get existing cloud inventory
      const cloudResult = await cloudStorageService.loadInventoryFromCloud(piUserId);
      const cloudInventory = cloudResult.items || [];

      // Merge inventory data
      const mergedResult = this.mergeInventoryData(localInventory, cloudInventory);

      // Sync to cloud
      const syncResult = await cloudStorageService.syncInventoryToCloud(piUserId, mergedResult.items);

      return {
        ...syncResult,
        conflicts: mergedResult.conflicts,
        mergeStrategy: mergedResult.strategy
      };
    } catch (error) {
      console.error('❌ Error migrating inventory:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Migrate game sessions (append to existing)
   */
  async migrateSessions(piUserId, localSessions) {
    try {
      const migrationResults = [];

      for (const session of localSessions) {
        const sessionData = this.sanitizeSessionData(session);
        const result = await cloudStorageService.recordGameSession(piUserId, sessionData);
        migrationResults.push(result);
      }

      const successCount = migrationResults.filter(r => r.success).length;
      console.log(`✅ Migrated ${successCount}/${localSessions.length} game sessions`);

      return {
        success: true,
        migrated: successCount,
        total: localSessions.length,
        results: migrationResults
      };
    } catch (error) {
      console.error('❌ Error migrating game sessions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize achievements for new user
   */
  async initializeAchievements(piUserId) {
    try {
      // This would typically be handled by the backend
      // For now, just return success
      return { 
        success: true, 
        message: 'Achievements will be initialized by backend',
        count: 0
      };
    } catch (error) {
      console.error('❌ Error initializing achievements:', error);
      return { success: false, error: error.message };
    }
  }

  // ===========================================
  // DATA MERGING FUNCTIONS
  // ===========================================

  /**
   * Merge profile data with conflict resolution
   */
  mergeProfileData(localProfile, cloudProfile) {
    const merged = {
      // Basic info - prefer cloud if it exists
      username: cloudProfile.username || localProfile.username || 'Player',
      email: cloudProfile.email || localProfile.email,
      wallet_address: cloudProfile.wallet_address || localProfile.wallet_address,

      // Game stats - take the higher values
      total_score: Math.max(localProfile.total_score || 0, cloudProfile.total_score || 0),
      high_score: Math.max(localProfile.high_score || 0, cloudProfile.high_score || 0),
      games_played: Math.max(localProfile.games_played || 0, cloudProfile.games_played || 0),
      coins_earned: Math.max(localProfile.coins_earned || 0, cloudProfile.coins_earned || 0),

      // Subscription - prefer cloud data
      subscription_status: cloudProfile.subscription_status || localProfile.subscription_status || 'none',
      subscription_plan: cloudProfile.subscription_plan || localProfile.subscription_plan,
      subscription_start: cloudProfile.subscription_start || localProfile.subscription_start,
      subscription_end: cloudProfile.subscription_end || localProfile.subscription_end,

      // Account info - prefer cloud
      account_status: cloudProfile.account_status || 'active',
      preferences: this.mergePreferences(localProfile.preferences, cloudProfile.preferences),

      // Timestamps - use existing or current
      created_at: cloudProfile.created_at || localProfile.created_at || new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    return merged;
  }

  /**
   * Merge inventory data with smart conflict resolution
   */
  mergeInventoryData(localInventory, cloudInventory) {
    const merged = new Map();
    const conflicts = [];

    // Add all cloud items first (cloud has priority)
    cloudInventory.forEach(item => {
      if (this.isValidInventoryItem(item)) {
        merged.set(item.id, { ...item, source: 'cloud' });
      }
    });

    // Merge local items with conflict resolution
    localInventory.forEach(localItem => {
      if (!this.isValidInventoryItem(localItem)) return;

      const existingItem = merged.get(localItem.id);

      if (!existingItem) {
        // New item from local
        merged.set(localItem.id, { ...localItem, source: 'local' });
      } else {
        // Conflict resolution
        const resolvedItem = this.resolveInventoryConflict(localItem, existingItem);
        
        if (resolvedItem.hasConflict) {
          conflicts.push({
            itemId: localItem.id,
            itemName: localItem.name,
            localValue: localItem.quantity || 1,
            cloudValue: existingItem.quantity || 1,
            resolution: resolvedItem.resolution,
            finalValue: resolvedItem.item.quantity
          });
        }

        merged.set(localItem.id, resolvedItem.item);
      }
    });

    return {
      items: Array.from(merged.values()).map(item => {
        const { source, ...cleanItem } = item;
        return cleanItem;
      }),
      conflicts,
      strategy: 'smart_merge',
      totalItems: merged.size
    };
  }

  /**
   * Resolve conflicts between local and cloud inventory items
   */
  resolveInventoryConflict(localItem, cloudItem) {
    let hasConflict = false;
    let resolution = 'no_conflict';

    const resolved = { ...cloudItem };

    // For stackable items (powerups, consumables), add quantities
    if (localItem.type === 'powerup' || localItem.type === 'consumable') {
      const localQty = localItem.quantity || 1;
      const cloudQty = cloudItem.quantity || 1;
      
      if (localQty !== cloudQty) {
        hasConflict = true;
        resolution = 'sum_quantities';
        resolved.quantity = localQty + cloudQty;
      }
    }

    // For subscriptions, keep the one with later expiry
    if (localItem.type === 'subscription') {
      const localExpiry = new Date(localItem.expiresAt || 0);
      const cloudExpiry = new Date(cloudItem.expiresAt || 0);

      if (localExpiry > cloudExpiry) {
        hasConflict = true;
        resolution = 'use_later_expiry';
        resolved.expiresAt = localItem.expiresAt;
        resolved.purchasedAt = localItem.purchasedAt;
      }
    }

    // For equipment, prefer the equipped one
    if (localItem.equipped && !cloudItem.equipped) {
      hasConflict = true;
      resolution = 'prefer_equipped';
      resolved.equipped = true;
    }

    return {
      item: resolved,
      hasConflict,
      resolution
    };
  }

  /**
   * Merge user preferences
   */
  mergePreferences(localPrefs = {}, cloudPrefs = {}) {
    return {
      ...localPrefs,
      ...cloudPrefs, // Cloud preferences take priority
      lastMerged: new Date().toISOString()
    };
  }

  // ===========================================
  // DATA VALIDATION FUNCTIONS
  // ===========================================

  /**
   * Validate and sanitize profile data
   */
  sanitizeProfileData(profile) {
    return {
      username: (profile.username || '').substring(0, 255) || 'Player',
      email: this.isValidEmail(profile.email) ? profile.email : null,
      total_score: Math.max(0, parseInt(profile.total_score) || 0),
      high_score: Math.max(0, parseInt(profile.high_score) || 0),
      games_played: Math.max(0, parseInt(profile.games_played) || 0),
      coins_earned: Math.max(0, parseInt(profile.coins_earned) || 0),
      subscription_status: profile.subscription_status || 'none',
      preferences: typeof profile.preferences === 'object' ? profile.preferences : {}
    };
  }

  /**
   * Validate and sanitize session data
   */
  sanitizeSessionData(session) {
    return {
      score: Math.max(0, parseInt(session.score) || 0),
      coins_earned: Math.max(0, parseInt(session.coins_earned) || 0),
      duration_seconds: Math.max(0, parseInt(session.duration_seconds) || 0),
      pipes_passed: Math.max(0, parseInt(session.pipes_passed) || 0),
      game_mode: (session.game_mode || 'normal').substring(0, 50),
      power_ups_used: Array.isArray(session.power_ups_used) ? session.power_ups_used : [],
      achievements: Array.isArray(session.achievements) ? session.achievements : [],
      session_start: this.isValidDate(session.session_start) ? session.session_start : new Date().toISOString(),
      metadata: typeof session.metadata === 'object' ? session.metadata : {}
    };
  }

  /**
   * Validate inventory item structure
   */
  isValidInventoryItem(item) {
    if (!item || typeof item !== 'object') return false;
    if (!item.id || !item.type) return false;
    if (item.quantity && (isNaN(item.quantity) || item.quantity < 0)) return false;
    return true;
  }

  /**
   * Validate email address
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate date string
   */
  isValidDate(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  // ===========================================
  // MIGRATION STATUS FUNCTIONS
  // ===========================================

  /**
   * Check if user data needs migration
   */
  async needsMigration(piUserId) {
    try {
      const profileResult = await cloudStorageService.getUserProfile(piUserId);
      const inventoryResult = await cloudStorageService.loadInventoryFromCloud(piUserId);

      const hasProfile = profileResult.success && profileResult.data;
      const hasInventory = inventoryResult.success && inventoryResult.items && inventoryResult.items.length > 0;

      return {
        needsProfile: !hasProfile,
        needsInventory: !hasInventory,
        needsFullMigration: !hasProfile && !hasInventory,
        existingData: {
          profile: hasProfile,
          inventory: hasInventory,
          inventoryCount: inventoryResult.items ? inventoryResult.items.length : 0
        }
      };
    } catch (error) {
      console.error('❌ Error checking migration status:', error);
      return { error: error.message };
    }
  }

  /**
   * Generate migration report
   */
  generateMigrationReport(migrationResults) {
    const report = {
      timestamp: new Date().toISOString(),
      success: migrationResults.success,
      summary: {
        profile: migrationResults.results?.profile?.success || false,
        inventory: migrationResults.results?.inventory?.success || false,
        sessions: migrationResults.results?.sessions?.success || false,
        achievements: migrationResults.results?.achievements?.success || false
      },
      details: {
        inventoryItems: migrationResults.results?.inventory?.itemCount || 0,
        conflicts: migrationResults.results?.inventory?.conflicts?.length || 0,
        sessionsMigrated: migrationResults.results?.sessions?.migrated || 0,
        warnings: migrationResults.results?.warnings || []
      }
    };

    return report;
  }
}

// Export singleton instance
export const dataMigrationService = new DataMigrationService();
export default dataMigrationService;