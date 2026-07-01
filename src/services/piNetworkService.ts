interface PiUser {
  uid: string;
  username: string;
  accessToken: string;
}

interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: object;
  from_address: string;
  to_address: string;
  direction: string;
  created_at: string;
  network: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: {
    txid: string;
    verified: boolean;
    _link: string;
  };
}

interface PiSDK {
  init: (config: { version: string; sandbox: boolean }) => Promise<void>;
  authenticate: (scopes: string[], onIncompletePaymentFound?: (payment: PiPayment) => void) => Promise<PiUser>;
  createPayment: (paymentData: {
    amount: number;
    memo: string;
    metadata: object;
  }, callbacks: {
    onReadyForServerApproval: (paymentId: string) => void;
    onReadyForServerCompletion: (paymentId: string, txid: string) => void;
    onCancel: (paymentId: string) => void;
    onError: (error: Error, payment?: PiPayment) => void;
  }) => void;
  openShareDialog: (title: string, message: string) => void; // Add missing method
}

import { loadPiSdk, detectEnvironment } from './piSdkLoader';
import { purchaseStateService, PurchaseUpdate } from './purchaseStateService';
import { paymentHistoryService } from './paymentHistoryService';
import { piNetworkRetryService } from './piNetworkRetryService';
import { piSecurityService } from './piSecurityService';
import { PI_CONFIG } from '../config/piConfig';
import { piAuthMobile, PiAuthConfig } from '../utils/piAuthMobile';

class PiNetworkService {
  private isInitialized = false;
  private currentUser: PiUser | null = null;
  private readonly APP_ID = PI_CONFIG.APP_ID;
  private readonly environment = detectEnvironment();
  private paymentCallbacks: Map<string, Function> = new Map();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Initializing Pi Network Service for mainnet...');
      
      // Use enhanced mobile authentication with mainnet config
      const authConfig: PiAuthConfig = {
        scopes: ['payments'],
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 30000,
        enablePayments: true,
        enableAds: false
      };

      const initialized = await piAuthMobile.initialize(authConfig);
      if (!initialized) {
        throw new Error('Pi SDK failed to initialize for mobile mainnet');
      }

