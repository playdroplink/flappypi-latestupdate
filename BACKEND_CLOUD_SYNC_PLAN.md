# 🔄 Backend Integration Plan - Cloud Sync, Subscription Expiry, & Rewards

## Overview
Your request requires implementing a complete backend sync system where all user items, subscriptions, and rewards are saved to Supabase when users login with their Pi account. This ensures data persistence across devices and sessions.

---

## Current State Analysis

### ✅ What's Already Working
- **Supabase Integration**: Connected via `src/integrations/supabase/client.ts`
- **Cloud Save Service**: `cloudSaveService.ts` saves game sessions
- **Backend Storage**: `backendStorageService.ts` handles user profiles
- **Inventory Service**: `inventoryService.ts` has full item management (2090 lines)
- **Subscription Service**: `subscriptionService.ts` with activate/cancel/check methods
- **Subscription Rewards**: `subscriptionRewards.ts` defines all 3 plans (Starter/Premium/Ultimate)
- **Pi Account Detection**: System detects Pi user and stores `pi_user_id`

### ❌ What's Missing/Needs Enhancement

1. **Inventory-to-Supabase Sync** ❌
   - Inventory only in localStorage
   - NOT synced to Supabase backend
   - Lost if localStorage cleared
   - No cross-device sync

2. **Subscription Expiry Handling** ⚠️
   - Expiry dates calculated correctly
   - But NO renewal reminders
   - NO auto-renewal logic
   - NO persistent tracking in backend

3. **Reward Distribution** ⚠️
   - Rewards defined in `subscriptionRewards.ts`
   - Rewards NOT properly delivered to inventory
   - NO tracking of claimed vs unclaimed rewards
   - NO backend record of rewards given

4. **Pi Account Login Flow** ⚠️
   - No automatic sync on login
   - No migration of anonymous inventory to Pi user
   - No pulling inventory from Supabase on auth

---

## Implementation Plan

### Phase 1: Enhance Inventory Sync to Backend

#### File: `src/services/inventoryService.ts`

Add these methods to InventoryService class:

```typescript
// New method: Sync all inventory to Supabase
async syncInventoryToCloud(piUserId: string): Promise<boolean> {
  const inventory = this.getInventory();
  
  const { error } = await supabase
    .from('user_inventory')
    .upsert({
      pi_user_id: piUserId,
      items: inventory,
      lastSyncTime: new Date().toISOString(),
      syncStatus: 'completed'
    }, { 
      onConflict: 'pi_user_id' 
    });
  
  if (error) {
    console.error('❌ Inventory sync failed:', error);
    return false;
  }
  
  console.log('✅ Inventory synced to Supabase:', inventory.length, 'items');
  return true;
}

// New method: Load inventory from Supabase for Pi user
async loadInventoryFromCloud(piUserId: string): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('user_inventory')
    .select('items')
    .eq('pi_user_id', piUserId)
    .single();
  
  if (error || !data?.items) {
    console.warn('⚠️ No inventory found in cloud for user:', piUserId);
    return [];
  }
  
  // Merge cloud with local
  const cloudItems = data.items;
  const localItems = this.getInventory();
  
  // Cloud takes precedence for logged-in Pi users
  localStorage.setItem('flappypi-inventory', JSON.stringify(cloudItems));
  console.log('✅ Loaded', cloudItems.length, 'items from cloud');
  
  return cloudItems;
}

// New method: Merge local + cloud inventory
mergeInventoryData(localItems: InventoryItem[], cloudItems: InventoryItem[]): InventoryItem[] {
  // For each item type, take the best version
  // Skins: take union (no duplicates)
  // Powerups: sum quantities
  // Subscriptions: keep active ones with latest expiry
  
  const merged = new Map<string, InventoryItem>();
  
  // Add all cloud items
  cloudItems.forEach(item => {
    merged.set(item.id, item);
  });
  
  // Merge local items
  localItems.forEach(item => {
    const existing = merged.get(item.id);
    if (!existing) {
      merged.set(item.id, item);
    } else {
      // Merge logic by type
      if (item.type === 'powerup') {
        existing.quantity += item.quantity; // Sum powerups
      } else if (item.type === 'subscription') {
        // Keep subscription with latest expiry
        if (item.expiresAt && (!existing.expiresAt || item.expiresAt > existing.expiresAt)) {
          merged.set(item.id, item);
        }
      }
      // Skins: skip duplicates (existing is fine)
    }
  });
  
  return Array.from(merged.values());
}
```

#### Required Database Table (Supabase SQL):
```sql
-- User Inventory Table
CREATE TABLE user_inventory (
  pi_user_id TEXT PRIMARY KEY,
  items JSONB NOT NULL,
  lastSyncTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  syncStatus TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster queries
CREATE INDEX idx_user_inventory_sync ON user_inventory(lastSyncTime);
```

---

### Phase 2: Implement Subscription Expiry & Renewal

#### File: `src/services/subscriptionService.ts`

Add these enhancements:

