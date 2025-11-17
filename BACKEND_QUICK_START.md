# ⚡ Quick Start - What Needs To Be Done

## Your Request (Summarized)
"Make sure all working items also work on backend. Save all data to Supabase cloud when user logs in with Pi account. Ensure exact expiry dates and renewal of subscription plans. Correct reward distribution visible in inventory."

---

## What This Means (Breakdown)

### 1. **"Save all data to backend cloud when Pi login"** 🔄
**Problem**: Items only in localStorage → Lost on logout or device switch
**Solution**: 
- Sync inventory to Supabase when Pi user logs in
- Load inventory from Supabase on future logins
- Create `user_inventory` table in Supabase

### 2. **"Exact expiry date and renewal of subscription"** ⏰
**Problem**: Expiry dates calculated but no renewal system
**Solution**:
- Track subscription_end dates properly in Supabase
- Create renewal reminders 7 days before expiry
- Implement auto-renewal option
- Create `renewal_reminders` table

### 3. **"Correct reward distribution"** 🎁
**Problem**: Rewards defined but not properly delivered to inventory
**Solution**:
- When subscription purchased → claim all rewards automatically
- Add each reward to user's inventory
- Track which rewards claimed in database
- Create `claimed_rewards` table

### 4. **"See items in inventory"** 👀
**Problem**: Rewards not showing in inventory UI
**Solution**: Inventory UI already works → just need to populate it with synced items

---

## Implementation (4 Simple Steps)

### STEP 1️⃣: Create Supabase Tables (5 minutes)
```sql
-- Copy this to Supabase SQL Editor

-- Table 1: Store all user inventory in cloud
CREATE TABLE user_inventory (
  pi_user_id TEXT PRIMARY KEY,
  items JSONB NOT NULL,
  lastSyncTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  syncStatus TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Track subscription renewal reminders
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

-- Table 3: Track claimed rewards
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

-- Add indexes for speed
CREATE INDEX idx_user_inventory_pi_user ON user_inventory(pi_user_id);
CREATE INDEX idx_renewal_reminders_expiry ON renewal_reminders(expiry_date);
CREATE INDEX idx_claimed_rewards_pi_user ON claimed_rewards(pi_user_id);
```

### STEP 2️⃣: Update inventoryService.ts (20 minutes)
**File**: `src/services/inventoryService.ts`

**Add these 3 methods to the InventoryService class**:

```typescript
// Method 1: Sync inventory to Supabase
async syncInventoryToCloud(piUserId: string): Promise<boolean> {
  const inventory = this.getInventory();
  
  const { error } = await supabase
    .from('user_inventory')
    .upsert({
      pi_user_id: piUserId,
      items: inventory,
      lastSyncTime: new Date().toISOString(),
      syncStatus: 'completed'
    }, { onConflict: 'pi_user_id' });
  
  if (error) {
    console.error('❌ Sync failed:', error);
    return false;
  }
  
  console.log('✅ Synced', inventory.length, 'items to cloud');
  return true;
}

// Method 2: Load inventory from Supabase
async loadInventoryFromCloud(piUserId: string): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('user_inventory')
    .select('items')
    .eq('pi_user_id', piUserId)
    .single();
  
  if (error || !data?.items) {
    console.warn('⚠️ No cloud inventory found');
    return [];
  }
  
  // Update localStorage with cloud data
  localStorage.setItem('flappypi-inventory', JSON.stringify(data.items));
  console.log('✅ Loaded', data.items.length, 'items from cloud');
  
  return data.items;
}

// Method 3: Merge cloud + local inventory
mergeInventoryData(localItems: InventoryItem[], cloudItems: InventoryItem[]): InventoryItem[] {
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
      // Merge by type
      if (item.type === 'powerup') {
        existing.quantity += item.quantity; // Sum powerups
      } else if (item.type === 'subscription') {
        // Keep latest subscription
        if (item.expiresAt && (!existing.expiresAt || item.expiresAt > existing.expiresAt)) {
          merged.set(item.id, item);
        }
      }
      // Skip duplicate skins
    }
  });
  
  return Array.from(merged.values());
}
```

### STEP 3️⃣: Update subscriptionService.ts (20 minutes)
**File**: `src/services/subscriptionService.ts`

**Add these 5 methods to the SubscriptionService class**:

```typescript
// Method 1: Check subscriptions expiring soon
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
  
  // Save reminders if needed
  if (expiringThisWeek.length > 0) {
    await this.saveRenewalReminders(piUserId, expiringThisWeek);
  }
  
  return {
    expiringToday,
    expiringThisWeek,
    renewalNeeded: expiringToday.length > 0
  };
}

// Method 2: Auto-renew subscription
async autoRenewSubscription(piUserId: string, planId: string): Promise<ActivateSubscriptionResult> {
  return await this.activateSubscription(
    piUserId,
    planId,
    `${planId}_renewal`,
    30, // 30 days renewal
    `auto_renewal_${Date.now()}`,
    0 // Will be charged
  );
}

// Method 3: Claim rewards for subscription
async claimSubscriptionRewards(
  piUserId: string,
  planId: string,
  transactionId: string
): Promise<{ success: boolean; rewardCount?: number; error?: string }> {
  try {
    const { inventoryService } = await import('@/services/inventoryService');
    const { getPlanRewards } = await import('@/constants/subscriptionRewards');
    
    const rewards = getPlanRewards(planId);
    if (rewards.length === 0) {
      return { success: false, error: 'No rewards found for plan' };
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
      
      inventoryService.saveToInventory(inventoryItem);
      rewardCount++;
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

// Method 4: Record rewards in database
private async recordRewardsClaimed(
  piUserId: string,
  planId: string,
  transactionId: string,
  rewards: any[]
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
    console.error('Failed to record rewards:', error);
  }
}

// Method 5: Save renewal reminders
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
    console.error('Failed to save reminders:', error);
  }
}
```

