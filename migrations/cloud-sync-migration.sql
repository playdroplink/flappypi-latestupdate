-- ========================================
-- FLAPPY PI - CLOUD SYNC MIGRATION
-- ========================================
-- This migration adds tables for inventory sync, subscription tracking, and reward distribution
-- Run this in your Supabase SQL Editor

-- ========================================
-- 1. USER INVENTORY CLOUD SYNC TABLE
-- ========================================
-- Stores complete user inventory in cloud for cross-device sync
CREATE TABLE IF NOT EXISTS user_inventory_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pi_user_id TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]',
  wallet_balance INTEGER NOT NULL DEFAULT 0,
  last_sync_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_status TEXT DEFAULT 'completed',
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_user_inventory_sync_pi_user_id 
  ON user_inventory_sync(pi_user_id);

-- Index for sync monitoring
CREATE INDEX IF NOT EXISTS idx_user_inventory_sync_last_sync 
  ON user_inventory_sync(last_sync_time);

-- RLS Policies for user_inventory_sync
ALTER TABLE user_inventory_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory sync" 
  ON user_inventory_sync FOR SELECT 
  USING (true); -- Public read for now, can be restricted

CREATE POLICY "Users can insert their own inventory sync" 
  ON user_inventory_sync FOR INSERT 
  WITH CHECK (true); -- Allow all inserts for now

CREATE POLICY "Users can update their own inventory sync" 
  ON user_inventory_sync FOR UPDATE 
  USING (true); -- Allow all updates for now

-- ========================================
-- 2. SUBSCRIPTION RENEWAL REMINDERS TABLE
-- ========================================
-- Tracks subscriptions that are expiring soon
CREATE TABLE IF NOT EXISTS renewal_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pi_user_id TEXT NOT NULL,
  subscription_id UUID,
  subscription_plan_id TEXT NOT NULL,
  subscription_plan_name TEXT NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  notification_method TEXT DEFAULT 'in_app',
  renewal_completed BOOLEAN DEFAULT FALSE,
  renewal_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for finding expiring subscriptions
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_expiry_date 
  ON renewal_reminders(expiry_date);

-- Index for user's reminders
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_pi_user_id 
  ON renewal_reminders(pi_user_id);

-- Index for pending reminders
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_pending 
  ON renewal_reminders(reminder_sent) WHERE reminder_sent = FALSE;

-- RLS Policies for renewal_reminders
ALTER TABLE renewal_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own renewal reminders" 
  ON renewal_reminders FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own renewal reminders" 
  ON renewal_reminders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own renewal reminders" 
  ON renewal_reminders FOR UPDATE 
  USING (true);

-- ========================================
-- 3. CLAIMED REWARDS TRACKING TABLE
-- ========================================
-- Records all rewards claimed from subscriptions and other sources
CREATE TABLE IF NOT EXISTS claimed_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pi_user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  reward_count INTEGER NOT NULL DEFAULT 0,
  rewards_data JSONB NOT NULL DEFAULT '[]',
  reward_source TEXT DEFAULT 'subscription',
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_to_inventory BOOLEAN DEFAULT TRUE,
  sync_error TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Index for user's claimed rewards
CREATE INDEX IF NOT EXISTS idx_claimed_rewards_pi_user_id 
  ON claimed_rewards(pi_user_id);

-- Index for transaction lookups
CREATE INDEX IF NOT EXISTS idx_claimed_rewards_transaction_id 
  ON claimed_rewards(transaction_id);

-- Index for plan tracking
CREATE INDEX IF NOT EXISTS idx_claimed_rewards_plan_id 
  ON claimed_rewards(plan_id);

-- Index for recent claims
CREATE INDEX IF NOT EXISTS idx_claimed_rewards_claimed_at 
  ON claimed_rewards(claimed_at DESC);

-- RLS Policies for claimed_rewards
ALTER TABLE claimed_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own claimed rewards" 
  ON claimed_rewards FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own claimed rewards" 
  ON claimed_rewards FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own claimed rewards" 
  ON claimed_rewards FOR UPDATE 
  USING (true);

-- ========================================
-- 4. UPDATE TRIGGERS
-- ========================================
-- Auto-update updated_at timestamp on record changes

-- User inventory sync trigger
CREATE TRIGGER update_user_inventory_sync_updated_at 
  BEFORE UPDATE ON user_inventory_sync 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Renewal reminders trigger
CREATE TRIGGER update_renewal_reminders_updated_at 
  BEFORE UPDATE ON renewal_reminders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. USEFUL VIEWS
-- ========================================

-- View: Active subscriptions with expiry info
CREATE OR REPLACE VIEW active_subscriptions_with_expiry AS
SELECT 
  up.pi_user_id,
  up.username,
  up.subscription_status,
  up.subscription_type,
  up.subscription_start,
  up.subscription_end,
  EXTRACT(EPOCH FROM (up.subscription_end - NOW())) / 86400 AS days_until_expiry,
  CASE 
    WHEN up.subscription_end < NOW() THEN 'expired'
    WHEN up.subscription_end < (NOW() + INTERVAL '7 days') THEN 'expiring_soon'
    ELSE 'active'
  END AS expiry_status
FROM user_profiles up
WHERE up.subscription_status = 'active'
  AND up.subscription_end IS NOT NULL;

