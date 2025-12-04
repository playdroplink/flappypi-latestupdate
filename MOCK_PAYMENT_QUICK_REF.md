# Mock Subscription Payment - Quick Reference Card

## 🚀 Quick Start (30 seconds)

```bash
# 1. Start dev server
npm run dev

# 2. Navigate to Shop → Subscriptions tab
# 3. Click any subscription plan
# 4. Click green "🧪 Mock Pi Payment" button
# 5. See reward modal open with all rewards
# 6. Click "Claim Rewards"
# 7. Check wallet & game footer for updates
```

---

## 📱 What to Test

### Test 1: Basic Flow
1. Click "🧪 Mock Pi Payment" button
2. ✅ Toast: "Mock Subscription Activated! 🎉"
3. ✅ RewardModal opens
4. ✅ Shows coins + items + powerups

### Test 2: Claim Rewards
1. In RewardModal, click "Claim Rewards"
2. ✅ Toast: "Rewards Claimed! 🎉"
3. ✅ Modal closes after 2 seconds
4. ✅ All items added to inventory

### Test 3: Coins to Wallet
1. Note current coins (top-left of game)
2. Mock purchase subscription with 500 coins
3. ✅ Coins increase by 500 immediately
4. ✅ Balance persists after page reload

### Test 4: Powerups in Game
1. After claiming subscription powerups
2. Go to game (Classic, Endless, Bundle)
3. Look at footer powerups list
4. ✅ Powerups show correct quantities (not hardcoded 0/1)
5. ✅ Can click to equip

### Test 5: Subscription Status
1. Go to ProfilePage
2. Look for "Active Subscriptions" section
3. ✅ Subscription appears with name
4. ✅ Shows expiration date (30/60/90 days)
5. ✅ Shows "days remaining"

### Test 6: All Plans Work
Test each subscription tier:
- [ ] Starter (30 Pi) - 500 coins + 3 powerups
- [ ] Pro (50 Pi) - 1000 coins + 5 powerups + 2 boxes
- [ ] Ultimate (100 Pi) - 2000 coins + ALL powerups + Fire Phoenix skin

---

## 🔍 Browser Console Checks

```javascript
// Check coins added
localStorage.getItem('flappypi-coins')

// Check inventory items
JSON.parse(localStorage.getItem('flappypi-inventory'))
  .filter(i => i.type === 'powerup')

// Check active subscriptions
JSON.parse(localStorage.getItem('flappypi-profile'))?.owned_subscriptions

// Clear data (for fresh testing)
localStorage.removeItem('flappypi-coins')
localStorage.removeItem('flappypi-inventory')
localStorage.removeItem('flappypi-profile')
```

---

## 🎯 Expected Results Summary

| Action | Expected Result | Status |
|--------|-----------------|--------|
| Click mock button | Toast appears, modal opens | ✅ Ready |
| View rewards | All items show with images | ✅ Ready |
| Claim rewards | Toast, modal closes, items save | ✅ Ready |
| Check coins | Wallet increases by plan amount | ✅ Ready |
| Check game | Powerups appear with real qty | ✅ Ready |
| Check profile | Subscription shows as active | ✅ Ready |

---

## 🆘 If Something Goes Wrong

| Problem | Solution |
|---------|----------|
| Button not visible | Scroll down in plan card, look for green button |
| Modal won't open | Check browser console for errors, refresh page |
| No coins added | Check WalletContext, verify `addCoins()` called |
| Powerups show 0/1 | Check paln4.tsx & palnuygo.tsx lines 623-644, 964-984 |
| Items not in inventory | Verify EnhancedRewardModal calls claim function |
| Images missing | Check getItemImage() function and image paths |

---

## 📂 Files to Check if Debugging

```
src/components/
├── SubscriptionPlansModal.tsx (lines 1075-1095) - Mock button
├── EnhancedRewardModal.tsx - Reward claiming
├── WalletBalance.tsx - Coin display

src/context/
└── WalletContext.tsx - addCoins() function

src/components/game/
├── paln4.tsx (lines 623-644) - Classic/Endless footer
└── palnuygo.tsx (lines 964-984) - Bundle/Endless footer

src/services/
├── inventoryService.ts - Stores items
└── walletUtils.ts - Manages coins

src/constants/
└── subscriptionRewards.ts - Plan rewards data
```

---

## 📊 Coin Test Checklist

Plan | Coins | Powerups | Items | Skin
-----|-------|----------|-------|------
Starter (30 Pi) | 500 | 3 | ✓ | - 
Pro (50 Pi) | 1000 | 5 | 2 boxes | - 
Ultimate (100 Pi) | 2000 | 10+ | 3 boxes | Phoenix

---

## 🎮 Game Footer Powerup Verification

After claiming subscription powerups, check game footer:

```
Expected Format:
┌─────────────────────────────────┐
│  Shield x3  |  Heart x5  | ...  │
│  (image)    | (image)    |      │
└─────────────────────────────────┘

NOT Hardcoded To:
┌─────────────────────────────────┐
│  Shield x1  |  Heart x1  | ...  │  ❌ WRONG
│  (image)    | (image)    |      │
└─────────────────────────────────┘
```

---

## ✅ Test Success Criteria

- [ ] Mock button is visible (green, "🧪 emoji)
- [ ] Button click shows toast notification
- [ ] RewardModal opens automatically
- [ ] Reward modal displays all items with images
- [ ] Coin amount shown in golden box matches plan
- [ ] "Claim Rewards" button works
- [ ] After claim: toast "Rewards Claimed! 🎉"
- [ ] Coins added to wallet immediately
- [ ] Powerups appear in game footer with real quantities
- [ ] Can equip powerup in game
- [ ] Subscription shows in profile as "ACTIVE"
- [ ] Multiple subscriptions can be purchased
- [ ] Each purchase has separate rewards

---

## 💡 Pro Tips

1. **Test multiple plans** - They have different rewards
2. **Reload page** - Verify coins persist in localStorage
3. **Try game** - Verify powerups actually work in gameplay
4. **Check console** - Look for error messages
5. **Use DevTools** - Monitor localStorage changes in real-time

---

## 📚 Full Documentation

For detailed test procedures, see:
- **MOCK_SUBSCRIPTION_PAYMENT_TEST.md** - 8 complete test scenarios
- **MOCK_PAYMENT_VERIFICATION.md** - Implementation verification
- **subscriptionRewards.ts** - Reward definitions

---

## 🎯 Key Goals

✅ **Goal 1:** Verify mock payment button works
✅ **Goal 2:** Verify coins added to wallet
✅ **Goal 3:** Verify powerups usable in game with real quantities
✅ **Goal 4:** Verify subscription status tracked in profile
✅ **Goal 5:** Verify all reward types (coins, items, skins) delivered correctly

**Status: ALL SYSTEMS READY FOR TESTING**
