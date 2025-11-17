// Enhanced Pi Ad Network Utility for Flappy Pi Classic Mode
// Production implementation with real Pi ad network only

// let adNetworkSupported = true; // Removed, will be managed externally
import { AdRewardResult } from '@/types/gameTypes';
import { piBrowserRedirect } from './piBrowserRedirect';
import { PI_CONFIG } from '@/config/piConfig';

let isInitialized = false;

const isMainnet = PI_CONFIG.getNetworkMode() === 'mainnet'; // Use mainnet for production
import { DEMO_PI_CONFIG } from '@/config/piConfig';
const validationKey = DEMO_PI_CONFIG.PI_NETWORK_VALIDATION_KEY; // Use validation key from config

export async function checkAdNetworkSupport(): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
      console.warn('🔇 Pi SDK not available');
      return false;
    }
    if (!isInitialized) {
      // await window.Pi.init({ version: "2.0", validationKey, sandbox: !isMainnet });
      return false; // Pi SDK init disabled for now
      isInitialized = true;
      console.log('✅ Pi SDK initialized successfully with ' + (isMainnet ? 'mainnet' : 'sandbox/testnet') + ' mode');
    }
    const nativeFeaturesList = await window.Pi.nativeFeaturesList();
    const adSupported = nativeFeaturesList.includes("ad_network");
    console.log(`🎯 Pi Ad Network support: ${adSupported ? 'Available' : 'Not Available'} (${isMainnet ? 'mainnet' : 'sandbox/testnet'} mode)`);
    return adSupported;
  } catch (error) {
    console.warn('⚠️ Error checking Pi Ad Network support:', error);
    return false;
  }
}

export async function showInterstitialAd(adNetworkSupported: boolean, onRequirePiBrowser?: () => void): Promise<boolean> {
  // Check if user is in Pi browser first
  if (!piBrowserRedirect.isInPiBrowser()) {
    piBrowserRedirect.handleAdWatchAttempt({ showModal: true });
    return false;
  }

  if (!adNetworkSupported) {
    if (onRequirePiBrowser) onRequirePiBrowser();
    console.log('🔇 Ad network not supported');
    return false;
  }

  try {
    console.log('🎥 Showing interstitial ad...');
    
    // Check if ad is ready
    const isAdReadyResponse = await window.Pi.Ads.isAdReady("interstitial");
    if (!isAdReadyResponse.ready) {
      console.log('📡 Requesting new interstitial ad...');
      const requestAdResponse = await window.Pi.Ads.requestAd("interstitial");
      
      if (requestAdResponse.result === "ADS_NOT_SUPPORTED") {
        console.log('❌ Ads not supported on this device');
        return false;
      }
      
      if (requestAdResponse.result !== "AD_LOADED") {
        console.log('❌ Failed to load interstitial ad');
        return false;
      }
    }

    const showAdResponse = await window.Pi.Ads.showAd("interstitial");
    console.log('✅ Interstitial ad shown successfully:', showAdResponse.result);
    return true;
  } catch (error) {
    console.error('❌ Error showing interstitial ad:', error);
    return false;
  }
}

