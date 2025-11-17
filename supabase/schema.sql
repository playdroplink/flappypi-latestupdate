-- Supabase schema for Flappy Pi game data storage
-- Run this in your Supabase SQL editor

-- Create the game_data table
CREATE TABLE IF NOT EXISTS game_data (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_anonymous BOOLEAN DEFAULT true,
  pi_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_data_user_id ON game_data(user_id);
CREATE INDEX IF NOT EXISTS idx_game_data_anonymous ON game_data(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_game_data_updated_at ON game_data(updated_at);

-- Create unique constraint on user_id to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_data_unique_user ON game_data(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE game_data ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous users
CREATE POLICY "Allow anonymous users to manage their own data" ON game_data
  FOR ALL USING (is_anonymous = true);

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to manage their own data" ON game_data
  FOR ALL USING (is_anonymous = false);

-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_game_data_updated_at 
  BEFORE UPDATE ON game_data 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create a view for analytics (optional)
CREATE OR REPLACE VIEW game_analytics AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_anonymous = false THEN 1 END) as pi_users,
  COUNT(CASE WHEN is_anonymous = true THEN 1 END) as anonymous_users,
  AVG((data->>'coins')::numeric) as avg_coins,
  MAX((data->>'highScore')::integer) as max_high_score,
  MAX(updated_at) as last_activity
FROM game_data;

-- Create the public_scores table for leaderboard
CREATE TABLE IF NOT EXISTS public_scores (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Add an index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_public_scores_score ON public_scores(score DESC);

-- Grant necessary permissions
GRANT ALL ON game_data TO authenticated;
GRANT ALL ON game_data TO anon;
GRANT USAGE ON SEQUENCE game_data_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE game_data_id_seq TO anon; 

-- Grant permissions
GRANT ALL ON public_scores TO authenticated;
GRANT ALL ON public_scores TO anon;
GRANT USAGE ON SEQUENCE public_scores_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public_scores_id_seq TO anon; 

-- ===== PvP DUEL SYSTEM SCHEMA =====

-- Create ghost runs table to store recorded gameplay data
CREATE TABLE IF NOT EXISTS ghost_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  score INTEGER NOT NULL,
  run_data JSONB NOT NULL, -- Contains flap timestamps, positions, etc.
  duration_ms INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}'
);

-- Create duels table for challenge requests and results
CREATE TABLE IF NOT EXISTS duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id TEXT NOT NULL,
  challenger_username TEXT NOT NULL,
  opponent_id TEXT NOT NULL,
  opponent_username TEXT NOT NULL,
  ghost_run_id UUID REFERENCES ghost_runs(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'declined', 'expired')),
  challenger_score INTEGER,
  opponent_score INTEGER,
  winner_id TEXT,
  winner_username TEXT,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create duel history table for detailed records
CREATE TABLE IF NOT EXISTS duel_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duel_id UUID REFERENCES duels(id),
  player_id TEXT NOT NULL,
  player_username TEXT NOT NULL,
  score INTEGER NOT NULL,
  run_data JSONB NOT NULL,
  duration_ms INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournament table for weekly competitions
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  prize_pool JSONB DEFAULT '{}',
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournament participants table
CREATE TABLE IF NOT EXISTS tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  total_duels_won INTEGER DEFAULT 0,
  total_duels_played INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ghost_runs_user_id ON ghost_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_ghost_runs_score ON ghost_runs(score DESC);
