# ✅ Reward System Fix - Deployment Checklist

## Pre-Deployment Verification

### Code Changes ✅
- [x] `inventoryService.ts` updated (claimSubscriptionRewards)
- [x] `inventoryService.ts` updated (syncInventoryToCloud)
- [x] `inventoryService.ts` updated (loadInventoryFromCloud)
- [x] `cloud-sync-migration.sql` updated (wallet_balance column)
- [x] No TypeScript errors detected
- [x] No breaking changes introduced

### Documentation Created ✅
- [x] REWARD_DELIVERY_SYSTEM_FIXED.md (complete technical docs)
- [x] QUICK_DEPLOYMENT_REWARD_FIX.md (deployment guide)
- [x] REWARD_FIX_SUMMARY.md (executive summary)
- [x] REWARD_FLOW_VISUAL_GUIDE.md (visual diagrams)
- [x] This checklist file

## Deployment Steps

### Step 1: Database Migration (REQUIRED)
```sql
-- Run this in Supabase SQL Editor
ALTER TABLE user_inventory_sync 
ADD COLUMN IF NOT EXISTS wallet_balance INTEGER NOT NULL DEFAULT 0;
```

**Verification**:
- [ ] Go to Supabase Dashboard
- [ ] Navigate to Table Editor → `user_inventory_sync`
- [ ] Confirm `wallet_balance` column exists
- [ ] Column type: INTEGER
- [ ] Default value: 0

### Step 2: Code Deployment
- [ ] All files already updated in repository
- [ ] Run `npm run build` (if deploying to production)
- [ ] Deploy to hosting platform (Vercel/etc)
- [ ] Verify deployment succeeded

### Step 3: Testing

#### Test 1: Starter Plan ($0.10 or 0.1 Pi)
- [ ] Purchase Starter Plan
- [ ] Open browser console
- [ ] Verify log: `💰 Added 3000 coins to wallet. New balance: X`
- [ ] Check wallet displays: **+3000 coins**
- [ ] Open Inventory modal
- [ ] Verify items:
  - [ ] 1x Mystery Box
  - [ ] 5x Shield
  - [ ] 5x Coin Magnet
  - [ ] 5x Speed Boost
  - [ ] 5x Slow Motion
  - [ ] 5x Double Score

#### Test 2: Premium Plan ($0.50 or 0.5 Pi)
- [ ] Purchase Premium Plan
- [ ] Verify log: `💰 Added 15000 coins to wallet`
- [ ] Check wallet: **+15,000 coins**
- [ ] Verify items:
  - [ ] 1x Rare Mystery Box
  - [ ] 5x of each powerup (25 total)

#### Test 3: Ultimate Plan ($1.00 or 1 Pi)
- [ ] Purchase Ultimate Plan
- [ ] Verify log: `💰 Added 30000 coins to wallet`
- [ ] Check wallet: **+30,000 coins**
- [ ] Verify items:
  - [ ] 1x Legendary Mystery Box
  - [ ] 1x Ultimate Bundle
  - [ ] 7x of each powerup (35 total)
  - [ ] **Fire Phoenix Skin** (bird_12.png)
- [ ] Go to Skins section
- [ ] Verify Fire Phoenix appears
- [ ] Verify it can be equipped

#### Test 4: Cloud Sync
- [ ] Complete Test 3 on Device A
- [ ] Login with same Pi account on Device B
- [ ] Verify wallet balance syncs (30k coins)
- [ ] Verify inventory syncs (all items present)
- [ ] Verify Fire Phoenix skin syncs
- [ ] Check console log: `💰 Restored wallet balance from cloud: 30000`

#### Test 5: Event System
Open browser console and run:
```javascript
window.addEventListener('wallet-balance-updated', (e) => {
  console.log('✅ Wallet event fired:', e.detail);
});

window.addEventListener('inventory-updated', (e) => {
  console.log('✅ Inventory event fired:', e.detail);
});

// Then purchase a plan and claim rewards
```
- [ ] Verify `wallet-balance-updated` event fires with correct balance
- [ ] Verify `inventory-updated` events fire for each item
- [ ] Verify UI updates immediately

## Post-Deployment Monitoring

### Console Logs to Monitor
```javascript
// On reward claim:
💰 Added X coins to wallet. New balance: Y
📦 Added Xx Item Name to inventory
✅ Inventory + wallet synced to Supabase: N items, Y coins

// On cloud sync:
🔄 Syncing inventory + wallet to cloud: N items, Y coins for user: abc123
✅ Inventory + wallet synced to Supabase: N items, Y coins
💰 Restored wallet balance from cloud: Y coins
```

