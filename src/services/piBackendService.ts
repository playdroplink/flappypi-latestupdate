// Pi Network Backend Service
// Handles server-side payment processing and order management

import { PI_CONFIG } from '../config/piConfig';

export interface PaymentApprovalRequest {
  paymentId: string;
  orderId: string;
  amount: number;
  memo: string;
  metadata: any;
}

export interface PaymentCompletionRequest {
  paymentId: string;
  txid: string;
  orderId: string;
}

export interface DeliveryRequest {
  orderId: string;
  userId: string;
  itemType: string;
  itemId: string;
  metadata: any;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

class PiBackendService {
  private static instance: PiBackendService;
  private readonly API_BASE_URL = '/api/pi';
  private readonly MAINNET_WALLET_ADDRESS = 'GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI';

  private constructor() {}

  static getInstance(): PiBackendService {
    if (!PiBackendService.instance) {
      PiBackendService.instance = new PiBackendService();
    }
    return PiBackendService.instance;
  }

  /**
   * Approve payment on server side
   */
  async approvePayment(request: PaymentApprovalRequest): Promise<PaymentResponse> {
    try {
      console.log('🔐 Approving payment on server:', request.paymentId);

      const response = await fetch(`${this.API_BASE_URL}/approve-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          network: PI_CONFIG.getNetworkMode(),
          walletAddress: this.MAINNET_WALLET_ADDRESS,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Payment approved on server:', result);
      
      return {
        success: true,
        message: 'Payment approved successfully',
        data: result
      };
    } catch (error) {
      console.error('❌ Payment approval failed:', error);
      return {
        success: false,
        message: 'Payment approval failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Complete payment on server side
   */
  async completePayment(request: PaymentCompletionRequest): Promise<PaymentResponse> {
    try {
      console.log('✅ Completing payment on server:', request.paymentId);

      const response = await fetch(`${this.API_BASE_URL}/complete-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          network: PI_CONFIG.getNetworkMode(),
          walletAddress: this.MAINNET_WALLET_ADDRESS,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Payment completed on server:', result);
      
      return {
        success: true,
        message: 'Payment completed successfully',
        data: result
      };
    } catch (error) {
      console.error('❌ Payment completion failed:', error);
      return {
        success: false,
        message: 'Payment completion failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Deliver items to user
   */
  async deliverItems(request: DeliveryRequest): Promise<PaymentResponse> {
    try {
      console.log('🎁 Delivering items to user:', request.orderId);

      const response = await fetch(`${this.API_BASE_URL}/deliver-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          network: PI_CONFIG.getNetworkMode(),
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Items delivered successfully:', result);
      
      return {
        success: true,
        message: 'Items delivered successfully',
        data: result
      };
    } catch (error) {
      console.error('❌ Item delivery failed:', error);
      return {
        success: false,
        message: 'Item delivery failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      console.log('📊 Getting payment status:', paymentId);

      const response = await fetch(`${this.API_BASE_URL}/payment-status?paymentId=${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📊 Payment status retrieved:', result);
      
      return {
        success: true,
        message: 'Payment status retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('❌ Failed to get payment status:', error);
      return {
        success: false,
        message: 'Failed to get payment status',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get order history for user
   */
  async getOrderHistory(userId: string, limit: number = 20): Promise<PaymentResponse> {
    try {
      console.log('📋 Getting order history for user:', userId);

      const response = await fetch(`${this.API_BASE_URL}/order-history?userId=${userId}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📋 Order history retrieved:', result);
      
      return {
        success: true,
        message: 'Order history retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('❌ Failed to get order history:', error);
      return {
        success: false,
        message: 'Failed to get order history',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify payment with Pi Network
   */
  async verifyPayment(paymentId: string, txid: string): Promise<PaymentResponse> {
    try {
      console.log('🔍 Verifying payment with Pi Network:', { paymentId, txid });

      const response = await fetch(`${this.API_BASE_URL}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          txid,
          network: PI_CONFIG.getNetworkMode(),
          walletAddress: this.MAINNET_WALLET_ADDRESS
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🔍 Payment verification result:', result);
      
      return {
        success: true,
        message: 'Payment verified successfully',
        data: result
      };
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      return {
        success: false,
        message: 'Payment verification failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get wallet balance from mainnet
   */
  async getWalletBalance(): Promise<PaymentResponse> {
    try {
      console.log('💰 Getting wallet balance from mainnet');

      const response = await fetch(`${this.API_BASE_URL}/wallet-balance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('💰 Wallet balance retrieved:', result);
      
      return {
        success: true,
        message: 'Wallet balance retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('❌ Failed to get wallet balance:', error);
      return {
        success: false,
        message: 'Failed to get wallet balance',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get transaction history from mainnet
   */
  async getTransactionHistory(limit: number = 50): Promise<PaymentResponse> {
    try {
      console.log('📜 Getting transaction history from mainnet');

      const response = await fetch(`${this.API_BASE_URL}/transaction-history?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📜 Transaction history retrieved:', result);
      
      return {
        success: true,
        message: 'Transaction history retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('❌ Failed to get transaction history:', error);
      return {
        success: false,
        message: 'Failed to get transaction history',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Health check for backend service
   */
  async healthCheck(): Promise<PaymentResponse> {
    try {
      console.log('🏥 Performing backend health check');

      const response = await fetch(`${this.API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🏥 Backend health check passed:', result);
      
      return {
        success: true,
        message: 'Backend service is healthy',
        data: result
      };
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      return {
        success: false,
        message: 'Backend service is unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const piBackendService = PiBackendService.getInstance();
export default piBackendService;