      this.isInitialized = true;
      console.log('✅ Pi Network Service initialized for mobile mainnet');
      console.log(`🔧 Network Mode: ${PI_CONFIG.getNetworkMode()}`);
      console.log(`🔧 Sandbox Mode: ${PI_CONFIG.getSandboxSetting() ? 'ENABLED' : 'DISABLED'}`);
    } catch (error) {
      console.error('Failed to initialize Pi SDK:', error);
      throw error;
    }
  }

  private onIncompletePaymentFound = (payment: PiPayment): void => {
    console.log('Incomplete payment found:', payment);
    const paymentId = payment.identifier;
    const txid = payment.transaction?.txid;

    if (txid) {
      this.completePayment(paymentId, txid);
    } else {
      console.log('Cancelling incomplete payment without txid:', paymentId);
    }
  };

  async authenticate(): Promise<PiUser | null> {
    try {
      await this.initialize();
      
      // Use enhanced mobile authentication
      const authConfig: PiAuthConfig = {
        scopes: ['payments'],
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 30000,
        enablePayments: true,
        enableAds: false
      };

      const authResult = await piAuthMobile.authenticate(authConfig);
      
      if (authResult.success && authResult.user) {
        this.currentUser = {
          uid: authResult.user.uid,
          username: authResult.user.username,
          accessToken: authResult.user.accessToken
        };

        console.log('✅ Pi user authenticated:', this.currentUser);
        return this.currentUser;
      } else {
        console.error('❌ Pi authentication failed:', authResult.error);
        return null;
      }
    } catch (error) {
      console.error('Pi authentication failed:', error);
      return null;
    }
  }

  async createPayment(amount: number, memo: string, metadata: any = {}): Promise<string> {
    if (!this.currentUser) {
      const user = await this.authenticate();
      if (!user) {
        throw new Error('User not authenticated');
      }
    }

    return new Promise((resolve, reject) => {
      if (!window.Pi) {
        reject(new Error('Pi SDK not available'));
        return;
      }

      try {
        const sanitizedPaymentData = piSecurityService.sanitizePaymentData({
          amount,
          memo,
          metadata: {
            ...metadata,
            app_id: this.APP_ID,
            user_id: this.currentUser?.uid || 'guest',
            timestamp: Date.now(),
            environment: PI_CONFIG.IS_SANDBOX ? 'testnet' : 'production'
          }
        });

        console.log('Creating payment with data:', sanitizedPaymentData);

        window.Pi.createPayment({
          amount: sanitizedPaymentData.amount,
          memo: sanitizedPaymentData.memo,
          metadata: sanitizedPaymentData.metadata
        }, {
          onReadyForServerApproval: async (paymentId: string) => {
            try {
              await this.approvePayment(paymentId);
              console.log('Payment approved:', paymentId);
            } catch (error) {
              console.error('Payment approval failed:', error);
              reject(error);
            }
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            try {
              await this.completePayment(paymentId, txid, sanitizedPaymentData.metadata);
              console.log('Payment completed:', paymentId);
              resolve(paymentId);
            } catch (error) {
              console.error('Payment completion failed:', error);
              reject(error);
            }
          },
          onCancel: (paymentId: string) => {
            console.log('Payment cancelled:', paymentId);
            reject(new Error('Payment cancelled'));
          },
          onError: (error: Error, payment?: PiPayment) => {
            console.error('Payment error:', error, payment);
            reject(error);
          }
        });
      } catch (error) {
        console.error('Failed to create payment:', error);
        reject(error);
      }
    });
  }

  private async makeApiRequest(endpoint: string, method: string = 'GET', data?: any) {
    const url = `${PI_CONFIG.getApiUrl()}${endpoint}`;
    try {
      const response = await fetch(url, {
        method,
        headers: PI_CONFIG.getHeaders(),
        body: data ? JSON.stringify(data) : undefined
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request to ${endpoint} failed:`, error);
      throw error;
    }
  }

  private async approvePayment(paymentId: string): Promise<void> {
    try {
      await this.makeApiRequest(`/v2/payments/${paymentId}/approve`, 'POST');
      console.log('Payment approved via API:', paymentId);
    } catch (error) {
      console.error('Payment approval failed:', error);
      throw error;
    }
  }

  private async completePayment(paymentId: string, txid: string, metadata?: any): Promise<void> {
    try {
      await this.makeApiRequest(`/v2/payments/${paymentId}/complete`, 'POST', {
        txid,
        metadata
      });
      console.log('Payment completed via API:', paymentId);
    } catch (error) {
      console.error('Payment completion failed:', error);
      throw error;
    }
  }

  private async recordPaymentInHistory(paymentId: string, txid: string, metadata: any): Promise<void> {
    try {
      const itemName = this.getItemNameFromMetadata(metadata);
      const itemDescription = this.getItemDescriptionFromMetadata(metadata);
      const amount = this.getAmountFromMetadata(metadata);
      
      await paymentHistoryService.recordPayment({
        payment_type: 'pi_payment',
        item_name: itemName,
        item_description: itemDescription,
        amount_pi: amount,
        amount_coins: 0,
        pi_transaction_id: txid,
        payment_status: 'completed',
        metadata: metadata
      });
    } catch (error) {
      console.error('Error recording payment in history:', error);
    }
  }

  private getItemNameFromMetadata(metadata: any): string {
    switch (metadata.type) {
      case 'subscription':
        return 'Pi Premium Subscription';
      case 'elite':
        return 'Elite Pack Subscription';
      case 'no-ads':
        return 'Remove All Ads Forever';
      case 'skin':
        return `${metadata.itemId} Bird Skin`;
      case 'all-skins':
        return 'All Standard Skins Access';
      default:
        return 'Flappy Pi Purchase';
    }
  }

  private getItemDescriptionFromMetadata(metadata: any): string {
    switch (metadata.type) {
      case 'subscription':
        return '30 days of premium features including ad-free gaming and exclusive skins';
      case 'elite':
        return '30 days of elite features with special rewards and bonuses';
      case 'no-ads':
        return 'Permanent removal of all advertisements';
      case 'skin':
        return `Unlock the ${metadata.itemId} bird skin for customization`;
      case 'all-skins':
        return 'Access to all standard bird skins via premium subscription';
      default:
        return 'Flappy Pi in-game purchase';
    }
  }

  private getAmountFromMetadata(metadata: any): number {
    switch (metadata.type) {
      case 'subscription':
        return 15;
      case 'elite':
        return 20;
      case 'no-ads':
        return 10;
      case 'skin':
        return 2;
      case 'all-skins':
        return 15;
      default:
        return 0;
    }
  }

  private async updatePurchaseStateFromMetadata(metadata: any, txid: string): Promise<void> {
    if (!this.currentUser) return;

    try {
      const purchaseUpdate: PurchaseUpdate = this.determinePurchaseType(metadata);
      await purchaseStateService.updatePurchaseState(
        this.currentUser.uid,
        purchaseUpdate,
        txid
      );
    } catch (error) {
      console.error('Error updating purchase state:', error);
    }
  }

  private determinePurchaseType(metadata: any): PurchaseUpdate {
    const type = metadata.type;
    
    switch (type) {
      case 'subscription':
        return { itemType: 'premium', duration: 30 };
      case 'elite':
        return { itemType: 'elite', duration: 30 };
      case 'no-ads':
        return { itemType: 'ad_free', permanent: true };
      case 'skin':
        return { itemType: 'skin', itemId: metadata.itemId };
      case 'all-skins':
        return { itemType: 'premium', duration: 30 }; // All skins access via premium
      default:
        console.warn('Unknown purchase type:', type);
        return { itemType: 'premium', duration: 30 };
    }
  }

  // Enhanced convenience methods with purchase state integration
  async purchasePremiumSubscription(): Promise<string> {
    try {
      const paymentId = await this.createPayment(15, "Unlock Pi Premium", { type: "subscription" });
      piSecurityService.logSecurityEvent('premium_subscription_purchased', { paymentId });
      return paymentId;
    } catch (error) {
      piSecurityService.logSecurityEvent('premium_subscription_failed', { error });
      throw error;
    }
  }

  async purchaseEliteSubscription(): Promise<string> {
    try {
      const paymentId = await this.createPayment(20, "Unlock Elite Pack", { type: "elite" });
      piSecurityService.logSecurityEvent('elite_subscription_purchased', { paymentId });
      return paymentId;
    } catch (error) {
      piSecurityService.logSecurityEvent('elite_subscription_failed', { error });
      throw error;
    }
  }

  async purchaseBirdSkin(skinId: string, skinName: string): Promise<string> {
    try {
      const paymentId = await this.createPayment(2, `Unlock ${skinName} Bird Skin`, { 
        type: "skin", 
        itemId: skinId 
      });
      piSecurityService.logSecurityEvent('bird_skin_purchased', { paymentId, skinId });
      return paymentId;
    } catch (error) {
      piSecurityService.logSecurityEvent('bird_skin_purchase_failed', { error, skinId });
      throw error;
    }
  }

  async purchaseAdRemoval(): Promise<string> {
    try {
      const paymentId = await this.createPayment(10, "Remove All Ads Forever", { type: "no-ads" });
      piSecurityService.logSecurityEvent('ad_removal_purchased', { paymentId });
      return paymentId;
    } catch (error) {
      piSecurityService.logSecurityEvent('ad_removal_failed', { error });
      throw error;
    }
  }

  async purchaseAllSkins(): Promise<string> {
    try {
      const paymentId = await this.createPayment(15, "Unlock All Standard Skins", { type: "all-skins" });
      piSecurityService.logSecurityEvent('all_skins_purchased', { paymentId });
      return paymentId;
    } catch (error) {
      piSecurityService.logSecurityEvent('all_skins_failed', { error });
      throw error;
    }
  }

  // Get user's purchase state
  async getUserPurchaseState() {
    if (!this.currentUser) return null;
    return purchaseStateService.getCachedState(this.currentUser.uid);
  }

  // Check specific ownership
  async userOwnsSkin(skinId: string): Promise<boolean> {
    if (!this.currentUser) return skinId === 'default';
    return purchaseStateService.userOwnsSkin(this.currentUser.uid, skinId);
  }

  async userHasPremium(): Promise<boolean> {
    if (!this.currentUser) return false;
    try {
      return await purchaseStateService.userHasActivePremium(this.currentUser.uid);
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  shareScore(score: number, level: number): void {
    try {
      if (!window.Pi) {
        throw new Error('Pi SDK not available');
      }

      const title = "Check out my Flappy Pi score!";
      const message = `I just scored ${score} points and reached level ${level} in Flappy Pi! 🐦 Can you beat my score? Play now at https://www.flappypi.xyz/flappypiofficial`;
      
      if (window.Pi?.openShareDialog) {
        window.Pi.openShareDialog(title, message);
      } else {
        // Fallback to native sharing
        if (navigator.share) {
          navigator.share({ title, text: message });
        } else {
          // Copy to clipboard as fallback
          navigator.clipboard.writeText(`${title} ${message}`);
          console.log('Score shared to clipboard');
        }
      }
    } catch (error) {
      console.error('Failed to share score:', error);
    }
  }

  getCurrentUser(): PiUser | null {
    return this.currentUser;
  }

  isUserAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getEnvironment() {
    return this.environment;
  }

  async isUserSubscribed(): Promise<boolean> {
    // Check if the user has an active premium subscription
    return this.currentUser ? await purchaseStateService.userHasActivePremium(this.currentUser.uid) : false;
  }

  disablePiAdNetwork(): void {
    if (this.isUserSubscribed()) {
      console.log('User is subscribed. Disabling Pi Ad Network.');
      // Logic to disable Pi Ad Network
    } else {
      console.log('User is not subscribed. Pi Ad Network is active.');
      // Logic to enable or keep Pi Ad Network active
    }
  }
}

export const piNetworkService = new PiNetworkService();
export type { PiUser, PiPayment };
