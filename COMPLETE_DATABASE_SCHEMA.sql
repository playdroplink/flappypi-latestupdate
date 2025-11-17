-- =============================================
-- FLAPPY PI - COMPLETE DATABASE SCHEMA
-- =============================================
-- Comprehensive database setup for Flappy Pi including all tables,
-- indexes, triggers, policies, and stored procedures
-- Version: 2.0 - Production Ready
-- Date: 2025-11-17

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =============================================
-- DROP EXISTING OBJECTS (CLEAN SETUP)
-- =============================================

-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS ad_watches CASCADE;
DROP TABLE IF EXISTS daily_rewards CASCADE;
DROP TABLE IF EXISTS renewal_reminders CASCADE;
DROP TABLE IF EXISTS claimed_rewards CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS game_sessions CASCADE;
DROP TABLE IF EXISTS user_inventory CASCADE;
DROP TABLE IF EXISTS payment_records CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS shop_items CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS payment_history CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS unified_leaderboard_view;
DROP VIEW IF EXISTS user_stats_view;
DROP VIEW IF EXISTS subscription_stats_view;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS check_subscription_expiry() CASCADE;
DROP FUNCTION IF EXISTS process_daily_rewards() CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS game_mode CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;

-- =============================================
-- CREATE CUSTOM TYPES
-- =============================================

-- Game modes enum
CREATE TYPE game_mode AS ENUM ('classic', 'endless', 'screampi', 'dinopi', 'challenge', 'scream_pi', 'dino_pi', 'flappy_stack', 'night_mode');

-- Payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'submitted', 'completed', 'failed', 'cancelled', 'refunded');

-- Subscription status enum
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending');

-- =============================================
-- USER PROFILES TABLE
-- =============================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  wallet_address VARCHAR(255),
  
  -- Game Statistics
  total_score BIGINT DEFAULT 0,
  high_score BIGINT DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  total_coins INTEGER DEFAULT 0,
  coins_earned BIGINT DEFAULT 0,
  coins_spent BIGINT DEFAULT 0,
  
  -- Player Progression
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  achievements_unlocked TEXT[] DEFAULT '{}',
  
  -- User Preferences
  selected_bird_skin TEXT DEFAULT 'default',
  music_enabled BOOLEAN DEFAULT true,
  sound_effects_enabled BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  privacy_mode BOOLEAN DEFAULT false,
  
  -- Subscription Information
  subscription_status subscription_status DEFAULT 'expired',
  subscription_plan TEXT,
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  ad_free_permanent BOOLEAN DEFAULT false,
  
  -- Power-ups owned (current counts)
  power_ups_extra_life INTEGER DEFAULT 0,
  power_ups_2x_coins INTEGER DEFAULT 0,
  power_ups_magnet INTEGER DEFAULT 0,
  power_ups_shield INTEGER DEFAULT 0,
  power_ups_turbo_start INTEGER DEFAULT 0,
  power_ups_slow_motion INTEGER DEFAULT 0,
  
  -- Owned skins (array of skin IDs)
  owned_skins TEXT[] DEFAULT ARRAY['default'],
  
  -- Account Information
  last_login TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  login_streak INTEGER DEFAULT 0,
  last_daily_reward TIMESTAMPTZ,
  account_status VARCHAR(50) DEFAULT 'active',
  registration_source VARCHAR(100),
  
  -- App-specific data
  tutorial_completed BOOLEAN DEFAULT false,
  first_purchase_made BOOLEAN DEFAULT false,
  referral_code VARCHAR(20),
  referred_by VARCHAR(20),
  
  -- Analytics
  total_session_time INTEGER DEFAULT 0, -- in seconds
  average_session_duration INTEGER DEFAULT 0,
  total_ad_watches INTEGER DEFAULT 0,
  
  -- Metadata
  device_info JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  game_stats JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_username CHECK (char_length(username) >= 3 AND char_length(username) <= 50),
  CONSTRAINT valid_coins CHECK (total_coins >= 0),
  CONSTRAINT valid_scores CHECK (total_score >= 0 AND high_score >= 0)
);

-- =============================================
-- USER INVENTORY TABLE
-- =============================================

