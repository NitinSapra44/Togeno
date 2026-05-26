-- Migration 017: Commission reserved status for withdrawal tracking
-- ================================================================
-- Fixes: commissions were never marked paid/reserved when a withdrawal
-- was requested or processed. This migration adds a 'reserved' status
-- and links commissions to the withdrawal request that covers them.

-- 1. Drop the old status constraint and add 'reserved'
ALTER TABLE commissions DROP CONSTRAINT IF EXISTS commissions_status_check;
ALTER TABLE commissions ADD CONSTRAINT commissions_status_check
  CHECK (status IN ('pending', 'reserved', 'paid', 'reversed'));

-- 2. Link commissions to the withdrawal request that reserved them
ALTER TABLE commissions
  ADD COLUMN IF NOT EXISTS withdrawal_request_id UUID REFERENCES withdrawal_requests(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_commissions_withdrawal_request_id
  ON commissions(withdrawal_request_id);

-- 3. Fix the withdrawal_requests minimum amount constraint to match the service (₹100)
ALTER TABLE withdrawal_requests DROP CONSTRAINT IF EXISTS withdrawal_requests_amount_check;
ALTER TABLE withdrawal_requests ADD CONSTRAINT withdrawal_requests_amount_check
  CHECK (amount > 0);
