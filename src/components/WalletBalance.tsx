import React, { useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { CoinIcon } from './CoinIcon';
import { useUserProfile } from '@/hooks/useUserProfile';

const WalletBalance = ({ className = "", showBackground = true }) => {
  const { balance, setBalance } = useWallet();
  const { profile } = useUserProfile();
  const formattedBalance = balance.toLocaleString();
  
  // Sync balance with localStorage and profile to prevent glitches
  const syncBalance = useCallback(() => {
    const currentCoins = parseInt(localStorage.getItem('flappypi-coins') || '0', 10);
    
    // Always prioritize localStorage as the source of truth
    if (currentCoins !== balance) {
      console.log(`🪙 WalletBalance sync: ${balance} → ${currentCoins}`);
      setBalance(currentCoins);
    }
    
    // Also check profile as fallback
    if (profile && typeof profile.total_coins === 'number' && profile.total_coins > currentCoins) {
      console.log(`🪙 Balance sync from profile: ${currentCoins} → ${profile.total_coins}`);
      setBalance(profile.total_coins);
      localStorage.setItem('flappypi-coins', profile.total_coins.toString());
    }
  }, [profile, balance, setBalance]);
  
  useEffect(() => {
    syncBalance();
    // Sync on window focus to catch missed updates
    window.addEventListener('focus', syncBalance);
    
    // Listen for wallet update events for immediate sync
    const handleWalletEvent = () => {
      const currentCoins = parseInt(localStorage.getItem('flappypi-coins') || '0', 10);
      console.log(`🪙 WalletBalance: wallet event detected, syncing to ${currentCoins}`);
      setBalance(currentCoins);
    };
    
    window.addEventListener('wallet-updated', handleWalletEvent);
    window.addEventListener('coins-claimed', handleWalletEvent);
    window.addEventListener('force-wallet-refresh', handleWalletEvent);
    
    return () => {
      window.removeEventListener('focus', syncBalance);
      window.removeEventListener('wallet-updated', handleWalletEvent);
      window.removeEventListener('coins-claimed', handleWalletEvent);
      window.removeEventListener('force-wallet-refresh', handleWalletEvent);
    };
  }, [syncBalance, setBalance]);
  
  if (!showBackground) {
    // Clean version without background - just logo and amount
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img src="/flappycoins.png" alt="Flappy Coin" className="w-6 h-6" />
        <span className="text-yellow-500 text-lg font-bold drop-shadow-lg">{formattedBalance}</span>
      </div>
    );
  }
  
  // Modern version: white background, soft shadow, no yellow border
  return (
    <div
      className={`wallet-balance-footer flex items-center justify-center gap-2 px-6 py-2 bg-white rounded-full shadow-lg font-bold text-gray-900 text-lg ${className}`}
      style={{ minWidth: 120, minHeight: 48, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
    >
      <CoinIcon className="w-6 h-6 mr-1" />
      {formattedBalance}
    </div>
  );
};

export default WalletBalance; 