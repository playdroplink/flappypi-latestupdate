# 🚀 Vercel Environment Variables Setup for Flappy Pi Production Mainnet

## 📋 **Complete Environment Variables for Vercel**

You need to add these environment variables to your Vercel project for production mainnet deployment.

### 🔧 **How to Add Environment Variables in Vercel**

1. **Go to your Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your Flappy Pi project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click on **Environment Variables**

3. **Add Each Variable**
   - Click **Add New**
   - Enter the variable name and value
   - Select **Production** environment
   - Click **Save**

---

## 🌐 **SUPABASE CONFIGURATION**

```env
VITE_SUPABASE_URL=https://ididprksbmbhigcxcxvt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzE0MjIsImV4cCI6MjA2NzQwNzQyMn0.oaqH6N-aBs9eVPUhY6jYXfauPShALeKDe4sQGBv8g9Q
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgzMTQyMiwiZXhwIjoyMDY3NDA3NDIyfQ.tBuF56T_16xBhPfl7lSMJ2uDgAIqGGBUhRE7me_96XQ
```

---

## 🔗 **PI NETWORK CONFIGURATION - PRODUCTION MAINNET**

### **API Configuration**
```env
PI_API_KEY=3ob4pkvuquyzykzsc5uugneonftxigw1hdf70fnm7ifpr2kozehpiovpylujhzfc
PI_NETWORK_API_KEY=3ob4pkvuquyzykzsc5uugneonftxigw1hdf70fnm7ifpr2kozehpiovpylujhzfc
PI_NETWORK_APP_ID=flappypi2807
```

### **Environment Settings**
```env
PI_SANDBOX_MODE=false
PI_NETWORK=mainnet
VITE_PI_NETWORK=mainnet
```

### **Server Configuration**
```env
VITE_PI_SERVER_API_KEY=3ob4pkvuquyzykzsc5uugneonftxigw1hdf70fnm7ifpr2kozehpiovpylujhzfc
VITE_PI_APP_ID=flappypi2807
```

### **API URLs**
```env
PI_API_URL=https://api.minepi.com/v2
PI_NETWORK_API_URL=https://api.minepi.com/v2
```

### **Validation Key**
```env
PI_VALIDATION_KEY=94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce
VITE_PI_VALIDATION_KEY=94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce
```

### **SDK Configuration**
```env
VITE_PI_SANDBOX=false
VITE_PI_SDK_VERSION=2.0
```

---

## 🎮 **APPLICATION CONFIGURATION**

### **Environment Settings**
```env
NODE_ENV=production
FLAPPY_PI_ENV=production
GAME_ENVIRONMENT=production
```

### **Feature Flags**
```env
ENABLE_ANALYTICS=true
ENABLE_LEADERBOARD=true
ENABLE_DEBUG=false
```

### **Server Configuration**
```env
PORT=8080
APIKEY=your_api_key_here
```

---

## 🔒 **SECURITY CONFIGURATION**

### **CORS Origins**
```env
ALLOWED_ORIGINS=https://flappypi2807.pinet.com,https://*.pinet.com,https://*.minepi.com,https://pinet.com,https://minepi.com
```

---

## 🏭 **PRODUCTION MAINNET CONFIGURATION**

### **Production Flags**
```env
IS_PRODUCTION=true
IS_MAINNET=true
IS_SANDBOX=false
IS_TESTNET=false
```

### **Pi Network Production Settings**
```env
PI_NETWORK_MODE=mainnet
PI_SDK_SANDBOX=false
PI_SDK_MAINNET=true
```

### **App Configuration**
```env
APP_ID=flappypi2807
APP_SUBDOMAIN=flappypi2807.pinet.com
APP_BASE_URL=https://flappypi2807.pinet.com
```

---

## 📊 **VERCEL SPECIFIC CONFIGURATION**

