// Pi Network Testnet Mobile Payment Service
// Handles testnet payments specifically for Pi Browser mobile

import { PI_CONFIG } from '../config/piConfig';
import { PiBrowserDebug } from '../utils/piBrowserDebug';

// Type declarations for Pi SDK
interface PiSDK {
  init: (config: any) => Promise<void>;
  createPayment: (paymentData: any) => Promise<any>;
  authenticate: (scopes: string[], onIncompletePaymentFound: (payment: any) => void) => Promise<any>;
  currentUser: () => any;
  user?: any;
}

export interface TestnetPaymentData {
  amount: number;
  memo: string;
  metadata?: any;
  network?: string;
}

export interface TestnetPaymentResult {
  success: boolean;
  payment?: any;
  error?: string;
  debugInfo?: any;
}

export class PiTestnetMobilePaymentService {
  private static instance: PiTestnetMobilePaymentService;
  private isInitialized = false;
  
  static getInstance(): PiTestnetMobilePaymentService {
    if (!PiTestnetMobilePaymentService.instance) {
      PiTestnetMobilePaymentService.instance = new PiTestnetMobilePaymentService();
    }
    return PiTestnetMobilePaymentService.instance;
  }
  
  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing Pi Testnet Mobile Payment Service...');
      
      // Log debug information
      PiBrowserDebug.logEnvironmentInfo();
      
      // Check if we're in Pi Browser mobile
      const isPiBrowser = typeof window !== 'undefined' && window.Pi;
      if (!isPiBrowser) {
        console.warn('⚠️ Not in Pi Browser mobile environment');
        return false;
      }
      
      // Initialize Pi SDK
      const initialized = await this.initializePiSDK();
      
      if (initialized) {
        this.isInitialized = true;
        console.log('✅ Pi Testnet Mobile Payment Service initialized');
      } else {
        console.error('❌ Failed to initialize Pi SDK');
      }
      
      return initialized;
      
    } catch (error) {
      console.error('❌ Error initializing Pi Testnet Mobile Payment Service:', error);
      return false;
    }
  }
  
  async createPayment(paymentData: TestnetPaymentData): Promise<TestnetPaymentResult> {
    try {
      console.log('💳 Creating testnet mobile payment:', paymentData);
      
      // Check if service is initialized
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          return {
            success: false,
            error: 'Payment service not initialized',
            debugInfo: PiBrowserDebug.logEnvironmentInfo()
          };
        }
      }
      
      // Enhanced payment data for testnet mobile
      const enhancedPaymentData = {
        ...paymentData,
        network: 'testnet',
        testnet: false,
        sandbox: false,
        mobileOptimized: true,
        enableTouchEvents: true,
        enableGestureSupport: true
      };
      
      console.log('🔧 Enhanced payment data:', enhancedPaymentData);
      
      // Create payment using Pi SDK
      const payment = await this.createPiPayment(enhancedPaymentData);
      
      console.log('✅ Testnet mobile payment created successfully:', payment);
      
      return {
        success: true,
        payment,
        debugInfo: PiBrowserDebug.logEnvironmentInfo()
      };
      
    } catch (error) {
      console.error('❌ Error creating testnet mobile payment:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        debugInfo: PiBrowserDebug.logEnvironmentInfo()
      };
    }
  }
  
  async testPayment(): Promise<TestnetPaymentResult> {
    console.log('🧪 Testing testnet mobile payment...');
    
    const testPaymentData: TestnetPaymentData = {
      amount: 0.01,
      memo: 'Test payment from Flappy Pi',
      metadata: {
        game: 'Flappy Pi',
        test: true,
        timestamp: Date.now()
      },
      network: 'testnet'
    };
    
    return await this.createPayment(testPaymentData);
  }
  
  private async initializePiSDK(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && window.Pi && (window.Pi as any).init) {
        await (window.Pi as any).init({
          version: '2.0',
          sandbox: false,
          appId: PI_CONFIG.PI_NETWORK_APP_ID,
          apiKey: PI_CONFIG.PI_NETWORK_API_KEY
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize Pi SDK:', error);
      return false;
    }
  }

  private async createPiPayment(paymentData: any): Promise<any> {
    if (typeof window !== 'undefined' && window.Pi && (window.Pi as any).createPayment) {
      try {
        return await (window.Pi as any).createPayment({
          amount: paymentData.amount,
          memo: paymentData.memo,
          metadata: paymentData.metadata
        });
      } catch (error) {
        console.error('Pi payment creation failed:', error);
        throw error;
      }
    }
    throw new Error('Pi SDK not available');
  }

  getEnvironmentInfo() {
    return {
      isPiBrowser: typeof window !== 'undefined' && !!window.Pi,
      isInitialized: this.isInitialized,
      sandbox: false,
      network: 'testnet'
    };
  }
  
  isReady(): boolean {
    return this.isInitialized && typeof window !== 'undefined' && !!window.Pi;
  }
}

// Export singleton instance
export const piTestnetMobilePaymentService = PiTestnetMobilePaymentService.getInstance();
