# Mystery Box Wallet Glitch Fix - Complete Solution

## Problem Summary
When users opened mystery boxes and received flappy coins, the wallet balance was experiencing a glitch where:
- Coins were not properly syncing to the wallet display
- Double processing was happening (coins saved to inventory AND to wallet)
- Wallet balance wasn't updating consistently across the UI

## Root Cause Analysis

### The Flow Issue
1. **`openMysteryBox()` in inventoryService.ts** was saving ALL rewards (including coins) to inventory using `saveToInventory()`
2. **`MysteryBoxRewardModal`** component was then processing coins AGAIN from the rewards array
3. This caused coins to be:
   - Saved to inventory (wrong place for coins)
   - Processed again in the modal (double counting)
   - Not properly triggering wallet update events

### Technical Details
```typescript
// BEFORE: openMysteryBox() was doing this
rewards.forEach(reward => {
  this.saveToInventory(reward);  // ❌ Coins were saved as inventory items!
});

// THEN: MysteryBoxRewardModal was doing this again
if (reward.type === 'coins' && reward.id === 'flappy_coins') {
  const currentCoins = parseInt(localStorage.getItem('flappypi-coins') || '0', 10);
  const newCoins = currentCoins + reward.quantity;
  localStorage.setItem('flappypi-coins', newCoins.toString());  // ❌ Double processing!
}
```

## Solution Implemented

### Fix 1: Exclude Coins from Inventory Save (inventoryService.ts)

**File:** `src/services/inventoryService.ts`
**Lines:** 2100-2105

Changed the mystery box opening logic to NOT save coins to inventory:

```typescript
// Add rewards to inventory (but NOT coins - those are handled by the modal)
rewards.forEach(reward => {
  // Skip coins - they'll be added to wallet by the modal
  if (reward.type !== 'coins') {
    this.saveToInventory(reward);
  }
});
```

**Impact:** Coins are now returned in the rewards array but NOT saved to inventory. This allows the modal to handle them exclusively.

### Fix 2: Enhanced Event Dispatching (MysteryBoxRewardModal.tsx)

**File:** `src/components/MysteryBoxRewardModal.tsx`
**Lines:** 68-86

Added comprehensive event dispatching with logging to ensure WalletContext receives updates:

```typescript
if (totalCoinsEarned > 0) {
  console.log(`💰 [MysteryBox] Dispatching wallet-updated event for ${totalCoinsEarned} coins`);
  window.dispatchEvent(new CustomEvent('wallet-updated', { 
    detail: { coinsAdded: totalCoinsEarned, source: 'mystery-box' } 
  }));
  
  console.log(`🪙 [MysteryBox] Dispatching coins-claimed event for ${totalCoinsEarned} coins`);
  window.dispatchEvent(new CustomEvent('coins-claimed', {
    detail: { amount: totalCoinsEarned, source: 'mystery-box' }
  }));
  
  // Force a sync to WalletContext by triggering a forced refresh event
  console.log(`🔄 [MysteryBox] Forcing wallet balance refresh`);
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('force-wallet-refresh', {
      detail: { newBalance: parseInt(localStorage.getItem('flappypi-coins') || '0', 10) }
    }));
  }, 100);
}
```

**Features:**
- Dispatches `wallet-updated` event for general wallet listeners
- Dispatches `coins-claimed` event with source tracking ("mystery-box")
- Sends `force-wallet-refresh` event to ensure WalletContext syncs
- Adds detailed console logging with prefixes for debugging

### Fix 3: Added Force Wallet Refresh Handler (WalletContext.tsx)

**File:** `src/context/WalletContext.tsx`
**Lines:** 147-165

Added listener for the new `force-wallet-refresh` event:

```typescript
const handleForceWalletRefresh = (event: CustomEvent) => {
  const { newBalance } = event.detail;
  const currentCoins = parseInt(localStorage.getItem('flappypi-coins') || '0', 10);
  console.log(`🔄 [WalletContext] force-wallet-refresh event - current: ${currentCoins}, forcing sync`);
  setBalance(currentCoins);
};

// Added to event listener registration
window.addEventListener('force-wallet-refresh', handleForceWalletRefresh as EventListener);
```

