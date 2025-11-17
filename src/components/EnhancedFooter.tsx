import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HelpModal from './HelpModal';
import AboutModal from './AboutModal';
import LicenseModal from './LicenseModal';
import PrivacyModal from './PrivacyModal';
import CommunityGuidelinesModal from './CommunityGuidelinesModal';
import TermsModal from './TermsModal';
import TutorialModal from './game/TutorialModal';
import WhitepaperModal from './WhitepaperModal';
import SettingsModal from './SettingsModal';
import SubscriptionPlansModal from './SubscriptionPlansModal';
import ChatbotLanguageModal from './ChatbotLanguageModal';
import { MessageCircle, Sun, Moon, Gamepad2 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';

const pages = [
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Shop', path: '/shop' },
  { label: 'Wallet', path: '/wallet' },
  { label: 'Settings', path: '/settings' },
  { label: 'Wiki', path: '/wiki' },
];

interface EnhancedFooterProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onLogin?: () => void;
  piUser?: any;
  children?: React.ReactNode;
  fixed?: boolean;
  gameMode?: 'light' | 'night';
  onGameModeChange?: (mode: 'light' | 'night') => void;
}

const EnhancedFooter: React.FC<EnhancedFooterProps> = ({ musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled, onLogin, piUser, children, fixed = false, gameMode = 'light', onGameModeChange }) => {
  const navigate = useNavigate();
  const { theme, isDark, isLight, getFooterBg, getFooterText, getFooterBorder, getButtonBg, getButtonText } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLicense, setShowLicense] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showWhitepaper, setShowWhitepaper] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showChatbotModal, setShowChatbotModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Prevent background scroll when menu is open
  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showMenu]);


  const handleLogin = async () => {
    if (onLogin) {
      await onLogin();
    }
  };

  // Handle theme change
  const handleThemeChange = (newTheme: 'light' | 'night') => {
    updateSettings({ theme: newTheme });
  };

  // FIXED: Handle game mode change: sync both game visual mode (if provided) and global theme
  const handleGameModeChange = (mode: 'light' | 'night') => {
    if (onGameModeChange) {
      onGameModeChange(mode);
    }
    // Also update global theme so pages using settings reflect the change
    // Map 'night' mode to 'night' theme, 'light' mode to 'light' theme
    const themeToSet = mode === 'night' ? 'night' : 'light';
    updateSettings({ theme: themeToSet });
    toast({
      title: 'Game Mode Changed',
      description: `Switched to ${mode === 'light' ? 'Light' : 'Night'} mode!`,
      variant: 'default',
    });
  };

  const footerClass = fixed
    ? `fixed bottom-0 left-0 right-0 w-full z-50 flex flex-col items-center gap-1 sm:gap-2 py-2 sm:py-4 ${getFooterBg()}/90 border-t ${getFooterBorder()} px-2`
    : `w-full flex flex-col items-center gap-1 sm:gap-2 py-2 sm:py-4 ${getFooterBg()}/90 border-t ${getFooterBorder()} px-2`;

  return (
    <footer className={footerClass} style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.05)' }}>
      <div className="flex flex-row w-full justify-between items-center gap-1 sm:gap-2">
        <div className="flex flex-1 justify-start items-center gap-1 sm:gap-2">
          <button onClick={() => setShowPrivacy(true)} className={`text-xs font-bold ${getButtonText()} ${getButtonBg()} px-2 sm:px-3 py-1 rounded-full shadow border-2 ${isDark ? 'border-gray-600' : 'border-blue-300'} transition-all whitespace-nowrap`}>Privacy</button>
          <button onClick={() => setShowTerms(true)} className={`text-xs font-bold ${getButtonText()} ${getButtonBg()} px-2 sm:px-3 py-1 rounded-full shadow border-2 ${isDark ? 'border-gray-600' : 'border-blue-300'} transition-all whitespace-nowrap`}>Terms</button>
          <button onClick={() => setShowGuidelines(true)} className={`text-xs font-bold ${getButtonText()} ${getButtonBg()} px-2 sm:px-3 py-1 rounded-full shadow border-2 ${isDark ? 'border-gray-600' : 'border-blue-300'} transition-all whitespace-nowrap`}>Guidelines</button>
        </div>
        <div className="flex flex-1 justify-center items-center">
          <button onClick={() => navigate('/mrwain-organization')} className={`text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-1 rounded-full shadow border-2 border-blue-500 transition-all whitespace-nowrap`}>Team</button>
        </div>
        <div className="flex flex-1 justify-end items-center gap-1 sm:gap-2">
          <button onClick={() => setShowAbout(true)} className={`text-xs font-bold ${getButtonText()} ${getButtonBg()} px-2 sm:px-3 py-1 rounded-full shadow border-2 ${isDark ? 'border-gray-600' : 'border-blue-300'} transition-all whitespace-nowrap`}>About</button>
          <button onClick={() => setShowLicense(true)} className={`text-xs font-bold ${getButtonText()} ${getButtonBg()} px-2 sm:px-3 py-1 rounded-full shadow border-2 ${isDark ? 'border-gray-600' : 'border-blue-300'} transition-all whitespace-nowrap`}>License</button>
          <button onClick={() => setShowTutorial(true)} className={`text-xs font-bold ${getButtonText()} ${isDark ? 'bg-green-800 hover:bg-green-700' : 'bg-green-100 hover:bg-green-200'} px-2 sm:px-3 py-1 rounded-full shadow border-2 ${isDark ? 'border-green-600' : 'border-green-300'} transition-all whitespace-nowrap`}>Tutorial</button>
        </div>
      </div>
      <div className="flex flex-row w-full justify-center items-center gap-1 sm:gap-2 mt-1">
        <button onClick={() => setShowWhitepaper(true)} className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-2 sm:px-3 py-1 rounded-full shadow border-2 border-blue-500 transition-all whitespace-nowrap">Whitepaper</button>
        <button onClick={() => setShowHelp(true)} className="text-xs font-bold text-white bg-yellow-600 hover:bg-yellow-700 px-2 sm:px-3 py-1 rounded-full shadow border-2 border-yellow-500 transition-all whitespace-nowrap">Help</button>
      </div>
      
      {/* Game Mode Controller */}
      <div className="flex flex-row w-full justify-center items-center gap-2 mt-1">
        <div className="flex items-center bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full p-1 shadow-inner border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => handleGameModeChange('light')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
              (gameMode ?? (settings.theme === 'night' ? 'night' : 'light')) === 'light'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg scale-105 animate-pulse'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Sun className={`w-3 h-3 ${(gameMode ?? (settings.theme === 'night' ? 'night' : 'light')) === 'light' ? 'animate-spin' : ''}`} />
            Light
          </button>
          <button
            onClick={() => handleGameModeChange('night')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
              (gameMode ?? (settings.theme === 'night' ? 'night' : 'light')) === 'night'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105 animate-pulse'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Moon className={`w-3 h-3 ${(gameMode ?? (settings.theme === 'night' ? 'night' : 'light')) === 'night' ? 'animate-bounce' : ''}`} />
            Night
          </button>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
          <Gamepad2 className="w-3 h-3" />
          <span>Game Mode</span>
        </div>
      </div>
      <div className="w-full flex justify-center mt-1 sm:mt-2">
        <a
          href="https://support.help.minepi.com/servicedesk/customer/portal/1/article/33038"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 sm:px-6 py-1.5 sm:py-2 rounded-full shadow border border-purple-800 transition-all w-full max-w-xs flex items-center justify-center text-center text-xs sm:text-base"
        >
          Community Wiki
        </a>
        <button
          onClick={() => setShowSubscriptionModal(true)}
          className="mt-1 sm:mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-4 sm:px-6 py-1.5 sm:py-2 rounded-full shadow border border-purple-800 transition-all w-full max-w-xs flex items-center justify-center text-center text-xs sm:text-base"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <img src="/npc gif/subscriptionplanbutton.gif.gif" alt="Subscription Plan" style={{ width: 24, height: 24, marginRight: 4 }} />
          Premium
        </button>
        <SubscriptionPlansModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
      </div>
      <div className="w-full flex justify-center mt-1 sm:mt-2">
        <button
          type="button"
          className="flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-2 sm:p-3 shadow-lg hover:scale-105 transition w-full max-w-xs text-xs sm:text-base"
          onClick={() => setShowChatbotModal(true)}
          aria-label="Open Flappy Pi Chatbot"
        >
          <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 mr-1 sm:mr-2" />
          <span className="font-bold">Flappy Pi Chatbot</span>
        </button>
      </div>
      {/* Flappy Pi All Rights Reserved notice */}
      <div className="w-full flex justify-center mt-2">
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center`}>© {new Date().getFullYear()} Flappy Pi. All rights reserved.</span>
      </div>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <LicenseModal isOpen={showLicense} onClose={() => setShowLicense(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <CommunityGuidelinesModal isOpen={showGuidelines} onClose={() => setShowGuidelines(false)} />
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} onStartGame={() => setShowTutorial(false)} />
      <WhitepaperModal isOpen={showWhitepaper} onClose={() => setShowWhitepaper(false)} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        musicEnabled={musicEnabled} 
        onMusicToggle={setMusicEnabled} 
        soundEnabled={soundEnabled} 
        onSoundToggle={setSoundEnabled} 
        theme={settings.theme as 'light' | 'night'}
        onThemeChange={handleThemeChange}
      />
      <ChatbotLanguageModal isOpen={showChatbotModal} onClose={() => setShowChatbotModal(false)} />
    </footer>
  );
};

export default EnhancedFooter;
