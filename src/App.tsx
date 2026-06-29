import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundary';
import { setupErrorHandlers } from './utils/consoleErrorFixer';
// import './utils/consoleErrorHandler'; // Temporarily disabled to prevent recursive errors
import { ROUTES } from './constants/routes';
import { useRouteUtils } from './hooks/useRouteUtils';
import ProtectedRoute from './components/ProtectedRoute';
import PiAuthGuard from './components/PiAuthGuard';
import PiAuthLogin from './components/PiAuthLogin';
import RouteLoader from './components/RouteLoader';
import LicenseModal from './components/LicenseModal';
import { LanguageProvider } from './context/LanguageContext';
import { PiAuthProvider } from './context/PiAuthContext';
import { GlobalMusicProvider } from './context/GlobalMusicContext';
import { LoadingProvider } from './context/LoadingContext';
import { SoundProvider } from './context/SoundContext';

import { mainnetInitializer } from './config/mainnetInit';
import { piBrowserRedirect } from './utils/piBrowserRedirect';
import PiNetworkBanner from './components/PiNetworkBanner';
import './styles/responsive.css';

import './styles/night-mode-fixes.css';

// Import pages
import SplashScreen from './components/SplashScreen';
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';
import ShopPage from './pages/ShopPage';
import LeaderboardPage from './pages/LeaderboardPage';
import CommunityPage from './pages/CommunityPage';
import SocialChallengePage from './pages/SocialChallengePage';
import FiresideForumPage from './pages/FiresideForumPage';
import BlogPage from './pages/BlogPage';
import FlappyPiBlogPage from './pages/FlappyPiBlogPage';
import DinoPiBlogPage from './pages/DinoPiBlogPage';
import LanguageShowcasePage from './pages/LanguageShowcasePage';
import PartnershipPage from './pages/PartnershipPage';
import StatusPage from './pages/StatusPage';
import GamePage from './pages/GamePage';
import { EndlessGamePage } from './pages/ClassicGamePage';
import ChallengeGamePage from './pages/ChallengeModePage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import PiSDKTestPage from './pages/PiSDKTestPage';
import InventoryPage from './pages/InventoryPage';
import PiUsernameTest from './components/PiUsernameTest';
import GameHistoryPage from './pages/GameHistoryPage';
import SignInPage from './pages/SignInPage';
import NotInPiBrowser from './pages/not-in-pi-browser';
import DownloadPage from './pages/DownloadPage';
import VideoPage from './pages/VideoPage';
import ReservePage from './pages/ReservePage';
import SponsorPage from './pages/SponsorPage';
import MerchPage from './pages/MerchPage';
import PiDemoPage from './pages/PiDemoPage';
import FlappyPiWebsite from './pages/FlappyPiWebsite';
import FlappyPiToonsPage from './pages/FlappyPiToonsPage';
import FlappyPiDeFiPage from './pages/FlappyPiDeFiPage';
import { PaymentTestPage } from './pages/PaymentTestPage';
import MultiplayerPvPPage from './pages/MultiplayerPvPPage';
import FullFlappyWikiPage from './pages/FullFlappyWikiPage';
import FlappyWikiPage from './pages/FlappyWikiPage';
import PiLoginPage from './pages/PiLoginPage';
import PiBrowserLoginPage from './pages/PiBrowserLoginPage';
import LoginPage from './pages/PiLoginPage';
import PiTestPage from './pages/PiTestPage';
import PiAuthTestPage from './pages/PiAuthTestPage';
// import SandboxTestPage from './pages/SandboxTestPage'; // Removed - sandbox test page deleted for mainnet-only
import DemoHeaderPage from './pages/DemoHeaderPage';
import ClassicGamePage from './pages/ClassicGamePage';
// import ScreamPiPage from './pages/ScreamPiPage'; // Removed - Scream Pi feature disabled
import FlappyStackPage from './pages/FlappyStackPage';
import DinoPiPage from './pages/DinoPiPage';
import DinoPiGamePage from './pages/DinoPiGamePage';
import { EnhancedDuelsPage } from './pages/EnhancedDuelsPage';
import MrwainOrganizationPage from './pages/MrwainOrganizationPage';
import NotFound from './pages/NotFound';
import BrowserDetection from './pages/BrowserDetection';
import PerformanceMonitorPage from './pages/PerformanceMonitorPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

