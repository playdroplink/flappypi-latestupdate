/**
 * Data Recovery Service
 * Provides comprehensive data recovery and sync capabilities
 */

import { supabase } from '../lib/supabase';
import { inventoryService } from '../services/inventoryService';
import { loadWalletBalance, saveWalletBalance } from '../utils/walletUtils';

interface UserDataBackup {
  inventory: any[];
  walletBalance: number;
  profile: any;
  timestamp: string;
  source: 'cloud' | 'local' | 'backup';
}

export class DataRecoveryService {
  private static instance: DataRecoveryService;
  
  static getInstance(): DataRecoveryService {
    if (!DataRecoveryService.instance) {
      DataRecoveryService.instance = new DataRecoveryService();
    }
    return DataRecoveryService.instance;
  }

  /**
   * Comprehensive data recovery for Pi users
   * Attempts to recover data from multiple sources
   */
  async recoverUserData(piUserId: string, username: string): Promise<UserDataBackup | null> {
    console.log('🔄 Starting data recovery for:', username, piUserId);
    
    try {
      // 1. Try to recover from cloud first (most reliable)
      const cloudData = await this.recoverFromCloud(piUserId);
      if (cloudData) {
        console.log('✅ Data recovered from cloud');
        return cloudData;
      }

      // 2. Try to recover from local backup
      const localData = await this.recoverFromLocalBackup(username);
      if (localData) {
        console.log('✅ Data recovered from local backup');
        return localData;
      }

      // 3. Try to recover from Pi user cache
      const cacheData = await this.recoverFromUserCache(piUserId, username);
      if (cacheData) {
        console.log('✅ Data recovered from user cache');
        return cacheData;
      }

      console.warn('⚠️ No recoverable data found');
      return null;

    } catch (error) {
      console.error('❌ Data recovery failed:', error);
      return null;
    }
  }

  /**
   * Recover data from Supabase cloud storage
   */
  private async recoverFromCloud(piUserId: string): Promise<UserDataBackup | null> {
    try {
      const { data, error } = await supabase
        .from('user_inventory_sync')
        .select('items, wallet_balance, last_sync_time')
        .eq('pi_user_id', piUserId)
        .single();

      if (error || !data) return null;

      return {
        inventory: data.items || [],
        walletBalance: data.wallet_balance || 0,
        profile: { pi_user_id: piUserId },
        timestamp: data.last_sync_time || new Date().toISOString(),
        source: 'cloud'
      };
    } catch (error) {
      console.warn('Cloud recovery failed:', error);
      return null;
    }
  }

  /**
   * Recover data from local backup
   */
  private async recoverFromLocalBackup(username: string): Promise<UserDataBackup | null> {
    try {
      const backupKey = `flappypi-backup-${username}`;
      const backupData = localStorage.getItem(backupKey);
      
      if (!backupData) return null;

      const parsed = JSON.parse(backupData);
      
      return {
        inventory: parsed.inventory || [],
        walletBalance: parsed.walletBalance || 0,
        profile: parsed.profile || {},
        timestamp: parsed.timestamp || new Date().toISOString(),
        source: 'backup'
      };
    } catch (error) {
      console.warn('Local backup recovery failed:', error);
      return null;
    }
  }

  /**
   * Recover data from user cache (Pi-specific storage)
   */
  private async recoverFromUserCache(piUserId: string, username: string): Promise<UserDataBackup | null> {
    try {
      // Try username-specific keys
      const usernameInventory = localStorage.getItem(`flappypi-inventory-${username}`);
      const usernameWallet = localStorage.getItem(`flappypi-balance-${username}`);
      
      if (usernameInventory || usernameWallet) {
        return {
          inventory: usernameInventory ? JSON.parse(usernameInventory) : [],
          walletBalance: usernameWallet ? parseInt(usernameWallet) : 0,
          profile: { username, pi_user_id: piUserId },
          timestamp: new Date().toISOString(),
          source: 'local'
        };
      }

      return null;
    } catch (error) {
      console.warn('User cache recovery failed:', error);
      return null;
    }
  }