### **Build Settings**
```env
VERCEL_GIT_COMMIT_TIMESTAMP=
VERCEL_GIT_COMMIT_REF=
VERCEL_GIT_COMMIT_SHA=
```

---

## ✅ **VERIFICATION CHECKLIST**

After adding all environment variables:

### **1. Environment Check**
- [ ] All variables are set to **Production** environment
- [ ] No variables are set to **Preview** or **Development**
- [ ] All `VITE_` prefixed variables are included

### **2. Pi Network Verification**
- [ ] `PI_NETWORK=mainnet`
- [ ] `PI_SANDBOX_MODE=false`
- [ ] `PI_API_URL=https://api.minepi.com/v2`
- [ ] `PI_NETWORK_APP_ID=flappypi2807`

### **3. Production Flags**
- [ ] `NODE_ENV=production`
- [ ] `IS_PRODUCTION=true`
- [ ] `IS_MAINNET=true`
- [ ] `IS_SANDBOX=false`

### **4. App Configuration**
- [ ] `APP_ID=flappypi2807`
- [ ] `APP_SUBDOMAIN=flappypi2807.pinet.com`
- [ ] `VITE_PI_APP_ID=flappypi2807`

---

## 🚀 **DEPLOYMENT STEPS**

### **1. Add Environment Variables**
- Add all variables listed above to Vercel
- Ensure they are set for **Production** environment

### **2. Deploy to Production**
```bash
# Deploy to Vercel
vercel --prod
```

### **3. Verify Deployment**
- Check that the app loads correctly
- Verify Pi Network SDK initializes
- Test authentication and payments
- Confirm no testnet/sandbox errors

### **4. Test in Pi Browser**
- Open Pi Browser on mobile
- Navigate to: `flappypi2807.pinet.com`
- Test all Pi Network features

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

**1. Environment Variables Not Loading**
- Ensure variables are set for **Production** environment
- Check that `VITE_` prefixed variables are included
- Redeploy after adding variables

**2. Pi Network SDK Errors**
- Verify `PI_NETWORK=mainnet`
- Check `PI_SANDBOX_MODE=false`
- Confirm API key is correct

**3. CORS Errors**
- Ensure `ALLOWED_ORIGINS` includes your domain
- Check that subdomain is correct

**4. Authentication Issues**
- Verify `VITE_PI_APP_ID=flappypi2807`
- Check validation key is correct
- Ensure API key is for mainnet

---

## 📱 **MOBILE TESTING**

### **Pi Browser Testing**
1. Open Pi Browser on mobile device
2. Navigate to: `flappypi2807.pinet.com`
3. Test authentication
4. Test payments
5. Test ads
6. Test social sharing

### **Expected Behavior**
- ✅ Pi Network SDK initializes without errors
- ✅ Authentication works
- ✅ Payments can be created
- ✅ Ads display correctly
- ✅ No testnet/sandbox warnings

---

## 🎯 **SUCCESS INDICATORS**

When properly configured, you should see:

### **Console Logs**
```
🚀 Flappy Pi - PRODUCTION MAINNET MODE
✅ Production: true
✅ Mainnet: true
✅ Sandbox: false
✅ Testnet: false
🎮 Ready for real users on Pi Network mainnet!
```

### **Pi Network SDK**
```
✅ Pi Network SDK initialized successfully for PRODUCTION MAINNET!
🔧 Network Mode: Mainnet (Production)
🎮 App: Flappy Pi
🔗 Subdomain: flappypi2807.pinet.com
🏭 Production Mode: ENABLED
🧪 Sandbox Mode: DISABLED
🧪 Testnet Mode: DISABLED
```

---

## 🚀 **READY FOR PRODUCTION**

Once all environment variables are configured in Vercel:

1. **Deploy to Production**
2. **Test in Pi Browser**
3. **Verify all features work**
4. **Monitor for any errors**

**Flappy Pi will be ready for real users on Pi Network mainnet!** 🎮✨
