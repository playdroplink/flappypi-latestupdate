# FPT (Flappy Pi Token) Testnet Setup Guide

This guide will help you create and distribute the FPT (Flappy Pi Token) on the Pi Testnet using the Stellar SDK.

## 🎯 Overview

The FPT token is designed for the Flappy Pi game ecosystem on Pi Testnet. This setup creates a custom asset that can be used for in-game transactions, rewards, and other game mechanics.

## 📋 Prerequisites

1. **Python 3.7+** installed on your system
2. **Two Pi Testnet accounts** with XLM (Lumens) for transaction fees
3. **Secret keys** for both accounts (keep these secure!)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Get Your Pi Testnet Accounts

You need two accounts on Pi Testnet:

1. **Issuer Account** - Creates and controls the FPT token
2. **Distributor Account** - Receives the initial FPT supply

#### Option A: Using Pi Browser
1. Open Pi Browser
2. Go to Pi Testnet (testnet.minepi.com)
3. Create two accounts and fund them with test XLM
4. Get the secret keys for both accounts

#### Option B: Using Pi SDK
```javascript
// Example for getting testnet accounts
const { Pi } = window;
const account = await Pi.createAccount();
console.log("Public Key:", account.publicKey);
console.log("Secret Key:", account.secretKey);
```

### 3. Configure the Script

Edit `create_fpt_token.py` and replace the placeholder keys:

```python
# Replace these with your actual secret keys
issuer_secret = "YOUR_ISSUER_SECRET_KEY_HERE"
dist_secret   = "YOUR_DISTRIBUTOR_SECRET_KEY_HERE"
```

### 4. Run the Script

```bash
python create_fpt_token.py
```

## ⚙️ Configuration Options

You can customize the FPT token by modifying these parameters in `create_fpt_token.py`:

```python
ASSET_CODE = "FPT"              # Token symbol
TOTAL_SUPPLY = "1000000"        # Initial supply (1 million FPT)
TRUSTLINE_LIMIT = "1000000000"   # Max tokens distributor can hold
```

## 📊 Token Details

- **Asset Code**: FPT (Flappy Pi Token)
- **Initial Supply**: 1,000,000 FPT
- **Network**: Pi Testnet
- **Issuer**: Your issuer account
- **Distributor**: Your distributor account

## 🔄 How It Works

1. **Trustline Creation**: The distributor account creates a trustline to accept FPT tokens
2. **Token Distribution**: The issuer sends the initial supply to the distributor
3. **Verification**: Balances are checked and displayed

## 🛠️ Advanced Usage

### Minting Additional Tokens

To create more FPT tokens, simply send additional FPT from the issuer to any account that has a trustline:

```python
# Example: Send 1000 more FPT to distributor
builder = TransactionBuilder(
    source_account=issuer_acct,
    network_passphrase=NETWORK_PASSPHRASE,
    base_fee=BASE_FEE,
).append_payment_op(
    destination=dist_pub,
    amount="1000",
    asset=Asset("FPT", issuer_pub)
)
```

### Checking Token Balances

```python
# Check any account's FPT balance
account = server.load_account("ACCOUNT_PUBLIC_KEY")
for balance in account["balances"]:
    if balance.get("asset_code") == "FPT":
        print(f"FPT Balance: {balance['balance']}")
```

## 🔍 Verification

After running the script, you can verify the token creation by:

1. **Pi Testnet Explorer**: Visit `https://testnet.minepi.com/account/YOUR_ISSUER_PUBLIC_KEY`
2. **Check Balances**: The script will display final balances
3. **Test Transactions**: Try sending FPT between accounts

## 🚨 Troubleshooting

### Common Issues

1. **"Account not found"**
   - Ensure both accounts are created and funded on Pi Testnet
   - Check that you're using the correct network (testnet, not mainnet)

2. **"BadRequestError"**
   - Verify your secret keys are correct
   - Ensure accounts have enough XLM for transaction fees

3. **"Connection error"**
   - Check your internet connection
   - Verify the Pi Testnet Horizon server is accessible

### Getting Help

- Check the [Pi Network Documentation](https://developers.minepi.com/)
- Join the [Pi Developer Community](https://developers.minepi.com/community)
- Review Stellar SDK documentation for advanced features

## 🔐 Security Notes

- **Never share your secret keys** with anyone
- **Use testnet only** for development and testing
- **Keep backups** of your account information
- **Test thoroughly** before any mainnet deployment

## 📈 Next Steps

After creating the FPT token:

1. **Integrate with Flappy Pi Game**: Use the token for in-game rewards
2. **Set up Payment Flows**: Implement token transactions in your game
3. **Create Token Economics**: Design the token's utility and value
4. **Test Extensively**: Ensure all functionality works as expected

## 🎮 Game Integration

The FPT token can be integrated into your Flappy Pi game for:

- **Player Rewards**: Give FPT for high scores
- **Power-ups**: Purchase game enhancements with FPT
- **Tournaments**: Entry fees and prizes in FPT
- **Achievements**: Special FPT rewards for milestones

## 📝 License

This setup is provided as-is for educational and development purposes. Please ensure compliance with Pi Network's terms of service and applicable regulations.

---

**Happy Token Creation! 🚀**

For questions or support, refer to the Pi Network developer documentation or community forums.