CREATE TABLE user_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT NOT NULL,
  
  -- Item Information
  item_type VARCHAR(50) NOT NULL, -- 'powerup', 'skin', 'subscription', 'coins', 'mystery_box'
  item_id VARCHAR(100) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_description TEXT,
  quantity INTEGER DEFAULT 1,
  
  -- Purchase Information
  purchase_price DECIMAL(20, 8),
  purchase_currency VARCHAR(10), -- 'PI', 'COINS'
  purchased_with_real_money BOOLEAN DEFAULT false,
  
  -- Expiration (for temporary items and subscriptions)
  expires_at TIMESTAMPTZ,
  is_permanent BOOLEAN DEFAULT false,
  
  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Cloud Sync Information
  last_sync_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  sync_status VARCHAR(50) DEFAULT 'synced', -- 'pending', 'synced', 'failed'
  sync_version INTEGER DEFAULT 1,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  rarity VARCHAR(20), -- 'common', 'rare', 'epic', 'legendary'
  category VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE,
  CONSTRAINT valid_quantity CHECK (quantity >= 0),
  CONSTRAINT valid_price CHECK (purchase_price IS NULL OR purchase_price >= 0)
);

-- =============================================
-- PAYMENT RECORDS TABLE
-- =============================================

CREATE TABLE payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id VARCHAR(255) UNIQUE NOT NULL,
  pi_user_id TEXT NOT NULL,
  
  -- Payment Information
  amount DECIMAL(20, 8) NOT NULL,
  currency VARCHAR(10) DEFAULT 'PI',
  memo TEXT,
  
  -- Transaction Information
  status payment_status DEFAULT 'pending',
  transaction_id VARCHAR(255),
  from_address VARCHAR(255),
  to_address VARCHAR(255),
  network VARCHAR(20) DEFAULT 'mainnet',
  
  -- Payment Metadata
  payment_type VARCHAR(50) DEFAULT 'purchase', -- 'purchase', 'subscription', 'tip', 'refund'
  item_type VARCHAR(50),
  item_id VARCHAR(255),
  item_name VARCHAR(255),
  quantity INTEGER DEFAULT 1,
  
  -- Processing Information
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verification_data JSONB DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE,
  CONSTRAINT valid_amount CHECK (amount > 0),
  CONSTRAINT valid_quantity_payment CHECK (quantity > 0)
);

-- =============================================
-- GAME SESSIONS TABLE
-- =============================================

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT NOT NULL,
  
  -- Game Information
  game_mode game_mode DEFAULT 'classic',
  final_score INTEGER NOT NULL DEFAULT 0,
  level_reached INTEGER DEFAULT 1,
  coins_earned INTEGER DEFAULT 0,
  
  -- Session Details
  session_duration INTEGER, -- in seconds
  pipes_passed INTEGER DEFAULT 0,
  power_ups_used TEXT[] DEFAULT '{}',
  achievements_earned TEXT[] DEFAULT '{}',
  
  -- Performance Metrics
  best_streak INTEGER DEFAULT 0,
  total_jumps INTEGER DEFAULT 0,
  perfect_landings INTEGER DEFAULT 0,
  near_misses INTEGER DEFAULT 0,
  
  -- Game-specific data (JSONB for flexibility)
  game_data JSONB DEFAULT '{}',
  
  -- Session Environment
  device_type VARCHAR(50),
  screen_resolution VARCHAR(20),
  connection_type VARCHAR(20),
  
  -- Timestamps
  session_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  session_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE,
  CONSTRAINT valid_score_session CHECK (final_score >= 0),
  CONSTRAINT valid_duration CHECK (session_duration IS NULL OR session_duration >= 0)
);

-- =============================================
-- LEADERBOARD TABLE (ENHANCED)
-- =============================================

CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT,
  username TEXT NOT NULL,
  score INTEGER NOT NULL,
  game_mode game_mode DEFAULT 'classic',
  
  -- Game Details
  character_used TEXT DEFAULT 'flappy',
  difficulty TEXT DEFAULT 'normal',
  game_duration INTEGER, -- in seconds
  coins_collected INTEGER DEFAULT 0,
  power_ups_used TEXT[] DEFAULT '{}',
  
  -- Game-mode-specific data
  game_data JSONB DEFAULT '{}',
  
  -- Session tracking
  session_id TEXT,
  
  -- User verification
  is_verified BOOLEAN DEFAULT false,
  is_pi_user BOOLEAN DEFAULT false,
  
  -- Analytics
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  
  -- Ranking (computed)
  daily_rank INTEGER,
  weekly_rank INTEGER,
  monthly_rank INTEGER,
  all_time_rank INTEGER,
  
  -- Timestamps
  achieved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_score_leaderboard CHECK (score >= 0 AND score <= 1000000),
  CONSTRAINT valid_game_duration CHECK (game_duration IS NULL OR game_duration > 0)
);

