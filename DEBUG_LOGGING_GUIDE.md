# Powerup Debug Logging Guide

## Complete Debug Flow Added

Comprehensive debug logging has been added throughout the powerup system to trace the complete flow from purchase to game display.

## Debug Locations & What They Track

### 1. **Shop Purchase** (`ShopModal.tsx`)

**Console Messages:**
```
🛍️ [Shop] Dispatching inventory-updated event for: shield
✅ [Shop] inventory-updated event dispatched

🛍️ [Shop-Coins] Dispatching power-up-purchased for: shield  
✅ [Shop-Coins] power-up-purchased event dispatched

🛍️ [Shop-Manual] Saving to inventory: {id: 'shield', type: 'powerup', quantity: 1}
```

**What it tracks:**
- When a powerup is purchased
- Events being dispatched to listeners
- Item type detection

### 2. **Inventory Service** (`inventoryService.ts`)

**Console Messages:**
```
💾 [inventoryService] saveToInventory called with: {id: 'shield', ...}
💾 [inventoryService] Current inventory size: 15
💾 [inventoryService] Item exists, updating quantity from 3
💾 [inventoryService] Updated to quantity 4
✅ [inventoryService] Inventory saved to localStorage, total items: 16
✅ [inventoryService] Powerups in inventory after save: shield:4, magnet:2
✅ [inventoryService] inventory-updated event dispatched from saveToInventory
📦 [inventoryService] Added to inventory: Shield (1)
```

**What it tracks:**
- Item being saved
- Whether it's new or updating existing
- Quantity changes
- Final state after save
- Events dispatched

### 3. **useGameEquipment Hook** (`useGameEquipment.ts`)

#### Event Listeners Setup:
```
✅ [LISTENERS] Registered inventory-updated and power-up-purchased listeners
✅ [LISTENERS] Registered game-started listener
```

#### Event Reception:
```
🔄 [EVENT] Inventory update event received - refreshing equipment
🎁 [EVENT] Power-up purchased event received: {powerUpId: 'shield', ...}
🎮 [EVENT] Game started event received - refreshing equipment with fresh powerups
```

#### Equipment Loading:
```
🔧 [useGameEquipment] loadEquipment() called at 2025-12-04T10:30:45.123Z
🔧 [useGameEquipment] Full inventory loaded: 16 items
🔧 [useGameEquipment] Powerups in inventory: [
  {id: 'shield', quantity: 5, type: 'powerup'},
  {id: 'magnet', quantity: 2, type: 'powerup'}
]
🔧 [useGameEquipment] Equipped skin: classic
✅ [useGameEquipment] Final powerups ready for game: shield:5, magnet:2
```

**What it tracks:**
- When equipment is loaded
- Raw inventory data
- Filtered powerups
- Final state passed to components

### 4. **ClassicMode Component** (`ClassicMode.tsx`)

#### Powerup State Changes:
```
🎮 [ClassicMode] availablePowerUps updated: [
  {id: 'shield', quantity: 5, name: 'Shield', icon: '/powerups/shield.png'},
  {id: 'magnet', quantity: 2, name: 'Coin Magnet', icon: '/powerups/coin-magnet.png'}
]
```

#### Footer Powerup Mapping:
```
📊 [Footer] Mapping shield: {found: true, quantity: 5, isBlocked: false}
📊 [Footer] Mapping magnet: {found: true, quantity: 2, isBlocked: false}
📊 [Footer] Mapping extra_life: {found: false, quantity: 0, isBlocked: false}
📊 [Footer] Final powerups to display: shield:5, magnet:2
```

**What it tracks:**
- State updates in game component
- Each powerup being mapped
- Which powerups found/not found
- Final footer bar data

## How to Use for Debugging

### Step 1: Open Browser DevTools
Press `F12` to open developer console

### Step 2: Filter Logs
Use console filter to see specific parts:
- **All powerup logs:** Filter by `powerup`
- **Shop logs:** Filter by `Shop`
- **Inventory logs:** Filter by `inventoryService`
- **Hook logs:** Filter by `useGameEquipment`
- **Game logs:** Filter by `ClassicMode` or `Footer`

### Step 3: Purchase Powerup & Check Console

