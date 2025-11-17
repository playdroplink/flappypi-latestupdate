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

const watchAdsImg = '/npc gif/watchads.gif.gif';
const adFreeImg = '/flappy pi gif 2/adfree.gif';

interface DinoPiReviveModalProps {
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
  "You roar, we grow — with Pi from ads! 🚀",
  "Thanks! Your ad helped fund future Pi prizes! 🎁",
  "Ads keep the prehistoric world alive and rewards flowing! ☁️",
  "Pi from ads goes right back to players! 🔄",
  "Ads = upgrades = more ways to earn Pi! 📈",
  "The more ads, the more rewards for YOU! 🤑",
  "Ad views support new game features! 🙌",
  "We reinvest Pi to make things better! 💎",
  "Ads help us grow Dino Pi — together! 🤝",
  "Every ad helps unlock new game modes! 🎮",
  "Pi from ads = more dinosaurs, skins, and fun! 🦕",
  "Love rewards? Watch ads and grow the game! 🌱",
  "AdPi is returned to YOU in challenges! 🏆",
  "Ads = faster dinosaur evolution updates! 🔥",
  "Skins. Rewards. All powered by ads. 🎨",
  "You just helped develop PvP. Nice! ⚔️",
  "Pi revenue helps fund tournaments! 🥇",
  "Ads support real Pi rewards for everyone! 🌍",
  "Thanks for helping us roar higher! ",
  "Want dino battles sooner? Watch ads! 🎯",
  "Your support = more Pi challenges! 🎯",
  "Every ad = new possibilities. 💫",
  "Ads feed the dinosaur... and the devs. 😅",
  "Your view helped create a new feature! 🦕",
  "More views, more updates! 📺",
  "Keep watching — you're building the future! 🛤️",
  "Pi you generate helps all players! 🤗",
  "Ad revenue boosts reward drops! 🎉",
  "More coins, more modes — thanks to ads! 🪙",
  "Ads = power-ups in progress! ⚡",
  "You're fueling the Dinoverse! 🌌",
  "That ad? Helped fund your next dinosaur. 😉",
  "Watch, roar, repeat. We'll handle the rest! 🔁",
  "You're co-creating Dino Pi! 👷",
  "Every second you watch counts. 🕒",
  "That ad funded a mystery egg. 🥚",
  "Bigger updates come from Pi ad love! 💛",
  "Your roar powers the prehistoric world! ",
  "Ads = more evolution stages! 🧬",
  "Pi from ads = more fossil discoveries! 🦴",
  "Every ad helps unlock new environments! 🌍",
  "Your support = more dinosaur species! 🦕",
  "Ads fund the next great extinction event! 💥",
  "Pi revenue = more prehistoric adventures! 🏔️",
  "That ad? Helped fund your next evolution! "
];

