import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Pipe from './Pipe';
// WeatherEffect import removed - weather effects disabled
import './Pipe.css';
import GameOverModal from './GameOverModal';
import ReviveModal, { ReviveModalSubscription } from '../ReviveModal';
import SubscriptionPlansModal from '@/components/SubscriptionPlansModal';
import RewardModal from '@/components/RewardModal';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import Ground from './Ground';
import Background from './Background';
import Bird from './Bird';
import { getInterpolatedDifficulty } from '../../utils/difficultySystem';
import { useWallet } from '../../context/WalletContext';
import WalletBalance from '../WalletBalance';
import SubscriptionPromoModal from '@/components/SubscriptionPromoModal';
import { useInventory } from '@/hooks/useInventory';
import { subscriptionPlans } from '@/constants/subscriptionPlans';
import { useToast } from '@/hooks/use-toast';
import { useGameEquipment } from '@/hooks/useGameEquipment';
import { inventoryService } from '@/services/inventoryService';
import { isMobile } from '@/utils/browserDetection';
import FooterPowerupBar from './FooterPowerupBar';
import InventoryPage from '@/pages/InventoryPage';
import { shopItems } from '@/constants/shopItems';
import EnhancedRewardModal from '@/components/EnhancedRewardModal';
import { getPlanRewards, SubscriptionReward } from '@/constants/subscriptionRewards';
import { unifiedLeaderboardService } from '@/services/unifiedLeaderboardService';
import { LeaderboardEntry, ClassicModeSubmission, GameMode } from '@/types/leaderboard';
import { useRealTimeScoring } from '@/hooks/useRealTimeScoring';
import { ResponsiveGameContainer, ResponsiveGameArea } from './ResponsiveGrid';
import { useGlobalMusicContext } from '../../context/GlobalMusicContext';
import { checkAdNetworkSupport } from '../../utils/piAds';
import { useLanguage } from '../../context/LanguageContext';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';
import { useSettings } from '../../hooks/useSettings';
import { useGameHistory } from '@/hooks/useGameHistory';
import { useGameState } from '../../hooks/useGameState';
import { useSoundEffects } from '../../hooks/useSoundEffects';

import StarField from './StarField';
import ParticleSystem from './ParticleSystem';
import Bomb from './Bomb';
import { mobilePerformanceOptimizer } from '../../utils/mobilePerformanceOptimizer';






const BIRD_WIDTH = 64;
const BIRD_HEIGHT = 64;
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_WIDTH = BIRD_WIDTH;
const PIPE_HEIGHT = 320;
const PIPE_CAP_HEIGHT = 24;
const GAME_WIDTH = 480;
const GAME_HEIGHT = 800;
const COIN_SIZE = 48;
const BOMB_SIZE = 32;
const BOMB_SPAWN_INTERVAL = 3000; // Spawn bomb every 3 seconds
const BOMB_FALL_SPEED = 2;
const BG_IMAGES = [
  '/background/background_grass.png',
'/background/background_ice.png',
'/background/background_land.png',
'/background/background_lava.png',
'/background/background_rock.png',
'/background/background_dessert.png',
];

const FOOTER_HEIGHT = 56; // px, match FooterPowerupBar
const MOBILE_FOOTER_HEIGHT = 64; // px, for extra safety on mobile
const GROUND_HEIGHT = 64; // px, matches the height used for ground in the render
const SAND_HEIGHT = 32; // px, sand layer height
const TOTAL_GROUND_HEIGHT = GROUND_HEIGHT + SAND_HEIGHT; // Total ground system height

const getRandomPipeY = (gap, height) => {
  const minGapY = 60; // Increased minimum gap position
  const mobileHeight = isMobile ? window.innerHeight - 120 : height; // Account for mobile layout
  const availableHeight = mobileHeight - GROUND_HEIGHT - 32; // More buffer space
  const maxGapY = availableHeight - gap - 32; // Ensure gap fits with buffer
  
  // Safety check to prevent invalid positions
  if (maxGapY <= minGapY) {
    console.warn('⚠️ Pipe gap too large for screen, using safe fallback');
    return Math.floor(availableHeight / 2); // Center position as fallback
  }
  
  return Math.floor(Math.random() * (maxGapY - minGapY + 1)) + minGapY;
};
const getRandomCoinY = () => Math.floor(Math.random() * (GAME_HEIGHT - 200)) + 80;

// Function to validate pipe positions and prevent overlapping
const validatePipePosition = (pipes, newPipe) => {
  const minDistance = 300; // Minimum distance between pipes
  
  for (const existingPipe of pipes) {
    const distance = Math.abs(existingPipe.x - newPipe.x);
    if (distance < minDistance) {
      return false; // Too close to existing pipe
    }
  }
  
  return true; // Safe position
};

// Sound effects are now handled by useSoundEffects hook

// PipePair component
interface PipePairProps {
  x: number;
  color: string;
  effect: string;
}
const PipePair: React.FC<PipePairProps> = ({ x, color, effect }) => (
  <>
    <Pipe x={x} isTop={true} height={PIPE_HEIGHT} color={color} effect={effect} />
    <Pipe x={x} isTop={false} height={PIPE_HEIGHT} color={color} effect={effect} />
  </>
);

interface ClassicModeProps {
  mode?: 'classic' | 'endless' | 'challenge' | 'flappy-stack';
  challenge?: any; // Accepts challenge object for challenge mode
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  continueGameRef?: React.MutableRefObject<(() => void) | null>;
  onGameOver?: (score: number) => void;
  onCollision?: () => void;
  hideStartScreen?: boolean; // Hide the start screen overlay
  hideChallengeUI?: boolean; // Hide challenge-specific UI overlays
  customProps?: any; // For passing custom props like stackMode
}

const THEME_MAP = {
  classic: { theme: 'morning', pipe: '/assets/pipe.png' },
  endless: { theme: 'night', pipe: null },
  challenge: { theme: 'lava', pipe: '/assets/pipe_red.png' },
  'flappy-stack': { theme: 'morning', pipe: '/assets/pipe.png' },
};

const themeColorMap = {
  classic: '#4CAF50',
  bamboo: '#A3D977',
  neon: '#BB86FC',
  fire: '#FF5722',
  ice: '#80DEEA',
  challenge: '#78909c',
  endless: '#A259E6',
};
const themeEffectMap = {
  classic: '',
  bamboo: '',
  neon: 'glow',
  fire: 'fire',
  ice: 'ice',
  challenge: 'rain',
  endless: 'glow',
};

const birdSkins = {
  classic: "/birds2/bird_0.gif",
red: "/birds2/bird_1.gif",
blue: "/birds2/bird_2.gif",
yellow: "/birds2/bird_3.gif",
green: "/birds2/bird_4.gif",
purple: "/birds2/bird_5.gif",
pink: "/birds2/bird_6.gif",
orange: "/birds2/bird_7.gif",
cyan: "/birds2/bird_8.gif",
magenta: "/birds2/bird_9.gif",
dragon: "/birds2/bird_10.gif",
gold: "/birds2/bird_11.gif",
inferno_phoenix: "/birds2/bird_12.gif",
};

// Pipe image paths (now in public/pipe/)
const pipeTopImg = "/pipe/pipe-top.png";
const pipeBottomImg = "/pipe/pipe-bottom.png";

// Map modes to backgrounds and weather
const modeBackgroundMap = {
  classic: '/background/background_grass.png',
endless: '/background/background_land.png',
challenge: '/background/background_lava.png',
};
const modeWeatherMap = {
  classic: null,
  endless: null,
  challenge: 'rain',
  ice: 'snow',
  rock: null,
  dessert: null,
};

// Real-time background logic
function getTimeOfDay(mode = 'classic') {
  if (mode === 'classic') return 'morning'; // Always morning for classic mode
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

const MIN_PIPE_GAP = 160; // Minimum gap size for all levels (wider for easier play)

// Update getPipeGap to always use at least MIN_PIPE_GAP
const getPipeGap = (score, mode = 'classic') => {
  if (mode === 'endless') {
    // Make the gap much larger for endless mode
    return 240;
  }
  if (score < 10) return 200; // Even easier for first 10 points
  if (score < 25) return 160; // Medium
  return MIN_PIPE_GAP; // Hard, but never less than MIN_PIPE_GAP
};

// Function to get number of pipes based on level
const getPipeCount = (score, mode = 'classic') => {
  const level = Math.floor(score / 5) + 1;
  if (mode === 'endless') {
    return Math.min(8, 3 + Math.floor(level / 2)); // 3-8 pipes for endless
  }
  return Math.min(6, 2 + Math.floor(level / 3)); // 2-6 pipes for classic
};

// Function to generate pipes at far end of treadmill
const generateTreadmillPipes = (score, mode = 'classic') => {
  const pipeCount = getPipeCount(score, mode);
  const pipes = [];
  const baseDistance = GAME_WIDTH + 300; // Start even further from screen
  const spacing = 500; // Increased distance between pipes for safety
  
  for (let i = 0; i < pipeCount; i++) {
    const gap = getPipeGap(score, mode);
    let gapY = getRandomPipeY(gap, GAME_HEIGHT);
    
    // Validate gap position to prevent overlapping
    const minGapY = 60;
    const maxGapY = GAME_HEIGHT - gap - GROUND_HEIGHT - 32;
    
    if (gapY < minGapY) gapY = minGapY;
    if (gapY > maxGapY) gapY = maxGapY;
    
    const newPipe = {
      x: baseDistance + (i * spacing),
      gapY: gapY
    };
    
    // Validate pipe position to prevent overlapping
    if (validatePipePosition(pipes, newPipe)) {
      pipes.push(newPipe);
    } else {
      // If too close, place it further away
      newPipe.x += 200;
      pipes.push(newPipe);
    }
  }
  
  console.log(`🔧 Generated ${pipeCount} pipes with spacing ${spacing}px`);
  return pipes;
};

const getPipeSpeed = (score, mode = 'classic') => {
  // Level is based on score, e.g. every 5 points is a new level
  const level = Math.floor(score / 5) + 1;
  let base = 4;
  let levelFactor = 0.18; // how much each level increases speed
  let scoreFactor = 0.03; // how much each score increases speed
  let maxSpeed = 9;

  if (mode === 'endless') {
    base = 4.5;
    levelFactor = 0.22;
    scoreFactor = 0.04;
    maxSpeed = 11;
  } else if (mode === 'challenge') {
    base = 5;
    levelFactor = 0.20;
    scoreFactor = 0.035;
    maxSpeed = 10;
  }

  // Use the same logic for all platforms (no desktop/mobile difference)
  let speed = base + (level * levelFactor) + (score * scoreFactor);
  if (speed > maxSpeed) speed = maxSpeed;
  return speed;
};

// Update getRandomCoinSpawn to keep coins in the center for first 10 levels
const getRandomCoinSpawn = (gapY, gap, gameWidth, gameHeight, score = 0) => {
  const level = Math.floor(score / 5) + 1;
  let coinY;
  if (level <= 10) {
    coinY = gapY + gap / 2 - COIN_SIZE / 2;
  } else {
    const centerRange = gap * 0.4;
    coinY = gapY + gap / 2 - centerRange / 2 + Math.random() * centerRange;
  }
  return { x: gameWidth + 80, y: coinY, phase: Math.random() * Math.PI * 2 };
};

// Move these above ClassicMode:
const levelThemes = [
  { bg: "linear-gradient(to bottom, #aeefff, #fffbe0)", effect: null, label: "Morning", scene: 'morning' },
  { bg: "linear-gradient(to bottom, #ffd580, #ffefba)", effect: "sunrise", label: "Sunrise", scene: 'sunrise' },
  { bg: "linear-gradient(to bottom, #fffbe0, #ffe082)", effect: "sunlight", label: "Sunlight", scene: 'sunlight' },
  { bg: "linear-gradient(to bottom, #fbc2eb, #a6c1ee)", effect: "beach", label: "Beach", scene: 'beach' },
  { bg: "linear-gradient(to bottom, #f7971e, #ffd200, #ffe082)", effect: "desert", label: "Desert", scene: 'desert' },
  { bg: "linear-gradient(to bottom, #e0eafc, #cfdef3)", effect: "snow", label: "Snow", scene: 'snow' },
  { bg: "linear-gradient(to bottom, #ff512f, #dd2476)", effect: "lava", label: "Lava", scene: 'lava' },
  { bg: "linear-gradient(to bottom, #f8ffae, #43cea2, #185a9d)", effect: "rainbow", label: "Rainbow", scene: 'rainbow' },
  { bg: "linear-gradient(to bottom, #232526, #414345)", effect: "storm", label: "Storm", scene: 'storm' },
  { bg: "linear-gradient(to bottom, #ffd700, #fffbe0)", effect: "sunny", label: "Sunny", scene: 'sunny' },
  { bg: "linear-gradient(to bottom, #4fc3f7, #81d4fa)", effect: "rainy", label: "Rainy", scene: 'rainy' },
  { bg: "linear-gradient(to bottom, #b6c6e5, #e3e3e3)", effect: "winter", label: "Winter", scene: 'winter' },
  { bg: "linear-gradient(to bottom, #232526, #0f2027)", effect: "thunder", label: "Thunder", scene: 'thunder' },
  { bg: "linear-gradient(to bottom, #43cea2, #185a9d)", effect: "garden", label: "Garden", scene: 'garden' },
  { bg: "linear-gradient(to bottom, #e96443, #904e95)", effect: "mars", label: "Mars", scene: 'mars' },
  { bg: "linear-gradient(to bottom, #f7971e, #ffd200, #43cea2)", effect: "jupiter", label: "Jupiter", scene: 'jupiter' },
  { bg: "linear-gradient(to bottom, #232526, #414345, #0f2027)", effect: "space", label: "Space", scene: 'space' },
  { bg: "linear-gradient(to bottom, #a8edea, #fed6e3)", effect: "planet", label: "Planet", scene: 'planet' },
];
const getThemeByLevel = (level) => levelThemes[(level - 1) % levelThemes.length];
const getUserLevel = (score) => Math.floor(score / 5) + 1;
const TapToStartOverlay = ({ birdSkin, forRevive, onStart, t }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Sound handled by useSoundEffects hook
    if (onStart) {
      onStart();
    }
  };

  const handleTouch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Sound handled by useSoundEffects hook
    if (onStart) {
      onStart();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.10)',
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto', // Fix: allow overlay to receive pointer events
        cursor: 'pointer',
      }}
      onClick={handleClick}
      onTouchStart={handleTouch}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 900,
          color: '#fff',
          textShadow: '3px 3px 0 #000, 6px 6px 12px rgba(0,0,0,0.7)',
          letterSpacing: 1.5,
          padding: '12px 32px',
          borderRadius: 16,
          background: 'rgba(0,0,0,0.10)',
          pointerEvents: 'none', // Only the overlay is clickable
        }}
      >
        {forRevive ? t('tapToContinue') : t('tapToStart')}
      </div>
      {!forRevive && <p className="text-white text-lg mt-2" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)', pointerEvents: 'none' }}>Tap anywhere to make Flappy fly!</p>}
    </div>
  );
};

// Modern WiFi Signal Icon
const WifiSignalIcon = ({ quality = 'good', size = 22 }) => {
  let color = 'green';
  if (quality === 'slow') color = 'orange';
  if (quality === 'offline') color = 'red';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer arc */}
      <path d="M2.5 10.5a13 13 0 0 1 19 0" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Middle arc */}
      <path d="M6 14a8.5 8.5 0 0 1 12 0" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Inner arc */}
      <path d="M9.5 17.5a4 4 0 0 1 5 0" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Dot */}
      <circle cx="12" cy="20" r="1.5" fill={color} />
    </svg>
  );
};

