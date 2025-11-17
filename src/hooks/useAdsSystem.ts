import { useState, useEffect, useCallback, useRef } from 'react';
import { adService } from '@/services/adService';
import { useToast } from '@/hooks/useToast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { piBrowserRedirect } from '@/utils/piBrowserRedirect';

export interface AdsSystemState {
  isAdNetworkSupported: boolean;
  isAdReady: boolean;
  cooldownTime: number;
  isWatchingAd: boolean;
  lastAdWatched: number;
  adError: string | null;
}

export interface AdRewardResult {
  success: boolean;
  reward_amount: number;
  description: string;
  shown?: boolean;
  reason?: string;
  reward_type?: 'revive' | 'coins' | 'extra_life' | 'roulette_spin';
  game_mode?: string;
}

export const useAdsSystem = () => {
  const [state, setState] = useState<AdsSystemState>({
    isAdNetworkSupported: false,
    isAdReady: true,
    cooldownTime: 0,
    isWatchingAd: false,
    lastAdWatched: 0,
    adError: null
  });

  const [gameCount, setGameCount] = useState(0);
  const [shouldShowMandatoryAd, setShouldShowMandatoryAd] = useState(false);
  
  const { toast } = useToast();
  const { profile, hasActiveSubscription } = useUserProfile();
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize ads system
  useEffect(() => {
    initializeAdsSystem();
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  // Update cooldown timer
  useEffect(() => {
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }

    if (state.cooldownTime > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          cooldownTime: Math.max(0, prev.cooldownTime - 1)
        }));
      }, 1000);
    }

    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, [state.cooldownTime]);

  const initializeAdsSystem = async () => {
    try {
      console.log('🎬 Initializing ads system...');
      
      // Check if Pi SDK is available
      if (typeof window === 'undefined' || !window.Pi) {
        console.log('🔇 Pi SDK not available');
        setState(prev => ({ 
          ...prev, 
          isAdNetworkSupported: false,
          adError: 'Pi SDK not available'
        }));
        return;
      }

      // Check if user is in Pi Browser
      if (!piBrowserRedirect.isInPiBrowser()) {
        console.log('🔇 Not in Pi Browser');
        setState(prev => ({ 
          ...prev, 
          isAdNetworkSupported: false,
          adError: 'Pi Browser required'
        }));
        return;
      }

      // Check ad network support
      const isSupported = await adService.isAdNetworkSupported();
      console.log('📺 Ad network supported:', isSupported);
      
      setState(prev => ({ 
        ...prev, 
        isAdNetworkSupported: isSupported,
        adError: isSupported ? null : 'Ads not supported on this device'
      }));
    } catch (error) {
      console.error('❌ Error initializing ads system:', error);
      setState(prev => ({ 
        ...prev, 
        isAdNetworkSupported: false,
        adError: 'Failed to initialize ads system'
      }));
    }
  };

  const showRewardedAdForRevive = useCallback(async (gameMode: string = 'classic'): Promise<AdRewardResult> => {
    if (state.isWatchingAd) {
      return { success: false, reward_amount: 0, description: 'Already watching an ad' };
    }

    if (!state.isAdNetworkSupported) {
      return { success: false, reward_amount: 0, description: 'Ads not supported on this device' };
    }

    setState(prev => ({ ...prev, isWatchingAd: true, adError: null }));

    try {
      console.log(`🎥 Showing rewarded ad for revive in ${gameMode} mode...`);
      
      // Use the new ad service method with game mode
      const result = await adService.showRewardedAdForReward('revive', gameMode);
      
      setState(prev => ({
        ...prev,
        isWatchingAd: false,
        lastAdWatched: Date.now()
      }));

      if (result.success) {
        toast({
          title: "🎉 Revive Earned!",
          description: `You've been revived in ${gameMode} mode! Keep flying high!`,
        });
      } else {
        setState(prev => ({ ...prev, adError: result.description }));
        toast({
          title: "Ad Failed",
          description: result.description,
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Error showing rewarded ad:', error);
      setState(prev => ({ 
        ...prev, 
        isWatchingAd: false, 
        adError: 'Failed to show ad' 
      }));
      toast({
        title: "Ad Error",
        description: "Failed to show ad. Please try again.",
        variant: "destructive",
      });
      return { success: false, reward_amount: 0, description: 'Failed to show ad' };
    }
  }, [state.isWatchingAd, state.isAdNetworkSupported, toast]);

  const showRewardedAdForCoins = useCallback(async (gameMode: string = 'classic'): Promise<AdRewardResult> => {
    if (state.isWatchingAd) {
      return { success: false, reward_amount: 0, description: 'Already watching an ad' };
    }

    if (!state.isAdNetworkSupported) {
      return { success: false, reward_amount: 0, description: 'Ads not supported on this device' };
    }

    setState(prev => ({ ...prev, isWatchingAd: true, adError: null }));

    try {
      console.log(`🎥 Showing rewarded ad for coins in ${gameMode} mode...`);
      
      // Use the new ad service method with game mode
      const result = await adService.showRewardedAdForReward('coins', gameMode);
      
      setState(prev => ({
        ...prev,
        isWatchingAd: false,
        lastAdWatched: Date.now()
      }));

      if (result.success) {
        toast({
          title: "🎉 Coins Earned!",
          description: `You've earned ${result.reward_amount} coins in ${gameMode} mode! Keep flying to convert them to Pi!`,
        });
      } else {
        setState(prev => ({ ...prev, adError: result.description }));
        toast({
          title: "Ad Failed",
          description: result.description,
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Error showing rewarded ad:', error);
      setState(prev => ({ 
        ...prev, 
        isWatchingAd: false, 
        adError: 'Failed to show ad' 
      }));
      toast({
        title: "Ad Error",
        description: "Failed to show ad. Please try again.",
        variant: "destructive",
      });
      return { success: false, reward_amount: 0, description: 'Failed to show ad' };
    }
  }, [state.isWatchingAd, state.isAdNetworkSupported, toast]);

  const showRewardedAdForExtraLife = useCallback(async (gameMode: string = 'classic'): Promise<AdRewardResult> => {
    if (state.isWatchingAd) {
      return { success: false, reward_amount: 0, description: 'Already watching an ad' };
    }

    if (!state.isAdNetworkSupported) {
      return { success: false, reward_amount: 0, description: 'Ads not supported on this device' };
    }

    setState(prev => ({ ...prev, isWatchingAd: true, adError: null }));

    try {
      console.log(`🎥 Showing rewarded ad for extra life in ${gameMode} mode...`);
      
      // Use the new ad service method with game mode
      const result = await adService.showRewardedAdForReward('extra_life', gameMode);
      
      setState(prev => ({
        ...prev,
        isWatchingAd: false,
        lastAdWatched: Date.now()
      }));

      if (result.success) {
        toast({
          title: "❤️ Extra Life Earned!",
          description: `You've earned an extra life in ${gameMode} mode! Keep flying high!`,
        });
      } else {
        setState(prev => ({ ...prev, adError: result.description }));
        toast({
          title: "Ad Failed",
          description: result.description,
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Error showing rewarded ad:', error);
      setState(prev => ({ 
        ...prev, 
        isWatchingAd: false, 
        adError: 'Failed to show ad' 
      }));
      toast({
        title: "Ad Error",
        description: "Failed to show ad. Please try again.",
        variant: "destructive",
      });
      return { success: false, reward_amount: 0, description: 'Failed to show ad' };
    }
  }, [state.isWatchingAd, state.isAdNetworkSupported, toast]);

  const showRewardedAdForRouletteSpin = useCallback(async (gameMode: string = 'classic'): Promise<AdRewardResult> => {
    if (state.isWatchingAd) {
      return { success: false, reward_amount: 0, description: 'Already watching an ad' };
    }

    if (!state.isAdNetworkSupported) {
      return { success: false, reward_amount: 0, description: 'Ads not supported on this device' };
    }

    setState(prev => ({ ...prev, isWatchingAd: true, adError: null }));

    try {
      console.log(`🎥 Showing rewarded ad for roulette spin in ${gameMode} mode...`);
      
      // Use the new ad service method with game mode
      const result = await adService.showRewardedAdForReward('roulette_spin', gameMode);
      
      setState(prev => ({
        ...prev,
        isWatchingAd: false,
        lastAdWatched: Date.now()
      }));

      if (result.success) {
        toast({
          title: "🎰 Roulette Spin Earned!",
          description: `You've earned a roulette spin in ${gameMode} mode! Spin to win!`,
        });
      } else {
        setState(prev => ({ ...prev, adError: result.description }));
        toast({
          title: "Ad Failed",
          description: result.description,
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Error showing rewarded ad:', error);
      setState(prev => ({ 
        ...prev, 
        isWatchingAd: false, 
        adError: 'Failed to show ad' 
      }));
      toast({
        title: "Ad Error",
        description: "Failed to show ad. Please try again.",
        variant: "destructive",
      });
      return { success: false, reward_amount: 0, description: 'Failed to show ad' };
    }
  }, [state.isWatchingAd, state.isAdNetworkSupported, toast]);

  const showInterstitialAd = useCallback(async (): Promise<boolean> => {
    if (state.isWatchingAd) {
      return false;
    }

    if (!state.isAdNetworkSupported) {
      return false;
    }

    setState(prev => ({ ...prev, isWatchingAd: true }));

    try {
      console.log('🎥 Showing interstitial ad...');
      const result = await adService.showInterstitialAd();
      
      setState(prev => ({ ...prev, isWatchingAd: false }));
      return result;
    } catch (error) {
      console.error('❌ Error showing interstitial ad:', error);
      setState(prev => ({ ...prev, isWatchingAd: false }));
      return false;
    }
  }, [state.isWatchingAd, state.isAdNetworkSupported]);

  // Mandatory ad system (every 2 games)
  const incrementGameCount = useCallback(() => {
    const newCount = gameCount + 1;
    setGameCount(newCount);
    
    // Show mandatory ad every 2 games (unless user has subscription)
    if (newCount % 2 === 0 && !hasActiveSubscription) {
      setShouldShowMandatoryAd(true);
    }
  }, [gameCount, hasActiveSubscription]);

  const handleMandatoryAd = useCallback(async (): Promise<boolean> => {
    if (hasActiveSubscription) {
      // Skip ad for subscribers
      setShouldShowMandatoryAd(false);
      return true;
    }

    const result = await adService.showInterstitialAd();
    setShouldShowMandatoryAd(false);
    return result;
  }, [hasActiveSubscription]);

  const skipMandatoryAd = useCallback(() => {
    setShouldShowMandatoryAd(false);
  }, []);

  // Check if ad is ready
  const checkAdReady = useCallback(async (adType: 'interstitial' | 'rewarded'): Promise<boolean> => {
    try {
      // For now, assume ads are always ready since we removed the isAdReady method
      setState(prev => ({ ...prev, isAdReady: true }));
      return true;
    } catch (error) {
      console.error('❌ Error checking ad ready status:', error);
      return false;
    }
  }, []);

  // Request ad
  const requestAd = useCallback(async (adType: 'interstitial' | 'rewarded'): Promise<boolean> => {
    try {
      // For now, assume ads can always be requested since we removed the requestAd method
      return true;
    } catch (error) {
      console.error('❌ Error requesting ad:', error);
      return false;
    }
  }, []);

  const resetCooldown = useCallback(() => {
    // No cooldown system - unlimited ads
    console.log('🔄 Cooldown reset (no cooldown system)');
  }, []);

  const getAdsStatus = useCallback(() => {
    return adService.getStatus();
  }, []);

  return {
    // State
    isAdNetworkSupported: state.isAdNetworkSupported,
    isAdReady: state.isAdReady,
    cooldownTime: state.cooldownTime,
    isWatchingAd: state.isWatchingAd,
    adError: state.adError,
    
    // Mandatory ad system
    gameCount,
    shouldShowMandatoryAd,
    incrementGameCount,
    handleMandatoryAd,
    skipMandatoryAd,
    
    // Ad methods
    showRewardedAdForRevive,
    showRewardedAdForCoins,
    showRewardedAdForExtraLife,
    showRewardedAdForRouletteSpin,
    showInterstitialAd,
    checkAdReady,
    requestAd,
    
    // Utility methods
    resetCooldown,
    getAdsStatus,
    initializeAdsSystem
  };
};
