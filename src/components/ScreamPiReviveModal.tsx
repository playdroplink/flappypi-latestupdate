import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Heart, Play, Coins, Star, X, Zap, Crown, RefreshCw } from 'lucide-react';
import { adService } from '../services/adService';
import { useUserProfile } from '../hooks/useUserProfile';
import SubscriptionPlansModal from './SubscriptionPlansModal';
import { useToast } from '../hooks/use-toast';
import ConfirmationModal from './ConfirmationModal';
import SubscriptionNPC from './SubscriptionNPC';
import { useWallet } from '../context/WalletContext';
import { inventoryService } from '../services/inventoryService';
import { useRewardedAdCooldown } from '../hooks/useRewardedAdCooldown';
import { piBrowserRedirect } from '@/utils/piBrowserRedirect';
import ErrorFreeImage from './ErrorFreeImage';

const watchAdsImg = '/npc gif/watchads.gif.gif';
const adFreeImg = '/flappy pi gif 2/adfree.gif';

interface ScreamPiReviveModalProps {
  isVisible: boolean;
  score: number;
  onRevive: (reviveType?: 'coin' | 'ad' | 'premium' | 'extra_life') => void;
  onDecline: () => void;
  hasUnlimitedRevives?: boolean;
  reviveCount?: number;
  insufficientCoins?: boolean;
  noCancel?: boolean;
  forceAdRevive?: boolean;
  onAdDecline?: () => void;
  characterImage?: string;
  characterName?: string;
  extraLives?: number;
  onUseExtraLife?: () => void;
}

const AD_DIALOGS = [
  "Watching ads? You're powering new features! 🔧",
  "Pi ads = faster updates! Thanks for your support! 💡",
  "Every ad fuels rewards for YOU and others! 🪙",
  "Pi revenue helps us build awesome new stuff! 🛠️",
  "You scream, we grow — with Pi from ads! 🚀",
  "Thanks! Your ad helped fund future Pi prizes! 🎁",
  "Ads keep the skies open and rewards flowing! ☁️",
  "Pi from ads goes right back to players! 🔄",
  "Ads = upgrades = more ways to earn Pi! 📈",
  "The more ads, the more rewards for YOU! 🤑",
  "Ad views support new game features! 🙌",
  "We reinvest Pi to make things better! 💎",
  "Ads help us grow Scream Pi — together! 🤝",
  "Every ad helps unlock new game modes! 🎮",
  "Pi from ads = more characters, skins, and fun! 🎭",
  "Love rewards? Watch ads and grow the game! 🌱",
  "AdPi is returned to YOU in challenges! 🏆",
  "Ads = faster character evolution updates! 🔥",
  "Skins. Rewards. All powered by ads. 🎨",
  "You just helped develop voice controls. Nice! 🎤",
  "Pi revenue helps fund tournaments! 🥇",
  "Ads support real Pi rewards for everyone! 🌍",
  "Thanks for helping us scream higher! 🗣️",
  "Want voice battles sooner? Watch ads! 🎯",
  "Your support = more Pi challenges! 🎯",
  "Every ad = new possibilities. 💫",
  "Ads feed the character... and the devs. 😅",
  "Your view helped create a new feature! 🎭",
  "More views, more updates! 📺",
  "Keep watching — you're building the future! 🛤️",
  "Pi you generate helps all players! 🤗",
  "Ad revenue boosts reward drops! 🎉",
  "More coins, more modes — thanks to ads! 🪙",
  "Ads = power-ups in progress! ⚡",
  "You're fueling the Screamverse! 🌌",
  "That ad? Helped fund your next character. 😉",
  "Watch, scream, repeat. We'll handle the rest! 🔁",
  "You're co-creating Scream Pi! 👷",
  "Every second you watch counts. 🕒",
  "That ad funded a mystery character. 🎭",
  "Bigger updates come from Pi ad love! 💛",
  "AdPi is 100% recycled into game fun! ♻️",
  "You play. We build. All Pi-powered. ⚙️",
  "Ads are wings for future features! 🪽",
  "Ads aren't ads — they're upgrades! 🧱",
  "Watchers unlock world events! 🗺️",
  "Keep watching to earn and evolve! 📲",
  "That ad just boosted the dev nest! 🐣",
  "Your support means more Pi for all! 🎊",
  "The Scream Pi future? You're helping fund it! 🧠"
];

