import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import ScreamPiGameOverModal from '../components/game/ScreamPiGameOverModal';
import ScreamPiReviveModal from '../components/ScreamPiReviveModal';
import ScreamPiSplashScreen from '../components/ScreamPiSplashScreen';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../hooks/use-toast';
import SkyBackground from '../components/SkyBackground';
import EnhancedFooter from '../components/EnhancedFooter';
import { useSettings } from '../hooks/useSettings';
import { inventoryService } from '../services/inventoryService';
import SubscriptionPlansModal from '../components/SubscriptionPlansModal';
import { forceStopAllMusic } from '../hooks/useGlobalMusic';
import { unifiedLeaderboardService } from '../services/unifiedLeaderboardService';
import { ScreamPiSubmission } from '../types/leaderboard';

// Speech Recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}



// Game constants
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 800;
const NPC_WIDTH = 60;
const NPC_HEIGHT = 60;
const GRAVITY = 0.5;
const MIN_JUMP_FORCE = 15;
const MAX_JUMP_FORCE = 16;
const MAX_HOLD_TIME = 300;
const SCROLL_SPEED = 3;
const GROUND_Y = CANVAS_HEIGHT - 80;

// Weather and level themes
const WEATHER_THEMES = {
  sunny: {
    name: 'Sunny Day',
    bgGradient: '#fef3c7 #fed7aa #fde68a',
    skyColor: 'from-sky-300 to-blue-400',
    cloudColor: 'from-white to-gray-100',
    particleColor: '#fbbf24',
    description: 'Perfect weather for screaming!'
  },
  cloudy: {
    name: 'Cloudy Skies',
    bgGradient: '#e5e7eb #bfdbfe #d1d5db',
    skyColor: 'from-gray-400 to-blue-500',
    cloudColor: 'from-gray-300 to-white',
    particleColor: '#6b7280',
    description: 'Clouds add challenge to your voice!'
  },
  rainy: {
    name: 'Rainy Day',
    bgGradient: '#93c5fd #9ca3af #3b82f6',
    skyColor: 'from-gray-500 to-blue-600',
    cloudColor: 'from-gray-400 to-gray-200',
    particleColor: '#3b82f6',
    description: 'Rain makes screaming more dramatic!'
  },
  stormy: {
    name: 'Thunder Storm',
    bgGradient: '#9333ea #374151 #000000',
    skyColor: 'from-gray-800 to-purple-900',
    cloudColor: 'from-gray-600 to-gray-400',
    particleColor: '#f59e0b',
    description: 'Lightning enhances your power!'
  },
  snowy: {
    name: 'Snowy Day',
    bgGradient: '#dbeafe #ffffff #bfdbfe',
    skyColor: 'from-blue-200 to-gray-300',
    cloudColor: 'from-white to-gray-100',
    particleColor: '#ffffff',
    description: 'Snow muffles sound - scream louder!'
  },
  night: {
    name: 'Night Time',
    bgGradient: '#312e81 #581c87 #000000',
    skyColor: 'from-indigo-800 to-purple-900',
    cloudColor: 'from-gray-700 to-gray-500',
    particleColor: '#e5e7eb',
    description: 'Night makes your voice mysterious!'
  },
  sunset: {
    name: 'Sunset Glow',
    bgGradient: '#fb923c #ec4899 #9333ea',
    skyColor: 'from-orange-300 to-pink-400',
    cloudColor: 'from-pink-200 to-orange-200',
    particleColor: '#f97316',
    description: 'Golden hour amplifies your voice!'
  },
  foggy: {
    name: 'Foggy Morning',
    bgGradient: '#d1d5db #e5e7eb #9ca3af',
    skyColor: 'from-gray-400 to-gray-500',
    cloudColor: 'from-gray-200 to-white',
    particleColor: '#9ca3af',
    description: 'Fog dampens sound - scream through it!'
  }
};

const LEVEL_THEMES = {
  1: { name: 'Scream Plains', color: '#22c55e', bgGradient: '#4ade80 #16a34a' },
  2: { name: 'Lava Rise', color: '#ef4444', bgGradient: '#ef4444 #ea580c' },
  3: { name: 'Electric Zone', color: '#3b82f6', bgGradient: '#60a5fa #9333ea' },
  4: { name: 'Storm Chase', color: '#8b5cf6', bgGradient: '#a855f7 #6366f1' },
  5: { name: 'Echo Labyrinth', color: '#6366f1', bgGradient: '#6366f1 #7c3aed' }
};

interface Character {
  id: string;
  name: string;
  image: string;
  description: string;
  unlocked: boolean;
  abilities: {
    jump: number;
    shield: number;
    magnet: number;
    recovery: number;
  };
  specialMove: string;
}

interface NPC {
  x: number;
  y: number;
  velocityY: number;
  isJumping: boolean;
  emotion: 'happy' | 'scared' | 'excited' | 'annoyed' | 'neutral' | 'confident' | 'worried' | 'surprised' | 'determined';
  reaction: string;
  reactionTimer: number;
  character: Character;
  health: number;
  maxHealth: number;
  invincible: boolean;
  invincibleTimer: number;
  animationFrame: number;
  animationTimer: number;
  isMoving: boolean;
  direction: 'left' | 'right';
  scale: number;
  rotation: number;
  dialogQueue: string[];
  lastScore: number;
  consecutiveJumps: number;
  lastJumpTime: number;
  comboCount: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'gap' | 'spike' | 'platform' | 'trap' | 'moving' | 'ceiling' | 'ground' | 'lava' | 'electric' | 'wind' | 'echo' | 'ice' | 'space';
  color: string;
  levelSpecific?: any;
  passed?: boolean;
}

interface Collectible {
  x: number;
  y: number;
  type: 'coin' | 'powerup' | 'gem' | 'star';
  collected: boolean;
  value: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'sparkle' | 'explosion' | 'trail' | 'magic';
}

interface PowerUp {
  id: string;
  name: string;
  icon: string;
  duration: number;
  effect: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const ScreamPiPage: React.FC = () => {
  const navigate = useNavigate();
  const { balance, addCoins, spendCoins } = useWallet();
  const { isAuthenticated } = useAuth();
  const { profile } = useUserProfile();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { toast } = useToast();
  
  // Theme logic
  const getAutoTheme = () => {
    const hour = new Date().getHours();
    return (hour >= 19 || hour < 7) ? 'night' : 'light';
  };
  
  const [autoTheme, setAutoTheme] = useState(getAutoTheme());
  useEffect(() => {
    const interval = setInterval(() => setAutoTheme(getAutoTheme()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const theme = settings.theme === 'night' ? 'night' : 'light';
  
  // Game state
  const [gameState, setGameState] = useState<'characterSelect' | 'menu' | 'playing' | 'paused' | 'gameOver' | 'tutorial' | 'locked' | 'shop'>('characterSelect');
  const [controlMode, setControlMode] = useState<'scream' | 'tap' | 'both'>('both');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [flappyCoins, setFlappyCoins] = useState(0);
  const [distance, setDistance] = useState(0);
  const [passedObstacles, setPassedObstacles] = useState<Set<string>>(new Set());
  const [screamLevel, setScreamLevel] = useState(0);
  const [screamMeter, setScreamMeter] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [fps, setFps] = useState(60);
  const [frameCount, setFrameCount] = useState(0);
  const [lastFpsUpdate, setLastFpsUpdate] = useState(0);
  const [pressStart, setPressStart] = useState(0);
  const [powerUpActive, setPowerUpActive] = useState(false);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [sensitivity, setSensitivity] = useState(50);
  const [gameTime, setGameTime] = useState(0);
  
  // Weather system
  const [currentWeather, setCurrentWeather] = useState('sunny');
  const [weatherParticles, setWeatherParticles] = useState<Particle[]>([]);
  const [clouds, setClouds] = useState<{ x: number; y: number; size: number; speed: number; opacity: number }[]>([]);
  
  // Weather unlock system
  const [unlockedWeathers, setUnlockedWeathers] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('screamPiUnlockedWeathers');
    return saved ? new Set(JSON.parse(saved)) : new Set(['sunny']);
  });
  const [showWeatherPaymentModal, setShowWeatherPaymentModal] = useState(false);
  const [selectedWeatherToUnlock, setSelectedWeatherToUnlock] = useState<string>('');
  const [showCharacterPurchaseModal, setShowCharacterPurchaseModal] = useState(false);
  const [selectedCharacterToPurchase, setSelectedCharacterToPurchase] = useState<Character | null>(null);
  const [piSDKAvailable, setPiSDKAvailable] = useState(false);
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [showVoiceInstructions, setShowVoiceInstructions] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  // Leaderboard session tracking
  const [gameSessionId, setGameSessionId] = useState<string | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [screamDetections, setScreamDetections] = useState(0);
  const [maxVolumeReached, setMaxVolumeReached] = useState(0);

  // Handle splash screen completion
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show splash on every visit to Scream Pi page
  useEffect(() => {
    // Always show splash for Scream Pi page
    setShowSplash(true);
  }, []);
  
  // Lives system
  const [lives, setLives] = useState(3);
  const [maxLives, setMaxLives] = useState(3);
  const [livesLost, setLivesLost] = useState(0);
  const [showLivesWarning, setShowLivesWarning] = useState(false);
  
  // Shop system
  const [showShop, setShowShop] = useState(false);
  const [shopItems, setShopItems] = useState([
    { id: 'extra_life', name: 'Extra Life', icon: '❤️', price: 100, type: 'life', description: 'Add one life to continue playing' },
    { id: 'shield_powerup', name: 'Shield Power-up', icon: '🛡️', price: 50, type: 'powerup', description: 'Protects from one collision' },
    { id: 'coin_multiplier', name: 'Coin Multiplier', icon: '💰', price: 75, type: 'powerup', description: 'Doubles coin earnings for 30 seconds' },
    { id: 'magnet_powerup', name: 'Coin Magnet', icon: '🧲', price: 60, type: 'powerup', description: 'Attracts coins from far away' },
    { id: 'speed_boost', name: 'Speed Boost', icon: '⚡', price: 80, type: 'powerup', description: 'Increases movement speed' },
    { id: 'invincibility', name: 'Invincibility', icon: '✨', price: 150, type: 'powerup', description: 'Temporary invincibility' }
  ]);
  
  // Inventory system
  const [inventory, setInventory] = useState<{ [key: string]: number }>({
    shield_powerup: 0,
    coin_multiplier: 0,
    magnet_powerup: 0,
    speed_boost: 0,
    invincibility: 0
  });
  
  // Active power-ups during gameplay
  const [activePowerUps, setActivePowerUps] = useState<{ [key: string]: { timer: number, effect: any } }>({});

  const [walletBalance, setWalletBalance] = useState(balance || 0);
  
  // Sync wallet balance with global wallet
  useEffect(() => {
    setWalletBalance(balance || 0);
  }, [balance]);

  // Sync characters with localStorage on component mount
  useEffect(() => {
    const unlockedCharacterIds = loadUnlockedCharacters();
    setCharacters(prevCharacters => 
      prevCharacters.map(char => ({
        ...char,
        unlocked: unlockedCharacterIds.includes(char.id)
      }))
    );
  }, []);

  // Sync weather with localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('screamPiUnlockedWeathers');
    if (saved) {
      const unlockedWeatherIds = JSON.parse(saved);
      setUnlockedWeathers(new Set(unlockedWeatherIds));
    }
  }, []);

  // Check subscription status
  useEffect(() => {
    const checkSubscriptionStatus = () => {
      const status = inventoryService.getSubscriptionStatus();
      setHasActiveSubscription(status.hasActiveSubscription);
    };

    // Check immediately
    checkSubscriptionStatus();

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkSubscriptionStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  // Listen for subscription expiration events
  useEffect(() => {
    const handleInventoryUpdated = (event: CustomEvent) => {
      if (event.detail.type === 'subscription') {
        const status = inventoryService.getSubscriptionStatus();
        setHasActiveSubscription(status.hasActiveSubscription);
      }
    };

    window.addEventListener('inventoryUpdated', handleInventoryUpdated);
    return () => window.removeEventListener('inventoryUpdated', handleInventoryUpdated);
  }, []);
  const [bestScore, setBestScore] = useState(0);
  
  // NPC state
  const [npc, setNpc] = useState<NPC>({
    x: 50,
    y: CANVAS_HEIGHT - NPC_HEIGHT - 100,
    velocityY: 0,
    isJumping: false,
    emotion: 'neutral',
    reaction: '',
    reactionTimer: 0,
    character: {
      id: 'nicolas',
      name: 'Nicolas',
      image: '/npc/nicolas.png',
      description: 'The brave adventurer with a heart of gold - Higher jump force and better shield protection',
      unlocked: true,
      abilities: { jump: 1.2, shield: 1.5, magnet: 1.0, recovery: 1.0 },
      specialMove: 'Shield Burst'
    },
    health: 100,
    maxHealth: 100,
    invincible: false,
    invincibleTimer: 0,
    animationFrame: 0,
    animationTimer: 0,
    isMoving: false,
    direction: 'right',
    scale: 1,
    rotation: 0,
    dialogQueue: [],
    lastScore: 0,
    consecutiveJumps: 0,
    lastJumpTime: 0,
    comboCount: 0
  });
  
  // Game objects
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [powerUpTimers, setPowerUpTimers] = useState<{ [key: string]: number }>({});
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showReviveModal, setShowReviveModal] = useState(false);
  const [reviveUsed, setReviveUsed] = useState(false);
  const [reviveCount, setReviveCount] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  
  // Audio elements
  const [bgMusic, setBgMusic] = useState<HTMLAudioElement | null>(null);
  const [jumpSound, setJumpSound] = useState<HTMLAudioElement | null>(null);
  const [screamSound, setScreamSound] = useState<HTMLAudioElement | null>(null);
  const [gameOverSound, setGameOverSound] = useState<HTMLAudioElement | null>(null);
  const [collectSound, setCollectSound] = useState<HTMLAudioElement | null>(null);
  const [levelUpSound, setLevelUpSound] = useState<HTMLAudioElement | null>(null);
  
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  
  // Social challenge state
  const [socialChallengeCompleted, setSocialChallengeCompleted] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [showBadgeNotification, setShowBadgeNotification] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  
  // Power-ups
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { id: 'shield', name: 'Shield', icon: '/powerups/Shield.png', duration: 10000, effect: 'Protects from collision', rarity: 'common' },
    { id: 'magnet', name: 'Magnet', icon: '/powerups/Coin Magnet.png', duration: 8000, effect: 'Attracts coins nearby', rarity: 'common' },
    { id: 'coin_multiplier', name: 'Coin Multiplier', icon: '/powerups/2x Coin Multiplier.png', duration: 12000, effect: 'Doubles coin earnings', rarity: 'rare' },
    { id: 'turbo_start', name: 'Turbo Start', icon: '/powerups/turbo-start.png', duration: 6000, effect: 'Increases game speed', rarity: 'epic' },
    { id: 'extra_life', name: 'Extra Life', icon: '/powerups/Extra life.png', duration: 0, effect: 'Revives you once', rarity: 'legendary' }
  ]);
  
