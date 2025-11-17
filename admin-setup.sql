-- Admin Portal Database Setup
-- This script creates the necessary tables for the admin portal functionality

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pi_user_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'moderator', 'user')),
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id TEXT,
    action TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_pi_user_id ON admin_users(pi_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_id ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_timestamp ON admin_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);

-- Insert default admin user (replace with your actual admin user ID)
-- INSERT INTO admin_users (pi_user_id, username, role, permissions) 
-- VALUES ('your-admin-user-id', 'Admin User', 'admin', '["read", "write", "delete", "manage_users", "manage_subscriptions", "view_analytics"]');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_users_updated_at();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE pi_user_id = user_id 
        AND role IN ('admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id TEXT)
RETURNS JSONB AS $$
DECLARE
    user_permissions JSONB;
BEGIN
    SELECT permissions INTO user_permissions
    FROM admin_users
    WHERE pi_user_id = user_id;
    
    RETURN COALESCE(user_permissions, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Function to log admin action
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_user_id TEXT,
    p_action TEXT,
    p_details JSONB DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO admin_audit_log (
        admin_user_id,
        action,
        details,
        ip_address,
        user_agent
    ) VALUES (
        p_admin_user_id,
        p_action,
        p_details,
        p_ip_address,
        p_user_agent
    );
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust based on your Supabase setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON admin_users TO authenticated;
-- GRANT SELECT, INSERT ON admin_audit_log TO authenticated;
-- GRANT EXECUTE ON FUNCTION is_admin_user(TEXT) TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_user_permissions(TEXT) TO authenticated;
-- GRANT EXECUTE ON FUNCTION log_admin_action(TEXT, TEXT, JSONB, TEXT, TEXT) TO authenticated;

-- Create a view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM user_profiles) as total_users,
    (SELECT COUNT(*) FROM user_profiles WHERE subscription_status = 'active') as active_users,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
    (SELECT COALESCE(SUM(amount_pi), 0) FROM payment_history WHERE payment_status = 'completed') as total_revenue,
    (SELECT COUNT(*) FROM admin_users) as admin_users,
    (SELECT COUNT(*) FROM admin_audit_log WHERE timestamp >= NOW() - INTERVAL '24 hours') as recent_admin_actions;

-- Create a view for user subscription analytics
CREATE OR REPLACE VIEW user_subscription_analytics AS
SELECT 
    up.pi_user_id,
    up.username,
    up.subscription_status,
    up.total_coins,
    s.plan_name,
    s.status as subscription_plan_status,
    s.amount_pi,
    s.start_date,
    s.end_date,
    COALESCE(ph.total_spent, 0) as total_spent
FROM user_profiles up
LEFT JOIN subscriptions s ON up.pi_user_id = s.pi_user_id
LEFT JOIN (
    SELECT 
        pi_user_id,
        SUM(amount_pi) as total_spent
    FROM payment_history 
    WHERE payment_status = 'completed'
    GROUP BY pi_user_id
) ph ON up.pi_user_id = ph.pi_user_id;

-- Create a view for revenue analytics
CREATE OR REPLACE VIEW revenue_analytics AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_transactions,
    SUM(amount_pi) as total_revenue,
    AVG(amount_pi) as avg_transaction_value,
    COUNT(DISTINCT pi_user_id) as unique_customers
FROM payment_history 
WHERE payment_status = 'completed'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Comments for documentation
COMMENT ON TABLE admin_users IS 'Stores admin user accounts and their permissions';
COMMENT ON TABLE admin_audit_log IS 'Audit trail for all admin actions';
COMMENT ON FUNCTION is_admin_user(TEXT) IS 'Check if a user has admin privileges';
COMMENT ON FUNCTION get_user_permissions(TEXT) IS 'Get permissions for a specific user';
COMMENT ON FUNCTION log_admin_action(TEXT, TEXT, JSONB, TEXT, TEXT) IS 'Log an admin action for audit purposes';
COMMENT ON VIEW admin_dashboard_stats IS 'Aggregated statistics for admin dashboard';
COMMENT ON VIEW user_subscription_analytics IS 'User and subscription analytics for admin portal';
COMMENT ON VIEW revenue_analytics IS 'Revenue analytics by month for admin portal'; 