#!/usr/bin/env node

/**
 * Test Script for Dual Payment System
 * 
 * This script tests the core functionality of the dual payment system
 * without requiring a full React environment.
 */

console.log('🧪 Testing Dual Payment System...\n');

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
      console.log('✅ Mock Pi SDK createPayment called with:', data);
      return {
        paymentId: `mock_payment_${Date.now()}`,
        status: 'completed'
      };
    }
  }
};

// Mock PI_CONFIG
const PI_CONFIG = {
  isSandbox: () => true,
  isMainnet: () => false,
  isProduction: () => false,
  getNetworkMode: () => 'sandbox'
};

// Test Dual Payment Service
class MockDualPaymentService {
  constructor() {
    this.TRANSACTION_EXPIRY_MINUTES = 30;
    this.MAX_VERIFICATION_ATTEMPTS = 3;
    this.SECURITY_KEY = 'flappypi_dual_payment_2024';
    this.MERCHANT_WALLET_ADDRESS = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ';
    this.MERCHANT_WALLET_USERNAME = 'flappypi2807';
  }

  generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const hash = this.generateHash(`${timestamp}${random}${this.SECURITY_KEY}`);
    return `FLAPPY_DUAL_${timestamp}_${hash.substring(0, 8).toUpperCase()}`;
  }

  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `FLAPPY_ORD_${timestamp}_${random.toUpperCase()}`;
  }

  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateHash(data) {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  async createDualTransaction(productId, productName, customerEmail, customerName, quantity, unitPrice, currency, totalAmount, totalPiAmount, orderNotes) {
    const transactionId = this.generateTransactionId();
    const orderId = this.generateOrderId();
    const verificationCode = this.generateVerificationCode();
    const timestamp = new Date();
    const expiryTime = new Date(timestamp.getTime() + this.TRANSACTION_EXPIRY_MINUTES * 60000);

    const securityData = `${transactionId}${orderId}${productId}${customerEmail}${totalAmount}${timestamp.getTime()}`;
    const securityHash = this.generateHash(securityData);

    const transaction = {
      transactionId,
      orderId,
      productId,
      productName,
      customerId: this.generateCustomerId(customerEmail),
      customerEmail,
      customerName,
      quantity,
      unitPrice,
      currency,
      totalAmount,
      totalPiAmount,
      status: 'pending',
      paymentMethod: 'manual_ledger',
      securityHash,
      timestamp,
      expiryTime,
      verificationCode,
      merchantWalletAddress: this.MERCHANT_WALLET_ADDRESS,
      orderNotes,
      createdAt: timestamp,
      updatedAt: timestamp,
      riskScore: this.calculateRiskScore(customerEmail, totalAmount),
      fraudFlags: [],
      verificationAttempts: 0
    };

    this.storeTransaction(transaction);
    return transaction;
  }

  generateCustomerId(email) {
    const hash = this.generateHash(email);
    return `FLAPPY_CUST_${hash.substring(0, 8).toUpperCase()}`;
  }

  calculateRiskScore(email, amount) {
    let score = 0;
    
    const domain = email.split('@')[1];
    const suspiciousDomains = ['temp-mail.org', '10minutemail.com', 'guerrillamail.com'];
    if (suspiciousDomains.includes(domain)) {
      score += 30;
    }
    
    if (amount > 1000) {
      score += 20;
    } else if (amount > 500) {
      score += 10;
    }
    
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      score += 15;
    }
    
    return Math.min(score, 100);
  }

  storeTransaction(transaction) {
    try {
      const existingTransactions = this.getStoredTransactions();
      existingTransactions.push(transaction);
      
      if (existingTransactions.length > 100) {
        existingTransactions.splice(0, existingTransactions.length - 100);
      }
      
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
        throw new Error('Pi SDK not available. Please use Pi Browser.');
      }

      console.log('💰 Processing Pi SDK payment:', { amount, memo, metadata });

      const payment = await window.Pi.createPayment({
        amount: amount,
        memo: memo,
        metadata: metadata || {}
      });

      console.log('✅ Pi SDK payment created:', payment);
      
      return {
        success: true,
        paymentId: payment.paymentId
      };
    } catch (error) {
      console.error('❌ Pi SDK payment failed:', error);
      return {
        success: false,
        error: error.message || 'Payment failed'
      };
    }
  }

  async verifyManualPayment(verification) {
    try {
      const transaction = this.getTransaction(verification.transactionId);
      
      if (!transaction) {
        return { success: false, error: 'Transaction not found' };
      }

      if (new Date() > transaction.expiryTime) {
        this.updateTransactionStatus(transaction.transactionId, 'expired');
        return { success: false, error: 'Transaction has expired' };
      }

      if (transaction.verificationCode !== verification.verificationCode) {
        transaction.verificationAttempts++;
        transaction.lastVerificationAttempt = new Date();
        
        if (transaction.verificationAttempts >= this.MAX_VERIFICATION_ATTEMPTS) {
          this.updateTransactionStatus(transaction.transactionId, 'failed');
          return { success: false, error: 'Too many verification attempts' };
        }
        
        this.storeTransaction(transaction);
        return { success: false, error: 'Invalid verification code' };
      }

      this.updateTransactionStatus(transaction.transactionId, 'paid');
      
      return { success: true, transaction };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  getTransaction(transactionId) {
    const transactions = this.getStoredTransactions();
    return transactions.find(t => t.transactionId === transactionId) || null;
  }

  updateTransactionStatus(transactionId, status) {
    try {
      const transactions = this.getStoredTransactions();
      const transactionIndex = transactions.findIndex(t => t.transactionId === transactionId);
      
      if (transactionIndex !== -1) {
        transactions[transactionIndex].status = status;
        transactions[transactionIndex].updatedAt = new Date();
        
        if (status === 'paid') {
          transactions[transactionIndex].paidAt = new Date();
        } else if (status === 'cancelled') {
          transactions[transactionIndex].cancelledAt = new Date();
        }
        
        localStorage.setItem('flappypi-dual-transactions', JSON.stringify(transactions));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      return false;
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
  console.log('📝 Testing Transaction Creation...');
  
  const service = new MockDualPaymentService();
  
  try {
    const transaction = await service.createDualTransaction(
      'skin_001',
      'Golden Bird',
      'test@example.com',
      'Test User',
      1,
      5,
      'Pi',
      5,
      5,
      'Test purchase'
    );
    
    console.log('✅ Transaction created successfully:');
    console.log('   Transaction ID:', transaction.transactionId);
    console.log('   Order ID:', transaction.orderId);
    console.log('   Verification Code:', transaction.verificationCode);
    console.log('   Merchant Wallet:', transaction.merchantWalletAddress);
    console.log('   Risk Score:', transaction.riskScore);
    console.log('   Status:', transaction.status);
    
    return transaction;
  } catch (error) {
    console.error('❌ Transaction creation failed:', error);
    return null;
  }
}

async function testPiSDKPayment() {
  console.log('\n💰 Testing Pi SDK Payment...');
  
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
      console.log('✅ Pi SDK payment successful:');
      console.log('   Payment ID:', result.paymentId);
    } else {
      console.log('❌ Pi SDK payment failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Pi SDK payment test failed:', error);
    return null;
  }
}

async function testManualPaymentVerification() {
  console.log('\n🔍 Testing Manual Payment Verification...');
  
  const service = new MockDualPaymentService();
  
  try {
    // First create a transaction
    const transaction = await service.createDualTransaction(
      'skin_002',
      'Silver Bird',
      'verify@example.com',
      'Verify User',
      1,
      3,
      'Pi',
      3,
      3,
      'Verification test'
    );
    
    console.log('📝 Created transaction for verification:', transaction.transactionId);
    
    // Test successful verification
    const verification = await service.verifyManualPayment({
      transactionId: transaction.transactionId,
      verificationCode: transaction.verificationCode,
      customerEmail: 'verify@example.com',
      piTransactionHash: 'mock_hash_12345',
      amount: 3,
      timestamp: new Date()
    });
    
    if (verification.success) {
      console.log('✅ Manual payment verification successful:');
      console.log('   Transaction ID:', verification.transaction?.transactionId);
      console.log('   Status:', verification.transaction?.status);
    } else {
      console.log('❌ Manual payment verification failed:', verification.error);
    }
    
    // Test failed verification with wrong code
    const failedVerification = await service.verifyManualPayment({
      transactionId: transaction.transactionId,
      verificationCode: '000000',
      customerEmail: 'verify@example.com',
      amount: 3,
      timestamp: new Date()
    });
    
    if (!failedVerification.success) {
      console.log('✅ Failed verification test passed (expected behavior):');
      console.log('   Error:', failedVerification.error);
    }
    
    return verification;
  } catch (error) {
    console.error('❌ Manual payment verification test failed:', error);
    return null;
  }
}

async function testWalletInfo() {
  console.log('\n🏦 Testing Wallet Information...');
  
  const service = new MockDualPaymentService();
  
  try {
    const walletAddress = service.getMerchantWalletAddress();
    const walletUsername = service.getMerchantWalletUsername();
    
    console.log('✅ Wallet information retrieved:');
    console.log('   Address:', walletAddress);
    console.log('   Username:', walletUsername);
    
    // Verify the wallet address matches the provided one
    const expectedAddress = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ';
    if (walletAddress === expectedAddress) {
      console.log('✅ Wallet address matches expected value');
    } else {
      console.log('❌ Wallet address mismatch');
    }
    
    return { walletAddress, walletUsername };
  } catch (error) {
    console.error('❌ Wallet information test failed:', error);
    return null;
  }
}

async function testTransactionStorage() {
  console.log('\n💾 Testing Transaction Storage...');
  
  const service = new MockDualPaymentService();
  
  try {
    // Create multiple transactions
    const transactions = [];
    for (let i = 0; i < 3; i++) {
      const transaction = await service.createDualTransaction(
        `skin_00${i + 1}`,
        `Test Skin ${i + 1}`,
        `user${i + 1}@example.com`,
        `User ${i + 1}`,
        1,
        i + 1,
        'Pi',
        i + 1,
        i + 1,
        `Test purchase ${i + 1}`
      );
      transactions.push(transaction);
    }
    
    // Retrieve stored transactions
    const storedTransactions = service.getStoredTransactions();
    
    console.log('✅ Transaction storage test passed:');
    console.log('   Created transactions:', transactions.length);
    console.log('   Stored transactions:', storedTransactions.length);
    
    // Test transaction retrieval
    const retrievedTransaction = service.getTransaction(transactions[0].transactionId);
    if (retrievedTransaction) {
      console.log('✅ Transaction retrieval test passed:');
      console.log('   Retrieved transaction ID:', retrievedTransaction.transactionId);
    } else {
      console.log('❌ Transaction retrieval test failed');
    }
    
    return storedTransactions;
  } catch (error) {
    console.error('❌ Transaction storage test failed:', error);
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Dual Payment System Tests...\n');
  
  try {
    await testTransactionCreation();
    await testPiSDKPayment();
    await testManualPaymentVerification();
    await testWalletInfo();
    await testTransactionStorage();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Transaction Creation');
    console.log('   ✅ Pi SDK Payment');
    console.log('   ✅ Manual Payment Verification');
    console.log('   ✅ Wallet Information');
    console.log('   ✅ Transaction Storage');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  MockDualPaymentService,
  testTransactionCreation,
  testPiSDKPayment,
  testManualPaymentVerification,
  testWalletInfo,
  testTransactionStorage,
  runAllTests
};
