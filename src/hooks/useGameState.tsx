import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
// import { useUserProfile } from '@/hooks/useUserProfile.tsx';
import { UserProfile } from '@/types/gameTypes';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGameSettings } from '@/hooks/useGameSettings';
import { useGameData } from '@/hooks/useGameData';
import { gameModes, GameModeLevel } from '@/constants/gameModes';
import { LEVELS, GameLevel } from '@/config/gameLevels';
import { useSettings } from '@/hooks/useSettings';

type GameMode = 'classic' | 'endless' | 'challenge';
type GameStateType = 'menu' | 'playing' | 'gameOver' | 'paused';

interface GameStateContextType {
  showSplash: boolean;
  showWelcome: boolean;
  gameState: GameStateType;
  gameMode: GameMode;
  visualMode: 'light' | 'night';
  profile: UserProfile | null;
  setGameState: (state: GameStateType) => void;
  startGame: (mode: GameMode) => void;
  setVisualMode: (mode: 'light' | 'night') => void;
  backToMenu: () => void;
  toast: ReturnType<typeof useToast>['toast'];
  // Expose all properties from smaller hooks
  coins: number;
  score: number;
  level: number;
  lives: number;
  difficulty: 'easy' | 'medium' | 'hard';
  musicEnabled: boolean;
  setCoins: (coins: number) => void;
  addCoins: (amount: number) => void;
  setScore: (score: number) => void;

  setLevel: (level: number) => void;
  setLives: (lives: number) => void;
  setMusicEnabled: (enabled: boolean) => void;
  isMobile: boolean;
  maxLives: number;
  setMaxLives: (lives: number) => void;
  // Game mode properties, derived from gameModes.ts
  currentPipeSpawnInterval: number;
  currentPipeSpeed: number;
  currentPipeGap: number;
  // Selected bird skin, derived from user profile
  selectedBirdSkin: string;
  highScore: number;
  setHighScore: (score: number) => void;
  handleScoreUpdate: (newScore: number, mode?: GameMode) => void;
  // New level properties
  currentLevelConfig: GameLevel | GameModeLevel;
  currentLevelIndex: number;
  nextLevel: () => void;
  // Dev mode functions
  addDevCoins?: (amount?: number) => void;
  resetDevCoins?: () => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

interface GameStateProviderProps {
  children: ReactNode;
  profile: UserProfile | null;
}

const GameStateProvider: React.FC<GameStateProviderProps> = ({ children, profile }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [gameState, setGameState] = useState<GameStateType>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [visualMode, setVisualMode] = useState<'light' | 'night'>('light');
  const [maxLives, setMaxLives] = useState(1); // Potentially dynamic based on mode/power-ups
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentLevelConfig, setCurrentLevelConfig] = useState<GameLevel | GameModeLevel>(LEVELS[0]);
  
  const { toast } = useToast();
  const { settings } = useSettings();
  const isMobile = useIsMobile();
  
  const gameSettings = useGameSettings();
  const gameData = useGameData();

