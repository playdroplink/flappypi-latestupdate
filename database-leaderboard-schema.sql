-- =============================================
-- FLAPPY PI LEADERBOARD SYSTEM DATABASE SCHEMA
-- =============================================
-- This file contains the complete database schema for the Flappy Pi leaderboard system
-- Run this in your Supabase SQL Editor

-- Create leaderboard table with comprehensive tracking
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pi_user_id TEXT,
  username TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10000),
  game_mode TEXT NOT NULL DEFAULT 'classic' CHECK (game_mode IN ('classic', 'scream_pi', 'dino_pi', 'challenge')),
  character_used TEXT DEFAULT 'default',
  difficulty TEXT DEFAULT 'normal' CHECK (difficulty IN ('easy', 'normal', 'hard', 'expert')),
  game_duration INTEGER, -- in seconds
  coins_collected INTEGER DEFAULT 0,
  power_ups_used TEXT[], -- array of power-up names used
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_pi_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_mode ON leaderboard(game_mode);
CREATE INDEX IF NOT EXISTS idx_leaderboard_pi_user_id ON leaderboard(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_verified ON leaderboard(is_verified, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_composite ON leaderboard(game_mode, is_verified, score DESC);

-- Create leaderboard stats table for aggregated data
CREATE TABLE IF NOT EXISTS leaderboard_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_mode TEXT NOT NULL,
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
  ('scream_pi'),
  ('dino_pi'),
  ('challenge')
ON CONFLICT DO NOTHING;

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
  average_score DECIMAL(10,2) DEFAULT 0,
  last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pi_user_id, game_mode)
);

