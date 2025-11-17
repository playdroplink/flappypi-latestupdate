// Pi Network Platform API Service
// Implements all server-side Platform API endpoints according to official documentation

import { PI_CONFIG } from '@/config/piConfig';

// Platform API Types
export interface UserDTO {
  uid: string; // An app-specific user identifier
  credentials: {
    scopes: Array<string>; // a list of granted scopes
    valid_until: {
      timestamp: number;
      iso8601: string;
    };
  };
  username?: string; // The user's Pi username. Requires the `username` scope.
}

export interface PaymentDTO {
  // Payment data:
  identifier: string; // payment identifier
  user_uid: string; // user's app-specific ID
  amount: number; // payment amount
  memo: string; // a string provided by the developer, shown to the user
  metadata: Object; // an object provided by the developer for their own usage
  from_address: string; // sender address of the blockchain transaction
  to_address: string; // recipient address of the blockchain transaction
  direction: "user_to_app" | "app_to_user"; // direction of the payment
  created_at: string; // the payment's creation timestamp
  network: "Pi Network" | "Pi Testnet"; // a network of the payment

  // Status flags representing the current state of this payment
  status: {
    developer_approved: boolean; // Server-Side Approval
    transaction_verified: boolean; // blockchain transaction verified
    developer_completed: boolean; // Server-Side Completion
    cancelled: boolean; // cancelled by the developer or by Pi Network
    user_cancelled: boolean; // cancelled by the user
  };

  // Blockchain transaction data:
  transaction: null | {
    // This is null if no transaction has been made yet
    txid: string; // id of the blockchain transaction
    verified: boolean; // true if the transaction matches the payment, false otherwise
    _link: string; // a link to the operation on the Blockchain API
  };
}

export interface RewardedAdStatusDTO {
  identifier: string; // the adId token returned from the Pi SDK displayAd("rewarded") method
  mediator_ack_status: "granted" | "revoked" | "failed" | null;
  mediator_granted_at: string | null; // ISO 8601 date string
  mediator_revoked_at: string | null; // ISO 8601 date string
}

export interface CreatePaymentRequest {
  payment: {
    amount: number;
    memo: string;
    metadata: Object;
    uid: string;
  };
}

export interface CompletePaymentRequest {
  txid: string;
}

export interface IncompleteServerPaymentsResponse {
  incomplete_server_payments: Array<PaymentDTO>;
}

class PiPlatformApi {
  private baseUrl: string;
  private serverApiKey: string;

  constructor() {
    this.baseUrl = PI_CONFIG.MAINNET_API_URL;
    this.serverApiKey = PI_CONFIG.API_KEY;
  }