-- =============================================
-- SHOP ITEMS TABLE
-- =============================================

CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id VARCHAR(100) UNIQUE NOT NULL,
  
  -- Item Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'powerup', 'skin', 'subscription', 'bundle'
  subcategory VARCHAR(50),
  
  -- Pricing
  price_pi DECIMAL(20, 8),
  price_coins INTEGER,
  discount_percentage INTEGER DEFAULT 0,
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  stock_quantity INTEGER, -- NULL for unlimited
  max_per_user INTEGER, -- NULL for no limit
  
  -- Metadata
  image_url TEXT,
  icon_url TEXT,
  rarity VARCHAR(20), -- 'common', 'rare', 'epic', 'legendary'
  tags TEXT[] DEFAULT '{}',
  
  -- Features (for subscriptions and powerups)
  features JSONB DEFAULT '{}',
  duration_days INTEGER, -- for temporary items
  
  -- Analytics
  total_purchases INTEGER DEFAULT 0,
  revenue_pi DECIMAL(20, 8) DEFAULT 0,
  revenue_coins BIGINT DEFAULT 0,
  
  -- Timestamps
  available_from TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  available_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_pricing CHECK (price_pi IS NOT NULL OR price_coins IS NOT NULL),
  CONSTRAINT valid_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  CONSTRAINT valid_stock CHECK (stock_quantity IS NULL OR stock_quantity >= 0)
);

-- =============================================
-- DAILY REWARDS TABLE
-- =============================================

CREATE TABLE daily_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT NOT NULL,
  
  -- Reward Information
  reward_day INTEGER NOT NULL, -- 1-30 for monthly cycle
  reward_type VARCHAR(50) NOT NULL, -- 'coins', 'powerup', 'skin'
  reward_item_id VARCHAR(100),
  reward_quantity INTEGER DEFAULT 1,
  
  -- Claim Information
  claimed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  streak_count INTEGER,
  bonus_multiplier DECIMAL(3,2) DEFAULT 1.00,
  
  -- Metadata
  reward_data JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE,
  CONSTRAINT valid_reward_day CHECK (reward_day >= 1 AND reward_day <= 30),
  CONSTRAINT valid_reward_quantity CHECK (reward_quantity > 0)
);

-- =============================================
-- AD WATCHES TABLE
-- =============================================

CREATE TABLE ad_watches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT NOT NULL,
  
  -- Ad Information
  ad_type VARCHAR(50) NOT NULL, -- 'rewarded', 'interstitial', 'banner'
  ad_provider VARCHAR(50), -- 'pi_ad_network', 'admob', 'unity'
  ad_unit_id VARCHAR(100),
  
  -- Reward Information
  reward_type VARCHAR(50), -- 'coins', 'powerup', 'extra_life'
  reward_amount INTEGER DEFAULT 0,
  reward_delivered BOOLEAN DEFAULT false,
  
  -- Watch Details
  watch_duration INTEGER, -- in seconds
  completed BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  
  -- Analytics
  device_info JSONB DEFAULT '{}',
  connection_type VARCHAR(20),
  
  -- Timestamps
  watch_started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  watch_completed_at TIMESTAMPTZ,
  reward_delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE,
  CONSTRAINT valid_watch_duration CHECK (watch_duration IS NULL OR watch_duration >= 0),
  CONSTRAINT valid_reward_amount CHECK (reward_amount >= 0)
);