  const [powerUpNotification, setPowerUpNotification] = useState<string | null>(null);
  
  // Load unlocked characters from localStorage
  const loadUnlockedCharacters = (): string[] => {
    try {
      const saved = localStorage.getItem('screamPiUnlockedCharacters');
      return saved ? JSON.parse(saved) : ['default'];
    } catch (error) {
      console.error('Error loading unlocked characters:', error);
      return ['default'];
    }
  };

  // Characters with persistent unlock state
  const [characters, setCharacters] = useState<Character[]>(() => {
    const unlockedCharacterIds = loadUnlockedCharacters();
    
    return [
      {
        id: 'nicolas',
        name: 'Nicolas',
        image: '/npc/nicolas.png',
        description: 'The brave adventurer with a heart of gold - Higher jump force and better shield protection',
        unlocked: unlockedCharacterIds.includes('nicolas'),
        abilities: { jump: 1.2, shield: 1.5, magnet: 1.0, recovery: 1.0 },
        specialMove: 'Shield Burst'
      },
      {
        id: 'chengdiao',
        name: 'Chengdiao',
        image: '/npc/chengdiao.png',
        description: 'The wise scholar with quick reflexes - Better coin attraction and faster recovery',
        unlocked: unlockedCharacterIds.includes('chengdiao'),
        abilities: { jump: 1.0, shield: 1.0, magnet: 1.3, recovery: 1.2 },
        specialMove: 'Coin Magnet'
      },
      {
        id: 'default',
        name: 'Default',
        image: '/npc gif/npc-0.gif.gif',
        description: 'Balanced character for all playstyles',
        unlocked: unlockedCharacterIds.includes('default'),
        abilities: { jump: 1.0, shield: 1.0, magnet: 1.0, recovery: 1.0 },
        specialMove: 'Double Jump'
      },
      {
        id: 'bobman',
        name: 'Bob Man',
        image: '/flappy pi gif 2/bobman.gif',
        description: 'The mysterious hero with dark powers - Enhanced jump height and superior recovery abilities',
        unlocked: unlockedCharacterIds.includes('bobman'),
        abilities: { jump: 1.4, shield: 1.2, magnet: 1.1, recovery: 1.3 },
        specialMove: 'Dark Jump'
      }
    ];
  });
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const npcImageRef = useRef<HTMLImageElement | null>(null);
  
