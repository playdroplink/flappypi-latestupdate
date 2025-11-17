import { useState, useEffect } from 'react';
import { EnhancedPiBrowserDetector, EnhancedBrowserInfo } from '../utils/enhancedPiBrowserDetection';
import { checkAdNetworkSupport } from '../utils/piAds';

// Simple fallback interface in case imports fail
interface SimpleBrowserInfo {
  isPiBrowser: boolean;
  isExternalBrowser: boolean;
  isMobile: boolean;
  platform: string;
  browserName: string;
  osName: string;
  detectionMethod: string;
  confidence: number;
  externalBrowserType: string;
  adNetworkSupported: boolean;
  detectionDetails: {
    hasPiSDK: boolean;
    hasPiUserAgent: boolean;
    hasPiStorage: boolean;
    hasPiCookies: boolean;
    hasPiNetworkFeatures: boolean;
    externalBrowserIndicators: string[];
  };
}

// Singleton to prevent multiple detection instances
let detectionInstance: {
  isRunning: boolean;
  result: SimpleBrowserInfo | null;
  subscribers: Set<(info: SimpleBrowserInfo) => void>;
} | null = null;

const getDetectionInstance = () => {
  if (!detectionInstance) {
    detectionInstance = {
      isRunning: false,
      result: null,
      subscribers: new Set()
    };
  }
  return detectionInstance;
};