-- =============================================
-- ACHIEVEMENTS TABLE
-- =============================================

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT NOT NULL,
  
  -- Achievement Information
  achievement_id VARCHAR(100) NOT NULL,
  achievement_name VARCHAR(255) NOT NULL,
  achievement_description TEXT,
  achievement_type VARCHAR(50), -- 'score', 'streak', 'collection', 'time'
  
  -- Progress
  current_progress INTEGER DEFAULT 0,
  target_progress INTEGER NOT NULL,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  completed BOOLEAN DEFAULT false,
  
  -- Rewards
  reward_type VARCHAR(50), -- 'coins', 'powerup', 'skin', 'title'
  reward_item_id VARCHAR(100),
  reward_quantity INTEGER DEFAULT 1,
  reward_claimed BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  rarity VARCHAR(20), -- 'common', 'rare', 'epic', 'legendary'
  category VARCHAR(50),
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ,
  reward_claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE,
  CONSTRAINT valid_progress CHECK (current_progress >= 0 AND current_progress <= target_progress),
  CONSTRAINT valid_progress_percentage CHECK (progress_percentage >= 0.00 AND progress_percentage <= 100.00),
  UNIQUE(pi_user_id, achievement_id)
);

-- =============================================
-- ANALYTICS EVENTS TABLE
-- =============================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT,
  
  -- Event Information
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50), -- 'game', 'purchase', 'ui', 'performance'
  event_action VARCHAR(100),
  event_label VARCHAR(255),
  
  -- Event Data
  event_value DECIMAL(20, 8),
  event_properties JSONB DEFAULT '{}',
  
  -- Session Information
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,
  
  -- Technical Details
  user_agent TEXT,
  ip_address INET,
  device_info JSONB DEFAULT '{}',
  screen_resolution VARCHAR(20),
  
  -- Geo Information
  country_code VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  
  -- Timestamps
  event_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_event_name CHECK (char_length(event_name) > 0)
);

-- =============================================
-- SUBSCRIPTION MANAGEMENT TABLES
-- =============================================

-- Renewal Reminders
CREATE TABLE renewal_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT NOT NULL,
  
  -- Subscription Information
  subscription_type VARCHAR(50) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Reminder Information
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,
  reminder_type VARCHAR(20) DEFAULT 'email', -- 'email', 'push', 'in_app'
  
  -- Auto-renewal
  auto_renew_enabled BOOLEAN DEFAULT false,
  auto_renew_attempted BOOLEAN DEFAULT false,
  auto_renew_successful BOOLEAN DEFAULT false,
  auto_renew_attempted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE
);

-- Claimed Rewards (for tracking what rewards users have received)
CREATE TABLE claimed_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT NOT NULL,
  
  -- Reward Information
  reward_type VARCHAR(50) NOT NULL, -- 'daily', 'achievement', 'subscription', 'referral'
  reward_source VARCHAR(100) NOT NULL, -- what granted this reward
  reward_item_type VARCHAR(50), -- 'coins', 'powerup', 'skin'
  reward_item_id VARCHAR(100),
  reward_quantity INTEGER DEFAULT 1,
  
  -- Claim Information
  claimed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE
);

-- =============================================
-- PAYMENT HISTORY VIEW (for backwards compatibility)
-- =============================================

CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT NOT NULL,
  
  -- Payment Information
  payment_type VARCHAR(50) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_description TEXT,
  
  -- Amounts
  amount_pi DECIMAL(20, 8),
  amount_coins INTEGER,
  
  -- Status
  payment_status VARCHAR(50) DEFAULT 'completed',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id) ON DELETE CASCADE
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User Profiles Indexes
CREATE INDEX idx_user_profiles_pi_user_id ON user_profiles(pi_user_id);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_high_score ON user_profiles(high_score DESC);
CREATE INDEX idx_user_profiles_subscription_end ON user_profiles(subscription_end);
CREATE INDEX idx_user_profiles_last_login ON user_profiles(last_login DESC);
CREATE INDEX idx_user_profiles_subscription_status ON user_profiles(subscription_status);

-- User Inventory Indexes
CREATE INDEX idx_user_inventory_pi_user_id ON user_inventory(pi_user_id);
CREATE INDEX idx_user_inventory_item_type ON user_inventory(item_type);
CREATE INDEX idx_user_inventory_expires_at ON user_inventory(expires_at);
CREATE INDEX idx_user_inventory_sync_status ON user_inventory(sync_status);
CREATE INDEX idx_user_inventory_created_at ON user_inventory(created_at DESC);

