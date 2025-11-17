import { supabase } from '@/integrations/supabase/client';

class GameSessionService {
  // Complete a game session
  async completeGameSession(
    piUserId: string,
    gameMode: 'classic' | 'endless' | 'challenge',
    finalScore: number,
    levelReached: number,
    coinsEarned: number,
    sessionDuration?: number
  ): Promise<any> {
    try {
      // First, record the game session
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          pi_user_id: piUserId,
          game_mode: gameMode,
          final_score: finalScore,
          level_reached: levelReached,
          coins_earned: coinsEarned,
          session_duration: sessionDuration || null
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error recording game session:', sessionError);
        return null;
      }

      // Get current user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('total_coins, highest_score, total_games')
        .eq('pi_user_id', piUserId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      // Calculate new values
      const newTotalCoins = (profile?.total_coins || 0) + coinsEarned;
      const isHighScore = finalScore > (profile?.highest_score || 0);
      const newHighestScore = isHighScore ? finalScore : (profile?.highest_score || 0);
      const newTotalGames = (profile?.total_games || 0) + 1;

      // Update user profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          total_coins: newTotalCoins,
          highest_score: newHighestScore,
          total_games: newTotalGames,
          last_played_at: new Date().toISOString()
        })
        .eq('pi_user_id', piUserId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        return null;
      }

      // Update leaderboard
      await supabase
        .from('leaderboards')
        .upsert({
          pi_user_id: piUserId,
          score: newHighestScore,
          recorded_at: new Date().toISOString()
        }, { onConflict: 'pi_user_id' });

      return {
        session_id: sessionData.id,
        is_high_score: isHighScore,
        total_coins: newTotalCoins,
        coins_earned: coinsEarned,
        new_highest_score: newHighestScore,
        total_games: newTotalGames
      };
    } catch (error) {
      console.error('Error in completeGameSession:', error);
      return null;
    }
  }
}

export const gameSessionService = new GameSessionService();
