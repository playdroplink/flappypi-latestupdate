# Flappy Coins Wallet Display Flow

## Overview
When a user purchases Flappy Coins OR claims coin rewards, the balance is reflected **LIVE** in the Flappy Wallet display at the top of the screen.

---

## Visual Flow: Purchase to Wallet Display

### **SCENARIO 1: User Buys Coins with Pi Payment**

```
User purchases "Small Pouch (1.00 π)" from Shop
        ↓
Pi Payment Modal shows:
  - Price: 1.00 π
  - Item: Small Pouch
  - Expected reward: 500 coins
        ↓
User approves Pi Payment
        ↓
directPaymentService processes payment:
  - Adds 500 coins to wallet balance
  - Calls saveWalletBalance(newBalance)
  - localStorage('flappypi-coins') = 500
  - Dispatches wallet-balance-updated event
        ↓
WalletBalance component listens to event
  - Updates balance state: 500
  - Triggers re-render
        ↓
🪙 WALLET DISPLAY UPDATES IMMEDIATELY
Display shows: [🪙 500]
```

---

### **SCENARIO 2: User Buys Coins with Flappy Coins**

```
Current Wallet Balance: 1,000 coins (shows "🪙 1,000")
        ↓
User clicks "Buy with Coins" on Small Pouch
  - Purchase Cost: 500 coins
  - Receives: 100 coins
        ↓
ShopModal processes coin purchase:
  - DEDUCTS 500 coins (cost): 1,000 - 500 = 500
  - ADDS 100 coins (reward): 500 + 100 = 600
  - New total: 600 coins
  - Updates localStorage('flappypi-coins') = 600
  - Dispatches wallet-balance-updated event
  - Shows toast: "Successfully purchased Small Pouch!"
        ↓
🪙 WALLET DISPLAY UPDATES IMMEDIATELY
Display shows: [🪙 600]
```

---

### **SCENARIO 3: User Claims Coin Reward from Subscription**

```
User has 30 Pi Ultimate Pack subscription
Reward includes: Fire Phoenix skin + 100 coins
        ↓
RewardModal shows:
  - 🔥 Fire Phoenix (item)
  - 🪙 100 coins
        ↓
User clicks "CLAIM REWARDS"
        ↓
RewardModal processes claim:
  - For coins (type === 'coins'):
    - Loads current wallet balance: 600
    - Adds 100 coins: 600 + 100 = 700
    - Calls saveWalletBalance(700)
    - localStorage('flappypi-coins') = 700
    - Dispatches wallet-balance-updated event
    - console.log: "✅ Added 100 coins to wallet. New balance: 700"
    
  - For items (type !== 'coins'):
    - Saves Fire Phoenix to inventory
    - inventoryService.saveToInventory({...})
        ↓
Toast shows: "Successfully claimed 1 item(s) and 100 coins! 🎉"
        ↓
🪙 WALLET DISPLAY UPDATES IMMEDIATELY
Display shows: [🪙 700]
```

---

## Technical Architecture

### **Wallet Display Component**
📁 **File**: `src/components/WalletBalance.tsx`

```tsx
const WalletBalance = () => {
  const { balance } = useWallet();  // Gets from WalletContext
  const formattedBalance = balance.toLocaleString();
  
  return (
    <div className="wallet-balance-footer">
      <CoinIcon className="w-6 h-6" />
      {formattedBalance}  // Shows: 700
    </div>
  );
};
```

### **Where It's Displayed**
- ✅ Game header (top-left corner) - `paln4.tsx` line 1139
- ✅ Game header (top-left corner) - `palnuygo.tsx` line 1389
- ✅ Shop Modal (when buying items)
- ✅ Any component using `useWallet()` hook

---

## Real-time Update Flow

### **Step 1: Balance Change Event**
```typescript
// From any component (RewardModal, ShopModal, directPaymentService)
window.dispatchEvent(new CustomEvent('wallet-balance-updated', {
  detail: {
    balance: 700,      // New total
    added: 100         // Coins added
  }
}));
```

### **Step 2: WalletContext Listens**
```typescript
// WalletContext.tsx
useEffect(() => {
  window.addEventListener('wallet-balance-updated', (event) => {
    setBalance(event.detail.balance);  // Updates balance to 700
  });
}, []);
```