const ADFREE_DIALOGS = [
  "No ads, just pure screaming! 🎮",
  "Enjoy a cleaner voice — go Ad-Free! 🎤",
  "Want peace? Upgrade to Ad-Free! ☁️",
  "No ads, more focus. Scream freely! 🗣️",
  "Ad-Free voice? You got it! 🛫",
  "Unlock ad-free skies now! 🔓",
  "Less ads, more screams. Let's go! 💨",
  "Say goodbye to ads forever! 👋",
  "Tired of ads? Go premium! 🛒",
  "Upgrade for an ad-free life! 🌈",
  "Smooth skies await — no ads! 🚀",
  "Go Ad-Free, scream non-stop! 🔄",
  "One price, endless clean voice! 💰",
  "Enjoy silence between obstacles! 🤫",
  "Ads off. Game on. 🕹️",
  "Want focus mode? Get Ad-Free! 🎯",
  "Cut the noise. Go ad-free! ✂️",
  "Buy once, enjoy forever! ♾️",
  "Freedom is a tap away! 🆓",
  "Block ads. Boost fun! 💥",
  "Scream fast, skip ads! 🏃‍♂️💨",
  "Ads off = 100% skill mode! 🔥",
  "Feel the smooth ride! 🎢",
  "Premium skies unlocked! 🪂",
  "Support devs, get no ads! 🙏",
  "Keep screaming — no breaks! 🎭",
  "Ad-Free zone activated! ✅",
  "Want quiet skies? Ad-Free it! 🤐",
  "Tap here for ad-free power! ⚡",
  "You earned it — go Ad-Free! 🏆",
  "Get serious. Lose the ads. 😎",
  "Stay focused, scream clean! 🧠",
  "Silence is golden. And Pi too. 💎",
  "Reward yourself: no more ads! 🎁",
  "Skip ads, stay in the zone! 🌀",
  "Elite screamers scream ad-free! ✈️",
  "Ad-Free is the pro way. 🧙",
  "Clean UI. Pure voice. 🧼",
  "Pay once, play forever ad-free! 🔁",
  "Ad-Free = max immersion! 🌌",
  "Break the chains — no more ads! 🔓",
  "Scream forever. No ads ever. 🔄",
  "All fun, zero interruption! 🚫",
  "The skies are cleaner here. 🌤️",
  "Skip the ads. Save your rhythm! 🥁",
  "Ad-Free is the best way to scream! 🕊️",
  "Buy once, no ads for life! 🛍️",
  "The character approves: Ad-Free! 🎭👍",
  "Escape ad-land, go premium! 🗺️",
  "Ad-Free = speed, skill, serenity! 🎯"
];

