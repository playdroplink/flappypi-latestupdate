/**
 * useCloudSync Hook
 * 
 * Automatically syncs user inventory and data to Supabase cloud storage
 * when user logs in with their Pi Network account.
 * 
 * Features:
 * - Auto-sync on Pi login
 * - Merge local and cloud inventory
 * - Check subscription expiry
 * - Track sync status
 * 
 * Usage:
 * ```tsx
 * import { useCloudSync } from '@/hooks/useCloudSync';
 * 
 * function MyComponent() {
 *   const { syncStatus, isSyncing, lastSyncTime } = useCloudSync();
 *   // Component code...
 * }
 * ```
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { inventoryService } from '@/services/inventoryService';
import { subscriptionService } from '@/services/subscriptionService';
import { toast } from '@/hooks/use-toast';

export interface CloudSyncStatus {
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncSuccess: boolean | null;
  itemCount: number;
  error: string | null;
}

export interface UseCloudSyncReturn {
  syncStatus: CloudSyncStatus;
  isSyncing: boolean;
  lastSyncTime: string | null;
  triggerManualSync: () => Promise<boolean>;
  getSyncStatus: () => Promise<void>;
}

/**
 * Hook to manage cloud sync for authenticated Pi users
 * @param piUserId - Pi Network user ID (from AuthContext)
 * @param enabled - Whether to enable auto-sync (default: true)
 * @returns Cloud sync status and control functions
 */
