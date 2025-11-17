# 🔄 CLOUD STORAGE SYSTEM - VISUAL FLOW DIAGRAM

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    FLAPPY PI CLOUD STORAGE SYSTEM                              ║
║                          Complete Data Flow                                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                         1. USER LOGIN WITH PI NETWORK                         │
└─────────────────────────────────────────────────────────────────────────────┘

    User clicks "Login with Pi"
           ↓
    Pi Authentication Modal
           ↓
    User approves (username + payments scope)
           ↓
    ┌──────────────────────────────────────┐
    │  AuthContext.loginWithPi(user)       │
    │  - Store user in localStorage        │
    │  - Set isAuthenticated = true        │
    │  - Set isPiAuth = true              │
    │  - Fire 'auth-state-changed' event  │
    └──────────────────────────────────────┘
           ↓
    ⏱️  Wait 1.5 seconds (let auth settle)
           ↓
    ┌──────────────────────────────────────┐
    │  🔄 CLOUD SYNC TRIGGERED            │
    │  inventoryService.performFullCloud   │
    │  Sync(piUser.uid)                    │
    └──────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                    2. FULL CLOUD SYNC WORKFLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────────────┐
    │  Step 1: Get Local Inventory                                     │
    │  📦 const localInventory = this.getInventory()                   │
    │  Result: [item1, item2, item3] from localStorage                │
    └──────────────────────────────────────────────────────────────────┘
           ↓
    ┌──────────────────────────────────────────────────────────────────┐
    │  Step 2: Load from Supabase                                      │
    │  ☁️  const cloudInventory = await this.loadInventoryFromCloud()  │
    │                                                                   │
    │  SELECT items FROM user_inventory_sync                           │
    │  WHERE pi_user_id = 'user123'                                    │
    │                                                                   │
    │  Result: [item2, item3, item4] from Supabase                    │
    └──────────────────────────────────────────────────────────────────┘
           ↓
    ┌──────────────────────────────────────────────────────────────────┐
    │  Step 3: Merge Local + Cloud                                     │
    │  🔀 const merged = this.mergeInventoryData(local, cloud)         │
    │                                                                   │
    │  Merge Logic:                                                     │
    │  - Cloud has priority (authoritative)                            │
    │  - For powerups: sum quantities                                  │
    │  - For subscriptions: keep latest expiry                         │
    │  - For skins: keep unique items                                  │
    │                                                                   │
    │  Result: [item1, item2, item3, item4] - all unique items        │
    └──────────────────────────────────────────────────────────────────┘
           ↓
    ┌──────────────────────────────────────────────────────────────────┐
    │  Step 4: Save Merged to localStorage                             │
    │  💾 localStorage.setItem('flappypi-inventory', merged)           │
    └──────────────────────────────────────────────────────────────────┘
           ↓
    ┌──────────────────────────────────────────────────────────────────┐
    │  Step 5: Sync Merged Back to Cloud                               │
    │  ☁️  await this.syncInventoryToCloud(piUserId)                   │
    │                                                                   │
    │  INSERT INTO user_inventory_sync (pi_user_id, items, ...)       │
    │  VALUES ('user123', [item1, item2, item3, item4], NOW())        │
    │  ON CONFLICT (pi_user_id) DO UPDATE                             │
    │                                                                   │
    │  Result: ✅ Cloud now has complete merged inventory              │
    └──────────────────────────────────────────────────────────────────┘
           ↓
    ┌──────────────────────────────────────────────────────────────────┐
    │  Step 6: Check Subscription Status                               │
    │  📅 subscriptionService.checkExpiringSubscriptions()             │
    │                                                                   │
    │  If subscription expires in < 7 days:                            │
    │    → Create renewal reminder in database                         │
    │    → Show toast notification to user                             │
    └──────────────────────────────────────────────────────────────────┘
           ↓
    ✅ SYNC COMPLETE
    Fire 'cloud-sync-complete' event
    User sees all items in inventory UI


┌─────────────────────────────────────────────────────────────────────────────┐
│                      3. PURCHASE ITEM WORKFLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

    User clicks "Buy Power-up" (5 Pi)
           ↓
    ┌──────────────────────────────────────┐
    │  Pi Payment Modal                    │
    │  User approves payment               │
    └──────────────────────────────────────┘
           ↓
    Payment completes successfully
           ↓
    ┌──────────────────────────────────────────────────────────────────┐
    │  inventoryService.saveToInventory(item)                          │
    │  - Add item to localStorage inventory                            │
    │  - Fire 'inventory-updated' event                                │
    └──────────────────────────────────────────────────────────────────┘
           ↓
    ⏱️  Wait 2 seconds (debounce for multiple quick purchases)
           ↓
    ┌──────────────────────────────────────────────────────────────────┐
    │  🔄 AUTO-SYNC TRIGGERED                                          │
    │  useCloudSync hook detects 'inventory-updated' event             │
    │                                                                   │
    │  await inventoryService.syncInventoryToCloud(piUserId)           │
    │                                                                   │
    │  UPDATE user_inventory_sync                                      │
    │  SET items = [updated_inventory], last_sync_time = NOW()        │
    │  WHERE pi_user_id = 'user123'                                    │
    └──────────────────────────────────────────────────────────────────┘
           ↓
    ✅ Item backed up to cloud
    Available on all devices


