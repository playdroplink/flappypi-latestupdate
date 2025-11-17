# Sandbox Mode Implementation - Manual Payment System

## 🎯 **Overview**

This document describes the implementation of sandbox mode for the Flappy Pi manual payment system. Sandbox mode allows for testing and development without using real Pi Network mainnet transactions.

## 🔧 **Sandbox Mode Configuration**

### **1. Pi Configuration Updates**

The following changes have been made to `src/config/piConfig.ts`:

```typescript
// Network Configuration - SANDBOX MODE
NETWORK_MODE: 'sandbox' as const,
SANDBOX_MODE: true, // SANDBOX: ENABLED FOR TESTING
MAINNET_MODE: false,  // SANDBOX: NO MAINNET
IS_PRODUCTION: false, // SANDBOX FLAG

// SDK Configuration - SANDBOX
SDK_CONFIG: {
  version: "2.0",
  sandbox: true, // SANDBOX: ENABLED FOR TESTING
  validationKey: '...'
},

// Security Configuration - SANDBOX
REQUIRE_PI_BROWSER: false, // SANDBOX: NO PI BROWSER REQUIRED
REQUIRE_AUTHENTICATION: false, // SANDBOX: NO AUTHENTICATION REQUIRED
VALIDATE_PAYMENTS: false, // SANDBOX: NO PAYMENT VALIDATION
```

### **2. Key Sandbox Features**

- ✅ **No Pi Browser Required**: Works in any browser
- ✅ **No Authentication Required**: No sign-in needed
- ✅ **No Real Payments**: All transactions are simulated
- ✅ **Flexible Verification**: Accepts any valid-looking transaction hash
- ✅ **Empty Hash Support**: Can test without providing transaction hash
- ✅ **Visual Indicators**: Clear sandbox mode indicators throughout UI

## 🛠️ **Technical Implementation**

### **1. Manual Payment Service Updates**

The `manualPaymentService.ts` has been enhanced with sandbox-specific logic:

```typescript
// Verify Pi Ledger transaction
async verifyPiLedgerTransaction(
  transactionHash: string,
  expectedToAddress: string,
  expectedAmount: number,
  expectedTimestamp: Date
): Promise<{ success: boolean; error?: string; transaction?: PiLedgerTransaction }> {
  try {
    // Check if we're in sandbox mode
    if (PI_CONFIG.isSandbox()) {
      console.log('🔍 SANDBOX MODE: Simulating Pi Ledger verification:', {
        hash: transactionHash,
        expectedTo: expectedToAddress,
        expectedAmount,
        expectedTimestamp
      });

      // In sandbox mode, we'll simulate successful verification
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For sandbox testing, accept any transaction hash that looks valid
      if (transactionHash && transactionHash.length > 5) {
        const ledgerTransaction: PiLedgerTransaction = {
          hash: transactionHash,
          from: 'sandbox_customer_wallet',
          to: expectedToAddress,
          amount: expectedAmount,
          memo: `Flappy Pi Payment (SANDBOX)`,
          timestamp: new Date(),
          blockNumber: Math.floor(Math.random() * 1000000),
          status: 'confirmed'
        };

        console.log('✅ SANDBOX: Payment verification successful');
        return { success: true, transaction: ledgerTransaction };
      }

      // For sandbox testing, also accept empty hash (for testing without real transaction)
      if (!transactionHash || transactionHash === '') {
        const ledgerTransaction: PiLedgerTransaction = {
          hash: `SANDBOX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          from: 'sandbox_customer_wallet',
          to: expectedToAddress,
          amount: expectedAmount,
          memo: `Flappy Pi Payment (SANDBOX - No Hash Provided)`,
          timestamp: new Date(),
          blockNumber: Math.floor(Math.random() * 1000000),
          status: 'confirmed'
        };

        console.log('✅ SANDBOX: Payment verification successful (no hash provided)');
        return { success: true, transaction: ledgerTransaction };
      }

      return { success: false, error: 'Invalid transaction hash in sandbox mode' };
    }

    // Production mode - real blockchain verification
    // ... production logic
  } catch (error) {
    console.error('Error verifying Pi Ledger transaction:', error);
    return { success: false, error: 'Ledger verification failed' };
  }
}
```

### **2. UI Updates**

#### **Manual Payment Modal**
- Added sandbox mode indicator in header
- Updated descriptions for sandbox mode
- Modified footer to show "Sandbox Mode" instead of "Secure Payment"

#### **Shop Modal**
- Added sandbox mode indicator in shop header
- Updated Pi Browser status to show "Testing" in sandbox mode
- Modified user info section to reflect sandbox status

## 🎯 **Sandbox Mode Benefits**

### **1. Development & Testing**
- ✅ **No Real Money**: Test without spending actual Pi tokens
- ✅ **No Pi Browser**: Test in any browser environment
- ✅ **No Authentication**: Skip sign-in requirements
- ✅ **Flexible Testing**: Test various scenarios easily

### **2. User Experience**
- ✅ **Clear Indicators**: Users know they're in sandbox mode
- ✅ **Same Interface**: Identical UI to production mode
- ✅ **Realistic Flow**: Complete payment flow simulation
- ✅ **Error Testing**: Can test error scenarios safely

### **3. Developer Experience**
- ✅ **Easy Switching**: Toggle between sandbox and production
- ✅ **Comprehensive Logging**: Detailed console logs for debugging
- ✅ **Flexible Verification**: Multiple testing scenarios supported
- ✅ **Production Ready**: Same codebase works in both modes

## 🔄 **Testing Scenarios**

### **1. Successful Payment Flow**
1. User clicks "Manual Payment" button
2. System generates QR code and transaction data
3. User enters verification code
4. System simulates successful verification
5. Item is delivered to user

### **2. Empty Transaction Hash**
1. User skips transaction hash field
2. System generates sandbox transaction hash
3. Payment verification succeeds
4. Item is delivered to user

### **3. Invalid Verification Code**
1. User enters wrong verification code
2. System shows error message
3. User can retry with correct code

### **4. Expired Transaction**
1. User waits 30+ minutes
2. System shows expiration error
3. User can start new payment session

## 📋 **Configuration Options**

### **1. Enable/Disable Sandbox Mode**

To switch between sandbox and production modes, update `src/config/piConfig.ts`:

```typescript
// For Sandbox Mode
NETWORK_MODE: 'sandbox' as const,
SANDBOX_MODE: true,
MAINNET_MODE: false,
IS_PRODUCTION: false,