const ClassicMode: React.FC<ClassicModeProps> = ({ mode = 'classic', challenge, musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled, continueGameRef, onGameOver, onCollision, hideStartScreen = false, hideChallengeUI = false }) => {
  // Add safety checks for undefined variables
  const safeChallenge = challenge || null;
  const safeMode = mode || 'classic';
  const navigate = useNavigate();
  const { profile, updateProfile, refreshProfile } = useUserProfile();
  const { balance, addCoins, spendCoins, refreshBalance } = useWallet();
  const { addItem } = useInventory();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { stopMusic } = useGlobalMusicContext();
  const {
    equippedSkin,
    availablePowerUps, // This is the dynamic one with quantities
    activatePowerUp,
    useExtraLife,
    getPowerUpStatus,
    isPowerUpActive,
    getActiveEffects,
    refreshEquipment,
    resetGameSession,
    validatePowerUpUsage
  } = useGameEquipment();
  

  
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [gameSessionId, setGameSessionId] = useState<string | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const { recordGameSession } = useGameHistory();
  
  // Real-time scoring integration
  const {
    startGameSession,
    updateScore: updateRealTimeScore,
    addCoinsEarned,
    addAchievement,
    handleGameOver: handleRealTimeGameOver,
    getSessionInfo
  } = useRealTimeScoring();
  const gameState = useGameState();
  const { playWingFlap, playPoint, playHit, playDie, playSwoosh, soundEnabled: soundEffectsEnabled, initializeGameSounds } = useSoundEffects(soundEnabled);

  // Initialize sound effects
  useEffect(() => {
    initializeGameSounds();
    console.log('🔊 Sound effects initialized:', {
      externalSoundEnabled: soundEnabled,
      internalSoundEnabled: soundEffectsEnabled,
      finalSoundEnabled: soundEffectsEnabled
    });
  }, [initializeGameSounds, soundEnabled, soundEffectsEnabled]);

  // Memoize activeEffects to avoid unnecessary re-renders
  const activeEffects = React.useMemo(() => {
    try {
      return getActiveEffects();
    } catch (error) {
      console.error('Error in getActiveEffects:', error);
      return {
        hasShield: false,
        hasMagnet: false,
        hasExtraLife: false,
        hasCoinMultiplier: false,
        hasTurbo: false,
        coinMultiplier: 1,
        gameSpeed: 1
      };
    }
  }, [getActiveEffects]);

  // Get equipped bird skin image using inventoryService if available
  const birdImg = getBirdImageSrc(equippedSkin);
  const resolvedBirdImg = birdImg;
  


  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0); // <-- Add this line
  const [coinPos, setCoinPos] = useState({ x: GAME_WIDTH + 300, y: 200, phase: Math.random() * Math.PI * 2 });
  const [showRevive, setShowRevive] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showReviveModal, setShowReviveModal] = useState(false);
  
  // Add countdown state for 3-second delay before pipes appear
  const [countdown, setCountdown] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [pipesActive, setPipesActive] = useState(false);
  
  // Modal state setters
  const setShowGameOverModalWithDebug = (show: boolean) => {
    setShowGameOverModal(show);
  };
  
  const setShowReviveModalWithDebug = (show: boolean) => {
    setShowReviveModal(show);
  };
  const [showTapToStart, setShowTapToStart] = useState(true);
  const [showTapToContinue, setShowTapToContinue] = useState(false);
  const [reviveCancelCount, setReviveCancelCount] = useState(0);
  const [reviveCount, setReviveCount] = useState(0); // Track total revives used in this game
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [adWatchedThisRevive, setAdWatchedThisRevive] = useState(false);
  const [showSubscriptionPromo, setShowSubscriptionPromo] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardItem, setRewardItem] = useState(null);
  const [pendingRewards, setPendingRewards] = useState<SubscriptionReward[]>([]);
  const [planJustExpired, setPlanJustExpired] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = React.useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);

  // Game session tracking
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [gameStats, setGameStats] = useState({
    pipesPassed: 0,
    coinsCollected: 0,
    powerUpsActivated: 0,
    distanceTraveled: 0,
  });
  const [powerUpsUsed, setPowerUpsUsed] = useState<string[]>([]);

  // Bomb state for Challenge Time Bomb mode
  const [bombs, setBombs] = useState<Array<{
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    exploded: boolean;
  }>>([]);
  const [bombIdCounter, setBombIdCounter] = useState(0);
  const [bombSpawnTimer, setBombSpawnTimer] = useState(0);

  // Powerup states
  const [activePowerUps, setActivePowerUps] = useState<{ [key: string]: any }>({});
  const [isInvincible, setIsInvincible] = useState(false);
  const [coinMultiplier, setCoinMultiplier] = useState(1);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [magnetActive, setMagnetActive] = useState(false);
  const [extraLives, setExtraLives] = useState(0);
  const [powerUpActivationEffect, setPowerUpActivationEffect] = useState<string | null>(null);
  
  // Enhanced power-up states
  const [shieldActive, setShieldActive] = useState(false);
  const [turboActive, setTurboActive] = useState(false);
  const [powerUpGlow, setPowerUpGlow] = useState<string | null>(null);
  const [powerUpParticles, setPowerUpParticles] = useState<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
    size: number;
    type: 'sparkle' | 'trail' | 'burst';
  }>>([]);
  const [powerUpTimers, setPowerUpTimers] = useState<{ [key: string]: number }>({});
  const [powerUpActivationTime, setPowerUpActivationTime] = useState<number>(0);
  const [powerUpSoundEffects, setPowerUpSoundEffects] = useState<{ [key: string]: boolean }>({});
  const [powerUpCombo, setPowerUpCombo] = useState<number>(0);
  const [powerUpComboTimer, setPowerUpComboTimer] = useState<number>(0);
  const [powerUpNotification, setPowerUpNotification] = useState<string | null>(null);

  // Game refs (bird, pipes, etc.)
  const gameRef = useRef<HTMLDivElement>(null);

  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [birdVel, setBirdVel] = useState(0);
  // Pipes state: each entry is a pair (x, gapY)
  type Pipe = { x: number; gapY: number; height?: number };
  const [pipes, setPipes] = useState<Pipe[]>(generateTreadmillPipes(score, safeMode));

  // Add theme state
  const [currentTheme, setCurrentTheme] = useState(THEME_MAP[mode].theme);
  const PIPE_IMAGE = THEME_MAP[mode].pipe;

  const currentColor = themeColorMap[mode];
  const currentEffect = themeEffectMap[mode];

  // Determine background and weather for current mode
  const weather = modeWeatherMap[mode] || null;

  // Add reviveUsed state
  const [reviveUsed, setReviveUsed] = useState(false);

  // Time of day state
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  // Set time of day based on real time, but always 'morning' for classic
  useEffect(() => {
    if (mode === 'classic') setTimeOfDay('morning');
    else if (mode === 'endless') setTimeOfDay('night');
    else {
      const hour = new Date().getHours();
      if (hour < 12) setTimeOfDay('morning');
      else if (hour < 18) setTimeOfDay('afternoon');
      else if (hour < 21) setTimeOfDay('evening');
      else setTimeOfDay('night');
    }
  }, [mode]);

  // On initial load, show tap to start
  useEffect(() => {
    setShowTapToStart(true);
  }, []);

  // Note: Removed auto-add test powerups feature to ensure proper reset functionality

  // Add state to track multiple coins
  const [coins, setCoins] = useState<Array<{
    id: number;
    x: number;
    y: number;
    phase: number;
    collected: boolean;
    value: number;
    scale?: number;
    rotation?: number;
    isGoldRush?: boolean;
  }>>([
    // Initial coins - spawn more coins at the start
    { 
      id: 1, 
      x: GAME_WIDTH + 200, 
      y: 150, 
      phase: Math.random() * Math.PI * 2,
      collected: false,
      value: 1,
      scale: 1,
      rotation: 0
    },
    { 
      id: 2, 
      x: GAME_WIDTH + 350, 
      y: 250, 
      phase: Math.random() * Math.PI * 2,
      collected: false,
      value: 1,
      scale: 1,
      rotation: 0
    },
    { 
      id: 3, 
      x: GAME_WIDTH + 500, 
      y: 180, 
      phase: Math.random() * Math.PI * 2,
      collected: false,
      value: 1,
      scale: 1,
      rotation: 0
    }
  ]);

  // Add ref for coins to avoid stale closure issues
  const coinsRef = useRef(coins);
  
  // Enhanced Random Gold Rush System
  const [goldRushActive, setGoldRushActive] = useState(false);
  const [goldRushType, setGoldRushType] = useState<'coin_rain' | 'mega_coins' | 'golden_pipes' | 'treasure_hunt' | null>(null);
  const [goldRushTimer, setGoldRushTimer] = useState(0);
  const [goldRushMultiplier, setGoldRushMultiplier] = useState(1);
  
  // Random Gold Rush Trigger Function
  const triggerRandomGoldRush = () => {
    if (goldRushActive) return; // Don't trigger if already active
    
    const goldRushTypes = ['coin_rain', 'mega_coins', 'golden_pipes', 'treasure_hunt'];
    const randomType = goldRushTypes[Math.floor(Math.random() * goldRushTypes.length)] as any;
    
    setGoldRushActive(true);
    setGoldRushType(randomType);
    setGoldRushTimer(15); // 15 seconds duration
    setGoldRushMultiplier(randomType === 'mega_coins' ? 5 : randomType === 'coin_rain' ? 3 : 2);
    
    console.log('🎉 RANDOM GOLD RUSH TRIGGERED:', randomType);
    
    // Create gold rush coins based on type
    const newGoldRushCoins = [];
    let coinCount = 0;
    let coinValue = 1;
    
    switch (randomType) {
      case 'coin_rain':
        coinCount = 8 + Math.floor(Math.random() * 5); // 8-12 coins
        coinValue = 2;
        setGoldRushText(`💰 COIN RAIN! ${coinCount} coins ahead!`);
        break;
      case 'mega_coins':
        coinCount = 5 + Math.floor(Math.random() * 4); // 5-8 coins
        coinValue = 5;
        setGoldRushText(`💎 MEGA COINS! ${coinCount} coins ahead!`);
        break;
      case 'golden_pipes':
        coinCount = 6 + Math.floor(Math.random() * 4); // 6-9 coins
        coinValue = 3;
        setGoldRushText(`🏆 GOLDEN PIPES! ${coinCount} coins ahead!`);
        break;
      case 'treasure_hunt':
        coinCount = 4 + Math.floor(Math.random() * 3); // 4-6 coins
        coinValue = 4;
        setGoldRushText(`🗺️ TREASURE HUNT! ${coinCount} coins ahead!`);
        break;
    }
    
    // Create coins in a line formation
    const coinSpacing = 80;
    const startX = GAME_WIDTH + 50;
    const centerY = GAME_HEIGHT / 2;
    
    for (let i = 0; i < coinCount; i++) {
      newGoldRushCoins.push({
        id: Date.now() + i + Math.random() * 1000,
        x: startX + (i * coinSpacing),
        y: centerY + (Math.random() - 0.5) * 60,
        value: coinValue,
        isGoldRush: true,
        phase: Math.random() * Math.PI * 2,
        collected: false,
        scale: 1.2,
        rotation: 0
      });
    }
    
    setCoins(prevCoins => [...prevCoins, ...newGoldRushCoins]);
    setGoldRushCoins(coinCount);
    setShowGoldRush(true);
    
    // Play gold rush sound
    if (soundEffectsEnabled) {
      // Sound handled by useSoundEffects hook
    }
    
    // Show notification
    toast({
      title: `🎉 ${randomType.toUpperCase().replace('_', ' ')}!`,
      description: `${coinCount} special coins worth ${coinValue}x each!`,
      duration: 4000
    });
    
    // Hide gold rush text after 2 seconds
    setTimeout(() => {
      setShowGoldRush(false);
    }, 2000);
    
    // End gold rush after 15 seconds
    setTimeout(() => {
      setGoldRushActive(false);
      setGoldRushType(null);
      setGoldRushTimer(0);
      setGoldRushMultiplier(1);
      console.log('🎉 Gold rush ended');
    }, 15000);
  };
  
  // Add ref for coins to avoid stale closure issues
  // coinsRef is already declared above
  
  const coinSpawnTimer = useRef<NodeJS.Timeout | null>(null);

  // Add state to track coins left in the current level
  const [coinsLeftThisLevel, setCoinsLeftThisLevel] = useState(3 + Math.floor(Math.random() * 2)); // 3 or 4

  // --- Enhanced Powerup Effect Management ---
  useEffect(() => {
    setActivePowerUps(activeEffects);
    setIsInvincible(!!activeEffects.hasShield);
    setCoinMultiplier(activeEffects.hasCoinMultiplier ? activeEffects.coinMultiplier || 1 : 1);
    setMagnetActive(!!activeEffects.hasMagnet);
    
    // FIXED: Improved extra lives calculation with better inventory sync
    let extraLifeCount = 0;
    
    // Method 1: Check availablePowerUps from useGameEquipment (most reliable)
    if (Array.isArray(availablePowerUps)) {
      const extraLifePowerUp = availablePowerUps.find(p => p.id === 'extra_life');
      if (extraLifePowerUp && extraLifePowerUp.quantity > 0) {
        extraLifeCount += extraLifePowerUp.quantity;
      }
    }
    
    // Method 2: Check inventory service directly (fallback)
    try {
      const inventory = inventoryService.getInventory();
      const inventoryExtraLives = inventory.filter(item => 
        item.id === 'extra_life' && item.type === 'powerup' && item.quantity > 0
      );
      extraLifeCount += inventoryExtraLives.reduce((sum, item) => sum + (item.quantity || 0), 0);
    } catch (error) {
      // Could not check inventory service for extra lives
    }
    
    // Method 3: Check profile's owned_power_ups (fallback)
    if (profile && profile.owned_power_ups && profile.owned_power_ups.extra_life) {
      extraLifeCount += profile.owned_power_ups.extra_life;
    }
    
    // Method 4: Fallback to activeEffects (last resort)
    if (extraLifeCount === 0 && activeEffects.hasExtraLife) {
      extraLifeCount = 1;
    }
    

    
    setExtraLives(extraLifeCount);
  }, [activeEffects, availablePowerUps, profile]);

  // FIXED: Add effect to refresh equipment when inventory updates
  useEffect(() => {
    const handleInventoryUpdate = (event: CustomEvent) => {
      refreshEquipment();
    };

    const handlePowerUpPurchased = (event: CustomEvent) => {
      refreshEquipment();
    };

    window.addEventListener('inventory-updated', handleInventoryUpdate);
    window.addEventListener('power-up-purchased', handlePowerUpPurchased as EventListener);
    
    return () => {
      window.removeEventListener('inventory-updated', handleInventoryUpdate);
      window.removeEventListener('power-up-purchased', handlePowerUpPurchased as EventListener);
    };
  }, [refreshEquipment]);

  // Power-up timer system with visual progression - OPTIMIZED
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let notificationTimeouts: NodeJS.Timeout[] = [];
    
    const cleanup = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      notificationTimeouts.forEach(timeout => clearTimeout(timeout));
      notificationTimeouts = [];
    };
    
    interval = setInterval(() => {
      const now = Date.now();
      setPowerUpTimers(prev => {
        const newTimers = { ...prev };
        let hasChanges = false;
        
        Object.keys(newTimers).forEach(timerId => {
          if (newTimers[timerId] <= now) {
            // Power-up expired - return bird to normal state
            switch (timerId) {
              case 'shield':
                setShieldActive(false);
                setIsInvincible(false);
                setPowerUpNotification('🛡️ Shield expired - normal collision behavior restored!');
                const shieldTimeout = setTimeout(() => setPowerUpNotification(null), 3000);
                notificationTimeouts.push(shieldTimeout);
                break;
              case 'magnet':
                setMagnetActive(false);
                setPowerUpNotification('🧲 Magnet expired - normal coin behavior restored!');
                const magnetTimeout = setTimeout(() => setPowerUpNotification(null), 3000);
                notificationTimeouts.push(magnetTimeout);
                break;
              case 'coin_multiplier':
                setCoinMultiplier(1);
                setPowerUpNotification('💰 Coin multiplier expired - normal coin value restored!');
                const coinTimeout = setTimeout(() => setPowerUpNotification(null), 3000);
                notificationTimeouts.push(coinTimeout);
                break;
              case 'turbo_start':
                setTurboActive(false);
                setSpeedMultiplier(1);
                setScoreMultiplier(1);
                setPowerUpNotification('⚡ Turbo expired - normal speed restored!');
                const turboTimeout = setTimeout(() => setPowerUpNotification(null), 3000);
                notificationTimeouts.push(turboTimeout);
                break;
            }
            delete newTimers[timerId];
            hasChanges = true;
            
            // Show expiration notification
            toast({
              title: `${getPowerUpName(timerId)} Expired!`,
              description: timerId === 'turbo_start' 
                ? `${getPowerUpName(timerId)} effect has worn off. Score multiplier reset to normal.`
                : `${getPowerUpName(timerId)} effect has worn off.`,
              duration: 2000,
            });
          }
        });
        
        return hasChanges ? newTimers : prev;
      });
    }, 1000);
    
    return cleanup;
  }, []);
  
  // Particle animation system - OPTIMIZED
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let rafId: number | null = null;
    
    const animateParticles = () => {
      setPowerUpParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 0.02,
          size: particle.size * 0.98
        })).filter(particle => particle.life > 0)
      );
      rafId = requestAnimationFrame(animateParticles);
    };
    
    // Use requestAnimationFrame for better performance
    rafId = requestAnimationFrame(animateParticles);
    
    return () => {
      if (interval) clearInterval(interval);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // --- Enhanced Coin Magnet Logic - OPTIMIZED ---
  useEffect(() => {
    if (!magnetActive) return;
    
    let rafId: number | null = null;
    let lastUpdate = 0;
    
    const animateMagnet = (currentTime: number) => {
      // Throttle to 60 FPS for better performance
      if (currentTime - lastUpdate < 16) {
        rafId = requestAnimationFrame(animateMagnet);
        return;
      }
      lastUpdate = currentTime;
      
      setCoins(currentCoins => 
        currentCoins.map(coin => {
          if (coin.collected) return coin;
          
          const birdX = isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08;
          const birdYCenter = birdY + BIRD_HEIGHT / 2;
          const dx = coin.x - birdX;
          const dy = coin.y - birdYCenter;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const magnetRadius = 150; // Increased radius
          
          if (dist < magnetRadius && dist > 8) {
            // Enhanced magnet effect with variable strength based on distance
            const magnetStrength = Math.max(0.1, 1 - (dist / magnetRadius));
            const moveX = dx * magnetStrength * 0.25;
            const moveY = dy * magnetStrength * 0.25;
            
            // Add magnet particles for visual effect (reduced frequency)
            if (Math.random() < 0.05) { // Reduced from 0.1 to 0.05
              setPowerUpParticles(prev => [...prev, {
                x: coin.x,
                y: coin.y,
                vx: -moveX * 2,
                vy: -moveY * 2,
                color: '#22d3ee',
                life: 0.5,
                size: Math.random() * 8 + 4,
                type: 'trail'
              }]);
            }
            
            return { ...coin, x: coin.x - moveX, y: coin.y - moveY };
          }
          return coin;
        })
      );
      
      rafId = requestAnimationFrame(animateMagnet);
    };
    
    rafId = requestAnimationFrame(animateMagnet);
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [magnetActive, birdY]);

  // --- Turbo Start Logic - OPTIMIZED ---
  useEffect(() => {
    if (!activePowerUps['turbo_start']) return;
    
    let timer: NodeJS.Timeout | null = null;
    
    // Apply turbo effect when powerup is activated
    setSpeedMultiplier(2); // Double speed
    
    // Set a timer to deactivate turbo after duration
    timer = setTimeout(() => {
      setSpeedMultiplier(1);
    }, 12000); // 12 seconds turbo effect (matches useGameEquipment duration)
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [activePowerUps['turbo_start']]); // Trigger when turbo powerup changes

  // Clear effects on game restart
  const handleRestart = () => {
    setGamesPlayed(g => g + 1); // Increment games played on new game
    setBirdY(GAME_HEIGHT / 2);
    setBirdVel(0);
    setPipes(generateTreadmillPipes(score, safeMode));
    setScore(0);
    setCoinPos({ x: GAME_WIDTH + 300, y: 200, phase: Math.random() * Math.PI * 2 });
    setGameStarted(false);
    setGameOver(false);
    setShowGameOverModal(false);
    setShowTapToStart(true);
    setReviveCancelCount(0); // reset on new game
    setReviveCount(0); // Reset revive count to start fresh at 10 coins
    setCoinsCollected(0); // <-- Reset coins collected for new fly
    
    // Reset countdown and pipe states
    setCountdown(0);
    setShowCountdown(false);
    setPipesActive(false);
    
    // Clear all power-up effects properly
    setShieldActive(false);
    setMagnetActive(false);
    setTurboActive(false);
    setCoinMultiplier(1);
    setSpeedMultiplier(1);
    setScoreMultiplier(1);
    setExtraLives(0);
    setPowerUpTimers({});
    setPowerUpParticles([]);
    setPowerUpGlow(null);
    setPowerUpActivationEffect(null);
    setPowerUpNotification(null);
    
    // Clear active powerup effects
    refreshEquipment();
  };

  // Enhanced power-up activation with better visual effects
  const handleActivatePowerup = async (powerUpId: string) => {
    
    // Check if power-up is actually available
    const availablePowerUp = availablePowerUps.find(p => p.id === powerUpId);
    if (!availablePowerUp || availablePowerUp.quantity <= 0) {
      if (settings.gameNotifications) {
        toast({
          title: '❌ Power-up Unavailable',
          description: 'This power-up is not available or has been used up.',
          duration: 3000
        });
      }
      return;
    }
    
    const success = await activatePowerUp(powerUpId);
    if (success) {
      // Enhanced activation effects
      setPowerUpActivationEffect(powerUpId);
      setPowerUpGlow(powerUpId);
      setPowerUpActivationTime(Date.now());
      
      // Add haptic feedback for mobile devices
      if (navigator.vibrate && isMobile()) {
        navigator.vibrate([50, 50, 100]); // Short vibration pattern
      }
      
      // Play power-up activation sound
      playPowerUpSound(powerUpId);
      
      // Create enhanced particle effects
      const birdX = isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08;
      const birdYCenter = birdY + BIRD_HEIGHT / 2;
      const particles = [];
      
      // Create different particle types based on power-up
      const particleConfig = getPowerUpParticleConfig(powerUpId);
      
      for (let i = 0; i < particleConfig.count; i++) {
        particles.push({
          x: birdX + BIRD_WIDTH / 2,
          y: birdYCenter,
          vx: (Math.random() - 0.5) * particleConfig.speed,
          vy: (Math.random() - 0.5) * particleConfig.speed,
          color: particleConfig.color,
          life: 1.0,
          size: Math.random() * particleConfig.sizeRange + particleConfig.minSize,
          type: particleConfig.type
        });
      }
      setPowerUpParticles(particles);
      
      // Set power-up specific effects with enhanced durations
      switch (powerUpId) {
        case 'shield':
          // Use the equipment system's activatePowerUp function
          try {
            await activatePowerUp('shield');
            setShieldActive(true);
            setPowerUpTimers(prev => ({ ...prev, shield: Date.now() + 15000 })); // Increased duration
            createShieldActivationEffect();
          } catch (error) {
            // Fallback to local activation
            setShieldActive(true);
            setPowerUpTimers(prev => ({ ...prev, shield: Date.now() + 15000 }));
            createShieldActivationEffect();
          }
          break;
        case 'magnet':
          setMagnetActive(true);
          setPowerUpTimers(prev => ({ ...prev, magnet: Date.now() + 20000 })); // Increased duration
          createMagnetActivationEffect();
          break;
        case 'coin_multiplier':
          setCoinMultiplier(2);
          setPowerUpTimers(prev => ({ ...prev, coin_multiplier: Date.now() + 25000 })); // Increased duration
          createCoinMultiplierActivationEffect();
          break;
        case 'turbo_start':
          setTurboActive(true);
          setSpeedMultiplier(1.8); // Increased speed boost
          setScoreMultiplier(2); // Double score when turbo is active
          setPowerUpTimers(prev => ({ ...prev, turbo_start: Date.now() + 18000 })); // Increased duration
          createTurboActivationEffect();
          break;
        case 'extra_life':
          setExtraLives(prev => prev + 1);
          createExtraLifeActivationEffect();
          break;
      }
      
      // Enhanced combo system
      setPowerUpCombo(prev => prev + 1);
      setPowerUpComboTimer(Date.now() + 5000); // 5 second combo window
      
      // Clear effects after enhanced animation duration
      setTimeout(() => {
        setPowerUpActivationEffect(null);
        setPowerUpGlow(null);
      }, 3000); // Increased duration
      
      // Clear particles after animation
      setTimeout(() => setPowerUpParticles([]), 2000);
      
      const powerup = availablePowerUps.find(p => p.id === powerUpId);
      if (powerup && settings.gameNotifications) {
        toast({
          title: `⚡ ${powerup.name} Activated!`,
          description: `${powerup.description || 'Powerup effect is now active!'} ${powerUpCombo > 1 ? `(Combo: ${powerUpCombo})` : ''}`,
          duration: 4000
        });
      }
      
      // Track powerup usage in game stats
      setGameStats(prev => ({
        ...prev,
        powerUpsActivated: prev.powerUpsActivated + 1,
      }));
      setPowerUpsUsed(prev => [...prev, powerUpId]);
      
      // Refresh equipment/inventory state
      if (typeof refreshEquipment === 'function') refreshEquipment();
    } else {
      if (settings.gameNotifications) {
        toast({
          title: '❌ Powerup Failed',
          description: 'Unable to activate powerup. Please try again.',
          duration: 3000
        });
      }
    }
  };

  // Enhanced sound effects for power-ups
  const playPowerUpSound = (powerUpId: string) => {
    try {
      // Use shared audio context to prevent multiple instances
      let audioContext = (window as any).__sharedAudioContext;
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        (window as any).__sharedAudioContext = audioContext;
      }
      
      // Generate different sound effects for each power-up
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies and patterns for each power-up
      const soundConfig = {
        shield: { frequency: 440, duration: 0.3, type: 'sine' },
        magnet: { frequency: 330, duration: 0.4, type: 'square' },
        coin_multiplier: { frequency: 660, duration: 0.5, type: 'sawtooth' },
        turbo_start: { frequency: 880, duration: 0.6, type: 'triangle' },
        extra_life: { frequency: 220, duration: 0.8, type: 'sine' }
      };
      
      const config = soundConfig[powerUpId] || soundConfig.shield;
      
      oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
      oscillator.type = config.type as OscillatorType;
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + config.duration);
      
    } catch (error) {
      console.log('Audio not supported or disabled');
    }
  };

  // Enhanced particle configuration
  const getPowerUpParticleConfig = (powerUpId: string) => {
    const configs = {
      shield: {
        count: 20,
        speed: 12,
        color: '#6366f1',
        sizeRange: 8,
        minSize: 4,
        type: 'sparkle' as const
      },
      magnet: {
        count: 15,
        speed: 10,
        color: '#22d3ee',
        sizeRange: 6,
        minSize: 3,
        type: 'trail' as const
      },
      coin_multiplier: {
        count: 25,
        speed: 15,
        color: '#fbbf24',
        sizeRange: 10,
        minSize: 5,
        type: 'burst' as const
      },
      turbo_start: {
        count: 30,
        speed: 20,
        color: '#a21caf',
        sizeRange: 12,
        minSize: 6,
        type: 'burst' as const
      },
      extra_life: {
        count: 18,
        speed: 8,
        color: '#ef4444',
        sizeRange: 7,
        minSize: 4,
        type: 'sparkle' as const
      }
    };
    return configs[powerUpId] || configs.shield;
  };

  // Enhanced activation effects for each power-up
  const createShieldActivationEffect = () => {
    // Create enhanced shield bubble effect with multiple layers
    const shieldContainer = document.createElement('div');
    shieldContainer.style.cssText = `
      position: absolute;
      left: ${(isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 40}px;
      top: ${birdY - 40}px;
      width: ${BIRD_WIDTH + 80}px;
      height: ${BIRD_HEIGHT + 80}px;
      z-index: 20;
      pointer-events: none;
    `;
    document.body.appendChild(shieldContainer);

    // Main shield bubble with enhanced glow
    const mainShield = document.createElement('div');
    mainShield.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 4px solid #6366f1;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 80%);
      box-shadow: 0 0 40px rgba(99, 102, 241, 0.8), 0 0 80px rgba(99, 102, 241, 0.4), inset 0 0 20px rgba(99, 102, 241, 0.2);
      animation: enhancedShieldActivation 2.5s ease-out;
    `;
    shieldContainer.appendChild(mainShield);

    // Energy rings that expand outward
    for (let i = 0; i < 3; i++) {
      const energyRing = document.createElement('div');
      energyRing.style.cssText = `
        position: absolute;
        left: -${20 + i * 15}px;
        top: -${20 + i * 15}px;
        width: ${BIRD_WIDTH + 80 + i * 30}px;
        height: ${BIRD_HEIGHT + 80 + i * 30}px;
        border-radius: 50%;
        border: 2px solid rgba(99, 102, 241, ${0.8 - i * 0.2});
        animation: enhancedShieldRing ${1.5 + i * 0.3}s ease-out ${i * 0.2}s;
        z-index: ${19 - i};
      `;
      shieldContainer.appendChild(energyRing);
    }

    // Particle effects around the shield
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      const angle = (i * 45) * (Math.PI / 180);
      const distance = 60 + Math.random() * 20;
      const startX = Math.cos(angle) * distance;
      const startY = Math.sin(angle) * distance;
      
      particle.style.cssText = `
        position: absolute;
        left: ${BIRD_WIDTH / 2 + startX}px;
        top: ${BIRD_HEIGHT / 2 + startY}px;
        width: 6px;
        height: 6px;
        background: radial-gradient(circle, #6366f1, #4f46e5);
        border-radius: 50%;
        box-shadow: 0 0 8px #6366f1;
        animation: enhancedShieldParticle 1.5s ease-out ${i * 0.1}s;
        z-index: 21;
      `;
      shieldContainer.appendChild(particle);
    }

    // Energy waves that pulse outward
    for (let i = 0; i < 4; i++) {
      const energyWave = document.createElement('div');
      energyWave.style.cssText = `
        position: absolute;
        left: -${30 + i * 10}px;
        top: -${30 + i * 10}px;
        width: ${BIRD_WIDTH + 80 + i * 20}px;
        height: ${BIRD_HEIGHT + 80 + i * 20}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 70%);
        animation: enhancedShieldWave ${2 + i * 0.2}s ease-out ${i * 0.15}s;
        z-index: ${18 - i};
      `;
      shieldContainer.appendChild(energyWave);
    }

    // Remove the container after animation completes
    setTimeout(() => {
      if (shieldContainer.parentNode) {
        shieldContainer.remove();
      }
    }, 3000);
    
    // Show shield activation notification
    toast({
      title: '🛡️ Enhanced Shield Activated!',
      description: 'You are protected with advanced energy barriers for 15 seconds!',
      duration: 3000,
    });
  };

  const createMagnetActivationEffect = () => {
    // Create magnetic field effect with proper cyan theme
    const magnetField = document.createElement('div');
    magnetField.style.cssText = `
      position: absolute;
      left: ${(isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 40}px;
      top: ${birdY - 40}px;
      width: ${BIRD_WIDTH + 80}px;
      height: ${BIRD_HEIGHT + 80}px;
      border-radius: 50%;
      border: 4px dashed #22d3ee;
      background: radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, rgba(34, 211, 238, 0.05) 50%, transparent 70%);
      box-shadow: 0 0 50px rgba(34, 211, 238, 0.6), 0 0 100px rgba(34, 211, 238, 0.3);
      z-index: 19;
      pointer-events: none;
      animation: magnetActivation 2.5s ease-out;
    `;
    document.body.appendChild(magnetField);
    setTimeout(() => magnetField.remove(), 2500);
    
    // Show magnet activation notification
    toast({
      title: '🧲 Magnet Activated!',
      description: 'Coins are attracted to you for 20 seconds!',
      duration: 3000,
    });
  };

  const createCoinMultiplierActivationEffect = () => {
    // Create coin multiplier aura with proper gold theme
    const coinAura = document.createElement('div');
    coinAura.style.cssText = `
      position: absolute;
      left: ${(isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 35}px;
      top: ${birdY - 35}px;
      width: ${BIRD_WIDTH + 70}px;
      height: ${BIRD_HEIGHT + 70}px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(251, 191, 36, 0.1) 50%, transparent 70%);
      box-shadow: 0 0 60px rgba(251, 191, 36, 0.8), 0 0 120px rgba(251, 191, 36, 0.4);
      z-index: 18;
      pointer-events: none;
      animation: coinMultiplierActivation 3s ease-out;
    `;
    document.body.appendChild(coinAura);
    setTimeout(() => coinAura.remove(), 3000);
    
    // Show coin multiplier activation notification
    toast({
      title: '💰 Coin Multiplier Activated!',
      description: 'Coins are worth 2x for 25 seconds!',
      duration: 3000,
    });
  };

  const createTurboActivationEffect = () => {
    // Create turbo speed lines
    for (let i = 0; i < 5; i++) {
      const speedLine = document.createElement('div');
      speedLine.style.cssText = `
        position: absolute;
        left: ${(isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) + 50 + i * 20}px;
        top: ${birdY + BIRD_HEIGHT / 2 - 2}px;
        width: 4px;
        height: 4px;
        background: #a21caf;
        border-radius: 50%;
        z-index: 17;
        pointer-events: none;
        animation: turboSpeedLine 1s ease-out;
        animation-delay: ${i * 0.1}s;
      `;
      document.body.appendChild(speedLine);
      setTimeout(() => speedLine.remove(), 1000 + i * 100);
    }
    
    // Show score multiplier notification
    toast({
      title: '⚡ Turbo Activated!',
      description: `Score multiplier: ${scoreMultiplier}x for ${getPowerUpDuration('turbo_start') / 1000} seconds!`,
      duration: 3000,
    });
  };

  const createExtraLifeActivationEffect = () => {
    // Create heart burst effect with proper red theme
    const heartBurst = document.createElement('div');
    heartBurst.style.cssText = `
      position: absolute;
      left: ${(isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) + BIRD_WIDTH / 2 - 20}px;
      top: ${birdY + BIRD_HEIGHT / 2 - 20}px;
      width: 40px;
      height: 40px;
      background: radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, rgba(239, 68, 68, 0.4) 50%, transparent 70%);
      border-radius: 50%;
      box-shadow: 0 0 30px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.3);
      z-index: 21;
      pointer-events: none;
      animation: extraLifeActivation 2.5s ease-out;
    `;
    document.body.appendChild(heartBurst);
    setTimeout(() => heartBurst.remove(), 2500);
    
    // Show extra life activation notification
    toast({
      title: '❤️ Extra Life Added!',
      description: 'You have an extra life to continue playing!',
      duration: 3000,
    });
  };

  // Enhanced particle update system
  useEffect(() => {
    const interval = setInterval(() => {
      setPowerUpParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 0.02,
          size: particle.size * 0.98
        })).filter(particle => particle.life > 0)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Combo system timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (powerUpComboTimer > 0 && Date.now() > powerUpComboTimer) {
        setPowerUpCombo(0);
        setPowerUpComboTimer(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [powerUpComboTimer]);

  // DUPLICATE REMOVED - Using optimized version above

  // --- Turbo Start Logic ---
  useEffect(() => {
    if (!activePowerUps['turbo_start']) return;
    
    // Apply turbo effect when powerup is activated

    setSpeedMultiplier(2); // Double speed
    
    // Set a timer to deactivate turbo after duration
    const timer = setTimeout(() => {
  
      setSpeedMultiplier(1);
    }, 12000); // 12 seconds turbo effect (matches useGameEquipment duration)
    
    return () => clearTimeout(timer);
  }, [activePowerUps['turbo_start']]); // Trigger when turbo powerup changes

  // Helper function to get power-up colors
  const getPowerUpColor = (powerUpId: string): string => {
    const colors = {
      shield: '#6366f1',
      magnet: '#22d3ee',
      coin_multiplier: '#fbbf24',
      turbo_start: '#a21caf',
      extra_life: '#ef4444'
    };
    return colors[powerUpId] || '#ffffff';
  };

  // Helper function to get power-up gradients
  const getPowerUpGradient = (powerUpId: string): string => {
    const gradients = {
      shield: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      magnet: 'linear-gradient(135deg, #22d3ee, #06b6d4)', 
      coin_multiplier: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      turbo_start: 'linear-gradient(135deg, #a21caf, #7c3aed)',
      extra_life: 'linear-gradient(135deg, #ef4444, #dc2626)'
    };
    return gradients[powerUpId] || 'linear-gradient(135deg, #6366f1, #4f46e5)';
  };

  // Helper functions for power-up display
  const getPowerUpIcon = (powerUpId: string): string => {
    const icons = {
      shield: '🛡️',
      magnet: '🧲',
      coin_multiplier: '💰',
      turbo_start: '⚡',
      extra_life: '❤️'
    };
    return icons[powerUpId] || '⚡';
  };

  const getPowerUpName = (powerUpId: string): string => {
    const names = {
      shield: 'Shield',
      magnet: 'Magnet',
      coin_multiplier: '2x Coins',
      turbo_start: 'Turbo',
      extra_life: 'Extra Life'
    };
    return names[powerUpId] || 'Power-up';
  };

  const getPowerUpDuration = (powerUpId: string): number => {
    const durations = {
      shield: 15000, // 15 seconds
      magnet: 20000, // 20 seconds
      coin_multiplier: 25000, // 25 seconds
      turbo_start: 18000, // 18 seconds
      extra_life: 0 // Permanent until used
    };
    return durations[powerUpId as keyof typeof durations] || 15000;
  };

  // Power-up progress indicator component
  const PowerUpProgress = () => {
    const now = Date.now();
    const activePowerUps = Object.keys(powerUpTimers).filter(timerId => powerUpTimers[timerId] > now);
    
    if (activePowerUps.length === 0) return null;
    
    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {activePowerUps.map(timerId => {
          const endTime = powerUpTimers[timerId];
          const startTime = endTime - getPowerUpDuration(timerId);
          const progress = Math.max(0, Math.min(1, (endTime - now) / (endTime - startTime)));
          const remainingSeconds = Math.ceil((endTime - now) / 1000);
          
          return (
            <div key={timerId} className="bg-black/80 backdrop-blur-sm rounded-lg p-3 min-w-[200px]">
                              <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getPowerUpIcon(timerId)}</span>
                    <span className="text-white font-semibold text-sm">
                      {getPowerUpName(timerId)}
                      {timerId === 'turbo_start' && scoreMultiplier > 1 && (
                        <span className="ml-1 text-xs bg-gradient-to-r from-purple-600 to-purple-800 px-1 rounded text-white font-bold">2x</span>
                      )}
                    </span>
                  </div>
                  <span className="text-white text-xs font-mono">{remainingSeconds}s</span>
                </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    timerId === 'shield' ? 'bg-blue-500' :
                    timerId === 'magnet' ? 'bg-cyan-500' :
                    timerId === 'coin_multiplier' ? 'bg-yellow-500' :
                    timerId === 'turbo_start' ? 'bg-purple-500' :
                    timerId === 'extra_life' ? 'bg-red-500' :
                    progress > 0.5 ? 'bg-green-500' : 
                    progress > 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Continue game function - called when player clicks continue after watching ad
  const continueGame = useCallback(() => {
    console.log('🔄 continueGame called - resuming game after ad watch');
    
    // Clear pipes and obstacles to create safe space
    setPipes(prevPipes => prevPipes.filter(pipe => pipe.x > GAME_WIDTH * 0.8));
    setCoins(prevCoins => prevCoins.filter(coin => coin.x > GAME_WIDTH * 0.8));
    
    // Position bird in safe position
    const safeY = GAME_HEIGHT * 0.5 - BIRD_HEIGHT / 2;
    setBirdY(safeY);
    setBirdVel(-1);
    
    // Reset game state
    setGameOver(false);
    setGameStarted(false);
    setShowTapToContinue(true);
    setShowGameOverModal(false);
    setReviveUsed(true);
    setShowReviveModal(false);
    
    // Reset countdown and pipe states
    setCountdown(0);
    setShowCountdown(false);
    setPipesActive(false);
    
    // Set invincibility for safety
    setIsInvincible(true);
    
    // Show revive effects
    setShowReviveEffect(true);
    setShowReviveGlow(true);
    
    // Clear effects after delay
    setTimeout(() => setShowReviveEffect(false), 1200);
    
    // Clear invincibility after 3 seconds
    setTimeout(() => {
      setIsInvincible(false);
      setShowReviveGlow(false);
    }, 3000);
    
    // Add new pipe pair far ahead for safe spacing
    setTimeout(() => {
      const newPipeX = GAME_WIDTH + 200;
      const newPipeGapY = getRandomPipeY(getPipeGap(score, safeMode), GAME_HEIGHT);
      setPipes(prevPipes => [...prevPipes, { x: newPipeX, gapY: newPipeGapY }]);
    }, 1000);
  }, [score, safeMode]);

  // Set the continue game function to the ref
  useEffect(() => {
    if (continueGameRef) {
      continueGameRef.current = continueGame;
    }
  }, [continueGameRef, continueGame]);

  // Unified revive logic for all revive types
  const doRevive = (reviveType?: 'coin' | 'ad' | 'premium' | 'extra_life') => {
    console.log(`🔄 [REVIVE DEBUG] doRevive called with type: ${reviveType}`);
    
    // Both coin and ad revives work EXACTLY THE SAME - only difference is payment method
    if (reviveType === 'coin' || reviveType === 'ad') {
      console.log(`🔄 [REVIVE DEBUG] ${reviveType} revive - incrementing revive count (SAME LOGIC)`);
      setReviveCount(prev => prev + 1);
    }
    
    // SUPER AGGRESSIVE CLEARING - Clear ALL pipes and obstacles within a large radius
    setPipes(prevPipes => prevPipes.filter(pipe => pipe.x > GAME_WIDTH * 0.8)); // Clear 80% of screen
    setCoins(prevCoins => prevCoins.filter(coin => coin.x > GAME_WIDTH * 0.8)); // Clear 80% of screen
    
    // Position bird in the SAFEST possible position (left side, center height)
    const safeY = GAME_HEIGHT * 0.5 - BIRD_HEIGHT / 2;
    setBirdY(safeY);
    setBirdVel(-1); // Very gentle upward velocity
    
    // Reset game state
    setGameOver(false);
    setGameStarted(false); // Wait for tap to continue
    setShowTapToContinue(true);
    setShowGameOverModal(false);
    setReviveUsed(true);
    setShowReviveModal(false);
    
    // Reset countdown and pipe states
    setCountdown(0);
    setShowCountdown(false);
    setPipesActive(false);
    
    // REMOVED SHIELD EFFECTS - Only invincibility for a short time
    console.log('🔄 doRevive: Setting invincibility only (no shield)');
    setIsInvincible(true);
    
    // Show revive effects
    setShowReviveEffect(true);
    setShowReviveGlow(true);
    
    // Clear effects after delay
    setTimeout(() => setShowReviveEffect(false), 1200);
    
    // SHORT INVINCIBILITY - 3 seconds instead of 5, no shield
    setTimeout(() => {
      console.log('🔄 doRevive: Clearing invincibility after 3 seconds');
      setIsInvincible(false);
      setShowReviveGlow(false);
    }, 3000);
    
    // Additional safety: Create a "safe zone" by spawning new pipes further away
    setTimeout(() => {
      // Clear any remaining pipes and generate fresh ones with proper spacing
      setPipes([]);
      
      // Generate initial pipes with safe spacing
      const initialPipes = generateTreadmillPipes(score, safeMode);
      setPipes(initialPipes);
      
      console.log('🔄 doRevive: Generated fresh pipes with safe spacing');
    }, 1000); // Add new pipes after 1 second
  };

  // Handle extra life usage - EXACT SAME as paid coin revive
  const handleUseExtraLife = () => {
    if (extraLives > 0) {
      // Deduct from inventory
      const success = inventoryService.useItem('extra_life', 'powerup', 1);
      if (!success) {
        toast({ title: 'No Extra Lives', description: 'You have no extra lives left in your inventory.', duration: 3000 });
        return;
      }
      setExtraLives(prev => prev - 1);
      useExtraLife(); // Deactivate in equipment system
      
      console.log('💖 Extra life used - calling EXACT SAME revive logic as paid coins');
      
      // Use the EXACT SAME revive logic as paid Flappy coin revives
      doRevive('extra_life');
      
      if (settings.gameNotifications) {
        toast({
          title: 'Extra Life Used! ❤️',
          description: 'You used an extra life to continue! You are protected for 5 seconds.',
          duration: 3000
        });
      }
      if (typeof refreshEquipment === 'function') refreshEquipment();
    }
  };

  // Handle revive via ad or coins
  const handleReviveAd = (reviveType?: 'coin' | 'ad' | 'premium' | 'extra_life') => {
    doRevive(reviveType);
  };

  // --- Challenge Mode Mechanics ---
  // Add state for all challenge mechanics
  const [challengeTimer, setChallengeTimer] = useState(null as null | number);
  const [challengeWind, setChallengeWind] = useState(0); // -1 (left), 0, 1 (right)
  const [challengeGravity, setChallengeGravity] = useState(1); // 1 = normal, -1 = flipped
  const [challengeShield, setChallengeShield] = useState(false);
  const [lavaY, setLavaY] = useState(GAME_HEIGHT); // For Lava Escape
  const [iceSlideOffset, setIceSlideOffset] = useState(0);
  const [cameraShake, setCameraShake] = useState(0);
  const [nightLight, setNightLight] = useState(false);
  const [mysteryEffect, setMysteryEffect] = useState(null as null | string);
  const [challengeComplete, setChallengeComplete] = useState(false);
  
  // Shield Run Mode specific state
  const [shieldUses, setShieldUses] = useState(0);
  const [maxShieldUses] = useState(3); // Limited shield uses
  const [noShieldBonus, setNoShieldBonus] = useState(0); // Bonus for not using shield
  const [harderPipesActive, setHarderPipesActive] = useState(false);
 
  // Helper: get challenge rule
  const getRule = (key, fallback) => safeChallenge?.rules && safeChallenge.rules[key] !== undefined ? safeChallenge.rules[key] : fallback;

  // Challenge Mode: apply mechanics
  useEffect(() => {
    if (mode !== 'challenge' || !challenge) return;
    // Reset all challenge states on new challenge
    setChallengeTimer(null);
    setChallengeWind(0);
    setChallengeGravity(1);
    setChallengeShield(false);
    setLavaY(GAME_HEIGHT);
    setIceSlideOffset(0);
    setCameraShake(0);
    setShieldUses(0);
    setNoShieldBonus(0);
    setHarderPipesActive(false);
    setNightLight(false);
    setMysteryEffect(null);
    setChallengeComplete(false);
    // Precision Mode: no timer needed
    if (safeChallenge?.id === 'timebomb') {
      setChallengeTimer(getRule('timer', 15));
    }
    if (safeChallenge?.id === 'nightflight') {
      setNightLight(true);
    }
    if (safeChallenge?.id === 'shieldrun') {
      setChallengeShield(true);
      setShieldUses(0);
      setNoShieldBonus(0);
      setHarderPipesActive(true);
    }
    if (safeChallenge?.id === 'lavaescape') {
      setLavaY(GAME_HEIGHT - 10);
    }
  }, [mode, challenge]);

  // Challenge timers and intervals
  useEffect(() => {
    if (safeMode !== 'challenge' || !safeChallenge || !gameStarted || gameOver) return;
    let timerInt: any;
    let windInt: any;
    let gravityInt: any;
    let speedInt: any;
    let mysteryInt: any;
    // Time Bomb
    if (safeChallenge?.id === 'timebomb') {
      timerInt = setInterval(() => {
        setChallengeTimer((t) => {
          if (t === null) return null;
          if (t <= 1) {
            setGameOver(true);
            setShowGameOverModal(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    // Gravity Flip - Survival Timer
    if (safeChallenge?.id === 'gravityflip') {
      timerInt = setInterval(() => {
        setChallengeTimer((t) => {
          if (t === null) return null;
          if (t <= 1) {
            setChallengeComplete(true);
            setGameOver(true);
            setShowGameOverModal(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    // Wind Storm - Survival Timer
    if (safeChallenge?.id === 'windstorm') {
      timerInt = setInterval(() => {
        setChallengeTimer((t) => {
          if (t === null) return null;
          if (t <= 1) {
            setChallengeComplete(true);
            setGameOver(true);
            setShowGameOverModal(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    // Gravity Flip
    if (safeChallenge?.id === 'gravityflip') {
      // Set survival timer for 60 seconds
      setChallengeTimer(60);
      
      gravityInt = setInterval(() => {
        setChallengeGravity((g) => -g);
        toast({
          title: 'Gravity Flipped! 🌀',
          description: `Gravity direction changed!`,
          duration: 2000,
        });
      }, getRule('gravityFlipInterval', 10) * 1000);
    }
    // Wind Storm
    if (safeChallenge?.id === 'windstorm') {
      // Set survival timer for 30 seconds
      setChallengeTimer(30);
      
      windInt = setInterval(() => {
        setChallengeWind(Math.random() < 0.5 ? -1 : 1);
        setTimeout(() => setChallengeWind(0), 2000 + Math.random() * 2000);
      }, 4000 + Math.random() * 3000);
    }
    // Speed Rush
    if (safeChallenge?.id === 'speedrush') {
      speedInt = setInterval(() => {
        setCameraShake((s) => s + 1);
        // Speed warning when approaching maximum speed
        if (score > 10) {
          toast({
            title: 'Speed Warning! ⚡',
            description: `Speed increasing! Current: ${((8 + score * 0.1) / 4).toFixed(1)}x`,
            duration: 2000,
          });
        }
      }, 3000);
    }
    // Mystery Mode - Random effects every 15 seconds
    if (safeChallenge?.id === 'mystery') {
      // Start with a random effect immediately
      const effects = ['gravityflip', 'wind', 'speed', 'night', 'ice', 'reverse'];
      setMysteryEffect(effects[Math.floor(Math.random() * effects.length)]);
      
      mysteryInt = setInterval(() => {
        const newEffect = effects[Math.floor(Math.random() * effects.length)];
        setMysteryEffect(newEffect);
        
        // Show toast for effect change
        toast({
          title: 'Mystery Effect! ❓',
          description: `New effect: ${newEffect.charAt(0).toUpperCase() + newEffect.slice(1)}`,
          duration: 3000,
        });
      }, 15000);
    }
    return () => {
      if (timerInt) clearInterval(timerInt);
      if (windInt) clearInterval(windInt);
      if (gravityInt) clearInterval(gravityInt);
      if (speedInt) clearInterval(speedInt);
      if (mysteryInt) clearInterval(mysteryInt);
    };
  }, [safeMode, safeChallenge, gameStarted, gameOver]);

  // Challenge: Lava Escape (rising lava)
  useEffect(() => {
    if (safeMode !== 'challenge' || !safeChallenge || safeChallenge.id !== 'lavaescape' || !gameStarted || gameOver) return;
    const int = setInterval(() => {
      setLavaY((y) => Math.max(0, y - 2));
      if (birdY + BIRD_HEIGHT > lavaY) {
        setGameOver(true);
        setShowGameOverModal(true);
      }
    }, 1000 / 30);
    return () => clearInterval(int);
  }, [safeMode, safeChallenge, gameStarted, gameOver, lavaY, birdY]);

  // Challenge: Ice Slide (slippery physics and sliding pipes)
  useEffect(() => {
    if (safeMode !== 'challenge' || !safeChallenge || safeChallenge.id !== 'iceslide' || !gameStarted || gameOver) return;
    const int = setInterval(() => {
      // Random sliding motion for pipes
      setIceSlideOffset((o) => o + (Math.random() - 0.5) * 3);
    }, 1000 / 30);
    return () => clearInterval(int);
  }, [safeMode, safeChallenge, gameStarted, gameOver]);

  // Challenge: Completion logic (example for timebomb, can expand for others)
  useEffect(() => {
    if (safeMode !== 'challenge' || !safeChallenge || !gameStarted || gameOver) return;
    // Example: Time Bomb, pass enough pipes
    if (safeChallenge.id === 'timebomb' && score >= getRule('pipesToPass', 10)) {
      setChallengeComplete(true);
      setGameOver(true);
      setShowGameOverModal(true);
    }
    // Windstorm: survive X seconds
    if (safeChallenge.id === 'windstorm' && score >= getRule('surviveSeconds', 30)) {
      setChallengeComplete(true);
      setGameOver(true);
      setShowGameOverModal(true);
    }
  }, [safeMode, safeChallenge, gameStarted, gameOver, score]);

  // Challenge: Reward system - Give rewards when challenges are completed
  useEffect(() => {
    if (challengeComplete && safeMode === 'challenge' && safeChallenge) {
      const challengeReward = safeChallenge.reward;
      
      // Create reward based on challenge configuration
      let rewardItem = null;
      
      if (typeof challengeReward === 'number') {
        // Coin reward
        rewardItem = {
          id: `challenge-${safeChallenge.id}-coins`,
          name: `${challengeReward} Flappy Coins`,
          type: 'coins',
          amount: challengeReward,
          description: `Reward for completing ${safeChallenge.name}`,
          icon: '🪙'
        };
      } else if (typeof challengeReward === 'string') {
        // Special reward (Mystery Box, Bonus Coins, etc.)
        if (challengeReward === 'Mystery Box') {
          rewardItem = {
            id: `challenge-${safeChallenge.id}-mystery-box`,
            name: 'Mystery Box',
            type: 'mystery-box',
            amount: 1,
            description: `Mystery Box reward for completing ${safeChallenge.name}`,
            icon: '🎁'
          };
        } else if (challengeReward === 'Bonus Coins') {
          rewardItem = {
            id: `challenge-${safeChallenge.id}-bonus-coins`,
            name: 'Bonus Coins',
            type: 'coins',
            amount: 50,
            description: `Bonus coins for completing ${safeChallenge.name}`,
            icon: '💰'
          };
        } else if (challengeReward === 'Tiered Rewards') {
          rewardItem = {
            id: `challenge-${safeChallenge.id}-tiered-rewards`,
            name: 'Tiered Rewards',
            type: 'coins',
            amount: 100,
            description: `Tiered rewards for completing ${safeChallenge.name}`,
            icon: '🏆'
          };
        } else if (challengeReward === 'Mini Badge') {
          rewardItem = {
            id: `challenge-${safeChallenge.id}-mini-badge`,
            name: 'Mini Badge',
            type: 'badge',
            amount: 1,
            description: `Mini badge for completing ${safeChallenge.name}`,
            icon: '🏅'
          };
        } else if (challengeReward === 'Winter Coins') {
          rewardItem = {
            id: `challenge-${safeChallenge.id}-winter-coins`,
            name: 'Winter Coins',
            type: 'coins',
            amount: 75,
            description: `Winter coins for completing ${safeChallenge.name}`,
            icon: '❄️'
          };
        } else if (challengeReward === 'Rare Skin') {
          rewardItem = {
            id: `challenge-${safeChallenge.id}-rare-skin`,
            name: 'Rare Skin',
            type: 'skin',
            amount: 1,
            description: `Rare skin for completing ${safeChallenge.name}`,
            icon: '🎨'
          };
        } else if (challengeReward === 'Mirror Skin') {
          rewardItem = {
            id: `challenge-${safeChallenge.id}-mirror-skin`,
            name: 'Mirror Skin',
            type: 'skin',
            amount: 1,
            description: `Mirror skin for completing ${safeChallenge.name}`,
            icon: '🪞'
          };
        } else if (challengeReward === 'XP Boost') {
          rewardItem = {
            id: `challenge-${safeChallenge.id}-xp-boost`,
            name: 'XP Boost',
            type: 'powerup',
            amount: 1,
            description: `XP boost for completing ${safeChallenge.name}`,
            icon: '⚡'
          };
        } else {
          // Default reward for unknown string rewards
          rewardItem = {
            id: `challenge-${safeChallenge.id}-default-reward`,
            name: challengeReward,
            type: 'coins',
            amount: 25,
            description: `Reward for completing ${safeChallenge.name}`,
            icon: '🎁'
          };
        }
      }
      
      if (rewardItem) {
        // Show reward modal
        setRewardItem(rewardItem);
        setShowRewardModal(true);
        
        // Show completion toast
        toast({
          title: 'Challenge Completed! 🎉',
          description: `You earned: ${rewardItem.name}`,
          duration: 5000,
        });
      }
    }
  }, [challengeComplete, safeMode, safeChallenge]);

  // --- Override core mechanics in game loop and handlers ---
  // Example: override gravity, flap, pipe gap, etc. based on challenge
  const effectiveGravity = safeMode === 'challenge' && safeChallenge ? (
    safeChallenge.id === 'gravityflip' ? 0.5 * challengeGravity :
    safeChallenge.id === 'mystery' && mysteryEffect === 'gravityflip' ? -0.5 :
    0.5
  ) : 0.5;
  const effectiveFlap = safeMode === 'challenge' && safeChallenge ? (
    safeChallenge.id === 'precision' ? getRule('flapStrength', -6) :
    safeChallenge.id === 'reverse' ? 8 :
    safeChallenge.id === 'mystery' && mysteryEffect === 'reverse' ? 8 :
    safeChallenge.id === 'mystery' && mysteryEffect === 'precision' ? -6 :
    -8
  ) : -8;
  const effectivePipeGap = safeMode === 'challenge' && safeChallenge ? (
    safeChallenge.id === 'precision' ? getRule('pipeGap', 90) :
    safeChallenge.id === 'iceslide' ? 120 :
    safeChallenge.id === 'nightflight' ? getRule('pipeGap', 160) :
    safeChallenge.id === 'shieldrun' ? (harderPipesActive ? 100 : 120) : // Harder pipes for Shield Run
    safeChallenge.id === 'mystery' && mysteryEffect === 'precision' ? 90 :
    safeChallenge.id === 'mystery' && mysteryEffect === 'night' ? 160 :
    safeChallenge.id === 'mystery' && mysteryEffect === 'ice' ? 120 :
    140
  ) : getPipeGap(score, safeMode);
  const effectivePipeSpeed = safeMode === 'challenge' && safeChallenge ? (
    safeChallenge.id === 'speedrush' ? 8 + score * 0.1 :
    safeChallenge.id === 'timebomb' ? 10 : // 2.5x faster pipes for Time Bomb Mode
    safeChallenge.id === 'precision' ? 8.8 : // 2.2x faster pipes for Precision Mode
    safeChallenge.id === 'mystery' && mysteryEffect === 'speed' ? 8 : // 2x faster pipes for speed effect
    safeChallenge.id === 'mystery' && mysteryEffect === 'precision' ? 8.8 : // 2.2x faster pipes for precision effect
    4
  ) : getPipeSpeed(score, safeMode);

  // Wind effect on bird
  const windForce = safeMode === 'challenge' && safeChallenge && (safeChallenge.id === 'windstorm' || (safeChallenge.id === 'mystery' && mysteryEffect === 'wind')) ? challengeWind * 0.7 : 0;

  // Ice slide effect on bird (slippery physics)
  const iceSlideForce = safeMode === 'challenge' && safeChallenge && (safeChallenge.id === 'iceslide' || (safeChallenge.id === 'mystery' && mysteryEffect === 'ice')) ? iceSlideOffset * 0.3 : 0;

  // Night mode overlay
  const isNight = safeMode === 'challenge' && safeChallenge && (safeChallenge.id === 'nightflight' || (safeChallenge.id === 'mystery' && mysteryEffect === 'night'));

  // Night Flight sound cues for approaching obstacles
  useEffect(() => {
    if (!isNight || !gameStarted || gameOver) return;
    
    const soundInterval = setInterval(() => {
      // Check for pipes approaching the bird
      const birdX = isMobile() ? window.innerWidth * 0.12 : 100;
      const warningDistance = 200; // Sound warning distance
      
      const approachingPipe = pipes.find(pipe => {
        const pipeX = isMobile() ? pipe.x * (window.innerWidth / GAME_WIDTH) : pipe.x;
        const distance = pipeX - birdX;
        return distance > 0 && distance < warningDistance;
      });
      
      if (approachingPipe && soundEnabled) {
        // Play warning sound for approaching obstacle
        playSwoosh();
      }
    }, 500); // Check every 500ms
    
    return () => clearInterval(soundInterval);
  }, [isNight, gameStarted, gameOver, pipes, soundEnabled, playSwoosh]);

  // Camera shake for speedrush
  const shakeStyle = cameraShake > 0 ? { transform: `translate(${Math.random() * 8 - 4}px, ${Math.random() * 8 - 4}px)` } : {};

  // --- Override event handlers ---
  const handleFlapChallenge = () => {
    if (showGameOverModal || gameOver) return;
    
    // Debounce rapid flaps to prevent stacking
    const now = performance.now();
    const timeSinceLastFlap = now - lastFlapTimeRef.current;
    const minFlapInterval = 50; // 50ms minimum between flaps
    
    if (timeSinceLastFlap < minFlapInterval) {
      return; // Ignore rapid successive flaps
    }
    lastFlapTimeRef.current = now;
    
    // Start game if not started
    if (!gameStarted && !showTapToContinue) {
      setGameStarted(true);
      setShowTapToStart(false);
      
      // Store initial bird position and freeze it
      initialBirdYRef.current = GAME_HEIGHT / 2;
      setBirdY(GAME_HEIGHT / 2);
      setBirdVel(0); // Stop bird movement
      
      // Start 3-second countdown before pipes appear
      setCountdown(3);
      setShowCountdown(true);
      setPipesActive(false);
      
      // Dispatch game start event for music gesture detection
      window.dispatchEvent(new CustomEvent('game-started'));
      
      // Start countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowCountdown(false);
            setPipesActive(true);
            // Allow bird to move again after countdown
            setBirdVel(0); // Reset velocity to start fresh
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Apply flap force (only if countdown is finished or not active)
    if (!showCountdown) {
      if (safeMode === 'challenge' && safeChallenge) {
        if (safeChallenge.id === 'reverse') {
          setBirdVel(8); // Tap makes bird fall
        } else {
          setBirdVel(effectiveFlap);
        }
      } else {
        setBirdVel(FLAP_STRENGTH);
      }
      
      // Play sound effect
      if (soundEffectsEnabled) {
        playWingFlap();
      }
    }
  };

  // --- Optimized Game Loop with Mobile Performance Integration ---
  const gameLoopRef = useRef<number | null>(null);
  const birdYRef = useRef(birdY);
  const birdVelRef = useRef(birdVel);
  const pipesRef = useRef(pipes);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const lastFlapTimeRef = useRef(0); // Add flap debouncing
  
  // Store initial bird position for countdown
  const initialBirdYRef = useRef(GAME_HEIGHT / 2);

  // Memoized refs to prevent unnecessary re-renders
  useEffect(() => {
    birdYRef.current = birdY;
  }, [birdY]);
  useEffect(() => {
    birdVelRef.current = birdVel;
  }, [birdVel]);
  useEffect(() => {
    pipesRef.current = pipes;
  }, [pipes]);
  useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    let lastTime = performance.now();
    
    function gameLoop(now: number) {
      // Update performance optimizer
      mobilePerformanceOptimizer.updateFrameTime();
      
      // Pause game loop when any modal is open
      const isModalOpen = showGameOverModal || showReviveModal || showInventoryModal || showSubscriptionPlans || showRewardModal || showSubscriptionPromo || showCongratsModal;
      if (isModalOpen) {
        if (!gameOver) gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      // Get optimization settings
      const settings = mobilePerformanceOptimizer.getOptimizationSettings();
      
      // Check if frame should be skipped for performance
      if (mobilePerformanceOptimizer.shouldSkipFrame()) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      // Optimized delta time calculation with capping
      const deltaTime = Math.min((now - lastTime) / 16.67, settings.maxFrameTime / 16.67);
      lastTime = now;
      frameCountRef.current++;
      
      // Update bird position and velocity (only if not in countdown)
      if (!showCountdown) {
        // Apply ice slide physics for slippery movement
        if (safeMode === 'challenge' && safeChallenge?.id === 'iceslide') {
          // Slippery ice physics - reduced control and momentum
          birdYRef.current += birdVelRef.current * deltaTime;
          birdVelRef.current += GRAVITY * deltaTime;
          // Add slippery horizontal movement
          birdYRef.current += iceSlideForce * deltaTime;
        } else {
          birdYRef.current += birdVelRef.current * deltaTime;
          birdVelRef.current += GRAVITY * deltaTime;
        }
      } else {
        // During countdown, keep bird in fixed position
        birdYRef.current = initialBirdYRef.current;
        birdVelRef.current = 0;
      }
      
      // Optimized collision detection - only check when needed and not in countdown
      if (!showCountdown && mobilePerformanceOptimizer.shouldCheckCollisions(frameCountRef.current)) {
        // Immediate collision detection in game loop for no delays
        if (birdYRef.current < 0) {
          birdYRef.current = 0;
          birdVelRef.current = 0;
          // Immediate ground collision check
          if (!shieldActive && !isInvincible && gameStarted && !gameOver) {
            setGameOver(true);
            setGameStarted(false);
            setShowReviveModal(true);
            setShowGameOverModal(false);
            setReviveUsed(false);
            playDie();
            return; // Stop game loop immediately
          }
        }
        if (birdYRef.current > GAME_HEIGHT - BIRD_HEIGHT) {
          birdYRef.current = GAME_HEIGHT - BIRD_HEIGHT;
          birdVelRef.current = 0;
          // Immediate ground collision check
          if (!shieldActive && !isInvincible && gameStarted && !gameOver) {
            setGameOver(true);
            setGameStarted(false);
            setShowReviveModal(true);
            setShowGameOverModal(false);
            setReviveUsed(false);
            playDie();
            return; // Stop game loop immediately
          }
        }
      }
      
      // Update pipes and handle scoring (only if pipes are active)
      let pipesToUpdate = pipesRef.current;
      if (pipesActive) {
        pipesToUpdate = pipesRef.current.map(pipe => ({
          ...pipe,
          x: pipe.x - effectivePipeSpeed * deltaTime
        })).filter(pipe => pipe.x > -100);
        
        // Check if bird passed a pipe
        if (pipesRef.current.length > 0 && pipesRef.current[0].x < 50 && pipesToUpdate.length < pipesRef.current.length) {
          setScore(s => {
            const newScore = s + 1;
            // Update real-time scoring
            updateRealTimeScore(newScore);
            return newScore;
          });
          playPoint();
          playSwoosh();
          
          // Shield Run Mode: Bonus for not using shield
          if (safeMode === 'challenge' && safeChallenge?.id === 'shieldrun' && challengeShield) {
            setNoShieldBonus(prev => prev + 1);
            setScore(s => s + 1); // Extra point for not using shield
            toast({
              title: 'No Shield Bonus! 🎯',
              description: `+1 bonus point! Total bonus: ${noShieldBonus + 1}`,
              duration: 2000,
            });
          }
          
          // Time Bomb Mode: Timer extension per pipe
          if (safeMode === 'challenge' && safeChallenge?.id === 'timebomb') {
            const timerExtension = getRule('timerPerPipe', 3);
            setChallengeTimer(prev => {
              if (prev === null) return null;
              const newTime = prev + timerExtension;
              toast({
                title: 'Timer Extended! ⏰',
                description: `+${timerExtension}s! Time: ${newTime.toFixed(1)}s`,
                duration: 2000,
              });
              return newTime;
            });
          }
        }
        
        // Add new pipes based on level - treadmill system
        const currentPipeCount = pipesToUpdate.length;
        const targetPipeCount = getPipeCount(score, safeMode);
        
        if (currentPipeCount < targetPipeCount) {
          // Add pipes at far end of treadmill with improved spacing
          const lastPipeX = pipesToUpdate.length > 0 ? 
            Math.max(...pipesToUpdate.map(p => p.x)) : GAME_WIDTH + 300;
          const spacing = 500; // Increased spacing for safety
          
          for (let i = currentPipeCount; i < targetPipeCount; i++) {
            const gap = getPipeGap(score, safeMode);
            let gapY = getRandomPipeY(gap, GAME_HEIGHT);
            
            // Validate gap position
            const minGapY = 60;
            const maxGapY = GAME_HEIGHT - gap - GROUND_HEIGHT - 32;
            
            if (gapY < minGapY) gapY = minGapY;
            if (gapY > maxGapY) gapY = maxGapY;
            
            const newPipe = {
              x: lastPipeX + (spacing * (i - currentPipeCount + 1)),
              gapY: gapY
            };
            
            // Validate pipe position to prevent overlapping
            if (validatePipePosition(pipesToUpdate, newPipe)) {
              pipesToUpdate.push(newPipe);
            } else {
              // If too close, place it further away
              newPipe.x += 200;
              pipesToUpdate.push(newPipe);
            }
          }
        }
      }
      
      // Update coins
      const coinsToUpdate = coinsRef.current.map(coin => ({
        ...coin,
        x: coin.x - effectivePipeSpeed * deltaTime
      })).filter(coin => coin.x > -50);
      
      // Spawn new coins continuously throughout the game
      if (pipesActive && Math.random() < 0.02) { // 2% chance per frame to spawn a coin
        const newCoin = {
          id: Date.now() + Math.random() * 1000,
          x: GAME_WIDTH + 50,
          y: Math.random() * (GAME_HEIGHT - 200) + 100,
          phase: Math.random() * Math.PI * 2,
          collected: false,
          value: 1,
          scale: 1,
          rotation: 0
        };
        coinsToUpdate.push(newCoin);
      }
      
      // Update refs
      pipesRef.current = pipesToUpdate;
      coinsRef.current = coinsToUpdate;
      
      // Update state every frame for smooth gameplay
      setBirdY(birdYRef.current);
      setBirdVel(birdVelRef.current);
      setPipes(pipesToUpdate);
      setCoins(coinsToUpdate);
      
      // Update bombs for Challenge Time Bomb mode
      if (safeMode === 'challenge' && safeChallenge?.id === 'timebomb') {
        // Spawn bombs periodically
        setBombSpawnTimer(prev => {
          const newTimer = prev + deltaTime * 16.67; // Convert to milliseconds
          if (newTimer >= BOMB_SPAWN_INTERVAL) {
            // Spawn new bomb
            const newBomb = {
              id: bombIdCounter,
              x: Math.random() * (GAME_WIDTH - BOMB_SIZE),
              y: -BOMB_SIZE,
              width: BOMB_SIZE,
              height: BOMB_SIZE,
              speed: BOMB_FALL_SPEED,
              exploded: false
            };
            setBombs(prevBombs => [...prevBombs, newBomb]);
            setBombIdCounter(prev => prev + 1);
            return 0;
          }
          return newTimer;
        });
        
        // Update bomb positions
        setBombs(prevBombs => 
          prevBombs.map(bomb => ({
            ...bomb,
            y: bomb.y + bomb.speed * deltaTime * 16.67
          })).filter(bomb => bomb.y < GAME_HEIGHT + 100) // Remove bombs that fall off screen
        );
        
        // Check bomb collisions with bird
        const birdX = 50; // Bird's x position
        const birdY = birdYRef.current;
        const birdWidth = BIRD_WIDTH;
        const birdHeight = BIRD_HEIGHT;
        
        bombs.forEach(bomb => {
          if (!bomb.exploded && 
              bomb.x < birdX + birdWidth && 
              bomb.x + bomb.width > birdX &&
              bomb.y < birdY + birdHeight && 
              bomb.y + bomb.height > birdY) {
            // Bomb hit bird - game over
            if (!shieldActive && !isInvincible && gameStarted && !gameOver) {
              setGameOver(true);
              setGameStarted(false);
              setShowReviveModal(true);
              setShowGameOverModal(false);
              setReviveUsed(false);
              playDie();
              return; // Stop game loop immediately
            }
          }
        });
      }
      
      // Continue loop
      if (!gameOver) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameStarted, gameOver, effectivePipeSpeed, pipesActive, showGameOverModal, showReviveModal, showInventoryModal, showSubscriptionPlans, showRewardModal, showSubscriptionPromo, showCongratsModal]);



  // Add error handling for network issues
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network connection restored');
    };
    
    const handleOffline = () => {
      console.log('🌐 Network connection lost');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add invincibility state
  const [showReviveEffect, setShowReviveEffect] = useState(false);

  // Optimized collision detection with reduced frequency
  useEffect(() => {
    // Pause collision detection when any modal is open
    const isModalOpen = showGameOverModal || showReviveModal || showInventoryModal || showSubscriptionPlans || showRewardModal || showSubscriptionPromo || showCongratsModal;
    
    // Debug collision detection state
    if (shieldActive || isInvincible) {
      console.log('🛡️ Collision detection skipped - shield or invincibility active');
      return;
    }
    
    if (!gameStarted || gameOver || isModalOpen) return;
    
    // Enhanced helper function to handle collision with power-up effects
    const handleCollisionWithPowerUps = () => {
      // Check for shield first with proper validation
      if (shieldActive) {
        // Check if shield is still active (either from equipment or local state)
        const shieldStatus = getPowerUpStatus('shield');
        const isShieldValid = shieldStatus && shieldStatus.isActive && shieldStatus.timeLeft && shieldStatus.timeLeft > 0;
        
        if (isShieldValid || shieldActive) {
          setShieldActive(false);
          // Create shield break effect
          const birdX = isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08;
          const birdYCenter = birdY + BIRD_HEIGHT / 2;
          const particles = [];
          for (let i = 0; i < 8; i++) {
            particles.push({
              x: birdX + BIRD_WIDTH / 2,
              y: birdYCenter,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              color: '#6366f1',
              life: 0.8
            });
          }
          setPowerUpParticles(particles);
          
          if (settings.gameNotifications) {
            toast({
              title: 'Shield Used! 🛡️',
              description: 'Your shield protected you from that collision.',
              duration: 3000,
            });
          }
          console.log('🛡️ Shield absorbed collision');
          return false; // Don't end game
        } else {
          // Shield expired - normal Flappy Pi behavior: DIE on collision
          console.log('💀 Shield expired - normal collision behavior');
          return true; // End game
        }
      }
      
      // Extra life should NOT be automatic - only when user clicks in revive modal
      // Check for extra life with proper validation
      if (extraLives > 0) {
        const extraLifeStatus = getPowerUpStatus('extra_life');
        const hasExtraLife = extraLifeStatus && extraLifeStatus.isActive && extraLifeStatus.timeLeft && extraLifeStatus.timeLeft > 0;
        
        // Don't automatically use extra life - let user choose in revive modal
        console.log('💖 Extra life available but not auto-used - user must choose in revive modal');
        return true; // End game and show revive modal
      }
      
      // No power-ups active - normal Flappy Pi behavior: DIE on collision
      console.log('💀 No power-ups active - normal collision behavior');
      return true; // End game
    };
    
    // Optimized boundary collision detection
    if (birdY < 0) {
      setBirdY(0);
      if (handleCollisionWithPowerUps()) {
        setGameOver(true);
        setGameStarted(false);
        setShowReviveModal(true);
        setShowGameOverModal(false);
        setReviveUsed(false);
        playDie();
        return;
      }
    }
    if (birdY + BIRD_HEIGHT > GAME_HEIGHT) {
      setBirdY(GAME_HEIGHT - BIRD_HEIGHT);
      if (handleCollisionWithPowerUps()) {
        setGameOver(true);
        setGameStarted(false);
        setShowReviveModal(true);
        setShowGameOverModal(false);
        setReviveUsed(false);
        playDie();
        return;
      }
    }
    
    // FIXED: Improved pipe collision detection with accurate bird positioning
    // Only check collisions if pipes are active
    if (!pipesActive) return;
    
    // Calculate bird position consistently with the Bird component
    const birdX = isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08;
    const birdLeft = birdX;
    const birdRight = birdX + BIRD_WIDTH;
    const birdTop = birdY;
    const birdBottom = birdY + BIRD_HEIGHT;
    
    // Debug bird position
    console.log(`🐦 Bird position:`, {
      birdX: Math.round(birdX),
      birdY: Math.round(birdY),
      birdLeft: Math.round(birdLeft),
      birdRight: Math.round(birdRight),
      birdTop: Math.round(birdTop),
      birdBottom: Math.round(birdBottom)
    });
    
    // Only check pipes that are close to the bird for better performance
    const nearbyPipes = pipes.filter(pipe => 
      Math.abs(pipe.x - birdRight) < PIPE_WIDTH + 100
    );
    
    for (const pipe of nearbyPipes) {
      // Check horizontal overlap with pipe
      if (pipe.x < birdRight && pipe.x + PIPE_WIDTH > birdLeft) {
        const gapTop = pipe.gapY;
        const gapBottom = pipe.gapY + getPipeGap(score, mode);
        
        // FIXED: More precise collision detection with proper gap calculation
        const collisionTolerance = 8; // 8px tolerance for more forgiving detection
        const inGap = birdTop >= gapTop - collisionTolerance && birdBottom <= gapBottom + collisionTolerance;
        
        // Debug collision detection
        console.log(`🔍 Collision check:`, {
          birdY: Math.round(birdY),
          birdTop: Math.round(birdTop),
          birdBottom: Math.round(birdBottom),
          gapTop: Math.round(gapTop),
          gapBottom: Math.round(gapBottom),
          gapSize: Math.round(gapBottom - gapTop),
          pipeX: Math.round(pipe.x),
          inGap: inGap,
          tolerance: collisionTolerance
        });
        
        if (!inGap) {
          console.log(`💥 Pipe collision detected:`, {
            birdY: Math.round(birdY),
            birdTop: Math.round(birdTop),
            birdBottom: Math.round(birdBottom),
            gapTop: Math.round(gapTop),
            gapBottom: Math.round(gapBottom),
            gapSize: Math.round(gapBottom - gapTop),
            pipeX: Math.round(pipe.x),
            tolerance: collisionTolerance
          });
          
          // Handle collision with power-ups with proper validation
          if (shieldActive) {
            // Check if shield is still active (either from equipment or local state)
            const shieldStatus = getPowerUpStatus('shield');
            const isShieldValid = shieldStatus && shieldStatus.isActive && shieldStatus.timeLeft && shieldStatus.timeLeft > 0;
            
            if (isShieldValid || shieldActive) {
              setShieldActive(false);
              
              // Shield Run Mode: Track shield usage and bonus
              if (safeMode === 'challenge' && safeChallenge?.id === 'shieldrun') {
                setShieldUses(prev => prev + 1);
                if (shieldUses >= maxShieldUses - 1) {
                  setChallengeShield(false); // No more shields
                }
              }
              
              // Create shield break effect
              const birdX = isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08;
              const birdYCenter = birdY + BIRD_HEIGHT / 2;
              const particles = [];
              for (let i = 0; i < 8; i++) {
                particles.push({
                  x: birdX + BIRD_WIDTH / 2,
                  y: birdYCenter,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  color: '#6366f1',
                  life: 0.8
                });
              }
              setPowerUpParticles(particles);
              
              toast({
                title: 'Shield Used! 🛡️',
                description: safeMode === 'challenge' && safeChallenge?.id === 'shieldrun' 
                  ? `Shield used! ${maxShieldUses - shieldUses - 1} remaining.` 
                  : 'Your shield protected you from that collision.',
                duration: 3000,
              });
              console.log('🛡️ Shield absorbed pipe collision');
              continue; // Absorb hit, continue playing
            } else {
              // Shield expired - normal Flappy Pi behavior: DIE on pipe collision
              console.log('💀 Shield expired - normal pipe collision behavior');
              if (onCollision) {
                onCollision();
              } else {
                setGameOver(true);
                setGameStarted(false);
                setShowReviveModal(true);
                setShowGameOverModal(false);
                setReviveUsed(false);
                playHit();
              }
              return;
            }
          } else if (extraLives > 0) {
            // Extra life should NOT be automatic - only when user clicks in revive modal
            // Check if extra life is available (either from equipment or local state)
            const extraLifeStatus = getPowerUpStatus('extra_life');
            const hasExtraLife = extraLifeStatus && extraLifeStatus.isActive && extraLifeStatus.timeLeft && extraLifeStatus.timeLeft > 0;
            
            // Don't automatically use extra life - let user choose in revive modal
            console.log('💖 Extra life available but not auto-used for pipe collision - user must choose in revive modal');
            if (onCollision) {
              onCollision();
            } else {
              setGameOver(true);
              setGameStarted(false);
              setShowReviveModal(true);
              setShowGameOverModal(false);
              setReviveUsed(false);
              playHit();
            }
            return;
          } else {
            // No power-ups active - normal Flappy Pi behavior: DIE on pipe collision
            console.log('💀 No power-ups active - normal pipe collision behavior');
            if (onCollision) {
              onCollision();
            } else {
              setGameOver(true);
              setGameStarted(false);
              setShowReviveModal(true);
              setShowGameOverModal(false);
              setReviveUsed(false);
              playHit();
            }
            return;
          }
        }
      }
    }
    
    // Optimized coin collision detection (batched)
    const activeCoins = coins.filter(coin => !coin.collected);
    const coinsToCollect = activeCoins.filter(coin => {
      const birdX = isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08;
      return (
        coin.x < birdX + BIRD_WIDTH + 16 &&
        coin.x + COIN_SIZE > birdX - 16 &&
        birdY + BIRD_HEIGHT + 16 > coin.y &&
        birdY - 16 < coin.y + COIN_SIZE
      );
    });
    
    if (coinsToCollect.length > 0) {
      // Batch collect coins for better performance
      const totalCoinsToAdd = coinsToCollect.reduce((sum, coin) => sum + (coin.value * coinMultiplier), 0);
      addCoins(totalCoinsToAdd);
      
      if (profile) {
        (async () => {
          await updateProfile({ total_coins: (profile.total_coins || 0) + totalCoinsToAdd });
        })();
        // Sound handled by useSoundEffects hook
        setCoinsCollected(prev => prev + totalCoinsToAdd);
        setCoinsLeftThisLevel((c) => c - coinsToCollect.length);
      }
      
      // Mark coins as collected
      setCoins(currentCoins => 
        currentCoins.map(coin => 
          coinsToCollect.some(c => c.id === coin.id) ? { ...coin, collected: true } : coin
        )
      );
    }
  }, [birdY, pipes, gameStarted, gameOver, isInvincible, shieldActive, profile, activeEffects, extraLives, coinMultiplier, coins, pipesActive]);

  // Start game on tap/click
  const handleFlap = handleFlapChallenge;

  const bgClass = {
    classic: 'bg-classic',
    bamboo: 'bg-bamboo',
    neon: 'bg-neon',
    fire: 'bg-fire',
    ice: 'bg-ice',
    challenge: 'bg-challenge',
  }[mode];

  const hasPipes = true;

  // Cancel always immediately shows Game Over modal
  const handleReviveCancel = () => {
    setShowReviveModal(false);
    setTimeout(() => {
      setShowGameOverModal(true);
      setShowTapToStart(false);
    }, 100); // Increased delay for smoother transition
  };

  // Compute background style and effect for main div
  let backgroundStyle: React.CSSProperties;
  const level = getUserLevel(score);
  let theme = getThemeByLevel(level);
  let scene = theme.scene;
  let effect = theme.effect;
  if (mode === 'endless') {
    scene = 'night'; // or use a custom scene like 'endless' if you add it to Background.tsx
  }
  // Night Flight Mode - use night scene
  if (safeMode === 'challenge' && safeChallenge?.id === 'nightflight') {
    scene = 'night';
  }
  // Ice Slide Mode - use winter scene
  if (safeMode === 'challenge' && safeChallenge?.id === 'iceslide') {
    scene = 'winter';
  }
  if (mode === 'endless') {
    backgroundStyle = { background: theme.bg, minHeight: GAME_HEIGHT };
  } else if (mode === 'classic') {
    backgroundStyle = { background: theme.bg, minHeight: GAME_HEIGHT };
  } else {
    backgroundStyle = { background: `url(${modeBackgroundMap[mode]}) center/cover no-repeat`, minHeight: GAME_HEIGHT };
  }

  // Check if user has any powerups
  const hasPowerUps = availablePowerUps.length > 0;
  

  // Footer powerup items - only show the 5 main power-ups, with dynamic quantity and always correct icon
  const mainPowerUpIcons = {
    shield: 'powerups/Shield.png',
    magnet: 'powerups/Coin Magnet.png',
    extra_life: 'powerups/Extra life.png',
    coin_multiplier: 'powerups/2x Coin Multiplier.png',
    turbo_start: 'powerups/turbo-start.png',
  };
  const mainPowerUpIds = ['shield', 'magnet', 'extra_life', 'coin_multiplier', 'turbo_start'];
  

  
  const footerPowerUps = mainPowerUpIds
    .map(id => {
    const powerup = availablePowerUps.find(p => p.id === id);
    const validation = validatePowerUpUsage(id);
    const isBlocked = !validation.allowed;
    

    
    return {
      id,
      name: powerup?.name || id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: mainPowerUpIcons[id],
      quantity: powerup?.quantity || 0,
      isBlocked,
      blockReason: validation.reason
    };
    })
    .filter(powerup => powerup.quantity >= 0); // Show all power-ups, even with 0 quantity (disabled)



  // On play again, play playbutton SFX
  const handlePlayAgain = () => {
    // Sound handled by useSoundEffects hook
    handleRestart();
  };

  // Store random direction for each bird skin (persist for session)
  const birdDirectionsRef = React.useRef<{ [skin: string]: 'ltr' | 'rtl' }>({});
  if (mode === 'endless') {
    Object.keys(birdSkins).forEach((skin) => {
      if (!birdDirectionsRef.current[skin]) {
        birdDirectionsRef.current[skin] = Math.random() < 0.5 ? 'ltr' : 'rtl';
      }
    });
  }

  // Add a mapping from scene to ground type
  const sceneToGround: Record<string, 'grass' | 'rock' | 'lava' | 'dessert' | 'ice' | 'land'> = {
    morning: 'grass',
    sunrise: 'grass',
    sunlight: 'grass',
    beach: 'dessert',
    desert: 'dessert',
    snow: 'ice',
    lava: 'lava',
    rainbow: 'land',
    storm: 'rock',
    sunny: 'grass',
    rainy: 'grass',
    winter: 'ice',
    thunder: 'rock',
    garden: 'grass',
    mars: 'rock',
    jupiter: 'land',
    space: 'rock',
    planet: 'land',
    night: 'rock',
  };

  // Challenge mode specific ground mapping
  const getChallengeGround = (challengeId: string): 'grass' | 'rock' | 'lava' | 'dessert' | 'ice' | 'land' => {
    switch (challengeId) {
      case 'lavaescape':
        return 'lava';
      case 'iceslide':
        return 'ice';
      case 'nightflight':
        return 'rock';
      case 'windstorm':
        return 'rock';
      case 'gravityflip':
        return 'land';
      case 'precision':
        return 'grass';
      case 'speedrush':
        return 'dessert';
      case 'reverse':
        return 'land';
      case 'shieldrun':
        return 'rock';
      case 'timebomb':
        return 'lava';
      case 'mystery':
        return 'land';
      default:
        return 'grass';
    }
  };


  // Add the share handler inside ClassicMode:
  const handleShareScore = () => {
    const shareText = `I scored ${score} in Flappy Pi! Can you beat me? Play now: https://flappypi2807.pinet.com/`;
    if (navigator.share) {
      navigator.share({
        title: 'Flappy Pi',
        text: shareText,
        url: 'https://flappypi2807.pinet.com/',
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Score copied! Paste it to share with your friends.');
    }
  };

  // Level label helper
  const getLevelLabel = (score) => {
    if (score < 5) return 'Very Easy';
    if (score < 10) return 'Easy';
    if (score < 20) return 'Normal';
    if (score < 35) return 'Medium';
    if (score < 50) return 'Hard';
    if (score < 75) return 'Very Hard';
    return 'Extreme';
  };

  // In ClassicMode component, add state for coins collected this run
  const [coinsCollected, setCoinsCollected] = useState(0);

  useEffect(() => {
    if (showGameOverModal) {
      // Sound handled by useSoundEffects hook
    }
  }, [showGameOverModal]);

  useEffect(() => {
    // Show subscription promo modal after 10 seconds if not subscribed and not seen in this session
    // Check both profile subscription status and inventory service subscription status
    const hasProfileSubscription = profile?.has_active_subscription;
    const inventorySubscriptionStatus = inventoryService.getSubscriptionStatus();
    const hasInventorySubscription = inventorySubscriptionStatus.hasActiveSubscription;
    
    if (profile && !hasProfileSubscription && !hasInventorySubscription && !sessionStorage.getItem('hasSeenSubscriptionPromoInGame')) {
      const timer = setTimeout(() => {
        setShowSubscriptionPromo(true);
        sessionStorage.setItem('hasSeenSubscriptionPromoInGame', 'true');
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [profile]);

  // Plan expiration check
  useEffect(() => {

    if (profile?.subscription_end) {
      const now = new Date();
      const end = new Date(profile.subscription_end);
      if (now > end && profile.subscription_status !== 'expired') {

        updateProfile({ subscription_status: 'expired' });
        setPlanJustExpired(true);
      }
    }
  }, [profile]);

  // Listen for subscription expiration events from inventory service
  useEffect(() => {
    const handleSubscriptionExpired = (event: CustomEvent) => {
      // Force refresh profile and update game state
      refreshProfile();
      setPlanJustExpired(true);
      
      // Show toast notification
      toast({
        title: 'Subscription Expired',
        description: 'Your premium subscription has expired. You now have access to free features with ads.',
        variant: 'destructive',
        duration: 3000
      });
    };

    const handleInventoryUpdated = (event: CustomEvent) => {
      if (event.detail?.action === 'subscriptions-expired') {
        refreshProfile();
        setPlanJustExpired(true);
      }
    };

    window.addEventListener('subscription-expired', handleSubscriptionExpired as EventListener);
    window.addEventListener('inventory-updated', handleInventoryUpdated as EventListener);

    return () => {
      window.removeEventListener('subscription-expired', handleSubscriptionExpired as EventListener);
      window.removeEventListener('inventory-updated', handleInventoryUpdated as EventListener);
    };
  }, [refreshProfile, toast]);

  // --- Congrats Modal State ---
  // showCongratsModal is now declared at the top of the component

  // Handle plan purchase and reward claim - now triggered by payment completion
  const handlePlanPurchase = useCallback(async (plan) => {
    // This is now called only after successful payment completion
    // The subscription is already activated in the inventory service
    console.log('🎉 Plan purchase completed via payment:', plan);
    
    // Get rewards from the new reward system
    const planRewards = getPlanRewards(plan.id);
    setPendingRewards(planRewards);
    
    // Show congrats modal first, then reward modal
    setShowCongratsModal(true);
    setTimeout(() => {
      setShowCongratsModal(false);
      setShowRewardModal(true);
    }, 2000);
  }, []);

  const handleClaimRewards = useCallback(async () => {
    // Rewards are automatically saved to inventory by EnhancedRewardModal
    setShowRewardModal(false);
    setPendingRewards([]);
  }, []);

  // Handle challenge reward claiming
  const handleClaimChallengeReward = useCallback(async () => {
    if (rewardItem) {
      // Add coins to user's balance if it's a coin reward
      if (rewardItem.type === 'coins') {
        try {
        await updateProfile({
          total_coins: (profile?.total_coins || 0) + rewardItem.amount
        });
          
          toast({
            title: 'Coins Added! 🪙',
            description: `+${rewardItem.amount} Flappy Coins added to your wallet`,
            duration: 3000,
          });
        } catch (error) {
          console.error('Error adding coins:', error);
        }
      }
      
      // For other reward types, you could add them to inventory here
      // For now, we'll just show a success message
      toast({
        title: 'Reward Claimed! 🎉',
        description: `You received: ${rewardItem.name}`,
        duration: 3000,
      });
      
      setShowRewardModal(false);
      setRewardItem(null);
    }
        }, [rewardItem, updateProfile, profile?.total_coins, toast]);

  // Get active effects
  

  // Apply powerup effects to game
  useEffect(() => {
    if (activeEffects.hasShield) {
      setIsInvincible(true);
      setShieldActive(true);
    } else {
      setIsInvincible(false);
      setShieldActive(false);
    }
    
    if (activeEffects.hasMagnet) {
      setMagnetActive(true);
    } else {
      setMagnetActive(false);
    }
    
    if (activeEffects.hasCoinMultiplier) {
      setCoinMultiplier(activeEffects.coinMultiplier || 2);
    } else {
      setCoinMultiplier(1);
    }
    
    if (activeEffects.hasTurbo) {
      setSpeedMultiplier(activeEffects.gameSpeed || 2);
    } else {
      setSpeedMultiplier(1);
    }
  }, [activeEffects]);

  // Handle collision with powerup effects
  const handleCollision = () => {
    if (activeEffects.hasShield) {
      // Shield absorbs the hit
      return false; // Don't end game
    }
    
    if (activeEffects.hasExtraLife) {
      // Extra life should NOT be automatic - let user choose in revive modal
      console.log('💖 Extra life available but not auto-used - user must choose in revive modal');
      return true; // End game and show revive modal
    }
    
    return true; // End game
  };

  // showInventoryModal is now declared at the top of the component

  // Update bestScore if score exceeds it
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
    }
  }, [score, bestScore]);

  // Mock login for testing if no profile
  React.useEffect(() => {
    if (!profile) {
      updateProfile({
        username: 'mockuser',
        has_active_subscription: true,
        subscription_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'active',
        total_coins: 100,
      });
    }
  }, [profile, updateProfile]);

  // Helper to map item id to Reward type
  function getRewardType(itemId: string): 'powerup' | 'skin' | 'subscription' | 'mystery-box' | 'bundle' {
    if (itemId.startsWith('powerup')) return 'powerup';
    if (itemId.startsWith('mystery_box')) return 'mystery-box';
    if (itemId.startsWith('bundle')) return 'bundle';
    if (itemId.startsWith('skin')) return 'skin';
    if (itemId.startsWith('subscription')) return 'subscription';
    return 'powerup';
  }

  // Safe shop opening function - navigate to shop page instead of modal
  const handleOpenShop = () => {
    navigate('/shop');
  };

  // Safe inventory opening function - only opens if no other modals are open
  const handleOpenInventory = () => {
    const anyModalOpen = showGameOverModal || showReviveModal || 
                        showSubscriptionPlans || showRewardModal || showSubscriptionPromo;
    
    if (!anyModalOpen) {
      setShowInventoryModal(true);
    } else {
      console.log('Cannot open inventory while another modal is open');
    }
  };

  // Safe premium opening function - only opens if no other modals are open
  const handleOpenPremium = () => {
    const anyModalOpen = showInventoryModal || showGameOverModal || 
                        showReviveModal || showRewardModal || showSubscriptionPromo;
    
    if (!anyModalOpen) {
      setShowSubscriptionPlans(true);
    } else {
      console.log('Cannot open premium while another modal is open');
    }
  };

  // Always use inventoryService.getSubscriptionStatus() for revive modal
  const subscriptionStatus = inventoryService.getSubscriptionStatus();
  const hasActiveSubscription = subscriptionStatus.hasActiveSubscription;

  // Sync local activePowerUps state with useGameEquipment
  useEffect(() => {
    setActivePowerUps(activePowerUps);
  }, [activePowerUps]);

  // Pipe color palette for classic mode, one per level (cycle if more levels)
  const classicPipeColors = [
    'linear-gradient(to right, #a8e063 70%, #56ab2f 100%)', // green
    'linear-gradient(to right, #f7971e 70%, #ffd200 100%)', // orange/yellow
    'linear-gradient(to right, #00c6ff 70%, #0072ff 100%)', // blue
    'linear-gradient(to right, #f953c6 70%, #b91d73 100%)', // pink/purple
    'linear-gradient(to right, #43cea2 70%, #185a9d 100%)', // teal/blue
    'linear-gradient(to right, #ff512f 70%, #dd2476 100%)', // red/pink
    'linear-gradient(to right, #e0eafc 70%, #cfdef3 100%)', // light blue
    'linear-gradient(to right, #f7971e 70%, #ffd200 100%)', // repeat for more levels
  ];

  const [leaderboard, setLeaderboard] = useState<Array<{ username: string; highest_score: number; }>>([]);
  useEffect(() => {
    if (showGameOverModal) {
      // Fetch leaderboard when game over
      unifiedLeaderboardService.getLeaderboard({ game_mode: mode === 'endless' ? 'endless' : 'classic', limit: 10 })
        .then(result => {
          if (result.success && result.data) {
            // Transform the data to match the expected format
            const transformedData = result.data.map(entry => ({
              username: entry.username,
              highest_score: entry.score
            }));
            setLeaderboard(transformedData);
          }
        })
        .catch(console.error);
    }
  }, [showGameOverModal]);

  // Refresh balance when component mounts and when user returns to game
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  // Refresh balance when window gains focus (user returns to game tab)
  useEffect(() => {
    const handleFocus = () => {
      refreshBalance();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshBalance]);

  // Weather effects disabled - removed state and initialization

  // Get weather effect based on mode and current weather
  const getWeatherEffect = () => {
    // Weather effects disabled for all game modes
    return null;
  };

  // Handler for Tap to Start/Continue
  const handleTapToStart = () => {
    setGameStarted(true);
    setShowTapToStart(false);
    setShowTapToContinue(false); // Ensure overlay is hidden immediately
    setBirdVel(FLAP_STRENGTH);
    
    // Start 3-second countdown before pipes appear
    setCountdown(3);
    setShowCountdown(true);
    setPipesActive(false);
    
    // Sound handled by useSoundEffects hook
    
    // Dispatch game start event for music gesture detection
    window.dispatchEvent(new CustomEvent('game-started'));
    
    // Initialize session tracking
    setSessionStartTime(Date.now());
    setSessionDuration(0);
    setGameStats({
      pipesPassed: 0,
      coinsCollected: 0,
      powerUpsActivated: 0,
      distanceTraveled: 0,
    });
    setPowerUpsUsed([]);
    
    // Start countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowCountdown(false);
          setPipesActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Show welcome notification card - REMOVED
    // toast({
    //   title: '🎮 Game Started! Good luck!',
    //   description: 'Sign in with Pi to submit to the global leaderboard.',
    //   duration: 3000
    // });
  };





  // Example: play flappycoins SFX on coin collect
  const handleCollectCoin = (coin) => {
    if (coin.collected) return; // Prevent double collection
    

    
    // Sound handled by useSoundEffects hook
    
    // Add coins to wallet (apply coin multiplier and gold rush multiplier if active)
    const baseValue = coin.value;
    const finalValue = baseValue * coinMultiplier * goldRushMultiplier;
    addCoins(finalValue, coin.isGoldRush ? 'Gold Rush Bonus' : 'Collected in game');
    
    // Track coins in real-time scoring
    addCoinsEarned(finalValue);
    
    // Mark coin as collected
    setCoins(prevCoins => 
      prevCoins.map(c => 
        c.id === coin.id ? { ...c, collected: true } : c
      )
    );
    
    // Add visual collection effect
    setCoinsCollected(prev => prev + finalValue);
    
    // Special notification for gold rush coins
    if (coin.isGoldRush) {
      toast({
        title: `💰 GOLD RUSH! +${finalValue} Coins!`,
        description: `Gold rush multiplier: ${goldRushMultiplier}x!`,
        duration: 2000,
      });
    } else if (coinMultiplier > 1 || goldRushMultiplier > 1) {
      const totalMultiplier = coinMultiplier * goldRushMultiplier;
      toast({
        title: `💰 +${finalValue} Coins!`,
        description: `Multiplier active: ${totalMultiplier}x value!`,
        duration: 2000,
      });
    }
    
    // Track coin collection in game stats
    setGameStats(prev => ({
      ...prev,
      coinsCollected: prev.coinsCollected + finalValue,
    }));
    
    // Force refresh balance to update display immediately
    setTimeout(() => refreshBalance(), 100);
  };

  // Example: play swooshing SFX on pipe pass
  const handlePassPipe = () => {
    const newScore = score + 1;
    setScore(newScore);
    
    // Track pipe passing in game stats
    setGameStats(prev => ({
      ...prev,
      pipesPassed: prev.pipesPassed + 1,
      distanceTraveled: prev.distanceTraveled + 100, // Approximate distance per pipe
    }));
    
    // Check for Gold Rush milestones (every 10 points) - allow during revive modal
    if (newScore % 10 === 0 && newScore > 0 && !gameOver && gameStarted) {
      console.log('🎉 GOLD RUSH TRIGGERED at score:', newScore); // Debug log
      
      // Determine exact number of coins for this gold rush (optimized for performance)
      const numCoins = Math.floor(Math.random() * 4) + 6; // 6-9 coins for better performance
      setGoldRushCoins(numCoins);
      setGoldRushText(`GOLD RUSH! ${numCoins} coins ahead!`);
      setShowGoldRush(true);
      
      // Create exactly the number of coins shown in the text (optimized)
      const goldRushCoins = [];
      const coinSpacing = 70; // Optimal spacing for collection
      const startX = GAME_WIDTH + 30; // Start closer for immediate visibility
      const centerY = GAME_HEIGHT / 2; // Center of screen
      
      // Create exactly numCoins coins in a line (optimized loop)
      for (let i = 0; i < numCoins; i++) {
        goldRushCoins.push({
          x: startX + (i * coinSpacing),
          y: centerY + (Math.random() - 0.5) * 40, // Reduced variation for better collection
          value: 1, // Each coin worth 1
          id: `goldrush-${Date.now()}-${i}`,
          isGoldRush: true, // Mark as gold rush coin
          phase: Math.random() * Math.PI * 2,
          collected: false,
          scale: 1,
          rotation: 0
        });
      }
      
      // Add gold rush coins to the game (optimized state update)
      console.log('💰 Adding gold rush coins to game:', goldRushCoins.length, 'coins'); // Debug log
      setCoins(prevCoins => {
        const newCoins = [...prevCoins, ...goldRushCoins];
        console.log('💰 Updated coins array:', newCoins.length, 'total coins'); // Debug log
        return newCoins;
      });
      
      // Play gold rush sound (optimized)
      if (soundEffectsEnabled) {
        // Sound handled by useSoundEffects hook
      }
      
      // Hide gold rush text after 1.2 seconds (faster for better UX)
      setTimeout(() => {
        setShowGoldRush(false);
      }, 1200);
      
      // Show gold rush notification (optimized)
      if (settings.gameNotifications) {
        toast({
          title: `💰 GOLD RUSH! ${numCoins} coins ahead!`,
          description: `A line of ${numCoins} Flappy coins has appeared! Collect them all!`,
          duration: 3000 // Shorter duration
        });
      }
    }
    
    // Show milestone notifications only if game notifications are enabled
    if (settings.gameNotifications) {
      if (newScore === 10) {
        toast({
          title: '🎉 10 Points! Great start!',
          description: 'Submit your score to the leaderboard!',
          duration: 3000
        });
      } else if (newScore === 25) {
        toast({
          title: '🔥 25 Points! You\'re on fire!',
          description: 'Submit your score to the leaderboard!',
          duration: 3000
        });
      } else if (newScore === 50) {
        toast({
          title: '🌟 50 Points! Amazing!',
          description: 'Submit your score to the leaderboard!',
          duration: 3000
        });
      } else if (newScore === 100) {
        toast({
          title: '🏆 100 Points! Legendary!',
          description: 'Submit your score to the leaderboard!',
          duration: 4000
        });
      } else {
        toast({
          title: '🎯 Pipe passed! +1 point',
          description: 'Submit your score to the leaderboard!',
          duration: 1500
        });
      }
    }
    
    playPoint();
    playSwoosh(); // Play swooshing SFX on pipe pass
  };
  
  // Random Gold Rush Timer - triggers random gold rushes during gameplay
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const randomGoldRushInterval = setInterval(() => {
      // 5% chance every 30 seconds to trigger a random gold rush
      if (Math.random() < 0.05 && !goldRushActive) {
        triggerRandomGoldRush();
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(randomGoldRushInterval);
  }, [gameStarted, gameOver, goldRushActive]);
  
  // Gold Rush Timer Countdown
  useEffect(() => {
    if (!goldRushActive || goldRushTimer <= 0) return;
    
    const countdownInterval = setInterval(() => {
      setGoldRushTimer(prev => {
        if (prev <= 1) {
          setGoldRushActive(false);
          setGoldRushType(null);
          setGoldRushMultiplier(1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdownInterval);
  }, [goldRushActive, goldRushTimer]);

  // Example: play gameover SFX when game over modal is shown
  const handleShowGameOver = () => {
    setGameOver(true);
    setShowGameOverModal(true);
    // Sound handled by useSoundEffects hook
    playDie(); // Play dead SFX on final game over
    
    // Handle real-time game over
    handleRealTimeGameOver(score);
    
    // Calculate final session duration
    const finalDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    setSessionDuration(finalDuration);
    
    // Record game session in history
    if (sessionStartTime > 0 && score > 0) {
      recordGameSession({
        gameMode: mode,
        score,
        level: getUserLevel(score),
        coinsEarned: gameStats.coinsCollected,
        duration: finalDuration,
        birdSkin: equippedSkin || 'bird_0',
        isNewHighScore: score > bestScore,
        reviveCount,
        extraLivesUsed: extraLives,
        powerUpsUsed,
        gameStats,
      });
    }
    
    // Show game over notification card only if game notifications are enabled
    if (settings.gameNotifications) {
      toast({
        title: '💀 Game Over! Final Score: ' + score,
        description: 'Sign in with Pi to submit to the global leaderboard.',
        duration: 5000
      });
    }
  };

  // Example: play dead SFX on special death event
  const handleSpecialDeath = () => {
    playDie();
    // ...existing special death logic...
  };

  const [showReviveGlow, setShowReviveGlow] = useState(false);

  // In the effect or logic that handles showing the Tap to Continue overlay, set birdY to center if on desktop
  useEffect(() => {
    if (showTapToContinue && !isMobile()) {
      setBirdY(GAME_HEIGHT / 2 - BIRD_HEIGHT / 2);
    }
  }, [showTapToContinue, isMobile]);

  const [userLevel, setUserLevel] = useState(getUserLevel(0)); // Track current user level
  const prevLevelRef = useRef(userLevel); // Track previous level for comparison

  // Watch for score changes to detect level up
  useEffect(() => {
    const newLevel = getUserLevel(score);
    if (newLevel > prevLevelRef.current) {
      setUserLevel(newLevel);
      prevLevelRef.current = newLevel;
      setLevelUpText(`Level Up! You reached Level ${newLevel}!`);
      setShowLevelUpText(true);
      setTimeout(() => setShowLevelUpText(false), 2000);
    } else if (newLevel < prevLevelRef.current) {
      // If the player restarts, update the ref
      setUserLevel(newLevel);
      prevLevelRef.current = newLevel;
    }
  }, [score]);

  // Refresh wallet balance when game starts
  useEffect(() => {
    if (!gameStarted && !gameOver) {
      refreshBalance();
    }
  }, [gameStarted, gameOver, refreshBalance]);

  const handleSubmitScore = async () => {
    if (scoreSubmitted) return false;
    if (profile && profile.pi_user_id) {
      try {
        // Calculate session duration
        const sessionDuration = gameStartTime > 0 ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
        
        // Prepare score submission data based on actual game mode
        const gameMode: GameMode = mode === 'endless' ? 'endless' : 'classic';
        
        const scoreSubmission: ClassicModeSubmission = {
          score,
          game_mode: gameMode,
          session_duration: sessionDuration,
          character_used: equippedSkin,
          difficulty: 'normal',
          pipes_passed: Math.floor(score / 1), // Each point represents a pipe passed
          coins_collected: coinsCollected,
          level_reached: level,
          power_ups_used: Object.keys(activePowerUps).filter(key => activePowerUps[key]),
          perfect_passes: 0 // Could be tracked in the future
        };

        // Submit using unified leaderboard service
        const result = await unifiedLeaderboardService.handleGameOver(
          profile.pi_user_id,
          profile.username,
          scoreSubmission
        );

        setScoreSubmitted(result.submitted);
        
        if (settings.gameNotifications) {
          toast({
            title: result.submitted ? 'Score submitted!' : 'Failed to submit score.',
            description: result.submitted 
              ? `Your score was sent to the global leaderboard. ${result.newBest ? 'New personal best!' : ''}` 
              : 'Please try again.',
            variant: result.submitted ? undefined : 'destructive',
          });

          // Show additional achievement notification
          if (result.newBest && result.achievements && result.achievements.length > 0) {
            setTimeout(() => {
              result.achievements?.forEach(achievement => {
                toast({
                  title: `🏆 Achievement Unlocked!`,
                  description: `${achievement.title}: ${achievement.description}`,
                });
              });
            }, 1500);
          }
        }

        return result.submitted;
      } catch (error) {
        console.error('Failed to submit score:', error);
        setScoreSubmitted(false);
        if (settings.gameNotifications) {
          toast({
            title: 'Failed to submit score.',
            description: 'Please try again.',
            variant: 'destructive',
          });
        }
        return false;
      }
    } else {
      // Local/guest: save to localStorage
      const guestScores = JSON.parse(localStorage.getItem('flappypi-guest-scores') || '[]');
      guestScores.push({ score, level, date: new Date().toISOString() });
      localStorage.setItem('flappypi-guest-scores', JSON.stringify(guestScores));
      setScoreSubmitted(true);
      if (settings.gameNotifications) {
        toast({
          title: 'Score saved locally!',
          description: 'Submit your score to the leaderboard!',
        });
      }
      return true;
    }
  };

  // Auto-submit on game over for Pi users
  useEffect(() => {
    if (gameOver && !scoreSubmitted && profile && profile.pi_user_id && score > 0) {
      handleSubmitScore();
    }
  }, [gameOver, score, profile, scoreSubmitted]);

  // End game session when game is over
  useEffect(() => {
    if (gameOver && gameSessionId) {
      unifiedLeaderboardService.endGameSession();
    }
  }, [gameOver, gameSessionId]);

  // --- Coin Animation Logic --- (OLD - REMOVED)
  // useEffect(() => {
  //   if (!coinAvailable) return;
  //   let raf;
  //   const animate = () => {
  //     setCoinPos(pos => ({
  //       ...pos,
  //       y: 200 + Math.sin((performance.now() / 500) + pos.phase) * 30 // floating effect
  //     }));
  //     raf = requestAnimationFrame(animate);
  //   };
  //   raf = requestAnimationFrame(animate);
  //   return () => cancelAnimationFrame(raf);
  // }, [coinAvailable]);

  const getMusicTrackForMode = (mode) => {
    if (mode === 'endless') {
      return 'sounds/background/Soaring Dream Theme Song.mp3';
    }
    // All other modes use Soaring Theme Song
    return 'sounds/background/Soaring Theme Song.mp3';
  };

  // --- Coin Respawn Logic --- (OLD - REMOVED)
  // useEffect(() => {
  //   if (!coinAvailable) {
  //     // Respawn coin after a short delay
  //     const timer = setTimeout(() => {
  //       setCoinPos({ x: GAME_WIDTH + 80, y: 200 + Math.random() * 300, phase: Math.random() * Math.PI * 2 });
  //       setCoinAvailable(true);
  //     }, 800); // 0.8s respawn delay
  //     return () => clearTimeout(timer);
  //   }
  //   // If coin goes off screen, respawn
  //   if (coinPos.x < -COIN_SIZE) {
  //     setCoinPos({ x: GAME_WIDTH + 80, y: 200 + Math.random() * 300, phase: Math.random() * Math.PI * 2 });
  //     setCoinAvailable(true);
  //   }
  // }, [coinAvailable, coinPos.x]);

  // Add state for showing level up text
  const [showLevelUpText, setShowLevelUpText] = useState(false);
  const [levelUpText, setLevelUpText] = useState('');
  
  // Enhanced Gold Rush state
  const [showGoldRush, setShowGoldRush] = useState(false);
  const [goldRushCoins, setGoldRushCoins] = useState(0);
  const [goldRushText, setGoldRushText] = useState('');
  const [goldRushParticles, setGoldRushParticles] = useState<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
  }>>([]);

  // --- Optimized Coin Animation Logic ---
  useEffect(() => {
    let raf;
    let lastTime = performance.now();
    let frameCount = 0;
    
    const animate = () => {
      // Pause animation when any modal is open
      const isModalOpen = showGameOverModal || showReviveModal || showInventoryModal || showSubscriptionPlans || showRewardModal || showSubscriptionPromo || showCongratsModal;
      
      if (!isModalOpen) {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        // Reduce animation frequency for better performance
        frameCount++;
        if (frameCount % 2 === 0) { // Only animate every other frame
          setCoins(currentCoins => 
            currentCoins.map(coin => {
              if (coin.collected) return coin;
              
              const time = currentTime / 1000;
              const individualPhase = coin.phase + time * 1.0; // Reduced animation speed
              
              // Simplified animations for better performance
              if (!gameStarted) {
                // Pre-game: Simplified floating animation
                const floatAmplitude = 4 + Math.sin(time * 0.4) * 2;
                const rotation = Math.sin(individualPhase * 0.5) * 5;
                const pulseScale = coin.value > 1 ? 1 + Math.sin(time * 2.0) * 0.1 : 1;
                
                return {
                  ...coin,
                  y: coin.y + Math.sin(individualPhase * 1.0) * floatAmplitude,
                  x: coin.x,
                  scale: pulseScale,
                  rotation: rotation
                };
              } else {
                // Game started: Minimal animation for performance
                const subtleFloat = Math.sin(individualPhase * 0.6) * 1;
                const subtleRotation = Math.sin(individualPhase * 0.3) * 2;
                
                return {
                  ...coin,
                  y: coin.y + subtleFloat,
                  x: coin.x,
                  scale: 1,
                  rotation: subtleRotation
                };
              }
            })
          );
        }
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [showGameOverModal, showReviveModal, showInventoryModal, showSubscriptionPlans, showRewardModal, showSubscriptionPromo, showCongratsModal, gameStarted]);

  // DISABLED: No background music in game mode
  // useGlobalMusic(); // DISABLED: No background music in game mode

  // Pi Ad Network support state
  const [adNetworkSupported, setAdNetworkSupported] = useState<boolean>(false);

  // Check Pi Ad Network support on mount
  useEffect(() => {
    let mounted = true;
    checkAdNetworkSupport().then((supported) => {
      if (mounted) setAdNetworkSupported(!!supported);
    });
    return () => { mounted = false; };
  }, []);

  const hasSpawnedInitialCoins = useRef(false);

  useEffect(() => {
    if (gameStarted && !hasSpawnedInitialCoins.current) {
      // Much more restrictive initial coin placement - very limited and random
      const initialCoinCount = Math.random() < 0.7 ? 1 : 0; // 70% chance for 1 coin, 30% chance for 0
      const initialCoins = Array.from({ length: initialCoinCount }, (_, i) => {
        // Create very challenging and random positions
        const baseX = GAME_WIDTH + 120 + (Math.random() * 350); // Much wider and more random spacing
        const baseY = 100 + Math.random() * (GAME_HEIGHT - 200); // Keep away from edges with more randomness
        
        // Much larger random offset to make positioning very unpredictable
        const offsetX = (Math.random() - 0.5) * 150; // ±75px horizontal offset
        const offsetY = (Math.random() - 0.5) * 120; // ±60px vertical offset
        
        // Ensure coins are very far from each other
        const minDistance = 180; // Much larger minimum distance between coins
        let finalX = baseX + offsetX;
        let finalY = baseY + offsetY;
        
        // Adjust position to avoid grouping with much more aggressive spacing
        if (i > 0) {
          const prevCoin = initialCoins[i - 1];
          const distance = Math.sqrt(Math.pow(finalX - prevCoin.x, 2) + Math.pow(finalY - prevCoin.y, 2));
          if (distance < minDistance) {
            // Move coin much further away
            finalX += (Math.random() - 0.5) * 200;
            finalY += (Math.random() - 0.5) * 150;
          }
        }
        
        return {
          id: Date.now() + i + Math.random() * 1000,
          x: finalX,
          y: finalY,
          phase: Math.random() * Math.PI * 2,
          collected: false,
          value: Math.random() < 0.03 ? 2 : 1, // 3% chance for double value (very rare)
          scale: 1,
          rotation: 0
        };
      });
      console.log('🪙 Game started, spawning very limited coins:', { count: initialCoinCount, coins: initialCoins });
      setCoins(prevCoins => [...prevCoins, ...initialCoins]);
      setCoinsLeftThisLevel(initialCoinCount);
      hasSpawnedInitialCoins.current = true;
    }
    if (!gameStarted) {
      hasSpawnedInitialCoins.current = false;
    }
  }, [gameStarted]);

  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) {
      // code that should only run once per game
      hasRun.current = true;
    }
  }, [gameStarted]);

  // Add this useEffect at the top of ClassicMode
  useEffect(() => {
    inventoryService.fixPowerUpTypes();
  }, []);
  
  // Debug: Force gold rush to show for testing (remove this later)
  // useEffect(() => {
  //   if (score === 3) { // Test at score 3
  //     console.log('🧪 DEBUG: Forcing gold rush at score 3');
  //     const numCoins = 6;
  //     setGoldRushCoins(numCoins);
  //     setGoldRushText(`GOLD RUSH! ${numCoins} coins ahead!`);
  //     setShowGoldRush(true);
  //     
  //     // Create gold rush coins
  //     const goldRushCoins = [];
  //     const coinSpacing = 60;
  //     const startX = GAME_WIDTH + 50;
  //     const centerY = GAME_HEIGHT / 2;
  //     
  //     for (let i = 0; i < numCoins; i++) {
  //       goldRushCoins.push({
  //         x: startX + (i * coinSpacing),
  //         y: centerY + (Math.random() - 0.5) * 60,
  //         value: 1,
  //         id: `debug-goldrush-${Date.now()}-${i}`,
  //         isGoldRush: true,
  //         phase: Math.random() * Math.PI * 2,
  //         collected: false,
  //         scale: 1,
  //         rotation: 0
  //       });
  //     }
  //     
  //     setCoins(prevCoins => [...prevCoins, ...goldRushCoins]);
  //     
  //     setTimeout(() => {
  //       setShowGoldRush(false);
  //     }, 3000);
  //   }
  // }, [score]);
  
  // Gold Rush Particle Animation - Removed since we're not using particles

  const startGame = useCallback(() => {
    if (!gameStarted) {
      // Stop background music when entering gameplay
      stopMusic();
      
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      setBirdY(150);
      setBirdVel(0);
      setPipes([]);
      setCoins([]);
      
      // Start game session tracking
      setGameStartTime(Date.now());
      const sessionId = unifiedLeaderboardService.startGameSession(profile?.pi_user_id, mode === 'endless' ? 'endless' : 'classic');
      setGameSessionId(sessionId);
      
      // Start real-time scoring session
      startGameSession(safeMode, safeChallenge?.id);
      
      // Dispatch game start event for music gesture detection
      window.dispatchEvent(new CustomEvent('game-started'));
      
      // Start game loop
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      
      // Play start sound
      if (soundEnabled) {
        playWingFlap();
      }
    }
  }, [gameState, gameStarted, soundEnabled, playWingFlap]);

  return (
    <>
      <ResponsiveGameContainer>
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        /* Responsive breakpoints */
        @media (max-width: 480px) {
          .responsive-game-area {
            width: 100vw;
            height: 100vh;
            maxWidth: none;
            maxHeight: none;
          }
        }
        @media (min-width: 481px) and (max-width: 768px) {
          .responsive-game-area {
            width: 90vw;
            height: 90vh;
            maxWidth: 480px;
            maxHeight: 800px;
          }
        }
        @media (min-width: 769px) {
          .responsive-game-area {
            width: 480px;
            height: 800px;
          }
        }
        @keyframes coinGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes floatingCoin {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-4px) rotate(2deg); }
          50% { transform: translateY(-8px) rotate(0deg); }
          75% { transform: translateY(-4px) rotate(-2deg); }
        }
        @keyframes coinBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes coinBreathing {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
        @keyframes coinWiggle {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          25% { transform: translateX(2px) rotate(1deg); }
          50% { transform: translateX(0px) rotate(0deg); }
          75% { transform: translateX(-2px) rotate(-1deg); }
        }
        @keyframes goldRushGlow {
          0%, 100% { text-shadow: 2px 2px 8px #000, 0 0 20px #ffd700; }
          50% { text-shadow: 2px 2px 8px #000, 0 0 30px #ffd700, 0 0 40px #ffd700; }
        }
        @keyframes goldRushPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes snowfall {
          0% { transform: translateY(-100vh) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh) translateX(20px); opacity: 0; }
        }
        @keyframes iceGlow {
          0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.8; transform: scale(1.1) rotate(180deg); }
        }
      `}</style>
      <ResponsiveGameArea
        onClick={handleFlap}
        onTouchStart={handleFlap}
      >
        {/* Game area (pipes, bird, etc.) */}
        <div
          ref={gameRef}
          className="game-area"
          style={{
            position: 'relative',
            width: '100vw',
            maxWidth: '100vw', // Allow full viewport width for wide screen
            height: '100vh',
            maxHeight: '100vh', // Allow full viewport height for wide screen
            minHeight: 400, // fallback for iOS Safari viewport issues
            margin: '0 auto',
            overflow: 'hidden',
            background: 'linear-gradient(to bottom, #87CEEB, #98D8E8)', // Unified background
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // Fix mobile header gap and footer overlap
            paddingTop: window.innerWidth <= 768 ? 'env(safe-area-inset-top, 0px)' : '0px',
            paddingBottom: window.innerWidth <= 768 ? '60px' : '0px'
          }}
        >
          {/* Background - Only use Background component for special effects */}
          {mode !== 'classic' && <Background mode={mode} scene={scene} effect={effect} />}
          
          
          {/* Ice Slide Mode - Winter Effects */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'iceslide' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 3,
                pointerEvents: 'none',
                overflow: 'hidden'
              }}
            >
              {/* Snow particles */}
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-80"
                  style={{
                    left: `${(i * 5 + Date.now() * 0.1) % 100}%`,
                    top: `${(i * 3 + Date.now() * 0.05) % 100}%`,
                    animation: `snowfall ${3 + Math.random() * 2}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
              {/* Ice crystals */}
              {[...Array(10)].map((_, i) => (
                <div
                  key={`crystal-${i}`}
                  className="absolute w-2 h-2 bg-cyan-200 rounded-sm opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    animation: `iceGlow ${2 + Math.random() * 3}s ease-in-out infinite alternate`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Shield Run Mode - Status Overlay */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'shieldrun' && (
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  border: '2px solid #06b6d4',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                  🛡️ Shield Run Mode
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Shields: {maxShieldUses - shieldUses}/{maxShieldUses}
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Bonus: {noShieldBonus} points
                </div>
                <div style={{ fontSize: '12px', color: '#06b6d4' }}>
                  Harder Pipes Active
                </div>
              </div>
            </div>
          )}

          {/* Time Bomb Mode - Timer and Status Overlay */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'timebomb' && (
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: challengeTimer && challengeTimer <= 5 ? 'rgba(220, 38, 38, 0.9)' : 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  border: challengeTimer && challengeTimer <= 5 ? '2px solid #ef4444' : '2px solid #dc2626',
                  boxShadow: challengeTimer && challengeTimer <= 5 ? '0 0 30px rgba(239, 68, 68, 0.8)' : '0 0 20px rgba(220, 38, 38, 0.5)',
                  animation: challengeTimer && challengeTimer <= 5 ? 'pulse 0.5s infinite' : 'none'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                  💣 Time Bomb Mode
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '3px',
                  color: challengeTimer && challengeTimer <= 5 ? '#fbbf24' : 'white'
                }}>
                  Time: {challengeTimer ? challengeTimer.toFixed(1) : '0.0'}s
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Pipes: {score}/10
                </div>
                <div style={{ fontSize: '12px', color: '#f59e0b' }}>
                  +3s per pipe passed
                </div>
                {challengeTimer && challengeTimer <= 5 && (
                  <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold' }}>
                    ⚠️ EXPLOSION WARNING!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gravity Flip Mode - Timer and Status Overlay */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'gravityflip' && (
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  border: '2px solid #8b5cf6',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                  🌀 Gravity Flip Mode
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '3px',
                  color: 'white'
                }}>
                  Time: {challengeTimer ? challengeTimer.toFixed(1) : '0.0'}s
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Gravity: {challengeGravity === 1 ? '↓ Normal' : '↑ Flipped'}
                </div>
                <div style={{ fontSize: '12px', color: '#8b5cf6' }}>
                  Flips every 10s
                </div>
                {challengeGravity === -1 && (
                  <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold' }}>
                    ⚠️ GRAVITY FLIPPED!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Precision Mode - Status Overlay */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'precision' && (
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  border: '2px solid #3b82f6',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                  🎯 Precision Mode
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Pipes: {score}/15
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Gap: 90px (Tighter)
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Flap: -6 (Weaker)
                </div>
                <div style={{ fontSize: '12px', color: '#3b82f6' }}>
                  Speed: 2.2x (Faster)
                </div>
                <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold', marginTop: '3px' }}>
                  🎯 PRECISION REQUIRED!
                </div>
              </div>
            </div>
          )}

          {/* Precision Mode - Precision Indicators */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'precision' && (
            <div
              style={{
                position: 'absolute',
                left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 30,
                top: birdY - 30,
                width: 60,
                height: 60,
                zIndex: 8,
                pointerEvents: 'none'
              }}
            >
              {/* Precision crosshair */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 40,
                  height: 40,
                  border: '2px solid #3b82f6',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.7,
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              />
              {/* Precision lines */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 20,
                  height: 2,
                  background: '#3b82f6',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.8
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 2,
                  height: 20,
                  background: '#3b82f6',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.8
                }}
              />
            </div>
          )}

          {/* Speed Rush Mode - Status Overlay */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'speedrush' && (
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  border: '2px solid #10b981',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                  ⚡ Speed Rush Mode
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Pipes: {score}/25
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Speed: {((8 + score * 0.1) / 4).toFixed(1)}x
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Max: 4.0x
                </div>
                <div style={{ fontSize: '12px', color: '#10b981' }}>
                  Speed increases over time!
                </div>
                {score > 15 && (
                  <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold', marginTop: '3px' }}>
                    ⚠️ MAXIMUM SPEED!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Speed Rush Mode - Speed Indicators */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'speedrush' && (
            <div
              style={{
                position: 'absolute',
                left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 40,
                top: birdY - 40,
                width: 80,
                height: 80,
                zIndex: 8,
                pointerEvents: 'none'
              }}
            >
              {/* Speed lines */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 60,
                  height: 60,
                  border: '2px solid #10b981',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.6,
                  animation: 'pulse 1s ease-in-out infinite'
                }}
              />
              {/* Speed arrows */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 30,
                  height: 30,
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.8
                }}
              >
                {/* Arrow pointing right */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 20,
                    height: 2,
                    background: '#10b981',
                    transform: 'translate(-50%, -50%)',
                    animation: 'pulse 0.5s ease-in-out infinite'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 8,
                    height: 2,
                    background: '#10b981',
                    transform: 'translate(-50%, -50%) rotate(45deg)',
                    transformOrigin: 'left center'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 8,
                    height: 2,
                    background: '#10b981',
                    transform: 'translate(-50%, -50%) rotate(-45deg)',
                    transformOrigin: 'left center'
                  }}
                />
              </div>
            </div>
          )}

          {/* Wind Storm Mode - Status Overlay */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'windstorm' && (
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  border: '2px solid #f59e0b',
                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                  🌪️ Wind Storm Mode
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '3px',
                  color: 'white'
                }}>
                  Time: {challengeTimer ? challengeTimer.toFixed(1) : '0.0'}s
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Wind: {challengeWind === 1 ? '→ Right' : challengeWind === -1 ? '← Left' : 'No Wind'}
                </div>
                <div style={{ fontSize: '12px', color: '#f59e0b' }}>
                  Survive the storm!
                </div>
                {challengeWind !== 0 && (
                  <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold', marginTop: '3px' }}>
                    ⚠️ WIND GUST!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wind Storm Mode - Wind Indicators */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'windstorm' && (
            <div
              style={{
                position: 'absolute',
                left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 50,
                top: birdY - 50,
                width: 100,
                height: 100,
                zIndex: 8,
                pointerEvents: 'none'
              }}
            >
              {/* Wind direction arrows */}
              {challengeWind !== 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 80,
                    height: 80,
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.7,
                    animation: 'pulse 0.8s ease-in-out infinite'
                  }}
                >
                  {/* Wind arrows based on direction */}
                  {challengeWind === 1 ? (
                    // Right wind arrows
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          left: '20%',
                          top: '50%',
                          width: 30,
                          height: 2,
                          background: '#f59e0b',
                          transform: 'translateY(-50%)',
                          animation: 'pulse 0.5s ease-in-out infinite'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: '20%',
                          top: '50%',
                          width: 8,
                          height: 2,
                          background: '#f59e0b',
                          transform: 'translateY(-50%) rotate(45deg)',
                          transformOrigin: 'left center'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: '20%',
                          top: '50%',
                          width: 8,
                          height: 2,
                          background: '#f59e0b',
                          transform: 'translateY(-50%) rotate(-45deg)',
                          transformOrigin: 'left center'
                        }}
                      />
                    </>
                  ) : (
                    // Left wind arrows
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          right: '20%',
                          top: '50%',
                          width: 30,
                          height: 2,
                          background: '#f59e0b',
                          transform: 'translateY(-50%)',
                          animation: 'pulse 0.5s ease-in-out infinite'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          right: '20%',
                          top: '50%',
                          width: 8,
                          height: 2,
                          background: '#f59e0b',
                          transform: 'translateY(-50%) rotate(135deg)',
                          transformOrigin: 'right center'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          right: '20%',
                          top: '50%',
                          width: 8,
                          height: 2,
                          background: '#f59e0b',
                          transform: 'translateY(-50%) rotate(-135deg)',
                          transformOrigin: 'right center'
                        }}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reverse Control Mode - Status Overlay */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'reverse' && (
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  border: '2px solid #ec4899',
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                  💫 Reverse Control Mode
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Pipes: {score}/12
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Controls: REVERSED
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Tap to: GO DOWN ↓
                </div>
                <div style={{ fontSize: '12px', color: '#ec4899' }}>
                  Brain-bending challenge!
                </div>
                <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold', marginTop: '3px' }}>
                  ⚠️ MIND BEND ACTIVE!
                </div>
              </div>
            </div>
          )}

          {/* Reverse Control Mode - Reverse Indicators */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'reverse' && (
            <div
              style={{
                position: 'absolute',
                left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 40,
                top: birdY - 40,
                width: 80,
                height: 80,
                zIndex: 8,
                pointerEvents: 'none'
              }}
            >
              {/* Reverse control arrows */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 60,
                  height: 60,
                  border: '2px solid #ec4899',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.6,
                  animation: 'pulse 1.2s ease-in-out infinite'
                }}
              />
              {/* Down arrows indicating reverse control */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 30,
                  height: 30,
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.8
                }}
              >
                {/* Down arrow */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 2,
                    height: 20,
                    background: '#ec4899',
                    transform: 'translate(-50%, -50%)',
                    animation: 'pulse 0.8s ease-in-out infinite'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 8,
                    height: 2,
                    background: '#ec4899',
                    transform: 'translate(-50%, -50%) rotate(45deg)',
                    transformOrigin: 'left center'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 8,
                    height: 2,
                    background: '#ec4899',
                    transform: 'translate(-50%, -50%) rotate(-45deg)',
                    transformOrigin: 'left center'
                  }}
                />
              </div>
            </div>
          )}

          {/* Lava Escape Mode - Status Overlay */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'lavaescape' && (
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  border: '2px solid #f97316',
                  boxShadow: '0 0 20px rgba(249, 115, 22, 0.5)'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                  🔥 Lava Escape Mode
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Pipes: {score}/15
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Lava Level: {Math.max(0, Math.floor((GAME_HEIGHT - lavaY) / 10))}%
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Distance: {Math.max(0, Math.floor((lavaY - birdY) / 10))}px
                </div>
                <div style={{ fontSize: '12px', color: '#f97316' }}>
                  Climb fast or get burned!
                </div>
                {lavaY - birdY < 100 && (
                  <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold', marginTop: '3px' }}>
                    ⚠️ LAVA TOO CLOSE!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mystery Mode - Status Overlay */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'mystery' && (
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  border: '2px solid #6366f1',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                  ❓ Mystery Mode
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '3px',
                  color: 'white'
                }}>
                  Time: {challengeTimer ? challengeTimer.toFixed(1) : '0.0'}s
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Effect: {mysteryEffect ? mysteryEffect.charAt(0).toUpperCase() + mysteryEffect.slice(1) : 'None'}
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px' }}>
                  Changes every 15s
                </div>
                <div style={{ fontSize: '12px', color: '#6366f1' }}>
                  Expect the unexpected!
                </div>
                {mysteryEffect && (
                  <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold', marginTop: '3px' }}>
                    ⚠️ MYSTERY EFFECT ACTIVE!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Night Flight Mode - Limited Visibility Overlay */}
          {isNight && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 60px, rgba(0,0,0,0.95) 120px, rgba(0,0,0,0.98) 100%)',
                zIndex: 5,
                pointerEvents: 'none',
                mixBlendMode: 'multiply'
              }}
            >
              {/* Glowing bird effect */}
              <div
                style={{
                  position: 'absolute',
                  left: isMobile() ? window.innerWidth * 0.12 - 60 : 40,
                  top: birdY - 60,
                  width: 120,
                  height: 120,
                  background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 30px, transparent 60px)',
                  borderRadius: '50%',
                  zIndex: 6,
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              />
              {/* Additional glow layers for enhanced visibility */}
              <div
                style={{
                  position: 'absolute',
                  left: isMobile() ? window.innerWidth * 0.12 - 40 : 60,
                  top: birdY - 40,
                  width: 80,
                  height: 80,
                  background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 20px, transparent 40px)',
                  borderRadius: '50%',
                  zIndex: 7,
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              />
            </div>
          )}

          {/* Lava Escape Mode - Rising Lava Effect */}
          {!hideChallengeUI && safeMode === 'challenge' && safeChallenge?.id === 'lavaescape' && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: `${GAME_HEIGHT - lavaY}px`,
                background: 'linear-gradient(to top, #dc2626 0%, #ea580c 30%, #f97316 60%, #fb923c 100%)',
                zIndex: 3,
                pointerEvents: 'none',
                boxShadow: '0 -10px 30px rgba(220, 38, 38, 0.8)',
                animation: 'lavaGlow 2s ease-in-out infinite'
              }}
            >
              {/* Lava surface effect */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '20px',
                  background: 'linear-gradient(to top, #dc2626 0%, #ea580c 50%, #f97316 100%)',
                  boxShadow: '0 -5px 15px rgba(220, 38, 38, 0.9)',
                  animation: 'lavaSurface 1s ease-in-out infinite'
                }}
              />
              {/* Heat waves */}
              <div
                style={{
                  position: 'absolute',
                  top: -10,
                  left: 0,
                  width: '100%',
                  height: '30px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)',
                  animation: 'heatWaves 1.5s ease-in-out infinite'
                }}
              />
            </div>
          )}

          {/* Mystery Mode - Mystery Indicators */}
          {safeMode === 'challenge' && safeChallenge?.id === 'mystery' && mysteryEffect && (
            <div
              style={{
                position: 'absolute',
                left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 50,
                top: birdY - 50,
                width: 100,
                height: 100,
                zIndex: 8,
                pointerEvents: 'none'
              }}
            >
              {/* Mystery effect indicators based on current effect */}
              {mysteryEffect === 'wind' && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 80,
                    height: 80,
                    border: '2px solid #f59e0b',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.6,
                    animation: 'pulse 1s ease-in-out infinite'
                  }}
                />
              )}
              {mysteryEffect === 'gravityflip' && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 80,
                    height: 80,
                    border: '2px solid #8b5cf6',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.6,
                    animation: 'pulse 1.2s ease-in-out infinite'
                  }}
                />
              )}
              {mysteryEffect === 'speed' && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 80,
                    height: 80,
                    border: '2px solid #10b981',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.6,
                    animation: 'pulse 0.8s ease-in-out infinite'
                  }}
                />
              )}
              {mysteryEffect === 'night' && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 80,
                    height: 80,
                    border: '2px solid #6366f1',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.6,
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}
                />
              )}
              {mysteryEffect === 'ice' && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 80,
                    height: 80,
                    border: '2px solid #0ea5e9',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.6,
                    animation: 'pulse 1.3s ease-in-out infinite'
                  }}
                />
              )}
              {mysteryEffect === 'reverse' && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 80,
                    height: 80,
                    border: '2px solid #ec4899',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.6,
                    animation: 'pulse 1.1s ease-in-out infinite'
                  }}
                />
              )}
              {/* Mystery question mark in center */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 40,
                  height: 40,
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.8,
                  fontSize: '24px',
                  color: '#6366f1',
                  textAlign: 'center',
                  lineHeight: '40px',
                  fontWeight: 'bold',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              >
                ❓
              </div>
            </div>
          )}
          
          {/* Tap to Start/Continue Overlay */}
          {(showTapToStart || showTapToContinue) && !showInventoryModal && !showGameOverModal && !showReviveModal && !showSubscriptionPlans && !showRewardModal && !showSubscriptionPromo && !hideStartScreen && (
            <TapToStartOverlay birdSkin={resolvedBirdImg} forRevive={showTapToContinue} onStart={handleTapToStart} t={t} />
          )}
          
          {/* Weather effects disabled */}
          
          {/* Weather effects disabled */}
          {/* Pipes */}
          {hasPipes && pipes.map((pipe, i) => {
            // Dynamic pipe color per level in classic mode
            let pipeColor = 'linear-gradient(to right, #a8e063 70%, #56ab2f 100%)';
            if (mode === 'classic') {
              const levelIdx = (getUserLevel(score) - 1) % classicPipeColors.length;
              pipeColor = classicPipeColors[levelIdx];
            } else if (mode === 'endless') pipeColor = 'linear-gradient(to right, #a259e6 70%, #f472b6 100%)';
            else if (mode === 'challenge') {
              // Challenge-specific pipe colors for isolation testing
              const challengeColors = {
                'precision': 'linear-gradient(to right, #3b82f6 70%, #1d4ed8 100%)', // Blue
                'timebomb': 'linear-gradient(to right, #ef4444 70%, #dc2626 100%)', // Red
                'gravityflip': 'linear-gradient(to right, #8b5cf6 70%, #7c3aed 100%)', // Purple
                'windstorm': 'linear-gradient(to right, #f59e0b 70%, #d97706 100%)', // Orange
                'nightflight': 'linear-gradient(to right, #1f2937 70%, #111827 100%)', // Dark
                'speedrush': 'linear-gradient(to right, #10b981 70%, #059669 100%)', // Green
                'reverse': 'linear-gradient(to right, #ec4899 70%, #db2777 100%)', // Pink
                'shieldrun': 'linear-gradient(to right, #06b6d4 70%, #0891b2 100%)', // Cyan
                'lavaescape': 'linear-gradient(to right, #f97316 70%, #ea580c 100%)', // Orange-Red
                'iceslide': 'linear-gradient(to right, #0ea5e9 70%, #0284c7 100%)', // Light Blue
                'mystery': 'linear-gradient(to right, #6366f1 70%, #4f46e5 100%)', // Indigo
                'screampi': 'linear-gradient(to right, #84cc16 70%, #65a30d 100%)', // Lime
              };
              pipeColor = challengeColors[challenge?.id] || 'linear-gradient(to right, #ff512f 70%, #dd2476 100%)';
            }
            
            // Calculate responsive pipe width for mobile
            const pipeWidth = isMobile() ? Math.min(64, window.innerWidth * 0.15) : PIPE_WIDTH;
            let pipeX = isMobile() ? pipe.x * (window.innerWidth / GAME_WIDTH) : pipe.x;
            
            // Apply ice slide offset for sliding pipes
            if (safeMode === 'challenge' && safeChallenge?.id === 'iceslide') {
              pipeX += iceSlideOffset;
            }
            
            // Apply pipe rotation for Gravity Flip Mode
            const pipeRotation = safeMode === 'challenge' && safeChallenge?.id === 'gravityflip' ? 
              (challengeGravity === -1 ? 'rotate(180deg)' : 'rotate(0deg)') : 'rotate(0deg)';
            
            return (
              <React.Fragment key={i}>
                {/* Top pipe */}
                <div style={{ 
                  position: 'absolute', 
                  left: pipeX, 
                  top: 0, 
                  width: pipeWidth, 
                  height: pipe.gapY + 18, 
                  background: pipeColor, 
                  border: '3px solid #222', 
                  borderRadius: undefined,
                  zIndex: 2, 
                  display: 'block', 
                  overflow: 'visible',
                  transform: pipeRotation,
                  transformOrigin: 'center'
                }}>
                  <div style={{ position: 'absolute', left: 8, top: 0, width: 10, height: '100%', background: 'rgba(255,255,255,0.25)', borderRadius: 8, zIndex: 3 }} />
                  <div style={{
                    position: 'absolute',
                    left: -5,
                    bottom: -18,
                    width: pipeWidth + 10,
                    height: 18,
                    background: scene === 'ice' ? '#e0f7fa' : scene === 'lava' ? '#dd2476' : scene === 'dessert' ? '#ffd54f' : scene === 'rock' ? '#bdbdbd' : scene === 'land' ? '#8d5524' : '#4CAF50',
                    border: '3px solid #222',
                    borderRadius: '0 0 12px 12px',
                    zIndex: 4,
                  }} />
                </div>
                {/* Bottom pipe */}
                <div style={{ 
                  position: 'absolute', 
                  left: pipeX, 
                  top: pipe.gapY + getPipeGap(score, mode), 
                  width: pipeWidth, 
                  height: GAME_HEIGHT - (pipe.gapY + getPipeGap(score, mode)) + TOTAL_GROUND_HEIGHT, 
                  background: pipeColor, 
                  border: '3px solid #222', 
                  borderRadius: undefined, 
                  zIndex: 2, 
                  display: 'block', 
                  overflow: 'visible',
                  transform: pipeRotation,
                  transformOrigin: 'center'
                }}>
                  <div style={{ position: 'absolute', left: 8, top: 0, width: 10, height: '100%', background: 'rgba(255,255,255,0.25)', borderRadius: 8, zIndex: 3 }} />
                  <div style={{
                    position: 'absolute',
                    left: -5,
                    top: -18,
                    width: pipeWidth + 10,
                    height: 18,
                    background: scene === 'ice' ? '#e0f7fa' : scene === 'lava' ? '#dd2476' : scene === 'dessert' ? '#ffd54f' : scene === 'rock' ? '#bdbdbd' : scene === 'land' ? '#8d5524' : '#4CAF50',
                    border: '3px solid #222',
                    borderRadius: '12px 12px 0 0',
                    zIndex: 4,
                  }} />
                  {/* Pipe shadow at base */}
                  <svg width={pipeWidth} height={12} style={{ position: 'absolute', left: 0, bottom: -6, zIndex: 5 }}>
                    <ellipse cx={pipeWidth / 2} cy={6} rx={pipeWidth / 2.2} ry={5} fill="rgba(34,34,34,0.25)" />
                  </svg>
                  {/* Plant/grass at the base of the bottom pipe in classic mode */}
                  {mode === 'classic' && (
                    <svg width="32" height="18" style={{ position: 'absolute', left: pipeWidth / 2 - 16, bottom: -10, zIndex: 5 }} viewBox="0 0 32 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="16" cy="16" rx="16" ry="2" fill="#7d5a4e" opacity="0.3" />
                      <path d="M8 16 Q10 8 16 12 Q22 8 24 16" stroke="#43cea2" strokeWidth="3" fill="none" />
                      <path d="M12 16 Q14 12 16 16" stroke="#43cea2" strokeWidth="2" fill="none" />
                      <path d="M20 16 Q18 12 16 16" stroke="#43cea2" strokeWidth="2" fill="none" />
                    </svg>
                  )}
                </div>
              </React.Fragment>
            );
          })}
          {/* Bird */}
          <Bird
            key={equippedSkin?.id || 'default'}
            skin={getBirdImageSrc(equippedSkin)}
            y={birdY}
            velocity={birdVel}
            isDead={gameOver}
            activePowerUps={activePowerUps}
            turboActive={activePowerUps['turbo_start']}
            multiplierActive={activePowerUps['coin_multiplier']}
            isMobile={isMobile()}
            showReviveGlow={showReviveGlow}
            left={(mode === 'classic' || mode === 'endless' || mode === 'challenge') ? (isMobile() ? '12vw' : '8vw') : undefined}
            countdownFlap={showCountdown}
            // Add any other required props here, e.g. onFlap, className, style
          />
          
          {/* Enhanced Powerup Effects Around Bird */}
          {activePowerUps['shield'] && (
            <>
              {/* Enhanced Shield Bubble with Multiple Layers */}
              <div
                style={{
                  position: 'absolute',
                  left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 35,
                  top: birdY - 35,
                  width: BIRD_WIDTH + 70,
                  height: BIRD_HEIGHT + 70,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 80%)',
                  border: '4px solid rgba(99, 102, 241, 0.9)',
                  boxShadow: '0 0 40px rgba(99, 102, 241, 0.8), 0 0 80px rgba(99, 102, 241, 0.4), inset 0 0 20px rgba(99, 102, 241, 0.3)',
                  zIndex: 14,
                  pointerEvents: 'none',
                  animation: 'enhancedShieldPulse 2.5s infinite',
                }}
              />
              
              {/* Enhanced Shield Energy Rings */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={`enhanced-shield-ring-${i}`}
                  style={{
                    position: 'absolute',
                    left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 30 - i * 12,
                    top: birdY - 30 - i * 12,
                    width: BIRD_WIDTH + 60 + i * 24,
                    height: BIRD_HEIGHT + 60 + i * 24,
                    borderRadius: '50%',
                    border: `3px solid rgba(99, 102, 241, ${0.7 - i * 0.15})`,
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                    zIndex: 13 + i,
                    pointerEvents: 'none',
                    animation: `enhancedShieldRingPulse ${2.5 + i * 0.5}s infinite`,
                  }}
                />
              ))}
              
              {/* Enhanced Shield Particles with Dynamic Movement */}
              {[...Array(16)].map((_, i) => {
                const angle = (i * 22.5) * (Math.PI / 180);
                const radius = 50 + Math.random() * 20;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                return (
                  <div
                    key={`enhanced-shield-particle-${i}`}
                    style={{
                      position: 'absolute',
                      left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) + BIRD_WIDTH / 2 + x - 4,
                      top: birdY + BIRD_HEIGHT / 2 + y - 4,
                      width: 8,
                      height: 8,
                      background: 'radial-gradient(circle, #6366f1, #4f46e5)',
                      borderRadius: '50%',
                      zIndex: 15,
                      pointerEvents: 'none',
                      animation: `enhancedShieldParticleFloat ${3 + i * 0.2}s infinite linear`,
                      animationDelay: `${i * 0.2}s`,
                      boxShadow: '0 0 12px #6366f1, 0 0 24px rgba(99, 102, 241, 0.6)',
                    }}
                  />
                );
              })}
              
              {/* Shield Energy Waves */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={`shield-wave-${i}`}
                  style={{
                    position: 'absolute',
                    left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 40 - i * 15,
                    top: birdY - 40 - i * 15,
                    width: BIRD_WIDTH + 80 + i * 30,
                    height: BIRD_HEIGHT + 80 + i * 30,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)',
                    zIndex: 12 + i,
                    pointerEvents: 'none',
                    animation: `enhancedShieldWave ${4 + i}s infinite`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}
            </>
          )}
          
          {activePowerUps['magnet'] && (
            <>
              {/* Modern Magnet Field */}
              <div
                style={{
                  position: 'absolute',
                  left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 50,
                  top: birdY - 50,
                  width: BIRD_WIDTH + 100,
                  height: BIRD_HEIGHT + 100,
                  borderRadius: '50%',
                  border: '3px dashed rgba(34, 211, 238, 0.8)',
                  boxShadow: '0 0 40px 15px rgba(34, 211, 238, 0.4)',
                  background: 'radial-gradient(circle, rgba(34, 211, 238, 0.2) 60%, transparent 100%)',
                  zIndex: 13,
                  pointerEvents: 'none',
                  animation: 'magnetPulseModern 2.5s infinite',
                }}
              />
              {/* Enhanced Magnet Lines */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={`magnet-line-${i}`}
                  style={{
                    position: 'absolute',
                    left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) + BIRD_WIDTH / 2 - 1,
                    top: birdY + BIRD_HEIGHT / 2 - 1,
                    width: 2,
                    height: 80 + i * 12,
                    background: `linear-gradient(to bottom, #22d3ee, rgba(34, 211, 238, 0.3))`,
                    zIndex: 14,
                    pointerEvents: 'none',
                    animation: `magnetLineModern ${2 + i * 0.1}s infinite linear`,
                    animationDelay: `${i * 0.2}s`,
                    transform: `rotate(${i * 45}deg)`,
                    transformOrigin: 'center top',
                    borderRadius: '1px',
                  }}
                />
              ))}
              {/* Magnet Energy Waves */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={`magnet-wave-${i}`}
                  style={{
                    position: 'absolute',
                    left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 40 - i * 10,
                    top: birdY - 40 - i * 10,
                    width: BIRD_WIDTH + 80 + i * 20,
                    height: BIRD_HEIGHT + 80 + i * 20,
                    borderRadius: '50%',
                    border: `1px solid rgba(34, 211, 238, ${0.4 - i * 0.1})`,
                    zIndex: 12 + i,
                    pointerEvents: 'none',
                    animation: `magnetWave ${4 + i}s infinite`,
                  }}
                />
              ))}
            </>
          )}
          
          {activePowerUps['coin_multiplier'] && (
            <>
              {/* Modern Coin Multiplier Aura */}
              <div
                style={{
                  position: 'absolute',
                  left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 25,
                  top: birdY - 25,
                  width: BIRD_WIDTH + 50,
                  height: BIRD_HEIGHT + 50,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 60%, transparent 100%)',
                  boxShadow: '0 0 20px 10px rgba(251, 191, 36, 0.5)',
                  zIndex: 11,
                  pointerEvents: 'none',
                  animation: 'coinMultiplierPulseModern 1.5s infinite',
                }}
              />
              {/* Enhanced Floating Coins */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={`floating-coin-${i}`}
                  style={{
                    position: 'absolute',
                    left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) + BIRD_WIDTH / 2 - 10,
                    top: birdY + BIRD_HEIGHT / 2 - 10,
                    width: 20,
                    height: 20,
                    background: 'radial-gradient(circle, #fbbf24, #f59e0b)',
                    borderRadius: '50%',
                    border: '2px solid #fcd34d',
                    zIndex: 12,
                    pointerEvents: 'none',
                    animation: `floatingCoinModern ${3 + i * 0.4}s infinite ease-in-out`,
                    animationDelay: `${i * 0.5}s`,
                    boxShadow: '0 0 12px #fbbf24',
                  }}
                />
              ))}
              {/* Coin Multiplier Energy Spikes */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={`coin-spike-${i}`}
                  style={{
                    position: 'absolute',
                    left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) + BIRD_WIDTH / 2 - 2,
                    top: birdY + BIRD_HEIGHT / 2 - 2,
                    width: 4,
                    height: 30 + i * 5,
                    background: 'linear-gradient(to top, #fbbf24, transparent)',
                    zIndex: 13,
                    pointerEvents: 'none',
                    animation: `coinSpike ${2 + i * 0.2}s infinite`,
                    animationDelay: `${i * 0.3}s`,
                    transform: `rotate(${i * 60}deg)`,
                    transformOrigin: 'center bottom',
                    borderRadius: '2px',
                  }}
                />
              ))}
            </>
          )}
          
          {activePowerUps['turbo_start'] && (
            <>
              {/* Modern Turbo Speed Lines */}
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(162, 28, 175, 0.15) 50%, transparent 100%)',
                pointerEvents: 'none',
                zIndex: 6,
                animation: 'turboLinesModern 0.3s linear infinite',
              }} />
              {/* Turbo Energy Trails */}
              {[...Array(5)].map((_, i) => (
                <div
                  key={`turbo-trail-${i}`}
                  style={{
                    position: 'absolute',
                    left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 20 - i * 15,
                    top: birdY + BIRD_HEIGHT / 2 - 2,
                    width: 4,
                    height: 40 + i * 10,
                    background: 'linear-gradient(to right, #a21caf, rgba(162, 28, 175, 0.3))',
                    zIndex: 7,
                    pointerEvents: 'none',
                    animation: `turboTrail ${1 + i * 0.2}s infinite`,
                    animationDelay: `${i * 0.1}s`,
                    borderRadius: '2px',
                    transform: 'skew(-20deg)',
                  }}
                />
              ))}
              {/* Turbo Speed Particles */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={`turbo-particle-${i}`}
                  style={{
                    position: 'absolute',
                    left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 30 - i * 8,
                    top: birdY + Math.random() * BIRD_HEIGHT,
                    width: 3,
                    height: 3,
                    background: '#a21caf',
                    borderRadius: '50%',
                    zIndex: 8,
                    pointerEvents: 'none',
                    animation: `turboParticle ${0.8 + i * 0.1}s infinite linear`,
                    animationDelay: `${i * 0.05}s`,
                    boxShadow: '0 0 6px #a21caf',
                  }}
                />
              ))}
            </>
          )}
          
          {/* Power-up Activation Effect */}
          {powerUpActivationEffect && (
            <div
              style={{
                position: 'absolute',
                left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 50,
                top: birdY - 50,
                width: BIRD_WIDTH + 100,
                height: BIRD_HEIGHT + 100,
                borderRadius: '50%',
                background: powerUpActivationEffect === 'shield' ? 'radial-gradient(circle, #ffe06688 0%, transparent 70%)' :
                           powerUpActivationEffect === 'magnet' ? 'radial-gradient(circle, #38bdf888 0%, transparent 70%)' :
                           powerUpActivationEffect === 'turbo_start' ? 'radial-gradient(circle, #a259ff88 0%, transparent 70%)' :
                           powerUpActivationEffect === 'coin_multiplier' ? 'radial-gradient(circle, #ffd70088 0%, transparent 70%)' :
                           'radial-gradient(circle, #10b98188 0%, transparent 70%)',
                border: `6px solid ${
                  powerUpActivationEffect === 'shield' ? '#ffe066' :
                  powerUpActivationEffect === 'magnet' ? '#38bdf8' :
                  powerUpActivationEffect === 'turbo_start' ? '#a259ff' :
                  powerUpActivationEffect === 'coin_multiplier' ? '#ffd700' :
                  '#10b981'
                }`,
                boxShadow: `0 0 40px ${
                  powerUpActivationEffect === 'shield' ? '#ffe066' :
                  powerUpActivationEffect === 'magnet' ? '#38bdf8' :
                  powerUpActivationEffect === 'turbo_start' ? '#a259ff' :
                  powerUpActivationEffect === 'coin_multiplier' ? '#ffd700' :
                  '#10b981'
                }88`,
                zIndex: 20,
                pointerEvents: 'none',
                animation: 'powerUpActivation 2s ease-out',
              }}
            />
          )}
          
          {/* Revive Effect - SIMPLIFIED (no shield) */}
          {showReviveEffect && (
            <div
              style={{
                position: 'absolute',
                left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 20,
                top: birdY - 20,
                width: BIRD_WIDTH + 40,
                height: BIRD_HEIGHT + 40,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #00e6ff 0%, #00e6ff88 40%, transparent 80%)',
                boxShadow: '0 0 32px #00e6ffcc, 0 0 64px #00e6ff44',
                zIndex: 16,
                pointerEvents: 'none',
                animation: 'reviveGlowPulse 1.2s infinite',
              }}
            />
          )}
          {/* Enhanced Floating Coins with dynamic movement - allow gold rush coins during revive modal */}
          {!(showGameOverModal || showInventoryModal || showSubscriptionPlans || showRewardModal || showSubscriptionPromo || showCongratsModal) && 
            coins.map((coin) => (
              !coin.collected && (
                <div key={coin.id} style={{ 
                  position: 'absolute', 
                  left: coin.x, 
                  top: coin.y, 
                  zIndex: 15,
                  transform: `scale(${coin.scale || 1}) rotate(${coin.rotation || 0}deg)`,
                  transition: 'transform 0.1s ease-out'
                }}>
                  {/* Enhanced glow effect for better visibility */}
                  <div style={{
                    position: 'absolute',
                    left: -4,
                    top: -4,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: coin.value > 1 
                      ? 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0.1) 50%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(255,193,7,0.2) 0%, rgba(255,193,7,0.05) 50%, transparent 70%)',
                    animation: coin.value > 1 ? 'coinGlow 1.5s infinite alternate' : 'coinGlow 2s infinite alternate',
                    pointerEvents: 'none'
                  }} />
                  
                  <img 
                    src="/flappycoins.png" 
                    alt="Flappy Coin" 
                    style={{
                      width: coin.isGoldRush ? 52 : 48, // Slightly smaller for better performance
                      height: coin.isGoldRush ? 52 : 48,
                      filter: coin.isGoldRush 
                        ? 'drop-shadow(0 4px 16px #ffd700) brightness(1.4) contrast(1.1)' // Optimized filter
                        : coin.value > 1 
                          ? 'drop-shadow(0 4px 12px #ffd700) brightness(1.3) contrast(1.1)' 
                          : 'drop-shadow(0 3px 8px #eab30888) brightness(1.1)',
                      pointerEvents: 'none',
                      transition: 'all 0.15s ease-out', // Faster transition
                      // Optimized animation for gold rush coins
                      animation: coin.isGoldRush 
                        ? 'floatingCoin 1s infinite ease-in-out, coinBreathing 2.5s infinite ease-in-out' // Simplified animation
                        : coin.value > 1 
                          ? 'floatingCoin 1.2s infinite ease-in-out, coinBreathing 3s infinite ease-in-out, coinWiggle 2s infinite ease-in-out' 
                          : 'floatingCoin 1.8s infinite ease-in-out, coinBreathing 4s infinite ease-in-out, coinWiggle 3s infinite ease-in-out',
                      willChange: coin.isGoldRush ? 'transform, filter' : 'transform' // Optimize for animations
                    }}
                    draggable={false}
                  />
                  
                  {/* Enhanced value indicator for rare coins */}
                  {coin.value > 1 && (
                    <div style={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                      color: '#000',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: '3px solid #fff',
                      boxShadow: '0 2px 8px rgba(255,215,0,0.6)',
                      zIndex: 16,
                      animation: 'coinBounce 1s infinite alternate'
                    }}>
                      {coin.value}
                    </div>
                  )}
                  
                  {/* Sparkle effect for rare coins */}
                  {coin.value > 1 && (
                    <div style={{
                      position: 'absolute',
                      left: -8,
                      top: -8,
                      width: 64,
                      height: 64,
                      pointerEvents: 'none',
                      zIndex: 14
                    }}>
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            left: `${20 + i * 12}px`,
                            top: `${20 + i * 8}px`,
                            width: '4px',
                            height: '4px',
                            background: '#fff',
                            borderRadius: '50%',
                            animation: `sparkle ${1 + i * 0.2}s infinite`,
                            animationDelay: `${i * 0.3}s`
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            ))
          }

          {/* Falling Bombs for Challenge Time Bomb mode */}
          {safeMode === 'challenge' && safeChallenge?.id === 'timebomb' && bombs.map((bomb) => (
            <Bomb
              key={bomb.id}
              x={bomb.x}
              y={bomb.y}
              width={bomb.width}
              height={bomb.height}
              speed={bomb.speed}
            />
          ))}

          {/* Ground at the bottom, always above footer - now available in all game modes */}
          <Ground x={0} scene={
            safeMode === 'challenge' && safeChallenge 
              ? getChallengeGround(safeChallenge.id)
              : mode === 'endless' 
                ? 'rock'  // Endless mode uses rock ground for space theme
                : sceneToGround[scene] || 'grass'
          } />
        </div>
        {/* Footer (unified, only one panel) */}
        <div style={{ height: 80 }} />
        {!(showInventoryModal || showGameOverModal || showReviveModal || showSubscriptionPlans || showRewardModal || showSubscriptionPromo || showCongratsModal) && (
          <>
            <FooterPowerupBar
              powerUps={footerPowerUps}
              onActivate={handleActivatePowerup}
              gameMode={mode}
              level={getUserLevel(score)}
              levelLabel={getLevelLabel(score)}
              openInventory={handleOpenInventory}
              openPremium={handleOpenPremium}
              openShop={handleOpenShop}
              coinBalance={balance}
              equippedSkinImg={getBirdImageSrc(equippedSkin)}
              activePowerUps={activePowerUps}
            />
          </>
        )}

        
        {/* Optimized Star Field for Endless Mode */}
        {mode === 'endless' && (
          <StarField width={window.innerWidth} height={window.innerHeight} mode={mode} />
        )}
        
        {/* Modals and animated effects */}
        {showGameOverModal && (
          <GameOverModal
            isVisible={showGameOverModal}
            score={score}
            coins={coinsCollected}
            totalWallet={balance}
            onRestart={handlePlayAgain}
            onShare={handleShareScore}
            onHome={() => navigate('/home')}
            onRevive={() => {
              setShowReviveModal(true);
              setShowGameOverModal(false);
            }}
            reviveUsed={reviveUsed}
            level={getUserLevel(score)}
            bestScore={bestScore}
            extraLives={extraLives}
            onUseExtraLife={handleUseExtraLife}
            birdSkin={equippedSkin}
            leaderboard={leaderboard}
            onSubmitScore={handleSubmitScore}
            isPiUser={!!(profile && profile.pi_user_id)}
          />
        )}
        {showReviveModal && (
          hasActiveSubscription ? (
            <ReviveModalSubscription
              isVisible={showReviveModal}
              score={score}
              onRevive={doRevive}
              onDecline={handleReviveCancel}
              birdSkin={equippedSkin}
            />
          ) : (
            <ReviveModal
              isVisible={showReviveModal}
              score={score}
              onRevive={doRevive}
              onDecline={handleReviveCancel}
              onAdDecline={handleReviveCancel}
              reviveCount={reviveCount}
              noCancel={gamesPlayed % 4 === 3 && !adWatchedThisRevive}
              insufficientCoins={(profile?.total_coins || 0) < (10 + (reviveCount * 10))}
              forceAdRevive={gamesPlayed % 4 === 3 && !adWatchedThisRevive}
              birdSkin={equippedSkin}
              extraLives={extraLives}
              onUseExtraLife={handleUseExtraLife}
              gameMode={safeMode} // Pass the current game mode
            />
          )
        )}
        <SubscriptionPromoModal isOpen={showSubscriptionPromo} onClose={() => setShowSubscriptionPromo(false)} />
        <SubscriptionPlansModal isOpen={showSubscriptionPlans} onClose={() => setShowSubscriptionPlans(false)} onPurchase={handlePlanPurchase} />
        <EnhancedRewardModal 
          open={showRewardModal} 
          onClose={() => setShowRewardModal(false)} 
          rewards={pendingRewards}
          planName={pendingRewards.length > 0 ? pendingRewards[0]?.name?.split(' ')[0] + ' Plan' : 'Subscription'}
          planId={pendingRewards.length > 0 ? pendingRewards[0]?.id?.split('-')[0] : undefined}
          onClaim={handleClaimRewards}
        />
        
        {/* Challenge Reward Modal */}
        {rewardItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
              <div className="text-6xl mb-4">{rewardItem.icon}</div>
              <h2 className="text-2xl font-bold mb-2 text-green-700">Challenge Completed!</h2>
              <p className="text-lg text-gray-700 mb-4">You earned:</p>
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 mb-4 border-2 border-yellow-300">
                <div className="text-2xl font-bold text-yellow-800">{rewardItem.name}</div>
                <div className="text-sm text-gray-600 mt-1">{rewardItem.description}</div>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleClaimChallengeReward}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Claim Reward
                </button>
              </div>
            </div>
          </div>
        )}
        {planJustExpired && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full text-center">
              <h2 className="text-2xl font-bold mb-4">Your Premium Plan Has Expired</h2>
              <p className="mb-4">Your subscription benefits are no longer active. Renew to keep enjoying premium features!</p>
              <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold" onClick={() => setPlanJustExpired(false)}>OK</button>
            </div>
          </div>
        )}
        {/* Game UI */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 20, margin: '0 auto', color: '#fff', fontSize: 48, fontWeight: 'bold', textShadow: '2px 2px 8px #000', zIndex: 10, textAlign: 'center' }}>{score}</div>
        

        
        {/* Gold Rush Display - Allow during revive modal */}
        {showGoldRush && !showGameOverModal && !showInventoryModal && !showSubscriptionPlans && !showRewardModal && !showSubscriptionPromo && !showCongratsModal && (
          <>
            {/* Gold Rush Text - Optimized for Performance */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '20%',
              transform: 'translate(-50%, -50%)',
              color: '#ffd700',
              fontSize: 22, // Slightly smaller for better performance
              fontWeight: 'bold',
              zIndex: 1000,
              textAlign: 'center',
              animation: 'fadeInOut 1.2s ease-in-out', // Faster animation
              textShadow: '2px 2px 6px #000, 0 0 12px #ffd700', // Reduced shadow for performance
              pointerEvents: 'none',
              opacity: 0.95,
              width: 'auto',
              height: 'auto',
              willChange: 'transform, opacity' // Optimize for animations
            }}>
              {goldRushText}
            </div>
            
            {/* Optimized Gold Rush Indicator */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '15%',
              transform: 'translate(-50%, -50%)',
              width: 50, // Smaller for better performance
              height: 50,
              background: 'radial-gradient(circle, rgba(255,215,0,0.25) 0%, transparent 70%)', // Reduced opacity
              borderRadius: '50%',
              zIndex: 998,
              animation: 'fadeInOut 1.2s ease-in-out', // Faster animation
              pointerEvents: 'none',
              willChange: 'transform, opacity' // Optimize for animations
            }} />
          </>
        )}
        
        {/* Enhanced Power-up Visual Effects */}
        {powerUpGlow && (
          <>
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              background: `radial-gradient(circle at center, ${getPowerUpColor(powerUpGlow)}30 0%, ${getPowerUpColor(powerUpGlow)}15 40%, transparent 70%)`,
              pointerEvents: 'none',
              zIndex: 5,
              animation: 'pulse 1.5s ease-in-out'
            }} />
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              background: `radial-gradient(circle at center, ${getPowerUpColor(powerUpGlow)}20 0%, transparent 50%)`,
              pointerEvents: 'none',
              zIndex: 6,
              animation: 'pulse 2s ease-in-out infinite reverse'
            }} />
          </>
        )}
        
        {/* Enhanced Particle Systems */}
        {powerUpParticles.map((particle, index) => (
          <ParticleSystem
            key={`powerup-${index}`}
            x={particle.x}
            y={particle.y}
            type="powerup"
            onComplete={() => {
              setPowerUpParticles(prev => prev.filter((_, i) => i !== index));
            }}
          />
        ))}
        
        {/* Enhanced Power-up Effects */}
        {shieldActive && (
          <>
            <div style={{
              position: 'absolute',
              left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 25,
              top: birdY - 25,
              width: BIRD_WIDTH + 50,
              height: BIRD_HEIGHT + 50,
              borderRadius: '50%',
              border: '4px solid #6366f1',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 8,
              animation: 'shieldPulse 1.5s ease-in-out infinite',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.8), inset 0 0 20px rgba(99, 102, 241, 0.2)'
            }} />
            <div style={{
              position: 'absolute',
              left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 15,
              top: birdY - 15,
              width: BIRD_WIDTH + 30,
              height: BIRD_HEIGHT + 30,
              borderRadius: '50%',
              border: '2px solid #8b5cf6',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%)',
              pointerEvents: 'none',
              zIndex: 9,
              animation: 'shieldPulse 2s ease-in-out infinite reverse',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.6)'
            }} />
          </>
        )}
        
        {/* Magnet Effect */}
        {magnetActive && (
          <div style={{
            position: 'absolute',
            left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 20,
            top: birdY - 20,
            width: BIRD_WIDTH + 40,
            height: BIRD_HEIGHT + 40,
            borderRadius: '50%',
            border: '3px solid #22d3ee',
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, rgba(34, 211, 238, 0.05) 50%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 7,
            animation: 'magnetPulse 2s ease-in-out infinite',
            boxShadow: '0 0 15px rgba(34, 211, 238, 0.8), 0 0 30px rgba(34, 211, 238, 0.4)'
          }} />
        )}
        
        {/* Coin Multiplier Effect */}
        {coinMultiplier > 1 && (
          <>
            <div style={{
              position: 'absolute',
              left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 15,
              top: birdY - 15,
              width: BIRD_WIDTH + 30,
              height: BIRD_HEIGHT + 30,
              borderRadius: '50%',
              border: '2px solid #fbbf24',
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 50%, transparent 60%)',
              pointerEvents: 'none',
              zIndex: 6,
              animation: 'coinMultiplierPulse 1.5s ease-in-out infinite',
              boxShadow: '0 0 10px rgba(251, 191, 36, 0.8), 0 0 20px rgba(251, 191, 36, 0.4)'
            }} />
            {/* Coin Multiplier Badge */}
            <div style={{
              position: 'absolute',
              left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) + BIRD_WIDTH + 5,
              top: birdY - 5,
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              zIndex: 7,
              boxShadow: '0 2px 8px rgba(251, 191, 36, 0.6)',
              animation: 'pulse 1s ease-in-out infinite'
            }}>
              {coinMultiplier}x
            </div>
          </>
        )}
        
        {/* Turbo Effect */}
        {turboActive && (
          <>
            <div style={{
              position: 'absolute',
              left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) - 10,
              top: birdY - 10,
              width: BIRD_WIDTH + 20,
              height: BIRD_HEIGHT + 20,
              borderRadius: '50%',
              border: '2px solid #a21caf',
              background: 'radial-gradient(circle, rgba(162, 28, 175, 0.15) 0%, rgba(162, 28, 175, 0.05) 50%, transparent 50%)',
              pointerEvents: 'none',
              zIndex: 5,
              animation: 'turboPulse 0.8s ease-in-out infinite',
              boxShadow: '0 0 8px rgba(162, 28, 175, 0.8), 0 0 16px rgba(162, 28, 175, 0.4)'
            }} />
            {/* Score Multiplier Indicator */}
            <div style={{
              position: 'absolute',
              left: (isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08) + BIRD_WIDTH + 5,
              top: birdY + BIRD_HEIGHT / 2 - 10,
              background: 'linear-gradient(135deg, #a21caf, #7c3aed)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              zIndex: 6,
              boxShadow: '0 2px 8px rgba(162, 28, 175, 0.6)',
              animation: 'pulse 1s ease-in-out infinite'
            }}>
              {scoreMultiplier}x
            </div>
          </>
        )}
        
        {/* Enhanced Turbo Speed Lines */}
        {turboActive && (
          <>
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent 0%, #a21caf20 50%, transparent 100%)',
              pointerEvents: 'none',
              zIndex: 6,
              animation: 'turboLines 0.3s linear infinite'
            }} />
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent 0%, #fbbf2415 30%, #fbbf2415 70%, transparent 100%)',
              pointerEvents: 'none',
              zIndex: 7,
              animation: 'turboLines 0.5s linear infinite reverse'
            }} />
          </>
        )}
        
        {/* Enhanced Wallet Display - Top Right Corner - Hidden when modals are open */}
        {!(showGameOverModal || showReviveModal || showInventoryModal || showSubscriptionPlans || showRewardModal || showSubscriptionPromo || showCongratsModal) && (
          <div className="absolute top-4 right-4 z-50">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-yellow-400/30">
              <img src="/flappycoins.png" alt="Flappy Coin" className="w-6 h-6 drop-shadow-lg" />
              <div className="flex flex-col items-end">
                <span className="text-yellow-400 text-lg font-bold drop-shadow-lg">{balance.toLocaleString()}</span>
                {coinsCollected > 0 && (
                  <span className="text-yellow-300 text-xs drop-shadow-lg">+{coinsCollected} this game</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Performance Monitor - Disabled for better performance */}
        
        {/* Performance monitoring disabled for better performance */}
        {/* {fpsRef.current < 45 && (
          <div className="fixed top-4 left-4 bg-red-500 text-white px-3 py-1 rounded text-sm z-50">
            ⚠️ Low FPS: {fpsRef.current}
          </div>
        )} */}
        
        {/* Performance test button removed for better performance */}



        {/* Power-up Combo Indicator */}
        {powerUpCombo > 1 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
            backgroundSize: '400% 400%',
            animation: 'comboGradient 2s ease infinite',
            borderRadius: '50%',
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '3px solid rgba(255,255,255,0.8)',
          }}>
            {powerUpCombo}x
          </div>
        )}

        {/* Enhanced Power-up Particles */}
        {powerUpParticles.map((particle, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              background: particle.color,
              opacity: particle.life,
              pointerEvents: 'none',
              zIndex: 15,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              transform: `scale(${particle.life})`,
              animation: `particle${particle.type.charAt(0).toUpperCase() + particle.type.slice(1)} 1.5s ease-out forwards`,
            }}
          />
        ))}

      </ResponsiveGameArea>
      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-2xl font-bold"
              onClick={() => setShowInventoryModal(false)}
            >
              ×
            </button>
            {/* Render the inventory content here. You can extract the inventory rendering from InventoryPage into a new InventoryModal component for reuse. */}
            <InventoryPage />
          </div>
        </div>
      )}
      {/* Congrats Modal */}
      {showCongratsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[11000]">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-sm w-full text-center animate-bounceIn">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2 text-green-700">Congrats!</h2>
            <p className="text-lg text-gray-700 mb-2">You've subscribed to a premium plan!</p>
            <p className="text-base text-gray-500">Claim your exclusive rewards next!</p>
          </div>
        </div>
      )}
      {showLevelUpText && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: 170, // even more space below the score
          width: '100%',
          textAlign: 'center',
          zIndex: 21, // above coin, below modals
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: 28,
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 2px 12px #fff, 0 1px 4px #000, 0 0 2px #000, 0 0 8px #fff',
            opacity: 0.98,
            filter: 'drop-shadow(0 0 12px #fff)',
            animation: 'fadeInOut 2s',
            userSelect: 'none',
            letterSpacing: 1.2,
            marginTop: 32,
          }}>{levelUpText}</span>
        </div>
      )}
      <PowerUpProgress />
      
      {/* Countdown Display */}
      {showCountdown && countdown > 0 && (
        <div className="countdown-container">
          <div className="text-center" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%'
          }}>
            <div className="countdown-number">
              {countdown}
            </div>
            <div className="countdown-text">
              Get Ready!
            </div>
          </div>
        </div>
      )}

      {/* Power-up Expiration Notification */}
      {powerUpNotification && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-20 bg-red-500 text-white rounded-lg p-3 shadow-lg animate-pulse">
          <div className="text-center">
            <div className="text-sm font-medium">{powerUpNotification}</div>
          </div>
        </div>
      )}

    </ResponsiveGameContainer>
    </>
  );
};

