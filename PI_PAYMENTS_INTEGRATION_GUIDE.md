# Pi Network Payments Integration Guide

This document provides a comprehensive guide for implementing Pi Network Payments in your application, following the official Pi Network documentation and best practices.

## Table of Contents

- [Overview](#overview)
- [Payment Flow](#payment-flow)
- [Prerequisites](#prerequisites)
- [Implementation](#implementation)
  - [Core Payment Service](#core-payment-service)
  - [React Hooks Integration](#react-hooks-integration)
  - [Backend Integration](#backend-integration)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

Pi Network Payments are wrappers around blockchain transactions that enable your app, the Pi Blockchain, and the Pi Servers to be synchronized when users submit blockchain transactions. This provides developers with full confidence that users have actually made transactions without dealing with blockchain technicalities.

### Key Features

- **Server-Side Approval**: Ensures payment validation before user interaction
- **Server-Side Completion**: Verifies blockchain transactions on the backend
- **Incomplete Payment Handling**: Manages payments that were interrupted
- **Security**: Prevents users from cheating with hacked SDK versions
- **Testnet Support**: Full support for testing in testnet mode

## Payment Flow

The payment flow consists of three major phases:

### Phase I: Payment Creation and Server-Side Approval

1. **`createPayment`**: Your app's frontend creates the payment
2. **`onReadyForServerApproval`**: SDK obtains PaymentID and passes it to your app
3. **Frontend to Backend**: Your app sends PaymentID to your server
4. **Server-Side Approval**: Your server approves the payment with Pi Servers via `/approve` API

### Phase II: User Interaction and Blockchain Transaction

- Payment dialog becomes interactive
- User confirms, signs, and submits the transaction to Pi Blockchain
- Handled entirely by Pi Apps Platform and Pi Wallet
- Payment flow remains open until server-side completion

### Phase III: Server-Side Completion

5. **`onReadyForServerCompletion`**: SDK passes TxID to your app's frontend
6. **Frontend to Backend**: Your app sends TxID to your server
7. **Server-Side Completion**: Your server acknowledges the payment via `/complete` API
8. **Payment Flow Closes**: App becomes visible again, confirmation screen can be shown

## Prerequisites

### 1. Pi Developer Portal Setup

- Register your app at `pi://develop.pi`
- Configure app for testnet or mainnet
- Set up app wallet
- Complete app checklist

### 2. Environment Configuration

```typescript
// Environment variables
VITE_PI_APP_ID=your_app_id
VITE_PI_API_KEY=your_api_key
VITE_PI_VALIDATION_KEY=your_validation_key
VITE_PI_SANDBOX=true // for testnet
```

### 3. SDK Initialization

```html
<!-- index.html -->
<script src="https://sdk.minepi.com/pi-sdk.js"></script>
<script>
  Pi.init({ version: "2.0", sandbox: true });
</script>
```

## Implementation

### Core Payment Service

The `PiPaymentService` provides a complete implementation of the payment flow:

```typescript
import { 
  piPaymentService, 
  PaymentData, 
  PaymentCallbacks 
} from '../services/piPaymentService';

// Initialize the service
await piPaymentService.initialize();

// Create a payment
const paymentData: PaymentData = {
  amount: 1.0,
  memo: 'Purchase premium features',
  metadata: {
    itemId: 'premium_package',
    userId: 'user123'
  }
};

const callbacks: PaymentCallbacks = {
  onReadyForServerApproval: (paymentId: string) => {
    console.log('Payment ready for approval:', paymentId);
    // Send to your backend
    sendToBackend('/api/payments/approve', { paymentId });
  },
  onReadyForServerCompletion: (paymentId: string, txid: string) => {
    console.log('Payment ready for completion:', paymentId, txid);
    // Send to your backend
    sendToBackend('/api/payments/complete', { paymentId, txid });
  },
  onCancel: (paymentId: string) => {
    console.log('Payment cancelled:', paymentId);
  },
  onError: (error: Error, payment?: PaymentDTO) => {
    console.error('Payment error:', error, payment);
  }
};

piPaymentService.createPayment(paymentData, callbacks);
```

### React Hooks Integration

Use the `usePiSDK` hook for easy React integration:

```typescript
import { usePiSDK } from '../hooks/usePiSDK';

const MyComponent = () => {
  const { createPayment, isAuthenticated } = usePiSDK();

  const handlePurchase = () => {
    if (!isAuthenticated) {
      alert('Please authenticate first');
      return;
    }

    const paymentData = {
      amount: 1.0,
      memo: 'Premium package purchase',
      metadata: { package: 'premium' }
    };

    const callbacks = {
      onReadyForServerApproval: (paymentId: string) => {
        // Handle server approval
      },
      onReadyForServerCompletion: (paymentId: string, txid: string) => {
        // Handle server completion
      },
      onCancel: (paymentId: string) => {
        // Handle cancellation
      },
      onError: (error: Error) => {
        // Handle errors
      }
    };

    createPayment(paymentData, callbacks);
  };

  return (
    <button onClick={handlePurchase}>
      Purchase Premium Package
    </button>
  );
};
```

### Backend Integration

Your backend needs to handle two critical API endpoints:

#### 1. Payment Approval Endpoint

```typescript
// POST /api/payments/approve
app.post('/api/payments/approve', async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    // Call Pi Network API to approve payment
    const response = await fetch(
      `https://api.testnet.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${process.env.PI_API_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Approval failed: ${response.status}`);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. Payment Completion Endpoint

```typescript
// POST /api/payments/complete
app.post('/api/payments/complete', async (req, res) => {
  try {
    const { paymentId, txid } = req.body;
    
    // Call Pi Network API to complete payment
    const response = await fetch(
      `https://api.testnet.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${process.env.PI_API_KEY}`
        },
        body: JSON.stringify({ txid })
      }
    );

    if (!response.ok) {
      // CRITICAL: Do not mark payment as complete if server returns non-200
      throw new Error(`Completion failed: ${response.status}`);
    }

    // Payment verified - deliver goods/services
    await deliverGoods(paymentId);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Security Considerations

### 1. Server-Side Verification

**CRITICAL**: Always verify payments on your backend before delivering goods/services.

```typescript
// ❌ WRONG - Don't trust client-side only
if (clientSaysPaymentComplete) {
  deliverGoods(); // User could be cheating!
}

// ✅ CORRECT - Verify on backend
if (serverVerifiesPaymentComplete) {
  deliverGoods(); // Safe!
}
```

### 2. Incomplete Payment Handling

Handle incomplete payments that may occur due to app crashes or network issues:

```typescript
const onIncompletePaymentFound = (payment: PaymentDTO) => {
  console.log('Incomplete payment found:', payment.identifier);
  
  // Send to backend for completion
  sendToBackend('/api/payments/complete', {
    paymentId: payment.identifier,
    txid: payment.transaction?.txid
  });
};
```

### 3. Error Handling

Implement robust error handling for all payment scenarios:

```typescript
const callbacks: PaymentCallbacks = {
  onError: (error: Error, payment?: PaymentDTO) => {
    console.error('Payment error:', error);
    
    if (payment) {
      // Handle specific payment error
      handlePaymentError(payment, error);
    } else {
      // Handle general error
      showErrorMessage(error.message);
    }
  }
};
```

## Testing

### 1. Testnet Testing

Use the comprehensive test component:

```typescript
import { PiSDKTestComponent } from '../components/PiSDKTestComponent';

// In your app
<PiSDKTestComponent />
```

### 2. Manual Testing

Test the complete payment flow:

1. **Authentication**: Ensure user can authenticate
2. **Payment Creation**: Test payment creation with small amounts
3. **Server Approval**: Verify backend approval works
4. **User Interaction**: Test payment dialog in Pi Browser
5. **Server Completion**: Verify backend completion works
6. **Error Scenarios**: Test cancellation, network errors, etc.

### 3. Testnet Indicators

- Testnet apps show black and yellow stripes in Pi Browser
- Use testnet Pi coins (not real value)
- Verify all API calls go to testnet endpoints

## Troubleshooting

### Common Issues

1. **"User not authenticated"**
   - Ensure user has authenticated with `payments` scope
   - Check authentication status before creating payments

2. **"Payment service not ready"**
   - Ensure Pi SDK is initialized
   - Check if running in Pi Browser

3. **"Server approval failed"**
   - Verify API key is correct
   - Check network connectivity
   - Ensure payment ID is valid

4. **"Server completion failed"**
   - Verify transaction ID is correct
   - Check if payment was already completed
   - Ensure backend API is working

### Debug Logging

Enable detailed logging for troubleshooting:

```typescript
// In your payment service
console.log('💳 Creating payment:', paymentData);
console.log('📋 Payment ready for approval:', paymentId);
console.log('✅ Payment completed:', paymentId, txid);
```

## Best Practices

### 1. User Experience

- Show clear payment information (amount, memo)
- Provide loading states during payment processing
- Handle errors gracefully with user-friendly messages
- Allow payment cancellation

### 2. Backend Implementation

- Implement idempotent payment processing
- Store payment records in your database
- Implement retry logic for failed API calls
- Monitor payment success/failure rates

### 3. Security

- Never trust client-side payment data
- Always verify payments on your backend
- Implement proper error handling
- Use HTTPS for all API communications

### 4. Testing

- Test in testnet before mainnet
- Test all error scenarios
- Test incomplete payment handling
- Test with different Pi Browser versions

### 5. Monitoring

- Monitor payment success rates
- Track payment completion times
- Monitor for failed payments
- Alert on unusual payment patterns

## Resources

- [Pi Network Developer Portal](https://develop.pi)
- [Pi Network API Documentation](https://docs.minepi.com)
- [Pi Network SDK Reference](https://docs.minepi.com/sdk)
- [Testnet vs Mainnet Guide](https://docs.minepi.com/testnet)

## Support

For technical support:
- Pi Network Developer Community
- Pi Network Documentation
- Pi Network Support Portal

---

**Note**: This implementation follows the official Pi Network documentation and best practices. Always refer to the latest official documentation for the most up-to-date information. 