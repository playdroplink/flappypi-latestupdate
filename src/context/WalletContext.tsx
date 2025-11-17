import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from './AuthContext';
import { 
  getWalletKey, 
  getTransactionsKey, 
  saveWalletBalance, 
  loadWalletBalance, 
  saveWalletTransactions, 
  loadWalletTransactions 
} from '../utils/walletUtils';

type Transaction = {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  date: string;
};

type WalletContextType = {
  balance: number;
  setBalance: (amount: number) => void;
  addCoins: (amount: number, reason?: string) => Promise<void>;
  spendCoins: (amount: number, reason?: string) => Promise<boolean>;
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  isVip: boolean;
  loading: boolean;
  refreshBalance: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, updateProfile, refreshProfile, loading: profileLoading } = useUserProfile();
  const { username, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // VIP founder logic
  const isVip = profile?.username === 'Wain2020';
  const effectiveBalance = isVip ? 9999999 : balance;

  // Initialize balance from localStorage if available
  useEffect(() => {
    if (!isAuthenticated) {
      // For non-authenticated users, use default key
      const savedBalance = loadWalletBalance();
      if (savedBalance > 0 && !isVip) {
        setBalance(savedBalance);
      }
    } else if (username) {
      // For authenticated users, use user-specific key
      const savedBalance = loadWalletBalance(username);
      if (savedBalance > 0 && !isVip) {
        setBalance(savedBalance);
      }
    }
  }, [username, isAuthenticated, isVip]);

  // Load transactions from localStorage
  useEffect(() => {
    if (username) {
      const savedTransactions = loadWalletTransactions(username);
      setTransactions(savedTransactions);
    }
  }, [username]);

  // Persist balance to localStorage whenever it changes
  useEffect(() => {
    if (!isVip) {
      saveWalletBalance(balance, username);
    }
  }, [balance, isVip, username]);

  // Persist transactions to localStorage whenever they change
  useEffect(() => {
    if (username) {
      saveWalletTransactions(transactions, username);
    }
  }, [transactions, username]);

  // Refresh balance from profile
  const refreshBalance = async () => {
    if (profile && typeof profile.total_coins === 'number') {
      setBalance(profile.total_coins);
      if (!isVip) {
        saveWalletBalance(profile.total_coins, username);
      }
    }
  };

  // On mount or when profile changes, always fetch the latest balance from Supabase
  useEffect(() => {
    async function fetchBalance() {
      setLoading(true);
      await refreshBalance();
      setLoading(false);
    }
    fetchBalance();
  }, [profile]);

  // Periodic balance refresh to keep in sync across page navigation
  useEffect(() => {
    if (!profile) return;
    
    const interval = setInterval(async () => {
      await refreshProfile();
      await refreshBalance();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [profile, refreshProfile]);

  // Refresh balance when window gains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = async () => {
      if (profile) {
        await refreshProfile();
        await refreshBalance();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [profile, refreshProfile]);

  // Handle user authentication changes
  useEffect(() => {
    if (isAuthenticated && username) {
      // User logged in - load their specific balance
      const savedBalance = loadWalletBalance(username);
      if (savedBalance > 0 && !isVip) {
        setBalance(savedBalance);
      }
    } else if (!isAuthenticated) {
      // User logged out - reset to default balance
      const defaultBalance = loadWalletBalance();
      setBalance(defaultBalance);
    }
  }, [isAuthenticated, username, isVip]);

  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev.slice(0, 49)]); // keep last 50
  };

  const addCoins = async (amount: number, reason = 'Earned') => {
    if (!isVip) {
      setBalance((prev) => {
      const newBal = prev + amount;
        saveWalletBalance(newBal, username);
      return newBal;
    });
    }
    
    addTransaction({
      id: `${Date.now()}-${Math.random()}`,
      type: 'earn',
      amount,
      reason,
      date: new Date().toISOString(),
    });
    
    if (profile && updateProfile) {
      await updateProfile({ total_coins: (profile.total_coins || 0) + amount });
      if (refreshProfile) await refreshProfile();
      await refreshBalance();
    }
  };

  const spendCoins = async (amount: number, reason = 'Spent') => {
    if (isVip) return true;
    if (balance < amount) return false;
    
    setBalance((prev) => {
      const newBal = prev - amount;
      saveWalletBalance(newBal, username);
      return newBal;
    });
    
    addTransaction({
      id: `${Date.now()}-${Math.random()}`,
      type: 'spend',
      amount,
      reason,
      date: new Date().toISOString(),
    });
    
    if (profile && updateProfile) {
      await updateProfile({ total_coins: (profile.total_coins || 0) - amount });
      if (refreshProfile) await refreshProfile();
      await refreshBalance();
    }
    return true;
  };

  return (
    <WalletContext.Provider value={{ 
      balance: effectiveBalance, 
      setBalance, 
      addCoins, 
      spendCoins, 
      transactions, 
      addTransaction, 
      isVip, 
      loading: loading || profileLoading,
      refreshBalance 
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
}; 