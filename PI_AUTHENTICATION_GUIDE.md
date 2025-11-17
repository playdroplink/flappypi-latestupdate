# Pi Network Authentication Guide

## Overview

This guide provides a complete walkthrough for implementing Pi Network authentication following the official documentation. The authentication process includes both client-side SDK authentication and server-side verification to ensure security and data integrity.

## 🔐 Authentication Flow

### Official Two-Step Process

Following the official Pi Network authentication guide:

1. **Step 1: Call `authenticate()` of Pi SDK**
   - Get user information and access token from Pi SDK
   - Handle incomplete payments if found

2. **Step 2: Make a GET request to `/me` Pi API endpoint**
   - Verify the access token with Pi Platform API
   - Get verified user data from server
   - Handle 401 Unauthorized if token is invalid

## 📱 Implementation

### Basic Authentication

```typescript
import { usePiSDK } from '../hooks/usePiSDK';

const { authenticate, isAuthenticated, user } = usePiSDK();

const handleAuth = async () => {
  try {
    const result = await authenticate(['payments']);
    
    if (result.success) {
      console.log('✅ User authenticated and verified:', result.user);
      console.log('🔑 Access token:', result.accessToken);
    } else {
      console.error('❌ Authentication failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Authentication error:', error);
  }
};
```

### Advanced Authentication with Error Handling

```typescript
const handleAdvancedAuth = async () => {
  try {
    console.log('🔐 Starting Pi Network authentication...');
    
    const result = await authenticate(['payments', 'username']);
    
    if (result.success) {
      console.log('✅ Step 1: SDK authentication successful');
      console.log('✅ Step 2: Server verification successful');
      console.log('👤 User:', result.user);
      console.log('🔑 Access token:', result.accessToken);
      
      // User is now authenticated and verified
      // You can proceed with app functionality
    } else {
      console.error('❌ Authentication failed:', result.error);
      
      // Handle specific error cases
      if (result.error?.includes('verification failed')) {
        console.error('🔍 Token verification failed - may be invalid');
      }
    }
  } catch (error) {
    console.error('❌ Unexpected authentication error:', error);
  }
};
```

## 🔧 Available Scopes

### Scope Types

- `username` - Get user's Pi username
- `payments` - Enable payment functionality  
- `wallet_address` - Get user's wallet address

### Scope Usage Examples

```typescript
// Basic authentication with payments
await authenticate(['payments']);

// Authentication with username and payments
await authenticate(['username', 'payments']);

// Full authentication with all scopes
await authenticate(['username', 'payments', 'wallet_address']);
```

## 🛡️ Security Features

### Automatic Server Verification

The authentication process automatically includes server-side verification:

```typescript
// This happens automatically in the authenticate() method
private async verifyAccessToken(accessToken: string): Promise<UserDTO | null> {
  try {
    const response = await fetch('https://api.minepi.com/v2/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      console.error('❌ Access token is invalid (401 Unauthorized)');
      return null;
    }

    if (!response.ok) {
      console.error(`❌ API verification failed with status: ${response.status}`);
      return null;
    }

    const userData: UserDTO = await response.json();
    console.log('✅ Access token verified successfully with server');
    
    return userData;
  } catch (error) {
    console.error('❌ Failed to verify access token:', error);
    return null;
  }
}
```

### Error Handling

The authentication process handles various error scenarios:

- **401 Unauthorized** - Invalid access token
- **Network errors** - Connection issues
- **SDK errors** - Pi SDK initialization issues
- **User cancellation** - User cancels authentication

## 📊 Response Types

### Successful Authentication

```typescript
{
  success: true,
  user: {
    uid: string;
    username: string;
  },
  accessToken: string
}
```

### Failed Authentication

```typescript
{
  success: false,
  error: string
}
```

## 🔄 Incomplete Payment Handling

The authentication process automatically handles incomplete payments:

```typescript
const onIncompletePaymentFound = (payment: PaymentDTO) => {
  console.log('💰 Found incomplete payment:', payment);
  
  // Handle the incomplete payment
  // You can show a dialog to the user or automatically process it
  handleIncompletePayment(payment);
};
```

## 🧪 Testing Authentication

### Test Component Usage

```typescript
import PiSDKTestComponent from '../components/PiSDKTestComponent';

// In your app
<PiSDKTestComponent />
```

### Manual Testing Steps

1. **Open in Pi Browser** - Navigate to your app in Pi Browser
2. **Click Authenticate** - Use the test component's authenticate button
3. **Check Console** - Monitor the authentication flow in browser console
4. **Verify Results** - Ensure both SDK and server verification succeed

### Expected Console Output

```
🔐 Authenticating user with scopes: ['payments']
📱 Step 1: Calling Pi SDK authenticate()...
✅ SDK authentication successful, access token obtained
🔍 Step 2: Verifying access token with /me endpoint...
🔍 Verifying access token with Pi Platform API...
✅ Access token verified successfully with server
✅ User authenticated and verified successfully: {uid: "...", username: "..."}
🔐 Authentication completed with server verification
```

## 🚀 Production Considerations

### Environment Configuration

Ensure your environment is properly configured:

```env
# Pi Network Testnet Configuration
VITE_PI_APP_ID=flappypi
VITE_PI_API_KEY=your_testnet_api_key_here
VITE_PI_VALIDATION_KEY=312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156
VITE_PI_SANDBOX=true
```

### Security Best Practices

1. **Never store access tokens** in localStorage or sessionStorage
2. **Always verify tokens** on server-side for sensitive operations
3. **Handle token expiration** gracefully
4. **Use HTTPS** in production
5. **Validate user data** from server responses

### Error Recovery

```typescript
const handleAuthError = (error: string) => {
  if (error.includes('verification failed')) {
    // Token verification failed - user may need to re-authenticate
    console.log('🔄 Token verification failed, prompting re-authentication');
    // Show re-authentication prompt
  } else if (error.includes('network')) {
    // Network error - retry after delay
    console.log('🌐 Network error, retrying in 5 seconds...');
    setTimeout(() => handleAuth(), 5000);
  } else {
    // Other errors
    console.error('❌ Authentication error:', error);
  }
};
```

## 📚 Official Documentation References

- [Pi.authenticate SDK Reference](./SDK_reference.md#authentication)
- [/me Platform API Reference](./platform_API.md#authentication)
- [UserDTO Interface](./platform_API.md#UserDTO)

## 🎯 Key Benefits

1. **Security** - Server-side verification ensures data integrity
2. **Reliability** - Handles network issues and token validation
3. **User Experience** - Seamless authentication flow
4. **Compliance** - Follows official Pi Network guidelines
5. **Error Handling** - Comprehensive error management

## 🔍 Troubleshooting

### Common Issues

1. **"Access token is invalid"**
   - Check if user is properly authenticated in Pi Browser
   - Verify app configuration in Pi Developer Portal

2. **"Network error"**
   - Check internet connection
   - Verify Pi Platform API is accessible

3. **"SDK not available"**
   - Ensure Pi SDK is loaded correctly
   - Check if running in Pi Browser

4. **"User cancelled"**
   - User cancelled the authentication flow
   - Provide clear instructions to user

### Debug Mode

Enable detailed logging for debugging:

```typescript
// In development, you can enable detailed logging
console.log('🔍 Debug: Authentication flow started');
console.log('🔍 Debug: SDK response:', auth);
console.log('🔍 Debug: Server verification response:', verifiedUser);
```

This authentication implementation provides a robust, secure, and user-friendly authentication flow that follows all official Pi Network guidelines and best practices. 