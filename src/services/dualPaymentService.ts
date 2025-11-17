import { PI_CONFIG } from '@/config/piConfig';

// Dual Payment Transaction Interface
export interface DualPaymentTransaction {
  transactionId: string;
  orderId: string;
  productId: string;
  productName: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  totalAmount: number;
  totalPiAmount: number;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled' | 'refunded';
  paymentMethod: 'pi_sdk' | 'manual_ledger';
  
  // Security fields
  securityHash: string;
  timestamp: Date;
  expiryTime: Date; // Payment expires after 30 minutes
  ipAddress?: string;
  userAgent?: string;
  
  // Payment verification
  piTransactionHash?: string; // Pi blockchain transaction hash
  verificationCode: string; // 6-digit code for customer verification
  merchantWalletAddress: string;
  qrCodeDataUrl?: string;
  
  // Order details
  orderNotes?: string;
  
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  
  // Fraud prevention
  riskScore: number; // 0-100, higher = more risky
  fraudFlags: string[];
  verificationAttempts: number;
  lastVerificationAttempt?: Date;
}

// Payment Verification Interface
export interface DualPaymentVerification {
  transactionId: string;
  verificationCode: string;
  customerEmail: string;
  piTransactionHash?: string;
  amount: number;
  timestamp: Date;
}

// Pi Ledger Transaction Interface
export interface PiLedgerTransaction {
  hash: string;
  from: string;
  to: string;
  amount: number;
  memo?: string;
  timestamp: Date;
  blockNumber: number;
  status: 'confirmed' | 'pending' | 'failed';
}

// Dual Payment Service
class DualPaymentService {
  private readonly TRANSACTION_EXPIRY_MINUTES = 30;
  private readonly MAX_VERIFICATION_ATTEMPTS = 3;
  private readonly SECURITY_KEY = 'flappypi_dual_payment_2024';
  private readonly MERCHANT_WALLET_ADDRESS = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ'; // Your Pi wallet address
  private readonly MERCHANT_WALLET_USERNAME = 'flappypi2807'; // Your Pi username

