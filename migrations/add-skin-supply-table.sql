-- Migration: Add Skin Supply Table for Real-Time Supply Tracking
-- Date: 2025-12-03
-- Purpose: Track and update supply for each skin in real-time

-- Create skin_supply table
CREATE TABLE IF NOT EXISTS skin_supply (
    skin_id VARCHAR(255) PRIMARY KEY,
    initial_supply INTEGER NOT NULL,
    current_supply INTEGER NOT NULL,
    rarity VARCHAR(20) CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Special', 'Legendary')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_skin_supply_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_skin_supply_updated_at
    BEFORE UPDATE ON skin_supply
    FOR EACH ROW EXECUTE FUNCTION update_skin_supply_updated_at();

-- Insert initial supply for existing skins (example, adjust as needed)
INSERT INTO skin_supply (skin_id, initial_supply, current_supply, rarity)
SELECT id, supply, supply, rarity FROM shop_items WHERE type = 'skin' AND supply IS NOT NULL
ON CONFLICT (skin_id) DO NOTHING;

-- Function to deduct supply atomically
CREATE OR REPLACE FUNCTION purchase_skin_and_deduct_supply(p_skin_id VARCHAR, p_user_id VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    supply_left INTEGER;
BEGIN
    SELECT current_supply INTO supply_left FROM skin_supply WHERE skin_id = p_skin_id;
    IF supply_left IS NULL OR supply_left <= 0 THEN
        RETURN FALSE;
    END IF;
    -- Deduct supply
    UPDATE skin_supply SET current_supply = current_supply - 1 WHERE skin_id = p_skin_id AND current_supply > 0;
    -- Add to user_inventory (simplified, add more fields as needed)
    INSERT INTO user_inventory (pi_user_id, item_type, item_id, item_name, quantity, created_at)
    VALUES (p_user_id, 'skin', p_skin_id, p_skin_id, 1, NOW());
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION purchase_skin_and_deduct_supply(VARCHAR, VARCHAR) TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Skin supply table and purchase logic created!';
END $$;
