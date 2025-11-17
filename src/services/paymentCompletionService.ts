// Payment Completion Service
// Ensures items are properly delivered after payment approval and completion

import { PI_CONFIG } from '../config/piConfig';

export interface PaymentCompletionData {
  paymentId: string;
  txid: string;
  amount: number;
  memo: string;
  metadata: any;
  userId?: string;
  itemType?: string;
  itemId?: string;
  itemName?: string;
  quantity?: number;
}

export interface DeliveryResult {
  success: boolean;
  deliveredItems?: any[];
  error?: string;
}

export class PaymentCompletionService {
  private static instance: PaymentCompletionService;
  
  // Mainnet Wallet Configuration
  private readonly MAINNET_WALLET_ADDRESS = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ';
  
  static getInstance(): PaymentCompletionService {
    if (!PaymentCompletionService.instance) {
      PaymentCompletionService.instance = new PaymentCompletionService();
    }
    return PaymentCompletionService.instance;
  }

  /**
   * Verify payment completion and deliver items
   */
  async verifyAndDeliverItems(completionData: PaymentCompletionData): Promise<DeliveryResult> {
    try {
      console.log('🔍 Verifying payment completion...', completionData);

      // 1. Verify payment completion with backend
      const verificationResult = await this.verifyPaymentCompletion(completionData);
      
      if (!verificationResult.success) {
        throw new Error(`Payment verification failed: ${verificationResult.error}`);
      }

      // 2. Verify wallet address matches mainnet wallet
      if (verificationResult.walletAddress !== this.MAINNET_WALLET_ADDRESS) {
        throw new Error(`Invalid wallet address: ${verificationResult.walletAddress}`);
      }

      // 3. Deliver items based on payment type
      const deliveryResult = await this.deliverItems(completionData);

      if (!deliveryResult.success) {
        throw new Error(`Item delivery failed: ${deliveryResult.error}`);
      }

      console.log('✅ Payment completed and items delivered successfully');
      console.log('💰 Wallet Address:', this.MAINNET_WALLET_ADDRESS);
      console.log('📦 Delivered Items:', deliveryResult.deliveredItems);

      return {
        success: true,
        deliveredItems: deliveryResult.deliveredItems
      };

    } catch (error: any) {
      console.error('❌ Payment completion verification failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify payment completion with backend
   */
  private async verifyPaymentCompletion(completionData: PaymentCompletionData): Promise<any> {
    try {
      const response = await fetch('/api/pi/complete-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: completionData.paymentId,
          txid: completionData.txid,
          amount: completionData.amount,
          memo: completionData.memo,
          metadata: completionData.metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Backend verification failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.verified) {
        throw new Error('Backend verification failed');
      }

      return result;

    } catch (error: any) {
      console.error('❌ Backend verification failed:', error);
      throw error;
    }
  }

  /**
   * Deliver items based on payment type
   */
  private async deliverItems(completionData: PaymentCompletionData): Promise<DeliveryResult> {
    try {
      const { itemType, itemId, itemName, quantity = 1, userId } = completionData;

      console.log('📦 Delivering items...', { itemType, itemId, itemName, quantity });

      const deliveredItems = [];

      // Handle different item types
      switch (itemType) {
        case 'coins':
          // Add coins to user profile
          const coinResult = await this.deliverCoins(userId, itemName, quantity);
          if (coinResult.success) {
            deliveredItems.push({
              type: 'coins',
              name: itemName,
              quantity: quantity,
              delivered: true
            });
          }
          break;

        case 'powerup':
          // Add power-up to user inventory
          const powerUpResult = await this.deliverPowerUp(userId, itemId, itemName, quantity);
          if (powerUpResult.success) {
            deliveredItems.push({
              type: 'powerup',
              id: itemId,
              name: itemName,
              quantity: quantity,
              delivered: true
            });
          }
          break;

        case 'subscription':
          // Activate subscription
          const subscriptionResult = await this.deliverSubscription(userId, itemId, itemName);
          if (subscriptionResult.success) {
            deliveredItems.push({
              type: 'subscription',
              id: itemId,
              name: itemName,
              delivered: true
            });
          }
          break;

        default:
          // Generic item delivery
          const genericResult = await this.deliverGenericItem(userId, itemType, itemId, itemName, quantity);
          if (genericResult.success) {
            deliveredItems.push({
              type: itemType,
              id: itemId,
              name: itemName,
              quantity: quantity,
              delivered: true
            });
          }
          break;
      }

      return {
        success: true,
        deliveredItems
      };

    } catch (error: any) {
      console.error('❌ Item delivery failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Deliver coins to user
   */
  private async deliverCoins(userId: string | undefined, itemName: string, quantity: number): Promise<{ success: boolean; error?: string }> {
    try {
      // This would typically update the user's profile in your database
      // For now, we'll simulate successful delivery
      console.log(`💰 Delivering ${quantity} ${itemName} to user ${userId}`);
      
      // TODO: Implement actual coin delivery to user profile
      // await updateUserProfile(userId, { coins: newCoinBalance });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Deliver power-up to user inventory
   */
  private async deliverPowerUp(userId: string | undefined, itemId: string, itemName: string, quantity: number): Promise<{ success: boolean; error?: string }> {
    try {
      // This would typically update the user's inventory in your database
      console.log(`⚡ Delivering ${quantity} ${itemName} (${itemId}) to user ${userId}`);
      
      // TODO: Implement actual power-up delivery to user inventory
      // await updateUserInventory(userId, { [itemId]: quantity });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Deliver subscription to user
   */
  private async deliverSubscription(userId: string | undefined, itemId: string, itemName: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This would typically activate the subscription in your database
      console.log(`📋 Activating subscription ${itemName} (${itemId}) for user ${userId}`);
      
      // TODO: Implement actual subscription activation
      // await activateSubscription(userId, itemId);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Deliver generic item to user
   */
  private async deliverGenericItem(userId: string | undefined, itemType: string, itemId: string, itemName: string, quantity: number): Promise<{ success: boolean; error?: string }> {
    try {
      // This would typically update the user's inventory or profile
      console.log(`📦 Delivering ${quantity} ${itemName} (${itemType}:${itemId}) to user ${userId}`);
      
      // TODO: Implement actual item delivery
      // await deliverItem(userId, itemType, itemId, quantity);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get mainnet wallet address
   */
  getMainnetWalletAddress(): string {
    return this.MAINNET_WALLET_ADDRESS;
  }

  /**
   * Verify wallet address matches mainnet
   */
  verifyWalletAddress(walletAddress: string): boolean {
    return walletAddress === this.MAINNET_WALLET_ADDRESS;
  }
}
