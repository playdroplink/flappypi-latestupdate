import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { loadWalletBalance, saveWalletBalance } from '../utils/walletUtils';

const WalletInitializer: React.FC = () => {
  const { username, isAuthenticated } = useAuth();
  const { setBalance, refreshBalance } = useWallet();

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        if (isAuthenticated && username) {
          // For authenticated users, load their specific balance
          const userBalance = loadWalletBalance(username);
          if (userBalance > 0) {
            setBalance(userBalance);
            // Also update the default balance for consistency
            saveWalletBalance(userBalance);
          }
        } else {
          // For non-authenticated users, load default balance
          const defaultBalance = loadWalletBalance();
          if (defaultBalance > 0) {
            setBalance(defaultBalance);
          }
        }

        // Refresh balance from profile if available
        await refreshBalance();
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
      }
    };

    initializeWallet();
  }, [isAuthenticated, username, setBalance, refreshBalance]);

  // Handle authentication state changes
  useEffect(() => {
    const handleAuthChange = async () => {
      if (isAuthenticated && username) {
        // User logged in - ensure their balance is loaded
        const userBalance = loadWalletBalance(username);
        if (userBalance > 0) {
          setBalance(userBalance);
          saveWalletBalance(userBalance);
        }
      } else if (!isAuthenticated) {
        // User logged out - load default balance
        const defaultBalance = loadWalletBalance();
        setBalance(defaultBalance);
      }
    };

    handleAuthChange();
  }, [isAuthenticated, username, setBalance]);

  return null; // This component doesn't render anything
};

export default WalletInitializer; 