# Wallet Address Integration - Testing Guide

## Quick Test Checklist

### 1. Button Visibility Test ✅
**What to test**: The "Connect Wallet" and "Decline" buttons are now visible

**Steps**:
1. Go to Profile page
2. If wallet not saved, you should see the consent card
3. Look for two buttons at bottom of consent card:
   - Purple "Connect Wallet" button (previously white and invisible)
   - Gray "Decline" button (previously white and invisible)
4. Buttons should have clear text visible

**Expected Result**: Both buttons clearly visible with white text on colored backgrounds

---

### 2. Auto-Collection Test (During Login)
**What to test**: Wallet automatically collected during Pi authentication

**Prerequisites**: Must be using Pi Browser or have Pi SDK available

**Steps**:
1. Clear all localStorage: 
   ```javascript
   localStorage.clear()
   ```
2. Go to login/auth page
3. Click "Sign in with Pi Network"
4. Complete Pi authentication
5. Check browser console for wallet logs
6. Check localStorage for wallet data:
   ```javascript
   // In browser console:
   localStorage.getItem('flappypi-wallet-auto-collected')  // Should be 'true'
   localStorage.getItem('flappypi-wallet-{piUserId}')      // Should have wallet address
   ```

**Expected Results**:
- No errors in console
- `wallet-auto-collected` event dispatched
- Wallet in localStorage cache
- Wallet in Supabase `user_profiles.wallet_address`

---

### 3. Supabase Storage Test
**What to test**: Wallet addresses properly saved to Supabase

**Steps**:
1. Go to Supabase dashboard
2. Open `user_profiles` table
3. Look for row with your `pi_user_id`
4. Check `wallet_address` column has value
5. Check `updated_at` is recent

**Expected Result**: Wallet address visible in Supabase with correct timestamp

---

### 4. ProfilePage Auto-Load Test
**What to test**: Wallet automatically loads in Profile page from Supabase

**Steps**:
1. After logging in, go to Profile page
2. If wallet was auto-collected:
   - Consent card should NOT appear
   - Wallet display card should show (with "Your Pi Mainnet Wallet Address")
   - Wallet address should be visible (masked format: first6...last6)
3. If wallet was NOT auto-collected:
   - Consent card should appear
   - Can proceed to manual entry

**Expected Result**: 
- Auto-collected wallets display immediately
- Not-collected wallets show consent card

---

### 5. Manual Wallet Entry Test
**What to test**: Manual wallet entry and Supabase storage

