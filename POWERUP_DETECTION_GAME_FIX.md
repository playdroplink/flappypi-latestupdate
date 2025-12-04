# Powerup Detection & Usage Fix - Game Mode Integration

## Problem Fixed

Users could buy or receive powerups but couldn't use them in game modes (Classic, Endless, Bundle) because:
1. `footerPowerUps` was hardcoded with `quantity: 0`
2. Powerups weren't being loaded from `useGameEquipment` hook
3. No connection between inventory and game mode powerup bar

## Solution Implemented

### 1. **Fixed paln4.tsx (Main Game Component)**

**Changed:**
```typescript
// BEFORE (Line 634-641)
const footerPowerUps = footerPowerUpItems
  .map(powerup => ({
    id: powerup.id,
    name: powerup.name,
    icon: powerup.icon,
    quantity: 0 // ❌ HARDCODED TO 0
  }))
  .filter(pu => pu.quantity > 0);
```

**To:**
```typescript
// AFTER (Fixed)
const footerPowerUps = footerPowerUpItems
  .map(powerup => {
    // Find the powerup in availablePowerUps from useGameEquipment hook
    const equippedPowerup = availablePowerUps?.find(p => p.id === powerup.id);
    return {
      id: powerup.id,
      name: powerup.name,
      icon: powerup.icon,
      quantity: equippedPowerup ? equippedPowerup.quantity : 0,
      description: equippedPowerup?.description
    };
  })
  .filter(pu => pu.quantity > 0); // Only show powerups with quantity > 0
```

### 2. **How It Now Works**

#### **Flow: Purchase Powerup → Game Usage**

```
User buys "Shield x5" from Shop
    ↓
Shop calls directPaymentService
    ↓
directPaymentService saves to inventory:
{
  id: 'shield',
  type: 'powerup',
  quantity: 5,
  ...
}
    ↓
Window dispatches 'inventory-updated' event
    ↓
useGameEquipment listens for event
    ↓
loadEquipment() called:
  - Gets inventory via inventoryService.getInventory()
  - Filters items where type === 'powerup'
  - Sets availablePowerUps = [{id: 'shield', quantity: 5, ...}]
    ↓
paln4.tsx component re-renders:
  - footerPowerUps now reads from availablePowerUps
  - Finds shield powerup with quantity: 5
  - Renders in FooterPowerupBar with badge showing "5"
    ↓
User sees Shield powerup in game footer bar
    ↓
User clicks Shield button
    ↓
handleActivatePowerup('shield') called
    ↓
useGameEquipment.activatePowerUp():
  1. Validates usage (anti-abuse checks)
  2. Calls inventoryService.useItem('shield', 'powerup', 1)
  3. Reduces inventory quantity from 5 → 4
  4. Activates shield effect (protection for 10s)
  5. Reloads equipment to update availablePowerUps
    ↓
Footer badge updates: "5" → "4"
    ↓
Shield is now active during gameplay
```

#### **Flow: Claim Powerup Reward → Game Usage**

```
User claims subscription reward:
  - Fire Phoenix skin + 100 coins + Shield x2
    ↓
RewardModal processes claim:
  - Coins → Add to wallet
  - Fire Phoenix → Add to inventory
  - Shield x2 → Add to inventory with handleClaim logic
    ↓
For powerup type:
  inventoryService.saveToInventory({
    id: 'shield',
    type: 'powerup',
    quantity: 2,
    name: 'Shield',
    icon: '/powerups/shield.png'
  })
    ↓
Window dispatches 'inventory-updated' event
    ↓
useGameEquipment listeners trigger:
  - loadEquipment() refreshes availablePowerUps
  - availablePowerUps updates with shield quantity: 2
    ↓
All connected game components re-render:
  - paln4.tsx footerPowerUps updates
  - FooterPowerupBar shows "2" shield powerups
    ↓
User can immediately use in next game
```

## Technical Details

### **useGameEquipment Hook - Powerup Loading**

```typescript
// From src/hooks/useGameEquipment.ts
const loadEquipment = useCallback(() => {
  const inventory = inventoryService.getInventory();
  
  // ✅ Get available powerups with quantity > 0
  const allPowerUps = inventory.filter(
    item => item.type === 'powerup' && item.quantity > 0
  );
  
  // ✅ Also check profile's owned_power_ups
  let profilePowerUps = [];
  if (profile && profile.owned_power_ups) {
    profilePowerUps = Object.entries(profile.owned_power_ups)
      .filter(([_, quantity]) => quantity > 0)
      .map(([powerUpId, quantity]) => ({
        id: powerUpId,
        quantity,
        ...
      }));
  }
  
  // ✅ Combine all sources with proper sync
  const combinedPowerUps = [...profilePowerUps, ...allPowerUps];
  const powerUpsMap = new Map();
  combinedPowerUps.forEach(powerUp => {
    const existing = powerUpsMap.get(powerUp.id);
    if (!existing || powerUp.quantity > existing.quantity) {
      powerUpsMap.set(powerUp.id, powerUp);
    }
  });
  
  // ✅ Set in state
  setEquipment(prev => ({
    ...prev,
    availablePowerUps: Array.from(powerUpsMap.values())
  }));
}, [profile]);
```

### **Game Component Integration**

