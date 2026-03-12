-- migrations/002_audit_hash.sql
-- Add blockchain-like immutable audit features to audit_log

ALTER TABLE audit_log 
ADD COLUMN IF NOT EXISTS payload_hash TEXT,
ADD COLUMN IF NOT EXISTS previous_hash TEXT;

-- Create an index for quick verification of hash chains
CREATE INDEX IF NOT EXISTS idx_audit_log_payload_hash ON audit_log(payload_hash);
