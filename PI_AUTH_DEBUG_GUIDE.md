# Pi Authentication Debug Guide

## 🔍 Debug Features Added

I've added comprehensive debugging to help identify and fix Pi authentication issues. Here's what's been implemented:

### 1. **Enhanced Console Logging**

#### AuthContext Debug Logs:
- `🔍 AuthContext - Starting authentication status check...`
- `🔍 AuthContext - localStorage data:` (shows all stored auth data)
- `🔍 AuthContext - Environment check:` (sandbox/PiNet detection)
- `🔍 AuthContext - Inspecting window.Pi object:` (detailed Pi SDK inspection)
- `🧪 AuthContext - Checking sandbox/PiNet Pi authentication...`
- `✅ AuthContext - Pi user authenticated:` (successful authentication)

#### HomePage Debug Logs:
- `🔍 HomePage getUserDisplay - Starting user display check...`
- `🧪 HomePage - Environment check:` (environment detection)
- `🔍 HomePage - window.Pi inspection:` (Pi SDK object analysis)
- `🧪 HomePage - Checking sandbox window.Pi directly...`
- `✅ HomePage - Using AuthContext user:` (username extraction success)

### 2. **Interactive Debug Panel**

A comprehensive debug panel accessible via the 🔍 button next to the username:

#### Features:
- **Real-time Status**: Shows authentication state, Pi auth status, username, and window.Pi availability
- **Environment Detection**: Displays hostname, sandbox/PiNet detection
- **window.Pi Inspection**: Shows all available methods and properties
- **localStorage Analysis**: Displays all stored authentication data
- **AuthContext State**: Shows current authentication context state
- **Raw Debug Data**: Complete JSON dump of all debug information

#### Actions:
- **Test window.Pi Methods**: Tests all available Pi SDK methods
- **Clear Auth Data**: Clears all stored authentication data
- **Refresh Data**: Updates all debug information
- **Copy Data**: Copies all debug data to clipboard

### 3. **Enhanced window.Pi Detection**

The system now checks multiple methods to find Pi user data:

1. **window.Pi.currentUser()** - Function call
2. **window.Pi.currentUser** - Property access
3. **window.Pi.user** - Direct user property
4. **Additional Properties**: Checks for `authenticatedUser`, `me`, `profile`

### 4. **Sandbox Environment Support**

Enhanced detection and handling for:
- `sandbox.minepi.com` environments
- `pinet.com` environments
- Direct `window.Pi` object inspection
- Multiple fallback methods for user detection

## 🚀 How to Use the Debug Features

### 1. **Access the Debug Panel**
- Look for the 🔍 button next to the username in the profile section
- Click it to open the comprehensive debug panel

### 2. **Check Console Logs**
- Open browser developer tools (F12)
- Look for debug messages starting with:
  - `🔍` - General debug information
  - `🧪` - Sandbox/PiNet specific checks
  - `✅` - Successful operations
  - `⚠️` - Warnings
  - `❌` - Errors

### 3. **Test Pi Authentication**
- Use the "Test window.Pi Methods" button in the debug panel
- This will test all available Pi SDK methods and log results

### 4. **Clear and Reset**
- Use "Clear Auth Data" to reset all stored authentication
- Use "Refresh" to update debug information
- Use "Copy All Data" to share debug information

## 🔧 Troubleshooting Common Issues

### Issue: "Guest User" instead of Pi username

**Debug Steps:**
1. Open debug panel (🔍 button)
2. Check "window.Pi Status" section
3. Look for `window.Pi` existence and available methods
4. Check "localStorage Data" for stored Pi user data
5. Use "Test window.Pi Methods" to test Pi SDK

**Common Causes:**
- `window.Pi` not available (not in Pi Browser)
- Pi user not authenticated in sandbox
- localStorage data corrupted
- Username extraction failing

### Issue: Authentication not persisting

**Debug Steps:**
1. Check localStorage data in debug panel
2. Verify `flappypi-pi-auth` is set to `'true'`
3. Check `flappypi-pi-user` contains valid user data
4. Use "Clear Auth Data" and re-authenticate

### Issue: Sandbox environment not detected

**Debug Steps:**
1. Check "Environment" section in debug panel
2. Verify hostname contains `sandbox.minepi.com`
3. Check if `window.Pi` exists and has expected methods
4. Look for sandbox-specific debug logs in console

## 📊 Debug Information Structure

The debug panel provides:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": {
    "hostname": "sandbox.minepi.com/app/...",
    "isSandbox": true,
    "isPiNet": false,
    "userAgent": "..."
  },
  "windowPi": {
    "exists": true,
    "type": "object",
    "keys": ["currentUser", "authenticate", "signIn", ...],
    "currentUserType": "function",
    "currentUserIsFunction": true,
    "currentUserIsObject": false,
    "userExists": true,
    "userType": "object",
    "hasAuthenticate": true,
    "hasSignIn": true
  },
  "localStorage": {
    "flappypiUsername": "username",
    "flappypiPassword": "***",
    "flappypiPiAuth": "true",
    "flappypiPiUser": "exists",
    "flappypiPiUserContent": { /* user object */ }
  },
  "authContext": {
    "isAuthenticated": true,
    "username": "username",
    "isPiAuth": true,
    "piUser": { /* user object */ }
  }
}
```

## 🎯 Next Steps for Debugging

1. **Open the app in sandbox environment**
2. **Click the 🔍 debug button** next to the username
3. **Check all sections** in the debug panel
4. **Use "Test window.Pi Methods"** to test Pi SDK
5. **Check console logs** for detailed debug information
6. **Share debug data** if issues persist

The debug system will help identify exactly where the Pi authentication is failing and provide the information needed to fix it.

## 🔄 Manual Refresh

If you need to manually refresh the authentication status:
- Click the 🔄 button next to the username
- This will trigger a manual sync and refresh
- Check console for refresh logs

## 📝 Debug Log Examples

### Successful Authentication:
```
🔍 AuthContext - Starting authentication status check...
🔍 AuthContext - localStorage data: { savedUsername: "username", piAuthStatus: true, ... }
✅ AuthContext - Pi user authenticated: username
🔍 HomePage getUserDisplay - Starting user display check...
✅ HomePage - Using AuthContext user: username
```

### Sandbox Detection:
```
🧪 AuthContext - Checking sandbox/PiNet Pi authentication...
🔍 AuthContext - Inspecting window.Pi object: { currentUserType: "function", ... }
🧪 window.Pi.currentUser() result: { uid: "123", username: "username" }
✅ AuthContext - Found Pi user in sandbox/PiNet: { uid: "123", username: "username" }
```

This comprehensive debug system should help identify and resolve any Pi authentication issues! 🎉
