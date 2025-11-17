# 🚀 Pi Network Testnet Demo - Complete Setup Guide

## Overview

This guide sets up your Flappy Pi application for **testnet mode** following the exact patterns from the [official Pi demo repository](https://github.com/pi-apps/demo.git). This implementation provides a complete Pi Auth and Pi Payment integration for testing purposes.

## ⚠️ **IMPORTANT: Testnet Configuration**

**Critical Note**: Pi Network testnet uses the **mainnet SDK** (`sandbox: false`) but with **testnet API endpoints**. This is the correct configuration for testnet wallet payments to work properly.

- ✅ **SDK Configuration**: `sandbox: false` (uses mainnet SDK)
- ✅ **API Endpoint**: `https://api.sandbox.minepi.com/v2` (testnet API)
- ✅ **Result**: Testnet wallet payments work correctly

## 🎯 **What's Implemented**

### **1. Pi Network Configuration (Testnet)**
- ✅ **Network Mode**: Testnet (Sandbox)
- ✅ **API URL**: `https://api.sandbox.minepi.com/v2`
- ✅ **SDK Configuration**: Sandbox enabled
- ✅ **Security**: Relaxed for testing

### **2. Pi Authentication (Following Official Demo)**
- ✅ **Authentication Component**: `src/components/PiAuthDemo.tsx`
- ✅ **SDK Integration**: Uses `window.Pi.authenticate()`
- ✅ **User Data**: Captures UID, username, access token
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Backend Verification**: API endpoint for token validation

### **3. Pi Payment (Following Official Demo)**
- ✅ **Payment Component**: `src/components/PiPaymentDemo.tsx`
- ✅ **Payment Creation**: Uses `window.Pi.createPayment()`
- ✅ **Payment Flow**: Complete approval and completion cycle
- ✅ **Test-Pi Support**: Uses test currency (no real value)
- ✅ **Backend Integration**: API endpoints for approval/completion

### **4. Backend API Endpoints**
- ✅ **Authentication**: `api/pi/auth.ts`
- ✅ **Payment Approval**: `api/pi/approve-payment.ts`
- ✅ **Payment Completion**: `api/pi/complete-payment.ts`
- ✅ **Token Verification**: Server-side validation
- ✅ **Error Handling**: Comprehensive error responses

### **5. Demo Page**
- ✅ **Demo Route**: `/pi-demo`
- ✅ **Interactive Demo**: Live authentication and payment testing
- ✅ **Status Display**: Real-time status updates
- ✅ **User Guide**: Step-by-step instructions

## 🚀 **Quick Start**

### **1. Start the Development Server**
```bash
npm start
```

### **2. Access the Demo**
Navigate to: `http://localhost:3000/pi-demo`

### **3. Test in Pi Browser**
For full functionality, use Pi Browser to access the demo.

## 🔧 **Configuration Details**

### **Pi Network Settings (Testnet)**
```typescript
// src/config/piConfig.ts
NETWORK_MODE: 'testnet'
SANDBOX_MODE: true
API_URL: 'https://api.sandbox.minepi.com/v2'
SDK_CONFIG: { sandbox: false } // IMPORTANT: Testnet uses mainnet SDK
```

### **Environment Variables**
```bash
# Testnet Configuration
REACT_APP_PI_NETWORK_MODE=testnet
REACT_APP_PI_NETWORK_SANDBOX=false  # IMPORTANT: Testnet uses mainnet SDK
REACT_APP_PI_NETWORK_PRODUCTION=false
REACT_APP_PI_API_URL=https://api.sandbox.minepi.com/v2
REACT_APP_PI_SDK_SANDBOX=false  # Uses mainnet SDK for testnet
```

## 📱 **How to Test**

### **1. Authentication Flow**
1. Open the demo page in Pi Browser
2. Click "Connect with Pi Network"
3. Complete the authentication flow
4. Verify user data is displayed

### **2. Payment Flow**
1. Ensure you're authenticated (step 1)
2. Enter a test payment amount (e.g., 1.0 Test-Pi)
3. Click "Pay with Pi"
4. Complete the payment flow
5. Verify payment status

### **3. Backend Testing**
- Authentication requests are sent to `/api/pi/auth`
- Payment approvals are sent to `/api/pi/approve-payment`
- Payment completions are sent to `/api/pi/complete-payment`

## 🏗️ **Architecture**

### **Frontend Components**
```
src/components/
├── PiAuthDemo.tsx          # Authentication component
├── PiPaymentDemo.tsx       # Payment component
└── ...

src/pages/
├── PiDemoPage.tsx          # Demo page
└── ...
```

### **Backend API**
```
api/pi/
├── auth.ts                 # Authentication endpoint
├── approve-payment.ts      # Payment approval
└── complete-payment.ts     # Payment completion
```

### **Configuration**
```
src/config/
├── piConfig.ts             # Main Pi configuration
├── mainnetConfig.ts        # Mainnet settings
└── ...
```

## 🔍 **Key Features**

### **Authentication Features**
- ✅ **SDK Detection**: Checks if Pi SDK is available
- ✅ **User Authentication**: Complete auth flow
- ✅ **Token Verification**: Server-side validation
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Status Display**: Real-time authentication status

### **Payment Features**
- ✅ **Test-Pi Support**: Uses test currency
- ✅ **Payment Creation**: Full payment flow
- ✅ **Backend Integration**: Server-side processing
- ✅ **Status Tracking**: Payment status monitoring
- ✅ **Error Recovery**: Graceful error handling

### **Demo Features**
- ✅ **Interactive Demo**: Live testing interface
- ✅ **Status Display**: Real-time updates
- ✅ **User Guide**: Step-by-step instructions
- ✅ **Error Display**: Clear error messages
- ✅ **Responsive Design**: Works on all devices

## 🛠️ **Development**

### **Adding New Features**
1. **Authentication**: Extend `PiAuthDemo.tsx`
2. **Payments**: Extend `PiPaymentDemo.tsx`
3. **Backend**: Add new API endpoints in `api/pi/`
4. **Configuration**: Update `src/config/piConfig.ts`

### **Testing**
- **Unit Tests**: Test individual components
- **Integration Tests**: Test complete flows
- **E2E Tests**: Test in Pi Browser
- **Backend Tests**: Test API endpoints

## 📚 **Official Documentation**

This implementation follows the patterns from:
- [Pi Demo Repository](https://github.com/pi-apps/demo.git)
- [Pi Developer Portal](https://develop.pi)
- [Pi SDK Documentation](https://developers.minepi.com)

## 🎉 **Success Criteria**

### **Authentication Success**
- ✅ User can authenticate with Pi Network
- ✅ User data is captured and displayed
- ✅ Token verification works on backend
- ✅ Error handling works properly

### **Payment Success**
- ✅ User can create test payments
- ✅ Payment flow completes successfully
- ✅ Backend processes payments correctly
- ✅ Status updates work in real-time

### **Demo Success**
- ✅ Demo page loads and functions
- ✅ All features work in Pi Browser
- ✅ Error states are handled gracefully
- ✅ User experience is smooth

## 🚀 **Next Steps**

1. **Test the Demo**: Use the demo page to test all features
2. **Integrate with App**: Add Pi Auth/Payment to your main app
3. **Customize**: Modify components for your specific needs
4. **Deploy**: Deploy to your hosting platform
5. **Monitor**: Monitor usage and performance

## 📞 **Support**

For issues or questions:
1. Check the console for error messages
2. Verify Pi Browser is being used
3. Check network connectivity
4. Review the official Pi documentation

---

**🎯 Your Flappy Pi app is now ready for Pi Network testnet integration!**
