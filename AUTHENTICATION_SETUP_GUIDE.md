# Flappy Pi Authentication Setup Guide

## Overview

This guide explains how to configure authentication restrictions for Flappy Pi to ensure only Pi Browser users with proper Pi Network authentication can access the game.

## Quick Setup

### 1. **Enable Strict Authentication (Production)**

Set environment variables in your `.env` file:

```bash
# Production - Strict Pi Browser + Pi Auth Required
NODE_ENV=production
REACT_APP_BYPASS_AUTH=false
REACT_APP_DEBUG_AUTH=false
```

### 2. **Enable Development Mode (Relaxed)**

```bash
# Development - No restrictions for testing
NODE_ENV=development
REACT_APP_BYPASS_AUTH=true
REACT_APP_DEBUG_AUTH=true
```

### 3. **Enable Testing Mode (No Restrictions)**

```bash
# Testing - No restrictions at all
NODE_ENV=test
REACT_APP_BYPASS_AUTH=true
REACT_APP_DEBUG_AUTH=true
```

## Configuration Modes

### **Production Mode (Strict)**
- ✅ Requires Pi Browser
- ✅ Requires Pi Network authentication
- ❌ No local authentication
- ❌ No debug logging
- ✅ Feature restrictions enabled

### **Development Mode (Relaxed)**
- ❌ No Pi Browser requirement
- ❌ No Pi authentication requirement
- ✅ Local authentication allowed
- ✅ Debug logging enabled
- ❌ No feature restrictions

### **Testing Mode (Open)**
- ❌ No browser restrictions
- ❌ No authentication restrictions
- ✅ All features available
- ✅ Debug logging enabled

## Environment Variables

| Variable | Description | Default | Values |
|----------|-------------|---------|--------|
| `NODE_ENV` | Environment mode | `development` | `production`, `development`, `test` |
| `REACT_APP_BYPASS_AUTH` | Bypass all auth restrictions | `false` | `true`, `false` |
| `REACT_APP_DEBUG_AUTH` | Enable auth debug logging | `false` | `true`, `false` |

## Authentication Flow

### **1. Browser Detection**
The app first checks if the user is in Pi Browser:
- User Agent detection
- Pi SDK availability
- Pi Network domain detection
- PiNet environment detection

### **2. Authentication Check**
If Pi Browser is detected, the app checks authentication:
- Pi Network authentication status
- Session validity
- User data verification

### **3. Access Control**
Based on configuration:
- **Strict Mode**: Only authenticated Pi Browser users
- **Relaxed Mode**: Any browser, any authentication
- **Testing Mode**: No restrictions

## Component Architecture

### **PiBrowserOnly Component**
- Wraps the entire app
- Checks browser environment
- Shows restriction page for non-Pi browsers
- Uses `authConfig.ts` for configuration

### **PiAuthGuard Component**
- Protects individual routes
- Checks authentication status
- Redirects to login if needed
- Handles authentication errors

### **PiAuthLogin Component**
- Handles Pi Network authentication
- Shows login interface
- Manages authentication flow

## Feature Restrictions

When authentication is enabled, these features are restricted:

### **Payment Features**
- Pi cryptocurrency payments
- In-app purchases
- Payment history

### **Social Features**
- Leaderboards
- Community features
- User profiles

### **Ad Features**
- Banner ads
- Rewarded ads
- Ad-free subscriptions

## Testing Authentication

### **1. Test Pi Browser Detection**
```javascript
// In browser console
console.log(window.Pi); // Should be defined in Pi Browser
console.log(navigator.userAgent); // Should contain Pi Browser indicators
```

### **2. Test Authentication Status**
```javascript
// Check localStorage for auth data
console.log(localStorage.getItem('flappypi-pi-auth'));
console.log(localStorage.getItem('flappypi-pi-user'));
```

### **3. Test Configuration**
```javascript
// Check current auth configuration
import { authConfig } from './src/config/authConfig';
console.log(authConfig);
```

## Troubleshooting

### **Common Issues**

#### **1. Infinite Redirect Loop**
**Problem**: App keeps redirecting to login page
**Solution**: Check if `location.pathname !== '/pi-browser-login'` condition is working

#### **2. Pi Browser Not Detected**
**Problem**: Pi Browser users see restriction page
**Solution**: 
- Check browser detection logic in `piBrowserDetection.ts`
- Verify Pi SDK is loaded
- Check user agent string

#### **3. Authentication Not Persisting**
**Problem**: Users need to login repeatedly
**Solution**:
- Check localStorage permissions
- Verify session timeout settings
- Check authentication context

#### **4. Development Mode Not Working**
**Problem**: Restrictions still active in development
**Solution**:
- Verify `NODE_ENV=development`
- Set `REACT_APP_BYPASS_AUTH=true`
- Restart development server

### **Debug Mode**

Enable debug logging to troubleshoot:

```bash
REACT_APP_DEBUG_AUTH=true
```

This will show detailed authentication logs in the console.

## Security Considerations

### **1. Client-Side Limitations**
- Authentication checks are client-side
- Users can bypass with browser dev tools
- Server-side validation is recommended for production

### **2. Pi Network Integration**
- Pi SDK provides secure authentication
- Access tokens should be validated server-side
- Implement proper session management

### **3. Environment Variables**
- Don't commit sensitive config to version control
- Use `.env.local` for local development
- Use proper environment variable management in production

## Deployment Checklist

### **Before Production Deployment**

- [ ] Set `NODE_ENV=production`
- [ ] Set `REACT_APP_BYPASS_AUTH=false`
- [ ] Set `REACT_APP_DEBUG_AUTH=false`
- [ ] Test Pi Browser detection
- [ ] Test authentication flow
- [ ] Verify feature restrictions
- [ ] Test error handling
- [ ] Check console for errors

### **Production Environment Variables**

```bash
# Production .env
NODE_ENV=production
REACT_APP_BYPASS_AUTH=false
REACT_APP_DEBUG_AUTH=false
```

## Support

For issues with authentication setup:

1. Check the browser console for error messages
2. Verify environment variables are set correctly
3. Test in different browsers and environments
4. Review the authentication configuration in `src/config/authConfig.ts`
5. Check Pi Network SDK documentation for updates

## Related Files

- `src/config/authConfig.ts` - Authentication configuration
- `src/components/PiBrowserOnly.tsx` - Browser restriction component
- `src/components/PiAuthGuard.tsx` - Authentication guard component
- `src/components/PiAuthLogin.tsx` - Login component
- `src/utils/piBrowserDetection.ts` - Browser detection utility
- `src/context/AuthContext.tsx` - Authentication context
