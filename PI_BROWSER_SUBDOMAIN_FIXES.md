# Pi Browser Subdomain Compatibility Fixes

This document outlines the comprehensive fixes implemented to resolve Pi Browser subdomain issues and ensure compatibility across different hosting environments.

## 🚀 Quick Start

### 1. Run Diagnostics
```bash
npm run diagnose
```
This will start the development server with enhanced Pi Browser diagnostics. Open your browser console to see detailed reports.

### 2. Test on Different Environments
- **Local Development**: `http://localhost:3000`
- **Custom Domain**: `https://flappypi.fun`
- **Pi Subdomain**: `https://flappypi8903.pinet.com`

## 🔧 Implemented Fixes

### 1. Enhanced CORS Configuration

**File**: `vite.config.ts`
- Added comprehensive CORS origins for all Pi domains
- Configured proper headers for Pi Browser compatibility
- Enabled credentials and preflight requests

```typescript
cors: {
  origin: [
    "http://localhost:3000",
    "https://localhost:3000", 
    "http://flappypi.fun",
    "https://flappypi.fun",
    "https://flappypi8903.pinet.com",
    "https://*.pinet.com",
    "https://*.minepi.com",
    "https://pinet.com",
    "https://minepi.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Pi-App-Id", "Pi-Validation-Key"]
}
```

### 2. Pi Browser Detection System

**File**: `src/utils/piBrowserDetection.ts`
- Comprehensive Pi Browser detection
- Subdomain-specific fixes
- Automatic SDK loading for subdomains
- iframe detection and handling

**Key Features**:
- Detects Pi Browser vs regular browser
- Identifies subdomain vs custom domain
- Applies environment-specific fixes
- Provides compatibility recommendations

### 3. Enhanced Server Configuration

**File**: `server.js`
- Proper MIME type handling
- Security headers for Pi Browser
- HTTPS support for production
- Pi Browser request logging

### 4. Comprehensive Debugging System

**File**: `src/utils/piBrowserDebugger.ts`
- Detailed diagnostic reports
- SDK functionality testing
- Network connectivity testing
- Environment-specific recommendations

## 🐛 Common Issues & Solutions

### Issue 1: CORS Errors on Subdomains
**Symptoms**: Network errors, blocked requests
**Solution**: Enhanced CORS configuration in `vite.config.ts`

### Issue 2: Pi SDK Not Loading
**Symptoms**: `window.Pi` is undefined
**Solution**: Automatic SDK loading in `piBrowserDetection.ts`

### Issue 3: SSL/HTTPS Issues
**Symptoms**: Mixed content errors, security warnings
**Solution**: HTTPS enforcement for subdomains

### Issue 4: iframe Restrictions
**Symptoms**: Features not working in embedded contexts
**Solution**: iframe detection and handling

### Issue 5: Cache Problems
**Symptoms**: Old versions loading, inconsistent behavior
**Solution**: Cache clearing and proper cache headers

## 🔍 Diagnostic Tools

### Console Commands
Open browser console and run:

```javascript
// Run comprehensive diagnostics
runPiBrowserDiagnostics()

// Generate detailed report
generatePiBrowserReport()

// Test Pi SDK functionality
testPiSDK()

// Test network connectivity
testNetworkConnectivity()
```

### Diagnostic Report Example
```
🔍 Pi Browser Diagnostic Report
================================

Environment: pinet-subdomain
Pi Browser: Yes
Subdomain: Yes
SSL: Yes
SDK Loaded: Yes
In iframe: No
Hostname: flappypi8903.pinet.com
Protocol: https:

❌ CRITICAL ISSUES:
  • None detected

⚠️ WARNINGS:
  • Pi Browser on subdomain - applying compatibility mode
  • Subdomain may have cache issues

💡 RECOMMENDATIONS:
  • Test on custom domain (flappypi.fun) for comparison
  • Contact Pi Core Team for subdomain verification
  • Use Pi Browser developer tools for debugging
```

