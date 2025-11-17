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
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';
import { piBrowserRedirect } from '@/utils/piBrowserRedirect';
import ErrorFreeImage from './ErrorFreeImage';
const watchAdsImg = '/npc gif/watchads.gif.gif';
const adFreeImg = '/flappy pi gif 2/adfree.gif';

interface ReviveModalProps {
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
  birdSkin?: string;
  extraLives?: number;
  onUseExtraLife?: () => void;
  gameMode?: string; // Add gameMode prop
}

const AD_DIALOGS = [
  "Watching ads? You're powering new features! 🔧",
  "Pi ads = faster updates! Thanks for your support! 💡",
  "Every ad fuels rewards for YOU and others! 🪙",
  "Pi revenue helps us build awesome new stuff! 🛠️",
  "You flap, we grow — with Pi from ads! 🚀",
  "Thanks! Your ad helped fund future Pi prizes! 🎁",
  "Ads keep the skies open and rewards flowing! ☁️",
  "Pi from ads goes right back to players! 🔄",
  "Ads = upgrades = more ways to earn Pi! 📈",
  "The more ads, the more rewards for YOU! 🤑",
  "Ad views support new game features! 🙌",
  "We reinvest Pi to make things better! 💎",
  "Ads help us grow Flappy Pi — together! 🤝",
  "Every ad helps unlock new game modes! 🎮",
  "Pi from ads = more pets, skins, and fun! 🐦",
  "Love rewards? Watch ads and grow the game! 🌱",
  "AdPi is returned to YOU in challenges! 🏆",
  "Ads = faster bird evolution updates! 🔥",
  "Skins. Rewards. All powered by ads. 🎨",
  "You just helped develop PvP. Nice! ⚔️",
  "Pi revenue helps fund tournaments! 🥇",
  "Ads support real Pi rewards for everyone! 🌍",
  "Thanks for helping us fly higher! ✈️",
  "Want card battles sooner? Watch ads! 🃏",
  "Your support = more Pi challenges! 🎯",
  "Every ad = new possibilities. 💫",
  "Ads feed the bird... and the devs. 😅",
  "Your view helped hatch a new feature! 🐣",
  "More views, more updates! 📺",
  "Keep watching — you're building the future! 🛤️",
  "Pi you generate helps all players! 🤗",
  "Ad revenue boosts reward drops! 🎉",
  "More coins, more modes — thanks to ads! 🪙",
  "Ads = power-ups in progress! ⚡",
  "You're fueling the Flapverse! 🌌",
  "That ad? Helped fund your next skin. 😉",
  "Watch, flap, repeat. We'll handle the rest! 🔁",
  "You're co-creating Flappy Pi! 👷",
  "Every second you watch counts. 🕒",
  "That ad funded a mystery egg. 🥚",
  "Bigger updates come from Pi ad love! 💛",
  "AdPi is 100% recycled into game fun! ♻️",
  "You play. We build. All Pi-powered. ⚙️",
  "Ads are wings for future features! 🪽",
  "Ads aren't ads — they're upgrades! 🧱",
  "Watchers unlock world events! 🗺️",
  "Keep watching to earn and evolve! 📲",
  "That ad just boosted the dev nest! 🐣",
  "Your support means more Pi for all! 🎊",
  "The Flappy Pi future? You're helping fund it! 🧠"
];

