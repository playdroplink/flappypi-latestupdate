
import { useCallback } from 'react';

interface UseCollisionHandlerProps {
  reviveUsed: boolean;
  score: number;
  setGameState: (state: 'menu' | 'playing' | 'gameOver' | 'paused') => void;
  setIsPausedForRevive: (paused: boolean) => void;
  setShowContinueButton: (show: boolean) => void;
  setAdWatched: (watched: boolean) => void;
  setShowMandatoryAd: (show: boolean) => void;
  onGameOver: (score: number) => void;
}

export const useCollisionHandler = ({
  reviveUsed,
  score,
  setGameState,
  setIsPausedForRevive,
  setShowContinueButton,
  setAdWatched,
  setShowMandatoryAd,
  onGameOver
}: UseCollisionHandlerProps) => {

  const handleCollision = useCallback(() => {
    console.log('Collision handler triggered! Revive used:', reviveUsed, 'Score:', score);
    
    // Stop any ongoing game logic immediately
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flash red briefly to indicate collision
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        setTimeout(() => {
          // Clear the red flash after a brief moment
        }, 100);
      }
    }
    
    // If revive hasn't been used and player has a decent score, offer revive with ad
    if (!reviveUsed && score >= 5) {
      console.log('Offering revive with ad - pausing game for revive prompt');
      setGameState('paused');
      setIsPausedForRevive(true);
      setShowContinueButton(false);
      setAdWatched(false);
      setShowMandatoryAd(false);
    } else {
      // Game over - no revive available
      console.log('No revive available - triggering game over');
      onGameOver(score);
    }
  }, [reviveUsed, score, setGameState, setIsPausedForRevive, setShowContinueButton, setAdWatched, setShowMandatoryAd, onGameOver]);

  return { handleCollision };
};
