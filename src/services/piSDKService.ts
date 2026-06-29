// Unified Pi SDK Service
// Complete integration following official Pi Network documentation: https://github.com/pi-apps/pi-platform-docs.git

import { piAuthService } from './piAuthService';
import { piPaymentService } from './piPaymentService';
import { piAdNetworkService } from './piAdNetworkService';
import { initPi, isPiSDKAvailable, isPiBrowser } from './piSdk';

export interface PiSDKConfig {
  version: string;
  sandbox: boolean;
  appId: string;
  apiKey: string;
  validationKey: string;
}

export interface PiSDKStatus {
  initialized: boolean;
  authenticated: boolean;
  isPiBrowser: boolean;
  network: 'mainnet' | 'testnet';
  user?: {
    uid: string;
    username: string;
  };
}

export class PiSDKService {
  private static instance: PiSDKService;
  private config: PiSDKConfig;
  private status: PiSDKStatus;

  public static getInstance(): PiSDKService {
    if (!PiSDKService.instance) {
      PiSDKService.instance = new PiSDKService();
    }
    return PiSDKService.instance;
  }

  constructor() {
    this.config = {
      version: "2.0",
      sandbox: false, // Mainnet mode
      appId: "flappypi2807",
      apiKey: "htjotdxpfamsvnshw5yspxjtp9psgvqym5fusybgu4ouuiqobtrcupilytu3pg4w",
      validationKey: "94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce"
    };

    this.status = {
      initialized: false,
      authenticated: false,
      isPiBrowser: false,
      network: 'testnet'
    };
  }

