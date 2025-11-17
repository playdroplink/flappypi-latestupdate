import { piNetworkConfig } from '../config/piNetworkConfig';
// Pi Network Ad Network Service
// Based on official Pi Network documentation: https://github.com/pi-apps/pi-platform-docs.git

export interface AdConfig {
  adUnitId: string;
  placementId: string;
  campaignId: string;
  creativeId: string;
}

export interface AdResult {
  success: boolean;
  adId?: string;
  revenue?: number;
  error?: string;
}

export interface AdNetworkSettings {
  enabled: boolean;
  mode: 'mainnet' | 'testnet';
  apiUrl: string;
  appId: string;
  apiKey: string;
  revenueShare: number;
  minimumPayout: number;
  payoutCurrency: string;
  payoutWallet: string;
}

export class PiAdNetworkService {
  private static instance: PiAdNetworkService;
  private isInitialized = false;
  private settings: AdNetworkSettings;

  public static getInstance(): PiAdNetworkService {
    if (!PiAdNetworkService.instance) {
      PiAdNetworkService.instance = new PiAdNetworkService();
    }
    return PiAdNetworkService.instance;
  }

  constructor() {
    this.settings = {
      enabled: true,
      mode: 'mainnet',
      apiUrl: 'https://api.minepi.com',
      appId: 'flappypi2807',
      apiKey: piNetworkConfig.pi.apiKey,
      revenueShare: 0.7,
      minimumPayout: 1.0,
      payoutCurrency: 'PI',
      payoutWallet: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ'
    };
  }

  /**
   * Initialize Pi Ad Network
   */
  async initialize(): Promise<boolean> {
    try {
      if (!this.settings.enabled) {
        console.log('⚠️ Pi Ad Network is disabled');
        return false;
      }

      if (typeof window === 'undefined' || !window.Pi) {
        console.error('❌ Pi SDK not available. Please use Pi Browser.');
        return false;
      }

      // Initialize Pi SDK with version 2.0 as per official docs
      await window.Pi.init({ version: "2.0" });
      this.isInitialized = true;
      
      console.log('✅ Pi Ad Network Service initialized successfully');
      console.log('📊 Ad Network Settings:', this.settings);
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Pi Ad Network Service:', error);
      return false;
    }
  }

  /**
   * Load interstitial ad
   */
  async loadInterstitialAd(adConfig: AdConfig): Promise<AdResult> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Pi Ad Network not initialized');
        }
      }

      console.log('📱 Loading interstitial ad:', adConfig);

      // Create ad request following Pi Network ad network patterns
      const adRequest = {
        adUnitId: adConfig.adUnitId,
        placementId: adConfig.placementId,
        campaignId: adConfig.campaignId,
        creativeId: adConfig.creativeId,
        network: this.settings.mode,
        apiUrl: this.settings.apiUrl,
        appId: this.settings.appId,
        apiKey: this.settings.apiKey
      };

      // Load ad through Pi Network ad network
      const response = await fetch(`${this.settings.apiUrl}/v2/ads/load`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`
        },
        body: JSON.stringify(adRequest)
      });

      if (!response.ok) {
        throw new Error(`Ad loading failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Interstitial ad loaded:', result);

      return {
        success: true,
        adId: result.adId,
        revenue: result.revenue
      };

    } catch (error: any) {
      console.error('❌ Failed to load interstitial ad:', error);
      return {
        success: false,
        error: error.message || 'Ad loading failed'
      };
    }
  }

  /**
   * Load rewarded ad
   */
  async loadRewardedAd(adConfig: AdConfig): Promise<AdResult> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Pi Ad Network not initialized');
        }
      }

      console.log('🎁 Loading rewarded ad:', adConfig);

      const adRequest = {
        adUnitId: adConfig.adUnitId,
        placementId: adConfig.placementId,
        campaignId: adConfig.campaignId,
        creativeId: adConfig.creativeId,
        network: this.settings.mode,
        apiUrl: this.settings.apiUrl,
        appId: this.settings.appId,
        apiKey: this.settings.apiKey,
        type: 'rewarded'
      };

      const response = await fetch(`${this.settings.apiUrl}/v2/ads/load-rewarded`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`
        },
        body: JSON.stringify(adRequest)
      });

      if (!response.ok) {
        throw new Error(`Rewarded ad loading failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Rewarded ad loaded:', result);

      return {
        success: true,
        adId: result.adId,
        revenue: result.revenue
      };

    } catch (error: any) {
      console.error('❌ Failed to load rewarded ad:', error);
      return {
        success: false,
        error: error.message || 'Rewarded ad loading failed'
      };
    }
  }

  /**
   * Show ad
   */
  async showAd(adId: string): Promise<AdResult> {
    try {
      console.log('📺 Showing ad:', adId);

      const response = await fetch(`${this.settings.apiUrl}/v2/ads/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`
        },
        body: JSON.stringify({
          adId,
          network: this.settings.mode,
          appId: this.settings.appId
        })
      });

      if (!response.ok) {
        throw new Error(`Ad showing failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Ad shown successfully:', result);

      return {
        success: true,
        revenue: result.revenue
      };

    } catch (error: any) {
      console.error('❌ Failed to show ad:', error);
      return {
        success: false,
        error: error.message || 'Ad showing failed'
      };
    }
  }

  /**
   * Track ad impression
   */
  async trackImpression(adId: string): Promise<void> {
    try {
      console.log('📊 Tracking ad impression:', adId);

      await fetch(`${this.settings.apiUrl}/v2/ads/impression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`
        },
        body: JSON.stringify({
          adId,
          network: this.settings.mode,
          appId: this.settings.appId,
          timestamp: Date.now()
        })
      });

      console.log('✅ Ad impression tracked');

    } catch (error) {
      console.error('❌ Failed to track ad impression:', error);
    }
  }

  /**
   * Track ad click
   */
  async trackClick(adId: string): Promise<void> {
    try {
      console.log('👆 Tracking ad click:', adId);

      await fetch(`${this.settings.apiUrl}/v2/ads/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`
        },
        body: JSON.stringify({
          adId,
          network: this.settings.mode,
          appId: this.settings.appId,
          timestamp: Date.now()
        })
      });

      console.log('✅ Ad click tracked');

    } catch (error) {
      console.error('❌ Failed to track ad click:', error);
    }
  }

  /**
   * Get ad network settings
   */
  getSettings(): AdNetworkSettings {
    return this.settings;
  }

  /**
   * Update ad network settings
   */
  updateSettings(newSettings: Partial<AdNetworkSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('📊 Ad Network settings updated:', this.settings);
  }

  /**
   * Check if ad network is enabled
   */
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(): Promise<any> {
    try {
      const response = await fetch(`${this.settings.apiUrl}/v2/ads/analytics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.settings.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Analytics fetch failed: ${response.status}`);
      }

      const analytics = await response.json();
      console.log('📊 Revenue analytics:', analytics);
      return analytics;

    } catch (error) {
      console.error('❌ Failed to get revenue analytics:', error);
      return null;
    }
  }
}

// Export singleton instance
export const piAdNetworkService = PiAdNetworkService.getInstance();
export default piAdNetworkService;