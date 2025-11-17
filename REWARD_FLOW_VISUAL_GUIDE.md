# Reward Delivery Flow - Visual Guide

## 🎯 Purchase to Reward Flow (FIXED)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     USER PURCHASES SUBSCRIPTION                      │
│                      (e.g., Ultimate Plan - 1 Pi)                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Pi Payment Processing                           │
│  • PiPaymentModal opens                                             │
│  • User approves payment in Pi Browser                              │
│  • Backend creates A2U payment                                      │
│  • Payment submitted to Pi blockchain                               │
│  • Payment marked as completed                                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Unclaimed Rewards Stored                          │
│  localStorage: 'flappypi-unclaimed-subscription-rewards'            │
│  {                                                                  │
│    planId: 'ultimate_plan',                                         │
│    planName: 'Ultimate Plan',                                       │
│    rewards: [                                                       │
│      { id: 'flappy_coins', type: 'coins', quantity: 30000 },       │
│      { id: 'legendary_box', type: 'box', quantity: 1 },            │
│      { id: 'shield', type: 'powerup', quantity: 7 },               │
│      { id: 'inferno_phoenix', type: 'skin', quantity: 1 },         │
│      ... (9 total rewards)                                          │
│    ]                                                                │
│  }                                                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              User Clicks "Claim Rewards" Button                     │
│         (EnhancedRewardModal or SubscriptionPlansModal)             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│         claimSubscriptionRewards('ultimate_plan')                   │
│                  inventoryService.ts                                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
         ┌───────────────────┴────────────────────┐
         │                                        │
         ▼                                        ▼
┌─────────────────────┐              ┌─────────────────────────┐
│  FOR EACH REWARD    │              │   CHECK REWARD TYPE     │
│  IN rewards[]       │              │                         │
└──────────┬──────────┘              └───────────┬─────────────┘
           │                                     │
           ▼                                     │
    ┌──────────────┐                            │
    │ reward.type? │                            │
    └──────┬───────┘                            │
           │                                     │
     ┌─────┴─────┐                              │
     │           │                              │
     ▼           ▼                              │
  ═══════    ═══════                            │
  'coins'    'item'/'skin'/'powerup'            │
  ═══════    ═══════                            │
     │           │                              │
     │           │                              │
     ▼           ▼                              ▼

┌──────────────────────────┐    ┌──────────────────────────────────┐
│  💰 COIN HANDLING (NEW)  │    │  📦 ITEM HANDLING (EXISTING)     │
│                          │    │                                  │
│ 1. loadWalletBalance()   │    │ 1. Create inventoryItem object   │
│    → get current balance │    │                                  │
│                          │    │ 2. saveToInventory(item)         │
│ 2. newBalance =          │    │    • Check for duplicates        │
│    current + quantity    │    │    • Skins: always quantity 1    │
│    (e.g., 1000 + 30000)  │    │    • Powerups: add to existing   │
│                          │    │    • Fire Phoenix fix:           │
│ 3. saveWalletBalance(    │    │      id='inferno_phoenix'        │
│    newBalance)           │    │      image='/birds/bird_12.png'  │
│    → save to localStorage│    │                                  │
│    Key: 'flappypi-       │    │ 3. Save to localStorage          │
│         balance'         │    │    Key: 'flappypi-inventory'     │
│                          │    │                                  │
│ 4. Dispatch Event:       │    │ 4. Dispatch Event:               │
│    'wallet-balance-      │    │    'inventory-updated'           │
│     updated'             │    │                                  │
│                          │    │                                  │
│ 5. Log transaction       │    │ 5. Log transaction               │
│                          │    │                                  │
│ ✅ UI updates instantly  │    │ ✅ UI updates instantly          │
└──────────┬───────────────┘    └─────────────┬────────────────────┘
           │                                   │
           └───────────────┬───────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Remove from Unclaimed Rewards                      │
│  Filter out claimed plan from localStorage                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│               Dispatch 'unclaimed-rewards-updated'                  │
│  Components re-render to reflect claimed status                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    🌐 CLOUD SYNC (Background)                       │
│                                                                     │
│  If Pi user logged in:                                              │
│  • syncInventoryToCloud(piUserId)                                   │
│    ├─> Upload inventory items (JSONB)                              │
│    └─> Upload wallet_balance (INTEGER)  ✅ NEW                     │
│                                                                     │
│  Supabase Table: user_inventory_sync                                │
│  {                                                                  │
│    pi_user_id: "abc123...",                                         │
│    items: [...inventory array...],                                  │
│    wallet_balance: 31000,  ✅ NEW COLUMN                           │
│    last_sync_time: "2025-01-XX...",                                 │
│    sync_status: "completed"                                         │
│  }                                                                  │
│                                                                     │
│  ✅ Now accessible from any device!                                │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎁 Reward Breakdown Example (Ultimate Plan)