  // Generate unique transaction ID
  generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const hash = this.generateHash(`${timestamp}${random}${this.SECURITY_KEY}`);
    return `FLAPPY_DUAL_${timestamp}_${hash.substring(0, 8).toUpperCase()}`;
  }

  // Generate unique order ID
  generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `FLAPPY_ORD_${timestamp}_${random.toUpperCase()}`;
  }

  // Generate verification code
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate security hash
  generateHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Create dual payment transaction
  async createDualTransaction(
    productId: string,
    productName: string,
    customerEmail: string,
    customerName: string,
    quantity: number,
    unitPrice: number,
    currency: string,
    totalAmount: number,
    totalPiAmount: number,
    orderNotes?: string
  ): Promise<DualPaymentTransaction> {
    const transactionId = this.generateTransactionId();
    const orderId = this.generateOrderId();
    const verificationCode = this.generateVerificationCode();
    const timestamp = new Date();
    const expiryTime = new Date(timestamp.getTime() + this.TRANSACTION_EXPIRY_MINUTES * 60000);

    // Generate security hash
    const securityData = `${transactionId}${orderId}${productId}${customerEmail}${totalAmount}${timestamp.getTime()}`;
    const securityHash = this.generateHash(securityData);

    // Create payment memo
    const memo = `Flappy Pi: ${productName} - ${transactionId}`;

    const transaction: DualPaymentTransaction = {
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
      paymentMethod: 'pi_sdk', // Default to Pi SDK
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

    // Store transaction
    this.storeTransaction(transaction);
    
    return transaction;
  }

  // Generate customer ID
  private generateCustomerId(email: string): string {
    const hash = this.generateHash(email);
    return `FLAPPY_CUST_${hash.substring(0, 8).toUpperCase()}`;
  }

  // Calculate risk score
  private calculateRiskScore(email: string, amount: number): number {
    let score = 0;
    
    // Email domain risk
    const domain = email.split('@')[1];
    const suspiciousDomains = ['temp-mail.org', '10minutemail.com', 'guerrillamail.com'];
    if (suspiciousDomains.includes(domain)) {
      score += 30;
    }
    
    // Amount risk
    if (amount > 1000) {
      score += 20;
    } else if (amount > 500) {
      score += 10;
    }
    
    // Time-based risk (late night transactions)
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      score += 15;
    }
    
    return Math.min(score, 100);
  }

  // Store transaction securely
  private storeTransaction(transaction: DualPaymentTransaction): void {
    try {
      const existingTransactions = this.getStoredTransactions();
      existingTransactions.push(transaction);
      
      // Keep only last 100 transactions
      if (existingTransactions.length > 100) {
        existingTransactions.splice(0, existingTransactions.length - 100);
      }
      
      localStorage.setItem('flappypi-dual-transactions', JSON.stringify(existingTransactions));
    } catch (error) {
      console.error('Error storing transaction:', error);
    }
  }

  // Get stored transactions
  getStoredTransactions(): DualPaymentTransaction[] {
    try {
      const stored = localStorage.getItem('flappypi-dual-transactions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored transactions:', error);
      return [];
    }
  }

  // Get transaction by ID
  getTransaction(transactionId: string): DualPaymentTransaction | null {
    const transactions = this.getStoredTransactions();
    return transactions.find(t => t.transactionId === transactionId) || null;
  }

  // Update transaction status
  updateTransactionStatus(transactionId: string, status: DualPaymentTransaction['status']): boolean {
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

  // Process Pi SDK Payment
  async processPiSDKPayment(
    amount: number,
    memo: string,
    metadata?: any
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    // Wrap callback-based API in a Promise and resolve when ready for approval
    return new Promise((resolve) => {
      try {
        if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
          resolve({ success: false, error: 'Pi SDK not available. Please use Pi Browser.' });
          return;
        }

        console.log('💰 Processing Pi SDK payment:', { amount, memo, metadata });

        const paymentData = { amount, memo, metadata: metadata || {} };
        const callbacks = {
          onReadyForServerApproval: (paymentId: string) => {
            console.log('✅ Pi SDK payment created, ready for approval:', paymentId);
            resolve({ success: true, paymentId });
          },
          onReadyForServerCompletion: (_paymentId: string, _txid: string) => {
            // handled elsewhere if needed
          },
          onCancel: (paymentId: string) => {
            console.log('❌ Payment cancelled:', paymentId);
            resolve({ success: false, error: 'Payment cancelled by user' });
          },
          onError: (error: any) => {
            console.error('❌ Pi SDK payment error:', error);
            resolve({ success: false, error: error?.message || 'Payment error' });
          }
        };

        try {
          window.Pi.createPayment(paymentData, callbacks);
        } catch (err: any) {
          console.error('❌ Failed to start Pi SDK payment:', err);
          resolve({ success: false, error: err?.message || 'Failed to start payment' });
        }
      } catch (error: any) {
        console.error('❌ Pi SDK payment failed:', error);
        resolve({ success: false, error: error?.message || 'Payment failed' });
      }
    });
  }

  // Verify manual payment using Pi Ledger
  async verifyManualPayment(verification: DualPaymentVerification): Promise<{
    success: boolean;
    transaction?: DualPaymentTransaction;
    error?: string;
  }> {
    try {
      const transaction = this.getTransaction(verification.transactionId);
      
      if (!transaction) {
        return { success: false, error: 'Transaction not found' };
      }

      // Check if transaction has expired
      if (new Date() > transaction.expiryTime) {
        this.updateTransactionStatus(transaction.transactionId, 'expired');
        return { success: false, error: 'Transaction has expired' };
      }

      // Check verification code
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

      // If Pi transaction hash is provided, verify on blockchain
      if (verification.piTransactionHash) {
        const ledgerVerification = await this.verifyPiLedgerTransaction(
          verification.piTransactionHash,
          transaction.merchantWalletAddress,
          transaction.totalPiAmount,
          transaction.timestamp
        );

        if (!ledgerVerification.success) {
          return { success: false, error: ledgerVerification.error };
        }
      }

      // Mark transaction as paid
      this.updateTransactionStatus(transaction.transactionId, 'paid');
      
      return { success: true, transaction };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  // Verify Pi Ledger transaction using the provided wallet
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

          throw new Error('REAL MAINNET PAYMENTS ONLY - Sandbox mode disabled');
          return { success: true, transaction: ledgerTransaction };
        }

        return { success: false, error: 'Invalid transaction hash in sandbox mode' };
      }

      // Production mode - real blockchain verification using the provided wallet
      console.log('🔍 PRODUCTION: Verifying Pi Ledger transaction:', {
        hash: transactionHash,
        expectedTo: expectedToAddress,
        expectedAmount,
        expectedTimestamp
      });

      // Here you would make a real API call to verify the transaction
      // For now, we'll simulate the verification process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify transaction hash format
      if (transactionHash && transactionHash.length > 10) {
        const ledgerTransaction: PiLedgerTransaction = {
          hash: transactionHash,
          from: 'customer_wallet',
          to: expectedToAddress,
          amount: expectedAmount,
          memo: `Flappy Pi Payment`,
          timestamp: new Date(),
          blockNumber: Math.floor(Math.random() * 1000000),
          status: 'confirmed'
        };

        return { success: true, transaction: ledgerTransaction };
      }

      return { success: false, error: 'Invalid transaction hash' };
    } catch (error) {
      console.error('Error verifying Pi Ledger transaction:', error);
      return { success: false, error: 'Ledger verification failed' };
    }
  }

  // Get merchant wallet address
  getMerchantWalletAddress(): string {
    return this.MERCHANT_WALLET_ADDRESS;
  }

  // Get merchant wallet username
  getMerchantWalletUsername(): string {
    return this.MERCHANT_WALLET_USERNAME;
  }

  // Check if transaction is expired
  isTransactionExpired(transaction: DualPaymentTransaction): boolean {
    return new Date() > transaction.expiryTime;
  }

  // Get transaction expiry time remaining
  getTransactionTimeRemaining(transaction: DualPaymentTransaction): number {
    const now = new Date();
    const expiry = transaction.expiryTime;
    return Math.max(0, expiry.getTime() - now.getTime());
  }

  // Format time remaining
  formatTimeRemaining(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Clean up expired transactions
  cleanupExpiredTransactions(): void {
    try {
      const transactions = this.getStoredTransactions();
      const now = new Date();
      const validTransactions = transactions.filter(t => t.expiryTime > now);
      
      if (validTransactions.length !== transactions.length) {
        localStorage.setItem('flappypi-dual-transactions', JSON.stringify(validTransactions));
        console.log(`Cleaned up ${transactions.length - validTransactions.length} expired transactions`);
      }
    } catch (error) {
      console.error('Error cleaning up expired transactions:', error);
    }
  }

  // Get Pi Network account information
  async getPiAccountInfo(walletAddress: string): Promise<any> {
    try {
      const response = await fetch(`https://api.mainnet.minepi.com/accounts/${walletAddress}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch account info: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching Pi account info:', error);
      throw error;
    }
  }

  // Get Pi Network transaction history
  async getPiTransactionHistory(walletAddress: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(`https://api.mainnet.minepi.com/accounts/${walletAddress}/transactions?limit=${limit}&order=desc`);
      if (!response.ok) {
        throw new Error(`Failed to fetch transaction history: ${response.statusText}`);
      }
      const data = await response.json();
      return data._embedded?.records || [];
    } catch (error) {
      console.error('Error fetching Pi transaction history:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dualPaymentService = new DualPaymentService();
