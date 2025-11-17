# Pi Network SDK Testnet Integration - Complete Guide

This document provides a comprehensive guide for the Pi Network SDK integration in testnet mode, following the official Pi Network Client SDK reference documentation for mobile Pi Browser compatibility.

## 🎯 Overview

The Flappy Pi game now includes a complete Pi Network SDK integration with:
- **Pi Authentication** - User authentication with payments scope
- **Pi Payments** - User-to-App payment processing
- **Pi Ads** - Interstitial and rewarded ads using official Ads module
- **Native Features** - Share dialog, system browser, and native features detection
- **Testnet Mode** - Configured for Pi Developer Portal requirements
- **Mobile Pi Browser** - Optimized for mobile Pi Browser experience

## 📋 Prerequisites

1. **Pi Developer Portal Account** - Register at `develop.pi` in Pi Browser
2. **App Registration** - Create your app in the Pi Developer Portal
3. **Testnet API Keys** - Get your testnet API keys from the developer portal
4. **Validation Key** - Use the provided validation key for testnet

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Pi Network Testnet Configuration
VITE_PI_APP_ID=flappypi
VITE_PI_API_KEY=your_testnet_api_key_here
VITE_PI_VALIDATION_KEY=312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156
VITE_PI_SANDBOX=true
```

### Validation Key Files

The following validation key files are automatically created:

- `public/validation-key.txt`
- `public/flappypi.fun-validation-key.txt`
- `public/.well-known/flappypi.fun-validation-key.txt`

All files contain the testnet validation key: `312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156`

## 🚀 Installation & Setup

### 1. HTML Integration

The main `index.html` file includes the official Pi SDK:

```html
<!-- Pi Network SDK - Official Integration -->
<script src="https://sdk.minepi.com/pi-sdk.js"></script>
<script>
    // Initialize Pi SDK for testnet mode
    Pi.init({ 
        version: "2.0",
        sandbox: true // Enable testnet mode
    });
</script>

<!-- Pi Validation Key -->
<meta name="pi-validation-key" content="312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156" />
```

### 2. Core Services

#### Pi SDK Service (`src/services/piSDKService.ts`)

Main service following official documentation:

```typescript
// Initialize SDK
await piSDKService.initialize();

// Authenticate user
const auth = await piSDKService.authenticate(['payments']);

// Create payment
piSDKService.createPayment(
    0.1, // amount
    'Game purchase', // memo
    { item: 'extra_life' }, // metadata
    callbacks // payment callbacks
);

// Get native features
const features = await piSDKService.getNativeFeatures();

// Show ads
const adResult = await piSDKService.showAd('interstitial');
```

### 3. React Hooks

#### Main Hook (`src/hooks/usePiSDK.ts`)

Comprehensive hook for all Pi SDK functionality:

```typescript
const {
  user,
  isAuthenticated,
  isLoading,
  error,
  authenticate,
  createPayment,
  signOut,
  getNativeFeatures,
  openShareDialog,
  openUrlInSystemBrowser,
  showAd,
  isAdReady,
  requestAd
} = usePiSDK();
```

#### Specialized Hooks

```typescript
// Authentication only
const { user, authenticate, signOut } = usePiAuth();

// Payments only
const { createPayment } = usePiPayments();

// Ads only
const { showAd, isAdReady, requestAd } = usePiAds();

// Environment detection
const { isPiBrowser, isSDKAvailable, getNativeFeatures } = usePiEnvironment();
```

## 🔐 Authentication

### Basic Authentication

```typescript
import { usePiSDK } from '../hooks/usePiSDK';

const { authenticate, isAuthenticated, user } = usePiSDK();

