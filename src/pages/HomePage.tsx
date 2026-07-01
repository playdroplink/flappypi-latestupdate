import React, { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useButtonSound } from '../hooks/useButtonSound';
import NavigationDrawer from '../components/NavigationDrawer';
import HeaderWithPiAuth from '../components/HeaderWithPiAuth';
import QuickActions from '../components/home/QuickActions';
import ContactModal from '../components/ContactModal';
import HelpModal from '../components/HelpModal';
import PrivacyModal from '../components/PrivacyModal';
import TermsModal from '../components/TermsModal';
import SubscriptionPromoModal from '@/components/SubscriptionPromoModal';
import { usePiBrowserDetection } from '../hooks/usePiBrowserDetection';
import GameModeButtons from '../components/welcome/GameModeButtons';
import SettingsModal from '../components/SettingsModal';
import EnhancedFooter from '../components/EnhancedFooter';
import AboutModal from '../components/AboutModal';
import { Button } from '@/components/ui/button';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import { User, Shirt, Settings, FlaskConical, BookOpen, ChevronDown, Bell } from 'lucide-react';
// ...existing code...
import TutorialModal from '../components/game/TutorialModal';
import ComingSoonModal from '../components/ComingSoonModal';
import NextSeasonModal from '../components/NextSeasonModal';
import { DuelsPage } from './DuelsPage';
import { TestDuelsPage } from './TestDuelsPage';
import { StandaloneDuelsPage } from './StandaloneDuelsPage';
import WhitepaperModal from '../components/WhitepaperModal';
import { getSaleState } from '@/utils/saleUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PaymentDebugger from '../components/PaymentDebugger';
import ProfileImageModal from '../components/ProfileImageModal';
import { inventoryService } from '@/services/inventoryService';
import PiPaymentShop from '../components/PiPaymentShop';
import ReserveConnectPanel from '../components/ReserveConnectPanel';
import StreamPanel from '../components/StreamPanel';
import PiHidePanel from '../components/PiHidePanel';

import { useUserProfile } from '../hooks/useUserProfile';
import { useGameEquipment } from '../hooks/useGameEquipment';

import { useWallet } from '../context/WalletContext';
import WalletBalance from '../components/WalletBalance';
import GameModeModal from '../components/GameModeModal';
import FooterNPC from '../components/FooterNPC';
import { ResponsiveContainer, ResponsiveUIGrid, ResponsiveButtonGrid } from '../components/game/ResponsiveGrid';
import { useSettings } from '../hooks/useSettings';
import { useLanguage } from '../context/LanguageContext';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { getNextNpcInRotation, getRandomNpcGif } from '@/utils/npcRotation';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import { syncPiUserData, checkPiAuthentication, getCurrentPiUser } from '../utils/piNetworkUtils';

import { ROUTES } from '../constants/routes';

interface HomePageProps {
  piUser: any;
  adNetworkSupported: boolean;
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
}

const getAutoTheme = () => {
  const hour = new Date().getHours();
  return (hour >= 19 || hour < 7) ? 'night' : 'light';
};

import { seasonManager, Season, SEASON_CONFIGS } from '../utils/seasonManager';
import { useSeasonManager } from '../hooks/useSeasonManager';

