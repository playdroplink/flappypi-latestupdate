/**
 * Pi Network Utilities - Enhanced window.Pi usage
 * Ensures window.Pi is always used or called consistently throughout the application
 */

// Enhanced Pi Network detection and initialization
export const ensurePiSDK = () => {
  if (typeof window === 'undefined') {
    console.warn('Window not available - server-side rendering');
    return false;
  }

  if (!window.Pi) {
    console.warn('Pi SDK not available - window.Pi is undefined');
    return false;
  }

  return true;
};

// Enhanced current user retrieval with fallbacks
export const getCurrentPiUser = () => {
  if (!ensurePiSDK()) {
    return null;
  }

  try {
    // Always call window.Pi.currentUser() first
    if (typeof window.Pi.currentUser === 'function') {
      const user = window.Pi.currentUser();
      console.log('🔍 piNetworkUtils - Function call result:', user);
      if (user && (user.username || user.name)) {
        console.log('✅ Retrieved user from window.Pi.currentUser():', user.username || user.name);
        return user;
      }
    }

    // Fallback to property access
    if (window.Pi.currentUser && typeof window.Pi.currentUser === 'object') {
      const user = window.Pi.currentUser;
      console.log('🔍 piNetworkUtils - Property access result:', user);
      if (user && (user.username || user.name)) {
        console.log('✅ Retrieved user from window.Pi.currentUser property:', user.username || user.name);
        return user;
      }
    }

    console.log('ℹ️ No authenticated user found in window.Pi.currentUser - this is normal for unauthenticated users');
    return null;
  } catch (error) {
    console.error('❌ Error getting current Pi user:', error);
    return null;
  }
};

// Enhanced authentication status check
export const checkPiAuthentication = () => {
  if (!ensurePiSDK()) {
    return false;
  }

  try {
    // Always call window.Pi.isAuthenticated() first
    if (typeof window.Pi.isAuthenticated === 'function') {
      const authenticated = window.Pi.isAuthenticated();
      console.log('🔐 Authentication status from window.Pi.isAuthenticated():', authenticated);
      return authenticated;
    }

    // Note: window.Pi.isAuthenticated property doesn't exist in Pi SDK
    // We need to check authentication through other means
    if (window.Pi && typeof window.Pi.currentUser === 'function') {
      try {
        const currentUser = window.Pi.currentUser();
        const isAuthenticated = currentUser && currentUser.uid;
        console.log('🔐 Authentication status from window.Pi.currentUser():', isAuthenticated);
        return isAuthenticated;
      } catch (error) {
        console.log('ℹ️ window.Pi.currentUser() not available or failed');
        return false;
      }
    }

    console.log('ℹ️ window.Pi.currentUser not available - checking localStorage');
    return false;
  } catch (error) {
    console.error('❌ Error checking Pi authentication:', error);
    return false;
  }
};

// Enhanced authentication with consistent window.Pi usage
export const authenticateWithPi = async (scopes: string[] = ['payments', 'username']) => {
  if (!ensurePiSDK()) {
    throw new Error('Pi SDK not available');
  }

  try {
    console.log('🔐 Starting Pi authentication with scopes:', scopes);
    
    // Always call window.Pi.authenticate()
    const result = await window.Pi.authenticate(scopes, (incompletePayment) => {
      console.log('💰 Incomplete payment found during authentication:', incompletePayment);
    });

    if (result && result.user) {
      console.log('✅ Pi authentication successful:', result.user.username);
      return result;
    } else {
      throw new Error('Authentication failed - no user data received');
    }
  } catch (error) {
    console.error('❌ Pi authentication failed:', error);
    throw error;
  }
};