const handleAuth = async () => {
  const result = await authenticate(['payments']);
  if (result.success) {
    console.log('User authenticated and verified:', result.user);
    console.log('Access token:', result.accessToken);
  }
};
```

### Available Scopes

- `username` - Get user's Pi username
- `payments` - Enable payment functionality
- `wallet_address` - Get user's wallet address

### Authentication Flow

Following the official Pi Network authentication guide:

1. **SDK Initialization** - Pi SDK is initialized with testnet configuration
2. **Step 1: SDK Authentication** - Call `Pi.authenticate()` to get user info and access token
3. **Step 2: Server Verification** - Make GET request to `/me` endpoint to verify access token
4. **User Consent** - User approves the authentication request
5. **Token Verification** - Access token is verified with Pi Platform API
6. **Session Management** - User session is maintained throughout the app

### Server-Side Verification

The authentication process includes automatic server-side verification:

```typescript
// Step 1: SDK Authentication
const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

// Step 2: Server Verification (automatic)
const verifiedUser = await verifyAccessToken(auth.accessToken);
```

This ensures that the user data is verified against the Pi Platform API as the source of truth.

## 💰 Payments

Pi Network Payments follow a three-phase flow with server-side approval and completion for security.

### Payment Flow Overview

1. **Phase I**: Payment creation and Server-Side Approval
2. **Phase II**: User interaction and blockchain transaction  
3. **Phase III**: Server-Side Completion

### Payment Creation

```typescript
const handlePayment = async () => {
  try {
    const paymentData = {
      amount: 1.0, // amount in π
      memo: 'Extra life purchase',
      metadata: { item: 'extra_life', game: 'flappy-pi' }
    };

    const callbacks = {
      onReadyForServerApproval: (paymentId) => {
        console.log('Payment ready for approval:', paymentId);
        // Send to your backend for server-side approval
        sendToBackend('/api/payments/approve', { paymentId });
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        console.log('Payment completed:', paymentId, txid);
        // Send to your backend for server-side completion
        sendToBackend('/api/payments/complete', { paymentId, txid });
      },
      onCancel: (paymentId) => {
        console.log('Payment cancelled:', paymentId);
      },
      onError: (error, payment) => {
        console.error('Payment error:', error);
      }
    };

    createPayment(paymentData, callbacks);
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

### Backend Integration Required

Your backend must implement two critical endpoints:

#### 1. Payment Approval Endpoint
```typescript
// POST /api/payments/approve
app.post('/api/payments/approve', async (req, res) => {
  const { paymentId } = req.body;
  
  // Call Pi Network API to approve payment
  const response = await fetch(
    `https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`
      }
    }
  );
  
  if (response.ok) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Approval failed' });
  }
});
```

#### 2. Payment Completion Endpoint
```typescript
// POST /api/payments/complete
app.post('/api/payments/complete', async (req, res) => {
  const { paymentId, txid } = req.body;
  
  // Call Pi Network API to complete payment
  const response = await fetch(
    `https://api.testnet.minepi.com/v2/payments/${paymentId}/complete`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`
      },
      body: JSON.stringify({ txid })
    }
  );
  
  if (response.ok) {
    // Payment verified - deliver goods/services
    await deliverGoods(paymentId);
    res.json({ success: true });
  } else {
    // CRITICAL: Do not mark payment as complete if server returns non-200
    res.status(500).json({ error: 'Completion failed' });
  }
});
```

### Security Considerations

- **Never trust client-side payment data**
- **Always verify payments on your backend**
- **Handle incomplete payments** that may occur due to app crashes
- **Implement proper error handling** for all payment scenarios

For detailed implementation guide, see [PI_PAYMENTS_INTEGRATION_GUIDE.md](./PI_PAYMENTS_INTEGRATION_GUIDE.md).

## 📺 Ads

The Pi SDK includes an Ads module for displaying interstitial and rewarded ads. Following the official documentation, here's how to implement ads with advanced strategies and security considerations.

### Prerequisites

Before implementing ads, ensure your app is approved for the Pi Developer Ad Network and check for ad network support:

```typescript
import { usePiEnvironment } from '../hooks/usePiSDK';

