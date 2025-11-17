// Fixed Hook for using the unified Pi payment modal
// Prevents infinite re-renders by using refs instead of state

import { useState, useCallback, useRef } from 'react';

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
  handlePaymentSuccess: (item: PaymentItem) => void;
  handlePaymentError: (error: string) => void;
}

export const useUnifiedPiPayment = (): UseUnifiedPiPaymentReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<PaymentItem | null>(null);
  
  // Use refs to store callbacks to prevent infinite re-renders
  const successCallbackRef = useRef<((item: PaymentItem) => void) | null>(null);
  const errorCallbackRef = useRef<((error: string) => void) | null>(null);

  const showPaymentModal = useCallback((item: PaymentItem) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentItem(null);
    successCallbackRef.current = null;
    errorCallbackRef.current = null;
  }, []);

  const handlePaymentSuccess = useCallback((item: PaymentItem) => {
    console.log('Payment successful for:', item);
    
    // Call success callback if provided
    if (successCallbackRef.current) {
      successCallbackRef.current(item);
    }

    // Close modal after a short delay
    setTimeout(() => {
      closeModal();
    }, 2000);
  }, [closeModal]);

  const handlePaymentError = useCallback((error: string) => {
    console.error('Payment error:', error);
    
    // Call error callback if provided
    if (errorCallbackRef.current) {
      errorCallbackRef.current(error);
    }
  }, []);

  const onPaymentSuccess = useCallback((callback: (item: PaymentItem) => void) => {
    successCallbackRef.current = callback;
  }, []);

  const onPaymentError = useCallback((callback: (error: string) => void) => {
    errorCallbackRef.current = callback;
  }, []);

  return {
    showPaymentModal,
    isModalOpen,
    currentItem,
    closeModal,
    onPaymentSuccess,
    onPaymentError,
    handlePaymentSuccess,
    handlePaymentError
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
