# Mock Subscription Payment Testing Guide

## Overview
This document provides step-by-step instructions for testing the mock subscription payment system in Flappy Pi. The mock payment button allows developers and testers to simulate subscription purchases without making real Pi Network transactions.

## Architecture: Mock Payment Flow

```
Click "🧪 Mock Pi Payment" Button
    ↓
getPlanRewards(plan.id)
    ↓
setRewards(planRewards)
    ↓
setSuccess(true)
    ↓
setShowRewardModal(true)
    ↓
addCoins(plan.coinReward) [if coins in rewards]
    ↓
onPurchase(plan) callback
    ↓
Toast: "Mock Subscription Activated! 🎉"
    ↓
RewardModal displays all rewards:
  - Coins (with confetti)
  - Powerups
  - Skins
  - Mystery boxes
    ↓
User clicks "Claim Rewards"
    ↓
All rewards added to inventory/wallet
    ↓
Subscription stored in profile
    ↓
Powerups appear in game footer
```

## File Locations

### Core Files
- **SubscriptionPlansModal.tsx** - Mock payment button implementation (line 1075-1095)
- **EnhancedRewardModal.tsx** - Displays subscription rewards after purchase
- **subscriptionRewards.ts** - Defines what rewards each subscription plan includes
- **directPaymentService.ts** - Handles coin distribution from rewards

### Related Services
- **inventoryService.ts** - Stores powerups and items to profile
- **walletUtils.ts** - Manages coin wallet
- **WalletContext.tsx** - Provides wallet state to components

## Test Scenarios

### Test 1: Basic Mock Payment Button Click
**Objective:** Verify mock payment button triggers reward modal

**Steps:**
1. Start dev server: `npm run dev`
2. Navigate to Shop → Subscriptions tab
3. Select any subscription plan (e.g., "Starter" 30 Pi)
4. Look for **green button** labeled "🧪 Mock Pi Payment (Test)"
5. Click the mock payment button

**Expected Results:**
- ✅ Toast appears: "Mock Subscription Activated! 🎉"
- ✅ Subscription modal closes OR closes after confirmation
- ✅ RewardModal opens showing all rewards for that plan
- ✅ Success checkmark shown (green circle with check)
- ✅ Plan name displayed in reward modal title

**Error Handling:**
- If modal doesn't appear, check browser console for errors
- If toast doesn't appear, check `useToast` hook import
- If rewards don't load, verify `getPlanRewards()` returns data

---

### Test 2: Verify Reward Categories Display Correctly
**Objective:** Test that each reward type displays with correct image and metadata

**Steps:**
1. Complete Test 1 (open reward modal after mock payment)
2. Examine reward modal sections:
   - **Coins Section** - Shows total coins with golden background
   - **Items Section** - Shows powerups, skins, mystery boxes
   - **Claimed Items** - Lists each item with image and quantity

**Expected Results for Each Plan:**

**Starter (30 Pi) Plan:**
- ✅ 500 coins (golden highlighted box)
- ✅ 3 Powerup Bundle items with images
- ✅ Mystery box with image

**Pro (50 Pi) Plan:**
- ✅ 1000 coins
- ✅ 5 powerup items
- ✅ 2 mystery boxes
- ✅ Exclusive skin

**Ultimate (100 Pi) Plan:**
- ✅ 2000 coins
- ✅ All powerups (10+ items)
- ✅ Fire Phoenix skin (exclusive)
- ✅ 3 mystery boxes
- ✅ Subscription status "ACTIVE"

**Verification Checklist:**
- [ ] All reward images load (no placeholder fallbacks)
- [ ] Item quantities display correctly
- [ ] Coins show in golden box
- [ ] Item names visible on hover
- [ ] No duplicate items in reward list
- [ ] Confetti animation plays when modal opens

---

### Test 3: Coin Rewards Add to Wallet
**Objective:** Verify coins from subscription are added to wallet balance

**Steps:**
1. Open ProfilePage or WalletBalance component to see current coin balance
   - Location: Top-left of game screens shows "💰 XX Coins"
   - Or check ProfilePage wallet display
2. Note the **current coin balance** (e.g., 500 coins)
3. Complete mock payment for a plan with coin reward (e.g., Starter = 500 coins)
4. Check coin balance **immediately after**

**Expected Results:**
- ✅ Coin balance increases by exactly the plan's coin reward
  - Before: 500 coins → After: 1000 coins (if Starter plan)
  - Before: 1500 coins → After: 2500 coins (if Starter plan)
- ✅ Balance updates without page refresh
- ✅ Balance persists after page reload (stored in `flappypi-coins` in localStorage)
- ✅ Toast shows "Coins added to wallet" in browser console

**Debug Tips:**
- Open DevTools → Application → localStorage
- Look for key: `flappypi-coins`
- Check value increases after mock payment
- Verify RewardModal displays coin amount correctly

---

### Test 4: Powerups Appear in Game Footer
**Objective:** Test that powerups from subscription are usable in game

