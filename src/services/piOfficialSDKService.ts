// Official Pi SDK Integration Service
// Based on https://github.com/pi-apps/pi-sdk-integration-guide.git

import { PI_CONFIG, DEMO_PI_CONFIG } from '../config/piConfig';

export interface PiPaymentData {
  amount: number;
  memo: string;
  metadata?: any;
  uid?: string;
}

export interface PiPaymentResult {
  success: boolean;
  payment?: any;
  error?: string;
  txid?: string;
}

export class PiOfficialSDKService {
  private static instance: PiOfficialSDKService;
  private isInitialized = false;
  
  // Official Pi API configuration
  private readonly PI_API_KEY = DEMO_PI_CONFIG.PI_NETWORK_API_KEY;
  private readonly PI_APP_ID = DEMO_PI_CONFIG.PI_NETWORK_APP_ID;
  private readonly API_BASE_URL = 'https://api.minepi.com'; // Mainnet API
  private readonly NETWORK_PASSPHRASE = 'Pi Network'; // Mainnet passphrase
  
  static getInstance(): PiOfficialSDKService {
    if (!PiOfficialSDKService.instance) {
      PiOfficialSDKService.instance = new PiOfficialSDKService();
    }
    return PiOfficialSDKService.instance;
  }
  
  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing Official Pi SDK Service...');
      
      // Check if we're in Pi Browser
      if (!this.isPiBrowser()) {
        console.warn('⚠️ Not in Pi Browser environment');
        return false;
      }
      
      // Check if Pi SDK is available
      if (!window.Pi) {
        console.warn('⚠️ Pi SDK not available');
        return false;
      }
      
      // Initialize Pi SDK with official configuration
      const config = {
        version: '2.0',
        sandbox: false, // Mainnet mode
        appId: this.PI_APP_ID,
        apiKey: this.PI_API_KEY,
        validationKey: DEMO_PI_CONFIG.PI_NETWORK_VALIDATION_KEY,
        network: 'mainnet',
        // Official Pi SDK settings
        enablePayments: true,
        enableAds: true,
        enableMetadata: true
      };
      
      console.log('🔧 Initializing with official config:', config);
      
      await window.Pi.init(config);
      
      this.isInitialized = true;
      console.log('✅ Official Pi SDK Service initialized');
      
      return true;
      
    } catch (error) {
      console.error('❌ Error initializing Official Pi SDK Service:', error);
      return false;
    }
  }
  
  async createPayment(paymentData: PiPaymentData): Promise<PiPaymentResult> {
    try {
      console.log('💳 Creating payment with official Pi SDK:', paymentData);
      
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          return {
            success: false,
            error: 'Pi SDK not initialized'
          };
        }
      }

      return await new Promise<PiPaymentResult>((resolve) => {
        try {
          window.Pi.createPayment({
            amount: paymentData.amount,
            memo: paymentData.memo,
            metadata: paymentData.metadata || {},
          }, {
            onReadyForServerApproval: (paymentId: string) => {
              console.log('🔄 Ready for server approval:', paymentId);
              return true;
            },
            onReadyForServerCompletion: (paymentId: string, txid: string) => {
              console.log('✅ Payment completed:', paymentId, txid);
              resolve({ success: true, payment: { identifier: paymentId, transaction: { txid } }, txid });
            },
            onCancel: (paymentId: string) => {
              console.log('❌ Payment cancelled:', paymentId);
              resolve({ success: false, error: 'Payment cancelled by user' });
            },
            onError: (error: any) => {
              console.error('❌ Error creating payment:', error);
              resolve({ success: false, error: error?.message || 'Payment error' });
            }
          } as any);
        } catch (err: any) {
          resolve({ success: false, error: err?.message || 'Failed to start payment' });
        }
      });
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async approvePayment(paymentId: string): Promise<PiPaymentResult> {
    try {
      console.log('✅ Approving payment:', paymentId);
      
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'Pi SDK not initialized'
        };
      }
      
      // This method incorrectly uses createPayment for approval - this is not a standard Pi SDK pattern
      // Payment approval is server-side via Pi API; consider removing or refactoring
      console.warn('⚠️ approvePayment uses non-standard SDK call; typically handled via backend');
      
      return {
        success: false,
        error: 'Approval should be handled server-side, not via createPayment'
      };
      
    } catch (error) {
      console.error('❌ Error approving payment:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async cancelPayment(paymentId: string): Promise<PiPaymentResult> {
    try {
      console.log('❌ Cancelling payment:', paymentId);
      
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'Pi SDK not initialized'
        };
      }
      
      // Cancel payment using official Pi SDK
      const result = await window.Pi.cancelPayment(paymentId);
      
      console.log('✅ Payment cancelled successfully:', result);
      
      return {
        success: true,
        payment: result
      };
      
    } catch (error) {
      console.error('❌ Error cancelling payment:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Check if we're in Pi Browser environment
  private isPiBrowser(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = window.navigator.userAgent;
    const hostname = window.location.hostname;
    
    // Official Pi Browser detection
    const isPiBrowserApp = userAgent.includes('Pi Browser') || 
                          userAgent.includes('PiNetwork') ||
                          userAgent.includes('PiBrowser') ||
                          userAgent.includes('PiApp');
    
    const isPiNetworkDomain = hostname.includes('.pinet.com') ||
                            hostname.includes('.minepi.com') ||
                            hostname.includes('testnet.minepi.com') ||
                            hostname.includes('flappypi2807.pinet.com');
    
    const hasPiSDK = typeof window !== 'undefined' && window.Pi;
    
    return isPiBrowserApp || isPiNetworkDomain || hasPiSDK;
  }
  
  // Get environment information for debugging
  getEnvironmentInfo() {
    if (typeof window === 'undefined') {
      return {
        isPiBrowser: false,
        hasPiSDK: false,
        isInitialized: false,
        userAgent: '',
        hostname: ''
      };
    }
    
    const userAgent = window.navigator.userAgent;
    const hostname = window.location.hostname;
    const isPiBrowser = this.isPiBrowser();
    const hasPiSDK = typeof window !== 'undefined' && window.Pi;
    
    return {
      isPiBrowser,
      hasPiSDK,
      isInitialized: this.isInitialized,
      userAgent: userAgent.substring(0, 100),
      hostname,
      networkMode: 'testnet',
      sandboxMode: false,
      mainnetMode: false
    };
  }
  
  isReady(): boolean {
    return this.isInitialized && this.isPiBrowser();
  }
}

// Export singleton instance
export const piOfficialSDKService = PiOfficialSDKService.getInstance();
