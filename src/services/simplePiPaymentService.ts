// Simple Pi Payment Service - No Backend Required
// Fixes payment loading issues by providing direct Pi SDK integration

export interface SimplePaymentData {
  amount: number;
  memo: string;
  recipientAddress?: string;
  metadata?: any;
}

export interface SimplePaymentResult {
  success: boolean;
  paymentId?: string;
  txid?: string;
  error?: string;
}

export class SimplePiPaymentService {
  private static instance: SimplePiPaymentService;
  private isInitialized = false;
  private readonly WALLET_ADDRESS = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7J';

  public static getInstance(): SimplePiPaymentService {
    if (!SimplePiPaymentService.instance) {
      SimplePiPaymentService.instance = new SimplePiPaymentService();
    }
    return SimplePiPaymentService.instance;
  }

  /**
   * Initialize Pi SDK
   */
  async initialize(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        console.error('❌ Pi SDK not available. Please use Pi Browser.');
        return false;
      }

      // Initialize Pi SDK
      await window.Pi.init({ version: "2.0" });
      this.isInitialized = true;
      
      console.log('✅ Simple Pi Payment Service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Pi Payment Service:', error);
      return false;
    }
  }

  /**
   * Create a simple payment without backend dependencies
   * This prevents loading issues by using direct Pi SDK integration
   */
  async createSimplePayment(paymentData: SimplePaymentData): Promise<SimplePaymentResult> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Pi SDK not initialized');
        }
      }

      if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
        throw new Error('Pi SDK not available. Please use Pi Browser.');
      }

      console.log('💳 Creating simple Pi payment:', paymentData);

        // Create payment callbacks
        const callbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log('💳 Payment ready for approval:', paymentId);

            // In sandbox mode, auto-approve for testing
            if (PI_CONFIG && PI_CONFIG.isSandbox && PI_CONFIG.isSandbox()) {
              console.log('✅ Auto-approving (sandbox mode):', paymentId);
              return true;
            }

            // Otherwise call backend approval endpoint
            try {
              const res = await fetch('/api/pi/approve-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, metadata: paymentData.metadata })
              });
              console.log('📡 Approve response status:', res.status);
              return res.status === 200;
            } catch (err) {
              console.error('❌ Error calling approve endpoint:', err);
              return false;
            }
          },

          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log('💳 Payment ready for completion:', { paymentId, txid });

            // In sandbox mode, auto-complete
            if (PI_CONFIG && PI_CONFIG.isSandbox && PI_CONFIG.isSandbox()) {
              console.log('✅ Auto-completing (sandbox mode):', { paymentId, txid });
              return true;
            }

            try {
              const res = await fetch('/api/pi/complete-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid, metadata: paymentData.metadata })
              });
              console.log('📡 Complete response status:', res.status);
              return res.status === 200;
            } catch (err) {
              console.error('❌ Error calling complete endpoint:', err);
              return false;
            }
          },

          onCancel: (paymentId: string) => {
            console.log('❌ Payment cancelled:', paymentId);
          },

          onError: (error: any, payment: any) => {
            console.error('❌ Payment error:', error, payment);
          }
        };

        return await new Promise<SimplePaymentResult>((resolve) => {
          try {
            window.Pi.createPayment(paymentData, {
              ...callbacks,
              onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                console.log('💳 Payment ready for completion:', { paymentId, txid });
                try {
                  // Reuse existing completion logic in callbacks
                  const ok = await callbacks.onReadyForServerCompletion!(paymentId, txid);
                  if (ok) {
                    resolve({ success: true, paymentId, txid });
                  } else {
                    resolve({ success: false, error: 'Server completion failed' });
                  }
                } catch (e: any) {
                  resolve({ success: false, error: e?.message || 'Completion error' });
                }
              },
              onCancel: (paymentId: string) => {
                callbacks.onCancel(paymentId);
                resolve({ success: false, error: 'Payment cancelled by user' });
              },
              onError: (error: any, payment: any) => {
                callbacks.onError(error, payment);
                resolve({ success: false, error: error?.message || 'Payment error' });
              }
            });
          } catch (startErr: any) {
            resolve({ success: false, error: startErr?.message || 'Failed to start payment' });
          }
        });

    } catch (error: any) {
      console.error('❌ Simple payment creation failed:', error);
      return {
        success: false,
        error: error.message || 'Payment creation failed'
      };
    }
  }

  /**
   * Create a shop payment with simplified flow
   */
  async createShopPayment(
    item: {
      id: string;
      name: string;
      price: number;
      description?: string;
    },
    quantity: number = 1
  ): Promise<SimplePaymentResult> {
    try {
      const paymentData: SimplePaymentData = {
        amount: item.price * quantity,
        memo: `Flappy Pi Shop: ${item.name}${quantity > 1 ? ` (${quantity}x)` : ''}`,
        recipientAddress: this.WALLET_ADDRESS,
        metadata: {
          itemId: item.id,
          itemName: item.name,
          quantity: quantity,
          totalPrice: item.price * quantity,
          timestamp: Date.now(),
          type: 'shop_payment',
          walletAddress: this.WALLET_ADDRESS
        }
      };

      return await this.createSimplePayment(paymentData);

    } catch (error: any) {
      console.error('❌ Shop payment creation failed:', error);
      return {
        success: false,
        error: error.message || 'Shop payment creation failed'
      };
    }
  }

  /**
   * Create a subscription payment with simplified flow
   */
  async createSubscriptionPayment(
    subscription: {
      id: string;
      name: string;
      price: number;
      duration: string;
    }
  ): Promise<SimplePaymentResult> {
    try {
      const paymentData: SimplePaymentData = {
        amount: subscription.price,
        memo: `Flappy Pi Subscription: ${subscription.name} (${subscription.duration})`,
        recipientAddress: this.WALLET_ADDRESS,
        metadata: {
          subscriptionId: subscription.id,
          subscriptionName: subscription.name,
          duration: subscription.duration,
          price: subscription.price,
          timestamp: Date.now(),
          type: 'subscription_payment',
          walletAddress: this.WALLET_ADDRESS
        }
      };

      return await this.createSimplePayment(paymentData);

    } catch (error: any) {
      console.error('❌ Subscription payment creation failed:', error);
      return {
        success: false,
        error: error.message || 'Subscription payment creation failed'
      };
    }
  }

  /**
   * Check if Pi SDK is available
   */
  isPiSDKAvailable(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.Pi !== 'undefined' && 
           typeof window.Pi.createPayment === 'function';
  }

  /**
   * Get current Pi user
   */
  getCurrentUser(): any {
    if (this.isPiSDKAvailable() && window.Pi.currentUser) {
      return window.Pi.currentUser();
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (this.isPiSDKAvailable() && window.Pi.isAuthenticated) {
      return window.Pi.isAuthenticated();
    }
    return false;
  }
}

// Export singleton instance
export const simplePiPaymentService = SimplePiPaymentService.getInstance();
