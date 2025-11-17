import { piAdsService, showRewardedAd as piShowRewardedAd, showInterstitialAd as piShowInterstitialAd } from './piAdsService';
import { piPlatformApi, RewardedAdStatusDTO } from './piPlatformApi';
import { piBrowserRedirect } from '@/utils/piBrowserRedirect';
import { gameBackendService } from './gameBackendService';
import EnhancedMusicController from '../hooks/useEnhancedMusic';
import { 
  addRevive, 
  addExtraLife, 
  addRouletteSpin 
} from '@/utils/rewardUtils';
import { saveWalletBalance, loadWalletBalance } from '@/utils/walletUtils';

export interface AdRewardResult {
  success: boolean;
  reward_amount: number;
  description: string;
  shown?: boolean;
  reason?: string;
  reward_type?: 'revive' | 'coins' | 'extra_life' | 'roulette_spin';
  game_mode?: string;
}

export interface AdStatus {
  isReady: boolean;
  isSupported: boolean;
  error?: string;
}

// Reward configuration based on game mode and ad type
const REWARD_CONFIG = {
  revive: {
    classic: { reward_amount: 1, reward_type: 'revive' },
    endless: { reward_amount: 1, reward_type: 'revive' },
    challenge: { reward_amount: 1, reward_type: 'revive' },
    scream_pi: { reward_amount: 1, reward_type: 'revive' },
    wallet: { reward_amount: 1, reward_type: 'revive' }
  },
  coins: {
    classic: { reward_amount: 25, reward_type: 'coins' },
    endless: { reward_amount: 30, reward_type: 'coins' },
    challenge: { reward_amount: 35, reward_type: 'coins' },
    scream_pi: { reward_amount: 20, reward_type: 'coins' },
    wallet: { reward_amount: 10, reward_type: 'coins' }
  },
  extra_life: {
    classic: { reward_amount: 1, reward_type: 'extra_life' },
    endless: { reward_amount: 1, reward_type: 'extra_life' },
    challenge: { reward_amount: 1, reward_type: 'extra_life' },
    scream_pi: { reward_amount: 1, reward_type: 'extra_life' },
    wallet: { reward_amount: 1, reward_type: 'extra_life' }
  },
  roulette_spin: {
    classic: { reward_amount: 1, reward_type: 'roulette_spin' },
    endless: { reward_amount: 1, reward_type: 'roulette_spin' },
    challenge: { reward_amount: 1, reward_type: 'roulette_spin' },
    scream_pi: { reward_amount: 1, reward_type: 'roulette_spin' },
    wallet: { reward_amount: 1, reward_type: 'roulette_spin' }
  }
};

class AdService {
  private isWatchingAd = false;
  private musicController = EnhancedMusicController.getInstance();

