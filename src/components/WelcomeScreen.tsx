import React, { useEffect, useState } from 'react';
import PiPremiumPerks from './PiPremiumPerks';
import WelcomeHeader from './welcome/WelcomeHeader';
import UserStatsCard from './welcome/UserStatsCard';
import GameModeButtons from './welcome/GameModeButtons';
import QuickActionButtons from './welcome/QuickActionButtons';
import BackgroundElements from './welcome/BackgroundElements';
import EnhancedFooter from './EnhancedFooter';
import ContactModal from './ContactModal';
import HelpModal from './HelpModal';
import PrivacyModal from './PrivacyModal';
import TermsModal from './TermsModal';
import PurchaseHistoryModal from './PurchaseHistoryModal';
import ChatbotLanguageModal from './ChatbotLanguageModal';
import AuthenticationUI from './AuthenticationUI';
import { ScrollArea } from './ui/scroll-area';
import { usePiBrowserDetection } from '../hooks/usePiBrowserDetection';
import { Button } from './ui/button';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import SubscriptionNPC from './SubscriptionNPC';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

type GameMode = 'classic' | 'endless' | 'challenge';

interface WelcomeScreenProps {
  onStartGame: (mode: GameMode) => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact: () => void;
  onOpenHelp: () => void;
  onOpenTutorial: () => void;
  coins: number;
  musicEnabled: boolean;
  onToggleMusic: (enabled: boolean) => void;
  username?: string;
  onLogin?: () => void;
  piUser?: any;
}

// --- NPC Dialog Lines ---
const NPC_DIALOGS = [
  "Flap like nobody's watching!",
  "Those pipes look angry today...",
  "You were born to fly!",
  "Nice wingspan!",
  "Oops! That one looked close.",
  "The skies are yours — take them!",
  "Feathers don't fail me now!",
  "This bird's got game!",
  "Stay sharp, pipes ahead!",
  "Fly smooth, fly smart.",
  "You call that a flap?",
  "Legend says someone once scored 100...",
  "Focus... and flap!",
  "Pipes fear you!",
  "That was almost impressive!",
  "Gravity? Never heard of her.",
  "Keep flapping, champ!",
  "Oh no... again?!",
  "You vs. pipes — let's go!",
  "Speed isn't everything. Control is key!",
  "Bird with a dream 💭",
  "Better than last time... maybe.",
  "Your feathers look stressed.",
  "Almost made it… almost.",
  "Pipe dodger in training!",
  "You got this, feather friend!",
  "Use the wind!",
  "Nice timing!",
  "Stay low. Wait—no! Go high!",
  "Trust your flaps!",
  "Don't choke now!",
  "Too early! Or too late?",
  "Why do you keep hitting that one?",
  "Pipe 1, You 0.",
  "This is your run, I can feel it!",
  "Bird instincts kicking in!",
  "You were *so* close!",
  "How are you still alive?!",
  "You're basically flying Pi!",
  "Proud of you, little bird.",
  "Not bad for a beginner.",
  "Is this the run of destiny?",
  "No pain, no gain!",
  "Fly like you mean it!",
  "Those pipes don't stand a chance.",
  "You flap with style!",
  "Almost elegant!",
  "Watch the gap!",
  "Don't blink!",
  "Just 10 more and you're a legend!",
  "I've seen better… barely.",
  "Eyes on the pipes!",
  "Feathers crossed!",
  "Pro tip: don't hit anything.",
  "Every flap counts!",
  "Look at you go!",
  "You're one stylish bird.",
  "Hey! That was impressive!",
  "If pipes could talk… they'd scream!",
  "One more run?",
  "Practice makes Pi!",
  "This is better than last time!",
  "Don't crash. Please.",
  "I believe in you!",
  "Flying > Falling",
  "Are you even trying?",
  "Pipe incoming in 3… 2… oops!",
  "Sky's the limit!",
  "You call that flapping?",
  "Lookin' like a true Pi champion!",
  "Try dodging… not crashing.",
  "The wind is with you!",
  "It's giving… pro bird energy.",
  "That flap was clean!",
  "Wait for it… NOW!",
  "You hesitated… again!",
  "That pipe was sneaky!",
  "You're in the zone!",
  "Let's pretend that didn't happen.",
  "More pipes? No problem!",
  "Crash test bird?",
  "You're a flying Pi master!",
  "Keep flapping, future legend!",
  "Feather speed: MAXIMUM!",
  "Nothing can stop you now!",
  "Almost a record!",
  "Don't give up now!",
  "You'll laugh at these pipes someday!",
  "Flap to survive!",
  "Even the pipes are scared now!",
  "Precision is key!",
  "Every pro was once a beginner!",
  "You're flapping like a boss!",
  "Where's your Pi trophy?",
  "More flap, less crash!",
  "Breathe. Focus. Flap.",
  "You flap like a pro bird!",
  "Someone stop this bird!",
  "You're a flappy machine!",
  "One more pipe and you're a legend!"
];

