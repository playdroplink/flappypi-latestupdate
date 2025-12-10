# Subscription Reward Claiming - User & Developer Guide

## 🎯 For Users: How to Claim Your Subscription Rewards

### Step 1: Purchase a Subscription Plan
1. Go to **Inventory** → **Subscribe** button
2. Choose a plan (Starter Pack, Premium Pack, or Ultimate Pack)
3. Complete the Pi payment
4. Payment should succeed and show confirmation

### Step 2: Claim Your Rewards
1. Your rewards are automatically saved as **"Unclaimed"**
2. You'll see a notification or popup about unclaimed rewards
3. Click **"Claim Rewards"** button
4. A modal will show all the rewards from your plan:
   - 💰 Coins (e.g., 3,000 Flappy Coins)
   - ⚡ Powerups (Shield, Magnet, Extra Life, Turbo, Coin Multiplier)
   - 🎁 Mystery Boxes
   - 🎨 Skins (Fire Phoenix, Golden Phoenix, etc.)

### Step 3: See Your Rewards
After claiming:
- **Coins** appear in your wallet balance (top-right corner)
- **Powerups** appear in Inventory under "Power-ups" section
- **Skins** appear in Inventory under "Skins" section
- You can **equip** skins to use them in the game
- You can **use** powerups during gameplay

### ✅ What You Should See
```
Purchase Subscription
    ↓
See "Unclaimed Rewards" notification
    ↓
Click "Claim Rewards"
    ↓
Modal shows items from plan
    ↓
Click "Claim" button
    ↓
✅ Success message: "Rewards Claimed! 🎉"
    ↓
Wallet + Inventory updated with all items
```

---

## 👨‍💻 For Developers: Testing & Debugging

### Debug the Reward System

Open browser console and run:

```javascript
// Import the service
const { inventoryService } = await import('@/services/inventoryService');

// 1. Check what rewards are unclaimed
const unclaimed = inventoryService.getUnclaimedSubscriptionRewards();
console.log('Unclaimed rewards:', unclaimed);

// 2. Check if a specific plan can be claimed
const canClaim = !inventoryService.hasClaimedPlanRewards('starter');
console.log('Can claim starter plan?', canClaim); // true = can claim, false = already claimed

// 3. Get full system debug info
const debug = inventoryService.debugRewardClaimingSystem();
console.log('Full system status:', debug);

// 4. Check inventory for claimed items
const inventory = inventoryService.getInventory();
const skins = inventory.filter(i => i.type === 'skin');
const powerups = inventory.filter(i => i.type === 'powerup');
console.log('Skins in inventory:', skins);
console.log('Powerups in inventory:', powerups);

// 5. Check coin balance
const coins = parseInt(localStorage.getItem('flappypi-coins') || '0');
console.log('Current coins:', coins);
```

### Simulate a Purchase & Claim (Testing Only)

```javascript
const { inventoryService } = await import('@/services/inventoryService');
const { subscriptionPlanRewards } = await import('@/constants/subscriptionRewards');

// Get Starter Pack rewards
const starterPlan = subscriptionPlanRewards[0]; // 'starter' plan
console.log('Plan:', starterPlan);

// Simulate purchase: save as unclaimed
inventoryService.saveUnclaimedSubscriptionRewards(
  'starter',
  'Starter Pack',
  starterPlan.rewards
);
console.log('✅ Simulated purchase - rewards saved as unclaimed');

// Check they were saved
const unclaimed = inventoryService.getUnclaimedSubscriptionRewards();
console.log('Unclaimed after save:', unclaimed);

// Now claim the rewards
const claimed = inventoryService.claimSubscriptionRewards('starter');
if (claimed) {
  console.log('✅ CLAIM SUCCESS! Items claimed:', claimed.length);
  console.log('Claimed items:', claimed.map(r => r.name).join(', '));
} else {
  console.log('❌ CLAIM FAILED! No rewards to claim or already claimed');
}

// Verify in inventory
const inventory = inventoryService.getInventory();
console.log('Full inventory after claim:', inventory);
```

### Expected Results After Claim

```javascript
// After claiming 'starter' plan, inventory should have:
const inventory = inventoryService.getInventory();

// Should include these types:
inventory.filter(i => i.type === 'powerup').map(p => ({id: p.id, qty: p.quantity}))
// Output: [
//   { id: 'shield', qty: 1 },
//   { id: 'magnet', qty: 1 },
//   { id: 'extra_life', qty: 1 },
//   { id: 'turbo_start', qty: 1 },
//   { id: 'coin_multiplier', qty: 1 }
// ]

inventory.filter(i => i.type === 'mystery-box').map(m => ({id: m.id, qty: m.quantity}))
// Output: [{ id: 'basic', qty: 1 }]

// Coins should be in wallet:
localStorage.getItem('flappypi-coins')
// Output: "3000" (or higher if they had coins before)
```

---

## 🔍 Troubleshooting

### Issue: "No Unclaimed Rewards Found"
**Cause**: Rewards haven't been saved yet or were already claimed

**Solution**:
```javascript
// Check if any unclaimed rewards exist
const unclaimed = inventoryService.getUnclaimedSubscriptionRewards();
console.log('Unclaimed:', unclaimed);

// If empty, you need to:
// 1. Purchase a subscription plan, OR
// 2. Manually save test rewards:
const { subscriptionPlanRewards } = await import('@/constants/subscriptionRewards');
const plan = subscriptionPlanRewards[0];
inventoryService.saveUnclaimedSubscriptionRewards(plan.planId, plan.planName, plan.rewards);
```

