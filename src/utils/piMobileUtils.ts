// Mobile Pi Browser Utilities

// Enhanced Pi Browser detection (copied from piSDK to avoid circular imports)
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
                           hostname.includes('flappypi2807.pinet.com');
  
  // Check if Pi SDK is available in window object (most reliable indicator)
  const hasPiSDK = typeof window !== 'undefined' && window.Pi;
  
  // Enhanced Pi Browser detection - prioritize SDK availability
  const isPiBrowser = isPiBrowserApp || isPiNetworkDomain || hasPiSDK;
  
  // Mobile detection
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Enhanced mobile Pi Browser detection
  const isPiMobile = isPiBrowser && isMobile && (isPiBrowserApp || hasPiSDK);
  
  return {
    isPiBrowser,
    isMobile,
    isPiMobile,
    userAgent: userAgent.substring(0, 100),
    hasPiSDK
  };
};

// Mobile-specific Pi Browser detection
export const isMobilePiBrowser = () => {
  const detection = detectPiBrowser();
  return detection.isPiMobile;
};

// Mobile-specific Pi Browser features
export const mobilePiFeatures = {
  // Check if device supports touch gestures
  supportsTouchGestures: () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Check if device supports haptic feedback
  supportsHapticFeedback: () => {
    if (typeof window === 'undefined') return false;
    return 'vibrate' in navigator;
  },

  // Trigger haptic feedback (if supported)
  triggerHapticFeedback: (pattern: number | number[] = 50) => {
    if (typeof window === 'undefined') return;
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  },

  // Get mobile device info
  getDeviceInfo: () => {
    if (typeof window === 'undefined') return null;
    
    const userAgent = navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    return {
      isAndroid,
      isIOS,
      isMobile,
      userAgent: userAgent.substring(0, 100),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    };
  },

  // Mobile-optimized viewport settings
  setMobileViewport: () => {
    if (typeof window === 'undefined') return;
    
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }
  },

  // Prevent zoom on double tap (mobile optimization)
  preventDoubleTapZoom: () => {
    if (typeof window === 'undefined') return;
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  },

  // Mobile-optimized scroll behavior
  enableSmoothScrolling: () => {
    if (typeof window === 'undefined') return;
    
    document.documentElement.style.scrollBehavior = 'smooth';
  },

  // Mobile-specific CSS classes
  addMobileClasses: () => {
    if (typeof window === 'undefined') return;
    
    const detection = detectPiBrowser();
    const deviceInfo = mobilePiFeatures.getDeviceInfo();
    
    if (detection.isPiMobile) {
      document.body.classList.add('pi-mobile');
    }
    
    if (deviceInfo?.isAndroid) {
      document.body.classList.add('android');
    }
    
    if (deviceInfo?.isIOS) {
      document.body.classList.add('ios');
    }
  }
};

// Mobile Pi Browser event handlers
export const mobilePiEventHandlers = {
  // Handle mobile-specific touch events
  handleTouchEvents: () => {
    if (typeof window === 'undefined') return;
    
    // Prevent default touch behaviors that might interfere with Pi Browser
    document.addEventListener('touchstart', (e) => {
      // Allow touch events but prevent unwanted behaviors
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
      // Prevent overscroll on mobile
      if (e.target.closest('.game-container')) {
        e.preventDefault();
      }
    }, { passive: false });
  },

  // Handle mobile-specific orientation changes
  handleOrientationChange: () => {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('orientationchange', () => {
      // Trigger haptic feedback on orientation change
      mobilePiFeatures.triggerHapticFeedback(25);
      
      // Recalculate mobile classes
      setTimeout(() => {
        mobilePiFeatures.addMobileClasses();
      }, 100);
    });
  },

  // Handle mobile-specific resize events
  handleResize: () => {
    if (typeof window === 'undefined') return;
    
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        mobilePiFeatures.addMobileClasses();
      }, 250);
    });
  }
};

// Mobile Pi Browser initialization
export const initializeMobilePiBrowser = () => {
  if (typeof window === 'undefined') return;
  
  const detection = detectPiBrowser();
  
  if (detection.isPiMobile) {
    console.log('📱 Initializing mobile Pi Browser features...');
    
    // Set mobile viewport
    mobilePiFeatures.setMobileViewport();
    
    // Prevent double tap zoom
    mobilePiFeatures.preventDoubleTapZoom();
    
    // Enable smooth scrolling
    mobilePiFeatures.enableSmoothScrolling();
    
    // Add mobile CSS classes
    mobilePiFeatures.addMobileClasses();
    
    // Set up event handlers
    mobilePiEventHandlers.handleTouchEvents();
    mobilePiEventHandlers.handleOrientationChange();
    mobilePiEventHandlers.handleResize();
    
    console.log('✅ Mobile Pi Browser features initialized');
  }
};

// Mobile-specific Pi Browser CSS
export const mobilePiCSS = `
  .pi-mobile {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    touch-action: manipulation;
  }
  
  .pi-mobile .game-container {
    touch-action: none;
    overscroll-behavior: none;
  }
  
  .pi-mobile .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
  
  .pi-mobile .mobile-optimized {
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .android .android-specific {
    /* Android-specific styles */
  }
  
  .ios .ios-specific {
    /* iOS-specific styles */
  }
`;

// Auto-initialize mobile features
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMobilePiBrowser);
  } else {
    initializeMobilePiBrowser();
  }
} 