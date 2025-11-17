import { supabase } from '../lib/supabase';

export interface GhostRun {
  id: string;
  user_id: string;
  username: string;
  score: number;
  run_data: {
    flap_timestamps: number[];
    bird_positions: { x: number; y: number }[];
    pipe_positions: { x: number; y: number; gap_y: number }[];
    duration_ms: number;
  };
  duration_ms: number;
  created_at: string;
  is_public: boolean;
  tags: string[];
}

export interface Duel {
  id: string;
  challenger_id: string;
  challenger_username: string;
  opponent_id: string;
  opponent_username: string;
  ghost_run_id: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined' | 'expired';
  challenger_score?: number;
  opponent_score?: number;
  winner_id?: string;
  winner_username?: string;
  reward_claimed: boolean;
  created_at: string;
  accepted_at?: string;
  completed_at?: string;
  expires_at: string;
}

export interface DuelHistory {
  id: string;
  duel_id: string;
  player_id: string;
  player_username: string;
  score: number;
  run_data: any;
  duration_ms: number;
  created_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
  prize_pool: any;
  participants_count: number;
  created_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string;
  username: string;
  total_duels_won: number;
  total_duels_played: number;
  win_streak: number;
  highest_score: number;
  joined_at: string;
}

export interface DuelStats {
  total_duels: number;
  duels_won: number;
  win_rate: number;
  current_streak: number;
  longest_streak: number;
  average_score: number;
}

class PvPService {
  // Ghost Run Management
  async createGhostRun(
    userId: string,
    username: string,
    score: number,
    runData: any,
    durationMs: number,
    isPublic: boolean = false,
    tags: string[] = []
  ): Promise<GhostRun | null> {
    try {
      const { data, error } = await supabase
        .from('ghost_runs')
        .insert({
          user_id: userId,
          username,
          score,
          run_data: runData,
          duration_ms: durationMs,
          is_public: isPublic,
          tags
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating ghost run:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating ghost run:', error);
      return null;
    }
  }

  async getGhostRun(runId: string): Promise<GhostRun | null> {
    try {
      const { data, error } = await supabase
        .from('ghost_runs')
        .select('*')
        .eq('id', runId)
        .single();

      if (error) {
        console.error('Error fetching ghost run:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching ghost run:', error);
      return null;
    }
  }

  async getPublicGhostRuns(limit: number = 20): Promise<GhostRun[]> {
    try {
      const { data, error } = await supabase
        .from('ghost_runs')
        .select('*')
        .eq('is_public', true)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching public ghost runs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching public ghost runs:', error);
      return [];
    }
  }

  async getUserGhostRuns(userId: string): Promise<GhostRun[]> {
    try {
      const { data, error } = await supabase
        .from('ghost_runs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user ghost runs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user ghost runs:', error);
      return [];
    }
  }

  // Duel Management
  async createDuel(
    challengerId: string,
    challengerUsername: string,
    opponentId: string,
    opponentUsername: string,
    ghostRunId: string
  ): Promise<Duel | null> {
    try {
      const { data, error } = await supabase
        .rpc('create_duel', {
          challenger_id_param: challengerId,
          challenger_username_param: challengerUsername,
          opponent_id_param: opponentId,
          opponent_username_param: opponentUsername,
          ghost_run_id_param: ghostRunId
        });

      if (error) {
        console.error('Error creating duel:', error);
        return null;
      }

      // Fetch the created duel
      const { data: duel, error: fetchError } = await supabase
        .from('duels')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) {
        console.error('Error fetching created duel:', fetchError);
        return null;
      }

      return duel;
    } catch (error) {
      console.error('Error creating duel:', error);
      return null;
    }
  }

  async getDuel(duelId: string): Promise<Duel | null> {
    try {
      const { data, error } = await supabase
        .from('duels')
        .select('*')
        .eq('id', duelId)
        .single();

      if (error) {
        console.error('Error fetching duel:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching duel:', error);
      return null;
    }
  }

  async getUserDuels(userId: string): Promise<Duel[]> {
    try {
      const { data, error } = await supabase
        .from('duels')
        .select('*')
        .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user duels:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user duels:', error);
      return [];
    }
  }

  async acceptDuel(duelId: string, opponentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('duels')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', duelId)
        .eq('opponent_id', opponentId);

      if (error) {
        console.error('Error accepting duel:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error accepting duel:', error);
      return false;
    }
  }

  async declineDuel(duelId: string, opponentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('duels')
        .update({
          status: 'declined'
        })
        .eq('id', duelId)
        .eq('opponent_id', opponentId);

      if (error) {
        console.error('Error declining duel:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error declining duel:', error);
      return false;
    }
  }

  async completeDuel(
    duelId: string,
    opponentScore: number,
    opponentRunData: any,
    durationMs: number
  ): Promise<boolean> {
    try {
      // Get the duel to determine winner
      const duel = await this.getDuel(duelId);
      if (!duel) return false;

      const challengerScore = duel.challenger_score || 0;
      const winnerId = opponentScore > challengerScore ? duel.opponent_id : duel.challenger_id;
      const winnerUsername = opponentScore > challengerScore ? duel.opponent_username : duel.challenger_username;

      // Update duel with results
      const { error: duelError } = await supabase
        .from('duels')
        .update({
          status: 'completed',
          opponent_score: opponentScore,
          winner_id: winnerId,
          winner_username: winnerUsername,
          completed_at: new Date().toISOString()
        })
        .eq('id', duelId);

      if (duelError) {
        console.error('Error completing duel:', duelError);
        return false;
      }

      // Add to duel history
      const { error: historyError } = await supabase
        .from('duel_history')
        .insert({
          duel_id: duelId,
          player_id: duel.opponent_id,
          player_username: duel.opponent_username,
          score: opponentScore,
          run_data: opponentRunData,
          duration_ms: durationMs
        });

      if (historyError) {
        console.error('Error adding duel history:', historyError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error completing duel:', error);
      return false;
    }
  }

  async getDuelStats(userId: string): Promise<DuelStats | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_duel_stats', {
          user_id_param: userId
        });

      if (error) {
        console.error('Error fetching duel stats:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching duel stats:', error);
      return null;
    }
  }

  // Tournament Management
  async getActiveTournaments(): Promise<Tournament[]> {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['upcoming', 'active'])
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching active tournaments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching active tournaments:', error);
      return [];
    }
  }

