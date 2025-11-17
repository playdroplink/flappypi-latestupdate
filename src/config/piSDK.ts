import { PI_CONFIG } from './piConfig';

// Enhanced Pi SDK with mobile Pi Browser support using official SDK
let Pi: any = null;
let isInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

// Enhanced Pi Browser detection
const detectPiBrowser = () => {
  if (typeof window === 'undefined') return {
    isPiBrowser: false,
    isMobile: false,
    isPiMobile: false,
    userAgent: ''
  };
  
  const userAgent = window.navigator.userAgent;
  const hostname = window.location.hostname;
  
  // Primary Pi Browser detection - check for actual Pi Browser app
  const isPiBrowserApp = userAgent.includes('Pi Browser') || 
                        userAgent.includes('PiNetwork') ||
                        userAgent.includes('PiBrowser') ||
                        userAgent.includes('PiApp');
  
     // Secondary detection - check for Pi Network domains and Pi SDK availability
   const isPiNetworkDomain = hostname.includes('.pinet.com') ||
                            hostname.includes('.minepi.com') ||
                            hostname.includes('flappypi2807.pinet.com') ||
                            hostname.includes('minepi.com');
  
  // Check if Pi SDK is available in window object (most reliable indicator)
  const hasPiSDK = typeof window !== 'undefined' && window.Pi;
  
  // Enhanced Pi Browser detection - prioritize SDK availability
  const isPiBrowser = isPiBrowserApp || isPiNetworkDomain || hasPiSDK;
  
  // Mobile detection
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Enhanced mobile Pi Browser detection
  const isPiMobile = isPiBrowser && isMobile && (isPiBrowserApp || hasPiSDK);
  
  // Check if debug mode is enabled
  const isDebug = (typeof window !== 'undefined' && window.location.hostname === 'localhost') && 
    (localStorage.getItem('flappyPiDebug') === 'true' || localStorage.getItem('flappyDebug') === 'true');
  
  if (isDebug) {
    console.log('🔍 Pi Browser Detection Details:', {
      userAgent: userAgent.substring(0, 100),
      hostname,
      isPiBrowserApp,
      isPiNetworkDomain,
      hasPiSDK,
      isPiBrowser,
      isMobile,
      isPiMobile
    });
  }
  
  return {
    isPiBrowser,
    isMobile,
    isPiMobile,
    userAgent: userAgent.substring(0, 100),
    hasPiSDK
  };
};