// Import challenge mode pages
import PrecisionModePage from './pages/challenge/PrecisionModePage';
import TimeBombModePage from './pages/challenge/TimeBombModePage';
import GravityFlipModePage from './pages/challenge/GravityFlipModePage';
import WindStormModePage from './pages/challenge/WindStormModePage';
import NightFlightModePage from './pages/challenge/NightFlightModePage';
import SpeedRushModePage from './pages/challenge/SpeedRushModePage';
import ReverseModePage from './pages/challenge/ReverseModePage';
import IceSlideModePage from './pages/challenge/IceSlideModePage';
import LavaEscapeModePage from './pages/challenge/LavaEscapeModePage';
import ShieldRunModePage from './pages/challenge/ShieldRunModePage';
import MysteryModePage from './pages/challenge/MysteryModePage';
// import ScreamPiChallengePage from './pages/challenge/ScreamPiChallengePage'; // Removed - Scream Pi feature disabled
import ChallengeIndexPage from './pages/challenge/ChallengeIndexPage';
import UnlockTestPage from './pages/UnlockTestPage';

// Import PvP Duel pages
import PvPDuelsPage from './pages/PvPDuelsPage';
import PvPDuelPlayPage from './pages/PvPDuelPlayPage';

// Import missing pages for routes
import ProfilePage from './pages/ProfilePage';
import AccountPage from './pages/AccountPage';
import WalletPage from './pages/WalletPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionPlansPage from './pages/SubscriptionPlansPage1';
import InviteFriendsPage from './pages/InviteFriendsPage';
import AdminPage from './pages/AdminPage';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import AboutPage from './pages/AboutPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';
import PressPage from './pages/PressPage';
import ReviewsPage from './pages/ReviewsPage';
import Whitepaper from './pages/Whitepaper';
import DailyRewardsPage from './pages/DailyRewardsPage';

// Import components
import BackgroundDecoration from './components/home/BackgroundDecoration';
import { ScrollArea } from './components/ui/scroll-area';
import PageLoader from './components/PageLoader';
import PiBrowserOnly from './components/PiBrowserOnly';
import PiBrowserNotice from './components/PiBrowserNotice';
import MenuDrawer from './components/ui/MenuDrawer';
import ShopModal from './components/ShopModal';
import InventoryModal from './components/InventoryModal';
import GameModeModal from './components/GameModeModal';
import HelpModal from './components/HelpModal';
import ContactModal from './components/ContactModal';
import PrivacyModal from './components/PrivacyModal';
import TermsModal from './components/TermsModal';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import WhitepaperModal from './components/WhitepaperModal';


import CookieConsent from './components/CookieConsent';
import DataRecoveryService from './components/DataRecoveryService';
import UnclaimedRewardsModal from './components/UnclaimedRewardsModal';
import SubscriptionPlansModal from './components/SubscriptionPlansModal';
import WalletInitializer from './components/WalletInitializer';


// Import hooks and context
import { useAuth } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { GameStateProvider } from './hooks/useGameState';
// import { PerformanceProvider } from './context/PerformanceContext'; // Disabled to prevent performance issues

import { useGlobalMusic } from './hooks/useGlobalMusic';

import { useSoundEffects } from './hooks/useSoundEffects';
import { setSoundEffectsInstance, addButtonClickSoundsToAllButtons } from './utils/buttonClickSound';
import { useUnclaimedRewards } from './hooks/useUnclaimedRewards';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';

import MusicTransitionIndicator from './components/MusicTransitionIndicator';
import { getUserAvatar } from './utils/getUserAvatar';
import { autoSyncPiData } from './utils/piNetworkUtils';

