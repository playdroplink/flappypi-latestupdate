# Complete Environment Setup Guide for Pi Network Authentication

## 🎯 **Copy and Paste This Complete .env File**

Create a new file called `.env` in your project root and copy the following content:

```env
# ========================================
# FLAPPY PI - ENVIRONMENT CONFIGURATION
# ========================================

# ========================================
# SUPABASE CONFIGURATION
# ========================================

# Supabase URL and Keys (Client-side - Vite)
VITE_SUPABASE_URL="https://ididprksbmbhigcxcxvt.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzE0MjIsImV4cCI6MjA2NzQwNzQyMn0.oaqH6N-aBs9eVPUhY6jYXfauPShALeKDe4sQGBv8g9Q"
VITE_SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgzMTQyMiwiZXhwIjoyMDY3NDA3NDIyfQ.tBuF56T_16xBhPfl7lSMJ2uDgAIqGGBUhRE7me_96XQ"

# Supabase Database Configuration (Server-side)
POSTGRES_URL="postgres://postgres.ididprksbmbhigcxcxvt:jtrriobt4G7Sr5VG@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
POSTGRES_USER="postgres"
POSTGRES_HOST="db.ididprksbmbhigcxcxvt.supabase.co"
POSTGRES_PASSWORD="jtrriobt4G7Sr5VG"
POSTGRES_DATABASE="postgres"
POSTGRES_PRISMA_URL="postgres://postgres.ididprksbmbhigcxcxvt:jtrriobt4G7Sr5VG@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://postgres.ididprksbmbhigcxcxvt:jtrriobt4G7Sr5VG@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Supabase JWT Secret
SUPABASE_JWT_SECRET="IlEbfOj6cuDqID3G/4ClWFgC32LmK7IMdORUtHXyUdlW6mJ3Tu3B4pojw5YA4uq1O/mF8rYolo7ZOf7CoJ93Xg=="

# ========================================
# PI NETWORK CONFIGURATION
# ========================================

# Pi Network API Configuration
PI_API_KEY="sxjxt4mkkargbinknb1ymrv9fs73ukp02av9zkz2vki9yrz22ghpsmjxgmhvdjtf"
PI_NETWORK_API_KEY="sxjxt4mkkargbinknb1ymrv9fs73ukp02av9zkz2vki9yrz22ghpsmjxgmhvdjtf"
PI_NETWORK_APP_ID="flappypi6856"

# Pi Network Environment Settings
PI_SANDBOX_MODE="true"
PI_NETWORK="testnet"
VITE_PI_NETWORK="testnet"

# Pi Network Server Configuration
VITE_PI_SERVER_API_KEY="sxjxt4mkkargbinknb1ymrv9fs73ukp02av9zkz2vki9yrz22ghpsmjxgmhvdjtf"
VITE_PI_APP_ID="flappypi6856"

# Pi Network API URLs
PI_API_URL="https://api.testnet.minepi.com/v2"
PI_NETWORK_API_URL="https://api.testnet.minepi.com/v2"

# Pi Network Validation Key
PI_VALIDATION_KEY="312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156"
VITE_PI_VALIDATION_KEY="312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156"

# Pi Network SDK Configuration
VITE_PI_SANDBOX="true"
VITE_PI_SDK_VERSION="2.0"

# ========================================
# APPLICATION CONFIGURATION
# ========================================

# Environment Settings
NODE_ENV="development"
FLAPPY_PI_ENV="development"
GAME_ENVIRONMENT="development"

# Feature Flags
ENABLE_ANALYTICS="true"
ENABLE_LEADERBOARD="true"
ENABLE_DEBUG="true"

# Server Configuration
PORT="8080"
APIKEY="your_api_key_here"

# ========================================
# DEPLOYMENT CONFIGURATION
# ========================================

# Vercel Configuration (if using Vercel)
VERCEL_GIT_COMMIT_TIMESTAMP=""
VERCEL_GIT_COMMIT_REF=""
VERCEL_GIT_COMMIT_SHA=""

# ========================================
# SECURITY CONFIGURATION
# ========================================

# CORS Origins (comma-separated)
ALLOWED_ORIGINS="https://flappypi.fun,https://flappypi6856.pinet.com,https://*.pinet.com,https://*.minepi.com,http://localhost:1113,https://localhost:1113"

# ========================================
# DEVELOPMENT CONFIGURATION
# ========================================

# Debug Settings
DEBUG_MODE="true"
FLAPPY_DEBUG="true"
FLAPPY_PI_DEBUG="true"
MUSIC_DEBUG="true"

# Development Server
DEV_SERVER_PORT="1113"
DEV_SERVER_HOST="true"

# ========================================
# AUDIO CONFIGURATION
# ========================================

# Audio Settings
AUDIO_ENABLED="true"
MUSIC_ENABLED="true"
SFX_ENABLED="true"

# ========================================
# GAME CONFIGURATION
# ========================================

# Game Settings
GAME_MODE="development"
TESTNET_MODE="true"
MAINNET_MODE="false"

# ========================================
# MONITORING AND ANALYTICS
# ========================================

# Analytics Configuration
ANALYTICS_ENABLED="true"
ERROR_TRACKING_ENABLED="true"
PERFORMANCE_MONITORING_ENABLED="true"
```

