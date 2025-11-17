-- ========================================
-- FLAPPY PI COMPREHENSIVE DATABASE SCHEMA
-- Complete cloud storage setup for all game data
-- ========================================

-- Enable UUID extension for unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- ========================================
-- USER PROFILES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT UNIQUE NOT NULL,
  username VARCHAR(255),
  email VARCHAR(255),
  wallet_address VARCHAR(255),
  
  -- Game Statistics
  total_score BIGINT DEFAULT 0,
  high_score BIGINT DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  coins_earned BIGINT DEFAULT 0,
  coins_spent BIGINT DEFAULT 0,
  
  -- Subscription Information
  subscription_status VARCHAR(50) DEFAULT 'none',
  subscription_plan VARCHAR(50),
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  
  -- Account Information
  last_login TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  account_status VARCHAR(50) DEFAULT 'active',
  preferences JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_pi_user_id ON user_profiles(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_high_score ON user_profiles(high_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_end ON user_profiles(subscription_end);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login);

-- ========================================
-- USER INVENTORY TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT UNIQUE NOT NULL,
  items JSONB DEFAULT '[]',
  
  -- Sync Information
  last_sync_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  sync_status VARCHAR(50) DEFAULT 'pending',
  sync_version INTEGER DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE
);

-- Indexes for user_inventory
CREATE INDEX IF NOT EXISTS idx_user_inventory_pi_user_id ON user_inventory(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_last_sync ON user_inventory(last_sync_time);
CREATE INDEX IF NOT EXISTS idx_user_inventory_sync_status ON user_inventory(sync_status);

-- ========================================
-- PAYMENT RECORDS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id VARCHAR(255) UNIQUE NOT NULL,
  pi_user_id TEXT NOT NULL,
  
  -- Payment Information
  amount DECIMAL(20, 8) NOT NULL,
  currency VARCHAR(10) DEFAULT 'PI',
  memo TEXT,
  
  -- Transaction Information
  status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(255),
  from_address VARCHAR(255),
  to_address VARCHAR(255),
  
  -- Payment Metadata
  payment_type VARCHAR(50) DEFAULT 'purchase',
  item_type VARCHAR(50),
  item_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  
  -- Processing Information
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE
);

