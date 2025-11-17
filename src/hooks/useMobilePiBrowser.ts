import { useState, useEffect, useCallback } from 'react';
import { checkPiSDKStatus, isPiMobile, isPiBrowser } from '../config/piSDK';

// Mobile Pi Browser hook
export const useMobilePiBrowser = () => {
  const [state, setState] = useState({
    isPiMobile: false,
    isPiBrowser: false,
    isMobile: false,
    deviceInfo: null,
    sdkStatus: null
  });

  // Initialize mobile features
  const initializeMobileFeatures = useCallback(() => {
    const detection = {
      isPiMobile: isPiMobile(),
      isPiBrowser: isPiBrowser(),
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };

    const deviceInfo = {
      userAgent: navigator.userAgent.substring(0, 100),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    };

    const sdkStatus = checkPiSDKStatus();

    setState({
      ...detection,
      deviceInfo,
      sdkStatus
    });
  }, []);

  // Trigger haptic feedback
  const triggerHaptic = useCallback((pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Effect to initialize
  useEffect(() => {
    initializeMobileFeatures();
  }, [initializeMobileFeatures]);

  return {
    ...state,
    triggerHaptic,
    initializeMobileFeatures
  };
};

export default useMobilePiBrowser; 
 