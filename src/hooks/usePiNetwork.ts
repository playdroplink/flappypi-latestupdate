import { useState, useEffect, useCallback } from 'react';
import { piAuth, piPayment, Pi } from '../config/piSDK';
import { PI_CONFIG } from '../config/piConfig';

export interface PiUser {
  uid: string;
  username: string;
  accessToken: string;
}

export interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: any;
  to_address: string;
  created_at: string;
  status: 'pending' | 'completed' | 'failed';
}

export const usePiNetwork = () => {
  const [user, setUser] = useState<PiUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUser = piAuth.currentUser();
        const authenticated = piAuth.isAuthenticated();
        
        setUser(currentUser);
        setIsAuthenticated(authenticated);
        
        console.log('🔍 Pi Network Auth Check:', {
          isAuthenticated: authenticated,
          hasUser: !!currentUser,
          networkMode: PI_CONFIG.getNetworkMode(),
          sandboxMode: PI_CONFIG.getSandboxSetting()
        });
      } catch (error) {
        console.error('Error checking Pi authentication:', error);
        setError('Failed to check authentication status');
      }
    };

    checkAuth();
  }, []);

  // Authenticate user
  const authenticate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Starting Pi authentication on testnet...');
      const authResult = await piAuth.authenticate();
      setUser(authResult.user);
      setIsAuthenticated(true);
      console.log('✅ Pi authentication successful on testnet');
      return authResult;
    } catch (error: any) {
      const errorMessage = error?.message || 'Authentication failed';
      console.error('❌ Pi authentication failed on testnet:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign out user
  const signOut = useCallback(() => {
    try {
      piAuth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      console.log('👋 Pi user signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  }, []);

  // Create payment
  const createPayment = useCallback(async (amount: number, memo: string, metadata?: any) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to create payments');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('💰 Creating Pi payment on testnet:', { amount, memo, metadata });
      const payment = await piPayment.createPayment(amount, memo, metadata);
      console.log('✅ Pi payment created successfully on testnet');
      return payment;
    } catch (error: any) {
      const errorMessage = error?.message || 'Payment creation failed';
      console.error('❌ Pi payment creation failed on testnet:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Complete payment
  const completePayment = useCallback(async (paymentId: string, txid: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('✅ Completing Pi payment on mainnet:', { paymentId, txid });
      const result = await piPayment.completePayment(paymentId, txid);
              console.log('✅ Pi payment completed successfully on mainnet');
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Payment completion failed';
      console.error('❌ Pi payment completion failed on testnet:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    authenticate,
    signOut,
    createPayment,
    completePayment,
    clearError,
    networkMode: PI_CONFIG.getNetworkMode(),
    isMainnet: PI_CONFIG.shouldUseMainnet()
  };
}; 