**Impact:** Ensures WalletContext immediately updates its balance state when mystery box coins are claimed.

## Event Flow After Fix

```
1. User clicks "Open Mystery Box"
   ↓
2. openMysteryBox() generates rewards
   - Saves non-coin items to inventory
   - Returns coins in rewards array (NOT saved to inventory)
   ↓
3. MysteryBoxRewardModal processes rewards
   - Reads coin quantity from rewards
   - Updates localStorage['flappypi-coins'] directly
   - Dispatches 3 events:
     * wallet-updated (general update)
     * coins-claimed (specific source tracking)
     * force-wallet-refresh (immediate sync)
   ↓
4. WalletContext listeners receive events
   - handleWalletUpdate() updates balance
   - handleCoinsClaimed() updates balance with source
   - handleForceWalletRefresh() forces immediate sync
   ↓
5. Balance displayed correctly in UI
   - All components listening to balance state update
   - Wallet display reflects new coin count
   - No double-counting occurs
```

## Files Modified

1. **src/services/inventoryService.ts**
   - Modified `openMysteryBox()` method
   - Added check to skip coin rewards from inventory save
   - Added console logging

2. **src/components/MysteryBoxRewardModal.tsx**
   - Enhanced event dispatching in `autoClaimRewards()`
   - Added `force-wallet-refresh` event
   - Improved console logging with prefixes

3. **src/context/WalletContext.tsx**
   - Added `handleForceWalletRefresh()` handler
   - Registered new event listener
   - Added cleanup for event listener

## Testing Checklist

- [ ] Open a basic mystery box → coins should appear in wallet
- [ ] Open a rare mystery box → coins should appear in wallet
- [ ] Open a legendary mystery box → coins should appear in wallet
- [ ] Check console for [MysteryBox] and [WalletContext] logs
- [ ] Verify wallet balance updates immediately (not delayed)
- [ ] Verify no double coin additions occur
- [ ] Check localStorage['flappypi-coins'] matches displayed balance
- [ ] Test on both desktop and mobile
- [ ] Test with and without authentication

## Console Debug Output

When opening a mystery box, you should see:

```
💰 [MysteryBox] Added 1250 coins to wallet. Total: 3250
📦 [MysteryBox] Added Red Bird Skin (x1) to inventory
💰 [MysteryBox] Dispatching wallet-updated event for 1250 coins
🪙 [MysteryBox] Dispatching coins-claimed event for 1250 coins
🔄 [MysteryBox] Forcing wallet balance refresh
💰 [WalletContext] wallet-updated event - new balance: 3250 { coinsAdded: 1250, source: 'mystery-box' }
🪙 [WalletContext] coins-claimed event from 'mystery-box': +1250, new balance: 3250
🔄 [WalletContext] force-wallet-refresh event - current: 3250, forcing sync
```

## Key Design Decisions

1. **Coins NOT saved to inventory** - Coins are handled separately in the wallet, not as inventory items
2. **Multiple event dispatch** - Three different events ensure all listeners catch updates
3. **Forced refresh mechanism** - The `force-wallet-refresh` event provides a fallback synchronization
4. **Comprehensive logging** - Prefixed logs make debugging easier in production

## Related Systems

This fix complements:
- ✅ Subscription coin rewards (already using event dispatch system)
- ✅ Inventory coin claims (already using wallet-updated events)
- ✅ Ad reward coins (already dispatching wallet updates)
- ✅ Game win coins (already syncing to wallet)

## Backward Compatibility

- ✅ No breaking changes to data structures
- ✅ localStorage keys remain unchanged
- ✅ All existing event listeners still work
- ✅ TypeScript types unchanged

## Performance Impact

- Minimal: Only adds one additional event listener in WalletContext
- Slight delay in force-wallet-refresh (100ms) is acceptable for UX
- No additional database calls or API requests

---

**Status:** ✅ **COMPLETE**
**Build Status:** ✅ **SUCCESS**
**Testing Status:** Ready for QA
