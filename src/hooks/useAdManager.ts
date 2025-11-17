import { useState, useEffect } from 'react';
import { adService } from '../services/adService';

export interface UseAdManagerReturn {
  // Ad status
  isSubscriber: boolean;
  adsEnabled: boolean;
  adNetworkSupported: boolean;
  
  // Ad functions
  showInterstitialAd: () => Promise<boolean>;
  showRewardedAd: () => Promise<any>;
}

export const useAdManager = (): UseAdManagerReturn => {
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [adNetworkSupported, setAdNetworkSupported] = useState(false);

  // Check ad network support
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const networkSupported = await adService.isAdNetworkSupported();
        setAdNetworkSupported(networkSupported);
        setAdsEnabled(networkSupported);
      } catch (error) {
        console.warn('⚠️ Error checking ad status:', error);
        setAdNetworkSupported(false);
        setAdsEnabled(false);
      }
    };

    // Check immediately
    checkStatus();

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Ad functions
  const showInterstitialAd = async (): Promise<boolean> => {
    return await adService.showInterstitialAd();
  };

  const showRewardedAd = async (): Promise<any> => {
    return await adService.showRewardedAd();
  };

  return {
    // Ad status
    isSubscriber,
    adsEnabled,
    adNetworkSupported,
    
    // Ad functions
    showInterstitialAd,
    showRewardedAd,
  };
}; 