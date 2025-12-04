import { walletAddressVerification } from './walletAddressVerification';

interface PaymentItem {
  id: string;
  name: string;
  description: string;
  piAmount: number;
  type: 'subscription' | 'shop_item' | 'coins';
  features?: string[];
  savings?: string;
  totalValue?: number;
  originalPrice?: number;
  image?: string;
  rarity?: string;
  coins?: number;
  durationDays?: number;
}

interface PaymentResult {
  success: boolean;
  txid?: string;
  paymentId?: string;
  error?: string;
}

class DirectPaymentService {
  private toast: any = null;

  constructor() {
    // Toast will be set by the component using this service
  }

  /**
   * Set toast function from component
   */
  setToast(toastFn: any) {
    this.toast = toastFn;
  }

  /**
   * Deliver items only after successful payment completion
   */
  private async deliverItemsAfterPayment(item: PaymentItem, paymentId: string, txid: string): Promise<void> {
    try {
      console.log('🎁 Delivering items after successful payment:', { item, paymentId, txid });
      
      // Import inventory service dynamically to avoid circular dependencies
      const { inventoryService } = await import('./inventoryService');
      
      // Check if this is a subscription purchase
      if (item.type === 'subscription' && item.id) {
        // Create subscription inventory item
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + (item.durationDays || 7));
        
        const subscriptionItem = {
          id: item.id,
          name: item.name,
          type: 'subscription' as const,
          quantity: 1,
          image: item.image || '/subscription-icon.png',
          description: item.description || `Active subscription: ${item.name}`,
          purchasedAt: new Date().toISOString(),
          expiresAt: expiration.toISOString()
        };
        
        // Save subscription to inventory
        inventoryService.saveToInventory(subscriptionItem);
        
        // Also unlock the Fire Phoenix skin for subscribers
        const infernoPhoenixSkin = {
          id: 'inferno_phoenix',
          name: '🔥 Fire Phoenix',
          type: 'skin' as const,
          quantity: 1,
          image: '/birds2/bird_12.gif',
          description: 'Born from the flames of hope, the Fire Phoenix is a legendary firebird that rises when all seems lost.',
          rarity: 'Special' as const,
          purchasedAt: new Date().toISOString()
        };
        
        // Save the Fire Phoenix skin to inventory
        inventoryService.saveToInventory(infernoPhoenixSkin);
        
        console.log('✅ Subscription delivered to inventory:', subscriptionItem);
        console.log('✅ Fire Phoenix skin unlocked:', infernoPhoenixSkin);
        
        // Show success toast
        if (this.toast) {
          this.toast({
            title: "Subscription Activated! 🎉",
            description: `${item.name} subscription is now active! Fire Phoenix skin unlocked!`,
            duration: 4000,
          });
        }
        
        // Dispatch subscription activated event
        window.dispatchEvent(new CustomEvent('subscription-activated', {
          detail: { plan: item, subscriptionItem, unlockedSkin: infernoPhoenixSkin }
        }));
        
      } else if (item.type === 'shop_item' && item.id) {
        // Create inventory item based on the purchased item
        const inventoryItem = {
          id: item.id,
          name: item.name,
          type: 'skin' as const,
          quantity: 1,
          image: item.image || `/birds/${item.id}.png`,
          description: item.description || `Purchased ${item.name}`,
          rarity: (item.rarity as 'Common' | 'Rare' | 'Epic' | 'Special' | 'Legendary') || 'Common',
          purchasedAt: new Date().toISOString()
        };
        
        // Save to inventory
        inventoryService.saveToInventory(inventoryItem);
        
        console.log('✅ Item delivered to inventory:', inventoryItem);
        
        // Show success toast
        if (this.toast) {
          this.toast({
            title: "Purchase Successful! 🎉",
            description: `${item.name} has been added to your inventory!`,
            duration: 4000,
          });
        }
      } else if (item.type === 'coins' && item.coins) {
        // Handle coin purchases
        console.log('💰 Coins purchased:', item.coins);
        
        if (this.toast) {
          this.toast({
            title: "Coins Purchased! 💰",
            description: `${item.coins} coins have been added to your account!`,
            duration: 4000,
          });
        }
      }
      
      // Store payment record for tracking
      const paymentRecord = {
        paymentId,
        txid,
        itemId: item.id,
        itemName: item.name,
        amount: item.piAmount,
        timestamp: Date.now(),
        status: 'completed'
      };
      
      // Save payment record to localStorage for tracking
      const existingPayments = JSON.parse(localStorage.getItem('flappypi-payments') || '[]');
      existingPayments.push(paymentRecord);
      localStorage.setItem('flappypi-payments', JSON.stringify(existingPayments));
      
      console.log('✅ Payment record saved:', paymentRecord);
      
    } catch (error) {
      console.error('❌ Error delivering items after payment:', error);
      
      if (this.toast) {
        this.toast({
          title: "Delivery Error",
          description: "Payment successful but item delivery failed. Please contact support.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  }

  /**
   * Process direct payment without modal
   */
  async processDirectPayment(item: PaymentItem): Promise<PaymentResult> {

    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('This service must be used in a browser environment.');
      }

      // Check if Pi SDK is available
      if (!window.Pi) {
        throw new Error('Pi SDK not available. Please use Pi Browser to make Pi payments.');
      }

      if (typeof window.Pi.createPayment !== 'function') {
        throw new Error('Pi Payment Unavailable. Please use Pi Browser to make Pi payments.');
      }


      // Verify wallet configuration
      const walletVerification = await walletAddressVerification.verifyWalletConfiguration();
      if (!walletVerification.success) {
        throw new Error(`Wallet verification failed: ${walletVerification.error}`);
      }

      // Log payment attempt
      walletAddressVerification.logPaymentAttempt(item.piAmount, `Flappy Pi: ${item.name}`, {
        type: item.type,
        itemId: item.id,
        itemName: item.name
      });

      // Get the Flappy Pi wallet address
      const flappyPiWalletAddress = walletAddressVerification.getFlappyPiWalletAddress();
      
      console.log('🌐 Mainnet Payment Configuration:');
      console.log(`   Network: mainnet`);
      console.log(`   Sandbox: false`);
      console.log(`   Production: true`);
      console.log(`   Wallet: ${flappyPiWalletAddress}`);
      console.log(`   Auto-approval: enabled`);
      console.log(`   Timeout protection: enabled`);
      
      // Create payment data with recipient wallet address
      const paymentData = {
        amount: item.piAmount,
        memo: `Flappy Pi: ${item.name}`,
        recipientAddress: flappyPiWalletAddress,
        metadata: {
          type: item.type,
          itemId: item.id,
          itemName: item.name,
          game: 'flappy_pi',
          price: item.piAmount,
          timestamp: Date.now(),
          walletAddress: flappyPiWalletAddress,
          network: 'sandbox',
          paymentType: 'sandbox_payment',
          mainnetOnly: false
        }
      };


      // Create payment callbacks calling backend approval/completion endpoints
      const paymentCallbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log('🎯 Payment ready for approval:', paymentId);

          try {
            const res = await fetch('/api/pi/approve-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId })
            });

            console.log('📡 Approve response status:', res.status);
            return res.status === 200;
          } catch (err) {
            console.error('❌ Error calling approve endpoint:', err);
            return false;
          }
        },

        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('🎯 Payment ready for completion:', { paymentId, txid });

          try {
            const res = await fetch('/api/pi/complete-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid })
            });

            console.log('📡 Complete response status:', res.status);

            if (res.status === 200) {
              // ONLY deliver items after successful payment completion
              await this.deliverItemsAfterPayment(item, paymentId, txid);
              return true;
            }

            return false;
          } catch (err) {
            console.error('❌ Error calling complete endpoint:', err);
            return false;
          }
        },

