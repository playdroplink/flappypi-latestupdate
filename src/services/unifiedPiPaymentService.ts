// Unified Pi Payment Service
// Redesigned backend system for all Pi payments - Shop, Subscriptions, and Game Items
// This service ensures all Pi payments work consistently across the entire application

import { PI_CONFIG } from '../config/piConfig';
import { backendStorageService } from './backendStorageService';
import { walletAddressVerification } from './walletAddressVerification';

export interface UnifiedPaymentItem {
  id: string;
  name: string;
  type: 'shop_item' | 'subscription' | 'game_boost' | 'coins' | 'skin' | 'powerup';
  piAmount: number;
  description?: string;
  quantity?: number;
  metadata?: any;
  userId?: string;
  memo?: string;
}

export interface UnifiedPaymentResult {
  success: boolean;
  paymentId?: string;
  txid?: string;
  deliveredItems?: any[];
  error?: string;
  verified?: boolean;
}

export interface PaymentVerification {
  success: boolean;
  verified: boolean;
  error?: string;
}

export class UnifiedPiPaymentService {
  private static instance: UnifiedPiPaymentService;
  
  private constructor() {}
  
  public static getInstance(): UnifiedPiPaymentService {
    if (!UnifiedPiPaymentService.instance) {
      UnifiedPiPaymentService.instance = new UnifiedPiPaymentService();
    }
    return UnifiedPiPaymentService.instance;
  }

  /**
   * Unified Pi Payment Processing
   * Handles all types of Pi payments with consistent backend logic
   */
  async processPayment(item: UnifiedPaymentItem): Promise<UnifiedPaymentResult> {
    try {
      console.log('🚀 Processing unified Pi payment for:', item.name);
      console.log('🌐 Network Mode:', PI_CONFIG.NETWORK_MODE);
      console.log('🔧 Production Mode:', PI_CONFIG.IS_PRODUCTION);
      console.log('🚀 Mainnet Mode:', PI_CONFIG.NETWORK_MODE === 'mainnet');

      // 1. Validate Environment
      await this.validateEnvironment();

      // 2. Authenticate User
      const authResult = await this.authenticateUser();
      if (!authResult.success) {
        throw new Error(authResult.error || 'Authentication failed');
      }

      // 2.1. Initialize user profile in backend storage
      const profileResult = await backendStorageService.initializeUserProfile(authResult.user);
      if (!profileResult.success) {
        console.warn('⚠️ Failed to initialize user profile:', profileResult.error);
      }

      // 3. Create Payment Data
      const paymentData = this.createPaymentData(item, authResult.user);

      // 4. Process Payment with Pi SDK (MAINNET ONLY)
      if (!PI_CONFIG.isMainnet()) {
        throw new Error('MAINNET PAYMENTS ONLY - No testnet or sandbox payments allowed');
      }
      
      // Get the Flappy Pi wallet address
      const flappyPiWalletAddress = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ';
      
      // Ensure payment goes to your mainnet wallet
      paymentData.metadata = {
        ...paymentData.metadata,
        walletAddress: flappyPiWalletAddress,
        network: 'mainnet',
        paymentType: 'mainnet_payment'
      };
      
      // Add recipient address to payment data
      paymentData.recipientAddress = flappyPiWalletAddress;
      
      const paymentResult = await this.executePayment(paymentData);

      // 4.1. Record payment in backend storage
      const paymentRecord = await backendStorageService.recordPayment({
        user_id: authResult.user.uid,
        payment_id: paymentResult.paymentId,
        txid: paymentResult.txid,
        amount: item.piAmount,
        currency: 'PI',
        item_type: item.type,
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity || 1,
        status: 'pending',
        wallet_address: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ',
        network: 'mainnet',
        metadata: item.metadata || {}
      });

      if (!paymentRecord.success) {
        console.warn('⚠️ Failed to record payment:', paymentRecord.error);
      }

      // 5. Verify Payment
      const verification = await this.verifyPayment(paymentResult, item);

      // 6. Deliver Items (if verification successful)
      if (verification.success && verification.verified) {
        // Use the new payment completion service for proper item delivery
        const { PaymentCompletionService } = await import('./paymentCompletionService');
        const completionService = PaymentCompletionService.getInstance();
        
        const deliveryResult = await completionService.verifyAndDeliverItems({
          paymentId: paymentResult.paymentId,
          txid: paymentResult.txid,
          amount: item.piAmount,
          memo: item.memo,
          metadata: item.metadata,
          userId: item.userId,
          itemType: item.type,
          itemId: item.id,
          itemName: item.name,
          quantity: item.quantity
        });
        
        if (deliveryResult.success) {
          // Update payment status to completed
          await backendStorageService.updatePaymentStatus(paymentResult.paymentId, 'completed', paymentResult.txid);

          // Add items to user inventory
          for (const deliveredItem of deliveryResult.deliveredItems || []) {
            await backendStorageService.addToInventory(authResult.user.uid, {
              item_type: deliveredItem.type,
              item_id: deliveredItem.id || item.id,
              item_name: deliveredItem.name || item.name,
              quantity: deliveredItem.quantity || 1,
              metadata: deliveredItem.metadata || {}
            });
          }

          // Save to local storage for immediate access
          backendStorageService.saveToLocalStorage('last_payment', {
            paymentId: paymentResult.paymentId,
            txid: paymentResult.txid,
            items: deliveryResult.deliveredItems,
            timestamp: Date.now()
          });

          console.log('✅ Unified payment completed and items delivered successfully');
          console.log('💰 Transaction ID:', paymentResult.txid);
          console.log('📦 Delivered items:', deliveryResult.deliveredItems);
          
          return {
            success: true,
            paymentId: paymentResult.paymentId,
            txid: paymentResult.txid,
            deliveredItems: deliveryResult.deliveredItems,
            verified: true
          };
        } else {
          // Update payment status to failed
          await backendStorageService.updatePaymentStatus(paymentResult.paymentId, 'failed');
          
          console.log('❌ Item delivery failed:', deliveryResult.error);
          return {
            success: false,
            error: deliveryResult.error || 'Item delivery failed',
            paymentId: paymentResult.paymentId
          };
        }
      } else {
        console.log('❌ Payment verification failed - not delivering items');
        return {
          success: false,
          error: verification.error || 'Payment verification failed',
          paymentId: paymentResult.paymentId
        };
      }

    } catch (error: any) {
      console.error('❌ Unified payment failed:', error);
      return {
        success: false,
        error: error.message || 'Payment failed'
      };
    }
  }