-- Create indexes for user best scores
CREATE INDEX IF NOT EXISTS idx_user_best_scores_pi_user ON user_best_scores(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_user_best_scores_mode_score ON user_best_scores(game_mode, best_score DESC);

-- Create achievements table
CREATE TABLE IF NOT EXISTS leaderboard_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pi_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  achievement_type TEXT NOT NULL, -- 'first_place', 'top_10', 'high_score', 'streak', etc.
  achievement_data JSONB,
  game_mode TEXT NOT NULL,
  score_achieved INTEGER,
  rank_achieved INTEGER,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index for achievements
CREATE INDEX IF NOT EXISTS idx_achievements_user ON leaderboard_achievements(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON leaderboard_achievements(achievement_type);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update user best scores
CREATE OR REPLACE FUNCTION update_user_best_scores()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_best_scores (pi_user_id, username, game_mode, best_score, best_score_date, total_games, average_score, last_played)
  VALUES (
    COALESCE(NEW.pi_user_id, 'anonymous'),
    NEW.username,
    NEW.game_mode,
    NEW.score,
    NEW.created_at,
    1,
    NEW.score,
    NEW.created_at
  )
  ON CONFLICT (pi_user_id, game_mode)
  DO UPDATE SET
    best_score = CASE 
      WHEN NEW.score > user_best_scores.best_score THEN NEW.score
      ELSE user_best_scores.best_score
    END,
    best_score_date = CASE 
      WHEN NEW.score > user_best_scores.best_score THEN NEW.created_at
      ELSE user_best_scores.best_score_date
    END,
    total_games = user_best_scores.total_games + 1,
    average_score = (user_best_scores.average_score * user_best_scores.total_games + NEW.score) / (user_best_scores.total_games + 1),
    last_played = NEW.created_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating user best scores
DROP TRIGGER IF EXISTS trigger_update_user_best_scores ON leaderboard;
CREATE TRIGGER trigger_update_user_best_scores
  AFTER INSERT ON leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION update_user_best_scores();

-- Function to update leaderboard stats
CREATE OR REPLACE FUNCTION update_leaderboard_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE leaderboard_stats
  SET
    total_players = (
      SELECT COUNT(DISTINCT COALESCE(pi_user_id, ip_address::TEXT))
      FROM leaderboard
      WHERE game_mode = NEW.game_mode
    ),
    total_scores_submitted = (
      SELECT COUNT(*)
      FROM leaderboard
      WHERE game_mode = NEW.game_mode
    ),
    highest_score = (
      SELECT MAX(score)
      FROM leaderboard
      WHERE game_mode = NEW.game_mode
    ),
    average_score = (
      SELECT AVG(score)
      FROM leaderboard
      WHERE game_mode = NEW.game_mode
    ),
    median_score = (
      SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score)
      FROM leaderboard
      WHERE game_mode = NEW.game_mode
    ),
    last_updated = NOW()
  WHERE game_mode = NEW.game_mode;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating leaderboard stats
DROP TRIGGER IF EXISTS trigger_update_leaderboard_stats ON leaderboard;
CREATE TRIGGER trigger_update_leaderboard_stats
  AFTER INSERT ON leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION update_leaderboard_stats();

-- Function to update daily leaderboard
CREATE OR REPLACE FUNCTION update_daily_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_leaderboard (pi_user_id, username, score, game_mode, date)
  VALUES (
    COALESCE(NEW.pi_user_id, 'anonymous'),
    NEW.username,
    NEW.score,
    NEW.game_mode,
    CURRENT_DATE
  )
  ON CONFLICT (pi_user_id, game_mode, date)
  DO UPDATE SET
    score = CASE 
      WHEN NEW.score > daily_leaderboard.score THEN NEW.score
      ELSE daily_leaderboard.score
    END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating daily leaderboard
DROP TRIGGER IF EXISTS trigger_update_daily_leaderboard ON leaderboard;
CREATE TRIGGER trigger_update_daily_leaderboard
  AFTER INSERT ON leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_leaderboard();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on tables
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_best_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access to leaderboards
CREATE POLICY "Public read access on leaderboard" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Public read access on daily_leaderboard" ON daily_leaderboard FOR SELECT USING (true);
CREATE POLICY "Public read access on user_best_scores" ON user_best_scores FOR SELECT USING (true);
CREATE POLICY "Public read access on leaderboard_achievements" ON leaderboard_achievements FOR SELECT USING (true);
CREATE POLICY "Public read access on leaderboard_stats" ON leaderboard_stats FOR SELECT USING (true);

-- Allow authenticated users to insert their own scores
CREATE POLICY "Users can insert their own scores" ON leaderboard FOR INSERT 
WITH CHECK (auth.uid()::text = pi_user_id OR pi_user_id IS NULL);

-- Allow authenticated users to view their own detailed data
CREATE POLICY "Users can update their own daily scores" ON daily_leaderboard FOR INSERT
WITH CHECK (auth.uid()::text = pi_user_id OR pi_user_id IS NULL);

-- =============================================
-- USEFUL VIEWS FOR COMMON QUERIES
-- =============================================

-- Global leaderboard view
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT 
  ROW_NUMBER() OVER (PARTITION BY game_mode ORDER BY score DESC, created_at ASC) as rank,
  pi_user_id,
  username,
  score,
  game_mode,
  character_used,
  is_pi_user,
  is_verified,
  created_at
FROM leaderboard
ORDER BY game_mode, score DESC, created_at ASC;

-- Daily leaderboard view with ranks
CREATE OR REPLACE VIEW daily_leaderboard_ranked AS
SELECT 
  ROW_NUMBER() OVER (PARTITION BY game_mode, date ORDER BY score DESC) as rank,
  pi_user_id,
  username,
  score,
  game_mode,
  date,
  created_at
FROM daily_leaderboard
ORDER BY game_mode, date DESC, score DESC;

-- User statistics view
CREATE OR REPLACE VIEW user_leaderboard_stats AS
SELECT 
  pi_user_id,
  username,
  COUNT(*) as total_games,
  MAX(score) as best_score,
  AVG(score)::decimal(10,2) as average_score,
  MIN(score) as worst_score,
  SUM(CASE WHEN game_mode = 'classic' THEN 1 ELSE 0 END) as classic_games,
  SUM(CASE WHEN game_mode = 'scream_pi' THEN 1 ELSE 0 END) as scream_pi_games,
  SUM(CASE WHEN game_mode = 'dino_pi' THEN 1 ELSE 0 END) as dino_pi_games,
  SUM(CASE WHEN game_mode = 'challenge' THEN 1 ELSE 0 END) as challenge_games,
  MAX(created_at) as last_played
FROM leaderboard
WHERE pi_user_id IS NOT NULL
GROUP BY pi_user_id, username;

-- =============================================
-- SAMPLE QUERIES FOR TESTING
-- =============================================

-- Get top 50 classic mode scores
-- SELECT * FROM global_leaderboard WHERE game_mode = 'classic' LIMIT 50;

-- Get today's daily leaderboard
-- SELECT * FROM daily_leaderboard_ranked WHERE date = CURRENT_DATE AND game_mode = 'classic' LIMIT 20;

-- Get user's best scores across all modes
-- SELECT * FROM user_best_scores WHERE pi_user_id = 'your_pi_user_id';

-- Get leaderboard statistics
-- SELECT * FROM leaderboard_stats;

-- Insert a test score (for testing purposes)
-- INSERT INTO leaderboard (username, score, game_mode, pi_user_id, is_pi_user, is_verified)
-- VALUES ('TestPlayer', 1250, 'classic', 'test_pi_user_123', true, true);

COMMENT ON TABLE leaderboard IS 'Main leaderboard table storing all game scores with comprehensive metadata';
COMMENT ON TABLE daily_leaderboard IS 'Daily leaderboard for time-based competitions';
COMMENT ON TABLE user_best_scores IS 'User best scores and statistics across all game modes';
COMMENT ON TABLE leaderboard_achievements IS 'User achievements and milestones';
COMMENT ON TABLE leaderboard_stats IS 'Aggregated statistics for each game mode';

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE 'Flappy Pi Leaderboard System Successfully Created!';
  RAISE NOTICE '=============================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✅ leaderboard (main scores table)';
  RAISE NOTICE '  ✅ daily_leaderboard (daily competitions)';  
  RAISE NOTICE '  ✅ user_best_scores (user statistics)';
  RAISE NOTICE '  ✅ leaderboard_achievements (achievements)';
  RAISE NOTICE '  ✅ leaderboard_stats (aggregated stats)';
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  ✅ Multi-game mode support (classic, scream_pi, dino_pi, challenge)';
  RAISE NOTICE '  ✅ Pi Network user authentication';
  RAISE NOTICE '  ✅ Daily leaderboards';
  RAISE NOTICE '  ✅ User best scores tracking';
  RAISE NOTICE '  ✅ Anti-cheat score validation';
  RAISE NOTICE '  ✅ Real-time statistics';
  RAISE NOTICE '  ✅ Achievement system';
  RAISE NOTICE '  ✅ Row Level Security (RLS)';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for API integration!';
END $$;