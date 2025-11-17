// Pi Network SDK Service
// Implements all Pi Network SDK functionality according to official documentation

// Official SDK Types
export type Scope = "username" | "payments" | "wallet_address";
export type Direction = "user_to_app" | "app_to_user";
export type AppNetwork = "Pi Network" | "Pi Testnet";
export type AdType = "interstitial" | "rewarded";
export type NativeFeature = "inline_media" | "request_permission" | "ad_network";

export interface PiUser {
  uid: string;
  username?: string;
  name?: string;
}

export interface PiAuthResult {
  accessToken: string;
  user: PiUser;
}

export interface PaymentData {
  amount: number;
  memo: string;
  metadata: Object;
}

export interface PaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PaymentDTO) => void;
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
  created_at: string; // payment's creation timestamp
  network: AppNetwork; // a network of the payment

  // Status flags representing the current state of this payment
  status: {
    developer_approved: boolean; // Server-Side Approval
    transaction_verified: boolean; // blockchain transaction verified
    developer_completed: boolean; // server-Side Completion
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

// Ads Types
export type ShowAdResponse =
  | {
      type: "interstitial";
      result: "AD_CLOSED" | "AD_DISPLAY_ERROR" | "AD_NETWORK_ERROR" | "AD_NOT_AVAILABLE";
    }
  | {
      type: "rewarded";
      result: "AD_REWARDED" | "AD_CLOSED" | "AD_DISPLAY_ERROR" | "AD_NETWORK_ERROR" | "AD_NOT_AVAILABLE" | "ADS_NOT_SUPPORTED" | "USER_UNAUTHENTICATED";
      adId?: string;
    };

export interface IsAdReadyResponse {
  type: "interstitial" | "rewarded";
  ready: boolean;
}

export interface RequestAdResponse {
  type: "interstitial" | "rewarded";
  result: "AD_LOADED" | "AD_FAILED_TO_LOAD" | "AD_NOT_AVAILABLE";
}

class PiNetworkSDK {
  private isInitialized = false;

  /**
   * Initialize Pi Network SDK
   * @param config - SDK configuration
   */
  async init(config: { version: string; sandbox?: boolean }): Promise<void> {
    try {
      if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not available - please ensure you are in Pi Browser');
      }

      // Initialize Pi SDK according to official documentation
      await window.Pi.init(config);
      
      this.isInitialized = true;
      console.log('✅ Pi Network SDK initialized successfully:', config);
    } catch (error) {
      console.error('❌ Failed to initialize Pi Network SDK:', error);
      throw error;
    }
  }

  /**
   * Check if Pi SDK is available
   */
  isSDKAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.Pi !== 'undefined';
  }

  /**
   * Check if user is in Pi Browser
   */
  isInPiBrowser(): boolean {
    if (!this.isSDKAvailable()) return false;
    return window.Pi.isPiBrowser();
  }

  /**
   * Authenticate user with Pi Network
   * @param scopes - Array of scopes to request
   * @param onIncompletePaymentFound - Callback for incomplete payments
   */
  async authenticate(
    scopes: Array<Scope>, 
    onIncompletePaymentFound: (payment: PaymentDTO) => void
  ): Promise<PiAuthResult> {
    try {
      if (!this.isSDKAvailable()) {
        throw new Error('Pi SDK not available - please use Pi Browser');
      }

      // Authenticate user according to official documentation
      const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      
      console.log('🔍 piNetworkSDK - Raw auth result:', auth);
      console.log('🔍 piNetworkSDK - User object:', auth.user);
      console.log('🔍 piNetworkSDK - Username field:', auth.user.username);
      console.log('🔍 piNetworkSDK - Name field:', auth.user.name);
      
      console.log('✅ User authenticated successfully:', auth.user.username || auth.user.name);
      return auth;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  currentUser(): PiUser | null {
    if (!this.isSDKAvailable()) return null;
    const user = window.Pi.currentUser();
    console.log('🔍 piNetworkSDK currentUser - Raw user:', user);
    if (user) {
      console.log('🔍 piNetworkSDK currentUser - Username:', user.username);
      console.log('🔍 piNetworkSDK currentUser - Name:', user.name);
    }
    return user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.isSDKAvailable()) return false;
    return window.Pi.isAuthenticated();
  }

  /**
   * Create a payment (User-to-App)
   * @param paymentData - Payment data
   * @param callbacks - Payment callbacks
   */
  createPayment(paymentData: PaymentData, callbacks: PaymentCallbacks): void {
    try {
      if (!this.isSDKAvailable()) {
        throw new Error('Pi SDK not available - please use Pi Browser');
      }

      // Create payment using Pi SDK according to official documentation
      window.Pi.createPayment(paymentData, callbacks);
      
      console.log('💰 Payment created successfully:', paymentData);
    } catch (error) {
      console.error('❌ Failed to create payment:', error);
      throw error;
    }
  }

  /**
   * Get list of native features available
   */
  async nativeFeaturesList(): Promise<Array<NativeFeature>> {
    try {
      if (!this.isSDKAvailable()) {
        throw new Error('Pi SDK not available - please use Pi Browser');
      }

      return await window.Pi.nativeFeaturesList();
    } catch (error) {
      console.error('❌ Failed to get native features list:', error);
      throw error;
    }
  }

  /**
   * Open native share dialog
   * @param title - Title of the message being shared
   * @param message - Message that will be sent
   */
  openShareDialog(title: string, message: string): void {
    try {
      if (!this.isSDKAvailable()) {
        throw new Error('Pi SDK not available - please use Pi Browser');
      }

      window.Pi.openShareDialog(title, message);
    } catch (error) {
      console.error('❌ Failed to open share dialog:', error);
      throw error;
    }
  }

  /**
   * Open URL in system browser
   * @param url - URL to open
   */
  async openUrlInSystemBrowser(url: string): Promise<void> {
    try {
      if (!this.isSDKAvailable()) {
        throw new Error('Pi SDK not available - please use Pi Browser');
      }

      await window.Pi.openUrlInSystemBrowser(url);
    } catch (error) {
      console.error('❌ Failed to open URL in system browser:', error);
      throw error;
    }
  }

  /**
   * Ads Module
   */
  get Ads() {
    if (!this.isSDKAvailable()) {
      throw new Error('Pi SDK not available - please use Pi Browser');
    }

    return {
      /**
       * Show an ad
       * @param adType - Type of ad to show
       */
      async showAd(adType: AdType): Promise<ShowAdResponse> {
        try {
          return await window.Pi.Ads.showAd(adType);
        } catch (error) {
          console.error('❌ Failed to show ad:', error);
          throw error;
        }
      },

      /**
       * Check if ad is ready
       * @param adType - Type of ad to check
       */
      async isAdReady(adType: AdType): Promise<IsAdReadyResponse> {
        try {
          return await window.Pi.Ads.isAdReady(adType);
        } catch (error) {
          console.error('❌ Failed to check if ad is ready:', error);
          throw error;
        }
      },

      /**
       * Request an ad
       * @param adType - Type of ad to request
       */
      async requestAd(adType: AdType): Promise<RequestAdResponse> {
        try {
          return await window.Pi.Ads.requestAd(adType);
        } catch (error) {
          console.error('❌ Failed to request ad:', error);
          throw error;
        }
      }
    };
  }

  /**
   * Get SDK status
   */
  getStatus(): {
    isInitialized: boolean;
    isSDKAvailable: boolean;
    isInPiBrowser: boolean;
    isAuthenticated: boolean;
    currentUser: PiUser | null;
  } {
    return {
      isInitialized: this.isInitialized,
      isSDKAvailable: this.isSDKAvailable(),
      isInPiBrowser: this.isInPiBrowser(),
      isAuthenticated: this.isAuthenticated(),
      currentUser: this.currentUser()
    };
  }
}

// Export singleton instance
export const piNetworkSDK = new PiNetworkSDK();
export default piNetworkSDK;
