import { supabase } from '../integrations/supabase/client';

export interface RealLeaderboardEntry {
  id: string;
  pi_user_id: string;
  username: string;
  highest_score: number;
  total_games: number;
  game_mode: 'classic' | 'endless' | 'challenge';
  challenge_type?: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  selected_bird_skin?: string;
  last_played_at?: string;
}

export interface ScoreSubmission {
  piUserId: string;
  username: string;
  score: number;
  gameMode: 'classic' | 'endless' | 'challenge';
  challengeType?: string;
  coinsEarned?: number;
  achievements?: string[];
  avatarUrl?: string;
  selectedBirdSkin?: string;
}

export interface UserRank {
  rank: number;
  totalPlayers: number;
  percentile: number;
}

export class RealLeaderboardService {
  /**
   * Fetch real leaderboard data from all users
   */
  static async getRealLeaderboard(
    gameMode: 'classic' | 'endless' | 'challenge' | 'all' = 'all',
    limit: number = 100,
    period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time'
  ): Promise<RealLeaderboardEntry[]> {
    try {
      console.log('🔍 Fetching real leaderboard data...', { gameMode, limit, period });
      
      let query = supabase
        .from('user_scores')
        .select(`
          id,
          pi_user_id,
          username,
          highest_score,
          total_games,
          game_mode,
          challenge_type,
          created_at,
          updated_at,
          avatar_url,
          selected_bird_skin,
          last_played_at
        `);

      // Filter by game mode if not 'all'
      if (gameMode !== 'all') {
        query = query.eq('game_mode', gameMode);
      }

      // Filter by time period
      if (period !== 'all-time') {
        const now = new Date();
        let startDate: Date;
        
        switch (period) {
          case 'daily':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case 'weekly':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'monthly':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        query = query.gte('updated_at', startDate.toISOString());
      }

      // Order by highest score and limit results
      query = query
        .order('highest_score', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching real leaderboard:', error);
        throw error;
      }

      console.log('✅ Real leaderboard data fetched:', data?.length || 0, 'entries');
      return data || [];
    } catch (error) {
      console.error('❌ Failed to fetch real leaderboard:', error);
      // Return empty array instead of mock data
      return [];
    }
  }

  /**
   * Submit a real score to the leaderboard
   */
  static async submitRealScore(submission: ScoreSubmission): Promise<boolean> {
    try {
      console.log('📊 Submitting real score:', submission);

      // Check if user already has a score for this game mode
      const { data: existingScore, error: fetchError } = await supabase
        .from('user_scores')
        .select('*')
        .eq('pi_user_id', submission.piUserId)
        .eq('game_mode', submission.gameMode)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error checking existing score:', fetchError);
        throw fetchError;
      }

      const scoreData = {
        pi_user_id: submission.piUserId,
        username: submission.username,
        highest_score: submission.score,
        total_games: existingScore ? existingScore.total_games + 1 : 1,
        game_mode: submission.gameMode,
        challenge_type: submission.challengeType || null,
        avatar_url: submission.avatarUrl || null,
        selected_bird_skin: submission.selectedBirdSkin || null,
        last_played_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingScore) {
        // Update existing score if new score is higher
        if (submission.score > existingScore.highest_score) {
          const { data, error } = await supabase
            .from('user_scores')
            .update(scoreData)
            .eq('id', existingScore.id)
            .select();

          if (error) throw error;
          result = data;
        } else {
          // Just update total games and last played
          const { data, error } = await supabase
            .from('user_scores')
            .update({
              total_games: scoreData.total_games,
              last_played_at: scoreData.last_played_at,
              updated_at: scoreData.updated_at
            })
            .eq('id', existingScore.id)
            .select();

          if (error) throw error;
          result = data;
        }
      } else {
        // Insert new score
        const { data, error } = await supabase
          .from('user_scores')
          .insert(scoreData)
          .select();

        if (error) throw error;
        result = data;
      }

      console.log('✅ Real score submitted successfully:', result);
      return true;
    } catch (error) {
      console.error('❌ Failed to submit real score:', error);
      return false;
    }
  }