**Steps:**
1. Complete mock payment for subscription with powerups
2. Go to game selection screen
3. Select a game mode (Classic, Endless, Bundle, or Challenge)
4. **Wait for game to load** completely
5. Look at **bottom footer** of game screen

**Expected Results:**
- ✅ Footer shows available powerups with images
- ✅ Each powerup shows **correct quantity** (not hardcoded 0 or 1)
  - Example: "Shield x3" if claimed 3 shields
- ✅ Powerup icons display correctly (no placeholder/broken images)
- ✅ Can click powerup to equip before game starts
- ✅ During gameplay, equipped powerup appears as active

**Verification by Game Mode:**
- **paln4.tsx** (Classic & Endless): Lines 623-644 read from `availablePowerUps` hook
- **palnuygo.tsx** (Bundle & Endless): Lines 964-984 read from `availablePowerUps` hook
- Both use: `quantity: equippedPowerup ? equippedPowerup.quantity : 0`

**Debug:**
- Open DevTools → Console
- Type: `localStorage.getItem('flappypi-inventory')` 
- Verify powerup items have `quantity` > 0
- Check game's `useGameEquipment` hook loads data

---

### Test 5: Subscription Status in Profile
**Objective:** Verify subscription appears as active in user profile

**Steps:**
1. Go to ProfilePage
2. Look for "Active Subscriptions" or subscription status section
3. After mock payment, subscription should appear
4. Check expiration date and remaining days

**Expected Results:**
- ✅ Subscription name displayed (e.g., "Starter Plan")
- ✅ Status shows "ACTIVE"
- ✅ Expiration date shown (30/60/90 days from now)
- ✅ Days remaining calculated correctly
- ✅ Subscription persists after page reload
- ✅ Can click "Cancel Subscription" to remove it

**Locations to Check:**
1. SubscriptionPlansModal.tsx (lines 918-932) - shows active subscriptions
2. ProfilePage - subscription status display
3. localStorage key: Check profile.owned_subscriptions

---

### Test 6: Multiple Subscription Purchases
**Objective:** Test that user can have multiple active subscriptions

**Steps:**
1. Mock purchase "Starter" plan
2. Claim rewards from RewardModal
3. Go back to subscriptions
4. Mock purchase "Pro" plan
5. Claim rewards from second RewardModal

**Expected Results:**
- ✅ Both subscriptions appear in "Active Plans" section
- ✅ Both show separate expiration dates
- ✅ Each shows correct rewards in preview
- ✅ Coins from BOTH rewards added to wallet total
- ✅ Powerups from both appear in game footer
- ✅ No reward duplication in wallet

**Edge Cases:**
- [ ] Can you purchase same plan twice? (Should allow)
- [ ] Do rewards stack or replace? (Should stack)
- [ ] Does UI show total savings from all plans?

---

### Test 7: Reward Claiming Process
**Objective:** Test the complete reward claiming workflow

**Steps:**
1. Complete mock payment (opens RewardModal)
2. Modal shows "Items Claimed!" with details
3. Click "Confirm" or "Close" button
4. Check inventory after modal closes

**Modal States:**
- **Pre-Claim:** Shows rewards preview, "Claim Rewards" button
- **Post-Claim:** Shows "Items Claimed!" message, "Close" button
- **Auto-Close:** Modal should close after brief delay

**Expected Results:**
- ✅ Coins immediately appear in wallet
- ✅ Powerups appear in inventory
- ✅ Skins appear in owned skins list
- ✅ Mystery boxes add to inventory
- ✅ All items can be equipped after claim
- ✅ Quantities correct in inventory service

**Verification:**
```javascript
// In DevTools console:
const inventory = JSON.parse(localStorage.getItem('flappypi-inventory') || '[]');
const powerups = inventory.filter(i => i.type === 'powerup');
console.log('Claimed powerups:', powerups);
```

---

### Test 8: Image Rendering in Reward Modal
**Objective:** Verify all reward item images load correctly

**Steps:**
1. Complete mock payment
2. Examine RewardModal for any broken image icons
3. Hover over items to see tooltips with names
4. Check that item icons match the actual items

**Expected Results for Image Sources:**
- ✅ Coins: No image (text-only golden box)
- ✅ Powerups: `/powerups/icon-*.png` loading
- ✅ Skins: `/birds*/bird_*.gif` loading
- ✅ Mystery Boxes: `/mystery/mystery-*.png` loading
- ✅ No 404 errors in console for images
- ✅ No placeholder/fallback images used
- ✅ Images scale properly in modal grid

**Image Mapping Locations:**
- `src/utils/getItemImage.ts` - Maps item IDs to image paths
- `src/components/EnhancedRewardModal.tsx` - Uses images for display
- `subscriptionRewards.ts` - Defines reward images

---

## Complete Test Checklist

### Pre-Test Setup
- [ ] Dev server running (`npm run dev`)
- [ ] No TypeScript errors in console
- [ ] Browser localStorage cleared (or backup preserved)
- [ ] On Shop page with Subscriptions tab visible

### Mock Payment Button Tests
- [ ] Button visible with green color and "🧪" emoji
- [ ] Button clickable (no disabled state)
- [ ] Click triggers RewardModal
- [ ] Toast message appears with plan name
- [ ] Modal shows all rewards for selected plan

