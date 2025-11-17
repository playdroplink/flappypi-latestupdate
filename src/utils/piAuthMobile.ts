// Enhanced Pi Authentication for Pi Browser Mobile
// Optimized for mobile Pi Browser with proper error handling and retry logic

declare global {
  interface Window {
    Pi: any;
  }
}

import { PI_CONFIG, DEMO_PI_CONFIG } from '@/config/piConfig';

export interface PiAuthResult {
  success: boolean;
  user?: {
    uid: string;
    username: string;
    accessToken: string;
  };
  error?: string;
  retryCount?: number;
}

export interface PiAuthConfig {
  scopes?: string[];
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  enablePayments?: boolean;
  enableAds?: boolean;
}

export class PiAuthMobile {
  private static instance: PiAuthMobile;
  private isInitialized = false;
  private currentUser: any = null;
  private authInProgress = false;
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000;
  private timeout = 30000;

  private constructor() {}

  public static getInstance(): PiAuthMobile {
    if (!PiAuthMobile.instance) {
      PiAuthMobile.instance = new PiAuthMobile();
    }
    return PiAuthMobile.instance;
  }

  /**
   * Initialize Pi SDK for mobile
   */
  async initialize(config: PiAuthConfig = {}): Promise<boolean> {
    try {
      console.log('🚀 Initializing Pi Auth for mobile mainnet...');

      // Check if we're in Pi Browser
      if (!this.isPiBrowser()) {
        console.log('⚠️ Not in Pi Browser - auth will be limited');
        return false;
      }

      // Load Pi SDK if not already loaded
      if (!window.Pi) {
        await this.loadPiSDK();
      }

      // Initialize Pi SDK with enhanced mobile detection
      if (window.Pi && typeof window.Pi.init === 'function') {
        try {
          // Enhanced mobile and Pi Browser detection
          const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const isPiBrowser = this.isPiBrowser();
          const isPiSubdomain = window.location.hostname.includes('.pinet.com') || 
                               window.location.hostname.includes('.minepi.com');
          
          console.log('📱 Enhanced mobile detection:', { 
            isMobile, 
            isPiBrowser, 
            isPiSubdomain,
            userAgent: navigator.userAgent.substring(0, 100),
            hostname: window.location.hostname
          });
          
          // Initialize with mainnet configuration
          const initConfig = {
            version: '2.0',
            sandbox: false, // Use mainnet mode
            appId: DEMO_PI_CONFIG.PI_NETWORK_APP_ID,
            apiKey: DEMO_PI_CONFIG.PI_NETWORK_API_KEY,
            validationKey: DEMO_PI_CONFIG.PI_NETWORK_VALIDATION_KEY, // Add validation key for mainnet
            // Enhanced mobile-specific options
            ...(isMobile && {
              enablePayments: true,
              enableAds: true,
              enableNativeFeatures: true
            }),
            // Enhanced Pi Browser detection
            ...(isPiBrowser && {
              enablePiBrowserFeatures: true,
              enableCrossDeviceSync: true
            })
          };

          console.log('🔧 Initializing Pi SDK with mainnet config:', {
            sandbox: initConfig.sandbox,
            appId: initConfig.appId,
            validationKey: initConfig.validationKey?.substring(0, 10) + '...',
            networkMode: initConfig.sandbox ? 'testnet' : 'mainnet'
          });

          await window.Pi.init(initConfig);
          this.isInitialized = true;
          console.log('✅ Pi SDK initialized successfully for mobile mainnet');
          return true;
        } catch (initError) {
          console.error('❌ Failed to initialize Pi SDK for mobile:', initError);
          throw initError;
        }
      } else {
        console.warn('⚠️ Pi SDK not available for mobile initialization');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Pi Auth for mobile:', error);
      return false;
    }
  }

  /**
   * Authenticate user with Pi Network - Enhanced for mobile
   */
  async authenticate(config: PiAuthConfig = {}): Promise<PiAuthResult> {
    try {
      console.log('🔐 Starting Pi authentication for mobile...');

      // Check if already authenticated
      if (this.isAuthenticated()) {
        console.log('✅ Already authenticated');
        return {
          success: true,
          user: this.currentUser
        };
      }

      // Prevent multiple auth attempts
      if (this.authInProgress) {
        console.log('⏳ Authentication already in progress...');
        return { success: false, error: 'Authentication already in progress' };
      }

      this.authInProgress = true;
      this.retryCount = 0;

      // Initialize if not already done
      if (!this.isInitialized) {
        const initialized = await this.initialize(config);
        if (!initialized) {
          this.authInProgress = false;
          return { success: false, error: 'Failed to initialize Pi SDK' };
        }
      }

      // Enhanced mobile detection
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isPiBrowser = this.isPiBrowser();
      const isPiSubdomain = window.location.hostname.includes('.pinet.com') || 
                           window.location.hostname.includes('.minepi.com');
      
      console.log('📱 Mobile authentication context:', { 
        isMobile, 
        isPiBrowser, 
        isPiSubdomain,
        hostname: window.location.hostname 
      });

      // Enhanced scopes for mobile Pi Browser
      let scopes = config.scopes || ['payments'];
      
      // Add mobile-specific scopes
      if (isMobile && isPiBrowser) {
        scopes = ['payments', 'username', 'wallet_address'];
        console.log('📱 Using enhanced mobile scopes:', scopes);
      }
      
      // Remove any invalid scopes
      scopes = scopes.filter(scope => ['username', 'payments', 'wallet_address'].includes(scope));
      
      if (config.enablePayments) {
        if (!scopes.includes('payments')) {
          scopes.push('payments');
        }
      }
      if (config.enableAds) {
        if (!scopes.includes('ads')) {
          scopes.push('ads');
        }
      }
      
      // Ensure we only use valid Pi Network scopes
      const validScopes = scopes.filter(scope => 
        ['payments', 'username', 'wallet_address', 'ads'].includes(scope)
      );
      
      if (validScopes.length === 0) {
        validScopes.push('payments'); // Default to payments scope
      }

      console.log('📋 Requesting scopes for mobile:', validScopes);

      // Enhanced timeout for mobile
      const timeout = isMobile ? (config.timeout || 45000) : (config.timeout || this.timeout);

      // Perform authentication with enhanced mobile support
      const authResult = await this.performAuthWithTimeout(validScopes, timeout);

      if (authResult.success && authResult.user) {
        this.currentUser = authResult.user;
        this.authInProgress = false;
        
        // Store access token globally for other services
        (window as any).piAccessToken = authResult.user.accessToken;
        
        console.log('✅ Pi authentication successful for mobile:', authResult.user.username);
        return authResult;
      } else {
        this.authInProgress = false;
        return authResult;
      }

    } catch (error) {
      console.error('❌ Pi mobile authentication failed:', error);
      this.authInProgress = false;
      return { success: false, error: error.message };
    }
  }

  /**
   * Perform authentication with timeout and retry logic
   */
  private async performAuthWithTimeout(scopes: string[], timeout: number): Promise<PiAuthResult> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve({ success: false, error: 'Authentication timeout' });
      }, timeout);

      this.performAuthWithRetry(scopes)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          resolve({ success: false, error: error.message });
        });
    });
  }

  /**
   * Perform authentication with retry logic
   */
  private async performAuthWithRetry(scopes: string[]): Promise<PiAuthResult> {
    while (this.retryCount < this.maxRetries) {
      try {
        console.log(`🔄 Authentication attempt ${this.retryCount + 1}/${this.maxRetries}`);

        const result = await this.performSingleAuth(scopes);
        
        if (result.success) {
          return result;
        }

        // If not successful, retry after delay
        this.retryCount++;
        if (this.retryCount < this.maxRetries) {
          console.log(`⏳ Retrying in ${this.retryDelay}ms...`);
          await this.delay(this.retryDelay);
          this.retryDelay *= 2; // Exponential backoff
        }
      } catch (error) {
        console.error(`❌ Auth attempt ${this.retryCount + 1} failed:`, error);
        this.retryCount++;
        
        if (this.retryCount >= this.maxRetries) {
          return { success: false, error: error.message, retryCount: this.retryCount };
        }
        
        await this.delay(this.retryDelay);
        this.retryDelay *= 2;
      }
    }

    return { success: false, error: 'Max retries exceeded', retryCount: this.retryCount };
  }

  /**
   * Perform single authentication attempt with mobile optimization
   */
  private async performSingleAuth(scopes: string[]): Promise<PiAuthResult> {
    return new Promise((resolve, reject) => {
      if (!window.Pi || typeof window.Pi.authenticate !== 'function') {
        reject(new Error('Pi SDK not available'));
        return;
      }

      // Handle incomplete payments
      const onIncompletePaymentFound = (payment: any) => {
        console.log('💰 Incomplete payment found:', payment);
        // You can handle incomplete payments here
      };

      // Add mobile-specific debugging
      console.log('📱 Starting authentication in mobile environment...');
      console.log('🔧 Available Pi SDK methods:', Object.keys(window.Pi));
      console.log('📋 Requesting scopes:', scopes);
      console.log('📱 Mobile device:', /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      console.log('🌐 User Agent:', navigator.userAgent);

      // Perform authentication with better error handling
      try {
        // For mobile Pi Browser, add a small delay to ensure SDK is ready
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isPiBrowser = this.isPiBrowser();
        
        const authenticateWithDelay = () => {
          window.Pi.authenticate(scopes, onIncompletePaymentFound)
            .then((auth: any) => {
              console.log('✅ Authentication successful:', auth);
              
              // Validate auth response
              if (!auth || !auth.user) {
                reject(new Error('Invalid authentication response'));
                return;
              }
              
              resolve({
                success: true,
                user: {
                  uid: auth.user.uid,
                  username: auth.user.username,
                  accessToken: auth.accessToken
                }
              });
            })
            .catch((error: any) => {
              console.error('❌ Authentication failed:', error);
              
              // Provide more specific error messages for mobile
              let errorMessage = error.message || 'Authentication failed';
              
              if (errorMessage.includes('network')) {
                errorMessage = 'Network error. Please check your connection.';
              } else if (errorMessage.includes('timeout')) {
                errorMessage = 'Authentication timeout. Please try again.';
              } else if (errorMessage.includes('user')) {
                errorMessage = 'Please make sure you are logged into Pi Browser.';
              } else if (errorMessage.includes('scope')) {
                errorMessage = 'Invalid permissions. Please try again.';
              } else if (errorMessage.includes('not authenticated')) {
                errorMessage = 'Please log in to Pi Browser first.';
              }
              
              reject(new Error(errorMessage));
            });
        };
        
        // Add small delay for mobile Pi Browser to ensure SDK is ready
        if (isMobile && isPiBrowser) {
          setTimeout(authenticateWithDelay, 500);
        } else {
          authenticateWithDelay();
        }
      } catch (error) {
        console.error('❌ Authentication setup failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Verify user with Pi Network API
   */
  async verifyUser(accessToken: string): Promise<boolean> {
    try {
      console.log('🔍 Verifying user with Pi Network...');
      
      const response = await fetch('https://api.minepi.com/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User verified:', userData.username);
        return true;
      } else {
        console.error('❌ User verification failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ User verification error:', error);
      return false;
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): any {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentUser.accessToken;
  }

  /**
   * Enhanced Pi Browser detection for mobile
   */
  isPiBrowser(): boolean {
    if (typeof window === 'undefined') return false;
    
    const ua = navigator.userAgent.toLowerCase();
    
    // Method 1: Check for Pi SDK object (most reliable)
    const hasPiObject = typeof window.Pi !== 'undefined';
    
    // Method 2: Check user agent for Pi Browser indicators
    const hasPiUserAgent = ua.includes('pi browser') || 
                          ua.includes('pibrowser') || 
                          ua.includes('pi-browser') ||
                          ua.includes('minepi') ||
                          ua.includes('pinet') ||
                          ua.includes('pi/');
    
    // Method 3: Check for Pi-specific features
    const hasPiFeatures = typeof window.Pi?.authenticate === 'function' ||
                         typeof window.Pi?.currentUser === 'function' ||
                         typeof window.Pi?.createPayment === 'function';
    
    // Method 4: Check for mobile Pi Browser specific indicators
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasMobilePiIndicators = isMobile && (hasPiObject || hasPiUserAgent);
    
    // Method 5: Check for Pi-specific storage/cookies
    let hasPiStorage = false;
    try {
      hasPiStorage = !!(localStorage.getItem('pi_authentication') || 
                       sessionStorage.getItem('pi_session') ||
                       localStorage.getItem('pi_wallet') ||
                       document.cookie.includes('pi_auth') ||
                       document.cookie.includes('pi_session'));
    } catch (e) {
      // Storage blocked, ignore
    }
    
    const isPiBrowser = hasPiObject || hasPiUserAgent || hasPiFeatures || hasMobilePiIndicators || hasPiStorage;
    
    console.log('🔍 Pi Browser Detection:', {
      hasPiObject,
      hasPiUserAgent,
      hasPiFeatures,
      hasMobilePiIndicators,
      hasPiStorage,
      isMobile,
      userAgent: ua,
      isPiBrowser
    });
    
    return isPiBrowser;
  }

  /**
   * Check if Pi SDK is available
   */
  isPiSDKAvailable(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.Pi !== 'undefined' && 
           typeof window.Pi.authenticate === 'function';
  }

  /**
   * Load Pi SDK dynamically with mobile support
   */
  private async loadPiSDK(): Promise<boolean> {
    try {
      console.log('📦 Loading Pi SDK for mobile...');
      
      // Check if Pi SDK is already available
      if (window.Pi) {
        console.log('✅ Pi SDK already available');
        return true;
      }
      
      // For mobile Pi Browser, the SDK should already be injected
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isPiBrowser = this.isPiBrowser();
      
      if (isMobile && isPiBrowser) {
        console.log('📱 Mobile Pi Browser detected - waiting for SDK injection...');
        
        // Wait for SDK to be injected (up to 2 seconds)
        for (let i = 0; i < 20; i++) {
          if (window.Pi) {
            console.log('✅ Pi SDK found after waiting');
            return true;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Try to load Pi SDK from CDN as fallback
      const sdkUrl = 'https://sdk.minepi.com/pi-sdk.js';
      
      return new Promise((resolve) => {
        // Check if script already exists
        const existingScript = document.querySelector(`script[src="${sdkUrl}"]`);
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(true));
          existingScript.addEventListener('error', () => resolve(false));
          return;
        }

        // Create and load script
        const script = document.createElement('script');
        script.src = sdkUrl;
        script.async = true;
        script.onload = () => {
          console.log('✅ Pi SDK loaded from CDN');
          resolve(true);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Pi SDK from CDN');
          resolve(false);
        };
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('❌ Error loading Pi SDK:', error);
      return false;
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear authentication state
   */
  clearAuth(): void {
    this.currentUser = null;
    this.authInProgress = false;
    this.retryCount = 0;
    this.retryDelay = 1000;
    delete (window as any).piAccessToken;
  }

  /**
   * Get authentication status
   */
  getAuthStatus(): {
    isPiBrowser: boolean;
    isSDKAvailable: boolean;
    isInitialized: boolean;
    isAuthenticated: boolean;
    authInProgress: boolean;
    retryCount: number;
  } {
    return {
      isPiBrowser: this.isPiBrowser(),
      isSDKAvailable: this.isPiSDKAvailable(),
      isInitialized: this.isInitialized,
      isAuthenticated: this.isAuthenticated(),
      authInProgress: this.authInProgress,
      retryCount: this.retryCount
    };
  }
}

// Export singleton instance
export const piAuthMobile = PiAuthMobile.getInstance();

// Export convenience functions
export const authenticateWithPi = (config?: PiAuthConfig) => 
  piAuthMobile.authenticate(config);

export const verifyPiUser = (accessToken: string) => 
  piAuthMobile.verifyUser(accessToken);

export const getPiAuthStatus = () => 
  piAuthMobile.getAuthStatus();

export const isPiBrowser = () => 
  piAuthMobile.isPiBrowser();

export const isPiSDKAvailable = () => 
  piAuthMobile.isPiSDKAvailable(); 