```typescript
// New method: Check and handle expiring subscriptions
async checkExpiringSubscriptions(piUserId: string): Promise<{
  expiringToday: Array<any>,
  expiringThisWeek: Array<any>,
  renewalNeeded: boolean
}> {
  const subs = await this.getSubscriptionHistory(piUserId);
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const expiringToday = subs.filter(sub => {
    const expiryDate = new Date(sub.subscription_end);
    return expiryDate <= now && expiryDate > new Date(now.getTime() - 24 * 60 * 60 * 1000);
  });
  
  const expiringThisWeek = subs.filter(sub => {
    const expiryDate = new Date(sub.subscription_end);
    return expiryDate > now && expiryDate <= oneWeekFromNow;
  });
  
  // Save renewal reminders to database
  if (expiringThisWeek.length > 0) {
    await this.saveRenewalReminders(piUserId, expiringThisWeek);
  }
  
  return {
    expiringToday,
    expiringThisWeek,
    renewalNeeded: expiringToday.length > 0
  };
}

// New method: Auto-renew subscription
async autoRenewSubscription(piUserId: string, planId: string): Promise<ActivateSubscriptionResult> {
  // Calculate duration (usually 30 days)
  const durationDays = 30; // Or get from plan config
  
  // Activate same plan again
  return await this.activateSubscription(
    piUserId,
    planId,
    `${planId}_renewal`,
    durationDays,
    `auto_renewal_${Date.now()}`,
    0 // Will be paid via Pi
  );
}

// New method: Get exact expiry date
getSubscriptionExpiryDate(piUserId: string): Date | null {
  // Get all subscriptions for user
  const subs = this.getSubscriptionHistory(piUserId);
  
  if (subs.length === 0) return null;
  
  // Find the one expiring latest (most recent end date)
  return new Date(Math.max(...subs.map(s => new Date(s.subscription_end).getTime())));
}

// New method: Save renewal reminders
private async saveRenewalReminders(piUserId: string, subscriptions: any[]): Promise<void> {
  const { error } = await supabase
    .from('renewal_reminders')
    .upsert(
      subscriptions.map(sub => ({
        pi_user_id: piUserId,
        subscription_id: sub.id,
        expiry_date: sub.subscription_end,
        reminder_sent: false,
        created_at: new Date().toISOString()
      })),
      { onConflict: 'subscription_id' }
    );
  
  if (error) {
    console.error('Failed to save renewal reminders:', error);
  }
}
```

#### Required Database Table:
```sql
-- Renewal Reminders
CREATE TABLE renewal_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pi_user_id TEXT NOT NULL,
  subscription_id UUID NOT NULL,
  expiry_date TIMESTAMP NOT NULL,
  reminder_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subscription_id)
);
```

---

### Phase 3: Enhance Reward Distribution

#### File: `src/services/subscriptionService.ts`

Add reward claiming:

```typescript
// New method: Deliver all rewards for subscription plan
async claimSubscriptionRewards(
  piUserId: string,
  planId: string,
  transactionId: string
): Promise<{ success: boolean; rewardCount?: number; error?: string }> {
  try {
    const { inventoryService } = await import('@/services/inventoryService');
    const { getPlanRewards } = await import('@/constants/subscriptionRewards');
    
    // Get rewards for this plan
    const rewards = getPlanRewards(planId);
    
    if (rewards.length === 0) {
      return { success: false, error: 'No rewards found for this plan' };
    }
    
    let rewardCount = 0;
    
    // Add each reward to inventory
    for (const reward of rewards) {
      const inventoryItem = {
        id: `${planId}-${reward.id}-${Date.now()}`,
        name: reward.name,
        type: reward.type,
        quantity: reward.quantity,
        image: reward.image,
        description: reward.description,
        rarity: reward.rarity,
        purchasedAt: new Date().toISOString(),
        equipped: false
      };
      
      // Save to inventory
      inventoryService.saveToInventory(inventoryItem);
      rewardCount++;
      
      console.log(`✅ Reward added: ${reward.name} (qty: ${reward.quantity})`);
    }
    
    // Sync to cloud
    await inventoryService.syncInventoryToCloud(piUserId);
    
    // Record in database
    await this.recordRewardsClaimed(piUserId, planId, transactionId, rewards);
    
    return { success: true, rewardCount };
    
  } catch (error) {
    console.error('❌ Error claiming rewards:', error);
    return { success: false, error: error.message };
  }
}

// New method: Record rewards in database
private async recordRewardsClaimed(
  piUserId: string,
  planId: string,
  transactionId: string,
  rewards: SubscriptionReward[]
): Promise<void> {
  const { error } = await supabase
    .from('claimed_rewards')
    .insert({
      pi_user_id: piUserId,
      plan_id: planId,
      transaction_id: transactionId,
      reward_count: rewards.length,
      rewards_data: rewards,
      claimed_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Failed to record claimed rewards:', error);
  }
}

// New method: Get claimed rewards history
async getClaimedRewardsHistory(piUserId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('claimed_rewards')
    .select('*')
    .eq('pi_user_id', piUserId)
    .order('claimed_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching claimed rewards:', error);
    return [];
  }
  
  return data || [];
}
```