## 🚀 **Quick Setup Steps**

### **Step 1: Create .env File**
```bash
# In your project root directory
touch .env
```

### **Step 2: Copy Environment Variables**
Copy the entire content above and paste it into your `.env` file.

### **Step 3: Restart Development Server**
```bash
# Stop your current server (Ctrl+C)
# Then restart
npm run dev
# or
yarn dev
```

## 🔑 **Key Pi Network Variables Explained**

### **Essential Pi Network Variables:**
- `PI_API_KEY`: Your Pi Network API key for testnet
- `PI_NETWORK_APP_ID`: Your app ID (`flappypi6856`)
- `PI_VALIDATION_KEY`: Validation key for Pi Network verification
- `PI_SANDBOX_MODE`: Set to "true" for testnet development
- `VITE_PI_NETWORK`: Set to "testnet" for development

### **Client-Side Variables (Vite):**
- `VITE_PI_APP_ID`: App ID accessible in browser
- `VITE_PI_SERVER_API_KEY`: API key for client-side operations
- `VITE_PI_VALIDATION_KEY`: Validation key for client-side verification
- `VITE_PI_SANDBOX`: Sandbox mode for client-side SDK

## 🧪 **Testing Your Setup**

### **1. Environment Check**
After setting up your `.env` file, restart your development server and check:

```javascript
// In browser console
console.log('Pi Network Config:', {
  appId: import.meta.env.VITE_PI_APP_ID,
  network: import.meta.env.VITE_PI_NETWORK,
  sandbox: import.meta.env.VITE_PI_SANDBOX
});
```

### **2. Pi Auth Debug Page**
Navigate to `/pi-auth-debug` in your app to test Pi authentication.

### **3. Expected Results**
- ✅ Pi SDK Available: Yes
- ✅ Pi SDK Init Function: Yes
- ✅ Authentication: Success
- ✅ Token Verification: Success

## 🔧 **Troubleshooting**

### **If Pi Authentication Still Doesn't Work:**

1. **Check Environment Variables:**
   ```bash
   # Verify .env file exists
   ls -la .env
   
   # Check if variables are loaded
   echo $PI_NETWORK_APP_ID
   ```

2. **Restart Everything:**
   ```bash
   # Stop server
   Ctrl+C
   
   # Clear cache
   npm run clean
   
   # Restart
   npm run dev
   ```

3. **Check Pi Browser:**
   - Ensure you're using Pi Browser mobile app
   - Navigate to `https://flappypi6856.pinet.com`
   - Go to `/pi-auth-debug` page
   - Click "Test Pi Authentication"

## 📱 **Pi Browser Mobile Testing**

### **Complete Testing Flow:**

1. **Open Pi Browser mobile app**
2. **Navigate to:** `https://flappypi6856.pinet.com`
3. **Go to:** `/pi-auth-debug`
4. **Click:** "Test Pi Authentication"
5. **Check results:** All should show green checkmarks

### **Expected Console Logs:**
```
🚀 Initializing Pi SDK following demo.pi pattern...
✅ Pi SDK initialized successfully!
🔧 Mode: Testnet
🔐 Starting Pi authentication following demo.pi pattern...
✅ Pi.authenticate successful
🔍 Verifying with Pi Platform API...
✅ Pi Platform API verification successful
🎉 Pi authentication completed successfully!
```

## 🎯 **Production Setup**

When ready for production, change these variables:

```env
# Change to production values
PI_SANDBOX_MODE="false"
PI_NETWORK="mainnet"
VITE_PI_NETWORK="mainnet"
VITE_PI_SANDBOX="false"
NODE_ENV="production"
GAME_ENVIRONMENT="production"
DEBUG_MODE="false"
```

## ✅ **Verification Checklist**

- [ ] `.env` file created in project root
- [ ] All Pi Network variables copied correctly
- [ ] Development server restarted
- [ ] Pi Browser mobile app installed
- [ ] App accessible at `https://flappypi6856.pinet.com`
- [ ] Pi Auth Debug page working
- [ ] Authentication test passes
- [ ] Console shows successful initialization

## 🆘 **Still Having Issues?**

If Pi authentication still doesn't work after following this guide:

1. **Check Pi Developer Portal:**
   - Verify app ID: `flappypi6856`
   - Check network mode: Testnet
   - Confirm validation key is correct

2. **Test with Demo App:**
   - Open Pi Browser
   - Go to `https://demo.pi`
   - Test if Pi Browser is working correctly

3. **Check Network:**
   - Ensure stable internet connection
   - Try on different network if possible

4. **Contact Support:**
   - Use the debug information from `/pi-auth-debug`
   - Check browser console for specific error messages

---

**Remember:** Pi authentication only works in Pi Browser mobile app. Regular browsers will show fallback behavior for testing purposes.
