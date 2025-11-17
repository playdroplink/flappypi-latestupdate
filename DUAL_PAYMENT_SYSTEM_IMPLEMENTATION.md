# Dual Payment System Implementation

## Overview

The Flappy Pi game now features a comprehensive dual payment system that provides users with two payment options:

1. **Pi SDK Payment** - Direct integration with Pi Network's official SDK
2. **Manual Ledger Payment** - Direct wallet-to-wallet transfers with blockchain verification

## 🏗️ Architecture

### Core Components

- **`dualPaymentService.ts`** - Main service handling both payment methods
- **`DualPaymentModal.tsx`** - UI component for payment method selection and processing
- **Updated `PaymentOptionsModal.tsx`** - Enhanced with dual payment option
- **Updated `ShopModal.tsx`** - Integrated with dual payment system

### Payment Flow

```
User selects item → PaymentOptionsModal → DualPaymentModal → Payment Processing
                                                      ↓
                                    ┌─────────────────┴─────────────────┐
                                    ↓                                   ↓
                              Pi SDK Payment                    Manual Ledger
                              (Instant)                          (30 min expiry)
                                    ↓                                   ↓
                              Pi Network                          Wallet Transfer
                              Verification                        + Verification
```

## 🔧 Configuration

### Wallet Configuration

The system is configured to use the provided Pi Network wallet:

```typescript
// In dualPaymentService.ts
private readonly MERCHANT_WALLET_ADDRESS = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ';
private readonly MERCHANT_WALLET_USERNAME = 'flappypi2807';
```

### Network Configuration

- **Sandbox Mode**: Simulated payments for testing
- **Production Mode**: Real blockchain verification using Pi Network APIs
- **Mainnet Integration**: Uses `https://api.mainnet.minepi.com` for real transactions

## 💳 Payment Methods

### 1. Pi SDK Payment

**Features:**
- Instant processing through Pi Network
- Official SDK integration
- Automatic verification
- Best user experience

**Requirements:**
- Pi Browser or Pi SDK availability
- User authentication through Pi Network

**Flow:**
1. User clicks "Pi SDK Payment"
2. System checks Pi SDK availability
3. Creates payment through `window.Pi.createPayment()`
4. Processes payment and unlocks content immediately

### 2. Manual Ledger Payment

**Features:**
- Direct wallet-to-wallet transfers
- QR code generation for easy scanning
- 30-minute payment expiry
- Manual verification system
- Blockchain transaction verification

**Flow:**
1. User selects "Manual Payment"
2. System generates unique transaction with verification code
3. User sends Pi to merchant wallet
4. User provides verification code and optional transaction hash
5. System verifies payment and unlocks content

## 🛡️ Security Features

### Transaction Security

- **Unique Transaction IDs**: `FLAPPY_DUAL_{timestamp}_{hash}`
- **Verification Codes**: 6-digit numeric codes
- **Security Hashes**: Cryptographic verification
- **Expiry System**: 30-minute payment windows
- **Fraud Prevention**: Risk scoring and suspicious domain detection

### Verification Process

1. **Code Verification**: 6-digit verification code matching
2. **Hash Verification**: Optional blockchain transaction hash
3. **Amount Verification**: Ensures correct payment amount
4. **Time Verification**: Prevents expired payment acceptance
5. **Attempt Limiting**: Maximum 3 verification attempts

## 📱 User Interface

### Payment Method Selection

The dual payment modal presents users with two clear options:

```
┌─────────────────────────────────────────────────────────────┐
│                    Choose Payment Method                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Pi SDK        │  │  Manual Ledger  │                │
│  │   Payment       │  │   Payment       │                │
│  │                 │  │                 │                │
│  │ Instant &       │  │ Direct to       │                │
│  │ Secure          │  │ Wallet          │                │
│  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Manual Payment Interface

When users select manual payment, they see:

1. **Customer Information Form**
   - Name and email input fields
   
2. **Transaction Details**
   - Transaction ID, Order ID
   - Verification code (6 digits)
   - Countdown timer (30 minutes)
   
3. **Wallet Information**
   - Merchant wallet address (copyable)
   - Username and amount
   - Payment memo
   
4. **QR Code**
   - Scannable payment QR code
   
5. **Verification Form**
   - Transaction hash input (optional)
   - Verification code input
   - Verify button

## 🔄 Integration Points

### Existing Systems

The dual payment system integrates seamlessly with:

- **Shop System**: All shop items support dual payment
- **Subscription Plans**: Subscription purchases use dual payment
- **Inventory System**: Successful payments unlock items immediately
- **User Profile**: Payment history and transaction tracking

### API Integration

#### Pi Network APIs

```typescript
// Account Information
GET https://api.mainnet.minepi.com/accounts/{wallet_address}

// Transaction History
GET https://api.mainnet.minepi.com/accounts/{wallet_address}/transactions

// Payment Verification
POST /api/verify-payment
```

#### Local Storage

```typescript
// Transaction Storage
localStorage.setItem('flappypi-dual-transactions', JSON.stringify(transactions))

// User Preferences
localStorage.setItem('flappypi-payment-method', 'pi_sdk' | 'manual_ledger')
```

## 🚀 Usage Examples

### Basic Implementation

```typescript
import { dualPaymentService } from '@/services/dualPaymentService';
import DualPaymentModal from '@/components/DualPaymentModal';