// For Production Mode
NETWORK_MODE: 'mainnet' as const,
SANDBOX_MODE: false,
MAINNET_MODE: true,
IS_PRODUCTION: true,
```

### **2. Sandbox-Specific Settings**

```typescript
// Security Configuration - SANDBOX
REQUIRE_PI_BROWSER: false, // No Pi Browser required
REQUIRE_AUTHENTICATION: false, // No authentication required
VALIDATE_PAYMENTS: false, // No real payment validation

// SDK Configuration - SANDBOX
SDK_CONFIG: {
  version: "2.0",
  sandbox: true, // Enable sandbox mode
  validationKey: '...'
}
```

## 🚀 **Usage Instructions**

### **For Developers**
1. **Enable Sandbox Mode**: Set `SANDBOX_MODE: true` in `piConfig.ts`
2. **Test Payment Flow**: Use manual payment option in shop
3. **Monitor Console**: Check browser console for sandbox logs
4. **Test Scenarios**: Try different verification codes and transaction hashes

### **For Users**
1. **Identify Sandbox Mode**: Look for "SANDBOX" indicators in UI
2. **Test Payments**: Use manual payment without real Pi tokens
3. **No Pi Browser**: Works in any browser
4. **No Sign-in**: No authentication required

## 🔍 **Console Logging**

Sandbox mode provides detailed console logging:

```
🔍 SANDBOX MODE: Simulating Pi Ledger verification: {
  hash: "test_hash_123",
  expectedTo: "flappypi2807",
  expectedAmount: 5,
  expectedTimestamp: "2024-01-15T10:30:00.000Z"
}

✅ SANDBOX: Payment verification successful

✅ SANDBOX: Payment verification successful (no hash provided)
```

## ✅ **Status**

- ✅ **Sandbox Mode Enabled**: Configuration updated
- ✅ **UI Indicators**: Clear sandbox mode indicators
- ✅ **Flexible Verification**: Supports various testing scenarios
- ✅ **Console Logging**: Comprehensive debugging information
- ✅ **Production Ready**: Easy switching between modes
- ✅ **User Friendly**: Clear messaging for sandbox mode
- ✅ **Developer Friendly**: Easy testing and development

The sandbox mode is now fully functional and ready for testing. Users can test the manual payment system without requiring Pi Browser, authentication, or real Pi tokens.
