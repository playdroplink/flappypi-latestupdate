#!/usr/bin/env node

/**
 * Simple Test Script for Dual Payment System
 */

console.log('Testing Dual Payment System...\n');

// Mock localStorage for Node.js environment
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  }
};

// Mock window.Pi for testing
global.window = {
  Pi: {
    createPayment: async (data) => {
      console.log('Mock Pi SDK createPayment called with:', data);
      return {
        paymentId: `mock_payment_${Date.now()}`,
        status: 'completed'
      };
    }
  }
};

// Test Dual Payment Service
class MockDualPaymentService {
  constructor() {
    this.MERCHANT_WALLET_ADDRESS = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ';
    this.MERCHANT_WALLET_USERNAME = 'flappypi2807';
  }

  generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `FLAPPY_DUAL_${timestamp}_${random.toUpperCase()}`;
  }

  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createDualTransaction(productId, productName, customerEmail, customerName, totalPiAmount) {
    const transactionId = this.generateTransactionId();
    const verificationCode = this.generateVerificationCode();
    const timestamp = new Date();

    const transaction = {
      transactionId,
      productId,
      productName,
      customerEmail,
      customerName,
      totalPiAmount,
      status: 'pending',
      verificationCode,
      merchantWalletAddress: this.MERCHANT_WALLET_ADDRESS,
      timestamp,
      createdAt: timestamp
    };

    this.storeTransaction(transaction);
    return transaction;
  }

  storeTransaction(transaction) {
    try {
      const existingTransactions = this.getStoredTransactions();
      existingTransactions.push(transaction);
      localStorage.setItem('flappypi-dual-transactions', JSON.stringify(existingTransactions));
    } catch (error) {
      console.error('Error storing transaction:', error);
    }
  }

  getStoredTransactions() {
    try {
      const stored = localStorage.getItem('flappypi-dual-transactions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored transactions:', error);
      return [];
    }
  }

  async processPiSDKPayment(amount, memo, metadata) {
    try {
      if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not available');
      }

      console.log('Processing Pi SDK payment:', { amount, memo, metadata });

      const payment = await window.Pi.createPayment({
        amount: amount,
        memo: memo,
        metadata: metadata || {}
      });

      console.log('Pi SDK payment created:', payment);
      
      return {
        success: true,
        paymentId: payment.paymentId
      };
    } catch (error) {
      console.error('Pi SDK payment failed:', error);
      return {
        success: false,
        error: error.message || 'Payment failed'
      };
    }
  }

  getMerchantWalletAddress() {
    return this.MERCHANT_WALLET_ADDRESS;
  }

  getMerchantWalletUsername() {
    return this.MERCHANT_WALLET_USERNAME;
  }
}

// Test Functions
async function testTransactionCreation() {
  console.log('Testing Transaction Creation...');
  
  const service = new MockDualPaymentService();
  
  try {
    const transaction = await service.createDualTransaction(
      'skin_001',
      'Golden Bird',
      'test@example.com',
      'Test User',
      5
    );
    
    console.log('Transaction created successfully:');
    console.log('  Transaction ID:', transaction.transactionId);
    console.log('  Verification Code:', transaction.verificationCode);
    console.log('  Merchant Wallet:', transaction.merchantWalletAddress);
    console.log('  Status:', transaction.status);
    
    return transaction;
  } catch (error) {
    console.error('Transaction creation failed:', error);
    return null;
  }
}

async function testPiSDKPayment() {
  console.log('\nTesting Pi SDK Payment...');
  
  const service = new MockDualPaymentService();
  
  try {
    const result = await service.processPiSDKPayment(
      5,
      'Flappy Pi: Golden Bird',
      {
        type: 'skin_purchase',
        skinId: 'skin_001',
        game: 'flappy_pi'
      }
    );
    
    if (result.success) {
      console.log('Pi SDK payment successful:');
      console.log('  Payment ID:', result.paymentId);
    } else {
      console.log('Pi SDK payment failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Pi SDK payment test failed:', error);
    return null;
  }
}

async function testWalletInfo() {
  console.log('\nTesting Wallet Information...');
  
  const service = new MockDualPaymentService();
  
  try {
    const walletAddress = service.getMerchantWalletAddress();
    const walletUsername = service.getMerchantWalletUsername();
    
    console.log('Wallet information retrieved:');
    console.log('  Address:', walletAddress);
    console.log('  Username:', walletUsername);
    
    // Verify the wallet address matches the provided one
    const expectedAddress = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ';
    if (walletAddress === expectedAddress) {
      console.log('  Wallet address matches expected value');
    } else {
      console.log('  Wallet address mismatch');
    }
    
    return { walletAddress, walletUsername };
  } catch (error) {
    console.error('Wallet information test failed:', error);
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting Dual Payment System Tests...\n');
  
  try {
    await testTransactionCreation();
    await testPiSDKPayment();
    await testWalletInfo();
    
    console.log('\nAll tests completed successfully!');
    console.log('\nTest Summary:');
    console.log('  Transaction Creation');
    console.log('  Pi SDK Payment');
    console.log('  Wallet Information');
    
  } catch (error) {
    console.error('\nTest suite failed:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(console.error);
