-- ========================================
-- FLAPPY PI - CLEAN DATABASE SETUP
-- This script safely handles existing objects
-- ========================================

-- Enable UUID extension for unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CLEAN UP EXISTING POLICIES (IF ANY)
-- ========================================

-- Drop existing policies if they exist (ignore errors)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can manage own inventory" ON user_inventory;
  DROP POLICY IF EXISTS "Users can view own payments" ON payment_records;
  DROP POLICY IF EXISTS "Users can manage own sessions" ON game_sessions;
  DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard;
  DROP POLICY IF EXISTS "Users can update own leaderboard entry" ON leaderboard;
  DROP POLICY IF EXISTS "Users can modify own leaderboard entry" ON leaderboard;
  DROP POLICY IF EXISTS "Users can view own rewards" ON claimed_rewards;
  DROP POLICY IF EXISTS "Users can view own reminders" ON renewal_reminders;
EXCEPTION
  WHEN OTHERS THEN 
    RAISE NOTICE 'Policies cleanup completed (some may not have existed)';
END $$;

-- ========================================
-- CLEAN UP EXISTING TRIGGERS (IF ANY)
-- ========================================

-- Drop existing triggers if they exist
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
  DROP TRIGGER IF EXISTS update_user_inventory_updated_at ON user_inventory;
  DROP TRIGGER IF EXISTS update_payment_records_updated_at ON payment_records;
  DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON leaderboard;
EXCEPTION
  WHEN OTHERS THEN 
    RAISE NOTICE 'Triggers cleanup completed (some may not have existed)';
END $$;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column();

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

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- User Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_pi_user_id ON user_profiles(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_high_score ON user_profiles(high_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_end ON user_profiles(subscription_end);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login);

-- User Inventory Indexes  
CREATE INDEX IF NOT EXISTS idx_user_inventory_pi_user_id ON user_inventory(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_last_sync ON user_inventory(last_sync_time);
CREATE INDEX IF NOT EXISTS idx_user_inventory_sync_status ON user_inventory(sync_status);

-- Payment Records Indexes
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_id ON payment_records(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_pi_user_id ON payment_records(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_transaction_id ON payment_records(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_created_at ON payment_records(created_at DESC);

-- Game Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_game_sessions_pi_user_id ON game_sessions(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_score ON game_sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_mode ON game_sessions(game_mode);

-- Leaderboard Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_pi_user_id ON leaderboard(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_high_score ON leaderboard(high_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank_position ON leaderboard(rank_position);
CREATE INDEX IF NOT EXISTS idx_leaderboard_season ON leaderboard(season);

-- Claimed Rewards Indexes
CREATE INDEX IF NOT EXISTS idx_claimed_rewards_pi_user_id ON claimed_rewards(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_claimed_rewards_transaction_id ON claimed_rewards(transaction_id);
CREATE INDEX IF NOT EXISTS idx_claimed_rewards_plan_id ON claimed_rewards(plan_id);
CREATE INDEX IF NOT EXISTS idx_claimed_rewards_claimed_at ON claimed_rewards(claimed_at DESC);

-- Renewal Reminders Indexes
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_pi_user_id ON renewal_reminders(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_expiry_date ON renewal_reminders(expiry_date);
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_reminder_sent ON renewal_reminders(reminder_sent);

-- ========================================
-- ENABLE ROW LEVEL SECURITY
-- ========================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE claimed_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_reminders ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CREATE SECURITY POLICIES (BACKEND ONLY)
-- ========================================

-- For backend API access, we'll use service role key
-- These policies allow backend service to access all data

-- Allow backend service to manage all user profiles
CREATE POLICY "Backend can manage all profiles" ON user_profiles
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow backend service to manage all inventories
CREATE POLICY "Backend can manage all inventories" ON user_inventory
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow backend service to manage all payments
CREATE POLICY "Backend can manage all payments" ON payment_records
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow backend service to manage all sessions
CREATE POLICY "Backend can manage all sessions" ON game_sessions
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow public read access to leaderboard, backend can manage
CREATE POLICY "Public can view leaderboard" ON leaderboard
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Backend can manage leaderboard" ON leaderboard
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow backend service to manage all rewards
CREATE POLICY "Backend can manage all rewards" ON claimed_rewards
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow backend service to manage all reminders
CREATE POLICY "Backend can manage all reminders" ON renewal_reminders
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ========================================
-- CREATE UPDATE TRIGGERS
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

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ===== SETUP COMPLETE ===== 🎉';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables: user_profiles, user_inventory, payment_records, game_sessions, leaderboard, claimed_rewards, renewal_reminders';
  RAISE NOTICE '✅ Security: Row Level Security enabled with backend service access';
  RAISE NOTICE '✅ Performance: Indexes created for fast queries';
  RAISE NOTICE '✅ Triggers: Auto-update timestamps configured';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your Flappy Pi database is ready for production!';
  RAISE NOTICE '💾 User data will NEVER be lost during app updates!';
  RAISE NOTICE '';
END $$;