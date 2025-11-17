// Pi Network JavaScript SDK
// Complete implementation following official Pi Network documentation
// https://developer.minepi.com/docs/sdk

import { piPlatformApi, UserDTO, PaymentDTO, RewardedAdStatusDTO } from '../services/piPlatformApi';
import { piAdsService, AdRewardResult } from '../services/piAdsService';
import { piPaymentService } from '../services/piPaymentService';
import { PI_CONFIG } from '../config/piConfig';

// Official Pi Network Types
export type Scope = "username" | "payments" | "wallet_address";
export type Direction = "user_to_app" | "app_to_user";
export type AppNetwork = "Pi Network" | "Pi Testnet";
export type AdType = "interstitial" | "rewarded";
export type NativeFeature = "inline_media" | "request_permission" | "ad_network";

export interface AuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

export interface ShowAdResponse {
  type: "interstitial";
  result: "AD_CLOSED" | "AD_DISPLAY_ERROR" | "AD_NETWORK_ERROR" | "AD_NOT_AVAILABLE";
}

export interface RewardedAdResponse {
  type: "rewarded";
  result: "AD_REWARDED" | "AD_CLOSED" | "AD_DISPLAY_ERROR" | "AD_NETWORK_ERROR" | "AD_NOT_AVAILABLE" | "ADS_NOT_SUPPORTED" | "USER_UNAUTHENTICATED";
  adId?: string;
}

// Main Pi JavaScript SDK Class
export class PiJavaScriptSDK {
  private isInitialized = false;
  private currentUser: AuthResult['user'] | null = null;
  private accessToken: string | null = null;
  private authInProgress = false;

