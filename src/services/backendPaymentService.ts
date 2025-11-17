// Backend Payment Service
// Handles all backend operations for Pi payments - unified and consistent

export interface BackendPaymentRequest {
  paymentId: string;
  txid?: string;
  metadata: any;
  userId?: string;
}

export interface BackendPaymentResponse {
  success: boolean;
  verified?: boolean;
  error?: string;
  status?: string;
}

export class BackendPaymentService {
  private static instance: BackendPaymentService;
  
  private constructor() {}
  
  public static getInstance(): BackendPaymentService {
    if (!BackendPaymentService.instance) {
      BackendPaymentService.instance = new BackendPaymentService();
    }
    return BackendPaymentService.instance;
  }

  /**
   * Approve Payment with Pi Network
   */
  async approvePayment(request: BackendPaymentRequest): Promise<BackendPaymentResponse> {
    try {
      console.log('🔐 Approving payment:', request.paymentId);
      
      const response = await fetch('/api/pi/approve-payment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.userId || 'anonymous'}`
        },
        body: JSON.stringify({
          paymentId: request.paymentId,
          metadata: request.metadata
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment approval failed');
      }

      const result = await response.json();
      console.log('✅ Payment approved:', result);
      
      return {
        success: true,
        verified: result.verified || false,
        status: result.status || 'approved'
      };
    } catch (error: any) {
      console.error('❌ Payment approval failed:', error);
      return {
        success: false,
        error: error.message || 'Payment approval failed'
      };
    }
  }

  /**
   * Complete Payment with Pi Network
   */
  async completePayment(request: BackendPaymentRequest): Promise<BackendPaymentResponse> {
    try {
      console.log('✅ Completing payment:', request.paymentId, request.txid);
      
      const response = await fetch('/api/pi/complete-payment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.userId || 'anonymous'}`
        },
        body: JSON.stringify({
          paymentId: request.paymentId,
          txid: request.txid,
          metadata: request.metadata
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment completion failed');
      }

      const result = await response.json();
      console.log('✅ Payment completed:', result);
      
      return {
        success: true,
        verified: result.verified || false,
        status: result.status || 'completed'
      };
    } catch (error: any) {
      console.error('❌ Payment completion failed:', error);
      return {
        success: false,
        error: error.message || 'Payment completion failed'
      };
    }
  }

  /**
   * Verify Payment with Pi Network
   */
  async verifyPayment(paymentId: string, txid: string, amount: number, itemName: string, itemType: string): Promise<BackendPaymentResponse> {
    try {
      console.log('🔍 Verifying payment:', { paymentId, txid, amount, itemName, itemType });
      
      const response = await fetch('/api/pi/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          txid,
          amount,
          itemName,
          itemType
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment verification failed');
      }

      const result = await response.json();
      console.log('✅ Payment verified:', result);
      
      return {
        success: true,
        verified: result.verified || false,
        status: result.status || 'verified'
      };
    } catch (error: any) {
      console.error('❌ Payment verification failed:', error);
      return {
        success: false,
        error: error.message || 'Payment verification failed'
      };
    }
  }

  /**
   * Get Payment Status
   */
  async getPaymentStatus(paymentId: string): Promise<BackendPaymentResponse> {
    try {
      console.log('📊 Getting payment status:', paymentId);
      
      const response = await fetch(`/api/pi/payment-status/${paymentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get payment status');
      }

      const result = await response.json();
      console.log('📊 Payment status:', result);
      
      return {
        success: true,
        verified: result.verified || false,
        status: result.status || 'unknown'
      };
    } catch (error: any) {
      console.error('❌ Failed to get payment status:', error);
      return {
        success: false,
        error: error.message || 'Failed to get payment status'
      };
    }
  }

  /**
   * Cancel Payment
   */
  async cancelPayment(paymentId: string): Promise<BackendPaymentResponse> {
    try {
      console.log('❌ Cancelling payment:', paymentId);
      
      const response = await fetch('/api/pi/cancel-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment cancellation failed');
      }

      const result = await response.json();
      console.log('✅ Payment cancelled:', result);
      
      return {
        success: true,
        status: 'cancelled'
      };
    } catch (error: any) {
      console.error('❌ Payment cancellation failed:', error);
      return {
        success: false,
        error: error.message || 'Payment cancellation failed'
      };
    }
  }
}

// Export singleton instance
export const backendPaymentService = BackendPaymentService.getInstance();
export default backendPaymentService;