const ADFREE_DIALOGS = [
  "No ads, just pure flapping! 🎮",
  "Enjoy a cleaner sky — go Ad-Free! 🌤️",
  "Want peace? Upgrade to Ad-Free! ☁️",
  "No ads, more focus. Fly freely! 🐦",
  "Ad-Free flight? You got it! 🛫",
  "Unlock ad-free skies now! 🔓",
  "Less ads, more flaps. Let's go! 💨",
  "Say goodbye to ads forever! 👋",
  "Tired of ads? Go premium! 🛒",
  "Upgrade for an ad-free life! 🌈",
  "Smooth skies await — no ads! 🚀",
  "Go Ad-Free, flap non-stop! 🔄",
  "One price, endless clean flight! 💰",
  "Enjoy silence between pipes! 🤫",
  "Ads off. Game on. 🕹️",
  "Want focus mode? Get Ad-Free! 🎯",
  "Cut the noise. Go ad-free! ✂️",
  "Buy once, enjoy forever! ♾️",
  "Freedom is a tap away! 🆓",
  "Block ads. Boost fun! 💥",
  "Fly fast, skip ads! 🏃‍♂️💨",
  "Ads off = 100% skill mode! 🔥",
  "Feel the smooth ride! 🎢",
  "Premium skies unlocked! 🪂",
  "Support devs, get no ads! 🙏",
  "Keep flapping — no breaks! 🐤",
  "Ad-Free zone activated! ✅",
  "Want quiet skies? Ad-Free it! 🤐",
  "Tap here for ad-free power! ⚡",
  "You earned it — go Ad-Free! 🏆",
  "Get serious. Lose the ads. 😎",
  "Stay focused, flap clean! 🧠",
  "Silence is golden. And Pi too. 💎",
  "Reward yourself: no more ads! 🎁",
  "Skip ads, stay in the zone! 🌀",
  "Elite flyers flap ad-free! ✈️",
  "Ad-Free is the pro way. 🧙",
  "Clean UI. Pure flight. 🧼",
  "Pay once, play forever ad-free! 🔁",
  "Ad-Free = max immersion! 🌌",
  "Break the chains — no more ads! 🔓",
  "Flap forever. No ads ever. 🔄",
  "All fun, zero interruption! 🚫",
  "The skies are cleaner here. 🌤️",
  "Skip the ads. Save your rhythm! 🥁",
  "Ad-Free is the best way to fly! 🕊️",
  "Buy once, no ads for life! 🛍️",
  "The bird approves: Ad-Free! 🐥👍",
  "Escape ad-land, go premium! 🗺️",
  "Ad-Free = speed, skill, serenity! 🎯"
];