  // FIXED: Sync visual mode with theme settings
  useEffect(() => {
    const theme = settings.theme;
    if (theme === 'night') {
      setVisualMode('night');
    } else if (theme === 'light') {
      setVisualMode('light');
    }
  }, [settings.theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setShowWelcome(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const startGame = (mode: GameMode) => {
    console.log('🎮 Starting game with mode:', mode);
    
    // Validate game mode
    const gameModeDef = gameModes.find(m => m.id === mode);
    if (!gameModeDef) {
      console.error('Invalid game mode:', mode);
      toast({
        title: "Error",
        description: "Invalid game mode selected.",
        variant: "destructive"
      });
      return;
    }
    
    setGameMode(mode);
    
    // Reset game data for new game
    gameData.setScore(0);
    gameData.setLevel(1);
    gameData.setLives(1);
    setShowWelcome(false);
    
    // Game mode specific setup
    const modeMessages = {
      classic: {
        title: "🎯 Classic Mode Started!",
        description: "Progress through levels with increasing difficulty!"
      },
      endless: {
        title: "🚀 Endless Mode Started!",
        description: "Survive as long as you can with continuous scaling!"
      },
      challenge: {
        title: "⚡ Challenge Mode Started!",
        description: "Maximum difficulty from the start - good luck!"
      }
    };
    
    const modeInfo = modeMessages[mode];
    toast({
      title: modeInfo.title,
      description: modeInfo.description
    });
    
    // Initialize with first level for the selected mode, or default to first overall level
    let initialLevelConfig: GameLevel | GameModeLevel;
    if (mode === 'classic' && gameModeDef.levels && gameModeDef.levels.length > 0) {
        initialLevelConfig = gameModeDef.levels[0];
    } else {
        initialLevelConfig = LEVELS[0];
    }
    setCurrentLevelConfig(initialLevelConfig);
    setCurrentLevelIndex(0);

    console.log(`${mode} mode settings:`, {
      pipeSpeed: (initialLevelConfig as any).pipeSpeedMultiplier || (initialLevelConfig as any).pipeSpeed,
      pipeGap: (initialLevelConfig as any).pipeGapMultiplier || (initialLevelConfig as any).pipeGap,
      gravity: initialLevelConfig.gravity,
      // coinMultiplier: (initialLevelConfig as any).coinMultiplier, // Remove if not present
    });
    
    // Set to playing immediately
    setGameState('playing');
    console.log(`${mode} mode game state set to playing`);
  };

  const backToMenu = () => {
    console.log('🏠 Returning to menu - complete game reset');
    
    
    setGameState('menu');
    setGameMode('classic');
    gameData.setScore(0);
    gameData.setLevel(1);
    gameData.setLives(1);
    setShowWelcome(true);
    setCurrentLevelIndex(0); // Reset level index on returning to menu
    setCurrentLevelConfig(LEVELS[0]); // Reset level config on returning to menu
  };

  const nextLevel = () => {
    const nextIndex = (currentLevelIndex + 1) % LEVELS.length;
    setCurrentLevelIndex(nextIndex);
    setCurrentLevelConfig(LEVELS[nextIndex]);
    gameData.setLevel(gameData.level + 1); // Increment game level
    console.log(`🌌 Advancing to next level: ${LEVELS[nextIndex].name}`);
    toast({
        title: "Level Up!",
        description: `Now entering ${LEVELS[nextIndex].name}!`, // Display level name
        variant: "default",
    });
};

  const handleScoreUpdate = (newScore: number, mode?: GameMode) => {
    const currentMode = mode || gameMode;
    gameData.setScore(newScore);
    
    // Handle high score tracking per mode
    const currentHighScore = gameData.highScore || 0;
    if (newScore > currentHighScore) {
      gameData.setHighScore(newScore);
      console.log(`🏆 New high score in ${currentMode} mode: ${newScore}`);
    }
    
    // Mode-specific score handling
    if (currentMode === 'classic') {
      // Classic mode: level progression based on score (e.g., every 10 points)
      const scoreThresholdForNextLevel = (currentLevelIndex + 1) * 10; // Example: Level 1 at 0-9, Level 2 at 10-19
      if (newScore >= scoreThresholdForNextLevel) {
        nextLevel();
      }
    } else if (currentMode === 'endless') {
      // Endless mode: continuous scaling, maybe based on a higher score threshold or time
      const newLevel = Math.floor(newScore / 25) + 1; // Example: new level every 25 points
      if (newLevel > (gameData.level || 1)) {
          // Only advance if it's genuinely a new 'level' in terms of score, not just next visual background
          const nextIndex = Math.floor(newScore / 25) % LEVELS.length; // Cycle backgrounds
          setCurrentLevelIndex(nextIndex);
          setCurrentLevelConfig(LEVELS[nextIndex]);
          gameData.setLevel(newLevel); // Keep internal game level tracking
          console.log(`🚀 Endless mode progression: Level ${newLevel}, Background: ${LEVELS[nextIndex].name}`);
      }
    } else if (currentMode === 'challenge') {
      // Challenge mode: extreme difficulty from start
      console.log(`⚡ Challenge mode score: ${newScore}`);
    }
  };

  const value: GameStateContextType = {
    showSplash,
    showWelcome,
    gameState,
    gameMode,
    visualMode,
    profile,
    setGameState,
    startGame,
    setVisualMode,
    backToMenu,
    toast,
    isMobile,
    maxLives,
    setMaxLives,
    // Game mode properties, derived from gameModes.ts
    currentPipeSpawnInterval: (gameModes.find(m => m.id === gameMode)?.levels[0] as any)?.pipeFrequency || 2000,
    currentPipeSpeed: (gameModes.find(m => m.id === gameMode)?.levels[0] as any)?.pipeSpeed || 2,
    currentPipeGap: (gameModes.find(m => m.id === gameMode)?.levels[0] as any)?.pipeGap || 150,
    // Selected bird skin, derived from user profile
    selectedBirdSkin: profile?.selected_bird_skin || 'default',
    musicEnabled: gameSettings.musicEnabled || true,
    setMusicEnabled: gameSettings.setMusicEnabled || (() => {}),
    // Game data properties
    coins: gameData.coins || 0,
    score: gameData.score || 0,
    level: gameData.level || 1,
    lives: gameData.lives || 1,
    difficulty: gameData.difficulty || 'easy',
    highScore: gameData.highScore || 0,
    setCoins: gameData.setCoins || (() => {}),
    addCoins: gameData.addCoins || (() => {}),
    setScore: gameData.setScore || (() => {}),
    // addScore method not available in useGameData
    setLevel: gameData.setLevel || (() => {}),
    setLives: gameData.setLives || (() => {}),
    setHighScore: gameData.setHighScore || (() => {}),
    handleScoreUpdate,
    // New level properties
    currentLevelConfig,
    currentLevelIndex,
    nextLevel,
    // Dev mode functions
    addDevCoins: gameData.addDevCoins,
    resetDevCoins: gameData.resetDevCoins
  };

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
};

export { GameStateProvider };
