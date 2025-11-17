import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useGameState } from '@/hooks/useGameState';
import { useWallet } from '@/context/WalletContext';
import { 
  unifiedShopPaymentService, 
  PaymentItem, 
  PaymentResult, 
  PaymentModalState 
} from '@/services/unifiedShopPaymentService';

export const useUnifiedPayment = () => {
  const { toast } = useToast();
  const { profile, updateProfile } = useUserProfile();
  const { setCoins } = useGameState();
  const { spendCoins } = useWallet();

  const [paymentModal, setPaymentModal] = useState<PaymentModalState>({
    type: null,
    item: null,
    loading: false,
    success: false,
    error: null
  });

  /**
   * Show payment modal for Pi payment
   */
  const showPiPaymentModal = useCallback((item: PaymentItem) => {
    unifiedShopPaymentService.showPaymentModal(item, setPaymentModal, 'pi');
  }, []);

  /**
   * Show payment modal for coin payment
   */
  const showCoinPaymentModal = useCallback((item: PaymentItem) => {
    unifiedShopPaymentService.showPaymentModal(item, setPaymentModal, 'coins');
  }, []);

  /**
   * Handle payment confirmation
   */
  const handlePaymentConfirmation = useCallback(async (): Promise<PaymentResult> => {
    return await unifiedShopPaymentService.handlePaymentConfirmation(
      paymentModal,
      setPaymentModal,
      profile,
      updateProfile,
      setCoins,
      spendCoins,
      toast
    );
  }, [paymentModal, profile, updateProfile, setCoins, spendCoins, toast]);

  /**
   * Close payment modal
   */
  const closePaymentModal = useCallback(() => {
    unifiedShopPaymentService.closePaymentModal(setPaymentModal);
  }, []);

  /**
   * Cancel payment
   */
  const cancelPayment = useCallback(() => {
    closePaymentModal();
  }, [closePaymentModal]);

  /**
   * Quick purchase with Pi (without modal)
   */
  const quickPiPurchase = useCallback(async (item: PaymentItem): Promise<PaymentResult> => {
    try {
      const result = await unifiedShopPaymentService.processPiPayment(
        item,
        profile,
        updateProfile,
        setCoins
      );

      if (result.success) {
        toast({
          title: 'Purchase Successful! 🎉',
          description: `${item.name} has been added to your inventory!`,
        });
      } else {
        toast({
          title: 'Purchase Failed',
          description: result.error || 'Purchase could not be completed.',
          variant: 'destructive',
        });
      }

      return result;
    } catch (error: any) {
      console.error('❌ Quick Pi purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Purchase could not be completed.',
        variant: 'destructive',
      });
      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  }, [profile, updateProfile, setCoins, toast]);

  /**
   * Quick purchase with coins (without modal)
   */
  const quickCoinPurchase = useCallback(async (item: PaymentItem): Promise<PaymentResult> => {
    try {
      const result = await unifiedShopPaymentService.processCoinPayment(
        item,
        profile,
        updateProfile,
        setCoins,
        spendCoins
      );

      if (result.success) {
        toast({
          title: 'Purchase Successful! 🎉',
          description: `${item.name} has been added to your inventory!`,
        });
      } else {
        toast({
          title: 'Purchase Failed',
          description: result.error || 'Purchase could not be completed.',
          variant: 'destructive',
        });
      }

      return result;
    } catch (error: any) {
      console.error('❌ Quick coin purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Purchase could not be completed.',
        variant: 'destructive',
      });
      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  }, [profile, updateProfile, setCoins, spendCoins, toast]);

  /**
   * Check if user can afford item with coins
   */
  const canAffordWithCoins = useCallback((item: PaymentItem): boolean => {
    const quantity = item.quantity || 1;
    const totalCost = (item.coinPrice || 0) * quantity;
    const currentCoins = profile?.total_coins || 0;
    return currentCoins >= totalCost;
  }, [profile]);

  /**
   * Get formatted price for display
   */
  const getFormattedPrice = useCallback((item: PaymentItem, paymentType: 'pi' | 'coins') => {
    const quantity = item.quantity || 1;
    if (paymentType === 'pi') {
      return `${item.piPrice * quantity} Pi`;
    } else {
      return `${(item.coinPrice || 0) * quantity} Coins`;
    }
  }, []);

  return {
    // State
    paymentModal,
    
    // Modal actions
    showPiPaymentModal,
    showCoinPaymentModal,
    handlePaymentConfirmation,
    closePaymentModal,
    cancelPayment,
    
    // Quick purchase actions
    quickPiPurchase,
    quickCoinPurchase,
    
    // Utility functions
    canAffordWithCoins,
    getFormattedPrice,
    
    // Derived state
    isPaymentModalOpen: !!paymentModal.item,
    isProcessing: paymentModal.loading,
    hasError: !!paymentModal.error,
    isSuccess: paymentModal.success
  };
};