  /**
   * Get user's rank in the leaderboard
   */
  static async getUserRank(
    piUserId: string,
    gameMode: 'classic' | 'endless' | 'challenge' | 'all' = 'all'
  ): Promise<UserRank | null> {
    try {
      console.log('🔍 Getting user rank for:', piUserId, gameMode);

      // First get user's score
      const { data: userScore, error: userError } = await supabase
        .from('user_scores')
        .select('highest_score, game_mode')
        .eq('pi_user_id', piUserId)
        .eq('game_mode', gameMode)
        .single();

      if (userError || !userScore) {
        console.log('ℹ️ User has no score for this game mode');
        return null;
      }

      // Count how many users have higher scores
      let query = supabase
        .from('user_scores')
        .select('id', { count: 'exact' })
        .eq('game_mode', gameMode)
        .gt('highest_score', userScore.highest_score);

      const { count: higherScores, error: countError } = await query;

      if (countError) throw countError;

      // Get total players for this game mode
      const { count: totalPlayers, error: totalError } = await supabase
        .from('user_scores')
        .select('id', { count: 'exact' })
        .eq('game_mode', gameMode);

      if (totalError) throw totalError;

      const rank = (higherScores || 0) + 1;
      const percentile = totalPlayers ? Math.round(((totalPlayers - rank + 1) / totalPlayers) * 100) : 0;

      console.log('✅ User rank calculated:', { rank, totalPlayers, percentile });

      return {
        rank,
        totalPlayers: totalPlayers || 0,
        percentile
      };
    } catch (error) {
      console.error('❌ Failed to get user rank:', error);
      return null;
    }
  }

  /**
   * Get user's statistics
   */
  static async getUserStats(piUserId: string): Promise<{
    classic: RealLeaderboardEntry | null;
    endless: RealLeaderboardEntry | null;
    challenge: RealLeaderboardEntry | null;
    totalGames: number;
    bestScore: number;
    lastPlayed: string | null;
  }> {
    try {
      console.log('🔍 Getting user stats for:', piUserId);

      const { data, error } = await supabase
        .from('user_scores')
        .select('*')
        .eq('pi_user_id', piUserId);

      if (error) throw error;

      const stats = {
        classic: data?.find(entry => entry.game_mode === 'classic') || null,
        endless: data?.find(entry => entry.game_mode === 'endless') || null,
        challenge: data?.find(entry => entry.game_mode === 'challenge') || null,
        totalGames: data?.reduce((sum, entry) => sum + entry.total_games, 0) || 0,
        bestScore: Math.max(...(data?.map(entry => entry.highest_score) || [0])),
        lastPlayed: data?.reduce((latest, entry) => 
          !latest || new Date(entry.last_played_at) > new Date(latest) 
            ? entry.last_played_at 
            : latest, null as string | null
        ) || null
      };

      console.log('✅ User stats retrieved:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Failed to get user stats:', error);
      return {
        classic: null,
        endless: null,
        challenge: null,
        totalGames: 0,
        bestScore: 0,
        lastPlayed: null
      };
    }
  }

  /**
   * Get leaderboard for a specific time period
   */
  static async getPeriodLeaderboard(
    period: 'daily' | 'weekly' | 'monthly',
    gameMode: 'classic' | 'endless' | 'challenge' | 'all' = 'all',
    limit: number = 100
  ): Promise<RealLeaderboardEntry[]> {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return this.getRealLeaderboard(gameMode, limit, period);
  }

  /**
   * Subscribe to real-time leaderboard updates
   */
  static subscribeToRealTimeUpdates(
    gameMode: 'classic' | 'endless' | 'challenge' | 'all',
    callback: (data: RealLeaderboardEntry[]) => void
  ) {
    console.log('🔄 Setting up real-time leaderboard subscription for:', gameMode);

    const channel = supabase
      .channel(`real-leaderboard-${gameMode}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_scores'
        },
        async () => {
          console.log('📊 Real-time leaderboard update detected, refreshing...');
          const updatedLeaderboard = await this.getRealLeaderboard(gameMode, 100);
          callback(updatedLeaderboard);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time leaderboard subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Real-time subscription failed, using polling fallback');
        }
      });

    return {
      unsubscribe: () => {
        console.log('🛑 Unsubscribing from real-time leaderboard updates');
        supabase.removeChannel(channel);
      }
    };
  }
}