export const useCloudSync = (
  piUserId?: string | null, 
  enabled: boolean = true
): UseCloudSyncReturn => {
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    syncSuccess: null,
    itemCount: 0,
    error: null
  });

  // Ref to prevent multiple simultaneous syncs
  const isSyncingRef = useRef(false);
  const hasInitialSyncRef = useRef(false);

  /**
   * Perform full cloud sync workflow
   */
  const performCloudSync = useCallback(async (userId: string): Promise<boolean> => {
    // Prevent multiple simultaneous syncs
    if (isSyncingRef.current) {
      console.log('🔄 Cloud sync already in progress, skipping...');
      return false;
    }

    isSyncingRef.current = true;
    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      console.log('🔄 Starting cloud sync for user:', userId);
      
      // 1. Perform full inventory sync (load from cloud, merge, save back)
      const syncSuccess = await inventoryService.performFullCloudSync(userId);
      
      if (!syncSuccess) {
        throw new Error('Inventory sync failed');
      }

      // 2. Get final item count
      const inventory = inventoryService.getInventory();
      const itemCount = inventory.length;

      // 3. Check subscription status and expiry
      try {
        const subStatus = await subscriptionService.checkSubscriptionStatus(userId);
        
        if (subStatus?.subscription_status === 'active') {
          console.log('✅ Active subscription found, checking expiry...');
          
          // Check for expiring subscriptions (within 7 days)
          const expiringInfo = await subscriptionService.checkExpiringSubscriptions?.(userId);
          
          if (expiringInfo?.expiringThisWeek?.length > 0) {
            console.warn('⚠️ Subscriptions expiring soon:', expiringInfo.expiringThisWeek);
            
            // Show notification to user (non-blocking)
            toast({
              title: '⚠️ Subscription Expiring Soon',
              description: `Your subscription expires in ${expiringInfo.expiringThisWeek.length} day(s). Consider renewing!`,
              variant: 'default',
            });
          }
          
          if (expiringInfo?.renewalNeeded) {
            console.warn('🔔 Subscription renewal needed');
          }
        }
      } catch (subError) {
        // Subscription check is optional, don't fail sync if it errors
        console.warn('⚠️ Subscription check failed (non-critical):', subError);
      }

      // 4. Update sync status
      const now = new Date().toISOString();
      setSyncStatus({
        isSyncing: false,
        lastSyncTime: now,
        syncSuccess: true,
        itemCount,
        error: null
      });

      console.log('✅ Cloud sync completed successfully:', { itemCount, syncedAt: now });
      
      return true;

    } catch (error) {
      console.error('❌ Cloud sync failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncSuccess: false,
        error: errorMessage
      }));

      // Show error toast (non-blocking)
      toast({
        title: '❌ Cloud Sync Failed',
        description: 'Your data is saved locally. We\'ll try syncing again later.',
        variant: 'destructive',
      });

      return false;

    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  /**
   * Trigger manual sync (for refresh button, etc.)
   */
  const triggerManualSync = useCallback(async (): Promise<boolean> => {
    if (!piUserId) {
      console.warn('⚠️ Cannot trigger manual sync: No Pi user ID');
      toast({
        title: 'Sync Unavailable',
        description: 'Please log in with Pi Network to sync your data.',
        variant: 'default',
      });
      return false;
    }

    console.log('🔄 Manual sync triggered by user');
    return await performCloudSync(piUserId);
  }, [piUserId, performCloudSync]);

  /**
   * Get current cloud sync status from database
   */
  const getSyncStatus = useCallback(async (): Promise<void> => {
    if (!piUserId) return;

    try {
      const status = await inventoryService.getCloudSyncStatus(piUserId);
      
      setSyncStatus(prev => ({
        ...prev,
        lastSyncTime: status.lastSyncTime,
        itemCount: status.itemCount,
        syncSuccess: status.hasSyncedData
      }));
    } catch (error) {
      console.error('❌ Error getting sync status:', error);
    }
  }, [piUserId]);

  /**
   * Auto-sync on Pi user login (initial sync)
   */
  useEffect(() => {
    if (!enabled || !piUserId || hasInitialSyncRef.current) {
      return;
    }

    console.log('🔄 Auto-sync triggered for Pi user:', piUserId);
    
    // Perform initial sync after short delay (let auth settle)
    const syncTimer = setTimeout(() => {
      performCloudSync(piUserId).then(success => {
        if (success) {
          hasInitialSyncRef.current = true;
          
          // Show success toast
          toast({
            title: '✅ Data Synced',
            description: 'Your inventory has been synced from the cloud.',
            variant: 'default',
          });
        }
      });
    }, 1000); // 1 second delay

    return () => clearTimeout(syncTimer);
  }, [piUserId, enabled, performCloudSync]);

  /**
   * Periodic sync status check (every 5 minutes)
   */
  useEffect(() => {
    if (!enabled || !piUserId) return;

    // Check sync status periodically
    const statusCheckInterval = setInterval(() => {
      getSyncStatus();
    }, 5 * 60 * 1000); // 5 minutes

    // Initial status check
    getSyncStatus();

    return () => clearInterval(statusCheckInterval);
  }, [piUserId, enabled, getSyncStatus]);

  /**
   * Listen for inventory updates and auto-sync
   */
  useEffect(() => {
    if (!enabled || !piUserId) return;

    const handleInventoryUpdate = async (event: CustomEvent) => {
      console.log('📦 Inventory updated, triggering auto-sync...', event.detail);
      
      // Debounce: wait 2 seconds after inventory update before syncing
      setTimeout(() => {
        if (!isSyncingRef.current) {
          performCloudSync(piUserId);
        }
      }, 2000);
    };

    window.addEventListener('inventory-updated', handleInventoryUpdate as EventListener);

    return () => {
      window.removeEventListener('inventory-updated', handleInventoryUpdate as EventListener);
    };
  }, [piUserId, enabled, performCloudSync]);

  return {
    syncStatus,
    isSyncing: syncStatus.isSyncing,
    lastSyncTime: syncStatus.lastSyncTime,
    triggerManualSync,
    getSyncStatus
  };
};

/**
 * Simple version of useCloudSync that just returns sync status
 * Useful for displaying sync status in UI without triggering syncs
 */
export const useCloudSyncStatus = (piUserId?: string | null) => {
  const [status, setStatus] = useState({
    hasSyncedData: false,
    lastSyncTime: null as string | null,
    itemCount: 0
  });

  useEffect(() => {
    if (!piUserId) return;

    inventoryService.getCloudSyncStatus(piUserId).then(result => {
      setStatus({
        hasSyncedData: result.hasSyncedData,
        lastSyncTime: result.lastSyncTime,
        itemCount: result.itemCount
      });
    });
  }, [piUserId]);

  return status;
};

export default useCloudSync;