  /**
   * Make an authenticated request to the Pi Platform API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    useServerKey: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (useServerKey) {
      headers['Authorization'] = `Key ${this.serverApiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pi Platform API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Make a request using user access token
   */
  private async makeUserRequest<T>(
    endpoint: string,
    accessToken: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pi Platform API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  // ===== AUTHENTICATION =====

  /**
   * Get user information using access token
   * GET /me
   */
  async getUserInfo(accessToken: string): Promise<UserDTO> {
    try {
      const userData = await this.makeUserRequest<UserDTO>('/me', accessToken);
      console.log('✅ User info retrieved from Platform API:', userData.uid);
      return userData;
    } catch (error) {
      console.error('❌ Failed to get user info from Platform API:', error);
      throw error;
    }
  }

  // ===== PAYMENTS =====

  /**
   * Create an App-to-User payment
   * POST /payments
   */
  async createPayment(paymentData: CreatePaymentRequest): Promise<PaymentDTO> {
    try {
      const payment = await this.makeRequest<PaymentDTO>('/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
      console.log('✅ Payment created via Platform API:', payment.identifier);
      return payment;
    } catch (error) {
      console.error('❌ Failed to create payment via Platform API:', error);
      throw error;
    }
  }

  /**
   * Get payment information
   * GET /payments/{payment_id}
   */
  async getPayment(paymentId: string): Promise<PaymentDTO> {
    try {
      const payment = await this.makeRequest<PaymentDTO>(`/payments/${paymentId}`);
      console.log('✅ Payment retrieved from Platform API:', payment.identifier);
      return payment;
    } catch (error) {
      console.error('❌ Failed to get payment from Platform API:', error);
      throw error;
    }
  }

  /**
   * Approve a payment (Server-side approval)
   * POST /payments/{payment_id}/approve
   */
  async approvePayment(paymentId: string): Promise<PaymentDTO> {
    try {
      const payment = await this.makeRequest<PaymentDTO>(`/payments/${paymentId}/approve`, {
        method: 'POST',
      });
      console.log('✅ Payment approved via Platform API:', payment.identifier);
      return payment;
    } catch (error) {
      console.error('❌ Failed to approve payment via Platform API:', error);
      throw error;
    }
  }

  /**
   * Complete a payment (Server-side completion)
   * POST /payments/{payment_id}/complete
   */
  async completePayment(paymentId: string, txid: string): Promise<PaymentDTO> {
    try {
      const completeData: CompletePaymentRequest = { txid };
      const payment = await this.makeRequest<PaymentDTO>(`/payments/${paymentId}/complete`, {
        method: 'POST',
        body: JSON.stringify(completeData),
      });
      console.log('✅ Payment completed via Platform API:', payment.identifier);
      return payment;
    } catch (error) {
      console.error('❌ Failed to complete payment via Platform API:', error);
      throw error;
    }
  }

  /**
   * Cancel a payment
   * POST /payments/{payment_id}/cancel
   */
  async cancelPayment(paymentId: string): Promise<PaymentDTO> {
    try {
      const payment = await this.makeRequest<PaymentDTO>(`/payments/${paymentId}/cancel`, {
        method: 'POST',
      });
      console.log('✅ Payment cancelled via Platform API:', payment.identifier);
      return payment;
    } catch (error) {
      console.error('❌ Failed to cancel payment via Platform API:', error);
      throw error;
    }
  }

  /**
   * Get incomplete server payments
   * GET /payments/incomplete_server_payments
   */
  async getIncompleteServerPayments(): Promise<IncompleteServerPaymentsResponse> {
    try {
      const response = await this.makeRequest<IncompleteServerPaymentsResponse>('/payments/incomplete_server_payments');
      console.log('✅ Incomplete server payments retrieved:', response.incomplete_server_payments.length);
      return response;
    } catch (error) {
      console.error('❌ Failed to get incomplete server payments:', error);
      throw error;
    }
  }

  // ===== ADS =====

  /**
   * Verify rewarded ad status
   * GET /ads_network/status/:adId
   */
  async verifyRewardedAd(adId: string): Promise<RewardedAdStatusDTO> {
    try {
      const adStatus = await this.makeRequest<RewardedAdStatusDTO>(`/ads_network/status/${adId}`);
      console.log('✅ Rewarded ad status verified:', adStatus.identifier, adStatus.mediator_ack_status);
      return adStatus;
    } catch (error) {
      console.error('❌ Failed to verify rewarded ad status:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Check if a payment is ready for approval
   */
  isPaymentReadyForApproval(payment: PaymentDTO): boolean {
    return !payment.status.developer_approved && 
           !payment.status.cancelled && 
           !payment.status.user_cancelled;
  }

  /**
   * Check if a payment is ready for completion
   */
  isPaymentReadyForCompletion(payment: PaymentDTO): boolean {
    return payment.status.developer_approved && 
           payment.status.transaction_verified && 
           !payment.status.developer_completed && 
           !payment.status.cancelled && 
           !payment.status.user_cancelled &&
           payment.transaction !== null;
  }

  /**
   * Check if a rewarded ad was successfully granted
   */
  isRewardedAdGranted(adStatus: RewardedAdStatusDTO): boolean {
    return adStatus.mediator_ack_status === 'granted';
  }

  /**
   * Get payment status summary
   */
  getPaymentStatusSummary(payment: PaymentDTO): string {
    if (payment.status.cancelled) return 'Cancelled';
    if (payment.status.user_cancelled) return 'User Cancelled';
    if (payment.status.developer_completed) return 'Completed';
    if (payment.status.transaction_verified && payment.status.developer_approved) return 'Ready for Completion';
    if (payment.status.developer_approved) return 'Approved';
    return 'Pending Approval';
  }

  /**
   * Get API status
   */
  getApiStatus(): {
    baseUrl: string;
    hasServerApiKey: boolean;
    serverApiKeyLength: number;
  } {
    return {
      baseUrl: this.baseUrl,
      hasServerApiKey: !!this.serverApiKey,
      serverApiKeyLength: this.serverApiKey.length,
    };
  }
}

// Export singleton instance
export const piPlatformApi = new PiPlatformApi();
export default piPlatformApi;
