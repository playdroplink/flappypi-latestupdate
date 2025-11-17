// Official Pi Network Payment Service
// Follows the exact pattern from Pi Platform documentation
// Reference: https://github.com/pi-apps/pi-platform-docs

import { piNetworkConfig } from '../config/piNetworkConfig';

export interface PaymentRequest {
  amount: number;
  memo: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  txid?: string;
  error?: string;
}

/**
 * Official Pi Payment Service
 * Implements payment flow exactly as documented in Pi Platform docs
 */
export class OfficialPiPaymentService {
  private static instance: OfficialPiPaymentService;

  static getInstance(): OfficialPiPaymentService {
    if (!OfficialPiPaymentService.instance) {
      OfficialPiPaymentService.instance = new OfficialPiPaymentService();
    }
    return OfficialPiPaymentService.instance;
  }

  /**
   * Create a payment following official Pi Platform documentation
   * Reference: https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    return new Promise((resolve, reject) => {
      try {
        // Check if Pi SDK is available
        if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
          reject(new Error('Pi SDK not available. Please use Pi Browser.'));
          return;
        }

        if (typeof window.Pi.createPayment !== 'function') {
          reject(new Error('Pi.createPayment is not available. Please ensure you are using Pi Browser.'));
          return;
        }

        console.log('💰 [PAYMENT API] Creating Pi payment:', {
          amount: request.amount,
          memo: request.memo,
          metadata: request.metadata
        });
        console.log('🌐 [PAYMENT API] Network mode:', piNetworkConfig.pi.sandbox ? 'SANDBOX' : 'MAINNET');
        console.log('🔗 [PAYMENT API] API URL:', piNetworkConfig.pi.apiUrl);

        // Payment data (no recipientAddress - handled by backend)
        const paymentData = {
          amount: request.amount,
          memo: request.memo,
          metadata: request.metadata || {}
        };

        // Payment callbacks exactly as per official documentation
        const callbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log('🔄 [PAYMENT API] Payment ready for server approval:', paymentId);
            console.log('🌐 [PAYMENT API] Calling backend endpoint: /api/pi/approve-payment');
            console.log('📦 [PAYMENT API] Request payload:', {
              paymentId,
              amount: request.amount,
              memo: request.memo,
              metadata: request.metadata
            });
            
            try {
              // Call backend API for payment approval
              // Reference: POST https://api.minepi.com/v2/payments/{payment_id}/approve
              const apiUrl = '/api/pi/approve-payment';
              console.log('📡 [PAYMENT API] Fetching:', apiUrl);
              
              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  paymentId,
                  amount: request.amount,
                  memo: request.memo,
                  metadata: request.metadata
                })
              });

              console.log('📥 [PAYMENT API] Response status:', response.status, response.statusText);
              console.log('📥 [PAYMENT API] Response headers:', Object.fromEntries(response.headers.entries()));

              if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [PAYMENT API] Server approval failed:', {
                  status: response.status,
                  statusText: response.statusText,
                  error: errorText
                });
                return false; // Reject payment
              }

              const result = await response.json();
              console.log('✅ [PAYMENT API] Payment approved by server:', result);
              console.log('🔗 [PAYMENT API] Backend will call Pi Platform API:', 
                `https://api.minepi.com/v2/payments/${paymentId}/approve`);
              return true; // Approve payment
            } catch (error: any) {
              console.error('❌ [PAYMENT API] Server approval error:', {
                error: error.message,
                stack: error.stack,
                name: error.name
              });
              return false; // Reject payment on error
            }
          },

          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log('✅ [PAYMENT API] Payment ready for server completion:', { paymentId, txid });
            console.log('🌐 [PAYMENT API] Calling backend endpoint: /api/pi/complete-payment');
            console.log('📦 [PAYMENT API] Request payload:', {
              paymentId,
              txid,
              amount: request.amount,
              memo: request.memo,
              metadata: request.metadata
            });
            
            try {
              // Call backend API for payment completion
              // Reference: POST https://api.minepi.com/v2/payments/{payment_id}/complete
              const apiUrl = '/api/pi/complete-payment';
              console.log('📡 [PAYMENT API] Fetching:', apiUrl);
              
              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  paymentId,
                  txid,
                  amount: request.amount,
                  memo: request.memo,
                  metadata: request.metadata
                })
              });

              console.log('📥 [PAYMENT API] Response status:', response.status, response.statusText);
              console.log('📥 [PAYMENT API] Response headers:', Object.fromEntries(response.headers.entries()));

              if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [PAYMENT API] Server completion failed:', {
                  status: response.status,
                  statusText: response.statusText,
                  error: errorText
                });
                reject(new Error(`Payment completion failed: ${errorText || response.statusText}`));
                return;
              }

              const result = await response.json();
              console.log('✅ [PAYMENT API] Payment completed by server:', result);
              console.log('🔗 [PAYMENT API] Backend called Pi Platform API:', 
                `https://api.minepi.com/v2/payments/${paymentId}/complete`);
              
              // Resolve with payment details
              resolve({
                success: true,
                paymentId,
                txid,
              });
            } catch (error: any) {
              console.error('❌ [PAYMENT API] Server completion error:', {
                error: error.message,
                stack: error.stack,
                name: error.name
              });
              reject(new Error(`Payment completion failed: ${error.message || 'Unknown error'}`));
            }
          },

          onCancel: (paymentId: string) => {
            console.log('❌ Payment cancelled by user:', paymentId);
            reject(new Error('Payment cancelled by user'));
          },

          onError: (error: Error, payment?: any) => {
            console.error('❌ Payment error:', error, payment);
            reject(error);
          }
        };

        // Create payment using Pi SDK (callback-based; no Promise chaining)
        // Reference: Pi.createPayment(paymentData, callbacks)
        try {
          window.Pi.createPayment(paymentData, callbacks);
        } catch (err: any) {
          console.error('❌ Payment creation failed:', err);
          reject(err);
        }

      } catch (error: any) {
        console.error('❌ Payment service error:', error);
        reject(error);
      }
    });
  }

  /**
   * Process shop item payment
   */
  async processShopPayment(item: {
    id: string;
    name: string;
    amount: number;
    type: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentResult> {
    return this.createPayment({
      amount: item.amount,
      memo: `Flappy Pi Purchase: ${item.name}`,
      metadata: {
        itemId: item.id,
        itemName: item.name,
        itemType: item.type,
        ...item.metadata
      }
    });
  }

  /**
   * Process subscription payment
   */
  async processSubscriptionPayment(plan: {
    id: string;
    name: string;
    amount: number;
    durationDays?: number;
    metadata?: Record<string, any>;
  }): Promise<PaymentResult> {
    return this.createPayment({
      amount: plan.amount,
      memo: `Flappy Pi Subscription: ${plan.name}`,
      metadata: {
        subscriptionId: plan.id,
        subscriptionName: plan.name,
        subscriptionType: 'subscription',
        durationDays: plan.durationDays,
        ...plan.metadata
      }
    });
  }
}

export const officialPiPaymentService = OfficialPiPaymentService.getInstance();

