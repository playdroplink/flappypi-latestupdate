// Pi Authentication Service
// Handles Pi Network authentication for testnet and mobile Pi Browser

export interface PiUser {
  uid: string;
  username: string;
}

export interface PiAuthResult {
  accessToken: string;
  user: PiUser;
}

export interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: any;
  to_address: string;
  created_at: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    canceled: boolean;
    user_cancelled: boolean;
  };
  transaction: null | {
    txid: string;
    verified: boolean;
    _link: string;
  };
}

class PiAuthService {
  private static instance: PiAuthService;
  private currentUserData: PiUser | null = null;
  private accessToken: string | null = null;
  private isAuthenticatedFlag: boolean = false;

  private constructor() {}

  static getInstance(): PiAuthService {
    if (!PiAuthService.instance) {
      PiAuthService.instance = new PiAuthService();
    }
    return PiAuthService.instance;
  }

  // Check if Pi SDK is available
  isPiSDKAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.Pi;
  }

  // Check if we're in Pi Browser
  isInPiBrowser(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = window.navigator.userAgent;
    const hostname = window.location.hostname;
    
    // Check for Pi Browser app
    const isPiBrowserApp = userAgent.includes('Pi Browser') || 
                          userAgent.includes('PiNetwork') ||
                          userAgent.includes('PiBrowser') ||
                          userAgent.includes('PiApp');
    
    // Check for Pi Network domains
    const isPiNetworkDomain = hostname.includes('.pinet.com') ||
                             hostname.includes('.minepi.com') ||
                             hostname.includes('flappypi2807.pinet.com');
    
    // Check if Pi SDK is available (most reliable indicator)
    const hasPiSDK = this.isPiSDKAvailable();
    
    return isPiBrowserApp || isPiNetworkDomain || hasPiSDK;
  }

  // Initialize Pi SDK
  async initialize(): Promise<boolean> {
    try {
      if (!this.isPiSDKAvailable()) {
        console.warn('⚠️ Pi SDK not available');
        return false;
      }

      console.log('🔧 Initializing Pi SDK...');
      
      // Initialize with MAINNET configuration
      await window.Pi.init({
        version: '2.0',
        sandbox: false, // MAINNET MODE
        network: 'mainnet',
        enablePayments: true,
        enableAds: true,
        enableAuthentication: true
      });

      console.log('✅ Pi SDK initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Pi SDK initialization failed:', error);
      return false;
    }
  }

  // Authenticate user
  async authenticate(scopes: string[] = ['payments', 'username']): Promise<PiAuthResult> {
    try {
      if (!this.isPiSDKAvailable()) {
        throw new Error('Pi SDK not available. Please ensure you are in Pi Browser.');
      }

      console.log('🔐 Starting Pi authentication...');
      console.log('🔐 Requesting scopes:', scopes);

      // Handle incomplete payments callback
      const onIncompletePaymentFound = (payment: any) => {
        console.log('💰 Found incomplete payment:', payment);
        // Handle incomplete payment if needed
        return Promise.resolve();
      };

      // Use official Pi SDK authenticate method
      const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      if (!auth || !auth.user) {
        throw new Error('Authentication failed. Please try again.');
      }

      // Store authentication data
      this.currentUserData = auth.user;
      this.accessToken = auth.accessToken;
      this.isAuthenticatedFlag = true;

      console.log('✅ Pi authentication successful:', {
        username: auth.user.username,
        uid: auth.user.uid,
        accessToken: auth.accessToken ? 'Present' : 'Not present'
      });

      return auth;
    } catch (error) {
      console.error('❌ Pi authentication failed:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): PiUser | null {
    return this.currentUserData;
  }

  // Check if user is authenticated
  isUserAuthenticated(): boolean {
    return this.isAuthenticatedFlag && !!this.currentUserData;
  }

  // Sign out user
  signOut(): void {
    if (this.isPiSDKAvailable() && window.Pi.signOut) {
      window.Pi.signOut();
    }
    
    this.currentUserData = null;
    this.accessToken = null;
    this.isAuthenticatedFlag = false;
    
    console.log('👋 User signed out');
  }

  // Create a payment
  async createPayment(amount: number, memo: string, metadata: any = {}): Promise<PiPayment> {
    try {
      if (!this.isPiSDKAvailable()) {
        throw new Error('Pi SDK not available');
      }

      if (!this.isUserAuthenticated()) {
        throw new Error('User not authenticated');
      }

      console.log('💰 Creating payment:', { amount, memo, metadata });

      return new Promise((resolve, reject) => {
        window.Pi.createPayment({ amount, memo, metadata }, {
          onReadyForServerApproval: async (paymentId: string) => {
            try {
              console.log('🔐 Payment ready for server approval:', paymentId);
              
              // Call server to approve payment
              const response = await fetch('/api/pi/approve-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentId })
              });

              if (!response.ok) {
                throw new Error('Failed to approve payment on server');
              }

              const result = await response.json();
              console.log('✅ Payment approved on server:', result);
            } catch (error) {
              console.error('❌ Server approval failed:', error);
              reject(error);
            }
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            try {
              console.log('✅ Payment ready for server completion:', { paymentId, txid });
              
              // Call server to complete payment
              const response = await fetch('/api/pi/complete-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentId, txid })
              });

              if (!response.ok) {
                throw new Error('Failed to complete payment on server');
              }

              const result = await response.json();
              console.log('✅ Payment completed on server:', result);
              
              // Resolve with payment data
              resolve({
                identifier: paymentId,
                user_uid: this.currentUserData?.uid || '',
                amount,
                memo,
                metadata,
                to_address: '',
                created_at: new Date().toISOString(),
                status: {
                  developer_approved: true,
                  transaction_verified: true,
                  developer_completed: true,
                  canceled: false,
                  user_cancelled: false
                },
                transaction: {
                  txid,
                  verified: true,
                  _link: `https://minepi.com/blockchain/transactions/${txid}`
                }
              });
            } catch (error) {
              console.error('❌ Server completion failed:', error);
              reject(error);
            }
          },
          onCancel: (paymentId: string) => {
            console.log('❌ Payment cancelled:', paymentId);
            reject(new Error('Payment was cancelled by user'));
          },
          onError: (error: Error, payment?: any) => {
            console.error('❌ Payment error:', error, payment);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('❌ Payment creation failed:', error);
      throw error;
    }
  }

  // Complete a payment (for server-side completion)
  async completePayment(paymentId: string, txid: string): Promise<any> {
    try {
      console.log('✅ Completing payment:', { paymentId, txid });
      
      const response = await fetch('/api/pi/complete-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId, txid })
      });

      if (!response.ok) {
        throw new Error('Failed to complete payment');
      }

      const result = await response.json();
      console.log('✅ Payment completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Payment completion failed:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      console.log('📊 Getting payment status:', paymentId);
      
      const response = await fetch(`/api/pi/payment-status?paymentId=${paymentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get payment status');
      }

      const result = await response.json();
      console.log('📊 Payment status:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to get payment status:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const piAuth = PiAuthService.getInstance(); 