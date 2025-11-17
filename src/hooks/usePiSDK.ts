// Pi SDK React Hook - Official Integration for Testnet Mode
// Following the official Pi Network Client SDK reference documentation

import { useState, useEffect, useCallback } from 'react';
import { piSDKService, AuthResult, PaymentData, PaymentCallbacks, PaymentResult } from '../services/piSDKService';

export interface UsePiSDKReturn {
  // Authentication
  authenticate: (scopes?: string[]) => Promise<{ success: boolean; user?: AuthResult['user']; error?: string; accessToken?: string }>;
  signOut: () => void;
  
  // State
  isLoading: boolean;
  error: string | null;
  user: AuthResult['user'] | null;
  isAuthenticated: boolean;
  
  // Payments
  createPayment: (paymentData: PaymentData, callbacks: PaymentCallbacks) => Promise<PaymentResult>;
  
  // Utilities
  isPiBrowser: boolean;
  currentUser: AuthResult['user'] | null;
}

export const usePiSDK = (): UsePiSDKReturn => {
  const [user, setUser] = useState<AuthResult['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize SDK and check authentication status on mount
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        setIsLoading(true);
        await piSDKService.initialize();
        
        // Check if user is already authenticated
        const currentUser = piSDKService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize Pi SDK');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSDK();
  }, []);

  // Authentication function
  const authenticate = useCallback(async (scopes: string[] = ['payments', 'username']): Promise<{ success: boolean; user?: AuthResult['user']; error?: string; accessToken?: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await piSDKService.authenticate(scopes);
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        console.log('🔐 Authentication completed successfully');
      } else {
        setError(result.error || 'Authentication failed');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign out function
  const signOut = useCallback(() => {
    piSDKService.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    console.log('👋 User signed out');
  }, []);

  // Create payment function
  const createPayment = useCallback(async (paymentData: PaymentData, callbacks: PaymentCallbacks): Promise<PaymentResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await piSDKService.createPayment(paymentData, callbacks);
      
      if (!result.success) {
        setError(result.error || 'Payment creation failed');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment creation failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Authentication
    authenticate,
    signOut,
    
    // State
    isLoading,
    error,
    user,
    isAuthenticated,
    
    // Payments
    createPayment,
    
    // Utilities
    isPiBrowser: piSDKService.isPiSDKAvailable(),
    currentUser: user
  };
};

// Convenience hook for authentication only
export const usePiAuth = () => {
  const { user, isAuthenticated, isLoading, error, authenticate, signOut, clearError } = usePiSDK();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    authenticate,
    signOut,
    clearError
  };
};

// Convenience hook for payments only
export const usePiPayments = () => {
  const { user, isAuthenticated, createPayment, error, clearError } = usePiSDK();
  
  return {
    user,
    isAuthenticated,
    createPayment,
    error,
    clearError
  };
};

// Convenience hook for ads only
export const usePiAds = () => {
  const { showAd, isAdReady, requestAd } = usePiSDK();
  
  return {
    showAd,
    isAdReady,
    requestAd
  };
};

// Hook for checking Pi Browser environment
export const usePiEnvironment = () => {
  const { isSDKAvailable, isPiBrowser, status, getNativeFeatures } = usePiSDK();
  
  return {
    isSDKAvailable,
    isPiBrowser,
    status,
    getNativeFeatures
  };
}; 