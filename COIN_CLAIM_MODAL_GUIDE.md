# Claim Coin Modal - Visual Flow

## Overview
When a user claims rewards that include coins, they now see a dedicated **Coin Claim Modal** similar to the "Item Claimed!" modal shown in your screenshot.

---

## Visual Flow: Reward Claim → Coin Modal

### **User Claims Rewards**

```
RewardModal displayed with:
- Fire Phoenix skin
- 100 Flappy Coins
        ↓
User clicks "🎉 Claim All Rewards"
        ↓
RewardModal processes claim:
  1. Coins: Add 100 to wallet
  2. Fire Phoenix: Add to inventory
  3. Sync items to Supabase (not coins)
        ↓
Set state:
  - totalCoinsToShow = 100
  - claimedItemsToShow = [Fire Phoenix]
  - showCoinClaimModal = true
        ↓
RewardModal closes automatically
        ↓
🪙 COIN CLAIM MODAL OPENS
```

---

## Modal Layout

### **Structure:**
```
┌─────────────────────────────────────┐
│        ┌─────────────────┐           │
│        │ 🎉 Claim Your   │           │  Close (×)
│        │    Coins!       │           │
│        └─────────────────┘           │
│                                       │
│  "You have coins ready to claim!"    │
│                                       │
│  ╔═══════════════════════════════╗   │
│  ║      🪙 100 Coins             ║   │
│  ║    (highlighted box)          ║   │
│  ╚═══════════════════════════════╝   │
│                                       │
│  ╭───────────────────────────────╮   │
│  │ + 1 Item Claimed              │   │
│  │ ┌─────────────────────────────┤   │
│  │ │ 🔥 Fire Phoenix | Legendary │   │
│  │ └─────────────────────────────┤   │
│  ╰───────────────────────────────╯   │
│                                       │
│  ┌───────────────────────────────┐   │
│  │ Total Rewards:                │   │
│  │ 100 coins + 1 item            │   │
│  └───────────────────────────────┘   │
│                                       │
│  ┌───────────────────────────────┐   │
│  │ 💰 Claim 100 Coins            │   │
│  └───────────────────────────────┘   │
│  ┌───────────────────────────────┐   │
│  │ Cancel                         │   │
│  └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

### **After Confirmation:**
```
┌─────────────────────────────────────┐
│        ┌─────────────────┐           │
│        │ 🎉 Coins        │           │
│        │ Claimed!        │           │
│        └─────────────────┘           │
│                                       │
│  "Your coins have been added to      │
│   your wallet!"                       │
│                                       │
│  ╔═══════════════════════════════╗   │
│  ║      🪙 100 Coins             ║   │
│  ║    (confirmed state)          ║   │
│  ╚═══════════════════════════════╝   │
│                                       │
│  ┌───────────────────────────────┐   │
│  │ 👛 View Wallet                │   │
│  └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Component Details

### **File:** `src/components/CoinClaimModal.tsx`

```typescript
interface CoinClaimModalProps {
  isOpen: boolean;              // Modal visibility
  onClose: () => void;          // Close handler
  coins: number;                // Coins to claim (e.g., 100)
  itemsCount?: number;          // Number of items claimed (e.g., 1)
  claimedItems?: Array<{        // Details of claimed items
    id: string;
    name: string;
    quantity: number;
    image?: string;
    rarity?: string;
  }>;
}
```

### **Features:**

✅ **Confetti Animation** - 50 falling confetti pieces on open
✅ **Coin Highlight** - Large golden box with coin amount
✅ **Items Section** - Shows items claimed alongside coins
✅ **Summary** - Total rewards breakdown
✅ **Two States**:
  - **Pre-Claim**: "Claim X Coins" + "Cancel" buttons
  - **Post-Claim**: "View Wallet" button
✅ **Auto-Close** - Closes after 2 seconds following claim confirmation

---

## Integration with RewardModal

### **State Management:**
```typescript
// In RewardModal component:
const [showCoinClaimModal, setShowCoinClaimModal] = useState(false);
const [totalCoinsToShow, setTotalCoinsToShow] = useState(0);
const [claimedItemsToShow, setClaimedItemsToShow] = useState([]);
```

### **Flow Logic:**
```typescript
const handleClaim = async () => {
  // Process rewards
  rewards.forEach(reward => {
    if (reward.type === 'coins') {
      // Add to wallet
      saveWalletBalance(newBalance);
      totalCoinsAdded += coinsToAdd;
    } else {
      // Add to inventory
      claimedItems.push(reward);
    }
  });

  // If coins exist, show coin claim modal
  if (coinCount > 0) {
    setTotalCoinsToShow(coinCount);
    setClaimedItemsToShow(claimedItems);
    setShowCoinClaimModal(true);
  }

  // Auto-close RewardModal after 2 seconds if no coins
  if (coinCount === 0) {
    setTimeout(() => onClose(), 2000);
  }
};
```

