// Pi Network Payment Service
// Based on the comprehensive Pi Network Payment Integration Guide

import { piNetworkConfig } from '../config/piNetworkConfig';
import { piAuthService } from './piAuthService';

export interface PaymentRequest {
  amount: number;
  memo: string;
  metadata?: Record<string, any>;
  uid?: string;
}

export interface PaymentResult {
  success: boolean;
  payment?: any;
  error?: string;
  identifier?: string;
  transaction?: any;
}

class PiPaymentService {
  private static instance: PiPaymentService;
  private isInitialized = false;

  static getInstance(): PiPaymentService {
    if (!PiPaymentService.instance) {
      PiPaymentService.instance = new PiPaymentService();
    }
    return PiPaymentService.instance;
  }

  // Initialize the payment service
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (!window.Pi) {
        throw new Error('Pi SDK not loaded');
      }

      // Initialize Pi SDK with mainnet mode
      if (window.Pi.init) {
        await window.Pi.init({
          version: "2.0",
          sandbox: false, // Mainnet mode enabled
          validationKey: piNetworkConfig.pi.validationKey
        });
        console.log('✅ Pi Payment Service initialized for mainnet mode');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Pi Payment Service:', error);
      throw error;
    }
  }

  // Create a payment
  public async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    try {
      await this.initialize();

      // Ensure user is authenticated
      const user = piAuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // For production mode, skip scope validation
      if (piNetworkConfig.pi.productionMode && !piNetworkConfig.pi.sandbox) {
        console.log('✅ Production mode: Completely bypassing scope validation');
      } else {
        // Ensure user has payments scope for sandbox
        if (!piAuthService.hasPaymentsScope()) {
          console.log('⚠️ User does not have payments scope, attempting to get payments permission...');
          
          try {
            await piAuthService.forceReAuthentication();
            
            if (!piAuthService.hasPaymentsScope()) {
              throw new Error('Payments scope is required for Pi Network payments');
            } else {
              console.log('✅ Payments scope obtained after re-authentication');
            }
          } catch (reauthError) {
            console.error('❌ Re-authentication failed:', reauthError);
            throw new Error('Payments scope is required for Pi Network payments');
          }
        }
      }

      // Define payment callbacks
      const callbacks = {
        onReadyForServerApproval: (paymentId: string) => {
          console.log('🔄 Payment ready for server approval:', paymentId);
          return this.handleServerApproval({ identifier: paymentId } as any);
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          console.log('🔄 Payment ready for server completion:', paymentId, txid);
          return this.handleServerCompletion({ identifier: paymentId } as any, txid);
        },
        onCancel: (paymentId: string) => {
          console.log('❌ Payment cancelled:', paymentId);
          return this.handlePaymentCancel({ identifier: paymentId } as any);
        },
        onError: (error: Error, payment?: any) => {
          console.error('❌ Payment error:', error, payment);
          return this.handlePaymentError(error, payment);
        }
      };

      // Create payment with enhanced error handling
      console.log('💰 Creating Pi payment with complete details:', {
        amount: paymentRequest.amount,
        memo: paymentRequest.memo,
        product: paymentRequest.metadata?.planName || paymentRequest.metadata?.product || 'Flappy Pi Product',
        user: user.uid,
        username: user.username,
        walletAddress: piNetworkConfig.pi.subscriptionWalletAddress,
        metadata: paymentRequest.metadata
      });

      try {
        // Start payment using callback-based API and resolve on completion
        return await new Promise<PaymentResult>(async (resolve) => {
          const wrappedCallbacks = {
            onReadyForServerApproval: (paymentId: string) => {
              console.log('🔄 Payment ready for server approval:', paymentId);
              const r = this.handleServerApproval({ identifier: paymentId } as any);
              return r;
            },
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              console.log('🔄 Payment ready for server completion:', paymentId, txid);
              try {
                await this.handleServerCompletion({ identifier: paymentId } as any, txid);
                resolve({ success: true, identifier: paymentId, transaction: { txid } });
              } catch (e: any) {
                resolve({ success: false, error: e?.message || 'Completion failed' });
              }
            },
            onCancel: (paymentId: string) => {
              console.log('❌ Payment cancelled:', paymentId);
              this.handlePaymentCancel({ identifier: paymentId } as any);
              resolve({ success: false, error: 'Payment cancelled by user' });
            },
            onError: (error: Error, payment?: any) => {
              console.error('❌ Payment error:', error, payment);
              this.handlePaymentError(error, payment);
              resolve({ success: false, error: error.message || 'Payment error' });
            }
          };

          try {
            window.Pi.createPayment({
              amount: paymentRequest.amount,
              memo: paymentRequest.memo,
              recipientAddress: piNetworkConfig.pi.subscriptionWalletAddress,
              metadata: {
                ...paymentRequest.metadata,
                user_id: user.uid,
                username: user.username,
                timestamp: Date.now(),
                product: paymentRequest.metadata?.planName || paymentRequest.metadata?.product || 'Flappy Pi Product',
                walletAddress: piNetworkConfig.pi.subscriptionWalletAddress
              },
              uid: paymentRequest.uid || user.uid
            }, wrappedCallbacks as any);
          } catch (startErr: any) {
            resolve({ success: false, error: startErr?.message || 'Failed to start payment' });
          }
        });
      } catch (scopeError: any) {
        // Handle scope-related errors specifically
        if (scopeError.message && scopeError.message.includes('payments scope')) {
          console.log('🔄 Scope error detected, attempting to re-authenticate...');
          
          try {
            await piAuthService.forceReAuthentication();
            
            console.log('🔄 Retrying payment creation after re-authentication...');
            return await new Promise<PaymentResult>(async (resolve) => {
              try {
                window.Pi.createPayment({
                  amount: paymentRequest.amount,
                  memo: paymentRequest.memo,
                  recipientAddress: piNetworkConfig.pi.subscriptionWalletAddress,
                  metadata: {
                    ...paymentRequest.metadata,
                    user_id: user.uid,
                    username: user.username,
                    timestamp: Date.now(),
                    product: paymentRequest.metadata?.planName || paymentRequest.metadata?.product || 'Flappy Pi Product',
                    walletAddress: piNetworkConfig.pi.subscriptionWalletAddress
                  },
                  uid: paymentRequest.uid || user.uid
                }, {
                  onReadyForServerApproval: (paymentId: string) => this.handleServerApproval({ identifier: paymentId } as any),
                  onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                    try {
                      await this.handleServerCompletion({ identifier: paymentId } as any, txid);
                      resolve({ success: true, identifier: paymentId, transaction: { txid } });
                    } catch (e: any) {
                      resolve({ success: false, error: e?.message || 'Completion failed' });
                    }
                  },
                  onCancel: (paymentId: string) => {
                    this.handlePaymentCancel({ identifier: paymentId } as any);
                    resolve({ success: false, error: 'Payment cancelled by user' });
                  },
                  onError: (error: Error, payment?: any) => {
                    this.handlePaymentError(error, payment);
                    resolve({ success: false, error: error.message || 'Payment error' });
                  }
                } as any);
              } catch (startErr: any) {
                resolve({ success: false, error: startErr?.message || 'Failed to start payment' });
              }
            });
          } catch (retryError) {
            console.error('❌ Payment creation failed even after re-authentication:', retryError);
            throw new Error('Payment creation failed. Please try signing in again.');
          }
        } else {
          throw scopeError;
        }
      }
      // Should not reach here due to earlier returns
      return { success: false, error: 'Payment did not complete' };
    } catch (error: any) {
      console.error('❌ Payment creation failed:', error);
      return { 
        success: false, 
        error: error.message || 'Payment creation failed' 
      };
    }
  }

  // Payment callbacks
  private async handleServerApproval(payment: any): Promise<void> {
    console.log('🔄 Handling server approval:', payment);
    
    try {
      const response = await fetch('/api/pi/approve-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: payment.identifier,
          amount: payment.amount,
          memo: payment.memo,
          metadata: payment.metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Server approval failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Payment approved by server:', result);
      return Promise.resolve();
    } catch (error) {
      console.error('❌ Server approval failed:', error);
      throw error;
    }
  }

  private async handleServerCompletion(payment: any, txid: string): Promise<void> {
    console.log('🔄 Handling server completion:', payment, txid);
    
    try {
      const response = await fetch('/api/pi/complete-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: payment.identifier,
          txid: txid
        })
      });

      if (!response.ok) {
        throw new Error(`Server completion failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Payment completed by server:', result);
      return Promise.resolve();
    } catch (error) {
      console.error('❌ Server completion failed:', error);
      throw error;
    }
  }

  private async handlePaymentCancel(payment: any): Promise<void> {
    console.log('❌ Handling payment cancellation:', payment);
    // Implement your cancellation logic here
  }

  private async handlePaymentError(error: Error, payment?: any): Promise<void> {
    console.error('❌ Handling payment error:', error, payment);
    // Implement your error handling logic here
  }
}

export const piPaymentService = new PiPaymentService();