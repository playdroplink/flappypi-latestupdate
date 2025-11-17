// Pi Authentication Hook for React Components
// Provides easy access to Pi authentication state and functions

import { useState, useEffect, useCallback } from 'react';
import { piAuthMobile, PiAuthConfig, PiAuthResult } from '../utils/piAuthMobile';

export interface PiAuthState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  user: any | null;
  error: string | null;
  authStatus: {
    isPiBrowser: boolean;
    isSDKAvailable: boolean;
    isInitialized: boolean;
    isAuthenticated: boolean;
    authInProgress: boolean;
    retryCount: number;
  };
}

export interface PiAuthActions {
  authenticate: (config?: PiAuthConfig) => Promise<PiAuthResult>;
  logout: () => void;
  refreshAuth: () => Promise<PiAuthResult>;
  clearError: () => void;
}

export const usePiAuth = (): PiAuthState & PiAuthActions => {
  const [state, setState] = useState<PiAuthState>({
    isAuthenticated: false,
    isAuthenticating: false,
    user: null,
    error: null,
    authStatus: {
      isPiBrowser: false,
      isSDKAvailable: false,
      isInitialized: false,
      isAuthenticated: false,
      authInProgress: false,
      retryCount: 0
    }
  });

  // Update auth status on mount and when needed
  useEffect(() => {
    const updateAuthStatus = () => {
      const authStatus = piAuthMobile.getAuthStatus();
      const currentUser = piAuthMobile.getCurrentUser();
      
      setState(prev => ({
        ...prev,
        isAuthenticated: authStatus.isAuthenticated,
        user: currentUser,
        authStatus
      }));
    };

    // Update immediately
    updateAuthStatus();

    // Set up interval to check auth status
    const interval = setInterval(updateAuthStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  // Authenticate function
  const authenticate = useCallback(async (config?: PiAuthConfig): Promise<PiAuthResult> => {
    setState(prev => ({
      ...prev,
      isAuthenticating: true,
      error: null
    }));

    try {
      const result = await piAuthMobile.authenticate(config);
      
      if (result.success && result.user) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          isAuthenticating: false,
          user: result.user,
          error: null,
          authStatus: piAuthMobile.getAuthStatus()
        }));
      } else {
        setState(prev => ({
          ...prev,
          isAuthenticating: false,
          error: result.error || 'Authentication failed',
          authStatus: piAuthMobile.getAuthStatus()
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        error: errorMessage,
        authStatus: piAuthMobile.getAuthStatus()
      }));
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    piAuthMobile.clearAuth();
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      user: null,
      error: null,
      authStatus: piAuthMobile.getAuthStatus()
    }));
  }, []);

  // Refresh authentication
  const refreshAuth = useCallback(async (): Promise<PiAuthResult> => {
    return authenticate({
      scopes: ['username', 'payments', 'wallet_address'],
      maxRetries: 2,
      retryDelay: 500,
      timeout: 15000,
      enablePayments: true,
      enableAds: false
    });
  }, [authenticate]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    ...state,
    authenticate,
    logout,
    refreshAuth,
    clearError
  };
};

// Convenience hook for checking if user is authenticated
export const usePiAuthStatus = () => {
  const { isAuthenticated, user, authStatus } = usePiAuth();
  
  return {
    isAuthenticated,
    user,
    isPiBrowser: authStatus.isPiBrowser,
    isSDKAvailable: authStatus.isSDKAvailable,
    isInitialized: authStatus.isInitialized
  };
};

// Hook for automatic authentication on mount
export const usePiAutoAuth = (autoAuth: boolean = true) => {
  const auth = usePiAuth();
  
  useEffect(() => {
    if (autoAuth && !auth.isAuthenticated && !auth.isAuthenticating && auth.authStatus.isPiBrowser) {
      console.log('🔄 Auto-authenticating with Pi...');
      auth.authenticate({
        scopes: ['username', 'payments', 'wallet_address'],
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 30000,
        enablePayments: true,
        enableAds: false
      });
    }
  }, [autoAuth, auth.isAuthenticated, auth.isAuthenticating, auth.authStatus.isPiBrowser, auth.authenticate]);

  return auth;
}; 