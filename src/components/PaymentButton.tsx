// Pi Network Payment Button Component
// Based on the comprehensive Pi Network Payment Integration Guide

import React, { useState, useEffect } from 'react';
import { piAuthService } from '../services/piAuthService';
import { piPaymentService } from '../services/piPaymentService';
import { errorHandler } from '../utils/errorHandler';

interface PaymentButtonProps {
  amount: number;
  memo: string;
  metadata?: Record<string, any>;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  memo,
  metadata = {},
  onSuccess,
  onError,
  className = '',
  children
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      if (piAuthService.isAuthenticated()) {
        setUser(piAuthService.getCurrentUser());
      }
    };
    
    checkAuth();
    
    // Listen for authentication events
    window.addEventListener('piUserAuthenticated', checkAuth);
    return () => window.removeEventListener('piUserAuthenticated', checkAuth);
  }, []);

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Ensure user is authenticated
      if (!piAuthService.isAuthenticated()) {
        await piAuthService.authenticateUser();
        setUser(piAuthService.getCurrentUser());
      }

      // Create payment
      const result = await piPaymentService.createPayment({
        amount,
        memo,
        metadata
      });

      if (result.success) {
        console.log('✅ Payment successful:', result);
        if (onSuccess) onSuccess(result);
      } else {
        console.error('❌ Payment failed:', result.error);
        const errorMessage = errorHandler.handlePaymentError(result.error);
        if (onError) onError(errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      const errorMessage = errorHandler.handlePaymentError(error);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const user = await piAuthService.authenticateUser();
      setUser(user);
    } catch (error: any) {
      console.error('❌ Authentication failed:', error);
      const errorMessage = errorHandler.handleAuthError(error);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <button 
        onClick={handleSignIn}
        disabled={isLoading}
        className={`pi-sign-in-button ${className}`}
      >
        {isLoading ? 'Signing in...' : 'Sign in to Flappy Pi'}
      </button>
    );
  }

  return (
    <button 
      onClick={handlePayment}
      disabled={isLoading}
      className={`pi-payment-button ${className}`}
    >
      {isLoading ? 'Processing...' : (children || `Pay ${amount} π`)}
    </button>
  );
};