### Error Scenarios to Test
- [ ] Purchase with insufficient Pi balance (should show error)
- [ ] Claim rewards twice (should prevent duplicate claims)
- [ ] Logout/login immediately after claim (should persist)
- [ ] Purchase without Pi authentication (should require login)

### Supabase Monitoring
- [ ] Check `user_inventory_sync` table
- [ ] Verify new rows have `wallet_balance` populated
- [ ] Verify `items` JSONB array contains correct data
- [ ] Check `last_sync_time` updates on each sync
- [ ] Monitor `sync_status` for failures

## Rollback Plan (If Issues Occur)

### Revert Code Changes
```bash
git revert <commit-hash>
```

### Revert Database Migration
```sql
-- Only if necessary - removes wallet_balance column
ALTER TABLE user_inventory_sync DROP COLUMN wallet_balance;
```

**Note**: This will lose synced wallet balance data. Only use if critical issue.

### Emergency Fix (Hot Patch)
If coins still not adding:
```typescript
// Temporary fix in claimSubscriptionRewards()
planRewards.rewards.forEach(reward => {
  if (reward.type === 'coins' || reward.id === 'flappy_coins') {
    // Force coin handling
    const { loadWalletBalance, saveWalletBalance } = require('@/utils/walletUtils');
    const current = loadWalletBalance();
    saveWalletBalance(current + reward.quantity);
    console.log(`HOTFIX: Added ${reward.quantity} coins`);
  } else {
    this.saveToInventory(reward);
  }
});
```

## Success Criteria

### ✅ All Green Checks Required:
- [ ] Coins add to wallet balance (not inventory)
- [ ] Items add to inventory (not wallet)
- [ ] Fire Phoenix skin unlocks for Ultimate plan
- [ ] Wallet balance syncs to Supabase
- [ ] Cloud sync works across devices
- [ ] No console errors during reward claim
- [ ] UI updates immediately after claim
- [ ] No duplicate reward claims possible
- [ ] localStorage persists correctly
- [ ] Supabase table has wallet_balance column

## Common Issues & Solutions

### Issue: Wallet still shows zero
**Solution**: 
- Check console for errors
- Verify `saveWalletBalance()` is called
- Check localStorage key: `flappypi-balance`
- Try: `localStorage.getItem('flappypi-balance')`

### Issue: Items not in inventory
**Solution**:
- Check console for `📦 Added` logs
- Verify `saveToInventory()` is called
- Check localStorage key: `flappypi-inventory`
- Try: `JSON.parse(localStorage.getItem('flappypi-inventory'))`

### Issue: Fire Phoenix not appearing
**Solution**:
- Verify Ultimate plan purchased
- Check inventory for `id: 'inferno_phoenix'`
- Verify image path: `/birds/bird_12.png`
- Check if auto-equipped (first skin)

### Issue: Cloud sync failing
**Solution**:
- Verify Supabase credentials in `.env`
- Check `wallet_balance` column exists
- Verify Pi user authenticated
- Check Supabase logs for errors

## Support Information

### Key Files:
- `src/services/inventoryService.ts` (reward logic)
- `migrations/cloud-sync-migration.sql` (database schema)
- `src/constants/subscriptionRewards.ts` (reward definitions)

### Console Commands for Debugging:
```javascript
// Check wallet balance
localStorage.getItem('flappypi-balance')

// Check inventory
JSON.parse(localStorage.getItem('flappypi-inventory'))

// Check unclaimed rewards
JSON.parse(localStorage.getItem('flappypi-unclaimed-subscription-rewards'))

// Manually trigger cloud sync
InventoryService.getInstance().performFullCloudSync('pi_user_id_here')

// Clear all data (testing only)
localStorage.clear()
```

### Documentation:
- Full technical: `REWARD_DELIVERY_SYSTEM_FIXED.md`
- Quick start: `QUICK_DEPLOYMENT_REWARD_FIX.md`
- Visual guide: `REWARD_FLOW_VISUAL_GUIDE.md`

---

## Sign-Off

- [ ] Database migration completed
- [ ] Code deployed successfully
- [ ] All tests passed
- [ ] No errors in production
- [ ] User confirmed rewards working
- [ ] Cloud sync verified
- [ ] Documentation complete

**Deployed By**: _________________  
**Date**: _________________  
**Version**: _________________  
**Status**: ⬜ Pending | ⬜ In Progress | ⬜ Complete

---

**Next Review**: Check Supabase `user_inventory_sync` table after 24 hours to verify sync data quality.