// Add enhanced animations CSS
if (typeof window !== 'undefined' && document) {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes floatingCoin { 
      0% { transform: translateY(0); } 
      50% { transform: translateY(-16px); } 
      100% { transform: translateY(0); } 
    }
    @keyframes fadeInOut { 
      0% { opacity: 0; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.1); }
      100% { opacity: 0; transform: scale(1); }
    }
    @keyframes countdownPulse {
      0% { 
        transform: scale(0.8);
        opacity: 0;
      }
      20% {
        transform: scale(1.1);
        opacity: 1;
      }
      80% {
        transform: scale(1.05);
        opacity: 1;
      }
      100% { 
        transform: scale(1);
        opacity: 1;
      }
    }
    
    @keyframes countdownEntrance {
      0% {
        transform: translateY(-20px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .countdown-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      pointer-events: none;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(4px);
    }
    .countdown-number {
      font-size: 6rem;
      font-weight: 800;
      color: #ffffff;
      text-shadow: 
        0 2px 4px rgba(0,0,0,0.8),
        0 4px 8px rgba(0,0,0,0.6),
        0 8px 16px rgba(0,0,0,0.4);
      animation: countdownPulse 1s ease-in-out;
      line-height: 1;
      margin: 0;
      padding: 0;
      text-align: center;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 20px;
      padding: 2rem 3rem;
      box-shadow: 
        0 8px 32px rgba(59, 130, 246, 0.4),
        0 4px 16px rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
    .countdown-text {
      font-size: 1.25rem;
      color: #ffffff;
      text-shadow: 
        0 2px 4px rgba(0,0,0,0.8),
        0 4px 8px rgba(0,0,0,0.6);
      margin-top: 1rem;
      margin-bottom: 0;
      text-align: center;
      font-weight: 600;
      background: rgba(0, 0, 0, 0.7);
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      animation: countdownEntrance 0.5s ease-out 0.3s both;
    }
    @keyframes shieldPulse {
      0%, 100% { 
        transform: scale(1);
        opacity: 0.8;
      }
      50% { 
        transform: scale(1.1);
        opacity: 1;
      }
    }
    @keyframes turboLines {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    @keyframes activePulseModern {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 12px currentColor;
      }
      50% {
        transform: scale(1.3);
        box-shadow: 0 0 20px currentColor;
      }
    }
    @keyframes spinModern {
      from { transform: rotate(-90deg); }
      to { transform: rotate(270deg); }
    }
    @keyframes powerupGlowModern {
      0%, 100% {
        opacity: 0.3;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.05);
      }
    }
    @keyframes powerupFloatModern {
      0%, 100% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-4px) rotate(1deg);
      }
    }
    @keyframes comboGradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes particleShield {
      0% { transform: scale(0) rotate(0deg); opacity: 1; }
      100% { transform: scale(2) rotate(360deg); opacity: 0; }
    }
    @keyframes particleMagnet {
      0% { transform: scale(0) translateY(0); opacity: 1; }
      100% { transform: scale(1.5) translateY(-20px); opacity: 0; }
    }
    @keyframes particleCoin {
      0% { transform: scale(0) rotate(0deg); opacity: 1; }
      100% { transform: scale(1.2) rotate(180deg); opacity: 0; }
    }
    @keyframes particleTurbo {
      0% { transform: scale(0) translateX(0); opacity: 1; }
      100% { transform: scale(1.8) translateX(30px); opacity: 0; }
    }
    @keyframes particleExtra {
      0% { transform: scale(0); opacity: 1; }
      100% { transform: scale(2.5); opacity: 0; }
    }
    @keyframes magnetPulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.05); opacity: 0.9; }
    }
    @keyframes coinMultiplierPulse { 
      0%, 100% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.08); opacity: 1; }
    }
    @keyframes turboPulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.15); opacity: 1; }
    }
    @keyframes shieldActivation {
      0% { transform: scale(0.5); opacity: 0; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); opacity: 0; }
    }
    @keyframes magnetActivation {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 0; }
    }
    @keyframes coinMultiplierActivation {
      0% { transform: scale(0.4); opacity: 0; }
      50% { transform: scale(1.3); opacity: 1; }
      100% { transform: scale(1); opacity: 0; }
    }
    @keyframes turboSpeedLine {
      0% { transform: translateX(0) scale(0); opacity: 1; }
      50% { transform: translateX(100px) scale(1); opacity: 0.8; }
      100% { transform: translateX(200px) scale(0); opacity: 0; }
    }
    @keyframes extraLifeActivation {
      0% { transform: scale(0.2); opacity: 0; }
      50% { transform: scale(1.5); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }
    @keyframes reviveGlow { 
      0% { opacity: 1; transform: scale(1); } 
      100% { opacity: 0; transform: scale(1.5); } 
    }
    
    /* SIMPLIFIED Revive Animation Keyframes */
    @keyframes reviveGlowPulse {
      0%, 100% { 
        box-shadow: 0 0 32px #00e6ffcc, 0 0 64px #00e6ff44; 
        opacity: 0.8; 
        transform: scale(1);
      }
      50% { 
        box-shadow: 0 0 48px #32e6ffff, 0 0 96px #32e6ff88; 
        opacity: 1; 
        transform: scale(1.1);
      }
    }
    
    @keyframes pulse {
      0% { opacity: 0.3; }
      50% { opacity: 0.8; }
      100% { opacity: 0.3; }
    }
    @keyframes shieldPulse {
      0% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 0.8; }
    }
    @keyframes turboLines {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;
  document.head.appendChild(style);
}

export default ClassicMode; 