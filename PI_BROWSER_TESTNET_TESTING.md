# Pi Browser Mobile Testnet Testing Guide

## 🎯 Goal
Test the Pi Network sign-in functionality in the actual Pi Browser mobile app on testnet, not just in the sandbox emulator.

## 📱 Prerequisites
1. **Pi Browser Mobile App** - Download from your device's app store
2. **Testnet Pi Account** - You need testnet Pi coins for testing
3. **Your App Deployed** - Your Flappy Pi app should be accessible via URL

## 🔧 Configuration Changes Made

### 1. Updated Pi Configuration (`src/config/piConfig.ts`)
- Added testnet mode detection for Pi Browser
- Supports both localStorage flag and URL parameter for testnet mode
- Auto-detects environment but allows manual override

### 2. Created Network Toggle Utility (`src/utils/piNetworkToggle.ts`)
- Easy switching between testnet and mainnet modes
- Visual notifications when mode changes
- Development toggle button (auto-added in dev mode)

### 3. Enhanced Header Component (`src/components/HeaderWithPiAuth.tsx`)
- Shows current network mode (TESTNET/MAINNET)
- Better environment detection and debugging info
- Improved Pi Browser detection

## 🚀 How to Test in Pi Browser Mobile

### Method 1: URL Parameter (Recommended)
1. **Enable Testnet Mode:**
   ```
   https://yourapp.com?testnet=true
   ```

2. **Disable Testnet Mode (Mainnet):**
   ```
   https://yourapp.com
   ```

### Method 2: LocalStorage Toggle
1. Open browser console in Pi Browser
2. Run these commands:
   ```javascript
   // Enable testnet
   localStorage.setItem('flappypi-testnet-mode', 'true');
   location.reload();
   
   // Disable testnet (mainnet)
   localStorage.removeItem('flappypi-testnet-mode');
   location.reload();
   ```

### Method 3: Development Toggle Button
- In development mode, a toggle button appears at bottom-right
- Click to switch between testnet and mainnet
- Automatically refreshes the page

## 📋 Testing Steps

### Step 1: Deploy Your App
```bash
npm run build
# Deploy to your hosting service (Vercel, Netlify, etc.)
```

### Step 2: Access in Pi Browser Mobile
1. Open Pi Browser on your mobile device
2. Navigate to your app URL with testnet parameter:
   ```
   https://yourapp.com?testnet=true
   ```

### Step 3: Verify Network Mode
- Check the header for "Network: TESTNET" indicator
- Verify API URL shows testnet endpoint
- Look for testnet mode confirmation in console

### Step 4: Test Sign-In
1. Click "Sign in with Pi" button
2. Complete Pi Network authentication
3. Verify user data is received correctly
4. Check that testnet Pi coins are used

## 🔍 Debug Information

### Console Logs to Look For
```
🧪 Pi Browser Testnet Mode: Enabled
🌍 Environment detected: { isMainnet: false, isTestnet: true, isSandbox: true, isPiBrowser: true }
🔧 Initializing Pi SDK with config: { version: "2.0", sandbox: true }
🌐 Network mode: testnet
🔗 API URL: https://api.testnet.minepi.com/v2
```

### Header Indicators
- **Network: TESTNET** - Yellow indicator
- **Network: MAINNET** - Green indicator
- **Pi Browser: Yes** - Green indicator
- **Pi SDK: Available** - Green indicator

## 🛠️ Troubleshooting

### Issue: Still Using Mainnet
**Solution:** 
- Check URL parameter: `?testnet=true`
- Clear localStorage: `localStorage.removeItem('flappypi-testnet-mode')`
- Refresh page

### Issue: Pi SDK Not Available
**Solution:**
- Ensure you're in Pi Browser (not regular browser)
- Check Pi Browser version is up to date
- Verify app is accessed via HTTPS

### Issue: Authentication Fails
**Solution:**
- Verify testnet mode is enabled
- Check console for API errors
- Ensure testnet Pi account has coins

## 📱 Pi Browser Mobile Specific Notes

### User Agent Detection
The app detects Pi Browser using:
```javascript
const isPiBrowser = /PiBrowser|Pi\//i.test(navigator.userAgent);
```

### Testnet Pi Coins
- Use testnet Pi coins for testing payments
- Testnet coins have no real value
- Perfect for testing payment flows

### Mobile Optimization
- Header is optimized for mobile screens
- Touch-friendly buttons and interactions
- Responsive design for various screen sizes

## 🔄 Switching Between Modes

### Quick Switch Commands
```javascript
// Enable testnet
localStorage.setItem('flappypi-testnet-mode', 'true');
location.reload();

// Enable mainnet
localStorage.removeItem('flappypi-testnet-mode');
location.reload();

// Check current mode
console.log('Current mode:', localStorage.getItem('flappypi-testnet-mode') === 'true' ? 'testnet' : 'mainnet');
```

## ✅ Success Indicators

When testnet mode is working correctly, you should see:
1. ✅ Header shows "Network: TESTNET"
2. ✅ Console logs show testnet mode enabled
3. ✅ API URL points to testnet endpoint
4. ✅ Pi authentication works with testnet account
5. ✅ Testnet Pi coins are used for payments

## 🎉 Ready to Test!

Your app is now configured to work with Pi Browser mobile on testnet. Follow the steps above to test the sign-in functionality in the actual Pi Browser mobile app.

**Remember:** Always test with testnet Pi coins first before going to mainnet!
