import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../hooks/use-toast';
import { useSettings } from '../../hooks/useSettings';
// import { useGlobalMusic } from '../../hooks/useGlobalMusic'; // DISABLED: No background music in game mode
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { getDisplayUsername } from '../../utils/usernameUtils';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { ResponsiveGameContainer, ResponsiveGameArea } from './ResponsiveGrid';
import DinoPiReviveModal from '../DinoPiReviveModalNew';
import DinoPiGameOverModal from './DinoPiGameOverModal';
import DinoPiAdFreeModal from '../DinoPiAdFreeModalNew';
import DinoPiShareScoreModal from '../DinoPiShareScoreModal';
import Background from './Background';
import Ground from './Ground';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Target, 
  Clock,
  Users,
  Crown,
  Zap,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  Coins,
  Star,
  Shield,
  Zap as ZapIcon,
  Gift,
  Settings,
  Volume2,
  VolumeX,
  Flame,
  Mountain,
  TreePine,
  Gem,
  Home
} from 'lucide-react';

// Game constants - matching Flappy Pi format
const GAME_WIDTH = 480;
const GAME_HEIGHT = 800;
const DINO_WIDTH = 128;
const DINO_HEIGHT = 128;
const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const COIN_SIZE = 48;
const GROUND_Y = GAME_HEIGHT - 120;

// Emoji obstacles from splash screen (slower speeds for easier gameplay)
const EMOJI_OBSTACLES = [
  { emoji: '🌋', name: 'volcano', width: 60, height: 80, speed: 1.2 },
  { emoji: '⛰️', name: 'mountain', width: 70, height: 90, speed: 1.5 },
  { emoji: '🌲', name: 'tree', width: 50, height: 70, speed: 1.0 },
  { emoji: '🪨', name: 'rock', width: 40, height: 50, speed: 1.8 },
  { emoji: '🕳️', name: 'cave', width: 80, height: 60, speed: 0.8 }
];

// Dinosaur character images
const DINO_IMAGES = {
  dino_0: new Image(),
  dino_1: new Image(),
  dino_2: new Image(),
  dino_3: new Image()
};

// Load dinosaur images
DINO_IMAGES.dino_0.src = '/dino pi/dino_0.png';
DINO_IMAGES.dino_1.src = '/dino pi/dino_1.png';
DINO_IMAGES.dino_2.src = '/dino pi/dino_2.png';
DINO_IMAGES.dino_3.src = '/dino pi/dino_3.png';
// No obstacles needed - dinosaur runs on ground

const getRandomCoinY = () => Math.floor(Math.random() * (GAME_HEIGHT - 200)) + 80;

// Evolution stages
const EVOLUTION_STAGES = [
  {
    id: 'baby',
    name: 'Baby T-Rex',
    icon: '',
    abilities: ['Basic Run', 'Simple Jump'],
    fossils: 0,
    color: 'from-green-400 to-green-600',
    jumpMultiplier: 1.0,
    speedMultiplier: 1.0,
    health: 100
  },
  {
    id: 'teen',
    name: 'Teen T-Rex',
    icon: '',
    abilities: ['Double Jump', 'Speed Boost'],
    fossils: 50,
    color: 'from-blue-400 to-blue-600',
    jumpMultiplier: 1.2,
    speedMultiplier: 1.1,
    health: 120
  },
  {
    id: 'adult',
    name: 'Adult T-Rex',
    icon: '',
    abilities: ['Triple Jump', 'Charge Attack', 'Shield'],
    fossils: 150,
    color: 'from-purple-400 to-purple-600',
    jumpMultiplier: 1.4,
    speedMultiplier: 1.2,
    health: 150
  },
  {
    id: 'alpha',
    name: 'Alpha T-Rex',
    icon: '',
    abilities: ['Flight', 'Sonic Roar', 'Invincibility'],
    fossils: 300,
    color: 'from-orange-400 to-orange-600',
    jumpMultiplier: 1.6,
    speedMultiplier: 1.3,
    health: 200
  },
  {
    id: 'elder',
    name: 'Elder T-Rex',
    icon: '',
    abilities: ['Time Warp', 'Meteor Summon', 'Regeneration'],
    fossils: 500,
    color: 'from-red-400 to-red-600',
    jumpMultiplier: 2.0,
    speedMultiplier: 1.5,
    health: 300
  }
];

// No obstacles needed - dinosaur runs on ground

// Game objects interfaces
interface Dino {
  x: number;
  y: number;
  velocityY: number;
  isJumping: boolean;
  isDoubleJumping: boolean;
  isTripleJumping: boolean;
  health: number;
  maxHealth: number;
  invincible: boolean;
  invincibleTimer: number;
  animationFrame: number;
  animationTimer: number;
  evolutionStage: number;
  fossils: number;
  score: number;
  distance: number;
  comboCount: number;
  lastJumpTime: number;
  consecutiveJumps: number;
}

// No obstacles needed - dinosaur runs on ground

interface Collectible {
  id: string;
  x: number;
  y: number;
  type: 'bone' | 'fossil' | 'coin' | 'powerup';
  value: number;
  width: number;
  height: number;
}

interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  color: string;
  type?: 'jump' | 'ripple' | 'dust';
  size?: number;
}

interface PowerUp {
  id: string;
  type: 'shield' | 'magnet' | 'multiplier' | 'invincible';
  duration: number;
  active: boolean;
  timer: number;
}

// Game state
// Emoji obstacle interface
interface EmojiObstacle {
  id: string;
  emoji: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  passed: boolean;
}

interface GameState {
  dino: Dino;
  collectibles: Collectible[];
  particles: Particle[];
  powerUps: PowerUp[];
  emojiObstacles: EmojiObstacle[];
  gameStarted: boolean;
  gamePaused: boolean;
  gameOver: boolean;
  score: number;
  highScore: number;
  fossils: number;
  distance: number;
  level: number;
  environment: 'jungle' | 'volcano' | 'desert' | 'ice';
  weather: 'sunny' | 'rainy' | 'stormy' | 'snowy';
  fps: number;
  frameCount: number;
  lastFpsUpdate: number;
}