// In your component
const [showDualPayment, setShowDualPayment] = useState(false);

const handlePaymentSuccess = (transaction) => {
  console.log('Payment successful:', transaction);
  // Unlock content, update UI, etc.
};

const handlePaymentError = (error) => {
  console.error('Payment failed:', error);
  // Show error message, retry options, etc.
};

// Render the modal
<DualPaymentModal
  isOpen={showDualPayment}
  onClose={() => setShowDualPayment(false)}
  item={{
    id: 'skin_001',
    name: 'Golden Bird',
    piPrice: 5,
    image: '/skins/golden-bird.png'
  }}
  onPaymentSuccess={handlePaymentSuccess}
  onPaymentError={handlePaymentError}
/>
```

### Service Usage

```typescript
// Create a new transaction
const transaction = await dualPaymentService.createDualTransaction(
  'skin_001',
  'Golden Bird',
  'user@example.com',
  'John Doe',
  1,
  5,
  'Pi',
  5,
  5,
  'Purchase of Golden Bird skin'
);

// Process Pi SDK payment
const result = await dualPaymentService.processPiSDKPayment(
  5,
  'Flappy Pi: Golden Bird',
  { type: 'skin_purchase', skinId: 'skin_001' }
);

// Verify manual payment
const verification = await dualPaymentService.verifyManualPayment({
  transactionId: 'FLAPPY_DUAL_1234567890_ABC12345',
  verificationCode: '123456',
  customerEmail: 'user@example.com',
  piTransactionHash: 'optional_hash_here',
  amount: 5,
  timestamp: new Date()
});
```

## 🧪 Testing

### Sandbox Mode

In sandbox mode, the system:
- Simulates all payment processes
- Accepts any valid-looking transaction hashes
- Provides realistic API response delays
- Logs all operations for debugging

### Production Mode

In production mode, the system:
- Makes real API calls to Pi Network
- Verifies actual blockchain transactions
- Enforces strict security measures
- Provides real-time payment status

## 📊 Monitoring & Analytics

### Transaction Tracking

The system tracks:
- Payment method selection rates
- Success/failure rates by method
- Verification attempt patterns
- Fraud detection metrics
- User payment preferences

### Logging

Comprehensive logging for:
- Payment initiation
- Transaction creation
- Verification attempts
- Success/failure events
- Error conditions

## 🔮 Future Enhancements

### Planned Features

1. **Multi-Currency Support**
   - Support for other cryptocurrencies
   - Fiat payment options
   
2. **Advanced Verification**
   - Biometric verification
   - Multi-factor authentication
   
3. **Payment Scheduling**
   - Recurring payments
   - Payment reminders
   
4. **Analytics Dashboard**
   - Real-time payment metrics
   - User behavior analysis
   - Revenue tracking

### Integration Opportunities

- **Wallet Connect**: Support for additional wallet types
- **Payment Processors**: Integration with traditional payment systems
- **Loyalty Programs**: Reward systems for payment method usage
- **Social Features**: Payment sharing and gifting

## 🛠️ Troubleshooting

### Common Issues

1. **Pi SDK Not Available**
   - Ensure Pi Browser is being used
   - Check Pi SDK initialization
   - Verify network connectivity

2. **Manual Payment Verification Fails**
   - Check verification code accuracy
   - Ensure payment hasn't expired
   - Verify transaction hash format

3. **QR Code Generation Issues**
   - Check QR code library installation
   - Verify wallet address format
   - Ensure sufficient memory for image generation

### Debug Mode

Enable debug logging by setting:

```typescript
localStorage.setItem('flappypi-debug-mode', 'true');
```

This provides detailed console output for all payment operations.

## 📚 API Reference

### DualPaymentService Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `createDualTransaction` | Creates new payment transaction | Product details, customer info | `DualPaymentTransaction` |
| `processPiSDKPayment` | Processes Pi SDK payment | Amount, memo, metadata | Payment result |
| `verifyManualPayment` | Verifies manual payment | Verification data | Verification result |
| `getMerchantWalletAddress` | Gets merchant wallet address | None | Wallet address string |
| `getTransaction` | Retrieves transaction by ID | Transaction ID | Transaction object |

### Event Handlers

| Event | Description | Data |
|-------|-------------|------|
| `onPaymentSuccess` | Payment completed successfully | Transaction object |
| `onPaymentError` | Payment failed or error occurred | Error message string |

## 🎯 Best Practices

### Security

1. **Always verify payment amounts** before processing
2. **Use HTTPS** for all API communications
3. **Implement rate limiting** for verification attempts
4. **Log all payment activities** for audit trails
5. **Validate user inputs** thoroughly

### User Experience

1. **Provide clear payment instructions** for manual payments
2. **Show real-time countdown** for payment expiry
3. **Offer multiple payment options** to increase conversion
4. **Provide immediate feedback** for all user actions
5. **Include helpful error messages** for failed operations

### Performance

1. **Cache wallet information** to reduce API calls
2. **Use efficient QR code generation** for better performance
3. **Implement proper cleanup** for expired transactions
4. **Optimize image loading** for payment modals
5. **Use debounced input handling** for form fields

## 📄 License

This dual payment system is part of the Flappy Pi game and follows the same licensing terms as the main project.

---

**Note**: This system is designed to be production-ready and includes comprehensive error handling, security measures, and user experience optimizations. Always test thoroughly in sandbox mode before deploying to production.