  /**
   * Show rewarded ad with specific reward type and game mode
   */
  async showRewardedAdForReward(
    rewardType: 'revive' | 'coins' | 'extra_life' | 'roulette_spin',
    gameMode: string = 'classic'
  ): Promise<AdRewardResult> {
    // Check if already watching an ad
    if (this.isWatchingAd) {
      return {
        success: false,
        reward_amount: 0,
        description: 'Already watching an ad'
      };
    }

    // Check Pi Browser
    if (!piBrowserRedirect.isInPiBrowser()) {
      piBrowserRedirect.showPiBrowserMessage();
      return {
        success: false,
        reward_amount: 0,
        description: 'Pi Browser required to watch ads'
      };
    }

    // Check ad network support
    const isAdNetworkSupported = await this.checkAdNetworkSupport();
    if (!isAdNetworkSupported) {
      return {
        success: false,
        reward_amount: 0,
        description: 'Ads not supported on this device. Please update Pi Browser to the latest version.'
      };
    }

    this.isWatchingAd = true;
    // Pause music for ad using enhanced controller
    await this.musicController.pauseForAd();

    try {
      console.log(`🎥 Showing rewarded ad for ${rewardType} in ${gameMode} mode...`);

      // Get reward configuration
      const rewardConfig = REWARD_CONFIG[rewardType]?.[gameMode] || REWARD_CONFIG[rewardType]?.classic;
      if (!rewardConfig) {
        throw new Error(`Invalid reward type: ${rewardType}`);
      }

      // Show the ad
      const adResult = await this.showRewardedAdInternal();
      
      if (adResult.success && adResult.rewarded) {
        console.log('✅ Ad completed successfully, granting reward...');
        
        // Grant the reward locally first (immediate feedback)
        const localRewardResult = await this.grantLocalReward(rewardType, rewardConfig, gameMode);
        
        // Also try to record with backend (but don't fail if it doesn't work)
        try {
          const savedPiUser = localStorage.getItem('flappypi-pi-user');
          if (savedPiUser) {
            const piUser = JSON.parse(savedPiUser);
            const userId = piUser.uid || piUser.id;
            
            if (userId) {
              console.log(`🎁 Recording reward with backend: ${rewardConfig.reward_amount} ${rewardConfig.reward_type}`);
              
              // Map reward types to backend service calls
              let backendResult;
              switch (rewardType) {
                case 'revive':
                  backendResult = await gameBackendService.watchAdReward(userId, 'continue', 0);
                  break;
                case 'coins':
                  backendResult = await gameBackendService.watchAdReward(userId, 'coins', rewardConfig.reward_amount);
                  break;
                case 'extra_life':
                  backendResult = await gameBackendService.watchAdReward(userId, 'life', 0);
                  break;
                case 'roulette_spin':
                  backendResult = await gameBackendService.watchAdReward(userId, 'coins', rewardConfig.reward_amount);
                  break;
                default:
                  backendResult = await gameBackendService.watchAdReward(userId, 'continue', 0);
              }
              
              if (backendResult) {
                console.log('✅ Backend reward recorded successfully');
              }
            }
          }
        } catch (backendError) {
          console.warn('⚠️ Backend reward recording failed, but local reward granted:', backendError);
        }

        return {
          success: true,
          reward_amount: rewardConfig.reward_amount,
          description: localRewardResult.description,
          shown: true,
          reward_type: rewardConfig.reward_type,
          game_mode: gameMode
        };
      } else {
        console.log('❌ Ad failed or was not rewarded');
        return {
          success: false,
          reward_amount: 0,
          description: adResult.error || 'Ad failed to complete'
        };
      }
    } catch (error) {
      console.error('❌ Error showing rewarded ad:', error);
      return {
        success: false,
        reward_amount: 0,
        description: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      this.isWatchingAd = false;
      // Resume music after ad using enhanced controller
      await this.musicController.resumeAfterAd();
    }
  }

  /**
   * Grant reward locally (immediate feedback)
   */
  private async grantLocalReward(
    rewardType: string, 
    rewardConfig: any, 
    gameMode: string
  ): Promise<{ success: boolean; description: string }> {
    try {
      const savedUsername = localStorage.getItem('flappypi-username');
      if (!savedUsername) {
        return { success: false, description: 'User not authenticated' };
      }

      const username = savedUsername;

      switch (rewardType) {
        case 'revive':
          // For revive rewards from ads, the revive logic is handled by the calling component
          // This just confirms the ad was watched successfully
          console.log('🎁 Ad revive: Ad watched successfully - revive will be handled by game component');
          return {
            success: true,
            description: `Ad watched successfully! Revive granted in ${gameMode} mode!`
          };

        case 'coins':
          const currentBalance = loadWalletBalance(username);
          const newBalance = currentBalance + rewardConfig.reward_amount;
          saveWalletBalance(newBalance, username);
          return {
            success: true,
            description: `Earned ${rewardConfig.reward_amount} Flappy Coins from watching an ad in ${gameMode} mode!`
          };

        case 'extra_life':
          addExtraLife(username, rewardConfig.reward_amount);
          return {
            success: true,
            description: `Earned ${rewardConfig.reward_amount} extra life from watching an ad in ${gameMode} mode!`
          };

        case 'roulette_spin':
          addRouletteSpin(username, rewardConfig.reward_amount);
          return {
            success: true,
            description: `Earned ${rewardConfig.reward_amount} roulette spin from watching an ad in ${gameMode} mode!`
          };

        default:
          return { success: false, description: 'Unknown reward type' };
      }
    } catch (error) {
      console.error('❌ Error granting local reward:', error);
      return { success: false, description: 'Failed to grant reward' };
    }
  }

  /**
   * Show rewarded ad (basic implementation)
   */
  async showRewardedAdInternal(): Promise<{ success: boolean; rewarded: boolean; error?: string }> {
    try {
      if (!window.Pi || !window.Pi.Ads) {
        return { success: false, rewarded: false, error: 'Pi SDK not available' };
      }

      // Check if ad is ready
      const isAdReadyResponse = await window.Pi.Ads.isAdReady("rewarded");
      if (!isAdReadyResponse.ready) {
        console.log('📡 Requesting new rewarded ad...');
        const requestAdResponse = await window.Pi.Ads.requestAd("rewarded");
        
        if (requestAdResponse.result === "ADS_NOT_SUPPORTED") {
          return { success: false, rewarded: false, error: "Ads not supported on this device" };
        }
        
        if (requestAdResponse.result !== "AD_LOADED") {
          return { success: false, rewarded: false, error: "Failed to load ad" };
        }
      }

      // Show the ad
      const showAdResponse = await window.Pi.Ads.showAd("rewarded");
      console.log('🎯 Rewarded ad response:', showAdResponse.result);
      
      if (showAdResponse.result === "AD_REWARDED") {
        // Verify with Platform API for security
        if (showAdResponse.adId) {
          try {
            console.log('🔐 Verifying rewarded ad status with Platform API...');
            const adStatus = await piPlatformApi.verifyRewardedAd(showAdResponse.adId);
            
            if (adStatus.mediator_ack_status === 'granted') {
              console.log('✅ Rewarded ad verified and granted');
              return { success: true, rewarded: true };
            } else {
              console.warn('⚠️ Rewarded ad not granted by mediator');
              return { success: true, rewarded: false, error: 'Ad reward not granted by mediator' };
            }
          } catch (verificationError) {
            console.warn('⚠️ Ad verification failed, but proceeding with reward:', verificationError);
            // Continue with reward even if verification fails (for better UX)
            return { success: true, rewarded: true };
          }
        } else {
          // No adId provided, but ad was rewarded - proceed with reward
          console.log('✅ Ad rewarded (no adId for verification)');
          return { success: true, rewarded: true };
        }
      } else {
        return { success: true, rewarded: false, error: `Ad result: ${showAdResponse.result}` };
      }
    } catch (error) {
      console.error('❌ Error showing rewarded ad:', error);
      return { 
        success: false, 
        rewarded: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check if ad network is supported
   */
  private async checkAdNetworkSupport(): Promise<boolean> {
    try {
      console.log('🔍 Checking ad network support...');
      
      if (typeof window === 'undefined') {
        console.warn('⚠️ Window not available (SSR)');
        return false;
      }
      
      if (!window.Pi) {
        console.warn('⚠️ Pi SDK not available');
        return false;
      }
      
      // Try multiple methods to check for ad support
      let adNetworkSupported = false;
      
      // Method 1: Check native features list
      if (window.Pi.nativeFeaturesList) {
        try {
          const features = await window.Pi.nativeFeaturesList();
          console.log('📱 Available native features:', features);
          
          // Check for various possible ad network feature names
          adNetworkSupported = features.includes('ad_network') || 
                              features.includes('ads') || 
                              features.includes('advertising') ||
                              features.includes('rewarded_ads');
          
          console.log(`🎯 Ad network supported (native features): ${adNetworkSupported}`);
        } catch (error) {
          console.warn('⚠️ Error checking native features:', error);
        }
      }
      
      // Method 2: Check if Ads API is available
      if (!adNetworkSupported && window.Pi.Ads) {
        console.log('📱 Pi.Ads API available, assuming ad support');
        adNetworkSupported = true;
      }
      
      // Method 3: Check if we're in Pi Browser (fallback)
      if (!adNetworkSupported && window.Pi.currentUser) {
        try {
          const user = await window.Pi.currentUser();
          if (user && user.features) {
            adNetworkSupported = user.features.includes('ad_network') || 
                                user.features.includes('ads');
            console.log(`🎯 Ad network supported (user features): ${adNetworkSupported}`);
          }
        } catch (error) {
          console.warn('⚠️ Error checking user features:', error);
        }
      }
      
      console.log(`🎯 Final ad network supported: ${adNetworkSupported}`);
      
      if (!adNetworkSupported) {
        console.warn('⚠️ Ad network not supported - encourage users to update Pi Browser');
      }
      
      return adNetworkSupported;
    } catch (error) {
      console.warn('⚠️ Error checking ad network support:', error);
      return false;
    }
  }

  // Backward compatibility methods
  async showRewardedAdForRevive(gameMode: string = 'classic'): Promise<AdRewardResult> {
    return this.showRewardedAdForReward('revive', gameMode);
  }

  async showRewardedAdForCoins(gameMode: string = 'classic'): Promise<AdRewardResult> {
    return this.showRewardedAdForReward('coins', gameMode);
  }

  async showRewardedAdForExtraLife(gameMode: string = 'classic'): Promise<AdRewardResult> {
    return this.showRewardedAdForReward('extra_life', gameMode);
  }

  async showRewardedAdForRouletteSpin(gameMode: string = 'classic'): Promise<AdRewardResult> {
    return this.showRewardedAdForReward('roulette_spin', gameMode);
  }

  // Legacy methods for backward compatibility
  async showRewardedAd(): Promise<AdRewardResult> {
    return this.showRewardedAdForCoins('classic');
  }

  async showRewardedAdAdvanced(): Promise<AdRewardResult> {
    return this.showRewardedAdForCoins('classic');
  }

  async showInterstitialAd(): Promise<boolean> {
    try {
      if (!window.Pi || !window.Pi.Ads) {
        return false;
      }

      // Pause music for interstitial ad using enhanced controller
      await this.musicController.pauseForAd();

      const isAdReadyResponse = await window.Pi.Ads.isAdReady("interstitial");
      if (!isAdReadyResponse.ready) {
        const requestAdResponse = await window.Pi.Ads.requestAd("interstitial");
        if (requestAdResponse.result !== "AD_LOADED") {
          // Resume music if ad failed to load
          await this.musicController.resumeAfterAd();
          return false;
        }
      }

      const showAdResponse = await window.Pi.Ads.showAd("interstitial");
      const success = showAdResponse.result === "AD_CLOSED";
      
      // Resume music after interstitial ad using enhanced controller
      await this.musicController.resumeAfterAd();
      
      return success;
    } catch (error) {
      console.error('❌ Error showing interstitial ad:', error);
      // Ensure music is resumed on error
      await this.musicController.resumeAfterAd();
      return false;
    }
  }

  async verifyAdStatus(adId: string): Promise<RewardedAdStatusDTO> {
    return piPlatformApi.verifyRewardedAd(adId);
  }

  // Status methods for compatibility
  getStatus(): AdStatus {
    return {
      isReady: !this.isWatchingAd,
      isSupported: true,
      error: null
    };
  }

  getCooldownTime(): number {
    return 0; // No cooldown - unlimited ads
  }

  async isAdNetworkSupported(): Promise<boolean> {
    return await this.checkAdNetworkSupport();
  }

  // Quick check for cached ad network status (for performance)
  isAdNetworkSupportedCached(): boolean {
    try {
      const cached = localStorage.getItem('flappypi-ad-network-available');
      return cached === 'true';
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const adService = new AdService();
export default adService;

// Export convenience functions
export const showRewardedAdForRevive = (gameMode?: string) => adService.showRewardedAdForRevive(gameMode);
export const showRewardedAdForCoins = (gameMode?: string) => adService.showRewardedAdForCoins(gameMode);
export const showRewardedAdForExtraLife = (gameMode?: string) => adService.showRewardedAdForExtraLife(gameMode);
export const showRewardedAdForRouletteSpin = (gameMode?: string) => adService.showRewardedAdForRouletteSpin(gameMode);
export const showRewardedAd = () => adService.showRewardedAd();
export const showInterstitialAd = () => adService.showInterstitialAd();
export const getCooldownTime = () => adService.getCooldownTime();
export const isAdNetworkSupported = async () => await adService.isAdNetworkSupported();
export const isAdNetworkSupportedCached = () => adService.isAdNetworkSupportedCached();
export const getAdsStatus = () => adService.getStatus(); 