  /**
   * Apply recovered data to current user session
   */
  async applyRecoveredData(data: UserDataBackup): Promise<boolean> {
    try {
      console.log('🔧 Applying recovered data:', data.source);

      // 1. Restore inventory
      if (data.inventory && data.inventory.length > 0) {
        localStorage.setItem('flappypi-inventory', JSON.stringify(data.inventory));
        console.log('📦 Restored', data.inventory.length, 'inventory items');
      }

      // 2. Restore wallet balance
      if (data.walletBalance > 0) {
        const savedUsername = localStorage.getItem('flappypi-username');
        saveWalletBalance(data.walletBalance, savedUsername);
        console.log('💰 Restored wallet balance:', data.walletBalance);
      }

      // 3. Notify UI components
      window.dispatchEvent(new CustomEvent('data-recovered', { 
        detail: { 
          source: data.source,
          itemCount: data.inventory?.length || 0,
          walletBalance: data.walletBalance,
          timestamp: data.timestamp
        } 
      }));

      return true;
    } catch (error) {
      console.error('❌ Failed to apply recovered data:', error);
      return false;
    }
  }

  /**
   * Create comprehensive backup of current user data
   */
  async createBackup(piUserId: string, username: string): Promise<boolean> {
    try {
      const inventory = inventoryService.getInventory();
      const walletBalance = loadWalletBalance();
      
      const backup: UserDataBackup = {
        inventory,
        walletBalance,
        profile: { pi_user_id: piUserId, username },
        timestamp: new Date().toISOString(),
        source: 'local'
      };

      // Save to local backup
      const backupKey = `flappypi-backup-${username}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));

      // Also save to indexed backup for Pi user ID
      const piBackupKey = `flappypi-backup-pi-${piUserId}`;
      localStorage.setItem(piBackupKey, JSON.stringify(backup));

      console.log('💾 Backup created for user:', username);
      return true;
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
      return false;
    }
  }

  /**
   * Smart recovery that tries all methods and merges results
   */
  async performSmartRecovery(piUserId: string, username: string): Promise<boolean> {
    try {
      console.log('🧠 Starting smart recovery for:', username);

      // Get current local data
      const currentInventory = inventoryService.getInventory();
      const currentWallet = loadWalletBalance();

      // Try to recover from cloud
      const recoveredData = await this.recoverUserData(piUserId, username);
      
      if (recoveredData) {
        // Merge recovered data with current data (keep higher values)
        const mergedInventory = this.mergeInventoryData(currentInventory, recoveredData.inventory);
        const mergedWallet = Math.max(currentWallet, recoveredData.walletBalance);

        // Apply merged data
        localStorage.setItem('flappypi-inventory', JSON.stringify(mergedInventory));
        const savedUsername = localStorage.getItem('flappypi-username');
        saveWalletBalance(mergedWallet, savedUsername);

        console.log('✅ Smart recovery completed - merged data applied');

        // Sync back to cloud
        setTimeout(async () => {
          try {
            await inventoryService.performFullCloudSync(piUserId);
            console.log('✅ Recovery data synced back to cloud');
          } catch (syncError) {
            console.warn('⚠️ Failed to sync recovery data to cloud:', syncError);
          }
        }, 1000);

        return true;
      }

      console.log('ℹ️ No data to recover, using current local data');
      return false;
    } catch (error) {
      console.error('❌ Smart recovery failed:', error);
      return false;
    }
  }

  /**
   * Merge inventory arrays, preferring items with later timestamps
   */
  private mergeInventoryData(localInventory: any[], recoveredInventory: any[]): any[] {
    const mergedMap = new Map();

    // Add local items
    localInventory.forEach(item => {
      const key = `${item.type}-${item.id}`;
      mergedMap.set(key, item);
    });

    // Add/update with recovered items (prefer later timestamps)
    recoveredInventory.forEach(recoveredItem => {
      const key = `${recoveredItem.type}-${recoveredItem.id}`;
      const existingItem = mergedMap.get(key);

      if (!existingItem || 
          (recoveredItem.purchasedAt && existingItem.purchasedAt && 
           new Date(recoveredItem.purchasedAt) > new Date(existingItem.purchasedAt))) {
        // Use higher quantity if same item
        if (existingItem && existingItem.quantity && recoveredItem.quantity) {
          recoveredItem.quantity = Math.max(existingItem.quantity, recoveredItem.quantity);
        }
        mergedMap.set(key, recoveredItem);
      }
    });

    return Array.from(mergedMap.values());
  }
}

export const dataRecoveryService = DataRecoveryService.getInstance();