// Sandbox Pi Payment Service
// Simplified payment service for sandbox/development mode

import { PI_CONFIG } from '../config/piConfig';

export interface PaymentItem {
  id: string;
  name: string;
  piAmount: number;
  type: string;
  quantity?: number;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  txid?: string;
  error?: string;
}

export class SandboxPiPaymentService {
  private static instance: SandboxPiPaymentService;
  private readonly WALLET_ADDRESS = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7J';

  public static getInstance(): SandboxPiPaymentService {
    if (!SandboxPiPaymentService.instance) {
      SandboxPiPaymentService.instance = new SandboxPiPaymentService();
    }
    return SandboxPiPaymentService.instance;
  }

  /**
   * Process a Pi payment for shop items (sandbox mode)
   */
  async processShopPayment(item: PaymentItem): Promise<PaymentResult> {
    try {
      console.log('🛒 [SANDBOX] Processing shop payment for:', item.name);
      console.log('🧪 [SANDBOX] Sandbox mode enabled - allowing test payments');

      // Check if Pi SDK is available
      if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not available. Please use Pi Browser.');
      }

      if (typeof window.Pi.createPayment !== 'function') {
        throw new Error('Pi Payment Unavailable. Please use Pi Browser to make Pi payments.');
      }

      const quantity = item.quantity || 1;
      const totalPrice = item.piAmount * quantity;

      console.log(`🎯 [SANDBOX] Creating payment for ${item.name} - ${totalPrice} Pi`);

      // Create payment data for sandbox mode
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
          sandbox: true,
          network: 'sandbox',
          walletAddress: this.WALLET_ADDRESS
        }
      };

      return new Promise((resolve, reject) => {
        const paymentCallbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log('✅ [SANDBOX] Payment ready for approval:', paymentId);

            // Only auto-approve if explicitly in sandbox mode
            if (PI_CONFIG.isSandbox && PI_CONFIG.isSandbox()) {
              return true;
            }

            // Otherwise, call backend approval endpoint
            try {
              const res = await fetch('/api/pi/approve-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, metadata: paymentData.metadata })
              });
              console.log('📡 [SANDBOX] Approve response status:', res.status);
              return res.status === 200;
            } catch (err) {
              console.error('❌ [SANDBOX] Error calling approve endpoint:', err);
              return false;
            }
          },

          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log('✅ [SANDBOX] Payment completed:', paymentId, txid);

            // If in sandbox, resolve immediately
            if (PI_CONFIG.isSandbox && PI_CONFIG.isSandbox()) {
              resolve({ success: true, paymentId, txid });
              return true;
            }

            // Otherwise, call backend completion endpoint
            try {
              const res = await fetch('/api/pi/complete-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid, metadata: paymentData.metadata })
              });
              console.log('📡 [SANDBOX] Complete response status:', res.status);
              if (res.status === 200) {
                resolve({ success: true, paymentId, txid });
                return true;
              }
              resolve({ success: false, error: 'Completion failed' });
              return false;
            } catch (err) {
              console.error('❌ [SANDBOX] Error calling complete endpoint:', err);
              resolve({ success: false, error: err.message || 'Completion failed' });
              return false;
            }
          },

          onCancel: (paymentId: string) => {
            console.log('❌ [SANDBOX] Payment cancelled:', paymentId);
            resolve({ success: false, error: 'Payment cancelled by user' });
          },

          onError: (error: any, payment: any) => {
            console.error('❌ [SANDBOX] Payment error:', error, payment);
            resolve({ success: false, error: error.message || 'Payment failed' });
          }
        };

        // Create the payment
        window.Pi.createPayment(paymentData, paymentCallbacks);
      });

    } catch (error: any) {
      console.error('❌ [SANDBOX] Shop payment failed:', error);
      return {
        success: false,
        error: error.message || 'Payment failed'
      };
    }
  }

  /**
   * Process a Pi payment for subscriptions (sandbox mode)
   */
  async processSubscriptionPayment(plan: { id: string; name: string; price: string }): Promise<PaymentResult> {
    try {
      console.log('📦 [SANDBOX] Processing subscription payment for:', plan.name);
      console.log('🧪 [SANDBOX] Sandbox mode enabled - allowing test subscription payments');

      // Check if Pi SDK is available
      if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not available. Please use Pi Browser.');
      }

      if (typeof window.Pi.createPayment !== 'function') {
        throw new Error('Pi Payment Unavailable. Please use Pi Browser to make Pi payments.');
      }

      const piAmount = parseInt(plan.price);
      
      console.log(`🎯 [SANDBOX] Creating subscription payment for ${plan.name} - ${piAmount} Pi`);

      // Create payment data for sandbox mode
      const paymentData = {
        amount: piAmount,
        memo: `Flappy Pi Subscription: ${plan.name}`,
        recipientAddress: this.WALLET_ADDRESS,
        metadata: {
          subscriptionId: plan.id,
          subscriptionName: plan.name,
          subscriptionType: 'subscription',
          timestamp: Date.now(),
          sandbox: true,
          network: 'sandbox',
          walletAddress: this.WALLET_ADDRESS,
          appId: PI_CONFIG.getAppId(),
          version: '2.0'
        }
      };

      return new Promise((resolve, reject) => {
        const paymentCallbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log('✅ [SANDBOX] Subscription payment ready for approval:', paymentId);
            // In sandbox mode, auto-approve
            return true;
          },

          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log('✅ [SANDBOX] Subscription payment completed:', paymentId, txid);
            resolve({
              success: true,
              paymentId,
              txid
            });
          },

          onCancel: (paymentId: string) => {
            console.log('❌ [SANDBOX] Subscription payment cancelled:', paymentId);
            resolve({
              success: false,
              error: 'Payment cancelled by user'
            });
          },

          onError: (error: any, payment: any) => {
            console.error('❌ [SANDBOX] Subscription payment error:', error, payment);
            resolve({
              success: false,
              error: error.message || 'Payment failed'
            });
          }
        };

        // Create the payment
        window.Pi.createPayment(paymentData, paymentCallbacks);
      });

    } catch (error: any) {
      console.error('❌ [SANDBOX] Subscription payment failed:', error);
      return {
        success: false,
        error: error.message || 'Payment failed'
      };
    }
  }
}

export const sandboxPiPaymentService = new SandboxPiPaymentService();
