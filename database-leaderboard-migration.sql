-- =============================================
-- LEADERBOARD UNIFIED SYSTEM MIGRATION
-- =============================================
-- Migration to support unified leaderboard system with game_data JSONB field
-- Run this in your Supabase SQL Editor to update existing leaderboard table

-- Add game_data JSONB column to store game-mode-specific data
ALTER TABLE leaderboard 
ADD COLUMN IF NOT EXISTS game_data JSONB DEFAULT '{}';

-- Create index for game_data for faster queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_data ON leaderboard USING GIN (game_data);

-- Update game_mode enum to include all supported modes
ALTER TABLE leaderboard 
DROP CONSTRAINT IF EXISTS leaderboard_game_mode_check;

ALTER TABLE leaderboard 
ADD CONSTRAINT leaderboard_game_mode_check 
CHECK (game_mode IN ('classic', 'screampi', 'dinopi', 'challenge', 'scream_pi', 'dino_pi'));

-- Add comment to explain game_data structure
COMMENT ON COLUMN leaderboard.game_data IS 
'JSONB field storing game-mode-specific data:
- Classic Mode: pipes_passed, max_height, difficulty_multiplier, streak_bonus, perfect_passes
- ScreamPi Mode: scream_inputs, tap_inputs, voice_sensitivity, audio_quality, input_method
- DinoPi Mode: obstacles_jumped, distance_traveled, power_ups_collected, jump_accuracy, speed_bonus
- Challenge Mode: challenge_type, obstacles_avoided, time_limit, special_conditions, completion_bonus';

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

-- Update leaderboard_stats to include new game modes
INSERT INTO leaderboard_stats (game_mode) VALUES 
  ('screampi'),
  ('dinopi')
ON CONFLICT (game_mode) DO NOTHING;

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

-- Create index for the view performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_view_rank ON leaderboard(game_mode, is_verified, score DESC, created_at ASC);

-- Migration complete notice
-- This migration adds:
-- 1. game_data JSONB field for storing game-mode-specific data
-- 2. Updated game_mode constraint to support all game modes
-- 3. Indexes for performance optimization
-- 4. Unified leaderboard view for easier querying
-- 5. Automatic updated_at trigger
-- 6. Comments documenting the game_data structure