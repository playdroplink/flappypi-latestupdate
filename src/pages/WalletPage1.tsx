import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import { useUserProfile } from '../hooks/useUserProfile';
import { CoinIcon } from '../components/CoinIcon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Gift, Zap, Coins, DollarSign, RefreshCw } from 'lucide-react';
import { powerUpItems } from '@/constants/powerUpItems';
import { mysteryBoxItems } from '@/constants/mysteryBoxItems';
import { useToast } from '@/hooks/use-toast';
import PiPaymentModal from '@/components/PiPaymentModalV2';
import EnhancedFooter from '../components/EnhancedFooter';
import FooterNPC from '../components/FooterNPC';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

import { showRewardedAdAndVerify } from '../utils/piAds';

const buyOptions = [
  { coins: 100, price: 1 },
  { coins: 500, price: 4 },
  { coins: 1200, price: 9 },
  { coins: 3000, price: 20 },
];
const adRouletteRewards = [
  { type: 'coin', id: 'coin', amount: 5, image: '/flappycoins.png', name: '5 Coins' },
  { type: 'coin', id: 'coin', amount: 10, image: '/flappycoins.png', name: '10 Coins' },
  { type: 'coin', id: 'coin', amount: 20, image: '/flappycoins.png', name: '20 Coins' },
  { type: 'coin', id: 'coin', amount: 50, image: '/flappycoins.png', name: '50 Coins' },
  { type: 'none', id: 'none', amount: 0, image: '/flappycoins.png', name: 'Try Again' },
];
const paidRouletteRewards = [
  { type: 'coin', id: 'coin', amount: 50, image: '/flappycoins.png', name: '50 Coins' },
  { type: 'coin', id: 'coin', amount: 100, image: '/flappycoins.png', name: '100 Coins' },
  { type: 'coin', id: 'coin', amount: 200, image: '/flappycoins.png', name: '200 Coins' },
  { type: 'coin', id: 'coin', amount: 500, image: '/flappycoins.png', name: '500 Coins' },
  ...powerUpItems.map(p => ({ type: 'powerup', id: p.id, image: p.image, name: p.name })),
  ...mysteryBoxItems.map(mb => ({ type: 'mysterybox', id: mb.id, image: mb.image, name: mb.name })),
  { type: 'none', id: 'none', amount: 0, image: '/flappycoins.png', name: 'Try Again' },
];