// --- WelcomeNPCModal ---
const WelcomeNPCModal: React.FC<{ open: boolean; onClose: () => void; username?: string }> = ({ open, onClose, username }) => {
  const [dialog, setDialog] = useState('');
  useEffect(() => {
    if (open) {
      setDialog(NPC_DIALOGS[Math.floor(Math.random() * NPC_DIALOGS.length)]);
    }
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">×</button>
        <div className="flex gap-8 mb-4">
          <div className="flex flex-col items-center">
            <img src="/npc/nicolas.png" alt="Nicolas" className="w-20 h-20 rounded-full border-2 border-yellow-400 mb-1" />
            <span className="text-sm font-semibold text-yellow-700">Nicolas</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="/npc/chengdiao.png" alt="Chengdiao" className="w-20 h-20 rounded-full border-2 border-blue-400 mb-1" />
            <span className="text-sm font-semibold text-blue-700">Chengdiao</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-blue-900 mb-2 text-center">Welcome{username ? `, ${username}` : ''}!</h2>
        <p className="text-lg text-gray-800 text-center mb-4">{dialog}</p>
        <p className="text-base text-gray-600 text-center mb-2">We're your Flappy Pi guides. Ready to soar, dodge pipes, and win rewards? Let's make history together!</p>
        <button onClick={onClose} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-xl shadow">Let's Flap!</button>
      </div>
    </div>
  );
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartGame,
  onOpenShop,
  onOpenLeaderboard,
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact,
  onOpenHelp,
  onOpenTutorial,
  coins,
  musicEnabled,
  onToggleMusic,
  username,
  onLogin,
  piUser
}) => {
  const { isPiBrowser } = usePiBrowserDetection();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
  const [showChatbotModal, setShowChatbotModal] = useState(false);
  const [showNPCModal, setShowNPCModal] = useState(true);
  const { t } = useLanguage();

  // Use global music - only main theme song for home screen

  const handlePiPremiumUpgrade = () => {
    onOpenShop();
  };

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col bg-gradient-to-br from-blue-200 via-indigo-200 to-indigo-300 overflow-hidden">
      {/* Animated background elements */}
      <BackgroundElements />
             {/* NPC Welcome Modal */}
       <WelcomeNPCModal open={showNPCModal && !showChatbotModal && !showPrivacy && !showTerms && !showContact && !showHelp && !showPurchaseHistory} onClose={() => setShowNPCModal(false)} username={username} />
       {/* Force hide WelcomeNPCModal when chatbot modal is open */}
       {showChatbotModal && (
         <div style={{ display: 'none' }}>
           <WelcomeNPCModal open={false} onClose={() => {}} username={username} />
         </div>
       )}
      {/* Place the Social Challenge button at the top of the main container, above the mascot/NPC section */}
      <div className={`w-full flex flex-col items-center mb-6 ${showChatbotModal ? 'pointer-events-none opacity-50' : ''}`}>
        <Link to="/social-challenge" className="w-full max-w-xs">
          <button className="w-full py-4 rounded-2xl text-xl font-bold shadow-lg transition-all duration-200 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold border-2 border-pink-400 flex items-center justify-center gap-2">
            <img 
              src="/flappy pi gif/flappy-2.gif.gif" 
              alt="Flappy Pi" 
              className="w-8 h-8 inline-block mr-2 animate-bounce"
              onError={(e) => {
                console.warn('❌ Flappy Pi GIF failed to load in WelcomeScreen button, using fallback');
                e.currentTarget.src = '/flappy-logo.png';
              }}
            />
            Social Challenge
          </button>
        </Link>
      </div>
      <div className={`flex flex-col items-center justify-center min-h-[100svh] w-full px-2 py-4 sm:px-4 sm:py-8 relative z-10 ${showChatbotModal ? 'pointer-events-none opacity-50' : ''}`}>
        {/* Animated Mascot */}
        <img
          src="/flappy pi gif/flappy-2.gif.gif"
          alt="Flappy Pi Mascot"
          className="w-24 h-24 sm:w-32 sm:h-32 mb-2 sm:mb-4 animate-bounce drop-shadow-xl"
          onError={(e) => {
            console.warn('❌ Flappy Pi GIF failed to load in WelcomeScreen mascot, using fallback');
            e.currentTarget.src = '/flappy-logo.png';
          }}
          style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.15))' }}
          loading="lazy"
        />
                 {/* NPC: Always show SubscriptionNPC (plan NPC) */}
         <div 
           className="mb-2 sm:mb-4 animate-fade-in" 
           style={{ 
             animationDelay: '0.12s',
             display: showChatbotModal ? 'none' : 'block'
           }}
         >
           <SubscriptionNPC />
         </div>
        {/* Chatbot Button (below NPC) */}
        <div className="w-full max-w-xs sm:max-w-md mt-2 flex flex-col gap-2">
          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-3 shadow-lg hover:scale-105 transition animate-fade-in w-full"
            style={{ animationDelay: '0.15s' }}
            onClick={() => window.open('https://support.help.minepi.com/servicedesk/customer/portal/1/article/33038', '_blank')}
            aria-label="Open Flappy Pi Wiki"
          >
            <MessageCircle className="w-6 h-6 mr-2" />
            <span className="font-bold text-base">Flappy Pi Wiki</span>
          </button>
          {/* Authentication UI */}
          <AuthenticationUI variant="modal" />
        </div>
        {/* Header */}
        <h1 className="text-3xl sm:text-5xl font-black mb-1 sm:mb-2 drop-shadow-lg text-white text-center animate-fade-in">Welcome{username ? `, ${username}` : ''}!</h1>
        <p className="text-base sm:text-xl text-white/90 font-medium mb-3 sm:mb-6 drop-shadow-md text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Soar with the Pi Network! 🚀
        </p>
        {/* User Stats Card */}
        <div className="w-full max-w-xs sm:max-w-md mb-2 sm:mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <UserStatsCard 
            coins={coins}
            musicEnabled={musicEnabled}
            onToggleMusic={onToggleMusic}
            onOpenPurchaseHistory={() => setShowPurchaseHistory(true)}
          />
        </div>
        {/* Pi Premium Perks */}
        <div className="w-full max-w-xs sm:max-w-md mb-2 sm:mb-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <PiPremiumPerks onUpgrade={handlePiPremiumUpgrade} />
        </div>
        {/* Game Mode Buttons */}
        <div className="w-full max-w-xs sm:max-w-md mb-2 sm:mb-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <GameModeButtons 
            onGameModeSelect={onStartGame}
          />
        </div>
        {/* Quick Actions */}
        <div className="w-full max-w-xs sm:max-w-md mb-2 sm:mb-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <QuickActionButtons 
            onOpenShop={onOpenShop}
            onOpenLeaderboard={onOpenLeaderboard}
          />
        </div>
        {/* Chatbot Button (wrapped in div to avoid prop type conflicts) */}
        <div className="w-full max-w-xs sm:max-w-md mt-2">
          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-3 shadow-lg hover:scale-105 transition animate-fade-in w-full"
            style={{ animationDelay: '0.55s' }}
                            onClick={() => setShowChatbotModal(true)}
            aria-label="Open Flappy Pi Chatbot"
          >
            <MessageCircle className="w-6 h-6 mr-2" />
            <span className="font-bold text-base">Flappy Pi Chatbot</span>
          </button>
        </div>
        {/* Start Button CTA */}
        <button
          onClick={() => onStartGame('classic')}
          className="mt-4 sm:mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 rounded-2xl shadow-xl hover:scale-105 transition-all duration-200 animate-fade-in"
          style={{ animationDelay: '0.6s' }}
        >
          Start Playing
        </button>
      </div>
             {/* Enhanced Footer */}
       <div className={showChatbotModal ? 'pointer-events-none opacity-50' : ''}>
         <EnhancedFooter 
           musicEnabled={musicEnabled}
           setMusicEnabled={onToggleMusic}
           soundEnabled={true}
           setSoundEnabled={() => {}}
           piUser={piUser}
           onLogin={onLogin}
         />
       </div>
      {/* Modals */}
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
              <PurchaseHistoryModal isOpen={showPurchaseHistory} onClose={() => setShowPurchaseHistory(false)} />
        <ChatbotLanguageModal isOpen={showChatbotModal} onClose={() => setShowChatbotModal(false)} />
    </div>
  );
};

export default WelcomeScreen;