-- Indexes for payment_records
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_id ON payment_records(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_pi_user_id ON payment_records(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_transaction_id ON payment_records(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_created_at ON payment_records(created_at DESC);

-- ========================================
-- GAME SESSIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT NOT NULL,
  
  -- Session Information
  score INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  pipes_passed INTEGER DEFAULT 0,
  
  -- Game Data
  game_mode VARCHAR(50) DEFAULT 'normal',
  difficulty_level VARCHAR(50) DEFAULT 'medium',
  power_ups_used JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  
  -- Session Metadata
  session_start TIMESTAMPTZ,
  session_end TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  device_info JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE
);

-- Indexes for game_sessions
CREATE INDEX IF NOT EXISTS idx_game_sessions_pi_user_id ON game_sessions(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_score ON game_sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_mode ON game_sessions(game_mode);

-- ========================================
-- LEADERBOARD TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  
  -- Score Information
  high_score BIGINT NOT NULL DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  average_score DECIMAL(10, 2) DEFAULT 0,
  
  -- Ranking Information
  rank_position INTEGER,
  rank_change INTEGER DEFAULT 0,
  season VARCHAR(50) DEFAULT 'global',
  
  -- Achievement Information
  achievements_count INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  
  -- Timestamps
  last_score_update TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE
);

-- Indexes for leaderboard
CREATE INDEX IF NOT EXISTS idx_leaderboard_pi_user_id ON leaderboard(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_high_score ON leaderboard(high_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank_position ON leaderboard(rank_position);
CREATE INDEX IF NOT EXISTS idx_leaderboard_season ON leaderboard(season);

-- ========================================
-- CLAIMED REWARDS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS claimed_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT NOT NULL,
  
  -- Reward Information
  plan_id VARCHAR(100) NOT NULL,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  reward_count INTEGER NOT NULL DEFAULT 0,
  rewards_data JSONB NOT NULL DEFAULT '[]',
  
  -- Claim Information
  claim_status VARCHAR(50) DEFAULT 'completed',
  claim_method VARCHAR(50) DEFAULT 'subscription',
  
  -- Timestamps
  claimed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE
);

-- Indexes for claimed_rewards
CREATE INDEX IF NOT EXISTS idx_claimed_rewards_pi_user_id ON claimed_rewards(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_claimed_rewards_transaction_id ON claimed_rewards(transaction_id);
CREATE INDEX IF NOT EXISTS idx_claimed_rewards_plan_id ON claimed_rewards(plan_id);
CREATE INDEX IF NOT EXISTS idx_claimed_rewards_claimed_at ON claimed_rewards(claimed_at DESC);

-- ========================================
-- RENEWAL REMINDERS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS renewal_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT NOT NULL,
  subscription_id UUID,
  
  -- Reminder Information
  expiry_date TIMESTAMPTZ NOT NULL,
  reminder_type VARCHAR(50) DEFAULT 'subscription_expiry',
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  -- Notification Details
  notification_method VARCHAR(50) DEFAULT 'in_app',
  message TEXT,
  
  -- Timestamps
  reminder_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate reminders
  UNIQUE(pi_user_id, expiry_date, reminder_type)
);

-- Indexes for renewal_reminders
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_pi_user_id ON renewal_reminders(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_expiry_date ON renewal_reminders(expiry_date);
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_reminder_sent ON renewal_reminders(reminder_sent);

-- ========================================
-- ACHIEVEMENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT NOT NULL,
  
  -- Achievement Information
  achievement_id VARCHAR(255) NOT NULL,
  achievement_name VARCHAR(255) NOT NULL,
  achievement_description TEXT,
  achievement_type VARCHAR(50) DEFAULT 'score',
  
  -- Progress Information
  current_progress INTEGER DEFAULT 0,
  required_progress INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  completion_percentage DECIMAL(5, 2) DEFAULT 0,
  
  -- Reward Information
  reward_coins INTEGER DEFAULT 0,
  reward_items JSONB DEFAULT '[]',
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate achievements
  UNIQUE(pi_user_id, achievement_id)
);

-- Indexes for achievements
CREATE INDEX IF NOT EXISTS idx_achievements_pi_user_id ON achievements(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_achievement_id ON achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievements_is_completed ON achievements(is_completed);
CREATE INDEX IF NOT EXISTS idx_achievements_completed_at ON achievements(completed_at DESC);

-- ========================================
-- ANALYTICS EVENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT,
  
  -- Event Information
  event_name VARCHAR(255) NOT NULL,
  event_category VARCHAR(100) NOT NULL,
  event_action VARCHAR(100),
  event_label VARCHAR(255),
  
  -- Event Data
  event_value DECIMAL(20, 8),
  properties JSONB DEFAULT '{}',
  
  -- Session Information
  session_id UUID,
  device_info JSONB DEFAULT '{}',
  
  -- Timestamps
  event_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE SET NULL
);

-- Indexes for analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_pi_user_id ON analytics_events(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_timestamp ON analytics_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE claimed_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own inventory" ON user_inventory
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own payment records" ON payment_records
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own game sessions" ON game_sessions
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true));

-- Leaderboard is public for reading, but only owner can update
CREATE POLICY "Anyone can view leaderboard" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Users can update own leaderboard entry" ON leaderboard
  FOR INSERT WITH CHECK (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can modify own leaderboard entry" ON leaderboard
  FOR UPDATE USING (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own claimed rewards" ON claimed_rewards
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own renewal reminders" ON renewal_reminders
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own achievements" ON achievements
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own analytics events" ON analytics_events
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true));

-- ========================================
-- FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_inventory_updated_at
  BEFORE UPDATE ON user_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_records_updated_at
  BEFORE UPDATE ON payment_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at
  BEFORE UPDATE ON leaderboard
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate leaderboard rankings
CREATE OR REPLACE FUNCTION update_leaderboard_rankings()
RETURNS VOID AS $$
BEGIN
  -- Update rank positions based on high scores
  WITH ranked_scores AS (
    SELECT 
      pi_user_id,
      ROW_NUMBER() OVER (ORDER BY high_score DESC, last_score_update ASC) as new_rank
    FROM leaderboard
    WHERE high_score > 0
  )
  UPDATE leaderboard
  SET 
    rank_change = COALESCE(rank_position - ranked_scores.new_rank, 0),
    rank_position = ranked_scores.new_rank
  FROM ranked_scores
  WHERE leaderboard.pi_user_id = ranked_scores.pi_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old analytics events (for performance)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events()
RETURNS VOID AS $$
BEGIN
  -- Delete events older than 90 days
  DELETE FROM analytics_events
  WHERE event_timestamp < CURRENT_TIMESTAMP - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- INITIAL DATA AND CONFIGURATION
-- ========================================

-- Insert default achievement definitions
INSERT INTO achievements (achievement_id, achievement_name, achievement_description, achievement_type, required_progress, reward_coins, pi_user_id)
VALUES 
  -- Global achievements (for reference only - will be copied per user)
  ('first_flight', 'First Flight', 'Complete your first game', 'milestone', 1, 10, 'system'),
  ('score_100', 'Century Club', 'Score 100 points in a single game', 'score', 100, 50, 'system'),
  ('score_500', 'High Flyer', 'Score 500 points in a single game', 'score', 500, 100, 'system'),
  ('score_1000', 'Sky Master', 'Score 1000 points in a single game', 'score', 1000, 250, 'system'),
  ('games_10', 'Dedicated Player', 'Play 10 games', 'persistence', 10, 25, 'system'),
  ('games_50', 'Veteran Flyer', 'Play 50 games', 'persistence', 50, 100, 'system'),
  ('games_100', 'Flying Legend', 'Play 100 games', 'persistence', 100, 250, 'system'),
  ('coins_1000', 'Coin Collector', 'Collect 1000 coins total', 'collection', 1000, 50, 'system'),
  ('powerup_master', 'Power-up Master', 'Use 50 power-ups', 'collection', 50, 75, 'system')
ON CONFLICT (pi_user_id, achievement_id) DO NOTHING;

-- ========================================
-- DATABASE SETUP COMPLETE
-- ========================================

-- Log setup completion
DO $$
BEGIN
  RAISE NOTICE '✅ Flappy Pi database schema setup complete!';
  RAISE NOTICE '📊 Tables created: user_profiles, user_inventory, payment_records, game_sessions, leaderboard, claimed_rewards, renewal_reminders, achievements, analytics_events';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '⚡ Indexes and triggers configured for optimal performance';
  RAISE NOTICE '🏆 Achievement system initialized';
  RAISE NOTICE '📈 Analytics tracking enabled';
  RAISE NOTICE '🚀 Ready for production use!';
END $$;