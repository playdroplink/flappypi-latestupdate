import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Gift, Calendar, Star, Coins, Crown, Shield, Zap, Heart, ArrowLeft } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { inventoryService } from '@/services/inventoryService';
import { useGlobalMusic } from '@/hooks/useGlobalMusic';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import HeaderWithPiAuth from '@/components/HeaderWithPiAuth';
import EnhancedFooter from '@/components/EnhancedFooter';
import FooterNPC from '@/components/FooterNPC';
import { getNextNpcInRotation } from '@/utils/npcRotation';

interface DailyRewardsPageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const DailyRewardsPage: React.FC<DailyRewardsPageProps> = ({ 
  musicEnabled, 
  setMusicEnabled, 
  soundEnabled, 
  setSoundEnabled 
}) => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { addCoins } = useWallet();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isAuthenticated, username, isPiAuth, piUser } = useAuth();
  const { theme } = useTheme();
  const [npcGif, setNpcGif] = useState<string>('');
  
  const [currentDay, setCurrentDay] = useState(1);
  const [claimedDays, setClaimedDays] = useState<number[]>([]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [currentReward, setCurrentReward] = useState<any>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  
  // Subscription-based daily rewards
  const [subscriptionReward, setSubscriptionReward] = useState<any>(null);
  const [showSubscriptionRewardModal, setShowSubscriptionRewardModal] = useState(false);
  const [isClaimingSubscriptionReward, setIsClaimingSubscriptionReward] = useState(false);

  // Initialize NPC GIF
  useEffect(() => {
    if (!npcGif) {
      setNpcGif(getNextNpcInRotation('daily-rewards'));
    }
  }, [npcGif]);

  // 7-day reward structure (Global - available to all users)
  const dailyRewards = [
    { 
      day: 1, 
      type: 'coins', 
      amount: 100, 
      icon: '🪙', 
      name: '100 Flappy Coins',
      description: 'Start your week with coins!'
    },
    { 
      day: 2, 
      type: 'powerup', 
      powerupId: 'shield',
      icon: '🛡️', 
      name: 'Shield Power-up',
      description: 'Protection for your next game!'
    },
    { 
      day: 3, 
      type: 'coins', 
      amount: 150, 
      icon: '💎', 
      name: '150 Flappy Coins',
      description: 'More coins to spend!'
    },
    { 
      day: 4, 
      type: 'powerup', 
      powerupId: 'extra_life',
      icon: '❤️', 
      name: 'Extra Life',
      description: 'Second chance in game!'
    },
    { 
      day: 5, 
      type: 'coins', 
      amount: 200, 
      icon: '⭐', 
      name: '200 Flappy Coins',
      description: 'Bigger reward for consistency!'
    },
    { 
      day: 6, 
      type: 'powerup', 
      powerupId: 'coin_multiplier',
      icon: '⚡', 
      name: '2x Coin Multiplier',
      description: 'Double your coin earnings!'
    },
    { 
      day: 7, 
      type: 'coins', 
      amount: 500, 
      icon: '👑', 
      name: '500 Flappy Coins',
      description: 'Weekly bonus for completing all days!'
    }
  ];

  // Subscription-based daily rewards (Premium users only)
  const subscriptionDailyRewards = {
    starter: {
      name: 'Starter Pack Daily Reward',
      icon: '⭐',
      type: 'coins',
      amount: 500,
      description: 'Daily bonus for Starter Pack subscribers!',
      color: 'from-blue-500 to-cyan-500'
    },
    premium: {
      name: 'Premium Pack Daily Reward',
      icon: '👑',
      type: 'coins',
      amount: 1000,
      description: 'Daily bonus for Premium Pack subscribers!',
      color: 'from-purple-500 to-pink-500'
    },
    ultimate: {
      name: 'Ultimate Pack Daily Reward',
      icon: '🔥',
      type: 'coins',
      amount: 2000,
      description: 'Daily bonus for Ultimate Pack subscribers!',
      color: 'from-yellow-500 to-orange-500'
    }
  };

  useEffect(() => {
    // Load daily rewards data from localStorage
    const savedDay = localStorage.getItem('flappypi-daily-day');
    const savedClaimed = localStorage.getItem('flappypi-daily-claimed');
    const lastLogin = localStorage.getItem('flappypi-last-login');
    const today = new Date().toDateString();

    if (lastLogin !== today) {
      // New day, increment current day
      const newDay = savedDay ? Math.min(parseInt(savedDay) + 1, 7) : 1;
      setCurrentDay(newDay);
      localStorage.setItem('flappypi-daily-day', newDay.toString());
      localStorage.setItem('flappypi-last-login', today);
    } else if (savedDay) {
      setCurrentDay(parseInt(savedDay));
    }

    if (savedClaimed) {
      setClaimedDays(JSON.parse(savedClaimed));
    }

    // Check subscription status and set subscription reward
    checkSubscriptionStatus();
  }, []);

  // Check user's subscription status
  const checkSubscriptionStatus = () => {
    const status = inventoryService.getSubscriptionStatus();
    if (status.hasActiveSubscription && status.subscriptionType) {
      const planId = status.subscriptionType.replace('-subscription', '');
      if (subscriptionDailyRewards[planId]) {
        setSubscriptionReward(subscriptionDailyRewards[planId]);
      }
    }
  };

  // Check if user can claim subscription reward
  const canClaimSubscriptionReward = () => {
    if (!subscriptionReward) return false;
    
    const lastSubscriptionClaim = localStorage.getItem('flappypi-subscription-daily-claimed');
    const today = new Date().toDateString();
    
    return lastSubscriptionClaim !== today;
  };

  const canClaim = (day: number) => {
    return day <= currentDay && !claimedDays.includes(day);
  };

  const handleClaimReward = async (reward: any) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to claim rewards.',
        variant: 'destructive'
      });
      return;
    }

    setIsClaiming(true);
    setCurrentReward(reward);
    setShowClaimModal(true);

    try {
      if (reward.type === 'coins') {
        // Add coins to wallet
        await addCoins(reward.amount, `Daily Reward Day ${reward.day}`);
        toast({
          title: 'Coins Claimed! 🪙',
          description: `You received ${reward.amount} Flappy Coins!`,
          duration: 3000
        });
      } else if (reward.type === 'powerup') {
        // Add power-up to inventory
        const powerupData = {
          id: reward.powerupId,
          name: reward.name,
          type: 'powerup' as const,
          quantity: 1,
          rarity: 'Common' as const,
          description: reward.description,
          icon: reward.icon
        };
        
        inventoryService.saveToInventory(powerupData);
        toast({
          title: 'Power-up Claimed! ⚡',
          description: `${reward.name} added to your inventory!`,
          duration: 3000
        });
      }

      // Mark day as claimed
      const newClaimedDays = [...claimedDays, reward.day];
      setClaimedDays(newClaimedDays);
      localStorage.setItem('flappypi-daily-claimed', JSON.stringify(newClaimedDays));

    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: 'Claim Failed',
        description: 'Failed to claim reward. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsClaiming(false);
      setTimeout(() => setShowClaimModal(false), 2000);
    }
  };

  // Handle subscription daily reward claim
  const handleClaimSubscriptionReward = async () => {
    if (!isAuthenticated || !subscriptionReward) {
      toast({
        title: 'Login Required',
        description: 'Please log in to claim subscription rewards.',
        variant: 'destructive'
      });
      return;
    }

    setIsClaimingSubscriptionReward(true);
    setShowSubscriptionRewardModal(true);

    try {
      // Add coins to wallet
      await addCoins(subscriptionReward.amount, `Subscription Daily Reward: ${subscriptionReward.name}`);
      
      // Mark as claimed for today
      const today = new Date().toDateString();
      localStorage.setItem('flappypi-subscription-daily-claimed', today);
      
      toast({
        title: 'Subscription Reward Claimed! 🎁',
        description: `You received ${subscriptionReward.amount} Flappy Coins from your subscription!`,
        duration: 3000
      });

    } catch (error) {
      console.error('Error claiming subscription reward:', error);
      toast({
        title: 'Claim Failed',
        description: 'Failed to claim subscription reward. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsClaimingSubscriptionReward(false);
      setTimeout(() => setShowSubscriptionRewardModal(false), 2000);
    }
  };

  const getRewardIcon = (reward: any) => {
    switch (reward.type) {
      case 'coins':
        return <Coins className="w-6 h-6 text-yellow-500" />;
      case 'powerup':
        switch (reward.powerupId) {
          case 'shield':
            return <Shield className="w-6 h-6 text-blue-500" />;
          case 'extra_life':
            return <Heart className="w-6 h-6 text-red-500" />;
          case 'coin_multiplier':
            return <Zap className="w-6 h-6 text-yellow-500" />;
          default:
            return <Star className="w-6 h-6 text-purple-500" />;
        }
      default:
        return <Gift className="w-6 h-6 text-green-500" />;
    }
  };

  const getRewardColor = (reward: any, isClaimed: boolean, canClaimToday: boolean) => {
    if (isClaimed) return 'bg-green-500/20 border-green-400/50';
    if (canClaimToday) return 'bg-yellow-500/20 border-yellow-400/50 animate-pulse';
    return 'bg-gray-500/20 border-gray-400/50';
  };

  const dailyRewardsDialogs = [
    "🎁 Welcome to Daily Rewards! Claim your daily bonuses!",
    "💎 Subscribe for exclusive daily rewards and bonuses!",
    "⭐ Complete all 7 days for the weekly bonus reward!",
    "🪙 Earn coins and power-ups every day you play!",
    "🛡️ Power-ups help you in your Flappy Pi adventures!",
    "⚡ Don't miss a day - consistency is key to big rewards!",
    "👑 Premium subscribers get extra daily bonuses!",
    "🎯 Check back every day for new rewards and surprises!"
  ];

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={`relative min-h-screen transition-colors duration-500 ${
        theme === 'night' 
          ? 'bg-gradient-to-b from-gray-900 via-blue-900 to-black' 
          : 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'
      }`}>
        <HeaderWithPiAuth title="Daily Rewards" showNavigation={true} />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-4 text-white">Login Required</h2>
            <p className="text-white/80 mb-6">
              Please log in to access daily rewards and claim your bonuses!
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="bg-white text-purple-600 hover:bg-white/90 font-bold px-6 py-3"
            >
              Go to Login
            </Button>
          </div>
        </div>
        <EnhancedFooter 
          musicEnabled={musicEnabled}
          setMusicEnabled={setMusicEnabled}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${
      theme === 'night' 
        ? 'bg-gradient-to-b from-gray-900 via-blue-900 to-black' 
        : 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'
    }`}>
      {/* Header with Pi Authentication */}
      <HeaderWithPiAuth title="Daily Rewards" showNavigation={true} />
      
      {/* Night mode visuals */}
      {theme === 'night' && (
        <>
          {/* Starfield */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {[...Array(60)].map((_, i) => {
              const sizePx = Math.random() * 2 + 1;
              const durationSec = 0.8 + Math.random() * 0.9;
              const delaySec = Math.random() * 1.5;
              return (
                <div
                  key={i}
                  className="absolute rounded-full bg-white opacity-80 animate-twinkle"
                  style={{
                    width: `${sizePx}px`,
                    height: `${sizePx}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${delaySec}s`,
                    animationDuration: `${durationSec}s`,
                    animationTimingFunction: 'ease-in-out',
                  }}
                />
              );
            })}
            {/* Moon */}
            <div className="absolute right-12 top-12 w-24 h-24 bg-gradient-to-br from-yellow-200 via-yellow-100 to-white rounded-full shadow-2xl border-4 border-yellow-100 opacity-90 animate-moon-glow" />
          </div>
          <style>{`
            @keyframes twinkle {
              0%, 100% { opacity: 0.95; transform: scale(1); }
              50% { opacity: 0.25; transform: scale(0.85); }
            }
            .animate-twinkle {
              animation: twinkle 1.3s infinite;
            }
            @keyframes moon-glow {
              0%, 100% { box-shadow: 0 0 32px 8px #fef9c3, 0 0 0 0 #fff0; }
              50% { box-shadow: 0 0 64px 24px #fde68a, 0 0 0 0 #fff0; }
            }
            .animate-moon-glow {
              animation: moon-glow 2.5s infinite;
            }
          `}</style>
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Progress Info */}
        <div className="text-center mb-8">
          <div className={`rounded-2xl p-6 mb-4 shadow-lg ${
            theme === 'night' 
              ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' 
              : 'bg-white/20 backdrop-blur-sm border border-white/30'
          }`}>
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 mr-2 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Daily Rewards</h2>
            </div>
            <p className="text-lg text-white/90 mb-2">
              Current Day: <span className="font-bold text-yellow-300">{currentDay}/7</span>
            </p>
            <p className="text-sm text-white/70">
              {claimedDays.length} of 7 days claimed this week
            </p>
          </div>
          
          {claimedDays.length === 7 && (
            <div className="bg-green-500/20 rounded-2xl p-6 border border-green-400/50 shadow-lg">
              <p className="text-green-300 font-bold text-xl mb-2">🎉 Week Complete! 🎉</p>
              <p className="text-green-200 text-sm">Come back next week for more rewards!</p>
            </div>
          )}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          {dailyRewards.map((reward) => {
            const isClaimed = claimedDays.includes(reward.day);
            const canClaimToday = canClaim(reward.day);
            
            return (
              <Card 
                key={reward.day}
                className={`p-4 text-center border-2 transition-all duration-200 cursor-pointer hover:scale-105 rounded-2xl shadow-lg ${
                  getRewardColor(reward, isClaimed, canClaimToday)
                } ${theme === 'night' ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/20 backdrop-blur-sm'}`}
                onClick={() => canClaimToday && handleClaimReward(reward)}
              >
                <div className="text-4xl mb-3">{reward.icon}</div>
                <div className="text-sm font-bold text-white mb-2">Day {reward.day}</div>
                <div className="text-xs text-yellow-300 mb-2 font-semibold">{reward.name}</div>
                <div className="text-xs text-white/70 mb-3 leading-relaxed">{reward.description}</div>
                
                {isClaimed && (
                  <div className="text-xs text-green-300 mt-2 font-bold flex items-center justify-center">
                    <span className="mr-1">✓</span> Claimed
                  </div>
                )}
                
                {canClaimToday && !isClaimed && (
                  <div className="text-xs text-yellow-300 mt-2 animate-pulse font-bold">
                    🎁 Click to Claim!
                  </div>
                )}
                
                {!canClaimToday && !isClaimed && (
                  <div className="text-xs text-gray-400 mt-2">
                    {reward.day > currentDay ? 'Coming Soon' : 'Missed'}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Claim Button for Current Day */}
        {dailyRewards.filter(r => canClaim(r.day)).length > 0 && (
          <div className="text-center mb-8">
            {dailyRewards
              .filter(r => canClaim(r.day))
              .slice(0, 1)
              .map(reward => (
                <Button
                  key={reward.day}
                  onClick={() => handleClaimReward(reward)}
                  disabled={isClaiming}
                  className="w-full max-w-md bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 shadow-lg py-4 rounded-2xl transform hover:scale-105 transition-all duration-200 text-lg font-bold"
                >
                  <Gift className="mr-3 h-6 w-6" />
                  {isClaiming ? 'Claiming...' : `Claim Day ${reward.day} - ${reward.name}`}
                </Button>
              ))}
          </div>
        )}

        {/* Subscription Daily Reward Section */}
        {subscriptionReward ? (
          <div className={`mt-8 rounded-2xl p-6 border-2 border-purple-400/50 shadow-lg ${
            theme === 'night' 
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20' 
              : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20'
          }`}>
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-purple-300 mb-2">💎 Subscription Daily Reward</h3>
              <p className="text-purple-200 text-sm">Exclusive daily bonus for subscribers!</p>
            </div>
            
            <div className="flex items-center justify-center mb-4">
              <div className={`bg-gradient-to-r ${subscriptionReward.color} rounded-full p-4 text-white text-3xl`}>
                {subscriptionReward.icon}
              </div>
            </div>
            
            <div className="text-center mb-4">
              <h4 className="text-lg font-bold text-white mb-2">{subscriptionReward.name}</h4>
              <p className="text-white/80 text-sm mb-2">{subscriptionReward.description}</p>
              <div className="text-2xl font-bold text-yellow-300">+{subscriptionReward.amount} Flappy Coins</div>
            </div>
            
            {canClaimSubscriptionReward() ? (
              <div className="text-center">
                <Button
                  onClick={handleClaimSubscriptionReward}
                  disabled={isClaimingSubscriptionReward}
                  className="w-full max-w-md bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg py-4 rounded-2xl transform hover:scale-105 transition-all duration-200 text-lg font-bold"
                >
                  <span className="text-2xl mr-3">💎</span>
                  {isClaimingSubscriptionReward ? 'Claiming...' : 'Claim Subscription Reward'}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-green-300 font-bold">✓ Already Claimed Today</div>
                <div className="text-green-200 text-sm">Come back tomorrow for more rewards!</div>
              </div>
            )}
          </div>
        ) : (
          <div className={`mt-8 rounded-2xl p-6 border-2 border-gray-400/50 shadow-lg ${
            theme === 'night' 
              ? 'bg-gradient-to-r from-gray-500/20 to-gray-600/20' 
              : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20'
          }`}>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-300 mb-2">🔒 Subscription Daily Rewards</h3>
              <p className="text-gray-200 text-sm mb-4">Subscribe to unlock exclusive daily rewards!</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-4 border border-blue-400/50">
                  <div className="text-2xl mb-2">⭐</div>
                  <div className="font-bold text-blue-300">Starter Pack</div>
                  <div className="text-blue-200 text-sm">+500 coins daily</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-4 border border-purple-400/50">
                  <div className="text-2xl mb-2">👑</div>
                  <div className="font-bold text-purple-300">Premium Pack</div>
                  <div className="text-purple-200 text-sm">+1000 coins daily</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 border border-yellow-400/50">
                  <div className="text-2xl mb-2">🔥</div>
                  <div className="font-bold text-yellow-300">Ultimate Pack</div>
                  <div className="text-yellow-200 text-sm">+2000 coins daily</div>
                </div>
              </div>
              
              <Button
                onClick={() => navigate('/subscription-plans')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg py-3 px-6 rounded-2xl transform hover:scale-105 transition-all duration-200 font-bold"
              >
                💎 Subscribe Now
              </Button>
            </div>
          </div>
        )}

        {/* How Daily Rewards Work */}
        <div className={`mt-8 rounded-2xl p-6 shadow-lg ${
          theme === 'night' 
            ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' 
            : 'bg-white/20 backdrop-blur-sm border border-white/30'
        }`}>
          <h3 className="text-xl font-bold text-white mb-4 text-center">How Daily Rewards Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-green-300 mb-3 flex items-center">
                <span className="mr-2">✓</span> Claim Daily
              </h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• Login every day to claim your reward</li>
                <li>• Each day offers a different reward</li>
                <li>• Coins and power-ups alternate</li>
                <li>• Subscribe for exclusive daily bonuses</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center">
                <span className="mr-2">⚠️</span> Don't Miss Out
              </h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• If you skip a day, you miss that reward</li>
                <li>• Rewards reset weekly</li>
                <li>• Complete all 7 days for bonus rewards</li>
                <li>• Subscription rewards are daily bonuses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer NPC */}
      <div className="mt-8">
        <FooterNPC
          npcType="default"
          dialogs={dailyRewardsDialogs}
          npcName="Rewards Guide"
        />
      </div>

      {/* Enhanced Footer */}
      <EnhancedFooter 
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Claim Modal */}
      <Dialog open={showClaimModal} onOpenChange={setShowClaimModal}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-gray-800">
              🎉 Reward Claimed! 🎉
            </DialogTitle>
          </DialogHeader>
          
          {currentReward && (
            <div className="text-center">
              <div className="text-4xl mb-4">{currentReward.icon}</div>
              <div className="text-lg font-bold text-gray-800 mb-2">
                {currentReward.name}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {currentReward.description}
              </div>
              
              {currentReward.type === 'coins' && (
                <div className="bg-yellow-100 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 font-bold">
                    +{currentReward.amount} Flappy Coins added to your wallet!
                  </p>
                </div>
              )}
              
              {currentReward.type === 'powerup' && (
                <div className="bg-blue-100 rounded-lg p-3 mb-4">
                  <p className="text-blue-800 font-bold">
                    {currentReward.name} added to your inventory!
                  </p>
                </div>
              )}
            </div>
          )}
          
          <Button
            onClick={() => setShowClaimModal(false)}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Awesome!
          </Button>
        </DialogContent>
      </Dialog>

      {/* Subscription Reward Modal */}
      <Dialog open={showSubscriptionRewardModal} onOpenChange={setShowSubscriptionRewardModal}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-gray-800">
              💎 Subscription Reward Claimed! 💎
            </DialogTitle>
          </DialogHeader>
          
          {subscriptionReward && (
            <div className="text-center">
              <div className={`bg-gradient-to-r ${subscriptionReward.color} rounded-full p-4 text-white text-4xl mb-4`}>
                {subscriptionReward.icon}
              </div>
              <div className="text-lg font-bold text-gray-800 mb-2">
                {subscriptionReward.name}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {subscriptionReward.description}
              </div>
              
              <div className="bg-purple-100 rounded-lg p-3 mb-4">
                <p className="text-purple-800 font-bold">
                  +{subscriptionReward.amount} Flappy Coins added to your wallet!
                </p>
                <p className="text-purple-600 text-sm">
                  Thank you for being a subscriber! 💎
                </p>
              </div>
            </div>
          )}
          
          <Button
            onClick={() => setShowSubscriptionRewardModal(false)}
            className="mt-4 bg-purple-500 hover:bg-purple-600 text-white"
          >
            Thank You! 💎
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyRewardsPage; 