import React, { useRef, useState, useEffect } from 'react';
import Pipe from './Pipe';
// WeatherEffect import removed - weather effects disabled
import './Pipe.css';
import GameOverModal from './GameOverModal';
import ReviveModal from '../ReviveModal';
import SubscriptionPlansModal from '@/components/SubscriptionPlansModal';
import EnhancedRewardModal from '@/components/EnhancedRewardModal';
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
import FooterPowerupBar from './FooterPowerupBar';
import { useToast } from '../../hooks/use-toast';
import { isMobile } from '../../utils/browserDetection';
import { useGameEquipment } from '@/hooks/useGameEquipment';
import { inventoryService } from '@/services/inventoryService';
import { getPlanRewards, SubscriptionReward } from '@/constants/subscriptionRewards';
// import { testnetPaymentService } from '../../services/testnetPaymentService'; // Removed - testnet service disabled
import { realPiPaymentService } from '@/services/realPiPaymentService';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';
// Placeholder imports for subcomponents and hooks
// import Bird from './Bird';
// import Coin from './Coin';
// import Ground from './Ground';
// import GameOverModal from './GameOverModal';
// import ReviveModal from './ReviveModal';
// import AudioControls from './AudioControls';
// import { useUserProfile } from '@/hooks/useUserProfile';
// import { useAdCounter } from '@/hooks/useAdCounter';

const BIRD_WIDTH = 64;
const BIRD_HEIGHT = 64;
const GRAVITY = 0.4;
const FLAP_STRENGTH = -6;
const PIPE_WIDTH = BIRD_WIDTH;
const PIPE_HEIGHT = 320;
const PIPE_CAP_HEIGHT = 24;
const GAME_WIDTH = 480;
const GAME_HEIGHT = 800;
const COIN_SIZE = 48;
const BG_IMAGES = [
  '/background/background_grass.png',
  '/background/background_ice.png',
  '/background/background_land.png',
  '/background/background_lava.png',
  '/background/background_rock.png',
  '/background/background_dessert.png',
];

const getRandomPipeY = (gap, height) => {
  const minGapY = 40;
  const mobileHeight = isMobile ? window.innerHeight - 120 : height; // Account for mobile layout
  const maxGapY = mobileHeight - gap - (isMobile ? 80 : 56) - 16; // 16px buffer, account for footer
  return Math.floor(Math.random() * (maxGapY - minGapY + 1)) + minGapY;
};
const getRandomCoinY = () => Math.floor(Math.random() * (GAME_HEIGHT - 200)) + 80;

// SFX - Now handled by useSoundEffects hook to prevent duplicate audio instances
// Sound effects are managed centrally to avoid mobile audio conflicts
const sfx = {};
const playSFX = (name) => {
  // Sound effects are now handled by useSoundEffects hook
  console.debug(`Sound effect ${name} requested - handled by useSoundEffects hook`);
};

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
  mode?: 'classic' | 'endless' | 'challenge';
  challenge?: any; // Accepts challenge object for challenge mode
}

const THEME_MAP = {
  classic: { theme: 'morning', pipe: '/assets/pipe.png' },
  endless: { theme: 'night', pipe: null },
  challenge: { theme: 'lava', pipe: '/assets/pipe_red.png' },
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
  classic: "/birds/bird_0.png",
  red: "/birds/bird_1.png",
  blue: "/birds/bird_2.png",
  yellow: "/birds/bird_3.png",
  green: "/birds/bird_4.png",
  purple: "/birds/bird_5.png",
  pink: "/birds/bird_6.png",
  orange: "/birds/bird_7.png",
  cyan: "/birds/bird_8.png",
  magenta: "/birds/bird_9.png",
  dragon: "/birds/bird_10.png",
  gold: "/birds/bird_11.png",
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
    const endlessLevel = Math.floor(score / 5) + 1;
    return Math.max(getInterpolatedDifficulty(endlessLevel).pipeConfig.gapSize, MIN_PIPE_GAP);
  }
  if (score < 10) return 200; // Even easier for first 10 points
  if (score < 25) return 160; // Medium
  return MIN_PIPE_GAP; // Hard, but never less than MIN_PIPE_GAP
};

const getPipeSpeed = (score, mode = 'classic') => {
  if (mode === 'endless') {
    const endlessLevel = Math.floor(score / 5) + 1;
    // Scale to game speed (difficulty system is slower, so multiply for Flappy)
    return getInterpolatedDifficulty(endlessLevel).pipeConfig.speed * 4;
  }
  if (score < 10) return 4; // Easy
  if (score < 25) return 5; // Medium
  return 6; // Hard
};

// Much more random coin spawn positioning
const getRandomCoinSpawn = (gapY, gap, gameWidth, gameHeight, score = 0) => {
  const level = Math.floor(score / 5) + 1;
  let coinY;
  
  // Much more challenging positioning - closer to pipe edges
  if (level <= 5) {
    // Early levels: coins closer to pipe edges
    const safeZoneTop = gapY + 15;
    const safeZoneBottom = gapY + gap - 15;
    coinY = safeZoneTop + Math.random() * (safeZoneBottom - safeZoneTop);
  } else {
    // Higher levels: even more challenging positioning
    const safeZoneTop = gapY + 20;
    const safeZoneBottom = gapY + gap - 20;
    coinY = safeZoneTop + Math.random() * (safeZoneBottom - safeZoneTop);
  }
  
  // Add much more random horizontal positioning
  const baseX = gameWidth + 120 + (Math.random() * 300);
  const randomOffsetX = (Math.random() - 0.5) * 100; // ±50px horizontal offset
  const randomOffsetY = (Math.random() - 0.5) * 80; // ±40px vertical offset
  
  return { 
    x: baseX + randomOffsetX, 
    y: coinY + randomOffsetY, 
    phase: Math.random() * Math.PI * 2 
  };
};

