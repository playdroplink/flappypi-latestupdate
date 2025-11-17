# FLPY Token Quick Start

## ✅ Complete Token Setup Created!

### 📁 Files Created:

1. **`mint-flpy-token.js`** - Main minting script
2. **`distribute-tokens.js`** - Token distribution script  
3. **`verify-token.js`** - Verification script
4. **`get-public-keys.js`** - Get public keys from secrets
5. **`package.json`** - NPM configuration
6. **`public/.well-known/pi.toml`** - Token metadata file
7. **`README.md`** - Complete documentation

### 🔑 Your Wallet Keys:

**Issuer:**
- Public: `GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI`
- Secret: `SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I`

**Distributor:**
- Public: `GCTPMH43NGN7E4IXLQ27H2XWGGWWDY3I6UAPBFXYQSEUPEKNQE2BZXC2`
- Secret: `SBS4OY37QMZ67U2WLWZQUUFUV2JOBKWCBFS7IZDOJV3NZPYC3OOZ4OIM`

### 🚀 Quick Start (3 Steps):

#### Step 1: Mint Tokens
```powershell
cd token-setup
npm run mint
```

This will:
- ✅ Create trustline from distributor
- ✅ Mint 21,000,000 FLPY tokens
- ✅ Set home domain to flappypi2807.pinet.com

#### Step 2: Deploy pi.toml File

Upload `public/.well-known/pi.toml` to your server at:
```
https://flappypi2807.pinet.com/.well-known/pi.toml
```

**Test it:**
```powershell
curl https://flappypi2807.pinet.com/.well-known/pi.toml
```

#### Step 3: Verify Setup
```powershell
npm run verify
```

This checks:
- ✅ Token on blockchain
- ✅ Home domain set
- ✅ pi.toml accessible
- ✅ All fields valid

### 💸 Distribute Tokens:

Edit `distribute-tokens.js` and add recipients:
```javascript
await distributeTokens("RECIPIENT_PUBLIC_KEY", "100", "Welcome!");
```

Then run:
```powershell
npm run distribute
```

### 📊 Monitor Your Token:

**Check on blockchain:**
```
https://api.minepi.com/assets?asset_code=FLPY&asset_issuer=GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI
```

**Check issuer account:**
```
https://api.minepi.com/accounts/GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI
```

### ⚠️ Important:

1. **Activate wallets** on Pi Mainnet first
2. **Ensure sufficient Pi balance** for transaction fees
3. **Deploy pi.toml** via HTTPS with `text/plain` content-type
4. **Wait 24 hours** for Pi Server to scan and verify
5. **Never share secret keys** publicly

### 🎮 Next Steps:

After verification:
1. Token appears in Pi Wallet
2. Users can add FLPY to their wallets
3. Create liquidity pool (Pi ↔ FLPY)
4. Integrate into Flappy Pi game
5. Distribute rewards to players

---

**Status**: 🟢 Ready to mint!

Run `npm run mint` to start! 🚀
