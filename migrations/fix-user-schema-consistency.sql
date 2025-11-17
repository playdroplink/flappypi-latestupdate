-- ========================================
-- FLAPPY PI - USER SCHEMA CONSISTENCY FIX
-- ========================================
-- This migration fixes the inconsistency between user_profiles (uid) and user_inventory_sync (pi_user_id)
-- It adds pi_user_id column to user_profiles and updates existing records

-- ========================================
-- 1. ADD pi_user_id COLUMN TO user_profiles
-- ========================================

-- Add pi_user_id column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS pi_user_id VARCHAR(255);

-- Create index for pi_user_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_pi_user_id ON user_profiles(pi_user_id);

-- ========================================
-- 2. MIGRATE EXISTING DATA
-- ========================================

-- Update pi_user_id to match uid for existing records
UPDATE user_profiles 
SET pi_user_id = uid 
WHERE pi_user_id IS NULL;

-- ========================================
-- 3. UPDATE RLS POLICIES
-- ========================================

-- Update RLS policies to work with both uid and pi_user_id
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Create new policies that support both fields
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (
        uid = auth.uid()::text OR 
        pi_user_id = auth.uid()::text
    );

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (
        uid = auth.uid()::text OR 
        pi_user_id = auth.uid()::text
    );

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (
        uid = auth.uid()::text OR 
        pi_user_id = auth.uid()::text
    );

-- ========================================
-- 4. CREATE HELPER FUNCTIONS
-- ========================================

-- Function to find user by either uid or pi_user_id
CREATE OR REPLACE FUNCTION find_user_profile(user_identifier TEXT)
RETURNS TABLE (
    id UUID,
    username VARCHAR(255),
    uid VARCHAR(255),
    pi_user_id VARCHAR(255),
    total_coins INTEGER,
    owned_power_ups JSONB,
    owned_skins JSONB,
    subscriptions JSONB,
    payment_history JSONB,
    game_stats JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id, up.username, up.uid, up.pi_user_id, up.total_coins,
        up.owned_power_ups, up.owned_skins, up.subscriptions, 
        up.payment_history, up.game_stats, up.created_at, up.updated_at
    FROM user_profiles up
    WHERE up.uid = user_identifier OR up.pi_user_id = user_identifier
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to upsert user profile with both uid and pi_user_id
CREATE OR REPLACE FUNCTION upsert_user_profile(
    user_uid TEXT,
    user_pi_user_id TEXT,
    user_username TEXT,
    user_total_coins INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
BEGIN
    -- Try to find existing profile by either identifier
    SELECT id INTO profile_id 
    FROM user_profiles 
    WHERE uid = user_uid OR pi_user_id = user_pi_user_id
    LIMIT 1;
    
    IF profile_id IS NULL THEN
        -- Create new profile
        INSERT INTO user_profiles (uid, pi_user_id, username, total_coins, created_at)
        VALUES (user_uid, user_pi_user_id, user_username, user_total_coins, NOW())
        RETURNING id INTO profile_id;
    ELSE
        -- Update existing profile
        UPDATE user_profiles 
        SET 
            uid = COALESCE(user_uid, uid),
            pi_user_id = COALESCE(user_pi_user_id, pi_user_id),
            username = user_username,
            total_coins = GREATEST(total_coins, user_total_coins),
            updated_at = NOW()
        WHERE id = profile_id;
    END IF;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. SYNC user_inventory_sync WITH user_profiles
-- ========================================

-- Create or update user_profiles entries based on user_inventory_sync records
INSERT INTO user_profiles (uid, pi_user_id, username, total_coins, created_at)
SELECT 
    uis.pi_user_id as uid,
    uis.pi_user_id,
    'Pi User' as username,
    uis.wallet_balance as total_coins,
    uis.created_at
FROM user_inventory_sync uis
LEFT JOIN user_profiles up ON (up.uid = uis.pi_user_id OR up.pi_user_id = uis.pi_user_id)
WHERE up.id IS NULL
ON CONFLICT (uid) DO UPDATE SET
    pi_user_id = EXCLUDED.pi_user_id,
    total_coins = GREATEST(user_profiles.total_coins, EXCLUDED.total_coins),
    updated_at = NOW();

-- ========================================
-- 6. GRANTS AND PERMISSIONS
-- ========================================

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION find_user_profile(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION upsert_user_profile(TEXT, TEXT, TEXT, INTEGER) TO anon, authenticated;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify the migration
-- SELECT COUNT(*) FROM user_profiles WHERE pi_user_id IS NOT NULL;
-- SELECT COUNT(*) FROM user_inventory_sync;
-- SELECT * FROM find_user_profile('test-user-id');
