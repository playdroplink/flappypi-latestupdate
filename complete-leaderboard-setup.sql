-- =============================================
-- FLAPPY PI LEADERBOARD TABLE CREATION/UPDATE
-- =============================================
-- Run this SQL in your Supabase SQL Editor
-- This will create the complete leaderboard table structure

-- First, drop the existing leaderboard table if it exists (CAREFUL! This removes all data)
-- Comment out the DROP TABLE line if you want to preserve existing data
-- DROP TABLE IF EXISTS leaderboard CASCADE;

-- Create the complete leaderboard table with all required columns
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pi_user_id TEXT,
  username TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100000),
  game_mode TEXT NOT NULL DEFAULT 'classic' CHECK (game_mode IN ('classic', 'screampi', 'dinopi', 'challenge', 'scream_pi', 'dino_pi')),
  character_used TEXT DEFAULT 'flappy',
  difficulty TEXT DEFAULT 'normal' CHECK (difficulty IN ('easy', 'normal', 'hard', 'expert')),
  game_duration INTEGER, -- in seconds
  coins_collected INTEGER DEFAULT 0,
  power_ups_used TEXT[], -- array of power-up names used
  game_data JSONB DEFAULT '{}', -- NEW: game-mode-specific data
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_pi_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If the table already exists, add missing columns
-- Run these ALTER TABLE commands individually if needed

-- Add missing columns one by one (these will only run if columns don't exist)
DO $$ 
BEGIN
    -- Add game_data column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leaderboard' AND column_name='game_data') THEN
        ALTER TABLE leaderboard ADD COLUMN game_data JSONB DEFAULT '{}';
    END IF;
    
    -- Add character_used column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leaderboard' AND column_name='character_used') THEN
        ALTER TABLE leaderboard ADD COLUMN character_used TEXT DEFAULT 'flappy';
    END IF;
    
    -- Add difficulty column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leaderboard' AND column_name='difficulty') THEN
        ALTER TABLE leaderboard ADD COLUMN difficulty TEXT DEFAULT 'normal';
    END IF;
    
    -- Add game_duration column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leaderboard' AND column_name='game_duration') THEN
        ALTER TABLE leaderboard ADD COLUMN game_duration INTEGER;
    END IF;
    
    -- Add coins_collected column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leaderboard' AND column_name='coins_collected') THEN
        ALTER TABLE leaderboard ADD COLUMN coins_collected INTEGER DEFAULT 0;
    END IF;
    
    -- Add power_ups_used column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leaderboard' AND column_name='power_ups_used') THEN
        ALTER TABLE leaderboard ADD COLUMN power_ups_used TEXT[];
    END IF;
    
    -- Add session_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leaderboard' AND column_name='session_id') THEN
        ALTER TABLE leaderboard ADD COLUMN session_id TEXT;
    END IF;
    
    -- Add ip_address column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leaderboard' AND column_name='ip_address') THEN
        ALTER TABLE leaderboard ADD COLUMN ip_address INET;
    END IF;
    
    -- Add user_agent column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leaderboard' AND column_name='user_agent') THEN
        ALTER TABLE leaderboard ADD COLUMN user_agent TEXT;
    END IF;
    
    -- Add is_verified column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leaderboard' AND column_name='is_verified') THEN
        ALTER TABLE leaderboard ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add is_pi_user column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leaderboard' AND column_name='is_pi_user') THEN
        ALTER TABLE leaderboard ADD COLUMN is_pi_user BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add updated_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leaderboard' AND column_name='updated_at') THEN
        ALTER TABLE leaderboard ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Update constraints
ALTER TABLE leaderboard DROP CONSTRAINT IF EXISTS leaderboard_game_mode_check;
ALTER TABLE leaderboard ADD CONSTRAINT leaderboard_game_mode_check 
CHECK (game_mode IN ('classic', 'screampi', 'dinopi', 'challenge', 'scream_pi', 'dino_pi'));

ALTER TABLE leaderboard DROP CONSTRAINT IF EXISTS leaderboard_difficulty_check;
ALTER TABLE leaderboard ADD CONSTRAINT leaderboard_difficulty_check 
CHECK (difficulty IN ('easy', 'normal', 'hard', 'expert'));

ALTER TABLE leaderboard DROP CONSTRAINT IF EXISTS leaderboard_score_check;
ALTER TABLE leaderboard ADD CONSTRAINT leaderboard_score_check 
CHECK (score >= 0 AND score <= 100000);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_mode ON leaderboard(game_mode);
CREATE INDEX IF NOT EXISTS idx_leaderboard_pi_user_id ON leaderboard(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_verified ON leaderboard(is_verified, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_composite ON leaderboard(game_mode, is_verified, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_data ON leaderboard USING GIN (game_data);
CREATE INDEX IF NOT EXISTS idx_leaderboard_username ON leaderboard(username);
CREATE INDEX IF NOT EXISTS idx_leaderboard_session ON leaderboard(session_id);

-- Create updated_at trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_leaderboard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_leaderboard_updated_at ON leaderboard;

CREATE TRIGGER trigger_update_leaderboard_updated_at
  BEFORE UPDATE ON leaderboard
  FOR EACH ROW
  EXECUTE PROCEDURE update_leaderboard_updated_at();

-- Add comment to explain game_data structure
COMMENT ON COLUMN leaderboard.game_data IS 
'JSONB field storing game-mode-specific data:
- Classic Mode: pipes_passed, max_height, difficulty_multiplier, streak_bonus, perfect_passes
- ScreamPi Mode: scream_inputs, tap_inputs, voice_sensitivity, audio_quality, input_method
- DinoPi Mode: obstacles_jumped, distance_traveled, power_ups_collected, jump_accuracy, speed_bonus
- Challenge Mode: challenge_type, obstacles_avoided, time_limit, special_conditions, completion_bonus';

-- Create view for unified leaderboard with game_data parsing
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
  -- Extract game-mode-specific fields from game_data
  CASE 
    WHEN game_mode IN ('classic') THEN 
      COALESCE((game_data->>'pipes_passed')::INTEGER, 0)
    WHEN game_mode IN ('screampi', 'scream_pi') THEN 
      COALESCE((game_data->>'scream_inputs')::INTEGER, 0)
    WHEN game_mode IN ('dinopi', 'dino_pi') THEN 
      COALESCE((game_data->>'obstacles_jumped')::INTEGER, 0)
    WHEN game_mode = 'challenge' THEN 
      COALESCE((game_data->>'obstacles_avoided')::INTEGER, 0)
    ELSE 0
  END as mode_specific_metric,
  session_id,
  ip_address,
  user_agent,
  is_verified,
  is_pi_user,
  created_at,
  updated_at,
  -- Add rank calculation
  RANK() OVER (
    PARTITION BY game_mode, is_verified 
    ORDER BY score DESC, created_at ASC
  ) as rank
FROM leaderboard
WHERE score > 0;

-- Create daily leaderboard table for time-based competitions
CREATE TABLE IF NOT EXISTS daily_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pi_user_id TEXT,
  username TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  game_mode TEXT NOT NULL DEFAULT 'classic',
  date DATE DEFAULT CURRENT_DATE,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pi_user_id, game_mode, date)
);

-- Create index for daily leaderboard
CREATE INDEX IF NOT EXISTS idx_daily_leaderboard_date_score ON daily_leaderboard(date, score DESC);
CREATE INDEX IF NOT EXISTS idx_daily_leaderboard_mode_date ON daily_leaderboard(game_mode, date);

-- Create user best scores table
CREATE TABLE IF NOT EXISTS user_best_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pi_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  game_mode TEXT NOT NULL,
  best_score INTEGER NOT NULL DEFAULT 0,
  best_score_date TIMESTAMP WITH TIME ZONE,
  total_games INTEGER DEFAULT 1,
  total_coins INTEGER DEFAULT 0,
  average_score DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pi_user_id, game_mode)
);