const HomePage: React.FC<HomePageProps> = ({ piUser, adNetworkSupported, musicEnabled, setMusicEnabled }) => {
  const gameState = useGameState();
  const { playSwoosh, soundEnabled, setSoundEnabled } = useSoundEffects();
  const { isPlaying, currentTrack, playMusic, stopMusic } = useGlobalMusic(musicEnabled);
  const { playClickSound, playSuccessSound, playErrorSound } = useButtonSound();
  const navigate = useNavigate();
  const location = useLocation();
  const { isPiBrowser } = usePiBrowserDetection();
  const { profile } = useUserProfile();
  const { equippedSkin } = useGameEquipment();
  const equippedSkinImg = getBirdImageSrc(equippedSkin);
  const { balance, addCoins } = useWallet();
  const { settings, updateSettings } = useSettings();
  const { t, refreshTrigger } = useLanguage();
  const { isAuthenticated, username, isPiAuth, piUser: authPiUser } = useAuth();
  const { getFooterBg, getFooterBorder } = useTheme();
  const { smartNavigate, navigateToProtected, navigateToPublic } = useSmartNavigation();
  
  // Notification state (moved from top-level)
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcementRead, setAnnouncementRead] = useState(() => localStorage.getItem('flappypi-announcement-read') === 'true');
  const [showPaymentShop, setShowPaymentShop] = useState(false);
  const [showReserveConnect, setShowReserveConnect] = useState(false);
  const [showStreamPanel, setShowStreamPanel] = useState(false);
  const [showPiHidePanel, setShowPiHidePanel] = useState(false);

  // Example announcement (replace with dynamic fetch if needed)
  const importantAnnouncement = {
    title: '🚨 Important Update: New Features!',
    message: 'Flappy Pi just launched a major update! Check out the new subscription plans, seasonal weather, and DeFi features. Stay tuned for more events this month! 🎉',
    date: 'December 2, 2025'
  };

  // Modal queue system to prevent spam
  const [modalQueue, setModalQueue] = useState<Array<() => void>>([]);
  const [isShowingModal, setIsShowingModal] = useState(false);
  const [lastModalShownTime, setLastModalShownTime] = useState(0);
  const MODAL_INTERVAL = 10000; // 10 seconds between modals

  const handleOpenAnnouncement = () => {
    setShowAnnouncement(true);
    setAnnouncementRead(true);
    localStorage.setItem('flappypi-announcement-read', 'true');
  };
  const handleCloseAnnouncement = () => setShowAnnouncement(false);

  // Function to add modal to queue
  const queueModal = (modalFunction: () => void) => {
    setModalQueue(prev => [...prev, modalFunction]);
  };

  // Process modal queue with intervals
  useEffect(() => {
    if (modalQueue.length === 0 || isShowingModal) return;

    const now = Date.now();
    const timeSinceLastModal = now - lastModalShownTime;

    if (timeSinceLastModal >= MODAL_INTERVAL || lastModalShownTime === 0) {
      const nextModal = modalQueue[0];
      setIsShowingModal(true);
      setLastModalShownTime(now);
      
      // Execute the modal function
      nextModal();
      
      // Remove from queue
      setModalQueue(prev => prev.slice(1));
      
      // Reset showing state after a short delay
      setTimeout(() => {
        setIsShowingModal(false);
      }, 1000);
    } else {
      // Wait for the remaining interval time
      const timeToWait = MODAL_INTERVAL - timeSinceLastModal;
      const timer = setTimeout(() => {
        const nextModal = modalQueue[0];
        setIsShowingModal(true);
        setLastModalShownTime(Date.now());
        
        nextModal();
        setModalQueue(prev => prev.slice(1));
        
        setTimeout(() => {
          setIsShowingModal(false);
        }, 1000);
      }, timeToWait);

      return () => clearTimeout(timer);
    }
  }, [modalQueue, isShowingModal, lastModalShownTime]);

  // Add state to force re-renders when auth changes
  const [authUpdateTrigger, setAuthUpdateTrigger] = useState(0);

  // Seasonal weather state using custom hook
  const { currentSeason, seasonProgress, timeUntilNext } = useSeasonManager();
  const [seasonalWeather, setSeasonalWeather] = useState(seasonManager.getSeasonConfig());

  // Monitor language changes
  useEffect(() => {
    // Language change handled silently
  }, [refreshTrigger]);

  // Update seasonal weather when season changes
  useEffect(() => {
    // Use the currentSeason from useSeasonManager, which respects user's selected season
    const config = SEASON_CONFIGS[currentSeason];
    if (config) {
      setSeasonalWeather(config);
      console.log(`🌍 HomePage updated to season: ${currentSeason}`);
    }
  }, [currentSeason]);

  // Scroll indicator state
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  
  const handleDuelsClick = () => {
    playClickSound();
    setShowDuelsPage(true);
  };

  const handleEnhancedDuelsClick = () => {
    playClickSound();
    navigate('/enhanced-duels');
  };

  const handleTestDuelsClick = () => {
    playClickSound();
    setShowTestDuelsPage(true);
  };

  const handleStandaloneDuelsClick = () => {
    playClickSound();
    setShowStandaloneDuelsPage(true);
  };

  const pages = [
    { label: t('play'), path: '/play', color: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold border-2 border-green-400 shadow-lg' },
    { label: t('shop'), path: '/shop', color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold border-2 border-pink-400 shadow-lg' },
    { label: t('leaderboard'), path: '/leaderboard', color: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold border-2 border-orange-400 shadow-lg' },
    { label: t('inventory'), path: '/inventory', color: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold border-2 border-cyan-400 shadow-lg' },
    { label: t('profile'), path: '/profile', color: 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold border-2 border-purple-400 shadow-lg' },
    { label: '⚔️ Duels', onClick: handleDuelsClick, color: 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold border-2 border-red-400 shadow-lg' },
    { label: t('wallet'), path: '/wallet', color: 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-blue-900 font-black border-2 border-yellow-500 shadow-lg' },
    { label: t('socialChallenge'), path: '/social-challenge', color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold border-2 border-pink-400 shadow-lg' },
    { label: t('dailyRewards'), path: '/daily-rewards', color: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold border-2 border-orange-400 shadow-lg' },
    { label: '⚡ Mrwain Organization', path: '/mrwain-organization', color: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold border-2 border-purple-400 shadow-lg' },
    { label: '⚔️ Multiplayer PvP', path: '/multiplayer', color: 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold border-2 border-red-400 shadow-lg' },
    // Debug pages removed for production
    // { label: '⚔️ PvP Duels', path: '/pvp-duels', color: 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold border-2 border-red-400 shadow-lg' }, // Temporarily disabled
  ];
  const theme = settings.theme === 'night' ? 'night' : 'light';
  const handleThemeChange = (newTheme: 'light' | 'night') => {
    updateSettings({ theme: newTheme });
  };

  // Modal states
  const [showContact, setShowContact] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSubscriptionPromo, setShowSubscriptionPromo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDuelsComingSoon, setShowDuelsComingSoon] = useState(false);
  const [showDuelsPage, setShowDuelsPage] = useState(false);
  const [showTestDuelsPage, setShowTestDuelsPage] = useState(false);
  const [showStandaloneDuelsPage, setShowStandaloneDuelsPage] = useState(false);
  const [showGameModeModal, setShowGameModeModal] = useState(false);
  const [showWhitepaper, setShowWhitepaper] = useState(false);
  const [showCoinTransition, setShowCoinTransition] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  // Sale notification modal state
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [lastSalePeriod, setLastSalePeriod] = useState<number | null>(null);

  // FLPY Token notification state
  const [showFLPYModal, setShowFLPYModal] = useState(false);
  const [flpyNotificationDismissed, setFlpyNotificationDismissed] = useState(false);

  // Daily login reward state
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [dailyRewardAmount, setDailyRewardAmount] = useState(0);
  const [lastClaim, setLastClaim] = useState<number | null>(null);
  const [streak, setStreak] = useState(1);


  // Add state for dev redeem modal
  const [showDevRedeem, setShowDevRedeem] = useState(false);
  const [devRedeemSuccess, setDevRedeemSuccess] = useState(false);
  // Add state for password input and error
  const [devRedeemPassword, setDevRedeemPassword] = useState('');
  const [devRedeemError, setDevRedeemError] = useState('');
  
  // Add state for social challenge modal
  const [showDuelsModal, setShowDuelsModal] = useState(false);
  
  // Add state for next season modal
  const [showNextSeasonModal, setShowNextSeasonModal] = useState(false);
  const [nextSeasonFeature, setNextSeasonFeature] = useState<'dino-pi' | 'pvp-duels'>('dino-pi');
  
  // Add state for test payment modal
  const [showTestPayment, setShowTestPayment] = useState(false);

  // Add state for Home NPC dialog
  const [homeNpcDialogIndex, setHomeNpcDialogIndex] = useState(0);
  const [homeNpcGif, setHomeNpcGif] = useState<string>('');
  
  // NPC rotation is now handled by the utility

  const homeNpcDialogs = [
    t('homeNPC1'),
    t('homeNPC2'),
    t('homeNPC3'),
    t('homeNPC4'),
    t('homeNPC5'),
    t('homeNPC6'),
    t('homeNPC7'),
    t('homeNPC8'),
    t('homeNPC9'),
    t('homeNPC10'),
    t('homeNPC11'),
    t('homeNPC12'),
    t('homeNPC13'),
    t('homeNPC14'),
    t('homeNPC15'),
    t('homeNPC16'),
    t('homeNPC17'),
    t('homeNPC18'),
    t('homeNPC19'),
    t('homeNPC20'),
    t('homeNPC21'),
    t('homeNPC22'),
    t('homeNPC23'),
    t('homeNPC24'),
    t('homeNPC25'),
    t('homeNPC26'),
    t('homeNPC27'),
    t('homeNPC28'),
    t('homeNPC29'),
    t('homeNPC30')
  ];

  // Scream Pi is always unlocked - no social challenge requirement
  useEffect(() => {
    // Set all unlock keys to ensure Scream Pi is always unlocked
    const keys = [
      'socialChallengeBadge',
      'socialChallengeCompleted', 
      'socialTaskCompleted',
      'socialChallengeTask',
      'screamPiUnlocked',
      'completedSocialChallenge',
      'socialChallengeBadgeReceived',
      'socialChallengeTaskCompleted',
      'socialChallengeUnlocked',
      'screamPiAccessGranted',
      'voiceGameUnlocked',
      'socialChallengePassed',
      'socialChallengeVerified',
      'socialChallengeApproved',
      'socialChallengeValidated'
    ];
    
    // Ensure all keys are set to true for Scream Pi
    keys.forEach(key => localStorage.setItem(key, 'true'));
    
    // Add the badge to the badges array
    const existingBadges = JSON.parse(localStorage.getItem('flappypi-badges') || '[]');
    if (!existingBadges.includes('social-challenge-badge')) {
      existingBadges.push('social-challenge-badge');
      localStorage.setItem('flappypi-badges', JSON.stringify(existingBadges));
    }
    
    // Set the special key
    localStorage.setItem('SOCIAL_CHALLENGE_KEY', '1');
    
  }, []);

  // Listen for authentication state changes
  useEffect(() => {
    const handleAuthStateChange = (event: CustomEvent) => {
      // Force a re-render by updating the component state
      setAuthUpdateTrigger(prev => prev + 1);
    };

    const handlePiAuthSuccess = (event: CustomEvent) => {
      // Force a re-render by updating the component state
      setAuthUpdateTrigger(prev => prev + 1);
    };

    const handlePiAuthLogout = (event: CustomEvent) => {
      // Force a re-render by updating the component state
      setAuthUpdateTrigger(prev => prev + 1);
    };

    // Listen for custom events
    window.addEventListener('auth-state-changed', handleAuthStateChange as EventListener);
    window.addEventListener('pi-auth-success', handlePiAuthSuccess as EventListener);
    window.addEventListener('pi-auth-logout', handlePiAuthLogout as EventListener);

    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange as EventListener);
      window.removeEventListener('pi-auth-success', handlePiAuthSuccess as EventListener);
      window.removeEventListener('pi-auth-logout', handlePiAuthLogout as EventListener);
    };
  }, []);

  // Get user display information - prefer real Pi auth even outside pinet subdomains
  const getUserDisplay = () => {
    const extractUsername = (user: any) => {
      if (!user) return 'Pi User';
      if (user.username && user.username !== 'Player' && user.username.trim() !== '') return user.username.trim();
      if (user.name && user.name !== 'Player' && user.name.trim() !== '') return user.name.trim();
      if (user.displayName && user.displayName !== 'Player' && user.displayName.trim() !== '') return user.displayName.trim();
      if (user.first_name || user.last_name) {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        if (fullName && fullName !== 'Player') return fullName;
      }
      return 'Pi User';
    };

    // Treat Pi auth as valid on any mainnet host (pinet, minepi, flappypi.fun)
    const isPiMainnetHost = ['pinet.com', 'minepi.com', 'flappypi.fun'].some(domain => window.location.hostname.includes(domain));

    // 1) AuthContext (mainnet only)
    if (authPiUser && isPiAuth && isPiMainnetHost) {
      const username = extractUsername(authPiUser);
      if (username !== 'Pi User') {
        return {
          username,
          avatar: authPiUser.avatar || 'flappy-logo.png',
          isPiAuth: true
        };
      }
    }

    // 2) Synced Pi data + SDK auth (mainnet only)
    const syncedUser = isPiMainnetHost ? syncPiUserData() : null;
    const isPiAuthenticatedFromSDK = isPiMainnetHost ? checkPiAuthentication() : false;
    if (isPiMainnetHost && isPiAuthenticatedFromSDK && syncedUser) {
      const username = extractUsername(syncedUser);
      if (username !== 'Pi User') {
        return {
          username,
          avatar: syncedUser.avatar || 'flappy-logo.png',
          isPiAuth: true
        };
      }
    }

    // 3) LocalStorage (mainnet only)
    const storedPiUser = isPiMainnetHost ? localStorage.getItem('flappypi-pi-user') : null;
    const storedPiAuth = isPiMainnetHost ? localStorage.getItem('flappypi-pi-auth') : null;
    if (isPiMainnetHost && storedPiAuth === 'true' && storedPiUser) {
      try {
        const parsedUser = JSON.parse(storedPiUser);
        const username = extractUsername(parsedUser);
        if (username !== 'Pi User') {
          return {
            username,
            avatar: parsedUser.avatar || 'flappy-logo.png',
            isPiAuth: true
          };
        }
      } catch (error) {
        console.error('❌ Error parsing stored Pi user:', error);
      }
    }

    // 4) Prop piUser (mainnet only)
    if (isPiMainnetHost && piUser) {
      const username = extractUsername(piUser);
      if (username !== 'Pi User') {
        let avatar = 'flappy-logo.png';
        if (profile?.selected_bird_skin) {
          avatar = getBirdImageSrc(profile.selected_bird_skin);
        } else if (piUser.avatar) {
          avatar = piUser.avatar;
        }
        return {
          username,
          avatar,
          isPiAuth: piUser.isPiAuth || false
        };
      }
    }

    // 5) Profile/local fallback (works for non-mainnet too)
    const fallbackUsername = extractUsername(profile);
    let avatar = 'flappy-logo.png';
    if (profile?.avatar_url && profile.avatar_url.trim() !== '') {
      avatar = profile.avatar_url;
    } else if (profile?.selected_bird_skin) {
      avatar = getBirdImageSrc(profile.selected_bird_skin);
    }
    return {
      username: fallbackUsername,
      avatar,
      isPiAuth: false
    };
  };

  const userDisplay = getUserDisplay();

  // Force refresh user display on mount and auth changes
  useEffect(() => {
    // Force a re-render to update user display
    const timer = setTimeout(() => {
      setAuthUpdateTrigger(prev => prev + 1);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [authUpdateTrigger]);

  // Periodic authentication check (disabled for mainnet-only)
  useEffect(() => {
    const isSandbox = false; // mainnet-only
    if (isSandbox) {
      const checkInterval = setInterval(() => {
        setAuthUpdateTrigger(prev => prev + 1);
        try {
          const syncedUser = syncPiUserData();
          if (syncedUser) {
            console.log('🔄 Periodic sync found user:', syncedUser);
          }
        } catch (error) {
          console.warn('⚠️ Periodic sync failed:', error);
        }
      }, 2000);
      return () => clearInterval(checkInterval);
    }
  }, []);

  // Sync Pi data on mount and auth changes
  useEffect(() => {
    // Sync Pi data on mount and auth changes
    const syncedUser = syncPiUserData();
    const isPiAuthenticatedFromSDK = checkPiAuthentication();
    
    // Force re-render if auth state changes
    if (isAuthenticated || isPiAuth || isPiAuthenticatedFromSDK) {
      setAuthUpdateTrigger(prev => prev + 1);
    }
    
    // Log current state for debugging
    console.log('🔄 HomePage auth state changed:', {
      isAuthenticated,
      isPiAuth,
      isPiAuthenticatedFromSDK,
      piUser: piUser?.username || piUser?.name,
      authPiUser: authPiUser?.username || authPiUser?.name,
      syncedUser: syncedUser?.username || syncedUser?.name
    });
    
  }, [piUser, authPiUser, profile, isAuthenticated, isPiAuth, userDisplay.isPiAuth, userDisplay.username]);

  // Force refresh when profile's selected_bird_skin changes
  useEffect(() => {
    if (profile?.selected_bird_skin) {
      console.log('🔄 Profile bird skin changed:', profile.selected_bird_skin);
      setAuthUpdateTrigger(prev => prev + 1);
    }
  }, [profile?.selected_bird_skin]);

  // Check for daily login reward on component mount - ONLY FOR AUTHENTICATED USERS
  useEffect(() => {
    // Only show daily rewards for authenticated users
    if (!isAuthenticated || !piUser) return;
    
    const lastClaimTime = Number(localStorage.getItem('flappy-last-claim')) || 0;
    const streakCount = Number(localStorage.getItem('flappy-streak')) || 1;
    const now = Date.now();
    const hoursSince = (now - lastClaimTime) / (1000 * 60 * 60);
    
    console.log('🎁 Daily Reward Check:', {
      lastClaimTime,
      hoursSince,
      streakCount,
      isEligible: hoursSince >= 24 || lastClaimTime === 0
    });
    
    if (hoursSince >= 24 || lastClaimTime === 0) {
      // Queue the modal instead of showing immediately
      queueModal(() => {
        setShowDailyReward(true);
        setDailyRewardAmount(streakCount * 10);
        setStreak(streakCount);
      });
    }
    setLastClaim(lastClaimTime);
  }, [isAuthenticated, piUser]); // Added authentication dependencies

  // Show subscription promo after a delay if not subscribed and not seen recently - ONLY FOR AUTHENTICATED USERS
  useEffect(() => {
    if (!isAuthenticated || !piUser) return;
    
    const hasSeenPromo = localStorage.getItem('hasSeenSubscriptionPromo');
    const inventorySubscriptionStatus = inventoryService.getSubscriptionStatus();
    const hasInventorySubscription = inventorySubscriptionStatus.hasActiveSubscription;
    
    if (piUser && !piUser.is_subscribed && !hasInventorySubscription && !hasSeenPromo) {
      const timer = setTimeout(() => {
        // Queue the modal instead of showing immediately
        queueModal(() => {
          setShowSubscriptionPromo(true);
          localStorage.setItem('hasSeenSubscriptionPromo', 'true'); // Mark as seen
        });
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, piUser]);

  // Show coin transition when splash ends (simulate with useEffect for demo, or trigger from splash onFinish)
  useEffect(() => {
    setShowCoinTransition(true);
    const timer = setTimeout(() => setShowCoinTransition(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Show shop sale modal - ONLY FOR AUTHENTICATED USERS
  useEffect(() => {
    if (!isAuthenticated || !piUser) return;
    
    const { isSaleDay, periodEnd } = getSaleState();
    const salePeriod = Math.floor((Date.now() - Date.UTC(2025, 5, 1, 0, 0, 0, 0)) / (24 * 60 * 60 * 1000));
    if (isSaleDay && lastSalePeriod !== salePeriod) {
      // Queue the modal with 10 second delay
      const timer = setTimeout(() => {
        queueModal(() => {
          setShowSaleModal(true);
          setLastSalePeriod(salePeriod);
          localStorage.setItem('lastSalePeriod', salePeriod.toString());
        });
      }, 10000); // Show after 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, piUser, lastSalePeriod]);

  // On mount, restore lastSalePeriod from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lastSalePeriod');
    if (saved) setLastSalePeriod(Number(saved));
  }, []);

  // Check daily login reward on mount - ONLY FOR AUTHENTICATED USERS
  useEffect(() => {
    if (!isAuthenticated || !piUser) return;
    
    const lastClaimTime = Number(localStorage.getItem('flappy-last-claim')) || 0;
    const streakCount = Number(localStorage.getItem('flappy-streak')) || 1;
    const now = Date.now();
    const hoursSince = (now - lastClaimTime) / (1000 * 60 * 60);
    if (hoursSince >= 24 || lastClaimTime === 0) {
      // Queue the modal instead of showing immediately
      queueModal(() => {
        setShowDailyReward(true);
        setDailyRewardAmount(streakCount * 10);
        setStreak(streakCount);
      });
    }
    setLastClaim(lastClaimTime);
  }, [isAuthenticated, piUser]);

  // Check for new account and show tutorial - ONLY FOR AUTHENTICATED USERS
  useEffect(() => {
    if (!isAuthenticated || !piUser) return;
    
    const hasSeenTutorial = localStorage.getItem('flappy-tutorial-seen');
    const isNewAccount = !hasSeenTutorial;
    
    if (isNewAccount) {
      // Mark tutorial as seen immediately to prevent blocking
      localStorage.setItem('flappy-tutorial-seen', 'true');
      
      // Optionally show tutorial after a longer delay (not blocking)
      const timer = setTimeout(() => {
        // Only show if user hasn't dismissed it manually
        if (!localStorage.getItem('flappy-tutorial-dismissed')) {
          // Queue the modal instead of showing immediately
          queueModal(() => {
            setShowTutorial(true);
          });
        }
      }, 5000); // Show after 5 seconds, not blocking

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, piUser]); // Added authentication dependencies

  // Auto-hide scroll indicator after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollIndicator(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Select the next NPC in rotation when component mounts
  useEffect(() => {
    if (!homeNpcGif) {
      setHomeNpcGif(getNextNpcInRotation('home'));
    }
  }, [homeNpcGif]);

  // FLPY Token notification effect - show notification if user hasn't dismissed it
  useEffect(() => {
    const dismissed = localStorage.getItem('flappypi-flpy-notification-dismissed');
    if (!dismissed) {
      // Show FLPY notification after a brief delay
      const timer = setTimeout(() => {
        // Queue the modal instead of showing immediately
        queueModal(() => {
          setShowFLPYModal(true);
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSetShowSaleModal = (open: boolean) => {
    setShowSaleModal(open);
  };

  const handleNavigation = (path: string) => {
    try {
      setShowSaleModal(false);
      setShowContact(false);
      setShowHelp(false);
      setShowPrivacy(false);
      setShowTerms(false);
      setShowSubscriptionPromo(false);
      setShowSettings(false);
      setShowAbout(false);
      setShowTutorial(false);
      setShowWhitepaper(false);
      setShowDailyReward(false);
      
      navigate(path);
    } catch (error) {
      // Fallback to window.location if navigate fails
      window.location.href = path;
    }
  };

  // Handle FLPY notification dismissal
  const handleFLPYNotificationDismiss = (action: 'dismiss' | 'remind-later') => {
    setShowFLPYModal(false);
    if (action === 'dismiss') {
      // Permanently dismiss the notification
      localStorage.setItem('flappypi-flpy-notification-dismissed', 'true');
      setFlpyNotificationDismissed(true);
    }
    // For 'remind-later', we don't save to localStorage so it can show again next session
  };

  const handleGameModeSelect = (mode: 'classic' | 'endless' | 'challenge' | 'scream-pi' | 'flappy-stack') => {
    playSwoosh();
    if (mode === 'scream-pi') {
      // Scream Pi is always unlocked - no social challenge requirement
      console.log('🎤 Scream Pi: Always unlocked - navigating to Scream Pi page');
      navigate('/scream-pi');
    } else if (mode === 'flappy-stack') {
      // Flappy Stack mode - navigate to dedicated page
      console.log('🧱 Flappy Stack: Navigating to Flappy Stack mode');
      navigate('/flappy-stack');
    } else {
      gameState.startGame(mode);
      navigate('/play');
    }
  };

  const handleOpenTutorial = () => {
    setShowTutorial(true);
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    // Mark tutorial as dismissed to prevent future automatic showing
    localStorage.setItem('flappy-tutorial-dismissed', 'true');
  };

  const handleInviteFriends = () => {
    navigate('/invite-friends');
  };

  const handleOpenShop = () => {
    navigateToPublic('/shop');
  };

  const handleOpenReserveConnect = () => {
    setShowReserveConnect(true);
  };

  const handleOpenStream = () => {
    setShowStreamPanel(true);
  };

  const handleOpenPrivacy = () => {
    setShowPiHidePanel(true);
  };

  const handleOpenLeaderboard = () => {
    navigateToPublic('/leaderboard');
  };

  const handleOpenInventory = () => {
    navigateToPublic('/inventory');
  };

  const handleDevRedeem = async () => {
    if (devRedeemPassword !== '') {
      setDevRedeemError(t('incorrectPassword'));
      return;
    }
    setDevRedeemError('');
    // Sanitize coin value and update wallet
    const coinsToAdd = Math.max(1, Number.isFinite(1) ? 1 : 0);
    await addCoins(coinsToAdd, 'Dev Redeem - 1 Coins');
    window.dispatchEvent(new CustomEvent('wallet-updated', { detail: { coinsAdded: coinsToAdd } }));
    setDevRedeemSuccess(true);
    setTimeout(() => {
      setShowDevRedeem(false);
      setDevRedeemSuccess(false);
      setDevRedeemPassword('');
    }, 2000);
  };

  const footerLinks = [
    { href: '/home', label: t('home') },
    { href: '/play', label: t('play') },
    { href: '/shop', label: t('shop') },
    { href: '/leaderboard', label: t('leaderboard') },
    { href: '/social-challenge', label: t('socialChallenge') },
    { href: '/community', label: t('community') },
    { href: '/partnership', label: t('partnership') },
    { href: '/invite-friends', label: t('inviteFriends') },
    { href: '/flappy-wiki', label: t('wiki') },
    { href: '/video', label: t('video') },
    { href: '/whitepaper', label: t('whitepaper') },
    { href: '/privacy', label: t('privacy') },
    { href: '/terms', label: t('terms') },
    { href: '/contact', label: t('contact') },
    { href: '/help', label: t('help') },
    { href: '/about', label: t('about') },
    { href: '/account', label: t('account') },
    { href: '/admin', label: t('admin') },
    { href: '/analytics', label: t('analytics') },
    { href: '/flappy-pi-blog', label: t('blog') },
    { href: '/faq', label: t('faq') },
    { href: '/inventory', label: t('inventory') },
    { href: '/payment-history', label: t('paymentHistory') },
    { href: '/pi-login', label: t('piLogin') },
    { href: '/press', label: t('press') },
    { href: '/purchase-history', label: t('purchaseHistory') },
    { href: '/reviews', label: t('reviews') },
    { href: '/settings', label: t('settings') },
    { href: '/splash-screen', label: t('splashScreen') },
    { href: '/status', label: t('status') },
    { href: '/subscription', label: t('subscription') },
    { href: '/more', label: t('more') },
  ];

  const handlePiBrowserPromptClose = () => {
    // Implement logic if needed when the Pi Browser prompt is closed
  };

  const handleClaimDailyReward = async () => {
    if (!piUser && !profile) return;
    const now = Date.now();
    const lastClaimTime = Number(localStorage.getItem('flappy-last-claim')) || 0;
    let streakCount = Number(localStorage.getItem('flappy-streak')) || 1;
    if (lastClaimTime && (now - lastClaimTime) > 48 * 60 * 60 * 1000) {
      streakCount = 1; // Reset streak if missed more than 48 hours
    } else if (lastClaimTime && (now - lastClaimTime) > 24 * 60 * 60 * 1000) {
      streakCount = 1; // Reset streak if missed a day
    } else if (lastClaimTime) {
      streakCount += 1;
    }
    const reward = streakCount * 10; // Changed from 100 to 10 flappy coins per day
    await addCoins(reward, 'Daily Login Reward'); // Add coins to wallet
    localStorage.setItem('flappy-last-claim', now.toString());
    localStorage.setItem('flappy-streak', streakCount.toString());
    setShowDailyReward(false);
    setStreak(streakCount);
    setDailyRewardAmount(reward);
    // Optionally, show a toast or update UI
  };


  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${
      theme === 'night' 
        ? 'bg-gradient-to-b from-gray-900 via-blue-900 to-black' 
        : seasonalWeather.background
    }`}>
      {/* Header with Pi Authentication */}
      <HeaderWithPiAuth title="Flappy Pi" showNavigation={true} />
      
      {/* Main content - IMPROVED MOBILE LAYOUT */}
      <div className="pb-8 sm:pb-12 main-content overflow-hidden">
        {/* Safe area padding for mobile */}
        <style>{`
          .main-content {
            padding-left: max(1rem, env(safe-area-inset-left));
            padding-right: max(1rem, env(safe-area-inset-right));
          }
          @media (max-width: 640px) {
            .main-content {
              padding-left: 0.75rem;
              padding-right: 0.75rem;
            }
          }
        `}</style>
        {/* Night mode visuals */}
        {theme === 'night' && (
        <>
          {/* Starfield */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {[...Array(60)].map((_, i) => {
              const sizePx = Math.random() * 2 + 1;
              const durationSec = 0.8 + Math.random() * 0.9; // 0.8s - 1.7s (faster twinkle)
              const delaySec = Math.random() * 1.5; // staggered start
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
              /* baseline faster twinkle; each star overrides duration inline */
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

      {/* Seasonal Weather Effects */}
      {theme !== 'night' && (
        <div className="absolute inset-0 z-0 pointer-events-none season-effects-container">
          {/* Spring Effects */}
          {currentSeason === 'spring' && (
            <>
              {/* Gentle Rain */}
              {[...Array(20)].map((_, i) => (
                <div
                  key={`rain-${i}`}
                  className="absolute w-0.5 h-8 bg-blue-300 opacity-60 animate-rain"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                />
              ))}
              {/* Butterflies */}
              {[...Array(5)].map((_, i) => (
                <div
                  key={`butterfly-${i}`}
                  className="absolute text-2xl animate-butterfly"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
                  }}
                >
                  🦋
                </div>
              ))}
            </>
          )}

          {/* Summer Effects */}
          {currentSeason === 'summer' && (
            <>
              {/* Sunshine Rays */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-yellow-200/30 to-transparent rounded-full animate-pulse" />
              {/* Heat Waves */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-yellow-100/20 to-transparent animate-heat-wave" />
              {/* Bees */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={`bee-${i}`}
                  className="absolute text-lg animate-bee"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${4 + Math.random() * 2}s`
                  }}
                >
                  🐝
                </div>
              ))}
            </>
          )}

          {/* Autumn Effects */}
          {currentSeason === 'autumn' && (
            <>
              {/* Falling Leaves */}
              {[...Array(15)].map((_, i) => (
                <div
                  key={`leaf-${i}`}
                  className="absolute text-lg animate-falling-leaf"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
                  }}
                >
                  🍂
                </div>
              ))}
              {/* Wind Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-100/10 to-transparent animate-wind" />
            </>
          )}

          {/* Winter Effects */}
          {currentSeason === 'winter' && (
            <>
              {/* Snow */}
              {[...Array(30)].map((_, i) => (
                <div
                  key={`snow-${i}`}
                  className="absolute w-1 h-1 bg-white rounded-full animate-snow"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 3}s`
                  }}
                />
              ))}
              {/* Ice Crystals */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={`ice-${i}`}
                  className="absolute text-lg animate-ice-crystal"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${4 + Math.random() * 2}s`
                  }}
                >
                  ❄️
                </div>
              ))}
            </>
          )}

          <style>{`
            .season-effects-container {
              bottom: 200px !important;
              overflow: hidden;
            }
            
            @keyframes rain {
              0% { transform: translateY(-100vh); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(calc(100vh - 200px)); opacity: 0; }
            }
            .animate-rain {
              animation: rain linear infinite;
            }

            @keyframes butterfly {
              0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
              25% { transform: translateX(20px) translateY(-10px) rotate(5deg); }
              50% { transform: translateX(40px) translateY(-20px) rotate(0deg); }
              75% { transform: translateX(20px) translateY(-10px) rotate(-5deg); }
            }
            .animate-butterfly {
              animation: butterfly ease-in-out infinite;
            }

            @keyframes heat-wave {
              0%, 100% { opacity: 0.1; transform: scaleY(1); }
              50% { opacity: 0.3; transform: scaleY(1.1); }
            }
            .animate-heat-wave {
              animation: heat-wave 3s ease-in-out infinite;
            }

            @keyframes bee {
              0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
              25% { transform: translateX(30px) translateY(-15px) rotate(10deg); }
              50% { transform: translateX(60px) translateY(-30px) rotate(0deg); }
              75% { transform: translateX(30px) translateY(-15px) rotate(-10deg); }
            }
            .animate-bee {
              animation: bee ease-in-out infinite;
            }

            @keyframes falling-leaf {
              0% { transform: translateY(-100vh) rotate(0deg); }
              100% { transform: translateY(calc(100vh - 200px)) rotate(360deg); }
            }
            .animate-falling-leaf {
              animation: falling-leaf linear infinite;
            }

            @keyframes wind {
              0%, 100% { transform: translateX(0); opacity: 0.1; }
              50% { transform: translateX(20px); opacity: 0.3; }
            }
            .animate-wind {
              animation: wind 4s ease-in-out infinite;
            }

            @keyframes snow {
              0% { transform: translateY(-100vh) rotate(0deg); }
              100% { transform: translateY(calc(100vh - 200px)) rotate(360deg); }
            }
            .animate-snow {
              animation: snow linear infinite;
            }

            @keyframes ice-crystal {
              0%, 100% { transform: translateY(-100vh) rotate(0deg) scale(1); }
              50% { transform: translateY(calc(-50vh + 100px)) rotate(180deg) scale(1.2); }
              100% { transform: translateY(100vh) rotate(360deg) scale(1); }
            }
            .animate-ice-crystal {
              animation: ice-crystal linear infinite;
            }
          `}</style>
        </div>
      )}

      <BackgroundDecoration />
      
      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[150] animate-fade-in-up">
          <div className="flex flex-col items-center gap-2 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-2xl border border-white/50">
            <div className="flex items-center gap-2">
              <ChevronDown className="w-5 h-5 text-blue-600 animate-bounce" />
              <span className="text-sm font-semibold text-blue-700">More below</span>
            </div>
            <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
          </div>
        </div>
      )}
      
       
      
      {/* Main content area - natural page scroll */}
      <div className="w-full flex flex-col items-center justify-start pt-8 pb-24 sm:pb-32">
        {/* User Profile and Wallet Section - Now properly positioned */}
        <div className="w-full max-w-4xl mx-auto px-4 mb-8">

          
          <div className={`${getFooterBg()}/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border ${getFooterBorder()} profile-section card`}>
            <div className="flex items-center justify-between">
              {/* Left side - User Profile */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={userDisplay.avatar} 
                    alt={t('profile')} 
                    className="w-12 h-12 rounded-full border-3 border-yellow-400 shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200" 
                    onClick={() => setShowProfileModal(true)}
                    title="Click to view profile details"
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className={`font-bold text-lg header-text ${theme === 'night' ? 'text-white' : 'text-gray-800'}`}>{userDisplay.username}</h2>
                    {userDisplay.isPiAuth && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                        Pi Network
                      </span>
                    )}
                  </div>
                  <p className={`text-sm account-type ${theme === 'night' ? 'text-white/70' : 'text-gray-600'}`}>
                    {userDisplay.isPiAuth ? `Pi Network: ${userDisplay.username}` : 'Guest User'}
                  </p>
                </div>
              </div>
              
                                            {/* Right side - Wallet, Notification Bell, and Profile Button */}
                                            <div className="flex items-center gap-2 sm:gap-3">
                                              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl px-4 py-2 shadow-md">
                                                <div className="flex items-center gap-2">
                                                  <img src="/flappycoins.png" alt="Flappy Coins" className="w-5 h-5" />
                                                  <span className="font-bold text-gray-800 text-lg wallet-balance">{balance}</span>
                                                </div>
                                              </div>
                                              {/* Notification Bell */}
                                              <button
                                                className="hover:bg-gray-100 text-gray-700 py-2 px-2 rounded-lg transition-colors"
                                                onClick={handleOpenAnnouncement}
                                                aria-label="Notifications"
                                              >
                                                <Bell className="w-5 h-5" />
                                                {!announcementRead && (
                                                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                                                )}
                                              </button>
                                            </div>
                  {/* Announcement Modal */}
                  <Dialog open={showAnnouncement} onOpenChange={handleCloseAnnouncement}>
                    <DialogContent className="max-w-md w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
                      <DialogHeader className="bg-gradient-to-r from-yellow-50 via-white to-blue-50 px-8 pt-8 pb-4 flex flex-col items-center">
                        <DialogTitle className="text-2xl font-bold text-blue-700 mb-1 text-center">
                          {importantAnnouncement.title}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 text-center mb-2">
                          {importantAnnouncement.date}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-base text-center">
                        {importantAnnouncement.message}
                      </div>
                      <div className="flex justify-center pb-6">
                        <Button onClick={handleCloseAnnouncement} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg mt-4">Close</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
            </div>
          </div>
        </div>
        
        
        
        {/* All your menu content here */}
        
        {/* Main content with responsive grid layout */}
        <ResponsiveContainer maxWidth="600px">
                      <img src={equippedSkinImg} alt="Flappy Pi Bird" className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-2 animate-bounce-slow drop-shadow-2xl" />
          <style>{`
            .animate-bounce-slow {
              animation: bounce 2.5s infinite;
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-18px); }
            }
            @keyframes fade-in-up {
              0% {
                opacity: 0;
                transform: translate(-50%, 20px);
              }
              100% {
                opacity: 1;
                transform: translate(-50%, 0);
              }
            }
            .animate-fade-in-up {
              animation: fade-in-up 0.6s ease-out;
            }
          `}</style>
          <h1 className={`text-3xl sm:text-5xl font-black mb-2 drop-shadow-lg tracking-wide text-center ${theme === 'night' ? 'text-white' : 'text-blue-900'}`}>{t('flappyPi')}</h1>
          <div className={`text-lg sm:text-xl font-medium mb-4 sm:mb-6 text-center px-2 ${theme === 'night' ? 'text-white/80' : 'text-yellow-800'}`}>{t('playFlappyPi')}</div>
          
          {/* Seasonal Weather Indicator */}
          {theme !== 'night' && (
            <div className="flex items-center justify-center mb-4">
              <div className={`px-4 py-2 rounded-full shadow-lg border-2 ${
                currentSeason === 'spring' ? 'bg-gradient-to-r from-green-100 to-pink-100 border-green-300 text-green-800' :
                currentSeason === 'summer' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300 text-orange-800' :
                currentSeason === 'autumn' ? 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-300 text-orange-800' :
                currentSeason === 'thunder' ? 'bg-gradient-to-r from-gray-800 to-purple-900 border-purple-400 text-white' :
                currentSeason === 'rain' ? 'bg-gradient-to-r from-blue-100 to-gray-300 border-blue-300 text-blue-800' :
                currentSeason === 'fog' ? 'bg-gradient-to-r from-gray-200 to-gray-400 border-gray-300 text-gray-800' :
                currentSeason === 'storm' ? 'bg-gradient-to-r from-gray-600 to-gray-800 border-gray-500 text-white' :
                'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300 text-blue-800'
              }`}>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold flex items-center gap-2 drop-shadow-sm">
                    {seasonalWeather.emoji} {seasonalWeather.name} Weather
                  </span>
                  <div className="text-xs opacity-75 mt-1 drop-shadow-sm">
                    Next: {seasonManager.formatTimeUntilNext(timeUntilNext)}
                  </div>
                  <div className={`w-full rounded-full h-1 mt-1 ${
                    currentSeason === 'thunder' || currentSeason === 'storm' 
                      ? 'bg-white/20' 
                      : 'bg-white/30'
                  }`}>
                    <div 
                      className={`rounded-full h-1 transition-all duration-1000 ${
                        currentSeason === 'thunder' || currentSeason === 'storm'
                          ? 'bg-white/80'
                          : 'bg-white/60'
                      }`}
                      style={{ width: `${seasonProgress * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Welcome message for authenticated users only */}
          {userDisplay.isPiAuth && (
            <div className="text-center mb-4 welcome-message">
              <p className={theme === 'night' ? 'text-white/90 text-sm' : 'text-blue-800 text-sm'}>Welcome back, {userDisplay.username}! 🎉</p>
              <p className={theme === 'night' ? 'text-white/70 text-xs' : 'text-gray-700 text-xs'}>Pi Network authenticated</p>
            </div>
          )}
          
                     {/* Welcome message for all users - REMOVED CONDITIONAL RENDERING */}
           <div className={`text-center mb-4 p-4 rounded-2xl border-2 shadow-lg ${
             theme === 'night' 
               ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' 
               : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
           }`}>
             <p className={`text-lg font-bold ${theme === 'night' ? 'text-white' : 'text-blue-800'} mb-2`}>🎉 Welcome to Flappy Pi!</p>
             <p className={`text-sm ${theme === 'night' ? 'text-gray-200' : 'text-blue-700'} mb-3`}>
               Ready to start your flapping adventure? Check out the tutorial to learn the basics!
             </p>
             <div className="flex items-center justify-center gap-4 mb-3">
               <button
                 onClick={handleOpenTutorial}
                 className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:scale-105 transition-transform duration-200 shadow-lg"
               >
                 📚 Start Tutorial
               </button>
             </div>
           </div>
          
                     {/* Game mode and plan buttons - vertical, enhanced design - IMPROVED MOBILE */}
           <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-md mx-auto mt-6 sm:mt-8 mb-12 px-3 sm:px-0">
             <button
               onClick={() => navigateToPublic('/play')}
               className="w-full flex items-center justify-center gap-2 sm:gap-3 py-4 sm:py-5 px-4 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-2xl transition-all duration-300 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-400 text-blue-900 border-4 border-yellow-600/50 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50 hover:border-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-300 game-mode-button relative overflow-hidden group"
               style={{ minHeight: '56px', pointerEvents: 'auto' }}
             >
               <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
               <span className="text-xl sm:text-2xl relative z-10">▶️</span> 
               <span className="text-sm sm:text-base relative z-10">{t('play')}</span>
             </button>
             <button
               onClick={() => navigateToPublic('/play')}
               className="w-full flex items-center justify-center gap-2 sm:gap-3 py-4 sm:py-5 px-4 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-2xl transition-all duration-300 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-400 text-white border-4 border-green-600/50 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50 hover:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-200 game-mode-button relative overflow-hidden group"
               style={{ minHeight: '56px', pointerEvents: 'auto' }}
             >
               <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
               <span className="text-xl sm:text-2xl relative z-10">🌱</span> 
               <span className="text-sm sm:text-base relative z-10">{t('classic')}</span>
             </button>
            <button
              onClick={() => navigateToPublic(ROUTES.ENDLESS)}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 py-4 sm:py-5 px-4 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-2xl transition-all duration-300 bg-gradient-to-br from-blue-400 via-cyan-500 to-indigo-400 text-white border-4 border-blue-600/50 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 hover:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 relative overflow-hidden group"
              style={{ minHeight: '56px', pointerEvents: 'auto' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
              <span className="text-xl sm:text-2xl relative z-10">∞</span> 
              <span className="text-sm sm:text-base relative z-10">{t('endless')}</span>
            </button>
            <button
              onClick={() => navigateToPublic(ROUTES.CHALLENGE)}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl font-black text-xl sm:text-2xl transition-all duration-300 bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-500 text-white border-4 border-purple-600/50 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 hover:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-200 relative overflow-hidden group"
              style={{ minHeight: '56px', pointerEvents: 'auto' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
              <span className="text-2xl relative z-10">🏆</span> <span className="relative z-10">{t('challenge')}</span>
            </button>

            {/* PvP Duels Button - Next Season Modal */}
            <button
              onClick={() => {
                setNextSeasonFeature('pvp-duels');
                setShowNextSeasonModal(true);
              }}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl font-black text-xl sm:text-2xl transition-all duration-300 bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 text-white border-4 border-red-600/50 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50 hover:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-200 relative overflow-hidden group"
              style={{ minHeight: '56px', pointerEvents: 'auto' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
              <span className="text-2xl relative z-10">⚔️</span> <span className="relative z-10">PvP Duels</span>
            </button>
            
            {/* Test Duels Button - DEMO - DISABLED */}
                {/* <button
                  onClick={handleTestDuelsClick}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-lg shadow-md transition-all duration-200 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-200"
                  style={{ minHeight: '48px', pointerEvents: 'auto' }}
                >
                  <span className="text-xl">🧪</span> Test Duels (Demo)
                </button> */}
                
                {/* <button
                  onClick={handleStandaloneDuelsClick}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-lg shadow-md transition-all duration-200 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                  style={{ minHeight: '48px', pointerEvents: 'auto' }}
                >
                  <span className="text-xl">🎮</span> Classic Shadow Duels
                </button> */}
            
            {/* Original Duels Button - LEGACY - DISABLED */}
            {/* <button
              onClick={handleDuelsClick}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-lg shadow-md transition-all duration-200 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-200"
              style={{ minHeight: '48px', pointerEvents: 'auto' }}
            >
              <span className="text-xl">🎮</span> Legacy Duels
            </button> */}
            <button
              onClick={() => navigateToPublic(ROUTES.SUBSCRIPTION_PLANS)}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl font-black text-xl sm:text-2xl transition-all duration-300 bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 text-white border-4 border-pink-600/50 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/50 hover:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-200 relative overflow-hidden group"
              style={{ minHeight: '56px', pointerEvents: 'auto' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
              <span className="text-2xl relative z-10">💎</span> <span className="relative z-10">{t('subscriptionPlans')}</span>
            </button>
            <button
              onClick={() => navigateToPublic(ROUTES.SOCIAL_CHALLENGE)}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl font-black text-xl sm:text-2xl transition-all duration-300 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-500 text-white border-4 border-purple-600/50 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 hover:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-200 relative overflow-hidden group"
              style={{ minHeight: '56px', pointerEvents: 'auto' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
              <span className="text-2xl relative z-10">🎮</span> <span className="relative z-10">{t('socialChallenge')}</span>
            </button>
            <button
              onClick={() => navigateToPublic(ROUTES.COMMUNITY)}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl font-black text-xl sm:text-2xl transition-all duration-300 bg-gradient-to-br from-sky-500 via-blue-600 to-cyan-500 text-white border-4 border-blue-600/50 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 hover:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 relative overflow-hidden group"
              style={{ minHeight: '56px', pointerEvents: 'auto' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
              <span className="text-2xl relative z-10">🌐</span> <span className="relative z-10">{t('flappyPiCommunity')}</span>
            </button>
            
            {/* Flappy Pi Toons Button - DISABLED */}
            {/* 
            <button
              onClick={() => {
                // Temporarily locked - videos are still being made
                alert('🚧 Flappy Pi Toons is coming soon! Our animated content is currently in production. Stay tuned for exciting episodes!');
              }}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl font-black text-xl sm:text-2xl shadow-lg transition-all duration-200 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white cursor-not-allowed opacity-75"
              style={{ minHeight: '56px', pointerEvents: 'auto' }}
              disabled
            >
              <span className="text-2xl">📺</span>
              <span>Flappy Pi Toons 🚧 Coming Soon</span>
            </button>
            */}
            
            {/* Flappy Pi DeFi Button */}
            <button
              onClick={() => navigate('/flappy-pi-defi')}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl font-black text-xl sm:text-2xl transition-all duration-300 bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 text-white border-4 border-yellow-600/50 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50 hover:border-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-200 relative overflow-hidden group"
              style={{ minHeight: '56px', pointerEvents: 'auto' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
              <span className="text-2xl relative z-10">💰</span>
              <span className="relative z-10">Flappy Pi DeFi</span>
            </button>
            
            {/* Dino Pi Button - Next Season Modal */}
            <button
              onClick={() => {
                setNextSeasonFeature('dino-pi');
                setShowNextSeasonModal(true);
              }}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl font-black text-xl sm:text-2xl transition-all duration-300 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-500 text-white border-4 border-green-600/50 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50 hover:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-200 relative overflow-hidden group"
              style={{ minHeight: '56px', pointerEvents: 'auto' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
              <img src="/dino pi/dinopi logo.png" alt="Dino Pi Logo" className="w-8 h-8 mr-2 relative z-10" />
              <span className="relative z-10">Dino Pi</span>
            </button>
            
            
          </div>
          
          {/* Main icon row: Shop, Leaderboard, Inventory, Wallet */}
          <ResponsiveUIGrid columns={4}>
            <button onClick={() => navigateToPublic(ROUTES.SHOP)} className="flex flex-col items-center group" style={{ background: 'none', border: 'none' }}>
              <img src="/shop.png" alt={t('shop')} className="h-14 w-14 mb-1 group-hover:scale-110 transition-transform" />
              <span className={`text-base font-bold group-hover:text-blue-600 ${theme === 'night' ? 'text-white' : 'text-gray-700'}`}>{t('shop')}</span>
            </button>
            <button onClick={() => navigateToPublic(ROUTES.LEADERBOARD)} className="flex flex-col items-center group" style={{ background: 'none', border: 'none' }}>
              <img src="/leaderboard.png" alt={t('leaderboard')} className="h-14 w-14 mb-1 group-hover:scale-110 transition-transform" />
              <span className={`text-base font-bold group-hover:text-blue-600 ${theme === 'night' ? 'text-white' : 'text-gray-700'}`}>{t('leaderboard')}</span>
            </button>
            <button onClick={() => navigateToPublic(ROUTES.INVENTORY)} className="flex flex-col items-center group" style={{ background: 'none', border: 'none' }}>
              <img src="/inventory.png" alt={t('inventory')} className="h-14 w-14 mb-1 group-hover:scale-110 transition-transform" />
              <span className={`text-base font-bold group-hover:text-blue-600 ${theme === 'night' ? 'text-white' : 'text-gray-700'}`}>{t('inventory')}</span>
            </button>
            <button onClick={() => navigateToPublic(ROUTES.WALLET)} className="flex flex-col items-center group" style={{ background: 'none', border: 'none' }}>
              <img src="/wallet.png" alt={t('wallet')} className="h-14 w-14 mb-1 group-hover:scale-110 transition-transform" />
              <span className={`text-base font-bold group-hover:text-blue-600 ${theme === 'night' ? 'text-white' : 'text-gray-700'}`}>{t('wallet')}</span>
            </button>
          </ResponsiveUIGrid>

          
          {/* Merch/Wiki/Test/Settings Row */}
          <ResponsiveUIGrid columns={5}>
            <button onClick={() => setShowSettings(true)} className="flex flex-col items-center group" style={{ background: 'none', border: 'none' }}>
              <img src="/settings.png" alt={t('settings')} className="h-14 w-14 mb-1 group-hover:scale-110 transition-transform" />
              <span className={`text-base font-bold group-hover:text-blue-600 ${theme === 'night' ? 'text-white' : 'text-gray-700'}`}>{t('settings')}</span>
            </button>
            <button onClick={() => navigateToPublic(ROUTES.RESERVE)} className="flex flex-col items-center group" style={{ background: 'none', border: 'none' }}>
              <img src="/reserve.png" alt={t('reserve')} className="h-14 w-14 mb-1 group-hover:scale-110 transition-transform" />
              <span className={`text-base font-bold group-hover:text-blue-600 ${theme === 'night' ? 'text-white' : 'text-gray-700'}`}>{t('reserve')}</span>
            </button>
            <button onClick={() => navigateToPublic(ROUTES.MERCH)} className="flex flex-col items-center group" style={{ background: 'none', border: 'none' }}>
              <img src="/merch.png" alt={t('merch')} className="h-14 w-14 mb-1 group-hover:scale-110 transition-transform" />
              <span className={`text-base font-bold group-hover:text-blue-600 ${theme === 'night' ? 'text-white' : 'text-gray-700'}`}>{t('merch') || 'Merch'}</span>
            </button>
            <button onClick={() => navigateToPublic(ROUTES.WIKI)} className="flex flex-col items-center group" style={{ background: 'none', border: 'none' }}>
              <img src="/wiki.png" alt={t('wiki')} className="h-14 w-14 mb-1 group-hover:scale-110 transition-transform" />
              <span className={`text-base font-bold group-hover:text-blue-600 font-sans tracking-tight text-[1.1rem] sm:text-base ${theme === 'night' ? 'text-white' : 'text-gray-700'}`} style={{fontFamily: 'system-ui, sans-serif'}}>{t('wiki')}</span>
            </button>
            <button onClick={() => navigateToPublic(ROUTES.PERFORMANCE_MONITOR)} className="flex flex-col items-center group" style={{ background: 'none', border: 'none' }}>
              <img src="/performance monitor.png" alt="Performance Monitor" className="h-14 w-14 mb-1 group-hover:scale-110 transition-transform" />
              <span className={`text-base font-bold group-hover:text-blue-600 ${theme === 'night' ? 'text-white' : 'text-gray-700'}`}>Performance</span>
            </button>
          </ResponsiveUIGrid>
        </ResponsiveContainer>

      </div>
      

      
      {/* Daily Rewards and Tutorial Buttons above NPC */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-4 px-4 sm:px-0">
        <button
          onClick={() => navigateToPublic(ROUTES.DAILY_REWARDS)}
          className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl transition-all duration-200 bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-200 border-2 border-orange-400 min-h-[48px] sm:min-h-[56px] touch-manipulation w-full sm:w-auto"
        >
          <span className="text-xl sm:text-2xl">🎁</span> 
          <span className="truncate">{t('dailyRewards')}</span>
        </button>
        <button
          onClick={handleOpenTutorial}
          className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-200 border-2 border-purple-400 relative min-h-[48px] sm:min-h-[56px] touch-manipulation w-full sm:w-auto"
        >
          <span className="text-xl sm:text-2xl">📚</span> 
          <span className="truncate">{t('tutorial') || 'Tutorial'}</span>
          {/* Tutorial indicator removed - no longer blocking */}
        </button>
      </div>
      </div> {/* Close main content div */}
      
      {/* Home NPC Dialog - Fixed Implementation */}
      <div style={{ position: 'relative', zIndex: 100 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 0 0 0',
            cursor: 'pointer',
            minHeight: '160px',
            minWidth: '160px',
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Check if it's a double-click to change NPC
            const now = Date.now();
            const lastClick = (e.currentTarget as any).lastClickTime || 0;
            const timeDiff = now - lastClick;
            
            if (timeDiff < 500) { // Double click within 500ms
              console.log('🎮 Double click detected! Changing Home NPC...');
              setHomeNpcGif(getNextNpcInRotation('home'));
            } else {
              // Single click - cycle through dialogs
              console.log('🎮 Home NPC clicked! Current index:', homeNpcDialogIndex, 'Total dialogs:', homeNpcDialogs.length);
              setHomeNpcDialogIndex((prev) => (prev + 1) % homeNpcDialogs.length);
            }
            
            (e.currentTarget as any).lastClickTime = now;
          }}
        >
          {/* Dialog bubble above NPC */}
          <div
            className="npc-dialog-bubble"
            style={{
              background: theme === 'night' ? '#1f2937' : '#fff',
              borderRadius: 16,
              padding: '12px 20px',
              boxShadow: theme === 'night' ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.15)',
              fontWeight: 500,
              fontSize: 16,
              color: theme === 'night' ? '#ffffff' : '#333',
              textAlign: 'center',
              maxWidth: 320,
              marginBottom: 12,
              border: '2px solid #fbbf24',
              userSelect: 'none',
              display: 'inline-block',
              transition: 'all 0.3s ease-in-out',
              pointerEvents: 'none',
              position: 'relative',
              zIndex: 101,
            }}
          >
            {homeNpcDialogs[homeNpcDialogIndex] || 'Hello there! 👋'}
          </div>
          
          {/* User Character Sprite below dialog */}
          <img
            src={equippedSkinImg || "/flappy-logo.png"}
            alt="Your Character"
            className="animate-bounce-slow"
            style={{ 
              width: 88, 
              height: 'auto', 
              display: 'block', 
              margin: '0 auto',
              transition: 'transform 0.3s ease-in-out',
              pointerEvents: 'none',
              position: 'relative',
              zIndex: 100,
            }}
            onError={(e) => {
              console.warn('⚠️ User character sprite failed to load, using fallback');
              e.currentTarget.src = '/flappy-logo.png';
            }}
          />
          
          {/* NPC Name below sprite */}
          <div className="npc-name-text" style={{ 
            fontSize: 15, 
            color: theme === 'night' ? '#e5e7eb' : '#888', 
            fontWeight: 500, 
            textAlign: 'center', 
            marginTop: 8,
            transition: 'color 0.2s ease-in-out',
            pointerEvents: 'none',
            position: 'relative',
            zIndex: 100,
          }}>
            {t('homeNPC')}
            <div className="npc-subtitle-text" style={{ 
              fontSize: 12, 
              color: theme === 'night' ? '#d1d5db' : '#aaa', 
              marginTop: 4,
              opacity: 0.8,
              fontWeight: 400,
            }}>
              Click to chat! Double-click to change! 💬✨
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for NPC animation */}
      <style>{`
        .animate-bounce-slow {
          animation: bounce 2.2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
      `}</style>

      <EnhancedFooter
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        piUser={piUser}
        gameMode={gameState.visualMode}
        onGameModeChange={gameState.setVisualMode}
      />
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PaymentDebugger isOpen={showTestPayment} onClose={() => setShowTestPayment(false)} />
      <SubscriptionPromoModal 
        isOpen={(profile || piUser) && showSubscriptionPromo}
        onClose={() => setShowSubscriptionPromo(false)}
      />
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        soundEnabled={soundEnabled}
        onSoundToggle={setSoundEnabled}
        musicEnabled={musicEnabled}
        onMusicToggle={setMusicEnabled}
        theme={settings.theme as 'light' | 'night'}
        onThemeChange={handleThemeChange}
      />
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <ProfileImageModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      {/* Tutorial Modal - ONLY FOR AUTHENTICATED USERS */}
      {isAuthenticated && piUser && (
        <TutorialModal 
          isOpen={showTutorial} 
          onClose={handleCloseTutorial} 
          onStartGame={() => { handleCloseTutorial(); setShowGameModeModal(true); }} 
        />
      )}
      <GameModeModal 
        open={showGameModeModal} 
        onClose={() => setShowGameModeModal(false)} 
        onSelectMode={handleGameModeSelect} 
      />
      {/* Sale Notification Modal - ONLY FOR AUTHENTICATED USERS */}
      {isAuthenticated && piUser && (
        <Dialog open={showSaleModal} onOpenChange={handleSetShowSaleModal}>
          <DialogContent className="max-w-md text-center" aria-describedby="dialog-desc">
            <DialogTitle>🎉 Shop Sale is Live!</DialogTitle>
            <DialogDescription id="dialog-desc">{t('shopSaleDescription')}</DialogDescription>
            <div className="text-lg my-4">Limited time discounts on Flappy Skins and Bundles! Visit the shop to save 1-2 Pi on select items. Sale ends in 24 hours.</div>
            <Button onClick={() => { handleSetShowSaleModal(false); navigateToPublic('/shop'); }} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg mt-4">Go to Shop</Button>
          </DialogContent>
        </Dialog>
      )}
      {/* Daily Reward Modal - ONLY FOR AUTHENTICATED USERS */}
      {isAuthenticated && piUser && showDailyReward && (
        <Dialog open={showDailyReward} onOpenChange={() => setShowDailyReward(false)}>
          <DialogContent className="max-w-md bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center" aria-describedby="daily-reward-desc">
            <DialogTitle>Daily Login Reward</DialogTitle>
            <DialogDescription id="daily-reward-desc">{t('dailyRewardDescription')}</DialogDescription>
                          <img src="/flappycoins.png" alt="Flappy Coins" className="w-24 h-24 mb-4 animate-bounce" />
            <div className="text-xl font-bold text-yellow-600 mb-2">Daily Login Reward</div>
            <div className="text-gray-700 mb-2">Hi, {username || piUser?.username || 'Player'}! You received {dailyRewardAmount} Flappy Coins today!</div>
            <div className="text-sm text-gray-500 mb-4">Come back every 24 hours to increase your reward! (+10 FC per day streak)</div>
            <Button className="mt-4 bg-yellow-400 text-white px-6 py-3 text-lg rounded-xl hover:bg-yellow-500 transition-transform duration-200 hover:scale-105 font-bold" onClick={handleClaimDailyReward}>
              {t('claimNow')}
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Shop Modal */}
      <Dialog open={showPaymentShop} onOpenChange={setShowPaymentShop}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white p-0">
          <DialogHeader className="bg-gradient-to-r from-purple-500 to-blue-500 px-8 pt-8 pb-4 flex flex-col items-center">
            <DialogTitle className="text-white text-2xl font-bold">🛒 Pi Payment Shop</DialogTitle>
            <DialogDescription className="text-white/80">
              Purchase game lives, premium skins, subscriptions, and coins with Pi
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <PiPaymentShop />
          </div>
        </DialogContent>
      </Dialog>

      {/* Reserve Connect Modal */}
      <Dialog open={showReserveConnect} onOpenChange={setShowReserveConnect}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white p-0">
          <DialogHeader className="bg-gradient-to-r from-purple-500 to-blue-500 px-8 pt-8 pb-4 flex flex-col items-center">
            <DialogTitle className="text-white text-2xl font-bold">🎮 Reserve & Connect Flappy</DialogTitle>
            <DialogDescription className="text-white/80">
              Reserve your username and connect Flappy for cross-device synchronization
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <ReserveConnectPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Stream Panel Modal */}
      <Dialog open={showStreamPanel} onOpenChange={setShowStreamPanel}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white p-0">
          <DialogHeader className="bg-gradient-to-r from-red-500 to-orange-500 px-8 pt-8 pb-4 flex flex-col items-center">
            <DialogTitle className="text-white text-2xl font-bold">📺 Stream Your Gameplay</DialogTitle>
            <DialogDescription className="text-white/80">
              Live stream your gameplay to the community
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <StreamPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Pi Hide Panel Modal */}
      <Dialog open={showPiHidePanel} onOpenChange={setShowPiHidePanel}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white p-0">
          <DialogHeader className="bg-gradient-to-r from-gray-500 to-slate-500 px-8 pt-8 pb-4 flex flex-col items-center">
            <DialogTitle className="text-white text-2xl font-bold">🙈 Privacy Settings</DialogTitle>
            <DialogDescription className="text-white/80">
              Manage your privacy and leaderboard visibility
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <PiHidePanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dev Redeem Modal */}
      <Dialog open={showDevRedeem} onOpenChange={setShowDevRedeem}>
        <DialogContent className="max-w-md w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-yellow-50 via-white to-purple-50 px-8 pt-8 pb-4 flex flex-col items-center">
            <DialogTitle className="text-2xl font-bold text-purple-700 mb-1">Dev Redeem</DialogTitle>
            <DialogDescription className="text-gray-500 text-center mb-2">
              Instantly claim <b>1 Billion Flappy Coins</b> for your wallet.<br/>For development/testing only.
            </DialogDescription>
          </DialogHeader>
          <div className="px-8 pb-8">
            {devRedeemSuccess ? (
              <div className="flex flex-col items-center justify-center py-8">
                <span className="text-4xl mb-2">🎉</span>
                <div className="text-2xl font-bold text-green-700 mb-2">Success!</div>
                <div className="text-gray-600 text-center mb-2">1 Billion Flappy Coins have been added to your wallet.</div>
              </div>
            ) : (
              <>
                                  <div className="flex flex-col items-center justify-center py-8">
                    <span className="text-4xl mb-2">🛠️</span>
                    <div className="text-lg text-gray-700 mb-4">Are you sure you want to claim 1 Billion Flappy Coins?</div>
                  <input
                                    type="password"
                placeholder={t('enterPassword')}
                    value={devRedeemPassword}
                    onChange={e => setDevRedeemPassword(e.target.value)}
                    className="border rounded px-3 py-2 mb-4"
                  />
                  {devRedeemError && <div className="text-red-600 text-sm mb-4">{devRedeemError}</div>}
                                  <Button variant="default" size="lg" onClick={handleDevRedeem} className="w-full text-lg mb-2">{t('claimNow')}</Button>
                <Button variant="secondary" size="lg" onClick={() => setShowDevRedeem(false)} className="w-full text-lg">{t('cancel')}</Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      

      {/* Coming Soon Modal for Duels */}
      <ComingSoonModal
        isOpen={showDuelsComingSoon}
        onClose={() => setShowDuelsComingSoon(false)}
        feature="PvP Duels"
        description="Challenge friends in epic multiplayer battles!"
        expectedRelease="Q1 2024"
      />
      
      {showDuelsPage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowDuelsPage(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <DuelsPage />
          </div>
        </div>
      )}
      
      
      {showTestDuelsPage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowTestDuelsPage(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <TestDuelsPage />
          </div>
        </div>
      )}

      {showStandaloneDuelsPage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowStandaloneDuelsPage(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <StandaloneDuelsPage />
          </div>
        </div>
      )}

      {/* Next Season Modal */}
      <NextSeasonModal
        isOpen={showNextSeasonModal}
        onClose={() => setShowNextSeasonModal(false)}
        feature={nextSeasonFeature}
      />

      {/* FLPY Token Notification Modal */}
      <Dialog open={showFLPYModal} onOpenChange={setShowFLPYModal}>
        <DialogContent className="max-w-2xl w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-purple-50 via-white to-blue-50 px-8 pt-8 pb-4 flex flex-col items-center">
            <img src="/image-png.png" alt="FLPY Token" className="w-16 h-16 mb-2 rounded-full" onError={(e) => { e.currentTarget.src = '/flappycoins.png'; }} />
            <DialogTitle className="text-2xl font-bold text-purple-700 mb-1 text-center">
              FLPY Token is Here!
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-center mb-2">
              Flappy Pi has launched the <strong>FLPY DeFi Token</strong>!<br/>
              Test it now and earn future rewards.
            </DialogDescription>
            <div className="flex items-center gap-1 px-3 py-1 text-green-700 bg-green-100 border-green-200 rounded mb-2 text-xs font-semibold">
              🪙 FLPY Token Launch
            </div>
          </DialogHeader>
          <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-sm space-y-6">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Test on Pi Testnet</h3>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-2">
                <p className="text-blue-700 mb-2">
                  Check your <strong>Pi Wallet (Testnet mode)</strong> for the FLPY token.<br/>
                  Test transactions and explore DeFi features now!
                </p>
                <div className="bg-blue-100 rounded-lg p-2 text-xs text-blue-800">
                  <strong>Token Symbol:</strong> FLPY<br/>
                  <strong>Network:</strong> Pi Testnet<br/>
                  <strong>Status:</strong> Active & Testing
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-purple-800 mb-2">Mainnet Launch Rewards</h3>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 mb-2">
                <p className="text-purple-700 mb-2">
                  When FLPY launches on Pi Mainnet, <strong>skin purchasers will receive exclusive token airdrops and NFT rewards!</strong>
                </p>
                <ul className="text-xs text-purple-800 space-y-1 ml-4">
                  <li>• Exclusive FLPY token airdrops</li>
                  <li>• Limited edition Pi NFT rewards</li>
                  <li>• Early access to DeFi features</li>
                  <li>• VIP gaming benefits</li>
                </ul>
              </div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-gray-700 text-base font-medium">
                🚀 The future of Pi gaming and DeFi starts here!
              </p>
              <Button 
                onClick={() => {
                  handleFLPYNotificationDismiss('dismiss');
                  navigate('/shop');
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold shadow-lg"
              >
                🛒 Shop Skins Now
              </Button>
              <Button 
                onClick={() => handleFLPYNotificationDismiss('remind-later')}
                variant="outline" 
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 py-3 text-lg font-semibold"
              >
                ⏰ Remind Later
              </Button>
              <Button 
                onClick={() => handleFLPYNotificationDismiss('dismiss')}
                variant="ghost" 
                className="w-full text-gray-500 hover:text-gray-700 text-sm"
              >
                Don't show again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
