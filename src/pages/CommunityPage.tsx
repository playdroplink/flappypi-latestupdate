import React, { useState, useEffect, useMemo } from 'react';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Coins, DollarSign, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageWithFallback from '@/components/ImageWithFallback';
import EnhancedFooter from '../components/EnhancedFooter';
import FooterNPC from '../components/FooterNPC';
import { FaTwitter, FaDiscord, FaTelegram, FaYoutube, FaInstagram, FaFacebook, FaTiktok, FaGlobe, FaComments, FaBookmark } from 'react-icons/fa';
import { useGameState } from '../hooks/useGameState';
import { useSoundEffects } from '../hooks/useSoundEffects';
import SlotMachine from '../components/SlotMachine';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useWallet } from '../context/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { adService } from '../services/adService';
import { showRewardedAdAndVerify } from '../utils/piAds';
// Removed paid roulette (Pi payment) flow
import { powerUpItems } from '@/constants/powerUpItems';
// import { mysteryBoxItems } from '@/constants/mysteryBoxItems';
import { inventoryService } from '@/services/inventoryService';
import CommunityGuidelinesModal from '@/components/CommunityGuidelinesModal';
import { useRewardedAdCooldown } from '../hooks/useRewardedAdCooldown';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import { piBrowserRedirect } from '../utils/piBrowserRedirect';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

// Social media links
const socialLinks: Array<{
  name: string;
  handle: string;
  url: string;
  icon: JSX.Element;
  btn: string;
  color: string;
  isInternal?: boolean;
}> = [
  { name: 'Discord', handle: '@flappypiofficial', url: 'https://discord.gg/W2CJFMqR', icon: <FaDiscord className="text-4xl text-indigo-500" />, btn: 'Join Discord', color: '#5865F2' },
  { name: 'Twitter', handle: '@flappypifun', url: 'https://x.com/flappypifun', icon: <FaTwitter className="text-4xl text-blue-400" />, btn: 'Follow', color: '#1DA1F2' },
  { name: 'Telegram', handle: '@flappypiofficial', url: 'https://t.me/flappypiofficial', icon: <FaTelegram className="text-4xl text-blue-500" />, btn: 'Join Channel', color: '#0088cc' },
  { name: 'YouTube', handle: '@flappypiofficial', url: 'https://youtube.com/@flappypiofficial', icon: <FaYoutube className="text-4xl text-red-500" />, btn: 'Subscribe', color: '#FF0000' },
  { name: 'Instagram', handle: '@flappypiofficial', url: 'https://instagram.com/flappypiofficial', icon: <FaInstagram className="text-4xl text-pink-500" />, btn: 'Follow', color: '#E4405F' },
  { name: 'Facebook', handle: '@flappypiofficial', url: 'https://facebook.com/flappypiofficial', icon: <FaFacebook className="text-4xl text-blue-600" />, btn: 'Like Page', color: '#1877F2' },
  { name: 'TikTok', handle: '@flappypiofficial', url: 'https://tiktok.com/@flappypiofficial', icon: <FaTiktok className="text-4xl text-black" />, btn: 'Follow', color: '#000000' },
  { name: 'Fireside Forum', handle: '@FlappyPiChallenge', url: 'https://fireside.pinet.com/channels/FlappyPiChallenge', icon: <FaComments className="text-4xl text-orange-500" />, btn: 'Join Forum', color: '#FF6B35' },
  { name: 'Blog', handle: 'flappypiblog', url: '/flappy-pi-blog', icon: <FaBookmark className="text-4xl text-purple-500" />, btn: 'Read Blog', color: '#8B5CF6', isInternal: true },
  { name: 'Website', handle: 'flappypiofficial', url: '/flappypiofficial', icon: <FaGlobe className="text-4xl text-green-600" />, btn: 'Visit Website', color: '#10B981', isInternal: true },
];