import PiSDKTest from './components/PiSDKTest';
import PiConsentInfo from './components/PiConsentInfo';
import PiSDKInitializer from './components/PiSDKInitializer';
import PiSignInButton from './components/PiSignInButton';
// import PiAutoSignIn from './components/PiAutoSignIn'; // Removed - manual sign-in only



const queryClient = new QueryClient();

// App Router Component that uses navigation hooks
function AppRouter({ musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled, piUser, isAuthenticated, showSubscriptionPlans, setShowSubscriptionPlans }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showUnclaimedModal, setShowUnclaimedModal, handleClaimRewards } = useUnclaimedRewards();
  const { isProtectedRoute, shouldHideMenu } = useRouteUtils();
  
  // Initialize global music system
  const { isPlaying, currentTrack, error: musicError } = useGlobalMusic(musicEnabled);
  

  
  // Handle user gesture for mobile audio
  useEffect(() => {
    const handleUserGesture = () => {
      if (typeof window !== 'undefined') {
        window.__musicUserGesture = true;

      }
    };
    
    // Listen for user interactions
    document.addEventListener('click', handleUserGesture, { once: true });
    document.addEventListener('touchstart', handleUserGesture, { once: true });
    document.addEventListener('keydown', handleUserGesture, { once: true });
    
    return () => {
      document.removeEventListener('click', handleUserGesture);
      document.removeEventListener('touchstart', handleUserGesture);
      document.removeEventListener('keydown', handleUserGesture);
    };
  }, []);

  return (
    <Routes>
      {/* Public Routes - Now require Pi authentication */}
      <Route path="/" element={
        <PiAuthGuard>
          <SplashScreen onFinish={() => {}} />
        </PiAuthGuard>
      } />
      <Route path="/login" element={
        <PiAuthGuard>
          <LoginPage onPiLogin={() => Promise.resolve(true)} piUser={null} onCountdownComplete={() => {}} />
        </PiAuthGuard>
      } />
      <Route path="/pi-auth" element={<PiAuthLogin />} />
      <Route path="/pi-browser-login" element={<PiAuthLogin />} />
      <Route path="/not-in-pi-browser" element={<NotInPiBrowser />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/download" element={
        <PiAuthGuard>
          <DownloadPage />
        </PiAuthGuard>
      } />
      <Route path="/privacy" element={
        <PiAuthGuard>
          <PrivacyPolicyPage />
        </PiAuthGuard>
      } />
      <Route path="/terms" element={
        <PiAuthGuard>
          <TermsOfServicePage />
        </PiAuthGuard>
      } />
      <Route path="/about" element={
        <PiAuthGuard>
          <AboutPage />
        </PiAuthGuard>
      } />
      <Route path="/contact" element={
        <PiAuthGuard>
          <ContactPage />
        </PiAuthGuard>
      } />
      <Route path="/faq" element={
        <PiAuthGuard>
          <FAQPage />
        </PiAuthGuard>
      } />
      <Route path="/browser-detection" element={
        <PiAuthGuard>
          <BrowserDetection />
        </PiAuthGuard>
      } />
      <Route path="/shop" element={
        <PiAuthGuard>
          <ShopPage />
        </PiAuthGuard>
      } />
      <Route path="/pi-demo" element={
        <PiAuthGuard>
          <PiDemoPage />
        </PiAuthGuard>
      } />
      
      {/* Public Flappy Pi Website - No authentication required */}
      <Route path="/flappy-pi-website" element={<FlappyPiWebsite />} />
      <Route path="/flappypiofficial" element={<FlappyPiWebsite />} />

      
      {/* Protected Routes - All pages now require Pi authentication */}
      <Route path="*" element={
        <PiAuthGuard>
          <Routes>
            {/* Home Route */}
            <Route path="/home" element={
              <HomePage piUser={piUser} adNetworkSupported={true} musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} />
            } />
            
            {/* Game Routes */}
            <Route path="/game" element={<GamePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/game/endless" element={<EndlessGamePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/endless" element={<EndlessGamePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/flappy-stack" element={<FlappyStackPage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/game/flappy-stack" element={<FlappyStackPage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            
            {/* Feature Routes */}
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/wallet" element={<WalletPage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/profile" element={<ProfilePage profile={piUser} />} />
            <Route path="/play" element={<GamePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/achievements" element={<AchievementsPage profile={piUser} />} />
            <Route path="/settings" element={<SettingsPage profile={piUser} onSave={() => {}} />} />

            <Route path="/wiki" element={<FlappyWikiPage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/whitepaper" element={<Whitepaper musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/social-challenge" element={<SocialChallengePage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/daily-rewards" element={<DailyRewardsPage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/subscription-plans" element={<SubscriptionPlansPage />} />
            {/* Dino Pi routes - unlocked and accessible */}
            <Route path="/dino-pi" element={<DinoPiPage />} />
            <Route path="/dino-pi-game" element={<DinoPiGamePage />} />
            <Route path="/dino-pi/classic" element={<DinoPiGamePage />} />
            <Route path="/dino-pi/endless" element={<DinoPiGamePage />} />
            <Route path="/dino-pi/challenge" element={<DinoPiGamePage />} />
            <Route path="/enhanced-duels" element={<EnhancedDuelsPage />} />
            {/* <Route path="/scream-pi" element={<ScreamPiPage />} /> Removed - Scream Pi feature disabled */}
            <Route path="/mrwain-organization" element={<MrwainOrganizationPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/game-history" element={<GameHistoryPage />} />
            <Route path="/payment-history" element={<PaymentHistoryPage />} />
            <Route path="/purchase-history" element={<PurchaseHistoryPage />} />
            <Route path="/invite-friends" element={<InviteFriendsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/flappy-pi-blog" element={<FlappyPiBlogPage />} />
            <Route path="/dino-pi-blog" element={<DinoPiBlogPage />} />
            <Route path="/languages" element={<LanguageShowcasePage />} />
            <Route path="/partnership" element={<PartnershipPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/press" element={<PressPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/video" element={<VideoPage />} />
            <Route path="/reserve" element={<ReservePage />} />
            <Route path="/merch" element={<MerchPage />} />
              <Route path="/flappy-pi-toons" element={<FlappyPiToonsPage />} />
              <Route path="/toons" element={<FlappyPiToonsPage />} />
              <Route path="/flappy-pi-defi" element={<FlappyPiDeFiPage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
              <Route path="/defi" element={<FlappyPiDeFiPage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
              <Route path="/payment-test" element={<PaymentTestPage />} />
            <Route path="/multiplayer" element={<MultiplayerPvPPage />} />
            <Route path="/pvp" element={<MultiplayerPvPPage />} />
            <Route path="/full-flappy-wiki" element={<FullFlappyWikiPage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/fireside-forum" element={<FiresideForumPage />} />
            <Route path="/pi-login" element={<PiLoginPage onPiLogin={() => Promise.resolve(true)} piUser={piUser} onCountdownComplete={() => {}} />} />
            <Route path="/pi-test" element={<PiTestPage />} />
            <Route path="/pi-auth-test" element={<PiAuthTestPage />} />
            <Route path="/pi-sdk-test" element={<PiSDKTest />} />
            <Route path="/pi-consent-info" element={<PiConsentInfo />} />
            {/* <Route path="/sandbox-test" element={<SandboxTestPage />} /> */} {/* Removed - sandbox test route deleted for mainnet-only */}
            <Route path="/pi-username-test" element={<PiUsernameTest />} />
            
            {/* Challenge Routes */}
            <Route path="/challenge" element={<ChallengeIndexPage />} />
            <Route path="/challenge/precision" element={<PrecisionModePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/challenge/timebomb" element={<TimeBombModePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/challenge/gravity-flip" element={<GravityFlipModePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/challenge/wind-storm" element={<WindStormModePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/challenge/night-flight" element={<NightFlightModePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/challenge/speed-rush" element={<SpeedRushModePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/challenge/reverse" element={<ReverseModePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/challenge/ice-slide" element={<IceSlideModePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/challenge/lava-escape" element={<LavaEscapeModePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/challenge/shield-run" element={<ShieldRunModePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            <Route path="/challenge/mystery" element={<MysteryModePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} />
            {/* <Route path="/challenge/scream-pi" element={<ScreamPiChallengePage musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />} /> Removed - Scream Pi feature disabled */}
            
            {/* Performance Monitor */}
            <Route path="/performance-monitor" element={<PerformanceMonitorPage />} />
            
            {/* Subscription Routes */}
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/subscription/plans" element={<SubscriptionPlansPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            
            {/* Catch-all route - Redirect to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </PiAuthGuard>
      } />
    </Routes>
  );
}

function App() {

  const [musicEnabled, setMusicEnabled] = useState(() => {
    const saved = localStorage.getItem('musicEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Initialize mainnet configuration and error handlers
  useEffect(() => {
    const initializeServices = async () => {
      try {
        console.log('🚀 Initializing Flappy Pi services...');
        
        // Setup error handlers
        setupErrorHandlers();
        
        
        // Initialize enhanced Pi utilities
        autoSyncPiData();
        
        // Initialize mainnet
        const mainnetInitialized = await mainnetInitializer.initialize();
        if (mainnetInitialized) {
          console.log('✅ Flappy Pi mainnet initialization completed');
        } else {
          console.warn('⚠️ Flappy Pi mainnet initialization failed, but app will continue');
        }

        // Return cleanup function
        return () => {
          // Cleanup function for fullscreen shortcuts
          console.log('🧹 Cleaning up fullscreen shortcuts');
        };
      } catch (error) {
        console.error('❌ Flappy Pi services initialization error:', error);
      }
    };

    let cleanup: (() => void) | null = null;
    
    initializeServices().then((cleanupFn) => {
      cleanup = cleanupFn;
    });
    
    // Cleanup on unmount
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);
  
  // Save music settings to localStorage
  const handleMusicToggle = (enabled: boolean) => {
    setMusicEnabled(enabled);
    localStorage.setItem('musicEnabled', JSON.stringify(enabled));
  };
  
  // Save sound settings to localStorage
  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('soundEnabled', JSON.stringify(enabled));
  };
  const handleOpenTutorial = () => {
    alert('Tutorial coming soon!');
  };
  
  // Use route utilities
  const { isGameRoute, shouldHideMenu, isPublicRoute } = useRouteUtils();
  
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(false);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showGameModeModal, setShowGameModeModal] = useState(false);
  
  // Add modal states for menu
  const [showWikiModal, setShowWikiModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWhitepaperModal, setShowWhitepaperModal] = useState(false);
  const [showPiSDKTestPanel, setShowPiSDKTestPanel] = useState(false);

  // Add missing modal states
  const [showContact, setShowContact] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showLicense, setShowLicense] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showWhitepaper, setShowWhitepaper] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUnclaimedModal, setShowUnclaimedModal] = useState(false);
  const handleClaimRewards = () => {};

  // Use the new auth context
  const { isAuthenticated, username, isPiAuth, piUser } = useAuth();
  const { settings, updateSettings } = useSettings();

  // Initialize theme system
  const { isDark } = useTheme();

  // Initialize sound effects and button click sounds
  const soundEffects = useSoundEffects(soundEnabled);
  
  // Set up global button click sounds
  useEffect(() => {
    setSoundEffectsInstance(soundEffects);
    
    // Add click sounds to all buttons after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      addButtonClickSoundsToAllButtons(0.4);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [soundEffects, soundEnabled]);

  // Listen for custom events from game modes to trigger global modals
  useEffect(() => {
    const handleOpenInventoryModal = () => {
      setShowInventoryModal(true);
    };

    const handleOpenShopModal = () => {
      setShowShopModal(true);
    };

    window.addEventListener('open-inventory-modal', handleOpenInventoryModal);
    window.addEventListener('open-shop-modal', handleOpenShopModal);

    return () => {
      window.removeEventListener('open-inventory-modal', handleOpenInventoryModal);
      window.removeEventListener('open-shop-modal', handleOpenShopModal);
    };
  }, []);

     // Show PageLoader on every route change
   useEffect(() => {
     setLoading(true);
     const timer = setTimeout(() => setLoading(false), 700);
     return () => clearTimeout(timer);
   }, []);

  // Hide menu based on route utilities
  const hideMenu = shouldHideMenu();





  // Get the current user display name based on authentication method
  const getCurrentUserDisplay = () => {
    if (isPiAuth && piUser) {
      return {
        username: piUser.username,
        isPiAuth: true,
        avatar: getUserAvatar(piUser)
      };
    } else if (username) {
      return {
        username: username,
        isPiAuth: false,
        avatar: 'flappy-logo.png'
      };
    }
    return null;
  };

  const currentUser = getCurrentUserDisplay();
  

  




     // Show privacy and terms pages without requiring login/account
   const isStandalonePublicPage = false; // Temporarily disabled

     // Check if we're on a page that has its own splash screen
   const hasOwnSplash = false; // Temporarily disabled

  // Pi Browser specific optimization - bypass splash if taking too long
  const [splashTimeout, setSplashTimeout] = useState<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // If in Pi Browser, set a timeout to force bypass splash screen
    if (typeof window !== 'undefined' && window.Pi && showSplash && !hasOwnSplash) {
      const timeout = setTimeout(() => {
        console.warn('[App] Force bypassing splash screen in Pi Browser due to timeout');
        setShowSplash(false);
      }, 5000); // Reduced to 5 seconds for faster loading
      
      setSplashTimeout(timeout);
      
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [showSplash, hasOwnSplash]);

  // Clear timeout when splash finishes normally
  useEffect(() => {
    if (!showSplash && splashTimeout) {
      clearTimeout(splashTimeout);
      setSplashTimeout(null);
    }
  }, [showSplash, splashTimeout]);

  let appContent;

  if (showSplash && !hasOwnSplash) {
    appContent = <SplashScreen onFinish={() => setShowSplash(false)} />;
  } else {
    // Show main app - ALL PAGES ARE NOW PROTECTED BY AUTHENTICATION
    appContent = (
      <>
        <WalletInitializer />
        
                 <div className={`min-h-screen w-screen overflow-x-hidden overflow-y-auto ${
           isDark 
             ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
             : 'bg-gradient-to-b from-sky-200 to-blue-100'
         }`}>
           <BackgroundDecoration />
           <div className="relative z-10 h-full w-full">
             {loading && <PageLoader />}
             <AppRouter
               musicEnabled={musicEnabled}
               setMusicEnabled={handleMusicToggle}
               soundEnabled={soundEnabled}
               setSoundEnabled={handleSoundToggle}
               piUser={currentUser}
               isAuthenticated={!!currentUser}
               showSubscriptionPlans={showSubscriptionPlans}
               setShowSubscriptionPlans={setShowSubscriptionPlans}
             />
           </div>
           
           

         </div>

                                                                       {/* Global Modals - Show only when user is authenticated */}
           {isAuthenticated && (
            <>
              <ShopModal
                open={showShopModal}
                onClose={() => setShowShopModal(false)}
                musicEnabled={musicEnabled}
              />
              
              <InventoryModal
                open={showInventoryModal}
                onClose={() => setShowInventoryModal(false)}
              />
              
              <GameModeModal
                open={showGameModeModal}
                onClose={() => setShowGameModeModal(false)}
                onSelectMode={() => {}}
              />

              {/* Menu Modals */}
              <HelpModal 
                isOpen={showHelpModal} 
                onClose={() => setShowHelpModal(false)} 
              />
              
              <ContactModal 
                isOpen={showContact} 
                onClose={() => setShowContact(false)} 
              />
              
              <PrivacyModal 
                isOpen={showPrivacy} 
                onClose={() => setShowPrivacy(false)} 
              />
              
              <TermsModal 
                isOpen={showTerms} 
                onClose={() => setShowTerms(false)} 
              />
              
              <LicenseModal 
                isOpen={showLicense} 
                onClose={() => setShowLicense(false)} 
              />
              
              <SettingsModal 
                isOpen={showSettings} 
                onClose={() => setShowSettings(false)} 
                musicEnabled={musicEnabled}
                onMusicToggle={handleMusicToggle}
                soundEnabled={soundEnabled}
                onSoundToggle={handleSoundToggle}
                theme={settings.theme as 'light' | 'night'}
                onThemeChange={(newTheme) => updateSettings({ theme: newTheme })}
              />
              
              <SubscriptionPlansModal
                isOpen={showSubscriptionPlans}
                onClose={() => setShowSubscriptionPlans(false)}
              />

              <UnclaimedRewardsModal 
                open={showUnclaimedModal} 
                onClose={() => setShowUnclaimedModal(false)} 
                onClaim={handleClaimRewards} 
              />
              
              <AboutModal 
                isOpen={showAbout} 
                onClose={() => setShowAbout(false)} 
              />
              
              <WhitepaperModal 
                isOpen={showWhitepaper} 
                onClose={() => setShowWhitepaper(false)} 
              />
            </>
          )}
      </>
    );
  }

  // For public standalone pages, render without PiBrowserOnly wrapper
  if (isStandalonePublicPage) {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <WalletProvider>
            <LanguageProvider>
              <PiAuthProvider>
                <GlobalMusicProvider>
                  <SoundProvider>
                    <LoadingProvider>
                    <GameStateProvider profile={null}>
                <div className={`min-h-screen w-full flex flex-col items-center justify-center ${
                  isDark 
                    ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
                    : 'bg-gradient-to-b from-sky-200 to-blue-100'
                }`}>
                  <BackgroundDecoration />
                  <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
                    <SplashScreen onFinish={() => {}} />
                  </div>
                  <Toaster />
                  <CookieConsent />
                  <UnclaimedRewardsModal open={false} onClose={() => {}} onClaim={null} />
                </div>
                    </GameStateProvider>
                    </LoadingProvider>
                  </SoundProvider>
                </GlobalMusicProvider>
              </PiAuthProvider>
            </LanguageProvider>
          </WalletProvider>
        </QueryClientProvider>
    </ErrorBoundary>
    );
  }

     return (
     <ErrorBoundary>
       <QueryClientProvider client={queryClient}>
         <PiSDKInitializer>
         <WalletProvider>
           <LanguageProvider>
             <PiAuthProvider>
               <GlobalMusicProvider>
                 <SoundProvider>
                   <LoadingProvider>
                   <GameStateProvider profile={null}>
               {/* <PerformanceProvider> Disabled to prevent performance issues */}
               <PiBrowserNotice>
                 <div className={`min-h-screen w-full flex flex-col items-center justify-center ${
                   isDark 
                     ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
                     : 'bg-gradient-to-b from-sky-200 to-blue-100'
                 }`}>
                   {/* Pi Network Banner is handled in HeaderWithPiAuth */}
                   <BackgroundDecoration />
                                        <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
                       {appContent}
                       
                       
                     </div>
                   <Toaster />
                   <DataRecoveryService />
                   <CookieConsent />
                   <UnclaimedRewardsModal open={false} onClose={() => {}} onClaim={null} />
                   
                   
                                       <MusicTransitionIndicator show={true} />
                    {/* Pi Auto Sign-In Component - Completely removed for manual sign-in only */}
                   
                 </div>
               </PiBrowserNotice>
               {/* </PerformanceProvider> */}
                   </GameStateProvider>
                   </LoadingProvider>
                 </SoundProvider>
               </GlobalMusicProvider>
           </PiAuthProvider>
         </LanguageProvider>
         </WalletProvider>
         </PiSDKInitializer>
       
       {/* Vercel Analytics */}
       <Analytics />
       <SpeedInsights />
     </QueryClientProvider>
   </ErrorBoundary>
   );
}

// Export the main App component directly
export default App;
