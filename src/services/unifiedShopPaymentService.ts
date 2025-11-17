import { useToast } from '@/components/ui/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useGameState } from '@/hooks/useGameState';
import { useWallet } from '@/context/WalletContext';

export interface PaymentItem {
  id: string;
  name: string;
  type: 'character' | 'coins' | 'power-up' | 'mystery-box' | 'bundle' | 'subscription';
  piPrice: number;
  coinPrice?: number;
  quantity?: number;
  image?: string;
  description?: string;
  coins?: number;
  skinId?: string;
  metadata?: any;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  txid?: string;
  paymentId?: string;
  deliveredItems?: any[];
}

export interface PaymentModalState {
  type: 'pi' | 'coins' | null;
  item: PaymentItem | null;
  loading: boolean;
  success: boolean;
  error: string | null;
}

export class UnifiedShopPaymentService {
  private static instance: UnifiedShopPaymentService;

  public static getInstance(): UnifiedShopPaymentService {
    if (!UnifiedShopPaymentService.instance) {
      UnifiedShopPaymentService.instance = new UnifiedShopPaymentService();
    }
    return UnifiedShopPaymentService.instance;
  }

  /**
   * Process a Pi payment for any shop item
   */
  async processPiPayment(item: PaymentItem, profile: any, updateProfile: any, setCoins: any): Promise<PaymentResult> {
    try {
      console.log('🛒 Processing Pi payment for:', item.name);
      
      if (typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not available. Please use Pi Browser.');
      }
      
      if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
        throw new Error('Pi Payment Unavailable. Please use Pi Browser to make Pi payments.');
      }

      const quantity = item.quantity || 1;
      const totalPrice = item.piPrice * quantity;

      console.log(`🎯 Initiating shop payment for ${item.name} - ${totalPrice} Pi`);

      // Create Pi payment
      const paymentData = {
        amount: totalPrice,
        memo: `Flappy Pi Shop: ${item.name}`,
        metadata: {
          type: 'shop_purchase',
          itemId: item.id,
          itemName: item.name,
          itemType: item.type,
          quantity: quantity,
          game: 'flappy_pi',
          price: totalPrice,
          timestamp: Date.now(),
          ...item.metadata
        }
      };

      return new Promise((resolve, reject) => {
        const paymentCallbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log('🎯 Shop payment ready for approval:', paymentId);
            
            try {
              // Call backend approval
              await fetch('/api/pi/approve-payment', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${profile.access_token}`
                },
                body: JSON.stringify({ 
                  paymentId,
                  metadata: paymentData.metadata 
                }),
              });
              console.log('✅ Shop payment approved');
            } catch (error) {
              console.error('❌ Shop payment approval failed:', error);
              reject(new Error('Failed to approve payment. Please try again.'));
            }
          },

          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log('🎯 Shop payment ready for completion:', paymentId, txid);
            
            try {
              // Call backend completion
              await fetch('/api/pi/complete-payment', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${profile.access_token}`
                },
                body: JSON.stringify({ 
                  paymentId, 
                  txid,
                  metadata: paymentData.metadata 
                }),
              });
              console.log('✅ Shop payment completed');

              // Add rewards with exact quantity
              if (item.type === 'coins' && item.coins) {
                // Add coins directly to profile
                const newCoinBalance = (profile.total_coins || 0) + (item.coins * quantity);
                updateProfile({ total_coins: newCoinBalance });
                setCoins(newCoinBalance);
              }

              resolve({
                success: true,
                txid,
                paymentId,
                deliveredItems: [{
                  type: item.type,
                  id: item.id,
                  name: item.name,
                  quantity: quantity,
                  coins: item.coins
                }]
              });
            } catch (error) {
              console.error('❌ Shop payment completion failed:', error);
              reject(new Error('Failed to complete payment. Please try again.'));
            }
          },

          onCancel: (paymentId: string) => {
            console.log('❌ Shop payment cancelled:', paymentId);
            reject(new Error('Payment was cancelled'));
          },

