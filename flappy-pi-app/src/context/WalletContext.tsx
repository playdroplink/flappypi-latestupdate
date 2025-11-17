import React, { createContext, useContext, useState } from 'react';

type WalletContextType = {
  balance: number;
  setBalance: (amount: number) => void;
  addCoins: (amount: number) => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(0);

  const addCoins = (amount: number) => setBalance((prev) => prev + amount);

  return (
    <WalletContext.Provider value={{ balance, setBalance, addCoins }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
}; 