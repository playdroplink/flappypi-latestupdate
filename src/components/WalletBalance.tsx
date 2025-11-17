import React, { useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { CoinIcon } from './CoinIcon';
import { useUserProfile } from '@/hooks/useUserProfile';

const WalletBalance = ({ className = "", showBackground = true }) => {
  const { balance, setBalance } = useWallet();
  const { profile } = useUserProfile();
  const formattedBalance = balance.toLocaleString();
  
  // Sync balance with profile to prevent glitches
  const syncBalance = useCallback(() => {
    if (profile && typeof profile.total_coins === 'number' && balance !== profile.total_coins) {
      console.log(`🪙 Balance sync: wallet=${balance}, profile=${profile.total_coins}`);
      setBalance(profile.total_coins);
    }
  }, [profile, balance, setBalance]);
  
  useEffect(() => {
    syncBalance();
    // Sync on window focus to catch missed updates
    window.addEventListener('focus', syncBalance);
    return () => window.removeEventListener('focus', syncBalance);
  }, [syncBalance]);
  
  if (!showBackground) {
    // Clean version without background - just logo and amount
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img src="/flappycoins.png" alt="Flappy Coin" className="w-6 h-6" />
        <span className="text-yellow-500 text-lg font-bold drop-shadow-lg">{formattedBalance}</span>
      </div>
    );
  }
  
  // Original version with background
  return (
    <div
      className={`wallet-balance-footer flex items-center justify-center gap-2 px-6 py-2 bg-yellow-300 rounded-full shadow font-bold text-yellow-900 text-lg border-2 border-yellow-400 ${className}`}
      style={{ minWidth: 120, minHeight: 48 }}
    >
      <CoinIcon className="w-6 h-6 mr-1" />
      {formattedBalance}
    </div>
  );
};

export default WalletBalance; 