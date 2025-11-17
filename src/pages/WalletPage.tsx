import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import { useUserProfile } from '../hooks/useUserProfile';
import { CoinIcon } from '../components/CoinIcon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Play, Gift, Zap, Coins, DollarSign, RefreshCw, Trophy, Star, Crown } from 'lucide-react';
import { powerUpItems } from '@/constants/powerUpItems';
import { mysteryBoxItems } from '@/constants/mysteryBoxItems';
import { useToast } from '@/hooks/use-toast';
import EnhancedFooter from '../components/EnhancedFooter';
import PiPaymentModalV2 from '../components/PiPaymentModalV2';
import { securePaymentService, PaymentItem } from '../services/securePaymentService';

import { adService } from '../services/adService';
import { useWallet } from '../context/WalletContext';
import WalletBalance from '../components/WalletBalance';
import SlotMachine from '../components/SlotMachine';
import { inventoryService } from '../services/inventoryService';
import FooterNPC from '../components/FooterNPC';
import { useRewardedAdCooldown } from '../hooks/useRewardedAdCooldown';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import { piBrowserRedirect } from '../utils/piBrowserRedirect';
import { useGameState } from '../hooks/useGameState';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const buyOptions = [
  { coins: 100, price: 1 },
  { coins: 500, price: 4 },
  { coins: 1200, price: 9 },
  { coins: 3000, price: 20 },
];

const adRouletteRewards = [
  { type: 'coin', id: 'coin', amount: 5, image: '/flappycoins.png', name: '5 Coins', color: '#FFD700' },
  { type: 'coin', id: 'coin', amount: 10, image: '/flappycoins.png', name: '10 Coins', color: '#FFD700' },
  { type: 'coin', id: 'coin', amount: 20, image: '/flappycoins.png', name: '20 Coins', color: '#C0C0C0' },
  { type: 'coin', id: 'coin', amount: 50, image: '/flappycoins.png', name: '50 Coins', color: '#FF6B35' },
  // Example item rewards (power-ups and mystery boxes)
  ...powerUpItems.slice(0, 2).map(p => ({
    type: 'powerup',
    id: p.id,
    image: p.image,
    name: p.name,
    color: '#C0C0C0'
  })),
  ...mysteryBoxItems.slice(0, 1).map(mb => ({
    type: 'mysterybox',
    id: mb.id,
    image: mb.image,
    name: mb.name,
    color: '#C0C0C0'
  })),
  { type: 'none', id: 'none', image: '/flappycoins.png', name: 'Try Again', color: '#808080' },
];


