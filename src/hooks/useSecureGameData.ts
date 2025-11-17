
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { secureGameBackendService } from '@/services/secureGameBackendService';

// Secure version of game data hook with server-side validation
export const useSecureGameData = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const { toast } = useToast();
  const { profile } = useUserProfile();

  // Load only UI preferences from localStorage (non-sensitive data)
  useEffect(() => {
    const savedHighScore = localStorage.getItem('flappypi-highscore');
    if (savedHighScore) setHighScore(parseInt(savedHighScore));
  }, []);

  // Sync with authenticated user profile
  useEffect(() => {
    if (profile) {
      setCoins(profile.total_coins);
    }
  }, [profile]);

  const startGameSession = () => {
    setSessionStartTime(Date.now());
  };

  const handleScoreUpdate = (newScore: number) => {
    // Client-side validation for immediate feedback
    if (newScore < 0 || newScore > 1000) {
      console.warn('Invalid score detected');
      return;
    }
    
    setScore(newScore);
    const newLevel = Math.floor(newScore / 5) + 1;
    if (newLevel > level && newLevel <= 200) { // Reasonable level cap
      setLevel(newLevel);
      toast({
        title: `Level ${newLevel}! 🎯`,
        description: "Getting harder now!"
      });
    }
  };

  const submitGameSession = async (gameMode: 'classic' | 'endless' | 'challenge') => {
    if (!profile || !sessionStartTime) {
      console.warn('Cannot submit session: missing profile or session data');
      return null;
    }

    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const coinsEarned = Math.floor(score / 10); // 1 coin per 10 points

    try {
      // Use the secure backend function
      const result = await secureGameBackendService.completeGameSession(
        gameMode,
        score,
        level,
        coinsEarned,
        sessionDuration
      );

      if (result) {
        if (result.is_high_score) {
          setHighScore(score);
          localStorage.setItem('flappypi-highscore', score.toString());
        }
        setCoins(result.total_coins);
        return result;
      }
    } catch (error) {
      console.error('Failed to submit game session:', error);
      toast({
        title: "Session Error",
        description: "Failed to save game session",
        variant: "destructive"
      });
    }
    return null;
  };

  const resetGameData = () => {
    setScore(0);
    setLevel(1);
    setLives(1);
    setSessionStartTime(null);
  };

  return {
    score,
    level,
    lives,
    highScore,
    coins,
    setScore,
    setLevel,
    setLives,
    setHighScore,
    setCoins,
    handleScoreUpdate,
    submitGameSession,
    startGameSession,
    resetGameData
  };
};
