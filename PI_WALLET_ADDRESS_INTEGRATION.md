# Pi Wallet Address Integration Guide

## Overview
This document describes the complete wallet address collection and management system for Flappy Pi. The system automatically collects Pi mainnet wallet addresses during authentication and persists them in Supabase for reward distribution.

## Architecture

### Components
1. **walletService.ts** - Core service for wallet management
2. **piWalletRequestUtil.ts** - Utility functions for wallet requests
3. **AuthContext.tsx** - Auto-collection during Pi authentication
4. **ProfilePage.tsx** - UI for manual wallet entry and display
5. **Supabase** - Persistent storage in `user_profiles.wallet_address`

### Data Flow

```
Pi Authentication
    ↓
AuthContext (loginWithPi)
    ↓
walletService.autoCollectWallet()
    ↓
Save to Supabase + localStorage
    ↓
ProfilePage (auto-fill if available)
    ↓
User can update/confirm
    ↓
Save to both Supabase and localStorage
```

## Usage

### Automatic Wallet Collection

When a user authenticates with Pi Network, the system automatically attempts to collect their wallet address:

```typescript
// In AuthContext.tsx - loginWithPi()
const { walletService } = await import('../services/walletService');
const walletCollected = await walletService.autoCollectWallet(user);

if (walletCollected) {
  console.log('✅ Wallet auto-collected:', walletCollected);
  localStorage.setItem('flappypi-wallet-auto-collected', 'true');
}
```

### Manual Wallet Entry (ProfilePage)

Users can manually enter their wallet address in the Profile page if auto-collection didn't succeed:

1. **Wallet Consent Card** appears if user hasn't provided wallet
2. User clicks "Connect Wallet" button
3. Modal opens asking for permission
4. User can "Allow" and enter wallet address or "Decline"
5. Wallet saved to Supabase and localStorage

### Retrieving Wallet Address

```typescript
import { walletService } from '@/services/walletService';

// Get wallet with multiple fallback sources
const wallet = await walletService.getWalletAddress(piUserId);

// Or retrieve directly from Supabase
const wallet = await walletService.getWalletFromSupabase(piUserId);

// Or check cache
const wallet = walletService.getWalletFromCache(piUserId);
```

## Database Schema

The wallet address is stored in the `user_profiles` table:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(255),  -- Pi mainnet wallet address
  ...
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  ...
);
```

## API Methods

### WalletService

#### `requestWalletFromPiAuth(): Promise<string | null>`
Request wallet address from Pi SDK with wallet_address scope.

#### `saveWalletToSupabase(piUserId, username, walletAddress): Promise<boolean>`
Save wallet address to Supabase user_profiles table.
- Also caches in localStorage with key: `flappypi-wallet-{piUserId}`

#### `getWalletFromSupabase(piUserId): Promise<string | null>`
Retrieve wallet from Supabase by user ID.

#### `getWalletFromCache(piUserId): string | null`
Synchronous retrieval from localStorage cache.

#### `getWalletAddress(piUserId): Promise<string | null>`
Get wallet with automatic fallback:
1. Check localStorage cache
2. Check Supabase
3. Return null if not found

#### `isWalletCollected(piUserId): boolean`
Check if wallet has been collected for this user.

#### `autoCollectWallet(piUser): Promise<string | null>`
Automatically collect wallet during Pi authentication.
Called in AuthContext.loginWithPi()

#### `getAllWalletAddresses(): Promise<WalletData[]>`
Admin function to get all wallet addresses from Supabase.

#### `exportWalletAddressesForRewards(): Promise<Record<string, string>>`
Export wallet addresses for reward distribution system.

### PiWalletRequestUtil

#### `requestWalletAddressPermission(): Promise<string | null>`
Explicitly request wallet from user via Pi auth.

#### `shouldShowWalletRequest(piUser): boolean`
Determine if wallet request UI should be shown.

#### `showWalletRequestModal(): void`
Trigger wallet request modal display.

#### `getWalletDisplayInfo(wallet): {isCollected, displayAddress, isMasked}`
Get formatted wallet info for UI display.

#### `isValidPiWallet(address): boolean`
Validate if address is in valid Pi mainnet format.

#### `getWalletCollectionStatus(): {hasBeenRequested, hasBeenCollected, lastRequestTime}`
Get wallet collection status from localStorage.

#### `markWalletAsCollected(piUserId): void`
Mark wallet as successfully collected.

## LocalStorage Keys

```
flappypi-wallet-{piUserId}              // Cached wallet address
flappypi-wallet-collected               // Boolean flag
flappypi-wallet-timestamp               // ISO timestamp of collection
flappypi-wallet-auto-collected          // Auto-collection success flag
pi-mainnet-wallet                        // Legacy key (still used in ProfilePage)
```

## Frontend UI Components

### ProfilePage.tsx - Wallet Modal

**Props that manage wallet state:**
```typescript
const [walletInput, setWalletInput] = useState(localStorage.getItem('pi-mainnet-wallet') || '');
const [showWalletConsent, setShowWalletConsent] = useState(!localStorage.getItem('pi-mainnet-wallet'));
const [walletSaved, setWalletSaved] = useState(!!localStorage.getItem('pi-mainnet-wallet'));
const [showWalletModal, setShowWalletModal] = useState(false);
```

**UI Elements:**
1. **Consent Card** - Shows if wallet not saved
   - Purple "Connect Wallet" button (fixed from white)
   - Gray "Decline" button (fixed from white)

2. **Wallet Modal** - Permission + Input
   - "Allow" / "Decline" buttons
   - Text input for wallet address
   - "Save Wallet Address" button
   - "Cancel" button

3. **Saved Wallet Card** - Shows if wallet is saved
   - Masked wallet address display
   - "Update Wallet Address" button

**Key Functions:**
- `handleSaveWallet()` - Saves to localStorage and Supabase
- `handleDeclineWallet()` - Closes modals
- `loadWalletFromSupabase()` - Auto-loads on component mount

## Security Considerations

1. **Mainnet Only**: Wallet requests include the 'wallet_address' scope which is mainnet-only
2. **Validation**: Wallet addresses are validated before storage
3. **User Control**: Users can always decline and update wallet address
4. **Purpose Statement**: Modal clearly states purpose is for reward distribution
5. **Privacy**: Wallet address is used only for reward payouts

## Admin Functions

### Export All Wallets
```typescript
const { walletService } = await import('@/services/walletService');
const allWallets = await walletService.exportWalletAddressesForRewards();
// Returns: { [piUserId]: walletAddress, ... }
```

### Sync Wallets to Reward System
```typescript
// In reward distribution service:
const walletMap = await walletService.exportWalletAddressesForRewards();
for (const [piUserId, walletAddress] of Object.entries(walletMap)) {
  await rewardService.sendReward(piUserId, walletAddress, rewardAmount);
}
```

## Testing

### Test Wallet Auto-Collection
1. Log in with Pi Network
2. Check localStorage for `flappypi-wallet-{uid}`
3. Check Supabase `user_profiles` table for `wallet_address`
4. Check for `wallet-auto-collected` event

### Test Manual Entry
1. Clear wallet localStorage: `localStorage.removeItem('pi-mainnet-wallet')`
2. Refresh Profile page
3. Consent card should appear
4. Click "Connect Wallet"
5. Enter test wallet address
6. Click "Save Wallet Address"
7. Verify saved in Supabase and localStorage

### Test Validation
```typescript
import { PiWalletRequestUtil } from '@/utils/piWalletRequestUtil';

