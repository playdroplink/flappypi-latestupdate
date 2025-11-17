
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGameSettings } from '@/hooks/useGameSettings';
import { useSecureGameData } from '@/hooks/useSecureGameData';

type GameMode = 'classic' | 'endless' | 'challenge';
type GameStateType = 'menu' | 'playing' | 'gameOver' | 'paused';

// Secure version with proper validation and reduced logging
export const useSecureGameState = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [gameState, setGameState] = useState<GameStateType>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const isMobile = useIsMobile();
  
  const gameSettings = useGameSettings();
  const gameData = useSecureGameData();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setShowWelcome(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const startGame = (mode: GameMode) => {
    // Validate game mode
    if (!['classic', 'endless', 'challenge'].includes(mode)) {
      console.warn('Invalid game mode');
      return;
    }
    
    setGameMode(mode);
    gameData.resetGameData();
    setGameState('menu');
    setShowWelcome(false);
    
    const modeMessages = {
      classic: "🎯 Classic Mode: Standard difficulty progression!",
      endless: "🚀 Endless Mode: Continuous challenge awaits!",
      challenge: "⚡ Challenge Mode: Maximum difficulty from start!"
    };
    
    toast({
      title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode Started!`,
      description: modeMessages[mode]
    });
    
    setTimeout(() => {
      setGameState('playing');
      gameData.startGameSession();
    }, 200);
  };

  const backToMenu = () => {
    
    setGameState('menu');
    setGameMode('classic');
    gameData.resetGameData();
    setShowWelcome(true);
  };

  const endGame = async () => {
    if (gameState === 'playing') {
      const result = await gameData.submitGameSession(gameMode);
      setGameState('gameOver');
      return result;
    }
  };

  return {
    showSplash,
    showWelcome,
    gameState,
    gameMode,
    profile,
    setGameState,
    startGame,
    backToMenu,
    endGame,
    toast,
    ...gameData,
    ...gameSettings,
    ...fullscreen
  };
};