const MyComponent = () => {
  const { getNativeFeatures } = usePiEnvironment();

  const checkAdSupport = async () => {
    const features = await getNativeFeatures();
    const adNetworkSupported = features.includes('ad_network');
    
    if (!adNetworkSupported) {
      // Encourage users to update Pi Browser
      console.warn('Ad network not supported - encourage Pi Browser update');
    }
  };
};
```

### Basic Usage

```typescript
import { usePiAds } from '../hooks/usePiSDK';

const MyComponent = () => {
  const { showAd, isAdReady, requestAd } = usePiAds();

  const handleShowInterstitial = async () => {
    try {
      const result = await showAd('interstitial');
      console.log('Interstitial ad result:', result.result);
      
      switch (result.result) {
        case 'AD_CLOSED':
          console.log('Ad was closed by user');
          break;
        case 'AD_DISPLAY_ERROR':
          console.error('Ad display error');
          break;
        case 'AD_NETWORK_ERROR':
          console.error('Ad network error');
          break;
        case 'AD_NOT_AVAILABLE':
          console.warn('Ad not available');
          break;
      }
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
    }
  };

  const handleShowRewarded = async () => {
    try {
      const result = await showAd('rewarded');
      
      switch (result.result) {
        case 'AD_REWARDED':
          console.log('User earned reward!');
          if ('adId' in result && result.adId) {
            console.log('Ad ID for verification:', result.adId);
            // IMPORTANT: Verify adId on backend before granting rewards
            await verifyRewardedAdOnBackend(result.adId);
          }
          break;
        case 'AD_CLOSED':
          console.log('Ad was closed without reward');
          break;
        case 'USER_UNAUTHENTICATED':
          console.warn('User not authenticated for rewarded ad');
          break;
        case 'ADS_NOT_SUPPORTED':
          console.warn('Ads not supported - encourage Pi Browser update');
          break;
        default:
          console.error('Ad error:', result.result);
      }
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
    }
  };

  return (
    <div>
      <button onClick={handleShowInterstitial}>Show Interstitial Ad</button>
      <button onClick={handleShowRewarded}>Show Rewarded Ad</button>
    </div>
  );
};
```

### Advanced Usage with Robust Error Handling

```typescript
const showInterstitialAdAdvanced = async () => {
  try {
    // Step 1: Check if ad is ready
    const isReadyResponse = await isAdReady('interstitial');
    
    if (!isReadyResponse.ready) {
      // Step 2: Request ad if not ready
      const requestResponse = await requestAd('interstitial');
      
      if (requestResponse.result !== 'AD_LOADED') {
        console.warn('Failed to load interstitial ad:', requestResponse.result);
        return false;
      }
    }

    // Step 3: Show the ad
    const showResponse = await showAd('interstitial');
    
    switch (showResponse.result) {
      case 'AD_CLOSED':
        return true;
      case 'AD_DISPLAY_ERROR':
      case 'AD_NETWORK_ERROR':
      case 'AD_NOT_AVAILABLE':
        console.error('Ad error:', showResponse.result);
        return false;
      default:
        console.error('Unknown ad result:', showResponse.result);
        return false;
    }
  } catch (error) {
    console.error('Interstitial ad error:', error);
    return false;
  }
};

