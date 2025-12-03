-- Migration: Add Serial Codes to Inventory for NFT Future Support
-- Date: 2025-12-03
-- Purpose: Add serial_code column to track unique codes for each skin purchase
--          This supports future NFT minting and reward distribution based on rarity

-- Add serial_code column to user_inventory table
ALTER TABLE user_inventory 
ADD COLUMN IF NOT EXISTS serial_code VARCHAR(255) UNIQUE;

-- Add rarity column if it doesn't exist (for skin classification)
ALTER TABLE user_inventory 
ADD COLUMN IF NOT EXISTS rarity VARCHAR(20) CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Special', 'Legendary'));

-- Create index on serial_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_inventory_serial_code 
ON user_inventory(serial_code) 
WHERE serial_code IS NOT NULL;

-- Create index on rarity for reward distribution queries
CREATE INDEX IF NOT EXISTS idx_user_inventory_rarity 
ON user_inventory(rarity) 
WHERE rarity IS NOT NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN user_inventory.serial_code IS 'Unique serial code for NFT future support. Format: RARITY-SKINID-YYYYMMDD-RANDOM (e.g., LEG-bird-3-20251203-F4A8)';
COMMENT ON COLUMN user_inventory.rarity IS 'Rarity tier of the item: Common, Rare, Epic, Special, or Legendary. Used for reward calculations.';

-- Create a view for skins with serial codes (useful for admin queries)
CREATE OR REPLACE VIEW skins_with_serial_codes AS
SELECT 
    ui.id,
    ui.pi_user_id,
    ui.item_id,
    ui.item_name,
    ui.serial_code,
    ui.rarity,
    ui.created_at,
    ui.updated_at,
    up.username
FROM user_inventory ui
LEFT JOIN user_profiles up ON ui.pi_user_id = up.uid
WHERE ui.item_type = 'skin' 
  AND ui.serial_code IS NOT NULL
ORDER BY ui.created_at DESC;

-- Grant select permission on the view
GRANT SELECT ON skins_with_serial_codes TO authenticated;

-- Create a function to validate serial code format
CREATE OR REPLACE FUNCTION validate_serial_code(code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Expected format: XXX-skinid-YYYYMMDD-XXXX
    -- Where XXX is rarity prefix (COM, RAR, EPC, SPC, LEG)
    RETURN code ~ '^(COM|RAR|EPC|SPC|LEG)-[\w-]+-\d{8}-[A-Z0-9]{4}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add check constraint to ensure serial codes follow the expected format
ALTER TABLE user_inventory
DROP CONSTRAINT IF EXISTS check_serial_code_format;

ALTER TABLE user_inventory
ADD CONSTRAINT check_serial_code_format 
CHECK (serial_code IS NULL OR validate_serial_code(serial_code));

-- Create a function to get user's skins by rarity
CREATE OR REPLACE FUNCTION get_user_skins_by_rarity(p_pi_user_id TEXT, p_rarity TEXT)
RETURNS TABLE (
    item_id VARCHAR(255),
    item_name VARCHAR(255),
    serial_code VARCHAR(255),
    rarity VARCHAR(20),
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ui.item_id,
        ui.item_name,
        ui.serial_code,
        ui.rarity,
        ui.created_at
    FROM user_inventory ui
    WHERE ui.pi_user_id = p_pi_user_id
      AND ui.item_type = 'skin'
      AND ui.rarity = p_rarity
      AND ui.serial_code IS NOT NULL
    ORDER BY ui.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_skins_by_rarity(TEXT, TEXT) TO authenticated;

-- Create a materialized view for rarity statistics (admin analytics)
CREATE MATERIALIZED VIEW IF NOT EXISTS skin_rarity_stats AS
SELECT 
    rarity,
    COUNT(*) as total_count,
    COUNT(DISTINCT pi_user_id) as unique_owners,
    MIN(created_at) as first_purchase,
    MAX(created_at) as latest_purchase
FROM user_inventory
WHERE item_type = 'skin' 
  AND rarity IS NOT NULL
GROUP BY rarity
ORDER BY 
    CASE rarity
        WHEN 'Common' THEN 1
        WHEN 'Rare' THEN 2
        WHEN 'Epic' THEN 3
        WHEN 'Special' THEN 4
        WHEN 'Legendary' THEN 5
    END;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_skin_rarity_stats_rarity 
ON skin_rarity_stats(rarity);

-- Grant select permission on materialized view
GRANT SELECT ON skin_rarity_stats TO authenticated;

-- Create function to refresh the stats (can be called manually or via cron)
CREATE OR REPLACE FUNCTION refresh_skin_rarity_stats()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY skin_rarity_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION refresh_skin_rarity_stats() TO authenticated;

-- Add trigger to update materialized view when inventory changes
-- (Note: For production, consider using a scheduled job instead of trigger for performance)
CREATE OR REPLACE FUNCTION trigger_refresh_skin_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh stats asynchronously (non-blocking)
    PERFORM refresh_skin_rarity_stats();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create trigger (disabled by default for performance)
-- Uncomment if you want automatic stats refresh
-- CREATE TRIGGER after_inventory_change_refresh_stats
-- AFTER INSERT OR UPDATE OR DELETE ON user_inventory
-- FOR EACH STATEMENT
-- EXECUTE FUNCTION trigger_refresh_skin_stats();

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Serial code migration completed successfully!';
    RAISE NOTICE 'Serial codes are now supported in user_inventory table';
    RAISE NOTICE 'Use inventoryService.migrateSkinsWithSerialCodes() to update existing skins';
END $$;