// No obstacles needed - dinosaur runs on ground

interface DinoPiGameModeProps {
  mode: 'classic' | 'endless' | 'challenge';
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const DinoPiGameMode: React.FC<DinoPiGameModeProps> = ({
  mode,
  musicEnabled,
  setMusicEnabled,
  soundEnabled,
  setSoundEnabled
}) => {
  // World themes with their unique characteristics
  const worldThemes = {
    jungle: {
      name: '🌴 Jungle World',
      description: 'Lush prehistoric forests with towering trees and ancient ruins',
      features: ['Dense vegetation', 'Hidden treasures', 'Vine swinging'],
      scene: 'garden',
      ground: 'grass',
      weather: ['sunny', 'rainy', 'stormy', 'spring', 'windy']
    },
    desert: {
      name: '🏜️ Desert World', 
      description: 'Vast desert landscapes with mysterious pyramids and sandstorms',
      features: ['Sand surfing', 'Pyramid exploration', 'Oasis discovery'],
      scene: 'desert',
      ground: 'dessert',
      weather: ['sunny', 'sandstorm', 'hot', 'summer', 'windy']
    },
    cave: {
      name: '🕳️ Cave World',
      description: 'Dark caverns filled with crystals and underground rivers',
      features: ['Crystal mining', 'Underground rivers', 'Ancient artifacts'],
      scene: 'storm',
      ground: 'rock',
      weather: ['dark', 'dripping', 'echo']
    },
    volcanic: {
      name: '🌋 Volcanic World',
      description: 'Fiery landscapes with lava flows and volcanic eruptions',
      features: ['Lava surfing', 'Volcanic eruptions', 'Fire resistance'],
      scene: 'lava',
      ground: 'lava',
      weather: ['eruption', 'smoke', 'fire']
    },
    ice: {
      name: '❄️ Ice World',
      description: 'Frozen tundras and icy caves where survival depends on warmth',
      features: ['Glacier climbing', 'Frozen fossil discovery', 'Ice sledding with prehistoric beasts'],
      scene: 'snow',
      ground: 'ice',
      weather: ['snow', 'blizzard', 'freezing', 'winter', 'thunder']
    },
    ocean: {
      name: '🌊 Ocean World',
      description: 'A vast underwater realm filled with ancient sea creatures',
      features: ['Underwater ruins', 'Swimming with giant marine reptiles', 'Treasure hunting in shipwrecks'],
      scene: 'beach',
      ground: 'land',
      weather: ['waves', 'storm', 'tide']
    },
    mountain: {
      name: '⛰️ Mountain World',
      description: 'Towering peaks and rocky cliffs overlooking valleys below',
      features: ['Cliff climbing', 'Eagle nest exploration', 'Hidden shrines in the peaks'],
      scene: 'storm',
      ground: 'rock',
      weather: ['windy', 'stormy', 'foggy', 'autumn', 'thunder']
    },
    sky: {
      name: '🌌 Sky World',
      description: 'Floating islands above the clouds, home to flying reptiles',
      features: ['Riding pterodactyls', 'Island hopping', 'Sky temples'],
      scene: 'rainbow',
      ground: 'land',
      weather: ['cloudy', 'windy', 'clear']
    },
    savanna: {
      name: '🪨 Savanna World',
      description: 'Expansive grasslands filled with herds of massive creatures',
      features: ['Hunting grounds', 'Migration trails', 'Hidden caves under the plains'],
      scene: 'sunny',
      ground: 'grass',
      weather: ['sunny', 'dusty', 'hot']
    },
    swamp: {
      name: '🌀 Swamp World',
      description: 'Mysterious marshes and foggy wetlands crawling with life',
      features: ['Quickmud challenges', 'Giant insect encounters', 'Lost relics in the bog'],
      scene: 'rainy',
      ground: 'land',
      weather: ['foggy', 'rainy', 'humid']
    }
  };

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
  const navigate = useNavigate();
  const { balance, addCoins, spendCoins } = useWallet();
  const { isAuthenticated } = useAuth();
  const { profile } = useUserProfile();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { toast } = useToast();
  // DISABLED: No background music in game mode to prevent audio conflicts
  // const { playMusic, stopMusic } = useGlobalMusic(musicEnabled); // Removed to prevent background music in game
  const { playSwoosh, playSound } = useSoundEffects();
  
  // Scene state for dynamic ground - starts with jungle
  const [currentScene, setCurrentScene] = useState<string>('garden'); // Jungle scene
  const [currentWorld, setCurrentWorld] = useState<string>('jungle'); // Start with jungle
  const [currentWeather, setCurrentWeather] = useState<string>('sunny'); // Start with sunny weather
  
  // Level-based world progression - moved after gameState initialization
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    dino: {
      x: 50,
      y: GROUND_Y - DINO_HEIGHT, // Position on ground
      velocityY: 0,
      isJumping: false,
      isDoubleJumping: false,
      isTripleJumping: false,
      health: 100,
      maxHealth: 100,
      invincible: false,
      invincibleTimer: 0,
      animationFrame: 0,
      animationTimer: 0,
      evolutionStage: 0,
      fossils: 0,
      score: 0,
      distance: 0,
      comboCount: 0,
      lastJumpTime: 0,
      consecutiveJumps: 0
    },
    collectibles: [],
    particles: [],
    powerUps: [],
    emojiObstacles: [],
    gameStarted: false,
    gamePaused: false,
    gameOver: false,
    score: 0,
    highScore: parseInt(localStorage.getItem('dino-pi-high-score') || '0'),
    fossils: 0,
    distance: 0,
    level: 1,
    environment: 'jungle',
    weather: 'sunny',
    fps: 60,
    frameCount: 0,
    lastFpsUpdate: 0
  });

  // Level-based world progression function
  const getWorldForLevel = (level: number) => {
    if (level <= 2) return 'jungle';
    if (level <= 4) return 'desert';
    if (level <= 6) return 'cave';
    if (level <= 8) return 'volcanic';
    if (level <= 10) return 'ice';
    if (level <= 12) return 'ocean';
    if (level <= 14) return 'mountain';
    if (level <= 16) return 'sky';
    if (level <= 18) return 'savanna';
    return 'swamp'; // Level 19+
  };

  // Update world based on level progression
  useEffect(() => {
    const newWorld = getWorldForLevel(gameState.level);
    if (newWorld !== currentWorld) {
      setCurrentWorld(newWorld);
      setCurrentScene(worldThemes[newWorld]?.scene || 'garden');
      
      // Set initial weather for new world
      const worldWeather = worldThemes[newWorld]?.weather || ['sunny'];
      const randomWeather = worldWeather[Math.floor(Math.random() * worldWeather.length)];
      setCurrentWeather(randomWeather);
      
      // Show world change notification
      toast({
        title: "🌍 World Changed!",
        description: `Welcome to ${worldThemes[newWorld]?.name}!`,
        duration: 3000,
      });
    }
  }, [gameState.level, currentWorld]);

  // Weather change every 30 seconds
  useEffect(() => {
    const weatherInterval = setInterval(() => {
      const worldWeather = worldThemes[currentWorld]?.weather || ['sunny'];
      const randomWeather = worldWeather[Math.floor(Math.random() * worldWeather.length)];
      setCurrentWeather(randomWeather);
    }, 30000); // Change every 30 seconds
    
    return () => clearInterval(weatherInterval);
  }, [currentWorld]);

  // UI state
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showReviveModal, setShowReviveModal] = useState(false);
  const [showAdFreeModal, setShowAdFreeModal] = useState(false);
  const [showShareScoreModal, setShowShareScoreModal] = useState(false);
  const [reviveUsed, setReviveUsed] = useState(false);
  const [extraLives, setExtraLives] = useState(0);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Initialize game
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
      }
    }
  }, []);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!animationRef.current) return;
    
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    updateGame(deltaTime);
    renderGame();
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Always render dinosaur - separate render loop
  useEffect(() => {
    const renderLoop = () => {
      renderGame();
      animationRef.current = requestAnimationFrame(renderLoop);
    };
    
    animationRef.current = requestAnimationFrame(renderLoop);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Game update loop (only when game is started)
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gamePaused && !gameState.gameOver) {
      const gameUpdateLoop = () => {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTimeRef.current;
        lastTimeRef.current = currentTime;
        
        updateGame(deltaTime);
        
        animationRef.current = requestAnimationFrame(gameUpdateLoop);
      };
      
      animationRef.current = requestAnimationFrame(gameUpdateLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gamePaused, gameState.gameOver]);

  // Update game logic
  const updateGame = (deltaTime: number) => {
    setGameState(prev => {
      if (prev.gameOver || prev.gamePaused) return prev;

      // Update dino
      const dino = { ...prev.dino };
      
      // Apply gravity
      dino.velocityY += GRAVITY;
      dino.y += dino.velocityY;

      // Ground collision - land on ground instead of game over
      if (dino.y >= GROUND_Y - DINO_HEIGHT) {
        dino.y = GROUND_Y - DINO_HEIGHT;
        dino.velocityY = 0;
        dino.isJumping = false;
        dino.isDoubleJumping = false;
        dino.isTripleJumping = false;
      }

      // Ceiling collision - prevent going too high but don't end game
      if (dino.y <= 0) {
        dino.y = 0;
        dino.velocityY = 0;
        // Don't end game for ceiling hits in ground-based game
      }

      // Update animation
      dino.animationTimer += deltaTime;
      if (dino.animationTimer > 100) {
        dino.animationFrame = (dino.animationFrame + 1) % 4;
        dino.animationTimer = 0;
      }

      // Update invincibility
      if (dino.invincible) {
        dino.invincibleTimer -= deltaTime;
        if (dino.invincibleTimer <= 0) {
          dino.invincible = false;
        }
      }

      // Update emoji obstacles
      let newObstacles = [...prev.emojiObstacles];
      
      // Move obstacles from right to left
      newObstacles = newObstacles.map(obstacle => ({
        ...obstacle,
        x: obstacle.x - obstacle.speed
      })).filter(obstacle => obstacle.x + obstacle.width > 0);
      
      // Generate new obstacles (increased spawn rate for better gameplay)
      if (Math.random() < 0.01) { // 1% chance per frame for more obstacles
        const obstacleType = EMOJI_OBSTACLES[Math.floor(Math.random() * EMOJI_OBSTACLES.length)];
        const newObstacle = {
          id: `obstacle_${Date.now()}_${Math.random()}`,
          emoji: obstacleType.emoji,
          name: obstacleType.name,
          x: GAME_WIDTH,
          y: GROUND_Y - obstacleType.height,
          width: obstacleType.width,
          height: obstacleType.height,
          speed: obstacleType.speed,
          passed: false
        };
        newObstacles.push(newObstacle);
        console.log('🪨 New obstacle spawned:', newObstacle.emoji, 'at', newObstacle.x, newObstacle.y);
      }
      
      // Check collision with obstacles (with padding for easier gameplay)
      for (const obstacle of newObstacles) {
        // Add padding to collision detection to make it more forgiving
        const padding = 20;
        const dinoLeft = dino.x + padding;
        const dinoRight = dino.x + DINO_WIDTH - padding;
        const dinoTop = dino.y + padding;
        const dinoBottom = dino.y + DINO_HEIGHT - padding;
        
        if (!obstacle.passed && 
            obstacle.x < dinoRight && 
            obstacle.x + obstacle.width > dinoLeft &&
            obstacle.y < dinoBottom && 
            obstacle.y + obstacle.height > dinoTop) {
          // Collision detected - game over
          return { ...prev, gameOver: true };
        }
        
        // Mark obstacle as passed for scoring
        if (!obstacle.passed && obstacle.x + obstacle.width < dino.x) {
          obstacle.passed = true;
        }
      }

      // Update collectibles - no movement needed
      const collectibles = prev.collectibles;

      // Update particles
      const particles = prev.particles.map(particle => ({
        ...particle,
        x: particle.x + particle.velocityX,
        y: particle.y + particle.velocityY,
        life: particle.life - deltaTime
      })).filter(particle => particle.life > 0);

      // Update power-ups
      const powerUps = prev.powerUps.map(powerUp => ({
        ...powerUp,
        timer: powerUp.timer - deltaTime
      })).filter(powerUp => powerUp.timer > 0);

      // No obstacles needed - dinosaur runs on ground

      // Spawn collectibles
      const newCollectibles = [...collectibles];
      if (Math.random() < 0.01) {
        const collectibleTypes = ['bone', 'fossil', 'coin', 'powerup'];
        const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
        newCollectibles.push({
          id: `collectible-${Date.now()}`,
          x: GAME_WIDTH,
          y: Math.random() * (GROUND_Y - 100) + 50,
          type: type as 'bone' | 'fossil' | 'coin' | 'powerup',
          value: type === 'bone' ? 1 : type === 'fossil' ? 10 : type === 'coin' ? 5 : 1,
          width: 20,
          height: 20
        });
      }

      // Check collisions
      let newScore = prev.score;
      let newFossils = prev.fossils;
      let newParticles = [...particles];
      
      // Add dust particles when dinosaur is on ground and moving
      if (dino.y >= GROUND_Y - DINO_HEIGHT - 5 && Math.random() < 0.3) {
        newParticles.push({
          x: dino.x + Math.random() * DINO_WIDTH,
          y: GROUND_Y - 5,
          velocityX: -2 - Math.random() * 2,
          velocityY: -1 - Math.random() * 2,
          life: 30,
          maxLife: 30,
          color: '#8B4513',
          type: 'dust' as const,
          size: 2
        });
      }

      // No obstacle collisions - dinosaur runs on ground

      // Collectible collisions
      for (const collectible of newCollectibles) {
        if (collectible.x < dino.x + DINO_WIDTH && collectible.x + collectible.width > dino.x &&
            collectible.y < dino.y + DINO_HEIGHT && collectible.y + collectible.height > dino.y) {
          if (collectible.type === 'bone') {
            newFossils += collectible.value;
            newScore += collectible.value * 2;
          } else if (collectible.type === 'fossil') {
            newFossils += collectible.value;
            newScore += collectible.value * 10;
          } else if (collectible.type === 'coin') {
            newScore += collectible.value * 5;
          } else if (collectible.type === 'powerup') {
            // Add power-up effect
            newParticles.push({
              x: collectible.x,
              y: collectible.y,
              velocityX: 0,
              velocityY: -5,
              life: 500,
              maxLife: 500,
              color: '#4ade80'
            });
          }
          
          // Remove collected item
          const index = newCollectibles.indexOf(collectible);
          newCollectibles.splice(index, 1);
        }
      }

      // Update distance
      const newDistance = prev.distance + 1; // Simple distance increment

      // Update level based on distance
      const newLevel = Math.floor(newDistance / 1000) + 1;

      // Update environment based on level
      let newEnvironment = prev.environment;
      if (newLevel <= 2) newEnvironment = 'jungle';
      else if (newLevel <= 4) newEnvironment = 'volcano';
      else if (newLevel <= 6) newEnvironment = 'desert';
      else newEnvironment = 'ice';

      return {
        ...prev,
        dino,
        collectibles,
        emojiObstacles: newObstacles,
        particles,
        powerUps,
        score: newScore,
        fossils: newFossils,
        distance: newDistance,
        level: newLevel,
        environment: newEnvironment
      };
    });
  };

  // Render game
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw Flappy Pi Classic background (morning theme)
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#aeefff'); // Light blue sky
    gradient.addColorStop(1, '#fffbe0'); // Light yellow ground
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw a test rectangle to ensure canvas is working
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(10, 10, 50, 50);
    console.log('🎨 Canvas test rectangle drawn at (10, 10)');
    
    // Draw a large test rectangle where the dinosaur should be
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.fillRect(50, GROUND_Y - DINO_HEIGHT, DINO_WIDTH, DINO_HEIGHT);
    console.log('🦕 Test dinosaur rectangle at (50,', GROUND_Y - DINO_HEIGHT, ')');
    
    // Draw ground line
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(GAME_WIDTH, GROUND_Y);
    ctx.stroke();
    console.log('🌍 Ground line drawn at y:', GROUND_Y);

    // No ground rendering in canvas - handled by Ground component

    // Draw emoji obstacles with better visibility
    console.log('🪨 Rendering obstacles:', gameState.emojiObstacles.length);
    gameState.emojiObstacles.forEach((obstacle, index) => {
      console.log(`🪨 Obstacle ${index}:`, obstacle.emoji, 'at', obstacle.x, obstacle.y, 'size', obstacle.width, 'x', obstacle.height);
      
      // Draw background rectangle for better visibility
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Draw border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 3;
      ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Draw emoji
      ctx.font = `${obstacle.height}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000';
      ctx.fillText(obstacle.emoji, obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
    });

    // Draw collectibles (if any)
    gameState.collectibles.forEach(collectible => {
      if (collectible.type === 'bone') {
        // Draw bone emoji
        ctx.font = `${collectible.height}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🦴', collectible.x + collectible.width / 2, collectible.y + collectible.height / 2);
      } else {
        // Draw other collectibles as colored rectangles
        ctx.fillStyle = collectible.type === 'fossil' ? '#8b5cf6' : 
                       collectible.type === 'coin' ? '#fbbf24' : '#4ade80';
        ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
      }
    });

    // Draw particles with enhanced effects
    gameState.particles.forEach(particle => {
      ctx.fillStyle = particle.color;
      const size = particle.size || 4;
      
      if (particle.type === 'ripple') {
        // Draw ripple effect as expanding circles
        ctx.globalAlpha = particle.life / particle.maxLife;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * (1 - particle.life / particle.maxLife) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (particle.type === 'dust') {
        // Draw dust particles as small circles
        ctx.globalAlpha = particle.life / particle.maxLife;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        // Default jump particles
        ctx.globalAlpha = particle.life / particle.maxLife;
        ctx.fillRect(particle.x, particle.y, size, size);
        ctx.globalAlpha = 1;
      }
    });

    // Draw dinosaur with enhanced effects - ALWAYS VISIBLE
    const dino = gameState.dino;
    const dinoImage = DINO_IMAGES[`dino_${dino.animationFrame}` as keyof typeof DINO_IMAGES];
    
    console.log(' Drawing dinosaur at:', dino.x, dino.y, 'Frame:', dino.animationFrame, 'GameStarted:', gameState.gameStarted);
    
    // Draw dinosaur shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(dino.x + 2, dino.y + DINO_HEIGHT - 5, DINO_WIDTH, 8);
    
    // Draw dinosaur with invincibility effect
    if (dino.invincible && Math.floor(Date.now() / 100) % 2) {
      // Flashing effect when invincible
      ctx.globalAlpha = 0.5;
    }
    
    // Add enhanced bounce animation when jumping
    let bounceOffset = 0;
    let scaleEffect = 1;
    
    if (dino.isJumping || dino.isDoubleJumping || dino.isTripleJumping) {
      // Enhanced bounce when jumping
      bounceOffset = Math.sin(Date.now() * 0.02) * 3;
      scaleEffect = 1.1; // Slightly larger when jumping
    } else if (dino.y >= GROUND_Y - DINO_HEIGHT - 5) {
      // Subtle bounce when on ground
      bounceOffset = Math.sin(Date.now() * 0.01) * 2;
    }
    
    // Add click feedback effect
    if (dino.consecutiveJumps > 0) {
      // Scale up slightly when jumping for visual feedback
      scaleEffect = 1.05 + (dino.consecutiveJumps * 0.02);
    }
    
    // Always draw dinosaur - simplified rendering
    console.log('🦕 Rendering dinosaur at:', dino.x, dino.y, 'Scale:', scaleEffect, 'Bounce:', bounceOffset);
    console.log('🦕 GROUND_Y:', GROUND_Y, 'DINO_HEIGHT:', DINO_HEIGHT);
    
    // Ensure dinosaur is positioned correctly on ground
    const dinoY = Math.min(dino.y, GROUND_Y - DINO_HEIGHT);
    console.log('🦕 Final dino position:', dino.x, dinoY);
    
    // Draw dinosaur shadow first
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(dino.x + 3, dinoY + DINO_HEIGHT - 3, DINO_WIDTH, 6);
    
    // Draw dinosaur body - bright green to ensure visibility
    ctx.fillStyle = '#00ff00'; // Bright green
    ctx.fillRect(dino.x, dinoY + bounceOffset, DINO_WIDTH, DINO_HEIGHT);
    
    // Add some details to the dinosaur
    ctx.fillStyle = '#00cc00'; // Darker green
    ctx.fillRect(dino.x + 10, dinoY + 10 + bounceOffset, DINO_WIDTH - 20, DINO_HEIGHT - 20);
    
    // Draw eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(dino.x + 30, dinoY + 30 + bounceOffset, 8, 8);
    ctx.fillRect(dino.x + 70, dinoY + 30 + bounceOffset, 8, 8);
    
    // Draw mouth
    ctx.fillStyle = '#000';
    ctx.fillRect(dino.x + 40, dinoY + 70 + bounceOffset, 40, 8);
    
    // Draw spikes
    ctx.fillStyle = '#ff6b35';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(dino.x + 20 + i * 20, dinoY + 10 + bounceOffset, 16, 24);
    }
    
    // Draw a thick border to make it more visible
    ctx.strokeStyle = '#ff0000'; // Red border for visibility
    ctx.lineWidth = 4;
    ctx.strokeRect(dino.x, dinoY + bounceOffset, DINO_WIDTH, DINO_HEIGHT);
    
    // Reset alpha
    ctx.globalAlpha = 1;

    // Draw weather effects
    drawWeatherEffects(ctx);

    // No UI elements in canvas - handled by React components
  };

  // Enhanced Weather effects rendering with seasonal weather
  const drawWeatherEffects = (ctx: CanvasRenderingContext2D) => {
    const time = Date.now() * 0.001;
    
    switch (currentWeather) {
      case 'rainy':
      case 'heavy-rain':
        // Enhanced rain with different intensities
        const rainIntensity = currentWeather === 'heavy-rain' ? 80 : 50;
        const rainSpeed = currentWeather === 'heavy-rain' ? 300 : 200;
        for (let i = 0; i < rainIntensity; i++) {
          const x = (i * 20 + time * 100) % GAME_WIDTH;
          const y = (time * rainSpeed + i * 10) % GAME_HEIGHT;
          ctx.strokeStyle = currentWeather === 'heavy-rain' ? 'rgba(100, 149, 237, 0.8)' : 'rgba(173, 216, 230, 0.6)';
          ctx.lineWidth = currentWeather === 'heavy-rain' ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 2, y + 10);
          ctx.stroke();
        }
        break;
        
      case 'stormy':
        // Draw lightning flashes
        if (Math.random() < 0.1) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        }
        // Draw heavy rain
        for (let i = 0; i < 80; i++) {
          const x = (i * 15 + time * 150) % GAME_WIDTH;
          const y = (time * 300 + i * 8) % GAME_HEIGHT;
          ctx.strokeStyle = 'rgba(100, 149, 237, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 3, y + 15);
          ctx.stroke();
        }
        break;
        
      case 'snow':
      case 'blizzard':
        // Enhanced snow with different intensities
        const snowIntensity = currentWeather === 'blizzard' ? 60 : 30;
        const snowSpeed = currentWeather === 'blizzard' ? 200 : 100;
        for (let i = 0; i < snowIntensity; i++) {
          const x = (i * 30 + time * 50) % GAME_WIDTH;
          const y = (time * snowSpeed + i * 20) % GAME_HEIGHT;
          const size = currentWeather === 'blizzard' ? 3 : 2;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'sandstorm':
        // Draw sand particles
        for (let i = 0; i < 40; i++) {
          const x = (i * 25 + time * 120) % GAME_WIDTH;
          const y = (time * 150 + i * 12) % GAME_HEIGHT;
          ctx.fillStyle = 'rgba(238, 203, 173, 0.6)';
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'foggy':
        // Draw fog overlay
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        break;
        
      case 'eruption':
        // Draw ash particles
        for (let i = 0; i < 25; i++) {
          const x = (i * 40 + time * 60) % GAME_WIDTH;
          const y = (time * 80 + i * 8) % GAME_HEIGHT;
          ctx.fillStyle = 'rgba(105, 105, 105, 0.7)';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'waves':
        // Draw wave effects
        for (let i = 0; i < 5; i++) {
          const y = GAME_HEIGHT - 100 + Math.sin(time * 2 + i) * 10;
          ctx.strokeStyle = 'rgba(0, 191, 255, 0.5)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(GAME_WIDTH, y);
          ctx.stroke();
        }
        break;
        
      case 'windy':
        // Draw wind particles
        for (let i = 0; i < 20; i++) {
          const x = (i * 50 + time * 100) % GAME_WIDTH;
          const y = (time * 50 + i * 25) % GAME_HEIGHT;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 10, y + 5);
          ctx.stroke();
        }
        break;
        
      // Seasonal Weather Effects
      case 'spring':
        // Gentle rain and butterflies
        for (let i = 0; i < 20; i++) {
          const x = (i * 30 + time * 50) % GAME_WIDTH;
          const y = (time * 100 + i * 15) % GAME_HEIGHT;
          ctx.strokeStyle = 'rgba(173, 216, 230, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 1, y + 8);
          ctx.stroke();
        }
        // Butterflies
        for (let i = 0; i < 5; i++) {
          const x = (i * 100 + time * 30) % GAME_WIDTH;
          const y = (time * 20 + i * 50) % GAME_HEIGHT;
          ctx.fillStyle = 'rgba(255, 182, 193, 0.7)';
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'summer':
        // Heat waves and sunshine
        ctx.fillStyle = 'rgba(255, 255, 0, 0.1)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        // Heat distortion effect
        for (let i = 0; i < 10; i++) {
          const x = (i * 50 + time * 20) % GAME_WIDTH;
          const y = (time * 10 + i * 30) % GAME_HEIGHT;
          ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 20, y + Math.sin(time + i) * 5);
          ctx.stroke();
        }
        break;
        
      case 'autumn':
        // Falling leaves
        for (let i = 0; i < 15; i++) {
          const x = (i * 40 + time * 30) % GAME_WIDTH;
          const y = (time * 80 + i * 25) % GAME_HEIGHT;
          ctx.fillStyle = i % 3 === 0 ? 'rgba(255, 165, 0, 0.8)' : 
                         i % 3 === 1 ? 'rgba(255, 69, 0, 0.8)' : 'rgba(139, 69, 19, 0.8)';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'winter':
        // Enhanced snow with ice crystals
        for (let i = 0; i < 40; i++) {
          const x = (i * 25 + time * 60) % GAME_WIDTH;
          const y = (time * 120 + i * 18) % GAME_HEIGHT;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        // Ice crystals
        for (let i = 0; i < 8; i++) {
          const x = (i * 60 + time * 40) % GAME_WIDTH;
          const y = (time * 60 + i * 40) % GAME_HEIGHT;
          ctx.fillStyle = 'rgba(173, 216, 230, 0.8)';
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'thunder':
        // Lightning and thunder effects
        if (Math.random() < 0.15) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        }
        // Dark clouds
        ctx.fillStyle = 'rgba(105, 105, 105, 0.3)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT / 2);
        break;
        
      case 'fog':
        // Fog overlay
        ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        break;
        
      case 'hot':
        // Heat shimmer effect
        for (let i = 0; i < 15; i++) {
          const x = (i * 35 + time * 25) % GAME_WIDTH;
          const y = (time * 15 + i * 35) % GAME_HEIGHT;
          ctx.strokeStyle = 'rgba(255, 100, 0, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 15, y + Math.sin(time + i) * 3);
          ctx.stroke();
        }
        break;
    }
  };

  // Game controls
  const handleJump = () => {
    console.log('🦕 Dino jump triggered!', { 
      gameStarted: gameState.gameStarted, 
      gameOver: gameState.gameOver, 
      gamePaused: gameState.gamePaused 
    });
    
    if (!gameState.gameStarted) {
      startGame();
      return;
    }
    
    if (gameState.gameOver || gameState.gamePaused) return;
    
    const dino = gameState.dino;
    const evolutionStage = EVOLUTION_STAGES[dino.evolutionStage];
    
    // Create new particles array
    const newParticles = [...gameState.particles];
    
    // Check for multiple jumps based on evolution stage
    if (!dino.isJumping) {
      console.log('🦕 Single jump!');
      setGameState(prev => ({
        ...prev,
        dino: {
          ...prev.dino,
          velocityY: JUMP_FORCE * evolutionStage.jumpMultiplier,
          isJumping: true,
          consecutiveJumps: 1
        },
        particles: [
          ...prev.particles,
          // Add jump particles
          ...Array.from({ length: 5 }, () => ({
            x: dino.x + Math.random() * DINO_WIDTH,
            y: dino.y + DINO_HEIGHT,
            velocityX: -3 + Math.random() * 6,
            velocityY: -2 - Math.random() * 3,
            life: 20,
            maxLife: 20,
            color: '#FFD700',
            type: 'jump' as const,
            size: 3
          })),
          // Add click ripple effect
          ...Array.from({ length: 8 }, (_, i) => ({
            x: dino.x + DINO_WIDTH / 2,
            y: dino.y + DINO_HEIGHT / 2,
            velocityX: Math.cos((i / 8) * Math.PI * 2) * 2,
            velocityY: Math.sin((i / 8) * Math.PI * 2) * 2,
            life: 30,
            maxLife: 30,
            color: '#4ade80',
            type: 'ripple' as const,
            size: 4
          }))
        ]
      }));
    } else if (dino.evolutionStage >= 1 && !dino.isDoubleJumping) {
      console.log('🦕 Double jump!');
      setGameState(prev => ({
        ...prev,
        dino: {
          ...prev.dino,
          velocityY: JUMP_FORCE * evolutionStage.jumpMultiplier * 0.8,
          isDoubleJumping: true,
          consecutiveJumps: 2
        },
        particles: [
          ...prev.particles,
          // Add double jump particles
          ...Array.from({ length: 8 }, () => ({
            x: dino.x + Math.random() * DINO_WIDTH,
            y: dino.y + DINO_HEIGHT,
            velocityX: -4 + Math.random() * 8,
            velocityY: -3 - Math.random() * 4,
            life: 25,
            maxLife: 25,
            color: '#FF6B35'
          }))
        ]
      }));
    } else if (dino.evolutionStage >= 2 && !dino.isTripleJumping) {
      console.log('🦕 Triple jump!');
      setGameState(prev => ({
        ...prev,
        dino: {
          ...prev.dino,
          velocityY: JUMP_FORCE * evolutionStage.jumpMultiplier * 0.6,
          isTripleJumping: true,
          consecutiveJumps: 3
        },
        particles: [
          ...prev.particles,
          // Add triple jump particles
          ...Array.from({ length: 12 }, () => ({
            x: dino.x + Math.random() * DINO_WIDTH,
            y: dino.y + DINO_HEIGHT,
            velocityX: -5 + Math.random() * 10,
            velocityY: -4 - Math.random() * 5,
            life: 30,
            maxLife: 30,
            color: '#8B5CF6'
          }))
        ]
      }));
    }
    
    playSound('click');
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      score: 0,
      fossils: 0,
      distance: 0,
      level: 1,
      environment: 'jungle',
      dino: {
        ...prev.dino,
        y: GAME_HEIGHT / 2 - DINO_HEIGHT / 2,
        velocityY: 0,
        isJumping: false,
        isDoubleJumping: false,
        isTripleJumping: false,
        health: 100,
        invincible: false,
        invincibleTimer: 0
      },
      obstacles: [],
      collectibles: [],
      particles: []
    }));
    
    // DISABLED: No background music in game mode
    // if (musicEnabled) {
    //   playMusic('dino-pi-theme');
    // }
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, gamePaused: true }));
    setShowPauseModal(true);
    // DISABLED: No background music in game mode
    // if (musicEnabled) {
    //   stopMusic();
    // }
  };

  const resumeGame = () => {
    setGameState(prev => ({ ...prev, gamePaused: false }));
    setShowPauseModal(false);
    // DISABLED: No background music in game mode
    // if (musicEnabled) {
    //   playMusic('dino-pi-theme');
    // }
  };

  const restartGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: false,
      gamePaused: false,
      gameOver: false,
      score: 0,
      fossils: 0,
      distance: 0,
      level: 1,
      environment: 'jungle',
      dino: {
        ...prev.dino,
        y: GAME_HEIGHT / 2 - DINO_HEIGHT / 2,
        velocityY: 0,
        isJumping: false,
        isDoubleJumping: false,
        isTripleJumping: false,
        health: 100,
        invincible: false,
        invincibleTimer: 0
      },
      obstacles: [],
      collectibles: [],
      particles: []
    }));
    setShowPauseModal(false);
    setShowGameOverModal(false);
  };

  const handleGameOver = () => {
    if (!reviveUsed) {
      setShowReviveModal(true);
    } else {
      setShowGameOverModal(true);
    }
    if (gameState.score > gameState.highScore) {
      localStorage.setItem('dino-pi-high-score', gameState.score.toString());
    }
    // DISABLED: No background music in game mode
    // if (musicEnabled) {
    //   stopMusic();
    // }
  };

  const handleRevive = (reviveType?: 'coin' | 'ad' | 'premium' | 'extra_life') => {
    setShowReviveModal(false);
    setReviveUsed(true);
    
    // Reset game state for revive
    setGameState(prev => ({
      ...prev,
      gameOver: false,
      gameStarted: true,
      dino: {
        ...prev.dino,
        health: prev.dino.maxHealth,
        invincible: true,
        invincibleTimer: 2000
      }
    }));
    
    // DISABLED: No background music in game mode
    // if (musicEnabled) {
    //   playMusic('dino-pi-theme');
    // }
  };

  const handleReviveDecline = () => {
    setShowReviveModal(false);
    setShowGameOverModal(true);
  };

  const handleUseExtraLife = () => {
    setExtraLives(prev => Math.max(0, prev - 1));
    handleRevive('extra_life');
  };

  // Handle game over
  useEffect(() => {
    if (gameState.gameOver) {
      handleGameOver();
    }
  }, [gameState.gameOver]);

  // Evolution handling
  const handleEvolution = () => {
    const currentStage = gameState.dino.evolutionStage;
    const nextStage = currentStage + 1;
    
    if (nextStage < EVOLUTION_STAGES.length) {
      const requiredFossils = EVOLUTION_STAGES[nextStage].fossils;
      if (gameState.fossils >= requiredFossils) {
        setGameState(prev => ({
          ...prev,
          dino: {
            ...prev.dino,
            evolutionStage: nextStage,
            fossils: prev.fossils - requiredFossils,
            health: EVOLUTION_STAGES[nextStage].health,
            maxHealth: EVOLUTION_STAGES[nextStage].health
          }
        }));
        setShowEvolutionModal(false);
        playSound('success');
        toast({
          title: "Evolution Complete!",
          description: `Your dinosaur evolved to ${EVOLUTION_STAGES[nextStage].name}!`,
        });
      }
    }
  };

  // Check for evolution
  useEffect(() => {
    const currentStage = gameState.dino.evolutionStage;
    const nextStage = currentStage + 1;
    
    if (nextStage < EVOLUTION_STAGES.length) {
      const requiredFossils = EVOLUTION_STAGES[nextStage].fossils;
      if (gameState.fossils >= requiredFossils) {
        setShowEvolutionModal(true);
      }
    }
  }, [gameState.fossils, gameState.dino.evolutionStage]);

  return (
    <>
      <ResponsiveGameContainer>
        <ResponsiveGameArea
          onClick={handleJump}
          onTouchStart={handleJump}
        >
          {/* Game Canvas */}
                <canvas
                  ref={canvasRef}
                  width={GAME_WIDTH}
                  height={GAME_HEIGHT}
                  className="absolute top-0 left-0"
                  onClick={handleJump}
                  onKeyDown={(e) => {
                    if (e.code === 'Space') {
                      e.preventDefault();
                      handleJump();
                    }
                  }}
                  tabIndex={0}
                />
                {/* Dynamic Background */}
                <Background mode="classic" scene={currentScene} />
                {/* Dynamic Ground based on current world */}
                <Ground x={0} scene={worldThemes[currentWorld]?.ground || 'grass'} />
          
          {/* Game UI Overlay */}
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-between p-4 pointer-events-none">

            {/* Score Display - Copied from Flappy Pi */}
            {gameState.gameStarted && (
              <div style={{ 
                position: 'absolute', 
                left: 0, 
                right: 0, 
                top: 20, 
                margin: '0 auto', 
                color: '#fff', 
                fontSize: 48, 
                fontWeight: 'bold', 
                textShadow: '2px 2px 8px #000', 
                zIndex: 10, 
                textAlign: 'center' 
              }}>
                {gameState.score}
              </div>
            )}

            {/* Bone Wallet Display */}
            {gameState.gameStarted && (
              <div style={{ 
                position: 'absolute', 
                top: 20, 
                right: 20, 
                color: '#fff', 
                fontSize: 24, 
                fontWeight: 'bold', 
                textShadow: '2px 2px 4px #000', 
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '8px 12px',
                borderRadius: '20px'
              }}>
                <span style={{ fontSize: '20px' }}>🦴</span>
                <span>{gameState.fossils}</span>
              </div>
            )}

            {/* Debug Info - Remove in production */}
            {gameState.gameStarted && (
              <div style={{ 
                position: 'absolute', 
                top: 20, 
                left: 20, 
                color: '#fff', 
                fontSize: 12, 
                fontWeight: 'bold', 
                textShadow: '1px 1px 2px #000', 
                zIndex: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: '4px 8px',
                borderRadius: '8px'
              }}>
                <div>Dino: ({Math.round(gameState.dino.x)}, {Math.round(gameState.dino.y)})</div>
                <div>Obstacles: {gameState.emojiObstacles.length}</div>
                <div>Jumping: {gameState.dino.isJumping ? 'Yes' : 'No'}</div>
              </div>
            )}

            {/* Dinosaur Character is rendered in canvas - no duplicate needed */}

            {/* Game State Messages - Centered Above */}
            {!gameState.gameStarted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ transform: 'translateY(-10%)' }}>
                <div className="flex items-center justify-center mb-6">
                  <img src="/dino pi/dino_0.png" alt="Dino" className="w-32 h-32 animate-bounce mr-4" />
                  <div className="text-left">
                    <h2 className="text-6xl font-black mb-4" style={{ 
                      color: 'white',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      Dino Pi
                    </h2>
                    <p className="text-xl font-bold mb-2 animate-pulse" style={{ 
                      color: 'white',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      🦕 Tap to Start! 🦕
                    </p>
                    <p className="text-sm" style={{ 
                      color: 'rgba(255,255,255,0.8)',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      Jump over obstacles! Tap anywhere to make the dino jump!
                    </p>
                    <div className="mt-4 text-xs" style={{ 
                      color: 'rgba(255,255,255,0.6)',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      💡 Tip: The dino will respond to your clicks!
                    </div>
                  </div>
                </div>
              </div>
            )}

                   {/* Evolution Stage Display Removed */}
          </div>
        </ResponsiveGameArea>
      </ResponsiveGameContainer>

      {/* Dino Pi Revive Modal */}
      <DinoPiReviveModal
        isVisible={showReviveModal}
        score={gameState.score}
        onRevive={handleRevive}
        onDecline={handleReviveDecline}
        characterImage="/dino pi/dino_0.png"
        extraLives={extraLives}
        onUseExtraLife={handleUseExtraLife}
      />

      {/* Dino Pi Game Over Modal */}
      <DinoPiGameOverModal
        isVisible={showGameOverModal}
        score={gameState.score}
        coins={gameState.fossils}
        onRestart={restartGame}
        onShare={() => setShowShareScoreModal(true)}
        onHome={() => navigate('/dino-pi')}
        onRevive={() => {
          setShowGameOverModal(false);
          setShowReviveModal(true);
        }}
        reviveUsed={reviveUsed}
        level={gameState.level}
        bestScore={gameState.highScore}
        extraLives={extraLives}
        onUseExtraLife={handleUseExtraLife}
        characterImage="/dino pi/dino_0.png"
        onSubmitScore={async () => true}
        isPiUser={isAuthenticated}
      />

      {/* Dino Pi Ad-Free Modal */}
      <DinoPiAdFreeModal
        isVisible={showAdFreeModal}
        onClose={() => setShowAdFreeModal(false)}
      />

      {/* Dino Pi Share Score Modal */}
      <DinoPiShareScoreModal
        isOpen={showShareScoreModal}
        onClose={() => setShowShareScoreModal(false)}
        score={gameState.score}
        level={gameState.level}
        coins={gameState.fossils}
        bestScore={gameState.highScore}
        username={getDisplayUsername()}
        characterImageUrl="/dino pi/dino_0.png"
        gameMode="Dino Pi"
      />

      {/* Pause Modal */}
      <Dialog open={showPauseModal} onOpenChange={setShowPauseModal}>
        <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center text-yellow-600">Game Paused</DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Take a break, pioneer!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={resumeGame} className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3">
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
            <Button onClick={restartGame} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3">
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Evolution Modal */}
      <Dialog open={showEvolutionModal} onOpenChange={setShowEvolutionModal}>
        <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center text-purple-600">Evolution Available!</DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Your dinosaur can evolve to the next stage!
            </DialogDescription>
          </DialogHeader>
          <div className="text-center mt-4">
            <p className="text-xl font-semibold text-gray-800">Current Stage: {EVOLUTION_STAGES[gameState.dino.evolutionStage].name}</p>
            <p className="text-xl font-semibold text-gray-800">Next Stage: {EVOLUTION_STAGES[gameState.dino.evolutionStage + 1]?.name}</p>
            <p className="text-xl font-semibold text-gray-800">Fossils Required: {EVOLUTION_STAGES[gameState.dino.evolutionStage + 1]?.fossils}</p>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              onClick={handleEvolution}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4"
            >
              <Zap className="mr-2 h-5 w-5" />
              Evolve Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DinoPiGameMode;