const showRewardedAdAdvanced = async () => {
  try {
    // Step 1: Check if ad is ready
    const isReadyResponse = await isAdReady('rewarded');
    
    if (!isReadyResponse.ready) {
      // Step 2: Request ad if not ready
      const requestResponse = await requestAd('rewarded');
      
      if (requestResponse.result === 'ADS_NOT_SUPPORTED') {
        console.warn('Ads not supported - encourage Pi Browser update');
        return false;
      }
      
      if (requestResponse.result !== 'AD_LOADED') {
        console.warn('Failed to load rewarded ad:', requestResponse.result);
        return false;
      }
    }

    // Step 3: Show the rewarded ad
    const showResponse = await showAd('rewarded');
    
    switch (showResponse.result) {
      case 'AD_REWARDED':
        if ('adId' in showResponse && showResponse.adId) {
          // CRITICAL: Verify adId on backend before granting rewards
          const verified = await verifyRewardedAdOnBackend(showResponse.adId);
          if (verified) {
            grantRewardToUser();
          }
        }
        return true;
      case 'AD_CLOSED':
        return true;
      case 'USER_UNAUTHENTICATED':
        console.warn('User not authenticated for rewarded ad');
        return false;
      case 'ADS_NOT_SUPPORTED':
        console.warn('Ads not supported');
        return false;
      default:
        console.error('Rewarded ad error:', showResponse.result);
        return false;
    }
  } catch (error) {
    console.error('Rewarded ad error:', error);
    return false;
  }
};
```

### Security Considerations for Rewarded Ads

**⚠️ CRITICAL SECURITY WARNING:** Never trust client-side ad responses for rewarded ads. Always verify the `adId` on your backend using the Pi Platform API:

```typescript
// Backend verification (Node.js example)
const verifyRewardedAdOnBackend = async (adId: string) => {
  try {
    const response = await fetch('https://api.minepi.com/v2/ads/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ adId })
    });
    
    const result = await response.json();
    
    // Only grant rewards if mediator_ack_status is "granted"
    return result.mediator_ack_status === 'granted';
  } catch (error) {
    console.error('Failed to verify rewarded ad:', error);
    return false;
  }
};
```

### Ad Response Types

- `AD_CLOSED` - Ad was displayed and closed
- `AD_REWARDED` - Rewarded ad completed successfully (includes `adId` for verification)
- `AD_DISPLAY_ERROR` - Ad failed to display
- `AD_NETWORK_ERROR` - Network connection issues
- `AD_NOT_AVAILABLE` - No ad available
- `ADS_NOT_SUPPORTED` - Ads not supported in this version
- `USER_UNAUTHENTICATED` - User not authenticated (for rewarded ads)

### Banner Ads

Banner ads are not supported via the Pi SDK. They can only be enabled through the Developer Portal settings as "Loading Banner Ads" which are automatically displayed while your application loads.

## 🔧 Native Features

### Get Native Features

```typescript
const { getNativeFeatures } = usePiSDK();

const checkFeatures = async () => {
  const features = await getNativeFeatures();
  console.log('Available features:', features);
  
  // Available features:
  // - "inline_media" - Inline media support
  // - "request_permission" - Permission requests
  // - "ad_network" - Ad network support (check this for ads functionality)
  
  // Check for specific features
  const adNetworkSupported = features.includes('ad_network');
  const inlineMediaSupported = features.includes('inline_media');
  const permissionSupported = features.includes('request_permission');
  
  console.log('Ad network supported:', adNetworkSupported);
  console.log('Inline media supported:', inlineMediaSupported);
  console.log('Permission requests supported:', permissionSupported);
};
```

### Share Dialog

```typescript
const { openShareDialog } = usePiSDK();

const handleShare = () => {
  openShareDialog(
    'Flappy Pi',
    'Check out this awesome Pi Network game! Play and earn Pi!'
  );
};
```

### System Browser

```typescript
const { openUrlInSystemBrowser } = usePiSDK();

const openExternalLink = async () => {
  try {
    await openUrlInSystemBrowser('https://minepi.com');
  } catch (error) {
    console.error('Failed to open URL:', error);
  }
};
```

## 🧪 Testing

### Test Component

Use the comprehensive test component to verify all integrations:

```typescript
import PiSDKTestComponent from '../components/PiSDKTestComponent';