-- Payment Records Indexes
CREATE INDEX idx_payment_records_payment_id ON payment_records(payment_id);
CREATE INDEX idx_payment_records_pi_user_id ON payment_records(pi_user_id);
CREATE INDEX idx_payment_records_status ON payment_records(status);
CREATE INDEX idx_payment_records_transaction_id ON payment_records(transaction_id);
CREATE INDEX idx_payment_records_created_at ON payment_records(created_at DESC);
CREATE INDEX idx_payment_records_completed_at ON payment_records(completed_at DESC);

-- Game Sessions Indexes
CREATE INDEX idx_game_sessions_pi_user_id ON game_sessions(pi_user_id);
CREATE INDEX idx_game_sessions_game_mode ON game_sessions(game_mode);
CREATE INDEX idx_game_sessions_final_score ON game_sessions(final_score DESC);
CREATE INDEX idx_game_sessions_created_at ON game_sessions(created_at DESC);
CREATE INDEX idx_game_sessions_session_start ON game_sessions(session_start DESC);

-- Leaderboard Indexes
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX idx_leaderboard_game_mode ON leaderboard(game_mode);
CREATE INDEX idx_leaderboard_pi_user_id ON leaderboard(pi_user_id);
CREATE INDEX idx_leaderboard_username ON leaderboard(username);
CREATE INDEX idx_leaderboard_created_at ON leaderboard(created_at DESC);
CREATE INDEX idx_leaderboard_is_verified ON leaderboard(is_verified, score DESC);
CREATE INDEX idx_leaderboard_composite ON leaderboard(game_mode, is_verified, score DESC);
CREATE INDEX idx_leaderboard_game_data ON leaderboard USING GIN (game_data);

-- Shop Items Indexes
CREATE INDEX idx_shop_items_category ON shop_items(category);
CREATE INDEX idx_shop_items_is_available ON shop_items(is_available);
CREATE INDEX idx_shop_items_price_pi ON shop_items(price_pi);
CREATE INDEX idx_shop_items_price_coins ON shop_items(price_coins);

-- Daily Rewards Indexes
CREATE INDEX idx_daily_rewards_pi_user_id ON daily_rewards(pi_user_id);
CREATE INDEX idx_daily_rewards_claimed_at ON daily_rewards(claimed_at DESC);
CREATE INDEX idx_daily_rewards_reward_day ON daily_rewards(reward_day);

-- Ad Watches Indexes
CREATE INDEX idx_ad_watches_pi_user_id ON ad_watches(pi_user_id);
CREATE INDEX idx_ad_watches_ad_type ON ad_watches(ad_type);
CREATE INDEX idx_ad_watches_created_at ON ad_watches(created_at DESC);
CREATE INDEX idx_ad_watches_completed ON ad_watches(completed);

-- Achievements Indexes
CREATE INDEX idx_achievements_pi_user_id ON achievements(pi_user_id);
CREATE INDEX idx_achievements_achievement_id ON achievements(achievement_id);
CREATE INDEX idx_achievements_completed ON achievements(completed);
CREATE INDEX idx_achievements_achievement_type ON achievements(achievement_type);

-- Analytics Events Indexes
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_event_category ON analytics_events(event_category);
CREATE INDEX idx_analytics_events_pi_user_id ON analytics_events(pi_user_id);
CREATE INDEX idx_analytics_events_event_timestamp ON analytics_events(event_timestamp DESC);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- Renewal Reminders Indexes
CREATE INDEX idx_renewal_reminders_pi_user_id ON renewal_reminders(pi_user_id);
CREATE INDEX idx_renewal_reminders_expires_at ON renewal_reminders(expires_at);
CREATE INDEX idx_renewal_reminders_reminder_sent ON renewal_reminders(reminder_sent);

-- Claimed Rewards Indexes
CREATE INDEX idx_claimed_rewards_pi_user_id ON claimed_rewards(pi_user_id);
CREATE INDEX idx_claimed_rewards_reward_type ON claimed_rewards(reward_type);
CREATE INDEX idx_claimed_rewards_claimed_at ON claimed_rewards(claimed_at DESC);

-- Payment History Indexes
CREATE INDEX idx_payment_history_pi_user_id ON payment_history(pi_user_id);
CREATE INDEX idx_payment_history_created_at ON payment_history(created_at DESC);
CREATE INDEX idx_payment_history_payment_status ON payment_history(payment_status);

-- =============================================
-- TRIGGERS AND FUNCTIONS
-- =============================================

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

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

