// Pi Network Ads Service
// Based on official Pi Network Client SDK reference documentation
// https://developer.minepi.com/docs/sdk

import { piPlatformApi, RewardedAdStatusDTO } from './piPlatformApi';
import { PI_CONFIG } from '@/config/piConfig';

// Official Pi Network Ads Types
export type AdType = "interstitial" | "rewarded";

export type ShowAdResponse =
  | {
      type: "interstitial";
      result: "AD_CLOSED" | "AD_DISPLAY_ERROR" | "AD_NETWORK_ERROR" | "AD_NOT_AVAILABLE";
    }
  | {
      type: "rewarded";
      result: "AD_REWARDED" | "AD_CLOSED" | "AD_DISPLAY_ERROR" | "AD_NETWORK_ERROR" | "AD_NOT_AVAILABLE" | "ADS_NOT_SUPPORTED" | "USER_UNAUTHENTICATED";
      adId?: string;
    };

export type IsAdReadyResponse = {
  type: "interstitial" | "rewarded";
  ready: boolean;
};

export type RequestAdResponse = {
  type: "interstitial" | "rewarded";
  result: "AD_LOADED" | "AD_FAILED_TO_LOAD" | "AD_NOT_AVAILABLE";
};

export type NativeFeature = "inline_media" | "request_permission" | "ad_network";

// Ad reward result interface
export interface AdRewardResult {
  success: boolean;
  rewarded: boolean;
  adId?: string;
  error?: string;
  reward?: any;
}

// Ads service class
export class PiAdsService {
  private isInitialized = false;
  private adNetworkSupported = false;
  private isAuthenticated = false;

  /**
   * Initialize the ads service
   */
  async initialize(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        console.warn('⚠️ Pi SDK not available for ads');
        return false;
      }

      // Check if ad network is supported
      try {
        const nativeFeatures = await window.Pi.nativeFeaturesList();
        this.adNetworkSupported = nativeFeatures.includes('ad_network');
      } catch (featureError) {
        console.warn('⚠️ Could not check native features, assuming ad network support:', featureError);
        this.adNetworkSupported = true;
      }
      
      if (!this.adNetworkSupported) {
        console.warn('⚠️ Ad network not supported on this Pi Browser version');
        return false;
      }