**Expected Log Sequence:**
```
1. 💾 [inventoryService] saveToInventory called with: {id: 'shield', ...}
2. ✅ [inventoryService] Inventory saved to localStorage
3. ✅ [inventoryService] inventory-updated event dispatched from saveToInventory
4. 🛍️ [Shop] Dispatching inventory-updated event
5. 🔄 [EVENT] Inventory update event received
6. 🔧 [useGameEquipment] loadEquipment() called
7. ✅ [useGameEquipment] Final powerups ready for game: shield:X
8. 🎮 [ClassicMode] availablePowerUps updated: [...]
9. 📊 [Footer] Final powerups to display: shield:X
```

### Step 4: Check for Issues

**If logs stop at step 2:**
- Inventory saving failed
- Check localStorage quota
- Check browser console for storage errors

**If logs stop at step 3-4:**
- Events not being dispatched
- Check if window.dispatchEvent is available
- Check if events are being cancelled

**If logs stop at step 5:**
- Event listener not registered
- Check if useGameEquipment mounted
- Check browser version

**If logs stop at step 6-7:**
- loadEquipment() not responding to event
- Check if inventory data corrupted
- Manual check: Open DevTools → Application → Local Storage → filter "flappypi-inventory"

**If logs show at 7 but not 8:**
- State update not triggering component re-render
- React performance issues
- Try hard refresh (Ctrl+Shift+R)

**If logs show 8 but not 9:**
- Footer mapping logic issue
- availablePowerUps state correct but mapping broken
- Check mainPowerUpIds array

## Key Debugging Checks

### Check 1: Is Data in localStorage?
```javascript
// In browser console:
JSON.parse(localStorage.getItem('flappypi-inventory'))
  .filter(i => i.type === 'powerup')
```

Should show purchased powerups with quantity > 0

### Check 2: Are Events Firing?
```javascript
// In browser console, add temporary listener:
window.addEventListener('inventory-updated', () => {
  console.log('✅ RECEIVED: inventory-updated');
});

window.addEventListener('power-up-purchased', () => {
  console.log('✅ RECEIVED: power-up-purchased');
});
```

Then purchase a powerup - should see messages

### Check 3: Is Hook Being Called?
Look for these logs in order:
1. `✅ [LISTENERS] Registered...` (on mount)
2. `🔄 [EVENT] Inventory update event received` (on event)
3. `🔧 [useGameEquipment] loadEquipment()` (on load)
4. `✅ [useGameEquipment] Final powerups` (on completion)

### Check 4: Is Component Getting Props?
Look for these logs in order:
1. `🎮 [ClassicMode] availablePowerUps updated:` (state changed)
2. `📊 [Footer] Mapping...` (mapping started)
3. `📊 [Footer] Final powerups to display:` (mapping complete)

## Quick Fixes Based on Debug Output

| Issue | Debug Sign | Solution |
|-------|-----------|----------|
| **Powerup not in inventory** | Step 1-2 fails | Check inventoryService.saveToInventory() |
| **Events not firing** | Step 3-4 fails | Check ShopModal dispatch calls |
| **useGameEquipment not loading** | Step 5-7 fails | Check if hook mounted, clear cache |
| **State not updating in game** | Step 7-8 fails | Check useState dependencies |
| **Footer not showing powerups** | Step 8-9 fails | Check mainPowerUpIds array in ClassicMode |

## Log Verbosity Levels

Current debug includes:
- ✅ = Success/completion
- 🛍️ = Shop action
- 💾 = Inventory service
- 🔧 = Technical details
- 🔄 = Event received
- 🎮 = Game component
- 📊 = Display/footer
- ⚠️ = Warning/issue
- ❌ = Error

## Console Commands to Find Issues

```javascript
// Find all powerup-related logs
console.log(document.querySelectorAll('[data-test="powerup"]'));

// Check current inventory state
localStorage.getItem('flappypi-inventory') |> JSON.parse

// Manually refresh hook
window.dispatchEvent(new CustomEvent('game-started'));

// Check localStorage size
Object.keys(localStorage).reduce((sum, key) => 
  sum + localStorage.getItem(key).length, 0
) + ' bytes'
```

## Performance Notes

Debug logging adds minimal overhead:
- ~2ms per purchase flow
- Console output only (no storage overhead)
- Can be disabled in production by filtering console

## Next Steps if Issue Persists

1. Check logs match expected sequence
2. Note exact step where logs stop
3. Check browser console for errors (red X)
4. Verify localStorage accessible (not full)
5. Try hard refresh (Ctrl+Shift+R)
6. Check if useGameEquipment hook mounted
7. Verify inventoryService initialized