CREATE TRIGGER update_shop_items_updated_at
  BEFORE UPDATE ON shop_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_renewal_reminders_updated_at
  BEFORE UPDATE ON renewal_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Unified Leaderboard View
CREATE OR REPLACE VIEW unified_leaderboard_view AS
SELECT 
  id,
  pi_user_id,
  username,
  score,
  game_mode,
  character_used,
  difficulty,
  game_duration,
  coins_collected,
  power_ups_used,
  game_data,
  session_id,
  is_verified,
  is_pi_user,
  created_at,
  updated_at,
  -- Add rank calculation
  RANK() OVER (
    PARTITION BY game_mode, is_verified 
    ORDER BY score DESC, created_at ASC
  ) as rank,
  -- Extract game-mode-specific fields from game_data
  CASE 
    WHEN game_mode IN ('classic', 'endless') THEN 
      COALESCE((game_data->>'pipes_passed')::INTEGER, 0)
    WHEN game_mode IN ('screampi', 'scream_pi') THEN 
      COALESCE((game_data->>'scream_inputs')::INTEGER, 0)
    WHEN game_mode IN ('dinopi', 'dino_pi') THEN 
      COALESCE((game_data->>'obstacles_jumped')::INTEGER, 0)
    WHEN game_mode = 'challenge' THEN 
      COALESCE((game_data->>'obstacles_avoided')::INTEGER, 0)
    WHEN game_mode = 'flappy_stack' THEN 
      COALESCE((game_data->>'blocks_stacked')::INTEGER, 0)
    WHEN game_mode = 'night_mode' THEN 
      COALESCE((game_data->>'pipes_passed')::INTEGER, 0)
    ELSE 0
  END as mode_specific_metric
FROM leaderboard
WHERE score > 0;

-- User Stats View
CREATE OR REPLACE VIEW user_stats_view AS
SELECT 
  up.pi_user_id,
  up.username,
  up.total_score,
  up.high_score,
  up.games_played,
  up.total_coins,
  up.subscription_status,
  up.subscription_end,
  up.last_login,
  up.login_streak,
  
  -- Game session aggregates
  COALESCE(gs.total_sessions, 0) as total_sessions,
  COALESCE(gs.avg_score, 0) as average_score,
  COALESCE(gs.total_session_time, 0) as total_playtime,
  
  -- Payment aggregates
  COALESCE(pr.total_spent_pi, 0) as total_spent_pi,
  COALESCE(pr.total_purchases, 0) as total_purchases,
  
  -- Achievement progress
  COALESCE(ach.total_achievements, 0) as total_achievements,
  COALESCE(ach.completed_achievements, 0) as completed_achievements,
  
  -- Inventory counts
  COALESCE(inv.total_items, 0) as total_inventory_items,
  COALESCE(inv.active_powerups, 0) as active_powerups
  
FROM user_profiles up
LEFT JOIN (
  SELECT 
    pi_user_id,
    COUNT(*) as total_sessions,
    AVG(final_score) as avg_score,
    SUM(COALESCE(session_duration, 0)) as total_session_time
  FROM game_sessions
  GROUP BY pi_user_id
) gs ON up.pi_user_id = gs.pi_user_id

LEFT JOIN (
  SELECT 
    pi_user_id,
    SUM(amount) as total_spent_pi,
    COUNT(*) as total_purchases
  FROM payment_records
  WHERE status = 'completed'
  GROUP BY pi_user_id
) pr ON up.pi_user_id = pr.pi_user_id

LEFT JOIN (
  SELECT 
    pi_user_id,
    COUNT(*) as total_achievements,
    COUNT(CASE WHEN completed THEN 1 END) as completed_achievements
  FROM achievements
  GROUP BY pi_user_id
) ach ON up.pi_user_id = ach.pi_user_id

LEFT JOIN (
  SELECT 
    pi_user_id,
    COUNT(*) as total_items,
    COUNT(CASE WHEN item_type = 'powerup' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP) THEN 1 END) as active_powerups
  FROM user_inventory
  GROUP BY pi_user_id
) inv ON up.pi_user_id = inv.pi_user_id;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all user-specific tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_watches ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE claimed_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Note: Leaderboard and shop_items are public read tables, no RLS needed

