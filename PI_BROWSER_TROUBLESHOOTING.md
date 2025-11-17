# Pi Browser Troubleshooting Guide

## 🚨 **Common Pi Browser Issues & Solutions**

### **Issue 1: App Not Loading in Pi Browser**

**Symptoms:**
- White screen or loading spinner
- "Refused to display" errors
- App doesn't appear in Pi Browser

**Solutions:**
1. **Check App URL Configuration:**
   - Go to Pi Developer Portal
   - Ensure app URL is: `https://flappypiofficial-gsiesfbgc-flappypis-projects.vercel.app`
   - Save changes

2. **Verify Validation Key:**
   - Test: `https://flappypiofficial-gsiesfbgc-flappypis-projects.vercel.app/validation-key.txt`
   - Should return: `312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156`

3. **Check Pi Browser Permissions:**
   - Ensure app is approved in Pi Browser
   - Check if app appears in Pi Browser app list

### **Issue 2: Pi SDK Not Working**

**Symptoms:**
- `window.Pi` is undefined
- Authentication not working
- Payment features not available

**Solutions:**
1. **Verify Pi SDK Loading:**
   ```javascript
   console.log('Pi SDK available:', typeof window.Pi !== 'undefined');
   ```

2. **Check SDK Initialization:**
   ```javascript
   if (typeof window.Pi !== 'undefined') {
     console.log('Pi SDK loaded successfully');
   } else {
     console.error('Pi SDK not loaded');
   }
   ```

3. **Test in Pi Browser Environment:**
   - Must be running in actual Pi Browser
   - Won't work in regular browser

### **Issue 3: CORS/Network Errors**

**Symptoms:**
- Network request failures
- CORS policy errors
- API calls failing

**Solutions:**
1. **Use HTTPS URLs Only:**
   - All URLs must be HTTPS
   - No localhost in production

2. **Check API Endpoints:**
   - Verify API URLs are correct
   - Ensure proper authentication headers

3. **Test Network Connectivity:**
   ```javascript
   fetch('https://api.mainnet.minepi.com/v2/health')
     .then(response => console.log('API accessible'))
     .catch(error => console.error('API error:', error));
   ```

### **Issue 4: iframe/Sandbox Issues**

**Symptoms:**
- X-Frame-Options errors
- Sandbox restrictions
- Content not displaying

**Solutions:**
1. **Headers Fixed:**
   - Removed X-Frame-Options blocking
   - Set proper CORS headers
   - Enabled iframe embedding

2. **Test Sandbox:**
   - URL: `https://sandbox.minepi.com/app/flappy-pi-3dfd6fe64b0ba638`
   - Should load without errors

### **Issue 5: Performance Issues**

**Symptoms:**
- Slow loading
- Laggy gameplay
- Memory issues

**Solutions:**
1. **Optimize Bundle Size:**
   - Code splitting implemented
   - Lazy loading for components
   - Compressed assets

2. **Mobile Optimizations:**
   - Touch handling improved
   - Viewport settings optimized
   - Performance monitoring

## 🔧 **Quick Fixes**

### **For Immediate Testing:**

1. **Test Deployed App:**
   ```
   https://flappypiofficial-gsiesfbgc-flappypis-projects.vercel.app
   ```

2. **Test Validation:**
   ```
   https://flappypiofficial-gsiesfbgc-flappypis-projects.vercel.app/validation-key.txt
   ```

3. **Test Sandbox:**
   ```
   https://sandbox.minepi.com/app/flappy-pi-3dfd6fe64b0ba638
   ```

### **Console Commands for Debugging:**

```javascript
// Check Pi Browser detection
console.log('Pi Browser:', navigator.userAgent.includes('Pi Browser'));

// Check Pi SDK
console.log('Pi SDK:', typeof window.Pi !== 'undefined');

// Check network connectivity
fetch('https://api.mainnet.minepi.com/v2/health')
  .then(r => console.log('Network OK'))
  .catch(e => console.log('Network Error:', e));

// Check app environment
console.log('URL:', window.location.href);
console.log('Hostname:', window.location.hostname);
```

## 📱 **Pi Browser Specific Issues**

### **Mobile Viewport Issues:**
- Fixed viewport settings
- Touch event handling
- Prevent zoom/scroll

### **Pi SDK Integration:**
- Authentication flow
- Payment processing
- User data access

### **Performance in Pi Browser:**
- Memory management
- Asset loading
- Frame rate optimization

## 🚀 **Deployment Checklist**

### **Before Testing:**
- [ ] App deployed to HTTPS URL
- [ ] Validation key accessible
- [ ] Headers configured correctly
- [ ] Pi SDK integration working

### **After Testing:**
- [ ] App loads in Pi Browser
- [ ] No console errors
- [ ] Pi SDK functions work
- [ ] Game is playable

## 🔍 **Debugging Steps**

1. **Check Console Errors:**
   - Open Pi Browser developer tools
   - Look for red error messages
   - Check network tab for failed requests

2. **Verify App Configuration:**
   - Confirm app URL in Pi Developer Portal
   - Check validation key matches
   - Ensure app is approved

3. **Test Different Environments:**
   - Pi Browser sandbox
   - Pi Browser production
   - Regular browser (for comparison)

4. **Monitor Performance:**
   - Check loading times
   - Monitor memory usage
   - Test on different devices

## 📞 **Support Resources**

### **Pi Network Resources:**
- Pi Developer Portal
- Pi Browser documentation
- Pi SDK documentation

### **Technical Support:**
- Check Pi Browser console logs
- Test validation URLs
- Verify network connectivity

---

**Last Updated:** December 2024  
**Status:** Ready for testing 