  /**
   * Validate Environment and SDK Availability
   */
  private async validateEnvironment(): Promise<void> {
    // Check if Pi SDK is available
    if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
      throw new Error('Pi SDK not available. Please use Pi Browser.');
    }

    // Check network mode based on current configuration
    if (PI_CONFIG.SANDBOX_MODE) {
      console.log('🧪 Running in SANDBOX mode - Test payments only');
    } else {
      console.log('🌐 Running in MAINNET mode - Real payments');
    }
  }

  /**
   * Authenticate User with Pi Network
   */
  private async authenticateUser(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      if (typeof window.Pi === 'undefined') {
        return { success: false, error: 'Pi SDK not available' };
      }

      // Authenticate with required scopes
      const authResult = await window.Pi.authenticate(['payments', 'username'], (incompletePayment) => {
        console.log('💰 Incomplete payment found during authentication:', incompletePayment);
      });

      if (!authResult || !authResult.user) {
        return { success: false, error: 'Pi authentication failed' };
      }

      console.log('✅ User authenticated for payment:', authResult.user.username);
      return { success: true, user: authResult.user };
    } catch (error: any) {
      console.error('❌ Authentication failed:', error);
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }

  /**
   * Create Payment Data with Proper Formatting
   */
  private createPaymentData(item: UnifiedPaymentItem, user: any): any {
    const memo = `Flappy Pi: ${item.name}`;
    
    const metadata = {
      type: item.type,
      itemId: item.id,
      itemName: item.name,
      quantity: item.quantity || 1,
      game: 'flappy_pi',
      price: item.piAmount,
      username: user.username,
      userId: user.uid,
      timestamp: Date.now(),
      network: 'mainnet',
      appId: PI_CONFIG.getAppId(),
      version: '2.0',
      walletAddress: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ',
      paymentType: 'sandbox_payment',
      mainnetOnly: false,
      ...item.metadata
    };

    return {
      amount: item.piAmount,
      memo,
      metadata
    };
  }

  /**
   * Execute Testnet Payment with Pi SDK
   */
  private async executeTestnetPayment(paymentData: any): Promise<{ paymentId: string; txid: string }> {
    return new Promise((resolve, reject) => {
      if (typeof window.Pi === 'undefined') {
        reject(new Error('Pi SDK not available'));
        return;
      }

      console.log('🚀 Creating mainnet Pi payment:', paymentData);

      window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log('✅ Mainnet payment ready for approval:', paymentId);
          
          try {
            // Call approval endpoint (mainnet only)
            const response = await fetch('/api/pi/approve-payment', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${paymentData.metadata.userId}`
              },
              body: JSON.stringify({
                paymentId,
                userId: paymentData.metadata.userId,
                itemId: paymentData.metadata.itemId
              })
            });

            const result = await response.json();
            if (result.success && result.approved) {
              console.log('✅ Mainnet payment approved:', paymentId);
              return true;
            } else {
              console.error('❌ Mainnet payment approval failed:', result.error);
              return false;
            }
          } catch (error) {
            console.error('❌ Mainnet payment approval error:', error);
            return false;
          }
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('✅ Mainnet payment ready for completion:', paymentId, txid);
          
          try {
            // Call completion endpoint (mainnet only)
            const response = await fetch('/api/pi/complete-payment', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${paymentData.metadata.userId}`
              },
              body: JSON.stringify({
                paymentId,
                txid,
                userId: paymentData.metadata.userId,
                itemId: paymentData.metadata.itemId
              })
            });

            const result = await response.json();
            if (result.success && result.completed) {
              console.log('✅ Testnet payment completed:', paymentId, txid);
              resolve({ paymentId, txid });
            } else {
              console.error('❌ Testnet payment completion failed:', result.error);
              reject(new Error(result.error || 'Testnet payment completion failed'));
            }
          } catch (error) {
            console.error('❌ Testnet payment completion error:', error);
            reject(error);
          }
        },
        onCancel: (paymentId: string) => {
          console.log('❌ Testnet payment cancelled:', paymentId);
          reject(new Error('Payment cancelled by user'));
        },
        onError: (error: any, payment: any) => {
          console.error('❌ Testnet payment error:', error, payment);
          reject(error);
        }
      });
    });
  }

  /**
   * Execute Payment with Pi SDK
   */
  private async executePayment(paymentData: any): Promise<{ paymentId: string; txid: string }> {
    return new Promise(async (resolve, reject) => {
      if (typeof window.Pi === 'undefined') {
        reject(new Error('Pi SDK not available'));
        return;
      }

      // Verify wallet configuration before payment
      try {
        const walletVerification = await walletAddressVerification.verifyWalletConfiguration();
        if (!walletVerification.success) {
          reject(new Error(`Wallet verification failed: ${walletVerification.error}`));
          return;
        }
        
        // Log payment attempt with wallet verification
        walletAddressVerification.logPaymentAttempt(paymentData.amount, paymentData.memo, paymentData.metadata);
      } catch (error) {
        reject(new Error(`Wallet verification error: ${error}`));
        return;
      }

      console.log('💰 Creating Pi payment:', paymentData);

      window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log('✅ Payment ready for approval:', paymentId);
          
          try {
            // Call backend approval endpoint
            const response = await fetch('/api/pi/approve-payment', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${paymentData.metadata.userId}`
              },
              body: JSON.stringify({ 
                paymentId,
                metadata: paymentData.metadata 
              }),
            });

            if (!response.ok) {
              throw new Error('Payment approval failed');
            }

            console.log('✅ Payment approved by backend');
          } catch (error) {
            console.error('❌ Payment approval failed:', error);
            reject(error);
          }
        },

        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('✅ Payment ready for completion:', { paymentId, txid });
          
          try {
            // Call backend completion endpoint
            const response = await fetch('/api/pi/complete-payment', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${paymentData.metadata.userId}`
              },
              body: JSON.stringify({ 
                paymentId, 
                txid,
                metadata: paymentData.metadata 
              }),
            });

            if (!response.ok) {
              throw new Error('Payment completion failed');
            }

            console.log('✅ Payment completed by backend');
            resolve({ paymentId, txid });
          } catch (error) {
            console.error('❌ Payment completion failed:', error);
            reject(error);
          }
        },

        onCancel: (paymentId: string) => {
          console.log('❌ Payment cancelled:', paymentId);
          reject(new Error('Payment was cancelled by user'));
        },

        onError: (error: any, payment: any) => {
          console.error('❌ Payment error:', error);
          reject(new Error(error.message || 'Payment failed'));
        }
      });
    });
  }

  /**
   * Verify Payment with Backend
   */
  private async verifyPayment(paymentResult: { paymentId: string; txid: string }, item: UnifiedPaymentItem): Promise<PaymentVerification> {
    try {
      console.log('🔍 Verifying payment:', { paymentId: paymentResult.paymentId, txid: paymentResult.txid });
      
      // Call backend verification endpoint
      const response = await fetch('/api/pi/verify-payment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          paymentId: paymentResult.paymentId,
          txid: paymentResult.txid,
          amount: item.piAmount,
          itemName: item.name,
          itemType: item.type
        }),
      });

      if (!response.ok) {
        return { success: false, verified: false, error: 'Payment verification failed' };
      }

      const verification = await response.json();
      console.log('✅ Payment verification result:', verification);
      
      return {
        success: true,
        verified: verification.verified || false,
        error: verification.error
      };
    } catch (error: any) {
      console.error('❌ Payment verification failed:', error);
      return { 
        success: false, 
        verified: false, 
        error: error.message || 'Verification failed' 
      };
    }
  }

  /**
   * Deliver Items to User
   */
  private async deliverItems(item: UnifiedPaymentItem): Promise<any[]> {
    try {
      console.log('📦 Delivering items for:', item.name);
      
      const deliveredItems = [];
      
      // Handle different item types
      switch (item.type) {
        case 'coins':
          // Add coins to user wallet
          deliveredItems.push({
            type: 'coins',
            amount: item.piAmount * 1000, // Convert Pi to Flappy Coins
            description: `${item.piAmount} Pi converted to Flappy Coins`
          });
          break;
          
        case 'shop_item':
        case 'skin':
        case 'powerup':
          // Add to inventory
          deliveredItems.push({
            type: item.type,
            id: item.id,
            name: item.name,
            quantity: item.quantity || 1,
            description: `Added ${item.name} to inventory`
          });
          break;
          
        case 'subscription':
          // Activate subscription
          deliveredItems.push({
            type: 'subscription',
            planId: item.id,
            planName: item.name,
            duration: '30 days',
            description: `Subscription activated: ${item.name}`
          });
          break;
          
        case 'game_boost':
          // Add game boost
          deliveredItems.push({
            type: 'boost',
            boostType: item.id,
            duration: '1 hour',
            description: `Game boost activated: ${item.name}`
          });
          break;
      }
      
      console.log('✅ Items delivered:', deliveredItems);
      return deliveredItems;
      
    } catch (error: any) {
      console.error('❌ Item delivery failed:', error);
      throw error;
    }
  }

  /**
   * Get Payment Status
   */
  async getPaymentStatus(paymentId: string): Promise<{ status: string; verified: boolean }> {
    try {
      const response = await fetch(`/api/pi/payment-status/${paymentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to get payment status');
      }

      const status = await response.json();
      return {
        status: status.status || 'unknown',
        verified: status.verified || false
      };
    } catch (error: any) {
      console.error('❌ Failed to get payment status:', error);
      return { status: 'error', verified: false };
    }
  }

  /**
   * Cancel Payment
   */
  async cancelPayment(paymentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/pi/cancel-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel payment');
      }

      // Update payment status in backend storage
      await backendStorageService.updatePaymentStatus(paymentId, 'cancelled');

      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to cancel payment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get User Profile from Backend Storage
   */
  async getUserProfile(userId: string): Promise<{ success: boolean; profile?: any; error?: string }> {
    try {
      return await backendStorageService.getUserProfile(userId);
    } catch (error: any) {
      console.error('❌ Failed to get user profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get User Inventory from Backend Storage
   */
  async getUserInventory(userId: string): Promise<{ success: boolean; inventory?: any[]; error?: string }> {
    try {
      return await backendStorageService.getUserInventory(userId);
    } catch (error: any) {
      console.error('❌ Failed to get user inventory:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get User Payment History from Backend Storage
   */
  async getUserPaymentHistory(userId: string): Promise<{ success: boolean; payments?: any[]; error?: string }> {
    try {
      return await backendStorageService.getUserPaymentHistory(userId);
    } catch (error: any) {
      console.error('❌ Failed to get payment history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync Local Storage with Backend
   */
  async syncWithBackend(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await backendStorageService.syncWithSupabase(userId);
    } catch (error: any) {
      console.error('❌ Failed to sync with backend:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Last Payment from Local Storage
   */
  getLastPayment(): any {
    try {
      return backendStorageService.getFromLocalStorage('last_payment');
    } catch (error: any) {
      console.error('❌ Failed to get last payment:', error);
      return null;
    }
  }

  /**
   * Clear Local Storage
   */
  clearLocalStorage(): void {
    try {
      backendStorageService.clearLocalStorage();
    } catch (error: any) {
      console.error('❌ Failed to clear local storage:', error);
    }
  }
}

// Export singleton instance
export const unifiedPiPaymentService = UnifiedPiPaymentService.getInstance();
export default unifiedPiPaymentService;