┌─────────────────────────────────────────────────────────────────────────────┐
│                   4. SUBSCRIPTION PURCHASE WORKFLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

    User clicks "Subscribe to Premium" (10 Pi / month)
           ↓
    Pi Payment Modal → User approves
           ↓
    ┌──────────────────────────────────────────────────────────────────┐
    │  subscriptionService.activateSubscription(                       │
    │    piUserId: 'user123',                                          │
    │    planId: 'premium',                                            │
    │    planName: 'Premium Plan',                                     │
    │    durationDays: 30,                                             │
    │    piTransactionId: 'txn_abc123',                                │
    │    amountPi: 10                                                  │
    │  )                                                                │
    │                                                                   │
    │  Calls Supabase function: activate_subscription                  │
    │                                                                   │
    │  Actions in database:                                            │
    │  1. UPDATE user_profiles                                         │
    │     SET subscription_status = 'active',                          │
    │         subscription_start = NOW(),                              │
    │         subscription_end = NOW() + INTERVAL '30 days',          │
    │         subscription_type = 'premium'                            │
    │                                                                   │
    │  2. INSERT INTO subscriptions                                    │
    │     VALUES (user_id, plan_id, start, end, txn_id, amount)       │
    └──────────────────────────────────────────────────────────────────┘
           ↓
    ┌──────────────────────────────────────────────────────────────────┐
    │  🎁 DELIVER REWARDS                                              │
    │  subscriptionService.recordClaimedRewards(...)                   │
    │                                                                   │
    │  1. Get rewards for 'premium' plan from subscriptionRewards.ts   │
    │     → 10x Mystery Boxes                                          │
    │     → 50x Shield Power-ups                                       │
    │     → 50x Magnet Power-ups                                       │
    │     → 10,000 Coins                                               │
    │                                                                   │
    │  2. Add each reward to inventory                                 │
    │     inventoryService.saveToInventory(reward)                     │
    │                                                                   │
    │  3. Record in database                                           │
    │     INSERT INTO claimed_rewards                                  │
    │     VALUES (user_id, plan_id, txn_id, rewards_data)             │
    └──────────────────────────────────────────────────────────────────┘
           ↓
    ┌──────────────────────────────────────────────────────────────────┐
    │  📅 CREATE RENEWAL REMINDER                                      │
    │  subscriptionService.saveRenewalReminders(...)                   │
    │                                                                   │
    │  INSERT INTO renewal_reminders                                   │
    │  VALUES (                                                         │
    │    pi_user_id: 'user123',                                        │
    │    subscription_plan_id: 'premium',                              │
    │    expiry_date: NOW() + INTERVAL '30 days',                     │
    │    reminder_sent: false                                          │
    │  )                                                                │
    └──────────────────────────────────────────────────────────────────┘
           ↓
    🔄 Auto-sync inventory to cloud (includes new rewards)
           ↓
    ✅ COMPLETE
    - Subscription active for 30 days
    - All rewards delivered and visible in inventory
    - Renewal reminder scheduled for day 23
    - Everything backed up to cloud


┌─────────────────────────────────────────────────────────────────────────────┐
│                     5. CROSS-DEVICE SYNC SCENARIO                             │
└─────────────────────────────────────────────────────────────────────────────┘

    DEVICE A (Laptop)                    DEVICE B (Phone)
    ─────────────────                    ────────────────
    
    User logs in with Pi                 
    Pi UID: user123                      
           ↓                              
    Purchase Shield Power-up (3 Pi)      
           ↓                              
    Item added to localStorage           
           ↓                              
    Auto-sync to Supabase                
           ↓                              
    ┌─────────────────────────┐          
    │  Supabase Cloud         │          
    │  user_inventory_sync    │          
    │  {                      │          
    │    pi_user_id: user123  │          
    │    items: [             │          
    │      { id: shield, ... }│ ←───────────────┐
    │    ]                    │                  │
    │  }                      │                  │
    └─────────────────────────┘                  │
                                                  │
                                        User logs in with Pi
                                        Same Pi UID: user123
                                                  ↓
                                        Cloud sync triggered
                                                  ↓
                                        Load inventory from Supabase
                                                  ↓
                                        Shield item downloaded
                                                  ↓
                                        Saved to localStorage
                                                  ↓
                                        ✅ Shield appears in inventory!


