
import { useState } from 'react';
import { useAdSystem } from '@/hooks/useAdSystem';
import { useCollisionHandler } from '@/hooks/useCollisionHandler';
import { useGameOverHandler } from '@/hooks/useGameOverHandler';
import { useAdHandler } from '@/hooks/useAdHandler';
import { useContinueGame } from '@/hooks/useContinueGame';
import { usePiPayments } from '@/hooks/usePiPayments';

interface UseGameEventsProps {
  score: number;
  coins: number;
  highScore: number;
  level: number;
  setGameState: (state: 'menu' | 'playing' | 'gameOver' | 'paused') => void;
  setScore: (score: number) => void;
  setLives: (lives: number) => void;
  setLevel: (level: number) => void;
  setHighScore: (score: number) => void;
  setCoins: (coins: number) => void;
  continueGame?: () => void;
}

export const useGameEvents = ({
  score,
  coins,
  highScore,
  level,
  setGameState,
  setScore,
  setLives,
  setLevel,
  setHighScore,
  setCoins,
  continueGame
}: UseGameEventsProps) => {
  const adSystem = useAdSystem();
  const piPayments = usePiPayments();
  
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [isPausedForRevive, setIsPausedForRevive] = useState(false);
  const [reviveUsed, setReviveUsed] = useState(false);
  const [adWatched, setAdWatched] = useState(false);
  const [showMandatoryAd, setShowMandatoryAd] = useState(false);
  const [showAdFreeModal, setShowAdFreeModal] = useState(false);
  const [showRevivePrompt, setShowRevivePrompt] = useState(false);

  const { handleGameOver } = useGameOverHandler({
    coins,
    highScore,
    level,
    setGameState,
    setScore,
    setLives,
    setLevel,
    setHighScore,
    setCoins,
    setIsPausedForRevive,
    setShowContinueButton,
    setAdWatched,
    setShowMandatoryAd,
    setReviveUsed
  });

  const { handleCollision } = useCollisionHandler({
    reviveUsed,
    score,
    setGameState,
    setIsPausedForRevive,
    setShowContinueButton,
    setAdWatched,
    setShowMandatoryAd,
    onGameOver: handleGameOver
  });

  const { handleAdWatch, handleMandatoryAdWatch } = useAdHandler({
    coins,
    adWatched,
    isPausedForRevive,
    setCoins,
    setLives,
    setShowContinueButton,
    setAdWatched,
    setShowMandatoryAd,
    onGameOver: handleGameOver,
    score
  });

  const { handleContinueClick, handleCoinEarned } = useContinueGame({
    continueGame,
    setGameState,
    setShowContinueButton,
    setReviveUsed,
    setIsPausedForRevive,
    setAdWatched
  });

  // Enhanced revive system handlers
  const handleReviveAdWatch = () => {
    console.log('Player chose to watch revive ad');
    setShowRevivePrompt(false);
    
    // Simulate ad watching (replace with real ad integration)
    setTimeout(() => {
      handleAdWatch('continue');
    }, 3000); // 3 second simulated ad
  };

  const handleReviveDecline = () => {
    console.log('Player declined revive ad');
    setShowRevivePrompt(false);
    setIsPausedForRevive(false);
    handleGameOver(score);
  };

  // Show revive prompt when collision occurs and revive is available
  const enhancedHandleCollision = () => {
    if (!reviveUsed && score >= 5) {
      setShowRevivePrompt(true);
    }
    handleCollision();
  };

  // Enhanced handlers with Pi payment integration
  const handlePiAdWatch = () => {
    setShowMandatoryAd(false);
    handleMandatoryAdWatch();
  };

  const handleShareScore = () => {
    piPayments.shareScore(score, level);
  };

  return {
    handleCollision: enhancedHandleCollision,
    handleGameOver,
    handleCoinEarned: (coinAmount: number) => handleCoinEarned(coinAmount, coins, setCoins),
    handleAdWatch,
    handleMandatoryAdWatch: handlePiAdWatch,
    handleShareScore,
    showContinueButton,
    handleContinueClick,
    isPausedForRevive,
    reviveUsed,
    showMandatoryAd,
    showAdFreeModal,
    showRevivePrompt,
    handleReviveAdWatch,
    handleReviveDecline,
    adSystem,
    piPayments,
    setShowAdFreeModal,
    setShowMandatoryAd
  };
};
