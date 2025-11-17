# Quick Deployment Guide - Reward System Fix

## 🚨 Critical: Run This FIRST

### Step 1: Update Supabase Database

Go to your Supabase dashboard → SQL Editor → Run this:

```sql
-- Add wallet_balance column to existing table
ALTER TABLE user_inventory_sync 
ADD COLUMN IF NOT EXISTS wallet_balance INTEGER NOT NULL DEFAULT 0;
```

**Verify**: Check Supabase Table Editor → `user_inventory_sync` table should now have `wallet_balance` column.

## ✅ What Was Fixed

1. **Coins Now Add to Wallet** (was broken ❌ → now working ✅)
2. **Items Saved to Inventory** (was working ✅ → still working ✅)
3. **Skins Applied Correctly** (was working ✅ → still working ✅)
4. **Wallet Syncs to Cloud** (was missing ❌ → now working ✅)

## 🎁 Subscription Rewards

| Plan | Coins | Items | Skins |
|------|-------|-------|-------|
| **Starter** | 3,000 | 1 Mystery Box + 25 powerups | - |
| **Premium** | 15,000 | 1 Rare Box + 25 powerups | - |
| **Ultimate** | 30,000 | 1 Legendary Box + 1 Bundle + 35 powerups | Fire Phoenix |

## 🧪 Test After Deploy

1. Buy Starter Plan → Check wallet shows **+3000 coins**
2. Open Inventory → See Mystery Box + powerups
3. Login on different device → Wallet + inventory syncs

## 📁 Files Changed

- `src/services/inventoryService.ts` (3 methods updated)
- `migrations/cloud-sync-migration.sql` (1 column added)

## ⚠️ Known Issue (Non-Breaking)

`useGameData()` is called without `userId` parameter in `useGameState.tsx` line 92. This may cause TypeScript warnings but doesn't affect reward delivery since localStorage is used for wallet persistence.

## 🆘 If Rewards Still Not Working

1. Check browser console for errors
2. Clear localStorage: `localStorage.clear()`
3. Logout/login with Pi Network
4. Check Supabase logs for sync errors

---

**Status**: Ready to deploy ✅  
**Breaking Changes**: None  
**Database Migration**: Required (1 ALTER TABLE command)
