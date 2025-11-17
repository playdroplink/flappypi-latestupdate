import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { gameBackendService } from '@/services/gameBackendService';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAdSystem } from '@/hooks/useAdSystem';
import { gameHistoryService } from '@/services/gameHistoryService';

interface UseGameOverHandlerProps {
  coins: number;
  highScore: number;
  level: number;
  setGameState: (state: 'menu' | 'playing' | 'gameOver' | 'paused') => void;
  setScore: (score: number) => void;
  setLives: (lives: number) => void;
  setLevel: (level: number) => void;
  setHighScore: (score: number) => void;
  setCoins: (coins: number) => void;
  setIsPausedForRevive: (paused: boolean) => void;
  setShowContinueButton: (show: boolean) => void;
  setAdWatched: (watched: boolean) => void;
  setShowMandatoryAd: (show: boolean) => void;
  setReviveUsed: (used: boolean) => void;
}

export const useGameOverHandler = ({
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
}: UseGameOverHandlerProps) => {
  const { toast } = useToast();
  const { submitScore } = useLeaderboard();
  const { profile, refreshProfile } = useUserProfile();
  const adSystem = useAdSystem();

  const handleGameOver = useCallback(async (finalScore: number) => {
    console.log('Game over with final score:', finalScore);
    
    // Check if mandatory ad should be shown
    adSystem.incrementGameCount();
    
    // Check if user should see mandatory ad (every 2 games) - fix: remove () since it's a boolean property
    if (adSystem.shouldShowMandatoryAd) {
      console.log('Showing mandatory ad after game over');
      setShowMandatoryAd(true);
      setGameState('paused');
      return;
    }
    
    // Normal game over flow
    setGameState('gameOver');
    setScore(finalScore);
    setIsPausedForRevive(false);
    setShowContinueButton(false);
    setAdWatched(false);
    
    if (!profile) {
      console.warn('No user profile available for game over handling');
      return;
    }
    
    try {
      // Complete game session in backend
      const sessionResult = await gameBackendService.completeGameSession(
        profile.pi_user_id,
        'classic',
        finalScore,
        level,
        Math.floor(finalScore / 3) + (level * 2)
      );
      
      if (sessionResult) {
        setCoins(sessionResult.total_coins);
        localStorage.setItem('flappypi-coins', sessionResult.total_coins.toString());
        
        if (sessionResult.is_high_score) {
          setHighScore(finalScore);
          localStorage.setItem('flappypi-highscore', finalScore.toString());
          toast({
            title: "🎉 New High Score!",
            description: `Amazing! You scored ${finalScore} points and earned ${sessionResult.coins_earned} coins!`
          });
        } else {
          toast({
            title: "Game Over! 🎮",
            description: `You scored ${finalScore} points and earned ${sessionResult.coins_earned} coins!`
          });
        }
        
        await refreshProfile();
      }
    } catch (error) {
      console.error('Error handling game over:', error);
      // Fallback to local handling
      const earnedCoins = Math.floor(finalScore / 3) + (level * 2);
      const newCoins = coins + earnedCoins;
      setCoins(newCoins);
      localStorage.setItem('flappypi-coins', newCoins.toString());
      
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('flappypi-highscore', finalScore.toString());
        toast({
          title: "🎉 New High Score!",
          description: `Amazing! You scored ${finalScore} points!`
        });
      }
    }

    // Submit score to leaderboard automatically for authenticated users
    if (finalScore > 0 && profile) {
      try {
        console.log('🔄 Auto-submitting score to leaderboard:', { 
          piUserId: profile.pi_user_id, 
          username: profile.username, 
          score: finalScore 
        });
        
        const result = await submitScore(profile.pi_user_id, profile.username, finalScore);
        
        if (result?.success) {
          console.log('✅ Score automatically submitted to leaderboard');
          toast({
            title: "Score Submitted! 🏆",
            description: `Your score of ${finalScore} has been automatically saved to the global leaderboard!`,
            duration: 4000,
          });
        } else {
          console.warn('⚠️ Score submission failed, but game session was saved');
        }
      } catch (error) {
        console.error('❌ Failed to auto-submit score:', error);
        // Don't show error toast for auto-submission failures to avoid spam
      }
    } else if (finalScore > 0 && !profile) {
      console.log('ℹ️ Score not submitted - user not authenticated');
    }

    // Reset for next game
    setLives(1);
    setLevel(1);
    setReviveUsed(false);
  }, [adSystem, setGameState, setScore, setIsPausedForRevive, setShowContinueButton, setAdWatched, setShowMandatoryAd, profile, level, setCoins, coins, setHighScore, highScore, toast, refreshProfile, submitScore, setLives, setLevel, setReviveUsed]);

  return { handleGameOver };
};
