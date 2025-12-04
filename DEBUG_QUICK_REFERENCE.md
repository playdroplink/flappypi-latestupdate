# Powerup Debug - Quick Reference Card

## 📋 Quick Start

1. **Open DevTools:** Press `F12`
2. **Go to:** Console tab
3. **Buy a powerup** in the game shop
4. **Look for console messages** with emojis below

## 🔍 What Each Emoji Means

| Emoji | Location | Meaning |
|-------|----------|---------|
| 🛍️ | Shop | Purchase action happening |
| 💾 | Inventory | Item being saved to storage |
| 🔧 | Hook | Loading equipment/setup |
| 🔄 | Event | Event was received |
| 🎮 | Game | Game component updating |
| 📊 | Footer | Footer bar displaying items |
| ✅ | Anywhere | Success/completed |
| ⚠️ | Anywhere | Warning/something unexpected |
| ❌ | Anywhere | Error/failure |

## ✅ Good - Expected Sequence

When you BUY A POWERUP, you should see (in order):

```
1. 💾 [inventoryService] saveToInventory called
2. ✅ [inventoryService] Inventory saved to localStorage
3. 🛍️ [Shop] Dispatching inventory-updated
4. 🔄 [EVENT] Inventory update event received
5. 🔧 [useGameEquipment] loadEquipment() called
6. ✅ [useGameEquipment] Final powerups ready
7. 🎮 [ClassicMode] availablePowerUps updated
8. 📊 [Footer] Final powerups to display
```

## ⚠️ Common Issues

### Issue: Logs stop at step 2
**Problem:** Not saving to storage  
**Check:** localStorage full? Browser storage disabled?

### Issue: Logs stop at step 3  
**Problem:** Events not dispatching  
**Check:** ShopModal.tsx lines with `window.dispatchEvent`

### Issue: Logs stop at step 4-5
**Problem:** Events not received by hook  
**Check:** Is useGameEquipment mounted? Is window.addEventListener working?

### Issue: Logs stop at step 6
**Problem:** loadEquipment() not returning data  
**Check:** Is inventory data valid? Is inventoryService.getInventory() working?

### Issue: Logs stop at step 7
**Problem:** Game component not getting state  
**Check:** availablePowerUps not updating? React state issue?

### Issue: Logs stop at step 8
**Problem:** Footer not mapping powerups  
**Check:** mainPowerUpIds array correct? availablePowerUps array empty?

## 🛠️ Manual Checks

### Check 1: Is data in localStorage?
```javascript
// Paste in console:
JSON.parse(localStorage.getItem('flappypi-inventory'))
  .filter(i => i.type === 'powerup')
```
Should show your powerups

### Check 2: Are event listeners registered?
```javascript
// Paste in console - then buy a powerup:
window.addEventListener('inventory-updated', () => {
  console.log('✅ GOT INVENTORY-UPDATED EVENT');
});
```

### Check 3: Manually trigger refresh
```javascript
// Paste in console:
window.dispatchEvent(new CustomEvent('game-started'));
```
Should see: `🎮 [EVENT] Game started event received`

## 📱 Filter Console by Keyword

Type in the **Filter** box (search icon in console):

| Search | Shows |
|--------|-------|
| `Shop` | Shop purchase logs |
| `inventory` | Inventory logs |
| `useGameEquipment` | Hook logs |
| `ClassicMode` | Game logs |
| `Footer` | Footer display logs |
| `powerup` | All powerup mentions |
| `ERROR` | Only errors |

## 🧪 Test Steps

1. Open console (F12)
2. Type filter: `powerup`
3. Buy a powerup from shop
4. See messages appear in real-time
5. Count how many steps complete (1-8)
6. Note where they stop

## 💡 Pro Tips

- **Expand objects** in console by clicking triangle
- **Copy logs** right-click → Copy message
- **Clear console** between tests: `console.clear()`
- **Timestamp** shows when each log occurred
- **Stack trace** visible if you click the line number

## 🚨 If All 8 Steps Complete

✅ Powerup system is working!  
- Check game and close/reopen
- Powerup should appear in footer bar
- If not, hard refresh: Ctrl+Shift+R

## 📞 Getting Help

When reporting issue, include:
1. Last console message you see
2. Which step it stops at (1-8)
3. Any error messages (red text)
4. Screenshot of console output

---

**Remember:** Debug messages only show in browser console (F12 → Console tab)
