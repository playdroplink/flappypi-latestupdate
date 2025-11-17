-- Pi Network Payment Tracking Database Schema
-- This schema tracks A2U (App-to-User) payments

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(255) UNIQUE NOT NULL,
    user_uid VARCHAR(255) NOT NULL,
    amount DECIMAL(18, 6) NOT NULL,
    memo TEXT NOT NULL,
    metadata JSONB,
    txid VARCHAR(255),
    status VARCHAR(50) DEFAULT 'created',
    direction VARCHAR(20) DEFAULT 'app_to_user',
    network VARCHAR(20) DEFAULT 'mainnet',
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_uid ON payments(user_uid);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_txid ON payments(txid);

-- Payment status enum values
-- 'created' - Payment created but not submitted
-- 'submitted' - Payment submitted to blockchain
-- 'completed' - Payment completed successfully
-- 'cancelled' - Payment cancelled
-- 'failed' - Payment failed

-- Payment direction enum values
-- 'app_to_user' - A2U payment (App to User)
-- 'user_to_app' - U2A payment (User to App)

-- Network enum values
-- 'mainnet' - Pi Network Mainnet
-- 'testnet' - Pi Network Testnet

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- View for completed payments
CREATE OR REPLACE VIEW completed_payments AS
SELECT 
    payment_id,
    user_uid,
    amount,
    memo,
    metadata,
    txid,
    from_address,
    to_address,
    created_at,
    completed_at
FROM payments 
WHERE status = 'completed';

-- View for pending payments
CREATE OR REPLACE VIEW pending_payments AS
SELECT 
    payment_id,
    user_uid,
    amount,
    memo,
    metadata,
    status,
    created_at,
    updated_at
FROM payments 
WHERE status IN ('created', 'submitted');

-- Function to get payment statistics
CREATE OR REPLACE FUNCTION get_payment_stats()
RETURNS TABLE (
    total_payments BIGINT,
    completed_payments BIGINT,
    pending_payments BIGINT,
    cancelled_payments BIGINT,
    total_amount DECIMAL(18,6),
    completed_amount DECIMAL(18,6)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_payments,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_payments,
        COUNT(*) FILTER (WHERE status IN ('created', 'submitted')) as pending_payments,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_payments,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as completed_amount
    FROM payments;
END;
$$ LANGUAGE plpgsql;