// Initialize Pi SDK with enhanced mobile support
export const initializePiSDK = async (): Promise<boolean> => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = new Promise(async (resolve) => {
    try {
      const detection = detectPiBrowser();
      


      // Get Pi from window object (Official Pi SDK)
      if (typeof window !== 'undefined' && window.Pi) {
        Pi = window.Pi;
      } else {
        Pi = null;
        isInitialized = false;
        resolve(false);
        return;
      }

      if (!Pi) {
        console.warn('Pi SDK not available, skipping initialization');
        isInitialized = false;
        resolve(false);
        return;
      }

      // Get environment detection
      const env = PI_CONFIG.detectEnvironment();
      const sandboxSetting = PI_CONFIG.getSandboxSetting();
      const networkMode = PI_CONFIG.getNetworkMode();
      
      // Enhanced initialization config for mobile Pi Browser
      const initConfig = {
        version: '2.0',
        sandbox: sandboxSetting,
        appId: PI_CONFIG.PI_NETWORK_APP_ID,
        apiKey: PI_CONFIG.PI_NETWORK_API_KEY,
        validationKey: PI_CONFIG.PI_NETWORK_VALIDATION_KEY,
        network: networkMode,
        origin: window.location.origin,
        // Mobile-specific settings
        enablePayments: true,
        enableAds: true,
        enableAuthentication: true,
        enableNativeFeatures: true,
        // Enhanced mobile settings
        mobileOptimized: detection.isPiMobile,
        enableTouchEvents: detection.isPiMobile,
        enableGestureSupport: detection.isPiMobile,
        // Cross-origin settings
        allowLocalhost: true,
        corsMode: 'cors' as RequestMode,
        credentials: 'omit' as RequestCredentials
      };

      // Add mobile-specific options if in Pi Browser
      if (detection.isPiMobile) {
        Object.assign(initConfig, {
          enablePayments: true,
          enableAds: true,
          enableNativeFeatures: true,
          mobileOptimized: true,
          enableTouchEvents: true,
          enableGestureSupport: true,
          // Mobile-specific timeouts
          timeout: 30000,
          retryAttempts: 3
        });
      }

      // Initialize with timeout and retry logic
      const initializeWithRetry = async (attempts = 3): Promise<boolean> => {
        for (let attempt = 1; attempt <= attempts; attempt++) {
          try {
            console.log(`🔄 Pi SDK initialization attempt ${attempt}/${attempts}`);
            
            // Try simplest config first for better compatibility
            const simpleConfig = {
              version: '2.0',
              sandbox: sandboxSetting
            };
            
            await Pi.init(simpleConfig);
            
            console.log('✅ Pi SDK initialized successfully with simple config');
            isInitialized = true;
            
            // Dispatch SDK ready event
            window.dispatchEvent(new CustomEvent('pi-sdk-ready'));
            resolve(true);
            return true;
          } catch (error) {
            console.warn(`⚠️ Pi SDK init attempt ${attempt} failed:`, error);
            
            if (attempt === attempts) {
              console.error('❌ All Pi SDK initialization attempts failed');
              // Try even more minimal fallback
              try {
                console.log('🔄 Attempting minimal fallback Pi SDK initialization...');
                await Pi.init({ version: '2.0' });
                console.log('✅ Pi SDK minimal fallback initialization successful');
                isInitialized = true;
                window.dispatchEvent(new CustomEvent('pi-sdk-ready'));
                resolve(true);
                return true;
              } catch (fallbackError) {
                console.error('❌ Pi SDK minimal fallback initialization also failed:', fallbackError);
                isInitialized = false;
                resolve(false);
                return false;
              }
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
        return false;
      };

      await initializeWithRetry();
    } catch (error) {
      isInitialized = false;
      resolve(false);
    }
  });

  return initializationPromise;
};

// Enhanced Pi SDK status check
export const checkPiSDKStatus = () => {
  try {
    const detection = detectPiBrowser();
    const env = PI_CONFIG.detectEnvironment();
    
    return {
      available: !!Pi,
      initialized: isInitialized,
      isPiBrowser: detection.isPiBrowser,
      isPiMobile: detection.isPiMobile,
      isMobile: detection.isMobile,
      networkMode: PI_CONFIG.getNetworkMode(),
      sandboxMode: PI_CONFIG.getSandboxSetting(),
      error: Pi ? null : 'Pi SDK not loaded'
    };
  } catch (error) {
    return {
      available: false,
      initialized: false,
      error: error.message
    };
  }
};

// Enhanced Pi Browser detection
export function isPiBrowser() {
  const detection = detectPiBrowser();
  return detection.isPiBrowser;
}

// Enhanced Pi Mobile detection
export function isPiMobile() {
  const detection = detectPiBrowser();
  return detection.isPiMobile;
}

// Enhanced Pi Authentication with mobile support
export const piAuth = {
  // Authenticate user with Pi Network using official SDK
  authenticate: async (scopes: string[] = ['payments', 'username']): Promise<any> => {
    try {
      const detection = detectPiBrowser();
      
      // Check if Pi SDK is available
      if (!Pi) {
        throw new Error('Pi SDK not available. Please ensure you are in Pi Browser.');
      }
      
      console.log('🔐 Starting Pi authentication with official SDK...');
      console.log('🔐 Requesting scopes:', scopes);
      
      // Handle incomplete payments callback
      const onIncompletePaymentFound = (payment: any) => {
        console.log('💰 Found incomplete payment:', payment);
        // Handle incomplete payment if needed
        return Promise.resolve();
      };
      
      // Use official Pi SDK authenticate method
      const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
      
      if (!auth || !auth.user) {
        throw new Error('Authentication failed. Please try again.');
      }
      
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
  },

  // Get current user with enhanced mobile support
  currentUser: () => {
    if (!Pi) return null;
    try {
      const detection = detectPiBrowser();
      
      // Check if currentUser method exists
      if (typeof Pi.currentUser === 'function') {
        const user = Pi.currentUser();
        console.log('👤 Current user (mobile):', detection.isPiMobile ? 'Mobile' : 'Desktop', user);
        return user;
      } else if (Pi.currentUser) {
        const user = Pi.currentUser;
        console.log('👤 Current user (property):', detection.isPiMobile ? 'Mobile' : 'Desktop', user);
        return user;
      } else {
        console.warn('Pi.currentUser method not available');
        return null;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Check if user is authenticated with mobile support
  isAuthenticated: () => {
    if (!Pi) return false;
    try {
      const detection = detectPiBrowser();
      
      // Check if isAuthenticated method exists
      if (typeof Pi.isAuthenticated === 'function') {
        const authenticated = Pi.isAuthenticated();
        console.log('🔐 Authentication status:', detection.isPiMobile ? 'Mobile' : 'Desktop', authenticated);
        return authenticated;
      } else if (Pi.isAuthenticated !== undefined) {
        const authenticated = Pi.isAuthenticated;
        console.log('🔐 Authentication status (property):', detection.isPiMobile ? 'Mobile' : 'Desktop', authenticated);
        return authenticated;
      } else {
        console.warn('Pi.isAuthenticated method not available');
        return false;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Sign out user
  signOut: () => {
    if (!Pi) return;
    Pi.signOut();
  }
};

// Enhanced Pi Payment functions using official SDK
export const piPayment = {
  // Create a payment using official Pi SDK
  createPayment: async (amount: number, memo: string, metadata?: any) => {
    try {
      if (!Pi) {
        throw new Error('Pi SDK not available');
      }
      
      console.log('💰 Creating payment with official Pi SDK:', {
        amount,
        memo,
        metadata
      });
      
      // Use official Pi SDK createPayment method
      const payment = await Pi.createPayment({
        amount: amount,
        memo: memo,
        metadata: metadata || {}
      });
      
      console.log('✅ Payment created:', payment);
      return payment;
    } catch (error) {
      console.error('❌ Payment creation failed:', error);
      throw error;
    }
  },

  // Complete a payment using official Pi SDK
  completePayment: async (paymentId: string, txid: string) => {
    try {
      if (!Pi) {
        throw new Error('Pi SDK not available');
      }
      
      console.log('✅ Completing payment:', {
        paymentId,
        txid
      });
      
      const result = await Pi.completePayment(paymentId, txid);
      console.log('✅ Payment completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Payment completion failed:', error);
      throw error;
    }
  },

  // Get payment status using official Pi SDK
  getPaymentStatus: async (paymentId: string) => {
    try {
      if (!Pi) {
        throw new Error('Pi SDK not available');
      }
      
      console.log('📊 Getting payment status:', {
        paymentId
      });
      
      const status = await Pi.getPaymentStatus(paymentId);
      console.log('📊 Payment status:', status);
      return status;
    } catch (error) {
      console.error('❌ Failed to get payment status:', error);
      throw error;
    }
  }
};

// Enhanced incomplete payment handler using official SDK
const onIncompletePaymentFound = (payment: any) => {
  console.log('⚠️ Incomplete payment found:', payment);
  
  // Handle incomplete payment using official SDK
  if (Pi) {
    try {
      return Pi.completePayment(payment.identifier, payment.transaction.txid);
    } catch (error) {
      console.error('❌ Failed to complete incomplete payment:', error);
      return Promise.reject(error);
    }
  }
  return Promise.reject(new Error('Pi SDK not available'));
};

// Export Pi SDK instance and initialization status
export { Pi, isInitialized };

// Auto-initialize SDK when this module is imported
if (typeof window !== 'undefined') {
  initializePiSDK().then((success) => {
    console.log('🚀 Pi SDK auto-initialization:', success ? '✅ Success' : '❌ Failed');
  });
} else {
  console.warn('Pi SDK auto-initialization skipped (server-side)');
} 