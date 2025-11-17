# FLPY Token Setup Guide

## 🪙 Token Details
- **Token Code**: FLPY
- **Total Supply**: 21,000,000 FLPY
- **Issuer Public Key**: `GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI`
- **Distributor Public Key**: `GCTPMH43NGN7E4IXLQ27H2XWGGWWDY3I6UAPBFXYQSEUPEKNQE2BZXC2`
- **Network**: Pi Network Mainnet
- **Home Domain**: flappypi2807.pinet.com

## 📋 Prerequisites

1. **Two Pi Network Mainnet Wallets**:
   - ✅ Issuer wallet (secret key provided)
   - ✅ Distributor wallet (secret key provided)
   - Both wallets must be activated on Pi Mainnet with sufficient Pi balance

2. **Node.js** installed (v16 or higher)

3. **Stellar SDK** dependency

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd token-setup
npm install
```

This will install `@stellar/stellar-sdk` package.

### Step 2: Verify Wallet Keys

**IMPORTANT**: The script uses your actual secret keys. Make sure they are correct:

- **Issuer Secret**: `SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I`
- **Distributor Secret**: `SBS4OY37QMZ67U2WLWZQUUFUV2JOBKWCBFS7IZDOJV3NZPYC3OOZ4OIM`

### Step 3: Mint FLPY Tokens

Run the minting script:

```bash
npm run mint
```

This script will:
1. ✅ Create trustline from Distributor to FLPY token
2. ✅ Mint 21,000,000 FLPY tokens
3. ✅ Set home domain to `flappypi2807.pinet.com`
4. ✅ Verify balances

**Optional**: Uncomment the "Lock Issuer Account" section in `mint-flpy-token.js` to permanently lock the max supply at 21 million tokens (prevents future minting).

### Step 4: Upload pi.toml File

The `pi.toml` file is already created at `public/.well-known/pi.toml`.

**You must host this file at**:
```
https://flappypi2807.pinet.com/.well-known/pi.toml
```

**Requirements**:
- ✅ File must be accessible via HTTPS
- ✅ Content-Type must be `text/plain`
- ✅ File must be publicly accessible (no authentication)
- ✅ File should be cached properly

**To deploy**:
1. Copy `public/.well-known/pi.toml` to your server
2. Ensure it's served at the correct path
3. Test accessibility: `curl https://flappypi2807.pinet.com/.well-known/pi.toml`

### Step 5: Verify Token Setup

Run the verification script:

```bash
npm run verify
```

This will check:
- ✅ Token exists on Pi Blockchain
- ✅ Issuer account configuration
- ✅ Home domain is set correctly
- ✅ pi.toml file is accessible
- ✅ All required TOML fields are present

### Step 6: Wait for Pi Server Verification

After completing all steps:
1. Pi Server will scan your home domain
2. Verification typically takes **up to 24 hours**
3. Once verified, FLPY will appear in Pi Wallet
4. Users can search for "FLPY" and add it to their wallet

## 💸 Token Distribution

### Single Distribution

Edit `distribute-tokens.js` and use:

```javascript
await distributeTokens(
  "RECIPIENT_PUBLIC_KEY",
  "100",
  "Welcome to Flappy Pi!"
);
```

Then run:
```bash
npm run distribute
```

### Batch Distribution

Edit the `recipients` array in `distribute-tokens.js`:

```javascript
const recipients = [
  { publicKey: "GA...", amount: "100", memo: "Airdrop Reward" },
  { publicKey: "GB...", amount: "50", memo: "Game Prize" },
];
```

Run:
```bash
npm run distribute
```

### Creating a Liquidity Pool

1. Open Pi Wallet app
2. Go to **Tokens** → **Liquidity Pools**
3. Click **My Pools** → **Create New Pool**
4. Select **Pi** and **FLPY**
5. Enter desired amounts
6. Confirm creation

Users can then swap Pi for FLPY directly in the wallet.

## 🔒 Locking the Issuer Account (Max Supply)

To permanently establish the max supply at 21 million FLPY:

1. Uncomment the "Step 4" section in `mint-flpy-token.js`
2. Run `npm run mint` again
3. This sets the issuer account's master weight to 0
4. **WARNING**: This is irreversible! No more FLPY can ever be minted

## 🔍 Monitoring & Verification

### Check Token on Blockchain

```
https://api.minepi.com/assets?asset_code=FLPY&asset_issuer=GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI
```

### Check Issuer Account

```
https://api.minepi.com/accounts/GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI
```

### Check pi.toml

```
https://flappypi2807.pinet.com/.well-known/pi.toml
```

## ⚠️ Important Security Notes

1. **Never share your secret keys publicly**
2. The secret keys in these scripts are yours - keep them secure
3. Consider using environment variables for production:
   ```bash
   ISSUER_SECRET=SB... DISTRIBUTOR_SECRET=SB... npm run mint
   ```
4. After minting, you can remove secret keys from scripts if not distributing tokens

## 🐛 Troubleshooting

### Token not appearing in Pi Wallet
- Verify pi.toml is accessible via HTTPS
- Check all required TOML fields are present
- Wait 24 hours for Pi Server to scan
- Ensure home domain is set correctly on issuer account

### Transaction fails
- Check wallet has sufficient Pi balance for fees
- Verify secret keys are correct
- Ensure wallets are activated on mainnet
- Check network connection

### pi.toml not accessible
- Verify file is at exact path: `/.well-known/pi.toml`
- Check HTTPS is working (not HTTP)
- Ensure Content-Type is `text/plain`
- Test with: `curl -v https://flappypi2807.pinet.com/.well-known/pi.toml`

## 📚 Additional Resources

- [Pi Token Documentation](https://github.com/pi-apps/pi-platform-docs/blob/master/tokens.md)
- [Stellar Documentation](https://developers.stellar.org/)
- [Pi Blockchain Explorer](https://pi-blockchain.net/)

## 🎮 Integration with Flappy Pi Game

After token is verified and appears in Pi Wallet, you can integrate FLPY into your game:

1. Users earn FLPY by playing
2. FLPY can be used to purchase in-game items
3. Create reward pools for tournaments
4. Implement staking mechanisms
5. Build community governance with FLPY

## ✅ Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Verify wallet secret keys are correct
- [ ] Run minting script (`npm run mint`)
- [ ] Upload pi.toml to server
- [ ] Verify pi.toml is accessible via HTTPS
- [ ] Run verification script (`npm run verify`)
- [ ] Wait 24 hours for Pi Server scanning
- [ ] Check token appears in Pi Wallet
- [ ] (Optional) Lock issuer account for max supply
- [ ] Set up token distribution or liquidity pool
- [ ] Integrate FLPY into Flappy Pi game

---

**Status**: 🚀 Ready to mint 21 million FLPY tokens!
