import { useState, useCallback } from 'react';
import { realPiPaymentService, PaymentItem, PaymentResult } from '../services/realPiPaymentService';
import { useToast } from './use-toast';
import { useWallet } from '../context/WalletContext';

export const useRealPiPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<PaymentItem | null>(null);
  const { toast } = useToast();
  const { addCoins } = useWallet();

  /**
   * Process a shop item payment
   */
  const processShopPayment = useCallback(async (item: PaymentItem): Promise<PaymentResult> => {
    setIsProcessing(true);
    setCurrentPayment(item);

    try {
      console.log('🛒 Starting shop payment for:', item.name);
      
      const result = await realPiPaymentService.processShopPayment(item);
      
      if (result.success) {
        // Show success message
        toast({
          title: 'Payment Successful! 🎉',
          description: `${item.name} has been added to your inventory!`,
        });

        // Update wallet if coins were purchased
        if (item.type === 'coins' && result.deliveredItems) {
          const coinItem = result.deliveredItems.find(d => d.type === 'coins');
          if (coinItem) {
            addCoins(coinItem.quantity, `Purchase: ${item.name}`);
          }
        }

        console.log('✅ Shop payment completed:', result);
      } else {
        // Show error message
        toast({
          title: 'Payment Failed',
          description: result.error || 'Payment could not be completed.',
          variant: 'destructive',
        });
      }

      return result;

    } catch (error) {
      console.error('❌ Shop payment error:', error);
      
      toast({
        title: 'Payment Error',
        description: error.message || 'An error occurred during payment.',
        variant: 'destructive',
      });

      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsProcessing(false);
      setCurrentPayment(null);
    }
  }, [toast, addCoins]);

  /**
   * Process a subscription plan payment
   */
  const processSubscriptionPayment = useCallback(async (plan: any): Promise<PaymentResult> => {
    setIsProcessing(true);
    setCurrentPayment({
      id: plan.id,
      name: plan.name,
      type: 'subscription',
      price: parseFloat(plan.price),
      description: plan.description,
    });

    try {
      console.log('📦 Starting subscription payment for:', plan.name);
      
      const result = await realPiPaymentService.processSubscriptionPayment(plan);
      
      if (result.success) {
        // Show success message
        toast({
          title: 'Subscription Activated! 🎉',
          description: `Welcome to ${plan.name}! Your subscription is now active.`,
        });

        // Update wallet if coins were included
        if (result.deliveredItems) {
          const coinItem = result.deliveredItems.find(d => d.type === 'coins');
          if (coinItem) {
            addCoins(coinItem.quantity, `Subscription Reward: ${plan.name}`);
          }
        }

        console.log('✅ Subscription payment completed:', result);
      } else {
        // Show error message
        toast({
          title: 'Subscription Failed',
          description: result.error || 'Subscription could not be activated.',
          variant: 'destructive',
        });
      }

      return result;

    } catch (error) {
      console.error('❌ Subscription payment error:', error);
      
      toast({
        title: 'Subscription Error',
        description: error.message || 'An error occurred during subscription.',
        variant: 'destructive',
      });

      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsProcessing(false);
      setCurrentPayment(null);
    }
  }, [toast, addCoins]);

  /**
   * Check if Pi SDK is available
   */
  const isPiAvailable = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.Pi !== 'undefined';
  }, []);

  /**
   * Get current payment status
   */
  const getPaymentStatus = useCallback(() => {
    return {
      isProcessing,
      currentPayment,
      isPiAvailable: isPiAvailable(),
    };
  }, [isProcessing, currentPayment, isPiAvailable]);

  return {
    // Payment functions
    processShopPayment,
    processSubscriptionPayment,
    
    // Status functions
    isPiAvailable,
    getPaymentStatus,
    
    // State
    isProcessing,
    currentPayment,
  };
}; 