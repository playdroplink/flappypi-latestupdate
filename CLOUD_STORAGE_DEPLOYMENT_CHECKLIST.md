# ✅ CLOUD STORAGE - DEPLOYMENT CHECKLIST

Use this checklist to ensure your cloud storage setup is complete and working correctly.

---

## 🚀 PRE-DEPLOYMENT CHECKLIST

### Environment Setup
- [x] Supabase project created and configured
- [x] Environment variables set in `.env`:
  - [x] `VITE_SUPABASE_URL`
  - [x] `VITE_SUPABASE_ANON_KEY`
  - [x] `VITE_SUPABASE_SERVICE_ROLE_KEY`
- [x] Code implementation complete (all files modified/created)

### Code Changes Verified
- [x] `migrations/cloud-sync-migration.sql` created
- [x] `src/hooks/useCloudSync.ts` created
- [x] `src/services/inventoryService.ts` updated (7 new methods)
- [x] `src/services/subscriptionService.ts` updated (10 new methods)
- [x] `src/context/AuthContext.tsx` updated (cloud sync trigger added)

---

## 📊 DEPLOYMENT STEPS

### Step 1: Deploy Database Migration
- [ ] Open Supabase Dashboard (https://app.supabase.com)
- [ ] Navigate to SQL Editor
- [ ] Copy contents of `migrations/cloud-sync-migration.sql`
- [ ] Paste into SQL editor
- [ ] Click "Run" button
- [ ] Wait for "Success" message

### Step 2: Verify Database Tables
- [ ] Go to Supabase → Table Editor
- [ ] Check these tables exist:
  - [ ] `user_inventory_sync`
  - [ ] `renewal_reminders`
  - [ ] `claimed_rewards`
- [ ] Check table structure (columns match migration)

### Step 3: Verify Database Functions
Run this query in SQL Editor:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_expiring_subscriptions',
  'sync_user_inventory',
  'create_renewal_reminder',
  'record_claimed_rewards'
);
```
- [ ] Should return 4 functions

### Step 4: Verify Database Views
Run this query:
```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
AND table_name IN (
  'active_subscriptions_with_expiry',
  'user_inventory_summary',
  'rewards_distribution_summary'
);
```
- [ ] Should return 3 views

---

## 🧪 TESTING CHECKLIST

### Local Development Tests

#### Test 1: Basic Cloud Sync
- [ ] Run `npm run dev`
- [ ] Open browser console (F12)
- [ ] Login with Pi Network account
- [ ] Look for console messages:
  ```
  🔄 Starting full cloud sync for user: [user_id]
  📦 Local inventory: X items
  ☁️ Cloud inventory: X items
  🔀 Merged inventory: X items
  ✅ Full cloud sync completed successfully
  ```
- [ ] Check Supabase Table Editor → `user_inventory_sync`
- [ ] Verify your `pi_user_id` row exists
- [ ] Check `items` column has JSON array

#### Test 2: Purchase Item Sync
- [ ] Stay logged in
- [ ] Purchase any item (e.g., power-up with coins)
- [ ] Wait 2 seconds
- [ ] Look for console message:
  ```
  🔄 Syncing inventory to cloud: X items
  ✅ Inventory synced to Supabase: X items
  ```
- [ ] Refresh Supabase Table Editor
- [ ] Verify `items` array updated
- [ ] Check `last_sync_time` is recent

#### Test 3: Logout/Login Persistence
- [ ] Note current inventory item count
- [ ] Logout from Pi account
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Login again with same Pi account
- [ ] Wait for sync
- [ ] Check inventory - should have same items
- [ ] Console should show: `✅ Loaded X items from cloud`

#### Test 4: Cross-Device Sync
- [ ] **Device A**: Login with Pi account
- [ ] **Device A**: Purchase a unique item (note the name)
- [ ] **Device A**: Wait for sync confirmation
- [ ] **Device B**: Open game in different browser/device
- [ ] **Device B**: Login with SAME Pi account
- [ ] **Device B**: Wait 2-3 seconds for sync
- [ ] **Device B**: Check inventory - item should appear
- [ ] ✅ Cross-device sync working!

#### Test 5: Subscription Tracking
- [ ] Create test subscription in database:
```sql
UPDATE user_profiles
SET 
  subscription_status = 'active',
  subscription_start = NOW(),
  subscription_end = NOW() + INTERVAL '5 days',
  subscription_type = 'premium'
