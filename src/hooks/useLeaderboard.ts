
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LeaderboardService, LeaderboardEntry, ScoreSubmission, GameModeScore } from '@/services/leaderboardService';

export const useLeaderboard = (gameMode: 'classic' | 'endless' | 'challenge' | 'all' = 'all') => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [userStats, setUserStats] = useState<GameModeScore | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const { toast } = useToast();

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      let data: LeaderboardEntry[] = [];
      
      if (gameMode === 'all') {
        data = await LeaderboardService.getCombinedLeaderboard(100);
      } else {
        data = await LeaderboardService.getGameModeLeaderboard(gameMode, 100);
      }
      
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  }, [gameMode]);

  const fetchUserStats = useCallback(async (piUserId: string) => {
    try {
      const stats = await LeaderboardService.getUserGameModeStats(piUserId);
      setUserStats(stats);
      
      // Get user's rank for current game mode
      const rank = gameMode === 'all' 
        ? await LeaderboardService.getUserRank(piUserId)
        : await LeaderboardService.getUserRankForGameMode(piUserId, gameMode);
      setUserRank(rank);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, [gameMode]);

  const submitScore = useCallback(async (
    piUserId: string, 
    username: string, 
    score: number, 
    gameMode: 'classic' | 'endless' | 'challenge' = 'classic',
    challengeType?: string
  ) => {
    setSubmittingScore(true);
    try {
      const result = await LeaderboardService.submitScore(
        piUserId, 
        username, 
        score, 
        gameMode, 
        challengeType
      );

      if (result.success) {
        // Refresh leaderboard and user stats
        await fetchLeaderboard();
        await fetchUserStats(piUserId);
        
        if (result.isNewHigh) {
          toast({
            title: "New High Score! 🏆",
            description: `Your score of ${score} is a new personal best!`,
            variant: "default"
          });
        } else {
          toast({
            title: "Score Submitted! 🎯",
            description: `Your score of ${score} has been recorded!`
          });
        }
        
        if (result.rank) {
          toast({
            title: `Rank #${result.rank}! 🥇`,
            description: `You're currently ranked #${result.rank} in ${gameMode} mode!`
          });
        }
      } else {
        toast({
          title: "Score Submission Failed",
          description: "Unable to submit score. Please try again.",
          variant: "destructive"
        });
      }
      
      return result.success;
    } catch (error) {
      console.error('Error submitting score:', error);
      toast({
        title: "Score Submission Failed",
        description: "An error occurred while submitting your score.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmittingScore(false);
    }
  }, [fetchLeaderboard, fetchUserStats, toast]);

  const submitGameSession = useCallback(async (submission: ScoreSubmission) => {
    setSubmittingScore(true);
    try {
      const result = await LeaderboardService.submitGameSession(submission);

      if (result.success) {
        // Refresh leaderboard and user stats
        await fetchLeaderboard();
        await fetchUserStats(submission.piUserId);
        
        if (result.isNewHigh) {
          toast({
            title: "New High Score! 🏆",
            description: `Your score of ${submission.score} is a new personal best in ${submission.gameMode}!`,
            variant: "default"
          });
        } else {
          toast({
            title: "Game Session Recorded! 🎮",
            description: `Your ${submission.gameMode} session has been saved!`
          });
        }
      }
      
      return result.success;
    } catch (error) {
      console.error('Error submitting game session:', error);
      return false;
    } finally {
      setSubmittingScore(false);
    }
  }, [fetchLeaderboard, fetchUserStats, toast]);

  // Set up real-time subscription for leaderboard updates
  useEffect(() => {
    fetchLeaderboard();

    // Set up realtime subscription if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    const isValidSupabaseConfig = supabaseUrl && 
      supabaseAnonKey && 
      supabaseUrl.includes('supabase.co');
    
    if (!isValidSupabaseConfig) {
      console.warn('⚠️ Invalid Supabase configuration detected - skipping realtime subscription');
      return;
    }
    
    console.log('✅ Setting up Supabase realtime subscription for leaderboard updates');

    try {
      // Create a unique channel name to avoid conflicts
      const channelName = `leaderboard-changes-${Date.now()}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_scores'
          },
          () => {
            // Refresh leaderboard when any score changes
            fetchLeaderboard();
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Leaderboard realtime subscription failed - continuing without realtime updates');
            // Don't show this as an error to users, it's expected in some environments
          } else if (status === 'SUBSCRIBED') {
            console.log('✅ Leaderboard realtime subscription active');
          }
        });

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.warn('⚠️ Error removing leaderboard channel:', error);
        }
      };
    } catch (error) {
      console.warn('⚠️ Failed to set up leaderboard realtime subscription:', error);
      // Continue without realtime updates
    }
  }, []);

  // Toggle real-time updates
  const toggleRealTime = useCallback(() => {
    setRealTimeEnabled(!realTimeEnabled);
  }, [realTimeEnabled]);

  return {
    leaderboard,
    loading,
    submittingScore,
    userStats,
    userRank,
    realTimeEnabled,
    fetchLeaderboard,
    fetchUserStats,
    submitScore,
    submitGameSession,
    toggleRealTime
  };
};
