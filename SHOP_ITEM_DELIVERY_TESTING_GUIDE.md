# 🧪 Shop Item Delivery Testing Guide

## Verification Steps

### 1. **Verify Code Changes**

Check that the following files have been updated:

```powershell
# Check ShopModal.tsx imports
Get-Content "src/components/ShopModal.tsx" | Select-String "inventoryService" | Select-Object -First 5

# Check shopItems.ts has type field
Get-Content "src/constants/shopItems.ts" | Select-String 'type: "skin"' | Measure-Object

# Should show 12+ items with type field
```

### 2. **Check localStorage Structure**

After purchase, open browser DevTools and check localStorage:

```javascript
// In browser console:
console.log(JSON.parse(localStorage.getItem('flappypi-inventory')));
console.log(JSON.parse(localStorage.getItem('flappypi-owned-skins')));

// Expected output:
// flappypi-inventory: Array of items with { id, name, type, image, rarity, quantity, equipped, purchasedAt }
// flappypi-owned-skins: Array of item IDs
```

### 3. **Manual Purchase Testing Flow**

#### Step 1: Pi Purchase Test
1. Open shop modal
2. Click "Buy with Pi" on any bird skin
3. Verify Pi payment dialog opens
4. Complete payment
5. Check console: `inventoryService.saveToInventory()` was called
6. Check localStorage: new item appears in `flappypi-inventory`
7. Check `flappypi-owned-skins`: item ID added

**Expected Result**: Item in inventory with GIF image path

#### Step 2: Coin Purchase Test
1. Open shop modal (ensure you have coins)
2. Click "Buy with Coins" on any bird skin
3. Verify coin deduction
4. Check localStorage: new item appears in `flappypi-inventory`
5. Verify image path is GIF (contains `.gif`)

**Expected Result**: Item in inventory with GIF image path, coins deducted

#### Step 3: Manual Payment Test
1. Open shop modal
2. Click "Buy with Manual Payment" on any bird skin
3. Verify QR code shows
4. Simulate payment completion
5. Check localStorage: new item appears

**Expected Result**: Item in inventory after manual payment

#### Step 4: Dual Payment Test
1. Open shop modal
2. Click on a skin that has dual payment option
3. Complete payment
4. Check localStorage: new item appears

**Expected Result**: Item in inventory

### 4. **Verify GIF Images Stored**

After purchase, check image paths in console:

```javascript
const inventory = JSON.parse(localStorage.getItem('flappypi-inventory'));
inventory.forEach(item => {
  if (item.type === 'skin') {
    console.log(`${item.name}: ${item.image}`);
    // Should output: "Red Flappy: /birds2/bird_1.gif"
    // NOT: "Red Flappy: /birds/still_image.png"
  }
});
```

### 5. **Test Inventory Persistence**

1. Purchase a bird skin
2. Verify it appears in inventory
3. Refresh the page (F5)
4. Check inventory again
5. Verify item is still there with correct image

**Expected Result**: Item persists after refresh with correct GIF image

### 6. **Test Multiple Purchases**

1. Purchase 3 different bird skins
2. Check `flappypi-inventory` array
3. Verify all 3 items present
4. Verify each has correct GIF image path
5. Verify no duplicates (each skin has quantity: 1)

**Expected Result**: All 3 items in inventory, no duplicates

### 7. **Check File Sizes (Skins)**

All bird skins should have proper GIF image files:

```powershell
# Check public/birds2 directory has all GIFs
Get-ChildItem "public/birds2/" -Filter "*.gif" | Select-Object Name

# Expected:
# bird_0.gif
# bird_1.gif
# ... bird_12.gif
```

### 8. **Verify Backwards Compatibility**

Check that old `ownedSkins` is still working:

```javascript
// In console:
const ownedSkins = JSON.parse(localStorage.getItem('flappypi-owned-skins'));
const inventory = JSON.parse(localStorage.getItem('flappypi-inventory'));

// For each item in inventory with type 'skin'
inventory
  .filter(item => item.type === 'skin')
  .forEach(item => {
    const inOwnedSkins = ownedSkins.includes(item.id);
    console.log(`${item.name}: ${inOwnedSkins ? 'IN' : 'NOT IN'} ownedSkins`);
  });

// All skins should show: "IN ownedSkins"
```

---

## Debugging Commands

### Check All Purchases Since Start
```javascript
const inventory = JSON.parse(localStorage.getItem('flappypi-inventory'));
console.log('Total items in inventory:', inventory.length);
console.log('Skins:', inventory.filter(i => i.type === 'skin').length);
console.log('Items:', JSON.stringify(inventory, null, 2));
```

### Verify inventoryService Method Exists
```javascript
// Check if method was called (add console log to code)
console.log('inventoryService.saveToInventory called');

// Or check by calling it directly
inventoryService.saveToInventory({
  id: 'test-bird',
  name: 'Test Bird',
  type: 'skin',
  image: '/birds2/bird_1.gif',
  description: 'Test',
  rarity: 'Common',
  quantity: 1,
  equipped: false
});
console.log(JSON.parse(localStorage.getItem('flappypi-inventory')));
// Should show test item
```