const ScreamPiReviveModal: React.FC<ScreamPiReviveModalProps> = ({
  isVisible,
  score,
  onRevive,
  onDecline,
  hasUnlimitedRevives = false,
  reviveCount = 0,
  insufficientCoins = false,
  noCancel = false,
  forceAdRevive = false,
  onAdDecline,
  characterImage = '/npc/nicolas.png',
  characterName = 'NPC',
  extraLives = 0,
  onUseExtraLife,
}) => {
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [adError, setAdError] = useState(false);
  const [showPremiumOffer, setShowPremiumOffer] = useState(false);
  const [showCoinConfirm, setShowCoinConfirm] = useState(false);
  const [showSubscriptionButton, setShowSubscriptionButton] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSubscriptionConfirm, setShowSubscriptionConfirm] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [showAdConfirm, setShowAdConfirm] = useState(false);
  const [adDialog, setAdDialog] = useState(AD_DIALOGS[Math.floor(Math.random() * AD_DIALOGS.length)]);
  const [adFreeDialog, setAdFreeDialog] = useState(ADFREE_DIALOGS[Math.floor(Math.random() * ADFREE_DIALOGS.length)]);
  
  // Progressive revive cost: starts at 10, adds 10 for each revive
  const baseReviveCost = 10;
  const progressiveReviveCost = baseReviveCost + (reviveCount * 10);
  const { profile, updateProfile, refreshProfile } = useUserProfile();
  const { toast } = useToast();
  const { spendCoins, balance } = useWallet();

  // Get real-time subscription status from inventory service
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const adCooldown = useRewardedAdCooldown();

  useEffect(() => {
    // Check subscription status from inventory service
    const checkSubscriptionStatus = () => {
      const status = inventoryService.getSubscriptionStatus();
      setHasActiveSubscription(status.hasActiveSubscription);
    };

    // Check immediately
    checkSubscriptionStatus();

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkSubscriptionStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  // Add a check for active subscription (fallback to profile)
  const isSubscriber = hasActiveSubscription || (profile?.has_active_subscription && new Date(profile.subscription_end) > new Date());

  // Listen for subscription expiration events
  useEffect(() => {
    const handleInventoryUpdated = (event: CustomEvent) => {
      if (event.detail.type === 'subscription') {
        const status = inventoryService.getSubscriptionStatus();
        setHasActiveSubscription(status.hasActiveSubscription);
      }
    };

    window.addEventListener('inventoryUpdated', handleInventoryUpdated);
    return () => window.removeEventListener('inventoryUpdated', handleInventoryUpdated);
  }, []);

  useEffect(() => {
    if (isVisible) {
      setAdDialog(AD_DIALOGS[Math.floor(Math.random() * AD_DIALOGS.length)]);
      setAdFreeDialog(ADFREE_DIALOGS[Math.floor(Math.random() * ADFREE_DIALOGS.length)]);
    }
  }, [isVisible]);

  const handleCoinRevive = async () => {
    // Multiple validation checks to prevent bypass
    const currentBalance = balance || 0;
    const requiredCost = progressiveReviveCost;
    
    if (currentBalance < requiredCost) {
      toast({
        title: "Insufficient Flappy Coins",
        description: `You need ${requiredCost} Flappy Coins to revive and get 3 lives. You have ${currentBalance} coins.`,
        variant: "destructive",
      });
      return;
    }
    
    // Additional check to ensure balance hasn't changed
    if (insufficientCoins) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough Flappy Coins to revive. Please earn more coins first.",
        variant: "destructive",
      });
      return;
    }
    
    setShowCoinConfirm(true);
  };

  const handleCoinConfirmYes = async () => {
    // Final validation before spending coins
    const currentBalance = balance || 0;
    const requiredCost = progressiveReviveCost;
    
    if (currentBalance < requiredCost) {
      toast({
        title: "Insufficient Flappy Coins",
        description: `You need ${requiredCost} Flappy Coins to revive and get 3 lives. You have ${currentBalance} coins.`,
        variant: "destructive",
      });
      setShowCoinConfirm(false);
      return;
    }
    
    try {
      const success = await spendCoins(requiredCost, 'Scream Pi Revive - 3 Lives');
      if (success) {
        onRevive('coin');
        setShowCoinConfirm(false);
      } else {
        toast({
          title: "Transaction Failed",
          description: "Failed to spend Flappy Coins. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to spend coins:', error);
      toast({
        title: "Error",
        description: "Failed to spend Flappy Coins. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCoinConfirmNo = () => {
    setShowCoinConfirm(false);
  };

  const handlePremiumRevive = () => {
    if (hasActiveSubscription) {
      console.log('👑 Premium instant revive - Active subscription detected');
      onRevive('premium');
    } else {
      console.log('⚠️ No active subscription - redirecting to subscription plans');
      setShowSubscriptionPlans(true);
    }
  };

  const openSubscriptionPlans = () => {
    setShowSubscriptionPlans(true);
  };

  const handleWatchAdToRevive = async () => {
    if (adCooldown && typeof adCooldown === 'object' && (adCooldown as any).isInCooldown) {
      toast({
        title: "Ad Cooldown",
        description: `Please wait ${(adCooldown as any).remainingTime || 0} seconds before watching another ad.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoadingAd(true);
    setAdError(false);

    try {
      // Use Scream Pi game mode for rewards
      const gameMode = 'scream_pi';
      const adResult = await adService.showRewardedAdForReward('revive', gameMode);
      
      if (adResult.success) {
        onRevive('ad');
        toast({
          title: "🎉 Revived in Scream Pi!",
          description: `You've been revived in Scream Pi mode! ${adResult.description}`,
        });
      } else {
        setAdError(true);
        toast({
          title: "Ad Error",
          description: adResult.description || "Failed to load ad. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Ad error:', error);
      setAdError(true);
      toast({
        title: "Ad Error",
        description: "Failed to show ad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAd(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
          {/* Scream Pi Branding */}
          <div className="flex items-center justify-center mb-4">
            <span className="text-2xl mr-2">🎤</span>
            <h1 className="text-xl font-bold text-purple-700">Scream Pi!</h1>
          </div>

          {/* Character Image */}
          <div className="flex justify-center mb-4">
            <img 
              src={characterImage} 
              alt={`${characterName} Character`} 
              className="w-16 h-16 drop-shadow-lg" 
              onError={(e) => {
                console.log('❌ Character image failed to load:', characterImage);
                e.currentTarget.src = '/npc/nicolas.png';
              }}
            />
          </div>

          {/* Score Display */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Over!</h2>
            <p className="text-lg text-gray-600">Score: {score}</p>
            <div className="mt-2 p-2 bg-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800 font-semibold">
                💰 Revive with Flappy Coins to get 3 lives!
              </p>
            </div>
          </div>

          {/* Revive Options */}
          <div className="space-y-3 mb-6">
            {/* Extra Life Option */}
            {extraLives > 0 && onUseExtraLife && (
              <button
                onClick={onUseExtraLife}
                className="w-full bg-red-500 text-white rounded-lg py-3 px-4 font-bold flex items-center justify-center hover:bg-red-600 transition"
              >
                <Heart className="w-5 h-5 mr-2" />
                Use Extra Life ({extraLives})
              </button>
            )}

            {/* Coin Revive */}
            <button
              onClick={handleCoinRevive}
              disabled={insufficientCoins || (balance || 0) < progressiveReviveCost}
              className={`w-full rounded-lg py-3 px-4 font-bold flex items-center justify-center transition ${
                insufficientCoins || (balance || 0) < progressiveReviveCost
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              <ErrorFreeImage src="/flappycoins.png" alt="Flappy Coin" className="w-5 h-5 mr-2" fallbackSrc="/placeholder.svg" />
              Revive with {progressiveReviveCost} Flappy Coins (3 Lives)
              {insufficientCoins && (
                <span className="ml-2 text-xs">(Insufficient Funds)</span>
              )}
            </button>

            {/* Ad Revive */}
            {!forceAdRevive && (
              <button
                onClick={() => setShowAdConfirm(true)}
                disabled={isLoadingAd || (adCooldown && typeof adCooldown === 'object' && (adCooldown as any).isInCooldown)}
                className={`w-full rounded-lg py-3 px-4 font-bold flex items-center justify-center transition ${
                  isLoadingAd || (adCooldown && typeof adCooldown === 'object' && (adCooldown as any).isInCooldown)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Play className="w-5 h-5 mr-2" />
                {isLoadingAd ? 'Loading Ad...' : 'Watch Ad to Revive'}
              </button>
            )}

            {/* Premium Revive */}
            <button
              onClick={handlePremiumRevive}
              className="w-full bg-purple-500 text-white rounded-lg py-3 px-4 font-bold flex items-center justify-center hover:bg-purple-600 transition"
            >
              <Crown className="w-5 h-5 mr-2" />
              {isSubscriber ? 'Premium Revive' : 'Get Premium'}
            </button>
          </div>

          {/* Decline Button */}
          {!noCancel && (
            <button
              onClick={() => {
                console.log('🔴 ScreamPiReviveModal: Decline button clicked');
                onDecline();
              }}
              className="w-full bg-gray-300 text-gray-700 rounded-lg py-3 px-4 font-bold hover:bg-gray-400 transition"
            >
              Decline
            </button>
          )}
        </div>
      </div>

      {/* Coin Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCoinConfirm}
        onClose={() => setShowCoinConfirm(false)}
        title="Confirm Flappy Coin Spend"
        description={`Are you sure you want to spend ${progressiveReviveCost} Flappy Coins to revive and get 3 lives?`}
        onConfirm={handleCoinConfirmYes}
        confirmText="Yes, Spend Coins"
        cancelText="Cancel"
      />

      {/* Ad Confirmation Modal */}
      <ConfirmationModal
        isOpen={showAdConfirm}
        onClose={() => {
          console.log('🔴 ScreamPiReviveModal: Ad confirmation cancelled');
          setShowAdConfirm(false);
          onDecline();
        }}
        title="Watch Ad to Revive"
        description={adDialog}
        onConfirm={handleWatchAdToRevive}
        confirmText="Watch Ad"
        cancelText="Cancel"
      />

      {/* Subscription Plans Modal */}
      <SubscriptionPlansModal
        isOpen={showSubscriptionPlans}
        onClose={() => setShowSubscriptionPlans(false)}
        onPurchase={(plan) => {
          // Unlock all Scream Pi characters when subscription is purchased
          const allCharacterIds = ['nicolas', 'chengdiao', 'character'];
          const currentUnlocked = JSON.parse(localStorage.getItem('screamPiUnlockedCharacters') || '[]');
          const newUnlockedCharacters = [...new Set([...currentUnlocked, ...allCharacterIds])];
          localStorage.setItem('screamPiUnlockedCharacters', JSON.stringify(newUnlockedCharacters));
          
          // Show success message
          toast({
            title: "🎉 Subscription Activated!",
            description: "All Scream Pi characters are now unlocked! Enjoy ad-free gameplay.",
          });
          
          // Close subscription modal
          setShowSubscriptionPlans(false);
        }}
      />
    </>
  );
};

export default ScreamPiReviveModal; 