// Flying birds background component
const FlyingBirdsBackground = ({ count = 8 }) => {
  // Use useMemo to ensure animation properties are stable and don't change on re-renders
  const birdElements = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${3 + Math.random() * 2}s`,
      birdImage: Math.floor(Math.random() * 13)
    }));
  }, [count]); // Only recalculate if count changes

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden flying-birds-container">
      {birdElements.map((bird) => (
        <div
          key={bird.id}
          className="absolute animate-float"
          style={{
            left: bird.left,
            top: bird.top,
            animationDelay: bird.animationDelay,
            animationDuration: bird.animationDuration
          }}
        >
          <img 
            src={`/birds2/bird_${bird.birdImage}.gif`} 
            alt="Flying bird" 
            className="w-8 h-8 opacity-20"
          />
        </div>
      ))}
    </div>
  );
};

// Roulette rewards configuration with enhanced items
const adRouletteRewards = [
  { type: 'coin', id: 'coin', amount: 5, image: '/flappycoins.png', name: '5 Coins', color: '#FFD700' },
  { type: 'coin', id: 'coin', amount: 10, image: '/flappycoins.png', name: '10 Coins', color: '#FFD700' },
  { type: 'coin', id: 'coin', amount: 20, image: '/flappycoins.png', name: '20 Coins', color: '#C0C0C0' },
  { type: 'coin', id: 'coin', amount: 50, image: '/flappycoins.png', name: '50 Coins', color: '#FF6B35' },
  // Add power-ups to ad roulette
  ...powerUpItems.slice(0, 2).map(p => ({
    type: 'powerup',
    id: p.id,
    image: p.image,
    name: p.name,
    color: '#C0C0C0'
  })),
  { type: 'none', id: 'none', image: '/flappycoins.png', name: 'Try Again', color: '#808080' },
];

// Removed paid roulette rewards

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);
  const { musicEnabled, setMusicEnabled } = useGameState();
  const { soundEnabled, setSoundEnabled } = useSoundEffects();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const { balance, setBalance } = useWallet();
  const { toast } = useToast();
  const { settings } = useSettings();
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');
  const [showGuidelines, setShowGuidelines] = useState(false);
  
  // Roulette state
  const [showAdRoulette, setShowAdRoulette] = useState(false);
  // Removed paid roulette state
  const [isSpinning, setIsSpinning] = useState(false);
  const [showAdConfirm, setShowAdConfirm] = useState(false);
  // Removed Pi payment state and pending type
  const [showWheel, setShowWheel] = useState(false);
  const [wheelRewards, setWheelRewards] = useState<any[]>([]);
  const [wheelSelected, setWheelSelected] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardToShow, setRewardToShow] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);
  const [lastReward, setLastReward] = useState<string | null>(null);
  const adCooldown = useRewardedAdCooldown();

  // Ensure animation performance remains stable after ad interactions
  useEffect(() => {
    // Force consistent animation performance for flying birds
    const style = document.createElement('style');
    style.id = 'community-page-animation-fix';
    style.textContent = `
      .flying-birds-container .animate-float {
        animation-duration: inherit !important;
        animation-timing-function: ease-in-out !important;
        animation-iteration-count: infinite !important;
        will-change: transform;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('community-page-animation-fix');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Enhanced spinRoulette with proper animation
  const spinRoulette = () => {
    const rewards = adRouletteRewards;
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const result = rewards[randomIndex];
    
    setWheelRewards(rewards);
    setWheelSelected(randomIndex);
    setShowWheel(true);
    setIsWheelSpinning(true);
    
    // Simulate spinning with proper timing
    setTimeout(() => {
      setIsWheelSpinning(false);
      setShowWheel(false);
      setShowRewardModal(true);
      setRewardToShow(result);
      setShowConfetti(true);
      
      // Apply the reward
      if (result.type === 'coin' && 'amount' in result && typeof result.amount === 'number' && result.amount > 0) {
        setBalance(balance + result.amount);
        setLastReward(`+${result.amount} Flappy Coins!`);
        toast({
          title: `+${result.amount} Flappy Coins!`,
          description: 'You won coins from watching an ad!',
          duration: 3000
        });
      } else if (result.type === 'powerup') {
        // Add power-up to inventory
        inventoryService.saveToInventory({
          id: result.id,
          name: result.name,
          type: 'powerup',
          quantity: 1,
          image: result.image,
          description: 'Won from watching an ad!'
        });
        setLastReward(`${result.name} Power-up!`);
        toast({
          title: `Power-up Won!`,
          description: `You won ${result.name} from watching an ad!`,
          duration: 3000
        });
      } else if (result.type === 'mysterybox') {
        // Mystery boxes are not available in ad roulette
      }
    }, 3000);
  };

  // Ad Roulette with Pi Ad Network integration
  const handleAdRoulette = async () => {
    setIsSpinning(true);
    
    try {
      // Use Pi Ad Network
      const result = await adService.showRewardedAd();
      if (result.success && result.shown) {
        spinRoulette();
        toast({
          title: 'Ad Watched!',
          description: 'Thanks for watching the ad. Spinning roulette...',
          duration: 2000
        });
      } else if (result.success && !result.shown) {
        // Ad was skipped (subscriber or settings)
        spinRoulette();
        toast({
          title: 'Ad-Free Spin!',
          description: 'Ad skipped for subscriber. Enjoy your reward!',
          duration: 2000
        });
      } else {
        toast({
          title: 'Ad unavailable',
          description: result.reason || 'Ad could not be loaded. Try again later.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      // Fallback to showRewardedAdAndVerify
      showRewardedAdAndVerify(
        (reward) => {
          setIsSpinning(false);
          spinRoulette();
          toast({
            title: 'Ad Watched!',
            description: 'Thanks for watching the ad. Spinning roulette...',
            duration: 2000
          });
        },
        () => {
          setIsSpinning(false);
          toast({ 
            title: 'Ads not supported', 
            description: 'Please update Pi Browser to watch ads.', 
            variant: 'destructive' 
          });
        },
        () => {
          setIsSpinning(false);
          toast({ 
            title: 'Ad unavailable', 
            description: 'Ad could not be loaded. Try again later.', 
            variant: 'destructive' 
          });
        }
      );
    } finally {
      setIsSpinning(false);
    }
  };

  // Removed paid roulette handlers

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <BackgroundDecoration />
        <FlyingBirdsBackground count={16} />
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-18px); }
          }
          .animate-float {
            animation: float 3.5s ease-in-out infinite !important;
          }
          /* Ensure flying birds maintain consistent animation speed */
          .flying-birds-container .animate-float {
            animation-duration: inherit !important;
            animation-timing-function: ease-in-out !important;
            animation-iteration-count: infinite !important;
          }
          .card-bounce {
            animation: bounce 1.8s infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
        <div className="bg-white/90 shadow-xl p-8 w-full flex flex-col items-center relative mx-auto max-w-2xl z-10 rounded-3xl mt-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-full p-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <ImageWithFallback src="/flappy-logo.png" alt="Flappy Pi Mascot" className="w-24 h-24 mb-4 animate-bounce drop-shadow-xl" lazy={true} />
           <h1 className="text-4xl font-black mb-2 drop-shadow-lg text-blue-700 text-center">Flappy Pi Community</h1>
           <p className="text-lg text-blue-800 font-medium mb-4 drop-shadow-md text-center">Connect with other players, join discussions, and help shape the future of Flappy Pi.</p>
           <div className="mb-4">
             <Button variant="outline" className="font-bold" onClick={() => setShowGuidelines(true)}>
               Community Guidelines
             </Button>
           </div>
          
          {/* Enhanced Reward System Section */}
          <div className="w-full mb-8 bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full p-3 mr-3">
                  <span className="text-2xl">🎁</span>
                </div>
                <h2 className="text-2xl font-bold text-blue-800">Community Rewards</h2>
              </div>
              <p className="text-lg text-blue-700 font-medium">Support our community by watching ads and earn amazing rewards!</p>
            </div>
            
            {/* Reward Benefits Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/80 rounded-xl p-4 text-center shadow-md">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-bold text-green-700 mb-1">Flappy Coins</h3>
                <p className="text-sm text-gray-600">25-50 coins per ad</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center shadow-md">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-bold text-purple-700 mb-1">Power-ups</h3>
                <p className="text-sm text-gray-600">Special abilities</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center shadow-md">
                <div className="text-3xl mb-2">🎁</div>
                <h3 className="font-bold text-orange-700 mb-1">Mystery Boxes</h3>
                <p className="text-sm text-gray-600">Surprise rewards</p>
              </div>
            </div>

            {/* Watch Ad Button */}
            <div className="text-center">
              <button
                onClick={piBrowserRedirect.isInPiBrowser() && !isSpinning && adCooldown === 0 ? handleAdRoulette : () => piBrowserRedirect.showPiBrowserMessage()}
                className={`w-full max-w-md py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg ${
                  piBrowserRedirect.isInPiBrowser() && !isSpinning && adCooldown === 0
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white disabled:opacity-50' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                disabled={isSpinning || adCooldown > 0 || !piBrowserRedirect.isInPiBrowser()}
              >
                {!piBrowserRedirect.isInPiBrowser() 
                  ? '🌐 Pi Browser Required' 
                  : adCooldown > 0 
                    ? `⏰ Ad available in 0:${adCooldown.toString().padStart(2, '0')}` 
                    : isSpinning 
                      ? '🎬 Watching Ad...' 
                      : '🎬 Watch Ad for Rewards'
                }
              </button>
              
              {/* Cooldown Timer */}
              {adCooldown > 0 && (
                <div className="mt-3 text-sm text-blue-600">
                  <p>⏰ Next ad available in {adCooldown} seconds</p>
                </div>
              )}
              
              {/* Success Message */}
              {lastReward && (
                <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-green-800 font-medium">🎉 {lastReward}</p>
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="mt-6 bg-white/60 rounded-xl p-4">
              <h3 className="font-bold text-blue-800 mb-2 text-center">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold text-blue-700">1</div>
                  <p className="text-gray-700">Click "Watch Ad for Rewards"</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold text-blue-700">2</div>
                  <p className="text-gray-700">Watch a short advertisement</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold text-blue-700">3</div>
                  <p className="text-gray-700">Receive your rewards instantly!</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 z-20">
            {socialLinks.map((s, idx) => (
              <div key={s.name} className="flex flex-col items-center justify-between rounded-2xl shadow-lg p-6 card-bounce bg-white" style={{animationDelay: `${idx * 0.1}s`}}>
                <div className="mb-2">{s.icon}</div>
                <div className="font-bold text-lg mb-1 text-gray-900">{s.name}</div>
                <div className="mb-3 text-base opacity-90 text-gray-700">{s.handle}</div>
                {s.isInternal ? (
                  <Button 
                    className="w-full font-bold text-base py-2 rounded-xl shadow-md transition border-0" 
                    style={{ background: s.color, color: '#fff' }}
                    onClick={() => navigate(s.url)}
                  >
                    {s.btn}
                  </Button>
                ) : (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full font-bold text-base py-2 rounded-xl shadow-md transition border-0" style={{ background: s.color, color: '#fff' }}>
                    {s.btn}
                  </Button>
                </a>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Community NPC above the footer */}
        <FooterNPC
          npcType="default"
          npcName="Community NPC"
          dialogs={[
            "Welcome to the Flappy Pi Community!",
            "Connect with other players and share your experiences!",
            "Join our Discord for real-time discussions!",
            "Follow us on social media for updates!",
            "Share your high scores and strategies!",
            "The community is growing every day!",
            "We love hearing from our players!",
            "Stay connected for exclusive events!",
            "Your feedback helps improve the game!",
            "Together we make Flappy Pi better! 🐦"
          ]}
        />
      </div>
      
      {/* Enhanced Roulette Modals */}
      <Dialog open={showAdConfirm} onOpenChange={setShowAdConfirm}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Watch Ad for Rewards?</DialogTitle>
            <DialogDescription>Watch an ad to get rewards?</DialogDescription>
          </DialogHeader>
          <div className="my-3 sm:my-4 text-sm sm:text-base">Watch an ad to get rewards?</div>
          <div className="flex justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base" onClick={() => { setShowAdConfirm(false); handleAdRoulette(); }}>
              Yes
            </button>
            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base" onClick={() => setShowAdConfirm(false)}>
              No
            </button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Paid roulette removed */}
      
      {/* Enhanced Roulette Wheel Modal */}
      {showWheel && (
        <Dialog open={showWheel} onOpenChange={setShowWheel}>
          <DialogContent className="max-w-lg text-center">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-blue-800">🎰 Spin the Roulette!</DialogTitle>
              <DialogDescription>Spin the roulette wheel to reveal your reward.</DialogDescription>
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
          <DialogContent className="max-w-md text-center">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-blue-800">
                {showConfetti ? '🎉 You Won!' : 'Result'}
              </DialogTitle>
              <DialogDescription>Your roulette spin result.</DialogDescription>
            </DialogHeader>
            {showConfetti && (
              <div className="flex flex-col items-center justify-center my-6">
                <div className="relative">
                  <img 
                    src={rewardToShow.image} 
                    alt={rewardToShow.name} 
                    className="w-24 h-24 mx-auto mb-4 drop-shadow-xl animate-bounce" 
                  />
                </div>
                <div className="text-2xl font-bold mb-2" style={{ color: rewardToShow.color }}>
                  {rewardToShow.name}
                </div>
                {rewardToShow.type === 'coin' && 'amount' in rewardToShow && typeof rewardToShow.amount === 'number' && rewardToShow.amount > 0 && (
                  <div className="text-lg text-blue-800 font-semibold">+{rewardToShow.amount} Flappy Coins!</div>
                )}
                {rewardToShow.type === 'powerup' && (
                  <div className="text-lg text-green-600 font-semibold">Power-up Added to Inventory!</div>
                )}
                {rewardToShow.type === 'mysterybox' && (
                  <div className="text-lg text-purple-600 font-semibold">Mystery Box Added to Inventory!</div>
                )}
                {rewardToShow.type === 'none' && (
                  <div className="text-lg text-red-500 font-semibold">Better luck next time!</div>
                )}
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
      
      <EnhancedFooter 
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
      <CommunityGuidelinesModal isOpen={showGuidelines} onClose={() => setShowGuidelines(false)} />
    </SkyBackground>
  );
};

export default CommunityPage; 