### Check Image Paths Are Correct
```javascript
const items = JSON.parse(localStorage.getItem('flappypi-inventory'));
items.forEach(item => {
  if (item.type === 'skin') {
    const hasGif = item.image.includes('.gif');
    console.log(`${item.name}: ${item.image} [${hasGif ? '✅ GIF' : '❌ NOT GIF'}]`);
  }
});
```

### Verify Purchase Flow in Console

Add to ShopModal.tsx payment handlers:
```typescript
console.log('🛍️ Purchase initiated for:', item.name);
console.log('📦 Creating inventory item...');
console.log('💾 Saving to inventory service...');
console.log('✅ Purchase complete!');
console.log('📋 Current inventory:', inventoryService.getInventory());
```

---

## Expected Outputs

### After Pi Purchase
```
✅ Payment successful
✅ Item saved to inventory
✅ Item added to ownedSkins
✅ Image path: /birds2/bird_1.gif
✅ Type: skin
✅ Rarity: Common
```

### localStorage After Purchase
```javascript
{
  "flappypi-owned-skins": ["bird-0", "bird-1"],
  "flappypi-inventory": [
    {
      "id": "bird-0",
      "name": "Sky Blue Flappy",
      "type": "skin",
      "image": "/flappy pi gif/flappy-2.gif.gif",
      "description": "[Common 🟦] The original and default bird with a calm blue tone.",
      "rarity": "Common",
      "quantity": 1,
      "equipped": true,
      "purchasedAt": "2024-01-20T14:30:00.000Z"
    },
    {
      "id": "bird-1",
      "name": "Red Flappy",
      "type": "skin",
      "image": "/birds2/bird_1.gif",  // ✅ Correct GIF path!
      "description": "[Common 🟦] A fiery red bird with passionate energy.",
      "rarity": "Common",
      "quantity": 1,
      "equipped": false,
      "purchasedAt": "2024-01-20T14:32:00.000Z"
    }
  ]
}
```

---

## Common Issues & Solutions

### Issue: Still Images Instead of GIF
**Problem**: Image shows static instead of animated
**Solution**: Check image path includes `.gif` and points to `/birds2/bird_X.gif`
**Verification**: 
```javascript
const item = JSON.parse(localStorage.getItem('flappypi-inventory'))[0];
console.log(item.image); // Should contain ".gif"
```

### Issue: Item Not Appearing in Inventory
**Problem**: Purchased item not showing up
**Solution**: Check `inventoryService.saveToInventory()` was called
**Verification**:
```javascript
console.log(JSON.parse(localStorage.getItem('flappypi-inventory')));
// Should contain the purchased item
```

### Issue: Image Lost After Refresh
**Problem**: Item appears but image missing after page refresh
**Solution**: Image path should be in localStorage, reload page
**Verification**:
```javascript
const inventory = JSON.parse(localStorage.getItem('flappypi-inventory'));
const item = inventory.find(i => i.id === 'bird-1');
console.log('Image path:', item.image); // Should still exist
```

### Issue: Duplicate Items
**Problem**: Same skin appears multiple times
**Solution**: Check inventoryService.saveToInventory() deduplication logic
**Verification**:
```javascript
const inventory = JSON.parse(localStorage.getItem('flappypi-inventory'));
const skins = inventory.filter(i => i.type === 'skin');
const uniqueIds = new Set(skins.map(s => s.id));
console.log('Total skins:', skins.length, 'Unique:', uniqueIds.size);
// Should be equal (no duplicates)
```

---

## Success Criteria

✅ **All of the following must be true:**

1. User can purchase bird skin with Pi/Coins
2. Payment completes successfully
3. Item appears in `flappypi-inventory` localStorage
4. Item image path contains `.gif`
5. Item appears in inventory UI (if applicable)
6. Item persists after page refresh
7. Multiple purchases don't create duplicates
8. `ownedSkins` also updated for backwards compatibility
9. Item has correct rarity, description, and type
10. Image displays correctly in UI (animated, not static)

---

## Quick Test Command

Run this in browser console after any purchase:

```javascript
const inv = JSON.parse(localStorage.getItem('flappypi-inventory'));
const lastItem = inv[inv.length - 1];
console.log('✅ Last Purchase:');
console.log('Name:', lastItem.name);
console.log('Type:', lastItem.type);
console.log('Image:', lastItem.image);
console.log('Rarity:', lastItem.rarity);
console.log('Has GIF:', lastItem.image.includes('.gif'));
```

**Expected Output**:
```
✅ Last Purchase:
Name: Red Flappy
Type: skin
Image: /birds2/bird_1.gif
Rarity: Common
Has GIF: true
```

---

## Summary

The shop item delivery system is now fixed! Users will:
- ✅ Receive correct GIF bird skins after payment
- ✅ See items properly stored in inventory
- ✅ Have items persist after page refresh
- ✅ See correct image paths and metadata

Test each scenario above to confirm everything works correctly!