**Steps**:
1. In Profile page consent card, click "Connect Wallet"
2. A dialog should appear asking for permission
3. Click "Allow"
4. Text input appears for wallet address
5. Enter test wallet address (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
6. Click "Save Wallet Address"
7. Check localStorage:
   ```javascript
   localStorage.getItem('pi-mainnet-wallet')  // Should have address
   ```
8. Check Supabase `user_profiles.wallet_address` updated

**Expected Result**:
- Toast notification: "Wallet Address Saved! 💰"
- Wallet saved in localStorage
- Wallet saved in Supabase
- Consent card disappears
- Wallet display card appears with "Update Wallet Address" button

---

### 6. Wallet Update Test
**What to test**: Updating wallet address

**Steps**:
1. With wallet already saved, click "Update Wallet Address" button
2. Enter new wallet address
3. Click "Save Wallet Address"
4. Verify both localStorage and Supabase updated

**Expected Result**:
- New wallet address displayed
- Updated timestamp in Supabase
- Success toast notification

---

### 7. Validation Test
**What to test**: Invalid addresses rejected

**Steps**:
1. In wallet modal, enter invalid address (e.g., "invalid" or too short)
2. Click "Save Wallet Address"
3. Check browser console for validation message

**Expected Result**:
- Toast error: "Invalid Wallet Address"
- No save occurs
- User can retry

---

### 8. Decline Functionality Test
**What to test**: Users can decline wallet collection

**Steps**:
1. From consent card, click "Decline"
2. Modal should close
3. Consent card should hide (but might reappear on next session)
4. Check localStorage:
   ```javascript
   localStorage.getItem('flappypi-wallet-collected')  // Should be null
   ```

**Expected Result**:
- Modal closes
- Can proceed without wallet
- Not marked as collected

---

### 9. Browser Console Logging Test
**What to test**: Proper logging of wallet operations

**Steps**:
1. Open browser DevTools Console (F12)
2. Perform wallet operations (login, save, update)
3. Look for log messages starting with:
   - `🔐` - Authentication messages
   - `💳` - Wallet collection
   - `✅` - Success operations
   - `⚠️` - Warnings
   - `❌` - Errors

**Expected Log Messages**:
```
🔐 Starting Pi login process...
💳 Starting wallet auto-collection...
✅ Auto-collecting wallet for Pi user...
✅ Wallet address retrieved from Pi auth...
💾 Saving wallet address to Supabase...
✅ Wallet address saved to Supabase...
✅ Wallet auto-collected and saved
```

**Expected Result**: Clear, organized logging for debugging

---

### 10. Event Dispatch Test
**What to test**: Custom events dispatched correctly

**Steps**:
1. In browser console, add event listener:
   ```javascript
   window.addEventListener('wallet-auto-collected', (e) => {
     console.log('Wallet collected!', e.detail);
   });
   window.addEventListener('auth-state-changed', (e) => {
     console.log('Auth changed!', e.detail);
   });
   ```
2. Log in with Pi
3. Check console for event logs

**Expected Result**: Events logged with correct detail data

---

## Manual Test Scenarios

### Scenario 1: New User with Pi Auth
**Steps**:
1. New user opens app
2. Clicks "Login with Pi"
3. Completes Pi authentication
4. Gets auto-collected wallet
5. Lands on home page

**Expected**: Wallet collected without user interaction

### Scenario 2: User Without Initial Wallet
**Steps**:
1. User logs in but wallet auto-collection fails
2. User goes to Profile page
3. Sees consent card
4. Clicks "Connect Wallet"
5. Manually enters wallet
6. Saves and continues

**Expected**: Wallet collected via manual entry

### Scenario 3: User Updates Wallet
**Steps**:
1. User with existing wallet in Profile
2. Clicks "Update Wallet Address"
3. Enters new wallet
4. Saves

**Expected**: Wallet updated in both localStorage and Supabase

### Scenario 4: Logout and Login Again
**Steps**:
1. User logged in with wallet
2. Logs out
3. Clears all data (clear localStorage)
4. Logs back in
5. Wallet should auto-load from Supabase

**Expected**: Wallet recovered from Supabase on re-login

---

## Data Verification

### Check LocalStorage
```javascript
// View all wallet-related keys
Object.keys(localStorage)
  .filter(k => k.includes('wallet'))
  .forEach(k => console.log(k, localStorage.getItem(k)));
```

### Check Supabase
```sql
-- View all wallets in Supabase
SELECT pi_user_id, username, wallet_address, updated_at 
FROM user_profiles 
WHERE wallet_address IS NOT NULL
ORDER BY updated_at DESC;
```

### Check Service Methods
```javascript
// Test service directly
const { walletService } = await import('./src/services/walletService.ts');

// Get all wallets (admin)
const allWallets = await walletService.getAllWalletAddresses();
console.log(allWallets);

// Check if collected
const collected = walletService.isWalletCollected('user-id-here');
console.log(collected);
```

---

## Network Requests Monitoring

### Check Network Tab (F12)
1. Open DevTools → Network tab
2. Perform wallet save
3. Look for requests to:
   - `POST /rest/v1/user_profiles` (Supabase save)
   - `GET /rest/v1/user_profiles` (Supabase load)

**Expected**: Successful 2xx responses

---

## Troubleshooting During Tests

### Issue: Button Still Invisible
**Cause**: Old CSS cached
**Solution**: Hard refresh (Ctrl+Shift+R)

### Issue: Wallet Not Saving to Supabase
**Cause**: No network, auth error, or table missing
**Solution**: 
- Check network in DevTools
- Check Supabase auth key
- Verify table exists: `SELECT * FROM user_profiles LIMIT 1`

### Issue: Auto-Load Not Working
**Cause**: User not authenticated or piUser.uid missing
**Solution**:
- Check `isPiAuth` in React DevTools
- Check `piUser.uid` exists
- Check localStorage for Pi auth data

### Issue: Modal Not Appearing
**Cause**: showWalletConsent state not true
**Solution**:
- Check `localStorage.getItem('pi-mainnet-wallet')` is null
- Reset with: `localStorage.removeItem('pi-mainnet-wallet')`
- Refresh page

---

## Performance Testing

### Check Auto-Collection Performance
1. Time the wallet collection:
   ```javascript
   console.time('wallet-auto-collect');
   // ... trigger auto-collection
   console.timeEnd('wallet-auto-collect');
   ```
2. Should complete in < 2 seconds (non-blocking)

### Check Supabase Query Performance
1. Check Network tab request time for Supabase saves
2. Should be < 500ms typical

---

## Security Testing

### Test Permission Scopes
```javascript
// Verify wallet_address scope requested
if (window.Pi) {
  const result = await window.Pi.authenticate(['wallet_address']);
  console.log('Scopes granted:', result.scopes);
  // Should include 'wallet_address'
}
```

### Test Address Validation
```javascript
// Import validator
const { PiWalletRequestUtil } = await import('./src/utils/piWalletRequestUtil.ts');

// Test valid address
console.log(PiWalletRequestUtil.isValidPiWallet('a'.repeat(64)));  // true

// Test invalid
console.log(PiWalletRequestUtil.isValidPiWallet('invalid'));      // false
```

---

## Success Criteria

✅ All tests pass when:
1. Buttons visible with proper colors
2. Wallet auto-collects during Pi auth
3. Wallet saves to Supabase and localStorage
4. ProfilePage auto-loads wallet from Supabase
5. Manual entry works with validation
6. Update functionality works
7. Console logging is clean and organized
8. Events dispatch correctly
9. No JavaScript errors
10. Supabase has all wallets

---

## Test Report Template

```
Date: ___________
Tester: _________
Environment: (Development/Staging/Production)

Test Results:
1. Button Visibility: ☐ PASS ☐ FAIL
2. Auto-Collection: ☐ PASS ☐ FAIL
3. Supabase Storage: ☐ PASS ☐ FAIL
4. Auto-Load: ☐ PASS ☐ FAIL
5. Manual Entry: ☐ PASS ☐ FAIL
6. Wallet Update: ☐ PASS ☐ FAIL
7. Validation: ☐ PASS ☐ FAIL
8. Decline: ☐ PASS ☐ FAIL
9. Console Logging: ☐ PASS ☐ FAIL
10. Events: ☐ PASS ☐ FAIL

Issues Found:
- [List any issues]

Notes:
- [Any additional observations]

Overall: ☐ ALL PASS ☐ SOME FAIL ☐ MAJOR ISSUES
```

---

## Command Reference

### Clear and Test
```javascript
// Clear everything
localStorage.clear();
sessionStorage.clear();

// Reload
location.reload();

// Test wallet service
const { walletService } = await import('@/services/walletService');
const status = await walletService.getAllWalletAddresses();
console.table(status);
```

### View Test Data
```javascript
// View all Pi auth data
JSON.parse(localStorage.getItem('flappypi-pi-user'));

// View wallet cache
localStorage.getItem('flappypi-wallet-' + piUserId);

// View wallet status
localStorage.getItem('flappypi-wallet-collected');
```

---

## Contact for Issues

If tests fail:
1. Check browser console for error messages
2. Check Supabase logs for database errors
3. Check network tab for failed requests
4. Review PI_WALLET_ADDRESS_INTEGRATION.md for details
5. Check WALLET_IMPLEMENTATION_SUMMARY.md for architecture