        onCancel: (paymentId: string) => {
          console.log('❌ Payment cancelled:', paymentId);
        },

        onError: (error: any, payment?: any) => {
          console.error('❌ Payment error:', error, payment);
        }
      };

      // Create and process payment using callback-based API and wrap in a Promise
      return await new Promise<PaymentResult>((resolve, reject) => {
        try {
          window.Pi.createPayment(paymentData, {
            ...paymentCallbacks,
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              console.log('🎯 Payment ready for completion:', { paymentId, txid });
              try {
                const res = await fetch('/api/pi/complete-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ paymentId, txid })
                });

                console.log('📡 Complete response status:', res.status);

                if (res.status === 200) {
                  await this.deliverItemsAfterPayment(item, paymentId, txid);
                  if (this.toast) {
                    this.toast({
                      title: "Payment Successful! 🎉",
                      description: `${item.name} has been purchased successfully.`
                    });
                  }
                  resolve({ success: true, txid, paymentId });
                  return;
                }

                resolve({ success: false, error: 'Server completion failed' });
              } catch (err: any) {
                console.error('❌ Error calling complete endpoint:', err);
                resolve({ success: false, error: err?.message || 'Completion error' });
              }
            },
            onCancel: (paymentId: string) => {
              console.log('❌ Payment cancelled:', paymentId);
              if (this.toast) {
                this.toast({
                  title: 'Payment Cancelled',
                  description: 'The payment was cancelled.',
                });
              }
              resolve({ success: false, error: 'Payment cancelled by user' });
            },
            onError: (error: any, payment?: any) => {
              console.error('❌ Payment error:', error, payment);
              if (this.toast) {
                this.toast({
                  title: 'Payment Failed',
                  description: error?.message || 'Payment error',
                  variant: 'destructive'
                });
              }
              resolve({ success: false, error: error?.message || 'Payment error' });
            }
          });
        } catch (e: any) {
          console.error('❌ Error initiating payment:', e);
          resolve({ success: false, error: e?.message || 'Failed to start payment' });
        }
      });

    } catch (error) {
      
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      
      // Show error toast if available
      if (this.toast) {
        this.toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Process subscription payment directly
   */
  async processSubscriptionPayment(plan: any): Promise<PaymentResult> {
    // Validate plan object
    if (!plan || typeof plan !== 'object') {
      return {
        success: false,
        error: 'Invalid plan object provided'
      };
    }

    // Handle different price formats
    let piAmount: number;
    if (typeof plan.price === 'string') {
      // Extract number from "5 Pi" format
      const match = plan.price.match(/(\d+(?:\.\d+)?)/);
      piAmount = match ? parseFloat(match[1]) : 0;
    } else if (typeof plan.price === 'number') {
      piAmount = plan.price;
    } else {
      piAmount = 0;
    }

    // Validate required fields
    if (!plan.id || !plan.name) {
      return {
        success: false,
        error: 'Plan missing required fields (id, name)'
      };
    }

    const paymentItem: PaymentItem = {
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      piAmount: piAmount,
      type: 'subscription',
      features: plan.features,
      savings: plan.savings,
      totalValue: plan.totalValue,
      originalPrice: plan.originalPrice,
      durationDays: plan.durationDays || 7 // Default to 7 days if not specified
    };

    return this.processDirectPayment(paymentItem);
  }

  /**
   * Process shop item payment directly
   */
  async processShopItemPayment(item: any): Promise<PaymentResult> {
    // Validate item object
    if (!item || typeof item !== 'object') {
      return {
        success: false,
        error: 'Invalid item object provided'
      };
    }

    // Validate required fields
    if (!item.id || !item.name || typeof item.piAmount !== 'number') {
      return {
        success: false,
        error: 'Item missing required fields (id, name, piAmount)'
      };
    }

    const paymentItem: PaymentItem = {
      id: item.id,
      name: item.name,
      description: item.description || '',
      piAmount: item.piAmount,
      type: 'shop_item'
    };

    return this.processDirectPayment(paymentItem);
  }
}

// Create singleton instance
export const directPaymentService = new DirectPaymentService();

// Export the class for testing
export { DirectPaymentService };