const valid = PiWalletRequestUtil.isValidPiWallet('a'.repeat(64));
const invalid = PiWalletRequestUtil.isValidPiWallet('invalid');
```

## Events

### wallet-auto-collected
Dispatched when wallet is auto-collected during authentication.

```typescript
window.addEventListener('wallet-auto-collected', (event) => {
  console.log(event.detail.walletAddress);
  console.log(event.detail.username);
  console.log(event.detail.timestamp);
});
```

### show-wallet-request
Dispatched to trigger wallet request modal.

```typescript
window.addEventListener('show-wallet-request', (event) => {
  // Show wallet modal
});
```

## Error Handling

### Auto-Collection Failures
- Logged as warnings but don't block login
- User prompted in Profile page if wallet missing
- Can be manually entered at any time

### Supabase Save Failures
- Falls back to localStorage (data still cached locally)
- Retry on next sync cycle
- User notified via toast notification

### Network Errors
- Graceful degradation with local-only storage
- Cloud sync retried in background
- No data loss

## Future Enhancements

1. **Batch Wallet Export** - Export multiple wallets for bulk reward distribution
2. **Wallet Verification** - Verify wallet address is valid via Pi API
3. **QR Code Scanning** - Scan QR code for wallet address entry
4. **Wallet History** - Track wallet address changes over time
5. **Reward Notifications** - Notify users when rewards sent to wallet
6. **Fallback Mechanism** - Allow wallet update if first address invalid

## Migration Notes

If migrating from old system that doesn't use Supabase:

```typescript
// One-time migration script
const legacyWallet = localStorage.getItem('pi-mainnet-wallet');
if (legacyWallet && piUserId) {
  await walletService.saveWalletToSupabase(piUserId, username, legacyWallet);
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Wallet not showing in Profile | Check localStorage `pi-mainnet-wallet` key, verify Supabase row exists |
| Auto-collection not working | Check Pi SDK initialization, verify wallet_address scope in auth |
| Supabase save fails | Check network connection, verify user_profiles table exists |
| Wallet keeps disappearing | Check localStorage persistence, browser privacy settings |
| Modal not visible | Check ProfilePage mount, verify `showWalletConsent` state |

## Related Files

- `src/services/walletService.ts` - Main wallet service
- `src/utils/piWalletRequestUtil.ts` - Wallet utility functions
- `src/context/AuthContext.tsx` - Auto-collection integration (line ~285)
- `src/pages/ProfilePage.tsx` - UI implementation (lines ~740-795)
- `COMPLETE_DATABASE_SCHEMA.sql` - Supabase schema with wallet_address field
