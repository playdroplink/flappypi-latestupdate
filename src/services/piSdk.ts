// Pi Network SDK Initialization Service
// Ensures Pi.init() is called once before any other Pi SDK methods

let initialized = false;

export interface PiSDKInitOptions {
  version: string;
  sandbox: boolean;
  environment?: string;
}

/**
 * Initialize Pi Network SDK
 * This function ensures Pi.init() is called only once before any other Pi SDK methods
 */
export const initPi = (options?: Partial<PiSDKInitOptions>): boolean => {
  if (initialized) {
    console.log('✅ Pi SDK already initialized');
    return true;
  }

  if (typeof window === 'undefined') {
    console.warn('⚠️ Window is not available (SSR)');
    return false;
  }

  if (!window.Pi) {
    console.warn('⚠️ Pi SDK is not available on window object');
    return false;
  }

  try {
    const initOptions: PiSDKInitOptions = {
      version: "2.0",
      sandbox: false,
      environment: "mainnet",
      ...options
    };

    console.log('🔄 Initializing Pi SDK with options:', initOptions);
    
    window.Pi.init(initOptions);
    
    initialized = true;
    console.log('✅ Pi SDK initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Pi SDK:', error);
    return false;
  }
};

/**
 * Check if Pi SDK is available
 */
export const isPiSDKAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.Pi !== 'undefined';
};

/**
 * Check if Pi SDK is initialized
 */
export const isPiSDKInitialized = (): boolean => {
  return initialized;
};

/**
 * Reset initialization flag (useful for testing or re-initialization)
 */
export const resetPiSDKInitialization = (): void => {
  initialized = false;
  console.log('🔄 Pi SDK initialization flag reset');
};

/**
 * Check if running in Pi Browser
 */
export const isPiBrowser = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const hostname = window.location.hostname;
  const userAgent = navigator.userAgent;

  return (
    hostname.includes('pinet.com') ||
    hostname.includes('minepi.com') ||
    hostname.includes('sandbox.minepi.com') ||
    userAgent.includes('Pi Browser') ||
    userAgent.includes('PiNetwork')
  );
};

/**
 * Get Pi SDK initialization status
 */
export const getPiSDKStatus = () => {
  return {
    available: isPiSDKAvailable(),
    initialized: isPiSDKInitialized(),
    isPiBrowser: isPiBrowser(),
    hasInit: typeof window !== 'undefined' && window.Pi && typeof window.Pi.init === 'function',
    hasAuthenticate: typeof window !== 'undefined' && window.Pi && typeof window.Pi.authenticate === 'function',
    hasCreatePayment: typeof window !== 'undefined' && window.Pi && typeof window.Pi.createPayment === 'function',
  };
};