const WalletPage: React.FC<{ musicEnabled: boolean, setMusicEnabled: (enabled: boolean) => void, soundEnabled: boolean, setSoundEnabled: (enabled: boolean) => void }> = ({ musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled }) => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUserProfile();
  const { toast } = useToast();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const [balance, setBalance] = useState(profile?.total_coins ?? 0);
  const [showReceive, setShowReceive] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [showAdRoulette, setShowAdRoulette] = useState(false);
  const [showPaidRoulette, setShowPaidRoulette] = useState(false);
  const [rouletteResult, setRouletteResult] = useState<{ type: string; amount: number; image: string; name: string } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningReward, setSpinningReward] = useState(null);
  const [showAdConfirm, setShowAdConfirm] = useState(false);
  const [showPiPayment, setShowPiPayment] = useState(false);
  const [pendingRouletteType, setPendingRouletteType] = useState<'ad' | 'paid' | null>(null);
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
  // REMOVE: const [musicEnabled, setMusicEnabled] = useState(true);
  // REMOVE: const [soundEnabled, setSoundEnabled] = useState(true);

  const handleBack = () => {
    navigate(-1);
  };

  // Sync balance with profile
  React.useEffect(() => {
    setBalance(profile?.total_coins ?? 0);
  }, [profile]);

  // On mount, load weekly stats from localStorage
  useEffect(() => {
    const weekKey = `roulette-stats-${getCurrentWeek()}`;
    const stats = JSON.parse(localStorage.getItem(weekKey) || '{}');
    setPiSpent(stats.piSpent || 0);
    setLegendaryWins(stats.legendaryWins || 0);
    setRareWins(stats.rareWins || 0);
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

  // Add a check for active subscription
  const isSubscriber = profile?.has_active_subscription && new Date(profile.subscription_end) > new Date();

  // Mock ad reward
  const handleWatchAd = () => {
    setTimeout(() => setBalance(b => b + 10), 1000);
    alert('You earned 10 Flappy Coins!');
  };
  // Mock buy coins
  const handleBuy = (coins: number) => {
    setBalance(b => b + coins);
    setShowBuy(false);
    alert(`You bought ${coins} Flappy Coins!`);
  };
  // Helper to increment power-up inventory
  const addPowerUpToInventory = async (powerUpId: string) => {
    if (!profile) return;
    const current = profile.owned_power_ups || {};
    const newCount = (current[powerUpId] || 0) + 1;
    await updateProfile({ owned_power_ups: { ...current, [powerUpId]: newCount } });
    toast({ title: 'Power-Up Received!', description: `You received a ${powerUpItems.find(p => p.id === powerUpId)?.name || powerUpId}.`, duration: 3000 });
  };
  // Helper to increment mystery box inventory (add owned_mystery_boxes to profile if not present)
  const addMysteryBoxToInventory = async (boxId: string) => {
    if (!profile) return;
    const current = (profile as any).owned_mystery_boxes || {};
    const newCount = (current[boxId] || 0) + 1;
    await updateProfile({ ...(profile as any), owned_mystery_boxes: { ...current, [boxId]: newCount } });
    toast({ title: 'Mystery Box Received!', description: `You received a ${mysteryBoxItems.find(mb => mb.id === boxId)?.name || boxId}.`, duration: 3000 });
  };
  // Modified spinRoulette to use the wheel
  const spinRoulette = (type: 'ad' | 'paid') => {
    setPendingType(type);
    const rewards = type === 'ad' ? adRouletteRewards : paidRouletteRewards;
    // Pick the reward index (with guarantee/limit logic for paid)
    let resultIndex = Math.floor(Math.random() * rewards.length);
    let result = rewards[resultIndex];
    if (type === 'paid') {
      let stats = { piSpent, legendaryWins, rareWins };
      if (stats.piSpent >= 15 && legendaryWins === 0) {
        resultIndex = rewards.findIndex(r => r.type === 'mysterybox' && r.id === 'legendary-mystery-box');
        result = rewards[resultIndex];
        saveWeeklyStats({ legendaryWins: 1 });
      } else if (stats.piSpent >= 7 && rareWins === 0) {
        resultIndex = rewards.findIndex(r => r.type === 'mysterybox' && r.id === 'rare-mystery-box');
        result = rewards[resultIndex];
        saveWeeklyStats({ rareWins: 1 });
      } else if (result.type === 'mysterybox' && result.id === 'legendary-mystery-box' && legendaryWins >= 2) {
        // Reroll if legendary limit reached
        const filtered = rewards.filter(r => !(r.type === 'mysterybox' && r.id === 'legendary-mystery-box'));
        resultIndex = Math.floor(Math.random() * filtered.length);
        result = filtered[resultIndex];
      } else if (result.type === 'mysterybox' && result.id === 'rare-mystery-box' && rareWins >= 3) {
        // Reroll if rare limit reached
        const filtered = rewards.filter(r => !(r.type === 'mysterybox' && r.id === 'rare-mystery-box'));
        resultIndex = Math.floor(Math.random() * filtered.length);
        result = filtered[resultIndex];
      }
      saveWeeklyStats({ piSpent: stats.piSpent + 1 });
    }
    setWheelRewards(rewards);
    setWheelSelected(resultIndex);
    setShowWheel(true);
    setPendingReward(result);
  };

  // Ad Roulette button handler (with Pi Ad Network integration)
  const handleAdRoulette = () => {
    if (isSubscriber) {
      toast({ title: 'Ad-Free!', description: 'You are a subscriber. Enjoy ad-free rewards!', variant: 'default' });
      return;
    }
    setIsSpinning(true);
    showRewardedAdAndVerify(
      (reward) => {
        setIsSpinning(false);
        spinRoulette('ad');
      },
      () => {
        setIsSpinning(false);
        toast({ title: 'Ads not supported', description: 'Please update Pi Browser to watch ads.', variant: 'destructive' });
      },
      () => {
        setIsSpinning(false);
        toast({ title: 'Ad unavailable', description: 'Ad could not be loaded. Try again later.', variant: 'destructive' });
      }
    );
  };
  // Paid Roulette button handler
  const handlePaidRoulette = () => {
    setPendingRouletteType('paid');
    setShowPiPayment(true);
  };

  // Watch Ad for 10 Flappy Coins (rewarded ad)
  const handleWatchAdForCoins = () => {
    if (isSubscriber) {
      toast({ title: 'Ad-Free!', description: 'You are a subscriber. Enjoy ad-free rewards!', variant: 'default' });
      return;
    }
    setIsSpinning(true);
    showRewardedAdAndVerify(
      () => {
        setIsSpinning(false);
        setBalance(b => b + 10);
        toast({ title: '10 Flappy Coins Earned!', description: 'You earned 10 Flappy Coins for watching an ad.' });
      },
      () => {
        setIsSpinning(false);
        toast({ title: 'Ads not supported', description: 'Please update Pi Browser to watch ads.', variant: 'destructive' });
      },
      () => {
        setIsSpinning(false);
        toast({ title: 'Ad unavailable', description: 'Ad could not be loaded. Try again later.', variant: 'destructive' });
      }
    );
  };

  // Helper to generate a unique wallet ID using username and pi_user_id
  function getWalletId() {
    if (!profile) return '';
    // Example: username_piuserid (or any hash/format you prefer)
    return `${profile.username}_${profile.pi_user_id}`;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-sky-300 via-sky-200 to-blue-200 relative overflow-hidden">
      <BackgroundDecoration />
      
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-full p-2 z-20"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      
      <h1 className="text-5xl sm:text-7xl font-black text-yellow-400 mb-4 drop-shadow-lg tracking-wide text-center" style={{ textShadow: '2px 4px 0 #2b3990' }}>
        FLAPPY COIN<br />WALLET
      </h1>
      <div className="mb-8 relative">
        <img src="/flappycoins.png" alt="Wallet" className="w-56 h-56 drop-shadow-2xl mx-auto animate-bounce animate-flap" style={{ animation: 'flap 2.2s ease-in-out infinite, floatX 3.2s ease-in-out infinite' }} />
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
      <div className="bg-yellow-300 border-4 border-yellow-600 rounded-3xl shadow-xl px-12 py-6 mb-6 flex flex-col items-center">
        <span className="text-2xl font-bold text-blue-900 mb-2 flex items-center gap-2">
          BALANCE
        </span>
        <span className="text-6xl sm:text-7xl font-black text-blue-900 flex items-center gap-3">
          <CoinIcon className="w-12 h-12 mr-2" />
          {balance.toLocaleString()}
        </span>
        {/* Wallet ID display */}
        {profile && (
          <div className="mt-4 p-2 bg-blue-100 rounded-xl text-blue-900 text-center text-sm break-all">
            <span className="font-bold">Wallet ID:</span> <span>{getWalletId()}</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-2xl font-black py-3 px-10 rounded-full shadow-lg border-4 border-yellow-600 transition-all duration-200"
          onClick={() => setShowReceive(true)}
        >
          RECEIVE
        </button>
        <button
          className="bg-blue-400 hover:bg-blue-500 text-2xl font-black py-3 px-10 rounded-full shadow-lg border-4 border-blue-600 transition-all duration-200"
          onClick={handleWatchAdForCoins}
          disabled={isSpinning}
        >
          <Play className="inline w-6 h-6 mr-2" /> Watch Ad for 10 Coins
        </button>
        <button
          className="bg-green-400 hover:bg-green-500 text-2xl font-black py-3 px-10 rounded-full shadow-lg border-4 border-green-600 transition-all duration-200"
          onClick={() => { window.location.href = '/ShopPage#coins'; }}
        >
          <DollarSign className="inline w-6 h-6 mr-2" /> Buy Flappy Coins
        </button>
      </div>
      {/* Roulette Section */}
      <div className="w-full max-w-2xl flex flex-col gap-6 mb-10">
        <div className="bg-white/90 rounded-2xl shadow-xl p-6 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-2 flex items-center gap-2"><Gift className="w-7 h-7 text-yellow-500" /> Ad Roulette</h2>
          <p className="mb-4 text-blue-700">Spin for a random reward after watching a Pi Ad!</p>
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-xl font-black py-2 px-8 rounded-full shadow-lg border-4 border-yellow-600 transition-all duration-200 mb-2"
            onClick={handleAdRoulette}
            disabled={isSpinning}
          >
            <RefreshCw className="inline w-5 h-5 mr-2 animate-spin" /> Spin Ad Roulette
          </button>
          {showAdRoulette && (
            <Dialog open={showAdRoulette} onOpenChange={setShowAdRoulette}>
              <DialogContent className="max-w-md bg-white rounded-xl text-center">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-blue-800">Ad Roulette Result</DialogTitle>
                </DialogHeader>
                <div className="my-6">
                  {isSpinning ? (
                    <div className="flex flex-col items-center">
                      {spinningReward && <img src={spinningReward.image} alt={spinningReward.name} className="w-16 h-16 mx-auto mb-2 animate-spin" />}
                      <span className="text-2xl font-bold text-blue-700 animate-pulse">Spinning...</span>
                    </div>
                  ) : rouletteResult && rouletteResult.type !== 'none' ? (
                    <div className="flex flex-col items-center">
                      <img src={rouletteResult.image} alt={rouletteResult.name} className="w-20 h-20 mx-auto mb-2" />
                      <span className="text-3xl font-black text-green-500 flex items-center justify-center gap-2">{rouletteResult.name}</span>
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-red-500">Try Again!</span>
                  )}
                </div>
                <button className="mt-2 px-6 py-2 bg-blue-200 hover:bg-blue-300 rounded-full font-bold text-blue-900" onClick={() => setShowAdRoulette(false)}>Close</button>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="bg-white/90 rounded-2xl shadow-xl p-6 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-2 flex items-center gap-2"><Zap className="w-7 h-7 text-green-500" /> Paid Roulette</h2>
          <p className="mb-4 text-blue-700">Spin for a bigger reward by paying Pi!</p>
          <button
            className="bg-green-400 hover:bg-green-500 text-xl font-black py-2 px-8 rounded-full shadow-lg border-4 border-green-600 transition-all duration-200 mb-2"
            onClick={handlePaidRoulette}
            disabled={isSpinning}
          >
            <RefreshCw className="inline w-5 h-5 mr-2 animate-spin" /> Spin Paid Roulette
          </button>
          {showPaidRoulette && (
            <Dialog open={showPaidRoulette} onOpenChange={setShowPaidRoulette}>
              <DialogContent className="max-w-md bg-white rounded-xl text-center">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-blue-800">Paid Roulette Result</DialogTitle>
                </DialogHeader>
                <div className="my-6">
                  {isSpinning ? (
                    <div className="flex flex-col items-center">
                      {spinningReward && <img src={spinningReward.image} alt={spinningReward.name} className="w-16 h-16 mx-auto mb-2 animate-spin" />}
                      <span className="text-2xl font-bold text-blue-700 animate-pulse">Spinning...</span>
                    </div>
                  ) : rouletteResult && rouletteResult.type !== 'none' ? (
                    <div className="flex flex-col items-center">
                      <img src={rouletteResult.image} alt={rouletteResult.name} className="w-20 h-20 mx-auto mb-2" />
                      <span className="text-3xl font-black text-green-500 flex items-center justify-center gap-2">{rouletteResult.name}</span>
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-red-500">Try Again!</span>
                  )}
                </div>
                <button className="mt-2 px-6 py-2 bg-blue-200 hover:bg-blue-300 rounded-full font-bold text-blue-900" onClick={() => setShowPaidRoulette(false)}>Close</button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      {/* Buy Coins Modal */}
      <Dialog open={showBuy} onOpenChange={setShowBuy}>
        <DialogContent className="max-w-md bg-white rounded-xl text-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-800">Buy Flappy Coins</DialogTitle>
          </DialogHeader>
          <div className="my-6 flex flex-col gap-4">
            {buyOptions.map(opt => (
              <button
                key={opt.coins}
                className="bg-yellow-300 hover:bg-yellow-400 text-xl font-black py-2 px-8 rounded-full shadow-lg border-4 border-yellow-600 transition-all duration-200 flex items-center justify-center gap-2"
                onClick={() => handleBuy(opt.coins)}
              >
                <Coins className="w-6 h-6 mr-2" /> {opt.coins} Flappy Coins <DollarSign className="w-5 h-5 ml-2" /> {opt.price} Pi
              </button>
            ))}
          </div>
          <button className="mt-4 px-6 py-2 bg-blue-200 hover:bg-blue-300 rounded-full font-bold text-blue-900" onClick={() => setShowBuy(false)}>Cancel</button>
        </DialogContent>
      </Dialog>
      {/* Receive Modal */}
      {showReceive && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Receive Flappy Coins</h2>
            <p className="text-blue-800 mb-4">Feature coming soon! You will be able to receive coins from friends and events.</p>
            <button className="mt-2 px-6 py-2 bg-blue-200 hover:bg-blue-300 rounded-full font-bold text-blue-900" onClick={() => setShowReceive(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Ad Roulette Confirmation Modal */}
      <Dialog open={showAdConfirm} onOpenChange={setShowAdConfirm}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle>Watch Ad for Rewards?</DialogTitle>
          </DialogHeader>
          <div className="my-4">Watch an ad to get rewards?</div>
          <div className="flex justify-center gap-4 mt-6">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-lg" onClick={() => { setShowAdConfirm(false); spinRoulette('ad'); }}>
              Yes
            </button>
            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-6 py-2 rounded-lg" onClick={() => setShowAdConfirm(false)}>
              No
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Pi Payment Modal for Paid Roulette */}
      <PiPaymentModal
        isOpen={showPiPayment}
        onClose={() => setShowPiPayment(false)}
        item={{ name: 'Roulette Spin', piAmount: 1, image: '/flappycoins.png' }}
        onPayment={async () => {
          // Mock payment logic for now
          return { success: true, txid: 'MOCK_TXID' };
        }}
        onPaymentSuccess={() => { setShowPiPayment(false); spinRoulette('paid'); }}
      />
      {showWheel && (
        <Dialog open={showWheel} onOpenChange={setShowWheel}>
          <DialogContent className="max-w-md text-center">
            <DialogHeader>
              <DialogTitle>Spin the Roulette!</DialogTitle>
            </DialogHeader>
            <div className="mt-4 text-gray-500 text-sm">Tap the wheel to spin!</div>
          </DialogContent>
        </Dialog>
      )}
      {showRewardModal && rewardToShow && (
        <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
          <DialogContent className="max-w-md text-center">
            <DialogHeader>
              <DialogTitle>🎉 You Won!</DialogTitle>
            </DialogHeader>
            {showConfetti && <div className="flex flex-col items-center justify-center my-4">
              <img src={rewardToShow.image} alt={rewardToShow.name} className="w-24 h-24 mx-auto mb-2 drop-shadow-xl animate-bounce" />
              <div className="text-2xl font-bold text-green-700 mb-2">{rewardToShow.name}</div>
              {rewardToShow.type === 'coin' && rewardToShow.amount > 0 && (
                <div className="text-lg text-blue-800">+{rewardToShow.amount} Flappy Coins!</div>
              )}
              {rewardToShow.type === 'powerup' && (
                <div className="text-lg text-blue-800">Power-Up added to your inventory!</div>
              )}
              {rewardToShow.type === 'mysterybox' && (
                <div className="text-lg text-blue-800">Mystery Box added to your inventory!</div>
              )}
              {rewardToShow.type === 'none' && (
                <div className="text-lg text-red-500">Better luck next time!</div>
              )}
            </div>}
            <button className="mt-4 px-6 py-2 bg-blue-200 hover:bg-blue-300 rounded-full font-bold text-blue-900" onClick={() => { setShowRewardModal(false); setShowConfetti(false); }}>
              OK
            </button>
          </DialogContent>
        </Dialog>
      )}
      {/* FooterNPC above the footer */}
      <FooterNPC
        npcType="default"
        npcName="Wallet NPC"
        dialogs={[
          "Welcome to your Flappy Coin Wallet! Manage coins, rewards, and more!",
          "Need more coins? I've got some tips for earning fast!",
          "Check your coin balance here anytime!",
          "Feeling lucky? Use your coins to spin and win!",
          "Want to buy a new skin? Coins make it happen!",
          "This is your Pi coin vault. Keep it safe!",
          "Earn coins by flapping — the higher you go, the more you earn!",
          "Save your coins for rare items!",
          "Spin the roulette for a chance at rare rewards!",
          "Watch ads to earn bonus coins!",
          "You can buy coins with Pi for special events!",
          "Track your weekly stats and beat your best!",
          "Legendary boxes are super rare — good luck!",
          "Mystery boxes can contain awesome surprises!",
          "Power-ups help you flap further!",
          "Subscribers get ad-free rewards!",
          "Invite friends to earn bonus coins!",
          "Your wallet ID is unique — keep it safe!",
          "Check out the shop for cool items!",
          "You can receive coins from friends soon!",
          "Spin again for a chance at legendary rewards!",
          "The more you play, the more you earn!",
          "Try to collect every power-up!",
          "Rare wins are tracked weekly!",
          "Confetti for every big win!",
          "Your balance updates in real time!",
          "Roulette spins are super fun!",
          "You can always come back for more coins!",
          "Flappy Pi is all about fun and rewards!",
          "Good luck, and keep flapping!"
        ]}
      />
      <EnhancedFooter
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
    </div>
  );
};

export default WalletPage; 