#### Required Database Table:
```sql
-- Claimed Rewards Tracking
CREATE TABLE claimed_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pi_user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  reward_count INTEGER NOT NULL,
  rewards_data JSONB NOT NULL,
  claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id)
);
```

---

### Phase 4: Implement Cloud Backup on Pi Login

#### File: Create new file `src/hooks/useCloudSync.ts`

```typescript
import { useEffect } from 'react';
import { inventoryService } from '@/services/inventoryService';
import { subscriptionService } from '@/services/subscriptionService';
import { useAuth } from '@/context/AuthContext'; // or your auth hook

export const useCloudSync = () => {
  const { piUser } = useAuth(); // Get current Pi user
  
  useEffect(() => {
    if (!piUser?.uid) return;
    
    const syncDataToCloud = async () => {
      try {
        console.log('🔄 Starting cloud sync for user:', piUser.uid);
        
        // 1. Load existing cloud inventory
        const cloudInventory = await inventoryService.loadInventoryFromCloud(piUser.uid);
        
        // 2. Merge with local inventory
        const localInventory = inventoryService.getInventory();
        const merged = inventoryService.mergeInventoryData(localInventory, cloudInventory);
        
        // 3. Update local storage with merged data
        localStorage.setItem('flappypi-inventory', JSON.stringify(merged));
        
        // 4. Sync back to cloud
        await inventoryService.syncInventoryToCloud(piUser.uid);
        
        // 5. Check subscription status and expiry
        const subStatus = await subscriptionService.checkSubscriptionStatus(piUser.uid);
        if (subStatus?.subscription_status === 'active') {
          const { expiringThisWeek, renewalNeeded } = await subscriptionService.checkExpiringSubscriptions(piUser.uid);
          
          if (renewalNeeded) {
            console.warn('⚠️ Subscription renewal needed!', expiringThisWeek);
            // Show renewal notification to user
          }
        }
        
        console.log('✅ Cloud sync completed');
        
      } catch (error) {
        console.error('❌ Cloud sync failed:', error);
      }
    };
    
    syncDataToCloud();
    
  }, [piUser?.uid]);
};
```

#### Integration point: In your auth/login handler
```typescript
// When user logs in with Pi account
if (piUser && piUser.uid) {
  // 1. Initialize/load user profile
  await backendStorageService.initializeUserProfile(piUser);
  
  // 2. Trigger cloud sync (via useCloudSync hook)
  // 3. System automatically syncs inventory
  // 4. Subscriptions and rewards are checked
}
```

---

## Summary of Changes Required

| Component | Changes | Purpose |
|-----------|---------|---------|
| `inventoryService.ts` | Add `syncInventoryToCloud()`, `loadInventoryFromCloud()`, `mergeInventoryData()` | Cloud sync |
| `subscriptionService.ts` | Add expiry checks, renewal logic, reward claiming | Expiry tracking & rewards |
| `user_inventory` table | Create new | Store all items in cloud |
| `renewal_reminders` table | Create new | Track expiring subscriptions |
| `claimed_rewards` table | Create new | Track reward distribution |
| `useCloudSync.ts` hook | Create new | Auto-sync on login |
| Auth handler | Integrate `useCloudSync` | Trigger sync on Pi login |

---

## Testing Checklist

### Phase 1: Inventory Sync
- [ ] Purchase item with Pi → verify saved to `user_inventory` table
- [ ] Login as same Pi user → verify inventory loads from cloud
- [ ] Add local item → sync → verify synced
- [ ] Merge test: Add item locally + item in cloud → merge keeps both

### Phase 2: Subscription Expiry
- [ ] Create subscription → verify `expiresAt` calculated correctly
- [ ] Check expiry date in `user_profiles.subscription_end`
- [ ] Get expiring subscriptions → verify within 7 days shown
- [ ] Test renewal reminder creation

### Phase 3: Reward Distribution
- [ ] Buy subscription plan → verify all rewards delivered to inventory
- [ ] Check `claimed_rewards` table → verify recorded
- [ ] Count rewards in inventory → should match plan config
- [ ] Check inventory UI → all rewards visible with correct metadata

### Phase 4: Cloud Backup
- [ ] Login with Pi account → trigger sync
- [ ] Verify inventory synced
- [ ] Check subscriptions loaded
- [ ] Logout → login again → verify data persists

---

## Files That Need Creation

1. **`src/hooks/useCloudSync.ts`** - Cloud sync hook
2. **Supabase Migration SQL** - Create 3 new tables

---

## Files That Need Modification

1. **`src/services/inventoryService.ts`** - Add cloud sync methods
2. **`src/services/subscriptionService.ts`** - Add expiry & reward methods
3. **Auth handler** - Integrate cloud sync on login
4. **Inventory UI component** - Display cloud sync status

---

## Next Steps

1. ✅ Understand requirements (DONE)
2. ⏳ **NEXT: Create/modify files** 
3. ⏳ Test each phase
4. ⏳ Verify Supabase tables created
5. ⏳ Deploy to production

---

**Ready to implement?** Let me know and I'll start making these changes!