┌─────────────────────────────────────────────────────────────────────────────┐
│                   6. SUBSCRIPTION EXPIRY TRACKING                             │
└─────────────────────────────────────────────────────────────────────────────┘

    Day 1: Subscription Starts
    ┌─────────────────────────────────────────────────────────────────┐
    │  user_profiles                                                   │
    │  - subscription_status: 'active'                                │
    │  - subscription_start: 2025-11-15                               │
    │  - subscription_end: 2025-12-15                                 │
    │  - subscription_type: 'premium'                                 │
    └─────────────────────────────────────────────────────────────────┘

    Day 23: Expiry Check (7 days before end)
    ┌─────────────────────────────────────────────────────────────────┐
    │  User logs in                                                    │
    │  ↓                                                               │
    │  subscriptionService.checkExpiringSubscriptions(user123, 7)     │
    │  ↓                                                               │
    │  SELECT * FROM get_expiring_subscriptions('user123', 7)         │
    │  ↓                                                               │
    │  Result: 1 subscription expiring in 7 days                      │
    │  ↓                                                               │
    │  saveRenewalReminders()                                         │
    │  ↓                                                               │
    │  INSERT INTO renewal_reminders (...)                            │
    │  ↓                                                               │
    │  Show toast: "⚠️ Subscription expiring in 7 days!"             │
    └─────────────────────────────────────────────────────────────────┘

    Day 30: Subscription Ends
    ┌─────────────────────────────────────────────────────────────────┐
    │  Cron job or user action triggers:                              │
    │  subscriptionService.expireSubscriptions()                      │
    │  ↓                                                               │
    │  UPDATE user_profiles                                           │
    │  SET subscription_status = 'expired'                            │
    │  WHERE subscription_end < NOW()                                 │
    │        AND subscription_status = 'active'                       │
    │  ↓                                                               │
    │  User notified: "Your subscription has expired"                 │
    └─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                        7. DATABASE STRUCTURE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────────┐
    │  user_inventory_sync                                         │
    ├──────────────────────────────────────────────────────────────┤
    │  id              UUID PRIMARY KEY                            │
    │  pi_user_id      TEXT UNIQUE (Pi Network user ID)           │
    │  items           JSONB (Array of inventory items)           │
    │  last_sync_time  TIMESTAMP                                   │
    │  sync_status     TEXT ('completed', 'pending', 'error')     │
    │  created_at      TIMESTAMP                                   │
    │  updated_at      TIMESTAMP                                   │
    └──────────────────────────────────────────────────────────────┘
                              ↓ (1:many)
    ┌──────────────────────────────────────────────────────────────┐
    │  renewal_reminders                                           │
    ├──────────────────────────────────────────────────────────────┤
    │  id                      UUID PRIMARY KEY                    │
    │  pi_user_id              TEXT                                │
    │  subscription_plan_id    TEXT                                │
    │  subscription_plan_name  TEXT                                │
    │  expiry_date             TIMESTAMP                           │
    │  reminder_sent           BOOLEAN (default: false)            │
    │  reminder_sent_at        TIMESTAMP                           │
    │  renewal_completed       BOOLEAN (default: false)            │
    │  created_at              TIMESTAMP                           │
    └──────────────────────────────────────────────────────────────┘
                              ↓ (1:many)
    ┌──────────────────────────────────────────────────────────────┐
    │  claimed_rewards                                             │
    ├──────────────────────────────────────────────────────────────┤
    │  id                UUID PRIMARY KEY                          │
    │  pi_user_id        TEXT                                      │
    │  plan_id           TEXT                                      │
    │  plan_name         TEXT                                      │
    │  transaction_id    TEXT UNIQUE (Pi payment txn)             │
    │  reward_count      INTEGER                                   │
    │  rewards_data      JSONB (Array of rewards)                 │
    │  claimed_at        TIMESTAMP                                 │
    │  synced_to_inv     BOOLEAN (default: true)                  │
    └──────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                       8. KEY FEATURES SUMMARY                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    ✅ AUTOMATIC CLOUD BACKUP
       - Every purchase saved to Supabase
       - No manual sync required
       - 2-second debounce for efficiency

    ✅ CROSS-DEVICE SYNC
       - Same Pi account = same inventory everywhere
       - Real-time sync on login
       - Conflict resolution (cloud priority)

    ✅ ZERO DATA LOSS
       - Local localStorage cache
       - Cloud Supabase backup
       - Double redundancy

    ✅ SUBSCRIPTION TRACKING
       - Exact expiry dates
       - Renewal reminders (7 days before)
       - Automatic expiration handling

    ✅ REWARD DISTRIBUTION
       - All subscription rewards delivered
       - Tracked in database
       - No duplicate rewards possible

    ✅ PERFORMANCE OPTIMIZED
       - Debounced auto-sync (2 seconds)
       - Parallel operations where possible
       - Minimal UI blocking


┌─────────────────────────────────────────────────────────────────────────────┐
│                          9. SECURITY FEATURES                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    ✅ ROW LEVEL SECURITY (RLS)
       - Users can only read/write their own data
       - pi_user_id matching required
       - No cross-user data access

    ✅ SAFE API KEYS
       - VITE_SUPABASE_ANON_KEY: Public (read-only via RLS)
       - VITE_SUPABASE_SERVICE_ROLE_KEY: Backend only (bypasses RLS)

    ✅ DATA VALIDATION
       - JSONB type checking
       - Unique constraints (transaction_id)
       - Foreign key relationships

    ✅ AUDIT TRAIL
       - All transactions recorded
       - Timestamps on all operations
       - Complete purchase history


═══════════════════════════════════════════════════════════════════════════════

                        🎉 SYSTEM READY FOR PRODUCTION 🎉

═══════════════════════════════════════════════════════════════════════════════
```