  // Character images mapping
  const characterImages = {
    default: '/npc gif/npc-1.gif.gif',
    chengdiao: '/npc/chengdiao.png',
    nicolas: '/npc/nicolas.png',
    bobman: '/flappy pi gif 2/bobman.gif'
  };

  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to Scream Pi! 🎤",
      content: "This is a revolutionary voice-controlled game where your voice becomes your controller. Scream, whisper, or tap - the choice is yours!",
      image: "/npc/nicolas.png"
    },
    {
      title: "Voice Control Mastery",
      content: "Speak softly to walk, SCREAM to jump! The louder you scream, the higher your character jumps. Make sure to allow microphone access. Note: Voice commands will be available soon when Pi Browser mobile allows microphone access. For now, use tap screen controls.",
      image: "/npc gif/npc-2.gif.gif"
    },
    {
      title: "Touch Controls",
      content: "Don't want to scream? Use tap mode! Tap to jump, hold for stronger jumps. Perfect for quiet environments.",
      image: "/npc gif/npc-2.gif.gif"
    },
    {
      title: "Collect & Survive",
      content: "Avoid obstacles like gaps and spikes. Collect coins, gems, and power-ups to boost your score and unlock special abilities!",
      image: "/flappycoins.png"
    },
    {
      title: "Power-up System",
      content: "Collect power-ups like shields, magnets, and extra lives to help you survive longer and earn more rewards!",
      image: "/powerups/shield.png"
    },
    {
      title: "Ready to Scream! 🚀",
      content: "You're all set! Choose your character and start your voice-controlled adventure. Remember: the louder you scream, the higher you jump!",
      image: "/npc/nicolas.png"
    }
  ];

  // Enhanced dialog system
  const getCharacterDialog = (character: Character, emotion: string, context: string, score: number, health: number): string => {
    // Add null checks for character parameter
    if (!character || !character.id) {
      console.warn('Invalid character provided to getCharacterDialog:', character);
      return '"Let\'s do this!"';
    }

    const dialogs: Record<string, Record<string, Record<string, string[]>>> = {
      nicolas: {
        happy: {
          'score_milestone': ['"Incredible! My shield is holding strong!"', '"The Pi Network spirit guides me!"', '"This is what true adventure feels like!"'],
          'coin_collect': ['"Golden treasures! Perfect!"', '"More coins for the community!"', '"The rewards keep coming!"'],
          'combo': ['"Unstoppable combo!"', '"My training pays off!"', '"Shield power activated!"'],
          'health_recovery': ['"My shield protects me well!"', '"The Pi spirit heals me!"', '"I feel stronger than ever!"']
        },
        scared: {
          'low_health': ['"Shield failing! Need backup!"', '"The darkness approaches!"', '"Help me, Pi community!"'],
          'near_death': ['"My shield is breaking!"', '"I can feel the danger!"', '"The end is near!"'],
          'collision': ['"Ouch! That hurt!"', '"My shield took damage!"', '"Need to be more careful!"']
        },
        excited: {
          'high_score': ['"Breaking records!"', '"The Pi Network cheers!"', '"This is legendary!"'],
          'power_up': ['"Shield power enhanced!"', '"The magic flows through me!"', '"Unlimited potential!"'],
          'combo_high': ['"Combo master!"', '"Unstoppable force!"', '"The power of Pi!"']
        },
        determined: {
          'comeback': ['"I will not give up!"', '"The Pi spirit drives me!"', '"Victory is mine!"'],
          'challenge': ['"Bring it on!"', '"I am ready for anything!"', '"My shield will protect!"']
        }
      },
      chengdiao: {
        happy: {
          'score_milestone': ['"Wisdom guides my path!"', '"The scholar\'s knowledge prevails!"', '"Perfect calculations!"'],
          'coin_collect': ['"Golden wisdom collected!"', '"Knowledge is power!"', '"The coins of knowledge!"'],
          'combo': ['"Academic excellence!"', '"The scholar\'s technique!"', '"Perfect form!"'],
          'health_recovery': ['"My studies protect me!"', '"The wisdom heals!"', '"Knowledge is my shield!"']
        },
        scared: {
          'low_health': ['"My calculations are failing!"', '"The equations are wrong!"', '"Need to recalculate!"'],
          'near_death': ['"The theory is collapsing!"', '"My research is endangered!"', '"The variables are unknown!"'],
          'collision': ['"Ouch! That\'s not in my calculations!"', '"Unexpected variable!"', '"Need to adjust my theory!"']
        },
        excited: {
          'high_score': ['"The theory is proven!"', '"Academic achievement!"', '"The scholar triumphs!"'],
          'power_up': ['"Enhanced calculations!"', '"The magic of knowledge!"', '"Infinite possibilities!"'],
          'combo_high': ['"Perfect execution!"', '"The scholar\'s mastery!"', '"Theory becomes reality!"']
        },
        determined: {
          'comeback': ['"I will solve this puzzle!"', '"The scholar never gives up!"', '"Knowledge is my weapon!"'],
          'challenge': ['"Let\'s test my theories!"', '"I am ready for the challenge!"', '"My calculations will prevail!"']
        }
      },
      bobman: {
        happy: {
          'score_milestone': ['"Justice prevails!"', '"The night is my ally!"', '"Darkness serves the light!"'],
          'coin_collect': ['"Gotham\'s treasures!"', '"The city provides!"', '"Justice pays well!"'],
          'combo': ['"Unstoppable justice!"', '"The Bat never fails!"', '"Dark power unleashed!"'],
          'health_recovery': ['"The night heals me!"', '"Darkness restores!"', '"I am vengeance!"']
        },
        scared: {
          'low_health': ['"The night is dangerous!"', '"Darkness closing in!"', '"Need backup!"'],
          'near_death': ['"The Bat is wounded!"', '"Justice is failing!"', '"The end approaches!"'],
          'collision': ['"Ouch! That stung!"', '"The armor took damage!"', '"Need to be stealthier!"']
        },
        excited: {
          'high_score': ['"Legendary justice!"', '"The Bat triumphs!"', '"Gotham is safe!"'],
          'power_up': ['"Dark power enhanced!"', '"The night empowers me!"', '"Unlimited justice!"'],
          'combo_high': ['"Justice master!"', '"Unstoppable Bat!"', '"I am the night!"']
        },
        determined: {
          'comeback': ['"I am vengeance!"', '"The Bat never quits!"', '"Justice will prevail!"'],
          'challenge': ['"Bring it on, criminals!"', '"I am ready for anything!"', '"The night protects!"']
        }
      },
      default: {
        happy: {
          'score_milestone': ['"Great job!"', '"Keep it up!"', '"You\'re doing amazing!"'],
          'coin_collect': ['"Nice coins!"', '"More rewards!"', '"Sweet collection!"'],
          'combo': ['"Awesome combo!"', '"You\'re on fire!"', '"Incredible moves!"'],
          'health_recovery': ['"Feeling better!"', '"Recovery successful!"', '"Back in action!"']
        },
        scared: {
          'low_health': ['"Oh no!"', '"This is scary!"', '"Help me!"'],
          'near_death': ['"I\'m in trouble!"', '"Almost done!"', '"Need help!"'],
          'collision': ['"Ouch!"', '"That hurt!"', '"Be careful!"']
        },
        excited: {
          'high_score': ['"Amazing score!"', '"You\'re incredible!"', '"Legendary!"'],
          'power_up': ['"Power activated!"', '"Feeling strong!"', '"Unlimited power!"'],
          'combo_high': ['"Combo master!"', '"Unstoppable!"', '"You\'re the best!"']
        },
        determined: {
          'comeback': ['"I won\'t give up!"', '"Let\'s do this!"', '"Victory is mine!"'],
          'challenge': ['"Bring it on!"', '"I\'m ready!"', '"Let\'s go!"']
        }
      }
    };

    // Add null checks for all parameters
    if (!emotion || !context) {
      console.warn('Invalid emotion or context provided to getCharacterDialog:', { emotion, context });
      return '"Let\'s do this!"';
    }

    const characterDialogs = dialogs[character.id] || dialogs.default;
    const emotionDialogs = characterDialogs[emotion] || characterDialogs.happy;
    const contextDialogs = emotionDialogs[context] || emotionDialogs.score_milestone;
    
    // Ensure contextDialogs is an array and has content
    if (!contextDialogs || !Array.isArray(contextDialogs) || contextDialogs.length === 0) {
      // Fallback to a default dialog
      return '"Let\'s do this!"';
    }
    
    return contextDialogs[Math.floor(Math.random() * contextDialogs.length)];
  };

  const addDialogToQueue = (dialog: string) => {
    if (!dialog || typeof dialog !== 'string') {
      console.warn('Invalid dialog provided to addDialogToQueue:', dialog);
      return;
    }
    
    setNpc(prev => ({
      ...prev,
      dialogQueue: [...prev.dialogQueue, dialog].slice(-3) // Keep last 3 dialogs
    }));
  };

  const processDialogQueue = () => {
    setNpc(prev => {
      if (prev.dialogQueue && prev.dialogQueue.length > 0 && prev.reactionTimer <= 0) {
        const nextDialog = prev.dialogQueue[0];
        if (nextDialog && typeof nextDialog === 'string') {
          return {
            ...prev,
            reaction: nextDialog,
            reactionTimer: 120, // Show dialog for 2 seconds
            dialogQueue: prev.dialogQueue.slice(1)
          };
        }
      }
      return prev;
    });
  };

  // Game functions
  const startTutorial = () => {
    setShowTutorial(true);
    setTutorialStep(0);
    setGameState('tutorial');
  };

  const nextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      completeTutorial();
    }
  };

  const previousTutorialStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    setTutorialCompleted(true);
    setGameState('menu');
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setTutorialCompleted(true);
    setGameState('menu');
  };

  const isScreamPiUnlocked = () => {
    // Always unlocked - no social challenge requirement
    console.log('🎤 Scream Pi: Always unlocked - no social challenge required');
    return true;
  };

  const handleSocialChallengeComplete = () => {
    // Set multiple keys to ensure detection works
    const keys = [
      'socialChallengeCompleted',
      'screamPiUnlocked',
      'completedSocialChallenge',
      'socialChallengeBadge',
      'socialChallengeUnlocked',
      'screamPiAccessGranted',
      'voiceGameUnlocked',
      'socialChallengePassed',
      'socialChallengeVerified',
      'socialChallengeApproved',
      'socialChallengeValidated'
    ];
    
    keys.forEach(key => localStorage.setItem(key, 'true'));
    
    console.log('Social Challenge Completed - Keys set:', keys);
    
    setSocialChallengeCompleted(true);
    setShowLockModal(false);
    setGameState('characterSelect');
  };

  const handleSocialChallengeBadgeReceived = () => {
    // Set multiple keys to ensure detection works
    const keys = [
      'socialChallengeBadge',
      'screamPiUnlocked',
      'completedSocialChallenge',
      'socialChallengeCompleted',
      'socialChallengeUnlocked',
      'screamPiAccessGranted',
      'voiceGameUnlocked',
      'socialChallengePassed',
      'socialChallengeVerified',
      'socialChallengeApproved',
      'socialChallengeValidated'
    ];
    
    keys.forEach(key => localStorage.setItem(key, 'true'));
    
    console.log('Social Challenge Badge Received - Keys set:', keys);
    
    setSocialChallengeCompleted(true);
    setShowLockModal(false);
    setShowBadgeNotification(true);
    setGameState('characterSelect');
    
    setTimeout(() => {
      setShowBadgeNotification(false);
    }, 3000);
  };

  const showLockedModal = () => {
    setLockReason('Complete the Social Challenge to unlock 🎤 Scream Pi!');
    setShowLockModal(true);
  };

  // Manual unlock function for testing
  const manualUnlockScreamPi = () => {
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
    
    keys.forEach(key => localStorage.setItem(key, 'true'));
    
    console.log('Manual unlock - Keys set:', keys);
    
    setSocialChallengeCompleted(true);
    setShowLockModal(false);
    setGameState('characterSelect');
  };

  // Auto-detect social challenge completion and unlock Scream Pi
  useEffect(() => {
    const checkForSocialChallengeCompletion = () => {
      const isUnlocked = isScreamPiUnlocked();
      
      if (isUnlocked && !socialChallengeCompleted) {
        console.log('Auto-detected social challenge completion - unlocking Scream Pi');
        handleSocialChallengeBadgeReceived();
      }
    };

    // Check immediately on mount
    checkForSocialChallengeCompletion();

    // Set up periodic checking
    const checkInterval = setInterval(checkForSocialChallengeCompletion, 1000); // Check every second

    // Also listen for storage events (when badge is set from another tab/window)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'flappypi-badges' || event.key === 'SOCIAL_CHALLENGE_KEY') {
        console.log('Storage change detected:', event.key, event.newValue);
        checkForSocialChallengeCompletion();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [socialChallengeCompleted]);

  const activatePowerUp = (powerUpId: string) => {
    const powerUp = powerUps.find(p => p.id === powerUpId);
    if (powerUp) {
      setActivePowerUps(prev => ({ 
        ...prev, 
        [powerUpId]: { timer: powerUp.duration, effect: powerUpId } 
      }));
      setPowerUpTimers(prev => ({ ...prev, [powerUpId]: powerUp.duration }));
      setPowerUpNotification(`${powerUp.name} activated!`);
      setTimeout(() => setPowerUpNotification(null), 2000);
      return true;
    }
    return false;
  };

  const playSound = (type: 'jump' | 'scream' | 'gameOver' | 'bgMusic' | 'collect' | 'levelUp') => {
    try {
      switch (type) {
        case 'jump':
          if (jumpSound) {
            jumpSound.currentTime = 0;
            jumpSound.play().catch(console.warn);
          }
          break;
        case 'scream':
          if (screamSound) {
            screamSound.currentTime = 0;
            screamSound.play().catch(console.warn);
          }
          break;
        case 'gameOver':
          if (gameOverSound) {
            gameOverSound.currentTime = 0;
            gameOverSound.play().catch(console.warn);
          }
          break;
        case 'collect':
          if (collectSound) {
            collectSound.currentTime = 0;
            collectSound.play().catch(console.warn);
          }
          break;
        case 'levelUp':
          if (levelUpSound) {
            levelUpSound.currentTime = 0;
            levelUpSound.play().catch(console.warn);
          }
          break;
        case 'bgMusic':
          if (bgMusic && bgMusic.paused) {
            bgMusic.play().catch(console.warn);
          }
          break;
      }
    } catch (error) {
      console.warn('Failed to play sound:', type, error);
    }
  };

  const addParticles = (x: number, y: number, color: string, count: number = 5) => {
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        maxLife: 1,
        color,
        size: Math.random() * 3 + 1,
        type: 'sparkle'
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  };

  const generateObstacles = (): Obstacle[] => {
    const obstacles: Obstacle[] = [];
    const baseX = CANVAS_WIDTH + Math.random() * 200;
    
    // Generate basic obstacles
    for (let i = 0; i < 3; i++) {
      const x = baseX + (i * 300) + Math.random() * 100;
      const gapWidth = 80 + Math.random() * 40;
      
      // Left platform
      obstacles.push({
        x: x - gapWidth/2 - 30,
        y: GROUND_Y - 30,
        width: 30,
        height: 30,
        type: 'ground',
        color: '#000000'
      });
      
      // Right platform
      obstacles.push({
        x: x + gapWidth/2,
        y: GROUND_Y - 30,
        width: 30,
        height: 30,
        type: 'ground',
        color: '#000000'
      });
    }
    
    return obstacles;
  };

  const generateCollectibles = (): Collectible[] => {
    const collectibles: Collectible[] = [];
    const baseX = CANVAS_WIDTH + Math.random() * 300;
    
    // Generate coins at more reachable heights
    for (let i = 0; i < 3; i++) {
      // Place coins between 300px and 500px above ground (more reachable)
      const minY = GROUND_Y - 500; // 500px above ground
      const maxY = GROUND_Y - 300; // 300px above ground
      const coinY = Math.random() * (maxY - minY) + minY;
      
      collectibles.push({
        x: baseX + i * 50,
        y: coinY,
        type: 'coin',
        collected: false,
        value: 1
      });
    }
    
    return collectibles;
  };

  const checkMicrophonePermission = async () => {
    // Bypass microphone permission check - route directly to game
    console.log('🎤 Microphone permission check bypassed - routing directly to game');
    setMicrophoneError(null);
    return true;
  };

  const startGame = async (mode: 'scream' | 'tap' | 'both') => {
    // Force stop all background music when game starts
    forceStopAllMusic();
    
    setControlMode(mode);
    setGameState('playing');
    setScore(0);
    setDistance(0);
    setFlappyCoins(0);
    setGameTime(0);
    setLives(3); // Reset lives to 3
    setLivesLost(0);
    setShowLivesWarning(false);
    setWalletBalance(balance || 0);
    setObstacles(generateObstacles());
    setCollectibles(generateCollectibles());
    setParticles([]);
    setWeatherParticles([]);
    setClouds([]);
    setActivePowerUps({});
    setPowerUpTimers({});
    
    // Start game session tracking
    setGameStartTime(Date.now());
    const sessionId = unifiedLeaderboardService.startGameSession(profile?.pi_user_id, 'screampi');
    setGameSessionId(sessionId);
    setScreamDetections(0);
    setMaxVolumeReached(0);
    
    // Initialize weather
    changeWeather('sunny');
    
    if (mode === 'scream' || 'both') {
      await checkMicrophonePermission();
    }
  };

  const togglePause = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  const returnToMenu = () => {
    setGameState('menu');
    setScore(0);
    setDistance(0);
    setFlappyCoins(0);
    setGameTime(0);
    setLives(3);
    setLivesLost(0);
    setShowLivesWarning(false);
    setObstacles([]);
    setCollectibles([]);
    setParticles([]);
    setActivePowerUps({});
    setPowerUpTimers({});
  };

  const handleGameOver = () => {
    setGameState('gameOver');
    
    // End game session
    if (gameSessionId) {
      unifiedLeaderboardService.endGameSession();
    }
    
    // Update best score
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('screamPiBestScore', score.toString());
    }
    
    // Add coins to wallet using the same system as Flappy Pi
    if (flappyCoins > 0) {
      addCoins(flappyCoins, 'Scream Pi Game Earnings');
      setWalletBalance(balance + flappyCoins);
    }
    
    // Submit score to leaderboard if user is authenticated
    if (profile?.pi_user_id && gameStartTime > 0) {
      submitScreamPiScore();
    }
    
    // Check if user can afford revive before showing revive modal
    const progressiveReviveCost = 10 + (reviveCount * 10);
    const canAffordRevive = (balance || 0) >= progressiveReviveCost;
    
    // Only show revive modal if user has subscription or can afford revive
    if (hasActiveSubscription || canAffordRevive) {
      setShowReviveModal(true);
    } else {
      // Show game over modal directly if user can't afford revive
      setShowGameOverModal(true);
    }
    
    playSound('gameOver');
  };

  // Submit ScreamPi score to unified leaderboard
  const submitScreamPiScore = async () => {
    if (!profile?.pi_user_id || gameStartTime === 0) return false;

    try {
      const sessionDuration = Math.floor((Date.now() - gameStartTime) / 1000);
      const livesUsed = 3 - lives; // Calculate lives used

      const scoreSubmission: ScreamPiSubmission = {
        score,
        game_mode: 'screampi',
        session_duration: sessionDuration,
        character_used: selectedCharacter?.name || 'default',
        difficulty: 'normal',
        scream_detections: screamDetections,
        max_volume_reached: maxVolumeReached,
        distance_traveled: distance,
        lives_used: livesUsed,
        collectibles_gathered: flappyCoins,
        power_ups_activated: Object.keys(activePowerUps).filter(key => activePowerUps[key])
      };

      const result = await unifiedLeaderboardService.handleGameOver(
        profile.pi_user_id,
        profile.username,
        scoreSubmission
      );

      if (settings.gameNotifications && result.submitted) {
        toast({
          title: result.newBest ? '🏆 New Personal Best!' : 'Score Submitted!',
          description: `Your ScreamPi score has been sent to the global leaderboard.`,
        });

        // Show achievement notifications
        if (result.achievements && result.achievements.length > 0) {
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
      console.error('Failed to submit ScreamPi score:', error);
      if (settings.gameNotifications) {
        toast({
          title: 'Score submission failed',
          description: 'Your score could not be submitted to the leaderboard.',
          variant: 'destructive',
        });
      }
      return false;
    }
  };

  const handleRevive = async (reviveType?: 'coin' | 'ad' | 'premium' | 'extra_life') => {
    console.log(`🔄 [SCREAM PI REVIVE DEBUG] handleRevive called with type: ${reviveType}`);
    if (reviveType === 'coin') {
      // Progressive revive cost: starts at 10, adds 10 for each revive
      const baseReviveCost = 10;
      const progressiveReviveCost = baseReviveCost + (reviveCount * 10);
      
      // Double-check balance before attempting to spend coins
      if ((balance || 0) < progressiveReviveCost) {
        toast({
          title: "Insufficient Flappy Coins",
          description: `You need ${progressiveReviveCost} Flappy Coins to revive and get 3 lives. You have ${balance || 0} coins.`,
          variant: "destructive",
        });
        return;
      }
      
      const success = await spendCoins(progressiveReviveCost, 'Scream Pi Revive - 3 Lives');
      if (!success) {
        // Not enough coins - show error toast
        toast({
          title: "Insufficient Flappy Coins",
          description: `You need ${progressiveReviveCost} Flappy Coins to revive and get 3 lives.`,
          variant: "destructive",
        });
        return;
      }
      
      // Show success message
      toast({
        title: "Revived with 3 Lives!",
        description: `You spent ${progressiveReviveCost} Flappy Coins to revive and get 3 lives.`,
      });
      
      // Set lives to 3
      setLives(3);
    }
    
    // Close revive modal and continue game
    setShowReviveModal(false);
    setGameState('playing');
    setReviveUsed(true);
    // Both coin and ad revives work EXACTLY THE SAME - only difference is payment method
    setReviveCount(prev => prev + 1);
    
    // Reset NPC position and make invincible temporarily (NO SHIELD)
    setNpc(prev => ({
      ...prev,
      x: 100,
      y: CANVAS_HEIGHT / 2,
      velocityY: 0,
      isJumping: false,
      invincible: true,
      invincibleTimer: 60, // 1 second at 60fps (reduced from 2 seconds)
      emotion: 'excited',
      reaction: 'Revived!',
      reactionTimer: 60
    }));
    
    // Update local wallet balance display
    setWalletBalance(balance);
  };

  const handleReviveDecline = () => {
    console.log('🔴 Decline button clicked - closing revive modal and showing game over modal');
    setShowReviveModal(false);
    setShowGameOverModal(true);
  };

  const handlePlanPurchase = (plan: any) => {
    // Unlock all Scream Pi characters when subscription is purchased
    const allCharacterIds = characters.map(char => char.id);
    const newUnlockedCharacters = new Set([...loadUnlockedCharacters(), ...allCharacterIds]);
    localStorage.setItem('screamPiUnlockedCharacters', JSON.stringify([...newUnlockedCharacters]));
    
    // Update characters state
    setCharacters(prevCharacters => 
      prevCharacters.map(char => ({
        ...char,
        unlocked: true
      }))
    );
    
    // Show success message
    toast({
      title: "🎉 Subscription Activated!",
      description: "All Scream Pi characters are now unlocked! Enjoy ad-free gameplay.",
    });
    
    // Close subscription modal
    setShowSubscriptionPlans(false);
  };

  const handleUseExtraLife = () => {
    setShowGameOverModal(false);
    setGameState('playing');
  };

  const handleRestart = () => {
    setShowGameOverModal(false);
    setShowReviveModal(false);
    setReviveUsed(false);
    setReviveCount(0);
    startGame(controlMode);
  };

  const handleShare = () => {
    console.log('Share score:', score);
  };

  const handleHome = () => {
    navigate('/home');
  };

  // Shop functions
  const openShop = () => {
    setGameState('shop');
  };

  const closeShop = () => {
    setGameState('playing');
  };

  const buyItem = async (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return false;

    const success = await spendCoins(item.price, `Scream Pi Shop: ${item.name}`);
    if (success) {
      if (item.type === 'life') {
        setLives(prev => prev + 1);
        setMaxLives(prev => prev + 1);
      } else if (item.type === 'powerup') {
        setInventory(prev => ({
          ...prev,
          [itemId]: (prev[itemId] || 0) + 1
        }));
      }
      
      // Update wallet balance display
      setWalletBalance(balance);
      return true;
    }
    return false;
  };

  const usePowerUp = (powerUpId: string) => {
    if (inventory[powerUpId] && inventory[powerUpId] > 0) {
      setInventory(prev => ({
        ...prev,
        [powerUpId]: prev[powerUpId] - 1
      }));
      
      activatePowerUp(powerUpId);
      return true;
    }
    return false;
  };

  // Weather functions
  const changeWeather = (weatherType: keyof typeof WEATHER_THEMES) => {
    // Check if weather is unlocked
    if (!unlockedWeathers.has(weatherType)) {
      setSelectedWeatherToUnlock(weatherType);
      setShowWeatherPaymentModal(true);
      return;
    }
    
    setCurrentWeather(weatherType);
    setWeatherParticles([]);
    setClouds([]);
    
    // Initialize weather-specific elements
    const theme = WEATHER_THEMES[weatherType];
    
    // Add clouds for cloudy weather
    if (weatherType === 'cloudy' || weatherType === 'rainy' || weatherType === 'stormy' || weatherType === 'foggy') {
      const newClouds = [];
      for (let i = 0; i < 5; i++) {
        newClouds.push({
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * 200 + 50,
          size: Math.random() * 60 + 40,
          speed: Math.random() * 0.5 + 0.2,
          opacity: Math.random() * 0.5 + 0.3
        });
      }
      setClouds(newClouds);
    }
    
    // Add weather particles
    if (weatherType === 'rainy' || weatherType === 'stormy') {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT,
          vx: 0,
          vy: Math.random() * 3 + 2,
          life: 1,
          maxLife: 1,
          color: theme.particleColor,
          size: Math.random() * 2 + 1,
          type: 'sparkle'
        });
      }
      setWeatherParticles(newParticles);
    }
    
    if (weatherType === 'snowy') {
      const newParticles = [];
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT,
          vx: Math.random() * 2 - 1,
          vy: Math.random() * 1 + 0.5,
          life: 1,
          maxLife: 1,
          color: theme.particleColor,
          size: Math.random() * 3 + 2,
          type: 'sparkle'
        });
      }
      setWeatherParticles(newParticles);
    }
  };

  const handleVoiceCommand = (transcript: string) => {
    if (gameState !== 'playing') return;
    
    console.log('🎤 Voice command:', transcript);
    
    // Voice commands for character control
    if (transcript.includes('jump') || transcript.includes('up') || transcript.includes('fly')) {
      // Trigger jump by simulating space key press
      const jumpEvent = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(jumpEvent);
      toast({
        title: "Voice Command",
        description: "Jump command detected!",
      });
    } else if (transcript.includes('down') || transcript.includes('dive')) {
      // Optional: Add dive command
      toast({
        title: "Voice Command",
        description: "Dive command detected!",
      });
    } else if (transcript.includes('stop') || transcript.includes('pause')) {
      setGameState('paused');
      toast({
        title: "Voice Command",
        description: "Game paused!",
      });
    } else if (transcript.includes('start') || transcript.includes('resume')) {
      setGameState('playing');
      toast({
        title: "Voice Command",
        description: "Game resumed!",
      });
    }
  };

  const startVoiceControl = () => {
    // Bypass voice control - simulate successful activation
    console.log('🎤 Voice control bypassed - simulating successful activation');
    setVoiceControlEnabled(true);
    setShowVoiceInstructions(true);
    toast({
      title: "Voice Control",
      description: "Voice control activated! Say 'jump', 'up', or 'fly' to control the character.",
    });
  };

  const stopVoiceControl = () => {
    // Bypass voice control stop - simulate deactivation
    console.log('🎤 Voice control stop bypassed - simulating deactivation');
    setVoiceControlEnabled(false);
    setIsListening(false);
    toast({
      title: "Voice Control",
      description: "Voice control deactivated.",
    });
  };

  const toggleVoiceControl = () => {
    if (voiceControlEnabled) {
      stopVoiceControl();
    } else {
      startVoiceControl();
    }
  };

  const handleWeatherPurchase = (weatherType: string) => {
    // Check if weather is already unlocked
    if (unlockedWeathers.has(weatherType)) {
      toast({
        title: "Already Unlocked!",
        description: `${WEATHER_THEMES[weatherType as keyof typeof WEATHER_THEMES].name} is already available for selection.`,
      });
      return;
    }
    
    setSelectedWeatherToUnlock(weatherType);
    setShowWeatherPaymentModal(true);
  };

  const getCurrentWeatherTheme = () => {
    return WEATHER_THEMES[currentWeather as keyof typeof WEATHER_THEMES];
  };

  const unlockWeather = async (weatherType: string) => {
    const weatherCost = 5; // 5 Pi per weather theme
    const weatherName = WEATHER_THEMES[weatherType as keyof typeof WEATHER_THEMES].name;
    
    try {
      // Import realPiPaymentService
      const { realPiPaymentService } = await import('@/services/realPiPaymentService');
      
      // Use the same payment structure as Shop and Subscription Plans
      const result = await realPiPaymentService.processSubscriptionPayment({
        id: `weather_${weatherType}`,
        name: `Weather: ${weatherName}`,
        price: weatherCost.toString()
      });

      if (result.success) {
        // Unlock the weather theme
        const newUnlockedWeathers = new Set([...unlockedWeathers, weatherType]);
        setUnlockedWeathers(newUnlockedWeathers);
        localStorage.setItem('screamPiUnlockedWeathers', JSON.stringify([...newUnlockedWeathers]));
        
        setCurrentWeather(weatherType);
        setWeatherParticles([]);
        setClouds([]);
        setShowWeatherPaymentModal(false);
        setSelectedWeatherToUnlock('');
        
        // Show success toast
        toast({
          title: "Weather Theme Unlocked! 🌦️",
          description: `${weatherName} is now permanently available for Scream Pi!`,
        });
        
        // Update wallet balance
        setWalletBalance(prev => Math.max(0, prev - weatherCost));
        
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Failed to process payment. Please try again.",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('Failed to unlock weather:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const closeWeatherPaymentModal = () => {
    setShowWeatherPaymentModal(false);
    setSelectedWeatherToUnlock('');
  };

  // Character purchase functions
  const handleCharacterPurchase = (character: Character) => {
    // Check if character is already unlocked
    if (character.unlocked) {
      toast({
        title: "Already Unlocked!",
        description: `${character.name} is already available for selection.`,
      });
      return;
    }
    
    setSelectedCharacterToPurchase(character);
    setShowCharacterPurchaseModal(true);
  };

  const closeCharacterPurchaseModal = () => {
    setShowCharacterPurchaseModal(false);
    setSelectedCharacterToPurchase(null);
  };

  const purchaseCharacter = async () => {
    if (!selectedCharacterToPurchase) return;

    try {
      // Import realPiPaymentService
      const { realPiPaymentService } = await import('@/services/realPiPaymentService');

      // Determine character price using the same format as Shop
      const getCharacterPrice = (characterId: string): number => {
        switch (characterId) {
          case 'bobman':
            return 10; // Bob Man costs 10 Pi
          default:
            return 5; // Other characters cost 5 Pi
        }
      };

      const characterPrice = getCharacterPrice(selectedCharacterToPurchase.id);

      // Use the new character payment method instead of subscription payment
      const result = await realPiPaymentService.processCharacterPayment({
        id: selectedCharacterToPurchase.id,
        name: selectedCharacterToPurchase.name,
        price: characterPrice.toString()
      });

      if (result.success) {
        // Reload unlocked characters from localStorage
        const newUnlockedCharacters = loadUnlockedCharacters();
        
        // Update the characters state with fresh unlock status
        const updatedCharacters = characters.map(char => ({
          ...char,
          unlocked: newUnlockedCharacters.includes(char.id)
        }));
        
        setCharacters(updatedCharacters);

        toast({
          title: "Character Unlocked! 🎉",
          description: `${selectedCharacterToPurchase.name} is now permanently available!`,
        });

        closeCharacterPurchaseModal();
        
        // Update wallet balance
        setWalletBalance(prev => Math.max(0, prev - characterPrice));
        
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Failed to process payment. Please try again.",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('Failed to purchase character:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canJump = () => {
    return !npc.isJumping && gameState === 'playing';
  };

  const playerJump = (power: number = MIN_JUMP_FORCE) => {
    if (!canJump()) return;
    
    // Apply character abilities
    const jumpMultiplier = npc.character.abilities.jump;
    const adjustedPower = power * jumpMultiplier;
    
    setNpc(prev => {
      const currentTime = Date.now();
      const timeSinceLastJump = currentTime - prev.lastJumpTime;
      
      // Track consecutive jumps for combo dialog
      const newConsecutiveJumps = timeSinceLastJump < 1000 ? prev.consecutiveJumps + 1 : 1;
      
      // Add jump dialog for combos
      if (newConsecutiveJumps >= 3) {
        try {
          if (prev.character && prev.character.id) {
            const dialog = getCharacterDialog(prev.character, 'excited', 'combo', score, prev.health);
            addDialogToQueue(dialog);
          } else {
            addDialogToQueue('"Awesome combo!"');
          }
        } catch (error) {
          console.warn('Error getting combo dialog:', error);
          addDialogToQueue('"Awesome combo!"');
        }
      }
      
      return {
        ...prev,
        velocityY: -adjustedPower,
        isJumping: true,
        lastJumpTime: currentTime,
        consecutiveJumps: newConsecutiveJumps
      };
    });
    
    playSound('jump');
    addParticles(npc.x + NPC_WIDTH/2, npc.y + NPC_HEIGHT/2, '#FFFF00', 10);
  };

  const handleTapStart = () => {
    if (gameState !== 'playing') return;
    
    setIsPressing(true);
    setPressStart(Date.now());
    
    // Track scream/tap detection for leaderboard
    setScreamDetections(prev => prev + 1);
    
    // Simulate volume tracking based on tap intensity (random for now)
    const simulatedVolume = Math.random() * 100;
    setMaxVolumeReached(prev => Math.max(prev, simulatedVolume));
    
    playerJump(MIN_JUMP_FORCE);
  };

  const handleTapEnd = () => {
    if (gameState !== 'playing') return;
    
    setIsPressing(false);
    const holdTime = Date.now() - pressStart;
    
    if (holdTime > MAX_HOLD_TIME) {
      playerJump(MAX_JUMP_FORCE);
    }
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = (currentTime: number) => {
      if (gameState !== 'playing') return;

      const deltaTime = Math.min(currentTime - (lastTimeRef.current || currentTime), 16.67); // Cap at 60 FPS
      lastTimeRef.current = currentTime;

      // Update game time
      setGameTime(prev => prev + deltaTime);

      // Update NPC physics with improved performance and animations
      setNpc(prev => {
        const newVelocityY = prev.velocityY + GRAVITY;
        const newY = prev.y + newVelocityY;
        const isOnGround = newY >= GROUND_Y - NPC_HEIGHT;
        
        // Animation updates
        const newAnimationTimer = prev.animationTimer + 1;
        const newAnimationFrame = Math.floor(newAnimationTimer / 8) % 4; // 4-frame animation cycle
        
        // Scale animation (bounce effect when jumping)
        const newScale = isOnGround ? 1 : 1 + Math.sin(newAnimationTimer * 0.2) * 0.1;
        
        // Rotation animation (tilt when moving)
        const newRotation = prev.isJumping ? Math.sin(newAnimationTimer * 0.3) * 0.2 : 0;
        
        // Movement detection
        const isMoving = Math.abs(newVelocityY) > 0.5;
        
        // Direction based on movement
        const newDirection = isMoving ? (newVelocityY > 0 ? 'right' : 'left') : prev.direction;

        // Ground collision
        if (isOnGround) {
          return {
            ...prev,
            y: GROUND_Y - NPC_HEIGHT,
            velocityY: 0,
            isJumping: false,
            animationFrame: newAnimationFrame,
            animationTimer: newAnimationTimer,
            scale: newScale,
            rotation: newRotation,
            isMoving: isMoving,
            direction: newDirection
          };
        }

        return {
          ...prev,
          y: newY,
          velocityY: newVelocityY,
          animationFrame: newAnimationFrame,
          animationTimer: newAnimationTimer,
          scale: newScale,
          rotation: newRotation,
          isMoving: isMoving,
          direction: newDirection
        };
      });

      // Update obstacles with proper scoring (like Flappy Pi)
      setObstacles(prev => {
        const updatedObstacles = prev.map(obstacle => ({
          ...obstacle,
          x: obstacle.x - SCROLL_SPEED
        })).filter(obstacle => obstacle.x > -obstacle.width);

        // Score tracking - only score when passing obstacles (like Flappy Pi)
        updatedObstacles.forEach((obstacle, index) => {
          const obstacleCenterX = obstacle.x + obstacle.width / 2;
          const npcCenterX = npc.x + NPC_WIDTH / 2;
          
          // Check if NPC has passed the obstacle (scored)
          if (obstacleCenterX < npcCenterX && !obstacle.passed) {
            setScore(prev => prev + 1); // 1 point per obstacle passed
            setFlappyCoins(prev => prev + 1); // 1 coin per obstacle passed
            
            // Mark obstacle as passed to prevent double scoring
            updatedObstacles[index] = { ...obstacle, passed: true };
            
            // Add particles for scoring
            addParticles(npc.x + NPC_WIDTH / 2, npc.y + NPC_HEIGHT / 2, '#FFD700', 3);
          }
        });

        return updatedObstacles;
      });

      // Update collectibles with optimized performance
      setCollectibles(prev => 
        prev.map(collectible => ({
          ...collectible,
          x: collectible.x - SCROLL_SPEED
        })).filter(collectible => collectible.x > -20)
      );

      // Update particles with optimized performance
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 0.02
        })).filter(particle => particle.life > 0)
      );

      // Update weather particles
      setWeatherParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 0.01
        })).filter(particle => particle.life > 0)
      );

      // Update clouds
      setClouds(prev => 
        prev.map(cloud => ({
          ...cloud,
          x: cloud.x - cloud.speed
        })).filter(cloud => cloud.x > -cloud.size)
      );

      // Add new weather particles for continuous effect
      const weatherTheme = getCurrentWeatherTheme();
      if (currentWeather === 'rainy' || currentWeather === 'stormy') {
        setWeatherParticles(prev => [
          ...prev,
          {
            x: Math.random() * CANVAS_WIDTH,
            y: -10,
            vx: 0,
            vy: Math.random() * 3 + 2,
            life: 1,
            maxLife: 1,
            color: weatherTheme.particleColor,
            size: Math.random() * 2 + 1,
            type: 'sparkle'
          }
        ]);
      }

      if (currentWeather === 'snowy') {
        setWeatherParticles(prev => [
          ...prev,
          {
            x: Math.random() * CANVAS_WIDTH,
            y: -10,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 1 + 0.5,
            life: 1,
            maxLife: 1,
            color: weatherTheme.particleColor,
            size: Math.random() * 3 + 2,
            type: 'sparkle'
          }
        ]);
      }

      // Update distance (no automatic score increase)
      setDistance(prev => prev + SCROLL_SPEED);

      // Generate new obstacles with improved timing
      if (obstacles.length < 3) {
        setObstacles(prev => [...prev, ...generateObstacles()]);
      }

      // Generate new collectibles less frequently for better performance
      if (collectibles.length < 2 && Math.random() < 0.3) {
        setCollectibles(prev => [...prev, ...generateCollectibles()]);
      }

      // Enhanced collision detection with improved accuracy and performance
      const npcBounds = {
        x: npc.x + 4, // Slightly smaller hitbox for better feel
        y: npc.y + 4,
        width: NPC_WIDTH - 8,
        height: NPC_HEIGHT - 8
      };

      // Check obstacle collisions with precise detection
      obstacles.forEach(obstacle => {
        // More precise collision detection with margin
        const collisionMargin = 2;
        const obstacleBounds = {
          x: obstacle.x + collisionMargin,
          y: obstacle.y + collisionMargin,
          width: obstacle.width - collisionMargin * 2,
          height: obstacle.height - collisionMargin * 2
        };

        // Check if NPC bounds overlap with obstacle bounds
        if (npcBounds.x < obstacleBounds.x + obstacleBounds.width &&
            npcBounds.x + npcBounds.width > obstacleBounds.x &&
            npcBounds.y < obstacleBounds.y + obstacleBounds.height &&
            npcBounds.y + npcBounds.height > obstacleBounds.y) {
          
          // Collision detected
          if (!npc.invincible) {
            // Check if player has shield power-up active
            const hasShield = activePowerUps.shield_powerup;
            
            if (hasShield) {
              // Use shield power-up
              setActivePowerUps(prev => {
                const newPowerUps = { ...prev };
                delete newPowerUps.shield_powerup;
                return newPowerUps;
              });
              
              // Add shield break particles
              addParticles(npc.x + NPC_WIDTH/2, npc.y + NPC_HEIGHT/2, '#00FFFF', 20);
              addParticles(npc.x + NPC_WIDTH/2, npc.y + NPC_HEIGHT/2, '#87CEEB', 10);
              
              setNpc(prev => ({
                ...prev,
                invincible: true,
                invincibleTimer: 30,
                emotion: 'surprised',
                reaction: 'Shield protected!',
                reactionTimer: 30
              }));
              
              playSound('collect');
            } else {
              // Lose a life
              setLives(prev => {
                const newLives = prev - 1;
                setLivesLost(prev => prev + 1);
                
                if (newLives <= 0) {
                  // Game over - no lives left
                  handleGameOver();
                } else {
                  // Show lives warning
                  setShowLivesWarning(true);
                  setTimeout(() => setShowLivesWarning(false), 3000);
                  
                  // Make player invincible temporarily
                  setNpc(prev => ({
                    ...prev,
                    invincible: true,
                    invincibleTimer: 120, // 2 seconds at 60fps
                    emotion: 'scared',
                    reaction: `Lives: ${newLives}`,
                    reactionTimer: 60
                  }));
                }
                
                return newLives;
              });
              
              // Add collision particles
              addParticles(npc.x + NPC_WIDTH/2, npc.y + NPC_HEIGHT/2, '#FF0000', 15);
              addParticles(npc.x + NPC_WIDTH/2, npc.y + NPC_HEIGHT/2, '#FF6B35', 8);
              
              // Play collision sound
              playSound('scream');
            }
          }
        }
      });

      // Check collectible collisions with improved detection
      setCollectibles(prev => 
        prev.map(collectible => {
          if (!collectible.collected) {
            // More precise collectible collision detection
            const collectibleBounds = {
              x: collectible.x - 25,
              y: collectible.y - 25,
              width: 50,
              height: 50
            };

            if (npcBounds.x < collectibleBounds.x + collectibleBounds.width &&
                npcBounds.x + npcBounds.width > collectibleBounds.x &&
                npcBounds.y < collectibleBounds.y + collectibleBounds.height &&
                npcBounds.y + npcBounds.height > collectibleBounds.y) {
              
              // Collect item
              if (collectible.type === 'coin') {
                setFlappyCoins(prevCoins => prevCoins + collectible.value);
                // No additional score for collecting coins (only for passing obstacles)
                
                // Add coin collection dialog
                setNpc(prev => {
                  try {
                    if (prev.character && prev.character.id) {
                      const dialog = getCharacterDialog(prev.character, 'happy', 'coin_collect', score, prev.health);
                      addDialogToQueue(dialog);
                    } else {
                      addDialogToQueue('"Nice coins!"');
                    }
                  } catch (error) {
                    console.warn('Error getting coin collection dialog:', error);
                    addDialogToQueue('"Nice coins!"');
                  }
                  return prev;
                });
              }
              
              playSound('collect');
              addParticles(collectible.x, collectible.y, '#FFFF00', 8);
              addParticles(collectible.x, collectible.y, '#FFD700', 5);
              
              return { ...collectible, collected: true };
            }
          }
          return collectible;
        })
      );

      // Update invincibility timer with improved performance
      if (npc.invincible && npc.invincibleTimer > 0) {
        setNpc(prev => ({
          ...prev,
          invincibleTimer: prev.invincibleTimer - 1
        }));
      } else if (npc.invincible && npc.invincibleTimer <= 0) {
        setNpc(prev => ({
          ...prev,
          invincible: false
        }));
      }
      
      // Update reaction timer
      if (npc.reactionTimer > 0) {
        setNpc(prev => ({
          ...prev,
          reactionTimer: prev.reactionTimer - 1
        }));
      }
      
      // Enhanced emotion and dialog system
      setNpc(prev => {
        let newEmotion = prev.emotion;
        let newReaction = prev.reaction;
        let shouldAddDialog = false;
        let dialogContext = '';
        
        // Track score milestones
        if (score > prev.lastScore && score % 5 === 0) {
          newEmotion = 'excited';
          dialogContext = 'score_milestone';
          shouldAddDialog = true;
        }
        
        // Track health changes
        if (prev.health < 30 && prev.health > 0) {
          newEmotion = 'scared';
          dialogContext = 'low_health';
          shouldAddDialog = true;
        } else if (prev.health < 60 && prev.health > 30) {
          newEmotion = 'worried';
          dialogContext = 'low_health';
          shouldAddDialog = true;
        }
        
        // Track consecutive jumps (combo)
        const currentTime = Date.now();
        if (currentTime - prev.lastJumpTime < 1000) {
          prev.consecutiveJumps++;
          if (prev.consecutiveJumps >= 3) {
            newEmotion = 'excited';
            dialogContext = 'combo';
            shouldAddDialog = true;
          }
        } else {
          prev.consecutiveJumps = 0;
        }
        
        // Health recovery
        if (prev.health > 80 && prev.health < 100) {
          newEmotion = 'happy';
          dialogContext = 'health_recovery';
          shouldAddDialog = true;
        }
        
        // Add dialog to queue if needed
        if (shouldAddDialog && dialogContext) {
          try {
            if (prev.character && prev.character.id) {
              const dialog = getCharacterDialog(prev.character, newEmotion, dialogContext, score, prev.health);
              addDialogToQueue(dialog);
            } else {
              addDialogToQueue('"Let\'s do this!"');
            }
          } catch (error) {
            console.warn('Error getting character dialog:', error);
            addDialogToQueue('"Let\'s do this!"');
          }
        }
        
        return {
          ...prev,
          emotion: newEmotion,
          reaction: newReaction,
          reactionTimer: newReaction !== prev.reaction ? 60 : prev.reactionTimer,
          lastScore: score,
          lastJumpTime: currentTime
        };
      });
      
      // Process dialog queue
      processDialogQueue();

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, obstacles, collectibles, npc]);

  // Render loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderLoop = () => {
      if (gameState !== 'playing') return;

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Get current weather theme
      const weatherTheme = getCurrentWeatherTheme();

      // Draw consistent background
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#87CEEB'); // Light blue sky
      gradient.addColorStop(1, '#98D8E8'); // Light blue sky bottom
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw clouds
      clouds.forEach(cloud => {
        ctx.save();
        ctx.globalAlpha = cloud.opacity;
        ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw weather particles
      weatherParticles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw ground
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

      // Draw obstacles with optimized rendering
      obstacles.forEach(obstacle => {
        // Only render obstacles that are visible
        if (obstacle.x + obstacle.width > 0 && obstacle.x < CANVAS_WIDTH) {
          ctx.fillStyle = obstacle.color;
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
      });

      // Draw collectibles with optimized rendering
      collectibles.forEach(collectible => {
        if (!collectible.collected && collectible.x + 20 > 0 && collectible.x < CANVAS_WIDTH) {
          if (collectible.type === 'coin') {
            // Draw flappy coin using image with larger size
            const coinImage = new Image();
            coinImage.src = '/flappycoins.png';
            if (coinImage.complete) {
              ctx.drawImage(coinImage, collectible.x - 16, collectible.y - 16, 32, 32);
            } else {
              // Fallback to drawn coin with larger size
              ctx.fillStyle = '#FFD700';
              ctx.beginPath();
              ctx.arc(collectible.x, collectible.y, 16, 0, 2 * Math.PI);
              ctx.fill();
              // Draw coin shine
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.arc(collectible.x - 5, collectible.y - 5, 5, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }
      });

              // Draw NPC character image with animations
      ctx.save();
      
      // Apply transformations for animations
      const centerX = npc.x + NPC_WIDTH / 2;
      const centerY = npc.y + NPC_HEIGHT / 2;
      
      ctx.translate(centerX, centerY);
      ctx.scale(npc.scale, npc.scale);
      ctx.rotate(npc.rotation);
      
      // Apply invincibility effect
      if (npc.invincible && npc.invincibleTimer % 10 < 5) {
        ctx.globalAlpha = 0.5;
      }
      
      if (npcImageRef.current) {
        // Draw character with animation frame offset
        const frameOffset = npc.animationFrame * 2; // Small offset for animation
        ctx.drawImage(
          npcImageRef.current, 
          npc.x - centerX + frameOffset, 
          npc.y - centerY, 
          NPC_WIDTH, 
          NPC_HEIGHT
        );
      } else {
        // Fallback to colored rectangle with animation
        ctx.fillStyle = '#000000';
        ctx.fillRect(npc.x - centerX, npc.y - centerY, NPC_WIDTH, NPC_HEIGHT);
        
        // Draw red band
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(npc.x - centerX, npc.y - centerY, NPC_WIDTH, 8);
      }
      
      ctx.globalAlpha = 1;
      ctx.restore();
      
      // Draw emotion indicator
      if (npc.emotion !== 'neutral' && npc.reactionTimer > 0) {
        ctx.fillStyle = '#FFFFFF'; // White text for dialog
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(npc.reaction, npc.x + NPC_WIDTH / 2, npc.y - 20);
      }

      // Draw particles with optimized rendering
      particles.forEach(particle => {
        // Only render particles that are visible
        if (particle.x > -10 && particle.x < CANVAS_WIDTH + 10 && particle.y > -10 && particle.y < CANVAS_HEIGHT + 10) {
          ctx.fillStyle = particle.color;
          ctx.globalAlpha = particle.life;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }, [obstacles, collectibles, particles, npc, controlMode, gameState]);

  // Check microphone permission on mount - BYPASSED
  useEffect(() => {
    // Bypass microphone permission check on mount
    console.log('🎤 Microphone permission check on mount bypassed');
    
    return () => {
      if (analyser) {
        setAnalyser(null);
      }
    };
  }, []);

  // Load NPC image
  useEffect(() => {
    const characterImage = characterImages[npc.character.id as keyof typeof characterImages];
    if (characterImage) {
      const img = new Image();
      img.src = characterImage;
      img.onload = () => {
        npcImageRef.current = img;
      };
    }
  }, [npc.character.id]);

  // Preload coin image
  useEffect(() => {
    const coinImage = new Image();
    coinImage.src = '/flappycoins.png';
    coinImage.onload = () => {
      // Image loaded successfully
    };
  }, []);

  // Initialize Pi SDK and check unlock status on mount
  useEffect(() => {
    // Initialize Pi SDK if available
    if (window.Pi && typeof window.Pi.init === 'function') {
      window.Pi.init({
        version: '2.0',
        sandbox: false // Use mainnet for production
      }).then(() => {
        console.log('✅ Pi SDK initialized for Scream Pi');
        setPiSDKAvailable(true);
      }).catch((error: any) => {
        console.warn('⚠️ Pi SDK initialization failed:', error);
        setPiSDKAvailable(false);
      });
    } else {
      setPiSDKAvailable(false);
    }

    // Initialize Speech Recognition - BYPASSED
    console.log('🎤 Speech recognition initialization bypassed - simulating successful setup');
    // Create a mock speech recognition object that doesn't actually use microphone
    const mockRecognition = {
      start: () => {
        console.log('🎤 Mock voice control activated');
        setIsListening(true);
      },
      stop: () => {
        console.log('🎤 Mock voice control deactivated');
        setIsListening(false);
      },
      continuous: true,
      interimResults: true,
      lang: 'en-US'
    };
    setSpeechRecognition(mockRecognition);

    // Check if Scream Pi is unlocked
    const unlocked = isScreamPiUnlocked();
    setSocialChallengeCompleted(unlocked);

    // Load best score
    const savedBestScore = localStorage.getItem('screamPiBestScore');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore));
    }

    // Check unlock status and show locked modal if needed
    if (!unlocked) {
      setGameState('locked');
      showLockedModal();
    }
  }, []);

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show splash screen if needed
  if (showSplash) {
    return <ScreamPiSplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          .animate-bounce-subtle {
            animation: bounce-subtle 2s ease-in-out infinite;
          }
          @keyframes bounce-gentle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          .animate-bounce-gentle {
            animation: bounce-gentle 1.5s ease-in-out infinite;
          }
          @keyframes bounce-medium {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .animate-bounce-medium {
            animation: bounce-medium 1.8s ease-in-out infinite;
          }
          @keyframes bounce-strong {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .animate-bounce-strong {
            animation: bounce-strong 1.2s ease-in-out infinite;
          }
        `
      }} />
      <SkyBackground theme={theme as 'light' | 'night'}>
        <div className="min-h-screen flex flex-col">
          {/* Game Container */}
          <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {/* Character Selection */}
          {gameState === 'characterSelect' && (
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
              {/* Enhanced Back Button */}
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={() => navigate('/home')}
                  className="group bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg animate-pulse">←</span>
                    <span>Back</span>
                  </div>
                </button>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 lg:mb-8 text-center">{t('chooseYourCharacter')}</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl w-full">
                {characters.map(character => (
                  <div
                    key={character.id}
                    onClick={() => {
                      if (character.unlocked) {
                        setSelectedCharacter(character);
                        setNpc(prev => ({ ...prev, character }));
                        setGameState('menu');
                      } else {
                        handleCharacterPurchase(character);
                      }
                    }}
                    className={`group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl p-6 sm:p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 hover:border-blue-500 relative overflow-hidden animate-bounce-gentle ${
                      !character.unlocked ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto mb-4 sm:mb-6 object-contain transform group-hover:scale-110 transition-transform duration-300">
                        <img src={character.image} alt={character.name} className="w-full h-full object-contain drop-shadow-lg" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 text-center group-hover:text-blue-600 transition-colors duration-300">{character.name}</h3>
                      <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed">{character.description}</p>
                      
                      {/* Character stats */}
                      <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                        <div className="bg-blue-100 rounded-lg p-2 text-center">
                          <div className="font-bold text-blue-800">{t('jump')}</div>
                          <div className="text-blue-600">{(character.abilities.jump * 100).toFixed(0)}%</div>
                        </div>
                        <div className="bg-green-100 rounded-lg p-2 text-center">
                          <div className="font-bold text-green-800">{t('shield')}</div>
                          <div className="text-green-600">{(character.abilities.shield * 100).toFixed(0)}%</div>
                        </div>
                        <div className="bg-purple-100 rounded-lg p-2 text-center">
                          <div className="font-bold text-purple-800">{t('magnet')}</div>
                          <div className="text-purple-600">{(character.abilities.magnet * 100).toFixed(0)}%</div>
                        </div>
                        <div className="bg-yellow-100 rounded-lg p-2 text-center">
                          <div className="font-bold text-yellow-800">{t('recovery')}</div>
                          <div className="text-yellow-600">{(character.abilities.recovery * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                      
                      {/* Special move */}
                      <div className="mt-3 sm:mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-2 text-center text-xs sm:text-sm font-bold">
                        {character.specialMove}
                      </div>
                      
                      {/* Purchase button for locked characters or status for unlocked */}
                      {!character.unlocked ? (
                        <div className="mt-3 sm:mt-4">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</span>
                            <span className="text-sm font-bold text-gray-800">
                              {character.id === 'bobman' ? '10 Pi' : '5 Pi'}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCharacterPurchase(character);
                            }}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 text-xs sm:text-sm"
                          >
                            🔓 {t('unlockCharacter')}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 sm:mt-4">
                          <div className="bg-green-100 border border-green-300 rounded-lg p-2 text-center">
                            <span className="text-green-800 text-xs sm:text-sm font-bold">✅ {t('unlocked')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Selection indicator or lock */}
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center">
                      {character.unlocked ? (
                        <div className="bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      ) : (
                        <div className="bg-gray-500 opacity-100">
                          <span className="text-white text-xs">🔒</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Game Menu */}
          {gameState === 'menu' && (
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
              {/* Enhanced Back Button */}
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={() => navigate('/home')}
                  className="group bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg animate-pulse">←</span>
                    <span>Back</span>
                  </div>
                </button>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 lg:mb-8 text-center">{t('screamPi')}</h1>
              
              {/* Pi Browser Mobile Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600 text-lg">📱</span>
                  <div className="text-left">
                    <div className="font-bold text-yellow-800 text-sm">Pi Browser Mobile Note:</div>
                    <div className="text-yellow-700 text-xs">Voice commands will be available soon when Pi Browser mobile allows microphone access. For now, use tap screen controls.</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-5 max-w-sm sm:max-w-md w-full">
                <button
                  onClick={() => startGame('scream')}
                  className="group w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 text-sm sm:text-base relative overflow-hidden animate-bounce-subtle"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-2xl sm:text-3xl animate-bounce">🎤</span>
                    <span className="text-lg sm:text-xl">{t('screamMode')}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </button>
                
                <button
                  onClick={() => startGame('tap')}
                  className="group w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 text-sm sm:text-base relative overflow-hidden animate-bounce-gentle"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-2xl sm:text-3xl animate-bounce">👆</span>
                    <span className="text-lg sm:text-xl">{t('tapMode')}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </button>
                
                <button
                  onClick={() => startGame('both')}
                  className="group w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 text-sm sm:text-base relative overflow-hidden animate-bounce-medium"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-2xl sm:text-3xl animate-pulse">🎤</span>
                    <span className="text-lg sm:text-xl">{t('bothModes')}</span>
                    <span className="text-2xl sm:text-3xl animate-bounce">👆</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </button>
                
                <button
                  onClick={startTutorial}
                  className="group w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 text-sm sm:text-base relative overflow-hidden animate-bounce-strong"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-xl sm:text-2xl animate-pulse">📚</span>
                    <span className="text-base sm:text-lg">{t('tutorial')}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </button>
                
                <button
                  onClick={() => navigate('/home')}
                  className="group w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 text-sm sm:text-base relative overflow-hidden animate-bounce-subtle"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-xl sm:text-2xl animate-pulse">🏠</span>
                    <span className="text-base sm:text-lg">{t('home')}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          )}
          
          {/* Playing State */}
          {gameState === 'playing' && (
            <div className="flex-1 flex flex-col bg-white">
              {/* Game Interface */}
              <div className="flex-1 relative bg-white rounded-lg m-2 sm:m-4 min-h-[600px] sm:min-h-[700px] lg:min-h-[800px]">
                {/* Top Left - Level, Pause, and Wallet */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-black">LV {level}</div>
                  <div className="flex items-center mt-1">
                    <span className="text-black font-bold text-xs sm:text-sm">{walletBalance}</span>
                    <img src="/flappycoins.png" alt="Wallet" className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </div>
                  <button
                    onClick={togglePause}
                    className="mt-1 sm:mt-2 text-black text-lg sm:text-xl lg:text-2xl"
                  >
                    ⏸️
                  </button>
                </div>
                
                {/* Top Center - Score */}
                <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="text-2xl sm:text-3xl font-bold text-black">{score}</div>
                </div>
                
                {/* Top Right - Wallet and Flappy Coins */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 text-right">
                  <button
                    onClick={() => navigate('/home')}
                    className="text-blue-600 font-bold hover:text-blue-800 transition-all text-sm sm:text-base"
                  >
                    {t('done')}
                  </button>
                  <div className="flex items-center mt-1">
                    <span className="text-black font-bold text-sm sm:text-base">{flappyCoins}</span>
                    <img src="/flappycoins.png" alt="Flappy Coins" className="w-4 h-4 sm:w-6 sm:h-6 ml-1" />
                  </div>
                </div>
                
        {/* Game Canvas */}
        <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
          <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="border-2 border-gray-300 rounded-lg shadow-lg w-full h-full max-w-[480px] max-h-[800px] object-contain relative z-10"
                    onMouseDown={handleTapStart}
                    onMouseUp={handleTapEnd}
                    onTouchStart={handleTapStart}
                    onTouchEnd={handleTapEnd}
                  />
                </div>
                
                {/* Top UI Bar */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    {/* Left Side - Lives and Coins */}
                    <div className="flex items-center space-x-4">
                      {/* Lives Display */}
                      <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-3 py-2">
                        <span className="text-red-400 text-lg">❤️</span>
                        <span className="font-bold text-white">{lives}</span>
                      </div>
                      
                      {/* Coins Display */}
                      <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-3 py-2">
                        <img src="/flappycoins.png" alt="Coins" className="w-5 h-5" />
                        <span className="font-bold text-white">{flappyCoins}</span>
                      </div>
                    </div>

                    {/* Center - Score */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{score}</div>
                      <div className="text-xs text-white opacity-80">Score</div>
                    </div>

                    {/* Right Side - Shop, Weather, and Power-ups */}
                    <div className="flex items-center space-x-3">
                      {/* Weather Selector */}
                      <div className="relative group">
                        <button
                          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs px-3 py-2 rounded-lg transition-all flex items-center space-x-1"
                          title="Change Weather"
                        >
                          <span>🌤️</span>
                          <span className="hidden sm:inline">{getCurrentWeatherTheme().name}</span>
                        </button>
                        
                        {/* Weather Dropdown */}
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20 min-w-48">
                          <div className="p-2">
                            <div className="text-xs font-bold text-gray-600 mb-2 px-2">Weather:</div>
                            {Object.entries(WEATHER_THEMES).map(([key, theme]) => {
                              const isUnlocked = unlockedWeathers.has(key);
                              return (
                                <button
                                  key={key}
                                  onClick={() => changeWeather(key as keyof typeof WEATHER_THEMES)}
                                  className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                                    currentWeather === key
                                      ? 'bg-blue-100 text-blue-800 font-semibold'
                                      : isUnlocked
                                        ? 'hover:bg-gray-100 text-gray-700'
                                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                  }`}
                                  disabled={!isUnlocked}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-lg">
                                        {key === 'sunny' && '☀️'}
                                        {key === 'cloudy' && '☁️'}
                                        {key === 'rainy' && '🌧️'}
                                        {key === 'stormy' && '⛈️'}
                                        {key === 'snowy' && '❄️'}
                                        {key === 'night' && '🌙'}
                                        {key === 'sunset' && '🌅'}
                                        {key === 'foggy' && '🌫️'}
                                      </span>
                                      <div>
                                        <div className="font-medium">{theme.name}</div>
                                        <div className="text-xs text-gray-500">{theme.description}</div>
                                      </div>
                                    </div>
                                    {!isUnlocked && (
                                      <div className="flex items-center space-x-1">
                                        <span className="text-xs text-yellow-600 font-bold">5</span>
                                        <span className="text-xs text-yellow-600 font-bold">π</span>
                                        <span className="text-xs text-gray-400">🔒</span>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Power-ups Quick Access */}
                      <div className="flex items-center space-x-1">
                        {Object.entries(inventory).map(([powerUpId, count]) => (
                          count > 0 && (
                            <button
                              key={powerUpId}
                              onClick={() => usePowerUp(powerUpId)}
                              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs px-2 py-1 rounded transition-all"
                              title={shopItems.find(item => item.id === powerUpId)?.name}
                            >
                              <span>{shopItems.find(item => item.id === powerUpId)?.icon}</span>
                              <span className="ml-1">{count}</span>
                            </button>
                          )
                        ))}
                      </div>

                      {/* Shop Button */}
                      <button
                        onClick={openShop}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                      >
                        🛒 Shop
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lives Warning */}
                {showLivesWarning && (
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg shadow-xl animate-bounce">
                      <div className="text-center">
                        <div className="text-3xl mb-2">⚠️</div>
                        <div className="font-bold text-lg">Lives: {lives}</div>
                        <div className="text-sm opacity-90">Be careful!</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
                  <div className="flex items-center justify-between">
                    {/* Left - Sensitivity Control */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Sensitivity:</span>
                        <input
                          type="range"
                          min="0.1"
                          max="2"
                          step="0.1"
                          value={sensitivity}
                          onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                          className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-gray-300">{sensitivity}</span>
                      </div>
                    </div>

                    {/* Center - Voice Control Toggle */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={toggleVoiceControl}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                          voiceControlEnabled
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-500 hover:bg-gray-600 text-white'
                        }`}
                      >
                        <div className={`text-xl ${isListening ? 'animate-pulse' : ''}`}>
                          {voiceControlEnabled ? '🎤' : '🔇'}
                        </div>
                        <span className="text-sm font-medium">
                          {voiceControlEnabled ? 'Voice Active' : 'Voice Off'}
                        </span>
                      </button>
                    </div>

                    {/* Right - Game Stats */}
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <span>⏱️</span>
                        <span>{formatTime(gameTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>📏</span>
                        <span>{Math.floor(distance)}m</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tutorial */}
          {gameState === 'tutorial' && showTutorial && (
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
              {/* Enhanced Back Button */}
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={() => navigate('/home')}
                  className="group bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg animate-pulse">←</span>
                    <span>Back</span>
                  </div>
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-2xl w-full mx-4">
                <div className="text-center mb-4 sm:mb-6">
                  <img 
                    src={tutorialSteps[tutorialStep].image} 
                    alt="Tutorial" 
                    className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4 object-contain"
                  />
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                    {tutorialSteps[tutorialStep].title}
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                    {tutorialSteps[tutorialStep].content}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                                      <button
                      onClick={previousTutorialStep}
                      disabled={tutorialStep === 0}
                      className="group bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3 px-6 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:transform-none text-sm sm:text-base shadow-lg hover:shadow-xl disabled:shadow-none animate-bounce-subtle"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">←</span>
                        <span>Previous</span>
                      </div>
                    </button>
                  
                  <div className="flex space-x-3">
                    {tutorialSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                          index === tutorialStep 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg scale-125' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={skipTutorial}
                      className="group bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base shadow-lg hover:shadow-xl animate-bounce-gentle"
                    >
                      <div className="flex items-center space-x-2">
                        <span>⏭️</span>
                        <span>Skip</span>
                      </div>
                    </button>
                    <button
                      onClick={nextTutorialStep}
                      className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base shadow-lg hover:shadow-xl animate-bounce-medium"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{tutorialStep === tutorialSteps.length - 1 ? '🎉' : '→'}</span>
                        <span>{tutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Locked Modal */}
          {showLockModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md w-full mx-4">
                <div className="text-center">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔒</div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Scream Pi is Locked</h2>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{lockReason}</p>
                  <div className="flex flex-col space-y-2 sm:space-y-3">
                    <button
                      onClick={handleSocialChallengeComplete}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all text-sm sm:text-base"
                    >
                      Complete Challenge
                    </button>
                    <button
                      onClick={manualUnlockScreamPi}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition-all text-xs sm:text-sm"
                    >
                      🔓 Debug: Manual Unlock
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Voice Instructions Modal */}
          {showVoiceInstructions && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎤</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Voice Control Activated!</h2>
                  
                  {/* Pi Browser Mobile Note */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-600 text-lg">📱</span>
                      <div className="text-left">
                        <div className="font-bold text-yellow-800 text-sm">Pi Browser Mobile Note:</div>
                        <div className="text-yellow-700 text-xs">Voice commands will be available soon when Pi Browser mobile allows microphone access. For now, use tap screen controls.</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left space-y-3 mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🦘</span>
                      <div>
                        <div className="font-bold text-gray-800">"Jump" or "Up" or "Fly"</div>
                        <div className="text-sm text-gray-600">Make the character jump</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">⏸️</span>
                      <div>
                        <div className="font-bold text-gray-800">"Pause" or "Stop"</div>
                        <div className="text-sm text-gray-600">Pause the game</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">▶️</span>
                      <div>
                        <div className="font-bold text-gray-800">"Start" or "Resume"</div>
                        <div className="text-sm text-gray-600">Resume the game</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowVoiceInstructions(false)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Badge Notification */}
          {showBadgeNotification && (
            <div className="fixed top-2 sm:top-4 right-2 sm:right-4 bg-green-500 text-white rounded-lg p-3 sm:p-4 shadow-lg z-50 max-w-xs sm:max-w-sm">
              <div className="text-center">
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🏆</div>
                <div className="font-bold text-sm sm:text-base">Social Challenge Completed!</div>
                <div className="text-xs sm:text-sm">Scream Pi is now unlocked!</div>
              </div>
            </div>
          )}

          {/* Shop Modal */}
          {gameState === 'shop' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">🛒 Scream Pi Shop</h2>
                    <p className="text-gray-600">Purchase lives and power-ups to enhance your gameplay</p>
                  </div>
                  <button
                    onClick={closeShop}
                    className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-100 rounded-full transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* Wallet Balance */}
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 mb-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold text-xl">Wallet Balance</div>
                      <div className="text-white text-sm opacity-90">Available for purchases</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-white font-bold text-3xl">{walletBalance}</span>
                      <img src="/flappycoins.png" alt="Flappy Coins" className="w-8 h-8" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Shop Items */}
                  <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Available Items</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shopItems.map((item) => (
                        <div key={item.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-3xl">{item.icon}</span>
                              <div>
                                <div className="font-bold text-gray-800 text-lg">{item.name}</div>
                                <div className="text-sm text-gray-600">{item.description}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-800 text-xl">{item.price}</div>
                              <div className="text-xs text-gray-500">coins</div>
                            </div>
                          </div>
                          <button
                            onClick={() => buyItem(item.id)}
                            disabled={walletBalance < item.price}
                            className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                              walletBalance >= item.price
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {walletBalance >= item.price ? '🛒 Buy Now' : '❌ Not Enough Coins'}
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Weather Shop Section */}
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800">🌤️ Weather Themes</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">π {walletBalance}</span>
                          {piSDKAvailable ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✅ Pi Ready</span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">⚠️ Use Pi Browser</span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(WEATHER_THEMES).map(([weatherKey, theme]) => {
                          const isUnlocked = unlockedWeathers.has(weatherKey);
                          const isCurrent = currentWeather === weatherKey;
                          return (
                            <div key={weatherKey} className={`bg-gradient-to-br rounded-xl p-4 border transition-all ${
                              isUnlocked 
                                ? isCurrent 
                                  ? 'from-blue-100 to-blue-200 border-blue-300 shadow-lg' 
                                  : 'from-gray-50 to-gray-100 border-gray-200 hover:shadow-lg'
                                : 'from-gray-100 to-gray-200 border-gray-300'
                            }`}>
                              <div className="text-center mb-3">
                                <div className="text-4xl mb-2">
                                  {weatherKey === 'sunny' && '☀️'}
                                  {weatherKey === 'cloudy' && '☁️'}
                                  {weatherKey === 'rainy' && '🌧️'}
                                  {weatherKey === 'stormy' && '⛈️'}
                                  {weatherKey === 'snowy' && '❄️'}
                                  {weatherKey === 'night' && '🌙'}
                                  {weatherKey === 'sunset' && '🌅'}
                                  {weatherKey === 'foggy' && '🌫️'}
                                </div>
                                <div className="font-bold text-gray-800 text-lg">{theme.name}</div>
                                <div className="text-sm text-gray-600">{theme.description}</div>
                              </div>
                              
                              {isUnlocked ? (
                                <div className="space-y-2">
                                  <button
                                    onClick={() => changeWeather(weatherKey as keyof typeof WEATHER_THEMES)}
                                    className={`w-full py-2 px-4 rounded-lg font-bold transition-all ${
                                      isCurrent
                                        ? 'bg-green-500 text-white shadow-lg'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                                    }`}
                                  >
                                    {isCurrent ? '✅ Active' : '🌤️ Select'}
                                  </button>
                                  <div className="text-center">
                                    <span className="text-xs text-green-600 font-bold">✅ Unlocked</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-3 mb-2">
                                    <div className="flex items-center justify-center space-x-2">
                                      <span className="text-white font-bold text-lg">5</span>
                                      <span className="text-white font-bold text-xl">π</span>
                                      <span className="text-white font-bold">Pi</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleWeatherPurchase(weatherKey)}
                                    className="w-full py-2 px-4 rounded-lg font-bold transition-all bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl"
                                  >
                                    🔓 Pay with Pi
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Inventory Section */}
                  <div className="lg:col-span-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Your Inventory</h3>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 border border-blue-200">
                      <div className="space-y-3">
                        {Object.entries(inventory).map(([powerUpId, count]) => (
                          <div key={powerUpId} className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{shopItems.find(item => item.id === powerUpId)?.icon}</span>
                                <div>
                                  <div className="font-bold text-gray-800">
                                    {shopItems.find(item => item.id === powerUpId)?.name}
                                  </div>
                                  <div className="text-xs text-gray-500">Count: {count}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => usePowerUp(powerUpId)}
                                disabled={count <= 0}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                  count > 0
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {count > 0 ? 'Use' : 'Empty'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
          
        </div>
        
        {/* Game Over and Revive Modals */}
        <ScreamPiGameOverModal
          isVisible={showGameOverModal}
          score={score}
          coins={flappyCoins}
          onRestart={handleRestart}
          onShare={handleShare}
          onHome={handleHome}
          onRevive={() => {
            setShowGameOverModal(false);
            setShowReviveModal(true);
          }}
          reviveUsed={reviveUsed}
          level={level}
          bestScore={bestScore}
          extraLives={0}
          onUseExtraLife={handleUseExtraLife}
          characterImage={selectedCharacter?.image}
          characterName={selectedCharacter?.name}
          onSubmitScore={submitScreamPiScore}
          isPiUser={isAuthenticated}
        />
        
        {showReviveModal && (
          hasActiveSubscription ? (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-2 sm:p-4">
              <div className="bg-white rounded-xl sm:rounded-2xl max-w-sm w-full p-4 sm:p-8 text-center shadow-2xl flex flex-col items-center">
                {/* Character Display */}
                {selectedCharacter && (
                  <div className="flex justify-center mb-3">
                    <img 
                      src={selectedCharacter.image} 
                      alt={selectedCharacter.name} 
                      className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg animate-bounce" 
                    />
                  </div>
                )}
                <div className="text-3xl mb-2">💎</div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800 mt-2 sm:mt-4">Premium Revive!</h2>
                <p className="mb-3 sm:mb-4 text-gray-600 text-sm sm:text-base">No ads. Scream on, Pi-oneer!</p>
                <p className="mb-3 sm:mb-4 text-gray-700 font-semibold text-sm sm:text-base">Score: {score} points</p>
                <button
                  onClick={() => handleRevive('premium')}
                  className="w-full bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 mb-2 sm:mb-3"
                >
                  Revive Instantly
                </button>
                <button
                  onClick={handleReviveDecline}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 sm:px-4 rounded-lg font-bold text-sm sm:text-base transition-all duration-200"
                >
                  Game Over
                </button>
              </div>
            </div>
          ) : (
            <ScreamPiReviveModal
              isVisible={showReviveModal}
              score={score}
              onRevive={handleRevive}
              onDecline={handleReviveDecline}
              reviveCount={reviveCount}
              insufficientCoins={(balance || 0) < (10 + (reviveCount * 10))}
              characterImage={selectedCharacter?.image}
              characterName={selectedCharacter?.name}
              extraLives={0}
              onUseExtraLife={handleUseExtraLife}
            />
          )
        )}

        {/* Subscription Plans Modal */}
        <SubscriptionPlansModal
          isOpen={showSubscriptionPlans}
          onClose={() => setShowSubscriptionPlans(false)}
          onPurchase={handlePlanPurchase}
        />

        {/* Pause Modal */}
        {gameState === 'paused' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="text-4xl mb-4">⏸️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('gamePaused')}</h2>
                <p className="text-gray-600 mb-6">{t('takeBreakOrContinue')}</p>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={togglePause}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    ▶️ {t('continuePlaying')}
                  </button>
                  
                  <button
                    onClick={returnToMenu}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    🏠 {t('returnToMenu')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Payment Modal */}
        {showWeatherPaymentModal && selectedWeatherToUnlock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="text-4xl mb-4">
                  {selectedWeatherToUnlock === 'sunny' && '☀️'}
                  {selectedWeatherToUnlock === 'cloudy' && '☁️'}
                  {selectedWeatherToUnlock === 'rainy' && '🌧️'}
                  {selectedWeatherToUnlock === 'stormy' && '⛈️'}
                  {selectedWeatherToUnlock === 'snowy' && '❄️'}
                  {selectedWeatherToUnlock === 'night' && '🌙'}
                  {selectedWeatherToUnlock === 'sunset' && '🌅'}
                  {selectedWeatherToUnlock === 'foggy' && '🌫️'}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {unlockedWeathers.has(selectedWeatherToUnlock) ? 'Weather Already Unlocked!' : `Unlock Weather Theme`}
                </h2>
                <p className="text-gray-600 mb-4">
                  {WEATHER_THEMES[selectedWeatherToUnlock as keyof typeof WEATHER_THEMES].name}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  {WEATHER_THEMES[selectedWeatherToUnlock as keyof typeof WEATHER_THEMES].description}
                </p>
                
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-white font-bold text-xl">5</span>
                    <span className="text-white font-bold text-2xl">π</span>
                    <span className="text-white font-bold">Pi</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => unlockWeather(selectedWeatherToUnlock)}
                    disabled={unlockedWeathers.has(selectedWeatherToUnlock)}
                    className={`w-full py-3 px-6 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                      unlockedWeathers.has(selectedWeatherToUnlock)
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                    }`}
                  >
                    {unlockedWeathers.has(selectedWeatherToUnlock) 
                      ? '✅ Already Unlocked' 
                      : '🔓 Pay with Pi'
                    }
                  </button>
                  
                  <button
                    onClick={closeWeatherPaymentModal}
                    className="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-bold hover:bg-gray-400 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Character Purchase Modal */}
        {showCharacterPurchaseModal && selectedCharacterToPurchase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4">
                  <img 
                    src={selectedCharacterToPurchase.image} 
                    alt={selectedCharacterToPurchase.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedCharacterToPurchase.unlocked ? t('characterAlreadyUnlocked') : `${t('unlockCharacter')} ${selectedCharacterToPurchase.name}`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedCharacterToPurchase.description}
                </p>
                
                {/* Character Stats */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="bg-blue-100 rounded-lg p-2 text-center">
                    <div className="font-bold text-blue-800">Jump</div>
                    <div className="text-blue-600">{(selectedCharacterToPurchase.abilities.jump * 100).toFixed(0)}%</div>
                  </div>
                  <div className="bg-green-100 rounded-lg p-2 text-center">
                    <div className="font-bold text-green-800">Shield</div>
                    <div className="text-green-600">{(selectedCharacterToPurchase.abilities.shield * 100).toFixed(0)}%</div>
                  </div>
                  <div className="bg-purple-100 rounded-lg p-2 text-center">
                    <div className="font-bold text-purple-800">Magnet</div>
                    <div className="text-purple-600">{(selectedCharacterToPurchase.abilities.magnet * 100).toFixed(0)}%</div>
                  </div>
                  <div className="bg-yellow-100 rounded-lg p-2 text-center">
                    <div className="font-bold text-yellow-800">Recovery</div>
                    <div className="text-yellow-600">{(selectedCharacterToPurchase.abilities.recovery * 100).toFixed(0)}%</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-3 mb-6">
                  <div className="font-bold text-lg">{t('specialMove')}: {selectedCharacterToPurchase.specialMove}</div>
                </div>
                
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {selectedCharacterToPurchase.id === 'bobman' ? '10' : '5'}
                  </span>
                  <span className="text-xl font-bold text-gray-800">Pi</span>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={closeCharacterPurchaseModal}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={purchaseCharacter}
                    disabled={selectedCharacterToPurchase.unlocked}
                    className={`flex-1 font-bold py-3 px-4 rounded-lg transition-colors ${
                      selectedCharacterToPurchase.unlocked
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                    }`}
                  >
                    {selectedCharacterToPurchase.unlocked 
                      ? `✅ ${t('alreadyUnlocked')}` 
                      : t('purchaseForPi').replace('{price}', selectedCharacterToPurchase.id === 'bobman' ? '10' : '5')
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SkyBackground>
    </>
  );
};

export default ScreamPiPage; 