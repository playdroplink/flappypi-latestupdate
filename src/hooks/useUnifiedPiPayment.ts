// Hook for using the unified Pi payment modal
// Works for both shop items and subscription plans

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PaymentItem {
  id: string;
  name: string;
  description: string;
  piAmount: number;
  image?: string;
  type: 'subscription' | 'shop_item';
  features?: string[];
  savings?: string;
  totalValue?: number;
  originalPrice?: number;
}

interface UseUnifiedPiPaymentReturn {
  showPaymentModal: (item: PaymentItem) => void;
  isModalOpen: boolean;
  currentItem: PaymentItem | null;
  closeModal: () => void;
  onPaymentSuccess: (callback: (item: PaymentItem) => void) => void;
  onPaymentError: (callback: (error: string) => void) => void;
}

export const useUnifiedPiPayment = (): UseUnifiedPiPaymentReturn => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<PaymentItem | null>(null);
  const [successCallback, setSuccessCallback] = useState<((item: PaymentItem) => void) | null>(null);
  const [errorCallback, setErrorCallback] = useState<((error: string) => void) | null>(null);

  const showPaymentModal = useCallback((item: PaymentItem) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setSuccessCallback(null);
    setErrorCallback(null);
  }, []);

  const handlePaymentSuccess = useCallback((item: PaymentItem) => {
    console.log('Payment successful for:', item);
    
    // Call success callback if provided
    if (successCallback) {
      successCallback(item);
    }

    // Handle different item types
    if (item.type === 'subscription') {
      // Handle subscription purchase
      console.log('Subscription purchased:', item);
      // Add subscription logic here
    } else if (item.type === 'shop_item') {
      // Handle shop item purchase
      console.log('Shop item purchased:', item);
      // Add shop item logic here
    }

    // Close modal after a short delay
    setTimeout(() => {
      closeModal();
    }, 2000);
  }, [successCallback, closeModal]);

  const handlePaymentError = useCallback((error: string) => {
    console.error('Payment error:', error);
    
    // Call error callback if provided
    if (errorCallback) {
      errorCallback(error);
    }
  }, [errorCallback]);

  const onPaymentSuccess = useCallback((callback: (item: PaymentItem) => void) => {
    setSuccessCallback(() => callback);
  }, []);

  const onPaymentError = useCallback((callback: (error: string) => void) => {
    setErrorCallback(() => callback);
  }, []);

  return {
    showPaymentModal,
    isModalOpen,
    currentItem,
    closeModal,
    onPaymentSuccess,
    onPaymentError
  };
};

// Helper functions to create payment items
export const createSubscriptionPaymentItem = (
  id: string,
  name: string,
  description: string,
  piAmount: number,
  features: string[] = [],
  savings?: string,
  totalValue?: number,
  originalPrice?: number
): PaymentItem => ({
  id,
  name,
  description,
  piAmount,
  type: 'subscription',
  features,
  savings,
  totalValue,
  originalPrice
});

export const createShopItemPaymentItem = (
  id: string,
  name: string,
  description: string,
  piAmount: number,
  image?: string
): PaymentItem => ({
  id,
  name,
  description,
  piAmount,
  type: 'shop_item',
  image
});

// Example usage:
/*
const { showPaymentModal, isModalOpen, currentItem, closeModal } = useUnifiedPiPayment();

// For subscription plans
const handleSubscriptionPurchase = (plan: any) => {
  const paymentItem = createSubscriptionPaymentItem(
    plan.id,
    plan.name,
    plan.description,
    plan.price,
    plan.features,
    plan.savings,
    plan.totalValue,
    plan.originalPrice
  );
  showPaymentModal(paymentItem);
};

// For shop items
const handleShopItemPurchase = (item: any) => {
  const paymentItem = createShopItemPaymentItem(
    item.id,
    item.name,
    item.description,
    item.piPrice,
    item.image
  );
  showPaymentModal(paymentItem);
};
*/
