# ⚠️ CRITICAL: Activate Your Wallets First!

## 🚨 Error Found: Wallet Not Activated

Your token minting failed because:
```
❌ Error: Not Found
```

This means your **Distributor wallet is not activated on Pi Mainnet**.

---

## ✅ REQUIRED STEPS BEFORE MINTING

### Step 1: Activate BOTH Wallets on Pi Mainnet

You need to activate 2 wallets in **Pi Wallet app**:

1. **Issuer Wallet**
   - Public Key: `GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI`
   - Secret Key: `SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I`

2. **Distributor Wallet**
   - Public Key: `GCTPMH43NGN7E4IXLQ27H2XWGGWWDY3I6UAPBFXYQSEUPEKNQE2BZXC2`
   - Secret Key: `SBS4OY37QMZ67U2WLWZQUUFUV2JOBKWCBFS7IZDOJV3NZPYC3OOZ4OIM`

---

## 📱 How to Activate Wallets

### Option A: Using Pi Wallet App (Recommended)

1. **Open Pi Wallet** on your Pi Browser
2. **Import Each Wallet**:
   - Tap "+" or "Add Wallet"
   - Select "Import Wallet"
   - Enter the **secret key** (starts with "S")
   - Give it a name (e.g., "FLPY Issuer" and "FLPY Distributor")

3. **Activate on Mainnet**:
   - Select the wallet
   - Go to Settings → Activate on Mainnet
   - Complete the activation process

4. **Fund the Wallets**:
   - Send at least **1 Pi** to each wallet to cover transaction fees
   - You need Pi for:
     - Creating trustline (~0.00001 Pi)
     - Minting tokens (~0.00001 Pi)
     - Setting home domain (~0.00001 Pi)

### Option B: Check Wallet Status via API

```bash
# Check Issuer Wallet
curl https://api.minepi.com/accounts/GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI

# Check Distributor Wallet
curl https://api.minepi.com/accounts/GCTPMH43NGN7E4IXLQ27H2XWGGWWDY3I6UAPBFXYQSEUPEKNQE2BZXC2
```

**If you see "Not Found"** → Wallet is NOT activated
**If you see account data** → Wallet IS activated ✅

---

## 🔄 After Wallet Activation

Once BOTH wallets are activated and funded:

```powershell
# Run the token minting script
cd token-setup
npm run mint
```

The script will:
1. ✅ Create trustline from Distributor → FLPY
2. ✅ Mint 21,000,000 FLPY tokens
3. ✅ Set home domain to flappypi2807.pinet.com
4. ✅ Display balances

---

## 📋 Wallet Activation Checklist

- [ ] Open Pi Wallet app
- [ ] Import Issuer wallet using secret key `SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I`
- [ ] Import Distributor wallet using secret key `SBS4OY37QMZ67U2WLWZQUUFUV2JOBKWCBFS7IZDOJV3NZPYC3OOZ4OIM`
- [ ] Activate BOTH wallets on Pi Mainnet
- [ ] Send at least 1 Pi to EACH wallet for transaction fees
- [ ] Verify wallets exist via API (no "Not Found" error)
- [ ] Run `npm run mint` to create token
- [ ] Deploy pi.toml to `https://flappypi2807.pinet.com/.well-known/pi.toml`
- [ ] Wait 24 hours for Pi Server to scan and verify
- [ ] Token appears in Pi Wallet!

---

## 🆘 Troubleshooting

### "Not Found" Error
- **Cause**: Wallet doesn't exist on blockchain yet
- **Fix**: Activate wallet in Pi Wallet app

### "Insufficient Balance" Error
- **Cause**: Wallet has no Pi for transaction fees
- **Fix**: Send at least 1 Pi to the wallet

### "Bad Sequence" Error
- **Cause**: Transaction sequence number mismatch
- **Fix**: Script automatically handles this by calling `loadAccount()`

### Token Not Appearing in Pi Wallet
- **Causes**:
  1. Home domain not set
  2. pi.toml file not deployed
  3. pi.toml file has errors
  4. Image not accessible via HTTPS
  5. Pi Server hasn't scanned yet (takes up to 24 hours)

- **Fixes**:
  1. Ensure home domain is set: `flappypi2807.pinet.com`
  2. Deploy `public/.well-known/pi.toml` to server
  3. Validate pi.toml has all required fields
  4. Ensure image URL is HTTPS and accessible
  5. Wait 24 hours for Pi Server scan

---

## 🔗 Useful Links

- **Check Issuer Account**: https://api.minepi.com/accounts/GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI
- **Check Distributor Account**: https://api.minepi.com/accounts/GCTPMH43NGN7E4IXLQ27H2XWGGWWDY3I6UAPBFXYQSEUPEKNQE2BZXC2
- **Check FLPY Token**: https://api.minepi.com/assets?asset_code=FLPY&asset_issuer=GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI
- **Pi Wallet**: https://wallet.minepi.com
- **Token Documentation**: https://github.com/pi-apps/pi-platform-docs/blob/master/tokens.md

---

## ⚡ Quick Command Reference

```powershell
# Check if wallets are activated
curl https://api.minepi.com/accounts/GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI
curl https://api.minepi.com/accounts/GCTPMH43NGN7E4IXLQ27H2XWGGWWDY3I6UAPBFXYQSEUPEKNQE2BZXC2

# After activation, mint the token
cd token-setup
npm run mint

# Verify token was created
npm run verify

# Check token on blockchain
curl "https://api.minepi.com/assets?asset_code=FLPY&asset_issuer=GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI"
```

---

## 🎯 Summary

**YOU MUST DO THIS FIRST:**
1. Open Pi Wallet app
2. Import BOTH wallets using their secret keys
3. Activate them on Pi Mainnet
4. Fund each wallet with at least 1 Pi
5. THEN run `npm run mint`

**Without wallet activation, token minting will always fail with "Not Found" error.**

---

**Status**: ⏸️ Waiting for wallet activation before proceeding
