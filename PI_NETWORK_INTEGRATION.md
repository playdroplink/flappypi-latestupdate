# Pi Network Integration Guide

This document explains how to use the Pi Network SDK integration for authentication and payments in the Flappy Pi game.

## Installation

The Pi Network SDK has been installed with the following configuration:

```bash
npm install @pinetwork-js/sdk@0.7.0
```

## Configuration

### Pi Config (`src/config/piConfig.ts`)

The Pi Network configuration is set up with:
- **Sandbox Mode**: Disabled (Mainnet)
- **API Key**: Configured for production
- **App ID**: `flappypi`
- **API Version**: 2.0

### Pi SDK (`src/config/piSDK.ts`)

The SDK is initialized with mainnet settings:
```typescript
Pi.init({
  version: '2.0',
  sandbox: false, // Disable sandbox mode for mainnet
  appId: PI_CONFIG.APP_ID,
  apiKey: PI_CONFIG.API_KEY,
});
```

## Usage

### 1. React Hook (`src/hooks/usePiNetwork.ts`)

Use the `usePiNetwork` hook in your components:

```typescript
import { usePiNetwork } from '../hooks/usePiNetwork';

const MyComponent = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    authenticate,
    signOut,
    createPayment,
    completePayment,
    clearError,
  } = usePiNetwork();

  // Your component logic here
};
```

### 2. Authentication

```typescript
// Authenticate user
const handleAuth = async () => {
  try {
    const authResult = await authenticate();
    console.log('User authenticated:', authResult.user);
  } catch (error) {
    console.error('Authentication failed:', error);
  }
};
```

### 3. Payments

```typescript
// Create a payment
const handlePayment = async () => {
  try {
    const payment = await createPayment(
      1.0, // amount in π
      'Game purchase', // memo
      { item: 'extra_life' } // metadata
    );
    console.log('Payment created:', payment);
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

### 4. Ad Network

```typescript
// Show interstitial ad
const handleInterstitialAd = async () => {
  try {
    const success = await showInterstitialAd();
    if (success) {
      console.log('Interstitial ad shown successfully');
    }
  } catch (error) {
    console.error('Interstitial ad failed:', error);
  }
};

// Show rewarded ad
const handleRewardedAd = async () => {
  try {
    const result = await showRewardedAd();
    if (result.success) {
      console.log(`Earned ${result.reward_amount} coins!`);
    }
  } catch (error) {
    console.error('Rewarded ad failed:', error);
  }
};
```

## Example Components

### Pi Network Integration
See `src/components/PiNetworkExample.tsx` for a complete example of:
- User authentication
- Payment creation
- Error handling
- Loading states

### Pi Ad Network
See `src/components/PiAdNetworkExample.tsx` for a complete example of:
- Interstitial ads
- Rewarded ads
- Ad preloading
- Ad readiness checking
- Error handling

## Testing

Visit `/pi-sdk-test` in your app to test the Pi Network integration. The test page includes:
- Environment detection
- Authentication testing
- Payment testing
- Interactive example component

## Key Features

### Authentication
- ✅ Pi Network login
- ✅ User session management
- ✅ Automatic session restoration
- ✅ Sign out functionality

### Payments
- ✅ Create payments
- ✅ Complete payments
- ✅ Payment status checking
- ✅ Incomplete payment handling

### Ad Network
- ✅ Interstitial ads
- ✅ Rewarded ads
- ✅ Ad preloading
- ✅ Ad readiness checking
- ✅ Ad request management

### Error Handling
- ✅ Network errors
- ✅ Authentication errors
- ✅ Payment errors
- ✅ User-friendly error messages

### State Management
- ✅ Loading states
- ✅ Error states
- ✅ User state
- ✅ Authentication state

## Environment Variables

Make sure your environment is properly configured:

```typescript
// src/config/piConfig.ts
export const PI_CONFIG = {
  API_KEY: "your-api-key-here",
  IS_SANDBOX: false, // Set to false for mainnet
  APP_ID: 'flappypi',
  // ... other config
};
```

## Browser Requirements

- **Pi Browser**: Required for full functionality
- **Mobile**: Recommended for best experience
- **Desktop**: Limited functionality

## Security Notes

1. **API Key**: Keep your API key secure and never expose it in client-side code
2. **Sandbox Mode**: Disabled for production use
3. **Payment Validation**: Always validate payments on your backend
4. **User Verification**: Verify user identity before processing payments

## Troubleshooting

### Common Issues

1. **"Pi SDK not available"**
   - Ensure you're running in Pi Browser
   - Check if the SDK is properly loaded

2. **"Authentication failed"**
   - Verify your API key is correct
   - Check network connectivity
   - Ensure user has Pi Network account

3. **"Payment creation failed"**
   - Verify user is authenticated
   - Check payment amount is valid
   - Ensure app is properly configured

### Debug Mode

Enable debug logging by checking the browser console for detailed error messages and SDK initialization logs.

## Production Checklist

- [ ] API key configured for mainnet
- [ ] Sandbox mode disabled
- [ ] Payment validation implemented
- [ ] Error handling tested
- [ ] User authentication tested
- [ ] Payment flow tested
- [ ] Mobile compatibility verified

## Support

For issues with the Pi Network SDK:
- Check the [Pi Network Developer Documentation](https://developers.minepi.com/)
- Review the SDK source code
- Test in Pi Browser environment
- Verify API key permissions 