WHERE pi_user_id = 'YOUR_PI_USER_ID';
```
- [ ] Login with that Pi account
- [ ] Check console for:
  ```
  ✅ Active subscription found, checking expiry...
  ```
- [ ] Check `renewal_reminders` table in Supabase
- [ ] Should have 1 row with `expiry_date` in 5 days

#### Test 6: Reward Distribution (Manual Test)
- [ ] Open browser console
- [ ] Run this code:
```javascript
const { inventoryService } = await import('./src/services/inventoryService');
const { getPlanRewards } = await import('./src/constants/subscriptionRewards');

// Get rewards for starter plan
const rewards = getPlanRewards('starter');
console.log('Rewards:', rewards);

// Add to inventory
for (const reward of rewards) {
  inventoryService.saveToInventory({
    id: `${reward.id}_test`,
    name: reward.name,
    type: reward.type,
    quantity: reward.quantity,
    purchasedAt: new Date().toISOString()
  });
}
```
- [ ] Check inventory UI - rewards should appear
- [ ] Check console - sync should trigger

---

## 🔍 VERIFICATION CHECKLIST

### Database Verification

#### user_inventory_sync Table
- [ ] Table exists
- [ ] Has at least 1 row (your test user)
- [ ] `pi_user_id` is unique
- [ ] `items` is valid JSON array
- [ ] `last_sync_time` is recent
- [ ] `sync_status` = 'completed'

#### renewal_reminders Table
- [ ] Table exists
- [ ] Can insert test data
- [ ] Indexes work (check pg_indexes)
- [ ] RLS policies active

#### claimed_rewards Table
- [ ] Table exists
- [ ] Can insert test data
- [ ] `transaction_id` is unique
- [ ] `rewards_data` is valid JSON

### Code Verification

#### inventoryService.ts
- [ ] `syncInventoryToCloud()` method exists
- [ ] `loadInventoryFromCloud()` method exists
- [ ] `mergeInventoryData()` method exists
- [ ] `performFullCloudSync()` method exists
- [ ] `getCloudSyncStatus()` method exists
- [ ] Methods have proper error handling
- [ ] Methods log to console for debugging

#### subscriptionService.ts
- [ ] `checkExpiringSubscriptions()` method exists
- [ ] `getSubscriptionExpiryDate()` method exists
- [ ] `saveRenewalReminders()` method exists
- [ ] `recordClaimedRewards()` method exists
- [ ] Methods call Supabase correctly
- [ ] Error handling in place

#### useCloudSync Hook
- [ ] Hook file exists at `src/hooks/useCloudSync.ts`
- [ ] Exports `useCloudSync` function
- [ ] Returns `syncStatus`, `triggerManualSync`, etc.
- [ ] Has proper TypeScript types
- [ ] Includes debouncing logic

#### AuthContext Integration
- [ ] Cloud sync trigger added to `loginWithPi()`
- [ ] Sync happens after 1.5 second delay
- [ ] Error handling doesn't break login
- [ ] Fires 'cloud-sync-complete' event

---

## 📈 PERFORMANCE CHECKLIST

### Timing Tests
- [ ] Initial sync (login) takes < 3 seconds
- [ ] Purchase item sync takes < 2 seconds
- [ ] Cross-device sync takes < 3 seconds
- [ ] No UI blocking during sync
- [ ] Console shows sync progress

### Load Tests
- [ ] Sync works with 0 items
- [ ] Sync works with 100+ items
- [ ] Merge handles conflicts correctly
- [ ] No duplicate items after merge
- [ ] Large JSON arrays handled (1000+ items)

### Error Handling
- [ ] Sync fails gracefully (no app crash)
- [ ] Error messages logged to console
- [ ] User sees toast notification on error
- [ ] Data still saved to localStorage on cloud fail
- [ ] Can retry sync manually

---

## 🔐 SECURITY CHECKLIST

### RLS (Row Level Security)
- [ ] RLS enabled on all 3 new tables
- [ ] Users can only read their own data
- [ ] Users can only write their own data
- [ ] Test: Try querying another user's data (should fail)

### API Keys
- [ ] `VITE_SUPABASE_ANON_KEY` in frontend (OK - protected by RLS)
- [ ] `VITE_SUPABASE_SERVICE_ROLE_KEY` NOT exposed in frontend
- [ ] Service role key only in backend (if applicable)
- [ ] Keys in `.env.local` not committed to git

### Data Validation
- [ ] JSONB columns validated
- [ ] Unique constraints enforced (transaction_id)
- [ ] Foreign keys prevent orphaned data
- [ ] Timestamps auto-generated

---

## 📱 PRODUCTION READINESS CHECKLIST

### Documentation
- [ ] `CLOUD_STORAGE_SETUP_COMPLETE.md` reviewed
- [ ] `CLOUD_STORAGE_QUICK_SUMMARY.md` reviewed
- [ ] `CLOUD_STORAGE_VISUAL_FLOW.md` reviewed
- [ ] Team understands architecture
- [ ] Deployment steps documented

### Monitoring
- [ ] Supabase logs accessible
- [ ] Error tracking enabled
- [ ] Sync success rate measurable
- [ ] Performance metrics available

### Backup & Recovery
- [ ] Supabase automatic backups enabled
- [ ] Know how to restore from backup
- [ ] Export user data function available
- [ ] Rollback plan documented

### User Communication
- [ ] Users notified about cloud sync feature
- [ ] Help docs updated
- [ ] Support team trained
- [ ] FAQs prepared

---

## 🎯 FINAL PRE-LAUNCH CHECKLIST

### Must-Haves Before Production
- [ ] All tests passing ✅
- [ ] Database migration deployed ✅
- [ ] Cross-device sync verified ✅
- [ ] Error handling tested ✅
- [ ] Performance acceptable ✅
- [ ] Security verified ✅
- [ ] Documentation complete ✅
- [ ] Team trained ✅

### Nice-to-Haves (Can Be Post-Launch)
- [ ] Sync status UI component
- [ ] Manual sync button in settings
- [ ] Sync history view
- [ ] Export data feature
- [ ] Analytics dashboard

---

## 🚨 TROUBLESHOOTING REFERENCE

### Issue: Sync not triggering
**Check:**
- [ ] User logged in with Pi account?
- [ ] `piUser.uid` exists in localStorage?
- [ ] Console shows any errors?
- [ ] Cloud sync trigger in AuthContext active?

**Fix:**
```javascript
// Manually trigger sync in console:
const { inventoryService } = await import('./src/services/inventoryService');
await inventoryService.performFullCloudSync('YOUR_PI_USER_ID');
```

### Issue: Items not appearing
**Check:**
- [ ] Supabase table has data?
- [ ] JSON format valid?
- [ ] RLS policies allow read?
- [ ] Last sync time recent?

**Fix:**
```sql
-- Check your data in Supabase:
SELECT * FROM user_inventory_sync WHERE pi_user_id = 'YOUR_ID';
```

### Issue: Duplicate items
**Check:**
- [ ] Merge logic working correctly?
- [ ] Same item being added multiple times?
- [ ] Item IDs unique?

**Fix:**
```javascript
// Clear duplicates:
const { inventoryService } = await import('./src/services/inventoryService');
const items = inventoryService.getInventory();
const unique = [...new Map(items.map(item => [item.id, item])).values()];
localStorage.setItem('flappypi-inventory', JSON.stringify(unique));
```

---

## ✅ CHECKLIST COMPLETION

### Sign-off
- [ ] Database migration completed by: ________________ Date: ________
- [ ] Testing completed by: ________________ Date: ________
- [ ] Security review by: ________________ Date: ________
- [ ] Production deployment by: ________________ Date: ________

### Success Criteria Met
- [ ] ✅ Zero data loss in testing
- [ ] ✅ Cross-device sync working
- [ ] ✅ Performance targets met (< 3 sec sync)
- [ ] ✅ Security verified (RLS working)
- [ ] ✅ All critical tests passing
- [ ] ✅ Documentation complete
- [ ] ✅ Team trained and ready

---

**🎉 When all checkboxes are checked, your cloud storage system is production-ready!**

**Next Action:** Deploy to production and monitor for first 24-48 hours.
