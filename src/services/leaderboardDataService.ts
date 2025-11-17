import { supabase } from '@/integrations/supabase/client';

class LeaderboardDataService {
  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<any[]> {
    /* Original Supabase logic:
    try {
      const { data, error } = await supabase
        .from('user_scores')
        .select('username, highest_score, total_games, updated_at')
        .order('highest_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      return [];
    }
    */
  }
}

export const leaderboardDataService = new LeaderboardDataService();
