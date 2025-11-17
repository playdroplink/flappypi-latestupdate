# FLPY Token Trading Guide (Pi Testnet)

## 📖 Overview
This guide explains how users can trade and use FLPY tokens on Pi Testnet.

## 🔐 Step 1: Add FLPY to Pi Wallet

### For Users:
1. Open **Pi Wallet** app
2. Go to **Settings** → **Network** → Switch to **Testnet**
3. Tap **"+"** or **"Add Token"**
4. Search for **"FLPY"**
5. Select **FLPY** from the list
6. Tap **"Add Token"** (this creates a trustline)
7. FLPY now appears in your wallet with 0 balance

**Important:** Users MUST add the token to their wallet before receiving it!

---

## 💱 Step 2: Enable Trading (Choose ONE Method)

### **Method 1: Liquidity Pool (Recommended)** ⭐

**Best for:** Automated market making, 24/7 trading, earning fees

**Setup Steps:**
```bash
# 1. Create the liquidity pool
node token-setup/create-liquidity-pool.js

# This will:
# - Create FLPY/Pi liquidity pool
# - Deposit your initial liquidity (e.g., 10,000 FLPY + 100 Pi)
# - Enable instant swaps in Pi Wallet
```

**User Experience:**
- Users open Pi Wallet → Swap → Pi ↔ FLPY
- Instant execution, no waiting
- Automated pricing based on supply/demand
- You earn 0.3% fee on every swap

**Configuration:**
Edit `create-liquidity-pool.js`:
```javascript
const FLPY_AMOUNT = '10000';  // Amount of FLPY to add
const PI_AMOUNT = '100';      // Amount of Pi to add
// This sets rate: 1 FLPY = 0.01 Pi
```

---

### **Method 2: Decentralized Exchange (DEX) Order Book**

**Best for:** Fixed-price trading, limit orders

**Setup Steps:**
```bash
# Create sell orders on Stellar DEX
node token-setup/create-dex-offers.js
```

**User Experience:**
- Users browse order book in Pi Wallet
- Match existing orders or create new ones
- Trades only execute when price matches

**Example Script:**
```javascript
// Create sell order: 1000 FLPY for 10 Pi (1 FLPY = 0.01 Pi)
StellarSDK.Operation.manageSellOffer({
  selling: FLPY_ASSET,
  buying: PI_ASSET,
  amount: '1000',
  price: '0.01'
})
```

---

### **Method 3: Direct Distribution (No Trading)**

**Best for:** Rewards, airdrops, game prizes

**Setup Steps:**
```bash
# Distribute FLPY directly to user wallets
node token-setup/distribute-tokens.js
```

**User Experience:**
- Users receive FLPY directly in their wallet
- No need to buy/swap
- Good for game rewards, quest completion, etc.

---

## 🎮 Step 3: Integrate with Your Game

### **In-Game Economy Integration:**

```javascript
// src/services/flpyService.ts

import * as StellarSDK from '@stellar/stellar-sdk';

const FLPY_ASSET = new StellarSDK.Asset(
  'FLPY',
  'GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI'
);

export async function rewardPlayer(playerWalletAddress: string, amount: string) {
  // When player wins a challenge, send FLPY
  const server = new StellarSDK.Horizon.Server('https://api.testnet.minepi.com');
  const distributorKeypair = StellarSDK.Keypair.fromSecret(process.env.DISTRIBUTOR_SECRET);
  
  const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
  
  const transaction = new StellarSDK.TransactionBuilder(distributorAccount, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: 'Pi Testnet'
  })
    .addOperation(
      StellarSDK.Operation.payment({
        destination: playerWalletAddress,
        asset: FLPY_ASSET,
        amount: amount
      })
    )
    .setTimeout(90)
    .build();
  
  transaction.sign(distributorKeypair);
  return await server.submitTransaction(transaction);
}
```

---

## 📊 Monitoring & Analytics

### Check Token Activity:
```bash
# View all FLPY transactions
curl "https://api.testnet.minepi.com/assets?asset_code=FLPY&asset_issuer=GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI"

# View liquidity pool stats
curl "https://api.testnet.minepi.com/liquidity_pools?reserves=FLPY:GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI"

# View account balances
curl "https://api.testnet.minepi.com/accounts/YOUR_WALLET_ADDRESS"
```

---

## 🚨 Common Issues & Solutions

### "Asset not found" error
- **Cause:** User hasn't added FLPY trustline
- **Solution:** User must add FLPY in Pi Wallet first

### "Insufficient balance" when swapping
- **Cause:** Not enough liquidity in pool
- **Solution:** Add more liquidity via `create-liquidity-pool.js`

### "Transaction failed" when sending FLPY
- **Cause:** Recipient doesn't have trustline
- **Solution:** Ask recipient to add FLPY token first

### Swap shows "No path found"
- **Cause:** No liquidity pool or DEX offers exist
- **Solution:** Create liquidity pool (Method 1) or DEX offers (Method 2)

---

## 🎯 Recommended Flow for Flappy Pi Game

1. **Deploy pi.toml** to `https://flappypi.fun/.well-known/pi.toml`
2. **Wait 24h** for Pi Server to verify
3. **Create liquidity pool** (10,000 FLPY + 100 Pi)
4. **Announce to players**: "Add FLPY token in Pi Wallet (Testnet)"
5. **Reward system**: Send FLPY for high scores, challenge wins
6. **Players can**: Hold, swap to Pi, or use for in-game purchases

---

## 💡 Pro Tips

- **Start small:** Test with small liquidity amounts first
- **Monitor volume:** Check trading activity daily
- **Adjust pricing:** If all FLPY sells, increase Pi amount in pool
- **Marketing:** Announce token launch on social media, Discord
- **Utility:** Give FLPY real use cases (VIP access, exclusive skins, etc.)

---

## 📞 Next Steps

1. ✅ Token minted (21M FLPY)
2. ⏳ Deploy pi.toml to https://flappypi.fun/.well-known/pi.toml
3. ⏳ Create liquidity pool (after pi.toml verified)
4. ⏳ Integrate reward system in game
5. ⏳ Launch and promote to players

**Need help?** Check Pi Platform docs: https://github.com/pi-apps/pi-platform-docs/blob/master/tokens.md
