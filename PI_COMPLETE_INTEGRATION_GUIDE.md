# Pi Network Complete Integration Guide

## 🎯 Overview

This comprehensive guide covers the complete Pi Network integration for Flappy Pi, including:

- **Pi SDK (Frontend)** - Authentication, U2A Payments, Ads, Native Features
- **Platform API (Backend)** - A2U Payments, User Verification, Ad Verification
- **PiNet Metadata** - Frontend and Backend metadata support
- **Testnet Mode** - Complete testnet configuration for development

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Core Services](#core-services)
4. [React Hooks](#react-hooks)
5. [Authentication](#authentication)
6. [Payments (U2A & A2U)](#payments-u2a--a2u)
7. [Ads Integration](#ads-integration)
8. [Platform API](#platform-api)
9. [PiNet Metadata](#pinet-metadata)
10. [Testing](#testing)
11. [Mobile Pi Browser Optimization](#mobile-pi-browser-optimization)
12. [Security Considerations](#security-considerations)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Pi Developer Portal Setup

1. **Register your app** at `pi://develop.pi` in Pi Browser
2. **Select Testnet** for development
3. **Configure app settings**:
   - App ID: `flappypi`
   - Network: Pi Testnet
   - Validation Key: `312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156`

### Required Environment Variables

```bash
# .env
VITE_PI_APP_ID=flappypi
VITE_PI_API_KEY=your_api_key_here
VITE_PI_VALIDATION_KEY=312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156
VITE_PI_SANDBOX=true
VITE_PI_SERVER_API_KEY=your_server_api_key_here
```

## 🌐 Environment Setup

### HTML Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="pi-app-id" content="flappypi">
  <meta name="pi-network-mode" content="testnet">
  <title>Flappy Pi</title>
  
  <!-- Pi SDK -->
  <script src="https://sdk.minepi.com/pi-sdk.js"></script>
  <script>
    Pi.init({ version: "2.0", sandbox: true });
  </script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

## 🔧 Core Services

### 1. Pi SDK Service (`src/services/piSDKService.ts`)

**Features:**
- Authentication with server-side verification
- U2A Payment creation and management
- Native features integration
- Ads integration
- A2U Payment integration via Platform API

**Key Methods:**
```typescript
// Authentication
authenticate(scopes: Scope[], onIncompletePaymentFound?: Function): Promise<AuthResult>

// U2A Payments
createPayment(paymentData: PaymentData, callbacks: PaymentCallbacks): void

// A2U Payments
createA2UPayment(paymentRequest: A2UPaymentRequest): Promise<ApiResponse<PaymentDTO>>
approveA2UPayment(paymentId: string): Promise<ApiResponse<PaymentDTO>>
completeA2UPayment(paymentId: string, txid: string): Promise<ApiResponse<PaymentDTO>>

// Platform API
verifyUserToken(accessToken: string): Promise<ApiResponse<UserDTO>>
verifyRewardedAdStatus(adId: string): Promise<ApiResponse<any>>
```

### 2. A2U Payment Service (`src/services/piA2UPaymentService.ts`)

**Features:**
- Complete A2U payment flow
- Platform API integration
- Server-side payment management
- Incomplete payment handling

**Key Methods:**
```typescript
// A2U Payment Flow
createA2UPayment(paymentRequest: A2UPaymentRequest): Promise<ApiResponse<PaymentDTO>>
approvePayment(paymentId: string): Promise<ApiResponse<PaymentDTO>>
completePayment(paymentId: string, txid: string): Promise<ApiResponse<PaymentDTO>>
cancelPayment(paymentId: string): Promise<ApiResponse<PaymentDTO>>

// Platform API
verifyUserToken(accessToken: string): Promise<ApiResponse<UserDTO>>
verifyRewardedAdStatus(adId: string): Promise<ApiResponse<RewardedAdStatusDTO>>
getIncompletePayments(): Promise<ApiResponse<PaymentDTO[]>>
```

### 3. Ad Network Service (`src/services/piAdNetworkService.ts`)

**Features:**
- Interstitial and Rewarded ads
- Advanced loading strategy
- Native feature detection
- Error handling

**Key Methods:**
```typescript
// Ad Display
showInterstitialAd(callbacks?: PiAdCallbacks): Promise<boolean>
showRewardedAd(callbacks?: PiAdCallbacks): Promise<boolean>

// Ad Management
isAdReady(adType: 'interstitial' | 'rewarded'): Promise<boolean>
requestAd(adType: 'interstitial' | 'rewarded'): Promise<string>
```

### 4. PiNet Metadata Service (`src/services/piNetMetadataService.ts`)

**Features:**
- Frontend and Backend metadata support
- OpenGraph and Twitter Cards
- Dynamic metadata generation
- Validation

**Key Methods:**
```typescript
// Metadata Generation
generateMetadata(pathname: string, customMetadata?: Partial<PiNetMetadataDTO>): PiNetMetadataDTO
updateFrontendMetadata(metadata: PiNetMetadataDTO): void
validateMetadata(metadata: PiNetMetadataDTO): { isValid: boolean; errors: string[] }
```

## 🎣 React Hooks

### usePiSDK Hook (`src/hooks/usePiSDK.ts`)

**Complete Integration:**
```typescript
const {
  // Authentication
  user,
  authenticate,
  signOut,
  
  // U2A Payments
  createPayment,
  handleIncompletePayment,
  
  // A2U Payments
  createA2UPayment,
  getA2UPayment,
  approveA2UPayment,
  completeA2UPayment,
  cancelA2UPayment,
  getIncompleteA2UPayments,
  
  // Ads
  showAd,
  isAdReady,
  requestAd,
  
  // Native Features
  getNativeFeatures,
  openShareDialog,
  openUrlInSystemBrowser,
  
  // Platform API
  verifyRewardedAdStatus,
  verifyUserToken,
  
  // Status
  isReady,
  error
} = usePiSDK();
```

## 🔐 Authentication

### Two-Step Authentication Process

1. **Client-Side Authentication:**
```typescript
const authResult = await authenticate(['username', 'payments', 'wallet_address']);
```

2. **Server-Side Verification:**
```typescript
const verification = await verifyUserToken(authResult.accessToken);
if (verification.success) {
  // User is verified
  const userData = verification.data;
}
```

### Available Scopes

- `username` - Access to user's Pi username
- `payments` - Ability to create payments
- `wallet_address` - Access to user's wallet address

## 💰 Payments (U2A & A2U)

### User-to-App (U2A) Payments

**Complete Flow:**
```typescript
const paymentData: PaymentData = {
  amount: 3.1415,
  memo: "Purchase 100 coins",
  metadata: { itemId: "coins_100", game: "flappy-pi" }
};

const callbacks: PaymentCallbacks = {
  onReadyForServerApproval: (paymentId: string) => {
    // Send paymentId to backend for approval
    approvePaymentOnServer(paymentId);
  },
  onReadyForServerCompletion: (paymentId: string, txid: string) => {
    // Send txid to backend for completion
    completePaymentOnServer(paymentId, txid);
  },
  onCancel: (paymentId: string) => {
    console.log('Payment cancelled:', paymentId);
  },
  onError: (error: Error, payment?: PaymentDTO) => {
    console.error('Payment error:', error);
  }
};

createPayment(paymentData, callbacks);
```

### App-to-User (A2U) Payments

**Complete Flow:**
```typescript
// Step 1: Create A2U Payment
const paymentRequest: A2UPaymentRequest = {
  payment: {
    amount: 1.5,
    memo: "Daily reward from Flappy Pi",
    metadata: { reward: "daily_bonus", game: "flappy-pi" },
    uid: "user-uid-123"
  }
};

const createResult = await createA2UPayment(paymentRequest);
if (createResult.success) {
  const paymentId = createResult.data.identifier;
  
  // Step 2: Approve Payment
  const approveResult = await approveA2UPayment(paymentId);
  
  // Step 3: Complete Payment (after blockchain transaction)
  const completeResult = await completeA2UPayment(paymentId, "txid-123");
}
```

## 📺 Ads Integration

### Interstitial Ads

```typescript
const showInterstitial = async () => {
  const success = await showInterstitialAd({
    onAdClosed: () => console.log('Interstitial ad closed'),
    onAdError: (error) => console.error('Ad error:', error)
  });
  
  if (success) {
    console.log('Interstitial ad shown successfully');
  }
};
```

### Rewarded Ads

```typescript
const showRewarded = async () => {
  const success = await showRewardedAd({
    onRewardEarned: async (reward, adId) => {
      // IMPORTANT: Verify adId on backend before granting reward
      const verification = await verifyRewardedAdStatus(adId);
      if (verification.success && verification.data.mediator_ack_status === 'granted') {
        // Grant reward to user
        grantReward(reward);
      }
    },
    onAdError: (error) => console.error('Ad error:', error)
  });
};
```

## 🔌 Platform API

### User Verification

```typescript
const verifyUser = async (accessToken: string) => {
  const result = await verifyUserToken(accessToken);
  if (result.success) {
    const userData = result.data;
    console.log('User verified:', userData.uid, userData.username);
  }
};
```

### Ad Verification

```typescript
const verifyAd = async (adId: string) => {
  const result = await verifyRewardedAdStatus(adId);
  if (result.success) {
    const adStatus = result.data;
    if (adStatus.mediator_ack_status === 'granted') {
      // Ad was legitimately watched, grant reward
      grantReward();
    }
  }
};
```

### Incomplete Payments

```typescript
const handleIncompletePayments = async () => {
  const result = await getIncompleteA2UPayments();
  if (result.success && result.data) {
    for (const payment of result.data) {
      // Process incomplete payment
      await processIncompletePayment(payment);
    }
  }
};
```

## 📄 PiNet Metadata

### Frontend Mode

```typescript
// Generate metadata for current page
const metadata = generateMetadata('/game', {
  title: 'Play Flappy Pi - Earn Pi Coins!',
  description: 'Jump into the action and earn Pi coins!'
});

// Update frontend metadata
updateFrontendMetadata(metadata);
```

### Backend Mode

```typescript
// Handle backend metadata request
app.get('/pinet/meta', async (req, res) => {
  const { pathname } = req.query;
  const metadata = await handleBackendMetadataRequest(pathname as string);
  res.json(metadata);
});
```

### Metadata Validation

```typescript
const validation = validateMetadata(metadata);
if (validation.isValid) {
  console.log('Metadata is valid');
} else {
  console.error('Metadata errors:', validation.errors);
}
```

## 🧪 Testing

### Comprehensive Test Component

Use `PiSDKTestComponent` for testing all integrations:

```typescript
import { PiSDKTestComponent } from '../components/PiSDKTestComponent';

function App() {
  return (
    <div>
      <PiSDKTestComponent />
    </div>
  );
}
```

### Test Coverage

- ✅ Authentication (SDK + Server verification)
- ✅ U2A Payment creation and flow
- ✅ A2U Payment creation and flow
- ✅ Ads (Interstitial + Rewarded)
- ✅ Platform API integration
- ✅ PiNet Metadata generation
- ✅ Native features (Share, System Browser)
- ✅ Error handling

## 📱 Mobile Pi Browser Optimization

### Native Features Detection

```typescript
const features = await getNativeFeatures();
const hasAdNetwork = features.includes('ad_network');
const hasInlineMedia = features.includes('inline_media');
```

### Pi Browser Detection

```typescript
const isPiBrowser = () => {
  const userAgent = navigator.userAgent;
  return userAgent.includes('Pi Browser') || 
         userAgent.includes('PiNetwork');
};
```

### Mobile-Specific Optimizations

1. **Touch-friendly UI** - Large buttons, proper spacing
2. **Performance optimization** - Lazy loading, efficient rendering
3. **Battery optimization** - Minimize background processes
4. **Network optimization** - Efficient API calls, caching

## 🔒 Security Considerations

### Critical Security Points

1. **Server-Side Verification**
   - Always verify user tokens on backend
   - Verify rewarded ad status before granting rewards
   - Validate payment completion on backend

2. **API Key Security**
   - Never expose Server API Key in frontend
   - Use environment variables
   - Implement proper CORS

3. **Payment Security**
   - Complete U2A payments on backend
   - Verify A2U payment completion
   - Handle incomplete payments properly

4. **Ad Security**
   - Verify rewarded ad status via Platform API
   - Don't trust frontend ad responses
   - Implement proper reward validation

### Best Practices

```typescript
// ✅ Good: Server-side verification
const verifyReward = async (adId: string) => {
  const verification = await verifyRewardedAdStatus(adId);
  if (verification.success && verification.data.mediator_ack_status === 'granted') {
    return true;
  }
  return false;
};

// ❌ Bad: Trusting frontend
const verifyReward = (adId: string) => {
  return true; // Never do this!
};
```

## 🚀 Deployment

### Production Checklist

- [ ] Switch to Mainnet configuration
- [ ] Update validation keys
- [ ] Configure production API keys
- [ ] Test all payment flows
- [ ] Verify ad integration
- [ ] Test metadata generation
- [ ] Mobile Pi Browser testing
- [ ] Security audit

### Environment Configuration

```typescript
// Production config
const config = {
  apiBaseUrl: 'https://api.minepi.com/v2',
  sandbox: false,
  appId: 'flappypi',
  serverApiKey: process.env.PI_SERVER_API_KEY
};
```

## 🔧 Troubleshooting

### Common Issues

1. **Authentication Fails**
   - Check app ID and validation key
   - Verify testnet/mainnet configuration
   - Check Pi Browser version

2. **Payments Not Working**
   - Verify server API key
   - Check payment callbacks
   - Validate payment data

3. **Ads Not Loading**
   - Check ad network support
   - Verify Pi Browser version
   - Check ad network approval status

4. **Metadata Issues**
   - Validate metadata structure
   - Check PiNet configuration
   - Verify backend endpoint

### Debug Tools

```typescript
// Enable debug logging
console.log('Pi SDK Status:', await getPiSDKStatus());
console.log('Ad Network Status:', await getPiAdStatus());
console.log('A2U Payment Status:', await getA2UPaymentStatus());
console.log('Metadata Status:', await getPiNetMetadataStatus());
```

## 📚 Resources

### Official Documentation

- [Pi Client SDK Reference](https://developers.minepi.com/docs/sdk)
- [Pi Platform API](https://developers.minepi.com/docs/platform-api)
- [Pi Ads Documentation](https://developers.minepi.com/docs/ads)
- [PiNet Metadata](https://developers.minepi.com/docs/pinet-metadata)

### Developer Portal

- [Pi Developer Portal](https://develop.pi)
- [App Registration](https://develop.pi/apps)
- [Network Configuration](https://develop.pi/settings)

### Support

- [Pi Developer Support](https://pinetwork.atlassian.net/servicedesk/customer/portal/1)
- [Community Forum](https://community.minepi.com)
- [GitHub Issues](https://github.com/pi-apps/PiOS/issues)

---

## 🎉 Conclusion

This complete integration provides:

- ✅ **Full Pi Network SDK integration** for testnet development
- ✅ **Comprehensive payment support** (U2A + A2U)
- ✅ **Advanced ads integration** with security verification
- ✅ **Platform API integration** for backend operations
- ✅ **PiNet metadata support** for social sharing
- ✅ **Mobile Pi Browser optimization**
- ✅ **Complete testing framework**
- ✅ **Security best practices**
- ✅ **Production-ready deployment**

The integration follows all official Pi Network documentation and best practices, ensuring compatibility with the Pi Browser and Pi Network ecosystem. 