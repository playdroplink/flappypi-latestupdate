import { useCallback, useEffect, useState } from 'react';
import { useLeaderboard } from './useLeaderboard';
import { useUserProfile } from './useUserProfile';
import { useToast } from './use-toast';
import { ScoreSubmission } from '@/services/leaderboardService';

interface GameSession {
  gameMode: 'classic' | 'endless' | 'challenge';
  challengeType?: string;
  score: number;
  coinsEarned: number;
  achievements: string[];
  startTime: number;
  endTime?: number;
}

export const useRealTimeScoring = () => {
  const { profile } = useUserProfile();
  const { submitGameSession } = useLeaderboard('all');
  const { toast } = useToast();
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Start a new game session
   */
  const startGameSession = useCallback((
    gameMode: 'classic' | 'endless' | 'challenge',
    challengeType?: string
  ) => {
    const session: GameSession = {
      gameMode,
      challengeType,
      score: 0,
      coinsEarned: 0,
      achievements: [],
      startTime: Date.now()
    };
    
    setCurrentSession(session);
    console.log('🎮 Game session started:', session);
  }, []);

  /**
   * Update score in real-time during gameplay
   */
  const updateScore = useCallback((newScore: number) => {
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, score: newScore } : null);
    }
  }, [currentSession]);

  /**
   * Add coins earned during gameplay
   */
  const addCoinsEarned = useCallback((coins: number) => {
    if (currentSession) {
      setCurrentSession(prev => prev ? { 
        ...prev, 
        coinsEarned: prev.coinsEarned + coins 
      } : null);
    }
  }, [currentSession]);

  /**
   * Add achievements during gameplay
   */
  const addAchievement = useCallback((achievement: string) => {
    if (currentSession) {
      setCurrentSession(prev => prev ? { 
        ...prev, 
        achievements: [...prev.achievements, achievement]
      } : null);
    }
  }, [currentSession]);

  /**
   * End game session and submit score
   */
  const endGameSession = useCallback(async (finalScore?: number) => {
    if (!currentSession || !profile) {
      console.warn('No active session or user profile');
      return false;
    }

    const session = {
      ...currentSession,
      score: finalScore ?? currentSession.score,
      endTime: Date.now()
    };

    setIsSubmitting(true);

    try {
      const submission: ScoreSubmission = {
        piUserId: profile.pi_user_id,
        username: profile.username,
        score: session.score,
        gameMode: session.gameMode,
        challengeType: session.challengeType,
        coinsEarned: session.coinsEarned,
        achievements: session.achievements
      };

      console.log('📊 Submitting game session:', submission);
      
      const success = await submitGameSession(submission);
      
      if (success) {
        console.log('✅ Game session submitted successfully');
        
        // Show session summary
        const duration = Math.round((session.endTime - session.startTime) / 1000);
        toast({
          title: "Game Session Complete! 🎮",
          description: `Score: ${session.score} | Coins: ${session.coinsEarned} | Duration: ${duration}s`,
        });
      }

      // Clear current session
      setCurrentSession(null);
      return success;
    } catch (error) {
      console.error('❌ Error submitting game session:', error);
      toast({
        title: "Score Submission Failed",
        description: "Unable to save your game session.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentSession, profile, submitGameSession, toast]);

  /**
   * Auto-submit score when game ends (for Classic and Endless modes)
   */
  const handleGameOver = useCallback(async (finalScore: number) => {
    if (!currentSession) return false;
    
    console.log('🎯 Game over - submitting score:', finalScore);
    return await endGameSession(finalScore);
  }, [currentSession, endGameSession]);

  /**
   * Handle challenge completion
   */
  const handleChallengeComplete = useCallback(async (score: number, time: number) => {
    if (!currentSession) return false;
    
    console.log('🏆 Challenge completed:', { score, time });
    addAchievement(`Challenge Completed: ${currentSession.challengeType}`);
    return await endGameSession(score);
  }, [currentSession, addAchievement, endGameSession]);

  /**
   * Handle challenge failure
   */
  const handleChallengeFail = useCallback(async () => {
    if (!currentSession) return false;
    
    console.log('💥 Challenge failed');
    return await endGameSession();
  }, [currentSession, endGameSession]);

  /**
   * Get current session info
   */
  const getSessionInfo = useCallback(() => {
    if (!currentSession) return null;
    
    const duration = Math.round((Date.now() - currentSession.startTime) / 1000);
    return {
      ...currentSession,
      duration,
      isActive: true
    };
  }, [currentSession]);

  return {
    currentSession,
    isSubmitting,
    startGameSession,
    updateScore,
    addCoinsEarned,
    addAchievement,
    endGameSession,
    handleGameOver,
    handleChallengeComplete,
    handleChallengeFail,
    getSessionInfo
  };
};