          onError: (error: any, payment?: any) => {
            console.error('❌ Shop payment error:', error, payment);
            reject(new Error(error.message || 'Payment failed'));
          }
        };

        // Create payment using Pi SDK
        window.Pi.createPayment(paymentData, paymentCallbacks);
      });

    } catch (error: any) {
      console.error('❌ Payment processing error:', error);
      return {
        success: false,
        error: error.message || 'Payment failed'
      };
    }
  }

  /**
   * Process a coin payment for any shop item
   */
  async processCoinPayment(item: PaymentItem, profile: any, updateProfile: any, setCoins: any, spendCoins: any): Promise<PaymentResult> {
    try {
      console.log('🪙 Processing coin payment for:', item.name);
      
      const quantity = item.quantity || 1;
      const totalCost = (item.coinPrice || 0) * quantity;
      const currentCoins = profile.total_coins || 0;

      if (currentCoins < totalCost) {
        throw new Error('Insufficient coins');
      }

      // Deduct coins
      const newCoinBalance = currentCoins - totalCost;
      updateProfile({ total_coins: newCoinBalance });
      setCoins(newCoinBalance);
      spendCoins(totalCost, `Purchase: ${item.name}`);

      // Add rewards if applicable
      if (item.type === 'coins' && item.coins) {
        const rewardCoins = item.coins * quantity;
        const finalBalance = newCoinBalance + rewardCoins;
        updateProfile({ total_coins: finalBalance });
        setCoins(finalBalance);
      }

      return {
        success: true,
        deliveredItems: [{
          type: item.type,
          id: item.id,
          name: item.name,
          quantity: quantity,
          coins: item.coins
        }]
      };

    } catch (error: any) {
      console.error('❌ Coin payment error:', error);
      return {
        success: false,
        error: error.message || 'Coin payment failed'
      };
    }
  }

  /**
   * Show payment modal for any shop item
   */
  showPaymentModal(
    item: PaymentItem,
    setPaymentModal: React.Dispatch<React.SetStateAction<PaymentModalState>>,
    paymentType: 'pi' | 'coins'
  ) {
    setPaymentModal({
      type: paymentType,
      item: item,
      loading: false,
      success: false,
      error: null
    });
  }

  /**
   * Handle payment confirmation
   */
  async handlePaymentConfirmation(
    paymentModal: PaymentModalState,
    setPaymentModal: React.Dispatch<React.SetStateAction<PaymentModalState>>,
    profile: any,
    updateProfile: any,
    setCoins: any,
    spendCoins: any,
    toast: any
  ): Promise<PaymentResult> {
    if (!paymentModal.item || !profile) {
      return { success: false, error: 'Invalid payment data' };
    }

    setPaymentModal((prev) => ({ ...prev, loading: true, error: null }));

    try {
      let result: PaymentResult;

      if (paymentModal.type === 'pi') {
        result = await this.processPiPayment(paymentModal.item, profile, updateProfile, setCoins);
      } else if (paymentModal.type === 'coins') {
        result = await this.processCoinPayment(paymentModal.item, profile, updateProfile, setCoins, spendCoins);
      } else {
        throw new Error('Invalid payment type');
      }

      if (result.success) {
        setPaymentModal((prev) => ({ ...prev, loading: false, success: true }));
        
        toast({
          title: 'Payment Successful! 🎉',
          description: `${paymentModal.item.name} has been added to your inventory!`,
        });

        return result;
      } else {
        setPaymentModal((prev) => ({ ...prev, loading: false, error: result.error || 'Payment failed' }));
        
        toast({
          title: 'Payment Failed',
          description: result.error || 'Payment could not be completed.',
          variant: 'destructive',
        });

        return result;
      }

    } catch (error: any) {
      console.error('❌ Payment confirmation error:', error);
      
      setPaymentModal((prev) => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Payment failed' 
      }));

      toast({
        title: 'Payment Failed',
        description: error.message || 'Payment could not be completed.',
        variant: 'destructive',
      });

      return {
        success: false,
        error: error.message || 'Payment failed'
      };
    }
  }

  /**
   * Close payment modal
   */
  closePaymentModal(setPaymentModal: React.Dispatch<React.SetStateAction<PaymentModalState>>) {
    setPaymentModal({
      type: null,
      item: null,
      loading: false,
      success: false,
      error: null
    });
  }
}

// Export singleton instance
export const unifiedShopPaymentService = UnifiedShopPaymentService.getInstance();
