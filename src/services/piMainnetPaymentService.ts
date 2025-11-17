// Pi Network Mainnet Payment Service
// Uses real Pi Network mainnet API for actual transactions

import { PI_CONFIG } from '../config/piConfig';

export interface PaymentItem {
  id: string;
  name: string;
  piAmount: number;
  type: string;
  quantity?: number;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  txid?: string;
  error?: string;
  transactionHash?: string;
}

export interface PiMainnetAccount {
  id: string;
  account_id: string;
  sequence: string;
  balances: Array<{
    balance: string;
    asset_type: string;
  }>;
}

export class PiMainnetPaymentService {
  private static instance: PiMainnetPaymentService;
  private readonly MAINNET_API_URL = 'https://api.mainnet.minepi.com';
  private readonly WALLET_ADDRESS = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ';

  public static getInstance(): PiMainnetPaymentService {
    if (!PiMainnetPaymentService.instance) {
      PiMainnetPaymentService.instance = new PiMainnetPaymentService();
    }
    return PiMainnetPaymentService.instance;
  }

  /**
   * Verify wallet balance and account status
   */
  async verifyWalletStatus(): Promise<{ success: boolean; balance?: number; error?: string }> {
    try {
      console.log('🔍 [MAINNET] Verifying wallet status...');
      
      const response = await fetch(`${this.MAINNET_API_URL}/accounts/${this.WALLET_ADDRESS}`);
      
      if (!response.ok) {
        throw new Error(`Wallet verification failed: ${response.status} ${response.statusText}`);
      }
      
      const accountData: PiMainnetAccount = await response.json();
      const balance = parseFloat(accountData.balances[0]?.balance || '0');
      
      console.log('✅ [MAINNET] Wallet verified:', {
        address: this.WALLET_ADDRESS,
        balance: balance,
        sequence: accountData.sequence
      });
      
      return {
        success: true,
        balance: balance
      };
    } catch (error: any) {
      console.error('❌ [MAINNET] Wallet verification failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify wallet'
      };
    }
  }