// Move these above ClassicMode:
const availablePowerUps = [
  { id: 'shield', name: 'Shield', icon: '/powerups/shield.png' },
  { id: 'magnet', name: 'Magnet', icon: '/powerups/coin-magnet.png' },
  { id: 'extra_life', name: 'Extra Life', icon: '/powerups/extra-life.png' },
  { id: 'turbo_start', name: 'Turbo Start', icon: '/powerups/turbo-start.png' },
  { id: 'coin_multiplier', name: '2x Multiplier', icon: '/powerups/2x-coin-multiplier.png' }
];

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
const TapToStartOverlay = ({ birdSkin, forRevive }) => {
  return (
    <div style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(255,255,255,0.0)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <style>{`
        @keyframes tap-tap-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .tap-to-start-bird {
          animation: tap-tap-float 1.5s ease-in-out infinite;
          width: 80px;
          height: 80px;
          margin-bottom: 20px;
        }
      `}</style>
      <img src={getBirdImageSrc(birdSkin)} alt="Your Bird" className="tap-to-start-bird" />
      <div style={{
        fontSize: 48,
        fontWeight: 900,
        color: '#fff',
        textShadow: '3px 3px 0 #000, 6px 6px 12px rgba(0,0,0,0.7)',
        letterSpacing: 1.5,
        padding: '12px 32px',
        borderRadius: 16,
        background: 'rgba(0,0,0,0.10)',
      }}>{forRevive ? "Tap to Continue" : "Tap to Start"}</div>
      {!forRevive && <p className="text-white text-lg mt-2" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>Tap anywhere to make Flappy fly!</p>}
    </div>
  );
};