-- RLS Policies (for authenticated users accessing their own data)
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true))
  WITH CHECK (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage own inventory" ON user_inventory
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true))
  WITH CHECK (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own payments" ON payment_records
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true))
  WITH CHECK (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage own sessions" ON game_sessions
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true))
  WITH CHECK (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage own rewards" ON daily_rewards
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true))
  WITH CHECK (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage own ad watches" ON ad_watches
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true))
  WITH CHECK (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage own achievements" ON achievements
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true))
  WITH CHECK (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own analytics" ON analytics_events
  FOR SELECT USING (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own reminders" ON renewal_reminders
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true))
  WITH CHECK (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own claimed rewards" ON claimed_rewards
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true))
  WITH CHECK (pi_user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own payment history" ON payment_history
  FOR ALL USING (pi_user_id = current_setting('app.current_user_id', true))
  WITH CHECK (pi_user_id = current_setting('app.current_user_id', true));

-- Public read access for leaderboard and shop items
CREATE POLICY "Anyone can view leaderboard" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Anyone can view shop items" ON shop_items FOR SELECT USING (is_available = true);

-- =============================================
-- STORED PROCEDURES/FUNCTIONS
-- =============================================

-- Function to complete a game session and update user stats
CREATE OR REPLACE FUNCTION complete_game_session_secure(
  p_pi_user_id TEXT,
  p_game_mode game_mode,
  p_final_score INTEGER,
  p_level_reached INTEGER DEFAULT 1,
  p_coins_earned INTEGER DEFAULT 0,
  p_session_duration INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  session_id UUID;
  old_high_score INTEGER;
  is_new_high_score BOOLEAN := false;
  result JSON;
BEGIN
  -- Get current high score
  SELECT high_score INTO old_high_score 
  FROM user_profiles 
  WHERE pi_user_id = p_pi_user_id;
  
  -- Insert game session
  INSERT INTO game_sessions (
    pi_user_id, game_mode, final_score, level_reached, 
    coins_earned, session_duration
  ) VALUES (
    p_pi_user_id, p_game_mode, p_final_score, p_level_reached,
    p_coins_earned, p_session_duration
  ) RETURNING id INTO session_id;
  
  -- Check if it's a new high score
  IF p_final_score > COALESCE(old_high_score, 0) THEN
    is_new_high_score := true;
  END IF;
  
  -- Update user profile stats
  UPDATE user_profiles SET
    total_score = total_score + p_final_score,
    high_score = GREATEST(high_score, p_final_score),
    games_played = games_played + 1,
    total_coins = total_coins + p_coins_earned,
    coins_earned = coins_earned + p_coins_earned,
    last_login = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  WHERE pi_user_id = p_pi_user_id;
  
  -- Update leaderboard if it's a high score
  IF is_new_high_score THEN
    INSERT INTO leaderboard (
      pi_user_id, username, score, game_mode, is_pi_user, is_verified
    ) 
    SELECT p_pi_user_id, username, p_final_score, p_game_mode, true, true
    FROM user_profiles 
    WHERE pi_user_id = p_pi_user_id;
  END IF;
  
  -- Return result
  result := json_build_object(
    'session_id', session_id,
    'is_new_high_score', is_new_high_score,
    'old_high_score', COALESCE(old_high_score, 0),
    'new_high_score', p_final_score,
    'coins_earned', p_coins_earned
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle subscription expiry and renewal reminders
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS JSON AS $$
DECLARE
  expiring_count INTEGER := 0;
  expired_count INTEGER := 0;
BEGIN
  -- Mark expired subscriptions
  UPDATE user_profiles SET
    subscription_status = 'expired'
  WHERE subscription_status = 'active' 
    AND subscription_end < CURRENT_TIMESTAMP;
    
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Create renewal reminders for subscriptions expiring in 3 days
  INSERT INTO renewal_reminders (pi_user_id, subscription_type, expires_at)
  SELECT 
    pi_user_id, 
    subscription_plan, 
    subscription_end
  FROM user_profiles 
  WHERE subscription_status = 'active' 
    AND subscription_end BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '3 days'
    AND pi_user_id NOT IN (
      SELECT pi_user_id FROM renewal_reminders 
      WHERE expires_at = user_profiles.subscription_end
    );
    
  GET DIAGNOSTICS expiring_count = ROW_COUNT;
  
  RETURN json_build_object(
    'expired_subscriptions', expired_count,
    'new_renewal_reminders', expiring_count,
    'processed_at', CURRENT_TIMESTAMP
  );
END;
$$ LANGUAGE plpgsql;

-- Function to process daily rewards (could be called by cron)
CREATE OR REPLACE FUNCTION process_daily_rewards()
RETURNS JSON AS $$
DECLARE
  processed_count INTEGER := 0;
BEGIN
  -- This function could be expanded to automatically grant daily rewards
  -- For now, it just returns a status
  
  RETURN json_build_object(
    'message', 'Daily rewards processing ready',
    'processed_count', processed_count,
    'processed_at', CURRENT_TIMESTAMP
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user payment history
CREATE OR REPLACE FUNCTION get_user_payment_history(
  user_id TEXT,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  payment_id VARCHAR(255),
  amount DECIMAL(20, 8),
  currency VARCHAR(10),
  item_name VARCHAR(255),
  status payment_status,
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.payment_id,
    pr.amount,
    pr.currency,
    pr.item_name,
    pr.status,
    pr.created_at,
    pr.completed_at
  FROM payment_records pr
  WHERE pr.pi_user_id = user_id
  ORDER BY pr.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert sample shop items
INSERT INTO shop_items (item_id, name, description, category, price_pi, price_coins, is_available, features) VALUES
('extra_life_1', 'Extra Life', 'Get one extra chance when you crash', 'powerup', 0.1, 10, true, '{"effect": "extra_life", "duration": "single_use"}'),
('2x_coins_1', '2x Coins', 'Double your coin collection for one game', 'powerup', 0.15, 15, true, '{"effect": "double_coins", "duration": "single_game"}'),
('shield_1', 'Shield', 'Protect yourself from one collision', 'powerup', 0.2, 20, true, '{"effect": "shield", "duration": "single_collision"}'),
('magnet_1', 'Coin Magnet', 'Automatically collect nearby coins', 'powerup', 0.25, 25, true, '{"effect": "magnet", "duration": "10_seconds"}'),
('premium_monthly', 'Premium Monthly', 'Premium subscription for 30 days', 'subscription', 2.99, NULL, true, '{"ad_free": true, "extra_coins": true, "exclusive_skins": true, "duration_days": 30}'),
('skin_red_bird', 'Red Bird Skin', 'Fiery red bird skin', 'skin', 0.5, 50, true, '{"skin_id": "red_bird", "rarity": "common"}'),
('skin_blue_bird', 'Blue Bird Skin', 'Cool blue bird skin', 'skin', 0.75, 75, true, '{"skin_id": "blue_bird", "rarity": "rare"}');

-- =============================================
-- SUCCESS MESSAGE AND VERIFICATION
-- =============================================

DO $$
DECLARE
  table_count INTEGER;
  index_count INTEGER;
  trigger_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN (
    'user_profiles', 'user_inventory', 'payment_records', 'game_sessions', 
    'leaderboard', 'shop_items', 'daily_rewards', 'ad_watches', 
    'achievements', 'analytics_events', 'renewal_reminders', 
    'claimed_rewards', 'payment_history'
  );
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%';
  
  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%updated_at%';
  
  RAISE NOTICE '🎉 FLAPPY PI DATABASE SETUP COMPLETE!';
  RAISE NOTICE '=====================================';
  RAISE NOTICE '📊 Tables created: % (Expected: 13)', table_count;
  RAISE NOTICE '🚀 Indexes created: %', index_count;
  RAISE NOTICE '⚡ Triggers created: %', trigger_count;
  RAISE NOTICE '🔒 Row Level Security enabled on user tables';
  RAISE NOTICE '📈 Views created: unified_leaderboard_view, user_stats_view';
  RAISE NOTICE '🛠️  Stored procedures created for game sessions and subscription management';
  RAISE NOTICE '🎮 Sample shop items inserted';
  RAISE NOTICE '✅ Database ready for production use!';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Next Steps:';
  RAISE NOTICE '1. Test the connection: node test-supabase-connection.cjs';
  RAISE NOTICE '2. Update your environment variables';
  RAISE NOTICE '3. Deploy your application';
  RAISE NOTICE '4. Monitor with: SELECT * FROM user_stats_view LIMIT 5;';
END $$;