const DinoPiReviveModal: React.FC<DinoPiReviveModalProps> = ({
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
  characterImage,
  characterName = 'Baby T-Rex',
  extraLives = 0,
  onUseExtraLife
}) => {
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const { balance, spendCoins } = useWallet();
  const { isAdFree } = useRewardedAdCooldown();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAdLoading, setShowAdLoading] = useState(false);
  const [adDialog, setAdDialog] = useState('');
  const [reviveType, setReviveType] = useState<'coin' | 'ad' | 'premium' | 'extra_life' | null>(null);

  const REVIVE_COST = 50; // Flappy Coins cost for revive
  const AD_REVIVE_COST = 0; // Free with ad

  useEffect(() => {
    if (isVisible) {
      const randomDialog = AD_DIALOGS[Math.floor(Math.random() * AD_DIALOGS.length)];
      setAdDialog(randomDialog);
    }
  }, [isVisible]);

  const handleCoinRevive = () => {
    if (balance < REVIVE_COST) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${REVIVE_COST} Flappy Coins to revive. You have ${balance}.`,
        variant: "destructive",
      });
      return;
    }

    setReviveType('coin');
    setShowConfirmation(true);
  };

  const handleAdRevive = async () => {
    if (isAdFree) {
      onRevive('premium');
      return;
    }

    setShowAdLoading(true);
    try {
      const adResult = await adService.showRewardedAd();
      if (adResult.success) {
        onRevive('ad');
        toast({
          title: "Revived!",
          description: adDialog,
        });
      } else {
        toast({
          title: "Ad Failed",
          description: "Could not load ad. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Ad error:', error);
      toast({
        title: "Ad Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowAdLoading(false);
    }
  };

  const handleExtraLife = () => {
    if (onUseExtraLife) {
      onUseExtraLife();
      onRevive('extra_life');
    }
  };

  const handlePremiumRevive = () => {
    if (profile?.isSubscribed) {
      onRevive('premium');
    } else {
      setShowSubscriptionModal(true);
    }
  };

  const handleConfirmRevive = () => {
    if (reviveType === 'coin') {
      spendCoins(REVIVE_COST);
      onRevive('coin');
    }
    setShowConfirmation(false);
    setReviveType(null);
  };

  const handleDecline = () => {
    if (onAdDecline) {
      onAdDecline();
    } else {
      onDecline();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
          {/* Dino Pi Branding */}
          <div className="flex items-center justify-center mb-4">
            <span className="text-2xl mr-2"></span>
            <h1 className="text-xl font-bold text-orange-700">Dino Pi!</h1>
          </div>

          {/* Character Image */}
          <div className="flex justify-center mb-4">
            <img 
              src={characterImage || '/dino pi/dino_0.png'} 
              alt={`${characterName} Character`} 
              className="w-16 h-16 drop-shadow-lg" 
              onError={(e) => {
                console.log('❌ Character image failed to load:', characterImage);
                e.currentTarget.src = '/dino pi/dino_0.png';
              }}
            />
          </div>

          {/* Score Display */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Over!</h2>
            <p className="text-lg text-gray-600">Score: {score}</p>
            <div className="mt-2 p-2 bg-orange-100 rounded-lg">
              <p className="text-sm text-orange-800 font-semibold">
                🦴 Revive with Flappy Coins to get 3 lives!
              </p>
            </div>
          </div>

          {/* Revive Options */}
          <div className="space-y-3 mb-6">
            
            {/* Extra Life Option */}
            {extraLives > 0 && onUseExtraLife && (
              <Button
                onClick={handleExtraLife}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
              >
                <Heart className="w-5 h-5 mr-2" />
                Use Extra Life ({extraLives} left)
              </Button>
            )}

            {/* Coin Revive Option */}
            <Button
              onClick={handleCoinRevive}
              disabled={balance < REVIVE_COST}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 disabled:opacity-50"
            >
              <Coins className="w-5 h-5 mr-2" />
              Revive with {REVIVE_COST} Flappy Coins
            </Button>

            {/* Ad Revive Option */}
            {!isAdFree && (
              <Button
                onClick={handleAdRevive}
                disabled={showAdLoading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3"
              >
                {showAdLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading Ad...
                  </div>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Watch Ad to Revive (Free)
                  </>
                )}
              </Button>
            )}

            {/* Premium Revive Option */}
            {profile?.isSubscribed ? (
              <Button
                onClick={() => onRevive('premium')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3"
              >
                <Crown className="w-5 h-5 mr-2" />
                Premium Revive (Free)
              </Button>
            ) : (
              <Button
                onClick={handlePremiumRevive}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3"
              >
                <Star className="w-5 h-5 mr-2" />
                Subscribe for Free Revives
              </Button>
            )}
          </div>

          {/* Ad Dialog */}
          {adDialog && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 text-center">{adDialog}</p>
            </div>
          )}

          {/* Decline Button */}
          {!noCancel && (
            <Button
              onClick={handleDecline}
              variant="outline"
              className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <X className="w-5 h-5 mr-2" />
              Accept Defeat
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmRevive}
        title="Confirm Revive"
        message={`Are you sure you want to spend ${REVIVE_COST} Flappy Coins to revive?`}
        confirmText="Yes, Revive!"
        cancelText="Cancel"
      />

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionPlansModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      )}
    </>
  );
};

export default DinoPiReviveModal;