## 🚀 Deployment Checklist

### For Custom Domain (Recommended)
1. ✅ SSL certificate installed
2. ✅ CORS headers configured
3. ✅ Pi SDK properly loaded
4. ✅ Service worker configured (if used)
5. ✅ Cache headers set correctly

### For Pi Subdomain
1. ✅ Enhanced CORS configuration
2. ✅ Automatic SDK loading
3. ✅ iframe compatibility
4. ✅ Cache management
5. ✅ Error handling

## 🔧 Configuration Files

### Vite Configuration (`vite.config.ts`)
- CORS settings for all Pi domains
- Build optimizations for mobile
- Enhanced headers for Pi Browser

### Server Configuration (`server.js`)
- Express server with Pi Browser support
- HTTPS configuration
- Proper MIME types
- Security headers

### Pi Browser Detection (`src/utils/piBrowserDetection.ts`)
- Environment detection
- Automatic fixes
- Compatibility recommendations

### Debugging System (`src/utils/piBrowserDebugger.ts`)
- Comprehensive diagnostics
- Testing utilities
- Detailed reporting

## 📱 Pi Browser Specific Optimizations

### Mobile Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no" />
```

### Touch Handling
```javascript
// Prevent pull-to-refresh
document.addEventListener('touchmove', function(e) {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);
```

### Loading Indicators
- Enhanced loading states for Pi Browser
- Proper fade-out animations
- Error handling for loading failures

## 🛠️ Troubleshooting

### If Game Doesn't Load on Subdomain

1. **Check Console Errors**
   ```bash
   npm run diagnose
   ```
   Open browser console and look for errors

2. **Test Network Connectivity**
   ```javascript
   testNetworkConnectivity().then(result => console.log(result))
   ```

3. **Verify Pi SDK**
   ```javascript
   console.log('Pi SDK available:', typeof window.Pi !== 'undefined')
   ```

4. **Check CORS Headers**
   - Open Network tab in DevTools
   - Look for CORS errors in red
   - Verify Access-Control-Allow-Origin headers

### If Pi SDK Not Loading

1. **Manual SDK Loading**
   ```javascript
   // Add to index.html if automatic loading fails
   <script src="https://sdk.minepi.com/pi-sdk.js"></script>
   ```

2. **Check Script Loading Order**
   - Pi SDK must load before your app
   - Ensure no blocking scripts

3. **Verify Domain Whitelist**
   - Contact Pi Core Team for subdomain verification
   - Check if domain is in Pi's whitelist

### If HTTPS Issues

1. **Force HTTPS Redirect**
   ```javascript
   if (window.location.protocol === 'http:' && window.location.hostname.includes('.pinet.com')) {
     window.location.href = window.location.href.replace('http:', 'https:');
   }
   ```

2. **Check SSL Certificate**
   - Use SSL checker tools
   - Verify certificate is valid for subdomain

## 📊 Performance Monitoring

### Key Metrics to Monitor
- SDK loading time
- Network request success rate
- CORS error frequency
- Cache hit rates
- User experience on different environments

### Recommended Tools
- Pi Browser developer tools
- Browser console logging
- Network tab monitoring
- Performance profiling

## 🔄 Continuous Improvement

### Regular Testing
1. Test on all environments weekly
2. Monitor console for new errors
3. Update CORS origins as needed
4. Verify Pi SDK compatibility

### Updates
- Keep Pi SDK version updated
- Monitor Pi Browser changes
- Update compatibility fixes as needed
- Test new Pi Browser features

## 📞 Support

### For Pi Browser Issues
- Use diagnostic tools provided
- Check console for detailed error reports
- Test on custom domain for comparison
- Contact Pi Core Team for subdomain issues

### For General Issues
- Check browser console for errors
- Verify network connectivity
- Test on different devices/browsers
- Review deployment configuration

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Compatibility**: Pi Browser 2.0+, Pi SDK 2.0+ 