### STEP 4️⃣: Create useCloudSync Hook (15 minutes)
**File**: Create new file `src/hooks/useCloudSync.ts`

```typescript
import { useEffect } from 'react';
import { inventoryService } from '@/services/inventoryService';
import { subscriptionService } from '@/services/subscriptionService';
import { useAuth } from '@/context/AuthContext'; // Or your auth hook

export const useCloudSync = () => {
  const { piUser } = useAuth();
  
  useEffect(() => {
    if (!piUser?.uid) return;
    
    const syncToCloud = async () => {
      try {
        console.log('🔄 Cloud sync started for:', piUser.uid);
        
        // 1. Load cloud inventory
        const cloudInventory = await inventoryService.loadInventoryFromCloud(piUser.uid);
        
        // 2. Merge with local
        const localInventory = inventoryService.getInventory();
        const merged = inventoryService.mergeInventoryData(localInventory, cloudInventory);
        
        // 3. Update localStorage
        localStorage.setItem('flappypi-inventory', JSON.stringify(merged));
        
        // 4. Sync back to cloud
        await inventoryService.syncInventoryToCloud(piUser.uid);
        
        // 5. Check subscriptions
        const { renewalNeeded } = await subscriptionService.checkExpiringSubscriptions(piUser.uid);
        if (renewalNeeded) {
          console.warn('⚠️ Subscription renewal needed!');
          // Show notification to user
        }
        
        console.log('✅ Cloud sync completed');
        
      } catch (error) {
        console.error('❌ Cloud sync failed:', error);
      }
    };
    
    syncToCloud();
    
  }, [piUser?.uid]);
};
```

**Then use this hook in your auth/login component**:
```typescript
import { useCloudSync } from '@/hooks/useCloudSync';

export function MyLoginComponent() {
  useCloudSync(); // Automatically syncs when Pi user logged in
  
  return (
    // Your component
  );
}
```

---

## Testing Checklist (30 minutes)

```
[ ] SETUP
  [ ] Create all 3 Supabase tables
  [ ] Verify tables visible in Supabase dashboard
  [ ] Add 3 new methods to inventoryService.ts
  [ ] Add 5 new methods to subscriptionService.ts
  [ ] Create useCloudSync.ts hook
  [ ] Add hook to auth component

[ ] TEST PHASE 1: Inventory Sync
  [ ] Buy item with Pi → purchase succeeds
  [ ] Check browser console → sync message shows
  [ ] Go to Supabase → user_inventory table → verify item saved
  [ ] Logout → Login again → inventory loads from cloud
  [ ] Verify same items appear

[ ] TEST PHASE 2: Subscription Expiry
  [ ] Buy subscription → expiry date calculated
  [ ] Check user_profiles table → subscription_end date set
  [ ] Run checkExpiringSubscriptions → shows correct dates
  [ ] Verify renewal_reminders table gets populated

[ ] TEST PHASE 3: Reward Distribution
  [ ] Buy subscription plan → claimSubscriptionRewards called
  [ ] Check inventory → all rewards appear
  [ ] Check claimed_rewards table → transaction recorded
  [ ] Count rewards → matches subscriptionRewards.ts config
  [ ] All reward metadata correct (image, description, rarity)

[ ] TEST PHASE 4: Multi-Device
  [ ] Device A: Buy item → verify synced
  [ ] Device B: Login with same Pi user → item appears ✅
  [ ] Device A: Buy subscription → Device B: Logout/Login → rewards appear ✅
  [ ] Verify merge logic works (add items on both devices)
```

---

## Success Criteria ✅

After implementing these 4 steps:

- ✅ Users can buy items and they persist on backend
- ✅ Users can login from any device and see all their items
- ✅ Subscription expiry dates are tracked correctly
- ✅ Renewal reminders generated 7 days before expiry
- ✅ All subscription rewards auto-delivered to inventory
- ✅ All items visible in inventory UI with metadata
- ✅ Complete purchase history in Supabase for analytics

---

## Estimated Time: 1-2 Hours Total

| Task | Time |
|------|------|
| Create Supabase tables | 5 min |
| Update inventoryService.ts | 20 min |
| Update subscriptionService.ts | 20 min |
| Create useCloudSync hook | 15 min |
| Integrate into auth | 10 min |
| Test everything | 30 min |
| **TOTAL** | **~1.5 hours** |

---

## Summary

**What**: Backend cloud sync for inventory, subscriptions, and rewards
**Why**: Users need items to persist across devices and sessions
**How**: 3 new Supabase tables + enhancements to 2 services + 1 new hook
**Result**: Complete cloud backup of all user data with subscription management

---

## Ready? 🚀

I can start implementing all of this right now. 

**Should I proceed with:**
1. Creating the Supabase tables
2. Updating inventoryService.ts
3. Updating subscriptionService.ts
4. Creating useCloudSync hook
5. Testing everything

**Say YES and I'll do it all!** ✅
