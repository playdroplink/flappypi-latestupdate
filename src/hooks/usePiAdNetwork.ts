import { useState, useEffect, useCallback } from 'react';
import piAdNetworkService, { PiAdNetworkStatus } from '../services/piAdNetworkService';
import { AdRewardResult } from '@/types/gameTypes';

export const usePiAdNetwork = () => {
  const [status, setStatus] = useState<PiAdNetworkStatus>({
    isSupported: false,
    isInitialized: false,
    isReady: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the ad network on mount
  useEffect(() => {
    const initializeAdNetwork = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const networkStatus = await piAdNetworkService.initialize();
        setStatus(networkStatus);
        
        if (networkStatus.isSupported) {
          // Preload ads for better performance
          await piAdNetworkService.preloadAds();
        }
      } catch (error: any) {
        console.error('Failed to initialize Pi Ad Network:', error);
        setError(error.message || 'Failed to initialize ad network');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAdNetwork();
  }, []);

  // Check ad network support
  const checkSupport = useCallback(async () => {
    try {
      const isSupported = await piAdNetworkService.checkSupport();
      setStatus(prev => ({ ...prev, isSupported }));
      return isSupported;
    } catch (error: any) {
      console.error('Failed to check ad network support:', error);
      setError(error.message || 'Failed to check ad network support');
      return false;
    }
  }, []);

  // Check if ad is ready
  const isAdReady = useCallback(async (type: 'interstitial' | 'rewarded') => {
    try {
      return await piAdNetworkService.isAdReady(type);
    } catch (error: any) {
      console.error(`Failed to check if ${type} ad is ready:`, error);
      setError(error.message || `Failed to check ${type} ad readiness`);
      return false;
    }
  }, []);

  // Request/preload an ad
  const requestAd = useCallback(async (type: 'interstitial' | 'rewarded') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await piAdNetworkService.requestAd(type);
      return success;
    } catch (error: any) {
      console.error(`Failed to request ${type} ad:`, error);
      setError(error.message || `Failed to request ${type} ad`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Show interstitial ad
  const showInterstitialAd = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await piAdNetworkService.showInterstitialAd();
      return success;
    } catch (error: any) {
      console.error('Failed to show interstitial ad:', error);
      setError(error.message || 'Failed to show interstitial ad');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Show rewarded ad
  const showRewardedAd = useCallback(async (): Promise<AdRewardResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await piAdNetworkService.showRewardedAd();
      return result;
    } catch (error: any) {
      console.error('Failed to show rewarded ad:', error);
      const errorMessage = error.message || 'Failed to show rewarded ad';
      setError(errorMessage);
      return {
        success: false,
        reward_amount: 0,
        description: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Preload ads
  const preloadAds = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await piAdNetworkService.preloadAds();
    } catch (error: any) {
      console.error('Failed to preload ads:', error);
      setError(error.message || 'Failed to preload ads');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get current status
  const getStatus = useCallback(() => {
    return piAdNetworkService.getStatus();
  }, []);

  // Reset the service
  const reset = useCallback(() => {
    piAdNetworkService.reset();
    setStatus({
      isSupported: false,
      isInitialized: false,
      isReady: false,
    });
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    status,
    isLoading,
    error,
    
    // Actions
    checkSupport,
    isAdReady,
    requestAd,
    showInterstitialAd,
    showRewardedAd,
    preloadAds,
    getStatus,
    reset,
    clearError,
    
    // Convenience getters
    isSupported: status.isSupported,
    isInitialized: status.isInitialized,
    isReady: status.isReady,
  };
}; 