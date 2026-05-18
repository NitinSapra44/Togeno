-- Migration 010: Expert bank accounts + withdrawal requests
-- =====================================================

-- -------------------------
-- 1. Expert bank accounts
-- -------------------------
CREATE TABLE IF NOT EXISTS expert_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_holder_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  upi_id TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(expert_id, account_number)
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_expert_id ON expert_bank_accounts(expert_id);

CREATE TRIGGER update_expert_bank_accounts_updated_at
  BEFORE UPDATE ON expert_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE expert_bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role bypass bank accounts" ON expert_bank_accounts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -------------------------
-- 2. Withdrawal requests
-- -------------------------
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES expert_bank_accounts(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 500),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  rejection_reason TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  transaction_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_expert_id ON withdrawal_requests(expert_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);

CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role bypass withdrawals" ON withdrawal_requests
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -------------------------
-- 3. Add expert_id to commissions if missing
-- -------------------------
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS expert_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_commissions_expert_id ON commissions(expert_id);