### Issue: "Claim Failed" or "Already Claimed"
**Cause**: Plan was already claimed OR rewards weren't found in unclaimed list

**Solution**:
```javascript
// Check what's in the unclaimed list
const unclaimed = inventoryService.getUnclaimedSubscriptionRewards();
console.log('Unclaimed plans:', unclaimed.map(u => u.planId));

// Check purchase history
const history = inventoryService.getPurchaseHistory();
const rewardTransactions = history.filter(h => h.metadata?.rewardType === 'subscription_reward');
console.log('Claimed before:', rewardTransactions.map(t => t.itemName));

// If already claimed but want to re-test:
// Clear the claimed plan from history and unclaimed list
const remaining = unclaimed.filter(u => u.planId !== 'starter');
localStorage.setItem('flappypi-unclaimed-subscription-rewards', JSON.stringify(remaining));
console.log('Cleared starter plan, can now claim again');
```

### Issue: Coins Not Added to Wallet
**Cause**: Wallet balance not updating or coins not being recognized

**Solution**:
```javascript
// Check current coins
const coins = parseInt(localStorage.getItem('flappypi-coins') || '0');
console.log('Current coins:', coins);

// Check wallet utils exist
const { loadWalletBalance, saveWalletBalance } = await import('@/utils/walletUtils');
const balance = loadWalletBalance('default-user');
console.log('Wallet balance:', balance);

// Manually add coins for testing
saveWalletBalance(5000, 'default-user');
localStorage.setItem('flappypi-coins', '5000');
window.dispatchEvent(new CustomEvent('wallet-updated', { detail: { coinsAdded: 5000 } }));
console.log('✅ Manually added 5000 coins');
```

### Issue: Modal Auto-Closes Before Claiming
**Cause**: (FIXED) - This was the original bug

**Verification**: 
- Should NOT see auto-close anymore
- Modal should stay open when you click "Claim Rewards"
- If it's still closing, check that EnhancedRewardModal doesn't have the auto-close effect on lines 106-109

---

## 📋 Reward Plan Details

### Starter Pack (2.99 PI or equivalent)
- Basic Mystery Box (1x)
- Shield Power-up (1x)
- Coin Magnet Power-up (1x)
- Extra Life Power-up (1x)
- Turbo Start Power-up (1x)
- 2x Coin Multiplier Power-up (1x)
- **3,000 Flappy Coins** 💰

### Premium Pack (5.99 PI or equivalent)
- Rare Mystery Box (1x)
- Coin Magnet Power-up (3x)
- Extra Life Power-up (2x)
- Rare Skin (Random from Blue, Yellow, Purple, Golden birds)
- **10,000 Flappy Coins** 💰

### Ultimate Pack (29.99 PI or equivalent)
- Legendary Mystery Box (3x)
- Epic Skin (Random from Epic collection)
- **Fire Phoenix Skin** (SPECIAL - Auto-equipped!)
- Bundle Pack (15x of each powerup)
- **25,000 Flappy Coins** 💰

---

## 🔧 Code References

### Key Files Modified
- `src/components/EnhancedRewardModal.tsx` - Removed auto-close effect
- `src/services/inventoryService.ts` - Fixed claim logic, added debug method
- `src/constants/subscriptionRewards.ts` - Added helper functions

### Key Methods
- `inventoryService.claimSubscriptionRewards(planId)` - Claim a plan's rewards
- `inventoryService.getUnclaimedSubscriptionRewards()` - Get all unclaimed rewards
- `inventoryService.hasClaimedPlanRewards(planId)` - Check if plan was claimed
- `inventoryService.debugRewardClaimingSystem()` - Debug the entire system

### Events Dispatched (Listen for Updates)
```javascript
// Listen for wallet updates
window.addEventListener('wallet-updated', (e) => {
  console.log('Wallet updated:', e.detail);
  // { coinsAdded: 3000, newBalance: 5000, source: 'subscription' }
});

// Listen for inventory updates
window.addEventListener('inventory-updated', (e) => {
  console.log('Inventory changed:', e.detail);
  // { itemId: 'shield', type: 'powerup', action: 'added' }
});

// Listen for unclaimed rewards updates
window.addEventListener('unclaimed-rewards-updated', (e) => {
  console.log('Unclaimed status changed:', e.detail);
  // { planId: 'starter', planName: 'Starter Pack', action: 'claimed', ... }
});
```

---

## ✅ Testing Checklist

After any subscription system changes, verify:

- [ ] Can purchase subscription (no payment errors)
- [ ] Rewards saved as "unclaimed" in localStorage
- [ ] Unclaimed rewards modal shows rewards
- [ ] Modal doesn't auto-close when opened
- [ ] "Claim Rewards" button works (doesn't close immediately)
- [ ] Coins added to wallet balance
- [ ] Powerups added to inventory
- [ ] Skins added to inventory  
- [ ] Fire Phoenix auto-equipped
- [ ] Can't claim same plan twice
- [ ] Purchase history logged with 'subscription_reward' type
- [ ] All events dispatched correctly
- [ ] No console errors during claim flow

---

**Last Updated**: December 2024  
**Status**: ✅ All Issues Fixed
