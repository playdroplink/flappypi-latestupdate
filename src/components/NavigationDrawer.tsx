import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Home, ShoppingBag, BarChart, Settings, Info, Users, BookOpen, Gift, Coins, History, Shield, Wallet, Newspaper, Lightbulb, Link2, Handshake, Mail, Bell, Star, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import PrivacyModal from './PrivacyModal';
import TermsModal from './TermsModal';
import LicenseModal from './LicenseModal';
import HelpModal from './HelpModal';
import AboutModal from './AboutModal';
import WhitepaperModal from './WhitepaperModal';
import SettingsModal from './SettingsModal';
import { inventoryService } from '@/services/inventoryService';
import SubscriptionPlansModal from '@/components/SubscriptionPlansModal';
import { useLanguage } from '../context/LanguageContext';

interface NavigationDrawerProps {
  onNavigate: (path: string) => void;
  onOpenTutorial: () => void;
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onLogout?: () => void;
  piUser?: any;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ onNavigate, onOpenTutorial, musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled, onLogout, piUser }) => {
  const { t } = useLanguage();
  const [showAbout, setShowAbout] = React.useState(false);
  const [showWhitepaper, setShowWhitepaper] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const [showTerms, setShowTerms] = React.useState(false);
  const [showLicense, setShowLicense] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  const [showTutorial, setShowTutorial] = React.useState(false);
  const [hasUnclaimedRewards, setHasUnclaimedRewards] = React.useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = React.useState(false);

  React.useEffect(() => {
    const checkUnclaimedRewards = () => {
      const hasUnclaimed = inventoryService.hasUnclaimedSubscriptionRewards();
      setHasUnclaimedRewards(hasUnclaimed);
    };

    checkUnclaimedRewards();

    // Listen for unclaimed rewards updates
    const handleUnclaimedRewardsUpdate = () => {
      checkUnclaimedRewards();
    };

    window.addEventListener('unclaimed-rewards-updated', handleUnclaimedRewardsUpdate);

    return () => {
      window.removeEventListener('unclaimed-rewards-updated', handleUnclaimedRewardsUpdate);
    };
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-blue-700 bg-blue-100 hover:bg-blue-200 mt-16 p-0 relative" 
          style={{ width: 48, height: 48 }}
          onClick={() => console.log('NavigationDrawer Debug - Menu button clicked')}
        >
          <img src="/menu.png" alt="Menu" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          {hasUnclaimedRewards && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">!</span>
            </div>
          )}
        </Button>
      </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-gradient-to-b from-blue-100 via-indigo-50 to-indigo-100 text-blue-900 border-none flex flex-col">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-3xl font-extrabold text-blue-700 drop-shadow-md text-center">Flappy Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mb-6">
          <button 
            onClick={() => {
              setShowPrivacy(true);
            }} 
            className="w-full py-3 rounded-xl font-black text-lg bg-blue-600 hover:bg-blue-700 text-white shadow transition-all"
          >
            Privacy Policy
          </button>
          <button 
            onClick={() => {
              setShowTerms(true);
            }} 
            className="w-full py-3 rounded-xl font-black text-lg bg-blue-600 hover:bg-blue-700 text-white shadow transition-all"
          >
            Terms of Service
          </button>
          <button 
            onClick={() => {
              setShowLicense(true);
            }} 
            className="w-full py-3 rounded-xl font-black text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow transition-all"
          >
            PiOS License
          </button>
          <button 
            onClick={() => {
              setShowHelp(true);
            }} 
            className="w-full py-3 rounded-xl font-black text-lg bg-yellow-600 hover:bg-yellow-700 text-white shadow transition-all"
          >
            Help & Support
          </button>
          <button 
            onClick={() => {
              setShowAbout(true);
            }} 
            className="w-full py-3 rounded-xl font-black text-lg bg-blue-600 hover:bg-blue-700 text-white shadow transition-all"
          >
            About
          </button>
          <button 
            onClick={() => {
              setShowTutorial(true);
            }} 
            className="w-full py-3 rounded-xl font-black text-lg bg-green-600 hover:bg-green-700 text-white shadow transition-all"
          >
            Tutorial
          </button>
          <button 
            onClick={() => {
              setShowWhitepaper(true);
            }} 
            className="w-full py-3 rounded-xl font-black text-lg bg-blue-600 hover:bg-blue-700 text-white shadow transition-all"
          >
            Whitepaper
          </button>
          <button 
            onClick={() => {
              setShowSettings(true);
            }} 
            className="w-full py-3 rounded-xl font-black text-lg bg-blue-600 hover:bg-blue-700 text-white shadow transition-all"
          >
            Settings
          </button>
          <button 
            onClick={() => {
              setShowSubscriptionPlans(true);
            }} 
            className="w-full py-3 rounded-xl font-black text-lg bg-purple-600 hover:bg-purple-700 text-white shadow transition-all"
          >
            Subscription Plans
          </button>
        </div>
        <nav className="flex flex-col gap-3">
          <Link 
            to="/home" 
            onClick={() => console.log('NavigationDrawer Debug - Home link clicked')}
            className="w-full py-4 rounded-xl font-black text-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition-all text-center"
          >
            Home
          </Link>
          <Link 
            to="/shop" 
            onClick={() => console.log('NavigationDrawer Debug - Shop link clicked')}
            className="w-full py-4 rounded-xl font-black text-xl bg-purple-600 hover:bg-purple-700 text-white shadow transition-all text-center"
          >
            Shop
          </Link>
          <Link 
            to="/leaderboard" 
            onClick={() => console.log('NavigationDrawer Debug - Leaderboard link clicked')}
            className="w-full py-4 rounded-xl font-black text-xl bg-pink-600 hover:bg-pink-700 text-white shadow transition-all text-center"
          >
            Leaderboard
          </Link>
          <Link 
            to="/profile" 
            onClick={() => console.log('NavigationDrawer Debug - Profile link clicked')}
            className="w-full py-4 rounded-xl font-black text-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition-all text-center"
          >
            User Profile
          </Link>
          <Link 
            to="/inventory" 
            onClick={() => console.log('NavigationDrawer Debug - Inventory link clicked')}
            className="w-full py-4 rounded-xl font-black text-xl bg-green-600 hover:bg-green-700 text-white shadow transition-all text-center relative"
          >
            Inventory
            {hasUnclaimedRewards && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">!</span>
              </div>
            )}
          </Link>
          <Link 
            to="/payment-history" 
            className="w-full py-4 rounded-xl font-black text-xl bg-yellow-600 hover:bg-yellow-700 text-white shadow transition-all text-center"
          >
            Payment History
          </Link>
          <Link 
            to="/purchase-history" 
            className="w-full py-4 rounded-xl font-black text-xl bg-yellow-600 hover:bg-yellow-700 text-white shadow transition-all text-center"
          >
            Purchase History
          </Link>
          <Link 
            to="/pi-auth-debug" 
            className="w-full py-4 rounded-xl font-black text-xl bg-red-600 hover:bg-red-700 text-white shadow transition-all text-center"
          >
            🔧 Pi Auth Debug
          </Link>
          <Link 
            to="/flappy-pi-blog" 
            className="w-full py-4 rounded-xl font-black text-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition-all text-center"
          >
            Blog
          </Link>
          <Link 
            to="/dino-pi-blog" 
            className="w-full py-4 rounded-xl font-black text-xl bg-green-600 hover:bg-green-700 text-white shadow transition-all text-center"
          >
            <img src="/dino pi/dinopi logo.png" alt="Dino Pi Logo" className="w-6 h-6 inline mr-2" />
            Dino Pi Blog
          </Link>
          <Link 
            to="/wiki" 
            className="w-full py-4 rounded-xl font-black text-xl bg-indigo-200 hover:bg-indigo-300 text-blue-900 shadow transition-all text-center"
          >
            Flappy Wiki
          </Link>
          <Link 
            to="/full-flappy-wiki" 
            className="w-full py-4 rounded-xl font-black text-xl bg-indigo-300 hover:bg-indigo-400 text-blue-900 shadow transition-all text-center"
          >
            Full Flappy Wiki Page
          </Link>
          <Link 
            to="/social-challenge" 
            className="w-full py-4 rounded-xl font-black text-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition-all text-center"
          >
            {t('socialChallenge')}
          </Link>
          <Link 
            to="/community" 
            className="w-full py-4 rounded-xl font-black text-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition-all text-center"
          >
            {t('flappyPiCommunity')}
          </Link>
          <Link 
            to="/partnership" 
            className="w-full py-4 rounded-xl font-black text-xl bg-orange-100 hover:bg-orange-200 text-blue-900 shadow transition-all text-center"
          >
            Partnership
          </Link>
          <Link 
            to="/contact" 
            className="w-full py-4 rounded-xl font-black text-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition-all text-center"
          >
            Contact
          </Link>
          <Link 
            to="/status" 
            className="w-full py-4 rounded-xl font-black text-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition-all text-center"
          >
            Status
          </Link>
          <Link 
            to="/pi-test" 
            className="w-full py-4 rounded-xl font-black text-xl bg-red-600 hover:bg-red-700 text-white shadow transition-all text-center"
          >
            🧪 Pi Test
          </Link>
        </nav>
        <div className="mt-8 border-t pt-4 flex flex-col items-center">
          <span className="font-bold text-blue-700 mb-2">Follow Us</span>
          <div className="flex gap-4">
            <a href="https://x.com/flappypifun" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
              <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M17.53 2.47A6.5 6.5 0 0 1 21.5 8.5c0 1.61-.59 3.09-1.57 4.23l3.07 3.07a1 1 0 0 1-1.42 1.42l-3.07-3.07A6.5 6.5 0 1 1 17.53 2.47zm-1.06 1.06a4.5 4.5 0 1 0 0 6.36 4.5 4.5 0 0 0 0-6.36zM4.5 8.5a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0zm13.44 6.44a1 1 0 0 1 1.42 0l3.07 3.07a1 1 0 0 1-1.42 1.42l-3.07-3.07a1 1 0 0 1 0-1.42z"/></svg>
            </a>
            <a href="https://x.com/flappypifun" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.82 1.92 3.6-.71-.02-1.38-.22-1.97-.54v.05c0 2.1 1.5 3.85 3.5 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.6 8.6 0 0 1 2 19.54c-.29 0-.57-.02-.85-.05A12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 24 4.59a8.36 8.36 0 0 1-2.54.7z"/></svg>
            </a>
            <a href="https://discord.gg/W2CJFMqR" target="_blank" rel="noopener noreferrer" aria-label="Discord">
              <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.369A19.791 19.791 0 0 0 16.885 3.2a.074.074 0 0 0-.078.037c-.34.607-.719 1.396-.984 2.01a18.524 18.524 0 0 0-5.59 0 12.51 12.51 0 0 0-.997-2.01.077.077 0 0 0-.078-.037A19.736 19.736 0 0 0 3.684 4.369a.07.07 0 0 0-.032.027C.533 9.09-.32 13.64.099 18.13a.08.08 0 0 0 .031.056c2.104 1.548 4.13 2.49 6.102 3.11a.077.077 0 0 0 .084-.027c.47-.646.89-1.326 1.25-2.03a.076.076 0 0 0-.041-.104c-.662-.25-1.293-.548-1.91-.892a.077.077 0 0 1-.008-.128c.128-.096.256-.197.378-.299a.074.074 0 0 1 .077-.01c4.01 1.83 8.36 1.83 12.326 0a.075.075 0 0 1 .078.009c.122.102.25.203.378.299a.077.077 0 0 1-.007.128 12.298 12.298 0 0 1-1.911.892.076.076 0 0 0-.04.105c.36.704.78 1.384 1.25 2.03a.076.076 0 0 0 .084.027c1.97-.62 3.997-1.562 6.102-3.11a.077.077 0 0 0 .03-.055c.5-5.177-.838-9.705-3.548-13.734a.062.062 0 0 0-.032-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.175 1.094 2.157 2.418 0 1.334-.955 2.419-2.157 2.419zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.175 1.094 2.157 2.418 0 1.334-.947 2.419-2.157 2.419z"/></svg>
            </a>
            <a href="https://t.me/flappypiofficial" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
              <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M9.04 17.97c-.39 0-.32-.15-.45-.53l-1.13-3.72 8.7-5.15c.38-.23.74-.1.57.33l-1.48 5.02c-.11.39-.28.53-.57.33l-2.04-1.49-1.01.97c-.11.11-.2.2-.41.2zm-2.1-3.13l.44 1.44c.07.23.13.31.36.23l.98-.32 1.01-.97-2.79-2.04zm13.06-9.84c-1.13-.45-2.34-.7-3.6-.7-4.97 0-9 4.03-9 9 0 1.26.25 2.47.7 3.6l-1.7 5.53c-.13.43.1.7.53.57l5.53-1.7c1.13.45 2.34.7 3.6.7 4.97 0 9-4.03 9-9 0-1.26-.25-2.47-.7-3.6l1.7-5.53c.13-.43-.1-.7-.53-.57l-5.53 1.7z"/></svg>
            </a>
          </div>
        </div>
        <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
        <WhitepaperModal isOpen={showWhitepaper} onClose={() => setShowWhitepaper(false)} />
        <SettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
          musicEnabled={musicEnabled} 
          onMusicToggle={setMusicEnabled} 
          soundEnabled={soundEnabled} 
          onSoundToggle={setSoundEnabled}
          theme="light"
          onThemeChange={() => {}}
        />
        <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
        <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        <LicenseModal isOpen={showLicense} onClose={() => setShowLicense(false)} />
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        <SubscriptionPlansModal isOpen={showSubscriptionPlans} onClose={() => setShowSubscriptionPlans(false)} />
      </SheetContent>
    </Sheet>
  );
};

export default NavigationDrawer; 