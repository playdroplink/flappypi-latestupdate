
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseContinueGameProps {
  continueGame?: () => void;
  setGameState: (state: 'menu' | 'playing' | 'gameOver' | 'paused') => void;
  setShowContinueButton: (show: boolean) => void;
  setReviveUsed: (used: boolean) => void;
  setIsPausedForRevive: (paused: boolean) => void;
  setAdWatched: (watched: boolean) => void;
}

export const useContinueGame = ({
  continueGame,
  setGameState,
  setShowContinueButton,
  setReviveUsed,
  setIsPausedForRevive,
  setAdWatched
}: UseContinueGameProps) => {
  const { toast } = useToast();

  const handleContinueClick = useCallback(() => {
    console.log('Continue button clicked - resuming game');
    setShowContinueButton(false);
    setReviveUsed(true);
    setIsPausedForRevive(false);
    setAdWatched(false);
    
    if (continueGame) {
      continueGame();
    }
    
    setGameState('playing');
    
    toast({
      title: "Welcome Back! 🚀",
      description: "Continue your flight and reach new heights!",
      duration: 2000
    });
  }, [continueGame, setGameState, setShowContinueButton, setReviveUsed, setIsPausedForRevive, setAdWatched, toast]);

  const handleCoinEarned = useCallback((coinAmount: number, coins: number, setCoins: (coins: number) => void) => {
    const newCoins = coins + coinAmount;
    setCoins(newCoins);
    localStorage.setItem('flappypi-coins', newCoins.toString());
  }, []);

  return {
    handleContinueClick,
    handleCoinEarned
  };
};
