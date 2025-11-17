export const isPiBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if debug mode is enabled
  const isDebug = (typeof window !== 'undefined' && window.location.hostname === 'localhost') && 
    (localStorage.getItem('flappyPiDebug') === 'true' || localStorage.getItem('flappyDebug') === 'true');
  
  // Method 1: Check for the presence of the Pi object (most reliable)
  if (typeof window.Pi !== 'undefined') {
    if (isDebug) {
      console.log('✅ Pi Browser detected via window.Pi object');
    }
    return true;
  }

  // Method 2: Check the user agent for Pi Browser-specific identifiers
  const userAgent = navigator.userAgent.toLowerCase();
  const hasPiUserAgent = userAgent.includes('pi browser') || 
                        userAgent.includes('pibrowser') || 
                        userAgent.includes('pi-browser') ||
                        userAgent.includes('minepi') ||
                        userAgent.includes('pinet') ||
                        userAgent.includes('pi/') ||
                        userAgent.includes('pinetwork');
  
  // Method 3: Check for Pi-specific features
  const hasPiFeatures = typeof window.Pi?.authenticate === 'function' ||
                       typeof window.Pi?.currentUser === 'function' ||
                       typeof window.Pi?.createPayment === 'function';
  
  // Method 4: Check for mobile Pi Browser specific indicators
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const hasMobilePiIndicators = isMobile && (typeof window.Pi !== 'undefined' || hasPiUserAgent);
  
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
  
  // Method 6: Check for Pi Network domain
  const hostname = window.location.hostname.toLowerCase();
  const isPiNetworkDomain = hostname.includes('.pinet.com') ||
                           hostname.includes('.minepi.com') ||
                           hostname.includes('flappypi2807.pinet.com');
  
  const isPiBrowser = typeof window.Pi !== 'undefined' || hasPiUserAgent || hasPiFeatures || hasMobilePiIndicators || hasPiStorage || isPiNetworkDomain;
  
  // Only log in debug mode
  if (isDebug) {
    console.log('🔍 Enhanced Browser Detection:', {
      hasPiObject: typeof window.Pi !== 'undefined',
      hasPiUserAgent,
      hasPiFeatures,
      hasMobilePiIndicators,
      hasPiStorage,
      isPiNetworkDomain,
      isMobile,
      userAgent: userAgent.substring(0, 100),
      hostname,
      isPiBrowser
    });
  }
  
  return isPiBrowser;
};

export const isMobile = (): boolean => {
  const ua = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
};