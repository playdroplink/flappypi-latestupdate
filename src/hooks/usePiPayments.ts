import { useState, useEffect } from 'react';
import { useUserProfile } from './useUserProfile';
import { piNetworkService } from '@/services/piNetworkService';
// import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'; // Comment out Supabase import

interface Payment {
  identifier: string;
  amount: number;
  memo: string;
  uid: string;
  status: 'succeeded' | 'failed' | 'user_canceled' | 'pending';
  timestamp: number;
  transaction_id?: string;
}

export const usePiPayments = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const { profile } = useUserProfile();
  // const [step, setStep] = useState<'splash' | 'login' | 'postLoginSplash' | 'home'>('splash'); // Removed
  // const [piUser, setPiUser] = useState(null); // Removed

  // Authenticate user with real Pi SDK
  const authenticateUser = async (): Promise<boolean> => {
    try {
      setIsProcessing(true);
      if (piNetworkService.isUserAuthenticated()) {
        return true;
      }
      const user = await piNetworkService.authenticate();
      return !!user;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Purchase bird skin with real Pi SDK
  const purchaseBirdSkin = async (skinId: string, amount: number) => {
    try {
      setIsProcessing(true);
      const paymentId = await piNetworkService.purchaseBirdSkin(skinId, `Flappy Pi - ${skinId} Bird Skin`);
      // You may want to fetch payment status from your backend after Pi SDK returns
      return { success: true, payment: { identifier: paymentId, amount, memo: `Bird Skin: ${skinId}`, uid: profile?.id || '', status: 'pending', timestamp: Date.now() } };
    } catch (error) {
      console.error('Bird skin purchase failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Purchase failed' };
    } finally {
      setIsProcessing(false);
    }
  };

  // Purchase ad-free subscription with real Pi SDK
  const purchaseAdFreeSubscription = async () => {
    try {
      setIsProcessing(true);
      const paymentId = await piNetworkService.purchaseAdRemoval();
      return { success: true, payment: { identifier: paymentId, amount: 10, memo: 'Ad-Free Subscription', uid: profile?.id || '', status: 'pending', timestamp: Date.now() } };
    } catch (error) {
      console.error('Subscription purchase failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Purchase failed' };
    } finally {
      setIsProcessing(false);
    }
  };

  // General Pi payment with real Pi SDK
  const purchaseWithPi = async (amount: number, memo: string, metadata: any = {}) => {
    try {
      setIsProcessing(true);
      const paymentId = await piNetworkService.createPayment(amount, memo, metadata);
      return { success: true, payment: { identifier: paymentId, amount, memo, uid: profile?.id || '', status: 'pending', timestamp: Date.now() } };
    } catch (error) {
      console.error('General payment failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Payment failed' };
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if Pi Network is available
  const isPiAvailable = (): boolean => {
    return typeof window !== 'undefined' && !!window.Pi && piNetworkService.isUserAuthenticated();
  };

  // Payment history (optional, for dev tools)
  const getPaymentHistory = () => null;

  // 1. Initial Splash (8s) - Logic moved to App.tsx
  // useEffect(() => {
  //   if (step === 'splash') {
  //     const timer = setTimeout(() => setStep('login'), 8000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [step]);

  // 2. Pi Login Handler - Logic moved to useUserProfile.tsx
  // const handlePiLogin = async () => {
  //   if (window.Pi) {
  //     try {
  //       const authRes = await window.Pi.authenticate(['username', 'payments', 'wallet_address'], () => {});
  //       if (authRes && authRes.accessToken) {
  //         setPiUser(authRes);
  //         setStep('postLoginSplash');
  //       }
  //     } catch (e) {
  //       // handle error
  //     }
  //   }
  // };

  // 3. Post-Login Splash (8s) - Logic moved to App.tsx
  // useEffect(() => {
  //   if (step === 'postLoginSplash') {
  //     const timer = setTimeout(() => setStep('home'), 8000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [step]);

  // 4. Render logic (REMOVE ALL JSX RETURNS) - Not applicable here

  return {
    authenticateUser,
    purchaseBirdSkin,
    purchaseAdFreeSubscription,
    purchaseWithPi,
    isProcessing,
    lastPayment,
    currentPiUserId: profile?.id,
    getPaymentHistory,
    isPiAvailable,
    // step, // Removed
    // setStep, // Removed
    // piUser, // Removed
    // setPiUser, // Removed
    // handlePiLogin // Removed
  };
};
