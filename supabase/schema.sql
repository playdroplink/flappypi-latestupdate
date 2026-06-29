-- Supabase schema for Flappy Pi game data storage
-- Run this in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- ===== RESERVE AND CONNECT FLAPPY SCHEMA =====

-- Create user_reserves table for username reservations
CREATE TABLE IF NOT EXISTS user_reserves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  pi_uid TEXT NOT NULL,
  reserve_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_reserves
CREATE INDEX IF NOT EXISTS idx_user_reserves_username ON user_reserves(username);
CREATE INDEX IF NOT EXISTS idx_user_reserves_pi_uid ON user_reserves(pi_uid);
CREATE INDEX IF NOT EXISTS idx_user_reserves_active ON user_reserves(is_active);

-- Enable RLS on user_reserves
ALTER TABLE user_reserves ENABLE ROW LEVEL SECURITY;

-- Create policies for user_reserves
CREATE POLICY "Allow users to manage their own reserves" ON user_reserves
  FOR ALL USING (pi_uid = auth.uid()::text::text);

-- Create user_profiles table for Flappy connections
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  pi_uid TEXT NOT NULL UNIQUE,
  is_connected BOOLEAN DEFAULT false,
  is_reserved BOOLEAN DEFAULT false,
  reserve_date TIMESTAMP WITH TIME ZONE,
  connect_date TIMESTAMP WITH TIME ZONE,
  connection_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_pi_uid ON user_profiles(pi_uid);
CREATE INDEX IF NOT EXISTS idx_user_profiles_connected ON user_profiles(is_connected);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(connection_status);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Allow users to manage their own profiles" ON user_profiles
  FOR ALL USING (pi_uid = auth.uid()::text);

-- Create game_states table for tracking game progress
CREATE TABLE IF NOT EXISTS game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  high_score INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  total_coins INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for game_states
CREATE INDEX IF NOT EXISTS idx_game_states_user_id ON game_states(user_id);
CREATE INDEX IF NOT EXISTS idx_game_states_high_score ON game_states(high_score DESC);
CREATE INDEX IF NOT EXISTS idx_game_states_last_played ON game_states(last_played DESC);

-- Enable RLS on game_states
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- Create policies for game_states
CREATE POLICY "Allow users to manage their own game states" ON game_states
  FOR ALL USING (user_id = auth.uid()::text);

-- Create trigger to automatically update updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically update updated_at on game_states
CREATE TRIGGER update_game_states_updated_at 
  BEFORE UPDATE ON game_states 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions for new tables
GRANT ALL ON user_reserves TO authenticated;
GRANT ALL ON user_reserves TO anon;

GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO anon;

GRANT ALL ON game_states TO authenticated;
GRANT ALL ON game_states TO anon;

-- ===== PAYMENT SHOP INVENTORY SCHEMA =====

-- Create user_inventory table for items purchased via payment shop
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL, -- 'game_lives', 'premium_skin', 'subscription', 'coins'
  item_id TEXT,
  quantity INTEGER DEFAULT 1,
  rarity TEXT DEFAULT 'common',
  payment_id TEXT,
  txid TEXT,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_inventory
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_type ON user_inventory(item_type);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_id ON user_inventory(item_id);

-- Enable RLS on user_inventory
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

-- Create policies for user_inventory
CREATE POLICY "Allow users to manage their own inventory" ON user_inventory
  FOR ALL USING (user_id = auth.uid()::text);

-- Create user_subscriptions table for subscription management
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL, -- 'monthly', 'yearly'
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_id TEXT,
  txid TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON user_subscriptions(end_date);

-- Enable RLS on user_subscriptions
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_subscriptions
CREATE POLICY "Allow users to manage their own subscriptions" ON user_subscriptions
  FOR ALL USING (user_id = auth.uid()::text);

-- Create user_wallets table for coin balance management
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  coin_balance INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_wallets
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);

-- Enable RLS on user_wallets
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

-- Create policies for user_wallets
CREATE POLICY "Allow users to manage their own wallets" ON user_wallets
  FOR ALL USING (user_id = auth.uid()::text);

-- Create coin_transactions table for transaction history
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'purchase', 'reward', 'spend'
  payment_id TEXT,
  txid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for coin_transactions
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON coin_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON coin_transactions(created_at DESC);

-- Enable RLS on coin_transactions
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for coin_transactions
CREATE POLICY "Allow users to view their own transactions" ON coin_transactions
  FOR SELECT USING (user_id = auth.uid()::text);

-- Create trigger to automatically update updated_at on user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON user_subscriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions for payment shop tables
GRANT ALL ON user_inventory TO authenticated;
GRANT ALL ON user_inventory TO anon;

GRANT ALL ON user_subscriptions TO authenticated;
GRANT ALL ON user_subscriptions TO anon;

GRANT ALL ON user_wallets TO authenticated;
GRANT ALL ON user_wallets TO anon;

GRANT ALL ON coin_transactions TO authenticated;
GRANT ALL ON coin_transactions TO anon; 

-- ===== PvP DUEL SYSTEM SCHEMA =====

-- Create ghost runs table to store recorded gameplay data
CREATE TABLE IF NOT EXISTS ghost_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  FOR ALL USING (user_id = auth.uid()::text::text OR is_anonymous = true);

-- Create RLS policies for duels
CREATE POLICY "Users can view duels they're involved in" ON duels
  FOR SELECT USING (challenger_id = auth.uid()::text::text OR opponent_id = auth.uid()::text::text);

CREATE POLICY "Users can create duels" ON duels
  FOR INSERT WITH CHECK (challenger_id = auth.uid()::text::text);

CREATE POLICY "Users can update duels they're involved in" ON duels
  FOR UPDATE USING (challenger_id = auth.uid()::text::text OR opponent_id = auth.uid()::text::text);

-- Create RLS policies for duel_history
CREATE POLICY "Users can view duel history they're involved in" ON duel_history
  FOR SELECT USING (player_id = auth.uid()::text::text);

-- Create RLS policies for tournaments
CREATE POLICY "Anyone can view tournaments" ON tournaments
  FOR SELECT USING (true);

CREATE POLICY "Users can view tournament participants" ON tournament_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join tournaments" ON tournament_participants
  FOR INSERT WITH CHECK (user_id = auth.uid()::text::text);

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

-- Function to update duel result
CREATE OR REPLACE FUNCTION update_duel_result(
  duel_id_param UUID,
  winner_id_param TEXT,
  challenger_score_param INTEGER,
  opponent_score_param INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE duels
  SET 
    winner_id = winner_id_param,
    challenger_score = challenger_score_param,
    opponent_score = opponent_score_param,
    status = 'completed',
    completed_at = NOW()
  WHERE id = duel_id_param;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql; 