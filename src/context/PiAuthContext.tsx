import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import piSDKService from '../services/piSDKService';

interface PiUser {
  uid: string;
  username: string;
  name?: string;
  id?: string;
  avatar?: string;
  isPiAuth?: boolean;
  [key: string]: any; // Allow additional properties
}

interface PiAuthContextType {
  user: PiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (scopes?: string[]) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  autoLogin: () => Promise<void>;
  syncExistingPiUser: () => Promise<boolean>;
  isAutoLoginEnabled: boolean;
  enableAutoLogin: () => void;
  disableAutoLogin: () => void;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

export const usePiAuth = () => {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error('usePiAuth must be used within a PiAuthProvider');
  }
  return context;
};

interface PiAuthProviderProps {
  children: ReactNode;
}

export const PiAuthProvider: React.FC<PiAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<PiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [piService] = useState(() => piSDKService);
  const [isAutoLoginEnabled, setIsAutoLoginEnabled] = useState(() => {
    // Auto-login disabled by default for manual sign-in
    return false;
  });

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.log('⚠️ Authentication timeout - using fallback');
          setIsLoading(false);
        }, 10000); // 10 second timeout

        console.log('🔍 Checking authentication status...');

        // Check if we're in sandbox environment
        const isSandbox = window.location.hostname.includes('sandbox.minepi.com');
        const isPiNet = window.location.hostname.includes('pinet.com');
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        console.log('🧪 Environment detected:', { isSandbox, isPiNet, isLocalhost });

        // Development bypass for sandbox environment
        if (isSandbox && !window.Pi) {
          console.log('🧪 Sandbox environment detected without Pi SDK - using development bypass');
          clearTimeout(timeoutId);
          setUser({
            uid: 'dev-user-123',
            username: 'SandboxUser',
            name: 'Sandbox User',
            isPiAuth: true
          });
          setIsLoading(false);
          return;
        }

        // Initialize Pi SDK
        const initialized = await piService.initialize();
        if (!initialized) {
          console.warn('⚠️ Pi SDK initialization failed');
          clearTimeout(timeoutId);
          setIsLoading(false);
          return;
        }

        // Check if user is already authenticated
        const currentUser = piService.getCurrentUser();
        const isAuthenticated = piService.isAuthenticated();
        
        // ENHANCED SANDBOX SUPPORT - Check window.Pi directly
        let sandboxUser = null;
        let sandboxAuthenticated = false;
        
        if ((isSandbox || isPiNet || isLocalhost) && typeof window !== 'undefined' && window.Pi) {
          try {
            console.log('🧪 Checking window.Pi directly for sandbox/PiNet/localhost...');
            
            // Method 1: window.Pi.currentUser() function
            if (typeof window.Pi.currentUser === 'function') {
              try {
                sandboxUser = window.Pi.currentUser();
                sandboxAuthenticated = sandboxUser && sandboxUser.uid;
                console.log('🧪 window.Pi.currentUser() result:', sandboxUser);
              } catch (error) {
                console.warn('⚠️ window.Pi.currentUser() failed:', error);
              }
            }
            
            // Method 2: window.Pi.currentUser property
            if (!sandboxUser && window.Pi.currentUser && typeof window.Pi.currentUser === 'object') {
              sandboxUser = window.Pi.currentUser;
              sandboxAuthenticated = sandboxUser && sandboxUser.uid;
              console.log('🧪 window.Pi.currentUser property result:', sandboxUser);
            }
            
            // Method 3: Check if user is already authenticated in window.Pi
            if (!sandboxUser && window.Pi.user) {
              sandboxUser = window.Pi.user;
              sandboxAuthenticated = sandboxUser && sandboxUser.uid;
              console.log('🧪 window.Pi.user result:', sandboxUser);
            }
            
            // Method 4: Check if there's a stored pi_user in localStorage
            if (!sandboxUser) {
              try {
                const storedPiUser = localStorage.getItem('pi_user');
                if (storedPiUser) {
                  const parsedUser = JSON.parse(storedPiUser);
                  if (parsedUser && parsedUser.uid) {
                    sandboxUser = parsedUser;
                    sandboxAuthenticated = true;
                    console.log('🧪 Found stored pi_user:', parsedUser);
                  }
                }
              } catch (error) {
                console.warn('⚠️ Failed to parse stored pi_user:', error);
              }
            }
            
            // Method 5: Check if there's a stored flappypi-pi-user that we can use
            if (!sandboxUser) {
              try {
                const storedFlappyPiUser = localStorage.getItem('flappypi-pi-user');
                if (storedFlappyPiUser) {
                  const parsedUser = JSON.parse(storedFlappyPiUser);
                  if (parsedUser && parsedUser.uid) {
                    sandboxUser = parsedUser;
                    sandboxAuthenticated = true;
                    console.log('🧪 Found stored flappypi-pi-user:', parsedUser);
                    
                    // Also sync back to pi_user for Pi SDK compatibility
                    localStorage.setItem('pi_user', JSON.stringify(parsedUser));
                    localStorage.setItem('pi_access_token', parsedUser.accessToken || '');
                    localStorage.setItem('pi_auth_timestamp', Date.now().toString());
                    console.log('✅ Synced flappypi-pi-user back to pi_user');
                  }
                }
              } catch (error) {
                console.warn('⚠️ Failed to parse stored flappypi-pi-user:', error);
              }
            }
            
            console.log('🧪 Sandbox/PiNet/Localhost direct check - user:', sandboxUser);
            console.log('🧪 Sandbox/PiNet/Localhost direct check - authenticated:', sandboxAuthenticated);
          } catch (error) {
            console.warn('⚠️ Sandbox/PiNet/Localhost direct check failed:', error);
          }
        }
        
        // Use sandbox user if available and service user is not
        const finalUser = currentUser || sandboxUser;
        const finalAuthenticated = isAuthenticated || sandboxAuthenticated;
        
        if (finalAuthenticated && finalUser) {
          console.log('✅ User already authenticated:', finalUser);
          
          // Ensure we have a proper username with better extraction
          const username = extractUsername(finalUser);
          const userWithDefaults: PiUser = {
            uid: finalUser.uid,
            username: username,
            avatar: (finalUser as any).avatar || 'flappy-logo.png',
            isPiAuth: true,
            ...finalUser
          };
          
          setUser(userWithDefaults);
          
          // Store in main app's expected localStorage keys
          localStorage.setItem('flappypi-username', username);
          localStorage.setItem('flappypi-pi-user', JSON.stringify(userWithDefaults));
          localStorage.setItem('flappypi-pi-auth', 'true');
          
          console.log('🎮 Pi username stored for main app:', username);
          console.log('✅ Flappy Pi authentication data synced');
        } else {
          console.log('ℹ️ No authenticated user found - manual sign-in required');
          // Clear any stale data
          setUser(null);
          localStorage.removeItem('flappypi-username');
          localStorage.removeItem('flappypi-pi-user');
          localStorage.removeItem('flappypi-pi-auth');
          // Don't set error for normal unauthenticated state
          setError(null);
        }
      } catch (err) {
        console.error('❌ Auth status check failed:', err);
        clearTimeout(timeoutId);
        setError(err instanceof Error ? err.message : 'Authentication check failed');
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [piService, isAutoLoginEnabled]);

  // Helper function to extract username from user object
  const extractUsername = (user: any) => {
    if (!user) return 'Pi User';
    
    // Check for username first (most common in Pi Network)
    if (user.username && user.username !== 'Player' && user.username.trim() !== '') {
      return user.username.trim();
    }
    
    // Check for name field
    if (user.name && user.name !== 'Player' && user.name.trim() !== '') {
      return user.name.trim();
    }
    
    // Check for displayName
    if (user.displayName && user.displayName !== 'Player' && user.displayName.trim() !== '') {
      return user.displayName.trim();
    }
    
    // Check for first_name + last_name combination
    if (user.first_name || user.last_name) {
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName && fullName !== 'Player') {
        return fullName;
      }
    }
    
    return 'Pi User';
  };

  // Auto-login function
  const autoLogin = async () => {
    try {
      console.log('🔄 Attempting automatic login...');
      
      // Check if we're in a PiNet environment or sandbox
      const isPiNet = window.location.hostname.includes('ecosystem.pinet.com') || 
                     window.location.hostname.includes('flappypi2807.pinet.com');
      const isSandbox = window.location.hostname.includes('sandbox.minepi.com');
      
      if (!isPiNet && !isSandbox) {
        console.log('ℹ️ Not in PiNet or sandbox environment - skipping auto-login');
        return;
      }

      // Check if Pi SDK is available
      if (typeof window === 'undefined' || !window.Pi) {
        console.log('ℹ️ Pi SDK not available - skipping auto-login');
        return;
      }

      // Check if user is already authenticated
      if (user && piService.isAuthenticated()) {
        console.log('✅ User already authenticated - no need for auto-login');
        return;
      }

      console.log('🔐 Starting automatic Pi authentication...');
      
      // Attempt silent authentication
      const result = await piService.authenticate(['payments', 'username']);
      
                   if (result.success && result.user) {
        console.log('✅ Automatic authentication successful:', result.user);
        
        // Ensure the user data has the required properties
        console.log('🔍 PiAuthContext autoLogin - Raw user data:', result.user);
        const username = extractUsername(result.user);
        const userWithDefaults: PiUser = {
          username: username,
          uid: result.user.uid,
          avatar: (result.user as any).avatar || 'flappy-logo.png',
          isPiAuth: true,
          ...result.user
        };
        console.log('🔍 PiAuthContext autoLogin - Processed user data:', userWithDefaults);
        
        setUser(userWithDefaults);
        
        // Store user info in localStorage for persistence
        localStorage.setItem('pi_user', JSON.stringify(userWithDefaults));
        
        // Store in main app's expected localStorage keys
        localStorage.setItem('flappypi-username', userWithDefaults.username);
        localStorage.setItem('flappypi-pi-user', JSON.stringify(userWithDefaults));
        localStorage.setItem('flappypi-pi-auth', 'true');
        
        console.log('🎮 Automatic login completed - username ready for game:', userWithDefaults.username);
      } else {
        console.log('ℹ️ Automatic authentication not available - user needs to sign in manually');
        // Don't set error for auto-login failure, just log it
      }
    } catch (err) {
      console.log('ℹ️ Auto-login failed (this is normal if user is not signed in):', err);
      // Don't set error for auto-login failure, just log it
    }
  };

  // Enable auto-login
  const enableAutoLogin = () => {
    setIsAutoLoginEnabled(true);
    localStorage.setItem('flappypi-auto-login', 'true');
    console.log('✅ Auto-login enabled');
  };

  // Disable auto-login
  const disableAutoLogin = () => {
    setIsAutoLoginEnabled(false);
    localStorage.setItem('flappypi-auto-login', 'false');
    console.log('❌ Auto-login disabled');
  };

  const login = async (scopes: string[] = ['payments', 'username']) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 Starting Pi authentication...');
      console.log('🌍 Current environment:', {
        hostname: window.location.hostname,
        userAgent: navigator.userAgent.substring(0, 100),
        hasPiSDK: typeof window.Pi !== 'undefined',
        piSDKMethods: window.Pi ? Object.keys(window.Pi) : []
      });
      
      // Check if Pi SDK is available
      if (typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not available. Please ensure you are using Pi Browser or the Pi Network app.');
      }

      // Check if we're in a Pi environment
      const isPiEnvironment = window.location.hostname.includes('pinet.com') || 
                             window.location.hostname.includes('minepi.com') ||
                             navigator.userAgent.includes('Pi Browser') ||
                             navigator.userAgent.includes('PiNetwork');
      
      if (!isPiEnvironment) {
        console.warn('⚠️ Not in Pi environment - authentication may not work properly');
      }

      const result = await piService.authenticate(scopes);
      
      if (result.success && result.user) {
        // Ensure the user data has the required properties
        console.log('🔍 PiAuthContext login - Raw user data:', result.user);
        const username = extractUsername(result.user);
        const userWithDefaults: PiUser = {
          username: username,
          uid: result.user.uid,
          avatar: (result.user as any).avatar || 'flappy-logo.png',
          isPiAuth: true,
          ...result.user
        };
        console.log('🔍 PiAuthContext login - Processed user data:', userWithDefaults);
        
        setUser(userWithDefaults);
        
        // Update main app's localStorage keys
        localStorage.setItem('flappypi-username', userWithDefaults.username);
        localStorage.setItem('flappypi-pi-user', JSON.stringify(userWithDefaults));
        localStorage.setItem('flappypi-pi-auth', 'true');
        
        console.log('✅ Pi authentication successful - username:', userWithDefaults.username);
      } else {
        const errorMessage = result.error || 'Authentication failed';
        console.error('❌ Authentication failed:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('❌ Pi authentication failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      
      // Provide more specific error messages
      if (errorMessage.includes('Pi SDK not available')) {
        setError('Pi SDK not available. Please ensure you are using Pi Browser or the Pi Network app.');
      } else if (errorMessage.includes('timeout')) {
        setError('Authentication timeout. Please try again.');
      } else if (errorMessage.includes('network')) {
        setError('Network error. Please check your connection and try again.');
      } else if (errorMessage.includes('user')) {
        setError('Please make sure you are logged into Pi Browser first.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentUser = piService.getCurrentUser();
      if (currentUser && piService.isAuthenticated()) {
        // Ensure the user data has the required properties
        console.log('🔍 PiAuthContext refreshUser - Raw user data:', currentUser);
        const username = extractUsername(currentUser);
        const userWithDefaults: PiUser = {
          username: username,
          uid: currentUser.uid,
          avatar: (currentUser as any).avatar || 'flappy-logo.png',
          isPiAuth: true,
          ...currentUser
        };
        console.log('🔍 PiAuthContext refreshUser - Processed user data:', userWithDefaults);
        
        setUser(userWithDefaults);
        
        // Update main app's localStorage keys
        localStorage.setItem('flappypi-username', userWithDefaults.username);
        localStorage.setItem('flappypi-pi-user', JSON.stringify(userWithDefaults));
        localStorage.setItem('flappypi-pi-auth', 'true');
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('❌ User refresh failed:', err);
      setError(err instanceof Error ? err.message : 'User refresh failed');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Refreshing authentication...');
      
      const success = await piService.refreshAuth();
      if (success) {
        await refreshUser();
      } else {
        throw new Error('Failed to refresh authentication');
      }
    } catch (err) {
      console.error('❌ Auth refresh failed:', err);
      setError(err instanceof Error ? err.message : 'Auth refresh failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Manual sync function to sync existing Pi user data
  const syncExistingPiUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Syncing existing Pi user data...');
      
      // Check if there's a stored pi_user in localStorage
      const storedPiUser = localStorage.getItem('pi_user');
      if (storedPiUser) {
        try {
          const parsedUser = JSON.parse(storedPiUser);
          if (parsedUser && parsedUser.uid) {
            console.log('✅ Found existing pi_user, syncing to Flappy Pi...');
            
            const username = extractUsername(parsedUser);
            const userWithDefaults: PiUser = {
              uid: parsedUser.uid,
              username: username,
              avatar: (parsedUser as any).avatar || 'flappy-logo.png',
              isPiAuth: true,
              ...parsedUser
            };
            
            setUser(userWithDefaults);
            
            // Store in main app's expected localStorage keys
            localStorage.setItem('flappypi-username', username);
            localStorage.setItem('flappypi-pi-user', JSON.stringify(userWithDefaults));
            localStorage.setItem('flappypi-pi-auth', 'true');
            
            console.log('✅ Successfully synced existing Pi user:', username);
            return true;
          }
        } catch (error) {
          console.error('❌ Failed to parse stored pi_user:', error);
        }
      }
      
      // Check if there's a stored flappypi-pi-user that we can sync back to pi_user
      const storedFlappyPiUser = localStorage.getItem('flappypi-pi-user');
      if (storedFlappyPiUser) {
        try {
          const parsedUser = JSON.parse(storedFlappyPiUser);
          if (parsedUser && parsedUser.uid) {
            console.log('✅ Found existing flappypi-pi-user, syncing to pi_user...');
            
            // Store back to pi_user for Pi SDK compatibility
            localStorage.setItem('pi_user', JSON.stringify(parsedUser));
            localStorage.setItem('pi_access_token', parsedUser.accessToken || '');
            localStorage.setItem('pi_auth_timestamp', Date.now().toString());
            
            console.log('✅ Successfully synced Flappy Pi user to pi_user');
            return true;
          }
        } catch (error) {
          console.error('❌ Failed to parse stored flappypi-pi-user:', error);
        }
      }
      
      console.log('ℹ️ No existing Pi user found to sync');
      return false;
    } catch (err) {
      console.error('❌ Sync failed:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('👋 Signing out user...');
      
      // Call Pi SDK signOut
      piService.signOut();
      
      // Clear user state
      setUser(null);
      
      // Clear localStorage
      localStorage.removeItem('flappypi-username');
      localStorage.removeItem('flappypi-pi-user');
      localStorage.removeItem('flappypi-pi-auth');
      localStorage.removeItem('pi_user');
      localStorage.removeItem('pi_access_token');
      
      console.log('✅ User signed out successfully');
    } catch (err) {
      console.error('❌ Sign out failed:', err);
      setError(err instanceof Error ? err.message : 'Sign out failed');
    } finally {
      setIsLoading(false);
    }
  };

  const value: PiAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    refreshUser,
    refreshAuth,
    signOut,
    autoLogin,
    syncExistingPiUser,
    isAutoLoginEnabled,
    enableAutoLogin,
    disableAutoLogin
  };

  return (
    <PiAuthContext.Provider value={value}>
      {children}
    </PiAuthContext.Provider>
  );
};
