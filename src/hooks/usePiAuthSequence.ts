import { useState, useCallback, useEffect } from 'react';
import { 
  piAuthSequence, 
  PiAuthSequenceConfig, 
  PiAuthSequenceResult 
} from '../services/piAuthSequence';

export interface PiAuthSequenceState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  user: any;
  error: string | null;
  step: string | null;
}

export interface PiAuthSequenceActions {
  authenticate: (config?: PiAuthSequenceConfig) => Promise<PiAuthSequenceResult>;
  logout: () => void;
  clearError: () => void;
}

export const usePiAuthSequence = (): PiAuthSequenceState & PiAuthSequenceActions => {
  const [state, setState] = useState<PiAuthSequenceState>({
    isAuthenticated: false,
    isAuthenticating: false,
    user: null,
    error: null,
    step: null
  });

  // Initialize state from localStorage on mount
  useEffect(() => {
    const status = piAuthSequence.getAuthStatus();
    setState(prev => ({
      ...prev,
      isAuthenticated: status.isAuthenticated,
      user: status.user
    }));
  }, []);

  // Authenticate function
  const authenticate = useCallback(async (config?: PiAuthSequenceConfig): Promise<PiAuthSequenceResult> => {
    setState(prev => ({
      ...prev,
      isAuthenticating: true,
      error: null,
      step: 'starting'
    }));

    try {
      const result = await piAuthSequence.authenticate(config);
      
      if (result.success && result.user) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          isAuthenticating: false,
          user: result.user,
          error: null,
          step: result.step || 'complete'
        }));
      } else {
        setState(prev => ({
          ...prev,
          isAuthenticating: false,
          error: result.error || 'Authentication failed',
          step: result.step || 'error'
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        error: errorMessage,
        step: 'error'
      }));
      
      return {
        success: false,
        error: errorMessage,
        step: 'error'
      };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    piAuthSequence.logout();
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      user: null,
      error: null,
      step: null
    }));
  }, []);

  // Clear error function
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
    clearError
  };
};

// Hook for automatic authentication on mount
export const usePiAutoAuthSequence = (autoAuth: boolean = true, config?: PiAuthSequenceConfig) => {
  const auth = usePiAuthSequence();
  
  useEffect(() => {
    if (autoAuth && !auth.isAuthenticated && !auth.isAuthenticating) {
      const status = piAuthSequence.getAuthStatus();
      if (status.isPiBrowser) {
        console.log('🔄 Auto-authenticating with Pi Sequence...');
        auth.authenticate(config);
      }
    }
  }, [autoAuth, auth.isAuthenticated, auth.isAuthenticating, auth.authenticate, config]);

  return auth;
}; 