  /**
   * Initialize complete Pi SDK integration
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing complete Pi SDK integration...');

      // Check if running in Pi Browser
      this.status.isPiBrowser = isPiBrowser();
      
      if (!this.status.isPiBrowser) {
        console.warn('⚠️ Not running in Pi Browser. Some features may not work.');
      }

      // Initialize Pi SDK using the centralized initPi function
      const sdkInitialized = initPi({
        version: this.config.version,
        sandbox: this.config.sandbox
      });
      
      if (!sdkInitialized) {
        throw new Error('Failed to initialize Pi SDK');
      }

      // Initialize payment service
      await piPaymentService.initialize();
      console.log('✅ Payment service initialized');

      // Initialize ad network service
      const adNetworkInitialized = await piAdNetworkService.initialize();
      if (!adNetworkInitialized) {
        console.warn('⚠️ Ad network service not available');
      }

      this.status.initialized = true;
      this.status.network = this.config.sandbox ? 'testnet' : 'mainnet';

      console.log('✅ Complete Pi SDK integration initialized');
      console.log('📊 SDK Status:', this.status);
      console.log('🔧 SDK Config:', this.config);

      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Pi SDK integration:', error);
      return false;
    }
  }

  /**
   * Authenticate user with Pi Network
   */
  async authenticate(scopes: string[] = ['payments', 'username']): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      if (!this.status.initialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Pi SDK not initialized');
        }
      }

      console.log('🔐 Authenticating user with Pi Network...');

      const authResult = await piAuthService.authenticateUser();
      
      this.status.authenticated = true;
      this.status.user = {
        uid: authResult.uid,
        username: authResult.username
      };

      console.log('✅ User authenticated successfully:', this.status.user);
      return { success: true, user: this.status.user };

    } catch (error) {
      console.error('❌ Authentication failed:', error);
      this.status.authenticated = false;
      this.status.user = undefined;
      return { success: false, error: error instanceof Error ? error.message : 'Authentication failed' };
    }
  }

  /**
   * Create a shop payment
   */
  async createShopPayment(
    item: {
      id: string;
      name: string;
      price: number;
      description?: string;
    },
    quantity: number = 1
  ): Promise<any> {
    try {
      if (!this.status.authenticated) {
        throw new Error('User must be authenticated to create payments');
      }

      console.log('🛒 Creating shop payment:', { item, quantity });

      const result = await piPaymentService.createPayment({
        amount: item.price * quantity,
        memo: `Shop purchase: ${item.name}`,
        metadata: {
          type: 'shop_item',
          itemId: item.id,
          itemName: item.name,
          quantity: quantity
        }
      });
      
      if (result.success) {
        console.log('✅ Shop payment created successfully');
      } else {
        console.error('❌ Shop payment creation failed:', result.error);
      }

      return result;

    } catch (error) {
      console.error('❌ Shop payment creation failed:', error);
      return {
        success: false,
        error: error.message || 'Shop payment creation failed'
      };
    }
  }

  /**
   * Create a subscription payment
   */
  async createSubscriptionPayment(
    subscription: {
      id: string;
      name: string;
      price: number;
      duration: string;
    }
  ): Promise<any> {
    try {
      if (!this.status.authenticated) {
        throw new Error('User must be authenticated to create payments');
      }

      console.log('📅 Creating subscription payment:', subscription);

      const result = await piPaymentService.createPayment({
        amount: subscription.price,
        memo: `Subscription: ${subscription.name} (${subscription.duration})`,
        metadata: {
          type: 'subscription',
          subscriptionId: subscription.id,
          subscriptionName: subscription.name,
          duration: subscription.duration
        }
      });
      
      if (result.success) {
        console.log('✅ Subscription payment created successfully');
      } else {
        console.error('❌ Subscription payment creation failed:', result.error);
      }

      return result;

    } catch (error) {
      console.error('❌ Subscription payment creation failed:', error);
      return {
        success: false,
        error: error.message || 'Subscription payment creation failed'
      };
    }
  }

  /**
   * Load and show interstitial ad
   */
  async showInterstitialAd(): Promise<any> {
    try {
      if (!piAdNetworkService.isEnabled()) {
        console.log('⚠️ Ad network is disabled');
        return { success: false, error: 'Ad network disabled' };
      }

      console.log('📱 Loading interstitial ad...');

      const adConfig = {
        adUnitId: 'flappypi2807_mainnet_ads',
        placementId: 'flappypi2807_mainnet_placement',
        campaignId: 'flappypi2807_mainnet_campaign',
        creativeId: 'flappypi2807_mainnet_creative'
      };

      const loadResult = await piAdNetworkService.loadInterstitialAd(adConfig);
      
      if (!loadResult.success) {
        return loadResult;
      }

      const showResult = await piAdNetworkService.showAd(loadResult.adId!);
      
      if (showResult.success) {
        await piAdNetworkService.trackImpression(loadResult.adId!);
        console.log('✅ Interstitial ad shown successfully');
      }

      return showResult;

    } catch (error) {
      console.error('❌ Interstitial ad failed:', error);
      return {
        success: false,
        error: error.message || 'Interstitial ad failed'
      };
    }
  }

  /**
   * Load and show rewarded ad
   */
  async showRewardedAd(): Promise<any> {
    try {
      if (!piAdNetworkService.isEnabled()) {
        console.log('⚠️ Ad network is disabled');
        return { success: false, error: 'Ad network disabled' };
      }

      console.log('🎁 Loading rewarded ad...');

      const adConfig = {
        adUnitId: 'flappypi2807_mainnet_ads',
        placementId: 'flappypi2807_mainnet_placement',
        campaignId: 'flappypi2807_mainnet_campaign',
        creativeId: 'flappypi2807_mainnet_creative'
      };

      const loadResult = await piAdNetworkService.loadRewardedAd(adConfig);
      
      if (!loadResult.success) {
        return loadResult;
      }

      const showResult = await piAdNetworkService.showAd(loadResult.adId!);
      
      if (showResult.success) {
        await piAdNetworkService.trackImpression(loadResult.adId!);
        console.log('✅ Rewarded ad shown successfully');
      }

      return showResult;

    } catch (error) {
      console.error('❌ Rewarded ad failed:', error);
      return {
        success: false,
        error: error.message || 'Rewarded ad failed'
      };
    }
  }

  /**
   * Get current SDK status
   */
  getStatus(): PiSDKStatus {
    return { ...this.status };
  }

  /**
   * Get SDK configuration
   */
  getConfig(): PiSDKConfig {
    return { ...this.config };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.status.authenticated;
  }

  /**
   * Check if running in Pi Browser
   */
  isPiBrowser(): boolean {
    return this.status.isPiBrowser;
  }

  /**
   * Get current user
   */
  getCurrentUser(): any {
    return this.status.user;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      piAuthService.signOut();
      this.status.authenticated = false;
      this.status.user = undefined;
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  }

  /**
   * Sign out user (alias for logout)
   */
  signOut(): void {
    piAuthService.signOut();
    this.status.authenticated = false;
    this.status.user = undefined;
    console.log('✅ User signed out successfully');
  }

  /**
   * Refresh authentication
   */
  async refreshAuth(): Promise<boolean> {
    try {
      const user = piAuthService.getCurrentUser();
      if (user && piAuthService.isAuthenticated()) {
        this.status.authenticated = true;
        this.status.user = {
          uid: user.uid,
          username: user.username
        };
        console.log('✅ Authentication refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to refresh authentication:', error);
      return false;
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(): Promise<any> {
    try {
      return await piAdNetworkService.getRevenueAnalytics();
    } catch (error) {
      console.error('❌ Failed to get revenue analytics:', error);
      return null;
    }
  }
}

// Export singleton instance
export const piSDKService = PiSDKService.getInstance();
export default piSDKService;