      this.isInitialized = true;
      console.log('✅ Pi Ads service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Pi Ads service:', error);
      return false;
    }
  }

  /**
   * Set authentication status
   */
  setAuthenticationStatus(isAuthenticated: boolean) {
    this.isAuthenticated = isAuthenticated;
    console.log(`🔐 Pi Ads service authentication status updated: ${isAuthenticated}`);
  }

  /**
   * Check authentication status from Pi SDK
   */
  private checkAuthenticationStatus(): boolean {
    try {
      if (typeof window !== 'undefined' && window.Pi && window.Pi.currentUser) {
        const user = window.Pi.currentUser();
        return user !== null && user !== undefined;
      }
      return false;
    } catch (error) {
      console.warn('⚠️ Could not check authentication status:', error);
      return false;
    }
  }

  /**
   * Check if ad network is supported
   */
  isAdNetworkSupported(): boolean {
    return this.adNetworkSupported;
  }

  /**
   * Show interstitial ad (basic usage)
   */
  async showInterstitialAd(): Promise<ShowAdResponse> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('📺 Showing interstitial ad...');
      const response = await window.Pi.Ads.showAd('interstitial');
      console.log('📺 Interstitial ad response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to show interstitial ad:', error);
      throw error;
    }
  }

  /**
   * Show rewarded ad with security verification
   */
  async showRewardedAd(): Promise<AdRewardResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Auto-check authentication status
      if (!this.isAuthenticated) {
        this.isAuthenticated = this.checkAuthenticationStatus();
      }

      if (!this.isAuthenticated) {
        console.warn('⚠️ User must be authenticated for rewarded ads');
        return {
          success: false,
          rewarded: false,
          error: 'User not authenticated'
        };
      }

      console.log('🎯 Showing rewarded ad...');
      const response = await window.Pi.Ads.showAd('rewarded');
      console.log('🎯 Rewarded ad response:', response);

      if (response.result === 'AD_REWARDED' && response.adId) {
        // Verify the ad status with Pi Platform API for security
        console.log('🔐 Verifying rewarded ad status with Platform API...');
        const adStatus = await this.verifyRewardedAdStatus(response.adId);
        
        if (adStatus.mediator_ack_status === 'granted') {
          console.log('✅ Rewarded ad verified and granted');
          return {
            success: true,
            rewarded: true,
            adId: response.adId,
            reward: {
              verified: true,
              grantedAt: adStatus.mediator_granted_at
            }
          };
        } else {
          console.warn('⚠️ Rewarded ad not granted by mediator');
          return {
            success: true,
            rewarded: false,
            adId: response.adId,
            error: 'Ad not granted by mediator'
          };
        }
      } else {
        console.log('ℹ️ Rewarded ad not rewarded or no adId');
        return {
          success: true,
          rewarded: false,
          error: `Ad result: ${response.result}`
        };
      }
    } catch (error) {
      console.error('❌ Failed to show rewarded ad:', error);
      return {
        success: false,
        rewarded: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Advanced interstitial ad flow
   */
  async showInterstitialAdAdvanced(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('📺 Advanced interstitial ad flow...');

      // Check if ad is ready
      const isReadyResponse = await window.Pi.Ads.isAdReady('interstitial');
      console.log('📺 Interstitial ad ready:', isReadyResponse.ready);

      if (isReadyResponse.ready) {
        const showResponse = await window.Pi.Ads.showAd('interstitial');
        return showResponse.result === 'AD_CLOSED';
      }

      // Request ad if not ready
      console.log('📡 Requesting interstitial ad...');
      const requestResponse = await window.Pi.Ads.requestAd('interstitial');
      console.log('📡 Interstitial ad request result:', requestResponse.result);

      if (requestResponse.result === 'AD_LOADED') {
        const showResponse = await window.Pi.Ads.showAd('interstitial');
        return showResponse.result === 'AD_CLOSED';
      } else {
        console.warn('⚠️ Interstitial ad could not be loaded');
        return false;
      }
    } catch (error) {
      console.error('❌ Advanced interstitial ad failed:', error);
      return false;
    }
  }

  /**
   * Advanced rewarded ad flow with full security
   */
  async showRewardedAdAdvanced(): Promise<AdRewardResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Auto-check authentication status
      if (!this.isAuthenticated) {
        this.isAuthenticated = this.checkAuthenticationStatus();
      }

      if (!this.isAuthenticated) {
        console.warn('⚠️ User must be authenticated for rewarded ads');
        return {
          success: false,
          rewarded: false,
          error: 'User not authenticated'
        };
      }

      console.log('🎯 Advanced rewarded ad flow...');

      // Check if ad is ready
      const isReadyResponse = await window.Pi.Ads.isAdReady('rewarded');
      console.log('🎯 Rewarded ad ready:', isReadyResponse.ready);

      if (!isReadyResponse.ready) {
        // Request ad if not ready
        console.log('📡 Requesting rewarded ad...');
        const requestResponse = await window.Pi.Ads.requestAd('rewarded');
        console.log('📡 Rewarded ad request result:', requestResponse.result);

        if (requestResponse.result === 'ADS_NOT_SUPPORTED') {
          return {
            success: false,
            rewarded: false,
            error: 'Ads not supported - please update Pi Browser'
          };
        }

        if (requestResponse.result !== 'AD_LOADED') {
          return {
            success: false,
            rewarded: false,
            error: 'Ad temporarily unavailable - please try again later'
          };
        }
      }

      // Show the ad
      const showResponse = await window.Pi.Ads.showAd('rewarded');
      console.log('🎯 Rewarded ad show response:', showResponse);

      if (showResponse.result === 'AD_REWARDED' && showResponse.adId) {
        // Verify with Platform API for security
        console.log('🔐 Verifying rewarded ad status with Platform API...');
        const adStatus = await this.verifyRewardedAdStatus(showResponse.adId);
        
        if (adStatus.mediator_ack_status === 'granted') {
          console.log('✅ Rewarded ad verified and granted');
          return {
            success: true,
            rewarded: true,
            adId: showResponse.adId,
            reward: {
              verified: true,
              grantedAt: adStatus.mediator_granted_at,
              adId: showResponse.adId
            }
          };
        } else {
          console.warn('⚠️ Rewarded ad not granted by mediator');
          return {
            success: true,
            rewarded: false,
            adId: showResponse.adId,
            error: 'Ad not granted by mediator'
          };
        }
      } else {
        console.log('ℹ️ Rewarded ad not rewarded');
        return {
          success: true,
          rewarded: false,
          error: `Ad result: ${showResponse.result}`
        };
      }
    } catch (error) {
      console.error('❌ Advanced rewarded ad failed:', error);
      return {
        success: false,
        rewarded: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify rewarded ad status and claim reward
   * This is CRITICAL for security - never reward users without this verification
   */
  async verifyRewardedAdStatus(adId: string): Promise<RewardedAdStatusDTO> {
    try {
      console.log('🔐 Verifying rewarded ad status:', adId);
      const status = await piPlatformApi.verifyRewardedAd(adId);
      console.log('✅ Rewarded ad status verified:', status);
      return status;
    } catch (error) {
      console.error('❌ Failed to verify rewarded ad status:', error);
      // Return a default status indicating verification failure
      return {
        identifier: adId,
        mediator_ack_status: 'failed',
        mediator_granted_at: null,
        mediator_revoked_at: null,
        transaction: null,
        status: {
          created_at: null,
          updated_at: null,
          blocked: false,
          cancelled: false,
          user_cancelled: false,
          completed: false
        }
      };
    }
  }

  /**
   * Check if ad is ready
   */
  async isAdReady(adType: AdType): Promise<IsAdReadyResponse> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const response = await window.Pi.Ads.isAdReady(adType);
      console.log(`${adType} ad ready:`, response.ready);
      return response;
    } catch (error) {
      console.error(`❌ Failed to check if ${adType} ad is ready:`, error);
      throw error;
    }
  }

  /**
   * Request ad
   */
  async requestAd(adType: AdType): Promise<RequestAdResponse> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`📡 Requesting ${adType} ad...`);
      const response = await window.Pi.Ads.requestAd(adType);
      console.log(`${adType} ad request result:`, response.result);
      return response;
    } catch (error) {
      console.error(`❌ Failed to request ${adType} ad:`, error);
      throw error;
    }
  }

  /**
   * Get native features list
   */
  async getNativeFeatures(): Promise<NativeFeature[]> {
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        return [];
      }

      const features = await window.Pi.nativeFeaturesList();
      console.log('📱 Available native features:', features);
      return features;
    } catch (error) {
      console.error('❌ Failed to get native features:', error);
      return [];
    }
  }

  /**
   * Check if ads are supported
   */
  async checkAdsSupport(): Promise<boolean> {
    try {
      const features = await this.getNativeFeatures();
      const supported = features.includes('ad_network');
      console.log('📺 Ads supported:', supported);
      return supported;
    } catch (error) {
      console.error('❌ Failed to check ads support:', error);
      return false;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      adNetworkSupported: this.adNetworkSupported,
      isAuthenticated: this.isAuthenticated,
      sdkAvailable: typeof window !== 'undefined' && !!window.Pi
    };
  }
}

// Export singleton instance
export const piAdsService = new PiAdsService();

// Export convenience functions
export const showInterstitialAd = () => piAdsService.showInterstitialAd();
export const showRewardedAd = () => piAdsService.showRewardedAd();
export const showInterstitialAdAdvanced = () => piAdsService.showInterstitialAdAdvanced();
export const showRewardedAdAdvanced = () => piAdsService.showRewardedAdAdvanced();
export const isAdReady = (adType: AdType) => piAdsService.isAdReady(adType);
export const requestAd = (adType: AdType) => piAdsService.requestAd(adType);
export const verifyRewardedAdStatus = (adId: string) => piAdsService.verifyRewardedAdStatus(adId);
export const checkAdsSupport = () => piAdsService.checkAdsSupport();
export const getAdsStatus = () => piAdsService.getStatus();
export const setAdsAuthenticationStatus = (isAuthenticated: boolean) => piAdsService.setAuthenticationStatus(isAuthenticated);