  /**
   * Process a real Pi payment for shop items using mainnet
   */
  async processShopPayment(item: PaymentItem): Promise<PaymentResult> {
    try {
      console.log('🛒 [MAINNET] Processing shop payment for:', item.name);
      console.log('💰 [MAINNET] Amount:', item.piAmount, 'Pi');
      console.log('🏦 [MAINNET] Wallet:', this.WALLET_ADDRESS);

      // Check if Pi SDK is available
      if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not available. Please use Pi Browser.');
      }

      if (typeof window.Pi.createPayment !== 'function') {
        throw new Error('Pi Payment Unavailable. Please use Pi Browser to make Pi payments.');
      }

      // Verify wallet status first
      const walletStatus = await this.verifyWalletStatus();
      if (!walletStatus.success) {
        throw new Error(`Wallet verification failed: ${walletStatus.error}`);
      }

      const quantity = item.quantity || 1;
      const totalPrice = item.piAmount * quantity;

      console.log(`🎯 [MAINNET] Creating payment for ${item.name} - ${totalPrice} Pi`);

      // Create payment data for mainnet
      const paymentData = {
        amount: totalPrice,
        memo: `Flappy Pi: ${item.name}`,
        recipientAddress: this.WALLET_ADDRESS,
        metadata: {
          type: 'shop_purchase',
          itemId: item.id,
          itemName: item.name,
          itemType: item.type,
          quantity: quantity,
          game: 'flappy_pi',
          price: totalPrice,
          timestamp: Date.now(),
          network: 'mainnet',
          walletAddress: this.WALLET_ADDRESS,
          paymentType: 'mainnet_payment'
        }
      };

      return new Promise((resolve, reject) => {
        const paymentCallbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log('✅ [MAINNET] Payment ready for approval:', paymentId);
            
            try {
              // Call backend to approve payment
              const approvalResponse = await fetch('/api/pi/approve-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  paymentId,
                  amount: totalPrice,
                  memo: paymentData.memo,
                  recipientAddress: this.WALLET_ADDRESS,
                  metadata: paymentData.metadata
                })
              });

              if (!approvalResponse.ok) {
                throw new Error(`Payment approval failed: ${approvalResponse.status}`);
              }

              const approvalResult = await approvalResponse.json();
              console.log('✅ [MAINNET] Payment approved by server:', approvalResult);
              
              return true;
            } catch (error) {
              console.error('❌ [MAINNET] Payment approval failed:', error);
              return false;
            }
          },

          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log('✅ [MAINNET] Payment ready for completion:', paymentId, txid);
            
            try {
              // Call backend to complete payment
              const completionResponse = await fetch('/api/pi/complete-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  paymentId,
                  txid,
                  amount: totalPrice,
                  memo: paymentData.memo,
                  recipientAddress: this.WALLET_ADDRESS,
                  metadata: paymentData.metadata
                })
              });

              if (!completionResponse.ok) {
                throw new Error(`Payment completion failed: ${completionResponse.status}`);
              }

              const completionResult = await completionResponse.json();
              console.log('✅ [MAINNET] Payment completed by server:', completionResult);
              
              resolve({
                success: true,
                paymentId,
                txid,
                transactionHash: txid
              });
            } catch (error) {
              console.error('❌ [MAINNET] Payment completion failed:', error);
              resolve({
                success: false,
                error: error.message || 'Payment completion failed'
              });
            }
          },

          onCancel: (paymentId: string) => {
            console.log('❌ [MAINNET] Payment cancelled:', paymentId);
            resolve({
              success: false,
              error: 'Payment cancelled by user'
            });
          },

          onError: (error: any, payment: any) => {
            console.error('❌ [MAINNET] Payment error:', error, payment);
            resolve({
              success: false,
              error: error.message || 'Payment failed'
            });
          }
        };

        // Create the payment using Pi SDK
        window.Pi.createPayment(paymentData, paymentCallbacks);
      });

    } catch (error: any) {
      console.error('❌ [MAINNET] Shop payment failed:', error);
      return {
        success: false,
        error: error.message || 'Payment failed'
      };
    }
  }

  /**
   * Process a real Pi payment for subscriptions using mainnet
   */
  async processSubscriptionPayment(plan: { id: string; name: string; price: string }): Promise<PaymentResult> {
    try {
      console.log('📦 [MAINNET] Processing subscription payment for:', plan.name);
      console.log('💰 [MAINNET] Amount:', plan.price, 'Pi');
      console.log('🏦 [MAINNET] Wallet:', this.WALLET_ADDRESS);

      // Check if Pi SDK is available
      if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not available. Please use Pi Browser.');
      }

      if (typeof window.Pi.createPayment !== 'function') {
        throw new Error('Pi Payment Unavailable. Please use Pi Browser to make Pi payments.');
      }

      // Verify wallet status first
      const walletStatus = await this.verifyWalletStatus();
      if (!walletStatus.success) {
        throw new Error(`Wallet verification failed: ${walletStatus.error}`);
      }

      const piAmount = parseFloat(plan.price);
      
      console.log(`🎯 [MAINNET] Creating subscription payment for ${plan.name} - ${piAmount} Pi`);

      // Create payment data for mainnet
      const paymentData = {
        amount: piAmount,
        memo: `Flappy Pi Subscription: ${plan.name}`,
        recipientAddress: this.WALLET_ADDRESS,
        metadata: {
          subscriptionId: plan.id,
          subscriptionName: plan.name,
          subscriptionType: 'subscription',
          timestamp: Date.now(),
          network: 'mainnet',
          walletAddress: this.WALLET_ADDRESS,
          paymentType: 'mainnet_subscription',
          appId: PI_CONFIG.getAppId(),
          version: '2.0'
        }
      };

      return new Promise((resolve, reject) => {
        const paymentCallbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log('✅ [MAINNET] Subscription payment ready for approval:', paymentId);
            
            try {
              // Call backend to approve payment
              const approvalResponse = await fetch('/api/pi/approve-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  paymentId,
                  amount: piAmount,
                  memo: paymentData.memo,
                  recipientAddress: this.WALLET_ADDRESS,
                  metadata: paymentData.metadata
                })
              });

              if (!approvalResponse.ok) {
                throw new Error(`Payment approval failed: ${approvalResponse.status}`);
              }

              const approvalResult = await approvalResponse.json();
              console.log('✅ [MAINNET] Subscription payment approved by server:', approvalResult);
              
              return true;
            } catch (error) {
              console.error('❌ [MAINNET] Subscription payment approval failed:', error);
              return false;
            }
          },

          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log('✅ [MAINNET] Subscription payment ready for completion:', paymentId, txid);
            
            try {
              // Call backend to complete payment
              const completionResponse = await fetch('/api/pi/complete-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  paymentId,
                  txid,
                  amount: piAmount,
                  memo: paymentData.memo,
                  recipientAddress: this.WALLET_ADDRESS,
                  metadata: paymentData.metadata
                })
              });

              if (!completionResponse.ok) {
                throw new Error(`Payment completion failed: ${completionResponse.status}`);
              }

              const completionResult = await completionResponse.json();
              console.log('✅ [MAINNET] Subscription payment completed by server:', completionResult);
              
              resolve({
                success: true,
                paymentId,
                txid,
                transactionHash: txid
              });
            } catch (error) {
              console.error('❌ [MAINNET] Subscription payment completion failed:', error);
              resolve({
                success: false,
                error: error.message || 'Payment completion failed'
              });
            }
          },

          onCancel: (paymentId: string) => {
            console.log('❌ [MAINNET] Subscription payment cancelled:', paymentId);
            resolve({
              success: false,
              error: 'Payment cancelled by user'
            });
          },

          onError: (error: any, payment: any) => {
            console.error('❌ [MAINNET] Subscription payment error:', error, payment);
            resolve({
              success: false,
              error: error.message || 'Payment failed'
            });
          }
        };

        // Create the payment using Pi SDK
        window.Pi.createPayment(paymentData, paymentCallbacks);
      });

    } catch (error: any) {
      console.error('❌ [MAINNET] Subscription payment failed:', error);
      return {
        success: false,
        error: error.message || 'Payment failed'
      };
    }
  }

  /**
   * Get wallet balance from mainnet API
   */
  async getWalletBalance(): Promise<{ success: boolean; balance?: number; error?: string }> {
    try {
      const response = await fetch(`${this.MAINNET_API_URL}/accounts/${this.WALLET_ADDRESS}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch wallet balance: ${response.status}`);
      }
      
      const accountData: PiMainnetAccount = await response.json();
      const balance = parseFloat(accountData.balances[0]?.balance || '0');
      
      return {
        success: true,
        balance: balance
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch wallet balance'
      };
    }
  }

  /**
   * Get recent transactions from mainnet API
   */
  async getRecentTransactions(limit: number = 10): Promise<{ success: boolean; transactions?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.MAINNET_API_URL}/accounts/${this.WALLET_ADDRESS}/transactions?limit=${limit}&order=desc`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        transactions: data._embedded?.records || []
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch transactions'
      };
    }
  }
}

export const piMainnetPaymentService = new PiMainnetPaymentService();
