// Pi SDK Wrapper with Cross-Origin Fixes
import { piConfig } from '@/config/piConfig';

interface PiSDKConfig {
  sandbox: boolean;
  allowLocalhost: boolean;
  corsMode: RequestMode;
  credentials: RequestCredentials;
}

class PiSDKWrapper {
  private static instance: PiSDKWrapper;
  private initialized = false;
  private config: PiSDKConfig;

  private constructor(config: PiSDKConfig) {
    this.config = config;
  }

  static getInstance(config?: PiSDKConfig): PiSDKWrapper {
    if (!PiSDKWrapper.instance) {
      PiSDKWrapper.instance = new PiSDKWrapper(config || piConfig);
    }
    return PiSDKWrapper.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      console.log('[PiSDKWrapper] Initializing Pi SDK...');
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.warn('[PiSDKWrapper] Not in browser environment');
        return false;
      }

      // Check if Pi SDK is available
      if (typeof window.Pi === 'undefined') {
        console.warn('[PiSDKWrapper] Pi SDK not loaded, attempting to load...');
        await this.loadPiSDK();
      }

      // Verify Pi SDK is properly loaded
      if (typeof window.Pi !== 'undefined' && window.Pi.authenticate) {
        console.log('[PiSDKWrapper] Pi SDK initialized successfully');
        this.initialized = true;
        return true;
      } else {
        console.warn('[PiSDKWrapper] Pi SDK not properly loaded');
        return false;
      }
    } catch (error) {
      console.error('[PiSDKWrapper] Initialization error:', error);
      return false;
    }
  }

  private async loadPiSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create script element to load Pi SDK
        const script = document.createElement('script');
        script.src = this.config.sandbox 
          ? 'https://sandbox.minepi.com/sdk.js'
          : 'https://sdk.minepi.com/sdk.js';
        
        script.onload = () => {
          console.log('[PiSDKWrapper] Pi SDK script loaded');
          resolve();
        };
        
        script.onerror = (error) => {
          console.error('[PiSDKWrapper] Failed to load Pi SDK script:', error);
          reject(error);
        };

        document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    });
  }

  async authenticate(scopes: string[] = ['payments', 'username']): Promise<any> {
    try {
      if (!this.initialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Pi SDK not initialized');
        }
      }

      console.log('[PiSDKWrapper] Authenticating with scopes:', scopes);
      
      return new Promise((resolve, reject) => {
        try {
          window.Pi.authenticate(scopes, this.config.sandbox)
            .then((auth: any) => {
              console.log('[PiSDKWrapper] Authentication successful:', auth);
              resolve(auth);
            })
            .catch((error: any) => {
              console.error('[PiSDKWrapper] Authentication failed:', error);
              reject(error);
            });
        } catch (error) {
          console.error('[PiSDKWrapper] Authentication error:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('[PiSDKWrapper] Authentication wrapper error:', error);
      throw error;
    }
  }

  async createPayment(paymentData: any, callbacks: any): Promise<any> {
    try {
      if (!this.initialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Pi SDK not initialized');
        }
      }

      console.log('[PiSDKWrapper] Creating payment:', paymentData);
      
      return new Promise((resolve, reject) => {
        try {
          window.Pi.createPayment(paymentData, callbacks)
            .then((payment: any) => {
              console.log('[PiSDKWrapper] Payment created successfully:', payment);
              resolve(payment);
            })
            .catch((error: any) => {
              console.error('[PiSDKWrapper] Payment creation failed:', error);
              reject(error);
            });
        } catch (error) {
          console.error('[PiSDKWrapper] Payment creation error:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('[PiSDKWrapper] Payment wrapper error:', error);
      throw error;
    }
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.Pi !== 'undefined' && 
           this.initialized;
  }

  getConfig(): PiSDKConfig {
    return this.config;
  }
}

// Export singleton instance
export const piSDK = PiSDKWrapper.getInstance();
export default PiSDKWrapper; 