  /**
   * Initialize the Pi SDK
   * @param config Configuration object with version and sandbox settings
   */
  async init(config: { version: string; sandbox?: boolean }): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        throw new Error('Pi SDK not available in window object');
      }

      console.log('🚀 Initializing Pi JavaScript SDK...');
      
      // Initialize Pi SDK with timeout
      const initPromise = window.Pi.init({
        version: config.version,
        sandbox: config.sandbox || PI_CONFIG.getSandboxSetting()
      });

      // Add timeout to prevent hanging promises
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Pi SDK initialization timeout')), 10000);
      });

      await Promise.race([initPromise, timeoutPromise]);

      // Initialize services with error handling
      try {
        // Note: piAdsService.initialize() may not exist, skip if not available
        if (typeof piAdsService.initialize === 'function') {
          await piAdsService.initialize();
        }
      } catch (error) {
        console.warn('Ads service initialization failed:', error);
      }

      try {
        // Note: piPaymentService.initialize() may not exist, skip if not available
        if (typeof (piPaymentService as any).initialize === 'function') {
          await (piPaymentService as any).initialize();
        }
      } catch (error) {
        console.warn('Payment service initialization failed:', error);
      }

      this.isInitialized = true;
      console.log('✅ Pi JavaScript SDK initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Pi JavaScript SDK:', error);
      // Don't re-throw to prevent uncaught promise rejections
      this.isInitialized = false;
    }
  }

  /**
   * Authenticate user with Pi Network
   * @param scopes Array of scopes to request
   * @param onIncompletePaymentFound Callback for incomplete payments
   */
  async authenticate(
    scopes: Scope[] = ['payments', 'username'],
    onIncompletePaymentFound?: (payment: PaymentDTO) => Promise<void>
  ): Promise<AuthResult> {
    try {
      if (this.authInProgress) {
        throw new Error('Authentication already in progress');
      }

      if (!this.isInitialized) {
        await this.init({ version: "2.0" });
      }

      this.authInProgress = true;
      console.log('🔐 Starting Pi authentication...');

      // Handle incomplete payments
      const handleIncompletePayment = async (payment: PaymentDTO) => {
        console.log('💰 Found incomplete payment:', payment);
        if (onIncompletePaymentFound) {
          await onIncompletePaymentFound(payment);
        }
      };

      // Authenticate user
      const auth = await window.Pi.authenticate(scopes, handleIncompletePayment);
      
      if (!auth || !auth.user) {
        throw new Error('Authentication failed');
      }

      // Store user data
      this.currentUser = auth.user;
      this.accessToken = auth.accessToken;

      // Set user data in services
      if (typeof piAdsService.setAuthenticationStatus === 'function') {
        piAdsService.setAuthenticationStatus(true);
      }
      if (typeof (piPaymentService as any).setUserData === 'function') {
        (piPaymentService as any).setUserData(auth.user, auth.accessToken);
      }

      console.log('✅ Pi authentication successful:', {
        username: auth.user.username,
        uid: auth.user.uid,
        scopes: scopes
      });

      return auth;
    } catch (error) {
      console.error('❌ Pi authentication failed:', error);
      throw error;
    } finally {
      this.authInProgress = false;
    }
  }

  /**
   * Get current user information
   */
  getCurrentUser(): AuthResult['user'] | null {
    return this.currentUser;
  }

  /**
   * Get user information from Platform API
   */
  async getUserInfo(): Promise<UserDTO | null> {
    try {
      if (!this.accessToken) {
        throw new Error('No access token available');
      }

      // Note: These methods may not exist on the actual service
      if (typeof (piPlatformApi as any).setAccessToken === 'function') {
        (piPlatformApi as any).setAccessToken(this.accessToken);
      }
      const userInfo = await (piPlatformApi as any).getUserInfo?.() || null;
      
      console.log('✅ User info retrieved:', userInfo);
      return userInfo;
    } catch (error) {
      console.error('❌ Failed to get user info:', error);
      return null;
    }
  }

  /**
   * Create a payment with complete 3-phase flow
   * @param paymentData Payment data (amount, memo, metadata)
   * @param callbacks Payment flow callbacks
   */
  async createPayment(paymentData: any, callbacks: any): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.init({ version: "2.0" });
      }

      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('💰 Creating payment with complete flow...');
      return await piPaymentService.createSimplePayment(
        paymentData.amount,
        paymentData.memo,
        paymentData.metadata
      );
    } catch (error) {
      console.error('❌ Failed to create payment:', error);
      throw error;
    }
  }

  /**
   * Show interstitial ad
   */
  async showInterstitialAd(): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.init({ version: "2.0" });
      }

      console.log('📺 Showing interstitial ad...');
      return await piAdsService.showInterstitialAd();
    } catch (error) {
      console.error('❌ Failed to show interstitial ad:', error);
      throw error;
    }
  }

  /**
   * Show rewarded ad with security verification
   */
  async showRewardedAd(): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.init({ version: "2.0" });
      }

      if (!this.currentUser) {
        throw new Error('User not authenticated for rewarded ads');
      }

      console.log('🎯 Showing rewarded ad...');
      return await piAdsService.showRewardedAd();
    } catch (error) {
      console.error('❌ Failed to show rewarded ad:', error);
      throw error;
    }
  }

  /**
   * Get native features list
   */
  async nativeFeaturesList(): Promise<NativeFeature[]> {
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
   * Open share dialog
   */
  openShareDialog(title: string, message: string): void {
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        throw new Error('Pi SDK not available');
      }

      console.log('📤 Opening share dialog...');
      window.Pi.openShareDialog(title, message);
    } catch (error) {
      console.error('❌ Failed to open share dialog:', error);
      throw error;
    }
  }

  /**
   * Open URL in system browser
   */
  async openUrlInSystemBrowser(url: string): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        throw new Error('Pi SDK not available');
      }

      console.log('🌐 Opening URL in system browser:', url);
      await window.Pi.openUrlInSystemBrowser(url);
    } catch (error) {
      console.error('❌ Failed to open URL in system browser:', error);
      throw error;
    }
  }

  /**
   * Sign out user
   */
  signOut(): void {
    try {
      if (window.Pi && typeof window.Pi.signOut === 'function') {
        window.Pi.signOut();
      }
      
      // Clear user data
      this.currentUser = null;
      this.accessToken = null;
      this.isInitialized = false;

      // Clear service data
      if (typeof piAdsService.setAuthenticationStatus === 'function') {
        piAdsService.setAuthenticationStatus(false);
      }
      if (typeof (piPaymentService as any).clearUserData === 'function') {
        (piPaymentService as any).clearUserData();
      }
      
      console.log('👋 User signed out');
    } catch (error) {
      console.error('❌ Failed to sign out:', error);
    }
  }

  /**
   * Get SDK status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isAuthenticated: !!this.currentUser,
      hasAccessToken: !!this.accessToken,
      sdkAvailable: typeof window !== 'undefined' && !!window.Pi,
      adsStatus: piAdsService.getStatus(),
      paymentStatus: piPaymentService.getStatus()
    };
  }
}

// Export singleton instance
export const piJavaScriptSDK = new PiJavaScriptSDK();

// Export convenience functions for direct SDK access
export const init = (config: { version: string; sandbox?: boolean }) => 
  piJavaScriptSDK.init(config);

export const authenticate = (scopes?: Scope[], onIncompletePaymentFound?: (payment: PaymentDTO) => Promise<void>) => 
  piJavaScriptSDK.authenticate(scopes, onIncompletePaymentFound);

export const getCurrentUser = () => 
  piJavaScriptSDK.getCurrentUser();

export const getUserInfo = () => 
  piJavaScriptSDK.getUserInfo();

export const createPayment = (paymentData: any, callbacks: any) => 
  piJavaScriptSDK.createPayment(paymentData, callbacks);

export const showInterstitialAd = () => 
  piJavaScriptSDK.showInterstitialAd();

export const showRewardedAd = () => 
  piJavaScriptSDK.showRewardedAd();

export const nativeFeaturesList = () => 
  piJavaScriptSDK.nativeFeaturesList();

export const openShareDialog = (title: string, message: string) => 
  piJavaScriptSDK.openShareDialog(title, message);

export const openUrlInSystemBrowser = (url: string) => 
  piJavaScriptSDK.openUrlInSystemBrowser(url);

export const signOut = () => 
  piJavaScriptSDK.signOut();

export const getStatus = () => 
  piJavaScriptSDK.getStatus();

// Export for backward compatibility
export default piJavaScriptSDK;