export const usePiBrowserDetection = () => {
  const [browserInfo, setBrowserInfo] = useState<SimpleBrowserInfo>({
    isPiBrowser: false,
    isExternalBrowser: false,
    isMobile: false,
    platform: '',
    browserName: '',
    osName: '',
    detectionMethod: '',
    confidence: 0,
    externalBrowserType: 'unknown',
    adNetworkSupported: false,
    detectionDetails: {
      hasPiSDK: false,
      hasPiUserAgent: false,
      hasPiStorage: false,
      hasPiCookies: false,
      hasPiNetworkFeatures: false,
      externalBrowserIndicators: []
    }
  });

  useEffect(() => {
    const instance = getDetectionInstance();
    
    // Subscribe to detection updates
    const updateSubscriber = (info: SimpleBrowserInfo) => {
      setBrowserInfo(info);
    };
    
    instance.subscribers.add(updateSubscriber);
    
    // If detection is already running, use the current result
    if (instance.result) {
      setBrowserInfo(instance.result);
    }
    
    // If detection is not running, start it
    if (!instance.isRunning) {
      instance.isRunning = true;
      
      const isDebug = (typeof window !== 'undefined' && window.location.hostname === 'localhost') &&
        (typeof window !== 'undefined' && (localStorage.getItem('flappyPiDebug') === 'true' || localStorage.getItem('flappyDebug') === 'true'));
      
      const detectBrowser = (): SimpleBrowserInfo => {
        if (typeof window === 'undefined') {
          return {
            isPiBrowser: false,
            isExternalBrowser: false,
            isMobile: false,
            platform: 'server',
            browserName: 'unknown',
            osName: 'unknown',
            detectionMethod: 'server-side',
            confidence: 0,
            externalBrowserType: 'unknown',
            adNetworkSupported: false,
            detectionDetails: {
              hasPiSDK: false,
              hasPiUserAgent: false,
              hasPiStorage: false,
              hasPiCookies: false,
              hasPiNetworkFeatures: false,
              externalBrowserIndicators: []
            }
          };
        }

        try {
          // Use enhanced detection
          const enhancedInfo = EnhancedPiBrowserDetector.detectBrowser();
          
          if (isDebug) {
            console.log('[PiBrowserDetection] Enhanced detection result:', enhancedInfo);
          }
          
          return {
            isPiBrowser: enhancedInfo.isPiBrowser,
            isExternalBrowser: enhancedInfo.isExternalBrowser,
            isMobile: enhancedInfo.isMobile,
            platform: enhancedInfo.platform,
            browserName: enhancedInfo.browserName,
            osName: enhancedInfo.osName,
            detectionMethod: enhancedInfo.detectionMethod,
            confidence: enhancedInfo.confidence,
            externalBrowserType: enhancedInfo.externalBrowserType,
            adNetworkSupported: enhancedInfo.adNetworkSupported,
            detectionDetails: enhancedInfo.detectionDetails
          };
        } catch (error) {
          console.warn('[PiBrowserDetection] Error in enhanced detection, using fallback:', error);
          // Fallback detection
          const userAgent = navigator.userAgent.toLowerCase();
          const isPiBrowser = typeof window.Pi !== 'undefined' || userAgent.includes('pi browser');
          const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          
          return {
            isPiBrowser,
            isExternalBrowser: !isPiBrowser,
            isMobile,
            platform: isMobile ? 'mobile' : 'desktop',
            browserName: isPiBrowser ? 'Pi Browser' : 'Unknown',
            osName: 'Unknown',
            detectionMethod: 'fallback',
            confidence: isPiBrowser ? 50 : 0,
            externalBrowserType: isPiBrowser ? 'unknown' : 'unknown',
            adNetworkSupported: false,
            detectionDetails: {
              hasPiSDK: typeof window.Pi !== 'undefined',
              hasPiUserAgent: userAgent.includes('pi browser'),
              hasPiStorage: false,
              hasPiCookies: false,
              hasPiNetworkFeatures: false,
              externalBrowserIndicators: []
            }
          };
        }
      };

      // Enhanced detection with confidence-based retry logic
      let attempts = 0;
      const maxAttempts = 3; // Reduced from 8 to 3
      const interval = setInterval(async () => {
        attempts++;
        const currentDetection = detectBrowser();
        
        if (isDebug) {
          console.log(`[PiBrowserDetection] Attempt ${attempts}/${maxAttempts}:`, {
            isPiBrowser: currentDetection.isPiBrowser,
            isExternalBrowser: currentDetection.isExternalBrowser,
            confidence: currentDetection.confidence,
            browserName: currentDetection.browserName,
            externalBrowserType: currentDetection.externalBrowserType,
            detectionMethod: currentDetection.detectionMethod
          });
        }
        
        // Update all subscribers
        instance.subscribers.forEach(subscriber => subscriber(currentDetection));
        instance.result = currentDetection;

        // Stop if we have high confidence or max attempts reached
        if (currentDetection.confidence >= 80 || attempts >= maxAttempts) {
          if (isDebug) {
            console.log('[PiBrowserDetection] Detection complete:', {
              confidence: currentDetection.confidence,
              attempts: attempts,
              isPiBrowser: currentDetection.isPiBrowser,
              isExternalBrowser: currentDetection.isExternalBrowser
            });
          }

          // Check ad network support for Pi Browser
          if (currentDetection.isPiBrowser) {
            if (isDebug) {
              console.log('[PiBrowserDetection] Pi Browser detected, checking ad support...');
            }
            try {
              const isAdSupported = await checkAdNetworkSupport();
              const updatedDetection = { ...currentDetection, adNetworkSupported: isAdSupported };
              instance.subscribers.forEach(subscriber => subscriber(updatedDetection));
              instance.result = updatedDetection;
              if (isDebug) {
                console.log('[PiBrowserDetection] Ad network support:', isAdSupported);
              }
            } catch (error) {
              if (isDebug) {
                console.warn('[PiBrowserDetection] Failed to check ad support:', error);
              }
            }
          }

          clearInterval(interval);
          instance.isRunning = false;
        }
      }, 500); // Increased interval from 200ms to 500ms
    }
    
    // Cleanup subscription
    return () => {
      instance.subscribers.delete(updateSubscriber);
    };
  }, []);

  return browserInfo;
};

// Export enhanced detector for direct use
export { EnhancedPiBrowserDetector };
export type { EnhancedBrowserInfo }; 