// Pi App-to-User (A2U) Payment Service - Official Integration for Testnet Mode
// Following the official Pi Network Platform API documentation for A2U payments

// Official Pi Platform API Types
export interface UserDTO {
  uid: string; // An app-specific user identifier
  credentials: {
    scopes: Array<Scope>; // a list of granted scopes
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
  direction: Direction; // direction of the payment
  created_at: string; // the payment's creation timestamp
  network: AppNetwork; // a network of the payment

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

export type Direction = "user_to_app" | "app_to_user";
export type AppNetwork = "Pi Network" | "Pi Testnet";
export type Scope = "username" | "payments" | "wallet_address";

// A2U Payment Request Types
export interface A2UPaymentRequest {
  payment: {
    amount: number;
    memo: string;
    metadata: Object;
    uid: string; // User's app-specific ID
  };
}

export interface CompletePaymentRequest {
  txid: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface IncompletePaymentsResponse {
  incomplete_server_payments: PaymentDTO[];
}

// Service Configuration
export interface PiA2UPaymentConfig {
  apiBaseUrl: string;
  serverApiKey: string;
  appId: string;
  sandbox: boolean;
  timeout: number;
}

export class PiA2UPaymentService {
  private config: PiA2UPaymentConfig;
  private isInitialized = false;

  constructor(config?: Partial<PiA2UPaymentConfig>) {
    this.config = {
      apiBaseUrl: 'https://api.minepi.com/v2', // Mainnet API
      serverApiKey: import.meta.env.VITE_PI_SERVER_API_KEY || '',
      appId: import.meta.env.VITE_PI_APP_ID || 'flappypi2807',
      sandbox: false, // Mainnet mode
      timeout: 30000, // 30 seconds
      ...config
    };
  }

  /**
   * Initialize the A2U Payment Service
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🎯 Initializing Pi A2U Payment Service (Mainnet Mode)...');
      
      if (!this.config.serverApiKey) {
        console.error('❌ Server API Key is required for A2U payments');
        return false;
      }

      this.isInitialized = true;
      console.log('✅ Pi A2U Payment Service initialized successfully');
      console.log(`🔧 Network Mode: ${this.config.sandbox ? 'testnet' : 'mainnet'}`);
      console.log(`🌐 API Base URL: ${this.config.apiBaseUrl}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize A2U Payment Service:', error);
      return false;
    }
  }

  /**
   * Create an App-to-User (A2U) payment
   * POST /payments
   */
  async createA2UPayment(paymentRequest: A2UPaymentRequest): Promise<ApiResponse<PaymentDTO>> {
    try {
      if (!this.isInitialized) {
        throw new Error('A2U Payment Service not initialized');
      }

      console.log('💰 Creating A2U payment:', paymentRequest);

      const response = await this.makeApiRequest<PaymentDTO>('/payments', {
        method: 'POST',
        body: JSON.stringify(paymentRequest)
      });

      if (response.success && response.data) {
        console.log('✅ A2U payment created successfully:', response.data.identifier);
      }

      return response;
    } catch (error) {
      console.error('❌ Failed to create A2U payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get payment information
   * GET /payments/{payment_id}
   */
  async getPayment(paymentId: string): Promise<ApiResponse<PaymentDTO>> {
    try {
      if (!this.isInitialized) {
        throw new Error('A2U Payment Service not initialized');
      }

      console.log('📋 Getting payment info:', paymentId);

      const response = await this.makeApiRequest<PaymentDTO>(`/payments/${paymentId}`, {
        method: 'GET'
      });

      return response;
    } catch (error) {
      console.error('❌ Failed to get payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Approve a payment (Server-Side Approval)
   * POST /payments/{payment_id}/approve
   */
  async approvePayment(paymentId: string): Promise<ApiResponse<PaymentDTO>> {
    try {
      if (!this.isInitialized) {
        throw new Error('A2U Payment Service not initialized');
      }

      console.log('✅ Approving payment:', paymentId);

      const response = await this.makeApiRequest<PaymentDTO>(`/payments/${paymentId}/approve`, {
        method: 'POST'
      });

      if (response.success && response.data) {
        console.log('✅ Payment approved successfully');
      }

      return response;
    } catch (error) {
      console.error('❌ Failed to approve payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Complete a payment (Server-Side Completion)
   * POST /payments/{payment_id}/complete
   */
  async completePayment(paymentId: string, txid: string): Promise<ApiResponse<PaymentDTO>> {
    try {
      if (!this.isInitialized) {
        throw new Error('A2U Payment Service not initialized');
      }

      console.log('🏁 Completing payment:', paymentId, 'with txid:', txid);

      const completeRequest: CompletePaymentRequest = { txid };

      const response = await this.makeApiRequest<PaymentDTO>(`/payments/${paymentId}/complete`, {
        method: 'POST',
        body: JSON.stringify(completeRequest)
      });

      if (response.success && response.data) {
        console.log('✅ Payment completed successfully');
      }

      return response;
    } catch (error) {
      console.error('❌ Failed to complete payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Cancel a payment
   * POST /payments/{payment_id}/cancel
   */
  async cancelPayment(paymentId: string): Promise<ApiResponse<PaymentDTO>> {
    try {
      if (!this.isInitialized) {
        throw new Error('A2U Payment Service not initialized');
      }

      console.log('❌ Cancelling payment:', paymentId);

      const response = await this.makeApiRequest<PaymentDTO>(`/payments/${paymentId}/cancel`, {
        method: 'POST'
      });

      if (response.success && response.data) {
        console.log('✅ Payment cancelled successfully');
      }

      return response;
    } catch (error) {
      console.error('❌ Failed to cancel payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get incomplete server payments (A2U payments)
   * GET /payments/incomplete_server_payments
   */
  async getIncompletePayments(): Promise<ApiResponse<PaymentDTO[]>> {
    try {
      if (!this.isInitialized) {
        throw new Error('A2U Payment Service not initialized');
      }

      console.log('📋 Getting incomplete server payments...');

      const response = await this.makeApiRequest<IncompletePaymentsResponse>('/payments/incomplete_server_payments', {
        method: 'GET'
      });

      if (response.success && response.data) {
        console.log(`📋 Found ${response.data.incomplete_server_payments.length} incomplete payments`);
        return {
          success: true,
          data: response.data.incomplete_server_payments
        };
      }

      return {
        success: false,
        error: 'Failed to get incomplete payments'
      };
    } catch (error) {
      console.error('❌ Failed to get incomplete payments:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Cancel all incomplete server payments via backend
   * POST /api/payments/incomplete/cancel-all
   */
  async cancelAllIncompletePayments(): Promise<any> {
    try {
      console.log('🔄 Cancelling all incomplete payments via backend...');

      const response = await fetch('/api/payments/incomplete/cancel-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to cancel incomplete payments: ${errorText}`);
        return {
          success: false,
          error: `Failed to cancel payments: ${errorText}`
        };
      }

      const data = await response.json();
      console.log('✅ Incomplete payments cancellation result:', data);
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('❌ Error cancelling incomplete payments:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify rewarded ad status
   * GET /ads_network/status/:adId
   */
  async verifyRewardedAdStatus(adId: string): Promise<ApiResponse<RewardedAdStatusDTO>> {
    try {
      if (!this.isInitialized) {
        throw new Error('A2U Payment Service not initialized');
      }

      console.log('🔍 Verifying rewarded ad status:', adId);

      const response = await this.makeApiRequest<RewardedAdStatusDTO>(`/ads_network/status/${adId}`, {
        method: 'GET'
      });

      if (response.success && response.data) {
        console.log('✅ Ad status verified:', response.data.mediator_ack_status);
      }

      return response;
    } catch (error) {
      console.error('❌ Failed to verify ad status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify user access token using /me endpoint
   * GET /me
   */
  async verifyUserToken(accessToken: string): Promise<ApiResponse<UserDTO>> {
    try {
      console.log('🔍 Verifying user access token...');

      const response = await this.makeApiRequest<UserDTO>('/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.success && response.data) {
        console.log('✅ User token verified successfully');
      }

      return response;
    } catch (error) {
      console.error('❌ Failed to verify user token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Make authenticated API request to Pi Platform API
   */
  private async makeApiRequest<T>(
    endpoint: string, 
    options: {
      method: string;
      body?: string;
      headers?: Record<string, string>;
    }
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.config.apiBaseUrl}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Key ${this.config.serverApiKey}`,
        ...options.headers
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method: options.method,
        headers,
        body: options.body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status}:`, errorText);
        
        return {
          success: false,
          error: `API Error ${response.status}: ${errorText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data as T
      };

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout'
          };
        }
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: false,
        error: 'Unknown error occurred'
      };
    }
  }

  /**
   * Get service status
   */
  getStatus(): { isInitialized: boolean; config: PiA2UPaymentConfig } {
    return {
      isInitialized: this.isInitialized,
      config: this.config
    };
  }

  /**
   * Check if service is ready for A2U payments
   */
  isReady(): boolean {
    return this.isInitialized && !!this.config.serverApiKey;
  }
}

// Export singleton instance
export const piA2UPaymentService = new PiA2UPaymentService();

// Export convenience functions
export const initializePiA2UPaymentService = () => piA2UPaymentService.initialize();
export const createA2UPayment = (paymentRequest: A2UPaymentRequest) => 
  piA2UPaymentService.createA2UPayment(paymentRequest);
export const getPayment = (paymentId: string) => 
  piA2UPaymentService.getPayment(paymentId);
export const approvePayment = (paymentId: string) => 
  piA2UPaymentService.approvePayment(paymentId);
export const completePayment = (paymentId: string, txid: string) => 
  piA2UPaymentService.completePayment(paymentId, txid);
export const cancelPayment = (paymentId: string) => 
  piA2UPaymentService.cancelPayment(paymentId);
export const getIncompletePayments = () => 
  piA2UPaymentService.getIncompletePayments();
export const cancelAllIncompletePayments = () => 
  piA2UPaymentService.cancelAllIncompletePayments();
export const verifyRewardedAdStatus = (adId: string) => 
  piA2UPaymentService.verifyRewardedAdStatus(adId);
export const verifyUserToken = (accessToken: string) => 
  piA2UPaymentService.verifyUserToken(accessToken);
export const getA2UPaymentStatus = () => piA2UPaymentService.getStatus();
export const isA2UPaymentReady = () => piA2UPaymentService.isReady(); 