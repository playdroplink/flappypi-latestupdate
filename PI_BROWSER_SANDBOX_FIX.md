# Pi Browser Sandbox Fix Guide

## 🚨 **Problem**
Pi Browser sandbox cannot access localhost URLs. The error:
```
Refused to display 'http://localhost:3000/' in a frame because it set 'X-Frame-Options' to 'sameorigin'
```

## ✅ **Solutions**

### **Solution 1: Deploy to Public URL (Recommended)**

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Get your public URL** (e.g., `https://flappy-pi-xyz.vercel.app`)

4. **Update Pi App Configuration:**
   - Go to Pi Developer Portal
   - Update your app's URL to the public HTTPS URL
   - Save changes

### **Solution 2: Use Local Tunnel (Quick Fix)**

1. **Install localtunnel:**
   ```bash
   npm install -g localtunnel
   ```

2. **Serve your app:**
   ```bash
   npx serve dist -l 3000
   ```

3. **Create tunnel:**
   ```bash
   npx localtunnel --port 3000
   ```

4. **Use the tunnel URL** (e.g., `https://abc123.loca.lt`)

### **Solution 3: Use Network IP**

1. **Find your network IP:**
   ```bash
   ipconfig
   ```

2. **Use network IP instead of localhost:**
   - `http://192.168.1.8:3000/`
   - `http://172.19.16.1:3000/`

## 🔧 **Configuration Updates**

### **Update Pi App Settings**

1. **Pi Developer Portal:**
   - App URL: `https://your-public-url.com`
   - Validation Key: `312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156`

2. **Test URLs:**
   - `https://your-public-url.com/validation-key.txt`
   - `https://your-public-url.com/flappypi.fun-validation-key.txt`
   - `https://your-public-url.com/.well-known/flappypi.fun-validation-key.txt`

### **Headers Configuration**

Your app now has the correct headers:
- ✅ No `X-Frame-Options` header (allows iframe)
- ✅ `Cross-Origin-Embedder-Policy: unsafe-none`
- ✅ `Cross-Origin-Opener-Policy: unsafe-none`
- ✅ CORS headers for Pi Browser

## 🧪 **Testing**

### **Test 1: Local iframe Test**
1. Open `test-iframe.html` in your browser
2. Check if the iframe loads your app
3. Look for console messages

### **Test 2: Pi Browser Sandbox**
1. Go to `https://sandbox.minepi.com/app/your-app-id`
2. Should load without X-Frame-Options error
3. Game should be playable

### **Test 3: Pi Browser**
1. Open Pi Browser
2. Navigate to your app
3. Should work without issues

## 📱 **Pi Browser Specific Fixes**

### **Mobile Optimizations**
- Touch handling for mobile
- Viewport settings
- Pi SDK integration
- Loading indicators

### **Sandbox Compatibility**
- iframe embedding
- Cross-origin requests
- Pi SDK initialization
- Error handling

## 🚀 **Deployment Checklist**

### **Before Deployment**
- [ ] Build completed successfully
- [ ] Validation key updated
- [ ] Headers configured correctly
- [ ] Pi SDK integration working

### **After Deployment**
- [ ] Public HTTPS URL available
- [ ] Validation URLs accessible
- [ ] Pi app configuration updated
- [ ] Sandbox testing successful

## 🔍 **Troubleshooting**

### **If Still Not Working**

1. **Check Console Errors:**
   - Open browser developer tools
   - Look for CORS or iframe errors

2. **Verify Headers:**
   ```bash
   curl -I https://your-app-url.com
   ```

3. **Test Validation URLs:**
   ```bash
   curl https://your-app-url.com/validation-key.txt
   ```

4. **Check Pi App Configuration:**
   - Ensure URL is HTTPS
   - Verify validation key matches
   - Check app permissions

### **Common Issues**

1. **X-Frame-Options Error:**
   - Headers not applied correctly
   - Need to redeploy

2. **CORS Error:**
   - Missing CORS headers
   - Wrong origin configuration

3. **Pi SDK Not Loading:**
   - SDK script not loading
   - Initialization error

4. **Validation Key Error:**
   - Key not matching
   - URL not accessible

## 📞 **Support**

### **For Pi Browser Issues:**
- Use diagnostic tools in console
- Check Pi Browser developer tools
- Test on different devices

### **For Deployment Issues:**
- Check Vercel deployment logs
- Verify domain configuration
- Test validation URLs

---

**Last Updated:** December 2024  
**Status:** Ready for deployment 