export async function showRewardedAd(adNetworkSupported: boolean, onRequirePiBrowser?: () => void): Promise<AdRewardResult> {
  // Check if user is in Pi browser first
  if (!piBrowserRedirect.isInPiBrowser()) {
    piBrowserRedirect.handleAdWatchAttempt({ showModal: true });
    return { success: false, reward_amount: 0, description: "Pi Browser required to watch ads." };
  }

  if (!adNetworkSupported) {
    if (onRequirePiBrowser) onRequirePiBrowser();
    console.log('🔇 Ad network not supported');
    return { success: false, reward_amount: 0, description: "Pi Ad Network not supported." };
  }

  try {
    console.log('🎥 Showing rewarded ad...');
    
    // Check if ad is ready
    const isAdReadyResponse = await window.Pi.Ads.isAdReady("rewarded");
    if (!isAdReadyResponse.ready) {
      console.log('📡 Requesting new rewarded ad...');
      const requestAdResponse = await window.Pi.Ads.requestAd("rewarded");
      
      if (requestAdResponse.result === "ADS_NOT_SUPPORTED") {
        console.log('❌ Rewarded ads not supported on this device');
        return { success: false, reward_amount: 0, description: "Rewarded ads not supported on this device." };
      }
      
      if (requestAdResponse.result !== "AD_LOADED") {
        console.log('❌ Failed to load rewarded ad');
        return { success: false, reward_amount: 0, description: "Failed to load ad." };
      }
    }

    const showAdResponse = await window.Pi.Ads.showAd("rewarded");
    console.log('🎯 Rewarded ad response:', showAdResponse.result);
    
    if (showAdResponse.result === "AD_REWARDED") {
      console.log('✅ Rewarded ad completed successfully!');
      // Assume a default reward if specific reward amount is not provided by Pi SDK
      const rewardAmount = 10; // Example reward amount
      return { success: true, reward_amount: rewardAmount, description: `You earned ${rewardAmount} Flappy Coins!` };
    } else if (showAdResponse.result === "AD_DISMISSED") {
      console.log('⏭️ Rewarded ad dismissed by user');
      return { success: false, reward_amount: 0, description: "Ad dismissed by user." };
    } else {
      console.log('❌ Rewarded ad failed with result:', showAdResponse.result);
      return { success: false, reward_amount: 0, description: `Ad failed: ${showAdResponse.result}` };
    }
  } catch (error) {
    console.error('❌ Error showing rewarded ad:', error);
    return { success: false, reward_amount: 0, description: "Error showing rewarded ad." };
  }
}

// Enhanced Pi Network integration
export async function isAdReady(type: 'interstitial' | 'rewarded', adNetworkSupported: boolean): Promise<boolean> {
  if (!adNetworkSupported) return false;
  
  try {
    const response = await window.Pi.Ads.isAdReady(type);
    return response.ready;
  } catch (error) {
    console.warn(`⚠️ Error checking if ${type} ad is ready:`, error);
    return false;
  }
}

// Request ad preloading
export async function preloadAd(type: 'interstitial' | 'rewarded', adNetworkSupported: boolean): Promise<boolean> {
  if (!adNetworkSupported) return false;
  
  try {
    console.log(`📡 Preloading ${type} ad...`);
    const response = await window.Pi.Ads.requestAd(type);
    return response.result === "AD_LOADED";
  } catch (error) {
    console.warn(`⚠️ Error preloading ${type} ad:`, error);
    return false;
  }
}

// Initialize ads for classic mode
export async function initializeAdsForGame(): Promise<void> {
  console.log('🎮 Initializing Pi Ads for Flappy Pi Classic...');
  
  const isSupported = await checkAdNetworkSupport();
  if (isSupported) {
    // Preload ads for better performance
    await Promise.all([
      preloadAd('interstitial', isSupported),
      preloadAd('rewarded', isSupported)
    ]);
    console.log('✅ Pi Ads initialized and preloaded for classic mode');
  } else {
    console.log('🚫 Pi Ads not supported in this environment.');
  }
}

// Pi Ad Network utility
export async function isPiAdNetworkSupported() {
  if (!window.Pi) return false;
  const features = await window.Pi.nativeFeaturesList();
  return features.includes("ad_network");
}

export async function showRewardedAdAndVerify(rewardCallback, notSupportedCallback, unavailableCallback) {
  if (!window.Pi) return notSupportedCallback?.();
  let isReady = await window.Pi.Ads.isAdReady("rewarded");
  if (!isReady.ready) {
    const req = await window.Pi.Ads.requestAd("rewarded");
    if (req.result === "ADS_NOT_SUPPORTED") return notSupportedCallback?.();
    if (req.result !== "AD_LOADED") return unavailableCallback?.();
  }
  const showAdResponse = await window.Pi.Ads.showAd("rewarded");
  if (showAdResponse.result === "AD_REWARDED") {
    // Call your backend to verify adId and grant reward
    const res = await fetch("/api/reward-ad", {
      method: "POST",
      body: JSON.stringify({ adId: showAdResponse.adId }),
      headers: { "Content-Type": "application/json" }
    }).then(r => r.json());
    if (res.rewarded) rewardCallback(res.reward);
    else unavailableCallback?.();
  } else {
    unavailableCallback?.();
  }
} 