const ReviveModal: React.FC<ReviveModalProps> = ({
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
  birdSkin = '/birds/bird_0.png',
  extraLives = 0,
  onUseExtraLife,
  gameMode = 'classic', // Default to 'classic' if not provided
}) => {
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [adError, setAdError] = useState(false);
  const [showPremiumOffer, setShowPremiumOffer] = useState(false);
  const [showCoinConfirm, setShowCoinConfirm] = useState(false);
  const [showSubscriptionButton, setShowSubscriptionButton] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSubscriptionConfirm, setShowSubscriptionConfirm] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [visible, setVisible] = useState(false);
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
      console.log('🔍 ReviveModal - Checking subscription status:', status);
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
    const handleSubscriptionExpired = (event: CustomEvent) => {
      console.log('📢 Subscription expired event received in ReviveModal');
      // Force refresh profile to update subscription status
      refreshProfile();
      toast({
        title: 'Subscription Expired',
        description: 'Your premium subscription has expired. You now have access to free features with ads.',
        variant: 'destructive',
      });
    };

    const handleInventoryUpdated = (event: CustomEvent) => {
      if (event.detail?.action === 'subscriptions-expired') {
        console.log('📢 Inventory updated - subscriptions expired');
        refreshProfile();
      }
    };

    window.addEventListener('subscription-expired', handleSubscriptionExpired as EventListener);
    window.addEventListener('inventory-updated', handleInventoryUpdated as EventListener);

    return () => {
      window.removeEventListener('subscription-expired', handleSubscriptionExpired as EventListener);
      window.removeEventListener('inventory-updated', handleInventoryUpdated as EventListener);
    };
  }, [refreshProfile, toast]);

  useEffect(() => {
    if (isVisible) {
      setVisible(true);
      setIsLoadingAd(false);
      setAdError(false);
      // Show premium offer only on every 4th play (forceAdRevive)
      if (forceAdRevive && !hasUnlimitedRevives) {
        setShowPremiumOffer(true);
      } else {
        setShowPremiumOffer(false);
      }
      setAdDialog(AD_DIALOGS[Math.floor(Math.random() * AD_DIALOGS.length)]);
      setAdFreeDialog(ADFREE_DIALOGS[Math.floor(Math.random() * ADFREE_DIALOGS.length)]);
      
      // Check if Pi Ad Network is supported when modal opens
      if (piBrowserRedirect.isInPiBrowser()) {
        import('../utils/piAds').then(({ isPiAdNetworkSupported }) => {
          isPiAdNetworkSupported().then((supported) => {
            if (!supported) {
              setAdError(true);
              console.log('Pi Ad Network not supported');
            }
          }).catch(() => {
            setAdError(true);
            console.log('Failed to check Pi Ad Network support');
          });
        });
      }
    } else {
      setVisible(false);
    }
  }, [isVisible, forceAdRevive, hasUnlimitedRevives]);

  const handleCoinRevive = async () => {
    setIsLoadingAd(false);
    if (await spendCoins(progressiveReviveCost, 'Revive in game')) {
      toast({
        title: `${progressiveReviveCost} Flappy Coins Spent`,
        description: 'You revived and coins were deducted from your wallet.',
        duration: 3000,
      });
      onRevive('coin'); // Pass 'coin' to indicate this was a paid revive
      setShowCoinConfirm(false);
    } else {
      toast({ title: 'Not enough coins!', description: 'You need more Flappy Coins to revive.', variant: 'destructive' });
      setShowCoinConfirm(false);
    }
  };

  const handleCoinConfirmYes = async () => {
    setIsLoadingAd(false);
    // No need to check profile.total_coins, already checked by spendCoins
    setShowCoinConfirm(false);
    toast({
      title: `${progressiveReviveCost} Flappy Coins Spent`,
      description: 'You revived and coins were deducted from your wallet.',
      duration: 3000,
    });
    onRevive('coin'); // Pass 'coin' to indicate this was a paid revive
  };

  const handleCoinConfirmNo = () => {
    // Reset ad-related state
    setIsLoadingAd(false);
    setShowCoinConfirm(false);
    setShowSubscriptionModal(true);
  };

  const handlePremiumRevive = () => {
    // Reset ad-related state
    setIsLoadingAd(false);
    if (hasActiveSubscription) {
      console.log('👑 Premium instant revive - Active subscription detected');
      onRevive('premium'); // Pass 'premium' to indicate this was a free revive
    } else {
      console.log('⚠️ No active subscription - redirecting to subscription plans');
      setShowSubscriptionPlans(true);
    }
  };

  // Handler to open subscription plans modal and close all others
  const openSubscriptionPlans = () => {
    setShowSubscriptionPlans(true);
    setShowSubscriptionModal(false);
    setShowSubscriptionConfirm(false);
    setShowCoinConfirm(false);
  };

  // Handler for watching ad to revive - SAME LOGIC AS COIN REVIVE BUT WITH AD REQUIREMENT
  const handleWatchAdToRevive = async () => {
    console.log('🎬 [REVIVE DEBUG] Starting ad watch process...');
    setIsLoadingAd(true);
    setAdError(false);
    
    try {
      // Use the gameMode prop passed to the component
      const currentGameMode = gameMode || 'classic';
      console.log(`🎬 [REVIVE DEBUG] Requesting ad for revive in ${currentGameMode} mode`);
      
      // STEP 1: Watch the ad first (this is the only difference from coin revive)
      const result = await adService.showRewardedAdForReward('revive', currentGameMode);
      console.log('🎬 [REVIVE DEBUG] Ad result:', result);
      
      if (result.success && (result.shown || !result.shown)) {
        // STEP 2: Ad completed successfully, now do EXACT SAME revive as coin revive
        console.log('🎬 [REVIVE DEBUG] Ad completed successfully, calling onRevive - SAME AS COIN REVIVE');
        
        // Call the exact same revive logic as coin revive
        onRevive('ad'); // This triggers doRevive('ad') which should work exactly like doRevive('coin')
        
        toast({
          title: "Revived! 🎉",
          description: result.shown 
            ? `You watched an ad and revived in ${currentGameMode} mode!`
            : `You revived in ${currentGameMode} mode! (Ad skipped for subscriber)`,
        });
      } else {
        console.log('🎬 [REVIVE DEBUG] Ad failed:', result.description);
        setAdError(true);
        toast({
          title: "Ad Failed",
          description: result.description || "Failed to load ad",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('🎬 [REVIVE DEBUG] Ad error:', error);
      setAdError(true);
      toast({
        title: "Ad Error",
        description: "Failed to load ad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAd(false);
    }
  };

  // Replace insufficientCoins prop usage with direct balance check
  const canAffordRevive = balance >= progressiveReviveCost;

  if (!visible) return null;

  if (showSubscriptionModal) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl flex flex-col items-center">
          {/* Bird Skin Display */}
          {birdSkin && (
            <div className="flex justify-center mb-2">
              <img 
                src={getBirdImageSrc(birdSkin)} 
                alt="Your Bird Skin" 
                className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg animate-bounce" 
                onError={(e) => {
                  console.log('❌ Bird skin image failed to load in ReviveModalSubscription:', birdSkin);
                  e.currentTarget.src = '/birds/bird_0.png';
                }}
              />
            </div>
          )}
          <img src={adFreeImg} alt="Ad Free" className="w-24 h-24 mx-auto mb-2 rounded-lg shadow" />
          <div className="mb-2">
            <span className="inline-block border-2 border-yellow-400 text-yellow-700 bg-yellow-50 rounded-xl px-4 py-2 font-semibold text-base shadow-sm mb-2" style={{fontFamily:'inherit'}}>
              <span role="img" aria-label="chat">💬</span> {adFreeDialog}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800 mt-2">Unlimited Revives!</h2>
          <p className="mb-4 text-gray-600">No ads. Flap on, Pi-oneer!</p>
          <p className="mb-4 text-gray-700 font-semibold">Score: {score} points</p>
          <button
            onClick={() => onRevive('premium')}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white py-3 px-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 mb-3"
          >
            Revive Instantly
          </button>
          <button
            onClick={onDecline}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-bold text-base transition-all duration-200"
          >
            Game Over
          </button>
        </div>
      </div>
    );
  }

  if (showSubscriptionConfirm) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[11000]">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xs w-full text-center">
          <div className="text-3xl mb-2">💎</div>
          <h3 className="font-bold text-lg mb-2">View Subscription Plans?</h3>
          <p className="text-gray-600 mb-4 text-sm">Are you sure you want to view subscription plans? You will leave this screen.</p>
          <div className="flex gap-4 justify-center">
            <button onClick={openSubscriptionPlans} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg">Yes</button>
            <button onClick={() => setShowSubscriptionConfirm(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">No</button>
          </div>
        </div>
      </div>
    );
  }

  if (showSubscriptionPlans) {
    return (
      <SubscriptionPlansModal isOpen={showSubscriptionPlans} onClose={() => setShowSubscriptionPlans(false)} />
    );
  }

  // Default: show the revive modal with all options
  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-2 sm:p-4 transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-xl sm:rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transform transition-all duration-400 ${visible ? 'scale-100' : 'scale-90'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 sm:p-6 text-center">
          {/* Bird Skin Display */}
          {birdSkin && (
            <div className="flex justify-center mb-2">
              <ErrorFreeImage
                src={getBirdImageSrc(birdSkin)}
                alt="Your Bird Skin"
                className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg animate-bounce"
                fallbackSrc="/birds/bird_0.png"
                onError={() => {
                  console.log('❌ Bird skin image failed to load in ReviveModal:', birdSkin);
                }}
                onLoad={() => {
                  console.log('✅ Bird skin loaded successfully in ReviveModal:', birdSkin);
                }}
                retryAttempts={2}
                retryDelay={500}
              />
            </div>
          )}
          <div className="text-3xl sm:text-4xl mb-2">💔</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Continue Playing?</h2>
          <p className="text-red-100 text-sm sm:text-base">
            Score: <span className="font-bold">{score}</span>
          </p>
          
          {hasUnlimitedRevives && (
            <div className="bg-yellow-400/20 text-yellow-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold mt-2 inline-block">
              👑 UNLIMITED REVIVES ACTIVE
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Premium Instant Revive (for subscribers) */}
          {hasActiveSubscription && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">Premium Instant Revive</h3>
                  <p className="text-xs sm:text-sm text-gray-600">No ads, no coins needed!</p>
                  <p className="text-xs text-green-600 font-semibold">✅ Active Subscription Detected</p>
                </div>
              </div>
              
              <button
                onClick={handlePremiumRevive}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 
                         text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-bold transition-all duration-200 
                         transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                ⚡ Instant Revive (Premium)
              </button>
            </div>
          )}

          {/* Extra Life Button */}
          {extraLives > 0 && onUseExtraLife && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">Extra Life Available</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Use an extra life to continue instantly!</p>
                </div>
              </div>
              
              <button
                onClick={onUseExtraLife}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                ❤️ Use Extra Life ({extraLives} left)
              </button>
            </div>
          )}

          {/* Watch Ad to Revive (only for non-subscribers and Pi Browser users) */}
          {!hasActiveSubscription && (
            <div className="border-2 border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col items-center">
              <img src={watchAdsImg} alt="Watch Ads" className="w-16 h-16 sm:w-20 sm:h-20 mb-2 rounded-lg shadow" />
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">Watch Ad to Revive</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {piBrowserRedirect.isInPiBrowser() ? 'FREE - 30 second Pi Ad' : '🌐 Pi Browser Required'}
                  </p>
                </div>
              </div>
              
              {/* Pi Browser Check Message */}
              {!piBrowserRedirect.isInPiBrowser() && (
                <div className="w-full mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <div className="text-lg">🌐</div>
                    <div className="text-xs">
                      <div className="font-semibold">Pi Browser Required</div>
                      <div>Download Pi Browser to watch ads and earn rewards!</div>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={piBrowserRedirect.isInPiBrowser() ? handleWatchAdToRevive : () => piBrowserRedirect.showPiBrowserMessage()}
                className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 mb-3 ${
                  piBrowserRedirect.isInPiBrowser() && !adError
                    ? 'bg-green-500 hover:bg-green-600 text-white disabled:opacity-50' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                disabled={isLoadingAd || adCooldown > 0 || !piBrowserRedirect.isInPiBrowser() || adError}
              >
                {!piBrowserRedirect.isInPiBrowser() 
                  ? '🌐 Pi Browser Required' 
                  : adError
                    ? '❌ Ad Unavailable'
                    : adCooldown > 0 
                      ? `Ad available in 0:${adCooldown.toString().padStart(2, '0')}` 
                      : '▶️ Watch Pi Ad to Revive'
                }
              </button>
              
              {/* Pi Browser Download Link */}
              {!piBrowserRedirect.isInPiBrowser() && (
                <button
                  onClick={() => piBrowserRedirect.redirectToPiBrowser()}
                  className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  📱 Download Pi Browser
                </button>
              )}
              {!piBrowserRedirect.isInPiBrowser() && (
                <div className="mt-2 text-center">
                  <p className="text-orange-600 text-xs font-semibold">
                    💡 Download Pi Browser to watch ads and earn rewards!
                  </p>
                </div>
              )}
              {adError && piBrowserRedirect.isInPiBrowser() && (
                <div className="mt-2 text-center">
                  <p className="text-red-600 text-xs font-semibold">❌ Ad unavailable. Try coin revive instead!</p>
                </div>
              )}
              <div className="mt-2 sm:mt-3 text-center text-green-700 text-xs sm:text-sm font-semibold">
                <span role="img" aria-label="chat">💬</span> {adDialog}
              </div>
            </div>
          )}

          {/* Pay with Flappy Coin (hide every 4th game) */}
          {!(forceAdRevive) && (
            <>
              <button
                onClick={handleCoinRevive}
                disabled={!canAffordRevive}
                className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-bold transition-all duration-200 text-sm sm:text-base ${
                  !canAffordRevive
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white transform hover:scale-105 active:scale-95'
                }`}
              >
                <ErrorFreeImage src="/flappycoins.png" alt="Flappy Coin" className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2 align-middle" style={{display:'inline-block',verticalAlign:'middle'}} fallbackSrc="/placeholder.svg" />
                {!canAffordRevive ? `Insufficient Coins (Need ${progressiveReviveCost})` : `Use ${progressiveReviveCost} Flappy Coins`}
              </button>
              {/* Confirmation Dialog */}
              <ConfirmationModal
                isOpen={showCoinConfirm}
                onClose={() => setShowCoinConfirm(false)}
                onConfirm={handleCoinConfirmYes}
                title="Spend Coins to Revive?"
                description={`Do you want to spend ${progressiveReviveCost} Flappy Coins to continue playing?`}
                confirmText="Yes"
                cancelText="No"
              />
            </>
          )}

          {/* Show subscription plan button if user declined coin payment */}
          {showSubscriptionButton && !showCoinConfirm && !hasUnlimitedRevives && (
            <div className="flex flex-col items-center mt-2">
              <button
                onClick={openSubscriptionPlans}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white py-2 px-4 sm:px-6 rounded-lg font-bold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 active:scale-95 shadow"
              >
                💎 View Subscription Plans
              </button>
              <span className="text-xs text-gray-500 mt-1">Get unlimited revives, no ads, and more perks!</span>
            </div>
          )}

          {/* Premium Offer (for non-subscribers) */}
          {forceAdRevive && !hasUnlimitedRevives && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="text-center mb-2 sm:mb-3">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-2" />
                <h3 className="font-bold text-gray-800 text-sm sm:text-base">Great Score!</h3>
                <p className="text-xs sm:text-sm text-gray-600">Get unlimited revives with Premium</p>
              </div>
              <div className="text-xs text-gray-700 mb-2 sm:mb-3 space-y-1">
                <div>✨ Unlimited revives forever</div>
                <div>🚫 No more mandatory ads</div>
                <div>💰 Double coin rewards</div>
              </div>
              <button
                onClick={openSubscriptionPlans}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 
                         text-white py-2 px-3 sm:px-4 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 
                         transform hover:scale-105 active:scale-95"
              >
                <Crown className="w-3 h-3 inline mr-1" />
                Get Premium - As low as 5π
              </button>
            </div>
          )}

          {/* Revive Status for Free Users */}
          {!hasUnlimitedRevives && reviveCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-center">
              <p className="text-blue-700 text-xs sm:text-sm">
                ⚠️ You've used your free revive for this game
              </p>
              <p className="text-blue-600 text-xs mt-1">
                Premium users get unlimited revives!
              </p>
            </div>
          )}

          {/* End Game Button (always show unless noCancel) */}
          {!noCancel && (
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => { console.log('ReviveModal: End Game (cancel) button clicked'); onDecline(); }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                End Game
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 py-2 sm:py-3 text-center">
          <p className="text-gray-500 text-xs">
            💡 Tip: Premium subscribers get unlimited revives and no ads!
          </p>
        </div>
      </div>

      {/* Ad Confirmation Dialog */}
      {showAdConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[11000] p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8 max-w-xs w-full text-center">
            <div className="text-2xl sm:text-3xl mb-2">🎬</div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Watch an Ad to Revive?</h3>
            <p className="text-gray-600 mb-4 text-xs sm:text-sm">You need to watch a 30 second ad to continue playing. Proceed?</p>
            <div className="flex gap-3 sm:gap-4 justify-center">
              <button onClick={() => { setShowAdConfirm(false); onRevive('ad'); }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 sm:px-6 rounded-lg text-sm sm:text-base">Yes</button>
              <button onClick={() => { setShowAdConfirm(false); (onAdDecline || onDecline)(); }} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 sm:px-6 rounded-lg text-sm sm:text-base">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// New modal for subscribers: unlimited revives, no ads, with NPC
const ReviveModalSubscription: React.FC<{
  isVisible: boolean;
  score: number;
  onRevive: (reviveType?: 'coin' | 'ad' | 'premium' | 'extra_life') => void;
  onDecline: () => void;
  birdSkin?: string;
}> = ({ isVisible, score, onRevive, onDecline, birdSkin }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-sm w-full p-4 sm:p-8 text-center shadow-2xl flex flex-col items-center">
        {/* Bird Skin Display */}
        {birdSkin && (
          <div className="flex justify-center mb-3">
            <img 
              src={getBirdImageSrc(birdSkin)} 
              alt="Your Bird Skin" 
              className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg animate-bounce" 
            />
          </div>
        )}
        <SubscriptionNPC />
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800 mt-2 sm:mt-4">Unlimited Revives!</h2>
        <p className="mb-3 sm:mb-4 text-gray-600 text-sm sm:text-base">No ads. Flap on, Pi-oneer!</p>
        <p className="mb-3 sm:mb-4 text-gray-700 font-semibold text-sm sm:text-base">Score: {score} points</p>
        <button
          onClick={() => onRevive('premium')}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 mb-2 sm:mb-3"
        >
          Revive Instantly
        </button>
        <button
          onClick={onDecline}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 sm:px-4 rounded-lg font-bold text-sm sm:text-base transition-all duration-200"
        >
          Game Over
        </button>
      </div>
    </div>
  );
};

export default ReviveModal;
export { ReviveModalSubscription }; 