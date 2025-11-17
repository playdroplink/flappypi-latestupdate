import { payWithPi } from './piPayment';
import { PI_CONFIG } from '@/config/piConfig';
import { paymentVerificationService } from './paymentVerificationService';
import { walletAddressVerification } from './walletAddressVerification';
import { inventoryService } from './inventoryService';

export interface PaymentItem {
  id: string;
  name: string;
  type: 'skin' | 'subscription' | 'coins' | 'revive' | 'multiplier';
  piAmount: number;
  coinPrice?: number;
  description?: string;
  quantity?: number;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  txid?: string;
  deliveredItems?: any[];
  error?: string;
}

export class RealPiPaymentService {
  private static instance: RealPiPaymentService;
  
  private constructor() {}
  
  public static getInstance(): RealPiPaymentService {
    if (!RealPiPaymentService.instance) {
      RealPiPaymentService.instance = new RealPiPaymentService();
    }
    return RealPiPaymentService.instance;
  }

  /**
   * Process a real Pi payment for shop items
   */
  async processShopPayment(item: PaymentItem): Promise<PaymentResult> {
    try {
      console.log('🛒 Processing shop payment for:', item.name);
      console.log('🌐 Network Mode:', PI_CONFIG.getNetworkMode());
      console.log('🔧 Production Mode:', PI_CONFIG.isProduction());

      // Check if Pi SDK is available
      if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not available. Please use Pi Browser.');
      }

            // MAINNET PRODUCTION MODE ONLY
      console.log('🔧 Payment mode check:', {
        isMainnet: PI_CONFIG.isMainnet(),
        isSandbox: PI_CONFIG.isSandbox(),
        isProduction: PI_CONFIG.isProduction(),
        networkMode: PI_CONFIG.getNetworkMode()
      });
      
      // Ensure we're in mainnet production mode
      if (!PI_CONFIG.isMainnet() || PI_CONFIG.isSandbox()) {
        throw new Error('MAINNET PRODUCTION MODE REQUIRED - Sandbox mode is disabled');
      }

      // Create payment memo with Flappy Pi branding
      const memo = `Flappy Pi: ${item.name}`;
      
      // Create metadata for tracking
      const metadata = {
        itemId: item.id,
        itemType: item.type,
        itemName: item.name,
        quantity: item.quantity || 1,
        timestamp: Date.now(),
        network: PI_CONFIG.getNetworkMode(),
        appId: PI_CONFIG.getAppId(),
        version: '2.0'
      };

      // Process payment through Pi Network
      const result = await payWithPi({
        amount: item.piAmount,
        memo,
        metadata
      });

      if (result.status === 'completed' && result.txid) {
        // Verify payment completion before delivering items
        const verificationResult = await this.verifyPaymentCompletion(result.paymentId, result.txid, item.piAmount, item.name, 'shop_item');
        
        if (verificationResult.success && verificationResult.verified) {
          // Only deliver items after successful verification
          const deliveredItems = await this.deliverItems(item);
          
          console.log('✅ Shop payment completed and verified successfully');
          console.log('💰 Transaction ID:', result.txid);
          console.log('📦 Delivered items:', deliveredItems);
          
          return {
            success: true,
            paymentId: result.paymentId,
            txid: result.txid,
            deliveredItems,
          };
        } else {
          console.log('❌ Payment verification failed - not delivering items');
          return {
            success: false,
            error: 'Payment verification failed - items not delivered',
            paymentId: result.paymentId
          };
        }
      } else if (result.status === 'insufficient') {
        throw new Error('Insufficient Pi balance');
      } else if (result.status === 'cancelled') {
        throw new Error('Payment was cancelled');
      } else {
        throw new Error(result.error || 'Payment failed');
      }

    } catch (error: any) {
      console.error('❌ Shop payment failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process a real Pi payment for subscriptions
   */
  async processSubscriptionPayment(plan: { id: string; name: string; price: string }): Promise<PaymentResult> {
    try {
      console.log('📦 Processing subscription payment for:', plan.name);
      console.log('🌐 Network Mode:', PI_CONFIG.getNetworkMode());
      console.log('🔧 Production Mode:', PI_CONFIG.isProduction());

      // Check if Pi SDK is available
      if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not available. Please use Pi Browser.');
      }

      // ALLOW SANDBOX MODE FOR DEVELOPMENT AND TESTING
      console.log('🔧 Subscription payment mode check:', {
        isMainnet: PI_CONFIG.isMainnet(),
        isSandbox: PI_CONFIG.isSandbox(),
        isProduction: PI_CONFIG.isProduction(),
        networkMode: PI_CONFIG.getNetworkMode()
      });
      
      // Allow sandbox mode for development
      if (PI_CONFIG.isSandbox()) {
        console.log('🧪 SANDBOX MODE: Allowing sandbox subscription payments for development');
      }

      const piAmount = parseInt(plan.price);
      
      // Create payment memo with Flappy Pi branding
      const memo = `Flappy Pi Subscription: ${plan.name}`;
      
      // Create metadata for tracking
      const metadata = {
        subscriptionId: plan.id,
        subscriptionName: plan.name,
        subscriptionType: 'subscription',
        timestamp: Date.now(),
        network: PI_CONFIG.getNetworkMode(),
        appId: PI_CONFIG.getAppId(),
        version: '2.0'
      };

      // Process payment through Pi Network
      const result = await payWithPi({
        amount: piAmount,
        memo,
        metadata
      });

      if (result.status === 'completed' && result.txid) {
        // Verify payment completion before delivering subscription rewards
        const verificationResult = await this.verifyPaymentCompletion(result.paymentId, result.txid, piAmount, plan.name, 'subscription');
        
        if (verificationResult.success && verificationResult.verified) {
          // Only deliver subscription rewards after successful verification
          const deliveredItems = await this.deliverSubscriptionRewards(plan);
          
          console.log('✅ Subscription payment completed and verified successfully');
          console.log('💰 Transaction ID:', result.txid);
          console.log('📦 Delivered rewards:', deliveredItems);
          
          return {
            success: true,
            paymentId: result.paymentId,
            txid: result.txid,
            deliveredItems,
          };
        } else {
          console.log('❌ Subscription payment verification failed - not delivering rewards');
          return {
            success: false,
            error: 'Payment verification failed - subscription rewards not delivered',
            paymentId: result.paymentId
          };
        }
      } else if (result.status === 'insufficient') {
        throw new Error('Insufficient Pi balance');
      } else if (result.status === 'cancelled') {
        throw new Error('Payment was cancelled');
      } else {
        throw new Error(result.error || 'Payment failed');
      }

    } catch (error: any) {
      console.error('❌ Subscription payment failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify payment completion with Flappy Pi API
   */
  private async verifyPaymentCompletion(paymentId: string, txid: string, amount: number, itemName: string, itemType: 'subscription' | 'shop_item' | 'boost' | 'character'): Promise<{ success: boolean; verified: boolean; error?: string }> {
    try {
      console.log('🔍 Verifying payment completion:', { paymentId, txid, amount, itemName, itemType });
      
      const verificationResult = await paymentVerificationService.verifyPayment({
        paymentId: paymentId,
        transactionId: txid,
        userId: 'current_user', // TODO: Get actual user ID from context
        amount: amount,
        itemName: itemName,
        itemType: itemType
      });
      
      if (verificationResult.success && verificationResult.verified && verificationResult.readyForDelivery) {
        console.log('✅ Payment verification successful:', verificationResult);
        return { success: true, verified: true };
      } else {
        console.log('❌ Payment verification failed:', verificationResult);
        return { success: false, verified: false, error: verificationResult.error || 'Verification failed' };
      }
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      return { success: false, verified: false, error: error instanceof Error ? error.message : 'Verification error' };
    }
  }

  /**
   * Process a real Pi payment for game boosts
   */
  async processGameBoostPayment(boost: { id: string; name: string; piAmount: number }): Promise<PaymentResult> {
    try {
      console.log('⚡ Processing game boost payment for:', boost.name);
      console.log('🌐 Network Mode:', PI_CONFIG.getNetworkMode());
      console.log('🔧 Production Mode:', PI_CONFIG.isProduction());

      // Check if Pi SDK is available
      if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not available. Please use Pi Browser.');
      }

      // ENFORCE MAINNET MODE ONLY - NO TESTNET OR SANDBOX PAYMENTS
      if (!PI_CONFIG.isMainnet()) {
        throw new Error('REAL MAINNET PAYMENTS ONLY - No sandbox payments allowed');
      }
      
      if (!PI_CONFIG.isProduction()) {
        throw new Error('REAL MAINNET PAYMENTS ONLY - Production mode required');
      }

      // Create payment memo with Flappy Pi branding
      const memo = `Flappy Pi Boost: ${boost.name}`;
      
      // Create metadata for tracking
      const metadata = {
        boostId: boost.id,
        boostName: boost.name,
        boostType: 'game_boost',
        timestamp: Date.now(),
        network: PI_CONFIG.getNetworkMode(),
        appId: PI_CONFIG.getAppId(),
        version: '2.0'
      };

      // Process payment through Pi Network
      const result = await payWithPi({
        amount: boost.piAmount,
        memo,
        metadata
      });

      if (result.status === 'completed' && result.txid) {
        // Deliver game boost
        const deliveredItems = await this.deliverGameBoost(boost);
        
        console.log('✅ Game boost payment completed successfully');
        console.log('💰 Transaction ID:', result.txid);
        console.log('📦 Delivered boost:', deliveredItems);
        
        return {
          success: true,
          paymentId: result.paymentId,
          txid: result.txid,
          deliveredItems
        };
      } else if (result.status === 'insufficient') {
        throw new Error('Insufficient Pi balance');
      } else if (result.status === 'cancelled') {
        throw new Error('Payment was cancelled');
      } else {
        throw new Error(result.error || 'Payment failed');
      }

    } catch (error: any) {
      console.error('❌ Game boost payment failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Deliver items to user inventory using inventoryService
   */
  private async deliverItems(item: PaymentItem): Promise<any[]> {
    try {
      console.log('📦 Delivering items:', item.name);

      // Map item types to inventory service format
      const inventoryItem = {
        id: item.id,
        name: item.name,
        type: item.type as 'skin' | 'powerup' | 'subscription' | 'coins',
        quantity: item.quantity || 1,
        rarity: this.getItemRarity(item),
        image: this.getItemImage(item),
        description: item.description,
        price: item.piAmount,
        currency: 'pi' as const
      };

      // Handle different item types
      switch (item.type) {
        case 'skin':
          // Use inventoryService for proper skin delivery
          inventoryService.saveToInventory(inventoryItem);
          break;
        
        case 'powerup':
          // Use inventoryService for power-up delivery
          inventoryService.saveToInventory(inventoryItem);
          break;
        
        case 'coins':
          // Handle coin purchases through wallet service
          const coinAmount = item.quantity || item.coinPrice || 100;
          this.deliverCoins(coinAmount);
          break;
        
        case 'subscription':
          // Handle subscription through inventoryService
          inventoryService.saveToInventory({
            ...inventoryItem,
            expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString() // 30 days
          });
          break;
        
        default:
          // Default handling for other types
          inventoryService.saveToInventory(inventoryItem);
      }

      // Log transaction
      const transactions = JSON.parse(localStorage.getItem('flappypi-transactions') || '[]');
      transactions.push({
        id: `tx_${Date.now()}`,
        itemId: item.id,
        itemName: item.name,
        type: item.type,
        piAmount: item.piAmount,
        quantity: item.quantity || 1,
        timestamp: Date.now(),
        status: 'completed',
        network: PI_CONFIG.getNetworkMode()
      });
      localStorage.setItem('flappypi-transactions', JSON.stringify(transactions));

      // Trigger inventory update event for UI refresh
      window.dispatchEvent(new CustomEvent('inventory-updated', { 
        detail: { itemId: item.id, type: item.type, action: 'purchased' } 
      }));

      // Show success notification
      window.dispatchEvent(new CustomEvent('show-purchase-notification', {
        detail: {
          item: {
            id: item.id,
            name: item.name,
            type: item.type,
            quantity: item.quantity || 1,
            rarity: this.getItemRarity(item),
            image: this.getItemImage(item),
            description: item.description,
            price: item.piAmount,
            currency: 'pi'
          }
        }
      }));

      return [{
        type: item.type,
        itemId: item.id,
        itemName: item.name,
        quantity: item.quantity || 1,
        delivered: true,
        timestamp: Date.now()
      }];

    } catch (error) {
      console.error('❌ Item delivery failed:', error);
      throw error;
    }
  }

  /**
   * Deliver subscription rewards using inventoryService
   */
  private async deliverSubscriptionRewards(plan: { id: string; name: string }): Promise<any[]> {
    try {
      console.log('🎁 Delivering subscription rewards:', plan.name);

      // Create subscription inventory item with expiration
      const subscriptionItem = {
        id: plan.id,
        name: plan.name,
        type: 'subscription' as const,
        quantity: 1,
        rarity: 'Special' as const,
        description: 'Premium subscription with ad-free experience and exclusive benefits',
        expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString() // 30 days
      };

      // Use inventoryService for proper subscription delivery
      inventoryService.saveToInventory(subscriptionItem);

      // Also set legacy subscription status for backward compatibility
      const subscriptionData = {
        id: plan.id,
        name: plan.name,
        active: true,
        startDate: Date.now(),
        endDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
        timestamp: Date.now(),
        network: PI_CONFIG.getNetworkMode()
      };

      localStorage.setItem('flappypi-subscription', JSON.stringify(subscriptionData));

      // Log transaction
      const transactions = JSON.parse(localStorage.getItem('flappypi-transactions') || '[]');
      transactions.push({
        id: `tx_${Date.now()}`,
        subscriptionId: plan.id,
        subscriptionName: plan.name,
        type: 'subscription',
        timestamp: Date.now(),
        status: 'completed',
        network: PI_CONFIG.getNetworkMode()
      });
      localStorage.setItem('flappypi-transactions', JSON.stringify(transactions));

      // Trigger inventory update event
      window.dispatchEvent(new CustomEvent('inventory-updated', { 
        detail: { itemId: plan.id, type: 'subscription', action: 'subscribed' } 
      }));

      // Show subscription notification
      window.dispatchEvent(new CustomEvent('show-purchase-notification', {
        detail: {
          item: {
            id: plan.id,
            name: plan.name,
            type: 'subscription',
            quantity: 1,
            rarity: 'Special',
            description: 'Premium subscription activated! Enjoy ad-free experience.',
            price: 0,
            currency: 'pi'
          }
        }
      }));

      return [{
        type: 'subscription',
        subscriptionId: plan.id,
        subscriptionName: plan.name,
        delivered: true,
        timestamp: Date.now()
      }];

    } catch (error) {
      console.error('❌ Subscription delivery failed:', error);
      throw error;
    }
  }

  /**
   * Deliver game boost
   */
  private async deliverGameBoost(boost: { id: string; name: string }): Promise<any[]> {
    try {
      console.log('⚡ Delivering game boost:', boost.name);

      // Add boost to user inventory
      const currentBoosts = JSON.parse(localStorage.getItem('flappypi-boosts') || '[]');
      currentBoosts.push({
        id: boost.id,
        name: boost.name,
        timestamp: Date.now(),
        network: PI_CONFIG.getNetworkMode()
      });
      localStorage.setItem('flappypi-boosts', JSON.stringify(currentBoosts));

      // Log transaction
      const transactions = JSON.parse(localStorage.getItem('flappypi-transactions') || '[]');
      transactions.push({
        id: `tx_${Date.now()}`,
        boostId: boost.id,
        boostName: boost.name,
        type: 'game_boost',
        timestamp: Date.now(),
        status: 'completed',
        network: PI_CONFIG.getNetworkMode()
      });
      localStorage.setItem('flappypi-transactions', JSON.stringify(transactions));

      return [{
        type: 'game_boost',
        boostId: boost.id,
        boostName: boost.name,
        delivered: true,
        timestamp: Date.now()
      }];

    } catch (error) {
      console.error('❌ Game boost delivery failed:', error);
      throw error;
    }
  }

  /**
   * Process character purchase payment
   */
  async processCharacterPayment(character: { id: string; name: string; price: string }): Promise<PaymentResult> {
    try {
      console.log('🎮 Processing character payment for:', character.name);
      console.log('🌐 Network Mode:', PI_CONFIG.getNetworkMode());
      console.log('🔧 Production Mode:', PI_CONFIG.isProduction());

      // Check if Pi SDK is available
      if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not available. Please use Pi Browser.');
      }

      // ALLOW SANDBOX MODE FOR DEVELOPMENT AND TESTING
      console.log('🔧 Character payment mode check:', {
        isMainnet: PI_CONFIG.isMainnet(),
        isSandbox: PI_CONFIG.isSandbox(),
        isProduction: PI_CONFIG.isProduction(),
        networkMode: PI_CONFIG.getNetworkMode()
      });
      
      // Allow sandbox mode for development
      if (PI_CONFIG.isSandbox()) {
        console.log('🧪 SANDBOX MODE: Allowing sandbox character payments for development');
      }

      const piAmount = parseInt(character.price);
      
      // Create payment memo with Flappy Pi branding
      const memo = `Flappy Pi Character: ${character.name}`;
      
      // Create metadata for tracking
      const metadata = {
        characterId: character.id,
        characterName: character.name,
        characterType: 'character_unlock',
        timestamp: Date.now(),
        network: PI_CONFIG.getNetworkMode(),
        appId: PI_CONFIG.getAppId(),
        version: '2.0'
      };

      // Process payment through Pi Network
      const result = await payWithPi({
        amount: piAmount,
        memo,
        metadata
      });

      if (result.status === 'completed' && result.txid) {
        // Verify payment completion before unlocking character
        const verificationResult = await this.verifyPaymentCompletion(result.paymentId, result.txid, piAmount, character.name, 'character');
        
        if (verificationResult.success && verificationResult.verified) {
          // Only unlock character after successful verification
          const deliveredItems = await this.deliverCharacterUnlock(character);
          
          console.log('✅ Character payment completed and verified successfully');
          console.log('💰 Transaction ID:', result.txid);
          console.log('🎮 Unlocked character:', deliveredItems);
          
          return {
            success: true,
            paymentId: result.paymentId,
            txid: result.txid,
            deliveredItems,
          };
        } else {
          console.log('❌ Character payment verification failed - not unlocking character');
          return {
            success: false,
            error: 'Payment verification failed - character not unlocked',
            paymentId: result.paymentId
          };
        }
      } else if (result.status === 'insufficient') {
        throw new Error('Insufficient Pi balance');
      } else if (result.status === 'cancelled') {
        throw new Error('Payment was cancelled');
      } else {
        throw new Error(result.error || 'Payment failed');
      }

    } catch (error: any) {
      console.error('❌ Character payment failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Deliver character unlock
   */
  private async deliverCharacterUnlock(character: { id: string; name: string }): Promise<any[]> {
    try {
      console.log('🎮 Unlocking character:', character.name);

      // Get current unlocked characters from localStorage
      const currentUnlocked = JSON.parse(localStorage.getItem('screamPiUnlockedCharacters') || '["default"]');
      
      // Add new character if not already unlocked
      if (!currentUnlocked.includes(character.id)) {
        currentUnlocked.push(character.id);
        localStorage.setItem('screamPiUnlockedCharacters', JSON.stringify(currentUnlocked));
        console.log('✅ Character unlocked and saved to localStorage:', character.id);
      } else {
        console.log('⚠️ Character already unlocked:', character.id);
      }

      // Also save to inventory service for tracking
      const inventoryData = {
        id: `character_${character.id}`,
        name: character.name,
        type: 'character_unlock',
        characterId: character.id,
        timestamp: Date.now(),
        network: PI_CONFIG.getNetworkMode()
      };

      // Add to flappy pi inventory
      const currentInventory = JSON.parse(localStorage.getItem('flappypi-inventory') || '[]');
      currentInventory.push(inventoryData);
      localStorage.setItem('flappypi-inventory', JSON.stringify(currentInventory));

      // Log transaction
      const transactions = JSON.parse(localStorage.getItem('flappypi-transactions') || '[]');
      transactions.push({
        id: `tx_${Date.now()}`,
        characterId: character.id,
        characterName: character.name,
        type: 'character_unlock',
        timestamp: Date.now(),
        status: 'completed',
        network: PI_CONFIG.getNetworkMode()
      });
      localStorage.setItem('flappypi-transactions', JSON.stringify(transactions));

      return [{
        type: 'character_unlock',
        characterId: character.id,
        characterName: character.name,
        delivered: true,
        timestamp: Date.now()
      }];

    } catch (error) {
      console.error('❌ Character unlock delivery failed:', error);
      throw error;
    }
  }

  /**
   * Helper method to get item rarity
   */
  private getItemRarity(item: PaymentItem): 'Common' | 'Rare' | 'Epic' | 'Special' | 'Legendary' {
    // Default rarity mapping based on price
    if (item.piAmount >= 10) return 'Legendary';
    if (item.piAmount >= 5) return 'Epic';
    if (item.piAmount >= 2) return 'Rare';
    return 'Common';
  }

  /**
   * Helper method to get item image
   */
  private getItemImage(item: PaymentItem): string {
    // Return existing image or default based on type
    if (item.type === 'skin') {
      return `/birds/bird_${item.id}.png`;
    }
    if (item.type === 'powerup') {
      return `/icons/powerup_${item.id}.png`;
    }
    return '/flappy-logo.png';
  }

  /**
   * Helper method to deliver coins
   */
  private deliverCoins(amount: number): void {
    try {
      // Update wallet balance
      const currentBalance = parseInt(localStorage.getItem('flappypi-wallet-balance') || '0');
      const newBalance = currentBalance + amount;
      localStorage.setItem('flappypi-wallet-balance', newBalance.toString());
      
      // Dispatch wallet update event
      window.dispatchEvent(new CustomEvent('wallet-balance-updated', {
        detail: { balance: newBalance, added: amount }
      }));
      
      console.log(`💰 Added ${amount} coins to wallet. New balance: ${newBalance}`);
    } catch (error) {
      console.error('❌ Failed to deliver coins:', error);
    }
  }

  /**
   * Get payment status and network information
   */
  getPaymentStatus(): { network: string; isMainnet: boolean; isProduction: boolean; sdkAvailable: boolean } {
    return {
      network: PI_CONFIG.getNetworkMode(),
      isMainnet: PI_CONFIG.isMainnet(),
      isProduction: PI_CONFIG.isProduction(),
      sdkAvailable: typeof window !== 'undefined' && typeof window.Pi !== 'undefined'
    };
  }
}

// Export singleton instance
export const realPiPaymentService = RealPiPaymentService.getInstance(); 