-- Create leaderboard stats table for aggregated data
CREATE TABLE IF NOT EXISTS leaderboard_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_mode TEXT NOT NULL UNIQUE,
  total_players INTEGER DEFAULT 0,
  total_scores_submitted INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  average_score DECIMAL(10,2) DEFAULT 0,
  median_score INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial stats rows for each game mode
INSERT INTO leaderboard_stats (game_mode) VALUES 
  ('classic'),
  ('screampi'),
  ('dinopi'),
  ('challenge')
ON CONFLICT (game_mode) DO NOTHING;

-- Enable RLS (Row Level Security) if needed
-- ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'leaderboard' 
ORDER BY ordinal_position;

-- Test with a sample insert
INSERT INTO leaderboard (
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
    is_pi_user
) VALUES (
    'test_migration_user',
    150,
    'classic',
    'flappy',
    'normal',
    45,
    12,
    ARRAY['shield', 'double-coins'],
    '{"pipes_passed": 15, "max_height": 8, "difficulty_multiplier": 1.2, "streak_bonus": 50, "perfect_passes": 3}',
    'test_session_' || extract(epoch from now()),
    false,
    false
);

-- Verify the insert worked
SELECT 'Migration completed successfully! Leaderboard table is ready.' as status;
SELECT count(*) as total_entries FROM leaderboard;

-- Show the test entry
SELECT username, score, game_mode, game_data FROM leaderboard WHERE username = 'test_migration_user' LIMIT 1;