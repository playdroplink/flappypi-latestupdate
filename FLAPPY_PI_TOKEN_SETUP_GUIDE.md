# Flappy Pi Token (FLPY) - Testnet Setup Guide

## Overview
This guide explains how to set up the Flappy Pi Token (FLPY) on Pi Network testnet using the provided credentials and scripts.

## Token Information
- **Token Code**: FLPY
- **Token Name**: Flappy Pi Team
- **Total Supply**: 21,000,000 FLPY
- **Description**: This is a test token that is created as an example and has no value.
- **Home Domain**: flappypi.fun

## Credentials Configured

### Issuer Account
- **Issuer Seed**: `SC2CB5I5N57AEW3MOY7WAGDBHGQNTB3A4QZ5F4RSBNXMC7QELWJJFNA`
- **Issuer Address**: Derived from the seed above

### Distribution Accounts
- **Distribution Seed**: `SDILUY6GMPHBZFYXJ64P5DK2TPZFNCLEZKHFFS423RACFLKORGP3DPGJ`
- **Wallet Address 1**: `GB6ZRJPW2Q64OCKJA5L2FY4K52PUIIQFCSXMN2FZ3HS4QGYP34TT6G75`
- **Wallet Address 2**: `GBV3KOBDQYKFYMOQJVFNY5HLQFX55EZXWYUM6VUS4FJWSS5ECCF4FQP7`

### API Configuration
- **API Key**: `v6tcjmgc1ls1zheaxx3uczprqhuwvdw55sqthevgfvrta5om7l23hyldj6iuie9w`
- **Validation Key**: `312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156`

## Files Updated

### 1. Environment Configuration (`.env`)
All token-related environment variables have been added:
- `FLPY_TOKEN_CODE="FLPY"`
- `FLPY_TOKEN_ISSUER="SC2CB5I5N57AEW3MOY7WAGDBHGQNTB3A4QZ5F4RSBNXMC7QELWJJFNA"`
- `FLPY_DISTRIBUTION_SEED="SDILUY6GMPHBZFYXJ64P5DK2TPZFNCLEZKHFFS423RACFLKORGP3DPGJ"`
- And many more configuration options

### 2. Pi Network TOML File (`public/.well-known/pi.toml`)
Updated with correct token information:
```toml
[[CURRENCIES]]
code="FLPY"
issuer="SC2CB5I5N57AEW3MOY7WAGDBHGQNTB3A4QZ5F4RSBNXMC7QELWJJFNA"
name="Flappy Pi Team"
desc="This is a test token that is created as an example and has no value."
image="https://flappypi.fun/image.png"
```

### 3. Setup Scripts Created

#### `setup-flappy-pi-token.cjs`
A simple Node.js script that sets the home domain for the issuer account:
```bash
node setup-flappy-pi-token.cjs
```

#### `flappy-pi-token-setup.js`
A comprehensive ES module script with full token creation capabilities:
```bash
node flappy-pi-token-setup.js
```

## Setup Process

### Prerequisites
1. Ensure the issuer and distribution accounts exist on Stellar testnet
2. Fund the accounts with XLM for transaction fees
3. Install required dependencies: `npm install @stellar/stellar-sdk`

### Running the Setup

1. **Quick Setup** (Home Domain Only):
   ```bash
   node setup-flappy-pi-token.cjs
   ```

2. **Full Setup** (Complete Token Creation):
   ```bash
   node flappy-pi-token-setup.js
   ```

3. **Check Account Information**:
   ```bash
   node flappy-pi-token-setup.js --info
   ```

## Pi Network Integration

### TOML Validation
The token configuration is available at:
```
https://flappypi.fun/.well-known/pi.toml
```

### API Links
As mentioned in the Pi Platform docs, the API response includes:
```json
{
  "_links": {
    "toml": {
      "href": "https://flappypi.fun/.well-known/pi.toml"
    }
  }
}
```

## Environment Variables Reference

### Token Configuration
- `FLPY_TOKEN_CODE`: Token symbol (FLPY)
- `FLPY_TOKEN_ISSUER`: Issuer account address
- `FLPY_TOKEN_AMOUNT`: Total supply (21,000,000)
- `FLPY_HOME_DOMAIN`: Domain for TOML file (flappypi.fun)

### React App Variables
All React app variables are prefixed with `REACT_APP_FLPY_`:
- `REACT_APP_FLPY_TOKEN_CODE`
- `REACT_APP_FLPY_TOKEN_ISSUER`
- `REACT_APP_FLPY_TOKEN_AMOUNT`
- `REACT_APP_FLPY_HOME_DOMAIN`

## Security Notes

⚠️ **Important**: The seeds and private keys in this configuration are for testnet only and should never be used in production.

- Distribution Seed: Keep secure, controls token distribution
- Issuer Seed: Keep secure, controls token minting
- API Key: Used for Pi Network API access
- Validation Key: Used for Pi Network domain validation

## Next Steps

1. Run the setup script to configure the issuer account
2. Test token transactions on testnet
3. Verify the pi.toml file is accessible
4. Integrate token functionality into the Flappy Pi game
5. Test payment flows with FLPY tokens

## Troubleshooting

### Common Issues
1. **Account not found**: Ensure accounts are funded on testnet
2. **Transaction failed**: Check account sequence numbers
3. **TOML not accessible**: Verify domain configuration

### Useful Commands
```bash
# Check account balances
node flappy-pi-token-setup.js --info

# Test pi.toml accessibility
curl https://flappypi.fun/.well-known/pi.toml

# Verify Stellar account
curl "https://horizon-testnet.stellar.org/accounts/[ACCOUNT_ID]"
```

## Documentation References
- [Pi Platform Token Docs](https://github.com/pi-apps/pi-platform-docs/blob/master/tokens.md)
- [Stellar SDK Documentation](https://stellar.github.io/js-stellar-sdk/)
- [Pi Network Developer Portal](https://develop.pi)