### **Step 3: Component Re-renders**
```tsx
// Any component using useWallet()
const { balance } = useWallet();  // Now 700
// Component re-renders with new balance
```

### **Step 4: Display Updates**
```
🪙 Old Display: [🪙 600]
↓ (milliseconds)
🪙 New Display: [🪙 700]
```

---

## Data Storage & Persistence

### **localStorage Keys** (User-specific)
| Operation | Key | Value | Example |
|-----------|-----|-------|---------|
| **After Purchase** | `flappypi-coins` | Total balance | `700` |
| **After Claim** | `flappypi-coins` | Total balance | `800` |
| **User profile** | `flappypi-username` | Username | `john_doe` |

### **WalletContext Storage**
```typescript
const [balance, setBalance] = useState(0);

// Persists to localStorage on every change
useEffect(() => {
  saveWalletBalance(balance, username);
}, [balance, username]);
```

---

## Coin Purchase Examples (From Screenshot)

### **Small Pouch**
- **Cost in Pi**: 1.00 π
- **Cost in Coins**: 500 coins  
- **Coins Received**: 100 coins
- **Net Effect**: -500 + 100 = -400 coins loss (if bought with coins)

### **Feather Bag**
- **Cost in Pi**: 2.00 π
- **Cost in Coins**: 1,200 coins
- **Coins Received**: 200 coins
- **Net Effect**: -1,200 + 200 = -1,000 coins loss (if bought with coins)

### **Bird Chest**
- **Cost in Pi**: 5.00 π
- **Cost in Coins**: 3,000 coins
- **Coins Received**: 500 coins
- **Net Effect**: -3,000 + 500 = -2,500 coins loss (if bought with coins)

### **Flap Vault**
- **Cost in Pi**: 10.00 π
- **Cost in Coins**: 7,500 coins
- **Coins Received**: 1,000 coins
- **Net Effect**: -7,500 + 1,000 = -6,500 coins loss (if bought with coins)

### **Gold Nest**
- **Cost in Pi**: 20.00 π
- **Cost in Coins**: 20,000 coins
- **Coins Received**: 2,500 coins
- **Net Effect**: -20,000 + 2,500 = -17,500 coins loss (if bought with coins)

---

## Coin Claim Examples (From Rewards)

### **Small Reward**
```
Current Balance: 1,000 coins
Reward: 50 coins
↓
After Claim: 1,050 coins
Display: 🪙 1,050
```

### **Medium Reward**
```
Current Balance: 1,000 coins
Reward: 100 coins + Fire Phoenix skin
↓
After Claim:
- Coins: 1,100 (wallet)
- Fire Phoenix: inventory
Display: 🪙 1,100
```

### **Large Reward**
```
Current Balance: 1,000 coins
Reward: 500 coins + 3 powerups
↓
After Claim:
- Coins: 1,500 (wallet)
- Powerups: inventory (3 items)
Display: 🪙 1,500
```

---

## Key Features

✅ **Real-time Updates** - Wallet updates instantly without page refresh
✅ **Multi-currency Support** - Handles both Pi payments and coin transactions
✅ **Dual-type Rewards** - Processes coins AND items from same reward
✅ **Persistent Storage** - Balance saved to localStorage
✅ **Event-driven** - Uses custom events for cross-component communication
✅ **User-specific** - Each user has separate wallet balance
✅ **Formatted Display** - Large numbers shown as "1,000" not "1000"

---

## Debugging Console Output

When purchasing or claiming coins, console shows:

```javascript
// Coin purchase via Pi
✅ Coins added to wallet: +500, new balance: 1000

// Coin reward claimed
✅ Added 100 coins to wallet. New balance: 1100
✅ Added Fire Phoenix to inventory

// Purchase with coins
Successfully purchased Small Pouch!
Updated coins: 1,200 → 700 (spent 500)
```

---

## Summary

The Flappy Wallet display:
1. **Shows real-time balance** via `WalletBalance` component
2. **Updates instantly** when coins are earned or spent
3. **Persists data** to localStorage for offline access
4. **Supports multiple sources**: Pi payments, coin purchases, reward claims
5. **Displays formatted numbers**: 700 coins shows as "🪙 700"
6. **Located at**: Top-left corner of game screen

All coin transactions (purchase, spend, earn) are reflected immediately in the display without requiring page refresh.