### Coin Tests
- [ ] Starting coin balance recorded
- [ ] After payment, balance increases by plan.coinReward
- [ ] Coins persist on page reload
- [ ] Wallet context updates in real-time
- [ ] Coin display in top-left game screen accurate

### Powerup Tests
- [ ] Powerups from subscription in inventory
- [ ] Powerups appear in game footer
- [ ] Quantities match inventory (not hardcoded)
- [ ] Can equip powerup before game
- [ ] Powerup active during gameplay

### Subscription Tests
- [ ] Subscription appears in active subscriptions list
- [ ] Expiration date calculated (30/60/90 days)
- [ ] Can cancel subscription (shows confirmation)
- [ ] Multiple subscriptions allowed
- [ ] Profile updates show all active subscriptions

### Edge Cases
- [ ] Mock payment on different plans (Starter, Pro, Ultimate)
- [ ] Mock payment with zero balance (should work)
- [ ] Rapid clicks on mock button (should not double-purchase)
- [ ] Payment when subscription already active (should stack)
- [ ] Browser tab refresh during reward modal (rewards save)

---

## Debugging Steps

### If Mock Payment Button Not Working
```javascript
// Check in console:
1. window.Pi - Should be defined
2. localStorage.getItem('flappypi-pi-auth') - Check if logged in
3. Check for JavaScript errors in console
4. Verify SubscriptionPlansModal.tsx line 1075-1095 intact
```

### If RewardModal Not Appearing
```javascript
// Check mock payment handler (SubscriptionPlansModal.tsx):
1. getPlanRewards(plan.id) returns array
2. setRewards(planRewards) called
3. setShowRewardModal(true) called
4. EnhancedRewardModal imported correctly
5. showRewardModal state exists in component
```

### If Coins Not Added to Wallet
```javascript
// Verify addCoins function:
1. useWallet() hook imported
2. addCoins function exported from WalletContext
3. plan.coinReward property exists in subscription plans
4. localStorage 'flappypi-coins' key updates
5. WalletContext dispatch event fired
```

### If Powerups Not in Game
```javascript
// Check game component:
1. useGameEquipment hook returns availablePowerUps
2. footerPowerUps reads from availablePowerUps hook
3. Quantity not hardcoded to 0 or 1
4. Game footer rendered with powerup list
5. paln4.tsx and palnuygo.tsx both updated
```

---

## Test Reports Template

### Test Run: [Date/Time]
**Tester:** [Name]  
**Environment:** Dev/Prod, Browser, OS

**Tests Passed:** [#/8]

#### Test 1: Basic Mock Payment ✅/❌
- Button visible: [ ]
- RewardModal opened: [ ]
- Toast appeared: [ ]
- Notes: _____________

#### Test 2: Reward Display ✅/❌
- All images loaded: [ ]
- Quantities correct: [ ]
- Coins showed in golden box: [ ]
- Notes: _____________

#### Test 3: Coins to Wallet ✅/❌
- Balance increased: [ ]
- Correct amount: [ ]
- Persisted on reload: [ ]
- Notes: _____________

#### Test 4: Powerups in Game ✅/❌
- Powerups appear in footer: [ ]
- Correct quantities: [ ]
- Can equip and use: [ ]
- Notes: _____________

#### Test 5: Subscription Status ✅/❌
- Shows in profile: [ ]
- Expiration date correct: [ ]
- Can cancel: [ ]
- Notes: _____________

#### Overall Status: ✅ ALL TESTS PASSED / ⚠️ SOME ISSUES / ❌ CRITICAL ISSUES

---

## Next Steps After Testing

1. **If All Tests Pass:**
   - Mock payment system is fully functional
   - Ready for user testing
   - Safe to deploy with payment system enabled

2. **If Issues Found:**
   - Document issue in GitHub
   - Check logs in browser console
   - Review specific test section for debugging
   - Run `npm run build` to check for TypeScript errors

3. **Production Deployment:**
   - Disable/remove mock payment button in production
   - Comment out lines 1075-1095 in SubscriptionPlansModal.tsx
   - Or wrap in environment variable check: `if (process.env.NODE_ENV === 'development')`

---

## File Dependencies for Mock Payment

```
SubscriptionPlansModal.tsx (1075-1095)
    ↓
    ├── getPlanRewards() from subscriptionRewards.ts
    ├── addCoins() from WalletContext.tsx
    ├── onPurchase callback
    └── EnhancedRewardModal component
        ↓
        ├── inventoryService.saveToInventory()
        ├── walletUtils.saveWalletBalance()
        └── Image rendering from getItemImage()
            ↓
            Game components (paln4.tsx, palnuygo.tsx)
                ↓
                useGameEquipment hook
                    ↓
                    footerPowerUps display
```

## Notes
- Mock payment is **for testing only**
- Does NOT verify real Pi Network payments
- For real Pi payments, use "Pay with Pi" button instead
- Mock payment simulates successful transaction instantly
- All state changes are ephemeral (cleared on logout/app reset)