  async getTournament(tournamentId: string): Promise<Tournament | null> {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error) {
        console.error('Error fetching tournament:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching tournament:', error);
      return null;
    }
  }

  async joinTournament(tournamentId: string, userId: string, username: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: userId,
          username
        });

      if (error) {
        console.error('Error joining tournament:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error joining tournament:', error);
      return false;
    }
  }

  async getTournamentParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('total_duels_won', { ascending: false });

      if (error) {
        console.error('Error fetching tournament participants:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching tournament participants:', error);
      return [];
    }
  }

  // Utility functions
  async searchUsers(query: string): Promise<{ id: string; username: string }[]> {
    try {
      // This would typically search your user database
      // For now, we'll return a mock implementation
      const { data, error } = await supabase
        .from('game_data')
        .select('user_id, pi_username')
        .ilike('pi_username', `%${query}%`)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data?.map(item => ({
        id: item.user_id,
        username: item.pi_username || 'Anonymous'
      })) || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // Record game run data for ghost mode
  recordGameRun(
    flapTimestamps: number[],
    birdPositions: { x: number; y: number }[],
    pipePositions: { x: number; y: number; gap_y: number }[],
    durationMs: number
  ) {
    return {
      flap_timestamps: flapTimestamps,
      bird_positions: birdPositions,
      pipe_positions: pipePositions,
      duration_ms: durationMs
    };
  }

  // Replay ghost run data
  replayGhostRun(runData: any, onFrame: (frame: any) => void) {
    const { flap_timestamps, bird_positions, pipe_positions } = runData;
    
    let currentFrame = 0;
    const totalFrames = bird_positions.length;
    
    const replayInterval = setInterval(() => {
      if (currentFrame >= totalFrames) {
        clearInterval(replayInterval);
        return;
      }

      const frame = {
        birdPosition: bird_positions[currentFrame],
        pipePositions: pipe_positions.filter((pipe: any) => pipe.x > -100),
        flapTimestamps: flap_timestamps.filter((timestamp: number) => timestamp <= currentFrame * 16.67) // 60fps
      };

      onFrame(frame);
      currentFrame++;
    }, 16.67); // 60fps

    return () => clearInterval(replayInterval);
  }
}

export const pvpService = new PvPService(); 