CREATE INDEX IF NOT EXISTS idx_ghost_runs_created_at ON ghost_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ghost_runs_public ON ghost_runs(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_duels_challenger ON duels(challenger_id);
CREATE INDEX IF NOT EXISTS idx_duels_opponent ON duels(opponent_id);
CREATE INDEX IF NOT EXISTS idx_duels_status ON duels(status);
CREATE INDEX IF NOT EXISTS idx_duels_created_at ON duels(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_duel_history_duel_id ON duel_history(duel_id);
CREATE INDEX IF NOT EXISTS idx_duel_history_player_id ON duel_history(player_id);

CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_dates ON tournaments(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user ON tournament_participants(user_id);

-- Enable RLS on new tables
ALTER TABLE ghost_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ghost_runs
CREATE POLICY "Users can view public ghost runs" ON ghost_runs
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage their own ghost runs" ON ghost_runs
  FOR ALL USING (user_id = auth.uid()::text OR is_anonymous = true);

-- Create RLS policies for duels
CREATE POLICY "Users can view duels they're involved in" ON duels
  FOR SELECT USING (challenger_id = auth.uid()::text OR opponent_id = auth.uid()::text);

CREATE POLICY "Users can create duels" ON duels
  FOR INSERT WITH CHECK (challenger_id = auth.uid()::text);

CREATE POLICY "Users can update duels they're involved in" ON duels
  FOR UPDATE USING (challenger_id = auth.uid()::text OR opponent_id = auth.uid()::text);

-- Create RLS policies for duel_history
CREATE POLICY "Users can view duel history they're involved in" ON duel_history
  FOR SELECT USING (player_id = auth.uid()::text);

-- Create RLS policies for tournaments
CREATE POLICY "Anyone can view tournaments" ON tournaments
  FOR SELECT USING (true);

CREATE POLICY "Users can view tournament participants" ON tournament_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join tournaments" ON tournament_participants
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Grant permissions
GRANT ALL ON ghost_runs TO authenticated;
GRANT ALL ON ghost_runs TO anon;
GRANT ALL ON duels TO authenticated;
GRANT ALL ON duels TO anon;
GRANT ALL ON duel_history TO authenticated;
GRANT ALL ON duel_history TO anon;
GRANT ALL ON tournaments TO authenticated;
GRANT ALL ON tournaments TO anon;
GRANT ALL ON tournament_participants TO authenticated;
GRANT ALL ON tournament_participants TO anon;

-- Create functions for PvP system
CREATE OR REPLACE FUNCTION get_user_duel_stats(user_id_param TEXT)
RETURNS TABLE(
  total_duels INTEGER,
  duels_won INTEGER,
  win_rate NUMERIC,
  current_streak INTEGER,
  longest_streak INTEGER,
  average_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH duel_stats AS (
    SELECT 
      COUNT(*) as total_duels,
      COUNT(CASE WHEN winner_id = user_id_param THEN 1 END) as duels_won,
      AVG(CASE WHEN challenger_id = user_id_param THEN challenger_score ELSE opponent_score END) as avg_score
    FROM duels 
    WHERE (challenger_id = user_id_param OR opponent_id = user_id_param)
    AND status = 'completed'
  )
  SELECT 
    ds.total_duels,
    ds.duels_won,
    CASE WHEN ds.total_duels > 0 THEN (ds.duels_won::NUMERIC / ds.total_duels * 100) ELSE 0 END as win_rate,
    0 as current_streak, -- TODO: Implement streak calculation
    0 as longest_streak, -- TODO: Implement longest streak calculation
    COALESCE(ds.avg_score, 0) as average_score
  FROM duel_stats ds;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new duel
CREATE OR REPLACE FUNCTION create_duel(
  challenger_id_param TEXT,
  challenger_username_param TEXT,
  opponent_id_param TEXT,
  opponent_username_param TEXT,
  ghost_run_id_param UUID
)
RETURNS UUID AS $$
DECLARE
  new_duel_id UUID;
BEGIN
  INSERT INTO duels (
    challenger_id, 
    challenger_username, 
    opponent_id, 
    opponent_username, 
    ghost_run_id
  ) VALUES (
    challenger_id_param,
    challenger_username_param,
    opponent_id_param,
    opponent_username_param,
    ghost_run_id_param
  ) RETURNING id INTO new_duel_id;
  
  RETURN new_duel_id;
END;
$$ LANGUAGE plpgsql; 