// In your app
<PiSDKTestComponent />
```

### Test Features

The test component includes:
- ✅ SDK initialization testing
- ✅ Pi Browser detection
- ✅ Native features detection
- ✅ Authentication testing
- ✅ Payment creation testing
- ✅ Ads functionality testing
- ✅ Share dialog testing
- ✅ System browser testing
- ✅ Real-time status monitoring

### Manual Testing

1. **Open in Pi Browser** - Navigate to your app in Pi Browser
2. **Run Tests** - Click "Run All Tests" in the test component
3. **Verify Results** - Check all test results are successful
4. **Test Payments** - Try creating a small test payment
5. **Test Ads** - Verify interstitial and rewarded ads work
6. **Test Features** - Verify share dialog and system browser work

## 📱 Mobile Pi Browser Optimization

### Pi Browser Detection

```typescript
const isPiBrowser = () => {
  const userAgent = window.navigator.userAgent;
  const hostname = window.location.hostname;
  
  return userAgent.includes('Pi Browser') || 
         userAgent.includes('PiNetwork') ||
         hostname.includes('.pinet.com') ||
         hostname.includes('.minepi.com');
};
```

### Mobile-Specific Features

- **Safe Area Support** - Handles device notches and safe areas
- **Touch Optimization** - Optimized for touch interactions
- **Performance** - Optimized for mobile performance
- **Offline Support** - Graceful handling of network issues
- **Native Integration** - Full integration with Pi Browser features

## 🔒 Security

### Validation Key Security

- Validation keys are stored in public files (required by Pi Network)
- API keys are stored in environment variables
- All sensitive data is handled securely

### Payment Security

- Server-side approval and completion required
- Payment validation on both client and server
- Secure token handling

### User Data Security

- User information should only be used for presentation logic
- Backend should use Platform API as source of truth
- Access tokens should be verified on server-side

## 🚀 Deployment

### Build Process

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test build
node test-build.js
```

### Deployment Checklist

- [ ] Validation key files are accessible
- [ ] Environment variables are set
- [ ] Pi SDK is loading correctly
- [ ] Authentication works in Pi Browser
- [ ] Payments are processing correctly
- [ ] Ads are displaying properly
- [ ] Native features are working
- [ ] Mobile experience is optimized

### Validation Key URLs

After deployment, verify these URLs are accessible:
- `https://your-domain.com/validation-key.txt`
- `https://your-domain.com/flappypi.fun-validation-key.txt`
- `https://your-domain.com/.well-known/flappypi.fun-validation-key.txt`

## 📊 Monitoring

### Console Logging

The integration includes comprehensive logging:

```javascript
// SDK initialization
console.log('🚀 Initializing Pi SDK (Testnet Mode)...');

// Authentication
console.log('🔐 Authenticating user with scopes:', scopes);

// Payments
console.log('💰 Creating payment:', { amount, memo, metadata });

// Ads
console.log('📺 Showing interstitial ad...');

// Native features
console.log('📱 Available native features:', features);
```

### Error Handling

All services include proper error handling:

```typescript
try {
  const result = await authenticate(['payments']);
  if (result.success) {
    // Handle success
  } else {
    // Handle authentication error
    console.error('Authentication failed:', result.error);
  }
} catch (error) {
  // Handle unexpected errors
  console.error('Unexpected error:', error);
}
```

## 🔄 Updates & Maintenance

### Regular Updates

- Monitor Pi Network SDK updates
- Update validation keys when needed
- Test integrations after updates
- Monitor Pi Developer Portal for changes

### Troubleshooting

Common issues and solutions:

1. **SDK not loading** - Check internet connection and Pi SDK URL
2. **Authentication failing** - Verify app ID and API keys
3. **Payments not working** - Check server endpoints and validation
4. **Ads not showing** - Verify ad network configuration
5. **Native features not available** - Check Pi Browser version

## 📚 Resources

- [Pi Network Developer Portal](https://develop.pi)
- [Pi Network SDK Documentation](https://developers.minepi.com)
- [Pi Network API Reference](https://api.minepi.com)
- [Pi Browser Guidelines](https://developers.minepi.com/pi-browser)
- [Official Client SDK Reference](https://developers.minepi.com/docs/sdk)

## 🎉 Conclusion

This integration provides a complete Pi Network SDK implementation for testnet mode, following all official documentation and best practices. The system is ready for Pi Developer Portal submission and mobile Pi Browser deployment.

For support or questions, refer to the Pi Network developer community or the official documentation. 