const WalletPage: React.FC<{ musicEnabled: boolean, setMusicEnabled: (enabled: boolean) => void, soundEnabled: boolean, setSoundEnabled: (enabled: boolean) => void }> = ({ musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled }) => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUserProfile();
  const { toast } = useToast();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const { balance, setBalance, transactions, addTransaction } = useWallet();
  const [showReceive, setShowReceive] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [showAdRoulette, setShowAdRoulette] = useState(false);
  const [rouletteResult, setRouletteResult] = useState<{ type: string; amount: number; image: string; name: string; rarity: string; color: string } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningReward, setSpinningReward] = useState(null);
  const [showAdConfirm, setShowAdConfirm] = useState(false);
  const [piSpent, setPiSpent] = useState(0);
  const [legendaryWins, setLegendaryWins] = useState(0);
  const [rareWins, setRareWins] = useState(0);
  const [showWheel, setShowWheel] = useState(false);
  const [wheelRewards, setWheelRewards] = useState<any[]>([]);
  const [wheelSelected, setWheelSelected] = useState(0);
  const [pendingReward, setPendingReward] = useState<any>(null);
  const [pendingType, setPendingType] = useState<'ad' | 'paid' | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardToShow, setRewardToShow] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);
  const [rouletteStats, setRouletteStats] = useState({
    totalSpins: 0,
    adSpins: 0,
    paidSpins: 0,
    totalWinnings: 0,
    bestWin: 0,
    lastWin: null as any
  });
  const adCooldown = useRewardedAdCooldown();
  const { settings } = useSettings();
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');

  const handleBack = () => {
    navigate(-1);
  };

  // Sync balance with profile
  React.useEffect(() => {
    if (profile && typeof profile.total_coins === 'number') {
      console.log(`🪙 Syncing balance from profile: ${profile.total_coins}`);
      setBalance(profile.total_coins);
    }
    // Do not set balance if profile is missing or total_coins is undefined/null
  }, [profile, profile?.total_coins]);

  // Additional effect to ensure balance consistency
  React.useEffect(() => {
    const syncBalance = () => {
      if (profile && typeof profile.total_coins === 'number' && balance !== profile.total_coins) {
        console.log(`🪙 Balance mismatch detected: wallet=${balance}, profile=${profile.total_coins}`);
        console.log(`🪙 Syncing balance to profile value: ${profile.total_coins}`);
        setBalance(profile.total_coins);
      }
    };
    
    // Sync immediately
    syncBalance();
    
    // Also sync on window focus to catch any missed updates
    const handleFocus = () => {
      setTimeout(syncBalance, 100);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [profile, balance]);

  // On mount, load weekly stats from localStorage
  useEffect(() => {
    const weekKey = `roulette-stats-${getCurrentWeek()}`;
    const stats = JSON.parse(localStorage.getItem(weekKey) || '{}');
    setPiSpent(stats.piSpent || 0);
    setLegendaryWins(stats.legendaryWins || 0);
    setRareWins(stats.rareWins || 0);

    // Load roulette stats
    const savedStats = JSON.parse(localStorage.getItem('roulette-stats') || '{}');
    setRouletteStats(savedStats);
  }, []);

  // Helper to get current week string
  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now as any) - (start as any)) / 86400000 + start.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week}`;
  }

  // Helper to save weekly stats
  function saveWeeklyStats(newStats: { piSpent?: number; legendaryWins?: number; rareWins?: number; }) {
    const weekKey = `roulette-stats-${getCurrentWeek()}`;
    const stats = JSON.parse(localStorage.getItem(weekKey) || '{}');
    const updated = { ...stats, ...newStats };
    localStorage.setItem(weekKey, JSON.stringify(updated));
    if (updated.piSpent !== undefined) setPiSpent(updated.piSpent);
    if (updated.legendaryWins !== undefined) setLegendaryWins(updated.legendaryWins);
    if (updated.rareWins !== undefined) setRareWins(updated.rareWins);
  }

  // Helper to save roulette stats
  function saveRouletteStats(newStats: any) {
    const updated = { ...rouletteStats, ...newStats };
    setRouletteStats(updated);
    localStorage.setItem('roulette-stats', JSON.stringify(updated));
  }

  // Add a check for active subscription
  const isSubscriber = profile?.has_active_subscription && new Date(profile.subscription_end) > new Date();

  // Mock ad reward
  const handleWatchAd = () => {
    setTimeout(() => setBalance(balance + 10), 1000);
    alert('You earned 10 Flappy Coins!');
  };
  // Mock buy coins
  const handleBuy = (coins: number) => {
    setBalance(balance + coins);
    setShowBuy(false);
    alert(`You bought ${coins} Flappy Coins!`);
  };
  // Helper to increment power-up inventory
  const addPowerUpToInventory = async (powerUpId: string) => {
    if (!profile) return;
    const current = profile.owned_power_ups || {};
    const newCount = (current[powerUpId] || 0) + 1;
    await updateProfile({ owned_power_ups: { ...current, [powerUpId]: newCount } });
    // Save to inventory as well
    const powerUp = powerUpItems.find(p => p.id === powerUpId);
    if (powerUp) {
      inventoryService.saveToInventory({
        id: powerUpId,
        name: powerUp.name,
        type: 'powerup',
        quantity: 1,
        image: powerUp.image,
        description: powerUp.description,
      });
    }
    toast({ title: 'Power-Up Received!', description: `You received a ${powerUp?.name || powerUpId}.`, duration: 3000 });
  };
  // Helper to increment mystery box inventory (add owned_mystery_boxes to profile if not present)
  const addMysteryBoxToInventory = async (boxId: string) => {
    if (!profile) return;
    const current = (profile as any).owned_mystery_boxes || {};
    const newCount = (current[boxId] || 0) + 1;
    await updateProfile({ ...(profile as any), owned_mystery_boxes: { ...current, [boxId]: newCount } });
    // Save to inventory as well
    const box = mysteryBoxItems.find(mb => mb.id === boxId);
    if (box) {
      inventoryService.saveToInventory({
        id: boxId,
        name: box.name,
        type: 'mystery-box',
        quantity: 1,
        image: box.image,
        description: box.description,
      });
    }
    toast({ title: 'Mystery Box Received!', description: `You received a ${box?.name || boxId}.`, duration: 3000 });
  };

  // Enhanced spinRoulette with visual wheel and robust reward application
  const spinRoulette = (type: 'ad') => {
    setPendingType(type);
    const rewards = adRouletteRewards;

    // Pick the reward index (with guarantee/limit logic for paid)
    let resultIndex = Math.floor(Math.random() * rewards.length);
    let result = rewards[resultIndex];


    // Update stats
    const newStats = {
      totalSpins: rouletteStats.totalSpins + 1,
      adSpins: rouletteStats.adSpins + 1,
      totalWinnings: result.type === 'coin' && 'amount' in result && typeof result.amount === 'number' ? (rouletteStats.totalWinnings + result.amount) : rouletteStats.totalWinnings,
      bestWin: result.type === 'coin' && 'amount' in result && typeof result.amount === 'number' ? Math.max(rouletteStats.bestWin, result.amount) : rouletteStats.bestWin,
      lastWin: result
    };
    saveRouletteStats(newStats);

    setWheelRewards(rewards);
    setWheelSelected(resultIndex);
    setShowWheel(true);
    setPendingReward(result);

    // Start wheel spinning animation
    setIsWheelSpinning(true);
    const spinDuration = 3000;
    const finalRotation = 360 * 5 + (360 / rewards.length) * resultIndex;
    setWheelRotation(finalRotation);

    setTimeout(() => {
      setIsWheelSpinning(false);
      setShowWheel(false);
      setShowRewardModal(true);
      setRewardToShow(result);
      setShowConfetti(true);

      // Apply the reward with proper error handling
      try {
        if (result.type === 'coin' && 'amount' in result && typeof result.amount === 'number' && result.amount > 0) {
          // Update balance using functional update to ensure accuracy
          const newBalance = balance + result.amount;
          setBalance(newBalance);
          console.log(`🎰 Roulette reward: ${result.amount} coins added. New balance: ${newBalance}`);
          
          // Add transaction record
          addTransaction({
            id: Date.now().toString(),
            type: 'earn',
            amount: result.amount,
            reason: `${type === 'ad' ? 'Ad' : 'Paid'} Roulette Reward`,
            date: new Date().toISOString()
          });
          
          // Show success toast
          toast({
            title: `+${result.amount} Flappy Coins!`,
            description: `You won ${result.amount} coins from the ${type} roulette!`,
            duration: 3000
          });
          
        } else if (result.type === 'powerup') {
          addPowerUpToInventory(result.id);
          
          // Add transaction record for power-up
          addTransaction({
            id: Date.now().toString(),
            type: 'earn',
            amount: 0,
            reason: `${type === 'ad' ? 'Ad' : 'Paid'} Roulette - Power-up: ${result.name}`,
            date: new Date().toISOString()
          });
          
        } else if (result.type === 'mysterybox') {
          addMysteryBoxToInventory(result.id);
          
          // Add transaction record for mystery box
          addTransaction({
            id: Date.now().toString(),
            type: 'earn',
            amount: 0,
            reason: `${type === 'ad' ? 'Ad' : 'Paid'} Roulette - Mystery Box: ${result.name}`,
            date: new Date().toISOString()
          });
          
        } else if (result.type === 'none') {
          // No reward case
          toast({
            title: 'Try Again!',
            description: 'Better luck next time!',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('Error applying roulette reward:', error);
        toast({
          title: 'Reward Error',
          description: 'There was an issue applying your reward. Please contact support.',
          variant: 'destructive',
          duration: 5000
        });
      }
    }, spinDuration);
  };

  // Watch Ad Reward button handler (with Pi Ad Network integration)
  const handleAdRoulette = async () => {
    if (isSubscriber) {
      toast({ title: 'Ad-Free!', description: 'You are a subscriber. Enjoy ad-free rewards!', variant: 'default' });
      return;
    }
    
    // Prevent multiple simultaneous ad requests
    if (isSpinning) {
      toast({ title: 'Please wait', description: 'An ad is already being processed.', variant: 'default' });
      return;
    }
    
    setIsSpinning(true);

    try {
      console.log('🎰 Starting ad roulette...');
      
      // Use the specific roulette spin ad function
      const result = await adService.showRewardedAdForRouletteSpin('wallet');
      
      console.log('🎰 Ad roulette result:', result);
      
      if (result.success) {
        // Ad was successful, spin the roulette
        console.log('🎰 Ad completed successfully, spinning roulette...');
        spinRoulette('ad');
        
        // Show success message
        if (result.reward_amount > 0) {
          toast({ 
            title: 'Ad Completed!', 
            description: `You earned ${result.reward_amount} roulette spins!`, 
            variant: 'default' 
          });
        } else {
          toast({ 
            title: 'Ad Completed!', 
            description: 'Enjoy your roulette spin!', 
            variant: 'default' 
          });
        }
      } else {
        // Ad failed
        console.error('🎰 Ad roulette failed:', result.description);
        toast({ 
          title: 'Ad unavailable', 
          description: result.description || 'Ad could not be loaded. Try again later.', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('🎰 Ad roulette error:', error);
      toast({ 
        title: 'Ad Error', 
        description: 'Failed to load ad. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      // Add a small delay to prevent rapid clicking
      setTimeout(() => {
        setIsSpinning(false);
      }, 1000);
    }
  };


  // Watch Ad for 10 Flappy Coins (rewarded ad)
  const handleWatchAdForCoins = async () => {
    if (isSubscriber) {
      toast({ title: 'Ad-Free!', description: 'You are a subscriber. Enjoy ad-free rewards!', variant: 'default' });
      return;
    }
    
    // Prevent multiple simultaneous ad requests
    if (isSpinning) {
      toast({ title: 'Please wait', description: 'An ad is already being processed.', variant: 'default' });
      return;
    }
    
    setIsSpinning(true);

    try {
      console.log('🪙 Starting ad for coins...');
      
      // Use the specific coins ad function
      const result = await adService.showRewardedAdForCoins('wallet');
      
      console.log('🪙 Ad for coins result:', result);
      
      if (result.success) {
        // Ad was successful, grant coins
        const coinsEarned = result.reward_amount || 10;
        
        console.log(`🪙 Granting ${coinsEarned} coins...`);
        
        // Update balance using direct value
        const newBalance = balance + coinsEarned;
        setBalance(newBalance);
        console.log(`🪙 Balance updated: ${balance} + ${coinsEarned} = ${newBalance}`);
        
        // Also update profile to keep in sync
        if (profile) {
          const updatedProfile = {
            ...profile,
            total_coins: newBalance
          };
          updateProfile(updatedProfile);
        }
        
        // Add transaction record
        addTransaction({
          id: Date.now().toString(),
          type: 'earn',
          amount: coinsEarned,
          reason: 'Ad Reward',
          date: new Date().toISOString()
        });
        
        // Show success message
        toast({ 
          title: `${coinsEarned} Flappy Coins Earned!`, 
          description: result.description || `You earned ${coinsEarned} Flappy Coins for watching an ad.`, 
          variant: 'default' 
        });
        
        console.log('🪙 Ad reward completed successfully');
        
        // Force refresh profile after a short delay to ensure sync
        setTimeout(() => {
          if (updateProfile) {
            updateProfile({});
          }
        }, 500);
        
      } else {
        // Ad failed
        console.error('🪙 Ad for coins failed:', result.description);
        toast({ 
          title: 'Ad unavailable', 
          description: result.description || 'Ad could not be loaded. Try again later.', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('🪙 Ad for coins error:', error);
      toast({ 
        title: 'Ad Error', 
        description: 'Failed to load ad. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      // Add a small delay to prevent rapid clicking
      setTimeout(() => {
        setIsSpinning(false);
      }, 1000);
    }
  };

  // Helper to generate a unique wallet ID using username and pi_user_id
  function getWalletId() {
    if (!profile) return '';
    // Example: username_piuserid (or any hash/format you prefer)
    return `${profile.username}_${profile.pi_user_id}`;
  }

  useEffect(() => {
    // Force refresh profile and balance on mount
    if (updateProfile) {
      (async () => {
        await updateProfile({}); // Triggers a profile fetch
        if (typeof window !== 'undefined') {
          // Wait a tick for profile to update
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.location) {
              window.dispatchEvent(new Event('focus'));
            }
          }, 200);
        }
      })();
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('focus'));
    }
  }, []);

  // Render roulette wheel
  const renderRouletteWheel = () => {
    if (!wheelRewards.length) return null;

    const segments = wheelRewards.length;
    const anglePerSegment = 360 / segments;

    return (
      <div className="relative w-64 h-64 mx-auto">
        {/* Wheel container */}
        <div
          className="relative w-full h-full rounded-full border-4 border-yellow-500 shadow-2xl"
          style={{
            transform: `rotate(${wheelRotation}deg)`,
            transition: isWheelSpinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
          }}
        >
          {wheelRewards.map((reward, index) => {
            const angle = index * anglePerSegment;
            const isSelected = index === wheelSelected;

            return (
              <div
                key={index}
                className={`absolute w-full h-full flex items-center justify-center ${
                  isSelected ? 'animate-pulse' : ''
                }`}
                style={{
                  transform: `rotate(${angle}deg)`,
                  background: `conic-gradient(from ${angle}deg, ${reward.color}20 0deg, ${reward.color}40 ${anglePerSegment * 0.8}deg, ${reward.color}20 ${anglePerSegment}deg)`
                }}
              >
                <div className="transform -rotate-90 w-8 h-8 flex items-center justify-center">
                  <img
                    src={reward.image}
                    alt={reward.name}
                    className="w-6 h-6 object-contain"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Center pointer */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-500 rounded-full border-2 border-white shadow-lg z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full"></div>
        </div>
      </div>
    );
  };

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="flex flex-col items-center justify-center min-h-screen w-full px-2 sm:px-0">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-full p-2 z-20"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className={`text-3xl sm:text-5xl lg:text-7xl font-black mb-4 drop-shadow-lg tracking-wide text-center ${theme === 'night' ? 'text-yellow-300' : 'text-yellow-400'}`} style={{ textShadow: theme === 'night' ? '2px 4px 0 #1e293b' : '2px 4px 0 #2b3990' }}>
          FLAPPY COIN<br />WALLET
        </h1>
        {/* Pi Auth Username Welcome */}
        {(() => {
          // Check for Pi auth username
          const storedPiUser = localStorage.getItem('flappypi-pi-user');
          const storedPiAuth = localStorage.getItem('flappypi-pi-auth');
          let piUsername = null;
          
          if (storedPiAuth === 'true' && storedPiUser) {
            try {
              const parsedUser = JSON.parse(storedPiUser);
              piUsername = parsedUser.username || parsedUser.name;
            } catch (error) {
              console.warn('Failed to parse stored Pi user:', error);
            }
          }
          
          // Also check window.Pi directly for sandbox
          if (!piUsername && typeof window !== 'undefined' && window.Pi) {
            try {
              if (typeof window.Pi.currentUser === 'function') {
                const sandboxUser = window.Pi.currentUser();
                if (sandboxUser && sandboxUser.uid) {
                  piUsername = sandboxUser.username || sandboxUser.name;
                }
              }
            } catch (error) {
              console.warn('Sandbox Pi user check failed:', error);
            }
          }
          
          if (piUsername && piUsername !== 'Player') {
            return (
              <div className={`text-center mb-4 ${theme === 'night' ? 'text-white' : 'text-blue-800'}`}>
                <p className="text-lg sm:text-xl font-bold">Welcome, {piUsername}! 🎉</p>
                <p className="text-sm sm:text-base opacity-75">Pi Network authenticated</p>
              </div>
            );
          }
          return null;
        })()}
        <div className="mb-4 sm:mb-8 relative">
          <img src="/flappycoins.png" alt="Wallet" className="w-32 h-32 sm:w-56 sm:h-56 drop-shadow-2xl mx-auto animate-bounce animate-flap" style={{ animation: 'flap 2.2s ease-in-out infinite, floatX 3.2s ease-in-out infinite' }} />
          <style>{`
            @keyframes flap {
              0%, 100% { transform: translateY(0) scale(1) rotate(-8deg); }
              10% { transform: translateY(-10px) scale(1.05) rotate(8deg); }
              20% { transform: translateY(-18px) scale(1.1) rotate(0deg); }
              30% { transform: translateY(-10px) scale(1.05) rotate(-8deg); }
              40% { transform: translateY(0) scale(1) rotate(8deg); }
              50% { transform: translateY(0) scale(1) rotate(-8deg); }
            }
            @keyframes floatX {
              0%, 100% { left: 0; }
              50% { left: 12px; }
            }
            .animate-flap {
              position: relative;
            }
          `}</style>
        </div>
        <div className="w-full max-w-2xl">
          <WalletBalance className={theme === 'night' ? 'text-white' : 'text-blue-900'} />
        </div>
        {/* Ad Reward Statistics */}
        <div className={`w-full max-w-2xl mb-4 ${theme === 'night' ? 'bg-slate-800/90' : 'bg-white/90'} rounded-xl shadow-xl p-4`}>
          <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme === 'night' ? 'text-yellow-200' : 'text-blue-800'}`}>
            <Trophy className="w-5 h-5 text-yellow-500" />
            Ad Reward Stats
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="text-center">
              <div className={theme === 'night' ? 'font-bold text-yellow-300' : 'font-bold text-blue-600'}>{rouletteStats.totalSpins}</div>
              <div className={theme === 'night' ? 'text-slate-300 text-xs' : 'text-gray-600 text-xs'}>Total Rewards</div>
            </div>
            <div className="text-center">
              <div className={theme === 'night' ? 'font-bold text-green-300' : 'font-bold text-green-600'}>{rouletteStats.totalWinnings}</div>
              <div className={theme === 'night' ? 'text-slate-300 text-xs' : 'text-gray-600 text-xs'}>Total Earned</div>
            </div>
            <div className="text-center">
              <div className={theme === 'night' ? 'font-bold text-purple-300' : 'font-bold text-purple-600'}>{rouletteStats.bestWin}</div>
              <div className={theme === 'night' ? 'text-slate-300 text-xs' : 'text-gray-600 text-xs'}>Best Reward</div>
            </div>
            <div className="text-center">
              <div className={theme === 'night' ? 'font-bold text-orange-300' : 'font-bold text-orange-600'}>{piSpent}</div>
              <div className={theme === 'night' ? 'text-slate-300 text-xs' : 'text-gray-600 text-xs'}>Pi Spent</div>
            </div>
          </div>
        </div>
        <section className="mt-4 sm:mt-8 w-full max-w-2xl">
          <h2 className={`text-lg sm:text-xl font-bold mb-2 text-center sm:text-left ${theme === 'night' ? 'text-yellow-200' : 'text-blue-900'}`}>Transaction History</h2>
          <div className={theme === 'night' ? 'bg-slate-800 rounded-lg shadow p-3 sm:p-4 mx-auto' : 'bg-white rounded-lg shadow p-3 sm:p-4 mx-auto'}>
            {transactions.length === 0 ? (
              <div className={theme === 'night' ? 'text-slate-300 text-center sm:text-left' : 'text-gray-500 text-center sm:text-left'}>No transactions yet.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {transactions.slice(0, 20).map(tx => (
                  <li key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1 sm:gap-0">
                    <span className={`text-sm sm:text-base ${tx.type === 'earn' ? (theme === 'night' ? 'text-green-300' : 'text-green-600') : (theme === 'night' ? 'text-red-400' : 'text-red-600')}`}>{tx.type === 'earn' ? '+' : '-'}{tx.amount} Coins</span>
                    <span className={theme === 'night' ? 'text-slate-200 text-xs sm:text-sm' : 'text-gray-700 text-xs sm:text-sm'}>{tx.reason}</span>
                    <span className={theme === 'night' ? 'text-slate-400 text-xs' : 'text-gray-400 text-xs'}>{new Date(tx.date).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 w-full max-w-2xl">
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-lg sm:text-2xl font-black py-2 sm:py-3 px-6 sm:px-10 rounded-full shadow-lg border-2 sm:border-4 border-yellow-600 transition-all duration-200"
            onClick={() => setShowReceive(true)}
          >
            RECEIVE
          </button>
          <button
            onClick={piBrowserRedirect.isInPiBrowser() && !isSpinning && adCooldown === 0 ? handleWatchAdForCoins : () => piBrowserRedirect.showPiBrowserMessage()}
            className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 mb-3 ${
              piBrowserRedirect.isInPiBrowser() && !isSpinning && adCooldown === 0
                ? 'bg-blue-400 hover:bg-blue-500 text-white disabled:opacity-50' 
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
            disabled={isSpinning || adCooldown > 0 || !piBrowserRedirect.isInPiBrowser()}
          >
            {!piBrowserRedirect.isInPiBrowser() 
              ? '🌐 Pi Browser Required' 
              : adCooldown > 0 
                ? `Ad available in 0:${adCooldown.toString().padStart(2, '0')}` 
                : 'Watch Ad for 10 Coins'
            }
          </button>
          <button
            className="bg-green-400 hover:bg-green-500 text-lg sm:text-2xl font-black py-2 sm:py-3 px-6 sm:px-10 rounded-full shadow-lg border-2 sm:border-4 border-green-600 transition-all duration-200"
            onClick={() => { window.location.href = '/shop?tab=coins'; }}
          >
            <DollarSign className="inline w-4 h-4 sm:w-6 sm:h-6 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">Buy Flappy Coins</span>
          </button>
        </div>
        {/* Watch Ad Reward Section */}
        <div className="w-full max-w-2xl flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className={theme === 'night' ? 'bg-slate-800/90 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col items-center' : 'bg-white/90 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col items-center'}>
            <h2 className={`text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2 ${theme === 'night' ? 'text-yellow-200' : 'text-blue-800'}`}>
              <Gift className="w-5 h-5 sm:w-7 sm:h-7 text-yellow-500" />
              <span className="text-sm sm:text-base">Watch Ad Reward</span>
            </h2>
            <p className={`mb-3 sm:mb-4 text-sm sm:text-base text-center ${theme === 'night' ? 'text-blue-200' : 'text-blue-700'}`}>Watch ads to get rewards!</p>
            <div className="flex items-center gap-2 mb-3">
              {adRouletteRewards.slice(0, 3).map((reward, index) => (
                <div key={index} className="w-8 h-8 rounded-full border-2 border-yellow-400 flex items-center justify-center" style={{ backgroundColor: reward.color + '20' }}>
                  <img src={reward.image} alt={reward.name} className="w-5 h-5" />
                </div>
              ))}
            </div>
            <button
              onClick={piBrowserRedirect.isInPiBrowser() && !isSpinning && adCooldown === 0 ? handleAdRoulette : () => piBrowserRedirect.showPiBrowserMessage()}
              className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 mb-3 ${
                piBrowserRedirect.isInPiBrowser() && !isSpinning && adCooldown === 0
                  ? 'bg-yellow-400 hover:bg-yellow-500 text-white disabled:opacity-50' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
              disabled={isSpinning || adCooldown > 0 || !piBrowserRedirect.isInPiBrowser()}
            >
              {!piBrowserRedirect.isInPiBrowser() 
                ? '🌐 Pi Browser Required' 
                : adCooldown > 0 
                  ? `Ad available in 0:${adCooldown.toString().padStart(2, '0')}` 
                  : 'Watch Ad for Reward'
              }
            </button>
          </div>
        </div>
      </div>
      {/* Buy Coins Modal */}
      <Dialog open={showBuy} onOpenChange={setShowBuy}>
        <DialogContent className="max-w-md w-full bg-white rounded-xl text-center" aria-describedby="wallet-dialog-desc">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-blue-800">Buy Flappy Coins</DialogTitle>
            <DialogDescription id="wallet-dialog-desc">This dialog provides wallet information and actions.</DialogDescription>
          </DialogHeader>
          <div className="my-4 sm:my-6 flex flex-col gap-3 sm:gap-4">
            {buyOptions.map(opt => (
              <button
                key={opt.coins}
                className="bg-yellow-300 hover:bg-yellow-400 text-base sm:text-xl font-black py-2 px-6 sm:px-8 rounded-full shadow-lg border-2 sm:border-4 border-yellow-600 transition-all duration-200 flex items-center justify-center gap-2"
                onClick={() => handleBuy(opt.coins)}
              >
                <img src="/flappycoins.png" alt="Flappy Coin" className="w-4 h-4 sm:w-6 sm:h-6 mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">{opt.coins} Flappy Coins</span>
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                <span className="text-sm sm:text-base">{opt.price} Pi</span>
              </button>
            ))}
          </div>
          <button className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 bg-blue-200 hover:bg-blue-300 rounded-full font-bold text-blue-900 text-sm sm:text-base" onClick={() => setShowBuy(false)}>Cancel</button>
        </DialogContent>
      </Dialog>
      {/* Receive Modal */}
      {showReceive && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center max-w-sm w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3 sm:mb-4 text-center">Receive Flappy Coins</h2>
            <p className="text-blue-800 mb-3 sm:mb-4 text-sm sm:text-base text-center">Feature coming soon! You will be able to receive coins from friends and events.</p>
            <button className="mt-2 px-4 sm:px-6 py-2 bg-blue-200 hover:bg-blue-300 rounded-full font-bold text-blue-900 text-sm sm:text-base" onClick={() => setShowReceive(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Watch Ad Reward Confirmation Modal */}
      <Dialog open={showAdConfirm} onOpenChange={setShowAdConfirm}>
        <DialogContent className="max-w-md w-full text-center" aria-describedby="wallet-ad-confirm-desc">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Watch Ad for Rewards?</DialogTitle>
            <DialogDescription id="wallet-ad-confirm-desc">Watch an ad to get rewards?</DialogDescription>
          </DialogHeader>
          <div className="my-3 sm:my-4 text-sm sm:text-base">Watch an ad to get rewards?</div>
          <div className="flex justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base" onClick={() => { setShowAdConfirm(false); spinRoulette('ad'); }}>
              Yes
            </button>
            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base" onClick={() => setShowAdConfirm(false)}>
              No
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Ad Reward Wheel Modal */}
      {showWheel && (
        <Dialog open={showWheel} onOpenChange={setShowWheel}>
          <DialogContent className="max-w-lg w-full text-center" aria-describedby="wallet-wheel-desc">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-blue-800">🎁 Watch Ad for Rewards!</DialogTitle>
              <DialogDescription id="wallet-wheel-desc">Watch an ad to earn your reward.</DialogDescription>
            </DialogHeader>
            <div className="my-6">
              <SlotMachine
                items={wheelRewards.map(r => ({ image: r.image, name: r.name }))}
                resultIndex={wheelSelected}
                spinning={isWheelSpinning}
                onSpinEnd={() => {
                  setIsWheelSpinning(false);
                  setShowWheel(false);
                  setShowRewardModal(true);
                  setRewardToShow(wheelRewards[wheelSelected]);
                  setShowConfetti(true);
                  // Apply the reward
                  const result = wheelRewards[wheelSelected];
                  if (result.type === 'coin' && 'amount' in result && typeof result.amount === 'number' && result.amount > 0) {
                    setBalance(balance + result.amount);
                  } else if (result.type === 'powerup') {
                    addPowerUpToInventory(result.id);
                  } else if (result.type === 'mysterybox') {
                    addMysteryBoxToInventory(result.id);
                  }
                }}
              />
            </div>
            <div className="text-gray-600 text-sm">
              {isWheelSpinning ? 'Spinning...' : 'Wheel is spinning!'}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Enhanced Reward Modal with Confetti */}
      {showRewardModal && rewardToShow && (
        <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
          <DialogContent className="max-w-md w-full text-center" aria-describedby="wallet-reward-desc">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-blue-800">
                {showConfetti ? '🎉 You Won!' : 'Result'}
              </DialogTitle>
              <DialogDescription id="wallet-reward-desc">Your ad reward result.</DialogDescription>
            </DialogHeader>
            {showConfetti && (
              <div className="flex flex-col items-center justify-center my-6">
                <div className="relative">
                  <img
                    src={rewardToShow.image}
                    alt={rewardToShow.name}
                    className="w-24 h-24 mx-auto mb-4 drop-shadow-xl animate-bounce"
                  />
                  {rewardToShow.rarity === 'legendary' && (
                    <Crown className="absolute -top-2 -right-2 w-8 h-8 text-yellow-500 animate-pulse" />
                  )}
                  {rewardToShow.rarity === 'rare' && (
                    <Star className="absolute -top-2 -right-2 w-6 h-6 text-purple-500 animate-pulse" />
                  )}
                </div>
                <div className="text-2xl font-bold mb-2" style={{ color: rewardToShow.color }}>
                  {rewardToShow.name}
                </div>
                {rewardToShow.type === 'coin' && 'amount' in rewardToShow && typeof rewardToShow.amount === 'number' && rewardToShow.amount > 0 && (
                  <div className="text-lg text-blue-800 font-semibold">+{rewardToShow.amount} Flappy Coins!</div>
                )}
                {rewardToShow.type === 'powerup' && (
                  <div className="text-lg text-blue-800 font-semibold">Power-Up added to your inventory!</div>
                )}
                {rewardToShow.type === 'mysterybox' && (
                  <div className="text-lg text-blue-800 font-semibold">Mystery Box added to your inventory!</div>
                )}
                {rewardToShow.type === 'none' && (
                  <div className="text-lg text-red-500 font-semibold">Better luck next time!</div>
                )}

                {/* Confetti effect */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${1 + Math.random()}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <button
              className="mt-4 px-6 py-2 bg-blue-200 hover:bg-blue-300 rounded-full font-bold text-blue-900"
              onClick={() => {
                setShowRewardModal(false);
                setShowConfetti(false);
              }}
            >
              Awesome!
            </button>
          </DialogContent>
        </Dialog>
      )}

      {/* Wallet Footer NPC */}
      <FooterNPC
        npcType="default"
        npcName="Wallet NPC"
        dialogs={[
          "Welcome to your Flappy Coin Wallet!",
          "Check your balance and recent transactions here.",
          "Spin the roulette for a chance to win more coins!",
          "Buy Flappy Coins to unlock new items.",
          "Watch ads to earn free coins!",
          "Keep your wallet safe and secure.",
          "Collect coins to climb the leaderboard!",
          "Use your coins to buy power-ups and mystery boxes.",
          "Come back daily for rewards!",
          "Good luck and happy collecting! 🪙"
        ]}
      />
      <EnhancedFooter
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
    </SkyBackground>
  );
};

export default WalletPage; 