### **Rendering:**
```tsx
<CoinClaimModal
  isOpen={showCoinClaimModal}
  onClose={() => {
    setShowCoinClaimModal(false);
    onClose();  // Close RewardModal
  }}
  coins={totalCoinsToShow}           // 100
  itemsCount={claimedItemsToShow.length}  // 1
  claimedItems={claimedItemsToShow}  // [Fire Phoenix, ...]
/>
```

---

## Scenario Examples

### **Scenario 1: Coins Only**
```
Reward: 500 coins (no items)
        ↓
Claim Modal shows:
- 500 coins highlighted
- No items section
- Button: "💰 Claim 500 Coins"
```

### **Scenario 2: Coins + 1 Item**
```
Reward: 100 coins + Fire Phoenix skin
        ↓
Claim Modal shows:
- 100 coins highlighted
- + 1 Item Claimed section
- Fire Phoenix details
- Button: "💰 Claim 100 Coins"
```

### **Scenario 3: Coins + Multiple Items**
```
Reward: 250 coins + Fire Phoenix + 3 powerups
        ↓
Claim Modal shows:
- 250 coins highlighted
- + 4 Items Claimed section
- Fire Phoenix + 3 powerups listed
- Button: "💰 Claim 250 Coins"
```

### **Scenario 4: Items Only (No Modal)**
```
Reward: Fire Phoenix skin only (no coins)
        ↓
RewardModal auto-closes after 2 seconds
CoinClaimModal does NOT appear
Toast shows: "Successfully claimed 1 item(s)!"
```

---

## User Experience Flow

### **Step 1: Reward Modal**
```
User sees RewardModal with all rewards
- Displays items and coin count
- Shows "🎉 Claim All Rewards" button
```

### **Step 2: Processing**
```
User clicks "🎉 Claim All Rewards"
- RewardModal processes both coins and items
- Coins added to wallet immediately
- Items added to inventory immediately
- Events dispatched for real-time updates
```

### **Step 3: Coin Claim Modal**
```
After processing (if coins exist):
- CoinClaimModal appears
- Shows coins + claimed items
- User sees confirmation
- User clicks "💰 Claim 100 Coins"
```

### **Step 4: Confirmation**
```
Modal shows success state
- Confetti animation
- "🎉 Coins Claimed!" heading
- "💰 Claim X Coins" button changes
- Auto-closes after 2 seconds
```

### **Step 5: Done**
```
Both modals close
User wallet updated
Items in inventory
Toast confirms all actions
Wallet display updated in real-time
```

---

## Technical Details

### **Coin Processing:**
1. **Load** current balance from localStorage
2. **Add** coins from reward to balance
3. **Save** new balance to localStorage
4. **Dispatch** wallet-balance-updated event
5. **Show** CoinClaimModal with totals

### **Item Processing:**
1. **Save** each item to inventory
2. **Track** in claimedItems array
3. **Sync** items to Supabase (if user_id exists)
4. **Display** items in CoinClaimModal

### **Event Flow:**
```
Claim Button Clicked
  ↓
handleClaim() executes
  ├─ Process coins → localStorage updated
  ├─ Dispatch wallet-balance-updated event
  ├─ WalletBalance component re-renders
  │
  ├─ Process items → inventoryService saves
  ├─ Track in claimedItems array
  │
  └─ If coins > 0 → Show CoinClaimModal
     ↓
     CoinClaimModal displays with coins + items
```

---

## Styling & Design

### **Colors:**
- Coins Box: Yellow/Amber gradient background with yellow border
- Items Box: Purple/Indigo background
- Buttons: Green (Claim), Blue (View Wallet)
- Confetti: Mix of 🎉 🎊 ✨ 💫 🌟

### **Animations:**
- Confetti falls for 3 seconds on open
- Modal slides in smoothly
- Buttons scale on hover
- Smooth color transitions

### **Responsive:**
- Mobile-friendly width (max-w-md)
- Scrollable if content overflows
- Touch-friendly button sizes (py-3 px-6)

---

## Summary

The **Coin Claim Modal** provides:

1. **Visual Confirmation** - User sees coins being claimed
2. **Mixed Rewards** - Shows both coins and items together
3. **Two-Stage Flow** - Claim button then confirmation
4. **Wallet Integration** - Shows coins that go to wallet
5. **Item Display** - Shows items that go to inventory
6. **Smooth UX** - Confetti animation and transitions
7. **Auto-Close** - Automatically closes after confirmation

This matches the visual style of the "Item Claimed!" modal from your screenshot while providing dedicated space for coin rewards.
