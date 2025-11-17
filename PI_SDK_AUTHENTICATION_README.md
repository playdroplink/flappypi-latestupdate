# Pi Network SDK Authentication Implementation

This implementation follows the official Pi Network demo pattern from [https://github.com/playdroplink/demo.git](https://github.com/playdroplink/demo.git) and provides a complete authentication flow for Flappy Pi.

## 🔐 Authentication Flow

The Pi Network authentication follows a **two-step process** for security:

### Step 1: Client-Side Authentication
1. Call `Pi.authenticate()` with scopes to get user data and access token
2. Handle incomplete payments if found

### Step 2: Server-Side Verification
1. Verify the access token with Pi Platform API (`GET /v2/me`)
2. Ensure UID matches for security
3. Store verified user data

## 📁 Implementation Files

### Core Components
- `src/components/PiAuthLogin.tsx` - Main authentication component
- `src/components/PiAuthExample.tsx` - Example usage component
- `src/services/piSDKService.ts` - Pi SDK service class
- `src/hooks/usePiSDK.ts` - React hook for Pi SDK
- `src/api/pi/auth.ts` - Backend API endpoint for verification

### Configuration
- `public/index.html` - Pi SDK script inclusion and initialization

## 🚀 Quick Start

### 1. Basic Authentication

```tsx
import { usePiSDK } from '../hooks/usePiSDK';

const MyComponent = () => {
  const { authenticate, user, isAuthenticated, isLoading, error } = usePiSDK();

  const handleLogin = async () => {
    const result = await authenticate(['username', 'payments']);
    if (result.success) {
      console.log('✅ Login successful:', result.user);
    } else {
      console.error('❌ Login failed:', result.error);
    }
  };

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Connecting...' : 'Connect with Pi Network'}
        </button>
      ) : (
        <div>Welcome, {user?.username}!</div>
      )}
    </div>
  );
};
```

### 2. Using the PiAuthLogin Component

```tsx
import PiAuthLogin from '../components/PiAuthLogin';

const MyPage = () => {
  const handleAuthSuccess = (user) => {
    console.log('User authenticated:', user);
    // Navigate to game or store user data
  };

  const handleAuthError = (error) => {
    console.error('Authentication failed:', error);
    // Show error message to user
  };

  return (
    <PiAuthLogin
      onAuthSuccess={handleAuthSuccess}
      onAuthError={handleAuthError}
    />
  );
};
```

### 3. Creating Payments

```tsx
import { usePiSDK } from '../hooks/usePiSDK';

const PaymentComponent = () => {
  const { createPayment, user } = usePiSDK();

  const handlePayment = async () => {
    const paymentData = {
      amount: 1, // 1 Pi
      memo: "Purchase in Flappy Pi",
      metadata: {
        productId: 'premium_skin',
        game: 'flappy_pi'
      }
    };

    const callbacks = {
      onReadyForServerApproval: (paymentId) => {
        console.log('Payment ready for approval:', paymentId);
        // Call your backend to approve payment
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        console.log('Payment ready for completion:', paymentId, txid);
        // Call your backend to complete payment
      },
      onCancel: (paymentId) => {
        console.log('Payment cancelled:', paymentId);
      },
      onError: (error, payment) => {
        console.error('Payment error:', error);
      }
    };

    const result = await createPayment(paymentData, callbacks);
    if (result.success) {
      console.log('Payment created:', result.paymentId);
    }
  };

  return (
    <button onClick={handlePayment}>
      Buy Premium Skin (1 Pi)
    </button>
  );
};
```

## 🔧 Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# Backend URL for API calls
REACT_APP_BACKEND_URL=http://localhost:3000

# Pi SDK Sandbox mode (true for testing, false for production)
REACT_APP_SANDBOX_SDK=false
```

### Pi SDK Initialization

The Pi SDK is automatically initialized in `public/index.html`:

```html
<!-- Import Pi SDK -->
<script src="https://sdk.minepi.com/pi-sdk.js"></script>

<script>
  // Initialize Pi SDK
  var runSDKInSandboxMode = window.__ENV.sandbox === "true";
  Pi.init({ version: "2.0", sandbox: runSDKInSandboxMode });
</script>
```

## 🛡️ Security Features

### 1. Two-Step Authentication
- Client-side authentication with Pi SDK
- Server-side verification with Pi Platform API

### 2. Token Verification
- Verifies access token with `GET /v2/me` endpoint
- Ensures UID matches for security

### 3. Error Handling
- Comprehensive error handling for all authentication steps
- User-friendly error messages

### 4. Incomplete Payment Handling
- Automatically handles incomplete payments from previous sessions
- Provides callback for custom handling

## 📱 Pi Browser Detection

The implementation automatically detects if the app is running in Pi Browser:

```tsx
const { isPiBrowser } = usePiSDK();

if (!isPiBrowser) {
  return <div>Please open this app in Pi Browser</div>;
}
```

## 🔄 State Management

The `usePiSDK` hook provides comprehensive state management:

```tsx
const {
  // Authentication
  authenticate,
  signOut,
  
  // State
  isLoading,
  error,
  user,
  isAuthenticated,
  
  // Payments
  createPayment,
  
  // Utilities
  isPiBrowser,
  currentUser
} = usePiSDK();
```

## 🧪 Testing

### 1. Development Testing
- Use sandbox mode: `REACT_APP_SANDBOX_SDK=true`
- Test in regular browser (will show Pi Browser required message)

### 2. Production Testing
- Use production mode: `REACT_APP_SANDBOX_SDK=false`
- Test in Pi Browser app
- Verify authentication flow works correctly

### 3. Example Component
Use the `PiAuthExample` component to test the complete flow:

```tsx
import PiAuthExample from '../components/PiAuthExample';

// Add to your app for testing
<PiAuthExample />
```

## 📚 API Reference

### PiSDKService Methods

```typescript
// Initialize SDK
await piSDKService.initialize(): Promise<boolean>

// Authenticate user
await piSDKService.authenticate(scopes): Promise<AuthResult>

// Create payment
await piSDKService.createPayment(paymentData, callbacks): Promise<PaymentResult>

// Get current user
piSDKService.getCurrentUser(): AuthResult['user'] | null

// Check authentication
piSDKService.isAuthenticated(): boolean

// Sign out
piSDKService.signOut(): void
```

### usePiSDK Hook

```typescript
const {
  authenticate,        // Authenticate with Pi Network
  signOut,            // Sign out user
  isLoading,          // Loading state
  error,              // Error message
  user,               // Current user data
  isAuthenticated,    // Authentication status
  createPayment,      // Create payment
  isPiBrowser         // Pi Browser detection
} = usePiSDK();
```

## 🚨 Important Notes

1. **Pi Browser Required**: The Pi SDK only works in Pi Browser
2. **Token Verification**: Always verify access tokens on the backend
3. **Error Handling**: Implement proper error handling for all authentication steps
4. **Security**: Never trust client-side data without server verification
5. **Payments**: Handle incomplete payments appropriately

## 🔗 Resources

- [Pi Network Demo Repository](https://github.com/playdroplink/demo.git)
- [Pi Network SDK Documentation](https://developer.minepi.com/docs/sdk)
- [Pi Network Platform API](https://developer.minepi.com/docs/platform-api)
- [Authentication Flows](https://github.com/pi-apps/pi-platform-docs/blob/master/authentication.md)

## 📝 License

This implementation follows the official Pi Network demo pattern and is licensed under the same terms as the original demo repository.