-- View: User inventory summary
CREATE OR REPLACE VIEW user_inventory_summary AS
SELECT 
  uis.pi_user_id,
  jsonb_array_length(uis.items) AS total_items,
  uis.last_sync_time,
  uis.sync_status,
  EXTRACT(EPOCH FROM (NOW() - uis.last_sync_time)) / 3600 AS hours_since_sync
FROM user_inventory_sync uis;

-- View: Rewards distribution summary
CREATE OR REPLACE VIEW rewards_distribution_summary AS
SELECT 
  cr.pi_user_id,
  cr.plan_id,
  cr.plan_name,
  COUNT(*) AS times_claimed,
  SUM(cr.reward_count) AS total_rewards,
  MAX(cr.claimed_at) AS last_claimed_at
FROM claimed_rewards cr
GROUP BY cr.pi_user_id, cr.plan_id, cr.plan_name;

-- ========================================
-- 6. HELPER FUNCTIONS
-- ========================================

-- Function: Get expiring subscriptions for a user
CREATE OR REPLACE FUNCTION get_expiring_subscriptions(
  user_id TEXT,
  days_threshold INTEGER DEFAULT 7
)
RETURNS TABLE (
  subscription_id UUID,
  plan_id TEXT,
  plan_name TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE,
  days_until_expiry NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id AS subscription_id,
    up.subscription_type AS plan_id,
    up.subscription_type AS plan_name,
    up.subscription_end AS expiry_date,
    EXTRACT(EPOCH FROM (up.subscription_end - NOW())) / 86400 AS days_until_expiry
  FROM user_profiles up
  WHERE up.pi_user_id = user_id
    AND up.subscription_status = 'active'
    AND up.subscription_end IS NOT NULL
    AND up.subscription_end <= (NOW() + (days_threshold || ' days')::INTERVAL)
    AND up.subscription_end > NOW()
  ORDER BY up.subscription_end ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: Sync inventory from local to cloud
CREATE OR REPLACE FUNCTION sync_user_inventory(
  user_id TEXT,
  inventory_json JSONB
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Upsert inventory data
  INSERT INTO user_inventory_sync (pi_user_id, items, last_sync_time, sync_status)
  VALUES (user_id, inventory_json, NOW(), 'completed')
  ON CONFLICT (pi_user_id) 
  DO UPDATE SET
    items = EXCLUDED.items,
    last_sync_time = NOW(),
    sync_status = 'completed',
    updated_at = NOW();
  
  -- Return success result
  SELECT jsonb_build_object(
    'success', TRUE,
    'pi_user_id', user_id,
    'item_count', jsonb_array_length(inventory_json),
    'synced_at', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function: Create renewal reminder
CREATE OR REPLACE FUNCTION create_renewal_reminder(
  user_id TEXT,
  plan_id TEXT,
  plan_name TEXT,
  expiry_timestamp TIMESTAMP WITH TIME ZONE
)
RETURNS UUID AS $$
DECLARE
  reminder_id UUID;
BEGIN
  INSERT INTO renewal_reminders (
    pi_user_id,
    subscription_plan_id,
    subscription_plan_name,
    expiry_date,
    reminder_sent,
    created_at
  ) VALUES (
    user_id,
    plan_id,
    plan_name,
    expiry_timestamp,
    FALSE,
    NOW()
  )
  RETURNING id INTO reminder_id;
  
  RETURN reminder_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Record claimed rewards
CREATE OR REPLACE FUNCTION record_claimed_rewards(
  user_id TEXT,
  plan_id TEXT,
  plan_name TEXT,
  transaction_id TEXT,
  rewards JSONB
)
RETURNS UUID AS $$
DECLARE
  claim_id UUID;
BEGIN
  INSERT INTO claimed_rewards (
    pi_user_id,
    plan_id,
    plan_name,
    transaction_id,
    reward_count,
    rewards_data,
    claimed_at,
    synced_to_inventory
  ) VALUES (
    user_id,
    plan_id,
    plan_name,
    transaction_id,
    jsonb_array_length(rewards),
    rewards,
    NOW(),
    TRUE
  )
  RETURNING id INTO claim_id;
  
  RETURN claim_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. GRANTS AND PERMISSIONS
-- ========================================

-- Grant access to authenticated and anonymous users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE user_inventory_sync TO anon, authenticated;
GRANT ALL ON TABLE renewal_reminders TO anon, authenticated;
GRANT ALL ON TABLE claimed_rewards TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ========================================
-- 8. INITIAL DATA MIGRATION
-- ========================================
-- Migrate existing user_profiles subscription data to renewal_reminders

INSERT INTO renewal_reminders (
  pi_user_id,
  subscription_plan_id,
  subscription_plan_name,
  expiry_date,
  reminder_sent,
  created_at
)
SELECT 
  up.pi_user_id,
  up.subscription_type,
  up.subscription_type,
  up.subscription_end,
  FALSE,
  NOW()
FROM user_profiles up
WHERE up.subscription_status = 'active'
  AND up.subscription_end IS NOT NULL
  AND up.subscription_end > NOW()
  AND NOT EXISTS (
    SELECT 1 FROM renewal_reminders rr 
    WHERE rr.pi_user_id = up.pi_user_id 
      AND rr.expiry_date = up.subscription_end
  );

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
-- Verify by running:
-- SELECT COUNT(*) FROM user_inventory_sync;
-- SELECT COUNT(*) FROM renewal_reminders;
-- SELECT COUNT(*) FROM claimed_rewards;
-- SELECT * FROM active_subscriptions_with_expiry LIMIT 10;

