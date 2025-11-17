import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { RealLeaderboardService, RealLeaderboardEntry, ScoreSubmission, UserRank } from '@/services/realLeaderboardService';

export const useRealLeaderboard = (gameMode: 'classic' | 'endless' | 'challenge' | 'all' = 'all') => {
  const [leaderboard, setLeaderboard] = useState<RealLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching real leaderboard data...');
      const data = await RealLeaderboardService.getRealLeaderboard(gameMode, 100);
      setLeaderboard(data);
      setLastUpdate(new Date().toISOString());
      setIsConnected(true);
      console.log('✅ Real leaderboard data loaded:', data.length, 'entries');
    } catch (error) {
      console.error('❌ Error fetching real leaderboard:', error);
      setLeaderboard([]);
      setIsConnected(false);
      toast({
        title: "Leaderboard Unavailable",
        description: "Unable to connect to the leaderboard. Please check your connection.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [gameMode, toast]);

  const fetchUserStats = useCallback(async (piUserId: string) => {
    try {
      console.log('🔍 Fetching user stats for:', piUserId);
      const stats = await RealLeaderboardService.getUserStats(piUserId);
      setUserStats(stats);
      
      // Get user's rank for current game mode
      const rank = await RealLeaderboardService.getUserRank(piUserId, gameMode);
      setUserRank(rank);
      
      console.log('✅ User stats loaded:', stats);
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
    }
  }, [gameMode]);

  const submitScore = useCallback(async (
    piUserId: string, 
    username: string, 
    score: number, 
    gameMode: 'classic' | 'endless' | 'challenge' = 'classic',
    challengeType?: string,
    avatarUrl?: string,
    selectedBirdSkin?: string
  ) => {
    setSubmittingScore(true);
    try {
      console.log('📊 Submitting real score:', { piUserId, username, score, gameMode });
      
      const submission: ScoreSubmission = {
        piUserId,
        username,
        score,
        gameMode,
        challengeType,
        avatarUrl,
        selectedBirdSkin
      };

      const success = await RealLeaderboardService.submitRealScore(submission);
      
      if (success) {
        // Refresh leaderboard after successful submission
        await fetchLeaderboard();
        
        // Update user stats
        await fetchUserStats(piUserId);
        
        toast({
          title: "Score Submitted! 🎉",
          description: `Your score of ${score} has been submitted to the leaderboard.`,
          duration: 4000,
        });
        
        return { success: true, isNewHigh: true };
      } else {
        toast({
          title: "Submission Failed",
          description: "Unable to submit your score. Please try again.",
          variant: "destructive",
          duration: 4000,
        });
        return { success: false, isNewHigh: false };
      }
    } catch (error) {
      console.error('❌ Error submitting score:', error);
      toast({
        title: "Submission Error",
        description: "An error occurred while submitting your score.",
        variant: "destructive",
        duration: 4000,
      });
      return { success: false, isNewHigh: false };
    } finally {
      setSubmittingScore(false);
    }
  }, [fetchLeaderboard, fetchUserStats, toast]);

  const submitGameSession = async (submission: ScoreSubmission) => {
    return submitScore(
      submission.piUserId,
      submission.username,
      submission.score,
      submission.gameMode,
      submission.challengeType,
      submission.avatarUrl,
      submission.selectedBirdSkin
    );
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchLeaderboard();

    // Set up real-time subscription
    const subscription = RealLeaderboardService.subscribeToRealTimeUpdates(
      gameMode,
      (updatedLeaderboard) => {
        console.log('📊 Real-time leaderboard update received:', updatedLeaderboard.length, 'entries');
        setLeaderboard(updatedLeaderboard);
        setLastUpdate(new Date().toISOString());
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [gameMode, fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    submittingScore,
    userStats,
    userRank,
    isConnected,
    lastUpdate,
    fetchLeaderboard,
    fetchUserStats,
    submitScore,
    submitGameSession
  };
};
