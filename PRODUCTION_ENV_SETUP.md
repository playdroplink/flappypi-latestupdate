# 🚀 PRODUCTION ENVIRONMENT SETUP

## 🎯 **Environment Variables You Need to Use:**

### **📁 File to Use: `mainnet.env`**

This is your **PRODUCTION MAINNET** environment file with all the correct settings for real Pi payments.

## 🔧 **Critical Environment Variables:**

### **1. Pi Network Configuration:** ✅
```env
# Pi Network API Configuration - MAINNET
PI_API_KEY="rppe8zs82vn2kmksqmkopg1yiqzqxs0vgcmzbo5e6hqc3zfn5qeexzygbjqn3yd3"
PI_NETWORK_API_KEY="rppe8zs82vn2kmksqmkopg1yiqzqxs0vgcmzbo5e6hqc3zfn5qeexzygbjqn3yd3"
PI_NETWORK_APP_ID="flappypi2807"

# Pi Network Environment Settings - MAINNET
PI_SANDBOX_MODE="false"
PI_NETWORK="mainnet"
VITE_PI_NETWORK="mainnet"
SANDBOX_MODE="false"

# Pi Network API URLs - MAINNET
PI_API_URL="https://api.minepi.com"
PI_NETWORK_API_URL="https://api.minepi.com"
```

### **2. Wallet Configuration:** ✅
```env
# Pi Network Wallet Configuration - MAINNET
PI_WALLET_ADDRESS="GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ"
TRUTHWEB_WALLET_ADDRESS="GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ"
MERCHANT_WALLET_ADDRESS="GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ"
```

### **3. React App Configuration:** ✅
```env
# React App Environment Variables
REACT_APP_PI_APP_ID="flappypi2807"
REACT_APP_PI_API_KEY="rppe8zs82vn2kmksqmkopg1yiqzqxs0vgcmzbo5e6hqc3zfn5qeexzygbjqn3yd3"
REACT_APP_PI_VALIDATION_KEY="94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce"
REACT_APP_PI_NETWORK_MODE="mainnet"
REACT_APP_PI_NETWORK_SANDBOX="false"
REACT_APP_PI_SDK_SANDBOX="false"
REACT_APP_SANDBOX_SDK="false"
REACT_APP_API_URL="https://api.minepi.com"
REACT_APP_CUSTOM_DOMAIN="flappypi.fun"
REACT_APP_BASE_URL="https://flappypi.fun"
REACT_APP_WALLET_ADDRESS="GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ"
```

### **4. Game Configuration:** ✅
```env
# Game Settings - MAINNET
GAME_MODE="mainnet"
TESTNET_MODE="false"
MAINNET_MODE="true"
SANDBOX_MODE="false"

# Environment Settings - MAINNET
NODE_ENV="production"
FLAPPY_PI_ENV="production"
GAME_ENVIRONMENT="production"
```

### **5. Supabase Configuration:** ✅
```env
# Supabase URL and Keys (Client-side - Vite)
VITE_SUPABASE_URL="https://ididprksbmbhigcxcxvt.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzE0MjIsImV4cCI6MjA2NzQwNzQyMn0.oaqH6N-aBs9eVPUhY6jYXfauPShALeKDe4sQGBv8g9Q"
```

## 🚀 **How to Use This Environment:**

### **Option 1: Rename the File**
```bash
# Rename mainnet.env to .env
mv mainnet.env .env
```

### **Option 2: Copy Contents**
```bash
# Copy mainnet.env to .env
cp mainnet.env .env
```

### **Option 3: Use Directly**
```bash
# Use mainnet.env directly
npm run build --env-file=mainnet.env
```

## 🔍 **Key Settings Confirmed:**

### **✅ Mainnet Mode:**
- `PI_SANDBOX_MODE="false"`
- `PI_NETWORK="mainnet"`
- `SANDBOX_MODE="false"`
- `MAINNET_MODE="true"`

### **✅ Real Pi Network:**
- `PI_API_URL="https://api.minepi.com"`
- `PI_NETWORK_API_URL="https://api.minepi.com"`
- `REACT_APP_API_URL="https://api.minepi.com"`

### **✅ Your Wallet:**
- `PI_WALLET_ADDRESS="GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ"`
- `REACT_APP_WALLET_ADDRESS="GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ"`

### **✅ Production Settings:**
- `NODE_ENV="production"`
- `FLAPPY_PI_ENV="production"`
- `GAME_ENVIRONMENT="production"`

## 🎯 **Summary:**

**Use the `mainnet.env` file** - it contains all the correct environment variables for:

- ✅ **Real Pi Network mainnet payments**
- ✅ **Your wallet address for receiving payments**
- ✅ **Production settings**
- ✅ **Supabase database configuration**
- ✅ **Pi Ad Network configuration**
- ✅ **All security settings**

**This environment file will make your Flappy Pi app work with REAL PI payments!**

---
**Status**: ✅ **CONFIRMED** - Use `mainnet.env` for production
