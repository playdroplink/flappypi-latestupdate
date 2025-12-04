# Powerup System - Quick Reference

## Where Users Get Powerups

### **Purchase from Shop**
- User buys "Shield x5" with Flappy Coins
- Saved to inventory via `inventoryService.saveToInventory()`
- Window event: `inventory-updated` fires
- Available in game immediately

### **Claim from Subscription**
- Subscription includes powerup reward
- RewardModal saves to inventory
- Window event: `inventory-updated` fires
- Available in game immediately

### **Win from Challenges/Events**
- Challenge reward includes powerup
- Saved via `inventoryService.saveToInventory()`
- Window event: `inventory-updated` fires
- Available in game immediately

## Powerup Loading Flow (Game Start)

```
1. Game Component Mounts
   └─ Imports: useGameEquipment hook

2. useGameEquipment Hook Initializes
   └─ Calls: loadEquipment()
   └─ Gets: inventoryService.getInventory()
   └─ Filters: type === 'powerup' AND quantity > 0
   └─ Stores: availablePowerUps state

3. FooterPowerupBar Renders
   └─ Maps footerPowerUpItems to real quantities
   └─ Shows badges with quantity counts
   └─ Buttons click to activate powerups

4. User Clicks Powerup
   └─ Calls: activatePowerUp(powerUpId)
   └─ Validates usage (anti-abuse rules)
   └─ Reduces inventory quantity by 1
   └─ Applies game effect (shield, magnet, etc)
   └─ Reloads availablePowerUps
   └─ UI updates showing new quantity
```

## Powerup Quantities

| Where Stored | Access Method | Get Quantity |
|---|---|---|
| localStorage/inventoryService | `inventoryService.getInventory()` | `item.quantity` |
| useGameEquipment | `availablePowerUps` array | `powerup.quantity` |
| Game Footer | `footerPowerUps` array | `powerup.quantity` |

## How Each Powerup Works

### Shield
- **Effect**: Protects from 1 collision
- **Duration**: 10 seconds
- **Icon**: `/powerups/shield.png`
- **ID**: `shield`

### Coin Magnet
- **Effect**: Attracts coins from distance
- **Duration**: 15 seconds
- **Icon**: `/powerups/coin-magnet.png`
- **ID**: `magnet`

### Extra Life
- **Effect**: Revives once when crashed
- **Duration**: Until used
- **Icon**: `/powerups/extra-life.png`
- **ID**: `extra_life`

### 2x Coin Multiplier
- **Effect**: Doubles coin earnings
- **Duration**: 20 seconds
- **Icon**: `/powerups/2x-coin-multiplier.png`
- **ID**: `coin_multiplier`

### Turbo Start
- **Effect**: Increases game speed
- **Duration**: 12 seconds
- **Icon**: `/powerups/turbo-start.png`
- **ID**: `turbo_start`

## Game Modes That Support Powerups

| Mode | File | Status |
|---|---|---|
| Classic | `paln4.tsx` | ✅ Fixed |
| Endless | `paln4.tsx` | ✅ Fixed |
| Bundle | `palnuygo.tsx` | ✅ Fixed |
| Challenge | `DinoPiGameMode.tsx` | N/A |

## Event System

### Triggered When:
```javascript
// Inventory changes
window.dispatchEvent(new Event('inventory-updated'));

// Powerup purchased
window.dispatchEvent(new CustomEvent('power-up-purchased', {
  detail: { powerUpId: 'shield', quantity: 5 }
}));

// Wallet balance changes
window.dispatchEvent(new CustomEvent('wallet-balance-updated', {
  detail: { balance: 1000, added: 100 }
}));
```

### Listeners (useGameEquipment):
```javascript
window.addEventListener('inventory-updated', () => loadEquipment());
window.addEventListener('power-up-purchased', () => loadEquipment());
```

## Anti-Abuse Limits

When activating a powerup:
- ✅ Max 2 powerups active simultaneously
- ✅ 30 second cooldown between same powerup
- ✅ Max 10 powerups per 5-minute session
- ✅ Max 3 powerups per minute total

## Debugging Commands

### Check Available Powerups
```javascript
// In browser console during game
const inventory = inventoryService.getInventory();
const powerups = inventory.filter(i => i.type === 'powerup');
console.log(powerups);
```

### Check Active Powerups
```javascript
// During game
const { availablePowerUps, activePowerUps } = useGameEquipment();
console.log('Available:', availablePowerUps);
console.log('Active:', activePowerUps);
```

### Trigger Inventory Reload
```javascript
// Force refresh
window.dispatchEvent(new Event('inventory-updated'));
```

## Common Issues & Solutions

### Powerups Don't Show in Game

**Check 1:** Are they in inventory?
```javascript
const inventory = inventoryService.getInventory();
const hasPowerups = inventory.some(i => i.type === 'powerup' && i.quantity > 0);
console.log('Has powerups:', hasPowerups);
```

**Check 2:** Is availablePowerUps loaded?
```javascript
console.log('Available powerups:', availablePowerUps);
```

**Check 3:** Is event firing?
```javascript
window.addEventListener('inventory-updated', () => {
  console.log('✅ Inventory updated event fired');
});
```

### Powerup Quantity Not Decreasing

**Check 1:** Is useItem being called?
```javascript
const success = inventoryService.useItem('shield', 'powerup', 1);
console.log('Use successful:', success);
```

**Check 2:** Is equipment reloading?
```javascript
await activatePowerUp('shield');
console.log('Powerup activated, reloading...');
```

### Footerpower Bar Not Updating

**Check:** Are quantities being mapped correctly?
```javascript
console.log('Footer powerups:', footerPowerUps);
console.log('Should show:', footerPowerUps.filter(p => p.quantity > 0));
```

## Files to Check

- `src/components/game/paln4.tsx` - Classic/Endless
- `src/components/game/palnuygo.tsx` - Bundle
- `src/components/game/FooterPowerupBar.tsx` - UI display
- `src/hooks/useGameEquipment.ts` - Logic
- `src/services/inventoryService.ts` - Storage

## Related Documentation

- `POWERUP_DETECTION_GAME_FIX.md` - Detailed technical explanation
- `POWERUP_FIX_SUMMARY.md` - Before/after comparison