// Enhanced payment creation with consistent window.Pi usage
export const createPiPayment = async (paymentData: any) => {
  if (!ensurePiSDK()) {
    throw new Error('Pi SDK not available');
  }

  try {
    console.log('💰 Creating Pi payment:', paymentData);
    
    // Always call window.Pi.createPayment() using callbacks; wrap in a Promise
    return await new Promise((resolve, reject) => {
      try {
        window.Pi.createPayment(paymentData, {
          onReadyForServerApproval: (paymentId: string) => {
            console.log('✅ Payment ready for server approval:', paymentId);
          },
          onReadyForServerCompletion: (paymentId: string, txid: string) => {
            console.log('✅ Payment ready for server completion:', paymentId, txid);
            resolve({ identifier: paymentId, transaction: { txid } });
          },
          onCancel: (paymentId: string) => {
            console.log('❌ Payment cancelled:', paymentId);
            resolve(null);
          },
          onError: (error: any, payment: any) => {
            console.error('❌ Payment error:', error, payment);
            reject(error);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  } catch (error) {
    console.error('❌ Pi payment creation failed:', error);
    throw error;
  }
};

// Enhanced native features check
export const getPiNativeFeatures = async () => {
  if (!ensurePiSDK()) {
    return null;
  }

  try {
    // Always call window.Pi.nativeFeaturesList()
    if (typeof window.Pi.nativeFeaturesList === 'function') {
      const features = await window.Pi.nativeFeaturesList();
      console.log('📱 Pi native features:', features);
      return features;
    }

    console.warn('⚠️ window.Pi.nativeFeaturesList not available');
    return null;
  } catch (error) {
    console.error('❌ Error getting Pi native features:', error);
    return null;
  }
};

// Enhanced Pi Browser detection
export const detectPiBrowser = () => {
  if (typeof window === 'undefined') {
    return { isPiBrowser: false, isPiMobile: false };
  }

  const isPiBrowser = !!window.Pi;
  const userAgent = navigator.userAgent.toLowerCase();
  const isPiMobile = isPiBrowser && (
    userAgent.includes('android') || 
    userAgent.includes('iphone') || 
    userAgent.includes('ipad') ||
    userAgent.includes('mobile')
  );

  console.log('🌐 Pi Browser detection:', { isPiBrowser, isPiMobile });
  return { isPiBrowser, isPiMobile };
};

// Enhanced Pi SDK initialization
export const initializePiSDK = async (config: any = { version: "2.0" }) => {
  if (!ensurePiSDK()) {
    return false;
  }

  try {
    // Always call window.Pi.init()
    if (typeof window.Pi.init === 'function') {
      await window.Pi.init(config);
      console.log('✅ Pi SDK initialized successfully');
      return true;
    }

    console.warn('⚠️ window.Pi.init not available');
    return false;
  } catch (error) {
    console.error('❌ Pi SDK initialization failed:', error);
    return false;
  }
};

// Enhanced sign out
export const signOutFromPi = () => {
  if (!ensurePiSDK()) {
    return false;
  }

  try {
    // Always call window.Pi.signOut()
    if (typeof window.Pi.signOut === 'function') {
      window.Pi.signOut();
      console.log('✅ Signed out from Pi successfully');
      return true;
    }

    console.warn('⚠️ window.Pi.signOut not available');
    return false;
  } catch (error) {
    console.error('❌ Pi sign out failed:', error);
    return false;
  }
};

// Enhanced Pi user data synchronization
export const syncPiUserData = () => {
  const user = getCurrentPiUser();
  const isAuthenticated = checkPiAuthentication();
  
  if (user && isAuthenticated) {
    // Ensure we have a username (check both username and name fields)
    const username = user.username || user.name || 'Player';
    
    // Store user data in localStorage for consistency
    localStorage.setItem('flappypi-username', username);
    localStorage.setItem('flappypi-pi-user', JSON.stringify(user));
    localStorage.setItem('flappypi-pi-auth', 'true');
    
    console.log('✅ Pi user data synchronized:', username);
    return user;
  } else {
    // Clear stored data if not authenticated
    localStorage.removeItem('flappypi-username');
    localStorage.removeItem('flappypi-pi-user');
    localStorage.removeItem('flappypi-pi-auth');
    
    console.log('ℹ️ Pi user data cleared - not authenticated');
    return null;
  }
};

// Enhanced Pi SDK health check
export const checkPiSDKHealth = () => {
  const health = {
    sdkAvailable: ensurePiSDK(),
    currentUser: getCurrentPiUser(),
    isAuthenticated: checkPiAuthentication(),
    isPiBrowser: detectPiBrowser().isPiBrowser,
    isPiMobile: detectPiBrowser().isPiMobile
  };

  console.log('🏥 Pi SDK Health Check:', health);
  return health;
};

// Auto-sync Pi user data on page load
export const autoSyncPiData = () => {
  if (typeof window !== 'undefined') {
    // Sync on page load
    syncPiUserData();
    
    // Set up periodic sync (every 30 seconds)
    setInterval(() => {
      syncPiUserData();
    }, 30000);
    
    // Sync on visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        syncPiUserData();
      }
    });
  }
};

export default {
  ensurePiSDK,
  getCurrentPiUser,
  checkPiAuthentication,
  authenticateWithPi,
  createPiPayment,
  getPiNativeFeatures,
  detectPiBrowser,
  initializePiSDK,
  signOutFromPi,
  syncPiUserData,
  checkPiSDKHealth,
  autoSyncPiData
};
