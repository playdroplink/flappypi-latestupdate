-- Flappy Pi Database Schema
-- Supabase PostgreSQL schema for user profiles, payments, and inventory

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL,
    uid VARCHAR(255) UNIQUE NOT NULL,
    total_coins INTEGER DEFAULT 0,
    owned_power_ups JSONB DEFAULT '{}',
    owned_skins JSONB DEFAULT '{}',
    subscriptions JSONB DEFAULT '{}',
    payment_history JSONB DEFAULT '[]',
    game_stats JSONB DEFAULT '{
        "high_score": 0,
        "total_games": 0,
        "total_coins_earned": 0,
        "achievements": []
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Records Table
CREATE TABLE IF NOT EXISTS payment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    payment_id VARCHAR(255) UNIQUE NOT NULL,
    txid VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'PI',
    item_type VARCHAR(50) NOT NULL,
    item_id VARCHAR(255) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending',
    wallet_address VARCHAR(255) NOT NULL,
    network VARCHAR(20) DEFAULT 'mainnet',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Inventory Table
CREATE TABLE IF NOT EXISTS user_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    item_id VARCHAR(255) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- Game Sessions Table
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    score INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0,
    power_ups_used JSONB DEFAULT '[]',
    achievements JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    high_score INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    total_coins INTEGER DEFAULT 0,
    rank INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_uid ON user_profiles(uid);
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_id ON payment_records(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_type ON user_inventory(item_type);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_high_score ON leaderboard(high_score DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_records_updated_at 
    BEFORE UPDATE ON payment_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_inventory_updated_at 
    BEFORE UPDATE ON user_inventory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at 
    BEFORE UPDATE ON leaderboard 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (uid = auth.uid()::text);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (uid = auth.uid()::text);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (uid = auth.uid()::text);

-- Payment Records RLS Policies
CREATE POLICY "Users can view their own payments" ON payment_records
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own payments" ON payment_records
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own payments" ON payment_records
    FOR UPDATE USING (user_id = auth.uid()::text);

-- User Inventory RLS Policies
CREATE POLICY "Users can view their own inventory" ON user_inventory
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own inventory" ON user_inventory
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own inventory" ON user_inventory
    FOR UPDATE USING (user_id = auth.uid()::text);

-- Game Sessions RLS Policies
CREATE POLICY "Users can view their own sessions" ON game_sessions
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own sessions" ON game_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Leaderboard RLS Policies (public read, authenticated write)
CREATE POLICY "Anyone can view leaderboard" ON leaderboard
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own leaderboard entry" ON leaderboard
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own leaderboard entry" ON leaderboard
    FOR UPDATE USING (user_id = auth.uid()::text);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create views for common queries
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    up.id,
    up.username,
    up.total_coins,
    up.game_stats,
    COUNT(pr.id) as total_payments,
    SUM(pr.amount) as total_spent,
    COUNT(gs.id) as total_sessions,
    MAX(gs.score) as best_score
FROM user_profiles up
LEFT JOIN payment_records pr ON up.uid = pr.user_id
LEFT JOIN game_sessions gs ON up.uid = gs.user_id
GROUP BY up.id, up.username, up.total_coins, up.game_stats;

-- Create function to update leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert leaderboard entry
    INSERT INTO leaderboard (user_id, username, high_score, total_games, total_coins)
    VALUES (NEW.user_id, NEW.username, NEW.game_stats->>'high_score'::integer, 
            NEW.game_stats->>'total_games'::integer, NEW.total_coins)
    ON CONFLICT (user_id) 
    DO UPDATE SET
        username = EXCLUDED.username,
        high_score = EXCLUDED.high_score,
        total_games = EXCLUDED.total_games,
        total_coins = EXCLUDED.total_coins,
        updated_at = NOW();
    
    -- Update ranks
    WITH ranked_users AS (
        SELECT user_id, ROW_NUMBER() OVER (ORDER BY high_score DESC) as new_rank
        FROM leaderboard
    )
    UPDATE leaderboard 
    SET rank = ranked_users.new_rank
    FROM ranked_users 
    WHERE leaderboard.user_id = ranked_users.user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update leaderboard when user profile changes
CREATE TRIGGER update_leaderboard_trigger
    AFTER UPDATE ON user_profiles
    FOR EACH ROW
    WHEN (OLD.game_stats IS DISTINCT FROM NEW.game_stats OR OLD.total_coins IS DISTINCT FROM NEW.total_coins)
    EXECUTE FUNCTION update_leaderboard();