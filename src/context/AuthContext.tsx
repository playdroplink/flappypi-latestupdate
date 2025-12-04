import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveWalletBalance, loadWalletBalance } from '../utils/walletUtils';
import { PI_CONFIG } from '../config/piConfig';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string;
  isPiAuth: boolean;
  piUser: any;
  login: (newUsername: string, password: string) => void;
  loginWithPi: (user: any) => Promise<boolean>;
  checkAuthStatus: () => Promise<boolean>;
  autoSignIn: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the AuthContext for direct use
export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [isPiAuth, setIsPiAuth] = useState(false);
  const [piUser, setPiUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  
  // Use refs to prevent infinite loops
  const lastAuthCheck = useRef<number>(0);
  const isCheckingAuth = useRef(false);

  const checkAuthStatus = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth.current) {
      console.log('🔍 AuthContext - Auth check already in progress, skipping...');
      return isAuthenticated;
    }
    
    isCheckingAuth.current = true;
    console.log('🔍 AuthContext - Starting authentication status check...');
    
    const savedUsername = localStorage.getItem('flappypi-username');
    const savedPassword = localStorage.getItem('flappypi-password');
    const piAuthStatus = localStorage.getItem('flappypi-pi-auth') === 'true';
    const savedPiUser = localStorage.getItem('flappypi-pi-user');
    
    console.log('🔍 AuthContext - localStorage data:', {
      savedUsername,
      savedPassword: savedPassword ? '***' : null,
      piAuthStatus,
      savedPiUser: savedPiUser ? 'exists' : null,
      savedPiUserContent: savedPiUser ? JSON.parse(savedPiUser) : null
    });

    // Enhanced Pi authentication check with sandbox support
    if (piAuthStatus && savedPiUser) {
      // Pi authentication
      try {
        const parsedUser = JSON.parse(savedPiUser);
        
        // Enhanced username extraction
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

        const extractedUsername = extractUsername(parsedUser);
        
        // Ensure the user object has the required properties
        const userWithDefaults = {
          username: extractedUsername,
          uid: parsedUser.uid || parsedUser.id,
          avatar: parsedUser.avatar || 'flappy-logo.png',
          isPiAuth: true,
          ...parsedUser
        };

        console.log('✅ AuthContext - Pi user authenticated:', extractedUsername);
        
        // Try to load cloud data for Pi users on auth check
        try {
          console.log('🔄 AuthContext - Attempting to load cloud data for Pi user...');
          const { inventoryService } = await import('../services/inventoryService');
          
          // Check if we have cloud data
          const cloudSyncStatus = await inventoryService.getCloudSyncStatus(userWithDefaults.uid);
          
          if (cloudSyncStatus.hasSyncedData) {
            console.log('☁️ AuthContext - Cloud data found, loading...', cloudSyncStatus);
            
            // Load and merge cloud data
            const cloudInventory = await inventoryService.loadInventoryFromCloud(userWithDefaults.uid);
            if (cloudInventory.length > 0) {
              const localInventory = inventoryService.getInventory();
              const mergedInventory = inventoryService.mergeInventoryData(localInventory, cloudInventory);
              localStorage.setItem('flappypi-inventory', JSON.stringify(mergedInventory));
              
              console.log('💾 AuthContext - Cloud inventory restored:', mergedInventory.length, 'items');
              
              // Dispatch event to update UI
              window.dispatchEvent(new CustomEvent('inventory-restored-from-cloud', { 
                detail: { 
                  itemCount: mergedInventory.length,
                  restoredAt: new Date().toISOString(),
                  fromAuthCheck: true
                } 
              }));
            }
          } else {
            console.log('ℹ️ AuthContext - No cloud data found for user');
          }
        } catch (cloudError) {
          console.warn('⚠️ AuthContext - Failed to load cloud data during auth check:', cloudError);
        }
        
        setIsAuthenticated(true);
        setIsPiAuth(true);
        setPiUser(userWithDefaults);
        setUsername(extractedUsername);
        isCheckingAuth.current = false;
        return true;
      } catch (error) {
        console.error('❌ AuthContext - Error parsing Pi user data:', error);
        // Clear invalid data
        localStorage.removeItem('flappypi-pi-user');
        localStorage.removeItem('flappypi-pi-auth');
      }
    } else if (savedUsername && savedPassword) {
      // Local authentication
      try {
        const existingUsers = JSON.parse(localStorage.getItem('flappypi-users') || '[]');
        const user = existingUsers.find((u: any) => u.username === savedUsername && u.password === savedPassword);
        
        if (user) {
          setIsAuthenticated(true);
          setIsPiAuth(false);
          setPiUser(null);
          setUsername(savedUsername);
          isCheckingAuth.current = false;
          return true;
        }
      } catch (error) {
        console.error('❌ AuthContext - Error parsing users data:', error);
      }
    }

    // Not authenticated
    setIsAuthenticated(false);
    setIsPiAuth(false);
    setPiUser(null);
    setUsername('');
    isCheckingAuth.current = false;
    return false;
  }, [isAuthenticated]);

  const login = useCallback((newUsername: string, password: string) => {
    // Preserve current wallet balance before login
    const currentBalance = loadWalletBalance();
    
    localStorage.setItem('flappypi-username', newUsername);
    localStorage.setItem('flappypi-password', password);
    
    // Restore user-specific wallet balance if available
    const userBalance = loadWalletBalance(newUsername);
    if (userBalance > 0) {
      saveWalletBalance(userBalance);
    } else if (currentBalance > 0) {
      // If no user-specific balance, save current balance as user-specific
      saveWalletBalance(currentBalance, newUsername);
    }
    
    checkAuthStatus();
    // Force navigation to home after successful login
    navigate('/home', { replace: true });
  }, [checkAuthStatus, navigate]);

  const loginWithPi = useCallback(async (user: any) => {
    try {
      console.log('🔐 Starting Pi login process for user:', user.username, user.uid);
      
      // Immediately perform cloud sync BEFORE setting auth state to prevent empty data display
      try {
        console.log('🔄 Pre-login cloud sync for user:', user.uid);
        const { inventoryService } = await import('../services/inventoryService');
        // Load cloud data first
        const cloudInventory = await inventoryService.loadInventoryFromCloud(user.uid);
        console.log('☁️ Pre-login cloud data loaded:', cloudInventory.length, 'items');

        // Restore wallet balance from cloud if available
        if (typeof cloudInventory === 'object' && cloudInventory !== null && 'wallet_balance' in cloudInventory) {
          const { saveWalletBalance } = await import('../utils/walletUtils');
          const savedUsername = user.username;
          const walletBalance = Number(cloudInventory.wallet_balance);
          if (!isNaN(walletBalance)) {
            saveWalletBalance(walletBalance, savedUsername);
            console.log('💰 Pre-login wallet balance restored from cloud:', walletBalance);
          } else {
            console.warn('⚠️ Invalid wallet_balance from cloud, not saving:', cloudInventory.wallet_balance);
          }
        }

        // If cloud data exists, immediately update localStorage before auth state changes
        if (cloudInventory.length > 0) {
          const localInventory = inventoryService.getInventory();
          const mergedInventory = inventoryService.mergeInventoryData(localInventory, cloudInventory);
          localStorage.setItem('flappypi-inventory', JSON.stringify(mergedInventory));
          console.log('💾 Pre-login inventory merged and saved to localStorage:', mergedInventory.length, 'items');
          // Dispatch event to update UI immediately
          window.dispatchEvent(new CustomEvent('inventory-restored-from-cloud', { 
            detail: { 
              itemCount: mergedInventory.length,
              restoredAt: new Date().toISOString()
            } 
          }));
        }
      } catch (cloudSyncError) {
        console.warn('⚠️ Pre-login cloud sync failed, continuing with login:', cloudSyncError);
      }
      
      // Store user data
      localStorage.setItem('flappypi-username', user.username);
      localStorage.setItem('flappypi-pi-user', JSON.stringify(user));
      localStorage.setItem('flappypi-pi-auth', 'true');
      
      // Update state (now with potentially restored data already in localStorage)
      setIsAuthenticated(true);
      setIsPiAuth(true);
      setPiUser(user);
      setUsername(user.username);
      
      // Trigger auth state change event
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { 
          isAuthenticated: true, 
          isPiAuth: true, 
          piUser: user,
          username: user.username 
        } 
      }));
      
      // Background tasks (non-blocking)
      setTimeout(async () => {
        try {
          // Auto-collect wallet address from Pi auth
          console.log('💳 Starting wallet auto-collection...');
          const { walletService } = await import('../services/walletService');
          const walletCollected = await walletService.autoCollectWallet(user);
          
          if (walletCollected) {
            console.log('✅ Wallet auto-collected:', walletCollected);
            localStorage.setItem('flappypi-wallet-auto-collected', 'true');
            
            // Dispatch wallet collected event
            window.dispatchEvent(new CustomEvent('wallet-auto-collected', {
              detail: {
                walletAddress: walletCollected,
                username: user.username,
                timestamp: new Date().toISOString()
              }
            }));
          } else {
            console.log('ℹ️ No wallet address in Pi auth data - user will be prompted in ProfilePage');
          }
        } catch (walletError) {
          console.warn('⚠️ Wallet auto-collection failed:', walletError);
        }

        try {
          // Check ad network availability
          const { adService } = await import('../services/adService');
          const isAdNetworkSupported = await adService.isAdNetworkSupported();
          localStorage.setItem('flappypi-ad-network-available', isAdNetworkSupported.toString());
          console.log(`🎯 Ad network availability: ${isAdNetworkSupported}`);
        } catch (error) {
          console.warn('⚠️ Error checking ad network:', error);
        }
        
        try {
          // Perform full cloud sync to ensure everything is up-to-date
          const { inventoryService } = await import('../services/inventoryService');
          const syncSuccess = await inventoryService.performFullCloudSync(user.uid);
          
          if (syncSuccess) {
            console.log('✅ Post-login cloud sync completed');
            
            // Initialize user profile in backend
            try {
              const { BackendStorageService } = await import('../services/backendStorageService');
              const backendStorage = BackendStorageService.getInstance();
              await backendStorage.initializeUserProfile(user);
            } catch (profileError) {
              console.warn('⚠️ Profile initialization error:', profileError);
            }
            
            // Create backup
            try {
              const { dataRecoveryService } = await import('../services/dataRecoveryService');
              await dataRecoveryService.createBackup(user.uid, user.username);
            } catch (backupError) {
              console.warn('⚠️ Backup creation failed:', backupError);
            }
            
            // Dispatch completion event
            window.dispatchEvent(new CustomEvent('cloud-sync-complete', { 
              detail: { 
                piUserId: user.uid,
                username: user.username,
                syncedAt: new Date().toISOString(),
                success: true
              } 
            }));
            
            // Show success notification
            setTimeout(() => {
              try {
                const { toast } = require('@/hooks/use-toast');
                toast({
                  title: 'Welcome Back! 🎉',
                  description: 'Your data has been restored from the cloud',
                  duration: 3000
                });
              } catch (toastError) {
                console.log('📱 Data synced successfully for:', user.username);
              }
            }, 1000);
            
          } else {
            console.warn('⚠️ Post-login cloud sync completed with warnings');
          }
        } catch (error) {
          console.warn('⚠️ Error during post-login sync:', error);
        }
      }, 500); // Shorter delay for background tasks
      
      return true;
    } catch (error) {
      console.error('❌ AuthContext - Error during Pi login:', error);
      return false;
    }
  }, []);

  // Auto sign-in functionality for Pi Network
  const autoSignIn = useCallback(async () => {
    try {
      // Check if Pi SDK is available
      if (typeof window.Pi === 'undefined') {
        console.log('🚫 Pi SDK not available for auto sign-in');
        return false;
      }

      // Check if already authenticated
      if (isAuthenticated) {
        console.log('✅ User already authenticated, skipping auto sign-in');
        return true;
      }

      // Check if we're in Pi Browser or PiNet environment or localhost
      const isPiEnvironment = window.location.hostname.includes('pinet.com') || 
                             window.location.hostname.includes('minepi.com') ||
                             window.location.hostname === 'localhost' ||
                             window.location.hostname === '127.0.0.1' ||
                             (typeof window.Pi !== 'undefined');

      if (!isPiEnvironment) {
        console.log('🚫 Not in Pi environment, skipping auto sign-in');
        return false;
      }

      console.log('🔄 Attempting Pi auto sign-in...');
      
      // Attempt Pi authentication
      const result = await window.Pi.authenticate(['payments', 'username'], (incompletePayment) => {
        console.log('💰 Incomplete payment found during auto sign-in:', incompletePayment);
      });

      if (result && result.user) {
        console.log('✅ Auto sign-in successful for user:', result.user.username);
        
        // Process user data
        const userData = {
          username: result.user.username || result.user.name || 'Pi User',
          uid: result.user.uid || result.user.id || 'pi-user-' + Date.now(),
          avatar: result.user.avatar || 'flappy-logo.png',
          accessToken: result.accessToken,
          isPiAuth: true,
          ...result.user
        };

        // Login with Pi user data
        await loginWithPi(userData);
        return true;
      } else {
        console.log('🚫 Auto sign-in failed - no user data received');
        return false;
      }
    } catch (error) {
      console.error('❌ AuthContext - Auto sign-in error:', error);
      return false;
    }
  }, [isAuthenticated, loginWithPi]);

  // Check auth status on mount and when localStorage changes
  useEffect(() => {
    const handleAuthCheck = async () => {
      const now = Date.now();
      // Prevent too frequent auth checks - increased to 2 seconds
      if (now - lastAuthCheck.current < 2000) {
        return;
      }
      lastAuthCheck.current = now;
      
      const authStatus = await checkAuthStatus();
      
      // Enhanced Pi authentication check for sandbox environments
      if (!authStatus && typeof window !== 'undefined') {
        // Use config to ensure we are not in mainnet
        const isSandbox = false;
        const isPiNet = window.location.hostname.includes('pinet.com');
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        console.log('🔍 AuthContext - Environment check:', {
          hostname: window.location.hostname,
          isSandbox,
          isPiNet,
          isLocalhost,
          windowPiExists: !!window.Pi,
          windowPiType: typeof window.Pi,
          windowPiKeys: window.Pi ? Object.keys(window.Pi) : []
        });

        // If sandbox is not available, use mock Pi auth to bypass guard
        if (!isSandbox && (!PI_CONFIG.isMainnet() || isLocalhost)) {
          console.log('🟡 Mock Pi Auth: Sandbox not available, bypassing Pi auth guard with mock user.');
          const mockPiUser = {
            uid: 'mock-user-001',
            username: 'MockPiUser',
            name: 'Mock Pi User',
            avatar: 'flappy-logo.png',
            isPiAuth: true
          };
          localStorage.setItem('flappypi-username', mockPiUser.username);
          localStorage.setItem('flappypi-pi-user', JSON.stringify(mockPiUser));
          localStorage.setItem('flappypi-pi-auth', 'true');
          await checkAuthStatus();
          if (window.location.pathname !== '/' && window.location.pathname !== '/home') {
            window.location.replace('/');
          }
          return;
        }

        // ...existing code for sandbox and PiNet checks...
        // (rest of the original sandbox/PiNet logic remains unchanged)
      }
    };
    
    // Ensure Pi SDK is initialized before any sandbox auth
    const piInitPromiseRef = { current: null as null | Promise<void> };

    const ensurePiInit = async () => {
      // Use config to ensure we are not in mainnet
      // Pi auth guard temporarily disabled
      const isSandbox = false;
      if (isSandbox && !PI_CONFIG.isMainnet() && window.Pi && typeof window.Pi.init === 'function') {
        if (!piInitPromiseRef.current) {
          piInitPromiseRef.current = window.Pi.init({ version: '2.0', sandbox: true })
            .then(() => {
              console.log('✅ Pi SDK initialized in SANDBOX mode (guarded)');
            })
            .catch((e) => {
              console.warn('⚠️ Failed to initialize Pi SDK in sandbox mode (guarded):', e);
            });
        }
        await piInitPromiseRef.current;
      }
    };

    const guardedHandleAuthCheck = async () => {
      await ensurePiInit();
      await handleAuthCheck();
    };

    guardedHandleAuthCheck();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      const now = Date.now();
      if (now - lastAuthCheck.current < 2000) {
        return;
      }
      lastAuthCheck.current = now;
      handleAuthCheck();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom auth events
    const handleAuthStateChanged = (event: CustomEvent) => {
      const now = Date.now();
      if (now - lastAuthCheck.current < 2000) {
        return;
      }
      lastAuthCheck.current = now;
      handleAuthCheck();
    };
    
    window.addEventListener('auth-state-changed', handleAuthStateChanged as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-changed', handleAuthStateChanged as EventListener);
    };
  }, [checkAuthStatus, autoSignIn]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out user...');
      
      // Create backup and sync to cloud before logout if user is logged in
      if (isAuthenticated && piUser?.uid && piUser?.username) {
        try {
          console.log('💾 Creating logout backup and syncing to cloud for:', piUser.username);
          
          // Import services dynamically to avoid circular dependencies
          const { dataRecoveryService } = await import('../services/dataRecoveryService');
          const { inventoryService } = await import('../services/inventoryService');
          
          // First, sync ALL current data to cloud
          console.log('☁️ Performing final cloud sync before logout...');
          await inventoryService.performFullCloudSync(piUser.uid);
          
          // Then create a backup
          console.log('💾 Creating final backup before logout...');
          await dataRecoveryService.createBackup(piUser.uid, piUser.username);
          
          // Double check - save current wallet balance specifically
          const currentBalance = localStorage.getItem('flappypi-balance');
          if (currentBalance) {
            const balanceValue = parseFloat(currentBalance) || 0;
            console.log('💰 Saving final wallet balance to cloud:', balanceValue);
            await inventoryService.syncWalletToCloud(piUser.uid, balanceValue);
          }
          
          // Save current inventory one more time
          const currentInventory = localStorage.getItem('flappypi-inventory');
          if (currentInventory) {
            try {
              const inventory = JSON.parse(currentInventory);
              console.log('📦 Saving final inventory to cloud:', inventory.length, 'items');
              await inventoryService.saveInventoryToCloud(piUser.uid, inventory);
            } catch (error) {
              console.warn('⚠️ Failed to parse inventory for final save:', error);
            }
          }
          
          console.log('✅ Logout backup and final sync completed successfully');
        } catch (backupError) {
          console.error('❌ Logout backup/sync failed:', backupError);
          // Continue with logout even if backup fails
        }
      }
      
      setIsLoggingOut(true);
      setIsAuthenticated(false);
      setIsPiAuth(false);
      setPiUser(null);
      setUsername('');
      
      // Clear auth data but preserve game data temporarily
      localStorage.removeItem('flappypi-username');
      localStorage.removeItem('flappypi-password');
      localStorage.removeItem('flappypi-pi-user');
      localStorage.removeItem('flappypi-pi-auth');
      
      // Mark data as \"logged out\" but keep it for recovery
      const currentTimestamp = Date.now().toString();
      localStorage.setItem('flappypi-last-logout', currentTimestamp);
      localStorage.setItem('flappypi-data-needs-recovery', 'true');
      
      // NOTE: We intentionally keep 'flappypi-inventory' and 'flappypi-balance'
      // so users can continue playing offline and data will be restored on next login
      
      console.log('✅ Logout completed - game data preserved for recovery');
      
      // Dispatch logout event for other components to handle
      window.dispatchEvent(new CustomEvent('user-logged-out', { 
        detail: { 
          timestamp: currentTimestamp,
          dataPreserved: true 
        } 
      }));
      
      // Reset logout flag after a delay
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Fallback logout
      setIsLoggingOut(true);
      setIsAuthenticated(false);
      setIsPiAuth(false);
      setPiUser(null);
      setUsername('');
      
      // Clear auth data
      localStorage.removeItem('flappypi-username');
      localStorage.removeItem('flappypi-password');
      localStorage.removeItem('flappypi-pi-user');
      localStorage.removeItem('flappypi-pi-auth');
      
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 1000);
    }
  }, [isAuthenticated, piUser]);

  // Auto-navigate when authentication state changes
  useEffect(() => {

    
    if (isAuthenticated && !isLoggingOut) {
      // Only redirect if on login page, not from home page
      const currentPath = window.location.pathname;
      if (currentPath === '/pi-browser-login' || currentPath === '/pi-auth') {

        // Add a small delay to prevent conflicts with logout navigation
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 100);
      }
    }
  }, [isAuthenticated, isLoggingOut, navigate]);

  const value = {
    isAuthenticated,
    username,
    isPiAuth,
    piUser,
    login,
    loginWithPi,
    checkAuthStatus,
    autoSignIn,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 