const ClassicMode: React.FC<ClassicModeProps> = ({ mode = 'classic', challenge }) => {
  const navigate = useNavigate();
  const { profile, updateProfile, hasActiveSubscription } = useUserProfile();
  const { addCoins } = useWallet();
  const { addItem } = useInventory();
  const { toast } = useToast();
  const {
    availablePowerUps,
    activePowerUps,
    isShieldActive,
    isMagnetActive,
    isExtraLifeActive,
    isCoinMultiplierActive,
    isTurboActive,
    activatePowerUp,
    useExtraLife,
    getPowerUpStatus,
    isPowerUpActive,
    getActiveEffects,
    refreshEquipment,
    equippedSkin
  } = useGameEquipment();

  // Fix: Define activeEffects at the top, before any useEffect or function that uses it
  const activeEffects = getActiveEffects();

  // Get equipped bird skin
  const birdImg = getBirdImageSrc(equippedSkin);
  
  // FIXED: Improved extra lives calculation with better inventory sync
  useEffect(() => {
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
  }, [availablePowerUps, profile, activeEffects]);

  // FIXED: Add effect to refresh equipment when inventory updates
  useEffect(() => {
    const handleInventoryUpdate = (event: CustomEvent) => {
      refreshEquipment();
    };

    window.addEventListener('inventory-updated', handleInventoryUpdate);
    
    return () => {
      window.removeEventListener('inventory-updated', handleInventoryUpdate);
    };
  }, [refreshEquipment]);
  
  // Ensure coinsCollected is declared only once and before any use
  const [coinsCollected, setCoinsCollected] = useState(0);

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [coinPos, setCoinPos] = useState({ x: GAME_WIDTH + 300, y: 200, phase: Math.random() * Math.PI * 2 });
  const [showRevive, setShowRevive] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showReviveModal, setShowReviveModal] = useState(false);
  const [showTapToStart, setShowTapToStart] = useState(true);
  const [showTapToContinue, setShowTapToContinue] = useState(false);
  const [reviveCancelCount, setReviveCancelCount] = useState(0);
  const [reviveCount, setReviveCount] = useState(0); // Track total revives used in this game
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [adWatchedThisRevive, setAdWatchedThisRevive] = useState(false);
  const [showSubscriptionPromo, setShowSubscriptionPromo] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [pendingRewards, setPendingRewards] = useState<SubscriptionReward[]>([]);
  const [planJustExpired, setPlanJustExpired] = useState(false);
  const [extraLives, setExtraLives] = useState(0);
  const [showCoinAnim, setShowCoinAnim] = useState(false);
  const [coinAnimKey, setCoinAnimKey] = useState(0);
  // Game refs (bird, pipes, etc.)
  const gameRef = useRef<HTMLDivElement>(null);

  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [birdVel, setBirdVel] = useState(0);
  // Pipes state: each entry is a pair (x, gapY)
  type Pipe = { x: number; gapY: number; height?: number };
  const [pipes, setPipes] = useState<Pipe[]>([{ x: GAME_WIDTH + 100, gapY: getRandomPipeY(getPipeGap(score, mode), GAME_HEIGHT) }]);

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
    // Refresh inventory image paths to ensure correct skin images
    inventoryService.refreshInventoryImagePaths();
  }, []);

  // Add state to track coin availability and spawn timer
  const [coinAvailable, setCoinAvailable] = useState(true);
  const coinSpawnTimer = useRef<NodeJS.Timeout | null>(null);

  // Add state to track coins left in the current level
  const [coinsLeftThisLevel, setCoinsLeftThisLevel] = useState(3 + Math.floor(Math.random() * 2)); // 3 or 4

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

  // Helper: get challenge rule
  const getRule = (key, fallback) => challenge?.rules && challenge.rules[key] !== undefined ? challenge.rules[key] : fallback;

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
    setNightLight(false);
    setMysteryEffect(null);
    setChallengeComplete(false);
    // Precision Mode: no timer needed
    if (challenge.id === 'timebomb') {
      setChallengeTimer(getRule('timer', 15));
    }
    if (challenge.id === 'nightflight') {
      setNightLight(true);
    }
    if (challenge.id === 'shieldrun') {
      setChallengeShield(true);
    }
    if (challenge.id === 'lavaescape') {
      setLavaY(GAME_HEIGHT - 10);
    }
  }, [mode, challenge]);

  // Challenge timers and intervals
  useEffect(() => {
    if (mode !== 'challenge' || !challenge || !gameStarted || gameOver) return;
    let timerInt: any;
    let windInt: any;
    let gravityInt: any;
    let speedInt: any;
    let mysteryInt: any;
    // Time Bomb
    if (challenge.id === 'timebomb') {
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
    // Gravity Flip
    if (challenge.id === 'gravityflip') {
      gravityInt = setInterval(() => {
        setChallengeGravity((g) => -g);
      }, getRule('gravityFlipInterval', 10) * 1000);
    }
    // Wind Storm
    if (challenge.id === 'windstorm') {
      windInt = setInterval(() => {
        setChallengeWind(Math.random() < 0.5 ? -1 : 1);
        setTimeout(() => setChallengeWind(0), 2000 + Math.random() * 2000);
      }, 4000 + Math.random() * 3000);
    }
    // Speed Rush
    if (challenge.id === 'speedrush') {
      speedInt = setInterval(() => {
        setCameraShake((s) => s + 1);
      }, 3000);
    }
    // Mystery Mode
    if (challenge.id === 'mystery') {
      mysteryInt = setInterval(() => {
        const effects = ['gravityflip', 'wind', 'speed', 'night'];
        setMysteryEffect(effects[Math.floor(Math.random() * effects.length)]);
      }, 15000);
    }
    return () => {
      if (timerInt) clearInterval(timerInt);
      if (windInt) clearInterval(windInt);
      if (gravityInt) clearInterval(gravityInt);
      if (speedInt) clearInterval(speedInt);
      if (mysteryInt) clearInterval(mysteryInt);
    };
  }, [mode, challenge, gameStarted, gameOver]);

  // Challenge: Lava Escape (rising lava)
  useEffect(() => {
    if (mode !== 'challenge' || !challenge || challenge.id !== 'lavaescape' || !gameStarted || gameOver) return;
    const int = setInterval(() => {
      setLavaY((y) => Math.max(0, y - 2));
      if (birdY + BIRD_HEIGHT > lavaY) {
        setGameOver(true);
        setShowGameOverModal(true);
      }
    }, 1000 / 30);
    return () => clearInterval(int);
  }, [mode, challenge, gameStarted, gameOver, lavaY, birdY]);

  // Challenge: Ice Slide (pipes slide)
  useEffect(() => {
    if (mode !== 'challenge' || !challenge || challenge.id !== 'iceslide' || !gameStarted || gameOver) return;
    const int = setInterval(() => {
      setIceSlideOffset((o) => o + (Math.random() - 0.5) * 2);
    }, 1000 / 30);
    return () => clearInterval(int);
  }, [mode, challenge, gameStarted, gameOver]);

  // Challenge: Completion logic (example for timebomb, can expand for others)
  useEffect(() => {
    if (mode !== 'challenge' || !challenge || !gameStarted || gameOver) return;
    // Example: Time Bomb, pass enough pipes
    if (challenge.id === 'timebomb' && score >= getRule('pipesToPass', 10)) {
      setChallengeComplete(true);
      setGameOver(true);
      setShowGameOverModal(true);
    }
    // Windstorm: survive X seconds
    if (challenge.id === 'windstorm' && score >= getRule('surviveSeconds', 30)) {
      setChallengeComplete(true);
      setGameOver(true);
      setShowGameOverModal(true);
    }
  }, [mode, challenge, gameStarted, gameOver, score]);

  // --- Override core mechanics in game loop and handlers ---
  // Example: override gravity, flap, pipe gap, etc. based on challenge
  const effectiveGravity = mode === 'challenge' && challenge ? (
    challenge.id === 'gravityflip' ? 0.5 * challengeGravity :
    challenge.id === 'mystery' && mysteryEffect === 'gravityflip' ? -0.5 :
    0.5
  ) : 0.5;
  const effectiveFlap = mode === 'challenge' && challenge ? (
    challenge.id === 'precision' ? getRule('flapStrength', -6) :
    challenge.id === 'reverse' ? 8 :
    -8
  ) : -8;
  const effectivePipeGap = mode === 'challenge' && challenge ? (
    challenge.id === 'precision' ? getRule('pipeGap', 90) :
    challenge.id === 'iceslide' ? 120 :
    140
  ) : getPipeGap(score, mode);
  const effectivePipeSpeed = mode === 'challenge' && challenge ? (
    challenge.id === 'speedrush' ? 8 + score * 0.1 :
    4
  ) : getPipeSpeed(score, mode);

  // Wind effect on bird
  const windForce = mode === 'challenge' && challenge && (challenge.id === 'windstorm' || (challenge.id === 'mystery' && mysteryEffect === 'wind')) ? challengeWind * 0.7 : 0;

  // Night mode overlay
  const isNight = mode === 'challenge' && challenge && (challenge.id === 'nightflight' || (challenge.id === 'mystery' && mysteryEffect === 'night'));

  // Camera shake for speedrush
  const shakeStyle = cameraShake > 0 ? { transform: `translate(${Math.random() * 8 - 4}px, ${Math.random() * 8 - 4}px)` } : {};

  // --- Override event handlers ---
  const handleFlapChallenge = () => {
    if (showGameOverModal || gameOver) return;
    if (!gameStarted) {
      setGameStarted(true);
      setShowTapToStart(false);
      setShowTapToContinue(false);
    }
    if (mode === 'challenge' && challenge) {
      if (challenge.id === 'reverse') {
        setBirdVel(8); // Tap makes bird fall
      } else {
        setBirdVel(effectiveFlap);
      }
    } else {
      setBirdVel(FLAP_STRENGTH);
    }
    playSFX('wing');
  };

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const interval = setInterval(() => {
      setBirdY((y) => y + birdVel);
      setBirdVel((v) => v + GRAVITY);
      setPipes((oldPipes) => {
        let newPipes = oldPipes.map((pipe) => ({ ...pipe, x: pipe.x - effectivePipeSpeed }));
        // Remove off-screen pipes and add a new one if needed
        if (newPipes.length && newPipes[0].x < -PIPE_WIDTH) {
          newPipes.shift();
          setScore((s) => s + 1);
          playSFX('point');
          setCoinAvailable(false);
          // Much more restrictive coin spawning - very limited coins per level
          const level = Math.floor(score / 5) + 1;
          let coinCount;
          if (level <= 3) {
            coinCount = Math.random() < 0.6 ? 1 : 0; // 60% chance for 1 coin in early levels
          } else if (level <= 8) {
            coinCount = Math.random() < 0.4 ? 1 : 0; // 40% chance for 1 coin in mid levels
          } else if (level <= 15) {
            coinCount = Math.random() < 0.25 ? 1 : 0; // 25% chance for 1 coin in high levels
          } else {
            coinCount = Math.random() < 0.15 ? 1 : 0; // 15% chance for 1 coin in expert levels
          }
          setCoinsLeftThisLevel(coinCount);
          if (coinSpawnTimer.current) clearTimeout(coinSpawnTimer.current);
          coinSpawnTimer.current = setTimeout(() => {
            setCoinAvailable(true);
          }, 1500 + Math.random() * 1000); // 1.5-2.5s delay (much slower respawn)
        }
        if (newPipes.length === 0) {
          // Always use classic-style pipes for all modes
          newPipes.push({ x: GAME_WIDTH, gapY: getRandomPipeY(getPipeGap(score, mode), GAME_HEIGHT) });
        }
        return newPipes;
      });
      setCoinPos((pos) => {
        // Sine wave movement
        const amplitude = 32 + Math.random() * 16; // randomize amplitude a bit
        const freq = 0.04 + Math.random() * 0.02; // randomize frequency a bit
        let newX = pos.x - effectivePipeSpeed;
        let newPhase = pos.phase + freq;
        let newY = pos.y + Math.sin(newPhase) * amplitude * freq;
        if (newX < -COIN_SIZE) {
          // Respawn coin at random position
          const pipe = pipes[0] || { gapY: 100 };
          const { x, y } = getRandomCoinSpawn(pipe.gapY, getPipeGap(score, mode), GAME_WIDTH, GAME_HEIGHT, score);
          return { x, y, phase: Math.random() * Math.PI * 2 };
        }
        return { ...pos, x: newX, y: newY, phase: newPhase };
      });
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, birdVel]);

  // Add invincibility state
  const [isInvincible, setIsInvincible] = useState(false);
  const [showReviveEffect, setShowReviveEffect] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [showReviveGlow, setShowReviveGlow] = useState(false);

  // Collision detection
  useEffect(() => {
    const checkCollisions = async () => {
      if (!gameStarted || gameOver || isInvincible || shieldActive) return;
    
      // Helper function to handle collision with power-up effects
      const handleCollisionWithPowerUps = async () => {
        // Check for shield first
        if (shieldActive) {
          setShieldActive(false);
          toast({
            title: 'Shield Used! 🛡️',
            description: 'Your shield protected you from that collision.',
            duration: 3000,
          });
          return false; // Don't end game
        }
        
        // Check for extra life
        const extraLifePowerup = availablePowerUps.find(p => p.id === 'extra_life');
        if (getActiveEffects().hasExtraLife && extraLifePowerup && extraLifePowerup.quantity > 0) {
          activatePowerUp('extra_life');
          
          console.log('💖 Extra life used - calling EXACT SAME revive logic as paid coins');
          
          // Use the EXACT SAME revive logic as paid Flappy coin revives
          handleReviveAd('extra_life');
          
          toast({
            title: 'Extra Life Used! 💖',
            description: 'You have been revived! You are protected for 5 seconds.',
            duration: 3000,
          });
          
          return false; // Don't end game
        }
        
        return true; // End game
      };
      
      // Top/bottom
      if (birdY < 0) {
        setBirdY(0); // Stop at ceiling
        const shouldEndGame = await handleCollisionWithPowerUps();
        if (shouldEndGame) {
          setGameOver(true);
          setGameStarted(false);
          setShowReviveModal(true);
          setShowGameOverModal(false);
          setReviveUsed(false);
          playSFX('dead');
          playSFX('die');
        }
        return;
      }
      if (birdY + BIRD_HEIGHT > GAME_HEIGHT) {
        setBirdY(GAME_HEIGHT - BIRD_HEIGHT); // Stop at ground
        const shouldEndGame = await handleCollisionWithPowerUps();
        if (shouldEndGame) {
          setGameOver(true);
          setGameStarted(false);
          setShowReviveModal(true);
          setShowGameOverModal(false);
          setReviveUsed(false);
          playSFX('dead');
          playSFX('die');
        }
        return;
      }
      // Pipes - Fixed collision detection with proper bird positioning
      const birdX = isMobile() ? window.innerWidth * 0.12 : window.innerWidth * 0.08; // Match Bird component positioning
      const birdLeft = birdX;
      const birdRight = birdX + BIRD_WIDTH;
      const birdTop = birdY;
      const birdBottom = birdY + BIRD_HEIGHT;
      
      for (const pipe of pipes) {
        // Check horizontal overlap with pipe
        if (pipe.x < birdRight && pipe.x + PIPE_WIDTH > birdLeft) {
          const gapTop = pipe.gapY;
          const gapBottom = pipe.gapY + getPipeGap(score, mode);
          
          // FIXED: More precise collision detection with smaller tolerance
          const collisionTolerance = 2; // 2px tolerance for more accurate detection
          const inGap = birdTop >= gapTop - collisionTolerance && birdBottom <= gapBottom + collisionTolerance;
          
          if (!inGap) {
            console.log(`💥 Pipe collision detected in paln mode:`, {
              birdY: Math.round(birdY),
              birdTop: Math.round(birdTop),
              birdBottom: Math.round(birdBottom),
              gapTop: Math.round(gapTop),
              gapBottom: Math.round(gapBottom),
              gapSize: Math.round(gapBottom - gapTop),
              pipeX: Math.round(pipe.x),
              tolerance: collisionTolerance
            });
            
            const shouldEndGame = await handleCollisionWithPowerUps();
            if (shouldEndGame) {
              setGameOver(true);
              setGameStarted(false);
              setShowReviveModal(true);
              setShowGameOverModal(false);
              setReviveUsed(false);
              playSFX('hit');
            }
            return;
          }
        }
      }
      // Coin collision (make easier by increasing hitbox)
      if (
        coinAvailable &&
        coinPos.x < GAME_WIDTH / 4 + BIRD_WIDTH + 16 &&
        coinPos.x + COIN_SIZE > GAME_WIDTH / 4 - 16 &&
        birdY + BIRD_HEIGHT + 16 > coinPos.y &&
        birdY - 16 < coinPos.y + COIN_SIZE
      ) {
        setCoinAvailable(false);
        
        // Apply coin multiplier from powerups
        const coinMultiplierPowerup = availablePowerUps.find(p => p.id === 'coin_multiplier');
        const coinsToAdd = 1 * (coinMultiplierPowerup ? coinMultiplierPowerup.quantity : 1);
        addCoins(coinsToAdd); // Add to global wallet
        
        if (profile) {
          (async () => {
            await updateProfile({ total_coins: (profile.total_coins || 0) + coinsToAdd });
          })();
          playSFX('flappycoins');
          setCoinsCollected(prev => prev + coinsToAdd);
          setCoinsLeftThisLevel((c) => c - 1);
          if (coinsLeftThisLevel > 1) {
            // Much more restrictive respawn - only 30% chance to respawn another coin
            if (Math.random() < 0.3) {
              const pipe = pipes[0] || { gapY: 100 };
              const { x, y } = getRandomCoinSpawn(pipe.gapY, getPipeGap(score, mode), GAME_WIDTH, GAME_HEIGHT, score);
              setTimeout(() => {
                setCoinPos({ x, y, phase: Math.random() * Math.PI * 2 });
                setCoinAvailable(true);
              }, 1800 + Math.random() * 1200); // 1.8-3s delay (much slower respawn)
            }
          }
          playSFX('point');
        }
      }
    };
    
    checkCollisions();
  }, [birdY, pipes, coinPos, gameStarted, gameOver, isInvincible, shieldActive, profile, getActiveEffects, getPowerUpStatus, addCoins, updateProfile, coinsCollected, coinsLeftThisLevel, showReviveEffect]);

  // Start game on tap/click
  const handleFlap = handleFlapChallenge;

  // Handle restart
  const handleRestart = () => {
    setGamesPlayed(g => g + 1); // Increment games played on new game
    setBirdY(GAME_HEIGHT / 2);
    setBirdVel(0);
    setPipes([{ x: GAME_WIDTH + 100, gapY: getRandomPipeY(getPipeGap(score, mode), GAME_HEIGHT) }]);
    setScore(0);
    setCoinPos({ x: GAME_WIDTH + 300, y: 200, phase: Math.random() * Math.PI * 2 });
    setGameStarted(false);
    setGameOver(false);
    setShowGameOverModal(false);
    setShowTapToStart(true);
    setReviveCancelCount(0); // reset on new game
    setReviveCount(0); // Reset revive count to start fresh at 10 coins
  };

  const bgClass = {
    classic: 'bg-classic',
    bamboo: 'bg-bamboo',
    neon: 'bg-neon',
    fire: 'bg-fire',
    ice: 'bg-ice',
    challenge: 'bg-challenge',
  }[mode];

  const hasPipes = true;
  const hasPowerUps = availablePowerUps && availablePowerUps.length > 0;

  // On revive via ad or coins, revive bird in safe area and continue game
  const handleReviveAd = (reviveType?: 'coin' | 'ad' | 'premium' | 'extra_life') => {
    // Only increment revive count for progressive cost when user pays with coins
    if (reviveType === 'coin') {
      setReviveCount(prev => prev + 1);
    }
    
    // SUPER AGGRESSIVE CLEARING - Clear ALL pipes and obstacles within a large radius
    setPipes(prevPipes => prevPipes.filter(pipe => pipe.x > GAME_WIDTH * 0.8)); // Clear 80% of screen
    // setCoins removed - coins are handled by coinPos state
    
    // Position bird in the SAFEST possible position (left side, center height)
    const safeY = GAME_HEIGHT * 0.5 - BIRD_HEIGHT / 2;
    setBirdY(safeY);
    setBirdVel(-1); // Very gentle upward velocity
    
    // Reset game state
    setGameOver(false);
    setGameStarted(false); // Wait for tap to continue
    setShowTapToContinue(true);
    setShowReviveModal(false);
    setReviveUsed(true);
    
    // REMOVED SHIELD EFFECTS - Only invincibility for a short time
    setIsInvincible(true);
    
    // Show revive effects
    setShowReviveEffect(true);
    setShowReviveGlow(true);
    
    // Clear effects after delay
    setTimeout(() => setShowReviveEffect(false), 1200);
    
    // SHORT INVINCIBILITY - 3 seconds instead of 5, no shield
    setTimeout(() => {
      setIsInvincible(false);
      setShowReviveGlow(false);
    }, 3000);
    
    // Additional safety: Create a "safe zone" by spawning new pipes further away
    setTimeout(() => {
      // Add a new pipe pair far ahead to ensure safe spacing
      const newPipeX = GAME_WIDTH + 200; // Far ahead
      const newPipeGapY = getRandomPipeY(getPipeGap(score, mode), GAME_HEIGHT);
      setPipes(prevPipes => [...prevPipes, { x: newPipeX, gapY: newPipeGapY }]);
    }, 1000); // Add new pipe after 1 second
  };
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
  if (mode === 'endless') {
    backgroundStyle = { background: theme.bg, minHeight: GAME_HEIGHT };
  } else if (mode === 'classic') {
    backgroundStyle = { background: theme.bg, minHeight: GAME_HEIGHT };
  } else {
    backgroundStyle = { background: `url(${modeBackgroundMap[mode]}) center/cover no-repeat`, minHeight: GAME_HEIGHT };
  }

  // Get powerups for footer display
  const footerPowerUps = availablePowerUps
    .map(powerup => ({
      id: powerup.id,
      name: powerup.name,
      icon: powerup.icon,
      quantity: powerup.quantity
    }))
    .filter(pu => pu.quantity > 0);

  // On play again, play playbutton SFX
  const handlePlayAgain = () => {
    playSFX('playbutton');
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
  };

  // Define the ground height constant
  const GROUND_HEIGHT = 64; // px, matches the height used for ground in the render

  // Add the share handler inside ClassicMode:
  const handleShareScore = () => {
    const shareText = `I scored ${score} in Flappy Pi! Can you beat me? Play now: https://flappypi.fun`;
    if (navigator.share) {
      navigator.share({
        title: 'Flappy Pi',
        text: shareText,
        url: 'https://flappypi.fun',
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

  useEffect(() => {
    if (showGameOverModal) {
      playSFX('gameover');
    }
  }, [showGameOverModal]);

  useEffect(() => {
    // Show subscription promo modal after 10 seconds if not subscribed and not seen in this session
    if (profile && !profile.has_active_subscription && !sessionStorage.getItem('hasSeenSubscriptionPromoInGame')) {
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
      if (now > end && profile.subscription_status === 'active') {
        updateProfile({ subscription_status: 'expired' });
        setPlanJustExpired(true);
      }
    }
  }, [profile]);

  // Handle plan purchase and reward claim
  const handlePlanPurchase = async (plan) => {
    try {
      // Real Pi Network payment processing
      if (typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not available. Please use Pi Browser.');
      }

      console.log('Processing real Pi payment for plan:', plan.id);
      
      // Use real Pi payment service
      const result = await realPiPaymentService.processSubscriptionPayment({
        id: plan.id,
        name: plan.name,
        price: plan.price
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Payment was not completed. Plan not activated.');
      }
      // Set expiration
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + (plan.durationDays || 7));
      await updateProfile({
        subscription_status: 'active',
        subscription_plan: plan.id,
        subscription_end: expiration.toISOString(),
      });
      // Get rewards from the new reward system
      const planRewards = getPlanRewards(plan.id);
      setPendingRewards(planRewards);
      setShowRewardModal(true);
    } catch (error) {
      // Show error toast or alert
      alert(error.message || 'Mock payment was not completed. Plan not activated.');
    }
  };

  const handleClaimRewards = async () => {
    // Rewards are automatically saved to inventory by EnhancedRewardModal
    setShowRewardModal(false);
    setPendingRewards([]);
  };

  // Handler for activating a powerup from the footer
  const handleActivatePowerup = async (id: string) => {
    const success = await activatePowerUp(id);
    if (success) {
      // Powerup effects are handled by the useEffect above
      
      // Show toast notification
      const powerup = availablePowerUps.find(p => p.id === id);
      if (powerup) {
        toast({
          title: `⚡ ${powerup.name} Activated!`,
          description: powerup.description || 'Powerup effect is now active!',
          duration: 3000
        });
      }
    } else {
      // Show error toast
      toast({
        title: '❌ Powerup Failed',
        description: 'Unable to activate powerup. Please try again.',
        duration: 3000
      });
    }
  };

  // Coin earn handler with animation
  const handleEarnCoins = async (amount: number, reason = 'Earned in game') => {
    await addCoins(amount, reason);
    setCoinAnimKey(k => k + 1); // force re-render for animation
    setShowCoinAnim(true);
    setTimeout(() => setShowCoinAnim(false), 900);
  };

  React.useEffect(() => {
    if (!isMobile() && !sessionStorage.getItem('desktopGameNoticeShown')) {
      toast({
        title: 'Tip: Try Flappy Pi on Mobile!',
        description: 'For the best experience, play in the Pi Browser or on your mobile device.',
        duration: 6000,
      });
      sessionStorage.setItem('desktopGameNoticeShown', 'true');
    }
  }, []);

  const handleOpenInventory = () => {
    // Trigger global inventory modal
    window.dispatchEvent(new CustomEvent('open-inventory-modal'));
  };

  const handleOpenShop = () => {
    // Trigger global shop modal
    window.dispatchEvent(new CustomEvent('open-shop-modal'));
  };

  const handleOpenPremium = () => {
    setShowSubscriptionPlans(true);
  };

  return (
    <>
      <div
        className="relative w-full min-h-screen h-full overflow-hidden flex flex-col"
        style={{
          minHeight: '100vh',
          width: '100vw',
          maxWidth: '100vw',
          maxHeight: '100vh',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          touchAction: 'manipulation',
          paddingBottom: 'env(safe-area-inset-bottom, 90px)',
          overflow: 'hidden',
        }}
      >
        {/* Game area (pipes, bird, etc.) */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            overflow: 'hidden',
            touchAction: 'manipulation',
          }}
          tabIndex={0}
          onClick={handleFlap}
          onTouchStart={handleFlap}
        >
          <Background mode={mode} scene={scene} effect={effect} />
          {/* Tap to Start Overlay */}
          {(showTapToStart || showTapToContinue) && !showGameOverModal && !showReviveModal && (
            <TapToStartOverlay birdSkin={birdImg} forRevive={showTapToContinue} />
          )}
          {/* Weather effects disabled */}
          {/* Pipes */}
          {hasPipes && pipes.map((pipe, i) => {
            let pipeColor = 'linear-gradient(to right, #a8e063 70%, #56ab2f 100%)';
            if (mode === 'endless') pipeColor = 'linear-gradient(to right, #a259e6 70%, #f472b6 100%)';
            if (mode === 'challenge') pipeColor = 'linear-gradient(to right, #ff512f 70%, #dd2476 100%)';
            return (
              <React.Fragment key={i}>
                {/* Top pipe */}
                <div style={{ position: 'absolute', left: pipe.x, top: 0, width: PIPE_WIDTH, height: pipe.gapY + 18, background: pipeColor, borderLeft: '3px solid #222', borderRight: '3px solid #222', borderBottom: '3px solid #222', border: '3px solid #222', borderRadius: undefined, zIndex: 2, display: pipe.gapY > 0 ? 'block' : 'none', overflow: 'visible' }}>
                  <div style={{ position: 'absolute', left: 8, top: 0, width: 10, height: '100%', background: 'rgba(255,255,255,0.25)', borderRadius: 8, zIndex: 3 }} />
                  <div style={{
                    position: 'absolute',
                    left: -5,
                    bottom: -18,
                    width: PIPE_WIDTH + 10,
                    height: 18,
                    background: scene === 'ice' ? '#e0f7fa' : scene === 'lava' ? '#dd2476' : scene === 'dessert' ? '#ffd54f' : scene === 'rock' ? '#bdbdbd' : scene === 'land' ? '#8d5524' : '#4CAF50',
                    border: '3px solid #222',
                    borderRadius: '0 0 12px 12px',
                    zIndex: 4,
                  }} />
                </div>
                {/* Bottom pipe */}
                 <div style={{ position: 'absolute', left: pipe.x, top: pipe.gapY + getPipeGap(score, mode), width: PIPE_WIDTH, height: Math.max(0, GAME_HEIGHT - GROUND_HEIGHT - (pipe.gapY + getPipeGap(score, mode))), background: pipeColor, border: '3px solid #222', borderRadius: undefined, zIndex: 2, display: GAME_HEIGHT - (pipe.gapY + getPipeGap(score, mode)) > 0 ? 'block' : 'none', overflow: 'visible' }}>
                  <div style={{ position: 'absolute', left: 8, top: 0, width: 10, height: '100%', background: 'rgba(255,255,255,0.25)', borderRadius: 8, zIndex: 3 }} />
                  <div style={{
                    position: 'absolute',
                    left: -5,
                    top: -18,
                    width: PIPE_WIDTH + 10,
                    height: 18,
                    background: scene === 'ice' ? '#e0f7fa' : scene === 'lava' ? '#dd2476' : scene === 'dessert' ? '#ffd54f' : scene === 'rock' ? '#bdbdbd' : scene === 'land' ? '#8d5524' : '#4CAF50',
                    border: '3px solid #222',
                    borderRadius: '12px 12px 0 0',
                    zIndex: 4,
                  }} />
                  {/* Pipe shadow at base */}
                  <svg width={PIPE_WIDTH} height={12} style={{ position: 'absolute', left: 0, bottom: -6, zIndex: 5 }}>
                    <ellipse cx={PIPE_WIDTH / 2} cy={6} rx={PIPE_WIDTH / 2.2} ry={5} fill="rgba(34,34,34,0.25)" />
                  </svg>
                  {/* Plant/grass at the base of the bottom pipe in classic mode */}
                  {mode === 'classic' && (
                    <svg width="32" height="18" style={{ position: 'absolute', left: PIPE_WIDTH / 2 - 16, bottom: -10, zIndex: 5 }} viewBox="0 0 32 18" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <img src={getBirdImageSrc(birdImg)} alt="Flappy Bird" style={{ position: 'absolute', left: GAME_WIDTH / 4, top: birdY, width: BIRD_WIDTH, height: BIRD_HEIGHT, zIndex: 3 }} draggable={false} />
          {/* Floating Flappy Coin (collectible) */}
          {coinAvailable && (
            <img src="/flappycoins.png" alt="Flappy Coin" style={{ position: 'absolute', left: coinPos.x, top: coinPos.y, width: 48, height: 48, zIndex: 15, filter: 'drop-shadow(0 2px 8px #eab30888)', animation: 'floatCoin 1.2s infinite ease-in-out', pointerEvents: 'none' }} draggable={false} />
          )}
          {/* Score (centered top) */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 20, margin: '0 auto', color: '#fff', fontSize: 48, fontWeight: 'bold', textShadow: '2px 2px 8px #000', zIndex: 10, textAlign: 'center' }}>{score}</div>
          {/* Ground at the bottom, always above footer */}
          <Ground x={0} scene={sceneToGround[scene] || 'grass'} />
        </div>
        {/* Footer (unified, only one panel) */}
        <FooterPowerupBar
          powerUps={footerPowerUps}
          onActivate={handleActivatePowerup}
          gameMode={mode}
          level={getUserLevel(score)}
          levelLabel={getLevelLabel(score)}
          openInventory={handleOpenInventory}
          openPremium={handleOpenPremium}
          openShop={handleOpenShop}
          coinBalance={profile?.total_coins || 0}
          equippedSkinImg={birdImg}
          activePowerUps={availablePowerUps}
        />
        {/* Modals and animated effects */}
        {showGameOverModal && (
          <GameOverModal
            isVisible={showGameOverModal}
            score={score}
            coins={profile?.total_coins || 0}
            onRestart={handlePlayAgain}
            onHome={() => { setShowGameOverModal(false); navigate('/home'); }}
            onRevive={() => { setShowReviveModal(true); setShowGameOverModal(false); }}
            reviveUsed={false}
            level={getUserLevel(score)}
            onShare={handleShareScore}
            extraLives={extraLives}
            onUseExtraLife={useExtraLife}
            birdSkin={equippedSkin?.image || birdImg}
            onSubmitScore={async () => Promise.resolve(true)}
            isPiUser={!!profile?.pi_user_id}
          />
        )}
        {showReviveModal && (
          <ReviveModal
            isVisible={showReviveModal}
            score={score}
            onRevive={handleReviveAd}
            onDecline={handleReviveCancel}
            onAdDecline={handleReviveCancel}
            reviveCount={reviveCount}
            noCancel={gamesPlayed % 4 === 3 && !adWatchedThisRevive}
            insufficientCoins={(profile?.total_coins || 0) < (10 + (reviveCount * 10))}
            forceAdRevive={gamesPlayed % 4 === 3 && !adWatchedThisRevive}
            hasUnlimitedRevives={!!hasActiveSubscription}
            extraLives={extraLives}
            onUseExtraLife={useExtraLife}
            birdSkin={equippedSkin?.image || birdImg}
            gameMode={mode} // Pass the current game mode
          />
        )}
        {showReviveEffect && (
          <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 100, background: 'radial-gradient(circle, rgba(255,255,0,0.25) 0%, rgba(255,255,255,0.1) 80%, transparent 100%)', pointerEvents: 'none', animation: 'reviveFlash 1.2s' }} />
        )}
        {isInvincible && (
          <div style={{ position: 'absolute', left: GAME_WIDTH / 4 - 16, top: birdY - 16, width: BIRD_WIDTH + 32, height: BIRD_HEIGHT + 32, borderRadius: '50%', border: '4px dashed gold', boxShadow: '0 0 24px 8px gold', zIndex: 99, pointerEvents: 'none', transition: 'top 0.1s' }} />
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
        {planJustExpired && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full text-center">
              <h2 className="text-2xl font-bold mb-4">Your Premium Plan Has Expired</h2>
              <p className="mb-4">Your subscription benefits are no longer active. Renew to keep enjoying premium features!</p>
              <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold" onClick={() => setPlanJustExpired(false)}>OK</button>
            </div>
          </div>
        )}
        {/* Flappy Coins HUD */}
        {/* Wallet Balance - Top Left Corner */}
        <div className="absolute top-4 left-4 z-50" style={{background: 'rgba(255, 255, 200, 0.7)', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '4px 14px', minWidth: 90, minHeight: 36, display: 'flex', alignItems: 'center', backdropFilter: 'blur(4px)'}}>
          <WalletBalance className="bg-transparent text-yellow-900 text-base font-semibold shadow-none border-0" />
        </div>
        {/* Coin Earn Animation */}
        {showCoinAnim && (
          <div
            key={coinAnimKey}
            className="fixed left-1/2 top-1/2 z-50 pointer-events-none animate-flapcoin-fly"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <img src="/flappycoins.png" alt="Flappy Coin" className="w-12 h-12 drop-shadow-lg" />
          </div>
        )}

      </div>
    </>
  );
};

// Add floating coin animation
if (typeof window !== 'undefined' && document) {
  const style = document.createElement('style');
  style.innerHTML = `@keyframes floatCoin { 0% { transform: translateY(0); } 50% { transform: translateY(-16px); } 100% { transform: translateY(0); } }\n@keyframes cloudMove { 0% { left: -200px; } 100% { left: 600px; } }\n@keyframes cloudMove2 { 0% { left: 600px; } 100% { left: -200px; } }`;
  document.head.appendChild(style);
}

// Add tapPulse keyframes
if (typeof window !== 'undefined' && document) {
  const style = document.createElement('style');
  style.innerHTML += `@keyframes tapPulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.15); opacity: 0.7; } }`;
  document.head.appendChild(style);
}

// Add keyframes for rain, snow, lightning
if (typeof window !== 'undefined' && document) {
  const style = document.createElement('style');
  style.innerHTML += `@keyframes rainDrop { 0% { transform: translateY(0); } 100% { transform: translateY(100vh); } }
    @keyframes snowFall { 0% { transform: translateY(0); } 100% { transform: translateY(100vh); } }
    @keyframes lightning { 0%, 97% { opacity: 0.7; } 98%, 99% { opacity: 1; } 100% { opacity: 0.7; } }`;
  document.head.appendChild(style);
}

// Add reviveFlash keyframes
if (typeof window !== 'undefined' && document) {
  const style = document.createElement('style');
  style.innerHTML += `@keyframes reviveFlash { 0% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; } }`;
  document.head.appendChild(style);
}

// Add CSS for pipe fade-in/slide-in
if (typeof window !== 'undefined' && document) {
  const style = document.createElement('style');
  style.innerHTML += `
    .pipe-fade-in {
      animation: pipeFadeIn 0.5s ease-out;
    }
    @keyframes pipeFadeIn {
      0% { opacity: 0; transform: translateX(60px); }
      100% { opacity: 1; transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
}

// Add the following CSS to globals.css or a relevant style file:
/*
@keyframes flapcoin-fly {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  80% { opacity: 1; transform: translate(180px, -120px) scale(1.2); }
  100% { opacity: 0; transform: translate(220px, -160px) scale(0.7); }
}
.animate-flapcoin-fly {
  animation: flapcoin-fly 0.9s cubic-bezier(0.4,0,0.2,1) forwards;
}
*/

export default ClassicMode; 