```typescript
// From src/components/game/paln4.tsx
const { 
  activatePowerUp, 
  isPowerUpActive, 
  getActiveEffects,
  availablePowerUps  // ✅ Powerup quantities from inventory
} = useGameEquipment();

// Map footer items to actual quantities from inventory
const footerPowerUps = footerPowerUpItems
  .map(powerup => {
    const equippedPowerup = availablePowerUps?.find(p => p.id === powerup.id);
    return {
      ...powerup,
      quantity: equippedPowerup?.quantity || 0  // ✅ Real quantity
    };
  })
  .filter(pu => pu.quantity > 0);

// Render footer bar with real powerup quantities
<FooterPowerupBar 
  powerUps={footerPowerUps}  // [{id: 'shield', quantity: 5}, ...]
  onActivate={handleActivatePowerup}
/>
```

### **Powerup Usage in Game**

```typescript
// When user clicks powerup button in game
const handleActivatePowerup = async (powerUpId: string) => {
  // ✅ This calls useGameEquipment.activatePowerUp()
  const success = await activatePowerUp(powerUpId);
  
  if (success) {
    // Powerup is now active:
    // - Quantity reduced in inventory
    // - Effect applied in game
    // - Footer bar updated with new quantity
  }
};
```

## Powerup Types & Effects

### **Available Powerups**

| ID | Name | Effect | Duration | Image |
|---|---|---|---|---|
| `shield` | Shield | Protects from 1 collision | 10s | `/powerups/shield.png` |
| `magnet` | Coin Magnet | Attracts coins from distance | 15s | `/powerups/coin-magnet.png` |
| `extra_life` | Extra Life | Revives when you crash | Permanent | `/powerups/extra-life.png` |
| `coin_multiplier` | 2x Multiplier | Doubles coin earnings | 20s | `/powerups/2x-coin-multiplier.png` |
| `turbo_start` | Turbo Start | Increases game speed | 12s | `/powerups/turbo-start.png` |

### **Where Powerups Are Detected**

1. **Inventory Service** (`src/services/inventoryService.ts`)
   - Stores powerups as items with `type: 'powerup'`
   - `getInventory()` returns all items including powerups
   - `useItem()` reduces quantity when used

2. **useGameEquipment Hook** (`src/hooks/useGameEquipment.ts`)
   - Loads powerups from inventory via `inventoryService.getInventory()`
   - Also loads from profile's `owned_power_ups` field
   - Validates usage with anti-abuse rules
   - Manages active powerup effects

3. **Game Components** (`src/components/game/paln4.tsx`, etc.)
   - Reads `availablePowerUps` from `useGameEquipment`
   - Displays in `FooterPowerupBar` with quantities
   - Calls `activatePowerUp()` when clicked
   - Applies effects via `getActiveEffects()`

## Event Flow

### **Event 1: Inventory Updated**
```javascript
// Any component that adds items
window.dispatchEvent(new Event('inventory-updated'));

// useGameEquipment listens
window.addEventListener('inventory-updated', () => {
  loadEquipment(); // Reload all powerups
});
```

### **Event 2: Powerup Purchased**
```javascript
// Shop component after purchase
window.dispatchEvent(new CustomEvent('power-up-purchased', {
  detail: { powerUpId: 'shield', quantity: 5 }
}));

// useGameEquipment listens
window.addEventListener('power-up-purchased', (event) => {
  loadEquipment(); // Reload immediately
});
```

### **Event 3: Wallet Balance Updated**
```javascript
// All wallet changes trigger
window.dispatchEvent(new CustomEvent('wallet-balance-updated', {
  detail: { balance: 1000, added: 100 }
}));
```

## Anti-Abuse Rules

When user activates a powerup, `validatePowerUpUsage()` enforces:

1. **Max 2 Concurrent**: Only 2 powerups can be active at once
2. **Cooldown**: 30 second cooldown between same powerup usage
3. **Session Limit**: Max 10 powerups per 5-minute session
4. **Rate Limit**: Max 3 powerups per minute across all types

## Testing Powerups in Game

### **Test Case 1: Buy Powerup → Use in Game**
1. Open Shop
2. Buy "Shield x5" with coins
3. Go to Classic Game
4. See "Shield 5" in footer bar
5. Click shield button (should activate)
6. Get hit by pipe - shield should protect
7. Footer shows "Shield 4" (quantity reduced)

### **Test Case 2: Claim Powerup → Use in Game**
1. Have active subscription (gives powerups)
2. Claim subscription rewards
3. Should get powerups + coins
4. Go to game
5. Footer bar shows claimed powerups
6. Can use them during gameplay

### **Test Case 3: Bundle/Endless Mode Powerups**
1. Same flow as Classic mode
2. FooterPowerupBar should work identically
3. All powerup types should activate

## Files Modified

1. **src/components/game/paln4.tsx** (Main game component)
   - Fixed `footerPowerUps` to load from `availablePowerUps`
   - Now shows real powerup quantities

2. **src/hooks/useGameEquipment.ts** (Already correct)
   - Loads powerups from inventory ✅
   - Handles activation and quantity reduction ✅
   - Validates usage ✅

3. **src/services/inventoryService.ts** (Already correct)
   - Stores powerups as items ✅
   - `useItem()` reduces quantity ✅

## Summary

Users can now:
✅ Buy powerups from shop and use in game
✅ Claim powerups from subscriptions and use in game  
✅ See real quantities in footer powerup bar
✅ Activate powerups that reduce inventory quantity
✅ Use same powerups across all game modes (Classic, Endless, Bundle)
✅ Effects apply correctly during gameplay
✅ Quantities update in real-time as powerups are used

**Key Fix**: Powerup quantities are now dynamically loaded from inventory instead of being hardcoded to 0.