```
Ultimate Plan Purchase (1 Pi)
├─> 💰 Coins (type: 'coins')
│   └─> 30,000 Flappy Coins → Wallet Balance
│
├─> 📦 Mystery Boxes (type: 'box')
│   ├─> 1x Legendary Mystery Box → Inventory
│   └─> 1x Ultimate Bundle → Inventory
│
├─> ⚡ Powerups (type: 'powerup')
│   ├─> 7x Shield → Inventory
│   ├─> 7x Coin Magnet → Inventory
│   ├─> 7x Speed Boost → Inventory
│   ├─> 7x Slow Motion → Inventory
│   └─> 7x Double Score → Inventory
│
└─> 🎨 Skins (type: 'skin')
    └─> 1x Fire Phoenix (bird_12.png) → Inventory (auto-equip if first)
```

## 📊 Data Storage Locations

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WALLET BALANCE                              │
├─────────────────────────────────────────────────────────────────────┤
│  Local:  localStorage['flappypi-balance'] = 31000                   │
│  Cloud:  user_inventory_sync.wallet_balance = 31000                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         INVENTORY ITEMS                             │
├─────────────────────────────────────────────────────────────────────┤
│  Local:  localStorage['flappypi-inventory'] = [                     │
│            { id: 'legendary_box', type: 'box', quantity: 1, ... },  │
│            { id: 'shield', type: 'powerup', quantity: 7, ... },     │
│            { id: 'inferno_phoenix', type: 'skin', quantity: 1, ... }│
│          ]                                                          │
│                                                                     │
│  Cloud:  user_inventory_sync.items = [same JSON array]             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      UNCLAIMED REWARDS                              │
├─────────────────────────────────────────────────────────────────────┤
│  Local:  localStorage['flappypi-unclaimed-subscription-rewards']    │
│          (Cleared after claiming)                                   │
│                                                                     │
│  Cloud:  N/A (only stored locally until claimed)                    │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Cross-Device Sync Flow

```
Device A (Purchase & Claim)          Supabase Cloud          Device B (Login)
─────────────────────────            ──────────────          ────────────────

1. Purchase Ultimate Plan
   ├─> Pay 1 Pi
   └─> Rewards stored locally

2. Claim Rewards
   ├─> 30k coins → wallet
   ├─> Items → inventory
   └─> Skin → inventory

3. Cloud Sync Triggered
   ├─> Upload inventory []      ──>  Store in DB       
   └─> Upload wallet: 31000     ──>  wallet_balance    

                                                          4. User logs in with
                                                             same Pi account

                                                          5. Cloud sync loads
                                      <──  Fetch data       ├─> Get inventory []
                                      <──  wallet_balance   └─> Get wallet: 31000

                                                          6. Restore locally
                                                             ├─> localStorage
                                                             ├─> Dispatch events
                                                             └─> UI updates

                                                          ✅ Same 31k coins
                                                          ✅ Same inventory
                                                          ✅ Fire Phoenix equipped
```

## 🐛 Before vs After Fix

### BEFORE (Broken):
```
claimSubscriptionRewards()
  └─> FOR EACH reward:
      └─> saveToInventory(reward)  ❌ All rewards treated as items
          └─> localStorage['flappypi-inventory'] = [
                { id: 'flappy_coins', type: 'coins', quantity: 30000 },  ← WRONG!
                { id: 'shield', type: 'powerup', quantity: 7 },
                ...
              ]

Result: 
❌ Wallet balance: 0 (unchanged)
❌ Coins shown as "inventory item" (unusable)
```

### AFTER (Fixed):
```
claimSubscriptionRewards()
  └─> FOR EACH reward:
      ├─> IF type === 'coins':
      │   └─> saveWalletBalance(31000)  ✅ Coins → Wallet
      │       └─> localStorage['flappypi-balance'] = 31000
      │
      └─> ELSE:
          └─> saveToInventory(reward)  ✅ Items → Inventory
              └─> localStorage['flappypi-inventory'] = [
                    { id: 'shield', type: 'powerup', quantity: 7 },
                    { id: 'inferno_phoenix', type: 'skin', quantity: 1 },
                    ...
                  ]

Result:
✅ Wallet balance: 31,000 coins
✅ Inventory: 8 items (boxes, powerups, skins)
✅ Fire Phoenix skin unlocked and equipped
```

---

**Visual Flow Complete** ✅  
All reward delivery paths working correctly.
